> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash Vision Chat API 参考

> deepseek-v4-flash-vision-exp 的 OpenAI 兼容 Chat Completions API 参考与在线调试：三种传图方式、detail 省 token、思考开关，令牌需用 default 分组。

<Warning>
  **调试前先确认令牌分组是 `default`。**

  `ClaudeCode` 分组的令牌调这个端点虽然也返回 200，但 `detail`、思考开关、`logprobs`
  三个参数全部失效，响应里还会缺 `completion_tokens_details` 字段 —— 看起来像参数写错了，
  实际是分组不对。Anthropic 格式请改用
  [Messages 在线调试](/api-capabilities/deepseek-v4-flash-vision/messages)。
</Warning>

<Info>
  右侧 Playground 可直接调试：在 **Authorization** 填 `Bearer sk-your-api-key`，
  默认示例用的是一张公网图片、并已关闭深度思考，点击发送即可看到响应。
  换成本地图片时把 `image_url.url` 改成 `data:image/jpeg;base64,<BASE64>`。
</Info>

## 参数说明速查

| 参数                                        | 类型     | 必填 | 默认        | 说明                                            |
| ----------------------------------------- | ------ | -- | --------- | --------------------------------------------- |
| `model`                                   | string | ✓  | —         | 固定 `deepseek-v4-flash-vision-exp`             |
| `messages`                                | array  | ✓  | —         | `content` 可以是字符串，也可以是内容块数组（图文混合）              |
| `max_tokens`                              | int    |    | —         | 输出配额，硬上限 393,216；**开思考时建议 2000+**             |
| `thinking.type`                           | string |    | `enabled` | `disabled` 可靠关闭思考，省 80 输入 tokens              |
| `reasoning_effort`                        | string |    | —         | `none` 等效于关闭思考；low/high/max 之间无稳定差异           |
| `response_format`                         | object |    | —         | 只支持 `json_object`；`json_schema` 会报错           |
| `stream`                                  | bool   |    | `false`   | SSE 流式，配合 `stream_options.include_usage` 回传用量 |
| `temperature` / `top_p` / `stop` / `seed` | —      |    | —         | 均生效                                           |
| `logprobs` / `top_logprobs`               | —      |    | —         | 生效，`top_logprobs` 范围 0–20                     |
| `tools`                                   | array  |    | —         | Function Call，需要结构化输出时用它替代 `json_schema`      |

## 三种传图方式

### `image_url` + base64 data URL

```json theme={null}
{
  "type": "image_url",
  "image_url": {"url": "data:image/jpeg;base64,<BASE64>", "detail": "original"}
}
```

### `image_url` + 公网外链

```json theme={null}
{
  "type": "image_url",
  "image_url": {"url": "https://example.com/image.jpg", "detail": "low"}
}
```

外链最长 8192 字符，需 60 秒内下载完成。

### `file` 块 + `file_data`

```json theme={null}
{
  "type": "file",
  "file_data": "data:image/jpeg;base64,<BASE64>",
  "filename": "image.jpg"
}
```

与 `image_url` 通道折出的 tokens 完全一致（同一张图都是 303）。

<Warning>
  **`file` 块上的 `detail` 会被静默忽略** —— 不报错，但也不省 token。
  要用 `detail: "low"` 省钱，必须走 `image_url` 通道。

  另外 **`file_id`（Files API）在本平台不可用**，传了会报 `invalid file_id`。
</Warning>

## `detail` 能省多少

同一张 1600×1200 的图，四个档位实测：

| `detail`   | 图像 token | 相对 `original` |
| ---------- | -------- | ------------- |
| `low`      | 142      | **省 60%**     |
| `high`     | 354      | 持平            |
| `original` | 354      | 基准            |
| `auto`     | 354      | 持平            |

判断图片类型、认主体、粗分类这类任务用 `low` 就够；要读小字、认图表数值才需要 `original`。

填了枚举外的值会明确报错：
`unknown variant 'ultra', expected one of 'low', 'high', 'original', 'auto'`。

## 图片怎么折成 token

