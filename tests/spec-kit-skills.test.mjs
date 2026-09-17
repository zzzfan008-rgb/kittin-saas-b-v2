import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const prerequisiteScript = readFileSync(
  resolve(repoRoot, ".specify/scripts/bash/check-prerequisites.sh"),
  "utf8",
);
const bundledWorkflow = readFileSync(
  resolve(repoRoot, ".specify/workflows/speckit/workflow.yml"),
  "utf8",
);

// Spec Kit 的 Codex 集成已整体移除：Codex 不再参与本项目。以下断言是"移除后不得
// 悄悄回退"的守卫 —— 若该集成被重新装回，测试会失败，而不是让旧配置静默复活。
// 被移除的是 Codex 侧的技能副本（`.agents/skills/`）与安装清单；prerequisite 脚本、
// 捆绑工作流与 speckit 清单哈希仍然受约束，见本文件后半部分。
assert.equal(
  existsSync(resolve(repoRoot, ".agents/skills")),
  false,
  "Codex 侧的 Spec Kit 技能目录 .agents/skills 不得存在",
);
assert.equal(
  existsSync(resolve(repoRoot, ".specify/integrations/codex.manifest.json")),
  false,
  "Codex 集成清单 .specify/integrations/codex.manifest.json 不得存在",
);

const integrationState = JSON.parse(
  readFileSync(resolve(repoRoot, ".specify/integration.json"), "utf8"),
);
assert.deepEqual(
  integrationState.installed_integrations,
  [],
  "Spec Kit 不得声明已安装任何 agent 集成",
);
assert.deepEqual(
  integrationState.integration_settings,
  {},
  "Spec Kit 不得保留已移除集成的设置",
);
assert.equal(
  integrationState.integration ?? null,
  null,
  "Spec Kit 不得声明当前集成",
);
assert.equal(
  integrationState.default_integration ?? null,
  null,
  "Spec Kit 不得声明默认集成",
);

const currentFeatureDirectory = "specs/002-whole-project-audit";
const prerequisites = JSON.parse(execFileSync(
  "bash",
  [
    resolve(repoRoot, ".specify/scripts/bash/check-prerequisites.sh"),
    "--json",
    "--require-spec",
    "--require-tasks",
    "--include-tasks",
  ],
  {
    cwd: repoRoot,
    encoding: "utf8",
    // Pin the feature explicitly: .specify/feature.json is local, gitignored state,
    // so relying on it would make this contract test fail on any fresh checkout.
    env: { ...process.env, SPECIFY_FEATURE_DIRECTORY: currentFeatureDirectory },
  },
));
assert.equal(prerequisites.TASKS, resolve(repoRoot, "specs/002-whole-project-audit/tasks.md"));
assert.ok(prerequisites.AVAILABLE_DOCS.includes("tasks.md"));
assert.match(prerequisiteScript, /printf '\{"FEATURE_DIR":"%s","TASKS":"%s","AVAILABLE_DOCS":%s/);
assert.doesNotMatch(bundledWorkflow, /^  scope:/m);
assert.doesNotMatch(bundledWorkflow, /backend-only|frontend-only/);

const speckitManifest = JSON.parse(readFileSync(
  resolve(repoRoot, ".specify/integrations/speckit.manifest.json"),
  "utf8",
));
assert.equal(
  speckitManifest.files[".specify/scripts/bash/check-prerequisites.sh"],
  createHash("sha256").update(prerequisiteScript).digest("hex"),
  "Spec Kit integration manifest must match the persisted prerequisite script bytes",
);

console.log("Spec Kit skill contract tests passed");
