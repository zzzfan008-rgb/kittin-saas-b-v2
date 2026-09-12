import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const planSkill = readFileSync(
  resolve(repoRoot, ".agents/skills/speckit-plan/SKILL.md"),
  "utf8",
);
const implementSkill = readFileSync(
  resolve(repoRoot, ".agents/skills/speckit-implement/SKILL.md"),
  "utf8",
);
const tasksToIssuesSkill = readFileSync(
  resolve(repoRoot, ".agents/skills/speckit-taskstoissues/SKILL.md"),
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

const prerequisites = JSON.parse(execFileSync(
  "bash",
  [
    resolve(repoRoot, ".specify/scripts/bash/check-prerequisites.sh"),
    "--json",
    "--require-spec",
    "--require-tasks",
    "--include-tasks",
  ],
  { cwd: repoRoot, encoding: "utf8" },
));
assert.equal(prerequisites.TASKS, resolve(repoRoot, "specs/002-whole-project-audit/tasks.md"));
assert.ok(prerequisites.AVAILABLE_DOCS.includes("tasks.md"));
assert.match(prerequisiteScript, /printf '\{"FEATURE_DIR":"%s","TASKS":"%s","AVAILABLE_DOCS":%s/);
assert.doesNotMatch(bundledWorkflow, /^  scope:/m);
assert.doesNotMatch(bundledWorkflow, /backend-only|frontend-only/);

const codexManifest = JSON.parse(readFileSync(
  resolve(repoRoot, ".specify/integrations/codex.manifest.json"),
  "utf8",
));
assert.equal(
  codexManifest.files[".agents/skills/speckit-plan/SKILL.md"],
  createHash("sha256").update(planSkill).digest("hex"),
  "Spec Kit integration manifest must match the persisted speckit-plan skill bytes",
);
assert.equal(
  codexManifest.files[".agents/skills/speckit-implement/SKILL.md"],
  createHash("sha256").update(implementSkill).digest("hex"),
  "Spec Kit integration manifest must match the persisted speckit-implement skill bytes",
);
assert.equal(
  codexManifest.files[".agents/skills/speckit-taskstoissues/SKILL.md"],
  createHash("sha256").update(tasksToIssuesSkill).digest("hex"),
  "Spec Kit integration manifest must match the persisted speckit-taskstoissues skill bytes",
);

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
