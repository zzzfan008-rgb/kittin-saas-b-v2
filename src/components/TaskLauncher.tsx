import { useCallback, useEffect, useState } from "react";
import { ImagePlusIcon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { selectActiveProjectIsPristine, useFlowStore } from "@/store/flowStore";
import type { WorkflowTemplate } from "@/types/workflow";
import { launchStarterTemplate } from "@/lib/templateLaunch";

const UPLOAD_TEMPLATE_ID = "builtin-sketch-upscale";
const TEXT_TEMPLATE_ID = "builtin-text-to-image";

export function TaskLauncher() {
  const pristine = useFlowStore(selectActiveProjectIsPristine);
  const [templates, setTemplates] = useState<WorkflowTemplate[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/templates");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const value = await response.json() as unknown;
      if (!Array.isArray(value)) throw new Error("模板数据格式无效");
      setTemplates(value as WorkflowTemplate[]);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pristine && templates === null && !loading && !error) void load();
  }, [error, load, loading, pristine, templates]);

  if (!pristine) return null;
  const uploadTemplate = templates?.find((template) => template.id === UPLOAD_TEMPLATE_ID);
  const textTemplate = templates?.find((template) => template.id === TEXT_TEMPLATE_ID);
  const ready = Boolean(uploadTemplate && textTemplate);

  return (
    <section
      aria-label="开始第一个创作任务"
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center p-8"
    >
      <div className="gc-panel pointer-events-auto w-full max-w-xl rounded-2xl border border-[var(--gc-border)] bg-[var(--gc-panel)]/95 p-6 shadow-2xl shadow-black/40 backdrop-blur-md">
        <div className="text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--gc-accent)]">
            First creation
          </p>
          <h1 className="mt-2 text-lg font-semibold text-[var(--gc-text)]">从一个明确任务开始</h1>
          <p className="mt-1 text-xs leading-relaxed text-[var(--gc-text-muted)]">
            选择入口后会直接进入当前未保存项目，刷新或重新登录仍可继续。
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={!ready}
            onClick={() => uploadTemplate && launchStarterTemplate(uploadTemplate, "upload")}
            className="h-auto min-h-28 flex-col items-start gap-2 whitespace-normal border-[var(--gc-border)] bg-[var(--gc-panel-soft)] p-4 text-left hover:border-[var(--gc-accent)] hover:bg-[var(--gc-panel-hover)]"
          >
            <ImagePlusIcon aria-hidden="true" className="size-5 text-[var(--gc-accent)]" />
            <span className="text-sm font-semibold text-[var(--gc-text)]">上传图片开始</span>
            <span className="text-[10px] font-normal leading-relaxed text-[var(--gc-text-muted)]">
              上传草图或款式图，生成效果图并进入高清处理。
            </span>
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!ready}
            onClick={() => textTemplate && launchStarterTemplate(textTemplate, "text")}
            className="h-auto min-h-28 flex-col items-start gap-2 whitespace-normal border-[var(--gc-border)] bg-[var(--gc-panel-soft)] p-4 text-left hover:border-[var(--gc-accent)] hover:bg-[var(--gc-panel-hover)]"
          >
            <SparklesIcon aria-hidden="true" className="size-5 text-[var(--gc-accent)]" />
            <span className="text-sm font-semibold text-[var(--gc-text)]">文本生成开始</span>
            <span className="text-[10px] font-normal leading-relaxed text-[var(--gc-text-muted)]">
              从服装描述开始，直接生成第一版设计效果图。
            </span>
          </Button>
        </div>

        {loading && <p role="status" className="mt-3 text-center text-[10px] text-[var(--gc-text-muted)]">正在准备内置任务…</p>}
        {error && (
          <div role="alert" className="mt-3 flex items-center justify-center gap-2 text-[10px] text-amber-300">
            <span>任务模板加载失败（{error}）</span>
            <button type="button" onClick={() => void load()} className="text-[var(--gc-accent)] underline underline-offset-2">重试</button>
          </div>
        )}
        {!loading && templates && !ready && !error && (
          <p role="alert" className="mt-3 text-center text-[10px] text-amber-300">
            内置任务模板缺失，请联系管理员重新初始化模板。
          </p>
        )}
      </div>
    </section>
  );
}
