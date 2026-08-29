export interface WorkbenchUiState {
  libraryOpen: boolean;
  inspectorOpen: boolean;
}

export type WorkbenchUiAction =
  | { type: "toggle-library"; exclusive?: boolean }
  | { type: "toggle-inspector"; exclusive?: boolean }
  | { type: "enforce-exclusive" };

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
    case "toggle-library": {
      const libraryOpen = !state.libraryOpen;
      return libraryOpen && action.exclusive
        ? { libraryOpen: true, inspectorOpen: false }
        : { ...state, libraryOpen };
    }
    case "toggle-inspector": {
      const inspectorOpen = !state.inspectorOpen;
      return inspectorOpen && action.exclusive
        ? { libraryOpen: false, inspectorOpen: true }
        : { ...state, inspectorOpen };
    }
    case "enforce-exclusive":
      return state.libraryOpen && state.inspectorOpen
        ? { libraryOpen: false, inspectorOpen: true }
        : state;
    default:
      return state;
  }
}
