# 迁移契约 — v7 → v8

- 状态：**已定稿**（architect 2026-09-21）
- 用户决策：**保守路径**（先保数据，不保可运行性）
- 依赖：`data-model.md`、`runtime.md`
- 项目硬规则：`AGENTS.md`（引用，不复述）

## 1. 总原则

**打开即迁，不拒绝旧项目。** 理由是 AGENTS.md §3「结果不得被移除或削弱」——
拒绝打开 v7 项目等于让用户看不到既有结果，是削弱。

v7 → v8 是**结构变换**，不是字段改名（见 data-model.md §3 的字段名沿用决策）。

## 2. 迁移映射表

| v7 节点 | v8 节点 | 处理 |
|---------|---------|------|
| `text` | `text` | 保留 `text` / `label` / `status`；**丢弃** v7 的 `promptVariantId` / `modelId` / `modelOptions` / `outputText` / `lastRunInput` |
| `image` | `image` | 保留全部 `outputImages`（**不区分上传与生成**）；**丢弃** `promptVariantId` / `modelId` / `modelOptions` / `aspectRatio` / `batchSize` / `mask` 等生成字段 |
| `video` | `video` | 保留全部 `outputVideos`；**丢弃**生成字段 |

**不自动拆 generator / result**。理由（用户拍板）：v7 的 `outputImages` 不区分「用户上传」
与「生成结果」（R8 输入输出同体的历史债），启发式猜测会把上传图误判为产物，污染数据。

## 3. 边迁移

| v7 边 | v8 处理 |
|-------|---------|
| 全部 v7 边（含指向 image 节点的 `prompt` / `reference` 边） | **删除**（只保留节点；理由见下「关键冲突」/「处理」） |

> R-100 附带修正（F1-b，同类矛盾）：本表原第 1 行标「**保留**」并自带「因此必须删除」的
> 反证，第 3 行又写「其他｜按 §4 规则重算」——两处都与本节的结论、§8 的边界及两侧实现冲突。
> 现按结论统一为「全部删除」。

**关键冲突**：v8 的连线规则（plan.md §2.2）禁止「输入节点互连」，
而 v7 项目里 `text → image`（prompt 边）是**最常见的边**。迁移后这些边全部非法。

**处理**：迁移时**丢弃所有 v7 边**，只保留节点。理由：
- v7 的边语义（prompt/reference 指向 image 节点）在 v8 中没有对应目标
  （v8 的 `prompt`/`reference` 边只指向生成节点，而迁移不产生生成节点）
- 保留非法边 = 产出无法通过 schema 校验的文档 = 项目打不开，与「不拒绝打开」冲突
- 节点全保留 → 用户数据（提示词、上传图、生成结果）零丢失；
  连线由用户重建（保守路径的固有代价，已拍板）

## 4. 迁移实现位置与时机

- **前端**：`src/lib/documentSnapshot.ts` 的读取路径
  —— 读 v7 快照 → 变换 → 得 v8 文档。
- **服务端**：`server/lib/workflowSchema.ts` 的 `validateAndMigrateFlow`
  —— 服务端也必须能接受 v7 持久化数据（否则旧项目在服务端打不开）。
- **时机**：打开项目 / 加载模板时惰性迁移；**不做批量离线迁移脚本**
  （避免一次性改写全部历史文档，且 AGENTS.md §6 要求最小补丁）。

`WORKFLOW_SCHEMA_VERSION = 8`。读取时：
- `schemaVersion === 8` → 直接校验
- `schemaVersion === 7` → 走迁移
- `schemaVersion < 7`（含 `undefined`/`0`）→ **拒绝**（沿用 v7 确立的边界：v6 及以下一律拒绝，见 §8）
- `schemaVersion > 8` → **拒绝**（未知的更高版本，fail-closed）

本表为版本闸的唯一口径（R-100 修正：原文第 2 条写作「`<= 7` 走迁移」，与 §8
及两侧实现正面冲突；错误的只有本表文本，两侧实现一直按本表执行）。

