/**
 * 参考图角色识别（纯函数、零依赖，前后端共用）。
 *
 * 唯一事实源：画布徽标排序（src/types/workflow.ts）、计划期角色（server/engine/dag.ts）、
 * 运行前图片解析（server/lib/referenceAnalyzer.ts）都必须调用本模块，禁止再各写一份规则。
 *
 * 匹配顺序：
 * 1. 节点 id 精确命中（模板内置节点 garment/model）——用户改名也不会丢身份；
 * 2. label 归一化（trim + 转小写 + 去空白）后按关键词包含匹配，先命中先返回。
 *
 * 刻意保持的语义：排序只认「服装 / 模特」（与历史 model-tryon 行为一致），
 * 姿态/场景只参与解析角色识别，不改变既有参考图顺序。
 */

export type ReferenceRole = "服装" | "模特" | "姿态" | "场景";

export const REFERENCE_ROLES: readonly ReferenceRole[] = ["服装", "模特", "姿态", "场景"];

interface RoleKeywords {
  role: ReferenceRole;
  keywords: readonly string[];
}

/** 关键词按「专用 → 宽泛」排序，避免「场景模特」这类名称被泛词抢先命中。 */
const ROLE_KEYWORDS: readonly RoleKeywords[] = [
  { role: "服装", keywords: ["服装", "衣服", "上衣", "外套", "裙", "裤", "套装", "garment", "outfit"] },
  { role: "模特", keywords: ["模特", "人物", "人像", "model", "person"] },
  { role: "姿态", keywords: ["姿态", "姿势", "动作", "pose", "posture"] },
  { role: "场景", keywords: ["场景", "背景", "环境", "scene", "background"] },
];

/** 模板内置节点 id → 角色。改名后仍可识别。 */
const ROLE_BY_NODE_ID: Readonly<Record<string, ReferenceRole>> = {
  garment: "服装",
  model: "模特",
};

function normalizeLabel(label: unknown): string {
  return typeof label === "string" ? label.trim().toLowerCase().replace(/\s+/g, "") : "";
}

/**
 * 识别参考图来源节点的角色。
 * @param nodeId 图片节点 id（内置模板为 garment/model）
 * @param label  图片节点显示名（可为空；空名时仅 id 能命中）
 */
export function matchReferenceRole(nodeId: string, label: string): ReferenceRole | null {
  const byId = ROLE_BY_NODE_ID[nodeId];
  if (byId) return byId;
  const text = normalizeLabel(label);
  if (!text) return null;
  for (const entry of ROLE_KEYWORDS) {
    for (const keyword of entry.keywords) {
      if (text.includes(keyword)) return entry.role;
    }
  }
  return null;
}

/**
 * 参考图排序位次：仅为兼容历史 model-tryon 的「服装在前、模特在后」。
 * 姿态/场景与未知来源同为 2，保持原有相对顺序（稳定排序）。
 */
export function referenceOrderRank(role: ReferenceRole | null): 0 | 1 | 2 {
  if (role === "服装") return 0;
  if (role === "模特") return 1;
  return 2;
}

/** 供 UI 提示使用：未识别时建议用户改成的名称。 */
export const REFERENCE_ROLE_HINT = REFERENCE_ROLES.join(" / ");
