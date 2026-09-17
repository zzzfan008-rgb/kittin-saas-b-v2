# 方案：移除参考图「角色」体系

- 日期: 2026-09-17
- 作者: architect
- 需求来源: `docs/requests/2026-09-17-remove-reference-roles.md`
- 关联特性(将被废止): `specs/001-garment-reference-roles/`
- 状态: 已实施（R-01~R-05 全部合入 main；用户裁定见 §10；实施修正见 §11）

---

## 0. TL;DR

角色体系是一个横跨「类型 → Store → UI → 提示词渲染 → 准入 → 评估/发布哈希 → 持久化/迁移 → 模板 → 测试/e2e」的全栈契约。移除它不是删一个文件,而是改一条**已被多个已评审 artifact 哈希锚定**的语义链。

本方案的核心取舍:
- **参考图保留「顺序」、抛弃「角色」**。顺序语义(AGENTS.md §4 `reference-image ordering`)继续由边顺序 + `order` 索引承担,Prompt 中只写「按顺序的参考图列表 + 中性说明」,不再写「职责/禁止影响」。
- **兼容优先,不迁移旧数据**。读取旧项目时**容忍并忽略**所有 `imageRole` / `roleNeedsConfirmation` / 边 `data.role` 字段;不炸、不报错、不写回。旧项目照常打开、照常生成。
- **角色语义在评估/发布链中全部失效**。现有 prompt release registry(`docs/ai/evaluation/prompt-release-registry.json`)当前 `releases: []`(空),因此**不需要 bump 任何哈希版本,也不存在既有 release 失效问题**——这是本方案能低成本推进的关键事实。
- **分 5 阶段**推进,每阶段结束 `tsc -b` + `npm run test` 必须保持绿;任何阶段出问题可单独回滚该阶段。

---

## 1. 模块级影响面

> 范围限定:仅列**真正持有角色语义**的模块;仅 import 类型用于其它目的的(如 `NodeKind`)不算。

### 1.1 契约层(单一事实来源)

| 文件 | 角色符号 | 影响 |
|---|---|---|
| `src/types/workflow.ts` | `REFERENCE_ROLE_VALUES`, `ReferenceRole`, `LEGACY_IMAGE_ROLE_VALUES`, `LegacyImageRole`, `ImageInputRole`, `DEDICATED_REFERENCE_HANDLE_ROLES`, `referenceRoleForTargetHandle()`, `isReferenceRole()`, `normalizeImageInputReferenceRole()`, `ReferenceEdgeData`, `resolveReferenceEdgeData()`, `ReferenceImageInput.role`, `ReferenceImageInput.roleNeedsConfirmation`, `ReferenceImageEvidence`(继承), `ReferenceImageSource.role`, `ReferenceImageSource.roleNeedsConfirmation`, `ImageInputNodeData.imageRole`, `ImageInputNodeData.roleNeedsConfirmation`, `PersistedWorkflowEdge.data(=ReferenceEdgeData)`, `NodeExecution.upstream[].referenceRole`, `NodeExecution.upstream[].roleNeedsConfirmation`, `NodeExecution.inputReferences` 中的 role/needsConfirmation | 全部要动。这是改动最大、最危险的文件。 |

### 1.2 前端领域层

| 文件 | 角色符号 | 处置 |
|---|---|---|
| `src/lib/referenceRoles.ts` | 整个文件(角色目录:label/responsibility/forbiddenInfluence/specificity) | **整体删除** |
| `src/lib/referenceInputs.ts` | `ReferenceInputRoleState`, `ReferenceInputIssueCode` 中的 `reference-role-invalid`/`reference-role-unconfirmed`, `referenceInputIssues()`, `orderedReferenceInputs()`, `referenceDataUrls()`, `referenceInputsTransportError()`, `referenceInputsError()` | **整体改写**:删掉「角色是否合法/是否确认」校验,只保留「数组结构 + order 连续 + assetSha256 格式 + sourceNodeId 格式」校验;`referenceInputsError()` 不再消费 `referenceInputIssues` |
| `src/lib/providerPromptRenderer.ts` | `PROVIDER_PROMPT_ROLE_WRAPPERS`, `PROVIDER_PROMPT_RENDERER_CONTRACT.roleCatalog/roleWrappers/pendingRoleSuffix`, `PROVIDER_PROMPT_RENDERER_HASH`, `ProviderPromptReference.role/roleNeedsConfirmation`, `ProviderPromptRenderInput.references`, `referenceRolePrompt()`, `renderProviderPrompt()` | **整体改写**:模板见 §5;版本与哈希必须改(见 §4 D3) |
| `src/lib/promptRunAdmission.ts` | `PromptRunReferenceSnapshot.role/roleNeedsConfirmation`, `promptRunReferenceSnapshotsFromGraph()`, `PromptRunAdmissionDecision.code` 中三个角色相关码, `promptRunReferenceRoleProfile()`, `evaluatePromptRunCompatibility()` 中角色校验段, `evaluatePromptRunAdmission()` 中 `variant.requiredRoles` 校验段 | **改写**:删除角色校验分支,保留结构校验 |
| `src/lib/promptEvaluation.ts` | `REFERENCE_ROLE_ORDER`(含 `"mask"`), `canonicalReferenceRoleSet()`, `canonicalReferenceRoleProfile()`, `promptEvaluationUnitKey()` 中 `referenceRoleProfile` 字段, `PROMPT_SCORE_WEIGHTS.referenceRoleFidelity` | **改写**:删除 role profile 与该评分维度(见 §4 D3、§6 测试) |
| `src/lib/promptEvaluationRelease.ts` | `referenceRoleProfile` 字段在 release vector 里 | **改写**:从 release vector 移除(见 §4 D3) |
| `src/lib/promptEvaluationReleaseRegistry.ts` | release registry 中 `referenceRoleProfile` 字段 | **改写**:registry schema 改(见 §4 D3) |
| `src/lib/garmentPromptPresets.ts` | `PromptReferenceRole`, `REQUIRED_EDIT_ROLES`, `requiredRoles` 字段, `GPT_IMAGE_2_MASK_VARIANT.requiredRoles` | **改写**:删除 `requiredRoles` 字段及其全部使用 |
| `src/lib/documentSnapshot.ts` | `DocumentNodeData.image-input.imageRole/roleNeedsConfirmation`, `createDocumentNodeData()` 中相应拷贝 | **改写**:Document 字段删除(读取旧数据时忽略,见 §4 D2) |
| `src/lib/referenceEvidence.ts` | `HistoricalReferenceEvidence`(含 role), `normalizeReferenceImageEvidence()` | **改写**:历史证据中的 role 字段不再写入也不展示(见 §4 D2、§6 测试) |

