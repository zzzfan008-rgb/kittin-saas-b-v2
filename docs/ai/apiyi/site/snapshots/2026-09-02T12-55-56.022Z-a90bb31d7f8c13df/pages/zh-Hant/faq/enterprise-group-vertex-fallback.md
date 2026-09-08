> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 什麼是企業分組（Enterprise）？什麼時候該用？

> API易 上企業分組是**模型專屬**的：gpt-image-2 用 image2Enterprise（1.2x）、Nano Banana 用 NanoBananaEnterprise（1.4x）或 NanoBananaReverse（0.8x）。本文整理各模型企業分組的差異、倍率與適用場景。

## 簡短回答

**API易 上的"企業分組"不是一個通用分組，而是每個模型各自專屬的企業兜底通道。** 它們通常比預設分組貴一點，但預設分組飽和時企業分組仍可正常出圖，是高成功率業務的兜底選項。

<Info>
  本文只整理**有官方文件或即時動態記錄可查**的事實。SLA、併發上限等未公開資料請聯絡客服。
</Info>

## 企業分組是"模型專屬"的

跟「ClaudeCode」「Sora2Official」這類**通用分組**不同，企業分組是按模型分別命名的：

| 模型                  | 企業分組名                  | 倍率   | 通道性質                                                                                |
| ------------------- | ---------------------- | ---- | ----------------------------------------------------------------------------------- |
| gpt-image-2         | `image2Enterprise`     | 1.2x | **OpenAI 上游**企業兜底（[即時動態 · 2026-05-13](/live/2026-05/gpt-image-2-default-saturated)） |
| Nano Banana Pro / 2 | `NanoBananaEnterprise` | 1.4x | Google 高可用兜底（[影像與影片模型總覽](/zh-Hant/api-capabilities/image-video-models)）             |
| Nano Banana Pro / 2 | `NanoBananaReverse`    | 0.8x | **逆向 Vertex** 通道（[即時動態 · 2026-06](/live/2026-06/nanobanana-reverse)）                |

<Tip>
  **重要澄清**：企業分組**不等於 Vertex 兜底**。`image2Enterprise` 是 OpenAI 上游的企業兜底，跟 Google Vertex 沒關係；`NanoBananaReverse` 才是走 Vertex 的逆向通道；`NanoBananaEnterprise` 是高可用兜底，具體通道組成未在文件中明示。
</Tip>

## 預設分組飽和時，企業分組仍能出圖

`gpt-image-2` 的實際案例：

* **2026-05-13 14:29–14:31** 呼叫日誌：9 條非流式呼叫**全部路由到 `image2Enterprise` 企業分組**，首位元組 35-293 秒不等、1.2x 倍率，仍可正常出圖（[即時動態 · 2026-05](/live/2026-05/gpt-image-2-default-saturated)）。
* 同時 `gpt-image-2` 預設分組飽和時，"**部分預設分組請求已通過兜底路由進入企業分組**"，印證企業分組作為兜底通道的設計（同一篇動態描述）。

`NanoBananaReverse` 的設計目的（[即時動態 · 2026-06](/live/2026-06/nanobanana-reverse)）：

> 為緩解官方直轉 Nano Banana Pro / 2 在部分高峰時段的影響，新增逆向 Vertex 分組 NanoBananaReverse，預設分組的 8 折（倍率 0.8x），不解析度僅按次計費。

<Warning>
  **"企業分組 = 一定穩定"的承諾不存在**。官方文件明確：gpt-image-2 企業分組（官轉 OpenAI API）也曾在 2026-05-07 出現「`The server had an error while processing your request.`」報錯，根因是 OpenAI 上游故障（[即時動態 · 2026-05](/live/2026-05/gpt-image-2-upstream-error)）。企業分組**降低**預設分組擁塞的影響，但不保證上游永遠穩定。
</Warning>

## 怎麼切換到企業分組？

企業分組是**令牌級別**的設定：

