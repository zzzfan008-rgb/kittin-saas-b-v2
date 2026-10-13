> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Oxygen 影片生成

> AZ8 Oxygen（oxygen-1.0）影片生成接入指南：OpenAI Videos 相容介面，支援文生、首幀、首尾幀、參考圖/影片/音訊生影片，320p–768p、4–15 秒，按秒計費 $0.02/秒。

## 概述

Oxygen 是 AZ8 提供的影片生成模型。AZ8 是新加坡的 AI 影片創作平臺（前身為 Videoinu）。API易 以 `oxygen-1.0` 提供該模型，介面相容 **OpenAI Videos**（`POST /v1/videos` 提交、`GET /v1/videos/{id}` 查詢），時長 4–15 秒，清晰度 320p / 480p / 768p，**每秒 \$0.02，不區分清晰度**。

<Note>
  **核心亮點**：一個模型同時支援文生影片、首幀生影片、首尾幀生影片，以及最多 9 張參考圖 + 3 段參考影片 + 3 段參考音訊的參考生成；成片自帶音軌；**\$0.02/秒**，5 秒影片 \$0.10、15 秒 \$0.30，失敗任務自動退款。定位是走量、低成本的批次影片生成。
</Note>

<CardGroup cols={2}>
  <Card title="影片生成 API 參考" icon="video" href="/zh-Hant/api-capabilities/oxygen/video-generation">
    提交 + 輪詢 + 下載，含 Python / cURL / Node.js 示例與線上除錯
  </Card>

  <Card title="充值加贈活動" icon="gift" href="/zh-Hant/faq/recharge-promotions">
    充值加贈疊加後，實際單價更低
  </Card>
</CardGroup>

## 讓 AI Agent 幫你接入

<Note>
  在用 Codex / Claude Code / Cursor 開發的話，把下面這段提示詞複製給它。它會先抓本頁的純文本版（任意文件頁地址後加 `.md`），再按你專案的技術棧寫程式碼。顯式傳 `size`、高階引數要寫進 `input_reference` 的 JSON 信封、時長只認 `seconds` 這幾個高頻坑已經寫死在要求裡。
</Note>

