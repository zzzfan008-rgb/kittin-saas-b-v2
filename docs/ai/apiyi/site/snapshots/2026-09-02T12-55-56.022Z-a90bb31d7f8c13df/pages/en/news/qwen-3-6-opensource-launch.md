> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.6 Open-Weight Duo Live: APIYI-Hosted, No GPU Rental

> Qwen3.6 series adds two open-weight models — qwen3.6-27b and qwen3.6-35b-a3b — hosted on APIYI's official relay. 27B's coding rivals 397B-class models; 35B-A3B shares lineage with closed-source Flash. Pay-as-you-go Chat flat pricing (27b $0.42/$2.52, 35b-a3b $0.26/$1.56). Customers skip the GPU rental, deploy, and ops.

## Highlights

* **Qwen3.6 expands to 5 models**: in addition to closed-source Max-Preview / Flash / Plus, the series now includes `qwen3.6-27b` (27B dense) and `qwen3.6-35b-a3b` (35B MoE / 3B active) — both **open-weight** releases
* **Hosted on APIYI's official relay**: open-weight ≠ free to run. Weights are public on Hugging Face (`Qwen/Qwen3.6-27B`, `Qwen/Qwen3.6-35B-A3B`), but local inference still needs GPUs, VRAM, an inference framework, and ops. **APIYI's hosted relay handles all of that**
* **Skip GPU rental**: pay per token. Build with the API; later, decide whether to switch to self-hosting — a smooth path
* **Flat pricing — no tiers**: the open-weight tiers use single-rate pay-as-you-go Chat: `qwen3.6-27b` at \$0.42 in / \$2.52 out, `qwen3.6-35b-a3b` at \$0.26 in / \$1.56 out per 1M tokens
* **OpenAI-compatible**: shares the `/v1/chat/completions` endpoint with the closed-source tiers — only the `model` field differs. One SDK, five models
* **\~85% of list with the recharge bonus**: list price matches Alibaba Cloud's official rate; APIYI's recharge bonus brings effective price down to roughly 85% of list

<Info>
  Hosted from Qwen's open-weight checkpoints: `Qwen/Qwen3.6-27B` (Hugging Face) and `Qwen/Qwen3.6-35B-A3B` (Hugging Face). This launch is the **APIYI hosted relay** distribution — weights match the official release; calls follow OpenAI Chat Completions semantics. Source: Qwen team's Hugging Face model cards. Data retrieval: 2026-04-28 (UTC+8).
</Info>

## Background

Alongside the closed-source Qwen3.6 production tiers (Max / Plus / Flash), the Qwen team also released the 27B dense and 35B-A3B MoE checkpoints as open weights on Hugging Face — giving customers who need auditable weights, controllable licenses, or future self-hosting an off-ramp.

But "open-weight" doesn't mean "easy to run." A 27B dense model needs at least an A100 40G; vLLM / TensorRT-LLM for inference; monitoring; failover; an upgrade pipeline. The 35B-A3B activates only 3B params, but VRAM still scales with the 35B total. **For most customers, "we want to use open Qwen3.6" and "we can run an open Qwen3.6 cluster" sit on opposite sides of an SRE team.**

This launch closes that gap: **open weights + APIYI hosted relay = call the API directly, without owning the GPU**. Build the PoC on the API, quantify token cost, then decide later whether self-hosting makes sense.

## Deep dive

### Core features

