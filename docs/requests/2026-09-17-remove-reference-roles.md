# 需求：移除参考图「角色」体系

**提出人**: 用户
**整理人**: default agent
**日期**: 2026-09-17
**状态**: 已实施完成（R-01~R-05，2026-09-18；方案见 `docs/design/2026-09-17-remove-reference-roles/plan.md`）
**关联特性**: `specs/001-garment-reference-roles`（服装多参考图角色确认与提示词约束）

---

## 1. 目标（用户原话）

> 将所有节点的角色功能去掉，还有功能节点的角色确认，以及和这两个有关的都去掉。

拆成三条：

1. **所有节点上的「角色」功能** —— 每张参考图必须指定唯一角色（人物身份/姿势构图/上装/下装/整套服装/面料/配饰/造型方式/背景/通用参考）的整套机制。
2. **功能节点上的「角色确认」** —— 未确认角色的图片阻止生成、显示「待确认」、要求逐张确认的流程。
3. **与以上两项相关的一切** —— 类型、UI、校验、提示词渲染、运行准入、评估/证据链、测试、e2e、规格文档。

## 2. 保留（不在移除范围，需在方案中明确保护）

- **多参考图作为有序输入本身**：参考图仍可添加、删除、上移/下移、查看。
  （去掉的是「每张图承担什么角色」，不是「能不能有多张参考图」。）
- **参考图顺序语义**：AGENTS.md §4 要求 retain reference-image ordering，顺序继续影响生成。
- **生成管线其余部分**：run admission / run queue / 评估与证据链只移除「角色」维度，其余不削弱。
- **结果与文档边界**（AGENTS.md §3）：`ProjectTab[]` 与 `DocumentSnapshot` 边界不得破坏。

## 3. 现状影响面（已实测清点，供架构师核对）

**源文件：38 个**（`grep -rli 'referenceRole|roleNeedsConfirmation|REFERENCE_ROLE|ImageInputRole' src server`）

前端（src）关键点：
- `src/types/workflow.ts` — `REFERENCE_ROLE_VALUES`(10 个角色)、`ReferenceRole`、`LEGACY_IMAGE_ROLE_VALUES`、`ImageInputRole`、`DEDICATED_REFERENCE_HANDLE_ROLES`、`referenceRoleForTargetHandle()`、`normalizeImageInputReferenceRole()`
- `src/lib/referenceRoles.ts` — 角色定义目录（label / responsibility / forbiddenInfluence / specificity）
- `src/lib/providerPromptRenderer.ts:139-148` — 提示词逐图渲染 `图N=角色（id）｜职责：…｜禁止影响：…`
- `src/lib/referenceInputs.ts`、`referenceEvidence.ts`、`promptRunAdmission.ts`、`promptEvaluation*.ts`、`garmentPromptPresets.ts`、`documentSnapshot.ts`
- `src/store/flowStore.ts`、`src/hooks/usePromptRunAdmission.ts`
- UI：`src/components/nodes/ReferenceRoleSummary.tsx`（整组件）、`ImageInputNode.tsx`（「新连线默认角色」选择器）、`ModelControls.tsx`、`MaskRedrawNode.tsx`、`src/components/panels/InspectorPanel.tsx`（角色缺失拦截文案）、`src/components/ImageViewer.tsx`

后端（server）关键点：
- `server/lib/referenceRolePrompt.ts`、`server/lib/workflowSchema.ts`（角色校验/迁移）
- `server/engine/runQueue/`：`promptAdmission.ts`（角色准入）、`lifecycle.ts`、`evaluation.ts`、`persist.ts`、`worker.ts`
- `server/engine/dag.ts`、`server/engine/runner.ts`
- `server/routes/templates.ts`、`runPlan.ts`、`generate.ts`
- `server/lib/evaluation*.ts`（角色定义参与评估发布哈希）

**测试：31 个文件**，其中角色专属：`tests/reference-role-catalog.test.ts`、`tests/reference-role-summary.test.ts`、`tests/reference-inputs.test.ts`、`tests/fixtures/reference-role-workflows.ts`、`e2e/reference-role-confirmation.spec.ts`；其余 26 个为「引用角色」的既有测试，需逐个判断「删角色断言」还是「整体改写」。

**规格与历史**：`specs/001-garment-reference-roles/`（spec/plan/data-model/contracts/tasks/research/quickstart）、`docs/ai/apiyi/consultations/2026-09-03-reference-role-*.json`（历史咨询记录，保留不动）。

## 4. 需要架构师给结论的关键决策（附我方建议）

| # | 决策点 | 建议 |
|---|---|---|
| D1 | 去掉角色后，提示词如何重新表述参考图？现状是逐图「职责+禁止影响」。 | 改为「按顺序的参考图列表 + 中性说明」；具体措辞由架构师定稿，但要保证不引入角色语义。 |
| D2 | 遗留数据（DB 既有字段、`flow_json` 里的旧角色值、`roleNeedsConfirmation`）如何处置？ | 读取时**容忍并忽略**：不迁移、不报错、旧项目照样打开；schema 校验放宽为「存在即忽略」。 |
| D3 | 评估/发布哈希链含角色定义，移除后既有 release 语义如何？ | 架构师定：是否需要哈希版本 bump、既有 release 是否失效。 |
| D4 | 类型定义是「彻底删」还是「保留解析容忍」？ | 建议保留最低限度的解析容忍（旧数据不炸），UI/提示词/准入完全不再使用。 |
| D5 | 「新连线默认角色」这类节点级选择器是直接删、还是有替代交互？ | 建议直接删，参考图按连线顺序 + 手动排序即可。 |

## 5. 硬约束（来自 AGENTS.md，方案必须体现）

- **§5 API易知识门禁**：本次改动命中「reference-image roles or ordering」→ 开工前必须 `npm run docs:apiyi:kb:check` 并用 `npm run docs:apiyi:search` 查相关页；实现后跑 `npm run docs:apiyi:lookup` 留 receipt 到 `docs/ai/apiyi/consultations/`。
- **§6 验证**：`npm run check`、`npm run build`、`git diff --check`、`ast-grep scan --config sgconfig.yml src server scripts e2e`、`npx depcruise --config .dependency-cruiser.cjs src server scripts e2e`。
- **§2**：本阶段只出方案；后续真正改 UI 前需要用户确认具体行为/布局。
- **代码智能边界**：无 call-graph 工具；符号删除的影响面要靠 `tsc --noEmit` + 测试证明，禁止全局 find-and-replace 式改名/删除。

## 6. 期望产出（架构师交付物）

1. **模块级影响面**：角色符号的 import 图与依赖路径（谁 import 谁、删了会断什么）。
2. **分阶段移除顺序**：每阶段保持 `tsc -b` + `npm run test` 绿；标注哪些阶段可并行、哪些必须串行。
3. **数据与迁移策略**（对应 D2/D3/D4）。
4. **提示词重写规格**（对应 D1）——给出改后提示词的确切模板文本。
5. **测试策略**：哪些测试删、哪些改、新增哪些回归（尤其：参考图仍可增删排序、顺序仍生效、旧的带角色项目仍能打开并生成）。
6. **验证与回滚方案**。
7. **风险清单**：重点标评估/发布链、API易门禁、以及「结果不得被削弱」的红线。
8. **工作量粗估与建议分工**（哪些给 frontend / backend / ui-qa / reviewer）。
