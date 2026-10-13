> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok Model Series Guide

> xAI Grok 4.x series (grok-4.7 / grok-4.6 / grok-4.5 / grok-4.3 / grok-4.20 / grok-build-0.1) on APIYI: OpenAI-compatible + Responses API dual endpoints, with web search / X search / code execution / MCP server-side tools verified working. Pricing matches xAI official, and the default group is the official relay line.

Grok is xAI's flagship model family. The current generation (Grok 4.x) spans five product lines — flagship general-purpose, long-context standard, reasoning/non-reasoning variants, code-focused, and multi-agent collaboration — all available on APIYI. **xAI's official API is itself OpenAI-compatible** (Chat Completions + Responses API) with no separate proprietary protocol, so calling Grok through APIYI with the OpenAI SDK gives you the full feature set, including official server-side tools (web search, X search, code execution, Remote MCP).

This documentation group is based on a full hands-on test against the APIYI gateway on July 13, 2026 (UTC+8) — 56 request/response logs — so every capability boundary stated here is verified.

<Note>
  **🚀 Highlights**: `grok-4.7` is SpaceXAI (xAI)'s newest flagship, released September 21, 2026. It moves to a new 2.1T-parameter base model with the biggest gains in coding agents, and its **price is identical to grok-4.6**; grok-4.3 and the grok-4.20 series offer a **1M-token context window**; the Responses API tools **web\_search / x\_search / code\_interpreter / MCP are all verified working on APIYI**, and X search is a capability unique to Grok; native responses support also means Grok can [plug straight into OpenAI Codex](/en/scenarios/programming/codex-cli). The whole Grok series runs on the xAI official relay line in the default group, priced the same as xAI; see "Groups and Discounts" below.
</Note>

## Model Lineup

<CardGroup cols={3}>
  <Card title="grok-4.7" icon="trophy">
    **Newest Flagship · Code & Agents**

    Released 2026/9/21, 500K context. A new 2.1T-parameter base at the same price as grok-4.6, with clear gains on long coding tasks.
  </Card>

  <Card title="grok-4.6" icon="award">
    **Previous Flagship · Same Price**

    Released 2026/8/7, 500K context. Same foundation as grok-4.5, with stronger self-verification on long-running tasks.
  </Card>

  <Card title="grok-4.5" icon="medal">
    **Previous Flagship · Same Price**

    500K context, with the same input and output price as grok-4.6 — existing workloads can stay on it.
  </Card>

  <Card title="grok-4.3" icon="scale">
    **Standard Workhorse**

    1M context at roughly 60% of the flagship price — the balanced choice for everyday chat and mid-level reasoning.
  </Card>

  <Card title="grok-4.20 Variants" icon="split">
    **Reasoning / Non-Reasoning**

    `-reasoning` and `-non-reasoning` share the same price and 1M context; pick based on whether you want chain-of-thought.
  </Card>

  <Card title="grok-build-0.1" icon="code">
    **Code-Focused**

    256K context and the lowest price in the series — ideal for high-frequency code completion and light coding tasks.
  </Card>

  <Card title="grok-4.20-multi-agent-beta-0309" icon="users">
    **Multi-Agent Collaboration**

    Multiple agents work in parallel on complex research tasks. Special billing profile — see [Multi-Agent Model](/en/api-capabilities/grok/multi-agent).
  </Card>

  <Card title="More Capability Pages" icon="book-open">
    Chat/reasoning/vision: [Chat & Reasoning](/en/api-capabilities/grok/chat); live search: [Web & X Search](/en/api-capabilities/grok/web-search).
  </Card>
</CardGroup>

## Pricing

Pricing matches xAI's official pricing (verified item-by-item against the APIYI pricing API on 2026-07-13; `grok-4.6` re-verified 2026-08-13 and `grok-4.7` on 2026-09-24), and [recharge promotions](/en/faq/recharge-promotions) stack on top.

The table below is the **0 – 200K context tier** (the whole Grok series is billed in tiers by context length; the higher tier is covered below):

