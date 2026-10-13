> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Sonnet 5.5 Launch: Opus-Level Coding, Same Price

> Anthropic released Claude Sonnet 5.5 on September 28, 2026, scoring 70.6% on Terminal-Bench 4.0 and matching Opus 5.5 on knowledge work, at an unchanged $2/$10 per million tokens. claude-sonnet-5-5 is live on APIYI with all four billing items matching the official price.

## Key Highlights

* **Opus-level capability at Sonnet pricing**: Anthropic reports **70.6%** on Terminal-Bench 4.0, above Opus 5.5's 66.4%; GDPval-AA knowledge work scores 1844, essentially tied with Opus 5.5's 1846
* **Unchanged pricing**: \$2 input / \$10 output per million tokens and \$0.20 cache reads, identical to Sonnet 5 and half the price of Opus 5.5
* **Faster and more token-efficient**: Anthropic says output is more than 30% faster than Sonnet 5 and the same work takes fewer tokens, cutting per-task cost by up to about 30%
* **Live on APIYI**: `claude-sonnet-5-5` and `claude-sonnet-5-5-thinking`, over both OpenAI-compatible and Anthropic-native endpoints, with all four billing items matching the official price
* **Five breaking changes**: `thinking: disabled` returns 400 (use `between_tools`), forced tool use returns 400, thinking blocks are bound to the model and conversation, computer use only accepts the new toolset, and advisor pairings are narrower. `top_p` / `top_k` are no longer supported and return an error in APIYI testing

## Background

On September 28, 2026, Anthropic released Claude Sonnet 5.5, the second model in the Claude 5.5 family after [Opus 5.5](/en/news/claude-opus-5-5-launch) a week earlier. Anthropic also said Haiku 5.5 will follow in the coming weeks.

The Sonnet line has always been the everyday workhorse: fast and moderately priced. [Sonnet 5](/en/news/claude-sonnet-5-launch) brought it close to Opus 4.8 three months ago. Sonnet 5.5 is built on the same foundation as Opus 5.5 and **now beats the flagship on agentic coding**, trails it by only 2 points on knowledge work, and costs half as much.

Anthropic describes its strongest areas as well-scoped everyday tasks, bug fixing, and producing polished documents, slides, and spreadsheets. It is also the first Sonnet model to beat Pokémon Red working only from screenshots, which Anthropic cites as evidence of its long-horizon and image-understanding abilities.

APIYI has launched `claude-sonnet-5-5` (plus `claude-sonnet-5-5-thinking`), and **input, output, cache write, and cache read billing all match the official price**.

## Detailed Analysis

### Core Features

<CardGroup cols={2}>
  <Card title="Beats Opus 5.5 at Agentic Coding" icon="trophy">
    70.6% on Terminal-Bench 4.0 (Anthropic), above Opus 5.5's 66.4%; CursorBench 4.0 rises from Sonnet 5's 34.1% to 55.5%
  </Card>

  <Card title="Faster, Fewer Tokens" icon="gauge">
    More than 30% faster output than Sonnet 5; early testers report it groups tool calls into fewer steps
  </Card>

  <Card title="1M Context" icon="scroll-text">
    1 million token context, 128K max output, and the same tokenizer as Sonnet 5, so the same text gives the same token count
  </Card>

  <Card title="Flagship-Level Knowledge Work" icon="briefcase">
    GDPval-AA 1844 and AA-Briefcase 1811, nearly tied with Opus 5.5 (1846 / 1822) and about 400 points above Sonnet 5
  </Card>
</CardGroup>

### Benchmarks (Vendor-Reported)

| Benchmark | Sonnet 5.5 | Opus 5.5 | Sonnet 5 | GPT-6 Sol |
| - | - | - | - | - |
| **Terminal-Bench 4.0** (agentic coding) | **70.6%** | 66.4% | 10.3% | — |
| **FrontierCode 1.1** (Main) | 46.2% | **54.4%** | 42.4% | 49.3% |
| **CursorBench 4.0** | 55.5% | **57.8%** | 34.1% | — |
| **GDPval-AA v2.1** (knowledge work, Elo) | 1844 | **1846** | 1449 | 1487 |
| **AA-Briefcase v1.1** | 1811 | **1822** | 1359 | 1483 |
| **Humanity's Last Exam** (with tools) | 64.5% | **67.7%** | 54.9% | — |
| **OSWorld 2.1** (computer use) | 80.1% | **81.8%** | 57.0% | — |
| **Chartography** (chart understanding, no tools) | 61.6% | **64.4%** | 15.6% | 53.6% |

