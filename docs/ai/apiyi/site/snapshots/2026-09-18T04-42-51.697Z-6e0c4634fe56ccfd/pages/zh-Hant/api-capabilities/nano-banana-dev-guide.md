> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 系列開發指南

> Nano Banana 系列（Pro / 2 / 2 Lite / 第一代）的模型選型、計費、接入端點、開發格式與常見問題一站式指南，幫助開發者快速上手 Gemini 生圖 API。

## 模型卡

| 模型                     | 官方模型名                            | 計費                                                   | 備註        |
| ---------------------- | -------------------------------- | ---------------------------------------------------- | --------- |
| **Nano Banana Pro**    | `gemini-3-pro-image-preview`     | 固定按次 **\$0.09/次**（約 0.63 元；疊加充值活動後約 0.55 元）          | 品質最高      |
| **Nano Banana 2**      | `gemini-3.1-flash-image-preview` | 按次 **\$0.055/次**（推薦 4K 出圖使用）；或按量動態計費，2K 約 **\$0.04** | 價效比       |
| **Nano Banana 2 Lite** | `gemini-3.1-flash-lite-image`    | 固定按次 **\$0.025/次**；或按量約 **\$0.018/次**（官網 4 折）        | 最快最省，僅 1K |
| **Nano Banana**（第一代）   | `gemini-2.5-flash-image`         | 固定按次 **\$0.02/次**                                    | 最便宜       |

<Info>
  完整價格對比、按次/按量計費與令牌選擇建議，見 [Nano Banana 系列價格總覽](/zh-Hant/api-capabilities/nano-banana-pricing)。
</Info>

### 尺寸控制

* **遵循原圖比例**：不傳 `aspectRatio` 即可；在多圖編輯場景裡，以**最後一張圖的尺寸**為準
* **解析度 `imageSize`**：支援 `1K` / `2K` / `4K`
  * Nano Banana（第一代）**僅支援 1K**
  * Nano Banana 2 **新增 512px**
  * Nano Banana 2 Lite **僅支援 1K**（不支援 2K/4K/512px）

<Warning>
  用同一套程式碼呼叫第一代 `gemini-2.5-flash-image` 時，**必須去掉 `imageSize` 引數**（它不支援 `2K` / `4K`），否則會呼叫失敗。
</Warning>

## 接入方式

### 官方文件

* 谷歌官方文件：`ai.google.dev/gemini-api/docs/image-generation`
* 接入 API易 只需把**請求地址 + KEY 替換為 API易 的**即可，其餘引數與官方一致

### 官方狀態查詢（排查上游故障）

Nano Banana 系列底層依賴谷歌 AIStudio / Gemini API。少數情況下 **2K / 4K 出圖變糊或報錯**，可能是**谷歌官方側**的問題、而非接入層——可在谷歌官方狀態頁核對（請自行復制訪問）：`aistudio.google.com/status`。

例如 2026 年 6 月 19 日，該頁報道過「Issues with Nano Banana」：Gemini API 與 AI Studio 上的 Nano Banana 2 / Pro 在 2K 或 4K 解析度下出現問題。遇到類似現象，先比對官方狀態頁即可快速判斷是否為上游故障。

<Info>
  API易 為 Nano Banana 系列提供 **AIStudio + Vertex 雙通道**冗餘：官方單通道異常時可由另一通道頂上，儘量保障服務可用性。
</Info>

### 端點支援

* **推薦端點**（Gemini 原生）：`https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent`
* 支援 **OpenAI 相容模式**呼叫（注意：**不支援 URL 上傳**，需用 Base64）
* **不支援** `/v1/image/generations`

### 開發格式（預設推薦）

* **【推薦】使用谷歌原生端點格式**
* 圖片：**Base64 上傳、下載轉存**
* 呼叫方式：**同步多執行緒呼叫**，暫不支援非同步呼叫

## 輸入圖片要求

