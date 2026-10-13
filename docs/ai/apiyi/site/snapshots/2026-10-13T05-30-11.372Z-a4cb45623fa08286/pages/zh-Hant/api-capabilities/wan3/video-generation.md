> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan3.0 影片生成 API 參考

> Wan3.0 影片生成 API 參考與線上除錯：一個模型 ID 覆蓋文生 / 圖生 / 參考生 / 影片編輯，最長 30 秒、480P-1080P，DashScope 非同步透傳端點。

<Info>
  右側 Playground 可直接除錯：在 **Authorization** 填 `Bearer sk-your-api-key`，填好 `model` / `input` / `parameters` 後發起請求。提交成功返回 `task_id`，後續輪詢與下載見下方說明。
</Info>

<Tip>
  Wan3.0 **一個模型 ID 覆蓋全部玩法**——傳什麼素材就做什麼事。完整的非同步流程、狀態表、計費規則與 Python 客戶端見 [Wan3.0 概覽](/zh-Hant/api-capabilities/wan3/overview)。
</Tip>

<Warning>
  * 建立請求必須走 `/wan/api/v1/services/aigc/video-generation/video-synthesis` 並帶請求頭 `X-DashScope-Async: enable`，**不要用 `/v1/videos`**（媒體欄位會被丟棄，且計費不準確）。
  * `duration` 必須是**整數**（`5` 不是 `"5"`）；`resolution` 寫**大寫** `720P`。
  * 終態是 `completed` / `failed`，**不是** `SUCCEEDED`。
</Warning>

## 四種玩法：只改 `input.media`

| 玩法 | `media` 怎麼傳 |
| - | - |
| 文生影片 | 不傳 `media` |
| 圖生影片 | `[{ "type": "first_frame", "url": "..." }]` |
| 首尾幀生影片 | `first_frame` + `last_frame` |
| 參考生影片 | `reference_image` / `reference_video` / `reference_audio`（可混合） |

<Warning>
  `first_frame` / `last_frame` **不能**與 `reference_*` / `file` / `link` 混用。
</Warning>

## 程式碼示例

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis" \
    -H "X-DashScope-Async: enable" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "wan3.0-video",
      "input": {
        "prompt": "黃昏海邊的燈塔，鏡頭緩慢推進，海浪輕拍礁石，海鳥叫聲，電影級光影"
      },
      "parameters": {
        "resolution": "720P",
        "ratio": "16:9",
        "duration": 5,
        "prompt_extend": true
      }
    }'
  ```

  ```python Python (requests) theme={null}
  import requests

  url = "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis"
  headers = {
      "Authorization": "Bearer sk-your-api-key",
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable",   # 建立任務必須帶
  }
  body = {
      "model": "wan3.0-video",
      "input": {"prompt": "黃昏海邊的燈塔，鏡頭緩慢推進，海浪輕拍礁石，海鳥叫聲"},
      "parameters": {"resolution": "720P", "ratio": "16:9", "duration": 5, "prompt_extend": True},
  }

  resp = requests.post(url, json=body, headers=headers, timeout=30)
  task_id = resp.json()["output"]["task_id"]
  print("task_id:", task_id)
  ```

  ```javascript Node.js theme={null}
  const res = await fetch(
    "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer sk-your-api-key",
        "Content-Type": "application/json",
        "X-DashScope-Async": "enable",
      },
      body: JSON.stringify({
        model: "wan3.0-video",
        input: { prompt: "黃昏海邊的燈塔，鏡頭緩慢推進，海浪輕拍礁石，海鳥叫聲" },
        parameters: { resolution: "720P", ratio: "16:9", duration: 5, prompt_extend: true },
      }),
    }
  );
  const data = await res.json();
  console.log("task_id:", data.output.task_id);
  ```
</CodeGroup>

### 圖生影片（首幀）

```json theme={null}
{
  "model": "wan3.0-video",
  "input": {
    "prompt": "貓咪轉頭看向鏡頭，眨眼",
    "media": [{ "type": "first_frame", "url": "https://example.com/cat.jpg" }]
  },
  "parameters": { "resolution": "720P", "duration": 5 }
}
```

### 參考生影片（參考圖 + 參考影片）

```json theme={null}
{
  "model": "wan3.0-video-prime",
  "input": {
    "prompt": "把影片1 裡的人物換成圖1 的人物，其他保持不變",
    "media": [
      { "type": "reference_image", "url": "https://example.com/person.jpg" },
      { "type": "reference_video", "url": "https://example.com/source.mp4" }
    ]
  },
  "parameters": { "resolution": "720P", "ratio": "9:16", "duration": 5 }
}
```

<Warning>
  **參考影片的時長要計費。** 上面這例若參考影片 10 秒、輸出 5 秒，按 **15 秒** 計費。輸入 + 輸出合計上限 30 秒。詳見 [計費規則](/zh-Hant/api-capabilities/wan3/overview#%EF%B8%8F-%E8%AE%A1%E8%B4%B9%E8%A7%84%E5%88%99%E5%92%8C%E5%88%AB%E7%9A%84%E8%A7%86%E9%A2%91%E6%A8%A1%E5%9E%8B%E4%B8%8D%E4%B8%80%E6%A0%B7)。
</Warning>

## 查詢任務與下載

```bash theme={null}
# 輪詢（5–10 秒一次，不要小於 3 秒）
curl "https://api.apiyi.com/v1/tasks/$TASK_ID" \
  -H "Authorization: Bearer sk-your-api-key"

