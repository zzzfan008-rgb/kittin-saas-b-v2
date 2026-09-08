> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Chat Completions

> Online playground for the chat completions endpoint — enter your API Key to send requests and view responses. POST /v1/chat/completions



## OpenAPI

````yaml api-reference/apiyi-openapi-en.yaml POST /v1/chat/completions
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
  /v1/chat/completions:
    post:
      tags:
        - Chat
      summary: Chat Completions
      description: >
        Core chat interface, compatible with the OpenAI Chat Completions API
        format.


        Supports 400+ AI models — just change the `model` parameter to switch
        between providers, with no other code changes needed.


        **Supported providers**: OpenAI, Anthropic, Google, xAI, DeepSeek,
        Alibaba, Moonshot, and more.


        **Note**: Streaming output (stream: true) cannot be previewed in the
        Playground. Use an SDK to test.
      operationId: createChatCompletion
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ChatCompletionRequest'
            example:
              model: gpt-4o
              messages:
                - role: system
                  content: You are a helpful assistant.
                - role: user
                  content: Hello, please introduce yourself.
              temperature: 0.7
              max_tokens: 1000
      responses:
        '200':
          description: Successfully returned chat completion result
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ChatCompletionResponse'
              example:
                id: chatcmpl-abc123
                object: chat.completion
                created: 1702855400
                model: gpt-4o
                choices:
                  - index: 0
                    message:
                      role: assistant
                      content: >-
                        Hello! I'm an AI assistant, happy to help you. I can
                        answer questions, write content, write code, and more.
                        How can I assist you today?
                    finish_reason: stop
                usage:
                  prompt_tokens: 25
                  completion_tokens: 42
                  total_tokens: 67
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
        '429':
          description: Rate limit exceeded or insufficient quota
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '500':
          description: Internal server error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
components:
  schemas:
    ChatCompletionRequest:
      type: object
      required:
        - model
        - messages
      properties:
        model:
          type: string
          description: >
            Model name. APIYI supports 400+ models — just change the model name
            to switch between providers.
          examples:
            - gpt-4o
            - gpt-4o-mini
            - gpt-5-chat-latest
            - claude-sonnet-4-20250514
            - claude-opus-4-1-20250805
            - claude-3-5-haiku-20241022
            - gemini-2.5-pro
            - gemini-2.5-flash
            - gemini-2.0-flash
            - deepseek-r1
            - deepseek-v3-0324
            - grok-4-0709
            - grok-3
            - o4-mini
            - o3
            - qwen-max
            - glm-4-plus
        messages:
          type: array
          description: Array of conversation messages, supports multi-turn dialogue
          items:
            $ref: '#/components/schemas/ChatMessage'
          example:
            - role: system
              content: You are a helpful assistant.
            - role: user
              content: Hello, please introduce yourself.
        temperature:
          type: number
          minimum: 0
          maximum: 2
          default: 1
          description: >-
            Sampling temperature. Higher values (e.g., 0.8) make output more
            random, lower values (e.g., 0.2) make it more deterministic.
        max_tokens:
          type: integer
          minimum: 1
          description: >-
            Maximum number of tokens to generate. Different models have
            different limits.
        top_p:
          type: number
          minimum: 0
          maximum: 1
          default: 1
          description: >-
            Nucleus sampling parameter. It is generally recommended not to
            modify both temperature and top_p.
        'n':
          type: integer
          minimum: 1
          default: 1
          description: Number of completions to generate for each message.
        stream:
          type: boolean
          default: false
          description: >-
            Whether to stream results. The Playground does not support streaming
            preview — use an SDK to test.
        stop:
          oneOf:
            - type: string
            - type: array
              items:
                type: string
          description: >-
            Stop sequence(s). Generation stops when this sequence is
            encountered. Up to 4.
        presence_penalty:
          type: number
          minimum: -2
          maximum: 2
          default: 0
          description: >-
            Presence penalty. Positive values increase the likelihood of talking
            about new topics.
        frequency_penalty:
          type: number
          minimum: -2
          maximum: 2
          default: 0
          description: >-
            Frequency penalty. Positive values decrease the likelihood of
            repeating the same text verbatim.
        user:
          type: string
          description: >-
            A unique identifier for the end user, used for monitoring and abuse
            detection.
    ChatCompletionResponse:
      type: object
      properties:
        id:
          type: string
          description: Unique identifier for the request
          example: chatcmpl-abc123
        object:
          type: string
          enum:
            - chat.completion
          example: chat.completion
        created:
          type: integer
          description: Creation timestamp (Unix seconds)
          example: 1702855400
        model:
          type: string
          description: The model actually used
          example: gpt-4o
        choices:
          type: array
          items:
            $ref: '#/components/schemas/ChatChoice'
        usage:
          $ref: '#/components/schemas/Usage'
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
    ChatMessage:
      type: object
      required:
        - role
        - content
      properties:
        role:
          type: string
          enum:
            - system
            - user
            - assistant
          description: >-
            Message role: system (system prompt), user (user input), assistant
            (assistant reply)
        content:
          oneOf:
            - type: string
            - type: array
              items:
                type: object
          description: >-
            Message content. Supports plain text string or multimodal content
            array (image + text).
    ChatChoice:
      type: object
      properties:
        index:
          type: integer
          example: 0
        message:
          $ref: '#/components/schemas/ChatMessage'
        finish_reason:
          type: string
          enum:
            - stop
            - length
            - content_filter
            - function_call
            - tool_calls
          description: >-
            Finish reason: stop (natural end), length (reached max_tokens),
            content_filter (triggered content filter)
          example: stop
    Usage:
      type: object
      description: Token usage statistics
      properties:
        prompt_tokens:
          type: integer
          description: Number of input tokens
          example: 25
        completion_tokens:
          type: integer
          description: Number of output tokens
          example: 150
        total_tokens:
          type: integer
          description: Total number of tokens
          example: 175
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key obtained from the APIYI Console

````