* **單圖不能超過 7MB**（谷歌規則）；若通過 Google Cloud Storage 匯入，單檔案上限 30MB
* **每個提示最多 14 張圖**
* **支援的 MIME 型別**：`image/png`、`image/jpeg`、`image/webp`、`image/heic`、`image/heif`（`jpg` 格式 API易 已相容）
* **Base64 體積膨脹**：圖片轉 Base64 後體積增加約 **33.3%**（7MB 的圖約為 9.3MB）
* **API易 限制**：單次請求上傳圖片總量需**低於 100MB**——均為同步呼叫，過大會導致記憶體爆炸

<Frame caption="谷歌官方技術規範：內嵌/控制台上傳單檔案上限 7MB，支援 png/jpeg/webp/heic/heif">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-image-size-limit.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=fc422e34e493a907363115118f715690" alt="谷歌 Gemini 3 Pro Image 官方技術規範表：單圖上限 7MB，每個提示最多 14 張圖，支援的寬高比與 MIME 型別" width="1400" height="701" data-path="images/nano-banana-image-size-limit.png" />
</Frame>

<Frame caption="Base64 編碼使體積增加約 33.3%：7MB 圖片約等於 9.3MB">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-base64-size.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=dffe216ee6e97c2661ce816eb5408a22" alt="Base64 體積計算說明：7MB 原圖按 4/3 比例編碼後約 9.33MB" width="1448" height="984" data-path="images/nano-banana-base64-size.png" />
</Frame>

**最佳實踐**：傳給介面前對圖片做**無失真壓縮**，避免超大解析度拖慢請求速度。

谷歌官方規格說明（請自行復制訪問）：`docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/3-pro-image`

## URL 圖片輸入說明

除了 Base64，**Gemini 原生端點**還支援通過 `fileData.fileUri` 直接傳入圖片 URL（圖床 / OSS 地址），省去本地編碼上傳的步驟。

<Warning>
  **URL 上傳對圖床、OSS 地址的要求較高**：如果不是全球 CDN（例如騰訊雲物件儲存預設走國內 CDN），很可能無法被谷歌伺服器識別，進而請求失敗（典型表現為**不參考圖**）。

  **如果條件允許，儘量用 Base64 方式上傳，穩定性更高**——在平臺視角，這是通用能力上投入運維資源最多、最可靠的方式。
</Warning>

<Info>
  URL 上傳僅在 **Gemini 原生端點**可用；**OpenAI 相容模式不支援 URL 上傳**，需改用 Base64。
</Info>

### Curl 示例（fileUri）

```bash theme={null}
curl --location 'https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent' \
  --header 'Authorization: Bearer sk-' \
  --header 'Content-Type: application/json' \
  --data '{
      "contents": [
          {
              "parts": [
                  {
                      "fileData": {
                          "fileUri": "https://raw.githubusercontent.com/apiyi-api/ai-api-code-samples/refs/heads/main/Vision-API-OpenAI/otter.png",
                          "mimeType": "image/png"
                      }
                  },
                  {
                      "text": "add five dogs"
                  }
              ],
              "role": "user"
          }
      ],
      "generationConfig": {"responseModalities": ["IMAGE"],
      "imageConfig": {
        "aspectRatio": "16:9",
        "imageSize": "2K"
      }},
      "safetySettings": []
  }'   > output.json
```

### Python 示例（fileUri）

