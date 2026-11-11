/**
 * Read-only compatibility identifiers for saved projects created before a
 * model left the product. They are never provider IDs and must never enter an
 * active model selector, contract, prompt variant, parameter profile or call.
 */
/**
 * 2026-10-27 API易 → 兔子API 迁移：以下模型在兔子账户无对应 ID（或按用户拍板的
 * 新清单被替换），从产品中移除。
 *
 * 处理口径（用户 2026-10-27 拍板）：**模型新老交替对用户不可见**。读取旧草稿/旧项目
 * 命中这些 ID 时静默回落为当前默认生成模型（前端 flowTabSession、服务端
 * workflowSchema 同口径），既不报错也不弹「请手动重选」提示。
 *
 * 注意：这些是**退役的旧 ID**，与 IMAGE_MODEL_IDS 里现役模型互斥，
 * 任何批量重命名都不得把它们改写成现役 ID（否则会反向阻断新模型）。
 */
export const RETIRED_IMAGE_MODEL_IDS = [
  "grok-imagine-image",
  "gpt-image-2.5-all",
  "gpt-image-2.6-sunburst-vip",
  "gpt-image-2.6-flare-vip",
  "gemini-3-pro-image-preview",
  "gemini-3.1-flash-lite-image",
  "flux-2-pro",
  "seedream-5-0-260128",
] as const;

export type RetiredImageModelId = (typeof RETIRED_IMAGE_MODEL_IDS)[number];

export function isRetiredImageModelId(value: unknown): value is RetiredImageModelId {
  return typeof value === "string"
    && (RETIRED_IMAGE_MODEL_IDS as readonly string[]).includes(value);
}

/**
 * 2026-11-10：GPT Image 2.6 上线，2.5 flare/sunburst 从产品移除。
 *
 * 与 retired 列表不同：这两个 2.5 ID **有同族继任者**，必须精确映射到对应 2.6
 * （flare→flare、sunburst→sunburst），不能回落默认模型——否则旧项目里选 sunburst
 * 的节点会被静默改成 flare，用户看到画风变化却找不到原因。
 *
 * 前端加载（flowTabSession）与服务端校验（workflowSchema）共用此表。
 */
export const LEGACY_IMAGE_MODEL_REPLACEMENTS: Readonly<Record<string, string>> = {
  "gpt-image-2.5-flare": "gpt-image-2.6-flare",
  "gpt-image-2.5-sunburst": "gpt-image-2.6-sunburst",
};

export function migrateLegacyImageModelId(value: unknown): unknown {
  return typeof value === "string"
    ? LEGACY_IMAGE_MODEL_REPLACEMENTS[value] ?? value
    : value;
}
