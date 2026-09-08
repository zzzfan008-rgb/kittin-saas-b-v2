> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 原生工具出圖

> 用 OpenAI Responses API 的原生 image_generation 工具讓模型自主出圖，gpt-5.5 觸發、base64 回傳，含工具呼叫計費說明。

## 概述

除了獨立的 [文生圖](/zh-Hant/api-capabilities/gpt-image-2/text-to-image) / [圖片編輯](/zh-Hant/api-capabilities/gpt-image-2/image-edit) 端點外，API易 還支援 **OpenAI Responses API 的原生 `image_generation` 工具**：由主線模型 `gpt-5.5` 在對話中自主決定何時畫圖，內部自動選用 GPT Image 模型，圖片以 **base64** 形式回傳在響應的 `output` 數組裡。

<Note>
  **實測可用（2026-06-17）**：`gpt-5.5` + `POST /v1/responses` + `tools: [{"type": "image_generation"}]`，返回合法 base64 PNG。兩條出圖鏈路均走 OpenAI 官網直轉。
</Note>

<Info>
  **怎麼選？** 絕大部分「我就是要張圖」的場景，請優先用獨立端點 [`/v1/images/generations`](/zh-Hant/api-capabilities/gpt-image-2/text-to-image)——只按實際用量計費，更划算也更可控。**僅當你的鏈路必須走 Responses**（例如讓 `gpt-5.5` 在 Agent 對話中自主決定是否畫圖）時，才用本頁的原生工具方式——它每次出圖額外固定收一筆約 \$0.20 的工具呼叫費。
</Info>

## 兩種出圖方式對比

| 對比項      | 原生工具方式（本頁）                            | images API                                  |
| -------- | ------------------------------------- | ------------------------------------------- |
| **渠道來源** | OpenAI 官網直轉                           | OpenAI 官網直轉                                 |
| **呼叫端點** | `/v1/responses`                       | `/v1/images/generations`、`/v1/images/edits` |
| **呼叫工具** | `image_generation`                    | 無（直接傳 prompt）                               |
| **計費方式** | 按量計費 **+ 工具呼叫費**                      | 按量計費                                        |
| **計費明細** | 文本/圖片輸入輸出費用官網同價；**工具呼叫費固定約 \$0.20/次** | 文本/圖片輸入輸出費用官網同價                             |
| **適合場景** | 必須用 Responses 的場景（如 Agent 自主決策）       | **絕大部分出圖場景**，計費更合理                          |

> 根本差異：**原生工具方式每次出圖額外固定約 \$0.20 工具費**；images API 只按實際用量計費，所以多數場景更划算。

## 最簡呼叫

### cURL

```bash theme={null}
curl https://api.apiyi.com/v1/responses \
  -H "Authorization: Bearer $APIYI_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "input": "Generate an image of a gray tabby cat hugging an otter with an orange scarf",
    "tools": [
      { "type": "image_generation" }
    ]
  }'
```

### Python（requests）

```python theme={null}
import base64, requests

resp = requests.post(
    "https://api.apiyi.com/v1/responses",
    headers={
        "Authorization": "Bearer $APIYI_KEY",
        "Content-Type": "application/json",
    },
    json={
        "model": "gpt-5.5",
        "input": "Generate an image of a gray tabby cat hugging an otter with an orange scarf",
        "tools": [{"type": "image_generation"}],
    },
    timeout=300,           # 出圖慢，務必給足超時（單張約 60~90s）
)
data = resp.json()

# 從 output 數組裡取出圖片工具的結果
for item in data["output"]:
    if item.get("type") == "image_generation_call":
        raw = base64.b64decode(item["result"])   # result 欄位是 base64 圖
        with open("output.png", "wb") as f:
            f.write(raw)
        print("已儲存 output.png,", len(raw), "bytes")
```

<Tip>
  可選引數放進 `tools` 項裡：`{"type": "image_generation", "output_format": "png|jpeg|webp", "size": "1024x1024", ...}`。不寫則用預設（png）。
</Tip>

## 響應結構（關鍵欄位）

成功時 HTTP 200，響應體裡：

```jsonc theme={null}
{
  "id": "resp_...",
  "model": "gpt-5.5-2026-04-23",
  "status": "completed",
  "output": [
    {
      "type": "image_generation_call",   // ← 關鍵：工具真的被觸發了
      "result": "<很長的 base64 PNG 串>"  // ← 圖片本體，base64，預設 png
    },
    { "type": "message", "content": [ /* 可能為空，出圖時不一定帶文字 */ ] }
  ],
  "usage": { "input_tokens": 2347, "output_tokens": 74 }
}
```

