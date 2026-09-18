import { imageModelContractHash, type ImageModelId } from "../types/imageModels";
import type { NodeKind } from "../types/workflow";

/**
 * awesome-gpt-image-2 只为这三个任务族提供分类、标签和提示词编写方法。
 * 运行时文本是下方按模型与操作模式明确编写的独立变体，不读取社区模板作为回退。
 */
export type GarmentPromptPresetId = "fashion-lookbook" | "commerce-hero" | "design-sheet";
export type GarmentPromptFamilyId = GarmentPromptPresetId | "mask-local-edit";
export type PromptOperationMode = "generate" | "edit" | "mask-edit";
export type PromptSupportStatus = "unsupported" | "unverified" | "experimental" | "verified" | "recommended";

export interface GarmentPromptPreset {
  id: GarmentPromptPresetId;
  name: string;
  description: string;
  templateName: string;
  exampleCaseIds: readonly number[];
  aspectRatio: "1:1" | "3:4" | "4:3";
}

export interface PromptVariant {
  variantId: string;
  familyId: GarmentPromptFamilyId;
  modelId: ImageModelId;
  nodeKind: NodeKind;
  mode: PromptOperationMode;
  promptLocale: "zh-CN";
  fullPrompt: string;
  parameterProfileId: string;
  supportStatus: PromptSupportStatus;
  contractHash: `sha256:${string}`;
  evaluationVersion: string;
  statusReason: string;
}

export interface PromptVariantQuery {
  familyId: GarmentPromptFamilyId;
  modelId: ImageModelId;
  nodeKind: NodeKind;
  mode: PromptOperationMode;
}

export interface PromptVariantAvailability {
  enabled: boolean;
  reason: string;
  variant?: PromptVariant;
}

const DEFAULT_INTENT = "【请填写服装品类、款式、颜色、面料和目标人群】";
const EVALUATION_VERSION = "garment-eval-v2-pending";
const UNVERIFIED_REASON = "该模型×任务族×操作模式尚未完成当前契约版本的真实评估，普通用户不可启用。";

export const GARMENT_PROMPT_PRESETS: readonly GarmentPromptPreset[] = [
  {
    id: "fashion-lookbook",
    name: "写实穿搭",
    description: "适合真人 Lookbook、街拍与品牌型录",
    templateName: "Realistic Photography / 写实摄影",
    exampleCaseIds: [377],
    aspectRatio: "3:4",
  },
  {
    id: "commerce-hero",
    name: "电商主图",
    description: "适合服装商品首图与卖点展示",
    templateName: "Product Commerce Visual / 商品商业视觉",
    exampleCaseIds: [373, 358],
    aspectRatio: "1:1",
  },
  {
    id: "design-sheet",
    name: "服装设定表",
    description: "适合款式拆解、正背面与细节说明",
    templateName: "Character Design Sheet / 角色设定表",
    exampleCaseIds: [347],
    aspectRatio: "4:3",
  },
] as const;

const STANDARD_MODEL_IDS = [
  "gpt-image-2.5-flare-vip",
  "gemini-3.1-flash-image",
  "flux-2-pro",
  "seedream-5-0-260128",
] as const;
type StandardModelId = (typeof STANDARD_MODEL_IDS)[number];
type StandardPromptSet = Record<GarmentPromptPresetId, Record<"generate" | "edit", string>>;