### 1.3 前端 UI 层

| 文件 | 角色符号 | 处置 |
|---|---|---|
| `src/components/nodes/ReferenceRoleSummary.tsx` | 整组件(角色汇总 + 角色选择器 + 上移/下移) | **拆分**:角色选择器删除;上移/下移/删除交互保留,迁移为「参考图列表(按顺序)」组件(命名待定,建议 `ReferenceImageList.tsx`) |
| `src/components/nodes/ImageInputNode.tsx` | 「新连线默认角色」选择器、待确认徽标、`normalizeImageInputReferenceRole()`、`REFERENCE_ROLE_CATALOG` 渲染 | **删除该选择器整块**;参考图卡片仅保留上传/查看/删除/排序(排序在目标节点侧) |
| `src/components/nodes/ModelControls.tsx` | `ReferenceRoleSummary` 嵌入、`updateEdgeReferenceRoleInTab` 调用 | **改写**:替换为新的列表组件,删除角色相关 props |
| `src/components/nodes/MaskRedrawNode.tsx` | `ReferenceRoleSummary` 嵌入、`promptRunReferenceRoleProfile()` 用于预览 | **改写**:同上 |
| `src/components/panels/InspectorPanel.tsx` | 「每条入边的参考角色必须确认」文案、`hasUnconfirmedReferences` prop、`ReferenceRoleSummary` 嵌入、`updateEdgeReferenceRole` 调用 | **改写**:文案删除,组件替换,不再传角色状态 |
| `src/components/ImageViewer.tsx` | `getReferenceRoleDefinition()` 用于「参考图 N:<角色> · <状态>」caption | **改写**:caption 只显示「参考图 N」与来源节点,不再显示角色 |
| `src/store/flowStore.ts` | `updateEdgeReferenceRole()`, `updateEdgeReferenceRoleInTab()`, `edgeDataWithReferenceRole()`, 新建 image-input 节点时 `imageRole:"generic", roleNeedsConfirmation:true`, `resolveReferenceEdgeData()` 用于 onConnect | **改写**:删除两个 action;`onConnect` 不再写 `data.role`;新建 image-input 不再写 `imageRole/roleNeedsConfirmation` |
| `src/hooks/usePromptRunAdmission.ts` | `PromptRunBrowserReference.role/roleNeedsConfirmation`, `promptRunBrowserReferencesFromGraph()` | **改写**:不再返回 role 字段(仅顺序、来源、可用性) |

### 1.4 后端

| 文件 | 角色符号 | 处置 |
|---|---|---|
| `server/lib/referenceRolePrompt.ts` | re-export `referenceRolePrompt` | **整体删除**(调用方改用改写后的 providerPromptRenderer) |
| `server/lib/workflowSchema.ts` | `WorkflowReferenceRoleValidationError`, `WorkflowReferenceRoleValidationField`, `IMAGE_ROLES`, `validateReferenceEdgeData()`, `resolveReferenceEdgeData()` 调用,`imageRole`/`roleNeedsConfirmation` 校验段 | **改写**:删除角色校验类与函数;节点 `imageRole` 与边 `data.role` 改为「存在即忽略」(见 §4 D2);`roleNeedsConfirmation` 同样容忍 |
| `server/engine/dag.ts` | `resolveExecutionReferenceRole()`, `referenceRoleForTargetHandle()` 调用,`upstream[].referenceRole/roleNeedsConfirmation` 字段写入,`inputReferences[].role` 写入,`assertPromptRunAdmissions()` 中 role 传入 | **改写**:`upstream` 不再带 role 字段;`inputReferences` 不再带 role;`assertPromptRunAdmissions` 改传新 snapshot |
| `server/engine/runner.ts` | `fallbackReferenceSources()` 填 `role:"generic", roleNeedsConfirmation:true`, fabric-recolor 追加 `role:"fabric", roleNeedsConfirmation:false`, mask guide 追加 `role:"generic", roleNeedsConfirmation:false`, `resolveReferenceInputs()` 拷贝 role | **改写**:不再写 role;mask guide 仅以 `sourceNodeId=<nodeId>:mask-guide` 标识(已经是现有机制) |
| `server/engine/runQueue/promptAdmission.ts` | `runtimeUserReferenceInputs()` 中 mask guide 检查 `guide?.role !== "generic"`, admission 调用传 role | **改写**:mask guide 判断改为「`sourceNodeId` 匹配且位于末尾」即可,不再查 role;admission snapshot 不再含 role |
| `server/engine/runQueue/lifecycle.ts` | 持久化 `referenceEvidence` 时写 role/roleNeedsConfirmation | **改写**:不再写这两个字段;读取时(见 referenceEvidence.ts)容忍 |
| `server/engine/runQueue/persist.ts` | 运行时重建 references 时填 `role:"generic"`/`roleNeedsConfirmation: explicitRole === undefined \|\| upstream.roleNeedsConfirmation !== false` | **改写**:不再写 role/needsConfirmation |
| `server/engine/runQueue/evaluation.ts` | `assertEvaluationRuntimeReferenceBinding()` 中 `inputReferences[].role` 写入 | **改写**:不再写 role;evaluation unit key 移除 roleProfile(见 §4 D3) |
| `server/engine/runQueue/worker.ts` | beforeProviderCall 中 snapshot 传 role | **改写**:不再传 role |
| `server/lib/evaluationEvidence.ts` | `EvaluationReferenceEvidenceInput.role`, `canonicalRoleSet()`, `validateReferences()` 中 `role !== "mask" && !isReferenceRole(role)` 与 `roleNeedsConfirmation !== false` 校验, `validateReferences()` 末尾 `expectedProfile vs actualProfile` 比对, `PromptEvaluationUnit.referenceRoleProfile`, 评分维度 `referenceRoleFidelity` | **改写**:role 字段删除;profile 比对删除;评分维度删除(见 §4 D3) |
| `server/lib/evaluationPromotion.ts` | `referenceRoleProfile` 参与 promotion target/release vector | **改写**:从所有哈希与 canonical 比对中移除 |
| `server/lib/evaluationReleaseBundle.ts` | `contract.referenceRoleProfile` 与 `receipt.unit.referenceRoleProfile` 比对 | **改写**:删除该比对 |
| `server/lib/evaluationAuthorizationLedger.ts` | `evaluationAuthorizationTargetFromPlan()` 中 `promptRunReferenceRoleProfile()` 调用,授权 envelope 含 `referenceRoleProfile` | **改写**:envelope 不再含 roleProfile;`evaluationUnitKey` 哈希输入移除该字段(见 §4 D3) |
| `server/lib/evaluationReviewLedger.ts` | 评分维度 `referenceRoleFidelity` | **改写**:评分维度删除 |
| `server/routes/templates.ts` | `confirmedReferenceEdgeData()` 及全部 `imageRole:"pose_composition"/identity/garment_full/background/styling_only/generic, roleNeedsConfirmation:false` 字面量 | **改写**:删除 helper 与所有字面量;内置模板的 image-input 节点不再写 imageRole;边 data 不再写 role |
| `server/routes/runPlan.ts` | `WorkflowReferenceRoleValidationError` catch 分支,`referenceRoleIssueReason()`, `mapSubmittedReferenceRoleError()` | **改写**:删除这些函数与分支(workflowSchema 不再抛该错误) |
| `server/routes/generate.ts` | `admissionReferences`/`inputReferences` 中 `role`/`roleNeedsConfirmation` 字段 | **改写**:不再写这两个字段;`accessReferences` 中 role 不再携带 |
| `server/providers/apiyi.ts` | `referenceData()` 中 `referenceInputIssues(...).find(issue => issue.code === "reference-role-unconfirmed")` 拦截 | **改写**:删除该拦截(角色未确认不再是 Provider 边界错误) |

