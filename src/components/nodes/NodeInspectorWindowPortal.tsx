import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useReactFlow, type Node } from "@xyflow/react";
import {
  selectActiveDocumentTarget,
  selectActiveNodes,
  selectActiveReadOnly,
  useFlowStore,
} from "@/store/flowStore";
import { useShallow } from "zustand/react/shallow";
import {
  isNodeRunActive,
  nodeTitleForKind,
  type ImageNodeData,
  type NodeKind,
  type WorkflowNodeData,
} from "@/types/workflow";
import {
  GENERATION_IMAGE_MODEL_IDS,
  defaultImageModelOptions,
  imageModelLabel,
  imageModelOptionsWarnings,
  isImageModelId,
  type ImageModelOptions,
} from "@/types/imageModels";
import {
  TEXT_MODEL_IDS,
  isTextModelId,
  textModelLabel,
  textModelOptionsWarnings,
} from "@/types/textModels";
import { VIDEO_MODEL_IDS } from "@/types/videoModels";
import {
  getGarmentPromptVariantById,
  listGarmentPromptVariants,
  type PromptVariant,
} from "@/lib/garmentPromptPresets";
import { effectivePromptSupport } from "@/lib/promptEvaluationRelease";
import { useNodeInspector } from "./NodeInspectorWindow";
import { STATUS_TEXT } from "./NodeFrame";
import { Button } from "@/components/ui/button";

/**
 * R-40 悬浮窗口（功能设置）：单节点聚焦配置面。
 * 打开 = 双击节点体 / Enter / 入口条；Esc 关闭并还原焦点；窗口打开时焦点陷在窗内。
 * InspectorPanel 的属性编辑职责由本窗口取代（P2-c 单批次切换，R-40 §2.5 裁定 A）。
 * 视觉 token：docs/design/2026-09-18-three-node-model/node-inspector-window/tokens.css（--iw-*）。
 */

// ---------- 功能目录 ----------

function variantDisplayName(variant: PromptVariant): string {
  // 展示名 = familyId 的可读化；P2-d 目录重写后由目录携带正式名。
  const names: Record<string, string> = {
    "fashion-lookbook": "写实穿搭",
    "commerce-hero": "电商主图",
    "design-sheet": "服装设定表",
    "mask-local-edit": "局部重绘（蒙版）",
  };
  return names[variant.familyId] ?? variant.familyId;
}

interface CatalogGroup {
  familyId: string;
  name: string;
  variants: PromptVariant[];
}

function useCatalog(nodeKind: NodeKind, search: string): CatalogGroup[] {
  return useMemo(() => {
    const all = listGarmentPromptVariants({ nodeKind });
    const query = search.trim().toLowerCase();
    const matched = query
      ? all.filter((variant) =>
        variant.variantId.toLowerCase().includes(query) ||
        variantDisplayName(variant).toLowerCase().includes(query))
      : all;
    const groups = new Map<string, PromptVariant[]>();
    for (const variant of matched) {
      const list = groups.get(variant.familyId) ?? [];
      list.push(variant);
      groups.set(variant.familyId, list);
    }
    return [...groups.entries()].map(([familyId, variants]) => ({
      familyId,
      name: variantDisplayName(variants[0]),
      variants,
    }));
  }, [nodeKind, search]);
}

// ---------- 窗口主体 ----------

export function NodeInspectorWindowPortal() {
  const anchorNodeId = useNodeInspector((s) => s.anchorNodeId);
  const close = useNodeInspector((s) => s.close);
  const nodes = useFlowStore(selectActiveNodes);
  const readOnly = useFlowStore(selectActiveReadOnly);
  const node = anchorNodeId ? nodes.find((candidate) => candidate.id === anchorNodeId) : undefined;

  // 锚定节点消失（删除/切页）时收起窗口。
  useEffect(() => {
    if (anchorNodeId && !node) close();
  }, [anchorNodeId, node, close]);

  if (!anchorNodeId || !node) return null;
  return <InspectorDialog key={anchorNodeId} node={node} readOnly={readOnly} onClose={close} />;
}

