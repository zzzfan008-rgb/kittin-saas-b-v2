import type { PromptSupportStatus } from "./garmentPromptPresets";
import type { EvaluationReferenceRoleProfileEntry } from "../types/promptEvaluation";
import { canonicalReferenceRoleProfile } from "./promptEvaluation";

declare const __GARMENT_CANVAS_PROMPT_EVALUATION_RELEASE_REGISTRY__: unknown;

export type ReleasedPromptSupportStatus = Exclude<
  PromptSupportStatus,
  "unsupported" | "unverified"
>;

/**
 * Recommendation registration is disabled until candidate results are paired
 * with separately traceable, reviewed same-model baseline cases.
 */
export const RECOMMENDATION_BASELINE_IMPLEMENTATION_STATUS =
  "blocked-pending-reviewed-definition" as const;
export const RECOMMENDATION_BASELINE_BLOCKER_DETAIL =
  "Recommendation is blocked until a reviewed same-model baseline definition and traceable candidate/baseline case pairs are implemented.";

/**
 * A reviewed promotion record. `releaseVector` is an exact canonical snapshot,
 * not a pointer to live catalog data; prompt/profile/contract/postprocess drift
 * therefore invalidates the promotion even when a version bump was forgotten.
 */
export interface PromptEvaluationRelease {
  schemaVersion: 1;
  variantId: string;
  /** Exact ordered profile evaluated by this release; duplicates are retained. */
  referenceRoleProfile: readonly EvaluationReferenceRoleProfileEntry[];
  supportStatus: ReleasedPromptSupportStatus;
  evaluationStage: "internal-experiment" | "formal-validation" | "recommendation";
  evaluationVersion: string;
  releaseVector: string;
  evidenceArtifactId: string;
  evidenceArtifactSha256: string;
  gateReceiptSha256: string;
  evaluationUnitKey: `sha256:${string}`;
  codeSha: string;
  contractHash: `sha256:${string}`;
  parameterProfileVersion: string;
  postprocessVersion: string;
}

export interface PromptEvaluationReleaseRegistry {
  schemaVersion: 1;
  generatedAt: string | null;
  releases: readonly PromptEvaluationRelease[];
}

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const CODE_SHA_PATTERN = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/;
const CONTRACT_HASH_PATTERN = /^sha256:[a-f0-9]{64}$/;
const SAFE_ID_PATTERN = /^[A-Za-z0-9_.:/-]{1,512}$/;
const RELEASE_STATUSES = new Set<ReleasedPromptSupportStatus>([
  "experimental", "verified", "recommended",
]);
const RELEASE_STAGES = new Set([
  "internal-experiment", "formal-validation", "recommendation",
]);
const REGISTRY_FIELDS = new Set(["schemaVersion", "generatedAt", "releases"]);
const RELEASE_FIELDS = new Set([
  "schemaVersion", "variantId", "referenceRoleProfile", "supportStatus",
  "evaluationStage", "evaluationVersion", "releaseVector", "evidenceArtifactId",
  "evidenceArtifactSha256", "gateReceiptSha256", "evaluationUnitKey", "codeSha",
  "contractHash", "parameterProfileVersion", "postprocessVersion",
]);

