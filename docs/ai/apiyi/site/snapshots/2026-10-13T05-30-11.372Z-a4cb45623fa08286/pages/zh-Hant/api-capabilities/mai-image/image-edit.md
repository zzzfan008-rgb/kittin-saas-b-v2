> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 圖片編輯 API 參考

> MAI-Image 2.6 圖片編輯 API 參考與線上除錯 — 上傳 1–5 張參考圖 + 指令改圖或多圖融合，必須使用 multipart/form-data 檔案上傳，參考圖張數不影響價格

<Info>
  右側的互動式 Playground 支援直接上傳本地圖片。請在 **Authorization** 中填入你的 API Key（格式：`Bearer sk-xxx`），選擇 `image` 檔案（可新增多張）並填入 `prompt`、`model` 後一鍵傳送即可。
</Info>

<Warning>
  **🔴 本介面只接受 `multipart/form-data` 檔案上傳**

  傳送 JSON 到 `/v1/images/edits`（`image` 填 URL、data URI 或裸 base64）會返回 400：

  ```text theme={null}
  request Content-Type isn't multipart/form-data
  ```

  **不支援圖片 URL 入參**。手上只有 URL 時，請先在服務端下載成檔案再上傳。檔案上傳不需要圖床，直接傳本地檔案即可。
</Warning>

<Tip>
  **場景說明**：本頁用於「基於參考圖改圖」，支援單圖編輯與 1–5 張多圖融合。如需純文本生成圖片，請使用 [文生圖介面](/zh-Hant/api-capabilities/mai-image/text-to-image)。
</Tip>

<Info>
  **🖼️ 支援 1–5 張參考圖（2026-10-07 起）**

  * **寫法**：重複 `image[]` 欄位，每個欄位放一張圖；OpenAI SDK 直接傳列表 `client.images.edit(image=[f1, f2, ...])`。`image` 同名重複也可以
  * **順序**：按上傳順序依次是圖1、圖2……，提示詞裡可以直接說「把圖2裡的狐狸放進圖1」
  * **價格**：按次計費，**傳 1 張還是 5 張都是同一個價**
  * **格式**：JPEG、PNG、WebP；GIF 等其他格式返回 400
  * **超過 5 張**返回 400 `at most 5 reference images are accepted for <model>`
</Info>

<Warning>
  **不要用 `image` + `image2` 這類編號欄位名**：返回 200，但**只有第一張圖生效**，第二張被丟棄；`image1` + `image2` 則返回 500 `image is required`。多張圖請一律用重複的 `image[]`。
</Warning>

<Info>
  **引數紅線與文生圖相同**：不要傳 `response_format`、`seed`、`negative_prompt`（返回 400）。返回值固定為 `data[0].b64_json`（PNG）。
</Info>

## 程式碼示例

### Python（OpenAI SDK · 單圖編輯）

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=180.0
)

# SDK 的 images.edit 內部就是 multipart 檔案上傳；不要傳 response_format
resp = client.images.edit(
    model="MAI-Image-2.6-Flash",
    image=open("teaset.jpg", "rb"),
    prompt="Change the teapot to a deep cobalt blue glaze, keep everything else identical"
)

with open("edited.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### Python（OpenAI SDK · 多圖融合）

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    timeout=180.0
)

# image 傳列表即可，1–5 張；SDK 會把每張圖作為一個 image[] 欄位上傳
# 按上傳順序依次是圖1、圖2……，價格與單圖相同
resp = client.images.edit(
    model="MAI-Image-2.6-Flash",
    image=[open("teaset.jpg", "rb"), open("fox.jpg", "rb")],
    prompt="把圖2裡的狐狸（保留它的全部外觀細節）放進圖1的場景裡，坐在茶具旁邊，圖1其餘部分保持不變"
)

