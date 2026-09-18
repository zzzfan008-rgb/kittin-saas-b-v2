> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.7-Max Launches: #1 Chinese Model, Top-5 Globally on Intelligence Index

> Alibaba's Qwen team releases flagship Qwen3.7-Max: Artificial Analysis Intelligence Index 56.6 (5th globally, top Chinese model), Terminal-Bench 2.0 69.7, 1M context. APIYI's official-proxy channel is listed at $1.7140/$5.1420 per 1M tokens — identical to Alibaba's rates.

## Highlights

* **Top-5 globally · #1 Chinese model**: Artificial Analysis Intelligence Index 56.6, beats Gemini 3.5 Flash (55.3), ranks first among Chinese models
* **Agent long-horizon breakthrough**: Ran 35 hours autonomously with 1,158 tool calls and 432 kernel evaluations — no human in the loop
* **Terminal-Bench 2.0 at 69.7**: Continued lead on coding/tool-use benchmarks, Terminal-Bench Hard 50.8% (+6.9)
* **1M context window**: Doubled from 256K on the predecessor — native long-task capacity
* **31% token-density gain**: Produces 31% more output tokens on the Intelligence Index, denser reasoning per answer
* **APIYI official-proxy direct**: Listed at \$1.7140/\$5.1420 per 1M tokens (input/output), identical to Alibaba Cloud's rates

## Background

On **May 20, 2026 (UTC+8)**, Alibaba's Qwen team released its flagship **Qwen3.7-Max**, positioned as "the next-generation flagship model for the agent era." Compared to Qwen3.6 Max Preview, the Artificial Analysis Intelligence Index jumped from 51.8 to **56.6** (+4.8) — pushing a Chinese model into the **global top 5** of this composite leaderboard for the first time, ahead of Google's Gemini 3.5 Flash (55.3).

What's more striking is the **agent long-horizon capability**: in an internal test disclosed by Alibaba, Qwen3.7-Max autonomously optimized an Extend Attention kernel on a T-Head Zhenwu M890 PPU. It ran continuously for **35 hours**, executing 1,158 tool calls and 432 kernel evaluations, iterating through 5 distinct architectural redesigns, and finally achieving a **10× geometric mean speedup** over the Triton reference implementation. The entire process was **fully hands-off** — a "let-it-run-a-day-and-a-half" stability that previous Qwen 3.x models did not reach.

<Info>
  **Sources**: Qwen official blog `qwen.ai/blog`, Artificial Analysis Intelligence Index 2026/5 data, TechNode coverage (2026/5/21), Digg / Pandaily / SCMP composite reports. Data retrieved 2026/5/21 (UTC+8).
</Info>

## Detailed Breakdown

### Key Features

<CardGroup cols={2}>
  <Card title="#1 Chinese composite intelligence" icon="trophy">
    Artificial Analysis Intelligence Index 56.6, ahead of Gemini 3.5 Flash — first Chinese model in the global top 5.
  </Card>

  <Card title="Long-horizon agent stability" icon="infinity">
    35-hour continuous run on a single task, 1,158 tool calls, 432 evaluation iterations — no human handholding.
  </Card>

  <Card title="1M context window" icon="brain">
    Doubled from the previous 256K — natively handles long-document analysis, large codebase reading, multi-hour conversation.
  </Card>

  <Card title="Leading coding/tool-use" icon="terminal">
    Terminal-Bench 2.0 69.7, Terminal-Bench Hard 50.8% (+6.9 vs Qwen3.6 Max Preview) — real-world tool-call workflows lead.
  </Card>
</CardGroup>

### Performance Highlights

Compared to Qwen3.6 Max Preview, the gains concentrate in scientific reasoning, agent capability, and coding:

| Benchmark                              | Qwen3.6 Max Preview | Qwen3.7-Max | Δ       |
| -------------------------------------- | ------------------- | ----------- | ------- |
| Artificial Analysis Intelligence Index | 51.8                | **56.6**    | +4.8    |
| Terminal-Bench 2.0                     | —                   | **69.7**    | —       |
| Terminal-Bench Hard                    | 43.9%               | **50.8%**   | +6.9 pp |
| Humanity's Last Exam                   | 28.9%               | **38.1%**   | +9.2 pp |
| CritPt                                 | 3.7%                | **13.4%**   | +9.7 pp |
| GDPval-AA (Elo)                        | 1504                | **1546**    | +42     |

On factuality, Qwen3.7-Max shows "higher abstention" on **AA-Omniscience** — attempt rate falls to 48.0%, the lowest among comparable frontier models. The model is more willing to say "I don't know" rather than confidently produce a wrong answer. For production agent workflows, this self-awareness matters: a wrong answer is more dangerous than silence.

### The 35-Hour Autonomous Run

Alibaba's blog details a fully autonomous kernel-optimization case study:

* **Task**: Optimize the Extend Attention kernel on a T-Head Zhenwu M890 PPU
* **Duration**: \~35 hours of continuous autonomous execution
* **Process**: 1,158 tool calls, 432 kernel evaluations, 5 architectural redesigns iterated
* **Result**: 10.0× geometric mean speedup over the Triton reference across multiple workloads

This scale of agent task is difficult on previous models — context blows up, goals drift, errors compound. Qwen3.7-Max gets there via 1M context, drift-resistant instruction following, and stable execution of the "tool-fail → retry → adjust" loop.

### Technical Specs

