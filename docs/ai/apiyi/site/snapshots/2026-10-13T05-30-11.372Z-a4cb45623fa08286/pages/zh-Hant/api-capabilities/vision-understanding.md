> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 影像理解（識圖）API

> 用 Gemini、GPT、Claude、Seed（豆包）、Qwen、Kimi 等模型識別圖片：OCR 文字提取、計數、場景描述、多圖對比。含 24 個模型的實測清單、每張圖 tokens、四種呼叫寫法（OpenAI 相容 / Responses / Anthropic / Gemini 原生）各自支援哪些模型，以及大圖、直鏈等常見報錯。

API易 上絕大多數主流對話模型都能「看圖」：OCR 提取文字、數物體、描述場景、對比多張圖。本頁給出 2026-10-11 (UTC+8) 的實測支援清單、一張圖要花多少 tokens、四種呼叫寫法各自能走哪些模型，以及最常見的報錯。

<Note>
  **先看這三條**：

  1. **通用寫法是 OpenAI 相容的 `image_url`**：`{"type": "image_url", "image_url": {"url": "data:image/png;base64,..."}}`，實測 22 個視覺模型全部可用。Responses、Anthropic 兩種寫法**只有部分模型能走**，見「四種寫法支援哪些模型」。
  2. **`deepseek-v4-pro`、`glm-5.3` 等純文本模型不吃圖**：請求照樣返回 200，但圖片被丟掉，模型只會回答「看不到」。判斷圖片有沒有進模型，看響應裡的 `usage.prompt_tokens`。
  3. **優先用 Base64**：公網直鏈要由上游去下載，圖床慢、有防盜鏈、或響應頭缺 `Content-Length`（Qwen 會直接 400）都會失敗。
</Note>

<CardGroup cols={2}>
  <Card title="識別圖片 · API易 線上工具" icon="scan-eye" href="https://imagen.apiyi.com/#understand">
    不想寫程式碼？網頁端直接上傳圖片（支援多圖聯合分析），內建萬物識別、商品標題、五點描述、屬性分析、OCR 提取等模板，可切換模型對比效果，填入 API易 令牌即可使用。
  </Card>

  <Card title="影片理解 API" icon="video" href="/zh-Hant/api-capabilities/video-understanding">
    需要分析影片？看影片理解的支援清單與寫法。
  </Card>
</CardGroup>

## 讓 AI Agent 幫你接入

<Note>
  在用 Codex / Claude Code / Cursor 開發的話，把下面這段提示詞複製給它。它會先抓本頁的純文本版（任意文件頁地址後加 `.md`），再按你專案的技術棧寫程式碼——通用 `image_url` 寫法、**大圖先縮放**、**用 `prompt_tokens` 確認圖片真的進了模型**這幾個高頻問題已經寫死在要求裡。
</Note>

