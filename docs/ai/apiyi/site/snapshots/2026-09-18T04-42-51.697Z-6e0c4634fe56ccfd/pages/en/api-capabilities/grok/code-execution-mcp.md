> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok Code Execution & Remote MCP Guide

> Grok's code_interpreter server-side code execution and Remote MCP tools on APIYI, verified hands-on: the Python sandbox really runs code and external MCP servers connect successfully. Includes examples and response structure.

Beyond live search, Grok's Responses API offers two more server-side tools: **code execution** (`code_interpreter`, a server-side Python sandbox) and **Remote MCP** (xAI's servers connect directly to an MCP server you specify). Both are verified working on APIYI (July 13, 2026, UTC+8) with a default-group key.

## Code Execution

The model writes Python and actually runs it in xAI's server-side sandbox — ideal for exact computation and data processing. In testing we asked for 2 to the power of 100: the model executed `print(2 ** 100)` and returned the exact value (big-integer math that pure language models routinely get wrong; code execution is exact):

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
)

resp = client.responses.create(
    model="grok-4.5",
    tools=[{"type": "code_interpreter"}],
    input="Compute 2 to the power of 100 exactly, using code",
)
print(resp.output_text)
# 2^100 = 1267650600228229401496703205376

# Inspect the code the model actually ran
for item in resp.output:
    if item.type == "code_interpreter_call":
        print("Executed code:", item.code)
```

Measured latency for a single code-execution task: \~6 s. `usage.server_side_tool_usage_details.code_interpreter_calls` records the execution count.

## Remote MCP Tools

Declare an external MCP server in the request and xAI's servers automatically connect, list its tools, and call them as needed — no local MCP client required. Verified connecting to a public MCP server and completing a tool call (\~16 s):

```python theme={null}
resp = client.responses.create(
    model="grok-4.5",
    tools=[{
        "type": "mcp",
        "server_label": "deepwiki",
        "server_url": "https://mcp.deepwiki.com/mcp",
        "require_approval": "never"
    }],
    input="Use deepwiki to find out what the openai/openai-python repo does, in one sentence",
)
print(resp.output_text)

# Inspect MCP call details
for item in resp.output:
    if item.type == "mcp_call":
        print("Tool:", item.name, "| Output:", item.output[:200])
```

| Parameter          | Notes                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| `server_label`     | Your label for distinguishing multiple MCP servers                                                  |
| `server_url`       | MCP server address (must be publicly reachable — xAI's servers connect directly)                    |
| `require_approval` | `"never"` calls tools automatically; the default returns approval requests requiring a second round |

<Warning>
  * **The MCP server must be publicly reachable**: connections originate from xAI's servers; intranet / localhost addresses won't work.
  * **Mind data security**: your conversation content is sent through xAI's servers to that MCP server — only connect services you trust.
  * External server availability is outside APIYI's control; on failures, check the server's status first.
</Warning>

## Collections Search (RAG) — Not Available

xAI also offers a `collections_search` (knowledge-base retrieval / file\_search) tool. **It is not usable on APIYI**: it requires files uploaded and collections built in the xAI console beforehand, and APIYI runs in key-pool mode with no upstream console access. In testing the request passes through but retrieval inevitably fails (`file_search_call` returns failed).

For RAG, build retrieval on your side (vector store + inject recalled content into the prompt), leveraging Grok's 1M context and [automatic caching](/en/faq/cache-billing).

## FAQ

<AccordionGroup>
  <Accordion title="Can I declare multiple tools at once?">
    Yes. The `tools` array can include `web_search` / `x_search` / `code_interpreter` / `mcp` together; the model decides which to call per task. `usage.server_side_tool_usage_details` counts each separately.
  </Accordion>

  <Accordion title="Can the code sandbox access the network or my files?">
    The sandbox targets computation (Python math / data processing) and cannot access your local files. For external data, combine it with web\_search or MCP tools.
  </Accordion>

  <Accordion title="Are failed tool executions billed?">
    Model-side reasoning tokens are billed normally. Tool call fees follow APIYI tool pricing and your actual billing statement — validate with small volumes before scaling up.
  </Accordion>
</AccordionGroup>

## Related Docs

<CardGroup cols={2}>
  <Card title="Web & X Search" icon="globe" href="/en/api-capabilities/grok/web-search">
    The live-search tools on the same Responses API
  </Card>

  <Card title="Grok Overview" icon="rocket" href="/en/api-capabilities/grok/overview">
    Model lineup, pricing, and the full capability-boundary table
  </Card>
</CardGroup>
