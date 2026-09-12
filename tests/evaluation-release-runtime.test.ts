import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  EVALUATION_CONTRACT_CHECK_COMMANDS,
  createEvaluationGateReceipt,
  createEvaluationPromotionArtifact,
  currentEvaluationPromotionTarget,
  evaluationArtifactSha256,
  type EvaluatedEvidenceGate,
  type EvaluationCaseAuditRef,
  type EvaluationGateReceipt,
  type EvaluationPromotionArtifact,
} from "../server/lib/evaluationPromotion";
import {
  EVALUATION_RELEASE_BUNDLE_HASH_SCOPE,
  verifyEvaluationReleaseBundle,
  type EvaluationReleaseModelCatalogBaseline,
} from "../server/lib/evaluationReleaseBundle";
import type { EvaluationCampaignClosure } from "../server/lib/evaluationCampaign";
import {
  EVALUATION_RELEASE_BUILD_MANIFEST_FILENAME,
  evaluationReleaseBuildManifestJson,
  loadEvaluationReleaseBuildInput,
} from "../server/lib/evaluationReleaseBuild";
import {
  assertEvaluationReleaseRuntimeConfig,
  parseLinuxMountInfo,
} from "../server/lib/evaluationReleaseRuntime";
import {
  GOLDEN_GARMENT_SAMPLE_IDS,
  PROMPT_EVALUATION_STAGE_ORDER,
  evaluatePromptEvaluationGate,
  promptEvaluationUnitKey,
} from "../src/lib/promptEvaluation";
import type { PromptEvaluationReleaseRegistry } from "../src/lib/promptEvaluationReleaseRegistry";
import { requireGarmentPromptVariant } from "../src/lib/garmentPromptPresets";
import { IMAGE_MODEL_IDS } from "../src/types/imageModels";
import type {
  PromptEvaluationAttempt,
  PromptEvaluationStage,
  PromptEvaluationScores,
} from "../src/types/promptEvaluation";

const temp = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), "garment-release-runtime-"));
const projectRoot = path.join(temp, "project");
const externalRoot = path.join(temp, "external");
const dist = path.join(projectRoot, "dist");
const distServer = path.join(projectRoot, "dist-server");
const CODE_SHA = "a".repeat(40);
const SHA = "c".repeat(64);
const AUTHORIZATION_UNIT_KEY = `sha256:${"d".repeat(64)}` as const;
const CREATED_AT = "2026-09-03T00:00:00.000Z";
const RELEASE_MARKER_FILENAME = ".garment-canvas-evaluation-release-root";
const RELEASE_MARKER_CONTENT = "garment-canvas-evaluation-release-root-v1\n";

function mountInfoEscape(value: string): string {
  return value
    .replace(/\\/g, "\\134")
    .replace(/ /g, "\\040")
    .replace(/\t/g, "\\011")
    .replace(/\n/g, "\\012");
}

function linuxMountInfo(
  mounts: readonly { mountPoint: string; options: "ro" | "rw" }[],
): string {
  return `${mounts.map((mount, index) => (
    `${index + 20} 1 0:${index + 20} / ${mountInfoEscape(mount.mountPoint)} ${mount.options},relatime - none none rw`
  )).join("\n")}\n`;
}

function writeManifests(manifest: ReturnType<typeof loadEvaluationReleaseBuildInput>["manifest"]): void {
  fs.mkdirSync(dist, { recursive: true });
  fs.mkdirSync(distServer, { recursive: true });
  const body = evaluationReleaseBuildManifestJson(manifest);
  fs.writeFileSync(path.join(dist, EVALUATION_RELEASE_BUILD_MANIFEST_FILENAME), body);
  fs.writeFileSync(path.join(distServer, EVALUATION_RELEASE_BUILD_MANIFEST_FILENAME), body);
}

