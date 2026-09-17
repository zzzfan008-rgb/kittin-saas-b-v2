# Implementation Plan: 服装多参考图角色确认与提示词约束

**Branch**: `001-garment-reference-roles`（Spec Kit 功能标识；当前 Git 检出不变） | **Date**: 2026-09-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-garment-reference-roles/spec.md`

**Note**: 本计划仅生成设计产物；业务代码修改由后续 `$speckit-implement` 阶段执行。

## Summary

在现有参考图角色、提示词准入、DAG 执行和历史记录基础上，补齐“逐图显式确认、目标任务级角色边界、入队快照、旧项目保守迁移和历史复核”的完整链路。实现采用一个共享角色目录作为浏览器与服务端的共同语义来源；每条进入生成节点的图片连接保存该图片在该目标任务中的角色，图片节点上的角色继续作为新连接默认值和旧数据迁移来源。浏览器提供即时反馈，两个入队入口和 Worker 调用 Provider 前均保持权威的失败关闭校验。

## Technical Context

**Language/Version**: TypeScript 5.7；Node.js 24.20.0 或更新版本

**Primary Dependencies**: React 19、React Flow 12、Zustand 5、Express 4、PostgreSQL 客户端 `pg`、项目本地 shadcn/Base UI 组件

**Storage**: PostgreSQL 18；项目工作流保存在 `projects.flow_json`，运行角色快照保存在 `generation_runs.reference_inputs_json` 与 `generation_run_steps.reference_inputs_json`；图片正文继续由现有文件存储管理

**Testing**: Node/TSX 行为测试、隔离 PostgreSQL 集成测试、Playwright 1.61 桌面端验收、现有本地 Codex gate

**Target Platform**: 桌面浏览器（最低 1024 CSS px）与 Node.js 服务端

**Project Type**: 单仓库全栈 Web 应用

**Performance Goals**: 角色投影和准入判断只随当前节点的参考图数量线性增长；角色错误在任何网络提交或 Provider 调用前即时呈现；不为角色确认增加额外图片上传或 Provider 请求

**Constraints**: 角色必须显式、失败关闭且顺序稳定；运行开始后采用不可变角色快照；旧数据不得丢图；浏览器校验与服务端校验不得产生不同语义；项目权限、UI 和验证政策直接遵循 `AGENTS.md`

**Scale/Scope**: 10 个受支持角色、7 类生成节点、两个入队接口、项目保存/读取、运行队列与历史结果界面；不新增模型或 Provider

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Gate | Pre-research | Post-design | Evidence |
|------|--------------|-------------|----------|
| Single Policy Authority | PASS | PASS | 本计划仅引用 `AGENTS.md`，不复制权限、发布或 Git 规则。 |
| Outcome-First Specification | PASS | PASS | [spec.md](spec.md) 已包含优先场景、14 条需求、可量化结果、假设、依赖和排除项。 |
| Ordered Artifact Flow | PASS | PASS | 当前阶段只生成 `plan.md`、`research.md`、`data-model.md`、`contracts/` 和 `quickstart.md`；未创建任务或修改业务代码。 |
| End-to-End Traceability | PASS | PASS | 下方实施映射把每个计划组件关联到 FR/AS；接口契约保留相同标识。 |
| Evidence-Based Convergence | PASS | PASS | [quickstart.md](quickstart.md) 定义无付费调用的行为、集成与桌面验收证据；完成状态留给后续任务与收敛阶段。 |

**Policy checkpoints**: `AGENTS.md §§1–6`。

## Project Structure

### Documentation (this feature)

```text
specs/001-garment-reference-roles/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── history-reference-evidence.md
│   ├── run-admission.md
│   └── workflow-reference-roles.md
└── tasks.md                         # 由 $speckit-tasks 创建，本阶段不生成
```

### Source Code (repository root)

```text
package.json                            # 新测试文件的既有测试入口
scripts/
└── test-with-postgres.mjs             # PostgreSQL 测试发现与生命周期入口

