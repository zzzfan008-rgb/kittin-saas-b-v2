> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Native Format: Streaming & Non-Streaming Responses

> Response structure of Anthropic's native /v1/messages: the content block array, the named-event SSE protocol, plus how to parse each and a field reference.

When you call [Claude's native format](/en/api-capabilities/claude) (`/v1/messages`), the response is **completely different** from OpenAI compatible mode: the answer is a typed `content` block array, and streaming uses Anthropic's **named-event SSE protocol**. This page explains how to parse both modes.

<Info>
  The request side (endpoint, `anthropic-version` header, `x-api-key` auth, effort / thinking params) is covered in [Claude API Basics](/en/api-capabilities/claude) and the [Claude Effort & Thinking Guide](/en/api-capabilities/claude-effort-thinking). This page is purely about the **response side**. Examples use the lightweight model `claude-haiku-4-5-20251001`.
</Info>

## Non-streaming response

The top level is a `message` object, and **the answer lives in the `content` array**, split into blocks by `type`:

```json theme={null}
{
  "id": "msg_bdrk_xxx",
  "type": "message",
  "role": "assistant",
  "model": "claude-haiku-4-5-20251001",
  "content": [
    { "type": "text", "text": "1+1 equals 2." }
  ],
  "stop_reason": "end_turn",
  "stop_sequence": null,
  "usage": {
    "input_tokens": 26,
    "output_tokens": 11,
    "cache_creation_input_tokens": 0,
    "cache_read_input_tokens": 0
  }
}
```

Getting the answer means **iterating the `content` array** — you can't read a single string field like in OpenAI:

<CodeGroup>
  ```python Python theme={null}
  import requests

  resp = requests.post(
      "https://api.apiyi.com/v1/messages",
      headers={
          "content-type": "application/json",
          "anthropic-version": "2023-06-01",
          "x-api-key": "YOUR_API_KEY",
      },
      json={
          "model": "claude-haiku-4-5-20251001",
          "max_tokens": 100,
          "messages": [{"role": "user", "content": "What is 1+1?"}],
      },
      timeout=60,
  )
  data = resp.json()
  for block in data["content"]:
      if block["type"] == "text":
          print(block["text"])
      elif block["type"] == "thinking":      # only present when thinking is on
          print("[thinking]", block["thinking"])
  print(data["usage"])
  ```

  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/messages \
    -H "content-type: application/json" \
    -H "anthropic-version: 2023-06-01" \
    -H "x-api-key: YOUR_API_KEY" \
    -d '{
      "model": "claude-haiku-4-5-20251001",
      "max_tokens": 100,
      "messages": [{"role": "user", "content": "What is 1+1?"}]
    }'
  ```
</CodeGroup>

<Note>
  `stop_reason` values: `end_turn` (normal), `max_tokens` (cut off by `max_tokens` — the text may be empty; raise the limit), `stop_sequence`, `tool_use` (wants to call a tool). With thinking on, the `content` array gains a `type: "thinking"` block placed before the `text` block.
</Note>

## Streaming response (named-event SSE)

Claude streaming uses the **Anthropic event protocol**: each message has an `event:` name plus a `data:` payload, and you **dispatch by event type** rather than treating every chunk identically as in OpenAI.

```text theme={null}
event: message_start
data: {"type":"message_start","message":{"id":"...","content":[],"usage":{"input_tokens":26,"output_tokens":8}}}

event: content_block_start
data: {"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}

event: content_block_delta
data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"1+1 equals 2."}}

event: content_block_stop
data: {"type":"content_block_stop","index":0}

event: message_delta
data: {"type":"message_delta","delta":{"stop_reason":"end_turn"},"usage":{"output_tokens":11}}

event: message_stop
data: {"type":"message_stop"}
```

The fixed event sequence and what each carries:

| Event                 | Role                                                                        |
| --------------------- | --------------------------------------------------------------------------- |
| `message_start`       | Message skeleton; `usage.input_tokens` and initial `output_tokens` are here |
| `content_block_start` | A content block begins (`index` + block type text / thinking)               |
| `content_block_delta` | Increment; text is `delta.text` where `delta.type == "text_delta"`          |
| `content_block_stop`  | The current block ends                                                      |
| `message_delta`       | Final `stop_reason` + the **cumulative `output_tokens`** are here           |
| `message_stop`        | The whole message ends (**no `[DONE]`; this event is the terminator**)      |

The core is **accumulating the `text_delta` inside `content_block_delta`**:

```python theme={null}
import json, requests

