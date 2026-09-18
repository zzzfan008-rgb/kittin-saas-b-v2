# 契约：既有测试与 e2e 的同步清单（§3.2）

- 来源：plan.md §7；需求挂靠 §3.2
- 枚举方式：grep -lE 对旧 9 kind 在 tests/ e2e/ 的实际执行结果（2026-09-18）
- v2：Q1=B 新增 text 运行路径测试条目（§1.A 尾部）；Q4=A 后 kind 特化循环相关断言删除并入 workflow-schema/dag 重写。
- v3：Q3=A 补充 fabric handle 特例移除条目（§1.A 尾部）。
- v3.1（缺口修复）：text-run 条目对齐 runtime.md §0/§1b；§1.A 尾部补边顺序编辑与变体撤销的运行拒绝条目（runtime.md §5b/§5d）。

## 1. tests/（37 个文件）

按处置方式分组：

### A. 重写（语义围绕旧节点类型，必须按三节点重设计）
- `tests/workflow-schema.test.ts` — v7 schema + INV-1/INV-2 + v6 拒绝
- `tests/dag.test.ts` — 三分支 extract/assert + R3 前置检查
- `tests/text-edit-coalescing.test.ts` — text 节点编辑合并逻辑（若保留该交互）
- `tests/project-tabs.test.ts` / `tests/project-tabs-session.test.ts` — 文档/Tab 模型内嵌旧 kind 的夹具
- `tests/image-input-node.test.ts` — 删除；上传能力并入 image 节点测试
- `tests/node-product-policy.test.ts` — 节点产品策略按新 kind 重写
- `tests/node-prompt-parameter-matrix.test.ts` + `scripts/node-prompt-parameter-matrix.ts` — 矩阵按 (变体 × 模型) 重生成
- `tests/generation-kind-contract.test.ts` — kind 值域契约改三值
- `tests/reference-inputs.test.ts` — 参考图顺序语义保留，夹具换新 kind
- `tests/exact-generation.test.ts` — 请求组装按 §runtime 新顺序
- `tests/run-queue.test.ts` — run 记录 kind 值域
- `tests/flow-history.test.ts` — 历史内嵌 flow 夹具
- `tests/document-snapshot.test.ts` / `tests/active-document-boundary.test.ts` — DocumentSnapshot 边界不变，夹具换 kind
- `tests/initial-draft-client.test.ts` — 初始草稿夹具
- `tests/recent-results.test.ts` — result 归位后的最近结果语义
- `tests/result-export.test.ts` — 导出触发点归位
- `tests/selection-consistency.test.ts` — 选择/查看器一致性夹具
- `tests/schema-migrations.test.ts` — 旧迁移测试删除，改测"v6 及以下一律拒绝"
- 【Q1=B 新增】`tests/text-run.test.ts`（新文件）— text 运行路径：输入串联组装（上游一律取 `data.text`，含「上游有未采纳 `outputText` 时仍取 `text`」反例，规则定义见 contracts/runtime.md §0）、变体准入（未选变体不可运行）、同步 Provider 调用 mock、`outputText` 写回且不覆盖 `text`、超长截断 + `truncated` 标记（runtime.md §1b）、超时/取消/失败计费语义、`generation_runs` kind='text' 记录与 token 计量事件
- 【Q3=A 新增】fabric handle 特例移除：
  - `tests/fabric-recolor-*.test.ts` 或现有测试中针对 `targetHandle === "fabric"` 的连线/校验断言 — **删除**（随 fabric-recolor 旧 kind 退役）。
  - `tests/canvas-connection` 中 fabric/garment 双 handle 连线用例 — **删除**，替换为统一 reference handle 的顺序语义用例（多 image 边按序进入参考图列表）。
  - `tests/workflow-schema.test.ts` 新增反例：flow JSON 中出现 `targetHandle: "fabric"` 应被 v7 schema 拒绝（未知 handle 类型）。
  - `tests/dag.test.ts` 中 fabric-recolor 的 garment/fabric 前置检查断言 — **删除**（`assertPlanInputs` 不再按 handle 特化检查）。
- 【v3.1 新增】边顺序与变体撤销：
  - `tests/reference-inputs.test.ts`（或并入 `tests/dag.test.ts`）— 边顺序重排后参考图解析顺序随之变化；`maskSourceRef` 在第一条图片入边变更后按新顺序重新校验（不匹配则运行拒绝）。
  - `tests/prompt-run-admission.test.ts` — 变体撤销后存量引用节点运行拒绝（`variant.revoked` 文案键）；未撤销的旧 ID 在并行期继续可用。
  - `tests/canvas-connection`（或 P2-c e2e）— 悬浮窗口参考图列表的上移/下移操作改变 edges 数组顺序，运行前预览按新顺序展示。

### B. 改断言（逻辑保留，硬校验 → warning）
- `tests/provider-contract.test.ts` — `imageModelOptionsError` 硬失败断言改 warning 断言
- `tests/model-parameter-profiles.test.ts` — profile 仍作推荐来源，断言 materialize 语义而非校验语义
- `tests/prompt-run-admission.test.ts` — 准入语义不变，夹具换新变体

### C. 随提示词目录重写（P2-d）
- `tests/prompt-presets.test.ts` / `tests/prompt-preset-ui.test.ts`
- `tests/prompt-evaluation.test.ts` / `tests/prompt-evaluation-release.test.ts`
- `tests/evaluation-*.test.ts`（12 个：authorization-ledger / campaign / evidence / promotion / release-build / release-runtime / review-cli / review-ledger / run-policy / manifest / plan / budget / code-identity / preflight 中引用旧 kind 者）— 评估机制不变，夹具的 `nodeKind` 值更新

### D. 顺带更新（仅夹具/字面量）
- `tests/auth-storage.test.ts`、`tests/authorization.test.ts`、`tests/upload-image-normalization.test.ts`、`tests/performance-baseline.test.ts`、`tests/openai-mask-test.test.ts`（mask 夹具并入 image 节点 mask 分支）

## 2. e2e/（3 个 spec）

- `e2e/golden-path.spec.ts` — 黄金路径按三节点重走（建 text → 建 image → 连线 → 选变体 → 运行 mock）
- `e2e/workbench.spec.ts` — 工作台交互内嵌旧 kind 的步骤重写
- `e2e/performance-baseline.spec.ts` — 基线场景 flow 夹具更新

e2e 继续遵守 1024/1280/1440 三档几何断言约束（AGENTS.md §6）。

## 3. CI 门禁面

- `.github/workflows/ci.yml`：**五个必需检查不变**，无 job 增删。
- `scripts/codex-gate.mjs` 的 `APIYI_BOOTSTRAP_SCOPE_RULES` 不变；本重构 P2 改动 `src/types/imageModels.ts`、`docs/ai/apiyi/model-contracts.json` 时会自然命中 scope，按既有流程出 `docs:apiyi:lookup` 回执。
- ast-grep / dependency-cruiser：节点组件目录重写后跑扫描，确认无新增环（`no-circular` error 档）。
