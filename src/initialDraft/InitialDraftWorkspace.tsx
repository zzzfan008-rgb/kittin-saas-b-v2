import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertTriangleIcon, CloudIcon, LoaderCircleIcon, RefreshCwIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { readWorkspaceOwner } from "@/auth/session";
import { clearProjectTabSessionStorage } from "@/lib/tabSessionStorage";
import {
  applyServerInitialDraftToTab,
  didRestoreProjectTabSessionWorkspace,
  isPristineProjectTab,
  markInitialDraftSynced,
  persistedWorkflowForProjectTab,
  projectTabLifecycle,
  replaceAbandonedInitialDraftWithFreshLocalTab,
  selectActiveDocument,
  useFlowStore,
  type ProjectTab,
  type ServerInitialDraftSnapshot,
} from "@/store/flowStore";
import {
  abandonInitialDraft,
  bootstrapInitialDraft,
  copyProjectScopedMasks,
  fetchSavedProject,
  fetchSavedProjects,
  fetchInitialDraft,
  forceClearInitialDraft,
  InitialDraftApiError,
  isServerInitialDraftPristine,
  syncInitialDraft,
} from "./initialDraftClient";
import {
  bootstrapNeedsFreshProjectIdentity,
  decideInitialDraftStartup,
  selectLocalInitialDraftCandidate,
  shouldStayBlankOnStartup,
} from "./initialDraftMigration";
import {
  registerInitialDraftSaveBarrier,
  setInitialDraftInteractionBlocking,
} from "./initialDraftRuntime";

type SyncState = "idle" | "syncing" | "error";
type GateState = "loading" | "ready" | "error";

interface DraftConflict {
  localTabId: string;
  server: ServerInitialDraftSnapshot;
}

interface InitialDraftContextValue {
  syncState: SyncState;
  syncError: string | null;
  retrySync: () => void;
  abandon: (tabId: string) => Promise<boolean>;
  abandoningTabId: string | null;
}

const InitialDraftContext = createContext<InitialDraftContextValue | null>(null);

export function useInitialDraftWorkspace(): InitialDraftContextValue {
  const value = useContext(InitialDraftContext);
  if (!value) throw new Error("useInitialDraftWorkspace must be used inside InitialDraftWorkspace");
  return value;
}

function localDraftDirty(tab: ProjectTab): boolean {
  return projectTabLifecycle(tab) === "initial_draft"
    ? tab.dirty || !isPristineProjectTab(tab)
    : !isPristineProjectTab(tab);
}

function applyDraft(
  tab: ProjectTab,
  draft: ServerInitialDraftSnapshot,
  options?: {
    preserveLocalBackup?: { projectId: string; flow: ReturnType<typeof persistedWorkflowForProjectTab> };
    forceDirty?: boolean;
  },
): boolean {
  const dirty = options?.forceDirty ?? (
    tab.projectId === draft.id && projectTabLifecycle(tab) === "initial_draft"
      ? localDraftDirty(tab)
      : !isServerInitialDraftPristine(draft)
  );
  return applyServerInitialDraftToTab(tab.id, draft, {
    dirty,
    localDocumentRevision: dirty ? Math.max(1, tab.revision, draft.revision) : 0,
    preserveReplacedAsBackup: options?.preserveLocalBackup,
  });
}

export async function settleInitialDraftBeforeAbandon(
  tabId: string,
  read: () => ProjectTab | undefined,
  synchronize: (tab: ProjectTab) => Promise<boolean>,
  hasSyncInFlight: () => boolean,
): Promise<ProjectTab | undefined> {
  for (let attemptIndex = 0; attemptIndex < 8; attemptIndex += 1) {
    const latest = read();
    if (!latest || latest.id !== tabId || projectTabLifecycle(latest) !== "initial_draft") {
      return undefined;
    }
    if (!hasSyncInFlight() && latest.revision <= (latest.draftSyncedRevision ?? 0)) return latest;
    if (!await synchronize(latest)) return undefined;
  }
  throw new Error("项目仍在持续修改，请停止编辑后再放弃");
}

