/**
 * 提示词预设目录（64 Phase 2 裁决 B / §裁决 D）。
 *
 * 预设 = 文本模板集；选中即替换写入 text 节点正文（useCoalescedTextEdit+flush，可 undo）。
 * 文本与 server/lib/promptPresetsFrozen.ts PRESET_TEMPLATE_TEXTS 同源同值
 * （tests/prompt-presets-catalog.test.ts 逐字一致性锁定，防两端漂移）。
 *
 * v1 成员：三任务族（generate 冻结文本，文生图起手模板）+ 四族 familyPrompts 模型无关操作模板
 * + 可选 polish。按裁决 D「familyPrompts 模型无关」全量收录 7 族服装模板 + 可选 polish；
 * 若 architect 口径为「六」，删一行即可。
 */
import type { ImageOperationMode } from "@/types/imageOperations";

// ---------- 类型 ----------

export interface TextPresetTemplate {
  /** 稳定 id（family id），下拉 value 用。 */
  id: string;
  /** 下拉显示名称。 */
  name: string;
  /** 冻结表键 `${familyId}:${mode}`，一致性测试锁定用。 */
  frozenKey: string;
  /** 模板正文（与 PRESET_TEMPLATE_TEXTS 同源同值）。 */
  text: string;
}

// ---------- 模板正文（逐字迁移自 garmentPromptPresets MODEL_PROMPTS[gpt-image-2.5-flare-vip]/familyPrompts）----------
// 文本与 server/lib/promptPresetsFrozen.ts PRESET_TEMPLATE_TEXTS 同源同值，一致性测试锁定。

// --- 三任务族（取默认生图模型 generate 文本，文生图起手模板）---

const FASHION_LOOKBOOK_GENERATE =
  `GPT Image 2 VIP 写实穿搭生成。创建单人全身 3:4 品牌 Lookbook：平视机位、中远景、约 50mm 视角，人物完整入镜、主体居中并留呼吸空间；动作自然，可有轻微行走或衣摆运动，但不得摆拍僵硬。
精确呈现指定服装的版型、颜色、分割线、图案、缝线、褶皱、垂坠与真实面料；柔和自然光，克制中性背景，真实肤质和可信的小瑕疵。
不生成文字、Logo、水印、多余人物、随机配饰、错误肢体或服装结构变形，不裁切手脚，不使用过度磨皮或塑料质感。`;

const COMMERCE_HERO_GENERATE =
  `GPT Image 2 VIP 服装电商主图生成。仅展示一件指定服装，正面或指定角度完整居中，占 1:1 画面约 75%，保留裁切安全区。
准确还原颜色、版型、图案位置、面料、缝线、闭合方式和五金；卖点只通过轮廓、材质、工艺细节、受控高光与柔和高端棚拍光表达，纯净背景与干净阴影。
无价格、促销文字、Logo、水印、模特、随机道具、衣架残影、色偏、图案篡改或虚构零件。`;

const DESIGN_SHEET_GENERATE =
  `GPT Image 2 VIP 服装设定表生成。先锁定同一套服装的身份锚点：品类、版型、配色、领口、袖型、口袋、闭合方式和图案位置；在 4:3 横向浅色画布中排列正面、背面、侧面 3 个主视图和 2–3 个工艺细节放大框，视图对齐、比例统一、互不遮挡。
所有视图保持同一版型、配色、分割线、领口、袖型、口袋、闭合方式、图案位置和面料；专业设计图与写实材质结合。
仅使用简短可读中文部位标签；无 Logo、水印、长文、乱码、透视混乱或装饰拼贴。`;

// --- 四族 familyPrompts 模型无关操作模板（逐字迁移自 runner.ts / colors.ts 字面量）---

const UPSCALE_TEXT =
  `将这张服装效果图放大为超高清版本，增强面料纹理、走线与边缘细节，保持原有构图、色彩和光影完全不变`;

const PRINT_EXTRACT_TEXT =
  `提取这件衣服上的印花图案：将印花完整抠出并平铺展开为规整的矩形图案，纯白背景，去除衣身、褶皱、阴影和穿着效果，印花的比例、细节和色彩与原图保持一致，适合作为印花素材复用`;

const PRINT_MUTATE_TEXT =
  `基于这张印花图案生成风格一致的新变体：保持原有配色体系、艺术风格与笔触质感，重新编排元素的构图与组合方式，纯白背景，适合作为印花素材复用`;

const FABRIC_RECOLOR_TEXT =
  `保持服装的版型、款式细节、构图和光线完全不变，仅将面料配色替换为用户指定的配色。配色应用于面料主体，呈现真实面料质感与准确色彩，无文字无水印。`;

// --- 可选 polish（文本族，当前画布无文本生成节点，v1 下拉可选收录）---

const PROMPT_POLISH_TEXT =
  `你是一位服装视觉提示词编辑。请将用户输入的意图润色为一段结构化、可直接用于文生图模型的中文提示词。
要求：
1. 保留用户原意的核心服装品类、款式、颜色、面料、目标人群与场景。
2. 补充合理的构图、光线、背景与质感描述，但不臆造用户未提及的关键元素。
3. 使用中文输出，避免英文术语堆砌；句法简洁、可读性强。
4. 不要生成任何解释、Markdown 标题或列表符号；只输出一段连续正文。`;

// ---------- 目录 ----------

/** v1 预设目录（7 服装族 + 可选 polish；裁决 D 锁定）。 */
export const TEXT_PROMPT_PRESETS: readonly TextPresetTemplate[] = [
  {
    id: "fashion-lookbook",
    name: "写实穿搭",
    frozenKey: "fashion-lookbook:generate",
    text: FASHION_LOOKBOOK_GENERATE,
  },
  {
    id: "commerce-hero",
    name: "电商主图",
    frozenKey: "commerce-hero:generate",
    text: COMMERCE_HERO_GENERATE,
  },
  {
    id: "design-sheet",
    name: "服装设定表",
    frozenKey: "design-sheet:generate",
    text: DESIGN_SHEET_GENERATE,
  },
  {
    id: "upscale",
    name: "高清放大",
    frozenKey: "upscale:edit",
    text: UPSCALE_TEXT,
  },
  {
    id: "print-extract",
    name: "印花提取",
    frozenKey: "print-extract:edit",
    text: PRINT_EXTRACT_TEXT,
  },
  {
    id: "print-mutate",
    name: "印花变体",
    frozenKey: "print-mutate:edit",
    text: PRINT_MUTATE_TEXT,
  },
  {
    id: "fabric-recolor",
    name: "面料换色",
    frozenKey: "fabric-recolor:edit",
    text: FABRIC_RECOLOR_TEXT,
  },
] as const;

/** 可选 polish（v1 可选择性收录；文本族系统提示词，当前画布无文本生成节点时下拉可选不展示）。 */
export const OPTIONAL_PROMPT_POLISH_PRESET: TextPresetTemplate = {
  id: "prompt-polish",
  name: "提示词精修",
  frozenKey: "prompt-polish:edit",
  text: PROMPT_POLISH_TEXT,
};

// ---------- 辅助 ----------

const presetById = new Map(TEXT_PROMPT_PRESETS.map((p) => [p.id, p]));

/** 获取 v1 目录全部模板（不含可选 polish）。 */
export function listTextPresetTemplates(): readonly TextPresetTemplate[] {
  return TEXT_PROMPT_PRESETS;
}

/** 按 id 查找模板（v1 目录内查找，不含 polish）。 */
export function getTextPresetTemplate(id: string): TextPresetTemplate | undefined {
  return presetById.get(id);
}