// 65d v2 多轮修改：图上标记层（画笔/箭头/矩形/圆形/文字）。
// 坐标归一化（0–1 相对原图自然尺寸）：显示尺寸变化（缩放/响应式）只影响渲染换算，
// 不影响 editComposite 合成结果。绘制结果进 EditMark[]，由面板提交时烧进合成图。
import { useCallback, useEffect, useRef, useState } from "react";
import type { EditMark, EditMarkPoint, EditMarkTool } from "@/lib/editComposite";

export interface MarkLayerProps {
  /** 底图 URL（仅作层内参照；渲染交给面板的 img）。 */
  baseSource: string;
  /** 原图自然尺寸（渲染换算笔画粗细；0–1 坐标不依赖它，但粗细 px 相对原图）。 */
  naturalWidth: number;
  naturalHeight: number;
  marks: readonly EditMark[];
  onMarksChange: (marks: EditMark[]) => void;
  tool: EditMarkTool;
  color: string;
  /** 笔画粗细（px，相对原图自然尺寸）。 */
  strokeWidth: number;
  disabled?: boolean;
}

interface DrawState {
  tool: EditMarkTool;
  color: string;
  strokeWidth: number;
  /** 绘制中的实时轨迹（归一化坐标）。 */
  active: EditMarkPoint[];
  /** 两点工具的起点。 */
  anchor?: EditMarkPoint;
}

function eventToNormalized(
  event: React.PointerEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement,
): EditMarkPoint {
  const rect = canvas.getBoundingClientRect();
  const x = rect.width > 0 ? (event.clientX - rect.left) / rect.width : 0;
  const y = rect.height > 0 ? (event.clientY - rect.top) / rect.height : 0;
  return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };
}

