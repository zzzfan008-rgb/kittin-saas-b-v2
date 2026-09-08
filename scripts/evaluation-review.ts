import { spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { AuthUser } from "../server/lib/auth";
import { resolveEvaluationCodeIdentity } from "../server/lib/evaluationCodeIdentity";
import {
  assertEvaluationCampaignReady,
  buildEvaluationCampaignClosure,
  loadEvaluationCampaignForGate,
  sealEvaluationCampaignClosure,
  validateEvaluationCampaignClosure,
  type EvaluationCampaignClosure,
  type PaidEvaluationCampaignStage,
} from "../server/lib/evaluationCampaign";
import {
  appendEvaluationBillingReconciliation,
  appendEvaluationManualAssessment,
  loadEvaluationCaseEvidenceBundle,
} from "../server/lib/evaluationReviewLedger";
import {
  EVALUATION_CONTRACT_CHECK_COMMANDS,
  RECOMMENDATION_BASELINE_BLOCKER_DETAIL,
  assertStageCampaignClosureBinding,
  assertStageAuthorizationUnitKeyConsistent,
  assertStageCaseIdentityDisjoint,
  createEvaluationGateReceipt,
  createEvaluationPromotionArtifact,
  evaluateEvidenceBundlesForStage,
  evaluationArtifactSha256,
  validateEvaluationContractCheckArtifact,
  validateEvaluationGateReceipt,
  validateEvaluationPromotionArtifact,
  verifyEvaluationBundleImageArtifacts,
  type EvaluationContractCheckArtifact,
  type EvaluationCaseLocator,
  type EvaluationGateReceipt,
} from "../server/lib/evaluationPromotion";
import { createPromptEvaluationReleaseSnapshot } from "../src/lib/promptEvaluationRelease";
import {
  validatePromptEvaluationReleaseRegistry,
  type PromptEvaluationReleaseRegistry,
} from "../src/lib/promptEvaluationReleaseRegistry";
import {
  canonicalReferenceRoleProfile,
  PROMPT_EVALUATION_STAGE_ORDER,
} from "../src/lib/promptEvaluation";
import { getGarmentPromptVariantById } from "../src/lib/garmentPromptPresets";
import {
  IMAGE_MODEL_IDS,
  REVIEWED_MODEL_CATALOG_BASELINE,
} from "../src/types/imageModels";
import type {
  EvaluationHardBlocker,
  EvaluationReferenceRoleProfileEntry,
  PromptEvaluationScores,
  PromptEvaluationStage,
} from "../src/types/promptEvaluation";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APIYI_ROOT = path.join(PROJECT_ROOT, "docs/ai/apiyi");
const APIYI_POINTER_PATH = path.join(APIYI_ROOT, "site/current.json");
const RELEASE_ROOT_ENV = "GARMENT_CANVAS_EVALUATION_RELEASE_DIR";
const MODEL_LIST_ENV = "APIYI_MODELS_EXPORT";
export const EVALUATION_RELEASE_REGISTRY_RELATIVE_PATH = "prompt-release-registry.json";
export const EVALUATION_RELEASE_ROOT_MARKER_FILENAME = ".garment-canvas-evaluation-release-root";
export const EVALUATION_RELEASE_ROOT_MARKER_CONTENT = "garment-canvas-evaluation-release-root-v1\n";
export const EVALUATION_RELEASE_REGISTRY_LOCK_FILENAME = ".prompt-release-registry.lock";
export const EVALUATION_RELEASE_BUNDLE_HASH_SCOPE = "sha256-canonical-evaluation-release-file-set-v1";
const RELEASE_DIRECTORY_MODE = 0o755;
const RELEASE_FILE_MODE = 0o644;
const REGISTRY_LOCK_TIMEOUT_MS = 15_000;
const REGISTRY_LOCK_POLL_MS = 20;
const CODE_SHA_PATTERN = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const SAFE_ID_PATTERN = /^[A-Za-z0-9_.:-]{1,256}$/;
const ARTIFACT_FOLDERS = new Set([
  "exports", "contract-checks", "gate-receipts", "campaign-closures", "model-catalogs", "promotions",
]);

export interface EvaluationReleaseBundleFileDigest {
  path: string;
  sha256: string;
}

type CommandName = "export" | "reconcile" | "score" | "contract-check" | "gate" | "promote" | "registry-check";

export interface ParsedEvaluationReviewCommand {
  command: CommandName;
  flags: ReadonlyMap<string, readonly string[]>;
}

const REPEAT_FLAGS = new Set(["previous-receipt"]);
const BOOLEAN_FLAGS = new Set(["task-passed"]);

function allowedFlags(command: CommandName): ReadonlySet<string> {
  const commonAdmin = ["admin-id", "audit-reason"];
  const releaseRoot = ["release-root"];
  const byCommand: Record<CommandName, readonly string[]> = {
    export: [...commonAdmin, ...releaseRoot, "case-evidence-id", "run-id"],
    reconcile: [
      ...commonAdmin, "case-evidence-id", "run-id", "provider-request-evidence-id",
      "status", "actual-cost-minor", "currency", "billing-reference", "note",
    ],
    score: [
      ...commonAdmin, "case-evidence-id", "run-id", "output-index", "scores-file",
      "hard-blockers-file", "task-passed", "review-note",
    ],
    "contract-check": [
      ...commonAdmin, ...releaseRoot, "variant-id", "reference-profile-file", "code-sha",
      "model-list",
    ],
    gate: [
      ...commonAdmin, ...releaseRoot, "stage", "variant-id", "reference-profile-file", "cases-file",
      "previous-receipt", "code-sha", "contract-check", "campaign-id",
    ],
    promote: [
      ...commonAdmin, ...releaseRoot, "gate-receipt", "previous-receipt", "code-sha",
    ],
    "registry-check": [...releaseRoot, "code-sha"],
  };
  return new Set(byCommand[command]);
}

export function parseEvaluationReviewCliArgs(argv: readonly string[]): ParsedEvaluationReviewCommand {
  const command = argv[0] as CommandName | undefined;
  if (!command || !["export", "reconcile", "score", "contract-check", "gate", "promote", "registry-check"].includes(command)) {
    throw new Error("first argument must be export, reconcile, score, contract-check, gate, promote, or registry-check");
  }
  const allowed = allowedFlags(command);
  const flags = new Map<string, string[]>();
  for (let index = 1; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) throw new Error(`unexpected argument: ${token}`);
    const [name, inline] = token.slice(2).split("=", 2);
    if (!allowed.has(name)) throw new Error(`unexpected flag for ${command}: --${name}`);
    if (BOOLEAN_FLAGS.has(name)) {
      if (inline !== undefined) throw new Error(`--${name} does not accept a value`);
      flags.set(name, ["true"]);
      continue;
    }
    const value = inline ?? argv[++index];
    if (!value || value.startsWith("--")) throw new Error(`--${name} requires a value`);
    const existing = flags.get(name) ?? [];
    if (existing.length > 0 && !REPEAT_FLAGS.has(name)) throw new Error(`--${name} was provided more than once`);
    flags.set(name, [...existing, value]);
  }
  return { command, flags };
}

function values(command: ParsedEvaluationReviewCommand, name: string): readonly string[] {
  return command.flags.get(name) ?? [];
}

function required(command: ParsedEvaluationReviewCommand, name: string): string {
  const value = values(command, name)[0]?.trim();
  if (!value) throw new Error(`--${name} is required`);
  return value;
}

function optional(command: ParsedEvaluationReviewCommand, name: string): string | undefined {
  return values(command, name)[0]?.trim() || undefined;
}

function requiredAdminAudit(command: ParsedEvaluationReviewCommand): { adminId: string; auditReason: string } {
  const adminId = required(command, "admin-id");
  const auditReason = required(command, "audit-reason");
  if (!SAFE_ID_PATTERN.test(adminId)) throw new Error("--admin-id is invalid");
  if (auditReason.length > 4_000) throw new Error("--audit-reason is too long");
  return { adminId, auditReason };
}

function integer(value: string, name: string, minimum = 0): number {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum) throw new Error(`--${name} is invalid`);
  return parsed;
}

interface StableFileSnapshot {
  readonly resolved: string;
  readonly bytes: Buffer;
  readonly sha256: string;
}

interface StableFileReadOptions {
  readonly validateRealPath?: (realPath: string) => void;
  readonly validateStat?: (stat: fs.Stats) => void;
  /** Deterministic race injection for isolated tests; production callers omit it. */
  readonly beforeOpen?: (resolved: string) => void;
  /** Deterministic race injection for isolated tests; production callers omit it. */
  readonly afterReadBeforeFinalStat?: (resolved: string) => void;
}

function sameStableFileStat(left: fs.Stats, right: fs.Stats): boolean {
  return left.dev === right.dev
    && left.ino === right.ino
    && left.size === right.size
    && left.mtimeMs === right.mtimeMs
    && left.ctimeMs === right.ctimeMs;
}

function stableRegularFileSnapshot(
  filename: string,
  field: string,
  options: StableFileReadOptions = {},
): StableFileSnapshot {
  const resolved = path.resolve(filename);
  const beforePath = fs.lstatSync(resolved);
  if (beforePath.isSymbolicLink() || !beforePath.isFile()) {
    throw new Error(`${field} must be a non-symlink regular file`);
  }
  const beforeRealPath = fs.realpathSync(resolved);
  options.validateRealPath?.(beforeRealPath);
  options.validateStat?.(beforePath);
  options.beforeOpen?.(resolved);
  const noFollow = typeof fs.constants.O_NOFOLLOW === "number" ? fs.constants.O_NOFOLLOW : 0;
  let descriptor: number;
  try {
    descriptor = fs.openSync(resolved, fs.constants.O_RDONLY | noFollow);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ELOOP") {
      throw new Error(`${field} changed while it was being opened`);
    }
    throw error;
  }
  try {
    const openedBefore = fs.fstatSync(descriptor);
    if (!openedBefore.isFile() || !sameStableFileStat(beforePath, openedBefore)) {
      throw new Error(`${field} changed while it was being opened`);
    }
    options.validateStat?.(openedBefore);
    const bytes = fs.readFileSync(descriptor);
    options.afterReadBeforeFinalStat?.(resolved);
    const openedAfter = fs.fstatSync(descriptor);
    let afterPath: fs.Stats;
    try {
      afterPath = fs.lstatSync(resolved);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new Error(`${field} changed while it was being read`);
      }
      throw error;
    }
    if (
      afterPath.isSymbolicLink()
      || !afterPath.isFile()
      || !sameStableFileStat(openedBefore, openedAfter)
      || !sameStableFileStat(openedAfter, afterPath)
      || bytes.length !== openedAfter.size
    ) {
      throw new Error(`${field} changed while it was being read`);
    }
    const afterRealPath = fs.realpathSync(resolved);
    if (afterRealPath !== beforeRealPath) {
      throw new Error(`${field} changed while it was being read`);
    }
    options.validateRealPath?.(afterRealPath);
    options.validateStat?.(openedAfter);
    return {
      resolved,
      bytes,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    };
  } finally {
    fs.closeSync(descriptor);
  }
}

