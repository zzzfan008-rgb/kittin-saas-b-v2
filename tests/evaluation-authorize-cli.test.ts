import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseEvaluationAuthorizationCliArgs } from "../scripts/evaluation-authorize";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const now = Date.now();
const expiresAt = now + 60 * 60 * 1_000;
const evaluationUnitKey = `sha256:${"a".repeat(64)}`;

function validArgs(): string[] {
  return [
    "--dry-run",
    "--authorization-id", "eval_cli_exact_unit",
    "--admin-id", "admin-1",
    "--owner-id", "admin-2",
    "--campaign-id", "eval_cli_campaign",
    "--slot-id", "eval_cli_slot",
    "--model-id", "gpt-image-2-vip",
    "--evaluation-unit-key", evaluationUnitKey,
    "--max-provider-requests", "2",
    "--price-minor-per-provider-request", "75",
    "--max-budget-minor", "150",
    "--currency", "cny",
    "--expires-at", String(expiresAt),
    "--reason", "reviewed two-request connectivity probe",
  ];
}

console.log("评估授权 CLI 回归测试");

const parsed = parseEvaluationAuthorizationCliArgs(validArgs(), now);
assert.equal(parsed.dryRun, true);
assert.equal(parsed.actorId, "admin-1");
assert.deepEqual(parsed.registration, {
  authorizationId: "eval_cli_exact_unit",
  ownerId: "admin-2",
  campaignId: "eval_cli_campaign",
  slotId: "eval_cli_slot",
  scope: {
    type: "evaluation-unit",
    modelId: "gpt-image-2-vip",
    evaluationUnitKey,
  },
  maxProviderRequests: 2,
  priceMinorPerProviderRequest: 75,
  budgetLimitMinor: 150,
  budgetCurrency: "CNY",
  expiresAt,
  reason: "reviewed two-request connectivity probe",
});
console.log("  ✓ CLI 仅生成 exact evaluation-unit 授权并保留单次最坏价格");

assert.throws(
  () => parseEvaluationAuthorizationCliArgs(
    validArgs().flatMap((value) => value === "150" ? ["149"] : [value]),
    now,
  ),
  /exceeds|budget|\u8d85过授权预算上限/i,
);
console.log("  ✓ 最坏请求总额超过预算时在连接数据库前失败");

assert.throws(
  () => parseEvaluationAuthorizationCliArgs(
    validArgs().concat(["--prompt-variant-id", "legacy-wide-scope"]),
    now,
  ),
  /unexpected flag: --prompt-variant-id/,
);
console.log("  ✓ 旧 prompt-variant 宽范围不能代替精确评估单元");

const tsxCli = path.resolve(projectRoot, "node_modules/tsx/dist/cli.mjs");
const script = path.resolve(projectRoot, "scripts/evaluation-authorize.ts");
const child = spawnSync(process.execPath, [tsxCli, script, ...validArgs()], {
  cwd: projectRoot,
  encoding: "utf8",
  env: { ...process.env },
});
assert.equal(child.status, 0, child.stderr || child.stdout);
assert.equal(child.stderr, "");
const output = JSON.parse(child.stdout) as Record<string, unknown>;
assert.equal(output.dryRun, true);
assert.equal(output.priceMinorPerProviderRequest, 75);
assert.deepEqual(output.scope, {
  type: "evaluation-unit",
  modelId: "gpt-image-2-vip",
  evaluationUnitKey,
});
assert.equal(output.campaignId, "eval_cli_campaign");
assert.equal(output.slotId, "eval_cli_slot");
console.log("  ✓ 中文项目路径下脚本 entrypoint 真正执行且 dry-run 不加载 Provider");

const missingCampaign = spawnSync(process.execPath, [
  tsxCli,
  script,
  ...validArgs().filter((value) => value !== "--campaign-id" && value !== "eval_cli_campaign"),
], {
  cwd: projectRoot,
  encoding: "utf8",
  env: { ...process.env },
});
assert.notEqual(missingCampaign.status, 0);
assert.match(missingCampaign.stderr, /--campaign-id is required/);
assert.doesNotMatch(missingCampaign.stderr, /DATABASE_URL|connect ECONNREFUSED/);
console.log("  ✓ 缺少 Campaign 标识在数据库访问前被拒绝");

console.log("评估授权 CLI 测试通过");
