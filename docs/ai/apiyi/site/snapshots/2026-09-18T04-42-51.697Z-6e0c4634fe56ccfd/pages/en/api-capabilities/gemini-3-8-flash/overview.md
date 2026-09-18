> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.8 Flash Text Generation

> Google's Gemini 3.8 Flash multimodal text model on APIYI: both endpoints open, $0.75 in / $3.75 out per 1M tokens — half of 3.6 Flash. Includes 150 pre-launch test results and migration notes from 3.6 / 3.7.

Gemini 3.8 Flash (`gemini-3.8-flash`) is the multimodal text model Google put out on September 2, 2026, taking text, image, video and audio input. APIYI has both the **Gemini native** and **OpenAI-compatible** endpoints open, and ran **150 paired test cases across both protocols** before launch, using `gemini-3.7-flash` as the reference.

<Info>
  **Gemini 3.8 Flash is live on APIYI**: model name `gemini-3.8-flash`, available in the `default` and `svip` groups. **Deep thinking is on by default** and thinking tokens bill as output, so lower the thinking tier or turn it off for latency- and cost-sensitive paths (see "Thinking control" below).
</Info>

<Warning>
  **Official specs are not published yet**: as of this page, neither Google's Gemini API model list nor the DeepMind model card carries 3.8 Flash, and no launch blog post is up. So **context window, max output, knowledge cutoff, and official benchmark scores are all marked "not published"** here — we neither relay nor guess at them. Everything marked as measured comes from APIYI's own testing; official material will be folded in once it lands.
</Warning>

## Why it stands out

<CardGroup cols={2}>
  <Card title="Half the price of 3.6 Flash" icon="dollar-sign">
    \$0.75 in / \$3.75 out per 1M tokens — half of 3.6 Flash (\$1.50 / \$7.50), and line-for-line identical to 3.7 Flash, so migrating from 3.7 costs nothing.
  </Card>

  <Card title="150 pre-launch test cases" icon="clipboard-check">
    Fired simultaneously against 3.7 Flash across both protocols: core capability, reasoning, parallel tool calling and image/video understanding all line up, with no regression unique to 3.8.
  </Card>

  <Card title="Both endpoints, no friction" icon="git-fork">
    Gemini native format (official SDK, no Google API key needed) and OpenAI-compatible format (just change base\_url) are both open.
  </Card>

  <Card title="Near-zero migration cost" icon="arrow-right-arrow-left">
    From 3.7 Flash it is a one-line model name change: request shape, parameters and response fields are unchanged, with one field-set difference and zero type changes measured.
  </Card>
</CardGroup>

## Model information

| Field                           | Value                                                                                                            |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Model name**                  | `gemini-3.8-flash`                                                                                               |
| **Input modalities**            | text, image, video, audio (image and video verified)                                                             |
| **Output modality**             | text                                                                                                             |
| **Context window / max output** | not published by Google                                                                                          |
| **Knowledge cutoff**            | not published by Google                                                                                          |
| **Groups**                      | `default`, `svip`                                                                                                |
| **Endpoints**                   | `POST /v1beta/models/gemini-3.8-flash:generateContent` (native), `POST /v1/chat/completions` (OpenAI-compatible) |
| **Deep thinking**               | on by default; `thinkingLevel` has three tiers (low / medium / high); `thinkingBudget: 0` turns it off           |
| **Streaming**                   | ✅ on both endpoints                                                                                              |

## Measured capability matrix

Results from APIYI testing on September 2, 2026 — 150 case logs and 198 calls, with every case fired **simultaneously** against `gemini-3.7-flash` to rule out time-of-day effects:

