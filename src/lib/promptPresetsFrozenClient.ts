/**
 * 客户端冻结 variantId→binding 表（64 Phase 3a 裁决 b）。
 *
 * 镜像 server/lib/promptPresetsFrozen.ts 的 frozenPromptBindingForVariantId
 * + PRESET_TEMPLATE_TEXTS（全量 11 族，14 条预设模板文本），
 * 供 src/lib/documentSnapshot.ts v8→v9 客户端迁移消费。
 *
 * 文本与 server PRESET_TEMPLATE_TEXTS 逐字一致，
 * 漂移防护：tests/prompt-presets-catalog.test.ts 断言。
 *
 * src→server 跨域 import 被 depcruise 禁止，本文件为客户端冻结等价副本。
 */
import type { ImageOperationMode } from "@/types/imageOperations";

export interface FrozenPromptBinding {
  familyId: string;
  mode: ImageOperationMode;
  /** 预设模板正文 = PRST_TEMPLATE_TEXTS text（与 server 同源同值）。 */
  text: string;
}

// ---------- 辅助：Unicode 标点（确保与 server 逐字一致，不依赖源码编码）----------

const LQ = () => "\u201C";   // 「
const RQ = () => "\u201D";   // 」
const ELLIP = () => "\u2026\u2026";  // ……

// ---------- 全量 11 族预设模板文本（与 server/lib/promptPresetsFrozen.ts PRESET_TEMPLATE_TEXTS 逐字一致）----------

const FASHION_LOOKBOOK_GENERATE =
  `GPT Image 2 VIP 写实穿搭生成。创建单人全身 3:4 品牌 Lookbook：平视机位、中远景、约 50mm 视角，人物完整入镜、主体居中并留呼吸空间；动作自然，可有轻微行走或衣摆运动，但不得摆拍僵硬。
精确呈现指定服装的版型、颜色、分割线、图案、缝线、褶皱、垂坠与真实面料；柔和自然光，克制中性背景，真实肤质和可信的小瑕疵。
不生成文字、Logo、水印、多余人物、随机配饰、错误肢体或服装结构变形，不裁切手脚，不使用过度磨皮或塑料质感。`;

const FASHION_LOOKBOOK_EDIT =
  `GPT Image 2 VIP 多图写实穿搭编辑。严格按请求中${LQ()}图1、图2${ELLIP()}${RQ()}的序号及 identity、pose_composition、garment_top、garment_bottom、garment_full、fabric、accessory、styling_only、background 角色使用每张图，不得跨角色挪用身份或服装。
将指定服装穿到 identity 模特身上，按 pose_composition 设置平视机位、中远景、约 50mm 视角、姿势与取景；忠实保留模特特征、服装版型、花型、材质和穿搭层级，动作与衣摆运动方向可信。
输出 3:4 单人全身时装 Lookbook；除明确指定的穿搭替换外，脸部、发型、肤色、身材、姿势、背景和非目标区域不变，无文字、Logo、水印、僵硬手势或过度磨皮。`;

const COMMERCE_HERO_GENERATE =
  `GPT Image 2 VIP 服装电商主图生成。仅展示一件指定服装，正面或指定角度完整居中，占 1:1 画面约 75%，保留裁切安全区。
准确还原颜色、版型、图案位置、面料、缝线、闭合方式和五金；卖点只通过轮廓、材质、工艺细节、受控高光与柔和高端棚拍光表达，纯净背景与干净阴影。
无价格、促销文字、Logo、水印、模特、随机道具、衣架残影、色偏、图案篡改或虚构零件。`;

const COMMERCE_HERO_EDIT =
  `GPT Image 2 VIP 多图服装电商主图编辑。按${LQ()}图1、图2${ELLIP()}${RQ()}及 garment_full、garment_top、garment_bottom、fabric、accessory、background 标注使用参考，顺序不可改写，不融合不同商品的结构。
将主服装转换成 1:1 独立电商首图，完整居中约 75%，保留原商品轮廓、比例、颜色、图案、面料、缝线和五金；卖点只通过轮廓、材质、工艺和受控光线表达，仅执行明确的背景或视角变更。
使用棚拍柔光和干净阴影；无身份串用、额外道具、文字、价格、Logo、水印或商品细节臆造。`;

