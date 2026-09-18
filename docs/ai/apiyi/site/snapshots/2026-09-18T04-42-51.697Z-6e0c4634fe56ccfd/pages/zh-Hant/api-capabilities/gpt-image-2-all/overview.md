> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-2.5-All 生圖/編輯

> GPT 影像生成 ChatGPT 網頁版官逆模型 gpt-image-2-all，$0.03/張按次計費，約 30–60 秒出圖，支援文生圖、多圖融合編輯、自然語言改圖，文字還原度高、中文提示詞友好。

<Info>
  圖片 API 全部為**同步呼叫**：沒有非同步任務 ID，客戶端斷開連線結果即丟失、但請求仍會計費。請為本模型設定足夠大的 timeout，詳見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices)。
</Info>

## 概述

**gpt-image-2.5-all** 與 **gpt-image-2-all** 是 API易 平臺的 **GPT 影像生成官逆模型**（逆向 ChatGPT 網頁版）。ChatGPT 網頁版已整體升級到 Images 2.5，所以 `gpt-image-2-all` 現在出的就是 2.5 的圖；新增的 `gpt-image-2.5-all` 只是把這次升級表達在模型名上，**兩個名字同價、同行為、可互換**，新專案直接用 `gpt-image-2.5-all`。以 **\$0.03/張** 的極具競爭力的按次計費定價，**約 30–60 秒出圖**，支援 **文生圖 / 單圖編輯 / 多圖融合 / 自然語言改圖**，文字還原度高、原生支援中文提示詞。

<Note>
  **🎨 核心亮點**：官逆通道穩定、定價統一每張 \$0.03，無需關心 size/quality/n 等引數，尺寸與風格全部寫進 prompt 即可——最適合"開箱即用"的影像生成場景。統一使用 OpenAI Images API 標準端點：`/v1/images/generations`（文生圖）與 `/v1/images/edits`（圖片編輯）。

  **需要鎖定輸出尺寸或 4K？** 請改用姐妹模型 [`gpt-image-2-vip`](/zh-Hant/api-capabilities/gpt-image-2-vip/overview)——呼叫方式與本模型完全一致，僅多一個 `size` 欄位。
</Note>

<CardGroup cols={2}>
  <Card title="文生圖 API" icon="wand-sparkles" href="/zh-Hant/api-capabilities/gpt-image-2-all/text-to-image">
    `/v1/images/generations`，輸入文本提示詞生成圖片。
  </Card>

  <Card title="圖片編輯 API" icon="image" href="/zh-Hant/api-capabilities/gpt-image-2-all/image-edit">
    `/v1/images/edits`，multipart 上傳參考圖 + 編輯/融合指令。
  </Card>
</CardGroup>

## 讓 AI Agent 幫你接入

<Note>
  在用 Codex / Claude Code / Cursor 開發的話，把下面這段提示詞複製給它。它會先抓本頁的純文本版（任意文件頁地址後加 `.md`），再按你專案的技術棧寫程式碼——超時、base64 渲染、上傳壓縮、以及本模型「不接受哪些引數」這幾個高頻坑已經寫死在要求裡。
</Note>

