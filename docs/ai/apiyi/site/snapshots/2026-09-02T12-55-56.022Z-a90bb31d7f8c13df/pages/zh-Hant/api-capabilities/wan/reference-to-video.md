> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan2.7 參考圖生影片 API 參考

> Wan2.7-r2v 參考圖生影片 API 參考與線上除錯：參考圖/影片保持主體特徵，支援多主體互動、音色參考與多宮格分鏡。

<Info>
  右側 Playground 可直接除錯：在 **Authorization** 填 `Bearer sk-your-api-key`，填好 `model` / `input.media` / `parameters` 後發起請求。提交成功返回 `task_id`，輪詢與下載見下方說明。
</Info>

<Tip>
  本頁是 `wan2.7-r2v`（參考圖生影片）的建立介面：給參考圖/參考影片，模型保留其中的主體（人物/動物/物體）和場景特徵，生成單角色表演或多角色互動影片。需要更多參考圖（≤9 張）可考慮 [HappyHorse r2v](/zh-Hant/api-capabilities/happyhorse/reference-to-video)。完整非同步流程見 [Wan 概覽](/zh-Hant/api-capabilities/wan/overview)。
</Tip>

<Warning>
  * **參考素材引用約定**：prompt 中用「圖1 / 圖2」指代 `reference_image`、「影片1 / 影片2」指代 `reference_video`，順序與 `media` 陣列一致（圖和影片分別計數）。僅一張圖/一個影片時可簡寫為「參考圖片」「參考影片」。
  * **數量限制**：`reference_image` + `reference_video` 合計 ≤5；`first_frame` 最多 1 張。
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
      "model": "wan2.7-r2v",
      "input": {
        "prompt": "一位身穿這件禮服的女孩在灑滿夕陽的花園裡緩步行走，微風輕拂裙襬，電影級光影",
        "media": [
          {"type": "reference_image", "url": "https://your-cdn.com/dress.png"}
        ]
      },
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": true, "watermark": true}
    }'
  ```

  ```python Python (單圖參考) theme={null}
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
          "prompt": "參考圖片，一位女孩在灑滿夕陽的花園裡緩步行走，電影級光影",
          "media": [{"type": "reference_image", "url": "https://your-cdn.com/girl.png"}],
      },
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True},
  }
  resp = requests.post(url, json=body, headers=headers, timeout=30)
  print("task_id:", resp.json()["output"]["task_id"])
  ```

  ```python Python (多主體 + 音色) theme={null}
  import requests

  # 多主體：圖1 = 女孩(帶音色)，影片1 = 男孩(帶音色)，圖2/圖3 = 道具/背景
  body = {
      "model": "wan2.7-r2v",
      "input": {
          "prompt": "影片1抱著圖2，路過圖1，並說道：今天的陽光真好。",
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

## 引數與媒體速查

| 引數                         | 型別     | 必填 | 預設      | 說明                                               |
| -------------------------- | ------ | -- | ------- | ------------------------------------------------ |
| `model`                    | string | ✓  | —       | 固定 `wan2.7-r2v`                                  |
| `input.prompt`             | string | ✓  | —       | ≤5000 字元，用「圖1/影片1」指代參考素材                         |
| `input.media`              | array  | ✓  | —       | 見下方媒體表                                           |
| `parameters.resolution`    | string |    | `1080P` | `720P` / `1080P`                                 |
| `parameters.ratio`         | string |    | `16:9`  | `16:9` / `9:16` / `1:1` / `4:3` / `3:4`（傳首幀圖時忽略） |
| `parameters.duration`      | int    |    | `5`     | 含參考影片時 2–10；不含時 2–15                             |
| `parameters.prompt_extend` | bool   |    | `true`  | 智慧改寫                                             |
| `parameters.watermark`     | bool   |    | `false` | 「AI 生成」水印                                        |

### `media[]` 取值

| `type`            | 張數/限制         | 說明                                                                |
| ----------------- | ------------- | ----------------------------------------------------------------- |
| `reference_image` | 與 video 合計 ≤5 | 參考圖，提供主體（人物/動物/物體）或場景；可附 `reference_voice` 指定音色                   |
| `reference_video` | 與 image 合計 ≤5 | 參考影片，提供主體與音色參考；不建議傳空鏡影片                                           |
| `first_frame`     | ≤1            | 可選首幀，聯合控制起始畫面                                                     |
| `reference_voice` | 附屬欄位          | 附在某條 `reference_image`/`reference_video` 上，指定該主體音色（wav/mp3，1–10s） |

## 響應格式

```json theme={null}
{
  "output": { "task_id": "acda59b4-3b10-4789-a5e5-edadae48adcb", "task_status": "PENDING" },
  "request_id": "..."
}
```

## 查詢狀態與下載影片

拿到 `task_id` 後，按以下三步查詢狀態並下載 mp4：

* **輪詢** `GET /v1/tasks/{task_id}`（帶 `Authorization`，查詢**不需要** `X-DashScope-Async` 頭），每 10 秒一次（不要 \< 3 秒），直到 `status` 變為 `completed`。參考生影片耗時通常 1–5 分鐘，建議客戶端超時設 20 分鐘兜底。
* **狀態取值**：`submitted`（排隊）/ `in_progress`（生成中，`progress` 常停在 30% 屬正常）/ `completed`（成功）/ `failed`（失敗，看 `error`）。
* **下載**：從響應的 `result_url` 直接 GET，**不要帶 `Authorization` 頭**（OSS 簽名直鏈，帶了反而 403）；`result_url` 預設 **24 小時過期**，務必儘快轉存。

<CodeGroup>
  ```bash 查詢狀態 theme={null}
  curl "https://api.apiyi.com/v1/tasks/acda59b4-3b10-4789-a5e5-edadae48adcb" \
    -H "Authorization: Bearer sk-your-api-key"
  ```

  ```json 完成時響應 theme={null}
  {
    "status": "completed",
    "progress": 100,
    "result_url": "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=...",
    "task_id": "acda59b4-3b10-4789-a5e5-edadae48adcb"
  }
  ```

  ```bash 下載影片 theme={null}
  # result_url 是 OSS 簽名直鏈，下載時不要帶 Authorization 頭（帶了反而 403）
  curl -L -o out.mp4 "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=..."
  ```

  ```bash 一條命令：查詢 + 下載 theme={null}
  TASK_ID="acda59b4-3b10-4789-a5e5-edadae48adcb"
  URL=$(curl -s "https://api.apiyi.com/v1/tasks/$TASK_ID" \
    -H "Authorization: Bearer sk-your-api-key" | jq -r '.result_url')
  curl -L -o out.mp4 "$URL"   # 不帶 Authorization
  ```
</CodeGroup>

<Warning>
  上面是「已有 task\_id」的快捷查詢/下載。完整輪詢迴圈（含超時兜底）與 Python 客戶端見 [Wan 概覽 · 非同步呼叫流程](/zh-Hant/api-capabilities/wan/overview#非同步呼叫流程)。
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