/**
 * 提示词系统文本与预设模板的冻结常量（64 Phase 1 / 裁决 E）。
 *
 * 文本逐字抽取自 src/lib/garmentPromptPresets.ts（variant fullPrompt / familyPrompts）。
 * 该源文件将在 64 Phase 3 删除；运行时（runner 拼装）与 v8→v9 迁移只读本文件。
 * 漂移防护：tests/prompt-presets-frozen.test.ts 以 sha256 快照锁定每条文本与键集合，
 * 任何一方改动都会被断言拦下（fail-closed）。
 *
 * 消费方：
 * - server/engine/runner.ts（C3）：taskPrompt = modeSystemText(kind, operationMode) + 用户正文。
 * - server/lib/workflowSchema.ts（C2）：v8→v9 迁移按 promptVariantId 解析预设模板文本与 operationMode。
 * - server/routes/templates.ts（C7）：内置模板 text 节点写入 family 预设模板文本。
 */
import { IMAGE_OPERATION_MODE_VALUES, type ImageOperationMode } from "../../src/types/imageOperations";
import type { NodeKind } from "../../src/types/workflow";

// ---------- 操作模式系统文本（runner 拼装）----------
/**
 * generate 的系统文本 = 空串（= 裸 API 行为，零回归；裁决 E）。
 * image.edit 亦为空串：模型×family 的编辑协议文本随预设模板进入 text 正文（裁决 B），
 * 运行链路不再有独立编辑系统文本。
 * image.mask-edit：蒙版操作协议文本（源 garmentPromptPresets GPT_IMAGE_2_MASK_VARIANT.fullPrompt）。
 * video.edit：视频动效任务文本（源 garmentPromptPresets VIDEO_ANIMATE_PROMPT）。
 */
export const MODE_SYSTEM_TEXT: Readonly<Record<"image" | "video", Readonly<Record<ImageOperationMode, string>>>> = {
  image: {
    generate: "",
    edit: "",
    "mask-edit": `服装局部修改。仅编辑 Alpha PNG 蒙版标记的可编辑区域，执行指定的局部替换、改款或清除；先移除旧物件边缘、阴影和残影，再生成新结构。
新内容与相邻服装的版型、面料、缝线、图案、光线、透视和褶皱自然融合，蒙版边界不出现光晕、硬边、重影或纹理断裂。
输出与源图同尺寸、同画幅和同构图。蒙版之外的像素是受保护的非目标区域：人物身份、脸部、发型、肤色、身材、姿势、未选中服装、配饰、背景和画幅完全不变；不扩大语义修改目标，不新增装饰、文字、Logo 或水印。`,
  },
  video: {
    generate: "",
    edit: `服装款式动效。基于用户提供的款式图/上身图与正文描述，生成一段稳定、自然的服装展示视频。
优先保留服装的版型、颜色、图案、面料质感和穿着效果；动作自然、镜头稳定，不出现明显变形、闪烁或材质漂移。
严格遵循用户在正文中描述的动作与运镜要求；无额外文字、Logo 或水印。`,
    "mask-edit": "",
  },
};

/** 按生成节点 kind + 操作模式取系统文本；非生成节点返回空串。 */
export function modeSystemText(kind: NodeKind, mode: ImageOperationMode): string {
  if (kind === "image-generator") return MODE_SYSTEM_TEXT.image[mode];
  if (kind === "video-generator") return MODE_SYSTEM_TEXT.video[mode];
  return "";
}

// ---------- 预设模板文本（迁移填充 + 内置模板 text 节点）----------
/** 预设模板文本的键集合（familyId）；快照测试锁定，增删需同步测试。 */
export const FROZEN_PRESET_FAMILY_IDS = [
  "fashion-lookbook",
  "upscale",
  "print-extract",
  "print-mutate",
  "fabric-recolor",
  "mask-local-edit",
  "video-animate",
  // 2026-10-28：视频模板语义拆分（走秀 / 小红书各一族）。
  "video-runway",
  "video-xhs",
  "prompt-polish",
  "prompt-generate",
  // 2026-10-12 model-tryon 模板协议重写：AI 换装双图角色绑定族（仅 edit 条目）。
  "model-tryon",
  // 2026-10-22 模板语义漂移修复：8 个模板原先共用 fashion-lookbook:edit，
  // 导致 pose 输出全身 Lookbook / background-swap 不换背景 / person-to-mannequin 输出真人 /
  // sketch-to-garment 与线稿无关。为每个模板建独立族（均仅 edit 条目）。
  // 闸门：tests/builtin-prompt-distinct.test.ts 锁定 15 个模板正文两两不同。
  "pose-shot",
  "background-swap",
  "digital-model",
  "fabric-swap",
  "sketch-to-garment",
  "ai-restyle",
  "person-to-mannequin",
] as const;

