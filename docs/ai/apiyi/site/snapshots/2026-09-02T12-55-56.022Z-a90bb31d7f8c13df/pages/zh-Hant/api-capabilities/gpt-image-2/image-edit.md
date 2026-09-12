> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 圖片編輯 API 參考

> gpt-image-2 圖片編輯 API 參考與線上除錯 — 上傳參考圖（最多 16 張）+ 指令進行單圖改圖、多圖融合或 mask 局部重繪

<Info>
  右側的互動式 Playground 支援直接上傳本地圖片。請在 **Authorization** 中填入你的 API Key（格式：`Bearer sk-xxx`），選擇 image / mask 檔案並填入 `prompt`、`model` 後一鍵傳送即可。
</Info>

<Tip>
  **場景說明**：本頁用於「基於一張或多張參考圖改圖 / 融合生成 / mask 局部重繪」。請求為 `multipart/form-data` 格式。如需純文本生成圖片，請使用 [文生圖介面](/zh-Hant/api-capabilities/gpt-image-2/text-to-image)。
</Tip>

<Warning>
  **🖥️ 瀏覽器 Playground 限制（重要）**

  本介面的響應包含**純 base64 字串**（數 MB 量級）。受瀏覽器渲染限制，右側 Playground 在收到響應後**可能彈出** `請求時發生錯誤: unable to complete request` ——**實際請求已經成功**，只是瀏覽器無法把這麼長的 base64 顯示出來。

  **推薦做法**（小白零踩坑）：

  * **直接複製下方"程式碼示例"中的 Python / Node.js / cURL 到本地執行**，程式碼會自動 `base64.b64decode` 並把圖片**儲存為本地檔案**。
  * 如要在瀏覽器裡試 Playground，**用極小的參考圖（\< 50KB）** 並把 `size` 設為最小檔（如 `1024x1024`）、`quality` 改為 `low`。
</Warning>

<Warning>
  **⚠️ 關鍵差異（從 gpt-image-1.5 遷移注意）**

  * **不要傳 `input_fidelity`** —— `gpt-image-2` 強制啟用高保真，傳了會 400 報錯
  * **編輯請求的輸入 token 明顯更高** —— 因為參考圖按 Vision 計費規則換算成大量 token，預算要留足
  * **多圖融合最多 16 張** —— `image[]` 欄位重複傳入，超過會報錯
</Warning>

<Warning>
  **📎 多圖融合順序有意義**

  `image[]` 欄位可重複傳入多張參考圖，**順序將作為 prompt 中「圖1/圖2/圖3」的引用依據**。建議在 prompt 中顯式指代，例如：

  > 把圖1的人物放進圖2的場景，沿用圖3的色彩風格

  單張檔案上限 **50MB**（multipart 檔案上傳），格式 `png` / `jpg` / `webp`；實踐中建議先壓到 **1.5MB 以內**再上傳（詳見下方「上傳大小限制速查」）。
</Warning>

## 程式碼示例

### Python（OpenAI SDK · 單圖編輯）

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.edit(
    model="gpt-image-2",
    image=open("photo.png", "rb"),
    prompt="把背景換成海邊黃昏，保留人物細節",
    size="1536x1024",
    quality="high"
)

