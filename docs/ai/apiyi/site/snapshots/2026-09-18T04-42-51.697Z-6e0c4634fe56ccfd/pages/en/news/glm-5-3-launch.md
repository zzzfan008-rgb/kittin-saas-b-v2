> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GLM-5.3 and GLM-5.3-Flash Launch: Zhipu's Coding Flagship and Multimodal Lite

> Zhipu Z.AI's August releases GLM-5.3 (flagship) and GLM-5.3-Flash (lite) are both live on APIYI. The flagship gains 50% over 5.2 on Z.ai Code Bench; Flash is natively multimodal and scores 84.3 on Terminal-Bench 2.1, within reach of Claude Opus 4.8. Priced item for item with Zhipu's official rates: GLM-5.3 at $1.40 in / $4.396 out, Flash at $0.15 in / $0.50 out per million tokens, with recharge bonuses bringing the effective cost to roughly 83%–91% of list.

## Key Takeaways

* **Two models at once**: `glm-5.3` (coding flagship) and `glm-5.3-flash` (multimodal lite) are open for calls on APIYI in both the `default` and `svip` groups
* **The flagship only scaled post-training**: GLM-5.3 keeps 5.2's 753B MoE base — Zhipu's own summary is "Scaling post-training is all we did" — and gains 50% over 5.2 on Z.ai Code Bench
* **A leap in cyber capability**: 84.5% on CyberGym and 54.4% on ExploitBench, the latter more than doubling 5.2's 24.4%
* **Flash is the first natively multimodal GLM-5**: 320B-A18B with hybrid sparse + linear attention, takes text, images, video and files, and scores 84.3 on Terminal-Bench 2.1 — just 0.7 behind Claude Opus 4.8's 85.0
* **Priced item for item with Zhipu's official rates**: GLM-5.3 at \$1.40 in / \$4.396 out / \$0.259 cached reads, Flash at \$0.15 in / \$0.50 out / \$0.03 cached reads per million tokens; stack recharge bonuses and the effective cost lands at roughly 83%–91% of list

## Background

On 14 August 2026, Zhipu Z.AI released **GLM-5.3** under the banner "Built to Code. Ready for Cyber Defense." There is no new base model: it is still GLM-5.2's 753-billion-parameter MoE with dynamic sparse attention and roughly 40B active parameters, and every gain comes from scaling post-training. On Zhipu's in-house Z.ai Code Bench it improves 50% over 5.2. Reasoning is now always on, with only three effort levels — `low`, `high` and `max` — and no way to disable thinking.

On 26 August, Zhipu followed with **GLM-5.3-Flash**, the first natively multimodal model in the GLM-5 series. It pairs 320B total parameters with 18B active in a hybrid sparse + linear attention architecture, built to "deliver more intelligence with less compute": on coding and agent benchmarks it matches or beats the 5.2 flagship at roughly one-tenth the cost. The weights are on Hugging Face under the MIT license (`zai-org/GLM-5.3-Flash`).

Both models are now live on APIYI in OpenAI-compatible mode. Before launch we ran streaming tests on `glm-5.3-flash` with prompts around 160K tokens: time to first byte was 3–5 seconds and each call cost about \$0.005, confirming the long-context path works end to end.

## Deep Dive

### Core Features

<CardGroup cols={2}>
  <Card title="GLM-5.3: Coding and Agent Flagship" icon="code">
    28.3 on Terminal Bench 3.0, 66.9 on DeepSWE v1.1, 28.5 on Agents' Last Exam (level with Claude Fable 5's 28.6), and 45 on the Artificial Analysis Intelligence Index — the top open-weight score
  </Card>

  <Card title="GLM-5.3: Cyber Defense" icon="shield">
    84.5% on CyberGym and 54.4% on ExploitBench; Zhipu used it to surface 2,436 vulnerabilities across 269 real open-source projects, 1,097 of them medium-to-high severity
  </Card>

  <Card title="Flash: Natively Multimodal" icon="image">
    Text, images, video and files all work as input, with visual understanding wired straight into the coding workflow — a first for the GLM-5 series
  </Card>

  <Card title="Flash: Flagship-Class at a Tenth of the Cost" icon="zap">
    84.3 on Terminal-Bench 2.1, 63.4 on DeepSWE v1.1, 48.8 on AutomationBench — ahead of the 5.2 flagship across the board, at one-ninth of GLM-5.3's output price
  </Card>
