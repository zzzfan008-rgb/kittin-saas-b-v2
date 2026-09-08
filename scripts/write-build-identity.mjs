import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CODE_SHA_PATTERN = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/;

export function writeBuildIdentity(outputPath, codeSha) {
  if (codeSha && !CODE_SHA_PATTERN.test(codeSha)) {
    throw new Error("build code SHA must be exactly 40 or 64 lowercase hexadecimal characters");
  }
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify({ schemaVersion: 1, codeSha: codeSha || null })}\n`,
    { encoding: "utf8", mode: 0o444 },
  );
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  const outputPath = process.argv[2];
  if (!outputPath) throw new Error("usage: node scripts/write-build-identity.mjs <output-path> [code-sha]");
  writeBuildIdentity(path.resolve(outputPath), process.argv[3] ?? "");
}
