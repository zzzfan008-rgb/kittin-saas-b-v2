> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.6 Flash Chat API 參考

> Gemini 3.6 Flash Chat Completions API 參考與線上除錯：OpenAI 相容格式，支援 reasoning_effort 分檔、流式、Function Call、視覺。

<Info>
  右側 Playground 可直接除錯：在 **Authorization** 填 `Bearer sk-your-api-key`，預設示例 `reasoning_effort: "low"`，點擊發送即可看到響應。
</Info>

<Tip>
  模型**預設開啟深度思考**（計入輸出計費），除錯建議保持 low；複雜任務改 `high` 並把 `max_tokens` 給到 4000+。搜尋 grounding、程式碼執行等原生工具本端點不支援，請改用 [原生線上除錯](/zh-Hant/api-capabilities/gemini-3-6-flash/generate-content)。概覽與實測資料見 [Gemini 3.6 Flash 概覽](/zh-Hant/api-capabilities/gemini-3-6-flash/overview)。
</Tip>

## 引數說明速查

| 引數                 | 型別     | 必填 | 說明                                                       |
| ------------------ | ------ | -- | -------------------------------------------------------- |
| `model`            | string | ✓  | 固定 `gemini-3.6-flash`                                    |
| `messages`         | array  | ✓  | OpenAI 標準訊息陣列；`content` 可為多模態陣列（`image_url` 支援 data URL） |
| `max_tokens`       | int    |    | 輸出配額，開思考建議 2000+（思考計入輸出）                                 |
| `reasoning_effort` | string |    | `low` / `medium` / `high` 思考分檔，實測生效                      |
| `stream`           | bool   |    | SSE 流式                                                   |
| `response_format`  | object |    | `json_schema` 結構化輸出，實測可用                                 |
| `tools`            | array  |    | Function Call 工具列表，實測可用                                  |

## 響應要點

* 思考消耗看 `usage.completion_tokens_details.reasoning_tokens`（實測正常回顯）
* 思考正文（reasoning\_content）本端點不回顯；需要看思考過程請用原生端點 `includeThoughts`
* 模型名拼寫錯誤會返回錯誤而非靜默降級，注意核對 `gemini-3.6-flash`


## OpenAPI

````yaml api-reference/gemini-3-6-flash-chat-openapi.yaml POST /v1/chat/completions
openapi: 3.1.0
info:
  title: Gemini 3.6 Flash Chat Completions API
  description: >
    Gemini 3.6 Flash（`gemini-3.6-flash`）—— OpenAI 兼容 Chat Completions 端点，任何
    OpenAI SDK 改 base_url 即用。


    - 输入 $1.50 / 输出 $7.50 每 1M tokens（输出含思考）

    - 默认开启思考；`reasoning_effort`（low/medium/high）可分档，usage 回显 reasoning_tokens

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
      summary: 对话补全：Gemini 3.6 Flash（OpenAI 兼容）
      description: |
        使用 `gemini-3.6-flash` 进行对话补全，OpenAI 格式完全兼容。
      operationId: chatgemini_3_6_flash
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ChatRequest'
            example:
              model: gemini-3.6-flash
              messages:
                - role: user
                  content: 用一句话介绍你自己
              max_tokens: 2000
              reasoning_effort: low
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
          description: 固定 gemini-3.6-flash
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