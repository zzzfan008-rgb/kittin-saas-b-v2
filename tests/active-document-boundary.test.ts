import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { savePrintOutputAsAsset } from "../src/lib/printAsset";
import {
  selectActiveCompareIds,
  selectActiveDirty,
  selectActiveDocument,
  selectActiveDocumentEpoch,
  selectActiveEdges,
  selectActiveNodes,
  selectActivePrimarySelectedNodeId,
  selectActiveProjectId,
  selectActiveProjectName,
  selectActiveReadOnly,
  selectActiveRevision,
  selectActiveSavedRevision,
  selectActiveSaveState,
  selectActiveSelectedNodeId,
  selectActiveSelectedNodeIds,
  selectActiveSelectedResultId,
  selectDocumentForTab,
  selectHasDirtyTabs,
  useFlowStore,
  type FlowNode,
} from "../src/store/flowStore";

const ACTIVE_DOCUMENT_FIELDS = new Set([
  "projectId",
  "projectName",
  "readOnly",
  "nodes",
  "edges",
  "selectedNodeIds",
  "selectedNodeId",
  "selectedResultId",
  "compareIds",
  "saveState",
  "revision",
  "savedRevision",
  "dirty",
  "documentEpoch",
]);

const testRoot = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testRoot, "..");
const sourceRoot = path.resolve(testRoot, "../src");
const guardProbeFile = path.join(testRoot, "fixtures/active-document-guard-probe.ts");

const configPath = path.join(repositoryRoot, "tsconfig.json");
const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
if (configFile.error) {
  throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, "\n"));
}
const parsedConfig = ts.parseJsonConfigFileContent(configFile.config, ts.sys, repositoryRoot);
const program = ts.createProgram(
  [...parsedConfig.fileNames, guardProbeFile],
  parsedConfig.options,
);
const checker = program.getTypeChecker();
const flowStoreFile = program.getSourceFile(path.join(sourceRoot, "store/flowStore.ts"));
assert.ok(flowStoreFile, "TypeScript Program 未包含 flowStore.ts");
const flowStateDeclaration = flowStoreFile.statements.find(
  (statement): statement is ts.InterfaceDeclaration =>
    ts.isInterfaceDeclaration(statement) && statement.name.text === "FlowState",
);
assert.ok(flowStateDeclaration, "flowStore.ts 缺少 FlowState interface");

function sourceFiles(root: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...sourceFiles(absolute));
    else if (/\.(?:ts|tsx)$/.test(entry.name)) files.push(absolute);
  }
  return files.sort();
}

function propertyName(node: ts.PropertyAccessExpression | ts.ElementAccessExpression): string | null {
  if (ts.isPropertyAccessExpression(node)) return node.name.text;
  const argument = node.argumentExpression;
  return argument && ts.isStringLiteral(argument) ? argument.text : null;
}

