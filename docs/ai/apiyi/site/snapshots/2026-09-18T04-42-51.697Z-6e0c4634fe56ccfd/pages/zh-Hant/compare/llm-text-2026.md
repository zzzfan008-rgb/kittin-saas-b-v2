> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 2026 主流大語言模型橫評

> 基於模型資訊總覽的真實資料，對比 Claude、GPT、Gemini、DeepSeek、Qwen、GLM、Kimi、Grok、MiniMax 等主流文本大模型在程式設計、推理、長文本、價格、上下文視窗等維度的差異，幫你快速鎖定最合適的模型。

<Note>
  **資訊時效**：截至 2026-07，所有模型推薦與跑分資料均來源於 [模型資訊總覽（API易官方）](/zh-Hant/api-capabilities/model-info)。
  該文件**隨廠商發模型持續更新**，最新模型列表與即時價格以 [API易控制台定價頁](https://www.apiyi.com/account/pricing) 為準。
</Note>

<Info>
  **怎麼看本文件**：

  * 本文聚焦 **8 個任務場景**（程式設計開發、文本創作、快速響應、長文本、推理、Agent、聯網搜尋、成本控制），給出 model-info 推薦組合
</Info>

## 📌 8 大場景推薦組合（直接抄作業）

> 直接源自 [模型資訊總覽 → 使用建議](/zh-Hant/api-capabilities/model-info#使用建議)

### 場景 1：程式設計開發

| 檔次          | 推薦模型                                                       | 來源說明（model-info 原文）                                                                            |
| ----------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 🏆 **頂級效能** | Claude Opus 4.7 · GPT-5.5 · Claude Sonnet 4.6              | "程式設計基準較 4.6 +13%（Opus）、SWE-bench 88.7%（GPT-5.5）、媲美 Opus 4.5（Sonnet 4.6）"                      |
| 💰 **高性價比** | Gemini 3.5 Flash · GLM-5.1 · Kimi K2.6 · DeepSeek V4 Flash | "Gemini 3.5 Flash 全面反超 3.1 Pro / GLM-5.1 SWE-Bench Pro 58.4 / Kimi K2.6 反超 GPT-5.4 與 Opus 4.6" |
| 🧰 **備選**   | DeepSeek V4 Pro · Qwen3.7-Max · MiniMax M2.7 · o4-mini     | —                                                                                              |

### 場景 2：文本創作

| 檔次        | 推薦模型                                                                             |
| --------- | -------------------------------------------------------------------------------- |
| ⭐ **首選**  | GPT-5.5 · GPT-5.4 · Gemini 3.1 Pro Preview · Claude Opus 4.7 · Claude Sonnet 4.6 |
| 🔁 **備選** | chat-latest · Claude Sonnet 4.5 · GPT-4.1 · GPT-4o · Claude Haiku 4.5 · GLM-4.6  |

### 場景 3：快速響應

| 檔次        | 推薦模型                                                                  | 來源說明          |
| --------- | --------------------------------------------------------------------- | ------------- |
| ⭐ **首選**  | Gemini 3.5 Flash（約 4 倍速度）· Claude Haiku 4.5（速度快 2 倍）· GPT-4o Mini     | model-info 標註 |
| 🔁 **備選** | Gemini 3.1 Flash Lite · Gemini 2.5 Flash · Grok 4 Fast · GPT-4.1 Mini | —             |

### 場景 4：長文本處理

| 類別              | 推薦模型                                            | 上下文（model-info 資料）   |
| --------------- | ----------------------------------------------- | -------------------- |
| 🌍 **超長上下文**    | Gemini 2.5 Pro · Grok 4 Fast · Grok Code Fast 1 | **2M / 200K / 256K** |
| 💻 **程式設計長上下文** | GLM-4.6 · Claude 4 系列 · Kimi K2                 | 200K                 |

<Warning>
  **長上下文注意**：以上數字為 model-info 中標註的 **上下文視窗**。實際"有效視窗"（檢索仍準確的最大長度）通常低於標稱值，金融 / 醫療等高準確率場景建議結合 RAG 切片。
</Warning>

### 場景 5：複雜推理

| 模型                           | 跑分（model-info 明示）                           | 備註                                      |
| ---------------------------- | ------------------------------------------- | --------------------------------------- |
| **GPT-5.5 Pro**              | Terminal-Bench 2.0 **82.7%**                | **僅 `/v1/responses` 端點 + SVIP 分組**，價格高昂 |
| **Claude Opus 4.7 Thinking** | 自適應思維鏈，深度推理增強                               | 1M (Beta)                               |
| **GPT-5.5**                  | SWE-bench Verified 88.7%，新增 **`xhigh` 推理檔** | 價效比首選                                   |
| **o3**                       | 推理模型，已大幅降價                                  | 200K 上下文，平衡效能與成本                        |
| **o4-mini**                  | 輕量級推理模型                                     | 200K                                    |

<Tip>
  **推理檔怎麼開**：

  * GPT-5.5 / GPT-5.5 Pro 預設 `medium` 檔，要用 `xhigh` 檔需在請求中傳 `reasoning_effort: xhigh`
  * GPT-5.5 Pro 僅走 `/v1/responses`，不要走 `/v1/chat/completions`
  * 不要在日常任務上用 GPT Pro 系列，單次呼叫可能消耗數美金
</Tip>

### 場景 6：Agent / 智慧體

| 模型                  | 關鍵能力（model-info 原文）                                    |
| ------------------- | ------------------------------------------------------ |
| **Kimi K2.5**       | 原生多模態，**Agent Swarm 100 智慧體協作**                        |
| **Qwen3.7-Max**     | **agent 長程 35 小時自主任務**，AA Intelligence Index 56.6 全球前五 |
| **Claude Opus 4.7** | 生產任務 3 倍，工具錯誤降至 1/3                                    |
| **GPT-5.3 Codex**   | SWE-Bench Pro SOTA，複雜程式設計與智慧體任務                        |
| **GPT-5.4**         | 原生計算機操控，GDPval 83%                                     |
| **MiniMax M2.7**    | 具備自進化能力，10B 引數最小 Tier-1，開源                             |

### 場景 7：聯網搜尋

| 模型                              | 說明                                  |
| ------------------------------- | ----------------------------------- |
| **Grok 4 All** · **Grok 3 All** | **原生聯網**（無需工具呼叫）；適合即時資訊、新聞資訊、市場動態分析 |

### 場景 8：成本控制

| 模型                         | 價格資料（model-info 明示）                               |
| -------------------------- | ------------------------------------------------- |
| **MiniMax M2.7 標準版**       | **\$0.3 / 百萬輸入 tokens**                           |
| **MiniMax M2.7 highspeed** | **\$0.6 / 百萬輸入 tokens**（`MiniMax-M2.7-highspeed`） |

<Info>
  **其他模型的價格**：model-info 未在文件中明示具體輸入/輸出價。所有價格以 [API易控制台定價頁](https://www.apiyi.com/account/pricing) 為準。
  本站"源頭轉發 + 1:7 固定匯率 + 充值贈送疊加"後，實際到手價通常低於官方直連，具體以控制台顯示為準。
</Info>

## 🧮 程式設計能力跑分對照表

> 僅展示 model-info 中**明確給出具體數字**的模型。帶問號或未標註的可去 model-info 看完整描述。

| 模型                  | 跑分                                            | 上下文       | 類別     |
| ------------------- | --------------------------------------------- | --------- | ------ |
| **GPT-5.5 Pro**     | Terminal-Bench 2.0 **82.7%**                  | 1M        | 推理     |
| **GPT-5.5**         | SWE-bench Verified **88.7%**                  | 1M        | 程式設計   |
| **GPT-5.5**         | 幻覺率較 5.4 **降 60%**                            | 1M        | 品質     |
| **GPT-5.4**         | GDPval **83%**                                | 1M        | 智慧體    |
| **GPT-5.3 Codex**   | SWE-Bench Pro **SOTA**                        | 128K      | 程式設計   |
| **GPT-5.2**         | GDPval **70.9%**（超越專業人士）                      | 400K      | 程式設計規劃 |
| **GPT-5.1**         | SWE-bench **76.3%**                           | 128K      | 程式設計   |
| **Claude Opus 4.7** | 程式設計基準較 4.6 **+13%**                          | 1M (Beta) | 程式設計   |
| **Claude Opus 4.7** | 生產任務 **3 倍**，工具錯誤降至 1/3                       | 1M (Beta) | 智慧體    |
| **Kimi K2.6**       | SWE-Bench Pro **58.6**（反超 GPT-5.4 與 Opus 4.6） | 256K      | 程式設計   |
| **GLM-5.1**         | SWE-Bench Pro **58.4**                        | —         | 程式設計   |
| **MiniMax M2.7**    | SWE-bench Pro **56.22%**（10B 引數最小 Tier-1）     | 標準        | 程式設計   |
| **MiniMax M2.5**    | SWE-bench **80.2%**                           | 標準        | 程式設計   |
| **Qwen3.7-Max**     | AA Intelligence Index **56.6**（全球前五、國產第一）     | 1M        | 智慧體    |

## 📚 上下文視窗對照表

| 模型                                                                                                                                                                   | 上下文視窗       | 來源            |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------- |
| **Gemini 2.5 Pro**                                                                                                                                                   | **2M**      | 長文本推薦         |
| **GPT-5.5 Pro** · **GPT-5.5** · **GPT-5.4** · **Claude Opus 4.7** · **Claude Opus 4.7 Thinking** · **Qwen3.7-Max**                                                   | **1M**      | model-info 明示 |
| **GPT-5.2** · **chat-latest**                                                                                                                                        | 400K        | model-info 明示 |
| **Kimi K2.6**                                                                                                                                                        | 256K        | model-info 明示 |
| **GPT-5.1** · **GPT-5.3 Codex** · **GPT-5** · **GPT-5 Mini** · **GPT-5 Nano** · **GPT-4.1** · **GPT-4.1 Mini** · **GPT-4o** · **GPT-4o Mini** · **o3** · **o4-mini** | 128K / 200K | model-info 明示 |
| **Grok 4 Fast / Grok Code Fast 1**                                                                                                                                   | 200K / 256K | 長文本推薦         |
| **GLM-4.6 / Claude 4 系列 / Kimi K2**                                                                                                                                  | 200K        | 程式設計長上下文      |
| **Qwen Max / Qwen Plus / Qwen Turbo**                                                                                                                                | 32K         | model-info 明示 |

<Note>
  **再次提醒**：上下文視窗數字 = **廠商標稱上限**。
  "大海撈針"等真實檢索準確率會隨超長文本顯著下降，長上下文 ≠ 替代 RAG。
</Note>

## 💡 model-info 已給的 4 條成本最佳化建議（原文 1:1）

1. **分級使用**：簡單任務用便宜模型，複雜任務用高階模型
2. **測試最佳化**：先用小模型測試，確定需求後再用大模型
3. **批次處理**：大量相似任務可以選擇 Nano 或 Mini 版本
4. **快取複用**：對重複查詢結果進行快取

## ❓ model-info 已給的 3 條 GPT-5 系列注意事項（原文 1:1）

<Warning>
  **GPT-5 系列使用注意事項**：

  1. 溫度引數 `temperature` 必須設定為 1（只支援 1）
  2. 使用 `max_completion_tokens` 替代 `max_tokens`
  3. 不要傳遞 `top_p` 引數
</Warning>

## 🔗 相關資源

* [模型資訊總覽（model-info）](/zh-Hant/api-capabilities/model-info) —— 所有資料的唯一來源
* [API易控制台定價頁](https://www.apiyi.com/account/pricing) —— 即時價格查詢
* [影像與影片生成模型](/zh-Hant/api-capabilities/image-video-models) —— 多模態模型對照
* [API 文件](/zh-Hant/api-manual) · [快速開始](/zh-Hant/getting-started) · [OpenAI 相容呼叫](/zh-Hant/api-capabilities/openai/compatible)

<Tip>
  **仍在猶豫選哪個？** [聯絡 API易 客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)，告訴我們：

  * 應用場景（對話 / RAG / Agent / 寫作 / ...）
  * 日均呼叫量級
  * 效能要求（首 token 時延、生成品質）
  * 預算範圍

  按你給這 4 個資訊給出**專屬推薦組合**。
</Tip>

<Note>
  **宣告**：
  本文件所有資料均來源於 docs/api-capabilities/model-info.mdx（截至 2026-07 讀取）。
  model-info 會隨廠商發模型持續更新；最新模型推薦請直接查閱 model-info 或 [API易控制台定價頁](https://www.apiyi.com/account/pricing)。
</Note>
