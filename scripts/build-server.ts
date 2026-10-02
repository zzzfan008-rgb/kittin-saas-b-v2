import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(projectRoot, "dist-server");

await build({
  entryPoints: [path.join(projectRoot, "server/index.ts")],
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  packages: "external",
  outfile: path.join(outputDirectory, "index.js"),
});

fs.mkdirSync(outputDirectory, { recursive: true });
console.log(`[build-server] Server bundle → ${outputDirectory}`);
