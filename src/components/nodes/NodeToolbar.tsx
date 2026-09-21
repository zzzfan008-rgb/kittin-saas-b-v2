import type { LucideIcon } from "lucide-react";
import {
  ArrowRightToLineIcon,
  CopyIcon,
  CropIcon,
  DownloadIcon,
  EyeIcon,
  PaletteIcon,
  PlayIcon,
  RefreshCwIcon,
  ScissorsIcon,
  SparklesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { nodeTitleForKind, type NodeKind } from "@/types/workflow";

/**
 * v8 节点工具条（plan.md §3.2）。
 *
 * - 位置与出现时机：节点卡片正上方 8px 居中，**仅选中态渲染**（未选中不占 DOM）。
 * - 每个按钮 = 图标 + `aria-label`（hover 由 Tooltip 显示同一文案），键盘可达、可见焦点环。
 * - 全部由本地 shadcn `Button`（variant="ghost" / size="icon-sm"）组合，不手搓按钮。
 * - 禁用态不隐藏：保留按钮并给出原因（`title` 与 Tooltip 同文案）。
 *
 * 配置表是各 kind 工具条内容的唯一事实源；节点组件只负责提供各动作的接线（actions）。
 */

export type NodeToolbarActionId =
  | "color-tool"
  | "crop"
  | "matting"
  | "copy"
  | "replace"
  | "function-picker"
  | "run"
  | "preview"
  | "play"
  | "download"
  | "as-input";

export interface NodeToolbarActionDefinition {
  id: NodeToolbarActionId;
  /** 面向用户的动作名（aria-label 与 Tooltip 共用；plan.md §3.2 按钮语义表） */
  label: string;
  icon: LucideIcon;
}

const COLOR_TOOL: NodeToolbarActionDefinition = { id: "color-tool", label: "色彩工具", icon: PaletteIcon };
const CROP: NodeToolbarActionDefinition = { id: "crop", label: "裁剪", icon: CropIcon };
const MATTING: NodeToolbarActionDefinition = { id: "matting", label: "抠图", icon: ScissorsIcon };
const COPY: NodeToolbarActionDefinition = { id: "copy", label: "复制", icon: CopyIcon };
const REPLACE: NodeToolbarActionDefinition = { id: "replace", label: "替换", icon: RefreshCwIcon };
const FUNCTION_PICKER: NodeToolbarActionDefinition = { id: "function-picker", label: "功能选项", icon: SparklesIcon };
const RUN: NodeToolbarActionDefinition = { id: "run", label: "运行", icon: PlayIcon };
const PREVIEW: NodeToolbarActionDefinition = { id: "preview", label: "预览", icon: EyeIcon };
const PLAY: NodeToolbarActionDefinition = { id: "play", label: "播放", icon: PlayIcon };
const DOWNLOAD: NodeToolbarActionDefinition = { id: "download", label: "下载", icon: DownloadIcon };
const AS_INPUT: NodeToolbarActionDefinition = { id: "as-input", label: "作为输入", icon: ArrowRightToLineIcon };

/** plan.md §3.2 配置表；数组顺序即从左到右的渲染顺序。 */
export const NODE_TOOLBAR_ACTIONS: Record<NodeKind, readonly NodeToolbarActionDefinition[]> = {
  text: [COLOR_TOOL, COPY],
  image: [CROP, MATTING, COPY, REPLACE],
  video: [COPY, REPLACE],
  "image-generator": [FUNCTION_PICKER, RUN, COPY],
  "video-generator": [FUNCTION_PICKER, RUN, COPY],
  "result-image": [PREVIEW, DOWNLOAD, AS_INPUT, COPY],
  "result-video": [PLAY, DOWNLOAD, AS_INPUT, COPY],
};

export interface NodeToolbarActionBinding {
  /** 动作实现；缺省 = 该动作当前无接线，按钮按禁用态渲染。 */
  onSelect?: () => void;
  disabled?: boolean;
  /** 禁用原因（plan.md §3.2：禁用态给出 title 原因，不隐藏）。 */
  disabledReason?: string;
  /** 覆盖默认动作名（如运行中显示状态文案）。 */
  label?: string;
}

export interface NodeToolbarProps {
  kind: NodeKind;
  /** 仅选中态渲染工具条（plan.md §3.2）。 */
  selected?: boolean;
  actions?: Partial<Record<NodeToolbarActionId, NodeToolbarActionBinding>>;
}

export function NodeToolbar({ kind, selected, actions }: NodeToolbarProps) {
  const definitions = NODE_TOOLBAR_ACTIONS[kind];
  if (!selected || !definitions || definitions.length === 0) return null;

  return (
    <TooltipProvider>
      <div
        role="toolbar"
        aria-label={`${nodeTitleForKind(kind)}工具栏`}
        aria-orientation="horizontal"
        data-node-toolbar={kind}
        className="nodrag nopan absolute bottom-full left-1/2 z-20 mb-[var(--gc-node-toolbar-gap)] flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-[var(--gc-node-border)] bg-[var(--gc-node-header)] p-0.5 shadow-lg shadow-black/30"
        onPointerDown={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
      >
        {definitions.map((definition) => {
          const binding = actions?.[definition.id];
          const disabled = binding?.disabled ?? binding?.onSelect === undefined;
          const label = binding?.label ?? definition.label;
          const disabledReason = binding?.disabledReason ?? "暂不可用";
          const Icon = definition.icon;
          return (
            <Tooltip key={definition.id}>
              <TooltipTrigger render={<span className="inline-flex" />}>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={label}
                  disabled={disabled}
                  title={disabled ? `${label}：${disabledReason}` : label}
                  onClick={(event) => {
                    event.stopPropagation();
                    binding?.onSelect?.();
                  }}
                  className="text-[var(--gc-node-text)]"
                >
                  <Icon aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={6}>
                {disabled ? `${label}：${disabledReason}` : label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
