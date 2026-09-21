import type { Asset } from "@/types/workflow";

/**
 * 素材保存（POST /api/assets）的单一事实源。
 *
 * 分类与载荷形状只在这里定义：调用方（图片查看器「收藏为资产」/「存入数字模特库」、
 * 印花提取等）只传语义参数，不各自拼 body。
 * 契约锚点：`docs/design/2026-09-19-workbench-entry-wiring/asset-library-model.md` §1/§5。
 */

export interface SaveImageAssetInput {
  name: string;
  /** 目标素材库分类；数字模特库为 "model"。 */
  category: Asset["category"];
  /** 图片 URL（/api/files/xxx）。 */
  image: string;
  sourceNote?: string;
}

/** POST /api/assets 的请求体。 */
export function assetSavePayload(input: SaveImageAssetInput): Record<string, unknown> {
  const sourceNote = input.sourceNote?.trim();
  return {
    name: input.name,
    category: input.category,
    image: input.image,
    ...(sourceNote ? { sourceNote } : {}),
  };
}

type AssetSaveRequest = (
  input: string,
  init: RequestInit,
) => Promise<Pick<Response, "ok" | "status">>;

/** 把一张图片存为素材；失败抛出可展示的错误。 */
export async function saveImageAsAsset(
  input: SaveImageAssetInput,
  request: AssetSaveRequest = fetch,
): Promise<void> {
  const response = await request("/api/assets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(assetSavePayload(input)),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
}
