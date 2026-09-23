/**
 * stub: @excalidraw/mermaid-to-excalidraw
 *
 * 原包拖入 mermaid 全家桶（cynefin/katex/cytoscape/dagre，合计 ~1.4MB chunk），
 * 仅服务于 Excalidraw 内置的「Mermaid 转画布」对话框。通过 vite.config.ts 的
 * resolve.alias 把该包指向本文件，消去这些大 chunk
 * （卡 #60 包体门禁，用户 2026-09-24 拍板 a+b 组合）。
 *
 * 降级行为：Excalidraw 只在用户打开「文字转图表」对话框并点转换时才调用
 * parseMermaidToExcalidraw；调用点在 Excalidraw 内部有 try/catch + setError，
 * 本 stub 抛出明确 Error 后对话框内显示错误提示，不崩溃、
 * 不影响作画/导出 PNG/上传主链路。该功能静默不可用是用户已知晓接受的代价。
 *
 * 产物侧 fail-closed 证据：scripts/verify-bundle-budget.mjs 的
 * STUBBED_CHUNK_PATTERNS —— cynefin/katex/cytoscape/cose-bilkent chunk
 * 一旦复活（alias 失效）即门禁 error。
 */
export async function parseMermaidToExcalidraw(
  _definition: string,
  _config?: unknown,
): Promise<never> {
  throw new Error("Mermaid 转画布功能当前不可用（已为包体预算停用）");
}