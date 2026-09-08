> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 影片理解 API

> 使用 Gemini 3.5 Flash、Gemini 3.1 Pro Preview 等先進模型進行智慧影片分析，支援內容識別、場景描述、動作分析與時間戳定位

API易 通過 Gemini 系列多模態模型提供影片理解能力：用一段提示詞，讓模型"看懂"影片裡的場景、動作、字幕與音訊，並按時間戳定位關鍵畫面。本頁說明支援的模型、可用的影片輸入方式，以及最容易踩坑的限制。

<Note>
  **先看這一條**：影片只能通過 **Base64 內聯（整個請求 ≤ 20MB）** 或 **YouTube 連結**（Gemini 原生格式）傳入。直接傳公開影片直鏈（如 `https://example.com/demo.mp4`）會報 `Request contains an invalid argument` —— 這是谷歌不接收直鏈，並非 API易 攔截。詳見下方「影片輸入方式」。
</Note>

<CardGroup cols={2}>
  <Card title="視覺化介面測試" icon="flask-conical" href="https://icover.ai/zh/video-understanding">
    在 iCover 視覺化測試工具裡直接上傳影片、除錯理解介面。
  </Card>
</CardGroup>

## 支援的模型

| 模型                         | 模型 ID                    | 特點               | 推薦場景       |
| -------------------------- | ------------------------ | ---------------- | ---------- |
| **Gemini 3.5 Flash** 🔥    | `gemini-3.5-flash`       | 速度快、價效比之王，多模態能力強 | 日常影片分析首選   |
| **Gemini 3.1 Pro Preview** | `gemini-3.1-pro-preview` | 谷歌最強推理 + 多模態理解   | 複雜、長影片深度分析 |
| **Gemini 3.1 Flash Lite**  | `gemini-3.1-flash-lite`  | 超低價、超低延遲         | 大批次、高併發場景  |

經典穩定版 `gemini-2.5-pro`（2M 上下文）與 `gemini-2.5-flash` 仍可用。完整價格見 [模型列表與價格](/zh-Hant/api-capabilities/model-info)。

## 影片輸入方式

這是最容易踩坑的地方，請先對照下表確認你的輸入方式是否被支援：

| 輸入方式                          | 是否支援 | 說明                                                              |
| ----------------------------- | :--: | --------------------------------------------------------------- |
| **Base64 內聯**                 |   ✅  | 本地影片讀取後 base64 編碼傳入，**整個請求體需 ≤ 20MB**。OpenAI 相容格式與原生格式都支援       |
| **YouTube 連結**                |   ✅  | 僅 **Gemini 原生格式**，通過 `file_uri` 傳入 YouTube URL                  |
| **公開影片直鏈**（如 `.mp4` 網址）       |   ❌  | **谷歌不接收**，會返回 `Request contains an invalid argument`，並非 API易 攔截 |
| **Files API**（`files.upload`） |   ❌  | 第三方不支援，僅谷歌官方支援                                                  |

<Warning>
  **20MB 限制**：Base64 方式下，整個請求體（含編碼後的影片）必須在 20MB 以內。**超過 20MB 的影片**目前只能：① 用 YouTube 連結；② 先本地壓縮 / 擷取片段到 20MB 內再 base64。
</Warning>

## 快速開始：Base64 內聯（OpenAI 相容格式）

最常用的方式：讀取本地影片 → base64 編碼 → 用 `image_url` 欄位傳入。

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="YOUR_API_KEY",            # 替換為您的 API易 金鑰
    base_url="https://api.apiyi.com/v1"
)

{/* 讀取本地影片並轉 base64（整個請求 ≤ 20MB）*/}
with open("demo.mp4", "rb") as f:
    video_b64 = base64.b64encode(f.read()).decode()