<Prompt description="讓程式設計 Agent 接入或排查 Oxygen（oxygen-1.0）影片生成。複製後直接貼上給 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  幫我在當前專案裡接入 / 排查 Oxygen（oxygen-1.0）影片生成（文生影片 / 首幀 / 首尾幀 / 參考素材生影片）。

  先讀文件再動手：抓 [https://docs.apiyi.com/api-capabilities/oxygen/overview.md](https://docs.apiyi.com/api-capabilities/oxygen/overview.md) 拿到本頁純文本版；引數與程式碼示例在 [https://docs.apiyi.com/api-capabilities/oxygen/video-generation.md](https://docs.apiyi.com/api-capabilities/oxygen/video-generation.md) 。

  接入要求：

  1. 端點：OpenAI Videos 格式。提交 `POST https://api.apiyi.com/v1/videos`（JSON），查詢 `GET https://api.apiyi.com/v1/videos/{id}`。提交立即返回 `{"id": ..., "status": "queued"}`，影片要輪詢取回。

  2. 輪詢與狀態：每 5 秒查一次，整體給 15 分鐘兜底。狀態 `queued` / `in_progress` / `completed` / `failed`，**成功是 `completed`**。

  3. 影片落地：成功後用響應裡的 **`video_url`** 直接下載（不需要鑑權頭），**不要依賴 `/v1/videos/{id}/content`**——剛完成時它可能還返回 400。`expires_at` 之後連結會失效（約 24 小時），拿到就轉存到自己的儲存。

  4. 時長：頂層 `seconds` 必填，整數 4–15（字串 `"5"` 也行），**按它計費**。

  5. 清晰度與橫豎：**每次都顯式傳 `size`**，不傳時閘道會預設補 `720x1280`，出來是豎版。`1280x720` / `720x1280` = 480p，`1792x1024` / `1024x1792` = 768p。

  6. 圖生影片：只給首幀時，`input_reference` 填公網 https 圖片連結或 data URI，成片比例跟隨首幀。

  7. 高階引數（首尾幀、參考素材、320p、1:1）：**必須寫進 `input_reference` 的 JSON 字串裡**（以 `{` 開頭），例如 `"input_reference": "{\"images\":[\"https://...first.png\"],\"last_image\":\"https://...last.png\"}"`。可用鍵：`images`、`last_image`、`reference_images`（≤9）、`reference_videos`（≤3）、`reference_audios`（≤3）、`resolution`（`320p` / `480p` / `768p`）、`aspect_ratio`（`16:9` / `9:16` / `1:1`）、`prompt`。**這些欄位寫在請求體頂層會被靜默丟棄、不報錯**；信封裡不能寫 `duration`（會 400）；首尾幀和參考素材不能混用。

  8. 計費與重試：每秒 0.02 美元，不分清晰度；提交時預扣，`failed` 自動全額退款，提交階段報 400 不扣費。偶發 `upstream_error` 失敗時，隔幾分鐘重新提交即可；400 類錯誤先改引數，不要重試。

  9. 令牌：`default` 或 `svip` 分組，計費模式用**按量優先**；Key 從環境變數 `APIYI_API_KEY` 讀，不要硬編碼或提交進 git。

  10. 改完真跑一次 4 秒、`size: "1280x720"` 的文生影片，把 `video_url` 和這次呼叫的花費（應為 0.08 美元）貼給我。整個流程 1–3 分鐘，受限執行環境裡把命令超時放到 600 秒以上或放後臺。
</Prompt>

<Accordion title="這段提示詞替你擋掉了什麼">
  | 要求 | 擋掉的坑 |
  | - | - |
  | 每次顯式傳 `size` | 不傳時閘道預設補豎版尺寸，橫屏需求出了豎屏影片 |
  | 高階引數寫進 `input_reference` 信封 | 把 `last_image`、`reference_images`、`resolution` 寫在頂層會被靜默丟棄，不報錯，結果尾幀不生效、參考圖被忽略、清晰度不對 |
  | 時長只認 `seconds` | 信封裡寫 `duration` 會被拒；計費和成片時長都以 `seconds` 為準 |
  | 用 `video_url` 下載 | 狀態剛變 `completed` 時調 `/content` 可能返回 400，誤判成失敗 |
  | 及時轉存 | 連結約 24 小時後失效 |
</Accordion>

## 為什麼選 API易 的 Oxygen

<CardGroup cols={2}>
  <Card title="走量價格" icon="receipt">
    \$0.02/秒，不分清晰度；4 秒 \$0.08，適合批量出片和 A/B 試稿
  </Card>

  <Card title="失敗自動退款" icon="shield-check">
    任務失敗全額退回，提交階段報錯不扣費，只為成功的影片付費
  </Card>

  <Card title="OpenAI Videos 相容" icon="plug">
    沿用 `/v1/videos` 的提交、查詢寫法，已有 Sora 類接入程式碼改動很小
  </Card>

  <Card title="充值加贈可疊加" icon="gift">
    疊加 [充值加贈活動](/zh-Hant/faq/recharge-promotions) 後實際成本更低
  </Card>

  <Card title="影片模型生態齊全" icon="clapperboard">
    同一個 Key 還能調 [Seedance 2.0 / 2.5](/zh-Hant/api-capabilities/seedance2/overview)、[MiniMax-H3](/zh-Hant/api-capabilities/minimax-h3/overview)、[Wan2.7](/zh-Hant/api-capabilities/wan/overview) 等影片模型
  </Card>

  <Card title="全球零門檻接入" icon="globe">
    `api.apiyi.com` 直連，一個 API Key 即可呼叫，無需海外賬號
  </Card>
</CardGroup>

## 核心特性

<CardGroup cols={2}>
  <Card title="四種生成方式" icon="layers">
    文生、首幀、首尾幀、參考圖 / 影片 / 音訊生影片，同一個端點
  </Card>

  <Card title="三檔清晰度" icon="monitor">
    320p / 480p / 768p，價格相同，按需選擇速度與畫質
  </Card>

  <Card title="4–15 秒任意整數時長" icon="timer">
    按請求秒數計費，短影片不浪費
  </Card>

  <Card title="自帶音軌" icon="music">
    成片 MP4 自帶音訊軌，無需單獨配音
  </Card>
</CardGroup>

## 模型定價

| 計費項 | 價格 |
| - | - |
| 輸出影片（320p / 480p / 768p 同價） | **\$0.02 / 秒** |
| 首幀、尾幀、參考圖 / 影片 / 音訊 | 不額外收費 |
| 示例：4 秒影片 | \$0.08 |
| 示例：15 秒影片 | \$0.30 |

<Note>模型價格可能調整；上表僅供參考，具體以頂部導航「模型價格」欄目為準：[模型價格](/zh-Hant/models/index)。</Note>

<Info>
  **計費說明**：

  * 按請求的 `seconds` 計費，提交受理時預扣；成片實際長度會略長於請求值（4 秒約 4.5 秒），不額外收費
  * 清晰度、畫幅、參考素材都不影響價格
  * 任務失敗（上游失敗、超時等）**自動全額退款**
  * 提交階段返回 400 的請求不扣費；查詢和下載不收費
</Info>

## 分組介紹

`oxygen-1.0` **在 `default` 預設分組即可呼叫**，`svip` 分組同樣可用。令牌計費模式請用 **按量優先**（`Pay-as-you-go Priority`）。如果呼叫時報「當前分組沒有可用渠道」，說明令牌分組不含本模型，或 `model` 拼寫有誤。

| 維度 | 要求 |
| - | - |
| 分組 | `default`（預設）或 `svip` |
| 計費模式 | 按量優先 |
| 模型名 | `oxygen-1.0`（必須帶 `-1.0`） |

## 技術規格

| 專案 | 規格 |
| - | - |
| 模型 ID | `oxygen-1.0` |
| 時長 | 整數 4–15 秒（頂層 `seconds`） |
| 清晰度 | 320p / 480p（預設）/ 768p |
| 畫幅 | 橫 16:9、豎 9:16、方 1:1；圖生影片跟隨首幀比例 |
| 輸出尺寸（實測） | 320p：576×320；480p：864×480 / 480×864 / 480×480；768p：1344×768 / 768×1344 / 768×768 |
| 音訊 | 輸出自帶音軌 |
| 圖片輸入 | 公網 https 連結或圖片 data URI |
| 參考素材 | 圖片 ≤ 9、影片 ≤ 3、音訊 ≤ 3（影片與音訊僅支援 https 連結） |
| 輸出 | MP4，通過查詢響應的 `video_url` 獲取，連結約 24 小時有效 |
| 生成耗時 | 通常 1–3 分鐘；高峰排隊時可能 5 分鐘以上 |

## 端點一覽

| 用途 | Method | Path |
| - | - | - |
| 建立任務 | `POST` | `/v1/videos` |
| 查詢任務 | `GET` | `/v1/videos/{id}` |
| 下載成片（可選） | `GET` | `/v1/videos/{id}/content` |

<Tip>
  主域名 `https://api.apiyi.com`，備用域名 `https://b.apiyi.com`，路徑相同。下載建議直接用查詢響應裡的 `video_url`。
</Tip>

## 生成方式詳解

頂層欄位只有 `model`、`prompt`、`seconds`、`size`、`input_reference` 五個會生效。首尾幀、參考素材、320p、1:1 這些**高階引數統一寫進 `input_reference` 的 JSON 信封**（一段以 `{` 開頭的 JSON 字串）：

| 生成方式 | 寫法 | 清晰度 / 畫幅 |
| - | - | - |
| 文生影片 | 不傳 `input_reference` | 由 `size` 決定 |
| 首幀生影片 | `input_reference` 填圖片連結或 data URI | 清晰度由 `size` 決定，比例跟隨首幀 |
| 首尾幀生影片 | 信封 `{"images":["首幀"],"last_image":"尾幀"}` | 同上 |
| 參考素材生影片 | 信封 `{"reference_images":[...],"reference_videos":[...],"reference_audios":[...]}` | 由 `size` 決定，可在信封裡寫 `aspect_ratio` |
| 指定 320p 或 1:1 | 信封 `{"resolution":"320p","aspect_ratio":"1:1"}`（可與上面任一種合併） | 信封優先於 `size` |

`size` 與清晰度的對應關係：

| `size` | 清晰度 | 畫幅 |
| - | - | - |
| `1280x720` | 480p | 橫 16:9 |
| `720x1280` | 480p | 豎 9:16 |
| `1792x1024` | 768p | 橫 16:9 |
| `1024x1792` | 768p | 豎 9:16 |

信封寫法示例（首尾幀）：

```json theme={null}
{
  "model": "oxygen-1.0",
  "prompt": "The glass sphere slowly dissolves into a deep blue abstract wave",
  "seconds": "5",
  "size": "1280x720",
  "input_reference": "{\"images\":[\"https://your-cdn.example.com/first.png\"],\"last_image\":\"https://your-cdn.example.com/last.png\"}"
}
```

<Warning>
  * `last_image`、`reference_images`、`resolution`、`aspect_ratio` 等欄位**寫在請求體頂層會被靜默丟棄**：不報錯、照常扣費，但尾幀不生效、參考圖被忽略、清晰度按 `size` 走。一定要寫進 `input_reference` 信封
  * 信封裡**不能寫 `duration`**，時長只用頂層 `seconds`；JSON 寫錯、鍵名拼錯都會返回 400（`param: input_reference`），不扣費
  * 首尾幀與參考素材**不能**混用
  * `input_reference` 必須是**字串**：信封要先 JSON 序列化（Python 用 `json.dumps`，JS 用 `JSON.stringify`），直接傳物件或陣列會被拒
</Warning>

## 最佳實踐

<Steps>
  <Step title="先用 4 秒試效果">
    按秒計費，先用 4 秒確認構圖和風格，再出 10–15 秒正式版
  </Step>

  <Step title="每次顯式寫 size">
    橫屏 `1280x720`、豎屏 `720x1280`；要更清晰用 `1792x1024` / `1024x1792`（768p）
  </Step>

  <Step title="首尾幀用比例相近的兩張圖">
    成片比例跟隨首幀，尾幀比例差太多時過渡會被裁切
  </Step>

  <Step title="素材放在穩定的公網儲存">
    用自己的 OSS / CDN 直鏈，避免防盜鏈或簽名過期導致素材下載失敗
  </Step>

  <Step title="輪詢間隔 5 秒，整體 15 分鐘兜底">
    通常 1–3 分鐘出片，高峰期可能更久
  </Step>

  <Step title="拿到 video_url 立即轉存">
    連結約 24 小時後失效，下載後存到自己的儲存再分發
  </Step>
</Steps>

## 錯誤碼與重試

| 階段 | 表現 | 原因 | 處理 |
| - | - | - | - |
| 提交 | 400，`invalid_params`，`param: input.duration` | `seconds` 不在 4–15 | 改時長，不扣費 |
| 提交 | 400，`invalid_params`，`param: input_reference` | 信封 JSON 寫錯、有未知鍵，或寫了 `duration` | 按報錯修正信封，不扣費 |
| 提交 | 400，`cannot unmarshal array ... input_reference` | `input_reference` 傳了陣列或物件，沒有序列化成字串 | 先 `json.dumps` / `JSON.stringify` |
| 提交 | 500，`下載參考檔案失敗` | `input_reference` 的圖片連結無法訪問 | 換成可公網訪問的 https 連結 |
| 提交 | 503，無可用渠道 | 令牌分組不含本模型，或模型名拼錯 | 檢查分組與 `oxygen-1.0` |
| 執行 | `failed`，`upstream_error` | 上游偶發失敗 | 隔幾分鐘重新提交（失敗已退款） |
| 執行 | `failed`，`upstream_timeout` | 上游排隊過久，超出時限 | 稍後重新提交（失敗已退款） |

<Info>
  錯誤資訊是一段 JSON 字串，包在響應的 `message` 欄位裡，例如 `{"message":"{\"error\":{\"code\":\"invalid_params\",...}}","type":"task_error"}`，解析時需要再 `json.loads` 一次。
</Info>

## 常見問題

<AccordionGroup>
  <Accordion title="為什麼我要的橫屏影片出來是豎屏？">
    沒傳 `size`。不傳時閘道會預設補 `720x1280`（豎屏）。橫屏請顯式傳 `1280x720` 或 `1792x1024`。
  </Accordion>

  <Accordion title="傳了 last_image / reference_images 為什麼沒效果？">
    這些欄位寫在了請求體頂層。頂層只有 `model`、`prompt`、`seconds`、`size`、`input_reference` 會生效，其餘欄位會被靜默丟棄。請寫進 `input_reference` 的 JSON 信封，見上文「生成方式詳解」。
  </Accordion>

  <Accordion title="怎麼選 320p？傳 resolution 不生效？">
    頂層的 `resolution` 會被丟棄。請寫進信封：`"input_reference": "{\"resolution\":\"320p\"}"`。三檔清晰度同價。
  </Accordion>

  <Accordion title="不同清晰度價格一樣嗎？">
    一樣，都是 \$0.02/秒。320p 生成更快、檔案更小，768p 更清晰。
  </Accordion>

  <Accordion title="狀態顯示 completed，但 /content 返回 400？">
    狀態剛變成 `completed` 時，`/v1/videos/{id}/content` 可能還要幾秒才能下載。直接用查詢響應裡的 `video_url` 即可。
  </Accordion>

  <Accordion title="影片地址能儲存多久？">
    約 24 小時（見查詢響應的 `expires_at`），請拿到後儘快下載轉存。
  </Accordion>

  <Accordion title="任務失敗會扣費嗎？">
    不會。任務 `failed` 後自動全額退款；提交階段返回 400 的請求不扣費。
  </Accordion>

  <Accordion title="偶爾返回 upstream_error 怎麼辦？">
    屬於上游偶發失敗，已自動退款。隔幾分鐘重新提交通常即可成功。
  </Accordion>

  <Accordion title="成片時長為什麼比 seconds 長一點？">
    實際成片會略長（4 秒約 4.5 秒、5 秒約 5.2 秒），按請求的 `seconds` 計費，不多收。
  </Accordion>

  <Accordion title="首幀可以傳 Base64 嗎？">
    可以，`input_reference` 或信封裡的 `images` 都支援圖片 data URI（如 `data:image/jpeg;base64,...`）。參考影片和參考音訊只支援 https 連結。
  </Accordion>

  <Accordion title="圖生影片能指定畫幅嗎？">
    不能，圖生影片的畫幅跟隨首幀圖片比例，`aspect_ratio` 會被忽略。清晰度仍可通過 `size` 或信封裡的 `resolution` 選擇。
  </Accordion>
</AccordionGroup>

## 相關文件

* [Oxygen 影片生成 API 參考](/zh-Hant/api-capabilities/oxygen/video-generation)
* [MiniMax-H3 影片生成](/zh-Hant/api-capabilities/minimax-h3/overview)
* [Seedance 2.0 / 2.5 影片生成](/zh-Hant/api-capabilities/seedance2/overview)
* [Wan2.7 影片生成](/zh-Hant/api-capabilities/wan/overview)
* [充值加贈活動](/zh-Hant/faq/recharge-promotions)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.