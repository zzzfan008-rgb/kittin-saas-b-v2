# PR: 修复评估 campaign 全链路 unit key 与 envelope 身份断裂

**分支**: `fix/be-62-client-request-id`  
**HEAD**: `95362cd`（ahead origin/main = 27 commits）  
**状态**: 零花费纪律未破（runs=0 / evidence=0 / reserved=0 / used=0 / 66 active）；未 re-seal  

---

## 缺陷摘要

v8rel6 密封的 66 条授权携带了由 manifest 静态数据派生的 9-field `promptEvaluationUnitKey`，而非由真实 project flow 派生的 12-field envelope `evaluationUnitKey`。被攻击者读 `data.*` 后的覆写路径与变体注册表权威源断裂，导致「manifest 静态派生 key ≠ route 准入期实时 key」——同一 slot 的两个身份值静默不等。这解释了 6 个已定位子缺陷（manifest read vs execute 写，共 10+ 个编码位置）——每个都表现为「两侧各持一份→静默不等」。

**修复方向**：不新增派生函数，统一从 variant registry 取值来源修正。

---

## 19 条验收映射表（62-envelope-authority-ruling.md）

| # | 验收项 | 所在层 | 见证测试 | 变异/还原证据 |
|---|---|---|---|---|
| 1 | `data.promptFamilyId`/`data.contractHash`/`data.evaluationVersion` 不在 dag.ts:323-325 | engine | `tests/dag.test.ts` (见证) | 删 data.* 读取行 → 4 条变红 → 恢复 → 14/14 |
| 2 | 已选变体（variant registry）是 3 字段唯一权威源 | engine | `tests/dag.test.ts` (裁决2变异) | ast-grep 无 `data.` 读取残留 |
| 3 | 12-field envelope: 任一 field `undefined`/`null` → throw；nodeKind 严格断言 `"image-generator"` | ledger | `tests/evaluation-authorization-ledger.test.ts` (registered 16) | v7 alias throw fd05ec9；fixture 修复 337876e |
| 5 | 三态预检：33 PASS + 33 BLOCKED(`edit-reference-missing`) | preflight | `tests/campaign-runner-preflight.test.ts` | 缩 filter 不绿、真实计数 |
| 6 | preflight 已移除 edit 侧合成 reference 节点（按裁决4） | preflight | `tests/campaign-runner-preflight.test.ts` | 还原 494af67 |
| 7 | seal 使用 `projects.flow_json` 而非 `saved_projects` | seal | `tests/campaign-runner.test.ts` (dry-run) | 实测 exit 0 JSON stdout |
| 8 | seal 通过共享 `evaluationAuthorizationEnvelopeFromFlow` 调用 | seal | `tests/campaign-runner-preflight.test.ts` | preflight 用同链 |
| 9 | `CampaignPlan` 不携带 manifest-derived key | runner | `tests/campaign-runner-preflight.test.ts` (类型) | tsc 零错 |
| 10 | preflight 播种的是真实 envelope key（非 manifest 静态 key） | preflight | `tests/campaign-runner-preflight.test.ts` (33 PASS) | 原 33×403 |
| 11 | `dead-code` 变异块真可到达且被正确拒绝 | preflight | `tests/campaign-runner-preflight.test.ts` | replay → 409；big-budget → DB 存证 |
| 12 | 删 `promptVariantId` → 准入红（dag.test 变异） | engine | `tests/dag.test.ts` | 临时删行→5 红→恢复→绿 |
| 13 | 残余 `grep` 的 dead `data.` 读取已清零 | global | ast-grep | 扫描 0 命中 |
| 14 | manifest 字段不参与 envelope 计算（验收17） | manifest | `tests/evaluation-manifest.test.ts` + `tests/dag.test.ts` | projectId 在条目层、unit 闭合 9 字段 |
| 15 | `evaluation:manifest:check` → exit 0 | manifest | `scripts/evaluation-manifest.ts` | 直接调用 |
| 16 | `registerAcceptance` 双单元 envelope 身份验证 | ledger | `tests/evaluation-authorization-ledger.test.ts` (16/17) | 含 `kind:"image"` 拒绝 |
| 17 | `evaluationVersion` 源自 variant registry（不硬编码） | seal | `tests/campaign-runner.test.ts` | dry-run stdout |
| 18 | `projectId` 条目层 locator（不在 unit 内） | manifest | `tests/evaluation-manifest.test.ts` | deepEqual + 正向断言 |
| 19 | 裁决6② 三列快照（envelope_inputs_json / sha256 / evaluation_version） | DB | `tests/evaluation-campaign-snapshot.test.ts` (4+2) | 全套件85/85 |

---

## 12 处 route 关卡清单（8 原有 + 4 补记）

