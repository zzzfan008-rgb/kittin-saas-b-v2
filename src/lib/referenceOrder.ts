/**
 * P0（model-tryon）：参考图排序规则（纯函数，前后端共用）。
 *
 * 唯一证据 = 图片节点右上角「图N」徽标。徽标顺序即「该图片源在目标生成节点
 * 入边序列中的序号」（selectAllReferenceOrdinals），拼装侧（dag）与渲染侧
 * （providerPromptRenderer）的图号都必须与它一致。
 *
 * 规则（仅 familyId === "model-tryon" 时生效）：
 * - 图1 = 服装：源节点 id 为 "garment"，或 label 含"服装"；
 * - 图2 = 模特：源节点 id 为 "model"，或 label 含"模特"。
 * 用户删节点重建后 id/label 都对不上 → 保持原上游顺序（fail-open，不拦运行）。
 */
export interface ReferenceUpstreamEntry {
  nodeId: string;
  images: string[];
}

const GARMENT_IDS = new Set(["garment"]);
const MODEL_IDS = new Set(["model"]);

/** 该上游在 model-tryon 族中的角色名（供 Provider 逐图标签/提示词映射使用）。 */
export function tryonRoleOf(nodeId: string, label: string): "服装" | "模特" | undefined {
  const rank = tryonUpstreamRank(nodeId, label);
  if (rank === 0) return "服装";
  if (rank === 1) return "模特";
  return undefined;
}

/** 返回该上游在 model-tryon 族中的期望序号位：0=图1服装，1=图2模特，2=未知。 */
export function tryonUpstreamRank(nodeId: string, label: string): 0 | 1 | 2 {
  if (GARMENT_IDS.has(nodeId) || label.includes("服装")) return 0;
  if (MODEL_IDS.has(nodeId) || label.includes("模特")) return 1;
  return 2;
}

/**
 * 按 model-tryon 规则原地重排上游：服装在前、模特在后。
 * 非该族（familyId 缺失或他族）直接返回不改动；未知来源保持相对顺序。
 */
export function orderReferenceUpstream(
  upstream: ReferenceUpstreamEntry[],
  familyId: string | undefined,
  labelOf: (sourceNodeId: string) => string,
): void {
  if (familyId !== "model-tryon") return;
  upstream
    .map((source, index) => ({ source, index }))
    .filter((entry) => entry.source.images.length > 0)
    .sort(
      (a, b) =>
        tryonUpstreamRank(a.source.nodeId, labelOf(a.source.nodeId)) -
          tryonUpstreamRank(b.source.nodeId, labelOf(b.source.nodeId)) ||
        a.index - b.index,
    )
    .forEach((entry, position) => {
      const from = upstream.indexOf(entry.source);
      const [moved] = upstream.splice(from, 1);
      upstream.splice(position, 0, moved);
    });
}
