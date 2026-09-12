import assert from "node:assert/strict";
import {
  chmodSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  realpathSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const source = new URL("../scripts/codex-gate.mjs", import.meta.url);
const apiyiChangeScopeSource = new URL("../docs/ai/apiyi/change-scope.json", import.meta.url);
const fixtureRoots = new Set();

function cleanupFixtures() {
  for (const root of fixtureRoots) rmSync(root, { recursive: true, force: true });
  fixtureRoots.clear();
}

process.once("exit", cleanupFixtures);

function command(cwd, executable, args, env = process.env) {
  return spawnSync(executable, args, { cwd, env, encoding: "utf8" });
}

function git(cwd, ...args) {
  const result = command(cwd, "git", args);
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function fixture({ requiredNodeVersion = process.versions.node } = {}) {
  const root = mkdtempSync(join(tmpdir(), "codex-gate-test-"));
  fixtureRoots.add(root);
  const bin = join(root, "bin");
  mkdirSync(join(root, "scripts"));
  mkdirSync(join(root, "docs", "ai", "apiyi"), { recursive: true });
  mkdirSync(bin);
  const gateSource = readFileSync(source, "utf8").replace(
    'const REQUIRED_NODE_VERSION = "24.20.0";',
    `const REQUIRED_NODE_VERSION = ${JSON.stringify(requiredNodeVersion)};`,
  );
  writeFileSync(join(root, "scripts/codex-gate.mjs"), gateSource);
  writeFileSync(
    join(root, "docs", "ai", "apiyi", "change-scope.json"),
    readFileSync(apiyiChangeScopeSource, "utf8"),
  );
  writeFileSync(
    join(root, "scripts/apiyi-kb.mjs"),
    `import { appendFileSync } from "node:fs";
if (process.env.GATE_APIYI_LOG) appendFileSync(process.env.GATE_APIYI_LOG, process.argv.slice(2).join(" ") + "\\n");
if (process.env.GATE_APIYI_EXIT) process.exit(Number(process.env.GATE_APIYI_EXIT));
`,
  );
  writeFileSync(
    join(root, ".gitignore"),
    ".gate-npm-log\n.gate-gitnexus-log\n.gate-codex-log\n.gate-apiyi-log\n",
  );
  writeFileSync(join(root, "tracked.txt"), "initial\n");
  writeFileSync(
    join(bin, "npm"),
    '#!/bin/sh\nif [ -n "$GATE_NPM_LOG" ]; then printf \'%s\\n\' "$*" >> "$GATE_NPM_LOG"; fi\nexit 0\n',
  );
  writeFileSync(
    join(bin, "codex"),
    `#!/bin/sh
out=""
if [ -n "$GATE_CODEX_LOG" ]; then
  for arg in "$@"; do printf '%s\\n' "$arg" >> "$GATE_CODEX_LOG"; done
fi
while [ "$#" -gt 0 ]; do
  if [ "$1" = "--output-last-message" ]; then out="$2"; shift 2; else shift; fi
done
if [ -n "$GATE_MUTATE_FILE" ]; then printf '%s\\n' mutation >> "$GATE_MUTATE_FILE"; fi
if [ -n "$GATE_CODEX_SLEEP_SECONDS" ]; then sleep "$GATE_CODEX_SLEEP_SECONDS"; fi
if [ -n "$GATE_SCOPE_COPY" ]; then cp "\${out%/*}/review-scope.json" "$GATE_SCOPE_COPY"; fi
if [ -n "$GATE_PACKET_COPY" ]; then cp "\${out%/*}/review-packet-1.json" "$GATE_PACKET_COPY"; fi
if [ -n "$GATE_CODEX_EXIT" ]; then exit "$GATE_CODEX_EXIT"; fi
review_json="$GATE_REVIEW_JSON"
if [ -z "$review_json" ]; then
  review_json='{"verdict":"pass","summary":"ok","findings":[],"gitnexus":{"status":"pass","evidence":"test"}}'
fi
printf '%s\\n' "$review_json" > "$out"
if [ -n "$GATE_BREAK_REPO" ]; then mv "$GATE_BREAK_REPO/.git" "$GATE_BREAK_REPO/.git-broken"; fi
`,
  );
  writeFileSync(
    join(bin, "gitnexus"),
    `#!/bin/sh
if [ -n "$GATE_GITNEXUS_LOG" ]; then printf '%s\\n' "$*" >> "$GATE_GITNEXUS_LOG"; fi
if [ -n "$GATE_GITNEXUS_EXIT" ]; then exit "$GATE_GITNEXUS_EXIT"; fi
if [ "$GITNEXUS_LANG" = "en" ]; then
  if [ "$1" = "status" ]; then
    printf '%s\\n' 'Indexed commit: test' 'Current commit: test' 'Status: ✅ up-to-date'
  elif [ -n "$GATE_GITNEXUS_LARGE" ]; then
    printf '%s\\n' 'Changes: 1 files, 1 symbols' 'Affected processes: 0' 'Risk level: low'
    printf '%s\\n' 'Changed symbols: DETAIL-marker-that-must-not-enter-review-prompt'
    printf '%*s\\n' 12000 '' | tr ' ' 'D'
  elif [ -n "$GATE_GITNEXUS_NO_CHANGES" ]; then
    printf '%s\\n' 'No changes detected.'
  else
    printf '%s\\n' 'Changes: 1 files, 1 symbols' 'Affected processes: 0' 'Risk level: low'
  fi
elif [ "$1" = "status" ]; then
  printf '%s\\n' '索引提交: test' '当前提交: test' '状态: ✅ 已是最新'
else
  printf '%s\\n' '变更：1 个文件，1 个符号' '受影响流程：0' '风险等级：low'
fi
`,
  );
  chmodSync(join(bin, "npm"), 0o755);
  chmodSync(join(bin, "codex"), 0o755);
  chmodSync(join(bin, "gitnexus"), 0o755);
  git(root, "init", "-q");
  git(root, "config", "user.email", "gate@example.test");
  git(root, "config", "user.name", "Gate Test");
  git(root, "add", ".");
  git(root, "commit", "-qm", "initial");
  const base = git(root, "rev-parse", "HEAD");
  const initialBranch = git(root, "branch", "--show-current");
  return { root, base, initialBranch, env: { ...process.env, PATH: `${bin}:${process.env.PATH}` } };
}

function gateTempDirs() {
  return readdirSync(tmpdir())
    .filter((name) => name.startsWith("garment-canvas-codex-gate-"))
    .sort();
}

{
  const f = fixture();
  git(f.root, "checkout", "-qb", "other", f.base);
  writeFileSync(join(f.root, "other.txt"), "other\n");
  git(f.root, "add", "other.txt");
  git(f.root, "commit", "-qm", "other branch");
  const divergentBase = git(f.root, "rev-parse", "HEAD");
  git(f.root, "checkout", "-q", f.initialBranch);
  writeFileSync(join(f.root, "tracked.txt"), "candidate\n");
  git(f.root, "add", "tracked.txt");
  git(f.root, "commit", "-qm", "candidate");
  const result = runGate(f, "--base", divergentBase);
  assert.notEqual(result.status, 0, "--base 必须拒绝不是 HEAD 祖先的分叉基线");
}

function runGate(f, ...args) {
  return command(f.root, process.execPath, ["scripts/codex-gate.mjs", ...args], f.env);
}

{
  const f = fixture({ requiredNodeVersion: "0.0.0-test" });
  const result = runGate(f, "--uncommitted");
  assert.notEqual(result.status, 0, "门禁必须拒绝低于 Node.js 24.20.0 的运行时");
  assert.match(result.stderr, /最低受支持的 Node\.js/);
}

{
  const gateSource = readFileSync(source, "utf8");
  assert.match(
    gateSource,
    /function nodeVersionAtLeast\(version, minimumVersion = REQUIRED_NODE_VERSION\)/,
    "Codex 门禁必须通过最低版本比较函数支持向上兼容",
  );
  assert.match(
    gateSource,
    /!nodeVersionAtLeast\(process\.versions\.node\)/,
    "Codex 门禁不得把最低版本当成精确版本匹配",
  );
  assert.match(
    gateSource,
    /\$\{REQUIRED_NODE_VERSION\} 或更高版本上运行/,
    "版本阻断信息必须明确说明允许更高版本",
  );
}

{
  const f = fixture();
  writeFileSync(join(f.root, "tracked.txt"), "bad trailing whitespace   \n");
  git(f.root, "add", "tracked.txt");
  git(f.root, "commit", "-qm", "bad commit");
  const result = runGate(f, "--base", f.base);
  assert.notEqual(result.status, 0, "--base 必须检查所选已提交差异的空白错误");
}

{
  const f = fixture();
  writeFileSync(join(f.root, "tracked.txt"), "bad staged whitespace   \n");
  git(f.root, "add", "tracked.txt");
  const result = runGate(f, "--uncommitted");
  assert.notEqual(result.status, 0, "--uncommitted 必须检查 staged 差异");
}

{
  const f = fixture();
  writeFileSync(join(f.root, "untracked.txt"), "bad untracked whitespace   \n");
  const result = runGate(f, "--uncommitted");
  assert.notEqual(result.status, 0, "--uncommitted 必须检查 untracked 文件");
}

{
  const f = fixture();
  mkdirSync(join(f.root, "docs", "ai", "apiyi", "site", "snapshots", "snapshot-1"), { recursive: true });
  writeFileSync(
    join(f.root, "docs", "ai", "apiyi", "site", "snapshots", "snapshot-1", "page.md"),
    "historical formatting   \n",
  );
  f.env.GATE_APIYI_LOG = join(f.root, ".gate-apiyi-log");
  const result = runGate(f, "--uncommitted");
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /Codex verdict: pass/);
  assert.match(result.stdout, /API易知识门禁：跳过/);
  assert.equal(existsSync(f.env.GATE_APIYI_LOG), false, "不可变历史快照不得重复触发 API易知识门禁");
}

{
  const f = fixture();
  writeFileSync(join(f.root, "tracked.txt"), "valid change\n");
  f.env.GATE_APIYI_LOG = join(f.root, ".gate-apiyi-log");
  const result = runGate(f, "--uncommitted");
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /Codex verdict: pass/);
  assert.match(result.stdout, /API易知识门禁：跳过/);
  assert.equal(existsSync(f.env.GATE_APIYI_LOG), false, "普通差异不得启动 API易知识库门禁");
}

