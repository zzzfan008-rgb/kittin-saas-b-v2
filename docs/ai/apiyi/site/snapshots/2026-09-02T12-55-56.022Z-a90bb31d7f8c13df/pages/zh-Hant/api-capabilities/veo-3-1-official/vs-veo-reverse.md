> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# VEO 3.1 Official vs 官逆 選型對照

> VEO 3.1 Official（官轉）與既有 VEO 3.1（官逆）通道的全維度對比表 + 三步決策樹，幫你為不同業務場景選對通道。

<Warning>
  **官逆通道已下線（2026年6月）**：VEO 3.1 官逆通道因 Google Flow 逆向風控原因已暫時下線，當前請使用 **官轉**（本系列）通道。本頁官逆相關內容暫作保留以供參考，恢復時間請關注後續公告。
</Warning>

<Info>
  API易 同時提供兩條 Veo 3.1 通道。本頁幫你**按場景選型**：追求官方畫質穩定性、能接受非同步輪詢 → 走 **官轉**（本系列）；預算敏感、需要同步流式或首尾幀 → 走 **官逆**（[VEO 3.1](/api-capabilities/veo/overview)）。兩條通道可以**同賬號並行使用**，不衝突。
</Info>

## 全維度對照表

| 維度         | **官轉**（本系列）                                                  | **官逆**（[既有 VEO 3.1](/api-capabilities/veo/overview)）        |
| ---------- | ------------------------------------------------------------ | ----------------------------------------------------------- |
| **通道型別**   | 透傳 Google AI Studio 官方端點                                     | 逆向工程接入 Google Flow                                          |
| **模型 ID**  | `veo-3.1-generate-preview` / `veo-3.1-fast-generate-preview` | `veo-3.1` / `veo-3.1-fast` / `-landscape` / `-fl` 系列共 8 個變種 |
| **計費方式**   | 按次（與時長、解析度無關）                                                | 按次（與時長、解析度無關）                                               |
| **價格**     | \$0.3（fast）/ \$1.2（standard）                                 | \$0.15（fast）/ \$0.25（standard）— **省 50–75%**                |
| **端點路徑**   | 僅 `POST /v1/videos`（非同步）                                     | `POST /v1/chat/completions`（同步流式）+ `POST /v1/videos`（非同步）   |
| **同步流式**   | ❌ 僅非同步輪詢                                                     | ✅ 支援 `stream: true` 即時見進度                                   |
| **時長**     | 4 / 6 / 8 秒（字串）                                              | 固定 8 秒                                                      |
| **解析度**    | 720p / 1080p / 4k 三檔                                         | HD 橫屏（1280×720）/ 豎屏（720×1280）                               |
| **參考圖**    | 1 張 `input_reference`（multipart）                             | 1–2 張（**支援首尾幀** `-fl` 系列）                                   |
| **橫/豎屏切換** | 通過 `aspectRatio` 引數                                          | 通過模型 ID 選擇（`-landscape` 系列）                                 |
| **分組**     | `Default`                                                    | `Default`                                                   |
| **計費模式**   | 按次計費 ✅ / 按量優先 ✅（按量計費 ❌）                                      | 按次計費 ✅ / 按量優先 ✅                                             |
| **響應欄位**   | `id` / `task_id` / `status` / `progress`（粗粒度 0/50/100）       | 同步：完整 chat completion；非同步：`task_id` / `status`              |
| **失敗計費**   | ❌ 不計費                                                        | ❌ 不計費                                                       |
| **音訊**     | 原生同步音軌                                                       | 原生同步音軌                                                      |
| **適用場景**   | 追求官方品質穩定、能接受非同步輪詢的生產場景                                       | 預算敏感、需要同步流式 UI 進度、需要首尾幀創作                                   |

## 三步決策樹

