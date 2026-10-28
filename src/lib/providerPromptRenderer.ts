import type {
  ImageOperationMode,
  NodeKind,
} from "../types/workflow";
import type { ImageModelId } from "../types/imageModels";

/**
 * Provider 提示词渲染：把用户意图扩写成上游能照做的完整指令。
 *
 * 唯一职责：蒙版局部修改的扩写。参考图编号由 provider 侧逐图标签承载
 * （见 server/providers/apiyi.ts geminiParts），这里不再追加任何清单。
 *
 * 2026-10-28 二次简化（用户反馈）：产线提示词里曾混入两类脚手架——
 *   ① 末尾追加「参考图:参考图1、参考图2」——对模型零信息量，与逐图标签重复；
 *   ② 冻结协议末尾的「用户补充要求（如为空则忽略本行）：」——补充为空时
 *      就是一句悬空指令。
 * 两者都由 sanitizeProviderTaskPrompt() 在发送前清除。
 */

/** 蒙版区域角色说明，按用户参考图数量分三档。 */
const MASK_REFERENCE_TEMPLATES = {
  single: "参考图1是完整原图；最后一张参考图（参考图2）是区域引导图",
  two: "参考图1是完整原图；参考图2是用户提供的目标内容参考图，用户提示词中的图号始终对应这些用户参考图；最后一张参考图（参考图{{GUIDE_INDEX}}）才是区域引导图",
  many: "参考图1是完整原图；参考图2至参考图{{USER_COUNT}}是用户提供的目标内容参考图，用户提示词中的图号始终对应这些用户参考图；最后一张参考图（参考图{{GUIDE_INDEX}}）才是区域引导图",
} as const;

const MASK_PROMPT_TEMPLATE = "目标修改：{{TARGET}}。{{MASK_REFERENCE_ROLES}}，其中红色表示用户涂抹的修改核心，红色已完全遮住旧内容，只用于表达位置；金色表示仅供完整轮廓延展和边缘融合的缓冲区；两者都是修改范围，不是裁切框。请根据用户说明在红色核心内添加、替换、删除或调整内容。凡用户要求替换、删除或改变既有对象时，必须先彻底清除与目标冲突的旧对象、旧包带、旧颜色、旧阴影、旧反光、旧纹理和残留边线，再依据周围连续的面料纹理、颜色、褶皱、缝线和光照完整重建被遮挡的底层服装或背景，然后放入新内容；禁止用模糊、暗斑、色块、漂浮投影或半透明残影遮盖清理区域。只有与新内容真实接触并符合整幅画面光源方向的阴影才可保留。不需要修改的服装结构、面料纹理和光影必须保持。结合整幅画面的构图、服装比例和视觉重量，新内容默认继承目标区域的中心位置与近似占位，除非用户明确要求，不得明显放大、缩小或偏移。只有完整轮廓、褶皱、缝线、阴影、反光和自然遮挡所必需的部分可以进入金色缓冲区，不得沿红色边缘截断，也不得覆盖缓冲区内的文字、独立图案、配饰或其他服装结构。交接处必须匹配原图的面料材质、纹理方向、褶皱、光影、透视、遮挡和清晰度，不得出现重影、透色、硬边或颜色污染。返回与整幅画面同尺寸、同坐标的 PNG 完整最终图片；修改范围以外的画面保持原状。";



export interface ProviderPromptReference {
  /**
   * 参考图角色（如「服装」「模特」），由 dag 按族规则推导。
   * provider 能力不同：能逐图贴标签的（gemini）内联，只能传数组的由本层生成映射行。
   */
  readonly role?: string;
}

/** 能在参考图本体旁贴标签的模型：这些模型不需要额外的提示词映射行。 */
function inlinesReferenceLabels(modelId: ImageModelId): boolean {
  return modelId.startsWith("gemini-");
}

export interface ProviderPromptRenderInput {
  nodeKind: NodeKind;
  modelId: ImageModelId;
  operationMode: ImageOperationMode;
  taskPrompt: string;
  /** User references only. The mask guide is appended after prompt rendering. */
  references: readonly ProviderPromptReference[];
  /** 声明本次请求需要蒙版包装（局部修改）。 */
  needsMask?: boolean;
}

