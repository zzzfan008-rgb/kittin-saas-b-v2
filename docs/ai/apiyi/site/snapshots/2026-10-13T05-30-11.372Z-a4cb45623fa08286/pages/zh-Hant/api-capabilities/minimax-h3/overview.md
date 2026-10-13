> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MiniMax-H3 影片生成

> MiniMax H3（海螺 3.0）影片生成接入指南：一個端點覆蓋文生、首尾幀、參考圖/影片/音訊生影片，原生立體聲，768P、4–15 秒，按秒計費 $0.03/秒。

## 概述

MiniMax H3（海螺 3.0）是 MiniMax 於 2026-07-31 (UTC+8) 釋出的全模態影片生成模型：一個模型同時理解文本、圖片、影片和音訊，直接輸出**帶立體聲音軌**的影片。API易 通過開源權重自部署通道提供 `MiniMax-H3`，解析度 768P，時長 4–15 秒，按秒計費。

<Note>
  **核心亮點**：同一個端點支援文生影片、首幀 / 尾幀 / 首尾幀生影片、最多 9 張參考圖 + 3 段參考影片 + 3 段參考音訊的混合參考生成；每條影片自帶配樂與音效；**\$0.03/秒**（原廠官方 API 為 \$0.08/秒），10 秒影片 \$0.30，失敗任務自動退款。
</Note>

<CardGroup cols={2}>
  <Card title="影片生成 API 參考" icon="video" href="/zh-Hant/api-capabilities/minimax-h3/video-generation">
    建立任務 + 按 task\_id 查詢，含 Python / cURL / Node.js 示例與線上除錯
  </Card>

  <Card title="充值加贈活動" icon="gift" href="/zh-Hant/faq/recharge-promotions">
    充值加贈疊加後，實際單價更低
  </Card>
</CardGroup>

## 讓 AI Agent 幫你接入

<Note>
  在用 Codex / Claude Code / Cursor 開發的話，把下面這段提示詞複製給它。它會先抓本頁的純文本版（任意文件頁地址後加 `.md`），再按你專案的技術棧寫程式碼——路徑要帶 `/hailuo`、結果包在 `task` 裡、`duration` 必須是 4 到 15 的整數這幾個高頻坑已經寫死在要求裡。
</Note>

