> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.8-Max Text Generation

> Alibaba Qwen's flagship Qwen3.8-Max: 2.4T-parameter sparse MoE, 1M context, 131K output, native image and video input. Listed on APIYI at $1.65/$4.95 per 1M tokens — 17.5% below official. Includes the capability matrix and pitfalls from 586 live test calls.

Qwen3.8-Max (`qwen3.8-max`) is Alibaba Qwen's new flagship, released August 3, 2026. It is a sparse MoE model with 2.4 trillion total parameters, a **1M context window**, 131K max output, and native support for text, image, and video input. APIYI listed it the day it shipped and ran **586 live test calls** against it — the capability matrix, parameter behavior, and billing notes on this page all come from those tests rather than from restating official documentation.

<Info>
  **Qwen3.8-Max is live on APIYI**: model name `qwen3.8-max`. **Thinking is on by default** (at the `xhigh` tier, and thinking tokens are billed as output), so set `reasoning_effort="none"` explicitly for everyday chat — in testing this took output from roughly 158 tokens down to 5. For the previous generation, see [Qwen3.6 series (legacy)](/en/api-capabilities/qwen-3-6/overview).
</Info>

## Why this model

<CardGroup cols={2}>
  <Card title="17.5％ below official" icon="tag">
    \$1.65 input, \$4.95 output per 1M tokens versus Alibaba Cloud's \$2/\$6. [Top-up promotions](/en/faq/recharge-promotions) stack on top.
  </Card>

  <Card title="1M context, verified" icon="scroll">
    Across 8K / 32K / 128K bodies with markers buried mid-document and at the tail, both endpoints recalled **all 6/6 exactly**. A 128K call takes about 80 seconds.
  </Card>

  <Card title="Three modalities, one model" icon="eye">
    Text, image, and video input all verified working — no switching between a "long-context model" and a "vision model."
  </Card>

  <Card title="Much stronger agentic work" icon="wrench">
    FrontierSWE rose from the previous generation's 40.7 to **73.5**, DeepSWE from 21.6 to 56.6. The tool-calling chain is complete, with two-round round-trips verified.
  </Card>
</CardGroup>

## Endpoint support

