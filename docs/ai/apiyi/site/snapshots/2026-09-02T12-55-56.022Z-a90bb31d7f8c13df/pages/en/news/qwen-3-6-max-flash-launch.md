> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.6 Max-Preview & Flash Live on APIYI

> Alibaba Qwen3.6-Max-Preview and Qwen3.6-Flash are now live on APIYI via Aliyun's official relay. List prices match Alibaba's official rates; the Max flagship tops 6 coding benchmarks including SWE-bench Pro, while Flash brings 1M-token multimodal context. Recharge promo lands you ~15% off.

## Highlights

* **Aliyun official relay**: `qwen3.6-max-preview` and `qwen3.6-flash` are routed through Alibaba Cloud Bailian's official channel — same stability as direct API access
* **Max tops coding leaderboards**: Qwen3.6-Max-Preview claims #1 on six coding benchmarks (SWE-bench Pro, Terminal-Bench 2.0, SkillsBench, QwenClawBench, QwenWebBench, SciCode), AIME 2025 93%, GPQA 86%, LiveCodeBench 79%
* **Flash with 1M multimodal context**: Qwen3.6-Flash is a 35B-A3B MoE supporting text / image / video input, native 256K context expandable to 1M tokens
* **List price matches official**: Max at \$1.28 in / \$7.68 out, Flash at \$0.17 in / \$1.02 out per 1M tokens
* **Recharge promo \~15% off**: List price equals the official rate; APIYI's recharge bonus brings the effective price down to roughly 85% of list
* **Billing**: Pay-as-you-go - Chat, no resource pack required

<Info>
  Routing is via **Alibaba Cloud Bailian's official relay**. Models are based on the Qwen3.6 family released in April 2026. Max-Preview is a preview build still under iteration; Flash is GA. Sources: Alibaba Cloud Bailian docs `help.aliyun.com/zh/model-studio/models`, Qwen team blog `qwen.ai/blog`. Data retrieval date: 2026-04-27.
</Info>

## Background

Qwen3.6 is the next-generation model family from Alibaba's Tongyi Qianwen team, released across four tiers: **Max** (flagship), **Plus** (balanced), **Flash** (speed-first), and **35B-A3B** (open-weight, local). Max-Preview debuted on Qwen Studio on 2026-04-20, and now ships alongside Flash through APIYI's Aliyun official-relay group.

Two practical wins for Chinese-context workloads: first, **Max-Preview pushes domestic Coding/Agent benchmarks to a new high**, posting 58.4 on SWE-bench Pro vs. previously-leading GLM-5.1's 56.6. Second, **Flash collapses the cost of high-frequency multimodal long-context workflows** — at \$0.17 per million input tokens, image / video + long-context pipelines finally have economics that scale.

## Deep dive

### Core features

<CardGroup cols={2}>
  <Card title="Max-Preview · coding flagship" icon="trophy">
    **A new ceiling for domestic coding models**

    \#1 on SWE-bench Pro, Terminal-Bench 2.0, SkillsBench, QwenClawBench, QwenWebBench, SciCode — built for Agents and repo-scale tasks.
  </Card>

  <Card title="Flash · speed-first multimodal" icon="bolt">
    **35B-A3B MoE / 1M context**

    Native text / image / video input, 256K base context expandable to 1M, \~1/8 the unit price of Max.
  </Card>

  <Card title="Aliyun official relay" icon="cloud">
    **Same stability as official**

    Routed through Alibaba Cloud Bailian's official channel; auth and rate-limit policies match the official portal, with low domestic latency.
  </Card>

  <Card title="Pay-as-you-go Chat" icon="credit-card">
    **No resource pack required**

    Chat endpoint, billed per call. Combined with APIYI's recharge bonus, the effective unit price lands around 85% of list.
  </Card>
</CardGroup>

### Performance highlights (Qwen3.6-Max-Preview)

Numbers below come from the Qwen team's official blog and third-party public benchmarks:

| Benchmark                      | Qwen3.6-Max-Preview | GLM-5.1 | Qwen3.6-Plus |
| ------------------------------ | ------------------- | ------- | ------------ |
| SWE-bench Pro (real-world SWE) | **58.4**            | 56.6    | —            |
| LiveCodeBench                  | **79%**             | —       | —            |
| AIME 2025 (math olympiad)      | **93%**             | —       | —            |
| GPQA (science reasoning)       | **86%**             | —       | —            |
| Terminal-Bench 2.0             | **#1**              | —       | —            |
| Coding benchmarks topped       | **6**               | —       | —            |

<Tip>
  Max-Preview is explicitly labeled Preview — the Qwen team has stated future revisions will keep gaining. For critical paths, run a small canary + A/B before flipping main traffic.
</Tip>

### Specs