<Info>
  Source: Anthropic's announcement page `anthropic.com/claude-sonnet-5-5` (September 28, 2026). Anthropic's footnotes: the Opus 5.5 Terminal-Bench score is at xhigh effort and FrontierCode at max effort; some GPT-6 Sol scores are outdated because of a recent bug fix on that side. Retrieved September 30, 2026.
</Info>

### Independent Evaluation (Artificial Analysis)

On the same benchmark, the independent evaluation reports lower scores than Anthropic, but **the ranking is the same**:

| Benchmark | Sonnet 5.5 | Opus 5.5 | Source |
| - | - | - | - |
| **Terminal-Bench 4.0** | 63.6% | 59.6% | Artificial Analysis |
| **Terminal-Bench 4.0** | 70.6% | 66.4% | Anthropic |

<Warning>
  **A lower unit price does not always mean a cheaper task**: Artificial Analysis measured Sonnet 5.5 at max effort using about **193,000 tokens per test task** on average, the highest of any model it has tested. Sonnet 5.5 defaults to `high` effort. Running everything at `xhigh` / `max` inflates token usage and can cancel out the per-token savings. Start everyday tasks at `medium` or `high` rather than maxing out by default.
</Warning>

### For Developers: Breaking Changes

Sonnet 5.5 keeps the Sonnet 5 request structure, but the following changes return errors or change the response shape. Check them before migrating:

| Change | Sonnet 5 | Sonnet 5.5 | What to do |
| - | - | - | - |
| **Turning thinking off** | `{"type": "disabled"}` accepted | `disabled` returns 400 (confirmed in APIYI testing) | Send `{"type": "between_tools"}`, only with `low` / `medium` / `high` effort |
| **Forced tool use** | `any` / `tool` supported | `tool_choice` of `any` / `tool` returns 400 | Use `auto` + `strict: true`, or structured outputs, and say in the prompt when the tool applies |
| **Thinking block binding** | Not bound to the conversation prefix | Bound to the model, conversation prefix, and account | Keep history append-only and pass thinking blocks back unchanged |
| **Computer use** | `computer_20251124` supported | Only `computer_toolset_20260801` | Switch to the new toolset |
| **Advisor tool** | Opus 4.8 / 4.7 / Sonnet 5 accepted as advisors | Those three return 400 as advisors | Use Opus 5 / 5.5, a Fable model, or Sonnet 5.5 itself |

<Warning>
  **`top_p` / `top_k` return errors**: Anthropic's documentation says Sonnet 5.5 rejects non-default `temperature` / `top_p` / `top_k`. In APIYI testing (2026-09-30), `top_p` and `top_k` are rejected on both the Anthropic-native and OpenAI-compatible endpoints with the message `` `top_p` is deprecated for this model ``. **The status code shows as 429, but it is not rate limiting**: retrying does not help, removing the parameter does. `temperature` returns 200 with any value but has no effect. Remove all three parameters in your client before switching.
</Warning>

Two more changes do not cause errors:

* **Progress text between tool calls now arrives in `thinking` blocks**: with the default `display: "omitted"` their text is empty, so an interface that streams that text to users goes quiet between tool calls. Use `between_tools` or set `thinking.display` to get it back
* **Safety classifiers**: a declined request returns HTTP 200 with `stop_reason: "refusal"`, and `stop_details` names one of five categories (`cyber` / `bio` / `frontier_llm` / `reasoning_extraction` / `general_harms`). This is the first Sonnet with cyber and anti-distillation classifiers; higher-risk cyber requests fall back to Sonnet 5 on the provider side

### Technical Specifications

