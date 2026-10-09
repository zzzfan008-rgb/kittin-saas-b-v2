import { create } from "zustand";

/**
 * R-94 全局图片放大 Lightbox 状态。
 *
 * 与 ImageViewer（查看详情语义）分离：任何「点图放大」场景都走这里，
 * 全局单实例挂载在 App.tsx，zustand 轻量 store。
 */
export type LightboxItem = { src: string; alt?: string };

type LightboxState = {
  item: LightboxItem | null;
  open: (src: string, alt?: string) => void;
  close: () => void;
};

export const useLightboxStore = create<LightboxState>((set) => ({
  item: null,
  open: (src, alt) => set({ item: { src, alt } }),
  close: () => set({ item: null }),
}));
