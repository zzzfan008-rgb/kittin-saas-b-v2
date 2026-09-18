> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seed 2.1 Turbo Responses API Reference

> Seed 2.1 Turbo (dola-seed-2-1-turbo-260628) Responses API reference and interactive playground: native multi-turn previous_response_id and chained explicit caching.

<Info>
  Use the Playground on the right: put `Bearer sk-your-api-key` in **Authorization**, fill in `input`, and send. In the response `output` array, `type: "reasoning"` items are thinking summaries — `type: "message"` is the actual answer.
</Info>

<Tip>
  For multi-turn conversations, pass the previous response's `id` (`resp_` prefix) as the next call's `previous_response_id` — no need to resend history. Explicit caching and thinking control are covered in the [Seed 2.1 Turbo Overview](/en/api-capabilities/dola-seed-2-1-turbo/overview).
</Tip>

<Warning>
  * A small `max_output_tokens` gets eaten by thinking, returning `status: "incomplete"` with **empty text** — start at 1500
  * Explicit caching `caching: {"type": "enabled"}` only hits when **chained** via `previous_response_id`; merely repeating the same prefix never hits (and disables the implicit prefix cache too)
</Warning>

## Parameter Quick Reference

| Parameter              | Type           | Required | Default    | Notes                                                                                |
| ---------------------- | -------------- | -------- | ---------- | ------------------------------------------------------------------------------------ |
| `model`                | string         | ✓        | —          | Fixed: `dola-seed-2-1-turbo-260628`                                                  |
| `input`                | string / array | ✓        | —          | String or message array (including `function_call_output` items)                     |
| `max_output_tokens`    | int            |          | —          | Output budget including thinking; 1500+ recommended                                  |
| `reasoning.effort`     | string         |          | —          | `low` / `medium` / `high`; measured \~371 (low) vs \~1317 (high) reasoning tokens    |
| `previous_response_id` | string         |          | —          | Previous response id for native multi-turn; enables full-context explicit cache hits |
| `caching.type`         | string         |          | `disabled` | `enabled` turns on explicit caching (requires chaining)                              |
| `store`                | bool           |          | `true`     | Store this response for later reference                                              |
| `stream`               | bool           |          | `false`    | SSE event stream (`response.created` → `response.completed`)                         |
| `text.format`          | object         |          | —          | Structured output, supports `json_schema` + `strict`                                 |
| `tools`                | array          |          | —          | Function-calling tool list (flat format)                                             |

## Response Highlights

* When `status` is `incomplete`, check `incomplete_details.reason` (usually `length`: thinking ate the budget)
* Thinking spend: `usage.output_tokens_details.reasoning_tokens`
* Cache hits: `usage.input_tokens_details.cached_tokens` (chained turn 2 hit the full prior context in our tests, roughly halving latency)
* The response `caching` field echoes the cache mode actually in effect


## OpenAPI

````yaml api-reference/dola-seed-2-1-turbo-responses-openapi-en.yaml POST /v1/responses
openapi: 3.1.0
info:
  title: Seed 2.1 Turbo Responses API
  description: >
    ByteDance Seed 2.1 Turbo (`dola-seed-2-1-turbo-260628`) — native Responses
    API endpoint.


    - Full Responses semantics: event stream, reasoning items, multi-turn via
    `previous_response_id`

    - **Explicit caching**: `caching: {"type": "enabled"}` combined with
    `previous_response_id` chaining hits the entire previous context on turn 2
    (measured: 7873 cached tokens, ~2x faster)

    - Reasoning is on by default: a small `max_output_tokens` gets eaten by
    thinking, yielding `status: incomplete` with empty text - use 1500+

    - Supports `reasoning.effort` tiers, structured output (`text.format`), and
    function calling


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
  /v1/responses:
    post:
      tags:
        - Text Generation
      summary: Responses API with Seed 2.1 Turbo (native multi-turn / explicit cache)
      description: >
        Call the Responses API with `dola-seed-2-1-turbo-260628`.


        - For multi-turn conversations pass `previous_response_id` instead of
        resending history

        - With `caching.enabled`, cache hits require `previous_response_id`
        chaining; merely repeating the same prefix does not hit
      operationId: createSeedResponse
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SeedResponsesRequest'
            example:
              model: dola-seed-2-1-turbo-260628
              input: Introduce yourself in one sentence
              max_output_tokens: 1500
      responses:
        '200':
          description: >-
            Generation succeeded. The output array contains reasoning and
            message items
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SeedResponsesResponse'
        '400':
          description: Invalid parameters
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
    SeedResponsesRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: Model ID, fixed to dola-seed-2-1-turbo-260628
          enum:
            - dola-seed-2-1-turbo-260628
          default: dola-seed-2-1-turbo-260628
        input:
          type: string
          description: >-
            Input content. Either a string or a message array ([{role, content},
            ...], including function_call_output items)
          example: Introduce yourself in one sentence
        max_output_tokens:
          type: integer
          description: >-
            Max output tokens (thinking included). Too small yields incomplete
            with empty text - use 1500+
          default: 1500
        reasoning:
          type: object
          description: >-
            Thinking depth control. Measured: effort low ~371, high ~1317
            reasoning tokens
          properties:
            effort:
              type: string
              enum:
                - low
                - medium
                - high
        previous_response_id:
          type: string
          description: >-
            Previous response id (resp_ prefix) for native multi-turn; combine
            with caching.enabled for explicit cache hits
        caching:
          type: object
          description: >-
            Explicit cache switch. enabled only hits when chained via
            previous_response_id
          properties:
            type:
              type: string
              enum:
                - enabled
                - disabled
        store:
          type: boolean
          description: >-
            Whether to store this response for later previous_response_id
            reference
        stream:
          type: boolean
          description: >-
            Stream via SSE (response.created → response.output_text.delta →
            response.completed)
          default: false
        text:
          type: object
          description: >-
            Structured output. Supports {"format": {"type": "json_schema", name,
            strict, schema}}
        tools:
          type: array
          description: >-
            Function-calling tool list (flat Responses format: {type, name,
            description, parameters})
          items:
            type: object
    SeedResponsesResponse:
      type: object
      properties:
        id:
          type: string
          description: >-
            Response ID (resp_ prefix), usable as the next turn's
            previous_response_id
        status:
          type: string
          description: >-
            completed / incomplete (incomplete when thinking eats the token
            budget)
        output:
          type: array
          description: >-
            Output items: reasoning (thinking summary), message (text),
            function_call, etc.
          items:
            type: object
        usage:
          type: object
          description: >-
            Usage. output_tokens_details.reasoning_tokens = thinking spend;
            input_tokens_details.cached_tokens = cache hits
        caching:
          type: object
          description: The cache mode actually in effect for this request
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key from the APIYI console

````