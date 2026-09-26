/**
 * Golden-set shared module — single source of truth for evaluation fixtures.
 *
 * Used by:
 *   - scripts/generate-evaluation-fixtures.ts (fixture generation)
 *   - scripts/evaluation-campaign-runner.ts (prepare/seal/execute)
 *   - tests/campaign-runner-preflight.test.ts (preflight)
 *   - server/lib/evaluationPromotion.ts (promotion hash equality)
 *
 * Any brief→sampleIdx mapping or fixture project resolution must go through
 * this module only. Do not duplicate the 24 briefs, the sampleIdx arithmetic,
 * or the projectId naming convention in any other file.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Pool } from "pg";
import { createHash } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── types ──────────────────────────────────────────────────────────────

export interface GoldenSample {
  id: string;
  brief: string;
  riskFocus: string[];
  referenceImage?: {
    /** 溯源：生图师交付的原始文件 sha256（规划期文件，非入库产物）。 */
    deliveredSourceSha256?: string;
    /** 执行绑定：normalize 入库产物的实际存储 sha256（入库后从存储回读填写）。 */
    assetSha256?: string;
    /** 入库后分配的真实 fileId（单次写入，入库脚本回写）。 */
    fileId?: string;
    /** @deprecated 旧字段，迁移到 assetSha256。 */
    sha256?: string;
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
 * (Currently empty — the r2 watermark concern was resolved by user ruling:
 *  garment-gold-24 = r2 is the approved delivery version.)
 */
export const REJECTED_SHA256 = new Set<string>([]);

/**
 * Required SHA256 values that must match exactly.
 * garment-gold-24: r2 (5f2a8589…) — user-decided delivery version
 *   (r4 = 2ffde870… is an alternate, not rejected, just not selected).
 */
export const REQUIRED_SHA256: Record<string, string> = {
  "garment-gold-24": "5f2a8589828c5e8cc765ead34f473d0df34ff5f7cb9a8ecf41a321199b163ca8",
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
      `${sampleId}: REFUSED — SHA256 ${onDiskSha256} is in the rejected list (known-bad hash)`,
    );
  }

  // 2. check required hash if sample has a pinned value
  const required = REQUIRED_SHA256[sampleId];
  if (required !== undefined && onDiskSha256 !== required) {
    throw new Error(
      `${sampleId}: SHA256 MISMATCH — expected ${required}, got ${onDiskSha256}`,
    );
  }

  // 3. cross-check against golden-set referenceImage.assetSha256 if set
  const goldenSet = loadGoldenSet();
  const sample = goldenSet.samples.find((s) => s.id === sampleId);
  const expectedSha256 = sample?.referenceImage?.assetSha256 ?? sample?.referenceImage?.sha256;
  if (expectedSha256 && onDiskSha256 !== expectedSha256) {
    throw new Error(
      `${sampleId}: SHA256 drift — golden-set claims ${expectedSha256}, disk=${onDiskSha256}`,
    );
  }

  return onDiskSha256;
}

// ── slot binding: shared resolver for fixture projectId / brief / reference ──
// 62-track-b-wiring-ruling.md §裁决 1: single shared function, four call sites
// (prepare / seal / execute / preflight). One call returns {projectId, briefText,
// referenceImageFileId} — the tuple is a construction-site fact, so O1 pairing
// (brief ↔ reference image) is guaranteed by construction rather than verified
// after the fact.

/** Full variant IDs as they appear in the manifest and prompt registry. */
export const GENERATE_VARIANT = "fashion-lookbook.gpt-image-2.5-flare-vip.generate.v1";
export const EDIT_VARIANT = "fashion-lookbook.gpt-image-2.5-flare-vip.edit.v1";

const ALLOWED_FIXTURE_VARIANTS = new Set([GENERATE_VARIANT, EDIT_VARIANT]);

