/**
 * 文件上传/读取：
 *   POST /api/files      { dataUrl } → 标准化图片元数据（base64 JSON，body limit 50mb）
 *   GET  /api/files/:id  读取图片（id 含扩展名，如 abc12.png）
 */
import { Router, type Response } from "express";
import fs from "node:fs";
import path from "node:path";
import {
  deleteStoredImage, ensureThumbnail, isSupportedImageFile, mimeOfFile,
  normalizeImageRef, saveDataUrl, saveNormalizedUploadDataUrl, uploadsDir,
} from "../lib/fileStore";
import { ProviderError } from "../providers/base";
import { ImageValidationError } from "../lib/imageValidation";
import { requestUser } from "../lib/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { query, queryOne, transaction } from "../lib/database";
import { lockActiveOwner } from "../lib/ownerMutation";
import {
  assertImageReferencesAccessible,
  ImageReferenceAccessError,
} from "../lib/imageReferenceAccess";
import { validateMaskForSource } from "../lib/maskProcessing";

export const filesRouter = Router();

const SAFE_PROJECT_ID = /^[A-Za-z0-9_-]{1,64}$/;
const SAFE_NODE_ID = /^[A-Za-z0-9_-]{1,128}$/;
const MASK_DRAFT_RETENTION_MS = 30 * 24 * 60 * 60 * 1_000;

type FileAccess = "public" | "private" | "denied";

async function canAccessFile(id: string, req: Parameters<typeof requestUser>[0]): Promise<FileAccess> {
  const user = requestUser(req);
  const access = await queryOne<{ owner_id: string | null; shared: boolean }>(`
    SELECT f.owner_id,
      EXISTS(SELECT 1 FROM assets a WHERE a.image = $1 AND a.deleted_at IS NULL AND a.scope IN ('global','shared')) AS shared
    FROM files f WHERE f.id = $2
  `, [`/api/files/${id}`, id]);
  // SQLite/旧版本导入会补 files 元数据；没有记录的物理文件只能是未完成写入或
  // 回收失败留下的孤儿，不能绕过账号 ACL 继续读取。
  if (!access) return "denied";
  if (access.owner_id === null || access.shared) return "public";
  if (access.owner_id === user.id || user.role === "admin") return "private";
  return "denied";
}

function setFileCacheHeaders(res: Response): void {
  // 文件路由始终需要登录，且 shared/global 素材都允许后续撤回共享。
  // 因此原图与缩略图都不能进入浏览器或代理的长期公共缓存。
  res.setHeader("Cache-Control", "private, no-store");
  res.vary("Cookie");
}

filesRouter.post("/", asyncHandler(async (req, res) => {
  const user = requestUser(req);
  const { dataUrl } = req.body as { dataUrl?: string };
  if (!dataUrl) {
    res.status(400).json({ error: "dataUrl is required" });
    return;
  }
  try {
    const saved = await saveNormalizedUploadDataUrl(dataUrl);
    try {
      const registered = await transaction(async (client) => {
        if (!await lockActiveOwner(client, user.id)) return false;
        await client.query(`
          INSERT INTO files (
            id, owner_id, source_type, mime_type, width, height, byte_length, normalized, created_at
          ) VALUES ($1, $2, 'upload', $3, $4, $5, $6, TRUE, $7)
        `, [
          saved.id, user.id, saved.mimeType, saved.width, saved.height,
          saved.byteLength, new Date().toISOString(),
        ]);
        return true;
      });
      if (!registered) {
        deleteStoredImage(saved.id);
        res.status(409).json({ error: "账号已停用或删除，不能继续上传文件" });
        return;
      }
    } catch (error) {
      deleteStoredImage(saved.id);
      throw error;
    }
    res.json(saved);
  } catch (err) {
    if (err instanceof ProviderError || err instanceof ImageValidationError) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  }
}));

/**
 * 蒙版必须保持原始像素尺寸与 Alpha，不能走普通素材的缩放/重编码流程。
 * 新文件先以有期限的 draft 保存；项目成功保存后会认领当前引用并清除期限。
 */
