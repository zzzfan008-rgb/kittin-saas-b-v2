> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash Vision Chat API 參考

> deepseek-v4-flash-vision-exp 的 OpenAI 相容 Chat Completions API 參考與線上除錯：三種傳圖方式、detail 省 token、思考開關，令牌需用 default 分組。

<Warning>
  **除錯前先確認令牌分組是 `default`。**

  `ClaudeCode` 分組的令牌調這個端點雖然也返回 200，但 `detail`、思考開關、`logprobs`
  三個引數全部失效，響應裡還會缺 `completion_tokens_details` 欄位 —— 看起來像引數寫錯了，
  實際是分組不對。Anthropic 格式請改用
  [Messages 線上除錯](/zh-Hant/api-capabilities/deepseek-v4-flash-vision/messages)。
</Warning>

<Info>
  右側 Playground 可直接除錯：在 **Authorization** 填 `Bearer sk-your-api-key`，
  預設示例用的是一張公網圖片、並已關閉深度思考，點擊發送即可看到響應。
  換成本地圖片時把 `image_url.url` 改成 `data:image/jpeg;base64,<BASE64>`。
</Info>

## 引數說明速查

| 引數                                        | 型別     | 必填 | 預設        | 說明                                            |
| ----------------------------------------- | ------ | -- | --------- | --------------------------------------------- |
| `model`                                   | string | ✓  | —         | 固定 `deepseek-v4-flash-vision-exp`             |
| `messages`                                | array  | ✓  | —         | `content` 可以是字串，也可以是內容塊陣列（圖文混合）               |
| `max_tokens`                              | int    |    | —         | 輸出配額，硬上限 393,216；**開思考時建議 2000+**             |
| `thinking.type`                           | string |    | `enabled` | `disabled` 可靠關閉思考，省 80 輸入 tokens              |
| `reasoning_effort`                        | string |    | —         | `none` 等效於關閉思考；low/high/max 之間無穩定差異           |
| `response_format`                         | object |    | —         | 只支援 `json_object`；`json_schema` 會報錯           |
| `stream`                                  | bool   |    | `false`   | SSE 流式，配合 `stream_options.include_usage` 回傳用量 |
| `temperature` / `top_p` / `stop` / `seed` | —      |    | —         | 均生效                                           |
| `logprobs` / `top_logprobs`               | —      |    | —         | 生效，`top_logprobs` 範圍 0–20                     |
| `tools`                                   | array  |    | —         | Function Call，需要結構化輸出時用它替代 `json_schema`      |

## 三種傳圖方式

### `image_url` + base64 data URL

```json theme={null}
{
  "type": "image_url",
  "image_url": {"url": "data:image/jpeg;base64,<BASE64>", "detail": "original"}
}
```

### `image_url` + 公網外鏈

```json theme={null}
{
  "type": "image_url",
  "image_url": {"url": "https://example.com/image.jpg", "detail": "low"}
}
```

外鏈最長 8192 字元，需 60 秒內下載完成。

### `file` 塊 + `file_data`

```json theme={null}
{
  "type": "file",
  "file_data": "data:image/jpeg;base64,<BASE64>",
  "filename": "image.jpg"
}
```

與 `image_url` 通道折出的 tokens 完全一致（同一張圖都是 303）。

<Warning>
  **`file` 塊上的 `detail` 會被靜默忽略** —— 不報錯，但也不省 token。
  要用 `detail: "low"` 省錢，必須走 `image_url` 通道。

  另外 **`file_id`（Files API）在本平臺不可用**，傳了會報 `invalid file_id`。
</Warning>

## `detail` 能省多少

同一張 1600×1200 的圖，四個檔位實測：

| `detail`   | 影像 token | 相對 `original` |
| ---------- | -------- | ------------- |
| `low`      | 142      | **省 60%**     |
| `high`     | 354      | 持平            |
| `original` | 354      | 基準            |
| `auto`     | 354      | 持平            |

判斷圖片型別、認主體、粗分類這類任務用 `low` 就夠；要讀小字、認圖表數值才需要 `original`。

填了列舉外的值會明確報錯：
`unknown variant 'ultra', expected one of 'low', 'high', 'original', 'auto'`。

## 圖片怎麼折成 token

| 圖片尺寸      | 折算 tokens |
| --------- | --------- |
| 64×64     | 114       |
| 384×384   | 114       |
| 800×800   | 346       |
| 2000×2000 | 346       |
| 4000×4000 | 346       |
| 1600×400  | 266       |
| 1600×1200 | 354       |

單圖上限 384，多圖各自獨立計數、線性疊加。**上傳前預壓縮只省頻寬、不省 token** ——
2000² 與 4000² 折出來完全一樣。完整規律見
[概覽](/zh-Hant/api-capabilities/deepseek-v4-flash-vision/overview)。

## 關思考的兩種寫法

```json theme={null}
{ "thinking": { "type": "disabled" } }
```

```json theme={null}
{ "reasoning_effort": "none" }
```

兩種都實測可靠（各 3 次，`prompt_tokens` 從 303 降到 223，`reasoning_content` 消失）。
`reasoning: {"effort": "none"}` 與 `enable_thinking: false` **都無效**。

<Warning>
  **`max_tokens` 給小了會返回空 `content`**。開著思考時，一句話問題也可能先輸出幾百 tokens
  的思考內容，配額用盡就是 `finish_reason: "length"` 加空字串 —— 很容易誤判成模型沒回答。
  開思考建議 2000 以上，或者乾脆關掉。
</Warning>

## 需要結構化輸出？用 tools

`response_format: {"type": "json_schema"}` 會返回
`This response_format type is unavailable now`（上游模型側限制）。
`json_object` 可用，但不約束欄位；要強約束請用 Function Call：

```json theme={null}
{
  "model": "deepseek-v4-flash-vision-exp",
  "messages": [{
    "role": "user",
    "content": [
      {"type": "text", "text": "看圖，呼叫 record_shape。"},
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

流式下工具引數也會正確增量拼裝。

## 常見報錯

| 報錯                                                      | 原因                                      |
| ------------------------------------------------------- | --------------------------------------- |
| `You have uploaded an unsupported image`                | 格式不在 JPEG/PNG/GIF/WebP 之列，或 base64 資料損壞 |
| `Failed to download image`                              | 外鏈不通或超過 60 秒                            |
| `image file size exceeds limit 32 MB`                   | 單圖超過 32 MiB                             |
| `external link length … too long, max link length 8192` | 外鏈超長                                    |
| `Image in assistant message is unsupported`             | 圖片只能放在 `user` 訊息裡                       |
| `valid range of max_tokens is [1, 393216]`              | `max_tokens` 超上限                        |
| `invalid file_id`                                       | 用了 `file_id`，本平臺不提供 Files API           |


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