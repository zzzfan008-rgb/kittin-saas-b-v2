> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan2.7 影片編輯 API 參考

> Wan2.7-videoedit 影片編輯 API 參考與線上除錯：輸入影片 + 參考圖 + 自然語言指令，做換裝、換背景等局部/全域性編輯。

<Info>
  右側 Playground 可直接除錯：在 **Authorization** 填 `Bearer sk-your-api-key`，填好 `model` / `input.media` / `parameters` 後發起請求。提交成功返回 `task_id`，輪詢與下載見下方說明。
</Info>

<Tip>
  本頁是 `wan2.7-videoedit`（影片編輯）的建立介面：給一段影片 + 1–5 張參考圖 + 自然語言編輯指令，對影片元素做換裝、換背景等編輯。注意模型名 **無連字元**（`videoedit`）。完整非同步流程見 [Wan 概覽](/zh-Hant/api-capabilities/wan/overview)。
</Tip>

<Warning>
  * `input.media` 必須同時包含 `video`（被編輯的影片）與至少 1 張 `reference_image`（參考素材，≤5 張）。
  * 模型名是 `wan2.7-videoedit`（**無連字元**），與 HappyHorse 的 `happyhorse-1.0-video-edit`（有連字元）不同，別寫錯。
  * 建立請求走 `/wan/api/v1/...` 並帶 `X-DashScope-Async: enable`，不要用 `/v1/videos`。
</Warning>

## 程式碼示例

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis" \
    -H "X-DashScope-Async: enable" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "wan2.7-videoedit",
      "input": {
        "prompt": "將影片中女孩的衣服替換為圖片中的衣服",
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
          "prompt": "將影片中女孩的衣服替換為圖片中的衣服",
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

  ```python Python (多張參考圖) theme={null}
  import requests

  # 最多 5 張 reference_image 做更精細的局部/全域性編輯
  body = {
      "model": "wan2.7-videoedit",
      "input": {
          "prompt": "把影片裡的背景換成圖1的海邊，人物服裝換成圖2",
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

## 引數與媒體速查

| 引數                         | 型別     | 必填 | 預設      | 說明                    |
| -------------------------- | ------ | -- | ------- | --------------------- |
| `model`                    | string | ✓  | —       | 固定 `wan2.7-videoedit` |
| `input.prompt`             | string | ✓  | —       | 自然語言編輯指令              |
| `input.media`              | array  | ✓  | —       | 見下方媒體表                |
| `parameters.resolution`    | string |    | `720P`  | `720P` / `1080P`      |
| `parameters.prompt_extend` | bool   |    | `true`  | 智慧改寫                  |
| `parameters.watermark`     | bool   |    | `false` | 「AI 生成」水印             |

### `media[]` 取值

| `type`            | 必填 | 張數  | 說明             |
| ----------------- | -- | --- | -------------- |
| `video`           | ✓  | 1   | 被編輯的源影片        |
| `reference_image` | ✓  | 1–5 | 參考素材（新服裝、新背景等） |

<Info>
  影片編輯的輸出時長跟隨輸入影片，不由 `duration` 決定，因此本能力通常不傳 `duration`。
</Info>

## 響應格式

```json theme={null}
{
  "output": { "task_id": "3b216861-6a5f-441d-a438-602ab2c0d103", "task_status": "PENDING" },
  "request_id": "..."
}
```

## 查詢狀態與下載影片

拿到 `task_id` 後，按以下三步查詢狀態並下載 mp4：

* **輪詢** `GET /v1/tasks/{task_id}`（帶 `Authorization`，查詢**不需要** `X-DashScope-Async` 頭），每 5–10 秒一次（不要 \< 3 秒），直到 `status` 變為 `completed`。
* **狀態取值**：`submitted`（排隊）/ `in_progress`（生成中，`progress` 常停在 30% 屬正常）/ `completed`（成功）/ `failed`（失敗，看 `error`）。
* **下載**：從響應的 `result_url` 直接 GET，**不要帶 `Authorization` 頭**（OSS 簽名直鏈，帶了反而 403）；`result_url` 預設 **24 小時過期**，務必儘快轉存。

<CodeGroup>
  ```bash 查詢狀態 theme={null}
  curl "https://api.apiyi.com/v1/tasks/3b216861-6a5f-441d-a438-602ab2c0d103" \
    -H "Authorization: Bearer sk-your-api-key"
  ```

  ```json 完成時響應 theme={null}
  {
    "status": "completed",
    "progress": 100,
    "result_url": "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=...",
    "task_id": "3b216861-6a5f-441d-a438-602ab2c0d103"
  }
  ```

  ```bash 下載影片 theme={null}
  # result_url 是 OSS 簽名直鏈，下載時不要帶 Authorization 頭（帶了反而 403）
  curl -L -o out.mp4 "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=..."
  ```

  ```bash 一條命令：查詢 + 下載 theme={null}
  TASK_ID="3b216861-6a5f-441d-a438-602ab2c0d103"
  URL=$(curl -s "https://api.apiyi.com/v1/tasks/$TASK_ID" \
    -H "Authorization: Bearer sk-your-api-key" | jq -r '.result_url')
  curl -L -o out.mp4 "$URL"   # 不帶 Authorization
  ```
</CodeGroup>

<Warning>
  上面是「已有 task\_id」的快捷查詢/下載。完整輪詢迴圈（含超時兜底）與 Python 客戶端見 [Wan 概覽 · 非同步呼叫流程](/zh-Hant/api-capabilities/wan/overview#非同步呼叫流程)。
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