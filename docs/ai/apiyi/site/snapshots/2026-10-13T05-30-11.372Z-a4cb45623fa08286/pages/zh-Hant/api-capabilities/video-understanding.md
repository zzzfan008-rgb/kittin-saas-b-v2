> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 影片理解 API

> 用 Gemini、Seed（豆包）、Qwen、Kimi 等模型進行影片分析：內容識別、場景描述、動作分析與時間戳定位。含 19 個模型的實測支援清單、通用 video_url 寫法、各家輸入限制與「不支援影片」的模型名單。

API易 上有多家模型能「看懂」影片：用一段提示詞，讓模型識別影片裡的場景、動作、字幕，並按時間戳定位關鍵畫面。除了 Gemini 系列，**Seed（豆包）全系、Qwen 視覺 / 全模態系列、Kimi K3** 也都實測可用。本頁給出支援清單、通用寫法，以及最容易踩坑的限制。

<Note>
  **先看這三條**：

  1. **通用寫法是 `video_url`**：`{"type": "video_url", "video_url": {"url": "data:video/mp4;base64,..."}}`，Seed / Qwen / Kimi / MiniMax / Gemini 都認。本頁舊版的 `image_url` + `data:video/mp4` 寫法**只有 Gemini 認**，換成別的模型會直接 400。
  2. **GPT、Grok、Claude、GLM、DeepSeek 不支援影片輸入**。其中 GPT 和 GLM 會**靜默丟掉影片**、照樣返回 200，GPT 還可能編出一段看似合理的答案——詳見「不支援影片的模型」。
  3. **Gemini 不接收公開影片直鏈**：可能報 `Request contains an invalid argument`，也可能返回 200 但影片被靜默丟棄（`prompt_tokens` 只有幾十），模型回答「看不到」甚至說畫面是「黑屏」；Seed / Qwen / Kimi 可以直接傳公網 https 地址。
</Note>

<CardGroup cols={2}>
  <Card title="視覺化介面測試" icon="flask-conical" href="https://icover.ai/zh/video-understanding">
    在 iCover 視覺化測試工具裡直接上傳影片、除錯理解介面。
  </Card>
</CardGroup>

## 讓 AI Agent 幫你接入

<Note>
  在用 Codex / Claude Code / Cursor 開發的話，把下面這段提示詞複製給它。它會先抓本頁的純文本版（任意文件頁地址後加 `.md`），再按你專案的技術棧寫程式碼——通用 `video_url` 寫法、**Gemini 不收公網直鏈與 20MB 上限**、**用 `prompt_tokens` 確認影片真的進了模型**這幾個高頻問題已經寫死在要求裡。
</Note>

