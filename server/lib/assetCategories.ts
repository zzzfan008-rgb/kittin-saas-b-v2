/**
 * 素材分类的单一事实源（服务端）。
 *
 * 2026-11-05 用户拍板 C：用户主动上传的图默认入素材库，未选分类落 `uncategorized`。
 * 该值同时出现在三处，必须同源：TypeScript 类型（src/types/workflow.ts）、
 * 数据库 CHECK 约束（迁移 27）、以及本清单。任何一处分叉都会在运行时炸。
 */
import type { Asset } from "../../src/types/workflow";

export const ASSET_CATEGORY_VALUES: readonly Asset["category"][] = [
  "print", "fabric", "colorcard", "sketch",
  "model", "garment", "accessory", "pose", "background",
  "refvideo", "audio",
  // 用户主动上传但未选分类时的落点。
  "uncategorized",
] as const;

/** 默认落点：用户上传时没有显式分类，用这个。 */
export const DEFAULT_UPLOAD_ASSET_CATEGORY: Asset["category"] = "uncategorized";

export function isAssetCategory(value: unknown): value is Asset["category"] {
  return typeof value === "string" && (ASSET_CATEGORY_VALUES as readonly string[]).includes(value);
}
