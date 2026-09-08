import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  EVALUATION_RELEASE_REGISTRY_LOCK_FILENAME,
  EVALUATION_RELEASE_ROOT_MARKER_CONTENT,
  EVALUATION_RELEASE_ROOT_MARKER_FILENAME,
  validateEvaluationReleaseHostPreflight,
} from "../scripts/evaluation-release-preflight";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CODE_SHA = "1".repeat(40);
const BUNDLE_SHA = "2".repeat(64);
const externalRoot = fs.mkdtempSync(path.join(
  fs.realpathSync(os.tmpdir()),
  "garment-release-host-preflight-",
));
const hostDir = path.join(externalRoot, "release");
const registrySource = path.join(hostDir, "prompt-release-registry.json");

function fileSha256(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function validEnv(): Record<string, string> {
  return {
    GARMENT_CANVAS_EVALUATION_RELEASE_HOST_DIR: hostDir,
    GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SOURCE: registrySource,
    GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SHA256: fileSha256(registrySource),
    GARMENT_CANVAS_EVALUATION_RELEASE_BUNDLE_SHA256: BUNDLE_SHA,
    GARMENT_CANVAS_BUILD_CODE_SHA: CODE_SHA,
    GARMENT_CANVAS_CODE_SHA: CODE_SHA,
  };
}

console.log("宿主机外置评估发布目录预检测试");

try {
  fs.mkdirSync(hostDir, { mode: 0o755 });
  fs.chmodSync(hostDir, 0o755);
  const markerPath = path.join(hostDir, EVALUATION_RELEASE_ROOT_MARKER_FILENAME);
  fs.writeFileSync(markerPath, EVALUATION_RELEASE_ROOT_MARKER_CONTENT, { mode: 0o644 });
  fs.chmodSync(markerPath, 0o644);
  fs.writeFileSync(registrySource, "{\"schemaVersion\":1,\"generatedAt\":null,\"releases\":[]}\n", { mode: 0o644 });
  fs.chmodSync(registrySource, 0o644);

  const valid = validateEvaluationReleaseHostPreflight(validEnv(), PROJECT_ROOT);
  assert.equal(valid.hostMountOnly, true);
  assert.equal(valid.campaignReady, false);
  assert.equal(valid.campaignStatus, "ready");
  assert.equal(valid.hostDir, fs.realpathSync(hostDir));
  assert.equal(valid.registrySource, fs.realpathSync(registrySource));
  assert.equal(valid.registrySha256, fileSha256(registrySource));
  assert.equal(valid.bundleSha256, BUNDLE_SHA);
  assert.equal(valid.codeSha, CODE_SHA);
  console.log("  ✓ 合法外置目录、固定 registry 路径与全部身份通过");

  assert.throws(
    () => validateEvaluationReleaseHostPreflight({
      ...validEnv(),
      GARMENT_CANVAS_EVALUATION_RELEASE_HOST_DIR: path.parse(PROJECT_ROOT).root,
    }, PROJECT_ROOT),
    /broad directory/,
  );
  assert.throws(
    () => validateEvaluationReleaseHostPreflight({
      ...validEnv(),
      GARMENT_CANVAS_EVALUATION_RELEASE_HOST_DIR: os.homedir(),
    }, PROJECT_ROOT),
    /user HOME|project root or one of its ancestors/,
  );
  assert.throws(
    () => validateEvaluationReleaseHostPreflight({
      ...validEnv(),
      GARMENT_CANVAS_EVALUATION_RELEASE_HOST_DIR: path.dirname(PROJECT_ROOT),
    }, PROJECT_ROOT),
    /project root or one of its ancestors/,
  );
  console.log("  ✓ 文件系统根、HOME 与项目祖先目录不能作为广域挂载根");

  fs.chmodSync(registrySource, 0o600);
  assert.throws(
    () => validateEvaluationReleaseHostPreflight(validEnv(), PROJECT_ROOT),
    /exactly 0644/,
  );
  fs.chmodSync(registrySource, 0o604);
  assert.throws(
    () => validateEvaluationReleaseHostPreflight(validEnv(), PROJECT_ROOT),
    /exactly 0644/,
  );
  fs.chmodSync(registrySource, 0o644);
  fs.chmodSync(hostDir, 0o700);
  assert.throws(
    () => validateEvaluationReleaseHostPreflight(validEnv(), PROJECT_ROOT),
    /exactly 0755/,
  );
  fs.chmodSync(hostDir, 0o754);
  assert.throws(
    () => validateEvaluationReleaseHostPreflight(validEnv(), PROJECT_ROOT),
    /exactly 0755/,
  );
  fs.chmodSync(hostDir, 0o755);
  const lockPath = path.join(hostDir, EVALUATION_RELEASE_REGISTRY_LOCK_FILENAME);
  fs.writeFileSync(lockPath, "active\n", { mode: 0o644 });
  fs.chmodSync(lockPath, 0o644);
  assert.throws(
    () => validateEvaluationReleaseHostPreflight(validEnv(), PROJECT_ROOT),
    /update lock is present/,
  );
  fs.unlinkSync(lockPath);
  console.log("  ✓ 目录精确 0755/文件精确 0644 保证 USER node 可读；活动更新锁阻止挂载");

  assert.throws(
    () => validateEvaluationReleaseHostPreflight({
      ...validEnv(),
      GARMENT_CANVAS_EVALUATION_RELEASE_HOST_DIR: "relative/release",
    }, PROJECT_ROOT),
    /HOST_DIR must be an absolute path/,
  );
  assert.throws(
    () => validateEvaluationReleaseHostPreflight({
      ...validEnv(),
      GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SOURCE:
        "relative/prompt-release-registry.json",
    }, PROJECT_ROOT),
    /REGISTRY_SOURCE must be an absolute path/,
  );
  console.log("  ✓ HOST_DIR 与 SOURCE 的相对路径均被拒绝");

  const insideProject = fs.mkdtempSync(path.join(
    PROJECT_ROOT,
    ".evaluation-release-preflight-test-",
  ));
  try {
    const insideSource = path.join(insideProject, "prompt-release-registry.json");
    fs.writeFileSync(insideSource, "{}\n");
    assert.throws(
      () => validateEvaluationReleaseHostPreflight({
        ...validEnv(),
        GARMENT_CANVAS_EVALUATION_RELEASE_HOST_DIR: insideProject,
        GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SOURCE: insideSource,
        GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SHA256: fileSha256(insideSource),
      }, PROJECT_ROOT),
      /HOST_DIR must be outside the project Git tree/,
    );
  } finally {
    fs.rmSync(insideProject, { recursive: true, force: true });
  }
  console.log("  ✓ 仓库树内的发布目录被拒绝");

  const symlinkHost = path.join(externalRoot, "release-link");
  fs.symlinkSync(hostDir, symlinkHost, "dir");
  assert.throws(
    () => validateEvaluationReleaseHostPreflight({
      ...validEnv(),
      GARMENT_CANVAS_EVALUATION_RELEASE_HOST_DIR: symlinkHost,
      GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SOURCE:
        path.join(symlinkHost, "prompt-release-registry.json"),
    }, PROJECT_ROOT),
    /must not traverse symlinks/,
  );
  console.log("  ✓ 目录或任何已存在路径段含 symlink 时被拒绝");

  const otherHost = path.join(externalRoot, "other-release");
  fs.mkdirSync(otherHost);
  const otherSource = path.join(otherHost, "prompt-release-registry.json");
  fs.copyFileSync(registrySource, otherSource);
  assert.throws(
    () => validateEvaluationReleaseHostPreflight({
      ...validEnv(),
      GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SOURCE: otherSource,
    }, PROJECT_ROOT),
    /REGISTRY_SOURCE must equal GARMENT_CANVAS_EVALUATION_RELEASE_HOST_DIR/,
  );
  console.log("  ✓ SOURCE 不在 HOST_DIR 固定文件名下时被拒绝");

  assert.throws(
    () => validateEvaluationReleaseHostPreflight({
      ...validEnv(),
      GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SHA256: "f".repeat(64),
    }, PROJECT_ROOT),
    /does not match the registry source bytes/,
  );
  assert.throws(
    () => validateEvaluationReleaseHostPreflight({
      ...validEnv(),
      GARMENT_CANVAS_EVALUATION_RELEASE_BUNDLE_SHA256: "A".repeat(64),
    }, PROJECT_ROOT),
    /BUNDLE_SHA256 must be exactly 64 lowercase hexadecimal characters/,
  );
  console.log("  ✓ registry 原始字节 SHA 不匹配与非法 bundle SHA 均被拒绝");

  assert.throws(
    () => validateEvaluationReleaseHostPreflight({
      ...validEnv(),
      GARMENT_CANVAS_CODE_SHA: "3".repeat(64),
    }, PROJECT_ROOT),
    /BUILD_CODE_SHA and GARMENT_CANVAS_CODE_SHA must be identical/,
  );
  assert.throws(
    () => validateEvaluationReleaseHostPreflight({
      ...validEnv(),
      GARMENT_CANVAS_BUILD_CODE_SHA: "1".repeat(41),
      GARMENT_CANVAS_CODE_SHA: "1".repeat(41),
    }, PROJECT_ROOT),
    /BUILD_CODE_SHA must be exactly 40 or 64/,
  );
  const sha64Env = {
    ...validEnv(),
    GARMENT_CANVAS_BUILD_CODE_SHA: "4".repeat(64),
    GARMENT_CANVAS_CODE_SHA: "4".repeat(64),
  };
  assert.equal(
    validateEvaluationReleaseHostPreflight(sha64Env, PROJECT_ROOT).codeSha,
    "4".repeat(64),
  );
  console.log("  ✓ code SHA 仅允许精确 40/64 位且 build/runtime 必须一致");

  const tsxCli = path.join(PROJECT_ROOT, "node_modules/tsx/dist/cli.mjs");
  const script = path.join(PROJECT_ROOT, "scripts/evaluation-release-preflight.ts");
  const child = spawnSync(process.execPath, [tsxCli, script], {
    cwd: externalRoot,
    encoding: "utf8",
    env: { ...process.env, ...validEnv() },
  });
  assert.equal(child.status, 0, child.stderr || child.stdout);
  assert.equal(child.stderr, "");
  const output = JSON.parse(child.stdout) as Record<string, unknown>;
  assert.equal(output.ok, true);
  assert.equal(output.hostMountOnly, true);
  assert.equal(output.campaignReady, false);
  assert.equal(
    output.campaignStatus,
    "ready",
  );
  assert.equal(output.registrySource, fs.realpathSync(registrySource));
  console.log("  ✓ CLI 从非项目 cwd 执行仍只读预检，并明确仅代表宿主挂载检查");
} finally {
  fs.rmSync(externalRoot, { recursive: true, force: true });
}

console.log("宿主机外置评估发布目录预检测试通过");