判斷是否真出圖：

* ✅ **成功**：`output` 裡有 `type="image_generation_call"`，且 `result` 解碼出 `\x89PNG` 開頭的合法圖。
* ⚠️ **被靜默剝離**：HTTP 200 但 `output` 裡**沒有** `image_generation_call`，只有一段文字（常見於渠道不支援）。
* ❌ **報錯**：非 200，或返回 `unknown tool` / `no available channels` 等。後兩種可改走 `/v1/images/generations` 兜底。

## 透明背景

`image_generation` 工具支援 `background: "transparent"`，與 `/v1/images/generations` 一致：

```json theme={null}
{
  "model": "gpt-5.5",
  "input": "生成一個卡通狐狸貼紙",
  "tools": [{
    "type": "image_generation",
    "model": "gpt-image-2",
    "background": "transparent",
    "output_format": "png"
  }]
}
```

返回的 `image_generation_call` 會回顯 `"background": "transparent"`，`result` 解出來是帶 alpha 通道的 PNG。`output_format` 需為 `png` 或 `webp`，配 `jpeg` 會報錯（jpeg 沒有 alpha 通道）。

各模型的透明背景支援情況見 [怎麼生成透明背景的圖片](/zh-Hant/faq/image-transparent-background)。

## 💰 計費說明

以一次真實呼叫為例（輸入 2347 token、輸出 74 token、生成 1 張 1122×1402 PNG），**最終扣費 = \$0.213954**，計費正確。拆解如下：

| 組成         | 配額計算                                                  | 摺合美金             |
| ---------- | ----------------------------------------------------- | ---------------- |
| 文本部分       | `(輸入 2347 + 輸出 74×補全倍率 6) × 輸入倍率 2.5` = **6977.5 配額** | ≈ \$0.014        |
| **圖片工具部分** | **≈ 100,000 配額**（按張計，與 token 無關）                      | **≈ \$0.20 / 張** |
| **合計**     | **106,977 配額**                                        | **\$0.213954**   |

> 換算關係：`500,000 配額 = \$1`（由 `106977 配額 = \$0.213954` 反推）。

<Warning>
  **控制台明細頁的展示問題（需主動向客戶說明）**

  在 APIYI 的「條件計費詳情」頁面裡：

  * 上半部分只展示了**文本部分**的計算（`基礎成本 = (2347 + 74×6) × 2.5 = 6977.50`）；
  * **畫圖工具呼叫的那一筆費用（≈100,000 配額 / ≈\$0.20）在明細列表裡是一行空白，沒有渲染出來**；
  * 但它**已經被正確計入**底部的「最終配額 106977 / \$0.213954」。

  **結論：計費是正常、準確的**——只是明細 UI 漏顯示了「圖片工具」這一行，導致明細各行相加 ≠ 最終總額。向客戶解釋時強調：**總額無誤，差額就是這張圖的工具費（約 \$0.20/張），只是沒單獨列出來。**
</Warning>

### 成本提示

* 出圖費用是**按張固定**（約 \$0.20/張），不隨 prompt 長短變化；文本 token 費相比之下很小。
* 單張耗時約 60\~90s，程式碼裡超時建議設 ≥300s。
* 如果只是要圖、不需要模型自主決策，用獨立端點 [`/v1/images/generations`](/zh-Hant/api-capabilities/gpt-image-2/text-to-image) 可能更省也更可控。

## 排錯速查

| 現象                             | 可能原因             | 處理                                    |
| ------------------------------ | ---------------- | ------------------------------------- |
| 200 但無 `image_generation_call` | 當前渠道不支援該工具（靜默剝離） | 換 key/渠道，或改用 `/v1/images/generations` |
| `no available channels`        | 該 key 分組下無對應渠道   | 換有 GPT/圖片渠道的 key 分組                   |
| 請求超時                           | 出圖慢              | 客戶端超時設 300s                           |
| `result` 解碼後不是 PNG             | 輸出格式被改 / 渠道異常    | 檢查 `output_format`，核對魔數               |

## 相關文件

* [GPT-Image-2 概覽](/zh-Hant/api-capabilities/gpt-image-2/overview) - 模型總覽與定價
* [文生圖 API 參考](/zh-Hant/api-capabilities/gpt-image-2/text-to-image) - `/v1/images/generations`，多數場景的首選
* [圖片編輯 API 參考](/zh-Hant/api-capabilities/gpt-image-2/image-edit) - `/v1/images/edits`，參考圖編輯 / 多圖融合 / mask
