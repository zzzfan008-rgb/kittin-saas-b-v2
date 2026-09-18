> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI API 联网搜索使用指南

> Responses API + web_search 工具即可联网，默认分组 KEY 直接可用。gpt-5.5 / gpt-5.4 实测真实联网、返回带来源引用，附计费说明。

本文说明在 API易 上使用 GPT 系列模型实现联网搜索的方法，基于 2026年6月 实测验证。

## 一句话结论

**API易 完整支持 OpenAI 官方联网搜索**：使用 **Responses API（`/v1/responses`）+ `web_search` 工具**，gpt-5.5 和 gpt-5.4 实测均真实联网、返回带来源引用的最新信息。**默认分组的 KEY 即可使用，无需任何特殊开通。**

```
端点：   POST https://api.apiyi.com/v1/responses
工具：   tools: [{"type": "web_search"}]
模型：   gpt-5.5 / gpt-5.4（实测验证）
```

## 真实可用性（实测数据，2026-06-11）

| 模型      | 联网结果                       | 引用                  | 单次问答搜索次数 | 延迟    |
| ------- | -------------------------- | ------------------- | -------- | ----- |
| gpt-5.4 | ✅ 准确返回当周新闻                 | ✅ 结构化 url\_citation | 1 次      | \~11s |
| gpt-5.5 | ✅ 准确返回当周新闻（自动界定时间窗、多源交叉验证） | ✅ 结构化 url\_citation | \~8 次    | \~51s |

<Tip>
  选型建议：**追求快和省选 gpt-5.4；追求覆盖面和严谨度选 gpt-5.5**（搜索轮次多、检索内容注入大，费用和延迟相应更高，见计费一节）。
</Tip>

## 快速上手

### cURL

```bash theme={null}
curl https://api.apiyi.com/v1/responses \
  -H "content-type: application/json" \
  -H "authorization: Bearer 你的APIYI_KEY" \
  -d '{
    "model": "gpt-5.4",
    "max_output_tokens": 8192,
    "tools": [{"type": "web_search"}],
    "input": "Anthropic 最近一周发布了什么新模型？请搜索并附来源链接"
  }'
```

### Python（OpenAI SDK）

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="你的APIYI_KEY",          # 默认分组即可
    base_url="https://api.apiyi.com/v1",
)

resp = client.responses.create(
    model="gpt-5.4",                  # 或 gpt-5.5
    max_output_tokens=8192,           # 建议 ≥8k；gpt-5.5 推理 token 消耗较多，过小会 incomplete
    tools=[{"type": "web_search"}],
    input="Anthropic 最近一周发布了什么新模型？请搜索并附来源链接",
)

# 1) 最终回答文本
print(resp.output_text)

# 2) 本次实际搜索次数（计费依据，见下文）
search_calls = [item for item in resp.output if item.type == "web_search_call"]
print(f"本次搜索 {len(search_calls)} 次")

# 3) 来源引用（结构化 url_citation）
for item in resp.output:
    if item.type == "message":
        for content in item.content:
            for ann in getattr(content, "annotations", []) or []:
                print(f"来源: {ann.title} | {ann.url}")
```

### 响应结构说明

`output` 数组按执行顺序包含：

| item type         | 含义                                                           |
| ----------------- | ------------------------------------------------------------ |
| `web_search_call` | 一次实际执行的搜索（**计费按此条目数**）                                       |
| `reasoning`       | 模型推理过程（gpt-5 系列）                                             |
| `message`         | 最终回答，其 `content[].annotations` 含 `url_citation`（title + url） |

`status` 为 `completed` 表示正常完成；若为 `incomplete` 通常是 `max_output_tokens` 给小了，调大即可。

## 计费说明（重要）

联网搜索**会收取工具调用费用**，由两部分组成：

| 项目               | 价格                          | 说明                                                                                                        |
| ---------------- | --------------------------- | --------------------------------------------------------------------------------------------------------- |
| **工具调用费**        | **\$10 / 1000 次**（\$0.01/次） | **工具名：`web_search`**；按响应 `output` 中 `web_search_call` 条目数计——一次提问可能触发多次搜索（gpt-5.4 通常 1 次，gpt-5.5 通常 5–8 次） |
| **检索内容 token 费** | 按模型标准 input 价               | 搜索结果会注入模型上下文，按 input token 计费。**这部分往往是大头**：实测 gpt-5.4 单次问答约 9k input token，gpt-5.5 约 48–54k               |

<Info>
  实测单次联网问答总开销参考：gpt-5.4 ≈ \$0.01 搜索费 + 9k token；gpt-5.5 ≈ \$0.08 搜索费 + \~50k token。请按业务问答量预估。
</Info>

## 注意事项

1. **请走 Responses API，不要用 Chat Completions 的 `web_search_options`**：gpt-5 系列模型不支持该参数（OpenAI 官方行为，会返回 400 `Unknown parameter: 'web_search_options'`）。`web_search_options` 仅适用于 `*-search-preview` 专用模型。
2. **`max_output_tokens` 建议 ≥8192**：gpt-5.5 的推理（reasoning）token 消耗较多，上限过小会返回 `status: "incomplete"`，没有最终回答但 token 照常计费。
3. 旧版工具类型 `web_search_preview` 同样可用，行为一致；新接入建议直接用 `web_search`。
4. 如需控制成本，可在提示词中约束搜索行为（如"最多搜索 2 次"），或选用 gpt-5.4。

## FAQ

**Q：怎么确认这次回答真的联网了？**

A：检查响应 `output` 中是否存在 `type="web_search_call"` 的条目，以及 `message` 的 annotations 中是否有 `url_citation`。两者都有即为真实联网；只有正文文字、没有这两个特征的，是模型凭训练数据回答。

**Q：需要换分组或特殊 KEY 吗？**

A：不需要。OpenAI 系列模型使用默认分组的 KEY 即可直接调用联网搜索。

**Q：支持哪些模型？**

A：gpt-5.5、gpt-5.4 已实测验证。其他 gpt-5 系列模型理论上同样支持 Responses API 的 `web_search` 工具，使用前建议按上面 FAQ 的方法做一次验证。

## 相关文档

<CardGroup cols={2}>
  <Card title="OpenAI 原生调用（Responses API）" icon="sparkles" href="/api-capabilities/openai/native">
    Responses API 端点、参数与接入说明
  </Card>

  <Card title="OpenAI 缓存计费" icon="database" href="/api-capabilities/openai/prompt-caching">
    联网搜索注入的大量 input token 可配合缓存降本
  </Card>
</CardGroup>
