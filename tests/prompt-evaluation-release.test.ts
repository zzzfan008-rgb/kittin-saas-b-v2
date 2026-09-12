import assert from "node:assert/strict";
import fs from "node:fs";
import {
  requireGarmentPromptVariant,
  type PromptVariant,
} from "../src/lib/garmentPromptPresets";
import {
  createPromptEvaluationReleaseSnapshot,
  effectivePromptSupport,
  getRuntimePromptVariantAvailability,
} from "../src/lib/promptEvaluationRelease";
import {
  PROMPT_EVALUATION_RELEASES,
  type PromptEvaluationRelease,
  validatePromptEvaluationReleaseRegistry,
} from "../src/lib/promptEvaluationReleaseRegistry";
import { promptRunReferenceRoleProfile } from "../src/lib/promptRunAdmission";
import { getModelParameterProfile } from "../src/types/modelParameterProfiles";
import {
  PROVIDER_PROMPT_RENDERER_CONTRACT,
  PROVIDER_PROMPT_RENDERER_HASH,
  PROVIDER_PROMPT_RENDERER_VERSION,
} from "../src/lib/providerPromptRenderer";
import {
  promotePromptVariantForTest,
  TEST_PROMPT_RELEASE_CODE_SHA,
} from "./promptReleaseTestSupport";

const TEST_SHA256 = "0".repeat(64);

const catalogVariant = requireGarmentPromptVariant({
  familyId: "commerce-hero",
  modelId: "gpt-image-2-vip",
  nodeKind: "sketch-to-render",
  mode: "generate",
});
const promoted = { ...catalogVariant, supportStatus: "verified" } satisfies PromptVariant;
const release = createPromptEvaluationReleaseSnapshot(
  promoted,
  [],
  "verified",
  "evaluation-artifact:test-only",
  {
    evaluationStage: "formal-validation",
    evidenceArtifactSha256: TEST_SHA256,
    gateReceiptSha256: TEST_SHA256,
    evaluationUnitKey: `sha256:${TEST_SHA256}`,
    codeSha: TEST_PROMPT_RELEASE_CODE_SHA,
  },
);

assert.equal("approvedBy" in release, false, "runtime release must not expose the promotion administrator");
assert.equal("approvalReason" in release, false, "runtime release must not expose the promotion reason");
assert.equal("approvedAt" in release, false, "runtime release must not expose the promotion timestamp");
const legacyAuditRegistry = validatePromptEvaluationReleaseRegistry({
  schemaVersion: 1,
  generatedAt: "2026-09-02T00:00:00.000Z",
  releases: [{
    ...release,
    approvedBy: "legacy-admin",
    approvalReason: "legacy reason",
    approvedAt: "2026-09-02T00:00:00.000Z",
  }],
});
for (const field of ["approvedBy", "approvalReason", "approvedAt"]) {
  assert.ok(
    legacyAuditRegistry.errors.some((error) => error.includes(`unknown field ${field}`)),
    `legacy runtime audit field ${field} must fail closed as unknown`,
  );
}

const detachedRecommendationRelease = createPromptEvaluationReleaseSnapshot(
  promoted,
  [],
  "recommended",
  "evaluation-artifact:detached-baseline-must-not-register",
  {
    evaluationStage: "recommendation",
    evidenceArtifactSha256: TEST_SHA256,
    gateReceiptSha256: TEST_SHA256,
    evaluationUnitKey: `sha256:${TEST_SHA256}`,
    codeSha: TEST_PROMPT_RELEASE_CODE_SHA,
  },
);
const blockedRecommendationRegistry = validatePromptEvaluationReleaseRegistry({
  schemaVersion: 1,
  generatedAt: "2026-09-03T00:00:00.000Z",
  releases: [detachedRecommendationRelease],
});
assert.ok(
  blockedRecommendationRegistry.errors.some((error) => (
    error.includes("Recommendation is blocked until a reviewed same-model baseline definition")
  )),
  "recommended registry entry must fail closed before browser/server build injection",
);