/** 每个叶子都是完整可发送提示词；这里不存在跨模型 base prompt。 */
const MODEL_PROMPTS: Record<StandardModelId, StandardPromptSet> = {
  "gpt-image-2.5-flare-vip": {
    "fashion-lookbook": {
      generate: `GPT Image 2 VIP 写实穿搭生成。创建单人全身 3:4 品牌 Lookbook：平视机位、中远景、约 50mm 视角，人物完整入镜、主体居中并留呼吸空间；动作自然，可有轻微行走或衣摆运动，但不得摆拍僵硬。
精确呈现指定服装的版型、颜色、分割线、图案、缝线、褶皱、垂坠与真实面料；柔和自然光，克制中性背景，真实肤质和可信的小瑕疵。
不生成文字、Logo、水印、多余人物、随机配饰、错误肢体或服装结构变形，不裁切手脚，不使用过度磨皮或塑料质感。`,
      edit: `GPT Image 2 VIP 多图写实穿搭编辑。严格按请求中“图1、图2……”的序号及 identity、pose_composition、garment_top、garment_bottom、garment_full、fabric、accessory、styling_only、background 角色使用每张图，不得跨角色挪用身份或服装。
将指定服装穿到 identity 模特身上，按 pose_composition 设置平视机位、中远景、约 50mm 视角、姿势与取景；忠实保留模特特征、服装版型、花型、材质和穿搭层级，动作与衣摆运动方向可信。
输出 3:4 单人全身时装 Lookbook；除明确指定的穿搭替换外，脸部、发型、肤色、身材、姿势、背景和非目标区域不变，无文字、Logo、水印、僵硬手势或过度磨皮。`,
    },
    "commerce-hero": {
      generate: `GPT Image 2 VIP 服装电商主图生成。仅展示一件指定服装，正面或指定角度完整居中，占 1:1 画面约 75%，保留裁切安全区。
准确还原颜色、版型、图案位置、面料、缝线、闭合方式和五金；卖点只通过轮廓、材质、工艺细节、受控高光与柔和高端棚拍光表达，纯净背景与干净阴影。
无价格、促销文字、Logo、水印、模特、随机道具、衣架残影、色偏、图案篡改或虚构零件。`,
      edit: `GPT Image 2 VIP 多图服装电商主图编辑。按“图1、图2……”及 garment_full、garment_top、garment_bottom、fabric、accessory、background 标注使用参考，顺序不可改写，不融合不同商品的结构。
将主服装转换成 1:1 独立电商首图，完整居中约 75%，保留原商品轮廓、比例、颜色、图案、面料、缝线和五金；卖点只通过轮廓、材质、工艺和受控光线表达，仅执行明确的背景或视角变更。
使用棚拍柔光和干净阴影；无身份串用、额外道具、文字、价格、Logo、水印或商品细节臆造。`,
    },
    "design-sheet": {
      generate: `GPT Image 2 VIP 服装设定表生成。先锁定同一套服装的身份锚点：品类、版型、配色、领口、袖型、口袋、闭合方式和图案位置；在 4:3 横向浅色画布中排列正面、背面、侧面 3 个主视图和 2–3 个工艺细节放大框，视图对齐、比例统一、互不遮挡。
所有视图保持同一版型、配色、分割线、领口、袖型、口袋、闭合方式、图案位置和面料；专业设计图与写实材质结合。
仅使用简短可读中文部位标签；无 Logo、水印、长文、乱码、透视混乱或装饰拼贴。`,
      edit: `GPT Image 2 VIP 多图服装设定表编辑。依照“图1、图2……”及 garment_full、garment_top、garment_bottom、fabric、accessory 标注解读，材质图不得当成款式图，配饰不得变成服装主体。
把同一套服装按身份锚点整理为 4:3 正、背、侧 3 个主视图和 2–3 个细节框，还原比例、版型、颜色、分割线、缝线、闭合件、图案与材质，非目标细节不变。
输出视图对齐的浅色设定表和简短中文标签；无 Logo、水印、长文、乱码或视图间结构漂移。`,
    },
  },
  "gemini-3.1-flash-image": {
    "fashion-lookbook": {
      generate: `Gemini 3.1 Flash Image 写实穿搭生成。先理解人物、服装、姿势、构图和背景要求，再以平视机位、中远景、约 50mm 视角创建单人全身 3:4 Lookbook；人物完整入镜、姿态自然、主体居中，可有轻微行走或衣摆运动。
准确呈现服装版型、图案、面料纹理、褶皱和垂坠，柔和自然光，中性简洁背景，真实肤质和可信的小瑕疵。
无文字、Logo、水印、多余人物、随机配饰、错误肢体或服装结构变形，手脚不裁切，不使用过度磨皮。`,
      edit: `Gemini 3.1 Flash Image 多图写实穿搭编辑。逐图建立序号与 identity、pose_composition、garment_top、garment_bottom、garment_full、fabric、accessory、styling_only、background 的明确映射；每张图只提供已标注的角色。
将服装穿到 identity 模特身上，仅使用 pose_composition 的平视机位、中远景、约 50mm 视角、姿势与取景，仅使用 styling_only 的穿搭原则，忠实保留模特特征、服装版型、花型、材质和层级，动作与衣摆运动方向可信。
输出 3:4 单人全身 Lookbook；非目标区域不变，无身份串用、文字、Logo、水印、多余人物或随机配饰，不出现僵硬手势或过度磨皮。`,
    },
    "commerce-hero": {
      generate: `Gemini 3.1 Flash Image 服装电商主图生成。把需求解析为商品、视角、背景和光线，生成 1:1 单商品主图：服装完整居中，占画面约 75%，留裁切安全区。
准确呈现颜色、版型、图案、面料、缝线、纽扣和五金，不补全未描述卖点；卖点只通过轮廓、材质、工艺细节、受控高光、高端棚拍柔光和干净阴影表达，使用统一背景。
无价格、促销文字、Logo、水印、模特、随机道具、衣架残影、色偏或结构臆造。`,
      edit: `Gemini 3.1 Flash Image 多图电商主图编辑。根据序号逐图识别 garment_full、garment_top、garment_bottom、fabric、accessory、background，每张图只提供其标注角色，不带入未标注的人物或环境。
把服装变成 1:1 独立电商主图，保留轮廓、比例、颜色、图案位置、面料、缝线和五金；卖点只通过轮廓、材质、工艺和受控光线表达，只改变明确要求的背景、光线或视角。
商品居中约 75%，留裁切安全区；无身份串用、道具、文字、价格、Logo、水印或商品细节漂移。`,
    },
    "design-sheet": {
      generate: `Gemini 3.1 Flash Image 服装设定表生成。先锁定同一服装的身份锚点：品类、版型、配色、领口、袖型、口袋、闭合方式和图案位置；把需求拆成多视图，在 4:3 横向浅色画布中排列正面、背面、侧面 3 个主视图和 2–3 个工艺放大框，视图对齐、比例统一、互不遮挡。
所有视图的版型、配色、分割线、领口、袖型、口袋、闭合方式、图案位置和面料必须一致；专业设计图与写实材质结合。
仅使用简短可读的中文部位标签；无 Logo、水印、长文、乱码、透视混乱或装饰性拼贴。`,
      edit: `Gemini 3.1 Flash Image 多图服装设定表编辑。将图片序号与 garment_full、garment_top、garment_bottom、fabric、accessory 一一映射；材质图只提供肌理，配饰图只提供配饰，不改写主服装结构。
把同一套服装按身份锚点整理为 4:3 正、背、侧 3 个主视图和 2–3 个细节框，还原比例、版型、颜色、分割线、缝线、闭合件、图案与材质，非目标细节不变。
输出视图对齐的浅色设定表和简短中文标签；无 Logo、水印、乱码或结构漂移。`,
    },
  },
  "flux-2-pro": {
    "fashion-lookbook": {
      generate: `FLUX.2 Pro 写实穿搭生成。优先级：1. 服装版型、颜色、图案和材质；2. 单人全身与手脚完整；3. 平视机位、中远景、约 50mm 视角的 3:4 Lookbook 构图；4. 高级时装型录光影。
一位成年模特自然站立或轻微行走，居中并留呼吸空间，服装轮廓无遮挡且动作与衣摆运动可信；真实织物、缝线、褶皱和垂坠，柔和自然光，中性背景，准确颜色与肤质。
成片干净专业，无文字、Logo、水印、多余人物、随机配饰、错误肢体、结构变形或过度磨皮。`,
      edit: `FLUX.2 Pro 多图写实服装穿搭编辑融合。优先级：1. identity 模特身份；2. garment_top、garment_bottom 或 garment_full 结构；3. pose_composition 姿势与取景；4. fabric、accessory、styling_only、background 的限定信息。
严格按图片序号和角色标注使用，各图信息不互换，styling_only 只提供穿搭方式。结果为平视机位、中远景、约 50mm 视角的 3:4 单人全身 Lookbook，身份、版型、花型、材质、穿搭层级和姿势稳定，动作与衣摆运动可信。
除明确替换外，脸部、发型、肤色、身材、背景和非目标区域不变；无文字、Logo、水印或多余元素。`,
    },
    "commerce-hero": {
      generate: `FLUX.2 Pro 电商主图生成。优先级：1. 商品轮廓、比例、颜色、图案和工艺；2. 单商品完整居中；3. 1:1 安全构图；4. 干净高端棚拍光。
仅一件服装，正面或指定角度，占画面约 75%，边缘完整；卖点只通过商品轮廓、真实面料、缝线、纽扣、五金、闭合方式、受控高光和干净阴影表达，使用纯净背景。
无模特、道具、文字、价格、Logo、水印、衣架残影、色偏、图案篡改或虚构零件。`,
      edit: `FLUX.2 Pro 多图电商主图编辑融合。优先级：1. garment_full 或 garment_top/garment_bottom 商品结构；2. fabric 纹理与颜色；3. accessory 限定配件；4. background 背景形式。
依图片序号与角色使用，不把材质图轮廓混入商品，不把配饰改成主服装。结果为 1:1 单商品高端主图，居中约 75%，留安全区；卖点只通过轮廓、材质、工艺和受控光线表达，使用棚拍柔光与干净阴影。
只执行明确变更，其余轮廓、比例、颜色、图案、缝线和五金不变；无文字、价格、Logo 或水印。`,
    },
    "design-sheet": {
      generate: `FLUX.2 Pro 服装设定表生成。优先级：1. 同一服装的身份锚点在全部视图一致；2. 正、背、侧 3 个主视图的比例和对齐；3. 2–3 个工艺细节框；4. 4:3 专业设计表版式。
浅色横向画布，正、背、侧视图及 2–3 个细节框互不遮挡；版型、配色、分割线、领口、袖型、口袋、闭合方式、图案和面料在所有视图相同。
专业服装设计线稿结合写实材质，简短中文标签，无 Logo、水印、长文、乱码、透视混乱或装饰拼贴。`,
      edit: `FLUX.2 Pro 多图服装设定表编辑融合。优先级：1. garment_full 或 garment_top/garment_bottom 结构；2. 全部视图一致；3. fabric 和 accessory 只影响已标注属性；4. 对齐与细节框。
按图片序号和角色使用，不将材质轮廓或配饰结构写入主服装。产出 4:3 正、背、侧视图及 2–3 个工艺框，还原比例、版型、配色、分割线、缝线、闭合件、图案和材质。
未指定的零件不变；浅色底，简短中文标签，无 Logo、水印、乱码或视图间结构漂移。`,
    },
  },
  "seedream-5-0-260128": {
    "fashion-lookbook": {
      generate: `Seedream 5.0 写实穿搭生成。以平视机位、中远景、约 50mm 视角生成单人全身 3:4 Lookbook，人物从头到脚完整入镜，姿态自然，可有轻微行走或衣摆运动，居中并留呼吸空间。
准确呈现指定品类、版型、颜色、分割线、图案和材质，织物肌理、缝线、褶皱和垂坠真实清晰；柔和自然光、中性背景、高级型录风格和可信的小瑕疵。
无文字、Logo、水印、额外人物、随机配饰、错误肢体或服装结构变形，手脚不裁切，不使用过度磨皮。`,
      edit: `Seedream 5.0 多图写实穿搭编辑。参考图输入顺序就是解析顺序，必须与序号及角色标注一致：identity 仅供身份，pose_composition 仅供姿势与构图，garment_* 仅供服装，fabric 仅供材质，styling_only 仅供穿搭方式。
忠实还原服装版型、比例、领口、袖型、腰头、裤型、图案、缝线、材质和穿搭层级，不互换上下装；使用平视机位、中远景、约 50mm 视角，保持动作与衣摆运动可信。
输出 3:4 单人全身 Lookbook；除明确替换外，脸部、发型、肤色、身材、姿势、取景、背景和非目标区域不变；无文字、Logo、水印或额外元素。`,
    },
    "commerce-hero": {
      generate: `Seedream 5.0 电商主图生成。生成 1:1 单商品高清主图，仅一件指定服装，正面或指定角度完整居中，占画面约 75%，四周留裁切安全区。
服装轮廓、比例、颜色、领口、袖型、图案位置、面料、缝线、闭合件和五金准确一致；卖点只通过轮廓、材质、工艺、受控高光、高端棚拍柔光、纯净背景和干净阴影表达。
无价格、促销文字、Logo、水印、模特、道具、衣架残影、颜色漂移、图案篡改或额外零件。`,
      edit: `Seedream 5.0 多图电商主图编辑。严格按输入顺序和标注解析 garment_full、garment_top、garment_bottom、fabric、accessory、background，顺序不可重排，材质图不提供商品轮廓。
执行指定视角、背景或材质变更；卖点只通过轮廓、材质、工艺和受控光线表达；未指定的轮廓、比例、颜色、图案、缝线、闭合件和五金全部不变。
输出 1:1 单商品主图，居中约 75%，留安全区，棚拍柔光和干净阴影；无文字、价格、Logo、水印、道具或细节漂移。`,
    },
    "design-sheet": {
      generate: `Seedream 5.0 服装设定表生成。先锁定同一套服装的身份锚点：品类、版型、配色、领口、袖型、口袋、闭合方式和图案位置；在 4:3 横向浅色画布中排列正面、背面、侧面 3 个主视图和 2–3 个工艺放大框，视图对齐、比例统一、互不遮挡。
每个视图的版型、配色、分割线、领口、袖型、口袋、闭合方式、图案位置、面料和工艺必须严格一致；专业设计线稿与写实材质结合。
仅有简短可读中文部位标签；无 Logo、水印、长文、乱码、透视混乱或装饰拼贴。`,
      edit: `Seedream 5.0 多图服装设定表编辑。按输入顺序逐图解析 garment_full、garment_top、garment_bottom、fabric、accessory，每张图只提供已标注的属性。
将同一套服装按身份锚点转换为 4:3 正、背、侧 3 个主视图和 2–3 个工艺框，严格保留原始比例、版型、配色、分割线、缝线、闭合件、图案和材质。
未说明的细节不变，多视图间不增删零件、不互换上下装；无 Logo、水印、乱码或结构漂移。`,
    },
  },
};

