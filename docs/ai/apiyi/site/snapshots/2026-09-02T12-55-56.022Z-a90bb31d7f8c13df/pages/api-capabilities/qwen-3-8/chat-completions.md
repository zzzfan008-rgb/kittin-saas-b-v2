> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.8-Max Chat API 参考

> Qwen3.8-Max Chat Completions API 参考与在线调试：OpenAI 兼容格式，支持 reasoning_effort 分档、流式、Function Call、图片与视频输入。

<Info>
  右侧 Playground 可直接调试：在 **Authorization** 填 `Bearer sk-your-api-key`，默认示例已带 `reasoning_effort: "none"`，点击发送即可看到响应。
</Info>

<Tip>
  模型**默认开启深度思考**（默认 `xhigh` 档，思考计入输出计费）。示例默认关闭思考是为了让调试更快更省；需要复杂推理时删掉 `reasoning_effort` 字段并把 `max_tokens` 给到 4000+。概览与完整实测数据见 [Qwen3.8-Max 概览](/api-capabilities/qwen-3-8/overview)。
</Tip>

## 参数说明速查

| 参数                 | 类型            | 必填 | 说明                                                                          |
| ------------------ | ------------- | -- | --------------------------------------------------------------------------- |
| `model`            | string        | ✓  | 固定 `qwen3.8-max`                                                            |
| `messages`         | array         | ✓  | OpenAI 标准消息数组；`content` 可为多模态数组（`image_url` / `video_url` 支持 data URL）      |
| `max_tokens`       | int           |    | 可见回答的输出配额，范围 `[1, 131072]`。**不约束思考 tokens**                                 |
| `reasoning_effort` | string        |    | `none` / `minimal` / `low` / `medium` / `high` / `xhigh` / `max`，默认 `xhigh` |
| `stream`           | bool          |    | SSE 流式；本端点即使不带 `stream_options` 也会在末块回 usage                                |
| `response_format`  | object        |    | `json_schema` 结构化输出，实测严格守约                                                  |
| `tools`            | array         |    | Function Call 工具列表，实测可用                                                     |
| `tool_choice`      | string/object |    | `auto` / `none` 可直接用；`required` 或指定函数需同时设 `reasoning_effort: "none"`        |
| `n`                | int           |    | 大于 1 时需同时设 `reasoning_effort: "none"`                                       |
| `temperature`      | number        |    | 有效范围 `[0.0, 2.0)`，传 `2` 即报 400                                              |
| `stop`             | array         |    | 停止序列，实测生效                                                                   |

## 三个容易踩的坑

<Warning>
  **1. `max_tokens` 管不住思考。** 实测设 `max_tokens=1`，仍被计 1054 个输出 token（其中 1045 个是思考）。控成本请用 `reasoning_effort="none"`。

  **2. 强制工具调用要关思考。** `tool_choice` 设 `"required"` 或指定函数时，思考模式下会返回 400 或静默不调用，需同时传 `reasoning_effort="none"`。

  **3. `thinking_budget` 不生效。** 传任何数值都等同 `low` 档，请改用 `reasoning_effort`。
</Warning>

## 响应要点

* 思考正文看 `choices[0].message.reasoning_content`（思考开启时回显）
* 思考消耗看 `usage.completion_tokens_details.reasoning_tokens`；缓存命中看 `usage.prompt_tokens_details.cached_tokens`
* **部分上游线路不回显这两个字段**（实测约占三分之一的请求），需要精确核算思考成本时请留意
* `reasoning_effort` 七个合法值实测只对应四个真实档位，传 `max` 不会比 `xhigh` 想得更多
* 传入非法的 `reasoning_effort` 会返回 400 并列出全部合法值，不会静默降级

## 相关文档

* [Qwen3.8-Max 概览](/api-capabilities/qwen-3-8/overview) — 完整能力矩阵、定价与最佳实践
* [Qwen3.6 系列（历史版本）](/api-capabilities/qwen-3-6/overview) — 上一代五款模型


## OpenAPI

