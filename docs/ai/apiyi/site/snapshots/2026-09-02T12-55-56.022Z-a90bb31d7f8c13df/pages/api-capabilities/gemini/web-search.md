> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini API 联网搜索使用指南

> 原生 generateContent + google_search 工具即可联网，默认分组 KEY 直接可用，三个 Gemini 模型实测通过；OpenAI 兼容模式不支持，附判别方法与计费说明（$14/1K 次）。

本文说明在 API易 上使用 Gemini 系列模型实现联网搜索（Grounding with Google Search）的方法，基于 2026年6月 实测验证（3 模型 × 2 模式 × 多种工具声明，21 条请求证据）。Gemini 原生格式的基础接入请先看 [Gemini 原生调用](/api-capabilities/gemini/native)。

## 一句话结论

**API易 Gemini 原生端点完整支持 Google 官方联网搜索**：使用 **`/v1beta` generateContent + `google_search` 工具**，gemini-3.5-flash、gemini-3.1-flash-lite、gemini-3.1-pro-preview 实测均真实联网、返回带来源引用的最新信息。**默认分组的 KEY 即可使用，无需任何特殊开通。**

```
端点：   POST https://api.apiyi.com/v1beta/models/{模型名}:generateContent
工具：   tools: [{"google_search": {}}]
模型：   gemini-3.5-flash / gemini-3.1-flash-lite / gemini-3.1-pro-preview（实测验证）
```

<Warning>
  **OpenAI 兼容模式（`/v1/chat/completions`）不支持联网搜索**。实测 `web_search_options`、透传 `google_search`、`tools: [{"type": "web_search"}]` 三种声明全部返回 HTTP 200 但被静默忽略——模型只是凭训练数据回答。请不要以"没报错"判断联网已生效，判别方法见下文。
</Warning>

## 真实可用性（实测数据，2026-06-11）

| 模型                     | 联网结果              | groundingMetadata | 单次问答搜索次数 | 延迟     |
| ---------------------- | ----------------- | ----------------- | -------- | ------ |
| gemini-3.5-flash       | ✅ 当周真实新闻，多查询交叉检索  | ✅ 完整              | 4–7 次    | 24–45s |
| gemini-3.1-flash-lite  | ✅ 当周真实新闻          | ✅（偶发缺失，见注意事项）     | 2 次      | \~5s   |
| gemini-3.1-pro-preview | ✅ 当周真实新闻，深思考后精准检索 | ✅                 | 1 次      | \~45s  |

<Tip>
  选型建议：**对延迟敏感、高频调用选 gemini-3.1-flash-lite（约 5 秒）；追求检索广度和答案质量选 gemini-3.5-flash**（多查询交叉验证，thinking 消耗大、延迟高，见计费一节）。
</Tip>

## 快速上手

### cURL

```bash theme={null}
curl "https://api.apiyi.com/v1beta/models/gemini-3.5-flash:generateContent" \
  -H "content-type: application/json" \
  -H "x-goog-api-key: 你的APIYI_KEY" \
  -d '{
    "contents": [{"parts": [{"text": "过去一周 AI 领域有什么重要新闻？请搜索后列出 3 条并附来源网址。"}]}],
    "generationConfig": {"maxOutputTokens": 4096},
    "tools": [{"google_search": {}}]
  }'
```

### Python（google-genai SDK）

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="你的APIYI_KEY",                      # 默认分组即可
    http_options={"base_url": "https://api.apiyi.com"},  # 注意：不带 /v1
)

resp = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="过去一周 AI 领域有什么重要新闻？请搜索后列出 3 条并附来源网址。",
    config=types.GenerateContentConfig(
        tools=[types.Tool(google_search=types.GoogleSearch())],
        max_output_tokens=4096,
    ),
)

# 1) 最终回答文本
print(resp.text)

# 2) 联网证据：实际执行的搜索词与来源
gm = resp.candidates[0].grounding_metadata
if gm:
    print("搜索词:", gm.web_search_queries)
    for chunk in gm.grounding_chunks or []:
        print("来源:", chunk.web.title, chunk.web.uri)
else:
    print("⚠️ 本次未触发联网搜索")
