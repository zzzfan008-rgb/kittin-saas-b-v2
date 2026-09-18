> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash Responses API Reference

> DeepSeek V4 Flash GA (deepseek-v4-flash-ga-260731) Responses API reference and playground: chained explicit caching that hits the entire prior context on every round.

<Info>
  Use the playground on the right to test directly: put `Bearer sk-your-api-key` in
  **Authorization**. The default example already carries `caching: {"type": "enabled"}` and
  `store: true` — the first-call write shape for chained explicit caching.
</Info>

<Tip>
  Responses adds an **explicit cache** layer over Chat Completions. For capabilities, pricing
  and thinking control, see the
  [DeepSeek V4 Flash overview](/en/api-capabilities/deepseek-v4-flash/overview).
</Tip>

<Warning>
  * **`text.format` json\_schema has no effect**: returns 200 while ignoring the schema; 3/3 responses were wrapped in code fences and failed to parse
  * **`web_search` backend is unusable**: the tool is wired (`web_search_call` items appear with `status: completed`) but 6/6 searches errored and returned no `results`
  * **`mcp` returns `AccessDenied`**: an account/channel-level built-in-tool entitlement — a valid server URL gives the same result
  * Text-only model — passing images returns `Model do not support image input`
</Warning>

## Parameter Quick Reference

| Parameter              | Type           | Required | Default | Notes                                                                       |
| ---------------------- | -------------- | -------- | ------- | --------------------------------------------------------------------------- |
| `model`                | string         | ✓        | —       | Fixed to `deepseek-v4-flash-ga-260731`                                      |
| `input`                | string / array | ✓        | —       | String or standard Responses message array, text only                       |
| `max_output_tokens`    | int            |          | —       | Hard ceiling 393,216; reasoning counts toward it                            |
| `store`                | bool           |          | `true`  | Must be true to chain                                                       |
| `previous_response_id` | string         |          | —       | The prior response `id`; combined with `caching` it hits the explicit cache |
| `caching.type`         | string         |          | —       | `enabled` writes the explicit cache; the response echoes this field         |
| `reasoning.effort`     | string         |          | —       | `minimal` yields 0 reasoning tokens; other tiers are not monotonic          |
| `stream`               | bool           |          | `false` | SSE streaming, measured TTFB around 2.31s                                   |
| `tools`                | array          |          | —       | `function` works; see the warning above for `web_search` / `mcp`            |

## Explicit Cache: Chaining Is Required

<Warning>
  **Common mistake**: resending the same long prefix twice with `caching` set leaves
  `cached_tokens` at 0. The explicit cache is **not** prefix-matched — you must chain the
  session with `previous_response_id`.
</Warning>

The correct pattern: send the full document on the first call to write the cache, then send
only the new question while chaining the previous `id`.

| Round     | Call shape                         | input\_tokens | cached\_tokens | Latency |
| --------- | ---------------------------------- | ------------- | -------------- | ------- |
| 1 (write) | `caching: enabled` + `store: true` | 15,629        | 0              | 4.10s   |
| 2         | + `previous_response_id`           | 15,664        | **15,629**     | 5.18s   |
| 3         | + `previous_response_id`           | 15,701        | **15,664**     | 4.57s   |
| 4         | + `previous_response_id`           | 15,738        | **15,701**     | 4.54s   |

Each round hits the entire prior context. For follow-up questions over a long document, this
is far cheaper than resending the full text every turn.

### Chained Call Example

```python theme={null}
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["APIYI_API_KEY"],
    base_url="https://api.apiyi.com/v1",
)

long_doc = open("report.md").read()

# Round 1: write the cache
first = client.responses.create(
    model="deepseek-v4-flash-ga-260731",
    input=long_doc + "\n\nSummarize the core conclusions of this report.",
    max_output_tokens=800,
    store=True,
    extra_body={"caching": {"type": "enabled"}},
)
print(first.output_text)

# Round 2 onward: send only the new question, chaining the prior id
second = client.responses.create(
    model="deepseek-v4-flash-ga-260731",
    input="What risks are mentioned in section three?",
    previous_response_id=first.id,
    max_output_tokens=800,
    store=True,
    extra_body={"caching": {"type": "enabled"}},
)
print(second.output_text)
print("Cache hit:", second.usage.input_tokens_details.cached_tokens)
```

## Implicit Cache

Without `caching`, the implicit cache still applies: repeating an identical long prefix hit
99.9% (15,633 → 15,616). Choose per scenario — **one prefix reused across many independent
requests** suits the implicit cache, while **one session with successive follow-ups** suits
chained explicit caching.

## Output Item Types

The response `output` is an array that may contain these items:

| type              | Notes                                                                |
| ----------------- | -------------------------------------------------------------------- |
| `reasoning`       | Reasoning content (appears when `reasoning.effort` is not `minimal`) |
| `message`         | Final answer; text lives in `content[].text`                         |
| `function_call`   | Tool call with `call_id` and `arguments`                             |
| `web_search_call` | Search call record — **currently carries no `results` field**        |


## OpenAPI

````yaml api-reference/deepseek-v4-flash-responses-openapi-en.yaml POST /v1/responses
openapi: 3.1.0
info:
  title: DeepSeek V4 Flash Responses API
  description: >
    DeepSeek V4 Flash GA (`deepseek-v4-flash-ga-260731`) — OpenAI-compatible
    Responses endpoint.


    Compared with Chat Completions, Responses adds a second caching layer —
    **explicit cache**:


    - Write the cache on the first call with `caching: {"type": "enabled"}`

    - Chain subsequent calls via `previous_response_id`; each round hits the
    entire prior context

    - Note: resending the same long prefix twice will **not** hit the explicit
    cache — you must chain


    Known unavailable: `text.format` json_schema is accepted but does not
    constrain the schema;

    the `web_search` tool is wired but its backend keeps erroring; the `mcp`
    tool returns `AccessDenied`.


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
  /v1/responses:
    post:
      tags:
        - Text Generation
      summary: >-
        Responses: DeepSeek V4 Flash text generation (with chained explicit
        cache)
      description: >
        Call the Responses endpoint with `deepseek-v4-flash-ga-260731`.


        Typical multi-turn long-context pattern:


        1. First call: send the full long document plus `caching: {"type":
        "enabled"}` and `store: true`

        2. Record the `id` from the response

        3. Later calls: send only the new question plus `previous_response_id` —
        the prior context hits the cache in full
      operationId: createDeepSeekV4FlashResponse
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DeepSeekV4FlashResponsesRequest'
            example:
              model: deepseek-v4-flash-ga-260731
              input: Explain the MoE architecture in one sentence.
              max_output_tokens: 500
              store: true
              caching:
                type: enabled
      responses:
        '200':
          description: Generation succeeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DeepSeekV4FlashResponsesResponse'
        '400':
          description: >-
            Invalid parameters. Common causes: input above 1,048,570 tokens, or
            image content (returns Model do not support image input)
        '401':
          description: Unauthorized - invalid API Key
        '403':
          description: >-
            No built-in tool entitlement (returns AccessDenied when using mcp
            and similar built-in tools)
        '429':
          description: Rate limit exceeded or insufficient balance
      security:
        - bearerAuth: []
components:
  schemas:
    DeepSeekV4FlashResponsesRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: Model ID, fixed to deepseek-v4-flash-ga-260731
          enum:
            - deepseek-v4-flash-ga-260731
          default: deepseek-v4-flash-ga-260731
        input:
          description: >-
            Input content. Either a string or a standard OpenAI Responses
            message array. Text only — no images
          oneOf:
            - type: string
            - type: array
              items:
                type: object
        max_output_tokens:
          type: integer
          description: >-
            Max output tokens, hard ceiling 393,216. Reasoning counts toward
            this
          default: 500
          maximum: 393216
        store:
          type: boolean
          description: >-
            Whether to store this response. Must be true to chain with
            previous_response_id
          default: true
        previous_response_id:
          type: string
          description: >-
            The id of the previous response. Combined with caching, this hits
            the explicit cache in full
        caching:
          type: object
          description: >-
            Explicit cache switch. Pass {"type": "enabled"} on the first call to
            write, then chain with previous_response_id to hit
          properties:
            type:
              type: string
              enum:
                - enabled
                - disabled
              default: enabled
        reasoning:
          type: object
          description: >-
            Reasoning control. Measured: effort=minimal always yields 0
            reasoning tokens; the other tiers do not form a monotonic ladder
          properties:
            effort:
              type: string
              enum:
                - minimal
                - low
                - medium
                - high
                - max
        stream:
          type: boolean
          description: Stream the response over SSE. Measured TTFB around 2.3 seconds
          default: false
        tools:
          type: array
          description: >-
            Tool list. The function type works; web_search is wired but its
            backend errors, and mcp returns AccessDenied
          items:
            type: object
    DeepSeekV4FlashResponsesResponse:
      type: object
      properties:
        id:
          type: string
          description: Response ID, used as the next call's previous_response_id
        model:
          type: string
        output:
          type: array
          description: >-
            Output item array. May contain reasoning / message / function_call /
            web_search_call items
          items:
            type: object
        caching:
          type: object
          description: Explicit cache status echo
        usage:
          type: object
          description: >-
            Usage. input_tokens_details.cached_tokens is the cache hit;
            output_tokens_details.reasoning_tokens is reasoning spend
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key obtained from the APIYI console

````