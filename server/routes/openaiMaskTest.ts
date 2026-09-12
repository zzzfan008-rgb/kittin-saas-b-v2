import { Router, raw } from "express";
import OpenAI from "openai";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { nanoid } from "nanoid";
import { config } from "../config";
import { requestUser } from "../lib/auth";
import { asyncHandler } from "../lib/asyncHandler";
import { transaction } from "../lib/database";
import { lockActiveOwner } from "../lib/ownerMutation";
import { uploadsDir, deleteStoredImage } from "../lib/fileStore";
import { assertImageReferencesAccessible, ImageReferenceAccessError } from "../lib/imageReferenceAccess";
import { callNativeMaskEdit, inspectNativeMaskPng, NativeMaskInputError, NATIVE_MASK_MODEL } from "../lib/openaiMaskTest";
import { OPENAI_MASK_TEST_BOOT_ID, openAiMaskTestRecordPath } from "../lib/openaiMaskTestLifecycle";
import type { OpenAiMaskTestRecord } from "../../src/types/openaiMaskTest";

const SAFE_ID = /^[A-Za-z0-9_-]{1,128}$/;
const PNG_REF = /^\/api\/files\/[A-Za-z0-9_-]+\.png$/;
const activeOwners = new Set<string>();
type StoredRecord = OpenAiMaskTestRecord & {
  bootId: string;
  fingerprint: string;
  deletedAt?: string;
  purgeAfter?: string;
};
const sha = (value: Buffer | string) => createHash("sha256").update(value).digest("hex");

function publicRecord(record: StoredRecord): OpenAiMaskTestRecord {
  const { bootId: _boot, fingerprint: _hash, deletedAt: _deletedAt, purgeAfter: _purgeAfter, ...result } = record;
  return result.status === "running" && record.bootId !== OPENAI_MASK_TEST_BOOT_ID
    ? { ...result, status: "outcome_unknown", error: "服务曾重启，结果未知，不会自动重试" } : result;
}

