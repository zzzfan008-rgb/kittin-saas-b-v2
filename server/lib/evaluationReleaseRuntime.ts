import fs from "node:fs";
import path from "node:path";
import {
  PROMPT_EVALUATION_RELEASE_REGISTRY,
  PROMPT_EVALUATION_RELEASE_REGISTRY_ERRORS,
  type PromptEvaluationReleaseRegistry,
} from "../../src/lib/promptEvaluationReleaseRegistry";
import {
  EVALUATION_RELEASE_BUILD_MANIFEST_FILENAME,
  evaluationReleaseBuildManifestsEqual,
  loadEvaluationReleaseBuildInput,
  validateEvaluationReleaseBuildManifest,
  type EvaluationReleaseBuildManifest,
} from "./evaluationReleaseBuild";
import { resolveEvaluationCodeIdentity } from "./evaluationCodeIdentity";
import {
  readRegularFileWithoutSymlinkAncestors,
  verifyEvaluationReleaseBundle,
  type EvaluationReleaseModelCatalogBaseline,
} from "./evaluationReleaseBundle";
import {
  IMAGE_MODEL_IDS,
  REVIEWED_MODEL_CATALOG_BASELINE,
} from "../../src/types/imageModels";

export interface EvaluationReleaseRuntimeState {
  manifest: EvaluationReleaseBuildManifest;
  registry: PromptEvaluationReleaseRegistry;
}

export interface EvaluationReleaseRuntimeInput {
  projectRoot: string;
  isProduction: boolean;
  apiOnly: boolean;
  env?: Readonly<Record<string, string | undefined>>;
  /** Isolated test injection; production startup always uses the bundled registry. */
  embeddedRegistry?: PromptEvaluationReleaseRegistry;
  /** Isolated test injection; production startup uses the compiled reviewed baseline. */
  modelCatalogBaseline?: EvaluationReleaseModelCatalogBaseline;
  /** Isolated test injection; production startup reads /proc/self/mountinfo. */
  linuxMountInfoTextForTest?: string;
  /** Isolated test injection; production startup uses the fixed tree bound. */
  releaseTreeEntryLimitForTest?: number;
}

const EVALUATION_RELEASE_ROOT_MARKER_FILENAME =
  ".garment-canvas-evaluation-release-root";
const EVALUATION_RELEASE_ROOT_MARKER_CONTENT =
  "garment-canvas-evaluation-release-root-v1\n";
const EVALUATION_RELEASE_REGISTRY_LOCK_FILENAME =
  ".prompt-release-registry.lock";
const MAX_EVALUATION_RELEASE_TREE_ENTRIES = 20_000;

export interface LinuxMountInfoEntry {
  mountPoint: string;
  mountOptions: ReadonlySet<string>;
}

function configuredReleaseMaterial(
  env: Readonly<Record<string, string | undefined>>,
): boolean {
  return [
    "GARMENT_CANVAS_EVALUATION_RELEASE_DIR",
    "GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_PATH",
    "GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SHA256",
    "GARMENT_CANVAS_EVALUATION_RELEASE_BUNDLE_SHA256",
  ].some((name) => Boolean(env[name]?.trim()));
}

function readBuildManifest(filePath: string): EvaluationReleaseBuildManifest {
  try {
    const bytes = readRegularFileWithoutSymlinkAncestors(
      path.resolve(filePath),
      "evaluation release build manifest",
    );
    return validateEvaluationReleaseBuildManifest(JSON.parse(bytes.toString("utf8")));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`evaluation release build manifest is invalid (${filePath}): ${detail}`);
  }
}

function currentModelCatalogBaseline(): EvaluationReleaseModelCatalogBaseline {
  const reviewedExportSha256 = REVIEWED_MODEL_CATALOG_BASELINE.reviewedExportSha256;
  if (!reviewedExportSha256) {
    throw new Error(
      "reviewed evaluation releases are blocked until a human-reviewed /v1/models baseline exists",
    );
  }
  const reviewedRawExportSha256 = REVIEWED_MODEL_CATALOG_BASELINE.reviewedRawExportSha256;
  if (!reviewedRawExportSha256) {
    throw new Error(
      "reviewed evaluation releases are blocked until a human-reviewed raw /v1/models file SHA-256 exists",
    );
  }
  return {
    reviewedExportHashScope: REVIEWED_MODEL_CATALOG_BASELINE.reviewedExportHashScope,
    reviewedExportSha256,
    reviewedRawExportSha256,
    expectedGatewayModelIds: IMAGE_MODEL_IDS,
  };
}

function decodeLinuxMountInfoPath(value: string): string {
  return value.replace(/\\(040|011|012|134)/g, (_match, octal: string) => (
    String.fromCharCode(Number.parseInt(octal, 8))
  ));
}