function BlockingScreen({
  state,
  error,
  onRetry,
  onClearDraft,
  clearDraftBusy,
}: {
  state: GateState;
  error: string | null;
  onRetry: () => void;
  onClearDraft: () => void;
  clearDraftBusy: boolean;
}) {
  return (
    <div className="flex h-full min-w-[1024px] items-center justify-center bg-ink px-8 text-[var(--gc-text)]">
      <div className="gc-panel w-[34rem] rounded-xl border border-[var(--gc-border)] bg-[var(--gc-panel)] p-8 text-center shadow-2xl shadow-black/50">
        {state === "loading" ? (
          <LoaderCircleIcon aria-hidden="true" className="mx-auto size-8 animate-spin text-gold" />
        ) : (
          <AlertTriangleIcon aria-hidden="true" className="mx-auto size-8 text-amber-300" />
        )}
        <h1 className="mt-4 text-base font-semibold text-[var(--gc-text)]">
          {state === "loading" ? "正在恢复未保存项目" : "未保存项目暂时无法恢复"}
        </h1>
        <p className="mt-2 text-xs leading-6 text-[var(--gc-text-muted)]">
          {state === "loading"
            ? "正在核对本机与云端草稿，完成前画布不会进入可编辑状态。"
            : error ?? "请重试连接；本机草稿仍然保留。"}
        </p>
        {state === "error" && (
          <div className="mt-5 flex flex-col items-center gap-3">
            <Button type="button" onClick={onRetry}>
              <RefreshCwIcon aria-hidden="true" className="size-4" />
              重试恢复
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={clearDraftBusy}
              onClick={onClearDraft}
            >
              {clearDraftBusy && <LoaderCircleIcon aria-hidden="true" className="size-4 animate-spin" />}
              清除草稿并重新开始
            </Button>
            <p className="text-[11px] text-[var(--gc-text-muted)]">
              清除后不可恢复；系统会创建一份全新的空白草稿。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ConflictDialog({
  conflict,
  busy,
  onKeepLocal,
  onUseServer,
}: {
  conflict: DraftConflict;
  busy: boolean;
  onKeepLocal: () => void;
  onUseServer: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex min-w-[1024px] items-center justify-center bg-black/75 px-8 backdrop-blur-sm">
      <div role="alertdialog" aria-modal="true" aria-labelledby="initial-draft-conflict-title" className="gc-panel w-[38rem] rounded-xl border border-amber-400/40 bg-[var(--gc-panel)] p-7 shadow-2xl shadow-black/60">
        <div className="flex items-start gap-4">
          <AlertTriangleIcon aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-amber-300" />
          <div>
            <h2 id="initial-draft-conflict-title" className="text-base font-semibold text-[var(--gc-text)]">本机与云端草稿同时有修改</h2>
            <p className="mt-2 text-xs leading-6 text-[var(--gc-text-muted)]">
              系统不会静默覆盖任何一份内容。保留本机会明确更新云端；使用云端时，当前本机内容会另存为“本机备份”页签。
            </p>
            <p className="mt-3 rounded-md bg-[var(--gc-panel-soft)] px-3 py-2 text-[11px] text-[var(--gc-text-muted)]">
              云端项目：{conflict.server.name} · revision {conflict.server.revision}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" disabled={busy} onClick={onUseServer}>
            使用云端并保留本机备份
          </Button>
          <Button type="button" disabled={busy} onClick={onKeepLocal}>
            {busy && <LoaderCircleIcon aria-hidden="true" className="size-4 animate-spin" />}
            保留本机并更新云端
          </Button>
        </div>
      </div>
    </div>
  );
}

export function InitialDraftWorkspace({ userId, children }: { userId: string; children: ReactNode }) {
  const [gateState, setGateState] = useState<GateState>("loading");
  const [gateError, setGateError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [conflict, setConflict] = useState<DraftConflict | null>(null);
  const [conflictBusy, setConflictBusy] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [syncError, setSyncError] = useState<string | null>(null);
  const [abandoningTabId, setAbandoningTabId] = useState<string | null>(null);
  const syncTimer = useRef<number | null>(null);
  const syncInFlight = useRef<Promise<boolean> | null>(null);
  const initialDraftSignal = useFlowStore((state) => {
    const tab = state.tabs.find((candidate) => projectTabLifecycle(candidate) === "initial_draft");
    return tab ? `${tab.id}\0${tab.projectId}\0${tab.documentEpoch}\0${tab.revision}\0${tab.draftSyncedRevision ?? 0}\0${tab.draftRevision ?? 0}` : "";
  });

  const synchronizeTab = useCallback((snapshot: ProjectTab, expectedRevision?: number): Promise<boolean> => {
    if (syncInFlight.current) return syncInFlight.current;
    setSyncState("syncing");
    setSyncError(null);
    const task = (async () => {
      try {
        const localRevision = snapshot.revision;
        const serverRevision = expectedRevision ?? snapshot.draftRevision ?? 0;
        const draft = await syncInitialDraft({
          id: snapshot.projectId,
          expectedRevision: serverRevision,
          name: snapshot.projectName,
          flow: persistedWorkflowForProjectTab(snapshot),
        });
        markInitialDraftSynced(
          { tabId: snapshot.id, projectId: snapshot.projectId, documentEpoch: snapshot.documentEpoch },
          localRevision,
          serverRevision,
          draft.revision,
        );
        setSyncState("idle");
        return true;
      } catch (error) {
        if (error instanceof InitialDraftApiError && error.status === 409) {
          const server = await fetchInitialDraft().catch(() => null);
          const latest = useFlowStore.getState().tabs.find((tab) => tab.id === snapshot.id);
          if (server && latest) setConflict({ localTabId: latest.id, server });
        }
        setSyncState("error");
        setSyncError(error instanceof Error ? error.message : String(error));
        return false;
      }
    })();
    syncInFlight.current = task;
    void task.finally(() => {
      if (syncInFlight.current === task) syncInFlight.current = null;
    });
    return task;
  }, []);

  // 方案 C 首次落库：空 local tab 首次实质变更后触发 bootstrap，成功后转 initial_draft。
  const bootstrapLocalTab = useCallback(async (tabId: string): Promise<boolean> => {
    const snapshot = useFlowStore.getState().tabs.find((tab) => tab.id === tabId);
    if (
      !snapshot ||
      snapshot.readOnly ||
      projectTabLifecycle(snapshot) !== "local" ||
      (snapshot.nodes.length === 0 && snapshot.edges.length === 0)
    ) return false;
    setSyncState("syncing");
    setSyncError(null);
    try {
      const bootstrapped = await bootstrapInitialDraft({
        id: snapshot.projectId,
        name: snapshot.projectName,
        flow: persistedWorkflowForProjectTab(snapshot),
      });
      const latest = useFlowStore.getState().tabs.find((tab) => tab.id === tabId);
      if (!latest || projectTabLifecycle(latest) !== "local") return false;
      applyDraft(latest, bootstrapped.draft, { forceDirty: true });
      setSyncState("idle");
      return true;
    } catch (error) {
      if (error instanceof InitialDraftApiError && error.status === 409) {
        const server = await fetchInitialDraft().catch(() => null);
        const latest = useFlowStore.getState().tabs.find((tab) => tab.id === tabId);
        if (server && latest) setConflict({ localTabId: latest.id, server });
      }
      setSyncState("error");
      setSyncError(error instanceof Error ? error.message : String(error));
      return false;
    }
  }, []);

  const runInitialization = useCallback(async (signal: AbortSignal) => {
    setGateState("loading");
    setGateError(null);
    setConflict(null);
    try {
      const state = useFlowStore.getState();
      // 用户 2026-09-25 决策（A）：登录后一律「空白优先、无页签」，不自动打开已保存项目、
      // 也不保留本地草稿页签。空工作区时 store 的多余页签在任何情况下都不存在
      // （tabs=[]）,无需这里清除。
      setGateState("ready");
      if (state.tabs.length === 0) return;
      const placeholder = selectActiveDocument(state);
      const restored = didRestoreProjectTabSessionWorkspace();
      const ownerVerified = restored && readWorkspaceOwner(window.sessionStorage) === userId;
      const local = selectLocalInitialDraftCandidate(state.tabs, state.activeTabId, ownerVerified);
      // 已验证的会话页签是最精确的恢复点；其中已有正式项目时不要再请求并创建初始空白页。
      const restoredSavedTab = ownerVerified && state.tabs.some(
        (tab) => projectTabLifecycle(tab) === "saved",
      );
      if (restoredSavedTab) {
        setGateState("ready");
        return;
      }
      const [server, savedProjects] = await Promise.all([
        fetchInitialDraft(signal),
        fetchSavedProjects(signal),
      ]);
      if (signal.aborted) return;
      if (shouldStayBlankOnStartup(local, server, savedProjects.length)) {
        // 决策 A：有已保存项目时保持空白，不自动打开、也不新建草稿（避免启动即写库）。
        setGateState("ready");
        return;
      }
      let decision = decideInitialDraftStartup(placeholder, local, server);

      if (decision.kind === "bootstrap-pristine" || decision.kind === "bootstrap-local") {
        const source = decision.local;
        if (!source) throw new Error("无法创建新的未保存项目，请刷新后重试");
        // 方案 C：空白本地 tab（nodes=[]&&edges=[]）不落库，直接进入空画布；
        // 首次实质变更时才由首次落库 effect 触发 bootstrap。
        if (source.nodes.length === 0 && source.edges.length === 0) {
          setGateState("ready");
          return;
        }
        const needsFreshIdentity = bootstrapNeedsFreshProjectIdentity(decision);
        const prepared = decision.kind === "bootstrap-local" && needsFreshIdentity
          ? await copyProjectScopedMasks({
              sourceProjectId: source.projectId,
              createFreshTarget: true,
              flow: persistedWorkflowForProjectTab(source),
              signal,
            })
          : { targetProjectId: source.projectId, flow: persistedWorkflowForProjectTab(source) };
        const bootstrapped = await bootstrapInitialDraft({
          id: prepared.targetProjectId,
          ...(decision.kind === "bootstrap-local" ? { name: source.projectName } : {}),
          flow: prepared.flow,
          signal,
        });
        if (signal.aborted) return;
        if (!bootstrapped.created && decision.kind === "bootstrap-local") {
          decision = decideInitialDraftStartup(placeholder, source, bootstrapped.draft);
        } else {
          applyDraft(source, bootstrapped.draft, {
            forceDirty: decision.kind === "bootstrap-local" ? localDraftDirty(source) : false,
          });
          setGateState("ready");
          return;
        }
      }

      if (decision.kind === "restore-server") {
        applyDraft(decision.local ?? placeholder, decision.server);
        setGateState("ready");
        return;
      }
      if (decision.kind === "sync-local") {
        const prepared = await copyProjectScopedMasks({
          sourceProjectId: decision.local.projectId,
          targetProjectId: decision.server.id,
          flow: persistedWorkflowForProjectTab(decision.local),
          signal,
        });
        const draft = await syncInitialDraft({
          id: decision.server.id,
          expectedRevision: decision.server.revision,
          name: decision.local.projectName,
          flow: prepared.flow,
          signal,
        });
        if (signal.aborted) return;
        applyDraft(decision.local, draft, { forceDirty: true });
        setGateState("ready");
        return;
      }
      if (decision.kind === "conflict") {
        setConflict({ localTabId: decision.local.id, server: decision.server });
        setGateState("ready");
        return;
      }
      throw new Error("未保存项目恢复状态无效，请重试");
    } catch (error) {
      if (signal.aborted) return;
      setGateState("error");
      setGateError(error instanceof Error ? error.message : String(error));
    }
  }, [userId]);

  useEffect(() => {
    const controller = new AbortController();
    void runInitialization(controller.signal);
    return () => controller.abort();
  }, [attempt, runInitialization]);

  useEffect(() => {
    if (gateState !== "ready" || conflict || !initialDraftSignal) return;
    const tab = useFlowStore.getState().tabs.find(
      (candidate) => projectTabLifecycle(candidate) === "initial_draft",
    );
    if (!tab || tab.revision <= (tab.draftSyncedRevision ?? 0)) return;
    if (syncTimer.current !== null) window.clearTimeout(syncTimer.current);
    syncTimer.current = window.setTimeout(() => {
      syncTimer.current = null;
      const latest = useFlowStore.getState().tabs.find((candidate) => candidate.id === tab.id);
      if (latest) void synchronizeTab(latest);
    }, 700);
    return () => {
      if (syncTimer.current !== null) window.clearTimeout(syncTimer.current);
      syncTimer.current = null;
    };
  }, [conflict, gateState, initialDraftSignal, synchronizeTab]);

  // 方案 C 首次落库触发：追踪「空 local tab → 非空」的转变，调用 bootstrapLocalTab。
  // 模板/打开项目等从创建起就非空的 local tab 不会被追踪，因此不会被误 bootstrap。
  useEffect(() => {
    if (gateState !== "ready") return;
    const emptyLocalTabIds = new Set<string>();
    const bootstrapInFlight = new Set<string>();
    const registerEmpty = (tabs: ProjectTab[]) => {
      for (const tab of tabs) {
        if (projectTabLifecycle(tab) === "local" && tab.nodes.length === 0 && tab.edges.length === 0) {
          emptyLocalTabIds.add(tab.id);
        }
      }
    };
    registerEmpty(useFlowStore.getState().tabs);
    const unsubscribe = useFlowStore.subscribe((state) => {
      registerEmpty(state.tabs);
      for (const tab of state.tabs) {
        if (tab.readOnly || projectTabLifecycle(tab) !== "local") continue;
        if (tab.nodes.length === 0 && tab.edges.length === 0) continue;
        if (!emptyLocalTabIds.has(tab.id) || bootstrapInFlight.has(tab.id)) continue;
        bootstrapInFlight.add(tab.id);
        const tabId = tab.id;
        // 延迟到当前同步块结束再落库：保证 addNode + auto-text（补 text 节点与
        // prompt 边）都在 bootstrap 读取快照之前完成，避免序列化出无 text 上游的
        // 非法 image 节点（INV-1 400）。
        void queueMicrotask(() => {
          void bootstrapLocalTab(tabId).finally(() => bootstrapInFlight.delete(tabId));
        });
      }
    });
    return unsubscribe;
  }, [bootstrapLocalTab, gateState]);

  useEffect(() => registerInitialDraftSaveBarrier(async (target) => {
    if (syncTimer.current !== null) {
      window.clearTimeout(syncTimer.current);
      syncTimer.current = null;
    }
    for (let attemptIndex = 0; attemptIndex < 8; attemptIndex += 1) {
      const tab = useFlowStore.getState().tabs.find((candidate) => (
        candidate.id === target.tabId &&
        candidate.projectId === target.projectId &&
        candidate.documentEpoch === target.documentEpoch
      ));
      if (!tab || projectTabLifecycle(tab) !== "initial_draft") return;
      if (tab.revision <= (tab.draftSyncedRevision ?? 0) && !syncInFlight.current) return;
      const synchronized = await synchronizeTab(tab);
      if (!synchronized) throw new Error("未保存项目同步失败，尚未转为正式项目");
    }
    throw new Error("项目仍在持续修改，请停止编辑后重试保存");
  }), [synchronizeTab]);

  useEffect(() => {
    setInitialDraftInteractionBlocking(Boolean(conflict));
    return () => setInitialDraftInteractionBlocking(false);
  }, [conflict]);

  const retrySync = useCallback(() => {
    const tab = useFlowStore.getState().tabs.find(
      (candidate) => projectTabLifecycle(candidate) === "initial_draft",
    );
    if (tab) void synchronizeTab(tab);
  }, [synchronizeTab]);

  const resolveKeepLocal = useCallback(async () => {
    if (!conflict || conflictBusy) return;
    const local = useFlowStore.getState().tabs.find((tab) => tab.id === conflict.localTabId);
    if (!local) return;
    setConflictBusy(true);
    try {
      const prepared = await copyProjectScopedMasks({
        sourceProjectId: local.projectId,
        targetProjectId: conflict.server.id,
        flow: persistedWorkflowForProjectTab(local),
      });
      const draft = await syncInitialDraft({
        id: conflict.server.id,
        expectedRevision: conflict.server.revision,
        name: local.projectName,
        flow: prepared.flow,
      });
      applyDraft(local, draft, { forceDirty: true });
      setConflict(null);
      setSyncState("idle");
      setSyncError(null);
      setGateState("ready");
    } catch (error) {
      if (error instanceof InitialDraftApiError && error.status === 409) {
        const server = await fetchInitialDraft().catch(() => null);
        if (server) setConflict({ localTabId: local.id, server });
      }
      setSyncState("error");
      setSyncError(error instanceof Error ? error.message : String(error));
    } finally {
      setConflictBusy(false);
    }
  }, [conflict, conflictBusy]);

  const resolveUseServer = useCallback(async () => {
    if (!conflict || conflictBusy) return;
    const local = useFlowStore.getState().tabs.find((tab) => tab.id === conflict.localTabId);
    if (!local) return;
    setConflictBusy(true);
    try {
      const backup = await copyProjectScopedMasks({
        sourceProjectId: local.projectId,
        createFreshTarget: true,
        flow: persistedWorkflowForProjectTab(local),
      });
      applyDraft(local, conflict.server, {
        preserveLocalBackup: { projectId: backup.targetProjectId, flow: backup.flow },
      });
      setConflict(null);
      setSyncState("idle");
      setSyncError(null);
      setGateState("ready");
    } catch (error) {
      setSyncState("error");
      setSyncError(error instanceof Error ? error.message : String(error));
    } finally {
      setConflictBusy(false);
    }
  }, [conflict, conflictBusy]);

  const abandon = useCallback(async (tabId: string): Promise<boolean> => {
    if (abandoningTabId) return false;
    const tab = useFlowStore.getState().tabs.find((candidate) => candidate.id === tabId);
    if (!tab || projectTabLifecycle(tab) !== "initial_draft") return false;
    setAbandoningTabId(tabId);
    setSyncError(null);
    try {
      const settled = await settleInitialDraftBeforeAbandon(
        tabId,
        () => useFlowStore.getState().tabs.find((candidate) => candidate.id === tabId),
        synchronizeTab,
        () => syncInFlight.current !== null,
      );
      if (!settled) return false;
      await abandonInitialDraft({
        id: settled.projectId,
        expectedRevision: settled.draftRevision ?? 0,
      });
      const fresh = replaceAbandonedInitialDraftWithFreshLocalTab(tabId);
      if (!fresh) throw new Error("初始草稿已变化，请刷新后重试");
      // 方案 C：放弃后重建的是空白本地 tab，不立即落库；首次实质变更才由首次落库 effect 触发。
      setSyncState("idle");
      return true;
    } catch (error) {
      if (error instanceof InitialDraftApiError && error.status === 409) {
        const server = await fetchInitialDraft().catch(() => null);
        const latest = useFlowStore.getState().tabs.find((candidate) => candidate.id === tabId);
        if (server && latest) setConflict({ localTabId: latest.id, server });
      }
      setSyncState("error");
      setSyncError(error instanceof Error ? error.message : String(error));
      const latest = useFlowStore.getState().tabs.find((candidate) => candidate.id === tabId);
      if (!latest || projectTabLifecycle(latest) !== "initial_draft") {
        setGateState("error");
        setGateError("旧草稿已放弃，但新的初始项目创建失败。请重试恢复；本机内容仍保留。 ");
      }
      return false;
    } finally {
      setAbandoningTabId(null);
    }
  }, [abandoningTabId, synchronizeTab]);

  const [clearDraftDialogOpen, setClearDraftDialogOpen] = useState(false);
  const [clearDraftBusy, setClearDraftBusy] = useState(false);

  const clearDraftAndRestart = useCallback(async () => {
    if (clearDraftBusy) return;
    setClearDraftBusy(true);
    setClearDraftDialogOpen(false);
    try {
      // 优先尝试强制清除云端草稿（无需 id/revision，适用于草稿损坏到无法解析的场景）
      let serverCleared = false;
      try {
        serverCleared = await forceClearInitialDraft();
      } catch {
        // 端点不存在或清除失败，降级为尝试用本机已知 id 清除
      }

      // 如果强制清除端点不可用，尝试用本机 initial_draft tab 的信息清除
      if (!serverCleared) {
        const state = useFlowStore.getState();
        const initialDraftTab = state.tabs.find(
          (tab) => projectTabLifecycle(tab) === "initial_draft",
        );
        if (initialDraftTab) {
          try {
            await abandonInitialDraft({
              id: initialDraftTab.projectId,
              expectedRevision: initialDraftTab.draftRevision ?? 0,
            });
            serverCleared = true;
          } catch {
            // 云端清除失败（可能 id 不匹配或 revision 冲突），继续本地清除
          }
        }
      }

      // 清除本机 sessionStorage 中的草稿数据
      clearProjectTabSessionStorage(window.sessionStorage);

      // 重置内存状态：替换 initial_draft tab 为 fresh local tab，或创建新 tab
      const state = useFlowStore.getState();
      const initialDraftTab = state.tabs.find(
        (tab) => projectTabLifecycle(tab) === "initial_draft",
      );
      const freshTab = replaceAbandonedInitialDraftWithFreshLocalTab(
        initialDraftTab?.id ?? state.activeTabId,
      );
      if (!freshTab) {
        // 如果当前 tab 不是 initial_draft，直接创建新 tab
        useFlowStore.getState().createBlankTab();
      }

      if (!serverCleared) {
        // 云端草稿未能清除，提示用户需要服务端支持
        setGateState("error");
        setGateError("本地草稿已清除，但云端草稿未能清除。请刷新后重试；若问题持续，请联系管理员。");
        return;
      }

      // 重新初始化（会触发 bootstrap 或 restore）
      setAttempt((value) => value + 1);
    } finally {
      setClearDraftBusy(false);
    }
  }, [clearDraftBusy]);

  const context = useMemo<InitialDraftContextValue>(() => ({
    syncState,
    syncError,
    retrySync,
    abandon,
    abandoningTabId,
  }), [abandon, abandoningTabId, retrySync, syncError, syncState]);

  if (gateState !== "ready") {
    return (
      <>
        <BlockingScreen
          state={gateState}
          error={gateError}
          onRetry={() => setAttempt((value) => value + 1)}
          onClearDraft={() => setClearDraftDialogOpen(true)}
          clearDraftBusy={clearDraftBusy}
        />
        <AlertDialog open={clearDraftDialogOpen} onOpenChange={setClearDraftDialogOpen}>
          <AlertDialogContent
            overlayClassName="z-[70] bg-black/75 backdrop-blur-sm"
            className="z-[71] border border-[var(--gc-border)] bg-[var(--gc-panel)] text-[var(--gc-text)] ring-0"
          >
            <AlertDialogHeader>
              <AlertDialogTitle>清除未保存草稿？</AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-[var(--gc-text-muted)]">
                这将丢弃当前无法恢复的未保存草稿并创建一份全新的空白草稿。本地内容会被立即清除；云端内容会尝试同步清除。此操作不可撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="border-[var(--gc-border)] bg-[var(--gc-panel-soft)]">
              <AlertDialogCancel disabled={clearDraftBusy}>取消</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={clearDraftBusy}
                onClick={() => void clearDraftAndRestart()}
              >
                {clearDraftBusy && <LoaderCircleIcon aria-hidden="true" className="size-3.5 animate-spin" />}
                确认清除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }
  return (
    <InitialDraftContext.Provider value={context}>
      {children}
      {conflict && (
        <ConflictDialog
          conflict={conflict}
          busy={conflictBusy}
          onKeepLocal={() => void resolveKeepLocal()}
          onUseServer={() => void resolveUseServer()}
        />
      )}
    </InitialDraftContext.Provider>
  );
}

export function InitialDraftSyncNotice() {
  const { syncState, syncError, retrySync } = useInitialDraftWorkspace();
  if (syncState !== "error") {
    return syncState === "syncing" ? (
      <span role="status" aria-live="polite" className="sr-only">
        正在同步未保存项目
      </span>
    ) : null;
  }
  return (
    <Card
      role="alert"
      size="sm"
      className="gc-panel shrink-0 gap-0 rounded-none border-x-0 border-t-0 border-[var(--gc-border)] bg-[var(--gc-panel)] py-0 ring-0"
    >
      <CardContent className="flex min-h-9 items-center justify-center gap-3 px-3 py-1.5 text-center">
        <CloudIcon aria-hidden="true" className="size-3.5 text-amber-300" />
        <p className="text-[11px] text-amber-300">
          云端草稿同步失败；本机内容已保留。{syncError ?? ""}
        </p>
        <Button type="button" variant="outline" size="sm" onClick={retrySync}>重试同步</Button>
      </CardContent>
    </Card>
  );
}
