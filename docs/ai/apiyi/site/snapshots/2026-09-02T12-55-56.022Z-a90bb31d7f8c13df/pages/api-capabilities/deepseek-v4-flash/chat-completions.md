> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash Chat API 参考

> DeepSeek V4 Flash 正式版（deepseek-v4-flash-ga-260731）Chat Completions API 参考与在线调试：OpenAI 兼容格式，1M 上下文，支持思考开关与隐式缓存。

<Info>
  右侧 Playground 可直接调试：在 **Authorization** 填 `Bearer sk-your-api-key`，
  默认示例已关闭深度思考（`thinking.disabled`），点击发送即可快速看到响应。
</Info>

<Tip>
  该模型**默认思考量偏大**，一句话问题也会先输出数百 tokens 思考内容。调试建议保持示例中的
  `"thinking": {"type": "disabled"}`。模型能力、定价、缓存机制详见
  [DeepSeek V4 Flash 概览](/api-capabilities/deepseek-v4-flash/overview)。
</Tip>

<Warning>
  * 开启思考时 `max_tokens` 要给足（思考内容计入输出配额），建议 3000+
  * **`response_format` 不生效**：传 `json_schema` 返回 200 但完全无视 schema，需要结构化输出请用 `tools`
  * **`n` 参数静默忽略**：传 `n=2` 返回 200，但 `choices` 里恒为 1 个元素
  * 纯文本模型，传图片内容块会报 `Model do not support image input`
</Warning>

## 参数说明速查

| 参数                      | 类型     | 必填 | 默认        | 说明                                                                |
| ----------------------- | ------ | -- | --------- | ----------------------------------------------------------------- |
| `model`                 | string | ✓  | —         | 固定 `deepseek-v4-flash-ga-260731`                                  |
| `messages`              | array  | ✓  | —         | OpenAI 标准消息数组，纯文本                                                 |
| `max_tokens`            | int    |    | —         | 输出配额，硬上限 393,216；开思考时建议 3000+                                     |
| `thinking.type`         | string |    | `enabled` | `disabled` 可靠关闭思考；另有 `auto`                                       |
| `reasoning_effort`      | string |    | —         | 仅 `minimal` 确定性生效（思考 tokens 恒为 0）；low/medium/high/max **非单调**，见概览 |
| `stream`                | bool   |    | `false`   | SSE 流式，配合 `stream_options.include_usage` 回传用量                     |
| `temperature` / `top_p` | number |    | —         | 采样参数，均生效                                                          |
| `stop`                  | array  |    | —         | 停止词，实测真实截断                                                        |
| `seed` / `logprobs`     | —      |    | —         | 均生效                                                               |
| `tools`                 | array  |    | —         | Function Call，**工具参数是真正被约束的**                                     |

## 上下文与输出上限

| 项目              | 硬上限              | 触发的报错                                                     |
| --------------- | ---------------- | --------------------------------------------------------- |
| 输入              | 1,048,570 tokens | `Input length ... exceeds the maximum length 1048570`     |
| 输出 `max_tokens` | 393,216          | `integer above maximum value, expected a value <= 393216` |

实测 322,055 tokens 的输入 14.77 秒返回，并准确捞出埋在中段的信息。

## 隐式缓存

无需任何参数，相同长前缀第 2 次请求即命中：

| 轮次 | prompt\_tokens | cached\_tokens | 命中率   |
| -- | -------------- | -------------- | ----- |
| 1  | 15,634         | 0              | —     |
| 2  | 15,634         | 15,616         | 99.9% |
| 3  | 15,634         | 15,616         | 99.9% |

命中部分按 \$0.028 / 百万 tokens 计费。把时间戳、随机 ID 等变动内容放到 prompt 末尾，
不要混进前缀，否则命中率归零。

## 需要结构化输出？用 tools

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

从 `choices[0].message.tool_calls[0].function.arguments` 取 JSON 字符串，可直接解析。


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