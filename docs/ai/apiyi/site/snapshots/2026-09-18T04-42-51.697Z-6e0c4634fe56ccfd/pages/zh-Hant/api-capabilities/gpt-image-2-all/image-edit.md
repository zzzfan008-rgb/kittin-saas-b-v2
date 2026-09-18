> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 圖片編輯 API 參考

> gpt-image-2-all 圖片編輯 API 參考與線上除錯 — 上傳參考圖 + 指令進行單圖改圖或多圖融合

<Info>
  右側的互動式 Playground 支援直接上傳本地圖片。請在 **Authorization** 中填入你的 API Key（格式：`Bearer sk-xxx`），選擇圖片與填入 `prompt`、`model` 後一鍵傳送即可。
</Info>

<Tip>
  **場景說明**：本頁用於「基於一張或多張參考圖改圖 / 融合生成」。請求為 `multipart/form-data` 格式。如需純文本生成圖片，請使用 [文生圖介面](/zh-Hant/api-capabilities/gpt-image-2-all/text-to-image)。
</Tip>

<Warning>
  **🖥️ 瀏覽器 Playground 限制（預設 b64\_json 模式）**

  本端點**預設 `response_format: "b64_json"`**，響應會包含數 MB 的 base64 字串，瀏覽器 Playground **可能彈出** `請求時發生錯誤: unable to complete request` ——**實際請求已經成功**，只是瀏覽器無法顯示這麼長的 base64。

  **推薦做法**：

  * 只想在 Playground 裡看圖：**顯式傳 `"response_format": "url"`**，響應是單條 R2 連結，瀏覽器渲染正常。
  * 想要 base64 或要傳超大參考圖：**複製下方"程式碼示例"到本地執行**，程式碼會自動處理上傳與解碼。
</Warning>

<Warning>
  **📎 多圖融合順序有意義**

  `image` 欄位可重複傳入多張參考圖，**順序將作為 prompt 中「圖1/圖2/圖3」的引用依據**。建議在 prompt 中顯式指代，例如：

  > 把圖1的人物放進圖2的場景，參考圖3的畫風

  推薦單張 **≤ 10MB**，格式 `png` / `jpg` / `webp`，過大的圖可能觸發閘道限制。
</Warning>

<Tip>
  **🎯 保形改圖小技巧**：本端點的輸出尺寸**跟隨 prompt 裡點名要修改的那張圖的比例**——多圖場景下**不一定是第一張**。

  例如 prompt 寫"**修改圖2**，把圖2 的衣服和帽子改成圖1 裡的樣子"，那圖2 是 1:1，則輸出也是 1:1（即便圖1 是橫版 16:9）。

  對換裝、加帽子、修圖等保形場景特別好用。**`size` 欄位在本模型不生效**（傳入靜默忽略，要嚴格鎖尺寸請用 [`gpt-image-2-vip`](/zh-Hant/api-capabilities/gpt-image-2-vip/image-edit)）；prompt 沒明確指代時由模型自行判斷。
</Tip>

## 程式碼示例

### Python

**單圖編輯**：

```python theme={null}
import requests

API_KEY = "sk-your-api-key"

with open("photo.png", "rb") as f:
    response = requests.post(
        "https://api.apiyi.com/v1/images/edits",
        headers={"Authorization": f"Bearer {API_KEY}"},
        data={
            "model": "gpt-image-2.5-all",
            "prompt": "把背景換成海邊黃昏",
            "response_format": "url"
        },
        files=[
            ("image", ("photo.png", f, "image/png"))
        ],
        timeout=300  # 保守值，吸收長尾 + 圖片上傳/下載耗時
    ).json()

print(response["data"][0]["url"])
```

**多圖融合**：

