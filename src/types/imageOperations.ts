export const IMAGE_OPERATION_MODE_VALUES = ["generate", "edit", "mask-edit"] as const;

export type ImageOperationMode = (typeof IMAGE_OPERATION_MODE_VALUES)[number];

/** 生成节点可用的操作模式（mask-edit 仅图片节点蒙版重绘路径使用，不进生成节点 operationMode）。 */
export const GENERATOR_OPERATION_MODE_VALUES = ["generate", "edit"] as const;

export type GeneratorOperationMode = (typeof GENERATOR_OPERATION_MODE_VALUES)[number];
