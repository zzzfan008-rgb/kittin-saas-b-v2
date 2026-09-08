> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash Chat API 參考

> DeepSeek V4 Flash 正式版（deepseek-v4-flash-ga-260731）Chat Completions API 參考與線上除錯：OpenAI 相容格式，1M 上下文，支援思考開關與隱式快取。

<Info>
  右側 Playground 可直接除錯：在 **Authorization** 填 `Bearer sk-your-api-key`，
  預設示例已關閉深度思考（`thinking.disabled`），點擊發送即可快速看到響應。
</Info>

<Tip>
  該模型**預設思考量偏大**，一句話問題也會先輸出數百 tokens 思考內容。除錯建議保持示例中的
  `"thinking": {"type": "disabled"}`。模型能力、定價、快取機制詳見
  [DeepSeek V4 Flash 概覽](/zh-Hant/api-capabilities/deepseek-v4-flash/overview)。
</Tip>

<Warning>
  * 開啟思考時 `max_tokens` 要給足（思考內容計入輸出配額），建議 3000+
  * **`response_format` 不生效**：傳 `json_schema` 返回 200 但完全無視 schema，需要結構化輸出請用 `tools`
  * **`n` 引數靜默忽略**：傳 `n=2` 返回 200，但 `choices` 裡恆為 1 個元素
  * 純文本模型，傳圖片內容塊會報 `Model do not support image input`
</Warning>

## 引數說明速查

| 引數                      | 型別     | 必填 | 預設        | 說明                                                                |
| ----------------------- | ------ | -- | --------- | ----------------------------------------------------------------- |
| `model`                 | string | ✓  | —         | 固定 `deepseek-v4-flash-ga-260731`                                  |
| `messages`              | array  | ✓  | —         | OpenAI 標準訊息陣列，純文本                                                 |
| `max_tokens`            | int    |    | —         | 輸出配額，硬上限 393,216；開思考時建議 3000+                                     |
| `thinking.type`         | string |    | `enabled` | `disabled` 可靠關閉思考；另有 `auto`                                       |
| `reasoning_effort`      | string |    | —         | 僅 `minimal` 確定性生效（思考 tokens 恆為 0）；low/medium/high/max **非單調**，見概覽 |
| `stream`                | bool   |    | `false`   | SSE 流式，配合 `stream_options.include_usage` 回傳用量                     |
| `temperature` / `top_p` | number |    | —         | 取樣引數，均生效                                                          |
| `stop`                  | array  |    | —         | 停止詞，實測真實截斷                                                        |
| `seed` / `logprobs`     | —      |    | —         | 均生效                                                               |
| `tools`                 | array  |    | —         | Function Call，**工具引數是真正被約束的**                                     |

## 上下文與輸出上限

| 專案              | 硬上限              | 觸發的報錯                                                     |
| --------------- | ---------------- | --------------------------------------------------------- |
| 輸入              | 1,048,570 tokens | `Input length ... exceeds the maximum length 1048570`     |
| 輸出 `max_tokens` | 393,216          | `integer above maximum value, expected a value <= 393216` |

實測 322,055 tokens 的輸入 14.77 秒返回，並準確撈出埋在中段的資訊。

## 隱式快取

無需任何引數，相同長字首第 2 次請求即命中：

| 輪次 | prompt\_tokens | cached\_tokens | 命中率   |
| -- | -------------- | -------------- | ----- |
| 1  | 15,634         | 0              | —     |
| 2  | 15,634         | 15,616         | 99.9% |
| 3  | 15,634         | 15,616         | 99.9% |

命中部分按 \$0.028 / 百萬 tokens 計費。把時間戳、隨機 ID 等變動內容放到 prompt 末尾，
不要混進字首，否則命中率歸零。

## 需要結構化輸出？用 tools

```json theme={null}
{
  "model": "deepseek-v4-flash-ga-260731",
  "messages": [{"role": "user", "content": "北京今天 25 度"}],
  "tools": [{
    "type": "function",
    "function": {
      "name": "submit_result",
      "parameters": {
        "type": "object",
        "properties": {
          "city": {"type": "string"},
          "temp_c": {"type": "number"}
        },
        "required": ["city", "temp_c"]
      }
    }
  }]
}
```

從 `choices[0].message.tool_calls[0].function.arguments` 取 JSON 字串，可直接解析。


## OpenAPI

