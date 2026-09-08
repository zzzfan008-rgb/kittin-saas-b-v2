> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Google 系模型走的是 AI Studio 還是 Vertex？

> API易 上 Nano Banana 等 Google 系圖片模型預設分組走的是官轉 AI Studio 線路；Vertex 作為獨立算力池在 AIStudio 故障時頂上，二者雙通道、互為冗餘，本文整理事實與切換路徑。

## 簡短回答

**Nano Banana 等 Google 系模型的預設分組走的是「官轉 AI Studio」線路；Vertex 作為獨立算力池，在 AIStudio 出問題時頂上。兩者是雙通道、互為冗餘**，不是二選一。

<Info>
  本文只整理**有官方文件或即時動態記錄可查**的事實。如果你想了解背後的排程邏輯、上游算力池細節等不在文件範圍內的內容，請聯絡客服。
</Info>

## 預設分組 = 官轉 AI Studio

API易 自 2025 年 11 月 Nano Banana 上線以來，提供的 `gemini-3-pro-image`（Nano Banana Pro）、`gemini-3.1-flash-image`（Nano Banana 2）及 lite 系列**一直走官轉 AI Studio 線路**，從未接入過逆向通道（詳見 [即時動態 · 2026-07](/live/2026-07/nano-banana-pro-2-official-aistudio)）。

<Tip>
  **為什麼強調"官轉 AI Studio"**：Nano Banana 價格比官網低不少並不等於逆向——價格優勢來自聚合排程與匯率差，不是來自繞過 Google 鑑權。
</Tip>

預設分組下絕大多數情況下**直接呼叫即可**，無需任何特殊配置。

## Vertex 在哪裡？怎麼開？

Vertex（Google Cloud 企業級通道）作為**獨立算力池**，在 API易 上以獨立分組的形式提供，可在建立或編輯令牌時按需選擇。具體可用分組以控制台顯示為準。

<Note>
  **關於出圖體積**：Vertex 通道的 4K 出圖體積比 AI Studio 通道大——Vertex 單張約 **20 MB**，AI Studio 單張約 **10 MB**，下載、儲存與 CDN 頻寬請按 20 MB 上限做容量規劃（詳見 [即時動態 · 2026-05-28](/live/2026-05/gemini-image-vertex-supply)）。
</Note>

## AIStudio 與 Vertex 是雙通道、互為冗餘

文件明確表述：**API易 為 Nano Banana 系列提供 AIStudio + Vertex 雙通道冗餘**，官方單通道異常時可由另一通道頂上、儘量保障服務可用性（[Nano Banana 使用指南](/zh-Hant/api-capabilities/nano-banana-dev-guide)）。

實際觸發切換的案例：

* **2026-06-19 案例**：谷歌 `AIStudio` 側算力問題導致官方 2K / 4K 出糊圖、1K 正常，**臨時改用 Vertex 通道頂上**後 2K/4K 恢復正常（[即時動態 · 2026-06](/live/2026-06/nano-banana-2k-4k-via-vertex)）。
* **2026-05-28 案例**：Gemini 圖片預覽模型均切到 **Vertex 高價通道**保障供應，可用性迴歸穩定（[即時動態 · 2026-05](/live/2026-05/gemini-image-vertex-supply)）。

<Warning>
  **不要憑直覺判斷「Vertex 永遠不會受影響」**。Vertex 在 AIStudio 出問題時頂上不代表 Vertex 永遠不會出故障——平臺沒有對 Vertex 給出"SLA 100% 不受影響"的承諾。遇到問題時仍以 `aistudio.google.com/status` 與本站即時動態為準。
</Warning>

## 怎麼查上游是否在出問題？

最權威的入口是 Google 官方的 AI Studio 狀態頁：

> **`aistudio.google.com/status`**

該頁面會發布 Gemini 系列模型的官方狀態通報。例：

* **2026-06-19 15:54**：狀態頁標記為 Detected，原文「We are experiencing issues with Nano Banana 2 and Nano Banana Pro models on Gemini API and AI Studio when using 2k or 4k resolution. Investigation is underway.」（[即時動態 · 2026-06-19](/live/2026-06/aistudio-status-nano-banana)）

<Tip>
  **實戰用法**：當客戶報"Banana 慢了/出圖有問題"時，先去 `aistudio.google.com/status` 看一眼是否有 Detected 通報，能 1 分鐘定位是不是上游問題。
</Tip>

## 常見問題

<AccordionGroup>
  <Accordion title="預設號池都是 AI Studio 嗎？還是 Vertex 和 AI Studio 都有？">
    預設分組（Default）**走的是官轉 AI Studio 線路**，是 Nano Banana 等 Google 系圖片模型的預設通道。Vertex 是獨立的可選分組，**不在預設分組裡**，需要切換到對應 Vertex 分組才走 Vertex。
  </Accordion>

  <Accordion title="Vertex 在哪個分組？怎麼用 Vertex？">
    Vertex 在 API易 控制台裡以**獨立的可選分組**形式提供（具體分組名稱以控制台為準）。新建或編輯令牌時，在「選擇分組」裡挑到 Vertex 相關的分組即可，呼叫方式不變，**程式碼層無需修改**。
  </Accordion>

  <Accordion title="Nano Banana 慢的時候，是不是 Vertex 受影響小一點？AI Studio 是影響最大的？">
    **從已有事件記錄看，AI Studio 通道曾在 2026-06-19 出過 2K/4K 算力問題**，當時由 Vertex 頂上後恢復。但"Vertex 受影響小"目前**只針對已記錄的幾次 AIStudio 算力事件**——平臺沒有公開 Vertex 的 SLA 資料，也沒有"Vertex 永遠不受影響"的承諾。

    如果你的業務對成功率敏感，建議在令牌上**為 Nano Banana 模型掛兜底分組**（詳見 [令牌與分組](/zh-Hant/faq/token-and-groups)），主分組擁塞時自動切換備用通道。
  </Accordion>

  <Accordion title="怎麼確認我的呼叫走的是哪條通道？">
    呼叫的具體通道**不會在響應裡直接標註**。可以通過以下方式間接判斷：

    1. 令牌設定裡選的哪個分組，呼叫就走哪個分組的預設通道
    2. 看返回的圖片體積——**AI Studio 4K 約 10 MB、Vertex 4K 約 20 MB**，差異較明顯
    3. 遇到上游故障時參考 [即時動態](/live) 看平臺切到了哪條通道
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="Nano Banana 使用指南" icon="book-open" href="/zh-Hant/api-capabilities/nano-banana-dev-guide">
    Nano Banana 系列完整使用說明，含 AIStudio + Vertex 雙通道冗餘機制說明。
  </Card>

  <Card title="Nano Banana 價格總覽" icon="tag" href="/zh-Hant/api-capabilities/nano-banana-pricing">
    Nano Banana Pro / 2 / 2 Lite / 第一代完整定價對比。
  </Card>

  <Card title="即時動態歸檔" icon="radio" href="/live/archive">
    平臺每日執行狀態、切通道、故障恢復等時間線記錄。
  </Card>

  <Card title="令牌與分組" icon="key" href="/zh-Hant/faq/token-and-groups">
    令牌分組、預設分組與兜底分組的設定規則。
  </Card>
</CardGroup>

<Tip>
  **客服聯絡**：本文件範圍內未覆蓋的 Vertex / AIStudio 排程細節、上游算力池容量、SLA 等資訊，請通過企業微信客服或郵件 [hi@apiyi.com](mailto:hi@apiyi.com) 聯絡。
</Tip>