<Prompt description="讓程式設計 Agent 接入或排查 gpt-image-2-all 的文生圖與圖片編輯。複製後直接貼上給 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  幫我在當前專案裡接入 / 排查 gpt-image-2-all 的「文生圖 + 圖片編輯」。

  先讀文件再動手：抓 [https://docs.apiyi.com/api-capabilities/gpt-image-2-all/overview.md](https://docs.apiyi.com/api-capabilities/gpt-image-2-all/overview.md) 拿到本頁純文本版；需要更細的引數說明時，text-to-image 和 image-edit 兩頁同樣在地址後加 `.md` 即可。

  接入要求：

  1. 超時：客戶端 timeout 提到 360 秒兜底。圖片介面是同步呼叫，沒有任務 ID，客戶端一斷連結果就丟了、但這次請求照樣計費，所以寧可多等也不要過早超時。反向代理、閘道、Serverless 執行上限這些中間層也要一起放寬，任何一層小於生成時間都會掐斷請求。

  2. 返回渲染：預設返回 base64（`b64_json`，不帶 `data:` 字首），也可以顯式傳 `response_format: "url"` 拿 CDN 直鏈。**請顯式傳 `response_format`，不要依賴預設值**——歷史上預設行為隨分組和負載變化過。走 base64 就要能渲染展示並提供「儲存到本地」；走 url 則要注意連結約 24 小時後失效，必須服務端立即下載轉存。同一條 `data[]` 裡只會有 `url` 和 `b64_json` 其中一個，解析時兩種都要兜住。

  3. 上傳壓縮：調 `/v1/images/edits`（multipart）前先壓縮參考圖——超過 1.5MB 才處理，長邊等比縮到 2048px 以內（不放大小圖），以品質 0.9 重編碼、保持原格式；多圖時合計控制在 6MB 以內，單圖不要超過 10MB。某張圖壓縮失敗就回退用原圖繼續，不要因為壓縮失敗中斷整個請求。

  4. 引數紅線：本模型**不接受** `size` / `quality` / `n` / `aspect_ratio`，請求裡一個都不要帶。特別注意兩點：傳 `n=3` 會按 3 張扣費但仍然只返回 1 張圖；OpenAI SDK 的 `client.images.generate()` 會預設帶上 `size` 和 `n`，所以這裡**直接發原始 HTTP 請求更穩妥**。輸出尺寸靠提示詞字首控制（比如在提示詞開頭寫「橫版 16:9」），本頁有驗證過的「提示詞到實際解析度」對照表，照著用。

  5. Key 從環境變數 `APIYI_API_KEY` 讀，base\_url 用 [https://api.apiyi.com/v1，不要硬編碼進程式碼、也不要提交進](https://api.apiyi.com/v1，不要硬編碼進程式碼、也不要提交進) git。

  6. 改完真跑一次文生圖 + 一次圖片編輯，把出圖結果和這兩次呼叫的花費貼給我。
</Prompt>

<Accordion title="這段提示詞替你擋掉了什麼">
  | 要求                    | 擋掉的坑                                                                                                                              |
  | --------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
  | timeout 提到 360 秒      | 主流 HTTP 客戶端預設 30-60 秒超時，會在服務端還在正常出圖時掐斷請求，而**斷連的請求照常計費**。詳見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices) |
  | 顯式傳 `response_format` | 預設值歷史上變過；不顯式指定就得同時兜住 `url` 和 `b64_json` 兩種形態                                                                                      |
  | 不傳 `n`                | 傳 `n=3` 會按 3 張扣費，但仍然只返回 1 張圖                                                                                                      |
  | 不傳 `size` / `quality` | 本模型不接受這兩個引數，尺寸靠提示詞字首控制                                                                                                            |
  | 上傳前壓縮                 | 手機原圖動輒 4-5MB，base64 編碼後還會再膨脹約 33%。壓縮標準見 [圖片壓縮與輸出解析度說明](/zh-Hant/api-capabilities/image-compression-resolution)                    |
</Accordion>

## 核心特性

<CardGroup cols={2}>
  <Card title="極具競爭力定價" icon="dollar-sign">
    統一按次計費 \$0.03/張，無解析度階梯，出圖成本可預測
  </Card>

  <Card title="文字還原度高" icon="type">
    圖內中英文、招牌、海報文字還原穩定，適合資訊圖與營銷物料
  </Card>

  <Card title="中文提示詞友好" icon="languages">
    原生理解中文描述，無需翻譯即可獲得高品質輸出
  </Card>

  <Card title="多圖融合編輯" icon="layers">
    支援多張參考圖同時輸入，prompt 中可用「圖1/圖2/圖3」指代
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="出圖速度較快" icon="bolt">
    約 30–60 秒出圖，比 `gpt-image-2-vip` 和官轉 `gpt-image-2` 都更快
  </Card>

  <Card title="R2 CDN 加速返回" icon="cloud">
    顯式傳 `response_format: "url"` 返回 R2 CDN 連結，全球低延遲下載
  </Card>

  <Card title="自然語言改圖" icon="message-circle">
    支援通過對話描述直接改圖，無需蒙版，可多輪迭代
  </Card>

  <Card title="標準端點相容" icon="plug">
    相容 OpenAI Images API 標準端點 `/images/generations`、`/images/edits`
  </Card>
</CardGroup>

## 模型定價

| 模型名                 | 計費方式 | 價格                        | 輸出                           |
| ------------------- | ---- | ------------------------- | ---------------------------- |
| `gpt-image-2-all`   | 按次計費 | **\$0.03 / 張**            | 單次返回 1 張圖片                   |
| `gpt-image-2.5-all` | 按次計費 | **\$0.03 / 張**（與 -all 相同） | 單次返回 1 張圖片，模型為 GPT-Image 2.5 |

<Info>
  **計費說明**：

  * 統一定價，不區分解析度、品質或提示詞長度
  * 失敗請求不計費（如鑑權失敗、引數校驗失敗）
  * 如需生成 N 張，客戶端並行呼叫 N 次
</Info>

<Tip>
  **同價姐妹模型**：[`gpt-image-2-vip`](/zh-Hant/api-capabilities/gpt-image-2-vip/overview)（Adobe 官逆線路（Firefly））同樣 \$0.03/張，支援 30 檔常見 size（含 4K），呼叫方式與本模型完全一致——需要鎖定輸出尺寸時切過去即可。
</Tip>

## 分組介紹

`gpt-image-2-all` **放在 `Default` 預設分組**即可，不需要額外切分組。逆向通道目前供給穩定，不存在像官轉那樣需要"企業分組"過渡的場景。

| 模型                  | 分組           | 備註                                               |
| ------------------- | ------------ | ------------------------------------------------ |
| `gpt-image-2-all`   | `Default`    | 逆向 ChatGPT 官網線路，統一 \$0.03/張，約 30–60 秒出圖          |
| `gpt-image-2.5-all` | `Default`    | 同上線路的 GPT-Image 2.5 版本，統一 \$0.03/張，分組與 -all 相同   |
| `gpt-image-2-all`   | `image2_OSS` | **1x 倍率（不加價）**，確定性 URL 輸出——預設分組資源緊張時不會降級為 base64 |

### 需要確定性 URL 輸出 → 切到 `image2_OSS` 分組

`gpt-image-2-all`（及 `gpt-image-2-vip`）在預設分組下**實測（2026-07）不傳 `response_format` 時返回 `b64_json`**；顯式傳 `response_format: "url"` 可拿到圖片 URL。但預設分組的輸出格式**不做承諾**——歷史上曾預設返回 `url`、資源緊張時降級為 `b64_json`，行為隨負載與渠道版本變化過。

如果你的業務**強依賴 URL 輸出**（直接把 URL 落庫、前端按 URL 渲染、不接受 base64），請把令牌分組切到 **`image2_OSS`**——這是專為 **URL 輸出確定性**設計的分組，**1x 倍率（不加價）**，對 `gpt-image-2-all` 和 `gpt-image-2-vip` 兩個官逆模型都生效，保證響應穩定輸出圖片 URL，不會降級為 base64。

<Frame caption="令牌建立：計費模式選「按量優先」，分組選 image2_OSS（1x）——需要確定性 URL 輸出時使用">
  <img src="https://mintcdn.com/apiyillc/eNGQJU-a_dFb12gU/images/image2-oss-token-setup-20260525.png?fit=max&auto=format&n=eNGQJU-a_dFb12gU&q=85&s=727f61464cc759006a59e8de6ceccd32" alt="令牌建立介面：計費模式「按量優先」，選擇分組 image2_OSS（1x 倍率），支援輸出為圖片 URL 的分組，適合 gpt-image-2-all 與 gpt-image-2-vip" width="1278" height="846" data-path="images/image2-oss-token-setup-20260525.png" />
</Frame>

<Tip>
  **進階玩法（同時使用 `gpt-image-2-vip` 與官轉 `gpt-image-2`）**：如果你的令牌同時覆蓋逆向兩模與官轉 `gpt-image-2`，可以在令牌的「分組優先順序」裡這樣配——

  * **第一優先順序**：`image2Enterprise`（1.2x 企業分組，官轉專用穩定通道）
  * **預設（兜底）**：`Default`（逆向兩模都在這裡，按模型路由）

  這樣官轉 `gpt-image-2` 走企業分組保穩，逆向兩模仍走預設分組——一把令牌覆蓋三種模型，互不干擾。
</Tip>

📖 關於 `image2Enterprise` 企業分組：[/live/2026-04/image2-enterprise](/live/2026-04/image2-enterprise)

## 技術規格

| 維度         | 引數                                                                       |
| ---------- | ------------------------------------------------------------------------ |
| **模型名**    | `gpt-image-2-all`                                                        |
| **渠道性質**   | 官方逆向（逆向 ChatGPT 官網）                                                      |
| **定價**     | \$0.03 / 張，按次計費                                                          |
| **出圖速度**   | 約 30–60 秒                                                                |
| **輸出解析度**  | 無顯式 size 引數，由模型自適應（建議在 prompt 中描述）                                       |
| **預設響應格式** | `b64_json`（純 base64，**無 `data:` 字首**，2026-07 實測；建議顯式傳 `response_format`） |
| **可選響應格式** | `url`（R2 CDN 加速連結，**預設 1 天有效期**，需顯式傳 `response_format: "url"`）           |
| **中文提示詞**  | ✅ 原生支援                                                                   |
| **支援能力**   | 文生圖、單圖編輯、多圖融合、自然語言改圖                                                     |

<Warning>
  本模型為**自適應輸出尺寸**，不等同於官轉 `gpt-image-2` API。需要嚴格鎖定輸出尺寸或 4K 時，請改用 [`gpt-image-2-vip`](/zh-Hant/api-capabilities/gpt-image-2-vip/overview)（Adobe 官逆線路（Firefly），30 檔 size 含 4K）；需要官方完全一致字段時，請使用 [`gpt-image-2`](/zh-Hant/api-capabilities/gpt-image-2/overview)（官轉）。
</Warning>

<Warning>
  **⏰ 圖片 URL 有效期：預設 1 天**

  `url` 模式響應的 `url` 欄位是 R2 CDN 加速連結，**有效期約 24 小時**，過期後訪問會 404。對於需要長期儲存的圖片（商品圖、使用者作品、歷史記錄等），請**在生成後儘快轉存到自己的物件儲存 / CDN / 資料庫**。

  兩種常見做法：

  * **服務端立即下載併入庫**：收到響應後用 `requests` / `fetch` 把圖片拉回來存到 S3 / OSS / R2 / 本地磁碟
  * **改用 `b64_json` 響應格式**：直接拿到 base64 圖片資料，省一次跨域下載，適合前端直接渲染或寫入檔案
</Warning>

## 端點一覽

| 端點                            | 用途            | Content-Type          | 適用場景                                     |
| ----------------------------- | ------------- | --------------------- | ---------------------------------------- |
| `POST /v1/images/generations` | 文生圖           | `application/json`    | OpenAI Images API 標準格式，方便同一套程式碼同時呼叫官轉與官逆 |
| `POST /v1/images/edits`       | 圖片編輯（單圖 / 多圖） | `multipart/form-data` | OpenAI Images API 標準格式，方便同一套程式碼同時呼叫官轉與官逆 |

<Tip>
  **統一使用 OpenAI Images API**（`/v1/images/generations` + `/v1/images/edits`），理由有二：

  1. **更穩定**：上游對 Images API 通道的資源供給更充足，呼叫成功率更高
  2. **相容官轉，便於切換**：與官轉 [`gpt-image-2`](/zh-Hant/api-capabilities/gpt-image-2/overview) 呼叫方式、`size` 等引數完全相容——遇到官逆通道風控異常時，**只需更換 `model` 名即可切換**，業務程式碼零改動

  另有對話式端點（`/v1/chat/completions`，不主推），見下方「常見問題」。
</Tip>

<Tip>
  **域名選擇**：`api.apiyi.com` 為主域名，也可使用 `b.apiyi.com` / `vip.apiyi.com` 等平臺提供的其他閘道域名，響應行為一致。
</Tip>

<Info>
  **想用 `size` 引數鎖定輸出尺寸？** 改用姐妹模型 [`gpt-image-2-vip`](/zh-Hant/api-capabilities/gpt-image-2-vip/overview)——端點完全一致，僅多一個 `size` 欄位（30 檔常見 size，含 4K）。
</Info>

## 尺寸與比例控制（寫進 prompt）

`gpt-image-2-all` 沒有 `size` 引數，尺寸通過 prompt 描述。如果你需要嚴格鎖定輸出尺寸（電商主圖、海報模板、4K 桌布等），請改用 [`gpt-image-2-vip`](/zh-Hant/api-capabilities/gpt-image-2-vip/overview)。

### 經過驗證的「提示詞 → 實際解析度」對照表

下表是實測復現穩定的 8 種寫法。把第一列的描述放在 prompt **最前面**，就能拿到第二列的解析度（輸出全部在 1.5K 畫素量級）：

| 提示詞包含描述   | 實測解析度       | 檔案體積     | 實際比例 |
| --------- | ----------- | -------- | ---- |
| `橫版 16:9` | 1672 × 941  | \~1.9 MB | 16:9 |
| `豎屏 9:16` | 941 × 1672  | \~2.1 MB | 9:16 |
| `4:3`     | 1448 × 1086 | \~2.3 MB | 4:3  |
| `3:4`     | 1086 × 1448 | \~2.5 MB | 3:4  |
| `3:2 尺寸`  | 1536 × 1024 | \~2.9 MB | 3:2  |
| `2:3 尺寸`  | 1024 × 1536 | \~3.0 MB | 2:3  |
| `2:5 豎屏`  | 793 × 1983  | \~1.9 MB | 2:5  |
| `5:2 橫屏`  | 1983 × 793  | \~1.9 MB | 5:2  |

<Info>
  **使用須知**：

  * 輸出統一在 \~1.5K 量級（最長邊 1500–2000 px），**不是真正的"任意解析度"**——所有 8 種寫法都屬於"約 1.5K"水平的模型上限
  * prompt 裡**只**包含表中描述詞時復現度最高；和其它構圖詞混寫會發生偏離
</Info>

### 風格化補充寫法（無固定解析度）

下面這些寫法沒有穩定的實測解析度，僅作風格修飾用，搭配上表使用：

| 需求   | 寫法（僅風格參考，不保證解析度）            |
| ---- | --------------------------- |
| 方形   | `1024×1024 方圖` / `1:1 方形構圖` |
| 超寬橫幅 | `橫幅 21:9 超寬銀幕`              |
| 畫幅風格 | `電影畫幅` / `手機海報` / `方形構圖`    |

<Tip>
  **技巧**：在 prompt **開頭** 描述尺寸/構圖，模型遵循度更高。
</Tip>

### 把這張表暴露給終端使用者

雖然 `gpt-image-2-all` 沒有 `size` 引數，但接入方完全可以在前端加一個「尺寸 / 比例」下拉框，給使用者**和官方 size 一樣的體驗**：

* 每個選項的 value 直接用上表的 prompt 字首（如 `橫版 16:9`）
* label 同時展示**預期解析度**（如 `橫版 16:9 (1672×941)`），讓使用者對最終輸出有數
* 後端把選中的 prefix 拼到使用者原始 prompt 的最前面再發給 API

```js theme={null}
const SIZE_OPTIONS = [
  { label: "橫版 16:9 (1672×941)", prefix: "橫版 16:9" },
  { label: "豎屏 9:16 (941×1672)", prefix: "豎屏 9:16" },
  { label: "4:3 (1448×1086)",      prefix: "4:3" },
  { label: "3:4 (1086×1448)",      prefix: "3:4" },
  { label: "3:2 (1536×1024)",      prefix: "3:2 尺寸" },
  { label: "2:3 (1024×1536)",      prefix: "2:3 尺寸" },
  { label: "2:5 豎屏 (793×1983)",  prefix: "2:5 豎屏" },
  { label: "5:2 橫屏 (1983×793)",  prefix: "5:2 橫屏" },
];

const finalPrompt = `${selected.prefix}，${userPrompt}`;
```

<Warning>
  底層模型仍是**自適應**——返回解析度允許 ±少量畫素偏差，請不要在 UI 上向用戶承諾"畫素級精確"。**需要嚴格鎖死輸出尺寸**（電商主圖、海報模板、4K 桌布等），請改用姐妹模型 [`gpt-image-2-vip`](/zh-Hant/api-capabilities/gpt-image-2-vip/overview)——同價、同套呼叫程式碼，僅多一個 `size` 欄位。
</Warning>

## 最佳實踐

<Steps>
  <Step title="輸入圖先壓到 1.5MB 以內（圖生圖 / 多圖融合）">
    上傳給介面的每張圖先壓到 **1.5MB 以內**（JPEG 品質 80-90 / 解析度適當下調），多圖融合時也按這個標準逐張控制。偶發的服務端錯誤大多就是圖片體積過大觸發的，壓一下請求成功率和出圖速度都會明顯改善。**輸出解析度由 prompt 的畫幅描述決定，與輸入圖體積無關**——壓小輸入只會提速、不會損畫質。提示詞裡光寫 `4K` / `8K` 這類詞也不會真給你高畫質；要穩定拿到大圖請用上文「經過驗證的『提示詞 → 實際解析度』對照表」裡的寫法。
  </Step>

  <Step title="尺寸寫在 prompt 開頭">
    把比例、解析度、畫幅描述放在提示詞最前面，模型遵循度更高。
  </Step>

  <Step title="大膽使用文字元素">
    該模型文字還原度是主要賣點，招牌、海報、資訊圖都可直接寫中英文文字。
  </Step>

  <Step title="多圖融合標註順序">
    重複傳入的同名 `image` 欄位順序有意義，在 prompt 裡可用「圖1/圖2/圖3」明確指代。
  </Step>

  <Step title="響應格式按需選擇">
    Web 應用直接渲染用 `b64_json`，服務端中轉儲存用 `url`。
  </Step>

  <Step title="超時設到 300 秒">
    典型 30–60s，但疊加圖片上傳 / 下載、官逆高峰長尾後實際耗時波動較大。**保守按 300 秒配**，避免大量誤超時。
  </Step>

  <Step title="清理不接受的引數">
    `gpt-image-2-all` 不接受 `size`、`n`、`quality`、`aspect_ratio`，傳入可能觸發引數校驗錯誤——請把它們從請求裡去掉。需要傳 `size` 時改用 [`gpt-image-2-vip`](/zh-Hant/api-capabilities/gpt-image-2-vip/overview)。
  </Step>
</Steps>

## 錯誤碼與重試

| 狀態碼   | 含義                 | 建議                       |
| ----- | ------------------ | ------------------------ |
| `401` | 令牌無效               | 檢查 Bearer Token          |
| `429` | 限流/額度不足            | 指數退避重試                   |
| `5xx` | 閘道/後端臨時錯誤          | 重試 1–2 次                 |
| 超時    | 官逆高峰偶發 + 圖片上傳/下載長尾 | 客戶端設定 **≥ 300s 超時**（保守值） |

<Info>
  **建議客戶端**：

  * 請求超時 **300 秒** 起步（保守值；典型 30–60s，但疊加圖片上傳 / 下載、官逆高峰長尾後波動大，按 120s 配置容易誤超時）
  * 對 5xx 與超時做 **指數退避重試**（建議 2–3 次）
  * 記錄響應頭 `request-id` 方便排查
</Info>

## 常見問題

<AccordionGroup>
  <Accordion title="我同時看到 gpt-image-2-all 和 gpt-image-2-vip，該選哪個？">
    兩者價格一樣（\$0.03/次），都是逆向通道，**呼叫方式完全一致**，差異主要在 `size` 和出圖速度：

    * **不需要嚴格控尺寸、追求出圖速度** → `gpt-image-2-all`（約 30–60s 出圖，尺寸寫進 prompt）。
    * **要鎖死輸出尺寸或要 4K** → [`gpt-image-2-vip`](/zh-Hant/api-capabilities/gpt-image-2-vip/overview)（約 90–150s 出圖，30 檔常見 size 含 4K）。
    * **需要畫質引數 `quality` 或 OpenAI 官方完全對齊欄位** → 改用官方版 [`gpt-image-2`](/zh-Hant/api-capabilities/gpt-image-2/overview)。
  </Accordion>

  <Accordion title="能同時生成多張圖嗎？">
    本模型單次返回 1 張。如需 N 張，請客戶端並行呼叫 N 次。每張獨立按 \$0.03 計費。
  </Accordion>

  <Accordion title="支援 n 引數嗎？傳 n=3 會怎樣？">
    **不支援。** 本模型單次只返回 1 張圖，請通過**重複呼叫 / 併發呼叫**的方式生成多張。

    ⚠️ **重要**：如果在請求裡傳入 `n=3`，**計費會按 0.03 × 3 = \$0.09 扣費**，但**實際上仍然只返回 1 張圖**。請務必把 `n` 欄位從請求裡去掉，避免被多扣費。
  </Accordion>

  <Accordion title="內容被拒/模型回覆「我不能做到這個需求」，會計費嗎？">
    官逆是**同步對話式返回**，結果分兩種情況，**計費規則不同**：

    **1) 返回 5xx 狀態碼 → 不計費**

    上游內容策略明確攔截時會返回類似：

    ```json theme={null}
    {
      "error": {
        "message": "沒有按照預期生成圖片，請重新調整提示詞後重試（traceid: 0672821c6951af183dbf847130caaf16）",
        "localized_message": "Unknown error",
        "type": "invalid_request_error",
        "param": "",
        "code": null
      }
    }
    ```

    這種"明確報錯"呼叫**不計費**，引導使用者調整提示詞重試即可。

    **2) 返回 200 狀態碼（模型用文字軟拒絕）→ 計費**

    模型在對話裡軟拒絕、用文字回覆（例如「我不能做到這個需求」「抱歉，這個請求涉及……」），從協議層看就是一次正常的對話返回，**這種情況會被計費**。官逆目前沒有辦法在協議層提前識別"這一段是拒絕文字而不是圖片"。

    **為什麼不能直接對軟拒絕免單？**

    強行對所有"軟拒絕"都不計費意味著平臺要為每次失敗承擔上游成本；更關鍵的是，**頻繁觸發上游內容安全會讓供應方賬號更容易被封號**——這部分供給側的硬成本也無法完全規避。

    **給接入方的建議**

    * ✅ **前置內容過濾 / 風險提示**：在前端或接入層先做一道關鍵詞與場景過濾（如真實姓名、版權角色、敏感題材），並在 UI 上提示"涉及名人/版權題材時上游限制較嚴，可能失敗也會計費"，能顯著降低誤扣率。
    * ✅ **C 端產品月度補發**：理解 C 端產品無法完全控制使用者輸入。如果你的月用量較大（**月消費 \$1000+ 起**），可以**按月彙總日誌**（短耗時呼叫通常對應軟拒絕）聯絡客服一次性人工補發，無須逐條申訴。

    📖 相關：[官逆 500 多為內容違規](/live/2026-04/gpt-image-2-all-500-content-policy)
  </Accordion>

  <Accordion title="b64_json 字首要不要自己加 data:image/png;base64,？">
    **先檢測再處理**。2026-07 實測返回的 `b64_json` 為純 base64（不帶字首），需要解碼寫檔案或自行拼接字首後再渲染；但**歷史版本曾直接帶字首**。請在程式碼裡做 `startsWith('data:')` 檢測：有字首直接用作 `img src`，無字首先解碼，避免雙重拼接或帶字首解碼產出損壞的圖片。
  </Accordion>

  <Accordion title="為什麼提示詞裡寫了 1024x1024 還是拿到別的尺寸？">
    自適應模型對尺寸描述是"參考"不是"強制"。提升遵循度的寫法：把尺寸/畫幅詞放在 prompt 最前面，並配合畫幅風格詞（如 `電影畫幅`、`手機海報`、`方形構圖`）。

    具體能穩定復現的寫法和對應解析度，參見上文「尺寸與比例控制 → 經過驗證的『提示詞 → 實際解析度』對照表」。
  </Accordion>

  <Accordion title="輸入圖要壓縮嗎？提示詞裡寫 4K / 8K 有用嗎？">
    **強烈建議壓**。單張輸入圖壓到 **1.5MB 以內**（JPEG 品質 80-90 / 解析度適當下調）：偶發的服務端錯誤大多就是圖片體積過大觸發的，壓一下請求成功率和出圖速度都會明顯改善。注意 1.5MB 是**推薦上限**（追求穩定性與速度），上面 FAQ 寫的 10MB 是閘道硬上限。

    **別擔心壓輸入會損畫質**——本模型輸出解析度由 prompt 的畫幅描述決定，跟你上傳圖的體積沒關係。壓小輸入只會提速、不會損畫質。

    **提示詞光寫 `4K` / `8K` 這類詞也不會真給你高畫質**——這些只是修飾詞，模型不會因此提解析度。要穩定拿到大圖，請用上文「經過驗證的『提示詞 → 實際解析度』對照表」裡驗證過的寫法（如 `電影畫幅`、`手機海報`、`方形構圖`）；需要嚴格鎖尺寸或 4K 請改用 [`gpt-image-2-vip`](/zh-Hant/api-capabilities/gpt-image-2-vip/overview)（30 檔 size，含 4K，同價 \$0.03/張）。
  </Accordion>

  <Accordion title="參考圖最大多大？格式要求？">
    推薦 **單張 ≤ 10MB**，格式 `png` / `jpg` / `webp`。過大的圖可能觸發閘道限制。多圖融合時每張都需滿足此限制。
  </Accordion>

  <Accordion title="生成的圖片 URL 有效期是多久？需要自己轉存嗎？">
    `url` 模式響應的 `url` 欄位是 **R2 CDN 加速連結，有效期約 1 天（24 小時）**，過期後會 404。

    **強烈建議**：生成後儘快把圖片 **轉存到自己的物件儲存（S3 / OSS / R2）、CDN 或資料庫**，不要長期直接引用本服務返回的 URL。

    **兩種推薦做法**：

    * **服務端中轉**：收到響應後立即 `requests.get(url)` 把圖片拉回來存到你自己的儲存，把你自己的 URL 返回給前端；
    * **改用 b64\_json**：請求時加 `"response_format": "b64_json"`，直接拿到 base64 圖片資料，少一次跨域下載，適合前端直接渲染或寫入檔案。

    如果只是短期展示（如單次會話預覽），可以直接用 R2 URL 無需轉存。
  </Accordion>

  <Accordion title="能流式返回嗎？">
    本模型為一次性出圖，不支援 stream 輸出。如果對響應延遲敏感，建議客戶端顯示"生成中"進度提示，併合理配置 **300s 超時**（保守值）。
  </Accordion>

  <Accordion title="能用 OpenAI 的官方 SDK 直連嗎？">
    可以。把 `base_url` 指向 `https://api.apiyi.com/v1`，`api_key` 設為 API易 令牌即可。但 `client.images.generate()` 方法預設帶 `size`/`n` 引數——本模型不接受這兩個引數，建議直接用 `requests` / `fetch` 發原生 HTTP 請求呼叫 `/v1/images/generations` 與 `/v1/images/edits`。
  </Accordion>

  <Accordion title="中文提示詞和英文提示詞效果差異大嗎？">
    本模型原生支援中文，兩者效果接近。對中文特有的場景（如中式書法、傳統節日元素）中文表達更自然。
  </Accordion>

  <Accordion title="還能用 /v1/chat/completions 對話方式出圖嗎？">
    可以，端點仍然可用，但**不再主推**——推薦統一使用 `/v1/images/generations` 與 `/v1/images/edits`（更穩定、與官轉 `gpt-image-2` 同套程式碼）。

    對話方式僅適合兩類場景：多輪迭代改圖、需要直接傳線上圖片 URL。注意出圖意圖不夠明確時可能返回純文字而不是圖片（可在提示詞開頭加「生成圖片：」字首強化）。

    詳細引數見 [對話式呼叫說明](/api-capabilities/gpt-image-2-all/chat-completions)。
  </Accordion>