| Model ID | Context | Input | Output | Positioning |
| - | - | - | - | - |
| `grok-4.7` | 500K | \$2.00 / 1M tokens | \$6.00 / 1M tokens | **Newest flagship**: code / agents / general |
| `grok-4.6` | 500K | \$2.00 / 1M tokens | \$6.00 / 1M tokens | Previous flagship, same price as 4.7 |
| `grok-4.5` | 500K | \$2.00 / 1M tokens | \$6.00 / 1M tokens | Previous flagship, same price as 4.6 |
| `grok-4.3` | 1M | \$1.25 / 1M tokens | \$2.50 / 1M tokens | Standard workhorse |
| `grok-4.20-0309-reasoning` | 1M | \$1.25 / 1M tokens | \$2.50 / 1M tokens | Reasoning variant |
| `grok-4.20-0309-non-reasoning` | 1M | \$1.25 / 1M tokens | \$2.50 / 1M tokens | Non-reasoning (fast, low-cost) |
| `grok-4.20-multi-agent-beta-0309` | 1M | \$1.25 / 1M tokens | \$2.50 / 1M tokens | Multi-agent (billing amplification!) |
| `grok-build-0.1` | 256K | \$1.00 / 1M tokens | \$2.00 / 1M tokens | Code-focused |

### Tiered Billing and Cache Rates

The whole Grok series bills in two tiers based on **the context length of a single request**, with the break at 200K tokens (200Ki = 204,800). Above that point, input and output rates double:

| Model | Tier | Input | Output | Cached read |
| - | - | - | - | - |
| `grok-4.7` | 0 – 200K | \$2.00 | \$6.00 | \$0.50 |
| `grok-4.7` | 200K – 500K | \$4.00 | \$12.00 | \$1.00 |
| `grok-4.6` | 0 – 200K | \$2.00 | \$6.00 | \$0.50 |
| `grok-4.6` | 200K – 512K | \$4.00 | \$12.00 | \$1.00 |
| `grok-4.5` | 0 – 200K | \$2.00 | \$6.00 | \$0.30 |
| `grok-4.5` | 200K – 512K | \$4.00 | \$12.00 | \$0.60 |
| `grok-4.3` / `grok-4.20` series | 0 – 200K | \$1.25 | \$2.50 | \$0.20 |
| `grok-4.3` / `grok-4.20` series | 200K – 1M | \$2.50 | \$5.00 | \$0.40 |
| `grok-build-0.1` | 0 – 200K | \$1.00 | \$2.00 | \$0.20 |
| `grok-build-0.1` | 200K – 256K | \$2.00 | \$4.00 | \$0.40 |

All figures are per 1M tokens. `grok-4.7` and `grok-4.6` are identical on all four billing items; **the only price difference between `grok-4.6` and `grok-4.5` is the cached read rate** (\$0.50 vs \$0.30) — input and output are identical.

Both tiers of `grok-4.7` and `grok-4.6` have been verified item-by-item for input, output and cached read (the `grok-4.7` tier break is 200,000 tokens); the second-tier cached read rates for the other models are derived from xAI's "second tier doubles" convention, so treat the live pricing on the [model info page](/en/api-capabilities/model-info) as authoritative.

<Info>
  * The aliases `grok-code-fast` / `grok-code-fast-1` are also callable (connectivity verified); see the [model info page](/en/api-capabilities/model-info) for their pricing.
  * Cached input tokens are billed at the cached read rate in the table above. Grok prefix caching is **automatic — no configuration needed**, verified across both endpoints and both streaming and non-streaming; see the [Grok cache billing guide](/en/api-capabilities/grok/prompt-caching).
  * Watch the tier break on long-context work: a single 210K-token request is billed entirely at the second tier, not just the 10K above the line. Splitting requests avoids the jump.
</Info>

## Groups and Discounts

| Group | Multiplier | Notes |
| - | - | - |
| `default` | 1.0x | Default group, which is the xAI official relay line, priced the same as xAI |
| `CodexResponses` | 1.0x | For Codex and other Responses clients; same models and pricing as the default group |

The Grok series uses the xAI official relay line in the default group, so there is no longer a separate official relay group. The former `GrokOfficial` group is no longer listed, also runs at 1x, and Tokens already using it need no changes.

To lower costs further, stack a [top-up bonus](/en/faq/recharge-promotions), tiered by the amount of each top-up.

## Verified Capability Matrix

Tested on 2026-07-13 (UTC+8) against the APIYI gateway (✅ verified working; ◐ not yet tested, expected identical on the same architecture; — not covered, expected identical on the same architecture):

| Capability | grok-4.6 | grok-4.5 | grok-4.3 | 4.20-reasoning | 4.20-non-reasoning | grok-build-0.1 | multi-agent |
| - | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| Basic chat | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Streaming (with usage) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Chain-of-thought `reasoning_content` | ◐ on by default | ✅ on by default | ✅ on by default | ✅ | ❌ off by design | ✅ on by default | internal only |
| `reasoning_effort` parameter | ◐ | ✅ | — | ❌ explicitly rejected | — | — | — |
| Structured Outputs (json\_schema) | ◐ | ✅ | ✅ | ✅ | — | ✅ | ✅ |
| Function calling / Tool Use | ◐ | ✅ | ✅ | — | — | ✅ | — |
| Vision input (image understanding) | ◐ | ✅ | ✅ | — | ✅ | — | — |
| Prompt caching (automatic) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Responses API + server-side tools | ◐ | ✅ | — | — | — | — | — |

