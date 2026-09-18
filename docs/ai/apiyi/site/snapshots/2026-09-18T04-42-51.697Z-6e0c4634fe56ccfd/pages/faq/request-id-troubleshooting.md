> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Request ID 在哪里查看？

> 排查 API 调用问题时，按接口类型查找响应头或响应体中的 Request ID，并区分请求 ID 与任务 ID。

## 简短回答

排查接口问题时，先记录**模型名称、接口端点和调用时间**，再查看 HTTP 响应头中的 `x-request-id` 或 `request-id`。如果接口返回错误响应，还要同时检查 JSON 响应体中的 `request_id` 等标识，并以 API易 日志中可以检索到的字段为准。

Wan 和 HappyHorse 视频接口还会在响应体中返回 `request_id`；响应体中的 `task_id` 用于查询视频任务，不等同于 Request ID。Seedance、Veo 等异步视频接口返回的 `id` 或 `task_id` 同样是视频任务 ID。

<Info>
  API易后台日志中的「请求 ID / 上游请求 ID / Completion ID」筛选框可以搜索用户提供的标识。打开控制台的「日志」页面后，可以按这个标识定位日志详情。
</Info>

## 排查前先做三个动作

<Steps>
  <Step title="第一步：确认模型和接口端点">
    记录完整模型名称和实际调用地址。例如，文本模型通常调用 `/v1/chat/completions`，向量模型调用 `/v1/embeddings`，图片模型可能调用 `/v1/images/generations`，视频模型则可能使用 `/v1/videos` 或模型专用的异步端点。
  </Step>

  <Step title="第二步：记录调用时间">
    记录请求发起时间，并注明时区，例如 `2026-08-25 14:32 (UTC+8)`。如果发生过重试，也请记录每次重试的大致时间。
  </Step>

  <Step title="第三步：保存响应和日志信息">
    保存 HTTP 状态码、完整响应头、完整响应体和客户端异常。然后进入 API易控制台的「日志」页面，使用 Request ID、上游 Request ID 或 Completion ID 搜索对应记录。
  </Step>
</Steps>

## 不同模型的 Request ID 在哪里

| 接口类型                | 优先查看位置                                                  | 需要区分的字段                                                                                  |
| ------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 文本 / 对话模型           | 通常查看 HTTP 响应头：`x-request-id` 或 `request-id`；错误响应还要检查响应体 | 响应体中的 `id` 可能是 Completion ID，不一定是 API易 Request ID                                        |
| 图片模型                | 通常查看 HTTP 响应头：`x-request-id` 或 `request-id`；错误响应还要检查响应体 | 图片响应体中的对象 ID 不要仅凭字段名判断为 API易 Request ID                                                  |
| 向量 / Embedding 模型   | 优先查看实际响应头；错误响应还要检查响应体                                   | 当前向量响应示例主要展示 `data[].embedding`，文档没有规定统一的 Request ID 字段位置                                |
| Wan / HappyHorse 视频 | 响应体中的 `request_id`，同时检查响应头                              | `output.task_id` 是视频任务 ID，用于轮询任务状态                                                       |
| Seedance 视频         | HTTP 响应头中的 **`X-Shellapi-Request-Id`**；响应体顶层 `id` 另行保存  | 顶层 `id` 是视频任务 ID，不是 Request ID；响应头里的 `X-Request-Id` 是原厂的请求 ID，API易 日志里搜不到（2026-09-15 实测） |
| Veo 等异步视频           | 如果该端点返回 Request ID，优先记录响应头中的值；同时保存任务字段                  | 响应体中的 `id` / `task_id` 是视频任务 ID                                                          |

<Warning>
  响应头名称不区分大小写，但字段名中的连字符不能省略：`x-request-id`、`request-id` 和 `request_id` 是不同写法。请同时检查响应头和错误响应体，不要只搜索其中一个名称。
</Warning>

## 如何从代码中读取

### Python