<Steps>
  <Step title="Q1: 你需要首尾幀（Frame-to-Video）能力嗎？">
    * **需要** → 走 **[官逆 VEO 3.1](/api-capabilities/veo/overview)** 的 `-fl` 系列（如 `veo-3.1-landscape-fast-fl`），官轉**暫未開放**首尾幀
    * **不需要** → 進入 Q2
  </Step>

  <Step title="Q2: 你的前端需要同步流式進度條嗎？">
    * **需要**（使用者等待 UI 不能空白） → 走 **[官逆 VEO 3.1](/api-capabilities/veo/overview)** 的 `/v1/chat/completions` 同步流式端點
    * **後端任務化**（佇列消費、批量出片） → 進入 Q3
  </Step>

  <Step title="Q3: 你的預算 vs 畫質優先順序如何？">
    * **預算優先**（\$0.15 vs \$0.3 差距明顯）→ 走 **[官逆 VEO 3.1](/api-capabilities/veo/overview)**，單價低 50%
    * **畫質 / 穩定性優先**（最終交付、4K 高畫質、強指令遵循） → 走 **官轉**（本系列）的 `veo-3.1-generate-preview`
    * **試水預覽** → 走 **官轉**的 `veo-3.1-fast-generate-preview`（\$0.3）或 **官逆**的 `-fast`（\$0.15）
  </Step>
</Steps>

## 典型場景配對建議

| 業務場景                 | 推薦通道   | 推薦模型                                         | 理由               |
| -------------------- | ------ | -------------------------------------------- | ---------------- |
| 短影片矩陣批次生產（每天 100+ 條） | **官逆** | `veo-3.1-landscape-fast`                     | 單價 \$0.15，量產成本可控 |
| 客戶廣告片最終交付            | **官轉** | `veo-3.1-generate-preview`                   | 官方畫質穩定 + 4K 可選   |
| 前端線上展示（要 loading 動效） | **官逆** | `veo-3.1-landscape-fast` + 同步流式              | 可見進度，避免空等焦慮      |
| 靜態海報 + 首尾幀 → 動效短片    | **官逆** | `veo-3.1-landscape-fast-fl`                  | 首尾幀能力            |
| 4K 高畫質電影感片段（關鍵素材）    | **官轉** | `veo-3.1-generate-preview` + `resolution=4k` | 僅官轉支援 4K         |
| 海外團隊接入（現有 Key 不動配置）  | **官轉** | `veo-3.1-fast-generate-preview`              | 預設分組 + 按次，零門檻    |
| 同 prompt 多 seed 探索風格 | **官轉** | `veo-3.1-fast-generate-preview`              | 4–6 秒可選，試錯成本低    |
| 試水 + 最終切換的工作流        | 混用     | 官逆 fast 試水 → 官轉 standard 出片                  | 試錯便宜、交付穩定        |

## 兩個通道是否可以混用？

**完全可以**。兩個通道是獨立路由：

* 同一賬號下，**同一把令牌**（走預設分組）可以同時呼叫兩個通道，按呼叫次數分別計費
* 業務程式碼裡按需切 `model` 欄位即可：
  * 想走官轉 → `veo-3.1-fast-generate-preview` / `veo-3.1-generate-preview`
  * 想走官逆 → `veo-3.1-fast` / `veo-3.1-landscape` / `veo-3.1-fl` 等

<Tip>
  **推薦配法**：把"業務關鍵交付"打到官轉，把"試錯 / 批次預覽 / 同步 UI"打到官逆，賬號統一、賬單清晰、能力互補。
</Tip>

## 相關文件

* [VEO 3.1 Official 概覽](/zh-Hant/api-capabilities/veo-3-1-official/overview) - 官轉通道完整介紹
* [VEO 3.1（官逆）概覽](/api-capabilities/veo/overview) - 既有官逆通道完整介紹
* [VEO 3.1 Official 文生影片 Playground](/zh-Hant/api-capabilities/veo-3-1-official/text-to-video)
* [VEO 3.1 Official 圖生影片 Playground](/zh-Hant/api-capabilities/veo-3-1-official/image-to-video)
* [VEO 3.1（官逆）快速開始](/api-capabilities/veo/quick-start) - 同步流式呼叫示例
* [VEO 3.1（官逆）非同步 API](/api-capabilities/veo/async-api) - 含首尾幀用法
