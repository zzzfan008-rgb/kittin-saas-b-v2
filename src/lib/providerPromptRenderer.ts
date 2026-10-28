import type {
  ImageOperationMode,
  NodeKind,
} from "../types/workflow";
import type { ImageModelId } from "../types/imageModels";

/**
 * Provider 提示词渲染：把用户意图扩写成上游能照做的完整指令。
 *
 * 只做两件有实际产出的事：
 *  ① 蒙版局部修改：把「改成红色」扩写成带红色/金色区域语义的完整模板；
 *  ② 参考图清单：在 prompt 末尾追加「参考图:参考图1、参考图2」。
 *
 * 2026-10-28 简化（用户决定 B）：原先「9 模型 × 模式」的引导语矩阵每一个格子
 * 都是同一个字符串，却会在遇到表外组合时抛 "does not support X/Y" 假故障
 * （sunburst 的生成报错正源于此）。引导语只取决于模式、与模型无关，故收敛为
 * 一行判断；同时删除 version / hash 两个常量——它们只被测试读取，不改运行时行为。
 */

/** 参考图引导语：只有蒙版局部修改需要区分措辞，其余统一。 */
function referenceListIntro(mode: ImageOperationMode): string {
  return mode === "mask-edit" ? "局部修改参考图:" : "参考图:";
}

/** 蒙版区域角色说明，按用户参考图数量分三档。 */
const MASK_REFERENCE_TEMPLATES = {
  single: "参考图1是完整原图；最后一张参考图（参考图2）是区域引导图",
  two: "参考图1是完整原图；参考图2是用户提供的目标内容参考图，用户提示词中的图号始终对应这些用户参考图；最后一张参考图（参考图{{GUIDE_INDEX}}）才是区域引导图",
  many: "参考图1是完整原图；参考图2至参考图{{USER_COUNT}}是用户提供的目标内容参考图，用户提示词中的图号始终对应这些用户参考图；最后一张参考图（参考图{{GUIDE_INDEX}}）才是区域引导图",
} as const;

const MASK_PROMPT_TEMPLATE = "目标修改：{{TARGET}}。{{MASK_REFERENCE_ROLES}}，其中红色表示用户涂抹的修改核心，红色已完全遮住旧内容，只用于表达位置；金色表示仅供完整轮廓延展和边缘融合的缓冲区；两者都是修改范围，不是裁切框。请根据用户说明在红色核心内添加、替换、删除或调整内容。凡用户要求替换、删除或改变既有对象时，必须先彻底清除与目标冲突的旧对象、旧包带、旧颜色、旧阴影、旧反光、旧纹理和残留边线，再依据周围连续的面料纹理、颜色、褶皱、缝线和光照完整重建被遮挡的底层服装或背景，然后放入新内容；禁止用模糊、暗斑、色块、漂浮投影或半透明残影遮盖清理区域。只有与新内容真实接触并符合整幅画面光源方向的阴影才可保留。不需要修改的服装结构、面料纹理和光影必须保持。结合整幅画面的构图、服装比例和视觉重量，新内容默认继承目标区域的中心位置与近似占位，除非用户明确要求，不得明显放大、缩小或偏移。只有完整轮廓、褶皱、缝线、阴影、反光和自然遮挡所必需的部分可以进入金色缓冲区，不得沿红色边缘截断，也不得覆盖缓冲区内的文字、独立图案、配饰或其他服装结构。交接处必须匹配原图的面料材质、纹理方向、褶皱、光影、透视、遮挡和清晰度，不得出现重影、透色、硬边或颜色污染。返回与整幅画面同尺寸、同坐标的 PNG 完整最终图片；修改范围以外的画面保持原状。";

const SEPARATOR = "\n";

export interface ProviderPromptReference {
  /** 占位：参考图顺序已由数组位置决定，不再需要角色字段。 */
  readonly _?: never;
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
export function renderProviderPrompt(input: ProviderPromptRenderInput): string {
  const rawTaskPrompt = input.taskPrompt.trim();
  if (!rawTaskPrompt) {
    if (input.needsMask) throw new Error("局部修改必须填写修改说明");
    throw new Error(`节点 ${input.nodeKind} 没有可发送的提示词`);
  }
  let taskPrompt = rawTaskPrompt;
  if (input.needsMask) {
    taskPrompt = interpolate(MASK_PROMPT_TEMPLATE, {
      TARGET: rawTaskPrompt,
      MASK_REFERENCE_ROLES: maskReferenceRolePrompt(input.references.length),
    });
  }
  if (input.references.length > 0) {
    const list = input.references.map((_reference, index) => `参考图${index + 1}`).join("、");
    return `${taskPrompt}${SEPARATOR}${referenceListIntro(input.operationMode)}${list}`;
  }
  return taskPrompt;
}
