> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI API 聯網搜尋使用指南

> Responses API + web_search 工具即可聯網，預設分組 KEY 直接可用。gpt-5.5 / gpt-5.4 實測真實聯網、返回帶來源引用，附計費說明。

本文說明在 API易 上使用 GPT 系列模型實現聯網搜尋的方法，基於 2026年6月 實測驗證。

## 一句話結論

**API易 完整支援 OpenAI 官方聯網搜尋**：使用 **Responses API（`/v1/responses`）+ `web_search` 工具**，gpt-5.5 和 gpt-5.4 實測均真實聯網、返回帶來源引用的最新資訊。**預設分組的 KEY 即可使用，無需任何特殊開通。**

```
端點：   POST https://api.apiyi.com/v1/responses
工具：   tools: [{"type": "web_search"}]
模型：   gpt-5.5 / gpt-5.4（實測驗證）
```

## 真實可用性（實測資料，2026-06-11）

| 模型      | 聯網結果                       | 引用                  | 單次問答搜尋次數 | 延遲    |
| ------- | -------------------------- | ------------------- | -------- | ----- |
| gpt-5.4 | ✅ 準確返回當週新聞                 | ✅ 結構化 url\_citation | 1 次      | \~11s |
| gpt-5.5 | ✅ 準確返回當週新聞（自動界定時間窗、多源交叉驗證） | ✅ 結構化 url\_citation | \~8 次    | \~51s |

<Tip>
  選型建議：**追求快和省選 gpt-5.4；追求覆蓋面和嚴謹度選 gpt-5.5**（搜尋輪次多、檢索內容注入大，費用和延遲相應更高，見計費一節）。
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
    "input": "Anthropic 最近一週釋出了什麼新模型？請搜尋並附來源連結"
  }'
```

### Python（OpenAI SDK）

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="你的APIYI_KEY",          # 預設分組即可
    base_url="https://api.apiyi.com/v1",
)

resp = client.responses.create(
    model="gpt-5.4",                  # 或 gpt-5.5
    max_output_tokens=8192,           # 建議 ≥8k；gpt-5.5 推理 token 消耗較多，過小會 incomplete
    tools=[{"type": "web_search"}],
    input="Anthropic 最近一週釋出了什麼新模型？請搜尋並附來源連結",
)

# 1) 最終回答文本
print(resp.output_text)

# 2) 本次實際搜尋次數（計費依據，見下文）
search_calls = [item for item in resp.output if item.type == "web_search_call"]
print(f"本次搜尋 {len(search_calls)} 次")

# 3) 來源引用（結構化 url_citation）
for item in resp.output:
    if item.type == "message":
        for content in item.content:
            for ann in getattr(content, "annotations", []) or []:
                print(f"來源: {ann.title} | {ann.url}")
```

### 響應結構說明

`output` 陣列按執行順序包含：

| item type         | 含義                                                           |
| ----------------- | ------------------------------------------------------------ |
| `web_search_call` | 一次實際執行的搜尋（**計費按此條目數**）                                       |
| `reasoning`       | 模型推理過程（gpt-5 系列）                                             |
| `message`         | 最終回答，其 `content[].annotations` 含 `url_citation`（title + url） |

`status` 為 `completed` 表示正常完成；若為 `incomplete` 通常是 `max_output_tokens` 給小了，調大即可。

## 計費說明（重要）

聯網搜尋**會收取工具呼叫費用**，由兩部分組成：

| 專案               | 價格                          | 說明                                                                                                        |
| ---------------- | --------------------------- | --------------------------------------------------------------------------------------------------------- |
| **工具呼叫費**        | **\$10 / 1000 次**（\$0.01/次） | **工具名：`web_search`**；按響應 `output` 中 `web_search_call` 條目數計——一次提問可能觸發多次搜尋（gpt-5.4 通常 1 次，gpt-5.5 通常 5–8 次） |
| **檢索內容 token 費** | 按模型標準 input 價               | 搜尋結果會注入模型上下文，按 input token 計費。**這部分往往是大頭**：實測 gpt-5.4 單次問答約 9k input token，gpt-5.5 約 48–54k               |

<Info>
  實測單次聯網問答總開銷參考：gpt-5.4 ≈ \$0.01 搜尋費 + 9k token；gpt-5.5 ≈ \$0.08 搜尋費 + \~50k token。請按業務問答量預估。
</Info>

## 注意事項

1. **請走 Responses API，不要用 Chat Completions 的 `web_search_options`**：gpt-5 系列模型不支援該引數（OpenAI 官方行為，會返回 400 `Unknown parameter: 'web_search_options'`）。`web_search_options` 僅適用於 `*-search-preview` 專用模型。
2. **`max_output_tokens` 建議 ≥8192**：gpt-5.5 的推理（reasoning）token 消耗較多，上限過小會返回 `status: "incomplete"`，沒有最終回答但 token 照常計費。
3. 舊版工具型別 `web_search_preview` 同樣可用，行為一致；新接入建議直接用 `web_search`。
4. 如需控制成本，可在提示詞中約束搜尋行為（如"最多搜尋 2 次"），或選用 gpt-5.4。

## FAQ

**Q：怎麼確認這次回答真的聯網了？**

A：檢查響應 `output` 中是否存在 `type="web_search_call"` 的條目，以及 `message` 的 annotations 中是否有 `url_citation`。兩者都有即為真實聯網；只有正文文字、沒有這兩個特徵的，是模型憑訓練資料回答。

**Q：需要換分組或特殊 KEY 嗎？**

A：不需要。OpenAI 系列模型使用預設分組的 KEY 即可直接呼叫聯網搜尋。

**Q：支援哪些模型？**

A：gpt-5.5、gpt-5.4 已實測驗證。其他 gpt-5 系列模型理論上同樣支援 Responses API 的 `web_search` 工具，使用前建議按上面 FAQ 的方法做一次驗證。

## 相關文件

<CardGroup cols={2}>
  <Card title="OpenAI 原生呼叫（Responses API）" icon="sparkles" href="/zh-Hant/api-capabilities/openai/native">
    Responses API 端點、引數與接入說明
  </Card>

  <Card title="OpenAI 快取計費" icon="database" href="/zh-Hant/api-capabilities/openai/prompt-caching">
    聯網搜尋注入的大量 input token 可配合快取降本
  </Card>
</CardGroup>