/**
 * Parse the mount point and per-mount VFS options from Linux mountinfo. The
 * first options field (before the `-` separator) is intentional: a read-only
 * bind mount can still report `rw` in the superblock options after `-`.
 */
export function parseLinuxMountInfo(text: string): readonly LinuxMountInfoEntry[] {
  if (!text.trim()) throw new Error("Linux mountinfo is empty");
  return text.trimEnd().split("\n").map((line, index) => {
    const fields = line.split(" ");
    const separator = fields.indexOf("-");
    if (separator < 6 || fields.length < separator + 4) {
      throw new Error(`Linux mountinfo line ${index + 1} is invalid`);
    }
    const mountPoint = decodeLinuxMountInfoPath(fields[4]);
    if (!path.posix.isAbsolute(mountPoint)) {
      throw new Error(`Linux mountinfo line ${index + 1} has a non-absolute mount point`);
    }
    const mountOptions = new Set(fields[5].split(",").filter(Boolean));
    if (mountOptions.size === 0) {
      throw new Error(`Linux mountinfo line ${index + 1} has no mount options`);
    }
    return { mountPoint: path.posix.normalize(mountPoint), mountOptions };
  });
}

function isPathAtOrBelow(root: string, candidate: string): boolean {
  const relative = path.posix.relative(root, candidate);
  return relative === ""
    || (!relative.startsWith("../") && relative !== ".." && !path.posix.isAbsolute(relative));
}

function assertPathHasReadOnlyLinuxMount(
  candidate: string,
  mounts: readonly LinuxMountInfoEntry[],
): void {
  const normalized = path.posix.normalize(candidate);
  const matches = mounts.filter((mount) => isPathAtOrBelow(mount.mountPoint, normalized));
  if (matches.length === 0) {
    throw new Error(`no Linux mountinfo entry covers evaluation release path: ${candidate}`);
  }
  const longestLength = Math.max(...matches.map((mount) => mount.mountPoint.length));
  const effectiveCandidates = matches.filter((mount) => mount.mountPoint.length === longestLength);
  if (effectiveCandidates.some((mount) => (
    !mount.mountOptions.has("ro") || mount.mountOptions.has("rw")
  ))) {
    throw new Error(
      `evaluation release path must be on a Linux read-only mount: ${candidate}`,
    );
  }
}

function linuxMountInfo(textForTest: string | undefined): readonly LinuxMountInfoEntry[] {
  if (textForTest !== undefined) return parseLinuxMountInfo(textForTest);
  if (process.platform !== "linux") {
    throw new Error(
      "non-empty evaluation releases require Linux /proc/self/mountinfo read-only mount proof",
    );
  }
  let text: string;
  try {
    text = fs.readFileSync("/proc/self/mountinfo", "utf8");
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`cannot read Linux mountinfo for evaluation release: ${detail}`);
  }
  return parseLinuxMountInfo(text);
}

function assertDedicatedReleaseTreeMountedReadOnly(
  releaseRoot: string,
  mounts: readonly LinuxMountInfoEntry[],
  entryLimit = MAX_EVALUATION_RELEASE_TREE_ENTRIES,
): void {
  if (!Number.isSafeInteger(entryLimit) || entryLimit < 1) {
    throw new Error("evaluation release tree entry limit is invalid");
  }
  const root = path.resolve(releaseRoot);
  if (fs.realpathSync(root) !== root) {
    throw new Error("evaluation release root must not traverse a symlink");
  }
  const rootStat = fs.lstatSync(root);
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) {
    throw new Error("evaluation release root must be a non-symlink directory");
  }
  assertPathHasReadOnlyLinuxMount(root, mounts);

  const markerPath = path.join(root, EVALUATION_RELEASE_ROOT_MARKER_FILENAME);
  const markerBytes = readRegularFileWithoutSymlinkAncestors(
    markerPath,
    "evaluation release root marker",
  );
  if (markerBytes.toString("utf8") !== EVALUATION_RELEASE_ROOT_MARKER_CONTENT) {
    throw new Error("evaluation release root marker content is invalid");
  }

  const rootIdentity = `${rootStat.dev}:${rootStat.ino}`;
  const visitedDirectories = new Set<string>([rootIdentity]);
  const pendingDirectories = [root];
  let visitedEntries = 0;
  while (pendingDirectories.length > 0) {
    const directory = pendingDirectories.pop()!;
    const handle = fs.opendirSync(directory);
    try {
      for (let entry = handle.readSync(); entry; entry = handle.readSync()) {
        visitedEntries += 1;
        if (visitedEntries > entryLimit) {
          throw new Error(
            `evaluation release tree exceeds the maximum of ${entryLimit} entries`,
          );
        }
        const candidate = path.join(directory, entry.name);
        if (
          directory === root
          && entry.name === EVALUATION_RELEASE_REGISTRY_LOCK_FILENAME
        ) {
          throw new Error(
            "evaluation release registry update lock is present at runtime",
          );
        }
        const stat = fs.lstatSync(candidate);
        if (stat.isSymbolicLink()) {
          throw new Error(`evaluation release tree must not contain symlinks: ${candidate}`);
        }
        assertPathHasReadOnlyLinuxMount(candidate, mounts);
        if (stat.isDirectory()) {
          const identity = `${stat.dev}:${stat.ino}`;
          if (visitedDirectories.has(identity)) {
            throw new Error(
              `evaluation release tree contains a directory cycle or bind alias: ${candidate}`,
            );
          }
          visitedDirectories.add(identity);
          pendingDirectories.push(candidate);
        } else if (!stat.isFile()) {
          throw new Error(`evaluation release tree contains an unsupported entry: ${candidate}`);
        }
      }
    } finally {
      handle.closeSync();
    }
  }
}