function directActiveFieldReads(file: string): string[] {
  const tree = program.getSourceFile(file);
  assert.ok(tree, `TypeScript Program 未包含 ${path.relative(repositoryRoot, file)}`);
  const findings: string[] = [];

  const report = (node: ts.Node, field: string) => {
    const position = tree.getLineAndCharacterOfPosition(node.getStart(tree));
    findings.push(`${path.relative(sourceRoot, file)}:${position.line + 1}:${field}`);
  };

  const isFlowStateProperty = (receiver: ts.Node, field: string): boolean => {
    const receiverType = checker.getNonNullableType(checker.getTypeAtLocation(receiver));
    const symbol = checker.getPropertyOfType(receiverType, field);
    return Boolean(symbol?.declarations?.some((declaration) => declaration.parent === flowStateDeclaration));
  };

  const visit = (node: ts.Node): void => {
    if (ts.isBindingElement(node) && ts.isObjectBindingPattern(node.parent)) {
      const fieldNode = node.propertyName ?? node.name;
      const field = ts.isIdentifier(fieldNode) || ts.isStringLiteral(fieldNode)
        ? fieldNode.text
        : null;
      if (field &&
          ACTIVE_DOCUMENT_FIELDS.has(field) &&
          isFlowStateProperty(node.parent, field)) {
        report(node, field);
      }
    }

    if (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) {
      const field = propertyName(node);
      if (field &&
          ACTIVE_DOCUMENT_FIELDS.has(field) &&
          isFlowStateProperty(node.expression, field)) {
        report(node, field);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(tree);
  return [...new Set(findings)];
}

function imageNode(id: string, label: string): FlowNode {
  return {
    id,
    type: "image-input",
    position: { x: 0, y: 0 },
    data: { kind: "image-input", label, status: "idle", imageRole: "default" },
  };
}

console.log("活动文档 selector 边界测试");

const guardProbeFindings = directActiveFieldReads(guardProbeFile);
assert.ok(
  guardProbeFindings.some((finding) => finding.endsWith(":nodes")) &&
    guardProbeFindings.some((finding) => finding.endsWith(":dirty")),
  `架构门禁负向探针未捕获 FlowState 参数解构:\n${guardProbeFindings.join("\n")}`,
);

const consumerFiles = sourceFiles(sourceRoot).filter((file) => file !== flowStoreFile.fileName);
const directReads = consumerFiles.flatMap(directActiveFieldReads);
assert.deepEqual(
  directReads,
  [],
  `flowStore 以外的消费者不得越过 active-document selector 直读兼容镜像字段:\n${directReads.join("\n")}`,
);
console.log(`  ✓ ${consumerFiles.length} 个消费者源文件无活动文档镜像直读`);

useFlowStore.getState().loadFlow({
  projectId: "selector-a",
  projectName: "Selector A",
  nodes: [imageNode("selector-a-node", "A")],
  edges: [],
  markDirty: true,
});
useFlowStore.setState({
  recentResults: [{
    id: "selector-result",
    image: "/api/files/selector-result.png",
    nodeId: "selector-a-node",
    nodeLabel: "Selector result",
    kind: "ai-modify",
    projectId: "selector-a",
    startedAt: 1,
    finishedAt: 2,
    status: "success",
  }],
});
useFlowStore.getState().setSelectedNodeIds(["selector-a-node"]);
const selectedState = useFlowStore.getState();
assert.equal(selectActivePrimarySelectedNodeId(selectedState), "selector-a-node");
assert.deepEqual(selectActiveSelectedNodeIds(selectedState), ["selector-a-node"]);
assert.equal(selectActiveSelectedNodeId(selectedState), "selector-a-node");
useFlowStore.getState().setSelectedResultId("selector-result");
const resultSelectedState = useFlowStore.getState();
assert.equal(selectActiveSelectedResultId(resultSelectedState), "selector-result");
useFlowStore.getState().toggleCompareId("selector-result");

const stateA = useFlowStore.getState();
const documentA = selectActiveDocument(stateA);
assert.equal(selectActiveProjectId(stateA), documentA.projectId);
assert.equal(selectActiveProjectName(stateA), documentA.projectName);
assert.equal(selectActiveReadOnly(stateA), documentA.readOnly);
assert.strictEqual(selectActiveNodes(stateA), documentA.nodes);
assert.strictEqual(selectActiveEdges(stateA), documentA.edges);
assert.strictEqual(selectActiveSelectedNodeIds(stateA), documentA.selectedNodeIds);
assert.equal(selectActiveSelectedNodeId(stateA), documentA.selectedNodeId);
assert.equal(selectActivePrimarySelectedNodeId(stateA), null);
assert.equal(selectActiveSelectedResultId(stateA), null);
assert.deepEqual(selectActiveCompareIds(stateA), ["selector-result"]);
assert.strictEqual(selectActiveCompareIds(stateA), documentA.compareIds);
assert.equal(selectActiveSaveState(stateA), documentA.saveState);
assert.equal(selectActiveRevision(stateA), documentA.revision);
assert.equal(selectActiveSavedRevision(stateA), documentA.savedRevision);
assert.equal(selectActiveDirty(stateA), documentA.dirty);
assert.equal(selectActiveDocumentEpoch(stateA), documentA.documentEpoch);
assert.equal(selectHasDirtyTabs(stateA), documentA.dirty);
assert.deepEqual(selectDocumentForTab(stateA, stateA.activeTabId), documentA);
console.log("  ✓ 兼容 selector 完整覆盖当前文档、选择与保存状态");

useFlowStore.getState().openFlowTab({
  projectId: "selector-read-only",
  projectName: "Read only",
  nodes: [imageNode("selector-read-only-node", "Read only")],
  edges: [],
  readOnly: true,
});
assert.equal(selectActiveReadOnly(useFlowStore.getState()), true);
useFlowStore.getState().switchTab(stateA.activeTabId);
assert.equal(selectActiveReadOnly(useFlowStore.getState()), false);

useFlowStore.getState().createBlankTab();
const blankState = useFlowStore.getState();
const previousDocument = selectDocumentForTab(blankState, stateA.activeTabId);
assert.equal(previousDocument?.projectId, "selector-a");
assert.equal(previousDocument?.nodes[0]?.id, "selector-a-node");
assert.equal(selectActiveProjectId(blankState) === "selector-a", false);
assert.equal(selectHasDirtyTabs(blankState), true, "非活动页签的 dirty 仍必须被卸载保护感知");
console.log("  ✓ 切页后 selector 区分活动文档与非活动页签快照");

const printUrl = "/api/files/selector-print.png";
useFlowStore.getState().loadFlow({
  projectId: "selector-print-a",
  projectName: "Print source",
  nodes: [{
    id: "selector-print-node",
    type: "print-extract",
    position: { x: 0, y: 0 },
    data: {
      kind: "print-extract",
      label: "Print source",
      status: "success",
      prompt: "",
      outputImages: [printUrl],
      savedAsAssets: [],
      modelId: "grok-imagine-image",
      modelOptions: { aspectRatio: "1:1", resolution: "2k" },
    },
  }],
  edges: [],
});
const printSourceTabId = useFlowStore.getState().activeTabId;
let resolveAssetRequest: ((response: Pick<Response, "ok" | "status">) => void) | undefined;
const savePending = savePrintOutputAsAsset(
  {
    nodeId: "selector-print-node",
    nodeLabel: "Print source",
    url: printUrl,
    now: new Date("2026-08-25T01:02:03Z"),
  },
  async () => new Promise((resolve) => {
    resolveAssetRequest = resolve;
  }),
);
assert.ok(resolveAssetRequest, "素材请求应在函数返回前启动");
useFlowStore.getState().createBlankTab();
const destinationTabId = useFlowStore.getState().activeTabId;
resolveAssetRequest({ ok: true, status: 201 });
await savePending;

const postSaveState = useFlowStore.getState();
const printSource = selectDocumentForTab(postSaveState, printSourceTabId);
const destination = selectDocumentForTab(postSaveState, destinationTabId);
const savedPrint = printSource?.nodes.find((node) => node.id === "selector-print-node")?.data;
assert.equal(savedPrint?.kind, "print-extract");
assert.deepEqual(savedPrint?.kind === "print-extract" ? savedPrint.savedAsAssets : [], [printUrl]);
assert.equal(destination?.nodes.some((node) => node.id === "selector-print-node"), false);
assert.equal(postSaveState.activeTabId, destinationTabId);
console.log("  ✓ 异步素材保存在切页后仍定向回写发起命令的原页签");
