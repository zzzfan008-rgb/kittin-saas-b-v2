/**
 * 图片缩放 hook：抽象滚轮 / 双击 / ±按钮 / 拖拽平移逻辑。
 * 缩放语义：回到 main 的中心缩放——滚轮和按钮都清零 pan，
 * transformOrigin="center center" 保证图片中心为缩放基点。
 */
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

export const MIN_SCALE = 0.25;
export const MAX_SCALE = 4;
export const ZOOM_STEP = 0.1;

export interface UseImageZoomOptions {
  /** 打开新图片时触发，计算适合画布初始值（默认 true） */
  resetOnNewImage?: boolean;
  /**
   * 传入 container ref，hook 自动注册/注销 wheel 监听器。
   * 不传则调用方自行把 handleWheel 绑定到目标元素的 onWheel。
   */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** containerRef 变化时重新注册 wheel（切图重绑用） */
  wheelKey?: unknown;
}

export function useImageZoom(options: UseImageZoomOptions = {}) {
  const {
    resetOnNewImage = true,
    containerRef,
    wheelKey,
  } = options;

  const [scale, setScale] = useState(1);
  const [isFit, setIsFit] = useState(true);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const prevImageKeyRef = useRef<string | null>(null);

  // ── 适合画布：重算 scale，清零 panOffset ──────────────────────────────────
  const computeFitScale = useCallback((
    containerEl: HTMLElement,
    imgEl: HTMLImageElement,
  ): number => {
    const rect = containerEl.getBoundingClientRect();
    const availW = rect.width - 32;
    const availH = rect.height - 32;
    if (availW <= 0 || availH <= 0) return 1;
    const scaleX = availW / (imgEl.naturalWidth || 1);
    const scaleY = availH / (imgEl.naturalHeight || 1);
    return Math.min(
      Math.max(Math.min(scaleX, scaleY, 1), MIN_SCALE),
      MAX_SCALE,
    );
  }, []);

  const fitImage = useCallback((
    containerEl: HTMLElement,
    imgEl: HTMLImageElement,
  ) => {
    const fitScale = computeFitScale(containerEl, imgEl);
    setScale(fitScale);
    setIsFit(true);
    setPanOffset({ x: 0, y: 0 });
  }, [computeFitScale]);

  // 打开新图时复位
  const fitOnNewImage = useCallback((
    imageKey: string,
    containerEl: HTMLElement,
    imgEl: HTMLImageElement,
  ) => {
    if (prevImageKeyRef.current !== imageKey) {
      prevImageKeyRef.current = imageKey;
      if (resetOnNewImage) {
        const fitScale = computeFitScale(containerEl, imgEl);
        setScale(fitScale);
        setIsFit(true);
        setPanOffset({ x: 0, y: 0 });
      }
    }
  }, [computeFitScale, resetOnNewImage]);

  // ── 滚轮缩放（中心语义）：清 pan，transformOrigin="center center" ───────
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    setScale((prev) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + delta * prev)));
    setIsFit(false);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  // ── 双击切换适合画布 ↔ 100% ─────────────────────────────────────────────
  const handleDoubleClick = useCallback((
    e: React.MouseEvent,
    containerEl: HTMLElement,
    imgEl: HTMLImageElement,
  ) => {
    e.stopPropagation();
    if (isFit) {
      setScale(1);
      setIsFit(false);
      setPanOffset({ x: 0, y: 0 });
    } else {
      const fitScale = computeFitScale(containerEl, imgEl);
      setScale(fitScale);
      setIsFit(true);
      setPanOffset({ x: 0, y: 0 });
    }
  }, [isFit, computeFitScale]);

  // ── 拖拽平移（> 适合画布时激活）────────────────────────────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isFit) return;
    e.stopPropagation();
    isPanningRef.current = true;
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: panOffset.x,
      panY: panOffset.y,
    };
  }, [isFit, panOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanningRef.current) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    setPanOffset({
      x: panStartRef.current.panX + dx,
      y: panStartRef.current.panY + dy,
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false;
  }, []);

  // ── ± 按钮 ──────────────────────────────────────────────────────────────
  // zoomIn: 放大，清 pan
  const zoomIn = useCallback(() => {
    setScale((prev) => {
      const next = Math.min(MAX_SCALE, prev + ZOOM_STEP);
      if (next === prev) return prev;
      setIsFit(false);
      setPanOffset({ x: 0, y: 0 });
      return next;
    });
  }, []);

  // zoomOut: 缩小，不清 pan（照 main）
  const zoomOut = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(MIN_SCALE, prev - ZOOM_STEP);
      if (next === prev) return prev;
      setIsFit(false);
      return next;
    });
  }, []);

  // ── cursor ───────────────────────────────────────────────────────────────
  const cursor = isFit
    ? "default"
    : isPanningRef.current ? "grabbing" : "grab";

  // ── 自动注册 wheel 到 containerRef ──────────────────────────────────────
  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;
    const wrapped = (e: WheelEvent) => handleWheel(e);
    el.addEventListener("wheel", wrapped, { passive: false });
    return () => el.removeEventListener("wheel", wrapped);
  }, [containerRef, wheelKey, handleWheel]);

  // ── resetScale（ImageViewer 新图时调用）──────────────────────────────────
  const resetScale = useCallback((v = 1) => {
    setScale(v);
    setIsFit(v === 1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  return {
    scale,
    panOffset,
    isFit,
    isPanningRef,
    cursor,
    hudLabel: isFit ? "适合画布" : `${Math.round(scale * 100)}%`,
    // 事件处理器
    handleWheel,
    handleDoubleClick,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    // 缩放控制
    zoomIn,
    zoomOut,
    fitImage,
    fitOnNewImage,
    computeFitScale,
    resetScale,
  };
}