function assertExternalReleaseBundleReadOnly(
  releaseRoot: string,
  files: readonly { path: string }[],
  mounts: readonly LinuxMountInfoEntry[],
): void {
  const root = path.resolve(releaseRoot);

  const reachablePaths = new Set<string>([
    root,
    path.join(root, EVALUATION_RELEASE_ROOT_MARKER_FILENAME),
  ]);
  for (const file of files) {
    const filename = path.resolve(root, file.path);
    const relative = path.relative(root, filename);
    if (
      !relative
      || relative === ".."
      || relative.startsWith(`..${path.sep}`)
      || path.isAbsolute(relative)
    ) {
      throw new Error("reachable evaluation release file escapes its read-only root");
    }
    reachablePaths.add(filename);

    for (let directory = path.dirname(filename);;) {
      reachablePaths.add(directory);
      if (directory === root) break;
      const parent = path.dirname(directory);
      if (parent === directory || !directory.startsWith(`${root}${path.sep}`)) {
        throw new Error("reachable evaluation release directory escapes its read-only root");
      }
      directory = parent;
    }
  }

  for (const candidate of reachablePaths) {
    assertPathHasReadOnlyLinuxMount(candidate, mounts);
  }
}

function assertEmbeddedRegistryMatchesRuntime(
  runtime: EvaluationReleaseRuntimeState,
  env: Readonly<Record<string, string | undefined>>,
  projectRoot: string,
  embeddedRegistry: PromptEvaluationReleaseRegistry,
): void {
  if (
    embeddedRegistry === PROMPT_EVALUATION_RELEASE_REGISTRY
    && PROMPT_EVALUATION_RELEASE_REGISTRY_ERRORS.length > 0
  ) {
    throw new Error(
      `embedded evaluation release registry is invalid:\n${PROMPT_EVALUATION_RELEASE_REGISTRY_ERRORS.join("\n")}`,
    );
  }
  const embedded = loadEvaluationReleaseBuildInput(
    runtime.manifest.releaseMode === "external"
      ? {
          GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_PATH:
            env.GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_PATH,
          GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SHA256:
            runtime.manifest.registryFileSha256,
          GARMENT_CANVAS_EVALUATION_RELEASE_BUNDLE_SHA256:
            runtime.manifest.bundleSha256 ?? undefined,
          GARMENT_CANVAS_BUILD_CODE_SHA: runtime.manifest.codeSha ?? undefined,
        }
      : {},
    projectRoot,
  );
  // The reloaded external bytes are already compared to the build manifest.
  // This final structural comparison proves the Node bundle was compiled with
  // the same release projection that the runtime-mounted registry contains.
  if (JSON.stringify(embeddedRegistry)
    !== JSON.stringify(embedded.registry)) {
    throw new Error("embedded server release registry differs from the runtime-mounted registry");
  }
}

/**
 * Production startup gate for reviewed releases. The browser and server build
 * manifests must be byte-equivalent at the semantic level, and a non-empty
 * release must still be backed by the same read-only external registry at
 * runtime. This gate is independent of ENABLE_PAID_EVALUATION_RUNS because
 * ordinary users consume verified/recommended releases.
 */
