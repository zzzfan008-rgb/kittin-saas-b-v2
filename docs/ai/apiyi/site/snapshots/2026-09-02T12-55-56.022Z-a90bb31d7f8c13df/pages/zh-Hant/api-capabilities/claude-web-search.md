> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude API 聯網搜尋實現指南

> 預設分組（AWS Claude）不支援原生 web_search 工具，本文給出兩條實測可行的聯網方案：ClaudeOfficial 內測分組與自定義搜尋工具。

本文說明在 API易 上使用 Claude 系列模型實現聯網搜尋的兩條路徑，基於 2026年6月 實測驗證。基礎的通道、計費與接入資訊請先看 [Claude API 基礎說明](/zh-Hant/api-capabilities/claude)。

## 一句話結論

**API易 Claude 系列預設分組為 AWS Claude 官方直轉（Amazon Bedrock），AWS 原廠不支援 Claude 原生聯網搜尋**——這是 Bedrock 的架構限制，不是中轉配置問題。如需聯網，您有兩條路：

| 路徑                                              | 適用場景                           | 穩定性          |
| ----------------------------------------------- | ------------------------------ | ------------ |
| **方式一：ClaudeOfficial 內測分組**（原生 `web_search` 工具） | 強烈需要 Anthropic 原生搜尋體驗、可接受內測穩定性 | ⚠️ 內測，不如預設分組 |
| **方式二：自定義搜尋工具**（預設分組即可用，推薦）                     | 生產環境、需要穩定可控                    | ✅ 與預設分組同級    |

<Warning>
  **容易踩的坑**：在預設分組帶上 `web_search` 工具發請求，**不會報錯**——閘道會相容處理，請求正常返回 HTTP 200，但搜尋沒有發生，模型只是憑訓練資料回答。請不要以"沒報錯"判斷聯網已生效，判斷方法見文末 FAQ。
</Warning>

## 為什麼預設分組不支援？

Claude 的 `web_search` / `web_fetch` 屬於 **server-side tools**：搜尋動作由 Anthropic 自己的服務端基礎設施執行。AWS Bedrock 只提供模型推理，沒有這套搜尋後端，因此 Bedrock 介面在校驗層就會拒絕這類工具。Bedrock 支援的工具型別白名單僅包含 client-side 工具：

```
bash_20250124, custom, memory_20250818, text_editor_*(20250124/0429/0728),
tool_search_tool_bm25(_20251119), tool_search_tool_regex(_20251119)
```

同理，Anthropic 的 **MCP Connector（`mcp_servers` 引數）也屬於服務端功能，預設分組不支援**。

## 方式一：ClaudeOfficial 內測分組（原生 web\_search）

API易 提供一個內測分組 **ClaudeOfficial**（Anthropic 官方渠道直連），支援 Claude 原生 `web_search` / `web_fetch` 工具。

<Info>
  * **開通方式：聯絡客服對接**，將您的 key 加入 ClaudeOfficial 分組
  * **穩定性提示**：內測分組，穩定性不如預設分組，重要業務請做好降級（可降級到方式二）
</Info>

### 請求示例

```bash theme={null}
curl https://api.apiyi.com/v1/messages \
  -H "content-type: application/json" \
  -H "x-api-key: 你的APIYI_KEY(ClaudeOfficial分組)" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 2048,
    "tools": [{"type": "web_search_20260209", "name": "web_search"}],
    "messages": [{"role": "user", "content": "Anthropic 最近釋出了什麼新模型？請搜尋並給出來源"}]
  }'
```

工具版本說明：

| 工具             | type                                          | 說明            |
| -------------- | --------------------------------------------- | ------------- |
| Web Search（推薦） | `web_search_20260209`                         | 帶動態過濾，4.6+ 模型 |
| Web Search（基礎） | `web_search_20250305`                         | 相容更早模型        |
| Web Fetch      | `web_fetch_20260209`（舊版 `web_fetch_20250910`） | 抓取指定 URL 內容   |

可選引數：`max_uses`（限制搜尋次數）、`allowed_domains` / `blocked_domains`（域名過濾）。

### 怎麼確認搜尋真的執行了

成功響應的 `content` 中會出現 `server_tool_use` 和 `web_search_tool_result` 塊，正文帶引用；`usage` 中出現計次欄位：

