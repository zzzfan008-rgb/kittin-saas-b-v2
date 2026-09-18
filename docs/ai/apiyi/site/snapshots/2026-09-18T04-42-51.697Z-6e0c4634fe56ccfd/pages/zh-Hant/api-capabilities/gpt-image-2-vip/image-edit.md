> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 圖片編輯 API 參考

> gpt-image-2-vip 圖片編輯 API 參考與線上除錯 — 上傳參考圖 + 指令進行單圖改圖或多圖融合，可用 size 鎖定輸出尺寸

<Info>
  右側的互動式 Playground 支援直接上傳本地圖片。請在 **Authorization** 中填入你的 API Key（格式：`Bearer sk-xxx`），選擇圖片與填入 `prompt`、`model`、`size` 後一鍵傳送即可。
</Info>

<Tip>
  **場景說明**：本頁用於「基於一張或多張參考圖改圖 / 融合生成」。請求為 `multipart/form-data` 格式。如需純文本生成圖片，請使用 [文生圖介面](/zh-Hant/api-capabilities/gpt-image-2-vip/text-to-image)。

  **與 `gpt-image-2-all` 的區別**：呼叫結構完全一致，只多一個 `size` 欄位；不需要鎖尺寸、追求出圖速度時改用 [`gpt-image-2-all`](/zh-Hant/api-capabilities/gpt-image-2-all/image-edit)。
</Tip>

<Warning>
  **🖥️ 瀏覽器 Playground 限制**

  本端點**預設返回 base64 字串（`b64_json`）**，體積可達數 MB，瀏覽器 Playground **可能彈出** `請求時發生錯誤: unable to complete request` ——**實際請求已經成功**，只是瀏覽器無法顯示這麼長的 base64。

  **推薦做法**：想要 base64 或要傳超大參考圖時，**複製下方"程式碼示例"到本地執行**，程式碼會自動處理上傳與解碼。
</Warning>

<Warning>
  **📎 多圖融合順序有意義**

  `image` 欄位可重複傳入多張參考圖，**順序將作為 prompt 中「圖1/圖2/圖3」的引用依據**。建議在 prompt 中顯式指代，例如：

  > 把圖1的人物放進圖2的場景，參考圖3的畫風

  推薦單張 **≤ 10MB**，格式 `png` / `jpg` / `webp`，過大的圖可能觸發閘道限制。
</Warning>

<Tip>
  **🎯 保形改圖小技巧**：傳 `size=auto`（或不傳 `size`）時，輸出會**跟隨 prompt 裡點名要修改的那張圖的尺寸比例**——多圖場景下**不一定是第一張**。

  例如 prompt 寫"**修改圖2**，把圖2 的衣服和帽子改成圖1 裡的樣子"，那圖2 是 1:1，則輸出也是 1:1（即便圖1 是橫版 16:9）。

  對換裝、加帽子、修圖等保形場景特別好用。如果 prompt 沒明確指代要改哪張，模型會自行判斷；需要切換到 30 檔鎖定尺寸時再顯式傳 `size`。
</Tip>

