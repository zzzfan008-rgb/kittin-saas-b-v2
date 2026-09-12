import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  V1_UNSUPPORTED_NODE_KINDS,
  nodeProductPolicy,
  templateProductPolicy,
} from "../src/lib/nodeProductPolicy";
import type { NodeKind, WorkflowTemplate } from "../src/types/workflow";

const supportedKinds: NodeKind[] = [
  "image-input",
  "sketch-to-render",
  "ai-modify",
  "mask-redraw",
  "result",
];

assert.deepEqual(V1_UNSUPPORTED_NODE_KINDS, [
  "fabric-recolor",
  "upscale",
  "print-extract",
  "print-mutate",
]);

for (const kind of V1_UNSUPPORTED_NODE_KINDS) {
  const policy = nodeProductPolicy(kind);
  assert.equal(policy.status, "unsupported", kind);
  assert.equal(policy.canCreate, false, kind);
  assert.equal(policy.paidRunAllowed, false, kind);
  assert.match(policy.reason ?? "", /逐模型独立提示词/);
  assert.match(policy.reason ?? "", /历史项目仍可读取、查看和编辑/);
}

for (const kind of supportedKinds) {
  const policy = nodeProductPolicy(kind);
  assert.equal(policy.status, "supported", kind);
  assert.equal(policy.canCreate, true, kind);
  assert.equal(policy.paidRunAllowed, true, kind);
}

function template(kind: NodeKind, builtIn: boolean): Pick<WorkflowTemplate, "builtIn" | "flow"> {
  return {
    builtIn,
    flow: {
      schemaVersion: 6,
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

const blockedBuiltin = templateProductPolicy(template("upscale", true));
assert.equal(blockedBuiltin.status, "unsupported");
assert.equal(blockedBuiltin.launchAllowed, false);
assert.deepEqual(blockedBuiltin.blockedNodeKinds, ["upscale"]);
assert.match(blockedBuiltin.reason ?? "", /高清放大/);

const supportedBuiltin = templateProductPolicy(template("ai-modify", true));
assert.equal(supportedBuiltin.status, "supported");
assert.equal(supportedBuiltin.launchAllowed, true);

const historicalUserTemplate = templateProductPolicy(template("print-extract", false));
assert.equal(historicalUserTemplate.launchAllowed, true);
assert.deepEqual(historicalUserTemplate.blockedNodeKinds, ["print-extract"]);

const testRoot = path.dirname(fileURLToPath(import.meta.url));
for (const relativePath of [
  "../src/components/TaskLauncher.tsx",
  "../src/components/panels/TemplatesDock.tsx",
  "../src/components/panels/ProjectCenter.tsx",
]) {
  const source = fs.readFileSync(path.resolve(testRoot, relativePath), "utf-8");
  assert.match(source, /templateProductPolicy/);
  assert.match(source, /unsupported/);
}

for (const relativePath of [
  "../src/components/nodes/FabricRecolorNode.tsx",
  "../src/components/nodes/UpscaleNode.tsx",
  "../src/components/nodes/PrintExtractNode.tsx",
  "../src/components/nodes/PrintMutateNode.tsx",
]) {
  const source = fs.readFileSync(path.resolve(testRoot, relativePath), "utf-8");
  assert.match(source, /NodeProductPolicyNotice/);
  assert.match(source, /disabledLabel="首版暂不支持"/);
}

for (const relativePath of [
  "../src/components/panels/NodeLibraryPanel.tsx",
  "../src/components/panels/InspectorPanel.tsx",
]) {
  const source = fs.readFileSync(path.resolve(testRoot, relativePath), "utf-8");
  assert.match(source, /nodeProductPolicy/);
  assert.match(source, /unsupported/);
}

console.log("节点首版产品政策测试通过");