</AccordionGroup>

## 相關文件

* [⚖️ 官轉 vs 官逆 對比](/zh-Hant/api-capabilities/gpt-image-2/vs-gpt-image-2-all) - 與官方版 `gpt-image-2` 選型對照表
* [文生圖 Playground](/zh-Hant/api-capabilities/gpt-image-2-all/text-to-image) - `/v1/images/generations` 相容端點
* [圖片編輯 Playground](/zh-Hant/api-capabilities/gpt-image-2-all/image-edit) - `/v1/images/edits` 多圖融合與改圖
* [GPT-Image-2-VIP（同價、支援 size 和 4K）](/zh-Hant/api-capabilities/gpt-image-2-vip/overview) - 同價位姐妹模型，30 檔常見 size（含 4K），呼叫方式與本模型完全一致
* [GPT-Image-2 官方版（按 token 計費）](/zh-Hant/api-capabilities/gpt-image-2/overview) - 需要 `quality` 引數 / mask 局部重繪 / OpenAI 官方對齊欄位時的選擇
* [GPT-Image 系列總覽](/api-capabilities/gpt-image-series) - 官方 GPT-Image 系列對比
* [社群貢獻：Luck GPT-Image 2 ComfyUI 節點](/zh-Hant/scenarios/ecosystem/luckgpt2-comfyui) - 在 ComfyUI 中一鍵呼叫 `gpt-image-2-all`（支援 chat\_completions / images\_api 雙端點）
* [社群貢獻：APIYI GPT-Image 2 Skills](/zh-Hant/scenarios/ecosystem/apiyi-gpt-image-skills) - 在 Codex CLI / Cursor / Gemini CLI 等 AI 程式設計工具中一句話呼叫
* [API 使用手冊](/zh-Hant/api-manual) - 通用呼叫規範

<Info>
  gpt-image-2-all 屬於官逆通道，行為對齊但定價/能力與官方版本不完全一致。如需官方直連版本，請參考 [GPT-Image-1.5](/api-capabilities/gpt-image-1-5)。
</Info>
