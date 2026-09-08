> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 代码执行与 Remote MCP 使用指南

> Grok 在 API易 的 code_interpreter 服务端代码执行与 Remote MCP 工具实测：Python 沙箱真实运行、外部 MCP server 成功连通，附调用示例与响应结构。

除联网搜索外，Grok 的 Responses API 还提供两类 server-side 工具：**代码执行**（`code_interpreter`，服务端 Python 沙箱）与 **Remote MCP**（让 xAI 服务端直连你指定的 MCP server）。两者在 API易 上均实测可用（2026年7月13日 (UTC+8)），默认分组 KEY 直接调用。

## 代码执行（Code Execution）

模型自动编写 Python 代码并在 xAI 服务端沙箱中真实运行，适合精确计算、数据处理等场景。实测让模型计算 2 的 100 次方，模型执行 `print(2 ** 100)` 后返回了精确值（大整数运算，纯语言模型极易算错，代码执行则完全精确）：

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
)

resp = client.responses.create(
    model="grok-4.5",
    tools=[{"type": "code_interpreter"}],
    input="用代码计算 2 的 100 次方，给出精确值",
)
print(resp.output_text)
# 2^100 = 1267650600228229401496703205376

# 查看模型实际执行的代码
for item in resp.output:
    if item.type == "code_interpreter_call":
        print("执行的代码:", item.code)
```

实测单次代码执行任务延迟约 6 秒。usage 的 `server_side_tool_usage_details.code_interpreter_calls` 记录执行次数。

## Remote MCP 工具

在请求中声明外部 MCP server，xAI 服务端会自动连接、列出其工具并按需调用——你无需在本地跑任何 MCP 客户端。实测成功连通公开 MCP server 并完成工具调用（延迟约 16 秒）：

```python theme={null}
resp = client.responses.create(
    model="grok-4.5",
    tools=[{
        "type": "mcp",
        "server_label": "deepwiki",
        "server_url": "https://mcp.deepwiki.com/mcp",
        "require_approval": "never"
    }],
    input="使用 deepwiki 查询 openai/openai-python 仓库是做什么的，一句话",
)
print(resp.output_text)

# 查看 MCP 调用明细
for item in resp.output:
    if item.type == "mcp_call":
        print("工具:", item.name, "| 输出:", item.output[:200])
```

| 参数                 | 说明                               |
| ------------------ | -------------------------------- |
| `server_label`     | 自定义标签，用于区分多个 MCP server          |
| `server_url`       | MCP server 地址（需公网可达，xAI 服务端直连）   |
| `require_approval` | `"never"` 为自动调用；默认会返回审批请求，需要二次确认 |

<Warning>
  * **MCP server 必须公网可达**：连接由 xAI 服务端发起，内网 / localhost 地址不可用。
  * **注意数据安全**：你的对话内容会经 xAI 服务端发送到该 MCP server，请只接入可信服务。
  * 外部 server 的可用性不受 API易 控制，调用失败时请先自查 server 状态。
</Warning>

## Collections Search（RAG）不可用

xAI 官方还有一个 `collections_search`（知识库检索 / file\_search）工具，**在 API易 上不适用**：它依赖在 xAI 控制台预先上传文件并建立知识库，而 API易 为号池模式、用户无法访问上游控制台。实测请求可透传但检索必然失败（`file_search_call` 返回 failed）。

需要 RAG 场景请在业务侧自建检索（向量库 + 把召回内容拼入 prompt），配合 Grok 的 1M 上下文与 [自动缓存](/faq/cache-billing) 使用。

## 常见问题

<AccordionGroup>
  <Accordion title="可以同时声明多个工具吗？">
    可以。`tools` 数组可同时包含 `web_search` / `x_search` / `code_interpreter` / `mcp`，模型按任务自行决定调用哪个。usage 的 `server_side_tool_usage_details` 会分项计数。
  </Accordion>

  <Accordion title="代码沙箱能联网或读文件吗？">
    沙箱面向计算场景（Python 运算 / 数据处理），不能访问你的本地文件；需要外部数据请配合 web\_search 或 MCP 工具。
  </Accordion>

  <Accordion title="工具执行失败会计费吗？">
    模型推理消耗的 tokens 正常计费。工具本身的调用费以 API易 工具定价与账单实际扣费为准，建议开发期先小量验证再放量。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="联网搜索与 X 搜索" icon="globe" href="/api-capabilities/grok/web-search">
    同为 Responses API 的联网类工具
  </Card>

  <Card title="Grok 概览" icon="rocket" href="/api-capabilities/grok/overview">
    模型阵容、定价与能力边界总表
  </Card>
</CardGroup>
