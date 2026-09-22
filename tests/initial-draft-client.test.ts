import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { ProjectTab, ServerInitialDraftSnapshot } from "../src/store/flowStore";
import {
  applyServerInitialDraftToTab,
  createFreshLocalTabForInitialDraft,
  isPristineProjectTab,
  normalizeTabSessionValue,
  persistedWorkflowForProjectTab,
  projectTabLifecycle,
  selectActiveDocument,
  useFlowStore,
} from "../src/store/flowStore";
import {
  bootstrapNeedsFreshProjectIdentity,
  decideInitialDraftStartup,
  selectLocalInitialDraftCandidate,
  shouldStayBlankOnStartup,
} from "../src/initialDraft/initialDraftMigration";
import { settleInitialDraftBeforeAbandon } from "../src/initialDraft/InitialDraftWorkspace";
import {
  copyProjectScopedMasks,
  fetchSavedProject,
  fetchSavedProjects,
  forceClearInitialDraft,
  isServerInitialDraftPristine,
  parseInitialDraft,
  syncInitialDraft,
} from "../src/initialDraft/initialDraftClient";
import {
  registerInitialDraftSaveBarrier,
  waitForInitialDraftSyncBeforeFormalSave,
} from "../src/initialDraft/initialDraftRuntime";
import { inferTemplateLaunchMode, launchTemplateInNewTab } from "../src/lib/templateLaunch";
import { DocumentFlowVersionError, DocumentGraphError } from "../src/lib/documentSnapshot";
import type { WorkflowTemplate } from "../src/types/workflow";

function tab(overrides: Partial<ProjectTab> = {}): ProjectTab {
  return {
    id: "tab-local",
    projectId: "project-local",
    projectName: "未命名设计项目",
    readOnly: false,
    // 方案 C：空白项目从空画布开始（nodes=[]&&edges=[]）。
    nodes: [],
    edges: [],
    selectedNodeIds: [],
    selectedNodeId: null,
    selectedResultId: null,
    compareIds: [],
    saveState: "idle",
    hasBeenPersisted: false,
    revision: 0,
    savedRevision: 0,
    dirty: false,
    documentEpoch: 0,
    lifecycle: "local",
    ...overrides,
  };
}

function draft(overrides: Partial<ServerInitialDraftSnapshot> = {}): ServerInitialDraftSnapshot {
  const source = tab({
    projectId: "draft-server",
    projectName: "未修改项目名称20260826000000",
  });
  return {
    id: "draft-server",
    name: "未修改项目名称20260826000000",
    flow: persistedWorkflowForProjectTab(source),
    revision: 0,
    lifecycle: "initial_draft",
    createdAt: "2026-08-26T00:00:00.000Z",
    updatedAt: "2026-08-26T00:00:00.000Z",
    ...overrides,
  };
}

console.log("初始项目客户端测试");

const placeholder = tab();
const editedLegacy = tab({ projectName: "本机设计", dirty: true, revision: 2 });
assert.equal(decideInitialDraftStartup(placeholder, editedLegacy, null).kind, "bootstrap-local");
assert.equal(
  bootstrapNeedsFreshProjectIdentity(decideInitialDraftStartup(placeholder, editedLegacy, null)),
  false,
);
console.log("  ✓ 首次接入会迁移已有本机未保存内容");

const staleInitialDraft = tab({
  projectId: "retired-draft-id",
  lifecycle: "initial_draft",
  dirty: true,
  revision: 3,
  draftRevision: 2,
  draftSyncedRevision: 2,
});
const staleDecision = decideInitialDraftStartup(placeholder, staleInitialDraft, null);
assert.equal(staleDecision.kind, "bootstrap-local");
assert.equal(bootstrapNeedsFreshProjectIdentity(staleDecision), true);
console.log("  ✓ 其他页签已保存或放弃的旧草稿会保留内容但分配新项目 ID");

