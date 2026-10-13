/**
 * 卡 #61 TextNode chip 化。
 *
 * - 正文格式改为 {{color:#RRGGBB:名称}} 标记符。
 * - 节点内渲染 ColorChip：色块 + 中文名 + 删除 ×。
 * - 删除 chip 同步移除正文中的对应标记符。
 * - ColorToolPanel onConfirm 改为插入 chip 字符串。
 *
 * UI 两态（与图片节点同构）：
 * - 空态：白卡（NodeFrame frameless=false）+ 卡内虚线 accent 槽位（同图片空槽位）；
 * - 有内容态：frameless，实线 accent 框包裹正文（同图片有图态）。
 * 槽位框始终存在于同一 DOM 位置（空态虚线/有内容态实线），首字输入触发两态切换时
 * textarea 不重挂载，编辑焦点不丢。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { SparklesIcon, LoaderCircleIcon } from "lucide-react";
import { selectActiveReadOnly, selectActiveProjectId, useFlowStore } from "@/store/flowStore";
import type { TextNodeData } from "@/types/workflow";
import { NodeFrame } from "./NodeFrame";
import { NodeToolbar } from "./NodeToolbar";
import { ColorToolPanel } from "./ColorToolPanel";
import { ColorChip, type ColorChipEntry } from "./ColorChip";
import { duplicateNode } from "./nodeDuplicate";
import { useCoalescedTextEdit } from "@/hooks/useCoalescedTextEdit";
import { rewritePromptText } from "@/lib/textRewriteClient";
import { runPromptRewriteFlow } from "@/lib/textRewriteFlow";
import { Button } from "@/components/ui/button";
import {
  parseColorChips,
  removeColorChip,
  COLOR_TOKEN_RE,
} from "@/lib/color/colorToken";
import { getTextPresetTemplate, listTextPresetTemplates } from "@/lib/promptPresets";

/** 正文高度上限：超过后 textarea 内部滚动（文本随内容自然变高，与图片固定比例不同）。 */
const TEXTAREA_MAX_HEIGHT = 320;

/**
 * v9 输入层文本节点（64 Phase 2 §6.1）：
 * 只承载提示词正文，不含任何生成语义字段与运行按钮；提示词由 text 边流向生成节点。
 * 工具条：[色彩工具] [预设下拉] [复制]。预设选中即替换写入 data.text（useCoalescedTextEdit+flush，可 undo）。
 *
 * 正文中的 {{color:#RRGGBB:名称}} 标记在渲染时展开为 ColorChip，
 * 删除时同步从原文中移除对应标记符。
 */