function validateRegistry(value: unknown): {
  registry: PromptEvaluationReleaseRegistry;
  errors: readonly string[];
} {
  const errors: string[] = [];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {
      registry: { schemaVersion: 1, generatedAt: null, releases: [] },
      errors: ["prompt release registry must be an object"],
    };
  }
  const record = value as Record<string, unknown>;
  for (const field of Object.keys(record)) {
    if (!REGISTRY_FIELDS.has(field)) errors.push(`prompt release registry contains unknown field ${field}`);
  }
  if (record.schemaVersion !== 1) errors.push("prompt release registry schemaVersion must equal 1");
  if (record.generatedAt !== null && (
    typeof record.generatedAt !== "string" || !Number.isFinite(Date.parse(record.generatedAt))
  )) {
    errors.push("prompt release registry generatedAt must be null or an ISO timestamp");
  }
  if (!Array.isArray(record.releases)) errors.push("prompt release registry releases must be an array");
  const releases: PromptEvaluationRelease[] = [];
  const uniqueKeys = new Set<string>();
  for (const [index, candidate] of (Array.isArray(record.releases) ? record.releases : []).entries()) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
      errors.push(`prompt release registry releases[${index}] must be an object`);
      continue;
    }
    const release = candidate as Record<string, unknown>;
    for (const field of Object.keys(release)) {
      if (!RELEASE_FIELDS.has(field)) {
        errors.push(`prompt release registry releases[${index}] contains unknown field ${field}`);
      }
    }
    const requiredText = [
      "variantId", "evaluationVersion", "releaseVector", "evidenceArtifactId",
      "evaluationUnitKey", "codeSha", "contractHash", "parameterProfileVersion",
      "postprocessVersion", "gateReceiptSha256",
    ] as const;
    for (const field of requiredText) {
      if (typeof release[field] !== "string" || !(release[field] as string).trim()) {
        errors.push(`prompt release registry releases[${index}].${field} is required`);
      }
    }
    if (release.schemaVersion !== 1) errors.push(`prompt release registry releases[${index}].schemaVersion must equal 1`);
    if (!RELEASE_STATUSES.has(release.supportStatus as ReleasedPromptSupportStatus)) {
      errors.push(`prompt release registry releases[${index}].supportStatus is invalid`);
    }
    if (!RELEASE_STAGES.has(String(release.evaluationStage))) {
      errors.push(`prompt release registry releases[${index}].evaluationStage is invalid`);
    }
    if (release.evaluationStage === "recommendation" || release.supportStatus === "recommended") {
      errors.push(`prompt release registry releases[${index}]: ${RECOMMENDATION_BASELINE_BLOCKER_DETAIL}`);
    }
    const expectedStatus = release.evaluationStage === "internal-experiment"
      ? "experimental"
      : release.evaluationStage === "formal-validation"
        ? "verified"
        : release.evaluationStage === "recommendation" ? "recommended" : undefined;
    if (expectedStatus !== release.supportStatus) {
      errors.push(`prompt release registry releases[${index}] stage/status pairing is invalid`);
    }
    let canonicalProfile: readonly EvaluationReferenceRoleProfileEntry[] | undefined;
    if (!Array.isArray(release.referenceRoleProfile)) {
      errors.push(`prompt release registry releases[${index}].referenceRoleProfile must be an array`);
    } else {
      try {
        for (const [profileIndex, entry] of release.referenceRoleProfile.entries()) {
          if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
          const fields = Object.keys(entry as Record<string, unknown>);
          if (fields.length !== 2 || !fields.includes("order") || !fields.includes("role")) {
            throw new Error(`entry ${profileIndex} must contain only order and role`);
          }
        }
        canonicalProfile = canonicalReferenceRoleProfile(
          release.referenceRoleProfile as unknown as readonly EvaluationReferenceRoleProfileEntry[],
        );
      } catch (error) {
        errors.push(
          `prompt release registry releases[${index}].referenceRoleProfile is invalid: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
    if (typeof release.evidenceArtifactSha256 !== "string" || !SHA256_PATTERN.test(release.evidenceArtifactSha256)) {
      errors.push(`prompt release registry releases[${index}].evidenceArtifactSha256 is invalid`);
    }
    if (typeof release.gateReceiptSha256 !== "string" || !SHA256_PATTERN.test(release.gateReceiptSha256)) {
      errors.push(`prompt release registry releases[${index}].gateReceiptSha256 is invalid`);
    }
    if (typeof release.evaluationUnitKey !== "string" || !CONTRACT_HASH_PATTERN.test(release.evaluationUnitKey)) {
      errors.push(`prompt release registry releases[${index}].evaluationUnitKey is invalid`);
    }
    if (typeof release.contractHash !== "string" || !CONTRACT_HASH_PATTERN.test(release.contractHash)) {
      errors.push(`prompt release registry releases[${index}].contractHash is invalid`);
    }
    if (typeof release.codeSha !== "string" || !CODE_SHA_PATTERN.test(release.codeSha)) {
      errors.push(`prompt release registry releases[${index}].codeSha is invalid`);
    }
    if (typeof release.evidenceArtifactId !== "string" || !SAFE_ID_PATTERN.test(release.evidenceArtifactId)) {
      errors.push(`prompt release registry releases[${index}].evidenceArtifactId is invalid`);
    }
    const key = JSON.stringify([release.variantId, canonicalProfile ?? null]);
    if (uniqueKeys.has(key)) errors.push(`prompt release registry contains duplicate release key at index ${index}`);
    uniqueKeys.add(key);
    releases.push({
      ...release,
      referenceRoleProfile: canonicalProfile ?? [],
    } as unknown as PromptEvaluationRelease);
  }
  return {
    registry: {
      schemaVersion: 1,
      generatedAt: typeof record.generatedAt === "string" ? record.generatedAt : null,
      releases,
    },
    errors,
  };
}

const EMPTY_REGISTRY: PromptEvaluationReleaseRegistry = {
  schemaVersion: 1,
  generatedAt: null,
  releases: [],
};

/**
 * Vite and the Node server build replace this identifier from the same
 * externally pinned registry. Direct TypeScript/test execution deliberately
 * has no replacement and therefore gets only the strict empty registry.
 */
const injectedRegistry = typeof __GARMENT_CANVAS_PROMPT_EVALUATION_RELEASE_REGISTRY__ === "undefined"
  ? EMPTY_REGISTRY
  : __GARMENT_CANVAS_PROMPT_EVALUATION_RELEASE_REGISTRY__;
const loaded = validateRegistry(injectedRegistry);

/**
 * Runtime-readable, generated promotion manifest. Any malformed entry fails
 * the whole registry closed; a catalog status can never manufacture release.
 */
export const PROMPT_EVALUATION_RELEASE_REGISTRY_ERRORS = loaded.errors;
export const PROMPT_EVALUATION_RELEASE_REGISTRY: PromptEvaluationReleaseRegistry = loaded.errors.length
  ? { schemaVersion: 1, generatedAt: null, releases: [] }
  : loaded.registry;
export const PROMPT_EVALUATION_RELEASES: readonly PromptEvaluationRelease[] = [
  ...PROMPT_EVALUATION_RELEASE_REGISTRY.releases,
];

export function validatePromptEvaluationReleaseRegistry(value: unknown) {
  return validateRegistry(value);
}
