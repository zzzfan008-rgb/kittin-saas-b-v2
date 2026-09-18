> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# HappyHorse 文生视频 API 参考

> HappyHorse-1.1-t2v 文生视频 API 参考与在线调试：纯文本提示词生成视频，DashScope 异步透传端点。

<Info>
  右侧 Playground 可直接调试：在 **Authorization** 填 `Bearer sk-your-api-key`，填好 `model` / `input` / `parameters` 后发起请求。提交成功返回 `task_id`，轮询与下载见下方说明。
</Info>

<Tip>
  本页是 `happyhorse-1.1-t2v`（文生视频）的创建接口，只需一段文本 prompt。完整异步流程、状态表、Python 客户端见 [HappyHorse 概览](/api-capabilities/happyhorse/overview)。
</Tip>

<Warning>
  * 创建请求必须走 `/wan/api/v1/services/aigc/video-generation/video-synthesis` 并带请求头 `X-DashScope-Async: enable`，**不要用 `/v1/videos`**。
  * `duration` 必须是 **整数**（`5` 不是 `"5"`）；`resolution` 写 **大写** `720P`。
</Warning>

## 代码示例

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis" \
    -H "X-DashScope-Async: enable" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "happyhorse-1.1-t2v",
      "input": {
        "prompt": "一只猫在草地上奔跑，阳光明媚，镜头跟随，电影级光影"
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
      "X-DashScope-Async": "enable",   # 创建任务必须带
  }
  body = {
      "model": "happyhorse-1.1-t2v",
      "input": {"prompt": "一只猫在草地上奔跑，阳光明媚，镜头跟随"},
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True, "watermark": True},
  }

  resp = requests.post(url, json=body, headers=headers, timeout=30)
  print("task_id:", resp.json()["output"]["task_id"])
  ```

  ```python Python (零依赖) theme={null}
  import json, urllib.request

  BASE, KEY = "https://api.apiyi.com", "sk-your-api-key"
  body = {
      "model": "happyhorse-1.1-t2v",
      "input": {"prompt": "一只猫在草地上奔跑，阳光明媚"},
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

## 参数说明速查

| 参数                         | 类型     | 必填 | 默认      | 说明                      |
| -------------------------- | ------ | -- | ------- | ----------------------- |
| `model`                    | string | ✓  | —       | 固定 `happyhorse-1.1-t2v` |
| `input.prompt`             | string | ✓  | —       | 文本提示词，建议描述场景、镜头运动、光线、风格 |
| `parameters.resolution`    | string |    | `720P`  | `720P` / `1080P`（大写）    |
| `parameters.duration`      | int    |    | `5`     | 2–15 秒整数                |
| `parameters.prompt_extend` | bool   |    | `true`  | 智能改写，推荐开启               |
| `parameters.watermark`     | bool   |    | `false` | 右下角「AI 生成」水印            |
| `parameters.seed`          | int    |    | 随机      | 0–2147483647，固定可复现      |

## 响应格式

创建成功返回 `task_id`（**不是视频本身**）：

```json theme={null}
{
  "output": { "task_id": "...", "task_status": "PENDING" },
  "request_id": "..."
}
```

<Warning>
  提交后需 **轮询 `GET /v1/tasks/{task_id}`** 直到 `status: "completed"`，再从响应的 `result_url` 下载 mp4。下载时 **不要带 `Authorization` 头**（OSS 签名直链），`result_url` 默认 24 小时过期。完整轮询循环见 [HappyHorse 概览 · 异步调用流程](/api-capabilities/happyhorse/overview#异步调用流程)。
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