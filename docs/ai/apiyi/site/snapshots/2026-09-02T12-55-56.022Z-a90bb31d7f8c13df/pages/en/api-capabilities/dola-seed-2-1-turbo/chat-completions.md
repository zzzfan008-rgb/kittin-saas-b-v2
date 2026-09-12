> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seed 2.1 Turbo Chat API Reference

> Seed 2.1 Turbo (dola-seed-2-1-turbo-260628) Chat Completions API reference and interactive playground: OpenAI-compatible, with thinking toggle and tiers.

<Info>
  Use the Playground on the right: put `Bearer sk-your-api-key` in **Authorization**. The default example has deep thinking disabled (`thinking.disabled`) so you get a fast response on the first send.
</Info>

<Tip>
  The model has **deep thinking ON by default** — even simple questions produce hundreds of reasoning tokens first. Keep `"thinking": {"type": "disabled"}` from the example while debugging; switch to `reasoning_effort` (low / medium / high) when you actually need reasoning. Capabilities, pricing, and caching are covered in the [Seed 2.1 Turbo Overview](/en/api-capabilities/dola-seed-2-1-turbo/overview).
</Tip>

<Warning>
  * With thinking on, give `max_tokens` headroom (reasoning counts against the output budget) — 3000+ recommended
  * A misspelled model name returns **503** (no available channel), not 404
</Warning>

## Parameter Quick Reference

| Parameter          | Type   | Required | Default   | Notes                                                                            |
| ------------------ | ------ | -------- | --------- | -------------------------------------------------------------------------------- |
| `model`            | string | ✓        | —         | Fixed: `dola-seed-2-1-turbo-260628`                                              |
| `messages`         | array  | ✓        | —         | Standard OpenAI message array                                                    |
| `max_tokens`       | int    |          | —         | Output budget; 3000+ with thinking on                                            |
| `thinking.type`    | string |          | `enabled` | **ON by default**; `disabled` turns thinking off                                 |
| `reasoning_effort` | string |          | —         | `low` / `medium` / `high`; measured \~226 (low) vs \~960 (high) reasoning tokens |
| `stream`           | bool   |          | `false`   | SSE streaming; add `stream_options.include_usage` for usage                      |
| `response_format`  | object |          | —         | Structured output, supports `json_schema` + `strict`                             |
| `tools`            | array  |          | —         | Function-calling tool list                                                       |

## Response Highlights

* With thinking on, `choices[0].message` carries `reasoning_content` (full reasoning text) besides `content`
* Thinking spend: `usage.completion_tokens_details.reasoning_tokens`
* Implicit cache hits: `usage.prompt_tokens_details.cached_tokens` (a repeated long prefix hits from the 2nd request)


## OpenAPI

````yaml api-reference/dola-seed-2-1-turbo-chat-openapi-en.yaml POST /v1/chat/completions
openapi: 3.1.0
info:
  title: Seed 2.1 Turbo Chat Completions API
  description: >
    ByteDance Seed 2.1 Turbo (`dola-seed-2-1-turbo-260628`) — OpenAI-compatible
    Chat Completions endpoint.


    - **Deep thinking is ON by default**: without extra params the model returns
    `reasoning_content` and burns extra tokens; pass `thinking: {"type":
    "disabled"}` for latency/cost-sensitive calls

    - Supports `reasoning_effort` tiers (low / medium / high) to control
    thinking depth

    - Supports structured output (`response_format: json_schema`), function
    calling, and streaming

    - Implicit caching is automatic: a repeated long prefix hits `cached_tokens`
    from the 2nd request


    **Authentication**: add `Authorization: Bearer YOUR_API_KEY` header


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
      summary: Chat completion with Seed 2.1 Turbo
      description: >
        Run chat completions with `dola-seed-2-1-turbo-260628`, fully
        OpenAI-compatible.


        - Deep thinking is enabled by default and adds a `reasoning_content`
        field; the example disables it for fast debugging

        - With thinking enabled, give `max_tokens` generous headroom (reasoning
        counts against it)
      operationId: createSeedChatCompletion
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SeedChatRequest'
            example:
              model: dola-seed-2-1-turbo-260628
              messages:
                - role: user
                  content: Introduce yourself in one sentence
              max_tokens: 500
              thinking:
                type: disabled
      responses:
        '200':
          description: Chat completion succeeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SeedChatResponse'
        '400':
          description: Invalid parameters (e.g. malformed json_schema, wrong types)
        '401':
          description: Unauthorized - invalid API Key
        '429':
          description: Rate limit exceeded or insufficient balance
        '503':
          description: >-
            Wrong model name or no available channel for your group (this model
            returns 503 instead of 404 for unknown model names)
      security:
        - bearerAuth: []
components:
  schemas:
    SeedChatRequest:
      type: object
      required:
        - model
        - messages
      properties:
        model:
          type: string
          description: Model ID, fixed to dola-seed-2-1-turbo-260628
          enum:
            - dola-seed-2-1-turbo-260628
          default: dola-seed-2-1-turbo-260628
        messages:
          type: array
          description: Conversation messages, standard OpenAI format
          items:
            type: object
            required:
              - role
              - content
            properties:
              role:
                type: string
                description: Message role
                enum:
                  - system
                  - user
                  - assistant
                  - tool
              content:
                type: string
                description: Message content
        max_tokens:
          type: integer
          description: >-
            Max output tokens. Reasoning counts against this too - give it
            headroom (e.g. 2000+) when thinking is on
          default: 500
        thinking:
          type: object
          description: >-
            Deep-thinking switch. ON by default; pass {"type": "disabled"} to
            turn it off and cut latency and output tokens sharply
          properties:
            type:
              type: string
              enum:
                - enabled
                - disabled
              default: disabled
        reasoning_effort:
          type: string
          description: >-
            Thinking depth tier (do not combine with thinking.disabled).
            Measured: low ~226, high ~960 reasoning tokens
          enum:
            - low
            - medium
            - high
        stream:
          type: boolean
          description: >-
            Stream via SSE. Combine with stream_options.include_usage to get
            usage in the final chunk
          default: false
        temperature:
          type: number
          description: Sampling temperature
        response_format:
          type: object
          description: >-
            Structured output. Supports {"type": "json_schema", "json_schema":
            {name, strict, schema}}
        tools:
          type: array
          description: Function-calling tool list, standard OpenAI format
          items:
            type: object
    SeedChatResponse:
      type: object
      properties:
        id:
          type: string
          description: Request ID
        model:
          type: string
        choices:
          type: array
          description: >-
            Completion results. Besides content, message carries
            reasoning_content when thinking is on
          items:
            type: object
        usage:
          type: object
          description: >-
            Usage. completion_tokens_details.reasoning_tokens = thinking spend;
            prompt_tokens_details.cached_tokens = implicit cache hits
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key from the APIYI console

````