/**
 * 客户端冻结 variantId→binding 表（64 Phase 3a 裁决 b）。
 *
 * 镜像 server/lib/promptPresetsFrozen.ts 的 frozenPromptBindingForVariantId
 * + PRESET_TEMPLATE_TEXTS（全量 19 族，22 条预设模板文本），
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

// ---------- 全量 19 族预设模板文本（与 server/lib/promptPresetsFrozen.ts PRESET_TEMPLATE_TEXTS 逐字一致）----------

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

// model-tryon:edit（双图模特试穿冻结协议，2026-10-12 §2.1 逐字定稿；该族无 generate 条目）。
// 结尾「用户补充要求（如为空则忽略本行）：」为用户补充位，text 节点用户在其后追加。
const MODEL_TRYON_EDIT =
  `AI 换装模特试穿。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=服装，是唯一的服装来源；参考图2=模特，是唯一的人物身份来源（长相、发型、肤色、身材）。把参考图1的服装完整穿到参考图2的模特身上：忠实还原服装的版型、颜色、花型、面料质感、缝线、闭合方式与五金细节；保留模特本人的面部特征、发型、肤色、身材比例与姿势，只更换身上服装，不改变人物身份，不融合两张脸或两件衣服。
用户补充要求（如为空则忽略本行）：`;

// ---------- 2026-10-22 模板专属协议（7 个模板原来共用 fashion-lookbook:edit）----------
// 与 server/lib/promptPresetsFrozen.ts 的对应条目逐字一致；
// 闸门：tests/builtin-prompt-distinct.test.ts + tests/prompt-presets-catalog.test.ts。

const POSE_SHOT_EDIT =
  `摆拍 Pose 编辑。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=人物或服装，是唯一的人物身份与服装来源。
保持参考图1中人物的长相、发型、肤色、身材与服装款式颜色完全不变，只调整姿态与镜头：按正文要求设置站姿、手臂位置、重心落点、视线方向，以及机位高度、焦段观感与取景范围，约 50mm 平视视角。
不改变服装版型与颜色，不改变人物身份，不新增或删除配饰，不更换背景类型。
构图锁定：输出画幅、取景范围与裁切位置必须与参考图1完全一致（同尺寸、同构图、同背景）；不得向下或向四周外扩画面，不得补出参考图1未拍到的身体部位（下半身、腿、脚、鞋、手部均不得凭空生成）；若参考图只拍到胸部以上，输出也必须只到胸部以上。
用户补充要求（如为空则忽略本行）：`;

const BACKGROUND_SWAP_EDIT =
  `更换背景。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=需要保留的人物或产品，是唯一的主体来源。
完整保留参考图1的主体：人物长相、发型、肤色、身材、服装款式、颜色、褶皱、材质与原有光影方向全部不变，不重绘主体，不改变构图与取景范围，不把半身构图外扩为全身。
只替换背景：按正文描述生成新背景，明确新的场景、色调、景深与地面材质；新背景的光线方向必须与主体原有光照保持一致，主体边缘与背景过渡自然，主体表面保留新环境的环境色反射。
若正文未给出任何背景描述，保持原背景不变，不得自行编造场景。
用户补充要求（如为空则忽略本行）：`;

const DIGITAL_MODEL_EDIT =
  `数字模特生成。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=服装，是唯一的服装来源。
按参考图1的服装生成一位数字模特穿着效果：忠实还原版型、颜色、花型、面料质感、缝线与闭合方式与五金细节，不修改服装设计本身，不在服装上添加原图没有的图案或文字，不融合两件衣服。
数字模特的五官风格按正文描述（默认中性干净、无强烈记忆点的东亚面孔），姿态自然站立，棚拍纯色背景，柔和均匀光。不照搬参考图中原有的人脸与身份。
用户补充要求（如为空则忽略本行）：`;

const FABRIC_SWAP_EDIT =
  `面料替换。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=服装，是唯一的服装来源与唯一的版型来源；参考图2=面料参考，是唯一的面料来源。
保持参考图1的款式、版型、分割线、缝线位置、闭合方式、构图、姿态与光线完全不变，仅把服装面料替换为参考图2的纹理、织法、光泽与厚度。
替换后的面料需按参考图1的褶皱走向与受力关系重新生成纹理，保留原有缝纫结构与五金件，不改变服装轮廓，不改变背景，不把面料参考图当成款式图。
用户补充要求（如为空则忽略本行）：`;

const SKETCH_TO_GARMENT_EDIT =
  `线稿成衣。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=线稿，是唯一的款式来源。
严格按参考图1的线条结构生成成衣效果：轮廓、分割线、领型、袖型、衣长比例必须与线稿一一对应，不增删设计元素，不改成线稿里没有的款式。
材质、颜色与工艺按正文描述填写；正文未指定时按线稿暗示的面料质感与中性配色处理。
输出为单件服装的商品展示图（可穿在人台上，也可平铺或挂拍），不要生成与线稿无关的穿搭人物，不要改变线稿的款式结构。
用户补充要求（如为空则忽略本行）：`;

const AI_RESTYLE_EDIT =
  `AI 改款。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=原服装，是唯一的版型来源。
在保留参考图1版型骨架（肩线、衣长、腰位、袖型、领型比例）的前提下，按正文的改款指令修改局部设计：领型、袖型、长度、分割线、局部装饰或细节结构。
改款结果保持面料原有质感与色彩体系，除非正文明确要求换色；不改动未提及的部位，不改变整体风格走向，不在图上添加文字、Logo 或水印。
用户补充要求（如为空则忽略本行）：`;

const PERSON_TO_MANNEQUIN_EDIT =
  `真人转人台。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=真人着装图，是唯一的服装来源。
把参考图1的服装转移到无头人台上：完全去除真人特征，不保留人脸、头发、皮肤、手指、表情或真人身体轮廓。
人台为米白或浅灰的中性色服装展示用模型（半身或全身人台），服装穿在人台上需保留原图的版型、颜色、花型、面料质感、褶皱走向与五金细节。
背景为干净的影棚纯色背景，光线均匀；不添加真人、不添加文字或水印。
用户补充要求（如为空则忽略本行）：`;

/** 22 条预设模板文本（familyId:mode → FrozenPromptBinding）。与 server 同源同值。 */
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
  "model-tryon:edit": { familyId: "model-tryon", mode: "edit", text: MODEL_TRYON_EDIT },
  "pose-shot:edit": { familyId: "pose-shot", mode: "edit", text: POSE_SHOT_EDIT },
  "background-swap:edit": { familyId: "background-swap", mode: "edit", text: BACKGROUND_SWAP_EDIT },
  "digital-model:edit": { familyId: "digital-model", mode: "edit", text: DIGITAL_MODEL_EDIT },
  "fabric-swap:edit": { familyId: "fabric-swap", mode: "edit", text: FABRIC_SWAP_EDIT },
  "sketch-to-garment:edit": { familyId: "sketch-to-garment", mode: "edit", text: SKETCH_TO_GARMENT_EDIT },
  "ai-restyle:edit": { familyId: "ai-restyle", mode: "edit", text: AI_RESTYLE_EDIT },
  "person-to-mannequin:edit": { familyId: "person-to-mannequin", mode: "edit", text: PERSON_TO_MANNEQUIN_EDIT },
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

/** 全量 19 族 familyId 列表（快照锁定用）。 */
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
  "model-tryon",
  "pose-shot",
  "background-swap",
  "digital-model",
  "fabric-swap",
  "sketch-to-garment",
  "ai-restyle",
  "person-to-mannequin",
] as const;

/** 冻结表条目数（22 = 全量 PRESET_TEMPLATE_TEXTS）。 */
export const FROZEN_PROMPT_ENTRY_COUNT = Object.keys(FROZEN_PROMPT_BINDING_MAP).length; // 22