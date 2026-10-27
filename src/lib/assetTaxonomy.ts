import type { Asset } from "@/types/workflow";

/**
 * 资产库两级分类（单一事实源；AssetPickerOverlay 消费）。
 *
 * 一级：服装设计 / 模特换装 / 视频生成 / 历史素材（无「全部」）。
 * 二级即素材真实 category；历史素材是 files 表的本地上传（source_type='upload'），
 * 不是 assets 行，用伪叶子 "history" 表示。
 * 全部列表统一按 createdAt 倒序（日期越新越靠前）。
 */

export type AssetLevel1Id = "design" | "tryon" | "video" | "history";

export const ASSET_LEVEL1: ReadonlyArray<{ id: AssetLevel1Id; label: string }> = [
  { id: "design", label: "服装设计" },
  { id: "tryon", label: "模特换装" },
  { id: "video", label: "视频生成" },
  { id: "history", label: "历史素材" },
];

/** 二级叶子：真实 category；历史素材用 "history"（files 来源）。 */
export type AssetLeafId = Asset["category"] | "history";

export const ASSET_LEVEL2: Record<AssetLevel1Id, ReadonlyArray<{ id: AssetLeafId; label: string }>> = {
  design: [
    { id: "print", label: "印花" },
    { id: "fabric", label: "面料" },
    { id: "colorcard", label: "色卡" },
    { id: "sketch", label: "线稿" },
  ],
  tryon: [
    { id: "model", label: "数字模特" },
    { id: "garment", label: "服装" },
    { id: "accessory", label: "配饰" },
    { id: "pose", label: "动作" },
    { id: "background", label: "背景" },
  ],
  video: [
    { id: "refvideo", label: "参考视频" },
    { id: "audio", label: "语音" },
  ],
  history: [],
};

export const ASSET_LEAF_LABEL: Record<AssetLeafId, string> = {
  print: "印花",
  fabric: "面料",
  colorcard: "色卡",
  sketch: "线稿",
  model: "数字模特",
  garment: "服装",
  accessory: "配饰",
  pose: "动作",
  background: "背景",
  refvideo: "参考视频",
  audio: "语音",
  history: "历史素材",
};

export const ASSET_EMPTY_HINT: Record<AssetLeafId, string> = {
  print: "暂无印花素材，可在印花提取节点中「存为素材」",
  fabric: "暂无面料素材",
  colorcard: "暂无色卡素材",
  sketch: "暂无线稿素材",
  model: "暂无数字模特，可在图片查看器中「存入数字模特库」",
  garment: "暂无服装素材，可在图片查看器中「收藏为资产」",
  accessory: "暂无配饰素材",
  pose: "暂无动作素材",
  background: "暂无背景素材",
  refvideo: "暂无参考视频",
  audio: "暂无语音",
  history: "暂无本地上传，可在图片节点上传图片",
};

/** 真实 category 反查一级（预选定位用）；history 叶子直属 history 一级。 */
export function level1OfLeaf(leaf: AssetLeafId): AssetLevel1Id {
  if (leaf === "history") return "history";
  for (const l1 of ASSET_LEVEL1) {
    if (ASSET_LEVEL2[l1.id].some((leaf2) => leaf2.id === leaf)) return l1.id;
  }
  return "design";
}

/** 旧 initialCategory（含 "all"）归一化到叶子；未知值落到印花。 */
export function normalizeLeaf(value: string | undefined): AssetLeafId {
  if (value === "history") return "history";
  for (const l1 of ASSET_LEVEL1) {
    const found = ASSET_LEVEL2[l1.id].find((leaf) => leaf.id === value);
    if (found) return found.id;
  }
  return "print";
}
