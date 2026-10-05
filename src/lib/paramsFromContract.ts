/**
 * 65b D3+Q2：从模型契约提取参数下拉值域。
 *
 * 优先级：recommendedOptions[key].examples → 契约顶层数组映射。
 * 顶层数组映射（imageModels.ts:294-301 已有示例参考）：
 *   - aspectRatio: contract.aspectRatios
 *   - size: contract.sizes
 *   - imageSize: contract.imageSizes
 *   - quality: contract.qualityValues
 *   - outputFormat: contract.outputFormats
 *   - seconds/resolution/seed 等无顶层数组 → examples only
 */
import { getImageModelContract, isImageModelId, type ImageModelContract } from "@/types/imageModels";

export interface ParamOption {
  value: string | number | boolean;
  label?: string;
  disabled?: boolean;
}

/** 契约顶层数组名到参数 key 的映射（值域回退逻辑）。 */
const CONTRACT_ARRAY_KEYS: Record<string, keyof ImageModelContract> = {
  aspectRatio: "aspectRatios",
  size: "sizes",
  imageSize: "imageSizes",
  quality: "qualityValues",
  outputFormat: "outputFormats",
};

/**
 * 从模型契约提取参数下拉选项。
 * 返回 `ParamKey → ParamOption[]` 映射（不含 aspectRatio——该字段走独立画幅下拉）。
 */
export function paramsFromContract(modelId: string): Record<string, ParamOption[]> {
  if (!isImageModelId(modelId)) return {};
  const contract = getImageModelContract(modelId);
  const recommended = contract.recommendedOptions ?? {};
  const result: Record<string, ParamOption[]> = {};

  for (const [key, spec] of Object.entries(recommended)) {
    if (key === "aspectRatio") continue; // aspectRatio 走独立下拉，不进入模型参数段
    let options: ParamOption[];
    if (spec.examples && spec.examples.length > 0) {
      options = spec.examples.map((v) => ({ value: v, label: String(v) }));
    } else {
      const arrayKey = CONTRACT_ARRAY_KEYS[key];
      if (arrayKey) {
        const rawValues = contract[arrayKey];
        if (Array.isArray(rawValues)) {
          options = rawValues.map((v: string | number | boolean) => ({ value: v, label: String(v) }));
        } else {
          options = [];
        }
      } else {
        options = [];
      }
    }
    result[key] = options;
  }

  return result;
}