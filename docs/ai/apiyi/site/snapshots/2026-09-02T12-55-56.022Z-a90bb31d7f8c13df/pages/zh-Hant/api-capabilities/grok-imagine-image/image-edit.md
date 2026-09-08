> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 圖片編輯 API 參考

> Grok Imagine 2 圖片編輯 API 參考與線上除錯 — 上傳參考圖（1-4 張）+ 指令進行改圖或多圖融合，必須使用 multipart/form-data

<Info>
  右側的互動式 Playground 支援直接上傳本地圖片。請在 **Authorization** 中填入你的 API Key（格式：`Bearer sk-xxx`），選擇 `image` 檔案並填入 `prompt`、`model` 後一鍵傳送即可。
</Info>

<Warning>
  **🔴 本介面必須使用 `multipart/form-data` 檔案上傳**

  傳送 JSON 到 `/v1/images/edits` 會**固定返回 400**：

  ```text theme={null}
  request Content-Type isn't multipart/form-data
  ```

  **如果你是照著 xAI / 上游廠商的文件接入的，請特別注意**：上游文件寫的是 JSON + 公網圖片 URL 的形式（`{"image": {"type": "image_url", "url": "..."}}`），這套寫法在 API易 閘道上**走不通**，請以本頁為準。

  好訊息是檔案上傳**不需要圖床**——直接傳本地檔案即可，比準備公網 URL 更省事。

  檔案欄位名只能是 **`image`** 或 **`image[]`**；寫成 `images` / `image_file` 會返回 **415**。`prompt` 必填，缺失返回 400。
</Warning>

<Tip>
  **場景說明**：本頁用於「基於一張或多張參考圖改圖 / 多圖融合」。如需純文本生成圖片，請使用 [文生圖介面](/zh-Hant/api-capabilities/grok-imagine-image/text-to-image)。
</Tip>

<Warning>
  **⚠️ 輸出畫幅跟隨「第一張」參考圖，改不了**

  `resolution` 與 `aspect_ratio` 在本端點傳入**不報錯也不生效**——編輯結果的尺寸恆等於**第一張參考圖的尺寸**（輸入 1280×720 就輸出 1280×720，輸入 1024×1024 就輸出 1024×1024）。

  多圖融合時同理：實測把 4 張的順序完全顛倒，輸出畫幅就從 1280×720 變成 1024×1024，**跟著新的第一張走**。

  需要改變輸出畫幅，請**先自行裁剪或縮放第一張參考圖**再上傳。
</Warning>

<Info>
  **多圖融合順序有意義**：`image[]` 可重複傳入 **1–4 張**參考圖（實測上限 4 張，傳 5 張返回 400），**上傳順序就是提示詞中「圖1 / 圖2 / 圖3」的引用依據**。建議在提示詞裡顯式指代，例如「把圖1的主體放進圖2的場景，沿用圖2的畫風」。

  實測 2 / 3 / 4 張遞進驗證：**每多傳一張，輸出就多一個對應主體**，各自的鮮明特徵都會保留，融合是真實生效的。
</Info>

## 程式碼示例

### Python（OpenAI SDK · 單圖編輯）

```python theme={null}
from openai import OpenAI
import urllib.request

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=360.0
)

# SDK 的 images.edit 內部就是 multipart 檔案上傳，直接傳檔案物件即可
resp = client.images.edit(
    model="grok-imagine-image",
    image=open("fox.jpg", "rb"),
    prompt="Change the scarf color to bright RED. Keep everything else exactly the same.",
    n=1
)

urllib.request.urlretrieve(resp.data[0].url, "edited.jpg")
```

### Python（原生 requests · 單圖編輯）

```python theme={null}
import requests
import urllib.request

API_KEY = "sk-your-api-key"

# 關鍵：用 files= 傳檔案（requests 會自動設定 multipart/form-data 及 boundary）
# 千萬不要用 json=，那會發成 application/json 並被閘道 400 拒絕
with open("fox.jpg", "rb") as fp:
    response = requests.post(
        "https://api.apiyi.com/v1/images/edits",
        headers={"Authorization": f"Bearer {API_KEY}"},  # 不要手動設 Content-Type
        data={
            "model": "grok-imagine-image",
            "prompt": "把圍巾改成紅色，其餘部分完全保持不變",
            "n": 1,
            "response_format": "url"
        },
        files={"image": ("fox.jpg", fp, "image/jpeg")},
        timeout=360
    ).json()

urllib.request.urlretrieve(response["data"][0]["url"], "edited.jpg")
```

### Python（多圖融合 · 1–4 張）

```python theme={null}
import requests

API_KEY = "sk-your-api-key"

# 多張參考圖用 image[] 重複欄位傳入，順序即「圖1 / 圖2」
files = [
    ("image[]", ("character.jpg", open("character.jpg", "rb"), "image/jpeg")),
    ("image[]", ("scene.jpg", open("scene.jpg", "rb"), "image/jpeg")),
]

response = requests.post(
    "https://api.apiyi.com/v1/images/edits",
    headers={"Authorization": f"Bearer {API_KEY}"},
    data={
        "model": "grok-imagine-image",
        "prompt": "把圖1的角色放進圖2的場景裡，沿用圖2的畫風和配色",
        "response_format": "url"
    },
    files=files,
    timeout=360
).json()

print(response["data"][0]["url"])
```