const DESIGN_SHEET_GENERATE =
  `GPT Image 2 VIP 服装设定表生成。先锁定同一套服装的身份锚点：品类、版型、配色、领口、袖型、口袋、闭合方式和图案位置；在 4:3 横向浅色画布中排列正面、背面、侧面 3 个主视图和 2–3 个工艺细节放大框，视图对齐、比例统一、互不遮挡。
所有视图保持同一版型、配色、分割线、领口、袖型、口袋、闭合方式、图案位置和面料；专业设计图与写实材质结合。
仅使用简短可读中文部位标签；无 Logo、水印、长文、乱码、透视混乱或装饰拼贴。`;

const DESIGN_SHEET_EDIT =
  `GPT Image 2 VIP 多图服装设定表编辑。依照${LQ()}图1、图2${ELLIP()}${RQ()}及 garment_full、garment_top、garment_bottom、fabric、accessory 标注解读，材质图不得当成款式图，配饰不得变成服装主体。
把同一套服装按身份锚点整理为 4:3 正、背、侧 3 个主视图和 2–3 个细节框，还原比例、版型、颜色、分割线、缝线、闭合件、图案与材质，非目标细节不变。
输出视图对齐的浅色设定表和简短中文标签；无 Logo、水印、长文、乱码或视图间结构漂移。`;

const UPSCALE_EDIT =
  `将这张服装效果图放大为超高清版本，增强面料纹理、走线与边缘细节，保持原有构图、色彩和光影完全不变`;

const PRINT_EXTRACT_EDIT =
  `提取这件衣服上的印花图案：将印花完整抠出并平铺展开为规整的矩形图案，纯白背景，去除衣身、褶皱、阴影和穿着效果，印花的比例、细节和色彩与原图保持一致，适合作为印花素材复用`;

const PRINT_MUTATE_EDIT =
  `基于这张印花图案生成风格一致的新变体：保持原有配色体系、艺术风格与笔触质感，重新编排元素的构图与组合方式，纯白背景，适合作为印花素材复用`;

const FABRIC_RECOLOR_EDIT =
  `保持服装的版型、款式细节、构图和光线完全不变，仅将面料配色替换为用户指定的配色。配色应用于面料主体，呈现真实面料质感与准确色彩，无文字无水印。`;

const MASK_LOCAL_EDIT_TEXT =
  `GPT Image 2 服装局部修改。仅编辑 Alpha PNG 蒙版标记的可编辑区域，执行指定的局部替换、改款或清除；先移除旧物件边缘、阴影和残影，再生成新结构。
新内容与相邻服装的版型、面料、缝线、图案、光线、透视和褶皱自然融合，蒙版边界不出现光晕、硬边、重影或纹理断裂。
输出与源图同尺寸、同画幅和同构图。蒙版之外的像素是受保护的非目标区域：人物身份、脸部、发型、肤色、身材、姿势、未选中服装、配饰、背景和画幅完全不变；不扩大语义修改目标，不新增装饰、文字、Logo 或水印。`;

const VIDEO_ANIMATE_EDIT =
  `Seedance 服装款式动效。基于用户提供的款式图/上身图与正文描述，生成一段稳定、自然的服装展示视频。
优先保留服装的版型、颜色、图案、面料质感和穿着效果；动作自然、镜头稳定，不出现明显变形、闪烁或材质漂移。
严格遵循用户在正文中指定的时长、分辨率、画幅与运动要求；无额外文字、Logo 或水印。`;

const PROMPT_POLISH_EDIT =
  `你是一位服装视觉提示词编辑。请将用户输入的意图润色为一段结构化、可直接用于文生图模型的中文提示词。
要求：
1. 保留用户原意的核心服装品类、款式、颜色、面料、目标人群与场景。
2. 补充合理的构图、光线、背景与质感描述，但不臆造用户未提及的关键元素。
3. 使用中文输出，避免英文术语堆砌；句法简洁、可读性强。
4. 不要生成任何解释、Markdown 标题或列表符号；只输出一段连续正文。`;

const PROMPT_GENERATE_GENERATE =
  `你是一位服装视觉提示词作者。请从零生成一段可直接用于文生图模型的中文提示词，描述一套完整的服装视觉呈现。
要求：
1. 明确服装品类、款式、颜色、面料、目标人群与使用场景。
2. 包含构图、光线、背景和质感描述。
3. 使用中文输出，避免英文术语堆砌；句法简洁、可读性强。
4. 不要生成任何解释、Markdown 标题或列表符号；只输出一段连续正文。`;

