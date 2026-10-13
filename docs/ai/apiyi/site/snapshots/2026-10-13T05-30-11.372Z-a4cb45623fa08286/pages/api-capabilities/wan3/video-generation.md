> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Wan3.0 视频生成 API 参考

> Wan3.0 视频生成 API 参考与在线调试：一个模型 ID 覆盖文生 / 图生 / 参考生 / 视频编辑，最长 30 秒、480P-1080P，DashScope 异步透传端点。

<Info>
  右侧 Playground 可直接调试：在 **Authorization** 填 `Bearer sk-your-api-key`，填好 `model` / `input` / `parameters` 后发起请求。提交成功返回 `task_id`，后续轮询与下载见下方说明。
</Info>

<Tip>
  Wan3.0 **一个模型 ID 覆盖全部玩法**——传什么素材就做什么事。完整的异步流程、状态表、计费规则与 Python 客户端见 [Wan3.0 概览](/api-capabilities/wan3/overview)。
</Tip>

<Warning>
  * 创建请求必须走 `/wan/api/v1/services/aigc/video-generation/video-synthesis` 并带请求头 `X-DashScope-Async: enable`，**不要用 `/v1/videos`**（媒体字段会被丢弃，且计费不准确）。
  * `duration` 必须是**整数**（`5` 不是 `"5"`）；`resolution` 写**大写** `720P`。
  * 终态是 `completed` / `failed`，**不是** `SUCCEEDED`。
</Warning>

## 四种玩法：只改 `input.media`

| 玩法 | `media` 怎么传 |
| - | - |
| 文生视频 | 不传 `media` |
| 图生视频 | `[{ "type": "first_frame", "url": "..." }]` |
| 首尾帧生视频 | `first_frame` + `last_frame` |
| 参考生视频 | `reference_image` / `reference_video` / `reference_audio`（可混合） |

<Warning>
  `first_frame` / `last_frame` **不能**与 `reference_*` / `file` / `link` 混用。
</Warning>

## 代码示例

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/wan/api/v1/services/aigc/video-generation/video-synthesis" \
    -H "X-DashScope-Async: enable" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "wan3.0-video",
      "input": {
        "prompt": "黄昏海边的灯塔，镜头缓慢推进，海浪轻拍礁石，海鸟叫声，电影级光影"
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
      "X-DashScope-Async": "enable",   # 创建任务必须带
  }
  body = {
      "model": "wan3.0-video",
      "input": {"prompt": "黄昏海边的灯塔，镜头缓慢推进，海浪轻拍礁石，海鸟叫声"},
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
        input: { prompt: "黄昏海边的灯塔，镜头缓慢推进，海浪轻拍礁石，海鸟叫声" },
        parameters: { resolution: "720P", ratio: "16:9", duration: 5, prompt_extend: true },
      }),
    }
  );
  const data = await res.json();
  console.log("task_id:", data.output.task_id);
  ```
</CodeGroup>

### 图生视频（首帧）

```json theme={null}
{
  "model": "wan3.0-video",
  "input": {
    "prompt": "猫咪转头看向镜头，眨眼",
    "media": [{ "type": "first_frame", "url": "https://example.com/cat.jpg" }]
  },
  "parameters": { "resolution": "720P", "duration": 5 }
}
```

### 参考生视频（参考图 + 参考视频）

```json theme={null}
{
  "model": "wan3.0-video-prime",
  "input": {
    "prompt": "把视频1 里的人物换成图1 的人物，其他保持不变",
    "media": [
      { "type": "reference_image", "url": "https://example.com/person.jpg" },
      { "type": "reference_video", "url": "https://example.com/source.mp4" }
    ]
  },
  "parameters": { "resolution": "720P", "ratio": "9:16", "duration": 5 }
}
```

<Warning>
  **参考视频的时长要计费。** 上面这例若参考视频 10 秒、输出 5 秒，按 **15 秒** 计费。输入 + 输出合计上限 30 秒。详见 [计费规则](/api-capabilities/wan3/overview#%EF%B8%8F-%E8%AE%A1%E8%B4%B9%E8%A7%84%E5%88%99%E5%92%8C%E5%88%AB%E7%9A%84%E8%A7%86%E9%A2%91%E6%A8%A1%E5%9E%8B%E4%B8%8D%E4%B8%80%E6%A0%B7)。
</Warning>

## 查询任务与下载

```bash theme={null}
# 轮询（5–10 秒一次，不要小于 3 秒）
curl "https://api.apiyi.com/v1/tasks/$TASK_ID" \
  -H "Authorization: Bearer sk-your-api-key"

# 下载：result_url 是 OSS 签名直链，不要带 Authorization
curl -o out.mp4 "$RESULT_URL"
```

| 状态 | 含义 | 下一步 |
| - | - | - |
| `submitted` | 排队中 | 继续轮询 |
| `in_progress` | 生成中 | 继续轮询 |
| `completed` | 成功 | 从 `result_url` 下载 |
| `failed` | 失败 | 看 `error.message`，**不计费** |

## 价格速查

默认价为阿里云官方价的 **98 折**；叠加 [充值加赠](/faq/recharge-promotions) 最高档后**低至官方 8.2 折**。

| 模型 | 分辨率 | 默认价 | 送 10%（一般） | **送 20%（大客）** | 大客价折人民币 |
| - | - | - | - | - | - |
| `wan3.0-video` | 480P | \$0.0294/秒 | \$0.0267/秒 | **\$0.0245/秒** | ¥0.1715/秒 |
| `wan3.0-video` | 720P | \$0.0588/秒 | \$0.0535/秒 | **\$0.049/秒** | ¥0.343/秒 |
| `wan3.0-video` | 1080P | \$0.1176/秒 | \$0.1069/秒 | **\$0.098/秒** | ¥0.686/秒 |
| `wan3.0-video-prime` | 480P | \$0.063/秒 | \$0.0573/秒 | **\$0.0525/秒** | ¥0.3675/秒 |
| `wan3.0-video-prime` | 720P | \$0.126/秒 | \$0.1145/秒 | **\$0.105/秒** | ¥0.735/秒 |
| `wan3.0-video-prime` | 1080P | \$0.252/秒 | \$0.2291/秒 | **\$0.21/秒** | ¥1.47/秒 |

<Note>模型价格与官网对齐，且可能随官网调整；上表仅供参考，具体以顶部导航「模型价格」栏目为准：[模型价格](/models/index)。</Note>

<Card title="完整参数、计费规则与最佳实践" icon="book-open" href="/api-capabilities/wan3/overview">
  Wan3.0 概览
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