{
  const f = fixture();
  mkdirSync(join(f.root, "src", "components", "nodes"), { recursive: true });
  writeFileSync(join(f.root, "package.json"), '{"private":true}\n');
  writeFileSync(join(f.root, "AGENTS.md"), "# Unrelated project rule\n");
  writeFileSync(join(f.root, "src", "components", "nodes", "UiOnly.tsx"), "export const UiOnly = () => null;\n");
  f.env.GATE_APIYI_LOG = join(f.root, ".gate-apiyi-log");
  const result = runGate(f, "--uncommitted", "--review-only");
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /API易知识门禁：跳过/);
  assert.equal(existsSync(f.env.GATE_APIYI_LOG), false, "普通依赖、项目规则和纯 UI 差异不得启动 API易知识库门禁");
}

{
  const f = fixture();
  writeFileSync(join(f.root, "docs", "ai", "apiyi", "change-scope.json"), '{"schemaVersion":2}\n');
  const result = runGate(f, "--uncommitted", "--review-only");
  assert.notEqual(result.status, 0, "无效 API易范围契约必须 fail-closed");
  assert.match(result.stderr, /change-scope\.json 无效/);
}

{
  const f = fixture();
  mkdirSync(join(f.root, "server", "providers"), { recursive: true });
  writeFileSync(join(f.root, "server", "providers", "apiyi.ts"), "export const providerChanged = true;\n");
  f.env.GATE_APIYI_LOG = join(f.root, ".gate-apiyi-log");
  const result = runGate(f, "--uncommitted", "--review-only");
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /API易知识门禁：执行（1 个相关路径）/);
  assert.match(result.stdout, /server\/providers\/apiyi\.ts/);
  assert.equal(readFileSync(f.env.GATE_APIYI_LOG, "utf8").trim(), "guard --uncommitted");
}

