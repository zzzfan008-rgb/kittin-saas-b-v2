> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 4.7 Is Live: A 2.1T Base Model at the Same Price

> SpaceXAI (xAI) released Grok 4.7 on September 21, 2026: a new 2.1T-parameter base model that lifts Terminal-Bench 4.0 from 18% to 33%, at the same $2/$6 per million tokens as Grok 4.6. Now live on APIYI with all four billing items matching the official price.

## Key Takeaways

* **New flagship, live now**: Grok 4.7 shipped on September 21, 2026 and is live on APIYI as `grok-4.7`, available in the `default` / `svip` / `CodexResponses` groups
* **A bigger base model**: 2.1T parameters, about 40% larger than Grok 4.6's 1.5T, with a longer reinforcement learning run weighted toward tasks that take hours
* **Biggest gains in coding agents**: independent testing by Artificial Analysis puts Terminal-Bench 4.0 at **33%** (up from 18%) and DeepSWE v1.1 at **73%** (up from 65%)
* **Same price as the last generation**: \$2 / \$6 per million tokens (input / output), \$0.50 for cached reads, with a second tier above 200K, matching xAI's official pricing
* **Same unit price, more tokens per task**: Artificial Analysis measured roughly twice the output tokens of Grok 4.6 on the same task set, so cost per task goes up

## Background

When Grok 4.6 shipped on August 7, it kept Grok 4.5's 1.5T-parameter base and added only post-training. Six weeks later, Grok 4.7 takes a different route: **a larger new base model** at 2.1T parameters, a longer reinforcement learning run, and more training weight on multi-hour tasks.

xAI describes it as "a notable improvement over Grok 4.6 at the same price and speed." Its supplemental training data also includes SpaceX engineering material such as Starlink satellite telemetry, manufacturing records, and engineering failure logs, which helps explain its strong result on the EEBench electrical-engineering benchmark.

On launch day Grok 4.7 went live in the Grok app, Cursor, Grok Build, and the xAI API, and GitHub Copilot added it the same day. Musk also sketched the roadmap: Grok 4.8 as "a meaningful step up," Grok 4.9 in the Astra / Fable class, and Grok 5 aiming for the frontier lead, with no dates given.

## Detailed Analysis

### Benchmarks

**Independent testing (Artificial Analysis, retrieved 2026/9/24)**

| Metric | Grok 4.7 | Grok 4.6 | Notes |
| - | - | - | - |
| Intelligence Index | **46** | 44 | Same index version; GPT-5.6 Sol scores 47, Claude Fable 5 scores 50 |
| Coding Agent Index (Grok Build + xhigh) | **56** | 47 | 4th among native coding harnesses |
| Terminal-Bench 4.0 | **33%** | 18% | The largest gain |
| DeepSWE v1.1 | **73%** | 65% | — |
| GDPval-AA (Elo) | **1695** | 1605 | Knowledge work, second only to Claude Fable 5.1 |
| AA-Briefcase (Elo) | **1657** | 1546 | Second only to Claude Fable 5.1 |
| Hallucination rate (AA-Omniscience) | **29%** | 34% | Lower is better |

**xAI self-reported**

| Benchmark | Grok 4.7 | Grok 4.6 |
| - | - | - |
| CursorBench 4.0 | 46.3% (xhigh) | 40.4% (high) |
| SWE-Marathon v1.1 | 46.0% (high) | 31.9% (high) |
| EEBench (electrical engineering) | 66.0% (xhigh) | 60.0% (xhigh) |
| HealthBench Professional | 56.7% (xhigh) | 48.5% (xhigh) |

<Info>
  Artificial Analysis updated its Intelligence Index after August. The 46 and 44 above are from the same index version and should not be compared with the 61 reported when Grok 4.6 launched. xAI's own numbers and the independent results differ slightly on benchmarks with the same name (for example, xAI reports 38% on Terminal-Bench 4.0), so the two tables are kept separate to make the sources easy to check.
</Info>

### Core Features

<CardGroup cols={2}>
  <Card title="New 2.1T base" icon="layers">
    About 40% more parameters than Grok 4.6, plus a longer reinforcement learning run weighted toward multi-hour tasks
  </Card>

  <Card title="Self-verification on long tasks" icon="repeat">
    Stronger self-checking on long trajectories; multi-hour coding tasks such as SWE-Marathon improve by 14 points
  </Card>

  <Card title="Four reasoning levels" icon="gauge">
    Officially supports `low` / `medium` / `high` / `xhigh`, with `high` as the default; most top independent results come from `xhigh`
  </Card>

  <Card title="500K context" icon="scroll">
    Text and image input, text output, no output length cap; requests above 200K are billed entirely at the second tier
  </Card>
