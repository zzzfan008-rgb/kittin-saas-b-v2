> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash Vision Messages API 參考

> deepseek-v4-flash-vision-exp 的 Anthropic 原生 /v1/messages API 參考與線上除錯：base64 與外鏈兩種傳圖方式、思考開關、工具閉環，令牌必須用 ClaudeCode 分組。

<Warning>
  **這個端點的令牌必須是 `ClaudeCode` 分組，這是硬要求。**

  用 `default` 分組會撞上兩個疊加問題：

  1. 不顯式傳 `top_p` 一律返回 400 `Invalid top_p value`
  2. 就算補上 `top_p`，把第一輪返回的 `thinking` 塊原樣回傳到第二輪會報
     `unknown variant 'thinking', expected one of 'text', 'image_url', 'file'`
     —— 而 Claude Code、Anthropic SDK 這類標準客戶端一定會原樣回傳，所以**多輪必斷**

  換成 `ClaudeCode` 分組，兩個問題都不存在。OpenAI 格式請改用
  [Chat 線上除錯](/zh-Hant/api-capabilities/deepseek-v4-flash-vision/chat-completions)。
</Warning>

<Info>
  右側 Playground 可直接除錯：在 **x-api-key** 填 `sk-your-apiyi-key`（`ClaudeCode` 分組的令牌，
  不帶 `Bearer ` 字首），`anthropic-version` 保持 `2023-06-01`。
  預設示例用的是一張公網圖片、並已關閉深度思考，點擊發送即可看到響應。
</Info>

## 引數說明速查

| 引數                                         | 型別     | 必填 | 預設        | 說明                                       |
| ------------------------------------------ | ------ | -- | --------- | ---------------------------------------- |
| `model`                                    | string | ✓  | —         | 固定 `deepseek-v4-flash-vision-exp`        |
| `max_tokens`                               | int    | ✓  | —         | Anthropic 格式下必填，硬上限 393,216；開思考建議 2000+  |
| `messages`                                 | array  | ✓  | —         | `content` 可以是字串，也可以是內容塊陣列                |
| `system`                                   | string |    | —         | 系統提示詞                                    |
| `thinking.type`                            | string |    | `enabled` | `disabled` 可關閉，關掉後 `content` 只剩 `text` 塊 |
| `thinking.budget_tokens`                   | int    |    | —         | `enabled` 時的思考預算                         |
| `stream`                                   | bool   |    | `false`   | SSE 流式，標準 Anthropic 事件序列                 |
| `top_p`                                    | number |    | —         | `ClaudeCode` 分組下可省略                      |
| `temperature` / `top_k` / `stop_sequences` | —      |    | —         | 均生效                                      |
| `tools`                                    | array  |    | —         | Anthropic 標準 `input_schema` 格式           |

## 兩種傳圖方式

### `source.type = "base64"`

```json theme={null}
{
  "type": "image",
  "source": {
    "type": "base64",
    "media_type": "image/jpeg",
    "data": "<BASE64>"
  }
}
```

注意 `data` **不含** `data:image/jpeg;base64,` 字首（這一點和 OpenAI 格式不同）。

### `source.type = "url"`

```json theme={null}
{
  "type": "image",
  "source": {"type": "url", "url": "https://example.com/image.jpg"}
}
```

<Note>
  `source.type = "url"` **只有 `ClaudeCode` 分組支援**，`default` 分組會報
  `You have uploaded an unsupported image`。

  `source.type = "file"` 需要 Files API，本平臺不提供。
</Note>

## 響應的 content 是塊陣列

| 情況                           | `content`                                                |
| ---------------------------- | -------------------------------------------------------- |
| 預設（思考開啟）                     | `[{"type": "thinking", ...}, {"type": "text", ...}]`     |
| `thinking.type = "disabled"` | `[{"type": "text", ...}]`                                |
| 呼叫工具時                        | `[{"type": "thinking", ...}, {"type": "tool_use", ...}]` |

`ClaudeCode` 分組返回的 `thinking` 塊帶 `signature` 欄位，流式下也有 `signature_delta`。

## 多輪與工具閉環

把上一輪 assistant 的整個 `content`（**含 `thinking` 塊，不要剝**）原樣放回 `messages`，
再追加 `tool_result` 即可：

```json theme={null}
{
  "model": "deepseek-v4-flash-vision-exp",
  "max_tokens": 1500,
  "tools": [{
    "name": "record_shape",
    "input_schema": {
      "type": "object",
      "properties": {
        "shape": {"type": "string"},
        "color": {"type": "string"}
      },
      "required": ["shape", "color"]
    }
  }],
  "messages": [
    {"role": "user", "content": [
      {"type": "text", "text": "看圖，呼叫 record_shape。"},
      {"type": "image", "source": {"type": "url", "url": "https://example.com/shape.jpg"}}
    ]},
    {"role": "assistant", "content": "<上一輪返回的 content 陣列，原樣放這裡>"},
    {"role": "user", "content": [
      {"type": "tool_result", "tool_use_id": "<上一輪 tool_use 的 id>", "content": "{\"ok\":true}"}
    ]}
  ]
}
```

