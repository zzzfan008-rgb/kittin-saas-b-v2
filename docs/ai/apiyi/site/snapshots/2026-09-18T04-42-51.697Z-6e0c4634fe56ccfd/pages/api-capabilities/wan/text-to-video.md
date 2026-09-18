> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan2.7 文生视频 API 参考

> Wan2.7-t2v 文生视频 API 参考与在线调试：纯文本提示词生成 2–15 秒视频，DashScope 异步透传端点。

<Info>
  右侧 Playground 可直接调试：在 **Authorization** 填 `Bearer sk-your-api-key`，填好 `model` / `input` / `parameters` 后发起请求。提交成功会返回 `task_id`，后续轮询与下载见下方说明。
</Info>

<Tip>
  本页是 `wan2.7-t2v`（文生视频）的创建接口。只需一段文本 prompt，无需 media。需要让图片动起来或保持主体特征，请改用 [图生视频](/api-capabilities/wan/image-to-video) / [参考图生视频](/api-capabilities/wan/reference-to-video)。完整异步流程、状态表、Python 客户端见 [Wan 概览](/api-capabilities/wan/overview)。
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
      "model": "wan2.7-t2v",
      "input": {
        "prompt": "黄昏海边的灯塔，镜头缓慢推进，海浪轻拍礁石，海鸟叫声，电影级光影，稳定运镜"
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
      "model": "wan2.7-t2v",
      "input": {"prompt": "黄昏海边的灯塔，镜头缓慢推进，海浪轻拍礁石，海鸟叫声"},
      "parameters": {"resolution": "720P", "duration": 5, "prompt_extend": True, "watermark": True},
  }

  resp = requests.post(url, json=body, headers=headers, timeout=30)
  task_id = resp.json()["output"]["task_id"]
  print("task_id:", task_id)   # 拿到后轮询 /v1/tasks/{task_id}
  ```

  ```python Python (零依赖) theme={null}
  import json, urllib.request

  BASE, KEY = "https://api.apiyi.com", "sk-your-api-key"
  body = {
      "model": "wan2.7-t2v",
      "input": {"prompt": "黄昏海边的灯塔，镜头缓慢推进，海浪轻拍礁石"},
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

| 参数                         | 类型     | 必填 | 默认      | 说明                                      |
| -------------------------- | ------ | -- | ------- | --------------------------------------- |
| `model`                    | string | ✓  | —       | 固定 `wan2.7-t2v`                         |
| `input.prompt`             | string | ✓  | —       | 文本提示词，建议描述场景、镜头运动、光线、风格                 |
| `input.negative_prompt`    | string |    | —       | 反向提示词，≤500 字符                           |
| `parameters.resolution`    | string |    | `720P`  | `720P` / `1080P`（大写）                    |
| `parameters.ratio`         | string |    | `16:9`  | `16:9` / `9:16` / `1:1` / `4:3` / `3:4` |
| `parameters.duration`      | int    |    | `5`     | 2–15 秒整数                                |
| `parameters.prompt_extend` | bool   |    | `true`  | 智能改写，推荐开启                               |
| `parameters.watermark`     | bool   |    | `false` | 右下角「AI 生成」水印                            |
| `parameters.seed`          | int    |    | 随机      | 0–2147483647，固定可复现                      |

## 响应格式

创建成功返回 `task_id`（**不是视频本身**）：

```json theme={null}
{
  "output": { "task_id": "c2e7570c-0af2-4eba-919f-3af3d1164a38", "task_status": "PENDING" },
  "request_id": "a23b81b0-0c05-9972-a6c9-ee757400afdb"
}
```

## 查询状态与下载视频

拿到 `task_id` 后，按以下三步查询状态并下载 mp4：

* **轮询** `GET /v1/tasks/{task_id}`（带 `Authorization`，查询**不需要** `X-DashScope-Async` 头），每 5–10 秒一次（不要 \< 3 秒），直到 `status` 变为 `completed`。
* **状态取值**：`submitted`（排队）/ `in_progress`（生成中，`progress` 常停在 30% 属正常）/ `completed`（成功）/ `failed`（失败，看 `error`）。
* **下载**：从响应的 `result_url` 直接 GET，**不要带 `Authorization` 头**（OSS 签名直链，带了反而 403）；`result_url` 默认 **24 小时过期**，务必尽快转存。

<CodeGroup>
  ```bash 查询状态 theme={null}
  curl "https://api.apiyi.com/v1/tasks/c2e7570c-0af2-4eba-919f-3af3d1164a38" \
    -H "Authorization: Bearer sk-your-api-key"
  ```

  ```json 完成时响应 theme={null}
  {
    "status": "completed",
    "progress": 100,
    "result_url": "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=...",
    "task_id": "c2e7570c-0af2-4eba-919f-3af3d1164a38"
  }
  ```

  ```bash 下载视频 theme={null}
  # result_url 是 OSS 签名直链，下载时不要带 Authorization 头（带了反而 403）
  curl -L -o out.mp4 "https://dashscope-result-xxx.oss-cn-beijing.aliyuncs.com/xxx.mp4?Expires=...&Signature=..."
  ```

  ```bash 一条命令：查询 + 下载 theme={null}
  TASK_ID="c2e7570c-0af2-4eba-919f-3af3d1164a38"
  URL=$(curl -s "https://api.apiyi.com/v1/tasks/$TASK_ID" \
    -H "Authorization: Bearer sk-your-api-key" | jq -r '.result_url')
  curl -L -o out.mp4 "$URL"   # 不带 Authorization
  ```
</CodeGroup>

<Warning>
  上面是「已有 task\_id」的快捷查询/下载。完整轮询循环（含超时兜底）与 Python 客户端见 [Wan 概览 · 异步调用流程](/api-capabilities/wan/overview#异步调用流程)。
</Warning>


## OpenAPI

````yaml api-reference/wan-text-to-video-openapi.yaml POST /wan/api/v1/services/aigc/video-generation/video-synthesis
openapi: 3.1.0
info:
  title: Wan2.7 文生视频 API
  description: >
    阿里云通义万相 Wan2.7 文生视频（`wan2.7-t2v`）—— 纯文本提示词生成视频，DashScope 异步透传端点。


    - 创建请求必须带请求头 `X-DashScope-Async: enable`

    - 异步任务式端点：本端点只提交任务并返回 `task_id`，需配合 `GET /v1/tasks/{task_id}` 轮询，再从响应的
    `result_url` 下载 mp4

    - `result_url` 为阿里云 OSS 签名直链，下载时**不要带 Authorization 头**，有效期 24 小时

    - **不要使用 `/v1/videos`** 提交 Wan 视频任务（媒体字段会被丢弃）


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
        提交一个 `wan2.7-t2v` 文生视频任务（异步），返回 `task_id` 和 `task_status: "PENDING"`。


        - 必填：`model`、`input.prompt`、请求头 `X-DashScope-Async: enable`

        - 可选：`parameters`（resolution / ratio / duration / prompt_extend /
        watermark / seed）

        - **响应不含视频文件**，需轮询 `GET /v1/tasks/{task_id}` 直到 `status: "completed"`，再从
        `result_url` 下载

        - 720P / 5 秒典型耗时 100–120 秒
      operationId: createWan27TextToVideo
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
              $ref: '#/components/schemas/WanTextToVideoRequest'
            example:
              model: wan2.7-t2v
              input:
                prompt: 黄昏海边的灯塔，镜头缓慢推进，海浪轻拍礁石，海鸟叫声，电影级光影，稳定运镜
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
                $ref: '#/components/schemas/WanVideoTask'
        '400':
          description: 参数非法（duration 传成字符串、resolution 取值错误、缺 prompt 等）
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
    WanTextToVideoRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: 模型 ID，文生视频固定 wan2.7-t2v（历史版本可填 wan2.6-t2v）
          enum:
            - wan2.7-t2v
            - wan2.6-t2v
          default: wan2.7-t2v
        input:
          type: object
          required:
            - prompt
          properties:
            prompt:
              type: string
              description: 文本提示词，建议描述场景、镜头运动、光线、风格
              example: 黄昏海边的灯塔，镜头缓慢推进，海浪轻拍礁石，海鸟叫声
            negative_prompt:
              type: string
              description: 反向提示词，不希望出现的内容，≤500 字符
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
              example: c2e7570c-0af2-4eba-919f-3af3d1164a38
            task_status:
              type: string
              description: 任务初始状态
              enum:
                - PENDING
                - RUNNING
                - SUCCEEDED
                - FAILED
              example: PENDING
        request_id:
          type: string
          description: 请求唯一标识，排查问题时提供给客服
          example: a23b81b0-0c05-9972-a6c9-ee757400afdb
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
        ratio:
          type: string
          description: 宽高比；传了首帧图时自动忽略
          enum:
            - '16:9'
            - '9:16'
            - '1:1'
            - '4:3'
            - '3:4'
          default: '16:9'
        duration:
          type: integer
          description: 视频时长（秒），整数，取值 2–15
          minimum: 2
          maximum: 15
          default: 5
        prompt_extend:
          type: boolean
          description: 是否开启 prompt 智能改写，对短 prompt 提升明显，强烈推荐 true
          default: true
        watermark:
          type: boolean
          description: 是否添加右下角「AI 生成」水印
          default: false
        seed:
          type: integer
          description: 随机数种子，0–2147483647，固定可提升可复现性
          minimum: 0
          maximum: 2147483647
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key

````