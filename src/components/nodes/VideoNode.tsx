import { useRef, useState } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { useFlowStore, selectNodeInputImages } from "@/store/flowStore";
import { useShallow } from "zustand/react/shallow";
import { isNodeRunActive, type VideoNodeData } from "@/types/workflow";
import { NodeFrame, Developing } from "./NodeFrame";
import { useNodeInspector } from "./NodeInspectorWindow";
import { getGarmentPromptVariantById } from "@/lib/garmentPromptPresets";
import { thumbnailImageUrl } from "@/lib/images";

/**
 * v7 视频节点（Q2=A / R10 单模型）：文字 + 0..1 张首帧图片 → 视频。
 * A4 裁定：首帧缩略图用 <video preload="metadata"> 前端渲染，不引 ffmpeg；点击播放。
 */
export function VideoNode({ id, data, selected }: NodeProps<Node<VideoNodeData>>) {
  const runNode = useFlowStore((s) => s.runNode);
  const openInspector = useNodeInspector((s) => s.open);
  const running = isNodeRunActive(data.status);
  const variant = data.promptVariantId ? getGarmentPromptVariantById(data.promptVariantId) : undefined;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const firstFrame = useFlowStore(
    useShallow((s) => {
      const document = s.tabs.find((tab) => tab.id === s.activeTabId);
      return document ? selectNodeInputImages(document, id)[0] : undefined;
    }),
  );

  const video = data.outputVideos[0];

  return (
    <>
      <Handle type="target" position={Position.Left} id="prompt" style={{ top: "30%" }} title="提示词（文本节点）" />
      <Handle type="target" position={Position.Left} id="reference" style={{ top: "70%" }} title="首帧图片（可选，图片节点）" />
      <NodeFrame
        nodeId={id}
        title={data.label}
        status={data.status}
        error={data.error}
        selected={selected}
        onBodyDoubleClick={(event) => {
          event.stopPropagation();
          openInspector(id);
        }}
        entryBar={
          <button
            type="button"
            onClick={() => openInspector(id)}
            className="nodrag flex w-full items-center gap-2 rounded-full border border-[var(--gc-border-strong)] bg-[var(--gc-node-inner)] px-3 py-1.5 text-[12px] font-semibold text-[var(--gc-node-text)]"
          >
            ⚙ {variant ? "功能设置" : "选择功能"}
            <span aria-hidden="true" className="ml-auto font-bold text-[var(--gc-accent)]">›</span>
          </button>
        }
      >
        {video ? (
          <div className="nodrag relative overflow-hidden rounded-[10px] border border-[var(--gc-node-border)] bg-black">
            {/* A4：<video preload="metadata"> 首帧渲染；点击进入播放态 */}
            <video
              ref={videoRef}
              src={video}
              preload="metadata"
              controls={playing}
              aria-label={`${data.label} 的生成视频`}
              className="max-h-40 w-full"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onClick={(event) => {
                if (playing) return;
                event.preventDefault();
                void videoRef.current?.play();
                setPlaying(true);
              }}
            />
            {!playing && (
              <button
                type="button"
                aria-label="播放视频"
                onClick={() => {
                  void videoRef.current?.play();
                  setPlaying(true);
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/30 text-[11px] font-semibold text-white"
              >
                ▶ 点击播放
              </button>
            )}
          </div>
        ) : firstFrame ? (
          <div className="overflow-hidden rounded-[10px] border border-[var(--gc-node-border)]">
            <img
              src={thumbnailImageUrl(firstFrame)}
              alt="首帧图片"
              loading="lazy"
              decoding="async"
              className="max-h-40 w-full object-contain bg-[var(--gc-node-inner)]"
            />
            <p className="px-2 py-1 text-[10px] text-[var(--gc-node-muted)]">以上图为首帧生成视频</p>
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-[10px] border border-dashed border-[var(--gc-node-border)] text-[10px] leading-relaxed text-[var(--gc-node-muted)]">
            连接文本节点写描述；可选拉一张图片作首帧
          </div>
        )}
        {running && <Developing />}
      </NodeFrame>
      <Handle type="source" position={Position.Right} title="输出视频" />
    </>
  );
}
