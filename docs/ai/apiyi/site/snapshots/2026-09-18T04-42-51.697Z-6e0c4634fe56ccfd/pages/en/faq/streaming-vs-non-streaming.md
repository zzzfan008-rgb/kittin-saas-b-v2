> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# What's the difference between streaming and non-streaming calls?

> Why the same key produces streaming responses sometimes and non-streaming others, how the two modes differ, which fits which scenario, integration effort, billing, and six common misconceptions.

## Short answer

<Info>
  **Three sentences:**

  1. **Streaming vs non-streaming is entirely decided by your own code**—the `stream` field in the request body. Same key, same model, same endpoint: if it flips back and forth, your client code (or the SDK / framework wrapping it) is doing the flipping. **The gateway never switches it randomly.**
  2. **Both modes return identical final content and are billed identically.** The only differences are *when* you get the text and *how* you parse it.
  3. **How to choose**: a human is watching the screen → streaming; a program consumes the result (JSON parsing, batch jobs, tool calls) → non-streaming.
</Info>

## The differences at a glance

| Aspect                    | Streaming `stream: true`                                                                                  | Non-streaming (default)                                    |
| ------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Request parameter         | `stream: true`                                                                                            | omitted, or `stream: false`                                |
| Response format           | SSE event stream (`text/event-stream`), many `data:` chunks, terminated by `data: [DONE]`                 | one complete JSON object                                   |
| Reading the text          | accumulate `choices[0].delta.content` chunk by chunk                                                      | read `choices[0].message.content` directly                 |
| Time to first byte (TTFB) | fast, typically 1-3 s on regular models                                                                   | ≈ total generation time                                    |
| Total latency             | roughly the same as non-streaming                                                                         | roughly the same as streaming                              |
| `usage`                   | **not returned by default**; needs `stream_options: {"include_usage": true}`                              | always present in the response body                        |
| Error shape               | the connection is already open, so errors can surface mid-stream and must be handled inside the read loop | one HTTP status code + error JSON — the simplest case      |
| Long silent gaps          | rare (data keeps flowing)                                                                                 | common (the connection is silent for the whole generation) |
| Integration effort        | medium: incremental assembly, SSE parsing, disabling buffering                                            | low: one request, one parse                                |
| Billing                   | per token                                                                                                 | **exactly the same**                                       |
| Console log               | `is_stream = true`                                                                                        | `is_stream = false`                                        |

## Why do my requests flip between streaming and non-streaming?

This is the most common question, and the answer is: **something on your side is changing it.** Work down this list — one of them almost always matches:

<AccordionGroup>
  <Accordion title="1. `stream` is a variable or a config value in your code">
    The classic case: `stream=config.get("stream", False)` or `stream=is_web_request`. Different entry points reach the same function with different values, and the logs look like the mode is flipping at random.

    **How to check**: print the request body you actually send and look at the `stream` field.
  </Accordion>

  <Accordion title="2. Different SDKs and frameworks have different defaults">
    The same business logic behaves differently depending on the client:

    * OpenAI SDK `chat.completions.create()`: **non-streaming** by default
    * `client.chat.completions.stream()` or `with_streaming_response`: **streaming**
    * Wrappers like LangChain / LlamaIndex: depends on whether you call `invoke` or `stream`, and whether you passed `streaming=True` when constructing the model object
    * Desktop clients, agent tools, workflow platforms: usually expose a "streaming output" toggle in settings, with varying defaults

    **How to check**: confirm which entry point actually issued the call.
  </Accordion>

  <Accordion title="3. One key shared by several applications">
    A single key used by both a web chat UI (streaming) and a nightly batch job (non-streaming) produces logs that look random when viewed together.

    **How to check**: create separate tokens per use case — the logs then separate themselves. See [Token management](/en/faq/token-management).
  </Accordion>

  <Accordion title="4. A middlebox flattened the stream">
    You really did send `stream: true`, but Nginx, a corporate gateway, or some proxy **buffered** the response — the server sent it chunk by chunk, the proxy held it and released it all at once, and it feels non-streaming.

    **How to check**: test once bypassing the proxy; turn buffering off on Nginx (`proxy_buffering off;`). Note that in this case the console log still shows `is_stream = true`, because the gateway genuinely streamed it out.
  </Accordion>
