/**
 * AUTO-GENERATED — 不要手改。
 *
 * 由 scripts/gen-prompt-mirrors.mjs 从 server/lib/promptPresetsFrozen.ts 生成，
 * 落到 src/lib/promptPresetsFrozenClient.ts。
 * 改提示词请改服务端冻结表，然后跑：npm run gen:presets
 *
 * 客户端不能 import server/（depcruise 强制隔离），故以生成副本形式共享同一份文本。
 */
import type { ImageOperationMode } from "@/types/imageOperations";

export interface FrozenPromptBinding {
  familyId: string;
  mode: ImageOperationMode;
  /** 预设模板正文 = 服务端 PRESET_TEMPLATE_TEXTS 的 text（生成时逐字复制）。 */
  text: string;
}

/** 全量冻结绑定表（键 = `${familyId}:${mode}`）。 */
export const FROZEN_PROMPT_BINDING_MAP: Readonly<Record<string, FrozenPromptBinding>> = {
  "fashion-lookbook:generate": { familyId: "fashion-lookbook", mode: "generate", text: "写实穿搭生成。按正文描述的场合、风格、身材与服装，生成一位模特穿着相应服装的单人全身品牌 Lookbook：平视机位、中远景、约 50mm 视角，人物完整入镜、主体居中并留呼吸空间；动作自然，可有轻微行走或衣摆运动，但不得摆拍僵硬。\n服装的版型、颜色、分割线、图案、缝线、褶皱、垂坠与真实面料按正文描述呈现，不与正文冲突；柔和自然光，克制中性背景，真实肤质和可信的小瑕疵。\n不生成文字、Logo、水印、多余人物、随机配饰、错误肢体或服装结构变形，不裁切手脚，不使用过度磨皮或塑料质感。\n用户补充要求（如为空则忽略本行）：" },
  "fashion-lookbook:edit": { familyId: "fashion-lookbook", mode: "edit", text: "写实穿搭编辑。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=服装，是唯一的服装来源。\n按正文描述生成一位穿着参考图1服装的模特，设置机位、视角、姿势与取景，保持平视中远景、约 50mm 视角；忠实保留服装的版型、花型、材质与穿搭层级，动作与衣摆运动方向可信。\n除明确指定的穿搭替换外，脸部、发型、肤色、身材、姿势、背景和非目标区域不变，无文字、Logo、水印、僵硬手势或过度磨皮。\n用户补充要求（如为空则忽略本行）：" },
  "upscale:edit": { familyId: "upscale", mode: "edit", text: "将这张服装效果图放大为超高清版本，增强面料纹理、走线与边缘细节，保持原有构图、色彩和光影完全不变" },
  "print-extract:edit": { familyId: "print-extract", mode: "edit", text: "印花提取。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=服装，是唯一的印花来源。\n把参考图1衣服上的印花完整抠出并平铺展开为规整的矩形图案，纯白背景，去除衣身、褶皱、阴影、透视变形和穿着效果；印花的比例、细节与色彩与原始印花保持一致，边缘干净，适合作为印花素材复用。\n不新增、不改写、不重绘印花元素。\n用户补充要求（如为空则忽略本行）：" },
  "print-mutate:edit": { familyId: "print-mutate", mode: "edit", text: "印花裂变。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=原始印花，是唯一的风格与配色来源。\n基于参考图1生成风格一致的新变体：保持原有配色体系、艺术风格与笔触质感，重新编排元素的构图、疏密与组合方式，纯白背景，图案完整不裁切，适合作为印花素材复用。\n不引入与原印花无关的新题材，不改动原有单元素的造型语言。\n用户补充要求（如为空则忽略本行）：" },
  "fabric-recolor:edit": { familyId: "fabric-recolor", mode: "edit", text: "服装换色。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=服装，是唯一的服装来源与唯一的版型来源。\n保持参考图1的版型、款式细节、分割线、缝线、褶皱走向、构图和光线完全不变，仅将面料配色替换为正文指定的配色；配色只作用于面料主体，保留原面料的织法、光泽与明暗层次，不改变服装结构与背景。\n无文字、无 Logo、无水印。\n用户补充要求（如为空则忽略本行）：" },
  "mask-local-edit:mask-edit": { familyId: "mask-local-edit", mode: "mask-edit", text: "服装局部修改。仅编辑 Alpha PNG 蒙版标记的可编辑区域，执行指定的局部替换、改款或清除；先移除旧物件边缘、阴影和残影，再生成新结构。\n新内容与相邻服装的版型、面料、缝线、图案、光线、透视和褶皱自然融合，蒙版边界不出现光晕、硬边、重影或纹理断裂。\n输出与源图同尺寸、同画幅和同构图。蒙版之外的像素是受保护的非目标区域：人物身份、脸部、发型、肤色、身材、姿势、未选中服装、配饰、背景和画幅完全不变；不扩大语义修改目标，不新增装饰、文字、Logo 或水印。" },
  "video-animate:edit": { familyId: "video-animate", mode: "edit", text: "服装款式动效。基于用户提供的款式图/上身图与正文描述，生成一段稳定、自然的服装展示视频。\n优先保留服装的版型、颜色、图案、面料质感和穿着效果；动作自然、镜头稳定，不出现明显变形、闪烁或材质漂移。\n严格遵循用户在正文中描述的动作与运镜要求；无额外文字、Logo 或水印。" },
  "video-runway:edit": { familyId: "video-runway", mode: "edit", text: "服装走秀动效。基于参考图1的服装，生成模特穿着该服装在 T 台上行走展示的视频。\n严格保持参考图1服装的版型、颜色、图案、面料质感与五金细节，不改变设计本身，不新增图案或文字。\n模特按正常台步节奏自然行走：正面走来，肩线平稳、手臂自然摆动、衣摆随步伐轻摆；镜头保持稳定的中景跟随，不晃动、不跳切。\n画面无文字、Logo、水印，不出现多余人物或服装结构变形。\n用户补充要求（如为空则忽略本行）：" },
  "video-xhs:edit": { familyId: "video-xhs", mode: "edit", text: "小红书服装种草动效。基于参考图1的服装，生成模特穿着该服装的近景展示视频，适合竖屏短视频。\n严格保持参考图1服装的版型、颜色、图案、面料质感与五金细节，不改变设计本身。\n动作贴近种草表达：模特轻微转身、抬手展示细节、自然走动半步后停住，节奏轻快；镜头以近景为主，可轻微推近突出面料与工艺。\n画面无文字、Logo、水印，不出现多余人物或服装结构变形。\n用户补充要求（如为空则忽略本行）：" },
  "prompt-polish:edit": { familyId: "prompt-polish", mode: "edit", text: "你是一位服装视觉提示词编辑。请将用户输入的意图润色为一段结构化、可直接用于文生图模型的中文提示词。\n要求：\n1. 保留用户原意的核心服装品类、款式、颜色、面料、目标人群与场景。\n2. 补充合理的构图、光线、背景与质感描述，但不臆造用户未提及的关键元素。\n3. 使用中文输出，避免英文术语堆砌；句法简洁、可读性强。\n4. 不要生成任何解释、Markdown 标题或列表符号；只输出一段连续正文。" },
  "prompt-generate:generate": { familyId: "prompt-generate", mode: "generate", text: "你是一位服装视觉提示词作者。请从零生成一段可直接用于文生图模型的中文提示词，描述一套完整的服装视觉呈现。\n要求：\n1. 明确服装品类、款式、颜色、面料、目标人群与使用场景。\n2. 包含构图、光线、背景和质感描述。\n3. 使用中文输出，避免英文术语堆砌；句法简洁、可读性强。\n4. 不要生成任何解释、Markdown 标题或列表符号；只输出一段连续正文。" },
  "model-tryon:edit": { familyId: "model-tryon", mode: "edit", text: "AI 换装模特试穿。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=服装，是唯一的服装来源；参考图2=模特，是唯一的人物身份来源（长相、发型、肤色、身材）。把参考图1的服装完整穿到参考图2的模特身上：忠实还原服装的版型、颜色、花型、面料质感、缝线、闭合方式与五金细节；保留模特本人的面部特征、发型、肤色、身材比例与姿势，只更换身上服装，不改变人物身份，不融合两张脸或两件衣服。\n用户补充要求（如为空则忽略本行）：" },
  "pose-shot:edit": { familyId: "pose-shot", mode: "edit", text: "摆拍 Pose 编辑。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=人物或服装，是唯一的人物身份与服装来源。\n保持参考图1中人物的长相、发型、肤色、身材与服装款式颜色完全不变，只调整姿态与镜头：按正文要求设置站姿、手臂位置、重心落点、视线方向，以及机位高度、焦段观感与取景范围，约 50mm 平视视角。\n不改变服装版型与颜色，不改变人物身份，不新增或删除配饰，不更换背景类型。\n构图锁定：输出画幅、取景范围与裁切位置必须与参考图1完全一致（同尺寸、同构图、同背景）；不得向下或向四周外扩画面，不得补出参考图1未拍到的身体部位（下半身、腿、脚、鞋、手部均不得凭空生成）；若参考图只拍到胸部以上，输出也必须只到胸部以上。\n用户补充要求（如为空则忽略本行）：" },
  "background-swap:edit": { familyId: "background-swap", mode: "edit", text: "更换背景。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=需要保留的人物或产品，是唯一的主体来源。\n完整保留参考图1的主体：人物长相、发型、肤色、身材、服装款式、颜色、褶皱、材质与原有光影方向全部不变，不重绘主体，不改变构图与取景范围，不把半身构图外扩为全身。\n只替换背景：按正文描述生成新背景，明确新的场景、色调、景深与地面材质；新背景的光线方向必须与主体原有光照保持一致，主体边缘与背景过渡自然，主体表面保留新环境的环境色反射。\n若正文未给出任何背景描述，保持原背景不变，不得自行编造场景。\n用户补充要求（如为空则忽略本行）：" },
  "digital-model:edit": { familyId: "digital-model", mode: "edit", text: "数字模特生成。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=服装，是唯一的服装来源。\n按参考图1的服装生成一位数字模特穿着效果：忠实还原版型、颜色、花型、面料质感、缝线与闭合方式与五金细节，不修改服装设计本身，不在服装上添加原图没有的图案或文字，不融合两件衣服。\n数字模特的五官风格按正文描述（默认中性干净、无强烈记忆点的东亚面孔），姿态自然站立，棚拍纯色背景，柔和均匀光。不照搬参考图中原有的人脸与身份。\n用户补充要求（如为空则忽略本行）：" },
  "fabric-swap:edit": { familyId: "fabric-swap", mode: "edit", text: "面料替换。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=服装，是唯一的服装来源与唯一的版型来源；参考图2=面料参考，是唯一的面料来源。\n保持参考图1的款式、版型、分割线、缝线位置、闭合方式、构图、姿态与光线完全不变，仅把服装面料替换为参考图2的纹理、织法、光泽与厚度。\n替换后的面料需按参考图1的褶皱走向与受力关系重新生成纹理，保留原有缝纫结构与五金件，不改变服装轮廓，不改变背景，不把面料参考图当成款式图。\n用户补充要求（如为空则忽略本行）：" },
  "sketch-to-garment:edit": { familyId: "sketch-to-garment", mode: "edit", text: "线稿成衣。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=线稿，是唯一的款式来源。\n严格按参考图1的线条结构生成成衣效果：轮廓、分割线、领型、袖型、衣长比例必须与线稿一一对应，不增删设计元素，不改成线稿里没有的款式。\n材质、颜色与工艺按正文描述填写；正文未指定时按线稿暗示的面料质感与中性配色处理。\n输出为单件服装的商品展示图（可穿在人台上，也可平铺或挂拍），不要生成与线稿无关的穿搭人物，不要改变线稿的款式结构。\n用户补充要求（如为空则忽略本行）：" },
  "ai-restyle:edit": { familyId: "ai-restyle", mode: "edit", text: "AI 改款。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=原服装，是唯一的版型来源。\n在保留参考图1版型骨架（肩线、衣长、腰位、袖型、领型比例）的前提下，按正文的改款指令修改局部设计：领型、袖型、长度、分割线、局部装饰或细节结构。\n改款结果保持面料原有质感与色彩体系，除非正文明确要求换色；不改动未提及的部位，不改变整体风格走向，不在图上添加文字、Logo 或水印。\n用户补充要求（如为空则忽略本行）：" },
  "person-to-mannequin:edit": { familyId: "person-to-mannequin", mode: "edit", text: "真人转人台。严格按参考图序号使用输入图片，不得跨图挪用：参考图1=真人着装图，是唯一的服装来源。\n把参考图1的服装转移到无头人台上：完全去除真人特征，不保留人脸、头发、皮肤、手指、表情或真人身体轮廓。\n人台为米白或浅灰的中性色服装展示用模型（半身或全身人台），服装穿在人台上需保留原图的版型、颜色、花型、面料质感、褶皱走向与五金细节。\n背景为干净的影棚纯色背景，光线均匀；不添加真人、不添加文字或水印。\n用户补充要求（如为空则忽略本行）：" },
};

