import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { NODE_SPECS, type Asset, type NodeKind } from "@/types/workflow";
import {
  selectActiveNodes,
  selectActivePrimarySelectedNodeId,
  useFlowStore,
  type FlowNode,
} from "@/store/flowStore";
import { DND_MIME } from "../CanvasFlow";
import { thumbnailImageUrl } from "@/lib/images";
import { cn } from "@/lib/utils";
import { requestCanvasLanding } from "@/lib/canvasLanding";

const KIND_ORDER: NodeKind[] = [
  "image-input",
  "sketch-to-render",
  "ai-modify",
  "fabric-recolor",
  "upscale",
  "print-extract",
  "print-mutate",
  "mask-redraw",
  "result",
];

type Tab = "nodes" | "assets";

export function nodeLibraryClickPosition(
  nodes: readonly FlowNode[],
  selectedNodeId: string | null,
): { x: number; y: number } {
  const anchor = nodes.find((node) => node.id === selectedNodeId) ?? nodes.at(-1);
  if (!anchor) return { x: 0, y: 0 };
  return { x: anchor.position.x + 380, y: anchor.position.y };
}

export function NodeLibraryPanel({ className }: { className?: string }) {
  const [tab, setTab] = useState<Tab>("nodes");

  return (
    <aside
      className={cn(
        "gc-panel flex w-52 shrink-0 flex-col border-r border-[#262626] bg-[#141414]",
        className,
      )}
    >
      <div className="flex border-b border-[#262626]">
        {(
          [
            ["nodes", "节点库"],
            ["assets", "素材库"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 px-3 py-2.5 text-[10px] font-medium uppercase tracking-widest transition-colors ${
              tab === key
                ? "border-b border-gold text-gold"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "nodes" && <NodeList />}
      {tab === "assets" && <AssetList />}
      {tab === "nodes" && (
        <div className="border-t border-[#262626] px-3 py-2 text-[10px] leading-relaxed text-neutral-600">
          点击添加 · 也可拖拽到画布
          <br />
          左键框选 · 中/右键平移 · Delete 删除
        </div>
      )}
    </aside>
  );
}

function NodeList() {
  const addByClick = (kind: NodeKind) => {
    const state = useFlowStore.getState();
    const position = nodeLibraryClickPosition(
      selectActiveNodes(state),
      selectActivePrimarySelectedNodeId(state),
    );
    let nodeId: string | null = null;
    flushSync(() => {
      nodeId = useFlowStore.getState().addNode(kind, position);
    });
    if (!nodeId) return;
    requestCanvasLanding({
      tabId: useFlowStore.getState().activeTabId,
      nodeId,
      fitView: false,
      activateFilePicker: kind === "image-input",
      selectText: kind !== "image-input" && kind !== "result",
    });
  };

  return (
    <div className="flex-1 space-y-2 overflow-y-auto p-3">
      {KIND_ORDER.map((kind) => {
        const spec = NODE_SPECS[kind];
        return (
          <button
            type="button"
            key={kind}
            draggable
            onClick={() => addByClick(kind)}
            onDragStart={(e) => {
              e.dataTransfer.setData(DND_MIME, kind);
              e.dataTransfer.effectAllowed = "move";
            }}
            title={`点击添加${spec.title}，或拖拽到画布指定位置`}
            className="gc-node-library-card block w-full cursor-grab select-none rounded-lg border border-[#262626] bg-[#1a1a1a] p-2.5 text-left transition-colors hover:border-gold/60 focus-visible:border-gold focus-visible:outline-hidden active:cursor-grabbing"
          >
            <div className="text-xs font-medium text-neutral-200">{spec.title}</div>
            <div className="mt-1 text-[10px] leading-relaxed text-neutral-500">
              {spec.description}
            </div>
          </button>
        );
      })}
    </div>
  );
}

const CATEGORY_STYLE: Record<Asset["category"], { label: string; className: string }> = {
  print: { label: "印花", className: "border-gold/40 text-gold" },
  fabric: { label: "面料", className: "border-blue-400/40 text-blue-400" },
  reference: { label: "参考", className: "border-neutral-600 text-neutral-400" },
};

function AssetList() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 20;

  const load = useCallback(async (offset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/assets?limit=${pageSize}&offset=${offset}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const page = (await res.json()) as Asset[];
      if (!Array.isArray(page)) throw new Error("素材数据格式无效");
      setAssets((current) => {
        if (offset === 0) return page;
        const ids = new Set(current.map((asset) => asset.id));
        return [...current, ...page.filter((asset) => !ids.has(asset.id))];
      });
      setHasMore(page.length === pageSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(0);
  }, [load]);

  /** 点击素材：在最左侧节点左边新增一个 image-input 节点并灌入图片 */
  const addToCanvas = (asset: Asset) => {
    const state = useFlowStore.getState();
    const nodes = selectActiveNodes(state);
    const { addAssetNode } = state;
    const minX = Math.min(0, ...nodes.map((n) => n.position.x));
    addAssetNode(asset, { x: minX - 320, y: nodes.length * 40 });
    // 引用关系由项目保存时根据最终画布统一同步；未保存项目不提前占用素材。
  };

  const removeAsset = async (asset: Asset) => {
    try {
      const res = await fetch(`/api/assets/${asset.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setAssets((list) => list.filter((a) => a.id !== asset.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const toggleShare = async (asset: Asset) => {
    const scope = asset.scope === "shared" ? "private" : "shared";
    try {
      const res = await fetch(`/api/assets/${asset.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scope }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setAssets((list) => list.map((item) => item.id === asset.id ? { ...item, scope } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  if (loading && assets.length === 0) {
    return <p className="flex-1 py-4 text-center text-[10px] text-neutral-600">加载中…</p>;
  }
  if (error && assets.length === 0) {
    return (
      <div className="flex-1 py-4 text-center">
        <p className="text-[10px] text-neutral-600">素材服务暂不可用（{error}）</p>
        <button
          type="button"
          onClick={() => void load(0)}
          className="mt-2 rounded-sm border border-[#262626] px-2 py-1 text-[10px] text-neutral-400 hover:border-gold/50 hover:text-gold"
        >
          重试
        </button>
      </div>
    );
  }
  if (assets.length === 0) {
    return (
      <p className="flex-1 py-4 text-center text-[10px] text-neutral-600">
        暂无素材，可在印花提取节点中「存为素材」
      </p>
    );
  }

  return (
    <div className="flex-1 space-y-2 overflow-y-auto p-3">
      {assets.map((asset) => {
        const cat = CATEGORY_STYLE[asset.category];
        return (
          <div
            key={asset.id}
            className="rounded-lg border border-[#262626] bg-[#1a1a1a] p-2.5"
          >
            <button
              type="button"
              onClick={() => addToCanvas(asset)}
              title="点击添加到画布"
              className="block w-full overflow-hidden rounded-md border border-[#262626] bg-[#0f0f0f] transition-colors hover:border-gold/60"
            >
              <img
                src={asset.thumbnail ?? thumbnailImageUrl(asset.image)}
                alt={asset.name}
                loading="lazy"
                decoding="async"
                className="aspect-square w-full object-cover"
              />
            </button>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="truncate text-xs font-medium text-neutral-200">{asset.name}</span>
              <span className={`shrink-0 rounded-sm border px-1 py-px text-[9px] ${cat.className}`}>
                {cat.label}
              </span>
              <span className="shrink-0 text-[9px] text-neutral-600">
                {asset.scope === "global" ? "通用" : asset.scope === "shared" ? "已共享" : "私有"}
              </span>
            </div>
            {asset.sourceNote && (
              <div className="mt-1 truncate text-[10px] text-neutral-600">{asset.sourceNote}</div>
            )}
            <div className="mt-2 flex gap-1.5">
              <button
                type="button"
                onClick={() => addToCanvas(asset)}
                className="flex-1 rounded-sm border border-[#262626] px-1.5 py-1 text-[10px] text-neutral-300 transition-colors hover:border-gold/60 hover:text-gold"
              >
                添加到画布
              </button>
              {asset.canManage && asset.scope !== "global" && (
                <button type="button" onClick={() => void toggleShare(asset)}
                  className="rounded-sm border border-[#262626] px-1.5 py-1 text-[10px] text-neutral-500 hover:text-gold">
                  {asset.scope === "shared" ? "取消共享" : "共享"}
                </button>
              )}
              {asset.canManage && (
                <button type="button" onClick={() => void removeAsset(asset)}
                  className="rounded-sm border border-[#262626] px-1.5 py-1 text-[10px] text-neutral-500 transition-colors hover:border-red-900 hover:text-red-400">
                  删除
                </button>
              )}
            </div>
          </div>
        );
      })}
      {hasMore && (
        <button
          type="button"
          onClick={() => void load(assets.length)}
          disabled={loading}
          className="w-full rounded-md border border-dashed border-(--gc-border) px-3 py-2 text-[10px] text-(--gc-text-muted) hover:border-(--gc-accent) hover:text-(--gc-accent) disabled:opacity-50"
        >
          {loading ? "加载中…" : "加载更多素材"}
        </button>
      )}
    </div>
  );
}