<Prompt description="讓程式設計 Agent 接入或排查 MiniMax-H3 影片生成。複製後直接貼上給 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  幫我在當前專案裡接入 / 排查 MiniMax-H3 影片生成（文生影片 / 首尾幀生影片 / 參考素材生影片）。

  先讀文件再動手：抓 [https://docs.apiyi.com/api-capabilities/minimax-h3/overview.md](https://docs.apiyi.com/api-capabilities/minimax-h3/overview.md) 拿到本頁純文本版；引數與程式碼示例在 [https://docs.apiyi.com/api-capabilities/minimax-h3/video-generation.md](https://docs.apiyi.com/api-capabilities/minimax-h3/video-generation.md) 。

  接入要求：

  1. 端點：提交 `POST https://api.apiyi.com/hailuo/v2/video_generation`，查詢 `GET https://api.apiyi.com/hailuo/v2/query/video_generation/{task_id}`。**路徑必須帶 `/hailuo` 字首**，不帶字首會拿到一張網頁而不是 JSON。

  2. 輪詢與狀態：提交只返回 `{"task_id": ...}`。每 10 秒查一次，整體超時按任務型別設：不帶參考影片給 30 分鐘，帶參考影片給 2 小時。查詢結果包在 **`task`** 物件裡，狀態是 `queued` / `running` / `succeeded` / `failed`，**成功是 `succeeded`**。`progress` 只有 0 和 1 兩個值，別拿來做進度條。

  3. 影片落地：地址在 **`task.content.url`**，下載不需要鑑權頭。拿到後在服務端下載轉存到自己的儲存。檢查地址可用性要用 GET，這個地址對 HEAD 請求會返回 403。

  4. 請求體結構與型別：`{ model, content[], resolution, duration, ratio }` 五個欄位都必填。`model` 固定 `MiniMax-H3`（大小寫敏感）；**`duration` 是整數**，傳字串 `"5"` 或小數會被拒；**`resolution` 只能是大寫 `768P`**，`768p` 和 `2K` 都會被拒。

  5. 引數紅線：`duration` 4 到 15 秒；`ratio` 取 `21:9` `16:9` `4:3` `1:1` `3:4` `9:16` `adaptive`；**純文本和純音訊請求不能用 `adaptive`**。`content` 裡必須恰好一個文本項，文本不超過 7000 字元。不要加文件沒有的欄位（比如 `seed`、`prompt`），會被拒。

  6. 媒體輸入：圖片放 `{"type":"image_url","image_url":{"url":...},"role":...}`，影片用 `video_url` + `reference_video`，音訊用 `audio_url` + `reference_audio`。所有 url 必須是**公網 https 直鏈**，不支援 Base64 / data URI / 內網地址。首幀 / 尾幀（`first_frame` / `last_frame`）**不能**和參考素材混用；多張圖片必須寫 `role`。上限：參考圖 9 張、參考影片 3 段（累計不超過 15 秒）、參考音訊 3 段。提示詞裡用 `<Picture 1>` `<Video 1>` `<Audio 1>` 按同類素材順序引用。

  7. 計費與冪等：按秒計費，每秒 0.03 美元，參考圖 / 影片 / 音訊不額外收費；任務 `failed` 會自動退款，提交階段報錯不扣費。**`Idempotency-Key` 請求頭目前不生效，重複提交會重複計費**——業務層自己維護「業務 ID 到 task\_id」的對映，只對提交階段的 HTTP 500 和網路錯誤做退避重試（5 秒 / 10 秒 / 20 秒），400 類錯誤先改引數不要重試。

  8. 令牌：`default` 預設分組或 `svip` 分組即可呼叫，計費模式用**按量優先**；報「無可用渠道」說明令牌分組不對或模型名拼錯。

  9. Key 從環境變數 `APIYI_API_KEY` 讀，不要硬編碼進程式碼、也不要提交進 git。

  10. 改完真跑一次 5 秒文生影片，把影片地址和這次呼叫的花費貼給我。整個流程要 2 到 4 分鐘，如果你在受限的執行環境裡跑，把命令超時放到 600 秒以上或者放後臺。
</Prompt>

<Accordion title="這段提示詞替你擋掉了什麼">
  | 要求 | 擋掉的坑 |
  | - | - |
  | 路徑帶 `/hailuo` | 不帶字首的 `/v2/...` 返回網頁，JSON 解析直接報錯，看起來像服務掛了 |
  | 結果在 `task` 裡 | 在頂層找 `status` 永遠拿不到，輪詢會一直空轉到超時 |
  | `duration` 是整數 4–15 | 字串 / 小數被拒，報錯文案還會誤導成「JSON 無效」 |
  | 純文本不能用 `adaptive` | 文生影片必須給固定比例 |
  | 冪等鍵不生效 | 以為帶了 `Idempotency-Key` 就能放心重試，結果每次重試都是一筆新扣費 |
  | 用 GET 探活 | 影片地址對 HEAD 回 403，誤判成連結失效 |
</Accordion>

## 為什麼選 API易 的 MiniMax-H3

<CardGroup cols={2}>
  <Card title="完整能力開放" icon="layers">
    文生、首尾幀、參考圖 / 影片 / 音訊混合生成全部可用，參考素材上限與官方一致（9 圖 + 3 影片 + 3 音訊）
  </Card>

  <Card title="按秒計費，失敗退款" icon="receipt">
    \$0.03/秒，只為成功的影片付費；任務失敗自動全額退款，提交報錯不扣費
  </Card>

  <Card title="充值加贈可疊加" icon="gift">
    疊加 [充值加贈活動](/zh-Hant/faq/recharge-promotions) 後實際成本更低
  </Card>

  <Card title="全球零門檻接入" icon="globe">
    `api.apiyi.com` 直連，一個 API Key 即可呼叫，無需海外賬號
  </Card>

  <Card title="影片模型生態齊全" icon="clapperboard">
    同一個 Key 還能調 [Seedance 2.0 / 2.5](/zh-Hant/api-capabilities/seedance2/overview)、[Wan2.7](/zh-Hant/api-capabilities/wan/overview)、[VEO 3.1](/zh-Hant/api-capabilities/veo-3-1-official/overview) 等影片模型
  </Card>

  <Card title="專業服務" icon="headset">
    接入問題可聯絡客服，企業客戶可獲得接入陪跑
  </Card>
</CardGroup>

## 核心特性

<CardGroup cols={2}>
  <Card title="原生立體聲" icon="music">
    每條影片自帶配樂與音效，由提示詞和參考音訊驅動，無需後期配音
  </Card>

  <Card title="7 種畫幅" icon="ratio">
    `21:9` 到 `9:16` 六檔固定比例，另有 `adaptive` 跟隨參考圖比例
  </Card>

  <Card title="4–15 秒任意整數時長" icon="timer">
    按實際秒數計費，短影片不浪費
  </Card>

  <Card title="長提示詞" icon="text">
    單條提示詞最長 7000 字元，適合分鏡式詳細描述
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="首尾幀控制" icon="image">
    只給首幀、只給尾幀、或首尾幀同時給，控制起止畫面
  </Card>

  <Card title="多參考圖" icon="images">
    最多 9 張參考圖，提示詞裡用 `<Picture 1>` 等標籤指定角色與物體
  </Card>

  <Card title="參考影片動作遷移" icon="film">
    最多 3 段參考影片，復刻運鏡與動作節奏
  </Card>

  <Card title="音訊驅動" icon="audio-lines">
    最多 3 段參考音訊，畫面隨音樂節奏或人聲生成
  </Card>
</CardGroup>

## 模型定價

本通道部署的是 MiniMax 開源的 H3 權重，**不是原廠官方 API 的轉發**，因此採用獨立定價：

| 計費項 | API易（自部署，768P） | 原廠官方 API（768P） |
| - | - | - |
| 輸出影片 | **\$0.03 / 秒** | \$0.08 / 秒 |
| 參考圖片 | 不收費（最多 9 張） | 前 5 張免費，第 6 張起 \$0.04 / 張 |
| 參考影片 | 不收費 | 按輸入時長 \$0.08 / 秒 |
| 參考音訊 | 不收費 | 不收費 |
| 示例：10 秒文生影片 | **\$0.30** | \$0.80 |

<Note>本通道為開源權重自部署，定價獨立於原廠官方 API，且可能調整；上表僅供參考，具體以頂部導航「模型價格」欄目為準：[模型價格](/zh-Hant/models/index)。原廠價格來源：`platform.minimax.io/docs/guides/pricing-paygo`（2026-09-29 獲取）。</Note>

<Info>
  **計費說明**：

  * 按請求的 `duration` 秒數計費，提交受理時預扣
  * **參考素材不額外收費**：參考圖（最多 9 張）、參考影片、參考音訊都不影響價格，只按時長計費
  * 任務失敗（素材下載失敗、格式不支援、執行失敗等）**自動全額退款**
  * 提交階段返回 4xx / 5xx 的請求不扣費；查詢和下載不收費
  * 充值加贈政策見 [充值加贈活動](/zh-Hant/faq/recharge-promotions)，疊加後實際成本更低
</Info>

## 分組介紹

MiniMax-H3 **在 `default` 預設分組即可呼叫**，`svip` 分組同樣可用，無需切換專屬分組。令牌計費模式推薦 **按量優先**（`Pay-as-you-go Priority`）。如果呼叫時報「當前分組沒有可用渠道」，說明令牌分組不含本模型，或 `model` 拼寫有誤（大小寫敏感）。

| 維度 | 要求 |
| - | - |
| 分組 | `default`（預設）或 `svip` |
| 計費模式 | 按量優先（推薦） |
| 模型名 | `MiniMax-H3`，大小寫敏感 |

## 技術規格

| 專案 | 規格 |
| - | - |
| 模型 ID | `MiniMax-H3` |
| 解析度 | 僅 `768P` |
| 時長 | 整數 4–15 秒（成片通常比請求值長 0.1–0.5 秒） |
| 畫幅 | `21:9` 1536×672 / `16:9` 1344×768 / `4:3` 1024×768 / `1:1` 768×768 / `3:4` 768×1024 / `9:16` 768×1344 / `adaptive` |
| 音訊 | 輸出自帶立體聲音軌，無開關 |
| 提示詞 | 1 個文本項，1–7000 字元 |
| 參考素材 | 圖片 ≤ 9、影片 ≤ 3（累計 ≤ 15 秒）、音訊 ≤ 3；媒體合計 ≤ 12 |
| 素材傳入方式 | 僅公網 HTTPS 連結 |
| 輸出 | MP4，通過 `task.content.url` 獲取 |
| 生成耗時 | 5 秒約 3 分鐘、15 秒約 13 分鐘；帶參考影片明顯更久，見下方「生成耗時預估」 |

<Warning>
  MiniMax H3 官方模型支援 2K，但本通道**只開放 768P**，傳 `2K` 會被拒絕。
</Warning>

## 生成耗時預估

MiniMax-H3 的生成耗時主要取決於兩點：**輸出時長**和**是否帶參考影片**。下表是本通道的現狀，資料來自 2026-09-29 至 2026-10-10 (UTC+8) 的 400 餘個成功任務：

| 輸出時長 | 不帶參考影片（文生 / 圖生） | 帶參考影片 |
| - | - | - |
| 4–6 秒 | 約 3 分鐘，多數 5 分鐘內 | 約 15 分鐘（12–25 分鐘） |
| 7–10 秒 | 約 6 分鐘，多數 11 分鐘內 | 樣本較少，建議按 30 分鐘以上預留 |
| 11–15 秒 | 約 13 分鐘，多數 20 分鐘內 | 約 85 分鐘（50–90 分鐘） |

* **時長越長，耗時增長越快**：15 秒影片的耗時約是 5 秒影片的 5 倍，不是 3 倍
* **參考影片最耗時**：模型要逐幀解析參考影片，再和新畫面一起計算，計算量成倍增加
* **客戶端超時按上表設定**：不帶參考影片的任務建議給 30 分鐘，帶參考影片的任務建議給 2 小時，避免任務還在執行就被判為失敗

<Note>
  以上是本通道當前的實測水平，對時效敏感的業務可以先用 4–6 秒短影片，或用參考圖代替參考影片。**速度更快、品質更高的 MiniMax 分組即將推出**，上線後會在本頁和 [網站公告](/changelog) 中通知。
</Note>

## 端點一覽

| 用途 | Method | Path | Content-Type |
| - | - | - | - |
| 建立任務 | `POST` | `/hailuo/v2/video_generation` | `application/json` |
| 查詢任務 | `GET` | `/hailuo/v2/query/video_generation/{task_id}` | — |

<Tip>
  主域名 `https://api.apiyi.com`，備用域名 `https://b.apiyi.com`，路徑相同。注意路徑**以 `/hailuo` 開頭**，不是 `/v1`。
</Tip>

## 生成方式詳解

系統根據 `content[]` 裡有什麼素材自動判斷生成方式：

| 生成方式 | `content[]` 組成 | `ratio` |
| - | - | - |
| 文生影片 | 僅 1 個文本項 | 必須固定比例 |
| 首幀生影片 | 文本 + 1 張 `first_frame` | 固定比例或 `adaptive` |
| 尾幀生影片 | 文本 + 1 張 `last_frame` | 固定比例或 `adaptive` |
| 首尾幀生影片 | 文本 + `first_frame` + `last_frame` | 固定比例或 `adaptive` |
| 參考素材生影片 | 文本 + `reference_image` / `reference_video` / `reference_audio` 任意組合 | 固定比例或 `adaptive`；**只有音訊時必須固定比例** |

### 提示詞裡怎麼引用參考素材

同類素材按在 `content[]` 中出現的順序各自編號：第 1、2 張參考圖是 `<Picture 1>`、`<Picture 2>`；第 1 段參考影片是 `<Video 1>`；第 1 段參考音訊是 `<Audio 1>`。例如：

```text theme={null}
<Picture 1> 按照 <Video 1> 的動作起舞，節奏跟隨 <Audio 1>
```

<Warning>
  * 首幀 / 尾幀**不能**與任何參考素材混用
  * 只有一張圖片時可以省略 `role`（按首幀處理）；**兩張及以上必須顯式寫 `role`**
  * 多段參考影片的**累計時長**不能超過 15 秒，否則任務會失敗（自動退款）；單段超過 15 秒則只取片頭 15 秒
</Warning>

## 最佳實踐

<Steps>
  <Step title="先用 4–5 秒試效果">
    按秒計費，先用短時長確認構圖和風格，再出 10–15 秒的正式版本
  </Step>

  <Step title="文生影片選固定比例">
    橫屏 `16:9`、豎屏 `9:16`、寬銀幕 `21:9`；帶首幀圖時用 `adaptive` 保持原圖比例
  </Step>

  <Step title="素材先放到穩定的公網儲存">
    用自己的 OSS / CDN 直鏈，避免防盜鏈、臨時簽名過期導致素材下載失敗
  </Step>

  <Step title="提示詞寫清運鏡和聲音">
    描述主體、動作、鏡頭運動、光線，以及想要的音樂和音效，模型會一併生成
  </Step>

  <Step title="輪詢間隔 10 秒">
    5 秒影片通常 3 分鐘左右；客戶端整體超時不帶參考影片給 30 分鐘、帶參考影片給 2 小時（見「生成耗時預估」）
  </Step>

  <Step title="自己做冪等">
    儲存「業務 ID 到 task\_id」的對映；提交超時時先查已有任務，不要直接重新提交
  </Step>

  <Step title="拿到地址立即轉存">
    `task.content.url` 用 GET 下載後存到自己的儲存再分發
  </Step>
</Steps>

## 錯誤碼與重試

| 階段 | 表現 | 原因 | 處理 |
| - | - | - | - |
| 提交 | 400，`type: invalid_request`，中文提示 | 引數不合法（時長、比例、數量、角色等） | 按提示改引數，不要重試 |
| 提交 | 400，`bad_request_error` | 上游拒絕（如 `resolution must be 768P`、不支援的欄位） | 按提示改引數 |
| 提交 | 500，`Unknown Error` | 部分非法引數（多個文本項、`http://` 連結、未知欄位等）或瞬時過載 | 先按「生成方式詳解」核對請求體；確認無誤後退避重試 |
| 提交 | 503，無可用渠道 | 令牌分組不含本模型，或 `model` 拼寫錯誤 | 檢查令牌分組與模型名 |
| 執行 | `status: failed`，`input_download_failed` | 素材連結不可下載（如 404） | 換成可公網訪問的連結後重新提交 |
| 執行 | `status: failed`，`input_format_unsupported` | 素材格式不對（如圖片位置放了音訊） | 檢查素材型別與格式 |
| 執行 | `status: failed`，`task_execution_failed` | 生成過程失敗 | 稍後重新提交（失敗已退款） |

<Info>
  **客戶端建議**：提交請求超時設 60 秒（高峰期提交本身可能要 10 秒以上）；只對 HTTP 500 和網路錯誤做退避重試；所有執行階段失敗都已自動退款，重新提交會產生新的計費。
</Info>

## 常見問題

<AccordionGroup>
  <Accordion title="為什麼請求返回了一張網頁而不是 JSON？">
    路徑少了 `/hailuo` 字首。正確路徑是 `/hailuo/v2/video_generation` 和 `/hailuo/v2/query/video_generation/{task_id}`。
  </Accordion>

  <Accordion title="支援 2K 或 1080P 嗎？">
    本通道只支援 `768P`。MiniMax 官方模型支援 2K，但本通道未開放。
  </Accordion>

  <Accordion title="時長能設 1–3 秒嗎？">
    不能，`duration` 取值為 4–15 的整數。
  </Accordion>

  <Accordion title="影片有聲音嗎？能關掉嗎？">
    每條影片都自帶立體聲音軌，目前沒有關閉引數。不需要聲音時可在後期去掉音軌。
  </Accordion>

  <Accordion title="Idempotency-Key 請求頭能防止重複扣費嗎？">
    目前不能。帶相同 `Idempotency-Key` 重複提交仍會建立新任務並分別計費。請在業務層自行記錄已提交的任務。
  </Accordion>

  <Accordion title="任務失敗會扣費嗎？">
    不會。任務進入 `failed` 後自動全額退款；提交階段直接報錯的請求也不扣費。
  </Accordion>

  <Accordion title="可以直接傳 Base64 或本地檔案嗎？">
    不可以，所有素材都必須是公網 HTTPS 連結。可先上傳到自己的物件儲存再傳連結。
  </Accordion>

  <Accordion title="adaptive 會輸出什麼尺寸？">
    跟隨輸入圖片的寬高比，例如方圖輸出 768×768、16:9 圖輸出 1344×768。純文本和純音訊請求不能用 `adaptive`。
  </Accordion>

  <Accordion title="參考影片超過 15 秒會報錯嗎？">
    單段超過 15 秒會自動只取片頭 15 秒；但多段參考影片累計超過 15 秒時任務會失敗（自動退款）。
  </Accordion>

  <Accordion title="生成要多久？">
    5 秒影片約 3 分鐘，15 秒影片約 13 分鐘；帶參考影片的任務明顯更久，15 秒約 85 分鐘。完整資料見上方「生成耗時預估」。
  </Accordion>

  <Accordion title="影片地址能儲存多久？">
    地址目前未見短時過期，但不承諾長期有效，請拿到後儘快下載轉存。檢查地址時請用 GET，HEAD 請求會返回 403。
  </Accordion>

  <Accordion title="提交時偶爾返回 500 Unknown Error 怎麼辦？">
    先確認請求體符合規範（只有一個文本項、沒有多餘欄位、素材是 https 連結）；確認無誤的話多為瞬時過載，退避幾秒後重試即可，報錯的請求不扣費。
  </Accordion>
</AccordionGroup>

## 相關文件

* [MiniMax-H3 影片生成 API 參考](/zh-Hant/api-capabilities/minimax-h3/video-generation)
* [Seedance 2.0 / 2.5 影片生成](/zh-Hant/api-capabilities/seedance2/overview)
* [Wan2.7 影片生成](/zh-Hant/api-capabilities/wan/overview)
* [VEO 3.1 影片生成](/zh-Hant/api-capabilities/veo-3-1-official/overview)
* [充值加贈活動](/zh-Hant/faq/recharge-promotions)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.