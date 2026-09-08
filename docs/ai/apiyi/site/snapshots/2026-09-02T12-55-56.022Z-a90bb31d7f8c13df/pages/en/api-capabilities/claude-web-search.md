> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude API Web Search Guide

> The default group (AWS Claude) does not support the native web_search tool. Two field-tested options: the ClaudeOfficial beta group, or a custom search tool.

This page explains the two working paths to web search with Claude models on APIYI, verified by hands-on testing in June 2026. For channels, billing, and basic setup, see [Claude API Basics](/en/api-capabilities/claude) first.

## TL;DR

**APIYI's default Claude group routes to official AWS Claude (Amazon Bedrock), and AWS itself does not support Claude's native web search** — this is a Bedrock architecture limitation, not a gateway configuration issue. To get web access, you have two options:

| Path                                                                       | Best for                                                                                       | Stability                                   |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------- |
| **Option 1: ClaudeOfficial beta group** (native `web_search` tool)         | You specifically need Anthropic's native search experience and can accept beta-level stability | ⚠️ Beta, less stable than the default group |
| **Option 2: Custom search tool** (works on the default group, recommended) | Production workloads that need stability and control                                           | ✅ Same tier as the default group            |

<Warning>
  **A common pitfall**: sending a request with the `web_search` tool on the default group **does not raise an error** — the gateway handles it gracefully, the request returns HTTP 200, but no search happens; the model just answers from its training data. Do not treat "no error" as "search worked". See the FAQ at the end for how to verify.
</Warning>

## Why doesn't the default group support it?

Claude's `web_search` / `web_fetch` are **server-side tools**: the search is executed by Anthropic's own server infrastructure. AWS Bedrock only provides model inference and has no such search backend, so the Bedrock interface rejects these tools at the validation layer. Bedrock's tool-type whitelist only includes client-side tools:

```
bash_20250124, custom, memory_20250818, text_editor_*(20250124/0429/0728),
tool_search_tool_bm25(_20251119), tool_search_tool_regex(_20251119)
```

Likewise, Anthropic's **MCP Connector (the `mcp_servers` parameter) is also a server-side feature and is not supported on the default group**.

## Option 1: ClaudeOfficial beta group (native web\_search)

APIYI offers a beta group called **ClaudeOfficial** (direct Anthropic official channel) that supports Claude's native `web_search` / `web_fetch` tools.

<Info>
  * **How to enable: contact customer support** to have your key added to the ClaudeOfficial group
  * **Stability note**: this is a beta group and is less stable than the default group — for important workloads, prepare a fallback (Option 2 works well as the fallback)
</Info>

### Request example

```bash theme={null}
curl https://api.apiyi.com/v1/messages \
  -H "content-type: application/json" \
  -H "x-api-key: YOUR_APIYI_KEY(ClaudeOfficial group)" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 2048,
    "tools": [{"type": "web_search_20260209", "name": "web_search"}],
    "messages": [{"role": "user", "content": "What new models has Anthropic released recently? Search and cite sources."}]
  }'
```

Tool versions:

| Tool                     | type                                                | Notes                                   |
| ------------------------ | --------------------------------------------------- | --------------------------------------- |
| Web Search (recommended) | `web_search_20260209`                               | With dynamic filtering, for 4.6+ models |
| Web Search (basic)       | `web_search_20250305`                               | Compatible with earlier models          |
| Web Fetch                | `web_fetch_20260209` (legacy: `web_fetch_20250910`) | Fetches content from a given URL        |

Optional parameters: `max_uses` (limit the number of searches), `allowed_domains` / `blocked_domains` (domain filtering).

### How to verify the search actually ran

A successful response contains `server_tool_use` and `web_search_tool_result` blocks in `content`, with citations in the answer text, and a counter field in `usage`:

```json theme={null}
"usage": {
  "server_tool_use": { "web_search_requests": 2 }
}
```

If the response only has `text` blocks and `usage` has no `server_tool_use`, the request did not reach a search-capable channel.

### Billing

* **Tool names: `web_search`, `web_fetch`**
* web\_search: **\$10 / 1,000 searches** (\$0.01 per search, counted by `usage.server_tool_use.web_search_requests` — one answer may trigger multiple searches) plus normal token fees; failed searches are not billed
* web\_fetch: no per-call fee; fetched content is billed as input tokens
* Reference cost per web-enabled Q\&A (sonnet): roughly \$0.02–0.08

