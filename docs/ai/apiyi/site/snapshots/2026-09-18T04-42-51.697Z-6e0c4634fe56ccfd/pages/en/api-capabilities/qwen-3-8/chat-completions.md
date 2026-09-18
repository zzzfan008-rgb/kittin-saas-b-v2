> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.8-Max Chat API Reference

> Qwen3.8-Max Chat Completions API reference and live playground: OpenAI-compatible format with reasoning_effort tiers, streaming, function calling, and image/video input.

<Info>
  Use the playground on the right to send requests directly: put `Bearer sk-your-api-key` in **Authorization**. The example already includes `reasoning_effort: "none"` — hit send to see the response.
</Info>

<Tip>
  The model **thinks by default** (tier `xhigh`, billed as output). The example disables thinking to keep debugging fast and cheap; for hard reasoning, drop the `reasoning_effort` field and raise `max_tokens` to 4000+. For the full write-up, see the [Qwen3.8-Max overview](/en/api-capabilities/qwen-3-8/overview).
</Tip>

## Parameter quick reference

| Parameter          | Type          | Required | Notes                                                                                                           |
| ------------------ | ------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `model`            | string        | ✓        | Always `qwen3.8-max`                                                                                            |
| `messages`         | array         | ✓        | Standard OpenAI message array; `content` may be a multimodal array (`image_url` / `video_url` accept data URLs) |
| `max_tokens`       | int           |          | Output budget for the visible answer, range `[1, 131072]`. **Does not bound thinking tokens**                   |
| `reasoning_effort` | string        |          | `none` / `minimal` / `low` / `medium` / `high` / `xhigh` / `max`, default `xhigh`                               |
| `stream`           | bool          |          | SSE streaming; this endpoint returns usage in the final chunk even without `stream_options`                     |
| `response_format`  | object        |          | `json_schema` structured output, held strictly in testing                                                       |
| `tools`            | array         |          | Function calling tool list, verified working                                                                    |
| `tool_choice`      | string/object |          | `auto` / `none` work as-is; `required` or a named function requires `reasoning_effort: "none"`                  |
| `n`                | int           |          | Values above 1 require `reasoning_effort: "none"`                                                               |
| `temperature`      | number        |          | Valid range `[0.0, 2.0)`; passing `2` returns 400                                                               |
| `stop`             | array         |          | Stop sequences, verified working                                                                                |

## Three easy mistakes

<Warning>
  **1. `max_tokens` does not cap thinking.** We set `max_tokens=1` and were still billed 1,054 output tokens (1,045 of them thinking). Use `reasoning_effort="none"` to control cost.

  **2. Forced tool calls need thinking off.** With `tool_choice` set to `"required"` or a named function, thinking mode returns a 400 or silently skips the call — pass `reasoning_effort="none"` alongside it.

  **3. `thinking_budget` has no effect.** Any value behaves like the `low` tier; use `reasoning_effort` instead.
</Warning>

## Reading the response

* The thinking trace is in `choices[0].message.reasoning_content` (returned while thinking is on)
* Thinking cost is in `usage.completion_tokens_details.reasoning_tokens`; cache hits in `usage.prompt_tokens_details.cached_tokens`
* **Some upstream routes do not report those two fields** (roughly one third of requests in testing) — keep this in mind if you need exact thinking-cost accounting
* The seven legal `reasoning_effort` values map to only four real tiers; `max` does not think harder than `xhigh`
* An illegal `reasoning_effort` value returns a 400 listing the full legal set rather than silently downgrading

## Related

* [Qwen3.8-Max overview](/en/api-capabilities/qwen-3-8/overview) — full capability matrix, pricing, and best practices
* [Qwen3.6 series (legacy)](/en/api-capabilities/qwen-3-6/overview) — the previous five models


## OpenAPI

