> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MiniMax-M2.7 Launch: Self-Evolving Agent Model with Just 10B Parameters

> MiniMax releases M2.7 and M2.7-highspeed — only 10B active parameters achieving Tier-1 performance with SWE-bench Pro 56.22%, at up to 1/50th the cost of competitors. Now available on APIYI.

## Key Highlights

* **Smallest Tier-1 Model**: Only 10B active parameters, SWE-bench Pro 56.22%, SWE-bench Verified 78%, matching Opus-level performance
* **Self-Evolution**: Industry's first model deeply participating in its own training, autonomously handling 30-50% of its RL development workflow
* **Native Multi-Agent**: Built-in Agent Teams collaboration, 40+ complex skills with 97% adherence rate
* **Extreme Value**: Input \$0.30 / Output \$1.20 per million tokens — roughly 1/50th of comparable competitors
* **Two Variants**: Standard and highspeed produce identical output quality; highspeed runs at \~100 TPS

## Background

On March 18, 2026, MiniMax officially released the M2.7 series. Dubbed the "smallest Tier-1 model," M2.7 achieves performance comparable to Claude Opus 4.6 and GPT-5.3 Codex on major benchmarks with just 10B active parameters.

M2.7's standout feature is its "self-evolution" capability — it autonomously triggers log analysis, debugging, and metric evaluation, independently handling 30-50% of its own reinforcement learning development workflow, including analyzing its own failures, rewriting code segments, running evaluations, and deciding what to keep or discard.

APIYI has launched both M2.7 and M2.7-highspeed with pay-per-token Chat billing.

## Detailed Analysis

### Core Features

<CardGroup cols={2}>
  <Card title="Self-Evolving" icon="dna">
    First model to deeply participate in its own training, autonomously handling 30-50% of RL workflow
  </Card>

  <Card title="Native Multi-Agent" icon="users">
    Built-in Agent Teams with role boundaries, adversarial reasoning, and protocol adherence as internalized capabilities
  </Card>

  <Card title="Minimal Parameters" icon="minimize">
    Just 10B active parameters achieving Tier-1 performance — extremely efficient
  </Card>

  <Card title="Advanced Tool Use" icon="wrench">
    Manages 40+ complex skills (each exceeding 2,000 tokens) with 97% adherence rate
  </Card>
</CardGroup>

### Benchmark Performance

| Benchmark          | M2.7 Score | Notes                       |
| ------------------ | ---------- | --------------------------- |
| SWE-bench Pro      | 56.22%     | Near Opus-level             |
| SWE-bench Verified | 78%        | Strong software engineering |
| VIBE-Pro           | 55.6%      | End-to-end project delivery |
| Terminal Bench 2   | 57.0%      | Complex engineering systems |
| MM Claw            | 62.7%      | Agent tasks                 |
| MLE Bench Lite     | 66.6%      | ML competition medal rate   |
| Skill Adherence    | 97%        | Across 40+ complex skills   |

Scores **50** on the Artificial Analysis Intelligence Index, tying with GLM-5, ahead of MiMo-V2-Pro (49) and Kimi K2.5 (47), while using 20% fewer output tokens at less than one-third the cost.

### M2.7 vs M2.7-highspeed

Both variants produce **identical output quality** — the difference is speed and cost:

| Aspect         | M2.7 Standard    | M2.7-highspeed               |
| -------------- | ---------------- | ---------------------------- |
| Output Quality | Identical        | Identical                    |
| Speed          | \~60 TPS         | \~100 TPS                    |
| Context Window | 204,800 tokens   | 204,800 tokens               |
| Best For       | Budget-conscious | Latency-sensitive production |

### Technical Specifications

* **Context Window**: 204,800 tokens (\~205K)
* **Max Output**: 131,072 tokens
* **Reasoning**: Supports mandatory reasoning with `<think>` tags
* **Architecture**: MoE (Mixture of Experts)

## Pricing & Availability

| Model                  | Input Price        | Output Price       | Billing Type         |
| ---------------------- | ------------------ | ------------------ | -------------------- |
| MiniMax-M2.7           | \$0.30 / 1M tokens | \$1.20 / 1M tokens | Pay-per-token - Chat |
| MiniMax-M2.7-highspeed | \$0.60 / 1M tokens | \$2.40 / 1M tokens | Pay-per-token - Chat |

<Info>
  M2.7-highspeed is approximately 1.7x faster than the standard version, ideal for latency-sensitive production workloads. Both variants are identical in intelligence — choose based on your needs.
</Info>

## Summary & Recommendations

MiniMax-M2.7 delivers Tier-1 performance with just 10B active parameters — a remarkable achievement in efficiency. Its self-evolution capability and native multi-agent collaboration are unique differentiators, excelling in software engineering, tool calling, and complex workflow orchestration.

**Recommended Use Cases**:

* Developers needing high intelligence on a budget
* Agent workflows and multi-step task orchestration
* Software engineering assistance and code generation
* Production environments requiring strong tool-calling capabilities