```python theme={null}
import requests

with open("ref1.png", "rb") as f1, \
     open("ref2.png", "rb") as f2, \
     open("ref3.png", "rb") as f3:
    response = requests.post(
        "https://api.apiyi.com/v1/images/edits",
        headers={"Authorization": "Bearer sk-your-api-key"},
        data={
            "model": "gpt-image-2.5-all",
            "prompt": "把圖1的人物放進圖2的場景，參考圖3的畫風",
            "response_format": "b64_json"
        },
        files=[
            ("image", ("ref1.png", f1, "image/png")),
            ("image", ("ref2.png", f2, "image/png")),
            ("image", ("ref3.png", f3, "image/png"))
        ],
        timeout=300  # 保守值，吸收長尾 + 圖片上傳/下載耗時
    ).json()

# 實測（2026-07）b64_json 為純 base64（無 data: 字首）；歷史版本曾含字首，做個檢測最穩
import base64
b64 = response["data"][0]["b64_json"]
if b64.startswith("data:"):
    b64 = b64.split(",", 1)[1]
with open("edited.png", "wb") as f:
    f.write(base64.b64decode(b64))
```

### cURL

**單圖編輯**：

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2.5-all" \
  -F "prompt=把背景換成海邊黃昏" \
  -F "response_format=url" \
  -F "image=@./photo.png"
```

**多圖融合**：

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2.5-all" \
  -F "prompt=把圖1的人物放進圖2的場景，參考圖3的畫風" \
  -F "response_format=b64_json" \
  -F "image=@./ref1.png" \
  -F "image=@./ref2.png" \
  -F "image=@./ref3.png"
```

### Node.js（原生 fetch + FormData）

```javascript theme={null}
import fs from 'node:fs';
import { Agent, setGlobalDispatcher } from 'undici';

// 圖片編輯要上傳參考圖、又要等 MB 級響應體，而 undici 預設建連超時只有 10 秒，
// 且不受下面 AbortSignal.timeout 控制（兩者是不同層），必須單獨放寬
setGlobalDispatcher(new Agent({
  connect: { timeout: 30_000 },
  headersTimeout: 300_000,
  bodyTimeout: 300_000,
}));

const form = new FormData();
form.append('model', 'gpt-image-2.5-all');
form.append('prompt', '把背景換成太空');
form.append('response_format', 'url');
form.append(
  'image',
  new Blob([fs.readFileSync('./photo.png')]),
  'photo.png'
);

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    signal: AbortSignal.timeout(300_000),   // 總超時，與上面三個是不同層
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});
const data = await resp.json();
console.log(data.data[0].url);
```

<Tip>
  上面的 `undici` 需要單獨安裝（`npm i undici`）——它雖然是內建 `fetch` 的底層實現，但沒有以模組名對外暴露；裝出來的這份呼叫 `setGlobalDispatcher` 會同時影響內建 `fetch`。

  `maxRetries`、`connectTimeout` 與「總超時」分屬不同層，配錯層是 Node 側最常見的踩坑；連線被重置、`UND_ERR_CONNECT_TIMEOUT`、掛代理導致大響應體收不全等情況，排查方法見[圖片 API 連線中斷排查](/zh-Hant/api-capabilities/image-connection-drops)。
</Tip>

### 瀏覽器 JavaScript（File 物件）

```javascript theme={null}
// <input type="file" id="fileInput" multiple>
const files = document.getElementById('fileInput').files;
const form = new FormData();
form.append('model', 'gpt-image-2.5-all');
form.append('prompt', '把這幾張圖融合成一張海報');
form.append('response_format', 'url');
for (const f of files) form.append('image', f);

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});
const { data } = await resp.json();
document.getElementById('result').src = data[0].url;
```

## 引數說明速查