</AccordionGroup>

<Tip>
  **To confirm what a specific call actually did**: check the `is_stream` field in the console log, or pull it in bulk with the [Log Query API](/en/api-capabilities/log-query). That is the source of truth — far more reliable than impressions.
</Tip>

## Choosing by scenario

<CardGroup cols={2}>
  <Card title="Use streaming" icon="zap">
    * Chat UIs and support bots — users need immediate feedback
    * IDE plugins / coding assistants (Claude Code, Cursor, etc.)
    * Long-form generation (long articles, long translations, large code blocks)
    * Long reasoning-model tasks — at least you can see progress
    * Anywhere the user can hit "stop" mid-generation
  </Card>

  <Card title="Use non-streaming" icon="package">
    * Structured output: you need the whole JSON for `json.loads()`
    * Parsing function-calling / tool-call arguments
    * Batch processing, offline jobs, scheduled tasks
    * Backend flows where only the final result matters and nobody is waiting
    * Quick verification, debugging, writing test cases
  </Card>
</CardGroup>

A few special cases:

| Scenario                       | Recommendation            | Notes                                                                                                                                               |
| ------------------------------ | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Image generation / editing     | non-streaming             | The OpenAI-compatible `/v1/images/generations` does not accept `stream`; Gemini's native image API has a separate `:streamGenerateContent` endpoint |
| Video generation               | not related to streaming  | Async task + polling, see [Async image/video APIs](/en/faq/image-async-api)                                                                         |
| Embedding / Rerank             | non-streaming             | These endpoints have no streaming concept                                                                                                           |
| Reasoning / long-output models | **streaming recommended** | Thinking has silent gaps but with keepalives; size the read timeout to the inter-event gap — see misconception 1 below                              |

## Integration effort: the same task, both ways

<Tabs>
  <Tab title="Python non-streaming">
    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(
        api_key="sk-your-apiyi-key",
        base_url="https://api.apiyi.com/v1",
    )

    resp = client.chat.completions.create(
        model="gpt-5.4",
        messages=[{"role": "user", "content": "Explain quantum computing"}],
        timeout=120,
    )

    # Full text in one line
    print(resp.choices[0].message.content)
    # usage is right there in the response body
    print(resp.usage.total_tokens)
    ```
  </Tab>

  <Tab title="Python streaming">
    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(
        api_key="sk-your-apiyi-key",
        base_url="https://api.apiyi.com/v1",
    )

    stream = client.chat.completions.create(
        model="gpt-5.4",
        messages=[{"role": "user", "content": "Explain quantum computing"}],
        stream=True,
        stream_options={"include_usage": True},   # without this, no usage
        timeout=120,
    )

    chunks = []
    for chunk in stream:
        # the final usage chunk has an empty choices array — check before indexing
        if chunk.choices and chunk.choices[0].delta.content:
            piece = chunk.choices[0].delta.content
            chunks.append(piece)
            print(piece, end="", flush=True)
        if chunk.usage:
            print(f"\nUsage: {chunk.usage.total_tokens} tokens")

    full_text = "".join(chunks)   # assemble it yourself if you need the whole thing
    ```
  </Tab>

  <Tab title="Node.js streaming">
    ```javascript theme={null}
    import OpenAI from "openai";

    const client = new OpenAI({
      apiKey: "sk-your-apiyi-key",
      baseURL: "https://api.apiyi.com/v1",
    });

    const stream = await client.chat.completions.create({
      model: "gpt-5.4",
      messages: [{ role: "user", content: "Explain quantum computing" }],
      stream: true,
      stream_options: { include_usage: true },
    });

    let full = "";
    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) {
        full += delta;
        process.stdout.write(delta);
      }
      if (chunk.usage) console.log("\nUsage:", chunk.usage.total_tokens);
    }
    ```
  </Tab>

  <Tab title="cURL side by side">
    ```bash theme={null}
    # Non-streaming: one complete JSON
    curl https://api.apiyi.com/v1/chat/completions \
      -H "Authorization: Bearer $APIYI_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "gpt-5.4",
        "messages": [{"role": "user", "content": "Hello"}]
      }'

    # Streaming: a series of data: chunks, ending with data: [DONE]
    # -N disables curl's own buffering, otherwise it still looks like one blob
    curl -N https://api.apiyi.com/v1/chat/completions \
      -H "Authorization: Bearer $APIYI_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "gpt-5.4",
        "messages": [{"role": "user", "content": "Hello"}],
        "stream": true,
        "stream_options": {"include_usage": true}
      }'
    ```
  </Tab>