<Prompt description="讓程式設計 Agent 接入或排查影像理解（識圖 / OCR）。複製後直接貼上給 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  幫我在當前專案裡接入 / 排查影像理解：把圖片交給多模態模型，做 OCR 文字提取、計數、場景描述或多圖對比。

  先讀文件再動手：抓 [https://docs.apiyi.com/api-capabilities/vision-understanding.md](https://docs.apiyi.com/api-capabilities/vision-understanding.md) 拿到本頁純文本版。

  接入要求：

  1. 端點與寫法：預設走 OpenAI 相容的 `POST https://api.apiyi.com/v1/chat/completions`，圖片用 `{"type": "image_url", "image_url": {"url": ...}}` 放進 `messages[].content`，和文本塊並列；多張圖就放多個 `image_url` 塊，順序就是圖 1、圖 2。這個寫法所有視覺模型都認。只有專案本來就在用 Responses / Anthropic SDK 時才換寫法，並且先對照本頁「四種寫法支援哪些模型」——**Responses 端點不能調 Gemini / Claude / Seed，Anthropic 端點不能調 Seed / DeepSeek，Grok 走 Anthropic 端點會靜默丟圖**。

  2. 選模型：預設用 `gemini-3.8-flash`（全項實測通過、價格低）；要求最穩的 OCR 與理解用 `claude-sonnet-5-5` 或 `gpt-6-sol`；大批次低成本用 `claude-haiku-5-5`、`qwen3.8-flash` 或 `gemini-3.5-flash-lite`。`deepseek-v4-pro`、`glm-5.3` 等純文本模型不吃圖，別選。`gpt-6-luna` OCR 會漏字、`gemini-3.1-flash-lite` 計數會數錯，對準確率敏感時別用。把模型名做成可配置項。

  3. 圖片怎麼傳：**優先 Base64 data URI**（`data:image/png;base64,...`），字首裡的格式要按檔案真實內容（檔案頭）判斷，不要信副檔名。公網直鏈也能用，但由上游去下載：圖床要能公開訪問、響應快，並且**響應頭要帶 `Content-Length`**（Qwen 系缺了會報 `Missing Content-Length of multimodal url`）。URL 和 Base64 是兩種互斥寫法，不要把連結拼進 `data:...;base64,` 後面。

  4. **大圖先縮放再傳**：把長邊縮到 2048px 左右、轉成 JPEG（品質 85\~90）。不縮的代價：GPT 按圖塊計費，一張 9000×6000 的圖實測記了 63658 個輸入 tokens；Claude 單圖 base64 超 10MB 直接拒（狀態碼是 429，別當成限流去重試）；Seed 總畫素上限 3600 萬；Kimi 單圖超 16384 tokens 報 400。

  5. **確認圖片真的進了模型**：每次都讀響應裡的 `usage.prompt_tokens`。一張 1200×760 的圖在各家約 900\~1300 tokens；**如果只有幾十個 token，說明圖被丟了**，這時要報錯，不要把模型的回答當結果用——沒收到圖的模型偶爾會編出一段像樣的內容。

  6. 引數：chat 端點上 `max_tokens`、`temperature` 在 GPT / Claude / Gemini 上都正常可用。`detail: "low"` 只有 `gpt-5.4-mini` 和 Seed 認（tokens 降到約一半以下，但小字識別會變差），其他模型忽略。要結構化結果就在提示詞裡要求輸出 JSON，並在程式碼裡做解析容錯。

  7. 超時與成本：單張圖實測 2 到 12 秒，大圖更慢（10MB 圖 30 到 70 秒），客戶端超時給 120 秒以上。按 token 計費，一張圖的輸入成本從約 \$0.0001（Claude Haiku 5.5 / Qwen3.8 Flash）到約 \$0.005（Claude Opus 5.5）不等。

  8. Key 從環境變數 `APIYI_API_KEY` 讀，不要硬編碼進程式碼、也不要提交進 git。

  9. 改完真跑一次：用一張含文字的圖片調一次，把模型回答、`usage.prompt_tokens` 和這次呼叫的花費貼給我。
</Prompt>

<Accordion title="這段提示詞替你擋掉了什麼">
  | 要求 | 擋掉的坑 |
  | - | - |
  | 預設 chat `image_url` | Responses / Anthropic 端點只有部分模型能走，換模型就 400 或靜默丟圖 |
  | 優先 Base64、按檔案頭判斷格式 | 直鏈依賴上游下載，Qwen 還要求圖床帶 `Content-Length` |
  | 大圖先縮放 | GPT 一張大圖記 6 萬多 tokens；Claude、Seed、Kimi 直接拒收 |
  | Claude 超限是 429 | 別當成限流反覆重試，縮圖才是解法 |
  | 讀 `usage.prompt_tokens` | 純文本模型靜默丟圖照樣返回 200，token 數是唯一能程式化發現的訊號 |
  | 不選純文本模型 | `deepseek-v4-pro`、`glm-5.3` 收到圖只會說「看不到」 |
</Accordion>

## 支援的模型

以下結論來自 2026-10-11 (UTC+8) 的實測：同一張 1200×760 的中英混排訂單圖（含表格）要求逐字 OCR，另測數圖形個數、兩圖找不同、公網直鏈，並用一張空白圖做對照，排除「沒看也能答」。

| 廠商 | 模型 ID | 實測耗時 | 一張圖輸入 tokens | 實測表現 | 推薦場景 |
| - | - | :-: | :-: | - | - |
| Google | `gemini-3.8-flash` 🔥 | 5–8 秒 | 約 1090 | 全項通過，價格低；支援 Gemini 原生格式 | 預設首選、日常識圖 |
| Google | `gemini-3.1-pro-preview` | 9–12 秒 | 約 1090 | 全項通過 | 複雜圖表、需要推理的識圖 |
| Google | `gemini-3.5-flash-lite` | 2–5 秒 | 約 1090 | 全項通過，最快之一 | 大批次、低延遲 |
| OpenAI | `gpt-6-sol` 🔥 | 5–6 秒 | 約 1100 | 全項通過 | 通用識圖、Responses 專案 |
| OpenAI | `gpt-5.6-terra` | 5 秒 | 約 1100 | 全項通過 | 通用識圖 |
| OpenAI | `gpt-6-luna` | 約 4 秒 | 約 1100 | ⚠️ 便宜但 OCR 會漏字（5 次都把編號、電話讀錯） | 粗略描述，不做 OCR |
| Anthropic | `claude-sonnet-5-5` 🔥 | 3–4 秒 | 約 1210 | 全項通過 | 高要求 OCR 與理解 |
| Anthropic | `claude-opus-5-5` | 5–9 秒 | 約 1210 | 全項通過 | 專業圖文分析 |
| Anthropic | `claude-haiku-5-5` | 3–8 秒 | 約 1210 | 全項通過，單價極低 | 大批次識圖、打標 |
| xAI | `grok-4.7` | 4–6 秒 | 約 950 | 全項通過 | 通用識圖 |
| 字節跳動 | `seed-2-0-pro-260328` | 9–11 秒 | 約 1260 | 全項通過；認 `detail: low`（約 600 tokens） | 國產首選 |
| 字節跳動 | `seed-2-0-mini-260428` | 5–10 秒 | 約 1260 | 全項通過 | 低成本批次 |
| 字節跳動 | `dola-seed-2-1-turbo-260628` | 約 10 秒 | 約 1260 | 全項通過；預設開啟思考 | 需要推理的識圖 |
| 阿里 | `qwen3.8-max` | 7–9 秒 | 約 880 | 全項通過（直鏈需 `Content-Length`） | 複雜識圖 |
| 阿里 | `qwen3.8-flash` | 4–11 秒 | 約 910 | 全項通過（同上），單價極低 | 大批次、成本敏感 |
| 阿里 | `qwen3-vl-plus` | 6–9 秒 | 約 910 | 全項通過（同上） | 視覺專用 |
| 月之暗面 | `kimi-k3` | 6–8 秒 | 約 1220 | 全項通過 | 深度分析 |
| MiniMax | `MiniMax-M3` | 4–7 秒 | 約 1200 | 全項通過；思考過程 `<think>` 混在正文裡，需自行剝離 | 通用識圖 |
| DeepSeek | `deepseek-v4-flash-vision-exp` | 3–5 秒 | 約 570 | 全項通過，圖片 tokens 最省 | 低成本識圖 |

`gemini-3.1-flash-lite` 與 `gpt-5.4-mini` 也能識圖、OCR 全對，但**數圖形個數會數錯**（實測分別 0/3、1/3 次數對），計數類任務不建議用。`qwen-vl-ocr` 是 OCR 專用模型，**只輸出表格、表格外的文字不輸出**，多圖也只認第一張，只適合純表格 / 證件類場景。

<Note>模型價格與官網對齊，且可能隨官網調整；上表僅供參考，具體以頂部導航「模型價格」欄目為準：[模型價格](/zh-Hant/models/index)。</Note>

### 不支援圖片的模型

| 模型 | 傳入圖片時的表現 |
| - | - |
| `deepseek-v4-pro` | 返回 200，但圖片被丟掉（`prompt_tokens` 只多 5 個），模型回答「看不到」 |
| 智譜 `glm-5.3` | chat 端點返回 200 但丟圖；Responses 端點明確報 `only supports text modality` |

判斷其他模型吃不吃圖，以模型詳情頁的「輸入模態」為準，詳見 [文本+出圖能不能一個介面](/zh-Hant/faq/text-and-image-in-one-api)。

## 四種寫法支援哪些模型

| 寫法 | 實測可用 | 不可用 |
| - | - | - |
| **OpenAI 相容 chat**（`/v1/chat/completions` + `image_url`） | 上表全部模型 | — |
| **OpenAI Responses**（`/v1/responses` + `input_image`） | GPT、Grok、Qwen3.8、Kimi、MiniMax、DeepSeek Vision | Gemini、Claude、Seed、Qwen3-VL 報 400 |
| **Anthropic Messages**（`/v1/messages` + `image`，base64） | Claude、Gemini、GPT、Qwen、Kimi、MiniMax | Seed 報 401、DeepSeek 報 400；**Grok 靜默丟圖** |
| **Anthropic Messages**（`image`，url source） | 僅 Claude | **Gemini 靜默丟圖**；GPT、Qwen 報 400 |
| **Gemini 原生**（`generateContent` + `inline_data`） | Gemini（實測 3.8 Flash、3.1 Pro） | — |

<Tip>
  **新專案一律用 OpenAI 相容 chat 寫法**，換模型只改模型名。Responses 適合已經在用 OpenAI Responses SDK 的專案；Anthropic 寫法適合 Claude 生態（如 Claude Code、Anthropic SDK）；Gemini 原生適合已經在用 `google-genai` SDK 的專案。
</Tip>

## 快速開始：通用寫法（`image_url`）

### 本地圖片（Base64，推薦）

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="YOUR_API_KEY",            # 替換為您的 API易 金鑰
    base_url="https://api.apiyi.com/v1"
)

