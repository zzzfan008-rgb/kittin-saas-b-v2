import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  validatePromptEvaluationReleaseRegistry,
  type PromptEvaluationReleaseRegistry,
} from "../../src/lib/promptEvaluationReleaseRegistry";

export const EVALUATION_RELEASE_BUILD_MANIFEST_FILENAME =
  "evaluation-release-build-manifest.json";

export const EMPTY_PROMPT_EVALUATION_RELEASE_REGISTRY: PromptEvaluationReleaseRegistry =
  Object.freeze({
    schemaVersion: 1,
    generatedAt: null,
    releases: Object.freeze([]),
  });

export interface EvaluationReleaseBuildManifest {
  schemaVersion: 1;
  artifactType: "garment-canvas-evaluation-release-build";
  releaseMode: "empty" | "external";
  codeSha: string | null;
  bundleSha256: string | null;
  registryFileSha256: string;
  registryContentSha256: string;
  releaseCount: number;
}

export interface EvaluationReleaseBuildInput {
  manifest: EvaluationReleaseBuildManifest;
  registry: PromptEvaluationReleaseRegistry;
}

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const CODE_SHA_PATTERN = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/;
const REGISTRY_PATH_ENV = "GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_PATH";
const REGISTRY_SHA_ENV = "GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SHA256";
const BUNDLE_SHA_ENV = "GARMENT_CANVAS_EVALUATION_RELEASE_BUNDLE_SHA256";
const BUILD_CODE_SHA_ENV = "GARMENT_CANVAS_BUILD_CODE_SHA";

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right));
  return `{${entries.map(([key, nested]) => `${JSON.stringify(key)}:${canonicalJson(nested)}`).join(",")}}`;
}

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function trimmed(env: Readonly<Record<string, string | undefined>>, name: string): string {
  return env[name]?.trim() ?? "";
}

function assertSha256(value: string, name: string): void {
  if (!SHA256_PATTERN.test(value)) {
    throw new Error(`${name} must be a 64 character lowercase hexadecimal SHA-256`);
  }
}

function assertCodeSha(value: string, name: string): void {
  if (!CODE_SHA_PATTERN.test(value)) {
    throw new Error(`${name} must be exactly 40 or 64 lowercase hexadecimal characters`);
  }
}

function assertExplicitExternalRegularFile(filePath: string, projectRoot: string): string {
  if (!path.isAbsolute(filePath)) {
    throw new Error(`${REGISTRY_PATH_ENV} must be an absolute path`);
  }
  const resolved = path.resolve(filePath);
  let cursor = path.parse(resolved).root;
  for (const segment of resolved.slice(cursor.length).split(path.sep).filter(Boolean)) {
    cursor = path.join(cursor, segment);
    if (fs.lstatSync(cursor).isSymbolicLink()) {
      throw new Error(`${REGISTRY_PATH_ENV} must not traverse symlinks`);
    }
  }
  const fileStat = fs.lstatSync(resolved);
  if (!fileStat.isFile()) throw new Error(`${REGISTRY_PATH_ENV} must identify a regular file`);
  const realFile = fs.realpathSync(resolved);
  const root = fs.realpathSync(projectRoot);
  const relative = path.relative(root, realFile);
  if (relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative))) {
    throw new Error(`${REGISTRY_PATH_ENV} must point outside the tracked project tree`);
  }
  return realFile;
}

function validatedRegistry(value: unknown): PromptEvaluationReleaseRegistry {
  const checked = validatePromptEvaluationReleaseRegistry(value);
  if (checked.errors.length > 0) {
    throw new Error(`evaluation release registry is invalid:\n${checked.errors.join("\n")}`);
  }
  return checked.registry;
}

function emptyBuildInput(): EvaluationReleaseBuildInput {
  const registry = EMPTY_PROMPT_EVALUATION_RELEASE_REGISTRY;
  const canonical = canonicalJson(registry);
  const digest = sha256(canonical);
  return {
    registry,
    manifest: {
      schemaVersion: 1,
      artifactType: "garment-canvas-evaluation-release-build",
      releaseMode: "empty",
      codeSha: null,
      bundleSha256: null,
      registryFileSha256: digest,
      registryContentSha256: digest,
      releaseCount: 0,
    },
  };
}

/**
 * Resolve the only registry source accepted by browser and server builds.
 * No path means a deterministic empty registry. An explicitly configured file
 * must live outside the Git tree, must not traverse symlinks, and is pinned by
 * its raw-byte SHA. A non-empty registry additionally binds the full external
 * bundle Merkle root and the exact reviewed code SHA.
 */
