/**
 * 六要素提示词（纯函数，前端面板 + 拼装 + 判定 + 风险扫描）。
 *
 * 2026-10-29 用户拍板：**主体不再由面板填写**（系统提示词已经承担主体描述），
 * 面板只覆盖 环境 → 光线 → 镜头与视角 → 色调与介质 → 构图 五维；
 * 拼装顺序仍沿用原六要素的固定次序，空要素整段跳过。
 * 拼装结果写入文本节点补充位（协议锚点之后 / 普通文本节点正文），
 * 下游 dag / 改写层 / 快照看到的仍是纯文本，本模块不碰任何运行路径。
 */

export type ElementKey = "environment" | "lighting" | "lens" | "tone" | "composition";

export const ELEMENT_ORDER: readonly ElementKey[] = [
  "environment", "lighting", "lens", "tone", "composition",
];

export const ELEMENT_LABELS: Record<ElementKey, string> = {
  environment: "环境",
  lighting: "光线",
  lens: "镜头与视角",
  tone: "色调与介质",
  composition: "构图",
};

/** 面板可填的要素数（主体已移出面板）。 */
export const ELEMENT_SLOT_COUNT = ELEMENT_ORDER.length;

export interface ElementPreset {
  id: string;
  /** pill 上显示的短名。 */
  label: string;
  /** 拼装进提示词的完整文案（具体派：主光方向 / 焦段光圈机位 / 白平衡饱和度介质俱全）。 */
  text: string;
}

export interface ElementDef {
  key: ElementKey;
  /** 缺了会怎样（一句话，面板副标题）。 */
  missingHint: string;
  /** 各 4 预设 + 自写兜底。 */
  presets: readonly ElementPreset[];
  placeholder: string;
}

export const ELEMENT_DEFS: readonly ElementDef[] = [
  {
    key: "environment", missingHint: "缺了背景随机，同系列图对不上",
    placeholder: "自写环境，如：大理石吧台，背景酒架虚化",
    presets: [
      { id: "micro-cement", label: "微水泥台面", text: "浅灰色微水泥台面，同色系墙面并虚化" },
      { id: "studio", label: "纯色影棚", text: "纯浅灰影棚背景，地面与墙面自然过渡" },
      { id: "street", label: "户外街景", text: "城市街道背景，行人虚化" },
      { id: "living", label: "居家客厅", text: "简约客厅环境，柔和生活气息" },
    ],
  },
  {
    key: "lighting", missingHint: "缺了全局均匀光，一眼假",
    placeholder: "自写光线",
    presets: [
      { id: "softbox-tl", label: "左上柔光", text: "左上方45度柔光箱主光，右侧白色反光板补光" },
      { id: "rembrandt", label: "伦勃朗光", text: "侧方伦勃朗布光，明暗交界线清晰" },
      { id: "rim", label: "逆光轮廓", text: "背后逆光勾勒轮廓，正面轻微补光" },
      { id: "window", label: "自然窗光", text: "窗边自然光，柔和漫射" },
    ],
  },
  {
    key: "lens", missingHint: "缺了透视和景深不可控",
    placeholder: "自写镜头",
    presets: [
      { id: "macro85", label: "85mm微距", text: "85mm微距，f/5.6，正面略俯视15度" },
      { id: "std50", label: "50mm平视", text: "50mm标准镜头，f/4，平视全身" },
      { id: "wide35", label: "35mm广角", text: "35mm广角，f/8，带环境叙事" },
      { id: "lowangle", label: "低角度仰拍", text: "低角度仰视，强调气场" },
    ],
  },
  {
    key: "tone", missingHint: "缺了默认高饱和「渲染感」",
    placeholder: "自写色调",
    presets: [
      { id: "cool-low", label: "冷调低饱和", text: "冷调中性白平衡，整体偏低饱和" },
      { id: "warm-film", label: "暖调胶片", text: "暖调胶片质感，轻微颗粒" },
      { id: "bw-high", label: "黑白高对比", text: "黑白高对比，明暗分明" },
      { id: "soft-low", label: "柔光低对比", text: "柔光低对比，奶油肌质感" },
    ],
  },
  {
    key: "composition", missingHint: "缺了主体永远居中",
    placeholder: "自写构图",
    presets: [
      { id: "thirds", label: "三分法留白", text: "主体位于画面左三分之一，右侧大面积留白" },
      { id: "center", label: "居中特写", text: "主体居中，占画面约三分之二" },
      { id: "diagonal", label: "对角线", text: "主体沿对角线方向延伸，动感构图" },
      { id: "fullbody", label: "全身远景", text: "人物完整入镜，留呼吸空间" },
    ],
  },
];

/** 单要素取值：预设选中 或 自写文本（二者互斥，自写优先）。 */
export type ElementValue = { presetId: string } | { custom: string } | undefined;

/** 六要素结构化选择（TextNodeData.promptElements 的值形态）。 */
export type PromptElements = {
  /**
   * @deprecated 2026-10-29 起面板不再填主体（系统提示词已承担）；旧草稿里的值仍在，
   * 但拼装时会被忽略——保留字段只为类型兼容。
   */
  subject?: string;
  environment?: ElementValue;
  lighting?: ElementValue;
  lens?: ElementValue;
  tone?: ElementValue;
  composition?: ElementValue;
};