with open("demo.png", "rb") as f:
    image_b64 = base64.b64encode(f.read()).decode()

response = client.chat.completions.create(
    model="gemini-3.8-flash",          # 也可換成 claude-sonnet-5-5 / gpt-6-sol / qwen3.8-flash 等
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "請把圖片裡的所有文字逐字提取出來，表格用 Markdown 表格輸出"},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_b64}"}},
        ],
    }],
)

print(response.choices[0].message.content)
print(response.usage.prompt_tokens)    # 一張 1200×760 的圖約 900~1300；只有幾十說明圖沒進模型
```

### 公網圖片 URL

```python theme={null}
response = client.chat.completions.create(
    model="gemini-3.8-flash",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "請詳細描述這張圖片的內容"},
            {"type": "image_url", "image_url": {"url": "https://your-bucket.example.com/demo.png"}},
        ],
    }],
)
```

### 多圖對比

多張圖按順序放多個 `image_url` 塊，在提示詞裡用「圖 1」「圖 2」指代：

```python theme={null}
response = client.chat.completions.create(
    model="claude-sonnet-5-5",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "下面依次是圖 1 和圖 2，請說出兩張圖有什麼不同"},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image1_b64}"}},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image2_b64}"}},
        ],
    }],
)
```

### curl

```bash theme={null}
# 1. 生成請求體：Base64 字串很長，先寫進檔案，不要直接拼進命令列引數（macOS / Linux）
printf '{"model":"gemini-3.8-flash","messages":[{"role":"user","content":[{"type":"text","text":"請描述這張圖片"},{"type":"image_url","image_url":{"url":"data:image/png;base64,%s"}}]}]}' \
  "$(base64 < demo.png | tr -d '\n')" > req.json

