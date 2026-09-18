> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Does APIYI Support Cache Billing?

> Yes. Claude, OpenAI, Gemini, DeepSeek, Qwen, Grok, and other major channels all support cache billing — hit fields are returned untouched and bills follow official discount rates

## Short Answer

**Yes.** APIYI's **Claude, OpenAI, Gemini, DeepSeek, Qwen, and Grok** channels all support cache billing: cache-related request parameters are forwarded upstream as-is, cache-hit fields come back to you untouched, and the billing dashboard lists cached usage as separate line items at the official discount rates — no middleware-specific adaptation needed in your code.

**Claude and OpenAI cache hits are stable and reliable** (both have dedicated guides on this site — linked below). DeepSeek, Qwen, and Grok all use fully automatic prefix caching and hit normally with a stable prefix — though **Grok's upstream explicitly makes no guarantee of a hit**, so budget at the uncached price. Gemini's implicit caching is supported, but its **hit rate is mediocre** — don't build your cost budget around Gemini caching.

## The Three Channels at a Glance

|                       | OpenAI (gpt-5 series)                                              | Claude                                                             | Gemini                                                             |
| --------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Trigger               | **Fully automatic**, zero code                                     | Manual `cache_control` markers                                     | Implicit caching, auto-enabled                                     |
| Minimum threshold     | 1024 tokens                                                        | 1024–4096 tokens by model                                          | 4096 (3 series) / 2048 (2.5 series)                                |
| Write fee             | Free                                                               | 1.25× (5 min) / 2× (1 hour)                                        | Free                                                               |
| Hit price             | 0.1× of input                                                      | 0.1× of input                                                      | Per Google's official discount                                     |
| Real-world experience | ✅ Stable hits                                                      | ✅ Stable hits                                                      | ⚠️ Mediocre hit rate                                               |
| Full guide            | [OpenAI Cache Billing](/en/api-capabilities/openai/prompt-caching) | [Claude Cache Billing](/en/api-capabilities/claude-prompt-caching) | [Gemini Cache Billing](/en/api-capabilities/gemini/prompt-caching) |

## Channel Notes

### OpenAI: fully automatic, zero effort

Keep a stable prefix of at least 1024 tokens and hits happen automatically — the matched portion bills at **10% of the input price**, with no write fee, so the 2nd request is already pure savings. How to write requests that hit and how to use `prompt_cache_key`: see the [OpenAI Prompt Caching Billing Guide](/en/api-capabilities/openai/prompt-caching).

### Claude: manual markers, biggest savings

Add `cache_control` to the content blocks you want cached; hits bill at **0.1×** (writes cost 1.25× / 2×). Essential for Claude Code, Cline, Cursor, and other heavy workloads. Note it **only works in the Anthropic native format (`/v1/messages`)** — calling Claude through the OpenAI-compatible format gets no cache discount. See the [Claude Prompt Caching Billing Guide](/en/api-capabilities/claude-prompt-caching).

### Gemini: supported, but keep expectations low

APIYI auto-enables implicit context caching for the Gemini native format, and hits bill at Google's official discount. In practice, however, **Gemini's cache hit rate is clearly below Claude / OpenAI** (upstream implicit caching behavior is not controllable). Our advice:

* Treat the cache discount as a nice-to-have bonus — **estimate costs at the uncached price**
* For cache-sensitive workloads with long, frequent prefixes, prefer the OpenAI or Claude channels

## Other Channels: DeepSeek / Qwen / Grok

Caching on these channels is **fully automatic** (no markers needed), works normally through APIYI, and performs well in practice:

| Channel        | Trigger                                                        | Hit discount (official)                                                                                                                     | Hit reliability                                           |
| -------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **DeepSeek**   | Automatic, prefix matching                                     | Hits save **over 90%** — the steepest discount of the lot                                                                                   | Stable                                                    |
| **Qwen**       | Implicit caching, auto-enabled, prefix of at least 1024 tokens | Hits bill at the official discounted rate                                                                                                   | Stable                                                    |
| **Grok (xAI)** | Automatic, prefix matching                                     | Hits save roughly **75%** (`grok-4.6`; varies by model tier) — see the [Grok cache billing guide](/en/api-capabilities/grok/prompt-caching) | Deterministic when they happen, but no upstream guarantee |

Raising hit rates works the same way as with OpenAI: **stable content first, volatile content last** — keep timestamps and random IDs out of the start of the prompt. The "stable prefix" playbook in the [OpenAI Cache Billing Guide](/en/api-capabilities/openai/prompt-caching) applies directly.

## How to Confirm a Hit

Check the cache fields in the response `usage`:

| Channel                            | Hit field                                                    |
| ---------------------------------- | ------------------------------------------------------------ |
| OpenAI `/v1/chat/completions`      | `usage.prompt_tokens_details.cached_tokens`                  |
| OpenAI `/v1/responses`             | `usage.input_tokens_details.cached_tokens`                   |
| Claude `/v1/messages`              | `usage.cache_read_input_tokens`                              |
| Gemini native format               | `usageMetadata.cachedContentTokenCount`                      |
| DeepSeek                           | `usage.prompt_cache_hit_tokens` / `prompt_cache_miss_tokens` |
| Qwen / Grok `/v1/chat/completions` | `usage.prompt_tokens_details.cached_tokens`                  |
| Grok `/v1/responses`               | `usage.input_tokens_details.cached_tokens`                   |

A value above 0 means a hit. In the dashboard call logs, cached usage appears as separate discounted line items you can verify directly.

## Things to Watch

<Warning>
  **Caching follows the call format**: calling Claude models through the OpenAI-compatible format (`/v1/chat/completions`) cannot get Claude's cache discount — use the native `/v1/messages` format for heavy Claude usage.
</Warning>

* Caches are **isolated per model**: switching models (even within the same series) shares nothing
* For vendors not listed above (Kimi, etc.), go by the cache fields actually returned in your call logs
* Official mechanism details: `platform.openai.com/docs/guides/prompt-caching`, `docs.claude.com/en/docs/build-with-claude/prompt-caching`, `ai.google.dev/gemini-api/docs/caching`, `api-docs.deepseek.com/quick_start/pricing`, `docs.x.ai/developers/advanced-api-usage/prompt-caching`

## Related Docs

<CardGroup cols={2}>
  <Card title="OpenAI Cache Billing Guide" icon="database" href="/en/api-capabilities/openai/prompt-caching">
    Automatic caching: 1024-token threshold, 90%-off hits, prompt\_cache\_key routing
  </Card>

  <Card title="Grok Cache Billing Guide" icon="database" href="/en/api-capabilities/grok/prompt-caching">
    75% off on hits, 128-token block granularity, and which endpoint suits long conversations
  </Card>

  <Card title="Gemini Cache Billing Guide" icon="database" href="/en/api-capabilities/gemini/prompt-caching">
    Implicit caching thresholds and what to expect
  </Card>

  <Card title="Claude Cache Billing Guide" icon="database" href="/en/api-capabilities/claude-prompt-caching">
    Where to place cache\_control, break-even math, multi-turn techniques
  </Card>

  <Card title="Model Multipliers" icon="calculator" href="/en/faq/model-multiplier">
    How console group multipliers convert to USD prices
  </Card>

  <Card title="Call Logs" icon="file-text" href="/en/faq/call-logs">
    Inspect per-request token usage and cache billing details
  </Card>
</CardGroup>

## Contact Us

<CardGroup cols={2}>
  <Card title="WeCom Support" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeCom support QR code" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    Scan to add, or [contact support](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    Cache billing questions and technical support
  </Card>

  <Card title="Email" icon="mail">
    **Support**: [support@apiyi.com](mailto:support@apiyi.com)

    **Business**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
