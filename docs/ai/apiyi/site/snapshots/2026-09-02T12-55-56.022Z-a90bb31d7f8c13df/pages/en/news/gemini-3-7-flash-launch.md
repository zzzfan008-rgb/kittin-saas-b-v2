> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.7 Flash Is Live: Big Coding and Agent Gains

> Google's gemini-3.7-flash, released August 13, 2026, is now available on APIYI — DeepSWE 65.3% and AutomationBench 30.4%, far ahead of 3.6 Flash, at Google's official $0.75/$3.75 pricing.

## Key Takeaways

* **The new Flash workhorse**: Google released `gemini-3.7-flash` on August 13, 2026, positioning it as its "most intelligent workhorse model" for coding and agents. It is now live on APIYI
* **Unusually large coding gains**: DeepSWE v1.1 goes from 48.6% → **65.3%**, FrontierCode 1.1 from 34.4% → **43.6%**, Terminal-bench 2.1 from 78.0% → **85.8%**
* **Business automation nearly doubles**: AutomationBench moves from 17.0% → **30.4%**, ahead of Claude Sonnet 5 (10.7%) and GPT-5.6 Terra (23.6%) in Google's own comparison
* **Same price as Google's official rate**: \$0.75 in / \$3.75 out per 1M tokens — this is Google's **limited-time promotional price, valid through December 31, 2026**; standard pricing of \$1.50 / \$7.50 resumes January 1, 2027
* **Specs unchanged**: 1M context / 64K output, multimodal input (text, image, audio, video), tunable thinking levels (low / medium / high)

## Background

Flash is the **mid-tier workhorse** of Google's Gemini family — Pro sits above it, Flash-Lite below for high-frequency lightweight work, and Flash covers the vast majority of production workloads where capability has to be good enough and the price has to survive real volume. This tier has shipped several versions in the past six months (3.5 → 3.6 → 3.7), making it the fastest-moving line in Gemini and our standing default recommendation.

3.7 Flash arrives roughly three weeks after 3.6 Flash. Google put the weight squarely on **coding and agents**: not just writing code, but producing deployable, production-ready code on the first try, and actually finishing long-horizon, multi-step automation tasks.

All figures here come from the official Google DeepMind model card and the Gemini API documentation, collected August 14, 2026.

## Deep Dive

### Official benchmarks (3.7 Flash vs 3.6 Flash)

| Benchmark                    | 3.7 Flash | 3.6 Flash | What it measures                    |
| ---------------------------- | --------- | --------- | ----------------------------------- |
| DeepSWE v1.1                 | **65.3%** | 48.6%     | Long-horizon software engineering   |
| FrontierCode 1.1             | **43.6%** | 34.4%     | Production code quality             |
| Terminal-bench 2.1           | **85.8%** | 78.0%     | Terminal-environment tasks          |
| Terminal-bench 3.0           | **14.9%** | 5.4%      | Harder terminal tasks               |
| Code Arena Web (Elo)         | **1588**  | 1538      | Web development                     |
| AutomationBench              | **30.4%** | 17.0%     | Real business workflow automation   |
| OSWorld-2.0                  | **47.9%** | 33.8%     | GUI operation                       |
| GDM-MRCR v2                  | **97.0%** | 91.8%     | Long-context retrieval (128k)       |
| GDP.pdf                      | **34.0%** | 22.0%     | PDF document comprehension          |
| HLE-Verified                 | **53.6%** | 51.2%     | Hard knowledge reasoning            |
| CharXiv Reasoning (no tools) | 84.5%     | 85.2%     | Chart reasoning — slight regression |

<Info>
  The only regression is CharXiv chart reasoning (84.5% vs 85.2%; 88.7% vs 89.4% with tools), a gap within noise. If chart-heavy analysis is your primary workload, run your own A/B before switching.
</Info>

### Technical specs

