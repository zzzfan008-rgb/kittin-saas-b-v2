> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini API Web Search Guide

> Native generateContent + google_search tool gives you live web grounding with a default-group key, verified on three Gemini models; OpenAI-compatible mode does not support it. Includes verification method and billing ($14/1K searches).

This page explains how to use web search (Grounding with Google Search) with Gemini models on APIYI, verified by hands-on testing in June 2026 (3 models × 2 modes × multiple tool declarations, 21 recorded requests). For basic native-format setup, see [Gemini Native Calls](/en/api-capabilities/gemini/native) first.

## TL;DR

**APIYI's Gemini native endpoint fully supports Google's official web search**: use **`/v1beta` generateContent with the `google_search` tool**. gemini-3.5-flash, gemini-3.1-flash-lite, and gemini-3.1-pro-preview were all verified to genuinely search the web and return up-to-date, source-cited information. **A default-group key works out of the box — no special activation needed.**

```
Endpoint:  POST https://api.apiyi.com/v1beta/models/{model}:generateContent
Tool:      tools: [{"google_search": {}}]
Models:    gemini-3.5-flash / gemini-3.1-flash-lite / gemini-3.1-pro-preview (verified)
```

<Warning>
  **The OpenAI-compatible mode (`/v1/chat/completions`) does NOT support web search.** In testing, all three declarations — `web_search_options`, a passed-through `google_search`, and `tools: [{"type": "web_search"}]` — returned HTTP 200 but were silently ignored; the model just answered from training data. Do not treat "no error" as "search worked" — see the verification method below.
</Warning>

## Real-world availability (test data, 2026-06-11)

| Model                  | Web result                                                | groundingMetadata                   | Searches per Q\&A | Latency |
| ---------------------- | --------------------------------------------------------- | ----------------------------------- | ----------------- | ------- |
| gemini-3.5-flash       | ✅ Real same-week news, multi-query cross-checking         | ✅ Complete                          | 4–7               | 24–45s  |
| gemini-3.1-flash-lite  | ✅ Real same-week news                                     | ✅ (occasionally missing, see notes) | 2                 | \~5s    |
| gemini-3.1-pro-preview | ✅ Real same-week news, precise search after deep thinking | ✅                                   | 1                 | \~45s   |

<Tip>
  Model choice: **pick gemini-3.1-flash-lite for latency-sensitive, high-frequency calls (about 5 seconds); pick gemini-3.5-flash for search breadth and answer quality** (multi-query cross-validation, with higher thinking cost and latency — see billing).
</Tip>

## Quick start

### cURL

```bash theme={null}
curl "https://api.apiyi.com/v1beta/models/gemini-3.5-flash:generateContent" \
  -H "content-type: application/json" \
  -H "x-goog-api-key: YOUR_APIYI_KEY" \
  -d '{
    "contents": [{"parts": [{"text": "What important AI news happened in the past week? Search and list 3 items with source URLs."}]}],
    "generationConfig": {"maxOutputTokens": 4096},
    "tools": [{"google_search": {}}]
  }'
```

### Python (google-genai SDK)

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_APIYI_KEY",                     # default group works
    http_options={"base_url": "https://api.apiyi.com"},  # note: no /v1
)

resp = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="What important AI news happened in the past week? Search and list 3 items with source URLs.",
    config=types.GenerateContentConfig(
        tools=[types.Tool(google_search=types.GoogleSearch())],
        max_output_tokens=4096,
    ),
)

# 1) Final answer text
print(resp.text)

# 2) Grounding evidence: executed queries and sources
gm = resp.candidates[0].grounding_metadata
if gm:
    print("Queries:", gm.web_search_queries)
    for chunk in gm.grounding_chunks or []:
        print("Source:", chunk.web.title, chunk.web.uri)
else:
    print("⚠️ No web search was triggered in this call")