<CardGroup cols={2}>
  <Card title="qwen3.6-27b · coding powerhouse" icon="box">
    **27B dense · open weights**

    Qwen team open weights (Hugging Face `Qwen/Qwen3.6-27B`); coding ability rivals 397B-class models, single-GPU friendly.
  </Card>

  <Card title="qwen3.6-35b-a3b · speed MoE" icon="boxes">
    **35B-A3B · open MoE**

    Qwen team open weights (Hugging Face `Qwen/Qwen3.6-35B-A3B`); same lineage as closed-source Flash, 3B active for extremely low compute cost.
  </Card>

  <Card title="APIYI hosted relay" icon="cloud-upload">
    **Weights public, compute on us**

    Just call the API — no GPU rental, deploy, monitoring, or version-upgrade pipeline. Billed per token, scales on demand.
  </Card>

  <Card title="Flat, no tiers" icon="dollar-sign">
    **Simple, predictable budget**

    Open-weight tiers bill at a single flat rate — no need to estimate P95 input tokens. Monthly cost is a straight linear function of token volume.
  </Card>
</CardGroup>

### Performance & positioning

| Dimension                  | qwen3.6-27b                                                   | qwen3.6-35b-a3b                                                   |
| -------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------- |
| Architecture               | 27B dense                                                     | MoE 35B total / 3B active                                         |
| License                    | Qwen team open-weight                                         | Qwen team open-weight                                             |
| Hugging Face repo          | `Qwen/Qwen3.6-27B`                                            | `Qwen/Qwen3.6-35B-A3B`                                            |
| Coding capability          | Rivals 397B-class (small-size coding leader)                  | Same lineage as closed-source Flash                               |
| Modalities                 | Text                                                          | Text                                                              |
| Recommended scenarios      | Cost-sensitive coding aid, compliance audit, local-deploy PoC | High-volume low-cost dialog, transition phase before self-hosting |
| Single-GPU self-host floor | A100 40G+                                                     | VRAM scales by 35B total params; compute by 3B active             |

<Tip>
  **Why a small-size coding model matters** — for IDE inline completion, PR review, code search, and other **low-latency / high-frequency** workflows, 27B beats the closed-source flagship: faster responses, lower cost, and code understanding that approaches the larger models.
</Tip>

### Specs

<Card title="Open-weight integration parameters" icon="sliders-horizontal">
  * **Model IDs**: `qwen3.6-27b` / `qwen3.6-35b-a3b`
  * **Endpoint**: `POST /v1/chat/completions` (OpenAI Chat Completions compatible)
  * **Input modalities**: Text
  * **Streaming**: ✅ Supported
  * **Function calling / tool use**: ✅ Supported
  * **Billing**: Pay-as-you-go - Chat (flat, **no tiers**)
  * **Channel**: APIYI hosted relay
  * **Context / max output**: matches the official weight cards on Hugging Face
</Card>

## Use cases

### Recommended scenarios

<CardGroup cols={2}>
  <Card title="Coding aid · low latency, high frequency" icon="code">
    Use `qwen3.6-27b` for IDE inline completion, PR Bots, commit summaries — 27B-scale latency is fast, unit price is far below the Max-Preview flagship.
  </Card>

  <Card title="High-concurrency dialog dispatch" icon="bolt">
    Use `qwen3.6-35b-a3b` for customer support, bulk translation, content moderation — 3B active means extremely low compute cost, just \$0.26/\$1.56 per 1M tokens.
  </Card>

  <Card title="Compliance audit · controllable weights" icon="shield-check">
    For customers who need auditable / filing-ready weights: pull the public Hugging Face checkpoints for internal compliance review while running production traffic on APIYI's hosted relay.
  </Card>

  <Card title="PoC before self-hosting" icon="flask-conical">
    Before evaluating whether open Qwen3.6 fits your stack, run the PoC on APIYI to validate quality and quantify token cost — then decide whether to stand up your own GPU cluster.
  </Card>
</CardGroup>

### Code example

```python theme={null}
import openai

client = openai.OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# 27B coding powerhouse: low-latency code completion
resp = client.chat.completions.create(
    model="qwen3.6-27b",
    messages=[
        {"role": "system", "content": "You are an inline code completion assistant. Return only the code diff, no commentary."},
        {"role": "user", "content": "Complete this function: def merge_intervals(intervals): ..."}
    ],
    stream=True
)
for chunk in resp:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)

# 35B-A3B speed MoE: high-concurrency dialog
resp = client.chat.completions.create(
    model="qwen3.6-35b-a3b",
    messages=[
        {"role": "user", "content": "Explain quantum entanglement in one sentence."}
    ]
)
print(resp.choices[0].message.content)
```

