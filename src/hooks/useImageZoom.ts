/**
 * 图片缩放 hook：抽象滚轮 / 双击 / ±按钮 / 拖拽平移逻辑，
 * 供 MaskEditor（场景A）和 ImageViewer（场景B）共用。
 *
 * 核心坐标映射契约（plan.md §D）：
 *   rect = canvasElement.getBoundingClientRect() —— 已含 CSS transform（translate+scale）
 *   screenToImage(screenX, screenY, rect)
 *     = (screenX - rect.left) / scale              ← 原图像素坐标
 *   imageToScreen(imageX, imageY, rect)
 *     = imageX * scale + rect.left                 ← 变换后屏幕坐标
 *
 * 注意：getBoundingClientRect() 返回的是 transform 后的屏幕包围盒，
 * rect.left 已经包含 translate(pan) + scale * origin 偏移。
 * 因此公式中不再出现 panOffset 项（rect 自动吸收了它的效果）。
 * 这要求调用方传入的 rect 必须是经过 transform 的 DOM 元素。
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
   * 可选：传入 container ref，hook 自动注册/注销 wheel 监听器。
   * 不传则调用方自行把 handleWheel 绑定到目标元素的 onWheel。
   */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** containerRef 变化时重新注册 wheel（依赖项） */
  wheelKey?: unknown;
  /**
   * 可选：传入需要读 getBoundingClientRect() 的元素 ref。
   * 内部 wheel handler 优先读此 ref，fallback 为 containerRef。
   * MaskEditor 传 stageRef（transform box 在 stage 上），
   * ImageViewer 传 img ref（transform box 在 img 上）。
   */
  wheelRectRef?: React.RefObject<HTMLElement | null>;
}