````yaml api-reference/qwen-3-8-max-chat-openapi.yaml POST /v1/chat/completions
openapi: 3.1.0
info:
  title: Qwen3.8-Max Chat Completions API
  description: >
    Qwen3.8-Max（`qwen3.8-max`）—— OpenAI 兼容 Chat Completions 端点，任何 OpenAI SDK 改
    base_url 即用。


    - 输入 $1.65 / 输出 $4.95 每 1M tokens（输出含思考），比阿里云官网低 17.5%

    - 1M 上下文、131K 最大输出、原生图片与视频输入

    - **默认开启思考**（默认 xhigh 档）；`reasoning_effort` 实测四个真实档位：`none` /
    `minimal`≡`low` / `medium` / `high`≡`xhigh`≡`max`

    - `max_tokens` 只截断可见回答，**不约束思考 tokens**，控成本请用 `reasoning_effort: "none"`

    - 支持流式、Function Call、response_format json_schema

    - `tool_choice` 强制调用与 `n > 1` 需同时设 `reasoning_effort: "none"`

    - `thinking_budget` 数值不生效；内置联网搜索不可用


    **认证方式**：请求头 `Authorization: Bearer YOUR_API_KEY`


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
      summary: 对话补全：Qwen3.8-Max（OpenAI 兼容）
      description: >
        使用 `qwen3.8-max` 进行对话补全，OpenAI 格式完全兼容。


        示例默认带 `reasoning_effort: "none"` 关闭思考——这是日常对话的推荐配置，实测输出 tokens 可降到约
        1/30。

        需要复杂推理时删掉该字段（回到默认 xhigh 档）并把 `max_tokens` 给到 4000+。
      operationId: chatqwen3_8_max
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ChatRequest'
            example:
              model: qwen3.8-max
              messages:
                - role: user
                  content: 用一句话介绍你自己
              max_tokens: 1000
              reasoning_effort: none
      responses:
        '200':
          description: 对话补全成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ChatResponse'
        '400':
          description: >-
            参数错误。常见原因：思考模式下用了 tool_choice 强制调用或 n > 1；reasoning_effort
            取值不合法；temperature 超出 [0.0, 2.0)；max_tokens 超出 [1, 131072]
        '401':
          description: API Key 无效
        '429':
          description: 请求频率超限
      security:
        - bearerAuth: []
components:
  schemas:
    ChatRequest:
      type: object
      required:
        - model
        - messages
      properties:
        model:
          type: string
          description: 固定 qwen3.8-max
        messages:
          type: array
          description: OpenAI 标准消息数组
          items:
            type: object
            properties:
              role:
                type: string
                enum:
                  - system
                  - user
                  - assistant
                  - tool
              content:
                description: 字符串或多模态数组（text / image_url / video_url）
        max_tokens:
          type: integer
          description: 可见回答的输出配额，范围 [1, 131072]。注意：不约束思考 tokens
        reasoning_effort:
          type: string
          enum:
            - none
            - minimal
            - low
            - medium
            - high
            - xhigh
            - max
          description: >-
            思考分档，默认 xhigh。实测只有四个真实档位：none / minimal≡low / medium /
            high≡xhigh≡max
        temperature:
          type: number
          description: 有效范围 [0.0, 2.0)，传 2 即报 400
        top_p:
          type: number
          description: 有效范围 (0.0, 1.0]
        top_k:
          type: integer
        stream:
          type: boolean
          description: SSE 流式输出。本端点即使不带 stream_options 也会在末块回 usage
        stop:
          type: array
          description: 停止序列，实测生效
          items:
            type: string
        response_format:
          type: object
          description: '结构化输出，json_schema 实测严格守约。建议同时设 reasoning_effort: none'
        tools:
          type: array
          description: Function Call 工具列表，实测可用
          items:
            type: object
        tool_choice:
          description: 'auto / none 可直接用；required 或指定函数时需同时设 reasoning_effort: none'
        parallel_tool_calls:
          type: boolean
          description: 设为 false 可限制为单个工具调用，实测生效
        'n':
          type: integer
          description: '候选数量。大于 1 时需同时设 reasoning_effort: none'
        logprobs:
          type: boolean
    ChatResponse:
      type: object
      properties:
        id:
          type: string
        model:
          type: string
        choices:
          type: array
          items:
            type: object
            properties:
              message:
                type: object
                properties:
                  role:
                    type: string
                  content:
                    type: string
                  reasoning_content:
                    type: string
                    description: 思考正文，思考开启时回显
                  tool_calls:
                    type: array
                    items:
                      type: object
              finish_reason:
                type: string
        usage:
          type: object
          description: 用量统计。部分上游线路不回显 reasoning_tokens 与 cached_tokens
          properties:
            prompt_tokens:
              type: integer
            completion_tokens:
              type: integer
              description: 含思考 tokens
            total_tokens:
              type: integer
            completion_tokens_details:
              type: object
              properties:
                reasoning_tokens:
                  type: integer
            prompt_tokens_details:
              type: object
              properties:
                cached_tokens:
                  type: integer
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: '在请求头中添加 Authorization: Bearer YOUR_API_KEY'

````