#!/usr/bin/env node
/**
 * C8 白名单 gate（64 Phase 3 删除波）：v7 variant 绑定概念不得在豁免面之外复活。
 *
 * 扫描 src server e2e tests scripts 下的 ts/tsx/mjs，命中下列任一 token 即报告：
 *   promptVariantId / promptFamilyId / parameterProfileId
 *   contractHash / evaluationVersion / postprocessVersion
 *
 * 规则：
 * - 注释行（trim 后以 //、* 或 /* 开头）不计——历史溯源说明允许存在；
 * - 命中行必须落在豁免文件清单内（每条带理由），否则 exit 1（fail-closed）；
 * - docs/ 不在扫描面（历史文档允许）；
 * - --self-test：对内部匹配函数注入合成违规命中，断言必被检出（演示 fail-closed）。
 *
 * 挂点：npm run check（scripts/ci 链路同步）。
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));
const SCAN_ROOTS = ["src", "server", "e2e", "tests", "scripts"];
const SCAN_EXTENSIONS = new Set([".ts", ".tsx", ".mjs"]);
const TOKEN_PATTERN = /promptVariantId|promptFamilyId|parameterProfileId|contractHash|evaluationVersion|postprocessVersion/;

/**
 * 豁免文件清单（相对 repo root；每条必须带理由）。
 * 分三类：
 * 1) 迁移模块：读取 v7/v8 脏数据并剥离（任务书 C8 允许清单）；
 * 2) 活概念同名 token：模型契约哈希（imageModels/textModels/videoModels 及其
 *    生成/校验脚本）、付费评估账本列（database.ts evaluation_campaigns）、
 *    server 冻结常量溯源注释（promptPresetsFrozen.ts）——语义是活概念，不是 v7 绑定；
 * 3) 迁移/剥离证明测试：向 C2/v8→v9 迁移投喂 v7 脏输入并断言剥离（tests/workflow-schema、
 *    document-snapshot、project-tabs-session）。
 */
const ALLOWED_FILES = new Map([
  // 1) 迁移模块
  ["src/lib/documentSnapshot.ts", "v8→v9 惰性迁移分支（LEGACY_GENERATOR_BINDING_FIELDS / migrateV8GeneratorBindingsToV9）"],
  ["server/lib/workflowSchema.ts", "C2 迁移分支（v7/v8 脏数据按 variantId 解析预设并剥离绑定）"],
  ["src/lib/promptPresetsFrozenClient.ts", "客户端冻结绑定表（迁移查表源）"],
  // 2) 活概念同名 token
  ["src/types/imageModels.ts", "模型契约哈希 contractHash（活概念，非 v7 绑定）"],
  ["src/types/textModels.ts", "模型契约哈希 contractHash（活概念，非 v7 绑定）"],
  ["src/types/videoModels.ts", "模型契约哈希 contractHash（活概念，非 v7 绑定）"],
  ["server/lib/database.ts", "evaluation_campaigns 账本列 evaluationVersion（付费评估账本，活概念）"],
  ["scripts/video-model-contract-hash.mjs", "视频模型契约哈希生成/校验脚本（活概念）"],
  ["scripts/text-model-contract-hash.mjs", "文本模型契约哈希生成/校验脚本（活概念）"],
  ["scripts/apiyi-docs.mjs", "API易模型文档契约哈希校验（活概念）"],
  ["server/lib/promptPresetsFrozen.ts", "冻结常量的文本溯源注释（说明抽取来源，非活引用）"],
  ["src/store/flowStore.ts", "会话恢复防御性 delete 清单（SESSION_GENERATION_FIELDS 清理旧会话脏数据的死字段；delete 语义不写入）"],
  // 3) 迁移/剥离证明测试（合法脏输入）
  ["tests/workflow-schema.test.ts", "C2 迁移三态测试：v7/v8 脏输入投喂 + 剥离断言"],
  ["tests/document-snapshot.test.ts", "文档投影剥离证明：脏输入投喂 + 死字段不得落盘断言"],
  ["tests/project-tabs-session.test.ts", "会话/持久化边界剥离证明：脏输入投喂 + proj 层死字段不得写入断言"],
  ["tests/initial-draft-client.test.ts", "客户端 v7→v9 迁移输入夹具（migrateV8GeneratorBindingsToV9 脏输入投喂）"],
  // 4) 防复发断言（断言 v9 零残留/剥离，token 出现在伪造输入与字段名字符串里）
  ["tests/dag.test.ts", "C4 防复发：伪造 variant 字段投喂 + params 零残留断言"],
  ["tests/runner-task-prompt.test.ts", "v9 防复发：伪造 variant 字段投喂 + runner 零残留断言"],
  ["tests/templates-v8.test.ts", "v9 模板防复发：内置模板不得携带 variant 绑定断言"],
  ["tests/prompt-preset-ui.test.ts", "UI 防复发（EXCLUDED 留盘）：面板源码不得引用 data.promptVariantId"],
  // 5) 模型契约哈希校验测试（活概念，非 v7 绑定）
  ["tests/apiyi-docs.test.ts", "模型契约哈希校验测试（活概念）"],
  ["tests/provider-contract.test.ts", "模型契约哈希校验测试（活概念）"],
  ["tests/video-provider.test.ts", "视频模型契约哈希校验测试（活概念）"],
  // 6) gate 自身（TOKEN_PATTERN 与 self-test 合成数据）
  ["scripts/check-legacy-variant-grep.mjs", "C8 gate 自身：token 模式与 self-test 合成数据"],
]);

