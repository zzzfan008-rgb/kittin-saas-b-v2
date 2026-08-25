import { useCallback, useEffect, useRef, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { nanoid } from "nanoid";
import {
  flushActiveTextEdit,
  flushTabSessionPersistence,
  reconcileRunHistory,
  recentResultsPatch,
  resumeRecentResults,
  selectActiveNodes,
  selectActivePrimarySelectedNodeId,
  selectHasDirtyTabs,
  trimRecentResults,
  useFlowStore,
  type FlowNode,
  type RecentResult,
} from "@/store/flowStore";
import { CanvasFlow } from "@/components/CanvasFlow";
import { TopBar } from "@/components/panels/TopBar";
import { ProjectTabs } from "@/components/panels/ProjectTabs";
import { NodeLibraryPanel } from "@/components/panels/NodeLibraryPanel";
import { ContextPanel } from "@/components/panels/ContextPanel";
import { TemplatesDock } from "@/components/panels/TemplatesDock";
import { CompareOverlay } from "@/components/CompareOverlay";
import { ImageViewer } from "@/components/ImageViewer";
import { AssetPickerOverlay } from "@/components/AssetPickerOverlay";
import { WorkbenchShell } from "@/components/workbench/WorkbenchShell";
import { TaskLauncher } from "@/components/TaskLauncher";
import { TutorialOverlay } from "@/components/tutorial/TutorialOverlay";
import { setGenerationSafetyBlockReason } from "@/store/generationSafety";
import { useAuth } from "@/auth/AuthContext";
import { ChangePasswordPage, LoginPage, SessionEndedPage } from "@/auth/LoginPage";
import {
  isWorkspaceUnloadWarningSuppressed,
  shouldWarnBeforeWorkspaceUnload,
} from "@/lib/workspaceUnload";

/** 剪贴板里的节点快照（仅内存，跨项目/刷新不保留） */
let nodeClipboard: { data: FlowNode["data"]; type: string } | null = null;

interface HistoryPage {
  records: RecentResult[];
  nextCursor: string | null;
  hasMore: boolean;
}

function parseHistoryPage(value: unknown): HistoryPage {
  if (!value || typeof value !== "object") throw new Error("历史记录格式无效");
  const page = value as Partial<HistoryPage>;
  if (!Array.isArray(page.records) ||
      (page.nextCursor !== null && typeof page.nextCursor !== "string") ||
      typeof page.hasMore !== "boolean") {
    throw new Error("历史记录格式无效");
  }
  return { records: page.records, nextCursor: page.nextCursor ?? null, hasMore: page.hasMore };
}

function useGlobalShortcuts() {
  const undo = useFlowStore((s) => s.undo);
  const redo = useFlowStore((s) => s.redo);
  const saveProject = useFlowStore((s) => s.saveProject);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      // 蒙版编辑器使用独立撤销栈；打开或上传期间不能让全局快捷键修改底层画布。
      if (useFlowStore.getState().pendingMaskWorkCount > 0) return;
      const key = e.key.toLowerCase();
      // 输入框内的组合键留给原生文本编辑
      const target = e.target as HTMLElement | null;
      const inTextField =
        target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA");
      if (key === "s") {
        e.preventDefault();
        void saveProject();
        return;
      }
      if (inTextField) return;

      if (key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (key === "z") {
        e.preventDefault();
        undo();
      } else if (key === "c") {
        // 复制选中节点（不带连线，避免悬空边）
        const state = useFlowStore.getState();
        const nodes = selectActiveNodes(state);
        const selectedNodeId = selectActivePrimarySelectedNodeId(state);
        const node = nodes.find((n) => n.id === selectedNodeId);
        if (node) {
          nodeClipboard = {
            data: JSON.parse(JSON.stringify(node.data)) as FlowNode["data"],
            type: node.type ?? node.data.kind,
          };
        }
      } else if (key === "v") {
        // 粘贴：在副本右侧偏移落位，状态复位
        if (!nodeClipboard) return;
        e.preventDefault();
        const state = useFlowStore.getState();
        const nodes = selectActiveNodes(state);
        const data = JSON.parse(JSON.stringify(nodeClipboard.data)) as FlowNode["data"];
        data.status = "idle";
        data.error = undefined;
        const anchor =
          nodes.find((n) => n.id === selectActivePrimarySelectedNodeId(state)) ??
          nodes[nodes.length - 1];
        const position = anchor
          ? { x: anchor.position.x + 40, y: anchor.position.y + 40 }
          : { x: 0, y: 0 };
        const id = nanoid(8);
        const newNode: FlowNode = {
          id,
          type: nodeClipboard.type,
          position,
          data,
        };
        useFlowStore.getState().addExistingNode(newNode);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undo, redo, saveProject]);
}

export default function App() {
  const { user, loading, sessionEndReason, acknowledgeSessionEnd } = useAuth();
  if (loading) {
    return <div className="flex h-full items-center justify-center bg-[#101214] text-xs text-neutral-500">正在验证登录状态…</div>;
  }
  if (sessionEndReason === "replaced") {
    return <SessionEndedPage onContinue={acknowledgeSessionEnd} />;
  }
  if (!user) return <LoginPage />;
  if (user.mustChangePassword) return <ChangePasswordPage />;
  return <Workspace />;
}

function Workspace() {
  useGlobalShortcuts();
  const activeTabId = useFlowStore((state) => state.activeTabId);
  const [historyCursor, setHistoryCursor] = useState<string | null>(null);
  const [historyHasMore, setHistoryHasMore] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [initialHistoryState, setInitialHistoryState] = useState<"loading" | "ready" | "error">("loading");
  const [initialHistoryAttempt, setInitialHistoryAttempt] = useState(0);
  const historyPageSize = 20;
  const historyBefore = useRef(Date.now()).current;

  useEffect(() => {
    setGenerationSafetyBlockReason(
      initialHistoryState === "ready"
        ? null
        : initialHistoryState === "loading"
          ? "正在确认运行历史，完成前暂停新的生成任务"
          : "运行历史同步失败，为避免重复计费，新的生成任务已暂停",
    );
  }, [initialHistoryState]);

  useEffect(() => () => {
    setGenerationSafetyBlockReason("正在确认运行历史，完成前暂停新的生成任务");
  }, []);

  useEffect(() => {
    const flushDrafts = () => {
      flushActiveTextEdit();
      flushTabSessionPersistence();
    };
    const flushHiddenDrafts = () => {
      if (document.visibilityState === "hidden") flushDrafts();
    };
    window.addEventListener("pagehide", flushDrafts);
    document.addEventListener("visibilitychange", flushHiddenDrafts);
    return () => {
      window.removeEventListener("pagehide", flushDrafts);
      document.removeEventListener("visibilitychange", flushHiddenDrafts);
    };
  }, []);

  useEffect(() => {
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      flushActiveTextEdit();
      flushTabSessionPersistence();
      if (isWorkspaceUnloadWarningSuppressed()) return;
      const latest = useFlowStore.getState();
      if (!shouldWarnBeforeWorkspaceUnload({
        hasDirtyTabs: selectHasDirtyTabs(latest),
        tabSessionPersistenceError: latest.tabSessionPersistenceError,
        pendingMaskWorkCount: latest.pendingMaskWorkCount,
      })) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, []);

  useEffect(() => {
    let active = true;
    setInitialHistoryState("loading");
    Promise.all([
      fetch(`/api/history?limit=${historyPageSize}&offset=0&before=${historyBefore}`),
      fetch("/api/history/active"),
    ])
      .then(async ([historyResponse, activeResponse]) => {
        if (!historyResponse.ok) throw new Error(`历史记录 HTTP ${historyResponse.status}`);
        if (!activeResponse.ok) throw new Error(`活动任务 HTTP ${activeResponse.status}`);
        return [await historyResponse.json(), await activeResponse.json()] as const;
      })
      .then(([historyValue, activeValue]) => {
        if (active) {
          const page = parseHistoryPage(historyValue);
          const activePage = parseHistoryPage(activeValue);
          // 完整活动集必须放在前且不得预先裁剪；终态输出仅影响最近结果展示。
          reconcileRunHistory([...activePage.records, ...page.records]);
          resumeRecentResults(activePage.records);
          setHistoryCursor(page.nextCursor);
          setHistoryHasMore(page.hasMore);
          setInitialHistoryState("ready");
        }
      })
      .catch(() => {
        if (active) setInitialHistoryState("error");
      });
    return () => { active = false; };
  }, [historyBefore, initialHistoryAttempt]);

  const loadMoreHistory = useCallback(async () => {
    if (historyLoading || !historyHasMore || !historyCursor) return;
    setHistoryLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(historyPageSize), cursor: historyCursor });
      const response = await fetch(`/api/history?${params.toString()}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const page = parseHistoryPage(await response.json());
      useFlowStore.setState((state) => {
        const existingIds = new Set(state.recentResults.map((record) => record.id));
        return recentResultsPatch(state, trimRecentResults([
          ...state.recentResults,
          ...page.records.filter((record) => !existingIds.has(record.id)),
        ]) as never);
      });
      resumeRecentResults(page.records);
      setHistoryCursor(page.nextCursor);
      setHistoryHasMore(page.hasMore);
    } catch {
      // 保留“加载更多”入口，瞬时网络错误后用户可以再次重试。
    } finally {
      setHistoryLoading(false);
    }
  }, [historyCursor, historyHasMore, historyLoading]);

  return (
    <div className="gc-app-shell relative flex h-full min-w-0 flex-col overflow-hidden bg-ink text-neutral-200">
      <TopBar />
      <ProjectTabs />
      {initialHistoryState !== "ready" && (
        <div
          role={initialHistoryState === "error" ? "alert" : "status"}
          className="gc-panel flex min-h-9 shrink-0 items-center justify-center gap-3 border-b border-[var(--gc-border)] bg-[var(--gc-panel)] px-3 py-1.5 text-center"
        >
          <p className={`text-[10px] ${initialHistoryState === "error" ? "text-amber-300" : "text-[var(--gc-text-muted)]"}`}>
            {initialHistoryState === "loading"
              ? "正在确认运行历史；画布仍可查看和编辑，新的生成任务暂不可用。"
              : "运行历史同步失败；画布仍可编辑和保存，为避免重复计费，新的生成任务已暂停。"}
          </p>
          {initialHistoryState === "error" && (
            <button
              type="button"
              onClick={() => setInitialHistoryAttempt((value) => value + 1)}
              className="shrink-0 rounded-sm border border-gold/60 px-2 py-1 text-[10px] text-gold hover:bg-gold/10"
            >
              重试同步
            </button>
          )}
        </div>
      )}
      <WorkbenchShell
        library={<NodeLibraryPanel className="h-full w-full border-r-0" />}
        inspector={(
          <ContextPanel
            hasMore={historyHasMore}
            loadingMore={historyLoading}
            onLoadMore={() => void loadMoreHistory()}
          />
        )}
      >
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <TemplatesDock />
          <ReactFlowProvider key={activeTabId}>
            <TaskLauncher />
            <CanvasFlow />
          </ReactFlowProvider>
        </div>
      </WorkbenchShell>
      <CompareOverlay />
      <ImageViewer />
      <AssetPickerOverlay />
      <TutorialOverlay />
    </div>
  );
}
