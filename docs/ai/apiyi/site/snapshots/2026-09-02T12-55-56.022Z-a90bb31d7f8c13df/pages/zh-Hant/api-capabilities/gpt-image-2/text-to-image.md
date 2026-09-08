> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 文生圖 API 參考

> gpt-image-2 文生圖 API 參考與線上除錯 — 任意合法尺寸（含 4K），按 token 計費

<Info>
  右側的互動式 Playground 支援直接線上除錯。請在 **Authorization** 中填入你的 API Key（格式：`Bearer sk-xxx`），輸入 prompt、選擇 size / quality 後一鍵傳送即可。
</Info>

<Tip>
  **場景說明**：本頁用於「文本生成圖片」。只需輸入提示詞即可，無需上傳任何圖片。如需根據現有圖片做編輯、多圖融合或 mask 局部重繪，請使用 [圖片編輯介面](/zh-Hant/api-capabilities/gpt-image-2/image-edit)。
</Tip>

<Warning>
  **🖥️ 瀏覽器 Playground 限制（重要）**

  本介面的響應包含**純 base64 字串**（數 MB 量級）。受瀏覽器渲染限制，右側 Playground 在收到響應後**可能彈出** `請求時發生錯誤: unable to complete request` ——**實際請求已經成功**，只是瀏覽器無法把這麼長的 base64 顯示出來。

  **推薦做法**（小白零踩坑）：

  * **直接複製下方"程式碼示例"中的 Python / Node.js / cURL 到本地執行**，程式碼會自動 `base64.b64decode` 並把圖片**儲存為本地檔案**。
  * 如要在瀏覽器裡試 Playground，把 `size` 設為最小檔（如 `1024x1024`）、`quality` 改為 `low`，縮小響應體積。
</Warning>

<Info>
  圖片 API 全部為**同步呼叫**：沒有非同步任務 ID，客戶端斷開連線結果即丟失、但請求仍會計費。請為本模型設定足夠大的 timeout，詳見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices)。
</Info>

<Warning>
  **⚠️ 不支援的引數**

  * `input_fidelity` —— `gpt-image-2` 強制啟用高保真，傳了會 400 報錯（從 1.5 遷移時直接刪掉這一行）

  **超過 `2560×1440` 的輸出仍屬實驗性**，生產環境建議優先用預設尺寸：`2048x1152` / `2048x2048` / `3840x2160`。
</Warning>

## 程式碼示例

### Python（OpenAI SDK 直連）

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="gpt-image-2",
    prompt="賽博朋克城市雨夜，霓虹招牌特寫，電影畫幅",
    size="2048x1152",
    quality="high",
    output_format="jpeg",
    output_compression=85
)

# b64_json 是純 base64（無字首），需要自己 decode 寫檔案
with open("out.jpg", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### Python（原生 requests）

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "model": "gpt-image-2",
        "prompt": "橫版 2K 海邊日落老燈塔，電影畫幅",
        "size": "2048x1152",
        "quality": "high"
    },
    timeout=360  # high + 2K/4K 實測可能 3-5 分鐘，按 120s 配會大量誤超時
).json()

with open("out.png", "wb") as f:
    f.write(base64.b64decode(response["data"][0]["b64_json"]))
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2",
    "prompt": "一隻戴墨鏡的橘貓坐在海邊吧檯，電影畫幅",
    "size": "2048x1152",
    "quality": "high",
    "output_format": "jpeg",
    "output_compression": 85
  }'
```

### Node.js（原生 fetch）

```javascript theme={null}
import fs from 'node:fs';

const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'gpt-image-2',
        prompt: '極簡線條風格的貓咪 LOGO',
        size: '1024x1024',
        quality: 'medium'
    })
});

const { data } = await resp.json();
// b64_json 是純 base64（無字首），需自己 decode
fs.writeFileSync('logo.png', Buffer.from(data[0].b64_json, 'base64'));
```

### 瀏覽器 JavaScript（直接渲染）

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'gpt-image-2',
        prompt: '水彩風的北歐極光',
        size: '1536x1024',
        quality: 'high'
    })
});

const { data } = await resp.json();
// 瀏覽器渲染需自己拼 data URL 字首
document.getElementById('img').src = `data:image/png;base64,${data[0].b64_json}`;
```

