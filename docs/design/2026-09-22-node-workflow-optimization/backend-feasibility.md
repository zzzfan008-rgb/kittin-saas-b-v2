# 执行链技术前提核实（T1/T2）

- 基线：main @ 0584cd7（开工 `git log -1` 已确认）
- 作者：backend
- 日期：2026-09-22
- 性质：纯核实卡，不改产品代码；本文件为唯一交付物
- 输入：backend-plan.md（p2b2-opt-backend-plan 分支，commit 7276da5）中的决策点 D1/D2；
  用户裁决 U3=「彻底删除取消按钮」

## 0. 结论摘要

| 项 | 结论 | 对实施的影响 |
|---|---|---|
| T1 Seedance poll 是否返回进度 | **B：无百分比、无排队位次、无阶段明细**；只有任务状态机 `queued → running → succeeded/failed/expired` | RUN-02 视频节点只发 phase 心跳（submit→queued→running→completed），**不编造百分比**；queuePosition 不可由 provider 获得 |
| T2 并发前计费/账本对账 | usage_events 与 campaign/slot 账本在并发下对账安全；active run 上限在 **enqueue 时**按 run 行状态计数，与执行并发无关 | RUN-05 切片 A 可做：并发度环境变量可配，默认 1，先落 N=2、上限收窄在 2–4；切片 B 技术可行但 U1 后优先级降低 |
| RUN-01 / RUN-08 | 用户 U3 已裁决彻底删除取消按钮，**正式作废**，不再核实取消链路 | backend-plan.md 波次 1 的取消相关条目整体移除；RUN-03 升为唯一脱困路径（frontend 域为主） |

## 1. 方法与知识门禁

T1 按 AGENTS.md §5 走 API易 本地知识门禁，不凭记忆断言 provider 能力：

- `npm run docs:apiyi:kb:check` 通过：
  快照 `2026-09-18T04-42-51.697Z-6e0c4634fe56ccfd`（2799 页，27 个精选来源）。
- T1 查阅的快照页面（均含 SHA-256，见下节引用）：
  - `pages/en/api-capabilities/seedance2/video-generation.md`
  - `pages/en/api-capabilities/seedance2/overview.md`
- 当前视频链路代码交叉核对：`server/providers/videoProvider.ts`、`server/engine/runner.ts`。

T2 为仓库内事实核实：worker/claim/lifecycle/persist 与账本省代码逐处阅读，
引用均给出文件:行。本卡不跑测试、不跑全量构建（任务硬约束）。

## 2. T1：视频 provider poll 是否返回进度

### 2.1 证据

API易 快照 `2026-09-18T04-42-51.697Z-6e0c4634fe56ccfd`：

1. `pages/en/api-capabilities/seedance2/video-generation.md`
   SHA-256 `2934974934a5c05ad3dd5821e896d8ca5c659ee6f27c3ce43ca002348701fd5d`
   - 轮询接口：`GET /seedance/api/v3/contents/generations/tasks/{id}`（第 289 行）。
   - 完整任务响应实测样例（第 303–322 行）字段仅有：`id`、`model`、`status`、
     `content.video_url`、`usage.completion_tokens/total_tokens`、`created_at`、
     `updated_at`、`seed`、`resolution`、`ratio`、`duration`、`framespersecond`、
     `generate_audio`、`draft`。
   - 状态机（第 326 行）：`queued → running → succeeded / failed / expired`，
     成功态名为 `succeeded`。
   - 全页无 percentage / progress / queue_position / 阶段明细字段；
     grep `progress|percent|position` 无任何响应字段命中（仅命中计费百分比与文案）。
   - 建议轮询节奏（第 293–299 行）：首次在 submit 后 20–30 秒（更早必返回 queued），
     间隔 10–20 秒，10 分钟无终态视为异常（高峰放宽到 15 分钟）。
     实测端到端：2.5 在 720p/5s 约 150 秒，720p/30s 约 330 秒。
2. `pages/en/api-capabilities/seedance2/overview.md`
   SHA-256 `f5d50e6f744c4d06555163a34c2730a8530230e0905bdc8c40755cd4b4c1efcc`
   - 同样只描述上述状态机与计费 token（`usage.completion_tokens`），无进度字段。

当前代码与快照一致，且未读取任何不存在的进度字段：

- `server/providers/videoProvider.ts:120-124`：`queued → pending`、`running → running`，
  仅二态映射；成功只取 `content.video_url`、`duration`（147-157 行）；
  失败取 `error.message`（159-165 行）。
- `server/engine/runner.ts:395-413`：poll 循环只判 completed/failed 与 deadline，
  无进度事件。当前常量 `VIDEO_POLL_INITIAL_DELAY_MS=20s`、
  `VIDEO_POLL_INTERVAL_MS=20s`、`VIDEO_POLL_TIMEOUT_MS=15min`（runner.ts:58-60），
  与快照建议节奏一致。

