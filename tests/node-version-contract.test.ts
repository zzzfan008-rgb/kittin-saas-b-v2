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
  ">=24.20.0",
  "package engines 必须声明 Node.js 24.20.0+",
);

for (const documentationPath of ["AGENTS.md", "README.md", "deploy/macos/README-MACMINI.md"]) {
  assert.match(
    read(documentationPath),
    /Node\.js 24\.20\.0 (?:or newer|或更高版本)/,
    `${documentationPath} 必须与 package engines 的 Node.js 下限一致`,
  );
}
assert.match(
  read("README.md"),
  /Node\.js 24\.20\.0 是 `\.nvmrc` 固定的最低\s+可复现基线；门禁接受 24\.20\.0 及更高兼容版本/,
  "README 必须明确 .nvmrc 是最低可复现基线，而不是 Node.js 上限",
);

const installer = read("deploy/macos/install.command");
assert.match(
  installer,
  /MACOS_MAJOR < 13 \|\| \(MACOS_MAJOR == 13 && MACOS_MINOR < 5\)/,
  "macOS 安装器必须拒绝低于 13.5 的系统",
);
assert.match(installer, /macOS 13\.5\+ is required/);
assert.match(installer, /Node\.js 24\.20\.0\+ is required/);
assert.match(
  installer,
  /major > 24 \|\| \(major === 24 && minor >= 20\)/,
  "macOS 安装器必须拒绝 Node.js 24.20 以下版本",
);

assert.equal(read(".nvmrc").trim(), "24.20.0", ".nvmrc 必须固定最低受支持版本");

