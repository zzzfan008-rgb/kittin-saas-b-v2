# Data Model: Audit Findings and Release Evidence

## AuditFinding

```ts
type AuditFinding = {
  id: string;
  severity: "P0" | "P1" | "P2" | "P3";
  area: string;
  location: string;
  claim: string;
  evidence: string[];
  reproduction?: string;
  impact: string;
  disposition: "fix" | "redesign" | "accept" | "defer";
  remediationBatch: string;
  verification: string[];
};
```

Validation rules:

- `id` is stable within an audit date and unique in `findings.json`.
- `severity` controls batch order; P0/P1 require a test or an explicit blocked reason.
- `evidence` contains repository-relative paths, command outputs, hashes or test names.
- `reproduction` is required for behavior or security findings.
- `disposition` cannot be `accept` without an impact rationale and user-visible tradeoff.
- `verification` lists commands or manual checks that a reviewer can rerun.

## AuditBaseline

```ts
type AuditBaseline = {
  capturedAt: string;
  repository: string;
  branch: string;
  headSha: string;
  originMainSha: string;
  trackedChangedFiles: number;
  insertions: number;
  deletions: number;
  untrackedEntries: number;
  checks: Array<{ command: string; status: "pass" | "fail" | "blocked"; evidence: string }>;
  externalEvidence: Array<{ path: string; sha256: string; bytes: number; purpose: string }>;
};
```

## ApiyiModelCatalogEvidence

```ts
type ApiyiModelCatalogEvidence = {
  capturedAt: string;
  endpoint: "GET /v1/models";
  httpStatus: number;
  rawExportPath: string;
  rawExportSha256: string | null;
  canonicalIdSetSha256: string | null;
  expectedGatewayModelIds: string[];
  observedGatewayModelIds: string[];
  missingExpectedIds: string[];
  status: "verified" | "fail-closed";
  supportDiff?: string;
};
```

The raw export remains outside the repository. The repository records only redacted metadata and exact fingerprints. A missing raw file or any hash mismatch is a blocking state.

## VerificationRecord

```ts
type VerificationRecord = {
  id: string;
  findingIds: string[];
  command: string;
  status: "pass" | "fail" | "blocked";
  capturedAt: string;
  outputSummary: string;
  noPaidProviderCalls: boolean;
};
```

## Relationships

- One `AuditBaseline` contains many `AuditFinding` records.
- One `AuditFinding` maps to one remediation batch and many `VerificationRecord` entries.
- One `ApiyiModelCatalogEvidence` may be referenced by multiple API易 findings, but its exact hashes must be consistent.
- A release is eligible only when all linked P0/P1 findings are closed and all required verification records pass.