export function loadEvaluationReleaseBuildInput(
  env: Readonly<Record<string, string | undefined>>,
  projectRoot: string,
): EvaluationReleaseBuildInput {
  const configuredPath = trimmed(env, REGISTRY_PATH_ENV);
  const expectedRegistrySha256 = trimmed(env, REGISTRY_SHA_ENV);
  const expectedBundleSha256 = trimmed(env, BUNDLE_SHA_ENV);
  const codeSha = trimmed(env, BUILD_CODE_SHA_ENV);

  if (!configuredPath) {
    if (expectedRegistrySha256 || expectedBundleSha256) {
      throw new Error(
        `${REGISTRY_PATH_ENV} is required when an evaluation release SHA is configured`,
      );
    }
    return emptyBuildInput();
  }

  assertSha256(expectedRegistrySha256, REGISTRY_SHA_ENV);
  const registryPath = assertExplicitExternalRegularFile(configuredPath, projectRoot);
  const rawBytes = fs.readFileSync(registryPath);
  const actualFileSha256 = sha256(rawBytes);
  if (actualFileSha256 !== expectedRegistrySha256) {
    throw new Error(`${REGISTRY_SHA_ENV} does not match the external registry bytes`);
  }

  let rawRegistry: unknown;
  try {
    rawRegistry = JSON.parse(rawBytes.toString("utf8"));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`evaluation release registry is not valid UTF-8 JSON: ${detail}`);
  }
  const registry = validatedRegistry(rawRegistry);
  const hasReleases = registry.releases.length > 0;

  if (hasReleases) {
    assertSha256(expectedBundleSha256, BUNDLE_SHA_ENV);
    assertCodeSha(codeSha, BUILD_CODE_SHA_ENV);
    for (const release of registry.releases) {
      if (release.codeSha !== codeSha) {
        throw new Error(
          `release ${release.variantId} codeSha does not match ${BUILD_CODE_SHA_ENV}`,
        );
      }
    }
  } else if (expectedBundleSha256 || codeSha) {
    throw new Error(
      "an empty external registry must not claim a bundle SHA or reviewed code SHA",
    );
  }

  const registryContentSha256 = sha256(canonicalJson(registry));
  const manifest: EvaluationReleaseBuildManifest = {
    schemaVersion: 1,
    artifactType: "garment-canvas-evaluation-release-build",
    releaseMode: "external",
    codeSha: hasReleases ? codeSha : null,
    bundleSha256: hasReleases ? expectedBundleSha256 : null,
    registryFileSha256: actualFileSha256,
    registryContentSha256,
    releaseCount: registry.releases.length,
  };
  return { manifest, registry };
}

export function validateEvaluationReleaseBuildManifest(
  value: unknown,
): EvaluationReleaseBuildManifest {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("evaluation release build manifest must be an object");
  }
  const record = value as Record<string, unknown>;
  const fields = new Set([
    "schemaVersion", "artifactType", "releaseMode", "codeSha", "bundleSha256",
    "registryFileSha256", "registryContentSha256", "releaseCount",
  ]);
  for (const field of Object.keys(record)) {
    if (!fields.has(field)) throw new Error(`evaluation release build manifest contains unknown field ${field}`);
  }
  if (record.schemaVersion !== 1) throw new Error("evaluation release build manifest schemaVersion must equal 1");
  if (record.artifactType !== "garment-canvas-evaluation-release-build") {
    throw new Error("evaluation release build manifest artifactType is invalid");
  }
  if (record.releaseMode !== "empty" && record.releaseMode !== "external") {
    throw new Error("evaluation release build manifest releaseMode is invalid");
  }
  if (typeof record.registryFileSha256 !== "string") {
    throw new Error("evaluation release build manifest registryFileSha256 is required");
  }
  if (typeof record.registryContentSha256 !== "string") {
    throw new Error("evaluation release build manifest registryContentSha256 is required");
  }
  assertSha256(record.registryFileSha256, "registryFileSha256");
  assertSha256(record.registryContentSha256, "registryContentSha256");
  if (!Number.isSafeInteger(record.releaseCount) || (record.releaseCount as number) < 0) {
    throw new Error("evaluation release build manifest releaseCount is invalid");
  }
  const hasReleases = (record.releaseCount as number) > 0;
  if (record.releaseMode === "empty") {
    const empty = emptyBuildInput().manifest;
    if (hasReleases || record.releaseCount !== 0 || record.codeSha !== null || record.bundleSha256 !== null) {
      throw new Error("empty evaluation release build manifest contains release material");
    }
    if (
      record.registryFileSha256 !== empty.registryFileSha256
      || record.registryContentSha256 !== empty.registryContentSha256
    ) {
      throw new Error("empty evaluation release build manifest is not canonical");
    }
  } else if (hasReleases) {
    if (typeof record.codeSha !== "string") throw new Error("external release build codeSha is required");
    if (typeof record.bundleSha256 !== "string") throw new Error("external release build bundleSha256 is required");
    assertCodeSha(record.codeSha, "codeSha");
    assertSha256(record.bundleSha256, "bundleSha256");
  } else if (record.codeSha !== null || record.bundleSha256 !== null) {
    throw new Error("empty external registry must not claim release identity");
  }
  return {
    schemaVersion: 1,
    artifactType: "garment-canvas-evaluation-release-build",
    releaseMode: record.releaseMode,
    codeSha: record.codeSha as string | null,
    bundleSha256: record.bundleSha256 as string | null,
    registryFileSha256: record.registryFileSha256,
    registryContentSha256: record.registryContentSha256,
    releaseCount: record.releaseCount as number,
  };
}

export function evaluationReleaseBuildManifestJson(
  manifest: EvaluationReleaseBuildManifest,
): string {
  return `${JSON.stringify(manifest)}\n`;
}

export function evaluationReleaseBuildManifestsEqual(
  left: EvaluationReleaseBuildManifest,
  right: EvaluationReleaseBuildManifest,
): boolean {
  return canonicalJson(left) === canonicalJson(right);
}
