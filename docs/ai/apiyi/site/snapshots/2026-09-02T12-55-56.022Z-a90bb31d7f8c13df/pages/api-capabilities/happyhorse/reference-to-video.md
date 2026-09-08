> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# HappyHorse 参考图生视频 API 参考

> HappyHorse-1.1-r2v 参考图生视频 API 参考与在线调试：最多 9 张参考图保持主体与场景一致，DashScope 异步透传端点。

<Info>
  右侧 Playground 可直接调试：在 **Authorization** 填 `Bearer sk-your-api-key`，填好 `model` / `input.media` / `parameters` 后发起请求。提交成功返回 `task_id`，轮询与下载见下方说明。
</Info>

<Tip>
  本页是 `happyhorse-1.1-r2v`（参考图生视频）的创建接口：给参考图，模型保留其中的主体与场景特征。HappyHorse-r2v 支持 **最多 9 张参考图**，多参考图场景的主体一致性更强。完整异步流程见 [HappyHorse 概览](/api-capabilities/happyhorse/overview)。
</Tip>

<Warning>
  * `happyhorse-1.1-r2v` 的 `reference_image` 最多 **9 张**（多于 Wan2.7-r2v 的合计 ≤5）。
  * `input.media` 必填，媒体 `url` 必须是公网可直接 GET 的 https 链接。
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
      "model": "happyhorse-1.1-r2v",
      "input": {
        "prompt": "参考图片，一位女孩在洒满夕阳的花园里缓步行走，电影级光影",
        "media": [
          {"type": "reference_image", "url": "https://your-cdn.com/girl.png"}
        ]
      },
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": true, "watermark": true}
    }'
  ```

  ```python Python (单图参考) theme={null}
  import requests

  url = "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis"
  headers = {
      "Authorization": "Bearer sk-your-api-key",
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable",
  }
  body = {
      "model": "happyhorse-1.1-r2v",
      "input": {
          "prompt": "参考图片，一位女孩在洒满夕阳的花园里缓步行走，电影级光影",
          "media": [{"type": "reference_image", "url": "https://your-cdn.com/girl.png"}],
      },
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True},
  }
  resp = requests.post(url, json=body, headers=headers, timeout=30)
  print("task_id:", resp.json()["output"]["task_id"])
  ```

  ```python Python (多张参考图，最多 9 张) theme={null}
  import requests

  # happyhorse-1.1-r2v 支持最多 9 张 reference_image
  refs = [
      "https://your-cdn.com/ref1.png",
      "https://your-cdn.com/ref2.png",
      "https://your-cdn.com/ref3.png",
  ]
  body = {
      "model": "happyhorse-1.1-r2v",
      "input": {
          "prompt": "保持参考图中人物与服装特征，在城市夜景中漫步，霓虹光影",
          "media": [{"type": "reference_image", "url": u} for u in refs],
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

| 参数                         | 类型     | 必填 | 默认      | 说明                      |
| -------------------------- | ------ | -- | ------- | ----------------------- |
| `model`                    | string | ✓  | —       | 固定 `happyhorse-1.1-r2v` |
| `input.prompt`             | string | ✓  | —       | 文本提示词                   |
| `input.media`              | array  | ✓  | —       | 见下方媒体表                  |
| `parameters.resolution`    | string |    | `720P`  | `720P` / `1080P`        |
| `parameters.duration`      | int    |    | `5`     | 2–15 秒整数                |
| `parameters.prompt_extend` | bool   |    | `true`  | 智能改写，推荐开启               |
| `parameters.watermark`     | bool   |    | `false` | 「AI 生成」水印               |

### `media[]` 取值

| `type`            | 必填 | 张数  | 说明                      |
| ----------------- | -- | --- | ----------------------- |
| `reference_image` | ✓  | 1–9 | 参考图，保持主体（人物/动物/物体）与场景特征 |

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

````yaml api-reference/happyhorse-reference-to-video-openapi.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: HappyHorse 参考图生视频 API
  description: >
    阿里云 HappyHorse-1.0 参考图生视频（`happyhorse-1.1-r2v`）—— 最多 9
    张参考图保持主体与场景一致。DashScope 异步透传端点。


    - 创建请求必须带请求头 `X-DashScope-Async: enable`

    - `reference_image` 最多 9 张（多于 Wan2.7-r2v 的合计 ≤5）

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
      summary: 参考图生视频：最多 9 张参考图保持主体创建视频任务
      description: >
        提交一个 `happyhorse-1.1-r2v` 参考图生视频任务（异步），返回 `task_id`。


        - 必填：`model`、`input.prompt`、`input.media`（1–9 张 reference_image）、请求头
        `X-DashScope-Async: enable`

        - **响应不含视频文件**，需轮询 `GET /v1/tasks/{task_id}` 直到 `completed`，再从
        `result_url` 下载
      operationId: createHappyHorseReferenceToVideo
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
              $ref: '#/components/schemas/HappyHorseReferenceToVideoRequest'
            example:
              model: happyhorse-1.1-r2v
              input:
                prompt: 参考图片，一位女孩在洒满夕阳的花园里缓步行走，电影级光影
                media:
                  - type: reference_image
                    url: https://your-cdn.com/girl.png
              parameters:
                resolution: 720P
                duration: 5
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
          description: 参数非法或参考图超过 9 张
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
    HappyHorseReferenceToVideoRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: 模型 ID，参考图生视频固定 happyhorse-1.1-r2v
          enum:
            - happyhorse-1.1-r2v
          default: happyhorse-1.1-r2v
        input:
          type: object
          required:
            - prompt
            - media
          properties:
            prompt:
              type: string
              description: 文本提示词，保持参考图中主体/服装/场景特征
              example: 参考图片，一位女孩在洒满夕阳的花园里缓步行走，电影级光影
            media:
              type: array
              description: 媒体素材数组，reference_image 最多 9 张
              maxItems: 9
              items:
                type: object
                required:
                  - type
                  - url
                properties:
                  type:
                    type: string
                    description: 媒体类型：reference_image（参考图）
                    enum:
                      - reference_image
                  url:
                    type: string
                    description: 公网可直接 GET 的 https 图片链接
                    example: https://your-cdn.com/girl.png
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