### 1.5 规格与历史(不动)

- `specs/001-garment-reference-roles/`(spec/plan/data-model/contracts/tasks/research/quickstart/checklists):**整体保留**,在 `spec.md` 顶部加一行 status 标注 `Status: Deprecated by 2026-09-17-remove-reference-roles`(见 §4 D4)。**不改写历史内容**,因为 AGENTS.md §7「Historical audit details belong in dated documents」。
- `docs/ai/apiyi/consultations/2026-09-03-reference-role-*.json`:**不动**(历史 receipt)。

### 1.6 依赖路径概要

改动的横向传播链(谁删了会断什么):

```
src/types/workflow.ts
  ├─> src/lib/referenceRoles.ts                       [删除]
  ├─> src/lib/referenceInputs.ts                      [改写]
  ├─> src/lib/providerPromptRenderer.ts               [改写]
  │     └─> server/lib/referenceRolePrompt.ts         [删除]
  ├─> src/lib/promptRunAdmission.ts                   [改写]
  │     └─> src/hooks/usePromptRunAdmission.ts        [改写]
  │     └─> server/engine/runQueue/promptAdmission.ts [改写]
  │     └─> server/engine/dag.ts                      [改写]
  ├─> src/lib/promptEvaluation.ts                     [改写]
  │     └─> src/lib/promptEvaluationRelease.ts        [改写]
  │     └─> src/lib/promptEvaluationReleaseRegistry.ts[改写]
  │     └─> server/lib/evaluationAuthorizationLedger.ts[改写]
  │     └─> server/lib/evaluationPromotion.ts         [改写]
  │     └─> server/lib/evaluationReleaseBundle.ts     [改写]
  │     └─> server/lib/evaluationReviewLedger.ts      [改写]
  ├─> src/lib/garmentPromptPresets.ts                 [改写:删 requiredRoles]
  │     └─> src/lib/promptRunAdmission.ts             [同步删 requiredRoles 检查]
  │     └─> server/lib/evaluationEvidence.ts          [同步删 requiredRoles 检查]
  ├─> src/lib/documentSnapshot.ts                     [改写]
  ├─> src/lib/referenceEvidence.ts                    [改写]
  ├─> src/store/flowStore.ts                          [改写:删 action/改 onConnect/改新建节点]
  ├─> src/components/nodes/ReferenceRoleSummary.tsx   [删除→新建 ReferenceImageList]
  ├─> src/components/nodes/ImageInputNode.tsx         [改写]
  ├─> src/components/nodes/ModelControls.tsx          [改写]
  ├─> src/components/nodes/MaskRedrawNode.tsx         [改写]
  ├─> src/components/panels/InspectorPanel.tsx        [改写]
  ├─> src/components/ImageViewer.tsx                  [改写]
  ├─> server/lib/workflowSchema.ts                    [改写]
  ├─> server/engine/runner.ts                         [改写]
  ├─> server/engine/runQueue/lifecycle.ts             [改写]
  ├─> server/engine/runQueue/persist.ts               [改写]
  ├─> server/engine/runQueue/evaluation.ts            [改写]
  ├─> server/engine/runQueue/worker.ts                [改写]
  ├─> server/routes/templates.ts                      [改写]
  ├─> server/routes/runPlan.ts                        [改写]
  ├─> server/routes/generate.ts                       [改写]
  └─> server/providers/apiyi.ts                       [改写]
```

模块边界检查:本改动**不引入新的跨层 import**,只是把现有 import 的角色字段裁掉。理论上**不会新增 dependency-cruiser 违规**,也不会新增循环依赖。动工后每个阶段用 `npx depcruise --config .dependency-cruiser.cjs src server scripts e2e` 实证。

---

## 2. 分阶段移除顺序

每阶段结束必须 `npm run lint` + `tsc -b`(或 `npm run check`)+ `npm run test` 全绿。原则上 1→2→3→4→5 顺序串行;**阶段 2 与阶段 3 的 UI 部分可并行**(不同人),但合并前必须 rebase 到同一 base 并各跑一次门禁。

### 阶段 0(准备,1 个 PR)

