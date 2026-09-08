> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan2.7 参考图生视频 API 参考

> Wan2.7-r2v 参考图生视频 API 参考与在线调试：参考图/视频保持主体特征，支持多主体互动、音色参考与多宫格分镜。

<Info>
  右侧 Playground 可直接调试：在 **Authorization** 填 `Bearer sk-your-api-key`，填好 `model` / `input.media` / `parameters` 后发起请求。提交成功返回 `task_id`，轮询与下载见下方说明。
</Info>

<Tip>
  本页是 `wan2.7-r2v`（参考图生视频）的创建接口：给参考图/参考视频，模型保留其中的主体（人物/动物/物体）和场景特征，生成单角色表演或多角色互动视频。需要更多参考图（≤9 张）可考虑 [HappyHorse r2v](/api-capabilities/happyhorse/reference-to-video)。完整异步流程见 [Wan 概览](/api-capabilities/wan/overview)。
</Tip>

<Warning>
  * **参考素材引用约定**：prompt 中用「图1 / 图2」指代 `reference_image`、「视频1 / 视频2」指代 `reference_video`，顺序与 `media` 数组一致（图和视频分别计数）。仅一张图/一个视频时可简写为「参考图片」「参考视频」。
  * **数量限制**：`reference_image` + `reference_video` 合计 ≤5；`first_frame` 最多 1 张。
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
      "model": "wan2.7-r2v",
      "input": {
        "prompt": "一位身穿这件礼服的女孩在洒满夕阳的花园里缓步行走，微风轻拂裙摆，电影级光影",
        "media": [
          {"type": "reference_image", "url": "https://your-cdn.com/dress.png"}
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
      "model": "wan2.7-r2v",
      "input": {
          "prompt": "参考图片，一位女孩在洒满夕阳的花园里缓步行走，电影级光影",
          "media": [{"type": "reference_image", "url": "https://your-cdn.com/girl.png"}],
      },
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True},
  }
  resp = requests.post(url, json=body, headers=headers, timeout=30)
  print("task_id:", resp.json()["output"]["task_id"])
  ```

  ```python Python (多主体 + 音色) theme={null}
  import requests

  # 多主体：图1 = 女孩(带音色)，视频1 = 男孩(带音色)，图2/图3 = 道具/背景
  body = {
      "model": "wan2.7-r2v",
      "input": {
          "prompt": "视频1抱着图2，路过图1，并说道：今天的阳光真好。",
          "media": [
              {"type": "reference_image", "url": "https://your-cdn.com/girl.jpg",
               "reference_voice": "https://your-cdn.com/girl-voice.mp3"},
              {"type": "reference_video", "url": "https://your-cdn.com/boy.mp4",
               "reference_voice": "https://your-cdn.com/boy-voice.mp3"},
              {"type": "reference_image", "url": "https://your-cdn.com/object.png"},
          ],
      },
      "parameters": {"resolution": "720P", "ratio": "16:9", "duration": 10, "prompt_extend": False, "watermark": True},
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

| 参数                         | 类型     | 必填 | 默认      | 说明                                               |
| -------------------------- | ------ | -- | ------- | ------------------------------------------------ |
| `model`                    | string | ✓  | —       | 固定 `wan2.7-r2v`                                  |
| `input.prompt`             | string | ✓  | —       | ≤5000 字符，用「图1/视频1」指代参考素材                         |
| `input.media`              | array  | ✓  | —       | 见下方媒体表                                           |
| `parameters.resolution`    | string |    | `1080P` | `720P` / `1080P`                                 |
| `parameters.ratio`         | string |    | `16:9`  | `16:9` / `9:16` / `1:1` / `4:3` / `3:4`（传首帧图时忽略） |
| `parameters.duration`      | int    |    | `5`     | 含参考视频时 2–10；不含时 2–15                             |
| `parameters.prompt_extend` | bool   |    | `true`  | 智能改写                                             |
| `parameters.watermark`     | bool   |    | `false` | 「AI 生成」水印                                        |

### `media[]` 取值

| `type`            | 张数/限制         | 说明                                                                |
| ----------------- | ------------- | ----------------------------------------------------------------- |
| `reference_image` | 与 video 合计 ≤5 | 参考图，提供主体（人物/动物/物体）或场景；可附 `reference_voice` 指定音色                   |
| `reference_video` | 与 image 合计 ≤5 | 参考视频，提供主体与音色参考；不建议传空镜视频                                           |
| `first_frame`     | ≤1            | 可选首帧，联合控制起始画面                                                     |
| `reference_voice` | 附属字段          | 附在某条 `reference_image`/`reference_video` 上，指定该主体音色（wav/mp3，1–10s） |

## 响应格式

```json theme={null}
{
  "output": { "task_id": "acda59b4-3b10-4789-a5e5-edadae48adcb", "task_status": "PENDING" },
  "request_id": "..."
}
```

## 查询状态与下载视频

拿到 `task_id` 后，按以下三步查询状态并下载 mp4：

* **轮询** `GET /v1/tasks/{task_id}`（带 `Authorization`，查询**不需要** `X-DashScope-Async` 头），每 10 秒一次（不要 \< 3 秒），直到 `status` 变为 `completed`。参考生视频耗时通常 1–5 分钟，建议客户端超时设 20 分钟兜底。
* **状态取值**：`submitted`（排队）/ `in_progress`（生成中，`progress` 常停在 30% 属正常）/ `completed`（成功）/ `failed`（失败，看 `error`）。
* **下载**：从响应的 `result_url` 直接 GET，**不要带 `Authorization` 头**（OSS 签名直链，带了反而 403）；`result_url` 默认 **24 小时过期**，务必尽快转存。

<CodeGroup>
  ```bash 查询状态 theme={null}
  curl "https://api.apiyi.com/v1/tasks/acda59b4-3b10-4789-a5e5-edadae48adcb" \
    -H "Authorization: Bearer sk-your-api-key"
  ```

  ```json 完成时响应 theme={null}
  {
    "status": "completed",
    "progress": 100,
    "result_url": "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=...",
    "task_id": "acda59b4-3b10-4789-a5e5-edadae48adcb"
  }
  ```

  ```bash 下载视频 theme={null}
  # result_url 是 OSS 签名直链，下载时不要带 Authorization 头（带了反而 403）
  curl -L -o out.mp4 "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=..."
  ```

  ```bash 一条命令：查询 + 下载 theme={null}
  TASK_ID="acda59b4-3b10-4789-a5e5-edadae48adcb"
  URL=$(curl -s "https://api.apiyi.com/v1/tasks/$TASK_ID" \
    -H "Authorization: Bearer sk-your-api-key" | jq -r '.result_url')
  curl -L -o out.mp4 "$URL"   # 不带 Authorization
  ```
</CodeGroup>

<Warning>
  上面是「已有 task\_id」的快捷查询/下载。完整轮询循环（含超时兜底）与 Python 客户端见 [Wan 概览 · 异步调用流程](/api-capabilities/wan/overview#异步调用流程)。
</Warning>


## OpenAPI

````yaml api-reference/wan-reference-to-video-openapi.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: Wan2.7 参考图生视频 API
  description: >
    阿里云通义万相 Wan2.7 参考图生视频（`wan2.7-r2v`）——
    参考图/视频保持主体特征，支持多主体互动、音色参考与多宫格分镜。DashScope 异步透传端点。


    - 创建请求必须带请求头 `X-DashScope-Async: enable`

    - prompt 中用「图1 / 视频1」指代参考素材，顺序与 media 数组一致

    - `reference_image` + `reference_video` 合计 ≤5；`first_frame` ≤1

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
      summary: 参考图生视频：参考图/视频保持主体特征创建视频任务
      description: >
        提交一个 `wan2.7-r2v` 参考图生视频任务（异步），返回 `task_id`。


        - 必填：`model`、`input.prompt`、`input.media`（至少 1 个 reference_image /
        reference_video）、请求头 `X-DashScope-Async: enable`

        - 可选：`reference_voice`（音色参考）、`parameters`（含 ratio）

        - **响应不含视频文件**，需轮询 `GET /v1/tasks/{task_id}` 直到 `completed`，再从
        `result_url` 下载

        - 720P / 5 秒典型耗时 120–140 秒，多主体任务可达 1–5 分钟
      operationId: createWan27ReferenceToVideo
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
              $ref: '#/components/schemas/WanReferenceToVideoRequest'
            example:
              model: wan2.7-r2v
              input:
                prompt: 一位身穿这件礼服的女孩在洒满夕阳的花园里缓步行走，微风轻拂裙摆，电影级光影
                media:
                  - type: reference_image
                    url: https://your-cdn.com/dress.png
              parameters:
                resolution: 720P
                ratio: '16:9'
                duration: 5
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
          description: 参数非法或参考素材超过 5 个
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
    WanReferenceToVideoRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: 模型 ID，参考图生视频可填 wan2.7-r2v（历史版本 wan2.6-r2v / wan2.6-r2v-flash）
          enum:
            - wan2.7-r2v
            - wan2.6-r2v
            - wan2.6-r2v-flash
          default: wan2.7-r2v
        input:
          type: object
          required:
            - prompt
            - media
          properties:
            prompt:
              type: string
              description: 文本提示词，≤5000 字符，用「图1/视频1」指代参考素材
              example: 参考图片，一位女孩在洒满夕阳的花园里缓步行走，电影级光影
            negative_prompt:
              type: string
              description: 反向提示词，≤500 字符
            media:
              type: array
              description: 媒体素材数组，reference_image + reference_video 合计 ≤5，first_frame ≤1
              items:
                type: object
                required:
                  - type
                  - url
                properties:
                  type:
                    type: string
                    description: >-
                      媒体类型：reference_image（参考图）/ reference_video（参考视频）/
                      first_frame（可选首帧）
                    enum:
                      - reference_image
                      - reference_video
                      - first_frame
                  url:
                    type: string
                    description: 公网可直接 GET 的 https 链接
                    example: https://your-cdn.com/dress.png
                  reference_voice:
                    type: string
                    description: 可选：音色参考音频 URL（wav/mp3，1–10s），指定该主体的音色
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
              example: acda59b4-3b10-4789-a5e5-edadae48adcb
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
          description: 分辨率档位（大写），wan2.7-r2v 支持 720P / 1080P，默认 1080P
          enum:
            - 720P
            - 1080P
          default: 1080P
        ratio:
          type: string
          description: 宽高比；传了 first_frame 时自动忽略
          enum:
            - '16:9'
            - '9:16'
            - '1:1'
            - '4:3'
            - '3:4'
          default: '16:9'
        duration:
          type: integer
          description: 视频时长（秒），整数；含参考视频时取值 2–10，不含时 2–15
          minimum: 2
          maximum: 15
          default: 5
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