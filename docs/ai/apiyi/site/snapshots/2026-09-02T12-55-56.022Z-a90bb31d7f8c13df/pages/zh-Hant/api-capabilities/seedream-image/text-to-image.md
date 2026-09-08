> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 文生圖 API 參考

> Seedream 文生圖 API 參考與線上除錯 — 純文本提示詞出圖，支援 1K/2K/3K/4K 與精確畫素，三版本統一端點

<Info>
  右側的互動式 Playground 支援直接線上除錯。請在 **Authorization** 中填入你的 API Key（格式：`Bearer sk-xxx`），輸入 prompt、選擇 model / size 後一鍵傳送即可。
</Info>

<Tip>
  **場景說明**：本頁用於「純文本提示詞生成圖片」——不傳 `image` 欄位。如需基於參考圖編輯、多圖融合或批次序列生成，請使用 [圖片編輯介面](/zh-Hant/api-capabilities/seedream-image/image-edit)（同一端點，多傳 `image` 引數）。
</Tip>

<Warning>
  **🖥️ 瀏覽器 Playground 限制（僅 b64\_json 模式）**

  預設 `response_format: "url"` 模式下 Playground 工作正常（響應只是一個 BytePlus TOS 臨時連結）。如果你切換成 `response_format: "b64_json"`，響應會包含數 MB 的 base64 字串，瀏覽器 Playground **可能彈出** `請求時發生錯誤: unable to complete request` ——**實際請求已經成功**，只是瀏覽器無法顯示這麼長的 base64。

  **推薦做法**：

  * 只想看圖：**保持預設 `url` 模式**，Playground 會直接返回連結（注意 24 小時內下載到自己的儲存）。
  * 真的需要 b64\_json：**複製下方"程式碼示例"到本地執行**，程式碼會自動解碼並把圖片儲存為本地檔案。
</Warning>

<Warning>
  **⚠️ 各版本支援的解析度檔位不同**

  * `seedream-5-0-pro-260628` —— 預設 `1K` / `2K` + 精確 WxH 總畫素 ≤ 4.19M（16:9 最長邊可達 2720×1530，實測可用；無 3K/4K 預設；不支援 `sequential_image_generation` / `stream`，傳入即 400；約 2 分鐘出圖）
  * `seedream-5-0-260128` —— 僅 `2K` / `3K`（無 4K）
  * `seedream-4-5-251128` —— `2K` / `4K`
  * `seedream-4-0-250828` —— `1K` / `2K` / `4K`

  **不支援的尺寸會直接返回 400**。精確畫素總畫素需 ∈ \[1280×720, 4096×4096]，寬高比 ∈ \[1/16, 16]。
</Warning>

<Info>
  圖片 API 全部為**同步呼叫**：沒有非同步任務 ID，客戶端斷開連線結果即丟失、但請求仍會計費。請為本模型設定足夠大的 timeout，詳見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices)。
</Info>

## 程式碼示例

### Python（OpenAI SDK 直連）

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="seedream-5-0-260128",
    prompt="A modern tech product launch poster with bold typography, sleek smartphone on gradient background, text: 'Innovation 2026', ultra detailed, professional",
    size="2K",
    response_format="url",
    extra_body={
        "output_format": "png",
        "watermark": False,
    }
)

print(resp.data[0].url)
```

### Python（原生 requests）

```python theme={null}
import requests

API_KEY = "sk-your-api-key"

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "model": "seedream-5-0-260128",
        "prompt": "A serene Japanese garden with cherry blossoms, koi pond, traditional wooden bridge, golden hour, ultra detailed",
        "size": "2K",
        "response_format": "url",
        "watermark": False
    },
    timeout=60  # 單圖約 15 秒，4K + hd 可達 30-60 秒
).json()

print(response["data"][0]["url"])
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "seedream-5-0-260128",
    "prompt": "A futuristic cityscape at night with neon lights and flying vehicles, cyberpunk style, high detail",
    "size": "2K",
    "response_format": "url",
    "watermark": false
  }'
```

### Node.js（原生 fetch）

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'seedream-5-0-260128',
        prompt: 'Minimalist line-art logo of a cat, monochrome, vector style',
        size: '2K',
        response_format: 'url',
        output_format: 'png',
        watermark: false
    })
});

const { data } = await resp.json();
console.log(data[0].url);
```

### 瀏覽器 JavaScript

```javascript theme={null}
{/* 僅作演示，生產請走後端代理避免 Key 洩露 */}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'seedream-5-0-260128',
        prompt: 'Watercolor northern lights over snowy mountains',
        size: '2K'
    })
});

const { data } = await resp.json();
document.getElementById('img').src = data[0].url;
```

## 引數說明速查

