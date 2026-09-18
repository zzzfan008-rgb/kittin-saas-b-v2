> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# usage 欄位與輸出解讀

> 解讀 gemini-3-pro-image 響應 JSON 的輸出結構與 usageMetadata 各欄位含義，解釋三個看似異常、實際是模型固有行為的計數現象

本文面向通過 API易 呼叫 `gemini-3-pro-image`（Nano Banana Pro）的開發者，解釋響應 JSON 的輸出結構與 `usageMetadata` 各欄位的實際含義，並說明幾個**看起來像異常、實際是模型固有行為**的計數現象。全部結論來自對生產閘道的實測（48 次文生圖 + 18 次圖片編輯），並與谷歌官方文件（`ai.google.dev/gemini-api/docs/image-generation`）交叉核對，非推測。

## 響應的整體結構

API易 的 nano banana 系列走 Google 原生格式，響應頂層固定四個欄位：

```json theme={null}
{
  "candidates":    [ ... ],          // 生成結果（圖片/文本 parts）
  "usageMetadata": { ... },          // token 用量
  "modelVersion":  "gemini-3-pro-image",
  "responseId":    "..."
}
```

### 成功出圖時

```json theme={null}
"candidates": [{
  "content": {
    "role": "model",
    "parts": [
      { "inlineData": { "mimeType": "image/jpeg", "data": "<base64>" } }
    ]
  },
  "finishReason": "STOP",
  "index": 0
}]
```