</CardGroup>

### Performance Highlights

| Benchmark                                  | GLM-5.3   | GLM-5.3-Flash | Reference             |
| ------------------------------------------ | --------- | ------------- | --------------------- |
| **Z.ai Code Bench (max)**                  | 34.5      | 29.0          | Claude Opus 4.8: 29.5 |
| **Terminal Bench 3.0**                     | **28.3**  | —             | GPT-5.6 Sol: 34.6     |
| **Terminal-Bench 2.1**                     | —         | **84.3**      | Claude Opus 4.8: 85.0 |
| **DeepSWE v1.1**                           | **66.9**  | 63.4          | GLM-5.2: 46.2         |
| **AutomationBench**                        | 48.2      | 48.8          | GLM-5.2: 26.2         |
| **Agents' Last Exam (CLI)**                | 28.5      | —             | Claude Fable 5: 28.6  |
| **CyberGym**                               | **84.5%** | —             | GLM-5.2: 77.2%        |
| **ExploitBench**                           | **54.4%** | —             | GLM-5.2: 24.4%        |
| **Artificial Analysis Intelligence Index** | 45        | 42            | #1 / #4 open-weight   |

<Info>
  Sources: Zhipu Z.AI official docs (`docs.z.ai`), Hugging Face model cards (`huggingface.co/zai-org`), Artificial Analysis (`artificialanalysis.ai`). GLM-5.3 was released on 14 August 2026 and GLM-5.3-Flash on 26 August 2026; data retrieved 8 September 2026. Benchmarks use different methodologies — compare within a row only.
</Info>

### Specifications

| Spec                                 | GLM-5.3                           | GLM-5.3-Flash                          |
| ------------------------------------ | --------------------------------- | -------------------------------------- |
| **Architecture**                     | MoE + dynamic sparse attention    | MoE + hybrid sparse / linear attention |
| **Total / active parameters**        | 753B / \~40B                      | 320B / 18B                             |
| **Context window**                   | 1,000,000 tokens                  | 1,000,000 tokens                       |
| **Max output**                       | 128K tokens                       | 128K tokens                            |
| **Input modalities**                 | Text                              | Text, image, video, file               |
| **Thinking**                         | Always on, `low` / `high` / `max` | Always on, `low` / `high` / `max`      |
| **Tool calling / structured output** | Yes / Yes                         | Yes / Yes                              |
| **Open weights**                     | Released, Zhipu custom license    | Released, MIT license                  |
| **Model name**                       | `glm-5.3`                         | `glm-5.3-flash`                        |

<Warning>
  Thinking **cannot be turned off** on either model — even short Q\&A produces reasoning tokens first. For latency- or cost-sensitive workloads set `reasoning_effort` to `low`; the default is `max`, and a long task can emit tens of thousands of output tokens per call.
</Warning>

## Use Cases

### Recommended Scenarios

<CardGroup cols={2}>
  <Card title="Primary Coding Agent" icon="bot">
    GLM-5.3's behavior inside coding agents such as Claude Code and OpenCode is the headline upgrade of this generation; `high` effort is the best balance of quality and token spend on long tasks
  </Card>

  <Card title="Security Audits and Vulnerability Hunting" icon="shield-check">
    Large leads on CyberGym / ExploitBench over the previous generation make it a fit for automated code-security audits and dependency vulnerability sweeps
  </Card>

  <Card title="Screenshot- and Video-Driven Development" icon="video">
    Flash reads images and video natively — feed it UI screenshots or screen recordings to reproduce interfaces or pin down bugs
  </Card>

  <Card title="High-Volume Long-Context Batches" icon="layers">
    Flash's 1M context at \$0.15 input means a 160K-token prompt costs about \$0.005 per call — ideal for log analysis, document extraction and other high-frequency work
  </Card>
</CardGroup>

