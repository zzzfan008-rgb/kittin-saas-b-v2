> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash Chat API Reference

> DeepSeek V4 Flash GA (deepseek-v4-flash-ga-260731) Chat Completions API reference and playground: OpenAI-compatible, 1M context, thinking toggle and implicit caching.

<Info>
  Use the playground on the right to test directly: put `Bearer sk-your-api-key` in
  **Authorization**. The default example already disables deep thinking
  (`thinking.disabled`), so you get a fast response on send.
</Info>

<Tip>
  This model **thinks a lot by default** — even a one-line question emits hundreds of reasoning
  tokens first. Keep `"thinking": {"type": "disabled"}` from the example while debugging.
  For capabilities, pricing and caching, see the
  [DeepSeek V4 Flash overview](/en/api-capabilities/deepseek-v4-flash/overview).
</Tip>

<Warning>
  * When thinking is on, give `max_tokens` room (reasoning counts toward the output quota) — 3000+ recommended
  * **`response_format` has no effect**: passing `json_schema` returns 200 while ignoring the schema entirely. Use `tools` for structured output
  * **`n` is silently ignored**: passing `n=2` returns 200 with exactly one element in `choices`
  * Text-only model — passing image content blocks returns `Model do not support image input`
</Warning>

## Parameter Quick Reference

| Parameter               | Type   | Required | Default   | Notes                                                                                                         |
| ----------------------- | ------ | -------- | --------- | ------------------------------------------------------------------------------------------------------------- |
| `model`                 | string | ✓        | —         | Fixed to `deepseek-v4-flash-ga-260731`                                                                        |
| `messages`              | array  | ✓        | —         | Standard OpenAI message array, text only                                                                      |
| `max_tokens`            | int    |          | —         | Output quota, hard ceiling 393,216; 3000+ when thinking is on                                                 |
| `thinking.type`         | string |          | `enabled` | `disabled` reliably turns thinking off; `auto` also accepted                                                  |
| `reasoning_effort`      | string |          | —         | Only `minimal` is deterministic (0 reasoning tokens); low/medium/high/max are **not monotonic**, see overview |
| `stream`                | bool   |          | `false`   | SSE streaming; pair with `stream_options.include_usage` for usage                                             |
| `temperature` / `top_p` | number |          | —         | Sampling parameters, both effective                                                                           |
| `stop`                  | array  |          | —         | Stop sequences, verified to truncate                                                                          |
| `seed` / `logprobs`     | —      |          | —         | Both effective                                                                                                |
| `tools`                 | array  |          | —         | Function Call — **tool arguments are genuinely constrained**                                                  |

## Context and Output Ceilings

| Item                | Hard ceiling     | Error raised                                              |
| ------------------- | ---------------- | --------------------------------------------------------- |
| Input               | 1,048,570 tokens | `Input length ... exceeds the maximum length 1048570`     |
| Output `max_tokens` | 393,216          | `integer above maximum value, expected a value <= 393216` |

A 322,055-token input returned in 14.77 seconds with the mid-document needle retrieved correctly.

## Implicit Cache

No parameters needed — an identical long prefix hits on the second request:

| Round | prompt\_tokens | cached\_tokens | Hit rate |
| ----- | -------------- | -------------- | -------- |
| 1     | 15,634         | 0              | —        |
| 2     | 15,634         | 15,616         | 99.9%    |
| 3     | 15,634         | 15,616         | 99.9%    |

Cached tokens bill at \$0.028 per million. Keep timestamps, random IDs and other variable
content at the end of the prompt — mixing them into the prefix drops the hit rate to zero.

## Need Structured Output? Use tools

```json theme={null}
{
  "model": "deepseek-v4-flash-ga-260731",
  "messages": [{"role": "user", "content": "Beijing is 25 degrees today"}],
  "tools": [{
    "type": "function",
    "function": {
      "name": "submit_result",
      "parameters": {
        "type": "object",
        "properties": {
          "city": {"type": "string"},
          "temp_c": {"type": "number"}
        },
        "required": ["city", "temp_c"]
      }
    }
  }]
}
```

Take the JSON string from `choices[0].message.tool_calls[0].function.arguments` — it parses reliably.


## OpenAPI