實測第二輪正常返回。**這一步正是 `default` 分組會 400 的地方**，也是 Claude Code 等客戶端
的必經路徑 —— 所以分組不能選錯。

## 快取欄位的口徑

自動字首快取生效，對映到 Anthropic 標準欄位：

| 欄位                            | 行為                                                           |
| ----------------------------- | ------------------------------------------------------------ |
| `cache_read_input_tokens`     | 自動字首快取命中量。命中範圍止於第一張圖片之前，**圖片本身永不進快取**                        |
| `cache_creation_input_tokens` | **恆為 0**。上游用的是自動字首快取，`cache_control` 顯式標記不生效                 |
| `input_tokens`                | 命中後**只剩未命中部分**，與 OpenAI 格式的 `prompt_tokens`（始終全量）口徑不同，不能直接對賬 |

含圖請求第 3 次呼叫才開始命中（純文本第 2 次）。把固定的長指令放在圖片**前面**才能進快取。

## 常見報錯

| 報錯                                                          | 原因                                                 |
| ----------------------------------------------------------- | -------------------------------------------------- |
| `Invalid top_p value, the valid range of top_p is (0, 1.0]` | 用了 `default` 分組且沒傳 `top_p`，換 `ClaudeCode` 分組       |
| `unknown variant 'thinking'`                                | 用了 `default` 分組且回傳了 `thinking` 塊，換 `ClaudeCode` 分組 |
| `You have uploaded an unsupported image`                    | 格式不支援，或用了 `default` 分組 + `source.type = "url"`     |
| `Image in assistant message is unsupported`                 | 圖片只能放在 `user` 訊息裡                                  |
| `image file size exceeds limit 32 MB`                       | 單圖超過 32 MiB                                        |


## OpenAPI

````yaml api-reference/deepseek-v4-flash-vision-messages-openapi.yaml POST /v1/messages
openapi: 3.1.0
info:
  title: DeepSeek V4 Flash Vision Messages API
  description: >
    DeepSeek V4 Flash Vision（`deepseek-v4-flash-vision-exp`）—— Anthropic 原生
    `/v1/messages` 端点，支持图片输入。


    - **令牌必须是 `ClaudeCode` 分组**：这条是硬要求，不是建议

    - **别用 `default` 分组调这个端点**：不传 `top_p` 一律 400；就算补上 `top_p`，把第一轮返回的
      `thinking` 块原样回传到第二轮会报 `unknown variant 'thinking'` —— 而 Claude Code、
      Anthropic SDK 这类标准客户端一定会原样回传，所以多轮必断
    - **两种传图方式**：`source.type` 为 `base64` 或 `url`（`file` 需要 Files API，平台未提供）

    - **图片按尺寸折成输入 tokens**：单图上限 384，大图自动缩到约 800×800 等效

    - **`detail` 在本端点不生效**，需要省 tokens 请改用 OpenAI 格式端点

    - **默认开启深度思考**：纯识图任务传 `thinking: {"type": "disabled"}`，本端点两个分组都生效


    **认证方式**：在请求头中添加 `x-api-key: YOUR_API_KEY` 与 `anthropic-version: 2023-06-01`


    **获取 API Key**：访问 API易控制台 `api.apiyi.com/token` 创建令牌，分组选 `ClaudeCode`
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: 主要端点
  - url: https://vip.apiyi.com
    description: 备用端点
security:
  - anthropicKey: []
paths:
  /v1/messages:
    post:
      tags:
        - 多模态理解
      summary: 'Messages with vision: DeepSeek V4 Flash Vision (Anthropic format)'
      description: |
        使用 `deepseek-v4-flash-vision-exp` 进行含图片的对话，Anthropic 原生格式完全兼容。

        - 示例用的是公网外链图片，直接点发送即可看到结果；本地图片改用
          `{"type": "base64", "media_type": "image/jpeg", "data": "<BASE64>"}`
        - 响应的 `content` 是块数组：开启思考时是 `[thinking, text]`，关闭后只剩 `[text]`
        - 工具调用完整可用：`thinking`（含 `signature`）+ `tool_use` 原样回传再带 `tool_result`，
          第二轮实测正常
        - 图片只能放在 `user` 消息里
      operationId: createDeepSeekV4FlashVisionMessage
      parameters:
        - name: anthropic-version
          in: header
          required: true
          description: Anthropic API 版本号，固定 2023-06-01
          schema:
            type: string
            default: '2023-06-01'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/VisionMessagesRequest'
            example:
              model: deepseek-v4-flash-vision-exp
              max_tokens: 800
              thinking:
                type: disabled
              messages:
                - role: user
                  content:
                    - type: text
                      text: 这张图里有什么？用一句话描述。
                    - type: image
                      source:
                        type: url
                        url: https://docs.apiyi.com/images/checks-passed.png
      responses:
        '200':
          description: 生成成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/VisionMessagesResponse'
              example:
                id: a5cb230d-ac08-43ed-8c4b-8f88b37119d3
                type: message
                role: assistant
                model: deepseek-v4-flash-vision-exp
                content:
                  - type: text
                    text: 图中显示一条提示：所有检查均已通过，其中包含一次成功的 Mintlify 部署。
                stop_reason: end_turn
                usage:
                  input_tokens: 295
                  output_tokens: 51
                  cache_creation_input_tokens: 0
                  cache_read_input_tokens: 0
        '400':
          description: |
            参数非法。常见：
            用了 `default` 分组且没传 `top_p`（`Invalid top_p value`）、
            用了 `default` 分组且回传了 `thinking` 块（`unknown variant 'thinking'`）、
            图片格式不支持、
            图片放进了 assistant 消息（`Image in assistant message is unsupported`）
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
        - anthropicKey: []
