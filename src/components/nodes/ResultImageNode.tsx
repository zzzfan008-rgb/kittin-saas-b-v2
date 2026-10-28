import { useCallback, useEffect, useRef, useState } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { selectActiveNodes, selectActiveReadOnly, useFlowStore } from "@/store/flowStore";
import { useLightboxStore } from "@/store/lightboxStore";
import { EDGE_HANDLE_RESULT, isNodeRunActive, type ResultImageNodeData } from "@/types/workflow";
import { thumbnailImageUrl } from "@/lib/images";
import { NodeFrame, RunProgressBlock } from "./NodeFrame";
import { NodeToolbar } from "./NodeToolbar";
import { RefOrdinalBadge } from "./RefOrdinalBadge";
import { useReferenceOrdinals } from "./ReferenceOrdinals";
import { DUPLICATE_UNAVAILABLE_REASON } from "./nodeDuplicate";

/**
 * v8 结果层图片结果节点（plan.md §3.4、data-model.md §5）：
 * 一次运行 = 一个结果节点（T3 裁定 A），展示该次运行的全部产物。
 *
 * 用户批注（2026-10-28）：「图片结果节点要和图片节点完全一致，而且要连线」。
 * 故视觉与图片节点（ImageNode）逐项对齐：
 *  · 有产物时走 frameless（丢弃白卡标题/内边距），画面外圈改用 --gc-accent 描边；
 *  · 图片 `w-full object-contain` 按原始比例铺满，不做方形裁切；
 *  · 右上角显示参考图序号徽标（它同样能连到生成节点的 reference 输入）；
 *  · 右侧输出柄与图片节点同款，可拖出连线。
 * 多产物时主图取 selectedIndex（默认第一张），下方细缩略条用于切换。
 */
export function ResultImageNode({ id, data, selected }: NodeProps<Node<ResultImageNodeData>>) {
  const readOnly = useFlowStore(selectActiveReadOnly);
  const openLightbox = useLightboxStore((s) => s.open);
  const sourceLabel = useFlowStore(
    (s) => selectActiveNodes(s).find((node) => node.id === data.sourceGeneratorId)?.data.label,
  );
  const images = Array.isArray(data.images)
    ? data.images.filter((image): image is string => typeof image === "string" && image.length > 0)
    : [];
  const hasProduct = images.length > 0;

  const requested = typeof data.selectedIndex === "number" ? data.selectedIndex : 0;
  const [activeIndex, setActiveIndex] = useState(
    requested >= 0 && requested < images.length ? requested : 0,
  );
  // 产物变化（新一次运行覆盖）后回落到第一张，避免下标越界。
  useEffect(() => {
    setActiveIndex((current) => (current >= 0 && current < images.length ? current : 0));
  }, [images.length]);

  const hero = images[activeIndex] ?? images[0];
  const anchorRef = useRef<HTMLAnchorElement | null>(null);

  const preview = useCallback(() => {
    if (!hero) return;
    openLightbox(hero, data.label);
  }, [data.label, hero, openLightbox]);

  const download = useCallback(() => {
    if (!hero) return;
    const anchor = anchorRef.current;
    if (!anchor) return;
    anchor.href = hero;
    anchor.click();
  }, [hero]);

  return (
    <>
      <NodeFrame
        nodeId={id}
        title={data.label}
        status={data.status}
        error={data.error}
        selected={selected}
        frameless={hasProduct}
        nodeKind={hasProduct ? "image" : undefined}
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
        {isNodeRunActive(data.status) ? (
          // 生成中（用户 2026-10-28）：结果节点点运行即出现，图区走「暗房显影」+ 已用时角标。
          <RunProgressBlock
            nodeId={data.sourceGeneratorId}
            startedAt={(data as { startedAt?: number }).startedAt}
          />
        ) : hasProduct ? (
          <>
            {/* 与 ImageNode 有图态完全同构：accent 描边 + object-contain 满宽。
                用户 2026-10-28：结果节点只显示预览图（走 /thumbnail，384px WebP），
                且图片本身不可点击放大——点开会加载原图，大图场景白白吃内存。
                需要看大图走工具条「预览」（显式动作）。 */}
            <div className="nopan relative rounded-xl bg-[var(--gc-accent)] p-[2px]">
              <div
                title={`${data.label} · 来自 ${sourceLabel ?? data.sourceGeneratorId}`}
                className="relative block w-full overflow-hidden rounded-xl"
              >
                <img
                  src={thumbnailImageUrl(hero)}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  alt={`${data.label} 结果 ${activeIndex + 1}`}
                  className="pointer-events-none w-full select-none object-contain"
                />
              </div>
              <OrdinalBadgeSlot nodeId={id} />
            </div>
            {images.length > 1 ? (
              <div className="nodrag mt-2 flex gap-1.5 overflow-x-auto pb-0.5">
                {images.map((url, index) => (
                  <button
                    key={`${url}-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`查看第 ${index + 1} 张`}
                    aria-pressed={index === activeIndex}
                    className={`shrink-0 overflow-hidden rounded-md border transition-colors ${
                      index === activeIndex
                        ? "border-[var(--gc-accent)]"
                        : "border-[var(--gc-node-border)] hover:border-[var(--gc-accent)]"
                    }`}
                  >
                    <img
                      src={thumbnailImageUrl(url)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="size-12 object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-md border border-dashed border-[var(--gc-node-border)] py-4 text-center text-label text-[var(--gc-node-muted)]">
            本次运行没有产物
          </div>
        )}
        {/* 用户批注（2026-10-28）：有产物时必须与图片节点完全一致——图片节点只有画面，
            故此处不再渲染「来自：…」文字行；溯源信息保留在图片 title 与工具条里。
            空态仍显示来源，便于排查是哪次运行没出图。 */}
        {hasProduct || isNodeRunActive(data.status) ? null : (
          <p className="text-label leading-relaxed text-[var(--gc-node-muted)]">
            来自：{sourceLabel ?? data.sourceGeneratorId} · {images.length} 张
            {readOnly ? "" : " · 可连到生成节点的 reference 输入"}
          </p>
        )}
      </NodeFrame>
      <a ref={anchorRef} className="hidden" aria-hidden="true" download />
      <Handle type="source" position={Position.Right} title="输出图片" />
      {/* 溯源入柄：接生成节点右侧的输出柄（用户 2026-10-28 要求生成节点必须连到结果节点）。
          不可手动拖拽——这条边只由运行时创建。 */}
      <Handle id={EDGE_HANDLE_RESULT} type="target" position={Position.Left} title="来自生成节点" isConnectable={false} />
    </>
  );
}

/**
 * 参考图序号徽标簇：连线后常显（不依赖选中态）。与 ImageNode 共用同一实现，
 * 保证结果节点作为参考源时，模型看到的「图N」与节点上显示的序号一致。
 */
function OrdinalBadgeSlot({ nodeId }: { nodeId: string }) {
  const assignments = useReferenceOrdinals(nodeId);
  if (!assignments) return null;
  return (
    <div className="pointer-events-none absolute right-2 top-2 z-[3] flex gap-1">
      {assignments.map((assignment) => (
        <RefOrdinalBadge key={assignment.targetId} ordinal={assignment.ordinal} />
      ))}
    </div>
  );
}
