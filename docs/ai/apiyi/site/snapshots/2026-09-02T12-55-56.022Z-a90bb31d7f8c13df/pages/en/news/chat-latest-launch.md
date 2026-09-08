> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI chat-latest Launches: Always Tracks ChatGPT's Default Instant Model

> OpenAI introduces version-less alias chat-latest that auto-tracks ChatGPT's current Instant model (currently GPT-5.5 Instant), 400K context + multimodal input. APIYI is live in sync, list price matches OpenAI's $5/$30 per 1M tokens, recharge promo brings effective cost to 79-86% of list.

## Highlights

* **Version-less alias**: Renamed from `gpt-5.3-chat-latest` to the cleaner `chat-latest` — no more version-number coupling
* **Always current**: Auto-tracks ChatGPT's active Instant model snapshot (currently GPT-5.5 Instant)
* **Big context**: 400K tokens input, 128K tokens max output, knowledge cutoff 2025-08-31
* **Multimodal input**: Text + image input, text-only output (no audio/video)
* **Official pricing**: Input \$5, output \$30, cached input \$0.50 per 1M tokens — identical to OpenAI's rates
* **Recharge promo**: APIYI's stackable recharge bonus brings effective cost down to **79-86%** of OpenAI's list

## Background

In early May 2026, OpenAI rolled out a generational swap for ChatGPT's default Instant model — **GPT-5.5 Instant** replaced the previous-gen Instant model as the new default across every ChatGPT tier (Free through Enterprise). At the same time, OpenAI renamed the "always latest" API alias on the API side: from the versioned `gpt-5.x-chat-latest` family to the **version-less `chat-latest`**.

The design intent behind the rename is clear: **keep the alias stable, let the pointer roll**. The old naming (`gpt-5.2-chat-latest`, `gpt-5.3-chat-latest`) misled developers into thinking the model snapshot was bound to the version number — but in reality OpenAI had been quietly rolling the underlying snapshot all along; the version was just a label. The new `chat-latest` makes that semantic explicit: **it is the API mirror of ChatGPT's default model, and it ships when ChatGPT ships**.

OpenAI notified developers on **2026/5/8 (UTC+8)**: `gpt-5.2-chat-latest` and `gpt-5.3-chat-latest` are deprecated and will be removed from the API. New integrations should use `chat-latest`.

<Info>
  **Sources**: OpenAI official API docs `developers.openai.com/api/docs/models/chat-latest`, OpenAI Changelog deprecation notice 2026/5/8, TechCrunch report on GPT-5.5 Instant launch 2026/5/5. Data retrieved 2026/5/21 (UTC+8).
</Info>

## Detailed Breakdown

### Key Features

<CardGroup cols={2}>
  <Card title="Version-less alias" icon="link">
    `chat-latest` always points to ChatGPT's current default Instant model — no need to manually track version numbers.
  </Card>

  <Card title="Rolling auto-update" icon="refresh-cw">
    OpenAI rolls the underlying snapshot without an announcement — once integrated, you don't need to watch upgrade timing.
  </Card>

  <Card title="400K context" icon="brain">
    400K tokens input + 128K tokens max output — comfortable for long documents, long conversations, long RAG contexts.
  </Card>

  <Card title="Multimodal input" icon="image">
    Native image input (documents, screenshots, charts); text-only output. Audio and video modalities are not supported.
  </Card>
</CardGroup>

### Currently Points to: GPT-5.5 Instant

As of 2026/5/21 (UTC+8), `chat-latest` points to **GPT-5.5 Instant**. Improvements over the previous-gen Instant model include:

* **\~50%+ fewer hallucinations** on factual QA tasks
* **More concise replies**: default behavior leans "short and precise," cuts redundant scaffolding
* **Better instruction following** on complex multi-step instructions
* **AIME 2025**: 81.2 (vs 65.4 previous generation)
* **Multimodal reasoning**: measurable gains on visual data interpretation and clinical accuracy
* **Cross-conversation memory**: can reference past conversations, files, and Gmail (full experience in ChatGPT; API uses call-time context)

### Technical Specs

| Spec                | Value           |
| ------------------- | --------------- |
| Model ID            | `chat-latest`   |
| Currently points to | GPT-5.5 Instant |
| Input context       | 400,000 tokens  |
| Max output          | 128,000 tokens  |
| Knowledge cutoff    | 2025-08-31      |
| Input modalities    | Text, image     |
| Output modality     | Text            |
| Streaming           | Supported       |
| Function calling    | Supported       |
| Structured Outputs  | Supported       |
| Fine-tuning         | Not supported   |
| Predicted Outputs   | Not supported   |

When called via OpenAI's **Responses API**, `chat-latest` can also enable built-in tools: Web Search, File Search, Image Generation, Code Interpreter, MCP Tools.

## Practical Use

### Recommended Scenarios