```

### How to verify the search actually ran

On success, `candidates[0].groundingMetadata` contains the fields below; **if they are absent, no search happened**:

| Field               | Meaning                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------- |
| `webSearchQueries`  | Array of search queries the model actually executed (array length = number of searches) |
| `groundingChunks`   | Retrieved sources (URI + title)                                                         |
| `groundingSupports` | Mapping between answer text segments and sources (startIndex/endIndex)                  |
| `searchEntryPoint`  | HTML/CSS for rendering the required Google Search Suggestions                           |

Control-group reference: asked the same question without the tool, models consistently answered "my knowledge ends in January 2025, I cannot provide current news"; with the tool, they accurately reported real events that happened after their training cutoff.

## Billing (important)

Web search **incurs a tool-call fee**, made up of two parts:

| Item                | Price                                          | Notes                                                                                                                                                                                                                                                                                                           |
| ------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tool-call fee**   | **\$14 / 1,000 searches** (\$0.014 per search) | **Tool name: `google_search`**; billed by the number of searches actually executed, i.e. the length of `groundingMetadata.webSearchQueries` — one question may trigger multiple searches (measured: pro-preview 1, flash-lite 2, 3.5-flash 4–7)                                                                 |
| **Model token fee** | Standard model price                           | Unlike OpenAI web search, **retrieved content is NOT injected as input tokens** (promptTokenCount stays nearly identical, 31–43 tokens measured); the bulk of the cost is **thinking + output tokens** (one deep web-grounded Q\&A on 3.5-flash consumed 3,500–4,900 thought tokens, billed at the output rate) |

<Info>
  Reference total cost per web-grounded Q\&A (search fee + tokens): flash-lite ≈ \$0.03; 3.5-flash ≈ \$0.08–0.16; 3.1-pro-preview ≈ \$0.06. To control cost, constrain search behavior in the prompt (e.g. "search at most 2 times") or pick a model that searches less.
</Info>

<Tip>
  **You may get the fee waived**: the official Gemini API includes a free search quota (Gemini 3 series: 5,000 prompts per month free, then \$14/1K searches). When the upstream call lands within the free quota, the search fee for that call may be waived (we observed whole calls with no search fee in testing); when a fee is charged, it follows the table above. The console billing details are authoritative.
</Tip>

## Notes

1. **You must use the native endpoint**: all search declarations on the OpenAI-compatible mode are silently ignored without errors. For OpenAI-SDK projects, switch to the google-genai SDK (`base_url` set to `https://api.apiyi.com`, without `/v1`).
2. **Treat groundingMetadata as the source of truth**: in testing, flash-lite occasionally (1 out of 4 runs) returned no groundingMetadata. For strict scenarios, validate the field's presence and retry when missing.
3. **Give thinking models enough `maxOutputTokens`** (at least 4096 recommended): 3.5-flash / 3.1-pro-preview consume 1,900–4,900 thinking tokens when grounding; a small limit truncates the answer.
4. Both `{"google_search": {}}` and camelCase `{"googleSearch": {}}` work; the legacy `google_search_retrieval` belongs to the Gemini 1.5 era — use `google_search` for all current models.
5. Web search can be combined with other tools such as URL Context (official Google docs: `ai.google.dev/gemini-api/docs/google-search`).

## FAQ

**Q: How do I confirm the answer really used the web?**

A: Check that `candidates[0].groundingMetadata` exists, `webSearchQueries` is non-empty, and `groundingChunks` contains source URIs. Answer text alone without these fields means the model answered from training data.

**Q: Do I need a different group or a special key?**

A: No. For Gemini models, a default-group key can call web search directly (same as OpenAI web search; unlike Claude native search, which requires the ClaudeOfficial beta group).

**Q: How do I see the search count, and does it vary by model?**

A: Count the length of `groundingMetadata.webSearchQueries`. For the same question, it varies a lot: pro-preview 1, flash-lite 2, 3.5-flash 4–7.

**Q: Which models are supported?**

A: gemini-3.5-flash, gemini-3.1-flash-lite, and gemini-3.1-pro-preview are verified. Other Gemini 2.5+ models should also support the `google_search` tool in principle — run the verification check from the FAQ above before relying on it.

## Related Docs

<CardGroup cols={2}>
  <Card title="Gemini Native Calls" icon="sparkles" href="/en/api-capabilities/gemini/native">
    google-genai SDK setup, streaming, thinking control
  </Card>

  <Card title="Gemini Function Calling" icon="wrench" href="/en/api-capabilities/gemini/function-calling">
    Custom tool calls, composable with web search
  </Card>
</CardGroup>
