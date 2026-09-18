> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 文生圖 API 參考

> gpt-image-2-vip 文生圖 API 參考與線上除錯 — 輸入文本描述 + size 鎖定輸出尺寸生成圖片，$0.03/張統一價

<Info>
  右側的互動式 Playground 支援直接線上除錯。請在 **Authorization** 中填入你的 API Key（格式：`Bearer sk-xxx`），輸入 `prompt` 與 `size` 後一鍵傳送即可。
</Info>

<Tip>
  **場景說明**：本頁用於「文本生成圖片」。只需輸入提示詞與 `size` 即可，無需上傳任何圖片。如需根據現有圖片做編輯或融合，請使用 [圖片編輯介面](/zh-Hant/api-capabilities/gpt-image-2-vip/image-edit)。

  **與 `gpt-image-2-all` 的區別**：呼叫結構完全一致，只多一個 `size` 欄位；不需要鎖尺寸、追求出圖速度時改用 [`gpt-image-2-all`](/zh-Hant/api-capabilities/gpt-image-2-all/text-to-image) 即可。
</Tip>

<Warning>
  **🖥️ 瀏覽器 Playground 限制**

  本端點**預設返回 base64 字串（`b64_json`）**，體積可達數 MB，瀏覽器 Playground **可能彈出** `請求時發生錯誤: unable to complete request` ——**實際請求已經成功**，只是瀏覽器無法顯示這麼長的 base64。

  **推薦做法**：**複製下方"程式碼示例"到本地執行**，程式碼會自動解碼並把圖片儲存為本地檔案。
</Warning>

<Info>
  圖片 API 全部為**同步呼叫**：沒有非同步任務 ID，客戶端斷開連線結果即丟失、但請求仍會計費。請為本模型設定足夠大的 timeout，詳見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices)。
</Info>

