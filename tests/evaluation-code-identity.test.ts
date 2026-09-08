import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertPaidEvaluationStartupConfig } from "../server/config";
import {
  EVALUATION_BUILD_IDENTITY_FILENAME,
  resolveEvaluationCodeIdentity,
} from "../server/lib/evaluationCodeIdentity";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT = path.join(REPO_ROOT, "scripts", "write-build-identity.mjs");
const tempRoots: string[] = [];

function tempDir(prefix: string): string {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  tempRoots.push(directory);
  return directory;
}

function git(cwd: string, args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

console.log("付费评估代码身份 fail-closed 回归测试");

try {
  assert.doesNotThrow(() => assertPaidEvaluationStartupConfig({
    ENABLE_PAID_EVALUATION_RUNS: "false",
  }, tempDir("garment-identity-disabled-")));

  const gitRoot = tempDir("garment-identity-git-");
  git(gitRoot, ["init", "-q"]);
  fs.writeFileSync(path.join(gitRoot, "tracked.txt"), "reviewed\n");
  git(gitRoot, ["add", "tracked.txt"]);
  git(gitRoot, [
    "-c", "user.name=Garment Test",
    "-c", "user.email=garment-test@example.invalid",
    "-c", "commit.gpgSign=false",
    "commit", "-qm", "reviewed",
  ]);
  const head = git(gitRoot, ["rev-parse", "HEAD"]);
  assert.deepEqual(resolveEvaluationCodeIdentity(gitRoot, {
    GARMENT_CANVAS_CODE_SHA: head,
  }), { codeSha: head, source: "git-head", dirty: false });

  const redirectedGitRoot = tempDir("garment-identity-redirect-");
  git(redirectedGitRoot, ["init", "-q"]);
  fs.writeFileSync(path.join(redirectedGitRoot, "redirected.txt"), "wrong repository\n");
  git(redirectedGitRoot, ["add", "redirected.txt"]);
  git(redirectedGitRoot, [
    "-c", "user.name=Garment Test",
    "-c", "user.email=garment-test@example.invalid",
    "-c", "commit.gpgSign=false",
    "commit", "-qm", "redirected",
  ]);
  assert.deepEqual(resolveEvaluationCodeIdentity(gitRoot, {
    GARMENT_CANVAS_CODE_SHA: head,
    GIT_DIR: path.join(redirectedGitRoot, ".git"),
    GIT_WORK_TREE: redirectedGitRoot,
    GIT_INDEX_FILE: path.join(redirectedGitRoot, ".git", "index"),
    GIT_OBJECT_DIRECTORY: path.join(redirectedGitRoot, ".git", "objects"),
    GIT_CONFIG_COUNT: "1",
    GIT_CONFIG_KEY_0: "core.worktree",
    GIT_CONFIG_VALUE_0: redirectedGitRoot,
  }), { codeSha: head, source: "git-head", dirty: false },
  "Git repository/config environment pollution must not redirect the exact-root probe");
  assert.throws(
    () => resolveEvaluationCodeIdentity(gitRoot, { GARMENT_CANVAS_CODE_SHA: "a".repeat(40) }),
    /does not match the current Git HEAD/,
  );
  fs.writeFileSync(path.join(gitRoot, "untracked.txt"), "dirty\n");
  assert.equal(resolveEvaluationCodeIdentity(gitRoot, {
    GARMENT_CANVAS_CODE_SHA: head,
    GARMENT_CANVAS_BUILD_CODE_SHA: "b".repeat(40),
  }).dirty, true, "环境变量不得把真实 Git dirty 状态伪装成 clean");
  assert.throws(
    () => assertPaidEvaluationStartupConfig({
      ENABLE_PAID_EVALUATION_RUNS: "true",
      GARMENT_CANVAS_CODE_SHA: head,
    }, gitRoot),
    /clean Git worktree/,
  );

  const packagedRoot = tempDir("garment-identity-packaged-");
  const embeddedSha = "b".repeat(40);
  const identityPath = path.join(packagedRoot, EVALUATION_BUILD_IDENTITY_FILENAME);
  execFileSync(process.execPath, [SCRIPT, identityPath, embeddedSha]);
  assert.deepEqual(resolveEvaluationCodeIdentity(packagedRoot, {
    GARMENT_CANVAS_CODE_SHA: embeddedSha,
  }), { codeSha: embeddedSha, source: "build-identity", dirty: false });
  assert.deepEqual(
    assertPaidEvaluationStartupConfig({
      ENABLE_PAID_EVALUATION_RUNS: "true",
      GARMENT_CANVAS_CODE_SHA: embeddedSha,
    }, packagedRoot),
    { codeSha: embeddedSha, source: "build-identity", dirty: false },
    "startup validates immutable code identity; each paid run separately requires a sealed Campaign/Slot",
  );
  assert.throws(
    () => resolveEvaluationCodeIdentity(packagedRoot, {
      GARMENT_CANVAS_CODE_SHA: "c".repeat(40),
      GARMENT_CANVAS_BUILD_CODE_SHA: "c".repeat(40),
    }),
    /does not match the immutable build identity/,
    "运行时变量不得覆盖镜像内独立构建身份",
  );

  const ancestorGitRoot = tempDir("garment-identity-ancestor-");
  git(ancestorGitRoot, ["init", "-q"]);
  fs.writeFileSync(path.join(ancestorGitRoot, "ancestor.txt"), "ancestor repository\n");
  git(ancestorGitRoot, ["add", "ancestor.txt"]);
  git(ancestorGitRoot, [
    "-c", "user.name=Garment Test",
    "-c", "user.email=garment-test@example.invalid",
    "-c", "commit.gpgSign=false",
    "commit", "-qm", "ancestor",
  ]);
  const nestedPackageRoot = path.join(ancestorGitRoot, "packaged-app");
  fs.mkdirSync(nestedPackageRoot);
  execFileSync(process.execPath, [
    SCRIPT,
    path.join(nestedPackageRoot, EVALUATION_BUILD_IDENTITY_FILENAME),
    embeddedSha,
  ]);
  assert.deepEqual(resolveEvaluationCodeIdentity(nestedPackageRoot, {
    GARMENT_CANVAS_CODE_SHA: embeddedSha,
  }), { codeSha: embeddedSha, source: "build-identity", dirty: false },
  "ancestor Git metadata must not override an exact-root packaged identity");
  const nestedMissingIdentityRoot = path.join(ancestorGitRoot, "missing-identity-app");
  fs.mkdirSync(nestedMissingIdentityRoot);
  assert.throws(
    () => resolveEvaluationCodeIdentity(nestedMissingIdentityRoot, {
      GARMENT_CANVAS_CODE_SHA: git(ancestorGitRoot, ["rev-parse", "HEAD"]),
    }),
    /requires an immutable build identity file/,
    "an ancestor repository must not be accepted when the exact package root has no identity",
  );

  const ambiguousRoot = tempDir("garment-identity-ambiguous-");
  git(ambiguousRoot, ["init", "-q"]);
  execFileSync(process.execPath, [
    SCRIPT,
    path.join(ambiguousRoot, EVALUATION_BUILD_IDENTITY_FILENAME),
    embeddedSha,
  ]);
  assert.throws(
    () => resolveEvaluationCodeIdentity(ambiguousRoot, {
      GARMENT_CANVAS_CODE_SHA: embeddedSha,
    }),
    /package root is ambiguous/,
    "an exact root carrying both identity mechanisms must fail closed",
  );

  const missingIdentityRoot = tempDir("garment-identity-missing-");
  assert.throws(
    () => resolveEvaluationCodeIdentity(missingIdentityRoot, {
      GARMENT_CANVAS_CODE_SHA: embeddedSha,
    }),
    /requires an immutable build identity file/,
  );
  const blankIdentityRoot = tempDir("garment-identity-blank-");
  execFileSync(process.execPath, [
    SCRIPT,
    path.join(blankIdentityRoot, EVALUATION_BUILD_IDENTITY_FILENAME),
  ]);
  assert.throws(
    () => resolveEvaluationCodeIdentity(blankIdentityRoot, {
      GARMENT_CANVAS_CODE_SHA: embeddedSha,
    }),
    /does not contain a reviewed code SHA/,
  );
  assert.throws(
    () => resolveEvaluationCodeIdentity(packagedRoot, {
      GARMENT_CANVAS_CODE_SHA: "ABCDEF",
    }),
    /exactly 40 or 64 lowercase hexadecimal characters/,
  );
  for (const invalidLength of [41, 63]) {
    assert.throws(
      () => resolveEvaluationCodeIdentity(packagedRoot, {
        GARMENT_CANVAS_CODE_SHA: "a".repeat(invalidLength),
      }),
      /exactly 40 or 64 lowercase hexadecimal characters/,
      `${invalidLength} 位 SHA 必须被拒绝`,
    );
  }

  const sha256Root = tempDir("garment-identity-sha256-");
  const sha256CodeIdentity = "d".repeat(64);
  execFileSync(process.execPath, [
    SCRIPT,
    path.join(sha256Root, EVALUATION_BUILD_IDENTITY_FILENAME),
    sha256CodeIdentity,
  ]);
  assert.deepEqual(resolveEvaluationCodeIdentity(sha256Root, {
    GARMENT_CANVAS_CODE_SHA: sha256CodeIdentity,
  }), { codeSha: sha256CodeIdentity, source: "build-identity", dirty: false });

  console.log("  ✓ Git HEAD/dirty 与 Git-less immutable build identity 均不能由运行时环境伪造");
} finally {
  for (const directory of tempRoots) fs.rmSync(directory, { recursive: true, force: true });
}
