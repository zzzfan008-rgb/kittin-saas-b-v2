import { FolderOpenIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OPEN_PROJECT_CENTER_EVENT } from "@/lib/overlayEvents";
import { useFlowStore } from "@/store/flowStore";

/**
 * 第 6 条落底状态 + 决策 4：登录后或把页签全部关掉后，画布区显示空工作区引导，
 * 而不是被自动塞回一个空白页签；此时左侧工具栏与「历史创作记录」一并隐藏。
 * 新建 → 本地空白未保存项目；打开 → 项目中心（只含最近项目）。
 */
export function EmptyWorkspaceCTA() {
  const empty = useFlowStore((state) => state.tabs.length === 0);
  const createBlankTab = useFlowStore((state) => state.createBlankTab);

  if (!empty) return null;

  return (
    <section
      aria-label="空工作区"
      className="absolute inset-0 z-10 flex items-center justify-center p-8"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-[var(--gc-text)]">当前没有打开的项目</p>
        <div className="flex items-center gap-3">
          <Button type="button" className="h-11 px-5" onClick={() => createBlankTab()}>
            <PlusIcon aria-hidden="true" className="size-4" />
            新建项目
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 px-5"
            onClick={() => window.dispatchEvent(new Event(OPEN_PROJECT_CENTER_EVENT))}
          >
            <FolderOpenIcon aria-hidden="true" className="size-4" />
            打开项目
          </Button>
        </div>
        <p className="text-xs leading-relaxed text-[var(--gc-text-muted)]">
          新建项目会得到一个未保存的空白画布；已有项目在「打开项目」里，
          工作流模板在画布左侧工具栏中直接打开
        </p>
      </div>
    </section>
  );
}
