> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.6 Text Model Series (Legacy)

> Alibaba's Qwen3.6 family on APIYI: Max-Preview coding flagship + Flash speed-first multimodal + Plus balanced workhorse + 27B / 35B-A3B open-weight variants (hosted by APIYI — no GPU rental needed). All routed via Aliyun's official relay, OpenAI Chat-compatible. List prices match Alibaba's official rate; APIYI's recharge bonus brings effective unit prices to ~85% of list.

<Warning>
  **This page is a legacy archive.** Alibaba Qwen's current flagship is [Qwen3.8-Max](/en/api-capabilities/qwen-3-8/overview), released August 2026 — 2.4T parameters, 1M context, native image and video input, listed 17.5％ below Alibaba's official price. The five Qwen3.6 models below remain callable at unchanged pricing and integration, but new projects should start with Qwen3.8-Max.
</Warning>

Qwen3.6 is Alibaba Tongyi Qianwen's next-generation model family, released in Q2 2026 across three closed-source production tiers — **Max** (flagship), **Plus** (balanced), **Flash** (speed-first) — plus two open-weight variants: **27B** and **35B-A3B**. APIYI routes all five models through **Aliyun official relay / APIYI hosted relay**, OpenAI Chat Completions compatible. Closed-source tiers match the official portal's auth and rate-limit policies; **the open-weight tiers are hosted by APIYI's official relay so customers don't have to rent GPUs or stand up local inference**.

<Note>
  **🚀 Highlights**: Max-Preview claims **#1 on six coding benchmarks** including SWE-bench Pro and Terminal-Bench 2.0; Flash is a 35B-A3B MoE with native 256K (expandable to 1M) multimodal context; Plus is a 72B/18B-active workhorse with a 1M context window. The open-weight **`qwen3.6-27b`** (27B dense) and **`qwen3.6-35b-a3b`** (35B MoE / 3B active) are hosted on APIYI's official relay — no GPU rental needed, billed per token. **Built for coding agents, long-context RAG, multimodal dispatch, and compliance-sensitive workloads needing auditable weights**.
</Note>

### Closed-source production tiers (Aliyun official relay)

<CardGroup cols={3}>
  <Card title="qwen3.6-max-preview" icon="trophy">
    **Coding flagship**

    \#1 on 6 coding benchmarks; AIME 2025 93%, GPQA 86%, LiveCodeBench 79%.
  </Card>

  <Card title="qwen3.6-flash" icon="bolt">
    **Speed-first multimodal**

    35B-A3B MoE, native text / image / video input, 256K base context expandable to 1M.
  </Card>

  <Card title="qwen3.6-plus" icon="scale">
    **Balanced workhorse**

    72B total / 18B active, 1M context, Terminal-Bench 61.6 beats Claude Opus 4.5.
  </Card>
</CardGroup>

### Open-weight tiers (hosted by APIYI · no GPU rental)

<CardGroup cols={2}>
  <Card title="qwen3.6-27b" icon="box">
    **27B dense · coding powerhouse**

    Qwen team's open-weight release (Hugging Face `Qwen/Qwen3.6-27B`). Coding ability rivals 397B-class models. Hosted by APIYI's official relay — no local GPUs required.
  </Card>

  <Card title="qwen3.6-35b-a3b" icon="boxes">
    **35B-A3B open-weight MoE**

    Qwen team's open-weight release (Hugging Face `Qwen/Qwen3.6-35B-A3B`); same lineage as closed-source Flash, different distribution tier. Only 3B active params — extremely low compute cost.
  </Card>
</CardGroup>

## Why APIYI's Qwen3.6 via Aliyun official relay?

Calibrated against Alibaba Cloud Bailian's official channel, with deep optimization for enterprise production across **stability**, **cost**, and **integration ergonomics**:

<CardGroup cols={2}>
  <Card title="Aliyun official relay" icon="server">
    Routed via Alibaba Cloud Bailian's official channel. Auth and rate-limit policies match the official portal — low domestic latency, enterprise-grade SLA.
  </Card>

  <Card title="No concurrency cap · scale freely" icon="infinity">
    No hard RPM / TPM ceilings (subject to upstream supply). Enterprise customers can scale on demand; tickets and dedicated channels available for high-concurrency coordination.
  </Card>

  <Card title="List-price match + ~15% off via recharge" icon="percent">
    List price matches Alibaba Cloud's official rate. Stack with [recharge bonuses](/en/faq/recharge-promotions) for an effective unit price around **85% of list**.
  </Card>

  <Card title="Global zero-friction access" icon="globe">
    **No overseas server or proxy required**. Domestic data centers, residential broadband, and overseas nodes can all connect directly to `api.apiyi.com` — no overseas migration needed.
  </Card>

  <Card title="Full OpenAI-compatible ecosystem" icon="layers">
    OpenAI Chat Completions compatible. Switch seamlessly across GPT / Claude / DeepSeek / GLM and more via APIYI's [unified model catalog](/en/api-capabilities/model-info).
  </Card>

  <Card title="Professional service · enterprise support" icon="handshake">
    Deep expertise in model selection and Agent workflows; full PoC → canary → production support for enterprise customers.
  </Card>
</CardGroup>

## How to choose among the five