// GitHub Actions CI 是项目门禁载体（AGENTS.md §6）。下面的断言把「workflow 必须存在
// 且关键面正确」固化成契约,防止意外回退到「没有 CI」或「CI 配置漂移」状态。
// 与 docs/ci/2026-09-18-github-actions-gate.md 同义,但不复制 YAML 条文。
const ciWorkflowPath = new URL("../.github/workflows/ci.yml", import.meta.url);
assert.ok(
  fs.existsSync(ciWorkflowPath),
  ".github/workflows/ci.yml 必须存在：GitHub Actions 是项目门禁载体",
);
const ciWorkflow = read(".github/workflows/ci.yml");
assert.match(
  ciWorkflow,
  /^on:\s*\n\s+push:/m,
  "CI 必须在 push 事件触发",
);
assert.match(
  ciWorkflow,
  /^  pull_request:\s*\n\s+branches:\s*\[main\]/m,
  "CI 必须在目标是 main 的 pull_request 事件触发",
);
for (const job of ["static", "unit", "e2e", "production-smoke", "code-intelligence"]) {
  assert.match(
    ciWorkflow,
    new RegExp(`^  ${job}:\\s*$`, "m"),
    `CI 必须包含 ${job} job`,
  );
}
// 凡是要起 PostgreSQL 的 job,库名必须以 _test 结尾（scripts/test-with-postgres.mjs 硬校验）
// 且镜像必须是 postgres:18（AGENTS.md §1「PostgreSQL 18 is the production source of truth」）。
assert.match(
  ciWorkflow,
  /image:\s*postgres:18/,
  "CI 的 PostgreSQL service 必须使用 postgres:18",
);
assert.match(
  ciWorkflow,
  /POSTGRES_DB:\s*garment_canvas_test/,
  "CI 的 PostgreSQL service 库名必须以 _test 结尾",
);
// Node 版本必须从 .nvmrc 读取（node-version-file）,不允许在 YAML 里复制版本号。
assert.match(
  ciWorkflow,
  /node-version-file:\s*\.nvmrc/,
  "CI 必须用 node-version-file 从 .nvmrc 读取 Node 版本",
);
assert.doesNotMatch(
  ciWorkflow,
  /node-version:\s*["']?\d/,
  "CI 不得用 node-version 字面量固定 Node 版本（应以 .nvmrc 为唯一事实来源）",
);

const codexGate = read("scripts/codex-gate.mjs");
assert.match(
  codexGate,
  /const REQUIRED_NODE_VERSION = "24\.20\.0";/,
  "交付门禁必须声明 Node.js 24.20.0 最低运行基线",
);
assert.match(
  codexGate,
  /function nodeVersionAtLeast\(version, minimumVersion = REQUIRED_NODE_VERSION\)/,
  "交付门禁必须支持高于 Node.js 24.20.0 的运行时",
);
assert.match(
  codexGate,
  /!nodeVersionAtLeast\(process\.versions\.node\)/,
  "交付门禁必须按最低版本比较而不是精确匹配",
);
assert.match(codexGate, /run\("npm", \["run", "check"\]\)/);
assert.match(codexGate, /run\("npm", \["run", "test:e2e"\]\)/);
const reviewerStart = codexGate.indexOf("function reviewerArgs(");
const reviewerEnd = codexGate.indexOf("function validateReviewResult(");
assert.ok(
  reviewerStart >= 0 && reviewerEnd > reviewerStart,
  "本地门禁必须用 reviewerArgs 构造评审子进程参数",
);
const reviewerArgsBody = codexGate.slice(reviewerStart, reviewerEnd);
assert.match(
  codexGate,
  /const HERMES_BINARY = "hermes";/,
  "本地门禁必须由 Hermes 子代理做结构化评审",
);
assert.match(
  codexGate,
  /const REVIEWER_TOOLSET = "file";/,
  "评审子进程必须使用最小只读 toolset",
);
for (const flag of [
  '"chat"',
  '"--query-file"',
  '"--oneshot"',
  '"-Q"',
  '"--ignore-rules"',
  '"-t"',
  '"--in"',
  '"--max-turns"',
  '"--run-budget"',
  '"--source"',
  '"tool"',
  "budgetSeconds",
]) {
  assert.ok(reviewerArgsBody.includes(flag), `评审子进程参数必须包含 ${flag}`);
}
for (const forbidden of [
  '"-m"',
  '"--model"',
  '"--provider"',
  '"--yolo"',
  '"--ignore-user-config"',
  '"--safe-mode"',
]) {
  assert.ok(!reviewerArgsBody.includes(forbidden), `评审子进程参数不得包含 ${forbidden}`);
}
const dockerfile = read("Dockerfile");
const nodeImages = [...dockerfile.matchAll(/^FROM node:([^\s]+).*$/gm)].map((match) => match[1]);
assert.ok(nodeImages.length > 0, "Dockerfile 必须声明 Node.js 基础镜像");
assert.ok(
  nodeImages.every((image) => image === "24.20.0-bookworm-slim"),
  `Dockerfile 中所有 Node.js 基础镜像必须固定为 24.20.0-bookworm-slim，实际为：${nodeImages.join(", ")}`,
);
assert.match(
  dockerfile,
  /^ARG GARMENT_CANVAS_BUILD_CODE_SHA=""$/m,
  "构建阶段必须显式接收付费评估代码 SHA",
);
assert.match(
  dockerfile,
  /node scripts\/write-build-identity\.mjs \/app\/\.garment-canvas-build-identity\.json "\$GARMENT_CANVAS_BUILD_CODE_SHA"/,
  "构建阶段必须把独立代码身份写入固定镜像文件",
);
assert.match(
  dockerfile,
  /RUN --mount=type=secret,id=evaluation_release_registry,required=false/,
  "Docker 构建必须把可选外置 registry 作为只读 BuildKit secret，而不是复制进 build context",
);
assert.match(
  dockerfile,
  /GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_PATH=\/run\/secrets\/evaluation_release_registry/,
  "Vite 与服务端构建只能从 BuildKit secret 的显式绝对路径读取非空 registry",
);
assert.match(
  dockerfile,
  /COPY --from=build \/app\/\.garment-canvas-build-identity\.json \.\/\.garment-canvas-build-identity\.json/,
  "运行镜像必须复制不可由运行时环境变量生成的构建身份文件",
);
assert.doesNotMatch(
  dockerfile,
  /^(?:ARG|ENV)[^\n]*GARMENT_CANVAS_CODE_SHA/m,
  "运行镜像不得把 GARMENT_CANVAS_CODE_SHA 烘焙成可冒充构建身份的环境变量",
);
assert.doesNotMatch(
  dockerfile,
  /\bgit\s+rev-parse\b|\bapt-get\s+install[^\n]*\bgit\b|^COPY\s+\.git(?:\s|$)/m,
  "Docker 运行时不得依赖 Git 或复制 .git 来推断付费评估代码 SHA",
);
const runtimeStage = dockerfile.slice(
  dockerfile.indexOf("FROM node:24.20.0-bookworm-slim AS runtime"),
);
assert.match(
  runtimeStage,
  /chown -R root:root \/app\s+\\\n\s+&& chmod -R a-w \/app/,
  "运行镜像必须把代码、bundle、依赖与构建身份固定为 root-owned 且对 node 不可写",
);
assert.match(
  runtimeStage,
  /chown node:node \/app\/data\s+\\\n\s+&& chmod 0750 \/app\/data/,
  "运行镜像只能把持久数据目录交给 node 用户写入",
);
assert.doesNotMatch(
  runtimeStage,
  /(?:chown|COPY[^\n]*--chown=)(?:[^\n]*\s)?node(?::node)?\s+\/app(?:\s|\\|$)/,
  "运行镜像不得让 node 用户拥有整个 /app",
);
assert.ok(
  runtimeStage.indexOf("chmod 0750 /app/data") < runtimeStage.indexOf("USER node"),
  "切换到 node 用户前必须先完成只读代码树与可写数据目录权限收敛",
);
const compose = read("compose.yaml");
assert.match(
  compose,
  /args:\s*\n\s+GARMENT_CANVAS_BUILD_CODE_SHA: \$\{GARMENT_CANVAS_BUILD_CODE_SHA:-\}/,
  "Compose 构建必须把独立构建 SHA 显式传入镜像身份生成步骤",
);
assert.match(
  compose,
  /GARMENT_CANVAS_EVALUATION_RELEASE_BUNDLE_SHA256: \$\{GARMENT_CANVAS_EVALUATION_RELEASE_BUNDLE_SHA256:-\}/,
  "Compose 构建必须显式传入外置发布包 SHA",
);
assert.match(
  compose,
  /GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SHA256: \$\{GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SHA256:-\}/,
  "Compose 构建必须显式传入 registry 原始文件 SHA",
);
const evaluationCompose = read("compose.evaluation-release.yaml");
assert.match(evaluationCompose, /source: evaluation_release_registry\s+target: evaluation_release_registry/);
assert.match(
  evaluationCompose,
  /source: \$\{GARMENT_CANVAS_EVALUATION_RELEASE_HOST_DIR:\?[^}]+\}\s+target: \/run\/garment-canvas\/evaluation-release\s+read_only: true/,
  "外置评估发布包运行时只能通过显式宿主机绝对目录只读挂载",
);
assert.match(
  evaluationCompose,
  /file: \$\{GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_SOURCE:\?[^}]+\}/,
  "评估 Compose override 必须要求显式外置 registry 文件",
);
assert.match(
  evaluationCompose,
  /GARMENT_CANVAS_EVALUATION_RELEASE_REGISTRY_PATH: \/run\/garment-canvas\/evaluation-release\/prompt-release-registry\.json/,
  "容器只能从只读发布包的固定 registry 路径加载受审发布",
);
assert.match(
  read(".dockerignore"),
  /^\.garment-canvas-build-identity\.json$/m,
  "Docker build context 不得注入仓库侧伪造的构建身份文件",
);
assert.match(
  read(".dockerignore"),
  /^data\/evaluation-release\/$/m,
  "外置发布包不得进入普通 Docker build context",
);

console.log("  ✓ Node.js、Docker 构建身份与仅 /app/data 可写契约通过");
