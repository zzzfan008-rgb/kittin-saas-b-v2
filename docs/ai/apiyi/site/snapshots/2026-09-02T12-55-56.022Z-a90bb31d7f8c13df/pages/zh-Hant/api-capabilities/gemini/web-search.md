> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini API 聯網搜尋使用指南

> 原生 generateContent + google_search 工具即可聯網，預設分組 KEY 直接可用，三個 Gemini 模型實測通過；OpenAI 相容模式不支援，附判別方法與計費說明（$14/1K 次）。

本文說明在 API易 上使用 Gemini 系列模型實現聯網搜尋（Grounding with Google Search）的方法，基於 2026年6月 實測驗證（3 模型 × 2 模式 × 多種工具宣告，21 條請求證據）。Gemini 原生格式的基礎接入請先看 [Gemini 原生呼叫](/zh-Hant/api-capabilities/gemini/native)。

## 一句話結論

**API易 Gemini 原生端點完整支援 Google 官方聯網搜尋**：使用 **`/v1beta` generateContent + `google_search` 工具**，gemini-3.5-flash、gemini-3.1-flash-lite、gemini-3.1-pro-preview 實測均真實聯網、返回帶來源引用的最新資訊。**預設分組的 KEY 即可使用，無需任何特殊開通。**

```
端點：   POST https://api.apiyi.com/v1beta/models/{模型名}:generateContent
工具：   tools: [{"google_search": {}}]
模型：   gemini-3.5-flash / gemini-3.1-flash-lite / gemini-3.1-pro-preview（實測驗證）
```

<Warning>
  **OpenAI 相容模式（`/v1/chat/completions`）不支援聯網搜尋**。實測 `web_search_options`、透傳 `google_search`、`tools: [{"type": "web_search"}]` 三種宣告全部返回 HTTP 200 但被靜默忽略——模型只是憑訓練資料回答。請不要以"沒報錯"判斷聯網已生效，判別方法見下文。
</Warning>

## 真實可用性（實測資料，2026-06-11）

| 模型                     | 聯網結果              | groundingMetadata | 單次問答搜尋次數 | 延遲     |
| ---------------------- | ----------------- | ----------------- | -------- | ------ |
| gemini-3.5-flash       | ✅ 當週真實新聞，多查詢交叉檢索  | ✅ 完整              | 4–7 次    | 24–45s |
| gemini-3.1-flash-lite  | ✅ 當週真實新聞          | ✅（偶發缺失，見注意事項）     | 2 次      | \~5s   |
| gemini-3.1-pro-preview | ✅ 當週真實新聞，深思考後精準檢索 | ✅                 | 1 次      | \~45s  |

<Tip>
  選型建議：**對延遲敏感、高頻呼叫選 gemini-3.1-flash-lite（約 5 秒）；追求檢索廣度和答案品質選 gemini-3.5-flash**（多查詢交叉驗證，thinking 消耗大、延遲高，見計費一節）。
</Tip>

## 快速上手

### cURL

```bash theme={null}
curl "https://api.apiyi.com/v1beta/models/gemini-3.5-flash:generateContent" \
  -H "content-type: application/json" \
  -H "x-goog-api-key: 你的APIYI_KEY" \
  -d '{
    "contents": [{"parts": [{"text": "過去一週 AI 領域有什麼重要新聞？請搜尋後列出 3 條並附來源網址。"}]}],
    "generationConfig": {"maxOutputTokens": 4096},
    "tools": [{"google_search": {}}]
  }'
```

### Python（google-genai SDK）

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="你的APIYI_KEY",                      # 預設分組即可
    http_options={"base_url": "https://api.apiyi.com"},  # 注意：不帶 /v1
)

resp = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="過去一週 AI 領域有什麼重要新聞？請搜尋後列出 3 條並附來源網址。",
    config=types.GenerateContentConfig(
        tools=[types.Tool(google_search=types.GoogleSearch())],
        max_output_tokens=4096,
    ),
)

# 1) 最終回答文本
print(resp.text)

# 2) 聯網證據：實際執行的搜尋詞與來源
gm = resp.candidates[0].grounding_metadata
if gm:
    print("搜尋詞:", gm.web_search_queries)
    for chunk in gm.grounding_chunks or []:
        print("來源:", chunk.web.title, chunk.web.uri)
else:
    print("⚠️ 本次未觸發聯網搜尋")
