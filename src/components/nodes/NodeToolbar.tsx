import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRightToLineIcon,
  BrushIcon,
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
import {
  Select,
  SelectItem,
  SelectList,
  SelectPopup,
  SelectPortal,
  SelectPositioner,
  SelectTrigger,
} from "@/components/ui/select";
import { nodeTitleForKind, type NodeKind } from "@/types/workflow";

/**
 * v9 节点工具条（64 Phase 2 §6）。
 *
 * - 位置与出现时机：节点卡片正上方 8px 居中，**仅选中态渲染**（未选中不占 DOM）。
 * - 每个按钮 = 图标 + `aria-label`（hover 由 Tooltip 显示同一文案），键盘可达、可见焦点环。
 * - 全部由本地 shadcn `Button`（variant="ghost" / size="icon-sm"）组合，不手搓按钮。
 * - 禁用态不隐藏：保留按钮并给出原因（`title` 与 Tooltip 同文案）。
 * - 预设下拉 = shadcn Select 内联（图标 trigger + chevron + tooltip「提示词预设」）。
 *
 * 配置表是各 kind 工具条内容的唯一事实源；节点组件只负责提供各动作的接线（actions）。
 */

export type NodeToolbarActionId =
  | "color-tool"
  | "crop"
  | "matting"
  | "copy"
  | "replace"
  | "preset-picker"
  | "mask"
  | "run"
  | "preview"
  | "play"
  | "download"
  | "as-input";

export interface NodeToolbarActionDefinition {
  id: NodeToolbarActionId;
  label: string;
  icon: LucideIcon;
}

const COLOR_TOOL: NodeToolbarActionDefinition = { id: "color-tool", label: "色彩工具", icon: PaletteIcon };
const CROP: NodeToolbarActionDefinition = { id: "crop", label: "裁剪", icon: CropIcon };
const MATTING: NodeToolbarActionDefinition = { id: "matting", label: "抠图", icon: ScissorsIcon };
const COPY: NodeToolbarActionDefinition = { id: "copy", label: "复制", icon: CopyIcon };
const REPLACE: NodeToolbarActionDefinition = { id: "replace", label: "替换", icon: RefreshCwIcon };
const PRESET_PICKER: NodeToolbarActionDefinition = { id: "preset-picker", label: "提示词预设", icon: SparklesIcon };
const RUN: NodeToolbarActionDefinition = { id: "run", label: "运行", icon: PlayIcon };
const PREVIEW: NodeToolbarActionDefinition = { id: "preview", label: "预览", icon: EyeIcon };
const PLAY: NodeToolbarActionDefinition = { id: "play", label: "播放", icon: PlayIcon };
const DOWNLOAD: NodeToolbarActionDefinition = { id: "download", label: "下载", icon: DownloadIcon };
const AS_INPUT: NodeToolbarActionDefinition = { id: "as-input", label: "作为输入", icon: ArrowRightToLineIcon };

const MASK: NodeToolbarActionDefinition = { id: "mask", label: "蒙版", icon: BrushIcon };
/** v9 配置表（64 Phase 2 §6）；数组顺序即从左到右的渲染顺序。 */
export const NODE_TOOLBAR_ACTIONS: Record<NodeKind, readonly NodeToolbarActionDefinition[]> = {
  text: [COLOR_TOOL, PRESET_PICKER, COPY],
  image: [CROP, MATTING, MASK, COPY, REPLACE],
  video: [COPY, REPLACE],
  "image-generator": [RUN, COPY],
  "video-generator": [RUN, COPY],
  "result-image": [PREVIEW, DOWNLOAD, AS_INPUT, COPY],
  "result-video": [PLAY, DOWNLOAD, AS_INPUT, COPY],
};

export interface NodeToolbarActionBinding {
  onSelect?: () => void;
  disabled?: boolean;
  disabledReason?: string;
  label?: string;
  /** 预设下拉选项（仅 preset-picker）。 */
  presetOptions?: readonly { value: string; label: string }[];
  /** 预设选中回调（仅 preset-picker；value = 预设 id）。 */
  onPresetSelect?: (value: string) => void;
}

export interface NodeToolbarProps {
  kind: NodeKind;
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

          // -- 预设下拉（shadcn Select 内联）--
          if (definition.id === "preset-picker") {
            const options = binding?.presetOptions;
            const presetDisabled = binding?.disabled ?? (!options || options.length === 0);
            const onPresetSelect = binding?.onPresetSelect;
            const [selectKey, setSelectKey] = useState(0);

            if (!options || options.length === 0) {
              // 无选项时渲染禁用按钮
              return (
                <Tooltip key={definition.id}>
                  <TooltipTrigger render={<span className="inline-flex" />}>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label={label} disabled title={`${label}：暂无可选预设`} className="text-[var(--gc-node-text)]">
                      <Icon aria-hidden="true" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={6}>{`${label}：暂无可选预设`}</TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Tooltip key={definition.id}>
                <TooltipTrigger render={<span className="inline-flex" />}>
                  <Select
                    key={selectKey}
                    disabled={presetDisabled}
                    onValueChange={(value) => {
                      if (typeof value === "string") {
                        onPresetSelect?.(value);
                        // 每次选择后重置 Select 内部状态，保持「恒显示未选择态」。
                        setSelectKey((k) => k + 1);
                      }
                    }}
                  >
                    <SelectTrigger
                      aria-label={label}
                      title={presetDisabled ? `${label}：${disabledReason}` : label}
                      className="nodrag size-7 justify-center gap-0 rounded-[min(var(--radius-md),12px)] border-0 bg-transparent p-0 text-[var(--gc-node-text)] hover:bg-muted"
                    >
                      <Icon aria-hidden="true" />
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectPositioner>
                        <SelectPopup>
                          <SelectList>
                            {options.map((option) => (
                              <SelectItem key={option.value} value={option.value} className="text-[11px]">
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectList>
                        </SelectPopup>
                      </SelectPositioner>
                    </SelectPortal>
                  </Select>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={6}>
                  {presetDisabled ? `${label}：${disabledReason}` : label}
                </TooltipContent>
              </Tooltip>
            );
          }

          // -- 普通按钮 --
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