<Prompt description="讓程式設計 Agent 接入或排查影片理解（Gemini / Seed / Qwen / Kimi）。複製後直接貼上給 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  幫我在當前專案裡接入 / 排查影片理解：把一段影片交給多模態模型，做內容摘要、場景描述、動作分析或按時間戳定位。

  先讀文件再動手：抓 [https://docs.apiyi.com/api-capabilities/video-understanding.md](https://docs.apiyi.com/api-capabilities/video-understanding.md) 拿到本頁純文本版；需要 YouTube 連結時再看 gemini/native 頁，同樣加 `.md` 字尾。

  接入要求：

  1. 端點與寫法：走 OpenAI 相容的 `POST https://api.apiyi.com/v1/chat/completions`，影片統一用 `{"type": "video_url", "video_url": {"url": ...}}` 放進 `messages[].content`，和文本塊並列。**不要用 `image_url` + `data:video/mp4` 的舊寫法**（只有 Gemini 認，換成別家模型直接 400），**也不要用 Responses 端點的 `input_video`**。這是同步介面，不需要輪詢。

  2. 選模型：預設用 `gemini-3.8-flash`（影片 token 最省、支援 YouTube 連結）；需要精確時間戳、或者影片已經在公網地址上，用 `seed-2-0-pro-260328`；大批次低成本可選 `qwen3.8-flash` 或 `seed-2-0-mini-260428`。**GPT、Grok、Claude、GLM、DeepSeek 都不支援影片**——其中 GPT 和 GLM 會靜默丟掉影片照樣返回 200，GPT 還會編答案，別選它們；一定要用的話改成本地抽幀當多張圖片傳。`MiniMax-M3` 時間點不準，需要時間戳時別用。把模型名做成可配置項。

  3. 影片怎麼傳：**Gemini 只收 Base64 data URI**（`data:video/mp4;base64,...`），**整個請求體必須在 20MB 以內**（Base64 會膨脹約 1/3，原始檔案按 14MB 左右算），**不接收公網直鏈**（影片會被丟掉，模型可能回答「看不到」或「黑屏」），**也不支援 `files.upload`**；YouTube 連結只能走 Gemini 原生格式（`google-genai` SDK，base\_url `https://api.apiyi.com`）；專案裡已經在用這個 SDK 的，Base64 影片也可以直接用原生格式的 `Part.from_bytes` 傳，不必改成 OpenAI 相容寫法。Seed / Qwen / Kimi 可以直接傳公網 https 地址，但地址必須對上游可達，拿不準就先用 Base64 跑通。超限的影片先用 ffmpeg 壓縮或擷取片段，統一轉成 H.264 編碼的 mp4。

  4. **確認影片真的進了模型**：每次都讀響應裡的 `usage.prompt_tokens`。10 秒 540p 影片在 Gemini 上約 700、Seed / Qwen 約 5000、Kimi 約 14000（解析度不同會有 ±30% 左右的浮動，只看數量級）；**如果只有幾十個 token，說明影片被丟了**，這時要報錯，不要把模型的回答當結果用。

  5. **防止模型順著問題編答案**：素材出了問題（傳錯檔案、解碼成黑屏 / 灰屏、聯調時用佔位圖）而提示詞又預設了內容時，Gemini 容易照著問題編出不存在的內容，`prompt_tokens` 卻完全正常。素材來源不可控的批次流程，先用中性問題「描述一下你收到的畫面」讓模型確認素材，再問具體問題。

  6. 時間戳：在提示詞裡用 `MM:SS` 指定片段、要求按 `MM:SS` 輸出。Seed 可以在 `video_url` 里加 `"fps": 2` 提高取樣（token 會變多），其他模型忽略這個欄位。

  7. 超時與成本：耗時隨影片長度增長，10 秒影片實測 4 到 30 秒，客戶端超時給 300 秒以上。按 token 計費，影片 token 大約是 Gemini 每秒 70、Seed / Qwen 每秒 500、Kimi 每秒 1400，按這個估成本，長影片先截出需要的片段再傳。

  8. Key 從環境變數 `APIYI_API_KEY` 讀，不要硬編碼進程式碼、也不要提交進 git。

  9. 改完真跑一次：用一段 10 秒左右的短影片調一次，把模型回答、`usage.prompt_tokens` 和這次呼叫的花費貼給我。
</Prompt>

<Accordion title="這段提示詞替你擋掉了什麼">
  | 要求 | 擋掉的坑 |
  | - | - |
  | 統一用 `video_url` | 網上常見的 `image_url` + `data:video/mp4` 只有 Gemini 認，換模型就 400 |
  | 不選 GPT / Grok / Claude / GLM | GPT、GLM 靜默丟掉影片照樣返回 200，GPT 還會編出一段看似合理的答案 |
  | Gemini 只傳 Base64、請求體 20MB 內 | 傳公網直鏈會被靜默丟棄（模型說「看不到」或「黑屏」）或報 `invalid argument`，`files.upload` 第三方不可用 |
  | 讀 `usage.prompt_tokens` | 影片被丟棄時只有幾十個 token，是唯一能程式化發現的訊號 |
  | 先中性問畫面再問具體問題 | 素材出錯時 Gemini 會順著提示詞編答案，token 數正常、查不出來 |
  | 超時 300 秒以上 | 長影片、Kimi 或開思考的模型耗時成倍增長，預設超時容易在拿到結果前斷開 |
</Accordion>

## 支援的模型

以下結論來自 2026-10-11 (UTC+8) 的實測：同一段 10 秒測試影片（每 2.5 秒換一個數字與形狀），要求模型按順序說出數字和出現時間，並用一張空白圖做對照，排除「沒看也能答」的情況。

| 廠商 | 模型 ID | 實測耗時 | 10 秒影片輸入 tokens | 特點 | 推薦場景 |
| - | - | :-: | :-: | - | - |
| Google | `gemini-3.8-flash` 🔥 | 4–9 秒 | 約 700 | 影片 token 最省，單價是 3.5 Flash 的一半；支援 YouTube 連結 | 日常影片分析、YouTube 內容 |
| Google | `gemini-3.1-pro-preview` | — | — | 谷歌最強推理 + 多模態 | 複雜、長影片深度分析 |
| Google | `gemini-3.1-flash-lite` | — | — | 超低價、超低延遲 | 大批次、高併發 |
| 字節跳動 | `seed-2-0-pro-260328` 🔥 | 8–10 秒 | 約 5000 | 時間點最準、支援 `fps` 調取樣 | 國產首選、需要精確時間戳 |
| 字節跳動 | `dola-seed-2-1-turbo-260628` | 16–28 秒 | 約 5000 | 預設開啟思考，答案更細但更慢 | 需要推理的影片問答 |
| 字節跳動 | `seed-2-0-lite-260428` | 約 14 秒 | 約 5000 | 均衡 | 一般分析 |
| 字節跳動 | `seed-2-0-mini-260428` | 約 5 秒 | 約 5000 | 最便宜、最快的 Seed | 大批次打標、粗篩 |
| 字節跳動 | `seed-1-8-251228` | 約 6 秒 | 約 5000 | 上一代穩定版 | 存量業務 |
| 阿里 | `qwen3.8-flash` | 8–12 秒 | 約 5300 | 價格極低 | 大批次、成本敏感 |
| 阿里 | `qwen3.8-max` | 14–16 秒 | 約 5300 | 旗艦推理 | 複雜影片問答 |
| 阿里 | `qwen3-vl-plus` | 約 4 秒 | 約 5200 | 專職視覺模型，快 | 識別、OCR 類任務 |
| 阿里 | `qwen3.5-omni-plus` | 約 4 秒 | 約 5200 | 全模態 | 音影片綜合理解 |
| 月之暗面 | `kimi-k3` | 14–30 秒 | 約 14000 | 準確，但影片 token 是其他家的約 3 倍 | 對成本不敏感的深度分析 |
| MiniMax | `MiniMax-M3` | 約 5 秒 | 約 3700 | ⚠️ 能認出內容順序，但**時間點不準**（3/3 次被壓縮到前 2 秒內） | 只要內容、不要時間戳的場景 |

上一代 `gemini-3.7-flash`、`gemini-3.5-flash` 與經典穩定版 `gemini-2.5-pro`（2M 上下文）、`gemini-2.5-flash` 仍可用；3.8 Flash 與 3.5 Flash 實測影片 tokens 相同（10 秒約 713），但輸入單價只有一半。耗時與 tokens 只針對上述 10 秒、540p 的測試影片，影片越長、解析度越高越多，可據此按比例估算；實際耗時還受端點和上游排隊影響，同一段影片可能相差 2–3 倍。

<Note>模型價格與官網對齊，且可能隨官網調整；上表僅供參考，具體以頂部導航「模型價格」欄目為準：[模型價格](/zh-Hant/models/index)。</Note>

### 不支援影片的模型

| 模型 | 傳入影片時的表現 |
| - | - |
| OpenAI `gpt-6-sol` / `gpt-6-luna` / `gpt-5.6-terra` 等 | chat 端點**返回 200 但影片被丟棄**（`prompt_tokens` 只有幾十）；Responses 端點明確報不支援 `input_video` |
| xAI `grok-4.7` / `grok-4.5` 等 | 報錯 `unsupported message content type` |
| Anthropic Claude 全系 | 不支援影片輸入 |
| 智譜 `glm-5.3` | 返回 200 但影片被丟棄，模型回答「沒有收到影片」 |
| `deepseek-v4-flash-vision-exp` | 報錯 `unknown variant video_url`（只支援圖片） |

<Warning>
  **GPT 在影片被丟棄後可能編造答案**：實測 `gpt-6-sol` 3 次中 3 次編出了影片里根本不存在的數字序列，還把一段倫敦街景描述成「泳池和充氣浮具」。如果一定要用這些模型，請改用下方「抽幀當多圖」的寫法。
</Warning>

## 影片輸入方式

| 輸入方式 | Gemini | Seed / Qwen / Kimi / MiniMax |
| - | :-: | :-: |
| **`video_url` + Base64**（`data:video/mp4;base64,...`） | ✅ | ✅ |
| **`video_url` + 公網 https 直鏈** | ❌ 谷歌不接收直鏈 | ✅ 上游需能訪問該地址 |
| **`image_url` + `data:video/mp4`**（舊寫法） | ✅ | ❌ 報 400 |
| **YouTube 連結** | ✅ 僅 Gemini 原生格式 | ❌ |
| **Files API**（`files.upload`） | ❌ 僅谷歌官方支援 | ❌ |

<Warning>
  **Gemini 的 20MB 限制**：Base64 方式下，整個請求體（含編碼後的影片）必須在 20MB 以內。超過 20MB 的影片只能：① 用 YouTube 連結；② 先本地壓縮 / 擷取片段到 20MB 內再 base64；③ 換用 Seed / Qwen，把影片放到公網地址後直接傳連結。
</Warning>

<Tip>
  **公網直鏈要上游拉得到**：影片由模型服務方去下載，地址必須對它可達。實測火山引擎物件儲存上的地址 Seed / Qwen / Kimi / MiniMax 都能拉取，而谷歌雲端儲存上的地址 Seed 報 403。拿不準時先用 Base64 跑通，再換直鏈。
</Tip>

## 快速開始：通用寫法（`video_url`）

適用於 Seed、Qwen、Kimi、MiniMax，以及 Gemini。

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="YOUR_API_KEY",            # 替換為您的 API易 金鑰
    base_url="https://api.apiyi.com/v1"
)

