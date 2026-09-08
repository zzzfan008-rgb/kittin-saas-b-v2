> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Sonnet 5 Is Live: Near Opus 4.8, Priced Same as Official

> Anthropic launched Claude Sonnet 5 on June 30, 2026, hitting 85.2% on SWE-bench Verified — close to Opus 4.8. APIYI now offers claude-sonnet-5 at the exact official price, on high-cache-hit pure AWS Claude official relay resources.

## Key Takeaways

* **Strongest Sonnet yet**: Anthropic released Claude Sonnet 5 on June 30, calling it "the most agentic Sonnet model yet," with performance close to flagship Opus 4.8
* **Big coding leap**: 85.2% on SWE-bench Verified, roughly +5.6pp over Sonnet 4.6's 79.6%; 80.4% on Terminal-Bench 2.1
* **Priced same as official**: APIYI now offers `claude-sonnet-5` at exactly Anthropic's official price (intro \$2/\$10, then \$3/\$15 per million tokens after Aug 31)
* **Pure relay + high cache hit**: Runs on pure AWS Bedrock Claude official-relay resources with a high cache-hit rate, keeping long agent chains cost-controlled
* **A workhorse agent model**: Plans, uses tools like browsers and terminals, and runs autonomously for long stretches — a high-value pick for agents

## Background

On June 30, 2026, Anthropic released Claude Sonnet 5. As the successor to Sonnet 4.6, it's positioned as "the most agentic Sonnet model yet" — able to make plans, use tools like browsers and terminals, and run autonomously for extended periods at a level that "just a few months ago required larger and more expensive models."

The Sonnet line has always been the "high-value daily workhorse," and this time Sonnet 5 pushes capability close to flagship Opus 4.8 while holding Sonnet-tier pricing. For the large share of real workloads dominated by agents, coding, and knowledge work, that means near-flagship results at a lower cost.

APIYI has brought `claude-sonnet-5` online immediately at the exact official price, on high-cache-hit pure AWS Claude official-relay resources — ideal to switch in as your daily and agent workhorse.

## Deep Dive

### Core Features

<CardGroup cols={2}>
  <Card title="Most agentic yet" icon="bot">
    Plans tasks, calls browser/terminal tools, and runs autonomously — driving long chains to done
  </Card>

  <Card title="Close to Opus 4.8" icon="gauge">
    Performance approaches flagship Opus 4.8 across many evals, at Sonnet-tier pricing
  </Card>

  <Card title="Coding jump" icon="code">
    85.2% SWE-bench Verified, 80.4% Terminal-Bench 2.1 — a big step over Sonnet 4.6
  </Card>

  <Card title="Pure relay, high cache" icon="server">
    APIYI runs pure AWS Bedrock Claude official relay with high cache-hit for lower cost
  </Card>
</CardGroup>

### Performance Highlights

| Benchmark              | Claude Sonnet 5 | Claude Sonnet 4.6 | Gain       |
| ---------------------- | --------------- | ----------------- | ---------- |
| **SWE-bench Verified** | **85.2%**       | 79.6%             | **+5.6pp** |
| **Terminal-Bench 2.1** | **80.4%**       | —                 | New high   |
| **SWE-bench Pro**      | **63.2%**       | —                 | —          |

<Info>
  Sources: Anthropic's official announcement (June 30, 2026); benchmark figures cited from multiple independent evaluations and reports. Numbers vary slightly across sources — test against your own scenarios when choosing. Data retrieved: July 1, 2026.
</Info>

**Coding & tool use**:

* SWE-bench Verified rises from Sonnet 4.6's 79.6% to 85.2%, more reliable on real repo-level fixes.
* 80.4% on Terminal-Bench 2.1 — strong for CLI/terminal agents, repo maintenance, and migration tools.

**Agentic & autonomy**:

* Better at driving long chains to completion instead of stalling to ask for permission.
* Early users report it's "almost as good as Opus 4.8, but faster and cheaper."

### Technical Specs

| Parameter       | Spec                                                    |
| --------------- | ------------------------------------------------------- |
| **Model ID**    | `claude-sonnet-5`                                       |
| **Upstream**    | Pure AWS Bedrock Claude official relay                  |
| **Cache**       | High cache-hit supported, cutting repeated-context cost |
| **API formats** | OpenAI-compatible / Anthropic-native                    |
| **Channels**    | Anthropic API, AWS Bedrock, Google Vertex AI, APIYI     |