```

### 怎么确认搜索真的执行了

成功联网时，响应 `candidates[0].groundingMetadata` 包含以下字段；**没有这些字段就是没搜**：

| 字段                  | 含义                                  |
| ------------------- | ----------------------------------- |
| `webSearchQueries`  | 模型实际执行的搜索词数组（数组长度 = 搜索次数）           |
| `groundingChunks`   | 检索到的来源（URI + 标题）                    |
| `groundingSupports` | 回答正文片段与来源的对应关系（startIndex/endIndex） |
| `searchEntryPoint`  | 渲染 Google 搜索建议所需的 HTML/CSS          |

对照参考：同一问题不带工具时，模型一致回答"知识截止 2025年1月，无法提供最新信息"；带工具后准确给出训练截止之后发生的真实事件。

## 计费说明（重要）

联网搜索**会收取工具调用费用**，由两部分组成：

| 项目             | 价格                           | 说明                                                                                                                                                                          |
| -------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **工具调用费**      | **\$14 / 1000 次**（\$0.014/次） | **工具名：`google_search`**；按实际执行的搜索次数计费，即 `groundingMetadata.webSearchQueries` 数组长度——一次提问可能触发多次搜索（实测 pro-preview 1 次、flash-lite 2 次、3.5-flash 4–7 次）                           |
| **模型 token 费** | 按模型标准价                       | 与 OpenAI 联网不同，**检索内容不注入 input token**（实测联网前后 promptTokenCount 几乎不变，31–43 token）；大头是 **thinking + output token**（3.5-flash 一次深度联网问答消耗 thoughts 3500–4900 token，按 output 价计费） |

<Info>
  单次联网问答总开销参考（搜索费 + token 费）：flash-lite ≈ \$0.03；3.5-flash ≈ \$0.08–0.16；3.1-pro-preview ≈ \$0.06。如需控制成本，可在提示词中约束搜索行为（如"最多搜索 2 次"），或选用搜索次数少的模型。
</Info>

<Tip>
  **可能享受免费减免**：Gemini API 官方为联网搜索提供一定免费配额（Gemini 3 系列每月 5,000 条提示免费，超出后按 \$14/1K 次计）。上游命中免费配额时，该次搜索费可获减免（实测出现过整次未扣搜索费的情况）；有扣费则按上表价格正常计费。实际以控制台计费明细为准。
</Tip>

## 注意事项

1. **必须走原生端点**：OpenAI 兼容模式的所有搜索声明都被静默忽略且不报错。用 OpenAI SDK 的项目改用 google-genai SDK（`base_url` 设为 `https://api.apiyi.com`，不带 `/v1`）即可。
2. **以 groundingMetadata 为准判断联网**：实测 flash-lite 偶发（4 次中 1 次）不返回 groundingMetadata。严格场景请校验该字段存在性，缺失时重试。
3. **思考型模型给足 `maxOutputTokens`**（建议 ≥4096）：3.5-flash / 3.1-pro-preview 联网时 thinking 消耗 1900–4900 token，上限过小会截断回答。
4. 工具声明 `{"google_search": {}}` 与 camelCase `{"googleSearch": {}}` 均可用；旧版 `google_search_retrieval` 是 Gemini 1.5 时代的工具，当前模型一律用 `google_search`。
5. 联网搜索可与 URL Context 等工具组合使用（Google 官方文档：`ai.google.dev/gemini-api/docs/google-search`）。

## FAQ

**Q：怎么确认这次回答真的联网了？**

A：检查 `candidates[0].groundingMetadata` 是否存在、`webSearchQueries` 是否非空、`groundingChunks` 是否包含来源 URI。只有正文、没有这些字段的，是模型凭训练数据回答。

**Q：需要换分组或特殊 KEY 吗？**

A：不需要。Gemini 系列模型使用默认分组的 KEY 即可直接调用联网搜索（与 OpenAI 联网搜索一致；区别于 Claude 原生搜索需要 ClaudeOfficial 内测分组）。

**Q：搜索次数怎么看、不同模型差异大吗？**

A：数 `groundingMetadata.webSearchQueries` 数组长度。同一问题实测差异很大：pro-preview 1 次、flash-lite 2 次、3.5-flash 4–7 次。

**Q：支持哪些模型？**

A：gemini-3.5-flash、gemini-3.1-flash-lite、gemini-3.1-pro-preview 已实测验证。其他 Gemini 2.5+ 模型理论上同样支持 `google_search` 工具，使用前建议按上面 FAQ 的方法做一次验证。

## 相关文档

<CardGroup cols={2}>
  <Card title="Gemini 原生调用" icon="sparkles" href="/api-capabilities/gemini/native">
    google-genai SDK 配置、流式输出、thinking 控制
  </Card>

  <Card title="Gemini Function Calling" icon="wrench" href="/api-capabilities/gemini/function-calling">
    自定义工具调用，可与联网搜索组合使用
  </Card>
</CardGroup>
