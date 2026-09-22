import { InspectorPanel } from "./InspectorPanel";

interface ContextPanelProps {
  className?: string;
}

/**
 * 左侧上下文 Dock 现在只承载「属性」面板（节点属性编辑）。
 *
 * 结果 / 记录模块已整体迁到画布右上角的「结果」文字图标（见 ResultsFab），
 * 由它在悬浮面板里统一承载缩略图列表（3 列）+ 选中结果的运行记录详情。
 * 因此本组件移除历史分页 props 与结果 Tab，仅保留属性视角。
 */
export function ContextPanel({ className }: ContextPanelProps) {
  return (
    <aside className={className}>
      <InspectorPanel view="properties" className="h-full w-full border-0" />
    </aside>
  );
}