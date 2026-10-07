// 65d v2 多轮修改（裁决 §4.1 方案 A：标记烧进提交图）。
// 提交语义：底图（原图自然尺寸，≤2048 对齐 maskUpload）离屏合成「底图 + 标记」→
// /api/files/edit-draft 上传 → runImageEdit(editInputRef)；server 合成 step 的
// primary = editInputRef ?? outputImages[0]（dag 单点改）。
// 标记坐标一律归一化（0–1 相对原图自然尺寸），显示尺寸变化不影响合成结果。

export type EditMarkTool = "brush" | "arrow" | "rect" | "ellipse" | "text";

export interface EditMarkPoint {
  /** 归一化 x（0–1，相对原图自然宽）。 */
  x: number;
  /** 归一化 y（0–1，相对原图自然高）。 */
  y: number;
}

export interface EditMark {
  tool: EditMarkTool;
  color: string;
  /** 笔画粗细（px，相对原图自然尺寸）。 */
  strokeWidth: number;
  /** brush：轨迹折线；arrow/rect/ellipse：[起点, 终点]；text：[放置点]。 */
  points: EditMarkPoint[];
  /** text 工具的标注内容。 */
  text?: string;
}

/** 单张合成上限（长边）；与 maskUpload 一致，避免巨型原图撑爆 canvas。 */
export const EDIT_COMPOSITE_MAX_EDGE = 2048;

const DEFAULT_MARK_STROKE_WIDTH = 8;

/** 画布 2d 上下文的最小绘制面（drawMarks 为纯函数，单测用 mock ctx 断言调用序列）。 */
export interface MarkDrawContext {
  save(): void;
  restore(): void;
  beginPath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  stroke(): void;
  fill(): void;
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number): void;
  ellipse(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    startAngle: number,
    endAngle: number,
  ): void;
  fillText(text: string, x: number, y: number): void;
  strokeText(text: string, x: number, y: number): void;
  closePath(): void;
  set lineWidth(value: number);
  set strokeStyle(value: string);
  set fillStyle(value: string);
  set font(value: string);
  set lineCap(value: string);
  set lineJoin(value: string);
  set textBaseline(value: string);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function pointToPixel(point: EditMarkPoint, width: number, height: number): { x: number; y: number } {
  return { x: clamp01(point.x) * width, y: clamp01(point.y) * height };
}

/** 把归一化标记按目标画布尺寸画进 ctx（纯函数：只依赖 ctx 绘制面与输入，不碰 DOM）。 */
export function drawMarks(
  ctx: MarkDrawContext,
  marks: readonly EditMark[],
  width: number,
  height: number,
): void {
  for (const mark of marks) {
    const points = mark.points ?? [];
    if (points.length === 0) continue;
    const strokeWidth = Math.max(1, mark.strokeWidth || DEFAULT_MARK_STROKE_WIDTH);
    ctx.save();
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = mark.color;
    ctx.fillStyle = mark.color;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (mark.tool === "brush") {
      const first = pointToPixel(points[0], width, height);
      ctx.beginPath();
      ctx.moveTo(first.x, first.y);
      for (let index = 1; index < points.length; index += 1) {
        const pixel = pointToPixel(points[index], width, height);
        ctx.lineTo(pixel.x, pixel.y);
      }
      if (points.length === 1) {
        // 单点笔迹 = 实心圆点。
        ctx.arc(first.x, first.y, strokeWidth / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.stroke();
      }
      ctx.restore();
      continue;
    }

    if (mark.tool === "text") {
      const anchor = pointToPixel(points[0], width, height);
      const fontSize = Math.max(12, strokeWidth * 3);
      ctx.font = `600 ${fontSize}px system-ui, sans-serif`;
      ctx.textBaseline = "middle";
      const text = mark.text ?? "";
      // 文字描边 + 填充，保证在任意底色上可读。
      ctx.lineWidth = Math.max(1, strokeWidth / 2);
      ctx.strokeText(text, anchor.x, anchor.y);
      ctx.fillText(text, anchor.x, anchor.y);
      ctx.restore();
      continue;
    }

    // arrow / rect / ellipse：两点定义。
    const start = pointToPixel(points[0], width, height);
    const end = pointToPixel(points[1] ?? points[0], width, height);
    ctx.beginPath();
    if (mark.tool === "arrow") {
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const headLength = Math.max(8, strokeWidth * 3);
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
      const centerX = (start.x + end.x) / 2;
      const centerY = (start.y + end.y) / 2;
      const radiusX = Math.abs(end.x - start.x) / 2;
      const radiusY = Math.abs(end.y - start.y) / 2;
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("合成底图加载失败"));
    image.src = source;
  });
}

/** 「底图 + 标记」离屏合成；返回 PNG dataURL（交 /api/files/edit-draft）。 */
export async function compositeEditImage(
  baseSource: string,
  marks: readonly EditMark[],
): Promise<{ dataUrl: string; width: number; height: number }> {
  const image = await loadImage(baseSource);
  const naturalWidth = image.naturalWidth || image.width;
  const naturalHeight = image.naturalHeight || image.height;
  if (!naturalWidth || !naturalHeight) throw new Error("合成底图尺寸无效");

  // 长边 ≤2048 等比缩放（对齐 maskUpload 上限）。
  const scale = Math.min(1, EDIT_COMPOSITE_MAX_EDGE / Math.max(naturalWidth, naturalHeight));
  const width = Math.max(1, Math.round(naturalWidth * scale));
  const height = Math.max(1, Math.round(naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("当前浏览器不支持合成画布");
  ctx.drawImage(image, 0, 0, width, height);
  drawMarks(ctx as unknown as MarkDrawContext, marks, width, height);

  return { dataUrl: canvas.toDataURL("image/png"), width, height };
}