with open("demo.mp4", "rb") as f:
    video_b64 = base64.b64encode(f.read()).decode()

response = client.chat.completions.create(
    model="seed-2-0-pro-260328",       # 也可換成 qwen3.8-flash / kimi-k3 / gemini-3.8-flash 等
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "請詳細描述這個影片的內容，並標出關鍵畫面的時間點"},
            {
                "type": "video_url",
                "video_url": {"url": f"data:video/mp4;base64,{video_b64}"},
                # 也可以直接傳公網地址（Gemini 除外）：{"url": "https://your-bucket.example.com/demo.mp4"}
            },
        ],
    }],
)

print(response.choices[0].message.content)
```

curl 等價寫法（把 `<BASE64_VIDEO>` 替換為影片的 base64 字串，或把整個 `url` 換成公網地址）：

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "seed-2-0-pro-260328",
    "messages": [{
      "role": "user",
      "content": [
        {"type": "text", "text": "請總結這個影片"},
        {"type": "video_url",
         "video_url": {"url": "data:video/mp4;base64,<BASE64_VIDEO>"}}
      ]
    }]
  }'
```

<Tip>
  **Seed 可以調取樣幀率**：在 `video_url` 里加 `"fps": 2`，動作快的影片能看得更細（實測 10 秒影片輸入從約 4900 增加到約 6200 tokens）。Qwen、Kimi 會忽略這個欄位。
