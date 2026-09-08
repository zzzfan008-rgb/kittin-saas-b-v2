> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.5 Flash Launch: Flash Beats Pro

> Announced at Google I/O 2026, Gemini 3.5 Flash beats Gemini 3.1 Pro on Terminal-Bench 2.1 (76.2%), MCP Atlas (83.6%), and GDPval-AA (1656 Elo), runs ~4x faster, and costs about half. Now live on APIYI with up to 20% recharge bonus.

## Key Highlights

* **Flash Beats Pro**: 76.2% Terminal-Bench 2.1, 83.6% MCP Atlas, 1656 Elo GDPval-AA — surpasses Gemini 3.1 Pro
* **\~4x Faster**: \~289 tokens/sec output, roughly 4x faster than comparable frontier models
* **\~Half the Cost**: About 50% cheaper than Gemini 3.1 Pro on input and output
* **1M Context**: 1M-token input window, 64K-token output, native multimodal input
* **Default in Google Products**: Already default in Gemini App, AI Mode Search and Antigravity
* **Live Now**: Available on APIYI from May 20, 2026 at official Google pricing, with up to 20% recharge bonus

## Background

On May 19, 2026, Google announced the **Gemini 3.5** family at Google I/O 2026, starting with the Flash variant. Unusually, Google led with Flash rather than Pro — and Gemini 3.5 Flash actually **beats Google's own flagship Gemini 3.1 Pro** (released Feb 2026) on most coding and agentic benchmarks.

According to Google's official numbers, Gemini 3.5 Flash beats Gemini 3.1 Pro on Terminal-Bench 2.1 (76.2% vs 70.3%), MCP Atlas (83.6% vs 78.2%), Finance Agent v2 (57.9% vs 43.0%) and GDPval-AA (1656 vs 1314 Elo). It also runs roughly 4x faster than comparable frontier models and is priced about half of 3.1 Pro.

Google has made 3.5 Flash the default model across the Gemini App, AI Mode in Search, and Google Antigravity. Gemini 3.5 Pro is expected next month. **APIYI has integrated the model on day one** — May 20, 2026 — at full Google parity pricing.

## Key Features

<CardGroup cols={2}>
  <Card title="🏆 Smarter than 3.1 Pro" icon="trophy">
    Leads Gemini 3.1 Pro on Terminal-Bench 2.1, MCP Atlas, Finance Agent v2, and GDPval-AA — especially strong on tool use and agentic workflows.
  </Card>

  <Card title="⚡ ~4x Faster" icon="bolt">
    \~289 output tokens/sec, around 4x faster than other frontier models — ideal for high-throughput and real-time apps.
  </Card>

  <Card title="🧠 Native Multimodal" icon="brain">
    1M-token input, 64K-token output. Accepts text, images, audio and video. Leads on CharXiv Reasoning at 84.2%.
  </Card>

  <Card title="💰 ~Half the Price" icon="dollar-sign">
    About 50% cheaper than Gemini 3.1 Pro, plus extra savings via APIYI recharge bonuses.
  </Card>
</CardGroup>

### Benchmarks

| Benchmark              | Gemini 3.5 Flash | Gemini 3.1 Pro | Notes                                               |
| ---------------------- | ---------------- | -------------- | --------------------------------------------------- |
| **Terminal-Bench 2.1** | **76.2%**        | 70.3%          | Terminal-style agent coding                         |
| **MCP Atlas**          | **83.6%**        | 78.2%          | Tool/MCP use (also beats Claude Opus 4.7 & GPT-5.5) |
| **Finance Agent v2**   | **57.9%**        | 43.0%          | Finance agentic workflows                           |
| **GDPval-AA**          | **1656 Elo**     | 1314           | General task Elo                                    |
| **CharXiv Reasoning**  | **84.2%**        | -              | Chart understanding                                 |

<Info>
  Source: Google official blog `blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5/` and Google DeepMind model card (published May 19, 2026).
</Info>

### Specs

| Item             | Gemini 3.5 Flash                                                     |
| ---------------- | -------------------------------------------------------------------- |
| API model        | `gemini-3.5-flash` (no preview suffix)                               |
| Context window   | 1,000,000 tokens                                                     |
| Max output       | 64,000 tokens                                                        |
| Input modalities | Text, image, audio, video                                            |
| Output           | Text                                                                 |
| Reasoning        | Thinking with encrypted reasoning context preserved across API calls |
| Tooling          | Structured outputs, multimodal function responses, combined tool use |
| Excluded         | Computer Use (other Gemini 3 capabilities are inherited)             |
| Channels         | Gemini API, AI Studio, Vertex AI, Antigravity, APIYI                 |

## Code Example

```python theme={null}
import openai

client = openai.OpenAI(
    api_key="your-apiyi-api-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="gemini-3.5-flash",
    messages=[
        {"role": "user", "content": "Plan an agent that automates daily sales reporting."}
    ],
)
print(response.choices[0].message.content)
```

## Pricing

| Item              | Price              | Notes                    |
| ----------------- | ------------------ | ------------------------ |
| **Input Tokens**  | \$1.50 / 1M tokens | Global region            |
| **Output Tokens** | \$9.00 / 1M tokens | Includes thinking tokens |
| **Cached Input**  | \$0.15 / 1M tokens | Prompt cache hit         |
| Non-global region | \$1.65 / \$9.90    | Input / Output           |

<Info>
  **Pricing on APIYI** matches Google's official rates. With our recharge bonus program (see [Recharge Promotions](/en/faq/recharge-promotions)), effective cost goes down to roughly **\$1.20 input / \$7.20 output** per 1M tokens — up to 20% off.
</Info>

### Availability

* ✅ Gemini API / AI Studio (Google)
* ✅ Vertex AI (enterprise)
* ✅ Gemini App, AI Mode Search, Google Antigravity (default model)
* ✅ **APIYI** — stable direct access, up to 20% recharge bonus ⭐ Recommended

## Recommendation

Gemini 3.5 Flash isn't just another iteration — it's the first time a Flash model **beats the same-generation Pro across the board**, while being \~50% cheaper and \~4x faster. For agentic, tool-using and high-throughput workloads, it's the most obvious upgrade target available today.

### Who should switch now?

* **Agent / MCP developers** — best-in-class MCP Atlas score
* **Coding products** — Terminal-Bench beats 3.1 Pro at half the price
* **High-concurrency apps** — 4x speed materially cuts latency and cost
* **Long-context workloads** — full 1M-token window retained

### When to keep using other models

* Need **Computer Use**? Stay on Gemini 3 Pro / 3.1 Pro for now
* Ultra-low-cost chatbots may still compare Gemini 2.5 Flash-Lite — but for agentic tasks, 3.5 Flash wins on cost/quality

## Get Started

1. **Sign up**: `api.apiyi.com`
2. **Add credits**: Up to 20% off via recharge bonuses
3. **Read the docs**: [Gemini API Guide](/en/api-capabilities/gemini/native)
4. **Switch the model**: Change `model` to `gemini-3.5-flash`

***

<Info>
  **Sources**:

  * Google blog (Gemini 3.5 launch): `blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5/`
  * Google DeepMind model card: `deepmind.google/models/model-cards/gemini-3-5-flash/`
  * Gemini API pricing: `ai.google.dev/gemini-api/docs/pricing`
  * Data retrieved: May 20, 2026
</Info>
