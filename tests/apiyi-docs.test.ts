import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import {
  MODEL_CONTRACT_HASH_SCOPE,
  MODEL_LIST_HASH_SCOPE,
  buildRefreshReport,
  computeModelListHash,
  computeModelContractHash,
  sha256,
  validateDocuments,
} from "../scripts/apiyi-docs.mjs";
import {
  IMAGE_MODEL_IDS,
  getImageModelContract,
  imageModelContractHash,
} from "../src/types/imageModels";

const repoRoot = resolve(import.meta.dirname, "..");
const docsRoot = resolve(repoRoot, "docs/ai/apiyi");
const readJson = (name: string) => JSON.parse(readFileSync(resolve(docsRoot, name), "utf8"));

const sources = readJson("sources.json");
const knowledge = readJson("model-knowledge.json");
const contracts = readJson("model-contracts.json");
const REVIEWED_MODEL_LIST_SHA256 = "43b6914c1328f07599468e9129d18ba7966293cf73144b4a722c9494a2c8636d";
const REVIEWED_RAW_MODEL_LIST_SHA256 = "7d5348336bbe5ac63a34107a506e3c5c72340064608c11193602df65c4327408";
const REVIEWED_MODEL_LIST_CAPTURED_AT = "2026-09-03T13:22:48.000Z";

const validation = validateDocuments({ sources, knowledge, contracts });
assert.deepEqual(validation.errors, [], validation.errors.join("\n"));
assert.equal(validation.expectedModelIds.length, 5);
assert.match(validation.contractHash, /^[a-f0-9]{64}$/);
assert.equal(sources.modelCatalog.reviewedExportHashScope, MODEL_LIST_HASH_SCOPE);
assert.equal(sources.modelCatalog.reviewedExportSha256, REVIEWED_MODEL_LIST_SHA256);
assert.equal(sources.modelCatalog.reviewedRawExportSha256, REVIEWED_RAW_MODEL_LIST_SHA256);
assert.equal(sources.modelCatalog.reviewedExportCapturedAt, REVIEWED_MODEL_LIST_CAPTURED_AT);
assert.equal(
  knowledge.reviewedModelCatalogBaseline.rawExportFileSha256,
  REVIEWED_RAW_MODEL_LIST_SHA256,
  "the runtime raw baseline must match the retained human-review evidence",
);

const strictWithoutEvidence = validateDocuments({
  sources,
  knowledge,
  contracts,
  requireModelList: true,
});
assert.deepEqual(strictWithoutEvidence.errors, []);
assert.ok(strictWithoutEvidence.modelListErrors.some((error: string) => /model list evidence is required/.test(error)));
assert.equal(
  strictWithoutEvidence.modelListErrors.some((error: string) => /no human-reviewed gateway model list baseline/.test(error)),
  false,
  "an approved baseline does not replace the required current model-list input",
);

const syntheticModelListBytes = Buffer.from(`${JSON.stringify({
  data: validation.expectedModelIds.map((id: string) => ({ id })),
})}\n`, "utf8");
const modelList = JSON.parse(syntheticModelListBytes.toString("utf8"));
const modelListFileSha256 = sha256(syntheticModelListBytes);
const syntheticCapturedAt = "2026-09-03T09:00:00.000Z";
const reviewedModelSources = structuredClone(sources);
Object.assign(reviewedModelSources.modelCatalog, {
  reviewedExportHashScope: MODEL_LIST_HASH_SCOPE,
  reviewedExportSha256: computeModelListHash(modelList),
  reviewedRawExportSha256: modelListFileSha256,
  reviewedExportCapturedAt: syntheticCapturedAt,
});
const reviewedModelKnowledge = structuredClone(knowledge);
Object.assign(reviewedModelKnowledge.reviewedModelCatalogBaseline, {
  capturedAt: syntheticCapturedAt,
  expectedGatewayModelIds: [...reviewedModelSources.modelCatalog.expectedGatewayModelIds],
  requiredModelCoverage: { present: 5, required: 5 },
  modelCount: modelList.data.length,
  rawExportByteLength: syntheticModelListBytes.length,
  rawExportFileSha256: modelListFileSha256,
  reviewedExportHashScope: reviewedModelSources.modelCatalog.reviewedExportHashScope,
  reviewedExportSha256: reviewedModelSources.modelCatalog.reviewedExportSha256,
});
const reviewedModelContracts = structuredClone(contracts);
for (const model of reviewedModelContracts.models) {
  Object.assign(model.reviewedModelCatalogBaseline, {
    reviewedExportHashScope: reviewedModelSources.modelCatalog.reviewedExportHashScope,
    reviewedExportSha256: reviewedModelSources.modelCatalog.reviewedExportSha256,
    reviewedRawExportSha256: reviewedModelSources.modelCatalog.reviewedRawExportSha256,
    expectedGatewayModelIds: [...reviewedModelSources.modelCatalog.expectedGatewayModelIds],
  });
  model.contractHash = computeModelContractHash({
    sources: reviewedModelSources,
    knowledge: reviewedModelKnowledge,
    contracts: reviewedModelContracts,
  }, model);
}
const strictModelValidation = validateDocuments({
  sources: reviewedModelSources,
  knowledge: reviewedModelKnowledge,
  contracts: reviewedModelContracts,
  modelList,
  modelListFileSha256,
  requireModelList: true,
});
assert.deepEqual(strictModelValidation.errors, []);
assert.deepEqual(strictModelValidation.modelListErrors, []);

