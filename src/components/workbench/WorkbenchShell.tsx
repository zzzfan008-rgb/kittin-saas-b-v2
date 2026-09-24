/**
 * 卡 #58 修复 + 卡 #60 DrawingCanvas 集成。
 *
 * #58 hover 桥修复（RailTool 菜单空隙）：
 * - 加透明 hover 桥填充按钮右缘 (40px) 到菜单左缘 (52px) 之间的 12px 物理空隙。
 * - 点亮状态 = open ∨ menuHover（跨 hover/click 两种打开方式）。
 * - 粘性模式下关闭计时不生效。
 * - 点击关闭后抑制 hover 重开（#58 fix — 约 120-150ms 后 hover 重开的根因）。
 * - 手风琴式单开 — openMenuId 提升到 WorkbenchShell 层（Tab 遍历不再同时多开）。
 * - Escape 键关闭当前菜单（WAI-ARIA）。
 *
 * #60 Excalidraw AI 画板集成：
 * - RailEntry id="canvas" 触发 DrawingCanvas 覆盖层。
 * - DrawingCanvas 作为独立 lazy chunk。
 */
import {
  lazy,
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
import { WORKFLOW_MENU_MAPPING } from "@/lib/workflowMenuMapping";
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

/** DrawingCanvas lazy load（与 vite.config.ts manualChunk 保持一致）。 */
const LazyDrawingCanvas = lazy(() =>
  import("@/components/drawing/DrawingCanvas").then((m) => ({
    default: m.DrawingCanvas,
  })),
);

interface WorkbenchShellProps {
  children: ReactNode;
}

/** hover 弹出的工作流菜单：鼠标移入工具项自动展开、移开自动关闭。 */
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
      <h4 className="px-2.5 pb-1 pt-1.5 text-label font-semibold text-[var(--gc-text-muted)]">
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
          <span className="flex-1 truncate">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * 单个悬浮工具项（含菜单/无菜单）。
 * #58 hover 桥：透明 div 填充按钮右缘到菜单左缘之间的 12px 空隙。
 *
 * open/close 状态由父组件 WorkbenchShell 通过 openMenuId 管理（手风琴式单开）。
 * 本地管理：sticky（点击切换）、menuHover、关闭计时器、以及点击后短时抑制 hover 重开。
 */
function RailTool({
  entry,
  primary,
  open,
  onSelectItem,
  onOpenTool,
  onRequestOpen,
  onRequestClose,
}: {
  entry: RailEntry;
  primary?: boolean;
  open: boolean;
  onSelectItem: (entry: RailEntry, item: RailMenuItem) => void;
  /** 无菜单的工具项被点击（目前仅 id="canvas"）。 */
  onOpenTool: (toolId: string) => void;
  onRequestOpen: (entryId: string) => void;
  onRequestClose: (entryId: string) => void;
}) {
  const [sticky, setSticky] = useState(false);
  const [menuHover, setMenuHover] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** 点击关闭后 250ms 内抑制 hover 打开（#58 fix — 防止点击关闭后被 hover 重开）。 */
  const suppressHoverRef = useRef(false);
  const hasMenu = !!entry.items?.length;

  const clearTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const handleEnter = () => {
    if (!hasMenu) return;
    // 点击关闭后的短暂抑制期内不响应 hover 打开
    if (suppressHoverRef.current) return;
    clearTimers();
    openTimer.current = setTimeout(() => onRequestOpen(entry.id), 120);
  };

  const handleLeave = () => {
    if (!hasMenu) return;
    clearTimers();
    if (!sticky) {
      closeTimer.current = setTimeout(() => onRequestClose(entry.id), 200);
    }
  };

  const keepOpen = () => {
    clearTimers();
    setMenuHover(true);
  };

  const handleMenuLeave = () => {
    setMenuHover(false);
    if (!sticky) {
      clearTimers();
      closeTimer.current = setTimeout(() => onRequestClose(entry.id), 200);
    }
  };

  const handleClick = () => {
    if (!hasMenu) {
      onOpenTool(entry.id);
      return;
    }
    if (open) {
      // 关闭：设抑制标志防 hover 重开（#58 fix）
      suppressHoverRef.current = true;
      setTimeout(() => {
        suppressHoverRef.current = false;
      }, 250);
      setSticky(false);
      onRequestClose(entry.id);
    } else {
      // 打开：手风琴式（父级关掉其他）
      clearTimers();
      setSticky(true);
      onRequestOpen(entry.id);
    }
  };

  // 点亮 = 展开中 或 菜单hover中（跨 hover/click 两种打开方式）
  const isActive = open || menuHover;

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
        // #58: 点亮状态 = open ∨ menuHover（跨 hover/click）
        // !important 覆盖 Button ghost variant 的 aria-expanded:bg-muted
        isActive &&
          "!bg-[var(--gc-accent)] !text-[var(--gc-accent-cta-ink,#131313)]",
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
        <>
          {/*
           * #58 hover 桥：填充按钮右缘 (w-10=40px) 到菜单左缘 (left-[52px]) 之间的 12px 物理空隙，
           * 并额外延伸 4px 进入菜单区域（总计 16px），确保鼠标穿过空隙时不触发关闭计时。
           * pointer-events: auto 使其可被 hover；透明背景不干扰视觉。
           */}
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-auto absolute top-0 z-30 w-4",
              "h-10",
              "left-[40px]",
              "bg-transparent",
            )}
          />
          <WorkflowMenu
            entry={entry}
            open={open}
            onEnter={keepOpen}
            onLeave={handleMenuLeave}
            onSelect={(item) => {
              setSticky(false);
              suppressHoverRef.current = true;
              setTimeout(() => {
                suppressHoverRef.current = false;
              }, 250);
              onRequestClose(entry.id);
              onSelectItem(entry, item);
            }}
          />
        </>
      )}
    </div>
  );
}

