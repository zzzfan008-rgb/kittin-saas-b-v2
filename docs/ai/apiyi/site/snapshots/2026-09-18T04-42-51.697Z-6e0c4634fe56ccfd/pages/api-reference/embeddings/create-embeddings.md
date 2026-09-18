> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Create Embeddings

> 文本向量化接口在线调试 — 填入 API Key 即可发送请求、查看响应。POST /v1/embeddings



## OpenAPI

````yaml api-reference/apiyi-openapi.yaml POST /v1/embeddings
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
  /v1/embeddings:
    post:
      tags:
        - Embeddings
      summary: Create Embeddings
      description: |
        将文本转换为向量表示（Embedding），可用于语义搜索、文本聚类、推荐系统等场景。

        支持单个文本或批量文本输入。
      operationId: createEmbedding
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/EmbeddingRequest'
            example:
              model: text-embedding-ada-002
              input: 这是一段需要向量化的文本示例
      responses:
        '200':
          description: 成功返回向量数据
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/EmbeddingResponse'
              example:
                object: list
                data:
                  - object: embedding
                    index: 0
                    embedding:
                      - 0.0023064255
                      - -0.009327292
                      - 0.015797347
                model: text-embedding-ada-002
                usage:
                  prompt_tokens: 12
                  total_tokens: 12
        '400':
          description: 请求参数错误
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: API Key 无效
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
components:
  schemas:
    EmbeddingRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: 嵌入模型名称
          examples:
            - text-embedding-ada-002
            - text-embedding-3-small
            - text-embedding-3-large
        input:
          oneOf:
            - type: string
            - type: array
              items:
                type: string
          description: 要向量化的文本。可以是单个字符串或字符串数组。
          example: 这是一段需要向量化的文本示例
        encoding_format:
          type: string
          enum:
            - float
            - base64
          default: float
          description: 返回的向量编码格式
    EmbeddingResponse:
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
            $ref: '#/components/schemas/EmbeddingData'
        model:
          type: string
          example: text-embedding-ada-002
        usage:
          type: object
          properties:
            prompt_tokens:
              type: integer
              example: 12
            total_tokens:
              type: integer
              example: 12
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
    EmbeddingData:
      type: object
      properties:
        object:
          type: string
          enum:
            - embedding
          example: embedding
        index:
          type: integer
          example: 0
        embedding:
          type: array
          items:
            type: number
          description: 向量数组
          example:
            - 0.0023064255
            - -0.009327292
            - 0.015797347
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key

````