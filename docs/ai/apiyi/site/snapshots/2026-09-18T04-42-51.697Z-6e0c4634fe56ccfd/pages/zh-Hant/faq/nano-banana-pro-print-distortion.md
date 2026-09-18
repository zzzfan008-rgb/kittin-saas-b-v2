> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Pro 服裝換裝時印花變形如何最佳化？

> 服裝換裝場景下提示詞最佳化、參考圖權重設定、多輪抽卡與跨通道兜底，附正反提示詞對比與排查步驟

## 簡短回答

Nano Banana Pro 印花變形不是模型壞了，而是**單次生成本身有隨機性 + 提示詞越界**兩個原因疊加。實用上按以下順序處理：

1. 先在 [imagen.apiyi.com](https://imagen.apiyi.com) 用同一提示詞 + 參考圖自測一次，排除客戶端問題
2. 改寫提示詞：去掉"嚴格鎖定""逐畫素還原"等絕對化表述，改用具體顏色 / 位置 / 保留項描述
3. 上傳清晰、特徵明確的參考圖，**使用 Base64 編碼**（Nano Banana 系列不支援 OpenAI 格式 URL 直傳）
4. 啟用多輪抽卡：建議業務程式碼對同一提示詞做 1\~3 次自動重試
5. 還不行就換通道或換模型：banana pro 預設走 AI Studio，可切 [Vertex 分組](/zh-Hant/faq/google-upstream-aistudio-vertex)；或試 [gpt-image-2 系列](/zh-Hant/api-capabilities/gpt-image-2-all/image-edit)（改圖風格更貼近原圖）

## 為什麼印花會變形

AI 生圖是**單次原子取樣**，每次呼叫都是一次獨立抽樣，沒有"嚴格還原"這一檔開關。高頻踩坑的原因有兩類：

* **提示詞表述越界**：用"嚴格鎖定不變""逐畫素還原""1:1 還原"這類絕對化措辭，模型反而會理解成"重畫一遍"，把印花一起重畫
* **參考圖傳錯了方式**：Nano Banana 系列**只支援 Base64 編碼上傳**，把 URL 直接塞進 OpenAI 相容格式的 `image_url` 欄位會讓模型"看不見"參考圖，印花自然變形

<Info>
  即使你描述得再詳細，AI 仍然有約 5%\~15% 的機率在單次取樣裡"走偏"。這不是模型不行，而是**生成式模型的固有特性**——同提示詞多次呼叫，結果天然不同。
</Info>

## 具體排查步驟

<Steps>
  <Step title="在測試工具復現，排除客戶端問題">
    開啟 [imagen.apiyi.com/#generate](https://imagen.apiyi.com/#generate)，用**完全相同的提示詞 + 參考圖**重新跑一次：

    * 工具上印花也變形 → 大機率是**提示詞本身**的問題，進 Step 2
    * 工具上印花保持得很好 → 排查你的接入方式（圖片是否真的傳進去了、引數是否對），見 [圖片與參考圖差異過大排查](/zh-Hant/faq/image-result-differs-from-reference)
  </Step>

  <Step title="改寫提示詞，去掉絕對化表述">
    把"嚴格還原""逐畫素"這種命令式措辭，換成**具體屬性描述**（見下方"提示詞最佳化示例"）。
  </Step>

  <Step title="確保參考圖正確上傳">
    * Nano Banana 系列**不支援 OpenAI 格式的 URL 上傳**，必須用 **Base64** 編碼
    * 參考圖本身要**清晰、特徵明確**：模糊或元素過多的參考圖會讓模型"猜"，印花更容易變形
    * 單張圖 ≤ **7MB**（Gemini 官方限制），建議上傳前做無失真壓縮
    * 每個提示詞最多 **14 張參考圖**；如果只想保留印花，可只傳 1 張含印花的局部圖，提高權重
  </Step>

  <Step title="啟用多輪抽卡（自動重試）">
    在業務程式碼裡對同一提示詞實現 **1\~3 次自動重試**。一次失敗不代表模型不行，多抽幾次命中率顯著上升。
  </Step>

  <Step title="換通道或換模型兜底">
    * 切到 **Vertex 分組**（在控制台給令牌選 Vertex 分組即可，程式碼無需改動）——Vertex 渠道稽核尺度與 AI Studio 不同，部分"被安全誤傷"的換裝請求能穩定通過
    * 或換 **gpt-image-2 系列**——改圖風格更貼近原圖，色偏和風格漂移更小，適合"儘量接近原圖"的需求
  </Step>
</Steps>

## 提示詞最佳化示例

下表是服裝換裝 + 印花保留場景下的常見問題改法對比：

| 寫法     | ❌ 反面示例       | ✅ 改進寫法                          |
| ------ | ------------ | ------------------------------- |
| 顏色具體化  | "換成黑色"       | "改為**啞光純黑色**，保留原有材質質感"          |
| 印花描述位置 | "印花必須嚴格鎖定不變" | "胸前印花**位置、顏色、比例、構圖**全部保持不變"     |
| 保留項清單  | "其他不變"       | "畫面其餘所有物體的**顏色、位置、文字標註**全部保持不變" |
| 動作拆分   | 一句話堆 5 個動作   | 拆成多步編輯，**每次只改一件事**              |

**改進後的完整提示詞示例**：

> 編輯這張圖，完成兩件事：① 把紅色方框內的兩隻茶壺改為啞光純黑色，保留原有材質質感和形狀；② 刪除紅色方框線本身。畫面其餘所有物體的顏色、位置、尺寸標註和文字**全部保持不變**。

<Tip>
  **通用原則：一次只改一類東西**。如果你的換裝同時涉及"換色 + 換背景 + 加文字"，拆成多次編輯，每次的成功率都會顯著高於一次堆複雜指令。
</Tip>

## 關於出圖變紅 / 整體偏色

如果你發現換裝後畫面整體偏紅或偏暖，那是另一個問題，根因通常是 [banana pro 改圖後畫面偏紅](/zh-Hant/faq/banana-pro-edit-red-cast)——和"印花變形"的成因不同，解決路徑也不同（切 Vertex 通道或換 gpt-image-2）。

## 相關文件

* [Nano Banana 系列開發指南](/zh-Hant/api-capabilities/nano-banana-dev-guide) — 模型清單、計費、Base64 上傳要求
* [圖片與參考圖差異過大排查](/zh-Hant/faq/image-result-differs-from-reference) — 參考圖傳錯格式的排查
* [Google 系模型走 AI Studio 還是 Vertex](/zh-Hant/faq/google-upstream-aistudio-vertex) — Vertex 分組切換方法
* [如何生成滿意的圖片](/zh-Hant/api-capabilities/image-generation-success-tips) — 改提示詞、重試、換模型、測試定位四大策略
* [Gemini 生圖 API 錯誤處理指南](/zh-Hant/api-capabilities/gemini-image-error-handling) — 出圖失敗/被攔截的排查
* [Nano Banana 系列出圖失敗常見原因](/zh-Hant/faq/nano-banana-image-failure) — 內容安全攔截場景
* [banana pro 改圖後畫面偏紅怎麼辦](/zh-Hant/faq/banana-pro-edit-red-cast) — 整體偏色問題

## 聯絡客服

如果按以上步驟仍然無法解決，可在工作臺聯絡客服或郵件 [hi@apiyi.com](mailto:hi@apiyi.com)，提供：

* 同一提示詞在 [imagen.apiyi.com](https://imagen.apiyi.com) 工具上的復現結果（截圖或連結）
* 當前使用的模型名（`gemini-3-pro-image-preview` / Nano Banana 2 等）
* API 呼叫時間 + 請求 ID（如有）