| Endpoint               | Status                         | Notes                                                                                                                                                                                 |
| ---------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/v1/chat/completions` | ✅ Fully working                | **Recommended.** Tool calling, structured output, multimodal, and streaming all verified                                                                                              |
| `/v1/messages`         | ⚠️ Usable for code integration | Strip `thinking` blocks before replaying history or the second turn returns 400. Off-the-shelf clients like Claude Code are not usable yet — see "Using the Anthropic endpoint" below |
| `/v1/responses`        | ❌ Not supported yet            | All 30 test calls failed; reported upstream                                                                                                                                           |

## Pricing

Per 1M tokens, pre-discount list price:

| Item                    | APIYI         | Alibaba Cloud | Difference  |
| ----------------------- | ------------- | ------------- | ----------- |
| Input                   | **\$1.65**    | \$2.00        | 17.5％ lower |
| Output (incl. thinking) | **\$4.95**    | \$6.00        | 17.5％ lower |
| Cache read              | **\$0.20625** | \$0.25        | 17.5％ lower |
| Cache write             | **\$2.0625**  | —             | —           |

[Top-up promotions](/en/faq/recharge-promotions) stack on top for a lower effective cost.

## Specifications

| Item                | Value                                                                          |
| ------------------- | ------------------------------------------------------------------------------ |
| Model name          | `qwen3.8-max`                                                                  |
| Architecture        | Sparse MoE, 2.4 trillion total parameters                                      |
| Context window      | 1M tokens (991K input without thinking, 983K with)                             |
| Max output          | 131,072 tokens (out-of-range requests return the explicit bound `[1, 131072]`) |
| Max thinking budget | 262K tokens                                                                    |
| Thinking mode       | On by default, tier `xhigh`                                                    |
| Input modalities    | Text, image, video                                                             |
| Output rate         | \~19–22 tokens/s (measured)                                                    |
| Time to first token | \~1.85 s streaming (measured P50)                                              |

Official benchmarks: GPQA Diamond 92.6, PaperBench 93.0, OmniDocBench 1.5 92.1, Terminal-Bench 2.1 86.6, OSWorld-Verified 86.1, IFBench 82.8, FrontierSWE 73.5, SWE-bench Pro 67.7.

## Controlling thinking (the most important section)

Qwen3.8-Max **thinks by default**, at the `xhigh` tier. Thinking tokens are billed as output and frequently account for over 90％ of it.

### Seven values, four real tiers

The parameter accepts 7 values but maps to only **4 real tiers** in practice:

| Value passed             | Effective tier                     | Measured thinking |
| ------------------------ | ---------------------------------- | ----------------- |
| `none`                   | Thinking off                       | 0 tokens          |
| `minimal` / `low`        | Low                                | \~100 tokens      |
| `medium`                 | Medium                             | \~150 tokens      |
| `high` / `xhigh` / `max` | Default tier (all three identical) | \~150–175 tokens  |

Passing `max` does not think harder than `xhigh`. Any other value returns a 400 listing the legal set.

### How to turn thinking off

```python theme={null}
response = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": "Hello"}],
    reasoning_effort="none",
    max_tokens=500,
)
```

`enable_thinking: false` in `extra_body` and `chat_template_kwargs: {"enable_thinking": false}` are equivalent and also work.

<Warning>
  **`max_tokens` does not bound thinking tokens.** We set `max_tokens=1` and were still billed **1,054** output tokens, 1,045 of them thinking.

  `max_tokens` only truncates the visible answer. **Use `reasoning_effort` to control cost — do not rely on `max_tokens`.**
</Warning>

### `thinking_budget` has no effect

Passing 128 / 512 / 4096 all behave identically to the `low` tier; the number itself is ignored. **Use `reasoning_effort` instead.**

## Code examples

### Python (OpenAI SDK compatible)

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

# Everyday chat: thinking off, fast and cheap
resp = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": "Explain load balancing in one sentence."}],
    reasoning_effort="none",
    max_tokens=500,
)
print(resp.choices[0].message.content)

# Hard reasoning: keep the default thinking tier
resp = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": "Prove that among any 5 integers, some 3 sum to a multiple of 3."}],
    max_tokens=4000,
)
print(resp.choices[0].message.reasoning_content)  # thinking trace
print(resp.choices[0].message.content)            # final answer
```

### Image input

```python theme={null}
import base64

with open("chart.png", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": [
        {"type": "text", "text": "What number is written in this image?"},
        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}"}},
    ]}],
    max_tokens=500,
)
```

Remote image URLs also work on this endpoint — just set `url` to an `https://...` address.

### Video input

```python theme={null}
resp = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": [
        {"type": "text", "text": "What happens in this video?"},
        {"type": "video_url", "video_url": {"url": f"data:video/mp4;base64,{b64_video}"}},
    ]}],
    max_tokens=1000,
)
```

<Tip>
  Video understanding took **144–285 seconds** per call in testing. Set your client timeout above 300 seconds and prefer streaming or an async task queue.
</Tip>

There is also a frame-sequence form, `{"type": "video", "video": [frame1, frame2, ...]}`, which requires **4–8000 frames** — fewer than 4 returns a 400.

### cURL

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer sk-your-apiyi-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3.8-max",
    "messages": [{"role": "user", "content": "Hello"}],
    "reasoning_effort": "none"
  }'