````yaml api-reference/qwen-3-8-max-chat-openapi-en.yaml POST /v1/chat/completions
openapi: 3.1.0
info:
  title: Qwen3.8-Max Chat Completions API
  description: >
    Qwen3.8-Max (`qwen3.8-max`) — OpenAI-compatible Chat Completions endpoint;
    any OpenAI SDK works by switching base_url.


    - Input $1.65 / output $4.95 per 1M tokens (output includes thinking) —
    17.5% below Alibaba Cloud's list price

    - 1M context, 131K max output, native image and video input

    - **Thinking is ON by default** (tier `xhigh`); `reasoning_effort` maps to
    four real tiers in practice: `none` / `minimal`≡`low` / `medium` /
    `high`≡`xhigh`≡`max`

    - `max_tokens` truncates only the visible answer and **does not bound
    thinking tokens** — use `reasoning_effort: "none"` to control cost

    - Supports streaming, function calling, response_format json_schema

    - Forced `tool_choice` and `n > 1` both require `reasoning_effort: "none"`

    - `thinking_budget` values are ignored; built-in web search is unavailable


    **Authentication**: header `Authorization: Bearer YOUR_API_KEY`


    **Get an API Key**: create a token in the APIYI console at
    `api.apiyi.com/token`
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
  - url: https://vip.apiyi.com
    description: Backup endpoint
security:
  - bearerAuth: []
paths:
  /v1/chat/completions:
    post:
      tags:
        - Text Generation
      summary: 'Chat completion: Qwen3.8-Max (OpenAI compatible)'
      description: >
        Run a chat completion with `qwen3.8-max`, fully compatible with the
        OpenAI format.


        The example ships with `reasoning_effort: "none"` — the recommended
        setting for everyday chat,

        which cut output tokens to roughly 1/30 in testing. For hard reasoning,
        drop that field

        (returning to the default `xhigh` tier) and raise `max_tokens` to 4000+.
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
                  content: Introduce yourself in one sentence.
              max_tokens: 1000
              reasoning_effort: none
      responses:
        '200':
          description: Chat completion succeeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ChatResponse'
        '400':
          description: >-
            Invalid parameters. Common causes: forced tool_choice or n > 1 while
            thinking is on; an illegal reasoning_effort value; temperature
            outside [0.0, 2.0); max_tokens outside [1, 131072]
        '401':
          description: Invalid API key
        '429':
          description: Rate limit exceeded
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
          description: Always qwen3.8-max
        messages:
          type: array
          description: Standard OpenAI message array
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
                description: String or multimodal array (text / image_url / video_url)
        max_tokens:
          type: integer
          description: >-
            Output budget for the visible answer, range [1, 131072]. Note: does
            not bound thinking tokens
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
            Thinking tier, default xhigh. Measured to have only four real tiers:
            none / minimal≡low / medium / high≡xhigh≡max
        temperature:
          type: number
          description: Valid range [0.0, 2.0); passing 2 returns 400
        top_p:
          type: number
          description: Valid range (0.0, 1.0]
        top_k:
          type: integer
        stream:
          type: boolean
          description: >-
            SSE streaming. This endpoint returns usage in the final chunk even
            without stream_options
        stop:
          type: array
          description: Stop sequences, verified working
          items:
            type: string
        response_format:
          type: object
          description: >-
            Structured output; json_schema held strictly in testing. Pair it
            with reasoning_effort: none
        tools:
          type: array
          description: Function calling tool list, verified working
          items:
            type: object
        tool_choice:
          description: >-
            auto / none work as-is; required or a named function requires
            reasoning_effort: none
        parallel_tool_calls:
          type: boolean
          description: Set false to limit to a single tool call, verified working
        'n':
          type: integer
          description: 'Number of candidates. Values above 1 require reasoning_effort: none'
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
                    description: Thinking trace, returned while thinking is on
                  tool_calls:
                    type: array
                    items:
                      type: object
              finish_reason:
                type: string
        usage:
          type: object
          description: >-
            Usage stats. Some upstream routes do not report reasoning_tokens or
            cached_tokens
          properties:
            prompt_tokens:
              type: integer
            completion_tokens:
              type: integer
              description: Includes thinking tokens
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
      description: 'Add Authorization: Bearer YOUR_API_KEY to the request header'

````