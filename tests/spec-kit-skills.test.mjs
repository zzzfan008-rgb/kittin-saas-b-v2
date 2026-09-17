import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const planSkill = readFileSync(
  resolve(repoRoot, ".claude/skills/speckit-plan/SKILL.md"),
  "utf8",
);
const implementSkill = readFileSync(
  resolve(repoRoot, ".claude/skills/speckit-implement/SKILL.md"),
  "utf8",
);
const tasksToIssuesSkill = readFileSync(
  resolve(repoRoot, ".claude/skills/speckit-taskstoissues/SKILL.md"),
  "utf8",
);
const prerequisiteScript = readFileSync(
  resolve(repoRoot, ".specify/scripts/bash/check-prerequisites.sh"),
  "utf8",
);
const bundledWorkflow = readFileSync(
  resolve(repoRoot, ".specify/workflows/speckit/workflow.yml"),
  "utf8",
);

for (const requiredArtifact of [
  "IMPL_PLAN",
  "research.md",
  "data-model.md",
  "contracts/",
  "quickstart.md",
]) {
  assert.match(
    planSkill,
    new RegExp(`Write the completed[\\s\\S]*${requiredArtifact.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}`),
    `speckit-plan must require persisting ${requiredArtifact}`,
  );
}

assert.match(planSkill, /Re-read each required output after writing it/);
assert.match(planSkill, /do not report an artifact as generated when it exists only in the conversation/);
assert.match(implementSkill, /--require-spec --require-tasks/);
assert.match(implementSkill, /\*\*REQUIRED\*\*: Read spec\.md/);
assert.match(implementSkill, /Parse every `## Phase` section in file order/);
assert.match(implementSkill, /including[\s\S]*Convergence phase/);
assert.match(implementSkill, /do not skip an unrecognized phase name/);
assert.match(tasksToIssuesSkill, /`search_issues` tool/);
assert.match(tasksToIssuesSkill, /`repository_full_name`/);
assert.match(tasksToIssuesSkill, /`topn: 100`/);
assert.match(tasksToIssuesSkill, /is:issue in:title T001/);
assert.doesNotMatch(tasksToIssuesSkill, /server's `list_issues` tool/);
assert.doesNotMatch(tasksToIssuesSkill, /Request `perPage: 100`/);

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

// Codex 侧集成已整体移除：Codex 不再参与本项目，Spec Kit 现指向 Claude Code。
// 这些守卫同时固定当前集成、并确保 Codex 集成不会悄悄回来。
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

const integrationState = JSON.parse(readFileSync(
  resolve(repoRoot, ".specify/integration.json"),
  "utf8",
));
assert.deepEqual(
  integrationState.installed_integrations,
  ["claude"],
  "Spec Kit 当前只应安装 Claude Code 集成",
);
assert.deepEqual(
  integrationState.integration_settings,
  { claude: { script: "sh", invoke_separator: "-" } },
  "Claude Code 集成设置必须与 spec-kit 的 shell 集成形态一致",
);
assert.equal(
  integrationState.default_integration,
  "claude",
  "Spec Kit 默认集成必须是 Claude Code",
);
assert.equal(
  integrationState.integration,
  "claude",
  "Spec Kit 当前集成必须是 Claude Code，而不是任何 Codex 集成",
);

const claudeManifest = JSON.parse(readFileSync(
  resolve(repoRoot, ".specify/integrations/claude.manifest.json"),
  "utf8",
));
assert.equal(claudeManifest.integration, "claude", "集成清单必须声明 claude");

const claudeSkillNames = [
  "speckit-analyze",
  "speckit-checklist",
  "speckit-clarify",
  "speckit-constitution",
  "speckit-converge",
  "speckit-implement",
  "speckit-plan",
  "speckit-specify",
  "speckit-tasks",
  "speckit-taskstoissues",
];
assert.deepEqual(
  Object.keys(claudeManifest.files).sort(),
  claudeSkillNames.map((name) => `.claude/skills/${name}/SKILL.md`).sort(),
  "集成清单必须恰好列出全部 10 个 Spec Kit 技能",
);

for (const name of claudeSkillNames) {
  const relativePath = `.claude/skills/${name}/SKILL.md`;
  const body = readFileSync(resolve(repoRoot, relativePath), "utf8");
  assert.equal(
    claudeManifest.files[relativePath],
    createHash("sha256").update(body).digest("hex"),
    `Spec Kit integration manifest must match the persisted ${name} skill bytes`,
  );
  assert.ok(
    body.startsWith(`---\nname: "${name}"\n`),
    `${name} 必须保留 spec-kit 生成的 name frontmatter`,
  );
}

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
