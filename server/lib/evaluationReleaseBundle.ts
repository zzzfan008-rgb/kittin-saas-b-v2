import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { PROMPT_EVALUATION_STAGE_ORDER } from "../../src/lib/promptEvaluation";
import { getGarmentPromptVariantById } from "../../src/lib/garmentPromptPresets";
import type {
  PromptEvaluationRelease,
  PromptEvaluationReleaseRegistry,
} from "../../src/lib/promptEvaluationReleaseRegistry";
import { validatePromptEvaluationReleaseRegistry } from "../../src/lib/promptEvaluationReleaseRegistry";
import {
  assertStageCampaignClosureBinding,
  assertStageAuthorizationUnitKeyConsistent,
  assertStageCaseIdentityDisjoint,
  evaluationArtifactSha256,
  parseEvaluationGateReceiptStructure,
  parseEvaluationPromotionArtifactStructure,
  validateEvaluationContractCheckArtifact,
  type EvaluationContractCheckArtifact,
  type EvaluationGateReceipt,
  type EvaluationPromotionArtifact,
} from "./evaluationPromotion";
import {
  assertEvaluationCampaignReady,
  validateEvaluationCampaignClosure,
  type EvaluationCampaignClosure,
} from "./evaluationCampaign";

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const CODE_SHA_PATTERN = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/;
const REGISTRY_FILENAME = "prompt-release-registry.json";

export const EVALUATION_RELEASE_BUNDLE_HASH_SCOPE =
  "sha256-canonical-evaluation-release-file-set-v1" as const;

export interface EvaluationReleaseModelCatalogBaseline {
  reviewedExportHashScope: "sha256-canonical-model-id-set-v1";
  reviewedExportSha256: string;
  reviewedRawExportSha256: string;
  expectedGatewayModelIds: readonly string[];
}

export interface EvaluationReleaseBundleVerificationInput {
  releaseRoot: string;
  registryPath: string;
  registry: PromptEvaluationReleaseRegistry;
  codeSha: string;
  modelCatalogBaseline: EvaluationReleaseModelCatalogBaseline;
}

export interface EvaluationReleaseBundleVerificationResult {
  bundleSha256: string;
  files: readonly { path: string; sha256: string }[];
}

interface VerificationState {
  readonly files: Map<string, string>;
  readonly receipts: Map<string, EvaluationGateReceipt>;
  readonly contracts: Map<string, EvaluationContractCheckArtifact>;
  readonly campaignClosures: Map<string, EvaluationCampaignClosure>;
  readonly activeReceipts: Set<string>;
}

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function canonicalEqual(left: unknown, right: unknown): boolean {
  return evaluationArtifactSha256(left) === evaluationArtifactSha256(right);
}