/** 历史组（撤销/重做）：独立悬浮胶囊。 */
function HistoryRail() {
  const undo = useFlowStore((s) => s.undo);
  const redo = useFlowStore((s) => s.redo);

  return (
    <nav
      aria-label="撤销与重做"
      className="flex flex-col items-center gap-0.5 rounded-2xl border border-[var(--gc-node-border,var(--gc-border))] bg-[var(--gc-panel)] p-1.5 shadow-[0_0_0_.5px_rgba(0,0,0,.06),0_4px_10px_rgba(0,0,0,.12),0_16px_40px_rgba(0,0,0,.16)] motion-reduce:transition-none"
    >
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
                // undo
                <path d="M3 7v6h6" />
              ) : (
                // redo
                <path d="M21 7v6h-6" />
              )}
              <path
                d={i === 0 ? "M3 13A9 9 0 1 0 5.5 6.3" : "M21 13A9 9 0 1 1 18.5 6.3"}
              />
            </svg>
          </TooltipTrigger>
          <TooltipContent side="right" className="z-50">
            {item.label}
          </TooltipContent>
        </Tooltip>
      ))}
    </nav>
  );
}

/**
 * 桌面工作台保持同一棵中心内容树。左侧悬浮胶囊入口（6 工作流 + 历史组），
 * 任一入口的开合都不覆盖画布，也不重建 React Flow 或 Results 业务子树。
 *
 * openMenuId 管理：手风琴式单开（#58 fix — Tab 遍历不再同时多开），
 * Escape 键关闭（WAI-ARIA）。
 */
export function WorkbenchShell({ children }: WorkbenchShellProps) {
  const workspaceEmpty = useFlowStore((s) => s.tabs.length === 0);

  const [drawingOpen, setDrawingOpen] = useState(false);
  /** 手风琴式：当前打开的菜单 entryId，null = 全部关闭 */
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [workflowStatus, setWorkflowStatus] = useState<{
    kind: "loading" | "pending" | "error";
    message: string;
  } | null>(null);
  const [workflowStatusDismiss, setWorkflowStatusDismiss] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Escape 键关闭当前打开的菜单（WAI-ARIA 菜单模式）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && openMenuId !== null) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openMenuId]);

  const handleRequestOpen = useCallback((entryId: string) => {
    setOpenMenuId(entryId);
  }, []);

  const handleRequestClose = useCallback((entryId: string) => {
    setOpenMenuId((prev) => (prev === entryId ? null : prev));
  }, []);

  // 工作流菜单项选择：基础节点直接建（「添加」菜单）；工作流项按映射表拉内置模板。
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

  /** 无菜单工具项被点击（目前仅 id="canvas"）。 */
  const handleOpenTool = useCallback((toolId: string) => {
    if (toolId === "canvas") {
      setDrawingOpen(true);
    }
  }, []);

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
      {/* #60: DrawingCanvas 全屏覆盖层（lazy load） */}
      {drawingOpen && (
        <LazyDrawingCanvas onClose={() => setDrawingOpen(false)} />
      )}

      <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
        {/* 悬浮工具区：空工作区（无页签）隐藏 */}
        {!workspaceEmpty && (
        <div className="absolute left-4 top-4 z-40 flex flex-col gap-2">
          <nav
            aria-label="工作台左侧工具"
            className="flex flex-col items-center gap-0.5 rounded-2xl border border-[var(--gc-node-border,var(--gc-border))] bg-[var(--gc-panel)] p-1.5 shadow-[0_0_0_.5px_rgba(0,0,0,.06),0_4px_10px_rgba(0,0,0,.12),0_16px_40px_rgba(0,0,0,.16)] motion-reduce:transition-none"
          >
            {RAIL_ENTRIES.map((entry, index) => (
              <div key={entry.id} className="contents">
                {RAIL_SEPARATOR_BEFORE.includes(index as 1 | 4) && (
                  <span role="separator" className="my-1 h-px w-[22px] bg-[var(--gc-node-border,var(--gc-border))]" />
                )}
                <RailTool
                  entry={entry}
                  primary={index === 0}
                  open={openMenuId === entry.id}
                  onSelectItem={handleSelectItem}
                  onOpenTool={handleOpenTool}
                  onRequestOpen={handleRequestOpen}
                  onRequestClose={handleRequestClose}
                />
              </div>
            ))}
          </nav>
          {/* 撤销/重做：独立悬浮胶囊 */}
          <HistoryRail />
        </div>
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