{
  const f = fixture();
  writeFileSync(join(f.root, "tracked.txt"), "large graph evidence change\n");
  f.env.GATE_GITNEXUS_LARGE = "1";
  f.env.GATE_CODEX_LOG = join(f.root, ".gate-codex-log");
  const result = runGate(f, "--uncommitted", "--review-only");
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const codexPrompt = readFileSync(f.env.GATE_CODEX_LOG, "utf8");
  assert.match(codexPrompt, /Changes: 1 files, 1 symbols/);
  assert.match(codexPrompt, /Affected processes: 0/);
  assert.match(codexPrompt, /Risk level: low/);
  assert.match(codexPrompt, /Do not rerun GitNexus inside the reviewer subprocess/);
  assert.match(codexPrompt, /Dated audit records, handoffs, completion ledgers, review notes, and screenshots are historical evidence/);
  assert.match(codexPrompt, /Do not report a P0-P3 finding solely because a historical record documents an earlier failure/);
  assert.match(codexPrompt, /current implementation, current verification evidence, or the current release closure improperly contradicts/);
  assert.doesNotMatch(codexPrompt, /You MUST also call GitNexus detect_changes/);
  assert.doesNotMatch(codexPrompt, /DETAIL-marker-that-must-not-enter-review-prompt/);
  assert.ok(codexPrompt.length < 5_000, "review prompt must not duplicate unbounded GitNexus detail");
}

