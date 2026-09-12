> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Interactions API vs generateContent

> A detailed comparison of Google Gemini's two API paradigms — endpoints, request/response structures, state management, thinking, usage fields — with APIYI gateway compatibility test results

Since June 2026, Google has made the **Interactions API** Generally Available and recommends it for all new projects, while the classic **generateContent API** is now considered legacy but remains fully supported. Official docs (such as the Nano Banana image generation page) now offer a toggle between the two paradigms, which leaves many developers wondering: what exactly differs, and which one should I use through APIYI? This page gives a detailed comparison and tested conclusions.

<Info>
  **APIYI gateway status (tested July 4, 2026 (UTC+8))**: the Interactions API is **not yet supported** through the gateway — both `/v1beta2/interactions` and `/v1beta/interactions` return 404. When calling Gemini via APIYI, keep using the [generateContent native format](/en/api-capabilities/gemini/native); all Gemini docs on this site are based on it. We will update this page once the gateway adds Interactions API support.
</Info>

## What the Two Paradigms Are

**generateContent** is the classic stateless interface: one request carries the full context, one response returns the full result, at `POST /v1beta/models/{model}:generateContent`. Google states that "while it is now considered legacy, it remains fully supported."

**The Interactions API** is Google's new interface, GA since June 2026, at `POST /v1beta2/interactions`. It is built around the core `Interaction` resource (one complete conversation turn or task), and the response is a chronological **timeline of execution steps** — model thoughts, tool calls and results, and the final output are all explicit steps. Google is explicit that **new models beyond the core mainline family and new agentic capabilities will launch on the Interactions API going forward** (source: `ai.google.dev/gemini-api/docs/interactions-overview`).

## Core Differences at a Glance

| Dimension                  | generateContent (classic)                                                                            | Interactions API (new)                                                                                                                                                                 |
| -------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Endpoint                   | `POST /v1beta/models/{model}:generateContent`                                                        | `POST /v1beta2/interactions`                                                                                                                                                           |
| Input structure            | `contents[].parts[]` (role-based multimodal parts)                                                   | `input` (string or content blocks; model name in the body)                                                                                                                             |
| Output structure           | `candidates[0].content.parts[]`                                                                      | `steps[]` timeline: `user_input` / `thought` / `function_call` / `function_result` / `model_output`                                                                                    |
| Multi-turn                 | Client resends the **full history** every turn                                                       | `previous_interaction_id` continues server-side (stateless mode also possible)                                                                                                         |
| Thinking                   | `thoughtsTokenCount` counter; image models' interim thinking drafts come back mixed into image parts | Returned explicitly as `steps` (`type: "thought"`), including thought text and interim images                                                                                          |
| Streaming                  | Dedicated `:streamGenerateContent` endpoint                                                          | Same endpoint with `"stream": true` in the body                                                                                                                                        |
| Background execution       | Not supported                                                                                        | `"background": true` for long-running tasks                                                                                                                                            |
| Caching                    | Explicit caching + implicit caching                                                                  | No explicit caching; `previous_interaction_id` significantly improves implicit cache hit rates                                                                                         |
| Server-side data retention | Requests not stored                                                                                  | `store: true` by default: **55 days** on the paid tier, 1 day on the free tier, deletable; `store: false` opts out (but is incompatible with background and previous\_interaction\_id) |
| Usage fields               | `promptTokenCount` / `candidatesTokenCount` / `thoughtsTokenCount` / `totalTokenCount`               | `total_thought_tokens` / `total_output_tokens` etc. (snake\_case)                                                                                                                      |
| Agent calls                | Not supported                                                                                        | Same interface calls official agents such as Deep Research and Antigravity                                                                                                             |
| Not yet available          | — (most complete feature set)                                                                        | Batch API, explicit caching, `video_metadata`, automatic function calling (Python), remote MCP on Gemini 3                                                                             |
| SDK entry point            | `client.models.generate_content` (google-genai)                                                      | `client.interactions.create` (google-genai ≥ 2.3.0 / @google/genai ≥ 2.3.0)                                                                                                            |

<Note>
  A common pitfall with the Interactions API's server-side state: `previous_interaction_id` **only carries over the conversation history**. `tools`, `system_instruction`, and `generation_config` (including `thinking_level`, `temperature`, etc.) are interaction-scoped — you must re-send them on every turn or they silently stop applying.
</Note>

## Request & Response Structures (single text turn)

The generateContent example works directly against the APIYI gateway; the Interactions API example targets Google's endpoint directly (not yet supported by APIYI):

<CodeGroup>
  ```bash generateContent (works on APIYI) theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-2.5-flash:generateContent" \
    -H "Authorization: Bearer $APIYI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [{
        "parts": [{ "text": "Tell me a joke." }]
      }]
    }'
  ```

  ```bash Interactions API (Google direct) theme={null}
  curl -X POST "https://generativelanguage.googleapis.com/v1beta2/interactions" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gemini-3.5-flash",
      "input": "Tell me a joke."
    }'
  ```
</CodeGroup>

How the two response shapes differ for the same request:

