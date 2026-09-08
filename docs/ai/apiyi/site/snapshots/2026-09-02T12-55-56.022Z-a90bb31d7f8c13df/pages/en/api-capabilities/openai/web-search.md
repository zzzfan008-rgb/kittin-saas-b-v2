> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI API Web Search Guide

> Responses API + web_search tool gives you live web access with a default-group key. gpt-5.5 / gpt-5.4 verified with real search and cited sources, billing included.

This page explains how to use web search with GPT models on APIYI, verified by hands-on testing in June 2026.

## TL;DR

**APIYI fully supports OpenAI's official web search**: use the **Responses API (`/v1/responses`) with the `web_search` tool**. Both gpt-5.5 and gpt-5.4 were verified to genuinely search the web and return up-to-date information with source citations. **A default-group key works out of the box — no special activation needed.**

```
Endpoint:  POST https://api.apiyi.com/v1/responses
Tool:      tools: [{"type": "web_search"}]
Models:    gpt-5.5 / gpt-5.4 (verified)
```

## Real-world availability (test data, 2026-06-11)

| Model   | Web result                                                                        | Citations                  | Searches per Q\&A | Latency |
| ------- | --------------------------------------------------------------------------------- | -------------------------- | ----------------- | ------- |
| gpt-5.4 | ✅ Accurate same-week news                                                         | ✅ Structured url\_citation | 1                 | \~11s   |
| gpt-5.5 | ✅ Accurate same-week news (auto time-window scoping, multi-source cross-checking) | ✅ Structured url\_citation | \~8               | \~51s   |

<Tip>
  Model choice: **pick gpt-5.4 for speed and cost; pick gpt-5.5 for coverage and rigor** (more search rounds and larger retrieved-content injection mean higher cost and latency — see the billing section).
</Tip>

## Quick start

### cURL

```bash theme={null}
curl https://api.apiyi.com/v1/responses \
  -H "content-type: application/json" \
  -H "authorization: Bearer YOUR_APIYI_KEY" \
  -d '{
    "model": "gpt-5.4",
    "max_output_tokens": 8192,
    "tools": [{"type": "web_search"}],
    "input": "What new models has Anthropic released in the past week? Search and include source links."
  }'
```

### Python (OpenAI SDK)

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_APIYI_KEY",         # default group works
    base_url="https://api.apiyi.com/v1",
)

resp = client.responses.create(
    model="gpt-5.4",                  # or gpt-5.5
    max_output_tokens=8192,           # recommend >=8k; gpt-5.5 uses many reasoning tokens, too small -> incomplete
    tools=[{"type": "web_search"}],
    input="What new models has Anthropic released in the past week? Search and include source links.",
)

# 1) Final answer text
print(resp.output_text)

# 2) Actual number of searches in this call (billing basis, see below)
search_calls = [item for item in resp.output if item.type == "web_search_call"]
print(f"Searches in this call: {len(search_calls)}")

# 3) Source citations (structured url_citation)
for item in resp.output:
    if item.type == "message":
        for content in item.content:
            for ann in getattr(content, "annotations", []) or []:
                print(f"Source: {ann.title} | {ann.url}")
```

### Response structure

The `output` array contains, in execution order:

| item type         | Meaning                                                                             |
| ----------------- | ----------------------------------------------------------------------------------- |
| `web_search_call` | One actually executed search (**billing counts these entries**)                     |
| `reasoning`       | The model's reasoning process (gpt-5 series)                                        |
| `message`         | The final answer; its `content[].annotations` contains `url_citation` (title + url) |

`status: "completed"` means it finished normally; `incomplete` usually means `max_output_tokens` was too small — increase it.

## Billing (important)

Web search **incurs a tool-call fee**, made up of two parts:

| Item                            | Price                                    | Notes                                                                                                                                                                                                 |
| ------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tool-call fee**               | **\$10 / 1,000 calls** (\$0.01 per call) | **Tool name: `web_search`**; counted by the number of `web_search_call` entries in the response `output` — one question may trigger multiple searches (gpt-5.4 usually 1, gpt-5.5 usually 5–8)        |
| **Retrieved-content token fee** | Standard model input price               | Search results are injected into the model context and billed as input tokens. **This is usually the larger share**: measured at roughly 9k input tokens per Q\&A for gpt-5.4, and 48–54k for gpt-5.5 |

<Info>
  Measured total cost per web-enabled Q\&A: gpt-5.4 ≈ \$0.01 search fee + 9k tokens; gpt-5.5 ≈ \$0.08 search fee + \~50k tokens. Estimate against your expected query volume.
</Info>

## Notes

1. **Use the Responses API — do not use Chat Completions' `web_search_options`**: gpt-5 series models do not support that parameter (official OpenAI behavior; returns 400 `Unknown parameter: 'web_search_options'`). `web_search_options` only applies to the dedicated `*-search-preview` models.
2. **Set `max_output_tokens` to at least 8192**: gpt-5.5 consumes many reasoning tokens; a small limit returns `status: "incomplete"` with no final answer, while tokens are still billed.
3. The legacy tool type `web_search_preview` also works with identical behavior; for new integrations, use `web_search` directly.
4. To control cost, constrain search behavior in the prompt (e.g. "search at most 2 times") or use gpt-5.4.

## FAQ

**Q: How do I confirm the answer really used the web?**

A: Check whether the response `output` contains entries with `type="web_search_call"` and whether the `message` annotations include `url_citation`. Both present means real web access; answer text alone without these two markers means the model answered from training data.

**Q: Do I need a different group or a special key?**

A: No. For OpenAI models, a default-group key can call web search directly.

**Q: Which models are supported?**

A: gpt-5.5 and gpt-5.4 are verified. Other gpt-5 series models should also support the Responses API `web_search` tool in principle — run the verification check from the FAQ above before relying on it.

## Related Docs

<CardGroup cols={2}>
  <Card title="OpenAI Native Calls (Responses API)" icon="sparkles" href="/en/api-capabilities/openai/native">
    Responses API endpoint, parameters, and setup
  </Card>

  <Card title="OpenAI Prompt Caching" icon="database" href="/en/api-capabilities/openai/prompt-caching">
    The large input-token volume injected by web search pairs well with caching
  </Card>
</CardGroup>
