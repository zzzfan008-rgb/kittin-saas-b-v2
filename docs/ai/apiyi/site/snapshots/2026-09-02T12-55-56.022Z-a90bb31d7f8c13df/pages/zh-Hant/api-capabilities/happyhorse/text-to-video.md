> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# HappyHorse 文生影片 API 參考

> HappyHorse-1.1-t2v 文生影片 API 參考與線上除錯：純文本提示詞生成影片，DashScope 非同步透傳端點。

<Info>
  右側 Playground 可直接除錯：在 **Authorization** 填 `Bearer sk-your-api-key`，填好 `model` / `input` / `parameters` 後發起請求。提交成功返回 `task_id`，輪詢與下載見下方說明。
</Info>

<Tip>
  本頁是 `happyhorse-1.1-t2v`（文生影片）的建立介面，只需一段文本 prompt。完整非同步流程、狀態表、Python 客戶端見 [HappyHorse 概覽](/zh-Hant/api-capabilities/happyhorse/overview)。
</Tip>

<Warning>
  * 建立請求必須走 `/wan/api/v1/services/aigc/video-generation/video-synthesis` 並帶請求頭 `X-DashScope-Async: enable`，**不要用 `/v1/videos`**。
  * `duration` 必須是 **整數**（`5` 不是 `"5"`）；`resolution` 寫 **大寫** `720P`。
</Warning>

## 程式碼示例

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis" \
    -H "X-DashScope-Async: enable" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "happyhorse-1.1-t2v",
      "input": {
        "prompt": "一隻貓在草地上奔跑，陽光明媚，鏡頭跟隨，電影級光影"
      },
      "parameters": {
        "resolution": "720P",
        "duration": 5,
        "prompt_extend": true,
        "watermark": true
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
      "model": "happyhorse-1.1-t2v",
      "input": {"prompt": "一隻貓在草地上奔跑，陽光明媚，鏡頭跟隨"},
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True, "watermark": True},
  }

  resp = requests.post(url, json=body, headers=headers, timeout=30)
  print("task_id:", resp.json()["output"]["task_id"])
  ```

  ```python Python (零依賴) theme={null}
  import json, urllib.request

  BASE, KEY = "https://api.apiyi.com", "sk-your-api-key"
  body = {
      "model": "happyhorse-1.1-t2v",
      "input": {"prompt": "一隻貓在草地上奔跑，陽光明媚"},
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True},
  }
  req = urllib.request.Request(
      BASE + "/wan/api/v1/services/aigc/video-generation/video-synthesis",
      data=json.dumps(body).encode(),
      headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json",
               "X-DashScope-Async": "enable"},
      method="POST",
  )
  print(json.loads(urllib.request.urlopen(req).read())["output"]["task_id"])
  ```
</CodeGroup>

## 引數說明速查

| 引數                         | 型別     | 必填 | 預設      | 說明                      |
| -------------------------- | ------ | -- | ------- | ----------------------- |
| `model`                    | string | ✓  | —       | 固定 `happyhorse-1.1-t2v` |
| `input.prompt`             | string | ✓  | —       | 文本提示詞，建議描述場景、鏡頭運動、光線、風格 |
| `parameters.resolution`    | string |    | `720P`  | `720P` / `1080P`（大寫）    |
| `parameters.duration`      | int    |    | `5`     | 2–15 秒整數                |
| `parameters.prompt_extend` | bool   |    | `true`  | 智慧改寫，推薦開啟               |
| `parameters.watermark`     | bool   |    | `false` | 右下角「AI 生成」水印            |
| `parameters.seed`          | int    |    | 隨機      | 0–2147483647，固定可復現      |

## 響應格式

建立成功返回 `task_id`（**不是影片本身**）：

```json theme={null}
{
  "output": { "task_id": "...", "task_status": "PENDING" },
  "request_id": "..."
}
```

<Warning>
  提交後需 **輪詢 `GET /v1/tasks/{task_id}`** 直到 `status: "completed"`，再從響應的 `result_url` 下載 mp4。下載時 **不要帶 `Authorization` 頭**（OSS 簽名直鏈），`result_url` 預設 24 小時過期。完整輪詢迴圈見 [HappyHorse 概覽 · 非同步呼叫流程](/zh-Hant/api-capabilities/happyhorse/overview#非同步呼叫流程)。
</Warning>


## OpenAPI

````yaml api-reference/happyhorse-text-to-video-openapi.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: HappyHorse 文生视频 API
  description: >
    阿里云 HappyHorse-1.0 文生视频（`happyhorse-1.1-t2v`）—— 纯文本提示词生成视频，DashScope 异步透传端点。


    - 创建请求必须带请求头 `X-DashScope-Async: enable`

    - 异步任务式端点：返回 `task_id`，需配合 `GET /v1/tasks/{task_id}` 轮询，再从 `result_url`
    下载（不带 Authorization 头，24 小时过期）

    - **不要使用 `/v1/videos`**

    - 与 Wan 系列共用同一端点和 schema，只改 model 名即可互换


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
      summary: 文生视频：根据文本提示词创建视频生成任务
      description: >
        提交一个 `happyhorse-1.1-t2v` 文生视频任务（异步），返回 `task_id`。


        - 必填：`model`、`input.prompt`、请求头 `X-DashScope-Async: enable`

        - **响应不含视频文件**，需轮询 `GET /v1/tasks/{task_id}` 直到 `completed`，再从
        `result_url` 下载

        - 720P / 5 秒典型耗时 105–115 秒
      operationId: createHappyHorseTextToVideo
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
              $ref: '#/components/schemas/HappyHorseTextToVideoRequest'
            example:
              model: happyhorse-1.1-t2v
              input:
                prompt: 一只猫在草地上奔跑，阳光明媚，镜头跟随，电影级光影
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
          description: 参数非法（duration 类型错、resolution 取值错误、缺 prompt 等）
        '401':
          description: 未授权 - API Key 无效
        '403':
          description: 内容审核拦截或分组无权限
        '429':
          description: 请求频率超限或余额不足
        '500':
          description: 上游网关错误，建议重试 1–2 次
      security:
        - bearerAuth: []
components:
  schemas:
    HappyHorseTextToVideoRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: 模型 ID，文生视频固定 happyhorse-1.1-t2v
          enum:
            - happyhorse-1.1-t2v
          default: happyhorse-1.1-t2v
        input:
          type: object
          required:
            - prompt
          properties:
            prompt:
              type: string
              description: 文本提示词，建议描述场景、镜头运动、光线、风格
              example: 一只猫在草地上奔跑，阳光明媚，镜头跟随
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
              example: hh-12ab34cd-...
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