assert.equal(PROMPT_EVALUATION_RELEASES.length, 0, "未取得真实评估授权前发布注册表必须为空");
assert.equal(effectivePromptSupport(promoted, [], [release], TEST_PROMPT_RELEASE_CODE_SHA).status, "verified");
assert.equal(effectivePromptSupport(promoted, [], [release], undefined).status, "unverified");
assert.equal(effectivePromptSupport(promoted, [], [release], "f".repeat(40)).status, "unverified");
assert.match(release.releaseVector, new RegExp(PROVIDER_PROMPT_RENDERER_VERSION));
assert.match(release.releaseVector, new RegExp(PROVIDER_PROMPT_RENDERER_HASH));
assert.equal(effectivePromptSupport(promoted, [], []).status, "unverified");
assert.equal(effectivePromptSupport({ ...promoted, fullPrompt: `${promoted.fullPrompt}\n未评估变更` }, [], [release], TEST_PROMPT_RELEASE_CODE_SHA).status, "unverified");
assert.equal(effectivePromptSupport({ ...promoted, contractHash: `sha256:${"0".repeat(64)}` }, [], [release], TEST_PROMPT_RELEASE_CODE_SHA).status, "unverified");
assert.equal(effectivePromptSupport({ ...promoted, evaluationVersion: "forgotten-version-bump" }, [], [release], TEST_PROMPT_RELEASE_CODE_SHA).status, "unverified");

const profile = getModelParameterProfile(promoted.parameterProfileId)!;
const originalPostprocess = profile.postprocess.version;
const originalNativeSize = profile.native.kind === "gpt-image-2-vip" ? profile.native.size : undefined;
const originalRendererSeparator = PROVIDER_PROMPT_RENDERER_CONTRACT.separator;
try {
  (profile.postprocess as { version: string }).version = "changed-without-version-bump";
  assert.equal(effectivePromptSupport(promoted, [], [release], TEST_PROMPT_RELEASE_CODE_SHA).status, "unverified");
  (profile.postprocess as { version: string }).version = originalPostprocess;
  if (profile.native.kind !== "gpt-image-2-vip") throw new Error("测试参数档案类型异常");
  (profile.native as { size: string }).size = "changed-without-profile-version";
  assert.equal(effectivePromptSupport(promoted, [], [release], TEST_PROMPT_RELEASE_CODE_SHA).status, "unverified");
  (profile.native as { size: string }).size = originalNativeSize!;
  (PROVIDER_PROMPT_RENDERER_CONTRACT as { separator: string }).separator = "\n\n";
  assert.equal(
    effectivePromptSupport(promoted, [], [release], TEST_PROMPT_RELEASE_CODE_SHA).status,
    "unverified",
    "renderer 语义变化必须自动使旧发布向量失效",
  );
} finally {
  (PROVIDER_PROMPT_RENDERER_CONTRACT as { separator: string }).separator = originalRendererSeparator;
  (profile.postprocess as { version: string }).version = originalPostprocess;
  if (profile.native.kind === "gpt-image-2-vip" && originalNativeSize) {
    (profile.native as { size: string }).size = originalNativeSize;
  }
}

assert.equal(getRuntimePromptVariantAvailability({
  familyId: catalogVariant.familyId,
  modelId: catalogVariant.modelId,
  nodeKind: catalogVariant.nodeKind,
  mode: catalogVariant.mode,
}).enabled, false);

