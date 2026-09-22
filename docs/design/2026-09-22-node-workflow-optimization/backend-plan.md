# 执行链与运行态可靠性优化方案（方向 C · backend）

- 基线：main @ 0584cd7（开工 `git log -1` 已确认）
- 作者：backend
- 日期：2026-09-22
- 状态：待用户定稿；定稿前不动任何产品代码
- 输入：orchestrator 转贴的只读审计 findings（RUN-01 ~ RUN-06），本卡逐条核验、增补、定级

## 0. 阅读指引

每条 finding 包含：证据（文件:行）、问题、严重度（P0 阻断 / P1 用户被卡死或安全语义受损 /
P2 体验与效率）、规模（快赢 = 小改动可直接排期；需评审 = 契约/状态机/并发模型变更）、
改法、验收断言设想、影响面与迁移路径。

本方案无 P0。P1 两条（RUN-01、RUN-03），与审计建议一致。

## 1. 现状执行链速览（核验后的事实）

- 入口：`POST /api/run-plan`（`server/index.ts:102`）落 `generation_runs` /
  `generation_run_steps` / `generation_jobs` 三张持久化表。
- Worker：`startGenerationWorker` 单进程单 worker，`busy` 标志保证串行
  （`server/engine/runQueue/worker.ts:274-299`），轮询间隔取
  `config.generationWorkerPollMs()`（worker.ts:291）。
- Claim：`claimNextJob` 事务内 `SKIP LOCKED` 取 job，并用 NOT EXISTS 保证同一 run 内
  严格按 step_index 顺序执行（`server/engine/runQueue/claim.ts:33-55`）；
  `lockRun` 对每个 run 加进程级咨询锁。
- 租约：job 带 `lease_expires_at`，心跳续租（worker.ts:150-159）；
  `recoverExpiredGenerationJobs` 在每次 claim 前回收过期租约：
  上游调用开始（attempt_started）后崩溃 → `outcome_unknown`，绝不自动重放；
  调用开始前崩溃 → 安全重新排队（claim.ts:205-279）。
- 视频：submit 拿 taskId 后 `markVideoTaskSubmitted` 持久化（claim.ts:177-202），
  随后在 worker 同一次执行内同步 poll 到完成/超时
  （`server/engine/runner.ts:385-413`，超时 VIDEO_POLL_TIMEOUT_MS）。
- 状态机唯一声明处：`src/types/workflow.ts:70-79`（NodeRunStatus），
  RunEvent 唯一声明处 `src/types/workflow.ts:670-740`；server 端 re-export
  （`server/engine/runner.ts:62`），两端共用。
- SSE：`GET /api/run-plan/:id/events`（`server/routes/runPlan.ts:376-384`），
  ownership 校验后流式推送，支持 Last-Event-ID 续传；前端消费逻辑在
  `src/store/flowStore.ts:2820-2873`，刷新后由 `resumeRecentResults`
  （flowStore.ts:4327-4409）重新挂载。

## 2. Findings

### RUN-01 取消链路完全不可达（P1 · 需评审，前后端协同）

证据：
- 路由层只有 `POST /api/run-plan` 与 `GET /:id/events`、`GET /:id`
  （server/routes/runPlan.ts:376-394；server/index.ts:102-103），无 cancel 路由。
- 全仓库 grep：`cancel_requested` 只出现在读取/IN 列表（worker.ts:76,85,154；
  claim.ts:67,137,215；lifecycle.ts:194,200,286,290,296…），没有任何代码写入该状态；
  `generation_runs.cancel_requested_at` 列已由迁移建好（server/lib/database.ts:275）
  但无写入者。因此 worker.ts:85-88、claim.ts:137、lifecycle.ts:200 的取消分支全是死代码。

问题：用户对一个正在运行（尤其视频最长 ~15 分钟）的付费任务没有任何干预手段；
队列里排队的任务也不能撤。与前端节点审计 IMGGEN-02 同根。