export interface FrozenPresetText {
  familyId: string;
  mode: ImageOperationMode;
  text: string;
}

/**
 * 预设模板文本表。键 = `${familyId}:${mode}`。
 * 任务族（fashion-lookbook）在源目录里按模型×模式各有一份（MODEL_PROMPTS）；
 * 冻结表取默认生图模型（gpt-image-2.5-flare）一份——
 * 内置模板既往绑定的正是该模型，文本与历史运行逐字一致。
 * 其余族为模型无关单文本（源 familyPrompts）。
 */
export const PRESET_TEMPLATE_TEXTS: Readonly<Record<string, FrozenPresetText>> = {
  "fashion-lookbook:generate": {
    familyId: "fashion-lookbook",
    mode: "generate",
    // 2026-10-28 体检修正：删模型名与「VIP」、删写死 3:4（画幅归面板）、
    // 删「精确呈现指定服装」——本模板无图片输入，服装只能来自正文描述。
    text: `写实穿搭生成。按正文描述的场合、风格、身材与服装，生成一位模特穿着相应服装的单人全身品牌 Lookbook：平视机位、中远景、约 50mm 视角，人物完整入镜、主体居中并留呼吸空间；动作自然，可有轻微行走或衣摆运动，但不得摆拍僵硬。
服装的版型、颜色、分割线、图案、缝线、褶皱、垂坠与真实面料按正文描述呈现，不与正文冲突；柔和自然光，克制中性背景，真实肤质和可信的小瑕疵。
不生成文字、Logo、水印、多余人物、随机配饰、错误肢体或服装结构变形，不裁切手脚，不使用过度磨皮或塑料质感。
用户补充要求（如为空则忽略本行）：`,
  },
  "fashion-lookbook:edit": {
    familyId: "fashion-lookbook",
    mode: "edit",
    // 2026-10-28 体检修正：删模型名/VIP 与写死 3:4；原九种参考图角色（identity、
    // pose_composition、garment_* …）在本模板只有 1 个图片输入节点时无处落地，
    // 收敛为单参考图语义（参考图1=服装），模特由正文描述生成。
    text: `写实穿搭编辑。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=服装，是唯一的服装来源。
按正文描述生成一位穿着参考图1服装的模特，设置机位、视角、姿势与取景，保持平视中远景、约 50mm 视角；忠实保留服装的版型、花型、材质与穿搭层级，动作与衣摆运动方向可信。
除明确指定的穿搭替换外，脸部、发型、肤色、身材、姿势、背景和非目标区域不变，无文字、Logo、水印、僵硬手势或过度磨皮。
用户补充要求（如为空则忽略本行）：`,
  },
  "upscale:edit": {
    familyId: "upscale",
    mode: "edit",
    text: `将这张服装效果图放大为超高清版本，增强面料纹理、走线与边缘细节，保持原有构图、色彩和光影完全不变`,
  },
  "print-extract:edit": {
    familyId: "print-extract",
    mode: "edit",
    // 2026-10-28 体检修正：补参考图角色说明与用户补充位。
    text: `印花提取。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=服装，是唯一的印花来源。
把参考图1衣服上的印花完整抠出并平铺展开为规整的矩形图案，纯白背景，去除衣身、褶皱、阴影、透视变形和穿着效果；印花的比例、细节与色彩与原始印花保持一致，边缘干净，适合作为印花素材复用。
不新增、不改写、不重绘印花元素。
用户补充要求（如为空则忽略本行）：`,
  },
  "print-mutate:edit": {
    familyId: "print-mutate",
    mode: "edit",
    // 2026-10-28 体检修正：补参考图角色说明与用户补充位。
    text: `印花裂变。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=原始印花，是唯一的风格与配色来源。
基于参考图1生成风格一致的新变体：保持原有配色体系、艺术风格与笔触质感，重新编排元素的构图、疏密与组合方式，纯白背景，图案完整不裁切，适合作为印花素材复用。
不引入与原印花无关的新题材，不改动原有单元素的造型语言。
用户补充要求（如为空则忽略本行）：`,
  },
  "fabric-recolor:edit": {
    familyId: "fabric-recolor",
    mode: "edit",
    // 2026-10-28 体检修正：原文无参考图角色说明、无用户补充位，与其余 12 条口径不一。
    text: `服装换色。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=服装，是唯一的服装来源与唯一的版型来源。
保持参考图1的版型、款式细节、分割线、缝线、褶皱走向、构图和光线完全不变，仅将面料配色替换为正文指定的配色；配色只作用于面料主体，保留原面料的织法、光泽与明暗层次，不改变服装结构与背景。
无文字、无 Logo、无水印。
用户补充要求（如为空则忽略本行）：`,
  },
  "mask-local-edit:mask-edit": {
    familyId: "mask-local-edit",
    mode: "mask-edit",
    text: MODE_SYSTEM_TEXT.image["mask-edit"],
  },
  "video-animate:edit": {
    familyId: "video-animate",
    mode: "edit",
    text: MODE_SYSTEM_TEXT.video.edit,
  },
  // 2026-10-28 体检修正：走秀与小红书模板原先共用 video-animate:edit，正文一字不差，
  // 任务语义无法区分（走秀要台步、小红书要近景种草）。拆为两个专属族。
  "video-runway:edit": {
    familyId: "video-runway",
    mode: "edit",
    text: `服装走秀动效。基于参考图1的服装，生成模特穿着该服装在 T 台上行走展示的视频。
严格保持参考图1服装的版型、颜色、图案、面料质感与五金细节，不改变设计本身，不新增图案或文字。
模特按正常台步节奏自然行走：正面走来，肩线平稳、手臂自然摆动、衣摆随步伐轻摆；镜头保持稳定的中景跟随，不晃动、不跳切。
画面无文字、Logo、水印，不出现多余人物或服装结构变形。
用户补充要求（如为空则忽略本行）：`,
  },
  "video-xhs:edit": {
    familyId: "video-xhs",
    mode: "edit",
    text: `小红书服装种草动效。基于参考图1的服装，生成模特穿着该服装的近景展示视频，适合竖屏短视频。
严格保持参考图1服装的版型、颜色、图案、面料质感与五金细节，不改变设计本身。
动作贴近种草表达：模特轻微转身、抬手展示细节、自然走动半步后停住，节奏轻快；镜头以近景为主，可轻微推近突出面料与工艺。
画面无文字、Logo、水印，不出现多余人物或服装结构变形。
用户补充要求（如为空则忽略本行）：`,
  },
  "prompt-polish:edit": {
    familyId: "prompt-polish",
    mode: "edit",
    text: `你是一位服装视觉提示词编辑。请将用户输入的意图润色为一段结构化、可直接用于文生图模型的中文提示词。
要求：
1. 保留用户原意的核心服装品类、款式、颜色、面料、目标人群与场景。
2. 补充合理的构图、光线、背景与质感描述，但不臆造用户未提及的关键元素。
3. 使用中文输出，避免英文术语堆砌；句法简洁、可读性强。
4. 不要生成任何解释、Markdown 标题或列表符号；只输出一段连续正文。`,
  },
  "prompt-generate:generate": {
    familyId: "prompt-generate",
    mode: "generate",
    text: `你是一位服装视觉提示词作者。请从零生成一段可直接用于文生图模型的中文提示词，描述一套完整的服装视觉呈现。
要求：
1. 明确服装品类、款式、颜色、面料、目标人群与使用场景。
2. 包含构图、光线、背景和质感描述。
3. 使用中文输出，避免英文术语堆砌；句法简洁、可读性强。
4. 不要生成任何解释、Markdown 标题或列表符号；只输出一段连续正文。`,
  },
  // 2026-10-12 model-tryon 模板协议重写（docs/design/2026-10-12-model-tryon-template/plan.md §2.1
  // 逐字定稿；与 client 镜像 src/lib/promptPresetsFrozenClient.ts MODEL_TRYON_EDIT 逐字一致，
  // catalog 强一致门禁逐条比对）：AI 换装双图角色绑定（参考图1=服装/参考图2=模特）+ 3:4
  // 全身竖版 + 用户补充位。该族无 generate 条目；仅 edit。
  "model-tryon:edit": {
    familyId: "model-tryon",
    mode: "edit",
    text: `AI 换装模特试穿。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=服装，是唯一的服装来源；参考图2=模特，是唯一的人物身份来源（长相、发型、肤色、身材）。把参考图1的服装完整穿到参考图2的模特身上：忠实还原服装的版型、颜色、花型、面料质感、缝线、闭合方式与五金细节；保留模特本人的面部特征、发型、肤色、身材比例与姿势，只更换身上服装，不改变人物身份，不融合两张脸或两件衣服。
用户补充要求（如为空则忽略本行）：`,
  },
  // ---------- 2026-10-22 模板专属协议（7 个模板原来共用 fashion-lookbook:edit）----------
  // 每个族的正文只描述本模板的那一件事；共同骨架是「严格按参考图序号…不得跨图挪用」+ 末尾用户补充位。
  "pose-shot:edit": {
    familyId: "pose-shot",
    mode: "edit",
    text: `摆拍 Pose 编辑。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=人物或服装，是唯一的人物身份与服装来源。
保持参考图1中人物的长相、发型、肤色、身材与服装款式颜色完全不变，只调整姿态与镜头：按正文要求设置站姿、手臂位置、重心落点、视线方向，以及机位高度、焦段观感与取景范围，约 50mm 平视视角。
不改变服装版型与颜色，不改变人物身份，不新增或删除配饰，不更换背景类型。
构图锁定：输出画幅、取景范围与裁切位置必须与参考图1完全一致（同尺寸、同构图、同背景）；不得向下或向四周外扩画面，不得补出参考图1未拍到的身体部位（下半身、腿、脚、鞋、手部均不得凭空生成）；若参考图只拍到胸部以上，输出也必须只到胸部以上。
用户补充要求（如为空则忽略本行）：`,
  },
  "background-swap:edit": {
    familyId: "background-swap",
    mode: "edit",
    text: `更换背景。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=需要保留的人物或产品，是唯一的主体来源。
完整保留参考图1的主体：人物长相、发型、肤色、身材、服装款式、颜色、褶皱、材质与原有光影方向全部不变，不重绘主体，不改变构图与取景范围，不把半身构图外扩为全身。
只替换背景：按正文描述生成新背景，明确新的场景、色调、景深与地面材质；新背景的光线方向必须与主体原有光照保持一致，主体边缘与背景过渡自然，主体表面保留新环境的环境色反射。
若正文未给出任何背景描述，保持原背景不变，不得自行编造场景。
用户补充要求（如为空则忽略本行）：`,
  },
  "digital-model:edit": {
    familyId: "digital-model",
    mode: "edit",
    text: `数字模特生成。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=服装，是唯一的服装来源。
按参考图1的服装生成一位数字模特穿着效果：忠实还原版型、颜色、花型、面料质感、缝线与闭合方式与五金细节，不修改服装设计本身，不在服装上添加原图没有的图案或文字，不融合两件衣服。
数字模特的五官风格按正文描述（默认中性干净、无强烈记忆点的东亚面孔），姿态自然站立，棚拍纯色背景，柔和均匀光。不照搬参考图中原有的人脸与身份。
用户补充要求（如为空则忽略本行）：`,
  },
  "fabric-swap:edit": {
    familyId: "fabric-swap",
    mode: "edit",
    text: `面料替换。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=服装，是唯一的服装来源与唯一的版型来源；参考图2=面料参考，是唯一的面料来源。
保持参考图1的款式、版型、分割线、缝线位置、闭合方式、构图、姿态与光线完全不变，仅把服装面料替换为参考图2的纹理、织法、光泽与厚度。
替换后的面料需按参考图1的褶皱走向与受力关系重新生成纹理，保留原有缝纫结构与五金件，不改变服装轮廓，不改变背景，不把面料参考图当成款式图。
用户补充要求（如为空则忽略本行）：`,
  },
  "sketch-to-garment:edit": {
    familyId: "sketch-to-garment",
    mode: "edit",
    text: `线稿成衣。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=线稿，是唯一的款式来源。
严格按参考图1的线条结构生成成衣效果：轮廓、分割线、领型、袖型、衣长比例必须与线稿一一对应，不增删设计元素，不改成线稿里没有的款式。
材质、颜色与工艺按正文描述填写；正文未指定时按线稿暗示的面料质感与中性配色处理。
输出为单件服装的商品展示图（可穿在人台上，也可平铺或挂拍），不要生成与线稿无关的穿搭人物，不要改变线稿的款式结构。
用户补充要求（如为空则忽略本行）：`,
  },
  "ai-restyle:edit": {
    familyId: "ai-restyle",
    mode: "edit",
    text: `AI 改款。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=原服装，是唯一的版型来源。
在保留参考图1版型骨架（肩线、衣长、腰位、袖型、领型比例）的前提下，按正文的改款指令修改局部设计：领型、袖型、长度、分割线、局部装饰或细节结构。
改款结果保持面料原有质感与色彩体系，除非正文明确要求换色；不改动未提及的部位，不改变整体风格走向，不在图上添加文字、Logo 或水印。
用户补充要求（如为空则忽略本行）：`,
  },
  "person-to-mannequin:edit": {
    familyId: "person-to-mannequin",
    mode: "edit",
    text: `真人转人台。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=真人着装图，是唯一的服装来源。
把参考图1的服装转移到无头人台上：完全去除真人特征，不保留人脸、头发、皮肤、手指、表情或真人身体轮廓。
人台为米白或浅灰的中性色服装展示用模型（半身或全身人台），服装穿在人台上需保留原图的版型、颜色、花型、面料质感、褶皱走向与五金细节。
背景为干净的影棚纯色背景，光线均匀；不添加真人、不添加文字或水印。
用户补充要求（如为空则忽略本行）：`,
  },
};