src/
├── types/workflow.ts                # 角色、连接、计划与证据共享类型
├── lib/
│   ├── referenceRoles.ts            # 唯一角色目录与跨角色边界
│   ├── referenceInputs.ts            # 有序参考图与确认状态校验
│   ├── promptRunAdmission.ts         # 浏览器/服务端共用准入判定
│   └── documentSnapshot.ts           # 连接级角色进入文档快照
├── hooks/usePromptRunAdmission.ts    # 当前节点参考图投影与即时反馈
├── store/flowStore.ts                # 连接级角色编辑与文档事务
└── components/
    ├── nodes/
    │   ├── ImageInputNode.tsx        # 图片节点默认角色
    │   └── ReferenceRoleSummary.tsx  # 目标节点的有序参考图确认区
    ├── panels/InspectorPanel.tsx     # 选中目标节点时复核/修改角色
    ├── ImageViewer.tsx               # 历史角色证据
    └── ui/select.tsx                 # 项目本地 shadcn 选择控件

server/
├── engine/
│   ├── dag.ts                        # 连接角色生成计划快照
│   ├── runner.ts                     # 解析素材、哈希并构造 Provider 输入
│   └── runQueue.ts                   # 入队与 Provider 前再次校验
├── lib/
│   ├── database.ts                    # 内置工作流创建与版本归一化
│   ├── workflowSchema.ts              # v5 工作流校验与保守迁移
│   ├── referenceRolePrompt.ts         # 各模型的角色边界提示词
│   └── generationRecords.ts           # 运行与结果证据持久化
└── routes/
    ├── generate.ts                   # 直接生成契约
    ├── runPlan.ts                    # 画布运行契约
    └── history.ts                    # 类型化历史证据响应

tests/
├── reference-inputs.test.ts
├── prompt-run-admission.test.ts
├── workflow-schema.test.ts
├── document-snapshot.test.ts
├── dag.test.ts
├── run-queue.test.ts
├── recent-results.test.ts
├── project-tabs.test.ts
└── provider-contract.test.ts