### 2.2 结论：档 B

Seedance（`doubao-seedance-2-5-260628`，当前唯一视频链路）的 poll **不返回
百分比、排队位次或渲染阶段明细**；可区分的阶段只有 provider 状态机的
`queued` 与 `running` 两态。

### 2.3 对 RUN-02 的影响（实施约束）

1. RunEvent 的 running 变体可加 `progress?: { phase; done?; total?; queuePosition? }`
   （backend-plan.md RUN-02 的增量提案保持不变），但视频节点：
   - 只允许发 phase 心跳，映射口径固定为
     `submit 成功 → phase="queued"`（provider 返回 queued）、
     `phase="running"`（provider 返回 running）、
     `done 事件`（succeeded）；
   - `done/total` 与百分比对视频**永不填充**；
   - `queuePosition` 不得用视频 provider 数据填充（网关不提供）。
2. 心跳节奏沿用 20s 首查 + 20s 间隔常量；心跳事件必须在断线重连（Last-Event-ID
   重放）后不产生进度回退——phase 是无序阶段信息，前端不得把心跳计入数值进度。
3. 图片节点的 done/total 不受本结论影响（按我们自己的子请求数计数，来源可靠）。

## 3. T2：worker 并发前计费 / 账本对账口径

### 3.1 usage_events：每 run 一行，结构上不可能重复计费

- 表结构：`usage_events.run_id TEXT NOT NULL UNIQUE REFERENCES generation_runs(id)`
  （server/lib/database.ts:154-167），即一 run 至多一行 usage。
- 唯一写入点：run 成功收尾事务内 upsert
  `INSERT ... ON CONFLICT (run_id) DO UPDATE`（server/engine/runQueue/lifecycle.ts:113-127），
  与 `generation_runs` 置 `succeeded` 在同一事务（lifecycle.ts:104-128）。
- usage 汇总（`server/routes/usage.ts:17`）为只读 JOIN/聚合；owner 变更
  （server/routes/auth.ts:317）与清理（server/routes/projects.ts:199）都是
  批量维护路径，不影响计数口径。
- 结论：worker 并发不产生重复 usage 行。一个 run 的最终记账只取决于其终态事务，
  与多少个 job 在并发执行无关。

### 3.2 campaign/slot 账本：行锁 + 比较并换（CAS）更新，并发安全

- enqueue 时先对授权行 `SELECT ... FOR UPDATE`
  （server/lib/evaluationAuthorizationLedger.ts:310-313），随后对 slot 加行锁
  （server/lib/evaluationCampaign.ts:490，`lockedCampaignSlot(..., "update")`）；
  锁全程在「插入 run」的同一事务内持有（persist.ts:159-163）。
- 每次 provider 请求预留（`reserveEvaluationCampaignProviderRequest`，
  evaluationCampaign.ts:517-584）：
  - 持有 slot/campaign 行锁后做全部上限校验（556-564 行：requestIndex 必须连续、
    slot/campaign 请求数上限、slot/campaign 预算上限）；
  - slot 与 campaign 计数更新均为条件更新——WHERE 里带旧计数值
    （565-571、573-582 行），并断言 `rowCount === 1`（572、583 行），
    并发改动会直接抛错而非双写；
  - campaign 更新还在 SQL 内带 `+1 <= max` / `<= budget` 条件（579-580 行），双保险。
- slot 绑定 run 同样是条件更新 + rowCount 断言
  （evaluationCampaign.ts:508-513）；并有 UNIQUE(campaign_id, slot_id)、
  UNIQUE(campaign_id, case_id)、UNIQUE(campaign_id, sample_id) 约束
  （server/lib/database.ts:1126-1131）。
- 预留调用点在 `markAttemptStarted` 的事务内、provider 调用发生之前：
  worker → markAttemptStarted（claim.ts:105-167，job 行 `FOR UPDATE`）→
  startEvaluationProviderRequestEvidence（evaluationEvidenceStore.ts:263-305）→
  reserveEvaluationCampaignProviderRequest（298-305 行）。
- 结论：N 个并发 worker 同时走到付费边界时，行锁串行化、CAS 更新拒绝并发覆盖、
  上限在锁内校验。账本对账在并发下安全，不依赖单 worker 串行。

### 3.3 ActiveRunLimitError：enqueue 时计数，与执行并发度无关

- 上限常量 `ACTIVE_RUN_LIMIT = 180`（server/lib/generationLimits.ts:1）。
- 计数点在 enqueue 事务内（server/engine/runQueue/persist.ts:150-157）：
  统计本 owner 名下 `status IN ('queued','running','retry_wait','cancel_requested')`
  且未删除、已落 plan 的 run 行数；`>= 180` 抛 ActiveRunLimitError，
  路由映射为 409（server/routes/runPlan.ts:295-296）。
