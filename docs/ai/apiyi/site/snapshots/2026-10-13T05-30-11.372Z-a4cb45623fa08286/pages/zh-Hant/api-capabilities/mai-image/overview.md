> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MAI-Image 2.6 生圖/編輯

> 微軟 MAI-Image 2.6 影像模型（MAI-Image-2.6 / MAI-Image-2.6-Flash）完整指南：文生圖 + 參考圖編輯（1–5 張多圖融合），width/height 自定義尺寸最高 1536×1536，中文文字渲染出色，按次計費 $0.12 / $0.06 一張、不區分尺寸。

## 概述

**MAI-Image 2.6** 是微軟 AI（Microsoft AI）自研的影像生成模型，2026-09-04 釋出、在 Microsoft Foundry 公開預覽。釋出時在 Arena 榜單上**文生圖與圖片編輯均排第 2**，在 Artificial Analysis 榜單上**圖片編輯排第 1**（資料截至 2026-09-04，來源：微軟官方公告）。

API易 通過微軟官方渠道（官轉）提供兩個型號，共用同一套介面與引數：

* **`MAI-Image-2.6`**：旗艦版，追求畫質與精度
* **`MAI-Image-2.6-Flash`**：快速版，官方稱出圖速度是 GPT-Image-2-Medium 的 2.8 倍，適合高吞吐的生產場景

<Note>
  **核心亮點**：**中文文字渲染出色**（招牌、對聯、手寫體都能逐字正確），**編輯保真度高**（只改指定部分、其餘畫素級保留），`width` + `height` 自定義任意畫幅（最高 1536×1536 面積），**按次固定計費、不區分尺寸**。1024×1024 出圖 Flash 約 17 秒、2.6 約 30 秒。
</Note>

<Warning>
  **📌 上手前必看的三條**

  1. **只支援兩個端點**：`/v1/images/generations`（文生圖，JSON）和 `/v1/images/edits`（編輯，`multipart/form-data`）。**不支援 `/v1/chat/completions` 和 `/v1/responses`**，發過去會返回 404。
  2. **不要傳 `response_format`、`seed`、`negative_prompt`**——這三個引數會直接返回 400。返回值固定是 `data[0].b64_json`（PNG）。
  3. **尺寸用 `width` + `height`，不用 `size`**。文生圖介面傳 `size` 會被靜默忽略，結果恆為 1024×1024。
</Warning>

<Info>
  圖片 API 全部為**同步呼叫**：沒有非同步任務 ID，客戶端斷開連線結果即丟失、但請求仍會計費。請為本模型設定足夠大的 timeout，詳見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices)。
</Info>

<CardGroup cols={2}>
  <Card title="文生圖 API" icon="wand-sparkles" href="/zh-Hant/api-capabilities/mai-image/text-to-image">
    輸入文本提示詞生成圖片，帶互動式 Playground 線上除錯。
  </Card>

  <Card title="圖片編輯 API" icon="image" href="/zh-Hant/api-capabilities/mai-image/image-edit">
    上傳 1–5 張參考圖 + 編輯指令生成新圖，支援多圖融合，帶 Playground。
  </Card>
</CardGroup>

## 讓 AI Agent 幫你接入

<Note>
  在用 Codex / Claude Code / Cursor 開發的話，把下面這段提示詞複製給它。它會先抓本頁的純文本版（任意文件頁地址後加 `.md`），再按你專案的技術棧寫程式碼——超時、**三個會 400 的引數**、`width`/`height` 取代 `size`、編輯介面只認檔案上傳這幾個高頻坑已經寫死在要求裡。
</Note>