## Real-World Use

### Recommended Scenarios

1. **Daily workhorse coding**: repo-level fixes, refactors, bug hunting at Sonnet pricing with near-flagship results
2. **Long agent chains**: browser/terminal tool use, autonomous research and coding agents
3. **CLI / repo-maintenance automation**: strong Terminal-Bench results suit migration tools and batch scripts
4. **Cost-sensitive high-concurrency calls**: high cache-hit + Sonnet pricing for scaled deployments
5. **Knowledge work**: broad gains in reasoning, tool use, and writing

### Code Examples

#### OpenAI format

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="claude-sonnet-5",
    messages=[
        {"role": "user", "content": "Review this code and flag potential bugs and improvements."}
    ]
)

print(response.choices[0].message.content)
```

#### Anthropic-native format

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com"
)

message = client.messages.create(
    model="claude-sonnet-5",
    max_tokens=8192,
    messages=[
        {"role": "user", "content": "Walk through the root cause of this production bug step by step and propose a fix."}
    ]
)

print(message.content[0].text)
```

#### In Claude Code

```json theme={null}
{
  "model": "claude-sonnet-5",
  "apiKey": "your-apiyi-key",
  "baseURL": "https://api.apiyi.com"
}
```

### Best Practices

1. **Daily workhorse**: swap `claude-sonnet-5` in for Sonnet 4.6 — better results, same price.
2. **Leverage caching**: put stable system prompts and code context up front to maximize cache-hit and cut cost.
3. **Let long tasks run**: allow longer autonomous runs in agent scenarios, reducing manual intervention.
4. **Escalate when needed**: switch to `claude-opus-4-8` for the most complex architecture-level decisions.

## Pricing & Availability

### Pricing

| Item       | Intro (through Aug 31) | After Aug 31          |
| ---------- | ---------------------- | --------------------- |
| **Input**  | \$2 / million tokens   | \$3 / million tokens  |
| **Output** | \$10 / million tokens  | \$15 / million tokens |

<Info>
  APIYI's `claude-sonnet-5` price matches Anthropic's official pricing exactly — no markup; upstream is pure AWS Bedrock Claude official relay with high cache-hit. The intro price is set by Anthropic and automatically switches to standard after Aug 31.
</Info>

**Same-line price comparison** (for reference):

| Model               | Input       | Output        | Positioning                         |
| ------------------- | ----------- | ------------- | ----------------------------------- |
| **Claude Sonnet 5** | **\$2→\$3** | **\$10→\$15** | High-value agent / coding workhorse |
| Claude Opus 4.8     | \$5         | \$25          | Strongest coding / flagship         |
| Claude Sonnet 4.6   | \$3         | \$15          | Previous daily workhorse            |

### Stack with Top-up Promotions

Combine with APIYI top-up bonus promotions to further lower real cost: `docs.apiyi.com/faq/recharge-promotions`.

### Where to Get It

**APIYI platform**:

* Site: `apiyi.com`
* OpenAI format: `https://api.apiyi.com/v1`
* Anthropic-native format: `https://api.apiyi.com`
* Model name: `claude-sonnet-5`

## Summary & Recommendation

Claude Sonnet 5 pushes the Sonnet line close to flagship Opus 4.8: 85.2% SWE-bench Verified, the most agentic Sonnet yet, and better at driving long chains to done — all at Sonnet-tier pricing. APIYI now offers `claude-sonnet-5` at the official price on high-cache-hit pure AWS Claude official-relay resources, an ideal swap for your daily and agent workhorse.

**Core strengths**:

* **Stronger**: 85.2% SWE-bench Verified, performance near Opus 4.8
* **Cheaper**: Sonnet-tier pricing + high cache-hit
* **Steadier**: pure AWS Bedrock official-relay resources
* **No markup**: identical to Anthropic's official pricing

<Info>
  Sources: Anthropic's official announcement (June 30, 2026) and multiple independent evaluations/reports. APIYI pricing follows live platform data. Data retrieved: July 1, 2026.
</Info>
