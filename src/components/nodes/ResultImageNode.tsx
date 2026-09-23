import { useCallback, useRef } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { selectActiveNodes, selectActiveReadOnly, useFlowStore } from "@/store/flowStore";
import type { ResultImageNodeData } from "@/types/workflow";
import { NodeFrame } from "./NodeFrame";
import { NodeToolbar } from "./NodeToolbar";
import { ImageGrid } from "./ImageGrid";
import { DUPLICATE_UNAVAILABLE_REASON } from "./nodeDuplicate";

/**
 * v8 结果层图片结果节点（plan.md §3.4、data-model.md §5）：
 * 网格展示该次运行的全部产物（一次运行 = 一个结果节点，T3 裁定 A），点击任一格 → 大图查看器。
 * 产物由服务端 RunEvent 驱动创建，用户不可手动新增；产物不随生成节点删除而消失。
 * 工具条（plan.md §3.2）：[预览] [下载] [作为输入] [复制]。
 */
export function ResultImageNode({ id, data, selected }: NodeProps<Node<ResultImageNodeData>>) {
  const readOnly = useFlowStore(selectActiveReadOnly);
  const openViewer = useFlowStore((s) => s.openViewer);
  const sourceLabel = useFlowStore(
    (s) => selectActiveNodes(s).find((node) => node.id === data.sourceGeneratorId)?.data.label,
  );
  const images = Array.isArray(data.images)
    ? data.images.filter((image): image is string => typeof image === "string" && image.length > 0)
    : [];
  const hasProduct = images.length > 0;
  const anchorRef = useRef<HTMLAnchorElement | null>(null);

  const preview = useCallback(() => {
    if (!hasProduct) return;
    openViewer({ url: images[0], title: data.label });
  }, [data.label, hasProduct, images, openViewer]);

  const download = useCallback(() => {
    if (!hasProduct) return;
    const anchor = anchorRef.current;
    if (!anchor) return;
    anchor.href = images[0];
    anchor.click();
  }, [hasProduct, images]);

  return (
    <>
      <NodeFrame
        nodeId={id}
        title={data.label}
        status={data.status}
        error={data.error}
        selected={selected}
        toolbar={
          <NodeToolbar
            kind="result-image"
            selected={selected}
            actions={{
              preview: {
                onSelect: preview,
                disabled: !hasProduct,
                disabledReason: "该结果还没有产物",
              },
              download: {
                onSelect: download,
                disabled: !hasProduct,
                disabledReason: "该结果还没有产物",
              },
              "as-input": {
                disabled: true,
                disabledReason: "已可作为下游引用：直接从输出柄连到生成节点的 reference 输入",
              },
              copy: {
                disabled: true,
                disabledReason: DUPLICATE_UNAVAILABLE_REASON,
              },
            }}
          />
        }
      >
        <ImageGrid images={images} empty="本次运行没有产物" />
        <p className="text-label leading-relaxed text-[var(--gc-node-muted)]">
          来自：{sourceLabel ?? data.sourceGeneratorId} · {images.length} 张
          {readOnly ? "" : " · 可连到生成节点的 reference 输入"}
        </p>
      </NodeFrame>
      <a ref={anchorRef} className="hidden" aria-hidden="true" download />
      <Handle type="source" position={Position.Right} title="输出图片" />
    </>
  );
}
