> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-5.6 Series Launch: Sol, Terra and Luna

> OpenAI's next-gen GPT-5.6 trio is live on APIYI: flagship Sol at $5/$30, balanced Terra at $2.5/$15, lightweight Luna at $1/$6 — official price parity, up to 20% recharge bonus (~17% off) on the default relay group, and a 0.7x discount on the CodexReverse group.

## Key Takeaways

* **Three tiers at once**: OpenAI released the GPT-5.6 series on July 9, 2026 — flagship `gpt-5.6-sol`, balanced `gpt-5.6-terra`, and lightweight `gpt-5.6-luna` — and all three are live on APIYI
* **New naming system**: the number marks the model generation while Sol / Terra / Luna are durable capability tiers that advance on their own cadence, replacing the old Pro / Mini / Nano suffixes
* **Clear gains over GPT-5.5**: Sol hits **88.8%** on Terminal-Bench 2.1 (GPT-5.5: 85.6%), **90.4%** on BrowseComp, and **52.7%** on Agents' Last Exam; Terra matches GPT-5.5-level performance at **half the price**
* **Programmatic Tool Calling**: the Responses API gains programmatic tool calling — model-written JavaScript runs in an isolated, network-less V8 runtime, with customers reporting 38-63.5% token reductions
* **Dual-channel supply**: the default official-relay group is at official price parity (recharge bonus up to 20%, roughly **17% off effective**); the CodexReverse group carries a default **0.7x discount**

## Background

On July 9, 2026, OpenAI moved the GPT-5.6 series from limited preview to general availability across ChatGPT, Codex, and the OpenAI API. The headline change is the naming system: instead of Pro / Mini / Nano suffixes, the family introduces three celestial capability tiers — Sol (flagship), Terra (balanced), Luna (lightweight) — where the number identifies the generation and each tier can evolve on its own schedule.

The positioning is equally crisp: Sol pushes the frontier on agentic tasks, Terra delivers GPT-5.5-class performance at half the cost, and Luna drops the entry price to \$1/\$6 per million tokens. APIYI shipped all three models the day after release, on both the default official-relay group and the CodexReverse group.

## Deep Dive

### Benchmarks (data retrieved 2026/7/10)

| Benchmark                  | Sol       | Terra | Luna  | GPT-5.5 | Claude Fable 5 |
| -------------------------- | --------- | ----- | ----- | ------- | -------------- |
| AA Coding Agent Index v1.1 | **80**    | 77.4  | 74.6  | 76.4    | 77.2           |
| Terminal-Bench 2.1         | **88.8%** | 87.4% | 84.7% | 85.6%   | 83.1%          |
| DeepSWE v1.1               | **72.7%** | 69.6% | 67.2% | 67%     | 69.7%          |
| SWE-Bench Pro              | 64.6%     | 63.4% | 62.7% | 59.4%   | **80%**        |
| Agents' Last Exam          | **52.7%** | 50.4% | 50.3% | 46.9%   | 40.5%          |
| BrowseComp                 | **90.4%** | 87.5% | 83.3% | 84.4%   | —              |
| OSWorld 2.0                | **62.6%** | 50.2% | 45.6% | 47.5%   | —              |

<Info>
  Sources: the official OpenAI announcement at `openai.com/index/gpt-5-6` and `marktechpost.com` (July 9, 2026). The multi-agent Sol Ultra configuration (4 agents) reaches 91.9% on Terminal-Bench 2.1. Note: Claude Fable 5 (80%) still leads Sol (64.6%) by a wide margin on SWE-Bench Pro.
</Info>

### Core Features

<CardGroup cols={2}>
  <Card title="Three-Tier Capability System" icon="layers">
    Sol for the ceiling, Terra for the daily workhorse, Luna for cost control — same generation and lineage, switchable by just changing the `model` name in the OpenAI-compatible format
  </Card>

  <Card title="Programmatic Tool Calling" icon="code">
    New in the Responses API: model-written JavaScript executes in an isolated, network-less V8 runtime, with named customers reporting 38-63.5% token reductions
  </Card>

  <Card title="Upgraded Cache Billing" icon="database">
    Cache writes bill at 1.25x the uncached input rate; cache reads keep the 90% discount with a 30-minute minimum cache lifetime
  </Card>

  <Card title="Agentic Strength" icon="bot">
    Leads its predecessor across BrowseComp, OSWorld 2.0 and Agents' Last Exam, with major gains in browser and desktop automation
  </Card>
</CardGroup>

<Warning>
  Luna scores only 41.3% on the 256K-1M long-context evaluation — for very long documents, prefer Terra / Sol or chunk the input.
</Warning>

## Practical Use

### Which Tier to Pick

* **`gpt-5.6-sol`**: ceiling-bound agentic work — complex coding agents, desktop / browser automation, deep research
* **`gpt-5.6-terra`**: the daily driver — GPT-5.5-class performance at half the price, the natural migration target for most production workloads
* **`gpt-5.6-luna`**: high-volume traffic — classification, extraction, light chat, tool-calling glue

### Code Example

```python theme={null}
import openai

client = openai.OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="gpt-5.6-terra",  # or gpt-5.6-sol / gpt-5.6-luna
    messages=[
        {"role": "user", "content": "Summarize the differences between the three GPT-5.6 tiers"}
    ]
)
print(response.choices[0].message.content)
```

Existing GPT-5.5 code migrates by swapping the `model` field.

## Pricing & Availability

### Pricing (per 1M tokens, matching official rates)

| Model           | Input  | Output  | Tier        |
| --------------- | ------ | ------- | ----------- |
| `gpt-5.6-sol`   | \$5.00 | \$30.00 | Flagship    |
| `gpt-5.6-terra` | \$2.50 | \$15.00 | Balanced    |
| `gpt-5.6-luna`  | \$1.00 | \$6.00  | Lightweight |

### Two Supply Groups

| Group                                   | Pricing                   | Notes                                                                                   |
| --------------------------------------- | ------------------------- | --------------------------------------------------------------------------------------- |
| Default official relay (default / svip) | Official parity           | Official API resources; recharge bonus up to 20%, effectively about **17% off** (1/1.2) |
| CodexReverse                            | Default **0.7x discount** | Codex reverse-engineered economy channel; availability tracks official Codex            |

Pick by need: the default official-relay group for production-grade stability, the CodexReverse group for cost-sensitive batch workloads. See the [recharge promotions guide](/en/faq/recharge-promotions).

## Summary & Recommendations

The real story of GPT-5.6 isn't any single benchmark — it's the tiered product structure. Terra delivers GPT-5.5-class performance at half the price and is the tier most worth migrating to first; Sol tops nearly every agentic benchmark (except SWE-Bench Pro, where Claude Fable 5 keeps a \~15-point lead); Luna gives high-concurrency workloads a new \$1-input option. Run your existing workload through Terra first, and step up to Sol for agent-heavy scenarios.

<Info>
  Sources: the official OpenAI announcement at `openai.com/index/gpt-5-6`, the OpenAI Help Center, MarkTechPost, and VentureBeat; data retrieved July 10, 2026. All three models are live on APIYI — grab a key and start calling.
</Info>