{
  const f = fixture();
  mkdirSync(join(f.root, "docs", "audit", "2026-09-04"), { recursive: true });
  writeFileSync(
    join(f.root, "docs", "audit", "2026-09-04", "baseline.json"),
    JSON.stringify({
      status: "fail-closed",
      evidence: "The old Node 22 gate timed out and did not produce a durable pass receipt.",
    }) + "\n",
  );
  f.env.GATE_CODEX_LOG = join(f.root, ".gate-codex-log");
  const result = runGate(f, "--uncommitted", "--review-only");
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const codexPrompt = readFileSync(f.env.GATE_CODEX_LOG, "utf8");
  assert.match(codexPrompt, /historical evidence, not the current implementation or current release decision/);
  assert.match(codexPrompt, /older Node\.js baseline/);
  assert.match(codexPrompt, /still-applicable requirement/);
}

{
  const f = fixture();
  mkdirSync(join(f.root, "src"), { recursive: true });
  mkdirSync(join(f.root, "docs", "contract"), { recursive: true });
  mkdirSync(join(f.root, "docs", "ai", "apiyi", "site", "snapshots", "snapshot-1"), { recursive: true });
  mkdirSync(join(f.root, "docs", "ai", "apiyi", "consultations"), { recursive: true });
  writeFileSync(join(f.root, "src", "changed.ts"), "export const changed = true;\n");
  writeFileSync(join(f.root, "docs", "contract", "provider.md"), "# Provider contract\n");
  writeFileSync(join(f.root, "docs", "ai", "apiyi", "site", "snapshots", "snapshot-1", "page.md"), "historical evidence\n");
  writeFileSync(join(f.root, "docs", "ai", "apiyi", "consultations", "old.json"), '{"historical":true}\n');
  writeFileSync(join(f.root, "docs", "ai", "apiyi", "consultations", "older.json"), '{"historical":"older"}\n');
  const scopeCopy = join(tmpdir(), `codex-gate-scope-${Date.now()}-${Math.random().toString(16).slice(2)}.json`);
  const packetCopy = join(tmpdir(), `codex-gate-packet-${Date.now()}-${Math.random().toString(16).slice(2)}.json`);
  fixtureRoots.add(scopeCopy);
  fixtureRoots.add(packetCopy);
  f.env.GATE_SCOPE_COPY = scopeCopy;
  f.env.GATE_PACKET_COPY = packetCopy;
  f.env.GATE_CODEX_LOG = join(f.root, ".gate-codex-log");
  const result = runGate(f, "--uncommitted", "--review-only");
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const scope = JSON.parse(readFileSync(scopeCopy, "utf8"));
  assert.equal(scope.schemaVersion, 2);
  assert.deepEqual(
    scope.included.map((file) => file.path),
    ["docs/contract/provider.md", "src/changed.ts"],
    "代码和契约变更必须保留在 reviewer 的逐文件范围中",
  );
  assert.deepEqual(
    scope.omitted.map(({ prefix, fileCount, presentFileCount, deletedFileCount, totalBytes }) => ({
      prefix,
      fileCount,
      presentFileCount,
      deletedFileCount,
      totalBytes,
    })),
    [
      {
        prefix: "docs/ai/apiyi/site/snapshots/",
        fileCount: 1,
        presentFileCount: 1,
        deletedFileCount: 0,
        totalBytes: Buffer.byteLength("historical evidence\n"),
      },
      {
        prefix: "docs/ai/apiyi/consultations/",
        fileCount: 2,
        presentFileCount: 2,
        deletedFileCount: 0,
        totalBytes: Buffer.byteLength('{"historical":true}\n') + Buffer.byteLength('{"historical":"older"}\n'),
      },
    ],
    "历史 API易 快照和咨询记录只能进入按前缀聚合的摘要范围",
  );
  for (const group of scope.omitted) {
    assert.match(group.aggregateSha256, /^[a-f0-9]{64}$/);
  }
  assert.equal(scope.summary.includedFileCount, 2);
  assert.equal(scope.summary.omittedFileCount, 3);
  assert.equal(
    scope.summary.omittedBytes,
    Buffer.byteLength("historical evidence\n")
      + Buffer.byteLength('{"historical":true}\n')
      + Buffer.byteLength('{"historical":"older"}\n'),
  );
  const packet = JSON.parse(readFileSync(packetCopy, "utf8"));
  assert.deepEqual(packet.materials.map(({ path, kind }) => ({ path, kind })), [
    { path: "docs/contract/provider.md", kind: "full-text" },
    { path: "src/changed.ts", kind: "full-text" },
  ]);
  assert.match(packet.materials[0].content, /Provider contract/);
  assert.match(packet.materials[1].content, /changed = true/);
  const codexArgs = readFileSync(f.env.GATE_CODEX_LOG, "utf8");
  assert.match(codexArgs, /review-packet-1\.json/);
  assert.match(codexArgs, /Do not run git, repository-wide search/i);
  assert.match(codexArgs, /do not open it or recursively inspect omitted/i);
}