export interface FrozenPromptBinding {
  familyId: string;
  mode: ImageOperationMode;
  text: string;
}

/**
 * 按 variantId 解析冻结预设绑定（v8→v9 迁移消费）。
 * variantId 形如 `${familyId}.${modelId}.${mode}.v1`（modelId 可含点，如 gpt-image-2.5-flare），
 * 故不能按点号拆分；familyId 只含小写字母与连字符，mode 取值域封闭。
 * 未知 familyId / mode / 版本后缀 → undefined（调用方丢弃绑定，fail-closed 不猜）。
 */
const VARIANT_ID_PATTERN = /^([a-z-]+)\.([a-z0-9.-]+)\.(generate|edit|mask-edit)\.v1$/;

export function frozenPromptBindingForVariantId(variantId: string): FrozenPromptBinding | undefined {
  const match = VARIANT_ID_PATTERN.exec(variantId);
  if (!match) return undefined;
  const familyId = match[1];
  const mode = match[3] as ImageOperationMode;
  const entry = PRESET_TEMPLATE_TEXTS[`${familyId}:${mode}`];
  if (!entry) return undefined;
  return { familyId: entry.familyId, mode: entry.mode, text: entry.text };
}

/** 取某 family 的预设模板文本（内置模板 text 节点写入）；无对应项返回 undefined。 */
export function presetTemplateText(familyId: string, mode: ImageOperationMode): string | undefined {
  return PRESET_TEMPLATE_TEXTS[`${familyId}:${mode}`]?.text;
}