# b64_json 是純 base64（無字首），需自己 decode
with open("edited.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### Python（OpenAI SDK · 多圖融合）

```python theme={null}
resp = client.images.edit(
    model="gpt-image-2",
    image=[
        open("person.png", "rb"),
        open("scene.png", "rb"),
        open("style.png", "rb"),
    ],
    prompt="把圖1人物放進圖2場景，沿用圖3的色彩風格，保持光線一致",
    size="1536x1024",
    quality="high"
)

with open("fused.png", "wb") as f:
    f.write(base64.b64decode(resp.data[0].b64_json))
```

### cURL（多圖融合）

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2" \
  -F "prompt=把圖1的人物放進圖2的場景，保留圖3的色彩風格" \
  -F "size=1536x1024" \
  -F "quality=high" \
  -F "image[]=@person.png" \
  -F "image[]=@scene.png" \
  -F "image[]=@style.png"
```

### cURL（mask 局部重繪）

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2" \
  -F "prompt=把天空換成粉色晚霞" \
  -F "size=1024x1024" \
  -F "quality=high" \
  -F "image[]=@photo.png" \
  -F "mask=@mask.png" \
  | jq -r '.data[0].b64_json' | base64 -d > photo_edited.png
```

### Node.js（原生 fetch + FormData · 多圖融合）

```javascript theme={null}
import fs from 'node:fs';

const form = new FormData();
form.append('model', 'gpt-image-2');
form.append('prompt', '把圖1的人物放進圖2的場景');
form.append('size', '1536x1024');
form.append('quality', 'high');
form.append('image[]', new Blob([fs.readFileSync('./person.png')]), 'person.png');
form.append('image[]', new Blob([fs.readFileSync('./scene.png')]), 'scene.png');

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    body: form
});

const { data } = await resp.json();
fs.writeFileSync('fused.png', Buffer.from(data[0].b64_json, 'base64'));
```

## 引數說明速查

| 欄位                   | 型別   | 必填 | 預設     | 說明                                                                                                                                                                      |
| -------------------- | ---- | -- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`              | text | 是  | —      | 固定填 `gpt-image-2`                                                                                                                                                       |
| `prompt`             | text | 是  | —      | 編輯 / 融合指令                                                                                                                                                               |
| `image[]`            | file | 是  | —      | 參考圖，可重複多次（**最多 16 張**）                                                                                                                                                  |
| `mask`               | file | 否  | —      | 掩碼圖（僅對第一張 image 生效，要求帶 alpha 通道）                                                                                                                                        |
| `size`               | text | 否  | `auto` | 輸出尺寸，同文生圖                                                                                                                                                               |
| `quality`            | text | 否  | `auto` | `low` / `medium` / `high` / `auto`                                                                                                                                      |
| `output_format`      | text | 否  | `png`  | `png` / `jpeg` / `webp`                                                                                                                                                 |
| `output_compression` | text | 否  | —      | 0–100，僅 `jpeg` / `webp` 生效                                                                                                                                              |
| `background`         | text | 否  | `auto` | `transparent` / `opaque` / `auto`；傳 `transparent` 時 `output_format` 必須是 `png` 或 `webp`。注意編輯介面的透明是**重繪去背**而非精確摳像，見 [透明背景 FAQ](/zh-Hant/faq/image-transparent-background) |

<Warning>
  **`quality` 不要傳舊版 DALL·E 的 `standard` / `hd`。** 只接受 `low` / `medium` / `high` / `auto` 四個官方列舉值。舊值在不同後端渠道下行為不一致：有時直接 400 報錯（`invalid_value`），有時被靜默忽略、按 `auto` 檔跑出結果（費用不可控）。請始終顯式傳四個官方值之一。
</Warning>

## 上傳大小限制速查

| 專案                       | 限制              | 說明                                                                                                                                 |
| ------------------------ | --------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 參考圖數量                    | 最多 **16 張**     | `image[]` 欄位重複傳入                                                                                                                   |
| 單張圖片（multipart 檔案上傳）     | 每張**小於 50MB**   | 支援 `png` / `jpg` / `webp`                                                                                                          |
| 單張圖片（base64 data URL 方式） | 欄位長度約 **20MiB** | 這是 URL/base64 **字串欄位**的長度限制（schema `maxLength: 20971520`），**不等同於** multipart 檔案上傳的 50MB 上限；base64 編碼會膨脹約 1/3，**實際原圖建議控制在 15MB 以內** |
| mask 檔案                  | **PNG 且小於 4MB** | 須與原圖相同尺寸、帶 alpha 通道                                                                                                                |

<Warning>
  **總請求體積別頂滿**：雖然單圖上限 50MB、最多 16 張，但多張大圖同時接近上限時，單個請求體會非常大，容易在閘道 / CDN / 超時層面失敗。實踐中建議**每張先壓到 1.5MB 以內**（JPEG 品質 80-90），成功率和出圖速度都會明顯更好——輸出畫質與輸入圖體積無關。
</Warning>

## 參考圖格式要求與預處理

`/v1/images/edits` 只接受 **png / jpg / webp** 三種標準格式。如果收到下面這個 400：

```json theme={null}
{
  "error": {
    "message": "Invalid image file or mode for image 1, please check your image file. ...",
    "type": "shell_api_error",
    "code": "invalid_image_file"
  }
}
```

大機率是參考圖**並非標準 JPEG/PNG**。最常見的坑是手機原拍照片的 **MPO 格式**（Multi-Picture Object，多幀 JPEG 容器）：華為 Mate 系列等機型直出的 `.jpg` 內嵌 HDR 增益圖副幀，實為 MPO。這類檔案的檔案頭同為 `FFD8`，**副檔名和 `file` 命令都顯示 JPEG**，肉眼無法分辨，只有按幀解析（如 Pillow）才能識別。報錯裡的「image 1」指第 N 張參考圖（序號從 1 開始），可按序號定位問題圖。

<Info>
  **2026-07 實測**：MPO 圖 5 次上傳全部 400；同一批圖重編碼為標準 JPEG/PNG 後，**保持 3072×4096 原解析度**上傳全部成功——問題出在格式，不在尺寸/體積。該錯誤在入口校驗階段快速返回（約 4 秒），**不計費**。
</Info>

**判別與修復**：`Image.open(f).format` 返回 `"MPO"` 即需轉換。上傳鏈路統一做一次重編碼即可，順帶相容 HEIC 等其它手機格式：

```python theme={null}
from PIL import Image
import io

def normalize_image(path: str) -> bytes:
    """手機圖片（MPO/HDR 多幀等）轉標準 JPEG，通過 edits 格式校驗"""
    im = Image.open(path)
    im.load()                      # MPO 只取第一幀（全尺寸主圖）
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGB")
    out = io.BytesIO()
    im.save(out, format="JPEG", quality=92)   # 或 format="PNG"
    return out.getvalue()
```

<Tip>
  業務是「使用者上傳實拍圖」的場景（家裝效果圖、商品實拍等），建議在服務端上傳鏈路**統一重編碼**，而不是逐張排查——手機 HDR 照片會持續出現。更多輸入圖片處理技巧見 [圖片 API 呼叫須知與最佳實踐](/zh-Hant/api-capabilities/image-api-best-practices)。
</Tip>

## mask 局部重繪要求

* 與原圖**相同尺寸**，**PNG 格式**，單張**小於 4MB**
* **必須帶 alpha 通道**：透明區域（alpha=0）= 要重繪的部分，不透明區域 = 保留
* mask 僅對**第一張** image 生效
* mask 作為「軟引導」而非精確邊界，模型可能在蒙版周圍擴充套件 / 收斂

<Tip>
  **多輪迭代**：把上一次的輸出作為下一次的 `image[]` 輸入，配合新的編輯指令，可逐步精調畫面。每一輪都按 token 實計，預算時留意累計成本。
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
        "input_tokens": 848,
        "input_tokens_details": {
            "image_tokens": 832,
            "text_tokens": 16
        },
        "output_tokens": 196,
        "output_tokens_details": {
            "image_tokens": 196,
            "text_tokens": 0
        },
        "total_tokens": 1044
    }
}
```

<Warning>
  `b64_json` 欄位是**純 base64**，**不含** `data:image/...;base64,` 字首，與 `gpt-image-2-all` 不同。客戶端需自行 decode 寫檔案，或在瀏覽器端拼字首渲染。
</Warning>

<Info>
  編輯請求的 `input_tokens` 通常**顯著高於**同尺寸文生圖，原因是參考圖按 Vision 計費規則換算——具體消耗多少可以直接讀 `usage.input_tokens_details.image_tokens`，與文本部分（`text_tokens`）是分開計的。多圖融合時 `image_tokens` 會隨參考圖數量**嚴格線性增加**（2026-07 實測：4 張 1024² = 4 × 1024 tokens），量化資料見 [多圖輸入的價格影響](/zh-Hant/api-capabilities/gpt-image-2/overview#多圖輸入的價格影響2026-07-實測)。詳細欄位說明見 [概覽頁「如何檢視每次呼叫的真實 token 數」](/zh-Hant/api-capabilities/gpt-image-2/overview#如何檢視每次呼叫的真實-token-數)。
</Info>


## OpenAPI

````yaml api-reference/gpt-image-2-edit-openapi.yaml POST /v1/images/edits
openapi: 3.1.0
info:
  title: gpt-image-2 图片编辑 API
  description: |
    OpenAI 旗舰图像生成模型 `gpt-image-2` — 图片编辑接口。

    - 支持单图编辑、多图融合（最多 16 张参考图）、mask 局部重绘
    - 请求格式为 `multipart/form-data`
    - 在 prompt 中可用「图1/图2/图3」指代 `image` 上传顺序
    - **参考图自动启用高保真**，**不要**传 `input_fidelity`（传了会报错）
    - 编辑请求的输入 token 会比同尺寸文生图明显更高

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
        使用 `gpt-image-2` 模型，根据文本指令对输入图片进行编辑、多图融合或 mask 局部重绘。


        - 必须提供至少一张 `image`（最多 16 张）

        - multipart 文件上传单张图片小于 50MB，格式 png/jpg/webp（base64 data URL 方式受约 20MiB
        字段长度限制，原图建议 ≤ 15MB）

        - `mask` 字段（可选）需与原图相同尺寸，PNG 格式且小于 4MB，必须带 alpha 通道（透明 = 重绘区域）

        - mask 仅对第一张 image 生效

        - 不要传 `input_fidelity`（强制高保真，传了会报错）
      operationId: editGptImage2Image
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/EditImageRequest'
            encoding:
              image:
                contentType: image/png, image/jpeg, image/webp
              mask:
                contentType: image/png
      responses:
        '200':
          description: 成功生成图片
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: 参数非法（含 input_fidelity / background:transparent / size 不合约束等）
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
    EditImageRequest:
      type: object
      required:
        - model
        - prompt
        - image
      properties:
        model:
          type: string
          description: 模型名称，固定为 gpt-image-2
          enum:
            - gpt-image-2
          default: gpt-image-2
        prompt:
          type: string
          description: 编辑/融合指令。多图场景可用「图1/图2/图3」指代 image 上传顺序
          example: 把图1的人物放进图2的场景，沿用图3的色彩风格
        image:
          type: array
          description: >-
            参考图，可重复多次（**最多 16 张**）。**单图直接传一次，多图重复传同名 `image` 字段**（例如 `-F
            image=@a.png -F image=@b.png`），按上传顺序对应 prompt
            中的「图1/图2/...」。multipart 文件上传单张小于 50MB，格式 png/jpg/webp；实践建议压到 1.5MB
            以内
          items:
            type: string
            format: binary
        mask:
          type: string
          format: binary
          description: |
            掩码图（可选，仅对第一张 image 生效）。要求：
            - 与原图相同尺寸
            - PNG 格式且小于 4MB
            - 必须带 alpha 通道（alpha=0 表示要重绘的区域，不透明区域保留）
        size:
          type: string
          description: 输出尺寸（同文生图）。预设或满足约束的自定义尺寸
          example: 1536x1024
          default: auto
        quality:
          type: string
          description: 画质档位
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
        background:
          type: string
          description: 背景模式。auto 或 opaque。**不支持** transparent
          enum:
            - auto
            - opaque
          default: auto
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          example: 1776832476
        data:
          type: array
          description: 生成结果数组（本模型单次返回 1 张）
          items:
            type: object
            properties:
              b64_json:
                type: string
                description: '**纯 base64 字符串**（不含 data:image/...;base64, 前缀）'
                example: iVBORw0KGgoAAAANSUhEUgAA...
        usage:
          type: object
          description: 本次调用 token 用量
          properties:
            input_tokens:
              type: integer
              example: 1280
            output_tokens:
              type: integer
              example: 6240
            total_tokens:
              type: integer
              example: 7520
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key

````