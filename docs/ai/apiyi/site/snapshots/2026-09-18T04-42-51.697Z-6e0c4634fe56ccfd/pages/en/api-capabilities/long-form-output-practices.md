> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Long-form Output Practices

> How to reliably get results for long-output workloads — drama scripts, fiction, 10k-word articles: stream, size the read timeout to the inter-event gap, give max_tokens room, and check stop_reason. With a Claude native example.

<Info>
  **In one line**: when you ask a model to produce tens of thousands of characters in a single call (episode outlines, long fiction, large translations, big code), **stream the response, do not use non-streaming**; set the client read timeout to the gap *between data events* (tens of seconds — 90–120s is a safe value), not to the *total* generation time; give `max_tokens` room; and check `stop_reason` before using the text. Do these four things and long-output calls stop "returning nothing."
</Info>

This page applies to all large models (OpenAI, Claude, Gemini, Grok, and others). Code examples use Claude's native `/v1/messages`; differences for the OpenAI-compatible format are called out separately.

## Three things to know first

1. **For a 10k-word output, 10–20 minutes of real generation is normal.** The model emits tens of thousands of characters token by token, plus a reasoning/thinking phase — end-to-end latency is genuinely long. This is not the gateway being slow; generation itself is slow.

2. **Non-streaming buffers the whole thing before sending.** With non-streaming (`stream` omitted or `false`), the server must wait for the model to finish the entire generation, then send the whole body back at once. During those minutes your client read timeout is racing against it, and the longer the generation the more likely you disconnect before the result arrives — and the exception is often empty (`httpx.ReadError`'s `str(e)` is blank), so you cannot see the cause.

3. **A dropped connection is still billed, so blind retries double-charge.** Once the server has generated the output, the call is billed even if the result never reached you. Retrying after you have already received part of the body means the model runs again and you pay again.

## Stream, do not use non-streaming

With streaming (`stream: true`), the first byte arrives within seconds, and after that a data event arrives every few tens of seconds. Your read timeout only has to cover the gap *between events*, not a generation that runs for many minutes — that is the whole reason streaming reliably delivers long output.

The two protocols have **different terminators** — do not mix them up:

| Protocol                                 | Terminator                              | How to read the text                                                           |
| ---------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------ |
| Claude native `/v1/messages`             | `event: message_stop` (**no `[DONE]`**) | the `delta.text` of a `content_block_delta` whose `delta.type == "text_delta"` |
| OpenAI-compatible `/v1/chat/completions` | `data: [DONE]`                          | `choices[0].delta.content`                                                     |

With adaptive thinking on, Claude native emits a `type: "thinking"` block **first** (its increments are `thinking_delta`), then the `text` block. When rendering, route `thinking_delta` and `text_delta` separately and do not concatenate thinking into the body text.

Minimal Claude native `/v1/messages` streaming example (plain httpx, line-by-line SSE parsing):

```python theme={null}
import json
import httpx

def generate_long_text(prompt, api_key, model="claude-opus-5", max_tokens=64000):
    url = "https://api.apiyi.com/v1/messages"
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "accept": "text/event-stream",
    }
    payload = {
        "model": model,
        "max_tokens": max_tokens,
        "stream": True,                        # key: long output must stream
        "thinking": {"type": "adaptive"},      # adaptive thinking; the model decides depth
        "messages": [{"role": "user", "content": prompt}],
    }
    # Three-part timeout: read only covers the inter-event gap, not the whole generation
    timeout = httpx.Timeout(connect=30, write=120, read=120, pool=30)

    text, stop_reason = [], None
    with httpx.Client(timeout=timeout) as c:
        with c.stream("POST", url, json=payload, headers=headers) as r:
            if r.status_code != 200:
                raise RuntimeError(f"HTTP {r.status_code}: {r.read()[:400]}")
            event, data = None, []
            for line in r.iter_lines():
                if line == "":                 # events are separated by a blank line
                    if data:
                        d = json.loads("\n".join(data))
                        t = d.get("type") or event
                        if t == "content_block_delta" and d.get("delta", {}).get("type") == "text_delta":
                            text.append(d["delta"]["text"])
                        elif t == "message_delta":
                            stop_reason = d.get("delta", {}).get("stop_reason") or stop_reason
                    event, data = None, []
                    continue
                if line.startswith("event:"):
                    event = line[6:].strip()
                elif line.startswith("data:"):
                    data.append(line[5:].strip())
    # A Claude stream ends on message_stop, never [DONE]
    if stop_reason == "max_tokens":
        raise RuntimeError(f"truncated by max_tokens after {len(''.join(text))} chars; raise max_tokens and retry")
    return "".join(text).strip()
```

<Tip>
  If you use the official anthropic SDK, point `base_url` at `https://api.apiyi.com` and use `client.messages.stream(...).get_final_message()` — the SDK handles SSE parsing, timeouts, and `stop_reason` for you. The httpx version above is for when you would rather not pull in the SDK.
</Tip>

## Size the read timeout to the inter-event gap, not the total time

Many people set the read timeout to one huge value meant to cover the whole generation (say 1800 seconds) and still time out — because with non-streaming that value has to race the entire generation and any hiccup breaks it. The right approach is streaming plus a read timeout sized to the inter-event gap.

Measured reference (`claude-opus-5` producing a \~20k-character episode outline from a \~15k-character input):

| Metric                         | Measured                                 |
| ------------------------------ | ---------------------------------------- |
| Time to first byte             | 3 – 130 s                                |
| Max silent gap during thinking | \~42 s (with keepalive pings in between) |
| End-to-end total               | 9 – 12 minutes                           |

So a read timeout of **90–120 seconds** covers the largest inter-event gap with headroom — no need for a value of many minutes. A three-part timeout splits the phases and sizes each one:

```python theme={null}
# connect: establish; write: upload the request body; read: max gap between reads
timeout = httpx.Timeout(connect=30, write=120, read=120, pool=30)
```

## Give max\_tokens room, and check stop\_reason

Long output easily hits the `max_tokens` ceiling and gets truncated. This is especially true for models like Claude with **thinking on — thinking itself consumes the `max_tokens` budget**, and a long piece can exhaust it.

* **Start `max_tokens` at 64000** (give even more at high effort / deep thinking; `claude-opus-5` supports 128K output).
* **Check `stop_reason` before using the response:**
  * `end_turn` — finished normally, the text is complete; this is the only success.
  * `max_tokens` — truncated, the text may be incomplete or even empty. This is **truncation**, not an "empty result" — raise `max_tokens` and retry.
  * `refusal` — declined by a safety policy; handle separately.

Judging success by `str(e)` alone or by "the text is empty" is misleading — an empty body is usually `max_tokens` truncation.

## Retry strategy

Be conservative with retries on long output, so "retry on failure" does not become "double billing plus a second long run":

* **Retry only on failures before the response headers arrive, and on `5xx` / `429`** (with backoff, at most twice). Those are connection or transient issues where a retry makes sense.
* **Do not blindly retry a stream that dropped after you already received part of the body.** The server has generated and billed it; a retry runs it again and pays again.
* Log the request id from the response headers for reconciliation and troubleshooting.

## Scenario cheat sheet

| Scenario                            | Typical output     | max\_tokens          | read timeout |
| ----------------------------------- | ------------------ | -------------------- | ------------ |
| Drama / short-drama episode outline | 10k – 30k chars    | 64000                | 90 – 120 s   |
| Fiction (novels / chapters)         | 10k – 50k chars    | 64000 – 128000       | 90 – 120 s   |
| Long translation                    | scales with source | \~1.5x source tokens | 90 – 120 s   |
| Large code generation               | thousands of lines | 32000 – 64000        | 90 – 120 s   |

Always stream. Use `api.apiyi.com` (recommended in mainland China) or `vip.apiyi.com` (recommended overseas), and **not `api-cf.apiyi.com`** (the CDN node returns `524` at \~100 seconds and cannot carry long requests).

## Related

<CardGroup cols={2}>
  <Card title="How to avoid API timeouts" icon="clock" href="/en/faq/timeout-configuration">
    Timeout values by scenario
  </Card>

  <Card title="Streaming vs non-streaming" icon="git-compare" href="/en/faq/streaming-vs-non-streaming">
    The tradeoffs and how to choose
  </Card>

  <Card title="Claude thinking & effort" icon="brain" href="/en/api-capabilities/claude-effort-thinking">
    Adaptive thinking, effort tiers, max\_tokens and truncation
  </Card>

  <Card title="Claude response handling" icon="code" href="/en/api-capabilities/claude-response-handling">
    Native response shape, SSE events, stop\_reason
  </Card>
</CardGroup>
