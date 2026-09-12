> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 图片生成有异步接口吗？支持任务 ID 查询结果吗？

> API易 图片生成均为同步调用，不提供任务 ID 异步查询接口，本文说明原因和推荐做法

## 简短回答

目前 API易 **不提供图片生成的异步任务 ID 查询接口**，所有图片模型均为**同步调用**：请求建立长连接 → 等待生成 → 直接返回图片结果。

我们是**原厂透传**模式，且**不记录用户业务数据**，因此无法提供"断线后凭 ID 取回结果"的能力。建议在客户端设置合理 timeout、保持长连接，并在自己的后台记录请求与回执。

<Info>
  **简单理解**：同步调用 + 合理 timeout + 客户端记录任务，等价于自己实现了一个轻量异步队列，本质区别不大。
</Info>

## 为什么没有异步任务 ID 查询？

<CardGroup cols={3}>
  <Card title="原厂透传模式" icon="forward">
    我们对图片接口保持与上游官方完全一致的同步行为，不在中间增加任务队列层，避免引入额外的不一致和延迟
  </Card>

  <Card title="隐私与安全优先" icon="shield">
    出于用户隐私和数据安全考虑，我们**不记录任何业务内容**（包括 prompt、生成图片），自然也无法事后凭 ID 取回
  </Card>

  <Card title="同步已可覆盖" icon="check">
    将 timeout 设到合理范围、保持长连接，绝大多数图片生成请求都能在一次调用内稳定返回
  </Card>
</CardGroup>

## 推荐做法

<Steps>
  <Step title="客户端保持长连接 + 合理 timeout">
    把 HTTP 客户端的 timeout 设到模型生成时间的安全上限（通常 60–300 秒，视模型而定），并启用 keep-alive，避免中间网络层提前断开。

    不同模型的耗时差异较大，可联系客服获取**按模型分类的 timeout 建议表**。
  </Step>

  <Step title="在自己的后台记录任务与回执">
    由于我方不保存业务数据，请在你自己的服务端为每次请求生成业务 ID，落库存储 prompt、参数、返回结果或错误信息。这样即使前端断线，后端仍持有完整记录。
  </Step>

  <Step title="客户侧自行实现异步包装">
    如果业务必须异步（前端不能长等），可以在你的后端做一层"异步外壳"：

    * 前端 POST 任务 → 后端入队 → 返回业务 ID
    * 后端 worker 用同步方式调用 API易 → 写回数据库
    * 前端凭业务 ID 轮询 / 用 WebSocket 推送

    这种模式与"平台原生异步"在体验上几乎等价，且数据全部留在你自己可控范围内。
  </Step>
</Steps>

## 客户侧异步包装（示例思路）

```python theme={null}
# 伪代码：在你自己的后端实现异步外壳
def submit_image_task(prompt):
    task_id = uuid4()
    db.save(task_id, status="pending", prompt=prompt)
    queue.push({"task_id": task_id, "prompt": prompt})
    return task_id

def worker(job):
    try:
        # 同步调用 API易，timeout 设到该模型的安全上限
        result = apiyi_client.images.generate(
            prompt=job["prompt"],
            timeout=180,
        )
        db.update(job["task_id"], status="done", url=result.url)
    except TimeoutError:
        db.update(job["task_id"], status="failed", error="timeout")

def query_image_task(task_id):
    return db.get(task_id)  # 前端凭 task_id 轮询自己的后端
```

<Tip>
  **关键点**：业务 ID 是**你自己生成的**，存在**你自己的数据库**里。API易 只负责"同步生成"这一步。
</Tip>

## 常见问题

<AccordionGroup>
  <Accordion title="同步调用经常超时怎么办？">
    多数超时是**客户端 timeout 设置过短**或**中间网络层（如反向代理、网关）提前断开长连接**导致。

    排查顺序：

    1. 确认 HTTP 客户端的 read timeout 已调大到 60–300 秒
    2. 确认 nginx / API 网关 / CDN 等中间层的超时也已调高
    3. 启用 keep-alive，避免被中间层强制断连
    4. 联系客服获取该模型的推荐 timeout 值
  </Accordion>

  <Accordion title="生成超时了，图片实际可能已经生成，能补救吗？">
    很遗憾不能。我们是原厂透传，不持久化生成结果。如果同步调用因 timeout 中断，**该次结果会丢失**，需要客户端重试。

    建议把 timeout 一次性调到该模型的安全上限，避免"接近成功但被自己掐断"的情况。
  </Accordion>

  <Accordion title="后续会不会推出异步任务 ID 接口？">
    我们了解部分上游平台速度较慢、异步确实更友好，**未来有可能引入异步能力**，但目前没有时间表，不做承诺。在此之前请按"客户侧实现异步包装"的思路自行处理。
  </Accordion>

  <Accordion title="视频生成接口（Sora / VEO 等）是异步的吗？">
    **是的，视频生成接口本身就是异步任务**（由上游官方设计），返回 task\_id，需要客户端轮询任务状态拿到最终视频。这与图片接口的同步模式不同，请按对应模型文档处理。
  </Accordion>

  <Accordion title="不同图片模型的推荐 timeout 是多少？">
    不同模型生成耗时差异较大（快的几秒、慢的几十秒甚至 3–5 分钟）。我们整理了**按模型分档的 timeout 速查表**，见 [图片 API 调用须知与最佳实践](/api-capabilities/image-api-best-practices)；有特殊场景也可联系客服进一步咨询。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="图片 API 调用须知与最佳实践" icon="book-check" href="/api-capabilities/image-api-best-practices">
    各模型 timeout 速查表、base64 处理与 URL 输出对照
  </Card>

  <Card title="自实现异步队列" icon="list-checks" href="/api-capabilities/image-async-queue">
    在同步接口之上自建任务队列的工程实践
  </Card>

  <Card title="模型选择指南" icon="cpu" href="/faq/model-selection-guide">
    了解各图片模型的能力与适用场景
  </Card>

  <Card title="API 并发与速率" icon="gauge" href="/faq/api-concurrency">
    并发上限、限流策略与最佳实践
  </Card>

  <Card title="调用日志与数据" icon="file-text" href="/faq/user-logs-control">
    了解我们的数据记录策略与日志控制
  </Card>

  <Card title="联系客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    获取 timeout 建议表或进一步咨询
  </Card>
</CardGroup>