改法（契约提案，需 architect 确认 + frontend 同步实施）：
1. 新增 `POST /api/run-plan/:id/cancel`，body 空；服务端事务：
   ownership 校验（非 owner/admin 一律 404，沿用非披露语义）→
   仅当 run 处于非终态时，把 run 与当前 job 置 `cancel_requested`，
   写 `cancel_requested_at`，append node-status(cancel_requested) 事件；
   重复调用幂等（已是取消态/终态时按 GET 语义返回当前状态，不报错、不改写）。
2. 语义边界（沿用代码里已有的设计意图，需产品确认）：
   - Provider 调用开始前取消：job/step 终态 `cancelled`（claim.ts:261-263、worker.ts:77-79）。
   - Provider 调用已开始/已完成后取消：不撤销已计费请求，run 仍以 `succeeded`
     + CANCELLED_AFTER_START_WARNING 收尾、已产出结果保留（lifecycle.ts:200,252,283-292），
     仅停止后续 step。也就是「取消 = 停止后续，不回滚已发生」。
3. 视频 poll 循环每 tick 检查取消（见 RUN-08），图片在 beforeProviderCall
  （claim.ts:137）与错误处理处（worker.ts:85）已有分支，路由打通后即生效。

验收断言设想：
- 排队中 run 调 cancel：run/job/step 终态 cancelled，无 provider 请求发生；
  重复 cancel 幂等；非 owner 得 404。
- 图片 provider 调用前 cancel：终态 cancelled 且无计费证据行。
- 视频已 submit 后 cancel：收到 cancel_requested 事件，poll 循环在下一个 tick 退出，
  run 不转为 failed；已持久化 taskId 与已有产物保留。
- cancel 一个终态 run：返回 200 + 当前终态，不产生新事件。

影响面：新增路由不改既有响应结构；RunEvent 的 cancel_requested 状态前端已有类型
（workflow.ts:707）但无 UI，需要 frontend 补节点取消按钮与态呈现（IMGGEN-02）。
无数据迁移（列与 CHECK 约束已存在，database.ts:275-281）。

### RUN-03 恢复失败投影成 retry_wait，节点永久活动态、按钮锁死（P1 · 需评审）

证据：
- `resumeRecentResults` 先 GET run 状态（flowStore.ts:4340-4347），404 已给出
  「服务已重启或恢复窗口已过」的明确文案（flowStore.ts:4343-4344），
  但 catch 块不区分原因，一律投影成 `node-status: retry_wait`
  （flowStore.ts:4377-4402，关键行 4386、4398）。
- `retry_wait` 被 `isNodeRunActive` 判为活动态
  （src/types/workflow.ts:217-219），且服务端此时其实不会再推任何事件
  （run 可能已终态或已过恢复窗口），节点永远转圈、运行按钮永久禁用。
- consumeRunEvents 的 2h 超时（flowStore.ts:2832-2835）最终也走同一个 catch，
  即用户至少被锁 2 小时才恢复操作能力。

问题：刷新/断线后的恢复失败把用户锁进一个无出口的伪活动态；「勿重复提交」的本意
是好的，但不能以永久禁用操作为代价。

改法：
1. catch 中按错误类型分流：
   - GET 404 / 恢复窗口已过：投影为非活动终态，建议复用 `outcome_unknown`
     （语义=结果无法确认，workflow.ts:222 已将其判为终态），
     error 文案保留现有「无法继续跟踪」说明，并提供两个出口按钮：
     「重新同步」（重走 GET + SSE）与「重新运行」（发起新 run）。
   - 网络错误/5xx：投影为新的本地态「同步中断」（见下），允许手动重试同步，
     不进入 active 也不冒充终态。
2. 新本地态的两种实现，需 architect 拍板：
   - 方案 a（推荐）：不扩 NodeRunStatus，在 node.data 增加本地 UI 字段
     `syncStalled?: boolean` + error；不进文档语义、不进 SSE 契约，纯前端本地态，
     符合 AGENTS.md「runtime/temporary UI state 不入业务文档」。
   - 方案 b：NodeRunStatus 增加 `sync_failed`，需同步改 server CHECK 约束、
     两端状态机与历史投影，属契约变更，迁移面大，不推荐。

