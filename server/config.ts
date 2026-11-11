/**
 * 集中管理环境变量。未安装 dotenv，这里手动解析项目根目录 .env（key=value），
 * process.env 中已存在的值优先。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** 项目根目录（server/ 的上一级） */
export const ROOT_DIR = path.resolve(__dirname, "..");

function loadDotEnv(): void {
  const envPath = path.join(ROOT_DIR, ".env");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotEnv();

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name} (see .env.example)`);
  return v;
}

export const config = {
  /** AI 图片接口（兔子API）；路径由本地模型知识库逐模型声明。 */
  gatewayBaseUrl: () => (process.env.GATEWAY_BASE_URL ?? "https://api.ourzhishi.top").replace(/\/+$/, ""),
  gatewayApiKey: () => required("GATEWAY_API_KEY"),
  /**
   * 网关视频（Seedance）专用令牌。用户已为 Seedance 单独建令（需勾选 SeeDance2 分组）。
   * 缺省回退主图片令牌；显式配置时仅视频链路使用，不覆盖图片链路。
   */
  gatewayVideoApiKey: () => {
    const key = (process.env.GATEWAY_VIDEO_API_KEY ?? "").trim();
    return key || required("GATEWAY_API_KEY");
  },

  /**
   * 兔子API 面板账号（与 sk 密钥是两套凭据）。
   * 余额只能从面板接口 `GET /api/user/self` 取，而它只认面板登录令牌，
   * sk 密钥会返回 invalid_token。凭据仅服务端使用，绝不下发浏览器。
   */
  panelUsername: () => (process.env.GATEWAY_PANEL_USERNAME ?? "").trim(),
  panelPassword: () => process.env.GATEWAY_PANEL_PASSWORD ?? "",
  /** 余额结果缓存（毫秒）；用于合并多人同时点「运行」的并发查询。 */
  balanceCacheTtlMs: () => {
    const value = Number(process.env.BALANCE_CACHE_TTL_MS ?? 5_000);
    return Number.isFinite(value) ? Math.max(0, Math.min(60_000, value)) : 5_000;
  },
  /** 可选：强制换算系数，留空则跟随网关 /api/status 的 custom_currency_exchange_rate。 */
  balanceCurrencyRate: () => {
    const value = Number(process.env.BALANCE_CURRENCY_RATE);
    return Number.isFinite(value) && value > 0 ? value : undefined;
  },
  /** 可选：强制货币符号，留空则跟随网关 /api/status 的 custom_currency_symbol。 */
  balanceCurrencySymbol: () => process.env.BALANCE_CURRENCY_SYMBOL?.trim() || undefined,

  port: () => Number(process.env.PORT ?? 3001),
  dataDir: () => path.resolve(ROOT_DIR, process.env.DATA_DIR ?? "./data"),
  databaseUrl: () => process.env.DATABASE_URL?.trim() || undefined,
  databaseHost: () => process.env.PGHOST?.trim() || "127.0.0.1",
  databasePort: () => Number(process.env.PGPORT ?? process.env.POSTGRES_HOST_PORT ?? 54329),
  databaseName: () => process.env.PGDATABASE?.trim() || process.env.POSTGRES_DB?.trim() || "garment_canvas",
  databaseUser: () => process.env.PGUSER?.trim() || process.env.POSTGRES_USER?.trim() || "garment_canvas",
  databasePassword: () => process.env.PGPASSWORD ?? process.env.POSTGRES_PASSWORD ?? "",
  databasePoolSize: () => Math.max(1, Math.min(50, Number(process.env.DATABASE_POOL_SIZE) || 10)),
  generationWorkerPollMs: () => {
    const value = Number(process.env.GENERATION_WORKER_POLL_MS ?? 2_000);
    return Number.isFinite(value) ? Math.max(100, Math.min(60_000, value)) : 2_000;
  },
  /**
   * 并行消费队列的 worker 数量。生图是分钟级长任务，单 worker 会让第二个请求排队；
   * 默认 2 个，可设 1 回到串行，上限 4（再高容易撞上游渠道并发限制）。
   */
  generationWorkerConcurrency: () => {
    const value = Number(process.env.GENERATION_WORKER_CONCURRENCY ?? 2);
    return Number.isFinite(value) ? Math.max(1, Math.min(4, Math.floor(value))) : 2;
  },
  // ---------- Gemini 图片异步任务（兔子API《异步图片生成》）----------

  /**
   * 两个 Gemini 图片模型改走 POST /v1/videos 提交 + GET /v1/videos/{id} 轮询。
   * 实测（2026-11-10）：gemini-3.1-flash-image / gemini-nano-banana-2.1 均约 20–30s 完成，
   * 比原生 generateContent 同步长连接（实测 260s、常撞 nginx 504）快且结果可凭 task_id 找回。
   * GEMINI_ASYNC_DISABLED=true 可秒级回退到原生同步端点。
   */
  geminiAsyncEnabled: () => {
    const value = (process.env.GEMINI_ASYNC_DISABLED ?? "").trim().toLowerCase();
    return value !== "1" && value !== "true" && value !== "on";
  },
  /** 提交后首次查询前的等待（实测队列到出图至少十几秒）。 */
  geminiAsyncPollInitialDelayMs: () => {
    const value = Number(process.env.GEMINI_ASYNC_POLL_INITIAL_DELAY_MS ?? 2_000);
    return Number.isFinite(value) ? Math.max(0, Math.min(30_000, Math.round(value))) : 2_000;
  },
  /** 查询间隔；GET 幂等、不计费，可比视频任务更密。 */
  geminiAsyncPollIntervalMs: () => {
    const value = Number(process.env.GEMINI_ASYNC_POLL_INTERVAL_MS ?? 3_000);
    return Number.isFinite(value) ? Math.max(500, Math.min(30_000, Math.round(value))) : 3_000;
  },
  /** 整条任务的总预算。超预算不判失败，标 outcome_unknown 并留 task_id 供找回。 */
  geminiAsyncPollTimeoutMs: () => {
    const value = Number(process.env.GEMINI_ASYNC_POLL_TIMEOUT_MS ?? 240_000);
    return Number.isFinite(value) ? Math.max(20_000, Math.min(600_000, Math.round(value))) : 240_000;
  },

  sqliteImportPath: () => path.resolve(config.dataDir(), process.env.SQLITE_IMPORT_FILE ?? "garment-canvas.db"),
  initialAdminAccountId: () => process.env.INITIAL_ADMIN_ACCOUNT_ID?.trim() ?? "",
  initialAdminPassword: () => process.env.INITIAL_ADMIN_PASSWORD ?? "",
  /** 生产模式是否只提供 API；true 时不要求或托管前端 dist。 */
  apiOnly: () => process.env.API_ONLY === "true",

  /** AI 调用超时（中转站网关限制，可配） */
  aiTimeoutMs: (fallback = 300_000) => Number(process.env.AI_TIMEOUT_MS ?? fallback),

  /** 提示词改写文本通道模型 id（OpenAI 兼容 chat-completions）。 */
  gatewayTextModelId: () => (process.env.GATEWAY_TEXT_MODEL_ID ?? "gemini-3.8-flash").trim() || "gemini-3.8-flash",
  /** 文本通道超时（改写是出图前轻量增强，独立更短超时；环境变量 AI_TEXT_TIMEOUT_MS）。 */
  aiTextTimeoutMs: (fallback = 20_000) => Number(process.env.AI_TEXT_TIMEOUT_MS ?? fallback),

  // ---------- 参考图智能解析（运行前多模态解析）----------

  /**
   * 视觉模型链：按顺序回退，前一个失败（不支持图片/超时/输出不可用）才试下一个。
   * 环境变量 PROMPT_ANALYSIS_MODELS 用逗号分隔覆盖。
   *
   * 2026-11-10 实测（同一张服装图、q92 压缩）：claude-opus-5-5 6.3s/235 字最详细，
   * gemini-3.8-flash 14.3s/135 字够用，gpt-6-astra 11.2s/182 字但 24k tokens 成本高。
   * 顺序由用户拍板：claude → gemini → gpt。
   */
  promptAnalysisModels: (): string[] => {
    const raw = (process.env.PROMPT_ANALYSIS_MODELS ?? "").trim();
    const list = raw
      ? raw.split(",").map((item) => item.trim()).filter(Boolean)
      : ["claude-opus-5-5", "gemini-3.8-flash", "gpt-6-astra"];
    return list.length > 0 ? list : ["claude-opus-5-5"];
  },
  /** 单个视觉模型的超时：实测 gemini-3.8-flash 解析服装图需 10–15s，20s 起步。 */
  promptAnalysisTimeoutMs: () => {
    const value = Number(process.env.PROMPT_ANALYSIS_TIMEOUT_MS ?? 20_000);
    return Number.isFinite(value) && value >= 5_000 ? Math.min(value, 120_000) : 20_000;
  },
  /** 整条模型链的总预算：超出即放弃后续模型、按失败降级（用户最多等这么久）。 */
  promptAnalysisTotalBudgetMs: () => {
    const value = Number(process.env.PROMPT_ANALYSIS_TOTAL_BUDGET_MS ?? 45_000);
    return Number.isFinite(value) && value >= 5_000 ? Math.min(value, 180_000) : 45_000;
  },
  /** 一键关闭解析（秒级回滚）：为 true 时路由直接返回 skipped，按钮恢复「运行」。 */
  promptAnalysisDisabled: () => {
    const value = (process.env.PROMPT_ANALYSIS_DISABLED ?? "").trim().toLowerCase();
    return value === "1" || value === "true" || value === "on";
  },

  /** 网关完整 JSON 尾部卡住时的安全收尾开关；显式 false/0/off 可回退旧行为。 */
  gatewayTailStallSalvageEnabled: () => {
    const value = (process.env.GATEWAY_TAIL_STALL_SALVAGE ?? "true").trim().toLowerCase();
    return value !== "false" && value !== "0" && value !== "off";
  },
  /** 最后一块数据后的宽限期，仅用于完整 JSON 探测，不替代 body/总超时。 */
  gatewayTailStallGraceMs: () => {
    const value = Number(process.env.GATEWAY_TAIL_STALL_GRACE_MS ?? 5_000);
    return Number.isFinite(value) ? Math.max(1_000, Math.min(30_000, Math.round(value))) : 5_000;
  },

  /** 不发外部请求的 AI 配置就绪检查，供 readiness 使用。 */
  aiConfigReady: () => {
    const key = process.env.GATEWAY_API_KEY?.trim();
    const baseUrl = config.gatewayBaseUrl();
    if (!key) return false;
    try {
      const url = new URL(baseUrl);
      return url.protocol === "https:";
    } catch {
      return false;
    }
  },
} as const;