- 跑 `npm run docs:apiyi:kb:check`(已通过,snapshot `2026-09-02T12-55-56.022Z-a90bb31d7f8c13df`,2559 页)。
- 跑 `npm run docs:apiyi:search -- --query "参考图 顺序 角色 多图 编辑"` 把命中的 FLUX image-edit / GPT Image 2 / Seedream / Gemini 多图编辑页留档,作为后续 §5 提示词改写的措辞依据。
- 跑一次基线:`npm run check`、`npm run test`、`npm run build`、`git diff --check`、`ast-grep scan --config sgconfig.yml src server scripts e2e`、`npx depcruise --config .dependency-cruiser.cjs src server scripts e2e`,把结果记入本阶段 PR。
- 在 `specs/001-garment-reference-roles/spec.md` 顶部加 deprecated 标注(不动正文)。

**产出**:baseline 报告 + spec 标注。无代码改动。

### 阶段 1(契约与类型,1 个 PR)

仅改 `src/types/workflow.ts`,**保留所有符号导出但打 `@deprecated` JSDoc**;不删字段,不改运行时行为。

- `ReferenceEdgeData` 改为 `Record<string, unknown>`(角色字段全部 optional)。
- `ImageInputNodeData.imageRole` 改 `imageRole?: unknown`, `roleNeedsConfirmation?: unknown`。
- `ReferenceImageInput.role/roleNeedsConfirmation` 改 optional。
- `ReferenceImageSource.role/roleNeedsConfirmation` 改 optional。
- `NodeExecution.upstream[].referenceRole/roleNeedsConfirmation` 改 optional。
- `REFERENCE_ROLE_VALUES`、`ReferenceRole` 等保留但 `@deprecated`。
- `PersistedWorkflowEdge.data` 类型改为 `Record<string, unknown>`。
- `WORKFLOW_SCHEMA_VERSION` **不 bump**(读旧数据是容忍而非迁移)。

**验证**:`tsc -b` 绿 + `npm run test` 绿。此阶段故意不改运行时,只放宽类型。

**回滚**:revert 此 PR 即可,无数据迁移。

### 阶段 2(后端准入与 Provider 边界,1-2 个 PR)

- 改 `server/lib/workflowSchema.ts`:删除 `WorkflowReferenceRoleValidationError` 及其抛出点;节点 `imageRole` 与边 `data.role`/`roleNeedsConfirmation` 改为「存在即忽略」。
- 改 `server/engine/dag.ts`:删除 `resolveExecutionReferenceRole()`;`upstream`/`inputReferences` 不再带 role。
- 改 `server/engine/runner.ts`、`server/engine/runQueue/persist.ts`、`lifecycle.ts`、`worker.ts`、`evaluation.ts`、`promptAdmission.ts`:删除 role 字段写入与校验;mask guide 判断改只看 `sourceNodeId` 与位置。
- 改 `server/routes/runPlan.ts`、`generate.ts`:删除 role 相关错误映射与字段写入。
- 改 `server/providers/apiyi.ts`:删除 `reference-role-unconfirmed` 拦截。
- 改 `server/lib/evaluationAuthorizationLedger.ts`、`evaluationPromotion.ts`、`evaluationReleaseBundle.ts`、`evaluationEvidence.ts`、`evaluationReviewLedger.ts`:删除 role profile 与 `referenceRoleFidelity` 维度;`evaluationUnitKey` / `releaseVector` 哈希输入同步移除这些字段。

**验证**:全量绿 + `tests/run-queue.test.ts`、`tests/dag.test.ts`、`tests/prompt-run-admission.test.ts`、`tests/authorization.test.ts`、`tests/provider-contract.test.ts`、`tests/evaluation-*.test.ts` 中**角色断言全部删除**(见 §6 测试策略)。

**回滚**:revert。数据库不动。

### 阶段 3(前端领域 + UI,1-2 个 PR,可与阶段 2 并行由不同人做,但合并顺序在 2 之后)

- 删 `src/lib/referenceRoles.ts`、`src/components/nodes/ReferenceRoleSummary.tsx`。
- 新建 `src/components/nodes/ReferenceImageList.tsx`:展示顺序号、缩略图、来源节点、可用性;支持上移/下移/删除(沿用现有 `updateEdgeReferenceRole*` 之外的 store 排序机制,见 §5 与「待确认」)。
- 改 `src/store/flowStore.ts`:删 `updateEdgeReferenceRole/updateEdgeReferenceRoleInTab`;`onConnect` 不再写 `data.role`;新建 image-input 不再写 `imageRole/roleNeedsConfirmation`。
- 改 `src/lib/documentSnapshot.ts`:Document 字段删 `imageRole/roleNeedsConfirmation`(读取时容忍,见 §4 D2)。
- 改 `src/lib/referenceInputs.ts`、`promptRunAdmission.ts`、`promptEvaluation.ts`、`promptEvaluationRelease.ts`、`promptEvaluationReleaseRegistry.ts`、`garmentPromptPresets.ts`、`referenceEvidence.ts`、`providerPromptRenderer.ts`(见 §5 提示词重写规格)。
- 改 `src/hooks/usePromptRunAdmission.ts`、`src/components/nodes/ImageInputNode.tsx`、`ModelControls.tsx`、`MaskRedrawNode.tsx`、`src/components/panels/InspectorPanel.tsx`、`src/components/ImageViewer.tsx`。

**验证**:全量绿 + 1024/1280/1440 三档宽度的 e2e(`e2e/workbench.spec.ts`、`e2e/golden-path.spec.ts`、`e2e/initial-draft.spec.ts`)断言**参考图可增删排序**且**不出现角色选择器**;删 `e2e/reference-role-confirmation.spec.ts`(见 §6)。

**回滚**:revert。数据库不动。

### 阶段 4(模板与文档,1 个 PR)

- 改 `server/routes/templates.ts`:删 `confirmedReferenceEdgeData()` 与所有字面量;内置模板重写为「无角色」版本。
- 改 `src/lib/garmentPromptPresets.ts`:删 `requiredRoles` 字段,同步更新全部 variants。
- 删 `tests/fixtures/reference-role-workflows.ts` 与 `tests/reference-role-catalog.test.ts`、`tests/reference-role-summary.test.ts`(见 §6)。
- 更新 `docs/requests/2026-09-17-remove-reference-roles.md` 状态为「已完成方案,实施中」。

**验证**:全量绿 + 手动打开「内置模板」列表确认可加载、可实例化。

### 阶段 5(API易 receipt 与收尾,1 个 PR)