function jsonFile<T>(filename: string, field: string): T {
  const snapshot = stableRegularFileSnapshot(filename, field);
  try {
    return JSON.parse(snapshot.bytes.toString("utf8")) as T;
  } catch (error) {
    throw new Error(`${field} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function isPathInside(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function assertOutsideProject(candidate: string, field: string): void {
  const projectReal = fs.realpathSync(PROJECT_ROOT);
  if (isPathInside(projectReal, candidate)) {
    throw new Error(`${field} must be outside the tracked project tree`);
  }
  if (isPathInside(candidate, projectReal)) {
    throw new Error(`${field} must not be the project root or one of its ancestors`);
  }
}

function permissionBits(stat: fs.Stats): number {
  return stat.mode & 0o777;
}

function assertReleaseDirectoryPermissions(stat: fs.Stats, field: string): void {
  const mode = permissionBits(stat);
  if (mode !== RELEASE_DIRECTORY_MODE) {
    throw new Error(`${field} permissions must be exactly 0755`);
  }
}

function assertReleaseFilePermissions(stat: fs.Stats, field: string): void {
  const mode = permissionBits(stat);
  if (mode !== RELEASE_FILE_MODE) {
    throw new Error(`${field} permissions must be exactly 0644`);
  }
}

function fsyncDirectory(directory: string): void {
  const descriptor = fs.openSync(directory, fs.constants.O_RDONLY);
  try {
    const stat = fs.fstatSync(descriptor);
    if (!stat.isDirectory()) throw new Error("release fsync target must be a directory");
    fs.fsyncSync(descriptor);
  } finally {
    fs.closeSync(descriptor);
  }
}

function assertDedicatedReleaseLocation(candidate: string, field: string): void {
  const filesystemRoot = path.parse(candidate).root;
  if (candidate === filesystemRoot || path.dirname(candidate) === filesystemRoot) {
    throw new Error(`${field} must not be a filesystem root or top-level broad directory`);
  }
  const home = fs.realpathSync(os.homedir());
  if (candidate === home || isPathInside(candidate, home)) {
    throw new Error(`${field} must not be the user HOME or one of its ancestors`);
  }
  const tempRoot = fs.realpathSync(os.tmpdir());
  if (candidate === tempRoot) {
    throw new Error(`${field} must not be the shared system temporary root`);
  }
  assertOutsideProject(candidate, field);
}

function releaseRootMarkerPath(root: string): string {
  return path.join(root, EVALUATION_RELEASE_ROOT_MARKER_FILENAME);
}

function initializeOrValidateReleaseRootMarker(root: string, create: boolean): void {
  const marker = releaseRootMarkerPath(root);
  if (!fs.existsSync(marker)) {
    if (!create) throw new Error("evaluation release root is not a dedicated Garment Canvas release directory");
    if (fs.readdirSync(root).length > 0) {
      throw new Error("evaluation release root is non-empty and has no dedicated release marker");
    }
    const fd = fs.openSync(marker, "wx", RELEASE_FILE_MODE);
    try {
      fs.writeFileSync(fd, EVALUATION_RELEASE_ROOT_MARKER_CONTENT);
      fs.fchmodSync(fd, RELEASE_FILE_MODE);
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
    fsyncDirectory(root);
    return;
  }
  const stat = fs.lstatSync(marker);
  if (stat.isSymbolicLink() || !stat.isFile()) {
    throw new Error("evaluation release root marker must be a non-symlink regular file");
  }
  assertReleaseFilePermissions(stat, "evaluation release root marker");
  if (fs.readFileSync(marker, "utf8") !== EVALUATION_RELEASE_ROOT_MARKER_CONTENT) {
    throw new Error("evaluation release root marker content is invalid");
  }
}

function nearestExistingAncestor(candidate: string): string {
  let current = candidate;
  while (!fs.existsSync(current)) {
    const parent = path.dirname(current);
    if (parent === current) throw new Error("evaluation release root has no existing ancestor");
    current = parent;
  }
  return current;
}

/**
 * Resolve the sole writable release root. An explicit root must be absolute;
 * otherwise an explicitly configured DATA_DIR is used. The project-local
 * default ./data is intentionally not accepted because release receipts must
 * never dirty or become part of the reviewed Git tree.
 */
export function resolveEvaluationReleaseRoot(
  explicitRoot: string | undefined,
  env: Readonly<Record<string, string | undefined>> = process.env,
  create = true,
): string {
  const configuredRoot = explicitRoot?.trim() || env[RELEASE_ROOT_ENV]?.trim();
  let candidate: string;
  if (configuredRoot) {
    if (!path.isAbsolute(configuredRoot)) {
      throw new Error(`--release-root/${RELEASE_ROOT_ENV} must be an absolute path`);
    }
    candidate = path.resolve(configuredRoot);
  } else {
    const dataDir = env.DATA_DIR?.trim();
    if (!dataDir) {
      throw new Error(`--release-root, ${RELEASE_ROOT_ENV}, or an explicit external DATA_DIR is required`);
    }
    candidate = path.join(
      path.isAbsolute(dataDir) ? path.resolve(dataDir) : path.resolve(PROJECT_ROOT, dataDir),
      "evaluation-release",
    );
  }

  const ancestor = nearestExistingAncestor(candidate);
  const projectedReal = path.resolve(fs.realpathSync(ancestor), path.relative(ancestor, candidate));
  assertDedicatedReleaseLocation(projectedReal, "evaluation release root");
  const existed = fs.existsSync(candidate);
  if (create) {
    fs.mkdirSync(candidate, { recursive: true, mode: RELEASE_DIRECTORY_MODE });
    if (!existed && fs.existsSync(candidate)) fs.chmodSync(candidate, RELEASE_DIRECTORY_MODE);
  }
  if (!fs.existsSync(candidate)) throw new Error("evaluation release root does not exist");
  const stat = fs.lstatSync(candidate);
  if (stat.isSymbolicLink()) throw new Error("evaluation release root must not be a symlink");
  if (!stat.isDirectory()) throw new Error("evaluation release root must be a directory");
  const rootReal = fs.realpathSync(candidate);
  assertDedicatedReleaseLocation(rootReal, "evaluation release root");
  if (create && !existed && permissionBits(stat) !== RELEASE_DIRECTORY_MODE) {
    fs.chmodSync(rootReal, RELEASE_DIRECTORY_MODE);
  }
  if (create && !existed) fsyncDirectory(path.dirname(rootReal));
  assertReleaseDirectoryPermissions(fs.lstatSync(rootReal), "evaluation release root");
  initializeOrValidateReleaseRootMarker(rootReal, create);
  return rootReal;
}

function releaseRoot(command: ParsedEvaluationReviewCommand, create = true): string {
  return resolveEvaluationReleaseRoot(optional(command, "release-root"), process.env, create);
}

function assertReleasePath(root: string, candidate: string, field: string): string {
  const resolved = path.resolve(candidate);
  if (!isPathInside(root, resolved) || resolved === root) {
    throw new Error(`${field} escapes the evaluation release root`);
  }
  const relative = path.relative(root, resolved);
  let current = root;
  for (const segment of relative.split(path.sep)) {
    current = path.join(current, segment);
    if (!fs.existsSync(current)) break;
    const stat = fs.lstatSync(current);
    if (stat.isSymbolicLink()) throw new Error(`${field} must not traverse a symlink`);
  }
  if (fs.existsSync(resolved)) {
    const real = fs.realpathSync(resolved);
    if (!isPathInside(root, real) || real === root) throw new Error(`${field} escapes the evaluation release root`);
  }
  return resolved;
}

function ensureReleaseDirectory(root: string, directory: string): string {
  if (path.resolve(directory) === root) return root;
  const resolved = assertReleasePath(root, directory, "evaluation release directory");
  const relative = path.relative(root, resolved);
  let current = root;
  for (const segment of relative.split(path.sep)) {
    current = path.join(current, segment);
    if (fs.existsSync(current)) {
      const stat = fs.lstatSync(current);
      if (stat.isSymbolicLink()) throw new Error("evaluation release directory must not traverse a symlink");
      if (!stat.isDirectory()) throw new Error("evaluation release directory component is not a directory");
      assertReleaseDirectoryPermissions(stat, "evaluation release directory");
    } else {
      fs.mkdirSync(current, { mode: RELEASE_DIRECTORY_MODE });
      fs.chmodSync(current, RELEASE_DIRECTORY_MODE);
      fsyncDirectory(path.dirname(current));
    }
  }
  return resolved;
}

function secureReleaseFile(root: string, filename: string, field: string): string {
  const resolved = assertReleasePath(root, filename, field);
  const stat = fs.lstatSync(resolved);
  if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(`${field} must be a non-symlink regular file`);
  assertReleaseFilePermissions(stat, field);
  return resolved;
}

function stableReleaseFileSnapshot(
  root: string,
  filename: string,
  field: string,
  afterReadBeforeFinalStat?: (resolved: string) => void,
): StableFileSnapshot {
  const resolved = assertReleasePath(root, filename, field);
  return stableRegularFileSnapshot(resolved, field, {
    afterReadBeforeFinalStat,
    validateRealPath(realPath) {
      if (!isPathInside(root, realPath) || realPath === root) {
        throw new Error(`${field} escapes the evaluation release root`);
      }
    },
    validateStat(stat) {
      assertReleaseFilePermissions(stat, field);
    },
  });
}

/**
 * Canonical bundle identity: validate and sort the recursively reachable raw
 * file digests, then SHA-256 the canonical JSON manifest. Array order is the
 * sorted POSIX path order; object keys are recursively sorted by
 * evaluationArtifactSha256.
 */
export function evaluationReleaseBundleSha256(
  inputFiles: readonly EvaluationReleaseBundleFileDigest[],
): { bundleSha256: string; files: readonly EvaluationReleaseBundleFileDigest[] } {
  const files = inputFiles.map((file, index) => {
    if (
      typeof file.path !== "string"
      || !file.path
      || file.path.includes("\\")
      || path.posix.isAbsolute(file.path)
      || path.posix.normalize(file.path) !== file.path
      || file.path === "."
      || file.path.startsWith("../")
    ) {
      throw new Error(`evaluation release bundle file[${index}] has an invalid relative POSIX path`);
    }
    if (!SHA256_PATTERN.test(file.sha256)) {
      throw new Error(`evaluation release bundle file[${index}] has an invalid SHA-256`);
    }
    return { path: file.path, sha256: file.sha256 };
  }).sort((left, right) => left.path.localeCompare(right.path));
  for (let index = 1; index < files.length; index += 1) {
    if (files[index - 1].path === files[index].path) {
      throw new Error(`evaluation release bundle contains duplicate path: ${files[index].path}`);
    }
  }
  const bundleSha256 = evaluationArtifactSha256({
    schemaVersion: 1,
    hashScope: EVALUATION_RELEASE_BUNDLE_HASH_SCOPE,
    files,
  });
  return { bundleSha256, files };
}

function writeBytesAtomic(
  root: string,
  targetPath: string,
  bytes: Buffer,
  replace: boolean,
  testHooks: {
    beforePublish?: (temporaryPath: string, targetPath: string) => void;
    afterParentDirectoryFsync?: (directory: string) => void;
  } = {},
): StableFileSnapshot {
  const directory = ensureReleaseDirectory(root, path.dirname(targetPath));
  const target = assertReleasePath(root, targetPath, "evaluation release output");
  if (fs.existsSync(target)) {
    const stat = fs.lstatSync(target);
    if (stat.isSymbolicLink() || !stat.isFile()) {
      throw new Error("evaluation release output must be a non-symlink regular file");
    }
    if (!replace) throw new Error("immutable evaluation release artifact already exists");
  }
  const tempPath = assertReleasePath(
    root,
    path.join(path.dirname(target), `.${path.basename(target)}.tmp-${process.pid}-${Date.now()}`),
    "evaluation release temporary file",
  );
  let fd: number | undefined;
  try {
    fd = fs.openSync(tempPath, "wx", RELEASE_FILE_MODE);
    fs.writeFileSync(fd, bytes);
    fs.fchmodSync(fd, RELEASE_FILE_MODE);
    fs.fsyncSync(fd);
    fs.closeSync(fd);
    fd = undefined;
    testHooks.beforePublish?.(tempPath, target);
    if (replace) {
      fs.renameSync(tempPath, target);
    } else {
      try {
        fs.linkSync(tempPath, target);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "EEXIST") {
          throw new Error("immutable evaluation release artifact already exists");
        }
        throw error;
      }
    }
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
  fsyncDirectory(directory);
  testHooks.afterParentDirectoryFsync?.(directory);
  const published = stableReleaseFileSnapshot(root, target, "evaluation release output");
  if (!published.bytes.equals(bytes)) {
    throw new Error("evaluation release output changed during atomic publication");
  }
  return published;
}

function writeJsonAtomic(root: string, targetPath: string, value: unknown, replace = false): StableFileSnapshot {
  return writeBytesAtomic(root, targetPath, Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8"), replace);
}

function safeArtifactPath(root: string, folder: string, digest: string, createFolder = true): string {
  if (!ARTIFACT_FOLDERS.has(folder)) throw new Error("artifact folder is invalid");
  if (!SHA256_PATTERN.test(digest)) throw new Error("artifact digest is invalid");
  const directory = path.join(root, folder);
  if (createFolder) ensureReleaseDirectory(root, directory);
  const output = assertReleasePath(root, path.join(directory, `${digest}.json`), "evaluation artifact path");
  if (path.dirname(output) !== directory) throw new Error("evaluation artifact path escapes its fixed folder");
  return output;
}

function exactCleanCodeIdentity(codeSha: string): void {
  if (!CODE_SHA_PATTERN.test(codeSha)) {
    throw new Error("--code-sha must be exactly 40 or 64 lowercase hexadecimal characters");
  }
  const identity = resolveEvaluationCodeIdentity(PROJECT_ROOT, {
    ...process.env,
    GARMENT_CANVAS_CODE_SHA: codeSha,
  });
  if (identity.dirty) throw new Error("evaluation review artifacts require a clean exact-SHA worktree");
}

function referenceProfile(command: ParsedEvaluationReviewCommand): readonly EvaluationReferenceRoleProfileEntry[] {
  const raw = jsonFile<unknown>(required(command, "reference-profile-file"), "reference profile file");
  if (!Array.isArray(raw)) throw new Error("reference profile file must contain an array");
  const profile = raw.map((entry, order) => (
    typeof entry === "string" ? { order, role: entry } : entry
  )) as EvaluationReferenceRoleProfileEntry[];
  return canonicalReferenceRoleProfile(profile);
}

function caseLocators(command: ParsedEvaluationReviewCommand): readonly EvaluationCaseLocator[] {
  const file = optional(command, "cases-file");
  if (!file) return [];
  const raw = jsonFile<unknown>(file, "cases file");
  if (!Array.isArray(raw)) throw new Error("cases file must contain an array");
  return raw.map((value, index) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`cases[${index}] is invalid`);
    const item = value as Record<string, unknown>;
    if (typeof item.caseEvidenceId !== "string" || typeof item.runId !== "string") {
      throw new Error(`cases[${index}] must contain caseEvidenceId and runId`);
    }
    return { caseEvidenceId: item.caseEvidenceId, runId: item.runId };
  });
}

function previousReceipts(
  command: ParsedEvaluationReviewCommand,
  root: string,
): readonly EvaluationGateReceipt[] {
  return values(command, "previous-receipt").map((filename) => (
    verifyGateReceiptFile(root, filename).receipt
  ));
}

async function databaseAndAdmin(adminId: string) {
  const database = await import("../server/lib/database");
  await database.initializeDatabase();
  const row = await database.queryOne<{
    id: string;
    account_id: string;
    display_name: string;
    role: "admin" | "user";
    must_change_password: number;
  }>(`
    SELECT id, account_id, display_name, role, must_change_password
    FROM users WHERE id = $1 AND active = 1 AND deleted_at IS NULL
  `, [adminId]);
  if (!row || row.role !== "admin") throw new Error("--admin-id must identify an active persisted administrator");
  const actor: AuthUser = {
    id: row.id,
    accountId: row.account_id,
    displayName: row.display_name,
    role: row.role,
    mustChangePassword: row.must_change_password === 1,
  };
  return { database, actor };
}

async function loadBundles(
  database: Awaited<ReturnType<typeof databaseAndAdmin>>["database"],
  actor: AuthUser,
  locators: readonly EvaluationCaseLocator[],
) {
  const bundles = [];
  for (const locator of locators) {
    bundles.push(await database.transaction((client) => loadEvaluationCaseEvidenceBundle(
      client,
      actor,
      locator,
    )));
  }
  return bundles;
}

function runOfflineContractChecks(): EvaluationContractCheckArtifact["commands"] {
  const tsx = path.join(PROJECT_ROOT, "node_modules/tsx/dist/cli.mjs");
  return EVALUATION_CONTRACT_CHECK_COMMANDS.map((file) => {
    const args = file === "scripts/apiyi-kb.mjs check"
      ? [path.join(PROJECT_ROOT, "scripts/apiyi-kb.mjs"), "check"]
      : file === "scripts/apiyi-docs.mjs check --offline"
        ? [path.join(PROJECT_ROOT, "scripts/apiyi-docs.mjs"), "check", "--offline"]
        : [tsx, path.join(PROJECT_ROOT, file)];
    const result = spawnSync(process.execPath, args, {
      cwd: PROJECT_ROOT,
      encoding: "utf8",
      env: {
        ...process.env,
        APIYI_API_KEY: "",
        [MODEL_LIST_ENV]: "",
        ENABLE_PAID_EVALUATION_RUNS: "false",
      },
    });
    if (result.status !== 0) throw new Error(`${file} failed:\n${result.stderr || result.stdout}`);
    return {
      file,
      stdoutSha256: createHash("sha256").update(result.stdout).digest("hex"),
    };
  });
}

function knowledgeBaseEvidence(): EvaluationContractCheckArtifact["knowledgeBase"] {
  const pointerSnapshot = stableRegularFileSnapshot(
    APIYI_POINTER_PATH,
    "API易 knowledge-base pointer",
  );
  let pointer: Record<string, unknown>;
  try {
    pointer = JSON.parse(pointerSnapshot.bytes.toString("utf8")) as Record<string, unknown>;
  } catch (error) {
    throw new Error(
      `API易 knowledge-base pointer is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  const snapshotId = typeof pointer.snapshotId === "string" ? pointer.snapshotId : "";
  const snapshotSha256 = typeof pointer.snapshotSha256 === "string" ? pointer.snapshotSha256 : "";
  const pageCount = Number(pointer.pageCount);
  if (!snapshotId || !SHA256_PATTERN.test(snapshotSha256) || !Number.isSafeInteger(pageCount) || pageCount < 1) {
    throw new Error("API易 knowledge-base pointer is invalid");
  }
  return {
    snapshotId,
    snapshotSha256,
    pageCount,
    pointerFileSha256: pointerSnapshot.sha256,
  };
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

function reviewedModelCatalogBaseline(): {
  expectedGatewayModelIds: readonly string[];
  reviewedBaselineSha256: string;
  reviewedRawExportSha256: string;
} {
  const sources = jsonFile<Record<string, unknown>>(
    path.join(APIYI_ROOT, "sources.json"),
    "API易 reviewed sources",
  );
  const sourceCatalog = sources.modelCatalog && typeof sources.modelCatalog === "object"
    ? sources.modelCatalog as Record<string, unknown>
    : {};
  const expected = sourceCatalog.expectedGatewayModelIds;
  const sourceBaseline = sourceCatalog.reviewedExportSha256;
  const sourceRawBaseline = sourceCatalog.reviewedRawExportSha256;
  const errors: string[] = [];
  if (!Array.isArray(expected) || !canonicalEqual(expected, IMAGE_MODEL_IDS)) {
    errors.push("sources.json does not bind the exact five reviewed gateway model IDs");
  }
  if (!SHA256_PATTERN.test(String(sourceBaseline ?? ""))) {
    errors.push("sources.json has no human-reviewed /v1/models baseline");
  }
  if (!SHA256_PATTERN.test(String(sourceRawBaseline ?? ""))) {
    errors.push("sources.json has no human-reviewed raw /v1/models SHA-256");
  }
  if (!canonicalEqual(REVIEWED_MODEL_CATALOG_BASELINE.expectedGatewayModelIds, IMAGE_MODEL_IDS)) {
    errors.push("runtime contracts do not bind the exact five reviewed gateway model IDs");
  }
  if (REVIEWED_MODEL_CATALOG_BASELINE.reviewedExportSha256 !== sourceBaseline) {
    errors.push("runtime contracts differ from the reviewed /v1/models baseline");
  }
  if (REVIEWED_MODEL_CATALOG_BASELINE.reviewedRawExportSha256 !== sourceRawBaseline) {
    errors.push("runtime contracts differ from the reviewed raw /v1/models SHA-256");
  }
  if (errors.length > 0) {
    const observedMissing = latestObservedCatalogMissingIds();
    if (observedMissing.length > 0) {
      errors.push(`latest retained /v1/models evidence is missing: ${observedMissing.join(", ")}`);
    }
    throw new Error(`reviewed gateway model catalog is blocked:\n${errors.join("\n")}`);
  }
  return {
    expectedGatewayModelIds: IMAGE_MODEL_IDS,
    reviewedBaselineSha256: sourceBaseline as string,
    reviewedRawExportSha256: sourceRawBaseline as string,
  };
}

function latestObservedCatalogMissingIds(): readonly string[] {
  const evidenceRoot = path.join(APIYI_ROOT, "evidence");
  if (!fs.existsSync(evidenceRoot)) return [];
  const candidates = fs.readdirSync(evidenceRoot)
    .filter((name) => name.endsWith(".json"))
    .map((name) => {
      try {
        return jsonFile<Record<string, unknown>>(path.join(evidenceRoot, name), "API易 model catalog evidence");
      } catch {
        return undefined;
      }
    })
    .filter((value): value is Record<string, unknown> => value?.kind === "gateway-model-catalog")
    .sort((left, right) => String(right.capturedAt ?? "").localeCompare(String(left.capturedAt ?? "")));
  const missing = candidates[0]?.missingExpectedIds;
  return Array.isArray(missing)
    ? missing.filter((id): id is string => (
        typeof id === "string" && (IMAGE_MODEL_IDS as readonly string[]).includes(id)
      ))
    : [];
}

function externalModelListFile(command: ParsedEvaluationReviewCommand): string {
  const configured = optional(command, "model-list") || process.env[MODEL_LIST_ENV]?.trim();
  if (!configured) {
    const observedMissing = latestObservedCatalogMissingIds();
    const suffix = observedMissing.length > 0
      ? `; latest retained catalog evidence is missing: ${observedMissing.join(", ")}`
      : "";
    throw new Error(`reviewed /v1/models export is required via --model-list or ${MODEL_LIST_ENV}${suffix}`);
  }
  if (!path.isAbsolute(configured)) throw new Error("reviewed /v1/models export path must be absolute");
  return path.resolve(configured);
}

export function validateReviewedGatewayModelCatalogBytes(
  raw: Buffer,
  baseline: {
    expectedGatewayModelIds: readonly string[];
    reviewedBaselineSha256: string;
    reviewedRawExportSha256: string;
  },
): EvaluationContractCheckArtifact["gatewayModelCatalog"] {
  let payload: unknown;
  try {
    payload = JSON.parse(raw.toString("utf8"));
  } catch (error) {
    throw new Error(`reviewed /v1/models export is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  const ids = canonicalModelIds(payload);
  const missing = baseline.expectedGatewayModelIds.filter((id) => !ids.includes(id));
  if (missing.length > 0) {
    throw new Error(`reviewed /v1/models export is missing exact gateway model IDs: ${missing.join(", ")}`);
  }
  const canonicalModelIdSetSha256 = evaluationArtifactSha256(ids);
  if (canonicalModelIdSetSha256 !== baseline.reviewedBaselineSha256) {
    throw new Error("reviewed /v1/models export fingerprint differs from its human-reviewed baseline");
  }
  const modelListFileSha256 = createHash("sha256").update(raw).digest("hex");
  if (modelListFileSha256 !== baseline.reviewedRawExportSha256) {
    throw new Error("reviewed /v1/models export raw SHA-256 differs from its human-reviewed baseline");
  }
  return {
    modelListFileSha256,
    canonicalModelIdSetSha256,
    reviewedBaselineSha256: baseline.reviewedBaselineSha256,
    reviewedRawExportSha256: baseline.reviewedRawExportSha256,
    expectedGatewayModelIds: baseline.expectedGatewayModelIds,
  };
}

function gatewayModelCatalogEvidence(
  command: ParsedEvaluationReviewCommand,
  testHooks: EvaluationReviewCommandTestHooks = {},
): {
  evidence: EvaluationContractCheckArtifact["gatewayModelCatalog"];
  raw: Buffer;
} {
  const baseline = reviewedModelCatalogBaseline();
  const modelListPath = externalModelListFile(command);
  const modelListSnapshot = stableRegularFileSnapshot(modelListPath, "reviewed /v1/models export", {
    validateRealPath(realPath) {
      assertOutsideProject(realPath, "reviewed /v1/models export");
    },
    beforeOpen: testHooks.beforeExternalModelListOpen,
  });
  const raw = modelListSnapshot.bytes;
  return {
    raw,
    evidence: validateReviewedGatewayModelCatalogBytes(raw, baseline),
  };
}

function createRetainedFileExclusively(root: string, targetPath: string, bytes: Buffer): void {
  const directory = ensureReleaseDirectory(root, path.dirname(targetPath));
  const temporaryPath = assertReleasePath(
    root,
    path.join(directory, `.${path.basename(targetPath)}.tmp-${process.pid}-${randomUUID()}`),
    "retained /v1/models temporary file",
  );
  let descriptor: number | undefined;
  try {
    descriptor = fs.openSync(temporaryPath, "wx", RELEASE_FILE_MODE);
    fs.writeFileSync(descriptor, bytes);
    fs.fchmodSync(descriptor, RELEASE_FILE_MODE);
    fs.fsyncSync(descriptor);
    fs.closeSync(descriptor);
    descriptor = undefined;
    try {
      // link(2) publishes a completely written inode only if the digest path is
      // still absent. Concurrent creators cannot overwrite one another.
      fs.linkSync(temporaryPath, targetPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    }
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
    if (fs.existsSync(temporaryPath)) fs.unlinkSync(temporaryPath);
  }
  fsyncDirectory(directory);
}

export function materializeAndVerifyRetainedGatewayModelCatalog(
  root: string,
  raw: Buffer,
  evidence: EvaluationContractCheckArtifact["gatewayModelCatalog"],
  testHooks: {
    /** Isolated deterministic race injection; production callers omit it. */
    beforeFinalRead?: (retainedPath: string) => void;
    /** Isolated same-inode mutation injection after the fd read. */
    afterFinalReadBeforeStat?: (retainedPath: string) => void;
  } = {},
): string {
  const expected = validateReviewedGatewayModelCatalogBytes(raw, {
    expectedGatewayModelIds: evidence.expectedGatewayModelIds,
    reviewedBaselineSha256: evidence.reviewedBaselineSha256,
    reviewedRawExportSha256: evidence.reviewedRawExportSha256,
  });
  if (!canonicalEqual(expected, evidence)) {
    throw new Error("retained /v1/models evidence differs from the validated external raw export");
  }
  const retainedPath = safeArtifactPath(root, "model-catalogs", evidence.modelListFileSha256, false);
  createRetainedFileExclusively(root, retainedPath, raw);
  testHooks.beforeFinalRead?.(retainedPath);
  const retainedSnapshot = stableReleaseFileSnapshot(
    root,
    retainedPath,
    "retained /v1/models artifact",
    () => testHooks.afterFinalReadBeforeStat?.(retainedPath),
  );
  const retainedEvidence = validateReviewedGatewayModelCatalogBytes(retainedSnapshot.bytes, {
    expectedGatewayModelIds: evidence.expectedGatewayModelIds,
    reviewedBaselineSha256: evidence.reviewedBaselineSha256,
    reviewedRawExportSha256: evidence.reviewedRawExportSha256,
  });
  if (!canonicalEqual(retainedEvidence, evidence)) {
    throw new Error("retained /v1/models artifact differs from the approved catalog evidence");
  }
  return retainedPath;
}

interface ReleaseChainState {
  readonly receipts: Map<string, EvaluationGateReceipt>;
  readonly contracts: Map<string, EvaluationContractCheckArtifact>;
  readonly campaignClosures: Map<string, EvaluationCampaignClosure>;
  readonly files: Map<string, string>;
  readonly activeReceipts: Set<string>;
}

function releaseChainState(): ReleaseChainState {
  return {
    receipts: new Map(),
    contracts: new Map(),
    campaignClosures: new Map(),
    files: new Map(),
    activeReceipts: new Set(),
  };
}

function rememberReleaseFile(root: string, snapshot: StableFileSnapshot, state: ReleaseChainState): void {
  const relative = path.relative(root, snapshot.resolved).split(path.sep).join("/");
  state.files.set(relative, snapshot.sha256);
}

interface ReleaseJsonFileSnapshot extends StableFileSnapshot {
  readonly value: unknown;
}

function releaseJsonFile(
  root: string,
  filename: string,
  field: string,
  afterReadBeforeFinalStat?: (resolved: string) => void,
): ReleaseJsonFileSnapshot {
  const snapshot = stableReleaseFileSnapshot(root, filename, field, afterReadBeforeFinalStat);
  try {
    return { ...snapshot, value: JSON.parse(snapshot.bytes.toString("utf8")) as unknown };
  } catch (error) {
    throw new Error(`${field} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function assertArtifactLocation(
  root: string,
  resolved: string,
  folder: string,
  digest: string,
  field: string,
): void {
  const expected = safeArtifactPath(root, folder, digest, false);
  if (resolved !== expected) throw new Error(`${field} must use ${folder}/<artifact-sha256>.json`);
}

function assertContractArtifactMatchesLocalEvidence(
  root: string,
  artifact: EvaluationContractCheckArtifact,
  state: ReleaseChainState,
): void {
  const knowledgeBase = knowledgeBaseEvidence();
  if (!canonicalEqual(artifact.knowledgeBase, knowledgeBase)) {
    throw new Error("contract check artifact differs from the current local API易 knowledge-base pointer");
  }
  const baseline = reviewedModelCatalogBaseline();
  if (
    artifact.gatewayModelCatalog.reviewedBaselineSha256 !== baseline.reviewedBaselineSha256
    || artifact.gatewayModelCatalog.reviewedRawExportSha256 !== baseline.reviewedRawExportSha256
    || !canonicalEqual(artifact.gatewayModelCatalog.expectedGatewayModelIds, baseline.expectedGatewayModelIds)
  ) {
    throw new Error("contract check artifact differs from the current reviewed /v1/models baseline");
  }
  const modelListPath = safeArtifactPath(
    root,
    "model-catalogs",
    artifact.gatewayModelCatalog.modelListFileSha256,
    false,
  );
  const modelListSnapshot = releaseJsonFile(root, modelListPath, "retained /v1/models artifact");
  if (modelListSnapshot.sha256 !== artifact.gatewayModelCatalog.modelListFileSha256) {
    throw new Error("retained /v1/models artifact bytes differ from the contract check");
  }
  const ids = canonicalModelIds(modelListSnapshot.value);
  const missing = baseline.expectedGatewayModelIds.filter((id) => !ids.includes(id));
  if (missing.length > 0) {
    throw new Error(`retained /v1/models artifact is missing exact gateway model IDs: ${missing.join(", ")}`);
  }
  if (evaluationArtifactSha256(ids) !== artifact.gatewayModelCatalog.canonicalModelIdSetSha256) {
    throw new Error("retained /v1/models artifact canonical ID hash differs from the contract check");
  }
  rememberReleaseFile(root, modelListSnapshot, state);
}

function verifyContractCheckFile(
  root: string,
  filename: string,
  state: ReleaseChainState,
): EvaluationContractCheckArtifact {
  const snapshot = releaseJsonFile(root, filename, "contract check artifact");
  const artifact = validateEvaluationContractCheckArtifact(snapshot.value);
  assertArtifactLocation(root, snapshot.resolved, "contract-checks", artifact.artifactSha256, "contract check artifact");
  const cached = state.contracts.get(artifact.artifactSha256);
  if (cached) {
    if (!canonicalEqual(cached, artifact)) throw new Error("contract check digest resolves to different content");
    return cached;
  }
  state.contracts.set(artifact.artifactSha256, artifact);
  rememberReleaseFile(root, snapshot, state);
  assertContractArtifactMatchesLocalEvidence(root, artifact, state);
  return artifact;
}

function loadContractCheckBySha(
  root: string,
  digest: string,
  state: ReleaseChainState,
): EvaluationContractCheckArtifact {
  return verifyContractCheckFile(root, safeArtifactPath(root, "contract-checks", digest, false), state);
}

function readGateReceiptFile(
  root: string,
  filename: string,
  state: ReleaseChainState,
): EvaluationGateReceipt {
  const snapshot = releaseJsonFile(root, filename, "gate receipt");
  const receipt = validateEvaluationGateReceipt(snapshot.value);
  assertArtifactLocation(root, snapshot.resolved, "gate-receipts", receipt.artifactSha256, "gate receipt");
  const cached = state.receipts.get(receipt.artifactSha256);
  if (cached) {
    if (!canonicalEqual(cached, receipt)) throw new Error("gate receipt digest resolves to different content");
    return cached;
  }
  state.receipts.set(receipt.artifactSha256, receipt);
  rememberReleaseFile(root, snapshot, state);
  return receipt;
}

function loadGateReceiptBySha(
  root: string,
  digest: string,
  state: ReleaseChainState,
): EvaluationGateReceipt {
  return readGateReceiptFile(root, safeArtifactPath(root, "gate-receipts", digest, false), state);
}

function campaignClosureCaseAuditRefs(closure: EvaluationCampaignClosure): readonly Record<string, unknown>[] {
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

function loadCampaignClosureBySha(
  root: string,
  digest: string,
  state: ReleaseChainState,
): EvaluationCampaignClosure {
  const cached = state.campaignClosures.get(digest);
  if (cached) return cached;
  const snapshot = releaseJsonFile(
    root,
    safeArtifactPath(root, "campaign-closures", digest, false),
    "evaluation campaign closure",
  );
  const closure = validateEvaluationCampaignClosure(snapshot.value);
  assertArtifactLocation(root, snapshot.resolved, "campaign-closures", closure.artifactSha256, "evaluation campaign closure");
  if (closure.artifactSha256 !== digest) throw new Error("campaign closure digest resolves to different content");
  state.campaignClosures.set(digest, closure);
  rememberReleaseFile(root, snapshot, state);
  return closure;
}

function assertCampaignClosureMatchesGateReceipt(
  closure: EvaluationCampaignClosure,
  receipt: EvaluationGateReceipt,
): void {
  if (
    closure.artifactSha256 !== receipt.campaignClosureSha256
    || closure.campaignId !== receipt.campaignId
    || closure.stage !== receipt.stage
    || closure.codeSha !== receipt.codeSha
    || closure.modelId !== receipt.unit.modelId
    || closure.authorizationUnitKey !== receipt.authorizationUnitKey
    || !canonicalEqual(campaignClosureCaseAuditRefs(closure), receipt.cases)
  ) {
    throw new Error("gate receipt differs from its sealed campaign closure");
  }
}

function verifyGateReceiptCampaignClosure(
  root: string,
  receipt: EvaluationGateReceipt,
  state: ReleaseChainState,
): void {
  assertStageCampaignClosureBinding(
    receipt.stage,
    receipt.campaignId,
    receipt.campaignClosureSha256,
    "gate receipt",
  );
  if (receipt.stage === "contract") return;
  assertCampaignClosureMatchesGateReceipt(
    loadCampaignClosureBySha(root, receipt.campaignClosureSha256!, state),
    receipt,
  );
}

function verifyGateReceiptChain(
  root: string,
  receipt: EvaluationGateReceipt,
  state: ReleaseChainState,
): readonly EvaluationGateReceipt[] {
  if (state.activeReceipts.has(receipt.artifactSha256)) throw new Error("gate receipt chain contains a cycle");
  state.activeReceipts.add(receipt.artifactSha256);
  try {
    const stageIndex = PROMPT_EVALUATION_STAGE_ORDER.indexOf(receipt.stage);
    const previous = receipt.previousReceiptSha256s.map((digest) => loadGateReceiptBySha(root, digest, state));
    if (previous.length !== stageIndex) throw new Error("gate receipt chain length differs from its stage");
    for (const [index, prior] of previous.entries()) {
      if (prior.stage !== PROMPT_EVALUATION_STAGE_ORDER[index]) {
        throw new Error(`gate receipt chain item ${index} has the wrong stage`);
      }
      if (
        prior.codeSha !== receipt.codeSha
        || !canonicalEqual(prior.unit, receipt.unit)
        || !canonicalEqual(prior.currentVersions, receipt.currentVersions)
      ) {
        throw new Error(`gate receipt chain item ${index} belongs to another code/unit/version`);
      }
      if (!canonicalEqual(prior.previousReceiptSha256s, receipt.previousReceiptSha256s.slice(0, index))) {
        throw new Error(`gate receipt chain item ${index} has an invalid recursive prefix`);
      }
      verifyGateReceiptChain(root, prior, state);
    }
    assertStageCaseIdentityDisjoint(
      receipt.stage,
      receipt.cases,
      previous,
      "gate receipt.cases",
    );
    assertStageAuthorizationUnitKeyConsistent(
      receipt.stage,
      receipt.authorizationUnitKey,
      previous,
      "gate receipt",
    );
    verifyGateReceiptCampaignClosure(root, receipt, state);
    if (receipt.stage === "contract") {
      const contract = loadContractCheckBySha(root, receipt.contractCheckSha256!, state);
      if (
        contract.artifactSha256 !== receipt.contractCheckSha256
        || contract.variantId !== receipt.variantId
        || contract.codeSha !== receipt.codeSha
        || !canonicalEqual(contract.referenceRoleProfile, receipt.unit.referenceRoleProfile)
      ) {
        throw new Error("contract-stage receipt differs from its contract-check artifact");
      }
    }
    return previous;
  } finally {
    state.activeReceipts.delete(receipt.artifactSha256);
  }
}

function verifyGateReceiptFile(
  root: string,
  filename: string,
  state: ReleaseChainState = releaseChainState(),
): { receipt: EvaluationGateReceipt; previous: readonly EvaluationGateReceipt[]; state: ReleaseChainState } {
  const receipt = readGateReceiptFile(root, filename, state);
  return { receipt, previous: verifyGateReceiptChain(root, receipt, state), state };
}

function stage(value: string): PromptEvaluationStage {
  if (!["contract", "provider-probe", "internal-experiment", "formal-validation", "recommendation"].includes(value)) {
    throw new Error("--stage is invalid");
  }
  return value as PromptEvaluationStage;
}

function paidCampaignStage(value: PromptEvaluationStage): PaidEvaluationCampaignStage {
  if (value === "provider-probe" || value === "internal-experiment" || value === "formal-validation") {
    return value;
  }
  throw new Error("only a paid evaluation stage may bind an immutable campaign");
}

async function commandExport(command: ParsedEvaluationReviewCommand): Promise<Record<string, unknown>> {
  const { adminId, auditReason } = requiredAdminAudit(command);
  const root = releaseRoot(command);
  const { database, actor } = await databaseAndAdmin(adminId);
  try {
    const bundle = await database.transaction((client) => loadEvaluationCaseEvidenceBundle(client, actor, {
      caseEvidenceId: required(command, "case-evidence-id"),
      runId: required(command, "run-id"),
    }));
    const base = {
      schemaVersion: 1,
      artifactType: "evaluation-case-export",
      exportedBy: actor.id,
      auditReason,
      exportedAt: new Date().toISOString(),
      bundle,
    } as const;
    const artifact = { ...base, artifactSha256: evaluationArtifactSha256(base) };
    const output = safeArtifactPath(root, "exports", artifact.artifactSha256);
    writeJsonAtomic(root, output, artifact);
    return { exported: true, output, artifactSha256: artifact.artifactSha256 };
  } finally {
    await database.closeDatabaseForTests();
  }
}

async function commandReconcile(command: ParsedEvaluationReviewCommand): Promise<Record<string, unknown>> {
  const { adminId, auditReason } = requiredAdminAudit(command);
  const { database, actor } = await databaseAndAdmin(adminId);
  try {
    const status = required(command, "status");
    if (status !== "confirmed-billed" && status !== "confirmed-not-billed") throw new Error("--status is invalid");
    const note = [auditReason, optional(command, "note")].filter(Boolean).join("\n");
    const event = await database.transaction((client) => appendEvaluationBillingReconciliation(client, actor, {
      caseEvidenceId: required(command, "case-evidence-id"),
      runId: required(command, "run-id"),
      providerRequestEvidenceId: required(command, "provider-request-evidence-id"),
      status,
      actualCostMinor: integer(required(command, "actual-cost-minor"), "actual-cost-minor"),
      currency: required(command, "currency").toUpperCase(),
      billingReference: required(command, "billing-reference"),
      note,
    }));
    return { reconciled: true, event };
  } finally {
    await database.closeDatabaseForTests();
  }
}

async function commandScore(command: ParsedEvaluationReviewCommand): Promise<Record<string, unknown>> {
  const { adminId, auditReason } = requiredAdminAudit(command);
  const { database, actor } = await databaseAndAdmin(adminId);
  try {
    const scores = jsonFile<PromptEvaluationScores>(required(command, "scores-file"), "scores file");
    const blockersFile = optional(command, "hard-blockers-file");
    const event = await database.transaction((client) => appendEvaluationManualAssessment(client, actor, {
      caseEvidenceId: required(command, "case-evidence-id"),
      runId: required(command, "run-id"),
      outputIndex: integer(required(command, "output-index"), "output-index"),
      scores,
      taskPassed: command.flags.has("task-passed"),
      validForScoring: true,
      ...(blockersFile ? { hardBlockers: jsonFile<readonly EvaluationHardBlocker[]>(blockersFile, "hard blockers file") } : {}),
      reviewNote: [auditReason, optional(command, "review-note")].filter(Boolean).join("\n"),
    }));
    return { scored: true, event };
  } finally {
    await database.closeDatabaseForTests();
  }
}

async function commandContractCheck(
  command: ParsedEvaluationReviewCommand,
  testHooks: EvaluationReviewCommandTestHooks = {},
): Promise<Record<string, unknown>> {
  const { adminId, auditReason } = requiredAdminAudit(command);
  const codeSha = required(command, "code-sha");
  const variantId = required(command, "variant-id");
  const roles = referenceProfile(command);
  const modelCatalog = gatewayModelCatalogEvidence(command, testHooks);
  const commands = runOfflineContractChecks();
  const knowledgeBase = knowledgeBaseEvidence();
  exactCleanCodeIdentity(codeSha);
  const root = releaseRoot(command);
  const { database, actor } = await databaseAndAdmin(adminId);
  try {
    const base: Omit<EvaluationContractCheckArtifact, "artifactSha256"> = {
      schemaVersion: 1,
      artifactType: "prompt-evaluation-contract-check",
      variantId,
      referenceRoleProfile: roles,
      codeSha,
      commands,
      knowledgeBase,
      gatewayModelCatalog: modelCatalog.evidence,
      approvedBy: actor.id,
      auditReason,
      createdAt: new Date().toISOString(),
    };
    const artifact: EvaluationContractCheckArtifact = {
      ...base,
      artifactSha256: evaluationArtifactSha256(base),
    };
    validateEvaluationContractCheckArtifact(artifact);
    materializeAndVerifyRetainedGatewayModelCatalog(
      root,
      modelCatalog.raw,
      modelCatalog.evidence,
    );
    const output = safeArtifactPath(root, "contract-checks", artifact.artifactSha256);
    writeJsonAtomic(root, output, artifact);
    return { checked: true, output, artifactSha256: artifact.artifactSha256 };
  } finally {
    await database.closeDatabaseForTests();
  }
}

async function commandGate(command: ParsedEvaluationReviewCommand): Promise<Record<string, unknown>> {
  const { adminId, auditReason } = requiredAdminAudit(command);
  const codeSha = required(command, "code-sha");
  const evaluatedStage = stage(required(command, "stage"));
  if (evaluatedStage === "recommendation") {
    throw new Error(RECOMMENDATION_BASELINE_BLOCKER_DETAIL);
  }
  if (evaluatedStage !== "contract") assertEvaluationCampaignReady();
  const campaignId = optional(command, "campaign-id") ?? null;
  if (evaluatedStage === "contract" && campaignId !== null) {
    throw new Error("--campaign-id is only valid for a paid evaluation stage");
  }
  if (evaluatedStage !== "contract") {
    if (!campaignId) throw new Error("paid evaluation gate requires --campaign-id");
    if (optional(command, "cases-file")) {
      throw new Error("paid evaluation gate derives every case from its sealed campaign; --cases-file is forbidden");
    }
  }
  const root = releaseRoot(command);
  exactCleanCodeIdentity(codeSha);
  const variantId = required(command, "variant-id");
  const roles = referenceProfile(command);
  const receipts = previousReceipts(command, root);
  const contractFile = optional(command, "contract-check");
  if (evaluatedStage === "contract" && !contractFile) throw new Error("contract stage requires --contract-check");
  if (evaluatedStage !== "contract" && contractFile) throw new Error("--contract-check is only valid for the contract stage");
  let contractCheckSha256: string | null = null;
  if (contractFile) {
    const contract = verifyContractCheckFile(root, contractFile, releaseChainState());
    if (contract.variantId !== variantId || contract.codeSha !== codeSha || !canonicalEqual(contract.referenceRoleProfile, roles)) {
      throw new Error("contract check does not match this exact variant/profile/code SHA");
    }
    contractCheckSha256 = contract.artifactSha256;
  }
  const { database, actor } = await databaseAndAdmin(adminId);
  try {
    const campaign = campaignId === null
      ? undefined
      : await database.transaction((client) => loadEvaluationCampaignForGate(client, {
        campaignId,
        ownerId: actor.id,
        stage: paidCampaignStage(evaluatedStage),
        codeSha,
      }));
    const bundles = await loadBundles(
      database,
      actor,
      campaign ? campaign.slots : caseLocators(command),
    );
    const evaluated = evaluateEvidenceBundlesForStage({
      variantId,
      referenceRoleProfile: roles,
      stage: evaluatedStage,
      bundles,
      previousReceipts: receipts,
      codeSha,
      contractVerified: true,
    });
    if (!evaluated.gateResult.passed) return { passed: false, gateResult: evaluated.gateResult };
    let campaignClosure: EvaluationCampaignClosure | undefined;
    let campaignClosureOutput: string | undefined;
    if (campaign) {
      if (campaign.closureSha256) {
        campaignClosure = loadCampaignClosureBySha(root, campaign.closureSha256, releaseChainState());
      } else {
        campaignClosure = await database.transaction((client) => buildEvaluationCampaignClosure(client, {
          campaignId: campaign.campaignId,
          ownerId: actor.id,
          stage: paidCampaignStage(evaluatedStage),
          codeSha,
          closedBy: actor.id,
        }));
        campaignClosureOutput = safeArtifactPath(
          root,
          "campaign-closures",
          campaignClosure.artifactSha256,
        );
        writeJsonAtomic(root, campaignClosureOutput, campaignClosure);
        await database.transaction((client) => sealEvaluationCampaignClosure(client, campaignClosure!));
      }
      if (
        campaignClosure.campaignId !== campaign.campaignId
        || campaignClosure.stage !== evaluatedStage
        || campaignClosure.codeSha !== codeSha
        || campaignClosure.modelId !== evaluated.unit.modelId
        || campaignClosure.authorizationUnitKey !== evaluated.authorizationUnitKey
        || !canonicalEqual(campaignClosureCaseAuditRefs(campaignClosure), evaluated.caseAuditRefs)
      ) {
        throw new Error("sealed campaign closure differs from the exact gate evidence");
      }
    }
    const receipt = createEvaluationGateReceipt({
      evaluated,
      stage: evaluatedStage,
      previousReceipts: receipts,
      codeSha,
      approvedBy: actor.id,
      auditReason,
      createdAt: new Date().toISOString(),
      contractCheckSha256,
      campaignId: campaign?.campaignId ?? null,
      campaignClosureSha256: campaignClosure?.artifactSha256 ?? null,
    });
    const output = safeArtifactPath(root, "gate-receipts", receipt.artifactSha256);
    writeJsonAtomic(root, output, receipt);
    return {
      passed: true,
      output,
      artifactSha256: receipt.artifactSha256,
      ...(campaignClosure ? {
        campaignId: campaignClosure.campaignId,
        campaignClosureSha256: campaignClosure.artifactSha256,
        campaignClosureOutput,
      } : {}),
      gateResult: receipt.gateResult,
    };
  } finally {
    await database.closeDatabaseForTests();
  }
}

function canonicalEqual(left: unknown, right: unknown): boolean {
  return evaluationArtifactSha256(left) === evaluationArtifactSha256(right);
}

export interface EvaluationReleaseRegistryDocument {
  registry: PromptEvaluationReleaseRegistry;
  registryPath: string;
  existed: boolean;
  registryFileSha256: string | null;
  registryBytes?: Buffer;
}

function registryDocument(
  root: string,
  allowMissing: boolean,
  afterReadBeforeFinalStat?: (resolved: string) => void,
): EvaluationReleaseRegistryDocument {
  const registryPath = assertReleasePath(
    root,
    path.join(root, EVALUATION_RELEASE_REGISTRY_RELATIVE_PATH),
    "prompt release registry",
  );
  if (!fs.existsSync(registryPath)) {
    if (!allowMissing) throw new Error("external prompt release registry does not exist");
    return {
      registry: { schemaVersion: 1, generatedAt: null, releases: [] },
      registryPath,
      existed: false,
      registryFileSha256: null,
    };
  }
  const snapshot = releaseJsonFile(
    root,
    registryPath,
    "prompt release registry",
    afterReadBeforeFinalStat,
  );
  const checked = validatePromptEvaluationReleaseRegistry(snapshot.value);
  if (checked.errors.length) throw new Error(`prompt release registry is invalid:\n${checked.errors.join("\n")}`);
  return {
    registry: checked.registry,
    registryPath,
    existed: true,
    registryFileSha256: snapshot.sha256,
    registryBytes: snapshot.bytes,
  };
}

function registrySnapshotFromDocument(
  document: EvaluationReleaseRegistryDocument,
): ReleaseJsonFileSnapshot {
  if (!document.existed || !document.registryBytes || !document.registryFileSha256) {
    throw new Error("prompt release registry stable snapshot is unavailable");
  }
  return {
    resolved: document.registryPath,
    bytes: document.registryBytes,
    sha256: document.registryFileSha256,
    value: document.registry,
  };
}

export interface EvaluationReleaseRegistryLockContext {
  root: string;
  read(allowMissing?: boolean): EvaluationReleaseRegistryDocument;
  compareAndSwap(
    expectedRegistryFileSha256: string | null,
    nextRegistry: PromptEvaluationReleaseRegistry,
  ): string;
  restore(
    expectedCurrentRegistryFileSha256: string,
    previousRegistryBytes?: Buffer,
  ): void;
}

function waitForRegistryLock(milliseconds: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

function assertExpectedRegistryRevision(
  current: EvaluationReleaseRegistryDocument,
  expected: string | null,
): void {
  if (expected !== null && !SHA256_PATTERN.test(expected)) {
    throw new Error("expected registry SHA-256 is invalid");
  }
  if (current.registryFileSha256 !== expected) {
    throw new Error("prompt release registry CAS conflict; refusing a stale update");
  }
}

function registryBytes(registry: PromptEvaluationReleaseRegistry): Buffer {
  const checked = validatePromptEvaluationReleaseRegistry(registry);
  if (checked.errors.length) throw new Error(`generated registry is invalid:\n${checked.errors.join("\n")}`);
  return Buffer.from(`${JSON.stringify(checked.registry, null, 2)}\n`, "utf8");
}

/**
 * Serialize registry mutation across CLI processes. A leftover lock is never
 * auto-broken: timeout means a human must establish that no writer survives.
 * The callback is intentionally synchronous so one process cannot yield while
 * holding the filesystem lock.
 */
export function withEvaluationReleaseRegistryLock<T>(
  configuredRoot: string,
  callback: (context: EvaluationReleaseRegistryLockContext) => T,
  options: {
    timeoutMs?: number;
    pollMs?: number;
    /** Deterministic registry race injection for isolated tests. */
    afterRegistryReadBeforeFinalStat?: (registryPath: string) => void;
    /** Deterministic no-clobber injection immediately before registry publication. */
    beforeRegistryPublish?: (registryPath: string) => void;
    /** Observation point reached only after the registry parent directory fsync. */
    afterRegistryParentDirectoryFsync?: (directory: string) => void;
  } = {},
): T {
  const root = resolveEvaluationReleaseRoot(configuredRoot, {}, false);
  const lockPath = assertReleasePath(
    root,
    path.join(root, EVALUATION_RELEASE_REGISTRY_LOCK_FILENAME),
    "prompt release registry lock",
  );
  const timeoutMs = options.timeoutMs ?? REGISTRY_LOCK_TIMEOUT_MS;
  const pollMs = options.pollMs ?? REGISTRY_LOCK_POLL_MS;
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 0) throw new Error("registry lock timeout is invalid");
  if (!Number.isSafeInteger(pollMs) || pollMs < 1) throw new Error("registry lock poll interval is invalid");
  const deadline = Date.now() + timeoutMs;
  let descriptor: number | undefined;
  let lockIdentity: { dev: number; ino: number } | undefined;
  while (descriptor === undefined) {
    let acquiredDescriptor: number;
    try {
      acquiredDescriptor = fs.openSync(lockPath, "wx", RELEASE_FILE_MODE);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      let stat: fs.Stats;
      try {
        stat = fs.lstatSync(lockPath);
      } catch (inspectError) {
        if ((inspectError as NodeJS.ErrnoException).code === "ENOENT") continue;
        throw inspectError;
      }
      if (stat.isSymbolicLink() || !stat.isFile()) {
        throw new Error("prompt release registry lock must be a non-symlink regular file");
      }
      if (Date.now() >= deadline) {
        throw new Error("prompt release registry lock timed out; stale locks are not removed automatically");
      }
      waitForRegistryLock(Math.min(pollMs, Math.max(1, deadline - Date.now())));
      continue;
    }

    let acquiredIdentity: { dev: number; ino: number } | undefined;
    try {
      const stat = fs.fstatSync(acquiredDescriptor);
      acquiredIdentity = { dev: stat.dev, ino: stat.ino };
      const metadata = Buffer.from(`${JSON.stringify({ pid: process.pid, acquiredAt: new Date().toISOString() })}\n`);
      fs.writeFileSync(acquiredDescriptor, metadata);
      fs.fchmodSync(acquiredDescriptor, RELEASE_FILE_MODE);
      fs.fsyncSync(acquiredDescriptor);
      descriptor = acquiredDescriptor;
      lockIdentity = acquiredIdentity;
    } catch (error) {
      let cleanupError: unknown;
      try {
        fs.closeSync(acquiredDescriptor);
        if (acquiredIdentity) {
          const current = fs.lstatSync(lockPath);
          if (current.isSymbolicLink() || !current.isFile()
            || current.dev !== acquiredIdentity.dev || current.ino !== acquiredIdentity.ino) {
            throw new Error("prompt release registry lock ownership changed during acquisition");
          }
          fs.unlinkSync(lockPath);
        }
      } catch (caught) {
        if ((caught as NodeJS.ErrnoException).code !== "ENOENT") cleanupError = caught;
      }
      if (cleanupError) {
        throw new AggregateError(
          [error, cleanupError],
          "prompt release registry lock acquisition and cleanup both failed",
        );
      }
      throw error;
    }
  }

  const context: EvaluationReleaseRegistryLockContext = {
    root,
    read: (allowMissing = true) => registryDocument(
      root,
      allowMissing,
      options.afterRegistryReadBeforeFinalStat,
    ),
    compareAndSwap: (expectedRegistryFileSha256, nextRegistry) => {
      const current = registryDocument(root, true, options.afterRegistryReadBeforeFinalStat);
      assertExpectedRegistryRevision(current, expectedRegistryFileSha256);
      const bytes = registryBytes(nextRegistry);
      return writeBytesAtomic(root, current.registryPath, bytes, current.existed, {
        beforePublish: (_temporaryPath, targetPath) => options.beforeRegistryPublish?.(targetPath),
        afterParentDirectoryFsync: options.afterRegistryParentDirectoryFsync,
      }).sha256;
    },
    restore: (expectedCurrentRegistryFileSha256, previousRegistryBytes) => {
      if (!SHA256_PATTERN.test(expectedCurrentRegistryFileSha256)) {
        throw new Error("rollback registry SHA-256 is invalid");
      }
      const current = registryDocument(root, false, options.afterRegistryReadBeforeFinalStat);
      assertExpectedRegistryRevision(current, expectedCurrentRegistryFileSha256);
      if (previousRegistryBytes) {
        let previous: unknown;
        try {
          previous = JSON.parse(previousRegistryBytes.toString("utf8")) as unknown;
        } catch (error) {
          throw new Error(`previous prompt release registry is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
        }
        const checked = validatePromptEvaluationReleaseRegistry(previous);
        if (checked.errors.length) throw new Error("previous prompt release registry is invalid");
        writeBytesAtomic(root, current.registryPath, previousRegistryBytes, true, {
          beforePublish: (_temporaryPath, targetPath) => options.beforeRegistryPublish?.(targetPath),
          afterParentDirectoryFsync: options.afterRegistryParentDirectoryFsync,
        });
      } else {
        const rollbackTarget = secureReleaseFile(root, current.registryPath, "prompt release registry rollback target");
        fs.unlinkSync(rollbackTarget);
        fsyncDirectory(path.dirname(rollbackTarget));
      }
    },
  };

  let callbackError: unknown;
  let result: T | undefined;
  try {
    result = callback(context);
  } catch (error) {
    callbackError = error;
  }
  let cleanupError: unknown;
  try {
    if (!lockIdentity) throw new Error("prompt release registry lock identity is missing");
    const current = fs.lstatSync(lockPath);
    if (current.isSymbolicLink() || !current.isFile()
      || current.dev !== lockIdentity.dev || current.ino !== lockIdentity.ino) {
      throw new Error("prompt release registry lock ownership changed while held");
    }
    fs.unlinkSync(lockPath);
  } catch (error) {
    cleanupError = error;
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
  if (callbackError && cleanupError) {
    throw new AggregateError(
      [callbackError, cleanupError],
      "prompt release registry callback and lock cleanup both failed",
    );
  }
  if (callbackError) throw callbackError;
  if (cleanupError) throw cleanupError;
  return result as T;
}

function verifyEvaluationReleaseRegistryArtifactsFromSnapshot(
  root: string,
  registry: PromptEvaluationReleaseRegistry,
  codeSha?: string,
  registrySnapshot?: ReleaseJsonFileSnapshot,
): {
  bundleSha256: string;
  files: readonly { path: string; sha256: string }[];
} {
  const checked = validatePromptEvaluationReleaseRegistry(registry);
  if (checked.errors.length) {
    throw new Error(`prompt release registry is invalid:\n${checked.errors.join("\n")}`);
  }
  registry = checked.registry;
  const state = releaseChainState();
  if (registrySnapshot) {
    const persistedChecked = validatePromptEvaluationReleaseRegistry(registrySnapshot.value);
    if (persistedChecked.errors.length || !canonicalEqual(persistedChecked.registry, registry)) {
      throw new Error("prompt release registry file differs from the verified registry document");
    }
    rememberReleaseFile(root, registrySnapshot, state);
  }
  for (const release of registry.releases) {
    if (codeSha && release.codeSha !== codeSha) throw new Error(`release ${release.variantId} belongs to another code SHA`);
    const claimedPath = assertReleasePath(
      root,
      path.resolve(root, release.evidenceArtifactId),
      "promotion artifact",
    );
    const promotionSnapshot = releaseJsonFile(root, claimedPath, "promotion artifact");
    const artifact = validateEvaluationPromotionArtifact(promotionSnapshot.value);
    assertArtifactLocation(root, promotionSnapshot.resolved, "promotions", artifact.artifactSha256, "promotion artifact");
    if (release.evidenceArtifactId !== `promotions/${artifact.artifactSha256}.json`) {
      throw new Error(`release ${release.variantId} has a non-canonical promotion artifact ID`);
    }
    rememberReleaseFile(root, promotionSnapshot, state);
    const receipt = loadGateReceiptBySha(root, artifact.gateReceiptSha256, state);
    const previous = verifyGateReceiptChain(root, receipt, state);
    if (
      artifact.artifactSha256 !== release.evidenceArtifactSha256
      || artifact.gateReceiptSha256 !== release.gateReceiptSha256
      || artifact.releaseVector !== release.releaseVector
      || artifact.codeSha !== release.codeSha
      || artifact.evaluationStage !== receipt.stage
      || artifact.authorizationUnitKey !== receipt.authorizationUnitKey
      || artifact.campaignId !== receipt.campaignId
      || artifact.campaignClosureSha256 !== receipt.campaignClosureSha256
      || !canonicalEqual(artifact.unit, receipt.unit)
      || !canonicalEqual(artifact.currentVersions, receipt.currentVersions)
      || !canonicalEqual(artifact.cases, receipt.cases)
      || !canonicalEqual(artifact.gateResult, receipt.gateResult)
      || !canonicalEqual(artifact.previousReceiptSha256s, receipt.previousReceiptSha256s)
      || !canonicalEqual(previous.map((item) => item.artifactSha256), receipt.previousReceiptSha256s)
    ) {
      throw new Error(`release ${release.variantId} does not match its promotion artifact`);
    }
    const variant = getGarmentPromptVariantById(artifact.variantId);
    if (!variant) throw new Error(`release ${release.variantId} variant is not in the reviewed catalog`);
    const expectedRelease = createPromptEvaluationReleaseSnapshot(
      variant,
      artifact.unit.referenceRoleProfile,
      artifact.supportStatus,
      `promotions/${artifact.artifactSha256}.json`,
      {
        evaluationStage: artifact.evaluationStage,
        evidenceArtifactSha256: artifact.artifactSha256,
        gateReceiptSha256: artifact.gateReceiptSha256,
        evaluationUnitKey: artifact.authorizationUnitKey,
        codeSha: artifact.codeSha,
      },
    );
    if (!canonicalEqual(release, expectedRelease)) {
      throw new Error(`release ${release.variantId} differs from the complete promotion snapshot`);
    }
  }
  const files = [...state.files.entries()]
    .map(([filePath, sha256]) => ({ path: filePath, sha256 }))
    .sort((left, right) => left.path.localeCompare(right.path));
  return evaluationReleaseBundleSha256(files);
}

export function verifyEvaluationReleaseRegistryArtifacts(
  configuredRoot: string,
  registry: PromptEvaluationReleaseRegistry,
  codeSha?: string,
  registryFile?: string,
): {
  bundleSha256: string;
  files: readonly { path: string; sha256: string }[];
} {
  const root = resolveEvaluationReleaseRoot(configuredRoot, {}, false);
  let registrySnapshot: ReleaseJsonFileSnapshot | undefined;
  if (registryFile) {
    const expectedRegistry = assertReleasePath(
      root,
      path.join(root, EVALUATION_RELEASE_REGISTRY_RELATIVE_PATH),
      "prompt release registry",
    );
    const configuredRegistry = path.resolve(configuredRoot, EVALUATION_RELEASE_REGISTRY_RELATIVE_PATH);
    const suppliedRegistry = path.resolve(registryFile);
    if (suppliedRegistry !== expectedRegistry && suppliedRegistry !== configuredRegistry) {
      throw new Error("prompt release registry has a non-canonical path");
    }
    registrySnapshot = releaseJsonFile(root, expectedRegistry, "prompt release registry");
  }
  return verifyEvaluationReleaseRegistryArtifactsFromSnapshot(root, registry, codeSha, registrySnapshot);
}

async function commandPromote(command: ParsedEvaluationReviewCommand): Promise<Record<string, unknown>> {
  const { adminId, auditReason } = requiredAdminAudit(command);
  const codeSha = required(command, "code-sha");
  const gateReceiptPath = required(command, "gate-receipt");
  assertEvaluationCampaignReady();
  const root = releaseRoot(command);
  exactCleanCodeIdentity(codeSha);
  const gateChain = verifyGateReceiptFile(root, gateReceiptPath);
  const gateReceipt = gateChain.receipt;
  if (gateReceipt.codeSha !== codeSha) throw new Error("gate receipt code SHA differs from --code-sha");
  const receipts = previousReceipts(command, root);
  if (!canonicalEqual(
    receipts.map((receipt) => receipt.artifactSha256),
    gateReceipt.previousReceiptSha256s,
  )) {
    throw new Error("--previous-receipt artifacts differ from the gate receipt recursive chain");
  }
  const { database, actor } = await databaseAndAdmin(adminId);
  try {
    const bundles = await loadBundles(database, actor, gateReceipt.cases);
    const reEvaluated = evaluateEvidenceBundlesForStage({
      variantId: gateReceipt.variantId,
      referenceRoleProfile: gateReceipt.unit.referenceRoleProfile,
      stage: gateReceipt.stage,
      bundles,
      previousReceipts: receipts,
      codeSha,
      contractVerified: true,
    });
    const verifiedImages = await verifyEvaluationBundleImageArtifacts(bundles);
    const { artifact, release } = createEvaluationPromotionArtifact({
      gateReceipt,
      reEvaluated,
      previousReceipts: receipts,
      approvedBy: actor.id,
      approvalReason: auditReason,
      approvedAt: new Date().toISOString(),
      localArtifactSetSha256: verifiedImages.artifactSetSha256,
    });
    return withEvaluationReleaseRegistryLock(root, (locked) => {
      const artifactPath = safeArtifactPath(root, "promotions", artifact.artifactSha256);
      if (fs.existsSync(artifactPath)) throw new Error("promotion artifact already exists");
      const current = locked.read(true);
      if (current.existed) {
        verifyEvaluationReleaseRegistryArtifactsFromSnapshot(
          root,
          current.registry,
          undefined,
          registrySnapshotFromDocument(current),
        );
      }
      const releases = [...current.registry.releases];
      const key = JSON.stringify([release.variantId, release.referenceRoleProfile]);
      const index = releases.findIndex((candidate) => JSON.stringify([
        candidate.variantId,
        candidate.referenceRoleProfile,
      ]) === key);
      const rank = { experimental: 1, verified: 2, recommended: 3 } as const;
      if (index >= 0 && rank[releases[index].supportStatus] > rank[release.supportStatus]) {
        throw new Error("promotion cannot downgrade an existing release");
      }
      if (index >= 0) releases.splice(index, 1, release);
      else releases.push(release);
      const nextRegistry: PromptEvaluationReleaseRegistry = {
        schemaVersion: 1,
        generatedAt: artifact.approvedAt,
        releases: releases.sort((left, right) => (
          left.variantId.localeCompare(right.variantId)
          || JSON.stringify(left.referenceRoleProfile).localeCompare(JSON.stringify(right.referenceRoleProfile))
        )),
      };
      const checked = validatePromptEvaluationReleaseRegistry(nextRegistry);
      if (checked.errors.length) throw new Error(`generated registry is invalid:\n${checked.errors.join("\n")}`);
      const previousRegistryBytes = current.registryBytes;
      let committedRegistrySha256: string | undefined;
      const artifactBytes = Buffer.from(`${JSON.stringify(artifact, null, 2)}\n`, "utf8");
      const artifactFileSha256 = createHash("sha256").update(artifactBytes).digest("hex");
      let artifactWritten = false;
      try {
        writeBytesAtomic(root, artifactPath, artifactBytes, false);
        artifactWritten = true;
        committedRegistrySha256 = locked.compareAndSwap(
          current.registryFileSha256,
          checked.registry,
        );
        const committedRegistry = locked.read(false);
        if (committedRegistry.registryFileSha256 !== committedRegistrySha256) {
          throw new Error("committed prompt release registry differs from its stable write snapshot");
        }
        const verifiedBundle = verifyEvaluationReleaseRegistryArtifactsFromSnapshot(
          root,
          checked.registry,
          codeSha,
          registrySnapshotFromDocument(committedRegistry),
        );
        return {
          promoted: true,
          supportStatus: release.supportStatus,
          artifactPath,
          registryPath: current.registryPath,
          registryFileSha256: committedRegistrySha256,
          artifactSha256: artifact.artifactSha256,
          localArtifactSetSha256: artifact.localArtifactSetSha256,
          bundleSha256: verifiedBundle.bundleSha256,
          bundleFiles: verifiedBundle.files,
        };
      } catch (error) {
        let rollbackError: unknown;
        if (committedRegistrySha256) {
          try {
            locked.restore(committedRegistrySha256, previousRegistryBytes);
          } catch (caught) {
            rollbackError = caught;
          }
        }
        if (!rollbackError && artifactWritten && fs.existsSync(artifactPath)) {
          const failedArtifact = stableReleaseFileSnapshot(root, artifactPath, "failed promotion artifact");
          if (failedArtifact.sha256 !== artifactFileSha256) {
            throw new AggregateError(
              [error, new Error("failed promotion artifact changed before cleanup")],
              "promotion failed and cleanup was refused",
            );
          }
          fs.unlinkSync(failedArtifact.resolved);
          fsyncDirectory(path.dirname(failedArtifact.resolved));
        }
        if (rollbackError) {
          throw new AggregateError(
            [error, rollbackError],
            "promotion failed and registry rollback was refused",
          );
        }
        throw error;
      }
    });
  } finally {
    await database.closeDatabaseForTests();
  }
}

function commandRegistryCheck(command: ParsedEvaluationReviewCommand): Record<string, unknown> {
  const root = releaseRoot(command, false);
  return withEvaluationReleaseRegistryLock(root, (locked) => {
    const document = locked.read(false);
    const { registry, registryPath, registryFileSha256 } = document;
    const codeSha = optional(command, "code-sha");
    if (registry.releases.length > 0) {
      if (!codeSha) throw new Error("non-empty release registry requires --code-sha");
      exactCleanCodeIdentity(codeSha);
    }
    const verified = verifyEvaluationReleaseRegistryArtifactsFromSnapshot(
      root,
      registry,
      codeSha,
      registrySnapshotFromDocument(document),
    );
    return {
      valid: true,
      releases: registry.releases.length,
      generatedAt: registry.generatedAt,
      registryPath,
      registryFileSha256,
      bundleSha256: verified.bundleSha256,
      bundleFiles: verified.files,
    };
  });
}

interface EvaluationReviewCommandTestHooks {
  /** Deterministic race injection for isolated tests; production callers omit it. */
  readonly beforeExternalModelListOpen?: (modelListPath: string) => void;
}

export async function runEvaluationReviewCommand(
  command: ParsedEvaluationReviewCommand,
  testHooks: EvaluationReviewCommandTestHooks = {},
): Promise<Record<string, unknown>> {
  switch (command.command) {
    case "export": return commandExport(command);
    case "reconcile": return commandReconcile(command);
    case "score": return commandScore(command);
    case "contract-check": return commandContractCheck(command, testHooks);
    case "gate": return commandGate(command);
    case "promote": return commandPromote(command);
    case "registry-check": return commandRegistryCheck(command);
  }
}

async function main(): Promise<void> {
  const result = await runEvaluationReviewCommand(parseEvaluationReviewCliArgs(process.argv.slice(2)));
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
