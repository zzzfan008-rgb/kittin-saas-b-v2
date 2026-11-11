/**
 * 参考图角色识别（按节点名称）单元测试。
 * 运行：node node_modules/tsx/dist/cli.mjs tests/reference-role.test.ts
 */
import assert from "node:assert/strict";
import {
  matchReferenceRole,
  referenceOrderRank,
  REFERENCE_ROLES,
} from "../src/lib/referenceRole";
import { tryonRoleOf, tryonUpstreamRank } from "../src/lib/referenceOrder";

let passed = 0;
function ok(name: string, fn: () => void): void {
  fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

// ---- 基础匹配 ----
ok("模板内置 id 优先命中，改名也不丢身份", () => {
  assert.equal(matchReferenceRole("garment", "随便起的名字"), "服装");
  assert.equal(matchReferenceRole("model", "素材1"), "模特");
});

ok("按名称关键词识别四类角色", () => {
  assert.equal(matchReferenceRole("n1", "服装图"), "服装");
  assert.equal(matchReferenceRole("n2", "数字模特"), "模特");
  assert.equal(matchReferenceRole("n3", "姿态参考"), "姿态");
  assert.equal(matchReferenceRole("n4", "场景图"), "场景");
});

ok("同义词与英文名称也能命中", () => {
  assert.equal(matchReferenceRole("n1", "白色上衣"), "服装");
  assert.equal(matchReferenceRole("n2", "garment front"), "服装");
  assert.equal(matchReferenceRole("n3", "Pose A"), "姿态");
  assert.equal(matchReferenceRole("n4", "Background"), "场景");
  assert.equal(matchReferenceRole("n5", "人物半身"), "模特");
});

ok("大小写与空格不影响匹配", () => {
  assert.equal(matchReferenceRole("n1", "  GARMENT  "), "服装");
  assert.equal(matchReferenceRole("n2", "MO DEL"), "模特");
});

ok("无法识别时返回 null（不猜）", () => {
  assert.equal(matchReferenceRole("n1", "图三"), null);
  assert.equal(matchReferenceRole("n2", "素材1"), null);
  assert.equal(matchReferenceRole("n3", ""), null);
  assert.equal(matchReferenceRole("n4", "   "), null);
});

// ---- 排序兼容性：只有服装/模特参与排序，姿态/场景与未知同为 2 ----
ok("排序位次保持历史语义", () => {
  assert.equal(referenceOrderRank("服装"), 0);
  assert.equal(referenceOrderRank("模特"), 1);
  assert.equal(referenceOrderRank("姿态"), 2);
  assert.equal(referenceOrderRank("场景"), 2);
  assert.equal(referenceOrderRank(null), 2);
});

ok("model-tryon 旧入口与新函数等价", () => {
  const cases: Array<[string, string]> = [
    ["garment", "服装图"],
    ["model", "数字模特"],
    ["x1", "服装图"],
    ["x2", "模特正面"],
    ["x3", "素材1"],
    ["x4", "场景图"],
  ];
  for (const [id, label] of cases) {
    const role = matchReferenceRole(id, label);
    assert.equal(tryonRoleOf(id, label), role === "服装" || role === "模特" ? role : undefined);
    assert.equal(tryonUpstreamRank(id, label), referenceOrderRank(role));
  }
});

ok("角色清单固定为四类", () => {
  assert.deepEqual([...REFERENCE_ROLES], ["服装", "模特", "姿态", "场景"]);
});

console.log(`\n${passed} 项通过`);