</Tip>

## Gemini 專用寫法

### Base64 內聯（`image_url` 舊寫法）

Gemini 同時相容上面的 `video_url` 寫法和下面這種 `image_url` 寫法，存量程式碼不用改；**新程式碼建議統一用 `video_url`，方便切換模型**。

```python theme={null}
response = client.chat.completions.create(
    model="gemini-3.8-flash",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "請詳細描述這個影片的內容"},
            {
                "type": "image_url",
                "image_url": {"url": f"data:video/mp4;base64,{video_b64}"},
                "mime_type": "video/mp4",
            },
        ],
    }],
)
```

### Base64 內聯（Gemini 原生格式）

已經在用谷歌官方 `google-genai` SDK 的專案，不必改成 OpenAI 相容寫法：把 `base_url` 換成 `https://api.apiyi.com`，影片用 `Part.from_bytes` 內聯即可。與上面一樣，整個請求體須在 20MB 以內。

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_API_KEY",            # 替換為您的 API易 金鑰
    http_options={"base_url": "https://api.apiyi.com"}
)

with open("demo.mp4", "rb") as f:
    video_bytes = f.read()

response = client.models.generate_content(
    model="gemini-3.8-flash",
    contents=types.Content(parts=[
        types.Part.from_bytes(data=video_bytes, mime_type="video/mp4"),
        types.Part(text="請詳細描述這個影片的內容，並標出關鍵畫面的時間點"),
    ]),
)