### cURL

```bash theme={null}
# 單圖編輯：-F 即 multipart/form-data，@ 字首表示上傳本地檔案
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=grok-imagine-image" \
  -F "prompt=把圍巾改成紅色，其餘部分完全保持不變" \
  -F "n=1" \
  -F "response_format=url" \
  -F "image=@fox.jpg"
```

```bash theme={null}
# 多圖融合：image[] 重複傳入，順序即「圖1 / 圖2」
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=grok-imagine-image-quality" \
  -F "prompt=把圖1的角色放進圖2的場景裡，沿用圖2的畫風" \
  -F "image[]=@character.jpg" \
  -F "image[]=@scene.jpg"
```

### Node.js（原生 fetch + FormData）

```javascript theme={null}
import fs from 'node:fs';

const form = new FormData();
form.append('model', 'grok-imagine-image');
form.append('prompt', '把圍巾改成紅色，其餘部分完全保持不變');
form.append('n', '1');
form.append('response_format', 'url');
// 單圖用 image；多圖融合改用 image[] 重複 append（最多 4 張）
form.append('image', new Blob([fs.readFileSync('./fox.jpg')]), 'fox.jpg');

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    // 不要手動設 Content-Type，交給 FormData 自動帶 boundary
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form,
    signal: AbortSignal.timeout(360000)
});

const data = await resp.json();
const img = await fetch(data.data[0].url);
fs.writeFileSync('edited.jpg', Buffer.from(await img.arrayBuffer()));
```

### 瀏覽器 JavaScript

```javascript theme={null}
// ⚠️ 僅作演示：Key 寫在前端會洩露，生產環境請走後端代理
const fileInput = document.querySelector('#file');   // <input type="file">

const form = new FormData();
form.append('model', 'grok-imagine-image');
form.append('prompt', '把背景換成雪夜的松林，保持人物不變');
form.append('response_format', 'url');
form.append('image', fileInput.files[0]);

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});

const data = await resp.json();
document.querySelector('#preview').src = data.data[0].url;
```

## 引數說明速查

| 引數名                | 型別      | 必填 | 預設    | 說明                                                                      |
| ------------------ | ------- | -- | ----- | ----------------------------------------------------------------------- |
| `model`            | string  | ✅  | —     | `grok-imagine-image`（\$0.02/張）或 `grok-imagine-image-quality`（\$0.045/張） |
| `prompt`           | string  | ✅  | —     | 編輯指令。建議寫明「改什麼」並宣告「其餘保持不變」                                               |
| `image`            | file    | ✅  | —     | 參考圖檔案。多圖融合用 `image[]` 重複傳入，**1–4 張**（傳 5 張返回 400）。**第一張決定輸出畫幅**         |
| `n`                | integer | ❌  | `1`   | 出圖數量 **1–10**，按張計費，與參考圖數量無關                                             |
| `response_format`  | string  | ❌  | `url` | `url` 返回圖片直鏈；`b64_json` 返回純 base64（**不帶** `data:` 字首）                   |
| ~~`resolution`~~   | string  | ❌  | —     | **本端點不生效**，輸出畫幅跟隨輸入圖                                                    |
| ~~`aspect_ratio`~~ | string  | ❌  | —     | **本端點不生效**，輸出畫幅跟隨輸入圖                                                    |

<Info>
  本系列**不支援 mask 局部重繪**。要局部修改請在提示詞裡描述清楚修改範圍，例如「只把圍巾改成紅色，其餘部分完全保持不變」——模型對這類約束遵循度很好。
</Info>

## 編輯效果與提示詞寫法

編輯介面會**保留輸入圖的畫風、構圖、配色與主體身份**，只改提示詞指定的部分。為了拿到穩定結果，建議：

| 寫法                        | 效果                   |
| ------------------------- | -------------------- |
| ✅ `把圍巾改成紅色，其餘部分完全保持不變`    | 只有圍巾變色，畫風/構圖/背景逐畫素保留 |
| ✅ `給這隻貓加一副圓形黑色墨鏡，其餘保持不變`  | 只加墨鏡，原有描邊風格與背景色不變    |
| ✅ `把圖1的角色放進圖2的場景，沿用圖2的畫風` | 雙圖融合，兩張圖的特徵都保留       |
| ⚠️ `讓它更好看一點`              | 指令過於籠統，改動範圍不可控       |

<Tip>
  \*\*顯式宣告「其餘保持不變」\*\*是這個模型上最有效的技巧。多圖融合時則要顯式指代「圖1 / 圖2」，對應 `image[]` 的上傳順序。

  另外**把最重要的主體放第一張**：第一張不僅決定輸出畫幅，實測順序顛倒後次要主體的身份還可能與其它主體發生融合。
</Tip>

## 響應格式