| Capability                                             | Gemini native                                               | OpenAI-compatible                 | vs 3.7 Flash                          |
| ------------------------------------------------------ | ----------------------------------------------------------- | --------------------------------- | ------------------------------------- |
| Basic chat (non-streaming / streaming)                 | ✅ / ✅                                                       | ✅ / ✅                             | same                                  |
| System instruction                                     | ✅                                                           | ✅                                 | same                                  |
| Multi-turn                                             | ✅                                                           | ✅                                 | same                                  |
| Long-context lookup (14.5K-char prefix, 128-token cap) | ✅                                                           | ✅                                 | same answer                           |
| Structured output                                      | ✅ responseSchema                                            | ✅ json\_schema                    | returned JSON byte-identical          |
| Function calling (single / hand-back / sequential)     | ✅                                                           | ✅                                 | same                                  |
| **Parallel function calling**                          | ✅ two calls with intact args and IDs, across two rounds     | ✅                                 | same                                  |
| Image understanding                                    | ✅ 2/2                                                       | ✅ 2/2                             | IMAGE modality token counts identical |
| Video understanding                                    | ✅ 2/2                                                       | ✅ 2/2                             | VIDEO modality token counts identical |
| Code execution (`codeExecution`)                       | ✅ correct answer                                            | — native only                     | same                                  |
| URL context (`urlContext`)                             | ✅ returns `urlContextMetadata`; the page really was fetched | — native only                     | same                                  |
| Thinking tiers low / medium / high                     | ✅ thinking tokens scale monotonically                       | ✅ `reasoning_effort` takes effect | same                                  |
| `stopSequences` / `stop`                               | ✅ strictly honored                                          | ⚠️ no effect                      | same                                  |
| `temperature=0` + `topK=1` + `seed`                    | ✅ two runs word-for-word identical                          | ⚠️ two runs differ                | same                                  |
| `safetySettings`                                       | ✅ accepted, returns `safetyRatings`                         | — native only                     | same                                  |
| Google Search grounding                                | ⚠️ request accepted but no `groundingMetadata` (see below)  | — native only                     | same                                  |
| Implicit caching                                       | ⚠️ no hits observed over 8 consecutive rounds               | same                              | same                                  |
| Explicit `cachedContents` / `:countTokens`             | ❌ not enabled on the platform                               | —                                 | same                                  |

<Warning>
  **Search grounding is unconfirmed**: passing `tools: [{"googleSearch": {}}]` returns 200 with a correct answer, but the response carries **no `groundingMetadata`**, meaning the answer came from the model's own knowledge rather than a live search. `gemini-3.7-flash` behaved identically in the same run, which points at **route-level enablement rather than a model capability difference**. If you depend on live retrieval, verify on a slice of traffic first rather than designing around grounding being active.
</Warning>

## Pricing

| Item                       | APIYI price         |
| -------------------------- | ------------------- |
| Input                      | \$0.75 / 1M tokens  |
| Output (thinking included) | \$3.75 / 1M tokens  |
| Cached read                | \$0.075 / 1M tokens |

**Line-for-line identical to `gemini-3.7-flash`**, so migrating from 3.7 changes nothing about your costs; against 3.6 Flash (\$1.50 / \$7.50) it is a **straight halving**.

<Info>
  **On pricing**: thinking tokens bill as output — that is the most direct reason to manage the thinking tier. Google has not published official pricing for 3.8 Flash; for reference, the \$0.75 / \$3.75 currently in effect for 3.7 Flash is Google's own limited-time promotional rate, stated as valid through December 31, 2026. APIYI prices match the provider line for line, with discounts coming through top-up bonuses — see [top-up promotions](/en/faq/recharge-promotions).
</Info>

## Thinking control

**Deep thinking is on by default**: even a "1+1" prompt burns a few hundred thinking tokens first. Measured across the three tiers (same question, native endpoint):

| Setting                                 | Thinking tokens (measured)                        | Fits                                               |
| --------------------------------------- | ------------------------------------------------- | -------------------------------------------------- |
| `thinkingConfig: {"thinkingBudget": 0}` | 0 (`thoughtsTokenCount` absent from the response) | high-frequency short prompts, cost-sensitive paths |
| `thinkingLevel: "low"`                  | 84                                                | everyday reasoning                                 |
| `thinkingLevel: "medium"`               | 127                                               | moderately complex analysis                        |
| `thinkingLevel: "high"`                 | 263                                               | complex planning, math, code analysis              |

<Warning>
  **The `minimal` tier is gone** (3.6 Flash had it, 3.8 does not): the native endpoint returns 400 `Thinking level is unsupported: THINKING_LEVEL_MINIMAL` for `thinkingLevel: "minimal"`. Use `thinkingConfig: {"thinkingBudget": 0}` to turn thinking off entirely.

  **The OpenAI-compatible endpoint needs more care**: `reasoning_effort: "minimal"` **does not error** — it returns 200, yet measurably still burned 76 thinking tokens that billed as output. The parameter is silently ignored and thinking happens anyway. Code carried over from 3.6 Flash with `minimal` still set will get no error telling you to change it.
