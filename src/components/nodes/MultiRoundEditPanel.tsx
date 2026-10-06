// 65d v2 多轮修改：专属全屏编辑页（左 stage + 右栏约 1/4 宽，契约 v2 §2.3）。
// 提交语义（裁决 §4.1 方案 A）：底图 + 标记 → 离屏合成 → /api/files/edit-draft →
// runImageEdit(id, prompt, { editInputRef })；标记烧进提交图，server 只见完整合成图。
// 多轮状态客户端自管理：面板内会话记录条（原图/第 1 轮/第 2 轮…），提交成功后
// 新产物成为下一轮底图（outputImages[0] 经 image-node-updated 原位更新）。
// fail-closed（裁决 §4.4 第一层）：节点带 mask 时禁用执行并提示（server 层另有 400/DagError）。
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUpRightIcon,
  BrushIcon,
  CircleIcon,
  EraserIcon,
  Redo2Icon,
  SquareIcon,
  TypeIcon,
  Undo2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { compositeEditImage, type EditMark, type EditMarkTool } from "@/lib/editComposite";
import { uploadEditDraft } from "@/lib/editDraftUpload";
import { MarkLayer } from "@/components/nodes/MarkLayer";
import type { NodeRunStatus } from "@/types/workflow";
import { isNodeRunActive } from "@/types/workflow";
import type { useCoalescedTextEdit } from "@/hooks/useCoalescedTextEdit";

const MARK_COLORS = ["#ff4d4f", "#ffd666", "#4096ff", "#ffffff"] as const;
const MARK_TOOLS: readonly { tool: EditMarkTool; label: string; icon: typeof BrushIcon }[] = [
  { tool: "brush", label: "画笔", icon: BrushIcon },
  { tool: "arrow", label: "箭头", icon: ArrowUpRightIcon },
  { tool: "rect", label: "矩形", icon: SquareIcon },
  { tool: "ellipse", label: "圆形", icon: CircleIcon },
  { tool: "text", label: "文字", icon: TypeIcon },
];

export interface MultiRoundEditPanelProps {
  /** 底图（data.outputImages[0]，实时响应 store：运行完成自动换新图）。 */
  baseSource: string;
  projectId: string;
  nodeId: string;
  readOnly?: boolean;
  /** 节点当前带蒙版（fail-closed：mask 与 editInputRef 互斥，裁决 §4.4）。 */
  hasMask: boolean;
  /** editPrompt 渲染值（coalesced 通道当前值）。 */
  editPrompt: string;
  /** textarea 事件绑定（coalesced 通道，IME/撤销安全）。 */
  promptBind: ReturnType<typeof useCoalescedTextEdit>["bind"];
  /** 提交前刷 pending 值并返回最新 editPrompt（ImageNode 闭包提供，防 200ms debounce 读到旧值）。 */
  readFreshPrompt: () => string;
  /** 节点运行状态（active 时左栏显影中 + 标记层锁定）。 */
  runStatus: NodeRunStatus;
  /** 提交：面板已完成合成+上传，把 editInputRef URL 交给 ImageNode 发合成 run。 */
  onRun: (editInputRef: string) => void;
  onClose: () => void;
}

interface HistoryEntry {
  label: string;
  url: string;
}