| Parameter | Value |
| - | - |
| **Model ID** | `claude-sonnet-5-5` (APIYI also offers `claude-sonnet-5-5-thinking`) |
| **Context window** | 1,000,000 tokens |
| **Max output** | 128,000 tokens |
| **Input / output** | Text and images → text |
| **Knowledge cutoff** | June 2026 |
| **Thinking** | Adaptive thinking on by default; the lowest setting is `between_tools` |
| **Effort levels** | `low` / `medium` / `high` / `xhigh` / `max`, **default `high`** |
| **Minimum cacheable prompt** | 512 tokens (1,024 on Sonnet 5) |
| **API formats** | OpenAI-compatible / Anthropic-native |

### APIYI Test Results

Tested on APIYI on September 30, 2026 (UTC+8):

| Test | Result |
| - | - |
| Anthropic-native `/v1/messages` and OpenAI-compatible `/v1/chat/completions` | ✅ Both work; the response reports model `claude-sonnet-5-5` |
| `thinking: {"type": "disabled"}` | ❌ 400; the message points to `between_tools` |
| `between_tools` + `effort: "low"` | ✅ Works |
| `between_tools` + `effort: "max"` | ❌ 400; effort must be `high` or below |
| `tool_choice: {"type": "any"}` | ❌ 400, `tool_choice: type "tool" and "any" are not supported` |
| `top_p` / `top_k` | ❌ Error (shown as 429, but it is an unsupported parameter, not rate limiting), same on both endpoints |
| `temperature` | ⚠️ Any value returns 200 but has no effect |
| Simple Q\&A (default `high` effort) | Adaptive thinking decides no thinking is needed: `thinking_tokens` is 0, about 3 seconds |
| Math proof (`effort: "max"`) | 8,724 thinking tokens, 9,980 output tokens in total, about 60 seconds |
| `claude-sonnet-5-5-thinking` | Same adaptive thinking as the base model; thinking text is not returned by default (`display` is omitted), and thinking tokens are billed as usual |

The last two rows show where cost comes from: the same model spends almost no thinking tokens on a simple question, and nearly ten thousand on a hard one at `max`. The effort level affects your bill far more than the unit price does.

## Practical Applications

### Recommended Use Cases

1. **Everyday coding**: bug fixes, small repository changes, and terminal agent tasks; Terminal-Bench 4.0 shows the biggest gain
2. **Documents, slides, and spreadsheets**: an area Anthropic highlights, with AA-Briefcase and GDPval-AA close to Opus 5.5
3. **High-frequency agents and support workflows**: faster output and fewer tool-call steps suit latency-sensitive multi-turn tool use
4. **Replacing Sonnet 5 and some Opus 5.5 workloads**: a same-price upgrade from Sonnet 5; well-scoped tasks on Opus 5.5 are worth evaluating on Sonnet 5.5 at about half the cost

### Code Examples

#### Anthropic-Native Format

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com"
)

message = client.messages.create(
    model="claude-sonnet-5-5",
    max_tokens=32000,
    output_config={"effort": "medium"},  # default is high; Anthropic suggests medium for well-specified agentic coding
    messages=[
        {"role": "user", "content": "Find the root cause of this failing test and propose a minimal patch."}
    ]
)

for block in message.content:
    if block.type == "text":
        print(block.text)
```

#### Turning Off Up-Front Thinking (Replaces disabled)

```python theme={null}
message = client.messages.create(
    model="claude-sonnet-5-5",
    max_tokens=8000,
    thinking={"type": "between_tools"},  # disabled returns 400
    output_config={"effort": "low"},      # between_tools only works with low / medium / high
    messages=[{"role": "user", "content": "Rewrite this paragraph to be more concise."}]
)
```

#### OpenAI-Compatible Format

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="claude-sonnet-5-5",
    # do not send top_p / top_k (they error); temperature is accepted but has no effect
    messages=[
        {"role": "user", "content": "Review this code and point out potential bugs and improvements."}
    ]
)

print(response.choices[0].message.content)
```

### Six-Step Migration Checklist from Sonnet 5