```python theme={null}
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gemini 3 Pro Image - 圖片編輯（file_uri 最小化版本）
用途：僅用於快速驗證介面可用性
"""

import requests
import base64
import json
from pathlib import Path
from datetime import datetime

# ============================================================================
# 配置區域
# ============================================================================

API_KEY = "sk-"
API_URL = "https://api.apiyi.com/v1beta/models/gemini-3-pro-image-preview:generateContent"

# 圖片 URL
IMAGE_URL = "https://raw.githubusercontent.com/apiyi-api/ai-pics/refs/heads/main/1762260696217_dd0352c1f9604540.png"
IMAGE_MIME_TYPE = "image/png"

# 編輯指令
EDIT_PROMPT = "將照片中的人的衣服換成藍色夾克，頭髮換成紫色漸變色，人物的動作、眼睛朝向等其他結構不變"
SYSTEM_PROMPT = "您是一位專業的影像描述和生成專家。您的任務是根據使用者的請求，創作出細節豐富、藝術風格明確的高品質影像提示，或對現有影像進行準確、有創意的編輯。"

# 輸出引數
ASPECT_RATIO = "9:16"
RESOLUTION = "4K"
MAX_OUTPUT_TOKENS = 8000
OUTPUT_FILE = f"minimal_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"

# ============================================================================
# 核心程式碼
# ============================================================================

def main():
    print("=" * 60)
    print("開始測試 file_uri 格式介面")
    print("=" * 60)
    print(f"圖片 URL: {IMAGE_URL[:80]}...")
    print(f"編輯指令: {EDIT_PROMPT}")
    print(f"輸出引數: {RESOLUTION}, {ASPECT_RATIO}")
    print("-" * 60)

    # 構建請求體
    # 注意：fileData、mimeType、fileUri 必須使用駝峰命名
    payload = {
        "generationConfig": {
            "responseModalities": ["IMAGE", "TEXT"],
            "imageConfig": {
                "imageSize": RESOLUTION,
                "aspectRatio": ASPECT_RATIO
            },
            "maxOutputTokens": MAX_OUTPUT_TOKENS
        },
        "contents": [
            {
                "role": "model",
                "parts": [{"text": SYSTEM_PROMPT}]
            },
            {
                "role": "user",
                "parts": [
                    {
                        "fileData": {           # 駝峰命名：fileData（不是 file_data）
                            "mimeType": IMAGE_MIME_TYPE,  # 駝峰命名：mimeType
                            "fileUri": IMAGE_URL          # 駝峰命名：fileUri
                        }
                    },
                    {"text": EDIT_PROMPT}
                ]
            }
        ]
    }

    # 傳送請求
    print("\n正在傳送請求...")
    try:
        response = requests.post(
            API_URL,
            json=payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {API_KEY}"
            },
            timeout=300
        )

        print(f"響應狀態碼: {response.status_code}")

        if response.status_code != 200:
            print(f"❌ 錯誤: {response.text}")
            return

        # 解析響應
        data = response.json()
        print("✅ 成功獲取響應")

        # 儲存完整響應（方便除錯）
        with open(OUTPUT_FILE + ".response.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"📄 響應已儲存: {OUTPUT_FILE}.response.json")

        # 提取並列印文本
        parts = data["candidates"][0]["content"]["parts"]
        for part in parts:
            if "text" in part:
                print(f"\n💬 文本響應: {part['text']}")

        # 儲存圖片
        for part in parts:
            if "inlineData" in part or "inline_data" in part:
                image_data = part.get("inlineData", part.get("inline_data", {})).get("data")
                if image_data:
                    image_bytes = base64.b64decode(image_data)
                    with open(OUTPUT_FILE, "wb") as f:
                        f.write(image_bytes)
                    print(f"\n✅ 圖片已儲存: {OUTPUT_FILE}")
                    print(f"📦 檔案大小: {len(image_bytes) / 1024:.1f} KB")
                    print(f"🔗 檔案路徑: {Path(OUTPUT_FILE).resolve()}")
                    return

        print("⚠️  響應中未找到圖片資料")

    except requests.Timeout:
        print("❌ 請求超時")
    except Exception as e:
        print(f"❌ 錯誤: {e}")

if __name__ == "__main__":
    main()
    print("\n" + "=" * 60)
    print("測試結束")
    print("=" * 60)
```

<Tip>
  `fileData`、`mimeType`、`fileUri` 必須使用**駝峰命名**（不是 `file_data` / `file_uri`），否則引數不生效、表現為不參考圖。
</Tip>

## 計費基礎（重要）