### Code Examples

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# Flagship: long-horizon coding task
response = client.chat.completions.create(
    model="glm-5.3",
    reasoning_effort="high",
    messages=[
        {"role": "system", "content": "You are a senior software engineer skilled at repo-level refactoring and security audits."},
        {"role": "user", "content": "Audit this repository's auth module, list exploitable vulnerabilities, and provide fix patches."}
    ],
    max_tokens=32768
)
print(response.choices[0].message.content)
```

```python theme={null}
# Lite: multimodal input (image + text)
response = client.chat.completions.create(
    model="glm-5.3-flash",
    reasoning_effort="low",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Generate the matching React component from this mockup."},
            {"type": "image_url", "image_url": {"url": "https://example.com/mockup.png"}}
        ]
    }],
    max_tokens=8192
)
print(response.choices[0].message.content)
```

```javascript theme={null}
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "your-api-key",
  baseURL: "https://api.apiyi.com/v1",
});

const response = await client.chat.completions.create({
  model: "glm-5.3-flash",
  reasoning_effort: "low",
  messages: [
    { role: "user", content: "Analyze these 700k server log lines and find the root cause." }
  ],
  max_tokens: 16384,
  stream: true,
});

for await (const chunk of response) {
  process.stdout.write(chunk.choices[0]?.delta?.content ?? "");
}
```

### Best Practices

* **Tier by task**: interactive Q\&A and bulk extraction go to `glm-5.3-flash` + `low`; repo-level refactors and security audits go to `glm-5.3` + `high`, reserving `max` for tasks that genuinely need the ceiling
* **Stream long tasks**: with thinking always on, the first byte of a long task arrives several seconds in, and streaming makes that far more tolerable; set timeouts to 600+ seconds
* **Lean on cached reads**: both models support context caching, and cached reads cost about a fifth of the input price — multi-turn chats and shared long system prompts benefit the most
* **Check the flagship's license separately**: GLM-5.3's weights are open but under a Zhipu custom license rather than MIT, so review the terms before commercial self-hosting; Flash is MIT and safe to self-host

## Pricing & Availability

### Pricing

APIYI's pricing matches Zhipu's official rates item for item, with no markup:

| Item             | GLM-5.3                  | GLM-5.3-Flash           |
| ---------------- | ------------------------ | ----------------------- |
| **Input**        | \$1.40 / million tokens  | \$0.15 / million tokens |
| **Output**       | \$4.396 / million tokens | \$0.50 / million tokens |
| **Cached reads** | \$0.259 / million tokens | \$0.03 / million tokens |

<Info>
  Billing type: pay-as-you-go (Chat). Both the `default` and `svip` groups are open, via the OpenAI-compatible `chat/completions` endpoint. Zhipu's own site is running a limited-time 50% promotion on GLM-5.3-Flash until 24:00 on 9 September 2026 (UTC+8); APIYI launched at the standard list price.
</Info>

### Stack Recharge Bonuses

The rates above are before discounts. Stacking a recharge bonus brings the **effective cost to roughly 83%–91% of list** — the more you recharge, the bigger the bonus. See [Recharge Promotions](/en/faq/recharge-promotions) for details.

## Summary & Recommendations

GLM-5.3 pushes post-training scale to a new level with real gains on both the coding and cyber-defense fronts, making it one of the strongest open-weight foundations for coding agents available today. GLM-5.3-Flash matches the flagship at a tenth of the cost and adds multimodality on top, a high-value pick for frequent long-context work. Both are priced at official rates on APIYI, and recharge bonuses lower the cost further.

**Recommended for**:

* Developers running Claude Code, OpenCode and similar coding agents who want a cost-effective open-weight alternative
* Security teams automating code audits and vulnerability discovery
* Multimodal development that needs image and video input, and teams processing logs or documents in bulk
* Enterprises that need on-prem deployment: Flash ships under MIT, and the flagship's license should be reviewed first

<Info>
  Sources: Zhipu Z.AI official docs (`docs.z.ai`), Hugging Face model cards (`huggingface.co/zai-org/GLM-5.3`, `huggingface.co/zai-org/GLM-5.3-Flash`), Artificial Analysis (`artificialanalysis.ai`). Data retrieved 8 September 2026.
</Info>