/**
 * 协议自指词的发送前归一：冻结协议里的「正文」指的是用户补充要求，
 * 但模型看不到这层约定，保留会变成悬空指示。旧草稿/旧模板里仍是旧措辞，
 * 故在发送前统一改写（只命中协议词汇，不动用户自己的描述）。
 */
const PROTOCOL_SELF_REFERENCES: ReadonlyArray<readonly [RegExp, string]> = [
  [/与正文冲突/g, "与补充要求冲突"],
  [/按正文/g, "按补充要求"],
  [/正文未指定/g, "补充要求未指定"],
  [/正文未给出/g, "补充要求未给出"],
  [/正文明确要求/g, "补充要求明确要求"],
  [/正文指定的/g, "补充要求指定的"],
  [/正文的改款指令/g, "补充要求中的改款指令"],
  [/用户在正文中描述/g, "用户在补充要求中描述"],
  [/正文描述/g, "补充要求描述"],
];

/**
 * 协议脚手架标记行（新版「补充要求：」+ 旧草稿里的长版）：都是给用户看的输入位标签，
 * 对模型没有信息量，整行丢弃；用户写在标签后的正文照常保留。
 */
const SUPPLEMENT_MARKER_LINES = new Set([
  "补充要求：",
  "用户补充要求（如为空则忽略本行）：",
]);

/**
 * 发送前净化：协议脚手架与自指词一律不得进入模型提示词。
 * 幂等；对不含脚手架的普通提示词无副作用。
 */
export function sanitizeProviderTaskPrompt(prompt: string): string {
  let cleaned = prompt
    .split("\n")
    .filter((line) => !SUPPLEMENT_MARKER_LINES.has(line.trim()))
    .join("\n");
  for (const [pattern, replacement] of PROTOCOL_SELF_REFERENCES) {
    cleaned = cleaned.replace(pattern, replacement);
  }
  return cleaned.replace(/\n{3,}/g, "\n\n").trim();
}

function interpolate(
  template: string,
  values: Readonly<Record<string, string | number>>,
): string {
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (_match, key: string) => {
    if (!Object.prototype.hasOwnProperty.call(values, key)) {
      throw new Error(`Provider prompt renderer is missing template value ${key}`);
    }
    return String(values[key]);
  });
}

function maskReferenceRolePrompt(userReferenceCount: number): string {
  const guideIndex = userReferenceCount + 1;
  if (userReferenceCount <= 1) {
    return MASK_REFERENCE_TEMPLATES.single;
  }
  const template = userReferenceCount === 2
    ? MASK_REFERENCE_TEMPLATES.two
    : MASK_REFERENCE_TEMPLATES.many;
  return interpolate(template, {
    GUIDE_INDEX: guideIndex,
    USER_COUNT: userReferenceCount,
  });
}

/**
 * The only renderer used to construct a Provider-bound garment prompt.
 * It owns the ordered reference list and the mask wrapper; callers supply
 * only the reviewed task prompt / user intent.
 */
/**
 * 参考图映射行：编号 + 角色，让模型不必只靠数组顺序猜"哪张是什么"。
 * 只在角色已知、且该模型不能逐图贴标签时才加（gemini 内联标签，不重复）。
 */
function referenceRoleLine(
  references: readonly ProviderPromptReference[],
  modelId: ImageModelId,
): string | null {
  if (inlinesReferenceLabels(modelId)) return null;
  const entries = references
    .map((reference, index) => (reference.role ? `图${index + 1}=${reference.role}` : null))
    .filter((entry): entry is string => entry !== null);
  return entries.length > 0 ? `参考图对应：${entries.join("，")}` : null;
}

export function renderProviderPrompt(input: ProviderPromptRenderInput): string {
  const rawTaskPrompt = sanitizeProviderTaskPrompt(input.taskPrompt);
  if (!rawTaskPrompt) {
    if (input.needsMask) throw new Error("局部修改必须填写修改说明");
    throw new Error(`节点 ${input.nodeKind} 没有可发送的提示词`);
  }
  if (input.needsMask) {
    return interpolate(MASK_PROMPT_TEMPLATE, {
      TARGET: rawTaskPrompt,
      MASK_REFERENCE_ROLES: maskReferenceRolePrompt(input.references.length),
    });
  }
  const roleLine = referenceRoleLine(input.references, input.modelId);
  return roleLine ? `${rawTaskPrompt}\n${roleLine}` : rawTaskPrompt;
}