| 图片尺寸      | 折算 tokens |
| --------- | --------- |
| 64×64     | 114       |
| 384×384   | 114       |
| 800×800   | 346       |
| 2000×2000 | 346       |
| 4000×4000 | 346       |
| 1600×400  | 266       |
| 1600×1200 | 354       |

单图上限 384，多图各自独立计数、线性叠加。**上传前预压缩只省带宽、不省 token** ——
2000² 与 4000² 折出来完全一样。完整规律见
[概览](/api-capabilities/deepseek-v4-flash-vision/overview)。

## 关思考的两种写法

```json theme={null}
{ "thinking": { "type": "disabled" } }
```

```json theme={null}
{ "reasoning_effort": "none" }
```

两种都实测可靠（各 3 次，`prompt_tokens` 从 303 降到 223，`reasoning_content` 消失）。
`reasoning: {"effort": "none"}` 与 `enable_thinking: false` **都无效**。

<Warning>
  **`max_tokens` 给小了会返回空 `content`**。开着思考时，一句话问题也可能先输出几百 tokens
  的思考内容，配额用尽就是 `finish_reason: "length"` 加空字符串 —— 很容易误判成模型没回答。
  开思考建议 2000 以上，或者干脆关掉。
</Warning>

## 需要结构化输出？用 tools

`response_format: {"type": "json_schema"}` 会返回
`This response_format type is unavailable now`（上游模型侧限制）。
`json_object` 可用，但不约束字段；要强约束请用 Function Call：

```json theme={null}
{
  "model": "deepseek-v4-flash-vision-exp",
  "messages": [{
    "role": "user",
    "content": [
      {"type": "text", "text": "看图，调用 record_shape。"},
      {"type": "image_url", "image_url": {"url": "https://example.com/shape.jpg"}}
    ]
  }],
  "tools": [{
    "type": "function",
    "function": {
      "name": "record_shape",
      "parameters": {
        "type": "object",
        "properties": {
          "shape": {"type": "string"},
          "color": {"type": "string"}
        },
        "required": ["shape", "color"]
      }
    }
  }]
}
```

流式下工具参数也会正确增量拼装。

## 常见报错

| 报错                                                      | 原因                                      |
| ------------------------------------------------------- | --------------------------------------- |
| `You have uploaded an unsupported image`                | 格式不在 JPEG/PNG/GIF/WebP 之列，或 base64 数据损坏 |
| `Failed to download image`                              | 外链不通或超过 60 秒                            |
| `image file size exceeds limit 32 MB`                   | 单图超过 32 MiB                             |
| `external link length … too long, max link length 8192` | 外链超长                                    |
| `Image in assistant message is unsupported`             | 图片只能放在 `user` 消息里                       |
| `valid range of max_tokens is [1, 393216]`              | `max_tokens` 超上限                        |
| `invalid file_id`                                       | 用了 `file_id`，本平台不提供 Files API           |


## OpenAPI

````yaml api-reference/deepseek-v4-flash-vision-chat-openapi.yaml POST /v1/chat/completions
openapi: 3.1.0
info:
  title: DeepSeek V4 Flash Vision Chat Completions API
  description: >
    DeepSeek V4 Flash Vision（`deepseek-v4-flash-vision-exp`）—— OpenAI 兼容 Chat
    Completions 端点，支持图片输入。


    - **令牌必须是 `default` 分组**：`ClaudeCode` 分组下 `detail`、思考开关、`logprobs` 都会失效

    - **三种传图方式**：`image_url` 传 base64 data URL、`image_url` 传公网外链、`file` 块传
    `file_data`

    - **图片按尺寸折成输入 tokens**：单图上限 384，大图自动缩到约 800×800 等效，预压缩不省钱

    - **`detail: "low"` 省 60% tokens**：1600×1200 从 354 降到 142，只在 `image_url`
    块上生效

    - **默认开启深度思考**：纯识图任务建议传 `thinking: {"type": "disabled"}`，省 80 输入 tokens 且更快

    - **不支持 `json_schema`**：`response_format` 只支持 `json_object`，需要强约束请用 Function
    Call


    **认证方式**：在请求头中添加 `Authorization: Bearer YOUR_API_KEY`


    **获取 API Key**：访问 API易控制台 `api.apiyi.com/token` 创建令牌，分组选 `default`
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: 主要端点
  - url: https://vip.apiyi.com
    description: 备用端点