```

## Tool calling

Tool calling on the Chat Completions endpoint is **fully working**: single tool, parallel tools, two-round round-trip, picking 1 out of 20 tools, streaming deltas, and `parallel_tool_calls: false` all verified.

<Warning>
  **Forced tool calls require thinking off.** When `tool_choice` is `"required"` or names a specific function, you must also set `reasoning_effort="none"` — otherwise you get a 400 (`tool_choice does not support being set to required or object in thinking mode`) or the call is silently skipped.

  `tool_choice` set to `"auto"` / `"none"` is unaffected. The same applies to `n > 1`.
</Warning>

```python theme={null}
resp = client.chat.completions.create(
    model="qwen3.8-max",
    messages=[{"role": "user", "content": "What's the weather in Beijing?"}],
    tools=tools,
    tool_choice={"type": "function", "function": {"name": "get_weather"}},
    reasoning_effort="none",   # required
)
```

## Structured output

`response_format` with `json_schema` held **strictly** in testing: nested objects, enums, arrays, and `additionalProperties: false` all took effect, with no extra fields and no Markdown fences.

<Tip>
  **Disable thinking for structured output.** Same schema, measured side by side:

  | Configuration                             | Output tokens | Of which thinking | Latency |
  | ----------------------------------------- | ------------- | ----------------- | ------- |
  | `json_schema` + default thinking          | 4,066         | 3,971             | 100 s   |
  | `json_schema` + `reasoning_effort="none"` | 154           | 0                 | 4.7 s   |

  Conformance was identical; cost and latency differ by an order of magnitude.
</Tip>

## Context caching

* **Hit threshold around 1,024 tokens**: an 818-token prefix missed; 1,070 tokens and up hit
* **Real multi-turn conversations do hit**: appending messages turn by turn hit on every round
* **Long documents benefit most**: 98.6％ cached input at 128K, 99.3％ at 32K

<Warning>
  **Do not use the cache fields in the API response to judge whether a hit occurred.** On some routes `cache_read_input_tokens` is always 0, and on others the response carries no cache fields at all — yet the very same requests show real cache reads in the console billing records.

  **Trust the "cache billing detail" in the console**, which lists token counts and amounts separately for cache creation (1.25x) and cache reads (0.125x).
</Warning>

<Tip>
  **Cache billing semantics are not fixed per endpoint — they vary by route.** In testing, identically shaped requests on the same route were billed under two different schemes on different days:

  | Scheme          | How it settles                                                          |
  | --------------- | ----------------------------------------------------------------------- |
  | OpenAI cache    | Included in prompt tokens; the cached portion bills at 0.125x           |
  | Anthropic cache | Settled separately from base tokens: creation at 1.25x, reads at 0.125x |

  Open a single request in the console log and the "cache billing detail" states which scheme applied and shows the full calculation. **That is the only place to find out how a given call was actually billed.**
</Tip>

<Tip>
  On the Anthropic endpoint, an implicit cache hit is possible **without** `cache_control`. Before adding the marker everywhere, compare actual charges in the console — do not assume marking it is always cheaper.
</Tip>

## Using the Anthropic endpoint

`/v1/messages` works for code integration, but you **must strip `thinking` blocks before replaying history**, otherwise you get a 400 (`if content is list. item must be dict and key[type] should in dict`).

```python theme={null}
def strip_thinking(blocks):
    return [b for b in blocks if b.get("type") != "thinking"]