print(response.text)
print(response.usage_metadata.prompt_tokens_details)  # 含 VIDEO 一項，說明影片確實進了模型
```

REST 等價寫法：Base64 字串很長，不要直接拼進命令列引數，先寫進 JSON 檔案再用 `-d @req.json` 傳送。

```bash theme={null}
# 生成請求體（macOS / Linux）
printf '{"contents":[{"parts":[{"inline_data":{"mime_type":"video/mp4","data":"%s"}},{"text":"請總結這個影片"}]}]}' \
  "$(base64 < demo.mp4 | tr -d '\n')" > req.json

curl "https://api.apiyi.com/v1beta/models/gemini-3.8-flash:generateContent" \
  -H "x-goog-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d @req.json
```

<Tip>
  **原生格式更容易確認影片有沒有進模型**：響應的 `usageMetadata.promptTokensDetails` 會把輸入按模態拆開，實測 10 秒測試影片是 `VIDEO` 660 + `TEXT` 若干，與 OpenAI 相容寫法的總量一致。沒有 `VIDEO` 這一項，就說明影片沒被收到。
</Tip>

### YouTube 連結（Gemini 原生格式）

YouTube 連結無需下載、不受 20MB 限制，但**只能通過 Gemini 原生格式**傳入（`google-genai` SDK，端點 `https://api.apiyi.com`）。

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options={"base_url": "https://api.apiyi.com"}
)

response = client.models.generate_content(
    model="gemini-3.8-flash",
    contents=types.Content(parts=[
        types.Part(file_data=types.FileData(
            file_uri="https://www.youtube.com/watch?v=VIDEO_ID"
        )),
        types.Part(text="請總結這個影片的主要內容和關鍵資訊"),
    ]),
)

print(response.text)
```

<Info>
  原生格式的更多用法（流式、推理預算、Function Calling 等）見 [Gemini 原生格式呼叫](/zh-Hant/api-capabilities/gemini/native)。
</Info>

## 不支援影片的模型：抽幀當多圖

GPT、Grok 這類只收圖片的模型，可以先在本地按固定間隔抽幀，再把幀當多張圖片傳入。實測 `gpt-6-sol`、`gpt-6-luna`、`gpt-5.6-terra`、`grok-4.7`、`grok-4.5` 用 4 幀都能正確說出內容和順序。代價是**丟失音訊和幀之間的動作**，時間點要靠你在提示詞裡說明。

```python theme={null}
import base64, subprocess, glob

# 每 2 秒抽 1 幀（需要本機安裝 ffmpeg）
subprocess.run(["ffmpeg", "-i", "demo.mp4", "-vf", "fps=0.5", "frame-%02d.jpg"], check=True)

