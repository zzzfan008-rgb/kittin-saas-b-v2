import { useEffect, useReducer, type ReactNode } from "react";
import {
  LibraryBigIcon,
  SlidersHorizontalIcon,
  XIcon,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { useMediaQuery } from "./useMediaQuery";

const DESKTOP_QUERY = "(min-width: 1024px)";
const LIBRARY_PANEL_ID = "workbench-library-panel";
const INSPECTOR_PANEL_ID = "workbench-inspector-panel";

interface WorkbenchShellProps {
  /** 项目切换时只关闭移动端遮挡画布的 Sheet，不重建画布。 */
  workspaceKey: string;
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

function DesktopWorkbench({
  library,
  inspector,
  children,
  libraryOpen,
  inspectorOpen,
  onToggleLibrary,
  onToggleInspector,
}: Omit<WorkbenchShellProps, "workspaceKey"> & {
  libraryOpen: boolean;
  inspectorOpen: boolean;
  onToggleLibrary: () => void;
  onToggleInspector: () => void;
}) {
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
            active={libraryOpen}
            side="left"
            onClick={onToggleLibrary}
            icon={<LibraryBigIcon aria-hidden="true" />}
          />
        </nav>

        <div
          id={LIBRARY_PANEL_ID}
          aria-hidden={!libraryOpen}
          inert={!libraryOpen}
          className={cn(
            "gc-panel relative z-30 flex shrink-0 overflow-hidden bg-[var(--gc-panel)] transition-[width,visibility] duration-200 motion-reduce:transition-none",
            libraryOpen
              ? "visible w-60 border-r border-[var(--gc-border)]"
              : "invisible w-0 border-r-0",
          )}
        >
          {library}
        </div>

        <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
          {children}
        </div>

        <div
          id={INSPECTOR_PANEL_ID}
          aria-hidden={!inspectorOpen}
          inert={!inspectorOpen}
          className={cn(
            "gc-panel relative z-30 flex shrink-0 overflow-hidden bg-[var(--gc-panel)] transition-[width,visibility] duration-200 motion-reduce:transition-none",
            inspectorOpen
              ? "visible w-80 border-l border-[var(--gc-border)]"
              : "invisible w-0 border-l-0",
          )}
        >
          {inspector}
        </div>

        <nav
          aria-label="工作台右侧工具"
          className="gc-panel relative z-40 flex w-12 shrink-0 flex-col items-center border-l border-[var(--gc-border)] bg-[var(--gc-panel)] py-2"
        >
          <RailButton
            label="属性 / 运行记录"
            controls={INSPECTOR_PANEL_ID}
            active={inspectorOpen}
            side="right"
            onClick={onToggleInspector}
            icon={<SlidersHorizontalIcon aria-hidden="true" />}
          />
        </nav>
      </div>
    </TooltipProvider>
  );
}

interface MobileSheetProps {
  open: boolean;
  side: "left" | "right";
  panelId: string;
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
}

function MobileSheet({
  open,
  side,
  panelId,
  title,
  description,
  onClose,
  children,
}: MobileSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <SheetContent
        id={panelId}
        data-workbench-shortcuts="block"
        side={side}
        showCloseButton={false}
        className="w-[min(22rem,calc(100vw-2rem))] gap-0 border-[var(--gc-border)] bg-[var(--gc-panel)] p-0 text-[var(--gc-text)] sm:max-w-none"
      >
        <SheetHeader className="flex-row items-center gap-3 border-b border-[var(--gc-border)] px-3 py-2">
          <div className="min-w-0 flex-1">
            <SheetTitle className="text-sm text-[var(--gc-text)]">{title}</SheetTitle>
            <SheetDescription className="sr-only">{description}</SheetDescription>
          </div>
          <SheetClose
            type="button"
            aria-label={`关闭${title}`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
              "text-[var(--gc-text-muted)] hover:bg-[var(--gc-panel-hover)] hover:text-[var(--gc-text)]",
            )}
          >
            <XIcon aria-hidden="true" />
          </SheetClose>
        </SheetHeader>
        <div className="flex min-h-0 flex-1">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

function MobileWorkbench({
  library,
  inspector,
  children,
  mobilePanel,
  onOpenLibrary,
  onOpenInspector,
  onClosePanel,
}: Omit<WorkbenchShellProps, "workspaceKey"> & {
  mobilePanel: "library" | "inspector" | null;
  onOpenLibrary: () => void;
  onOpenInspector: () => void;
  onClosePanel: () => void;
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="gc-panel flex h-11 shrink-0 items-center border-b border-[var(--gc-border)] bg-[var(--gc-panel)] px-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-controls={LIBRARY_PANEL_ID}
          aria-expanded={mobilePanel === "library"}
          onClick={onOpenLibrary}
          className="border-[var(--gc-border)] bg-[var(--gc-control)] text-[10px] text-[var(--gc-text)]"
        >
          节点 / 素材
        </Button>
        <span className="min-w-0 flex-1 truncate px-3 text-center text-[10px] text-[var(--gc-text-muted)]">
          画布
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-controls={INSPECTOR_PANEL_ID}
          aria-expanded={mobilePanel === "inspector"}
          onClick={onOpenInspector}
          className="border-[var(--gc-border)] bg-[var(--gc-control)] text-[10px] text-[var(--gc-text)]"
        >
          属性
        </Button>
      </div>

      <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">{children}</div>

      <MobileSheet
        open={mobilePanel === "library"}
        side="left"
        panelId={LIBRARY_PANEL_ID}
        title="节点 / 素材"
        description="向画布添加节点或选择素材"
        onClose={onClosePanel}
      >
        {library}
      </MobileSheet>
      <MobileSheet
        open={mobilePanel === "inspector"}
        side="right"
        panelId={INSPECTOR_PANEL_ID}
        title="属性 / 运行记录"
        description="查看所选节点属性或生成记录"
        onClose={onClosePanel}
      >
        {inspector}
      </MobileSheet>
    </div>
  );
}

/**
 * 新工作台外壳。现有业务面板以插槽形式挂载，不复制请求、
 * 不改变 React Flow Provider，也不介入项目与运行状态。
 */
export function WorkbenchShell({ workspaceKey, library, inspector, children }: WorkbenchShellProps) {
  const [state, dispatch] = useReducer(workbenchUiReducer, INITIAL_WORKBENCH_UI_STATE);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  useEffect(() => {
    dispatch({ type: "close-mobile" });
  }, [workspaceKey, isDesktop]);

  if (isDesktop) {
    return (
      <DesktopWorkbench
        library={library}
        inspector={inspector}
        libraryOpen={state.libraryOpen}
        inspectorOpen={state.inspectorOpen}
        onToggleLibrary={() => dispatch({ type: "toggle-library" })}
        onToggleInspector={() => dispatch({ type: "toggle-inspector" })}
      >
        {children}
      </DesktopWorkbench>
    );
  }

  return (
    <MobileWorkbench
      library={library}
      inspector={inspector}
      mobilePanel={state.mobilePanel}
      onOpenLibrary={() => dispatch({ type: "open-mobile", panel: "library" })}
      onOpenInspector={() => dispatch({ type: "open-mobile", panel: "inspector" })}
      onClosePanel={() => dispatch({ type: "close-mobile" })}
    >
      {children}
    </MobileWorkbench>
  );
}
