import { create } from "zustand";

/**
 * R-40 悬浮窗口（功能设置）的 UI 运行时状态。
 * 纪律（AGENTS.md §3）：面板开合是本地 UI 状态，不进文档历史、会话持久化或业务 Store
 * 之外的任何持久化通道；这里挂在独立 zustand store，与 flowStore 文档层完全隔离。
 */

interface NodeInspectorWindowState {
  /** 当前锚定的节点 id；null = 未打开。单例：同时只开一个（R-40 §2.3）。 */
  anchorNodeId: string | null;
  /** 打开（或换绑）窗口；对另一节点执行打开动作时直接替换。 */
  open: (nodeId: string) => void;
  /** 关闭窗口；焦点还原由组件层处理。 */
  close: () => void;
}

export const useNodeInspector = create<NodeInspectorWindowState>((set) => ({
  anchorNodeId: null,
  open: (nodeId) => set({ anchorNodeId: nodeId }),
  close: () => set({ anchorNodeId: null }),
}));