</Tabs>

<Note>
  **Claude's native format (`/v1/messages`) uses a different streaming protocol**: Anthropic's **named-event SSE** (`message_start` / `content_block_delta` / `message_delta` and friends), not OpenAI's uniform `data:` chunks, and `usage` is split across the `message_start` and `message_delta` events. Full parsing guide: [Claude native format: streaming and non-streaming responses](/en/api-capabilities/claude-response-handling).
</Note>

## Billing and usage: identical either way

<Warning>
  **Streaming is neither cheaper nor more expensive.** Billing is per token and has nothing to do with how the bytes are transported.

  **Disconnecting midway is still billed**—after you hit `Ctrl+C` or your client times out, the upstream generation still runs to completion and the request is charged normally. So "cut the stream off early to save money" does not work.
</Warning>

Two traps around `usage`:

1. **Streaming does not return usage by default.** On OpenAI-compatible endpoints you must pass `stream_options: {"include_usage": true}`; the usage then arrives in the final chunk (whose `choices` array is empty — check before indexing). This is verified working on several models on APIYI.
2. **Don't reconcile your bill against the `usage` echoed by the API**, especially the cache-related fields. The echoed values do not always match what was actually billed; whether a cache hit occurred is determined by the **"cache billing details" in the console log**. See [Cache billing explained](/en/faq/cache-billing).

Either way, the console log records the token counts, latency, and billing for every call — transport mode makes no difference. Field meanings: [Understanding log billing details](/en/faq/log-billing-explained).

## Six common misconceptions