function makeStandardVariants(): PromptVariant[] {
  const variants: PromptVariant[] = [];
  for (const modelId of STANDARD_MODEL_IDS) {
    for (const preset of GARMENT_PROMPT_PRESETS) {
      for (const mode of ["generate", "edit"] as const) {
        variants.push({
          variantId: `${preset.id}.${modelId}.${mode}.v1`,
          familyId: preset.id,
          modelId,
          nodeKind: mode === "generate" ? "sketch-to-render" : "ai-modify",
          mode,
          promptLocale: "zh-CN",
          fullPrompt: MODEL_PROMPTS[modelId][preset.id][mode],
          parameterProfileId: `${modelId}:${preset.id}:${mode}:v1`,
          supportStatus: "unverified",
          contractHash: imageModelContractHash(modelId),
          evaluationVersion: EVALUATION_VERSION,
          statusReason: UNVERIFIED_REASON,
        });
      }
    }
  }
  return variants;
}

const GPT_IMAGE_2_MASK_VARIANT: PromptVariant = {
  variantId: "mask-local-edit.gpt-image-2.5-sunburst.mask-edit.v1",
  familyId: "mask-local-edit",
  modelId: "gpt-image-2.5-sunburst",
  nodeKind: "mask-redraw",
  mode: "mask-edit",
  promptLocale: "zh-CN",
  fullPrompt: `GPT Image 2 服装局部修改。仅编辑 Alpha PNG 蒙版标记的可编辑区域，执行指定的局部替换、改款或清除；先移除旧物件边缘、阴影和残影，再生成新结构。
新内容与相邻服装的版型、面料、缝线、图案、光线、透视和褶皱自然融合，蒙版边界不出现光晕、硬边、重影或纹理断裂。
输出与源图同尺寸、同画幅和同构图。蒙版之外的像素是受保护的非目标区域：人物身份、脸部、发型、肤色、身材、姿势、未选中服装、配饰、背景和画幅完全不变；不扩大语义修改目标，不新增装饰、文字、Logo 或水印。`,
  parameterProfileId: "gpt-image-2.5-sunburst:mask-local-edit:mask-edit:v1",
  supportStatus: "unverified",
  contractHash: imageModelContractHash("gpt-image-2.5-sunburst"),
  evaluationVersion: EVALUATION_VERSION,
  statusReason: UNVERIFIED_REASON,
};