验收断言设想：
- 构造 GET run 返回 404 后 resume：节点脱离活动态，按钮恢复，可看到两个出口；
  点「重新同步」会重新请求且行为幂等。
- GET 返回 500：进入 syncStalled，不转圈、不允许误判成功；重试成功后清除。
- 已收到终态事件后再发生网络错误（terminalRecorded=true）：不覆盖终态
  （flowStore.ts:4378 已有此判断，补测试固化）。

影响面：主改动在 src/store + 节点 UI（frontend 域）；backend 需确认
GET /api/run-plan/:id 在恢复窗口过后稳定返回 404（当前实现 runPlan.ts:386-394，
需补「恢复窗口过期 → 404」的服务端测试并书面确认窗口语义）。不涉及数据迁移。

### RUN-02 进度粒度过粗（P2 · 需评审，契约扩展但向后兼容）

证据：
- claim 时只发一条 node-status(running)（claim.ts:80-82）；
  图片补图/分批过程无 k/N 事件（server/engine/runner.ts:316-323 一次性等待
  generateExactImages 返回）；
  视频 15 分钟 poll 循环全程无任何事件（runner.ts:395-413）。

改法：在 RunEvent（唯一声明处 workflow.ts:670-740）给 running 变体增加可选字段：
`progress?: { phase: string; done: number; total: number; queuePosition?: number }`。
- 纯增量、可选字段：旧前端忽略即可，旧后端不发也不影响新前端，无需数据迁移。
- 图片：generateExactImages 内部按实际子请求发 phase="image" 的 done/total；
  排队中可由 claim/enqueue 路径发 queuePosition。
- 视频：phase 区分为 submitted / polling；done/total 仅在 provider poll 返回
  百分比时填充（见决策点 D1，拿不到就只发 phase 心跳，不编造百分比）。

验收断言设想：
- batchSize=4 的图片 run：前端按事件顺序收到 done=1..4，进度单调不减；
  断线重连后 SSE 重放不导致进度回退（seq 去重 flowStore.ts:2847-2851）。
- 视频 run 每 N 秒至少有一条 phase 事件；provider 不支持百分比时不出现假数字。

### RUN-04 部分成功明细被降级为聚合 warning（P2 · 小契约增补 + 前端展示）

证据：
- 明细其实已持久化：step 的 failures_json 在 completeJobSuccess 落库
  （lifecycle.ts:209,216,252,277），finalizeSuccessfulRun 把每条 failure 展开为
  generation_outputs 的 error 行（lifecycle.ts:88-93）；
  node-status(success) 事件携带 failures（lifecycle.ts:277，类型见
  workflow.ts:718-725 一段的 success 变体）。
- 但节点 UI 只渲染一个 error 字符串
  （src/components/nodes/NodeFrame.tsx:163-166），「N 个生成任务失败」聚合文案
  （lifecycle.ts:94,252）看不到是哪一张、为什么。

改法：
1. backend：failures 项补稳定索引（关联 batch 下标 / prompt / 如有 provider 原图引用），
   保证可定位到具体产出位；评估 evidence 链不放宽。
2. 新增「仅重试失败项」能力（契约需评审）：run-plan 请求增加可选
   `retryFailedFromRunId`，服务端校验 owner、从源 run 的 failures 定位、
   只生成缺失项并合并进新 run 的结果；同样走 campaign/slot 账本
   （AGENTS.md §4，新增的也是付费请求，必须绑定新 slot）。
   若评审认为重试面过大，第一期只做「展开看明细 + 整节点重跑」，retry-failed 单列。
3. frontend：错误区可折叠展开 failures 列表。

验收断言设想：4 中 2 失败时，failures 含 2 条且索引正确指向失败位；
retryFailedFromRunId 只产生 2 次 provider 请求，成功产物与源 run 成功项合并展示，
usage/账本只记录新增请求数。

