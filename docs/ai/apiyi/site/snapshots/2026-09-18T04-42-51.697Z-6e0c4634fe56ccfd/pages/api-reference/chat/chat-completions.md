> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Chat Completions

> 对话补全接口在线调试 — 填入 API Key 即可发送请求、查看响应。POST /v1/chat/completions



## OpenAPI

````yaml api-reference/apiyi-openapi.yaml POST /v1/chat/completions
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
  /v1/chat/completions:
    post:
      tags:
        - Chat
      summary: Chat Completions
      description: |
        核心对话接口，兼容 OpenAI Chat Completions API 格式。

        支持 400+ AI 模型，只需更换 `model` 参数即可切换不同厂商的模型，其他代码完全不变。

        **支持的模型厂商**：OpenAI、Anthropic、Google、xAI、DeepSeek、阿里、Moonshot 等。

        **提示**：流式输出（stream: true）在 Playground 中不可预览，建议使用 SDK 进行测试。
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
                  content: 你是一个专业的AI助手。
                - role: user
                  content: 你好，请介绍一下自己。
              temperature: 0.7
              max_tokens: 1000
      responses:
        '200':
          description: 成功返回对话补全结果
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
                      content: 你好！我是一个AI助手，很高兴为你服务。我可以帮助你回答问题、撰写内容、编写代码等。有什么我可以帮你的吗？
                    finish_reason: stop
                usage:
                  prompt_tokens: 25
                  completion_tokens: 42
                  total_tokens: 67
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
        '429':
          description: 请求频率过高或额度不足
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '500':
          description: 服务器内部错误
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
          description: |
            模型名称。API易支持 400+ 模型，只需更换模型名称即可切换不同厂商的模型。
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
          description: 对话消息数组，支持多轮对话
          items:
            $ref: '#/components/schemas/ChatMessage'
          example:
            - role: system
              content: 你是一个专业的AI助手。
            - role: user
              content: 你好，请介绍一下自己。
        temperature:
          type: number
          minimum: 0
          maximum: 2
          default: 1
          description: 采样温度。较高的值（如 0.8）使输出更随机，较低的值（如 0.2）使输出更确定。
        max_tokens:
          type: integer
          minimum: 1
          description: 最大生成 token 数。不同模型有不同的上限。
        top_p:
          type: number
          minimum: 0
          maximum: 1
          default: 1
          description: 核采样参数。建议不要同时修改 temperature 和 top_p。
        'n':
          type: integer
          minimum: 1
          default: 1
          description: 为每条消息生成多少个回复选项。
        stream:
          type: boolean
          default: false
          description: 是否流式返回结果。Playground 不支持流式预览，建议用 SDK 测试。
        stop:
          oneOf:
            - type: string
            - type: array
              items:
                type: string
          description: 停止序列。遇到该序列时停止生成。最多 4 个。
        presence_penalty:
          type: number
          minimum: -2
          maximum: 2
          default: 0
          description: 存在惩罚。正值增加模型谈论新话题的可能性。
        frequency_penalty:
          type: number
          minimum: -2
          maximum: 2
          default: 0
          description: 频率惩罚。正值降低模型逐字重复的可能性。
        user:
          type: string
          description: 终端用户的唯一标识符，用于监控和滥用检测。
    ChatCompletionResponse:
      type: object
      properties:
        id:
          type: string
          description: 请求的唯一标识符
          example: chatcmpl-abc123
        object:
          type: string
          enum:
            - chat.completion
          example: chat.completion
        created:
          type: integer
          description: 创建时间戳（Unix 秒）
          example: 1702855400
        model:
          type: string
          description: 实际使用的模型名称
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
          description: 消息角色：system（系统设定）、user（用户输入）、assistant（助手回复）
        content:
          oneOf:
            - type: string
            - type: array
              items:
                type: object
          description: 消息内容。支持纯文本字符串，或多模态内容数组（图片+文本）。
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
          description: 结束原因：stop（自然结束）、length（达到 max_tokens）、content_filter（触发内容过滤）
          example: stop
    Usage:
      type: object
      description: Token 使用统计
      properties:
        prompt_tokens:
          type: integer
          description: 输入 token 数
          example: 25
        completion_tokens:
          type: integer
          description: 输出 token 数
          example: 150
        total_tokens:
          type: integer
          description: 总 token 数
          example: 175
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key

````