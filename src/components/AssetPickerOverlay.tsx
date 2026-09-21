import { useCallback, useEffect, useRef, useState } from "react";
import {
  useFlowStore,
} from "@/store/flowStore";
import type { Asset } from "@/types/workflow";
import { thumbnailImageUrl } from "@/lib/images";
import type { AssetPickerCategory, AssetPickerRequest } from "@/lib/overlayEvents";

const CATEGORY_TABS = [
  ["all", "全部"],
  ["print", "印花"],
  ["fabric", "面料"],
  ["reference", "参考"],
  ["model", "数字模特"],
] as const;

type CategoryFilter = (typeof CATEGORY_TABS)[number][0];

const PAGE_SIZE = 20;

const EMPTY_HINT: Record<CategoryFilter, string> = {
  all: "暂无素材，可在印花提取节点中「存为素材」",
  print: "暂无印花素材，可在印花提取节点中「存为素材」",
  fabric: "暂无面料素材",
  reference: "暂无参考素材，可在图片查看器中「收藏为资产」",
  model: "暂无数字模特，可在图片查看器中「存入数字模特库」",
};

/** 素材库选择浮层：按分类筛选 + 名称搜索，选中后写回目标图片上传节点 */
export function AssetPickerOverlay({
  request,
  initialCategory,
  onRequestChange,
}: {
  request: AssetPickerRequest;
  /** 打开时预选的分类（缺省读 request.initialCategory，再缺省「全部」）。 */
  initialCategory?: AssetPickerCategory;
  onRequestChange: (request: AssetPickerRequest | null) => void;
}) {
  const updateNodeDataInTab = useFlowStore((s) => s.updateNodeDataInTab);
  const resolvedInitialCategory = request.initialCategory ?? initialCategory ?? "all";
  const [category, setCategory] = useState<CategoryFilter>(resolvedInitialCategory);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestGeneration = useRef(0);

  // 同一个浮层实例被指向另一个节点时，预选分类跟随新请求；用户手动切换不被覆盖。
  useEffect(() => {
    setCategory((current) => (current === resolvedInitialCategory ? current : resolvedInitialCategory));
  }, [resolvedInitialCategory]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async (offset: number) => {
    const generation = offset === 0 ? requestGeneration.current + 1 : requestGeneration.current;
    if (offset === 0) {
      requestGeneration.current = generation;
      setAssets([]);
      setHasMore(false);
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) });
      if (category !== "all") params.set("category", category);
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await fetch(`/api/assets?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const page = (await res.json()) as Asset[];
      if (!Array.isArray(page)) throw new Error("素材数据格式无效");
      if (generation !== requestGeneration.current) return;
      setAssets((current) => {
        if (offset === 0) return page;
        const ids = new Set(current.map((asset) => asset.id));
        return [...current, ...page.filter((asset) => !ids.has(asset.id))];
      });
      setHasMore(page.length === PAGE_SIZE);
    } catch (err) {
      if (generation !== requestGeneration.current) return;
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      if (generation === requestGeneration.current) setLoading(false);
    }
  }, [category, debouncedSearch]);

  // 打开、切换分类或搜索词变化时都从第一页重新拉取
  useEffect(() => {
    void load(0);
  }, [request, load]);

  const pick = (asset: Asset) => {
    // v8：图片输入节点以 outputImages 承载上传图（R8 上传位语义），
    // 选择素材等同一次上传；不再写 v7 的 imageUrl 字段。
    updateNodeDataInTab(request.target, request.nodeId, {
      outputImages: [asset.image],
      status: "success",
      error: undefined,
    });
    onRequestChange(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs"
      onClick={() => onRequestChange(null)}
    >
      <div
        className="flex max-h-[80vh] w-[min(680px,90vw)] flex-col rounded-lg border border-[var(--gc-border)] bg-[var(--gc-panel)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--gc-border)] px-4 py-3">
          <span className="text-xs font-medium tracking-widest text-[var(--gc-text-muted)]">从素材库选择</span>
          <button
            type="button"
            onClick={() => onRequestChange(null)}
            className="rounded-sm border border-[var(--gc-border)] px-2 py-1 text-[10px] text-[var(--gc-text-muted)] hover:border-gold/50 hover:text-gold"
          >
            关闭
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-[var(--gc-border)] px-4 py-2.5">
          <div className="flex gap-1">
            {CATEGORY_TABS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setCategory(key)}
                className={`rounded-sm border px-2 py-1 text-[11px] transition-colors ${
                  category === key
                    ? "border-gold/60 text-gold"
                    : "border-[var(--gc-border)] text-[var(--gc-text-muted)] hover:text-[var(--gc-text)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索素材名称"
            className="ml-auto w-44 rounded-sm border border-[var(--gc-border)] bg-[var(--gc-control)] px-2 py-1 text-[10px] text-[var(--gc-text)] placeholder:text-[var(--gc-text-muted)] focus:border-gold/60 focus:outline-hidden"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="py-6 text-center">
              <p className="text-[10px] text-[var(--gc-text-muted)]">素材服务暂不可用（{error}）</p>
              <button
                type="button"
                onClick={() => void load(0)}
                className="mt-2 rounded-sm border border-[var(--gc-border)] px-2 py-1 text-[10px] text-[var(--gc-text-muted)] hover:border-gold/50 hover:text-gold"
              >
                重试
              </button>
            </div>
          )}
          {!error && loading && assets.length === 0 && (
            <p className="py-6 text-center text-[11px] text-neutral-600">加载中…</p>
          )}
          {!error && !loading && assets.length === 0 && (
            <p className="py-6 text-center text-[11px] text-neutral-600">
              {debouncedSearch ? "没有匹配的素材" : EMPTY_HINT[category]}
            </p>
          )}
          {assets.length > 0 && (
            <div className="grid grid-cols-4 gap-2.5">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => pick(asset)}
                  title={asset.name}
                  className="overflow-hidden rounded-md border border-[var(--gc-border)] bg-[var(--gc-panel-hover)] text-left transition-colors hover:border-gold/60"
                >
                  <img
                    src={asset.thumbnail ?? thumbnailImageUrl(asset.image)}
                    alt={asset.name}
                    loading="lazy"
                    decoding="async"
                    className="aspect-square w-full bg-[var(--gc-control)] object-cover"
                  />
                  <div className="truncate px-1.5 py-1 text-[10px] text-[var(--gc-text)]">{asset.name}</div>
                </button>
              ))}
            </div>
          )}
          {hasMore && (
            <button
              type="button"
              onClick={() => void load(assets.length)}
              disabled={loading}
              className="mt-2.5 w-full rounded-md border border-dashed border-[var(--gc-border)] px-3 py-2 text-[10px] text-[var(--gc-text-muted)] hover:border-gold/60 hover:text-gold disabled:opacity-50"
            >
              {loading ? "加载中…" : "加载更多素材"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
