> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.5 Flash-Lite Text Generation

> Google's Gemini 3.5 Flash-Lite budget multimodal model: 1M context, no thinking by default, very fast. APIYI offers native Gemini and OpenAI-compatible endpoints at official pricing — $0.30 input / $2.50 output per 1M tokens.

Gemini 3.5 Flash-Lite (`gemini-3.5-flash-lite`) is Google's lightweight multimodal model updated in July 2026 (stable release), built for high-frequency, low-latency, low-cost workloads. It accepts text/image/video/audio/PDF input with a 1M context window and 64K output. APIYI has completed a **full dual-endpoint test pass** (25+5 cases): both the native Gemini format and the OpenAI-compatible format work out of the box, and native tools — Search grounding, URL context — are verified working.

<Info>
  **Available on APIYI now**: model name `gemini-3.5-flash-lite`, in the `default` / `svip` groups. Unlike 3.6 Flash — **no thinking output by default**, simple requests return in about 2 seconds in our tests; pass `thinkingLevel: "high"` to enable deep reasoning explicitly.
</Info>

## Highlights

<CardGroup cols={2}>
  <Card title="Best-in-class value" icon="circle-dollar-sign">
    \$0.30 input / \$2.50 output per 1M tokens (audio input at the same rate) — a fifth to a third of 3.6 Flash. Built for high-frequency and batch workloads.
  </Card>

  <Card title="Zero thinking, minimal latency" icon="zap">
    No thinking tokens by default; simple requests measured at \~2s (vs \~4.5s on 3.6 Flash). Ready out of the box for support bots, classification, and extraction.
  </Card>

  <Card title="Full multimodal understanding" icon="eye">
    Image, PDF, and audio verified accurate (video shares the same pipeline), with the same 1M context as the flagship.
  </Card>

  <Card title="Native tools available" icon="wrench">
    Google Search grounding, Maps grounding, URL context, and code execution verified working on the native endpoint — no Google API Key required.
  </Card>
</CardGroup>

## Model details

| Property             | Value                                                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Model name**       | `gemini-3.5-flash-lite` (stable, no redirect aliases)                                                                 |
| **Input modalities** | Text, image, video, audio, PDF                                                                                        |
| **Context window**   | 1,048,576 input / 65,536 output                                                                                       |
| **Groups**           | `default`, `svip`                                                                                                     |
| **Endpoints**        | `POST /v1beta/models/gemini-3.5-flash-lite:generateContent` (native), `POST /v1/chat/completions` (OpenAI-compatible) |
| **Thinking**         | **OFF by default**; enable with `thinkingLevel: "high"`                                                               |
| **Streaming**        | ✅ both endpoints                                                                                                      |

## Verified capability matrix

APIYI test results from July 22, 2026 (official claims vs. measured behavior):

| Capability                                     | Official                   | Gemini native                                                                                        | OpenAI-compatible                                                 |
| ---------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Chat (non-stream / stream)                     | ✅                          | ✅ / ✅                                                                                                | ✅ / ✅                                                             |
| System instructions                            | ✅                          | ✅                                                                                                    | ✅                                                                 |
| Thinking                                       | ✅                          | ✅ `thinkingLevel: "high"` triggers (\~1000 tokens), `includeThoughts` works                          | ⚠️ `reasoning_effort` accepted but reasoning\_tokens not reported |
| Image / PDF / audio understanding              | ✅                          | ✅ all verified                                                                                       | ✅ image (data URL) verified                                       |
| Function calling                               | ✅                          | ✅                                                                                                    | ✅                                                                 |
| Structured output                              | ✅                          | ✅ responseSchema                                                                                     | ✅ json\_schema                                                    |
| Google Search grounding                        | ✅                          | ✅ full groundingMetadata                                                                             | — native only                                                     |
| Maps grounding / URL context                   | ✅                          | ✅ / ✅                                                                                                | — native only                                                     |
| Code execution                                 | ✅                          | ⚠️ verified actually executing with correct results, but `executableCode` fields are not echoed back | — native only                                                     |
| Computer Use                                   | ❌ not supported officially | —                                                                                                    | —                                                                 |
| Implicit caching                               | ✅                          | ⚠️ no hits observed in our tests — don't build cost models on it                                     | same                                                              |
| Explicit cache API / countTokens / File search | partial                    | ❌ not yet enabled on the platform                                                                    | —                                                                 |
| Batch / Live API / audio gen / image gen       | ❌ or N/A for a gateway     | —                                                                                                    | —                                                                 |

## Pricing

