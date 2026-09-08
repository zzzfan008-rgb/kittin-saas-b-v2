import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  EVALUATION_RELEASE_BUNDLE_HASH_SCOPE,
  EVALUATION_RELEASE_REGISTRY_LOCK_FILENAME,
  EVALUATION_RELEASE_REGISTRY_RELATIVE_PATH,
  EVALUATION_RELEASE_ROOT_MARKER_CONTENT,
  EVALUATION_RELEASE_ROOT_MARKER_FILENAME,
  evaluationReleaseBundleSha256,
  materializeAndVerifyRetainedGatewayModelCatalog,
  parseEvaluationReviewCliArgs,
  resolveEvaluationReleaseRoot,
  runEvaluationReviewCommand,
  validateReviewedGatewayModelCatalogBytes,
  verifyEvaluationReleaseRegistryArtifacts,
  withEvaluationReleaseRegistryLock,
} from "../scripts/evaluation-review";
import { createPromptEvaluationReleaseSnapshot } from "../src/lib/promptEvaluationRelease";
import { requireGarmentPromptVariant } from "../src/lib/garmentPromptPresets";
import type { PromptEvaluationReleaseRegistry } from "../src/lib/promptEvaluationReleaseRegistry";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CODE_SHA = "1".repeat(40);
const SHA = "a".repeat(64);
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "garment-evaluation-review-cli-"));

function sha256(filename: string): string {
  return createHash("sha256").update(fs.readFileSync(filename)).digest("hex");
}

console.log("外置评估复核 CLI 与递归发布包测试");

