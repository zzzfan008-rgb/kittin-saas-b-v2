> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# HappyHorse 视频编辑 API 参考

> HappyHorse-1.0-video-edit 视频编辑 API 参考与在线调试：输入视频 + 最多 5 张参考图 + 自然语言指令做局部/全局编辑。

<Info>
  右侧 Playground 可直接调试：在 **Authorization** 填 `Bearer sk-your-api-key`，填好 `model` / `input.media` / `parameters` 后发起请求。提交成功返回 `task_id`，轮询与下载见下方说明。
</Info>

<Tip>
  本页是 `happyhorse-1.0-video-edit`（视频编辑）的创建接口：给一段视频 + 最多 5 张参考图 + 自然语言指令，对视频元素做局部/全局编辑。注意模型名 **有连字符**（`video-edit`）。完整异步流程见 [HappyHorse 概览](/api-capabilities/happyhorse/overview)。
</Tip>

<Warning>
  * `input.media` 必须同时包含 `video`（被编辑的视频）与至少 1 张 `reference_image`（≤5 张）。
  * 模型名是 `happyhorse-1.0-video-edit`（**有连字符**），与 Wan 的 `wan2.7-videoedit`（无连字符）不同，别写错。
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
      "model": "happyhorse-1.0-video-edit",
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
      "model": "happyhorse-1.0-video-edit",
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
</CodeGroup>

## 参数与媒体速查

| 参数                         | 类型     | 必填 | 默认      | 说明                             |
| -------------------------- | ------ | -- | ------- | ------------------------------ |
| `model`                    | string | ✓  | —       | 固定 `happyhorse-1.0-video-edit` |
| `input.prompt`             | string | ✓  | —       | 自然语言编辑指令                       |
| `input.media`              | array  | ✓  | —       | 见下方媒体表                         |
| `parameters.resolution`    | string |    | `720P`  | `720P` / `1080P`               |
| `parameters.prompt_extend` | bool   |    | `true`  | 智能改写                           |
| `parameters.watermark`     | bool   |    | `false` | 「AI 生成」水印                      |

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
  "output": { "task_id": "...", "task_status": "PENDING" },
  "request_id": "..."
}
```

<Warning>
  提交后 **轮询 `GET /v1/tasks/{task_id}`** 直到 `completed`，再从 `result_url` 下载 mp4（**不带 `Authorization` 头**，24 小时过期）。完整轮询循环见 [HappyHorse 概览 · 异步调用流程](/api-capabilities/happyhorse/overview#异步调用流程)。
</Warning>


## OpenAPI

````yaml api-reference/happyhorse-video-edit-openapi.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: HappyHorse 视频编辑 API
  description: >
    阿里云 HappyHorse-1.0 视频编辑（`happyhorse-1.0-video-edit`，模型名有连字符）—— 输入视频 + 最多 5
    张参考图 + 自然语言指令做局部/全局编辑。DashScope 异步透传端点。


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
        提交一个 `happyhorse-1.0-video-edit` 视频编辑任务（异步），返回 `task_id`。


        - 必填：`model`、`input.prompt`（编辑指令）、`input.media`（1 个 video + 1–5 张
        reference_image）、请求头 `X-DashScope-Async: enable`

        - **响应不含视频文件**，需轮询 `GET /v1/tasks/{task_id}` 直到 `completed`，再从
        `result_url` 下载
      operationId: createHappyHorseVideoEdit
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
              $ref: '#/components/schemas/HappyHorseVideoEditRequest'
            example:
              model: happyhorse-1.0-video-edit
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
                $ref: '#/components/schemas/HappyHorseVideoTask'
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
    HappyHorseVideoEditRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: 模型 ID，固定 happyhorse-1.0-video-edit（有连字符）
          enum:
            - happyhorse-1.0-video-edit
          default: happyhorse-1.0-video-edit
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
          $ref: '#/components/schemas/HappyHorseParameters'
    HappyHorseVideoTask:
      type: object
      properties:
        output:
          type: object
          properties:
            task_id:
              type: string
              description: 任务 ID，用于轮询 GET /v1/tasks/{task_id}，有效期 24 小时
              example: hh-...
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
    HappyHorseParameters:
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