<CardGroup cols={2}>
  <Card title="ChatGPT experience parity" icon="messages-square">
    Want API output style that matches the ChatGPT web/desktop experience your end users are already familiar with.
  </Card>

  <Card title="Long-context conversational products" icon="messages-square">
    400K input window suits multi-turn long dialogues, long RAG, document QA; multimodal input handles screenshot/chart understanding.
  </Card>

  <Card title="Low-maintenance integration" icon="wand-sparkles">
    Integrate once, benefit long-term — no code changes when OpenAI rolls the underlying Instant model.
  </Card>

  <Card title="Production API alternative" icon="rocket">
    OpenAI officially recommends `gpt-5.5` for production, but `chat-latest` is the answer if you want to "roll with ChatGPT."
  </Card>
</CardGroup>

### Code Example

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

# Plain text
response = client.chat.completions.create(
    model="chat-latest",
    messages=[
        {"role": "system", "content": "You are a concise assistant — keep replies under two sentences."},
        {"role": "user", "content": "What is a token?"}
    ],
    stream=False
)
print(response.choices[0].message.content)
```

Multimodal (image input):

```python theme={null}
response = client.chat.completions.create(
    model="chat-latest",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "What does this image say?"},
            {"type": "image_url", "image_url": {
                "url": "https://example.com/screenshot.png"
            }}
        ]
    }]
)
print(response.choices[0].message.content)
```

### Best Practices

* **Production stability first → use pinned snapshots**: If your business is highly sensitive to model behavior and you don't want auto-upgrades, use `gpt-5.5` or a specific snapshot; `chat-latest` is for the "roll with ChatGPT" scenario.
* **Cached input saves money**: `chat-latest`'s cached input is \$0.50/M tokens — 1/10 of regular input. Long system prompts and long RAG contexts should actively leverage caching.
* **Multimodal cost**: Image input is tiled and converted to tokens for billing — complex images can consume more than you'd expect. Estimate with OpenAI's Tokenizer before going to production.
* **Don't assume fine-tuning**: `chat-latest` does not support fine-tuning — pick another snapshot if you need it.

## Pricing & Availability

### Side-by-side Pricing

| Item         | OpenAI list         | APIYI list          |
| ------------ | ------------------- | ------------------- |
| Input        | \$5.00 / 1M tokens  | \$5.00 / 1M tokens  |
| Cached input | \$0.50 / 1M tokens  | \$0.50 / 1M tokens  |
| Output       | \$30.00 / 1M tokens | \$30.00 / 1M tokens |

APIYI's **list price is identical to OpenAI's** — no markup, no hidden fee. This is a direct official-proxy channel — no snapshot swaps. When ChatGPT's default model upgrades, `chat-latest` switches in sync.

### Effective Price (with Recharge Promo)

APIYI runs an always-on [recharge bonus promo](/en/faq/recharge-promotions): the more you top up, the higher the bonus percentage, credited directly to your spendable balance. Stacking the bonus:

* **Top up \$100 → \~86% of list** (effective input \~\$4.30, output \~\$25.80)
* **Top up \$300+ → as low as 79% of list** (depending on the tier; see Recharge Promotions FAQ)

The discount lives entirely in the **bonus credit**, separated from the list price. For enterprise volume or custom rebates, reach out via WeChat customer support.

### Available Groups

| Group        | Open | Notes                                                    |
| ------------ | ---- | -------------------------------------------------------- |
| `Default`    | ✅    | Direct calls work on the default group                   |
| `SVIP`       | ✅    | High-priority queue, no extra multiplier                 |
| `Enterprise` | ✅    | Enterprise group, suited for high-concurrency production |

Existing Tokens drop in without config changes.

## Summary & Recommendation

`chat-latest` is not a brand-new model — it's OpenAI's naming correction for the "always latest" semantic. For API integrators, it solves three things:

1. **Clear naming**: version numbers no longer mislead — the alias literally means "same as ChatGPT"
2. **Stable integration**: integrate once, benefit long-term — no code changes when OpenAI rolls the Instant model
3. **Official semantics**: currently points to GPT-5.5 Instant, will auto-follow future ChatGPT default upgrades

<Warning>
  **Production advice**: OpenAI officially recommends **pinned snapshots** like `gpt-5.5` for production APIs — easier behavior control and regression testing. `chat-latest` suits products that want **ChatGPT experience parity** or are **willing to follow OpenAI's upgrade cadence**.
</Warning>

If your product positioning is "give users the ChatGPT experience," `chat-latest` is the most direct official answer today — APIYI's official-proxy channel runs at list price, and stackable recharge bonuses bring it down further.

<Info>
  **Sources**: OpenAI official API docs `developers.openai.com/api/docs/models/chat-latest`, OpenAI Changelog deprecation notice (2026/5/8), TechCrunch (2026/5/5), OpenRouter chat-latest model page `openrouter.ai/openai/gpt-chat-latest`. Data retrieved 2026/5/21 (UTC+8).
</Info>