export const GARMENT_PROMPT_VARIANTS: readonly PromptVariant[] = [
  ...makeStandardVariants(),
  GPT_IMAGE_2_MASK_VARIANT,
] as const;

const variantById = new Map(GARMENT_PROMPT_VARIANTS.map((variant) => [variant.variantId, variant]));
const queryKey = (query: PromptVariantQuery) => `${query.familyId}\u0000${query.modelId}\u0000${query.nodeKind}\u0000${query.mode}`;
const variantByQuery = new Map(GARMENT_PROMPT_VARIANTS.map((variant) => [queryKey(variant), variant]));

if (variantById.size !== GARMENT_PROMPT_VARIANTS.length || variantByQuery.size !== GARMENT_PROMPT_VARIANTS.length) {
  throw new Error("服装提示词目录存在重复的变体 ID 或查询组合");
}

export function listGarmentPromptVariants(filter: Partial<PromptVariantQuery> = {}): readonly PromptVariant[] {
  return GARMENT_PROMPT_VARIANTS.filter((variant) =>
    (filter.familyId === undefined || variant.familyId === filter.familyId)
    && (filter.modelId === undefined || variant.modelId === filter.modelId)
    && (filter.nodeKind === undefined || variant.nodeKind === filter.nodeKind)
    && (filter.mode === undefined || variant.mode === filter.mode));
}