const editVariant = requireGarmentPromptVariant({
  familyId: "fashion-lookbook",
  modelId: "gemini-3.1-flash-image",
  nodeKind: "ai-modify",
  mode: "edit",
});
const editReferences = [
  { order: 0, role: "identity" as const, roleNeedsConfirmation: false },
  { order: 1, role: "pose_composition" as const, roleNeedsConfirmation: false },
  { order: 2, role: "garment_top" as const, roleNeedsConfirmation: false },
  { order: 3, role: "garment_bottom" as const, roleNeedsConfirmation: false },
];
const editReferenceRoleProfile = promptRunReferenceRoleProfile({
  nodeKind: editVariant.nodeKind,
  operationMode: editVariant.mode,
  references: editReferences,
});
const reorderedEditReferenceRoleProfile = promptRunReferenceRoleProfile({
  nodeKind: editVariant.nodeKind,
  operationMode: editVariant.mode,
  references: [
    { ...editReferences[1], order: 0 },
    { ...editReferences[0], order: 1 },
    ...editReferences.slice(2),
  ],
});
const maskVariant = requireGarmentPromptVariant({
  familyId: "mask-local-edit",
  modelId: "gpt-image-2",
  nodeKind: "mask-redraw",
  mode: "mask-edit",
});
const maskReferenceRoleProfile = promptRunReferenceRoleProfile({
  nodeKind: maskVariant.nodeKind,
  operationMode: maskVariant.mode,
  references: [{ order: 0, role: "garment_full", roleNeedsConfirmation: false }],
});
assert.deepEqual(maskReferenceRoleProfile, [
  { order: 0, role: "garment_full" },
  { order: 1, role: "generic" },
  { order: 2, role: "mask" },
], "蒙版预设必须复用运行时规则追加 guide generic 与 mask");

const mutableReleases = PROMPT_EVALUATION_RELEASES as PromptEvaluationRelease[];
const originalReleases = [...mutableReleases];
const originalEditStatus = editVariant.supportStatus;
const originalMaskStatus = maskVariant.supportStatus;
try {
  promotePromptVariantForTest(editVariant, "verified", editReferenceRoleProfile);
  assert.equal(getRuntimePromptVariantAvailability(
    {
      familyId: editVariant.familyId,
      modelId: editVariant.modelId,
      nodeKind: editVariant.nodeKind,
      mode: editVariant.mode,
    },
    { referenceRoleProfile: editReferenceRoleProfile, currentCodeSha: TEST_PROMPT_RELEASE_CODE_SHA },
  ).enabled, true, "未来 verified 编辑发布应允许 UI 应用精确匹配的有序角色配置");
  assert.equal(getRuntimePromptVariantAvailability(
    {
      familyId: editVariant.familyId,
      modelId: editVariant.modelId,
      nodeKind: editVariant.nodeKind,
      mode: editVariant.mode,
    },
    { referenceRoleProfile: reorderedEditReferenceRoleProfile, currentCodeSha: TEST_PROMPT_RELEASE_CODE_SHA },
  ).enabled, false, "角色顺序变化不得复用已发布编辑评估");

  promotePromptVariantForTest(maskVariant, "recommended", maskReferenceRoleProfile);
  assert.equal(getRuntimePromptVariantAvailability(
    {
      familyId: maskVariant.familyId,
      modelId: maskVariant.modelId,
      nodeKind: maskVariant.nodeKind,
      mode: maskVariant.mode,
    },
    { referenceRoleProfile: maskReferenceRoleProfile, currentCodeSha: TEST_PROMPT_RELEASE_CODE_SHA },
  ).enabled, true, "未来 recommended 蒙版发布应允许 UI 应用精确运行时角色配置");
} finally {
  (editVariant as { supportStatus: string }).supportStatus = originalEditStatus;
  (maskVariant as { supportStatus: string }).supportStatus = originalMaskStatus;
  mutableReleases.splice(0, mutableReleases.length, ...originalReleases);
}

const inspectorSource = fs.readFileSync(
  new URL("../src/components/panels/InspectorPanel.tsx", import.meta.url),
  "utf8",
);
assert.match(inspectorSource, /const referenceRoleProfile = promptRunReferenceRoleProfile\(\{\s*nodeKind,\s*operationMode,\s*references,/s);
assert.match(inspectorSource, /\{ referenceRoleProfile \},/);
assert.match(inspectorSource, /references=\{incomingReferenceState\}/);

const maskNodeSource = fs.readFileSync(
  new URL("../src/components/nodes/MaskRedrawNode.tsx", import.meta.url),
  "utf8",
);
assert.match(maskNodeSource, /presetReferenceRoleProfile = useMemo\(\(\) => promptRunReferenceRoleProfile\(\{/);
assert.match(maskNodeSource, /\{ referenceRoleProfile: presetReferenceRoleProfile \},/);

console.log("提示词评估发布快照与自动降级测试通过");