export function useImageZoom(options: UseImageZoomOptions = {}) {
  const {
    resetOnNewImage = true,
    containerRef,
    wheelKey,
    wheelRectRef,
  } = options;

  const [scale, setScale] = useState(1);
  const [isFit, setIsFit] = useState(true);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const prevImageKeyRef = useRef<string | null>(null);
  // 最近一次滚轮的 rect（用于 ± 按钮锚点计算）
  const lastWheelRectRef = useRef<DOMRect | null>(null);

  // 计算适合画布的初始缩放比（基于容器和图片实际尺寸）
  const computeFitScale = useCallback((
    containerEl: HTMLElement,
    imgEl: HTMLImageElement,
  ): number => {
    const rect = containerEl.getBoundingClientRect();
    const availW = rect.width - 32; // 留 padding
    const availH = rect.height - 32;
    if (availW <= 0 || availH <= 0) return 1;
    const scaleX = availW / (imgEl.naturalWidth || 1);
    const scaleY = availH / (imgEl.naturalHeight || 1);
    return Math.min(
      Math.max(Math.min(scaleX, scaleY, 1), MIN_SCALE),
      MAX_SCALE,
    );
  }, []);

  // 适合画布：重算 scale，清零 panOffset
  const fitImage = useCallback((
    containerEl: HTMLElement,
    imgEl: HTMLImageElement,
  ) => {
    const fitScale = computeFitScale(containerEl, imgEl);
    setScale(fitScale);
    setIsFit(true);
    setPanOffset({ x: 0, y: 0 });
  }, [computeFitScale]);

  // 打开新图时复位（监听 imageKey = src）
  // 用 ref 比较，避免闭包陷阱
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

  // 滚轮缩放（以指针为中心）：配合 stage 的 transformOrigin:"0 0"，
  // 在缩放前后保持指针下的原图像素位置不变。
  // 调用方需传入 stage 变换前的 rect（即 transform 包围盒，rectBefore.left = B + panOffset.x）。
  const handleWheel = useCallback((
    e: WheelEvent,
    rectBefore: DOMRect,
  ) => {
    e.preventDefault();
    // 缓存 rect，± 按钮读取它计算锚点
    lastWheelRectRef.current = rectBefore;
    const sOld = scale;
    const sNew = Math.min(MAX_SCALE, Math.max(MIN_SCALE, sOld - e.deltaY * 0.0015 * sOld));
    if (sNew === sOld) return;
    // rectBefore = 变换后的实时 DOMRect（已含 translate(panOffset) + scale*origin）
    //   rectBefore.left = B + panOffset.x   B = 未变换布局常量（transformOrigin="0 0" 时）
    // 布局常量 B = rectBefore.left - panOffset.x（反推未变换布局位置）
    const Bx = rectBefore.left - panOffset.x;
    const By = rectBefore.top - panOffset.y;
    // 指针在变换前的局部坐标（锚定后 local 值不变）
    const localX = (e.clientX - rectBefore.left) / sOld;
    const localY = (e.clientY - rectBefore.top) / sOld;
    const panNewX = e.clientX - Bx - localX * sNew;
    const panNewY = e.clientY - By - localY * sNew;
    setScale((prev) => sNew);
    setIsFit(false);
    setPanOffset({ x: panNewX, y: panNewY });
  }, [scale, panOffset]);

  // 双击切换适合画布 ↔ 100%
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

  // 拖拽平移启动（> 适合画布时激活）
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isFit) return;
    e.stopPropagation();
    isPanningRef.current = true;
    panStartRef.current = { x: e.clientX, y: e.clientY, panX: panOffset.x, panY: panOffset.y };
  }, [isFit, panOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanningRef.current) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    const newPanX = panStartRef.current.panX + dx;
    const newPanY = panStartRef.current.panY + dy;
    setPanOffset({ x: newPanX, y: newPanY });
    // 同步更新 lastWheelRectRef：拖拽后 zoomIn/Out 应以当前视图中心为锚点
    const el = (wheelRectRef ?? containerRef)?.current;
    if (el) lastWheelRectRef.current = el.getBoundingClientRect();
  }, [wheelRectRef, containerRef]);

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false;
  }, []);

  // ± 按钮：以最近滚轮的 rect（viewport）为锚点，保持该 viewport 中心对准同一 stage 位置
  // 若无滚轮记录则以 viewport 宽度 1024 为默认值（兼容 fit 态）
  const zoomIn = useCallback(() => {
    const sOld = scale;
    const sNew = Math.min(MAX_SCALE, sOld + ZOOM_STEP);
    if (sNew === sOld) return;
    const rect = lastWheelRectRef.current ?? { left: 0, top: 0, width: 1024, height: 768 };
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const panNewX = (panOffset.x - centerX) * (sNew / sOld) + centerX;
    const panNewY = (panOffset.y - centerY) * (sNew / sOld) + centerY;
    setScale(sNew);
    setIsFit(false);
    setPanOffset({ x: panNewX, y: panNewY });
  }, [scale, panOffset]);

  const zoomOut = useCallback(() => {
    const sOld = scale;
    const sNew = Math.max(MIN_SCALE, sOld - ZOOM_STEP);
    if (sNew === sOld) return;
    const rect = lastWheelRectRef.current ?? { left: 0, top: 0, width: 1024, height: 768 };
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const panNewX = (panOffset.x - centerX) * (sNew / sOld) + centerX;
    const panNewY = (panOffset.y - centerY) * (sNew / sOld) + centerY;
    setScale(sNew);
    setIsFit(false);
    setPanOffset({ x: panNewX, y: panNewY });
  }, [scale, panOffset]);

  // 坐标换算（plan.md §D 核心）
  // rect 来自 getBoundingClientRect()，已含 transform 效果，
  // 公式中不再出现 panOffset：rect.left 包含了 translate(pan) + scale*origin 的全部偏移。
  // 屏幕 → 原图像素
  const screenToImage = useCallback((
    screenX: number,
    screenY: number,
    rect: DOMRect,
  ): { x: number; y: number } => {
    return {
      x: (screenX - rect.left) / scale,
      y: (screenY - rect.top) / scale,
    };
  }, [scale]);

  // 原图像素 → 屏幕
  const imageToScreen = useCallback((
    imageX: number,
    imageY: number,
    rect: DOMRect,
  ): { x: number; y: number } => {
    return {
      x: imageX * scale + rect.left,
      y: imageY * scale + rect.top,
    };
  }, [scale]);

  // 辅助：获取 canvas cursor
  const cursor = isFit
    ? "default"
    : isPanningRef.current ? "grabbing" : "grab";

  // 辅助：containerRef 自动注册 wheel（ImageViewer 专用路径）
  // 内部读取 wheelRectRef（transform box）或 containerRef，handleWheel 签名对调用方保持一致
  useEffect(() => {
    const el = (wheelRectRef ?? containerRef)?.current;
    if (!el) return;
    const wrapped = (e: WheelEvent) => {
      const rect = el.getBoundingClientRect();
      handleWheel(e, rect);
    };
    el.addEventListener("wheel", wrapped, { passive: false });
    return () => el.removeEventListener("wheel", wrapped);
  }, [containerRef, wheelKey, wheelRectRef, handleWheel]);

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
    // 坐标换算
    screenToImage,
    imageToScreen,
    // 直接 setter（供外部 resize handler 调用）
    _setScale: setScale,
    _setIsFit: setIsFit,
  };
}
