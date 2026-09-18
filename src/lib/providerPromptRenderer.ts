import type { ImageModelId } from "../types/imageModels";
import type {
  ImageOperationMode,
  NodeKind,
} from "../types/workflow";

export const PROVIDER_PROMPT_RENDERER_VERSION = "provider-prompt-renderer-v4";

type ProviderPromptReferenceListIntroMatrix = {
  "gpt-image-2.5-sunburst": Record<"mask-edit", string>;
} & {
  [Model in Exclude<ImageModelId, "gpt-image-2.5-sunburst">]: Record<"generate" | "edit", string>;
};

/** Every supported model/mode pair has its own intro; there is no fallback. */
const PROVIDER_PROMPT_REFERENCE_LIST_INTROS = {
  "gpt-image-2.5-sunburst": {
    "mask-edit": "局部修改参考图:",
  },
  "gpt-image-2.5-all": {
    generate: "参考图:",
    edit: "参考图:",
  },
  "gpt-image-2.5-sunburst-vip": {
    generate: "参考图:",
    edit: "参考图:",
  },
  "gpt-image-2.5-flare-vip": {
    generate: "参考图:",
    edit: "参考图:",
  },
  "gemini-3-pro-image-preview": {
    generate: "参考图:",
    edit: "参考图:",
  },
  "gemini-3.1-flash-lite-image": {
    generate: "参考图:",
    edit: "参考图:",
  },
  "gemini-3.1-flash-image": {
    generate: "参考图:",
    edit: "参考图:",
  },
  "flux-2-pro": {
    generate: "参考图:",
    edit: "参考图:",
  },
  "seedream-5-0-260128": {
    generate: "参考图:",
    edit: "参考图:",
  },
} as const satisfies ProviderPromptReferenceListIntroMatrix;

/**
 * Semantic prompt-renderer contract. The reviewed release vector embeds this
 * value as well as its SHA-256 identity, so template drift changes
 * the vector even if a version bump is accidentally omitted.
 */
export const PROVIDER_PROMPT_RENDERER_CONTRACT = {
  version: PROVIDER_PROMPT_RENDERER_VERSION,
  separator: "\n",
  referenceListIntro: PROVIDER_PROMPT_REFERENCE_LIST_INTROS,
  maskReferenceTemplates: {
    single: "参考图1是完整原图；最后一张参考图（参考图2）是区域引导图",
    two: "参考图1是完整原图；参考图2是用户提供的目标内容参考图，用户提示词中的图号始终对应这些用户参考图；最后一张参考图（参考图{{GUIDE_INDEX}}）才是区域引导图",
    many: "参考图1是完整原图；参考图2至参考图{{USER_COUNT}}是用户提供的目标内容参考图，用户提示词中的图号始终对应这些用户参考图；最后一张参考图（参考图{{GUIDE_INDEX}}）才是区域引导图",
  },
  maskPromptTemplate: "目标修改：{{TARGET}}。{{MASK_REFERENCE_ROLES}}，其中红色表示用户涂抹的修改核心，红色已完全遮住旧内容，只用于表达位置；金色表示仅供完整轮廓延展和边缘融合的缓冲区；两者都是修改范围，不是裁切框。请根据用户说明在红色核心内添加、替换、删除或调整内容。凡用户要求替换、删除或改变既有对象时，必须先彻底清除与目标冲突的旧对象、旧包带、旧颜色、旧阴影、旧反光、旧纹理和残留边线，再依据周围连续的面料纹理、颜色、褶皱、缝线和光照完整重建被遮挡的底层服装或背景，然后放入新内容；禁止用模糊、暗斑、色块、漂浮投影或半透明残影遮盖清理区域。只有与新内容真实接触并符合整幅画面光源方向的阴影才可保留。不需要修改的服装结构、面料纹理和光影必须保持。结合整幅画面的构图、服装比例和视觉重量，新内容默认继承目标区域的中心位置与近似占位，除非用户明确要求，不得明显放大、缩小或偏移。只有完整轮廓、褶皱、缝线、阴影、反光和自然遮挡所必需的部分可以进入金色缓冲区，不得沿红色边缘截断，也不得覆盖缓冲区内的文字、独立图案、配饰或其他服装结构。交接处必须匹配原图的面料材质、纹理方向、褶皱、光影、透视、遮挡和清晰度，不得出现重影、透色、硬边或颜色污染。返回与整幅画面同尺寸、同坐标的 PNG 完整最终图片；修改范围以外的画面保持原状。",
} as const;

/** SHA-256(JSON.stringify(PROVIDER_PROMPT_RENDERER_CONTRACT)). */
export const PROVIDER_PROMPT_RENDERER_HASH = "sha256:3779508288c46b30ed6d1549aab041dcfe313f7f9ae9c88e9eda107d5fb8f3ca";

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
}

export function providerPromptRendererHashMaterial(): string {
  return JSON.stringify(PROVIDER_PROMPT_RENDERER_CONTRACT);
}

export function providerPromptRendererIdentity(): {
  version: string;
  hash: string;
} {
  return {
    version: PROVIDER_PROMPT_RENDERER_VERSION,
    hash: PROVIDER_PROMPT_RENDERER_HASH,
  };
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
    return PROVIDER_PROMPT_RENDERER_CONTRACT.maskReferenceTemplates.single;
  }
  const template = userReferenceCount === 2
    ? PROVIDER_PROMPT_RENDERER_CONTRACT.maskReferenceTemplates.two
    : PROVIDER_PROMPT_RENDERER_CONTRACT.maskReferenceTemplates.many;
  return interpolate(template, {
    GUIDE_INDEX: guideIndex,
    USER_COUNT: userReferenceCount,
  });
}

function providerPromptReferenceListIntro(
  modelId: ImageModelId,
  mode: ImageOperationMode,
): string {
  const modelIntros = PROVIDER_PROMPT_RENDERER_CONTRACT.referenceListIntro[modelId] as
    Partial<Record<ImageOperationMode, string>> | undefined;
  const intro = modelIntros?.[mode];
  if (!intro) {
    throw new Error(`Provider prompt renderer does not support ${modelId}/${mode}`);
  }
  return intro;
}

/**
 * The only renderer used to construct a Provider-bound garment prompt in both
 * ordinary and evaluation runs. It owns ordered reference list intros and the
 * mask wrapper; callers supply only the reviewed task prompt/user intent.
 */
export function renderProviderPrompt(input: ProviderPromptRenderInput): string {
  const rawTaskPrompt = input.taskPrompt.trim();
  if (!rawTaskPrompt) {
    if (input.nodeKind === "mask-redraw") throw new Error("局部修改必须填写修改说明");
    throw new Error(`节点 ${input.nodeKind} 没有可发送的提示词`);
  }
  let taskPrompt = rawTaskPrompt;
  if (input.nodeKind === "mask-redraw") {
    taskPrompt = interpolate(PROVIDER_PROMPT_RENDERER_CONTRACT.maskPromptTemplate, {
      TARGET: rawTaskPrompt,
      MASK_REFERENCE_ROLES: maskReferenceRolePrompt(input.references.length),
    });
  }
  if (input.references.length > 0) {
    const intro = providerPromptReferenceListIntro(input.modelId, input.operationMode);
    const list = input.references.map((_reference, index) => `参考图${index + 1}`).join("、");
    return `${taskPrompt}${PROVIDER_PROMPT_RENDERER_CONTRACT.separator}${intro}${list}`;
  }
  return taskPrompt;
}
