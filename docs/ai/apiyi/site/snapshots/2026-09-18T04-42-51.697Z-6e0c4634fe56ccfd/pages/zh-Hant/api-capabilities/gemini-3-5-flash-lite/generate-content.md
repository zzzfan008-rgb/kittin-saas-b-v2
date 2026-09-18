> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.5 Flash-Lite 原生 API 參考

> Gemini 3.5 Flash-Lite 原生 generateContent API 參考與線上除錯：官方格式直連，預設零思考極速響應，搜尋 grounding 等工具支援。

<Info>
  右側 Playground 可直接除錯：在 **x-goog-api-key** 填 `sk-your-api-key`（API易令牌，無需 Google Key），點擊發送即可看到響應——預設零思考，速度很快。
</Info>

<Tip>
  模型**預設不輸出思考**；需要深度推理傳 `thinkingConfig: {"thinkingLevel": "high"}`（實測僅 high 檔穩定觸發）。搜尋 grounding、程式碼執行、URL context、Maps 等工具僅本原生端點支援。模型能力、定價詳見 [Gemini 3.5 Flash-Lite 概覽](/zh-Hant/api-capabilities/gemini-3-5-flash-lite/overview)。
</Tip>

<Warning>
  * 流式請求把 URL 改為 `:streamGenerateContent?alt=sse`（Playground 演示非流式）
  * 程式碼執行工具實測可用，但 `executableCode` / `codeExecutionResult` 欄位暫不回顯，結果在正文中呈現
  * `:countTokens` 與顯式快取 `cachedContents` 平臺暫未開通；Computer Use 本模型官方不支援
</Warning>

## 引數說明速查

| 引數                                                     | 型別     | 必填 | 說明                                                                                         |
| ------------------------------------------------------ | ------ | -- | ------------------------------------------------------------------------------------------ |
| `contents`                                             | array  | ✓  | 對話內容，`parts` 內可混排 `text` 與 `inlineData`（base64 影像/PDF/音訊/影片）                               |
| `systemInstruction`                                    | object |    | 系統指令                                                                                       |
| `generationConfig.thinkingConfig.thinkingLevel`        | string |    | 預設不思考；`high` 實測觸發約 1000 思考 tokens                                                          |
| `generationConfig.thinkingConfig.includeThoughts`      | bool   |    | 回顯思考過程（配合 high 檔）                                                                          |
| `generationConfig.responseMimeType` + `responseSchema` |        |    | 結構化輸出（JSON Schema）                                                                         |
| `tools`                                                | array  |    | `google_search` / `url_context` / `codeExecution` / `google_maps` / `functionDeclarations` |

## 響應要點

* 思考消耗看 `usageMetadata.thoughtsTokenCount`（預設 0）
* grounding 工具命中時 `candidates[0].groundingMetadata` 返回來源；URL context 看 `urlContextMetadata`
* 本模型實測未觀測到隱式快取命中，勿按命中做成本測算


## OpenAPI

````yaml api-reference/gemini-3-5-flash-lite-native-openapi.yaml POST /v1beta/models/gemini-3.5-flash-lite:generateContent
openapi: 3.1.0
info:
  title: Gemini 3.5 Flash-Lite 原生 generateContent API
  description: >
    Gemini 3.5 Flash-Lite（`gemini-3.5-flash-lite`）—— Gemini 原生 generateContent
    端点，APIYI 令牌直接调用，无需 Google API Key。


    - 输入 $0.30 / 输出 $2.50 每 1M tokens（输出含思考），1M 上下文 / 64K 输出

    - 默认不输出思考、响应极快；需要深度推理时传 `thinkingConfig.thinkingLevel: "high"`（实测仅 high
    档稳定触发思考）

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
  /v1beta/models/gemini-3.5-flash-lite:generateContent:
    post:
      tags:
        - 文本生成
      summary: 文本生成：Gemini 3.5 Flash-Lite（Gemini 原生格式）
      description: >
        使用 `gemini-3.5-flash-lite` 进行内容生成，Google 官方请求格式完全兼容。流式请改用
        `:streamGenerateContent?alt=sse`。
      operationId: generategemini_3_5_flash_lite
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