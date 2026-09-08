> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Realtime 即時語音（WebSocket）

> 四個即時語音模型，一條 wss 端點，一把 API易 令牌：雙向流式音訊、可打斷、兩種自動斷句、工具呼叫與圖片輸入。內測接入中，含兩套協議的完整欄位對照與零成本文本自測方案。

## 概述

Realtime 是一類**走 WebSocket 長連線**的語音模型：音訊流進、音訊流出，中途可以被打斷，不需要「錄完再上傳、等一段再播放」。它和「ASR + 文本模型 + TTS」三段式拼接的最大區別是端到端——模型直接聽到語氣、停頓和情緒，也直接說出來，延遲能壓到亞秒級。

目前 API易 接入了 **4 個模型、2 套協議**，共用同一條端點和同一把令牌：

* `gpt-realtime-2.1` / `gpt-realtime-2.1-mini` —— OpenAI Realtime GA 協議
* `qwen3.5-omni-plus-realtime` / `qwen3.5-omni-flash-realtime` —— 阿里雲百鍊協議

<Warning>
  **接入狀態：內測 / 接入中。** Realtime 語音目前處於內測供給階段，**尚未開放自助呼叫**，需聯絡我們登記開通。內測期上游協議與行為仍可能調整，本頁「已知限制與規避」一節列出的差異均為實測結論、且會隨上游變化更新；請勿在沒有降級預案的情況下直接投產。有接入計劃、或需要更高併發額度的客戶，歡迎通過[企業微信客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)聯絡，也可郵件 [hi@apiyi.com](mailto:hi@apiyi.com) / [feedback@apiyi.com](mailto:feedback@apiyi.com)。
</Warning>

<Note>
  **🎤 核心亮點**：單連線雙向流式音訊、**可隨時打斷**、`server_vad` 與 `semantic_vad` 兩種自動斷句、Function Calling 全鏈路（含結果回注）、圖片輸入、`usage` 按模態分列。四個模型的上述能力均已逐項實測通過（2026-08-24 (UTC+8)）。
</Note>

<Info>
  **先記住這一件事**：4 個模型分屬**兩套不同的請求協議**，欄位名和事件名都不一樣。**只改 `model` 引數、不改請求體欄位，一定連不通**——這是接入本能力最高頻的失敗原因。差異只有 6 個欄位 + 3 個事件名，全部列在下方「兩套協議對照」一節。
</Info>

<CardGroup cols={2}>
  <Card title="申請內測開通" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    聯絡企業微信客服，報上賬號與預估併發，我們為你的令牌開通內測分組。
  </Card>

  <Card title="API 使用手冊" icon="book-open" href="/zh-Hant/api-manual">
    令牌建立、Base URL、計費模式等通用呼叫規範。
  </Card>

  <Card title="令牌與分組管理" icon="key-round" href="/zh-Hant/api-capabilities/token-management">
    建立令牌、勾選分組與設定額度。
  </Card>

  <Card title="呼叫日誌查詢" icon="receipt-text" href="https://api.apiyi.com/log">
    在控制台檢視每次呼叫的 token 用量與實際扣費。
  </Card>
</CardGroup>

本頁篇幅不短，三節是必讀：**兩套協議對照**（改模型必看）、**先用文本跑通**（不用麥克風就能驗證鏈路）、**已知限制與規避**（四條會打到客戶端程式碼的實測差異）。

## 讓 AI Agent 幫你接入

<Note>
  在用 Codex / Claude Code / Cursor 開發的話，把下面這段提示詞複製給它。它會先抓本頁的純文本版（任意文件頁地址後加 `.md`），再按你專案的技術棧寫程式碼——**兩套協議的欄位族**、取樣率紅線、打斷收口、空閒斷線這幾個高頻問題已經寫死在要求裡。
</Note>