</CardGroup>

### Specifications

| Item | Value |
| - | - |
| Model name | `grok-4.7` |
| Parameters | 2.1T |
| Context window | 500K tokens |
| Input / output modalities | Text, image / text |
| Knowledge cutoff | Pretraining June 2026, supplemental training through August 2026 |
| Reasoning effort | `low` / `medium` / `high` (default) / `xhigh` |
| Billing | Tiered, with the break at 200K tokens |

## Practical Use

### Recommended Scenarios

* **Long-running coding agents**: the largest gains are on long-task benchmarks such as Terminal-Bench and SWE-Marathon, a good fit for automation that works in a codebase for hours
* **Knowledge-work agents**: GDPval-AA and AA-Briefcase both rank second only to Claude Fable 5.1, a good fit for report writing, research, and analysis
* **Engineering and hardware questions**: training included SpaceX engineering material, and it does well on the EEBench electrical-engineering benchmark
* **Codex and other Responses clients**: available in the `CodexResponses` group for use directly in Codex

### Code Example

```python theme={null}
import openai

client = openai.OpenAI(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="grok-4.7",
    messages=[
        {"role": "user", "content": "Read this module, find potential concurrency bugs, and propose fixes"}
    ]
)
print(response.choices[0].message.content)
```

This uses the OpenAI-compatible format, so code already running `grok-4.6` only needs `model` changed to `grok-4.7`. Web search, X search, code execution, and MCP tools work the same way as across the Grok 4.x series; see the [Grok overview](/en/api-capabilities/grok/overview).

### Best Practices

<Warning>
  **Estimate cost per task, not just per token.** Grok 4.7 has the same unit price as Grok 4.6, but Artificial Analysis measured about twice the output tokens on the same task set (about 81K per task at xhigh, versus about 38K for Grok 4.6). Reasoning tokens are billed as output, so compare a bill on your own real tasks before switching.
</Warning>

* **Pick the reasoning level per task**: `low` or `medium` saves noticeably on simple Q\&A; keep `xhigh` for long coding chains and complex analysis
* **Don't hard-code reasoning parameters in cross-model code**: support for reasoning-effort parameters varies across Grok 4.x models, so shared wrappers should check the model before sending it; see [Chat and reasoning](/en/api-capabilities/grok/chat)
* **Watch the 200K tier on long prompts**: requests above 200K are billed entirely at the second tier, so split long documents where you can and let prefix caching absorb repeated system prompts

## Pricing and Availability

### Pricing

All four billing items match xAI's official pricing, billed in tiers:

| Context tier | Input | Output | Cached read |
| - | - | - | - |
| 0 – 200K tokens | \$2.00 / 1M | \$6.00 / 1M | \$0.50 / 1M |
| 200K – 500K tokens | \$4.00 / 1M | \$12.00 / 1M | \$1.00 / 1M |

Available groups: `default`, `svip`, and `CodexResponses`. Choose the group when you create your token.

### Stack With Top-Up Promotions

Top-ups earn a tiered bonus based on the amount of each top-up, which lowers your effective price further. See the [top-up promotions](/en/faq/recharge-promotions) for details.

## Summary

Grok 4.7 moves to a larger base model than Grok 4.6, from 1.5T to 2.1T parameters, at an unchanged price. The biggest gains are on coding-agent benchmarks, with Terminal-Bench 4.0 nearly doubling. On the overall index it still trails GPT-5.6 Sol and Claude Fable 5 by 1 to 4 points, but on knowledge-work tasks it now ranks second only to Claude Fable 5.1.

If your workload is long-running coding agents or knowledge-work automation, try `grok-4.7` directly. If your tasks are simple and cost-sensitive, compare token usage on real tasks first, because this generation keeps the unit price but uses more tokens. For the lowest unit price, `grok-4.3` (1M context, \$1.25 / \$2.50) is still an option.

<Info>
  Sources: SpaceXAI release notes `docs.x.ai/developers/release-notes`, Artificial Analysis `artificialanalysis.ai/articles/benchmarking-grok-4-7`, Decrypt, llm-stats, GitHub Changelog; data retrieved September 24, 2026. The model is live on APIYI; get a key and start calling it.
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.