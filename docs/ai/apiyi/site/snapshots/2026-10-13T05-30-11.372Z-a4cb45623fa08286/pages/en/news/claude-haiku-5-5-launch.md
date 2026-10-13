> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Haiku 5.5 Launches: 1M Context, 90% Cheaper

> Anthropic released Claude Haiku 5.5 on October 7, 2026 with a 1M context window, 128K output, and effort levels, priced at $0.10 input / $0.50 output per million tokens for prompts up to 100K. APIYI now serves claude-haiku-5-5 at official pricing.

## Key Takeaways

* **About one-tenth the price**: for prompts up to 100K tokens, input is \$0.10 and output \$0.50 per million tokens, with cache reads at \$0.01. Anthropic estimates these requests cost about 90％ less than on Haiku 4.5, even after counting the extra tokens from the new tokenizer
* **A generational capability jump**: Anthropic reports GDPval-AA knowledge work at 1620 (Haiku 4.5: 735), OSWorld 2.1 computer use at 72.4% (Haiku 4.5: 15.7%), and Terminal-Bench 4.0 at 39.2% (Haiku 4.5: 0%)
* **1M context, 128K output**: up from 200K context and 64K output on Haiku 4.5. It is also the first Haiku with effort levels (`low` through `max`)
* **5× unit price above 100K tokens**: input \$0.50 / output \$2.50. Run the numbers before using it for long documents or long conversations
* **Live on APIYI**: `claude-haiku-5-5` and `claude-haiku-5-5-thinking`, on both the OpenAI-compatible and native Anthropic endpoints, with both pricing tiers matching the official list item by item

## Background

On October 7, 2026, Anthropic released Claude Haiku 5.5, completing the Claude 5.5 family: [Opus 5.5](/en/news/claude-opus-5-5-launch) arrived in late September, [Sonnet 5.5](/en/news/claude-sonnet-5-5-launch) on September 28, and Haiku 5.5 is the last of the three. Anthropic calls it its "cheapest, fastest, and most capable small model."

Haiku has always been the high-volume tier of the Claude lineup: classification, extraction, routing, summaries, and subagent work for larger models. Haiku 4.5 shipped in October 2025, exactly a year ago. This generation is more than a refresh: context grows from 200K to 1M, thinking switches to the same adaptive thinking plus effort levels used by Sonnet and Opus, and the unit price for prompts up to 100K tokens drops to one-tenth of Haiku 4.5.

Anthropic is also clear about what it is **not** for: complex agentic coding still belongs on Sonnet 5.5 and Opus 5.5. Haiku 5.5 fits narrowly scoped tasks and subagent roles under those two models.

APIYI now serves `claude-haiku-5-5` (plus `claude-haiku-5-5-thinking`), with **every item in both pricing tiers matching the official list**.

## Detailed Analysis

### Key Features

<CardGroup cols={2}>
  <Card title="About 90％ cheaper" icon="badge-dollar-sign">
    \$0.10 input and \$0.50 output per million tokens up to 100K, versus \$1 / \$5 on Haiku 4.5. Anthropic's estimate already accounts for the new tokenizer
  </Card>

  <Card title="1M context" icon="scroll-text">
    1M-token context and 128K max output (up to 300K on the Batch API with a beta header), versus 200K / 64K on Haiku 4.5
  </Card>

  <Card title="Effort levels" icon="gauge">
    The first Haiku with effort: low, medium, high, xhigh, and max, defaulting to medium, with adaptive thinking on by default
  </Card>

  <Card title="Fastest at standard speed" icon="zap">
    Anthropic calls it its fastest model at standard speed; Artificial Analysis measures roughly 244 output tokens per second
  </Card>
</CardGroup>

### Benchmarks (vendor-reported)

| Benchmark | Haiku 5.5 | Haiku 4.5 | GPT-6 Luna | Sonnet 5.5 |
| - | - | - | - | - |
| **GDPval-AA v2.1** (knowledge work, Elo) | 1620 | 735 | 1437 | **1840** |
| **AA-Briefcase v1.1** | 1578 | 614 | 1336 | **1824** |
| **OSWorld 2.1** (computer use, offline subset) | 72.4% | 15.7% | 48.9% | **83.9%** |
| **Humanity's Last Exam** (no tools) | 45.9% | 10.2% | — | **56.9%** |
| **Humanity's Last Exam** (with tools) | 57.4% | 18.7% | — | **64.5%** |
| **Terminal-Bench 4.0** (agentic coding) | 39.2% | 0.0% | 16.4% | **70.6%** |
| **FrontierCode 1.1** (Main) | 46.4% | — | 42.4% | **52.1%** (xhigh) |
| **Chartography** (chart understanding, no tools) | 46.4% | 6.4% | 29.1% | **61.6%** |

