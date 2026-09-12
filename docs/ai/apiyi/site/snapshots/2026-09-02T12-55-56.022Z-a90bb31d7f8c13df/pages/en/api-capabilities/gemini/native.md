> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini Native Format Guide

> Call the official Gemini generateContent format through APIYI: google-genai SDK setup, streaming, thinking_level controls, and thought signatures.

APIYI fully supports the **official Gemini native format** (the `/v1beta` generateContent endpoint): point the base\_url at `https://api.apiyi.com` and your existing Gemini code and official SDKs migrate seamlessly — no format conversion needed.

This page is based on the official Google documentation (`ai.google.dev/gemini-api/docs`, as of June 2026). All examples are copy-paste ready.

## Why the Native Format

The OpenAI-compatible format can call Gemini too, but the following are **native-only**:

* **Full thinking controls**: `thinking_level` (Gemini 3 series) / `thinking_budget` (2.5 series), thought summaries, thought signatures
* **Native multimodal Parts**: inline images / audio / video, with `media_resolution` cost control — see [Multimodal & Code Execution](/en/api-capabilities/gemini/multimodal)
* **Code execution tool**: `code_execution` runs Python in a sandbox
* **Fine-grained usage fields**: `thoughts_token_count`, `cached_content_token_count`, and more

For plain text chat, or one codebase across multiple vendors, use [OpenAI Compatible Mode](/en/api-capabilities/openai/compatible) instead.

## Quick Start

Use Google's official unified SDK `google-genai` (the legacy `google-generative-ai` was sunset on November 30, 2025 (UTC)):

```bash theme={null}
pip install google-genai
```

<CodeGroup>
  ```python Python theme={null}
  from google import genai

  client = genai.Client(
      api_key="YOUR_API_KEY",  # your APIYI key
      http_options={"base_url": "https://api.apiyi.com"}
  )

  response = client.models.generate_content(
      model="gemini-3.5-flash",
      contents="Introduce yourself in one sentence"
  )
  print(response.text)
  ```

  ```javascript Node.js theme={null}
  import { GoogleGenAI } from '@google/genai';

  const ai = new GoogleGenAI({
    apiKey: 'YOUR_API_KEY',
    httpOptions: { baseUrl: 'https://api.apiyi.com' }
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: 'Introduce yourself in one sentence'
  });
  console.log(response.text);
  ```

  ```bash cURL theme={null}
  curl "https://api.apiyi.com/v1beta/models/gemini-3.5-flash:generateContent" \
    -H "Content-Type: application/json" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -d '{
      "contents": [{
        "parts": [{"text": "Introduce yourself in one sentence"}]
      }]
    }'
  ```
</CodeGroup>

<Warning>
  The base\_url is `https://api.apiyi.com` (**without** `/v1`) — different from the OpenAI-compatible format's `https://api.apiyi.com/v1`. Use your **APIYI key**, not a Google AI Studio key.
</Warning>

## Streaming

```python theme={null}
stream = client.models.generate_content_stream(
    model="gemini-3.5-flash",
    contents="Write a short essay on quantum computing"
)

for chunk in stream:
    print(chunk.text, end="", flush=True)
```

## Thinking Controls

Gemini models think by default, and **the two generations use different parameters — mixing them raises an error**:

| Model series         | Parameter         | Values                                                   |
| -------------------- | ----------------- | -------------------------------------------------------- |
| Gemini 3 / 3.1 / 3.5 | `thinking_level`  | `minimal` (Flash family only) / `low` / `high` (default) |
| Gemini 2.5           | `thinking_budget` | token cap (e.g. 0–8192); model auto-controls if unset    |

<Warning>
  Passing both `thinking_level` and `thinking_budget` to a Gemini 3 series model **returns an error** — pick one (use `thinking_level` for the 3 series).
</Warning>

```python theme={null}
from google.genai import types

# Gemini 3 series: level-based control
response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="Prove that the square root of 2 is irrational",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_level="high")
    )
)

# Gemini 2.5 series: token-budget control
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Simple question, be quick",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_budget=0)  # thinking off
    )
)
```

Choosing a level: `minimal` for low-latency simple tasks (classification, extraction); `low` for routine chat; `high` for complex reasoning and code. Thinking tokens bill at the **output rate** — higher levels cost more.

### Thought summaries and thought signatures

* **Thought summaries**: `include_thoughts=True` returns a summary of the reasoning (parts where `part.thought` is `True`)
* **Thought signatures**: encrypted reasoning state introduced with Gemini 3. In multi-turn conversations (especially function calling), pass the `thought_signature` from the response back unchanged so the model can continue its reasoning chain. **Official SDKs handle this automatically**; don't strip the field in hand-written REST calls — see [Function Calling](/en/api-capabilities/gemini/function-calling)

