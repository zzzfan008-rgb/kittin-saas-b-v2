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

/** 上传文件名不可用时的素材名兜底（服务端要求 name 非空且 ≤ 200 字符）。 */
export const DEFAULT_UPLOAD_ASSET_NAME = "上传图片";
/** 自动生成的素材名上限：留足显示宽度，又远低于服务端 200 字符限制。 */
export const MAX_UPLOAD_ASSET_NAME_LENGTH = 60;

/**
 * 上传文件 → 素材名称：优先使用文件名（去目录、去扩展名、压缩空白）。
 * 数字模特库靠名称辨识，因此不用「素材-日期」这类占位名；
 * 文件名不可用时回退到节点标题，再回退到默认名（绝不提交空名称）。
 */
export function assetNameFromUpload(fileName: string, fallback?: string): string {
  const base = fileName.split(/[\\/]/).pop() ?? "";
  const fromFile = base.replace(/\.[^.]*$/, "").replace(/\s+/g, " ").trim();
  const name = fromFile || fallback?.replace(/\s+/g, " ").trim() || DEFAULT_UPLOAD_ASSET_NAME;
  return name.slice(0, MAX_UPLOAD_ASSET_NAME_LENGTH);
}

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

/**
 * 「存入数字模特库」的唯一入口：分类固定为 "model"，调用方只给名称 / 图片 / 来源说明。
 * 画布上传入口（ImageNode）与图片查看器共用此处，避免各自硬编码分类字符串。
 */
export async function saveImageToModelLibrary(
  input: { name: string; image: string; sourceNote?: string },
  request: AssetSaveRequest = fetch,
): Promise<void> {
  await saveImageAsAsset({ ...input, category: "model" }, request);
}
