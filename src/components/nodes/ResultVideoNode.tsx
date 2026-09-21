import { useCallback, useRef, useState } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { selectActiveNodes, selectActiveReadOnly, useFlowStore } from "@/store/flowStore";
import type { ResultVideoNodeData } from "@/types/workflow";
import { NodeFrame } from "./NodeFrame";
import { NodeToolbar } from "./NodeToolbar";
import { DUPLICATE_UNAVAILABLE_REASON } from "./nodeDuplicate";

/**
 * v8 结果层视频结果节点（plan.md §3.4、data-model.md §5）：
 * `<video preload="metadata" controls>` 播放该次运行的产物；产物由 RunEvent 驱动创建。
 * 工具条（plan.md §3.2）：[播放] [下载] [作为输入] [复制]。
 */
export function ResultVideoNode({ id, data, selected }: NodeProps<Node<ResultVideoNodeData>>) {
  const readOnly = useFlowStore(selectActiveReadOnly);
  const sourceLabel = useFlowStore(
    (s) => selectActiveNodes(s).find((node) => node.id === data.sourceGeneratorId)?.data.label,
  );
  const videos = Array.isArray(data.videos)
    ? data.videos.filter((video): video is string => typeof video === "string" && video.length > 0)
    : [];
  const hasProduct = videos.length > 0;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const anchorRef = useRef<HTMLAnchorElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const play = useCallback(() => {
    if (!hasProduct) return;
    void videoRef.current?.play();
    setPlaying(true);
  }, [hasProduct]);

  const download = useCallback(() => {
    if (!hasProduct) return;
    const anchor = anchorRef.current;
    if (!anchor) return;
    anchor.href = videos[0];
    anchor.click();
  }, [hasProduct, videos]);

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
            kind="result-video"
            selected={selected}
            actions={{
              play: {
                onSelect: play,
                disabled: !hasProduct,
                disabledReason: "该结果还没有产物",
                label: playing ? "播放中" : "播放",
              },
              download: {
                onSelect: download,
                disabled: !hasProduct,
                disabledReason: "该结果还没有产物",
              },
              "as-input": {
                disabled: true,
                disabledReason: "暂不可用：视频作为下游输入尚未接入",
              },
              copy: {
                disabled: true,
                disabledReason: DUPLICATE_UNAVAILABLE_REASON,
              },
            }}
          />
        }
      >
        {hasProduct ? (
          <div className="nodrag relative overflow-hidden rounded-[10px] border border-[var(--gc-node-border)] bg-black">
            <video
              ref={videoRef}
              src={videos[0]}
              preload="metadata"
              controls={playing}
              aria-label={`${data.label} 的产物视频`}
              className="max-h-40 w-full"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onClick={(event) => {
                if (playing) return;
                event.preventDefault();
                play();
              }}
            />
            {!playing && (
              <button
                type="button"
                aria-label="播放视频"
                onClick={play}
                className="absolute inset-0 flex items-center justify-center bg-black/30 text-[11px] font-semibold text-white"
              >
                ▶ 点击播放
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-[var(--gc-node-border)] py-4 text-center text-[10px] text-[var(--gc-node-muted)]">
            本次运行没有产物
          </div>
        )}
        <p className="text-[11px] leading-relaxed text-[var(--gc-node-muted)]">
          来自：{sourceLabel ?? data.sourceGeneratorId}
          {readOnly ? "" : " · 产物文件不随生成节点删除"}
        </p>
      </NodeFrame>
      <a ref={anchorRef} className="hidden" aria-hidden="true" download />
      <Handle type="source" position={Position.Right} title="输出视频" />
    </>
  );
}