/**
 * sha256 of the JSON string "[]" — the fingerprint of an empty inputReferences
 * array. Any edit slot whose reference_inputs_sha256 equals this value was
 * captured without real reference images (the prepare synthetic-plan defect).
 *
 * Computed 2026-09-26 via:
 *   node -e "console.log(require('crypto').createHash('sha256').update('[]').digest('hex'))"
 */
export const EMPTY_REFERENCE_SHA256: `sha256:${string}` =
  "sha256:4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945";

/**
 * The UI placeholder prompt text. If a slot's brief/prompt equals this string,
 * the brief was never injected — this is the "fact-gate fingerprint" described
 * in injection-ruling §3.
 */
export const PLACEHOLDER_PROMPT = "【要求】描述场合、风格与身材";

/** Pad a 1-indexed sample number to 2 digits. */
function padSampleIdx(n: number): string {
  return String(n).padStart(2, "0");
}

export interface SlotBinding {
  projectId: string;
  briefText: string;
  /** null for generate variants (no reference image). */
  referenceImageFileId: string | null;
}

/**
 * Resolve fixture projectId, brief text, and reference image fileId for a
 * single slot, and assert the fixture project exists in the database.
 *
 * Throws if variantId is unknown, sampleIdx is out of range, or the fixture
 * project is missing / not alive in the database (fail-closed — no fallback
 * to old template fixtures).
 */
export async function goldenSetSlotBinding(
  pool: Pool,
  variantId: string,
  stage: "formal-validation" | "internal-experiment" | "provider-probe",
  sampleIdx: number,
): Promise<SlotBinding> {
  if (!ALLOWED_FIXTURE_VARIANTS.has(variantId)) {
    throw new Error(
      `unknown variant for fixture binding: ${variantId}. ` +
      `Allowed: ${GENERATE_VARIANT}, ${EDIT_VARIANT}`,
    );
  }
  const isGenerate = variantId === GENERATE_VARIANT;

  // sampleIdx is 1-based in the slot/campaign convention (slotId uses sampleIdx+1).
  // The project naming convention uses 1-indexed zero-padded IDs (e.g. EVALgen-brief-01).
  const projectIdx = sampleIdx + 1;
  const projectId = isGenerate
    ? `EVALgen-brief-${padSampleIdx(projectIdx)}`
    : `EVALedit-brief-${padSampleIdx(projectIdx)}`;

  // Assert fixture project exists in DB and is alive (ruling: fail-closed,
  // no fallback to old template fixtures U7lK9XXlq1 / EVALeditv1F).
  const r = await pool.query(
    `SELECT id, lifecycle FROM projects WHERE id = $1`,
    [projectId],
  );
  if (r.rows.length === 0) {
    throw new Error(
      `fixture project ${projectId} not found in database ` +
      `(variant=${variantId}, stage=${stage}, sampleIdx=${sampleIdx}). ` +
      `Run generate-evaluation-fixtures.ts --commit first.`,
    );
  }
  const row = r.rows[0];
  if (row.lifecycle !== "saved") {
    throw new Error(
      `fixture project ${projectId} has lifecycle "${row.lifecycle}" — expected "saved"`,
    );
  }

  const briefText = goldenSetBriefForSlot(stage, sampleIdx);

  let referenceImageFileId: string | null = null;
  if (!isGenerate) {
    const goldenSet = loadGoldenSet();
    const sample = goldenSet.samples[sampleIdx];
    if (!sample) {
      throw new Error(
        `golden-set sample index ${sampleIdx} out of range (max ${goldenSet.samples.length - 1})`,
      );
    }
    const fileId = sample.referenceImage?.fileId;
    if (!fileId) {
      throw new Error(
        `golden-set sample ${sample.id} has no referenceImage.fileId — run upload-evaluation-reference-images.ts --commit first`,
      );
    }
    referenceImageFileId = fileId;
  }

  return { projectId, briefText, referenceImageFileId };
}