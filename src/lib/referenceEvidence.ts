import type { ReferenceImageEvidence } from "@/types/workflow";

export type ReferenceEvidenceState = "confirmed" | "legacy" | "unavailable";

export interface HistoricalReferenceEvidence extends ReferenceImageEvidence {
  evidenceState: ReferenceEvidenceState;
}

const SHA256_PATTERN = /^[0-9a-f]{64}$/;

function isSha256(value: unknown): value is string {
  return typeof value === "string" && SHA256_PATTERN.test(value);
}

function sourceNodeIdOf(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

/**
 * Normalize persisted history evidence without ever upgrading malformed data
 * to confirmed state. The result stays index-aligned with referenceImages.
 */
export function normalizeReferenceImageEvidence(
  value: unknown,
  referenceImageCount: number,
): HistoricalReferenceEvidence[] {
  const rawEntries = Array.isArray(value) ? value : [];
  const count = Math.max(0, referenceImageCount, rawEntries.length);
  return Array.from({ length: count }, (_entry, index) => {
    const raw = rawEntries[index];
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
      return {
        order: index,
        assetSha256: "",
        evidenceState: "unavailable" as const,
      };
    }

    const candidate = raw as Record<string, unknown>;
    const hash = isSha256(candidate.assetSha256) ? candidate.assetSha256 : "";
    const sourceNodeId = sourceNodeIdOf(candidate.sourceNodeId);
    const orderMatches = candidate.order === index;
    const confirmed = hash.length > 0 && orderMatches;

    return {
      order: index,
      assetSha256: hash,
      ...(sourceNodeId ? { sourceNodeId } : {}),
      evidenceState: confirmed ? "confirmed" : "legacy",
    };
  });
}
