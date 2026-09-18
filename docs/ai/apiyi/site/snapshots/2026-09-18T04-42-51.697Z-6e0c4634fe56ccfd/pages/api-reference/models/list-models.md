> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# List Models

> 查询当前可用模型列表在线调试 — 填入 API Key 即可发送请求、查看响应。GET /v1/models



## OpenAPI

````yaml api-reference/apiyi-openapi.yaml GET /v1/models
openapi: 3.1.0
info:
  title: API易 - AI Model API
  description: |
    OpenAI 兼容的 AI 大模型 API 聚合平台。

    API易采用 OpenAI 兼容格式，支持 400+ 主流大模型，一个令牌、无限模型。

    **认证方式**：在请求头中添加 `Authorization: Bearer YOUR_API_KEY`

    **获取 API Key**：访问 [API易控制台](https://api.apiyi.com/token) 创建令牌

    **流式输出说明**：Playground 不支持流式响应预览，建议使用 SDK 测试流式输出。
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: 主要端点
  - url: https://vip.apiyi.com
    description: 备用端点
security:
  - bearerAuth: []
paths:
  /v1/models:
    get:
      tags:
        - Models
      summary: List Models
      description: |
        获取当前可用的所有模型列表。

        返回的列表包含模型 ID、创建时间、所有者等信息。可用于检查某个模型是否可用。
      operationId: listModels
      parameters: []
      responses:
        '200':
          description: 成功返回模型列表
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ModelList'
              example:
                object: list
                data:
                  - id: gpt-4o
                    object: model
                    created: 1687882411
                    owned_by: openai
                  - id: gpt-4o-mini
                    object: model
                    created: 1687882411
                    owned_by: openai
                  - id: claude-sonnet-4-20250514
                    object: model
                    created: 1687882411
                    owned_by: anthropic
                  - id: gemini-2.5-pro
                    object: model
                    created: 1687882411
                    owned_by: google
                  - id: deepseek-r1
                    object: model
                    created: 1687882411
                    owned_by: deepseek
        '401':
          description: API Key 无效
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
components:
  schemas:
    ModelList:
      type: object
      properties:
        object:
          type: string
          enum:
            - list
          example: list
        data:
          type: array
          items:
            $ref: '#/components/schemas/Model'
    ErrorResponse:
      type: object
      properties:
        error:
          type: object
          properties:
            message:
              type: string
              description: 错误描述信息
              example: Invalid API key provided
            type:
              type: string
              description: 错误类型
              example: invalid_request_error
            param:
              type: string
              nullable: true
              description: 导致错误的参数
            code:
              type: string
              description: 错误代码
              example: invalid_api_key
    Model:
      type: object
      properties:
        id:
          type: string
          description: 模型标识符
          example: gpt-4o
        object:
          type: string
          enum:
            - model
          example: model
        created:
          type: integer
          description: 模型创建时间戳
          example: 1687882411
        owned_by:
          type: string
          description: 模型所有者
          example: openai
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key

````