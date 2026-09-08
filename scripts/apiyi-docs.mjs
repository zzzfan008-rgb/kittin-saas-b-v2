#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const REPO_ROOT = resolve(dirname(SCRIPT_PATH), "..");
const DOCS_ROOT = resolve(REPO_ROOT, "docs/ai/apiyi");
const SOURCES_PATH = resolve(DOCS_ROOT, "sources.json");
const KNOWLEDGE_PATH = resolve(DOCS_ROOT, "model-knowledge.json");
const CONTRACTS_PATH = resolve(DOCS_ROOT, "model-contracts.json");
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const ISO_UTC_MILLISECONDS_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const EVIDENCE_STATUSES = new Set(["unverified", "experimental", "verified", "recommended", "unsupported"]);

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export const MODEL_LIST_HASH_SCOPE = "sha256-canonical-model-id-set-v1";

export function computeModelListHash(payload) {
  return sha256(canonicalJson(extractModelIds(payload).sort()));
}

export const MODEL_CONTRACT_HASH_SCOPE = "sha256-canonical-semantic-envelope-v1";

function withoutMaterializedHash(model) {
  const { contractHash: _contractHash, contractHashScope: _scope, ...semanticModel } = model;
  return semanticModel;
}

/** Hash the reviewed invocation contract plus the exact source fingerprints that justify it. */
export function computeModelContractHash({ contracts, sources, knowledge }, model) {
  const knowledgeModel = ensureArray(knowledge.models).find((item) => item.id === model.id);
  const relevantSourceIds = [...new Set([
    ...ensureArray(knowledgeModel?.vendorCapability?.sourceIds),
    ...ensureArray(knowledgeModel?.gatewayContract?.sourceIds),
  ])].sort();
  const allSources = [...ensureArray(sources.sources), ...ensureArray(sources.vendorSources)];
  const sourceById = new Map(allSources.map((source) => [source.sourceId, source]));
  const sourceFingerprints = relevantSourceIds.map((sourceId) => {
    const source = sourceById.get(sourceId);
    return {
      sourceId,
      sha256: source?.sha256 ?? null,
      fingerprintPolicy: source?.fingerprintPolicy ?? "sha256-body",
    };
  });
  const envelope = {
    scope: MODEL_CONTRACT_HASH_SCOPE,
    contractSchemaVersion: contracts.schemaVersion,
    contractLayer: contracts.contractLayer,
    baseUrl: contracts.baseUrl,
    runtime: contracts.runtime,
    inputNormalization: contracts.inputNormalization,
    model: withoutMaterializedHash(model),
    sourceFingerprints,
  };
  return `sha256:${sha256(canonicalJson(envelope))}`;
}