const malformedModelLists: Array<[string, unknown, RegExp]> = [
  [
    "top-level array",
    validation.expectedModelIds,
    /must be an object with a data array/,
  ],
  [
    "string row",
    { data: validation.expectedModelIds },
    /data\[0\] must be a plain object/,
  ],
  [
    "empty object row",
    { data: [...modelList.data, {}] },
    /\.id must be a non-empty string/,
  ],
  [
    "duplicate id",
    { data: [...modelList.data, { id: modelList.data[0].id }] },
    /contains duplicate id/,
  ],
];
for (const [label, malformedModelList, expectedError] of malformedModelLists) {
  const malformedValidation = validateDocuments({
    sources: reviewedModelSources,
    knowledge: reviewedModelKnowledge,
    contracts: reviewedModelContracts,
    modelList: malformedModelList,
    modelListFileSha256,
    requireModelList: true,
  });
  assert.ok(
    malformedValidation.modelListErrors.some((error: string) => expectedError.test(error)),
    `${label} must fail gateway model list structural validation`,
  );
}

const sameIdsDifferentRawBytes = Buffer.from(JSON.stringify(modelList, null, 2));
const rawDriftValidation = validateDocuments({
  sources: reviewedModelSources,
  knowledge: reviewedModelKnowledge,
  contracts: reviewedModelContracts,
  modelList,
  modelListFileSha256: sha256(sameIdsDifferentRawBytes),
  requireModelList: true,
});
assert.ok(
  rawDriftValidation.modelListErrors.some((error: string) => /raw file fingerprint drifted/.test(error)),
  "the exact reviewed bytes must be required even when the canonical model IDs are unchanged",
);

const invalidCanonicalSources = structuredClone(reviewedModelSources);
const invalidCanonicalKnowledge = structuredClone(reviewedModelKnowledge);
const invalidCanonicalContracts = structuredClone(reviewedModelContracts);
invalidCanonicalSources.modelCatalog.reviewedExportSha256 = "not-a-sha256";
invalidCanonicalKnowledge.reviewedModelCatalogBaseline.reviewedExportSha256 = "not-a-sha256";
for (const model of invalidCanonicalContracts.models) {
  model.reviewedModelCatalogBaseline.reviewedExportSha256 = "not-a-sha256";
  model.contractHash = computeModelContractHash({
    sources: invalidCanonicalSources,
    knowledge: invalidCanonicalKnowledge,
    contracts: invalidCanonicalContracts,
  }, model);
}
const invalidCanonicalValidation = validateDocuments({
  sources: invalidCanonicalSources,
  knowledge: invalidCanonicalKnowledge,
  contracts: invalidCanonicalContracts,
});
assert.ok(
  invalidCanonicalValidation.errors.some((error: string) => /reviewedExportSha256 must be a lowercase SHA-256/.test(error)),
  "canonical baseline format must fail structural validation even in offline mode",
);

const invalidScopeSources = structuredClone(reviewedModelSources);
const invalidScopeKnowledge = structuredClone(reviewedModelKnowledge);
const invalidScopeContracts = structuredClone(reviewedModelContracts);
invalidScopeSources.modelCatalog.reviewedExportHashScope = "unsupported-scope";
invalidScopeKnowledge.reviewedModelCatalogBaseline.reviewedExportHashScope = "unsupported-scope";
for (const model of invalidScopeContracts.models) {
  model.reviewedModelCatalogBaseline.reviewedExportHashScope = "unsupported-scope";
  model.contractHash = computeModelContractHash({
    sources: invalidScopeSources,
    knowledge: invalidScopeKnowledge,
    contracts: invalidScopeContracts,
  }, model);
}
const invalidScopeValidation = validateDocuments({
  sources: invalidScopeSources,
  knowledge: invalidScopeKnowledge,
  contracts: invalidScopeContracts,
});
assert.ok(
  invalidScopeValidation.errors.some((error: string) => /reviewedExportHashScope must be/.test(error)),
  "canonical baseline scope must fail structural validation even in offline mode",
);