e2e/
└── reference-role-confirmation.spec.ts
```

**Structure Decision**: 保持现有单仓库前后端结构，不引入新服务。共享语义放在 `src/` 的纯 TypeScript 域层，供浏览器与服务端共同导入；服务端继续独占图片解析、运行入队、Provider 提交和持久化。连接级角色进入 `DocumentSnapshot`，因此保存、撤销、切页和异步文档边界沿用现有 Store 机制。

## Implementation Workflows

### 1. Shared role semantics and migration

- 建立唯一角色目录，包含稳定标识、中文标签、允许影响的内容和禁止跨用的内容；`ImageInputNode`、目标节点确认区、历史查看和 Provider 提示词均从该目录读取。（FR-001–FR-003、FR-007–FR-009；AS-001–AS-004、AS-009）
- 将实际用途保存在目标连接上；图片节点角色只作为新连接默认值。工作流 Schema 升级到 v5：v4 及更早版本从图片节点角色保守填充连接角色，非图片节点来源迁移为 `generic + 待确认`。（FR-005、FR-011、FR-012；AS-005、AS-007、AS-008）
- `DocumentSnapshot`、撤销/重做、项目保存和模板读取保留连接级角色，不把运行态或临时 UI 状态混入项目数据。（FR-010–FR-012、FR-014；AS-005–AS-008）

### 2. Frontend interaction

- 在每个生成节点的运行操作附近显示紧凑的有序参考图确认区：序号、来源名称/缩略信息、角色选择、待确认或不可用状态；在 Inspector 中提供同一数据的展开视图。（FR-001、FR-002、FR-004、FR-006；AS-001、AS-002）
- 用户修改角色时只更新当前目标连接；多条连接可独立使用同一素材。确认区每行提供可见、可命名且支持键盘操作的上移、下移和移除操作；改角色、重排和移除均通过现有文档事务进入保存与撤销体系。（FR-005、FR-010、FR-014；AS-005、AS-006）
- 运行按钮继续使用共用准入结果；错误信息包含具体序号/来源，而不是只有笼统原因。（FR-004；AS-001）
- 标准选择、提示和警示控件组合自项目本地 shadcn primitives，详细布局在实现前按 `AGENTS.md §2` 单独确认。

#### UI Proposal Checkpoint

用户已于 2026-09-03 明确确认本计划的 UI 提案后，方可进入角色确认 UI 实施。确认范围包括：Run 附近按实际输入顺序显示参考图摘要；使用项目本地 shadcn/Base UI `Select`；Inspector 复用同一有序数据源提供逐条复核；待确认、缺失和不可读条目继续失败关闭；内部蒙版引导图不进入用户确认列表；P1 不提前加入 US2 的重排/移除操作；保持现有桌面工作台布局、键盘焦点和业务 Store 状态边界。

### 3. Authoritative admission and immutable snapshots

- 共用准入要求每个用户参考图都具有受支持角色且 `roleNeedsConfirmation === false`；字段缺失不能作为已确认。按照 FR-003，只有角色选择控件或用户主动连接到清晰标注固定角色的专用输入句柄才能形成显式确认。（FR-003–FR-005；AS-001、AS-002）
- `/api/run-plan` 从保存后的项目 v5 连接构建有序 `ReferenceImageSource[]`；`/api/generate` 校验客户端提交的结构化参考图。两条路径返回相同的结构化错误语义。（FR-004–FR-006；AS-001、AS-002、AS-005）
- 入队时冻结角色、顺序、来源节点与素材引用；Worker 解析图片时追加内容哈希，调用 Provider 前再次以同一准入规则校验。后续画布修改不能改变已入队任务。（FR-006、FR-010、FR-013；AS-006）
- 系统生成的蒙版引导图不是用户参考图，不出现在确认区；它保留内部来源证据，但不能覆盖用户已声明的角色边界。

### 4. Provider prompt boundaries

- `referenceRolePrompt` 从共享角色目录生成逐图职责清单，再由各模型适配层添加已存在的输入顺序/模式说明。（FR-007、FR-008；AS-003、AS-004）
- `styling_only` 必须包含“不借用人物身份或面部”的正向边界；`generic` 必须声明为补充上下文，且具体角色优先。（FR-008、FR-009；AS-004、AS-009）
- 角色顺序与传给 Provider 的图片顺序始终来自同一 `ReferenceImageInput[]`，不维护第二份可漂移数组。（FR-006、FR-007、FR-014；AS-003、AS-005）

### 5. History and verification evidence

- 运行与步骤记录保存不含图片正文的角色证据；历史接口返回类型化、按序的证据，结果查看器以用户可读标签展示角色、确认状态和来源。（FR-013；AS-006、AS-007）
- 覆盖角色缺失/未确认、重复角色、顺序、旧版迁移、连接编辑、入队快照、Worker 再校验、提示词边界和历史复核；自动化验证使用 Provider 替身。（FR-001–FR-014；AS-001–AS-009）
- 按 SC-006 邀请至少 10 名符合目标用户假设且未参与本功能设计或实现的服装设计师进行可用性验证，记录每位参与者的完成时间、是否达到可生成状态和汇总结论；该证据与自动化键盘、焦点及桌面几何验证分别保存。

## Requirement-to-Component Mapping

| Requirements | Planned components | Verification surface |
|--------------|--------------------|----------------------|
| FR-001–FR-003 | shared role catalog, `ImageInputNode`, `ReferenceRoleSummary` | role catalog/UI behavior tests, desktop E2E |
| FR-004–FR-006 | admission domain, hook, DAG, both run routes | admission, DAG, route and E2E tests |
| FR-007–FR-009 | shared role boundaries, `referenceRolePrompt` | per-model prompt contract tests |
| FR-010–FR-012 | edge role state, document snapshot, workflow v5 migration | snapshot, project/store and schema migration tests |
| FR-013 | queue/run snapshots, generation records, history API/viewer | queue, database migration and recent-results tests |
| FR-014 | Store reorder/remove transactions, visible row controls, DAG order normalization | Store, role-summary, snapshot, DAG and desktop E2E tests |

## Complexity Tracking

No Constitution violations require justification. The workflow schema version change is necessary because connection-level role semantics become persisted business data; it stays inside the existing project/document model and does not add a new subsystem.
