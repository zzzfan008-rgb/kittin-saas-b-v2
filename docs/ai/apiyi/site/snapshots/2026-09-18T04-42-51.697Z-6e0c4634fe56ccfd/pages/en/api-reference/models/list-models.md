> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# List Models

> Online playground for listing available models — enter your API Key to send requests and view responses. GET /v1/models



## OpenAPI

````yaml api-reference/apiyi-openapi-en.yaml GET /v1/models
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
  /v1/models:
    get:
      tags:
        - Models
      summary: List Models
      description: >
        Retrieve the list of all currently available models.


        The returned list includes model ID, creation time, owner, and other
        information. Can be used to check if a specific model is available.
      operationId: listModels
      parameters: []
      responses:
        '200':
          description: Successfully returned model list
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
          description: Invalid API Key
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
    Model:
      type: object
      properties:
        id:
          type: string
          description: Model identifier
          example: gpt-4o
        object:
          type: string
          enum:
            - model
          example: model
        created:
          type: integer
          description: Model creation timestamp
          example: 1687882411
        owned_by:
          type: string
          description: Model owner
          example: openai
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key obtained from the APIYI Console

````