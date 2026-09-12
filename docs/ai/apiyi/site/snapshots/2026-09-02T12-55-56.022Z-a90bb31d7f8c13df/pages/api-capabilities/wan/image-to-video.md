> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan2.7 图生视频 API 参考

> Wan2.7-i2v 图生视频 API 参考与在线调试：首帧图生成视频，支持 driving_audio 驱动音频做对口型 / rap。

<Info>
  右侧 Playground 可直接调试：在 **Authorization** 填 `Bearer sk-your-api-key`，填好 `model` / `input.media` / `parameters` 后发起请求。提交成功返回 `task_id`，轮询与下载见下方说明。
</Info>

<Tip>
  本页是 `wan2.7-i2v`（图生视频）的创建接口：给一张首帧图 + prompt，让画面动起来；可选传 `driving_audio` 让人像跟随音频做口型/节奏。完整异步流程见 [Wan 概览](/api-capabilities/wan/overview)。
</Tip>

<Warning>
  * **音频驱动是 `wan2.7-i2v` 专属能力**：[HappyHorse 的 i2v](/api-capabilities/happyhorse/image-to-video) 不支持 `driving_audio`，做对口型 / rap 必须用 `wan2.7-i2v`。
  * `input.media` 必填，否则上游报 `图生视频模型 ... 必须提供图片`。媒体 `url` 必须是公网可直接 GET 的 https 链接。
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
      "model": "wan2.7-i2v",
      "input": {
        "prompt": "一个由喷漆所画成的少年从墙上活过来，演唱英文 rap，夜晚铁路桥下，电影级光影",
        "media": [
          {"type": "first_frame",   "url": "https://your-cdn.com/rap.png"},
          {"type": "driving_audio", "url": "https://your-cdn.com/rap.mp3"}
        ]
      },
      "parameters": {"resolution": "720P", "duration": 10, "prompt_extend": true, "watermark": true}
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
      "model": "wan2.7-i2v",
      "input": {
          "prompt": "一个由喷漆所画成的少年从墙上活过来，演唱英文 rap，夜晚铁路桥下",
          "media": [
              {"type": "first_frame",   "url": "https://your-cdn.com/rap.png"},
              {"type": "driving_audio", "url": "https://your-cdn.com/rap.mp3"},  # 可选，做对口型
          ],
      },
      "parameters": {"resolution": "720P", "duration": 10, "prompt_extend": True, "watermark": True},
  }

  resp = requests.post(url, json=body, headers=headers, timeout=30)
  print("task_id:", resp.json()["output"]["task_id"])
  ```

  ```python Python (无音频版) theme={null}
  import requests

  # 仅首帧图，不做对口型时只传 first_frame
  body = {
      "model": "wan2.7-i2v",
      "input": {
          "prompt": "一只猫在草地上奔跑，阳光明媚，镜头跟随",
          "media": [{"type": "first_frame", "url": "https://your-cdn.com/cat.png"}],
      },
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True},
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

| 参数                         | 类型     | 必填 | 默认      | 说明               |
| -------------------------- | ------ | -- | ------- | ---------------- |
| `model`                    | string | ✓  | —       | 固定 `wan2.7-i2v`  |
| `input.prompt`             | string | ✓  | —       | 文本提示词            |
| `input.media`              | array  | ✓  | —       | 见下方媒体表           |
| `parameters.resolution`    | string |    | `720P`  | `720P` / `1080P` |
| `parameters.duration`      | int    |    | `5`     | 2–15 秒整数         |
| `parameters.prompt_extend` | bool   |    | `true`  | 智能改写，推荐开启        |
| `parameters.watermark`     | bool   |    | `false` | 「AI 生成」水印        |

### `media[]` 取值

| `type`          | 必填 | 张数 | 说明                          |
| --------------- | -- | -- | --------------------------- |
| `first_frame`   | ✓  | 1  | 首帧图，视频从这张图开始                |
| `driving_audio` |    | 1  | 驱动音频（wav/mp3），让人像跟随音频做口型/节奏 |

## 响应格式

```json theme={null}
{
  "output": { "task_id": "f8ca39a0-6f4b-4ec2-99bf-8b9649d946c4", "task_status": "PENDING" },
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
  curl "https://api.apiyi.com/v1/tasks/f8ca39a0-6f4b-4ec2-99bf-8b9649d946c4" \
    -H "Authorization: Bearer sk-your-api-key"
  ```

  ```json 完成时响应 theme={null}
  {
    "status": "completed",
    "progress": 100,
    "result_url": "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=...",
    "task_id": "f8ca39a0-6f4b-4ec2-99bf-8b9649d946c4"
  }
  ```

  ```bash 下载视频 theme={null}
  # result_url 是 OSS 签名直链，下载时不要带 Authorization 头（带了反而 403）
  curl -L -o out.mp4 "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=..."
  ```

  ```bash 一条命令：查询 + 下载 theme={null}
  TASK_ID="f8ca39a0-6f4b-4ec2-99bf-8b9649d946c4"
  URL=$(curl -s "https://api.apiyi.com/v1/tasks/$TASK_ID" \
    -H "Authorization: Bearer sk-your-api-key" | jq -r '.result_url')
  curl -L -o out.mp4 "$URL"   # 不带 Authorization
  ```