<AccordionGroup>
  <Accordion title="1. Streaming means you can ignore timeouts">
    **Separate two things.** Streaming does not shorten total generation time — the total from first token to last is whatever it was; that part is unchanged.

    But streaming does fix "returning nothing": as long as you set the client read timeout to cover the gap *between events* (measured max silent gap during a reasoning model's thinking phase is \~42s, with keepalive pings in between, so 90-120s works), it will not fire wrongly. It is **pure non-streaming** — making one timeout value cover a ten-plus-minute generation end to end — that genuinely can't hold.

    So the right approach is: stream long output, with a read timeout sized to the inter-event gap. Per-scenario values are in [How to avoid API timeouts](/en/faq/timeout-configuration); the full recipe is in [Long-form Output Practices](/en/api-capabilities/long-form-output-practices).
  </Accordion>

  <Accordion title="2. Streaming is faster">
    **The first byte is faster; the total is not.** For the same model and prompt, streaming and non-streaming finish in roughly the same time.

    Streaming buys you *perceived* speed: the user sees movement within a second instead of staring at a spinner for 30. If nobody is watching the screen, that value is zero.
  </Accordion>

  <Accordion title="3. Streaming is cheaper, or only bills what you received">
    **No.** See "Billing and usage" above: identical billing, and disconnecting midway is still charged.
  </Accordion>

  <Accordion title="4. Every model and endpoint supports streaming">
    **No.** Text chat models generally do; image generation, embedding, and rerank endpoints have no streaming concept and will either ignore `stream` or reject it.

    A few models have extra restrictions on certain parameter combinations under streaming. When unsure, get the call working non-streaming first, then add `stream: true`.
  </Accordion>

  <Accordion title="5. Non-streaming is more reliable">
    **Both have their failure modes.**

    * Non-streaming risks: the connection is silent for the whole generation, so proxies, CDNs, and corporate gateways may drop it on idle timeout. With very large response bodies (base64 image output easily reaches tens of MB) you can also hit a stalled terminator — see [Requests that finish transferring but never return](/en/api-capabilities/image-tail-stall) and [Log shows completed but the client gets nothing](/en/faq/log-duration-vs-client-wait).
    * Streaming risks: unfriendly to middleboxes that do not support SSE or that force buffering; client parsing is more complex and easy to get subtly wrong.

    Also note: `api-cf.apiyi.com` (the CDN endpoint) has an approximately 100-second request ceiling that **affects both modes**. For long requests use `api.apiyi.com` or `vip.apiyi.com` — see [Base URL configuration guide](/en/faq/base-url-config).
  </Accordion>

  <Accordion title="6. You can't get the complete answer from a stream">
    **You can — you just assemble it yourself.** Concatenating every chunk's `delta.content` in order gives you exactly the non-streaming `message.content`.

    If the assembled text looks incomplete, check three things: whether you ignored `finish_reason`, whether you exited the loop before receiving `data: [DONE]`, and whether a middlebox truncated the response.
  </Accordion>
</AccordionGroup>

## Streaming not working? Four steps

<Steps>
  <Step title="Confirm the request body really contains stream: true">
    Print the JSON you actually send. With wrapper libraries, "I thought I passed it" and "it was passed" are often different things.
  </Step>

  <Step title="Test directly with curl -N">
    Bypass your own code and any proxy using the command in the "cURL side by side" tab above. If curl shows chunks arriving progressively, the server side is fine and the problem is in your client or a middlebox.
  </Step>

  <Step title="Check middlebox buffering">
    Add `proxy_buffering off;` on Nginx. Corporate gateways and security appliances may scan `text/event-stream` as a whole payload — ask your network admin to allow it through.
  </Step>

  <Step title="Review your parsing logic">
    Read SSE line by line, skip blank lines and comment lines starting with `:`, and stop at `data: [DONE]`. The final chunk carrying `usage` has an empty `choices` array — don't index into it.
  </Step>
</Steps>

<Tip>
  If you get this far without an answer, **contact support with the `request_id`** — the console log shows directly whether that call was handled as a stream, plus its total latency and time to first byte.
</Tip>

## Related documentation

<CardGroup cols={2}>
  <Card title="How to avoid API timeouts" icon="timer" href="/en/faq/timeout-configuration">
    Timeout values by scenario, and why long output should stream
  </Card>

  <Card title="Base URL configuration guide" icon="link" href="/en/faq/base-url-config">
    Differences between endpoints, and the CDN node's 100-second ceiling
  </Card>

  <Card title="Log shows completed but no response" icon="stethoscope" href="/en/faq/log-duration-vs-client-wait">
    The classic large non-streaming response problem, with segment timing
  </Card>

  <Card title="Claude streaming and non-streaming" icon="braces" href="/en/api-capabilities/claude-response-handling">
    Parsing Anthropic's native named-event SSE protocol
  </Card>

  <Card title="Text generation API" icon="message-square" href="/en/api-capabilities/text-generation">
    Full parameter list and call examples
  </Card>

  <Card title="Understanding log billing details" icon="file-text" href="/en/faq/log-billing-explained">
    What each console log field means, including is\_stream
  </Card>
</CardGroup>