response = client.chat.completions.create(
    model="gemini-3.5-flash",
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

print(response.choices[0].message.content)
```

curl 等價寫法（把 `<BASE64_VIDEO>` 替換為影片的 base64 字串；體積較大時建議直接用 SDK 自動編碼）：

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-3.5-flash",
    "messages": [{
      "role": "user",
      "content": [
        {"type": "text", "text": "請總結這個影片"},
        {"type": "image_url",
         "image_url": {"url": "data:video/mp4;base64,<BASE64_VIDEO>"},
         "mime_type": "video/mp4"}
      ]
    }]
  }'
```

## YouTube 連結（Gemini 原生格式）

YouTube 連結無需下載、不受 20MB 限制，但**只能通過 Gemini 原生格式**傳入（`google-genai` SDK，端點 `https://api.apiyi.com`）。

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options={"base_url": "https://api.apiyi.com"}
)

response = client.models.generate_content(
    model="gemini-3.5-flash",
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

## 進階技巧

### 時間戳定位

模型預設按 1 幀/秒取樣並理解音訊，你可以在提示詞裡用 `MM:SS` 直接定位片段——這是純提示詞技巧，任意輸入方式都可用：

```text theme={null}
請描述 00:30 到 01:15 之間發生了什麼，並指出 02:40 出現的文字內容。
```

### 常見任務的提問思路

同一段影片，換提示詞就能完成不同分析，無需改程式碼：

* **內容摘要**：用 3-5 句話概括影片主題、關鍵畫面與結論
* **教學分析**：提取知識點、章節劃分與重點時間戳
* **監控分析**：識別異常行為、出現的人/物及發生時間
* **營銷評估**：分析產品賣點呈現、節奏與目標受眾契合度
* **動作分析**：拆解動作步驟、姿態要點與可改進之處

## 技術說明

* **取樣幀率**：預設按 **1 幀/秒（FPS）** 取樣，同時理解音訊軌。
* **Token 消耗**：預設解析度約 **300 tokens/秒**，低解析度約 **100 tokens/秒**——影片越長，token 越多，請據此估算成本。
* **支援格式**：mp4、mpeg、mov（quicktime）、avi、webm、wmv、3gpp 等常見格式。

## 常見問題

<AccordionGroup>
  <Accordion title="傳公開影片連結報錯 Request contains an invalid argument / 拉取失敗">
    谷歌的影片理解**不接收任意公開直鏈**（如 `https://example.com/video.mp4`），會返回 `Request contains an invalid argument`。這不是 API易 或 Nginx 攔截。請改用：① Base64 內聯（≤20MB）；② YouTube 連結（原生格式）。
  </Accordion>

  <Accordion title="為什麼限制 20MB？之前明明能用">
    Base64 內聯方式下，整個請求體一直限制在 20MB 以內（與谷歌官方一致）。如果你"之前能用"的是公開直鏈，那其實從來不是受支援的方式，只是恰好某些情況下沒報錯；現在按規範會明確拒絕。
  </Accordion>

  <Accordion title="能用 files.upload 上傳大影片嗎？">
    不能。Gemini 官方的 Files API（`client.files.upload()`）**第三方不支援**，僅谷歌官方端點可用。大影片請走 YouTube 連結，或壓縮到 20MB 內用 Base64。
  </Accordion>

  <Accordion title="超過 20MB 的影片怎麼辦？">
    兩條路：① 上傳到 YouTube 後用連結傳入（原生格式，不受 20MB 限制）；② 用 ffmpeg 等工具本地壓縮或擷取關鍵片段到 20MB 內再 base64。
  </Accordion>
</AccordionGroup>

## 相關資源

<CardGroup cols={2}>
  <Card title="模型列表與價格" icon="list" href="/zh-Hant/api-capabilities/model-info">
    檢視全部 Gemini 模型與最新定價
  </Card>

  <Card title="Gemini 原生格式" icon="sparkles" href="/zh-Hant/api-capabilities/gemini/native">
    YouTube 連結、流式、推理預算等原生用法
  </Card>

  <Card title="影像理解 API" icon="image" href="/zh-Hant/api-capabilities/vision-understanding">
    圖片內容識別與多模態分析
  </Card>

  <Card title="API 文件" icon="book" href="/zh-Hant/api-manual">
    完整 API 規範與端點說明
  </Card>
</CardGroup>