</CodeGroup>

<Warning>
  上面是「已有 task\_id」的快捷查询/下载。完整轮询循环（含超时兜底）与 Python 客户端见 [Wan 概览 · 异步调用流程](/api-capabilities/wan/overview#异步调用流程)。
</Warning>


## OpenAPI

````yaml api-reference/wan-image-to-video-openapi.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: Wan2.7 图生视频 API
  description: >
    阿里云通义万相 Wan2.7 图生视频（`wan2.7-i2v`）—— 首帧图生成视频，支持 `driving_audio` 驱动音频做对口型 /
    rap。DashScope 异步透传端点。


    - 创建请求必须带请求头 `X-DashScope-Async: enable`

    - **音频驱动是 wan2.7-i2v 专属能力**，HappyHorse 的 i2v 不支持

    - 异步任务式端点：返回 `task_id`，需配合 `GET /v1/tasks/{task_id}` 轮询，再从 `result_url`
    下载（不带 Authorization 头，24 小时过期）

    - **不要使用 `/v1/videos`**（媒体字段会被丢弃）


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
      summary: 图生视频：首帧图（+ 可选驱动音频）创建视频生成任务
      description: >
        提交一个 `wan2.7-i2v` 图生视频任务（异步），返回 `task_id`。


        - 必填：`model`、`input.prompt`、`input.media`（至少 1 个 `first_frame`）、请求头
        `X-DashScope-Async: enable`

        - 可选：`driving_audio`（让人像跟随音频做口型/节奏）、`parameters`

        - **响应不含视频文件**，需轮询 `GET /v1/tasks/{task_id}` 直到 `completed`，再从
        `result_url` 下载

        - 720P / 跟随音频典型耗时 70–90 秒
      operationId: createWan27ImageToVideo
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
              $ref: '#/components/schemas/WanImageToVideoRequest'
            example:
              model: wan2.7-i2v
              input:
                prompt: 一个由喷漆所画成的少年从墙上活过来，演唱英文 rap，夜晚铁路桥下，电影级光影
                media:
                  - type: first_frame
                    url: https://your-cdn.com/rap.png
                  - type: driving_audio
                    url: https://your-cdn.com/rap.mp3
              parameters:
                resolution: 720P
                duration: 10
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
          description: 参数非法（duration 类型错、resolution 取值错误等）
        '401':
          description: 未授权 - API Key 无效
        '403':
          description: 内容审核拦截或分组无权限
        '429':
          description: 请求频率超限或余额不足
        '500':
          description: 缺少 media 或上游错误，建议检查 body 后重试
      security:
        - bearerAuth: []
components:
  schemas:
    WanImageToVideoRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: 模型 ID，图生视频固定 wan2.7-i2v（历史版本可填 wan2.6-i2v）
          enum:
            - wan2.7-i2v
            - wan2.6-i2v
          default: wan2.7-i2v
        input:
          type: object
          required:
            - prompt
            - media
          properties:
            prompt:
              type: string
              description: 文本提示词
              example: 一个由喷漆所画成的少年从墙上活过来，演唱英文 rap
            negative_prompt:
              type: string
              description: 反向提示词，≤500 字符
            media:
              type: array
              description: 媒体素材数组，必含 1 个 first_frame，可选 1 个 driving_audio
              items:
                type: object
                required:
                  - type
                  - url
                properties:
                  type:
                    type: string
                    description: 媒体类型：first_frame（首帧图，≤1）/ driving_audio（驱动音频，做对口型）
                    enum:
                      - first_frame
                      - driving_audio
                  url:
                    type: string
                    description: 公网可直接 GET 的 https 链接（图 JPEG/PNG/WEBP；音频 wav/mp3）
                    example: https://your-cdn.com/rap.png
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
              example: f8ca39a0-6f4b-4ec2-99bf-8b9649d946c4
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
        duration:
          type: integer
          description: 视频时长（秒），整数，取值 2–15
          minimum: 2
          maximum: 15
          default: 5
        prompt_extend:
          type: boolean
          description: 是否开启 prompt 智能改写，强烈推荐 true
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