<Note>
  **Why the `grok-4.6` column still carries ◐ marks**: this 56-request test run dates from 2026-07-13, before 4.6 existed. On 2026-08-19 we re-tested **basic chat, streaming (with usage) and prompt caching** on 4.6 — across both `/v1/chat/completions` and `/v1/responses`, streaming and non-streaming, with billing reconciled line by line — so those rows now report verified results. The remaining ◐ marks carry over the same-architecture expectation: 4.6 shares the 1.5T-parameter V9 foundation, API protocol and endpoints of 4.5, and xAI has announced no breaking parameter-level changes. Run a small sample against your own use case before putting it into production.

  `grok-4.7` (released 2026-09-21) is not in this matrix yet. It moves to a new 2.1T base model, so the same-foundation inference above does not apply; run a small sample on your own use case before adopting it.
</Note>

## Endpoints

| Endpoint | Method | Purpose |
| - | - | - |
| `/v1/chat/completions` | `POST` | Chat / reasoning / function calling / structured outputs / vision (shared by all models; select via `model`) |
| `/v1/responses` | `POST` | Responses API: web search, X search, code execution, Remote MCP and other server-side tools |

### Use It Directly in Codex

Because Grok natively supports `/v1/responses`, it is one of the few non-OpenAI models that runs in **OpenAI Codex** (desktop app / IDE extension / CLI) over the native responses protocol — set `model = "grok-4.6"` and `wire_api = "responses"` in `config.toml` and you're connected in 5 minutes, with Codex's agent features (tool calls, reasoning items, etc.) all on the native protocol. By contrast, Claude / Gemini on APIYI only run in OpenAI-compatible chat mode (`wire_api = "chat"` fallback), which carries protocol incompatibilities in Codex / agent scenarios. Full setup steps: [Codex Integration Guide](/en/scenarios/programming/codex-cli).

<Warning>
  **The following are NOT supported on APIYI** (verified — avoid these pitfalls):

  * **Legacy Completions (`/v1/completions`)**: rejected upstream — the entire Grok 4.x line is a reasoning architecture and does not support raw text completion at the official level
  * **Legacy live-search parameter `search_parameters`**: removed by xAI (verified 410). All live search goes through Responses API tools — see [Web & X Search](/en/api-capabilities/grok/web-search)
  * **Batch API / Files**: not routed by the gateway; not applicable to key-pool mode
  * **Deferred Completions (`deferred: true`)**: the parameter is **silently ignored** — the request executes synchronously and is billed normally. Do not rely on it
  * **Collections Search (RAG / file\_search)**: requires collections pre-built in the xAI console; not applicable to key-pool mode
  * **Context Compaction (`/v1/responses/compact`)**, **Priority Processing (`service_tier: "priority"` — falls back to default in testing)**, **WebSocket mode**, **mTLS authentication**: all unsupported
</Warning>

## Quick Start

