> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude API 联网搜索实现指南

> 默认分组（AWS Claude）不支持原生 web_search 工具，本文给出两条实测可行的联网方案：ClaudeOfficial 内测分组与自定义搜索工具。

本文说明在 API易 上使用 Claude 系列模型实现联网搜索的两条路径，基于 2026年6月 实测验证。基础的通道、计费与接入信息请先看 [Claude API 基础说明](/api-capabilities/claude)。

## 一句话结论

**API易 Claude 系列默认分组为 AWS Claude 官方直转（Amazon Bedrock），AWS 原厂不支持 Claude 原生联网搜索**——这是 Bedrock 的架构限制，不是中转配置问题。如需联网，您有两条路：

| 路径                                              | 适用场景                           | 稳定性          |
| ----------------------------------------------- | ------------------------------ | ------------ |
| **方式一：ClaudeOfficial 内测分组**（原生 `web_search` 工具） | 强烈需要 Anthropic 原生搜索体验、可接受内测稳定性 | ⚠️ 内测，不如默认分组 |
| **方式二：自定义搜索工具**（默认分组即可用，推荐）                     | 生产环境、需要稳定可控                    | ✅ 与默认分组同级    |

<Warning>
  **容易踩的坑**：在默认分组带上 `web_search` 工具发请求，**不会报错**——网关会兼容处理，请求正常返回 HTTP 200，但搜索没有发生，模型只是凭训练数据回答。请不要以"没报错"判断联网已生效，判断方法见文末 FAQ。
</Warning>

## 为什么默认分组不支持？

Claude 的 `web_search` / `web_fetch` 属于 **server-side tools**：搜索动作由 Anthropic 自己的服务端基础设施执行。AWS Bedrock 只提供模型推理，没有这套搜索后端，因此 Bedrock 接口在校验层就会拒绝这类工具。Bedrock 支持的工具类型白名单仅包含 client-side 工具：

```
bash_20250124, custom, memory_20250818, text_editor_*(20250124/0429/0728),
tool_search_tool_bm25(_20251119), tool_search_tool_regex(_20251119)
```

同理，Anthropic 的 **MCP Connector（`mcp_servers` 参数）也属于服务端功能，默认分组不支持**。

## 方式一：ClaudeOfficial 内测分组（原生 web\_search）

API易 提供一个内测分组 **ClaudeOfficial**（Anthropic 官方渠道直连），支持 Claude 原生 `web_search` / `web_fetch` 工具。

<Info>
  * **开通方式：联系客服对接**，将您的 key 加入 ClaudeOfficial 分组
  * **稳定性提示**：内测分组，稳定性不如默认分组，重要业务请做好降级（可降级到方式二）
</Info>

### 请求示例

```bash theme={null}
curl https://api.apiyi.com/v1/messages \
  -H "content-type: application/json" \
  -H "x-api-key: 你的APIYI_KEY(ClaudeOfficial分组)" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 2048,
    "tools": [{"type": "web_search_20260209", "name": "web_search"}],
    "messages": [{"role": "user", "content": "Anthropic 最近发布了什么新模型？请搜索并给出来源"}]
  }'
```

工具版本说明：

| 工具             | type                                          | 说明            |
| -------------- | --------------------------------------------- | ------------- |
| Web Search（推荐） | `web_search_20260209`                         | 带动态过滤，4.6+ 模型 |
| Web Search（基础） | `web_search_20250305`                         | 兼容更早模型        |
| Web Fetch      | `web_fetch_20260209`（旧版 `web_fetch_20250910`） | 抓取指定 URL 内容   |

可选参数：`max_uses`（限制搜索次数）、`allowed_domains` / `blocked_domains`（域名过滤）。

### 怎么确认搜索真的执行了

成功响应的 `content` 中会出现 `server_tool_use` 和 `web_search_tool_result` 块，正文带引用；`usage` 中出现计次字段：

```json theme={null}
"usage": {
  "server_tool_use": { "web_search_requests": 2 }
}
```

