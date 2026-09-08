import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export const EVALUATION_BUILD_IDENTITY_FILENAME = ".garment-canvas-build-identity.json";
const CODE_SHA_PATTERN = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/;

export interface EvaluationCodeIdentity {
  codeSha: string;
  source: "git-head" | "build-identity";
  /** Only a Git-backed identity can derive this value from a worktree. */
  dirty: boolean;
}

interface EvaluationBuildIdentityDocument {
  schemaVersion: 1;
  codeSha: string | null;
}

function requiredRuntimeCodeSha(env: NodeJS.ProcessEnv): string {
  const codeSha = env.GARMENT_CANVAS_CODE_SHA;
  if (!codeSha) {
    throw new Error(
      "ENABLE_PAID_EVALUATION_RUNS=true requires GARMENT_CANVAS_CODE_SHA to bind evidence to the deployed commit",
    );
  }
  if (!CODE_SHA_PATTERN.test(codeSha)) {
    throw new Error("GARMENT_CANVAS_CODE_SHA must be exactly 40 or 64 lowercase hexadecimal characters");
  }
  return codeSha;
}

function sanitizedGitEnvironment(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const sanitized: NodeJS.ProcessEnv = {};
  for (const [key, value] of Object.entries(env)) {
    // Git repository/config indirection must never be allowed to redirect the
    // identity probe away from the exact package root selected below.
    if (!key.startsWith("GIT_")) sanitized[key] = value;
  }
  return {
    ...sanitized,
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_CONFIG_GLOBAL: process.platform === "win32" ? "NUL" : "/dev/null",
    GIT_OPTIONAL_LOCKS: "0",
    GIT_TERMINAL_PROMPT: "0",
  };
}

function runGit(
  repoRoot: string,
  args: readonly string[],
  env: NodeJS.ProcessEnv,
): string {
  try {
    return execFileSync("git", args, {
      cwd: repoRoot,
      env: sanitizedGitEnvironment(env),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 5_000,
    }).trim();
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`unable to resolve evaluation Git identity: ${detail}`);
  }
}

function readBuildIdentity(repoRoot: string): EvaluationBuildIdentityDocument {
  const identityPath = path.join(repoRoot, EVALUATION_BUILD_IDENTITY_FILENAME);
  let parsed: unknown;
  try {
    const identityStat = fs.lstatSync(identityPath);
    if (identityStat.isSymbolicLink() || !identityStat.isFile()) {
      throw new Error("identity path must be an exact non-symlink file");
    }
    parsed = JSON.parse(fs.readFileSync(identityPath, "utf8"));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`paid evaluation requires an immutable build identity file: ${detail}`);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("evaluation build identity file must contain one JSON object");
  }
  const record = parsed as Record<string, unknown>;
  if (
    record.schemaVersion !== 1
    || (record.codeSha !== null && typeof record.codeSha !== "string")
    || Object.keys(record).sort().join(",") !== "codeSha,schemaVersion"
  ) {
    throw new Error("evaluation build identity file has an unsupported schema");
  }
  return record as unknown as EvaluationBuildIdentityDocument;
}

/**
 * Resolve paid-evaluation code identity without allowing environment variables
 * to suppress Git dirty state or replace the identity embedded in a Git-less
 * production image.
 */
export function resolveEvaluationCodeIdentity(
  repoCwd = process.cwd(),
  env: NodeJS.ProcessEnv = process.env,
): EvaluationCodeIdentity {
  const runtimeCodeSha = requiredRuntimeCodeSha(env);
  const packageRoot = fs.realpathSync(path.resolve(repoCwd));
  const gitMarkerPath = path.join(packageRoot, ".git");
  const buildIdentityPath = path.join(packageRoot, EVALUATION_BUILD_IDENTITY_FILENAME);
  const hasExactGitMarker = fs.existsSync(gitMarkerPath);
  const hasExactBuildIdentity = fs.existsSync(buildIdentityPath);

  if (hasExactGitMarker && hasExactBuildIdentity) {
    throw new Error(
      "paid evaluation package root is ambiguous: exact Git metadata and build identity are both present",
    );
  }

  if (hasExactGitMarker) {
    const marker = fs.lstatSync(gitMarkerPath);
    if (marker.isSymbolicLink() || (!marker.isDirectory() && !marker.isFile())) {
      throw new Error("evaluation Git metadata must be an exact non-symlink file or directory");
    }
    const observedTopLevel = runGit(packageRoot, ["rev-parse", "--show-toplevel"], env);
    let observedRoot: string;
    try {
      observedRoot = fs.realpathSync(observedTopLevel);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`unable to verify exact evaluation Git root: ${detail}`);
    }
    if (observedRoot !== packageRoot) {
      throw new Error("evaluation Git metadata does not resolve to the exact package root");
    }
    const gitHead = runGit(packageRoot, ["rev-parse", "HEAD"], env);
    if (!CODE_SHA_PATTERN.test(gitHead)) {
      throw new Error("git rev-parse HEAD did not return a valid lowercase commit SHA");
    }
    if (runtimeCodeSha !== gitHead) {
      throw new Error("GARMENT_CANVAS_CODE_SHA does not match the current Git HEAD");
    }
    const dirty = runGit(
      packageRoot,
      ["status", "--porcelain=v1", "--untracked-files=normal"],
      env,
    ).length > 0;
    return { codeSha: gitHead, source: "git-head", dirty };
  }

  // Do not walk to an ancestor .git directory. A packaged application either
  // carries its identity at this exact root or paid evaluation fails closed.
  const buildIdentity = readBuildIdentity(packageRoot);
  if (typeof buildIdentity.codeSha !== "string" || !CODE_SHA_PATTERN.test(buildIdentity.codeSha)) {
    throw new Error("evaluation build identity does not contain a reviewed code SHA");
  }
  if (runtimeCodeSha !== buildIdentity.codeSha) {
    throw new Error("GARMENT_CANVAS_CODE_SHA does not match the immutable build identity");
  }
  // A packaged runtime has no worktree. This false value is not evidence that
  // the original Docker build context was clean; the release gate proves that separately.
  return { codeSha: buildIdentity.codeSha, source: "build-identity", dirty: false };
}
