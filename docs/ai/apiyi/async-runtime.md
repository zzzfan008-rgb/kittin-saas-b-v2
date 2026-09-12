# 业务异步运行时契约

最后核对：2026-09-03

## 边界

API易图片端点是同步接口：一次 HTTP 请求持续到生成完成，且没有上游任务 ID、查询接口或取消接口。本项目对前端提供异步任务体验，但 Worker 内部仍执行一次同步上游调用。

推荐链路：

1. API 校验工作流、节点参数、鉴权和素材归属。
2. 在同一数据库事务中创建 run、step 和待执行 job，立即返回 run_id。
3. Worker 使用 PostgreSQL 行锁和有序部分索引领取 job，将状态置为 running 并记录 lease。
4. Worker 同步调用 API易，解析结果并立即转存图片。
5. 在事务中写入输出素材、step 结果、事件和终态。
6. 前端使用已有 SSE 事件流获取进度；断线后按事件序号续传。

## 状态机

- queued：已入库，等待 Worker。
- running：Worker 已领取，尚未得到确定结果。
- retry_wait：明确命中可重试状态；available_at 记录最早可重试时刻，在该时刻之前对所有 Worker 不可见。
- succeeded：结果已转存并落库。
- failed：确定失败且不可重试，或明确重试已用尽。
- outcome_unknown：请求可能已被上游执行和计费，但本项目没有收到可验证结果。
- cancel_requested、cancelled：仅为兼容历史运行记录保留；当前产品不再提供用户取消入口。

终态为 succeeded、failed、outcome_unknown、cancelled。

## 领取与恢复

- 使用 SELECT ... FOR UPDATE SKIP LOCKED 领取 queued 或到期的 retry_wait job；领取条件始终包含 available_at <= 当前时间。
- generation_jobs 冗余不可变的 run_started_at 与 step_index，按 available_at、run_started_at、step_index、id 排序。部分索引只覆盖 queued/retry_wait，避免跨表排序。
- 前置步骤检查使用 generation_jobs(run_id, step_index, status) 索引；同一 run 中前序 step 未 succeeded 时，后续 job 不可领取。
- running job 必须记录 worker_id、lease_expires_at、attempt_started_at。
- Worker 定期续租。进程重启后，仅未开始上游调用的过期任务可重新排队。
- 一旦 attempt_started_at 已记录且进程在没有确定响应的情况下死亡，任务转为 outcome_unknown，不得自动重放。用户提示必须要求先核对 API易消耗记录，确认未扣费后再手动重新提交。
- 每个 step 使用稳定 idempotency_key 防止本地重复入队；该键不能被当作上游幂等保证。
- generation_runs.next_event_seq 通过原子 UPDATE ... RETURNING 分配事件序号；事务回滚不会消耗序号，同一 run 并发追加不会重复或产生缺口。

## 重试规则

- HTTP 429：退避后自动重试，最多 3 次。
- HTTP 503：仅在确认属于临时容量或渠道不可用时重试，最多 3 次。
- 已知由本地契约可确定的参数不支持或非法组合必须在请求前阻断；即使网关返回 503 也不得当作容量错误重试。
- HTTP 400、401、403、404、415：不重试。
- 超时、连接重置、连接中断、响应体截断：无法证明请求未到达或未计费，统一为 outcome_unknown，不自动重试。
- 内容审核拒绝：不原样重试。

固定退避为 5 秒、30 秒、120 秒，并加入 0-999ms 随机抖动。retry_count 只统计实际重放次数，不包含首次调用，因此最多产生 4 次真实上游请求。每次调度和达到上限都写结构化重试日志。

## API易传输层