components:
  schemas:
    VisionMessagesRequest:
      type: object
      required:
        - model
        - max_tokens
        - messages
      properties:
        model:
          type: string
          description: 模型 ID，固定 deepseek-v4-flash-vision-exp
          enum:
            - deepseek-v4-flash-vision-exp
          default: deepseek-v4-flash-vision-exp
        max_tokens:
          type: integer
          description: 最大输出 tokens（Anthropic 格式下必填），硬上限 393,216。开思考建议 2000 以上
          default: 800
          maximum: 393216
        messages:
          type: array
          description: 消息数组。content 可以是字符串，也可以是内容块数组（图文混合）
          items:
            $ref: '#/components/schemas/AnthropicMessage'
        system:
          type: string
          description: 系统提示词
        thinking:
          type: object
          description: '深度思考开关。传 {"type": "disabled"} 关闭后 content 只剩 text 块，本端点两个分组都生效'
          properties:
            type:
              type: string
              enum:
                - enabled
                - disabled
              default: disabled
            budget_tokens:
              type: integer
              description: type 为 enabled 时的思考预算
        stream:
          type: boolean
          description: >-
            是否流式输出（SSE）。事件为 Anthropic 标准的 message_start / content_block_delta /
            message_stop 等
          default: false
        temperature:
          type: number
          description: 采样温度
        top_p:
          type: number
          description: 核采样阈值。ClaudeCode 分组下可省略；default 分组下不传必返回 400
        top_k:
          type: integer
          description: 候选截断
        stop_sequences:
          type: array
          description: 停止序列
          items:
            type: string
        tools:
          type: array
          description: 工具列表，Anthropic 标准 input_schema 格式。实测含流式增量拼装与完整两轮闭环
          items:
            type: object
    VisionMessagesResponse:
      type: object
      properties:
        id:
          type: string
        type:
          type: string
        role:
          type: string
        model:
          type: string
        content:
          type: array
          description: >-
            内容块数组。开启思考时为 [thinking, text]，关闭后只剩 [text]；调用工具时为 [thinking,
            tool_use]
          items:
            type: object
        stop_reason:
          type: string
        usage:
          $ref: '#/components/schemas/AnthropicUsage'
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
    AnthropicMessage:
      type: object
      required:
        - role
        - content
      properties:
        role:
          type: string
          description: 消息角色。图片内容块只能出现在 user 消息里
          enum:
            - user
            - assistant
        content:
          description: 字符串或内容块数组
          oneOf:
            - type: string
              description: 纯文本消息
            - type: array
              description: 内容块数组
              items:
                $ref: '#/components/schemas/AnthropicContentBlock'
    AnthropicUsage:
      type: object
      description: 用量。注意与 OpenAI 格式口径不同：命中缓存后 input_tokens 只剩未命中部分，不能与 prompt_tokens 直接对账
      properties:
        input_tokens:
          type: integer
        output_tokens:
          type: integer
        cache_creation_input_tokens:
          type: integer
          description: 恒为 0。上游用的是自动前缀缓存，不接受 cache_control 显式标记
        cache_read_input_tokens:
          type: integer
          description: 自动前缀缓存命中量。命中范围止于第一张图片之前，图片本身永不进缓存
    AnthropicContentBlock:
      type: object
      description: 内容块。type 为 text 时用 text 字段；为 image 时用 source 字段
      required:
        - type
      properties:
        type:
          type: string
          enum:
            - text
            - image
            - tool_use
            - tool_result
            - thinking
        text:
          type: string
          description: type 为 text 时的文本内容
        source:
          $ref: '#/components/schemas/AnthropicImageSource'
    AnthropicImageSource:
      type: object
      description: 图片来源。base64 与 url 二选一
      required:
        - type
      properties:
        type:
          type: string
          description: base64 为内联图片；url 为公网外链（仅 ClaudeCode 分组支持）；file 需要 Files API，本平台未提供
          enum:
            - base64
            - url
        media_type:
          type: string
          description: type 为 base64 时的媒体类型
          enum:
            - image/jpeg
            - image/png
            - image/gif
            - image/webp
        data:
          type: string
          description: 'type 为 base64 时的图片数据（不含 data: 前缀），单图最大 32 MiB'
        url:
          type: string
          description: type 为 url 时的公网图片链接，最长 8192 字符
          examples:
            - https://docs.apiyi.com/images/checks-passed.png
  securitySchemes:
    anthropicKey:
      type: apiKey
      in: header
      name: x-api-key
      description: API易令牌，直接填 sk- 开头的 Key。分组必须为 ClaudeCode

````