# 下載：result_url 是 OSS 簽名直鏈，不要帶 Authorization
curl -o out.mp4 "$RESULT_URL"
```

| 狀態 | 含義 | 下一步 |
| - | - | - |
| `submitted` | 排隊中 | 繼續輪詢 |
| `in_progress` | 生成中 | 繼續輪詢 |
| `completed` | 成功 | 從 `result_url` 下載 |
| `failed` | 失敗 | 看 `error.message`，**不計費** |

## 價格速查

預設價為阿里雲官方價的 **98 折**；疊加 [充值加贈](/zh-Hant/faq/recharge-promotions) 最高檔後**低至官方 8.2 折**。

| 模型 | 解析度 | 預設價 | 送 10%（一般） | **送 20%（大客）** | 大客價折人民幣 |
| - | - | - | - | - | - |
| `wan3.0-video` | 480P | \$0.0294/秒 | \$0.0267/秒 | **\$0.0245/秒** | ¥0.1715/秒 |
| `wan3.0-video` | 720P | \$0.0588/秒 | \$0.0535/秒 | **\$0.049/秒** | ¥0.343/秒 |
| `wan3.0-video` | 1080P | \$0.1176/秒 | \$0.1069/秒 | **\$0.098/秒** | ¥0.686/秒 |
| `wan3.0-video-prime` | 480P | \$0.063/秒 | \$0.0573/秒 | **\$0.0525/秒** | ¥0.3675/秒 |
| `wan3.0-video-prime` | 720P | \$0.126/秒 | \$0.1145/秒 | **\$0.105/秒** | ¥0.735/秒 |
| `wan3.0-video-prime` | 1080P | \$0.252/秒 | \$0.2291/秒 | **\$0.21/秒** | ¥1.47/秒 |

<Note>模型價格與官網對齊，且可能隨官網調整；上表僅供參考，具體以頂部導航「模型價格」欄目為準：[模型價格](/zh-Hant/models/index)。</Note>

<Card title="完整引數、計費規則與最佳實踐" icon="book-open" href="/zh-Hant/api-capabilities/wan3/overview">
  Wan3.0 概覽
</Card>


## OpenAPI

````yaml api-reference/wan3-video-openapi.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: Wan3.0 视频生成 API
  description: >
    阿里云通义万相 Wan3.0 视频生成 —— 一个模型 ID 覆盖文生 / 图生 / 参考生 / 视频编辑，DashScope 异步透传端点。


    - 创建请求必须带请求头 `X-DashScope-Async: enable`

    - 异步任务式端点：本端点只提交任务并返回 `task_id`，需配合 `GET /v1/tasks/{task_id}` 轮询，再从响应的
    `result_url` 下载 mp4

    - 终态是 `completed` / `failed`，**不是** DashScope 原生的 `SUCCEEDED`

    - `result_url` 为阿里云 OSS 签名直链，下载时**不要带 Authorization 头**，有效期 24 小时

    - **不要使用 `/v1/videos`** 提交 Wan 视频任务（媒体字段会被丢弃，且计费不准确）


    **计费**：按秒计费，计费秒数 = 输入参考视频时长 + 输出视频时长，单价由输出分辨率决定；参考图片 / 音频 / 文件不计费；输入 +
    输出合计上限 30 秒；失败任务全额退费。


    **认证方式**：在请求头中添加 `Authorization: Bearer YOUR_API_KEY`


    **获取 API Key**：访问 API易控制台 `api.apiyi.com/token` 创建令牌
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: 主要端点
security:
  - bearerAuth: []
paths:
  /wan/api/v1/services/aigc/video-generation/video-synthesis:
    post:
      tags:
        - 视频生成
      summary: 视频生成：创建 Wan3.0 视频生成任务
      description: >
        提交一个 Wan3.0 视频生成任务（异步），返回 `task_id` 和 `task_status: "PENDING"`。


        - 必填：`model`、`input.prompt`、请求头 `X-DashScope-Async: enable`

        - 玩法由 `input.media[]` 决定：不传 = 文生视频；`first_frame` =
        图生视频；`reference_image` / `reference_video` = 参考生视频

        - `first_frame` / `last_frame` 不能与 `reference_*` / `file` / `link` 混用

        - **响应不含视频文件**，需轮询 `GET /v1/tasks/{task_id}` 直到 `status: "completed"`，再从
        `result_url` 下载

        - 5 秒视频典型耗时：480P 约 100 秒、720P 约 120 秒、1080P 约 170 秒
      operationId: createWan30Video
      parameters:
        - name: X-DashScope-Async
          in: header
          required: true
          description: >-
            异步处理开关，必须设置为 enable，否则报 current user api does not support
            synchronous calls
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
              $ref: '#/components/schemas/Wan30VideoRequest'
            example:
              model: wan3.0-video
              input:
                prompt: 黄昏海边的灯塔，镜头缓慢推进，海浪轻拍礁石，海鸟叫声，电影级光影
              parameters:
                resolution: 720P
                ratio: '16:9'
                duration: 5
                prompt_extend: true
      responses:
        '200':
          description: 任务创建成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Wan30VideoResponse'
              example:
                output:
                  task_id: 9db29626-79fc-40d1-b9c2-c6b0caf8ac15
                  task_status: PENDING
                request_id: e616d8c9-1147-9ecd-b2b5-abbbe89a4642
        '400':
          description: 请求参数错误
        '401':
          description: 认证失败：API Key 无效
        '403':
          description: 无权限：令牌分组不含 Wan&HappyHorse，或计费模式为按次计费
      security:
        - bearerAuth: []
components:
  schemas:
    Wan30VideoRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          enum:
            - wan3.0-video
            - wan3.0-video-prime
          default: wan3.0-video
          description: 模型 ID。wan3.0-video 为标准版；wan3.0-video-prime 为优速版，出片更快、单价更高
        input:
          $ref: '#/components/schemas/Wan30Input'
        parameters:
          $ref: '#/components/schemas/Wan30Parameters'
    Wan30VideoResponse:
      type: object
      properties:
        output:
          type: object
          properties:
            task_id:
              type: string
              description: 任务 ID，用于 GET /v1/tasks/{task_id} 轮询
            task_status:
              type: string
              description: 提交时固定为 PENDING
        request_id:
          type: string
          description: 上游请求 ID
    Wan30Input:
      type: object
      required:
        - prompt
      properties:
        prompt:
          type: string
          description: 自然语言描述。有多个素材时用「图1 / 视频1」在 prompt 里指代
          example: 黄昏海边的灯塔，镜头缓慢推进，海浪轻拍礁石
        negative_prompt:
          type: string
          description: 反向提示词
        media:
          type: array
          description: >-
            媒体素材数组。不传 = 文生视频。first_frame / last_frame 不能与 reference_* / file /
            link 混用
          items:
            $ref: '#/components/schemas/Wan30Media'
    Wan30Parameters:
      type: object
      properties:
        resolution:
          type: string
          enum:
            - 480P
            - 720P
            - 1080P
          default: 1080P
          description: 输出分辨率（大写）。决定单价，建议显式指定
        ratio:
          type: string
          enum:
            - '16:9'
            - '9:16'
            - '1:1'
            - '4:3'
            - '3:4'
            - adaptive
          description: 宽高比。传了首帧图时自动忽略
        duration:
          type: integer
          description: 输出时长（整数秒）。不传默认 5 秒；输入参考视频时长 + 输出时长合计不得超过 30 秒
          example: 5
        prompt_extend:
          type: boolean
          default: true
          description: 智能改写 prompt，建议保持 true
        audio:
          type: boolean
          default: true
          description: 是否输出音轨，默认开启
        watermark:
          type: boolean
          default: false
          description: 右下角「AI 生成」水印
        seed:
          type: integer
          minimum: 0
          maximum: 2147483647
          description: 随机种子，固定可提升可复现性
    Wan30Media:
      type: object
      required:
        - type
        - url
      properties:
        type:
          type: string
          enum:
            - first_frame
            - last_frame
            - reference_image
            - reference_video
            - reference_audio
            - file
            - link
          description: 素材类型。reference_video 的时长会计入计费秒数，其余素材不计费
        url:
          type: string
          format: uri
          description: 公网可直接 GET 的 https 链接，需在任务完成前保持可访问
          example: https://example.com/first-frame.jpg
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API易 API Key，格式：Bearer sk-your-api-key

````

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.