若响应只有 `text` 块、`usage` 里没有 `server_tool_use`，说明这条请求没有走到支持搜索的渠道。

### 计费

* **工具名：`web_search`、`web_fetch`**
* web\_search：**\$10 / 1000 次搜索**（\$0.01/次，按 `usage.server_tool_use.web_search_requests` 计次——一次回答可能触发多次搜索）+ 正常 token 费；失败的搜索不计费
* web\_fetch：不额外按次收费，抓取内容按 input token 计费
* 单次联网问答参考成本（sonnet）：约 \$0.02–0.08

## 方式二：自定义搜索工具（默认分组可用，推荐生产使用）

默认分组（Bedrock）**完整支持标准 function calling（custom tools）**。您只需定义一个搜索工具，由您的客户端执行实际搜索（接 Tavily / Brave / Serper / Bing 等搜索 API），把结果回传给模型。实测 Claude 会主动调用、自动改写中英文查询词、多轮搜索后给出带来源的回答。

### 完整示例（Python）

```python theme={null}
import requests

API_KEY = "你的APIYI_KEY"  # 默认分组即可
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
        "properties": {"query": {"type": "string", "description": "搜索关键词"}},
        "required": ["query"],
    },
}

def do_search(query: str) -> str:
    """接您选用的搜索 API（Tavily/Brave/Serper 等），返回结果文本。"""
    # 以 Tavily 为例：
    # r = requests.post("https://api.tavily.com/search",
    #                   json={"api_key": TAVILY_KEY, "query": query, "max_results": 5})
    # return "\n".join(f"- {x['title']}\n  {x['url']}\n  {x['content'][:200]}"
    #                  for x in r.json()["results"])
    ...

messages = [{"role": "user", "content": "Anthropic 最近发布了什么新模型？请搜索后回答并附来源"}]

for _ in range(5):  # 工具循环，最多 5 轮
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

### 成本参考

* 模型 token 费：一次多轮搜索问答约 1 万 input + 1–2 千 output token（sonnet 约 \$0.05）
* 搜索 API 费：Tavily 免费档 1000 次/月（付费约 \$0.008/次）、Brave \$3/1000 次——与官方 web\_search 同量级
* 优势：渠道无关、搜索源可控可缓存、保留默认分组的稳定性与缓存计费优势

### 进阶：MCP 搜索源

若您已有 MCP 生态（如 Tavily MCP、Brave MCP），可在**客户端**连接 MCP server，把其工具转换成上面的 custom tools 传给模型——原理完全相同。注意：直接在请求里传 `mcp_servers` 参数（服务端 MCP）在默认分组**不可用**。

## FAQ

**Q：我在默认分组带了 web\_search 工具，没报错，是不是就支持了？**

A：不是。默认分组对 server tools 做兼容处理（忽略），请求返回 200 但搜索未发生。判断方法：看响应 `content` 是否有 `server_tool_use` 块、`usage` 是否有 `server_tool_use.web_search_requests` 字段——没有就是没执行。

**Q：传 `mcp_servers` 参数呢？**

A：同样不支持（也是 Anthropic 服务端功能）。特别提醒：这种情况下模型可能在正文中生成看似真实的"工具调用结果"文本，那是模型的幻觉，并非真实数据，请勿采信。

**Q：两种方式怎么选？**

A：生产环境优先方式二（稳定、可控）；需要 Anthropic 原生搜索质量、引用格式（citations）或不想自建搜索的，联系客服开通 ClaudeOfficial 内测分组，并准备好降级方案。

## 相关文档

<CardGroup cols={2}>
  <Card title="Claude API 基础说明" icon="sparkles" href="/api-capabilities/claude">
    通道说明、模型列表、接入与计费基础信息
  </Card>

  <Card title="Claude 缓存计费" icon="database" href="/api-capabilities/claude-prompt-caching">
    多轮搜索问答场景配合缓存可显著降本
  </Card>
</CardGroup>
