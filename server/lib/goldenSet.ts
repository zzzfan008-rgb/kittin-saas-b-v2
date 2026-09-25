/**
 * Golden-set shared module — single source of truth for evaluation fixtures.
 *
 * Used by:
 *   - scripts/generate-evaluation-fixtures.ts (fixture generation)
 *   - scripts/evaluation-campaign-runner.ts (preflight/seal)
 *   - server/lib/evaluationPromotion.ts (promotion hash equality)
 *
 * Any brief→sampleIdx mapping must go through this module only.
 * Do not duplicate the 24 briefs or the sampleIdx arithmetic in any other file.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── types ──────────────────────────────────────────────────────────────

export interface GoldenSample {
  id: string;
  brief: string;
  riskFocus: string[];
  referenceImage?: {
    fileId: string;
    sha256: string;
  };
}

export interface GoldenSet {
  version: string;
  description: string;
  samples: GoldenSample[];
}

/** Must match evaluation-manifest-v1.json formal-validation sample count. */
export const GOLDEN_SET_SIZE = 24;

// ── lazy-loaded cache ──────────────────────────────────────────────────

let _goldenSet: GoldenSet | null = null;

function goldenSetPath(): string {
  return path.resolve(__dirname, "../../docs/ai/evaluation/golden-set-v1.json");
}

/** Load the canonical golden-set (lazy, cached). */
export function loadGoldenSet(): GoldenSet {
  if (_goldenSet) return _goldenSet;
  const raw = fs.readFileSync(goldenSetPath(), "utf-8");
  _goldenSet = JSON.parse(raw) as GoldenSet;
  if (_goldenSet.samples.length !== GOLDEN_SET_SIZE) {
    throw new Error(
      `golden-set must have ${GOLDEN_SET_SIZE} samples, got ${_goldenSet.samples.length}`,
    );
  }
  return _goldenSet;
}

/** Reload golden-set from disk (used in tests that mutate the in-memory array). */
export function reloadGoldenSet(): GoldenSet {
  _goldenSet = null;
  return loadGoldenSet();
}

// ── brief per-slot mapping (ruling Q2 shared function) ─────────────────

/**
 * Return the golden-set brief for a given stage and sampleIdx.
 *
 * Mapping (architect ruling 2):
 *   formal-validation: brief[0..23] — 1:1 mapping, all 24 samples
 *   internal-experiment: brief[0..7] — first 8, sampleIdx ascending prefix
 *   provider-probe: brief[0] — first 1
 *
 * Internal assertion: sampleIdx ∈ [0, 24), throw on OOB.
 */
export function goldenSetBriefForSlot(
  stage: "formal-validation" | "internal-experiment" | "provider-probe",
  sampleIdx: number,
): string {
  return goldenSetBriefForSlotFromSet(loadGoldenSet(), stage, sampleIdx);
}

/** Same as goldenSetBriefForSlot but accepts a pre-loaded golden-set (faster for loops). */
export function goldenSetBriefForSlotFromSet(
  goldenSet: GoldenSet,
  stage: "formal-validation" | "internal-experiment" | "provider-probe",
  sampleIdx: number,
): string {
  if (!Number.isInteger(sampleIdx) || sampleIdx < 0) {
    throw new Error(`sampleIdx ${sampleIdx} out of [0, ${GOLDEN_SET_SIZE})`);
  }

  switch (stage) {
    case "formal-validation":
      if (sampleIdx >= 24) throw new Error(`formal-validation sampleIdx ${sampleIdx} >= 24`);
      return goldenSet.samples[sampleIdx].brief;
    case "internal-experiment":
      if (sampleIdx >= 8) throw new Error(`internal-experiment sampleIdx ${sampleIdx} >= 8`);
      return goldenSet.samples[sampleIdx].brief;
    case "provider-probe":
      if (sampleIdx >= 1) throw new Error(`provider-probe sampleIdx ${sampleIdx} >= 1`);
      return goldenSet.samples[0].brief;
  }
}

// ── reference image validation (ruling D) ──────────────────────────────

/**
 * Known-bad SHA256 values that must be rejected.
 * 5f2a8589... = r2, contains amazon watermark → reject.
 */
export const REJECTED_SHA256 = new Set([
  "5f2a8589828c5e8cc765ead34f473d0df34ff5f7cb9a8ecf41a321199b163ca8",
]);

/**
 * Required SHA256 values that must match exactly.
 * 2ffde870... = r4 (garment-gold-24), final approved image for sample 24.
 */
export const REQUIRED_SHA256: Record<string, string> = {
  "garment-gold-24": "2ffde87096b7ce986d41060b78b4f4b8c4ce6662569db8b5d6070b62e39d06d2",
};

/**
 * Validate a reference image's on-disk SHA256 against golden-set expectations.
 * Returns the validated sha256, or throws.
 */
export function validateReferenceImageSha256(
  sampleId: string,
  filePath: string,
  onDiskSha256: string,
): string {
  // 1. reject known-bad hashes
  if (REJECTED_SHA256.has(onDiskSha256)) {
    throw new Error(
      `${sampleId}: REFUSED — SHA256 ${onDiskSha256} is in the rejected list (amazon watermark etc.)`,
    );
  }

  // 2. check required hash if sample has a pinned value
  const required = REQUIRED_SHA256[sampleId];
  if (required !== undefined && onDiskSha256 !== required) {
    throw new Error(
      `${sampleId}: SHA256 MISMATCH — expected ${required}, got ${onDiskSha256}`,
    );
  }

  // 3. cross-check against golden-set referenceImage.sha256 if set
  const goldenSet = loadGoldenSet();
  const sample = goldenSet.samples.find((s) => s.id === sampleId);
  if (sample?.referenceImage?.sha256 && onDiskSha256 !== sample.referenceImage.sha256) {
    throw new Error(
      `${sampleId}: SHA256 drift — golden-set claims ${sample.referenceImage.sha256}, disk=${onDiskSha256}`,
    );
  }

  return onDiskSha256;
}