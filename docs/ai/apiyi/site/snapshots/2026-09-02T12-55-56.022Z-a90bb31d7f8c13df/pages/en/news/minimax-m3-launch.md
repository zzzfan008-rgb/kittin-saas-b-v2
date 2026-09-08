> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MiniMax-M3 Launch: 1M-Context Open Flagship at 50% Off

> MiniMax-M3 is live on APIYI! MSA sparse attention + 1M-token context + native multimodality, SWE-Bench Pro 59.0 beating GPT-5.5 and Gemini 3.1 Pro. Limited-time 50% off matching the official site: $0.30 input / $1.20 output per 1M tokens, down to ~41% of list price with recharge bonuses. Ends June 8, 00:00 (UTC+8).

## Key Takeaways

* **New open-weight flagship**: `MiniMax-M3` is now live on APIYI (mind the capitalization) — the first open-weight model to combine frontier coding-agent performance, a **1M-token context window**, and native multimodality
* **Beats closed flagships on coding**: SWE-Bench Pro **59.0**, ahead of GPT-5.5 and Gemini 3.1 Pro; Terminal-Bench 2.1 at 66.0, MCP Atlas at 74.2
* **Tops autonomous browsing**: BrowseComp **83.5**, above Claude Opus 4.7 (79.3); first place on the Claw-Eval end-to-end agent benchmark
* **MSA sparse attention**: MiniMax Sparse Attention replaces full attention with KV-block selection — 1M-context inference at roughly **1/20** the cost of the previous generation
* **Limited-time 50% off**: APIYI matches the official discount — **\$0.30 input / \$1.20 output** per 1M tokens (0-512K tier), ending **June 8, 2026, 00:00 (UTC+8)**
* **Stack recharge bonuses**: combined with APIYI recharge promotions, the effective price drops to roughly **41% of list** (50% ÷ 1.2)

<Info>
  MiniMax officially released M3 on June 1, 2026, pledging open weights and a technical report on Hugging Face and GitHub within 10 days. Sources: `minimax.io/blog/minimax-m3`, `venturebeat.com`, `openrouter.ai/minimax/minimax-m3`. Data retrieved: 2026-06-05.
</Info>

## Background

MiniMax's M series has always pushed the "long context + high cost-efficiency" frontier, and M3 takes that strategy to a new level. Released on June 1, 2026, M3 is positioned as **the first open-weight model to combine frontier coding-agent capability, a 1M-token context window, and native multimodality** — including image and video input plus desktop computer operation.

The headline innovation is **MSA (MiniMax Sparse Attention)**: replacing full attention with KV-block selection to drastically cut per-token compute at long context. Per official figures, inference at 1M tokens costs roughly 1/20 of the previous generation, with substantially faster prefill and decode. For the first time, "million-token context" is genuinely affordable.

The most actionable part for developers is the price: MiniMax launched the model with a **limited-time 50% discount**, and APIYI has matched it — stackable with recharge promotions for an even lower effective rate.

## Deep Dive

### Core Features

<CardGroup cols={2}>
  <Card title="1M-Token Context" icon="book">
    **Native million-token window**

    True 1M context powered by MSA sparse attention — entire repos, long video scripts, and extended agent trajectories in a single pass.
  </Card>

  <Card title="MSA Sparse Attention" icon="microchip">
    **Long-context cost cut to 1/20**

    KV-block selection replaces full attention; officially 4×+ faster prefill/decode than open-source alternatives at long context.
  </Card>

  <Card title="Frontier Coding Agent" icon="code">
    **SWE-Bench Pro 59.0**

    Ahead of GPT-5.5 and Gemini 3.1 Pro, Terminal-Bench 2.1 at 66.0 — production-ready for real software engineering tasks.
  </Card>

  <Card title="Native Multimodality" icon="image">
    **Image / video / computer use**

    Trained on interleaved text-image data from inception; supports image and video input plus desktop operation, beating Gemini 3.1 Pro on OmniDocBench.
  </Card>
</CardGroup>

### Benchmark Highlights

Data from the official MiniMax release and third-party coverage:

| Benchmark                           | MiniMax-M3 | Comparison                    |
| ----------------------------------- | ---------- | ----------------------------- |
| SWE-Bench Pro (real-world SWE)      | **59.0**   | Above GPT-5.5, Gemini 3.1 Pro |
| Terminal-Bench 2.1 (terminal agent) | **66.0**   | Leading among open models     |
| MCP Atlas (tool use)                | **74.2**   | —                             |
| BrowseComp (autonomous browsing)    | **83.5**   | Above Claude Opus 4.7 (79.3)  |
| Claw-Eval (end-to-end agent)        | **#1**     | Top of all tested models      |
| OmniDocBench (document multimodal)  | Leading    | Above Gemini 3.1 Pro          |

<Tip>
  In official demos, M3 autonomously **reproduced academic papers** and **optimized CUDA kernels** — first-tier long-horizon reasoning and engineering execution. With open weights landing within 10 days, in-house agent teams can run an "API + offline evaluation" dual track.
</Tip>

### Technical Specs

