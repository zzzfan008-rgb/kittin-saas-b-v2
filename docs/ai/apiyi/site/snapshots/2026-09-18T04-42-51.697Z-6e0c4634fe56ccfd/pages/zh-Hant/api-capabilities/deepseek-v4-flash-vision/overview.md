> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash Vision 影像理解

> DeepSeek 首個視覺模型 deepseek-v4-flash-vision-exp：看圖、讀截圖、認圖表，1M 上下文、單圖最多 384 tokens。API易 輸入 $0.44、輸出 $1.32 每 1M tokens，OpenAI 與 Anthropic 兩種格式都能調。

`deepseek-v4-flash-vision-exp` 是 DeepSeek 的**實驗性視覺模型**，在 V4 Flash 的底座上加了影像輸入：
描述圖片、讀截圖裡的文字、認圖表數值、比較多張圖，都能直接做。文本側的能力（1M 上下文、
深度思考、函式呼叫、上下文快取）全部保留，定價也與純文本的 V4 Flash 完全一致 ——
**看圖不額外加價，圖片按尺寸折成輸入 tokens 計費**。

API易 已完成 **124 個用例、約 1100 次呼叫的實測**，覆蓋三種傳圖通道、四種圖片格式、
兩種協議、兩個分組。

<Warning>
  **呼叫前必讀：這個模型在 API易 有兩個分組，能力不一樣，必須按你用的協議選。**

  | 你用的協議                                             | 令牌要選的分組          |
  | ------------------------------------------------- | ---------------- |
  | OpenAI 格式（`/v1/chat/completions`、`/v1/responses`） | **`default`**    |
  | Anthropic 格式（`/v1/messages`，含 Claude Code 等客戶端）   | **`ClaudeCode`** |

  選錯不會提示"分組錯誤"，而是表現成引數不生效、第二輪 400、responses 報 messages 的錯。
  兩個分組**同價**，選分組隻影響能力，不影響計費。詳見下方「分組怎麼選」。
</Warning>

## 核心優勢

<CardGroup cols={2}>
  <Card title="看圖不加價" icon="circle-dollar-sign">
    與純文本 V4 Flash 同價：輸入 \$0.44、輸出 \$1.32 每 1M tokens。圖片折成輸入 tokens，單圖最多 384。
  </Card>

  <Card title="實測識別紮實" icon="eye">
    截圖 OCR 數值全對、5 根柱狀圖讀數全對、36 個圖形裡數指定顏色形狀 24/24 全對，否定性提問不幻覺。
  </Card>

  <Card title="大圖不用預壓縮" icon="image">
    2000×2000 與 4000×4000 折出的 tokens 完全相同（均 346），上游自己縮放。壓縮只省頻寬，不省錢。
  </Card>

  <Card title="兩種協議都能調" icon="git-compare">
    OpenAI 格式（chat/completions + responses）與 Anthropic 格式（/v1/messages）都實測可用，各走各的分組。
  </Card>
</CardGroup>

## 模型資訊

| 引數              | 值                                                                    |
| --------------- | -------------------------------------------------------------------- |
| **模型名稱**        | `deepseek-v4-flash-vision-exp`                                       |
| **模型版本**        | DeepSeek-V4-Flash-Vision-Exp（實驗性）                                    |
| **上下文視窗**       | 1M（實測硬上限 1,048,576 tokens，`max_tokens` 計入其中）                         |
| **最大輸出**        | 384K（實測硬上限 393,216，超出報 `valid range of max_tokens is [1, 393216]`）   |
| **可用分組**        | `default`、`ClaudeCode`、`svip`                                        |
| **端點**          | `POST /v1/chat/completions`、`POST /v1/responses`、`POST /v1/messages` |
| **圖片輸入**        | ✅ JPEG / PNG / GIF / WebP                                            |
| **深度思考**        | 預設開啟，可關（寫法與分組有關，見下）                                                  |
| **流式輸出**        | ✅ 三種端點均支援                                                            |
| **函式呼叫 / 工具使用** | ✅ 支援，含流式增量拼裝                                                         |
| **JSON 輸出**     | ✅ `json_object`；❌ `json_schema`（上游未開放）                               |
| **定價**          | 輸入 \$0.44、輸出 \$1.32、快取命中 \$0.014，每 1M tokens                         |