```python theme={null}
import requests

response = requests.post(
    "https://api.apiyi.com/v1/chat/completions",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json",
    },
    json={
        "model": "YOUR_MODEL",
        "messages": [{"role": "user", "content": "测试请求"}],
    },
    timeout=60,
)

header_request_id = (
    response.headers.get("x-request-id")
    or response.headers.get("request-id")
)

try:
    body = response.json()
except ValueError:
    body = {}

# 只把响应体中的 request_id 作为候选，不要把 body.id 自动当作 API易 Request ID。
request_id = header_request_id or body.get("request_id")

print("status:", response.status_code)
print("request_id:", request_id)
print("body:", response.text)
```

### cURL

使用 `-i` 同时输出响应头和响应体，再从响应头中查找 `x-request-id` 或 `request-id`：

```bash theme={null}
curl -i "https://api.apiyi.com/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "YOUR_MODEL",
    "messages": [{"role": "user", "content": "测试请求"}]
  }'
```

对于 Wan 或 HappyHorse 视频，还要保存响应体中的两个字段：

```python theme={null}
body = response.json()
request_id = body.get("request_id")
task_id = body.get("output", {}).get("task_id")
```

## 在控制台日志中搜索

<Steps>
  <Step title="打开调用日志">
    登录 API易控制台，进入「日志」页面，打开需要排查的日志详情。
  </Step>

  <Step title="填写可用的标识">
    在筛选框「请求 ID / 上游请求 ID / Completion ID」中粘贴用户提供的标识。优先粘贴 API易响应头中的 Request ID；如果没有，再尝试上游 Request ID 或 Completion ID。
  </Step>

  <Step title="核对详情">
    对照日志中的模型、调用时间、接口路径、渠道、HTTP 状态码、错误码和计费记录，判断请求是否到达 API易、是否进入上游，以及是否需要修改请求后重试。
  </Step>
</Steps>

<Tip>
  用户只提供「大概几点调用失败」时，仍然可以先按模型名称、调用时间和接口端点缩小范围；但如果用户能提供 Request ID，通常可以更快定位到单次调用。
</Tip>

## 为什么有时找不到 Request ID

如果请求在收到 HTTP 响应之前就失败，例如 DNS 解析失败、无法建立 TCP/TLS 连接、本地代理拒绝连接或客户端连接超时，API易还没有机会返回响应头，因此不会产生可供客户端读取的 Request ID。

这类情况请提供：

* 客户端原始异常和完整堆栈；
* 请求发起时间和时区；
* 使用的模型和接口端点；
* HTTP 客户端、代理或网络环境；
* 如果同一请求曾成功或重试成功，也请提供对应的 Request ID。

<Warning>
  提交排查材料时不要发送完整 API Key。请遮盖令牌中间部分，也不要直接公开包含隐私、业务数据或完整图片内容的请求体。
</Warning>

## 联系客服时请提供什么

* Request ID；
* 上游 Request ID 或 Completion ID（如果日志中有）；
* 模型名称和接口端点；
* 调用时间（注明时区）；
* HTTP 状态码、完整响应体和客户端异常；
* 脱敏后的请求参数，以及控制台日志中的错误码和计费状态。

## 相关文档

<CardGroup cols={2}>
  <Card title="模型调用报错怎么排查？" icon="alert-triangle" href="/faq/model-error-troubleshooting">
    按错误类型、参数、分组、超时和日志记录排查接口问题
  </Card>

  <Card title="如何查看我的调用记录？" icon="file-text" href="/faq/call-logs">
    在控制台查看调用记录、错误信息和计费详情
  </Card>

  <Card title="日志查询 API" icon="search" href="/api-capabilities/log-query">
    按时间、模型或 request\_id 程序化查询调用日志
  </Card>

  <Card title="图片接口调用须知" icon="image" href="/api-capabilities/image-api-best-practices">
    了解图片请求超时、断连、计费和请求 ID 的排查方法
  </Card>
</CardGroup>