const serverOnly = draft();
assert.equal(decideInitialDraftStartup(placeholder, null, serverOnly).kind, "restore-server");
console.log("  ✓ 新标签页和重新登录会恢复同一份云端初始项目");

// 决策 A：有已保存项目且没有可信本地页签时保持空白（既不自动打开项目，也不新建草稿）。
assert.equal(shouldStayBlankOnStartup(null, null, 1), true);
assert.equal(shouldStayBlankOnStartup(null, serverOnly, 1), true);
assert.equal(shouldStayBlankOnStartup(null, { ...serverOnly, name: "已修改草稿" }, 1), false);
assert.equal(shouldStayBlankOnStartup(editedLegacy, null, 1), false);
assert.equal(shouldStayBlankOnStartup(null, null, 0), false);
console.log("  ✓ 已有正式项目时优先恢复最近项目，未保存草稿仍优先保留");

assert.equal(decideInitialDraftStartup(placeholder, editedLegacy, serverOnly).kind, "sync-local");
console.log("  ✓ 空白云端草稿允许一次性接管可信旧本机修改");

const changedServer = draft({ revision: 3, name: "云端也修改过" });
assert.equal(decideInitialDraftStartup(placeholder, editedLegacy, changedServer).kind, "conflict");
console.log("  ✓ 本机与云端同时修改时必须进入显式冲突选择");

const markedLocal = tab({
  projectId: changedServer.id,
  projectName: "本机继续修改",
  lifecycle: "initial_draft",
  revision: 5,
  draftSyncedRevision: 4,
  draftRevision: changedServer.revision,
});
assert.equal(decideInitialDraftStartup(placeholder, markedLocal, changedServer).kind, "sync-local");
assert.equal(
  decideInitialDraftStartup(
    placeholder,
    { ...markedLocal, revision: 4, draftSyncedRevision: 4 },
    changedServer,
  ).kind,
  "restore-server",
);
console.log("  ✓ 同一草稿按 revision 判定续传或恢复，不会静默覆盖");

assert.equal(selectLocalInitialDraftCandidate([editedLegacy], editedLegacy.id, false), null);
assert.equal(selectLocalInitialDraftCandidate([editedLegacy], editedLegacy.id, true)?.id, editedLegacy.id);
console.log("  ✓ 只有确认当前账号后才读取本机会话草稿");

const dynamicPristine = tab({
  projectId: serverOnly.id,
  projectName: "未修改项目名称20260825000000",
  lifecycle: "initial_draft",
  draftRevision: 0,
  draftSyncedRevision: 0,
});
assert.equal(isPristineProjectTab(dynamicPristine), true);
assert.equal(isServerInitialDraftPristine(serverOnly), true);
assert.equal(isServerInitialDraftPristine({ ...serverOnly, name: "未修改项目名称20260827000000" }), true);
console.log("  ✓ 动态默认名称跨日期保持原名称且仍可识别为空白初始项目");

const normalized = normalizeTabSessionValue({
  activeTabId: dynamicPristine.id,
  tabs: [dynamicPristine],
});
assert.ok(normalized);
assert.equal(normalized.tabs[0].lifecycle, "initial_draft");
assert.equal(normalized.tabs[0].draftRevision, 0);
assert.equal(normalized.tabs[0].draftSyncedRevision, 0);
console.log("  ✓ 刷新会话保留初始项目身份与同步版本");

assert.equal(parseInitialDraft(serverOnly).id, serverOnly.id);
assert.throws(() => parseInitialDraft({ ...serverOnly, revision: -1 }), /响应格式无效/);
console.log("  ✓ 客户端拒绝无效草稿响应");