<Note>
  官方自 2026 年 8 月 17 日起對該模型採用峰谷兩檔計費（峰值時段為 01:00-04:00 與 06:00-10:00 (UTC)，
  即 09:00-12:00 與 14:00-18:00 (UTC+8)）。**本站固定按峰值檔計價**，不隨時段浮動。
</Note>

## 分組怎麼選

這個模型在 API易 掛了兩個分組，**上游渠道不是同一個端點**，所以能力不對等。
下表是 2026 年 8 月 21 日的實測結果（每格重複 3 次）：

| 能力                         | `default` 分組              | `ClaudeCode` 分組 |
| -------------------------- | ------------------------- | --------------- |
| `/v1/chat/completions` + 圖 | ✅                         | ✅               |
| `/v1/responses` + 圖        | ✅                         | ❌ 全部 400        |
| `/v1/messages` + 圖         | ⚠️ 必須顯式傳 `top_p`，且多輪會 400 | ✅ 完整可用          |
| `detail` 省 token           | ✅ 生效                      | ❌ 被忽略           |
| 關閉深度思考（OpenAI 格式）          | ✅ 生效                      | ❌ 被忽略           |
| `logprobs`                 | ✅ 有值                      | ❌ 返回空           |
| 響應裡的 `reasoning_tokens` 統計 | ✅ 有                       | ❌ 整個欄位缺失        |
| 圖片用公網外鏈（Anthropic 格式）      | ❌                         | ✅               |

### 用 OpenAI 格式 → 選 `default` 分組

在控制台建立令牌時把分組選成 `default`，然後：

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",          # default 分組的令牌
    base_url="https://api.apiyi.com/v1",
)
```

### 用 Anthropic 格式 → 選 `ClaudeCode` 分組

在控制台建立令牌時把分組選成 `ClaudeCode`，然後：

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="sk-your-apiyi-key",          # ClaudeCode 分組的令牌
    base_url="https://api.apiyi.com",
)
```

<Tip>
  一個賬號可以同時建多個不同分組的令牌，互不影響 —— 建議就按協議各留一把。
  分組的作用和建立方式見 [分組是什麼](/zh-Hant/faq/groups-explained)、
  [令牌與分組](/zh-Hant/faq/token-and-groups)，三個分組的區別見
  [Codex、ClaudeCode 和 Default 分組有什麼區別](/zh-Hant/faq/codex-claudecode-default-groups)。
</Tip>

<Warning>
  **Anthropic 格式千萬別用 `default` 分組**，會撞上兩個疊加問題：

  1. 不顯式傳 `top_p` 一律返回 400 `Invalid top_p value`
  2. 就算補上 `top_p`，第一輪返回的 `thinking` 塊原樣回傳到第二輪時會報
     `unknown variant 'thinking'` —— 而 Claude Code、Anthropic SDK 這類標準客戶端
     一定會原樣回傳，所以**多輪必斷**

  換成 `ClaudeCode` 分組，這兩個問題都不存在，工具呼叫閉環也完整可用。
</Warning>

## 三種傳圖方式

### 1. base64 內聯（最常用）

```python theme={null}
import base64

with open("image.jpg", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="deepseek-v4-flash-vision-exp",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "這張圖裡有什麼？"},
            {"type": "image_url",
             "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
        ],
    }],
    max_tokens=2000,
)
print(resp.choices[0].message.content)
```

### 2. 公網圖片外鏈

```python theme={null}
resp = client.chat.completions.create(
    model="deepseek-v4-flash-vision-exp",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "描述這張圖"},
            {"type": "image_url",
             "image_url": {"url": "https://example.com/image.jpg"}},
        ],
    }],
    max_tokens=2000,
)
```

外鏈長度上限 8192 字元，圖片需在 60 秒內下載完成。連結不通會返回
`Failed to download image`。

### 3. `file` 內容塊（等價於 base64 內聯）

```json theme={null}
{
  "type": "file",
  "file_data": "data:image/jpeg;base64,<BASE64>",
  "filename": "image.jpg"
}
```

實測與 `image_url` 通道折出的 tokens 完全一致（同一張圖都是 303）。

