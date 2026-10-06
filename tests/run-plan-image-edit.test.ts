/**
 * 65d §1.3：runPlan 蒙版重绘/整图编辑前置校验（imageEditGate）单元测试（纯逻辑，不碰库）。
 * 覆盖：无 onlyNodeId / 非 image 节点 / 不存在节点放行；image 节点 400 分支
 * （既无蒙版也无编辑提示词 / mask 非空但 editPrompt 空 → 请先填写修改描述，缺口 4）；
 * editPrompt 有值（整图编辑 / 蒙版重绘）放行；trim 语义（空串/空白算空）。
 * 运行：node node_modules/tsx/dist/cli.mjs tests/run-plan-image-edit.test.ts
 */
import assert from "node:assert/strict";
import { imageEditGate } from "../server/routes/runPlan";

let passed = 0;
function ok(name: string, fn: () => void): void {
  try {
    fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

type GateNode = { id: string; data: { [key: string]: unknown } };

function main(): void {
  ok("无 onlyNodeId → 放行(null)", () => {
    assert.equal(imageEditGate([], undefined), null);
  });

  ok("onlyNodeId 指向不存在的节点 → 放行(null)", () => {
    const nodes: GateNode[] = [{ id: "img1", data: { kind: "image" } }];
    assert.equal(imageEditGate(nodes, "nope"), null);
  });

  ok("onlyNodeId 指向非 image 节点(text) → 放行(null)", () => {
    const nodes: GateNode[] = [{ id: "t1", data: { kind: "text", text: "hi" } }];
    assert.equal(imageEditGate(nodes, "t1"), null);
  });

  ok("image 节点既无 mask 也无 editPrompt → 400『既无蒙版也无编辑提示词』", () => {
    const nodes: GateNode[] = [{ id: "img1", data: { kind: "image" } }];
    assert.equal(imageEditGate(nodes, "img1"), "既无蒙版也无编辑提示词");
  });

  ok("image 节点 mask 空白、editPrompt 缺失 → 400『既无蒙版也无编辑提示词』(trim 语义)", () => {
    const nodes: GateNode[] = [{ id: "img1", data: { kind: "image", mask: "   " } }];
    assert.equal(imageEditGate(nodes, "img1"), "既无蒙版也无编辑提示词");
  });

  ok("image 节点有 mask 但 editPrompt 空 → 400『请先填写修改描述』(缺口 4)", () => {
    const nodes: GateNode[] = [{ id: "img1", data: { kind: "image", mask: "/api/files/mask.png" } }];
    assert.equal(imageEditGate(nodes, "img1"), "请先填写修改描述");
  });

  ok("image 节点有 mask 但 editPrompt 仅空白 → 400『请先填写修改描述』", () => {
    const nodes: GateNode[] = [{ id: "img1", data: { kind: "image", mask: "m", editPrompt: "  " } }];
    assert.equal(imageEditGate(nodes, "img1"), "请先填写修改描述");
  });

  ok("image 节点有 editPrompt 无 mask（整图编辑）→ 放行(null)", () => {
    const nodes: GateNode[] = [{ id: "img1", data: { kind: "image", editPrompt: "换个背景" } }];
    assert.equal(imageEditGate(nodes, "img1"), null);
  });

  ok("image 节点有 mask + editPrompt（蒙版重绘）→ 放行(null)", () => {
    const nodes: GateNode[] = [{ id: "img1", data: { kind: "image", mask: "m", editPrompt: "改个袖子" } }];
    assert.equal(imageEditGate(nodes, "img1"), null);
  });

  // ---------- 65d v2 §4.4：mask 与 editInputRef 互斥（第二层）----------
  ok("image 节点 mask + editInputRef → 400『蒙版与编辑输入图互斥，请清除蒙版后重试』(65d v2 §4.4 第二层)", () => {
    const nodes: GateNode[] = [{ id: "img1", data: { kind: "image", mask: "m", editPrompt: "改个袖子", editInputRef: "/api/files/ed.png" } }];
    assert.equal(imageEditGate(nodes, "img1"), "蒙版与编辑输入图互斥，请清除蒙版后重试");
  });

  ok("image 节点 editInputRef + editPrompt 无 mask（多轮修改）→ 放行(null)", () => {
    const nodes: GateNode[] = [{ id: "img1", data: { kind: "image", editPrompt: "再改一下", editInputRef: "/api/files/ed.png" } }];
    assert.equal(imageEditGate(nodes, "img1"), null);
  });

  console.log(`\n通过 ${passed} 项`);
}

main();