```json theme={null}
"usage": {
  "server_tool_use": { "web_search_requests": 2 }
}
```

若響應只有 `text` 塊、`usage` 裡沒有 `server_tool_use`，說明這條請求沒有走到支援搜尋的渠道。

### 計費

* **工具名：`web_search`、`web_fetch`**
* web\_search：**\$10 / 1000 次搜尋**（\$0.01/次，按 `usage.server_tool_use.web_search_requests` 計次——一次回答可能觸發多次搜尋）+ 正常 token 費；失敗的搜尋不計費
* web\_fetch：不額外按次收費，抓取內容按 input token 計費
* 單次聯網問答參考成本（sonnet）：約 \$0.02–0.08

## 方式二：自定義搜尋工具（預設分組可用，推薦生產使用）

預設分組（Bedrock）**完整支援標準 function calling（custom tools）**。您只需定義一個搜尋工具，由您的客戶端執行實際搜尋（接 Tavily / Brave / Serper / Bing 等搜尋 API），把結果回傳給模型。實測 Claude 會主動呼叫、自動改寫中英文查詢詞、多輪搜尋後給出帶來源的回答。

### 完整示例（Python）

```python theme={null}
import requests

API_KEY = "你的APIYI_KEY"  # 預設分組即可
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
        "properties": {"query": {"type": "string", "description": "搜尋關鍵詞"}},
        "required": ["query"],
    },
}

def do_search(query: str) -> str:
    """接您選用的搜尋 API（Tavily/Brave/Serper 等），返回結果文本。"""
    # 以 Tavily 為例：
    # r = requests.post("https://api.tavily.com/search",
    #                   json={"api_key": TAVILY_KEY, "query": query, "max_results": 5})
    # return "\n".join(f"- {x['title']}\n  {x['url']}\n  {x['content'][:200]}"
    #                  for x in r.json()["results"])
    ...

messages = [{"role": "user", "content": "Anthropic 最近釋出了什麼新模型？請搜尋後回答並附來源"}]

for _ in range(5):  # 工具迴圈，最多 5 輪
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

### 成本參考

* 模型 token 費：一次多輪搜尋問答約 1 萬 input + 1–2 千 output token（sonnet 約 \$0.05）
* 搜尋 API 費：Tavily 免費檔 1000 次/月（付費約 \$0.008/次）、Brave \$3/1000 次——與官方 web\_search 同量級
* 優勢：渠道無關、搜尋源可控可快取、保留預設分組的穩定性與快取計費優勢

### 進階：MCP 搜尋源

若您已有 MCP 生態（如 Tavily MCP、Brave MCP），可在**客戶端**連線 MCP server，把其工具轉換成上面的 custom tools 傳給模型——原理完全相同。注意：直接在請求裡傳 `mcp_servers` 引數（服務端 MCP）在預設分組**不可用**。

## FAQ

**Q：我在預設分組帶了 web\_search 工具，沒報錯，是不是就支援了？**

A：不是。預設分組對 server tools 做相容處理（忽略），請求返回 200 但搜尋未發生。判斷方法：看響應 `content` 是否有 `server_tool_use` 塊、`usage` 是否有 `server_tool_use.web_search_requests` 欄位——沒有就是沒執行。

**Q：傳 `mcp_servers` 引數呢？**

A：同樣不支援（也是 Anthropic 服務端功能）。特別提醒：這種情況下模型可能在正文中生成看似真實的"工具呼叫結果"文本，那是模型的幻覺，並非真實資料，請勿採信。

**Q：兩種方式怎麼選？**

A：生產環境優先方式二（穩定、可控）；需要 Anthropic 原生搜尋品質、引用格式（citations）或不想自建搜尋的，聯絡客服開通 ClaudeOfficial 內測分組，並準備好降級方案。

## 相關文件

<CardGroup cols={2}>
  <Card title="Claude API 基礎說明" icon="sparkles" href="/zh-Hant/api-capabilities/claude">
    通道說明、模型列表、接入與計費基礎資訊
  </Card>

  <Card title="Claude 快取計費" icon="database" href="/zh-Hant/api-capabilities/claude-prompt-caching">
    多輪搜尋問答場景配合快取可顯著降本
  </Card>
</CardGroup>
