> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Create Embeddings

> Online playground for the embeddings endpoint — enter your API Key to send requests and view responses. POST /v1/embeddings



## OpenAPI

````yaml api-reference/apiyi-openapi-en.yaml POST /v1/embeddings
openapi: 3.1.0
info:
  title: APIYI - AI Model API
  description: >
    OpenAI-compatible AI model API aggregation platform.


    APIYI uses the OpenAI-compatible format, supporting 400+ mainstream AI
    models with a single API key.


    **Authentication**: Add `Authorization: Bearer YOUR_API_KEY` to request
    headers.


    **Get API Key**: Visit the [APIYI Console](https://api.apiyi.com/token) to
    create a token.


    **Streaming Note**: The Playground does not support streaming response
    preview. Use an SDK to test streaming output.
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary Endpoint
  - url: https://vip.apiyi.com
    description: Backup Endpoint
security:
  - bearerAuth: []
paths:
  /v1/embeddings:
    post:
      tags:
        - Embeddings
      summary: Create Embeddings
      description: >
        Convert text into vector representations (embeddings) for use in
        semantic search, text clustering, recommendation systems, and more.


        Supports single text or batch text input.
      operationId: createEmbedding
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/EmbeddingRequest'
            example:
              model: text-embedding-ada-002
              input: This is a sample text for embedding.
      responses:
        '200':
          description: Successfully returned vector data
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
          description: Bad request parameters
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '401':
          description: Invalid API Key
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
          description: Embedding model name
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
          description: Text to embed. Can be a single string or an array of strings.
          example: This is a sample text for embedding.
        encoding_format:
          type: string
          enum:
            - float
            - base64
          default: float
          description: Encoding format for the returned vectors
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
              description: Error description
              example: Invalid API key provided
            type:
              type: string
              description: Error type
              example: invalid_request_error
            param:
              type: string
              nullable: true
              description: Parameter that caused the error
            code:
              type: string
              description: Error code
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
          description: Vector array
          example:
            - 0.0023064255
            - -0.009327292
            - 0.015797347
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key obtained from the APIYI Console

````