* **同步呼叫耗時**：Pro / 2 在 4K 下的合理生成時間約 **30–150s**
* **超時主動斷開仍計費**：例如生成需 120s，但客戶端把超時設為 100s 主動斷開，仍會計費
* **429 / 503 不收費**：請求不通時不計費（我們儘量不讓客戶久等、不卡死遲遲不出圖）
* **內容安全拒絕仍計費**：客戶輸入存在內容安全問題、谷歌拒絕出圖時，**狀態碼 200 仍會計費**——詳見下方錯誤處理與保障計劃

## Google 搜尋接地會在按次價之外另收費

Pro 支援 `googleSearch` 工具（實測 3/3 觸發接地，返回完整 `groundingMetadata`），用來畫天氣卡、股價圖這類需要即時資訊的圖。

**但搜尋呼叫費是加在 \$0.09 按次價之上的，不含在裡面**：

| 場景           | 單次賬單                           |
| ------------ | ------------------------------ |
| 普通出圖（無工具）    | \$0.09                         |
| 帶搜尋、模型查了 1 次 | \$0.09 + \$0.014 = **\$0.104** |
| 帶搜尋、模型查了 2 次 | \$0.09 + \$0.028 = **\$0.118** |

```json theme={null}
{
  "contents": [{ "parts": [{ "text": "畫一張東京今天天氣的卡片海報" }] }],
  "tools": [{ "googleSearch": {} }]
}
```

<Warning>
  **搜尋次數由模型自己決定，客戶無法預先控制**。實測一次出圖請求會自主發起 1–3 次檢索，所以開了這個工具之後單次成本是一個區間（\$0.104–\$0.132），不再是固定的 \$0.09。做成本預估時按上限算。
</Warning>