### RUN-05 单 worker 串行，长视频 poll 阻塞所有后续 job（P2 · 需评审，独立切片）

证据：单 worker busy 标志串行（worker.ts:277-290）；视频 poll 在一次 job 执行内
同步占用 worker 直到完成或 VIDEO_POLL_TIMEOUT_MS 超时（runner.ts:388-413）；
期间同账号其他项目的图片 job 全部排队等待。

改法（两个可独立交付的切片，均需计费核对前置，见 D2）：
1. 切片 A — worker 并发度可配：worker.ts 支持并发 N 个 job（去掉单 busy，
   每路独立心跳）。跨 run 并行在现有 SQL 下天然安全：run 内顺序由
   NOT EXISTS 保证（claim.ts:46-51），run 间隔离由 lockRun 保证，
   SKIP LOCKED 保证不撞单。需核对：每用户 ActiveRunLimitError 语义
   （server/routes/generate.ts:386-387）在并发执行下不变、usage 与 campaign
   账本的并发写入正确。
2. 切片 B — 视频 poll 不占执行槽：taskId 已持久化（claim.ts:197-200），
   可把 poll 拆给独立的低频 poller（或带延迟回到队列的视频 poll job），
   submit 后释放主 worker；poller 每轮续租并检查取消（RUN-08）。
   队列位置通过 RUN-02 的 queuePosition 反馈。

验收断言设想：并发 N=2 时两个不同 run 的图片 job 时间重叠执行，
同一 run 的 step 仍严格串行；视频 submit 后主 worker 立刻可 claim 其他 job；
poller 崩溃后租约过期仍按 outcome_unknown 关闭，不重复 submit、不重复计费
（claim.ts:173-176 注释承诺的语义，补并发场景测试）。

### RUN-06 SSE 断线静默 2h、单坏帧终止整条流（P2 · 快赢 + 小增补）

证据：
- onerror 为空实现，完全依赖原生 EventSource 重连，直到 2h 总超时才报错
  （flowStore.ts:2868-2871 + 2832-2835），期间用户对连接状态无感知。
- onmessage 里任何一帧 JSON/normalize 抛错都会 finish（终止整条消费 Promise），
  文案「运行事件格式无效」（flowStore.ts:2864-2866）。

改法：
1. 有限重连计数：onerror 计数并给出可见「连接中断，重连中（n/N）」本地态；
   超阈值后停止自动重连，降级为「手动重新同步」出口（复用 RUN-03 的出口），
   不等到 2h。
2. 坏帧隔离：单帧 parse 失败不 finish，记录 seq 断点后继续消费后续帧；
   连续坏帧超阈值才判定流损坏。服务端 SSE 帧由 appendRunEvent 落库后统一输出，
   不应产生坏帧；frontend 的容忍只是防线，同时 backend 补一条测试
   （事件表中存在异常行时 SSE 跳过该行不中断连接，而非把异常序列化给客户端）。
3. 2h 绝对超时保留（覆盖最坏合法耗时，flowStore.ts:2831 注释），但不再是唯一出口。

验收断言设想：模拟 onerror 连续触发 n 次后出现手动同步入口；
注入单条坏帧后流继续、终态事件仍被消费；连续坏帧超阈值才报错。
影响面以前端为主；backend 仅 SSE 服务端防御，无契约变更。

### RUN-07（增补）状态词汇双轨：succeeded/success、failed/error 并存（P2 · 需评审）

证据：
- generation_runs 的 CHECK 同时允许 succeeded 和 success、failed 和 error
  （server/lib/database.ts:278-281）。
- terminateRun 发事件前要把 failed 手工映射成 error（lifecycle.ts:405），
  说明同一状态在 DB 与事件层名字不同，靠映射维持。
- 前端终态判定只认 success/error，不认 succeeded/failed
  （workflow.ts:221-223）：一旦任何查询路径把 DB 原始状态泄漏给前端，
  该节点既非活动态也非终态，落入第三种未定义行为。

