export const IMAGE_OPERATION_MODE_VALUES = ["generate", "edit", "mask-edit"] as const;

export type ImageOperationMode = (typeof IMAGE_OPERATION_MODE_VALUES)[number];
