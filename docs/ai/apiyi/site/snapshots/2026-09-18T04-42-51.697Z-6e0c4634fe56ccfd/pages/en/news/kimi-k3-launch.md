> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Kimi K3 Launch: 2.8T-Param Open-Source Flagship

> Moonshot AI releases Kimi K3: a 2.8-trillion-parameter MoE with Kimi Delta Attention, 1M context, and #1 on LMArena Frontend Code Arena. APIYI lists it at $3/$15 per 1M tokens, same as the official price, with recharge bonuses up to 17% off.

## Key Takeaways

* **Largest open-source model ever**: 2.8 trillion total parameters (MoE), the first open model in the 3-trillion-parameter class; full weights promised by July 27, 2026 (UTC+8)
* **Kimi Delta Attention + 1M context**: an exact 1,048,576-token window with flat pricing across the whole range — no context-tier markups
* **#1 on Frontend Code Arena**: jumped from Kimi K2.6's #18 to first place on LMArena's frontend leaderboard, winning 6 of 7 frontend domains
* **Strong reasoning/agent scores**: GPQA Diamond 93.5%, Terminal-Bench 2.1 88.3%, BrowseComp 91.2%, Humanity's Last Exam (with tools) 56.0%
* **Native multimodal + always-on thinking**: native image/video input; reasoning runs at max effort by default (`reasoning_effort="max"`)
* **Same price on APIYI**: listed at \$3.00/\$15.00 per 1M tokens (input/output), identical to Moonshot's official pricing, with cache-hit input as low as \$0.30

## Background

On July 16, 2026 (UTC+8), Moonshot AI officially released its next-generation flagship model **Kimi K3**. Following the open-source success of the Kimi K2 series, K3's 2.8-trillion-parameter MoE architecture makes it **the largest open-source model ever released**, with multiple outlets describing it as directly competitive with top closed-source systems.

K3 introduces the new **Kimi Delta Attention** mechanism, delivering an exact 1,048,576-token context window with **flat pricing across the entire range** — unlike vendors that charge higher tiers beyond a certain context length. The API went live on launch day, and Moonshot has committed to releasing the full open weights by July 27 (UTC+8).

<Info>
  **Sources**: Moonshot official docs `platform.kimi.ai/docs/guide/kimi-k3-quickstart`, official pricing page `platform.kimi.ai/docs/pricing/chat-k3`, plus VentureBeat / Tom's Hardware / Axios / MarkTechPost coverage. Data retrieved July 18, 2026 (UTC+8).
</Info>

## Deep Dive

### Core Features

