/**
 * 顶栏余额徽标：显示兔子API 账户的剩余余额，点击可手动刷新。
 *
 * 数据来源是服务端 `/api/billing/balance`（服务端持面板凭据，浏览器拿不到密钥）。
 * 刷新时机：
 * - 组件挂载时查一次；
 * - 用户点击「运行」且请求成功入队后，由 flowStore 广播 BALANCE_REFRESH_EVENT 触发。
 *
 * 这是纯展示组件，任何失败都降级为「余额：--」，绝不影响生图主流程。
 */
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { BALANCE_REFRESH_EVENT } from "@/lib/balanceEvents";

interface BalancePayload {
  configured: boolean;
  available: boolean;
  symbol: string;
  amount: number | null;
  quota: number | null;
  updatedAt: string;
  reason?: "not_configured" | "auth_failed" | "upstream_error";
}

interface BadgeState {
  text: string;
  hint: string;
  /** 数值就绪时用于加粗强调，占位态保持弱化。 */
  hasValue: boolean;
}

const LOADING: BadgeState = { text: "余额：…", hint: "正在查询账户余额", hasValue: false };

/** 把接口返回映射成展示文案；抽成纯函数便于单测。 */
export function describeBalance(payload: BalancePayload): BadgeState {
  if (!payload.configured) {
    return { text: "余额：--", hint: "未配置面板凭据，无法查询余额", hasValue: false };
  }
  if (!payload.available || payload.amount === null) {
    return {
      text: "余额：--",
      hint: payload.reason === "auth_failed"
        ? "面板登录失败，请检查面板账号密码"
        : "余额服务暂时不可用，点击重试",
      hasValue: false,
    };
  }
  return {
    text: `余额：${payload.symbol}${payload.amount.toFixed(2)}`,
    hint: `更新于 ${new Date(payload.updatedAt).toLocaleTimeString("zh-CN", { hour12: false })}，点击刷新`,
    hasValue: true,
  };
}

export function BalanceBadge() {
  const { user } = useAuth();
  const [state, setState] = useState<BadgeState>(LOADING);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/billing/balance", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setState(describeBalance(await response.json() as BalancePayload));
    } catch {
      setState({ text: "余额：--", hint: "余额服务暂时不可用，点击重试", hasValue: false });
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    void load();
    const handler = () => { void load(); };
    window.addEventListener(BALANCE_REFRESH_EVENT, handler);
    return () => window.removeEventListener(BALANCE_REFRESH_EVENT, handler);
  }, [load, user]);

  if (!user) return null;

  return (
    <button
      type="button"
      onClick={() => { void load(); }}
      aria-label={state.hint}
      title={state.hint}
      className="flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border border-(--gc-border) px-3 text-label text-(--gc-text-muted) outline-hidden transition-colors hover:border-(--gc-accent) focus-visible:ring-3 focus-visible:ring-(--gc-accent)/50"
    >
      <span role="status" aria-live="polite" className="flex items-center gap-1.5">
        <span className={state.hasValue ? "font-medium tabular-nums text-(--gc-text)" : "tabular-nums"}>
          {state.text}
        </span>
      </span>
    </button>
  );
}
