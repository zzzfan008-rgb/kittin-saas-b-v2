import { useCallback } from "react";
import { ImagePlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ensureTextUpstreamForNode,
  useFlowStore,
} from "@/store/flowStore";
import { requestCanvasLanding } from "@/lib/canvasLanding";

/**
 * 方案 C 空画布中央 CTA（R-75 §3.4）：空白 tab（nodes=[]&&edges=[]）时在画布中央
 * 显示「上传图片开始」入口 + 拖入节点提示；节点库面板保留。业务状态仍在 Store，
 * 上传动作复用 image 节点的文件选择器（canvasLanding activateFilePicker）。
 * 覆盖层不拦截指针事件，拖入节点可直接落到画布（CanvasFlow onDrop）。
 */
export function EmptyCanvasCTA() {
  const empty = useFlowStore((state) => {
    const tab = state.tabs.find((candidate) => candidate.id === state.activeTabId);
    return Boolean(tab && !tab.readOnly && tab.nodes.length === 0 && tab.edges.length === 0);
  });

  const startWithUpload = useCallback(() => {
    const state = useFlowStore.getState();
    const position = { x: 0, y: 0 };
    const nodeId = state.addNode("image", position);
    if (!nodeId) return;
    // auto-text 兜底：一键建 image 节点 + 空 text 节点 + prompt 边（INV-1）。
    ensureTextUpstreamForNode("image", position, nodeId);
    requestCanvasLanding({
      tabId: state.activeTabId,
      nodeId,
      fitView: true,
      activateFilePicker: true,
    });
  }, []);

  if (!empty) return null;

  return (
    <section
      aria-label="开始创作"
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-8"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <Button
          type="button"
          className="pointer-events-auto h-12 px-6 text-base"
          onClick={startWithUpload}
        >
          <ImagePlusIcon aria-hidden="true" className="size-5" />
          上传图片开始
        </Button>
        <p className="text-xs leading-relaxed text-[var(--gc-text-muted)]">
          从左侧「添加」新建文本 / 图片 / 视频节点，或点击上方按钮上传图片
        </p>
      </div>
    </section>
  );
}
