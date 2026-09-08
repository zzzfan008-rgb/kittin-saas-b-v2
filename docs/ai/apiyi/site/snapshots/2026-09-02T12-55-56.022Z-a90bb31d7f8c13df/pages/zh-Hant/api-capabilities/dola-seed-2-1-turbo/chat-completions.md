> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seed 2.1 Turbo Chat API 參考

> Seed 2.1 Turbo（dola-seed-2-1-turbo-260628）Chat Completions API 參考與線上除錯：OpenAI 相容格式，支援思考開關與分檔。

<Info>
  右側 Playground 可直接除錯：在 **Authorization** 填 `Bearer sk-your-api-key`，預設示例已關閉深度思考（`thinking.disabled`），點擊發送即可快速看到響應。
</Info>

<Tip>
  模型**預設開啟深度思考**，簡單問題也會先輸出數百 tokens 思考內容。除錯建議保持示例中的 `"thinking": {"type": "disabled"}`；需要思考時改用 `reasoning_effort`（low / medium / high）。模型能力、定價、快取機制詳見 [Seed 2.1 Turbo 概覽](/zh-Hant/api-capabilities/dola-seed-2-1-turbo/overview)。
</Tip>

<Warning>
  * 開啟思考時 `max_tokens` 要給足（思考內容計入輸出配額），建議 3000+
  * 模型名拼寫錯誤返回 **503**（無可用渠道）而非 404
</Warning>

## 引數說明速查

| 引數                 | 型別     | 必填 | 預設        | 說明                                                          |
| ------------------ | ------ | -- | --------- | ----------------------------------------------------------- |
| `model`            | string | ✓  | —         | 固定 `dola-seed-2-1-turbo-260628`                             |
| `messages`         | array  | ✓  | —         | OpenAI 標準訊息陣列                                               |
| `max_tokens`       | int    |    | —         | 輸出配額，開思考時建議 3000+                                           |
| `thinking.type`    | string |    | `enabled` | **預設開啟**；`disabled` 關閉思考                                    |
| `reasoning_effort` | string |    | —         | `low` / `medium` / `high`，實測 low 約 226、high 約 960 思考 tokens |
| `stream`           | bool   |    | `false`   | SSE 流式，配 `stream_options.include_usage` 拿用量                 |
| `response_format`  | object |    | —         | 結構化輸出，支援 `json_schema` + `strict`                           |
| `tools`            | array  |    | —         | Function Call 工具列表                                          |

## 響應要點

* 開思考時 `choices[0].message` 除 `content` 外還有 `reasoning_content`（思考全文）
* 思考消耗看 `usage.completion_tokens_details.reasoning_tokens`
* 隱式快取命中看 `usage.prompt_tokens_details.cached_tokens`（相同長字首第 2 次請求即命中）


## OpenAPI

````yaml api-reference/dola-seed-2-1-turbo-chat-openapi.yaml POST /v1/chat/completions
openapi: 3.1.0
info:
  title: Seed 2.1 Turbo Chat Completions API
  description: >
    字节 Seed 2.1 Turbo（`dola-seed-2-1-turbo-260628`）—— OpenAI 兼容 Chat Completions
    端点。


    - **默认开启深度思考**：不传参数时会输出 `reasoning_content` 并消耗较多 tokens；对延迟/成本敏感请传
    `thinking: {"type": "disabled"}`

    - 支持 `reasoning_effort` 分档（low / medium / high）控制思考深度

    - 支持结构化输出（`response_format: json_schema`）、Function Call、流式输出

    - 隐式缓存自动生效：相同长前缀第 2 次请求即命中 `cached_tokens`


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
      summary: 对话补全：Seed 2.1 Turbo 文本生成
      description: |
        使用 `dola-seed-2-1-turbo-260628` 进行对话补全，OpenAI 格式完全兼容。

        - 默认开启深度思考，响应中带 `reasoning_content` 字段；示例默认关闭以便快速调试
        - 开启思考时建议把 `max_tokens` 给足（思考内容也计入输出配额）
      operationId: createSeedChatCompletion
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SeedChatRequest'
            example:
              model: dola-seed-2-1-turbo-260628
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
                $ref: '#/components/schemas/SeedChatResponse'
        '400':
          description: 参数非法（如 json_schema 格式错误、参数类型错误）
        '401':
          description: 未授权 - API Key 无效
        '429':
          description: 请求频率超限或余额不足
        '503':
          description: 模型名错误或分组无可用渠道（本模型对错误模型名返回 503 而非 404）
      security:
        - bearerAuth: []
components:
  schemas:
    SeedChatRequest:
      type: object
      required:
        - model
        - messages
      properties:
        model:
          type: string
          description: 模型 ID，固定 dola-seed-2-1-turbo-260628
          enum:
            - dola-seed-2-1-turbo-260628
          default: dola-seed-2-1-turbo-260628
        messages:
          type: array
          description: 对话消息数组，OpenAI 标准格式
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
          description: 最大输出 tokens。开启思考时思考内容也计入，建议给足（如 2000+）
          default: 500
        thinking:
          type: object
          description: '深度思考开关。模型默认开启；传 {"type": "disabled"} 可关闭，显著降低延迟与输出 tokens'
          properties:
            type:
              type: string
              enum:
                - enabled
                - disabled
              default: disabled
        reasoning_effort:
          type: string
          description: >-
            思考深度分档（与 thinking.disabled 不同时使用）。实测 low 约 226、high 约 960 reasoning
            tokens
          enum:
            - low
            - medium
            - high
        stream:
          type: boolean
          description: 是否流式输出（SSE）。配合 stream_options.include_usage 可在末尾获取用量
          default: false
        temperature:
          type: number
          description: 采样温度
        response_format:
          type: object
          description: >-
            结构化输出。支持 {"type": "json_schema", "json_schema": {name, strict,
            schema}}
        tools:
          type: array
          description: Function Call 工具列表，OpenAI 标准格式
          items:
            type: object
    SeedChatResponse:
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