````yaml api-reference/deepseek-v4-flash-chat-openapi.yaml POST /v1/chat/completions
openapi: 3.1.0
info:
  title: DeepSeek V4 Flash Chat Completions API
  description: >
    DeepSeek V4 Flash 正式版（`deepseek-v4-flash-ga-260731`）—— OpenAI 兼容 Chat
    Completions 端点。


    - **1M 上下文**：输入硬上限 1,048,570 tokens，最大输出 393,216 tokens

    - **默认思考量偏大**：简单任务请传 `thinking: {"type": "disabled"}` 或 `reasoning_effort:
    "minimal"`

    - **隐式缓存自动生效**：相同长前缀第 2 次请求即命中，实测命中率 99.9%

    - **不支持结构化输出**：`response_format` 收参但不约束 schema，需要强约束请用 Function Call

    - **纯文本模型**：不支持图片输入


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
  /v1/chat/completions:
    post:
      tags:
        - 文本生成
      summary: 对话补全：DeepSeek V4 Flash 文本生成
      description: |
        使用 `deepseek-v4-flash-ga-260731` 进行对话补全，OpenAI 格式完全兼容。

        - 开启思考时响应中带 `reasoning_content` 字段，思考内容计入 `max_tokens` 配额
        - 示例默认关闭思考以便快速调试；复杂推理任务请改为 `enabled`
        - `n` 参数传了不生效（恒返回 1 个 choice）
      operationId: createDeepSeekV4FlashChatCompletion
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DeepSeekV4FlashChatRequest'
            example:
              model: deepseek-v4-flash-ga-260731
              messages:
                - role: user
                  content: 用一句话介绍你自己
              max_tokens: 500
              thinking:
                type: disabled
      responses:
        '200':
          description: 对话补全成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DeepSeekV4FlashChatResponse'
        '400':
          description: 参数非法。常见：输入超过 1,048,570 tokens、max_tokens 超过 393,216、传入图片内容
        '401':
          description: 未授权 - API Key 无效
        '429':
          description: 请求频率超限或余额不足
        '503':
          description: 模型名错误或分组无可用渠道
      security:
        - bearerAuth: []
components:
  schemas:
    DeepSeekV4FlashChatRequest:
      type: object
      required:
        - model
        - messages
      properties:
        model:
          type: string
          description: 模型 ID，固定 deepseek-v4-flash-ga-260731
          enum:
            - deepseek-v4-flash-ga-260731
          default: deepseek-v4-flash-ga-260731
        messages:
          type: array
          description: 对话消息数组，OpenAI 标准格式。纯文本，不支持图片内容块
          items:
            type: object
            required:
              - role
              - content
            properties:
              role:
                type: string
                description: 消息角色
                enum:
                  - system
                  - user
                  - assistant
                  - tool
              content:
                type: string
                description: 消息内容
        max_tokens:
          type: integer
          description: 最大输出 tokens，硬上限 393,216。开启思考时思考内容也计入，建议给足
          default: 500
          maximum: 393216
        thinking:
          type: object
          description: '深度思考开关。传 {"type": "disabled"} 可关闭，实测简单任务可省 200+ 思考 tokens'
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
          description: >-
            思考深度分档。实测仅 minimal 确定性生效（思考 tokens 恒为 0）；low/medium/high/max
            不构成单调阶梯，档内方差大于档间差异
          enum:
            - minimal
            - low
            - medium
            - high
            - max
        stream:
          type: boolean
          description: 是否流式输出（SSE）。配合 stream_options.include_usage 可在末尾获取用量
          default: false
        temperature:
          type: number
          description: 采样温度
        top_p:
          type: number
          description: 核采样阈值
        stop:
          type: array
          description: 停止词，实测真实截断生效
          items:
            type: string
        seed:
          type: integer
          description: 随机种子
        logprobs:
          type: boolean
          description: 是否返回 token 对数概率，实测有内容返回
        tools:
          type: array
          description: >-
            Function Call 工具列表，OpenAI 标准格式。工具参数是真正被约束的，需要结构化输出时用它替代
            response_format
          items:
            type: object
    DeepSeekV4FlashChatResponse:
      type: object
      properties:
        id:
          type: string
          description: 请求 ID
        model:
          type: string
        choices:
          type: array
          description: 补全结果。message 中除 content 外，开启思考时还有 reasoning_content 字段
          items:
            type: object
        usage:
          type: object
          description: >-
            用量。completion_tokens_details.reasoning_tokens
            为思考消耗；prompt_tokens_details.cached_tokens 为隐式缓存命中量
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key

````