# 2. 傳送
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -d @req.json
```

<Tip>
  **為什麼推薦 Base64**：圖片 URL 方式需要上游即時下載該圖片，圖床響應慢、有防盜鏈或訪問限制都會失敗；Qwen 系還要求圖床響應頭帶 `Content-Length`（部分 CDN 用分塊傳輸不帶這個頭，實測會報 `Missing Content-Length of multimodal url`）。Base64 把圖片直接放進請求體，不依賴任何外部下載。Base64 體積約為原圖的 1.33 倍，大圖先縮放再編碼，見「大圖先縮放」。
</Tip>

## 其他寫法

### OpenAI Responses（`input_image`）

適合已經在用 OpenAI Responses SDK 的專案。**只能調 GPT、Grok、Qwen3.8、Kimi、MiniMax、DeepSeek Vision**，Gemini / Claude / Seed 會報 400。

```python theme={null}
response = client.responses.create(
    model="gpt-6-sol",
    input=[{
        "role": "user",
        "content": [
            {"type": "input_text", "text": "請把圖片裡的所有文字逐字提取出來"},
            {"type": "input_image", "image_url": f"data:image/png;base64,{image_b64}"},
        ],
    }],
)

print(response.output_text)
```

### Anthropic Messages（`image`）

適合 Claude 生態（Anthropic SDK、Claude Code 等），端點 `https://api.apiyi.com`。base64 方式可調 Claude、Gemini、GPT、Qwen、Kimi、MiniMax；**url source 只有 Claude 能用**（Gemini 會靜默丟圖）。