const knowledgeBaselineDrifts: Array<[string, (baseline: Record<string, unknown>) => void]> = [
  ["scope", (baseline) => { baseline.reviewedExportHashScope = "unsupported-scope"; }],
  ["canonical hash", (baseline) => { baseline.reviewedExportSha256 = "a".repeat(64); }],
  ["raw hash", (baseline) => { baseline.rawExportFileSha256 = "b".repeat(64); }],
  ["expected IDs", (baseline) => {
    const expectedIds = [...(baseline.expectedGatewayModelIds as string[])];
    expectedIds[0] = expectedIds[1];
    baseline.expectedGatewayModelIds = expectedIds;
  }],
  ["capturedAt", (baseline) => { baseline.capturedAt = "2026-09-03T09:00:01.000Z"; }],
];
for (const [label, mutate] of knowledgeBaselineDrifts) {
  const driftedKnowledge = structuredClone(reviewedModelKnowledge);
  mutate(driftedKnowledge.reviewedModelCatalogBaseline);
  const driftValidation = validateDocuments({
    sources: reviewedModelSources,
    knowledge: driftedKnowledge,
    contracts: reviewedModelContracts,
  });
  assert.ok(
    driftValidation.errors.some((error: string) => /model-knowledge\.json reviewed model catalog baseline differs/.test(error)),
    `knowledge ${label} drift must fail structural validation`,
  );
}

for (const capturedAt of [
  "2026-09-03",
  "September 3, 2026",
  "2026-09-03T08:12:22",
  "2026-02-30T08:12:22.094Z",
]) {
  const invalidCapturedAtSources = structuredClone(reviewedModelSources);
  const invalidCapturedAtKnowledge = structuredClone(reviewedModelKnowledge);
  invalidCapturedAtSources.modelCatalog.reviewedExportCapturedAt = capturedAt;
  invalidCapturedAtKnowledge.reviewedModelCatalogBaseline.capturedAt = capturedAt;
  const invalidCapturedAtValidation = validateDocuments({
    sources: invalidCapturedAtSources,
    knowledge: invalidCapturedAtKnowledge,
    contracts: reviewedModelContracts,
  });
  assert.ok(
    invalidCapturedAtValidation.errors.some((error: string) => /canonical ISO 8601 UTC milliseconds format/.test(error)),
    `${capturedAt} must not pass as a canonical reviewedExportCapturedAt`,
  );
}

const duplicateExpectedSources = structuredClone(reviewedModelSources);
duplicateExpectedSources.modelCatalog.expectedGatewayModelIds[0] = duplicateExpectedSources.modelCatalog.expectedGatewayModelIds[1];
assert.ok(
  validateDocuments({
    sources: duplicateExpectedSources,
    knowledge: reviewedModelKnowledge,
    contracts: reviewedModelContracts,
  }).errors.some((error: string) => /must not contain duplicates/.test(error)),
  "duplicate expected gateway IDs must fail structural validation",
);
const omittedExpectedSources = structuredClone(reviewedModelSources);
omittedExpectedSources.modelCatalog.expectedGatewayModelIds = omittedExpectedSources.modelCatalog.expectedGatewayModelIds.slice(1);
assert.ok(
  validateDocuments({
    sources: omittedExpectedSources,
    knowledge: reviewedModelKnowledge,
    contracts: reviewedModelContracts,
  }).errors.some((error: string) => /expected exactly five gateway model IDs/.test(error)),
  "omitted expected gateway IDs must fail structural validation",
);

const nullBaselineSources = structuredClone(reviewedModelSources);
Object.assign(nullBaselineSources.modelCatalog, {
  reviewedExportSha256: null,
  reviewedRawExportSha256: null,
  reviewedExportCapturedAt: null,
});
const nullBaselineKnowledge = structuredClone(reviewedModelKnowledge);
Object.assign(nullBaselineKnowledge.reviewedModelCatalogBaseline, {
  capturedAt: null,
  rawExportFileSha256: null,
  reviewedExportSha256: null,
});
const nullBaselineContracts = structuredClone(reviewedModelContracts);
for (const model of nullBaselineContracts.models) {
  model.reviewedModelCatalogBaseline.reviewedExportSha256 = null;
  model.reviewedModelCatalogBaseline.reviewedRawExportSha256 = null;
  model.contractHash = computeModelContractHash({
    sources: nullBaselineSources,
    knowledge: nullBaselineKnowledge,
    contracts: nullBaselineContracts,
  }, model);
}
const nullBaselineValidation = validateDocuments({
  sources: nullBaselineSources,
  knowledge: nullBaselineKnowledge,
  contracts: nullBaselineContracts,
  modelList,
  modelListFileSha256,
  requireModelList: true,
});
assert.deepEqual(nullBaselineValidation.errors, []);
assert.ok(
  nullBaselineValidation.modelListErrors.some((error: string) => /no human-reviewed gateway model list baseline/.test(error)),
  "a synchronized null baseline must remain release-blocking",
);
assert.ok(
  nullBaselineValidation.modelListErrors.some((error: string) => /no human-reviewed raw gateway model list fingerprint/.test(error)),
  "a synchronized null raw baseline must remain release-blocking",
);

