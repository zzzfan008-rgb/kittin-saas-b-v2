import type { DocumentTarget } from "@/store/flowStore";
import type { Asset } from "@/types/workflow";

export const OPEN_COMPARE_EVENT = "garment:open-compare";
export const OPEN_ASSET_PICKER_EVENT = "garment:open-asset-picker";

/** 空工作区引导「打开项目」→ 打开项目中心（ProjectTabs 宿主）。 */
export const OPEN_PROJECT_CENTER_EVENT = "garment:open-project-center";

/** 资产选择器的分类过滤值：素材分类本身 + 「全部」。 */
export type AssetPickerCategory = Asset["category"] | "all";

export interface AssetPickerRequest {
  target: DocumentTarget;
  nodeId: string;
  /**
   * 打开时预选的分类。调用方显式给出时优先；缺省由节点 id 的映射提示推导
   * （`assetPickerCategoryForNode`，见 asset-library-model.md §6）。
   */
  initialCategory?: AssetPickerCategory;
}