{
  const f = fixture();
  writeFileSync(join(f.root, "tracked.txt"), "review packet tracked change\n");
  const packetCopy = join(tmpdir(), `codex-gate-tracked-packet-${Date.now()}-${Math.random().toString(16).slice(2)}.json`);
  fixtureRoots.add(packetCopy);
  f.env.GATE_PACKET_COPY = packetCopy;
  const result = runGate(f, "--uncommitted", "--review-only");
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const packet = JSON.parse(readFileSync(packetCopy, "utf8"));
  assert.equal(packet.materials.length, 1);
  assert.equal(packet.materials[0].kind, "git-patch");
  assert.match(packet.materials[0].patch, /-initial/);
  assert.match(packet.materials[0].patch, /\+review packet tracked change/);
}

{
  const f = fixture();
  const receiptDir = mkdtempSync(join(tmpdir(), "codex-gate-receipts-"));
  fixtureRoots.add(receiptDir);
  writeFileSync(join(f.root, "tracked.txt"), "receipt change\n");
  const result = runGate(f, "--uncommitted", "--review-only", "--receipt-dir", receiptDir);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const receiptFiles = readdirSync(receiptDir).filter((name) => name.endsWith(".json"));
  assert.equal(receiptFiles.length, 1, "外置回执目录应生成一个结构化 JSON 回执");
  const receipt = JSON.parse(readFileSync(join(receiptDir, receiptFiles[0]), "utf8"));
  assert.equal(receipt.schemaVersion, 1);
  assert.equal(receipt.gateDecision, "pass");
  assert.equal(receipt.exitCode, 0);
  assert.equal(receipt.review.verdict, "pass");
  assert.equal(receipt.review.gitnexus.status, "pass");
  assert.match(receipt.reviewBatches[0].packetSha256, /^[a-f0-9]{64}$/);
  assert.match(result.stdout, /Codex review receipt:/);
}