const unpairedBaselineSources = structuredClone(reviewedModelSources);
unpairedBaselineSources.modelCatalog.reviewedRawExportSha256 = null;
assert.ok(
  validateDocuments({
    sources: unpairedBaselineSources,
    knowledge: reviewedModelKnowledge,
    contracts: reviewedModelContracts,
  }).errors.some((error: string) => /must be approved together/.test(error)),
  "canonical and raw baselines must never be accepted independently",
);

const missingExactModelList = { data: modelList.data.slice(1) };
const missingExactValidation = validateDocuments({
  sources: reviewedModelSources,
  knowledge: reviewedModelKnowledge,
  contracts: reviewedModelContracts,
  modelList: missingExactModelList,
  requireModelList: true,
});
assert.ok(
  missingExactValidation.modelListErrors.some((error: string) => /reviewed gateway model list is missing gpt-image-2/.test(error)),
  "a reviewed export must retain every exact five-model gateway ID",
);

const driftedModelList = { data: [...modelList.data, { id: "unreviewed-new-model" }] };
const driftedModelValidation = validateDocuments({
  sources: reviewedModelSources,
  knowledge: reviewedModelKnowledge,
  contracts: reviewedModelContracts,
  modelList: driftedModelList,
  requireModelList: true,
});
assert.ok(
  driftedModelValidation.modelListErrors.some((error: string) => /model list fingerprint drifted/.test(error)),
  "any additional catalog ID must change the full canonical model-set fingerprint",
);
assert.ok(
  driftedModelValidation.warnings.some((warning: string) => /unreviewed-new-model/.test(warning)),
  "additional IDs remain visible for human review even though drift is already blocking",
);

const tempModelListRoot = mkdtempSync(join(tmpdir(), "apiyi-docs-model-list-"));
try {
  const tempModelListPath = join(tempModelListRoot, "models.json");
  writeFileSync(tempModelListPath, syntheticModelListBytes);
  assert.notEqual(
    sha256(readFileSync(tempModelListPath)),
    REVIEWED_RAW_MODEL_LIST_SHA256,
    "the CLI fixture must differ byte-for-byte from the reviewed raw export",
  );
  const cliRawDrift = spawnSync(
    process.execPath,
    [resolve(repoRoot, "scripts/apiyi-docs.mjs"), "check", "--offline", "--model-list", tempModelListPath],
    { cwd: repoRoot, encoding: "utf8" },
  );
  assert.equal(cliRawDrift.status, 1, cliRawDrift.stderr || cliRawDrift.stdout);
  assert.match(
    cliRawDrift.stderr,
    /gateway model list raw file fingerprint drifted from its human-reviewed baseline/,
    "check --offline --model-list must hash the bytes read from the supplied file",
  );

  for (const [index, [label, malformedModelList, expectedError]] of malformedModelLists.entries()) {
    const malformedPath = join(tempModelListRoot, `malformed-${index}.json`);
    writeFileSync(malformedPath, `${JSON.stringify(malformedModelList)}\n`);
    const cliMalformed = spawnSync(
      process.execPath,
      [resolve(repoRoot, "scripts/apiyi-docs.mjs"), "check", "--offline", "--model-list", malformedPath],
      { cwd: repoRoot, encoding: "utf8" },
    );
    assert.equal(cliMalformed.status, 1, `${label}: ${cliMalformed.stderr || cliMalformed.stdout}`);
    assert.match(
      cliMalformed.stderr,
      expectedError,
      `${label} must fail through the CLI modelListErrors path`,
    );
  }
} finally {
  rmSync(tempModelListRoot, { recursive: true, force: true });
}