export function MarkLayer({
  baseSource,
  naturalWidth,
  naturalHeight,
  marks,
  onMarksChange,
  tool,
  color,
  strokeWidth,
  disabled = false,
}: MarkLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawState, setDrawState] = useState<DrawState | null>(null);
  const [textInput, setTextInput] = useState<{ point: EditMarkPoint; value: string } | null>(null);

  // 渲染：已提交标记 + 绘制中预览。尺寸变化（面板缩放）时重绘。
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    const drawOne = (mark: EditMark) => {
      const points = mark.points ?? [];
      if (points.length === 0) return;
      ctx.save();
      ctx.strokeStyle = mark.color;
      ctx.fillStyle = mark.color;
      ctx.lineWidth = Math.max(1, mark.strokeWidth || 8);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const pixel = (point: EditMarkPoint) => ({
        x: point.x * width,
        y: point.y * height,
      });
      if (mark.tool === "brush") {
        const first = pixel(points[0]);
        ctx.beginPath();
        ctx.moveTo(first.x, first.y);
        for (let index = 1; index < points.length; index += 1) {
          const p = pixel(points[index]);
          ctx.lineTo(p.x, p.y);
        }
        if (points.length === 1) {
          ctx.arc(first.x, first.y, ctx.lineWidth / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.stroke();
        }
      } else if (mark.tool === "text") {
        const anchorPoint = pixel(points[0]);
        ctx.font = `600 ${Math.max(12, ctx.lineWidth * 3)}px system-ui, sans-serif`;
        ctx.textBaseline = "middle";
        const text = mark.text ?? "";
        ctx.lineWidth = Math.max(1, (mark.strokeWidth || 8) / 2);
        ctx.strokeText(text, anchorPoint.x, anchorPoint.y);
        ctx.fillText(text, anchorPoint.x, anchorPoint.y);
      } else {
        const start = pixel(points[0]);
        const end = pixel(points[1] ?? points[0]);
        ctx.beginPath();
        if (mark.tool === "arrow") {
          const angle = Math.atan2(end.y - start.y, end.x - start.x);
          const headLength = Math.max(8, ctx.lineWidth * 3);
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(end.x, end.y);
          ctx.lineTo(end.x - headLength * Math.cos(angle - Math.PI / 6), end.y - headLength * Math.sin(angle - Math.PI / 6));
          ctx.lineTo(end.x - headLength * Math.cos(angle + Math.PI / 6), end.y - headLength * Math.sin(angle + Math.PI / 6));
          ctx.closePath();
          ctx.fill();
        } else if (mark.tool === "rect") {
          const x = Math.min(start.x, end.x);
          const y = Math.min(start.y, end.y);
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.abs(end.x - start.x), y);
          ctx.lineTo(x + Math.abs(end.x - start.x), y + Math.abs(end.y - start.y));
          ctx.lineTo(x, y + Math.abs(end.y - start.y));
          ctx.closePath();
          ctx.stroke();
        } else {
          ctx.ellipse(
            (start.x + end.x) / 2,
            (start.y + end.y) / 2,
            Math.abs(end.x - start.x) / 2,
            Math.abs(end.y - start.y) / 2,
            0,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
        }
      }
      ctx.restore();
    };

    for (const mark of marks) drawOne(mark);
    if (drawState) {
      if (drawState.tool === "brush" && drawState.active.length > 0) {
        drawOne({
          tool: "brush",
          color: drawState.color,
          strokeWidth: drawState.strokeWidth,
          points: drawState.active,
        });
      } else if (
        (drawState.tool === "arrow" || drawState.tool === "rect" || drawState.tool === "ellipse") &&
        drawState.anchor &&
        drawState.active.length > 0
      ) {
        drawOne({
          tool: drawState.tool,
          color: drawState.color,
          strokeWidth: drawState.strokeWidth,
          points: [drawState.anchor, drawState.active[drawState.active.length - 1]],
        });
      }
    }
  }, [marks, drawState]);

  useEffect(() => {
    render();
  }, [render, naturalWidth, naturalHeight]);

  // 底图变化（运行完成换新图）→ 清空标记（面板的会话历史条另行记录）。
  // 最新 marks/onMarksChange 存入 ref：effect 只依赖触发值 baseSource（门禁
  // no-error-suppression：不得用抑制注释绕过依赖检查）。
  const previousBaseRef = useRef(baseSource);
  const marksRef = useRef(marks);
  marksRef.current = marks;
  const onMarksChangeRef = useRef(onMarksChange);
  onMarksChangeRef.current = onMarksChange;
  useEffect(() => {
    if (previousBaseRef.current !== baseSource) {
      previousBaseRef.current = baseSource;
      if (marksRef.current.length > 0) onMarksChangeRef.current([]);
      setDrawState(null);
      setTextInput(null);
    }
  }, [baseSource]);

  const commitMark = useCallback(
    (mark: EditMark) => {
      onMarksChange([...marks, mark]);
    },
    [marks, onMarksChange],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (disabled || event.button !== 0) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.setPointerCapture(event.pointerId);
      const point = eventToNormalized(event, canvas);
      if (tool === "text") {
        setTextInput({ point, value: "" });
        return;
      }
      setDrawState({
        tool,
        color,
        strokeWidth,
        active: tool === "brush" ? [point] : [point],
        anchor: point,
      });
    },
    [disabled, tool, color, strokeWidth],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawState) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const point = eventToNormalized(event, canvas);
      setDrawState((previous) => {
        if (!previous) return previous;
        if (previous.tool === "brush") {
          return { ...previous, active: [...previous.active, point] };
        }
        return { ...previous, active: [point] };
      });
    },
    [drawState],
  );

  const handlePointerUp = useCallback(() => {
    if (!drawState) return;
    const { tool: activeTool, color: activeColor, strokeWidth: activeStrokeWidth, active, anchor } = drawState;
    setDrawState(null);
    if (activeTool === "brush") {
      if (active.length === 0) return;
      commitMark({ tool: "brush", color: activeColor, strokeWidth: activeStrokeWidth, points: active });
      return;
    }
    if (!anchor || active.length === 0) return;
    const end = active[active.length - 1];
    // 两点工具：位移过小视为误触，不提交。
    if (Math.abs(end.x - anchor.x) < 0.005 && Math.abs(end.y - anchor.y) < 0.005) return;
    commitMark({ tool: activeTool, color: activeColor, strokeWidth: activeStrokeWidth, points: [anchor, end] });
  }, [drawState, commitMark]);

  const commitText = useCallback(() => {
    if (!textInput) return;
    const text = textInput.value.trim();
    if (text) {
      commitMark({ tool: "text", color, strokeWidth, points: [textInput.point], text });
    }
    setTextInput(null);
  }, [textInput, color, strokeWidth, commitMark]);

  return (
    <div className="absolute inset-0" data-mark-layer>
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full ${disabled ? "pointer-events-none opacity-60" : "cursor-crosshair"}`}
        width={1200}
        height={1500}
        data-testid="mark-layer-canvas"
        aria-label="标记画布"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
      {textInput ? (
        <input
          autoFocus
          value={textInput.value}
          onChange={(event) => setTextInput({ ...textInput, value: event.target.value })}
          onBlur={commitText}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitText();
            } else if (event.key === "Escape") {
              event.preventDefault();
              setTextInput(null);
            }
          }}
          placeholder="输入标注文字，回车确认"
          className="absolute z-10 min-w-[10rem] rounded border border-[var(--gc-node-border)] bg-[var(--gc-node-header)] px-2 py-1 text-xs text-[var(--gc-node-text)] outline-none"
          style={{
            left: `${Math.min(80, textInput.point.x * 100)}%`,
            top: `${Math.min(90, textInput.point.y * 100)}%`,
          }}
          aria-label="标注文字输入"
        />
      ) : null}
    </div>
  );
}