/**
 * variantId 格式：`${familyId}.${modelId}.${mode}.v1`
 * familyId: 小写字母+连字符；modelId: 小写字母/数字/点/连字符；mode: generate | edit | mask-edit
 */
const VARIANT_ID_PATTERN = /^([a-z-]+)\.([a-z0-9.-]+)\.(generate|edit|mask-edit)\.v1$/;

/**
 * 按 variantId 解析冻结预设绑定（v8→v9 迁移消费）。
 * 未知 familyId / mode / 格式 → undefined（调用方丢弃绑定，fail-closed 不猜）。
 */
export function frozenPromptBindingForVariantId(variantId: string): FrozenPromptBinding | undefined {
  const match = VARIANT_ID_PATTERN.exec(variantId);
  if (!match) return undefined;
  return FROZEN_PROMPT_BINDING_MAP[`${match[1]}:${match[3]}`];
}

/** 取某 family+mode 的冻结 prompt 正文；无对应项返回 undefined。 */
export function frozenPromptText(familyId: string, mode: ImageOperationMode): string | undefined {
  return FROZEN_PROMPT_BINDING_MAP[`${familyId}:${mode}`]?.text;
}

/** 全量族列表（与服务端 FROZEN_PRESET_FAMILY_IDS 同序同值）。 */
export const FROZEN_PROMPT_FAMILY_IDS = [
  "fashion-lookbook",
  "upscale",
  "print-extract",
  "print-mutate",
  "fabric-recolor",
  "mask-local-edit",
  "video-animate",
  "video-runway",
  "video-xhs",
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

/** 冻结表条目数。 */
export const FROZEN_PROMPT_ENTRY_COUNT = Object.keys(FROZEN_PROMPT_BINDING_MAP).length;
