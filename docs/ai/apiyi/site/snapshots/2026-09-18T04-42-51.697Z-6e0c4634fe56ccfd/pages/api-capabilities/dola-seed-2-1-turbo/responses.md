> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seed 2.1 Turbo Responses API 参考

> Seed 2.1 Turbo（dola-seed-2-1-turbo-260628）Responses API 参考与在线调试：原生多轮 previous_response_id 与显式缓存链式调用。

<Info>
  右侧 Playground 可直接调试：在 **Authorization** 填 `Bearer sk-your-api-key`，填好 `input` 后发送。响应 `output` 数组中 `type: "reasoning"` 是思考摘要，`type: "message"` 才是正文。
</Info>

<Tip>
  多轮对话把上一轮响应的 `id`（`resp_` 开头）作为下一轮 `previous_response_id` 传入即可，无需重发历史消息。显式缓存、思考控制等机制详见 [Seed 2.1 Turbo 概览](/api-capabilities/dola-seed-2-1-turbo/overview)。
</Tip>

<Warning>
  * `max_output_tokens` 太小会被思考吃满，返回 `status: "incomplete"` 且**正文为空**，建议 1500 起步
  * 显式缓存 `caching: {"type": "enabled"}` 必须配合 `previous_response_id` **链式调用**才会命中；只重复相同前缀不命中（连隐式前缀缓存也会失效）
</Warning>

## 参数说明速查

| 参数                     | 类型             | 必填 | 默认         | 说明                                                           |
| ---------------------- | -------------- | -- | ---------- | ------------------------------------------------------------ |
| `model`                | string         | ✓  | —          | 固定 `dola-seed-2-1-turbo-260628`                              |
| `input`                | string / array | ✓  | —          | 字符串或消息数组（含 `function_call_output` 等 item）                    |
| `max_output_tokens`    | int            |    | —          | 含思考的输出配额，建议 1500+                                            |
| `reasoning.effort`     | string         |    | —          | `low` / `medium` / `high`，实测 low 约 371、high 约 1317 思考 tokens |
| `previous_response_id` | string         |    | —          | 上一轮响应 id，原生多轮；配合显式缓存整轮命中                                     |
| `caching.type`         | string         |    | `disabled` | `enabled` 开显式缓存（需链式调用）                                       |
| `store`                | bool           |    | `true`     | 存储本轮响应供后续引用                                                  |
| `stream`               | bool           |    | `false`    | SSE 事件流（`response.created` → `response.completed`）           |
| `text.format`          | object         |    | —          | 结构化输出，支持 `json_schema` + `strict`                            |
| `tools`                | array          |    | —          | Function Call 工具列表（扁平格式）                                     |

## 响应要点

* `status` 为 `incomplete` 时检查 `incomplete_details.reason`（多为 `length`，即配额被思考吃满）
* 思考消耗看 `usage.output_tokens_details.reasoning_tokens`
* 缓存命中看 `usage.input_tokens_details.cached_tokens`（链式第 2 轮实测可整轮命中，延迟约减半）
* 响应 `caching` 字段回显本次实际生效的缓存模式


## OpenAPI

````yaml api-reference/dola-seed-2-1-turbo-responses-openapi.yaml POST /v1/responses
openapi: 3.1.0
info:
  title: Seed 2.1 Turbo Responses API
  description: >
    字节 Seed 2.1 Turbo（`dola-seed-2-1-turbo-260628`）—— 原生 Responses API 端点。


    - 完整 Responses 语义：事件流、reasoning item、`previous_response_id` 多轮

    - **显式缓存**：`caching: {"type": "enabled"}` 配合 `previous_response_id` 链式调用，第 2
    轮命中上一轮全部上下文（实测 cached 7873 tokens、延迟约减半）

    - 默认输出 reasoning：`max_output_tokens` 太小会被思考吃满导致 `status: incomplete`、正文为空，建议
    1500+

    - 支持 `reasoning.effort` 分档、结构化输出（`text.format`）、Function Call


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
  /v1/responses:
    post:
      tags:
        - 文本生成
      summary: Responses：Seed 2.1 Turbo 文本生成（原生多轮/显式缓存）
      description: |
        使用 `dola-seed-2-1-turbo-260628` 调用 Responses API。

        - 多轮对话推荐携带 `previous_response_id`，无需重发历史消息
        - 开启 `caching.enabled` 后必须走 `previous_response_id` 链式才有缓存命中；只重复相同前缀不会命中
      operationId: createSeedResponse
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SeedResponsesRequest'
            example:
              model: dola-seed-2-1-turbo-260628
              input: 用一句话介绍你自己
              max_output_tokens: 1500
      responses:
        '200':
          description: 生成成功。output 数组含 reasoning item 与 message item
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SeedResponsesResponse'
        '400':
          description: 参数非法
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
    SeedResponsesRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: 模型 ID，固定 dola-seed-2-1-turbo-260628
          enum:
            - dola-seed-2-1-turbo-260628
          default: dola-seed-2-1-turbo-260628
        input:
          type: string
          description: >-
            输入内容。可为字符串，也可为消息数组（[{role, content}, ...]，含 function_call_output 等
            item）
          example: 用一句话介绍你自己
        max_output_tokens:
          type: integer
          description: 最大输出 tokens（含思考）。太小会 incomplete 且正文为空，建议 1500+
          default: 1500
        reasoning:
          type: object
          description: 思考深度控制。实测 effort low 约 371、high 约 1317 reasoning tokens
          properties:
            effort:
              type: string
              enum:
                - low
                - medium
                - high
        previous_response_id:
          type: string
          description: 上一轮响应 id（resp_ 开头），实现原生多轮；配合 caching.enabled 可命中显式缓存
        caching:
          type: object
          description: 显式缓存开关。enabled 需配合 previous_response_id 链式调用才会命中
          properties:
            type:
              type: string
              enum:
                - enabled
                - disabled
        store:
          type: boolean
          description: 是否存储本轮响应供后续 previous_response_id 引用
        stream:
          type: boolean
          description: >-
            是否流式输出（response.created → response.output_text.delta →
            response.completed 事件流）
          default: false
        text:
          type: object
          description: '结构化输出。支持 {"format": {"type": "json_schema", name, strict, schema}}'
        tools:
          type: array
          description: >-
            Function Call 工具列表（Responses 扁平格式：{type, name, description,
            parameters}）
          items:
            type: object
    SeedResponsesResponse:
      type: object
      properties:
        id:
          type: string
          description: 响应 ID（resp_ 开头），可作为下一轮 previous_response_id
        status:
          type: string
          description: completed / incomplete（配额被思考吃满时为 incomplete）
        output:
          type: array
          description: 输出 item 数组：reasoning（思考摘要）、message（正文）、function_call 等
          items:
            type: object
        usage:
          type: object
          description: >-
            用量。output_tokens_details.reasoning_tokens
            为思考消耗；input_tokens_details.cached_tokens 为缓存命中量
        caching:
          type: object
          description: 本次请求实际生效的缓存模式
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key

````