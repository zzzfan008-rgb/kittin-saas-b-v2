> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 文生圖 API 參考

> gpt-image-2-all 文生圖 API 參考與線上除錯 — 輸入文本描述生成圖片，$0.03/張

<Info>
  右側的互動式 Playground 支援直接線上除錯。請在 **Authorization** 中填入你的 API Key（格式：`Bearer sk-xxx`），輸入 prompt 後一鍵傳送即可。
</Info>

<Tip>
  **場景說明**：本頁用於「文本生成圖片」。只需輸入提示詞即可，無需上傳任何圖片。如需根據現有圖片做編輯或融合，請使用 [圖片編輯介面](/zh-Hant/api-capabilities/gpt-image-2-all/image-edit)。
</Tip>

<Warning>
  **🖥️ 瀏覽器 Playground 限制（預設 b64\_json 模式）**

  本端點**預設 `response_format: "b64_json"`**，響應會包含數 MB 的 base64 字串，瀏覽器 Playground **可能彈出** `請求時發生錯誤: unable to complete request` ——**實際請求已經成功**，只是瀏覽器無法顯示這麼長的 base64。

  **推薦做法**：

  * 只想在 Playground 裡看圖：**顯式傳 `"response_format": "url"`**，響應是單條 R2 連結，瀏覽器渲染正常。
  * 想要 base64：**複製下方"程式碼示例"到本地執行**，程式碼會自動解碼並把圖片儲存為本地檔案。
</Warning>

<Info>
  圖片 API 全部為**同步呼叫**：沒有非同步任務 ID，客戶端斷開連線結果即丟失、但請求仍會計費。請為本模型設定足夠大的 timeout，詳見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices)。
</Info>

<Warning>
  **⚠️ 引數支援情況**

  * **`size`**：**欄位不生效**——傳 `auto` 或具體尺寸都不會報錯，但會被服務端**靜默忽略**。最終尺寸完全由 prompt 決定：
    * prompt 寫了尺寸/比例（如"橫版 16:9"）→ 模型會遵循 prompt
    * prompt 沒寫尺寸 → 同一 prompt 多次呼叫會**抽卡式**出現多樣化尺寸，適合看多種構圖變體
    * 需要嚴格鎖尺寸請改用 [`gpt-image-2-vip`](/zh-Hant/api-capabilities/gpt-image-2-vip/text-to-image)（支援 `auto` + 30 檔鎖定）
  * **`n` / `quality` / `aspect_ratio`**：❌ 不接受，傳入可能觸發引數校驗錯誤。

  尺寸與比例請直接寫進 `prompt`，例如：

  * `橫版 16:9 電影畫幅，黃昏時的海邊老燈塔`
  * `豎版 9:16 手機桌布，賽博朋克城市雨夜`
  * `1024×1024 方形 LOGO，極簡貓咪線條`

  **建議把尺寸描述放在 prompt 最前面**，模型遵循度更高。
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
        "model": "gpt-image-2.5-all",
        "prompt": "橫版 16:9 日落海邊的老燈塔，電影畫幅，寫實風格",
        "response_format": "url"
    },
    timeout=300  # 保守值，吸收長尾 + 圖片下載耗時
).json()

image_url = response["data"][0]["url"]
print(image_url)
```

**b64\_json 模式（返回 base64 圖片資料）**：

```python theme={null}
import base64
import requests

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={"Authorization": "Bearer sk-your-api-key"},
    json={
        "model": "gpt-image-2.5-all",
        "prompt": "1024x1024 方形 LOGO，極簡貓咪線條",
        "response_format": "b64_json"
    },
    timeout=300  # 保守值，吸收長尾 + 圖片下載耗時
).json()

# 實測（2026-07）b64_json 為純 base64（無 data: 字首）；歷史版本曾含字首，做個檢測最穩
b64 = response["data"][0]["b64_json"]
if b64.startswith("data:"):
    b64 = b64.split(",", 1)[1]
with open("output.png", "wb") as f:
    f.write(base64.b64decode(b64))
```

### cURL

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-2.5-all",
    "prompt": "橫版 16:9 電影畫幅，黃昏時的海邊老燈塔",
    "response_format": "url"
  }'
```

### Node.js

```javascript theme={null}
import { Agent, setGlobalDispatcher } from "undici";
import { writeFile } from "node:fs/promises";

const API_KEY = "sk-your-api-key";

// 圖片介面是「長時間靜默 + MB 級響應體」，而 undici 的預設建連超時只有 10 秒，
// 且不受下面 AbortSignal.timeout 控制（兩者是不同層），必須單獨放寬
setGlobalDispatcher(new Agent({
  connect: { timeout: 30_000 },
  headersTimeout: 300_000,
  bodyTimeout: 300_000,
}));

const response = await fetch(
  "https://api.apiyi.com/v1/images/generations",
  {
    method: "POST",
    signal: AbortSignal.timeout(300_000),   // 總超時，與上面三個是不同層
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-image-2.5-all",
      prompt: "1024x1024 方形 LOGO，極簡貓咪線條",
      response_format: "b64_json"
    })
  }
);

const data = await response.json();
// 實測為純 base64（無 data: 字首）；歷史版本曾自帶字首，做個檢測最穩
let b64 = data.data[0].b64_json;
if (b64.startsWith("data:")) b64 = b64.slice(b64.indexOf(",") + 1);
await writeFile("output.png", Buffer.from(b64, "base64"));
```

