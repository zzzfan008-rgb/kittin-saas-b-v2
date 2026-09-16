import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { NODE_SPECS } from "../src/types/workflow";

/**
 * 生成节点 kind 契约测试。
 *
 * 背景：`main` 曾经因为 server 路由与一个类型联合里并不存在的 kind 字面量做比较，
 * 带上 TS2367 类型错误、无法编译，并让服务端启动即崩。这条不变量把「路由里比较的
 * kind 必须来自运行时 kind 目录」固定下来，让同类缺陷在测试阶段暴露，而不是等到
 * `tsc` 报错或运行时才发现。
 *
 * 目录本身（NODE_SPECS）是权威：新增一个可生成的节点 kind 必须同时补齐提示词、
 * 参数档案与评估矩阵，因此不能只在一个路由里比较一个新的字面量。
 */

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const knownKinds = new Set(Object.keys(NODE_SPECS));

const scannedSources = ["server/routes/generate.ts", "server/routes/runPlan.ts"];

/** 与类型联合做比较的 kind 表达式（只匹配带限定前缀的写法，避免误伤无关的 kind 字段）。 */
const KIND_COMPARISON = /(?:resolvedKind|step\.kind|node\.kind)\s*(?:===|!==)\s*"([a-z][a-z0-9-]*)"/g;

const comparedKinds = new Map<string, string[]>();
for (const relativePath of scannedSources) {
  const lines = readFileSync(resolve(repoRoot, relativePath), "utf8").split(/\r?\n/);
  for (const line of lines) {
    // 只跳过以 `//` 开头的整行注释：注释里说明「原先比较过 fabric-replace」不应被当作
    // 代码比较。同行代码之后的尾注释仍然参与扫描，因此不会漏掉任何真实的比较表达式。
    if (line.trimStart().startsWith("//")) continue;
    for (const match of line.matchAll(KIND_COMPARISON)) {
      const literal = match[1];
      comparedKinds.set(literal, [...(comparedKinds.get(literal) ?? []), relativePath]);
    }
  }
}

assert.ok(
  comparedKinds.size > 0,
  "kind 契约测试必须真的扫描到比较表达式；扫不到说明正则已与源码脱节，本测试会静默失效",
);

for (const [literal, files] of comparedKinds) {
  assert.ok(
    knownKinds.has(literal),
    `${files.join("、")} 比较了不是合法节点 kind 的字面量 "${literal}"；` +
      `合法 kind 为 ${[...knownKinds].sort().join(", ")}。` +
      "若这是有意新增的可生成节点，必须先在 NODE_SPECS 中补齐提示词、参数档案与评估矩阵",
  );
}

assert.equal(
  knownKinds.has("fabric-replace"),
  false,
  "fabric-replace 不是产品或生成节点 kind；它被加入目录时必须同时补齐提示词、参数档案与评估矩阵",
);
assert.ok(
  comparedKinds.has("fabric-recolor"),
  "fabricImageUrl 的授权守卫必须绑定到 fabric-recolor，缺失说明守卫被误删",
);
assert.equal(
  comparedKinds.has("fabric-replace"),
  false,
  "fabric-replace 不是合法 kind，路由不得再与它比较",
);

console.log(
  `生成节点 kind 契约测试通过（扫描 ${comparedKinds.size} 个 kind 字面量，目录 ${knownKinds.size} 个成员）`,
);
