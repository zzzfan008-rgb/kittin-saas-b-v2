> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3 Pro Preview Launch: #1 on LMArena

> Google's latest multimodal AI model Gemini 3 Pro Preview is now live! Ranked #1 globally on LMArena with 1501 Elo, 76.2% on SWE-bench Verified, supports 1M context and chain-of-thought output. Available now on APIYI with up to 20% discount.

## Key Highlights

* **World's Best**: LMArena leaderboard 1501 Elo, ranked #1 globally
* **Top Coding**: 76.2% on SWE-bench Verified, industry-leading code generation
* **Massive Context**: 1 million token context window for large codebases
* **Chain-of-Thought**: Display complete reasoning process
* **Great Value**: Official pricing + up to 20% discount with recharge bonuses

## Background

On November 18, 2025, Google officially released Gemini 3 Pro Preview, their latest multimodal AI model. With a score of 1501 Elo on the LMArena leaderboard, it ranks #1 globally, surpassing GPT-5, Claude Opus 4.1, and all other competitors.

APIYI has integrated this model immediately, providing developers with stable, cost-effective API services.

## Key Features

### New Models

<CardGroup cols={2}>
  <Card title="gemini-3-pro-preview" icon="sparkles">
    **Auto Reasoning Model**

    Automatically adjusts reasoning intensity based on task complexity.
  </Card>

  <Card title="gemini-3-pro-preview-thinking" icon="brain">
    **Thinking Output Model**

    Displays complete reasoning process, ideal for advanced programming and mathematics.
  </Card>
</CardGroup>

### Performance Benchmarks

| Benchmark              | Score    | Rank             |
| ---------------------- | -------- | ---------------- |
| **LMArena**            | 1501 Elo | 🏆 #1 Global     |
| **SWE-bench Verified** | 76.2%    | 🥇 Top Tier      |
| **Terminal-Bench 2.0** | 54.2%    | 🥇 Leading       |
| **Multimodal**         | -        | 🏆 Best in Class |

### Core Capabilities

* **1M Token Context**: Handle massive codebases and documents
* **64K Token Output**: Generate extensive code and documentation
* **Multimodal**: Text, image, video, and audio understanding
* **Tool Integration**: Google Search, File Search, Code Execution, Function Calling

## Use Cases

<CardGroup cols={2}>
  <Card title="AI Programming" icon="code">
    * IDE integration
    * Code review
    * Autonomous development
    * Technical documentation
  </Card>

  <Card title="Complex Reasoning" icon="brain">
    * Mathematical proofs
    * Logic reasoning
    * Strategy planning
    * Data analysis
  </Card>

  <Card title="Multimodal Apps" icon="images">
    * Image understanding
    * Video analysis
    * OCR and parsing
    * Cross-modal generation
  </Card>

  <Card title="Agent Development" icon="bot">
    * Agentic workflows
    * Autonomous tasks
    * Tool integration
    * Context management
  </Card>
</CardGroup>

## Code Example

```python theme={null}
import openai

client = openai.OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# Basic chat
response = client.chat.completions.create(
    model="gemini-3-pro-preview",
    messages=[
        {"role": "user", "content": "Explain quantum entanglement"}
    ]
)
print(response.choices[0].message.content)

# Chain-of-thought mode
response = client.chat.completions.create(
    model="gemini-3-pro-preview-thinking",
    messages=[
        {"role": "user", "content": "Prove: 1+2+3+...+n = n(n+1)/2"}
    ]
)
print(response.choices[0].message.content)
```

## Pricing

| Item              | Price               | Notes                    |
| ----------------- | ------------------- | ------------------------ |
| **Input Tokens**  | \$2.00 / 1M tokens  | For prompts ≤200K tokens |
| **Output Tokens** | \$12.00 / 1M tokens | All output tokens        |
| **Cached Input**  | \$0.20 / 1M tokens  | If caching supported     |

<Info>
  **Special Offer**: With APIYI's recharge bonus program, enjoy up to **20% discount**! Input costs as low as \$1.6/1M tokens, output costs as low as \$9.6/1M tokens.
</Info>

## Getting Started

1. **Sign up**: [https://api.apiyi.com](https://api.apiyi.com)
2. **Add credits**: Enjoy recharge bonuses
3. **Check docs**: [Gemini API Guide](/en/api-capabilities/gemini/native)
4. **Start using**: Change `model` to `gemini-3-pro-preview`

***

<Info>
  **Sources**:

  * Google Official Blog: Gemini 3 Pro Preview Announcement `blog.google/technology/ai/google-gemini-3-pro-preview/`
  * LMArena Leaderboard: `lmarena.ai/leaderboard`
  * SWE-bench: `swebench.com`
  * Data retrieved: November 20, 2025
</Info>
