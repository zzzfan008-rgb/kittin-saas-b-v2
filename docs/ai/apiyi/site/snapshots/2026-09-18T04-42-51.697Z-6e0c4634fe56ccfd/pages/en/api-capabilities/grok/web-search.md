> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok Web Search & X Search Guide

> Grok live-search on APIYI, verified hands-on: Responses API + web_search / x_search tools perform real searches and return cited, up-to-date results. X search is unique to Grok. Includes response structure and billing notes.

This page shows how to use Grok's web search and X (Twitter) search on APIYI, verified hands-on on July 13, 2026 (UTC+8).

## TL;DR

**APIYI fully supports Grok's official server-side search tools**: use the **Responses API (`/v1/responses`) with the `web_search` / `x_search` tools**. `grok-4.5` verifiably performs real searches and returns cited, current results. A default-group key works out of the box.

```
Endpoint:  POST https://api.apiyi.com/v1/responses
Tools:     tools: [{"type": "web_search"}] or [{"type": "x_search"}]
Model:     grok-4.5 (verified)
```

<Warning>
  **The legacy entry point is gone**: the `search_parameters` field on Chat Completions (old Live Search) has been removed by xAI — verified returning 410. Migrate existing code to the Responses API tool format.
</Warning>

## Verified Results (2026-07-13)

| Tool         | Result                                                                                                                   | Searches per Q\&A | Latency |
| ------------ | ------------------------------------------------------------------------------------------------------------------------ | ----------------- | ------- |
| `web_search` | ✅ Accurately returned current-week news (correctly found the July 8 Grok 4.5 launch announcement), with source citations | 5                 | \~12s   |
| `x_search`   | ✅ Accurately returned the latest posts and thread content from a specified X account                                     | 24                | \~45s   |

<Tip>
  **X search is Grok's differentiator**: it searches real-time posts, account activity, and topic discussions on X (Twitter) — a source no other vendor's search tool covers. Great for social monitoring, trend tracking, and KOL analysis. Note that x\_search runs many search rounds and is noticeably slower (\~45 s measured); set client timeouts to 120 s or more.
</Tip>

## Quick Start

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/responses" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "grok-4.5",
    "tools": [{"type": "web_search"}],
    "input": "What has xAI announced in the past week? Search and cite sources"
  }'
```

### Python (OpenAI SDK)

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
)

resp = client.responses.create(
    model="grok-4.5",
    tools=[{"type": "web_search"}],      # for X search use {"type": "x_search"}
    input="What has xAI announced in the past week? Search and cite sources",
)

# 1) Final answer
print(resp.output_text)

# 2) Actual number of searches performed
searches = [i for i in resp.output if i.type == "web_search_call"]
print(f"Performed {len(searches)} searches")

# 3) Server-side tool usage breakdown (for cost auditing)
print(resp.usage.server_side_tool_usage_details)
```

### X Search Example

```python theme={null}
resp = client.responses.create(
    model="grok-4.5",
    tools=[{"type": "x_search"}],
    input="Search X for the latest posts from the official xAI account and summarize the topics",
)
print(resp.output_text)
```

## Response Structure

The `output` array contains, in execution order:

| item type         | Meaning                                                              |
| ----------------- | -------------------------------------------------------------------- |
| `reasoning`       | The model's reasoning (search-strategy planning)                     |
| `web_search_call` | One actually executed web search (`x_search` produces similar items) |
| `message`         | The final answer with inline source citations                        |

`usage.server_side_tool_usage_details` reports per-tool call counts (`web_search_calls` / `x_search_calls` / `code_interpreter_calls` / `mcp_calls`, etc.) — worth logging on your side for cost reconciliation.

## Billing

A live-search Q\&A has two cost components:

| Item                             | Notes                                                                                                                                                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Retrieved-content token cost** | Search results are injected into the model context and billed at the model's standard input rate. **This is the dominant cost**: measured \~27K input tokens for one web\_search Q\&A (of which \~11K hit the cache at the discounted rate) |
| **Tool call fees**               | Server-side tools may incur per-call fees; refer to APIYI tool pricing and your actual billing statement                                                                                                                                    |

<Info>
  x\_search runs many rounds (24 searches in one measured Q\&A), with correspondingly higher token injection and latency than web\_search — estimate costs against your expected query volume. Both the search counts and `cached_tokens` are self-auditable in the response usage.
</Info>

## Notes

1. **Responses API only**: `search_parameters` on Chat Completions is gone (410) — don't use it.
2. **Latency expectations**: \~12 s for web\_search, \~45 s for x\_search (measured; varies with task complexity). Set client timeouts ≥ 120 s.
3. **Cost control**: constrain search behavior in the prompt (e.g. "search at most 2 times") and monitor `server_side_tool_usage_details`.
4. **Verify real search happened**: check the `output` array for `web_search_call` (or equivalent) items — an answer with body text but no search items came from training data, not the web.

## Related Docs

<CardGroup cols={2}>
  <Card title="Grok Overview" icon="rocket" href="/en/api-capabilities/grok/overview">
    Model lineup, pricing, and capability matrix
  </Card>

  <Card title="Code Execution & MCP" icon="terminal" href="/en/api-capabilities/grok/code-execution-mcp">
    The other two server-side tools on the Responses API
  </Card>

  <Card title="Cache Billing" icon="database" href="/en/faq/cache-billing">
    The large input-token injections from search pair well with automatic caching
  </Card>

  <Card title="OpenAI Web Search" icon="sparkles" href="/en/api-capabilities/openai/web-search">
    Web search usage for the GPT series, for comparison
  </Card>
</CardGroup>
