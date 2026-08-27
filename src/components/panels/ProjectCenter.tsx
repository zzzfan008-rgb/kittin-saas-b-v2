import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";
import {
  FolderOpenIcon,
  LayoutTemplateIcon,
  LoaderCircleIcon,
  PlusIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { thumbnailImageUrl } from "@/lib/images";
import { launchTemplateInNewTab } from "@/lib/templateLaunch";
import {
  projectTabLifecycle,
  useFlowStore,
  type ProjectTab,
} from "@/store/flowStore";
import type { PersistedWorkflow, WorkflowTemplate } from "@/types/workflow";

type ProjectCenterTab = "recent" | "templates";

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
    <div className="group overflow-hidden rounded-xl border border-[var(--gc-border)] bg-[var(--gc-panel-soft)] transition-colors hover:border-[var(--gc-accent)]">
      {children}
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
  const [activeSection, setActiveSection] = useState<ProjectCenterTab>("recent");
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadVersion = useRef(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const tabs = useFlowStore((state) => state.tabs);
  const activeTabId = useFlowStore((state) => state.activeTabId);
  const createBlankTab = useFlowStore((state) => state.createBlankTab);
  const initialDraft = tabs.find((tab) => projectTabLifecycle(tab) === "initial_draft");

  const load = useCallback(async () => {
    const version = ++loadVersion.current;
    setLoading(true);
    setError(null);
    try {
      const [projectsResponse, templatesResponse] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/templates"),
      ]);
      if (!projectsResponse.ok) throw new Error(`项目 HTTP ${projectsResponse.status}`);
      if (!templatesResponse.ok) throw new Error(`模板 HTTP ${templatesResponse.status}`);
      const summaries = await projectsResponse.json() as ProjectSummary[];
      const loadedTemplates = await templatesResponse.json() as WorkflowTemplate[];
      if (version !== loadVersion.current) return;
      setProjects(summaries);
      setTemplates(loadedTemplates);
    } catch (loadError) {
      if (version === loadVersion.current) {
        setError(loadError instanceof Error ? loadError.message : String(loadError));
      }
    } finally {
      if (version === loadVersion.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      loadVersion.current += 1;
      setQuery("");
      return;
    }
    void load();
  }, [load, open]);

  const openProject = useCallback(async (project: ProjectSummary) => {
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
      if (!Array.isArray(detail.flow?.nodes) || !Array.isArray(detail.flow?.edges)) {
        throw new Error("项目数据损坏或不兼容");
      }
      useFlowStore.getState().openFlowTab({
        projectId: detail.id,
        projectName: detail.name,
        nodes: detail.flow.nodes as never,
        edges: detail.flow.edges as never,
        readOnly: detail.readOnly ?? false,
      });
      onOpenChange(false);
    } catch (openError) {
      setError(openError instanceof Error ? openError.message : String(openError));
    }
  }, [onOpenChange]);

  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
  const filteredProjects = useMemo(
    () => projects.filter((project) => !normalizedQuery || project.name.toLocaleLowerCase("zh-CN").includes(normalizedQuery)),
    [normalizedQuery, projects],
  );
  const filteredTemplates = useMemo(
    () => templates.filter((template) => {
      if (!template.builtIn) return false;
      if (!normalizedQuery) return true;
      return `${template.name} ${template.description}`.toLocaleLowerCase("zh-CN").includes(normalizedQuery);
    }),
    [normalizedQuery, templates],
  );

  const createProject = () => {
    createBlankTab();
    onOpenChange(false);
  };

  const continueDraft = (draft: ProjectTab) => {
    useFlowStore.getState().switchTab(draft.id);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm" />
        <Dialog.Popup
          initialFocus={searchRef}
          className="gc-panel fixed left-1/2 top-1/2 z-[61] flex h-[min(760px,calc(100vh-5rem))] w-[min(1180px,calc(100vw-5rem))] min-w-[944px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-[var(--gc-border)] bg-[var(--gc-panel)] shadow-2xl shadow-black/70 outline-hidden"
        >
          <header className="flex items-center gap-6 border-b border-[var(--gc-border)] px-7 py-5">
            <div className="min-w-48">
              <Dialog.Title className="text-base font-semibold text-[var(--gc-text)]">项目中心</Dialog.Title>
              <Dialog.Description className="mt-1 text-[10px] text-[var(--gc-text-muted)]">
                新建、继续或从模板开始
              </Dialog.Description>
            </div>
            <label className="relative ml-auto block w-80">
              <SearchIcon aria-hidden="true" className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--gc-text-muted)]" />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={activeSection === "recent" ? "搜索最近项目" : "搜索内置模板"}
                className="h-9 w-full rounded-lg border border-[var(--gc-border)] bg-[var(--gc-control)] pl-9 pr-3 text-xs text-[var(--gc-text)] placeholder:text-[var(--gc-text-muted)] focus:border-[var(--gc-accent)] focus:outline-hidden"
              />
            </label>
            <Dialog.Close
              type="button"
              aria-label="关闭项目中心"
              className="flex size-8 items-center justify-center rounded-lg text-[var(--gc-text-muted)] hover:bg-[var(--gc-panel-hover)] hover:text-[var(--gc-text)]"
            >
              <XIcon aria-hidden="true" className="size-4" />
            </Dialog.Close>
          </header>

          <div className="flex h-12 shrink-0 items-end gap-7 border-b border-[var(--gc-border)] px-7">
            <button
              type="button"
              onClick={() => {
                setActiveSection("recent");
                setQuery("");
              }}
              className={`relative flex h-12 items-center gap-2 text-xs font-medium ${
                activeSection === "recent" ? "text-[var(--gc-accent)]" : "text-[var(--gc-text-muted)] hover:text-[var(--gc-text)]"
              }`}
            >
              <FolderOpenIcon aria-hidden="true" className="size-3.5" />
              最近项目
              {activeSection === "recent" && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--gc-accent)]" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSection("templates");
                setQuery("");
              }}
              className={`relative flex h-12 items-center gap-2 text-xs font-medium ${
                activeSection === "templates" ? "text-[var(--gc-accent)]" : "text-[var(--gc-text-muted)] hover:text-[var(--gc-text)]"
              }`}
            >
              <LayoutTemplateIcon aria-hidden="true" className="size-3.5" />
              内置模板
              {activeSection === "templates" && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--gc-accent)]" />}
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-7">
            {error && (
              <div role="alert" className="mb-4 flex items-center justify-between rounded-lg border border-red-500/30 bg-red-950/20 px-4 py-3 text-[10px] text-red-300">
                <span>加载失败：{error}</span>
                <Button type="button" variant="outline" size="xs" onClick={() => void load()}>重试</Button>
              </div>
            )}

            {activeSection === "recent" ? (
              <div className="grid grid-cols-4 gap-4">
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
                      <span className="mt-1 block text-[10px] text-[var(--gc-text-muted)]">从空白服装画布开始</span>
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
                          <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[var(--gc-text)]">继续草稿</span>
                          <span className="rounded border border-[var(--gc-accent)]/40 px-1.5 py-0.5 text-[8px] text-[var(--gc-accent)]">自动保存</span>
                        </span>
                        <span className="mt-1 block truncate text-[10px] text-[var(--gc-text-muted)]">{initialDraft.projectName}</span>
                      </span>
                    </button>
                  </CardFrame>
                )}

                {filteredProjects.map((project) => {
                  const openTab = tabs.find((tab) => tab.projectId === project.id);
                  return (
                    <CardFrame key={project.id}>
                      <button type="button" onClick={() => void openProject(project)} className="block w-full text-left">
                        <ProjectCover alt={project.name} />
                        <span className="block p-3">
                          <span className="flex items-center gap-2">
                            <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[var(--gc-text)]">{project.name}</span>
                            {openTab && <span className="shrink-0 text-[8px] text-[var(--gc-accent)]">{openTab.id === activeTabId ? "当前" : "已打开"}</span>}
                          </span>
                          <span className="mt-1 block truncate text-[10px] text-[var(--gc-text-muted)]">
                            {project.readOnly && project.ownerName ? `${project.ownerName} · 只读 · ` : ""}
                            最后编辑 {formatUpdatedAt(project.updatedAt)}
                          </span>
                        </span>
                      </button>
                    </CardFrame>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {filteredTemplates.map((template) => {
                  const image = template.thumbnail ?? flowPreviewImage(template.flow);
                  return (
                    <CardFrame key={template.id}>
                      <button
                        type="button"
                        onClick={() => {
                          launchTemplateInNewTab(template);
                          onOpenChange(false);
                        }}
                        className="block w-full text-left"
                      >
                        <ProjectCover src={image} alt={template.name} />
                        <span className="block p-3">
                          <span className="flex items-center gap-2">
                            <span className="min-w-0 flex-1 truncate text-xs font-semibold text-[var(--gc-text)]">{template.name}</span>
                            <span className="shrink-0 rounded border border-[var(--gc-accent)]/40 px-1.5 py-0.5 text-[8px] text-[var(--gc-accent)]">
                              {template.builtIn ? "内置" : "我的"}
                            </span>
                          </span>
                          <span className="mt-1 line-clamp-2 min-h-8 text-[10px] leading-4 text-[var(--gc-text-muted)]">
                            {template.description || "从此工作流模板创建一个新项目"}
                          </span>
                        </span>
                      </button>
                    </CardFrame>
                  );
                })}
              </div>
            )}

            {loading && (
              <div className="flex min-h-48 items-center justify-center gap-2 text-xs text-[var(--gc-text-muted)]">
                <LoaderCircleIcon aria-hidden="true" className="size-4 animate-spin" />
                正在加载项目内容…
              </div>
            )}
            {!loading && activeSection === "recent" && filteredProjects.length === 0 && !initialDraft && (
              <p className="py-10 text-center text-xs text-[var(--gc-text-muted)]">暂无已保存项目，可以从“新建项目”开始。</p>
            )}
            {!loading && activeSection === "templates" && filteredTemplates.length === 0 && (
              <p className="py-10 text-center text-xs text-[var(--gc-text-muted)]">没有符合条件的模板。</p>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
