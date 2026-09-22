import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useFlowStore } from "@/store/flowStore";
import type { WorkflowTemplate } from "@/types/workflow";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { addCanvasNode } from "@/components/panels/canvasNodeActions";
import {
  WORKFLOW_MENU_MAPPING,
} from "@/lib/workflowMenuMapping";
import {
  inferTemplateLaunchMode,
  mergeTemplateIntoActiveCanvas,
} from "@/lib/templateLaunch";
import {
  RAIL_ENTRIES,
  RAIL_HISTORY,
  RAIL_SEPARATOR_BEFORE,
  type RailEntry,
  type RailMenuItem,
} from "./railConfig";

interface WorkbenchShellProps {
  children: ReactNode;
}

/** hover 弹出的工作流菜单：鼠标移入工具项自动展开、移开自动关闭 */
function WorkflowMenu({
  entry,
  open,
  onEnter,
  onLeave,
  onSelect,
}: {
  entry: RailEntry;
  open: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onSelect: (item: RailMenuItem) => void;
}) {
  return (
    <div
      role="menu"
      aria-label={entry.label}
      aria-hidden={!open}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={cn(
        "absolute left-[52px] top-0 z-40 w-[218px] rounded-2xl border border-[var(--gc-node-border,var(--gc-border))] bg-[var(--gc-panel)] p-1.5",
        "shadow-[0_0_0_.5px_rgba(0,0,0,.06),0_4px_10px_rgba(0,0,0,.12),0_16px_40px_rgba(0,0,0,.16)]",
        "origin-left transition-[opacity,transform,visibility] duration-200",
        open
          ? "visible opacity-100 translate-x-0 scale-100"
          : "invisible opacity-0 -translate-x-1.5 scale-[.98] pointer-events-none",
      )}
    >
      <h4 className="px-2.5 pb-1 pt-1.5 text-[11px] font-semibold text-[var(--gc-text-muted)]">
        {entry.label.replace("工作流", "")}
      </h4>
      {entry.items?.map((item) => (
        <button
          key={item.id}
          type="button"
          role="menuitem"
          onClick={() => onSelect(item)}
          className="group flex w-full items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-left text-[13px] text-[var(--gc-text)] transition-colors hover:bg-[var(--gc-accent)] hover:text-[var(--gc-accent-cta-ink,#131313)] focus-visible:outline-2 focus-visible:outline-[var(--gc-accent)] focus-visible:outline-offset-[-2px]"
        >
          <span className="flex h-7 w-7 flex-none items-center justify-center text-[var(--gc-text-muted)] transition-colors group-hover:text-[var(--gc-accent-cta-ink,#131313)]">
            {item.icon}
          </span>
          <span className="flex-1 tracking-[-0.1px]">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

/** 单个工具项：hover 计时展开、离开计时关闭 */
function RailTool({
  entry,
  primary,
  onSelectItem,
}: {
  entry: RailEntry;
  primary?: boolean;
  onSelectItem: (entry: RailEntry, item: RailMenuItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasMenu = !!entry.items?.length;

  const clearTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const handleEnter = () => {
    if (!hasMenu) return;
    clearTimers();
    openTimer.current = setTimeout(() => setOpen(true), 120);
  };
  const handleLeave = () => {
    if (!hasMenu) return;
    clearTimers();
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  };
  const keepOpen = () => clearTimers();

  const handleClick = () => {
    if (!hasMenu) {
      // 无菜单工具入口（AI 画板）：功能映射待定义
      return;
    }
    setOpen((v) => !v);
  };

  const button = (
    <Button
      type="button"
      variant="ghost"
      aria-haspopup={hasMenu ? "menu" : undefined}
      aria-expanded={hasMenu ? open : undefined}
      aria-label={entry.label}
      onClick={handleClick}
      className={cn(
        "relative h-10 w-10 rounded-xl text-[var(--gc-text-muted)] transition-colors duration-150",
        "hover:bg-[var(--gc-accent)] hover:text-[var(--gc-accent-cta-ink,#131313)]",
        "focus-visible:outline-2 focus-visible:outline-[var(--gc-accent)] focus-visible:outline-offset-2",
        // 二级菜单展开时图标保持点亮（与 hover 同色）。
        open &&
          "bg-[var(--gc-accent)] text-[var(--gc-accent-cta-ink,#131313)]",
        primary &&
          "h-10 w-10 rounded-full bg-[var(--gc-accent)] text-[var(--gc-accent-cta-ink,#131313)] shadow-[0_3px_10px_color-mix(in_srgb,var(--gc-accent)_35%,transparent)] hover:bg-[var(--gc-accent)]",
      )}
    >
      <span className="flex items-center justify-center [&>svg]:h-[21px] [&>svg]:w-[21px]">
        {entry.icon}
      </span>
    </Button>
  );

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
    >
      <Tooltip>
        <TooltipTrigger render={button} />
        <TooltipContent side="right" className="z-50">
          {entry.label}
        </TooltipContent>
      </Tooltip>
      {hasMenu && (
        <WorkflowMenu
          entry={entry}
          open={open}
          onEnter={keepOpen}
          onLeave={handleLeave}
          onSelect={(item) => {
            setOpen(false);
            onSelectItem(entry, item);
          }}
        />
      )}
    </div>
  );
}

/** 历史组（撤销/重做）：渲染进主工具胶囊底部，中间以分隔线隔开。 */
function HistoryRail() {
  const undo = useFlowStore((s) => s.undo);
  const redo = useFlowStore((s) => s.redo);

  return (
    <>
      <span
        role="separator"
        aria-hidden="true"
        className="my-1 h-px w-[22px] bg-[var(--gc-node-border,var(--gc-border))]"
      />
      {RAIL_HISTORY.map((item, i) => (
        <Tooltip key={item.id}>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                aria-label={item.label}
                onClick={i === 0 ? undo : redo}
                className="h-10 w-10 rounded-xl text-[var(--gc-text-muted)] hover:bg-[var(--gc-accent)] hover:text-[var(--gc-accent-cta-ink,#131313)] motion-reduce:transition-none"
              />
            }
          >
            <svg
              viewBox="0 0 24 24"
              className="h-[21px] w-[21px]"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {i === 0 ? (
                <>
                  <path d="M9 14 4 9l5-5" />
                  <path d="M4 9h11a5 5 0 0 1 5 5 5 5 0 0 1-5 5H8" />
                </>
              ) : (
                <>
                  <path d="m15 14 5-5-5-5" />
                  <path d="M20 9H9a5 5 0 0 0-5 5 5 5 0 0 0 5 5h7" />
                </>
              )}
            </svg>
          </TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      ))}
    </>
  );
}

/**
 * 桌面工作台保持同一棵中心内容树。左侧悬浮胶囊入口（6 工作流 + 历史组），
 * 任一入口的开合都不覆盖画布，也不重建 React Flow 或 Results 业务子树。
 *
 * 2026-09-25 决策：左侧 Dock（节点库 / 属性）与它的「属性 / 结果」入口已整体移除，
 * 因此这里不再有面板状态、也不再有 Dock 宽度变化事件。
 */
export function WorkbenchShell({ children }: WorkbenchShellProps) {
  // 用户 2026-09-25 决策 4：没有打开任何页签时（刚登录 / 关掉全部页签），
  // 工具栏不显示，画布区由 EmptyWorkspaceCTA 的「新建 / 打开」引导接管。
  const workspaceEmpty = useFlowStore((s) => s.tabs.length === 0);

  const [workflowStatus, setWorkflowStatus] = useState<{
    kind: "loading" | "pending" | "error";
    message: string;
  } | null>(null);
  const [workflowStatusDismiss, setWorkflowStatusDismiss] = useState<ReturnType<typeof setTimeout> | null>(null);

  // 工作流菜单项选择：基础节点直接建（「添加」菜单）；工作流项按映射表拉内置模板，
  // 合并进当前活动画布（右侧扩展），不新建页签（用户 2026-09-25 决策）。
  const handleSelectItem = useCallback(
    (_entry: RailEntry, item: RailMenuItem) => {
      if (item.nodeKind) {
        addCanvasNode(item.nodeKind);
        return;
      }
      if (item.needsNodeContext) {
        setWorkflowStatus({ kind: "pending", message: "先在画布上选中一个节点，再选择资产" });
        return;
      }
      const binding = WORKFLOW_MENU_MAPPING[item.id];
      if (!binding) {
        setWorkflowStatus({ kind: "error", message: `未找到工作流「${item.label}」，请刷新后重试` });
        return;
      }
      if (!binding.templateId) {
        setWorkflowStatus({ kind: "pending", message: binding.pendingReason ?? "功能正在开发中" });
        return;
      }
      const templateId = binding.templateId;
      const label = item.label;
      const run = async () => {
        setWorkflowStatus({ kind: "loading", message: `正在加载「${label}」工作流…` });
        try {
          const response = await fetch("/api/templates");
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const templates = await response.json() as WorkflowTemplate[];
          const template = templates.find((candidate) => candidate.id === templateId);
          if (!template) throw new Error("内置模板不存在");
          mergeTemplateIntoActiveCanvas(template, inferTemplateLaunchMode(template));
          setWorkflowStatus(null);
        } catch (error) {
          setWorkflowStatus({
            kind: "error",
            message: `加载「${label}」失败：${error instanceof Error ? error.message : String(error)}`,
          });
        }
      };
      void run();
    },
    [],
  );

  useEffect(() => {
    if (!workflowStatus || workflowStatus.kind === "loading" || workflowStatusDismiss) return;
    const timer = setTimeout(() => setWorkflowStatus(null), 5000);
    setWorkflowStatusDismiss(timer);
    return () => {
      if (timer) clearTimeout(timer);
      setWorkflowStatusDismiss(null);
    };
  }, [workflowStatus, workflowStatusDismiss]);

  return (
    <TooltipProvider delay={250}>
      <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
        {/* 悬浮主工具胶囊：空工作区（无页签）隐藏 */}
        {!workspaceEmpty && (
        <nav
          aria-label="工作台左侧工具"
          className="absolute left-4 top-4 z-40 flex flex-col items-center gap-0.5 rounded-2xl border border-[var(--gc-node-border,var(--gc-border))] bg-[var(--gc-panel)] p-1.5 shadow-[0_0_0_.5px_rgba(0,0,0,.06),0_4px_10px_rgba(0,0,0,.12),0_16px_40px_rgba(0,0,0,.16)] motion-reduce:transition-none"
        >
          {RAIL_ENTRIES.map((entry, index) => (
            <div key={entry.id} className="contents">
              {RAIL_SEPARATOR_BEFORE.includes(index as 1 | 4) && (
                <span role="separator" className="my-1 h-px w-[22px] bg-[var(--gc-node-border,var(--gc-border))]" />
              )}
              <RailTool
                entry={entry}
                primary={index === 0}
                onSelectItem={handleSelectItem}
              />
            </div>
          ))}
          {/* 撤销/重做：固定在工具胶囊底部，与上方工具条以分隔线隔开。 */}
          <HistoryRail />
        </nav>
        )}

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
            {children}
          </div>
          {workflowStatus && (
            <div
              role={workflowStatus.kind === "error" ? "alert" : "status"}
              aria-live="polite"
              className="pointer-events-none absolute inset-x-0 top-4 z-50 flex justify-center"
            >
              <span className="pointer-events-auto rounded-full border border-[var(--gc-node-border,var(--gc-border))] bg-[var(--gc-panel)] px-4 py-1.5 text-xs text-[var(--gc-text)] shadow-lg">
                {workflowStatus.kind === "loading" && (
                  <span className="mr-1 inline-block animate-spin">◌</span>
                )}
                {workflowStatus.message}
              </span>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
