> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Opus 5.5 Is Live: Fable-Class Results for Less Than Opus 5

> Anthropic released Claude Opus 5.5 on 22 September 2026. It beats Fable 5.1 on most coding and knowledge-work benchmarks, is priced at $4/$20 per 1M tokens with cache reads at $0.20, and is live on APIYI as claude-opus-5-5 with every line item matching the provider.

## Key Takeaways

* **Fable-class results at an Opus price**: **66.4%** on Terminal-Bench 4.0, ahead of Fable 5.1 (55.8%) and Opus 5 (52.3%); it beats Fable 5.1 on most coding, knowledge-work and computer-use benchmarks
* **Lower prices across the board**: \$4 input / \$20 output per 1M tokens (Opus 5: \$5 / \$25), cache reads down from \$0.50 to **\$0.20**; Anthropic says typical workloads cost about 40% less than on Opus 5
* **Faster output**: Anthropic says it generates output more than 30% faster than Opus 5
* **Live on APIYI**: `claude-opus-5-5` and `claude-opus-5-5-thinking`, on both the OpenAI-compatible and native Anthropic endpoints, with all four billing items matching the provider
* **Four breaking changes**: thinking can't be disabled, forced tool use returns 400, thinking blocks are bound to the model and conversation, and computer use needs the new toolset; the default effort drops from `high` to `medium`

## Background

On 22 September 2026, Anthropic released Claude Opus 5.5, the first model in the Claude 5.5 family and the successor to Opus 5, which shipped two months earlier. Anthropic says Sonnet 5.5 and Haiku 5.5 will follow.

The pitch is simple: **Fable 5.1-level results on most work, at a price below Opus 5**. Fable 5.1 is priced at \$10 / \$50, so Opus 5.5 costs 40% of that. Compared with Opus 5, input and output are each 20% cheaper and cache reads are 60% cheaper.

In long agentic sessions, cache reads are a recurring cost. Cutting them from \$0.50 to \$0.20 has the most direct effect on the bill.

APIYI has launched `claude-opus-5-5` (plus `claude-opus-5-5-thinking`) with **input, output, cache write and cache read all priced in line with the provider**.

## In Detail

### Core Features

<CardGroup cols={2}>
  <Card title="Coding Beyond Fable 5.1" icon="trophy">
    Leads Fable 5.1 and Opus 5 on all three agentic coding benchmarks: Terminal-Bench 4.0, FrontierCode and CursorBench
  </Card>

  <Card title="Lower Running Cost" icon="piggy-bank">
    Input and output down 20%, cache reads down 60%; Anthropic says typical workloads cost about 40% less than on Opus 5
  </Card>

  <Card title="1M Context" icon="scroll-text">
    Same as Opus 5: a 1M-token context window (default and maximum), 128K max output, unchanged tokenizer
  </Card>

  <Card title="Safer Agent Behavior" icon="shield-check">
    Anthropic's best-scoring model on its behavioral audit; attempts to get around boundaries dropped about 85% versus Opus 5
  </Card>
</CardGroup>

### Performance Highlights

| Benchmark | Opus 5.5 | Fable 5.1 | Opus 5 | GPT-6 Astra |
| - | - | - | - | - |
| **Terminal-Bench 4.0** (agentic coding) | **66.4%** | 55.8% | 52.3% | 57.9% |
| **FrontierCode v1.1** | **54.4%** | 50.3% | 48.0% | 53.3% |
| **CursorBench 4.0** | **57.8%** | 51.8% | 46.6% | — |
| **GDPval-AA v2.1** (knowledge work, Elo) | **1846** | 1735 | 1708 | 1542 |
| **AutomationBench** | 40.0% | 31.4% | 26.9% | **41.4%** |
| **Humanity's Last Exam** (with tools) | **67.7%** | 65.6% | 63.6% | — |
| **OSWorld 2.0** (computer use) | **81.8%** | 80.7% | 74.0% | — |

<Info>
  Source: Anthropic's launch page `anthropic.com/claude-opus-5-5` (22 September 2026); most official benchmarks were run at max effort. Data retrieved 23 September 2026.
</Info>

Anthropic also shared a few real-world cases. One tester finished a 680,000-line code migration in under a day. Auditing a 200,000-line codebase took Opus 5.5 under three hours, compared with more than 20 hours for Opus 5.

### For Developers: Four Breaking Changes

Opus 5.5 keeps the Opus 5 request shape, but four things now return errors or behave differently. Check them before migrating from Opus 5:

| Change | Opus 5 | Opus 5.5 | What to do |
| - | - | - | - |
| **Thinking can't be disabled** | `disabled` accepted at `high` effort or below | `{"type": "disabled"}` and `budget_tokens` both return 400 | Omit `thinking`; use `effort: "low"` to cut latency and cost |
| **Forced tool use** | `any` / `tool` supported | `tool_choice` of `any` / `tool` returns 400 | Use `auto` + name the tool in the prompt + `strict: true`, or structured outputs |
| **Thinking-block binding** | Not bound | Blocks are bound to the model and the conversation prefix | Keep history append-only and pass thinking blocks back unchanged |
| **Computer use** | `computer_20251124` supported | Only `computer_toolset_20260801` | Switch to the new toolset |

<Warning>
  **The default effort changed**: Opus 5 defaults to `high`, Opus 5.5 to `medium`. If your coding or agent workloads relied on the default, set `effort` explicitly or results may fall short. Thinking tokens also count toward `max_tokens`; 64K is a good size for long agent turns.
