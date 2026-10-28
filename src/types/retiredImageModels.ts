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
  "gpt-image-2.5-sunburst-vip",
  "gpt-image-2.5-flare-vip",
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
