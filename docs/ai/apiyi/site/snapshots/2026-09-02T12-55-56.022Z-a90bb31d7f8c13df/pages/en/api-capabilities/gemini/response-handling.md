> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini Native Format: Streaming & Non-Streaming Responses

> Response structure of Gemini's native generateContent / streamGenerateContent: candidates/parts, thoughtSignature, SSE streaming, plus parsing and a field reference.

When you call [Gemini's native format](/en/api-capabilities/gemini/native) (`/v1beta` generateContent), the response uses Google's `candidates / parts` structure, different from OpenAI compatible mode. This page explains how to parse both non-streaming (`generateContent`) and streaming (`streamGenerateContent`).

<Info>
  The request side (base\_url is `https://api.apiyi.com` without `/v1`, `x-goog-api-key` auth, `thinking_level` control) is covered in the [Gemini Native Format Guide](/en/api-capabilities/gemini/native). This page is purely about the **response side**. Examples use the lightweight model `gemini-3.1-flash-lite`.
</Info>

## Non-streaming response

Endpoint `…:generateContent`. **The answer lives in `candidates[0].content.parts[]`**:

```json theme={null}
{
  "candidates": [{
    "content": {
      "role": "model",
      "parts": [
        { "text": "1+1 equals 2.", "thoughtSignature": "EjQKMgEM…" }
      ]
    },
    "finishReason": "STOP",
    "index": 0
  }],
  "usageMetadata": {
    "promptTokenCount": 15,
    "candidatesTokenCount": 6,
    "totalTokenCount": 21
  },
  "modelVersion": "gemini-3.1-flash-lite",
  "responseId": "Il0taoSYJ5Cez7…"
}
```

Getting the answer means **iterating `parts`** and concatenating each `text`:

<CodeGroup>
  ```python Python theme={null}
  import requests

  resp = requests.post(
      "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite:generateContent",
      headers={"Content-Type": "application/json", "x-goog-api-key": "YOUR_API_KEY"},
      json={"contents": [{"parts": [{"text": "What is 1+1?"}]}]},
      timeout=60,
  )
  data = resp.json()
  parts = data["candidates"][0]["content"]["parts"]
  text = "".join(p["text"] for p in parts if "text" in p)
  print(text)
  print(data["usageMetadata"])
  ```

  ```bash cURL theme={null}
  curl "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite:generateContent" \
    -H "Content-Type: application/json" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -d '{"contents":[{"parts":[{"text":"What is 1+1?"}]}]}'
  ```
</CodeGroup>

<Note>
  `finishReason` is **uppercase** `STOP` (not OpenAI's lowercase `stop`); other values include `MAX_TOKENS` and `SAFETY`. A `part` may contain only `thoughtSignature` and no `text`, so filter with `if "text" in p` when iterating, or you'll hit a KeyError.
</Note>

## thoughtSignature

Gemini 3-series models attach a `thoughtSignature` (encrypted reasoning state) to parts — **in testing, even the lightweight `gemini-3.1-flash-lite` returns it**.

* **Single turn**: not needed; ignore it.
* **Multi-turn / function calling**: pass the previous response's `thoughtSignature` back **verbatim** in the next turn's `contents` so the model can continue its reasoning chain. The official `google-genai` SDK handles this automatically; when hand-writing REST, don't drop the field. See [Gemini Function Calling](/en/api-capabilities/gemini/function-calling).

<Tip>
  This is the key difference from [OpenAI compatible mode](/en/api-capabilities/openai/reasoning-models): in compatible mode reasoning models are stateless and expose no signature; only the native format has `thoughtSignature`, which must be passed back across turns.
</Tip>

## Streaming response (SSE)

Endpoint `…:streamGenerateContent`. Each line is `data: {...}`, and each chunk's increment is in `candidates[0].content.parts[0].text`:

```text theme={null}
data: {"candidates":[{"content":{"parts":[{"text":"1"}]},"finishReason":"","index":0}],"usageMetadata":{...}}
data: {"candidates":[{"content":{"parts":[{"text":"+1 equals 2."}]},"finishReason":"","index":0}],"usageMetadata":{...}}
data: {"candidates":[{"content":{"parts":[{"thoughtSignature":"EjQK…"}]},"finishReason":"STOP","index":0}],"usageMetadata":{...}}
```

<Warning>
  **Through the APIYI gateway, streaming always returns SSE `data:` lines** (with or without `?alt=sse`), and there is **no `[DONE]` terminator** — end on the chunk whose `finishReason == "STOP"`. That last chunk typically contains **only `thoughtSignature` and no `text`**.
</Warning>

```python theme={null}
import json, requests

resp = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite:streamGenerateContent?alt=sse",
    headers={"Content-Type": "application/json", "x-goog-api-key": "YOUR_API_KEY"},
    json={"contents": [{"parts": [{"text": "Write a short poem"}]}]},
    stream=True, timeout=120,
)

text, usage = "", None
for line in resp.iter_lines(decode_unicode=True):
    if not line or not line.startswith("data: "):
        continue
    chunk = json.loads(line[6:])
    usage = chunk.get("usageMetadata", usage)        # cumulative; later overrides
    for cand in chunk.get("candidates", []):
        for p in cand.get("content", {}).get("parts", []):
            if "text" in p:                          # skip signature-only chunks
                text += p["text"]
                print(p["text"], end="", flush=True)
print("\n", usage)
```

<Note>
  `usageMetadata` is **present in every chunk and is cumulative** (`candidatesTokenCount` grows with output) — just take the **last** chunk's value; no manual summing needed.
</Note>

## Key differences from OpenAI compatible mode

| Aspect            | Gemini native (`/v1beta`)                      | OpenAI compatible (`/v1/chat/completions`) |
| ----------------- | ---------------------------------------------- | ------------------------------------------ |
| base\_url         | `https://api.apiyi.com` (no `/v1`)             | `https://api.apiyi.com/v1`                 |
| Auth header       | `x-goog-api-key`                               | `Authorization: Bearer`                    |
| Answer location   | `candidates[0].content.parts[].text`           | `choices[0].message.content`               |
| Stream increment  | each chunk's `parts[].text`                    | `choices[0].delta.content`                 |
| Stream terminator | `finishReason == "STOP"`, **no `[DONE]`**      | `data: [DONE]`                             |
| Finish reason     | uppercase `STOP` / `MAX_TOKENS`                | lowercase `stop`                           |
| Thought signature | ✅ `thoughtSignature` (pass back across turns)  | ❌ not exposed                              |
| usage             | `usageMetadata` (cumulative each stream chunk) | `usage` (once, at stream tail)             |

## Usage and billing

```python theme={null}
u = data["usageMetadata"]
# promptTokenCount  input / candidatesTokenCount output / thoughtsTokenCount thinking / totalTokenCount total
```

* `thoughtsTokenCount` (thinking tokens) is billed at the **output rate**; use `thinking_level` to cap it and save cost.
* For the cache-hit field (`cachedContentTokenCount`) discount, see [Gemini Cache Billing](/en/api-capabilities/gemini/prompt-caching).
* The full field reference is in the "Usage fields" section of the [Gemini Native Format Guide](/en/api-capabilities/gemini/native).

## Related links

* Same group: [Gemini Native Format Guide](/en/api-capabilities/gemini/native) · [Multimodal & Code Execution](/en/api-capabilities/gemini/multimodal) · [Function Calling](/en/api-capabilities/gemini/function-calling)
* Compatible-format counterpart: [OpenAI Compatible Mode: Handling Responses](/en/api-capabilities/openai/response-handling)
* Get / manage tokens: `https://api.apiyi.com/token`