- 按 §7 跑 `npm run docs:apiyi:lookup -- --query "..." --paths <命中页> --receipt docs/ai/apiyi/consultations/2026-09-17-remove-reference-roles-final.json --decision "..."`,把本方案实施的精确 diff 与命中页 SHA-256 留档。
- 跑 `npm run docs:apiyi:guard -- --uncommitted`(若 `docs/ai/apiyi/change-scope.json` 命中本 diff)以通过本地门禁。
- 更新 `AGENTS.md`(仅在用户明确批准后):删除 §4 中关于「reference-image ordering」的角色化表述(保留 ordering 本身)。**注意:AGENTS.md 是项目宪法,本方案默认不改它;仅在用户明确要求时才动。**

**验证**:门禁全绿。

---

## 3. 数据/迁移策略(对应 D2)

### D2 结论:**容忍并忽略,不迁移、不写回**

理由:
- 既有数据库里 `projects.flow_json`、`generation_runs.input_references_json`、`templates.flow_json` 等字段**可能**包含旧角色值。这些字段类型是 JSON/TEXT,schema 层面无 CHECK 约束依赖角色枚举,因此**不需要 DB 迁移**。
- 读取路径(`workflowSchema.ts` / `documentSnapshot.ts` / `referenceEvidence.ts` / `flowStore.ts` 初始化)统一改为「遇到 `imageRole`/`roleNeedsConfirmation`/边 `data.role` 字段 → 忽略,不报错、不升级、不写入」。
- 写路径(新项目/新边)不再产生这些字段。旧字段随自然编辑逐渐被覆盖(用户改一次节点其它字段就会以新 shape 写回),**不需要主动迁移**。
- 历史 run 的 `referenceEvidence` 中已持久化的 role 字段**保留不删**(数据库行不动),仅在 UI 展示层(`ImageViewer.tsx`)忽略。

### 可机检等价物

- `server/lib/workflowSchema.ts` 增回归测试:构造含 `imageRole:"garment_full", roleNeedsConfirmation:false` 与边 `data:{role:"identity", roleNeedsConfirmation:false}` 的 v6 flow JSON,断言 `parsePersistedWorkflow()` **不抛错**且**返回对象中这两个字段被剥离**。
- `src/lib/documentSnapshot.ts` 增回归测试:含 role 字段的 `WorkflowNodeData` 输入 → `createDocumentSnapshot()` 输出不含 role 字段。
- `src/lib/referenceEvidence.ts` 增回归测试:含 role 的 history evidence 输入 → 输出 `HistoricalReferenceEvidence` 的 role 字段固定为 `"generic"`(或移除该字段,由方案 D4 定),`evidenceState` 为 `"legacy"`。

---

## 4. 类型与评估/发布哈希策略(对应 D3、D4)

### D3 结论:**不需要 bump 任何评估/发布哈希版本;现有 release 不失效**

关键事实(已实证):
- `docs/ai/evaluation/prompt-release-registry.json` 当前 `releases: []`(空)。
- 因此**没有任何已发布的 release** 携带含 role 的 `referenceRoleProfile`。
- `PROVIDER_PROMPT_RENDERER_HASH`(`src/lib/providerPromptRenderer.ts:63`)是**自哈希常量**,值随 `PROVIDER_PROMPT_RENDERER_CONTRACT` 内容变化。本方案会改 `roleCatalog`/`roleWrappers`/`pendingRoleSuffix` → **哈希必须重新计算并替换**,`PROVIDER_PROMPT_RENDERER_VERSION` 字符串同步 bump(如 `provider-prompt-renderer-v4`)。这会使得既有**未发布**的 evaluation attempt 全部变成 `version-drift`/`unverified`,这正是我们想要的效果(角色语义变了,旧评估不应再被复用)。
- `evaluationUnitKey` / `releaseVector` 哈希输入中移除 `referenceRoleProfile` 字段。**这是 breaking change**,但因为 registry 为空,不影响任何既有发布。
- 评分维度 `referenceRoleFidelity` 删除,`PROMPT_SCORE_WEIGHTS` 重新分配权重(见 §6 测试)。这同样是 breaking change,同样因 registry 为空而无后果。

**决策风险**:如果用户认为「未来可能基于角色语义做评估」,则 D3 的另一选项是「保留 `referenceRoleProfile` 字段但允许为空数组」。**本方案不推荐**,因为它把一个已死的语义留在评估契约里,违背「移除」的初衷。

### D4 结论:**保留最低限度的解析容忍,UI/提示词/准入完全不再使用**

- `REFERENCE_ROLE_VALUES`、`ReferenceRole`、`LEGACY_IMAGE_ROLE_VALUES`、`ImageInputRole` 等**类型符号保留**(打 `@deprecated`),供读取旧数据时做类型守卫。这是为了避免在 `workflowSchema.ts`/`documentSnapshot.ts`/`referenceEvidence.ts` 中散布 `as unknown` 强转。
- `resolveReferenceEdgeData()`、`normalizeImageInputReferenceRole()`、`referenceRoleForTargetHandle()`、`DEDICATED_REFERENCE_HANDLE_ROLES` **删除**——它们是「写入侧」的逻辑,不再需要。
- `isReferenceRole()` 保留(打 `@deprecated`),仅被 `referenceEvidence.ts` 读取旧 history 时用到。

---

## 5. 提示词重写规格(对应 D1)

### D1 结论:**按顺序的参考图列表 + 中性说明;每模型一个 wrapper;不再逐图写角色/职责/禁止影响**

### 5.1 改后 `providerPromptRenderer.ts` 契约(伪代码,供 backend 实现)

