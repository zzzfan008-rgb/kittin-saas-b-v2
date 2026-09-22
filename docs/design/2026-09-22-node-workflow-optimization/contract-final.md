# 节点+工作流优化 — 契约定稿（消化用户 14 决策点裁决）

- 基线：main @ 0584cd7f3187d8911677742aa4120e60fa8bb5d6（开工 `git log -1` 已确认）
- 作者：architect
- 日期：2026-09-22
- 输入：用户 14 决策点裁决（/tmp/decision-list.md，已贴卡评论）+ frontend A+B / backend C / designer D 三方案
- 状态：**定稿**，供拆实施卡引用；本卡为纯文档卡，不改任何产品代码
- 范围：仅涉及契约/状态机/接口的 4 项（U3 取消 / U4 视频结果作下游输入 / RUN-07 状态词汇 / RUN-02 progress 事件）。
  纯 UX 项（U1/U2/U5/U7/U8/U9/U10）已由 designer/frontend 方案承接，不在本文重复。

## 决策摘要

| # | 决策点 | 定稿结论 | 关键理由 |
|---|--------|---------|---------|
| 1 | U3 取消能力 | **整体不做**：RUN-01（cancel 路由）、RUN-08（poll 取消检查点）、IMGGEN-02（取消按钮）全部作废；不新增任何取消入口 | 提交即递交付费 API，无法真正撤销；用户明示删除 |
| 2 | RUN-03 恢复失败锁死 | **方案 a 定稿：纯本地 UI 字段 `syncStalled`**，不扩 NodeRunStatus；404/超时/坏事件 → `outcome_unknown`（终态）+「重新同步/重跑」双出口 | 不污染跨端状态机契约，符合 AGENTS.md §3（runtime/UI state 不入业务文档）；实施面小 |
| 3 | U4 视频结果作下游输入 | **放行**：result-video → video-generator/first-frame，最大 1 条（不扩额度）；先帧抽取，绝不上传整段视频 | 用户拍板 B；成本/体积约束下只接受「首帧图片」语义 |
| 4 | RUN-07 状态词汇统一 | **以 DB 层（succeeded/failed）为准**；事件层同步改名，消灭手工映射；节点级 success/error 保留不动 | 账本/历史/对账全部读 DB 词汇，改动单向、无歧义 |
| 5 | RUN-02 progress 事件 | **采纳可选 progress 字段**（见 §5）；视频无百分比时只发 phase 心跳，禁止编造 | 向后兼容；百分比能力待 T1 知识门禁结论 |

---

## 1. U3 反转：取消能力整体作废

### 结论

产品不提供运行取消能力。以下审计项全部作废，实施卡不得排期：

- backend RUN-01（`POST /api/run-plan/:id/cancel` 路由 + 契约）→ **作废**
- backend RUN-08（视频 poll 取消检查点 / `ExecuteStepOptions.isCancelled`）→ **作废**
- frontend IMGGEN-02（运行中取消按钮）→ **作废**
- backend D4/U6（「上游调用后取消=保留产物」语义之争）→ **消解**（无取消即无此问题）

### 存量死代码处置（backend 清理卡，独立切片）

以下代码因取消入口不存在而为死代码，保留无害但会继续误导后续读者，建议一张清理卡处理（非本次契约变更，不阻塞任何实施）：

- `worker.ts:76,85,154`、`claim.ts:137,215`、`lifecycle.ts:194,200,286,290,296` 中的 `cancel_requested` 分支
- `generation_runs.cancel_requested_at` 列（server/lib/database.ts:275）：**保留列不删除**（历史数据与迁移顺序兼容），仅标注「无写入者，废弃字段」
- 事件契约中的 `cancel_requested` 节点状态（见 §4 状态词汇统一，一并收口）

### 验收断言

- 全仓库 grep 无任何「取消」UI 入口（按钮/菜单项）新建；既有死代码路径不被任何新代码引用
- 清理卡落地后：worker/claim/lifecycle 不再出现 `cancel_requested` 写入分支（读取侧 IN 列表随 CHECK 收紧一并清理）

---

## 2. RUN-03 定稿：恢复失败脱困（P1 升级，唯一用户出口）

### 结论（T3 拍板：方案 a，纯本地 UI 字段）

不扩 `NodeRunStatus`。前端在节点本地 runtime 状态增加 `syncStalled?: boolean` + `error` 字段（node.data 本地字段或等价 store 侧 runtime map，由 frontend 实施卡择一，**不得写入持久化文档**，符合 AGENTS.md §3「Selection, viewer/compare state, runtime state … do not belong in project data」）。