````yaml api-reference/deepseek-v4-flash-chat-openapi-en.yaml POST /v1/chat/completions
openapi: 3.1.0
info:
  title: DeepSeek V4 Flash Chat Completions API
  description: >
    DeepSeek V4 Flash GA (`deepseek-v4-flash-ga-260731`) — OpenAI-compatible
    Chat Completions endpoint.


    - **1M context**: hard input ceiling of 1,048,570 tokens, max output 393,216
    tokens

    - **Thinks a lot by default**: for simple tasks pass `thinking: {"type":
    "disabled"}` or `reasoning_effort: "minimal"`

    - **Implicit cache works automatically**: an identical long prefix hits on
    the second request, measured at 99.9%

    - **Structured output is not supported**: `response_format` is accepted but
    does not constrain the schema — use Function Call when you need enforcement

    - **Text-only model**: image input is rejected


    **Authentication**: add `Authorization: Bearer YOUR_API_KEY` to the request
    headers


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
      summary: 'Chat completion: DeepSeek V4 Flash text generation'
      description: >
        Run a chat completion with `deepseek-v4-flash-ga-260731`, fully
        OpenAI-compatible.


        - When thinking is on, the response carries a `reasoning_content` field
        and reasoning counts toward `max_tokens`

        - The example disables thinking for quick debugging; switch to `enabled`
        for complex reasoning

        - The `n` parameter is silently ignored (always returns exactly one
        choice)
      operationId: createDeepSeekV4FlashChatCompletion
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DeepSeekV4FlashChatRequest'
            example:
              model: deepseek-v4-flash-ga-260731
              messages:
                - role: user
                  content: Introduce yourself in one sentence
              max_tokens: 500
              thinking:
                type: disabled
      responses:
        '200':
          description: Completion succeeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DeepSeekV4FlashChatResponse'
        '400':
          description: >-
            Invalid parameters. Common causes: input above 1,048,570 tokens,
            max_tokens above 393,216, or image content passed in
        '401':
          description: Unauthorized - invalid API Key
        '429':
          description: Rate limit exceeded or insufficient balance
        '503':
          description: Wrong model name, or no available channel in the group
      security:
        - bearerAuth: []
components:
  schemas:
    DeepSeekV4FlashChatRequest:
      type: object
      required:
        - model
        - messages
      properties:
        model:
          type: string
          description: Model ID, fixed to deepseek-v4-flash-ga-260731
          enum:
            - deepseek-v4-flash-ga-260731
          default: deepseek-v4-flash-ga-260731
        messages:
          type: array
          description: >-
            Message array in standard OpenAI format. Text only — image content
            blocks are not supported
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
            Max output tokens, hard ceiling 393,216. Reasoning counts toward
            this when thinking is on
          default: 500
          maximum: 393216
        thinking:
          type: object
          description: >-
            Deep thinking switch. Passing {"type": "disabled"} saved 200+
            reasoning tokens on simple tasks in our tests
          properties:
            type:
              type: string
              enum:
                - enabled
                - disabled
                - auto
              default: disabled
        reasoning_effort:
          type: string
          description: >-
            Reasoning depth tier. Only minimal is deterministic (reasoning
            tokens always 0); low/medium/high/max do not form a monotonic
            ladder, and within-tier variance exceeds between-tier differences
          enum:
            - minimal
            - low
            - medium
            - high
            - max
        stream:
          type: boolean
          description: >-
            Stream the response over SSE. Pair with stream_options.include_usage
            to get usage at the end
          default: false
        temperature:
          type: number
          description: Sampling temperature
        top_p:
          type: number
          description: Nucleus sampling threshold
        stop:
          type: array
          description: Stop sequences, verified to truncate correctly
          items:
            type: string
        seed:
          type: integer
          description: Random seed
        logprobs:
          type: boolean
          description: Return token log probabilities, verified to be populated
        tools:
          type: array
          description: >-
            Function Call tool list in standard OpenAI format. Tool arguments
            are genuinely constrained — use this instead of response_format when
            you need structured output
          items:
            type: object
    DeepSeekV4FlashChatResponse:
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
            Usage. completion_tokens_details.reasoning_tokens is reasoning
            spend; prompt_tokens_details.cached_tokens is the implicit cache hit
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key obtained from the APIYI console

````