改法：统一为事件层词汇（run 级 succeeded/failed，节点级 success/error
维持现状亦可，但必须二选一并写进契约）。落地为一次迁移：收紧 CHECK 约束前
先全表扫描确认无双写值，再替换约束；不动列类型、不删数据，属非破坏性结构收口。
改前需 grep 所有 status 写入点确认来源。列为需评审：涉及共享状态词汇与迁移。

验收断言设想：迁移后写入 succeeded/failed 之外的别名被约束拒绝；
全部既有数据值落在新约束内（迁移脚本自带断言 SQL）；
前端 isNodeRunActive/isNodeRunTerminal 对所有服务端可达状态完备覆盖（穷举测试）。

### RUN-08（增补）视频 poll 循环无取消检查点、无续租联动（P2 · 随 RUN-01 实施）

证据：runner.ts:395-413 的 for(;;) 只检查 deadline 与 poll 结果；
取消路由即使落地，正在 poll 的 worker 也要等到下一个 interval 甚至超时才会退出；
心跳只续租（worker.ts:150-158），不回读取消状态。

改法：ExecuteStepOptions 增加 `isCancelled: () => Promise<boolean>`
（worker 侧查 job 状态，低频、复用 poll tick），poll 循环每 tick 先查；
已取消则停止 poll，按 RUN-01 的「调用后取消」语义收尾（taskId/已得产物保留，
不抛 failed）。注意幂等：取消检查本身不触发任何 provider 写操作。

验收断言设想：视频 poll 中 cancel，在一个 interval 内 worker 退出等待；
取消后 run 不出现 failed，无多余 provider 请求。

## 3. 波次排期建议

1. 波次 1（解锁用户）：RUN-01（cancel 路由 + 契约）+ RUN-08 + RUN-03 分流，
   需前后端协同派卡，契约先由 architect 定稿。
2. 波次 2（看得见的状态）：RUN-02（progress 可选字段）+ RUN-04 明细展示；
   RUN-04 的 retry-failed-only 视评审结果决定是否同期。
3. 波次 3（吞吐）：RUN-05 切片 A 先行（并发度），切片 B（视频 poll 剥离）随后；
   前置条件是计费/账本核对（D2）。
4. 波次 4（收口）：RUN-06 + RUN-07。
与 t_b75026bf（测试库隔离，scripts/ 域）无文件交集，实施波次与其错开即可。

## 4. 需用户/architect 拍板的决策点

- D1：视频 provider（当前 Seedance 链路）的 poll 返回是否含百分比/排队状态？
  定不了则 RUN-02 只发 phase 心跳，不展示假百分比。需要查 API易 离线快照
  （实施卡需走 docs:apiyi:kb:check 知识门禁，本方案卡不查）。
- D2：提高 worker 并发前，确认 usage_events、campaign/slot 账本在并发下的
  对账口径；确认每用户 active run 上限（ActiveRunLimitError）是在 enqueue 时
  计数，并发执行不改变该上限语义。
- D3：RUN-03 的「同步中断」采用纯本地 UI 字段（推荐）还是扩 NodeRunStatus。
- D4：取消语义确认——「上游调用后取消 = 保留已计费产物、仅停后续，
  run 记 succeeded+warning」是否符合产品预期；如要求「尽力不展示/可丢弃」，
  需要另定产物保留与结果流处理规则。
- D5：RUN-07 状态词汇统一方向（以事件层为准还是 DB 层为准）。

## 5. 非目标（本方案明确不做）

- 不改任何 server/src/tests/e2e/data 文件；本卡为纯文档卡。
- 不重写执行引擎、不换队列中间件；所有改动在现有三表 + 单进程 worker 模型上演进。
- 不放宽付费节点准入、campaign/slot 账本、provider-original 证据链
  （AGENTS.md §4）；新增的任何重试/并发路径都继续走同一套计费与证据语义。
- 不动前端视图实现（本文仅提出契约与验收，实施由 frontend 卡承接）。
