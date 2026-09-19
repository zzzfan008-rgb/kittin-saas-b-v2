import assert from "node:assert/strict";
import {
  nodeProductPolicy,
  templateProductPolicy,
} from "../src/lib/nodeProductPolicy";
import type { NodeKind, WorkflowTemplate } from "../src/types/workflow";

/**
 * v7（R-48 P2-a）：旧 9 值 kind 收敛为三值后，「首版产品政策不支持四族旧 kind」
 * 的收窄清单失效——nodeProductPolicy 恒 supported、templateProductPolicy 恒可启动。
 * 旧断言（V1_UNSUPPORTED_NODE_KINDS 清单、blockedNodeKinds、源码内「暂不支持」
 * 文案扫描）随旧 kind 一并退役；本测试改为钉住「三值 kind 全支持」这一新语义。
 * UI 源码文案扫描断言随旧节点组件退役删除（P2-c 重写节点组件）。
 */

const allKinds: NodeKind[] = ["text", "image", "video"];

for (const kind of allKinds) {
  const policy = nodeProductPolicy(kind);
  assert.equal(policy.status, "supported", kind);
  assert.equal(policy.canCreate, true, kind);
  assert.equal(policy.paidRunAllowed, true, kind);
}

function template(kind: NodeKind, builtIn: boolean): Pick<WorkflowTemplate, "builtIn" | "flow"> {
  return {
    builtIn,
    flow: {
      schemaVersion: 7,
      nodes: [{
        id: "node",
        type: kind,
        position: { x: 0, y: 0 },
        data: { kind },
      }],
      edges: [],
    },
  } as unknown as Pick<WorkflowTemplate, "builtIn" | "flow">;
}

for (const kind of allKinds) {
  const builtin = templateProductPolicy(template(kind, true));
  assert.equal(builtin.status, "supported", kind);
  assert.equal(builtin.launchAllowed, true, kind);
  assert.deepEqual(builtin.blockedNodeKinds, []);
  const userTemplate = templateProductPolicy(template(kind, false));
  assert.equal(userTemplate.launchAllowed, true, kind);
  assert.deepEqual(userTemplate.blockedNodeKinds, []);
}

console.log("v7 节点产品政策（三值全支持）测试通过");