<Info>
  Source: Anthropic's launch page `anthropic.com/claude-haiku-5-5` (October 7, 2026). Sonnet 5.5's FrontierCode score is at xhigh effort. Retrieved October 8, 2026.
</Info>

How to read it:

* **Against its price peer**: Haiku 5.5 beats OpenAI's small model GPT-6 Luna on every benchmark Anthropic lists, and more than doubles it on Terminal-Bench 4.0
* **Against Sonnet 5.5**: computer use (OSWorld 72.4% vs 83.9%) reaches about 85% of Sonnet 5.5, and knowledge work trails by about 220 Elo; agentic coding (Terminal-Bench 39.2% vs 70.6%) is where the gap is widest
* **Customer reports**: Box saw scores 11 points above Haiku 4.5 at about half the latency; Asana reported more than 30% lower task-completion latency

### Independent evaluation (Artificial Analysis)

| Metric | Haiku 5.5 (max effort) | Note |
| - | - | - |
| **Intelligence Index** (v4.3.2) | 43 | Median for reasoning models at this price: 13 |
| **Output speed** | \~244 tokens/s | Median for similar reasoning models: \~111 tokens/s |
| **Output tokens to run the full eval suite** | \~440M | Median: \~100M |

<Warning>
  **Low unit price, but verbose at high effort**: at max effort, Artificial Analysis measured about 440M output tokens across its eval suite, more than 4× the median. Add the new tokenizer (the same text yields about 30% more tokens than on Haiku 4.5), and **a 90% lower unit price does not mean a 90% lower bill**. For narrow tasks like classification and extraction, stay on the default `medium` or drop to `low` rather than defaulting to `max`.
</Warning>

### Developer notes: breaking changes from Haiku 4.5

Haiku 5.5's request shape now matches Sonnet 5.5 and Opus 5.5, so several things that worked on Haiku 4.5 return a 400:

| Change | Haiku 4.5 | Haiku 5.5 | What to do |
| - | - | - | - |
| **Manual thinking budget** | `{"type": "enabled", "budget_tokens": N}` supported | Official docs say 400 (no error in APIYI testing) | Switch to `{"type": "adaptive"}` and control depth with `effort` |
| **Sampling parameters** | `temperature` / `top_p` / `top_k` supported | Non-default values return 400 (confirmed on APIYI) | Omit all three (`temperature` must be 1, `top_p` must be 0.99, any `top_k` errors) |
| **Assistant prefill** | Supported with thinking off | 400 error, even with thinking off (confirmed on APIYI) | End `messages` with a user turn; use structured outputs for format control |
| **Computer use** | `computer_20250124` | Only `computer_toolset_20260801` | Move to the new toolset |
| **Thinking block binding** | Not checked | Sending thinking blocks back after editing `system`, `tools`, or earlier messages returns 400 | Keep conversations append-only |

A few changes don't error but do change results:

* **Responses can start with a thinking block**: adaptive thinking is on by default, so a thinking block can appear even if the request never mentions thinking. Select text blocks by type instead of reading the first block
* **Thinking tokens count toward `max_tokens`**: a small `max_tokens` carried over from Haiku 4.5 can stop right after thinking, before any text. Raise it or lower the effort
* **Thinking text is omitted by default**: set `thinking: {"type": "adaptive", "display": "summarized"}` if you want a summary
* **Forced tool use works**: `tool_choice` set to `any` or a named tool does not error (it does on Sonnet 5.5), but the model skips thinking and calls the tool directly
* **Safety classifiers**: refusals come back as `stop_reason: "refusal"` with **no** server-side fallback to another model, so handle it in your client

### Specifications