**被否决的选项**：方案 b（NodeRunStatus 增加 `sync_failed`）——需要改 server 三表 CHECK 约束、两端状态机、历史投影与迁移，为一个纯前端恢复态付出跨端契约变更成本，收益为零（服务端永远不会发出该状态）。

### 行为契约（实施卡必须照此实现）

恢复链路（`resumeRecentResults` / `consumeRunEvents` catch 分支，flowStore.ts:4377-4402）按错误类型分流：

| 触发条件 | 投影 | 节点活动态 | 用户出口 |
|---|---|---|---|
| GET run 404 / 恢复窗口已过 / SSE 收到非法终态事件 | `outcome_unknown`（终态）+ error 文案 | 否 | 「重新同步」（重走 GET+SSE，幂等）与「重新运行」（发起新 run） |
| 网络错误 / 5xx / SSE 断连超阈值 | 本地 `syncStalled=true` + error，**不改写 status** | 否（syncStalled 使节点脱离活动呈现） | 「重新同步」；成功后清除 syncStalled |
| 已收到终态事件后再发生网络错误（terminalRecorded=true） | **不覆盖终态**（flowStore.ts:4378 既有判断，补测试固化） | — | — |

禁止行为：
- 任何恢复失败都不得投影为 `retry_wait`（当前 flowStore.ts:4386,4398 的行为，本契约废除）
- 本地 syncStalled 不得进入 SSE 事件流、不得进入持久化文档、不得进入 DocumentSnapshot

### 合法跃迁表（供 backend/frontend 加 transition assert）

恢复路径只涉及前端投影，服务端状态机不变。前端节点 status 合法跃迁（本契约相关子集）：

```
活动态（queued/running/retry_wait）
  → outcome_unknown        （恢复确认 run 已不可追踪；终态）
  → success/error          （正常终态事件；不变）
本地态（不入 status 字段）：
  syncStalled: false → true → false（重试成功清除）
```

服务端 run/step/job 状态机**无任何新增跃迁**；`outcome_unknown` 语义沿用既有定义（结果无法确认，绝不自动重放，claim.ts:205-279）。

### 验收断言

- 构造 GET 404 后 resume：节点 status=outcome_unknown，运行按钮恢复可用，出现两个出口；「重新同步」幂等
- GET 500：进入 syncStalled，不转圈、不显示为成功；重试成功后清除
- terminalRecorded=true 后注入网络错误：终态不被覆盖
- 持久化文档往返（保存→重开）后不存在 syncStalled 字段

---

## 3. U4：视频结果作下游输入（result-video → video-generator/first-frame）

### 结论

放行 result-video 作为 video-generator 的 first-frame 源。语义为「**服务端抽取结果视频首帧作为图片输入**」，不是把视频文件传给 provider——当前视频 provider 契约（server/providers/videoProvider.ts:59-63）只接受 `firstFrame` 图片 dataUrl，本定稿不改变 provider 请求形状。

额度：first-frame 维持 0–1 条（NODE_SPECS inputs.firstFrame=1 不变）；T4「禁 video/result-video → video-generator 的 **reference** 边」（workflow.ts:484-501）**保持不变**——本次只放行 first-frame 句柄，reference 依旧 schema 层拒绝。

### 契约/类型变更清单

单一事实源仍是 `src/types/workflow.ts` + `src/lib/documentSnapshot.ts`（前端连线）+ `server/lib/workflowSchema.ts`（服务端 schema），三处必须同步改：

