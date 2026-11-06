/**
 * 余额刷新事件：生图请求入队成功后触发一次余额查询。
 *
 * 采用 CustomEvent 而非全局 store，理由与 overlayEvents.ts 一致：
 * 触发方（flowStore）与订阅方（顶栏 BalanceBadge）互不依赖，
 * 也避免把「余额」这种纯展示状态塞进文档状态或业务 Store。
 */
export const BALANCE_REFRESH_EVENT = "coin-ai:balance-refresh";

/** 通知顶栏重新查询余额（仅在运行请求确实入队成功后调用）。 */
export function requestBalanceRefresh(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(BALANCE_REFRESH_EVENT));
}