/** 要素状态：ok 已选 / vague 含糊（自写过短）/ empty 缺失。 */
export type ElementStatus = "ok" | "vague" | "empty";

/** 取某要素的生效文本（custom 非空优先，否则 preset 文本；都没有返回 ""）。 */
export function elementText(key: ElementKey, elements: PromptElements): string {
  const def = ELEMENT_DEFS.find((d) => d.key === key);
  const value = elements[key] as ElementValue;
  if (value !== undefined && "custom" in value) {
    const custom = value.custom.trim();
    if (custom !== "") return custom;
  }
  if (value !== undefined && "presetId" in value) {
    const hit = def?.presets.find((p) => p.id === value.presetId);
    if (hit) return hit.text;
  }
  return "";
}

/** 判定某要素状态（纯前端本地规则，不调模型）。 */
export function rateElement(key: ElementKey, elements: PromptElements): ElementStatus {
  const text = elementText(key, elements);
  if (text === "") return "empty";
  const value = elements[key] as ElementValue;
  if (value !== undefined && "presetId" in value) return "ok";
  return text.length >= 6 ? "ok" : "vague";
}

/** 已填要素数（五维中有生效文本的个数）。 */
export function filledElementCount(elements: PromptElements): number {
  return ELEMENT_ORDER.filter((key) => elementText(key, elements) !== "").length;
}

/** 缺失要素的 label 列表（拼装预览「缺：…」用）。 */
export function missingElementLabels(elements: PromptElements): string[] {
  return ELEMENT_ORDER.filter((key) => elementText(key, elements) === "")
    .map((key) => ELEMENT_LABELS[key]);
}

/**
 * 按固定顺序拼装要素为一段补充文本：空要素整段跳过，以"，"连接。
 * 五维全空返回 ""（调用方禁用"填入补充"）。主体不在面板内——由系统提示词承担。
 */
export function assembleElements(elements: PromptElements): string {
  const parts = ELEMENT_ORDER.map((key) => elementText(key, elements))
    .filter((text) => text !== "");
  return parts.join("，");
}

// ---------- 本地风险扫描（零 API 成本，点"帮我补全"前提示） ----------

export interface PromptRisk {
  id: "empty-quality-words" | "resolution" | "multi-edit" | "vague-ref" | "text-declare";
  /** 命中词/证据原文（展示用）。 */
  hit: string;
  message: string;
}

const EMPTY_QUALITY_WORDS = ["8K", "超高清", "超精细", "杰作", "大师", "完美", "真实感", "高级感"];

/** 扫描补充文本中的风险项（命中即返回，无命中返回 []）。 */
export function scanPromptRisks(text: string): PromptRisk[] {
  const risks: PromptRisk[] = [];
  const input = typeof text === "string" ? text : "";
  if (input.trim() === "") return risks;
  const qualityHit = EMPTY_QUALITY_WORDS.find((word) => input.includes(word));
  if (qualityHit) {
    risks.push({
      id: "empty-quality-words",
      hit: qualityHit,
      message: `含空泛词「${qualityHit}」建议删除，换成具体光位/焦段`,
    });
  }
  const resolutionHit = /(\d+\s*[Kk]\b|1920|1080|分辨率|像素)/.exec(input)?.[0];
  if (resolutionHit) {
    risks.push({
      id: "resolution",
      hit: resolutionHit,
      message: "分辨率由尺寸参数决定，写进提示词无效",
    });
  }
  const editCount = (input.match(/改成|换成|去掉|删掉|P掉/g) ?? []).length;
  if (editCount >= 2) {
    risks.push({
      id: "multi-edit",
      hit: `${editCount} 个编辑动作`,
      message: "一次改一类东西，建议拆成多轮",
    });
  }
  const refHit = /(这个|红框里|图里那个|圈出来)/.exec(input)?.[0];
  if (refHit) {
    risks.push({
      id: "vague-ref",
      hit: refHit,
      message: "指代不明，点名具体物体",
    });
  }
  if (/加字|标题|文案|写.*文字|文字/.test(input) && !/「[^」]{1,20}」|"[^"]{1,30}"/.test(input)) {
    risks.push({
      id: "text-declare",
      hit: "文字要求无具体内容",
      message: "写清出现什么字，否则模型会编",
    });
  }
  return risks;
}

/**
 * 删除补充文本中的空泛质量词（保留其余内容与标点语义）。
 * 质量词后常跟"画质/品质/质量"后缀（如"超高清画质"）——词删掉后后缀无意义，一并清理。
 */
export function removeEmptyQualityWords(text: string): string {
  let next = typeof text === "string" ? text : "";
  for (const word of EMPTY_QUALITY_WORDS) {
    next = next.split(`，${word}`).join("").split(word).join("");
  }
  next = next.replace(/([，、])?(画质|品质|质量)(?=[，、。]|$)/g, "");
  return next.replace(/，{2,}/g, "，").replace(/^[，、]/, "");
}