security:
  - bearerAuth: []
paths:
  /v1/chat/completions:
    post:
      tags:
        - 多模态理解
      summary: 'Chat completion with vision: DeepSeek V4 Flash Vision'
      description: >
        使用 `deepseek-v4-flash-vision-exp` 进行含图片的对话补全，OpenAI 格式完全兼容。


        - 示例用的是公网外链图片，直接点发送即可看到结果；换成本地图片请把 `url` 改成
        `data:image/jpeg;base64,<BASE64>`

        - 示例默认关闭思考以便快速调试；需要复杂推理时改成 `enabled` 并把 `max_tokens` 提到 2000 以上

        - 图片只能放在 `user` 消息里，放进 `assistant` 会报 `Image in assistant message is
        unsupported`

        - 支持的图片格式：JPEG、PNG、GIF、WebP（按文件内容判断，不看声明的 MIME）
      operationId: createDeepSeekV4FlashVisionChatCompletion
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DeepSeekV4FlashVisionChatRequest'
            example:
              model: deepseek-v4-flash-vision-exp
              messages:
                - role: user
                  content:
                    - type: text
                      text: 这张图里有什么？用一句话描述。
                    - type: image_url
                      image_url:
                        url: https://docs.apiyi.com/images/checks-passed.png
                        detail: original
              max_tokens: 800
              thinking:
                type: disabled
      responses:
        '200':
          description: 对话补全成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DeepSeekV4FlashVisionChatResponse'
              example:
                id: 35a4e262-f2b8-4eb7-bdb2-012b02c7012d
                object: chat.completion
                model: deepseek-v4-flash-vision-exp
                choices:
                  - index: 0
                    message:
                      role: assistant
                      content: 图中显示一条提示：所有检查均已通过，其中包含一次成功的 Mintlify 部署。
                    finish_reason: stop
                usage:
                  prompt_tokens: 295
                  completion_tokens: 49
                  total_tokens: 344
                  prompt_cache_hit_tokens: 0
                  prompt_cache_miss_tokens: 295
        '400':
          description: |
            参数非法。常见：
            图片格式不支持（`You have uploaded an unsupported image`）、
            外链下载失败（`Failed to download image`）、
            单图超过 32 MiB（`image file size exceeds limit 32 MB`）、
            外链超过 8192 字符、
            `max_tokens` 超过 393,216、
            `detail` 填了 low/high/original/auto 之外的值
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: 未授权 - API Key 无效
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '429':
          description: 请求频率超限或余额不足
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '503':
          description: 模型名错误或分组无可用渠道
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
      security:
        - bearerAuth: []