function InspectorDialog({
  node,
  readOnly,
  onClose,
}: {
  node: Node<WorkflowNodeData>;
  readOnly: boolean;
  onClose: () => void;
}) {
  const { getNodesBounds, screenToFlowPosition } = useReactFlow();
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [search, setSearch] = useState("");
  const data = node.data;
  const running = isNodeRunActive(data.status);
  const updateData = useFlowStore((s) => s.updateNodeData);
  const updateDataInTab = useFlowStore((s) => s.updateNodeDataInTab);
  const submitRun = useFlowStore((s) => s.runNode);
  const documentTarget = useFlowStore(useShallow(selectActiveDocumentTarget));
  const catalog = useCatalog(data.kind, search);

  // ---------- 焦点管理（R-40 §2.4）：打开进窗、Tab 循环、Esc 还原 ----------
  useEffect(() => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const first = dialogRef.current?.querySelector<HTMLElement>(
      "input, select, textarea, button:not([data-close])",
    );
    first?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        restoreFocusRef.current?.focus?.();
        return;
      }
      if (event.key !== "Tab") return;
      // 焦点陷阱：Tab 在窗口内循环，不泄漏到画布。
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusables = Array.from(dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      )).filter((element) => element.offsetParent !== null);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [onClose]);

  // ---------- 锚定几何（R-40 §2.2）：节点右侧，右缘不足翻左 ----------
  const containerBounds = useRef<HTMLDivElement | null>(null);
  const [placement, setPlacement] = useState<{ left: number; top: number; flip: boolean } | null>(null);
  useEffect(() => {
    const update = () => {
      const dom = document.querySelector<HTMLElement>(
        `.react-flow__node[data-id="${CSS.escape(node.id)}"]`,
      );
      const canvas = document.querySelector<HTMLElement>(".react-flow");
      if (!dom || !canvas) return;
      const nodeRect = dom.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      const width = 320;
      const gap = 12;
      const rightEdge = nodeRect.right + gap + width;
      const flip = rightEdge > canvasRect.right - 8;
      const left = flip
        ? nodeRect.left - gap - width - canvasRect.left
        : nodeRect.right + gap - canvasRect.left;
      const top = Math.min(
        Math.max(nodeRect.top - canvasRect.top - 8, 8),
        Math.max(canvasRect.height - 200, 8),
      );
      setPlacement({ left, top, flip });
    };
    update();
    const observer = new ResizeObserver(update);
    if (containerBounds.current) observer.observe(containerBounds.current);
    const canvas = document.querySelector<HTMLElement>(".react-flow");
    if (canvas) {
      observer.observe(canvas);
      const dom = document.querySelector<HTMLElement>(`.react-flow__node[data-id="${CSS.escape(node.id)}"]`);
      if (dom) observer.observe(dom);
    }
    return () => observer.disconnect();
  }, [node.id]);

  // ---------- 变体/参数/模型 三段数据 ----------
  const selectedVariant = data.promptVariantId ? getGarmentPromptVariantById(data.promptVariantId) : undefined;
  const selectedSupport = selectedVariant ? effectivePromptSupport(selectedVariant) : undefined;
  const variantRevoked = Boolean(
    selectedSupport &&
    selectedSupport.status !== "verified" &&
    selectedSupport.status !== "recommended" &&
    selectedSupport.status !== "unverified",
  );
  const modelOptions = (data.modelOptions ?? {}) as ImageModelOptions;
  const warnings = useMemo(() => {
    if (data.kind === "text" && isTextModelId(data.modelId)) {
      return textModelOptionsWarnings(data.modelId, modelOptions);
    }
    if (data.kind === "image" && isImageModelId(data.modelId)) {
      return imageModelOptionsWarnings(data.modelId, modelOptions);
    }
    return [];
  }, [data, modelOptions]);

  const applyVariant = (variant: PromptVariant) => {
    const patch: Record<string, unknown> = {
      promptVariantId: variant.variantId,
      promptFamilyId: variant.familyId,
      contractHash: variant.contractHash,
      evaluationVersion: variant.evaluationVersion,
      error: undefined,
    };
    if (data.kind === "image" && isImageModelId(variant.modelId)) {
      patch.modelId = variant.modelId;
      patch.modelOptions = defaultImageModelOptions(variant.modelId, (data as ImageNodeData).aspectRatio);
    } else if (data.kind === "text") {
      patch.modelId = variant.modelId;
    }
    updateData(node.id, patch);
  };

  const statusText = running
    ? STATUS_TEXT[data.status]
    : data.status === "success" ? "运行成功"
    : data.status === "error" ? "运行失败"
    : selectedVariant ? "待运行" : "待配置";

  const acceptOutputText = () => {
    if (data.kind !== "text" || !data.outputText) return;
    updateDataInTab(documentTarget, node.id, { text: data.outputText });
  };

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-label={`${data.label} · 功能设置`}
      data-node-inspector={node.id}
      className="node-inspector-window fixed z-40 flex flex-col"
      style={{
        left: placement ? undefined : "-9999px",
        top: placement ? undefined : 0,
        ...(placement
          ? {
              left: placement.left,
              top: placement.top,
              width: 320,
              maxHeight: "calc(100% - 16px)",
              borderRadius: 14,
              background: "var(--iw-surface, #ffffff)",
              color: "var(--iw-ink, #1d1d1f)",
              boxShadow: "0 0 0 .5px rgba(0,0,0,.06), 0 2px 6px rgba(0,0,0,.06), 0 12px 32px rgba(0,0,0,.14), 0 24px 64px rgba(0,0,0,.10)",
            }
          : {}),
      }}
      // 画布平移/缩放不关闭窗口；点击窗口自身也不冒泡到画布空白关闭逻辑。
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {/* 头部（固定） */}
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-black/8 px-3">
        <span
          aria-hidden="true"
          className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: `var(--gc-status-${data.status === "idle" ? "idle" : data.status === "success" ? "success" : data.status === "error" ? "error" : "running"})` }}
        />
        <span className="truncate text-[13px] font-bold">{data.label}</span>
        <span className="shrink-0 text-[11px]" style={{ color: "var(--iw-ink-muted, #6e6e73)" }}>· {statusText}</span>
        <button
          type="button"
          data-close
          aria-label="关闭功能设置（Esc）"
          onClick={onClose}
          className="ml-auto flex size-6.5 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent text-[13px]"
          style={{ color: "var(--iw-ink-muted, #6e6e73)" }}
        >
          ✕
        </button>
      </div>

      {/* 内容（滚动） */}
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
        {/* 撤销条（R-39/R-40 §3.4） */}
        {variantRevoked && selectedVariant && (
          <div role="alert" className="rounded-[10px] border px-3 py-2.5 text-[11.5px] leading-relaxed" style={{ borderColor: "color-mix(in srgb, var(--gc-status-error) 35%, #fff)", background: "color-mix(in srgb, var(--gc-status-error) 7%, #fff)" }}>
            <b style={{ color: "var(--gc-status-error)" }}>所选功能已被撤销，请重新选择。</b>
            <br />
            当前绑定 <span className="font-mono text-[10.5px]">{selectedVariant.variantId}</span>；节点数据保留不动，运行将被拒绝。
          </div>
        )}

        {/* 功能（系统提示词）目录 */}
        <section aria-label="功能（系统提示词）">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold" style={{ color: "var(--iw-ink-muted, #6e6e73)" }}>
            功能（系统提示词）
            <span className="font-normal">只列已发布</span>
          </div>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索功能…"
            aria-label="搜索功能"
            disabled={readOnly || running}
            className="mb-2 w-full rounded-lg border border-black/8 px-2.5 py-1.5 text-[12px] outline-none focus:border-[var(--gc-accent)]"
            style={{ background: "var(--iw-field-bg, #f5f5f7)", color: "var(--iw-ink, #1d1d1f)" }}
          />
          <div className="max-h-[232px] space-y-1 overflow-y-auto">
            {catalog.length === 0 ? (
              <p className="rounded-[10px] border border-dashed border-black/15 px-3 py-4 text-center text-[11.5px]" style={{ color: "var(--iw-ink-muted, #6e6e73)" }}>
                {search.trim()
                  ? `没有匹配「${search.trim()}」的已发布功能。`
                  : `当前没有可用于${nodeTitleForKind(data.kind)}节点的已发布功能。`}
              </p>
            ) : catalog.map((group) => (
              <div key={group.familyId}>
                <p className="flex h-7 items-center justify-between text-[11px] font-semibold" style={{ color: "var(--iw-ink-muted, #6e6e73)" }}>
                  {group.name}
                  <span className="font-normal">{group.variants.length}</span>
                </p>
                {group.variants.map((variant) => {
                  const support = effectivePromptSupport(variant);
                  const published = support.status === "verified" || support.status === "recommended";
                  const active = selectedVariant?.variantId === variant.variantId;
                  return (
                    <button
                      key={variant.variantId}
                      type="button"
                      disabled={!published || readOnly || running}
                      aria-pressed={active}
                      title={published ? variant.variantId : support.reason}
                      onClick={() => applyVariant(variant)}
                      className="mb-1.5 block w-full rounded-[10px] border border-black/8 bg-white px-3 py-2 text-left transition-colors hover:border-[var(--gc-accent)] disabled:cursor-not-allowed disabled:opacity-50"
                      style={active ? { boxShadow: "0 0 0 1.5px var(--gc-accent)", borderColor: "transparent" } : undefined}
                    >
                      <span className="flex items-center gap-2 text-[12.5px] font-semibold">
                        {variantDisplayName(variant)}
                        <span className="rounded-full bg-black/5 px-2 py-px text-[10px] font-bold" style={{ color: "var(--iw-ink-muted, #6e6e73)" }}>
                          {published ? "已发布" : "未发布"}
                        </span>
                      </span>
                      <span className="mt-0.5 block break-all font-mono text-[10px]" style={{ color: "var(--iw-ink-muted, #6e6e73)" }}>
                        {variant.variantId}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        {/* 技术参数（R5：推荐值 + 自由 key-value，只警告不阻断） */}
        <section aria-label="技术参数">
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold" style={{ color: "var(--iw-ink-muted, #6e6e73)" }}>
            技术参数
            <span
              className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{
                background: warnings.length === 0 && Object.keys(modelOptions).length >= 0
                  ? "color-mix(in srgb, var(--gc-status-success) 14%, #fff)"
                  : "color-mix(in srgb, var(--gc-warn-text) 16%, #fff)",
                color: warnings.length === 0 ? "var(--gc-status-success)" : "var(--gc-warn-text)",
              }}
            >
              {warnings.length === 0 ? "已评估参数" : "自定义参数（未评估）"}
            </span>
          </div>
          {Object.entries(modelOptions).map(([key, value]) => (
            <label key={key} className="mb-1 flex min-h-[34px] items-center gap-2">
              <span className="w-24 shrink-0 font-mono text-[11px]" style={{ color: "var(--iw-ink-muted, #6e6e73)" }}>{key}</span>
              <input
                value={String(value ?? "")}
                aria-label={key}
                disabled={readOnly || running}
                onChange={(event) => {
                  const raw = event.target.value;
                  const numeric = Number(modelOptions[key]);
                  const next = typeof modelOptions[key] === "number" && raw !== "" && Number.isFinite(Number(raw))
                    ? Number(raw)
                    : raw;
                  updateData(node.id, { modelOptions: { ...modelOptions, [key]: next } });
                }}
                className="flex-1 rounded-lg px-2.5 py-1.5 font-mono text-[12.5px] outline-none"
                style={{ background: "var(--iw-field-bg, #f5f5f7)", color: "var(--iw-ink, #1d1d1f)" }}
              />
              <button
                type="button"
                aria-label={`移除参数 ${key}`}
                disabled={readOnly || running}
                onClick={() => {
                  const next = { ...modelOptions };
                  delete next[key];
                  updateData(node.id, { modelOptions: next });
                }}
                className="size-5.5 shrink-0 rounded-md bg-transparent text-[12px]"
                style={{ color: "var(--iw-ink-muted, #6e6e73)" }}
              >
                ✕
              </button>
            </label>
          ))}
          {warnings.map((warning) => (
            <p key={warning} role="status" className="mt-1.5 text-[11px] leading-relaxed" style={{ color: "var(--gc-warn-text)" }}>
              ⚠ {warning}（仍可运行）
            </p>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={readOnly || running}
            onClick={() => updateData(node.id, { modelOptions: { ...modelOptions, "": "" } })}
            className="mt-1.5 w-full text-[11px]"
          >
            + 添加参数
          </Button>
        </section>

        {/* 模型 */}
        <section aria-label="模型">
          <div className="mb-2 text-[11px] font-semibold" style={{ color: "var(--iw-ink-muted, #6e6e73)" }}>模型</div>
          {(data.kind === "image"
            ? GENERATION_IMAGE_MODEL_IDS.map((id) => ({ id, label: imageModelLabel(id), bound: data.modelId === id }))
            : data.kind === "text"
              ? TEXT_MODEL_IDS.map((id) => ({ id, label: textModelLabel(id), bound: data.modelId === id }))
              : VIDEO_MODEL_IDS.map((id) => ({ id, label: id, bound: data.modelId === id }))
          ).map(({ id, label, bound }) => {
            const variantBound = selectedVariant?.modelId === id;
            return (
              <button
                key={id}
                type="button"
                disabled={readOnly || running}
                aria-pressed={bound}
                onClick={() => updateData(node.id, {
                  modelId: id,
                  modelOptions: data.kind === "image" && isImageModelId(id)
                    ? defaultImageModelOptions(id, (data as ImageNodeData).aspectRatio)
                    : {},
                  promptVariantId: undefined,
                  promptFamilyId: undefined,
                  contractHash: undefined,
                  evaluationVersion: undefined,
                  error: undefined,
                })}
                className="mb-1.5 flex w-full items-center gap-2.5 rounded-[10px] border border-black/8 bg-white px-3 py-2 text-left transition-colors hover:border-[var(--gc-accent)] disabled:cursor-not-allowed disabled:opacity-50"
                style={bound ? { boxShadow: "0 0 0 1.5px var(--gc-accent)", borderColor: "transparent" } : undefined}
              >
                <span className="min-w-0">
                  <span className="block font-mono text-[12.5px] font-semibold">{label}</span>
                </span>
                <span
                  className="ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{
                    background: variantBound
                      ? "color-mix(in srgb, var(--gc-status-success) 14%, #fff)"
                      : "color-mix(in srgb, var(--gc-warn-text) 16%, #fff)",
                    color: variantBound ? "var(--gc-status-success)" : "var(--gc-warn-text)",
                  }}
                >
                  {variantBound ? "适用" : "可用 · 非发布绑定"}
                </span>
              </button>
            );
          })}
        </section>

        {/* text 节点：outputText 采纳区（R-40 §3.5 / Q1=B） */}
        {data.kind === "text" && data.outputText !== undefined && (
          <section aria-label="运行结果（outputText）">
            <div className="mb-2 text-[11px] font-semibold" style={{ color: "var(--iw-ink-muted, #6e6e73)" }}>
              运行结果（outputText）<span className="font-normal">建议，未落笔</span>
            </div>
            <p className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-[10px] px-3 py-2.5 text-[12.5px] leading-relaxed" style={{ background: "var(--iw-field-bg, #f5f5f7)", color: "var(--iw-ink, #1d1d1f)" }}>
              {data.outputText || "（空）"}
            </p>
            <div className="mt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!data.outputText}
                onClick={() => void navigator.clipboard?.writeText(data.outputText ?? "")}
                className="flex-1"
              >
                复制
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!data.outputText || readOnly}
                onClick={acceptOutputText}
                className="flex-2"
              >
                采纳进正文
              </Button>
            </div>
            <p className="mt-1.5 text-[10.5px] leading-relaxed" style={{ color: "var(--iw-ink-muted, #6e6e73)" }}>
              采纳是把结果复制进正文的显式动作；AI 只能提案，落笔由人。未采纳前，下游节点读取的仍是原正文。
            </p>
          </section>
        )}
      </div>

      {/* 运行区（固定） */}
      <div className="shrink-0 border-t border-black/8 p-3.5">
        <button
          type="button"
          disabled={running || readOnly || !selectedVariant || variantRevoked}
          title={!selectedVariant ? "先选择功能" : variantRevoked ? "所选功能已被撤销，请重新选择" : undefined}
          onClick={() => void submitRun(node.id)}
          className="h-9 w-full rounded-full text-[13px] font-bold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: "var(--gc-accent)", color: "var(--gc-accent-cta-ink)" }}
        >
          {running ? STATUS_TEXT[data.status] : data.status === "success" ? "重新运行" : data.status === "error" ? "重试" : "运 行"}
        </button>
        <p aria-live="polite" className="mt-1.5 text-[11px]" style={{ color: "var(--iw-ink-muted, #6e6e73)" }}>
          {!selectedVariant
            ? "请先选择功能"
            : variantRevoked
              ? "无法运行：所选功能已被撤销，请重新选择。"
              : warnings.length > 0
                ? `${warnings.length} 条参数提示（不阻断）`
                : `已选「${variantDisplayName(selectedVariant)}」`}
        </p>
      </div>
    </div>,
    document.body,
  );
}