```ts
export const PROVIDER_PROMPT_RENDERER_VERSION = "provider-prompt-renderer-v4";

export const PROVIDER_PROMPT_RENDERER_CONTRACT = {
  version: PROVIDER_PROMPT_RENDERER_VERSION,
  separator: "\n",
  referenceListIntro: {
    "gpt-image-2":        { "mask-edit": "局部修改参考图:" },
    "gpt-image-2-vip":    { generate: "参考图:", edit: "参考图:" },
    "gemini-3.1-flash-image": { generate: "参考图:", edit: "参考图:" },
    "flux-2-pro":         { generate: "参考图:", edit: "参考图:" },
    "seedream-5-0-260128":{ generate: "参考图:", edit: "参考图:" },
  },
  maskReferenceTemplates: {
    single: "参考图1是完整原图;最后一张参考图(参考图2)是区域引导图",
    two:    "参考图1是完整原图;参考图2是用户提供的目标内容参考图,用户提示词中的图号始终对应这些用户参考图;最后一张参考图(参考图{{GUIDE_INDEX}})才是区域引导图",
    many:   "参考图1是完整原图;参考图2至参考图{{USER_COUNT}}是用户提供的目标内容参考图,用户提示词中的图号始终对应这些用户参考图;最后一张参考图(参考图{{GUIDE_INDEX}})才是区域引导图",
  },
  maskPromptTemplate: "(保持不变,见现状 providerPromptRenderer.ts:59)",
} as const;

export const PROVIDER_PROMPT_RENDERER_HASH = "sha256:<重新计算>";
```

`renderProviderPrompt()` 逻辑:

```
taskPrompt = trim(input.taskPrompt)
if (!taskPrompt) throw (现状不变)
if (nodeKind === "mask-redraw"):
    taskPrompt = interpolate(maskPromptTemplate, { TARGET: taskPrompt, MASK_REFERENCE_ROLES: maskReferenceRolePrompt(references.length) })
if (references.length > 0):
    intro = PROVIDER_PROMPT_RENDERER_CONTRACT.referenceListIntro[modelId][mode]
    list = references.map((_, i) => `参考图${i+1}`).join("、")
    return `${taskPrompt}\n${intro}${list}`
else:
    return taskPrompt
```

注意:
- **不再有 `getReferenceRoleDefinition()`、`pendingRoleSuffix`、`roleWrappers`**。
- `ProviderPromptReference` 不再含 `role/roleNeedsConfirmation`,只含 `order`(或干脆是 `readonly unknown[]`,只用长度)。
- mask 引导图仍由 `sourceNodeId === "<nodeId>:mask-guide"` 标识并在 `maskReferenceRolePrompt()` 中算 `GUIDE_INDEX`;不再查 `role === "generic"`。

### 5.2 提示词实例(改写前后对照)

**现状(gpt-image-2-vip, edit, 3 张参考图)**:
```
<taskPrompt>
GPT Image 2 VIP 多图编辑参考职责:图1=整套服装(garment_full)|职责:仅提供整套中各服装单品本体的版型、结构、颜色、图案、工艺、材质和未受造型方式影响的自然物理垂坠|禁止影响:不得借用人物身份、面部、发型、姿势、构图、配饰或背景;不得提供叠穿、塞衣、卷边、开合、腰线或单品之间的穿搭关系;图2=人物身份与面部(identity)|职责:仅提供同一人物的面部特征、肤色、发型和可识别身份|禁止影响:不得提供服装款式、穿搭方式、姿势、构图或背景;图3=背景(background)|职责:仅提供场景、背景色、环境层次和背景氛围|禁止影响:不得改变人物身份、面部、姿势、服装、面料或配饰。严格按图号使用,每张图只承担其声明职责,不得交换身份、服装、姿势或造型语义。
```

**改后(同场景)**:
```
<taskPrompt>
参考图:参考图1、参考图2、参考图3
```

**取舍**:改后提示词更短、更便宜(token 成本下降),但**失去了角色约束带来的抗串扰能力**。这正是用户提出移除角色的代价,需要在 PR 描述中明确告知。

---

## 6. 测试策略

### 6.1 删除(整体删)

| 文件 | 理由 |
|---|---|
| `tests/reference-role-catalog.test.ts` | 测试角色目录存在性与唯一性;目录本身被删 |
| `tests/reference-role-summary.test.ts` | 测试 `ReferenceRoleSummary` 组件;组件被删 |
| `tests/fixtures/reference-role-workflows.ts` | 含角色字段的 fixture;由新的无角色 fixture 替代(如需) |
| `e2e/reference-role-confirmation.spec.ts` | 测「角色确认流程」;流程被删 |

### 6.2 改写(删角色断言,保留其它)

| 文件 | 改动要点 |
|---|---|
| `tests/reference-inputs.test.ts`(453 行) | 删所有 `reference-role-invalid`/`reference-role-unconfirmed` 断言;保留数组结构/order/assetSha256/sourceNodeId 校验断言 |
| `tests/workflow-schema.test.ts` | 删 `WorkflowReferenceRoleValidationError` 相关用例;新增「旧字段容忍」用例(见 §3) |
| `tests/schema-migrations.test.ts` | 删 role 迁移断言;新增「v6 读取含 role 字段的旧 JSON 不报错」 |
| `tests/document-snapshot.test.ts` | 删 `imageRole`/`roleNeedsConfirmation` 字段断言;新增「DocumentSnapshot 不含 role」 |
| `tests/dag.test.ts` | 删 `inputReferences[].role`/`upstream[].referenceRole` 断言;保留 order 连续性断言 |
| `tests/run-queue.test.ts` | 删 admission 中 role 相关 code 断言;保留 evaluation policy 断言 |
| `tests/prompt-run-admission.test.ts` | 删 `reference-role-*` code 断言;保留 missing-binding/binding-mismatch/prompt-drift/parameter-drift/shutdown 断言 |
| `tests/prompt-evaluation.test.ts` | 删 `canonicalReferenceRoleProfile/canonicalReferenceRoleSet` 用例;删 `referenceRoleFidelity` 权重断言;新增「unit key 不含 roleProfile」 |
| `tests/prompt-evaluation-release.test.ts` | 删 `referenceRoleProfile` 在 release vector 中的断言 |
| `tests/evaluation-evidence.test.ts` | 删 `validateReferences` 中 role 校验断言;删 `referenceRoleFidelity` 评分断言 |
| `tests/evaluation-promotion.test.ts`、`tests/evaluation-manifest.test.ts`、`tests/evaluation-campaign.test.ts`、`tests/evaluation-release-runtime.test.ts`、`tests/evaluation-review-cli.test.ts`、`tests/evaluation-review-ledger.test.ts` | 同步删 role 字段断言 |
| `tests/authorization.test.ts` | 删 `evaluationUnitKey` 中 roleProfile 断言 |
| `tests/provider-contract.test.ts` | 删 `reference-role-unconfirmed` 拦截断言(第 226-235 行) |
| `tests/image-viewer-reference-evidence.test.ts` | 删 role label 断言;新增「caption 不含角色」 |
| `tests/image-input-node.test.ts` | 删「新连线默认角色」选择器断言 |
| `tests/project-tabs.test.ts`、`tests/project-tabs-session.test.ts`、`tests/active-document-boundary.test.ts`、`tests/flow-history.test.ts`、`tests/recent-results.test.ts`、`tests/selection-consistency.test.ts`、`tests/upload-image-normalization.test.ts`、`tests/initial-draft-client.test.ts`、`tests/openai-mask-test.test.ts`、`tests/node-prompt-parameter-matrix.test.ts`、`tests/promptReleaseTestSupport.ts` | 逐个 grep 删 role 相关字段初始化与断言(多数只是 fixture 中写了 `role:"garment_full"`,删字段即可) |

