/**
 * R-38 参考图序号徽标：源图缩略图右上角的 20px 圆形编号。
 * 三重编码（位置+数字+颜色）；默认态与高亮态都不靠颜色单通道区分。
 * 徽标属于图片而非卡片：无图（未上传）时不存在显示对象，自然无标。
 * 序号是 (选中目标, 源图) 的二元派生视图（graph-invariants.md §2b），永不持久化。
 */
export function RefOrdinalBadge({ ordinal, highlighted }: { ordinal: number; highlighted?: boolean }) {
  return (
    <span
      aria-hidden="true"
      data-ref-ordinal={ordinal}
      className="ref-ordinal-badge pointer-events-none absolute right-1.5 top-1.5 z-[3] flex h-5 min-w-5 items-center justify-center rounded-full px-[5px] font-mono text-[11px] font-bold leading-none"
      style={{
        backgroundColor: highlighted ? "var(--gc-accent)" : "var(--gc-media-overlay)",
        color: highlighted ? "var(--gc-accent-cta-ink)" : "var(--gc-media-overlay-text)",
        border: "1.5px solid var(--gc-node-main)",
        boxShadow: "0 1px 4px rgba(0,0,0,.35)",
      }}
    >
      {ordinal}
    </span>
  );
}