1. `isVideoSourceKind`（workflow.ts:422-424）：已含 result-video，**无需改**。注意它同时被 `forbiddenReferenceEdgeIndexes` 用于 T4 拒绝 reference 边——实现时**不得**通过改 isVideoSourceKind 来放行，必须在 first-frame 句柄分支单独判定源 kind。
2. `resolveTargetHandle`（documentSnapshot.ts:463-481）：显式 handle 分支当前要求 `isImageSourceKind(sourceKind)` 才接受 reference/first-frame（行 472）。改为：`rawHandle === EDGE_HANDLE_FIRST_FRAME` 时接受 `isImageSourceKind(sourceKind) || sourceKind === "result-video"`；reference 分支维持仅图片源。缺省推断分支（行 474-480）**不**为 result-video 推断 first-frame（避免拖线歧义：result-video 必须显式连到 first-frame 句柄）。
3. `isV8ConnectionValid`（documentSnapshot.ts:515-550）：无需结构性改动——first-frame 分支经 resolveTargetHandle 解析后走 `targetSpec.inputs.firstFrame` 额度检查（行 547-549）自然生效。
4. `server/lib/workflowSchema.ts:449-457`（first-frame 分支）：源 kind 白名单由 `image | result-image` 扩为 `image | result-image | result-video`，错误文案同步。
5. `server/engine/runner.ts` 视频步骤首帧解析（行 364-372）：新增「首帧源为 result-video」分支——从该结果节点产物（`/api/files/xxx`，files 表 video/mp4）抽取首帧为图片，再走既有 `firstFrame: ReferenceImageInput` 通路。抽帧产物需满足与上传图相同的校验语义（AGENTS.md §4：MIME/尺寸/本地引用校验），assetSha256 记录为抽帧后图片的哈希。
6. 前端：`ResultVideoNode.tsx:65-68` 的「作为输入」按钮解禁（当前 disabled + 「暂不可用」文案），行为与 result-image 的「作为输入」一致；`documentConnectionRejection`（flowStore.ts:1495-1497）中「本版视频素材不能作为生成节点的输入」文案需分流——result-video → video-generator/first-frame 合法，video（用户上传视频）→ 任何生成节点仍拒绝。
7. `forbiddenReferenceEdgeIndexes`（workflow.ts:488-501）与 schema 层 reference 分支：**不改**，result-video 的 reference 边依旧非法。

### 待确认（标出，不阻塞定稿，实施卡开工前由 backend 核销）

- 首帧抽取的执行位置：worker 进程内 ffmpeg（新依赖）vs 现有 pipeline 已有抽帧能力。**待 backend 技术核实**；若需引入系统级 ffmpeg 依赖，须回 architect 补充决策记录（部署影响）。
- 抽帧失败（损坏 mp4 / 超时）→ 该 step 按 `failed` 终止，错误文案明确「首帧抽取失败」，**不得**降级为无首帧继续生成（fail-closed，防止静默改变用户意图）。

### 影响面

- 共享类型与连线规则三处同步改（上清单 2/4/6），跨前后端边界——按 AGENTS.md §6，实施卡提交前必须跑 ast-grep + dependency-cruiser 并报告影响面
- 服务端视频步骤新增抽帧依赖（待确认项）
- 无 DB schema 变更、无迁移、无事件契约变更

### 验收断言

- result-video 显式拖线至 video-generator first-frame 句柄：连线成功；连至 reference 句柄：拒绝
- video（上传视频节点）→ video-generator 任何句柄：拒绝（文案区分「上传视频」与「视频结果」）
- 同一 video-generator 已有 1 条 first-frame 边时，result-video 再连：拒绝（额度 1）
- 服务端 schema：构造含 result-video→first-frame 边的文档 POST /api/run-plan 通过校验；result-video→reference 边被拒绝
- 端到端：result-video 作首帧的 run，provider 收到的 firstFrame 为抽帧图片 dataUrl，assetSha256 与抽帧产物一致；抽帧失败 run 以 failed 终止且无 provider 请求

---

## 4. RUN-07：状态词汇统一（T4 拍板：以 DB 层为准）

### 结论

统一为 **DB 层词汇**：run 级终态 `succeeded` / `failed`。事件层（RunEvent）现状 `success` / `error` 改名对齐为 `succeeded` / `failed`，消灭 lifecycle.ts:405 `clientStatus` 手工映射与 history.ts:115 的反查映射。节点级 `NodeRunStatus` 的 `success` / `error` **保留不动**（节点投影是前端本地语义，改动面大且无对账风险）。

**被否决的选项**：以事件层为准（DB 改 success/error）——usage/历史/对账/评估账本全部读 generation_runs.status 的 succeeded/failed（history.ts:75、runQueueContracts.ts 等），改 DB 词汇要同步迁移全部历史数据与对账查询，风险与成本均高于改事件层。

### 迁移路径（两步，fail-closed）

1. **全表扫描断言**（迁移脚本前置）：`SELECT DISTINCT status FROM generation_runs` / `generation_run_steps` / `generation_jobs`，断言集合 ⊆ 目标词汇 ∪ 既有活动态词；出现计划外值即中止迁移。
2. **收紧 CHECK**（非破坏性，不动列类型不删数据）：
   - `generation_runs`：`(queued,running,retry_wait,cancel_requested,cancelled,succeeded,failed,outcome_unknown)` —— 删除 `'success','error'` 两个别名
   - `generation_run_steps` / `generation_jobs`：当前 CHECK 已无双轨别名（database.ts:293,315），**确认即可，无需改**
3. 事件层改名（RunEvent 契约变更，见下）；lifecycle.ts:405 映射删除；history.ts:115 映射删除。

