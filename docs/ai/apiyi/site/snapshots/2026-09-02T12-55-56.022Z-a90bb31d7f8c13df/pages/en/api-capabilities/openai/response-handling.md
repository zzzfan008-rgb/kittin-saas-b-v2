> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Compatible Mode: Handling Responses

> A unified way to parse streaming and non-streaming responses from /v1/chat/completions: commonality first, with a robust reference parser covering the few model-specific quirks.

When you call [compatible mode](/en/api-capabilities/openai/compatible), every model — OpenAI, Claude, Gemini, Grok, Qwen, GLM and others — returns the same OpenAI schema. **Almost all of your parsing logic is shared**: follow the patterns below and switching models needs no code changes.

This page helps you get response handling right the first time: commonality first, then a single table of the few differences you must tolerate (none of which block integration).

<Info>
  The request side (base\_url, auth, switching models) is covered in [Compatible Mode Calls](/en/api-capabilities/openai/compatible). This page is purely about the **response side**: how to parse what comes back.
</Info>

## Two modes, one endpoint

The same `/v1/chat/completions` endpoint; only the `stream` flag changes the shape:

|                | `stream: false` (default)         | `stream: true`                             |
| -------------- | --------------------------------- | ------------------------------------------ |
| Shape          | A single JSON object              | An SSE stream (many `data:` lines)         |
| Top-level type | `chat.completion`                 | `chat.completion.chunk`                    |
| Get the text   | `choices[0].message.content`      | Accumulate each `choices[0].delta.content` |
| Use case       | Backends, batch jobs, full result | Chat UIs, token-by-token rendering         |

## Non-streaming response

Stable structure — just read `choices[0].message.content`:

```json theme={null}
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "model": "gpt-4.1-mini",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "1+1 equals 2." },
      "finish_reason": "stop"
    }
  ],
  "usage": { "prompt_tokens": 31, "completion_tokens": 8, "total_tokens": 39 }
}
```

