import { useCallback, useEffect, useRef, useState } from "react";
import { useFlowStore } from "@/store/flowStore";
import type { Asset } from "@/types/workflow";
import { thumbnailImageUrl } from "@/lib/images";
import type { AssetPickerCategory } from "@/lib/overlayEvents";

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

interface ReplaceImageDialogProps {
  nodeId: string;
  nodeLabel: string;
  readOnly: boolean;
  /** 触发本地文件选择并上传；返回后由调用方决定是否关闭弹窗 */
  onUpload: (file: File | undefined | null) => Promise<void> | void;
  /** 从素材库选中一个素材 */
  onPickFromLibrary: (imageUrl: string) => void;
  onClose: () => void;
}

/**
 * R-107：图片节点「替换」统一弹窗。
 *
 * 用户批注：
 *   - 删掉图片节点内「从本地上传 / 从素材库替换」两按钮；
 *   - 点工具条「替换」→ 弹出独立窗口；
 *   - 第一张卡片 = 上传本地文件；其他 = 素材库网格；**卡片大小一致**；
 *   - 保留分类筛选、搜索、加载更多。
 */
export function ReplaceImageDialog({
  nodeId: _nodeId,
  nodeLabel,
  readOnly,
  onUpload,
  onPickFromLibrary,
  onClose,
}: ReplaceImageDialogProps) {
  const updateNodeDataInTab = useFlowStore((s) => s.updateNodeDataInTab);
  void updateNodeDataInTab; // 保持 store 订阅（用户预期此弹窗与节点绑定）
  void _nodeId; // 显式标记未用（保留 API 契约稳定性）

  const [category, setCategory] = useState<CategoryFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const requestGeneration = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    void load(0);
  }, [load]);

  // Esc 关闭
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleLocalFile = async (file: File | undefined | null) => {
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  };

  const cardBaseClass =
    "overflow-hidden rounded-md border border-[var(--gc-border)] bg-[var(--gc-panel-hover)] text-left transition-colors hover:border-gold/60 disabled:opacity-40";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-[min(680px,90vw)] flex-col rounded-lg border border-[var(--gc-border)] bg-[var(--gc-panel)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--gc-border)] px-4 py-3">
          <span className="text-xs font-medium tracking-widest text-[var(--gc-text-muted)]">
            替换图片 · {nodeLabel}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-[var(--gc-border)] px-2 py-1 text-label text-[var(--gc-text-muted)] hover:border-gold/50 hover:text-gold"
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
                className={`rounded-sm border px-2 py-1 text-label transition-colors ${
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
            className="ml-auto w-44 rounded-sm border border-[var(--gc-border)] bg-[var(--gc-control)] px-2 py-1 text-label text-[var(--gc-text)] placeholder:text-[var(--gc-text-muted)] focus:border-gold/60 focus:outline-hidden"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {uploadError && (
            <p className="mb-3 rounded-md border border-red-900/50 bg-red-950/40 px-3 py-2 text-label text-red-400">
              上传失败：{uploadError}
            </p>
          )}

          {/* 第一张卡片：本地上传（尺寸与素材卡片一致：aspect-square + object-cover） */}
          <div className="grid grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={readOnly || uploading}
              title={readOnly ? "只读项目不能替换图片" : "从本地上传图片"}
              className={`${cardBaseClass} flex flex-col items-center justify-center gap-1.5 border-dashed disabled:opacity-40`}
            >
              <span className="text-2xl text-[var(--gc-text-muted)]">+</span>
              <span className="text-label text-[var(--gc-text-muted)]">
                {uploading ? "上传中…" : "从本地上传"}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple={false}
              disabled={readOnly}
              tabIndex={-1}
              aria-label="从本地上传图片"
              className="pointer-events-none absolute h-0 w-0 opacity-0"
              onChange={(event) => {
                void handleLocalFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </div>

          {error && (
            <div className="mt-3 py-6 text-center">
              <p className="text-body text-[var(--gc-text-muted)]">素材服务暂不可用（{error}）</p>
              <button
                type="button"
                onClick={() => void load(0)}
                className="mt-2 rounded-sm border border-[var(--gc-border)] px-2 py-1 text-label text-[var(--gc-text-muted)] hover:border-gold/50 hover:text-gold"
              >
                重试
              </button>
            </div>
          )}
          {!error && loading && assets.length === 0 && (
            <p className="mt-3 py-6 text-center text-label text-[var(--gc-text-muted)]">加载中…</p>
          )}
          {!error && !loading && assets.length === 0 && (
            <p className="mt-3 py-6 text-center text-label text-[var(--gc-text-muted)]">
              {debouncedSearch ? "没有匹配的素材" : EMPTY_HINT[category]}
            </p>
          )}
          {assets.length > 0 && (
            <div className="mt-2.5 grid grid-cols-4 gap-2.5">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => onPickFromLibrary(asset.image)}
                  title={asset.name}
                  disabled={readOnly}
                  className={cardBaseClass}
                >
                  <img
                    src={asset.thumbnail ?? thumbnailImageUrl(asset.image)}
                    alt={asset.name}
                    loading="lazy"
                    decoding="async"
                    className="aspect-square w-full bg-[var(--gc-control)] object-cover"
                  />
                  <div className="truncate px-1.5 py-1 text-body text-[var(--gc-text)]">{asset.name}</div>
                </button>
              ))}
            </div>
          )}
          {hasMore && (
            <button
              type="button"
              onClick={() => void load(assets.length)}
              disabled={loading}
              className="mt-2.5 w-full rounded-md border border-dashed border-[var(--gc-border)] px-3 py-2 text-label text-[var(--gc-text-muted)] hover:border-gold/60 hover:text-gold disabled:opacity-50"
            >
              {loading ? "加载中…" : "加载更多素材"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