```python theme={null}
response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="Analyze the time complexity of: def fib(n): return n if n <= 1 else fib(n-1) + fib(n-2)",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_level="high", include_thoughts=True)
    )
)

for part in response.candidates[0].content.parts:
    if getattr(part, "thought", False):
        print(f"[Thought summary] {part.text}")
    else:
        print(f"[Final answer] {part.text}")
```

## Common Config Parameters

Passed via `config` (`GenerateContentConfig`):

| Parameter            | Description                                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| `system_instruction` | System prompt                                                                                                   |
| `temperature`        | 0–2. **Google recommends keeping the default 1.0 for Gemini 3 series** — lowering it can hurt reasoning quality |
| `max_output_tokens`  | Output cap (includes thinking tokens)                                                                           |
| `thinking_config`    | Thinking controls, see above                                                                                    |
| `response_mime_type` | Set `application/json` to force JSON output                                                                     |
| `response_schema`    | Schema constraint for structured JSON output                                                                    |
| `tools`              | Function declarations / `code_execution` and other tools                                                        |
| `media_resolution`   | Multimodal input cost control, see [Multimodal page](/en/api-capabilities/gemini/multimodal)                    |

## Usage Fields (usage\_metadata)

```python theme={null}
usage = response.usage_metadata
print(f"Input: {usage.prompt_token_count}")
print(f"Output: {usage.candidates_token_count}")
print(f"Thinking: {usage.thoughts_token_count}")
print(f"Cache hits: {usage.cached_content_token_count}")
```

| Field                        | Description     | Billing                                                                            |
| ---------------------------- | --------------- | ---------------------------------------------------------------------------------- |
| `prompt_token_count`         | Input tokens    | Input rate                                                                         |
| `candidates_token_count`     | Output tokens   | Output rate                                                                        |
| `thoughts_token_count`       | Thinking tokens | **Output rate** — tune the level to save                                           |
| `cached_content_token_count` | Cached tokens   | Official discount, see [Cache Billing](/en/api-capabilities/gemini/prompt-caching) |
| `total_token_count`          | Total           | —                                                                                  |

## Supported Models and Pricing

| Model                    | Input (per 1M tokens) | Output (per 1M tokens) | Notes                                                               |
| ------------------------ | --------------------- | ---------------------- | ------------------------------------------------------------------- |
| `gemini-3.5-flash`       | \$1.50                | \$9.00                 | Current workhorse — beats 3.1 Pro on several benchmarks, 1M context |
| `gemini-3.1-pro-preview` | \$1.80                | \$10.80                | Pro flagship                                                        |
| `gemini-3-pro-preview`   | \$1.80                | \$10.80                | Previous Pro                                                        |
| `gemini-3-flash-preview` | \$0.44                | \$2.64                 | Light and fast                                                      |
| `gemini-3.1-flash-lite`  | \$0.25                | \$1.50                 | Ultra-budget                                                        |
| `gemini-2.5-pro`         | \$1.25                | \$10.00                | 2.5-series Pro                                                      |
| `gemini-2.5-flash`       | \$0.30                | \$2.40                 | 2.5-series workhorse                                                |
| `gemini-2.5-flash-lite`  | \$0.10                | \$0.40                 | Cheapest                                                            |

<Tip>
  Some models have `-thinking` / `-nothinking` alias variants (e.g. `gemini-3-flash-preview-nothinking`) that pin thinking on/off — handy for clients where you can't change request parameters. Full list: [Models & Pricing](/en/api-capabilities/model-info).
</Tip>

## Native vs OpenAI-Compatible

| Feature                        | Gemini native                        | OpenAI-compatible          |
| ------------------------------ | ------------------------------------ | -------------------------- |
| base\_url                      | `https://api.apiyi.com`              | `https://api.apiyi.com/v1` |
| SDK                            | `google-genai`                       | `openai`                   |
| Thinking control               | `thinking_level` / `thinking_budget` | `reasoning_effort`         |
| Thought summaries / signatures | ✅                                    | ❌                          |
| Code execution tool            | ✅                                    | ❌                          |
| Media input                    | Native inline Parts (PIL / bytes)    | Base64 image\_url          |
| Cache hit field                | `cached_content_token_count`         | `cached_tokens`            |

## Notes

* **The Files API is not supported** (`client.files.upload()`); media must be passed inline and **each file must stay under 20MB** — see [Multimodal & Code Execution](/en/api-capabilities/gemini/multimodal)
* Cache discounts and hit-rate expectations: [Cache Billing](/en/api-capabilities/gemini/prompt-caching)

## Related Links

* This group: [Multimodal & Code Execution](/en/api-capabilities/gemini/multimodal) · [Cache Billing](/en/api-capabilities/gemini/prompt-caching) · [Function Calling](/en/api-capabilities/gemini/function-calling)
* Get / manage tokens: `https://api.apiyi.com/token`
* Official Google docs: `ai.google.dev/gemini-api/docs`