export const IMAGE_OPERATION_MODE_VALUES_SNAPSHOT: readonly string[] = IMAGE_OPERATION_MODE_VALUES;

// ---------- 提示词改写层系统文本（2026-10-12 拍板，逐字冻结；测试 sha256 锁定，不得改措辞）----------
/**
 * 改写 system prompt 归属冻结表（与 MODE_SYSTEM_TEXT 并列，不复用 PRESET_TEMPLATE_TEXTS——
 * 后者是「内置模板 text 节点正文」，语义不同）。文本为 2026-10-12 用户拍板定稿，含三铁律
 * （不覆盖用户原话 / 只补全六要素 / 前后自洽）与禁负资产词清单；tests/prompt-presets-frozen.test.ts
 * 以 sha256 快照锁定键集合与各条文本，任何改动都会被拦下（fail-closed）。
 *
 * 后续如需 model-tryon 专用条目，按同一铁律结构新增 `"model-tryon": …`（覆盖默认），
 * 同样逐字冻结 + 评审，不得在落地时临时撰写。
 */
export const REWRITE_SYSTEM_PROMPTS: Readonly<Record<string, string>> = {
  // 默认改写提示词（无 family 命中时用；首期 model-tryon 未提供专用条目前亦用此条）
  "default": `你是一位服装视觉提示词的结构化优化编辑。你的唯一任务是在严格遵从用户要求的前提下，把用户输入优化为一段结构完整、可直接用于服装出图模型的中文提示词。

铁律（最高优先级，违反即失败）：
1. 用户明确写出的所有要求——包括服装品类、款式、颜色、面料、人物动作、姿势、表情、场景、环境、构图、风格等任何具体指令——必须原样保留，逐字不得删除、替换、弱化、否定或改写其含义；用户要求是最高优先级。
2. 你只做结构化补全与扩写：围绕主体、环境、光线、镜头、色调、构图六个维度补充用户没有提及但与用户要求不冲突的合理细节；严禁新增任何与用户输入相矛盾或改变用户意图的设定（例如用户写红色就不得改成别的颜色，用户写室内就不得加室外）。
3. 输出必须前后自洽：补全的各要素之间、补全内容与用户原话之间不得自相矛盾；若某个六要素按用户描述本就不适用（如纯色背景无环境细节），不要硬凑。

输出格式：只输出一段连续的中文正文，不要解释、不要分点、不要 Markdown 标题或列表符号。禁止使用「8K」「杰作」「大师级」「完美光线」「超高清」等无信息量的夸大词；不要添加文字、Logo、水印相关描述（除非用户明确要求图中文字）。`,
  // model-tryon 专用改写提示词（2026-10-12 拍板，model-tryon-template plan §2.4 逐字）。
  // 白名单启用前置：缺了它，default 会把冻结工作流协议（参考图角色绑定）当普通用户输入重写，
  // 导致服装/模特错配事故。本条只补全「用户补充要求」段，冻结协议逐字保留。
  "model-tryon": `你是 AI 换装「模特试穿」工作流的提示词补全编辑。输入正文由两部分组成：①一段已冻结的工作流协议（以「AI 换装模特试穿。」开头、规定参考图角色与输出要求的部分）；②用户补充要求（结尾「用户补充要求」之后的内容）。
铁律（最高优先级，违反即失败）：
1. 冻结协议部分必须逐字原样保留，不得删除、改写、重排或弱化其中任何参考图角色绑定与输出约束；
2. 只对「用户补充要求」部分做结构化补全：围绕主体、环境、光线、镜头、色调、构图六个维度补充与用户要求和协议不冲突的合理细节；用户明确写出的要求原样保留、最高优先级；严禁新增与用户要求、参考图角色或输出画幅相冲突的设定；
3. 输出前后自洽，补全内容与协议、用户原话之间不得自相矛盾；不适用的维度不要硬凑。
输出格式：输出完整正文（冻结协议部分逐字保留，后接补全后的用户补充要求），只输出一段连续中文文本，不要解释、不要分点、不要 Markdown 标题或列表符号；禁止使用「8K」「杰作」「大师级」「完美光线」「超高清」等无信息量夸大词。`,
  // model-tryon 补充段专用改写提示词（2026-10-12 P1 缺陷修复拍板：锚点切分后改写器只收补充段，
  // 整段条目要求「输出完整正文（协议+补充）」与实际输入形态不匹配 → 模型自编协议且角色错配）。
  // 仅锚点切分命中（protocol !== ""）时选用；非锚点输入仍走原 family 条目（整段改写）。
  "model-tryon-supplement": `你是 AI 换装「模特试穿」工作流的用户补充要求扩写编辑。你收到的输入只是用户的补充要求片段：工作流协议不在本条消息中，你既不需要理解它，也绝不要在输出中复述或自创任何协议内容。
铁律（最高优先级，违反即失败）：
1. 用户明确写出的所有要求必须原样保留，逐字不得删除、替换、弱化、否定或改写其含义；用户要求是最高优先级。
2. 无论用户输入多短（哪怕只有一个词），你都必须按主体、环境、光线、镜头、色调、构图六个维度补全：缺哪维补哪维，每维给具体值（光线必须有可指认的主光方向，镜头必须有焦段或机位，色调必须有白平衡或饱和度倾向）；用户已写明的维度原样保留不改写。
3. 你的输出只是补充要求本身：不得出现「AI 换装」「参考图1」「参考图2」等工作流协议词汇，不得规定输出画幅或其它由工作流协议管辖的约束。
输出格式：只输出扩写后的补充要求正文，一段连续中文文本，不要解释、不要分点、不要 Markdown 标题或列表符号；禁止使用「8K」「杰作」「大师级」「完美光线」「超高清」等无信息量的夸大词；不要添加文字、Logo、水印相关描述（除非用户明确要求图中文字）。`,
};

/**
 * 按 familyId 选改写 system prompt：命中覆盖表 → 该条；否则 "default"。
 * familyId 为 undefined / 未注册时一律落到 "default"（首期仅 default 一条，fail-closed）。
 */
export function rewriteSystemPrompt(familyId: string | undefined): string {
  if (familyId !== undefined) {
    const hit = REWRITE_SYSTEM_PROMPTS[familyId];
    if (typeof hit === "string") return hit;
  }
  return REWRITE_SYSTEM_PROMPTS.default;
}
