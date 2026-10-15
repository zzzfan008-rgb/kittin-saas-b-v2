import { useCallback, useEffect, useRef, useState } from "react";
import { useFlowStore } from "@/store/flowStore";
import type { Asset } from "@/types/workflow";
import { thumbnailImageUrl } from "@/lib/images";
import type { AssetPickerCategory } from "@/lib/overlayEvents";
import {
  ASSET_EMPTY_HINT,
  ASSET_LEVEL1,
  ASSET_LEVEL2,
  type AssetLeafId,
  type AssetLevel1Id,
} from "@/lib/assetTaxonomy";

/** 一页 5 列 × 6 行 = 30；滚轮到底自动拉下一页。 */
const PAGE_SIZE = 30;

/** 替换弹窗只选图片：视频大类不出现（参考视频/语音不能写入图片节点）。 */
const LEVEL1 = ASSET_LEVEL1.filter((l1) => l1.id !== "video");

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
 *   - 保留分类筛选、搜索、滚动自动加载。
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

  const [level1, setLevel1] = useState<AssetLevel1Id>("design");
  const [leaf, setLeaf] = useState<AssetLeafId>("print");
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
  const scrollerRef = useRef<HTMLDivElement>(null);

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
      const history = leaf === "history";
      if (!history) {
        params.set("category", leaf);
        if (debouncedSearch) params.set("search", debouncedSearch);
      }
      const res = await fetch(history ? `/api/assets/history-uploads?${params}` : `/api/assets?${params}`);
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
  }, [leaf, debouncedSearch]);

  useEffect(() => {
    void load(0);
  }, [load]);

  // 滚轮到底自动拉下一页（5×6 固定视口）
  const maybeLoadMore = () => {
    const scroller = scrollerRef.current;
    if (!scroller || !hasMore || loading) return;
    const remain = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    if (remain < 320) void load(assets.length);
  };
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    if (scroller.scrollHeight <= scroller.clientHeight + 48) maybeLoadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

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
        className="flex h-[min(700px,88vh)] w-[min(760px,92vw)] flex-col rounded-lg border border-[var(--gc-border)] bg-[var(--gc-panel)]"
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

        <div className="space-y-2 border-b border-[var(--gc-border)] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex gap-1" role="tablist" aria-label="资产大类">
              {LEVEL1.map((l1) => (
                <button
                  key={l1.id}
                  type="button"
                  role="tab"
                  aria-selected={level1 === l1.id}
                  onClick={() => {
                    setLevel1(l1.id);
                    const first = ASSET_LEVEL2[l1.id][0];
                    // 无子类的一级（历史素材）直接落到同名叶子
                    setLeaf(first ? first.id : "history");
                  }}
                  className={`rounded-sm border px-2 py-1 text-label font-medium transition-colors ${
                    level1 === l1.id
                      ? "border-gold/60 text-gold"
                      : "border-[var(--gc-border)] text-[var(--gc-text-muted)] hover:text-[var(--gc-text)]"
                  }`}
                >
                  {l1.label}
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
          <div className="flex items-center gap-2">
            {ASSET_LEVEL2[level1].length > 0 ? (
              <div className="flex gap-1" role="tablist" aria-label="资产子类">
                {ASSET_LEVEL2[level1].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={leaf === item.id}
                    onClick={() => setLeaf(item.id)}
                    className={`rounded-sm border px-2 py-1 text-label transition-colors ${
                      leaf === item.id
                        ? "border-gold/60 text-gold"
                        : "border-[var(--gc-border)] text-[var(--gc-text-muted)] hover:text-[var(--gc-text)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-label text-[var(--gc-text-muted)]">全部历史上传（新的在前）</span>
            )}
            <span className="ml-auto text-label text-[var(--gc-text-muted)]">
              在「{leaf === "history" ? "历史素材" : (ASSET_LEVEL2[level1].find((item) => item.id === leaf)?.label ?? "")}」中搜索
            </span>
          </div>
        </div>

        <div ref={scrollerRef} onScroll={maybeLoadMore} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
          {uploadError && (
            <p className="mb-3 rounded-md border border-red-900/50 bg-red-950/40 px-3 py-2 text-label text-red-400">
              上传失败：{uploadError}
            </p>
          )}

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
              {debouncedSearch && leaf !== "history" ? "没有匹配的素材" : ASSET_EMPTY_HINT[leaf]}
            </p>
          )}
          {(assets.length > 0 || !loading) && !error && (
            <div className="mt-2.5 grid grid-cols-5 gap-2.5">
              {/* 第一格：本地上传（与素材卡同尺寸） */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={readOnly || uploading}
                title={readOnly ? "只读项目不能替换图片" : "从本地上传图片"}
                className={`${cardBaseClass} flex aspect-square w-full flex-col items-center justify-center gap-1.5 border-dashed disabled:opacity-40`}
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
                  <div className="truncate px-1.5 py-1 text-body text-[var(--gc-text)]">{
                    asset.id.startsWith("upload-")
                      ? `本地上传 ${new Date(asset.createdAt).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}`
                      : asset.name
                  }</div>
                </button>
              ))}
            </div>
          )}
          {loading && assets.length > 0 && (
            <p className="py-3 text-center text-label text-[var(--gc-text-muted)]">加载中…</p>
          )}
        </div>
      </div>
    </div>
  );
}