### 6.3 新增回归

| 测试 | 内容 |
|---|---|
| `tests/workflow-schema.test.ts` 新增 | 含 role 字段的 v6 JSON → parse 不抛错且字段被剥离 |
| `tests/document-snapshot.test.ts` 新增 | 含 role 的 WorkflowNodeData → snapshot 无 role |
| `tests/reference-inputs.test.ts` 新增 | 顺序语义:references 数组顺序变化 → 渲染提示词中的图号同步变化(顺序仍生效) |
| `tests/run-queue.test.ts` 新增 | mask guide 仅以 `sourceNodeId` 末尾标识,不再查 role |
| `e2e/workbench.spec.ts` 或 `e2e/golden-path.spec.ts` 新增 | 1024/1280/1440 三档宽度下,参考图可添加/删除/上移/下移,**无角色选择器**,可成功发起生成(用 dry-run 或 mock provider) |
| `e2e/initial-draft.spec.ts` 新增 | 打开含旧 role 字段的项目(用 fixture 注入)→ 不报错、可生成 |

### 6.4 评分权重调整

`PROMPT_SCORE_WEIGHTS` 现状:`garmentMaterialFidelity:0.30, instructionFollowing:0.25, referenceRoleFidelity:0.20, artifactControl:0.15, commercialUsability:0.10`。

删除 `referenceRoleFidelity` 后,权重需重新归一。建议:
```
garmentMaterialFidelity: 0.35
instructionFollowing:    0.30
artifactControl:         0.20
commercialUsability:     0.15
```
(总和 1.00;**待用户确认**——这是评估语义变更,属于 AGENTS.md §5「evaluation/admission logic」范围)

---

## 7. 验证与回滚

### 7.1 验证清单(每阶段必跑)

```
npm run lint
npm run check
npm run test
npm run build
git diff --check
ast-grep scan --config sgconfig.yml src server scripts e2e
npx depcruise --config .dependency-cruiser.cjs src server scripts e2e
```

阶段 5 额外:
```
npm run docs:apiyi:kb:check        # 已在阶段 0 跑过,再跑一次确认快照未变
npm run docs:apiyi:lookup -- --query "..." --paths ... --receipt docs/ai/apiyi/consultations/2026-09-17-remove-reference-roles-final.json --decision "..."
npm run docs:apiyi:guard -- --uncommitted   # 若 change-scope.json 命中本 diff
npm run gate:codex -- --base origin/main    # 本地交付门禁
```

### 7.2 回滚

- **代码回滚**:每个阶段一个独立 PR,revert 即可。
- **数据回滚**:无 DB 迁移,无数据改写,无需回滚。
- **评估/发布回滚**:registry 为空,无需回滚;若未来已有 release 后再想做类似改动,需重新设计(本方案不适用)。
- **提示词回滚**:`PROVIDER_PROMPT_RENDERER_HASH` 与 `VERSION` 是常量,改回旧值即回滚。

---

## 8. 风险清单

| 风险 | 等级 | 缓解 |
|---|---|---|
| **提示词失去角色约束 → 生成质量下降**(人物/服装/姿势串扰) | **高** | 用户已知悉并主动要求;在 PR 描述中明确标注;后续若质量回退,需重新引入轻量级的「顺序+简短描述」机制(不在本次范围) |
| **评估/发布哈希链断裂** | **低**(实证 registry 为空) | 阶段 0 实证 registry 为空后再动工;若动工时 registry 非空,**停工并回到方案** |
| **API易门禁(§5)** | 中 | 阶段 0 `kb:check` + `search`;阶段 5 `lookup` + `guard`;命中页 SHA-256 写入 receipt |
| **「结果不得被削弱」红线(§3)** | 中 | 本方案不动 `ProjectTab[]`/`DocumentSnapshot` 边界;不删 run 恢复/成功/失败/unknown/查看/对比/下载/继续处理/设为输入 任一能力;仅删角色**维度** |
| **旧项目打不开** | 低 | §3 容忍策略 + 新增 e2e 回归(打开含旧 role 字段的项目) |
| **mask guide 误判** | 低 | 改为仅以 `sourceNodeId === "<nodeId>:mask-guide"` 且位于末尾判断;新增 `tests/run-queue.test.ts` 回归 |
| **评分权重调整改变既有评估结论** | 低(registry 为空) | 同「评估/发布哈希链断裂」 |
| **depcruise/ast-grep 新增违规** | 低 | 每阶段跑;本改动不引入新跨层 import,理论上 0 新增违规;若出现,停工评审 |
| **代码智能边界** | 中 | 无 call-graph 工具;删除 `referenceRoles.ts` 等共享符号的影响面靠 `tsc --noEmit` + 全量测试证明;**禁止全局 find-and-replace** |

---

## 9. 工作量粗估与建议分工

| 阶段 | 工作量(人日) | 建议 assignee | 备注 |
|---|---|---|---|
| 0 准备 | 0.5 | architect(本方案作者) | 跑门禁 + spec 标注 |
| 1 契约类型 | 0.5 | backend | 仅 `workflow.ts`,打 `@deprecated` |
| 2 后端准入/Provider | 2.0 | backend | 涉及 11 个 server 文件 + 全部 server 测试改写 |
| 3 前端领域+UI | 2.5 | frontend + ui-qa | 删 2 文件、新建 1 组件、改 11 文件 + 全部前端测试改写 + e2e |
| 4 模板与文档 | 0.5 | backend | templates.ts + garmentPromptPresets.ts + fixture 清理 |
| 5 API易 receipt+收尾 | 0.5 | architect | lookup/guard/gate:codex |
| **合计** | **6.5 人日** | | 可压缩到 5 若阶段 2/3 并行 |

