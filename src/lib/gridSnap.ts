import { useSyncExternalStore } from "react";

/**
 * VIS-05（D-4 裁定 A）：画布网格吸附开关，snapGrid=[24,24]，默认关。
 *
 * 这是纯本地 UI 状态：只存 localStorage，不进入文档 / 历史 / 会话持久化
 * （AGENTS.md §3：面板开关类状态不得进入业务数据）。CanvasFlow 与
 * CanvasZoomControls 通过本模块共享同一个开关。
 */
export const SNAP_GRID: [number, number] = [24, 24];

const STORAGE_KEY = "gc.grid-snap";

const listeners = new Set<() => void>();

function readPersisted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

let enabled = readPersisted();

export function getGridSnapEnabled(): boolean {
  return enabled;
}

export function setGridSnapEnabled(next: boolean): void {
  if (next === enabled) return;
  enabled = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      /* 隐私模式等写入失败时，开关在本次会话内仍生效 */
    }
  }
  for (const listener of listeners) listener();
}

export function subscribeGridSnap(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 订阅网格吸附开关；未持久化值与 SSR 快照均为 false（默认关）。 */
export function useGridSnapEnabled(): boolean {
  return useSyncExternalStore(subscribeGridSnap, getGridSnapEnabled, () => false);
}
