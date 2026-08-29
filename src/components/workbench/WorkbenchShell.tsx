import { useEffect, useReducer, useSyncExternalStore, type ReactNode } from "react";
import {
  LibraryBigIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  INITIAL_WORKBENCH_UI_STATE,
  workbenchUiReducer,
} from "./workbenchState";

const LIBRARY_PANEL_ID = "workbench-library-panel";
const INSPECTOR_PANEL_ID = "workbench-inspector-panel";
const DOCK_EXCLUSIVE_MEDIA = "(max-width: 1279px)";

function subscribeDockExclusivity(onChange: () => void): () => void {
  const media = window.matchMedia(DOCK_EXCLUSIVE_MEDIA);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function dockExclusivitySnapshot(): boolean {
  return window.matchMedia(DOCK_EXCLUSIVE_MEDIA).matches;
}

interface WorkbenchShellProps {
  library: ReactNode;
  inspector: ReactNode;
  children: ReactNode;
}

interface RailButtonProps {
  label: string;
  controls: string;
  active: boolean;
  side: "left" | "right";
  onClick: () => void;
  icon: ReactNode;
}

function RailButton({ label, controls, active, side, onClick, icon }: RailButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        aria-label={label}
        aria-controls={controls}
        aria-expanded={active}
        aria-pressed={active}
        onClick={onClick}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon-lg" }),
          "text-[var(--gc-text-muted)] hover:bg-[var(--gc-panel-hover)] hover:text-[var(--gc-text)]",
          active && "bg-[var(--gc-panel-hover)] text-[var(--gc-accent)]",
        )}
      >
        {icon}
      </TooltipTrigger>
      <TooltipContent side={side === "left" ? "right" : "left"}>{label}</TooltipContent>
    </Tooltip>
  );
}

/**
 * 桌面工作台始终保持同一棵中心内容树。两侧 Dock 仅通过占位宽度
 * 开合，不覆盖画布，也不重建 React Flow 或面板业务子树。
 */
export function WorkbenchShell({ library, inspector, children }: WorkbenchShellProps) {
  const [state, dispatch] = useReducer(workbenchUiReducer, INITIAL_WORKBENCH_UI_STATE);
  const exclusiveDocks = useSyncExternalStore(
    subscribeDockExclusivity,
    dockExclusivitySnapshot,
    () => false,
  );

  useEffect(() => {
    if (exclusiveDocks && state.libraryOpen && state.inspectorOpen) {
      dispatch({ type: "enforce-exclusive" });
    }
  }, [exclusiveDocks, state.inspectorOpen, state.libraryOpen]);

  return (
    <TooltipProvider delay={250}>
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <nav
          aria-label="工作台左侧工具"
          className="gc-panel relative z-40 flex w-12 shrink-0 flex-col items-center border-r border-[var(--gc-border)] bg-[var(--gc-panel)] py-2"
        >
          <RailButton
            label="节点 / 素材"
            controls={LIBRARY_PANEL_ID}
            active={state.libraryOpen}
            side="left"
            onClick={() => dispatch({ type: "toggle-library", exclusive: exclusiveDocks })}
            icon={<LibraryBigIcon aria-hidden="true" />}
          />
        </nav>

        <aside
          id={LIBRARY_PANEL_ID}
          aria-label="节点 / 素材"
          aria-hidden={!state.libraryOpen}
          inert={!state.libraryOpen}
          className={cn(
            "gc-panel relative z-30 flex w-0 shrink-0 overflow-hidden bg-[var(--gc-panel)] transition-[width,visibility] duration-200 motion-reduce:transition-none",
            state.libraryOpen
              ? "visible w-60 border-r border-[var(--gc-border)]"
              : "invisible w-0 border-r-0",
          )}
        >
          <div className="flex h-full min-h-0 w-60 shrink-0">{library}</div>
        </aside>

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
            {children}
          </div>
        </div>

        <aside
          id={INSPECTOR_PANEL_ID}
          aria-label="属性 / 结果"
          aria-hidden={!state.inspectorOpen}
          inert={!state.inspectorOpen}
          className={cn(
            "gc-panel relative z-30 flex w-0 shrink-0 overflow-hidden bg-[var(--gc-panel)] transition-[width,visibility] duration-200 motion-reduce:transition-none",
            state.inspectorOpen
              ? "visible w-80 border-l border-[var(--gc-border)]"
              : "invisible w-0 border-l-0",
          )}
        >
          <div className="flex h-full min-h-0 w-80 shrink-0">{inspector}</div>
        </aside>

        <nav
          aria-label="工作台右侧工具"
          className="gc-panel relative z-40 flex w-12 shrink-0 flex-col items-center border-l border-[var(--gc-border)] bg-[var(--gc-panel)] py-2"
        >
          <RailButton
            label="属性 / 结果"
            controls={INSPECTOR_PANEL_ID}
            active={state.inspectorOpen}
            side="right"
            onClick={() => dispatch({ type: "toggle-inspector", exclusive: exclusiveDocks })}
            icon={<SlidersHorizontalIcon aria-hidden="true" />}
          />
        </nav>
      </div>
    </TooltipProvider>
  );
}
