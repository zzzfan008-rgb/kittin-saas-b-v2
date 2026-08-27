import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { PlusIcon, SaveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCoalescedTextEdit } from "@/hooks/useCoalescedTextEdit";
import {
  flushActiveTextEdit,
  projectTabLifecycle,
  useFlowStore,
  type ProjectTab,
} from "@/store/flowStore";
import { useGenerationSafetyBlockReason } from "@/store/generationSafety";
import { isNodeRunActive } from "@/types/workflow";
import { useInitialDraftWorkspace } from "@/initialDraft/InitialDraftWorkspace";
import { ProjectCenter } from "./ProjectCenter";

function hasRunningNode(tab: ProjectTab): boolean {
  return tab.nodes.some((node) => isNodeRunActive(node.data.status));
}

export function ProjectTabs() {
  const tabs = useFlowStore((state) => state.tabs);
  const activeTabId = useFlowStore((state) => state.activeTabId);
  const switchTab = useFlowStore((state) => state.switchTab);
  const closeTab = useFlowStore((state) => state.closeTab);
  const saveProject = useFlowStore((state) => state.saveProject);
  const [projectCenterOpen, setProjectCenterOpen] = useState(false);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const editingInputRef = useRef<HTMLInputElement>(null);
  const projectNameEdit = useCoalescedTextEdit(
    editingTabId === activeTabId ? { kind: "project-name" } : null,
  );
  const runReconciliationBlockReason = useGenerationSafetyBlockReason();
  const { abandon, abandoningTabId } = useInitialDraftWorkspace();

  useEffect(() => {
    if (!editingTabId) return;
    const frame = requestAnimationFrame(() => {
      editingInputRef.current?.focus();
      editingInputRef.current?.select();
    });
    return () => cancelAnimationFrame(frame);
  }, [editingTabId]);

  const finishRename = async (persist: boolean) => {
    projectNameEdit.flush();
    if (persist) await saveProject();
    setEditingTabId(null);
  };

  const beginRename = (tab: ProjectTab) => {
    if (tab.readOnly) return;
    if (tab.id !== activeTabId) switchTab(tab.id);
    setEditingTabId(tab.id);
  };

  const handleRenameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      projectNameEdit.cancel();
      setEditingTabId(null);
      return;
    }
    projectNameEdit.bind.onKeyDown(event);
    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void finishRename(true);
    }
  };

  const requestClose = async (tab: ProjectTab) => {
    flushActiveTextEdit();
    const latestTab = useFlowStore.getState().tabs.find((candidate) => candidate.id === tab.id);
    if (!latestTab) return;
    const warnings: string[] = [];
    if (runReconciliationBlockReason) {
      window.alert(`${runReconciliationBlockReason}。为避免运行中的付费结果失去画布，暂时不能关闭项目页签。`);
      return;
    }
    if (hasRunningNode(latestTab)) {
      window.alert("生成任务运行中，请等待任务完成后再关闭项目页签；结果会继续写回当前画布。");
      return;
    }
    if (projectTabLifecycle(latestTab) === "initial_draft") {
      const firstConfirmed = window.confirm(
        `${latestTab.projectName} 是当前账号唯一的未保存初始项目。放弃后它会从工作台移除，并进入 15 天恢复期。是否继续？`,
      );
      if (!firstConfirmed) return;
      const secondConfirmed = window.confirm(
        `再次确认放弃 ${latestTab.projectName}？系统随后会创建一个全新的未保存初始项目。`,
      );
      if (!secondConfirmed) return;
      const abandoned = await abandon(latestTab.id);
      if (!abandoned) window.alert("未能放弃当前初始项目，请根据工作台提示重试。");
      return;
    }
    if (latestTab.dirty) warnings.push("有未保存修改");
    if (
      warnings.length > 0 &&
      !window.confirm(`${latestTab.projectName}：${warnings.join("，")}。确定关闭这个项目页签吗？`)
    ) {
      return;
    }
    closeTab(latestTab.id);
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
                <div className="flex min-w-0 flex-1 items-center rounded-md border border-[var(--gc-accent)] bg-[var(--gc-control)] pl-2">
                  <input
                    ref={editingInputRef}
                    value={tab.projectName}
                    onChange={projectNameEdit.bind.onChange}
                    onBlur={projectNameEdit.bind.onBlur}
                    onCompositionStart={projectNameEdit.bind.onCompositionStart}
                    onCompositionEnd={projectNameEdit.bind.onCompositionEnd}
                    onKeyDown={handleRenameKeyDown}
                    onKeyUp={projectNameEdit.bind.onKeyUp}
                    aria-label="项目名称"
                    className="h-6 min-w-0 flex-1 bg-transparent text-[11px] text-[var(--gc-text)] outline-hidden"
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
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => switchTab(tab.id)}
                  onDoubleClick={() => beginRename(tab)}
                  className="min-w-0 flex-1 truncate text-left text-[11px]"
                  title={tab.readOnly ? `${tab.projectName}（只读）` : `${tab.projectName} · 双击重命名`}
                >
                  {tab.projectName}
                </button>
              )}

              {!editing && (
                <button
                  type="button"
                  onClick={() => void requestClose(tab)}
                  disabled={abandoningTabId === tab.id}
                  aria-label={`关闭 ${tab.projectName}`}
                  title="关闭页签"
                  className="ml-1 rounded-sm px-1 text-[13px] leading-5 text-[var(--gc-text-muted)] hover:bg-white/5 hover:text-[var(--gc-text)] disabled:cursor-wait disabled:opacity-40"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setProjectCenterOpen(true)}
          aria-label="打开项目中心"
          title="新建或打开项目"
          className="mb-1 text-[var(--gc-text-muted)] hover:text-[var(--gc-accent)]"
        >
          <PlusIcon aria-hidden="true" className="size-4" />
        </Button>
      </nav>
      <ProjectCenter open={projectCenterOpen} onOpenChange={setProjectCenterOpen} />
    </>
  );
}