function saveRecord(filename: string, record: StoredRecord) {
  const temporary = `${filename}.${nanoid(8)}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(record), { flag: "wx", mode: 0o600 });
  fs.renameSync(temporary, filename);
}

async function storePng(buffer: Buffer, ownerId: string, sourceType: "upload" | "generated") {
  const meta = await inspectNativeMaskPng(buffer);
  const id = `${nanoid(12)}.png`;
  fs.writeFileSync(path.join(uploadsDir(), id), buffer, { flag: "wx", mode: 0o600 });
  try {
    await transaction(async (client) => {
      if (!await lockActiveOwner(client, ownerId)) throw new Error("账号不可用");
      await client.query(`INSERT INTO files (id,owner_id,source_type,mime_type,width,height,byte_length,normalized,created_at)
        VALUES ($1,$2,$3,'image/png',$4,$5,$6,FALSE,$7)`, [id, ownerId, sourceType, meta.width, meta.height, buffer.length, new Date().toISOString()]);
    });
  } catch (error) { deleteStoredImage(id); throw error; }
  return { url: `/api/files/${id}`, ...meta };
}

function safeFailure(error: unknown): { status: "failed" | "outcome_unknown"; error: string } {
  if (error instanceof NativeMaskInputError) return { status: "failed", error: error.message };
  if (error instanceof OpenAI.APIError && error.status && error.status < 500) {
    return { status: "failed", error: `API易拒绝了请求（HTTP ${error.status}），未自动重试` };
  }
  return { status: "outcome_unknown", error: "请求或结果保存异常，结果和扣费状态可能未知；未自动重试" };
}

export function createOpenAiMaskTestRouter(options: { createClient?: () => OpenAI } = {}) {
  const router = Router();
  router.get("/config", (_req, res) => res.json({ model: NATIVE_MASK_MODEL, gateway: "API易", ready: Boolean(config.apiyiApiKey()), sdk: "OpenAI", postprocess: "none" }));
  router.post("/files", raw({ type: "image/png", limit: "50mb" }), asyncHandler(async (req, res) => {
    if (!Buffer.isBuffer(req.body)) { res.status(400).json({ error: "请上传 PNG 文件" }); return; }
    try { res.json(await storePng(req.body, requestUser(req).id, "upload")); }
    catch (error) { res.status(error instanceof NativeMaskInputError ? 400 : 500).json({ error: error instanceof NativeMaskInputError ? error.message : "文件保存失败" }); }
  }));
  router.get("/runs/:id", (req, res) => {
    if (!SAFE_ID.test(req.params.id)) { res.status(404).json({ error: "记录不存在" }); return; }
    const filename = openAiMaskTestRecordPath(requestUser(req).id, req.params.id);
    if (!fs.existsSync(filename)) { res.status(404).json({ error: "记录不存在" }); return; }
    res.setHeader("Cache-Control", "no-store");
    res.json(publicRecord(JSON.parse(fs.readFileSync(filename, "utf8"))));
  });
  router.post("/runs", asyncHandler(async (req, res) => {
    const ownerId = requestUser(req).id;
    const { id, source, mask, prompt } = req.body ?? {};
    if (typeof id !== "string" || !SAFE_ID.test(id) || typeof source !== "string" || !PNG_REF.test(source) ||
      typeof mask !== "string" || !PNG_REF.test(mask) || typeof prompt !== "string" || !prompt.trim() || prompt.length > 32000) {
      res.status(400).json({ error: "需要请求 ID、PNG 原图、PNG 蒙版和提示词" }); return;
    }
    const filename = openAiMaskTestRecordPath(ownerId, id);
    const fingerprint = sha(JSON.stringify({ source, mask, prompt, model: NATIVE_MASK_MODEL }));
    if (fs.existsSync(filename)) {
      const existing = JSON.parse(fs.readFileSync(filename, "utf8")) as StoredRecord;
      if (existing.fingerprint !== fingerprint) { res.status(409).json({ error: "同一请求 ID 的输入不能改变" }); return; }
      res.json(publicRecord(existing)); return;
    }
    if (activeOwners.has(ownerId)) { res.status(409).json({ error: "已有一个原生蒙版测试正在执行" }); return; }
    if (!options.createClient && !config.apiyiApiKey()) { res.status(503).json({ error: "服务端未配置 APIYI_API_KEY" }); return; }
    activeOwners.add(ownerId);
    let submitted = false;
    try {
      await assertImageReferencesAccessible([source, mask], ownerId, undefined, { verifyStoredFiles: true });
      const imageBuffer = fs.readFileSync(path.join(uploadsDir(), path.basename(source)));
      const maskBuffer = fs.readFileSync(path.join(uploadsDir(), path.basename(mask)));
      const sourceMeta = await inspectNativeMaskPng(imageBuffer);
      const maskMeta = await inspectNativeMaskPng(maskBuffer, true);
      if (sourceMeta.width !== maskMeta.width || sourceMeta.height !== maskMeta.height) throw new NativeMaskInputError("原图和蒙版的像素尺寸必须完全相同");
      const record: StoredRecord = { id, status: "running", model: NATIVE_MASK_MODEL, source, mask, prompt,
        sourceSha256: sha(imageBuffer), maskSha256: sha(maskBuffer), createdAt: new Date().toISOString(), bootId: OPENAI_MASK_TEST_BOOT_ID, fingerprint };
      // Persist the attempt before the sole SDK call; a repeated ID never replays it.
      const persisted = await transaction(async (client) => {
        if (!await lockActiveOwner(client, ownerId)) return false;
        fs.writeFileSync(filename, JSON.stringify(record), { flag: "wx", mode: 0o600 });
        return true;
      });
      if (!persisted) throw new Error("账号不可用，未保存测试记录");
      submitted = true;
      res.status(202).json(publicRecord(record));
      void (async () => {
        try {
          const client = options.createClient?.() ?? new OpenAI({ apiKey: config.apiyiApiKey(), baseURL: `${config.apiyiBaseUrl().replace(/\/v1$/, "")}/v1`, maxRetries: 0, timeout: 600_000 });
          const image = await callNativeMaskEdit(client, { image: imageBuffer, mask: maskBuffer, prompt });
          const stored = await storePng(image, ownerId, "generated");
          saveRecord(filename, { ...record, status: "succeeded", image: stored.url, finishedAt: new Date().toISOString() });
        } catch (error) {
          saveRecord(filename, { ...record, ...safeFailure(error), finishedAt: new Date().toISOString() });
        } finally { activeOwners.delete(ownerId); }
      })().catch(() => { console.error("[openai-mask-test] record persistence failed", id); });
    } catch (error) {
      const status = error instanceof ImageReferenceAccessError ? 404 : error instanceof NativeMaskInputError ? 400 : 500;
      if (!res.headersSent) res.status(status).json({ error: error instanceof NativeMaskInputError ? error.message : "无法提交测试，请检查图片访问权限" });
    } finally { if (!submitted) activeOwners.delete(ownerId); }
  }));
  return router;
}