resp = requests.post(
    "https://api.apiyi.com/v1/messages",
    headers={
        "content-type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": "YOUR_API_KEY",
    },
    json={
        "model": "claude-haiku-4-5-20251001",
        "max_tokens": 100,
        "stream": True,
        "messages": [{"role": "user", "content": "Write a short poem"}],
    },
    stream=True, timeout=120,
)

text, usage = "", {}
for line in resp.iter_lines(decode_unicode=True):
    if not line or not line.startswith("data: "):
        continue                       # the event: line can be skipped; type is in data's "type"
    evt = json.loads(line[6:])
    t = evt["type"]
    if t == "message_start":
        usage.update(evt["message"]["usage"])
    elif t == "content_block_delta" and evt["delta"]["type"] == "text_delta":
        piece = evt["delta"]["text"]
        text += piece
        print(piece, end="", flush=True)
    elif t == "message_delta":
        usage.update(evt["usage"])     # final output_tokens
    elif t == "message_stop":
        break                          # terminator, no [DONE]
```

<Tip>
  The event type is present in **both** the `event:` line and the `data:` payload's `"type"` field; dispatch on either. With the official `anthropic` SDK, point base\_url at `https://api.apiyi.com` and the SDK handles the event stream for you — no hand-written loop needed.
</Tip>

<Note>
  With thinking (adaptive thinking) on, a `type: "thinking"` block appears first; its increments are `thinking_delta`, and a `signature_delta` (thinking-block signature) appears before the block closes. To display thinking, render `thinking_delta` and `text_delta` separately. See the [Claude Effort & Thinking Guide](/en/api-capabilities/claude-effort-thinking).
</Note>

## Key differences from OpenAI compatible mode

| Aspect             | Claude native (`/v1/messages`)                                                    | OpenAI compatible (`/v1/chat/completions`)             |
| ------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Answer location    | `content` **block array**, typed                                                  | `choices[0].message.content` string                    |
| Streaming protocol | Named events (`event:` + `data:`)                                                 | Homogeneous chunk objects                              |
| Stream terminator  | `message_stop` event, **no `[DONE]`**                                             | `data: [DONE]`                                         |
| Increment field    | `content_block_delta.delta.text`                                                  | `choices[0].delta.content`                             |
| usage fields       | `input_tokens` / `output_tokens` (split across message\_start and message\_delta) | `prompt_tokens` / `completion_tokens` / `total_tokens` |
| Finish reason      | `stop_reason` (`end_turn`, etc.)                                                  | `finish_reason` (`stop`, etc.)                         |
| `max_tokens`       | **Required**                                                                      | Optional                                               |

<Warning>
  The two easiest migration traps: (1) the answer is an **array**, not a string — iterate `content` for `type=="text"` blocks; (2) streaming has **no `[DONE]`** — detect the end via the `message_stop` event.
</Warning>

## Usage and billing

* Non-streaming: `usage` comes back with the result, including `input_tokens`, `output_tokens`, `cache_creation_input_tokens`, `cache_read_input_tokens`.
* Streaming: `input_tokens` is in `message_start`, and the final `output_tokens` is in `message_delta` — **merge both**.
* For the cache-hit field (`cache_read_input_tokens`) discount and usage, see [Claude Cache Billing](/en/api-capabilities/claude-prompt-caching).

## Related links

* Same group: [Claude API Basics](/en/api-capabilities/claude) · [Claude Cache Billing](/en/api-capabilities/claude-prompt-caching) · [Claude Effort & Thinking Guide](/en/api-capabilities/claude-effort-thinking)
* Compatible-format counterpart: [OpenAI Compatible Mode: Handling Responses](/en/api-capabilities/openai/response-handling)
* Get / manage tokens: `https://api.apiyi.com/token`
