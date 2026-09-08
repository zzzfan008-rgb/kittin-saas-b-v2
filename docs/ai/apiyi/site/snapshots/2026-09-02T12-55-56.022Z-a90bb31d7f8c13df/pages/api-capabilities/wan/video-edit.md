> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan2.7 视频编辑 API 参考

> Wan2.7-videoedit 视频编辑 API 参考与在线调试：输入视频 + 参考图 + 自然语言指令，做换装、换背景等局部/全局编辑。

<Info>
  右侧 Playground 可直接调试：在 **Authorization** 填 `Bearer sk-your-api-key`，填好 `model` / `input.media` / `parameters` 后发起请求。提交成功返回 `task_id`，轮询与下载见下方说明。
</Info>

<Tip>
  本页是 `wan2.7-videoedit`（视频编辑）的创建接口：给一段视频 + 1–5 张参考图 + 自然语言编辑指令，对视频元素做换装、换背景等编辑。注意模型名 **无连字符**（`videoedit`）。完整异步流程见 [Wan 概览](/api-capabilities/wan/overview)。
</Tip>

<Warning>
  * `input.media` 必须同时包含 `video`（被编辑的视频）与至少 1 张 `reference_image`（参考素材，≤5 张）。
  * 模型名是 `wan2.7-videoedit`（**无连字符**），与 HappyHorse 的 `happyhorse-1.0-video-edit`（有连字符）不同，别写错。
  * 创建请求走 `/wan/api/v1/...` 并带 `X-DashScope-Async: enable`，不要用 `/v1/videos`。
</Warning>