function sha256Bytes(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function sha256File(filePath: string): string {
  return sha256Bytes(fs.readFileSync(filePath));
}

function writeJson(filePath: string, value: unknown): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeArtifact(folder: string, artifact: { artifactSha256: string }): string {
  const filePath = path.join(externalRoot, folder, `${artifact.artifactSha256}.json`);
  writeJson(filePath, artifact);
  return filePath;
}

const PASSING_SCORES: PromptEvaluationScores = {
  garmentMaterialFidelity: 90,
  instructionFollowing: 90,
  referenceRoleFidelity: 90,
  artifactControl: 90,
  commercialUsability: 90,
};

function stageSampleIds(stage: PromptEvaluationStage): readonly string[] {
  if (stage === "contract") return [];
  if (stage === "provider-probe") return ["provider-probe-01"];
  if (stage === "internal-experiment") {
    return Array.from({ length: 8 }, (_unused, index) => `internal-${String(index + 1).padStart(2, "0")}`);
  }
  if (stage === "formal-validation") return GOLDEN_GARMENT_SAMPLE_IDS;
  throw new Error("recommendation fixture is intentionally blocked");
}

function attemptForSample(
  sampleId: string,
  stage: PromptEvaluationStage,
  target: ReturnType<typeof currentEvaluationPromotionTarget>,
): PromptEvaluationAttempt {
  const safe = sampleId.replace(/[^A-Za-z0-9_.:-]/g, "-");
  const requiresQuality = stage === "internal-experiment" || stage === "formal-validation";
  const providerEvidenceId = `provider-${safe}`;
  return {
    attemptId: `evidence-${safe}`,
    unitKey: promptEvaluationUnitKey(target.unit),
    sampleId,
    requestSnapshotSha256: SHA,
    outcome: "succeeded",
    versions: target.versions,
    providerOriginal: {
      evidenceId: providerEvidenceId,
      layer: "provider-original",
      artifactSha256: SHA,
      mimeType: "image/png",
      width: 1024,
      height: 1024,
      storageRef: `evidence/${providerEvidenceId}.png`,
      capturedAt: CREATED_AT,
    },
    ...(requiresQuality ? {
      postprocessed: {
        evidenceId: `postprocessed-${safe}`,
        layer: "postprocessed" as const,
        sourceEvidenceId: providerEvidenceId,
        artifactSha256: SHA,
        mimeType: "image/webp" as const,
        width: 1024,
        height: 1024,
        storageRef: `evidence/postprocessed-${safe}.webp`,
        capturedAt: CREATED_AT,
        pipelineVersion: target.versions.postprocessingVersion,
      },
      scores: PASSING_SCORES,
      taskPassed: true,
    } : { taskPassed: false }),
    validForScoring: true,
    recentRequest: true,
    hardBlockers: [],
  };
}

function auditRefForAttempt(
  attempt: PromptEvaluationAttempt,
  stage: PromptEvaluationStage,
): EvaluationCaseAuditRef {
  const safe = attempt.sampleId.replace(/[^A-Za-z0-9_.:-]/g, "-");
  return {
    caseEvidenceId: attempt.attemptId,
    runId: `run-${stage}-${safe}`,
    caseId: `case-${stage}-${safe}`,
    sampleId: attempt.sampleId,
    evidenceRecordSha256: SHA,
    billingTailSha256: SHA,
    manualAssessmentTailSha256: SHA,
  };
}

function makeEvaluatedGate(
  stage: PromptEvaluationStage,
  target: ReturnType<typeof currentEvaluationPromotionTarget>,
): EvaluatedEvidenceGate {
  const attempts = stageSampleIds(stage).map((sampleId) => attemptForSample(sampleId, stage, target));
  const caseAuditRefs = attempts.map((attempt) => auditRefForAttempt(attempt, stage));
  const passedStages = PROMPT_EVALUATION_STAGE_ORDER.slice(
    0,
    PROMPT_EVALUATION_STAGE_ORDER.indexOf(stage),
  );
  const gateResult = evaluatePromptEvaluationGate({
    unit: target.unit,
    stage,
    contractVerified: true,
    passedStages,
    attempts,
    currentVersions: target.versions,
  });
  assert.equal(gateResult.passed, true, gateResult.failures.join("\n"));
  return {
    unit: target.unit,
    unitKey: promptEvaluationUnitKey(target.unit),
    authorizationUnitKey: stage === "contract" ? null : AUTHORIZATION_UNIT_KEY,
    currentVersions: target.versions,
    attempts,
    caseAuditRefs,
    gateResult,
  };
}

function makeCampaignClosure(
  stage: Exclude<PromptEvaluationStage, "contract" | "recommendation">,
  evaluated: EvaluatedEvidenceGate,
): EvaluationCampaignClosure {
  const authorizationUnitKey = evaluated.authorizationUnitKey;
  assert.ok(authorizationUnitKey, "paid campaign closure needs an exact authorization unit");
  const slots = evaluated.caseAuditRefs.map((caseRef, index) => ({
    slotId: `slot-${stage}-${index + 1}`,
    caseId: caseRef.caseId,
    sampleId: caseRef.sampleId,
    authorizationId: `authorization-${stage}-${index + 1}`,
    runId: caseRef.runId,
    caseEvidenceId: caseRef.caseEvidenceId,
    evidenceRecordSha256: caseRef.evidenceRecordSha256,
    billingReconciliationStatus: "confirmed-billed" as const,
    billingTailSha256: caseRef.billingTailSha256,
    manualAssessmentTailSha256: caseRef.manualAssessmentTailSha256,
    imageArtifactSetSha256: SHA,
  }));
  const base: Omit<EvaluationCampaignClosure, "artifactSha256"> = {
    schemaVersion: 1,
    artifactType: "evaluation-campaign-closure",
    campaignId: `campaign-${stage}`,
    ownerId: "runtime-test-admin",
    stage,
    modelId: evaluated.unit.modelId,
    authorizationUnitKey,
    codeSha: CODE_SHA,
    manifestSha256: SHA,
    campaignRequestCap: slots.length,
    campaignBudgetLimitMinor: slots.length,
    budgetCurrency: "CNY",
    campaignReservedProviderRequests: slots.length,
    campaignReservedBudgetMinor: slots.length,
    slots,
    imageArtifactSetSha256: SHA,
    closedBy: "runtime-test-admin",
    closedAt: CREATED_AT,
  };
  return { ...base, artifactSha256: evaluationArtifactSha256(base) };
}

function makeReceipt(
  stage: PromptEvaluationStage,
  target: ReturnType<typeof currentEvaluationPromotionTarget>,
  previousReceipts: readonly EvaluationGateReceipt[],
  contractCheckSha256?: string,
  campaignClosure?: EvaluationCampaignClosure,
): EvaluationGateReceipt {
  return createEvaluationGateReceipt({
    evaluated: makeEvaluatedGate(stage, target),
    stage,
    previousReceipts,
    codeSha: CODE_SHA,
    approvedBy: "runtime-test-admin",
    auditReason: `offline ${stage} closure test`,
    createdAt: CREATED_AT,
    ...(contractCheckSha256 ? { contractCheckSha256 } : {}),
    ...(campaignClosure ? {
      campaignId: campaignClosure.campaignId,
      campaignClosureSha256: campaignClosure.artifactSha256,
    } : {}),
  });
}

function buildExternalRelease(): {
  registry: PromptEvaluationReleaseRegistry;
  registryPath: string;
  registrySha256: string;
  bundleSha256: string;
  baseline: EvaluationReleaseModelCatalogBaseline;
  promotionPath: string;
} {
  fs.mkdirSync(externalRoot, { recursive: true });
  fs.writeFileSync(
    path.join(externalRoot, RELEASE_MARKER_FILENAME),
    RELEASE_MARKER_CONTENT,
  );
  const variant = requireGarmentPromptVariant({
    familyId: "commerce-hero",
    modelId: "gpt-image-2-vip",
    nodeKind: "sketch-to-render",
    mode: "generate",
  });
  const target = currentEvaluationPromotionTarget(variant.variantId, []);
  const canonicalModelIds = [...IMAGE_MODEL_IDS].sort();
  const reviewedExportSha256 = evaluationArtifactSha256(canonicalModelIds);
  const modelCatalogBytes = Buffer.from(JSON.stringify({
    data: IMAGE_MODEL_IDS.map((id) => ({ id })),
  }));
  const modelCatalogFileSha256 = sha256Bytes(modelCatalogBytes);
  const baseline: EvaluationReleaseModelCatalogBaseline = {
    reviewedExportHashScope: "sha256-canonical-model-id-set-v1",
    reviewedExportSha256,
    reviewedRawExportSha256: modelCatalogFileSha256,
    expectedGatewayModelIds: IMAGE_MODEL_IDS,
  };
  const modelCatalogPath = path.join(
    externalRoot,
    "model-catalogs",
    `${modelCatalogFileSha256}.json`,
  );
  fs.mkdirSync(path.dirname(modelCatalogPath), { recursive: true });
  fs.writeFileSync(modelCatalogPath, modelCatalogBytes);

  const contractBase = {
    schemaVersion: 1 as const,
    artifactType: "prompt-evaluation-contract-check" as const,
    variantId: variant.variantId,
    referenceRoleProfile: [],
    codeSha: CODE_SHA,
    commands: EVALUATION_CONTRACT_CHECK_COMMANDS.map((file) => ({
      file,
      stdoutSha256: SHA,
    })),
    knowledgeBase: {
      snapshotId: "runtime-test-kb",
      snapshotSha256: SHA,
      pageCount: 1,
      pointerFileSha256: SHA,
    },
    gatewayModelCatalog: {
      modelListFileSha256: modelCatalogFileSha256,
      canonicalModelIdSetSha256: reviewedExportSha256,
      reviewedBaselineSha256: reviewedExportSha256,
      reviewedRawExportSha256: modelCatalogFileSha256,
      expectedGatewayModelIds: IMAGE_MODEL_IDS,
    },
    approvedBy: "runtime-test-admin",
    auditReason: "offline contract closure test",
    createdAt: CREATED_AT,
  };
  const contract = {
    ...contractBase,
    artifactSha256: evaluationArtifactSha256(contractBase),
  };
  writeArtifact("contract-checks", contract);

  const contractReceipt = makeReceipt("contract", target, [], contract.artifactSha256);
  const providerClosure = makeCampaignClosure(
    "provider-probe",
    makeEvaluatedGate("provider-probe", target),
  );
  const providerReceipt = makeReceipt(
    "provider-probe",
    target,
    [contractReceipt],
    undefined,
    providerClosure,
  );
  const internalReceipts = [contractReceipt, providerReceipt] as const;
  const internalClosure = makeCampaignClosure(
    "internal-experiment",
    makeEvaluatedGate("internal-experiment", target),
  );
  const internalReceipt = makeReceipt(
    "internal-experiment",
    target,
    internalReceipts,
    undefined,
    internalClosure,
  );
  for (const receipt of [contractReceipt, providerReceipt, internalReceipt]) {
    writeArtifact("gate-receipts", receipt);
  }
  for (const closure of [providerClosure, internalClosure]) {
    writeArtifact("campaign-closures", closure);
  }

  const promotion = createEvaluationPromotionArtifact({
    gateReceipt: internalReceipt,
    reEvaluated: makeEvaluatedGate("internal-experiment", target),
    previousReceipts: internalReceipts,
    approvedBy: "runtime-test-admin",
    approvalReason: "offline reachable-closure runtime test",
    approvedAt: CREATED_AT,
    localArtifactSetSha256: SHA,
  });
  const promotionPath = writeArtifact("promotions", promotion.artifact);
  const registry: PromptEvaluationReleaseRegistry = {
    schemaVersion: 1,
    generatedAt: CREATED_AT,
    releases: [promotion.release],
  };
  const registryPath = path.join(externalRoot, "prompt-release-registry.json");
  writeJson(registryPath, registry);
  writeJson(path.join(externalRoot, "exports", `${"e".repeat(64)}.json`), { unused: true });

  const files = [
    `contract-checks/${contract.artifactSha256}.json`,
    ...[providerClosure, internalClosure]
      .map((closure) => `campaign-closures/${closure.artifactSha256}.json`),
    ...[contractReceipt, providerReceipt, internalReceipt]
      .map((receipt) => `gate-receipts/${receipt.artifactSha256}.json`),
    `model-catalogs/${modelCatalogFileSha256}.json`,
    `promotions/${promotion.artifact.artifactSha256}.json`,
    "prompt-release-registry.json",
  ].sort().map((relativePath) => ({
    path: relativePath,
    sha256: sha256File(path.join(externalRoot, relativePath)),
  }));
  const bundleSha256 = evaluationArtifactSha256({
    schemaVersion: 1,
    hashScope: EVALUATION_RELEASE_BUNDLE_HASH_SCOPE,
    files,
  });
  assert.equal(files.length, 9);
  assert.ok(files.every((file) => !file.path.startsWith("exports/")));
  return {
    registry,
    registryPath,
    registrySha256: sha256File(registryPath),
    bundleSha256,
    baseline,
    promotionPath,
  };
}

function makeTreeWritable(root: string): void {
  if (!fs.existsSync(root)) return;
  const stat = fs.lstatSync(root);
  if (stat.isSymbolicLink()) return;
  if (stat.isDirectory()) {
    fs.chmodSync(root, 0o755);
    for (const entry of fs.readdirSync(root)) makeTreeWritable(path.join(root, entry));
  } else {
    fs.chmodSync(root, 0o644);
  }
}

console.log("评估发布可达闭包与前后端运行时一致性门禁测试");

try {
  const escapedMount = parseLinuxMountInfo(
    "20 1 0:20 / /run/release\\040bundle ro,nosuid - none none rw\n",
  );
  assert.equal(escapedMount[0].mountPoint, "/run/release bundle");
  assert.equal(escapedMount[0].mountOptions.has("ro"), true);
  assert.throws(() => parseLinuxMountInfo("not mountinfo\n"), /line 1 is invalid/);

  fs.mkdirSync(externalRoot, { recursive: true });
  const empty = loadEvaluationReleaseBuildInput({}, projectRoot);
  writeManifests(empty.manifest);
  assert.deepEqual(assertEvaluationReleaseRuntimeConfig({
    projectRoot,
    isProduction: true,
    apiOnly: false,
    env: {},
    embeddedRegistry: empty.registry,
  }).manifest, empty.manifest);
  assert.throws(() => assertEvaluationReleaseRuntimeConfig({
    projectRoot,
    isProduction: false,
    apiOnly: false,
    env: { GARMENT_CANVAS_EVALUATION_RELEASE_DIR: externalRoot },
    embeddedRegistry: empty.registry,
  }), /require a production build/);

  const projectLink = path.join(temp, "project-link");
  fs.symlinkSync(projectRoot, projectLink);
  assert.throws(() => assertEvaluationReleaseRuntimeConfig({
    projectRoot: projectLink,
    isProduction: true,
    apiOnly: false,
    env: {},
    embeddedRegistry: empty.registry,
  }), /must not traverse a symlink/);
  fs.unlinkSync(projectLink);

  const release = buildExternalRelease();
  assert.equal(verifyEvaluationReleaseBundle({
    releaseRoot: externalRoot,
    registryPath: release.registryPath,
    registry: release.registry,
    codeSha: CODE_SHA,
    modelCatalogBaseline: release.baseline,
  }).bundleSha256, release.bundleSha256,
  "a non-empty external release must include exact sealed Campaign Closure artifacts");
  assert.throws(() => verifyEvaluationReleaseBundle({
    releaseRoot: externalRoot,
    registryPath: release.registryPath,
    registry: release.registry,
    codeSha: CODE_SHA,
    modelCatalogBaseline: {
      ...release.baseline,
      reviewedRawExportSha256: "not-a-sha256",
    },
  }), /human-reviewed raw \/v1\/models file SHA-256/);

  const sameCanonicalIdsDifferentRawBytes = Buffer.from(`${JSON.stringify({
    data: IMAGE_MODEL_IDS.map((id) => ({ id })),
  }, null, 2)}\n`);
  const sameCanonicalIdsDifferentRawSha256 = sha256Bytes(sameCanonicalIdsDifferentRawBytes);
  const sameCanonicalIds = (
    JSON.parse(sameCanonicalIdsDifferentRawBytes.toString("utf8")) as {
      data: Array<{ id: string }>;
    }
  ).data.map(({ id }) => id).sort();
  assert.notEqual(sameCanonicalIdsDifferentRawSha256, release.baseline.reviewedRawExportSha256);
  assert.deepEqual(sameCanonicalIds, [...IMAGE_MODEL_IDS].sort());
  assert.equal(evaluationArtifactSha256(sameCanonicalIds), release.baseline.reviewedExportSha256);
  // The reviewed bytes can encode the exact same canonical IDs while still
  // being a different raw artifact from the one retained by the contract.
  assert.throws(() => verifyEvaluationReleaseBundle({
    releaseRoot: externalRoot,
    registryPath: release.registryPath,
    registry: release.registry,
    codeSha: CODE_SHA,
    modelCatalogBaseline: {
      ...release.baseline,
      reviewedRawExportSha256: sameCanonicalIdsDifferentRawSha256,
    },
  }), /raw SHA-256 differs between contract, actual bytes, and reviewed baseline/);

  const retainedModelCatalogPath = path.join(
    externalRoot,
    "model-catalogs",
    `${release.baseline.reviewedRawExportSha256}.json`,
  );
  const reviewedModelCatalogBytes = fs.readFileSync(retainedModelCatalogPath);
  fs.writeFileSync(retainedModelCatalogPath, sameCanonicalIdsDifferentRawBytes);
  try {
    assert.throws(() => verifyEvaluationReleaseBundle({
      releaseRoot: externalRoot,
      registryPath: release.registryPath,
      registry: release.registry,
      codeSha: CODE_SHA,
      modelCatalogBaseline: release.baseline,
    }), /raw SHA-256 differs between contract, actual bytes, and reviewed baseline/);
  } finally {
    fs.writeFileSync(retainedModelCatalogPath, reviewedModelCatalogBytes);
  }

  const promotionsPath = path.join(externalRoot, "promotions");
  const realPromotionsPath = path.join(externalRoot, "promotions-real");
  fs.renameSync(promotionsPath, realPromotionsPath);
  fs.symlinkSync(realPromotionsPath, promotionsPath);
  assert.throws(() => verifyEvaluationReleaseBundle({
    releaseRoot: externalRoot,
    registryPath: release.registryPath,
    registry: release.registry,
    codeSha: CODE_SHA,
    modelCatalogBaseline: release.baseline,
  }), /must not traverse a symlink/);
  fs.unlinkSync(promotionsPath);
  fs.renameSync(realPromotionsPath, promotionsPath);

  const build = loadEvaluationReleaseBuildInput({
    GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_PATH: release.registryPath,
    GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SHA256: release.registrySha256,
    GARMENT_CANVAS_EVALUATION_RELEASE_BUNDLE_SHA256: release.bundleSha256,
    GARMENT_CANVAS_BUILD_CODE_SHA: CODE_SHA,
  }, projectRoot);
  writeManifests(build.manifest);
  const runtimeEnv = {
    GARMENT_CANVAS_EVALUATION_RELEASE_DIR: externalRoot,
    GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_PATH: release.registryPath,
    GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SHA256: release.registrySha256,
    GARMENT_CANVAS_EVALUATION_RELEASE_BUNDLE_SHA256: release.bundleSha256,
    GARMENT_CANVAS_CODE_SHA: CODE_SHA,
  };
  const readOnlyMountInfo = linuxMountInfo([
    { mountPoint: path.parse(externalRoot).root, options: "rw" },
    { mountPoint: externalRoot, options: "ro" },
  ]);
  fs.writeFileSync(path.join(projectRoot, ".garment-canvas-build-identity.json"), JSON.stringify({
    schemaVersion: 1,
    codeSha: CODE_SHA,
  }));
  assert.doesNotThrow(() => assertEvaluationReleaseRuntimeConfig({
    projectRoot,
    isProduction: true,
    apiOnly: false,
    env: runtimeEnv,
    embeddedRegistry: build.registry,
    modelCatalogBaseline: release.baseline,
    linuxMountInfoTextForTest: readOnlyMountInfo,
  }), "production runtime activates only after the reachable Campaign Closure chain verifies");

  const activeLockPath = path.join(externalRoot, ".prompt-release-registry.lock");
  fs.writeFileSync(activeLockPath, "active\n");
  assert.throws(() => assertEvaluationReleaseRuntimeConfig({
    projectRoot,
    isProduction: true,
    apiOnly: false,
    env: runtimeEnv,
    embeddedRegistry: build.registry,
    modelCatalogBaseline: release.baseline,
    linuxMountInfoTextForTest: readOnlyMountInfo,
  }), /registry update lock is present at runtime/);
  fs.unlinkSync(activeLockPath);

  assert.throws(() => assertEvaluationReleaseRuntimeConfig({
    projectRoot,
    isProduction: true,
    apiOnly: false,
    env: runtimeEnv,
    embeddedRegistry: build.registry,
    modelCatalogBaseline: release.baseline,
    linuxMountInfoTextForTest: readOnlyMountInfo,
    releaseTreeEntryLimitForTest: 1,
  }), /tree exceeds the maximum of 1 entries/);

  assert.throws(() => assertEvaluationReleaseRuntimeConfig({
    projectRoot,
    isProduction: true,
    apiOnly: false,
    env: runtimeEnv,
    embeddedRegistry: build.registry,
    linuxMountInfoTextForTest: readOnlyMountInfo,
  }), /contract check differs from the current reviewed \/v1\/models baseline/);

  const writablePromotionMountInfo = linuxMountInfo([
    { mountPoint: path.parse(externalRoot).root, options: "rw" },
    { mountPoint: externalRoot, options: "ro" },
    { mountPoint: path.dirname(release.promotionPath), options: "rw" },
  ]);
  assert.throws(() => assertEvaluationReleaseRuntimeConfig({
    projectRoot,
    isProduction: true,
    apiOnly: false,
    env: runtimeEnv,
    embeddedRegistry: build.registry,
    modelCatalogBaseline: release.baseline,
    linuxMountInfoTextForTest: writablePromotionMountInfo,
  }), /must be on a Linux read-only mount/);

  const markerPath = path.join(externalRoot, RELEASE_MARKER_FILENAME);
  fs.unlinkSync(markerPath);
  assert.throws(() => assertEvaluationReleaseRuntimeConfig({
    projectRoot,
    isProduction: true,
    apiOnly: false,
    env: runtimeEnv,
    embeddedRegistry: build.registry,
    modelCatalogBaseline: release.baseline,
    linuxMountInfoTextForTest: readOnlyMountInfo,
  }), /evaluation release root marker/);
  fs.writeFileSync(markerPath, RELEASE_MARKER_CONTENT);

  const originalPromotionBytes = fs.readFileSync(release.promotionPath);
  fs.appendFileSync(release.promotionPath, "\n");
  assert.throws(() => assertEvaluationReleaseRuntimeConfig({
    projectRoot,
    isProduction: true,
    apiOnly: false,
    env: runtimeEnv,
    embeddedRegistry: build.registry,
    modelCatalogBaseline: release.baseline,
    linuxMountInfoTextForTest: readOnlyMountInfo,
  }), /reachable-file bundle SHA-256 differs/);
  fs.writeFileSync(release.promotionPath, originalPromotionBytes);

  assert.throws(() => assertEvaluationReleaseRuntimeConfig({
    projectRoot,
    isProduction: true,
    apiOnly: false,
    env: { ...runtimeEnv, GARMENT_CANVAS_CODE_SHA: "f".repeat(40) },
    embeddedRegistry: build.registry,
    modelCatalogBaseline: release.baseline,
    linuxMountInfoTextForTest: readOnlyMountInfo,
  }), /codeSha does not match/);

  fs.writeFileSync(path.join(projectRoot, ".garment-canvas-build-identity.json"), JSON.stringify({
    schemaVersion: 1,
    codeSha: "1".repeat(40),
  }));
  assert.throws(() => assertEvaluationReleaseRuntimeConfig({
    projectRoot,
    isProduction: true,
    apiOnly: false,
    env: runtimeEnv,
    embeddedRegistry: build.registry,
    modelCatalogBaseline: release.baseline,
    linuxMountInfoTextForTest: readOnlyMountInfo,
  }), /immutable build identity/);
  fs.writeFileSync(path.join(projectRoot, ".garment-canvas-build-identity.json"), JSON.stringify({
    schemaVersion: 1,
    codeSha: CODE_SHA,
  }));

  fs.writeFileSync(
    path.join(dist, EVALUATION_RELEASE_BUILD_MANIFEST_FILENAME),
    evaluationReleaseBuildManifestJson(empty.manifest),
  );
  assert.throws(() => assertEvaluationReleaseRuntimeConfig({
    projectRoot,
    isProduction: true,
    apiOnly: false,
    env: runtimeEnv,
    embeddedRegistry: build.registry,
    modelCatalogBaseline: release.baseline,
    linuxMountInfoTextForTest: readOnlyMountInfo,
  }), /browser and server evaluation release manifests differ/);
  writeManifests(build.manifest);

  assert.throws(() => assertEvaluationReleaseRuntimeConfig({
    projectRoot,
    isProduction: true,
    apiOnly: false,
    env: runtimeEnv,
    embeddedRegistry: build.registry,
    modelCatalogBaseline: release.baseline,
    linuxMountInfoTextForTest: linuxMountInfo([
      { mountPoint: path.parse(externalRoot).root, options: "rw" },
      { mountPoint: externalRoot, options: "rw" },
    ]),
  }), /must be on a Linux read-only mount/);

  const originalPromotion = JSON.parse(
    fs.readFileSync(release.promotionPath, "utf8"),
  ) as EvaluationPromotionArtifact;
  const originalInternalReceiptPath = path.join(
    externalRoot,
    "gate-receipts",
    `${originalPromotion.gateReceiptSha256}.json`,
  );
  const originalInternalReceipt = JSON.parse(
    fs.readFileSync(originalInternalReceiptPath, "utf8"),
  ) as EvaluationGateReceipt;
  const providerReceipt = JSON.parse(fs.readFileSync(path.join(
    externalRoot,
    "gate-receipts",
    `${originalInternalReceipt.previousReceiptSha256s[1]}.json`,
  ), "utf8")) as EvaluationGateReceipt;
  assert.ok(providerReceipt.cases[0]);
  assert.ok(originalInternalReceipt.cases[0]);
  const originalRelease = release.registry.releases[0];
  assert.ok(originalRelease);

  const driftedAuthorizationUnitKey = `sha256:${"9".repeat(64)}` as const;
  const { artifactSha256: _authReceiptSha, ...authReceiptBase } = originalInternalReceipt;
  const driftedAuthorizationReceiptBase = {
    ...authReceiptBase,
    authorizationUnitKey: driftedAuthorizationUnitKey,
  };
  const driftedAuthorizationReceipt: EvaluationGateReceipt = {
    ...driftedAuthorizationReceiptBase,
    artifactSha256: evaluationArtifactSha256(driftedAuthorizationReceiptBase),
  };
  writeArtifact("gate-receipts", driftedAuthorizationReceipt);
  const { artifactSha256: _authPromotionSha, ...authPromotionBase } = originalPromotion;
  const driftedAuthorizationPromotionBase = {
    ...authPromotionBase,
    authorizationUnitKey: driftedAuthorizationUnitKey,
    gateReceiptSha256: driftedAuthorizationReceipt.artifactSha256,
  };
  const driftedAuthorizationPromotion: EvaluationPromotionArtifact = {
    ...driftedAuthorizationPromotionBase,
    artifactSha256: evaluationArtifactSha256(driftedAuthorizationPromotionBase),
  };
  writeArtifact("promotions", driftedAuthorizationPromotion);
  const driftedAuthorizationRegistry: PromptEvaluationReleaseRegistry = {
    ...release.registry,
    releases: [{
      ...originalRelease,
      evidenceArtifactId: `promotions/${driftedAuthorizationPromotion.artifactSha256}.json`,
      evidenceArtifactSha256: driftedAuthorizationPromotion.artifactSha256,
      gateReceiptSha256: driftedAuthorizationReceipt.artifactSha256,
      evaluationUnitKey: driftedAuthorizationUnitKey,
    }],
  };
  writeJson(release.registryPath, driftedAuthorizationRegistry);
  assert.throws(() => verifyEvaluationReleaseBundle({
    releaseRoot: externalRoot,
    registryPath: release.registryPath,
    registry: driftedAuthorizationRegistry,
    codeSha: CODE_SHA,
    modelCatalogBaseline: release.baseline,
  }), /authorizationUnitKey differs from the previous paid stage/,
  "完全重算 receipt、promotion 与 registry 后仍必须拒绝跨阶段授权单元漂移");
  writeJson(release.registryPath, release.registry);

  const forgedCases = originalInternalReceipt.cases.map((caseRef, index) => (
    index === 0 ? { ...caseRef, runId: providerReceipt.cases[0].runId } : caseRef
  ));
  const { artifactSha256: _internalSha, ...internalBase } = originalInternalReceipt;
  const forgedInternalBase = { ...internalBase, cases: forgedCases };
  const forgedInternalReceipt: EvaluationGateReceipt = {
    ...forgedInternalBase,
    artifactSha256: evaluationArtifactSha256(forgedInternalBase),
  };
  writeArtifact("gate-receipts", forgedInternalReceipt);

  const { artifactSha256: _promotionSha, ...promotionBase } = originalPromotion;
  const forgedPromotionBase = {
    ...promotionBase,
    gateReceiptSha256: forgedInternalReceipt.artifactSha256,
    cases: forgedCases,
  };
  const forgedPromotion: EvaluationPromotionArtifact = {
    ...forgedPromotionBase,
    artifactSha256: evaluationArtifactSha256(forgedPromotionBase),
  };
  writeArtifact("promotions", forgedPromotion);
  const forgedRegistry: PromptEvaluationReleaseRegistry = {
    ...release.registry,
    releases: [{
      ...originalRelease,
      evidenceArtifactId: `promotions/${forgedPromotion.artifactSha256}.json`,
      evidenceArtifactSha256: forgedPromotion.artifactSha256,
      gateReceiptSha256: forgedInternalReceipt.artifactSha256,
    }],
  };
  writeJson(release.registryPath, forgedRegistry);
  assert.throws(() => verifyEvaluationReleaseBundle({
    releaseRoot: externalRoot,
    registryPath: release.registryPath,
    registry: forgedRegistry,
    codeSha: CODE_SHA,
    modelCatalogBaseline: release.baseline,
  }), /runId reuses previous-stage runId/,
  "完全重算 receipt、promotion 与 registry 后仍必须拒绝跨阶段借证据");

  const recommendedRegistry: PromptEvaluationReleaseRegistry = {
    ...release.registry,
    releases: [{
      ...originalRelease,
      supportStatus: "recommended",
      evaluationStage: "recommendation",
    }],
  };
  writeJson(release.registryPath, recommendedRegistry);
  assert.throws(() => verifyEvaluationReleaseBundle({
    releaseRoot: externalRoot,
    registryPath: release.registryPath,
    registry: recommendedRegistry,
    codeSha: CODE_SHA,
    modelCatalogBaseline: release.baseline,
  }), /blocked until a reviewed same-model baseline definition/,
  "mounted raw bytes 与内存一致时 recommended registry 仍必须 fail-close");
  writeJson(release.registryPath, release.registry);

  assert.throws(() => assertEvaluationReleaseRuntimeConfig({
    projectRoot,
    isProduction: true,
    apiOnly: false,
    env: runtimeEnv,
    embeddedRegistry: build.registry,
    modelCatalogBaseline: release.baseline,
    linuxMountInfoTextForTest: "",
  }), /Linux mountinfo is empty/);

  console.log("  ✓ 空发布、固定布局递归链、模型基线、原始字节 bundle、代码 SHA 与 manifest 均 fail-closed");
} finally {
  makeTreeWritable(temp);
  fs.rmSync(temp, { recursive: true, force: true, maxRetries: 3 });
}