<CardGroup cols={2}>
  <Card title="Open-Source Record" icon="trophy">
    2.8T total parameters (MoE), the largest open model ever; full weights due by July 27, 2026 (UTC+8) for self-hosting and fine-tuning.
  </Card>

  <Card title="1M Flat-Priced Context" icon="brain">
    Kimi Delta Attention powers a 1,048,576-token window with no pricing tiers — long-document costs stay predictable.
  </Card>

  <Card title="#1 Frontend Coding" icon="code">
    First place on LMArena Frontend Code Arena (up from K2.6's #18), winning 6 of 7 frontend domains.
  </Card>

  <Card title="Native Multimodal + Max Thinking" icon="eye">
    Native image/video input; thinking is always on at max effort (reasoning\_effort=max) out of the box.
  </Card>
</CardGroup>

### Benchmark Highlights

Key launch-day benchmarks (July 16, 2026):

| Benchmark                       | Kimi K3 Score | Notes                               |
| ------------------------------- | ------------- | ----------------------------------- |
| GPQA Diamond                    | **93.5%**     | Graduate-level science reasoning    |
| Terminal-Bench 2.1              | **88.3%**     | Real-world terminal/tool use        |
| BrowseComp                      | **91.2%**     | Autonomous web browsing & retrieval |
| Humanity's Last Exam (w/ tools) | **56.0%**     | Frontier cross-discipline questions |
| MCP Atlas                       | **84.2%**     | MCP tool-ecosystem calling          |
| LMArena Frontend Code Arena     | **#1**        | A 17-place jump from K2.6's #18     |

Long-context management is another highlight: Moonshot reports 91.2% on long-horizon tasks with context compaction triggered at 300K tokens, and 90.4% even with no context management across the full 1M window — meaning **long-running agent tasks depend far less on context engineering**.

### Technical Specs

| Spec             | Value                                          |
| ---------------- | ---------------------------------------------- |
| Model ID         | `kimi-k3`                                      |
| Architecture     | MoE, 2.8T total parameters                     |
| Context window   | 1,048,576 tokens (flat pricing throughout)     |
| Max output       | 131,072 by default, up to 1,048,576 tokens     |
| Modalities       | Text + image + video input / text output       |
| Thinking mode    | Always on, `reasoning_effort="max"` by default |
| Open-source plan | Full weights by July 27, 2026 (UTC+8)          |

<Warning>
  **Fixed sampling parameters**: Moonshot fixes `temperature=1.0`, `top_p=0.95`, `presence_penalty=0`, and `frequency_penalty=0`. Do **not** pass these in your requests — custom values may error out or be ignored.
</Warning>

## Practical Usage

### Recommended Scenarios

<CardGroup cols={2}>
  <Card title="Frontend / Full-Stack Dev" icon="code">
    \#1 on Frontend Code Arena — UI generation, component refactoring, and frontend debugging are top-tier.
  </Card>

  <Card title="Long-Horizon Agent Workflows" icon="bot">
    Terminal-Bench 2.1 88.3% + MCP Atlas 84.2%, with a 1M window that avoids chunking altogether.
  </Card>

  <Card title="Deep Research / Retrieval" icon="search">
    BrowseComp 91.2% — autonomous browsing, cross-verification, and research-report writing.
  </Card>

  <Card title="Multimodal Understanding" icon="image">
    Native image and video input: screenshot-to-code and video analysis work directly.
  </Card>
</CardGroup>

### Code Example

Kimi K3 is fully OpenAI-compatible — call it through the APIYI gateway:

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="kimi-k3",
    messages=[
        {"role": "system", "content": "You are a rigorous senior frontend engineer."},
        {"role": "user", "content": "Build a kanban board component with drag-and-drop sorting in React + Tailwind"}
    ]
)
print(response.choices[0].message.content)
```

Image input (native vision):

```python theme={null}
response = client.chat.completions.create(
    model="kimi-k3",
    messages=[{
        "role": "user",
        "content": [
            {"type": "image_url", "image_url": {"url": "data:image/png;base64,<base64>"}},
            {"type": "text", "text": "Recreate this design mockup in HTML + CSS"}
        ]
    }]
)
```

### Best Practices

* **Skip sampling parameters**: `temperature` and friends are fixed by Moonshot — omit them from requests
* **Budget for output tokens**: thinking always runs at max effort, so output usage is higher than typical models; `max_completion_tokens` defaults to 131,072 and can be raised as needed
* **Leverage caching**: Kimi K3 caches context automatically; cache-hit input bills at \$0.30/1M (1/10 of the miss price), a big win for multi-turn chats and repeated prefixes
* **Feed long material directly**: with flat pricing up to 1M tokens, whole codebases and long documents can go in without tier-crossing cost surprises

## Pricing & Availability

### Pricing

APIYI's listed price is **identical** to Moonshot's official pricing:

| Item               | Official Price      | APIYI Price         |
| ------------------ | ------------------- | ------------------- |
| Input (cache miss) | \$3.00 / 1M tokens  | \$3.00 / 1M tokens  |
| Input (cache hit)  | \$0.30 / 1M tokens  | \$0.30 / 1M tokens  |
| Output             | \$15.00 / 1M tokens | \$15.00 / 1M tokens |

The whole context range (up to 1M tokens) bills at the flat rates above — no tier markups.

### Stack Recharge Bonuses

APIYI runs an always-on [recharge bonus program](/en/faq/recharge-promotions), with bonus credit added straight to your balance:

* **Recharge \$100, get 10% bonus → an easy \~9% effective discount**
* **Larger tiers reach up to \~17% off** (tier-dependent; see the recharge promotions FAQ)

The discount comes as bonus credit, separate from the listed per-token price. For large enterprise purchases, contact support via WeChat.

## Summary & Recommendations

Kimi K3 raises the ceiling for open-source models:

1. **The open-source flagship answer**: 2.8T parameters with weights landing a week later — "open catching up to closed" has never had this much weight behind it
2. **Frontend and agents are the headline strengths**: #1 on Frontend Code Arena and 88.3% on Terminal-Bench 2.1 make it a first pick for frontend work and long-horizon agents
3. **Friendly price structure**: \$3/\$15 is a value tier for a 1M-context model, and 1/10-price cache hits plus flat context pricing keep long-context costs under control

<Warning>
  **Model selection**: go straight to Kimi K3 for frontend development, agent workflows, and deep research. For lightweight pure-chat traffic, its \$15/1M output price is on the high side — route that to a cheaper lightweight model.
</Warning>

<Info>
  **Sources**: Moonshot official docs and pricing pages (`platform.kimi.ai`), VentureBeat, Tom's Hardware, Axios, MarkTechPost, People's Daily Online. Data retrieved July 18, 2026 (UTC+8).
</Info>
