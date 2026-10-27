import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { FolderOpenIcon, PlusIcon, SearchIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectItem,
  SelectList,
  SelectPopup,
  SelectPortal,
  SelectPositioner,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { thumbnailImageUrl } from "@/lib/images";
import { deleteProjectRequest, renameProjectRequest } from "@/lib/projectsApi";
import {
  projectTabCloseBlockReason,
  projectTabLifecycle,
  useFlowStore,
  type ProjectTab,
} from "@/store/flowStore";
import { getGenerationSafetyBlockReason } from "@/store/generationSafety";
import type { PersistedWorkflow } from "@/types/workflow";

interface ProjectSummary {
  id: string;
  name: string;
  ownerName?: string;
  readOnly?: boolean;
  updatedAt: string;
  /** 最后生成图（服务端子查询从 flow_json 提取，见 GET /api/projects）。 */
  previewImage?: string;
}

interface ProjectDetail extends ProjectSummary {
  flow: PersistedWorkflow;
}

const EMPTY_PROJECT_COVER = "/assets/project-center/empty-project-cover.jpg";
const PROJECT_CENTER_CARD_GRID_CLASS = "grid grid-cols-3 xl:grid-cols-4 gap-4";
const PROJECT_CENTER_TITLE_CLASS = "min-w-0 flex-1 line-clamp-2 min-h-8 text-xs font-semibold text-[var(--gc-text)]";

function flowPreviewImage(flow: { nodes: unknown[] }): string | undefined {
  for (const rawNode of [...flow.nodes].reverse()) {
    if (!rawNode || typeof rawNode !== "object") continue;
    const data = (rawNode as { data?: unknown }).data;
    if (!data || typeof data !== "object") continue;
    const record = data as Record<string, unknown>;
    const arrays = [record.outputImages, record.images, record.referenceImages];
    for (const value of arrays) {
      if (!Array.isArray(value)) continue;
      const image = [...value].reverse().find((item): item is string => typeof item === "string" && item.length > 0);
      if (image) return image;
    }
    for (const key of ["imageUrl", "fabricImageUrl", "sourceImageUrl"]) {
      const value = record[key];
      if (typeof value === "string" && value.length > 0) return value;
    }
  }
  return undefined;
}

function formatUpdatedAt(value: string) {
  return new Date(value).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ProjectCover({
  src,
  alt,
  fallback = EMPTY_PROJECT_COVER,
}: {
  src?: string;
  alt: string;
  fallback?: string;
}) {
  const [failed, setFailed] = useState(false);
  const image = failed || !src ? fallback : thumbnailImageUrl(src);
  return (
    <img
      src={image}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
    />
  );
}

function CardFrame({ children }: { children: ReactNode }) {
  return (
    <Card size="sm" className="group gap-0 overflow-hidden border border-[var(--gc-border)] bg-[var(--gc-panel-soft)] py-0 text-[var(--gc-text)] ring-0 transition-colors hover:border-[var(--gc-accent)]">
      {children}
    </Card>
  );
}

function ProjectCardSkeletons() {
  return (
    <div aria-label="正在加载最近项目" className={PROJECT_CENTER_CARD_GRID_CLASS}>
      {Array.from({ length: 8 }, (_, index) => (
        <Card key={index} size="sm" className="gap-3 border border-[var(--gc-border)] bg-[var(--gc-panel-soft)] py-0 ring-0">
          <Skeleton className="aspect-[16/10] w-full rounded-none bg-[var(--gc-panel-hover)]" />
          <div className="space-y-2 px-3 pb-3">
            <Skeleton className="h-3 w-2/3 bg-[var(--gc-panel-hover)]" />
            <Skeleton className="h-2.5 w-full bg-[var(--gc-panel-hover)]" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function ProjectCenter({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  /** 排序口径（用户 2026-10-22 批注 1：原静态「最近项目」标题改为下拉框）。
      "updated" = 最近编辑（服务端 ORDER BY updated_at DESC 的原生顺序，零额外开销）。
      不提供「创建时间」：GET /api/projects 不返回 createdAt，加它就超范围了。 */
  const [sortMode, setSortMode] = useState<"updated" | "name">("updated");
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projectsLoadError, setProjectsLoadError] = useState<string | null>(null);
  const projectsLoadVersion = useRef(0);
  const openRequestVersion = useRef(0);
  const projectsHaveLoaded = useRef(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const tabs = useFlowStore((state) => state.tabs);
  const activeTabId = useFlowStore((state) => state.activeTabId);
  const createBlankTab = useFlowStore((state) => state.createBlankTab);
  const initialDraft = tabs.find((tab) => projectTabLifecycle(tab) === "initial_draft");
  // 卡片内联重命名状态（一次只改一张卡）。
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingValue, setRenamingValue] = useState("");

  const loadProjects = useCallback(async () => {
    const version = ++projectsLoadVersion.current;
    if (!projectsHaveLoaded.current) setProjectsLoading(true);
    setProjectsLoadError(null);
    try {
      const projectsResponse = await fetch("/api/projects");
      if (!projectsResponse.ok) throw new Error(`项目 HTTP ${projectsResponse.status}`);
      const summaries = await projectsResponse.json() as ProjectSummary[];
      if (version !== projectsLoadVersion.current) return;
      setProjects(summaries);
      projectsHaveLoaded.current = true;
    } catch (loadError) {
      if (version === projectsLoadVersion.current) {
        setProjectsLoadError(loadError instanceof Error ? loadError.message : String(loadError));
      }
    } finally {
      if (version === projectsLoadVersion.current) setProjectsLoading(false);
    }
  }, []);

  const load = useCallback(async () => {
    setError(null);
    await loadProjects().catch(() => {});
  }, [loadProjects]);

  useEffect(() => {
    if (!open) {
      projectsLoadVersion.current += 1;
      openRequestVersion.current += 1;
      setQuery("");
      setRenamingId(null);
      setRenamingValue("");
      return;
    }
    void load();
  }, [load, open]);

  const visibleError = [error, projectsLoadError].filter(Boolean).join("；");

  const openProject = useCallback(async (project: ProjectSummary) => {
    const requestVersion = ++openRequestVersion.current;
    const alreadyOpen = useFlowStore.getState().tabs.find((tab) => tab.projectId === project.id);
    if (alreadyOpen) {
      useFlowStore.getState().switchTab(alreadyOpen.id);
      onOpenChange(false);
      return;
    }
    try {
      setError(null);
      const response = await fetch(`/api/projects/${project.id}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const detail = await response.json() as ProjectDetail;
      if (requestVersion !== openRequestVersion.current) return;
      if (!Array.isArray(detail.flow?.nodes) || !Array.isArray(detail.flow?.edges)) {
        throw new Error("项目数据损坏或不兼容");
      }
      useFlowStore.getState().openFlowTab({
        projectId: detail.id,
        projectName: detail.name,
        // R-91：持久化 flow 交给文档层读取（版本闸 + v7→v8 惰性迁移），不得自行拆成 nodes/edges。
        flow: detail.flow,
        readOnly: detail.readOnly ?? false,
      });
      onOpenChange(false);
    } catch (openError) {
      if (requestVersion !== openRequestVersion.current) return;
      setError(openError instanceof Error ? openError.message : String(openError));
    }
  }, [onOpenChange]);

  const startRename = useCallback((project: ProjectSummary) => {
    setRenamingId(project.id);
    setRenamingValue(project.name);
  }, []);

  const cancelRename = useCallback(() => {
    setRenamingId(null);
    setRenamingValue("");
  }, []);

  const saveRename = useCallback(async (project: ProjectSummary) => {
    const newName = renamingValue.trim();
    // 空白或未改名：静默收起，不发请求。
    if (!newName || newName === project.name) {
      setRenamingId(null);
      return;
    }
    if (newName.length > 200) {
      setError("项目名称最多 200 字");
      return;
    }
    try {
      setError(null);
      // 服务端返回 trim 后的 name 与刷新的 updatedAt；重拉以拿到新顺序（改名浮顶）。
      await renameProjectRequest(project.id, newName);
      setRenamingId(null);
      await loadProjects();
    } catch (renameError) {
      setError(renameError instanceof Error ? renameError.message : String(renameError));
    }
  }, [renamingValue, loadProjects]);

  const removeProject = useCallback(async (project: ProjectSummary) => {
    // 该项目若正开着页签，先复用页签关闭的硬保护（运行中付费任务/历史对账未完成）：
    // 阻止删除，避免服务端已软删而页签保留、后续保存落到已删项目。
    const openTab = useFlowStore.getState().tabs.find((tab) => tab.projectId === project.id);
    if (openTab) {
      const blockReason = projectTabCloseBlockReason(openTab, getGenerationSafetyBlockReason());
      if (blockReason) {
        setError(blockReason);
        return;
      }
    }
    // 原生二次确认（删除不可撤销）；不引入新弹层原语，与项目中心现有交互保持轻量。
    const confirmed = window.confirm(`确定删除项目「${project.name}」吗？此操作不可撤销。`);
    if (!confirmed) return;
    try {
      setError(null);
      await deleteProjectRequest(project.id);
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      // 联动：关闭该项目已打开的页签（上面已确认其不在关闭封锁态）。
      if (openTab) useFlowStore.getState().closeTab(openTab.id);
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : String(removeError));
    }
  }, []);

  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
  const filteredProjects = useMemo(() => {
    const matched = projects.filter((project) => !normalizedQuery || project.name.toLocaleLowerCase("zh-CN").includes(normalizedQuery));
    if (sortMode === "updated") return matched;
    // 名称排序：中文按 zh-CN 排序规则（拼音序），不区分大小写。
    return [...matched].sort((a, b) => a.name.localeCompare(b.name, "zh-CN", { sensitivity: "base" }));
  }, [normalizedQuery, projects, sortMode]);
  const createProject = () => {
    createBlankTab();
    onOpenChange(false);
  };

  const continueDraft = (draft: ProjectTab) => {
    useFlowStore.getState().switchTab(draft.id);
    onOpenChange(false);
  };

  const searchPlaceholder = "搜索最近项目";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        initialFocus={searchRef}
        showCloseButton={false}
        overlayClassName="z-[60] bg-black/75 backdrop-blur-sm"
        className="gc-panel z-[61] flex h-[min(760px,calc(100vh-5rem))] w-[min(1180px,calc(100vw-5rem))] min-w-[944px] max-w-none flex-col gap-0 overflow-hidden rounded-2xl border border-[var(--gc-border)] bg-[var(--gc-panel)] p-0 text-[var(--gc-text)] shadow-2xl shadow-black/70 ring-0"
      >
          <header className="flex items-center gap-6 border-b border-[var(--gc-border)] px-7 py-5">
            <div className="min-w-48">
              <DialogTitle className="text-base font-semibold text-[var(--gc-text)]">项目中心</DialogTitle>
              <DialogDescription className="mt-1 text-label text-[var(--gc-text-muted)]">
                新建或继续最近项目
              </DialogDescription>
            </div>
            <DialogClose
              type="button"
              aria-label="关闭项目中心"
              className="ml-auto flex size-8 items-center justify-center rounded-lg text-[var(--gc-text-muted)] hover:bg-[var(--gc-panel-hover)] hover:text-[var(--gc-text)]"
            >
              <XIcon aria-hidden="true" className="size-4" />
            </DialogClose>
          </header>

          {/* 用户 2026-09-25 决策 3：项目中心只留「最近项目」；模板入口迁到左侧工作流二级菜单，
              自建模板能力整体取消（绘制内容与打开过的项目都已自动保存）。 */}
          {/* 用户 2026-10-22 批注 1+2：原静态「最近项目」标题行改为筛选条——
              左侧排序下拉（原来只是一行字），右侧搜索框从 header 下移到此行并列。
              用户 2026-09-25 决策 3 保持不变：模板入口仍在左侧工作流二级菜单。 */}
          <div className="flex h-12 w-full shrink-0 items-center gap-2.5 border-b border-[var(--gc-border)] px-7">
            <Select
              value={sortMode}
              onValueChange={(value) => {
                if (value === "updated" || value === "name") setSortMode(value);
              }}
            >
              <SelectTrigger aria-label="项目排序" className="h-6 w-auto gap-1.5 border-0 bg-transparent px-1.5 text-xs text-[var(--gc-accent)] hover:bg-[var(--gc-panel-hover)]">
                <FolderOpenIcon aria-hidden="true" className="size-3.5" />
                <SelectValue>
                  {(selected) => (selected === "name" ? "名称 A→Z" : "最近编辑")}
                </SelectValue>
              </SelectTrigger>
              <SelectPortal>
                <SelectPositioner side="bottom" align="start" alignItemWithTrigger={false}>
                  <SelectPopup>
                    <SelectList>
                      <SelectItem value="updated">最近编辑</SelectItem>
                      <SelectItem value="name">名称 A→Z</SelectItem>
                    </SelectList>
                  </SelectPopup>
                </SelectPositioner>
              </SelectPortal>
            </Select>

            <label className="relative ml-auto block w-80">
              <SearchIcon aria-hidden="true" className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--gc-text-muted)]" />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-8 w-full rounded-lg border border-[var(--gc-border)] bg-[var(--gc-control)] pl-9 pr-3 text-xs text-[var(--gc-text)] placeholder:text-[var(--gc-text-muted)] focus:border-[var(--gc-accent)] focus:outline-hidden"
              />
            </label>
          </div>

          {/* 外层必须同时有 flex + flex-col：只有 flex-col 时它退化成块级盒子，
              子层的 flex-1/min-h-0/overflow-y-auto 全部失效 → 内容超出被
              DialogContent 的 overflow-hidden 直接裁掉，滚轮与滚动条都不出现
              （2026-10-22 用户实测：无法滚动到最下面的项目）。 */}
          <div className="flex min-h-0 flex-1 flex-col gap-0">
            {visibleError && (
              <div role="alert" className="mx-7 mt-5 flex shrink-0 items-center justify-between rounded-lg border border-red-500/30 bg-red-950/20 px-4 py-3 text-body text-red-300">
                <span>加载失败：{visibleError}</span>
                <Button type="button" variant="outline" size="xs" onClick={() => void load()}>重试</Button>
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto p-7">
              {projectsLoading ? (
                <ProjectCardSkeletons />
              ) : (
                <div className={PROJECT_CENTER_CARD_GRID_CLASS}>
                  <CardFrame>
                    <button type="button" onClick={createProject} className="block w-full text-left">
                      <div className="relative flex aspect-[16/10] w-full items-center justify-center bg-[var(--gc-panel-hover)]">
                        {/* 空封面：不放照片，居中放大加号作为唯一的「新建」视觉锚点
                            （用户 2026-10-22 批注 3：改为空白，加号放大 2 倍并上下左右居中）。 */}
                        <span className="flex size-16 items-center justify-center rounded-full border border-[var(--gc-border)] bg-[var(--gc-panel)] text-[var(--gc-text)] transition-colors group-hover:border-[var(--gc-accent)] group-hover:text-[var(--gc-accent)]">
                          <PlusIcon aria-hidden="true" className="size-8" />
                        </span>
                      </div>
                      <span className="block p-3">
                        <span className="block text-xs font-semibold text-[var(--gc-accent)]">新建项目</span>
                        <span className="mt-1 block text-label text-[var(--gc-text-muted)]">从空白服装画布开始</span>
                      </span>
                    </button>
                  </CardFrame>

                  {initialDraft && (
                    <CardFrame>
                      <button type="button" onClick={() => continueDraft(initialDraft)} className="block w-full text-left">
                        <ProjectCover
                          src={flowPreviewImage(initialDraft)}
                          alt={initialDraft.projectName}
                        />
                        <span className="block p-3">
                          <span className="flex items-center gap-2">
                            <span className={PROJECT_CENTER_TITLE_CLASS}>继续草稿</span>
                            <span className="rounded border border-[var(--gc-accent)]/40 px-1.5 py-0.5 text-label text-[var(--gc-accent)]">自动保存</span>
                          </span>
                          <span className="mt-1 block truncate text-label text-[var(--gc-text-muted)]">{initialDraft.projectName}</span>
                        </span>
                      </button>
                    </CardFrame>
                  )}

                  {filteredProjects.map((project) => {
                    const openTab = tabs.find((tab) => tab.projectId === project.id);
                    const isRenaming = renamingId === project.id;
                    return (
                      <CardFrame key={project.id}>
                        <div className="relative">
                          {/* 打开项目只由封面按钮承担；卡片级控件（改名/删除）是其兄弟元素，
                              避免 <button> 内嵌套 <button>/<input> 的非法 HTML 与 a11y 子树排除。 */}
                          <button
                            type="button"
                            onClick={() => void openProject(project)}
                            className="block w-full text-left"
                            disabled={isRenaming}
                          >
                            <ProjectCover src={project.previewImage} alt={project.name} />
                          </button>
                          <span className="block px-3 pb-3 pt-2">
                            <span className="flex items-center gap-2">
                              <span className={PROJECT_CENTER_TITLE_CLASS}>{project.name}</span>
                              {/* 改名按钮长亮（不随 hover 出现）。 */}
                              {!isRenaming && (
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    startRename(project);
                                  }}
                                  className="shrink-0 rounded px-1.5 py-0.5 text-label text-[var(--gc-text-muted)] transition-colors hover:bg-[var(--gc-panel-hover)] hover:text-[var(--gc-text)]"
                                  title="重命名项目"
                                >
                                  改名
                                </button>
                              )}
                              {/* 删除放信息区（与改名同行），避免覆盖封面造成命中歧义；
                                  hover 卡片时显现，二次确认由 removeProject 负责。 */}
                              {!isRenaming && (
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    void removeProject(project);
                                  }}
                                  className="shrink-0 rounded px-1.5 py-0.5 text-label text-red-500 opacity-0 transition-opacity hover:bg-red-500/10 focus-visible:opacity-100 group-hover:opacity-100"
                                  title="删除项目"
                                >
                                  删除
                                </button>
                              )}
                              {openTab && <span className="shrink-0 text-label text-[var(--gc-accent)]">{openTab.id === activeTabId ? "当前" : "已打开"}</span>}
                            </span>
                            <span className="mt-1 block truncate text-label text-[var(--gc-text-muted)]">
                              {project.readOnly && project.ownerName ? `${project.ownerName} · 只读 · ` : ""}
                              最后编辑 {formatUpdatedAt(project.updatedAt)}
                            </span>
                          </span>
                          {/* 改名中：输入框覆盖信息区（Enter 提交 / Esc 取消 / blur 提交）。 */}
                          {isRenaming && (
                            <input
                              type="text"
                              value={renamingValue}
                              onChange={(event) => setRenamingValue(event.target.value)}
                              onBlur={() => void saveRename(project)}
                              onKeyDown={(event) => {
                                event.stopPropagation();
                                if (event.key === "Enter") void saveRename(project);
                                if (event.key === "Escape") cancelRename();
                              }}
                              autoFocus
                              maxLength={200}
                              aria-label="项目新名称"
                              className="absolute inset-x-3 bottom-3 rounded border border-[var(--gc-accent)] bg-[var(--gc-control)] px-2 py-1 text-xs text-[var(--gc-text)] outline-none"
                            />
                          )}
                        </div>
                      </CardFrame>
                    );
                  })}
                </div>
              )}
              {!projectsLoading && filteredProjects.length === 0 && !initialDraft && (
                <p className="py-10 text-center text-xs text-[var(--gc-text-muted)]">暂无已保存项目，可以从“新建项目”开始。</p>
              )}
            </div>

          </div>

      </DialogContent>
    </Dialog>
  );
}