1. **Change the model name**: `claude-sonnet-5` → `claude-sonnet-5-5`
2. **Replace the thinking-off setting**: change `thinking: {"type": "disabled"}` to `between_tools`, with effort no higher than `high`
3. **Remove forced tool use**: set `tool_choice` to `auto` and use `strict: true` to keep tool input valid
4. **Drop sampling parameters**: `top_p` / `top_k` return an error and `temperature` has no effect, so send none of them; stop using manual `budget_tokens` too and control thinking depth with `effort`
5. **Recalibrate effort**: the same level does not produce the same amount of thinking as on Sonnet 5, so re-run your evaluation instead of carrying the old setting over
6. **Keep history append-only**: pass thinking blocks back unchanged and do not edit `system` / `tools` / earlier messages between requests

## Pricing and Availability

### Pricing

Official prices (USD per million tokens):

| Item | Sonnet 5.5 | Sonnet 5 | Opus 5.5 |
| - | - | - | - |
| **Input** | **\$2.00** | \$2.00 | \$4.00 |
| **Output** | **\$10.00** | \$10.00 | \$20.00 |
| **Cache write (5 min)** | **\$2.50** | \$2.50 | \$5.00 |
| **Cache read** | **\$0.20** | \$0.20 | \$0.20 |

The Sonnet 5.5 column is also APIYI's price: **all four billing items match the official price, with no markup**.

<Note>Model prices are aligned with the official website and may change with it; the table above is for reference only, and the **Model Pricing** tab in the top navigation is authoritative: [Model Pricing](/en/models/index).</Note>

<Info>
  **Our pricing matches the official price, with no markup on the model.** On top of that, some groups carry an additional discount, and recharge bonuses can be stacked. That is our own discount and separate from the model's pricing.

  For actual charges, rely on the live data in the console's cache billing details. The cache fields in the API's usage response are not a billing reference.
</Info>

### Groups and Endpoints

| Item | Details |
| - | - |
| **Model name** | `claude-sonnet-5-5` (also `claude-sonnet-5-5-thinking`) |
| **Available groups** | `default` / `svip` / `ClaudeCode` |
| **OpenAI-compatible** | `https://api.apiyi.com/v1` |
| **Anthropic-native** | `https://api.apiyi.com` |

<Info>
  The `ClaudeCode` group is for Anthropic-native clients such as Claude Code. **Match the protocol to the group**: use the `ClaudeCode` group for the Anthropic-native protocol and the `default` / `svip` groups for the OpenAI-compatible protocol. The `ClaudeCode` group carries an additional discount that stacks with recharge bonuses.
</Info>

Sonnet 5.5 supports zero data retention and is **not** subject to the 30-day data retention requirement of the Fable series.

### Stack with Recharge Promotions

APIYI recharge bonuses can lower your effective cost further. See [Recharge Promotions](/en/faq/recharge-promotions).

## Summary and Recommendations

Claude Sonnet 5.5 is a same-price upgrade: it costs exactly what Sonnet 5 did, beats Opus 5.5 on agentic coding, trails the flagship by only 2 points on knowledge work, and runs about 30% faster. For most everyday coding and document work, it is currently the best value in the Claude lineup.

**Recommendations**:

1. **Sonnet 5 users**: upgrade directly, but go through the six-step checklist first, especially `disabled` → `between_tools`, forced tool use, and sampling parameters
2. **Opus 5.5 users**: evaluate well-scoped coding and document tasks on Sonnet 5.5 first at about half the cost; keep complex architecture decisions and long research chains on Opus 5.5
3. **Cost control**: do not default to `max` effort; start at `medium` / `high` and raise it only if results call for it

<Info>
  Sources: Anthropic's announcement page `anthropic.com/claude-sonnet-5-5`; Anthropic developer docs `platform.claude.com/docs/en/models/sonnet-5-5/overview` and `whats-new-sonnet-5-5`; Artificial Analysis independent evaluation (via Decrypt); reporting from SiliconANGLE, Unite.AI, Help Net Security, and others. The APIYI Test Results section comes from our own calls on September 30, 2026. APIYI pricing follows live platform data. Retrieved September 30, 2026.
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.