try {
  const explicit = path.join(tempRoot, "explicit-release");
  assert.equal(resolveEvaluationReleaseRoot(explicit, {}), fs.realpathSync(explicit));
  assert.equal(fs.statSync(explicit).mode & 0o777, 0o755);
  const markerPath = path.join(explicit, EVALUATION_RELEASE_ROOT_MARKER_FILENAME);
  assert.equal(fs.readFileSync(markerPath, "utf8"), EVALUATION_RELEASE_ROOT_MARKER_CONTENT);
  assert.equal(fs.statSync(markerPath).mode & 0o777, 0o644);
  fs.chmodSync(markerPath, 0o604);
  assert.throws(
    () => resolveEvaluationReleaseRoot(explicit, {}, false),
    /exactly 0644/,
  );
  fs.chmodSync(markerPath, 0o644);
  assert.throws(
    () => resolveEvaluationReleaseRoot(path.join(PROJECT_ROOT, "data/evaluation-release"), {}),
    /outside the tracked project tree/,
  );
  assert.throws(() => resolveEvaluationReleaseRoot(path.parse(PROJECT_ROOT).root, {}, false), /broad directory/);
  assert.throws(() => resolveEvaluationReleaseRoot(os.homedir(), {}, false), /user HOME|project root or one of its ancestors/);
  assert.throws(() => resolveEvaluationReleaseRoot(path.dirname(PROJECT_ROOT), {}, false), /project root or one of its ancestors/);
  const unmarked = path.join(tempRoot, "unmarked-release");
  fs.mkdirSync(unmarked, { mode: 0o755 });
  fs.chmodSync(unmarked, 0o755);
  fs.writeFileSync(path.join(unmarked, "unrelated.txt"), "not dedicated\n", { mode: 0o644 });
  assert.throws(() => resolveEvaluationReleaseRoot(unmarked, {}), /non-empty and has no dedicated release marker/);

  const dataDir = path.join(tempRoot, "runtime-data");
  fs.mkdirSync(dataDir);
  const dataRelease = resolveEvaluationReleaseRoot(undefined, { DATA_DIR: dataDir });
  assert.equal(dataRelease, fs.realpathSync(path.join(dataDir, "evaluation-release")));

  const symlinkTarget = path.join(tempRoot, "symlink-target");
  fs.mkdirSync(symlinkTarget);
  const symlinkRoot = path.join(tempRoot, "release-link");
  fs.symlinkSync(symlinkTarget, symlinkRoot);
  assert.throws(
    () => resolveEvaluationReleaseRoot(symlinkRoot, {}, false),
    /must not be a symlink/,
  );
  console.log("  ✓ root 只能来自显式外部绝对路径或外部 DATA_DIR，拒绝 repo 与 symlink");

  const parsed = parseEvaluationReviewCliArgs([
    "contract-check",
    "--release-root", explicit,
    "--model-list", path.join(tempRoot, "models.json"),
    "--admin-id", "admin-test",
    "--audit-reason", "offline contract review",
    "--variant-id", "variant-test",
    "--reference-profile-file", path.join(tempRoot, "profile.json"),
    "--code-sha", CODE_SHA,
  ]);
  assert.equal(parsed.flags.get("release-root")?.[0], explicit);
  assert.equal(parsed.flags.get("model-list")?.[0], path.join(tempRoot, "models.json"));
  assert.throws(
    () => parseEvaluationReviewCliArgs([
      "score",
      "--admin-id", "admin-test",
      "--audit-reason", "detached baseline rejection",
      "--case-evidence-id", "case-evidence-test",
      "--run-id", "run-test",
      "--output-index", "0",
      "--scores-file", path.join(tempRoot, "scores.json"),
      "--baseline-scores-file", path.join(tempRoot, "baseline-scores.json"),
    ]),
    /unexpected flag for score: --baseline-scores-file/,
    "CLI must reject detached baseline scorecards before database access",
  );
  const blockedRecommendationRoot = path.join(tempRoot, "blocked-recommendation-release");
  await assert.rejects(
    runEvaluationReviewCommand(parseEvaluationReviewCliArgs([
      "gate",
      "--release-root", blockedRecommendationRoot,
      "--admin-id", "admin-test",
      "--audit-reason", "detached recommendation must fail before side effects",
      "--stage", "recommendation",
      "--code-sha", CODE_SHA,
    ])),
    /Recommendation is blocked until a reviewed same-model baseline definition/,
  );
  assert.equal(
    fs.existsSync(blockedRecommendationRoot),
    false,
    "blocked recommendation gate must not create a release directory or contact the database",
  );
  const blockedCampaignRoot = path.join(tempRoot, "blocked-campaign-release");
  await assert.rejects(
    runEvaluationReviewCommand(parseEvaluationReviewCliArgs([
      "gate",
      "--release-root", blockedCampaignRoot,
      "--admin-id", "admin-test",
      "--audit-reason", "campaign completeness must precede quality-stage gate",
      "--stage", "internal-experiment",
      "--code-sha", CODE_SHA,
    ])),
    /paid evaluation gate requires --campaign-id/,
  );
  assert.equal(
    fs.existsSync(blockedCampaignRoot),
    false,
    "blocked campaign gate must not create a release directory or contact the database",
  );
  const forbiddenCasesRoot = path.join(tempRoot, "forbidden-cases-release");
  await assert.rejects(
    runEvaluationReviewCommand(parseEvaluationReviewCliArgs([
      "gate",
      "--release-root", forbiddenCasesRoot,
      "--admin-id", "admin-test",
      "--audit-reason", "sealed campaign must own the complete case set",
      "--stage", "internal-experiment",
      "--campaign-id", "campaign-test",
      "--cases-file", path.join(tempRoot, "operator-selected-cases.json"),
      "--code-sha", CODE_SHA,
    ])),
    /sealed campaign; --cases-file is forbidden/,
  );
  assert.equal(
    fs.existsSync(forbiddenCasesRoot),
    false,
    "operator-selected paid cases must be rejected before release-root creation",
  );
  const blockedPromotionRoot = path.join(tempRoot, "blocked-campaign-promotion-release");
  await assert.rejects(
    runEvaluationReviewCommand(parseEvaluationReviewCliArgs([
      "promote",
      "--release-root", blockedPromotionRoot,
      "--admin-id", "admin-test",
      "--audit-reason", "campaign completeness must precede promotion",
      "--code-sha", CODE_SHA,
    ])),
    /--gate-receipt is required/,
  );
  assert.equal(
    fs.existsSync(blockedPromotionRoot),
    false,
    "missing promotion receipt must not create a release directory or contact the database",
  );

  const emptyRegistry: PromptEvaluationReleaseRegistry = {
    schemaVersion: 1,
    generatedAt: null,
    releases: [],
  };
  const registryPath = path.join(explicit, EVALUATION_RELEASE_REGISTRY_RELATIVE_PATH);
  fs.writeFileSync(registryPath, `${JSON.stringify(emptyRegistry, null, 2)}\n`, { mode: 0o644 });
  fs.chmodSync(registryPath, 0o644);
  const checked = await runEvaluationReviewCommand(parseEvaluationReviewCliArgs([
    "registry-check",
    "--release-root", explicit,
  ]));
  const expectedFiles = [{ path: "prompt-release-registry.json", sha256: sha256(registryPath) }];
  const expectedBundle = createHash("sha256").update(
    JSON.stringify({
      files: expectedFiles,
      hashScope: EVALUATION_RELEASE_BUNDLE_HASH_SCOPE,
      schemaVersion: 1,
    }),
  ).digest("hex");
  assert.equal(checked.bundleSha256, expectedBundle);
  assert.deepEqual(checked.bundleFiles, expectedFiles);
  assert.equal(fs.statSync(registryPath).mode & 0o777, 0o644);
  assert.equal(fs.existsSync(path.join(explicit, EVALUATION_RELEASE_REGISTRY_LOCK_FILENAME)), false);

  fs.writeFileSync(path.join(explicit, "unreferenced.txt"), "not in recursive release chain\n");
  const direct = verifyEvaluationReleaseRegistryArtifacts(explicit, emptyRegistry, undefined, registryPath);
  assert.equal(direct.bundleSha256, expectedBundle, "unreferenced files must not enter the recursive bundle");
  assert.deepEqual(
    evaluationReleaseBundleSha256([...expectedFiles].reverse()),
    { bundleSha256: expectedBundle, files: expectedFiles },
  );
  assert.throws(
    () => evaluationReleaseBundleSha256([
      ...expectedFiles,
      { ...expectedFiles[0], path: "../escaped.json" },
    ]),
    /invalid relative POSIX path/,
  );
  console.log("  ✓ registry 原始字节 SHA 与递归触达文件集合生成确定性 bundleSha256");

  const variant = requireGarmentPromptVariant({
    familyId: "commerce-hero",
    modelId: "gpt-image-2-vip",
    nodeKind: "sketch-to-render",
    mode: "generate",
  });
  const baseRelease = createPromptEvaluationReleaseSnapshot(
    variant,
    [],
    "experimental",
    `promotions/${SHA}.json`,
    {
      evaluationStage: "internal-experiment",
      evidenceArtifactSha256: SHA,
      gateReceiptSha256: SHA,
      evaluationUnitKey: `sha256:${SHA}`,
      codeSha: CODE_SHA,
    },
  );
  const secondRelease = createPromptEvaluationReleaseSnapshot(
    variant,
    [{ order: 0, role: "identity" }],
    "experimental",
    `promotions/${"b".repeat(64)}.json`,
    {
      evaluationStage: "internal-experiment",
      evidenceArtifactSha256: "b".repeat(64),
      gateReceiptSha256: "b".repeat(64),
      evaluationUnitKey: `sha256:${"b".repeat(64)}`,
      codeSha: CODE_SHA,
    },
  );
  const concurrentRoot = path.join(tempRoot, "concurrent-release");
  resolveEvaluationReleaseRoot(concurrentRoot, {});
  const concurrentRegistryPath = path.join(concurrentRoot, EVALUATION_RELEASE_REGISTRY_RELATIVE_PATH);
  fs.writeFileSync(concurrentRegistryPath, `${JSON.stringify(emptyRegistry, null, 2)}\n`, { mode: 0o644 });
  fs.chmodSync(concurrentRegistryPath, 0o644);
  const workerPath = path.join(tempRoot, "registry-worker.ts");
  fs.writeFileSync(workerPath, `
import { withEvaluationReleaseRegistryLock } from ${JSON.stringify(new URL("../scripts/evaluation-review.ts", import.meta.url).href)};
const root = process.argv[2];
const release = JSON.parse(Buffer.from(process.argv[3], "base64").toString("utf8"));
const delay = Number(process.argv[4]);
withEvaluationReleaseRegistryLock(root, (locked) => {
  const current = locked.read(true);
  if (delay > 0) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, delay);
  const key = JSON.stringify([release.variantId, release.referenceRoleProfile]);
  const releases = current.registry.releases
    .filter((candidate) => JSON.stringify([candidate.variantId, candidate.referenceRoleProfile]) !== key)
    .concat(release)
    .sort((left, right) => left.variantId.localeCompare(right.variantId)
      || JSON.stringify(left.referenceRoleProfile).localeCompare(JSON.stringify(right.referenceRoleProfile)));
  locked.compareAndSwap(current.registryFileSha256, {
    schemaVersion: 1,
    generatedAt: "2026-09-03T00:00:00.000Z",
    releases,
  });
});
`, { mode: 0o644 });
  const runWorker = (release: typeof baseRelease, delay: number) => new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [
      path.join(PROJECT_ROOT, "node_modules/tsx/dist/cli.mjs"),
      workerPath,
      concurrentRoot,
      Buffer.from(JSON.stringify(release)).toString("base64"),
      String(delay),
    ], { cwd: PROJECT_ROOT, encoding: "utf8" });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += String(chunk); });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(stderr || `worker exited ${code}`)));
  });
  await Promise.all([runWorker(baseRelease, 120), runWorker(secondRelease, 0)]);
  const concurrentRegistry = JSON.parse(fs.readFileSync(concurrentRegistryPath, "utf8")) as PromptEvaluationReleaseRegistry;
  assert.equal(concurrentRegistry.releases.length, 2, "并发 promotion 不得丢失先后两个 release");

  const replacedSnapshotRoot = path.join(tempRoot, "replaced-registry-snapshot");
  resolveEvaluationReleaseRoot(replacedSnapshotRoot, {});
  const replacedSnapshotPath = path.join(replacedSnapshotRoot, EVALUATION_RELEASE_REGISTRY_RELATIVE_PATH);
  fs.writeFileSync(replacedSnapshotPath, `${JSON.stringify(emptyRegistry, null, 2)}\n`, { mode: 0o644 });
  fs.chmodSync(replacedSnapshotPath, 0o644);
  let registryReplacementInjected = false;
  assert.throws(
    () => withEvaluationReleaseRegistryLock(
      replacedSnapshotRoot,
      (locked) => locked.read(false),
      {
        afterRegistryReadBeforeFinalStat(registryPath) {
          if (registryReplacementInjected) return;
          registryReplacementInjected = true;
          const replacementPath = path.join(path.dirname(registryPath), ".replacement-registry.json");
          fs.writeFileSync(replacementPath, `${JSON.stringify({
            ...emptyRegistry,
            generatedAt: "2026-09-03T00:00:04.000Z",
          }, null, 2)}\n`, { mode: 0o644 });
          fs.chmodSync(replacementPath, 0o644);
          fs.renameSync(replacementPath, registryPath);
        },
      },
    ),
    /prompt release registry changed while it was being read/,
  );
  assert.equal(registryReplacementInjected, true);

  const exclusiveWriteRoot = path.join(tempRoot, "exclusive-registry-write");
  resolveEvaluationReleaseRoot(exclusiveWriteRoot, {});
  const exclusiveWriteCanonicalRoot = fs.realpathSync(exclusiveWriteRoot);
  const exclusiveRegistryPath = path.join(exclusiveWriteRoot, EVALUATION_RELEASE_REGISTRY_RELATIVE_PATH);
  const exclusiveCanonicalRegistryPath = path.join(exclusiveWriteCanonicalRoot, EVALUATION_RELEASE_REGISTRY_RELATIVE_PATH);
  const competingRegistry: PromptEvaluationReleaseRegistry = {
    schemaVersion: 1,
    generatedAt: "2026-09-03T00:00:05.000Z",
    releases: [],
  };
  let competingWriterPublished = false;
  withEvaluationReleaseRegistryLock(exclusiveWriteRoot, (locked) => {
    const missing = locked.read(true);
    assert.throws(
      () => locked.compareAndSwap(missing.registryFileSha256, emptyRegistry),
      /immutable evaluation release artifact already exists/,
    );
  }, {
    beforeRegistryPublish(registryPath) {
      assert.equal(registryPath, exclusiveCanonicalRegistryPath);
      competingWriterPublished = true;
      fs.writeFileSync(registryPath, `${JSON.stringify(competingRegistry, null, 2)}\n`, { mode: 0o644 });
      fs.chmodSync(registryPath, 0o644);
    },
  });
  assert.equal(competingWriterPublished, true);
  assert.deepEqual(
    JSON.parse(fs.readFileSync(exclusiveRegistryPath, "utf8")),
    competingRegistry,
    "a losing no-clobber writer must not overwrite the concurrently published registry",
  );

  let fsyncedRegistryDirectory: string | undefined;
  withEvaluationReleaseRegistryLock(exclusiveWriteRoot, (locked) => {
      const current = locked.read(false);
      locked.compareAndSwap(current.registryFileSha256, {
        ...current.registry,
        generatedAt: "2026-09-03T00:00:06.000Z",
      });
  }, {
    afterRegistryParentDirectoryFsync(directory) {
      fsyncedRegistryDirectory = directory;
    },
  });
  assert.equal(
    fsyncedRegistryDirectory,
    exclusiveWriteCanonicalRoot,
    "atomic registry publication must fsync its parent directory before success",
  );
  console.log("  ✓ registry 单快照、no-clobber 发布与父目录 fsync 均 fail-closed");

  withEvaluationReleaseRegistryLock(concurrentRoot, (locked) => {
    const stale = locked.read(false);
    const firstSha = locked.compareAndSwap(stale.registryFileSha256, {
      ...stale.registry,
      generatedAt: "2026-09-03T00:00:01.000Z",
    });
    assert.throws(
      () => locked.compareAndSwap(stale.registryFileSha256, {
        ...stale.registry,
        generatedAt: "2026-09-03T00:00:02.000Z",
      }),
      /CAS conflict/,
    );
    const secondSha = locked.compareAndSwap(firstSha, {
      ...stale.registry,
      generatedAt: "2026-09-03T00:00:03.000Z",
    });
    assert.throws(() => locked.restore(firstSha, stale.registryBytes), /CAS conflict/);
    assert.equal(sha256(concurrentRegistryPath), secondSha);
  });
  const staleLockPath = path.join(concurrentRoot, EVALUATION_RELEASE_REGISTRY_LOCK_FILENAME);
  fs.writeFileSync(staleLockPath, "stale\n", { mode: 0o644 });
  fs.chmodSync(staleLockPath, 0o644);
  assert.throws(
    () => withEvaluationReleaseRegistryLock(concurrentRoot, () => undefined, { timeoutMs: 30, pollMs: 5 }),
    /timed out; stale locks are not removed automatically/,
  );
  assert.equal(fs.existsSync(staleLockPath), true);
  fs.unlinkSync(staleLockPath);
  console.log("  ✓ 跨进程锁串行合并，CAS 拒绝 lost update、陈旧 rollback 与自动破锁");

  assert.throws(
    () => verifyEvaluationReleaseRegistryArtifacts(explicit, {
      schemaVersion: 1,
      generatedAt: "2026-09-03T00:00:00.000Z",
      releases: [baseRelease],
    }, undefined, registryPath),
    /registry file differs from the verified registry document/,
  );
  assert.throws(
    () => verifyEvaluationReleaseRegistryArtifacts(explicit, {
      schemaVersion: 1,
      generatedAt: "2026-09-03T00:00:00.000Z",
      releases: [{ ...baseRelease, evidenceArtifactId: "../outside.json" }],
    }),
    /escapes the evaluation release root/,
  );

  const outsideArtifacts = path.join(tempRoot, "outside-promotions");
  fs.mkdirSync(outsideArtifacts);
  fs.writeFileSync(path.join(outsideArtifacts, `${SHA}.json`), "{}\n");
  fs.symlinkSync(outsideArtifacts, path.join(explicit, "promotions"));
  assert.throws(
    () => verifyEvaluationReleaseRegistryArtifacts(explicit, {
      schemaVersion: 1,
      generatedAt: "2026-09-03T00:00:00.000Z",
      releases: [baseRelease],
    }),
    /must not traverse a symlink/,
  );
  console.log("  ✓ registry artifact ID 的 path escape 与目录 symlink 均 fail-closed");

  const profilePath = path.join(tempRoot, "profile.json");
  fs.writeFileSync(profilePath, "[]\n");
  const approvedSyntheticCatalog = Buffer.from('{"data":[{"id":"alpha"},{"id":"beta"}]}\n', "utf8");
  const equivalentSyntheticCatalog = Buffer.from('{\n  "data": [{"id":"beta"}, {"id":"alpha"}, {"id":"alpha"}]\n}\n', "utf8");
  const syntheticCanonicalSha256 = createHash("sha256")
    .update(JSON.stringify(["alpha", "beta"]))
    .digest("hex");
  const syntheticRawSha256 = createHash("sha256").update(approvedSyntheticCatalog).digest("hex");
  const syntheticBaseline = {
    expectedGatewayModelIds: ["alpha", "beta"],
    reviewedBaselineSha256: syntheticCanonicalSha256,
    reviewedRawExportSha256: syntheticRawSha256,
  };
  assert.deepEqual(
    validateReviewedGatewayModelCatalogBytes(approvedSyntheticCatalog, syntheticBaseline),
    {
      modelListFileSha256: syntheticRawSha256,
      canonicalModelIdSetSha256: syntheticCanonicalSha256,
      reviewedBaselineSha256: syntheticCanonicalSha256,
      reviewedRawExportSha256: syntheticRawSha256,
      expectedGatewayModelIds: ["alpha", "beta"],
    },
  );
  assert.throws(
    () => validateReviewedGatewayModelCatalogBytes(equivalentSyntheticCatalog, syntheticBaseline),
    /raw SHA-256 differs from its human-reviewed baseline/,
  );
  console.log("  ✓ canonical IDs 相同时仍必须精确匹配人工批准的原始字节 SHA-256");

  const syntheticEvidence = validateReviewedGatewayModelCatalogBytes(
    approvedSyntheticCatalog,
    syntheticBaseline,
  );
  const retainedRoot = resolveEvaluationReleaseRoot(
    path.join(tempRoot, "retained-catalog-release"),
    {},
  );
  const retainedPath = materializeAndVerifyRetainedGatewayModelCatalog(
    retainedRoot,
    approvedSyntheticCatalog,
    syntheticEvidence,
  );
  assert.deepEqual(fs.readFileSync(retainedPath), approvedSyntheticCatalog);
  assert.equal(
    materializeAndVerifyRetainedGatewayModelCatalog(
      retainedRoot,
      approvedSyntheticCatalog,
      syntheticEvidence,
    ),
    retainedPath,
    "an existing immutable retained catalog must be verified rather than overwritten",
  );

  const replacementRoot = resolveEvaluationReleaseRoot(
    path.join(tempRoot, "retained-catalog-replacement"),
    {},
  );
  assert.throws(
    () => materializeAndVerifyRetainedGatewayModelCatalog(
      replacementRoot,
      approvedSyntheticCatalog,
      syntheticEvidence,
      {
        beforeFinalRead(targetPath) {
          const replacementPath = path.join(path.dirname(targetPath), ".fault-injected-model-catalog.json");
          fs.writeFileSync(replacementPath, equivalentSyntheticCatalog, { mode: 0o644 });
          fs.chmodSync(replacementPath, 0o644);
          fs.renameSync(replacementPath, targetPath);
        },
      },
    ),
    /raw SHA-256 differs from its human-reviewed baseline|changed while it was being read/,
  );
  assert.notEqual(
    createHash("sha256").update(fs.readFileSync(path.join(
      replacementRoot,
      "model-catalogs",
      `${syntheticRawSha256}.json`,
    ))).digest("hex"),
    syntheticRawSha256,
    "the deterministic replacement must really leave different raw bytes at the fixed digest path",
  );
  console.log("  ✓ retained catalog 排他创建并在最终固定路径复核时拒绝并发替换");

  const sameInodeRoot = resolveEvaluationReleaseRoot(
    path.join(tempRoot, "retained-catalog-same-inode-mutation"),
    {},
  );
  const sameLengthMutatedCatalog = Buffer.from('{"data":[{"id":"alpha"},{"id":"zeta"}]}\n', "utf8");
  assert.equal(sameLengthMutatedCatalog.length, approvedSyntheticCatalog.length);
  let mutationInode: number | undefined;
  assert.throws(
    () => materializeAndVerifyRetainedGatewayModelCatalog(
      sameInodeRoot,
      approvedSyntheticCatalog,
      syntheticEvidence,
      {
        afterFinalReadBeforeStat(targetPath) {
          const before = fs.statSync(targetPath);
          const descriptor = fs.openSync(targetPath, "r+");
          try {
            fs.ftruncateSync(descriptor, 0);
            fs.writeFileSync(descriptor, sameLengthMutatedCatalog);
            const forcedTime = new Date("2030-01-01T00:00:00.000Z");
            fs.futimesSync(descriptor, forcedTime, forcedTime);
            fs.fsyncSync(descriptor);
          } finally {
            fs.closeSync(descriptor);
          }
          const after = fs.statSync(targetPath);
          assert.equal(after.ino, before.ino, "fault injection must mutate the original inode in place");
          assert.equal(after.size, before.size, "fault injection must preserve size so metadata checks are exercised");
          mutationInode = after.ino;
        },
      },
    ),
    /retained \/v1\/models artifact changed while it was being read/,
  );
  assert.ok(mutationInode !== undefined);
  console.log("  ✓ stable read 拒绝同 inode、同 size 的 truncate/rewrite 竞态");

  const tsx = path.join(PROJECT_ROOT, "node_modules/tsx/dist/cli.mjs");
  const script = path.join(PROJECT_ROOT, "scripts/evaluation-review.ts");
  const contractReleaseRoot = path.join(tempRoot, "contract-release");
  const runBlockedContractCheck = (modelListPath?: string) => spawnSync(process.execPath, [
    tsx,
    script,
    "contract-check",
    "--release-root", contractReleaseRoot,
    ...(modelListPath ? ["--model-list", modelListPath] : []),
    "--admin-id", "admin-does-not-exist",
    "--audit-reason", "prove catalog evidence gates fail before database access",
    "--variant-id", variant.variantId,
    "--reference-profile-file", profilePath,
    "--code-sha", CODE_SHA,
  ], {
    cwd: PROJECT_ROOT,
    encoding: "utf8",
    env: { ...process.env, APIYI_MODELS_EXPORT: "" },
  });

  const missingModelList = runBlockedContractCheck();
  assert.notEqual(missingModelList.status, 0);
  assert.match(missingModelList.stderr, /reviewed \/v1\/models export is required via --model-list or APIYI_MODELS_EXPORT/);
  assert.doesNotMatch(missingModelList.stderr, /grok-imagine-image/);
  assert.doesNotMatch(missingModelList.stderr, /persisted administrator/);
  assert.equal(fs.existsSync(contractReleaseRoot), false, "catalog rejection must precede release-root creation");

  const relativeModelList = runBlockedContractCheck("relative-model-list.json");
  assert.notEqual(relativeModelList.status, 0);
  assert.match(relativeModelList.stderr, /reviewed \/v1\/models export path must be absolute/);

  const externalModelListTarget = path.join(tempRoot, "external-model-list-target.json");
  fs.writeFileSync(externalModelListTarget, '{"object":"list","data":[]}\n');
  const externalModelListLink = path.join(tempRoot, "external-model-list-link.json");
  fs.symlinkSync(externalModelListTarget, externalModelListLink);
  const symlinkModelList = runBlockedContractCheck(externalModelListLink);
  assert.notEqual(symlinkModelList.status, 0);
  assert.match(symlinkModelList.stderr, /reviewed \/v1\/models export must be a non-symlink regular file/);

  const racedModelList = path.join(tempRoot, "external-model-list-race.json");
  const racedModelListOriginal = `${racedModelList}.original`;
  fs.writeFileSync(racedModelList, '{"object":"list","data":[]}\n');
  let modelListReplacementInjected = false;
  await assert.rejects(
    runEvaluationReviewCommand(
      parseEvaluationReviewCliArgs([
        "contract-check",
        "--release-root", contractReleaseRoot,
        "--model-list", racedModelList,
        "--admin-id", "admin-does-not-exist",
        "--audit-reason", "prove checked model-list paths cannot be replaced before open",
        "--variant-id", variant.variantId,
        "--reference-profile-file", profilePath,
        "--code-sha", CODE_SHA,
      ]),
      {
        beforeExternalModelListOpen(modelListPath) {
          assert.equal(modelListPath, racedModelList);
          modelListReplacementInjected = true;
          fs.renameSync(racedModelList, racedModelListOriginal);
          fs.symlinkSync(externalModelListTarget, racedModelList);
        },
      },
    ),
    /reviewed \/v1\/models export changed while it was being opened/,
  );
  assert.equal(modelListReplacementInjected, true);
  assert.equal(fs.existsSync(contractReleaseRoot), false, "model-list TOCTOU rejection must precede release-root creation");

  const projectModelList = runBlockedContractCheck(path.join(PROJECT_ROOT, "docs/ai/apiyi/sources.json"));
  assert.notEqual(projectModelList.status, 0);
  assert.match(projectModelList.stderr, /reviewed \/v1\/models export must be outside the tracked project tree/);

  const missingExactIds = runBlockedContractCheck(externalModelListTarget);
  assert.notEqual(missingExactIds.status, 0);
  assert.match(missingExactIds.stderr, /reviewed \/v1\/models export is missing exact gateway model IDs: gpt-image-2/);
  assert.doesNotMatch(missingExactIds.stderr, /persisted administrator/);
  assert.equal(fs.existsSync(contractReleaseRoot), false, "catalog rejection must precede release-root creation");
  console.log("  ✓ reviewed catalog 基线仍要求当前原始导出，且绝对路径、Git 树外、非 symlink 与五个精确 ID 均 fail-closed");

  const registryLinkTarget = path.join(tempRoot, "registry-target.json");
  fs.writeFileSync(registryLinkTarget, `${JSON.stringify(emptyRegistry)}\n`);
  fs.unlinkSync(registryPath);
  fs.symlinkSync(registryLinkTarget, registryPath);
  await assert.rejects(
    runEvaluationReviewCommand(parseEvaluationReviewCliArgs([
      "registry-check",
      "--release-root", explicit,
    ])),
    /must not traverse a symlink|non-symlink regular file/,
  );
  console.log("  ✓ registry 文件本身也不能是 symlink");
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

console.log("外置评估复核 CLI 测试通过");