<CodeGroup>
  ```python Python theme={null}
  resp = client.chat.completions.create(
      model="gpt-4.1-mini",
      messages=[{"role": "user", "content": "What is 1+1?"}]
  )
  print(resp.choices[0].message.content)
  print(resp.usage.total_tokens)
  ```

  ```javascript Node.js theme={null}
  const resp = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [{ role: 'user', content: 'What is 1+1?' }]
  });
  console.log(resp.choices[0].message.content);
  console.log(resp.usage.total_tokens);
  ```

  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{"model":"gpt-4.1-mini","messages":[{"role":"user","content":"What is 1+1?"}]}'
  ```
</CodeGroup>

<Tip>
  Non-streaming output is highly consistent across all major models — `choices[0].message.content` works everywhere. Some models (e.g. the OpenAI family) also add `annotations` and `refusal` on `message`; read them if you need them, ignore them otherwise.
</Tip>

## Streaming response (SSE)

Streaming pushes chunks as Server-Sent Events, one per line as `data: {...}`, ending with `data: [DONE]`:

```text theme={null}
data: {"choices":[{"delta":{"content":"1"},"index":0}], ...}
data: {"choices":[{"delta":{"content":"+1"},"index":0}], ...}
data: {"choices":[{"delta":{},"finish_reason":"stop","index":0}], ...}
data: [DONE]
```

With the official SDK just iterate; the core is **accumulating `delta.content`**:

<CodeGroup>
  ```python Python theme={null}
  stream = client.chat.completions.create(
      model="gpt-4.1-mini",
      messages=[{"role": "user", "content": "Write a short poem"}],
      stream=True
  )

  for chunk in stream:
      if chunk.choices and chunk.choices[0].delta.content:
          print(chunk.choices[0].delta.content, end="", flush=True)
  ```

  ```javascript Node.js theme={null}
  const stream = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [{ role: 'user', content: 'Write a short poem' }],
    stream: true
  });

  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta?.content;
    if (delta) process.stdout.write(delta);
  }
  ```
</CodeGroup>

## Integration notes: a few differences, handled uniformly

Streaming details vary slightly between models, but **following the rules below lets one code path cover them all**.

<Warning>
  **The final chunk's `choices` may be an empty array.** The last chunk that carries `usage` is `"choices":[]` on some models (gpt-4.1-mini, grok, qwen, glm); indexing `choices[0]` there throws. **Check that `choices` is non-empty before reading it.**
</Warning>

| Difference                   | What you see                                                         | Uniform handling                                  |
| ---------------------------- | -------------------------------------------------------------------- | ------------------------------------------------- |
| Final-chunk choices          | May be `[]` empty, or non-empty                                      | Check `choices` is non-empty before reading delta |
| `finish_reason` mid-value    | Usually `null`; Claude uses `""` (empty string)                      | Detect end with `finish_reason === "stop"`        |
| `usage` location             | Empty-choices chunk / non-empty chunk / same chunk as `stop`         | Try all three; record whenever present            |
| Chunk granularity            | Per-token (OpenAI) or per-sentence (Gemini/Claude)                   | Irrelevant — just accumulate                      |
| First role-declaration chunk | Some send an empty-content chunk declaring `role`                    | Skip when content is empty; don't treat as text   |
| Vendor-private fields        | `obfuscation`, `system_fingerprint`, `first_token_return_time`, etc. | Ignore — never depend on them                     |

## Robust reference parser

When you handle the raw SSE yourself (no SDK), this covers every difference above:

<CodeGroup>
  ```python Python theme={null}
  import json, requests

  def stream_chat(model, messages, api_key):
      resp = requests.post(
          "https://api.apiyi.com/v1/chat/completions",
          headers={"Authorization": f"Bearer {api_key}",
                   "Content-Type": "application/json"},
          json={"model": model, "messages": messages, "stream": True},
          stream=True, timeout=300,
      )
      text, usage = "", None
      for line in resp.iter_lines(decode_unicode=True):
          if not line or not line.startswith("data: "):
              continue
          data = line[6:]
          if data == "[DONE]":
              break
          chunk = json.loads(data)
          if chunk.get("usage"):          # usage may appear in any chunk
              usage = chunk["usage"]
          choices = chunk.get("choices")
          if not choices:                 # final chunk may be empty; guard it
              continue
          delta = choices[0].get("delta", {})
          piece = delta.get("content")
          if piece:                       # skip role-only / empty-content chunks
              text += piece
              print(piece, end="", flush=True)
          # finish_reason == "stop" is just a marker; don't break (usage often follows)
      return text, usage
  ```

  ```javascript Node.js theme={null}
  async function streamChat(model, messages, apiKey) {
    const resp = await fetch("https://api.apiyi.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, stream: true }),
    });

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "", text = "", usage = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();             // keep the possibly-incomplete last line

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") return { text, usage };
        const chunk = JSON.parse(data);
        if (chunk.usage) usage = chunk.usage;        // usage may appear in any chunk
        const choices = chunk.choices;
        if (!choices || choices.length === 0) continue;  // final chunk may be empty
        const piece = choices[0].delta?.content;
        if (piece) { text += piece; process.stdout.write(piece); }
      }
    }
    return { text, usage };
  }
  ```
</CodeGroup>

<Note>
  Reasoning models (grok, qwen, glm, etc.) first stream `delta.reasoning_content` (the chain of thought), then `delta.content` (the answer). The parser above reads only `content`, so the thinking is skipped automatically. To display the thinking, see [Reasoning Model Output](/en/api-capabilities/openai/reasoning-models).
</Note>

## Usage and billing

* `usage` comes back inline in non-streaming responses; in streaming it arrives in a trailing chunk (location per the table above — "record whenever present").
* Field breakdowns differ: the OpenAI family adds `completion_tokens_details`, Gemini/Claude add `input_tokens`/`output_tokens`, reasoning models add `reasoning_tokens`. Rely on the three standard fields: `prompt_tokens` / `completion_tokens` / `total_tokens`.

<Warning>
  **Don't trust the streamed `total_tokens`.** In testing, a few models (e.g. gpt-5.4-mini) emit a trailing frame where `total ≠ prompt + completion`, while the same model is correct non-streaming. **Bill from your account statement**, not from that streamed frame.
</Warning>

## Related links

* Same group: [Compatible Mode Calls](/en/api-capabilities/openai/compatible) · [Reasoning Model Output](/en/api-capabilities/openai/reasoning-models) · [Native Calls](/en/api-capabilities/openai/native)
* Models & pricing: [Models & Pricing Overview](/en/api-capabilities/model-info)
* Get / manage tokens: `https://api.apiyi.com/token`