| Spec           | Value                                             |
| -------------- | ------------------------------------------------- |
| Model ID       | `qwen3.7-max`                                     |
| Context window | 1,000,000 tokens                                  |
| Modalities     | Text in / text out                                |
| Release status | Preview, API access                               |
| Channel        | APIYI official-proxy (Alibaba Cloud Model Studio) |

<Warning>
  **Preview stage**: Qwen3.7-Max is currently in Preview; open weights have not been released. For production use, follow the usual snapshot-pinning and regression-testing practices for Preview models.
</Warning>

## Practical Use

### Recommended Scenarios

<CardGroup cols={2}>
  <Card title="Long-horizon agent workflows" icon="bot">
    Multi-step, cross-tool, long-running tasks (code refactor, research, data pipeline maintenance).
  </Card>

  <Card title="Complex coding tasks" icon="code">
    Terminal-Bench 2.0 69.7 + Hard 50.8% — suited to code-gen, debug, and tool-heavy workflows.
  </Card>

  <Card title="Long-document analysis" icon="file-text">
    1M context fits large codebases, long reports, long contracts; reduces RAG chunking overhead.
  </Card>

  <Card title="Research / reasoning tasks" icon="flask-conical">
    Humanity's Last Exam +9.2, CritPt +9.7 — significant gains on scientific reasoning and open-ended problems.
  </Card>
</CardGroup>

### Code Example

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

# Basic chat
response = client.chat.completions.create(
    model="qwen3.7-max",
    messages=[
        {"role": "system", "content": "You are a rigorous senior engineer — back claims with concrete evidence and numbers."},
        {"role": "user", "content": "Explain the difference between Triton and PPU custom kernels for attention compute."}
    ]
)
print(response.choices[0].message.content)
```

Agent workflow (Function Calling) example:

```python theme={null}
tools = [{
    "type": "function",
    "function": {
        "name": "run_shell",
        "description": "Execute a shell command and return stdout/stderr",
        "parameters": {
            "type": "object",
            "properties": {"cmd": {"type": "string"}},
            "required": ["cmd"]
        }
    }
}]

response = client.chat.completions.create(
    model="qwen3.7-max",
    messages=[
        {"role": "user", "content": "Use ripgrep to find every TODO in the repo, grouped by file."}
    ],
    tools=tools,
    tool_choice="auto"
)
```

### Best Practices

* **Checkpoint long runs**: For 35-hour-class tasks, add stage checkpoints in your business layer (save intermediate artifacts, resumable) — avoid losing work to a single failure.
* **Lean into 1M context**: Whole-codebase reviews or long-contract diffs work better as a single pass than RAG chunking; budget tokens accordingly.
* **Capture the token-density gain**: Output tokens are 31% higher than the previous gen — denser reasoning per answer, but budget more output tokens per call.
* **Pin snapshots before production**: Preview models can roll silently. Use a snapshot ID, not the alias, for production regressions.

## Pricing & Availability

### Side-by-side Pricing

| Item   | Alibaba Cloud (CNY) | APIYI list (USD)     |
| ------ | ------------------- | -------------------- |
| Input  | ¥12 / 1M tokens     | \$1.7140 / 1M tokens |
| Output | ¥36 / 1M tokens     | \$5.1420 / 1M tokens |

<Info>
  **Exchange rate**: APIYI uses a **fixed 1:7** rate to convert Alibaba's CNY pricing to USD list (12 ÷ 7 ≈ 1.7143; 36 ÷ 7 ≈ 5.1428). This is a fixed conversion, not a preferential rate — it keeps USD-billed customers' line items aligned with the Alibaba Cloud RMB invoice 1-to-1.
</Info>

### Stacking the Recharge Bonus

APIYI runs an always-on [recharge bonus promo](/en/faq/recharge-promotions) — the higher the top-up, the higher the bonus percentage, credited directly to spendable balance:

* **Top up \$100 → \~86% of list**
* **Top up \$300+ → as low as 79% of list** (depending on tier; see Recharge Promotions FAQ)

The discount lives entirely in the bonus credit, separated from the list price. For enterprise volume, reach out via WeChat customer support.

### Available Groups

| Group     | Open | Notes                                    |
| --------- | ---- | ---------------------------------------- |
| `Default` | ✅    | Direct calls work on the default group   |
| `SVIP`    | ✅    | High-priority queue, no extra multiplier |

## Summary

Qwen3.7-Max isn't just a numbers bump — it pushes **the ceiling on "agent long-horizon capability" for Chinese models** to a new level:

1. **#1 Chinese composite intelligence**: 56.6 on the Intelligence Index reframes "can we use a Chinese model" as "which Chinese model"
2. **Hands-off long runs**: 35 hours autonomous on a real optimization task makes dev-agent / research-agent product shapes feasible on Chinese models
3. **Transparent pricing**: APIYI's list price matches Alibaba Cloud exactly via a fixed 1:7 conversion — stackable recharge bonus pushes effective cost down further

<Warning>
  **Selection advice**: If your workflow involves **long context + multi-tool calls + multi-step reasoning**, Qwen3.7-Max is the top Chinese-model choice today. For pure chat or single-step tasks, the lighter Qwen3.6-Flash or Qwen3.6-Plus offers better cost-effectiveness.
</Warning>

<Info>
  **Sources**: Qwen official blog `qwen.ai/blog`, Artificial Analysis Intelligence Index 2026/5 data, TechNode coverage (2026/5/21), Digg / Pandaily / SCMP composite reports. Data retrieved 2026/5/21 (UTC+8).
</Info>