## 代码示例

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis" \
    -H "X-DashScope-Async: enable" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "wan2.7-videoedit",
      "input": {
        "prompt": "将视频中女孩的衣服替换为图片中的衣服",
        "media": [
          {"type": "video",           "url": "https://your-cdn.com/source.mp4"},
          {"type": "reference_image", "url": "https://your-cdn.com/new-clothes.png"}
        ]
      },
      "parameters": {"resolution": "720P", "prompt_extend": true, "watermark": true}
    }'
  ```

  ```python Python (requests) theme={null}
  import requests

  url = "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis"
  headers = {
      "Authorization": "Bearer sk-your-api-key",
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable",
  }
  body = {
      "model": "wan2.7-videoedit",
      "input": {
          "prompt": "将视频中女孩的衣服替换为图片中的衣服",
          "media": [
              {"type": "video",           "url": "https://your-cdn.com/source.mp4"},
              {"type": "reference_image", "url": "https://your-cdn.com/new-clothes.png"},
          ],
      },
      "parameters": {"resolution": "720P", "prompt_extend": True, "watermark": True},
  }
  resp = requests.post(url, json=body, headers=headers, timeout=30)
  print("task_id:", resp.json()["output"]["task_id"])
  ```

  ```python Python (多张参考图) theme={null}
  import requests

  # 最多 5 张 reference_image 做更精细的局部/全局编辑
  body = {
      "model": "wan2.7-videoedit",
      "input": {
          "prompt": "把视频里的背景换成图1的海边，人物服装换成图2",
          "media": [
              {"type": "video",           "url": "https://your-cdn.com/source.mp4"},
              {"type": "reference_image", "url": "https://your-cdn.com/beach.png"},
              {"type": "reference_image", "url": "https://your-cdn.com/outfit.png"},
          ],
      },
      "parameters": {"resolution": "720P", "prompt_extend": True},
  }
  resp = requests.post(
      "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis",
      json=body,
      headers={"Authorization": "Bearer sk-your-api-key", "Content-Type": "application/json",
               "X-DashScope-Async": "enable"},
      timeout=30,
  )
  print(resp.json()["output"]["task_id"])
  ```
</CodeGroup>

## 参数与媒体速查

| 参数                         | 类型     | 必填 | 默认      | 说明                    |
| -------------------------- | ------ | -- | ------- | --------------------- |
| `model`                    | string | ✓  | —       | 固定 `wan2.7-videoedit` |
| `input.prompt`             | string | ✓  | —       | 自然语言编辑指令              |
| `input.media`              | array  | ✓  | —       | 见下方媒体表                |
| `parameters.resolution`    | string |    | `720P`  | `720P` / `1080P`      |
| `parameters.prompt_extend` | bool   |    | `true`  | 智能改写                  |
| `parameters.watermark`     | bool   |    | `false` | 「AI 生成」水印             |

### `media[]` 取值

| `type`            | 必填 | 张数  | 说明             |
| ----------------- | -- | --- | -------------- |
| `video`           | ✓  | 1   | 被编辑的源视频        |
| `reference_image` | ✓  | 1–5 | 参考素材（新服装、新背景等） |

<Info>
  视频编辑的输出时长跟随输入视频，不由 `duration` 决定，因此本能力通常不传 `duration`。
</Info>

## 响应格式

```json theme={null}
{
  "output": { "task_id": "3b216861-6a5f-441d-a438-602ab2c0d103", "task_status": "PENDING" },
  "request_id": "..."
}
```

## 查询状态与下载视频

拿到 `task_id` 后，按以下三步查询状态并下载 mp4：

* **轮询** `GET /v1/tasks/{task_id}`（带 `Authorization`，查询**不需要** `X-DashScope-Async` 头），每 5–10 秒一次（不要 \< 3 秒），直到 `status` 变为 `completed`。
* **状态取值**：`submitted`（排队）/ `in_progress`（生成中，`progress` 常停在 30% 属正常）/ `completed`（成功）/ `failed`（失败，看 `error`）。
* **下载**：从响应的 `result_url` 直接 GET，**不要带 `Authorization` 头**（OSS 签名直链，带了反而 403）；`result_url` 默认 **24 小时过期**，务必尽快转存。

<CodeGroup>
  ```bash 查询状态 theme={null}
  curl "https://api.apiyi.com/v1/tasks/3b216861-6a5f-441d-a438-602ab2c0d103" \
    -H "Authorization: Bearer sk-your-api-key"
  ```

  ```json 完成时响应 theme={null}
  {
    "status": "completed",
    "progress": 100,
    "result_url": "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=...",
    "task_id": "3b216861-6a5f-441d-a438-602ab2c0d103"
  }
  ```

  ```bash 下载视频 theme={null}
  # result_url 是 OSS 签名直链，下载时不要带 Authorization 头（带了反而 403）
  curl -L -o out.mp4 "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=..."
  ```

  ```bash 一条命令：查询 + 下载 theme={null}
  TASK_ID="3b216861-6a5f-441d-a438-602ab2c0d103"
  URL=$(curl -s "https://api.apiyi.com/v1/tasks/$TASK_ID" \
    -H "Authorization: Bearer sk-your-api-key" | jq -r '.result_url')
  curl -L -o out.mp4 "$URL"   # 不带 Authorization
  ```
</CodeGroup>

<Warning>
  上面是「已有 task\_id」的快捷查询/下载。完整轮询循环（含超时兜底）与 Python 客户端见 [Wan 概览 · 异步调用流程](/api-capabilities/wan/overview#异步调用流程)。
</Warning>


## OpenAPI

````yaml api-reference/wan-video-edit-openapi.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: Wan2.7 视频编辑 API
  description: >
    阿里云通义万相 Wan2.7 视频编辑（`wan2.7-videoedit`，模型名无连字符）—— 输入视频 + 参考图 +
    自然语言指令，做换装、换背景等局部/全局编辑。DashScope 异步透传端点。


    - 创建请求必须带请求头 `X-DashScope-Async: enable`

    - `input.media` 必须含 1 个 `video` + 1–5 张 `reference_image`

    - 输出时长跟随输入视频，通常不传 `duration`

    - 异步任务式端点：返回 `task_id`，需轮询 `GET /v1/tasks/{task_id}`，再从 `result_url` 下载（不带
    Authorization 头，24 小时过期）

    - **不要使用 `/v1/videos`**


    **认证方式**：在请求头中添加 `Authorization: Bearer YOUR_API_KEY`


    **获取 API Key**：访问 API易控制台 `api.apiyi.com/token` 创建令牌
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: 主要端点
  - url: https://vip.apiyi.com
    description: 备用端点
security:
  - bearerAuth: []
paths:
  /wan/api/v1/services/aigc/video-generation/video-synthesis:
    post:
      tags:
        - 视频生成
      summary: 视频编辑：视频 + 参考图 + 指令创建编辑任务
      description: >
        提交一个 `wan2.7-videoedit` 视频编辑任务（异步），返回 `task_id`。


        - 必填：`model`、`input.prompt`（编辑指令）、`input.media`（1 个 video + 1–5 张
        reference_image）、请求头 `X-DashScope-Async: enable`

        - **响应不含视频文件**，需轮询 `GET /v1/tasks/{task_id}` 直到 `completed`，再从
        `result_url` 下载

        - 耗时随输入视频长度而定，实测约 100 秒
      operationId: createWan27VideoEdit
      parameters:
        - name: X-DashScope-Async
          in: header
          required: true
          description: 异步处理开关，必须设置为 enable
          schema:
            type: string
            enum:
              - enable
            default: enable
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/WanVideoEditRequest'
            example:
              model: wan2.7-videoedit
              input:
                prompt: 将视频中女孩的衣服替换为图片中的衣服
                media:
                  - type: video
                    url: https://your-cdn.com/source.mp4
                  - type: reference_image
                    url: https://your-cdn.com/new-clothes.png
              parameters:
                resolution: 720P
                prompt_extend: true
                watermark: true
      responses:
        '200':
          description: 任务已提交，返回 task_id 与 PENDING 状态
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/WanVideoTask'
        '400':
          description: 参数非法或参考图超过 5 张
        '401':
          description: 未授权 - API Key 无效
        '403':
          description: 内容审核拦截或分组无权限
        '429':
          description: 请求频率超限或余额不足
        '500':
          description: 缺少 video / reference_image 或上游错误
      security:
        - bearerAuth: []
components:
  schemas:
    WanVideoEditRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: 模型 ID，固定 wan2.7-videoedit（无连字符）
          enum:
            - wan2.7-videoedit
          default: wan2.7-videoedit
        input:
          type: object
          required:
            - prompt
            - media
          properties:
            prompt:
              type: string
              description: 自然语言编辑指令
              example: 将视频中女孩的衣服替换为图片中的衣服
            media:
              type: array
              description: 媒体素材数组，必含 1 个 video + 1–5 张 reference_image
              items:
                type: object
                required:
                  - type
                  - url
                properties:
                  type:
                    type: string
                    description: 媒体类型：video（被编辑的源视频）/ reference_image（参考素材）
                    enum:
                      - video
                      - reference_image
                  url:
                    type: string
                    description: 公网可直接 GET 的 https 链接
                    example: https://your-cdn.com/source.mp4
        parameters:
          $ref: '#/components/schemas/WanParameters'
    WanVideoTask:
      type: object
      properties:
        output:
          type: object
          properties:
            task_id:
              type: string
              description: 任务 ID，用于轮询 GET /v1/tasks/{task_id}，有效期 24 小时
              example: 3b216861-6a5f-441d-a438-602ab2c0d103
            task_status:
              type: string
              enum:
                - PENDING
                - RUNNING
                - SUCCEEDED
                - FAILED
              example: PENDING
        request_id:
          type: string
          description: 请求唯一标识
          example: ...
    WanParameters:
      type: object
      properties:
        resolution:
          type: string
          description: 分辨率档位（大写）
          enum:
            - 720P
            - 1080P
          default: 720P
        prompt_extend:
          type: boolean
          description: 是否开启 prompt 智能改写
          default: true
        watermark:
          type: boolean
          description: 是否添加右下角「AI 生成」水印
          default: false
        seed:
          type: integer
          description: 随机数种子，0–2147483647
          minimum: 0
          maximum: 2147483647
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key

````