<Warning>
  **Files API（`/v1/files` 上傳後用 `file_id` 引用）在 API易 不可用**，
  這是第三方中轉平臺的普遍情況。因此官方給 `file_id` 留的兩個額度
  —— 單圖 64 MiB、單請求總量 200 MiB —— 也拿不到。

  實際能用的上限是：**單圖 ≤ 32 MiB、單請求體 ≤ 48 MiB**。
  超了會返回 `image file size exceeds limit 32 MB`。
</Warning>

## 圖片怎麼計費

圖片按**縮放後的尺寸**折成輸入 tokens，與文本 tokens 一起按 \$0.44 / 1M 計價。
下面是 API易 實測資料（用同一段提示詞做差值，扣掉文本基線）：

| 圖片尺寸                        | 折算 tokens | 單圖成本        | 每千張    |
| --------------------------- | --------- | ----------- | ------ |
| 64×64                       | 114       | \$0.00005   | \$0.05 |
| 384×384                     | 114       | \$0.00005   | \$0.05 |
| 800×800                     | 346       | \$0.000152  | \$0.15 |
| 2000×2000                   | 346       | \$0.000152  | \$0.15 |
| 4000×4000                   | 346       | \$0.000152  | \$0.15 |
| 1600×1200                   | 354       | \$0.000156  | \$0.16 |
| 1600×1200 + `detail: "low"` | 142       | \$0.0000625 | \$0.06 |

三條規律，實測與官方描述完全一致：

* **單圖上限 384 tokens**。實測最大 354，怎麼放大都超不過
* **大圖會被縮到約 800×800 等效**。所以 2000² 與 4000² 折出的 tokens 完全相同，
  **上傳前預壓縮只省頻寬、不省錢**
* **小於 384×384 的圖會被放大**。所以 64×64 和 384×384 花的錢一樣，
  小圖不必刻意再縮

### 省下六成 token 的開關：`detail: "low"`

不需要看清細節時（判斷圖片型別、認主體、粗略分類），加上 `detail: "low"`
會把圖縮到 512×512 再推理：

```json theme={null}
{
  "type": "image_url",
  "image_url": {"url": "https://example.com/image.jpg", "detail": "low"}
}
```

四個檔位實測（1600×1200 同一張圖）：

| `detail`   | 折算 tokens | 相對預設      |
| ---------- | --------- | --------- |
| `low`      | 142       | **省 60%** |
| `high`     | 354       | 持平        |
| `original` | 354       | 基準        |
| `auto`     | 354       | 持平        |

<Warning>
  `detail` 只在**兩個條件同時滿足**時生效：走 `image_url` 通道（放在 `file` 塊上會被靜默忽略），
  且令牌是 **`default` 分組**（`ClaudeCode` 分組下不生效）。

  填了非法值會明確報錯：`unknown variant 'ultra', expected one of 'low', 'high', 'original', 'auto'`。
</Warning>

## 深度思考控制

模型**預設開啟深度思考**，思考內容會計入 `max_tokens` 配額。
純識圖任務建議直接關掉：實測關思考後 24/24 全對、更快，還省下思考的輸出 tokens，
輸入側也少 80 tokens（思考模式的系統提示詞固定佔這麼多）。

各寫法實測（每種 3 次）：

| 寫法                               | `default` 分組 chat   | `ClaudeCode` 分組 chat | `/v1/messages` |
| -------------------------------- | ------------------- | -------------------- | -------------- |
| `thinking: {"type": "disabled"}` | ✅                   | ❌                    | ✅ 兩個分組都行       |
| `reasoning_effort: "none"`       | ✅                   | ❌                    | —              |
| `reasoning_effort: "low"`        | ⚠️ 思考仍在，只是換了更短的系統提示 | ❌                    | —              |
| `reasoning: {"effort": "none"}`  | ❌                   | ❌                    | —              |
| `enable_thinking: false`         | ❌                   | ❌                    | —              |

```python theme={null}
resp = client.chat.completions.create(
    model="deepseek-v4-flash-vision-exp",
    messages=[...],
    max_tokens=2000,
    extra_body={"thinking": {"type": "disabled"}},   # default 分組有效
)
```

