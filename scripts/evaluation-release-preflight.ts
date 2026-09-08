import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { EVALUATION_CAMPAIGN_IMPLEMENTATION_STATUS } from "../server/lib/evaluationCampaign";

export const EVALUATION_RELEASE_REGISTRY_FILENAME =
  "prompt-release-registry.json";
export const EVALUATION_RELEASE_ROOT_MARKER_FILENAME =
  ".garment-canvas-evaluation-release-root";
export const EVALUATION_RELEASE_ROOT_MARKER_CONTENT =
  "garment-canvas-evaluation-release-root-v1\n";
export const EVALUATION_RELEASE_REGISTRY_LOCK_FILENAME =
  ".prompt-release-registry.lock";

const HOST_DIR_ENV = "GARMENT_CANVAS_EVALUATION_RELEASE_HOST_DIR";
const REGISTRY_SOURCE_ENV =
  "GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SOURCE";
const REGISTRY_SHA_ENV =
  "GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SHA256";
const BUNDLE_SHA_ENV = "GARMENT_CANVAS_EVALUATION_RELEASE_BUNDLE_SHA256";
const BUILD_CODE_SHA_ENV = "GARMENT_CANVAS_BUILD_CODE_SHA";
const CODE_SHA_ENV = "GARMENT_CANVAS_CODE_SHA";

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const CODE_SHA_PATTERN = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/;
const RELEASE_DIRECTORY_MODE = 0o755;
const RELEASE_FILE_MODE = 0o644;

export interface EvaluationReleaseHostPreflightResult {
  hostMountOnly: true;
  campaignReady: false;
  campaignStatus: typeof EVALUATION_CAMPAIGN_IMPLEMENTATION_STATUS;
  hostDir: string;
  registrySource: string;
  registrySha256: string;
  bundleSha256: string;
  codeSha: string;
}

