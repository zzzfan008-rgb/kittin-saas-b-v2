import { lazy, Suspense, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { PlusIcon, SaveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCoalescedTextEdit } from "@/hooks/useCoalescedTextEdit";
import { OPEN_PROJECT_CENTER_EVENT } from "@/lib/overlayEvents";
import {
  flushActiveTextEdit,
  projectTabCloseBlockReason,
  useFlowStore,
  type ProjectTab,
} from "@/store/flowStore";
import {
  getGenerationSafetyBlockReason,
  useGenerationSafetyBlockReason,
} from "@/store/generationSafety";
import { isNodeRunActive } from "@/types/workflow";

const loadProjectCenter = () => import("./ProjectCenter");
const LazyProjectCenter = lazy(() => loadProjectCenter().then((module) => ({
  default: module.ProjectCenter,
})));

function hasRunningNode(tab: ProjectTab): boolean {
  return tab.nodes.some((node) => isNodeRunActive(node.data.status));
}

export function ProjectTabs() {
  const tabs = useFlowStore((state) => state.tabs);
  const activeTabId = useFlowStore((state) => state.activeTabId);
  const switchTab = useFlowStore((state) => state.switchTab);
  const saveProject = useFlowStore((state) => state.saveProject);
  const [projectCenterOpen, setProjectCenterOpen] = useState(false);
  const [projectCenterRequested, setProjectCenterRequested] = useState(false);
  // 生成安全门（确认运行历史）未收敛前，恢复页签的关闭仍被封锁：用同一真相把 × 置灰。
  const generationSafetyBlockReason = useGenerationSafetyBlockReason();
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [renameError, setRenameError] = useState<string | null>(null);
  const editingInputRef = useRef<HTMLInputElement>(null);
  const renameComposingRef = useRef(false);
  const projectNameEdit = useCoalescedTextEdit(
    editingTabId === activeTabId ? { kind: "project-name" } : null,
  );

  // 空工作区引导的「打开项目」落到这里（项目中心宿主仍是页签栏）。
  useEffect(() => {
    const openProjectCenter = () => {
      setProjectCenterRequested(true);
      setProjectCenterOpen(true);
    };
    window.addEventListener(OPEN_PROJECT_CENTER_EVENT, openProjectCenter);
    return () => window.removeEventListener(OPEN_PROJECT_CENTER_EVENT, openProjectCenter);
  }, []);

  useEffect(() => {
    if (!editingTabId) return;
    const frame = requestAnimationFrame(() => {
      editingInputRef.current?.focus();
      editingInputRef.current?.select();
    });
    return () => cancelAnimationFrame(frame);
  }, [editingTabId]);

  const finishRename = async (persist: boolean) => {
    if (renameComposingRef.current) return;
    projectNameEdit.flush();
    if (persist) {
      setRenameError(null);
      const saved = await saveProject();
      if (!saved) {
        setRenameError("保存失败，请检查网络后重试");
        requestAnimationFrame(() => editingInputRef.current?.focus());
        return;
      }
    }
    renameComposingRef.current = false;
    setRenameError(null);
    setEditingTabId(null);
  };

  const beginRename = (tab: ProjectTab) => {
    if (tab.readOnly) return;
    if (tab.id !== activeTabId) switchTab(tab.id);
    renameComposingRef.current = false;
    setRenameError(null);
    setEditingTabId(tab.id);
  };

  const handleRenameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const composing = event.nativeEvent.isComposing || renameComposingRef.current;
    if (event.key === "Escape" && !composing) {
      event.preventDefault();
      projectNameEdit.cancel();
      renameComposingRef.current = false;
      setRenameError(null);
      setEditingTabId(null);
      return;
    }
    projectNameEdit.bind.onKeyDown(event);
    if (event.key === "Enter" && !composing) {
      event.preventDefault();
      void finishRename(true);
    }
  };

  const requestClose = async (tab: ProjectTab) => {
    flushActiveTextEdit();
    const latestTab = useFlowStore.getState().tabs.find((candidate) => candidate.id === tab.id);
    if (!latestTab) return;
    const state = useFlowStore.getState();
    // 运行中的付费任务 / 未完成的历史对账都不能关（否则结果失去画布）：硬保护保留，
    // 但不再用 alert 打断——原因常驻在 × 的 title 里，点了也不会「没反应」。
    if (projectTabCloseBlockReason(latestTab, getGenerationSafetyBlockReason())) return;
    const pristine = latestTab.nodes.length === 0 && latestTab.edges.length === 0;
    // 有改动且非空白 → 先静默保存再关；空白且无改动 → 直接关；只读 → 直接关。
    if (latestTab.dirty && !pristine && !latestTab.readOnly) {
      await state.saveTabById(latestTab.id);
    }
    state.closeTab(latestTab.id);
  };

  return (
    <>
      <nav
        aria-label="项目画布页签"
        className="gc-panel flex h-10 min-w-[1024px] shrink-0 items-end gap-1 overflow-x-auto border-b border-[var(--gc-border)] bg-[var(--gc-shell)] px-3 pt-1"
      >
        {tabs.map((tab) => {
          const active = tab.id === activeTabId;
          const editing = active && editingTabId === tab.id;
          const running = hasRunningNode(tab);
          const closeBlockReason = projectTabCloseBlockReason(tab, generationSafetyBlockReason);
          return (
            <div
              key={tab.id}
              className={`group flex h-9 min-w-[172px] max-w-[280px] items-center rounded-t-lg border border-b-0 px-2 transition-colors ${
                active
                  ? "border-[var(--gc-border)] bg-[var(--gc-panel)] text-[var(--gc-text)]"
                  : "border-transparent bg-[var(--gc-panel-soft)] text-[var(--gc-text-muted)] hover:bg-[var(--gc-panel)] hover:text-[var(--gc-text)]"
              }`}
            >
              <span
                aria-hidden="true"
                className={`mr-2 size-2 shrink-0 rounded-full ${
                  running
                    ? "animate-pulse bg-blue-400"
                    : tab.dirty
                      ? "bg-[var(--gc-accent)]"
                      : "bg-neutral-600"
                }`}
              />

              {editing ? (
                <div className="relative flex min-w-0 flex-1 items-center rounded-md border border-[var(--gc-accent)] bg-[var(--gc-control)] pl-2">
                  <input
                    ref={editingInputRef}
                    value={tab.projectName}
                    onChange={projectNameEdit.bind.onChange}
                    onBlur={(event) => {
                      projectNameEdit.bind.onBlur(event);
                      renameComposingRef.current = false;
                      setRenameError(null);
                      setEditingTabId(null);
                    }}
                    onCompositionStart={(event) => {
                      renameComposingRef.current = true;
                      projectNameEdit.bind.onCompositionStart(event);
                    }}
                    onCompositionEnd={(event) => {
                      projectNameEdit.bind.onCompositionEnd(event);
                      renameComposingRef.current = false;
                    }}
                    onKeyDown={handleRenameKeyDown}
                    onKeyUp={projectNameEdit.bind.onKeyUp}
                    aria-label="项目名称"
                    className="h-6 min-w-0 flex-1 bg-transparent text-label text-[var(--gc-text)] outline-hidden"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    disabled={tab.readOnly || tab.saveState === "saving"}
                    aria-label="保存项目名称和画布"
                    title="保存（Enter）"
                    onPointerDown={(event) => event.preventDefault()}
                    onClick={() => void finishRename(true)}
                    className="rounded-l-none text-[var(--gc-accent)] hover:bg-[var(--gc-panel-hover)]"
                  >
                    <SaveIcon aria-hidden="true" className="size-3" />
                  </Button>
                  {renameError && (
                    <span
                      role="alert"
                      className="absolute left-0 top-full z-50 mt-1 whitespace-nowrap rounded-md border border-red-500/40 bg-red-950 px-2 py-1 text-label text-red-200 shadow-lg"
                    >
                      {renameError}
                    </span>
                  )}
                </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => switchTab(tab.id)}
                  onDoubleClick={() => beginRename(tab)}
                  className="h-auto min-w-0 flex-1 justify-start truncate rounded-sm px-0 py-0 text-label font-normal hover:bg-transparent"
                  title={tab.readOnly ? `${tab.projectName}（只读）` : `${tab.projectName} · 双击重命名`}
                >
                  {tab.projectName}
                </Button>
              )}

              {!editing && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => void requestClose(tab)}
                  aria-label={`关闭 ${tab.projectName}`}
                  disabled={closeBlockReason !== null}
                  title={closeBlockReason ?? "关闭页签"}
                  className="ml-1 size-auto rounded-sm px-1 py-0 text-[13px] font-normal leading-5 text-[var(--gc-text-muted)] hover:bg-white/5 hover:text-[var(--gc-text)] disabled:cursor-wait disabled:opacity-40"
                >
                  ×
                </Button>
              )}
            </div>
          );
        })}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onFocus={() => void loadProjectCenter()}
          onPointerEnter={() => void loadProjectCenter()}
          onClick={() => {
            setProjectCenterRequested(true);
            setProjectCenterOpen(true);
          }}
          aria-label="打开项目中心"
          title="新建或打开项目"
          className="mb-1 text-[var(--gc-text-muted)] hover:text-[var(--gc-accent)]"
        >
          <PlusIcon aria-hidden="true" className="size-4" />
        </Button>
      </nav>
      {projectCenterRequested && (
        <Suspense fallback={null}>
          <LazyProjectCenter open={projectCenterOpen} onOpenChange={setProjectCenterOpen} />
        </Suspense>
      )}
    </>
  );
}
