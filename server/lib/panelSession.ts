/**
 * 兔子API 面板会话：登录换取会话凭据，并调用面板接口读取账户额度。
 *
 * 为什么需要单独的会话：
 * - 余额（`quota`）只由面板接口 `GET /api/user/self` 提供；
 * - 该接口只认面板登录凭据，`APIYI_API_KEY`（sk-）会被拒绝（invalid_token）；
 * - `/v1/dashboard/billing/*` 返回的是占位值或累计消费，拿不到剩余额度。
 *
 * 认证形态（实测网关面板接口，x-new-api-version: dev-20261104）：
 * - 登录成功返回 `success:true`，但 **body 里没有 access_token**；
 * - 会话通过响应头 `set-cookie: session=...; HttpOnly; Secure; SameSite=Lax` 下发；
 * - 后续请求需带该 Cookie，并附带 `New-Api-User: <用户 id>`（body.data.id）。
 * 同时兼容老版本返回 `data.access_token` 的 Bearer 形态。
 *
 * 安全约束：账号密码、会话 Cookie 只存在于服务端内存，绝不写日志、绝不下发浏览器。
 */
import { config } from "../config";

/** 面板凭据缺失或登录被拒。 */
export class PanelAuthError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = "PanelAuthError";
  }
}

/** 面板接口不可达、超时或返回非预期结构。 */
export class PanelUpstreamError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "PanelUpstreamError";
  }
}

export interface PanelUserSelf {
  /** 剩余额度（内部单位，÷ quota_per_unit 得货币金额）。 */
  quota: number;
  /** 累计已消耗额度。 */
  usedQuota: number;
}

interface PanelSession {
  /** Cookie 形态（当前网关）：`session=xxxx`。 */
  cookie?: string;
  /** Bearer 形态（老版本网关）：access_token。 */
  token?: string;
  /** 面板用户 id，部分版本要求 `New-Api-User` 头。 */
  userId?: string;
}

const LOGIN_PATH = "/api/user/login";
const SELF_PATH = "/api/user/self";

let cachedSession: PanelSession | null = null;

/** 清空缓存会话；凭据变更或收到 401 时调用。 */
export function resetPanelSession(): void {
  cachedSession = null;
}

function panelConfigured(): boolean {
  return Boolean(config.panelUsername() && config.panelPassword());
}

function timeoutSignal(): AbortSignal {
  return AbortSignal.timeout(config.aiTextTimeoutMs(20_000));
}

/** 从任意形状的响应体里安全取数，避免面板字段变化时抛异常。 */
function num(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

interface LoginBody {
  success?: boolean;
  message?: string;
  data?: { access_token?: string; id?: number | string };
  access_token?: string;
}

/** 从 set-cookie 头里取出 session Cookie（只保留 name=value 部分）。 */
function extractSessionCookie(response: Response): string | undefined {
  const raw = typeof response.headers.getSetCookie === "function"
    ? response.headers.getSetCookie()
    : [response.headers.get("set-cookie") ?? ""];
  for (const entry of raw) {
    if (!entry) continue;
    for (const part of entry.split(",")) {
      const pair = part.split(";")[0]?.trim();
      if (pair?.startsWith("session=")) return pair;
    }
  }
  return undefined;
}

/**
 * 面板登录，返回可复用的会话凭据。
 * 同时支持 Cookie 会话与 Bearer 令牌两种形态。
 */
export async function login(): Promise<PanelSession> {
  if (!panelConfigured()) {
    throw new PanelAuthError("面板凭据未配置", "not_configured");
  }

  let response: Response;
  try {
    response = await fetch(`${config.apiyiBaseUrl()}${LOGIN_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: config.panelUsername(),
        password: config.panelPassword(),
      }),
      signal: timeoutSignal(),
    });
  } catch (error) {
    throw new PanelUpstreamError(
      error instanceof Error && error.name === "TimeoutError"
        ? "面板登录超时"
        : "面板登录请求失败",
    );
  }

  const body = await response.json().catch(() => ({})) as LoginBody;
  const token = body?.data?.access_token ?? body?.access_token;
  const cookie = extractSessionCookie(response);
  const userId = body?.data?.id === undefined ? undefined : String(body.data.id);

  if (!response.ok || body?.success === false || (!token && !cookie)) {
    // 只保留上游 message，绝不把密码或 Cookie 带进日志
    const code = typeof body?.message === "string" ? body.message.slice(0, 60) : undefined;
    throw new PanelAuthError("面板登录被拒绝", code);
  }

  cachedSession = {
    ...(cookie ? { cookie } : {}),
    ...(typeof token === "string" && token.length > 0 ? { token } : {}),
    ...(userId ? { userId } : {}),
  };
  return cachedSession;
}

function authHeaders(session: PanelSession): Record<string, string> {
  const headers: Record<string, string> = {};
  if (session.cookie) headers.Cookie = session.cookie;
  if (session.token) headers.Authorization = `Bearer ${session.token}`;
  if (session.userId) headers["New-Api-User"] = session.userId;
  return headers;
}

async function requestSelf(session: PanelSession): Promise<{ status: number; body: unknown }> {
  const response = await fetch(`${config.apiyiBaseUrl()}${SELF_PATH}`, {
    headers: authHeaders(session),
    signal: timeoutSignal(),
  });
  const body = await response.json().catch(() => ({}));
  return { status: response.status, body };
}

/** 判断响应是否表示会话失效（需重新登录）。 */
function isSessionInvalid(status: number, body: unknown): boolean {
  if (status === 401) return true;
  const record = body as { success?: boolean; error?: { code?: string } } | null;
  if (record?.success === false) return true;
  return record?.error?.code === "invalid_token" || record?.error?.code === "access_token_invalid";
}

function parseSelf(body: unknown): PanelUserSelf | undefined {
  const data = (body as { data?: { quota?: unknown; used_quota?: unknown } } | null)?.data;
  const quota = num(data?.quota);
  if (quota === undefined) return undefined;
  return { quota, usedQuota: num(data?.used_quota) ?? 0 };
}

/**
 * 读取当前账户额度。
 * 会话失效时自动重新登录并重试一次；仍失败则抛 PanelAuthError。
 */
export async function fetchPanelUserSelf(): Promise<PanelUserSelf> {
  const session = cachedSession ?? await login();

  let attempt: { status: number; body: unknown };
  try {
    attempt = await requestSelf(session);
  } catch (error) {
    throw new PanelUpstreamError(
      error instanceof Error && error.name === "TimeoutError"
        ? "面板接口超时"
        : "面板接口请求失败",
    );
  }

  if (isSessionInvalid(attempt.status, attempt.body)) {
    resetPanelSession();
    const fresh = await login();
    try {
      attempt = await requestSelf(fresh);
    } catch (error) {
      throw new PanelUpstreamError(
        error instanceof Error && error.name === "TimeoutError"
          ? "面板接口超时"
          : "面板接口请求失败",
      );
    }
    if (isSessionInvalid(attempt.status, attempt.body)) {
      resetPanelSession();
      throw new PanelAuthError("面板会话无效", "invalid_token");
    }
  }

  if (attempt.status !== 200) {
    throw new PanelUpstreamError("面板接口返回异常状态", attempt.status);
  }

  const parsed = parseSelf(attempt.body);
  if (!parsed) {
    throw new PanelUpstreamError("面板接口返回结构不含 quota");
  }
  return parsed;
}

export function isPanelConfigured(): boolean {
  return panelConfigured();
}
