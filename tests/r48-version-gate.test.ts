import assert from "node:assert/strict";
import { validateAndMigrateFlow, WorkflowValidationError } from "../server/lib/workflowSchema";
import { WORKFLOW_SCHEMA_VERSION } from "../src/types/workflow";

// R-48 P2-a 版本闸验收测试（契约 data-model.md §2）：
// schemaVersion ≤ 6（含无版本）一律拒绝，拒绝文案固定。
//
// 状态注记（P2-a 交付时）：本测试在 P2-a 提交点上无法执行——workflowSchema →
// documentSnapshot 的 import 链仍引用已删除的旧导出（documentSnapshot.ts 重写归
// P2-b）。P2-b 完成 documentSnapshot/workflowSchema 重写后本测试必须转绿；
// 若拒绝文案被改动，本测试即红（文案是契约 §2 的固定值）。
const cases: Array<[string, unknown]> = [
  ["无版本", { nodes: [], edges: [] }],
  ["v0", { schemaVersion: 0, nodes: [], edges: [] }],
  ["v5", { schemaVersion: 5, nodes: [], edges: [] }],
  ["v6", { schemaVersion: 6, nodes: [], edges: [] }],
];

for (const [label, flow] of cases) {
  try {
    validateAndMigrateFlow(flow);
    assert.fail(`${label} 应被拒绝`);
  } catch (error) {
    assert.ok(error instanceof WorkflowValidationError, `${label} 应抛 WorkflowValidationError`);
    const message = (error as Error).message;
    assert.match(message, /^flow\.schemaVersion: 该项目为旧版本格式（v\d+），已在三节点重构中清理，请新建项目$/, `${label} 拒绝文案不符: ${message}`);
  }
}

// v7 空图不应在版本闸处被拒（后续结构校验归 P2-b；空节点/边数组本身合法输入形状）。
try {
  validateAndMigrateFlow({ schemaVersion: WORKFLOW_SCHEMA_VERSION, nodes: [], edges: [] });
} catch (error) {
  // 空图进入节点级校验后可能因其他结构性原因失败——但绝不允许出现“旧版本格式”文案。
  const message = error instanceof Error ? error.message : String(error);
  assert.ok(!message.includes("旧版本格式"), `v7 不得触发版本拒绝文案: ${message}`);
}

console.log("r48-version-gate smoke: ok");