<CodeGroup>
  ```json generateContent response theme={null}
  {
    "candidates": [
      {
        "content": {
          "parts": [{ "text": "Why did the chicken cross the road? ..." }],
          "role": "model"
        },
        "finishReason": "STOP",
        "index": 0
      }
    ],
    "usageMetadata": {
      "promptTokenCount": 4,
      "candidatesTokenCount": 12,
      "totalTokenCount": 16
    }
  }
  ```

  ```json Interactions API response theme={null}
  {
    "id": "int_123",
    "status": "completed",
    "steps": [
      {
        "type": "user_input",
        "status": "done",
        "content": [{ "type": "text", "text": "Tell me a joke." }]
      },
      {
        "type": "model_output",
        "status": "done",
        "content": [{ "type": "text", "text": "Why did the chicken cross the road?" }]
      }
    ]
  }
  ```
</CodeGroup>

## Multi-turn Conversations Compared

This is where the two paradigms feel most different. generateContent requires resending the **entire history** every turn; the Interactions API only needs the previous turn's `id`:

<CodeGroup>
  ```bash generateContent (resend full history) theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-2.5-flash:generateContent" \
    -H "Authorization: Bearer $APIYI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [
        { "role": "user",  "parts": [{ "text": "Hi, my name is Phil." }] },
        { "role": "model", "parts": [{ "text": "Hello Phil! How can I help?" }] },
        { "role": "user",  "parts": [{ "text": "What is my name?" }] }
      ]
    }'
  ```

  ```bash Interactions API (server-side continuation) theme={null}
  curl -X POST "https://generativelanguage.googleapis.com/v1beta2/interactions" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gemini-3.5-flash",
      "previous_interaction_id": "int_123",
      "input": "What is my name?"
    }'
  ```
</CodeGroup>

Beyond saving history-plumbing code, server-side continuation makes it much easier for implicit caching to hit the conversation prefix — Google says this lowers token costs in multi-turn scenarios. The trade-off is that data is stored on Google's side by default (55 days on the paid tier); businesses with data-compliance requirements should evaluate the `store` semantics.

## Differences for Image Models

Gemini 3 image models (such as `gemini-3-pro-image`) think by default, and the two paradigms present the "interim thinking drafts" completely differently:

* **generateContent (APIYI's current gateway format)**: interim thinking drafts come back as **ordinary image parts** inside `candidates[0].content.parts` (with `thoughtSignature`, without a `thought` flag). In testing a single response can contain 2–10 images, each billed at 1120/2000 tokens into the output — always iterate over parts and **take the last one as the final version**. Full measurements and reconciliation rules: [Usage Fields & Output Explained](/en/api-capabilities/nano-banana-usage-metadata).
* **Interactions API**: thinking is made explicit as `type: "thought"` steps (thought text and interim images), with the final image in the `model_output` step; the SDKs also provide `.output_image` / `.output_text` convenience properties. Interleaved text-and-image output (e.g. illustrated stories) still requires manually iterating over steps.

## APIYI Gateway Compatibility Test

Probed against `api.apiyi.com` with a test key on July 4, 2026 (UTC+8):

| Test                                                 | Request                            | Result                                                 |
| ---------------------------------------------------- | ---------------------------------- | ------------------------------------------------------ |
| `POST /v1beta2/interactions` + Bearer auth           | minimal `gemini-2.5-flash` request | ❌ 404 (Invalid URL)                                    |
| `POST /v1beta/interactions` + Bearer auth            | same                               | ❌ 404 (Invalid URL)                                    |
| `POST /v1beta2/interactions` + `x-goog-api-key` auth | same                               | ❌ 404 (Invalid URL)                                    |
| `POST /v1beta/models/{model}:generateContent`        | text/image models                  | ✅ Works (all Gemini docs on this site are based on it) |

**Conclusion: the APIYI gateway does not yet forward the Interactions API**, so Interactions-only capabilities — server-side continuation, agent calls, background execution — are currently unavailable through the gateway.

## Recommendations

1. **Via APIYI: keep using generateContent.** It has the most complete feature set (Batch, explicit caching, and video\_metadata are in fact generateContent-only), and Google has committed to fully supporting it — there is no near-term deprecation risk.
2. **Multi-turn with generateContent**: assemble the history client-side; see [Gemini Native Format](/en/api-capabilities/gemini/native) and [Multi-turn Conversations](/en/api-capabilities/multi-turn-conversation).
3. **If you call Google directly and consider migrating to the Interactions API**, watch four things: `tools` / `system_instruction` / `generation_config` must be re-sent every turn; `store` defaults to on with 55-day retention on the paid tier; Batch API and explicit caching are not yet available; upgrade google-genai / @google/genai to 2.3.0+.
4. **When the Interactions API becomes worth watching**: when you need official agents (Deep Research, Antigravity), `background: true` long-running tasks, or want server-side state to cut multi-turn token costs. We will update this page as soon as APIYI adds support.

## Related Docs

<CardGroup cols={2}>
  <Card title="Gemini Native Format" icon="sparkles" href="/en/api-capabilities/gemini/native">
    The complete guide to the generateContent native format via APIYI
  </Card>

  <Card title="Gemini Response Handling" icon="braces" href="/en/api-capabilities/gemini/response-handling">
    Parsing candidates, parts, and finishReason correctly
  </Card>

  <Card title="Usage Fields & Output Explained" icon="receipt-text" href="/en/api-capabilities/nano-banana-usage-metadata">
    Image-model usageMetadata semantics and measured thinking-draft behavior
  </Card>

  <Card title="Multi-turn Conversations" icon="messages-square" href="/en/api-capabilities/multi-turn-conversation">
    Implementing multi-turn chat on a stateless interface
  </Card>
</CardGroup>