| Item             | Value                                      |
| ---------------- | ------------------------------------------ |
| Model ID         | `gemini-3.7-flash`                         |
| Context window   | 1,000,000 tokens                           |
| Max output       | 64,000 tokens                              |
| Input modalities | Text / image / audio / video               |
| Output modality  | Text                                       |
| Knowledge cutoff | March 2026 (January 2025 for some domains) |
| Thinking levels  | low / medium (default) / high              |
| Release date     | August 13, 2026                            |

The thinking levels are straightforward: `low` cuts latency for time-sensitive paths, `medium` is the default and the quality/cost balance point for everyday work, and `high` is reserved for complex reasoning and hard coding tasks.

<Warning>
  Google states that 3.7 Flash carries **the same built-in tool suite** as 3.6 Flash (code execution, Google Search, Maps, etc.), with structured outputs and multimodal support unchanged. An item-by-item APIYI test report will follow; if you depend heavily on one specific tool, validate on low traffic first.
</Warning>

## In Practice

### Recommended use cases

* **Coding and code review**: the biggest gain in this release, especially where deployable code on the first pass matters
* **Agents / workflow automation**: AutomationBench nearly doubled — multi-step completion rate is the headline of this version
* **Long documents and long context**: GDM-MRCR v2 at 97.0% means near-lossless retrieval across the 1M window, with a clear jump in PDF comprehension
* **Everyday primary chat and batch jobs**: the mid-tier position, where capability meets unit price

### Code examples

<CodeGroup>
  ```python OpenAI-compatible theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  response = client.chat.completions.create(
      model="gemini-3.7-flash",
      messages=[
          {"role": "user", "content": "Write a Python HTTP client with retries and exponential backoff"}
      ]
  )
  print(response.choices[0].message.content)
  ```

  ```bash Native Gemini format theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.7-flash:generateContent" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [{"parts": [{"text": "Write a Python HTTP client with retries and exponential backoff"}]}]
    }'
  ```
</CodeGroup>

The native endpoint takes your APIYI token directly (`x-goog-api-key: sk-...`) — no Google API Key needed.

### Best practices

* **Migrating from 3.6 Flash**: change the model name, nothing else — the request shape is identical, and during the limited-time promotion the unit price is half
* **Cache repeated prefixes**: system prompts and long fixed documents read back at \$0.075 / 1M tokens, one tenth of the input price
* **Match thinking level to task**: `low` for batch classification and extraction, `high` for complex refactors and multi-step agents — don't set one level globally

## Pricing & Availability

| Billing item                        | Price (per 1M tokens) |
| ----------------------------------- | --------------------- |
| Input (prompt)                      | \$0.7500              |
| Output (completion, incl. thinking) | \$3.7500              |
| Cache read                          | \$0.0750              |
| Cache write (5m)                    | \$0.7500              |

**Identical to Google's official pricing.** Worth spelling out: \$0.75 / \$3.75 is Google's own **limited-time promotional rate**, officially valid through December 31, 2026, reverting to \$1.50 / \$7.50 on January 1, 2027 (the same price as 3.6 Flash). In other words, during the promotional period **3.7 Flash costs half of what 3.6 Flash costs while being stronger across the board** — the next few months are the best time to migrate.

### Stack the top-up promotions

APIYI always matches official pricing, and **discounts come from top-up bonuses**, which stack on top of the promotional rate above:

📖 [Top-up promotion details](/en/faq/recharge-promotions)

## Summary

The Flash tier has improved steadily across three consecutive versions, and 3.7 is the largest step yet — coding benchmarks up by 10+ points across the board, agents and business automation close to doubled, and a unit price that is currently half the previous generation.

The recommendation is simple: **make `gemini-3.7-flash` your default for Gemini text workloads.** The only things worth validating separately are chart-heavy analysis (CharXiv regressed slightly) and whichever built-in tool you depend on most.

<Info>
  Sources: Google DeepMind official model card `deepmind.google/models/model-cards/gemini-3-7-flash/` and the Gemini API documentation `ai.google.dev/gemini-api/docs/latest-model`. Released August 13, 2026; data collected August 14, 2026. Pricing follows the live APIYI model pricing page.
</Info>