components:
  schemas:
    DeepSeekV4FlashVisionChatRequest:
      type: object
      required:
        - model
        - messages
      properties:
        model:
          type: string
          description: 模型 ID，固定 deepseek-v4-flash-vision-exp
          enum:
            - deepseek-v4-flash-vision-exp
          default: deepseek-v4-flash-vision-exp
        messages:
          type: array
          description: 对话消息数组。content 可以是字符串（纯文本），也可以是内容块数组（图文混合）
          items:
            $ref: '#/components/schemas/VisionMessage'
        max_tokens:
          type: integer
          description: 最大输出 tokens，硬上限 393,216。开启思考时思考内容也计入，开思考建议 2000 以上，否则可能返回空 content
          default: 800
          maximum: 393216
        thinking:
          type: object
          description: >-
            深度思考开关。传 {"type": "disabled"} 可关闭，省 80 输入 tokens 与全部思考输出。仅 default
            分组生效
          properties:
            type:
              type: string
              enum:
                - enabled
                - disabled
                - auto
              default: disabled
        reasoning_effort:
          type: string
          description: 思考深度分档。实测 none 可确定性关闭思考；low/high/max 之间未观察到稳定差异。仅 default 分组生效
          enum:
            - none
            - low
            - medium
            - high
            - max
        stream:
          type: boolean
          description: 是否流式输出（SSE）。配合 stream_options.include_usage 可在末尾获取用量
          default: false
        response_format:
          type: object
          description: >-
            输出格式。只支持 {"type": "json_object"}；json_schema 会报 This response_format
            type is unavailable now
          properties:
            type:
              type: string
              enum:
                - text
                - json_object
        temperature:
          type: number
          description: 采样温度
        top_p:
          type: number
          description: 核采样阈值
        stop:
          type: array
          description: 停止词
          items:
            type: string
        seed:
          type: integer
          description: 随机种子
        logprobs:
          type: boolean
          description: 是否返回 token 对数概率，实测有内容返回（仅 default 分组）
        top_logprobs:
          type: integer
          description: 每个位置返回的候选数，取值范围 0-20
          minimum: 0
          maximum: 20
        tools:
          type: array
          description: Function Call 工具列表，OpenAI 标准格式。需要结构化输出时用它替代 json_schema
          items:
            type: object
    DeepSeekV4FlashVisionChatResponse:
      type: object
      properties:
        id:
          type: string
          description: 请求 ID
        object:
          type: string
        model:
          type: string
        choices:
          type: array
          description: 补全结果。message 中除 content 外，开启思考时还有 reasoning_content 字段
          items:
            type: object
        usage:
          $ref: '#/components/schemas/VisionUsage'
    ErrorResponse:
      type: object
      properties:
        error:
          type: object
          properties:
            message:
              type: string
              description: 上游 DeepSeek 的原始错误消息
            type:
              type: string
            code:
              type: string
    VisionMessage:
      type: object
      required:
        - role
        - content
      properties:
        role:
          type: string
          description: 消息角色。图片内容块只能出现在 user 消息里
          enum:
            - system
            - user
            - assistant
            - tool
        content:
          description: 字符串或内容块数组
          oneOf:
            - type: string
              description: 纯文本消息
            - type: array
              description: 图文混合内容块
              items:
                $ref: '#/components/schemas/VisionContentPart'
    VisionUsage:
      type: object
      description: 用量。图片折算出的 tokens 计入 prompt_tokens
      properties:
        prompt_tokens:
          type: integer
          description: 输入 tokens 总量（文本 + 图片折算）
        completion_tokens:
          type: integer
        total_tokens:
          type: integer
        prompt_cache_hit_tokens:
          type: integer
          description: 缓存命中量。命中范围止于第一张图片之前，图片本身永不进缓存
        prompt_cache_miss_tokens:
          type: integer
    VisionContentPart:
      type: object
      description: >-
        内容块。type 决定用哪些字段：text 用 text；image_url 用 image_url；file 用 file_data +
        filename
      required:
        - type
      properties:
        type:
          type: string
          enum:
            - text
            - image_url
            - file
        text:
          type: string
          description: type 为 text 时的文本内容
        image_url:
          $ref: '#/components/schemas/VisionImageUrl'
        file_data:
          type: string
          description: >-
            type 为 file 时的 base64 data URL，等价于 image_url 通道。注意 file 块上的 detail
            会被静默忽略
        filename:
          type: string
          description: type 为 file 时的文件名，仅用于标识
    VisionImageUrl:
      type: object
      required:
        - url
      properties:
        url:
          type: string
          description: >-
            公网 http(s) 链接（最长 8192 字符，需 60 秒内下载完成），或 data:image/jpeg;base64,...
            形式的 base64 data URL（单图最大 32 MiB）
          examples:
            - https://docs.apiyi.com/images/checks-passed.png
            - data:image/jpeg;base64,<BASE64_DATA>
        detail:
          type: string
          description: >-
            图片处理精度。low 先缩到 512x512 再推理，1600x1200 的图从 354 tokens 降到
            142；high/original/auto 保持原图。仅 default 分组、且仅 image_url 块上生效
          enum:
            - low
            - high
            - original
            - auto
          default: original
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key，分组需为 default

````