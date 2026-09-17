import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";
import { selectActiveNodes, useFlowStore } from "@/store/flowStore";
import { isNodeRunActive } from "@/types/workflow";

/**
 * 脉冲光点连线：金色光珠沿贝塞尔路径奔跑，指示数据流向。
 * 源头节点运行中 → 光珠更亮更快；常态 → 低调慢速。
 * 默认 stroke 走 --gc-edge（从 border 解耦提级），选中/hover 走 --gc-accent。
 * 末端带方向箭头 marker（audit m5）。
 */
export function PulseEdge({
  id,
  source,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
}: EdgeProps) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });
  const running = useFlowStore(
    (state) => {
      const status = selectActiveNodes(state).find((node) => node.id === source)?.data.status;
      return status ? isNodeRunActive(status) : false;
    },
  );

  const dur = running ? "1.2s" : "2.8s";
  const markerId = `gc-edge-arrow-${id}`;

  return (
    <>
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX={9}
          refY={5}
          markerWidth={8}
          markerHeight={8}
          orient="auto-start-reverse"
        >
          <path
            d="M 0 1 L 9 5 L 0 9 z"
            fill="none"
            stroke="var(--gc-edge)"
            strokeWidth={1.4}
          />
        </marker>
      </defs>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={`url(#${markerId})`}
        style={{
          stroke: "var(--gc-edge)",
          strokeWidth: selected ? 2.2 : 1.8,
          filter: selected ? "drop-shadow(0 0 3px var(--gc-accent))" : undefined,
        }}
      />
      {/* 三颗追尾光珠（SMIL 沿路径运动，零 JS 开销） */}
      <circle
        r={4}
        style={{
          fill: "var(--gc-accent)",
          opacity: running ? 1 : 0.5,
          filter: running
            ? "drop-shadow(0 0 4px var(--gc-accent)) drop-shadow(0 0 8px var(--gc-accent))"
            : undefined,
        }}
      >
        <animateMotion dur={dur} repeatCount="indefinite" path={path} />
      </circle>
      <circle
        r={3}
        style={{
          fill: "var(--gc-accent)",
          opacity: running ? 0.7 : 0.35,
        }}
      >
        <animateMotion dur={dur} begin="0.4s" repeatCount="indefinite" path={path} />
      </circle>
      <circle
        r={2.4}
        style={{
          fill: "var(--gc-accent)",
          opacity: running ? 0.5 : 0.25,
        }}
      >
        <animateMotion dur={dur} begin="0.8s" repeatCount="indefinite" path={path} />
      </circle>
    </>
  );
}