<Warning>
  **`max_tokens` 別給小**。開著思考時，一句話問題也可能先輸出幾百 tokens 的思考內容，
  給小了會 `finish_reason: "length"` 且 `content` 為空字串 —— 看起來像模型沒回答。
  開思考建議 2000 以上；或者乾脆關掉思考。
</Warning>

## 上下文快取

無需任何引數，相同長字首重複請求會自動命中，命中部分按 \$0.014 / 1M 計費。
但**含圖請求有兩點和純文本不一樣**：

|              | 純文本請求 | 含圖請求      |
| ------------ | ----- | --------- |
| 第幾次開始命中      | 第 2 次 | 第 3 次     |
| 圖片那部分 tokens | —     | **永不進快取** |

實測（2304 tokens 的文本字首 + 一張 800×800 圖）：

| 第幾次 | prompt\_tokens | 命中       | 未命中  |
| --- | -------------- | -------- | ---- |
| 1   | 2675           | 0        | 2675 |
| 2   | 2675           | 0        | 2675 |
| 3   | 2675           | **2304** | 371  |
| 4   | 2675           | 2304     | 371  |

命中量恰好等於圖片**之前**那段文本，圖片本身與其後的內容每次都全價。
所以**把固定的長指令放在圖片前面**，能讓它進快取；放在圖片後面則永遠命中不了。

<Note>
  Anthropic 格式下這些欄位叫 `cache_read_input_tokens` / `cache_creation_input_tokens`，
  行為一致。注意 `cache_control` 顯式快取標記**不生效**（上游用的是自動字首快取），
  且兩種協議的 usage 口徑不同：OpenAI 格式的 `prompt_tokens` 是全量，
  Anthropic 格式命中後 `input_tokens` 只剩未命中部分，**不能直接對賬**。
</Note>

## 支援的圖片格式

| 格式               | 支援 | 說明                                          |
| ---------------- | -- | ------------------------------------------- |
| JPEG             | ✅  |                                             |
| PNG              | ✅  |                                             |
| GIF              | ✅  | 動畫 GIF **只讀第一幀**，tokens 也按單幀算               |
| WebP             | ✅  |                                             |
| BMP / TIFF / SVG | ❌  | 返回 `You have uploaded an unsupported image` |

四種支援格式折出的 tokens 完全一致，選哪個都不影響成本。

<Tip>
  **格式按檔案內容判斷，不看你宣告的 MIME**。實測把 PNG 謊報成 `image/jpeg` 照樣正常工作
  —— 所以副檔名寫錯、MIME 填錯都不影響，只要檔案本身是這四種格式之一。
</Tip>

## 實測能力矩陣

以下為 API易 2026 年 8 月 21 日的實測結果：

| 能力                                                     | 官方宣告     | 實測（`default` 分組）                                      |
| ------------------------------------------------------ | -------- | ----------------------------------------------------- |
| base64 內聯圖                                             | ✅        | ✅                                                     |
| 公網外鏈圖                                                  | ✅        | ✅                                                     |
| `file` 塊 `file_data`                                   | ✅        | ✅                                                     |
| `file_id`（Files API）                                   | ✅        | ❌ 平臺不提供 Files API                                     |
| 多圖單請求                                                  | 最多 600 張 | ✅ 實測 20 張順序內容全對                                       |
| 圖 + 多輪上下文                                              | ✅        | ✅                                                     |
| 圖 + 函式呼叫                                               | ✅        | ✅ 含流式增量                                               |
| 圖 + JSON 輸出                                            | ✅        | ✅ `json_object`                                       |
| 結構化輸出 `json_schema`                                    | —        | ❌ 上游返回 `This response_format type is unavailable now` |
| 流式輸出                                                   | ✅        | ✅ 三種端點均可                                              |
| `logprobs` / `temperature` / `top_p` / `stop` / `seed` | ✅        | ✅                                                     |
| Responses 的 `previous_response_id` 會話鏈                 | ✅        | ❌ **靜默失效**（不報錯但不帶上下文），多輪請自己拼 `input`                  |

### 視覺準確性抽查