for (const modelId of IMAGE_MODEL_IDS) {
  const documentContract = contracts.models.find((model: { id: string }) => model.id === modelId);
  assert.ok(documentContract, `${modelId} materialized contract missing`);
  const expectedHash = computeModelContractHash({ sources, knowledge, contracts }, documentContract);
  assert.equal(documentContract.contractHashScope, MODEL_CONTRACT_HASH_SCOPE);
  assert.match(documentContract.contractHash, /^sha256:[a-f0-9]{64}$/);
  assert.equal(
    documentContract.contractHash,
    expectedHash,
    `${modelId} materialized hash must match its canonical semantic envelope`,
  );
  assert.equal(
    getImageModelContract(modelId).contractHash,
    expectedHash,
    `${modelId} runtime contract must expose the reviewed document hash`,
  );
  assert.equal(imageModelContractHash(modelId), expectedHash);
}

const driftedSources = structuredClone(sources);
const vipSource = driftedSources.sources.find(
  (source: { sourceId: string }) => source.sourceId === "apiyi-gpt-image-2-vip-overview",
);
assert.ok(vipSource);
vipSource.sha256 = "f".repeat(64);
const vipDocumentContract = contracts.models.find(
  (model: { id: string }) => model.id === "gpt-image-2-vip",
);
const fluxDocumentContract = contracts.models.find(
  (model: { id: string }) => model.id === "flux-2-pro",
);
assert.notEqual(
  computeModelContractHash({ sources: driftedSources, knowledge, contracts }, vipDocumentContract),
  imageModelContractHash("gpt-image-2-vip"),
  "a linked gateway source drift must invalidate only the affected semantic contract envelope",
);
assert.equal(
  computeModelContractHash({ sources: driftedSources, knowledge, contracts }, fluxDocumentContract),
  imageModelContractHash("flux-2-pro"),
  "an unrelated source drift must not invalidate another model contract",
);

for (const model of knowledge.models) {
  assert.ok(model.vendorCapability, `${model.id} vendorCapability missing`);
  assert.ok(model.gatewayContract, `${model.id} gatewayContract missing`);
  assert.ok(model.productPolicy, `${model.id} productPolicy missing`);
  assert.ok(model.observedEvidence, `${model.id} observedEvidence missing`);
  assert.ok(
    model.productPolicy.maxTotalReferences <= model.gatewayContract.maxReferences,
    `${model.id} product reference limit exceeds gateway contract`,
  );
  assert.equal(model.observedEvidence.status, "unverified");
}

const reviewedDriftHashes = new Map([
  ["apiyi-gpt-image-2-vip-overview", "2ed97c1500398dc939bd6b77e8e121227ef3906b1ae6a794658f1e75f967fdd0"],
  ["apiyi-gemini-overview", "d3469a7e4587c9b23582e3e461c30364bf1af0a58f8118171bc0e010dd2be844"],
  ["apiyi-flux-overview", "1fc1c26bcaebc3de7d81e0bba95f457537babf223bf99a3a7cc32a90745984e3"],
  ["apiyi-seedream-overview", "a0c84cf7d8cf2b4e736fd03392eb36a6db2604eeb2207fc9578f7f0922a476da"],
]);
for (const [sourceId, expectedHash] of reviewedDriftHashes) {
  assert.equal(sources.sources.find((source: { sourceId: string }) => source.sourceId === sourceId)?.sha256, expectedHash);
}

const sourceSnapshot = JSON.stringify(sources);
const fakeSource = sources.sources[0];
const report = buildRefreshReport({
  sources,
  contractHash: validation.contractHash,
  observations: [
    {
      sourceId: fakeSource.sourceId,
      ok: true,
      oldSha256: fakeSource.sha256,
      newSha256: "f".repeat(64),
      etag: '"candidate"',
      lastModified: "Wed, 02 Sep 2026 00:00:00 GMT",
      modelAliases: fakeSource.modelAliases,
      semanticClaims: fakeSource.semanticClaims,
    },
  ],
});
assert.equal(report.productionFilesModified, false);
assert.equal(report.automaticContractUpdateAllowed, false);
assert.equal(report.changes[0].reviewStatus, "needs-human-review");
assert.deepEqual(report.changes[0].semanticReviewChecklist, fakeSource.semanticClaims);
assert.equal(JSON.stringify(sources), sourceSnapshot, "refresh report builder mutated the production source manifest");

const offlineOutput = execFileSync(process.execPath, [resolve(repoRoot, "scripts/apiyi-docs.mjs"), "check", "--offline"], {
  cwd: repoRoot,
  encoding: "utf8",
});
assert.match(offlineOutput, /structure: ok; models=5/);
assert.match(offlineOutput, /gateway model list: not current-verified/);
assert.match(offlineOutput, /paid provider calls: 0/);

console.log("apiyi docs contract tests passed");
