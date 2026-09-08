> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 联网搜索与 X 搜索使用指南

> Grok 在 API易 的联网能力实测：Responses API + web_search / x_search 工具真实联网、返回带引用的时新结果，X 搜索是 Grok 独有的差异化能力，附响应结构与计费说明。

本文说明在 API易 上使用 Grok 模型联网搜索（Web Search）与 X 平台搜索（X Search）的方法，基于 2026年7月13日 (UTC+8) 实测验证。

## 一句话结论

**API易 完整支持 Grok 官方 server-side 联网工具**：使用 **Responses API（`/v1/responses`）+ `web_search` / `x_search` 工具**，`grok-4.5` 实测真实联网、返回带来源引用的最新信息。默认分组的 KEY 直接可用。

```
端点：   POST https://api.apiyi.com/v1/responses
工具：   tools: [{"type": "web_search"}] 或 [{"type": "x_search"}]
模型：   grok-4.5（实测验证）
```

<Warning>
  **旧入口已下线**：Chat Completions 端点的 `search_parameters` 参数（旧版 Live Search）已被 xAI 移除，实测返回 410。存量代码请迁移到 Responses API 工具写法。
</Warning>

## 真实可用性（实测数据，2026-07-13）

| 工具           | 联网结果                                       | 单次问答搜索次数 | 延迟    |
| ------------ | ------------------------------------------ | -------- | ----- |
| `web_search` | ✅ 准确返回当周新闻（正确检索到 7月8日 Grok 4.5 发布公告），带来源引用 | 5 次      | \~12s |
| `x_search`   | ✅ 准确返回 X 平台指定账号最新帖子及线程内容                   | 24 次     | \~45s |

<Tip>
  **X 搜索是 Grok 的差异化能力**：可直接检索 X（推特）平台的实时帖子、账号动态与话题讨论，这是其他厂商联网工具覆盖不到的信息源。适合舆情监控、热点追踪、KOL 动态分析等场景。注意 x\_search 搜索轮次多、延迟明显更长（实测约 45 秒），客户端超时建议设 120 秒以上。
</Tip>

## 快速上手

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/responses" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "grok-4.5",
    "tools": [{"type": "web_search"}],
    "input": "xAI 最近一周发布了什么新闻？请搜索并附来源链接"
  }'
```

### Python（OpenAI SDK）

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
)

resp = client.responses.create(
    model="grok-4.5",
    tools=[{"type": "web_search"}],      # X 搜索改为 {"type": "x_search"}
    input="xAI 最近一周发布了什么新闻？请搜索并附来源链接",
)

# 1) 最终回答
print(resp.output_text)

# 2) 实际搜索次数
searches = [i for i in resp.output if i.type == "web_search_call"]
print(f"本次搜索 {len(searches)} 次")

# 3) 工具用量明细（计量自查）
print(resp.usage.server_side_tool_usage_details)
```

### X 搜索示例

```python theme={null}
resp = client.responses.create(
    model="grok-4.5",
    tools=[{"type": "x_search"}],
    input="在X上搜索 xAI 官方账号最近的帖子，总结主题",
)
print(resp.output_text)
```

## 响应结构说明

`output` 数组按执行顺序包含：

| item type         | 含义                                |
| ----------------- | --------------------------------- |
| `reasoning`       | 模型推理过程（规划搜索策略）                    |
| `web_search_call` | 一次实际执行的 Web 搜索（`x_search` 对应条目类似） |
| `message`         | 最终回答，正文内嵌来源引用链接                   |

usage 中的 `server_side_tool_usage_details` 逐项给出各工具的实际调用次数（`web_search_calls` / `x_search_calls` / `code_interpreter_calls` / `mcp_calls` 等），建议在业务侧记录用于成本核对。

## 计费说明

联网问答的开销由两部分组成：

| 项目               | 说明                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| **检索内容 token 费** | 搜索结果注入模型上下文，按模型标准 input 价计费。**这部分是大头**：实测 web\_search 单次问答约 27K input tokens（其中约 11K 命中缓存享折扣价） |
| **工具调用费**        | server-side 工具可能按次收取工具调用费，以 API易 工具定价与账单实际扣费为准                                                 |

<Info>
  x\_search 搜索轮次多（实测单次问答 24 次搜索），token 注入量与延迟均高于 web\_search，请按业务问答量预估成本。响应 usage 中的搜索次数与 `cached_tokens` 均可自查。
</Info>

## 注意事项

1. **只走 Responses API**：Chat Completions 的 `search_parameters` 已下线（410），不要再用。
2. **延迟预期**：web\_search 约 12 秒、x\_search 约 45 秒（实测值，随任务复杂度浮动），客户端超时建议 ≥ 120 秒。
3. **控制成本**：可在提示词中约束搜索行为（如「最多搜索 2 次」），或在业务侧监控 `server_side_tool_usage_details`。
4. **验证真实联网**：检查 `output` 中是否存在 `web_search_call` / 对应搜索条目——只有正文、没有搜索条目的回答是模型凭训练数据作答。

## 相关文档

<CardGroup cols={2}>
  <Card title="Grok 概览" icon="rocket" href="/api-capabilities/grok/overview">
    模型阵容、定价与能力矩阵
  </Card>

  <Card title="代码执行与 MCP" icon="terminal" href="/api-capabilities/grok/code-execution-mcp">
    同为 Responses API 的另外两大 server-side 工具
  </Card>

  <Card title="缓存计费说明" icon="database" href="/faq/cache-billing">
    联网注入的大量 input tokens 可配合自动缓存降本
  </Card>

  <Card title="OpenAI 联网搜索" icon="sparkles" href="/api-capabilities/openai/web-search">
    GPT 系列的联网搜索用法对照
  </Card>
</CardGroup>