messages.append({"role": "assistant", "content": strip_thinking(resp["content"])})
```

With that filter in place, we verified 3-turn cross-turn memory, a two-round tool round-trip, and tool results persisting into later turns.

### 2026-08-08 follow-up: multi-turn tool calling itself is fine

A dedicated 300-call retest confirms the **multi-turn `tool_use` / `tool_result` chain itself works**. The only blocker is the `thinking` block:

* **`tool_result` has no extra format restrictions.** String or block-array `content`, `is_error` true or false, empty results, 50KB results, out-of-order replay, partial replay, fabricated `tool_use_id` — all 15 shapes passed. Control characters, emoji, and a 200,000-character single line also passed.
* **No `signature` value saves you.** Empty string, `null`, the key removed entirely, or a fabricated value all return the same 400. **You have to drop the whole block.**
* **Stress test passes once stripped.** An autonomous agent loop with a 24K-token system prompt and 8 tools, 12 turns × 2 runs, context growing to 28.7K — **24/24 succeeded**.
* **SSE events are complete**: `message_start`, `content_block_start`, `content_block_delta`, `content_block_stop`, `message_delta`, `message_stop`, plus `ping`. `text_delta`, `thinking_delta`, `signature_delta`, and `input_json_delta` all behave correctly.
* **No rate or concurrency limit observed**: the same request repeated 40 times sequentially all succeeded, and concurrency levels of 1 / 4 / 8 / 16 / 32 all succeeded with no 429s.

<Warning>
  **Off-the-shelf clients such as Claude Code are not usable yet.** They replay history content blocks verbatim and their behavior cannot be changed, so **the first turn returns `tool_use` normally, then the second turn returns 400 once you send `tool_result` back** — this is the most common failure report on this endpoint.

  Newer Claude Code builds also send `thinking: {"type": "adaptive"}`; some routes accept only `enabled` / `disabled` / `auto` and will return 400 on the **first** turn.

  Use `/v1/chat/completions` instead.
</Warning>

### What to do if you want it inside Claude Code

For this class of "doesn't work in one specific client" problem, **the limitation may well be on the model side rather than in our adaptation**. We suggest verifying the same usage on Alibaba Cloud's own Bailian platform first (console: `bailian.console.aliyun.com`):

* if the official platform rejects it too, it is a model-side limitation and there is nothing we can route around;
* if it works there but not here, send us the request body and we will take it up with the channel provider.

If your goal is simply **to get work done inside Claude Code and similar clients**, the APIYI **Claude series** or **OpenAI series** is the easier path — the default group is officially routed and needs no extra adaptation.

### Other differences and field notes

* `response_format` is silently ignored (force a tool call for structured output)
* `tool_choice` only accepts the OpenAI format; **forced tool calling (`required` or a named function) is unsupported in thinking mode on both endpoints**
* Images must be base64; remote URLs return 400
* `reasoning_effort` has no effect — use `thinking: {"type": "disabled"}` to turn thinking off
* `stop_sequences` **does truncate**, but `stop_reason` is misreported as `end_turn` and the `stop_sequence` field comes back `null`, so do not rely on it to detect why generation stopped
* Streaming usage varies by route: on some routes the `input_tokens` in `message_start` is unreliable, and on others the final streamed `output_tokens` is always 0. **For exact accounting, use the non-streaming usage or your billing records**
* Measured input ceiling is 983,616 tokens; going over returns `Range of input length should be [1, 983616]`

<Tip>
  **Set generous timeouts.** The first SSE byte took 6–17 seconds in testing, with the connection completely silent until then, and larger request bodies are slower still — roughly 44 seconds at 256KB and 160 seconds at 1MB. Behind Docker, a bastion host, or a corporate gateway, an idle timeout at any hop shows up as "hangs for a long time, then exits with an error." Set the client timeout to 300 seconds or more.
</Tip>

## Parameter compatibility

| Parameter                                          | Status | Notes                                                                                                                                                |
| -------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `temperature`                                      | ✅      | Valid range `[0.0, 2.0)`; passing 2 returns 400                                                                                                      |
| `top_p`                                            | ✅      | Valid range `(0.0, 1.0]`                                                                                                                             |
| `top_k` / `presence_penalty` / `frequency_penalty` | ✅      |                                                                                                                                                      |
| `stop` / `stop_sequences`                          | ⚠️     | Truncation works, but `stop_reason` on the Anthropic endpoint is misreported as `end_turn`                                                           |
| `logprobs` / `top_logprobs`                        | ✅      |                                                                                                                                                      |
| `stream` + `stream_options`                        | ⚠️     | Long streams terminate cleanly with no tail stalling, but streamed usage varies by route — use non-streaming or billing records for exact accounting |
| `partial: true`                                    | ✅      | Prefix continuation; no thinking during continuation                                                                                                 |
| `n > 1`                                            | ⚠️     | Requires `reasoning_effort="none"`                                                                                                                   |
| `seed`                                             | ❌      | Same seed produced different output — determinism is not guaranteed                                                                                  |
| `prefix: true`                                     | ❌      | No effect; use `partial: true`                                                                                                                       |
| `thinking_budget`                                  | ❌      | The numeric value is ignored                                                                                                                         |
| Built-in web search                                | ❌      | Both `enable_search` and `tools: [{"type": "web_search"}]` are silently dropped                                                                      |

## Best practices

<CardGroup cols={2}>
  <Card title="Everyday chat and high-volume calls" icon="zap">
    Set `reasoning_effort="none"` explicitly. Measured latency dropped from \~5 s to 2 s, and output tokens to roughly 1/30.
  </Card>

  <Card title="Long documents and codebases" icon="scroll">
    128K recall was exact in testing, and long-document cache hit rates are high. Put the large document early in the message list and the question at the tail.
  </Card>

  <Card title="Data extraction" icon="braces">
    Constrain with `json_schema` and disable thinking. Conformance is unaffected.
  </Card>

  <Card title="Agents and tool orchestration" icon="wrench">
    Use `/v1/chat/completions`. Remember to disable thinking when forcing a tool call.
  </Card>
</CardGroup>

## FAQ

<AccordionGroup>
  <Accordion title="Why am I still billed a lot of tokens after setting max_tokens?">
    `max_tokens` bounds only the visible answer, not the thinking portion. We measured 1,054 output tokens billed at `max_tokens=1`. Use `reasoning_effort="none"` to control cost.
  </Accordion>

  <Accordion title="Why does tool_choice with a named function return 400?">
    Forced tool choice is not supported while thinking is on. Pass `reasoning_effort="none"` alongside it.
  </Accordion>

  <Accordion title="Why can't I reach /v1/responses?">
    This endpoint is not wired up for the model yet — all 30 test calls failed, with the error code alternating between 404 and 400. It has been reported upstream, and we will announce it in [Live Updates](/en/live) once it is available. Use `/v1/chat/completions` instead.
  </Accordion>

  <Accordion title="Can I use this model in Claude Code?">
    Not yet. The `/v1/messages` endpoint rejects history messages containing `thinking` blocks, and Claude Code replays them verbatim — so the first turn produces `tool_use` and the second turn returns 400 once `tool_result` goes back. When calling from your own code, strip those blocks and the endpoint works fine.

    If you need to get work done inside Claude Code, the APIYI Claude series or OpenAI series is the easier path — the default group is officially routed and needs no extra adaptation. You can also verify the same usage on Alibaba Cloud's Bailian platform (`bailian.console.aliyun.com`) first; if the official platform rejects it too, it is a model-side limitation.
  </Accordion>

  <Accordion title="Why does the first turn work and then it hangs or errors after I send tool results?">
    This is the classic symptom on `/v1/messages`. The replayed assistant message carries a `thinking` block, which the endpoint rejects with a 400. Setting `signature` to an empty string or `null`, or removing the field, does not help — **you must drop the entire `thinking` block**.

    Once stripped, a 12-turn tool loop at 24K context ran to completion in testing. The multi-turn `tool_use` / `tool_result` chain itself is not the problem.
  </Accordion>

  <Accordion title="Why are reasoning_tokens or cache fields sometimes missing from usage?">
    The model is served over more than one upstream route and they do not report the same usage fields: some omit `reasoning_tokens` and `cached_tokens`, some always report `cache_read_input_tokens` as 0, and some always report a final streamed `output_tokens` of 0. This has been reported upstream for alignment.

    **What the API reports is not what you are billed.** For exact accounting, use the billing detail on the individual request in the console log, which shows the full calculation for both base and cache charges.
  </Accordion>

  <Accordion title="Why are video calls so slow?">
    Video understanding measured 144–285 seconds per call; this is the model's own processing time. Set your timeout above 300 seconds and consider an async queue.
  </Accordion>
</AccordionGroup>

## Related

* [Qwen3.8-Max playground](/en/api-capabilities/qwen-3-8/chat-completions) — send requests directly
* [Qwen3.6 series (legacy)](/en/api-capabilities/qwen-3-6/overview) — the previous five models
* [Qwen3.8-Max launch notes](/en/news/qwen-3-8-max-launch) — benchmarks and full write-up
* [Model pricing](/en/models) — per-model rates, cache pricing, and available endpoints
* [Top-up promotions](/en/faq/recharge-promotions) — stackable discounts

<Info>
  Measurements on this page come from 586 live calls on 2026-08-03 (12:50–14:35 UTC+8). Billing-related conclusions are based on the usage fields returned by the API and were not cross-checked line by line against invoices. Model and gateway behavior may change as channels are adjusted — treat live calls as the source of truth.
</Info>