### RunEvent 契约变更（非向后兼容，需前后端同批发版）

`NodeStatusRunEvent`（workflow.ts:703-724）：
- success 变体 `status: "success"` → `status: "succeeded"`（其余字段不变：images/videos 保留）
- error 变体 `status: "error"` → `status: "failed"`（error 消息字段名保留）
- 活动态变体 `cancel_requested`：随 U3 一并从事件契约删除（同时从 `NodeRunStatus` 与 `isNodeRunActive` 移除）；`cancelled` 终态保留（恢复窗口内 run 已被终止的合法结局仍可能命中历史数据）

前端投影（flowRunEvents.ts / flowStore.ts）：事件 `succeeded/failed` → 节点 `NodeRunStatus` `success/error` 的映射集中在一个函数（单点），节点级词汇不变。

### 合法跃迁表（run 级，供 backend 加 transition assert）

```
queued → running → succeeded | failed | outcome_unknown | cancelled
queued → cancelled                      （无取消入口后：仅恢复/上游失败连带路径，claim.ts:261-263）
running → outcome_unknown               （租约过期且 attempt_started，claim.ts:221）
retry_wait → queued | running           （安全重排，attempt 未开始）
终态（succeeded/failed/outcome_unknown/cancelled）→ 无任何出边
```

### 验收断言

- 迁移脚本自带断言 SQL：全部既有值落在新 CHECK 内；写入 `success`/`error` 被约束拒绝（回归测试）
- `isNodeRunActive` / `isNodeRunTerminal` 对所有服务端可达状态穷举覆盖（参数化测试喂遍 run 级全集）
- grep 全仓库无 `status === "succeeded" ? "success"` 类手工映射残留；SSE 重放历史事件（改名前写入的旧事件行）——**待确认**：旧事件表行含 success/error 字样，前端 normalize 需做一次性兼容读取（accept both，投影到同一节点态），或迁移脚本重写事件表。二选一由 backend 实施卡定，本文不替上游拍板

---

## 5. RUN-02：progress 事件契约（向后兼容）

### 结论

`RunEventMeta`（workflow.ts:687-701）增加可选字段：

```ts
progress?: {
  phase: string;              // "image" | "video-submitted" | "video-polling" | "queued"
  done: number;               // 已完成子单元数；无计数语义时与 total 同缺省
  total: number;
  queuePosition?: number;     // 排队中由 claim/enqueue 路径发出
};
```

约束（机检等价物）：
- 字段整体可选：旧前端忽略、旧后端不发，均合法——无数据迁移、无 CHECK 变更
- `done`/`total` 仅在 provider 或执行器真实返回计数时填充；**禁止编造百分比**。视频 provider 不支持百分比时只发 `{phase}` 心跳（done/total 可缺省为 0/0 或省略，由实施卡定稿 TS 精确形状——建议 done/total 本身也可选，避免 0/0 歧义）
- 同一 run 内 progress 事件 `done` 单调不减；SSE 重放经 seq 去重后不得导致前端进度回退

视频 poll 是否返回百分比（T1）属 backend 技术核实卡，走 `docs:apiyi` 知识门禁；本定稿只锁 shape，不锁能力。

### 验收断言

- batchSize=4 图片 run：事件流含 done=1..4 且单调不减；断线重连重放后前端进度不回退
- 视频 run：每 poll tick 至少一条 phase 心跳事件；provider 无百分比时全部事件无 done/total 假值
- 类型层：不含 progress 的旧事件对象仍通过 TS 校验（向后兼容编译断言）

---

## 6. 汇总：给拆卡的可追溯清单

| 实施主题 | 承接域 | 本定稿条款 | 依赖 |
|---|---|---|---|
| 取消死代码清理（可选） | backend | §1 | 无 |
| RUN-03 恢复脱困 | frontend（主）+ backend（404 窗口语义测试） | §2 | 无，P1 优先 |
| 视频结果作下游输入 | frontend + backend 协同 | §3（含 2 个待确认项） | backend 抽帧核实先行 |
| 状态词汇统一 + 事件改名 | backend（迁移+契约）+ frontend（投影映射） | §4 | 与 RUN-02 同批发版（都动 RunEvent） |
| progress 事件 | backend + frontend | §5 | T1 知识门禁结论（只影响视频百分比，不阻塞 shape 落地） |

硬纪律复述：以上实施均不得放宽 campaign/slot 账本、provider 证据链与评估门禁（AGENTS.md §4）；涉及 RunEvent 的两项（§4/§5）建议合并为一个契约发版批次，减少前后端协议错配窗口。