1. 開啟 [https://api.apiyi.com/token](https://api.apiyi.com/token)
2. 找到目標令牌 → 點操作列的「管理（扳手圖示）」→「編輯令牌」
3. 「選擇分組」裡選對應的企業分組（如 `image2Enterprise`、`NanoBananaEnterprise`、`NanoBananaReverse`）
4. 儲存

程式碼層無需任何改動。詳細教程見 [即時動態 · 2026-04 · image2-enterprise](/live/2026-04/image2-enterprise)（gpt-image-2 案例，其它模型分組切換路徑一致）。

<Tip>
  **NanoBananaReverse 適用範圍**：僅支援 `gemini-3-pro-image`（Nano Banana Pro）與 `gemini-3.1-flash-image`（Nano Banana 2），且**僅按次計費**。如果你的 Nano Banana Pro 用了按量計費令牌，這個分組不適用。
</Tip>

## 常見問題

<AccordionGroup>
  <Accordion title="Enterprise 是 Vertex 嗎？">
    **不一定**，要看是哪個模型的企業分組：

    * `image2Enterprise`（gpt-image-2 專屬）—— **不是 Vertex**，是 OpenAI 上游的企業兜底
    * `NanoBananaEnterprise`（Nano Banana 專屬）—— 文件未明示是否走 Vertex
    * `NanoBananaReverse`（Nano Banana Pro / 2）—— **明確走逆向 Vertex**

    不要把"企業分組"和"Vertex 兜底"畫等號。
  </Accordion>

  <Accordion title="哪些模型有企業分組？">
    有官方文件/動態可查的：

    * gpt-image-2：`image2Enterprise`（1.2x）
    * Nano Banana Pro / 2：`NanoBananaEnterprise`（1.4x）、`NanoBananaReverse`（0.8x）
    * Nano Banana OSS（輸出 URL）：`NB-OSS`（1x，但屬內測，需聯絡客服開通可見分組；[Nano Banana OSS 分組](/zh-Hant/api-capabilities/nano-banana-oss-group)）

    具體可用分組**以控制台顯示為準**——平臺可能會新增/調整分組名。
  </Accordion>

  <Accordion title="什麼時候需要切到企業分組？">
    已記錄的幾類典型場景：

    * 預設分組持續飽和 / 排隊 / 超時（如 gpt-image-2 在 2026-05 的情況）
    * 對成功率敏感、不希望預設分組失敗拖累業務
    * Nano Banana Pro / 2 在高峰時段體驗不佳，可考慮 `NanoBananaReverse`（按次、0.8x、更便宜）

    反過來，**預設分組資源充裕時沒必要特意切企業分組**：gpt-image-2 在 2026-05-23 預設分組補充資源後，"**可直接呼叫，無需特意切到 image2Enterprise 企業分組**"（[即時動態 · 2026-05](/live/2026-05/gpt-image-2-default-restocked-0523-2142)）。
  </Accordion>

  <Accordion title="企業分組一定比預設分組貴嗎？">
    不一定。從已有資料看倍率有高有低：

    * `image2Enterprise`：1.2x（比預設貴約 20%）
    * `NanoBananaEnterprise`：1.4x（比預設貴約 40%）
    * `NanoBananaReverse`：**0.8x**（比預設**便宜**20%）

    所以"企業"不等於"貴"——具體倍率要看是哪個模型、哪個分組。
  </Accordion>

  <Accordion title="我能同時配 Default + Enterprise 做兜底嗎？">
    可以。令牌支援 **1 個預設分組 + 最多 2 個兜底分組**（詳見 [令牌與分組](/zh-Hant/faq/token-and-groups)），主分組擁塞時自動切換備用通道。這是"高成功率業務"推薦的標準做法。
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="令牌與分組" icon="key" href="/zh-Hant/faq/token-and-groups">
    令牌作用、建立/編輯、預設分組與兜底分組的設定規則。
  </Card>

  <Card title="Nano Banana 使用指南" icon="book-open" href="/zh-Hant/api-capabilities/nano-banana-dev-guide">
    Nano Banana 系列完整說明，含 AIStudio + Vertex 雙通道冗餘機制。
  </Card>

  <Card title="即時動態歸檔" icon="radio" href="/live/archive">
    平臺每日狀態、切通道、故障恢復時間線記錄。
  </Card>

  <Card title="Nano Banana 價格總覽" icon="tag" href="/zh-Hant/api-capabilities/nano-banana-pricing">
    Nano Banana Pro / 2 / 2 Lite / 第一代定價對比。
  </Card>
</CardGroup>

<Tip>
  **客服聯絡**：本文件未覆蓋的企業分組 SLA、併發上限、新模型企業分組上線計劃等，請通過企業微信客服或郵件 [hi@apiyi.com](mailto:hi@apiyi.com) 聯絡。
</Tip>
