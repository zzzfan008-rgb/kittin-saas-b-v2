export interface WorkbenchUiState {
  libraryOpen: boolean;
  inspectorOpen: boolean;
}

export type WorkbenchUiAction =
  | { type: "toggle-library" }
  | { type: "toggle-inspector" };

export const INITIAL_WORKBENCH_UI_STATE: WorkbenchUiState = {
  libraryOpen: false,
  // 首屏优先保留画布空间，需要属性或结果时再展开上下文 Dock。
  inspectorOpen: false,
};

/**
 * 工作台外壳的纯 UI 状态。不保存项目、节点或运行数据，
 * 避免面板开合污染工作流的撤销和持久化链路。
 */
export function workbenchUiReducer(
  state: WorkbenchUiState,
  action: WorkbenchUiAction,
): WorkbenchUiState {
  switch (action.type) {
    case "toggle-library":
      return { ...state, libraryOpen: !state.libraryOpen };
    case "toggle-inspector":
      return { ...state, inspectorOpen: !state.inspectorOpen };
    default:
      return state;
  }
}
