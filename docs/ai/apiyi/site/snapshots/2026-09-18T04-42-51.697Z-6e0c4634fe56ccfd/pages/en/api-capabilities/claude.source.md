> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude API Calling Basics

> APIYI provides dual-channel official-passthrough access to AWS Claude + Claude Official API at ~85% of list price, stable and pay-as-you-go.

Channel and billing highlights:

* **Default channel: AWS Claude** (AWS Bedrock official) — high stability, strong cache hit rates.
* **Backup channel: Claude Official** (direct Anthropic API with official keys) — auto-failover when the AWS channel has issues.
* **Both channels are pure official passthrough.** Pay-as-you-go, no rate limiting, all-in cost ≈ **85% of list price** (79%–86% range after stacking deposit bonuses).

<Info>
  We don't do low-cost reverse-engineered access — **only reliable, stable quality and service**.

  The Claude-access market is a bit of a mess, and the cheaper the price, the murkier it usually gets: with those low-cost channels you have no idea what they've mixed in — reverse-engineered hacks, shared accounts, dumbed-down or silently swapped models. Worse, if your conversation data gets resold, you'd never know. APIYI does pure official passthrough only (AWS Bedrock + official Anthropic keys): traceable channels, no data retention. We'd rather cost a little more and stay stable and clean.
</Info>

## Get an API Key

Create or manage tokens in the dashboard:

`https://api.apiyi.com/token`

* The **default token** works out of the box.
* If you create a new token under the **ClaudeCode group**, you get **5% off** (95% of list).
* That group discount **stacks with deposit bonuses of 10%–20%**, bringing the all-in cost down to roughly **79%–86% of list** (the "≈ 85%" headline).
* No rate limiting, cheaper than the official site, easy to use.

<Info>
  API is billed per usage (not a monthly subscription) — fees are deducted in real time from your prepaid balance.
</Info>

## Endpoints

| Item                           | Value                                       |
| ------------------------------ | ------------------------------------------- |
| **Base URL**                   | `https://api.apiyi.com`                     |
| **Anthropic native endpoint**  | `https://api.apiyi.com/v1/messages`         |
| **OpenAI-compatible endpoint** | `https://api.apiyi.com/v1/chat/completions` |

## Available Models

These three are the latest in each family — recommended for direct use:

| Family     | Model                       | Best for                         |
| ---------- | --------------------------- | -------------------------------- |
| **Opus**   | `claude-opus-4-8`           | Complex coding, deep reasoning   |
| **Sonnet** | `claude-sonnet-4-6`         | General intelligence, daily code |
| **Haiku**  | `claude-haiku-4-5-20251001` | Fast responses, high concurrency |

## Calling format: native vs OpenAI-compatible

We support **both** the Anthropic native format and the OpenAI-compatible format — but pick the right one for your case:

<CardGroup cols={2}>
  <Card title="✅ Strongly recommended: Anthropic native" icon="star">
    Endpoint: `/v1/messages`

    **If you use Claude Code, Cline, Cursor, or any Claude-heavy client, you must use the native format.**

    Only the native format properly triggers **Prompt Cache (cached billing)**, which dramatically lowers cost for long context / repeated system prompts.
  </Card>

  <Card title="⚙️ Universal: OpenAI-compatible" icon="plug">
    Endpoint: `/v1/chat/completions`

    If your project is already on the OpenAI SDK and **you don't care about cache billing**, you can switch to Claude with near-zero migration cost.

    Best for one-off scripts, light workloads, and legacy projects locked to the OpenAI SDK.
  </Card>
</CardGroup>

<Warning>
  **Cache billing only works in the Anthropic native format.** In Claude Code-style high-frequency, long-context use, the OpenAI-compatible format can lead to materially higher bills — that's an upstream protocol limitation, not an APIYI issue.
</Warning>

For details on how prompt caching works and how to verify it, see [Claude Prompt Caching Guide](/en/api-capabilities/claude-prompt-caching).

## Examples

### Anthropic native format (recommended)

```bash theme={null}
curl https://api.apiyi.com/v1/messages \
  -H "x-api-key: your-apiyi-key" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Hello, please introduce yourself."}
    ]
  }'
```

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com"
)

message = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Write a Python quicksort example."}
    ]
)

print(message.content[0].text)
```

### OpenAI-compatible format (for generic migrations)

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="claude-sonnet-4-6",
    messages=[
        {"role": "user", "content": "Hello, please introduce yourself."}
    ]
)

print(response.choices[0].message.content)
```

## A note on Opus pricing

<Warning>
  **Opus is comparatively expensive.** Day-to-day chat usage is modest, but in coding scenarios with heavy token input/output, the bill adds up quickly. We suggest starting with a **\$10 test budget** to gauge real-world consumption before committing.
</Warning>

Daily-use guidance:

* **Most scenarios**: prefer `claude-sonnet-4-6` — best price/performance.
* **Simple / high-volume tasks**: use `claude-haiku-4-5-20251001` — fast and cheap.
* **Hard coding / reasoning**: escalate to `claude-opus-4-8`.

## FAQ

<AccordionGroup>
  <Accordion title="Why doesn't APIYI offer a cheaper 'low-cost reverse-engineered' channel?">
    Because the real cost of "cheap" is the part you can't see. Reverse-engineered hacks, shared accounts, dumbed-down or quietly swapped models can all push the price down — but you have no idea what's been mixed into the channel. Output quality swings, the service can vanish overnight, and if your conversation data gets resold you'd never notice.

    We do **pure official passthrough** only: the default channel is AWS Bedrock official access, the backup is direct Anthropic with official keys — both traceable, pay-as-you-go, with no retention of your data. All-in cost lands at roughly **85% of list price**, which we think is the right line to hold between "reliable and stable" and "fairly priced." We'd rather cost a bit more than touch sketchy, untraceable cheap supply.
  </Accordion>

  <Accordion title="Getting 'thinking.type.enabled is not supported for this model'?">
    This is the most common 400 when calling Opus 4.7 / 4.8 through the AWS (Bedrock) route. The full message looks like:

    ```
    ValidationException: "thinking.type.enabled" is not supported for this model.
    Use "thinking.type.adaptive" and "output_config.effort" to control thinking behavior.
    ```

    **Cause**: the request body still uses the old fixed-budget thinking form `thinking: { "type": "enabled", "budget_tokens": N }`. Opus 4.7 / 4.8 have removed it and support adaptive thinking only.

    **Fix**: drop `type: "enabled"` and `budget_tokens`, and use `thinking: { "type": "adaptive" }` + `output_config.effort` to control thinking depth. Likewise `temperature` / `top_p` / `top_k` are removed on these models and will 400 if sent. See the [Claude Effort & Thinking Guide](/en/api-capabilities/claude-effort-thinking).
  </Accordion>
</AccordionGroup>

## Related links

* Get / manage tokens: `https://api.apiyi.com/token`
* Deposit & promotions: `https://api.apiyi.com`
* [Claude Prompt Caching Guide](/en/api-capabilities/claude-prompt-caching)