with open("fused.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### Python（原生 requests · 單圖編輯）

```python theme={null}
import base64
import os
import requests

# 用 files= 傳檔案，requests 會自動設定 multipart/form-data 及 boundary
# 不要用 json=，也不要手動設 Content-Type
with open("teaset.jpg", "rb") as fp:
    response = requests.post(
        "https://api.apiyi.com/v1/images/edits",
        headers={"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"},
        data={
            "model": "MAI-Image-2.6",
            "prompt": "把茶壺改成深鈷藍釉，其餘部分完全保持不變"
        },
        files={"image": ("teaset.jpg", fp, "image/jpeg")},
        timeout=180
    )
response.raise_for_status()

with open("edited.png", "wb") as f:
    f.write(base64.b64decode(response.json()["data"][0]["b64_json"]))
```

多圖時 `files` 改用元組列表，每張圖一個 `image[]`（dict 不能放重複的鍵）：

```python theme={null}
files = [
    ("image[]", ("teaset.jpg", open("teaset.jpg", "rb"), "image/jpeg")),
    ("image[]", ("fox.jpg", open("fox.jpg", "rb"), "image/jpeg")),
]
```

### cURL

```bash theme={null}
# 單圖編輯：-F 即 multipart/form-data，@ 字首表示上傳本地檔案
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=MAI-Image-2.6-Flash" \
  -F "prompt=把茶壺改成深鈷藍釉，其餘部分完全保持不變" \
  -F "image=@teaset.jpg" \
  | python3 -c "import sys,json,base64; open('edited.png','wb').write(base64.b64decode(json.load(sys.stdin)['data'][0]['b64_json']))"
```

```bash theme={null}
# 編輯時改畫幅為 1536×1024（與原圖比例不同會重新構圖）
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=MAI-Image-2.6" \
  -F "prompt=把這張茶具圖改成擺在木桌上的生活場景，自然光，寫實攝影" \
  -F "width=1536" \
  -F "height=1024" \
  -F "image=@teaset.jpg"
```

```bash theme={null}
# 多圖融合：重複 image[] 欄位，1–5 張，按順序為圖1、圖2……
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=MAI-Image-2.6-Flash" \
  -F "prompt=把圖2裡的狐狸（保留它的全部外觀細節）放進圖1的場景裡，坐在茶具旁邊，圖1其餘部分保持不變" \
  -F "image[]=@teaset.jpg" \
  -F "image[]=@fox.jpg" \
  | python3 -c "import sys,json,base64; open('fused.png','wb').write(base64.b64decode(json.load(sys.stdin)['data'][0]['b64_json']))"
```

### Node.js（原生 fetch + FormData）

```javascript theme={null}
import fs from 'node:fs';

const form = new FormData();
form.append('model', 'MAI-Image-2.6-Flash');
form.append('prompt', '把背景換成雪夜的松林，保持人物不變');
form.append('image', new Blob([fs.readFileSync('./photo.jpg')]), 'photo.jpg');
// 多圖融合：改成多次 form.append('image[]', ...)，每次一張，最多 5 張

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    // 不要手動設 Content-Type，交給 FormData 自動帶 boundary
    headers: { 'Authorization': `Bearer ${process.env.APIYI_API_KEY}` },
    body: form,
    signal: AbortSignal.timeout(120000)
});

const data = await resp.json();
fs.writeFileSync('edited.png', Buffer.from(data.data[0].b64_json, 'base64'));
```

## 引數說明速查

| 引數名 | 型別 | 必填 | 預設 | 說明 |
| - | - | - | - | - |
| `model` | string | ✅ | — | `MAI-Image-2.6`（\$0.12/張）或 `MAI-Image-2.6-Flash`（\$0.06/張），**大小寫敏感** |
| `prompt` | string | ✅ | — | 編輯指令。建議寫明「改什麼」並宣告「其餘保持不變」 |
| `image` / `image[]` | file | ✅ | — | 參考圖檔案，**1–5 張**。單圖用 `image`；多圖重複 `image[]` 欄位，按上傳順序為圖1…圖N。支援 JPEG / PNG / WebP，張數不影響價格 |
| `width` / `height` | integer | ❌ | 跟隨原圖比例 | 指定輸出尺寸，規則同文生圖；與原圖比例不同時會**重新構圖** |
| `n` | integer | ❌ | `1` | 出圖張數，**本端點有效**，按張計費 |
| ~~`mask`~~ | — | — | — | **不支援**，傳入返回 400 `<model> does not support mask edits` |
| ~~`response_format`~~ / ~~`seed`~~ / ~~`negative_prompt`~~ | — | — | — | **傳入返回 400** |

<Info>
  **不傳尺寸時的輸出**：按原圖比例貼合到 16 的倍數網格，例如 1344×756 的輸入輸出 1360×768；多圖時以**圖1**的比例為準。只想改局部、不想動構圖時，不要傳 `width` / `height`。
</Info>

## 編輯效果與提示詞寫法

編輯介面會**保留原圖的構圖、配色與細節**，只改提示詞指定的部分：

<Frame>
  <img src="https://mintcdn.com/apiyillc/_zXMTnA1u6gpoDyM/images/mai-image-edit-teaset.jpg?fit=max&auto=format&n=_zXMTnA1u6gpoDyM&q=85&s=c86dc86c5aadf0173e19102433c01f49" alt="MAI-Image-2.6-Flash 編輯示例：茶壺從米白改為鈷藍，其餘不變" width="1048" height="532" data-path="images/mai-image-edit-teaset.jpg" />
</Frame>

| 寫法 | 效果 |
| - | - |
| ✅ `把茶壺改成深鈷藍釉，其餘部分完全保持不變` | 只有茶壺變色，尺寸標註、其它物件逐畫素保留 |
| ✅ `把這張照片改成水彩畫風格，構圖不變` | 風格整體重繪，構圖保持 |
| ⚠️ `讓它更好看一點` | 指令過於籠統，改動範圍不可控 |

<Tip>
  \*\*顯式宣告「其餘保持不變」\*\*是這個模型上最有效的技巧，能最大限度保留原圖。
</Tip>

### 多圖融合

把圖1當作底圖，其餘參考圖裡的物體按提示詞放進去。下例一次傳入 5 張（茶具圖 + 狐狸 + 橡皮鴨 + 鬧鐘 + 仙人掌），提示詞為「把圖2的狐狸、圖3的黃色橡皮鴨、圖4的紅色復古鬧鐘、圖5的仙人掌盆栽都擺進圖1的茶桌場景裡，每個物體保留原有外觀，圖1其餘部分保持不變」：

<Frame>
  <img src="https://mintcdn.com/apiyillc/M34PNfQX341lt5W7/images/mai-image-multi-ref-5.jpg?fit=max&auto=format&n=M34PNfQX341lt5W7&q=85&s=0c18a285c65fa48646505b109e3600c7" alt="MAI-Image-2.6-Flash 多圖融合示例：5 張參考圖輸入，4 個物體都被放進茶具圖裡，原圖其餘部分不變" width="1200" height="1229" data-path="images/mai-image-multi-ref-5.jpg" />
</Frame>

| 寫法 | 效果 |
| - | - |
| ✅ `把圖2裡的狐狸放進圖1的場景裡，圖1其餘部分保持不變` | 用「圖N」指代參考圖，按上傳順序對應，最穩定 |
| ✅ 點名每張圖裡的物體：`圖3的黃色橡皮鴨、圖4的紅色鬧鐘` | 張數多時逐個點名，避免漏放 |
| ⚠️ `把這幾張圖合成一張` | 沒指明底圖和主體，構圖不可控 |

## 響應格式

```json theme={null}
{
  "created": 1791000788,
  "data": [
    {
      "b64_json": "iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAIAAADwf7zU..."
    }
  ],
  "usage": {
    "prompt_tokens": 1000,
    "total_tokens": 1000,
    "input_tokens": 1000,
    "output_tokens": 0
  }
}
```

<Warning>
  **響應欄位說明**

  * `b64_json` 是**純 base64，不帶 `data:` 字首**，解碼後為 PNG。
  * `n > 1` 時 `data` 陣列有多項，別隻取 `data[0]`。
  * 不返回 `url` 與 `revised_prompt`。
</Warning>

<Info>
  **`usage` 不能用來核賬**：是佔位值（`prompt_tokens` 恆為 `1000 × 張數`）。編輯與文生圖**同價**，按張固定計費，**參考圖張數不影響價格**，真實扣費請以 API易 控制台賬單為準。
</Info>


## OpenAPI

````yaml api-reference/mai-image-edit-openapi.yaml POST /v1/images/edits
openapi: 3.1.0
info:
  title: MAI-Image 2.6 图片编辑 API
  description: >
    微软 MAI-Image 2.6 图像生成模型 — 图片编辑接口。


    - **请求格式必须为 `multipart/form-data`（文件上传）**，发送 JSON 或图片 URL 会返回 400

    - 支持 **1–5 张参考图**：单图用 `image`，多图重复 `image[]` 字段（OpenAI SDK
    传列表），按上传顺序为图1…图N；**不要用 `image2` 这类编号字段名**（第二张会被丢弃）

    - 不支持 mask；不要传 `response_format` / `seed` / `negative_prompt`

    - 按次固定计费，与文生图同价，参考图张数不影响价格；`n` 在本端点有效、按张计费


    **认证方式**：在请求头中添加 `Authorization: Bearer YOUR_API_KEY`


    **获取 API Key**：访问 [API易控制台](https://api.apiyi.com/token) 创建令牌
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: 主要端点
security:
  - bearerAuth: []
paths:
  /v1/images/edits:
    post:
      tags:
        - 图片编辑
      summary: 图片编辑：根据指令编辑参考图（1–5 张）
      description: >
        使用 MAI-Image 2.6 模型，根据文本指令对上传的 1–5 张参考图进行编辑或融合。


        - **必须使用 `multipart/form-data`**，发送 `application/json` 返回
          400：`request Content-Type isn't multipart/form-data`
        - **多图融合**：重复 `image[]` 字段，最多 5 张，超过返回 400；`image` + `image2` 只用第一张；带
        `mask` 返回 400

        - 参考图只接受 JPEG / PNG / WebP

        - 不传 `width` / `height` 时按原图比例输出；传入与原图比例不同的尺寸会重新构图
      operationId: editMaiImage
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/MaiImageEditRequest'
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
          description: 请求不是 multipart/form-data、参考图超过 5 张或格式不支持、带了 mask、参数非法，或内容被审核拦截
        '401':
          description: 未授权 - API Key 无效
        '429':
          description: 请求频率超限或额度不足
        '500':
          description: 请求中没有图片文件字段，或用了 `image1` + `image2` 这类编号字段名（`image is required`）
      security:
        - bearerAuth: []
components:
  schemas:
    MaiImageEditRequest:
      type: object
      required:
        - model
        - prompt
        - image
      properties:
        model:
          type: string
          description: 模型 ID（大小写敏感）
          enum:
            - MAI-Image-2.6-Flash
            - MAI-Image-2.6
          default: MAI-Image-2.6-Flash
        prompt:
          type: string
          description: 编辑指令。建议明确「改什么」并声明「其余保持不变」
          example: 把茶壶改成深钴蓝釉，其余部分完全保持不变
        image:
          type: array
          items:
            type: string
            format: binary
          minItems: 1
          maxItems: 5
          description: 参考图文件，1–5 张，按上传顺序为图1…图N。格式 png / jpg / webp。代码调用时多图请重复 `image[]` 字段
        width:
          type: integer
          description: 可选，输出宽度。规则同文生图：每维 ≥ 768、宽×高 ≤ 2,359,296，须与 `height` 成对
          minimum: 768
        height:
          type: integer
          description: 可选，输出高度，规则同 `width`
          minimum: 768
        'n':
          type: integer
          description: 出图张数，本端点有效，按张计费
          minimum: 1
          default: 1
          example: 1
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          description: 创建时间戳
          example: 1791000788
        data:
          type: array
          description: 图片结果数组，长度等于 `n`
          items:
            type: object
            properties:
              b64_json:
                type: string
                description: '纯 base64 图片数据（PNG，不带 data: 前缀）'
        usage:
          type: object
          description: '**占位值，不能用于核账。** `prompt_tokens` 恒为 `1000 × 张数`'
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

This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.