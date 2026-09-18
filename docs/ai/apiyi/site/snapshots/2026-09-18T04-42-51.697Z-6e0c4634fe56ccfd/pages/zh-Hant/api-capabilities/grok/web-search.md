> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 聯網搜尋與 X 搜尋使用指南

> Grok 在 API易 的聯網能力實測：Responses API + web_search / x_search 工具真實聯網、返回帶引用的時新結果，X 搜尋是 Grok 獨有的差異化能力，附響應結構與計費說明。

本文說明在 API易 上使用 Grok 模型聯網搜尋（Web Search）與 X 平臺搜尋（X Search）的方法，基於 2026年7月13日 (UTC+8) 實測驗證。

## 一句話結論

**API易 完整支援 Grok 官方 server-side 聯網工具**：使用 **Responses API（`/v1/responses`）+ `web_search` / `x_search` 工具**，`grok-4.5` 實測真實聯網、返回帶來源引用的最新資訊。預設分組的 KEY 直接可用。

```
端點：   POST https://api.apiyi.com/v1/responses
工具：   tools: [{"type": "web_search"}] 或 [{"type": "x_search"}]
模型：   grok-4.5（實測驗證）
```

<Warning>
  **舊入口已下線**：Chat Completions 端點的 `search_parameters` 引數（舊版 Live Search）已被 xAI 移除，實測返回 410。存量程式碼請遷移到 Responses API 工具寫法。
</Warning>

## 真實可用性（實測資料，2026-07-13）

| 工具           | 聯網結果                                       | 單次問答搜尋次數 | 延遲    |
| ------------ | ------------------------------------------ | -------- | ----- |
| `web_search` | ✅ 準確返回當週新聞（正確檢索到 7月8日 Grok 4.5 釋出公告），帶來源引用 | 5 次      | \~12s |
| `x_search`   | ✅ 準確返回 X 平臺指定賬號最新帖子及執行緒內容                  | 24 次     | \~45s |

<Tip>
  **X 搜尋是 Grok 的差異化能力**：可直接檢索 X（推特）平臺的即時帖子、賬號動態與話題討論，這是其他廠商聯網工具覆蓋不到的資訊源。適合輿情監控、熱點追蹤、KOL 動態分析等場景。注意 x\_search 搜尋輪次多、延遲明顯更長（實測約 45 秒），客戶端超時建議設 120 秒以上。
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
    "input": "xAI 最近一週釋出了什麼新聞？請搜尋並附來源連結"
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
    tools=[{"type": "web_search"}],      # X 搜尋改為 {"type": "x_search"}
    input="xAI 最近一週釋出了什麼新聞？請搜尋並附來源連結",
)

# 1) 最終回答
print(resp.output_text)

# 2) 實際搜尋次數
searches = [i for i in resp.output if i.type == "web_search_call"]
print(f"本次搜尋 {len(searches)} 次")

# 3) 工具用量明細（計量自查）
print(resp.usage.server_side_tool_usage_details)
```

### X 搜尋示例

```python theme={null}
resp = client.responses.create(
    model="grok-4.5",
    tools=[{"type": "x_search"}],
    input="在X上搜索 xAI 官方賬號最近的帖子，總結主題",
)
print(resp.output_text)
```

## 響應結構說明

`output` 陣列按執行順序包含：

| item type         | 含義                                |
| ----------------- | --------------------------------- |
| `reasoning`       | 模型推理過程（規劃搜尋策略）                    |
| `web_search_call` | 一次實際執行的 Web 搜尋（`x_search` 對應條目類似） |
| `message`         | 最終回答，正文內嵌來源引用連結                   |

usage 中的 `server_side_tool_usage_details` 逐項給出各工具的實際呼叫次數（`web_search_calls` / `x_search_calls` / `code_interpreter_calls` / `mcp_calls` 等），建議在業務側記錄用於成本核對。

## 計費說明

聯網問答的開銷由兩部分組成：

| 專案               | 說明                                                                                             |
| ---------------- | ---------------------------------------------------------------------------------------------- |
| **檢索內容 token 費** | 搜尋結果注入模型上下文，按模型標準 input 價計費。**這部分是大頭**：實測 web\_search 單次問答約 27K input tokens（其中約 11K 命中快取享折扣價） |
| **工具呼叫費**        | server-side 工具可能按次收取工具呼叫費，以 API易 工具定價與賬單實際扣費為準                                                 |

<Info>
  x\_search 搜尋輪次多（實測單次問答 24 次搜尋），token 注入量與延遲均高於 web\_search，請按業務問答量預估成本。響應 usage 中的搜尋次數與 `cached_tokens` 均可自查。
</Info>

## 注意事項

1. **只走 Responses API**：Chat Completions 的 `search_parameters` 已下線（410），不要再用。
2. **延遲預期**：web\_search 約 12 秒、x\_search 約 45 秒（實測值，隨任務複雜度浮動），客戶端超時建議 ≥ 120 秒。
3. **控制成本**：可在提示詞中約束搜尋行為（如「最多搜尋 2 次」），或在業務側監控 `server_side_tool_usage_details`。
4. **驗證真實聯網**：檢查 `output` 中是否存在 `web_search_call` / 對應搜尋條目——只有正文、沒有搜尋條目的回答是模型憑訓練資料作答。

## 相關文件

<CardGroup cols={2}>
  <Card title="Grok 概覽" icon="rocket" href="/zh-Hant/api-capabilities/grok/overview">
    模型陣容、定價與能力矩陣
  </Card>

  <Card title="程式碼執行與 MCP" icon="terminal" href="/zh-Hant/api-capabilities/grok/code-execution-mcp">
    同為 Responses API 的另外兩大 server-side 工具
  </Card>

  <Card title="快取計費說明" icon="database" href="/zh-Hant/faq/cache-billing">
    聯網注入的大量 input tokens 可配合自動快取降本
  </Card>

  <Card title="OpenAI 聯網搜尋" icon="sparkles" href="/zh-Hant/api-capabilities/openai/web-search">
    GPT 系列的聯網搜尋用法對照
  </Card>
</CardGroup>