function requiredEnv(
  env: Readonly<Record<string, string | undefined>>,
  name: string,
): string {
  const value = env[name]?.trim() ?? "";
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function assertAbsolute(value: string, name: string): string {
  if (!path.isAbsolute(value)) {
    throw new Error(`${name} must be an absolute path`);
  }
  return path.resolve(value);
}

/**
 * Inspect every component with lstat so a realpath cannot silently hide a
 * symlink in an ancestor. The preflight only accepts existing paths.
 */
function assertExistingPathWithoutSymlinks(
  absolutePath: string,
  name: string,
): fs.Stats {
  const parsed = path.parse(absolutePath);
  let cursor = parsed.root;
  const segments = absolutePath
    .slice(parsed.root.length)
    .split(path.sep)
    .filter(Boolean);

  for (const segment of segments) {
    cursor = path.join(cursor, segment);
    let stat: fs.Stats;
    try {
      stat = fs.lstatSync(cursor);
    } catch {
      throw new Error(`${name} contains a missing path segment: ${cursor}`);
    }
    if (stat.isSymbolicLink()) {
      throw new Error(`${name} must not traverse symlinks: ${cursor}`);
    }
  }

  return fs.lstatSync(absolutePath);
}

function isInside(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return relative === ""
    || (!relative.startsWith(`..${path.sep}`)
      && relative !== ".."
      && !path.isAbsolute(relative));
}

function assertOutsideProjectTree(
  candidate: string,
  projectRoot: string,
  name: string,
): void {
  const realProjectRoot = fs.realpathSync(projectRoot);
  if (isInside(realProjectRoot, candidate)) {
    throw new Error(`${name} must be outside the project Git tree`);
  }
  if (isInside(candidate, realProjectRoot)) {
    throw new Error(`${name} must not be the project root or one of its ancestors`);
  }
}

function permissionBits(stat: fs.Stats): number {
  return stat.mode & 0o777;
}

function assertDockerReadableDirectory(stat: fs.Stats, name: string): void {
  const mode = permissionBits(stat);
  if (mode !== RELEASE_DIRECTORY_MODE) {
    throw new Error(`${name} permissions must be exactly 0755`);
  }
}

function assertDockerReadableFile(stat: fs.Stats, name: string): void {
  const mode = permissionBits(stat);
  if (mode !== RELEASE_FILE_MODE) {
    throw new Error(`${name} permissions must be exactly 0644`);
  }
}

function assertDedicatedHostDirectory(hostDir: string, projectRoot: string): void {
  const filesystemRoot = path.parse(hostDir).root;
  if (hostDir === filesystemRoot || path.dirname(hostDir) === filesystemRoot) {
    throw new Error(`${HOST_DIR_ENV} must not be a filesystem root or top-level broad directory`);
  }
  const home = fs.realpathSync(os.homedir());
  if (hostDir === home || isInside(hostDir, home)) {
    throw new Error(`${HOST_DIR_ENV} must not be the user HOME or one of its ancestors`);
  }
  if (hostDir === fs.realpathSync(os.tmpdir())) {
    throw new Error(`${HOST_DIR_ENV} must not be the shared system temporary root`);
  }
  assertOutsideProjectTree(hostDir, projectRoot, HOST_DIR_ENV);
}

function assertDockerReadableReleaseTree(hostDir: string): void {
  const markerPath = path.join(hostDir, EVALUATION_RELEASE_ROOT_MARKER_FILENAME);
  if (!fs.existsSync(markerPath)) {
    throw new Error(`${HOST_DIR_ENV} is not a dedicated Garment Canvas release directory`);
  }
  const visit = (directory: string): void => {
    assertDockerReadableDirectory(fs.lstatSync(directory), `release directory ${directory}`);
    for (const name of fs.readdirSync(directory)) {
      const entry = path.join(directory, name);
      const stat = fs.lstatSync(entry);
      if (stat.isSymbolicLink()) throw new Error(`release package must not contain symlinks: ${entry}`);
      if (directory === hostDir && name === EVALUATION_RELEASE_REGISTRY_LOCK_FILENAME) {
        throw new Error("evaluation release registry update lock is present; refuse to mount a changing package");
      }
      if (stat.isDirectory()) visit(entry);
      else if (stat.isFile()) assertDockerReadableFile(stat, `release file ${entry}`);
      else throw new Error(`release package contains an unsupported filesystem entry: ${entry}`);
    }
  };
  visit(hostDir);
  if (fs.readFileSync(markerPath, "utf8") !== EVALUATION_RELEASE_ROOT_MARKER_CONTENT) {
    throw new Error("evaluation release root marker content is invalid");
  }
}

function assertSha256(value: string, name: string): void {
  if (!SHA256_PATTERN.test(value)) {
    throw new Error(
      `${name} must be exactly 64 lowercase hexadecimal characters`,
    );
  }
}

function assertCodeSha(value: string, name: string): void {
  if (!CODE_SHA_PATTERN.test(value)) {
    throw new Error(
      `${name} must be exactly 40 or 64 lowercase hexadecimal characters`,
    );
  }
}

function fileSha256(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

/**
 * Read-only host-side admission for the dedicated Compose release overlay.
 * It verifies that build and runtime will consume one exact external registry
 * from one symlink-free directory before Docker receives either path.
 */
export function validateEvaluationReleaseHostPreflight(
  env: Readonly<Record<string, string | undefined>>,
  projectRoot: string,
): EvaluationReleaseHostPreflightResult {
  const configuredHostDir = assertAbsolute(
    requiredEnv(env, HOST_DIR_ENV),
    HOST_DIR_ENV,
  );
  const configuredRegistrySource = assertAbsolute(
    requiredEnv(env, REGISTRY_SOURCE_ENV),
    REGISTRY_SOURCE_ENV,
  );

  const hostStat = assertExistingPathWithoutSymlinks(
    configuredHostDir,
    HOST_DIR_ENV,
  );
  if (!hostStat.isDirectory()) {
    throw new Error(`${HOST_DIR_ENV} must identify a directory`);
  }
  const hostDir = fs.realpathSync(configuredHostDir);
  assertDedicatedHostDirectory(hostDir, projectRoot);

  const sourceStat = assertExistingPathWithoutSymlinks(
    configuredRegistrySource,
    REGISTRY_SOURCE_ENV,
  );
  if (!sourceStat.isFile()) {
    throw new Error(`${REGISTRY_SOURCE_ENV} must identify a regular file`);
  }

  const expectedRegistrySource = path.join(
    configuredHostDir,
    EVALUATION_RELEASE_REGISTRY_FILENAME,
  );
  if (configuredRegistrySource !== expectedRegistrySource) {
    throw new Error(
      `${REGISTRY_SOURCE_ENV} must equal ${HOST_DIR_ENV}/${EVALUATION_RELEASE_REGISTRY_FILENAME}`,
    );
  }

  const registrySource = fs.realpathSync(configuredRegistrySource);
  if (
    path.dirname(registrySource) !== hostDir
    || path.basename(registrySource) !== EVALUATION_RELEASE_REGISTRY_FILENAME
  ) {
    throw new Error(
      `${REGISTRY_SOURCE_ENV} must resolve to ${HOST_DIR_ENV}/${EVALUATION_RELEASE_REGISTRY_FILENAME}`,
    );
  }
  assertOutsideProjectTree(registrySource, projectRoot, REGISTRY_SOURCE_ENV);
  assertDockerReadableReleaseTree(hostDir);

  const registrySha256 = requiredEnv(env, REGISTRY_SHA_ENV);
  const bundleSha256 = requiredEnv(env, BUNDLE_SHA_ENV);
  assertSha256(registrySha256, REGISTRY_SHA_ENV);
  assertSha256(bundleSha256, BUNDLE_SHA_ENV);
  if (fileSha256(registrySource) !== registrySha256) {
    throw new Error(`${REGISTRY_SHA_ENV} does not match the registry source bytes`);
  }

  const buildCodeSha = requiredEnv(env, BUILD_CODE_SHA_ENV);
  const codeSha = requiredEnv(env, CODE_SHA_ENV);
  assertCodeSha(buildCodeSha, BUILD_CODE_SHA_ENV);
  assertCodeSha(codeSha, CODE_SHA_ENV);
  if (buildCodeSha !== codeSha) {
    throw new Error(`${BUILD_CODE_SHA_ENV} and ${CODE_SHA_ENV} must be identical`);
  }

  return {
    hostMountOnly: true,
    campaignReady: false,
    campaignStatus: EVALUATION_CAMPAIGN_IMPLEMENTATION_STATUS,
    hostDir,
    registrySource,
    registrySha256,
    bundleSha256,
    codeSha,
  };
}

export function runEvaluationReleaseHostPreflight(
  env: Readonly<Record<string, string | undefined>> = process.env,
  projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."),
): EvaluationReleaseHostPreflightResult {
  return validateEvaluationReleaseHostPreflight(env, projectRoot);
}

async function main(): Promise<void> {
  const result = runEvaluationReleaseHostPreflight();
  console.log(JSON.stringify({ ok: true, ...result }, null, 2));
}

if (
  process.argv[1]
  && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1])
) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
