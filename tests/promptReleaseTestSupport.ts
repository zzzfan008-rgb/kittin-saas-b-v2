import type { PromptVariant } from "../src/lib/garmentPromptPresets";
import { createPromptEvaluationReleaseSnapshot } from "../src/lib/promptEvaluationRelease";
import {
  PROMPT_EVALUATION_RELEASES,
  type PromptEvaluationRelease,
  type ReleasedPromptSupportStatus,
} from "../src/lib/promptEvaluationReleaseRegistry";

export const TEST_PROMPT_RELEASE_CODE_SHA = "0123456789abcdef0123456789abcdef01234567";
const TEST_SHA256 = "0".repeat(64);

/** Isolated-process fixture only; production has no promotion entries. */
export function promotePromptVariantForTest(
  variant: PromptVariant,
  supportStatus: ReleasedPromptSupportStatus = "verified",
): void {
  // Runtime callers read the code identity from their environment; tests must
  // provide the same explicit, syntactically valid identity as their release.
  process.env.GARMENT_CANVAS_CODE_SHA = TEST_PROMPT_RELEASE_CODE_SHA;
  const releases = PROMPT_EVALUATION_RELEASES as PromptEvaluationRelease[];
  const existing = releases.findIndex((release) => release.variantId === variant.variantId);
  const release = createPromptEvaluationReleaseSnapshot(
    variant,
    supportStatus,
    `test-only:${variant.variantId}`,
    {
      evaluationStage: supportStatus === "recommended"
        ? "recommendation"
        : supportStatus === "verified" ? "formal-validation" : "internal-experiment",
      evidenceArtifactSha256: TEST_SHA256,
      gateReceiptSha256: TEST_SHA256,
      evaluationUnitKey: `sha256:${TEST_SHA256}`,
      codeSha: TEST_PROMPT_RELEASE_CODE_SHA,
    },
  );
  if (existing >= 0) releases.splice(existing, 1, release);
  else releases.push(release);
}

/**
 * Simulates a reviewed release being withdrawn after a job was admitted.
 * Returns an exact restoration callback so queue tests do not mutate the live
 * prompt catalog, which is no longer the runtime release authority.
 */
export function withdrawPromptVariantReleasesForTest(variantId: string): () => void {
  const releases = PROMPT_EVALUATION_RELEASES as PromptEvaluationRelease[];
  const removed = releases
    .map((release, index) => ({ release, index }))
    .filter(({ release }) => release.variantId === variantId);
  for (const { index } of [...removed].reverse()) releases.splice(index, 1);
  return () => {
    for (const { release, index } of removed) releases.splice(index, 0, release);
  };
}