export function TextNode({ id, data, selected }: NodeProps<Node<TextNodeData>>) {
  const readOnly = useFlowStore(selectActiveReadOnly);
  const projectId = useFlowStore(selectActiveProjectId);
  const textEdit = useCoalescedTextEdit(
    { kind: "node-data", nodeId: id, field: "text" },
    { multiline: true },
  );
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [colorToolOpen, setColorToolOpen] = useState(false);
  const [inputActive, setInputActive] = useState(false);
  const [rewriting, setRewriting] = useState(false);
  const [rewriteError, setRewriteError] = useState<string | null>(null);
  const presetOptions = useMemo(() =>
    listTextPresetTemplates().map((p) => ({ value: p.id, label: p.name })),
  []);

  /** 从正文解析所有颜色 chip。 */
  const chips = useMemo(() => parseColorChips(data.text ?? ""), [data.text]);

  /** 阅读视图的渲染段：正文切片 + 内联 chip（chip 位于原 {{color:…}} 标记符的位置）。 */
  const richSegments = useMemo(() => {
    const text = data.text ?? "";
    const segments: Array<
      | { key: string; kind: "text"; text: string }
      | { key: string; kind: "chip"; chip: ColorChipEntry }
    > = [];
    let last = 0;
    chips.forEach((chip, i) => {
      if (chip.index > last) {
        segments.push({ key: `t-${i}`, kind: "text", text: text.slice(last, chip.index) });
      }
      segments.push({ key: `c-${i}`, kind: "chip", chip });
      last = chip.index + chip.length;
    });
    if (last < text.length) segments.push({ key: "t-end", kind: "text", text: text.slice(last) });
    return segments;
  }, [data.text, chips]);

  /** 是否已有正文（决定白卡空态 / frameless 有内容态）。 */
  const hasText = (data.text ?? "").trim().length > 0;

  /** 进入编辑态时聚焦 textarea（阅读视图双击触发）。 */
  useEffect(() => {
    if (inputActive) textareaRef.current?.focus();
  }, [inputActive]);

  /** 高度自适应：内容撑开（上限 TEXTAREA_MAX_HEIGHT 后内部滚动）；空态由 min-height 兜底。
   *  仅编辑态测量（阅读视图高度由内容自然撑开）。 */
  useEffect(() => {
    if (!inputActive) return;
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, TEXTAREA_MAX_HEIGHT)}px`;
  }, [data.text, inputActive]);

  /** 删除一个 chip：移除原文中的标记符，同步 flush。 */
  const handleDeleteChip = useCallback(
    (index: number, length: number) => {
      if (readOnly) return;
      const current = data.text ?? "";
      const next = removeColorChip(current, index, length);
      textEdit.updateValue(next);
      textEdit.flush();
    },
    [data.text, textEdit, readOnly],
  );

  /** 插入颜色 chip：在光标处插入 chip 标记符。 */
  const insertColor = useCallback(
    (chip: string) => {
      if (readOnly) return;
      const textarea = textareaRef.current;
      const current = data.text ?? "";
      const start = textarea?.selectionStart ?? current.length;
      const end = textarea?.selectionEnd ?? current.length;
      const next = `${current.slice(0, start)}${chip}${current.slice(end)}`;
      textEdit.updateValue(next);
      textEdit.flush();
      setColorToolOpen(false);
      // 插入后回到编辑态并聚焦（阅读视图下 textarea 处于隐藏挂载态，需先切回编辑态）。
      setInputActive(true);
      window.setTimeout(() => {
        const element = textareaRef.current;
        if (!element) return;
        element.focus();
        const caret = start + chip.length;
        element.setSelectionRange(caret, caret);
      }, 0);
    },
    [data.text, textEdit, readOnly],
  );

  /** 「✨ 帮我补全」：先保存（草稿否则 404）→ 调用改写 → 写回正文（可 undo）或透出错。
   *  编排逻辑在 textRewriteFlow.ts（纯逻辑可单测），本处只做 store/state 适配。 */
  const handleRewrite = useCallback(async () => {
    if (readOnly || rewriting || !projectId) return;
    // 优先读 textarea 即时值（含未 flush 的键入）；阅读态回退 data.text。
    const current = (textareaRef.current?.value ?? data.text ?? "").trim();
    if (!current) return; // 空正文：按钮已禁用，此为防御性静默返回
    await runPromptRewriteFlow(
      { text: current, projectId, nodeId: id },
      {
        saveProject: () => useFlowStore.getState().saveProject(),
        rewrite: (args) => rewritePromptText(args),
        commit: (text) => {
          textEdit.updateValue(text);
          textEdit.flush();
        },
        setError: setRewriteError,
        setBusy: setRewriting,
      },
    );
  }, [data.text, textEdit, readOnly, rewriting, projectId, id]);

  /** 文本变更即清除上一次改写错误（下次点击也会在 flow 起点 setError(null)）。 */
  useEffect(() => {
    setRewriteError(null);
  }, [data.text]);

  /** 按钮（禁用态）不触发 hover，title 放外层 span 才能在悬停时显示提示。 */
  const rewriteTitle = readOnly
    ? "只读项目不能改写提示词"
    : rewriting
      ? "正在补全…"
      : !hasText
        ? "先写点要求再补全"
        : "AI 补全提示词";

  return (
    <>
      <NodeFrame
        nodeId={id}
        title={data.label}
        status={data.status}
        error={data.error}
        selected={selected}
        frameless={hasText}
        nodeKind="text"
        toolbar={
          <NodeToolbar
            kind="text"
            selected={selected}
            actions={{
              "color-tool": {
                onSelect: () => setColorToolOpen((open) => !open),
                disabled: readOnly,
                disabledReason: "只读项目不能修改正文",
                label: colorToolOpen ? "收起色彩工具" : "色彩工具",
              },
              "preset-picker": {
                presetOptions,
                onPresetSelect: (value) => {
                  if (readOnly) return;
                  const preset = getTextPresetTemplate(value);
                  if (!preset) return;
                  textEdit.updateValue(preset.text);
                  textEdit.flush();
                },
                disabled: readOnly,
                disabledReason: "只读项目不能修改正文",
              },
              copy: {
                onSelect: () => void duplicateNode(id),
                disabled: readOnly,
                disabledReason: "只读项目不能新增节点",
              },
            }}
          />
        }
      >
        {/* 槽位框（两态同一元素）：空态虚线 / 有内容态实线，均 2px accent、圆角 4px（同图片节点）。
            输入激活时加焦点光环（不改动框体本身）。 */}
        <div
          className={`nopan relative rounded-[4px] border-2 bg-[var(--gc-node-inner)] transition-shadow ${
            hasText ? "border-solid" : "border-dashed"
          } border-[var(--gc-accent)] ${
            inputActive ? "shadow-[0_0_0_2px_color-mix(in_srgb,var(--gc-accent)_45%,transparent)]" : ""
          }`}
        >
          {/* 阅读视图（未编辑）：正文 + 内联颜色 chip——chip 渲染在原 {{color:…}} 标记符的位置，
              不再单独展示原始代码；双击进入编辑（编辑态显示原始代码以便修改），失焦回到阅读视图。 */}
          {!inputActive ? (
            <div
              role="textbox"
              aria-readonly="true"
              aria-label="提示词正文（双击或回车进入编辑）"
              tabIndex={0}
              className={`max-h-[320px] w-full cursor-grab overflow-y-auto whitespace-pre-wrap break-words rounded-[2px] px-3 py-2.5 pr-14 text-xs leading-relaxed text-[var(--gc-node-text)] focus-visible:outline-1 focus-visible:outline-[var(--gc-accent-deep)] active:cursor-grabbing ${
                hasText ? "min-h-[44px]" : "min-h-[88px]"
              }`}
              onDoubleClick={() => {
                if (readOnly) return;
                setInputActive(true);
              }}
              onKeyDown={(event) => {
                if (readOnly) return;
                if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  setInputActive(true);
                }
              }}
            >
              {hasText ? (
                richSegments.map((segment) =>
                  segment.kind === "chip" ? (
                    <ColorChip
                      key={segment.key}
                      hex={segment.chip.hex}
                      name={segment.chip.name}
                      index={segment.chip.index}
                      length={segment.chip.length}
                      onDelete={readOnly ? undefined : handleDeleteChip}
                    />
                  ) : (
                    <span key={segment.key}>{segment.text}</span>
                  ),
                )
              ) : (
                <span className="text-[var(--gc-node-muted)]">{"TEXT · 槽位\n双击输入正文"}</span>
              )}
            </div>
          ) : null}

          {/* textarea：编辑态正文（未编辑时保持挂载但隐藏——e2e 计数与预设写入断言依赖它在 DOM 中）
              - 双击阅读视图进入编辑（加 nodrag 防止输入时误拖动）；
              - 失焦：退出编辑态，恢复可拖动的阅读视图。 */}
          <textarea
            ref={textareaRef}
            value={data.text}
            {...textEdit.bind}
            rows={3}
            readOnly={readOnly}
            placeholder={"TEXT · 槽位\n双击输入正文"}
            onMouseDown={(event) => {
              // 未进入编辑态时拦截默认聚焦：单击=选中/拖动节点，双击才聚焦编辑
              if (!inputActive) event.preventDefault();
            }}
            onDoubleClick={() => {
              if (readOnly) return;
              setInputActive(true);
              textareaRef.current?.focus();
            }}
            onFocus={() => setInputActive(true)}
            onBlur={() => setInputActive(false)}
            className={`w-full resize-none overflow-y-auto bg-transparent px-3 py-2.5 pr-14 text-xs leading-relaxed text-[var(--gc-node-text)] placeholder:text-[var(--gc-node-muted)] focus:outline-hidden ${
              hasText ? "min-h-[44px]" : "min-h-[88px]"
            } ${inputActive ? "nodrag cursor-text" : "hidden"}`}
          />

          {/* 「✨ 帮我补全」按钮——槽位右下角，阅读/编辑两态均可见（nodrag 防拖动）。
              空正文/只读禁用；disabled 按钮不触发 hover，故 title 挂外层 span 才能显示
              「先写点要求再补全」等提示；请求中显示 loading。 */}
          <span
            className="nodrag absolute right-1.5 bottom-1.5 inline-flex"
            title={rewriteTitle}
            data-testid="text-rewrite-wrap"
          >
            <Button
              variant="outline"
              size="xs"
              data-testid="text-rewrite-button"
              disabled={readOnly || rewriting || !hasText}
              onClick={handleRewrite}
              className="h-6 gap-0.5 border-[var(--gc-border)] bg-[var(--gc-node-inner)] px-1.5 text-[11px] opacity-90 hover:opacity-100"
            >
              {rewriting ? (
                <LoaderCircleIcon className="size-3 animate-spin" />
              ) : (
                <SparklesIcon className="size-3" />
              )}
              <span>{rewriting ? "补全中" : "帮我补全"}</span>
            </Button>
          </span>
          {/* 改写错误透出行（不再静默吞 404/403/网络等）。截断防超宽，全文在 title。 */}
          {rewriteError ? (
            <span
              className="nodrag pointer-events-none absolute right-1.5 bottom-8 max-w-[170px] truncate text-[10px] leading-tight text-destructive"
              data-testid="text-rewrite-error"
              title={rewriteError}
            >
              {rewriteError}
            </span>
          ) : null}
        </div>
        {colorToolOpen && (
          <ColorToolPanel
            onConfirm={insertColor}
            onClose={() => setColorToolOpen(false)}
          />
        )}
      </NodeFrame>
      <Handle type="source" position={Position.Right} id="prompt" title="提示词" />
    </>
  );
}
