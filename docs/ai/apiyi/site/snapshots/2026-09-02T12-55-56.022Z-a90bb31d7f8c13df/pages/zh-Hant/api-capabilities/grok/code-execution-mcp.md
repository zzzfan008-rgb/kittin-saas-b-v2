> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 程式碼執行與 Remote MCP 使用指南

> Grok 在 API易 的 code_interpreter 服務端程式碼執行與 Remote MCP 工具實測：Python 沙箱真實執行、外部 MCP server 成功連通，附呼叫示例與響應結構。

除聯網搜尋外，Grok 的 Responses API 還提供兩類 server-side 工具：**程式碼執行**（`code_interpreter`，服務端 Python 沙箱）與 **Remote MCP**（讓 xAI 服務端直連你指定的 MCP server）。兩者在 API易 上均實測可用（2026年7月13日 (UTC+8)），預設分組 KEY 直接呼叫。

## 程式碼執行（Code Execution）

模型自動編寫 Python 程式碼並在 xAI 服務端沙箱中真實執行，適合精確計算、資料處理等場景。實測讓模型計算 2 的 100 次方，模型執行 `print(2 ** 100)` 後返回了精確值（大整數運算，純語言模型極易算錯，程式碼執行則完全精確）：

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
)

resp = client.responses.create(
    model="grok-4.5",
    tools=[{"type": "code_interpreter"}],
    input="用程式碼計算 2 的 100 次方，給出精確值",
)
print(resp.output_text)
# 2^100 = 1267650600228229401496703205376

# 檢視模型實際執行的程式碼
for item in resp.output:
    if item.type == "code_interpreter_call":
        print("執行的程式碼:", item.code)
```

實測單次程式碼執行任務延遲約 6 秒。usage 的 `server_side_tool_usage_details.code_interpreter_calls` 記錄執行次數。

## Remote MCP 工具

在請求中宣告外部 MCP server，xAI 服務端會自動連線、列出其工具並按需呼叫——你無需在本地跑任何 MCP 客戶端。實測成功連通公開 MCP server 並完成工具呼叫（延遲約 16 秒）：

```python theme={null}
resp = client.responses.create(
    model="grok-4.5",
    tools=[{
        "type": "mcp",
        "server_label": "deepwiki",
        "server_url": "https://mcp.deepwiki.com/mcp",
        "require_approval": "never"
    }],
    input="使用 deepwiki 查詢 openai/openai-python 倉庫是做什麼的，一句話",
)
print(resp.output_text)

# 檢視 MCP 呼叫明細
for item in resp.output:
    if item.type == "mcp_call":
        print("工具:", item.name, "| 輸出:", item.output[:200])
```

| 引數                 | 說明                               |
| ------------------ | -------------------------------- |
| `server_label`     | 自定義標籤，用於區分多個 MCP server          |
| `server_url`       | MCP server 地址（需公網可達，xAI 服務端直連）   |
| `require_approval` | `"never"` 為自動呼叫；預設會返回審批請求，需要二次確認 |

<Warning>
  * **MCP server 必須公網可達**：連線由 xAI 服務端發起，內網 / localhost 地址不可用。
  * **注意資料安全**：你的對話內容會經 xAI 服務端傳送到該 MCP server，請只接入可信服務。
  * 外部 server 的可用性不受 API易 控制，呼叫失敗時請先自查 server 狀態。
</Warning>

## Collections Search（RAG）不可用

xAI 官方還有一個 `collections_search`（知識庫檢索 / file\_search）工具，**在 API易 上不適用**：它依賴在 xAI 控制台預先上傳檔案並建立知識庫，而 API易 為號池模式、使用者無法訪問上游控制台。實測請求可透傳但檢索必然失敗（`file_search_call` 返回 failed）。

需要 RAG 場景請在業務側自建檢索（向量庫 + 把召回內容拼入 prompt），配合 Grok 的 1M 上下文與 [自動快取](/zh-Hant/faq/cache-billing) 使用。

## 常見問題

<AccordionGroup>
  <Accordion title="可以同時宣告多個工具嗎？">
    可以。`tools` 陣列可同時包含 `web_search` / `x_search` / `code_interpreter` / `mcp`，模型按任務自行決定呼叫哪個。usage 的 `server_side_tool_usage_details` 會分項計數。
  </Accordion>

  <Accordion title="程式碼沙箱能聯網或讀檔案嗎？">
    沙箱面向計算場景（Python 運算 / 資料處理），不能訪問你的本地檔案；需要外部資料請配合 web\_search 或 MCP 工具。
  </Accordion>

  <Accordion title="工具執行失敗會計費嗎？">
    模型推理消耗的 tokens 正常計費。工具本身的呼叫費以 API易 工具定價與賬單實際扣費為準，建議開發期先小量驗證再放量。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="聯網搜尋與 X 搜尋" icon="globe" href="/zh-Hant/api-capabilities/grok/web-search">
    同為 Responses API 的聯網類工具
  </Card>

  <Card title="Grok 概覽" icon="rocket" href="/zh-Hant/api-capabilities/grok/overview">
    模型陣容、定價與能力邊界總表
  </Card>
</CardGroup>
