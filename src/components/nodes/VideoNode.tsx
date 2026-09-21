import { useRef, useState } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { selectActiveReadOnly, useFlowStore } from "@/store/flowStore";
import type { VideoNodeData } from "@/types/workflow";
import { NodeFrame } from "./NodeFrame";
import { NodeToolbar } from "./NodeToolbar";
import { duplicateNode } from "./nodeDuplicate";

/**
 * v8 输入层视频节点（plan.md §1、data-model.md §3）：
 * 只做上传 / 展示 / 作为参考素材来源，不含生成语义字段与运行按钮。
 * 工具条（plan.md §3.2）：[复制] [替换]。
 *
 * 上传能力缺口：`POST /api/files` 只接受图片标准化（image/png|image/jpeg），
 * 视频落地通道由服务端运行链负责，当前没有面向用户的视频上传接口。
 * 因此上传位以禁用态呈现原因，不伪造成功（缺口已上报，见卡评论）。
 */
const VIDEO_UPLOAD_UNAVAILABLE_REASON = "暂不可用：视频上传接口尚未接入";

export function VideoNode({ id, data, selected }: NodeProps<Node<VideoNodeData>>) {
  const readOnly = useFlowStore(selectActiveReadOnly);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const video = data.outputVideos[0];

  const play = () => {
    void videoRef.current?.play();
    setPlaying(true);
  };

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
            kind="video"
            selected={selected}
            actions={{
              copy: {
                onSelect: () => void duplicateNode(id),
                disabled: readOnly,
                disabledReason: "只读项目不能新增节点",
              },
              replace: {
                disabled: true,
                disabledReason: VIDEO_UPLOAD_UNAVAILABLE_REASON,
              },
            }}
          />
        }
      >
        {video ? (
          <div className="nodrag relative overflow-hidden rounded-[10px] border border-[var(--gc-node-border)] bg-black">
            <video
              ref={videoRef}
              src={video}
              preload="metadata"
              controls={playing}
              aria-label={`${data.label} 的视频`}
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
          <div className="flex aspect-video flex-col items-center justify-center gap-1 rounded-[10px] border border-dashed border-[var(--gc-node-border)] px-3 text-center text-[10px] leading-relaxed text-[var(--gc-node-muted)]">
            <span className="font-mono tracking-wider opacity-70">VIDEO · 槽位</span>
            <span>{VIDEO_UPLOAD_UNAVAILABLE_REASON}</span>
          </div>
        )}
        <p className="text-[11px] leading-relaxed text-[var(--gc-node-muted)]">
          作为参考素材来源：连到生成节点的输入柄
        </p>
      </NodeFrame>
      <Handle type="source" position={Position.Right} title="输出视频" />
    </>
  );
}