export function MultiRoundEditPanel({
  baseSource,
  projectId,
  nodeId,
  readOnly = false,
  hasMask,
  editPrompt,
  promptBind,
  readFreshPrompt,
  runStatus,
  onRun,
  onClose,
}: MultiRoundEditPanelProps) {
  const [marks, setMarks] = useState<EditMark[]>([]);
  const [past, setPast] = useState<EditMark[][]>([]);
  const [future, setFuture] = useState<EditMark[][]>([]);
  const [tool, setTool] = useState<EditMarkTool>("brush");
  const [color, setColor] = useState<string>(MARK_COLORS[0]);
  const [strokeWidth, setStrokeWidth] = useState(8);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    baseSource ? [{ label: "原图", url: baseSource }] : [],
  );
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const running = isNodeRunActive(runStatus);
  const hasPrompt = editPrompt.trim().length > 0;
  const busy = pending || running;

  // 底图变化（image-node-updated 原位替换）→ 记录条追加一轮，标记由 MarkLayer 清空。
  const previousBaseRef = useRef(baseSource);
  const historyRef = useRef(history);
  historyRef.current = history;
  useEffect(() => {
    const previous = previousBaseRef.current;
    if (previous === baseSource) return;
    previousBaseRef.current = baseSource;
    if (!baseSource) return;
    setHistory((current) => {
      if (current[current.length - 1]?.url === baseSource) return current;
      return [...current, { label: `第 ${current.length} 轮`, url: baseSource }];
    });
  }, [baseSource]);

  // 底图自然尺寸（标记粗细换算 + 合成上限内不缩放的确认）。
  useEffect(() => {
    if (!baseSource) {
      setNaturalSize({ width: 0, height: 0 });
      return;
    }
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      setNaturalSize({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.src = baseSource;
    return () => {
      cancelled = true;
    };
  }, [baseSource]);

  // ESC 关闭。
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const marksRef = useRef(marks);
  marksRef.current = marks;

  const commitMarks = useCallback((next: EditMark[]) => {
    setPast((stack) => [...stack.slice(-49), marksRef.current]);
    setFuture([]);
    marksRef.current = next;
    setMarks(next);
  }, []);

  const undo = useCallback(() => {
    setPast((stack) => {
      if (stack.length === 0) return stack;
      const previous = stack[stack.length - 1];
      setFuture((f) => [...f, marksRef.current]);
      marksRef.current = previous;
      setMarks(previous);
      return stack.slice(0, -1);
    });
  }, []);
  const redo = useCallback(() => {
    setFuture((stack) => {
      if (stack.length === 0) return stack;
      const next = stack[stack.length - 1];
      setPast((p) => [...p, marksRef.current]);
      marksRef.current = next;
      setMarks(next);
      return stack.slice(0, -1);
    });
  }, []);
  const clearMarks = useCallback(() => {
    if (marksRef.current.length === 0) return;
    commitMarks([]);
  }, [commitMarks]);

  // 执行链（裁决 §4.1/§4.2）：合成 → 上传 edit-draft → onRun(editInputRef)。
  const handleStartEdit = useCallback(async () => {
    if (busy || readOnly || hasMask || !baseSource) return;
    const freshPrompt = readFreshPrompt().trim();
    if (!freshPrompt) {
      setError("请先填写修改描述");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const composite = await compositeEditImage(baseSource, marksRef.current);
      const draft = await uploadEditDraft({ dataUrl: composite.dataUrl, projectId, nodeId });
      onRun(draft.url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setPending(false);
    }
  }, [busy, readOnly, hasMask, baseSource, readFreshPrompt, projectId, nodeId, onRun]);

  const disabledReason = readOnly
    ? "只读项目内不能修改"
    : hasMask
      ? "图片当前带有蒙版，请先清除蒙版或使用蒙版重绘"
      : !baseSource
        ? "请先上传图片"
        : running
          ? "运行中，请稍候"
          : !hasPrompt
            ? "请先填写修改描述"
            : "";

  // 走 portal 到 body：React Flow 节点带 transform，会把 fixed 定位的 containing
  // block 捕获进节点盒内（面板塌缩进 image 节点）——对齐 MaskEditor 的做法。
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex bg-black/70"
      data-panel="multi-round-edit"
      role="dialog"
      aria-modal="true"
      aria-label="多轮修改"
      data-testid="multi-round-edit-panel"
    >
      {/* 左 stage：底图 + 标记层 + 运行期显影中 */}
      <div className="relative flex min-w-0 flex-1 items-center justify-center overflow-hidden p-6">
        {baseSource ? (
          // 对齐 MaskEditor 已验证布局：容器 inline-flex，img 用 viewport 绝对约束
          //（max-w-full 在收缩型 flex item 内百分比自引用会解析为 0 → 面板图塌缩）。
          <div className="relative inline-flex max-h-full max-w-full shadow-2xl shadow-black">
            <img
              src={baseSource}
              alt="多轮修改底图"
              className="block max-h-[calc(100vh-64px)] max-w-[calc(100vw-360px)] rounded-lg object-contain"
              draggable={false}
            />
            <MarkLayer
              baseSource={baseSource}
              naturalWidth={naturalSize.width}
              naturalHeight={naturalSize.height}
              marks={marks}
              onMarksChange={commitMarks}
              tool={tool}
              color={color}
              strokeWidth={strokeWidth}
              disabled={busy || readOnly}
            />
            {running ? (
              <div
                className="develop-overlay pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-lg"
                data-testid="multi-round-developing"
              >
                <div className="develop-gridlines" aria-hidden="true" />
                <div className="develop-scanline" aria-hidden="true" />
                <div className="develop-float">
                  <div className="develop-sigil" aria-hidden="true">
                    <span>✦</span>
                  </div>
                  <div>显影中…</div>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-[var(--gc-node-text)]">请先上传图片后再使用多轮修改</p>
        )}
      </div>

      {/* 右栏：约 1/4 宽（clamp），纵向滚动 */}
      <aside
        className="flex h-full w-[clamp(256px,25%,360px)] shrink-0 flex-col border-l border-[var(--gc-node-border)] bg-[var(--gc-node-header)]"
        data-testid="multi-round-rail"
      >
        <div className="flex items-center justify-between border-b border-[var(--gc-node-border)] px-4 py-3">
          <h2 className="text-sm font-semibold text-[var(--gc-node-text)]">多轮修改</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="关闭"
            title="关闭（ESC）"
            data-testid="multi-round-close"
            onClick={onClose}
          >
            <span aria-hidden="true">✕</span>
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
          {/* 标记工具 */}
          <section className="flex flex-col gap-2" aria-label="标记工具">
            <div className="flex gap-1">
              {MARK_TOOLS.map(({ tool: markTool, label, icon: Icon }) => (
                <Button
                  key={markTool}
                  type="button"
                  variant={tool === markTool ? "secondary" : "ghost"}
                  size="icon-sm"
                  aria-label={label}
                  title={label}
                  disabled={busy || readOnly}
                  onClick={() => setTool(markTool)}
                >
                  <Icon aria-hidden="true" />
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1" role="group" aria-label="标记颜色">
                {MARK_COLORS.map((swatch) => (
                  <button
                    key={swatch}
                    type="button"
                    aria-label={`颜色 ${swatch}`}
                    aria-pressed={color === swatch}
                    disabled={busy || readOnly}
                    className={`size-5 rounded-full border ${color === swatch ? "border-[var(--gc-node-text)] ring-1 ring-[var(--gc-node-text)]" : "border-[var(--gc-node-border)]"}`}
                    style={{ backgroundColor: swatch }}
                    onClick={() => setColor(swatch)}
                  />
                ))}
              </div>
              <label className="ml-auto flex items-center gap-2 text-xs text-[var(--gc-node-text)]">
                粗细
                <input
                  type="range"
                  min={1}
                  max={32}
                  value={strokeWidth}
                  disabled={busy || readOnly}
                  aria-label="标记粗细"
                  className="w-20"
                  onChange={(event) => setStrokeWidth(Number(event.currentTarget.value))}
                />
                <span className="tabular-nums">{strokeWidth}px</span>
              </label>
            </div>
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="icon-sm" aria-label="撤销标记" title="撤销" disabled={busy || readOnly || past.length === 0} onClick={undo}>
                <Undo2Icon aria-hidden="true" />
              </Button>
              <Button type="button" variant="ghost" size="icon-sm" aria-label="重做标记" title="重做" disabled={busy || readOnly || future.length === 0} onClick={redo}>
                <Redo2Icon aria-hidden="true" />
              </Button>
              <Button type="button" variant="ghost" size="icon-sm" aria-label="清空标记" title="清空" disabled={busy || readOnly || marks.length === 0} onClick={clearMarks}>
                <EraserIcon aria-hidden="true" />
              </Button>
            </div>
          </section>

          {/* 修改描述 · 第 N 轮 */}
          <section className="flex flex-col gap-1.5" aria-label="修改描述">
            <label htmlFor={`multi-round-prompt-${nodeId}`} className="text-xs font-medium text-[var(--gc-node-text)]">
              修改描述 · 第 {Math.max(1, history.length)} 轮
            </label>
            <textarea
              id={`multi-round-prompt-${nodeId}`}
              value={editPrompt}
              maxLength={500}
              rows={4}
              placeholder="描述本轮修改，例如：把背景改成米色…"
              className="rounded-md border border-[var(--gc-node-border)] bg-transparent px-2 py-1.5 text-sm text-[var(--gc-node-text)] outline-none focus:border-[var(--gc-node-text)]"
              {...promptBind}
            />
            <span className="text-right text-xs text-[var(--gc-node-text)] opacity-60">{editPrompt.length} / 500</span>
            {hasMask ? (
              <span className="text-xs text-amber-400">图片当前带有蒙版，请先清除蒙版或使用蒙版重绘</span>
            ) : null}
            {error ? (
              <span className="text-xs text-red-400" role="alert">{error}</span>
            ) : null}
          </section>

          {/* 主按钮 */}
          <Button
            type="button"
            disabled={busy || readOnly || hasMask || !baseSource || !hasPrompt}
            title={disabledReason}
            data-testid="multi-round-start"
            onClick={() => void handleStartEdit()}
          >
            {pending ? "处理中…" : running ? "运行中…" : "开始修改"}
          </Button>
          {!busy && disabledReason ? (
            <p className="text-xs text-[var(--gc-node-text)] opacity-70">{disabledReason}</p>
          ) : null}

          {/* 修改记录条 */}
          <section className="mt-auto flex flex-col gap-2 border-t border-[var(--gc-node-border)] pt-3" aria-label="修改记录">
            <span className="text-xs font-medium text-[var(--gc-node-text)]">修改记录</span>
            <div className="flex flex-wrap gap-2" data-testid="multi-round-history">
              {history.map((entry, index) => (
                <figure
                  key={`${entry.label}-${entry.url}`}
                  className={`relative h-14 w-14 overflow-hidden rounded border ${index === history.length - 1 ? "border-[var(--gc-node-text)]" : "border-[var(--gc-node-border)]"}`}
                  title={entry.label}
                >
                  <img src={entry.url} alt={entry.label} className="size-full object-cover" draggable={false} />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-black/60 text-center text-[9px] text-white">
                    {entry.label}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