function sameSet(left, right) {
  return left.length === right.length
    && new Set(left).size === left.length
    && new Set(right).size === right.length
    && left.every((value) => right.includes(value));
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

function isPlainObject(value) {
  return value !== null
    && typeof value === "object"
    && !Array.isArray(value)
    && Object.getPrototypeOf(value) === Object.prototype;
}

function validateModelListStructure(payload) {
  const errors = [];
  if (!isPlainObject(payload)) {
    return {
      ids: [],
      errors: ["gateway model list must be an object with a data array"],
    };
  }
  if (!Array.isArray(payload.data)) {
    return {
      ids: [],
      errors: ["gateway model list data must be an array"],
    };
  }

  const ids = [];
  const seen = new Set();
  for (const [index, row] of payload.data.entries()) {
    if (!isPlainObject(row)) {
      errors.push(`gateway model list data[${index}] must be a plain object`);
      continue;
    }
    if (typeof row.id !== "string" || !row.id.trim()) {
      errors.push(`gateway model list data[${index}].id must be a non-empty string`);
      continue;
    }
    if (seen.has(row.id)) {
      errors.push(`gateway model list contains duplicate id: ${row.id}`);
      continue;
    }
    seen.add(row.id);
    ids.push(row.id);
  }
  return { ids, errors };
}

function isCanonicalIsoUtcTimestamp(value) {
  if (typeof value !== "string" || !ISO_UTC_MILLISECONDS_PATTERN.test(value)) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === value;
}

export function validateDocuments({
  sources,
  knowledge,
  contracts,
  modelList,
  modelListFileSha256,
  requireModelList = false,
}) {
  const errors = [];
  const warnings = [];
  const modelListErrors = [];

  if (sources.schemaVersion < 3) errors.push("sources.json schemaVersion must be >= 3");
  if (knowledge.schemaVersion < 1) errors.push("model-knowledge.json schemaVersion must be >= 1");
  if (contracts.schemaVersion < 3) errors.push("model-contracts.json schemaVersion must be >= 3");
  if (contracts.contractLayer !== "productPolicy") errors.push("model-contracts.json must declare contractLayer=productPolicy");

  const expectedIds = ensureArray(sources.modelCatalog?.expectedGatewayModelIds);
  const contractIds = ensureArray(contracts.models).map((model) => model.id);
  const knowledgeIds = ensureArray(knowledge.models).map((model) => model.id);
  if (expectedIds.length !== 5) errors.push(`expected exactly five gateway model IDs, received ${expectedIds.length}`);
  if (expectedIds.some((id) => typeof id !== "string" || !id.trim())) {
    errors.push("expected gateway model IDs must be non-empty strings");
  }
  if (new Set(expectedIds).size !== expectedIds.length) {
    errors.push("expected gateway model IDs must not contain duplicates");
  }
  if (!sameSet(expectedIds, contractIds)) errors.push("runtime contract model IDs do not match the reviewed five-model catalog");
  if (!sameSet(expectedIds, knowledgeIds)) errors.push("knowledge model IDs do not match the reviewed five-model catalog");

  const sourceIds = new Set();
  for (const source of ensureArray(sources.sources)) {
    const label = source.sourceId || source.markdownUrl || "unknown-source";
    if (!source.sourceId || sourceIds.has(source.sourceId)) errors.push(`gateway source ID is missing or duplicated: ${label}`);
    sourceIds.add(source.sourceId);
    if (source.sourceLayer !== "gatewayContract") errors.push(`${label} must use sourceLayer=gatewayContract`);
    if (!source.capturedAt || Number.isNaN(Date.parse(source.capturedAt))) errors.push(`${label} has invalid capturedAt`);
    if (!SHA256_PATTERN.test(source.sha256 || "")) errors.push(`${label} has invalid SHA-256`);
    if (!("etag" in source) || !("lastModified" in source)) errors.push(`${label} must record ETag and Last-Modified, using null when unavailable`);
    if (!Array.isArray(source.modelAliases) || source.modelAliases.length === 0) errors.push(`${label} has no model aliases`);
    if (!Array.isArray(source.semanticClaims) || source.semanticClaims.length === 0) errors.push(`${label} has no semantic claims`);
  }

  for (const source of ensureArray(sources.vendorSources)) {
    const label = source.sourceId || source.url || "unknown-vendor-source";
    if (!source.sourceId || sourceIds.has(source.sourceId)) errors.push(`vendor source ID is missing or duplicated: ${label}`);
    sourceIds.add(source.sourceId);
    if (source.sourceLayer !== "vendorCapability") errors.push(`${label} must use sourceLayer=vendorCapability`);
    if (!("sha256" in source) || !("etag" in source) || !("lastModified" in source)) {
      errors.push(`${label} must explicitly record fingerprint metadata, using null under manual review policy`);
    }
    if (!source.fingerprintPolicy) errors.push(`${label} has no fingerprint policy`);
    if (!Array.isArray(source.modelAliases) || source.modelAliases.length === 0) errors.push(`${label} has no model aliases`);
    if (!Array.isArray(source.semanticClaims) || source.semanticClaims.length === 0) errors.push(`${label} has no semantic claims`);
  }

  const contractsById = new Map(ensureArray(contracts.models).map((model) => [model.id, model]));
  for (const model of ensureArray(knowledge.models)) {
    const prefix = model.id || "unknown-model";
    for (const layer of ["vendorCapability", "gatewayContract", "productPolicy", "observedEvidence"]) {
      if (!model[layer] || typeof model[layer] !== "object") errors.push(`${prefix} is missing ${layer}`);
    }
    if (!EVIDENCE_STATUSES.has(model.observedEvidence?.status)) errors.push(`${prefix} has invalid observed evidence status`);

    const gatewayModes = ensureArray(model.gatewayContract?.modes);
    const productModes = ensureArray(model.productPolicy?.modes);
    for (const mode of productModes) {
      if (!gatewayModes.includes(mode)) errors.push(`${prefix} product mode ${mode} is not a gateway capability`);
    }
    const gatewayMax = model.gatewayContract?.maxReferences;
    const productMax = model.productPolicy?.maxTotalReferences;
    if (Number.isFinite(gatewayMax) && Number.isFinite(productMax) && productMax > gatewayMax) {
      errors.push(`${prefix} product reference limit ${productMax} exceeds gateway limit ${gatewayMax}`);
    }

    for (const sourceId of [
      ...ensureArray(model.vendorCapability?.sourceIds),
      ...ensureArray(model.gatewayContract?.sourceIds),
    ]) {
      if (!sourceIds.has(sourceId)) errors.push(`${prefix} references unknown source ${sourceId}`);
    }

    const runtime = contractsById.get(model.id);
    if (!runtime) continue;
    const runtimeCatalogBaseline = runtime.reviewedModelCatalogBaseline;
    if (
      runtimeCatalogBaseline?.reviewedExportHashScope !== sources.modelCatalog?.reviewedExportHashScope
      || runtimeCatalogBaseline?.reviewedExportSha256 !== sources.modelCatalog?.reviewedExportSha256
      || runtimeCatalogBaseline?.reviewedRawExportSha256 !== sources.modelCatalog?.reviewedRawExportSha256
      || !sameSet(
        ensureArray(runtimeCatalogBaseline?.expectedGatewayModelIds),
        expectedIds,
      )
    ) {
      errors.push(`${prefix} reviewed model catalog baseline differs from sources.json`);
    }
    const expectedContractHash = computeModelContractHash({ contracts, sources, knowledge }, runtime);
    if (runtime.contractHashScope !== MODEL_CONTRACT_HASH_SCOPE) {
      errors.push(`${prefix} has unsupported contractHashScope`);
    }
    if (runtime.contractHash !== expectedContractHash) {
      errors.push(`${prefix} contractHash does not match its current semantic envelope`);
    }
    if (runtime.gatewayModelId !== model.gatewayContract?.gatewayModelId) {
      errors.push(`${prefix} gateway model ID differs between knowledge and runtime contract`);
    }
    if (runtime.vendorModelId !== model.vendorCapability?.vendorModelId) {
      errors.push(`${prefix} vendor model ID differs between knowledge and runtime contract`);
    }
    const runtimeMax = runtime.edit?.maxReferences;
    if (Number.isFinite(runtimeMax) && runtimeMax !== productMax) {
      errors.push(`${prefix} runtime maxReferences ${runtimeMax} does not equal product maxTotalReferences ${productMax}`);
    }
    if (!sameSet(ensureArray(runtime.allowedNodeKinds), ensureArray(model.productPolicy?.allowedNodeKinds))) {
      errors.push(`${prefix} runtime allowedNodeKinds differs from product policy`);
    }
    if (runtime.evidenceStatus !== model.observedEvidence?.status) {
      errors.push(`${prefix} runtime evidence status differs from knowledge evidence status`);
    }
  }

  const reviewedModelListHash = sources.modelCatalog?.reviewedExportSha256;
  const reviewedRawModelListHash = sources.modelCatalog?.reviewedRawExportSha256;
  const reviewedModelListScope = sources.modelCatalog?.reviewedExportHashScope;
  const reviewedModelListCapturedAt = sources.modelCatalog?.reviewedExportCapturedAt;
  const canonicalBaselineIsNull = reviewedModelListHash === null;
  const rawBaselineIsNull = reviewedRawModelListHash === null;
  if (reviewedModelListScope !== MODEL_LIST_HASH_SCOPE) {
    errors.push(`sources.json reviewedExportHashScope must be ${MODEL_LIST_HASH_SCOPE}`);
  }
  if (!canonicalBaselineIsNull && !SHA256_PATTERN.test(reviewedModelListHash || "")) {
    errors.push("sources.json reviewedExportSha256 must be a lowercase SHA-256 or explicit null");
  }
  if (!rawBaselineIsNull && !SHA256_PATTERN.test(reviewedRawModelListHash || "")) {
    errors.push("sources.json reviewedRawExportSha256 must be a lowercase SHA-256 or explicit null");
  }
  if (canonicalBaselineIsNull !== rawBaselineIsNull) {
    errors.push("canonical and raw reviewed gateway model list fingerprints must be approved together");
  }
  if (canonicalBaselineIsNull) {
    if (reviewedModelListCapturedAt !== null) {
      errors.push("sources.json reviewedExportCapturedAt must be null while the reviewed fingerprints are null");
    }
  } else if (!isCanonicalIsoUtcTimestamp(reviewedModelListCapturedAt)) {
    errors.push(
      "sources.json reviewedExportCapturedAt must use canonical ISO 8601 UTC milliseconds format YYYY-MM-DDTHH:mm:ss.sssZ",
    );
  }

  const knowledgeCatalogBaseline = knowledge.reviewedModelCatalogBaseline;
  if (!knowledgeCatalogBaseline || typeof knowledgeCatalogBaseline !== "object") {
    errors.push("model-knowledge.json is missing reviewedModelCatalogBaseline");
  } else if (
    knowledgeCatalogBaseline.reviewedExportHashScope !== reviewedModelListScope
    || knowledgeCatalogBaseline.reviewedExportSha256 !== reviewedModelListHash
    || knowledgeCatalogBaseline.rawExportFileSha256 !== reviewedRawModelListHash
    || knowledgeCatalogBaseline.capturedAt !== reviewedModelListCapturedAt
    || !sameSet(
      ensureArray(knowledgeCatalogBaseline.expectedGatewayModelIds),
      expectedIds,
    )
  ) {
    errors.push("model-knowledge.json reviewed model catalog baseline differs from sources.json");
  }
  if (requireModelList && modelList === undefined) {
    modelListErrors.push("gateway model list evidence is required; pass --model-list or APIYI_MODELS_EXPORT");
  }
  if (requireModelList && !SHA256_PATTERN.test(reviewedModelListHash || "")) {
    modelListErrors.push("sources.json has no human-reviewed gateway model list baseline; release remains blocked");
  }
  if (requireModelList && !SHA256_PATTERN.test(reviewedRawModelListHash || "")) {
    modelListErrors.push("sources.json has no human-reviewed raw gateway model list fingerprint; release remains blocked");
  }
  if (reviewedModelListHash && reviewedModelListScope !== MODEL_LIST_HASH_SCOPE) {
    modelListErrors.push(`unsupported gateway model list hash scope: ${reviewedModelListScope ?? "missing"}`);
  }
  if (modelList !== undefined) {
    const structure = validateModelListStructure(modelList);
    modelListErrors.push(...structure.errors);
    if (structure.errors.length === 0) {
      const available = structure.ids;
      for (const id of expectedIds) {
        if (!available.includes(id)) modelListErrors.push(`reviewed gateway model list is missing ${id}`);
      }
      const unreviewed = available.filter((id) => !expectedIds.includes(id));
      if (unreviewed.length > 0) warnings.push(`gateway model list contains unreviewed candidates: ${unreviewed.sort().join(", ")}`);
      if (
        reviewedModelListHash
        && computeModelListHash(modelList) !== reviewedModelListHash
      ) {
        modelListErrors.push("gateway model list fingerprint drifted from its human-reviewed baseline");
      }
    }
    if (requireModelList && !SHA256_PATTERN.test(modelListFileSha256 || "")) {
      modelListErrors.push("gateway model list raw file fingerprint is required");
    } else if (
      reviewedRawModelListHash
      && modelListFileSha256
      && modelListFileSha256 !== reviewedRawModelListHash
    ) {
      modelListErrors.push("gateway model list raw file fingerprint drifted from its human-reviewed baseline");
    }
  }

  return {
    errors,
    modelListErrors,
    warnings,
    contractHash: sha256(canonicalJson(contracts.models)),
    expectedModelIds: expectedIds,
  };
}

function extractModelIds(payload) {
  const structure = validateModelListStructure(payload);
  if (structure.errors.length > 0) {
    throw new Error(`invalid gateway model list structure: ${structure.errors.join("; ")}`);
  }
  return structure.ids;
}

async function loadJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function loadDocuments(modelListPath) {
  const [sources, knowledge, contracts, modelListBytes] = await Promise.all([
    loadJson(SOURCES_PATH),
    loadJson(KNOWLEDGE_PATH),
    loadJson(CONTRACTS_PATH),
    modelListPath ? readFile(modelListPath) : Promise.resolve(undefined),
  ]);
  const modelList = modelListBytes === undefined
    ? undefined
    : JSON.parse(modelListBytes.toString("utf8"));
  const modelListFileSha256 = modelListBytes === undefined ? undefined : sha256(modelListBytes);
  return { sources, knowledge, contracts, modelList, modelListFileSha256 };
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

async function fetchFingerprint(source) {
  try {
    const response = await fetch(source.markdownUrl, {
      headers: { "user-agent": "garment-canvas-apiyi-contract-check/1.0" },
      redirect: "follow",
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      return { sourceId: source.sourceId, ok: false, status: response.status, error: `HTTP ${response.status}` };
    }
    const body = Buffer.from(await response.arrayBuffer());
    return {
      sourceId: source.sourceId,
      ok: true,
      status: response.status,
      oldSha256: source.sha256,
      newSha256: sha256(body),
      etag: response.headers.get("etag"),
      lastModified: response.headers.get("last-modified"),
      modelAliases: source.modelAliases,
      semanticClaims: source.semanticClaims,
    };
  } catch (error) {
    return { sourceId: source.sourceId, ok: false, status: null, error: error instanceof Error ? error.message : String(error) };
  }
}

export function buildRefreshReport({ sources, observations, contractHash }) {
  const sourceById = new Map(ensureArray(sources.sources).map((source) => [source.sourceId, source]));
  const changes = observations
    .filter((item) => item.ok && item.oldSha256 !== item.newSha256)
    .map((item) => ({
      sourceId: item.sourceId,
      markdownUrl: sourceById.get(item.sourceId)?.markdownUrl,
      oldSha256: item.oldSha256,
      candidateSha256: item.newSha256,
      candidateHttpMetadata: { etag: item.etag, lastModified: item.lastModified },
      affectedModelAliases: item.modelAliases,
      semanticReviewChecklist: item.semanticClaims,
      reviewStatus: "needs-human-review",
    }));
  const failures = observations
    .filter((item) => !item.ok)
    .map((item) => ({ sourceId: item.sourceId, status: item.status, error: item.error }));
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    mode: "review-candidate-only",
    baselineCapturedAt: sources.capturedAt,
    baselineContractHash: contractHash,
    productionFilesModified: false,
    automaticContractUpdateAllowed: false,
    changes,
    failures,
    requiredNextStep:
      changes.length > 0
        ? "Review each semantic claim, update the curated contract explicitly, then rerun all affected evaluations."
        : "No source-body drift detected; keep the current reviewed contract.",
  };
}

function parseArgs(argv) {
  const [command = "check", ...rest] = argv;
  const options = { command, offline: false, out: undefined, modelList: undefined };
  for (let index = 0; index < rest.length; index += 1) {
    const value = rest[index];
    if (value === "--offline") options.offline = true;
    else if (value === "--out") options.out = rest[++index];
    else if (value.startsWith("--out=")) options.out = value.slice("--out=".length);
    else if (value === "--model-list") options.modelList = rest[++index];
    else if (value.startsWith("--model-list=")) options.modelList = value.slice("--model-list=".length);
    else throw new Error(`Unknown argument: ${value}`);
  }
  if (!new Set(["check", "refresh"]).has(options.command)) throw new Error(`Unknown command: ${options.command}`);
  if (options.command === "refresh" && options.offline) throw new Error("refresh requires network access; use check --offline for structural validation");
  options.modelList ??= process.env.APIYI_MODELS_EXPORT;
  if (options.modelList) options.modelList = isAbsolute(options.modelList) ? options.modelList : resolve(REPO_ROOT, options.modelList);
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const documents = await loadDocuments(options.modelList);
  const validation = validateDocuments({
    ...documents,
    requireModelList: options.command === "check" && !options.offline,
  });
  for (const warning of validation.warnings) console.warn(`warning: ${warning}`);
  if (validation.errors.length > 0) {
    for (const error of validation.errors) console.error(`error: ${error}`);
    process.exitCode = 1;
    return;
  }

  console.log(`structure: ok; models=${validation.expectedModelIds.length}; contractHash=${validation.contractHash}`);
  if (options.offline) {
    if (options.modelList && validation.modelListErrors.length > 0) {
      for (const error of validation.modelListErrors) console.error(`error: ${error}`);
      process.exitCode = 1;
      return;
    }
    console.log("network: skipped (--offline); gateway model list: not current-verified; paid provider calls: 0");
    return;
  }

  const observations = await mapWithConcurrency(documents.sources.sources, 4, fetchFingerprint);
  const report = buildRefreshReport({
    sources: documents.sources,
    observations,
    contractHash: validation.contractHash,
  });

  if (options.command === "refresh") {
    const defaultName = `apiyi-refresh-${new Date().toISOString().replaceAll(":", "-")}.json`;
    const outPath = options.out
      ? isAbsolute(options.out)
        ? options.out
        : resolve(REPO_ROOT, options.out)
      : resolve(DOCS_ROOT, "candidates", defaultName);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    console.log(`candidate report: ${outPath}`);
    console.log(`drifted sources: ${report.changes.length}; fetch failures: ${report.failures.length}`);
    if (report.changes.length > 0 || report.failures.length > 0) process.exitCode = 2;
    return;
  }

  for (const failure of report.failures) console.error(`error: ${failure.sourceId}: ${failure.error}`);
  for (const change of report.changes) {
    console.error(`drift: ${change.sourceId}: ${change.oldSha256} -> ${change.candidateSha256}`);
  }
  if (report.failures.length === 0 && report.changes.length === 0) {
    console.log(`source fingerprints: ok (${observations.length})`);
  }
  for (const error of validation.modelListErrors) console.error(`release blocker: ${error}`);
  if (report.failures.length > 0 || report.changes.length > 0 || validation.modelListErrors.length > 0) {
    console.error("API易发布契约检查未通过；本命令未修改任何生产契约。");
    process.exitCode = 2;
    return;
  }
  console.log("gateway model list: ok; paid provider calls: 0");
}

if (process.argv[1] && resolve(process.argv[1]) === SCRIPT_PATH) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.stack : String(error));
    process.exitCode = 1;
  });
}
