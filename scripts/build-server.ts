import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { loadEnv } from "vite";
import {
  EVALUATION_RELEASE_BUILD_MANIFEST_FILENAME,
  evaluationReleaseBuildManifestJson,
  loadEvaluationReleaseBuildInput,
} from "../server/lib/evaluationReleaseBuild";
import { assertEvaluationCampaignReady } from "../server/lib/evaluationCampaign";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mode = process.env.NODE_ENV === "production" ? "production" : "development";
const env = {
  ...loadEnv(mode, projectRoot, ""),
  ...process.env,
};
const evaluationRelease = loadEvaluationReleaseBuildInput(env, projectRoot);
if (evaluationRelease.registry.releases.length > 0) assertEvaluationCampaignReady();
const outputDirectory = path.join(projectRoot, "dist-server");

await build({
  entryPoints: [path.join(projectRoot, "server/index.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  packages: "external",
  outfile: path.join(outputDirectory, "index.js"),
  define: {
    __GARMENT_CANVAS_PROMPT_EVALUATION_RELEASE_REGISTRY__: JSON.stringify(
      evaluationRelease.registry,
    ),
  },
});

fs.mkdirSync(outputDirectory, { recursive: true });
const manifestPath = path.join(outputDirectory, EVALUATION_RELEASE_BUILD_MANIFEST_FILENAME);
const manifestTempPath = `${manifestPath}.tmp-${process.pid}`;
fs.writeFileSync(
  manifestTempPath,
  evaluationReleaseBuildManifestJson(evaluationRelease.manifest),
  { encoding: "utf8", mode: 0o444, flag: "wx" },
);
fs.renameSync(manifestTempPath, manifestPath);