| 欄位                | 型別   | 必填 | 說明                                                                                                                                                 |
| ----------------- | ---- | -- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`           | text | 是  | `gpt-image-2.5-all` 或 `gpt-image-2-all`（同價同行為）                                                                                                     |
| `prompt`          | text | 是  | 改圖/融合的自然語言描述                                                                                                                                       |
| `image`           | file | 是  | 參考圖，可重複多次（陣列欄位）                                                                                                                                    |
| `size`            | text | 否  | **本欄位不生效，傳入會被靜默忽略**。輸出尺寸**跟隨 prompt 裡點名要修改的那張圖的比例**（多圖下不一定是第一張）。要嚴格鎖尺寸請用 [`gpt-image-2-vip`](/zh-Hant/api-capabilities/gpt-image-2-vip/image-edit) |
| `response_format` | text | 否  | `b64_json`（預設）或 `url`                                                                                                                              |

<Tip>
  **多輪迭代**：把上一次的輸出圖片作為下一次的 `image` 輸入，配合新的編輯指令，可逐步精調畫面效果。
</Tip>

## 響應格式

與文生圖介面一致：**`data[0]` 中只會出現 `url` 或 `b64_json` 之一**（取決於 `response_format`），不會兩者都返回。本端點**預設返回 `b64_json`**。

**`b64_json` 模式**（預設）：

```json theme={null}
{
  "data": [
    {
      "b64_json": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
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

**`url` 模式**（需顯式 `"response_format": "url"`）：

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
  2026-07 實測 `b64_json` 欄位為**純 base64（不含 `data:` 字首）**，需解碼或自行拼接字首後使用；**歷史版本曾直接帶字首**。請先做 `startsWith('data:')` 檢測再處理，相容兩種形態。
</Warning>


## OpenAPI

````yaml api-reference/gpt-image-2-all-edit-openapi.yaml POST /v1/images/edits
openapi: 3.1.0
info:
  title: gpt-image-2-all 图片编辑 API
  description: >
    GPT 图像生成官逆模型 `gpt-image-2-all` — 图片编辑接口。


    - 支持单图改图与多图融合（同名 `image` 字段可重复传，多图按上传顺序排序）

    - 请求格式为 `multipart/form-data`

    - 在 prompt 中可用「图1/图2/图3」指代上传顺序

    - **`size` 字段不生效**（传任何值都不会报错，但会被静默忽略）；输出尺寸**跟随 prompt
    里点名要修改的那张图的比例**（多图场景下不一定是第一张），保形改图友好。例如 prompt 写"修改图2"，输出比例就跟图2 一致；prompt
    没明确指代时由模型自行判断。要严格锁尺寸请用 `gpt-image-2-vip`

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
  /v1/images/edits:
    post:
      tags:
        - 图片编辑
      summary: 图片编辑：根据指令编辑或融合参考图
      description: >
        使用 `gpt-image-2-all` 模型，根据文本指令对输入图片进行编辑或多图融合。


        - 必须提供至少一张输入图片（`image` 字段）

        - 多张参考图：**重复传同名 `image` 字段**，例如 `-F image=@a.png -F
        image=@b.png`（按上传顺序对应 prompt 中的「图1/图2/...」）

        - 单张图片推荐 ≤ 10MB，格式 png/jpg/webp

        - 如需纯文本生成图片，请使用 [文生图接口](/api-capabilities/gpt-image-2-all/text-to-image)
      operationId: editGptImage2AllImage
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/EditImageRequest'
            encoding:
              image:
                contentType: image/png, image/jpeg, image/webp
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
    EditImageRequest:
      type: object
      required:
        - model
        - prompt
        - image
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
          description: 编辑/融合指令。多图场景可用「图1/图2/图3」指代 image 字段的上传顺序
          example: 把图1的人物放进图2的场景，参考图3的画风
        image:
          type: array
          description: >-
            参考图。**单图直接传一次，多图重复传同名 `image` 字段**（例如 `-F image=@a.png -F
            image=@b.png`），按上传顺序对应 prompt 中的「图1/图2/...」。推荐单张 ≤ 10MB，格式
            png/jpg/webp。
          items:
            type: string
            format: binary
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
        图片编辑响应。`data[0]` 中**只会出现 `url` 或 `b64_json` 之一**（取决于
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