| Parameter | Value |
| - | - |
| **Model ID** | `claude-haiku-5-5` (APIYI also offers `claude-haiku-5-5-thinking`) |
| **Context window** | 1,000,000 tokens |
| **Max output** | 128,000 tokens |
| **Input / output** | Text and images → text |
| **Knowledge cutoff** | June 2026 |
| **Thinking** | Adaptive, on by default; can be turned off with `{"type": "disabled"}` at `high` effort or below |
| **Effort levels** | `low` / `medium` / `high` / `xhigh` / `max`, **default `medium`** |
| **Tokenizer** | Same as Claude 4.7 and later; the same text yields about 30% more tokens than on Haiku 4.5 |
| **API formats** | OpenAI-compatible / native Anthropic |

### APIYI test results

Live calls on APIYI on October 8, 2026 (UTC+8):

| Test | Result |
| - | - |
| Native Anthropic `/v1/messages` and OpenAI-compatible `/v1/chat/completions` | ✅ Both return normally with model name `claude-haiku-5-5`; short Q\&A in about 2 s |
| Long context (163,714 input tokens in one request) | ✅ Returns normally |
| Two-tier billing | ✅ A 78,314-token request was charged \$0.007832 (lower tier); a 163,714-token request was charged \$0.081866, the whole request at the higher tier, matching the official unit prices exactly |
| `effort: "low"` on a simple comparison | ✅ Zero thinking tokens, about 2.4 s |
| `effort: "max"` on a short math proof | ✅ 1,078 output tokens, 796 of them thinking, about 6 s |
| `thinking: {"type": "disabled"}` | ✅ Works (unlike Sonnet 5.5, Haiku 5.5 can turn thinking off directly) |
| `thinking` set to `enabled` with `budget_tokens` | ⚠️ No error, returns normally; the official docs say this returns 400, so still switch to adaptive thinking |
| `temperature: 0.3` / `top_k` / `top_p` | ❌ 400 with the message `` `temperature` is deprecated for this model ``, on both endpoints |
| Assistant prefill | ❌ 400, the conversation must end with a user message |
| `tool_choice: {"type": "any"}` | ✅ Works, returns the tool call directly with no thinking block |
| `claude-haiku-5-5-thinking` | Same adaptive thinking as the base model; simple prompts produce no thinking tokens either |

<Info>
  **About parameter compatibility**: basic sampling parameters such as `temperature`, `top_p`, and `top_k` are easy to send by accident, since many clients and SDKs include them by default, and once a new model deprecates them, existing code fails across the board after an upgrade. APIYI may therefore handle these deprecated basic parameters compatibly, ignoring them instead of returning an error. So **when a parameter does not return the 400 the official docs describe, that does not mean the request skipped the provider's model**: compatibility changes only how the parameter is handled, not the model itself. When migrating, still drop these three parameters as the official docs require, and contact support if anything in the output looks off.
</Info>

## Practical Use

### Recommended scenarios

1. **Classification, extraction, routing**: the primary use case. High-volume, short requests under 100K tokens land squarely in the cheapest tier
2. **Subagent for larger models**: handle lookups, summaries, and data pulls inside coding or research workflows led by Opus 5.5 or Sonnet 5.5
3. **Compaction and summaries**: long-conversation compaction, meeting notes, ticket summaries, fast and cheap
4. **Replacing Haiku 4.5**: most Haiku 4.5 workloads get noticeably stronger and cheaper, but check the migration items below first

### Code examples

#### Native Anthropic format

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com"
)

message = client.messages.create(
    model="claude-haiku-5-5",
    max_tokens=4000,                   # thinking tokens count here too, don't set it too low
    output_config={"effort": "low"},   # default is medium; low is enough for classification
    messages=[
        {"role": "user", "content": "Classify this ticket as: billing / technical issue / account / other. Output the category only.\n\nTicket: My top-up didn't show up in my balance"}
    ]
)

for block in message.content:          # pick text by type, don't read content[0] directly
    if block.type == "text":
        print(block.text)
```

#### OpenAI-compatible format

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="claude-haiku-5-5",
    # don't send temperature / top_p / top_k
    messages=[
        {"role": "user", "content": "Extract the company name, amount, and date from the text below as JSON."}
    ]
)

print(response.choices[0].message.content)
```

### Six-step checklist for migrating from Haiku 4.5

1. **Change the model ID**: `claude-haiku-4-5-20251001` → `claude-haiku-5-5` (no date suffix)
2. **Recount tokens**: the new tokenizer yields about 30% more tokens for the same text, so recompute `max_tokens` and cost estimates
3. **Replace the thinking config**: swap `budget_tokens` for adaptive thinking plus `effort`
4. **Drop sampling parameters and prefill**: don't send `temperature` / `top_p` / `top_k`, and end `messages` with a user turn
5. **Select content blocks by type**: responses can begin with a thinking block
6. **Handle refusals**: detect `stop_reason: "refusal"` and fall back to another model yourself if needed