{
  const f = fixture();
  writeFileSync(join(f.root, "tracked.txt"), "committed candidate\n");
  git(f.root, "add", "tracked.txt");
  git(f.root, "commit", "-qm", "candidate");
  const npmLog = join(f.root, ".gate-npm-log");
  const gitNexusLog = join(f.root, ".gate-gitnexus-log");
  const codexLog = join(f.root, ".gate-codex-log");
  const apiyiLog = join(f.root, ".gate-apiyi-log");
  f.env.GATE_NPM_LOG = npmLog;
  f.env.GATE_GITNEXUS_LOG = gitNexusLog;
  f.env.GATE_CODEX_LOG = codexLog;
  f.env.GATE_APIYI_LOG = apiyiLog;
  f.env.GITNEXUS_LANG = "zh-CN";
  const result = runGate(f, "--base", f.base);
  assert.equal(result.status, 0, `最终 clean-HEAD 门禁应通过：${result.stdout}\n${result.stderr}`);
  assert.deepEqual(
    readFileSync(npmLog, "utf8").trim().split("\n"),
    ["ci", "run check", "run test:e2e", "run build", "run test:e2e:production"],
    "完整门禁必须先执行 npm ci，再按固定顺序执行验证套件",
  );
  assert.equal(existsSync(apiyiLog), false, "普通最终差异不得启动 API易知识库门禁");
  assert.deepEqual(
    readFileSync(gitNexusLog, "utf8").trim().split("\n"),
    ["status", `detect-changes --scope compare --repo ${realpathSync(f.root)} --base-ref ${f.base}`],
    "完整门禁必须独立验证 GitNexus 索引并绑定所选 base..HEAD 范围",
  );
  const codexArgs = readFileSync(codexLog, "utf8").trim().split("\n");
  const approvalIndex = codexArgs.indexOf("--ask-for-approval");
  const sandboxIndex = codexArgs.indexOf("--sandbox");
  const schemaIndex = codexArgs.indexOf("--output-schema");
  assert.equal(codexArgs[approvalIndex + 1], "never", "Codex 审查必须禁用交互式授权");
  assert.ok(codexArgs.includes("--skip-git-repo-check"), "隔离审查目录必须显式跳过 Git 仓库前置检查");
  assert.equal(codexArgs[sandboxIndex + 1], "read-only", "Codex 审查必须使用只读沙箱");
  assert.ok(schemaIndex >= 0 && codexArgs[schemaIndex + 1], "Codex 审查必须提供输出 schema");
  assert.ok(!codexArgs.includes("--model"), "Codex 审查不得覆盖用户配置的默认模型");
}

{
  const f = fixture();
  mkdirSync(join(f.root, "server", "providers"), { recursive: true });
  writeFileSync(join(f.root, "server", "providers", "apiyi.ts"), "export const providerChanged = true;\n");
  git(f.root, "add", "server/providers/apiyi.ts");
  git(f.root, "commit", "-qm", "APIYI provider candidate");
  f.env.GATE_APIYI_LOG = join(f.root, ".gate-apiyi-log");
  const result = runGate(f, "--base", f.base, "--review-only");
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.equal(
    readFileSync(f.env.GATE_APIYI_LOG, "utf8").trim(),
    `guard --base ${f.base} --head ${git(f.root, "rev-parse", "HEAD")}`,
    "API易相关最终差异必须把知识库门禁绑定到精确 base..HEAD",
  );
}

