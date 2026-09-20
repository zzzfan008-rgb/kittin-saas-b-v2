/**
 * 左侧 Dock 开合与画布视口居中保持之间的契约（R-80 R2）。
 *
 * 仅靠 ResizeObserver 补偿存在一帧量级的「空窗」：Dock 切换当拍布局已变
 * （容器宽度已是新值），但 ResizeObserver 通知 + rAF 补偿尚未提交，
 * 此时读取画布中心会得到偏移 ±DOCK_OPEN_WIDTH_PX/2 的旧视口。
 * WorkbenchShell 在切换的同一个用户事件里先发本事件，CanvasFlow 同步
 * 平移视口并预置观测目标，使几何变化在同一任务内收敛。
 */

/** Dock 展开占位宽度，与 WorkbenchShell 的 `w-80`（20rem）保持一致。 */
export const DOCK_OPEN_WIDTH_PX = 320;

export const DOCK_VIEWPORT_WILL_CHANGE_EVENT =
  "garment-workbench:dock-viewport-will-change";

export interface DockViewportWillChangeDetail {
  /**
   * 画布容器宽度即将发生的变化量（px）：
   * 展开 Dock 为 -DOCK_OPEN_WIDTH_PX，收起为 +DOCK_OPEN_WIDTH_PX，同级切换不发事件。
   * 目标宽度由监听方按自身容器实测宽度计算，避免外壳跨组件读 DOM。
   */
  widthDelta: number;
}

/** 按当前/下一刻 Dock 开合状态计算画布宽度增量；同级面板切换为 0。 */
export function dockWidthChange(currentOpen: boolean, nextOpen: boolean): number {
  if (currentOpen === nextOpen) return 0;
  return nextOpen ? -DOCK_OPEN_WIDTH_PX : DOCK_OPEN_WIDTH_PX;
}

/**
 * 视口平移量 = 容器宽度增量的一半：
 * 画布中心对应的世界坐标 = (容器宽 / 2 - viewport.x) / zoom 保持不变。
 */
export function shiftViewportForWidthChange<
  T extends { x: number; y: number; zoom: number },
>(viewport: T, widthDelta: number): T {
  return { ...viewport, x: viewport.x + widthDelta / 2 };
}

export function emitDockViewportWillChange(
  detail: DockViewportWillChangeDetail,
): void {
  if (typeof window === "undefined" || detail.widthDelta === 0) return;
  window.dispatchEvent(
    new CustomEvent<DockViewportWillChangeDetail>(DOCK_VIEWPORT_WILL_CHANGE_EVENT, {
      detail,
    }),
  );
}
