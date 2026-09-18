> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Opus 5 Launch: Near-Fable 5 Intelligence at Half the Price

> Anthropic released Claude Opus 5 on July 24, 2026 — intelligence approaching Fable 5 at half the cost ($5/$25 per million tokens), with a 1M context window and thinking on by default. Now live on APIYI at the same price as Opus 4.8.

## Key Takeaways

* **Flagship-class intelligence at half the price**: approaches or even surpasses Fable 5 on several internal benchmarks (**43.3%** on Frontier Bench v0.1 vs Fable 5's 33.7%) at half the cost
* **No price increase**: `claude-opus-5` is live on APIYI at \$5 input / \$25 output per million tokens — identical to Opus 4.8, making it a painless drop-in upgrade
* **1M context window**: one million tokens of context by default, with up to 128K output tokens per request
* **Thinking on by default**: omitting the `thinking` parameter runs adaptive thinking; effort supports five levels (low / medium / high / xhigh / max)
* **Agentic coding powerhouse**: multi-file feature work, large refactors, code review (high precision *and* high recall), and multi-agent coordination are all standout strengths

## Background

On July 24, 2026, Anthropic officially released Claude Opus 5, succeeding Opus 4.8 in the Opus line. The positioning is blunt: **Fable 5-class intelligence at Opus 4.8's price**.

Fable 5, Anthropic's most capable model, is priced at \$10/\$50 per million tokens. Claude Opus 5 stays at \$5/\$25 yet overtakes it on some coding and knowledge-work benchmarks — scoring 43.3% on the internal Frontier Bench v0.1 versus Fable 5's 33.7%. Opus 5 also ships with less restrictive content-safety policies than Fable 5 and is **not subject to Fable 5's 30-day data-retention requirement**, which matters for compliance-sensitive teams.

APIYI has `claude-opus-5` live on day one (along with a `claude-opus-5-thinking` variant), callable via both the OpenAI-compatible and Anthropic-native endpoints.

## Deep Dive

### Core Features

<CardGroup cols={2}>
  <Card title="Near-Fable 5 Intelligence" icon="trophy">
    43.3% on Frontier Bench v0.1, ahead of Fable 5's 33.7%; industry-leading results on CursorBench, ARC-AGI 3, and more
  </Card>

  <Card title="1M Context Window" icon="scroll-text">
    One million tokens by default with 128K max output — full repositories and long documents fit in a single request
  </Card>

  <Card title="Thinking On by Default" icon="brain">
    Adaptive thinking with zero configuration; five effort levels (low through max) to trade depth against cost
  </Card>

  <Card title="Multi-Agent Coordination" icon="network">
    Reliable subagent orchestration and effective writer-verifier patterns for large parallel workloads
  </Card>
</CardGroup>

### Performance Highlights

| Benchmark / Spec           | Claude Opus 5        | Comparison                                   |
| -------------------------- | -------------------- | -------------------------------------------- |
| **Frontier Bench v0.1**    | **43.3%**            | Fable 5: 33.7%                               |
| **Pricing (input/output)** | **\$5 / \$25**       | Fable 5: \$10/\$50 — half the cost           |
| **Context window**         | **1,000,000 tokens** | Default and maximum, no long-context premium |
| **Max output**             | **128K tokens**      | Same as Opus 4.8                             |

<Info>
  Sources: Anthropic official announcement (July 24, 2026); independent coverage at TechCrunch: `techcrunch.com/2026/07/24/anthropic-launches-opus-5/`. Data retrieved July 25, 2026.
</Info>

**Coding and agentic capability**:

* Strongest on *hard* tasks: multi-file feature development, large refactors, end-to-end implementation — it completes work rather than leaving stubs.
* Code review delivers high precision and high recall at once — more real bugs found per pass with few false positives, and accuracy holds even at lower effort levels, enabling a cheap fast-review pass.

**API behavior changes (developer notes)**:

* **Thinking is on by default**: a request that omits `thinking` runs adaptive thinking (the opposite of Opus 4.8). `max_tokens` caps thinking plus response text together, so tightly-sized budgets may need raising.
* **Disabling thinking is capped**: `thinking: {"type": "disabled"}` is accepted only at effort `high` or lower — combining it with `xhigh`/`max` returns a 400.
* **Lower prompt-cache minimum**: the minimum cacheable prefix drops from 1024 to **512 tokens**, so prompts previously too short to cache now hit.
* **Separate rate limits**: Opus 5 uses its own rate-limit bucket, independent of the combined Opus 4.x pool.

### Technical Specs

| Parameter          | Spec                                                                        |
| ------------------ | --------------------------------------------------------------------------- |
| **Model ID**       | `claude-opus-5` (APIYI also offers `claude-opus-5-thinking`)                |
| **Context window** | 1,000,000 tokens (default and maximum)                                      |
| **Max output**     | 128,000 tokens                                                              |
| **Thinking**       | Adaptive by default; five effort levels (low / medium / high / xhigh / max) |
| **API formats**    | OpenAI-compatible / Anthropic-native                                        |
| **Availability**   | Anthropic API, AWS Bedrock, Google Vertex AI, Microsoft Foundry, APIYI      |

## Practical Usage

### Recommended Scenarios

1. **Complex agentic coding**: multi-file features, large refactors, end-to-end implementation — give it the full task spec up front and let it run
2. **Critical code review**: high precision + high recall; use low effort for cheap first passes and high effort for pre-merge gatekeeping
3. **Repository-scale / long-document tasks**: 1M context fits an entire codebase plus docs in one request
4. **Multi-agent orchestration**: subagent teams and writer-verifier patterns for large parallel workflows
5. **Office document generation**: complex multi-sheet Excel formulas and well-designed PowerPoint decks

### Code Examples

#### OpenAI-Compatible Format

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="claude-opus-5",
    messages=[
        {
            "role": "user",
            "content": "Refactor this module: split responsibilities, add tests, and explain each trade-off."
        }
    ],
    extra_body={
        "anthropic_effort": "xhigh"  # low / medium / high / xhigh / max
    }
)