{
  const f = fixture();
  writeFileSync(join(f.root, "tracked.txt"), "graph-neutral candidate\n");
  git(f.root, "add", "tracked.txt");
  git(f.root, "commit", "-qm", "graph-neutral candidate");
  f.env.GATE_GITNEXUS_NO_CHANGES = "1";
  const result = runGate(f, "--base", f.base, "--review-only");
  assert.equal(result.status, 0, `非空精确差异可以规范化无图增量证据：${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, /Changes: 1 files, GitNexus reported no graph deltas/);
  assert.match(result.stdout, /Affected processes: 0/);
  assert.match(result.stdout, /Risk level: low/);
}

{
  const f = fixture();
  writeFileSync(join(f.root, "tracked.txt"), "uncommitted graph-neutral candidate\n");
  f.env.GATE_GITNEXUS_NO_CHANGES = "1";
  const result = runGate(f, "--uncommitted", "--review-only");
  assert.notEqual(result.status, 0, "--uncommitted 不得借用精确差异的无图增量分支放行");
}

{
  const f = fixture();
  git(f.root, "commit", "--allow-empty", "-qm", "empty candidate");
  f.env.GATE_GITNEXUS_NO_CHANGES = "1";
  const result = runGate(f, "--base", f.base, "--review-only");
  assert.notEqual(result.status, 0, "GitNexus 无图增量时，空精确差异仍必须失败");
  assert.match(result.stderr, /选定的 Git 差异为空/);
}

{
  const f = fixture();
  writeFileSync(join(f.root, "inherited.txt"), "pre-existing whitespace   \n");
  git(f.root, "add", "inherited.txt");
  git(f.root, "commit", "-qm", "pre-existing parent");
  const parent = git(f.root, "rev-parse", "HEAD");
  writeFileSync(join(f.root, "tracked.txt"), "single commit candidate\n");
  git(f.root, "add", "tracked.txt");
  git(f.root, "commit", "-qm", "single commit candidate");
  const candidate = git(f.root, "rev-parse", "HEAD");

  const exactResult = runGate(f, "--commit", candidate);
  assert.equal(
    exactResult.status,
    0,
    `--commit 必须只审查所选 HEAD 的父提交差异：${exactResult.stdout}\n${exactResult.stderr}`,
  );

  const staleResult = runGate(f, "--commit", parent);
  assert.notEqual(staleResult.status, 0, "--commit 必须拒绝不等于当前 HEAD 的旧提交");
}

for (const review of [
  { verdict: "fail", summary: "failed", findings: [], gitnexus: { status: "pass", evidence: "test" } },
  {
    verdict: "pass",
    summary: "finding",
    findings: [
      { severity: "P2", title: "blocking", file: "x.js", line: 1, reason: "test" },
    ],
    gitnexus: { status: "pass", evidence: "test" },
  },
  {
    verdict: "pass",
    summary: "degraded",
    findings: [],
    gitnexus: { status: "degraded", evidence: "test" },
  },
]) {
  const f = fixture();
  f.env.GATE_REVIEW_JSON = JSON.stringify(review);
  const result = runGate(f, "--uncommitted", "--review-only");
  assert.notEqual(result.status, 0, `审查阻断矩阵必须失败：${JSON.stringify(review)}`);
}

{
  const f = fixture();
  writeFileSync(join(f.root, "tracked.txt"), "valid change\n");
  f.env.GATE_MUTATE_FILE = join(f.root, "tracked.txt");
  const result = runGate(f, "--uncommitted", "--review-only");
  assert.notEqual(result.status, 0, "Codex 审查期间发生工作树变化时必须作废结果");
}

{
  const f = fixture();
  f.env.GATE_GITNEXUS_EXIT = "9";
  const result = runGate(f, "--uncommitted", "--review-only");
  assert.notEqual(result.status, 0, "GitNexus CLI 检查失败时不得仅信任模型自报结果");
}

{
  const f = fixture();
  mkdirSync(join(f.root, "server", "providers"), { recursive: true });
  writeFileSync(join(f.root, "server", "providers", "apiyi.ts"), "export const providerChanged = true;\n");
  f.env.GATE_APIYI_EXIT = "8";
  const result = runGate(f, "--uncommitted", "--review-only");
  assert.notEqual(result.status, 0, "API易相关差异的本地知识库或咨询门禁失败时必须阻断 Codex 门禁");
}

{
  const f = fixture();
  writeFileSync(join(f.root, "tracked.txt"), "ordinary guard failure isolation\n");
  f.env.GATE_APIYI_EXIT = "8";
  f.env.GATE_APIYI_LOG = join(f.root, ".gate-apiyi-log");
  const result = runGate(f, "--uncommitted", "--review-only");
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  assert.equal(existsSync(f.env.GATE_APIYI_LOG), false, "普通差异不应被未执行的 API易 guard 故障阻断");
}

{
  const f = fixture();
  const before = gateTempDirs();
  f.env.GATE_CODEX_EXIT = "7";
  const result = runGate(f, "--uncommitted", "--review-only");
  assert.notEqual(result.status, 0, "Codex 进程失败必须阻断门禁");
  assert.deepEqual(gateTempDirs(), before, "Codex 进程失败后必须清理门禁临时目录");
}

{
  const f = fixture();
  const receiptDir = mkdtempSync(join(tmpdir(), "codex-gate-timeout-receipts-"));
  fixtureRoots.add(receiptDir);
  const before = gateTempDirs();
  f.env.GATE_CODEX_SLEEP_SECONDS = "2";
  f.env.GARMENT_CANVAS_CODEX_REVIEW_TIMEOUT_MS = "1000";
  const result = runGate(f, "--uncommitted", "--review-only", "--receipt-dir", receiptDir);
  assert.notEqual(result.status, 0, "Codex 复核超时必须 fail-closed");
  const receiptFiles = readdirSync(receiptDir).filter((name) => name.endsWith(".json"));
  assert.equal(receiptFiles.length, 1, "复核超时必须保留外置 fail-closed 回执");
  const receipt = JSON.parse(readFileSync(join(receiptDir, receiptFiles[0]), "utf8"));
  assert.equal(receipt.gateDecision, "fail-closed");
  assert.equal(receipt.exitCode, 1);
  assert.equal(receipt.review.verdict, "fail");
  assert.equal(receipt.review.gitnexus.status, "degraded");
  assert.match(receipt.review.summary, /did not produce a structured result/);
  assert.deepEqual(gateTempDirs(), before, "复核超时后的门禁临时目录应已清理");
}

{
  const f = fixture();
  const receiptDir = mkdtempSync(join(tmpdir(), "codex-gate-batch-receipts-"));
  fixtureRoots.add(receiptDir);
  mkdirSync(join(f.root, "many"));
  for (let index = 0; index < 81; index += 1) {
    writeFileSync(join(f.root, "many", `changed-${index}.txt`), `change ${index}\n`);
  }
  const result = runGate(f, "--uncommitted", "--review-only", "--receipt-dir", receiptDir);
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const receiptFiles = readdirSync(receiptDir).filter((name) => name.endsWith(".json"));
  assert.equal(receiptFiles.length, 1);
  const receipt = JSON.parse(readFileSync(join(receiptDir, receiptFiles[0]), "utf8"));
  assert.equal(receipt.reviewBatches.length, 4, "大范围审查必须按小文件批次拆分 reviewer 工作量");
  assert.equal(receipt.review.verdict, "pass");
  assert.equal(receipt.review.gitnexus.status, "pass");
}

{
  const f = fixture();
  const before = gateTempDirs();
  f.env.GATE_BREAK_REPO = f.root;
  const result = runGate(f, "--uncommitted", "--review-only");
  assert.notEqual(result.status, 0, "Codex 审查后的 Git 读取失败必须阻断门禁");
  assert.deepEqual(gateTempDirs(), before, "审查后的 Git 读取失败仍必须清理门禁临时目录");
}

const roots = [...fixtureRoots];
cleanupFixtures();
assert.ok(roots.every((root) => !existsSync(root)), "Codex 门禁测试必须清理所有临时 Git fixture");

console.log(
  "  ✓ Codex 门禁覆盖 Node 下限、条件 API易门禁、npm ci 锁定安装、GitNexus 独立证据、clean-HEAD、--commit 精确范围、差异范围、阻断矩阵、状态漂移与临时目录清理",
);