<Tip>
  上面的 `undici` 需要單獨安裝（`npm i undici`）——它雖然是內建 `fetch` 的底層實現，但沒有以模組名對外暴露；裝出來的這份呼叫 `setGlobalDispatcher` 會同時影響內建 `fetch`。

  `maxRetries`、`connectTimeout` 與「總超時」分屬不同層，配錯層是 Node 側最常見的踩坑；連線被重置、`UND_ERR_CONNECT_TIMEOUT`、掛代理導致大響應體收不全等情況，排查方法見[圖片 API 連線中斷排查](/zh-Hant/api-capabilities/image-connection-drops)。
</Tip>

### 瀏覽器 JavaScript（Fetch）

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'gpt-image-2.5-all',
        prompt: '豎版 9:16 手機桌布，賽博朋克城市雨夜',
        response_format: 'b64_json'
    })
});
const { data } = await resp.json();
let b64 = data[0].b64_json;
if (!b64.startsWith('data:')) b64 = `data:image/png;base64,${b64}`;
document.getElementById('result').src = b64;
```

## 引數說明速查

| 引數                | 型別     | 必填 | 說明                                                    |
| ----------------- | ------ | -- | ----------------------------------------------------- |
| `model`           | string | 是  | `gpt-image-2.5-all` 或 `gpt-image-2-all`（同價同行為）        |
| `prompt`          | string | 是  | 提示詞，尺寸/比例/風格請寫在此處（**唯一控制尺寸的方式**）                      |
| `response_format` | string | 否  | `b64_json`（預設，純 base64）或 `url`（返回 R2 CDN 連結）；建議始終顯式傳值 |

<Note>
  本模型**不支援 `size` 入參**——即便傳入也會被靜默忽略，不會報錯；如需用 `size` 欄位鎖定 30 檔尺寸，請改用 [`gpt-image-2-vip`](/zh-Hant/api-capabilities/gpt-image-2-vip/text-to-image)。
</Note>

<Tip>
  詳細的引數約束和可選值請檢視右側 Playground 中的欄位說明，`response_format` 欄位支援下拉選擇。
</Tip>

## 響應格式

**`data[0]` 中只會出現 `url` 或 `b64_json` 之一**（取決於 `response_format`），不會兩者都返回。本端點**預設返回 `b64_json`**。

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

**`url` 模式**（需顯式 `"response_format": "url"`，R2 CDN 全球加速）：

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


## OpenAPI

````yaml api-reference/gpt-image-2-all-generate-openapi.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: gpt-image-2-all 文生图 API
  description: >
    GPT 图像生成官逆模型 `gpt-image-2-all` — 文生图接口。


    - 按次计费，$0.03/张

    - 约 30–60 秒出图，支持中文提示词

    - 尺寸/比例/风格请在 `prompt` 中描述；**`size` 字段不生效**（请求里传 `size=auto`
    或具体值都不报错，但会被静默忽略；最终尺寸完全由 prompt 决定，同一 prompt 多次调用会出多样化尺寸，适合"抽卡"对比）；`n` /
    `quality` 也不支持。要严格锁尺寸请用 `gpt-image-2-vip`

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
      summary: 文生图：根据文本描述生成图片
      description: |
        使用 `gpt-image-2-all` 模型，根据文本提示词生成图片。

        - 仅需要输入 `model`、`prompt`
        - 尺寸/比例请直接写进 prompt（如：横版 16:9 电影画幅）
        - 如需编辑或多图融合，请使用 [图片编辑接口](/api-capabilities/gpt-image-2-all/image-edit)
      operationId: generateGptImage2AllTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TextToImageRequest'
            example:
              model: gpt-image-2.5-all
              prompt: 横版 16:9 电影画幅，黄昏时的海边老灯塔
              response_format: b64_json
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
          description: 模型名称：gpt-image-2.5-all 或 gpt-image-2-all（同一 ChatGPT 网页版线路，同价同行为）
          enum:
            - gpt-image-2.5-all
            - gpt-image-2-all
          default: gpt-image-2.5-all
        prompt:
          type: string
          description: 提示词。尺寸/比例/风格请写在此处，例如：横版 16:9 电影画幅，黄昏时的海边老灯塔
          example: 横版 16:9 电影画幅，黄昏时的海边老灯塔
        response_format:
          type: string
          description: 响应格式。b64_json 返回已含 data URL 前缀的 base64 字符串（默认）；url 返回 R2 CDN 链接
          enum:
            - b64_json
            - url
          default: b64_json
    ImageResponse:
      type: object
      description: >
        图片生成响应。`data[0]` 中**只会出现 `url` 或 `b64_json` 之一**（取决于
        `response_format`，本端点默认 `b64_json`），不会两者都返回。
      properties:
        data:
          type: array
          description: 生成结果数组（本模型单次返回 1 张）
          items:
            type: object
            properties:
              url:
                type: string
                description: R2 CDN 加速链接（response_format=url 时返回）
              b64_json:
                type: string
                description: >-
                  Base64 编码的 data URL（response_format=b64_json 时返回，已含
                  data:image/png;base64, 前缀）
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