const originalFetch = globalThis.fetch;
let requestBody: Record<string, unknown> | null = null;
globalThis.fetch = async (_input, init) => {
  requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
  return new Response(JSON.stringify({ draft: { ...serverOnly, revision: 8 } }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
try {
  const synced = await syncInitialDraft({
    id: serverOnly.id,
    expectedRevision: 7,
    name: serverOnly.name,
    flow: serverOnly.flow,
  });
  assert.equal(requestBody?.expectedRevision, 7);
  assert.equal(synced.revision, 8);
} finally {
  globalThis.fetch = originalFetch;
}
console.log("  ✓ 自动同步携带乐观锁版本");

// 强制清除端点：端点存在时返回 true，不存在（404）时返回 false
globalThis.fetch = async (input) => {
  if (String(input) === "/api/projects/initial-draft/force-clear") {
    return Response.json({ ok: true });
  }
  return Response.json({ error: "not found" }, { status: 404 });
};
try {
  const cleared = await forceClearInitialDraft();
  assert.equal(cleared, true);
} finally {
  globalThis.fetch = originalFetch;
}
globalThis.fetch = async () => Response.json({ error: "not found" }, { status: 404 });
try {
  const cleared = await forceClearInitialDraft();
  assert.equal(cleared, false);
} finally {
  globalThis.fetch = originalFetch;
}
console.log("  ✓ 强制清除草稿端点：可用时清除，404 时降级");

const projectFlow = persistedWorkflowForProjectTab(tab({ projectId: "saved-project" }));
globalThis.fetch = async (input) => {
  if (String(input) === "/api/projects") {
    return Response.json([{
      id: "saved-project",
      name: "最近正式项目",
      updatedAt: "2026-08-27T00:00:00.000Z",
    }]);
  }
  return Response.json({
    id: "saved-project",
    name: "最近正式项目",
    updatedAt: "2026-08-27T00:00:00.000Z",
    flow: projectFlow,
  });
};
try {
  const savedProjects = await fetchSavedProjects();
  assert.equal(savedProjects[0]?.id, "saved-project");
  const savedProject = await fetchSavedProject("saved-project");
  assert.equal(savedProject.flow.schemaVersion, projectFlow.schemaVersion);
} finally {
  globalThis.fetch = originalFetch;
}
console.log("  ✓ 登录恢复可读取最近正式项目及完整画布");

const maskLocal = tab({
  projectId: "mask-source-project",
  nodes: [{
    id: "mask-node",
    type: "image-generator",
    position: { x: 0, y: 0 },
    data: {
      // v8：蒙版住在生成节点上（输入层节点不带蒙版）。
      kind: "image-generator",
      label: "局部重绘",
      status: "idle",
      promptVariantId: "",
      modelId: "gpt-image-2.5-sunburst",
      modelOptions: {},
      aspectRatio: "3:4",
      batchSize: 1,
      mask: "/api/files/source-mask.png",
    },
  }],
});
const maskFlow = persistedWorkflowForProjectTab(maskLocal);
let maskCopyPayload: Record<string, unknown> | null = null;
globalThis.fetch = async (_input, init) => {
  maskCopyPayload = JSON.parse(String(init?.body)) as Record<string, unknown>;
  return Response.json({
    targetProjectId: "mask-target-project",
    masks: [{
      sourceUrl: "/api/files/source-mask.png",
      targetUrl: "/api/files/copied-mask.png",
      nodeId: "mask-node",
    }],
  });
};
try {
  const copied = await copyProjectScopedMasks({
    sourceProjectId: "mask-source-project",
    targetProjectId: "mask-target-project",
    flow: maskFlow,
  });
  assert.equal(maskCopyPayload?.sourceProjectId, "mask-source-project");
  assert.equal(maskCopyPayload?.targetProjectId, "mask-target-project");
  assert.deepEqual(maskCopyPayload?.masks, [{ fileId: "source-mask.png", nodeId: "mask-node" }]);
  assert.equal(copied.targetProjectId, "mask-target-project");
  assert.equal(copied.flow.nodes[0].data.kind, "image-generator");
  if (copied.flow.nodes[0].data.kind !== "image-generator") throw new Error("unexpected node kind");
  assert.equal(copied.flow.nodes[0].data.mask, "/api/files/copied-mask.png");
} finally {
  globalThis.fetch = originalFetch;
}
console.log("  ✓ 项目身份变化会复制并改写项目级蒙版引用");

let sameProjectFetchCalls = 0;
globalThis.fetch = async () => {
  sameProjectFetchCalls += 1;
  throw new Error("同项目蒙版同步不应发起复制请求");
};
try {
  const unchanged = await copyProjectScopedMasks({
    sourceProjectId: "same-draft-project",
    targetProjectId: "same-draft-project",
    flow: maskFlow,
  });
  assert.equal(sameProjectFetchCalls, 0);
  assert.equal(unchanged.targetProjectId, "same-draft-project");
  assert.equal(unchanged.flow, maskFlow);
} finally {
  globalThis.fetch = originalFetch;
}
console.log("  ✓ 同一初始草稿的未同步修改保留蒙版且不发起复制请求");

let freshCopyPayload: Record<string, unknown> | null = null;
globalThis.fetch = async (_input, init) => {
  freshCopyPayload = JSON.parse(String(init?.body)) as Record<string, unknown>;
  return Response.json({
    targetProjectId: "server-issued-backup",
    masks: [{
      sourceUrl: "/api/files/source-mask.png",
      targetUrl: "/api/files/fresh-mask.png",
      nodeId: "mask-node",
    }],
  });
};
try {
  const copied = await copyProjectScopedMasks({
    sourceProjectId: "mask-source-project",
    createFreshTarget: true,
    flow: maskFlow,
  });
  assert.equal(freshCopyPayload?.createTarget, true);
  assert.equal(freshCopyPayload?.targetProjectId, undefined);
  assert.equal(copied.targetProjectId, "server-issued-backup");
} finally {
  globalThis.fetch = originalFetch;
}
console.log("  ✓ 本机备份的目标项目 ID 由服务端分配，不能探测任意项目 ID");

let abandonSnapshot = tab({
  id: "abandon-tab",
  projectId: "abandon-draft",
  lifecycle: "initial_draft",
  revision: 4,
  draftSyncedRevision: 2,
  draftRevision: 1,
});
let abandonSyncCalls = 0;
const settledForAbandon = await settleInitialDraftBeforeAbandon(
  abandonSnapshot.id,
  () => abandonSnapshot,
  async (latest) => {
    abandonSyncCalls += 1;
    abandonSnapshot = {
      ...latest,
      draftSyncedRevision: latest.revision,
      draftRevision: (latest.draftRevision ?? 0) + 1,
    };
    return true;
  },
  () => false,
);
assert.equal(abandonSyncCalls, 1);
assert.equal(settledForAbandon?.draftSyncedRevision, 4);
assert.equal(settledForAbandon?.draftRevision, 2);
assert.equal(await settleInitialDraftBeforeAbandon(
  abandonSnapshot.id,
  () => abandonSnapshot,
  async () => false,
  () => false,
), abandonSnapshot);
console.log("  ✓ 放弃草稿前会收口最新编辑并使用同步后的 revision");

let barrierCalls = 0;
const unregisterBarrier = registerInitialDraftSaveBarrier(async (target) => {
  barrierCalls += 1;
  assert.equal(target.projectId, serverOnly.id);
});
await waitForInitialDraftSyncBeforeFormalSave({
  tabId: "tab-server",
  projectId: serverOnly.id,
  documentEpoch: 0,
});
unregisterBarrier();
await waitForInitialDraftSyncBeforeFormalSave({
  tabId: "tab-server",
  projectId: serverOnly.id,
  documentEpoch: 0,
});
assert.equal(barrierCalls, 1);
console.log("  ✓ 正式保存会等待已注册的初始草稿同步屏障");

// 决策 4（A）：冷启动不再自动创建页签——本段需要一个真实页签承接服务端草稿回写。
useFlowStore.getState().createBlankTab();

const formalDraft = draft({ revision: 5, name: "保存边界草稿" });
const activeBeforeFormalSave = selectActiveDocument(useFlowStore.getState());
assert.equal(applyServerInitialDraftToTab(activeBeforeFormalSave.id, formalDraft, {
  dirty: true,
  localDocumentRevision: 1,
}), true);
let formalSavePayload: Record<string, unknown> | null = null;
globalThis.fetch = async (_input, init) => {
  formalSavePayload = JSON.parse(String(init?.body)) as Record<string, unknown>;
  return Response.json({ error: "forced failure" }, { status: 503 });
};
try {
  assert.equal(await useFlowStore.getState().saveProject(), false);
  const failed = selectActiveDocument(useFlowStore.getState());
  assert.equal(projectTabLifecycle(failed), "initial_draft");
  assert.equal(failed.projectId, formalDraft.id);
  assert.equal(failed.draftRevision, formalDraft.revision);

  globalThis.fetch = async (_input, init) => {
    formalSavePayload = JSON.parse(String(init?.body)) as Record<string, unknown>;
    return Response.json({ ok: true });
  };
  assert.equal(await useFlowStore.getState().saveProject(), true);
  const saved = selectActiveDocument(useFlowStore.getState());
  assert.equal(formalSavePayload?.expectedDraftRevision, formalDraft.revision);
  assert.equal(saved.projectId, formalDraft.id);
  assert.equal(projectTabLifecycle(saved), "saved");
} finally {
  globalThis.fetch = originalFetch;
}
console.log("  ✓ 正式保存失败保留初始草稿，成功才以同一 ID 原子提升");

const conflictLocal = tab({
  ...maskLocal,
  id: "conflict-local-tab",
  projectId: "conflict-draft",
  lifecycle: "initial_draft",
  dirty: true,
  revision: 3,
  draftRevision: 1,
  draftSyncedRevision: 1,
});
useFlowStore.setState({ tabs: [conflictLocal], activeTabId: conflictLocal.id, viewer: null });
const copiedBackupFlow = {
  ...persistedWorkflowForProjectTab(conflictLocal),
  nodes: persistedWorkflowForProjectTab(conflictLocal).nodes.map((node) => node.data.kind === "image-generator"
    ? { ...node, data: { ...node.data, mask: "/api/files/backup-mask.png" } }
    : node),
};
assert.equal(applyServerInitialDraftToTab(conflictLocal.id, draft({ id: "conflict-draft" }), {
  preserveReplacedAsBackup: { projectId: "backup-project", flow: copiedBackupFlow },
}), true);
const backup = useFlowStore.getState().tabs.find((candidate) => candidate.projectId === "backup-project");
assert.ok(backup);
assert.equal(projectTabLifecycle(backup), "local");
assert.equal(backup.nodes[0].data.kind, "image-generator");
if (backup.nodes[0].data.kind !== "image-generator") throw new Error("unexpected backup node kind");
assert.equal(backup.nodes[0].data.mask, "/api/files/backup-mask.png");
console.log("  ✓ 采用云端冲突版本时，本机备份使用独立项目 ID 与复制后的蒙版");

const savedPlaceholder = tab({
  id: "saved-placeholder-tab",
  projectId: "saved-placeholder-project",
  lifecycle: "saved",
  hasBeenPersisted: true,
  saveState: "saved",
});
useFlowStore.setState({ tabs: [savedPlaceholder], activeTabId: savedPlaceholder.id, viewer: null });
const freshInitial = createFreshLocalTabForInitialDraft(savedPlaceholder.id);
assert.ok(freshInitial);
assert.notEqual(freshInitial.projectId, savedPlaceholder.projectId);
assert.ok(useFlowStore.getState().tabs.some((candidate) => candidate.id === savedPlaceholder.id));
assert.equal(useFlowStore.getState().activeTabId, freshInitial.id);
console.log("  ✓ 服务器无草稿时为初始项目分配新 ID，且不覆盖已保存页签");

const projectTabsSource = readFileSync(
  new URL("../src/components/panels/ProjectTabs.tsx", import.meta.url),
  "utf8",
);
// 2026-09-25 第 6 条：关闭页签不再有「二次确认放弃」流程——有改动先自动保存再关，
// 空白且无改动直接关，且不弹任何确认/警告（专用放弃流程仍保留给 InitialDraftWorkspace 的冲突处理）。
assert.match(projectTabsSource, /await state\.saveTabById\(latestTab\.id\)/);
assert.match(projectTabsSource, /latestTab\.dirty && !pristine && !latestTab\.readOnly/);
assert.doesNotMatch(projectTabsSource, /window\.(confirm|alert)/);
assert.doesNotMatch(projectTabsSource, /再次确认放弃/);
console.log("  ✓ 关闭页签先自动保存再关，且不弹二次确认");

const flowStoreSource = readFileSync(
  new URL("../src/store/flowStore.ts", import.meta.url),
  "utf8",
);
assert.match(flowStoreSource, /tab\.draftRevision \?\? ""/);
assert.match(flowStoreSource, /tab\.draftSyncedRevision \?\? ""/);
assert.match(flowStoreSource, /tab\.draftCreatedAt \?\? ""/);
console.log("  ✓ 云端同步元数据变化会触发本机会话分片持久化");

const initialDraftWorkspaceSource = readFileSync(
  new URL("../src/initialDraft/InitialDraftWorkspace.tsx", import.meta.url),
  "utf8",
);
assert.match(initialDraftWorkspaceSource, /清除草稿并重新开始/);
assert.match(initialDraftWorkspaceSource, /clearDraftAndRestart/);
assert.match(initialDraftWorkspaceSource, /clearProjectTabSessionStorage/);
assert.match(initialDraftWorkspaceSource, /setClearDraftDialogOpen\(true\)/);
console.log("  ✓ 错误态阻断页提供清除草稿自救按钮，经 AlertDialog 二次确认后清理本地并重建");

const templateLaunchSource = readFileSync(
  new URL("../src/lib/templateLaunch.ts", import.meta.url),
  "utf8",
);
function launchModeTemplate(kinds: string[]): Pick<WorkflowTemplate, "flow"> {
  return {
    flow: {
      nodes: kinds.map((kind, index) => ({
        id: `node-${index}`,
        data: kind === "image"
          ? { kind, outputImages: [] }
          : kind === "text"
            ? { kind, text: "示例文本" }
            : { kind },
      })),
      edges: [],
    },
  } as unknown as Pick<WorkflowTemplate, "flow">;
}
assert.equal(inferTemplateLaunchMode(launchModeTemplate(["image"])), "upload");
assert.equal(inferTemplateLaunchMode(launchModeTemplate(["text"])), "text");
assert.equal(inferTemplateLaunchMode(launchModeTemplate(["result"])), "default");
// 2026-09-25 决策 3：模板封面墙随「内置模板」Tab 一起下线
// （BUILTIN_TEMPLATE_COVERS 已删除，public/assets/project-center/templates/*.webp 留档）。
assert.match(templateLaunchSource, /projectTabLifecycle\(active\) !== "initial_draft"/);
assert.match(templateLaunchSource, /commitDocumentMutation\(/);
assert.match(templateLaunchSource, /projectId: active\.projectId/);
console.log("  ✓ 模板落地模式（upload/text/default）与内置封面资源保持有效");

// ---------- R-91：生产打开路径的版本闸 + 惰性迁移 ----------

/** v7 项目文档：带生成字段与 v7 prompt 边（v8 判定非法）。 */
function v7OpenPathFlow(): Record<string, unknown> {
  return {
    schemaVersion: 7,
    nodes: [
      {
        id: "t-v7",
        type: "text",
        position: { x: 0, y: 0 },
        data: { kind: "text", label: "提示词", status: "idle", text: "白色风衣", promptVariantId: "v7-variant", modelId: "gpt-5.3" },
      },
      {
        id: "i-v7",
        type: "image",
        position: { x: 380, y: 0 },
        data: {
          kind: "image",
          label: "草图",
          status: "success",
          outputImages: ["/api/files/kept.png"],
          modelId: "gemini-3.1-flash-image",
          aspectRatio: "3:4",
          batchSize: 2,
        },
      },
    ],
    edges: [{ id: "e-v7", source: "t-v7", target: "i-v7", sourceHandle: "prompt", targetHandle: "prompt" }],
  };
}

function openPathTab(overrides: Partial<ProjectTab> = {}): ProjectTab {
  return tab({ id: "tab-open-path", projectId: "project-open-path", ...overrides });
}

function nodeDataOf(projectTab: ProjectTab, index: number): Record<string, unknown> {
  return projectTab.nodes[index]?.data as unknown as Record<string, unknown>;
}

console.log("生产打开路径版本闸测试");

const openPlaceholder = openPathTab();
useFlowStore.setState({ tabs: [openPlaceholder], activeTabId: openPlaceholder.id, viewer: null });

assert.throws(
  () => useFlowStore.getState().openFlowTab({
    projectId: "p-v9",
    projectName: "更高版本项目",
    flow: { schemaVersion: 9, nodes: [], edges: [] },
  }),
  DocumentFlowVersionError,
  "schemaVersion 9 的项目必须拒绝打开",
);
assert.equal(
  useFlowStore.getState().tabs.some((candidate) => candidate.projectId === "p-v9"),
  false,
  "被拒绝的文档不得留下页签",
);
assert.equal(useFlowStore.getState().tabs.length, 1);
assert.equal(useFlowStore.getState().activeTabId, openPlaceholder.id);
console.log("  ✓ 更高版本项目 fail-closed，且不改动现有页签");

assert.throws(
  () => useFlowStore.getState().openFlowTab({ projectId: "p-v6", projectName: "旧版本", flow: { schemaVersion: 6, nodes: [], edges: [] } }),
  DocumentFlowVersionError,
);
assert.throws(
  () => useFlowStore.getState().openFlowTab({ projectId: "p-none", projectName: "无版本", flow: { nodes: [], edges: [] } }),
  DocumentFlowVersionError,
);
assert.throws(
  () => useFlowStore.getState().openFlowTab({
    projectId: "p-illegal-edge",
    projectName: "非法边",
    flow: {
      schemaVersion: 8,
      nodes: [
        { id: "a", type: "image", position: { x: 0, y: 0 }, data: { kind: "image", label: "a", status: "idle", outputImages: [] } },
        { id: "b", type: "image", position: { x: 1, y: 0 }, data: { kind: "image", label: "b", status: "idle", outputImages: [] } },
      ],
      edges: [{ id: "e", source: "a", target: "b", targetHandle: "reference", data: {} }],
    },
  }),
  DocumentGraphError,
);
console.log("  ✓ v6/无版本号/非法边项目一律拒绝");

useFlowStore.getState().openFlowTab({ projectId: "p-v7", projectName: "v7 项目", flow: v7OpenPathFlow() });
const openedV7Tab = useFlowStore.getState().tabs.find((candidate) => candidate.projectId === "p-v7");
assert.ok(openedV7Tab);
assert.deepEqual(openedV7Tab.edges, [], "v7 的 prompt 边在 v8 非法，打开时必须丢弃");
assert.deepEqual(openedV7Tab.nodes.map((node) => node.data.kind), ["text", "image"]);
assert.equal(nodeDataOf(openedV7Tab, 1).modelId, undefined, "v7 生成字段必须在打开时剥离（M8）");
assert.equal(nodeDataOf(openedV7Tab, 1).batchSize, undefined);
assert.deepEqual(nodeDataOf(openedV7Tab, 1).outputImages, ["/api/files/kept.png"], "产物零丢失（M2）");
assert.deepEqual(nodeDataOf(openedV7Tab, 0).text, "白色风衣");
const savedV7Tab = persistedWorkflowForProjectTab(openedV7Tab);
assert.equal(savedV7Tab.schemaVersion, 8, "v7 项目首次保存必须写回迁移结果");
for (const node of savedV7Tab.nodes) {
  assert.ok(!("modelId" in (node.data as Record<string, unknown>)), "落盘产物不得残留未迁移字段");
}
console.log("  ✓ v7 项目打开即惰性迁移，首次保存写回 v8");

const loadPlaceholder = openPathTab({ id: "tab-load", projectId: "project-load" });
useFlowStore.setState({ tabs: [loadPlaceholder], activeTabId: loadPlaceholder.id, viewer: null });
useFlowStore.getState().loadFlow({ projectId: "p-v7-load", projectName: "v7 载入", flow: v7OpenPathFlow() });
const loadedTab = selectActiveDocument(useFlowStore.getState());
assert.equal(loadedTab.projectId, "p-v7-load");
assert.deepEqual(loadedTab.edges, []);
assert.equal(nodeDataOf(loadedTab, 1).modelId, undefined);
assert.throws(
  () => useFlowStore.getState().loadFlow({ projectId: "p-v9-load", projectName: "更高版本", flow: { schemaVersion: 9, nodes: [], edges: [] } }),
  DocumentFlowVersionError,
);
console.log("  ✓ loadFlow 与 openFlowTab 共用同一读取入口");

const draftPlaceholder = openPathTab({ id: "tab-draft-gate", projectId: "project-draft-gate" });
useFlowStore.setState({ tabs: [draftPlaceholder], activeTabId: draftPlaceholder.id, viewer: null });
assert.throws(
  () => applyServerInitialDraftToTab(draftPlaceholder.id, {
    ...draft({ id: "draft-v9" }),
    flow: { schemaVersion: 9, nodes: [], edges: [] } as never,
  }),
  DocumentFlowVersionError,
);
assert.equal(selectActiveDocument(useFlowStore.getState()).projectId, "project-draft-gate", "被拒绝的草稿不得改写页签");
assert.equal(
  applyServerInitialDraftToTab(draftPlaceholder.id, {
    ...draft({ id: "draft-v7" }),
    flow: v7OpenPathFlow() as never,
  }),
  true,
);
const migratedDraftTab = selectActiveDocument(useFlowStore.getState());
assert.equal(migratedDraftTab.projectId, "draft-v7");
assert.deepEqual(migratedDraftTab.edges, []);
assert.equal(nodeDataOf(migratedDraftTab, 1).modelId, undefined);
console.log("  ✓ 初始草稿走同一版本闸（v9 拒绝、v7 打开即迁）");

const templatePlaceholder = openPathTab({ id: "tab-template-gate", projectId: "project-template-gate" });
useFlowStore.setState({ tabs: [templatePlaceholder], activeTabId: templatePlaceholder.id, viewer: null });
const launchedV7 = launchTemplateInNewTab({
  schemaVersion: 7,
  id: "tpl-v7",
  name: "v7 模板",
  description: "",
  createdAt: "2026-08-13T00:00:00.000Z",
  flow: v7OpenPathFlow(),
} as unknown as WorkflowTemplate);
const launchedTab = useFlowStore.getState().tabs.find((candidate) => candidate.id === launchedV7.tabId);
assert.ok(launchedTab);
assert.equal(launchedTab.dirty, true);
assert.deepEqual(launchedTab.edges, []);
assert.equal(nodeDataOf(launchedTab, 1).modelId, undefined, "模板 flow 也必须经读取闸投影");
assert.throws(
  () => launchTemplateInNewTab({
    schemaVersion: 9,
    id: "tpl-v9",
    name: "v9 模板",
    description: "",
    createdAt: "2026-08-13T00:00:00.000Z",
    flow: { schemaVersion: 9, nodes: [], edges: [] },
  } as unknown as WorkflowTemplate),
  DocumentFlowVersionError,
);
console.log("  ✓ 模板 flow 走同一版本闸（v7 迁移、v9 拒绝）");
