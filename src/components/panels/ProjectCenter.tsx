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
import { thumbnailImageUrl } from "@/lib/images";
import {
  projectTabLifecycle,
  useFlowStore,
  type ProjectTab,
} from "@/store/flowStore";
import type { PersistedWorkflow } from "@/types/workflow";

interface ProjectSummary {
  id: string;
  name: string;
  ownerName?: string;
  readOnly?: boolean;
  updatedAt: string;
}

interface ProjectDetail extends ProjectSummary {
  flow: PersistedWorkflow;
}

const NEW_PROJECT_COVER = "/assets/project-center/new-project-cover.jpg";
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

  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
  const filteredProjects = useMemo(
    () => projects.filter((project) => !normalizedQuery || project.name.toLocaleLowerCase("zh-CN").includes(normalizedQuery)),
    [normalizedQuery, projects],
  );
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
            <label className="relative ml-auto block w-80">
              <SearchIcon aria-hidden="true" className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--gc-text-muted)]" />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 w-full rounded-lg border border-[var(--gc-border)] bg-[var(--gc-control)] pl-9 pr-3 text-xs text-[var(--gc-text)] placeholder:text-[var(--gc-text-muted)] focus:border-[var(--gc-accent)] focus:outline-hidden"
              />
            </label>
            <DialogClose
              type="button"
              aria-label="关闭项目中心"
              className="flex size-8 items-center justify-center rounded-lg text-[var(--gc-text-muted)] hover:bg-[var(--gc-panel-hover)] hover:text-[var(--gc-text)]"
            >
              <XIcon aria-hidden="true" className="size-4" />
            </DialogClose>
          </header>

          {/* 用户 2026-09-25 决策 3：项目中心只留「最近项目」；模板入口迁到左侧工作流二级菜单，
              自建模板能力整体取消（绘制内容与打开过的项目都已自动保存）。 */}
          <div className="min-h-0 flex-1 flex-col gap-0">
            <div className="flex h-12 w-full shrink-0 items-center gap-2.5 border-b border-[var(--gc-border)] px-7">
              <FolderOpenIcon aria-hidden="true" className="size-3.5 text-[var(--gc-text-muted)]" />
              <span className="text-xs text-[var(--gc-accent)]">最近项目</span>
            </div>

            {visibleError && (
              <div role="alert" className="mx-7 mt-5 flex items-center justify-between rounded-lg border border-red-500/30 bg-red-950/20 px-4 py-3 text-body text-red-300">
                <span>加载失败：{visibleError}</span>
                <Button type="button" variant="outline" size="xs" onClick={() => void load()}>重试</Button>
              </div>
            )}

            <div className="min-h-0 overflow-y-auto p-7">
              {projectsLoading ? (
                <ProjectCardSkeletons />
              ) : (
                <div className={PROJECT_CENTER_CARD_GRID_CLASS}>
                  <CardFrame>
                    <button type="button" onClick={createProject} className="block w-full text-left">
                      <div className="relative overflow-hidden">
                        <ProjectCover src={NEW_PROJECT_COVER} fallback={NEW_PROJECT_COVER} alt="新建项目" />
                        <span className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-sm">
                          <PlusIcon aria-hidden="true" className="size-4" />
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
                    return (
                      <CardFrame key={project.id}>
                        <button
                          type="button"
                          onClick={() => void openProject(project)}
                          className="block w-full text-left"
                        >
                          <ProjectCover alt={project.name} />
                          <span className="block p-3">
                            <span className="flex items-center gap-2">
                              <span className={PROJECT_CENTER_TITLE_CLASS}>{project.name}</span>
                              {openTab && <span className="shrink-0 text-label text-[var(--gc-accent)]">{openTab.id === activeTabId ? "当前" : "已打开"}</span>}
                            </span>
                            <span className="mt-1 block truncate text-label text-[var(--gc-text-muted)]">
                              {project.readOnly && project.ownerName ? `${project.ownerName} · 只读 · ` : ""}
                              最后编辑 {formatUpdatedAt(project.updatedAt)}
                            </span>
                          </span>
                        </button>
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
