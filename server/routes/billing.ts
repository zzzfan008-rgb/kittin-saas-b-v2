/**
 * 账户余额：把兔子API 面板额度换算成可展示的金额。
 *
 * 数据来源与换算规则见 docs/plans 与本次改动的说明：
 * - 余额：`GET /api/user/self` → `data.quota`
 * - 换算：`quota / quota_per_unit * custom_currency_exchange_rate`
 *   参数取自 `GET /api/status`（缓存 10 分钟），可用环境变量强制覆盖
 *
 * 设计原则：这是纯展示型只读接口，任何上游异常都必须降级成 `available:false`，
 * 不能返回 5xx 让顶栏报错，更不能阻塞生图主流程。
 */
import { Router, type Response } from "express";
import { asyncHandler } from "../lib/asyncHandler";
import { config } from "../config";
import {
  PanelAuthError,
  PanelUpstreamError,
  fetchPanelUserSelf,
  isPanelConfigured,
  type PanelUserSelf,
} from "../lib/panelSession";

export type BalanceReason = "not_configured" | "auth_failed" | "upstream_error";

export interface BalancePayload {
  configured: boolean;
  available: boolean;
  symbol: string;
  amount: number | null;
  quota: number | null;
  updatedAt: string;
  reason?: BalanceReason;
}

export interface CurrencyMeta {
  symbol: string;
  /** 每个货币单位对应的内部额度数，new-api 默认 500000。 */
  quotaPerUnit: number;
  /** 内部额度 → 展示货币的系数。 */
  rate: number;
}

/** new-api 默认：500000 额度 = 1 货币单位。 */
const DEFAULT_QUOTA_PER_UNIT = 500_000;
const DEFAULT_SYMBOL = "¥";
const STATUS_TTL_MS = 10 * 60 * 1000;

let statusCache: { meta: CurrencyMeta; fetchedAt: number } | null = null;
let balanceCache: { payload: BalancePayload; fetchedAt: number } | null = null;

/** 测试用：重置模块级缓存。 */
export function resetBillingCaches(): void {
  statusCache = null;
  balanceCache = null;
}

function num(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/**
 * 读取网关的换算参数。
 * 优先环境变量覆盖 → 网关 /api/status → new-api 默认值。
 */
export async function loadCurrencyMeta(): Promise<CurrencyMeta> {
  const forcedSymbol = config.balanceCurrencySymbol();
  const forcedRate = config.balanceCurrencyRate();

  const cached = statusCache;
  if (cached && Date.now() - cached.fetchedAt < STATUS_TTL_MS) {
    return {
      symbol: forcedSymbol ?? cached.meta.symbol,
      rate: forcedRate ?? cached.meta.rate,
      quotaPerUnit: cached.meta.quotaPerUnit,
    };
  }

  let meta: CurrencyMeta = {
    symbol: DEFAULT_SYMBOL,
    quotaPerUnit: DEFAULT_QUOTA_PER_UNIT,
    rate: 1,
  };

  try {
    const response = await fetch(`${config.apiyiBaseUrl()}/api/status`, {
      signal: AbortSignal.timeout(5_000),
    });
    const body = await response.json().catch(() => ({})) as { data?: Record<string, unknown> };
    const data = body?.data ?? {};
    const quotaPerUnit = num(data.quota_per_unit);
    const rate = num(data.custom_currency_exchange_rate);
    const symbol = typeof data.custom_currency_symbol === "string" && data.custom_currency_symbol.trim() !== ""
      ? data.custom_currency_symbol.trim()
      : DEFAULT_SYMBOL;

    meta = {
      symbol,
      quotaPerUnit: quotaPerUnit && quotaPerUnit > 0 ? quotaPerUnit : DEFAULT_QUOTA_PER_UNIT,
      // 网关未开启自定义货币时，1 额度单位 = 1 货币，系数取 1
      rate: rate && rate > 0 ? rate : 1,
    };
    statusCache = { meta, fetchedAt: Date.now() };
  } catch {
    // 拿不到换算参数不影响展示余额，用默认值兜底
    meta = { symbol: DEFAULT_SYMBOL, quotaPerUnit: DEFAULT_QUOTA_PER_UNIT, rate: 1 };
  }

  return { ...meta, symbol: forcedSymbol ?? meta.symbol, rate: forcedRate ?? meta.rate };
}

/** 纯换算函数，便于单测。 */
export function toAmount(quota: number, meta: CurrencyMeta): number {
  const amount = (quota / meta.quotaPerUnit) * meta.rate;
  return Math.round(amount * 100) / 100;
}

export interface BillingRouterDeps {
  /** 测试注入，避免打真实面板。 */
  fetchUserSelf?: () => Promise<PanelUserSelf>;
  loadMeta?: () => Promise<CurrencyMeta>;
  configured?: () => boolean;
  /** 覆盖缓存 TTL（毫秒），测试用。 */
  cacheTtlMs?: number;
}

export function createBillingRouter(deps: BillingRouterDeps = {}): Router {
  const router = Router();

  router.get("/balance", asyncHandler(async (_req, res: Response) => {
    const configured = (deps.configured ?? isPanelConfigured)();
    const ttl = deps.cacheTtlMs ?? config.balanceCacheTtlMs();

    if (!configured) {
      res.json({
        configured: false,
        available: false,
        symbol: config.balanceCurrencySymbol() ?? DEFAULT_SYMBOL,
        amount: null,
        quota: null,
        updatedAt: new Date().toISOString(),
        reason: "not_configured",
      } satisfies BalancePayload);
      return;
    }

    const cached = balanceCache;
    if (cached && Date.now() - cached.fetchedAt < ttl) {
      res.json(cached.payload);
      return;
    }

    try {
      const [self, meta] = await Promise.all([
        (deps.fetchUserSelf ?? fetchPanelUserSelf)(),
        (deps.loadMeta ?? loadCurrencyMeta)(),
      ]);

      const payload: BalancePayload = {
        configured: true,
        available: true,
        symbol: meta.symbol,
        amount: toAmount(self.quota, meta),
        quota: self.quota,
        updatedAt: new Date().toISOString(),
      };
      balanceCache = { payload, fetchedAt: Date.now() };
      res.json(payload);
      return;
    } catch (error) {
      const reason: BalanceReason = error instanceof PanelAuthError ? "auth_failed" : "upstream_error";
      // 只记类型与码，绝不记凭据或响应原文
      console.warn("[coin-ai-canvas] 余额查询失败", {
        reason,
        detail: error instanceof PanelAuthError
          ? error.code ?? "auth"
          : error instanceof PanelUpstreamError
            ? error.status ?? "upstream"
            : "unknown",
      });

      res.json({
        configured: true,
        available: false,
        symbol: config.balanceCurrencySymbol() ?? DEFAULT_SYMBOL,
        amount: null,
        quota: null,
        updatedAt: new Date().toISOString(),
        reason,
      } satisfies BalancePayload);
    }
  }));

  return router;
}
