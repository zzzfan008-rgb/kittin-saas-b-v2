> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.6 Flash Twins Launch: Flagship and Lite Together

> Google's Gemini 3.6 Flash and 3.5 Flash-Lite are live on APIYI: 30+ test cases per model across native and OpenAI-compatible endpoints, native tools fully working, at official pricing — $1.50/$7.50 and $0.30/$2.50.

## Key Takeaways

* **Two models at once**: Google's July 2026 `gemini-3.6-flash` (multimodal flagship Flash) and `gemini-3.5-flash-lite` (high-frequency lightweight) are live on APIYI in the `default` / `svip` groups
* **Fully tested on both endpoints**: 30+ cases per model across the native Gemini format and the OpenAI-compatible format — Search grounding, Maps grounding, URL context, code execution, and Computer Use (3.6) all verified working, not just "listed"
* **Official pricing**: 3.6 Flash at \$1.50 in / \$7.50 out, 3.5 Flash-Lite at \$0.30 in / \$2.50 out (per 1M tokens, output includes thinking); discounts come from top-up bonuses (up to 20%, ≈17% off)
* **Opposite thinking defaults**: 3.6 thinks by default (four controllable tiers, 0–837 tokens measured); Lite ships with zero thinking and \~2s responses — this one line decides which to pick
* **Same 1M context**: both offer 1,048,576 input / 65,536 output with text/image/video/audio/PDF input

## Background

Gemini 3.6 Flash and Gemini 3.5 Flash-Lite are Google's two stable text models updated in July 2026: the former takes over the Flash mainline and brings native tools including Computer Use (Preview) to the Flash tier; the latter continues the Flash-Lite "fast and cheap" line, with audio input priced the same as text.

Before launch, APIYI completed a **full dual-endpoint test pass** (26 main cases + 5 follow-ups per model) covering every testable item in the official Capabilities table. All numbers in this article come from our July 22, 2026 test records.

## Deep Dive

### Verified capability matrix

| Capability                           | 3.6 Flash                                                               | 3.5 Flash-Lite                                       |
| ------------------------------------ | ----------------------------------------------------------------------- | ---------------------------------------------------- |
| Chat / streaming (both endpoints)    | ✅                                                                       | ✅                                                    |
| Image / PDF / audio understanding    | ✅ all verified                                                          | ✅ all verified                                       |
| Thinking                             | ✅ ON by default, minimal/low/medium/high measured 0/403/487/837 tokens  | ✅ OFF by default, `high` tier triggers \~1000 tokens |
| Function calling / structured output | ✅ / ✅                                                                   | ✅ / ✅                                                |
| Google Search grounding              | ✅ native endpoint                                                       | ✅ native endpoint                                    |
| Maps grounding / URL context         | ✅ / ✅                                                                   | ✅ / ✅                                                |
| Code execution                       | ✅ verified actually executing (result fields not yet echoed — see docs) | ✅ same                                               |
| Computer Use (Preview)               | ✅ returns action calls                                                  | — not supported officially                           |
| Implicit caching                     | ⚠️ probabilistic hits                                                   | ⚠️ no hits observed                                  |

Advanced tools (Search/Maps/URL/code execution/Computer Use) are **native-format exclusive**; the OpenAI-compatible endpoint covers the standard set — chat, streaming, function calling, JSON Schema, vision. The native endpoint takes your APIYI token directly (`x-goog-api-key: sk-...`), no Google API Key needed.

### Which one to pick?

* **3.6 Flash**: deep reasoning, complex planning, heavy native-tool use, Computer Use
* **3.5 Flash-Lite**: throughput-first workloads — high-frequency Q\&A, classification, extraction, translation, support bots (about twice as fast, down to a fifth of the cost)

## In Practice

<CodeGroup>
  ```bash Native format (3.6 Flash + Search grounding) theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.6-flash:generateContent" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [{"parts": [{"text": "What was the most important AI release in July 2026?"}]}],
      "tools": [{"google_search": {}}]
    }'
  ```

  ```python OpenAI-compatible (Lite fast classification) theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  response = client.chat.completions.create(
      model="gemini-3.5-flash-lite",
      messages=[{"role": "user", "content":
                 "Classify this review as positive/negative/neutral: fast shipping, mediocre packaging"}]
  )
  print(response.choices[0].message.content)
  ```
</CodeGroup>

## Pricing & Availability

| Model                   | Input              | Output (incl. thinking) |
| ----------------------- | ------------------ | ----------------------- |
| `gemini-3.6-flash`      | \$1.50 / 1M tokens | \$7.50 / 1M tokens      |
| `gemini-3.5-flash-lite` | \$0.30 / 1M tokens | \$2.50 / 1M tokens      |

Identical to Google's official pricing; top-up bonuses go up to 20% (+10% on \$100), roughly **17% off** overall. Google Search grounding bills at \$14 / 1K queries.

## Summary

These two models complete APIYI's latest Gemini text lineup: 3.6 Flash is the "full tool suite + controllable thinking" workhorse, while Lite is currently the best-value high-frequency engine in the Gemini family. Zero-friction onboarding — point the official google-genai SDK or the OpenAI SDK at our base\_url and go.

📖 Full test data and integration guides: [Gemini 3.6 Flash Overview](/en/api-capabilities/gemini-3-6-flash/overview) | [Gemini 3.5 Flash-Lite Overview](/en/api-capabilities/gemini-3-5-flash-lite/overview)