function isCommentLine(line) {
  const trimmed = line.trim();
  return trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*");
}

/** 纯函数：给定 [(relPath, lineText)] 返回违规列表。self-test 直接对它注入合成数据。 */
export function findViolations(entries) {
  const violations = [];
  for (const [relPath, lineText] of entries) {
    if (!TOKEN_PATTERN.test(lineText)) continue;
    if (isCommentLine(lineText)) continue;
    if (ALLOWED_FILES.has(relPath)) continue;
    violations.push({ relPath, lineText: lineText.trim() });
  }
  return violations;
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      if (name === "node_modules" || name.startsWith(".")) continue;
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

function collectEntries() {
  const entries = [];
  for (const root of SCAN_ROOTS) {
    for (const file of walk(join(REPO_ROOT, root))) {
      const dotIndex = file.lastIndexOf(".");
      if (dotIndex < 0) continue;
      if (!SCAN_EXTENSIONS.has(file.slice(dotIndex))) continue;
      const relPath = relative(REPO_ROOT, file);
      const lines = readFileSync(file, "utf8").split("\n");
      for (let index = 0; index < lines.length; index += 1) {
        entries.push([relPath, lines[index]]);
      }
    }
  }
  return entries;
}

function selfTest() {
  const syntheticClean = [
    ["src/lib/allowed-not.ts", 'const x = "promptVariantId";'], // 不在豁免清单 → 违规
  ];
  const syntheticComment = [
    ["src/lib/anywhere.ts", "// 历史：promptVariantId 已删"], // 注释行 → 不计
  ];
  const syntheticAllowed = [
    ["src/lib/documentSnapshot.ts", "const dead = LEGACY_GENERATOR_BINDING_FIELDS;"], // 不含 token → 不计
  ];
  const detected = findViolations(syntheticClean);
  if (detected.length !== 1) {
    throw new Error(`self-test 失败：合成违规未被检出（期望 1 条，实际 ${detected.length} 条）`);
  }
  if (findViolations(syntheticComment).length !== 0) {
    throw new Error("self-test 失败：注释行不应计为违规");
  }
  if (findViolations(syntheticAllowed).length !== 0) {
    throw new Error("self-test 失败：不含 token 的行不应计为违规");
  }
  console.log("self-test 通过：合成违规命中被检出（fail-closed）；注释行不计；无 token 行不计。");
}

if (process.argv.includes("--self-test")) {
  selfTest();
  process.exit(0);
}

const violations = findViolations(collectEntries());
if (violations.length > 0) {
  console.error(`C8 白名单 gate 失败：${violations.length} 处 v7 variant 绑定 token 出现在豁免面之外：`);
  for (const violation of violations) {
    console.error(`  ${violation.relPath}: ${violation.lineText}`);
  }
  console.error("若确属合法新豁免面，请在 scripts/check-legacy-variant-grep.mjs 的 ALLOWED_FILES 中登记并写明理由。");
  process.exit(1);
}
console.log(`C8 白名单 gate 通过：豁免面 ${ALLOWED_FILES.size} 文件，违规 0 处。`);