</Warning>

<Tip>
  To inspect the reasoning, pass `thinkingConfig: {"includeThoughts": true}` — the response then carries thought parts flagged `thought: true`, with usage in `usageMetadata.thoughtsTokenCount`. On the OpenAI-compatible endpoint, use `reasoning_effort` (low / medium / high) and read `usage.completion_tokens_details.reasoning_tokens`.
</Tip>

## Examples

### Gemini native format (recommended, broader tool support)

<CodeGroup>
  ```bash cURL (basic chat, thinking off) theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-3.8-flash:generateContent" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [{"parts": [{"text": "Introduce yourself in one sentence"}]}],
      "generationConfig": {"thinkingConfig": {"thinkingBudget": 0}}
    }'
  ```

  ```python Python (google-genai SDK) theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.8-flash",
      contents="Analyze the time complexity of this code and suggest optimizations",
      config=types.GenerateContentConfig(
          thinking_config=types.ThinkingConfig(thinking_level="high")
      )
  )
  print(response.text)
  ```

  ```python Python (URL context, verified working) theme={null}
  from google import genai
  from google.genai import types

  client = genai.Client(
      api_key="YOUR_API_KEY",
      http_options=types.HttpOptions(base_url="https://api.apiyi.com")
  )

  response = client.models.generate_content(
      model="gemini-3.8-flash",
      contents="Summarize what https://ai.google.dev/gemini-api/docs covers",
      config=types.GenerateContentConfig(
          tools=[types.Tool(url_context=types.UrlContext())]
      )
  )
  print(response.text)
  ```
</CodeGroup>

### OpenAI-compatible format (no changes to existing code)

<CodeGroup>
  ```python Python (OpenAI SDK) theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="gemini-3.8-flash",
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
    model: 'gemini-3.8-flash',
    messages: [{ role: 'user', content: 'Write a short poem about autumn' }],
    stream: true
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
  ```
</CodeGroup>

## Migration guide

<AccordionGroup>
  <Accordion title="Coming from gemini-3.7-flash">
    **Change the model name, nothing else.** Request shape, parameters and response fields tested unchanged; response field sets differ in one group with zero type changes, so clients need no adaptation. Pricing is identical, so your existing budget carries over.
  </Accordion>

  <Accordion title="Coming from gemini-3.6-flash">
    The price is **cut in half** (input \$1.50 → \$0.75, output \$7.50 → \$3.75), but one thing must change: **`thinkingLevel: "minimal"` is no longer supported** and the native endpoint returns 400 — switch to `thinkingConfig: {"thinkingBudget": 0}`. On the OpenAI-compatible endpoint, `reasoning_effort: "minimal"` will not error but is silently ignored while thinking still bills, so fix that too.
  </Accordion>

  <Accordion title="What is the context limit?">
    Not published by Google, and we will not infer it from 3.7's number. A long-context lookup task with a 14.5K-character prefix passed in testing. **If you lean heavily on long context, ramp on a slice of traffic first**, confirm the boundary, then cut over. This page will be updated once official specs land.
  </Accordion>

  <Accordion title="Does the native endpoint need a Google API key?">
    No. Put your APIYI key (starting with `sk-`) straight into the `x-goog-api-key` header; with the official google-genai SDK just point `base_url` at `https://api.apiyi.com`.
  </Accordion>

  <Accordion title="Which capabilities are native-only?">
    Code execution, URL context, `safetySettings`, and strict handling of `stopSequences` and `seed` are available only on the Gemini native endpoint. The OpenAI-compatible endpoint covers the usual ground (chat / streaming / function calling / JSON Schema / vision), but `stop` and `seed` tested as having no effect there.
  </Accordion>
</AccordionGroup>

## Related

* [Gemini 3.8 Flash launch notes (full test data)](/en/news/gemini-3-8-flash-launch)
* [Gemini 3.6 Flash overview](/en/api-capabilities/gemini-3-6-flash/overview)
* [Gemini 3.5 Flash-Lite overview](/en/api-capabilities/gemini-3-5-flash-lite/overview)
* [Gemini native calling guide](/en/api-capabilities/gemini/native)
