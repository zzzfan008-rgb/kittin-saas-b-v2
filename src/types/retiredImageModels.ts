/**
 * Read-only compatibility identifiers for saved projects created before a
 * model left the product. They are never provider IDs and must never enter an
 * active model selector, contract, prompt variant, parameter profile or call.
 */
export const RETIRED_IMAGE_MODEL_IDS = ["grok-imagine-image"] as const;

export type RetiredImageModelId = (typeof RETIRED_IMAGE_MODEL_IDS)[number];

export function isRetiredImageModelId(value: unknown): value is RetiredImageModelId {
  return typeof value === "string"
    && (RETIRED_IMAGE_MODEL_IDS as readonly string[]).includes(value);
}