## Option 2: Custom search tool (works on the default group, recommended for production)

The default group (Bedrock) **fully supports standard function calling (custom tools)**. Define a search tool, have your client execute the actual search (via a search API such as Tavily / Brave / Serper / Bing), and feed the results back to the model. In testing, Claude actively calls the tool, rewrites queries in both Chinese and English, and produces sourced answers after multiple search rounds.

### Complete example (Python)

```python theme={null}
import requests

API_KEY = "YOUR_APIYI_KEY"  # default group works
URL = "https://api.apiyi.com/v1/messages"
HEADERS = {
    "content-type": "application/json",
    "x-api-key": API_KEY,
    "anthropic-version": "2023-06-01",
}

SEARCH_TOOL = {
    "name": "web_search",
    "description": ("Search the web for current information. Call this whenever "
                    "the user asks about recent events or anything after your "
                    "knowledge cutoff. You may call it multiple times."),
    "input_schema": {
        "type": "object",
        "properties": {"query": {"type": "string", "description": "Search keywords"}},
        "required": ["query"],
    },
}

def do_search(query: str) -> str:
    """Call your search API of choice (Tavily/Brave/Serper, etc.) and return result text."""
    # Tavily example:
    # r = requests.post("https://api.tavily.com/search",
    #                   json={"api_key": TAVILY_KEY, "query": query, "max_results": 5})
    # return "\n".join(f"- {x['title']}\n  {x['url']}\n  {x['content'][:200]}"
    #                  for x in r.json()["results"])
    ...

messages = [{"role": "user", "content": "What new models has Anthropic released recently? Search, then answer with sources."}]

for _ in range(5):  # tool loop, up to 5 rounds
    resp = requests.post(URL, headers=HEADERS, json={
        "model": "claude-sonnet-4-6",
        "max_tokens": 2048,
        "tools": [SEARCH_TOOL],
        "messages": messages,
    }, timeout=180).json()

    if resp.get("stop_reason") != "tool_use":
        print(next(b["text"] for b in resp["content"] if b["type"] == "text"))
        break

    messages.append({"role": "assistant", "content": resp["content"]})
    results = [{"type": "tool_result", "tool_use_id": b["id"],
                "content": do_search(b["input"]["query"])}
               for b in resp["content"] if b["type"] == "tool_use"]
    messages.append({"role": "user", "content": results})
```

### Cost reference

* Model token fees: one multi-round search Q\&A uses roughly 10k input + 1–2k output tokens (about \$0.05 on sonnet)
* Search API fees: Tavily free tier 1,000 calls/month (paid roughly \$0.008 per call), Brave \$3 / 1,000 calls — the same order of magnitude as the official web\_search
* Advantages: channel-agnostic, controllable and cacheable search sources, and you keep the default group's stability and cache billing benefits

### Advanced: MCP search sources

If you already use the MCP ecosystem (e.g. Tavily MCP, Brave MCP), connect to the MCP server on the **client side** and convert its tools into the custom tools shown above — the principle is identical. Note: passing the `mcp_servers` parameter directly in the request (server-side MCP) is **not available** on the default group.

## FAQ

**Q: I sent the web\_search tool on the default group and got no error — does that mean it's supported?**

A: No. The default group handles server tools gracefully (ignores them); the request returns 200 but no search happens. To verify: check whether the response `content` contains `server_tool_use` blocks and whether `usage` has the `server_tool_use.web_search_requests` field — if not, no search was executed.

**Q: What about passing the `mcp_servers` parameter?**

A: Also unsupported (it's an Anthropic server-side feature as well). Important: in this case the model may generate plausible-looking "tool result" text in the answer body — that is a hallucination, not real data. Do not rely on it.

**Q: How do I choose between the two options?**

A: For production, prefer Option 2 (stable and controllable). If you need Anthropic's native search quality, citation format, or don't want to build your own search, contact customer support to enable the ClaudeOfficial beta group — and keep a fallback ready.

## Related Docs

<CardGroup cols={2}>
  <Card title="Claude API Basics" icon="sparkles" href="/en/api-capabilities/claude">
    Channels, model list, setup, and billing basics
  </Card>

  <Card title="Claude Prompt Caching" icon="database" href="/en/api-capabilities/claude-prompt-caching">
    Multi-round search Q\&A pairs well with caching for major cost savings
  </Card>
</CardGroup>