```json theme={null}
{
  "created": 0,
  "data": [
    {
      "url": "https://apac.ossforai.com/2026/08/12/09b026d5-3492-4678-907c-e25972e6c914.jpg"
    }
  ],
  "usage": {
    "prompt_tokens": 1000,
    "total_tokens": 1000
  }
}
```

<Warning>
  **響應欄位陷阱**

  * `data[]` 每項只有 `url` 或 `b64_json` **二選一**，取決於 `response_format`，不會同時出現。
  * **不返回 `revised_prompt`**，解析時不要假設它存在。
  * `b64_json` 是**純 base64，不帶 `data:image/...;base64,` 字首**，可直接 `base64.b64decode`。
  * `created` 恆為 `0`，不能當時間戳用。
  * 輸出尺寸由**輸入圖**決定，不要按請求引數去預判返回圖的寬高。
</Warning>

<Info>
  **`usage` 不能用來核賬**：`prompt_tokens` 恆為 `1000 × n`，是佔位值。編輯與文生圖**同價**，按次固定計費，真實扣費請以 API易 控制台賬單為準。
</Info>


## OpenAPI

````yaml api-reference/grok-imagine-image-edit-openapi.yaml POST /v1/images/edits
openapi: 3.1.0
info:
  title: Grok Imagine 2 图片编辑 API
  description: |
    xAI Grok Imagine 2 图像生成模型 — 图片编辑接口。

    - **请求格式必须为 `multipart/form-data`（文件上传）**，发送 JSON 会返回 400
    - 支持单图编辑与多图融合（1–4 张参考图，`image[]` 字段重复传入）
    - 参考图特征保留度高：画风、构图、配色、主体身份都会被保留，只改提示词指定的部分
    - **输出画幅跟随「第一张」参考图**：`resolution` / `aspect_ratio` 在本端点传了不生效
    - 按次固定计费，与文生图同价

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
      summary: 图片编辑：根据指令编辑参考图或融合多图
      description: |
        使用 Grok Imagine 2 模型，根据文本指令对上传的参考图进行编辑或多图融合。

        - **必须使用 `multipart/form-data`**。发送 `application/json`（即便是上游文档里的
          `{"image": {"type": "image_url", "url": "..."}}` 写法）一律返回
          400 `invalid_image_request`：`request Content-Type isn't multipart/form-data`
        - 文件字段名只能是 `image` 或 `image[]`；写成 `images` / `image_file` 会返回 415
        - `prompt` 必填，缺失返回 400
        - 参考图 1–4 张（实测上限 4，传 5 张返回 400），多图时在 prompt 中用「图1/图2」指代上传顺序
      operationId: editGrokImagineImage
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/GrokImagineEditRequest'
            encoding:
              image:
                contentType: image/png, image/jpeg, image/webp
      responses:
        '200':
          description: 成功生成图片
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: 请求不是 multipart/form-data、缺少 prompt，或内容被审核拦截
        '401':
          description: 未授权 - API Key 无效
        '415':
          description: 文件字段名不受支持（只接受 `image` / `image[]`）
        '429':
          description: 请求频率超限或额度不足
      security:
        - bearerAuth: []
components:
  schemas:
    GrokImagineEditRequest:
      type: object
      required:
        - model
        - prompt
        - image
      properties:
        model:
          type: string
          description: 模型 ID
          enum:
            - grok-imagine-image
            - grok-imagine-image-quality
          default: grok-imagine-image
        prompt:
          type: string
          description: >
            编辑指令。建议明确「改什么」并声明「其余保持不变」，例如

            `Change the scarf color to bright RED. Keep everything else exactly
            the same.`
          example: >-
            Change the scarf color to bright RED. Keep everything else exactly
            the same.
        image:
          type: string
          format: binary
          description: |
            参考图文件。多图融合时用 `image[]` 重复传入（1–4 张），
            顺序即 prompt 中「图1/图2/图3」的引用依据，**第一张还决定输出画幅**。
            实测每多传一张就多一个主体，融合真实生效。格式 png / jpg / webp。
        'n':
          type: integer
          description: 生成图片数量，取值 1–10。与参考图数量无关
          minimum: 1
          maximum: 10
          default: 1
          example: 1
        response_format:
          type: string
          description: '返回格式。`url` 返回图片直链；`b64_json` 返回纯 base64（不带 data: 前缀）'
          enum:
            - url
            - b64_json
          default: url
          example: url
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          description: 创建时间戳。本模型恒返回 0，不可用于计时
          example: 0
        data:
          type: array
          description: 图片结果数组，长度等于请求的 `n`
          items:
            type: object
            properties:
              url:
                type: string
                description: 图片直链，`response_format=url` 时返回
                example: >-
                  https://apac.ossforai.com/2026/08/12/09b026d5-3492-4678-907c-e25972e6c914.jpg
              b64_json:
                type: string
                description: '纯 base64 图片数据，`response_format=b64_json` 时返回（不带 data: 前缀）'
        usage:
          type: object
          description: '**占位值，不能用于核账。** `prompt_tokens` 恒为 `1000 × n`'
          properties:
            prompt_tokens:
              type: integer
              example: 1000
            total_tokens:
              type: integer
              example: 1000
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key

````