<Card title="Model parameters" icon="sliders-horizontal">
  **Qwen3.6-Max-Preview**

  * Model ID: `qwen3.6-max-preview`
  * Architecture: dense large model (exact params undisclosed)
  * Context: 262K tokens
  * Input modalities: text
  * Billing: pay-as-you-go - Chat
  * Channel: Aliyun official relay

  **Qwen3.6-Flash**

  * Model ID: `qwen3.6-flash`
  * Architecture: MoE, 35B total / 3B active (35B-A3B)
  * Context: 256K base, expandable to 1M tokens
  * Input modalities: text / image / video
  * Billing: pay-as-you-go - Chat (tiered above 256K)
  * Channel: Aliyun official relay
</Card>

<Warning>
  Qwen3.6-Flash uses tiered pricing on Alibaba Cloud — the total input-token count of a single request determines the unit-price tier for that request. APIYI's listed price corresponds to the base tier; for super-long requests above 256K, watch the actual billed receipt.
</Warning>

## Use cases

### Recommended scenarios

<CardGroup cols={2}>
  <Card title="Coding Agent driver" icon="code">
    Use `qwen3.6-max-preview` as the primary model in Cursor / Claude Code / similar Agent workflows — SWE-bench Pro performance is on par with GPT-5 / Claude Opus flagships.
  </Card>

  <Card title="High-volume multimodal" icon="images">
    Run image / video understanding, long-document summarization, and bulk translation on `qwen3.6-flash`. \$0.17 / \$1.02 per 1M tokens makes "scale-out" workflows finally pencil out.
  </Card>

  <Card title="Long-context retrieval" icon="search">
    Flash's 256K → 1M expandable window suits "post-RAG full-document synthesis" pipelines, avoiding semantic breaks from chunking.
  </Card>

  <Card title="Domestic compliance first" icon="shield-check">
    The Aliyun relay channel is friendly to China-domestic compliance and data-residency-sensitive scenarios — a strong domestic alternative to GPT / Claude.
  </Card>
</CardGroup>

### Code example

```python theme={null}
import openai

client = openai.OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# Coding flagship: run an Agent task on Max-Preview
resp = client.chat.completions.create(
    model="qwen3.6-max-preview",
    messages=[
        {"role": "system", "content": "You are a senior Python engineer. Return changes as a unified diff."},
        {"role": "user", "content": "Add type hints and fix any latent bugs in this snippet ..."}
    ]
)
print(resp.choices[0].message.content)

# Speed-first multimodal: run image + text on Flash
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
```

### Best practices

* **Task routing**: default to Flash for general dialog and classification; only escalate to Max-Preview for coding / complex reasoning / Agent orchestration. You hold quality and minimize cost.
* **Preview canary**: Max-Preview is still iterating. For critical paths, run a canary with A/B comparison before flipping main traffic.
* **Multimodal batching**: Flash supports a 1M context, but extreme single-call lengths trigger tiered pricing. Slice ultra-long video first, then feed in chunks within 256K to control per-call cost.

## Pricing & availability

### Listed prices

| Model                 | Billing              | Input              | Output             |
| --------------------- | -------------------- | ------------------ | ------------------ |
| `qwen3.6-max-preview` | Pay-as-you-go - Chat | \$1.28 / 1M tokens | \$7.68 / 1M tokens |
| `qwen3.6-flash`       | Pay-as-you-go - Chat | \$0.17 / 1M tokens | \$1.02 / 1M tokens |

<Info>
  Listed prices match Alibaba Cloud's official rates. APIYI's current recharge bonus brings the effective unit price to roughly **85% of list**.
</Info>

### Stack with APIYI's recharge promo

Recharge promotion details: [/en/faq/recharge-promotions](/en/faq/recharge-promotions)

Effective unit prices after the recharge bonus (\~15% off):

| Model                 | Effective input | Effective output |
| --------------------- | --------------- | ---------------- |
| `qwen3.6-max-preview` | ≈ \$1.088 / 1M  | ≈ \$6.528 / 1M   |
| `qwen3.6-flash`       | ≈ \$0.1445 / 1M | ≈ \$0.867 / 1M   |

## Wrap-up

Qwen3.6-Max-Preview and Qwen3.6-Flash are the latest reinforcements to APIYI's Aliyun official-relay group: **Max raises the bar for domestic coding/reasoning, Flash crushes the unit price of multimodal long-context workloads**. Together they cover the full demand curve from heavy Agent workflows down to high-frequency dispatch.

<Tip>
  Recommended strategy: **Flash by default + Max-Preview on escalation**. Route routine dialog and multimodal batches to Flash; escalate to Max-Preview for coding, Agent, and complex reasoning. Stack with the recharge bonus for a roughly 85%-of-list effective rate — the best price/performance combo currently available in the Aliyun official-relay channel.
</Tip>

<Info>
  Sources: Alibaba Cloud Bailian docs (`help.aliyun.com/zh/model-studio/models`), Qwen team blog (`qwen.ai/blog`), and Qwen3.6-Max-Preview evaluation report. Max-Preview release date: 2026-04-20. Article data retrieval date: 2026-04-27 (UTC+8).
</Info>