### Best practices

* **Try the small models first**: for cost-sensitive workloads, start with 27B / 35B-A3B. If quality holds, stop here. Only escalate to closed-source Plus / Max-Preview when needed — avoid paying flagship rates by default.
* **Predictable budgeting with flat pricing**: the open-weight tiers don't have tiers. Estimate monthly cost as a straight linear function: `input_tokens × input_rate + output_tokens × output_rate`. No need to model P95 token-count distribution.
* **Smooth path to self-hosting**: APIYI's hosted SDK and self-hosted vLLM both speak OpenAI-compatible. When the time comes, point `base_url` to your internal gateway — application code stays untouched.

## Pricing & availability

### Listed prices

| Model             | Billing                               | Input                | Output               |
| ----------------- | ------------------------------------- | -------------------- | -------------------- |
| `qwen3.6-27b`     | Pay-as-you-go - Chat (flat, no tiers) | \$0.4200 / 1M tokens | \$2.5200 / 1M tokens |
| `qwen3.6-35b-a3b` | Pay-as-you-go - Chat (flat, no tiers) | \$0.2600 / 1M tokens | \$1.5600 / 1M tokens |

<Info>
  **Flat vs. tiered**: closed-source Max-Preview / Flash / Plus use tiered pricing keyed on input-token count per request; open-weight 27b / 35b-a3b use a **single flat rate** — easier to budget. List prices match Alibaba Cloud's official rate; APIYI's recharge bonus brings the effective unit price to roughly **85% of list**.
</Info>

### Stack with APIYI's recharge promo

Recharge promotion details: [/en/faq/recharge-promotions](/en/faq/recharge-promotions)

Effective unit prices after the recharge bonus (\~15% off):

| Model             | Effective input | Effective output |
| ----------------- | --------------- | ---------------- |
| `qwen3.6-27b`     | ≈ \$0.357 / 1M  | ≈ \$2.142 / 1M   |
| `qwen3.6-35b-a3b` | ≈ \$0.221 / 1M  | ≈ \$1.326 / 1M   |

## Wrap-up

The Qwen3.6 open-weight duo stitches together two things that have historically been mutually exclusive: **controllable open weights** and **no GPU rental / no ops burden**.

* **27B dense** — coding powerhouse: low latency, high frequency, controlled cost; ideal for IDE-embedded scenarios
* **35B-A3B open MoE** — same lineage as closed-source Flash, 3B active means extreme speed; ideal for high-concurrency dispatch

<Tip>
  **Strategy**: start cost-sensitive workloads on the open-weight tiers (27b / 35b-a3b); validate quality on the API, then decide whether to upgrade to closed-source production. With the recharge bonus, the open 35B-A3B input lands around \$0.22 / 1M tokens — currently the cheapest open-source option on the Aliyun official-relay channel.
</Tip>

<Info>
  Sources: Qwen team Hugging Face model repositories (`Qwen/Qwen3.6-27B`, `Qwen/Qwen3.6-35B-A3B`). This launch is the APIYI hosted relay distribution; weights match the official release. Article data retrieval date: 2026-04-28 (UTC+8).
</Info>

## Related reading

* [Qwen3.6 text model series overview](/en/api-capabilities/qwen-3-6/overview) - All 5 models, pricing, and routing strategy
* [Qwen3.6 Max-Preview & Flash live](/en/news/qwen-3-6-max-flash-launch) - Closed-source production tier deep dive
* [Qwen3.6-Plus launch — Alibaba's strongest coding agent](/en/news/qwen-3-6-plus-launch) - Plus deep dive
