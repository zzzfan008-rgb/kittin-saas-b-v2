> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.8-Max Chat API 參考

> Qwen3.8-Max Chat Completions API 參考與線上除錯：OpenAI 相容格式，支援 reasoning_effort 分檔、流式、Function Call、圖片與影片輸入。

<Info>
  右側 Playground 可直接除錯：在 **Authorization** 填 `Bearer sk-your-api-key`，預設示例已帶 `reasoning_effort: "none"`，點擊發送即可看到響應。
</Info>

<Tip>
  模型**預設開啟深度思考**（預設 `xhigh` 檔，思考計入輸出計費）。示例預設關閉思考是為了讓除錯更快更省；需要複雜推理時刪掉 `reasoning_effort` 欄位並把 `max_tokens` 給到 4000+。概覽與完整實測資料見 [Qwen3.8-Max 概覽](/zh-Hant/api-capabilities/qwen-3-8/overview)。
</Tip>

## 引數說明速查

| 引數                 | 型別            | 必填 | 說明                                                                          |
| ------------------ | ------------- | -- | --------------------------------------------------------------------------- |
| `model`            | string        | ✓  | 固定 `qwen3.8-max`                                                            |
| `messages`         | array         | ✓  | OpenAI 標準訊息陣列；`content` 可為多模態陣列（`image_url` / `video_url` 支援 data URL）      |
| `max_tokens`       | int           |    | 可見回答的輸出配額，範圍 `[1, 131072]`。**不約束思考 tokens**                                 |
| `reasoning_effort` | string        |    | `none` / `minimal` / `low` / `medium` / `high` / `xhigh` / `max`，預設 `xhigh` |
| `stream`           | bool          |    | SSE 流式；本端點即使不帶 `stream_options` 也會在末塊回 usage                                |
| `response_format`  | object        |    | `json_schema` 結構化輸出，實測嚴格守約                                                  |
| `tools`            | array         |    | Function Call 工具列表，實測可用                                                     |
| `tool_choice`      | string/object |    | `auto` / `none` 可直接用；`required` 或指定函式需同時設 `reasoning_effort: "none"`        |
| `n`                | int           |    | 大於 1 時需同時設 `reasoning_effort: "none"`                                       |
| `temperature`      | number        |    | 有效範圍 `[0.0, 2.0)`，傳 `2` 即報 400                                              |
| `stop`             | array         |    | 停止序列，實測生效                                                                   |

## 三個容易踩的坑

<Warning>
  **1. `max_tokens` 管不住思考。** 實測設 `max_tokens=1`，仍被計 1054 個輸出 token（其中 1045 個是思考）。控成本請用 `reasoning_effort="none"`。

  **2. 強制工具呼叫要關思考。** `tool_choice` 設 `"required"` 或指定函式時，思考模式下會返回 400 或靜默不呼叫，需同時傳 `reasoning_effort="none"`。

  **3. `thinking_budget` 不生效。** 傳任何數值都等同 `low` 檔，請改用 `reasoning_effort`。
</Warning>

## 響應要點

* 思考正文看 `choices[0].message.reasoning_content`（思考開啟時回顯）
* 思考消耗看 `usage.completion_tokens_details.reasoning_tokens`；快取命中看 `usage.prompt_tokens_details.cached_tokens`
* **部分上游線路不回顯這兩個欄位**（實測約佔三分之一的請求），需要精確核算思考成本時請留意
* `reasoning_effort` 七個合法值實測只對應四個真實檔位，傳 `max` 不會比 `xhigh` 想得更多
* 傳入非法的 `reasoning_effort` 會返回 400 並列出全部合法值，不會靜默降級

## 相關文件

* [Qwen3.8-Max 概覽](/zh-Hant/api-capabilities/qwen-3-8/overview) — 完整能力矩陣、定價與最佳實踐
* [Qwen3.6 系列（歷史版本）](/zh-Hant/api-capabilities/qwen-3-6/overview) — 上一代五款模型


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