- API易请求使用模块级复用、仅按请求注入的 Undici Agent，不调用 `setGlobalDispatcher`，避免影响结果 URL 下载、健康检查和其他网络请求。
- 三个网络阶段单独配置：TCP/TLS 建连 30 秒、等待响应头 600 秒、相邻 body chunk 最长静默 300 秒；空闲连接与服务端 keep-alive hint 均限制为 60 秒。
- `AbortSignal.timeout` 仍按模型契约保留 120/300/360 秒总请求预算。总超时与 connect/headers/body timeout 同时配置，实际由当前阶段中更早的截止条件触发：默认下 120/300/360 秒总预算会早于 600 秒 headers 上限，部分模型也会早于 300 秒 body 上限。因此阶段诊断码只在 Undici 阶段上限先触发时出现，不承诺每个默认模型都会观测到。
- `UND_ERR_CONNECT_TIMEOUT`、`UND_ERR_HEADERS_TIMEOUT`、`UND_ERR_BODY_TIMEOUT` 若由 Undici 先触发，会穿过 fetch 和响应 body 读取两条错误路径，保留在脱敏诊断中；总 `AbortSignal` 先触发时则记录 `TimeoutError`/`AbortError`。所有这些路径均为 outcome_unknown，Provider 层不自动重试。
- HTTP 2xx 且没有 `Content-Length` 时启用有界流式 JSON 读取。已收至少 1KiB、最后非空白字节为 `}`、严格 UTF-8 解码和 `JSON.parse` 均成功、顶层为对象，并在最后一块后静默 5 秒，才允许主动取消尾部读流并继续既有 schema/图片校验。
- 任意时刻最多存在一个 pending `reader.read()`。宽限期先到但 JSON 不完整时继续等待同一个 read，禁止并发 read 导致后续 chunk 丢失。
- 有 `Content-Length`、开关关闭、JSON 不完整、数组/标量顶层、非法 UTF-8、读流异常或响应超限时禁止尾部恢复。其中截断、读流异常和超限仍为 outcome_unknown，绝不据此重放付费请求；非 2xx body 若读取超时/中断也同样不得降级为可重试 503。
- 响应上限按本次经审查契约允许的最大返回图片数计算：每张图片最多 20MiB 解码字节，换算为 Base64 上界后再加 1MiB JSON 开销；超出契约的输出数在发送前拒绝，不静默裁剪。
- `APIYI_TAIL_STALL_SALVAGE=false`（也接受 `0`/`off`）只关闭宽限期提前收尾，仍走有界 reader 并保留响应大小上限；`APIYI_TAIL_STALL_GRACE_MS` 默认 5000，限制为 1000–30000ms。

## 用户运行语义

- 产品不提供取消按钮、客户端取消动作或公开取消 API。
- 用户提交后由队列持续执行到确定终态；刷新页面或断开 SSE 不会中止任务。
- 历史 cancel_requested、cancelled 记录继续可读，避免升级时破坏旧数据。

## 结果持久化

- b64_json 或 Gemini inlineData 必须解码后写入项目存储。
- URL 输出必须由服务端下载；FLUX 约 10 分钟过期，其他 URL 同样视为临时地址。
- 下载前重新校验 worker_id 与 job 状态；失去所有权的 Worker 不得继续落盘。
- 队列结果文件使用 runId:stepId:index 稳定幂等键。相同键和相同 SHA-256 内容复用已有文件；同键不同内容使用内容摘要后缀，禁止覆盖。
- 网络和磁盘 I/O 不放进持锁数据库事务。落盘函数返回本次是否新建文件的回执；成功事务回滚时，只补偿删除本次新建且未登记、也未被新 Worker 接管的文件。
- 下载成功、文件校验成功、素材记录与 step 结果在同一事务提交后，step 才能标记 succeeded。
- 日志只记录 provider、model、状态码、请求 ID、耗时、重试次数和白名单计费元数据；尾部收尾事件可额外记录 `bytes` 和 `graceMs`。不得记录密钥、完整提示词、图片数据或完整响应体。

## 运维参数

- GENERATION_WORKER_POLL_MS：Worker 空闲轮询间隔，默认 2000ms，配置范围 100-60000ms。
- 高吞吐部署可降至 500ms；低负载部署可升至 5000ms，以减少空轮询。Worker 每次唤醒会先清空当前可领取任务，再等待下一轮。

## 验收

- 提交 API 在上游调用开始前返回 run_id。
- 服务重启后 queued 任务可继续；不确定的 running 任务不会被重复计费。
- retry_wait 在 available_at 前不可领取，到期后可领取。
- 429/可重试 503 最多重放 3 次，退避为 5/30/120 秒；网络超时不重放。
- 刷新页面或 SSE 重连不会丢失已提交任务和事件。
- 同一 run 并发追加事件时序号严格递增、无重复、无缺口。
- 所有成功结果使用项目自有 URL，第三方临时 URL 不进入长期历史记录。
- 成功事务回滚不会留下本次新建的孤立结果文件。