```

### 怎麼確認搜尋真的執行了

成功聯網時，響應 `candidates[0].groundingMetadata` 包含以下欄位；**沒有這些欄位就是沒搜**：

| 欄位                  | 含義                                  |
| ------------------- | ----------------------------------- |
| `webSearchQueries`  | 模型實際執行的搜尋詞陣列（陣列長度 = 搜尋次數）           |
| `groundingChunks`   | 檢索到的來源（URI + 標題）                    |
| `groundingSupports` | 回答正文片段與來源的對應關係（startIndex/endIndex） |
| `searchEntryPoint`  | 渲染 Google 搜尋建議所需的 HTML/CSS          |

對照參考：同一問題不帶工具時，模型一致回答"知識截止 2025年1月，無法提供最新資訊"；帶工具後準確給出訓練截止之後發生的真實事件。

## 計費說明（重要）

聯網搜尋**會收取工具呼叫費用**，由兩部分組成：

| 專案             | 價格                           | 說明                                                                                                                                                                          |
| -------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **工具呼叫費**      | **\$14 / 1000 次**（\$0.014/次） | **工具名：`google_search`**；按實際執行的搜尋次數計費，即 `groundingMetadata.webSearchQueries` 陣列長度——一次提問可能觸發多次搜尋（實測 pro-preview 1 次、flash-lite 2 次、3.5-flash 4–7 次）                           |
| **模型 token 費** | 按模型標準價                       | 與 OpenAI 聯網不同，**檢索內容不注入 input token**（實測聯網前後 promptTokenCount 幾乎不變，31–43 token）；大頭是 **thinking + output token**（3.5-flash 一次深度聯網問答消耗 thoughts 3500–4900 token，按 output 價計費） |

<Info>
  單次聯網問答總開銷參考（搜尋費 + token 費）：flash-lite ≈ \$0.03；3.5-flash ≈ \$0.08–0.16；3.1-pro-preview ≈ \$0.06。如需控制成本，可在提示詞中約束搜尋行為（如"最多搜尋 2 次"），或選用搜索次數少的模型。
</Info>

<Tip>
  **可能享受免費減免**：Gemini API 官方為聯網搜尋提供一定免費配額（Gemini 3 系列每月 5,000 條提示免費，超出後按 \$14/1K 次計）。上游命中免費配額時，該次搜尋費可獲減免（實測出現過整次未扣搜尋費的情況）；有扣費則按上表價格正常計費。實際以控制台計費明細為準。
</Tip>

## 注意事項

1. **必須走原生端點**：OpenAI 相容模式的所有搜尋宣告都被靜默忽略且不報錯。用 OpenAI SDK 的專案改用 google-genai SDK（`base_url` 設為 `https://api.apiyi.com`，不帶 `/v1`）即可。
2. **以 groundingMetadata 為準判斷聯網**：實測 flash-lite 偶發（4 次中 1 次）不返回 groundingMetadata。嚴格場景請校驗該欄位存在性，缺失時重試。
3. **思考型模型給足 `maxOutputTokens`**（建議 ≥4096）：3.5-flash / 3.1-pro-preview 聯網時 thinking 消耗 1900–4900 token，上限過小會截斷回答。
4. 工具宣告 `{"google_search": {}}` 與 camelCase `{"googleSearch": {}}` 均可用；舊版 `google_search_retrieval` 是 Gemini 1.5 時代的工具，當前模型一律用 `google_search`。
5. 聯網搜尋可與 URL Context 等工具組合使用（Google 官方文件：`ai.google.dev/gemini-api/docs/google-search`）。

## FAQ

**Q：怎麼確認這次回答真的聯網了？**

A：檢查 `candidates[0].groundingMetadata` 是否存在、`webSearchQueries` 是否非空、`groundingChunks` 是否包含來源 URI。只有正文、沒有這些欄位的，是模型憑訓練資料回答。

**Q：需要換分組或特殊 KEY 嗎？**

A：不需要。Gemini 系列模型使用預設分組的 KEY 即可直接呼叫聯網搜尋（與 OpenAI 聯網搜尋一致；區別於 Claude 原生搜尋需要 ClaudeOfficial 內測分組）。

**Q：搜尋次數怎麼看、不同模型差異大嗎？**

A：數 `groundingMetadata.webSearchQueries` 陣列長度。同一問題實測差異很大：pro-preview 1 次、flash-lite 2 次、3.5-flash 4–7 次。

**Q：支援哪些模型？**

A：gemini-3.5-flash、gemini-3.1-flash-lite、gemini-3.1-pro-preview 已實測驗證。其他 Gemini 2.5+ 模型理論上同樣支援 `google_search` 工具，使用前建議按上面 FAQ 的方法做一次驗證。

## 相關文件

<CardGroup cols={2}>
  <Card title="Gemini 原生呼叫" icon="sparkles" href="/zh-Hant/api-capabilities/gemini/native">
    google-genai SDK 配置、流式輸出、thinking 控制
  </Card>

  <Card title="Gemini Function Calling" icon="wrench" href="/zh-Hant/api-capabilities/gemini/function-calling">
    自定義工具呼叫，可與聯網搜尋組合使用
  </Card>
</CardGroup>