/** 只返回完全匹配的变体，绝不回退到其他模型、节点或模式。 */
export function getGarmentPromptVariant(query: PromptVariantQuery): PromptVariant | undefined {
  return variantByQuery.get(queryKey(query));
}

export function getGarmentPromptVariantById(variantId: string): PromptVariant | undefined {
  return variantById.get(variantId);
}

export function requireGarmentPromptVariant(query: PromptVariantQuery): PromptVariant {
  const variant = getGarmentPromptVariant(query);
  if (!variant) throw new Error(`不支持的服装提示词组合: ${JSON.stringify(query)}`);
  return variant;
}

function extractPreservedIntent(intent: string): string {
  const generatedLines = new Set(
    GARMENT_PROMPT_VARIANTS.flatMap((variant) => variant.fullPrompt.split("\n").map((line) => line.trim())),
  );
  return intent
    .split("\n")
    .map((line) => line.startsWith("主题与任务：") ? line.slice("主题与任务：".length) : line)
    .filter((line) => !line.startsWith("提示词变体："))
    .filter((line) => !generatedLines.has(line.trim()))
    .join("\n")
    .trim() || DEFAULT_INTENT;
}

export function buildGarmentPrompt(variantId: string, intent: string): string {
  const variant = getGarmentPromptVariantById(variantId);
  if (!variant) throw new Error(`未知服装提示词变体: ${variantId}`);
  return [
    `主题与任务：${extractPreservedIntent(intent)}`,
    `提示词变体：${variant.variantId}`,
    variant.fullPrompt,
  ].join("\n");
}

export function buildGarmentPromptFor(query: PromptVariantQuery, intent: string): string {
  return buildGarmentPrompt(requireGarmentPromptVariant(query).variantId, intent);
}
