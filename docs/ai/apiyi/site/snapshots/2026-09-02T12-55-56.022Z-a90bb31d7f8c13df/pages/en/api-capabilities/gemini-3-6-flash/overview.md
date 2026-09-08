> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.6 Flash Text Generation

> Google's Gemini 3.6 Flash multimodal model: 1M context, four thinking tiers, full native tool suite. APIYI offers both native Gemini and OpenAI-compatible endpoints at official pricing — $1.50 input / $7.50 output per 1M tokens.

Gemini 3.6 Flash (`gemini-3.6-flash`) is Google's multimodal text model updated in July 2026 (stable release), accepting text/image/video/audio/PDF input with a 1M context window and 64K output. APIYI has completed a **full dual-endpoint test pass** (26+5 cases): both the native Gemini format and the OpenAI-compatible format work out of the box, and native tools — Search grounding, code execution, URL context — are verified working.

<Info>
  **Available on APIYI now**: model name `gemini-3.6-flash`, in the `default` / `svip` groups. **Thinking is ON by default** (thinking tokens bill as output) — lower the thinking tier for latency- or cost-sensitive workloads (see "Controlling thinking" below). For lightweight workloads, consider its cheaper sibling [Gemini 3.5 Flash-Lite](/en/api-capabilities/gemini-3-5-flash-lite/overview).
</Info>

## Highlights

<CardGroup cols={2}>
  <Card title="Full native tool suite" icon="wrench">
    Google Search grounding, Maps grounding, URL context, code execution, and Computer Use (Preview) all verified working on the native endpoint — no Google API Key required.
  </Card>

  <Card title="Full multimodal understanding" icon="eye">
    Image, PDF, and audio inputs verified accurate (video shares the same pipeline). The 1M context fits an entire book or codebase.
  </Card>

  <Card title="Four thinking tiers" icon="brain">
    thinkingLevel minimal/low/medium/high measured at 0/403/487/837 thinking tokens — monotonic, so you can budget thinking precisely per task.
  </Card>

  <Card title="Two endpoints, zero friction" icon="git-fork">
    Native Gemini format (official SDK, just change base\_url) and OpenAI-compatible format, both live at official pricing.
  </Card>
</CardGroup>

## Model details

| Property             | Value                                                                                                            |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Model name**       | `gemini-3.6-flash` (stable, no redirect aliases)                                                                 |
| **Input modalities** | Text, image, video, audio, PDF                                                                                   |
| **Context window**   | 1,048,576 input / 65,536 output                                                                                  |
| **Groups**           | `default`, `svip`                                                                                                |
| **Endpoints**        | `POST /v1beta/models/gemini-3.6-flash:generateContent` (native), `POST /v1/chat/completions` (OpenAI-compatible) |
| **Thinking**         | ON by default; four `thinkingLevel` tiers, `thinkingBudget: 0` disables                                          |
| **Streaming**        | ✅ both endpoints                                                                                                 |

## Verified capability matrix

APIYI test results from July 22, 2026 (official claims vs. measured behavior):

| Capability                                     | Official               | Gemini native                                                                                                   | OpenAI-compatible                                           |
| ---------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Chat (non-stream / stream)                     | ✅                      | ✅ / ✅                                                                                                           | ✅ / ✅                                                       |
| System instructions                            | ✅                      | ✅                                                                                                               | ✅                                                           |
| Thinking (tiers / off / thought echo)          | ✅                      | ✅ four tiers measured 0–837 tokens, `includeThoughts` works                                                     | ✅ `reasoning_effort` works, usage reports reasoning\_tokens |
| Image / PDF / audio understanding              | ✅                      | ✅ all verified                                                                                                  | ✅ image (data URL) verified                                 |
| Function calling                               | ✅                      | ✅                                                                                                               | ✅                                                           |
| Structured output                              | ✅                      | ✅ responseSchema                                                                                                | ✅ json\_schema                                              |
| Google Search grounding                        | ✅                      | ✅ full groundingMetadata                                                                                        | — native only                                               |
| Maps grounding / URL context                   | ✅                      | ✅ / ✅                                                                                                           | — native only                                               |
| Code execution                                 | ✅                      | ⚠️ verified actually executing with correct results, but `executableCode` fields are not echoed back (see note) | — native only                                               |
| Computer Use (Preview)                         | ✅                      | ✅ returns action functionCall                                                                                   | — native only                                               |
| Implicit caching                               | ✅                      | ⚠️ probabilistic hits — no guaranteed hit rate                                                                  | same                                                        |
| Explicit cache API / countTokens / File search | ✅                      | ❌ not yet enabled on the platform                                                                               | —                                                           |
| Batch / Live API / audio gen / image gen       | ❌ or N/A for a gateway | —                                                                                                               | —                                                           |

