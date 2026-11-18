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
import { isVideoModelId, videoModelRecommendedOptions } from "@/types/videoModels";

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

/**
 * 视频版参数值域提取（2026-11-18）。
 *
 * 背景：GeneratorParamsPanel 的 `paramOpts` 原先只对图片调用 paramsFromContract，
 * 视频恒为 `{}`，导致 `ParamControl options={paramOpts[k] ?? []}` 永远拿到空数组 ——
 * 时长、分辨率等参数**渲染出来但没有任何可选项**（用户反馈「视频参数无法选择」）。
 *
 * 与图片版的差异：视频契约没有顶层数组映射（CONTRACT_ARRAY_KEYS 那套是图片专属），
 * 值域只来自 `recommendedOptions[key].examples`；画幅键 `ratio` 由独立下拉承载，跳过。
 * 单值参数（examples 长度为 1）也会返回，由 UI 决定是否展示为只读档。
 */
export function videoParamsFromContract(modelId: string): Record<string, ParamOption[]> {
  if (!isVideoModelId(modelId)) return {};
  const recommended = videoModelRecommendedOptions(modelId);
  const result: Record<string, ParamOption[]> = {};
  for (const [key, spec] of Object.entries(recommended)) {
    if (key === "ratio" || key === "aspectRatio") continue; // 画幅走独立下拉
    const examples = spec?.examples;
    result[key] = Array.isArray(examples) && examples.length > 0
      ? examples.map((v) => ({ value: v, label: String(v) }))
      : [];
  }
  return result;
}
