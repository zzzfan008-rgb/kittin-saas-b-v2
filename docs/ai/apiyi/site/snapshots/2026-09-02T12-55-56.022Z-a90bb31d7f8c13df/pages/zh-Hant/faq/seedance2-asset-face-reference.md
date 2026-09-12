> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.0 呼叫 SD API 時人臉參考圖會自動上傳素材庫嗎？會被風控攔截嗎？

> Seedance 2.0 不支援直接傳含寫實人臉的參考圖，必須先把圖片入庫拿 asset:// 素材 ID 再引用，本文整理素材庫正確鏈路與防深偽攔截的應對路徑。

## 簡短回答

兩個問題分開回答：

1. **不會自動上傳**：呼叫 Seedance 2.0 介面時，**人臉參考圖不會自動入庫到素材庫**。需要單獨走素材庫上傳流程拿到 `asset://` 素材 ID，再在影片生成請求裡引用它。
2. **會被攔截**：含寫實人臉的參考圖直接傳入會被上游內容安全機制攔截。直接傳真人照片生影片會失敗。

正確鏈路有兩種走法，按你的人物型別選：

* **虛擬人像**（AI 生成的寫實人像，現實中無對應真人）：用素材庫的「虛擬人像入庫」拿 `asset://` ID 後引用
* **真人人臉**（藝人、模特、使用者本人）：先做活體掃臉認證 → 入庫時帶真人素材組 `groupId` → 拿 `asset://` ID 後引用
* **近 30 天內 Seedance 生成的產物**：可以用做二次創作的參考圖（走 Seedance 模型近 30 天內生成的含人臉產物路徑）

## 詳細說明

### 為什麼不能直接傳人臉圖？

Seedance 2.0 生成人物一致性影片時，**不能直接上傳含寫實人臉的參考圖**（防深偽攔截）。這是上游內容安全機制的限制，不是 API易 這邊的策略。

### 正確的工作流

<Steps>
  <Step title="判斷素材型別">
    先確認你的人像屬於哪一類：

    * **動漫 / 風格化角色**（二次元、卡通）：不含寫實人臉，**不需要入庫**，直接傳公網 URL 或 base64 即可
    * **虛擬人像**（AI 生成寫實人像）：走「虛擬人像入庫」，全自動無稽核
    * **真人人臉**（藝人、模特、使用者本人）：必須先做活體掃臉認證
  </Step>

  <Step title="上傳到素材庫拿 asset:// ID">
    * 網頁：在 [icover.ai 素材庫](https://icover.ai/zh/seedance-official/asset-library) 上傳圖片，等待狀態變「可用」後複製 `asset://xxx`
    * API：用 `presign` + `POST /api/asset-library/assets` 走完整程式碼鏈路，詳見 [素材引用實戰](/zh-Hant/api-capabilities/seedance2/asset-reference)
  </Step>

  <Step title="在影片生成請求裡引用素材 ID">
    Seedance 2.0 介面的 `content` 裡用 `image_url` 欄位傳 `asset://<Id>`，提示詞裡用「圖片1」指代人物。詳見 [Seedance 2.0 影片生成 API](/zh-Hant/api-capabilities/seedance2/video-generation)。
  </Step>
</Steps>

<Info>
  **兩把鑰匙，不要混用**：

  * **素材庫 KEY**（icover.ai 建立）：只用於上傳 / 入庫 / 查詢素材
  * **APIYI Seedance 影片令牌**（api.apiyi.com 建立，須勾選 `SeeDance2` 分組，2.5 與 2.0 系通用）：只用於影片生成介面

  詳細說明見 [素材庫](/zh-Hant/api-capabilities/seedance2/asset-library)。
</Info>

### 真人素材的特殊流程

真人照片不能僅靠"上傳入庫"繞過防深偽攔截——必須由**被拍攝者本人**完成活體掃臉認證（登入本人火山賬號做人臉識別），從源頭鎖定肖像權歸屬，無法由他人代為認證。具體流程：

<Steps>
  <Step title="生成真人認證連結">
    讓藝人用手機掃碼 / 開啟連結，登入其火山賬號完成活體認證
  </Step>

  <Step title="查詢認證結果">
    得到該藝人專屬的真人素材組 `groupId`
  </Step>

  <Step title="入庫時帶 groupId">
    上傳素材時帶上該組 `groupId`，通過人臉一致性校驗後拿到 `asset://` ID。同一藝人換妝造複用同一組，無需重複認證
  </Step>
</Steps>

<Warning>
  **真人 ≠ AI 生成的寫實人像**。現實中不存在對應人物的 AI 生成寫實人像（例如 Nano Banana 生成的人物）屬於「虛擬人」，直接走「虛擬人像入庫」即可，沒有授權環節。只有真實存在的人的照片才是「真人人臉」——這類圖片上傳不等於授權，必須被拍攝者本人完成活體認證。
</Warning>

## 常見問題

<AccordionGroup>
  <Accordion title="素材 ID 會過期嗎？">
    不會。`asset://` 素材 ID 永久有效，入庫一次即可反覆引用。但影片生成成功後返回的 `content.video_url` 是 24 小時有效的簽名直鏈，過期後無法訪問——**請在任務成功後立即下載轉存**。
  </Accordion>

  <Accordion title="上傳時一張圖沒通過人臉一致性校驗，能換一張嗎？">
    可以。同一個素材組可以上傳多張圖（側臉 / 多人 / 模糊可能失敗，建議清晰正面）。`asset://` ID 是素材級 ID，不是圖片級 ID——同一素材組內的不同圖共享同一個 ID。
  </Accordion>

  <Accordion title="素材庫要另外收費嗎？">
    不收。虛擬人像入庫、真人認證等私域素材庫能力在 API易 隨 Seedance 2.0 介面免費使用，不另收年費。
  </Accordion>

  <Accordion title="為什麼直接傳人臉圖會報 400？">
    上游內容安全機制攔截。HTTP 400 不扣費，但請求被拒絕——你需要在請求前完成素材入庫，再引用 `asset://` ID。
  </Accordion>
</AccordionGroup>

## 相關文件

* [Seedance 2.0 影片生成 API](/zh-Hant/api-capabilities/seedance2/video-generation)
* [Seedance 2.0 素材庫](/zh-Hant/api-capabilities/seedance2/asset-library)
* [素材引用實戰（含完整程式碼）](/zh-Hant/api-capabilities/seedance2/asset-reference)
* [Seedance 2.0 模型總覽](/zh-Hant/api-capabilities/seedance2/overview)
