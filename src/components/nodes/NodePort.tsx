import { Handle, Position, type HandleProps } from "@xyflow/react";

/**
 * 带文字标签的连接点（吸收官方 React Flow UI LabeledHandle 思路）。
 * Handle 以 position:static 进入文档流（内联样式强制覆盖 RF 默认的绝对定位），
 * 由外层布局决定位置；RF 仍按 Handle 实测盒位计算连线锚点。
 */
export interface NodePortProps {
  id: string;
  label: string;
  type: HandleProps["type"];
  position?: HandleProps["position"];
  className?: string;
}

export function NodePort({ id, label, type, position = Position.Left, className = "" }: NodePortProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Handle
        id={id}
        type={type}
        position={position}
        style={{ position: "static", transform: "none" }}
        className="size-2.5 shrink-0 rounded-full border border-[var(--gc-node-border)] bg-[var(--gc-panel)] transition-colors"
      />
      <span className="whitespace-nowrap text-[11px] leading-none text-[var(--gc-node-muted)]">
        {label}
      </span>
    </div>
  );
}