```python theme={null}
import anthropic, base64

client = anthropic.Anthropic(
    api_key="YOUR_API_KEY",            # 替換為您的 API易 金鑰
    base_url="https://api.apiyi.com"
)

with open("demo.png", "rb") as f:
    image_b64 = base64.b64encode(f.read()).decode()

message = client.messages.create(
    model="claude-sonnet-5-5",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": image_b64}},
            {"type": "text", "text": "請把圖片裡的所有文字逐字提取出來"},
        ],
    }],
)

print(message.content[0].text)
# Claude 也可以直接傳公網地址：{"type": "image", "source": {"type": "url", "url": "https://..."}}
```

### Gemini 原生格式（`inline_data`）

已經在用谷歌官方 `google-genai` SDK 的專案，把 `base_url` 換成 `https://api.apiyi.com` 即可：

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_API_KEY",            # 替換為您的 API易 金鑰
    http_options={"base_url": "https://api.apiyi.com"}
)

with open("demo.png", "rb") as f:
    image_bytes = f.read()

response = client.models.generate_content(
    model="gemini-3.8-flash",
    contents=types.Content(parts=[
        types.Part.from_bytes(data=image_bytes, mime_type="image/png"),
        types.Part(text="請把圖片裡的所有文字逐字提取出來"),
    ]),
)

print(response.text)
print(response.usage_metadata.prompt_tokens_details)  # 含 IMAGE 一項，說明圖片確實進了模型
```

REST 寫法：`POST https://api.apiyi.com/v1beta/models/gemini-3.8-flash:generateContent`，請求頭 `x-goog-api-key: YOUR_API_KEY`，圖片放在 `contents[].parts[]` 的 `{"inline_data": {"mime_type": "image/png", "data": "<BASE64>"}}` 裡。更多原生用法見 [Gemini 原生格式呼叫](/zh-Hant/api-capabilities/gemini/native)。

## 大圖先縮放

各家對大圖的處理差別很大。實測一張 9000×6000、約 10MB 的 JPEG：

| 模型 | 結果 |
| - | - |
| `gemini-3.8-flash` | 正常識別，自動縮小，約 1100 tokens |
| `grok-4.7` / `qwen3.8-flash` / `MiniMax-M3` | 正常識別，約 2600~~3700 tokens，耗時 24~~67 秒 |
| `gpt-6-sol` | 正常識別，但**一張圖記了 63658 個輸入 tokens**（約 \$0.13） |
| `claude-sonnet-5-5` | 拒絕：`image exceeds 10 MB maximum`（**狀態碼 429**，不是限流） |
| `kimi-k3` | 拒絕：單張圖超過 16384 tokens |
| `seed-2-0-pro-260328` | 拒絕：總畫素超過 3600 萬 |

<Warning>
  **上傳前把長邊縮到 2048px 左右**：實測把上面那張圖縮到 2048×1365 後，表中 8 個模型全部通過、OCR 全對，一張圖約 700\~3700 tokens，`gpt-6-sol` 從 63658 降到 3320。Claude 返回 429 時先看報錯正文，如果是 `image exceeds` 就是圖太大，重試不會成功。
</Warning>

```python theme={null}
import base64, io
from PIL import Image

def image_to_data_uri(path, max_side=2048):
    """縮放到長邊 max_side，並統一轉成 JPEG，宣告與內容一定一致"""
    img = Image.open(path)
    img.thumbnail((max_side, max_side))
    buf = io.BytesIO()
    img.convert("RGB").save(buf, format="JPEG", quality=90)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()
```

## 常見錯誤

### 圖片 URL 下載超時

使用圖片 URL 方式時，如果收到如下錯誤：

```json theme={null}
{
  "error": {
    "message": "Timeout while downloading ip:port",
    "type": "invalid_request_error",
    "code": "invalid_image_url"
  }
}
```

這表示**上游在拉取該圖片 URL 時下載超時**，與模型、金鑰、額度均無關。常見原因：圖床響應慢或對部分地區不友好、圖片過大、URL 設有防盜鏈或需要登入。

**解決方法**：改用 Base64（推薦，徹底繞開下載環節）；或更換為響應更快、可公開訪問的直鏈；或壓縮圖片後重試。

### Missing Content-Length of multimodal url（Qwen）

Qwen 系模型要求圖床的響應頭帶 `Content-Length`。部分 CDN（如 Cloudflare）以分塊方式返回圖片、不帶這個頭，就會報這個錯；同一張圖換成物件儲存直鏈或 Base64 即可。

### invalid base64 data（URL 誤放進 Base64 欄位）

如果收到如下 400 錯誤（關鍵特徵是 `invalid base64 data`，不同模型文案略有差異）：

