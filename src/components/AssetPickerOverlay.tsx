import { useCallback, useEffect, useRef, useState } from "react";
import {
  selectActiveNodes,
  selectActivePrimarySelectedNodeId,
  useFlowStore,
} from "@/store/flowStore";
import type { Asset } from "@/types/workflow";
import { thumbnailImageUrl } from "@/lib/images";
import { canvasNodeClickPosition } from "@/components/panels/canvasNodeActions";
import { requestCanvasLanding } from "@/lib/canvasLanding";
import type { AssetPickerCategory, AssetPickerRequest } from "@/lib/overlayEvents";
import {
  ASSET_EMPTY_HINT,
  ASSET_LEVEL1,
  ASSET_LEVEL2,
  normalizeLeaf,
  type AssetLeafId,
  type AssetLevel1Id,
} from "@/lib/assetTaxonomy";
import { assetNameFromUpload } from "@/lib/assetSave";

/** 一页 5 列 × 6 行 = 30；滚轮到底自动拉下一页。 */
const PAGE_SIZE = 30;

/** 资产库选择浮层：两级分类 + 名称搜索，选中后写回目标图片上传节点 */
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
  const resolvedInitialLeaf = normalizeLeaf(request.initialCategory ?? initialCategory);
  const [level1, setLevel1] = useState<AssetLevel1Id>(() =>
    (Object.keys(ASSET_LEVEL2) as AssetLevel1Id[]).find((l1) =>
      ASSET_LEVEL2[l1].some((leaf) => leaf.id === resolvedInitialLeaf),
    ) ?? "design",
  );
  const [leaf, setLeaf] = useState<AssetLeafId>(resolvedInitialLeaf);
  const pickLeaf = useCallback((next: AssetLeafId) => {
    setLeaf(next);
    for (const l1 of ASSET_LEVEL1) {
      if (ASSET_LEVEL2[l1.id].some((item) => item.id === next)) { setLevel1(l1.id); break; }
    }
  }, []);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestGeneration = useRef(0);
  // 管理模式：多选 + 改名/删除/上传
  const [managing, setManaging] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  // 上传入口卡：多选串行上传进度
  const [uploading, setUploading] = useState(false);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  /** 点击来源决定的落库意图（卡片/新增/上传按钮共用同一个 input）。 */
  const uploadIntentRef = useRef<{ toHistoryOnly: boolean; leaf: AssetLeafId }>({
    toHistoryOnly: false,
    leaf: resolvedInitialLeaf,
  });
  const scrollerRef = useRef<HTMLDivElement>(null);

  const openFilePicker = (intent: { toHistoryOnly: boolean; leaf: AssetLeafId }) => {
    uploadIntentRef.current = intent;
    fileInputRef.current?.click();
  };

  // 同一个浮层实例被指向另一个节点时，预选分类跟随新请求；用户手动切换不被覆盖。
  // pickLeaf 与 setLeaf 同源（同一分类状态），放入 deps 不会引发循环。
  useEffect(() => {
    setLeaf((current) => {
      if (current === resolvedInitialLeaf) return current;
      return resolvedInitialLeaf;
    });
    pickLeaf(resolvedInitialLeaf);
  }, [resolvedInitialLeaf, pickLeaf]);

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

  // 打开、切换分类或搜索词变化时都从第一页重新拉取
  useEffect(() => {
    void load(0);
  }, [request, load]);

  // 滚轮到底自动拉下一页（5×6 固定视口）
  const maybeLoadMore = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !hasMore || loading) return;
    const remain = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    if (remain < 320) void load(assets.length);
  }, [hasMore, loading, load, assets.length]);
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    if (scroller.scrollHeight <= scroller.clientHeight + 48) maybeLoadMore();
  }, [maybeLoadMore]);

  const pick = (asset: Asset) => {
    // 有写回目标 = 选中节点后打开：素材等同一次上传（R8 上传位语义）。
    if (request.target && request.nodeId) {
      updateNodeDataInTab(request.target, request.nodeId, {
        outputImages: [asset.image],
        status: "success",
        error: undefined,
      });
      onRequestChange(null);
      return;
    }
    // 浏览模式（左侧直接打开）：新建图片节点承载该素材，不弹上传框。
    const state = useFlowStore.getState();
    const position = canvasNodeClickPosition(
      selectActiveNodes(state),
      selectActivePrimarySelectedNodeId(state),
    );
    const nodeId = state.addNode("image", position);
    if (!nodeId) {
      setError("当前项目只读或没有打开的画布，不能新建节点");
      return;
    }
    useFlowStore.getState().updateNodeData(nodeId, {
      outputImages: [asset.image],
      status: "success",
      error: undefined,
    });
    requestCanvasLanding({
      tabId: useFlowStore.getState().activeTabId,
      nodeId,
      fitView: false,
    });
    onRequestChange(null);
  };

  const toggleSelect = (asset: Asset) => {
    if (asset.canManage === false) return;
    setSelectedIds((current) =>
      current.includes(asset.id) ? current.filter((id) => id !== asset.id) : [...current, asset.id],
    );
  };

  const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // 新增/上传：本地多选 → 串行建资产（当前类目）或仅入历史素材（files）。
  // intent 在点击时快照（leaf），循环内不再读实时 leaf，避免切换类目途中串类。
  const handleUploadFiles = async (
    files: FileList | null,
    intent: { toHistoryOnly: boolean; leaf: AssetLeafId },
  ) => {
    const list = files ? Array.from(files) : [];
    if (list.length === 0) return;
    setNotice(null);
    setError(null);
    setUploading(true);
    setUploadTotal(list.length);
    setUploadProgress(0);
    const failures: string[] = [];
    let success = 0;
    const { toHistoryOnly, leaf: targetLeaf } = intent;
    try {
      // 串行逐个上传：避免并发撑爆 50mb body；单文件失败不阻断其余。
      for (let index = 0; index < list.length; index += 1) {
        const file = list[index];
        setUploadProgress(index + 1);
        try {
          const dataUrl = await readFileAsDataUrl(file);
          const up = await fetch("/api/files", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dataUrl }),
          });
          const saved = (await up.json().catch(() => ({}))) as { url?: string; error?: string };
          if (!up.ok || !saved.url) throw new Error(saved.error || `上传失败 HTTP ${up.status}`);
          if (!toHistoryOnly && targetLeaf !== "history") {
            const name = assetNameFromUpload(file.name, "未命名素材");
            const created = await fetch("/api/assets", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, category: targetLeaf, image: saved.url }),
            });
            if (!created.ok) {
              const detail = (await created.json().catch(() => ({}))) as { error?: string };
              throw new Error(detail.error || `建资产失败 HTTP ${created.status}`);
            }
          }
          success += 1;
        } catch (err) {
          failures.push(`${file.name}：${err instanceof Error ? err.message : String(err)}`);
        }
      }
    } finally {
      setUploading(false);
      setUploadTotal(0);
      setUploadProgress(0);
    }
    setSelectedIds([]);
    if (success > 0) {
      // 新文件名通常不在当前搜索结果内，清空搜索避免"看着没变化"。
      if (debouncedSearch) setSearch("");
      if (toHistoryOnly && targetLeaf !== "history") {
        setNotice(`已上传 ${success} 张到历史素材`);
      } else {
        await load(0);
        setNotice(`已上传 ${success} 张`);
      }
    }
    if (failures.length > 0) {
      setError(`部分上传失败：${failures.join("；")}`);
    }
  };

  const startRename = () => {
    const target = assets.find((a) => a.id === selectedIds[0]);
    if (!target || selectedIds.length !== 1) return;
    setRenameValue(target.id.startsWith("upload-") ? "" : target.name);
    setRenaming(true);
  };

  const commitRename = async () => {
    const id = selectedIds[0];
    const name = renameValue.trim();
    if (!id || !name) return;
    setError(null);
    try {
      const res = await fetch(`/api/assets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const detail = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(detail.error || `改名失败 HTTP ${res.status}`);
      }
      setAssets((current) => current.map((a) => (a.id === id ? { ...a, name } : a)));
      setRenaming(false);
      setSelectedIds([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    setError(null);
    const failures: string[] = [];
    for (const id of selectedIds) {
      try {
        const history = id.startsWith("upload-");
        const res = await fetch(
          history ? `/api/files/${id.slice("upload-".length)}` : `/api/assets/${id}`,
          { method: "DELETE" },
        );
        if (!res.ok) {
          const detail = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(detail.error || `HTTP ${res.status}`);
        }
      } catch (err) {
        failures.push(`${id}：${err instanceof Error ? err.message : String(err)}`);
      }
    }
    setSelectedIds([]);
    setRenaming(false);
    await load(0);
    if (failures.length > 0) setError(`部分删除失败：${failures.join("；")}`);
  };

  const selectedAssets = assets.filter((a) => selectedIds.includes(a.id));
  const renameTarget = selectedAssets.length === 1 ? selectedAssets[0] : undefined;
  const canRename = !!renameTarget && !renameTarget.id.startsWith("upload-") && renameTarget.canManage !== false;
  const uploadable = leaf !== "refvideo" && leaf !== "audio";
  const leafLabel = leaf === "history"
    ? "历史素材"
    : (ASSET_LEVEL2[level1].find((item) => item.id === leaf)?.label ?? "");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs"
      onClick={() => onRequestChange(null)}
    >
      <div
        className="flex h-[min(700px,88vh)] w-[min(760px,92vw)] flex-col rounded-lg border border-[var(--gc-border)] bg-[var(--gc-panel)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--gc-border)] px-4 py-3">
          <span className="text-xs font-medium tracking-widest text-[var(--gc-text-muted)]">资产库</span>
          <button
            type="button"
            onClick={() => onRequestChange(null)}
            className="rounded-sm border border-[var(--gc-border)] px-2 py-1 text-label text-[var(--gc-text-muted)] hover:border-gold/50 hover:text-gold"
          >
            关闭
          </button>
        </div>

        {/* 常驻隐藏 input：上传入口卡 + 管理栏「新增/上传」共用同一选择器 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          tabIndex={-1}
          aria-label="从本地上传图片"
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          onChange={(e) => {
            void handleUploadFiles(e.target.files, uploadIntentRef.current);
            e.target.value = "";
          }}
        />

        <div className="space-y-2 border-b border-[var(--gc-border)] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex gap-1" role="tablist" aria-label="资产大类">
              {ASSET_LEVEL1.map((l1) => (
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
            <button
              type="button"
              onClick={() => { setManaging((on) => !on); setSelectedIds([]); }}
              aria-pressed={managing}
              title="管理素材：多选、改名、删除、上传"
              className={`ml-auto rounded-sm border px-2 py-1 text-label transition-colors ${
                managing
                  ? "border-gold/60 text-gold"
                  : "border-[var(--gc-border)] text-[var(--gc-text-muted)] hover:text-[var(--gc-text)]"
              }`}
            >
              {managing ? "完成" : "管理"}
            </button>
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
          {managing && (
            <div className="flex flex-wrap items-center gap-2 border-t border-[var(--gc-border)] pt-2">
              <button
                type="button"
                onClick={startRename}
                disabled={!canRename}
                title={leaf === "history" ? "历史素材不支持改名" : selectedIds.length !== 1 ? "选中单个素材后改名" : "修改名称"}
                className="rounded-sm border border-[var(--gc-border)] px-2 py-1 text-label text-[var(--gc-text-muted)] hover:border-gold/50 hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
              >
                修改名称
              </button>
              <button
                type="button"
                onClick={() => void deleteSelected()}
                disabled={selectedIds.length === 0}
                title={selectedIds.length === 0 ? "先点选素材" : `删除选中的 ${selectedIds.length} 项`}
                className="rounded-sm border border-red-900/60 px-2 py-1 text-label text-red-400 hover:border-red-400/60 disabled:cursor-not-allowed disabled:opacity-40"
              >
                删除{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
              </button>
              {renaming && (
                <span className="flex items-center gap-1">
                  <input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") void commitRename(); }}
                    placeholder="新名称"
                    maxLength={60}
                    className="w-40 rounded-sm border border-[var(--gc-border)] bg-[var(--gc-control)] px-2 py-1 text-label text-[var(--gc-text)] focus:border-gold/60 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => void commitRename()}
                    disabled={!renameValue.trim()}
                    className="rounded-sm border border-gold/60 px-2 py-1 text-label text-gold disabled:opacity-40"
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenaming(false)}
                    className="rounded-sm border border-[var(--gc-border)] px-2 py-1 text-label text-[var(--gc-text-muted)] hover:text-[var(--gc-text)]"
                  >
                    取消
                  </button>
                </span>
              )}
              {notice && <span className="text-label text-[var(--gc-text-muted)]">{notice}</span>}
            </div>
          )}
        </div>

        <div ref={scrollerRef} onScroll={maybeLoadMore} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
          {error && (
            <div className="py-6 text-center">
              <p className="text-body text-red-400">{error}</p>
              <button
                type="button"
                onClick={() => { setError(null); void load(0); }}
                className="mt-2 rounded-sm border border-[var(--gc-border)] px-2 py-1 text-label text-[var(--gc-text-muted)] hover:border-gold/50 hover:text-gold"
              >
                关闭
              </button>
            </div>
          )}
          {!error && loading && assets.length === 0 && (
            <p className="py-6 text-center text-label text-[var(--gc-text-muted)]">加载中…</p>
          )}
          {!error && !loading && assets.length === 0 && (
            <p className="py-6 text-center text-label text-[var(--gc-text-muted)]">
              {debouncedSearch && leaf !== "history" ? "没有匹配的素材" : ASSET_EMPTY_HINT[leaf]}
            </p>
          )}
          {!error && !(loading && assets.length === 0) && (
            <div className="grid grid-cols-5 gap-2.5">
              {/* 首格常驻上传入口卡：同素材卡尺寸；参考视频/语音两类禁用 */}
              <button
                type="button"
                onClick={() => openFilePicker({ toHistoryOnly: leaf === "history", leaf })}
                disabled={!uploadable || uploading}
                title={uploadable ? `从本地上传图片到「${leafLabel}」` : "该类目暂不支持上传"}
                aria-label={uploadable ? `从本地上传图片到「${leafLabel}」` : "该类目暂不支持上传"}
                className="relative overflow-hidden rounded-md border border-dashed border-[var(--gc-border)] bg-[var(--gc-panel-hover)] text-left transition-colors hover:border-gold/60 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <div className="flex aspect-square w-full flex-col items-center justify-center gap-1.5 bg-[var(--gc-control)] text-[var(--gc-text-muted)]">
                  <span aria-hidden="true" className="text-2xl">+</span>
                </div>
                <div className="truncate px-1.5 py-1 text-body text-[var(--gc-text)]">
                  {uploading ? `上传中 ${uploadProgress}/${uploadTotal}…` : "本地上传"}
                </div>
              </button>
              {assets.map((asset) => {
                const selected = selectedIds.includes(asset.id);
                const locked = asset.canManage === false;
                return (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => (managing ? toggleSelect(asset) : pick(asset))}
                  title={managing ? (locked ? "无权管理" : asset.name) : asset.name}
                  aria-pressed={managing ? selected : undefined}
                  className={`relative overflow-hidden rounded-md border text-left transition-colors ${
                    selected
                      ? "border-gold ring-2 ring-gold/70"
                      : "border-[var(--gc-border)] hover:border-gold/60"
                  } bg-[var(--gc-panel-hover)]`}
                >
                  {selected && (
                    <>
                      <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 bg-white/10" />
                      <span aria-hidden="true" className="absolute right-1 top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-meta-en font-bold text-[var(--gc-accent-cta-ink)]">✓</span>
                    </>
                  )}
                  {leaf === "refvideo" ? (
                    <video
                      src={asset.image}
                      preload="metadata"
                      muted
                      playsInline
                      className="aspect-square w-full bg-[var(--gc-control)] object-cover"
                    />
                  ) : leaf === "audio" ? (
                    <div className="flex aspect-square w-full flex-col items-center justify-center gap-1 bg-[var(--gc-control)] text-[var(--gc-text-muted)]">
                      <span aria-hidden="true" className="text-xl">♪</span>
                      <span className="px-1 text-center text-label">语音</span>
                    </div>
                  ) : (
                    <img
                      src={asset.thumbnail ?? thumbnailImageUrl(asset.image)}
                      alt={asset.name}
                      loading="lazy"
                      decoding="async"
                      className="aspect-square w-full bg-[var(--gc-control)] object-cover"
                    />
                  )}
                  <div className="truncate px-1.5 py-1 text-body text-[var(--gc-text)]">{
                    asset.id.startsWith("upload-")
                      ? `本地上传 ${new Date(asset.createdAt).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}`
                      : asset.name
                  }</div>
                </button>
                );
              })}
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