<Card title="Engineering parameters" icon="sliders-horizontal">
  * **Model ID**: `MiniMax-M3` (case-sensitive)
  * **Attention**: MSA (MiniMax Sparse Attention, KV-block selection)
  * **Context window**: 1M tokens (native)
  * **Multimodality**: ✅ image / video input, desktop computer operation
  * **Billing**: tiered by input length (0-512K / above 512K)
  * **API compatibility**: OpenAI ChatCompletions compatible
  * **Open weights**: weights + technical report on Hugging Face / GitHub within 10 days
</Card>

<Warning>
  M3 uses **tiered billing**: once a request's input exceeds 512K tokens, the excess is billed at the higher tier (\$0.60 input / \$2.40 output per 1M tokens, limited-time rate). Budget accordingly for million-token workloads.
</Warning>

## Practical Usage

### Recommended Scenarios

<CardGroup cols={2}>
  <Card title="Whole-Repo Coding Agent" icon="code">
    1M context + SWE-Bench Pro 59.0 — large-repo refactors and cross-file PR tasks without chunking or retrieval
  </Card>

  <Card title="Autonomous Browsing & Research" icon="globe">
    Tops BrowseComp at 83.5 — ideal for deep-research agents and automated information gathering
  </Card>

  <Card title="Long Document / Video Understanding" icon="file-text">
    Native multimodality + million-token context — analyze massive contracts, reports, or video content in one pass
  </Card>

  <Card title="Computer-Use Agents" icon="bot">
    Native desktop operation — build RPA, automated testing, and computer-use agents
  </Card>
</CardGroup>

### Quick Start (OpenAI-Compatible API)

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

# Note the capitalization: MiniMax-M3
resp = client.chat.completions.create(
    model="MiniMax-M3",
    messages=[
        {"role": "system", "content": "You are a senior full-stack engineer specializing in PR-level tasks in large codebases."},
        {"role": "user", "content": "Read through this entire repo, find the rate-limiting middleware bottleneck, and propose a fix"}
    ],
    temperature=0.3,
)
print(resp.choices[0].message.content)
```

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-your-apiyi-key" \
  -d '{
    "model": "MiniMax-M3",
    "messages": [{"role": "user", "content": "Explain MSA sparse attention in one paragraph"}]
  }'
```

### Best Practices

* **Model ID capitalization**: the ID is `MiniMax-M3` — a wrong case returns a 404 model-not-found error
* **Cost control**: keep single-request input under 512K tokens to stay on the lowest tier; summarize/trim for ultra-long tasks
* **Temperature**: `temperature=0.2 ~ 0.4` recommended for agent/coding workloads
* **Streaming**: prefill takes longer at extreme context — enable streaming for better perceived latency
* **Discount window**: the 50% off rate ends June 8, 00:00 (UTC+8) — schedule heavy evaluations and batch jobs before then

## Pricing & Availability

### Price Table (USD / 1M tokens, limited-time 50％ off)

| Input length tier | Prompt (input) | Completion (output) |
| ----------------- | -------------- | ------------------- |
| 0 - 512K          | **\$0.3000**   | **\$1.2000**        |
| Above 512K        | **\$0.6000**   | **\$2.4000**        |

<Info>
  APIYI **matches MiniMax's official limited-time 50% discount** — the table above is the current live rate, billed in tiers by input length. The discount ends **June 8, 2026, 00:00 (UTC+8)**; subsequent pricing is to be determined.
</Info>

### Stack with Recharge Promotions

The 50%-off rate stacks with APIYI recharge bonuses, bringing the **effective price down to roughly 41% of list** (50% ÷ 1.2):

<Card title="Recharge Promotions" icon="gift" href="/en/faq/recharge-promotions">
  See the latest recharge bonus tiers — larger top-ups earn bigger bonuses
</Card>

## Summary & Recommendations

MiniMax-M3 is the first model to pack "open weights + million-token context + multimodal agent" into a single package:

* ✅ **Benchmark wins**: SWE-Bench Pro 59.0 above GPT-5.5 / Gemini 3.1 Pro; BrowseComp 83.5 above Opus 4.7
* ✅ **Million-token context, actually affordable**: MSA sparse attention cuts 1M-context cost to 1/20 of the previous generation
* ✅ **Pricing window**: limited-time 50% off + recharge bonuses ≈ 41% of list, ending June 8, 00:00 (UTC+8)
* ✅ **Open weights incoming**: weights and technical report within 10 days — start with the API now, run offline evals later

**Recommended next steps**:

1. Add `MiniMax-M3` to your A/B rotation in Claude Code / Cursor / in-house agents, focusing on whole-repo and long-horizon tasks
2. Run a full evaluation of long-document / video-understanding workloads during the 50%-off window
3. Stack recharge bonuses to push the effective rate to \~41%, and schedule batch jobs before June 8, 00:00 (UTC+8)

<Info>
  **Sources & dates**

  * Official MiniMax release: `minimax.io/blog/minimax-m3`
  * Third-party coverage: `venturebeat.com`, `techtimes.com`, `officechai.com`
  * Pricing page: `openrouter.ai/minimax/minimax-m3`
  * Data retrieved: 2026-06-05
</Info>