export function assertEvaluationReleaseRuntimeConfig(
  input: EvaluationReleaseRuntimeInput,
): EvaluationReleaseRuntimeState {
  const env = input.env ?? process.env;
  const embeddedRegistry = input.embeddedRegistry ?? PROMPT_EVALUATION_RELEASE_REGISTRY;
  if (!input.isProduction) {
    if (configuredReleaseMaterial(env)) {
      throw new Error("external evaluation releases require a production build");
    }
    if (embeddedRegistry.releases.length > 0) {
      throw new Error("development runtime must not contain reviewed evaluation releases");
    }
    return {
      manifest: loadEvaluationReleaseBuildInput({}, input.projectRoot).manifest,
      registry: embeddedRegistry,
    };
  }

  let runtimeInput = loadEvaluationReleaseBuildInput({
    ...env,
    GARMENT_CANVAS_BUILD_CODE_SHA: env.GARMENT_CANVAS_CODE_SHA,
  }, input.projectRoot);
  let externalMounts: readonly LinuxMountInfoEntry[] | undefined;
  if (runtimeInput.registry.releases.length > 0) {
    const releaseRoot = env.GARMENT_CANVAS_EVALUATION_RELEASE_DIR?.trim();
    if (!releaseRoot) {
      throw new Error(
        "non-empty evaluation releases require GARMENT_CANVAS_EVALUATION_RELEASE_DIR",
      );
    }
    externalMounts = linuxMountInfo(input.linuxMountInfoTextForTest);
    assertDedicatedReleaseTreeMountedReadOnly(
      releaseRoot,
      externalMounts,
      input.releaseTreeEntryLimitForTest,
    );

    // The first read only discovers whether a release exists. Re-read all
    // external bytes after mount admission so later verification never trusts
    // content observed before the tree was proven immutable.
    const securedRuntimeInput = loadEvaluationReleaseBuildInput({
      ...env,
      GARMENT_CANVAS_BUILD_CODE_SHA: env.GARMENT_CANVAS_CODE_SHA,
    }, input.projectRoot);
    if (
      !evaluationReleaseBuildManifestsEqual(runtimeInput.manifest, securedRuntimeInput.manifest)
      || JSON.stringify(runtimeInput.registry) !== JSON.stringify(securedRuntimeInput.registry)
    ) {
      throw new Error("evaluation release changed while establishing read-only mount proof");
    }
    runtimeInput = securedRuntimeInput;
  }
  if (runtimeInput.registry.releases.length > 0) {
    const identity = resolveEvaluationCodeIdentity(
      input.projectRoot,
      env as NodeJS.ProcessEnv,
    );
    if (identity.dirty) {
      throw new Error("reviewed evaluation releases require a clean exact-SHA Git worktree");
    }
    if (identity.codeSha !== runtimeInput.manifest.codeSha) {
      throw new Error("runtime code identity differs from the reviewed evaluation release");
    }
  }

  const serverManifest = readBuildManifest(path.join(
    input.projectRoot,
    "dist-server",
    EVALUATION_RELEASE_BUILD_MANIFEST_FILENAME,
  ));
  if (!evaluationReleaseBuildManifestsEqual(serverManifest, runtimeInput.manifest)) {
    throw new Error("server build and runtime evaluation release manifests differ");
  }

  if (!input.apiOnly) {
    const browserManifest = readBuildManifest(path.join(
      input.projectRoot,
      "dist",
      EVALUATION_RELEASE_BUILD_MANIFEST_FILENAME,
    ));
    if (!evaluationReleaseBuildManifestsEqual(browserManifest, serverManifest)) {
      throw new Error("browser and server evaluation release manifests differ");
    }
  }

  const state = { manifest: serverManifest, registry: runtimeInput.registry };
  assertEmbeddedRegistryMatchesRuntime(
    state,
    env,
    input.projectRoot,
    embeddedRegistry,
  );
  if (state.registry.releases.length > 0) {
    const releaseRoot = env.GARMENT_CANVAS_EVALUATION_RELEASE_DIR?.trim();
    const registryPath = env.GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_PATH?.trim();
    if (!releaseRoot || !registryPath) {
      throw new Error(
        "non-empty evaluation releases require GARMENT_CANVAS_EVALUATION_RELEASE_DIR and its canonical registry path",
      );
    }
    const verified = verifyEvaluationReleaseBundle({
      releaseRoot,
      registryPath,
      registry: state.registry,
      codeSha: state.manifest.codeSha!,
      modelCatalogBaseline: input.modelCatalogBaseline ?? currentModelCatalogBaseline(),
    });
    assertExternalReleaseBundleReadOnly(
      releaseRoot,
      verified.files,
      externalMounts!,
    );
    const configuredBundleSha256 = env.GARMENT_CANVAS_EVALUATION_RELEASE_BUNDLE_SHA256?.trim();
    if (
      !configuredBundleSha256
      || verified.bundleSha256 !== configuredBundleSha256
      || verified.bundleSha256 !== state.manifest.bundleSha256
    ) {
      throw new Error(
        "runtime evaluation release reachable-file bundle SHA-256 differs from the configured/build manifest",
      );
    }
  }
  return state;
}