<CodeGroup>
  ```bash cURL theme={null}
  curl -X POST "https://api.apiyi.com/v1/chat/completions" \
    -H "Authorization: Bearer sk-your-api-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "grok-4.6",
      "messages": [
        {"role": "user", "content": "Introduce yourself in one sentence"}
      ]
    }'
  ```

  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="sk-your-api-key",
      base_url="https://api.apiyi.com/v1"
  )

  resp = client.chat.completions.create(
      model="grok-4.6",
      messages=[{"role": "user", "content": "Introduce yourself in one sentence"}]
  )
  print(resp.choices[0].message.content)
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'sk-your-api-key',
    baseURL: 'https://api.apiyi.com/v1',
  });

  const resp = await client.chat.completions.create({
    model: 'grok-4.6',
    messages: [{ role: 'user', content: 'Introduce yourself in one sentence' }],
  });
  console.log(resp.choices[0].message.content);
  ```
</CodeGroup>

<Tip>
  **Which model to pick**: default to `grok-4.3` (1M context, balanced price); upgrade to `grok-4.7` for coding agents and complex tasks (the newest flagship, priced identically to `grok-4.6`, though it uses more output tokens per task, so compare cost on real tasks first); use `grok-4.20-0309-non-reasoning` for fast, low-cost answers (no chain-of-thought, cheapest output); `grok-build-0.1` for high-frequency code completion; and only reach for the multi-agent model on complex research tasks (mind its billing amplification). To lower costs further, stack a top-up bonus.
</Tip>

## Billing Note: Reasoning Tokens

`grok-4.7` / `grok-4.6` / `grok-4.5` / `grok-4.3` / `grok-build-0.1` **reason internally by default**: responses include `reasoning_content`, and reasoning tokens count toward output billing. In testing, a short answer showed just 30 visible tokens but billed 586 output tokens (556 of them reasoning). For cost-sensitive short Q\&A, switch to `grok-4.20-0309-non-reasoning`. Details in [Chat & Reasoning](/en/api-capabilities/grok/chat).

## FAQ

<AccordionGroup>
  <Accordion title="Does Grok have its own native API format?">
    No separate proprietary protocol. xAI's official REST API is OpenAI-compatible: `/v1/chat/completions` (chat) plus `/v1/responses` (Responses API and server-side tools). Point the OpenAI SDK at `https://api.apiyi.com/v1` and you get the full feature set — there is no "compatibility-mode downgrade".
  </Accordion>

  <Accordion title="How do I enable web search?">
    Use the Responses API: `tools: [{"type": "web_search"}]` (or `x_search`). The legacy `search_parameters` field on Chat Completions has been removed by xAI (verified 410) — do not use it. See [Web & X Search](/en/api-capabilities/grok/web-search).
  </Accordion>

  <Accordion title="The model introduces itself as Grok 4 — is my request hitting the wrong model?">
    This is normal. All Grok 4.x models self-identify simply as "Grok 4" (the multi-agent model calls itself Oppie) and won't report exact version numbers like 4.6 / 4.5 / 4.3. Verify identity via the `model` field in your request and the response, not the model's self-introduction.
  </Accordion>

  <Accordion title="Does caching need configuration?">
    No. Grok prefix caching is automatic; check hits via `usage.prompt_tokens_details.cached_tokens` (on `/v1/responses`, read `usage.input_tokens_details.cached_tokens`). Hits round down to 128 tokens, which both test rounds agree on: an 8802-token prefix hit 8704, a 2735-token prefix hit 2688. xAI states that cache entries can be evicted and hits are not guaranteed, so **budget at the uncached price**. Full details in the [Grok cache billing guide](/en/api-capabilities/grok/prompt-caching).
  </Accordion>

  <Accordion title="What happens if I exceed the context window?">
    A 400 error. Limits differ per model: grok-4.7, grok-4.6 and grok-4.5 are 500K, grok-4.3 and the 4.20 series are 1M, grok-build-0.1 is 256K. Summarize, chunk, or use RAG retrieval for longer content.
  </Accordion>

  <Accordion title="Are failed requests billed?">
    4xx client errors (bad parameters / auth failures) are not billed; requests that successfully return tokens are billed by actual usage. Note that `deferred: true` is silently ignored — the request actually runs synchronously and is billed normally.
  </Accordion>
</AccordionGroup>

## Related Docs

<CardGroup cols={2}>
  <Card title="Chat & Reasoning" icon="message-square" href="/en/api-capabilities/grok/chat">
    Streaming, chain-of-thought, structured outputs, function calling, vision, caching
  </Card>

  <Card title="Cache Billing" icon="database" href="/en/api-capabilities/grok/prompt-caching">
    75% off on hits, 128-token block granularity, and which endpoint suits long conversations
  </Card>

  <Card title="Web & X Search" icon="globe" href="/en/api-capabilities/grok/web-search">
    Hands-on with the Responses API web\_search / x\_search tools
  </Card>

  <Card title="Code Execution & MCP" icon="terminal" href="/en/api-capabilities/grok/code-execution-mcp">
    Server-side Python sandbox and Remote MCP integration
  </Card>

  <Card title="Multi-Agent Model" icon="users" href="/en/api-capabilities/grok/multi-agent">
    Capabilities and billing profile of the multi-agent model
  </Card>

  <Card title="Use Grok in Codex" icon="code" href="/en/scenarios/programming/codex-cli">
    Native responses protocol, connected to Codex in 5 minutes
  </Card>

  <Card title="Grok 4.6 Launch Deep-Dive" icon="newspaper" href="/en/news/grok-4-6-launch">
    Benchmarks, pricing and migration notes for xAI's newest flagship
  </Card>

  <Card title="Grok 4.5 Launch Deep-Dive" icon="newspaper" href="/en/news/grok-4-5-launch">
    In-depth look at the previous flagship
  </Card>

  <Card title="Model Info" icon="database" href="/en/api-capabilities/model-info">
    All available models and groups
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.