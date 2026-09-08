> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.5 Flash-Lite Chat API 参考

> Gemini 3.5 Flash-Lite Chat Completions API 参考与在线调试：OpenAI 兼容格式，默认零思考极速响应，支持流式、Function Call、视觉。

<Info>
  右侧 Playground 可直接调试：在 **Authorization** 填 `Bearer sk-your-api-key`，点击发送即可看到响应——默认零思考，速度很快。
</Info>

<Tip>
  需要深度推理传 `reasoning_effort: "high"`（注意：本模型该端点不回显 reasoning\_tokens，精确观测思考消耗请用 [原生在线调试](/api-capabilities/gemini-3-5-flash-lite/generate-content)）。搜索 grounding、代码执行等原生工具本端点不支持。概览与实测数据见 [Gemini 3.5 Flash-Lite 概览](/api-capabilities/gemini-3-5-flash-lite/overview)。
</Tip>

## 参数说明速查

| 参数                 | 类型     | 必填 | 说明                                                       |
| ------------------ | ------ | -- | -------------------------------------------------------- |
| `model`            | string | ✓  | 固定 `gemini-3.5-flash-lite`                               |
| `messages`         | array  | ✓  | OpenAI 标准消息数组；`content` 可为多模态数组（`image_url` 支持 data URL） |
| `max_tokens`       | int    |    | 输出配额；开 `reasoning_effort: "high"` 时建议 2000+              |
| `reasoning_effort` | string |    | `high` 可触发思考；usage 不回显思考量                                |
| `stream`           | bool   |    | SSE 流式                                                   |
| `response_format`  | object |    | `json_schema` 结构化输出，实测可用                                 |
| `tools`            | array  |    | Function Call 工具列表，实测可用                                  |

## 响应要点

* 本模型 `usage.completion_tokens_details.reasoning_tokens` 不回显（3.6 Flash 正常回显）——思考消耗已计入 `completion_tokens`
* 思考正文（reasoning\_content）本端点不回显
* 模型名注意核对 `gemini-3.5-flash-lite`（三段小写连字符）


## OpenAPI

````yaml api-reference/gemini-3-5-flash-lite-chat-openapi.yaml POST /v1/chat/completions
openapi: 3.1.0
info:
  title: Gemini 3.5 Flash-Lite Chat Completions API
  description: >
    Gemini 3.5 Flash-Lite（`gemini-3.5-flash-lite`）—— OpenAI 兼容 Chat Completions
    端点，任何 OpenAI SDK 改 base_url 即用。


    - 输入 $0.30 / 输出 $2.50 每 1M tokens（输出含思考）

    - 默认不思考、响应极快；`reasoning_effort: "high"` 可触发思考（该模型 OpenAI 端不回显
    reasoning_tokens）

    - 支持流式、Function Call、response_format json_schema、图像理解（data URL）

    - 搜索/代码执行等高级工具请改用 Gemini 原生端点


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
      summary: 对话补全：Gemini 3.5 Flash-Lite（OpenAI 兼容）
      description: |
        使用 `gemini-3.5-flash-lite` 进行对话补全，OpenAI 格式完全兼容。
      operationId: chatgemini_3_5_flash_lite
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ChatRequest'
            example:
              model: gemini-3.5-flash-lite
              messages:
                - role: user
                  content: 用一句话介绍你自己
              max_tokens: 2000
      responses:
        '200':
          description: 对话补全成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ChatResponse'
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
          description: 固定 gemini-3.5-flash-lite
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
                description: 字符串或多模态数组（text / image_url）
        max_tokens:
          type: integer
          description: 输出配额；开思考时建议 2000+（思考计入输出）
        temperature:
          type: number
        stream:
          type: boolean
          description: SSE 流式输出
        reasoning_effort:
          type: string
          enum:
            - low
            - medium
            - high
          description: 思考分档
        response_format:
          type: object
          description: 结构化输出，支持 json_schema
        tools:
          type: array
          description: Function Call 工具列表
          items:
            type: object
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
                  tool_calls:
                    type: array
                    items:
                      type: object
              finish_reason:
                type: string
        usage:
          type: object
          description: 用量统计
          properties:
            prompt_tokens:
              type: integer
            completion_tokens:
              type: integer
            total_tokens:
              type: integer
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: '在请求头中添加 Authorization: Bearer YOUR_API_KEY'

````