<CardGroup cols={2}>
  <Card title="Max-Preview · coding & complex reasoning" icon="trophy">
    **Scenarios**: Coding Agent driver, real-world software-engineering tasks (SWE-Verified class), Cursor / Claude Code workflow primary model.

    **Benchmarks**: SWE-bench Pro 58.4 (beats GLM-5.1's 56.6), AIME 2025 93%, GPQA 86%, LiveCodeBench 79%, Terminal-Bench 2.0 #1.

    **Note**: Marked Preview — weights still iterating. Run a small canary before flipping main traffic.
  </Card>

  <Card title="Flash · high-volume multimodal long-context" icon="bolt">
    **Scenarios**: Image / video understanding, long-document summarization, bulk translation, post-RAG full-document synthesis.

    **Architecture**: 35B total / 3B active MoE (35B-A3B), native 256K context expandable to 1M tokens.

    **Multimodal**: Native text / image / video input. Unit price \~1/8 that of Max.
  </Card>

  <Card title="Plus · the balanced workhorse" icon="scale">
    **Scenarios**: Daily dialog, customer support, content generation, enterprise knowledge-base Q\&A, mid-complexity reasoning.

    **Architecture**: 72B total / 18B active MoE — inference speed roughly 3× Claude Opus 4.6.

    **Benchmarks**: Terminal-Bench 2.0 at 61.6 beats Claude Opus 4.5 (59.3); SWE-bench Verified 78.8.
  </Card>

  <Card title="qwen3.6-27b · open-weight coding powerhouse" icon="box">
    **Scenarios**: cost-sensitive coding assistance; API-validation phase before committing to local deploy; customers with compliance requirements for auditable open-source licenses.

    **Notes**: 27B dense, open weights, coding ability rivals 397B-class models. Hosted by APIYI — no local GPU.
  </Card>

  <Card title="qwen3.6-35b-a3b · open-weight speed MoE" icon="boxes">
    **Scenarios**: high-frequency low-cost workflows; transition phase before moving to self-hosted inference; projects requiring downloadable weights for compliance.

    **Notes**: Same lineage as closed-source Flash (35B total / 3B active). Open-weight version hosted by APIYI — skip GPU rental, deployment, and ops.
  </Card>

  <Card title="Recommended routing" icon="route">
    **Strategy**: Flash by default + Plus on escalation + Max-Preview as ceiling; downgrade to open-weight 27b / 35b-a3b for ultra-cost-sensitive workloads.

    Route routine dialog and multimodal batches to Flash; escalate to Plus for stronger reasoning; reserve Max-Preview for coding agents, complex reasoning, and multi-step planning; drop to the open-weight tiers when cost matters most or auditable weights are required.
  </Card>
</CardGroup>

## Pricing

All five models bill under **pay-as-you-go - Chat**. Closed-source tiers (Max-Preview / Flash / Plus) use **tiered pricing** keyed on the total input token count of a single request. Open-weight tiers (27b / 35b-a3b) bill at a **single flat rate — no tiers**. List prices match Alibaba Cloud's official rate; APIYI's recharge bonus brings the effective unit price to roughly **85% of list**.

### qwen3.6-max-preview

| Single-request input tokens | Input price          | Output price          |
| --------------------------- | -------------------- | --------------------- |
| **0 – 128K**                | \$1.2800 / 1M tokens | \$7.6800 / 1M tokens  |
| **128K – 256K**             | \$2.1200 / 1M tokens | \$12.7200 / 1M tokens |

### qwen3.6-flash

| Single-request input tokens | Input price          | Output price         |
| --------------------------- | -------------------- | -------------------- |
| **0 – 256K**                | \$0.1700 / 1M tokens | \$1.0200 / 1M tokens |
| **256K – 1000K**            | \$0.6800 / 1M tokens | \$4.0800 / 1M tokens |

### qwen3.6-plus

| Single-request input tokens | Input price          | Output price         |
| --------------------------- | -------------------- | -------------------- |
| **0 – 256K**                | \$0.3000 / 1M tokens | \$1.8000 / 1M tokens |
| **256K – 1000K**            | \$1.2000 / 1M tokens | \$7.2000 / 1M tokens |

### qwen3.6-27b (open-weight · APIYI hosted)

| Billing             | Input price          | Output price         |
| ------------------- | -------------------- | -------------------- |
| **Flat (no tiers)** | \$0.4200 / 1M tokens | \$2.5200 / 1M tokens |

### qwen3.6-35b-a3b (open-weight · APIYI hosted)

| Billing             | Input price          | Output price         |
| ------------------- | -------------------- | -------------------- |
| **Flat (no tiers)** | \$0.2600 / 1M tokens | \$1.5600 / 1M tokens |

<Info>
  **Pricing notes**:

  * **Closed-source tiers (tiered pricing)**: the tier is set by the **total input tokens of a single request**. All tokens in that request (input + output) bill at that tier's rate. **No cross-tier proration** — e.g., a Flash request with 300K input tokens lands in `256K – 1000K` and the entire request bills at \$0.68 / \$4.08, not split as "first 256K cheap, remaining 44K at the higher tier."
  * **Open-weight tiers (flat pricing)**: `qwen3.6-27b` and `qwen3.6-35b-a3b` are hosted by APIYI's official relay — no tiers. Customers don't have to rent GPUs or run local inference; settle directly by actual token consumption.
  * List prices match Alibaba Cloud Bailian. With [recharge bonuses](/en/faq/recharge-promotions), the effective unit price lands around **85% of list**.
  * Cache-hit pricing is not currently disclosed separately; falls back to the base tier.
</Info>

## Specs

### Closed-source production tiers

| Dimension                       | qwen3.6-max-preview               | qwen3.6-flash               | qwen3.6-plus                |
| ------------------------------- | --------------------------------- | --------------------------- | --------------------------- |
| **Model ID**                    | `qwen3.6-max-preview`             | `qwen3.6-flash`             | `qwen3.6-plus`              |
| **Architecture**                | Dense large model                 | MoE 35B-A3B                 | MoE 72B / 18B active        |
| **Context**                     | 262K tokens                       | 256K (expandable to 1M)     | 1M tokens                   |
| **Input modalities**            | Text                              | Text / image / video        | Text                        |
| **Output format**               | Text                              | Text                        | Text                        |
| **Streaming**                   | ✅ Supported                       | ✅ Supported                 | ✅ Supported                 |
| **Function calling / tool use** | ✅ Supported                       | ✅ Supported                 | ✅ Supported                 |
| **Chain-of-thought**            | ✅ Auto-enabled on reasoning tasks | —                           | ✅ Always on                 |
| **Billing**                     | Pay-as-you-go Chat (tiered)       | Pay-as-you-go Chat (tiered) | Pay-as-you-go Chat (tiered) |
| **Channel**                     | Aliyun official relay             | Aliyun official relay       | Aliyun official relay       |

### Open-weight tiers (hosted by APIYI)

| Dimension                       | qwen3.6-27b                                             | qwen3.6-35b-a3b                                             |
| ------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------- |
| **Model ID**                    | `qwen3.6-27b`                                           | `qwen3.6-35b-a3b`                                           |
| **Architecture**                | 27B dense                                               | MoE 35B total / 3B active                                   |
| **License**                     | Qwen team open-weight (Hugging Face `Qwen/Qwen3.6-27B`) | Qwen team open-weight (Hugging Face `Qwen/Qwen3.6-35B-A3B`) |
| **Context**                     | Matches official weight card                            | Matches official weight card                                |
| **Input modalities**            | Text                                                    | Text                                                        |
| **Streaming**                   | ✅ Supported                                             | ✅ Supported                                                 |
| **Function calling / tool use** | ✅ Supported                                             | ✅ Supported                                                 |
| **Billing**                     | Pay-as-you-go Chat (flat, no tiers)                     | Pay-as-you-go Chat (flat, no tiers)                         |
| **Channel**                     | APIYI hosted relay                                      | APIYI hosted relay                                          |

<Tip>
  **Why hosted open-weights**: open-weight checkpoints are publicly downloadable, but running them needs GPUs, VRAM, and ops. **APIYI hosts these open weights on its official relay**, so you call the API directly — keeping the "auditable weights, controllable license" upside while skipping rental, deploy, and ops costs.
</Tip>

## Endpoints

| Endpoint               | Method | Content-Type       | Purpose                                                                                       |
| ---------------------- | ------ | ------------------ | --------------------------------------------------------------------------------------------- |
| `/v1/chat/completions` | `POST` | `application/json` | Dialog / reasoning / tool use (**shared by all five models**, only the `model` field differs) |

<Tip>
  **Domain**: `api.apiyi.com` is the primary gateway. Alternative gateways like `b.apiyi.com` / `vip.apiyi.com` produce identical responses. Set `base_url` to `https://api.apiyi.com/v1` to use the OpenAI / OpenAI-compatible SDK directly.
</Tip>

## Code examples

### Python (OpenAI SDK compatible)

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# Max-Preview: coding Agent driver
resp = client.chat.completions.create(
    model="qwen3.6-max-preview",
    messages=[
        {"role": "system", "content": "You are a senior Python engineer. Return changes as a unified diff."},
        {"role": "user", "content": "Add type hints and fix any latent bugs in this snippet ..."}
    ]
)
print(resp.choices[0].message.content)

# Flash: image + text multimodal input
resp = client.chat.completions.create(
    model="qwen3.6-flash",
    messages=[
        {"role": "user", "content": [
            {"type": "text", "text": "Describe the key information in this image."},
            {"type": "image_url", "image_url": {"url": "https://your-image-url.png"}}
        ]}
    ]
)
print(resp.choices[0].message.content)

# Plus: daily dialog and mid-complexity reasoning
resp = client.chat.completions.create(
    model="qwen3.6-plus",
    messages=[{"role": "user", "content": "Introduce yourself in one sentence."}]
)
print(resp.choices[0].message.content)
```

### Node.js

```javascript theme={null}
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-your-api-key',
  baseURL: 'https://api.apiyi.com/v1',
});