**原有 8 处：**
1. `server/routes/runPlan.ts:167-175` — `clientRequestId` 格式约束（`CLIENT_REQUEST_ID_PATTERN`）
2. `server/routes/runPlan.ts:192-193` — 必填检查
3. `server/routes/runPlan.ts:198-202` — `evaluationPolicy` 解析 + onlyNodeId/includeDownstream 干校验
4. `server/routes/runPlan.ts:226-234` — `conflict` 返回（并发入队守卫）
5. `server/routes/runPlan.ts:239` — `assertPromptRunAdmissions`（准入门禁）
6. `server/routes/runPlan.ts:240-241` — `attachEvaluationRunPolicy`（付费标记注入）
7. `server/routes/runPlan.ts:256` — `clientRequestId` 入队
8. `server/routes/runPlan.ts:270` — `"evaluation"` / `"workflow"` 路由分流

**补记 4 处（promptRunAdmission.ts）：**
9. `src/lib/promptRunAdmission.ts:474` — `assertPromptRunAdmissions`（精确 fail-closed 准入，无跨模型 fallback）
10. `src/lib/promptRunAdmission.ts:493` — `evaluationVersion` 一致性断言（`input.evaluationVersion === variant.evaluationVersion`）
11. `src/lib/promptRunAdmission.ts:556-561` — `evaluation-only` 准入标记拒绝（非评估 route 不得碰付费标记）
12. `src/lib/promptRunAdmission.ts:602-628` — v8 绑定身份 5 字段（family/contract/evaluation）强制以 variant registry 为权威源

---

## 字段权威源表 v3（对齐 HEAD=`95362cd`）

| 字段 | 权威源 | 代码位置 | 注释 |
|---|---|---|---|
| `promptFamilyId` | `variant.familyId` | `dag.ts:323` | **取值来源修正**（原 `data.promptFamilyId`，现从 variant registry） |
| `contractHash` | `variant.contractHash` | `dag.ts:324` | **取值来源修正** |
| `evaluationVersion` | `variant.evaluationVersion` | `dag.ts:325` | **取值来源修正**；同时反规范化落 `evaluation_campaigns.evaluation_version`（version 23 迁移） |
| `operationMode` | `variant.mode` | `dag.ts:313` | mode 归属反转（v8 trust model） |
| `parameterProfileId` | `variant.parameterProfileId` | `dag.ts:314` | |
| `postprocessVersion` | `profile.postprocess.version` | `dag.ts:315` | |
| `promptVariantId` | `data.promptVariantId` | `dag.ts:329-330` | 无替代来源——变体绑定不可从注册表推导（盒内自由的代价） |
| `modelId` | `data.modelId` | `dag.ts:312` | 模型选择不可推导 |
| `aspectRatio` | `data.aspectRatio` | `dag.ts:326` | 运行时参数 |
| `batchSize` | `data.batchSize` | `dag.ts:327` | 运行时参数 |
| `modelOptions` | `data.modelOptions` | `dag.ts:328` | 运行时参数 |
| `nodeKind` | `step.kind`（dag 输出） | `ledger.ts:140` | envelope 固定 `"image-generator"`；manifest 保持 `"image"`（注册表权威值） |

---

## 模式观察

本轮 6+4=10 个编码缺陷中，**0% 被既有测试发现**（v8rel6 密封了 66 条授权、全量测试绿、但 manifest 派生 key 与 route 期 envelope key 在所有 66 个 slot 上系统性地不等——测试从未检查过 manifest 派生 key 与 route 期 key 是否一致）。所有缺陷均由**真实路径检查**发现（三态预检、manifest:check 比对、envelope 自校验断言）。真实路径检查比字段级断言有效性高出约一个数量级。

根本形态：【各持一份 → 静默不等】在代码中出现了 3 次：
1. manifest static key（9 字段）≠ route envelope key（12 字段）
2. `data.*` override ≠ variant registry value（3 字段 × 3 调用点）
3. 快照行计算 ≠ key 行计算（若未同源——裁决 6② 已强制调用点统一）

---

## 裁决 6 依赖记录

`garment-eval-v3-pending` → 正式 = 既有账本失效。唯一补救方式：re-seal（append-only，不可逆）。seal CLI 输出已打印 `evaluationVersion` 当前值（`dryRunReport` JSON + seal stdout），以便溯源。

re-seal 锁死，直至：19 条验收全绿 + prepare 实现完成 + hermes 核验通过 + 用户授权 push。

---

## spec §7.2 更正

原 §7.2 `promptEvaluationUnitKey` 描述 9 字段身份：`{familyId, modelId, nodeKind, ...}`。当前路由已将 evaluation identity 由 `evaluationUnitKey`（12-field canonicalJson envelope via real project flow）取代，`promptEvaluationUnitKey` 降级为 manifest planning 用静态排序键。该 9-field 形态已在上轮裁决（62-envelope-authority-ruling.md §4）中正式否决——任何提示「重新启用 promptEvaluationUnitKey」的替代方案不再在讨论中。

---

## 被否决的 9 字段形态（历史记录）

`promptEvaluationUnitKey`（promptEvaluation.ts）: 9 字段 JSON.stringify → sha256。不包含 `operationMode`/`parameterProfileId`/`contractHash`/`evaluationVersion`/`postprocessVersion`——这 5 个字段是 v8 trust model 的节（variant binding → 派生）。被否决原因：manifest 中无法推导真实 project flow 的运行时参数，导致 seal 期 key 与 route 期 key 系统性地不等。