```json theme={null}
{
  "type": "error",
  "error": {
    "type": "invalid_request_error",
    "message": "...source.base64: invalid base64 data"
  }
}
```

通常是**把圖片 URL 拼進了 data URI 的 Base64 資料位**：

```json theme={null}
// ❌ 錯誤寫法：base64, 後面跟的是圖片連結，不是 Base64 編碼
"image_url": {
  "url": "data:image/jpeg;base64,https://example.com/generations/temp-xxx.jpg"
}
```

`data:image/...;base64,` 字首後面必須是**圖片檔案本身的 Base64 編碼字串**。URL 方式和 Base64 方式是兩種互斥的傳參形式，不能混拼：

```json theme={null}
// ✅ 圖片是網路 URL → 直接傳連結，不加任何字首
"image_url": {
  "url": "https://example.com/generations/temp-xxx.jpg"
}

// ✅ 圖片是本地檔案/二進位制 → 先 Base64 編碼，再拼 data URI
"image_url": {
  "url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
}
```

<Tip>
  **自檢建議**：傳送前判斷圖片來源——字串以 `http` 開頭就走 URL 方式，否則才做 Base64 編碼並拼 data URI。合法的 Base64 字串不會包含 `://`、`?` 等字元，若在 `base64,` 之後看到這些字元，基本可以斷定是把連結拼進去了。
</Tip>

### 宣告的圖片格式與實際格式不符（media type mismatch）

如果收到如下 400 錯誤（關鍵特徵是 `The image was specified using the image/png media type, but the image appears to be a image/jpeg image`）：

```json theme={null}
{
  "status_code": 400,
  "error": {
    "message": "InvokeModel: operation error Bedrock Runtime: InvokeModel, https response error StatusCode: 400, ... ValidationException: ...source.base64: The image was specified using the image/png media type, but the image appears to be a image/jpeg image"
  }
}
```

意思是：data URI 裡**宣告**圖片是 PNG（`data:image/png;base64,...`），上游解碼後檢查檔案頭，發現**實際內容是 JPEG**，於是拒絕。常見誘因是按副檔名推斷格式（檔案被改過後綴）、或程式碼裡寫死了 `image/png`。

<Info>
  是否校驗取決於模型走的上游通道：2026-10-11 (UTC+8) 實測把 JPEG 宣告成 PNG，22 個視覺模型全部正常識別；但 Claude 系經 Bedrock 通道時會報上面這個錯。按「宣告必須與內容一致」來寫程式碼，在任何通道上都不會踩坑。
</Info>

**解決方法**：按檔案頭判斷真實格式再拼 data URI，或者像「大圖先縮放」裡的函式那樣統一用 PIL 轉成 JPEG：

```python theme={null}
import base64

def image_to_data_uri(image_path):
    """按檔案頭識別真實格式，杜絕 media type 與內容不一致"""
    with open(image_path, "rb") as f:
        data = f.read()

    if data[:8] == b"\x89PNG\r\n\x1a\n":
        mime = "image/png"
    elif data[:3] == b"\xff\xd8\xff":
        mime = "image/jpeg"
    elif data[:6] in (b"GIF87a", b"GIF89a"):
        mime = "image/gif"
    elif data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        mime = "image/webp"
    else:
        raise ValueError(f"無法識別的圖片格式: {image_path}")

    return f"data:{mime};base64,{base64.b64encode(data).decode('utf-8')}"
```

<Tip>
  `file xxx.png`（macOS / Linux 命令列）一秒看出檔案真實格式；Python 裡 `Image.open(path).format` 也能拿到。
</Tip>

## 進階技巧

### 確認圖片真的進了模型

看響應裡的 `usage.prompt_tokens`：一張 1200×760 的圖在各家約 900\~1300 tokens（DeepSeek Vision 約 570）；**如果只比純文本多幾個甚至沒變，說明圖片被丟掉了**。這種情況出現在純文本模型（`deepseek-v4-pro`、`glm-5.3`），以及 Grok 走 Anthropic 端點、Gemini 走 Anthropic url source 時。

<Warning>
  **沒收到圖的模型可能編答案**。實測在不帶圖的情況下要求「逐字提取圖片文字」，`gemini-3.8-flash` 6 次中有 1 次編出了一整張並不存在的表格，其餘模型都如實說看不到。所以批次流程裡不要只看回答，先用 `prompt_tokens` 確認圖片已送達。