<Warning>
  **⚠️ 關鍵引數說明**

  * **`size`**：可傳 `auto` 讓模型自動決定尺寸（vip 在同一提示詞下尺寸相對**收斂/固定**），或從 30 檔常見尺寸裡選（10 比例 × 1K Fast / 2K Recommended / 4K Detail，詳見 [概覽頁 size 完整表](/zh-Hant/api-capabilities/gpt-image-2-vip/overview#支援的-size30-檔完整對照表)）嚴格鎖尺寸。**寫法用半形小寫 `x`**，例如 `2048x1360`、`3840x2160`，不要用 `×` 或大寫 `X`。
  * **`quality`**：❌ 不接受，**不要傳**。
  * **`n`**：❌ 不接受，單次僅返回 1 張圖。**傳 n=3 會按 0.09 \$ 扣費但只返回 1 張**，請把 `n` 欄位從請求裡去掉。
  * **`aspect_ratio`**：❌ 不接受。比例直接由 `size` 決定。
  * **`response_format`**：不傳預設返回 base64（純 base64 無字首，2026-07 實測）；傳 `"url"` 可返回圖片 URL。**強依賴 URL 輸出**的業務建議把令牌分組切到 `image2_OSS`，穩定輸出 URL、不降級為 base64。
</Warning>

## 程式碼示例

### Python

```python theme={null}
import requests

API_KEY = "sk-your-api-key"

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "model": "gpt-image-2.5-vip",
        "prompt": "黃昏時的海邊老燈塔，電影畫幅，寫實風格",
        "size": "2048x1152",         # 16:9 2K Recommended
        "response_format": "url"     # 預設返回 base64，讀 url 欄位需顯式傳
    },
    timeout=300  # 保守值，吸收長尾 + 圖片下載耗時
).json()

image_url = response["data"][0]["url"]
print(image_url)
```

**4K Detail 檔示例（桌布 / 印刷）**：

```python theme={null}
import requests

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={"Authorization": "Bearer sk-your-api-key"},
    json={
        "model": "gpt-image-2.5-vip",
        "prompt": "桌面桌布，賽博朋克城市夜景，霓虹招牌，雨後倒影",
        "size": "3840x2160"          # 16:9 4K Detail
    },
    timeout=300
).json()

# 實測（2026-07）b64_json 為純 base64（無 data: 字首）；歷史版本曾含字首，做個檢測最穩
import base64
b64 = response["data"][0]["b64_json"]
if b64.startswith("data:"):
    b64 = b64.split(",", 1)[1]
with open("wallpaper.png", "wb") as f:
    f.write(base64.b64decode(b64))
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2.5-vip",
    "prompt": "白色陶瓷馬克杯放在灰色桌面上的產品圖，柔和自然光",
    "size": "2048x1360"
  }'
```

### Node.js

```javascript theme={null}
const API_KEY = "sk-your-api-key";

const response = await fetch(
  "https://api.apiyi.com/v1/images/generations",
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-image-2.5-vip",
      prompt: "1:1 方形 LOGO，極簡貓咪線條",
      size: "2048x2048"        // 1:1 2K Recommended
    })
  }
);

const data = await response.json();
// 實測為純 base64（無 data: 字首），渲染前需拼接；歷史版本曾自帶字首，做個檢測最穩
let b64 = data.data[0].b64_json;
if (!b64.startsWith("data:")) b64 = `data:image/png;base64,${b64}`;
document.getElementById("result").src = b64;
```

### OpenAI SDK（Python，推薦）

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="gpt-image-2.5-vip",
    prompt="水墨山水，國畫風格，縱向構圖",
    size="1536x2048",        # 3:4 2K Portrait
)
print(resp.data[0].url)
```

## 引數說明速查

| 引數       | 型別     | 必填       | 說明                                                                                                           |
| -------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------ |
| `model`  | string | 是        | `gpt-image-2.5-vip`（= `gpt-image-2.5-sunburst-vip`）/ `gpt-image-2.5-flare-vip` / 上一代 `gpt-image-2-vip`，同價同調用 |
| `prompt` | string | 是        | 提示詞，描述畫面內容、風格、光線等                                                                                            |
| `size`   | string | **強烈建議** | 輸出尺寸：`auto`（模型自動決定，**vip 在同一提示詞下尺寸相對固定**）或 30 檔之一；寫法 `寬x高`（半形小寫 `x`）；省略時等同 `auto`                            |

<Tip>
  **size 速查**：常用挑這幾個就夠：

  * 電商主圖：`2048x1360` (3:2 2K) / `2048x2048` (1:1 2K)
  * 海報豎圖：`1536x2048` (3:4 2K) / `2480x3312` (3:4 4K)
  * 影片封面：`2048x1152` (16:9 2K) / `3840x2160` (16:9 4K)
  * 故事/手機桌布：`1152x2048` (9:16 2K) / `2160x3840` (9:16 4K)

  完整 30 檔表見 [概覽頁](/zh-Hant/api-capabilities/gpt-image-2-vip/overview#支援的-size30-檔完整對照表)。
</Tip>

## 響應格式

**預設返回 base64**（`data[0].b64_json`，純 base64 無字首，2026-07 實測）。如需 **圖片 URL**：顯式傳 `response_format: "url"` 即可；**強依賴 URL 輸出**的業務建議把令牌分組切到 **`image2_OSS`**，穩定輸出 URL、不降級為 base64。`data[0]` 中只會出現 `url` 或 `b64_json` 之一，不會兩者都返回。

**`b64_json` 模式**（預設）：

```json theme={null}
{
  "data": [
    {
      "b64_json": "iVBORw0KGgoAAAANSUhEUgAA..."
    }
  ],
  "created": 1778037127,
  "usage": {
    "input_tokens": 98,
    "output_tokens": 1185,
    "total_tokens": 1283
  }
}
```

**`url` 模式**（顯式傳 `response_format: "url"`；強依賴 URL 建議用 `image2_OSS` 分組，R2 CDN 全球加速）：

```json theme={null}
{
  "data": [
    {
      "url": "https://r2cdn.copilotbase.com/r2cdn2/0e82148a-bec0-4b42-bbca-117c6b42581b.png"
    }
  ],
  "created": 1778037331,
  "usage": {
    "input_tokens": 30,
    "output_tokens": 2074,
    "total_tokens": 2104
  }
}
```

<Warning>
  **相容性提示**：2026-07 實測 `b64_json` 欄位為**純 base64（不含 `data:` 字首）**，需解碼寫檔案或自行拼接字首後渲染；**歷史版本曾直接帶字首**。請在程式碼裡做 `startsWith('data:')` 檢測後再處理，相容兩種形態。
</Warning>

## 相關資源

<CardGroup cols={2}>
  <Card title="模型概覽（含完整 size 表）" icon="sparkles" href="/zh-Hant/api-capabilities/gpt-image-2-vip/overview">
    30 檔 size 完整對照表、定價、技術規格
  </Card>

  <Card title="圖片編輯 API" icon="image" href="/zh-Hant/api-capabilities/gpt-image-2-vip/image-edit">
    `/v1/images/edits` 多圖融合與改圖
  </Card>

  <Card title="姐妹模型 gpt-image-2-all" icon="copy" href="/zh-Hant/api-capabilities/gpt-image-2-all/text-to-image">
    不需要鎖尺寸時呼叫方式一致，出圖更快（約 30–60s）
  </Card>
</CardGroup>


## OpenAPI

````yaml api-reference/gpt-image-2-vip-generate-openapi.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: gpt-image-2-vip 文生图 API
  description: >
    GPT 图像生成 Adobe 官逆模型（Firefly 线路） `gpt-image-2-vip` — 文生图接口。


    - 按次计费，$0.03/张（所有 size 统一价，4K 不加价）

    - 支持 30 档常见 size（10 比例 × 1K Fast / 2K Recommended / 4K Detail）

    - 约 90–150 秒出图，支持中文提示词

    - `quality` 实测可传（2.5 两款六档全开、`gpt-image-2-vip` 到 `high`，属渠道行为不承诺）；不支持 n /
    aspect_ratio

    - **默认返回 base64 (`b64_json`)，可切换为 R2 CDN 链接 (`url`)**；响应中 `data[0]` 只会出现
    `url` **或** `b64_json` 之一，不会两者都返回


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
      summary: 文生图：根据文本描述 + size 生成指定尺寸图片
      description: |
        使用 `gpt-image-2-vip` 模型，根据文本提示词生成图片，并通过 `size` 字段锁定输出尺寸。

        - 必填 `model`、`prompt`，强烈建议传 `size`
        - `size` 必须为 30 档之一（详见模型概览页）
        - `quality` 可选（见字段说明），不要传 `n`
        - 如需编辑或多图融合，请使用 [图片编辑接口](/api-capabilities/gpt-image-2-vip/image-edit)
      operationId: generateGptImage2VipTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TextToImageRequest'
            example:
              model: gpt-image-2.5-vip
              prompt: 黄昏时的海边老灯塔，电影画幅，写实风格
              size: 2048x1152
      responses:
        '200':
          description: 成功生成图片。响应默认返回 base64（`data[0].b64_json`），不会同时返回 `url`。
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
              example:
                data:
                  - b64_json: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
                created: 1778037127
                usage:
                  input_tokens: 98
                  output_tokens: 1185
                  total_tokens: 1283
        '400':
          description: size 取值不在 30 档内或格式错误
        '401':
          description: 未授权 - API Key 无效
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
          description: >-
            模型名称：gpt-image-2.5-vip（= sunburst-vip）/ gpt-image-2.5-flare-vip /
            gpt-image-2-vip，同价同调用
          enum:
            - gpt-image-2.5-vip
            - gpt-image-2.5-sunburst-vip
            - gpt-image-2.5-flare-vip
            - gpt-image-2-vip
          default: gpt-image-2.5-vip
        prompt:
          type: string
          description: 提示词，描述画面内容、风格、光线等
          example: 黄昏时的海边老灯塔，电影画幅，写实风格
        quality:
          type: string
          description: >
            画质档位（实测可用，属渠道行为不承诺，以实际返回为准）。2.5 两款（`gpt-image-2.5-vip` /
            `gpt-image-2.5-sunburst-vip` /
            `gpt-image-2.5-flare-vip`）六档全开；`gpt-image-2-vip` 只到 `high`，传 `xhigh`
            / `max` 会被拒。

            同名档位不等价：2.5 的 `high` 只等于 `gpt-image-2-vip` 的 `medium`，2.5 的 `max`
            才等于它的 `high`。按次 $0.03 不随档位变，但耗时随档位上升。
          enum:
            - auto
            - low
            - medium
            - high
            - xhigh
            - max
          example: high
        size:
          type: string
          description: >
            输出尺寸。可传 `auto` 让模型自动决定（vip 在同一提示词下倾向收敛到一个相对固定的尺寸），或从 30 档常见尺寸里选（10
            比例 × 1K Fast / 2K Recommended / 4K Detail）严格锁尺寸。

            写法：`宽x高`（半角小写 x），如 `2048x1360`、`3840x2160`。所有档位统一价 $0.03/张。
          enum:
            - auto
            - 1280x1280
            - 848x1280
            - 1280x848
            - 960x1280
            - 1280x960
            - 1024x1280
            - 1280x1024
            - 720x1280
            - 1280x720
            - 1280x544
            - 2048x2048
            - 1360x2048
            - 2048x1360
            - 1536x2048
            - 2048x1536
            - 1632x2048
            - 2048x1632
            - 1152x2048
            - 2048x1152
            - 2048x864
            - 2880x2880
            - 2336x3520
            - 3520x2336
            - 2480x3312
            - 3312x2480
            - 2560x3216
            - 3216x2560
            - 2160x3840
            - 3840x2160
            - 3840x1632
          example: 2048x1152
    ImageResponse:
      type: object
      description: >
        图片生成响应。**默认返回 base64**（`data[0].b64_json`）；如需 `url`，请改用 `image2_OSS`
        分组并传 `response_format=url`。`data[0]` 中**只会出现 `url` 或 `b64_json`
        之一**，不会两者都返回。
      properties:
        data:
          type: array
          description: 生成结果数组（本模型单次返回 1 张）
          items:
            type: object
            properties:
              url:
                type: string
                description: R2 CDN 加速链接（使用 image2_OSS 分组并传 response_format=url 时返回）
              b64_json:
                type: string
                description: Base64 编码的 data URL（默认返回，已含 data:image/png;base64, 前缀）
        created:
          type: integer
          description: 创建时间戳（Unix 秒）
        usage:
          type: object
          description: Token 用量统计
          properties:
            input_tokens:
              type: integer
              description: 输入 token 数
            output_tokens:
              type: integer
              description: 输出 token 数（含图片像素折算）
            total_tokens:
              type: integer
              description: 总 token 数
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key

````