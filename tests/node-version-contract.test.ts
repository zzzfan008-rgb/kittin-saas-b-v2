import assert from "node:assert/strict";
import fs from "node:fs";

function read(relativePath: string): string {
  return fs.readFileSync(new URL(`../${relativePath}`, import.meta.url), "utf8");
}

console.log("Node.js 运行时版本契约测试");

const packageJson = JSON.parse(read("package.json")) as {
  engines?: { node?: string };
};
assert.equal(
  packageJson.engines?.node,
  ">=22.20.0",
  "package engines 必须声明 Node.js 22.20.0+",
);

for (const documentationPath of ["AGENTS.md", "README.md", "deploy/macos/README-MACMINI.md"]) {
  assert.match(
    read(documentationPath),
    /Node\.js 22\.20\.0 (?:or newer|或更高版本)/,
    `${documentationPath} 必须与 package engines 的 Node.js 下限一致`,
  );
}

const installer = read("deploy/macos/install.command");
assert.match(installer, /Node\.js 22\.20\.0\+ is required/);
assert.match(
  installer,
  /major > 22 \|\| \(major === 22 && minor >= 20\)/,
  "macOS 安装器必须拒绝 Node.js 22.20 以下版本",
);

assert.equal(read(".nvmrc").trim(), "22.20.0", ".nvmrc 必须固定最低受支持版本");
assert.match(read(".github/workflows/ci.yml"), /node-version:\s*22\.20\.0/);
const dockerfile = read("Dockerfile");
const nodeImages = [...dockerfile.matchAll(/^FROM node:([^\s]+).*$/gm)].map((match) => match[1]);
assert.ok(nodeImages.length > 0, "Dockerfile 必须声明 Node.js 基础镜像");
assert.ok(
  nodeImages.every((image) => image.startsWith("22-")),
  `Dockerfile 中所有 Node.js 基础镜像必须使用 22.x，实际为：${nodeImages.join(", ")}`,
);

console.log("  ✓ package、文档、安装器与 CI 统一为 Node.js 22.20+，Docker 保持 22.x 安全更新");