</Warning>

### `detail` 引數

`image_url` 裡的 `detail: "low"` 只有部分模型認：`gpt-5.4-mini`（1147 → 233 tokens，但小字開始讀錯）、Seed（1340 → 602 tokens，OCR 仍全對）；GPT-6 / 5.6、Gemini、Claude、Qwen 會忽略。想省 tokens，更通用的辦法是自己先縮小圖片。

### 引數說明

chat 端點上，`max_tokens`、`temperature` 在 GPT（含 GPT-6）、Claude、Gemini 上都能正常使用（實測 `temperature=0.3` 全部通過）。MiniMax-M3 會把思考過程 `<think>...</think>` 放在正文裡，需要自行剝離。

### 常見任務的提問思路

同一張圖，換提示詞就能完成不同任務，無需改程式碼：

* **OCR**：「逐字提取圖片裡的所有文字，表格用 Markdown 表格輸出」
* **計數 / 結構化**：「數一數每種物體各有幾個，只輸出 JSON：`{"物體": 數量}`」
* **商品分析**：「識別商品型別和品牌，列出主要賣點與適合人群」
* **多圖對比**：「下面依次是圖 1 和圖 2，逐項說出不同之處」
* **圖表解讀**：「讀出圖表的座標軸、資料趨勢和最大最小值」

<Warning>
  醫療影像、證件、人身安全相關的識別結果僅供參考，重要決策需人工複核；不要上傳含敏感個人資訊的圖片。
</Warning>

## 常見問題

<AccordionGroup>
  <Accordion title="哪些模型能看圖？">
    本頁實測的 22 個視覺模型都能用：Gemini、GPT、Claude、Grok、Seed、Qwen、Kimi、MiniMax、DeepSeek Vision。`deepseek-v4-pro`、`glm-5.3` 等純文本模型不能。其他模型以模型詳情頁的「輸入模態」為準。
  </Accordion>

  <Accordion title="傳了圖片，模型卻說「看不到」？">
    先看響應裡的 `usage.prompt_tokens`：只有幾十說明圖片沒進模型。常見原因：① 選了純文本模型；② 用 Anthropic 端點調 Grok，或用 Anthropic url source 調 Gemini（都會靜默丟圖）；③ 公網直鏈上游拉不到。換成 chat `image_url` + Base64 基本都能解決。
  </Accordion>

  <Accordion title="同一段程式碼，換個模型就報 400？">
    多半是用了 Responses 或 Anthropic 寫法——它們只支援部分模型（見「四種寫法支援哪些模型」）。改成 OpenAI 相容 chat 的 `image_url` 寫法即可在各家通用。
  </Accordion>

  <Accordion title="Claude 返回 429，是被限流了嗎？">
    先看報錯正文。如果是 `image exceeds 10 MB maximum`，是圖片太大（按 Base64 後的體積算），重試不會成功，縮放到長邊 2048px 左右再傳即可。
  </Accordion>

  <Accordion title="為什麼一張圖花了幾萬 tokens？">
    GPT 系按圖塊計費，原圖越大 tokens 越多：實測一張 9000×6000 的圖在 `gpt-6-sol` 上記了 63658 個輸入 tokens。上傳前縮放到長邊 2048px 左右，實測同一張圖在 `gpt-6-sol` 上降到 3320 tokens，各家約 700\~3700 tokens。
  </Accordion>

  <Accordion title="支援哪些圖片格式？">
    JPEG、PNG、GIF、WebP 等主流格式都可以；手機相機拍出的 MPO（副檔名仍是 .jpg）實測也能識別。最穩的做法是統一用 PIL 轉成 JPEG 再傳。
  </Accordion>
</AccordionGroup>

## 相關資源

<CardGroup cols={2}>
  <Card title="模型價格" icon="list" href="/zh-Hant/models/index">
    檢視全部模型與最新定價
  </Card>

  <Card title="影片理解 API" icon="video" href="/zh-Hant/api-capabilities/video-understanding">
    影片內容識別、場景描述與時間戳定位
  </Card>

  <Card title="Gemini 原生格式" icon="sparkles" href="/zh-Hant/api-capabilities/gemini/native">
    原生格式的流式、推理預算等用法
  </Card>

  <Card title="文本+出圖能不能一個介面" icon="circle-help" href="/zh-Hant/faq/text-and-image-in-one-api">
    如何判斷模型支援哪些輸入模態
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.