<Prompt description="讓程式設計 Agent 接入或排查 MAI-Image 2.6 的文生圖與圖片編輯。複製後直接貼上給 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  幫我在當前專案裡接入 / 排查微軟 MAI-Image 2.6 的「文生圖 + 圖片編輯」。

  先讀文件再動手：抓 [https://docs.apiyi.com/api-capabilities/mai-image/overview.md](https://docs.apiyi.com/api-capabilities/mai-image/overview.md) 拿到本頁純文本版；需要更細的引數說明時，text-to-image 和 image-edit 兩頁同樣在地址後加 `.md` 即可。

  接入要求：

  1. 模型名：旗艦版 `MAI-Image-2.6`，快速版 `MAI-Image-2.6-Flash`。**模型名大小寫敏感**，寫成全小寫會返回 503（看起來像服務故障，其實是名字錯了）。

  2. 端點：只能用 `/v1/images/generations`（JSON）和 `/v1/images/edits`（`multipart/form-data`）。**不要發 `/v1/chat/completions` 或 `/v1/responses`**，會返回 404。

  3. 超時：Flash 客戶端 timeout 設 120 秒、2.6 設 180 秒。實測 1024×1024 約 17 秒 / 30 秒，但高峰和大尺寸會更久。圖片介面是同步呼叫，沒有任務 ID，客戶端一斷連結果就丟了而且照常計費。反向代理、閘道、Serverless 執行上限這些中間層也要一起放寬。

  4. 引數紅線：**不要傳 `response_format`、`seed`、`negative_prompt`**，三者都會返回 400 `Invalid parameters`。從 gpt-image / DALL·E 遷移過來的程式碼常常顯式寫了 `response_format="b64_json"`，必須刪掉。`quality`、`output_format`、`background`、`style` 會被靜默忽略，刪掉即可。

  5. 返回處理：固定返回 `data[0].b64_json`，純 base64、不帶 `data:` 字首，解碼後是 PNG（1024×1024 約 1.5–1.7 MB）。沒有 `url` 模式。`usage` 是佔位值，不能拿來對賬，費用以控制台賬單為準。

  6. 尺寸：用 `width` + `height`（整數，必須成對傳），每一維至少 768，寬×高不超過 2,359,296（即 1536×1536 的面積），不是 16 的倍數會向下取整到 16 的倍數。兩個都不傳預設 1024×1024。**文生圖介面傳 `size` 會被靜默忽略**。

  7. 張數：文生圖一次只出 1 張，`n` 無效；需要多張就併發多次請求。編輯介面的 `n` 有效，按張計費。

  8. 編輯：參考圖必須用 multipart **檔案上傳**，欄位名 `image`；**不支援 URL 或 base64 JSON 入參**（會返回 400）。**多圖融合支援 1–5 張參考圖**：多張時重複 `image[]` 欄位（OpenAI SDK 直接傳列表 `image=[f1, f2]`），按上傳順序為圖1、圖2……，提示詞裡用「圖N」指代；超過 5 張返回 400。**不要用 `image` + `image2` 這類編號欄位名**，第二張會被丟棄（返回 200 但只用第一張）。參考圖張數不影響價格。只接受 JPEG / PNG / WebP。不支援 mask。上傳前先壓縮：超過 1.5MB 才處理，長邊等比縮到 2048px 以內，品質 0.9 重編碼，壓縮失敗就回退原圖。

  9. 錯誤處理：內容稽核攔截返回 400 `content_safety_violation`（真人名人、暴力血腥、知名 IP 角色、裸露都會被攔），改提示詞，不要重試。尺寸越界返回 400 `unsupported_request_value`，錯誤資訊裡帶具體約束。

  10. Key 從環境變數 `APIYI_API_KEY` 讀，base\_url 用 [https://api.apiyi.com/v1，不要硬編碼進程式碼、也不要提交進](https://api.apiyi.com/v1，不要硬編碼進程式碼、也不要提交進) git。

  11. 改完真跑一次文生圖 + 一次圖片編輯，把出圖結果和這兩次呼叫的花費貼給我。
</Prompt>

<Accordion title="這段提示詞替你擋掉了什麼">
  | 要求 | 擋掉的坑 |
  | - | - |
  | 刪掉 `response_format` | 遷移程式碼裡最常見的顯式引數，傳了就 400，整批失敗 |
  | 用 `width` / `height` 不用 `size` | `size` 在文生圖介面被靜默忽略，你以為設了 1536×1024，拿到的卻是 1024×1024 方圖 |
  | 編輯只用檔案上傳 | 照 OpenAI 習慣傳圖片 URL 或 base64 JSON 會 400 |
  | 多圖用重複的 `image[]`，不用 `image2` | `image` + `image2` 返回 200 但第二張被丟棄，結果裡少了圖2的內容卻很難察覺 |
  | 不發 chat / responses | 對話類客戶端會對所有模型名發 chat 請求，這裡會 404 |
  | 超時按模型給足 | 斷連的請求照常計費。詳見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices) |
</Accordion>

## 為什麼選 API易 的 MAI-Image 2.6

<CardGroup cols={2}>
  <Card title="微軟官方渠道" icon="shield-check">
    官轉接入，模型與微軟 Foundry 上的同名模型一致。走標準 `/v1/images/generations` 與 `/v1/images/edits`，響應結構與 OpenAI Images API 一致。
  </Card>

  <Card title="按次計費 · 成本可預測" icon="receipt">
    原廠按 token 計費、圖越大越貴；API易 **按張固定價、不區分尺寸**，從 768×768 到 1536×1536 同價；編輯時傳 1 張還是 5 張參考圖也同價，預算可精確到張。
  </Card>

  <Card title="全球零門檻接入" icon="globe">
    **無需 Azure 賬號與海外伺服器**，國內機房、家寬網路、海外節點均可直連 `api.apiyi.com`，一個 Key 調所有模型。
  </Card>

  <Card title="模型生態齊全" icon="layers">
    影像側還有 [GPT-Image-2](/zh-Hant/api-capabilities/gpt-image-2/overview)、[Nano Banana 2](/zh-Hant/api-capabilities/nano-banana-2-image/overview)、[Seedream](/zh-Hant/api-capabilities/seedream-image/overview)、[FLUX](/zh-Hant/api-capabilities/flux/overview) 可按場景組合。
  </Card>
</CardGroup>

## 核心特性

<CardGroup cols={2}>
  <Card title="中文文字渲染" icon="languages">
    中文招牌、豎排對聯、黑板手寫都能逐字正確，適合海報、電商主圖、文創物料
  </Card>

  <Card title="高保真編輯" icon="wand">
    「把茶壺改成鈷藍釉」只改茶壺，尺寸標註、其它物件畫素級保留
  </Card>

  <Card title="自定義畫幅" icon="maximize">
    `width` + `height` 任意組合，最長邊可到 3072（如 3072×768 橫幅），面積上限 1536×1536
  </Card>

  <Card title="雙檔速度" icon="zap">
    1024×1024 出圖 Flash 約 17 秒、2.6 約 30 秒；10 併發下延遲穩定
  </Card>
</CardGroup>

### 實測效果

**中文文字渲染**（`MAI-Image-2.6-Flash`，提示詞要求招牌寫「API易 歡迎」）：招牌、燈籠、豎排對聯、黑板手寫全部是可讀的中文。

<Frame>
  <img src="https://mintcdn.com/apiyillc/_zXMTnA1u6gpoDyM/images/mai-image-zh-text-render.jpg?fit=max&auto=format&n=_zXMTnA1u6gpoDyM&q=85&s=7b83a1cb725f1391524c334b7399ea61" alt="MAI-Image-2.6-Flash 中文文字渲染示例：古風茶館招牌寫著 API易 歡迎" width="768" height="780" data-path="images/mai-image-zh-text-render.jpg" />
</Frame>

**參考圖編輯**（`MAI-Image-2.6-Flash`，指令「把茶壺改成深鈷藍釉，其餘完全不變」）：左為原圖，右為結果。只有茶壺變色，尺寸標註與其它物件保持不變。

<Frame>
  <img src="https://mintcdn.com/apiyillc/_zXMTnA1u6gpoDyM/images/mai-image-edit-teaset.jpg?fit=max&auto=format&n=_zXMTnA1u6gpoDyM&q=85&s=c86dc86c5aadf0173e19102433c01f49" alt="MAI-Image-2.6-Flash 編輯示例：茶壺從米白改為鈷藍，其餘不變" width="1048" height="532" data-path="images/mai-image-edit-teaset.jpg" />
</Frame>

## 模型定價

| 模型 | 定位 | API易定價 | 計費方式 |
| - | - | - | - |
| **`MAI-Image-2.6`** | 旗艦，畫質優先 | **\$0.12 / 張** | 按次，不區分尺寸 |
| **`MAI-Image-2.6-Flash`** | 快速，吞吐優先 | **\$0.06 / 張** | 按次，不區分尺寸 |

<Note>模型價格可能調整；上表僅供參考，具體以頂部導航「模型價格」欄目為準：[模型價格](/zh-Hant/models/index)。</Note>

<Info>
  **計費說明**

  * **按張計費、不區分尺寸**：768×768 與 1536×1536 同價；提示詞長短不影響價格。
  * **編輯與文生圖同價**：按出圖張數計費，**參考圖傳 1 張還是 5 張都同價**；編輯介面傳 `n=2` 按 2 張計費。
  * **被攔截或引數錯誤的請求**（400）不出圖。
  * **響應體裡的 `usage` 不能用來核賬**：`prompt_tokens` 恆為 `1000 × 張數`，是佔位值，真實扣費以控制台賬單為準。
  * 可疊加 [充值加贈活動](/zh-Hant/faq/recharge-promotions)。
</Info>

## 分組與令牌

本系列在 **`Default` 預設分組**，新建令牌即可直接呼叫，無需申請。

<Info>
  **令牌「計費模式」**：選 `按量優先` 或 `按次計費` 都能正常呼叫本系列。推薦 `按量優先`，同一把令牌還能相容站內其它按 token 計費的模型。

  **速率**：單個 Key 建議控制在 **50 RPM** 以內；有大批量出圖需求請提前聯絡客服報備。
</Info>

## 技術規格

| 專案 | 規格 |
| - | - |
| 模型 ID | `MAI-Image-2.6`、`MAI-Image-2.6-Flash`（**大小寫敏感**） |
| 端點 | `/v1/images/generations`（JSON）、`/v1/images/edits`（multipart） |
| 尺寸引數 | `width` + `height`，整數、必須成對 |
| 尺寸範圍 | 每維 ≥ 768；寬×高 ≤ 2,359,296（= 1536×1536）；非 16 倍數向下取整 |
| 預設尺寸 | 1024×1024 |
| 輸出格式 | PNG（RGB），僅 `b64_json`，1024×1024 約 1.5–1.7 MB |
| 單次張數 | 文生圖固定 1 張；編輯介面 `n` 有效 |
| 參考圖 | 編輯介面檔案上傳，**1–5 張**（多張時重複 `image[]`），JPEG / PNG / WebP，張數不影響價格 |
| mask 局部重繪 | ❌ 不支援 |
| `seed` / `negative_prompt` | ❌ 傳入返回 400 |
| 流式輸出 | ❌ 不支援 |
| 出圖耗時（1024×1024） | Flash P50 約 17 秒、2.6 P50 約 30 秒 |
| 建議客戶端超時 | Flash ≥ 120 秒、2.6 ≥ 180 秒 |

## 端點一覽

| 功能 | 方法 | 路徑 | Content-Type |
| - | - | - | - |
| 文生圖 | `POST` | `/v1/images/generations` | `application/json` |
| 圖片編輯 | `POST` | `/v1/images/edits` | **`multipart/form-data`** |

<Warning>
  **❌ 不支援對話端點**

  `/v1/chat/completions` 與 `/v1/responses` 對本系列返回 **404 `Requested path is not found`**。Cherry Studio、LobeChat 這類對話式客戶端會對模型列表裡的所有模型發 chat 請求，**請不要在這類客戶端裡選用 MAI-Image**，改用支援 Images API 的工具或自己寫程式碼呼叫。
</Warning>

<Warning>
  **✅ 編輯介面只認 multipart 檔案上傳**

  傳送 JSON（`image` 填 URL、data URI 或裸 base64）到 `/v1/images/edits` 會返回 400：

  ```text theme={null}
  request Content-Type isn't multipart/form-data
  ```

  請用 `-F "image=@photo.jpg"` 直接上傳本地檔案，**不需要圖床**。完整示例見 [圖片編輯 API](/zh-Hant/api-capabilities/mai-image/image-edit)。
</Warning>

<Tip>
  主域名 `https://api.apiyi.com`，備用域名 `https://b.apiyi.com`。
</Tip>

## 關鍵引數詳解

### `width` 與 `height`（輸出尺寸）

| 規則 | 說明 |
| - | - |
| 必須成對 | 只傳其中一個返回 400 |
| 下限 | 每維至少 768，傳 767 返回 400 `'width' must be at least 768 pixels` |
| 面積上限 | 寬×高 ≤ 2,359,296，1600×1600 返回 400 `exceeds the maximum of 2359296` |
| 取整 | 非 16 倍數向下取整：1000×1000 → 992×992、1024×1023 → 1024×1008 |
| 縱橫比 | 不限，3072×768（4:1 橫幅）可出 |

**常用畫幅參考**（都在面積上限內）：

| 用途 | `width` × `height` |
| - | - |
| 方圖 | 1024×1024 / 1536×1536 |
| 橫版 3:2 | 1536×1024 |
| 豎版 2:3 | 1024×1536 |
| 橫版 16:9 | 1792×1008 |
| 豎版 9:16 | 1008×1792 |
| 橫幅 4:1 | 3072×768 |

<Warning>
  **`size` 的行為在兩個端點上不一樣**：文生圖介面傳 `size` 會被**靜默忽略**（恆出 1024×1024），編輯介面傳 `size` 卻會生效。為了避免混淆，**兩個端點都統一用 `width` + `height`**。
</Warning>

### `n`（張數）

* **文生圖**：`n` 無效，傳 2、4、10 都只返回 1 張（也只收 1 張的錢）。需要多張請併發多次請求。
* **編輯**：`n` 有效，`n=2` 返回 2 張、按 2 張計費。

## 最佳實踐

<Steps>
  <Step title="按場景選型號">
    批量出圖、對延遲敏感 → `MAI-Image-2.6-Flash`；海報主視覺、複雜構圖、對畫質要求高 → `MAI-Image-2.6`。兩者引數完全一致，切換隻改模型名。
  </Step>

  <Step title="中文文字寫進引號">
    要在圖裡出現的中文，用引號括起來並說明位置，例如：招牌上寫「API易 歡迎」。模型對引號內文字的還原度很高。
  </Step>

  <Step title="編輯時明確寫「其餘保持不變」">
    編輯指令寫成「把茶壺改成鈷藍釉，其餘部分完全保持不變」，能最大限度保留原圖。
  </Step>

  <Step title="改畫幅會重新構圖">
    編輯時傳與原圖不同比例的 `width` / `height`，模型會**重新排布畫面**而不是裁切或留白。只想改局部時不要傳尺寸，輸出會按原圖比例貼合到 16 的倍數（如 1344×756 輸入 → 1360×768 輸出）。
  </Step>

  <Step title="多張圖就併發請求">
    文生圖一次只出一張，要 4 張就併發 4 個請求。實測 10 併發延遲與單發基本一致。
  </Step>
</Steps>

## 錯誤碼與重試

| HTTP | code / 資訊 | 含義 | 處理建議 |
| - | - | - | - |
| `400` | `unsupported_request_value` | 尺寸越界、型別錯誤、`width`/`height` 不成對 | 按錯誤資訊裡的約束改引數，不要重試 |
| `400` | `invalid_request`：`Invalid parameters: xxx` | 傳了 `response_format` / `seed` / `negative_prompt` | 刪掉該欄位 |
| `400` | `invalid_request`：`Prompt must be …` | `prompt` 為空或缺失 | 補上提示詞 |
| `400` | `invalid_request_error`：`at most 5 reference images are accepted for <model>` | 編輯介面傳了超過 5 張參考圖 | 減到 5 張以內 |
| `400` | `invalid_request_error`：`reference image xxx is image/gif; only JPEG, PNG and WebP are accepted` | 參考圖格式不支援 | 轉成 JPEG / PNG / WebP 再上傳 |
| `400` | `invalid_request_error`：`<model> does not support mask edits` | 編輯介面帶了 `mask` | 去掉 mask，在提示詞裡描述修改範圍 |
| `400` | `content_safety_violation` | 內容稽核攔截 | 調整提示詞，重試無效 |
| `400` | `request Content-Type isn't multipart/form-data` | 編輯介面發了 JSON | 改為 multipart 檔案上傳 |
| `404` | `Requested path is not found` | 發到了 chat / responses 端點 | 改用 Images API |
| `500` | `image is required` | 編輯請求裡沒有圖片檔案欄位，或用了 `image1` + `image2` 這類編號欄位名 | 單圖用 `image`，多圖重複 `image[]` |
| `503` | `no available channels` | 模型名大小寫寫錯（如全小寫） | 改為 `MAI-Image-2.6` / `MAI-Image-2.6-Flash` |

<Info>
  **客戶端建議**：上表中的 4xx / 500 都是確定性錯誤，重試沒有意義，應直接告警。只有網路層超時和 `429` 值得重試，建議指數退避、最多 3 次——但注意**超時斷開的請求仍會計費**，先加大 timeout。
</Info>

## 常見問題

<AccordionGroup>
  <Accordion title="為什麼傳了 response_format 就報 400？">
    本系列只返回 `b64_json` 一種格式，**不接受 `response_format` 引數**，傳 `"b64_json"` 也一樣報 400 `Invalid parameters: response_format`。

    從 gpt-image / DALL·E 遷移過來的程式碼往往顯式寫了這個引數，刪掉即可，返回值依然在 `data[0].b64_json`。`seed` 和 `negative_prompt` 同理。
  </Accordion>

  <Accordion title="傳了 size: 1536x1024 為什麼出來還是方圖？">
    文生圖介面**不認 `size`**，會靜默忽略並按預設 1024×1024 出圖。請改成 `"width": 1536, "height": 1024`。

    編輯介面的 `size` 反而能生效，但為了兩邊寫法統一，建議都用 `width` + `height`。
  </Accordion>

  <Accordion title="能用圖片 URL 做編輯嗎？">
    **不能。** 編輯介面只接受 `multipart/form-data` 檔案上傳，`image` 填 URL、data URI 或 base64 字串都會返回 400。

    如果你手上只有圖片 URL，先在服務端下載成檔案再上傳：

    ```python theme={null}
    import requests
    img = requests.get("https://example.com/photo.jpg", timeout=30).content
    files = {"image": ("photo.jpg", img, "image/jpeg")}
    ```
  </Accordion>

  <Accordion title="能傳多張參考圖做融合嗎？">
    **能，支援 1–5 張**（2026-10-07 起），價格與單圖相同。

    * **寫法**：重複 `image[]` 欄位，`curl -F "image[]=@a.jpg" -F "image[]=@b.jpg"`；OpenAI SDK 直接傳列表 `client.images.edit(image=[f1, f2])`
    * **指代**：按上傳順序為圖1、圖2……，提示詞寫「把圖2裡的狐狸放進圖1的場景裡，圖1其餘部分保持不變」
    * **不要用 `image` + `image2`**：返回 200，但第二張被丟棄，只用第一張
    * **超過 5 張**返回 400 `at most 5 reference images are accepted for <model>`

    完整示例見 [圖片編輯 API](/zh-Hant/api-capabilities/mai-image/image-edit)。
  </Accordion>

  <Accordion title="支援 mask 局部重繪嗎？">
    **不支援**，帶 `mask` 欄位會返回 400 `<model> does not support mask edits`。局部修改請直接在提示詞裡描述修改範圍，例如「只把茶壺改成藍色，其餘部分完全保持不變」——實測本模型對這類約束的遵循度很高。
  </Accordion>

  <Accordion title="能在 Cherry Studio / LobeChat 裡用嗎？">
    **不建議。** 這類對話客戶端走的是 `/v1/chat/completions`，本系列在該端點返回 404。請使用支援 OpenAI Images API 的工具，或按本文件的程式碼示例直接呼叫。
  </Accordion>

  <Accordion title="一次能出幾張？">
    文生圖介面**固定 1 張**，`n` 傳多少都只返回 1 張、只收 1 張的錢。需要多張請併發多次請求。

    編輯介面的 `n` 有效，`n=2` 返回 2 張、按 2 張計費。
  </Accordion>

  <Accordion title="usage 裡的 token 數能用來核對賬單嗎？">
    **不能。** 響應體的 `usage.prompt_tokens` 恆為 `1000 × 張數`、`output_tokens` 恆為 0，是佔位值。本系列按張固定計費，真實扣費請以 API易 控制台的賬單記錄為準。
  </Accordion>

  <Accordion title="內容稽核嚴嗎？被攔了是什麼樣？">
    本系列走微軟官方的內容安全策略，**稽核較嚴格**：真人名人、暴力血腥、知名 IP 角色（如迪士尼）、裸露內容都會被攔截。

    被攔時返回 `400 content_safety_violation`，錯誤資訊裡帶具體原因。提示詞類攔截通常 5–8 秒內返回；少數情況是出圖後才攔截，耗時接近正常出圖。重試同樣的提示詞無效，請調整表述。
  </Accordion>

  <Accordion title="支援流式輸出嗎？">
    **不支援。** 請按普通同步請求呼叫，等待完整響應返回。
  </Accordion>

  <Accordion title="呼叫返回 503 no available channels？">
    最常見的原因是**模型名大小寫寫錯**。模型名必須嚴格寫成 `MAI-Image-2.6` 或 `MAI-Image-2.6-Flash`，寫成 `mai-image-2.6-flash` 會返回 503。
  </Accordion>
</AccordionGroup>

## 相關文件

* [MAI-Image 2.6 文生圖 API](/zh-Hant/api-capabilities/mai-image/text-to-image) - 帶 Playground 的介面參考
* [MAI-Image 2.6 圖片編輯 API](/zh-Hant/api-capabilities/mai-image/image-edit) - 參考圖編輯
* [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices) - 超時、斷連、壓縮通用建議
* [充值加贈活動](/zh-Hant/faq/recharge-promotions)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.