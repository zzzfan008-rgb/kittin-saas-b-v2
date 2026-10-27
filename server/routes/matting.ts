/**
 * 抠图：转发到本地 Python rembg 服务（rembg-service/）。
 *
 * 契约：
 *   POST /api/matting
 *     body: { dataUrl: string, model?: string }
 *     resp: { url: string, id: string, width: number, height: number }
 *
 * 为什么是服务端转发而不是前端直连 Python 服务：
 * 1. Python 服务只监听 127.0.0.1，不暴露给浏览器（无 CORS、无鉴权面）
 * 2. 抠图结果要落 files 表（与 mask-draft / edit-draft 同族，30 天回收）
 * 3. 错误翻译成统一中文（复用 apiErrorMessage 风格）
 *
 * 为什么用 dataUrl 而不是 multipart：
 * 项目现有上传链路（server/routes/files.ts:POST /api/files）就是
 * base64 dataUrl JSON，express.json 已配 50mb limit。跟随现有模式，
 * 不引入 multer 这类新依赖。
 */
import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler";
import { deleteStoredImage, saveNormalizedUploadDataUrl } from "../lib/fileStore";
import { requestUser } from "../lib/auth";
import { transaction } from "../lib/database";
import { lockActiveOwner } from "../lib/ownerMutation";

export const mattingRouter = Router();

/** 默认模型；与 rembg-service/app.py 的 MATTING_MODEL 默认值一致。 */
const DEFAULT_MODEL = "isnet-general-use";
const ALLOWED_MODELS = new Set(["isnet-general-use", "u2net", "u2netp", "u2net_human_seg"]);

/** 抠图服务地址；部署时通过环境变量指向常驻服务。 */
function serviceUrl(): string {
  return process.env.MATTING_SERVICE_URL?.replace(/\/+$/, "") || "http://127.0.0.1:8001";
}

/** 单次请求超时。推理约 3-5s，留足余量但防止挂死。 */
const REQUEST_TIMEOUT_MS = 120_000;

/**
 * 把 Python 服务的错误翻译成给用户看的中文。
 *
 * 三条原则（与 server/providers/base.ts 的 MESSAGE_RULES 同风格）：
 * 1. 用户能理解原因（不是「未知错误」）
 * 2. 用户知道下一步做什么（重试 / 换图 / 联系管理员）
 * 3. 绝不把 Python traceback 或英文技术细节直接抛给用户
 */
export function describeMattingError(status: number, detail: string | undefined): string {
  const raw = (detail || "").trim();

  if (status === 503) {
    // Python 服务加载模型中，或模型不可用
    if (/加载中|loading/i.test(raw)) {
      return "抠图服务正在加载模型，请稍后重试（首次启动约需 5 秒）";
    }
    return "抠图服务不可用，请稍后重试；若持续失败请联系管理员检查抠图服务";
  }
  if (status === 413) {
    return "图片过大，请压缩到 25MB 以内后重试";
  }
  if (status === 422) {
    return "未识别到可抠除的背景，请换一张主体更清晰的图片";
  }
  if (status === 400) {
    if (/无法解析图片|cannot identify/i.test(raw)) {
      return "图片格式无法识别，请换一张 JPG / PNG / WebP 图片";
    }
    if (/请求体为空/.test(raw)) {
      return "请先上传图片再抠图";
    }
    return "图片参数有误，请重新选择图片后重试";
  }
  return "抠图失败，请稍后重试";
}

/** 抠图服务是否可达（供 /api/matting/health 与诊断用）。 */
mattingRouter.get(
  "/health",
  asyncHandler(async (_req, res) => {
    try {
      const response = await fetch(`${serviceUrl()}/health`, {
        signal: AbortSignal.timeout(5_000),
      });
      const body = await response.json().catch(() => ({}));
      res.json({ reachable: true, ...body });
    } catch (error) {
      res.json({
        reachable: false,
        status: "unreachable",
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }),
);

mattingRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const user = requestUser(req);
    if (!user) {
      res.status(401).json({ error: "请先登录" });
      return;
    }

    const body = req.body as { dataUrl?: unknown; model?: unknown };
    const dataUrl = body?.dataUrl;
    if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
      res.status(400).json({ error: "请先上传图片再抠图" });
      return;
    }

    const model = typeof body.model === "string" && ALLOWED_MODELS.has(body.model)
      ? body.model
      : DEFAULT_MODEL;

    // dataUrl → 二进制，发给 Python 服务
    const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
    let input: Buffer;
    try {
      input = Buffer.from(base64, "base64");
    } catch {
      res.status(400).json({ error: "图片参数有误，请重新选择图片后重试" });
      return;
    }
    if (input.length === 0) {
      res.status(400).json({ error: "请先上传图片再抠图" });
      return;
    }

    const mimeMatch = /^data:(image\/[a-z+]+);base64,/i.exec(dataUrl);
    const contentType = mimeMatch?.[1] || "image/png";

    let response: Response;
    try {
      response = await fetch(`${serviceUrl()}/remove?model=${encodeURIComponent(model)}`, {
        method: "POST",
        headers: { "Content-Type": contentType },
        body: new Uint8Array(input),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      const isTimeout = error instanceof Error && error.name === "TimeoutError";
      res.status(503).json({
        error: isTimeout
          ? "抠图超时，请换一张更小的图片或稍后重试"
          : "抠图服务不可用，请稍后重试；若持续失败请联系管理员检查抠图服务",
      });
      return;
    }

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const detail = typeof (payload as { detail?: unknown }).detail === "string"
        ? (payload as { detail: string }).detail
        : undefined;
      res.status(response.status === 503 ? 503 : 400).json({
        error: describeMattingError(response.status, detail),
      });
      return;
    }

    // Python 返回的是原始 PNG 字节，转成 dataUrl 走既有落库链路
    const png = Buffer.from(await response.arrayBuffer());
    const outDataUrl = `data:image/png;base64,${png.toString("base64")}`;

    try {
      const saved = await saveNormalizedUploadDataUrl(outDataUrl);
      // files 表必须同时写 owner_id，否则 GET /api/files/:id 会 fail-closed 403
      // （files.ts:56 canAccessFile：无 owner_id 记录 = 未知归属，一律拒绝）。
      // saveNormalizedUploadDataUrl 只落物理文件，不写元数据。
      try {
        const registered = await transaction(async (client) => {
          if (!await lockActiveOwner(client, user.id)) return false;
          await client.query(`
            INSERT INTO files (
              id, owner_id, source_type, mime_type, width, height, byte_length, normalized, created_at
            ) VALUES ($1, $2, 'matting-draft', $3, $4, $5, $6, TRUE, $7)
          `, [
            saved.id, user.id, saved.mimeType, saved.width, saved.height,
            saved.byteLength, new Date().toISOString(),
          ]);
          return true;
        });
        if (!registered) {
          deleteStoredImage(saved.id);
          res.status(409).json({ error: "账号已停用或删除，不能继续抠图" });
          return;
        }
      } catch (error) {
        // 元数据写失败必须清掉孤儿文件，否则留下读不出来的死文件
        deleteStoredImage(saved.id);
        throw error;
      }
      res.json({
        id: saved.id,
        url: saved.url,
        width: saved.width,
        height: saved.height,
      });
    } catch (error) {
      console.error("[matting] 保存抠图结果失败", error);
      res.status(500).json({ error: "抠图完成但保存失败，请重试" });
    }
  }),
);
