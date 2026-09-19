import { useEffect, useRef } from "react";
import { useViewport } from "@xyflow/react";
import { useTheme } from "@/lib/theme";

/**
 * 画布点阵背景 · 波浪呼吸动效
 * accent 圆点沿对角线方向做正弦波呼吸（大小 + 透明度起伏），
 * 跟随画布平移/缩放，视觉上是附着在画布上的。
 */
export function DotWaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewport = useViewport();
  // 用 ref 透传视口，避免平移/缩放时重建动画循环
  const vpRef = useRef(viewport);
  useEffect(() => {
    vpRef.current = viewport;
  }, [viewport]);

  // R-51 P2-1：点阵颜色随主题 accent。canvas 2D 无法引用 CSS 变量，
  // 在主题变化时读取 --gc-accent 计算值缓存为 RGB，绘制循环直接使用；
  // 解析失败时保持三主题默认（current #B7F35A）。
  const theme = useTheme()[0];
  const accentRef = useRef<[number, number, number]>([183, 243, 90]);
  useEffect(() => {
    const cssVar = getComputedStyle(document.documentElement)
      .getPropertyValue("--gc-accent")
      .trim();
    const m = /^#([0-9a-f]{6})$/i.exec(cssVar);
    if (m) {
      const n = Number.parseInt(m[1], 16);
      accentRef.current = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
  }, [theme]);

  // R-51 P3-1：把画布缩放写入 .react-flow 根的 CSS 变量，供节点内焦点环
  // 做宽度补偿（fitView 缩放下 2px 声明环被压到亚像素，补偿后渲染宽度恒定）。
  useEffect(() => {
    const rf = canvasRef.current?.closest<HTMLElement>(".react-flow");
    rf?.style.setProperty("--rf-zoom", String(viewport.zoom || 1));
  }, [viewport.zoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const GAP = 24; // 点间距（与原 Background 一致）
    const SPEED = 2.4; // 波速
    const FREQ = 0.008; // 波的空间频率（径向，中心向外）
    let raf = 0;
    let last = 0;
    const start = performance.now();

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      // 限帧到 ~30fps，足够顺滑且省电
      if (now - last < 33) return;
      last = now;
      if (document.hidden) return;

      const t = (now - start) / 1000;
      const { x: vx, y: vy, zoom } = vpRef.current;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const gap = GAP * zoom * dpr;
      if (gap < 8) return; // 缩得太小就不画，避免糊成一片

      const ox = (((vx * dpr) % gap) + gap) % gap;
      const oy = (((vy * dpr) % gap) + gap) % gap;
      const sizeScale = Math.min(zoom, 1.2) * dpr;
      // 波纹从画布中心向外扩散
      const centerX = w / 2;
      const centerY = h / 2;

      for (let cy = oy; cy < h + gap; cy += gap) {
        for (let cx = ox; cx < w + gap; cx += gap) {
          const dist = Math.hypot(cx - centerX, cy - centerY);
          const s = (Math.sin(t * SPEED - dist * FREQ) + 1) / 2; // 0..1 呼吸相位
          const r = (0.7 + s * 1.0) * sizeScale;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          // R-51 P2-1：点阵颜色 = 当前主题 accent（旧值硬编码旧金 rgba(201,166,107,…)）
          const [ar, ag, ab] = accentRef.current;
          ctx.fillStyle = `rgba(${ar}, ${ag}, ${ab}, ${(0.08 + s * 0.2).toFixed(3)})`;
          ctx.fill();
        }
      }
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