<Warning>
  **Code execution note**: our tests confirm code really runs upstream (a non-memorizable sha256 task returned the correct digest), but the `executableCode` / `codeExecutionResult` parts are currently not echoed in the response — the code and its result appear in the text body instead. Apps that render those two fields separately should take note.
</Warning>

## Pricing

| Item                    | APIYI price (same as official)           |
| ----------------------- | ---------------------------------------- |
| Input                   | \$1.50 / 1M tokens                       |
| Output (incl. thinking) | \$7.50 / 1M tokens                       |
| Google Search grounding | \$14 / 1K queries (billed per tool call) |

<Info>
  **Pricing note**: thinking tokens bill as output — the main reason to manage thinking tiers. APIYI matches official pricing; the discount comes from top-up bonuses: +10% on \$100, up to +20% (≈17% off). See [top-up promotions](/en/faq/recharge-promotions).
</Info>

## Controlling thinking

**Thinking is ON by default**: even "1+1" produces \~200 thinking tokens first. Measured tiers:

| Config                                            | Thinking tokens (measured) | Best for                                            |
| ------------------------------------------------- | -------------------------- | --------------------------------------------------- |
| `thinkingLevel: "minimal"` or `thinkingBudget: 0` | 0                          | High-frequency short Q\&A, cost-sensitive workloads |
| `thinkingLevel: "low"`                            | 403                        | Routine reasoning                                   |
| `thinkingLevel: "medium"`                         | 487                        | Medium-complexity analysis                          |
| `thinkingLevel: "high"`                           | 837+                       | Complex planning, math, code analysis               |

<Tip>
  Pass `thinkingConfig: {"includeThoughts": true}` to get thought parts back (marked `thought: true`); spend shows in `usageMetadata.thoughtsTokenCount`. On the OpenAI-compatible endpoint use `reasoning_effort` (low/medium/high) and read `usage.completion_tokens_details.reasoning_tokens`.
</Tip>

## Quick start

### Native Gemini format (recommended — full tool support)

<CodeGroup>
  ```bash cURL (basic chat) theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.6-flash:generateContent" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [{"parts": [{"text": "Introduce yourself in one sentence"}]}],
      "generationConfig": {"thinkingConfig": {"thinkingLevel": "minimal"}}
    }'
  ```

  ```python Python (google-genai SDK + Search grounding) theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.6-flash",
      contents="What was the most important AI release in July 2026?",
      config=types.GenerateContentConfig(
          tools=[types.Tool(google_search=types.GoogleSearch())]
      )
  )
  print(response.text)
  ```

  ```python Python (multimodal: PDF understanding) theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.6-flash",
      contents=[
          types.Part.from_bytes(data=open("report.pdf", "rb").read(),
                                mime_type="application/pdf"),
          "Summarize the key findings of this document"
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
      model="gemini-3.6-flash",
      messages=[{"role": "user", "content": "Analyze the time complexity of this code"}],
      reasoning_effort="high",
      max_tokens=4000
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
    model: 'gemini-3.6-flash',
    messages: [{ role: 'user', content: 'Write a short poem about summer' }],
    stream: true
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

## FAQ

<AccordionGroup>
  <Accordion title="Do I need a Google API Key for the native endpoint?">
    No. Put your APIYI token (the `sk-` key) in the `x-goog-api-key` header. With the official google-genai SDK, just set `base_url` to `https://api.apiyi.com`.
  </Accordion>

  <Accordion title="Do Search grounding / code execution work on the OpenAI-compatible endpoint?">
    No. google\_search, url\_context, codeExecution, Maps grounding, and Computer Use are native-format only. The OpenAI-compatible endpoint covers the standard set: chat, streaming, function calling, JSON Schema, and vision.
  </Accordion>

  <Accordion title="How much does implicit caching save?">
    A repeated long prefix may hit on the second request (measured: 8,176 of a 15.9K-token prefix), but hits are probabilistic — don't build cost models on them. The explicit cache API (cachedContents) is not yet enabled on the platform.
  </Accordion>

  <Accordion title="Gemini 3.6 Flash or 3.5 Flash-Lite?">
    Pick 3.6 Flash for tools, deep thinking, and stronger reasoning. Pick [3.5 Flash-Lite](/en/api-capabilities/gemini-3-5-flash-lite/overview) (\$0.30 in / \$2.50 out, no thinking by default, roughly twice as fast) for high-frequency, latency- and cost-sensitive workloads.
  </Accordion>
</AccordionGroup>

## Related

* [Native generateContent Playground](/en/api-capabilities/gemini-3-6-flash/generate-content)
* [Chat Completions Playground](/en/api-capabilities/gemini-3-6-flash/chat-completions)
* [Gemini 3.5 Flash-Lite Overview](/en/api-capabilities/gemini-3-5-flash-lite/overview)
* [Gemini Native Calls Guide](/en/api-capabilities/gemini/native)
