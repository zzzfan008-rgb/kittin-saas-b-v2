> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.6 Flash 原生 API 参考

> Gemini 3.6 Flash 原生 generateContent API 参考与在线调试：官方格式直连，搜索 grounding、代码执行、URL context 等工具全支持。

<Info>
  右侧 Playground 可直接调试：在 **x-goog-api-key** 填 `sk-your-api-key`（API易令牌，无需 Google Key），默认示例已把思考调至 low，点击发送即可看到响应。
</Info>

<Tip>
  模型**默认开启深度思考**，成本敏感场景传 `thinkingConfig: {"thinkingLevel": "minimal"}` 或 `{"thinkingBudget": 0}`。搜索 grounding、代码执行、URL context、Maps 等工具仅本原生端点支持。模型能力、定价、思考档位实测详见 [Gemini 3.6 Flash 概览](/api-capabilities/gemini-3-6-flash/overview)。
</Tip>

<Warning>
  * 流式请求把 URL 改为 `:streamGenerateContent?alt=sse`（Playground 演示非流式）
  * 代码执行工具实测可用，但 `executableCode` / `codeExecutionResult` 字段暂不回显，结果在正文中呈现
  * `:countTokens` 与显式缓存 `cachedContents` 平台暂未开通
</Warning>

## 参数说明速查

| 参数                                                     | 类型     | 必填 | 说明                                                                                         |
| ------------------------------------------------------ | ------ | -- | ------------------------------------------------------------------------------------------ |
| `contents`                                             | array  | ✓  | 对话内容，`parts` 内可混排 `text` 与 `inlineData`（base64 图像/PDF/音频/视频）                               |
| `systemInstruction`                                    | object |    | 系统指令                                                                                       |
| `generationConfig.thinkingConfig.thinkingLevel`        | string |    | `minimal` / `low` / `medium` / `high`，实测思考 0/403/487/837 tokens                            |
| `generationConfig.thinkingConfig.includeThoughts`      | bool   |    | 回显思考过程（`thought: true` 的 part）                                                             |
| `generationConfig.responseMimeType` + `responseSchema` |        |    | 结构化输出（JSON Schema）                                                                         |
| `tools`                                                | array  |    | `google_search` / `url_context` / `codeExecution` / `google_maps` / `functionDeclarations` |

## 响应要点

* 思考消耗看 `usageMetadata.thoughtsTokenCount`（计入输出计费）
* grounding 工具命中时 `candidates[0].groundingMetadata` 返回来源；URL context 看 `urlContextMetadata`
* 隐式缓存命中看 `usageMetadata.cachedContentTokenCount`（概率命中，勿依赖）


## OpenAPI

````yaml api-reference/gemini-3-6-flash-native-openapi.yaml POST /v1beta/models/gemini-3.6-flash:generateContent
openapi: 3.1.0
info:
  title: Gemini 3.6 Flash 原生 generateContent API
  description: >
    Gemini 3.6 Flash（`gemini-3.6-flash`）—— Gemini 原生 generateContent 端点，APIYI
    令牌直接调用，无需 Google API Key。


    - 输入 $1.50 / 输出 $7.50 每 1M tokens（输出含思考），1M 上下文 / 64K 输出

    - 默认开启深度思考（思考 tokens 计入输出计费）；`thinkingConfig.thinkingLevel` 支持
    minimal/low/medium/high，`thinkingBudget: 0` 可关闭

    - 搜索/地图 grounding、URL context、代码执行等高级工具为本原生格式专属


    **认证方式**：请求头 `x-goog-api-key: YOUR_API_KEY`


    **获取 API Key**：访问 API易控制台 `api.apiyi.com/token` 创建令牌
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: 主要端点
  - url: https://vip.apiyi.com
    description: 备用端点
security:
  - geminiKey: []
paths:
  /v1beta/models/gemini-3.6-flash:generateContent:
    post:
      tags:
        - 文本生成
      summary: 文本生成：Gemini 3.6 Flash（Gemini 原生格式）
      description: >
        使用 `gemini-3.6-flash` 进行内容生成，Google 官方请求格式完全兼容。流式请改用
        `:streamGenerateContent?alt=sse`。
      operationId: generategemini_3_6_flash
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/GenerateContentRequest'
            example:
              contents:
                - role: user
                  parts:
                    - text: 用一句话介绍你自己
              generationConfig:
                thinkingConfig:
                  thinkingLevel: low
      responses:
        '200':
          description: 生成成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GenerateContentResponse'
        '401':
          description: API Key 无效
        '429':
          description: 请求频率超限
      security:
        - geminiKey: []
components:
  schemas:
    GenerateContentRequest:
      type: object
      required:
        - contents
      properties:
        contents:
          type: array
          description: 对话内容数组，多模态 part 混排
          items:
            type: object
            properties:
              role:
                type: string
                enum:
                  - user
                  - model
              parts:
                type: array
                items:
                  type: object
                  properties:
                    text:
                      type: string
                    inlineData:
                      type: object
                      description: 内嵌 base64 多媒体（图像/PDF/音频/视频）
                      properties:
                        mimeType:
                          type: string
                        data:
                          type: string
        systemInstruction:
          type: object
          description: 系统指令
          properties:
            parts:
              type: array
              items:
                type: object
                properties:
                  text:
                    type: string
        generationConfig:
          type: object
          description: 生成配置
          properties:
            temperature:
              type: number
            maxOutputTokens:
              type: integer
            responseMimeType:
              type: string
              description: 设为 application/json 启用结构化输出
            responseSchema:
              type: object
              description: 结构化输出 JSON Schema
            thinkingConfig:
              type: object
              description: 思考配置（详见概览页实测档位）
              properties:
                thinkingLevel:
                  type: string
                  enum:
                    - minimal
                    - low
                    - medium
                    - high
                thinkingBudget:
                  type: integer
                includeThoughts:
                  type: boolean
        tools:
          type: array
          description: >-
            工具：google_search / url_context / codeExecution /
            functionDeclarations 等
          items:
            type: object
    GenerateContentResponse:
      type: object
      properties:
        candidates:
          type: array
          items:
            type: object
            properties:
              content:
                type: object
                properties:
                  role:
                    type: string
                  parts:
                    type: array
                    items:
                      type: object
              finishReason:
                type: string
              groundingMetadata:
                type: object
                description: 启用 grounding 工具时返回
        usageMetadata:
          type: object
          description: 用量统计，thoughtsTokenCount 为思考消耗
          properties:
            promptTokenCount:
              type: integer
            candidatesTokenCount:
              type: integer
            thoughtsTokenCount:
              type: integer
            totalTokenCount:
              type: integer
        modelVersion:
          type: string
  securitySchemes:
    geminiKey:
      type: apiKey
      in: header
      name: x-goog-api-key
      description: API易令牌，直接填 sk- 开头的 Key

````