filesRouter.post("/mask", asyncHandler(async (req, res) => {
  const user = requestUser(req);
  const { dataUrl, sourceRef, projectId, nodeId } = req.body as {
    dataUrl?: string;
    sourceRef?: string;
    projectId?: string;
    nodeId?: string;
  };
  if (
    typeof dataUrl !== "string" || !dataUrl ||
    typeof sourceRef !== "string" || !sourceRef ||
    typeof projectId !== "string" || !SAFE_PROJECT_ID.test(projectId) ||
    typeof nodeId !== "string" || !SAFE_NODE_ID.test(nodeId)
  ) {
    res.status(400).json({ error: "dataUrl, sourceRef, projectId and nodeId are required" });
    return;
  }

  let saved: { id: string; url: string } | undefined;
  let committed = false;
  try {
    // normalizeImageRef 会直接读本地文件；必须先按当前账号做一次访问检查。
    await assertImageReferencesAccessible(sourceRef, user.id);
    const sourceDataUrl = await normalizeImageRef(sourceRef);
    const pair = await validateMaskForSource(sourceDataUrl, dataUrl);
    const storedMask = saveDataUrl(dataUrl);
    saved = storedMask;
    try {
      const registered = await transaction(async (client) => {
        if (!await lockActiveOwner(client, user.id)) return false;
        // 在登记事务内重查，防止共享素材在解码期间被撤销。
        await assertImageReferencesAccessible(sourceRef, user.id, client);
        const now = new Date();
        await client.query(`
          INSERT INTO files (
            id, owner_id, source_type, project_id, node_id,
            mime_type, width, height, byte_length, normalized,
            created_at, purge_after
          ) VALUES ($1, $2, 'mask-draft', $3, $4, 'image/png', $5, $6, $7, FALSE, $8, $9)
        `, [
          storedMask.id, user.id, projectId, nodeId,
          pair.width, pair.height, pair.maskBuffer.byteLength,
          now.toISOString(), new Date(now.getTime() + MASK_DRAFT_RETENTION_MS).toISOString(),
        ]);
        return true;
      });
      if (!registered) {
        deleteStoredImage(storedMask.id);
        saved = undefined;
        res.status(409).json({ error: "账号已停用或删除，不能继续保存蒙版" });
        return;
      }
      committed = true;
    } catch (error) {
      deleteStoredImage(storedMask.id);
      saved = undefined;
      throw error;
    }
    res.json({
      ...storedMask,
      mimeType: "image/png",
      width: pair.width,
      height: pair.height,
      byteLength: pair.maskBuffer.byteLength,
      preserved: true,
    });
  } catch (error) {
    if (saved && !committed) deleteStoredImage(saved.id);
    const status = error instanceof ImageReferenceAccessError
      ? 403
      : error instanceof ProviderError || error instanceof ImageValidationError
        ? 400
        : 500;
    res.status(status).json({ error: error instanceof Error ? error.message : String(error) });
  }
}));

filesRouter.get("/:id/thumbnail", asyncHandler(async (req, res) => {
  const id = path.basename(req.params.id);
  if (id !== req.params.id || !isSupportedImageFile(id)) {
    res.status(400).json({ error: "invalid file id" });
    return;
  }
  const access = await canAccessFile(id, req);
  if (access === "denied") {
    res.status(403).json({ error: "无权访问此文件" });
    return;
  }
  try {
    const thumbnail = await ensureThumbnail(id);
    res.setHeader("Content-Type", "image/webp");
    setFileCacheHeaders(res);
    fs.createReadStream(thumbnail).pipe(res);
  } catch (error) {
    res.status(error instanceof Error && error.message === "file not found" ? 404 : 422)
      .json({ error: error instanceof Error ? error.message : "thumbnail failed" });
  }
}));

filesRouter.get("/:id", asyncHandler(async (req, res) => {
  const id = path.basename(req.params.id); // 防路径穿越
  if (id !== req.params.id || !isSupportedImageFile(id)) {
    res.status(400).json({ error: "invalid file id" });
    return;
  }
  const filePath = path.join(uploadsDir(), id);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "file not found" });
    return;
  }
  const access = await canAccessFile(id, req);
  if (access === "denied") {
    res.status(403).json({ error: "无权访问此文件" });
    return;
  }
  res.setHeader("Content-Type", mimeOfFile(id));
  setFileCacheHeaders(res);
  fs.createReadStream(filePath).pipe(res);
}));