const resp = await client.chat.completions.create({
  model: 'qwen3.6-plus',
  messages: [{ role: 'user', content: 'Introduce yourself in one sentence.' }],
});

console.log(resp.choices[0].message.content);
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/chat/completions" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen3.6-max-preview",
    "messages": [
      {"role": "user", "content": "Explain what an MoE architecture is."}
    ]
  }'
```

## Best practices

<Steps>
  <Step title="Pick the right tier per task">
    Default to Flash for routine dialog / classification / multimodal batching. Use Plus for mid-complexity reasoning and enterprise knowledge-base Q\&A. Only escalate to Max-Preview for coding agents, complex planning, or competition-level math reasoning. Drop a tier whenever you can.
  </Step>

  <Step title="Estimate the tier boundary">
    Profile your P95 input token count before launch. Max-Preview crossing 128K, or Flash / Plus crossing 256K, sees a sharp price jump. Summarize / chunk extra-long context to keep P95 within the lower tier.
  </Step>

  <Step title="Multimodal batching">
    Flash supports a 1M context and video input, but a single ultra-long request triggers the higher tier. Slice long video into segments, then feed in chunks within 256K to control per-call cost.
  </Step>

  <Step title="Preview canary">
    `qwen3.6-max-preview` is a Preview build — weights still iterating. For critical paths, run a small canary with A/B comparison before flipping main traffic.
  </Step>

  <Step title="Tools & streaming">
    All three models support OpenAI-style `tools` and `stream: true`. You can drop them into existing OpenAI-compatible Agent frameworks (OpenClaw, LangChain, LlamaIndex, etc.) without rewriting tool-calling logic.
  </Step>

  <Step title="Stack with recharge bonuses">
    List prices already match Alibaba's official rate. Combined with [recharge bonuses](/en/faq/recharge-promotions), effective unit price lands around **85% of list**. Larger top-ups (\$1,000+) earn higher bonus ratios — top up in fewer, larger transactions for the best margin.
  </Step>
</Steps>

## Errors & retries

| Status  | Meaning                           | What to do                                                                          |
| ------- | --------------------------------- | ----------------------------------------------------------------------------------- |
| `400`   | Param error / unknown model       | Check `model` spelling, `messages` shape, and whether the input exceeds max context |
| `401`   | Invalid token                     | Verify the Bearer Token                                                             |
| `403`   | Content moderation block          | Adjust prompts / reference inputs to avoid policy violations                        |
| `429`   | Rate-limit / insufficient balance | Exponential backoff retry; check account balance                                    |
| `5xx`   | Gateway / backend error           | Retry 1–2 times; if still failing, file a ticket                                    |
| Timeout | Long-tail latency                 | Set client timeout to **≥ 120s** (CoT or long-context calls take longer)            |

<Info>
  **Client recommendations**:

  * Set request timeout to **≥ 120 seconds** (Max-Preview reasoning and Plus long-context CoT take longer)
  * Apply **exponential backoff retry** on 5xx and timeouts (recommend 2 attempts)
  * Log the `x-request-id` response header for troubleshooting
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="Do all five models share the same API endpoint?">
    Yes. All five share `/v1/chat/completions` (OpenAI Chat Completions compatible). Only the `model` field differs (`qwen3.6-max-preview` / `qwen3.6-flash` / `qwen3.6-plus` / `qwen3.6-27b` / `qwen3.6-35b-a3b`) — switch in the same codebase as needed.
  </Accordion>

  <Accordion title="What's the difference between open-weight (27b / 35b-a3b) and closed-source tiers?">
    Three main differences: **(1) Downloadable weights** — open-weight checkpoints are on Hugging Face for internal audit, compliance filing, or future migration to local inference; **(2) Hosted compute** — APIYI hosts the open weights on its official relay so you just call the API, no GPU rental / deploy / ops; **(3) Simpler billing** — open-weight tiers use flat pricing, no tiers, easier to budget. On capability: 35B-A3B shares lineage with closed-source Flash (different distribution tier); 27B is an independent dense model whose coding ability rivals models with much higher parameter counts.
  </Accordion>

  <Accordion title="If the weights are open, why use APIYI's hosted API?">
    Self-hosting an open large model needs at least: capable GPUs (27B requires at least one A100 40G; 35B-A3B needs more VRAM), an inference framework (vLLM / TensorRT-LLM), monitoring, failover, and an upgrade pipeline. **APIYI's hosted official relay handles all of that** — billed by token, scales on demand, and shares the same OpenAI-compatible SDK as the closed-source tiers. Build with the API; later, decide whether to switch to self-hosting. The path stays smooth.
  </Accordion>

  <Accordion title="How exactly does tiered pricing work?">
    The tier is determined by the **total input tokens of a single request**. All tokens (input + output) in that request bill at the corresponding tier's rate. Example: a Flash request with 300K input tokens lands in `256K – 1000K` and bills the entire request at \$0.68 / \$4.08 — no split between "first 256K cheap, remaining 44K higher."
  </Accordion>

  <Accordion title="Max-Preview is a Preview — is it production-ready?">
    Yes, but run a canary first. The Qwen team has stated subsequent revisions will continue to refine weights. For critical paths, A/B test against your benchmark tasks and only flip main traffic once a stable version lands.
  </Accordion>

  <Accordion title="How do I send multimodal input to Flash?">
    Use OpenAI's Vision-compatible format: in `messages`, send `content` as an array where each element is `{type: "text", text: ...}` or `{type: "image_url", image_url: {url: ...}}`. For video, follow the official doc's `video_url` / frame-sampling fields.
  </Accordion>

  <Accordion title="Are APIYI's prices the same as Alibaba Cloud Bailian's official site?">
    List price matches the official rate. The difference: APIYI stacks [recharge bonuses](/en/faq/recharge-promotions) for an effective unit price around **85% of list**, plus a unified account that supports the entire OpenAI-compatible ecosystem (GPT / Claude / Gemini / DeepSeek / GLM, etc.) — no need to maintain multiple vendor accounts.
  </Accordion>

  <Accordion title="Are function calling / tool use supported?">
    Yes. All three models accept OpenAI-standard `tools` / `tool_choice`. You can reuse existing Agent-framework tool-calling logic. Max-Preview shines at multi-step tool calls and long-horizon planning.
  </Accordion>

  <Accordion title="Is chain-of-thought output supported?">
    Max-Preview auto-enables CoT on reasoning tasks; Plus has CoT always on; Flash is speed-first and does not output CoT by default. Field names follow Alibaba Cloud's response format (`reasoning_content`, etc.).
  </Accordion>

  <Accordion title="What if my request exceeds 1M context?">
    Flash and Plus cap at 1M tokens; Max-Preview at 262K. Exceeding the cap returns `400`. Apply summarization / chunking / RAG retrieval before sending — don't try to push everything in a single call.
  </Accordion>

  <Accordion title="Can I use the official OpenAI SDK directly?">
    Yes. Set `base_url` to `https://api.apiyi.com/v1` and pass any of the model IDs above as `model` — zero-code migration.
  </Accordion>

  <Accordion title="Are failed requests billed?">
    Client-side `4xx` errors (param error / auth failure / content-moderation block) are not billed. Server-side `5xx` errors that don't reach inference are also not billed. Requests that successfully return tokens are billed by actual token count, even if the client cancels mid-stream.
  </Accordion>
</AccordionGroup>

## Related docs

* [Deep dive: Qwen3.6 Max-Preview & Flash launch](/en/news/qwen-3-6-max-flash-launch)
* [Deep dive: Qwen3.6-Plus launch — Alibaba's strongest coding agent](/en/news/qwen-3-6-plus-launch)
* [Recharge promotions](/en/faq/recharge-promotions) — drop unit price to \~85% of list
* [Model catalog](/en/api-capabilities/model-info) — all available models and groups
* [API manual](/en/api-manual) — general usage conventions

<Info>
  **Wrap-up**: The Qwen3.6 series covers the full demand curve from heavy coding agents to high-volume multimodal dispatch. Max-Preview pushes domestic coding to a new high; Flash collapses the unit price of multimodal long-context workloads; Plus is the dependable balanced workhorse; the open-weight 27B and 35B-A3B variants — hosted by APIYI's official relay — close the loop on "controllable open weights without renting GPUs." All five share an OpenAI Chat-compatible endpoint, list-price-matched with the official rate, and stack with recharge bonuses to roughly 85% of list — the best price/performance combo currently available in the Aliyun official-relay channel.
</Info>