frames = []
for path in sorted(glob.glob("frame-*.jpg")):
    b64 = base64.b64encode(open(path, "rb").read()).decode()
    frames.append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}})

response = client.chat.completions.create(
    model="gpt-6-sol",
    messages=[{
        "role": "user",
        "content": [{"type": "text", "text": "下面是同一段影片每 2 秒抽出的一幀，按時間順序排列。請描述影片內容。"}] + frames,
    }],
)
```

## 進階技巧

### 時間戳定位

在提示詞裡用 `MM:SS` 直接定位片段——這是純提示詞技巧，任意支援影片的模型都可用：

```text theme={null}
請描述 00:30 到 01:15 之間發生了什麼，並指出 02:40 出現的文字內容。
```

需要精確時間點時優先選 Seed 或 Qwen；MiniMax-M3 實測時間點不可靠。

### 兩種「答案不可信」的情況

**① 影片根本沒進模型**：看響應裡的 `usage.prompt_tokens`。10 秒影片在 Seed / Qwen 上約 5000、Gemini 約 700；**如果只有幾十個 token，說明影片被丟掉了**（GPT、GLM，以及 Gemini 收到公網直鏈時都是這種情況），此時的答案不可信。注意模型不一定會說「看不到」：Gemini 收到直鏈時會把丟失的影片描述成「完全純黑的黑屏」，GPT 則會編出一段不存在的內容。

**② 素材不對，而提示詞又預設了內容**：比如傳錯了檔案、影片解碼成黑屏 / 灰屏，或者聯調時隨手用了佔位圖。這種情況下 `prompt_tokens` 完全正常，靠 token 數查不出來。

<Warning>
  **Gemini 系列在情況 ② 下容易順著問題編答案**。實測把影片換成一張空白圖：

  * 用中性問法「描述一下你收到的畫面」，Gemini 3.8 Flash / 3.5 Flash / 3.1 Pro / 3.1 Flash Lite 12 次全部如實說是空白圖——**看圖能力本身沒問題**；
  * 但問題一旦預設了內容（「影片裡依次出現了哪些數字」，甚至「有沒有出現數字？沒有就說沒有」），3.5 Flash / 3.1 Pro / 3.1 Flash Lite 合計 18 次中有 12 次編出了並不存在的數字；
  * 新一代 `gemini-3.8-flash` 明顯改善但沒有根治：同樣的預設問題 7 次中仍有 2 次編造；
  * 同樣的問題，Seed、Qwen、Kimi 都如實回答「看不到 / 沒有」。

  正常影片的識別不受影響。素材來源不可控的批次場景，建議**先用中性問題讓模型描述畫面，確認素材無誤後再問具體問題**，或選用 Seed / Qwen。
</Warning>

### 常見任務的提問思路

同一段影片，換提示詞就能完成不同分析，無需改程式碼：

* **內容摘要**：用 3-5 句話概括影片主題、關鍵畫面與結論
* **教學分析**：提取知識點、章節劃分與重點時間戳
* **監控分析**：識別異常行為、出現的人/物及發生時間
* **營銷評估**：分析產品賣點呈現、節奏與目標受眾契合度
* **動作分析**：拆解動作步驟、姿態要點與可改進之處

## 技術說明

* **Gemini**：預設按 **1 幀/秒** 取樣並理解音訊軌；Gemini 3.x 預設按低解析度計幀，實測約 **70 tokens/秒**。
* **Seed / Qwen**：實測約 **500 tokens/秒**（540p 影片）；Seed 可用 `fps` 調整取樣。
* **Kimi K3**：實測約 **1400 tokens/秒**，長影片成本明顯更高。
* **支援格式**：mp4、mov、webm 等常見格式；建議統一轉成 H.264 編碼的 mp4，相容性最好。

## 常見問題

<AccordionGroup>
  <Accordion title="GPT / Grok / Claude 能看影片嗎？">
    不能。Claude 和 Grok 會直接報錯；GPT 的 chat 端點會**靜默丟掉影片**、照樣返回 200，模型可能編出答案。需要用這些模型時，請先抽幀再當多張圖片傳入，見「不支援影片的模型：抽幀當多圖」。
  </Accordion>

  <Accordion title="國產模型裡哪些能做影片理解？">
    實測可用：Seed 全系（`seed-2-0-pro-260328`、`dola-seed-2-1-turbo-260628`、`seed-2-0-lite-260428`、`seed-2-0-mini-260428`、`seed-1-8-251228`）、Qwen 的 `qwen3.8-max`、`qwen3.8-flash`、`qwen3-vl-plus`、`qwen3.5-omni-plus`，以及 `kimi-k3`。`MiniMax-M3` 能認出內容但時間點不準。`glm-5.3` 與 `deepseek-v4-flash-vision-exp` 不支援影片。
  </Accordion>

  <Accordion title="同一段程式碼，換個模型就報 400？">
    多半是用了 `image_url` + `data:video/mp4` 的舊寫法——它只有 Gemini 認。改成 `{"type": "video_url", "video_url": {"url": ...}}` 即可在各家通用。
  </Accordion>

  <Accordion title="Gemini 回答了影片里根本沒有的內容？">
    先確認素材本身沒問題（不是黑屏、空白或傳錯檔案）。實測 Gemini 在素材有問題、而提問又預設了內容時，容易順著問題編出答案。排查時先換成中性問法「描述一下你收到的畫面」，看它描述的是不是你的影片；詳見「兩種「答案不可信」的情況」。
  </Accordion>

  <Accordion title="傳公開影片連結報錯 Request contains an invalid argument / 拉取失敗">
    Gemini **不接收任意公開直鏈**（如 `https://example.com/video.mp4`），這不是 API易 攔截。Gemini 請改用 Base64 內聯（20MB 以內）或 YouTube 連結；也可以換用 Seed / Qwen，它們可以直接拉取公網地址。走 `/v1/chat/completions` 時不一定報錯：可能返回 200、模型自稱看到「黑屏」，此時 `prompt_tokens` 只有幾十，結果不可用。
  </Accordion>

  <Accordion title="為什麼 Gemini 限制 20MB？之前明明能用">
    Base64 內聯方式下，Gemini 的整個請求體一直限制在 20MB 以內（與谷歌官方一致）。如果你「之前能用」的是公開直鏈，那其實從來不是受支援的方式，只是恰好某些情況下沒報錯；現在按規範會明確拒絕。
  </Accordion>

  <Accordion title="能用 files.upload 上傳大影片嗎？">
    不能。Gemini 官方的 Files API（`client.files.upload()`）**第三方不支援**，僅谷歌官方端點可用。大影片請走 YouTube 連結、壓縮到 20MB 內用 Base64，或換用 Seed / Qwen 傳公網地址。
  </Accordion>

  <Accordion title="超過 20MB 的影片怎麼辦？">
    三條路：① 上傳到 YouTube 後用連結傳入（Gemini 原生格式）；② 用 ffmpeg 等工具本地壓縮或擷取關鍵片段到 20MB 內再 base64；③ 把影片放到公網可訪問的物件儲存，用 Seed / Qwen 直接傳連結。
  </Accordion>
</AccordionGroup>

## 相關資源

<CardGroup cols={2}>
  <Card title="模型價格" icon="list" href="/zh-Hant/models/index">
    檢視全部模型與最新定價
  </Card>

  <Card title="Gemini 原生格式" icon="sparkles" href="/zh-Hant/api-capabilities/gemini/native">
    YouTube 連結、流式、推理預算等原生用法
  </Card>

  <Card title="影像理解 API" icon="image" href="/zh-Hant/api-capabilities/vision-understanding">
    圖片內容識別與多模態分析
  </Card>

  <Card title="Qwen3.8-Max" icon="brain" href="/zh-Hant/api-capabilities/qwen-3-8/overview">
    通義千問旗艦，原生圖片與影片輸入
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.