## 引數說明速查

| 引數                   | 型別     | 必填 | 預設     | 說明                                                                                                                                                            |
| -------------------- | ------ | -- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`              | string | 是  | —      | 固定填 `gpt-image-2`                                                                                                                                             |
| `prompt`             | string | 是  | —      | 提示詞，支援中英文                                                                                                                                                     |
| `size`               | string | 否  | `auto` | 輸出尺寸，預設或滿足約束的自定義尺寸                                                                                                                                            |
| `quality`            | string | 否  | `auto` | `low` / `medium` / `high` / `auto`                                                                                                                            |
| `output_format`      | string | 否  | `png`  | `png` / `jpeg` / `webp`                                                                                                                                       |
| `output_compression` | int    | 否  | —      | 0–100，僅 `jpeg` / `webp` 生效                                                                                                                                    |
| `background`         | string | 否  | `auto` | `transparent` / `opaque` / `auto`；傳 `transparent` 時 `output_format` 必須是 `png` 或 `webp`，配 `jpeg` 會 400，見 [透明背景 FAQ](/zh-Hant/faq/image-transparent-background) |
| `moderation`         | string | 否  | `auto` | `auto` / `low`（低強度稽核）                                                                                                                                         |
| `n`                  | int    | 否  | 1      | 僅支援 1                                                                                                                                                         |

<Warning>
  **`quality` 不要傳舊版 DALL·E 的 `standard` / `hd`。** 只接受 `low` / `medium` / `high` / `auto` 四個官方列舉值。舊值在不同後端渠道下行為不一致：有時直接 400 報錯（`invalid_value`），有時被靜默忽略、按 `auto` 檔跑出結果（費用不可控）。請始終顯式傳四個官方值之一。
</Warning>

<Tip>
  詳細的引數約束、可選值、示例請檢視右側 Playground 中的欄位說明，所有 enum 欄位均支援下拉選擇。
</Tip>

## 響應格式

```json theme={null}
{
    "created": 1776832476,
    "data": [
        {
            "b64_json": "iVBORw0KGgoAAAANSUhEUgAA..."
        }
    ],
    "usage": {
        "input_tokens": 17,
        "input_tokens_details": {
            "image_tokens": 0,
            "text_tokens": 17
        },
        "output_tokens": 196,
        "output_tokens_details": {
            "image_tokens": 196,
            "text_tokens": 0
        },
        "total_tokens": 213
    }
}
```

<Warning>
  **⚠️ b64\_json 欄位是純 base64**，**不含** `data:image/...;base64,` 字首。客戶端需要：

  * **寫檔案**：`base64.b64decode(b64_str)` → 寫入磁碟
  * **瀏覽器渲染**：自行拼字首 `data:image/png;base64,` + b64

  `gpt-image-2-all` / `gpt-image-2-vip` 實測（2026-07）同樣返回純 base64，但其歷史版本曾帶字首——跨模型複用程式碼時建議統一做 `startsWith('data:')` 檢測。
</Warning>

<Info>
  `usage` 欄位反映本次實際計費的 token 數，`input_tokens_details` / `output_tokens_details` 把文本、圖片兩段 token 拆開列出（純文生圖時 `image_tokens` 恆為 0）。詳細的欄位說明和自行核算公式見 [概覽頁「如何檢視每次呼叫的真實 token 數」](/zh-Hant/api-capabilities/gpt-image-2/overview#如何檢視每次呼叫的真實-token-數)。
</Info>


## OpenAPI

````yaml api-reference/gpt-image-2-generate-openapi.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: gpt-image-2 文生图 API
  description: |
    OpenAI 旗舰图像生成模型 `gpt-image-2` — 文生图接口。

    - 任意合法尺寸（1K / 2K / 4K，最大 3840×2160）
    - 画质档位：low / medium / high / auto
    - 输出格式：png（默认）/ jpeg / webp
    - 中文提示词原生支持
    - 单次出图 1 张（n=1）
    - 速度约 120 秒（高画质 4K 接近 2 分钟）
    - **不支持** 透明背景（`background: transparent` 会报错）

    **认证方式**：在请求头中添加 `Authorization: Bearer YOUR_API_KEY`

    **获取 API Key**：访问 [API易控制台](https://api.apiyi.com/token) 创建令牌
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: 主要端点
  - url: https://vip.apiyi.com
    description: 备用端点
security:
  - bearerAuth: []
paths:
  /v1/images/generations:
    post:
      tags:
        - 文生图
      summary: 文生图：根据文本描述生成图片
      description: >
        使用 `gpt-image-2` 模型，根据文本提示词生成图片。


        - 必填：`model`、`prompt`

        -
        可选：`size`、`quality`、`output_format`、`output_compression`、`background`、`moderation`、`n`

        - 自定义尺寸需满足：最大边 ≤ 3840px、两边都是 16 的倍数、长短比 ≤ 3:1、总像素 0.65MP–8.3MP

        - 如需带参考图编辑或多图融合，请使用 [图片编辑接口](/api-capabilities/gpt-image-2/image-edit)
      operationId: generateGptImage2TextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TextToImageRequest'
            example:
              model: gpt-image-2
              prompt: 赛博朋克城市雨夜，霓虹招牌特写，电影画幅
              size: 2048x1152
              quality: high
              output_format: jpeg
              output_compression: 85
      responses:
        '200':
          description: 成功生成图片
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: 参数非法（size 不合约束、传了 input_fidelity 或 background:transparent 等）
        '401':
          description: 未授权 - API Key 无效
        '403':
          description: 内容审核拦截
        '429':
          description: 请求频率超限或额度不足
        '500':
          description: 服务器内部错误
      security:
        - bearerAuth: []
components:
  schemas:
    TextToImageRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: 模型名称，固定为 gpt-image-2
          enum:
            - gpt-image-2
          default: gpt-image-2
        prompt:
          type: string
          description: 提示词，支持中英文。建议把场景描述放在最前面
          example: 赛博朋克城市雨夜，霓虹招牌特写，电影画幅
        size:
          type: string
          description: >
            输出尺寸。预设值：1024x1024 / 1536x1024 / 1024x1536 / 2048x2048 / 2048x1152 /
            3840x2160 / 2160x3840。

            也可使用任意合法自定义尺寸（满足：最大边 ≤ 3840、两边 16 倍数、比例 ≤ 3:1、总像素 0.65–8.3MP）。
          example: 2048x1152
          default: auto
        quality:
          type: string
          description: 画质档位。low（草图/批量）、medium（日常）、high（终稿/精细文字）、auto（默认）
          enum:
            - auto
            - low
            - medium
            - high
          default: auto
        output_format:
          type: string
          description: 输出格式
          enum:
            - png
            - jpeg
            - webp
          default: png
        output_compression:
          type: integer
          description: 输出压缩率（0–100），仅 jpeg/webp 生效
          minimum: 0
          maximum: 100
          example: 85
        background:
          type: string
          description: 背景模式。auto（默认）或 opaque。**不支持** transparent
          enum:
            - auto
            - opaque
          default: auto
        moderation:
          type: string
          description: 审核强度。auto（默认）或 low（低强度）
          enum:
            - auto
            - low
          default: auto
        'n':
          type: integer
          description: 出图数量。本模型仅支持 1
          enum:
            - 1
          default: 1
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          description: Unix 时间戳
          example: 1776832476
        data:
          type: array
          description: 生成结果数组（本模型单次返回 1 张）
          items:
            type: object
            properties:
              b64_json:
                type: string
                description: >-
                  **纯 base64 字符串**（不含 data:image/...;base64, 前缀），客户端需自行 decode
                  写文件或拼前缀
                example: iVBORw0KGgoAAAANSUhEUgAA...
        usage:
          type: object
          description: 本次调用 token 用量（用于按 token 计费核算）
          properties:
            input_tokens:
              type: integer
              example: 42
            output_tokens:
              type: integer
              example: 6240
            total_tokens:
              type: integer
              example: 6282
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key

````