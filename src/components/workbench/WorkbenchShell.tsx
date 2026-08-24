import { useEffect, useReducer, useRef, type ReactNode, type RefObject } from "react";
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

interface MobileSheetProps {
  open: boolean;
  isDesktop: boolean;
  side: "left" | "right";
  panelId: string;
  title: string;
  description: string;
  portalContainer: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  children: ReactNode;
}

function MobileSheet({
  open,
  isDesktop,
  side,
  panelId,
  title,
  description,
  portalContainer,
  onClose,
  children,
}: MobileSheetProps) {
  return (
    <Sheet
      open={open}
      modal={!isDesktop}
      disablePointerDismissal={isDesktop}
      onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}
    >
      <SheetContent
        id={panelId}
        data-workbench-shortcuts="block"
        side={side}
        showCloseButton={false}
        portalProps={{ container: portalContainer, keepMounted: true, className: "contents" }}
        overlayClassName="lg:hidden"
        className="w-[min(22rem,calc(100vw-2rem))] gap-0 border-[var(--gc-border)] bg-[var(--gc-panel)] p-0 text-[var(--gc-text)] sm:max-w-none lg:static lg:inset-auto lg:h-full lg:w-full lg:max-w-none lg:translate-x-0 lg:border-0 lg:shadow-none lg:transition-none"
      >
        <SheetHeader className="flex-row items-center gap-3 border-b border-[var(--gc-border)] px-3 py-2 lg:hidden">
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

/**
 * 工作台外壳始终保持同一棵中心内容树。断点变化只改变两侧面板的
 * 呈现方式（桌面 Dock / 移动 Sheet），不重建 React Flow 及其业务子树。
 */
export function WorkbenchShell({ workspaceKey, library, inspector, children }: WorkbenchShellProps) {
  const [state, dispatch] = useReducer(workbenchUiReducer, INITIAL_WORKBENCH_UI_STATE);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const libraryPortalHost = useRef<HTMLDivElement>(null);
  const inspectorPortalHost = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch({ type: "close-mobile" });
  }, [workspaceKey, isDesktop]);

  return (
    <TooltipProvider delay={250}>
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <nav
          aria-label="工作台左侧工具"
          className="gc-panel relative z-40 hidden w-12 shrink-0 flex-col items-center border-r border-[var(--gc-border)] bg-[var(--gc-panel)] py-2 lg:flex"
        >
          <RailButton
            label="节点 / 素材"
            controls={LIBRARY_PANEL_ID}
            active={state.libraryOpen}
            side="left"
            onClick={() => dispatch({ type: "toggle-library" })}
            icon={<LibraryBigIcon aria-hidden="true" />}
          />
        </nav>

        <div
          ref={libraryPortalHost}
          aria-hidden={isDesktop && !state.libraryOpen}
          inert={isDesktop && !state.libraryOpen}
          className={cn(
            "gc-panel relative z-50 w-0 shrink-0 bg-[var(--gc-panel)] transition-[width,visibility] duration-200 motion-reduce:transition-none lg:z-30 lg:flex lg:overflow-hidden",
            state.libraryOpen
              ? "lg:visible lg:w-60 lg:border-r lg:border-[var(--gc-border)]"
              : "lg:invisible lg:w-0 lg:border-r-0",
          )}
        />

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="gc-panel flex h-11 shrink-0 items-center border-b border-[var(--gc-border)] bg-[var(--gc-panel)] px-2 lg:hidden">
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-controls={LIBRARY_PANEL_ID}
              aria-expanded={state.mobilePanel === "library"}
              onClick={() => dispatch({ type: "open-mobile", panel: "library" })}
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
              aria-expanded={state.mobilePanel === "inspector"}
              onClick={() => dispatch({ type: "open-mobile", panel: "inspector" })}
              className="border-[var(--gc-border)] bg-[var(--gc-control)] text-[10px] text-[var(--gc-text)]"
            >
              属性 / 结果
            </Button>
          </div>

          <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
            {children}
          </div>
        </div>

        <div
          ref={inspectorPortalHost}
          aria-hidden={isDesktop && !state.inspectorOpen}
          inert={isDesktop && !state.inspectorOpen}
          className={cn(
            "gc-panel relative z-50 w-0 shrink-0 bg-[var(--gc-panel)] transition-[width,visibility] duration-200 motion-reduce:transition-none lg:z-30 lg:flex lg:overflow-hidden",
            state.inspectorOpen
              ? "lg:visible lg:w-80 lg:border-l lg:border-[var(--gc-border)]"
              : "lg:invisible lg:w-0 lg:border-l-0",
          )}
        />

        <nav
          aria-label="工作台右侧工具"
          className="gc-panel relative z-40 hidden w-12 shrink-0 flex-col items-center border-l border-[var(--gc-border)] bg-[var(--gc-panel)] py-2 lg:flex"
        >
          <RailButton
            label="属性 / 结果"
            controls={INSPECTOR_PANEL_ID}
            active={state.inspectorOpen}
            side="right"
            onClick={() => dispatch({ type: "toggle-inspector" })}
            icon={<SlidersHorizontalIcon aria-hidden="true" />}
          />
        </nav>

        <MobileSheet
          open={isDesktop ? state.libraryOpen : state.mobilePanel === "library"}
          isDesktop={isDesktop}
          side="left"
          panelId={LIBRARY_PANEL_ID}
          title="节点 / 素材"
          description="向画布添加节点或选择素材"
          portalContainer={libraryPortalHost}
          onClose={() => {
            if (isDesktop && state.libraryOpen) dispatch({ type: "toggle-library" });
            else dispatch({ type: "close-mobile" });
          }}
        >
          {library}
        </MobileSheet>
        <MobileSheet
          open={isDesktop ? state.inspectorOpen : state.mobilePanel === "inspector"}
          isDesktop={isDesktop}
          side="right"
          panelId={INSPECTOR_PANEL_ID}
          title="属性 / 结果"
          description="查看所选节点属性、生成结果与运行记录"
          portalContainer={inspectorPortalHost}
          onClose={() => {
            if (isDesktop && state.inspectorOpen) dispatch({ type: "toggle-inspector" });
            else dispatch({ type: "close-mobile" });
          }}
        >
          {inspector}
        </MobileSheet>
      </div>
    </TooltipProvider>
  );
}