/** 14 条预设模板文本（familyId:mode → FrozenPromptBinding）。与 server 同源同值。 */
const FROZEN_PROMPT_BINDING_MAP: Readonly<Record<string, FrozenPromptBinding>> = {
  "fashion-lookbook:generate": { familyId: "fashion-lookbook", mode: "generate", text: FASHION_LOOKBOOK_GENERATE },
  "fashion-lookbook:edit": { familyId: "fashion-lookbook", mode: "edit", text: FASHION_LOOKBOOK_EDIT },
  "commerce-hero:generate": { familyId: "commerce-hero", mode: "generate", text: COMMERCE_HERO_GENERATE },
  "commerce-hero:edit": { familyId: "commerce-hero", mode: "edit", text: COMMERCE_HERO_EDIT },
  "design-sheet:generate": { familyId: "design-sheet", mode: "generate", text: DESIGN_SHEET_GENERATE },
  "design-sheet:edit": { familyId: "design-sheet", mode: "edit", text: DESIGN_SHEET_EDIT },
  "upscale:edit": { familyId: "upscale", mode: "edit", text: UPSCALE_EDIT },
  "print-extract:edit": { familyId: "print-extract", mode: "edit", text: PRINT_EXTRACT_EDIT },
  "print-mutate:edit": { familyId: "print-mutate", mode: "edit", text: PRINT_MUTATE_EDIT },
  "fabric-recolor:edit": { familyId: "fabric-recolor", mode: "edit", text: FABRIC_RECOLOR_EDIT },
  "mask-local-edit:mask-edit": { familyId: "mask-local-edit", mode: "mask-edit", text: MASK_LOCAL_EDIT_TEXT },
  "video-animate:edit": { familyId: "video-animate", mode: "edit", text: VIDEO_ANIMATE_EDIT },
  "prompt-polish:edit": { familyId: "prompt-polish", mode: "edit", text: PROMPT_POLISH_EDIT },
  "prompt-generate:generate": { familyId: "prompt-generate", mode: "generate", text: PROMPT_GENERATE_GENERATE },
};

// ---------- variantId 解析 ----------

/**
 * variantId 格式：`${familyId}.${modelId}.${mode}.v1`
 * familyId: 小写字母+连字符
 * modelId: 小写字母/数字/点/连字符（默认模型 gpt-image-2.5-flare-vip 含点）
 * mode: generate | edit | mask-edit
 * 版本后缀：v1
 */
const VARIANT_ID_PATTERN = /^([a-z-]+)\.([a-z0-9.-]+)\.(generate|edit|mask-edit)\.v1$/;

/**
 * 按 variantId 解析冻结预设绑定（v8→v9 迁移消费）。
 * 未知 familyId / mode / 格式 → undefined（调用方丢弃绑定，fail-closed 不猜）。
 */
export function frozenPromptBindingForVariantId(variantId: string): FrozenPromptBinding | undefined {
  const match = VARIANT_ID_PATTERN.exec(variantId);
  if (!match) return undefined;
  const familyId = match[1];
  const mode = match[3] as ImageOperationMode;
  return FROZEN_PROMPT_BINDING_MAP[`${familyId}:${mode}`];
}

/** 取某 family+mode 的冻结 prompt 正文；无对应项返回 undefined。 */
export function frozenPromptText(familyId: string, mode: ImageOperationMode): string | undefined {
  return FROZEN_PROMPT_BINDING_MAP[`${familyId}:${mode}`]?.text;
}

/** 全量 11 族 familyId 列表（快照锁定用）。 */
export const FROZEN_PROMPT_FAMILY_IDS = [
  "fashion-lookbook",
  "commerce-hero",
  "design-sheet",
  "upscale",
  "print-extract",
  "print-mutate",
  "fabric-recolor",
  "mask-local-edit",
  "video-animate",
  "prompt-polish",
  "prompt-generate",
] as const;

/** 冻结表条目数（14 = 全量 PRESET_TEMPLATE_TEXTS）。 */
export const FROZEN_PROMPT_ENTRY_COUNT = Object.keys(FROZEN_PROMPT_BINDING_MAP).length; // 14