<Warning>
  **⚠️ 關鍵引數說明**

  * **`size`**：**改圖建議傳 `auto`（或不傳）**——模型會**根據 prompt 裡點名要修改的那張圖的尺寸比例**輸出，多圖場景下不一定是第一張。例如 prompt 寫"修改圖2，把圖2 的衣服換成圖1 的樣子"，輸出比例就跟圖2 一致；prompt 沒明確指代時由模型自行判斷。需要強制改變尺寸時，從 30 檔常見尺寸裡選；寫法用半形小寫 `x`，如 `2048x1360`、`3840x2160`。完整表見 [概覽頁](/zh-Hant/api-capabilities/gpt-image-2-vip/overview#支援的-size30-檔完整對照表)。
  * **`quality`**：❌ 不接受，**不要傳**。
  * **`n`**：❌ 不接受，單次僅返回 1 張圖。
  * **`response_format`**：不傳預設返回 base64（純 base64 無字首，2026-07 實測）；傳 `"url"` 可返回圖片 URL。**強依賴 URL 輸出**的業務建議把令牌分組切到 `image2_OSS`，穩定輸出 URL、不降級為 base64。
</Warning>

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
            "model": "gpt-image-2.5-vip",
            "prompt": "把背景換成海邊黃昏",
            "size": "2048x1360"          # 3:2 2K Recommended
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
            "model": "gpt-image-2.5-vip",
            "prompt": "把圖1的人物放進圖2的場景，參考圖3的畫風",
            "size": "2048x2048"          # 1:1 2K Recommended
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
  -F "model=gpt-image-2.5-vip" \
  -F "prompt=把背景換成海邊黃昏" \
  -F "size=2048x1360" \
  -F "image=@./photo.png"
```

**多圖融合**：

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2.5-vip" \
  -F "prompt=把圖1的人物放進圖2的場景，參考圖3的畫風" \
  -F "size=2048x2048" \
  -F "image=@./ref1.png" \
  -F "image=@./ref2.png" \
  -F "image=@./ref3.png"
```

### Node.js（原生 fetch + FormData）

```javascript theme={null}
import fs from 'node:fs';

const form = new FormData();
form.append('model', 'gpt-image-2.5-vip');
form.append('prompt', '把背景換成太空');
form.append('size', '2048x1360');
form.append(
  'image',
  new Blob([fs.readFileSync('./photo.png')]),
  'photo.png'
);

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});
const data = await resp.json();
console.log(data.data[0].url);
```

### 瀏覽器 JavaScript（File 物件）

```javascript theme={null}
// <input type="file" id="fileInput" multiple>
const files = document.getElementById('fileInput').files;
const form = new FormData();
form.append('model', 'gpt-image-2.5-vip');
form.append('prompt', '把這幾張圖融合成一張海報');
form.append('size', '2048x2048');
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

| 欄位       | 型別   | 必填 | 說明                                                                                                                            |
| -------- | ---- | -- | ----------------------------------------------------------------------------------------------------------------------------- |
| `model`  | text | 是  | `gpt-image-2.5-vip`（= `gpt-image-2.5-sunburst-vip`）/ `gpt-image-2.5-flare-vip` / 上一代 `gpt-image-2-vip`，同價同調用；`mask` 三款都只做整圖重繪 |
| `prompt` | text | 是  | 改圖/融合的自然語言描述                                                                                                                  |
| `image`  | file | 是  | 參考圖，可重複多次（陣列欄位）                                                                                                               |
| `size`   | text | 否  | 輸出尺寸：`auto`（預設，**跟隨 prompt 裡點名要修改的那張圖的比例**，多圖下不一定是第一張）或 30 檔之一；寫法 `寬x高`（半形小寫 `x`）                                             |

<Tip>
  **多輪迭代**：把上一次的輸出圖片作為下一次的 `image` 輸入，配合新的編輯指令，可逐步精調畫面效果。每一輪都可以獨立指定 `size`。
</Tip>

## 響應格式

與文生圖介面一致：**預設返回 base64**（`data[0].b64_json`，純 base64 無字首，2026-07 實測）。如需 **圖片 URL**：顯式傳 `response_format: "url"` 即可；**強依賴 URL 輸出**的業務建議把令牌分組切到 **`image2_OSS`**，穩定輸出 URL、不降級為 base64。`data[0]` 中只會出現 `url` 或 `b64_json` 之一，不會兩者都返回。

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

**`url` 模式**（顯式傳 `response_format: "url"`；強依賴 URL 建議用 `image2_OSS` 分組）：

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

## 相關資源

<CardGroup cols={2}>
  <Card title="模型概覽（含完整 size 表）" icon="sparkles" href="/zh-Hant/api-capabilities/gpt-image-2-vip/overview">
    30 檔 size 完整對照表、定價、技術規格
  </Card>

  <Card title="文生圖 API" icon="wand-sparkles" href="/zh-Hant/api-capabilities/gpt-image-2-vip/text-to-image">
    `/v1/images/generations` 相容端點
  </Card>

  <Card title="姐妹模型 gpt-image-2-all" icon="copy" href="/zh-Hant/api-capabilities/gpt-image-2-all/image-edit">
    不需要鎖尺寸時呼叫方式一致，出圖更快
  </Card>
</CardGroup>


## OpenAPI

````yaml api-reference/gpt-image-2-vip-edit-openapi.yaml POST /v1/images/edits
openapi: 3.1.0
info:
  title: gpt-image-2-vip 图片编辑 API
  description: >
    GPT 图像生成 Adobe 官逆模型（Firefly 线路） `gpt-image-2-vip` — 图片编辑接口。


    - 支持单图改图与多图融合（同名 `image` 字段可重复传，多图按上传顺序排序）

    - 请求格式为 `multipart/form-data`

    - 在 prompt 中可用「图1/图2/图3」指代上传顺序

    - 支持 30 档常见 size（10 比例 × 1K / 2K / 4K，所有档位统一价 $0.03/张）

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
      summary: 图片编辑：根据指令编辑或融合参考图，可锁定输出尺寸
      description: >
        使用 `gpt-image-2-vip` 模型，根据文本指令对输入图片进行编辑或多图融合，并通过 `size` 字段锁定输出尺寸。


        - 必须提供至少一张输入图片（`image` 字段）

        - 多张参考图：**重复传同名 `image` 字段**，例如 `-F image=@a.png -F
        image=@b.png`（按上传顺序对应 prompt 中的「图1/图2/...」）

        - 单张图片推荐 ≤ 10MB，格式 png/jpg/webp

        - 强烈建议传 `size`（30 档之一）；`quality` 可选（见字段说明），不要传 `n`

        - 如需纯文本生成图片，请使用 [文生图接口](/api-capabilities/gpt-image-2-vip/text-to-image)
      operationId: editGptImage2VipImage
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
    EditImageRequest:
      type: object
      required:
        - model
        - prompt
        - image
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
            输出尺寸。**改图场景推荐传 `auto`（或不传）**——模型会**根据 prompt
            里点名要修改的那张图的尺寸比例**输出（多图场景下不一定是第一张）。例如 prompt 写"修改图2，把图2 的衣服换成图1
            的样子"，则输出比例跟图2 一致。如果 prompt 没明确指代，模型会自行判断。如需强制改变尺寸，从 30
            档常见尺寸里选；写法：`宽x高`（半角小写 x），如 `2048x1360`、`3840x2160`。所有档位统一价 $0.03/张。
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
          example: 2048x1360
    ImageResponse:
      type: object
      description: >
        图片编辑响应。**默认返回 base64**（`data[0].b64_json`）；如需 `url`，请改用 `image2_OSS`
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