<Note>
  **圖片搜尋接地（`searchTypes.imageSearch`）在 Pro 上不生效**，實測 0/2 未觸發，`groundingMetadata` 裡不出現 `imageSearchQueries`。這是 Nano Banana 2（`gemini-3.1-flash-image`）的獨有能力，用法見 [Nano Banana 2 · 影響計費的三個引數](/zh-Hant/api-capabilities/nano-banana-2-image/overview#影響計費的三個引數)。
</Note>

## thinkingLevel 對 Pro 無效，不要照搬 NB2 的寫法

`generationConfig.thinkingConfig.thinkingLevel` 是 **Nano Banana 2 系列獨有**的開關。給 Pro 傳 `high`：

* **不報錯**，請求正常返回 200
* **但完全不生效**：實測 `thoughtsTokenCount` 在 108–156 之間，與不傳時的 130–159 完全重疊
* Pro 的思考恆開、無法調節，官方文件亦如此說明

而且 **Pro 按次固定計價，思考多少都不進賬單**——所以在 Pro 上調這個引數既無效果、也無成本意義。需要控制思考開銷請改用 Nano Banana 2 的按量計費。

## 超時設定（重要）

4K 出圖的整體耗時較長，包含**圖片上傳、API 處理、Base64 圖片下載**等環節（我們後臺按 **API 處理用時**計費）。正常情況下 4K 用時約 **50s**（不含輪詢），但客戶端若把超時設得過短，就會在出圖完成前**主動斷開**並報錯：

```text theme={null}
API Connection Error: HTTPSConnectionPool(host='api.apiyi.com', port=443): Read timed out. (read timeout=120)
```

<Frame caption="呼叫日誌：4K 出圖首位元組耗時約 43–61s，預設 120s 超時偏緊">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-timeout-error.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=79eb88c65cd4ff91caa57e1402658b81" alt="呼叫日誌：gemini-3-pro 4K 出圖首位元組耗時 43 到 61 秒" width="1400" height="837" data-path="images/nano-banana-timeout-error.png" />
</Frame>

為更保險，建議按解析度設定超時時間：

```python theme={null}
timeout = {
    "1K": 300,  # 5 分鐘 - 快速預覽
    "2K": 300,  # 5 分鐘 - 推薦使用
    "4K": 600,  # 10 分鐘 - 超高畫質
}
```

## 多輪對話式編輯（原生支援，逆向不支援）

Nano Banana 系列走 **Gemini 原生格式**，支援**真正的對話式多輪編輯**：把模型每一輪產出的圖作為 **`role: "model"` 的 `inlineData`** 回填進 `contents`，再發下一條 user 指令，模型會基於**完整對話歷史**繼續修改並**累積效果**（如先改沙發顏色、再加配飾，上一步的改動會保留）。

這一點與"逆向"影像模型有本質區別，接入前務必分清：

| 維度         | Nano Banana（Gemini 原生）                         | 逆向模型（如 `gpt-image-2-all`）        |
| ---------- | ---------------------------------------------- | -------------------------------- |
| 端點         | `/v1beta/...:generateContent`                  | `/v1/chat/completions`（對話式）      |
| 多輪機制       | ✅ **真·對話式**：`contents` 回填 `role:model` 圖，模型讀歷史 | ❌ 無對話狀態：`assistant` 歷史裡的圖**被忽略** |
| 跨輪累積修改     | ✅ 支援（紅沙發→再加帽子，紅沙發保留）                           | ⚠️ 只能"重新喂圖"做單步改圖                 |
| 正確改上一張圖的姿勢 | 把上輪產出作為 `model` 圖回填進對話歷史                       | 把上一張圖 URL 作為**新一輪 user 的參考圖**重新傳 |

<Info>
  實測：把上一張圖放進 `model` 角色回填，Nano Banana 2（`gemini-3.1-flash-image-preview`）能正確基於它繼續編輯並累積修改；而逆向模型只認**最後一條 user 訊息裡的參考圖**，靠保留對話歷史做多輪在逆向上無效。
</Info>

最小示例（每輪把產出圖回填進同一個 `contents`）：

```python theme={null}
import requests, base64

API_KEY = "sk-your-api-key"
URL = "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent"
H = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
CFG = {"responseModalities": ["IMAGE"], "imageConfig": {"imageSize": "2K"}}

contents = []  # 全程維護同一個對話歷史

def turn(instruction, save_to):
    contents.append({"role": "user", "parts": [{"text": instruction}]})
    data = requests.post(URL, headers=H,
                         json={"contents": contents, "generationConfig": CFG}, timeout=300).json()
    part = next(p for p in data["candidates"][0]["content"]["parts"] if "inlineData" in p)
    contents.append({"role": "model", "parts": [part]})   # 關鍵：把產出圖回填進歷史
    with open(save_to, "wb") as f:
        f.write(base64.b64decode(part["inlineData"]["data"]))

turn("生成一隻橙色的貓，坐在藍色沙發上，簡筆畫風格", "step1.png")
turn("把沙發改成紅色，貓和構圖保持不變", "step2.png")     # 基於上一輪的圖
turn("給貓戴一頂黃色小帽子，其它保持不變", "step3.png")     # 繼續累積，紅沙發會保留
```

<Tip>
  完整說明（含"對話歷史回填" vs "重新喂圖"兩種寫法、從已有圖片開始多輪）見 [圖片編輯 API · 多輪對話式編輯](/zh-Hant/api-capabilities/nano-banana-2-image/image-edit#多輪對話式編輯)。
</Tip>

## 取圖必須遍歷 parts，不要按下標

`parts` 是一個**異構陣列**：裡面可能只有圖片段，也可能文本段與圖片段混排，**段數和順序都不做保證**。因此 `parts[0]` / `parts[1]` 這類寫死下標的取法一定會間歇性失敗。

實測出現過的三種排列：

| parts 結構              | 長度 | 圖片下標    |
| --------------------- | -- | ------- |
| `inlineData`          | 1  | `0`     |
| `text` + `inlineData` | 2  | **`1`** |
| `inlineData` + `text` | 2  | **`0`** |

文本段的來源不止一種：`responseModalities` 裡含 `TEXT`、提示詞要求模型給出文字說明，都會讓模型在圖片之外再返回一段文本；文本段排在圖片前還是圖片後也不固定。**因此圖片落在哪個下標並非定值**，同一份程式碼在不同請求下可能拿到不同結構。

<Warning>
  寫死下標的兩種寫法是**互補**的：圖片必落在 `[0]` 或 `[1]`，無論選哪個，都存在拿不到圖的請求。**在 `[0]` 和 `[1]` 之間來回改解決不了問題**，只有按欄位特徵篩選才穩定。
</Warning>

正確寫法是**按欄位特徵篩選**，而不是按位置索引。注意取的是**最後一個** `inlineData` 而非第一個——複雜任務下模型會返回多張圖，最後一張才是最終稿（見下一節）：

```python theme={null}
cand = (resp.get("candidates") or [{}])[0]
parts = (cand.get("content") or {}).get("parts") or []      # 相容 parts=null
images = [p["inlineData"] for p in parts if "inlineData" in p]
if not images:
    raise RuntimeError(f"未返回圖片，finishReason={cand.get('finishReason')}")

final = images[-1]                                 # 多圖時最後一張為最終稿
image_bytes = base64.b64decode(final["data"])
mime = final["mimeType"]                           # 以響應為準，別寫死 image/png
```

```javascript theme={null}
const parts = resp?.candidates?.[0]?.content?.parts ?? [];
const images = parts.filter((p) => p.inlineData?.data);   // ✅ 不要寫 parts[1]
if (images.length === 0) throw new Error("Gemini 未返回圖片資料");
const { data, mimeType } = images[images.length - 1].inlineData;   // 最後一張為最終稿
```

<Tip>
  **加固手段**：在 `generationConfig` 裡顯式宣告 `responseModalities: ["IMAGE"]`，表明只要圖片，可減少多餘文本段。

  但這是加固、**不是替代**——遍歷篩選仍需先落地。反向並不成立：傳 `["TEXT","IMAGE"]` 並**不保證**一定返回文本段，模型也可能只給圖片。
</Tip>

<Warning>
  **`mimeType` 同樣不要寫死**。響應裡的圖片格式並不恆定，`image/png` 與 `image/jpeg` 都出現過。若按固定 `.png` 字尾落盤，會得到副檔名與實際內容不符的檔案——**一律以響應裡的 `mimeType` 為準**決定字尾。
</Warning>

## 偶現多圖輸出是怎麼回事

呼叫 `gemini-3-pro-image` 時，偶爾會看到**同一個響應裡返回多張圖片 part（實測 2–10 張）**，日誌裡對應偶發的 6000+ 乃至上萬的輸出 tokens。這不是異常：谷歌官方文件說明 Gemini 3 圖片模型預設啟用"思考"（無法在 API 中關閉），模型會生成臨時圖片來測試構圖和邏輯，這些中間稿與最終稿一併出現在 `parts` 裡，且"思考中的最後一張圖片也是最終渲染的圖片"（官方文件：`ai.google.dev/gemini-api/docs/image-generation`）。基於 2026 年 7 月實測（Google 原生 `generateContent` 格式）：

| 場景                               | 返回圖片數                    |
| -------------------------------- | ------------------------ |
| 純文生圖                             | 恆為 1 張（即使提示詞明確要求"輸出多張圖"） |
| 簡單圖片編輯（加飾品/換背景/換風格）              | 恆為 1 張                   |
| 複雜任務型編輯（如"人物四檢視 + 換裝 + 白底"等多重約束） | 2–10 張，必現                |

觸發因素是**提示詞的任務複雜度**，不是"圖片編輯"本身。多張圖仍在**同一個 candidate** 內（不是多 candidates），每張都是完整的成圖——它們是思考過程中對同一設計的逐稿修正（構圖相同、細節略有差異），**最後一張 part 即最終稿**。這些中間稿以普通圖片 part 返回（帶 `thoughtSignature` 欄位、無 `thought: true` 標記）；官方稱思考最多生成兩張臨時圖片，實測複雜任務下最多見 10 張。

**對計費的影響**：每張圖按固定 tokens 計費（1K/2K 解析度每張 1120 tokens，4K 每張 2000 tokens），輸出 tokens 隨圖片數嚴格線性增長。日誌裡偶發的 6000+（極端可達 1.3 萬+）輸出 tokens 就是 4–10 圖響應，**不是異常計費**。

**下游程式碼建議**：

```python theme={null}
parts = response["candidates"][0]["content"]["parts"] or []   # 安全拒絕時 parts 為 null
images = [p["inlineData"]["data"] for p in parts if "inlineData" in p]

if images:
    final_image = images[-1]   # 最後一張 = 最終稿
```

* **必須遍歷 parts**，不要假設單響應單圖；按張計數、落盤的邏輯要以實際 part 數為準
* **只要一張時取最後一張**：前面的迭代稿細節未修完，品質略低，不建議取第一張
* **提示詞控制張數基本無效**（實測"只輸出一張"類指令不敏感），請在程式碼層處理
* 多圖響應耗時 35–142s（1K 解析度，張數越多越久），顯著長於單圖，超時請沿用上文建議（≥ 5 分鐘）

<Tip>
  usageMetadata 各欄位的完整口徑（details 與總量的差值、拒絕響應的計數特例等）見 [usage 欄位與輸出解讀](/zh-Hant/api-capabilities/nano-banana-usage-metadata)。
</Tip>

## 常見問題

<CardGroup cols={2}>
  <Card title="錯誤處理指南" icon="triangle-alert" href="/zh-Hant/api-capabilities/gemini-image-error-handling">
    出圖失敗的三大判斷指標、內容稽核政策與友好提示方案
  </Card>

  <Card title="常見開發問題必讀" icon="circle-question-mark" href="/zh-Hant/faq/nano-banana-image-failure">
    出圖失敗排查與常見疑問
  </Card>

  <Card title="出圖失敗保障計劃" icon="shield-check" href="/zh-Hant/api-capabilities/nano-banana-pro-guarantee">
    非主觀原因導致的失敗，按條數核算後補發額度
  </Card>
</CardGroup>

<AccordionGroup>
  <Accordion title="報錯 connection reset by peer / write_response_body_failed（500）是什麼原因？">
    完整報錯形如：

    ```text theme={null}
    [&{{write tcp ip:port->ip:port: write: connection reset by peer Unknown error shell_api_error  write_response_body_failed} 500 }]
    ```

    這種錯誤**往往是上傳的圖片體積過大，請求體超限把連線壓崩了**。請按以下最佳實踐處理：

    * **控制圖片張數**：保持在官方規則內（每個提示最多 14 張圖，見上方官方技術規範）。
    * **控制單圖體積**：每張圖儘量不要超過 5MB——官方單圖上限為 7MB，且 base64 編碼後體積還會膨脹約 1/3，原圖請留足餘量。
    * **前端先壓縮再上傳**：在前端（或服務端中轉層）壓縮後再提交給介面，常見做法是限制最長邊、轉 JPEG/WebP 並控制品質引數。
    * **改用 URL 傳圖**：Gemini 原生格式支援 `fileData.fileUri` 直接傳圖片 URL，可避開 base64 請求體過大的問題，見上文 [URL 圖片輸入說明](#url-圖片輸入說明)。
  </Accordion>
</AccordionGroup>

## 應用場景

* **AI 對話客戶端**：[Cherry Studio](/zh-Hant/scenarios/chat/cherry-studio) 等客戶端可直接配置 API易 出圖
* **出圖測試**：可在對話客戶端或控制台快速驗證模型效果

## 高階需求

* **圖片上傳想用 URL？** Gemini 原生端點支援通過 `fileData.fileUri` 傳入圖片 URL；但 OpenAI 相容模式不支援 URL 上傳，需改用 Base64。程式碼示例與注意事項見上文 [URL 圖片輸入說明](#url-圖片輸入說明)。
* **圖片下載想直接拿到 URL（而非 Base64）？** 使用 NB-OSS 分組——詳見 [Nano Banana OSS 分組](/zh-Hant/api-capabilities/nano-banana-oss-group)。