| Item                           | APIYI price (same as official)           |
| ------------------------------ | ---------------------------------------- |
| Input (text/image/video/audio) | \$0.30 / 1M tokens                       |
| Output (incl. thinking)        | \$2.50 / 1M tokens                       |
| Google Search grounding        | \$14 / 1K queries (billed per tool call) |

<Info>
  **Pricing note**: APIYI matches official pricing; the discount comes from top-up bonuses: +10% on \$100, up to +20% (≈17% off). See [top-up promotions](/en/faq/recharge-promotions).
</Info>

## Controlling thinking

**Opposite of 3.6 Flash — this model does not think by default**, which is exactly why it's fast and cheap. Measured:

| Config                                 | Thinking tokens (measured) | Notes                                                         |
| -------------------------------------- | -------------------------- | ------------------------------------------------------------- |
| Default / `minimal` / `low` / `medium` | 0                          | No thinking triggered on simple prompts at any of these tiers |
| `thinkingLevel: "high"`                | \~1000                     | Reliably triggers deep thinking                               |

<Tip>
  Practical rule: **when you need thinking, go straight to `high`** — the middle tiers don't trigger it on simple prompts. Combine with `includeThoughts: true` to inspect thoughts. If your workload constantly needs deep reasoning, [Gemini 3.6 Flash](/en/api-capabilities/gemini-3-6-flash/overview) is the better fit.
</Tip>

## Quick start

### Native Gemini format (recommended — full tool support)

<CodeGroup>
  ```bash cURL (basic chat, zero thinking by default) theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.5-flash-lite:generateContent" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [{"parts": [{"text": "Translate to French: The weather is nice today"}]}]
    }'
  ```

  ```python Python (google-genai SDK, thinking on demand) theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.5-flash-lite",
      contents="Pipe A fills a pool in 8 hours, pipe B in 12. How long with both open?",
      config=types.GenerateContentConfig(
          thinking_config=types.ThinkingConfig(thinking_level="high")
      )
  )
  print(response.text)
  ```

  ```python Python (image understanding) theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.5-flash-lite",
      contents=[
          types.Part.from_bytes(data=open("photo.png", "rb").read(),
                                mime_type="image/png"),
          "Describe this image"
      ]
  )
  print(response.text)
  ```
</CodeGroup>

### OpenAI-compatible format (drop-in for existing code)

<CodeGroup>
  ```python Python (OpenAI SDK) theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="gemini-3.5-flash-lite",
      messages=[{"role": "user", "content":
                 "Classify this review as positive/negative/neutral: fast shipping, mediocre packaging"}]
  )
  print(response.choices[0].message.content)
  ```

  ```javascript Node.js (streaming) theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const stream = await client.chat.completions.create({
    model: 'gemini-3.5-flash-lite',
    messages: [{ role: 'user', content: 'Summarize how RAG works in three sentences' }],
    stream: true
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

## FAQ

<AccordionGroup>
  <Accordion title="When should I pick Flash-Lite over 3.6 Flash?">
    Pick Flash-Lite for throughput-first workloads — high-frequency Q\&A, classification, extraction, translation, support bots (about twice as fast, down to a fifth of the cost). Pick [3.6 Flash](/en/api-capabilities/gemini-3-6-flash/overview) for deep reasoning, complex planning, or Computer Use.
  </Accordion>

  <Accordion title="Do I need a Google API Key for the native endpoint?">
    No. Put your APIYI token (the `sk-` key) in the `x-goog-api-key` header. With the official google-genai SDK, just set `base_url` to `https://api.apiyi.com`.
  </Accordion>

  <Accordion title="How do I monitor thinking spend?">
    On the native endpoint, read `usageMetadata.thoughtsTokenCount`. Note the OpenAI-compatible endpoint does not report `reasoning_tokens` for this model — use the native endpoint for precise observation.
  </Accordion>

  <Accordion title="Does implicit caching hit?">
    We observed zero hits over three back-to-back requests with a 15.9K-token shared prefix (3.6 Flash hit once under the same conditions). Don't build cost models on cache hits. The explicit cache API is not yet enabled on the platform.
  </Accordion>
</AccordionGroup>

## Related

* [Native generateContent Playground](/en/api-capabilities/gemini-3-5-flash-lite/generate-content)
* [Chat Completions Playground](/en/api-capabilities/gemini-3-5-flash-lite/chat-completions)
* [Gemini 3.6 Flash Overview](/en/api-capabilities/gemini-3-6-flash/overview)
* [Gemini Native Calls Guide](/en/api-capabilities/gemini/native)
