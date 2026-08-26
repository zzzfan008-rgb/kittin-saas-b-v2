/**
 * 蒙版生成安全带宽度：给模型留出完整构图与柔和衔接空间。
 * 小尺寸测试夹具不扩张；真实图片按短边比例扩张，并限制处理成本。
 */
export function maskSafetyRadius(width: number, height: number): number {
  const shortEdge = Math.min(width, height);
  if (!Number.isFinite(shortEdge) || shortEdge < 64) return 0;
  return Math.max(4, Math.min(64, Math.round(shortEdge * 0.03)));
}

export function maskFeatherSigma(width: number, height: number): number {
  const radius = maskSafetyRadius(width, height);
  return radius > 0 ? Math.max(1, Math.min(12, radius / 3)) : 0;
}