| 引數                | 型別      | 必填 | 預設      | 說明                                                                                                                                                      |
| ----------------- | ------- | -- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`           | string  | 是  | —       | `seedream-5-0-260128` / `seedream-4-5-251128` / `seedream-4-0-250828` / `seedream-5-0-pro-260628`（專業版，\$0.12/次）                                         |
| `prompt`          | string  | 是  | —       | 提示詞，支援中英文，建議詳細描述場景、風格、光線                                                                                                                                |
| `size`            | string  | 否  | `2K`    | 預設檔位（各版本不同）或精確畫素 `WxH`                                                                                                                                  |
| `response_format` | string  | 否  | `url`   | `url` 返回圖片連結；`b64_json` 返回純 base64 字串                                                                                                                   |
| `output_format`   | string  | 否  | `jpeg`  | 5.0 支援 `png` / `jpeg`；4.5 / 4.0 僅 `jpeg`（OpenAI SDK 中通過 `extra_body` 傳入）                                                                                |
| `n`               | integer | —  | —       | ⚠️ **上游不支援此引數**：傳入會被靜默忽略，仍只返回 1 張、按 1 張計費。多圖輸出請用 `sequential_image_generation`（按實際張數計費），見 [圖片編輯介面](/zh-Hant/api-capabilities/seedream-image/image-edit) |
| `seed`            | integer | —  | —       | ⚠️ 官方僅 seedream-3-0-t2i 支援該引數，當前 4.x / 5.x 系列傳入不生效                                                                                                      |
| `watermark`       | boolean | 否  | 見各版本預設  | 是否輸出水印（建議顯式 `false` 商用）                                                                                                                                 |
| `stream`          | boolean | 否  | `false` | 流式輸出，適合長 prompt + 高解析度                                                                                                                                  |

<Tip>
  詳細的引數約束、可選值、示例請檢視右側 Playground 中的欄位說明，所有 enum 欄位均支援下拉選擇。**編輯/多圖相關引數（`image`、`sequential_image_generation` 等）見 [圖片編輯介面](/zh-Hant/api-capabilities/seedream-image/image-edit)**。
</Tip>

## 響應格式

```json theme={null}
{
  "model": "seedream-5-0-260128",
  "created": 1768518000,
  "data": [
    {
      "url": "https://ark-content-generation-v2-ap-southeast-1.tos-ap-southeast-1.bytepluses.com/seedream-5-0/.../image.png",
      "size": "2048x2048"
    }
  ],
  "usage": {
    "generated_images": 1,
    "output_tokens": 6240,
    "total_tokens": 6240
  }
}
```

<Warning>
  **⚠️ 響應欄位陷阱**

  * `response_format=url` 模式下，`data[].url` 是 **BytePlus TOS 臨時簽名 URL**，有時效性（通常 24 小時內有效），生產場景建議拿到後立即下載到自己的儲存
  * `response_format=b64_json` 模式下，`data[].b64_json` 是 **純 base64 字串**，**不含** `data:image/...;base64,` 字首，客戶端需 `base64.b64decode` 寫檔案，或瀏覽器渲染時自行拼字首
  * `data[].size` 欄位反映**實際輸出尺寸**，可能與請求的 `size` 略有差異（模型按比例約束）
</Warning>

<Info>
  `usage` 欄位反映本次實際計費的張數（`generated_images`）。Seedream 按張計費，`output_tokens` / `total_tokens` 僅用於效能觀測，不參與賬單核算。
</Info>


## OpenAPI

````yaml api-reference/seedream-image-generate-openapi.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: Seedream 文生图 API
  description: >
    BytePlus 火山方舟 Seedream 系列图像生成模型 — 文生图接口（不传 `image` 字段）。


    - 活跃版本统一接入：`seedream-5-0-260128` / `seedream-4-5-251128` /
    `seedream-4-0-250828` / `seedream-5-0-pro-260628`（专业版，按次 \$0.12，约 2 分钟出图）

    - 各版本支持的分辨率档位不同（5.0：2K/3K；4.5：2K/4K；4.0：1K/2K/4K；5.0-pro：1K/2K + WxH 总像素 ≤
    4.19M，16:9 最长边约 2720）

    - 输出格式：5.0 / 5.0-pro 支持 png / jpeg；4.5 / 4.0 仅 jpeg

    - 5.0-pro 不支持 `sequential_image_generation` / `stream`，传入即 400

    - 速度约 15 秒/张，4K + hd 可达 30-60 秒

    - 默认 500 张/分钟（RPM）

    - 编辑、多图融合、批量序列生成请见
    [图片编辑接口](/api-capabilities/seedream-image/image-edit)（同端点不同参数）


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
      summary: 文生图：根据文本提示词生成图片
      description: >
        使用 Seedream 系列模型根据文本提示词生成图片。


        - 必填：`model`、`prompt`

        - 可选：`size`、`response_format`、`output_format`、`watermark`、`stream`

        - 注意：OpenAI 的 `n` 参数上游不支持（传入被静默忽略，仍返回 1 张）；多图输出请用
        `sequential_image_generation`

        - 各版本支持的分辨率档位不同，详见
        [总览页技术规格表](/api-capabilities/seedream-image/overview#技术规格)

        - 如需基于参考图编辑或多图融合，请使用
        [图片编辑接口](/api-capabilities/seedream-image/image-edit)，同一端点 + `image` /
        `sequential_image_generation` 参数
      operationId: generateSeedreamTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SeedreamGenerateRequest'
            example:
              model: seedream-5-0-260128
              prompt: >-
                A modern tech product launch poster, sleek smartphone on
                gradient background, text: 'Innovation 2026', ultra detailed,
                professional
              size: 2K
              response_format: url
              output_format: png
              watermark: false
      responses:
        '200':
          description: 成功生成图片
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SeedreamImageResponse'
        '400':
          description: 参数非法（size 不在该版本支持档位、超出像素范围、宽高比超限等）
        '401':
          description: 未授权 - API Key 无效
        '403':
          description: 内容审核拦截
        '429':
          description: 触发 500 RPM 限流或余额不足
        '500':
          description: 服务器内部错误
      security:
        - bearerAuth: []
components:
  schemas:
    SeedreamGenerateRequest:
      type: object
      required:
        - model
        - prompt
      properties:
        model:
          type: string
          description: 模型 ID
          enum:
            - seedream-5-0-260128
            - seedream-5-0-lite-260128
            - seedream-4-5-251128
            - seedream-4-0-250828
            - seedream-5-0-pro-260628
          default: seedream-5-0-260128
        prompt:
          type: string
          description: 提示词，支持中英文。建议详细描述场景、风格、光线
          example: >-
            A serene Japanese garden with cherry blossoms, koi pond, traditional
            bridge, golden hour, ultra detailed
        size:
          type: string
          description: |
            输出尺寸。预设档位（各版本支持不同）：
            - `1K`（约 1024×1024）：仅 4.0
            - `2K`（约 2048×2048）：5.0 / 4.5 / 4.0
            - `3K`（约 3072×3072）：仅 5.0
            - `4K`（约 4096×4096）：4.5 / 4.0

            或精确像素 `WxH`，总像素 ∈ \[1280×720, 4096×4096\]，宽高比 ∈ \[1/16, 16\]
          example: 2K
          default: 2K
        response_format:
          type: string
          description: '返回格式。url 返回临时签名链接（24 小时有效）；b64_json 返回纯 base64 字符串（不带 data: 前缀）'
          enum:
            - url
            - b64_json
          default: url
        output_format:
          type: string
          description: 输出格式。5.0 支持 png / jpeg；4.5 / 4.0 仅 jpeg
          enum:
            - png
            - jpeg
          default: jpeg
        seed:
          type: integer
          description: 随机种子。注意：官方仅 seedream-3-0-t2i 支持，当前 4.x / 5.x 系列传入不生效
          example: 42
        watermark:
          type: boolean
          description: 是否输出带 BytePlus 水印的图片。商用场景建议显式 false
          default: false
        stream:
          type: boolean
          description: 是否启用流式输出。长 prompt + 高分辨率场景建议开启
          default: false
    SeedreamImageResponse:
      type: object
      properties:
        model:
          type: string
          description: 本次实际调用的模型 ID
          example: seedream-5-0-260128
        created:
          type: integer
          description: Unix 时间戳
          example: 1768518000
        data:
          type: array
          description: 生成结果数组（文生图通常 1 个元素）
          items:
            type: object
            properties:
              url:
                type: string
                description: 图片 URL（response_format=url 时返回，临时签名 24 小时有效）
                example: >-
                  https://ark-content-generation-v2-ap-southeast-1.tos-ap-southeast-1.bytepluses.com/seedream-5-0/.../image.png
              b64_json:
                type: string
                description: >-
                  纯 base64 字符串（response_format=b64_json 时返回，**不含**
                  data:image/...;base64, 前缀）
              size:
                type: string
                description: 实际输出尺寸，可能与请求略有差异（按比例约束修正）
                example: 2048x2048
        usage:
          type: object
          description: 本次调用计费张数与 token 用量
          properties:
            generated_images:
              type: integer
              description: 实际计费张数（按张计费）
              example: 1
            output_tokens:
              type: integer
              example: 6240
            total_tokens:
              type: integer
              example: 6240
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key

````