</Warning>

Two more changes don't cause errors:

* Progress text written between tool calls now comes back in `thinking` blocks (empty by default; set `thinking.display: "updates"` to see it)
* The safety classifiers cover more ground: besides cybersecurity, biology requests and attempts to extract the reasoning process may also be declined (`stop_reason: "refusal"`); high-risk cybersecurity requests are routed by Anthropic to Claude Opus 4.8

### Technical Specs

| Parameter | Spec |
| - | - |
| **Model ID** | `claude-opus-5-5` (APIYI also offers `claude-opus-5-5-thinking`) |
| **Context length** | 1,000,000 tokens (default and maximum) |
| **Max output** | 128,000 tokens |
| **Knowledge cutoff** | June 2026 |
| **Thinking** | Adaptive thinking always on; depth controlled by `effort` |
| **Effort levels** | `low` / `medium` / `high` / `xhigh` / `max`, **default `medium`** |
| **API formats** | OpenAI-compatible / native Anthropic |

## Using It

### Recommended Scenarios

1. **Agentic coding**: large code migrations, repo-wide refactors and terminal automation, where the gains are largest
2. **Knowledge work**: reports, research, spreadsheets and documents, with a clear lead on GDPval-AA
3. **Computer use and automation**: 81.8% on OSWorld 2.0, a good fit for browser and desktop workflows
4. **Replacing most Fable 5.1 workloads**: outside the hardest reasoning tasks, similar or better results at 40% of the price

### Code Examples

#### Native Anthropic Format

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com"
)

message = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=64000,
    output_config={"effort": "high"},  # default is medium; raise it explicitly for coding
    messages=[
        {
            "role": "user",
            "content": "Migrate this module from callbacks to async/await, add tests, and explain the trade-off at each step."
        }
    ]
)

for block in message.content:
    if block.type == "text":
        print(block.text)
```

#### OpenAI-Compatible Format

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="claude-opus-5-5",
    messages=[
        {"role": "user", "content": "Find the root cause of this production bug step by step and propose a fix."}
    ]
)

print(response.choices[0].message.content)
```

### Five Checks When Migrating from Opus 5

1. **Change the model name**: `claude-opus-5` → `claude-opus-5-5`
2. **Remove thinking-off settings**: drop `thinking: {"type": "disabled"}`; set `effort` to `low` if you need low latency
3. **Remove forced tool use**: switch `tool_choice` to `auto`, check the reply actually contains a tool call, and retry if not
4. **Set effort explicitly**: the default is now `medium`; start coding and agent work at `high` or `xhigh`
5. **Keep history append-only**: pass thinking blocks back unchanged and don't edit `system` / `tools` / earlier messages between requests

## Pricing and Availability

### Pricing

Provider list prices (USD per 1M tokens):

| Item | Opus 5.5 | Opus 5 | Change |
| - | - | - | - |
| **Input** | **\$4.00** | \$5.00 | ↓ 20% |
| **Output** | **\$20.00** | \$25.00 | ↓ 20% |
| **Cache write (5 min)** | **\$5.00** | \$6.25 | ↓ 20% |
| **Cache read** | **\$0.20** | \$0.50 | ↓ 60% |

This table is also APIYI's pricing: **all four items match the provider, with no markup**.

<Info>
  **Our model prices match the provider; we don't mark them up.** On top of that, some groups carry discounts and you can stack top-up bonuses. That is our own give-back and separate from the model's pricing.

  For actual charges, go by the live "Cache billing details" in the console. The usage cache fields echoed by the API are not a billing reference.
</Info>

### Groups and Endpoints

| Item | Details |
| - | - |
| **Model name** | `claude-opus-5-5` (also `claude-opus-5-5-thinking`) |
| **Groups** | `default` / `svip` / `ClaudeCode` |
| **OpenAI-compatible** | `https://api.apiyi.com/v1` |
| **Native Anthropic** | `https://api.apiyi.com` |

<Info>
  The `ClaudeCode` group is for Claude Code and other clients that speak the native Anthropic protocol. **Match the group to the protocol**: use `ClaudeCode` for the native Anthropic protocol, and `default` / `svip` for the OpenAI-compatible protocol. That group carries its own discount, which stacks with top-up bonuses.
</Info>

Opus 5.5 supports zero data retention and is **not** subject to the Fable family's 30-day data retention requirement.

### Stack with Top-Up Promotions

APIYI top-up bonuses lower your effective cost further. See [Recharge Promotions](/en/faq/recharge-promotions).

## Summary

Claude Opus 5.5 is a cheaper next generation: it costs less than Opus 5, yet beats Fable 5.1, which is priced at more than twice as much, on most coding and knowledge-work benchmarks. The 60% cut to cache reads helps long sessions most.

**Recommendations**:

1. **Opus 5 users**: change the model name to upgrade, but run the five checks above first, especially thinking-off settings, forced tool use and the effort default
2. **Fable 5.1 users**: move most workloads to Opus 5.5 for an evaluation round first, at about 40% of the cost
3. **Coding / agent workflows**: set effort to `high` or `xhigh` explicitly and leave `max_tokens` room for thinking

<Info>
  Sources: Anthropic's launch page `anthropic.com/claude-opus-5-5`, Anthropic's API migration docs, and coverage from TechCrunch, MacRumors and others. APIYI prices follow live platform data. Data retrieved 23 September 2026.
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.