| 任務                     | 結果          |
| ---------------------- | ----------- |
| 6 行英數混排截圖 OCR          | 訂單號、金額、郵箱全對 |
| 5 根柱狀圖讀數               | 5/5 全對，含標題  |
| 6×6 網格里數指定顏色形狀（36 個圖形） | 24/24 全對    |
| 兩圖差異比較                 | 正確          |
| 10 圖 / 20 圖順序標籤識別      | 全對          |
| 否定性提問（圖中沒有的東西）         | 正確否認，未幻覺    |

## 限制與常見報錯

| 限制             | 值         | 超出時的報錯                                                  |
| -------------- | --------- | ------------------------------------------------------- |
| 單圖大小           | 32 MiB    | `image file size exceeds limit 32 MB`                   |
| 單請求體           | 48 MiB    | —                                                       |
| 外鏈長度           | 8192 字元   | `external link length … too long, max link length 8192` |
| 單請求圖片數         | 官方 600 張  | —                                                       |
| `max_tokens`   | 393,216   | `valid range of max_tokens is [1, 393216]`              |
| `top_logprobs` | 0–20      | `valid range of top_logprobs is [0, 20]`                |
| 上下文            | 1,048,576 | `This model's maximum context length is 1048576 tokens` |

<Note>
  上下文的 1,048,576 是實測硬上限，且報錯顯示 **`max_tokens` 會計入這個總量**
  （`… in the messages, … in the completion`）。拼滿長上下文時記得給輸出配額留位置，
  否則會撞上限。
</Note>

其它常見 400：

* `You have uploaded an unsupported image` —— 格式不在四種之列，或 base64 資料損壞
* `Failed to download image` —— 外鏈不通或超過 60 秒
* `Image in assistant message is unsupported` —— 圖片只能放在 `user` 訊息裡

<Note>
  實測約 **1%\~3%** 的請求會出現連線被靜默關閉（客戶端表現為 SSL EOF 或握手超時），
  與圖片無關、與分組無關，是通道層面的偶發現象。
  **客戶端務必設定讀超時並帶重試**，否則單條請求可能掛住兩分鐘以上。
  超時設定見 [超時配置](/zh-Hant/faq/timeout-configuration)。
</Note>

## 完整示例

### OpenAI 格式（`default` 分組）

```python theme={null}
import base64
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",       # default 分組
    base_url="https://api.apiyi.com/v1",
)

with open("chart.png", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="deepseek-v4-flash-vision-exp",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "讀出這張柱狀圖的五個數值，只輸出數字。"},
            {"type": "image_url",
             "image_url": {"url": f"data:image/png;base64,{b64}", "detail": "original"}},
        ],
    }],
    max_tokens=2000,
    extra_body={"thinking": {"type": "disabled"}},
)
print(resp.choices[0].message.content)
print(resp.usage)
```

### Anthropic 格式（`ClaudeCode` 分組）

```python theme={null}
import base64
import anthropic

client = anthropic.Anthropic(
    api_key="sk-your-apiyi-key",       # ClaudeCode 分組
    base_url="https://api.apiyi.com",
)

with open("chart.png", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

msg = client.messages.create(
    model="deepseek-v4-flash-vision-exp",
    max_tokens=2000,
    thinking={"type": "disabled"},
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "讀出這張柱狀圖的五個數值，只輸出數字。"},
            {"type": "image", "source": {
                "type": "base64", "media_type": "image/png", "data": b64}},
        ],
    }],
)
print(msg.content)
```

## 相關文件

<CardGroup cols={2}>
  <Card title="影像理解（識圖）API" icon="eye" href="/zh-Hant/api-capabilities/vision-understanding">
    各家識圖模型的通用呼叫方式與對比
  </Card>

  <Card title="DeepSeek V4 Flash 文本生成" icon="zap" href="/zh-Hant/api-capabilities/deepseek-v4-flash/overview">
    同底座的純文本版本，1M 上下文與雙端點能力
  </Card>

  <Card title="分組怎麼選" icon="users" href="/zh-Hant/faq/codex-claudecode-default-groups">
    Codex、ClaudeCode 和 Default 三個分組的區別與選擇建議
  </Card>

  <Card title="超時配置" icon="timer" href="/zh-Hant/faq/timeout-configuration">
    客戶端讀超時與重試的推薦設定
  </Card>
</CardGroup>