function isPathInside(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return relative === ""
    || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function pathSegments(absolutePath: string): readonly string[] {
  const root = path.parse(absolutePath).root;
  const segments = absolutePath.slice(root.length).split(path.sep).filter(Boolean);
  const paths = [root];
  for (const segment of segments) paths.push(path.join(paths.at(-1)!, segment));
  return paths;
}

/**
 * Read bytes only after every path component has been proven to be a real
 * directory and the leaf a regular file. The descriptor/inode comparison also
 * closes the common leaf-swap gap between lstat and read.
 */
export function readRegularFileWithoutSymlinkAncestors(
  filename: string,
  field: string,
): Buffer {
  if (!path.isAbsolute(filename)) throw new Error(`${field} must use an absolute path`);
  const resolved = path.resolve(filename);
  const components = pathSegments(resolved);
  for (const [index, component] of components.entries()) {
    let stat: fs.Stats;
    try {
      stat = fs.lstatSync(component);
    } catch {
      throw new Error(`${field} is missing: ${component}`);
    }
    if (stat.isSymbolicLink()) throw new Error(`${field} must not traverse a symlink`);
    const leaf = index === components.length - 1;
    if (!leaf && !stat.isDirectory()) {
      throw new Error(`${field} ancestor is not a directory: ${component}`);
    }
    if (leaf && !stat.isFile()) throw new Error(`${field} must be a regular file`);
  }

  const before = fs.lstatSync(resolved);
  const noFollow = typeof fs.constants.O_NOFOLLOW === "number" ? fs.constants.O_NOFOLLOW : 0;
  const descriptor = fs.openSync(resolved, fs.constants.O_RDONLY | noFollow);
  try {
    const opened = fs.fstatSync(descriptor);
    if (!opened.isFile() || opened.dev !== before.dev || opened.ino !== before.ino) {
      throw new Error(`${field} changed while it was being opened`);
    }
    const bytes = fs.readFileSync(descriptor);
    const after = fs.lstatSync(resolved);
    if (after.isSymbolicLink() || after.dev !== opened.dev || after.ino !== opened.ino) {
      throw new Error(`${field} changed while it was being read`);
    }
    return bytes;
  } finally {
    fs.closeSync(descriptor);
  }
}

function secureReleaseRoot(configuredRoot: string): string {
  if (!path.isAbsolute(configuredRoot)) {
    throw new Error("evaluation release root must be an absolute path");
  }
  const root = path.resolve(configuredRoot);
  if (root === path.parse(root).root) {
    throw new Error("evaluation release root must not be the filesystem root");
  }
  const components = pathSegments(root);
  for (const component of components) {
    let stat: fs.Stats;
    try {
      stat = fs.lstatSync(component);
    } catch {
      throw new Error(`evaluation release root is missing: ${component}`);
    }
    if (stat.isSymbolicLink()) {
      throw new Error("evaluation release root must not traverse a symlink");
    }
    if (!stat.isDirectory()) {
      throw new Error(`evaluation release root component is not a directory: ${component}`);
    }
  }
  return root;
}

function fixedArtifactPath(root: string, folder: string, digest: string): string {
  if (!SHA256_PATTERN.test(digest)) throw new Error("evaluation artifact digest is invalid");
  const candidate = path.join(root, folder, `${digest}.json`);
  const relative = path.relative(root, candidate);
  if (!isPathInside(root, candidate) || relative.split(path.sep).length !== 2) {
    throw new Error("evaluation artifact path escapes its fixed folder");
  }
  return candidate;
}

function readReleaseFile(root: string, filename: string, field: string): Buffer {
  const resolved = path.resolve(filename);
  if (!isPathInside(root, resolved) || resolved === root) {
    throw new Error(`${field} escapes the evaluation release root`);
  }
  return readRegularFileWithoutSymlinkAncestors(resolved, field);
}

function parseJson(bytes: Buffer, field: string): unknown {
  try {
    return JSON.parse(bytes.toString("utf8")) as unknown;
  } catch (error) {
    throw new Error(`${field} is not valid UTF-8 JSON: ${
      error instanceof Error ? error.message : String(error)
    }`);
  }
}

function rememberFile(root: string, filename: string, bytes: Buffer, state: VerificationState): void {
  const relative = path.relative(root, filename).split(path.sep).join("/");
  const digest = sha256(bytes);
  const previous = state.files.get(relative);
  if (previous && previous !== digest) {
    throw new Error(`evaluation release file changed during verification: ${relative}`);
  }
  state.files.set(relative, digest);
}

function assertExactStringArray(
  actual: readonly string[],
  expected: readonly string[],
  field: string,
): void {
  if (
    actual.length !== expected.length
    || actual.some((value, index) => value !== expected[index])
  ) {
    throw new Error(`${field} differs from the current reviewed exact gateway model IDs`);
  }
}

function canonicalModelIds(value: unknown): readonly string[] {
  const rows = Array.isArray(value)
    ? value
    : value && typeof value === "object" && Array.isArray((value as { data?: unknown }).data)
      ? (value as { data: unknown[] }).data
      : [];
  return [...new Set(rows.map((row) => (
    typeof row === "string"
      ? row
      : row && typeof row === "object" && typeof (row as { id?: unknown }).id === "string"
        ? (row as { id: string }).id
        : ""
  )).filter(Boolean))].sort();
}

function assertBaseline(baseline: EvaluationReleaseModelCatalogBaseline): void {
  if (baseline.reviewedExportHashScope !== "sha256-canonical-model-id-set-v1") {
    throw new Error("reviewed gateway model catalog hash scope is invalid");
  }
  if (!SHA256_PATTERN.test(baseline.reviewedExportSha256)) {
    throw new Error("runtime contracts have no human-reviewed /v1/models baseline");
  }
  if (!SHA256_PATTERN.test(baseline.reviewedRawExportSha256)) {
    throw new Error("runtime contracts have no human-reviewed raw /v1/models file SHA-256");
  }
  if (
    baseline.expectedGatewayModelIds.length === 0
    || baseline.expectedGatewayModelIds.some((id) => !id.trim())
    || new Set(baseline.expectedGatewayModelIds).size !== baseline.expectedGatewayModelIds.length
  ) {
    throw new Error("runtime contracts have an invalid exact gateway model ID list");
  }
}

function readJsonArtifact<T>(
  root: string,
  folder: string,
  digest: string,
  field: string,
  validate: (value: unknown) => T,
  state: VerificationState,
): T {
  const filename = fixedArtifactPath(root, folder, digest);
  const bytes = readReleaseFile(root, filename, field);
  const artifact = validate(parseJson(bytes, field));
  const actualDigest = (artifact as { artifactSha256?: unknown }).artifactSha256;
  if (actualDigest !== digest) throw new Error(`${field} filename differs from its canonical artifact hash`);
  rememberFile(root, filename, bytes, state);
  return artifact;
}

function verifyContract(
  root: string,
  digest: string,
  baseline: EvaluationReleaseModelCatalogBaseline,
  state: VerificationState,
): EvaluationContractCheckArtifact {
  const cached = state.contracts.get(digest);
  if (cached) return cached;
  const contract = readJsonArtifact(
    root,
    "contract-checks",
    digest,
    "evaluation contract-check artifact",
    validateEvaluationContractCheckArtifact,
    state,
  );
  state.contracts.set(digest, contract);
  if (contract.gatewayModelCatalog.reviewedBaselineSha256 !== baseline.reviewedExportSha256) {
    throw new Error("contract check differs from the current reviewed /v1/models baseline");
  }
  assertExactStringArray(
    contract.gatewayModelCatalog.expectedGatewayModelIds,
    baseline.expectedGatewayModelIds,
    "contract check expectedGatewayModelIds",
  );

  const modelListPath = fixedArtifactPath(
    root,
    "model-catalogs",
    contract.gatewayModelCatalog.modelListFileSha256,
  );
  const modelListBytes = readReleaseFile(root, modelListPath, "retained /v1/models artifact");
  const actualRawExportSha256 = sha256(modelListBytes);
  if (
    contract.gatewayModelCatalog.modelListFileSha256 !== actualRawExportSha256
    || contract.gatewayModelCatalog.reviewedRawExportSha256 !== actualRawExportSha256
    || contract.gatewayModelCatalog.modelListFileSha256 !== baseline.reviewedRawExportSha256
    || contract.gatewayModelCatalog.reviewedRawExportSha256 !== baseline.reviewedRawExportSha256
    || actualRawExportSha256 !== baseline.reviewedRawExportSha256
  ) {
    throw new Error(
      "retained /v1/models raw SHA-256 differs between contract, actual bytes, and reviewed baseline",
    );
  }
  const ids = canonicalModelIds(parseJson(modelListBytes, "retained /v1/models artifact"));
  const missing = baseline.expectedGatewayModelIds.filter((id) => !ids.includes(id));
  if (missing.length > 0) {
    throw new Error(`retained /v1/models artifact is missing exact gateway model IDs: ${missing.join(", ")}`);
  }
  const idSetSha256 = evaluationArtifactSha256(ids);
  if (
    idSetSha256 !== contract.gatewayModelCatalog.canonicalModelIdSetSha256
    || idSetSha256 !== baseline.reviewedExportSha256
  ) {
    throw new Error("retained /v1/models canonical ID set differs from the reviewed baseline");
  }
  rememberFile(root, modelListPath, modelListBytes, state);
  return contract;
}

function loadReceipt(
  root: string,
  digest: string,
  state: VerificationState,
): EvaluationGateReceipt {
  const cached = state.receipts.get(digest);
  if (cached) return cached;
  const receipt = readJsonArtifact(
    root,
    "gate-receipts",
    digest,
    "evaluation gate receipt",
    parseEvaluationGateReceiptStructure,
    state,
  );
  state.receipts.set(digest, receipt);
  return receipt;
}

function loadCampaignClosure(
  root: string,
  digest: string,
  state: VerificationState,
): EvaluationCampaignClosure {
  const cached = state.campaignClosures.get(digest);
  if (cached) return cached;
  const closure = readJsonArtifact(
    root,
    "campaign-closures",
    digest,
    "evaluation campaign closure",
    validateEvaluationCampaignClosure,
    state,
  );
  state.campaignClosures.set(digest, closure);
  return closure;
}

function closureCaseAuditRefs(closure: EvaluationCampaignClosure): readonly Record<string, unknown>[] {
  return closure.slots.map((slot) => ({
    caseEvidenceId: slot.caseEvidenceId,
    runId: slot.runId,
    caseId: slot.caseId,
    sampleId: slot.sampleId,
    evidenceRecordSha256: slot.evidenceRecordSha256,
    billingTailSha256: slot.billingTailSha256,
    manualAssessmentTailSha256: slot.manualAssessmentTailSha256,
  }));
}

function verifyReceiptCampaignClosure(
  root: string,
  receipt: EvaluationGateReceipt,
  state: VerificationState,
): void {
  assertStageCampaignClosureBinding(
    receipt.stage,
    receipt.campaignId,
    receipt.campaignClosureSha256,
    "evaluation gate receipt",
  );
  if (receipt.stage === "contract") return;
  const closure = loadCampaignClosure(root, receipt.campaignClosureSha256!, state);
  if (
    closure.artifactSha256 !== receipt.campaignClosureSha256
    || closure.campaignId !== receipt.campaignId
    || closure.stage !== receipt.stage
    || closure.codeSha !== receipt.codeSha
    || closure.modelId !== receipt.unit.modelId
    || closure.authorizationUnitKey !== receipt.authorizationUnitKey
    || !canonicalEqual(closureCaseAuditRefs(closure), receipt.cases)
  ) {
    throw new Error("evaluation gate receipt differs from its sealed campaign closure");
  }
}

function verifyReceiptChain(
  root: string,
  receipt: EvaluationGateReceipt,
  baseline: EvaluationReleaseModelCatalogBaseline,
  state: VerificationState,
): readonly EvaluationGateReceipt[] {
  if (state.activeReceipts.has(receipt.artifactSha256)) {
    throw new Error("evaluation gate receipt chain contains a cycle");
  }
  state.activeReceipts.add(receipt.artifactSha256);
  try {
    const stageIndex = PROMPT_EVALUATION_STAGE_ORDER.indexOf(receipt.stage);
    if (stageIndex < 0 || receipt.previousReceiptSha256s.length !== stageIndex) {
      throw new Error("evaluation gate receipt chain length differs from its stage");
    }
    const previous = receipt.previousReceiptSha256s.map((digest) => loadReceipt(root, digest, state));
    for (const [index, prior] of previous.entries()) {
      if (prior.stage !== PROMPT_EVALUATION_STAGE_ORDER[index]) {
        throw new Error(`evaluation gate receipt chain item ${index} has the wrong stage`);
      }
      if (
        prior.codeSha !== receipt.codeSha
        || prior.variantId !== receipt.variantId
        || !canonicalEqual(prior.unit, receipt.unit)
        || !canonicalEqual(prior.currentVersions, receipt.currentVersions)
      ) {
        throw new Error(`evaluation gate receipt chain item ${index} belongs to another code/unit/version`);
      }
      if (!canonicalEqual(
        prior.previousReceiptSha256s,
        receipt.previousReceiptSha256s.slice(0, index),
      )) {
        throw new Error(`evaluation gate receipt chain item ${index} has an invalid recursive prefix`);
      }
      verifyReceiptChain(root, prior, baseline, state);
    }
    assertStageCaseIdentityDisjoint(
      receipt.stage,
      receipt.cases,
      previous,
      "evaluation gate receipt.cases",
    );
    assertStageAuthorizationUnitKeyConsistent(
      receipt.stage,
      receipt.authorizationUnitKey,
      previous,
      "evaluation gate receipt",
    );
    verifyReceiptCampaignClosure(root, receipt, state);

    if (receipt.stage === "contract") {
      if (!receipt.contractCheckSha256) {
        throw new Error("contract-stage receipt has no contract-check artifact");
      }
      const contract = verifyContract(root, receipt.contractCheckSha256, baseline, state);
      if (
        contract.artifactSha256 !== receipt.contractCheckSha256
        || contract.variantId !== receipt.variantId
        || contract.codeSha !== receipt.codeSha
      ) {
        throw new Error("contract-stage receipt differs from its contract-check artifact");
      }
    }
    return previous;
  } finally {
    state.activeReceipts.delete(receipt.artifactSha256);
  }
}

function expectedRuntimeRelease(artifact: EvaluationPromotionArtifact): Record<string, unknown> {
  const variant = getGarmentPromptVariantById(artifact.variantId);
  if (!variant) throw new Error(`release ${artifact.variantId} variant is not in the current catalog`);
  const expected: Record<string, unknown> = {
    schemaVersion: 1,
    variantId: artifact.variantId,
    supportStatus: artifact.supportStatus,
    evaluationStage: artifact.evaluationStage,
    evaluationVersion: variant.evaluationVersion,
    releaseVector: artifact.releaseVector,
    evidenceArtifactId: `promotions/${artifact.artifactSha256}.json`,
    evidenceArtifactSha256: artifact.artifactSha256,
    gateReceiptSha256: artifact.gateReceiptSha256,
    evaluationUnitKey: artifact.authorizationUnitKey,
    codeSha: artifact.codeSha,
    contractHash: artifact.currentVersions.providerContractVersion,
    parameterProfileVersion: artifact.currentVersions.parameterProfileVersion,
    postprocessVersion: artifact.currentVersions.postprocessingVersion,
  };
  return expected;
}

function verifyRelease(
  root: string,
  release: PromptEvaluationRelease,
  codeSha: string,
  baseline: EvaluationReleaseModelCatalogBaseline,
  state: VerificationState,
): void {
  if (release.codeSha !== codeSha) {
    throw new Error(`release ${release.variantId} belongs to another code SHA`);
  }
  const canonicalPromotionId = `promotions/${release.evidenceArtifactSha256}.json`;
  if (release.evidenceArtifactId !== canonicalPromotionId) {
    throw new Error(`release ${release.variantId} has a non-canonical promotion artifact ID`);
  }
  const artifact = readJsonArtifact(
    root,
    "promotions",
    release.evidenceArtifactSha256,
    "evaluation promotion artifact",
    parseEvaluationPromotionArtifactStructure,
    state,
  );
  const receipt = loadReceipt(root, artifact.gateReceiptSha256, state);
  const previous = verifyReceiptChain(root, receipt, baseline, state);
  if (
    artifact.gateReceiptSha256 !== release.gateReceiptSha256
    || artifact.evaluationStage !== receipt.stage
    || artifact.authorizationUnitKey !== receipt.authorizationUnitKey
    || artifact.campaignId !== receipt.campaignId
    || artifact.campaignClosureSha256 !== receipt.campaignClosureSha256
    || artifact.unitKey !== receipt.unitKey
    || artifact.codeSha !== receipt.codeSha
    || artifact.variantId !== receipt.variantId
    || !canonicalEqual(artifact.unit, receipt.unit)
    || !canonicalEqual(artifact.currentVersions, receipt.currentVersions)
    || !canonicalEqual(artifact.cases, receipt.cases)
    || !canonicalEqual(artifact.gateResult, receipt.gateResult)
    || !canonicalEqual(artifact.previousReceiptSha256s, receipt.previousReceiptSha256s)
    || !canonicalEqual(previous.map((item) => item.artifactSha256), receipt.previousReceiptSha256s)
  ) {
    throw new Error(`release ${release.variantId} does not match its promotion/gate receipt chain`);
  }
  const expected = expectedRuntimeRelease(artifact);
  if (!canonicalEqual(release, expected)) {
    throw new Error(`release ${release.variantId} differs from its complete promotion snapshot`);
  }
}

/**
 * Verify and hash only the immutable files reachable from the runtime registry.
 * No database or documentation-tree access is required: the reviewed catalog
 * baseline is compiled into the runtime and the raw model list is retained in
 * this external bundle.
 */
export function verifyEvaluationReleaseBundle(
  input: EvaluationReleaseBundleVerificationInput,
): EvaluationReleaseBundleVerificationResult {
  const root = secureReleaseRoot(input.releaseRoot);
  if (!CODE_SHA_PATTERN.test(input.codeSha)) {
    throw new Error("evaluation release code SHA must contain exactly 40 or 64 lowercase hexadecimal characters");
  }
  assertBaseline(input.modelCatalogBaseline);

  const canonicalRegistryPath = path.join(root, REGISTRY_FILENAME);
  if (path.resolve(input.registryPath) !== canonicalRegistryPath) {
    throw new Error(`evaluation release registry must use ${REGISTRY_FILENAME} at the release root`);
  }
  const registryBytes = readReleaseFile(root, canonicalRegistryPath, "prompt release registry");
  const checked = validatePromptEvaluationReleaseRegistry(parseJson(
    registryBytes,
    "prompt release registry",
  ));
  if (checked.errors.length > 0) {
    throw new Error(`prompt release registry is invalid:\n${checked.errors.join("\n")}`);
  }
  if (!canonicalEqual(checked.registry, input.registry)) {
    throw new Error("runtime prompt release registry differs from its mounted raw bytes");
  }

  const state: VerificationState = {
    files: new Map(),
    receipts: new Map(),
    contracts: new Map(),
    campaignClosures: new Map(),
    activeReceipts: new Set(),
  };
  rememberFile(root, canonicalRegistryPath, registryBytes, state);
  for (const release of checked.registry.releases) {
    verifyRelease(root, release, input.codeSha, input.modelCatalogBaseline, state);
  }

  const files = [...state.files.entries()]
    .map(([filePath, digest]) => ({ path: filePath, sha256: digest }))
    .sort((left, right) => left.path.localeCompare(right.path));
  const bundleSha256 = evaluationArtifactSha256({
    schemaVersion: 1,
    hashScope: EVALUATION_RELEASE_BUNDLE_HASH_SCOPE,
    files,
  });
  if (checked.registry.releases.length > 0) assertEvaluationCampaignReady();
  return { bundleSha256, files };
}