- 该门禁按 **run 行状态**计数，不按 worker 执行槽计数；worker 并发度变化
  既不增加也不减少 active run 的统计口径。
- 并发 enqueue 的竞态也已封死：同 owner 的容量检查前先取事务级咨询锁
  `pg_advisory_xact_lock('generation-run-owner:<ownerId>')`（persist.ts:126-130）；
  clientRequestId 幂等重放直接返回旧 run、不占新名额（persist.ts:131-141）。
- 另一处同口径计数用于账号数据转移/删除（server/routes/auth.ts:264-272,362-368），
  语义一致。
- 结论：提高执行并发不改变每用户 180 个活动 run 的上限语义；
  上限管的是「挂账中的任务数」，并发管的是「这些任务以多快速度被执行」。

### 3.4 claim 机制对并发执行的支撑（含一处措辞修正）

- claim SQL（server/engine/runQueue/claim.ts:33-55）：`FOR UPDATE OF j SKIP LOCKED`
  保证多 worker 不会拿到同一 job；`NOT EXISTS`（46-51 行）保证同一 run 内
  前序 job 未 succeeded 时后续 job 不可被 claim，即 run 内严格顺序不依赖单 worker。
- 每路执行有独立心跳续租（worker.ts:150-159），去掉单 `busy` 标志后
  （worker.ts:277-289）每路心跳独立即可，租约语义不变。
- 措辞修正（backend-plan.md RUN-05 切片 A）：「run 间隔离由 lockRun 保证」不够准确。
  `lockRun` 是 claim 事务内对 run 行的 `FOR UPDATE`（types.ts:127-133），
  事务提交即释放，并不覆盖整个执行期；执行期的互斥/顺序实际由
  job 状态 + NOT EXISTS + SKIP LOCKED 保证。对并发方案无实质影响，
  但实施卡不应再设计「持有 run 行锁到执行结束」（会长时间阻塞恢复/取消路径）。
- 崩溃恢复语义（claim.ts:205-279）与并发度无关：attempt_started 之后崩溃 →
  outcome_unknown，绝不自动重放；视频 taskId 已持久化时不重复 submit
  （claim.ts:173-202）。多 worker 下同一恢复事务仍受行锁保护。

### 3.5 结论：并发度建议

1. RUN-05 切片 A 可实施。建议：
   - 新增环境变量（如 GENERATION_WORKER_CONCURRENCY），默认 1，行为与现状完全一致；
   - 实施分两步：先以 N=2 上线并补并发测试，观察 provider 侧限流（429）、
     内存（每路持有批次图像 buffer）与 DB 连接占用；稳定后再评估放宽，
     本期实现上限收窄在 2–4，不做无限并发。
   - 不建议一步提到高并发：瓶颈不在账本（已证明安全），而在 API易 网关限流与
     单进程内存/连接，这些只能实测。
2. RUN-05 切片 B（视频 poll 不占执行槽）技术上成立：taskId 已持久化
   （claim.ts:177-202），submit 后可交还 worker，由低频 poller 续租；
   poller 崩溃仍按 outcome_unknown 关闭、不重复计费。但 U1 已禁用新建 video
   节点（「即将支持」），新增视频流量不再产生，切片 B 的收益仅剩存量/规划态
   video-generator 链路，建议在 RUN-02 phase 心跳落地后再评估，本期不优先。
3. 实施必须随附的并发测试（否则不算完成）：
   - N=2 时两个不同 run 的 job 时间重叠执行，同一 run 的 step 仍严格串行；
   - 并发走到付费边界时 slot/campaign 计数各只 +1、上限触发时拒入且无 provider 调用；
   - 并发 enqueue 同一 owner：active 计数无重影、幂等重放返回同一 run；
   - poller/worker 崩溃恢复在并发 claim 下仍为 outcome_unknown、不重复 submit。

## 4. RUN-01 / RUN-08 作废确认

用户裁决 U3=「彻底删除取消按钮」（提交后马上递交 API 无法真正撤销）：

- RUN-01（cancel 路由 + 契约）：作废，不实施、不保留接口位。
- RUN-08（视频 poll 取消检查点）：作废。
- `generation_runs.cancel_requested_at` 列与 cancel_requested 死分支保留现状，
  本卡不提出清理（清理属独立技术债，需另开卡评估，不在本优化批次）。
- 连带：RUN-03（恢复失败锁死）成为用户唯一脱困路径，优先级提升；
  其主改动在 frontend，backend 侧只需确认恢复窗口过期稳定 404（backend-plan 已列）。

## 5. 非目标与未运行项

- 只写 docs/design/**，未改 src/server，未跑测试（PG 锁）、未跑全量构建。
- T1 只核实了当前唯一链路 Seedance 2.5；快照中其他视频模型与本产品无关，未展开。
- 本文不替代实施卡的契约评审；并发度与 progress 字段落地仍需按
  backend-plan.md 的评审/波次流程走。