## Pricing and Availability

### Pricing

Official prices (USD per million tokens), split into two tiers by the input length of each request:

| Item | Haiku 5.5 (≤ 100K tokens) | Haiku 5.5 (> 100K tokens) | Haiku 4.5 |
| - | - | - | - |
| **Input** | **\$0.10** | \$0.50 | \$1.00 |
| **Output** | **\$0.50** | \$2.50 | \$5.00 |
| **Cache write (5 min)** | **\$0.125** | \$0.625 | \$1.25 |
| **Cache write (1 hour)** | **\$0.20** | \$1.00 | \$2.00 |
| **Cache read** | **\$0.01** | \$0.05 | \$0.10 |

The two Haiku 5.5 columns are also APIYI's prices: **both tiers and all five items match the official list, with no markup**.

<Note>Model prices are aligned with the official site and may change when it does; the table above is for reference only, and the **Model Pricing** tab in the top navigation is authoritative: [Model Pricing](/en/models/index).</Note>

<Warning>
  **Above 100K tokens, the whole request bills at the higher tier**: once input exceeds 100K tokens, every item is billed from the right-hand column at 5× the lower tier. Anthropic says about 90% of Haiku 4.5 requests fell under 100K, but if your workload sends whole documents, long sessions, or large code bases, the higher tier is half of Haiku 4.5's price rather than one-tenth. Where possible, split long inputs into several requests under 100K.
</Warning>

<Info>
  **Our pricing matches the official list, with no markup on the model price.** On top of that, some groups carry an extra discount and you can stack the top-up bonus; that is APIYI's own discount and separate from the model's pricing.

  For actual charges, rely on the live data under "Cache billing details" in the console; the cache fields in the API's usage response are not a billing reference.
</Info>

### Groups and endpoints

| Item | Details |
| - | - |
| **Model name** | `claude-haiku-5-5` (plus `claude-haiku-5-5-thinking`) |
| **Groups** | `default` / `svip` / `ClaudeCode` / `Claude_Enterprise` |
| **OpenAI-compatible** | `https://api.apiyi.com/v1` |
| **Native Anthropic** | `https://api.apiyi.com` |

<Info>
  The `ClaudeCode` group serves Claude Code and other native Anthropic clients, carries an extra discount, and stacks with the top-up bonus. `Claude_Enterprise` is the enterprise group added on October 7 (1.2x rate, Anthropic first-party channel only); see the [live update](/en/live/2026-10/claude-enterprise-group). **Match the protocol to the group**: use `ClaudeCode` for the native Anthropic protocol and `default` / `svip` for the OpenAI-compatible protocol.
</Info>

### Stack the top-up bonus

Combine with APIYI's top-up bonus to lower your effective cost further. See [Recharge Promotions](/en/faq/recharge-promotions).

## Summary and Recommendations

Claude Haiku 5.5 cuts small-model pricing by another order of magnitude while jumping a full generation ahead of Haiku 4.5: computer use approaches Sonnet 5.5, and it leads GPT-6 Luna on every benchmark Anthropic lists. For high-volume work such as classification, extraction, summaries, and subagents, it is now the best-value model in the Claude family.

**Recommendations**:

1. **On Haiku 4.5 today**: upgrade, but run the six-step checklist first; sampling parameters, prefill, and `budget_tokens` all return a 400
2. **Running narrow tasks on Sonnet or Opus**: hand lookups, summaries, and classification off to Haiku 5.5 and keep the larger model for decisions; overall cost drops noticeably
3. **Keep costs in check**: start effort at `low` or `medium`, and keep single inputs under 100K tokens to avoid the 5× tier

<Info>
  Sources: Anthropic launch page `anthropic.com/claude-haiku-5-5`; Anthropic developer docs `platform.claude.com/docs/en/models/haiku-5-5/overview`, `whats-new-haiku-5-5`, and `migration-guide`; Artificial Analysis model page `artificialanalysis.ai/models/claude-haiku-5-5`; coverage including MarkTechPost; the "APIYI test results" section comes from live calls on APIYI on October 8, 2026. APIYI pricing follows live platform data. Retrieved October 8, 2026.
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.