## 5. 落盘行为

迁移后的 v8 文档**在用户保存时**写回。不在打开时静默覆写磁盘
（用户可能只是看一眼，不保存就退出——静默改写违反「不覆盖用户数据」的最小惊讶原则）。

## 6. 迁移后可机检的验收

| # | 验收项 | 机检方式 |
|---|--------|---------|
| M1 | v7 text 节点迁移后 `kind === "text"`，`text` 内容逐字不变 | 快照往返测试：构造 v7 文档 → 迁移 → 断言 text 相等 |
| M2 | v7 image 节点迁移后 `outputImages` 逐项不变 | 同上，断言数组深等 |
| M3 | v7 video 节点迁移后 `outputVideos` 逐项不变 | 同上 |
| M4 | 迁移结果**边为空** | 断言 `edges.length === 0` |
| M5 | 迁移结果**不含任何 `*-generator` 或 `result-*` 节点** | 断言 nodes 的 kind 全部 ∈ {text,image,video} |
| M6 | 迁移结果能通过 v8 schema 校验 | 直接跑 `validateAndMigrateFlow` |
| M7 | `schemaVersion > 8` 被拒绝 | 构造 9 → 断言抛错 |
| M8 | 生成字段被剥离 | 断言迁移后 image 节点无 `promptVariantId` 键 |
| M9 | 版本闸逐档：`=== 7` 迁移、`< 7`（含 `undefined`/`0`）拒绝、`> 8` 拒绝 | 既有机检：`tests/workflow-schema.test.ts:263`、`tests/document-snapshot.test.ts:430`/`:506`、`tests/r48-version-gate.test.ts:6` |

M1/M2/M3 是 §3 不削弱原则在迁移层的落地断言。

## 7. 已知代价（明示，不隐藏）

迁移后旧项目**不可直接运行**：
- 旧节点都是输入节点，没有生成节点
- 用户要重新生成，需：创建生成节点 → 连 prompt 边 → 连 reference 边 → 配置模型/参数

这是用户拍板的保守路径的固有代价。UI 应在迁移后的项目首次打开时给出**一次性提示**：
「项目已升级到新节点模型。原有素材与结果完整保留；如需再次生成，请为其添加生成节点。」
提示为 UI 层，不进文档。

**触发与边界（R-100 裁定，口径补全；呈现形式仍由 UI 决定）**：

- 触发条件 = 读取路径**确实发生了迁移**（`readFlowDocumentForOpen` 返回 `migrated === true`），
  不由入口各自判断。当前消费方：`src/store/flowStore.ts:220`（`openFlowTab`/`loadFlow`/
  `applyServerInitialDraftToTab` 共用 `readFlowDocumentSource`）、`src/lib/templateLaunch.ts:69`。
- 文案常量已定稿：`DOCUMENT_MIGRATION_NOTICE`（`src/lib/documentSnapshot.ts:145`），UI 不得改写。
- 每次「发生迁移的打开」最多提示一次，同一页签内不重复；**不持久化**「已提示」标记
  （否则等于把 UI 状态写进文档，违反 AGENTS.md §3）。尚未保存的 v7 文档下次打开会再次迁移，
  因此会再次提示——这是正确行为，不是重复打扰。
- 提示不得阻断打开、不得改变迁移结果（§3 已定：边整体丢弃）。
- 具体控件、位置与可关闭性属 UI 决策，按 AGENTS.md §2 先经用户确认（本文件不代拍）。

## 8. 不做的事

- 不做 `outputImages` 的「上传 vs 生成」启发式拆分（用户拍板否决）
- 不做 v6 及更早的迁移（v7 已确立「v6 及以下一律拒绝」，v8 沿用该边界）
- 不做磁盘批量迁移脚本
- 不保留「这曾是 v7 节点」的运行时标记（data-model.md §6）