**关键路径**:阶段 1 → 阶段 2 → 阶段 3(UI 部分依赖 store 与 documentSnapshot 改动)→ 阶段 4 → 阶段 5。阶段 2 与阶段 3 的「前端 UI 文件」部分可由 frontend 与 ui-qa 并行,但合并顺序必须是 2 先 3 后。

---

## 10. 用户已确认的决策（2026-09-17 拍板，约束所有实施阶段）

| # | 决策点 | 用户裁定 | 实施含义 |
|---|---|---|---|
| 1 | D1 提示词措辞 | **不需要**追加中性说明 | 提示词就是 `<taskPrompt>` + `参考图:参考图1、参考图2、…`，不加「按输入顺序使用」等句子 |
| 2 | D3 评分权重 | **可以**（接受重归一） | `garmentMaterialFidelity 0.35 / instructionFollowing 0.30 / artifactControl 0.20 / commercialUsability 0.15`；删除 `referenceRoleFidelity` |
| 3 | D5 UI 替代交互 | **不加**备注框 | `ReferenceImageList` 仅「顺序号 + 缩略图 + 来源 + 上移/下移/删除」，不引入新语义 |
| 4 | AGENTS.md | **同步改** | 阶段 5 把 §4 中 `reference-image ordering` 表述调整为「保留顺序语义，移除角色语义」（ordering 本身保留） |
| 5 | specs/001 处置 | **挪动** | `specs/001-garment-reference-roles/` 整体移到 `specs/deprecated/001-garment-reference-roles/`，并在其 `spec.md` 顶部加 Deprecated 标注 |

原「待确认」5 项全部关闭，方案可实施。

---

## 11. 实施中发现的问题与裁决（2026-09-18，R-01 反馈）

### 11.1 阶段 1 边界裁决：**(a) 扩围含下游最小类型修复**

实测：放宽 `src/types/workflow.ts` 的类型（`ReferenceEdgeData→Record<string,unknown>`、`imageRole→unknown`、
`ReferenceImageInput/Source.role→optional`）会让 `tsc --noEmit` 在 **13 个下游文件产生 20 个错误**
（server/engine/dag.ts、runner.ts、runQueue/promptAdmission.ts、worker.ts、server/lib/evaluationAuthorizationLedger.ts、
evaluationEvidence.ts、workflowSchema.ts、server/routes/generate.ts、src/components/ImageViewer.tsx、
src/hooks/usePromptRunAdmission.ts、src/lib/documentSnapshot.ts、promptRunAdmission.ts、providerPromptRenderer.ts）。

**裁决**：阶段 1 扩围，包含这 20 处**最小类型兼容修复**（只加窄化/守卫，**不改运行时行为**，
每处加 `// TODO(R-02/R-03): 移除角色后删除此守卫` 注释）。理由：类型与其消费者是同一原子单元，
无法只改类型又保持 tsc 绿；机械守卫的小量重复劳动换取「每阶段可独立验证 + 可独立回滚」。

### 11.2 测试库命名修正（重要）

`scripts/test-with-postgres.mjs:154` 硬性要求库名 `endsWith("_test")`。原 per-agent 库名
`garment_canvas_test_<agent>` **以 agent 名结尾，被 runner 拒绝**。已改名（保留数据）：

| agent | 正确测试库名 |
|---|---|
| backend | `garment_canvas_backend_test` |
| frontend | `garment_canvas_frontend_test` |
| ui-qa | `garment_canvas_uiqa_test` |
| reviewer | `garment_canvas_reviewer_test` |
| architect | `garment_canvas_architect_test` |
| default | `garment_canvas_default_test` |

### 11.3 dependency-cruiser 正确调用方式（重要）

`dependency-cruiser@18.3.0` 是**全局安装**（`/opt/homebrew/bin/depcruise`），不在项目依赖里。
`npx depcruise` **可能解析到同名错误包**，且**不带 `NODE_PATH` 会静默退化**：实测

- 不带 NODE_PATH：`20 modules / 0 TS modules`（退化，门禁会 fail-closed 拒绝）
- 带 NODE_PATH：`225 modules / 199 TS modules / 0 error / 3 warn`（= 3 条既知基线环）

**正确调用**（worktree 里先 `ln -s <主仓库>/node_modules node_modules`）：

```bash
NODE_PATH=$PWD/node_modules depcruise --config .dependency-cruiser.cjs --output-type json src server scripts e2e
```

### 11.4 worktree 基础设施（Kanban 任务必读）

Kanban 的 worktree 不含 `.env` 与 `node_modules`（都被 gitignore），本轮已补：
`cp .env <worktree>/.env`、`ln -s <主仓库>/node_modules <worktree>/node_modules`。
不补则测试库连不上、`tsc`/`depcruise` 不可用。

---

## 附录 A：本方案的证据基础

- `grep -rli "referenceRole|roleNeedsConfirmation|REFERENCE_ROLE|ImageInputRole|..." src server tests e2e specs` → 73 个文件(实测,需求文档称 38 个仅含 src+server,本方案扩展到 tests+e2e+specs 后 73 个)。
- `docs/ai/evaluation/prompt-release-registry.json` → `releases: []`(实证为空)。
- `npm run docs:apiyi:kb:check` → 通过(snapshot `2026-09-02T12-55-56.022Z-a90bb31d7f8c13df`,2559 页)。
- `npm run docs:apiyi:search -- --query "参考图 角色 顺序"` → 命中 FLUX image-edit / GPT Image 2 / Seedream / Gemini 多图编辑页,证实「顺序」是这些模型的原生语义,「角色」不是。
- `server/providers/apiyi.ts:55-77` → Provider 边界现状拦截 `reference-role-unconfirmed`。
- `src/lib/providerPromptRenderer.ts:12,63` → `PROVIDER_PROMPT_RENDERER_VERSION=v3`, `PROVIDER_PROMPT_RENDERER_HASH=sha256:cb1e87e905...`(将变为 v4 + 新哈希)。
