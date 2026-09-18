import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  EVALUATION_RELEASE_BUILD_MANIFEST_FILENAME,
  evaluationReleaseBuildManifestJson,
  loadEvaluationReleaseBuildInput,
  validateEvaluationReleaseBuildManifest,
} from "../server/lib/evaluationReleaseBuild";
import { requireGarmentPromptVariant } from "../src/lib/garmentPromptPresets";
import { createPromptEvaluationReleaseSnapshot } from "../src/lib/promptEvaluationRelease";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CODE_SHA = "1".repeat(40);
const BUNDLE_SHA = "2".repeat(64);
const ARTIFACT_SHA = "3".repeat(64);
const tempRoot = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), "garment-release-build-"));

function fileSha256(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

console.log("外置评估发布 registry 构建输入契约测试");

try {
  const empty = loadEvaluationReleaseBuildInput({}, ROOT);
  assert.equal(empty.registry.releases.length, 0);
  assert.equal(empty.manifest.releaseMode, "empty");
  assert.equal(empty.manifest.codeSha, null);
  assert.equal(empty.manifest.bundleSha256, null);
  assert.deepEqual(
    validateEvaluationReleaseBuildManifest(JSON.parse(evaluationReleaseBuildManifestJson(empty.manifest))),
    empty.manifest,
  );

  assert.throws(
    () => loadEvaluationReleaseBuildInput({
      GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SHA256: "a".repeat(64),
    }, ROOT),
    /REGISTRY_PATH.*required/,
    "配置 SHA 却没有显式外部路径时不得回退到 tracked registry",
  );

  const variant = requireGarmentPromptVariant({
    familyId: "commerce-hero",
    modelId: "gpt-image-2.5-flare-vip",
    nodeKind: "sketch-to-render",
    mode: "generate",
  });
  const release = createPromptEvaluationReleaseSnapshot(
    variant,
    "verified",
    "evaluation-artifact:external-build-test",
    {
      evaluationStage: "formal-validation",
      evidenceArtifactSha256: ARTIFACT_SHA,
      gateReceiptSha256: ARTIFACT_SHA,
      evaluationUnitKey: `sha256:${ARTIFACT_SHA}`,
      codeSha: CODE_SHA,
    },
  );
  const registryPath = path.join(tempRoot, "registry.json");
  fs.writeFileSync(registryPath, `${JSON.stringify({
    schemaVersion: 1,
    generatedAt: "2026-09-03T00:00:00.000Z",
    releases: [release],
  })}\n`);
  const registrySha = fileSha256(registryPath);

  const detachedRecommendation = createPromptEvaluationReleaseSnapshot(
    variant,
    "recommended",
    "evaluation-artifact:detached-recommendation-build-test",
    {
      evaluationStage: "recommendation",
      evidenceArtifactSha256: ARTIFACT_SHA,
      gateReceiptSha256: ARTIFACT_SHA,
      evaluationUnitKey: `sha256:${ARTIFACT_SHA}`,
      codeSha: CODE_SHA,
    },
  );
  const recommendedRegistryPath = path.join(tempRoot, "recommended-registry.json");
  fs.writeFileSync(recommendedRegistryPath, `${JSON.stringify({
    schemaVersion: 1,
    generatedAt: "2026-09-03T00:00:00.000Z",
    releases: [detachedRecommendation],
  })}\n`);
  assert.throws(
    () => loadEvaluationReleaseBuildInput({
      GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_PATH: recommendedRegistryPath,
      GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SHA256: fileSha256(recommendedRegistryPath),
      GARMENT_CANVAS_EVALUATION_RELEASE_BUNDLE_SHA256: BUNDLE_SHA,
      GARMENT_CANVAS_BUILD_CODE_SHA: CODE_SHA,
    }, ROOT),
    /Recommendation is blocked until a reviewed same-model baseline definition/,
    "detached recommended release must be rejected before browser/server build injection",
  );

  assert.throws(
    () => loadEvaluationReleaseBuildInput({
      GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_PATH: "relative/registry.json",
      GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SHA256: registrySha,
    }, ROOT),
    /must be an absolute path/,
  );
  assert.throws(
    () => loadEvaluationReleaseBuildInput({
      GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_PATH: registryPath,
      GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SHA256: "f".repeat(64),
    }, ROOT),
    /does not match the external registry bytes/,
  );
  assert.throws(
    () => loadEvaluationReleaseBuildInput({
      GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_PATH: registryPath,
      GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SHA256: registrySha,
    }, ROOT),
    /BUNDLE_SHA256 must be/,
    "非空 registry 必须绑定完整 bundle SHA",
  );
  for (const invalidLength of [41, 63]) {
    assert.throws(
      () => loadEvaluationReleaseBuildInput({
        GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_PATH: registryPath,
        GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SHA256: registrySha,
        GARMENT_CANVAS_EVALUATION_RELEASE_BUNDLE_SHA256: BUNDLE_SHA,
        GARMENT_CANVAS_BUILD_CODE_SHA: "4".repeat(invalidLength),
      }, ROOT),
      /must be exactly 40 or 64 lowercase hexadecimal characters/,
      `${invalidLength} 位构建 SHA 必须被拒绝`,
    );
  }

  const symlinkPath = path.join(tempRoot, "registry-link.json");
  fs.symlinkSync(registryPath, symlinkPath);
  assert.throws(
    () => loadEvaluationReleaseBuildInput({
      GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_PATH: symlinkPath,
      GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SHA256: registrySha,
      GARMENT_CANVAS_EVALUATION_RELEASE_BUNDLE_SHA256: BUNDLE_SHA,
      GARMENT_CANVAS_BUILD_CODE_SHA: CODE_SHA,
    }, ROOT),
    /must not traverse symlinks/,
  );

  const symlinkDirectory = path.join(path.dirname(tempRoot), `${path.basename(tempRoot)}-link`);
  fs.symlinkSync(tempRoot, symlinkDirectory, "dir");
  assert.throws(
    () => loadEvaluationReleaseBuildInput({
      GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_PATH: path.join(symlinkDirectory, "registry.json"),
      GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SHA256: registrySha,
      GARMENT_CANVAS_EVALUATION_RELEASE_BUNDLE_SHA256: BUNDLE_SHA,
      GARMENT_CANVAS_BUILD_CODE_SHA: CODE_SHA,
    }, ROOT),
    /must not traverse symlinks/,
  );
  fs.unlinkSync(symlinkDirectory);

  const loaded = loadEvaluationReleaseBuildInput({
    GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_PATH: registryPath,
    GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SHA256: registrySha,
    GARMENT_CANVAS_EVALUATION_RELEASE_BUNDLE_SHA256: BUNDLE_SHA,
    GARMENT_CANVAS_BUILD_CODE_SHA: CODE_SHA,
  }, ROOT);
  assert.equal(loaded.manifest.releaseMode, "external");
  assert.equal(loaded.manifest.codeSha, CODE_SHA);
  assert.equal(loaded.manifest.bundleSha256, BUNDLE_SHA);
  assert.equal(loaded.manifest.registryFileSha256, registrySha);
  assert.equal(loaded.registry.releases[0]?.variantId, variant.variantId);
  assert.deepEqual(
    validateEvaluationReleaseBuildManifest(JSON.parse(evaluationReleaseBuildManifestJson(loaded.manifest))),
    loaded.manifest,
  );
  assert.equal(
    validateEvaluationReleaseBuildManifest({ ...loaded.manifest, codeSha: "4".repeat(64) }).codeSha,
    "4".repeat(64),
  );

  const nonEmptyReleaseEnv = {
    ...process.env,
    GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_PATH: registryPath,
    GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SHA256: registrySha,
    GARMENT_CANVAS_EVALUATION_RELEASE_BUNDLE_SHA256: BUNDLE_SHA,
    GARMENT_CANVAS_BUILD_CODE_SHA: CODE_SHA,
  };
  const viteOutputDirectory = path.join(tempRoot, "vite-dist");
  const viteBuild = spawnSync(process.execPath, [
    path.join(ROOT, "node_modules/vite/bin/vite.js"),
    "build",
    "--config",
    path.join(ROOT, "vite.config.ts"),
    "--outDir",
    viteOutputDirectory,
  ], {
    cwd: ROOT,
    encoding: "utf8",
    env: nonEmptyReleaseEnv,
  });
  assert.equal(
    viteBuild.status,
    0,
    `Vite entrypoint must accept a hash-pinned non-empty registry:\n${viteBuild.stdout}\n${viteBuild.stderr}`,
  );
  assert.deepEqual(
    validateEvaluationReleaseBuildManifest(JSON.parse(fs.readFileSync(
      path.join(viteOutputDirectory, EVALUATION_RELEASE_BUILD_MANIFEST_FILENAME),
      "utf8",
    ))),
    loaded.manifest,
    "Vite must emit the same pinned release identity that server runtime will verify",
  );

  const serverBuild = spawnSync(process.execPath, [
    path.join(ROOT, "node_modules/tsx/dist/cli.mjs"),
    path.join(ROOT, "scripts/build-server.ts"),
  ], {
    cwd: ROOT,
    encoding: "utf8",
    env: nonEmptyReleaseEnv,
  });
  const serverBuildOutput = `${serverBuild.stdout}\n${serverBuild.stderr}`;
  assert.equal(
    serverBuild.status,
    0,
    `server build must accept a hash-pinned non-empty registry:\n${serverBuildOutput}`,
  );
  assert.deepEqual(
    validateEvaluationReleaseBuildManifest(JSON.parse(fs.readFileSync(
      path.join(ROOT, "dist-server", EVALUATION_RELEASE_BUILD_MANIFEST_FILENAME),
      "utf8",
    ))),
    loaded.manifest,
    "server build must emit the same pinned release identity that runtime will verify",
  );
  assert.doesNotMatch(
    serverBuildOutput,
    /immutable campaign\/stage ledger/,
    "a global implementation-status switch must not replace concrete runtime closure verification",
  );
  console.log("  ✓ Vite 与 server build 真实入口接受已锁定身份的非空发布；完整闭包留给运行时验证");

  assert.throws(
    () => validateEvaluationReleaseBuildManifest({
      ...loaded.manifest,
      releaseCount: 0,
    }),
    /empty external registry must not claim release identity/,
  );
  assert.throws(
    () => validateEvaluationReleaseBuildManifest({ ...loaded.manifest, extra: true }),
    /unknown field extra/,
  );

  console.log("  ✓ 默认空、外部路径、原始字节 SHA、bundle/code SHA 与 manifest 均 fail-closed");
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