print(response.choices[0].message.content)
```

#### Anthropic Native Format

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com"
)

message = client.messages.create(
    model="claude-opus-5",
    max_tokens=16000,  # note: thinking is on by default and shares this cap with the response
    messages=[
        {
            "role": "user",
            "content": "Walk through the root cause of this production bug step by step and propose a fix."
        }
    ]
)

for block in message.content:
    if block.type == "text":
        print(block.text)
```

#### In Claude Code

```json theme={null}
{
  "model": "claude-opus-5",
  "apiKey": "your-apiyi-key",
  "baseURL": "https://api.apiyi.com/v1"
}
```

### Best Practices

1. **Pick effort by task**:
   * **Coding / agentic work**: start at `xhigh`
   * **General intelligence-sensitive tasks**: `high` (the default)
   * **Cost-sensitive batch calls**: Opus 5's `low`/`medium` punch well above their weight — worth a downgrade sweep

2. **Front-load the task spec**: one complete, well-specified prompt beats progressive clarification across turns — cheaper and better results.

3. **Watch `max_tokens`**: with thinking on by default, budgets sized tightly around the answer text can truncate mid-response — leave headroom.

4. **Delete old self-check instructions**: Opus 5 verifies its own work unprompted; leftover "double-check your answer" prompts now cause over-verification and can simply be removed.

## Pricing & Availability

### Pricing

| Item       | Claude Opus 5        | Claude Opus 4.8  | Fable 5          |
| ---------- | -------------------- | ---------------- | ---------------- |
| **Input**  | **\$5 / 1M tokens**  | \$5 / 1M tokens  | \$10 / 1M tokens |
| **Output** | **\$25 / 1M tokens** | \$25 / 1M tokens | \$50 / 1M tokens |

<Info>
  Opus 5 keeps Opus 4.8's pricing exactly — a generational upgrade at no extra cost — and delivers near-or-better-than-Fable 5 intelligence at **half** Fable 5's price. APIYI billing matches the official rates, with top-ups settled at a fixed 1:7 exchange rate.
</Info>

### Access via APIYI

* Website: `apiyi.com`
* OpenAI-compatible endpoint: `https://api.apiyi.com/v1`
* Anthropic-native endpoint: `https://api.apiyi.com`
* Model names: `claude-opus-5` / `claude-opus-5-thinking`
* Available groups: default, ClaudeCode, SVIP (some groups carry discounts, stackable with top-up bonuses)

### Stack with Top-Up Promotions

Combine with APIYI top-up bonus campaigns to lower effective costs further — see [Recharge Promotions](/en/faq/recharge-promotions).

## Summary & Recommendations

Claude Opus 5 is a "half-price flagship" release: anchored to Opus 4.8's pricing (\$5/\$25) while approaching — and on some benchmarks surpassing — the twice-as-expensive Fable 5, plus practical upgrades like the 1M context window, default-on thinking, and a 512-token cache minimum.

**Core strengths**:

* **Value**: Fable 5-class intelligence at half the price
* **Long context**: 1M tokens by default, no premium
* **Coding**: complex multi-file work, code review, multi-agent coordination
* **Compliance-friendly**: not subject to Fable 5's 30-day data-retention requirement

**Recommendations**:

1. **Current Opus 4.8 users**: swap the model name and you're upgraded — just account for default-on thinking in `max_tokens`
2. **Current Fable 5 users**: switch non-extreme workloads to Opus 5 and cut costs in half immediately
3. **Coding / agent workflows**: pair with `xhigh` effort and a complete up-front task spec

`claude-opus-5` is fully live on APIYI with both OpenAI-compatible and Anthropic-native formats — try the half-price flagship today.

<Info>
  Sources: Anthropic official announcement (July 24, 2026); TechCrunch and other coverage. APIYI pricing is subject to live platform data. Data retrieved July 25, 2026.
</Info>