<Warning>
  **parts 裡可能不止一張圖**。當提示詞是複雜任務型（如"人物四檢視/角色設定圖"這類多約束任務）時，模型可能一次返回多張圖片 part（實測 2–10 張）——它們是模型"思考過程"生成的中間稿加最終稿，官方文件明確"思考中的最後一張圖片也是最終渲染的圖片"，**取最後一張即可**。純文生圖和簡單編輯（加飾品/換背景/換風格）通常只返回 1 張。無論哪種情況，解析時都請遍歷 parts，需要單圖時取最後一個 `inlineData`。現象詳解見 [開發指南 · 偶現多圖輸出是怎麼回事](/zh-Hant/api-capabilities/nano-banana-dev-guide#偶現多圖輸出是怎麼回事)。
</Warning>

#### parts 裡還可能混有文本段

上面示例裡 `parts` 只有一個圖片段，但這**不是固定結構**。`parts` 是異構陣列，實測出現過三種排列：

| parts 結構              | 長度 | 圖片下標    |
| --------------------- | -- | ------- |
| `inlineData`          | 1  | `0`     |
| `text` + `inlineData` | 2  | **`1`** |
| `inlineData` + `text` | 2  | **`0`** |

`responseModalities` 裡含 `TEXT`、提示詞要求模型給出文字說明，都會讓響應裡多出文本段；文本段排在圖片前還是圖片後也不固定。**因此圖片落在哪個下標並非定值。**

<Warning>
  寫死下標的兩種寫法是**互補**的：圖片必落在 `[0]` 或 `[1]`，寫死任一個都存在拿不到圖的請求。正確做法見下文 [解析與對賬最佳實踐](#解析與對賬最佳實踐)；也可在 `generationConfig` 裡顯式宣告 `responseModalities: ["IMAGE"]` 表明只要圖片作為加固，但**不能替代**遍歷篩選。
</Warning>

### 被安全策略攔截時

HTTP 狀態碼**仍是 200**，區別在 candidate 內部：

```json theme={null}
"candidates": [{
  "content": { "parts": null },        // ⚠️ parts 為 null，不是空陣列
  "finishReason": "IMAGE_SAFETY",      // 或 NO_IMAGE / PROHIBITED_CONTENT
  "finishMessage": "Unable to show the generated image. ...",  // 僅部分場景攜帶
  "index": 0
}]
```

* `finishReason` 取值實測有三種：`IMAGE_SAFETY`（輸出圖違規）、`PROHIBITED_CONTENT`（觸發停用政策，附帶 `finishMessage` 說明）、`NO_IMAGE`（未生成圖片，通常秒回）。
* 拒絕說明放在 `finishMessage` 欄位裡，**不會**以文本 part 形式出現在 `parts` 中。
* 解析程式碼務必相容 `parts` 為 `null` 的情況，否則攔截響應會導致報錯。

<Tip>
  各類失敗的判斷指標、內容稽核政策與友好提示方案，見 [Gemini 出圖錯誤處理指南](/zh-Hant/api-capabilities/gemini-image-error-handling)。
</Tip>

## usageMetadata 欄位含義

成功出圖時固定 6 個欄位：

```json theme={null}
"usageMetadata": {
  "promptTokenCount": 615,          // 輸入總 tokens（文本 + 輸入圖片）
  "candidatesTokenCount": 2478,     // 輸出總 tokens（含圖片 + 內部生成 tokens）
  "thoughtsTokenCount": 208,        // 思考（推理）tokens
  "totalTokenCount": 3301,          // 本次請求計費總量
  "promptTokensDetails":     [ { "modality": "TEXT",  "tokenCount": 99 },
                               { "modality": "IMAGE", "tokenCount": 516 } ],
  "candidatesTokensDetails": [ { "modality": "IMAGE", "tokenCount": 2240 } ]
}
```

| 欄位                        | 含義                    | 可靠性                              |
| ------------------------- | --------------------- | -------------------------------- |
| `promptTokenCount`        | 輸入側總量                 | ✅ 恆等於 `promptTokensDetails` 之和   |
| `candidatesTokenCount`    | 輸出側總量                 | ✅ 計費口徑；**但大於 details 之和，見下文現象一** |
| `thoughtsTokenCount`      | 思考 tokens，實測通常 50–350 | ✅                                |
| `totalTokenCount`         | 總量                    | ✅ 出圖時恆等於前三項之和；**拒絕時例外，見下文現象二**   |
| `promptTokensDetails`     | 輸入按模態分解               | ✅ 完整分解                           |
| `candidatesTokensDetails` | 輸出按模態分解               | ⚠️ **只是圖片部分，不是完整分解**             |

**圖片 tokens 由解析度檔決定，與寬高比無關**：1K 與 2K 檔均為 **1120 tokens/張**，4K 檔為 **2000 tokens/張**；寬高比只改變畫素尺寸，不改變 token 數。一次返回 N 張圖則 details 精確等於 N × 單張值。

下表為谷歌官方給出的 Pro Image 寬高比與圖片大小對照（來源：`ai.google.dev/gemini-api/docs/image-generation`），與我們對 `gemini-3-pro-image` 的實測完全一致：

| 寬高比  | 1K 尺寸     | 1K tokens | 2K 尺寸     | 2K tokens | 4K 尺寸     | 4K tokens |
| ---- | --------- | --------- | --------- | --------- | --------- | --------- |
| 1:1  | 1024x1024 | 1120      | 2048x2048 | 1120      | 4096x4096 | 2000      |
| 2:3  | 848x1264  | 1120      | 1696x2528 | 1120      | 3392x5056 | 2000      |
| 3:2  | 1264x848  | 1120      | 2528x1696 | 1120      | 5056x3392 | 2000      |
| 3:4  | 896x1200  | 1120      | 1792x2400 | 1120      | 3584x4800 | 2000      |
| 4:3  | 1200x896  | 1120      | 2400x1792 | 1120      | 4800x3584 | 2000      |
| 4:5  | 928x1152  | 1120      | 1856x2304 | 1120      | 3712x4608 | 2000      |
| 5:4  | 1152x928  | 1120      | 2304x1856 | 1120      | 4608x3712 | 2000      |
| 9:16 | 768x1376  | 1120      | 1536x2752 | 1120      | 3072x5504 | 2000      |
| 16:9 | 1376x768  | 1120      | 2752x1536 | 1120      | 5504x3072 | 2000      |
| 21:9 | 1584x672  | 1120      | 3168x1344 | 1120      | 6336x2688 | 2000      |

<Note>
  官方**中文版**文件把英文表頭 `1K tokens`（即"1K 檔的 token 數"）直譯成了「1,000 個 token」，容易被誤讀成"每張 1000 tokens"——實際按張計的 token 數以單元格數值為準：1K/2K 檔每張 1120，4K 檔每張 2000。另外 512px 檔（747 tokens/張）僅 Flash 系列圖片模型支援，`gemini-3-pro-image` 只有 1K/2K/4K 三檔；Nano Banana 2 Lite（`gemini-3.1-flash-lite-image`）比較特殊，本身**只有 1K 一檔**，不含 512px。
</Note>

## 三個"看起來像異常"的現象及解釋

### 現象一：candidatesTokenCount ≠ candidatesTokensDetails 之和 —— 正常，必然如此

實測 **100%**（49/49 成功出圖樣本）滿足：`candidatesTokenCount` 比 details 之和**大 88–630 tokens**（提示詞越複雜、返回圖片越多，差值越大）。

原因：`candidatesTokensDetails` 只統計**圖片本體**（固定 1120/2000 每張）；而 `candidatesTokenCount` 還包含影像生成過程伴隨的內部 tokens，這部分沒有對應的 modality 條目。這是 Gemini 原生計數口徑，API易 透傳不做改寫。

<Info>
  **結論：請勿把 details 當作 `candidatesTokenCount` 的完整分解來校驗；對賬、計費一律以 `candidatesTokenCount` / `totalTokenCount` 為準，details 僅用於估算圖片部分的佔比。**
</Info>

### 現象二：totalTokenCount ≠ prompt + candidates + thoughts —— 只發生在無圖輸出的響應上

* 正常出圖時，等式**嚴格成立**（49/49）：`total = promptTokenCount + candidatesTokenCount + thoughtsTokenCount`。
* 被安全攔截（無圖輸出）時，等式**必然不成立**（6/6），且模式固定：

```text theme={null}
candidatesTokenCount == thoughtsTokenCount     // 思考 tokens 被同時寫入兩個欄位
totalTokenCount == promptTokenCount + thoughtsTokenCount   // total 只計一次，是正確的
```

即拒絕響應中 `candidatesTokenCount` 是 `thoughtsTokenCount` 的映象值，三項相加會把思考多算一份。這同樣是上游固有行為。**`totalTokenCount` 本身是準的，直接用它即可**；如果你的日誌裡有約 10% 的響應"等式不平"，請核對這些響應是否 `parts` 為空——大機率正是安全攔截樣本。

### 現象三：輸出 tokens 偶爾高達 6000+ —— 來自思考過程返回的多張圖片 part

谷歌官方文件說明，Gemini 3 圖片模型是思考型模型：預設啟用"思考"且無法在 API 中關閉，模型會生成臨時圖片來測試構圖和邏輯，且"思考中的最後一張圖片也是最終渲染的圖片"（來源：`ai.google.dev/gemini-api/docs/image-generation` 思考過程章節）。

實測中，這些思考中間稿在原生 `generateContent` 響應裡以**普通圖片 part** 的形式返回：每個 part 都帶 `thoughtSignature` 欄位、但沒有 `thought: true` 標記，並且**每張都按 1120 tokens 計入 `candidatesTokensDetails`**。官方稱思考最多生成兩張臨時圖片，但複雜任務型提示詞下實測單次返回最多見 **10 張** part。usage 隨圖片數嚴格線性增長：

| 返回圖片數     | candidatesTokensDetails | candidatesTokenCount | totalTokenCount |
| --------- | ----------------------- | -------------------- | --------------- |
| 1（文生圖，1K） | 1120                    | \~1210–1275          | \~1350–1450     |
| 2         | 2240                    | \~2500               | \~3300          |
| 3         | 3360                    | \~3800               | \~4600          |
| 4         | 4480                    | \~5000               | \~5900          |
| 5         | 5600                    | \~6200               | \~7000          |
| 10        | 11200                   | \~12700              | \~13500         |

而 `thoughtsTokenCount` 欄位只統計**文本思考**，實測從未超過 400——高輸出 tokens 的來源是圖片 part 的張數，不是這個欄位。看到 6000+ 甚至上萬的輸出 tokens 時，請檢查該響應的 parts 數量——幾乎可以確定是多圖響應，屬於正常計費（對賬仍以 `totalTokenCount` 為準）。

## 思考等級與兩種 API 範式

### thinkingLevel 對 tokens 的影響

思考等級控制僅 **Gemini 3.1 Flash Image / Flash Lite Image** 支援（`generationConfig.thinkingConfig.thinkingLevel`，預設 `minimal`，可選 `high`）；`gemini-3-pro-image` 的思考恆開、無法調節。實測（同一提示詞、1K 文生圖，經 API易 閘道）：

| 模型 / 設定                              | thoughtsTokenCount | 圖片 tokens | totalTokenCount | 耗時       |
| ------------------------------------ | ------------------ | --------- | --------------- | -------- |
| gemini-3.1-flash-image · minimal（預設） | 無該欄位               | 1120      | \~1534–1554     | \~12–13s |
| gemini-3.1-flash-image · high        | 700–792            | 1120      | \~2243–2375     | \~18–23s |
| gemini-3-pro-image · 傳入 high         | 181–214（與預設區間無異）   | 1120      | \~1427–1471     | \~23s    |

* **high 只增加思考 tokens 與延遲，不改變圖片 tokens**（仍為每張 1120）。
* 給 `gemini-3-pro-image` 傳 `thinkingLevel` 不會報錯，但實測無效果，思考 tokens 仍在預設區間。
* `includeThoughts: true` 實測不改變返回結構與計費；官方明確：無論是否檢視思考過程，思考 tokens 都預設計費。
* 官方說明"最少思考並不意味著模型完全不進行思考"——minimal 下只是 usage 裡不再單列 `thoughtsTokenCount` 欄位。

<Info>
  Nano Banana 2 Lite（`gemini-3.1-flash-lite-image`）與 Nano Banana 2 同屬 3.1 Flash 系列，同樣支援 `thinkingLevel` 調節，機制與上表一致；但暫未單獨實測收錄進上表，具體價格明細見 [Nano Banana 系列價格總覽](/zh-Hant/api-capabilities/nano-banana-pricing)。
</Info>

### 圖片模型與文本模型的思考 tokens 有何不同

* **文本思考模型**：思考產物是文本，`thoughtsTokenCount` 可達數千，按輸出 token 價計費；官方定價按模型內部生成的**完整思考**計，即使 API 只返回思考摘要（來源：`ai.google.dev/gemini-api/docs/thinking` 價格章節）。
* **圖片思考模型**：思考產物有兩類——少量**文本思考**計入 `thoughtsTokenCount`（實測 Pro 不超過 400、Flash high 檔約 800），以及**中間稿圖片**，後者以普通圖片 part 返回、按每張 1120/2000 tokens 計入 `candidatesTokenCount`。因此圖片模型"思考的成本"主要體現在圖片 part 的張數上，而不是 `thoughtsTokenCount` 欄位（見上文現象三）。

### 兩種 API 範式

谷歌的圖片模型文件現有兩個版本：經典的 **generateContent API**（無狀態）與新推薦的 **Interactions API**（面向 Agent 與工具呼叫）。API易 閘道走 **Google 原生 generateContent 格式，本文全部結構與欄位均以此為準**。兩者的思考相關差異：

|           | generateContent（本文）                                               | Interactions API                                      |
| --------- | ----------------------------------------------------------------- | ----------------------------------------------------- |
| 思考等級引數    | `generationConfig.thinkingConfig.thinkingLevel`                   | `generation_config.thinking_level`                    |
| 思考內容返回    | 有 `includeThoughts` 開關（實測對圖片模型無可見效果，中間稿總是以普通圖片 part 返回）           | 以 `steps`（`type: "thought"`）顯式返回，無 includeThoughts 開關 |
| usage 欄位名 | `thoughtsTokenCount` / `candidatesTokenCount` / `totalTokenCount` | `total_thought_tokens` / `total_output_tokens`        |

兩種範式的完整對比（端點、狀態管理、資料保留、API易 閘道相容性實測）見 [Interactions API 與 generateContent 對比](/zh-Hant/api-capabilities/gemini/interactions-api)。

## 解析與對賬最佳實踐

```python theme={null}
data = resp.json()
cand = (data.get("candidates") or [{}])[0]
parts = (cand.get("content") or {}).get("parts") or []   # 相容 parts=null

# 按欄位特徵篩選，不要用 parts[0] / parts[1]——文本段可能排在圖片前面
images = [p["inlineData"] for p in parts if "inlineData" in p]
if images:
    final_image = images[-1]["data"]          # 多圖時最後一張為最終稿
    mime = images[-1]["mimeType"]             # 以響應為準，別寫死 image/png
else:
    reason = cand.get("finishReason")         # IMAGE_SAFETY / NO_IMAGE / PROHIBITED_CONTENT
    message = cand.get("finishMessage", "")   # 可能為空
```

1. **計費對賬用 `totalTokenCount`**（拒絕場景下它也是準的），不要自行用三項相加或 details 求和去校驗。
2. **遍歷 parts，不假設單圖**；按張計數的業務以實際 `inlineData` part 數為準。
3. **相容 `parts = null` + HTTP 200** 的攔截響應，按 `finishReason` 分流。
4. 簡單編輯耗時 \~22–25s，複雜任務（多圖響應）35–142s，張數越多越久；客戶端超時建議設定 ≥ 5 分鐘（含代理層）。

## 相關文件

<CardGroup cols={2}>
  <Card title="Nano Banana 開發指南" icon="book-open" href="/zh-Hant/api-capabilities/nano-banana-dev-guide">
    接入方式、輸入圖片要求、計費基礎、超時設定與偶現多圖說明
  </Card>

  <Card title="錯誤處理指南" icon="triangle-alert" href="/zh-Hant/api-capabilities/gemini-image-error-handling">
    出圖失敗的三大判斷指標、內容稽核政策與友好提示方案
  </Card>

  <Card title="出圖失敗保障計劃" icon="shield-check" href="/zh-Hant/api-capabilities/nano-banana-pro-guarantee">
    非主觀原因導致的失敗，按條數核算後補發額度
  </Card>

  <Card title="Nano Banana 價格" icon="badge-dollar-sign" href="/zh-Hant/api-capabilities/nano-banana-pricing">
    各解析度與各模型檔位的出圖價格
  </Card>
</CardGroup>