<Prompt description="讓程式設計 Agent 接入或排查 Realtime 即時語音。複製後直接貼上給 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  幫我在當前專案裡接入 / 排查 API易 的 Realtime 即時語音（WebSocket 雙向流式）。

  先讀文件再動手：抓 [https://docs.apiyi.com/api-capabilities/realtime/overview.md](https://docs.apiyi.com/api-capabilities/realtime/overview.md) 拿到本頁純文本版，重點看「兩套協議對照」和「已知限制與規避」兩節。

  接入要求：

  1. 這是 **WebSocket 長連線**，不是 HTTP 請求。端點是 `wss://api.apiyi.com/v1/realtime?model=<模型名>`，鑑權走 `Authorization: Bearer <令牌>` 請求頭。**不要寫成 HTTP POST，也不要去拼 `/v1/audio/speech` 或 `/v1/audio/transcriptions` 這類端點**，它們是另一回事。

  2. **動手前先確認模型屬於哪個協議家族，再決定寫哪套欄位**。`gpt-realtime-2.1` 和 `gpt-realtime-2.1-mini` 走 Realtime GA 協議；`qwen3.5-omni-plus-realtime` 和 `qwen3.5-omni-flash-realtime` 走阿里雲百鍊協議。兩套只有端點和鑑權相同，請求體與事件名全都不同：輸出模態 `modalities` 對 `output_modalities`；音色 `voice` 在頂層 對 `audio.output.voice`；`input_audio_format` 對 `audio.input.format`；`turn_detection` 在頂層 對 `audio.input.turn_detection`；`input_audio_transcription` 對 `audio.input.transcription`。事件名：`response.text.delta` 對 `response.output_text.delta`，`response.audio.delta` 對 `response.output_audio.delta`。**把這兩套寫成兩個配置模板，不要用 if 到處打補丁。**

  3. 音訊格式紅線：一律 PCM 有符號 16 位、單聲道、Base64 編碼後放進 `input_audio_buffer.append`。**取樣率兩套不一樣**——百鍊協議是 16000，Realtime GA 協議要求大於等於 24000，傳 16000 會直接報 `integer_below_min_value`。重取樣在客戶端做完再發，不要指望服務端兜底。

  4. 打斷收口不要死等 `response.done`。發出 `response.cancel` 之後，**百鍊協議那兩個模型目前收不到 `response.done`**（實測穩定復現）。請以 `response.output_item.done` 作為一輪結束的判據，並額外加一個 5 秒超時兜底；Realtime GA 協議兩個模型正常，但用同一套判據也不會錯。

  5. 長連線要做保活與重連。**百鍊協議實測空閒 300 秒會被上游斷開，而且 WebSocket 層的 ping/pong 不算活動**，續不了這個計時；空閒期要麼定時發一個應用層事件，要麼接受斷線並自動重連。Realtime GA 協議的會話物件帶 `expires_at`（實測約建連後 30 分鐘），到期同樣要重連。**重連之後必須重放 `session.update` 和必要的上下文**，否則新會話是預設配置。

  6. 音色必須在**首幀 `session.update` 就定死**。會話裡一旦已經產生過音訊輸出，再改音色會報 `cannot_update_voice`。要換音色請新開會話。

  7. Key 從環境變數 `APIYI_API_KEY` 讀，不要硬編碼進程式碼、也不要提交進 git。**前端不要直連**，寫一個後端中繼，由後端持有令牌並轉發音訊幀。

  8. 先跑純文本冒煙再接麥克風：`output_modalities` 只留文本，發一條 `input_text`，確認能收到文本增量和 `response.done` 裡的 `usage`，再去接音訊。改完兩個協議家族各真跑一次，把兩次的 `usage` 貼給我。
</Prompt>

<Accordion title="這段提示詞替你擋掉了什麼">
  | 要求                        | 擋掉的坑                                                   |
  | ------------------------- | ------------------------------------------------------ |
  | 先確認協議家族再寫欄位               | 只改 `model` 名不改請求體，握手能過但 `session.update` 必被拒           |
  | 取樣率分家族寫死                  | 給 Realtime GA 協議傳 16 kHz 直接報 `integer_below_min_value` |
  | 輸出模態欄位改名了                 | 照著百鍊那套寫 `modalities`，在 GA 協議上是無效欄位                     |
  | 事件名也換了                    | 監聽 `response.text.delta` 在 GA 協議上永遠收不到東西               |
  | 打斷以 `output_item.done` 收口 | 百鍊協議打斷後不下發 `response.done`，死等會把這一輪掛住                   |
  | 空閒要保活，ping 不算數            | 以為有心跳就不會斷，實際 300 秒靜默照樣被切                               |
  | 音色首幀定死                    | 出過音訊後再改會報 `cannot_update_voice`                        |
  | 前端不直連、寫後端中繼               | 瀏覽器直連要把令牌交給頁面，等於公開金鑰                                   |
</Accordion>

## 為什麼選 API易 的 Realtime 語音

<CardGroup cols={2}>
  <Card title="一把令牌，四個模型" icon="key-round">
    同一條 `wss` 端點、同一套鑑權，換模型只改 `model` 引數與對應欄位模板，不用維護兩家賬號體系。
  </Card>

  <Card title="國內直連，免出海" icon="globe">
    國內機房、家寬網路、海外節點均可直連 `api.apiyi.com`，無需註冊上游廠商賬號、無需實名與預充值。
  </Card>

  <Card title="兩套協議差異已替你測完" icon="git-compare">
    欄位對照、事件名對照、取樣率紅線、四條實測限制全部寫進本頁，不用自己踩一遍。
  </Card>

  <Card title="文本通道可零成本自測" icon="terminal">
    不接麥克風就能驗證握手、鑑權、欄位、工具鏈和併發——音訊檔位比文本貴一個數量級，聯調階段省下來的是真金白銀。
  </Card>

  <Card title="實測延遲與併發有據可查" icon="gauge">
    20 併發下握手 p50 0.65–1.08 秒、首個文本增量 p50 0.54–0.95 秒，測試口徑與日期都寫在「技術規格」裡。
  </Card>

  <Card title="內測期直連技術支援" icon="handshake">
    內測客戶走企業微信直連，接入問題、併發擴容、上游行為變化都可以直接問到人。
  </Card>
</CardGroup>

## 核心特性

<CardGroup cols={2}>
  <Card title="雙向流式 · 可打斷" icon="radio">
    音訊邊說邊出，客戶端隨時發 `response.cancel` 打斷當前回覆，會話不中斷、上下文不丟。四個模型均實測通過。
  </Card>

  <Card title="兩種自動斷句" icon="scissors">
    `server_vad` 按靜音時長斷句，`semantic_vad` 按語義意圖斷句（更能忽略「嗯」「對」這類附和聲）。兩種在四個模型上均實測通過。
  </Card>

  <Card title="Function Calling 全鏈路" icon="wrench">
    模型自主觸發工具 → 客戶端執行 → `function_call_output` 回注結果 → 模型接著說。四個模型的完整鏈路均實測通過。
  </Card>

  <Card title="圖片輸入 · 分模態計量" icon="image">
    會話中可以送入圖片讓模型識讀；`usage` 把文本 / 音訊 / 圖片 token 分列返回，成本可歸因。四個模型均實測通過。
  </Card>
</CardGroup>

## 支援的模型

| 模型                            | 協議家族           | 預設音色    | 輸入取樣率    | Prompt 快取 | 定位            |
| ----------------------------- | -------------- | ------- | -------- | --------- | ------------- |
| `gpt-realtime-2.1`            | Realtime GA 協議 | `marin` | ≥ 24 kHz | ✅ 支援      | 旗艦，多語種與推理能力最強 |
| `gpt-realtime-2.1-mini`       | Realtime GA 協議 | `marin` | ≥ 24 kHz | ✅ 支援      | 高性價比，日常對話夠用   |
| `qwen3.5-omni-plus-realtime`  | 阿里雲百鍊協議        | `Tina`  | 16 kHz   | ⏸ 暫不支援    | 中文場景旗艦        |
| `qwen3.5-omni-flash-realtime` | 阿里雲百鍊協議        | `Tina`  | 16 kHz   | ⏸ 暫不支援    | 中文場景高性價比      |

輸出音訊四個模型統一為 **PCM 有符號 16 位 / 單聲道 / 24 kHz**。

<Warning>
  兩個協議家族**只有端點與鑑權相同**，請求體欄位與服務端事件名都不同。換模型時必須同步換欄位模板，詳見下方「兩套協議對照」一節。
</Warning>

## 模型定價

<Info>
  **一句話理解定價**：按 token 計費，**音訊比文本貴一個數量級**（以 `gpt-realtime-2.1` 為例，音訊輸入 \$32 對文本輸入 \$4，音訊輸出 \$64 對文本輸出 \$24）。所以聯調階段應該跑純文本，等鏈路確認無誤再接音訊——具體做法見下方「先用文本跑通」一節。
</Info>

下表為**各廠商的官方定價口徑**，單位為每 100 萬 tokens 美元。**站內實際扣費以[控制台呼叫日誌](/zh-Hant/api-capabilities/log-query)為準**；疊加[充值加贈活動](/zh-Hant/faq/recharge-promotions)後實付更低。

### Realtime GA 協議

| 模型                      | 文本輸入  | 文本輸出  | 快取讀    | 圖片輸入  | 音訊輸入 | 音訊輸出 |
| ----------------------- | ----- | ----- | ------ | ----- | ---- | ---- |
| `gpt-realtime-2.1`      | \$4   | \$24  | \$0.4  | \$5   | \$32 | \$64 |
| `gpt-realtime-2.1-mini` | \$0.6 | \$2.4 | \$0.06 | \$0.8 | \$10 | \$30 |

### 阿里雲百鍊協議

計費維度與上表不同：圖片輸入併入文本檔，輸出側只區分「純文本」與「文本+音訊」（後者只對音訊部分計費）。

| 模型                            | 文本 / 圖片輸入 | 音訊輸入   | 文本輸出   | 文本+音訊輸出 |
| ----------------------------- | --------- | ------ | ------ | ------- |
| `qwen3.5-omni-plus-realtime`  | \$1.38    | \$11   | \$8.25 | \$41.26 |
| `qwen3.5-omni-flash-realtime` | \$0.45    | \$3.71 | \$2.75 | \$14.71 |

<Note>
  **內測期說明**：Realtime 語音目前處於內測供給階段，計費口徑仍在與上游對齊。若實際扣費與上表偏差較大，歡迎聯絡客服溝通核對。平臺會隨官方政策與供給能力動態調整價格，該能力以**保障供給、服務客戶**為主，並非盈利型定價。
</Note>

## 分組介紹

<Note>
  **內測期開通方式**：本能力暫不提供自助分組勾選，按申請開通。請通過[企業微信客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)聯絡我們，說明賬號、使用場景與預估併發，我們會為你的令牌開通內測分組並同步注意事項。正式上線後會在[更新日誌](/changelog)另行公告，屆時令牌與程式碼無需改動。
</Note>

## 技術規格

| 維度       | 引數                                                              |
| -------- | --------------------------------------------------------------- |
| **傳輸協議** | WebSocket（`wss://`），單連線雙向流式                                     |
| **鑑權**   | `Authorization: Bearer <令牌>` 請求頭                                |
| **事件格式** | 與 OpenAI Realtime 事件模型相容（客戶端事件 / 服務端事件）                         |
| **輸入音訊** | PCM 有符號 16 位、單聲道、Base64。**百鍊協議 16 kHz；Realtime GA 協議 ≥ 24 kHz** |
| **輸出音訊** | PCM 有符號 16 位、單聲道、24 kHz                                         |
| **輸出模態** | 文本 / 音訊（可只要文本）                                                  |
| **自動斷句** | `server_vad`、`semantic_vad`，或關閉走手動 `commit`                     |
| **工具呼叫** | 支援，含 `function_call_output` 結果回注                                |
| **圖片輸入** | 支援（兩家族寫法不同，見下）                                                  |
| **會話時長** | Realtime GA 協議：會話帶 `expires_at`，實測約建連後 30 分鐘；百鍊協議：實測空閒 300 秒斷開  |

### 實測延遲與併發

2026-08-24 (UTC+8) 經 `api.apiyi.com` 公網路徑實測，20 路併發 × 2 模型，單輪純文本問答：

| 指標           | 實測值                  |
| ------------ | -------------------- |
| WebSocket 握手 | p50 0.65–1.08 秒      |
| 首個文本增量       | p50 0.54–0.95 秒      |
| 單輪問答整輪       | p50 \< 1 秒           |
| 會話成功率        | 99.6%（1 例握手失敗，重連即恢復） |

<Warning>
  上述數字是特定時點、特定併發下的實測值，不構成效能承諾。**內測期不提供可用率 SLA**，請在客戶端實現重連與降級。
</Warning>

## 端點一覽

| 端點                                            | 用途       | 鑑權                           |
| --------------------------------------------- | -------- | ---------------------------- |
| `wss://api.apiyi.com/v1/realtime?model=<模型名>` | 建立即時語音會話 | `Authorization: Bearer <令牌>` |

四個模型共用這一條端點，`model` 查詢引數決定路由到哪個模型。

<Warning>
  **關於瀏覽器直連**：本端點也接受 `Sec-WebSocket-Protocol` 子協議形式的鑑權（`realtime, openai-insecure-api-key.<令牌>, openai-beta.realtime-v1`），瀏覽器 `WebSocket` 建構函式能直接連上——但這**等於把令牌發給瀏覽器**，任何訪問者都能從網路面板裡拿到。**僅供本機驗證使用**。生產環境請寫一個後端中繼：由後端持有令牌、建立到 API易 的連線，前端只與你自己的服務通訊。
</Warning>

## ⚠️ 兩套協議對照（遷移必讀）

兩個家族的端點、鑑權、整體事件流程完全一致，差異集中在 `session.update` 的欄位結構和幾個服務端事件名上。

### 請求體欄位對照

| 用途     | 阿里雲百鍊協議                            | Realtime GA 協議                                           |
| ------ | ---------------------------------- | -------------------------------------------------------- |
| 輸出模態   | `modalities: ["text","audio"]`     | `output_modalities: ["audio"]`                           |
| 音色     | `voice`（頂層）                        | `audio.output.voice`                                     |
| 語速     | 不支援                                | `audio.output.speed`（0.7 / 1.0 / 1.5 實測線性生效）             |
| 輸入音訊格式 | `input_audio_format: "pcm"`，16 kHz | `audio.input.format: {"type":"audio/pcm","rate":24000}`  |
| 輸出音訊格式 | `output_audio_format: "pcm"`       | `audio.output.format: {"type":"audio/pcm","rate":24000}` |
| 自動斷句   | `turn_detection`（頂層）               | `audio.input.turn_detection`                             |
| 輸入轉寫   | `input_audio_transcription`        | `audio.input.transcription`                              |

### 服務端事件名對照

| 內容     | 阿里雲百鍊協議                           | Realtime GA 協議                           |
| ------ | --------------------------------- | ---------------------------------------- |
| 文本增量   | `response.text.delta`             | `response.output_text.delta`             |
| 音訊增量   | `response.audio.delta`            | `response.output_audio.delta`            |
| 音訊轉寫增量 | `response.audio_transcript.delta` | `response.output_audio_transcript.delta` |

`session.created` / `session.updated` / `conversation.item.create` / `input_audio_buffer.append` / `input_audio_buffer.commit` / `response.create` / `response.cancel` / `response.done` 等其餘事件名兩套一致。

### 兩段最小 session.update

同一件事各寫一遍，可以直接抄。**阿里雲百鍊協議**：

```json theme={null}
{
  "type": "session.update",
  "session": {
    "modalities": ["text", "audio"],
    "voice": "Ethan",
    "input_audio_format": "pcm",
    "output_audio_format": "pcm",
    "input_audio_transcription": { "model": "qwen3-asr-flash-realtime" },
    "turn_detection": { "type": "semantic_vad" }
  }
}
```

**Realtime GA 協議**：

```json theme={null}
{
  "type": "session.update",
  "session": {
    "type": "realtime",
    "output_modalities": ["audio"],
    "audio": {
      "input": {
        "format": { "type": "audio/pcm", "rate": 24000 },
        "transcription": { "model": "whisper-1" },
        "turn_detection": { "type": "semantic_vad" }
      },
      "output": {
        "format": { "type": "audio/pcm", "rate": 24000 },
        "voice": "alloy",
        "speed": 1.0
      }
    }
  }
}
```

<Warning>
  **取樣率是硬約束**：Realtime GA 協議的 `audio.input.format.rate` 必須 **≥ 24000**，傳 16000 會直接報 `integer_below_min_value: Expected a value >= 24000`。阿里雲百鍊協議則要求輸入 16 kHz。重取樣請在客戶端完成。
</Warning>

## 先用文本跑通：文本通道的意義與三級自測階梯

音訊鏈路要調麥克風採集、重取樣、分片、斷句，任何一環出錯都表現為「沒反應」，很難定位。所以**不要一上來就接麥克風**。

### 文本是控制面，不是備選輸入

在即時語音模型裡，文本不是「音訊之外的另一種輸入方式」，而是**除音訊流以外的全部控制通道**：

| 組合       | 典型用途                                                                 |
| -------- | -------------------------------------------------------------------- |
| 文本 → 控制面 | `instructions` 系統提示、`function_call_output` 工具返回、檢索結果注入——全部是文本，麥克風碰不到 |
| 文本 → 音訊  | 等於一個**帶完整對話上下文的 TTS**：讓普通模型先想清楚，再交給即時模型「說出來」，適合播報與提示音                |
| 文本 → 文本  | **最便宜的除錯通道**：純文本對話本身用普通對話模型更划算，它在這裡的價值是零成本驗證鏈路                       |

### 三級自測階梯

<Steps>
  <Step title="第一級：純文本，不碰麥克風">
    把 `output_modalities` 只留文本、關掉自動斷句，發一條 `input_text` 就能驗證：握手通不通、令牌與分組對不對、**欄位模板選對了沒有**、`session.update` 有沒有生效、工具能不能回注、多輪上下文在不在、併發扛不扛得住。**完全不產生音訊 token。**
  </Step>

  <Step title="第二級：回放本地 wav 檔案">
    用一段固定的本地音訊代替麥克風，按 100 毫秒一片喂進 `input_audio_buffer.append`。這一步把**音訊鏈路**（格式、取樣率、分片、`commit`、VAD 觸發）與業務邏輯解耦，可重複、可迴歸——同一個檔案跑兩次結果應該一致。
  </Step>

  <Step title="第三級：接即時麥克風">
    前兩級都通過之後，只剩採集與播放兩件事要調。這時如果出問題，範圍已經被縮到很小。
  </Step>
</Steps>

<Tip>
  **沒有現成測試音訊？** macOS 自帶工具一行就能造一段合規的：

  ```bash theme={null}
  say -v Tingting -o /tmp/ask.aiff "今天北京的天氣怎麼樣？請用一句話回答。"

  # Realtime GA 協議用 24000
  afconvert -f WAVE -d LEI16@24000 -c 1 /tmp/ask.aiff ask_24k.wav
  # 阿里雲百鍊協議用 16000
  afconvert -f WAVE -d LEI16@16000 -c 1 /tmp/ask.aiff ask_16k.wav
  ```

  取樣率選錯是第二級最常見的翻車點，兩套協議要求不同，別混用。
</Tip>

### 一段能跑的文本冒煙指令碼

只依賴 `websockets`（`pip install websockets`）。改 `FAMILY` 一個變數就能在兩套協議之間切換：

```python theme={null}
import asyncio, json, os, websockets

FAMILY = "ga"           # ga = gpt-realtime-2.1 系列；omni = qwen3.5-omni 系列
MODEL = "gpt-realtime-2.1" if FAMILY == "ga" else "qwen3.5-omni-plus-realtime"
URL = f"wss://api.apiyi.com/v1/realtime?model={MODEL}"
HEADERS = {"Authorization": "Bearer " + os.environ["APIYI_API_KEY"]}

# 兩套協議只在這裡分叉：session 欄位結構與文本增量事件名不同，其餘流程完全一樣
SESSION = ({"type": "realtime", "output_modalities": ["text"],
            "audio": {"input": {"turn_detection": None}}}
           if FAMILY == "ga" else
           {"modalities": ["text"], "turn_detection": None})
TEXT_DELTA = "response.output_text.delta" if FAMILY == "ga" else "response.text.delta"

async def main():
    async with websockets.connect(URL, additional_headers=HEADERS) as ws:
        while json.loads(await ws.recv())["type"] != "session.created":
            pass
        await ws.send(json.dumps({"type": "session.update", "session": SESSION}))
        await ws.send(json.dumps({"type": "conversation.item.create", "item": {
            "type": "message", "role": "user",
            "content": [{"type": "input_text", "text": "用一句話解釋什麼是 WebSocket。"}]}}))
        await ws.send(json.dumps({"type": "response.create"}))
        while True:
            e = json.loads(await ws.recv())
            if e["type"] == TEXT_DELTA:
                print(e["delta"], end="", flush=True)
            elif e["type"] == "response.done":
                print("\n\nusage =", json.dumps(e["response"]["usage"], ensure_ascii=False))
                return
            elif e["type"] == "error":
                print("\nERROR:", json.dumps(e, ensure_ascii=False))
                return

asyncio.run(main())
```

跑通了說明端點、令牌、分組、欄位模板四件事都對了，可以進第二級。

## 會話能力：音色 · 斷句 · 工具 · 圖片

### 音色

| 項    | 阿里雲百鍊協議                           | Realtime GA 協議                               |
| ---- | --------------------------------- | -------------------------------------------- |
| 預設音色 | `Tina`                            | `marin`                                      |
| 實測可用 | `Tina`、`Ethan` 等                  | `alloy`、`marin`、`cedar`、`shimmer`、`verse`    |
| 語速調節 | 不支援                               | `audio.output.speed`，0.7 / 1.0 / 1.5 時長呈線性變化 |
| 非法音色 | 報 `Voice 'xxx' is not supported.` | 報 `invalid_value`                            |

<Warning>
  **音色要在首幀 `session.update` 就定死。** 會話裡一旦已經產生過音訊輸出，再改音色會報 `cannot_update_voice`——這是兩套協議共有的行為。要換音色請新開一個會話。另外阿里雲百鍊協議**不要傳空字串音色**，空值會回落到一個不受支援的音色並報 400；不需要指定時直接省略該欄位即可。
</Warning>

### 斷句：server\_vad 與 semantic\_vad

* `server_vad` —— 按靜音時長斷句，引數直觀（`threshold`、`silence_duration_ms`、`prefix_padding_ms`）。
* `semantic_vad` —— 按語義意圖斷句，能忽略「嗯」「對」這類附和聲和無意義背景音，多人環境更穩。
* 也可以把斷句關掉（傳 `null` 或 `none`）走**手動模式**：自己發 `input_audio_buffer.commit` 再發 `response.create`，適合「按住說話」這類由 UI 控制輪次的互動。

<Tip>
  用 VAD 模式時**必須持續推流**。說完話之後要接著推一小段靜音（實測補 2 秒即可），服務端才能判定「說話結束」；只推有聲部分然後停下，`speech_stopped` 不會觸發，也就不會自動應答。
</Tip>

### 工具呼叫

事件順序：模型輸出 `function_call` 型別的 `response.output_item.done`（其中帶 `call_id` 和 `arguments`）→ 客戶端執行 → 回注結果 → 再次 `response.create` 讓模型接著說。

```json theme={null}
{
  "type": "conversation.item.create",
  "item": {
    "type": "function_call_output",
    "call_id": "call_xxx",
    "output": "{\"city\":\"北京\",\"weather\":\"小雨\",\"temp_c\":21}"
  }
}
```

四個模型的完整鏈路均實測通過，回注結果後模型能正確複述工具返回的內容。

### 圖片輸入

**Realtime GA 協議**：直接在訊息裡放 `input_image`，值可以是 data URI。

```json theme={null}
{
  "type": "conversation.item.create",
  "item": {
    "type": "message",
    "role": "user",
    "content": [
      { "type": "input_image", "image_url": "data:image/jpeg;base64,..." },
      { "type": "input_text", "text": "圖裡寫了什麼？" }
    ]
  }
}
```

**阿里雲百鍊協議**：圖片被當作**影片幀**處理，必須先有音訊再追加圖片，否則報 `Error append image before append audio.`。實測做法是把 `input_image_buffer.append` 按約每秒一幀交織進 `input_audio_buffer.append` 序列裡。

## 已知限制與規避（內測期）

以下四條均為實測結論，且都會打到客戶端程式碼，接入前請先看一遍。

| 現象                                                | 影響家族                | 客戶端怎麼繞                                                                  |
| ------------------------------------------------- | ------------------- | ----------------------------------------------------------------------- |
| 發出 `response.cancel` 後收不到 `response.done`，這一輪不會收口 | 阿里雲百鍊協議（6 次測試全部復現）  | 以 `response.output_item.done` 判定一輪結束，並加 5 秒超時兜底。會話本身不受影響，打斷後可繼續對話       |
| 空閒 300 秒被上游斷開，且 WebSocket 層 ping/pong **不算活動**    | 阿里雲百鍊協議             | 空閒期定時發一個應用層事件保活，或接受斷線並自動重連；重連後重放 `session.update`                       |
| 會話已產生音訊後無法再改音色，報 `cannot_update_voice`            | 兩個家族                | 首幀 `session.update` 就把 `voice` 定死；要換音色新開會話                              |
| 手動 `commit` 模式下收不到輸入轉寫的完成事件                       | 阿里雲百鍊協議的 `flash` 型號 | 改用 `server_vad` / `semantic_vad` 模式，該模式下轉寫正常；對話本身不受影響，模型對音訊內容的理解與回答是正確的 |

<Warning>
  內測期上述行為可能隨上游變化而調整，本頁會持續更新。遇到本表之外的異常，歡迎通過[企業微信客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)或 [feedback@apiyi.com](mailto:feedback@apiyi.com) 反饋，附上時間點與 `session.id` 便於我們定位。
</Warning>

## 最佳實踐

<Steps>
  <Step title="先按協議家族選欄位模板">
    把兩套 `session.update` 寫成兩個配置常量，按模型名選擇，不要用 if 到處打補丁。這是最容易在半年後維護出錯的地方。
  </Step>

  <Step title="首幀一次性定死會話引數">
    `output_modalities`、`voice`、`speed`、`turn_detection`、`transcription` 在第一條 `session.update` 裡全部設好。音色尤其如此——出過音訊再改就晚了。
  </Step>

  <Step title="純文本冒煙通過再接音訊">
    先跑本頁的文本冒煙指令碼確認端點、令牌、分組、欄位四件事都對，再進音訊。音訊檔位比文本貴一個數量級，聯調期跑文本能省下大部分成本。
  </Step>

  <Step title="取樣率與聲道在客戶端轉好">
    PCM 有符號 16 位、單聲道，百鍊協議 16 kHz、Realtime GA 協議 ≥ 24 kHz。不要指望服務端兜底，格式不對通常表現為「沒反應」而不是明確報錯。
  </Step>

  <Step title="用 output_item.done 加超時收口">
    不要只等 `response.done`。這樣寫在兩個家族上都正確，也避免打斷時把一輪掛住。
  </Step>

  <Step title="長會話做保活與重連">
    百鍊協議關注 300 秒空閒上限，Realtime GA 協議關注會話 `expires_at`。**重連之後必須重放 `session.update` 與必要的上下文**，否則新會話是預設配置。
  </Step>

  <Step title="生產走後端中繼">
    令牌只放在後端，前端與你自己的服務通訊。瀏覽器直連雖然技術上可行，但等於公開金鑰。
  </Step>
</Steps>

## 錯誤碼與重試

| 現象                                        | 含義                           | 處理建議                                            |
| ----------------------------------------- | ---------------------------- | ----------------------------------------------- |
| 握手返回 401                                  | 令牌無效，或沒有攜帶 `Authorization` 頭 | 檢查令牌本身、是否寫成了 `https://`、請求頭有沒有帶上                |
| 握手返回 503 且提示無可用渠道                         | 令牌未開通內測分組，或模型名拼錯             | 聯絡客服確認分組已開通；核對 `model` 引數                       |
| 握手返回 400                                  | 缺少 `model` 查詢引數              | 端點必須帶 `?model=<模型名>`                            |
| `invalid_request_error` + 未知欄位            | **協議家族用錯了**                  | 對照本頁「請求體欄位對照」換成該模型對應的欄位模板                       |
| `integer_below_min_value`                 | Realtime GA 協議的輸入取樣率小於 24000 | 客戶端重取樣到 24 kHz 及以上                              |
| `cannot_update_voice`                     | 會話已產生音訊後又改音色                 | 首幀定死音色；要換請新開會話                                  |
| `Error append image before append audio.` | 百鍊協議下先追加了圖片                  | 先 `input_audio_buffer.append` 再追加圖片幀            |
| WebSocket 1006 / 1011 異常斷開                | 網路抖動或上游斷連                    | 指數退避重連（1 秒 / 4 秒 / 16 秒），重連後重放 `session.update` |
| 連線靜默約 5 分鐘後斷開                             | 百鍊協議的空閒上限                    | 見「已知限制與規避」的保活方案                                 |

<Info>
  排查建議：記錄每條事件的 `event_id` 與會話的 `session.id`，反饋問題時附上，能大幅縮短定位時間。另外 **Realtime GA 協議的錯誤物件帶 `code` 與 `param` 欄位**（會明確指出是哪個欄位、支援哪些取值），百鍊協議的錯誤資訊相對粗一些，除錯期優先在前者上驗證欄位寫法。
</Info>

## 常見問題

<AccordionGroup>
  <Accordion title="為什麼這一頁沒有線上 Playground？">
    線上 Playground 由 OpenAPI 規格驅動，而 OpenAPI 描述的是「一次請求、一次響應」的 HTTP 互動。Realtime 是一條長連線上幾十種事件雙向來回跑，對映不過去。替代方案是本頁「先用文本跑通」一節的文本冒煙指令碼——不用麥克風、幾十行程式碼就能確認鏈路是通的。
  </Accordion>

  <Accordion title="四個模型能只改 model 名互相替換嗎？">
    **不能。** 端點和鑑權一樣，但請求體欄位和事件名分屬兩套協議。至少要改這幾處：`modalities` ↔ `output_modalities`、`voice` ↔ `audio.output.voice`、`input_audio_format` ↔ `audio.input.format`、`turn_detection` ↔ `audio.input.turn_detection`、`input_audio_transcription` ↔ `audio.input.transcription`，以及 `response.text.delta` ↔ `response.output_text.delta`、`response.audio.delta` ↔ `response.output_audio.delta` 兩個事件名。完整對照見下方「兩套協議對照」一節。
  </Accordion>

  <Accordion title="握手就失敗 / 連不上，怎麼排查？">
    按順序查五件事：① 協議是不是寫成了 `https://`，應該是 `wss://`；② 端點有沒有帶 `?model=<模型名>`；③ `Authorization: Bearer <令牌>` 請求頭有沒有帶上；④ 令牌是否已開通內測分組（沒開通會返回 503 提示無可用渠道）；⑤ 中間有沒有反向代理吃掉了 `Upgrade` 頭——自建閘道轉發時這一點很常見。
  </Accordion>

  <Accordion title="瀏覽器能直連嗎？令牌會不會洩露？">
    技術上能。本端點接受 `Sec-WebSocket-Protocol` 子協議形式的鑑權，瀏覽器 `WebSocket` 建構函式可以直接連上。但這**等於把令牌發給瀏覽器**，任何訪問者都能從網路面板讀到，**只建議用於本機驗證**。生產環境請寫一個後端中繼：後端持有令牌並建立到 API易 的連線，前端只與你自己的服務通訊。
  </Accordion>

  <Accordion title="給 gpt-realtime-2.1 傳 16 kHz 音訊報錯？">
    Realtime GA 協議要求輸入取樣率 **≥ 24000**，傳 16000 會報 `integer_below_min_value`。正確寫法是 `"audio": {"input": {"format": {"type": "audio/pcm", "rate": 24000}}}`。阿里雲百鍊協議那兩個模型則要求 16 kHz，兩套不能混用。
  </Accordion>

  <Accordion title="沒有麥克風 / 音訊不好測，怎麼辦？">
    走本頁「先用文本跑通」一節的三級自測階梯：先純文本驗證鏈路（不產生音訊 token），再用一段本地 wav 檔案回放驗證音訊鏈路，最後才接即時麥克風。測試音訊可以用 macOS 自帶的 `say` + `afconvert` 一行生成，命令見該節。
  </Accordion>

  <Accordion title="發了 response.cancel 之後一直等不到 response.done？">
    這是阿里雲百鍊協議那兩個模型目前的已知行為（6 次測試全部復現）：打斷後會依次收到 `response.text.done`、`response.content_part.done`、`response.output_item.done`，但不再下發 `response.done`。**請改用 `response.output_item.done` 作為一輪結束的判據，並加超時兜底。** 會話本身不受影響，打斷後可以繼續正常對話。Realtime GA 協議那兩個模型此處表現正常。
  </Accordion>

  <Accordion title="連線大約 5 分鐘就斷了？">
    阿里雲百鍊協議實測**空閒 300 秒**會被上游主動斷開，而且 **WebSocket 層的 ping/pong 不算活動**——有心跳也續不了這個計時。解決辦法：空閒期定時發一個應用層事件（例如一次 `session.update`）保活，或者接受斷線並實現自動重連。重連後記得重放 `session.update` 與必要的上下文。
  </Accordion>

  <Accordion title="一個會話最長能開多久？">
    Realtime GA 協議的 `session.created` 事件裡帶 `expires_at` 欄位，實測約為建連後 30 分鐘，到期需要重連。阿里雲百鍊協議側我們主要觀測到的是空閒 300 秒斷開這一約束。長通話請按「會話會到期」來設計，做好跨會話的上下文續接。
  </Accordion>

  <Accordion title="音色怎麼設？為什麼中途改音色報 cannot_update_voice？">
    音色在 `session.update` 裡設：百鍊協議是頂層 `voice`，Realtime GA 協議是 `audio.output.voice`。**一旦會話中已經產生過音訊輸出，就不能再改音色**，這是兩套協議共有的限制，會報 `cannot_update_voice`。請在首幀就定死，要換音色請新開會話。另外百鍊協議不要傳空字串音色，會觸發 400。
  </Accordion>

  <Accordion title="手動 commit 模式下拿不到輸入轉寫文本？">
    阿里雲百鍊協議的 `flash` 型號在手動 `commit` 模式下不會下發轉寫的完成事件（多次測試穩定復現），`plus` 型號正常，兩者在 VAD 模式下都正常。**推薦改用 `server_vad` 或 `semantic_vad` 模式**。實測發現轉寫文本此時落在增量事件的一個未公開欄位裡，但該欄位隨時可能變化，**不建議依賴**。注意這隻影響「在介面上回顯使用者說了什麼」，不影響對話本身——模型對音訊內容的理解與回答是正確的。
  </Accordion>

  <Accordion title="支援圖片輸入嗎？為什麼報 Error append image before append audio.？">
    四個模型都支援圖片輸入，但寫法不同。Realtime GA 協議可以直接在訊息裡放 `input_image`；阿里雲百鍊協議把圖片當作**影片幀**處理，必須先追加音訊再追加圖片，否則就會報這個錯。實測做法是按約每秒一幀，把圖片交織進音訊分片序列裡。
  </Accordion>

  <Accordion title="有 Prompt 快取嗎？怎麼確認命中？">
    Realtime GA 協議那兩個模型支援，且是自動生效的——實測同一會話內第二輪即命中，`usage` 的 `input_token_details.cached_tokens` 會有值。阿里雲百鍊協議那兩個模型目前未觀察到快取命中。
  </Accordion>

  <Accordion title="成本怎麼估？文本和音訊是分開算的嗎？">
    `response.done` 事件的 `usage` 欄位按模態分列返回（文本 / 音訊 / 圖片，輸入輸出各一組），可以據此歸因。音訊檔位顯著高於文本，所以聯調期建議跑純文本。**準確扣費請以[控制台呼叫日誌](/zh-Hant/api-capabilities/log-query)為準。**
  </Accordion>
</AccordionGroup>

## 相關文件

<CardGroup cols={2}>
  <Card title="API 使用手冊" icon="book-open" href="/zh-Hant/api-manual">
    令牌建立、Base URL、計費模式等通用呼叫規範。
  </Card>

  <Card title="令牌與分組管理" icon="key-round" href="/zh-Hant/api-capabilities/token-management">
    令牌建立、分組勾選與額度控制。
  </Card>

  <Card title="呼叫日誌查詢" icon="receipt-text" href="/zh-Hant/api-capabilities/log-query">
    檢視每次呼叫的 token 用量與實際扣費。
  </Card>

  <Card title="模型價格總表" icon="table" href="/models">
    全站模型的即時價格、端點與分組。
  </Card>

  <Card title="充值加贈活動" icon="percent" href="/zh-Hant/faq/recharge-promotions">
    疊加後實付更低。
  </Card>

  <Card title="申請內測開通" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    聯絡企業微信客服，報上賬號與預估併發。
  </Card>
</CardGroup>

<Info>
  Realtime 語音目前處於**內測接入中**狀態，本頁所有實測結論標註於 2026-08-24 (UTC+8)，會隨上游變化持續更新。有接入計劃、遇到本頁未覆蓋的問題、或需要更高併發額度，歡迎聯絡 [hi@apiyi.com](mailto:hi@apiyi.com) / [feedback@apiyi.com](mailto:feedback@apiyi.com)。
</Info>
