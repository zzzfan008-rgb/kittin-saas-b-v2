> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 圖片編輯 API 參考

> FLUX 圖片編輯 API 參考與線上除錯 — 上傳參考圖（最多 8 張）+ 指令進行單圖改圖、多圖融合，FLUX.2 全系列 + FLUX.1 Kontext 通用

<Info>
  右側的互動式 Playground：在 **Authorization** 中填入 API Key（格式：`Bearer sk-xxx`），把參考圖的**公網 URL** 填到 `input_image`，多圖融合繼續填 `input_image_2` … `input_image_8`，然後填 `prompt`、`model` 一鍵傳送即可。Playground 只支援 URL 輸入；如需用 base64 data URL，請複製下方程式碼示例到本地除錯。
</Info>

<Tip>
  **場景說明**：本頁用於「基於一張或多張參考圖改圖 / 多圖融合」。FLUX 圖片編輯支援兩種方式：

  * **方式 A（本頁 Playground，推薦）**：JSON + `input_image` 發 `/v1/images/generations`（與文生圖共用端點，傳入 `input_image` 即觸發編輯模式），適用全部 FLUX 模型（含 Kontext，已實測），支援多圖融合（`input_image_2` \~ `input_image_8`）
  * **方式 B**：OpenAI 相容 multipart 端點 `/v1/images/edits`（見下方「方式 B」章節），單圖編輯，與 OpenAI SDK 的 `client.images.edit()` 直接相容

  如需純文本生成圖片，請使用 [文生圖介面](/zh-Hant/api-capabilities/flux/text-to-image)。
</Tip>

<Warning>
  **⚠️ 關鍵差異 / 注意事項（方式 A）**

  * **端點路徑**：`/v1/images/generations`（與文生圖共用；另有 OpenAI 相容的 `/v1/images/edits` 單圖編輯端點，見方式 B）
  * **Content-Type**：`application/json`（方式 B 的 `/edits` 端點則為 `multipart/form-data`）
  * **所有參考圖欄位是字串**：`input_image` / `input_image_2` … `input_image_8`，值為公網 URL（推薦）或 `data:image/...;base64,xxx` data URL
  * **多圖上限因模型而異**：FLUX.2 \[pro/max/flex] 最多 **8 張**，FLUX.2 \[klein] 最多 **4 張**，FLUX.1 Kontext 系列原生只支援 **1 張**
  * **單張參考圖 ≤ 20MB 或 20MP**，格式 `png` / `jpg` / `webp`
  * **輸入解析度**：最小 64×64，最大 4MP；dimensions 必須是 16 的倍數
  * **結果 URL 僅 10 分鐘有效** — `data[0].url` 必須立即下載
  * **不傳 `aspect_ratio` 時，輸出尺寸自動匹配第一張輸入圖**
</Warning>

<Warning>
  **📎 多圖融合順序有意義**

  `input_image` / `input_image_2` / `input_image_3` … 的編號 **就是 prompt 中「image 1 / image 2 / image 3」的引用依據**。建議在 prompt 中顯式指代，例如：

  > Place the person from image 1 into the scene from image 2, applying the color palette of image 3.

  每張圖必須為可公網訪問的 URL（推薦 ≤ 20MB），或 `data:image/png;base64,xxx` 格式 base64 data URL。
</Warning>

## 程式碼示例

### cURL（雙圖融合 · URL）

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "flux-2-pro",
    "prompt": "自然融合這兩個圖片",
    "input_image": "https://static.apiyi.com/apiyi-logo.png",
    "input_image_2": "https://images.unsplash.com/photo-1762138012600-2ab523f8b35a",
    "seed": 42,
    "output_format": "jpeg"
  }'
```

### cURL（三圖融合 · URL）

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "flux-2-pro",
    "prompt": "The person from image 1 is petting the cat from image 2, the bird from image 3 is next to them",
    "input_image": "https://example.com/person.jpg",
    "input_image_2": "https://example.com/cat.jpg",
    "input_image_3": "https://example.com/bird.jpg",
    "seed": 42,
    "output_format": "jpeg"
  }'
```

### cURL（單圖編輯 · Kontext）

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "flux-kontext-pro",
    "prompt": "Convert this architectural photo into a pencil sketch style, preserve all structural details",
    "input_image": "https://your-oss.example.com/architecture.jpg"
  }'
```

### cURL（本地檔案 · base64 data URL）

```bash theme={null}
# 先把本地圖片轉為 base64 data URL（macOS / Linux）
B64=$(base64 -w0 < person.png 2>/dev/null || base64 < person.png | tr -d '\n')

curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d "$(jq -nc --arg img "data:image/png;base64,$B64" '{
    model: "flux-2-pro",
    prompt: "把圖1風格化為油畫",
    input_image: $img
  }')"
```

### Python（requests · 雙圖融合）

```python theme={null}
import requests

resp = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={
        "Authorization": "Bearer sk-your-api-key",
        "Content-Type": "application/json",
    },
    json={
        "model": "flux-2-pro",
        "prompt": "自然融合這兩個圖片",
        "input_image": "https://static.apiyi.com/apiyi-logo.png",
        "input_image_2": "https://images.unsplash.com/photo-1762138012600-2ab523f8b35a",
        "seed": 42,
        "output_format": "jpeg",
    },
    timeout=120,
)
image_url = resp.json()["data"][0]["url"]

# data[0].url 僅 10 分鐘有效，立即下載
with open("fused.jpg", "wb") as f:
    f.write(requests.get(image_url, timeout=30).content)
```

### Python（requests · 本地檔案 base64）

```python theme={null}
import base64, requests, mimetypes

def to_data_url(path: str) -> str:
    mime = mimetypes.guess_type(path)[0] or "image/png"
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    return f"data:{mime};base64,{b64}"

resp = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={
        "Authorization": "Bearer sk-your-api-key",
        "Content-Type": "application/json",
    },
    json={
        "model": "flux-2-pro",
        "prompt": "把圖1人物放進圖2場景",
        "input_image": to_data_url("person.png"),
        "input_image_2": "https://your-oss.example.com/scene.jpg",
    },
    timeout=120,
)
print(resp.json()["data"][0]["url"])
```

### Python（OpenAI SDK · extra\_body 注入 input\_image）

```python theme={null}
from openai import OpenAI
import requests

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# OpenAI SDK 的 images.generate() 走 /v1/images/generations + JSON，
# BFL 原生欄位通過 extra_body 直接拼到 JSON 請求體裡
resp = client.images.generate(
    model="flux-2-pro",
    prompt="自然融合這兩個圖片",
    extra_body={
        "input_image": "https://static.apiyi.com/apiyi-logo.png",
        "input_image_2": "https://images.unsplash.com/photo-1762138012600-2ab523f8b35a",
        "seed": 42,
        "output_format": "jpeg",
    },
)
image_url = resp.data[0].url
with open("fused.jpg", "wb") as f:
    f.write(requests.get(image_url, timeout=30).content)
```

### Node.js（fetch · 多圖融合）

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer sk-your-api-key',
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        model: 'flux-2-pro',
        prompt: '自然融合這兩個圖片',
        input_image: 'https://static.apiyi.com/apiyi-logo.png',
        input_image_2: 'https://images.unsplash.com/photo-1762138012600-2ab523f8b35a',
        seed: 42,
        output_format: 'jpeg',
    }),
});

const { data } = await resp.json();
const img = await fetch(data[0].url);
const fs = await import('node:fs');
fs.writeFileSync('fused.jpg', Buffer.from(await img.arrayBuffer()));
```

## 方式 B：OpenAI 相容編輯端點（multipart）

除上述 JSON 方式外，FLUX 圖片編輯也支援 OpenAI Images API 的標準編輯端點，與 `client.images.edit()` 直接相容（2026-07-04 實測 `flux-kontext-max` 成功出圖）：

* **端點**：`POST https://api.apiyi.com/v1/images/edits`
* **Content-Type**：`multipart/form-data`（使用 SDK 或 curl `-F` 時自動設定，**不要手動指定**，否則 boundary 丟失會導致解析失敗）

<Note>
  FLUX.1 Kontext 系列僅支援單張輸入圖；多圖融合請使用方式 A（`input_image` \~ `input_image_8`）。方式 B 目前已實測 Kontext 系列可用。
</Note>

### 請求引數（form 欄位）

| 欄位                 | 型別      | 必填 | 說明                                                                         |
| ------------------ | ------- | -- | -------------------------------------------------------------------------- |
| `model`            | string  | ✓  | 如 `flux-kontext-max` / `flux-kontext-pro`                                  |
| `prompt`           | string  | ✓  | 編輯指令                                                                       |
| `image`            | file    | ✓  | 原圖二進位制檔案（png/jpg/webp，≤ 20MB）。**欄位名必須是 `image`**，缺失時返回 `image is required` |
| `aspect_ratio`     | string  | ✗  | 如 `1:1` / `16:9`，form 頂層欄位直接傳；OpenAI SDK 使用者通過 `extra_body` 傳入             |
| `safety_tolerance` | integer | ✗  | 0（最嚴）– 6（最寬鬆）                                                              |

### cURL 示例

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/edits" \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=flux-kontext-max" \
  -F "prompt=換一套時裝" \
  -F "aspect_ratio=16:9" \
  -F "image=@input.jpg"
```

### Python（OpenAI SDK）示例

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
)

result = client.images.edit(
    model="flux-kontext-max",
    image=open("input.jpg", "rb"),
    prompt="換一套時裝",
    extra_body={"aspect_ratio": "16:9"},  # FLUX 特有引數通過 extra_body 傳遞
)
print(result.data[0].url)
```

### Node.js（fetch + FormData）示例

```javascript theme={null}
const form = new FormData();
form.append('model', 'flux-kontext-max');
form.append('prompt', '換一套時裝');
form.append('aspect_ratio', '16:9');
form.append('image', imageBlob, 'input.jpg'); // 瀏覽器 Blob 或 Node 的 fs.openAsBlob()

const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer sk-your-api-key' },
    // 注意：不要手動設定 Content-Type，讓執行時自動生成 multipart boundary
    body: form,
});
const data = await resp.json();
console.log(data.data[0].url);
```

響應格式與方式 A 相同（`data[0].url`，BFL 簽名 URL 10 分鐘有效，生產環境請服務端轉存）。

### 兩種方式如何選？

|      | 方式 A（JSON `input_image`） | 方式 B（multipart `/edits`）                    |
| ---- | ------------------------ | ------------------------------------------- |
| 適合   | 直接發 HTTP / 前端應用 / 多圖融合   | 已有 OpenAI SDK 程式碼、`client.images.edit()` 遷移 |
| 多圖   | 支援（flux-2 最多 8 張）        | 僅單圖                                         |
| 圖片形式 | 公網 URL 或 base64 data URL | 二進位制檔案                                      |

## 引數說明速查

| 欄位                                 | 型別      | 必填 | 預設      | 說明                                                                                                        |
| ---------------------------------- | ------- | -- | ------- | --------------------------------------------------------------------------------------------------------- |
| `model`                            | string  | 是  | —       | FLUX 模型 ID，多圖融合推薦 `flux-2-pro` / `flux-2-max`，單圖改圖也可用 `flux-kontext-max` / `flux-kontext-pro`             |
| `prompt`                           | string  | 是  | —       | 編輯 / 融合指令，最長 32K tokens；多圖場景用「image 1 / image 2 / image 3」指代 image / input\_image\_2 / input\_image\_3 順序 |
| `input_image`                      | string  | 是  | —       | 參考圖 1。公網 URL（推薦）或 `data:image/...;base64,xxx` data URL                                                    |
| `input_image_2` \~ `input_image_8` | string  | 否  | —       | 第 2–8 張參考圖，URL 或 data URL。FLUX.2 \[pro/max/flex] **最多 8 張**，\[klein] **4 張**，Kontext 不支援                  |
| `aspect_ratio`                     | string  | 否  | 跟隨首圖    | 例如 `1:1` / `16:9` / `9:16` / `4:3` / `3:2`                                                                |
| `seed`                             | integer | 否  | 隨機      | 固定可復現                                                                                                     |
| `safety_tolerance`                 | integer | 否  | `2`     | 0（最嚴）– 6（最寬鬆）                                                                                             |
| `output_format`                    | string  | 否  | `jpeg`  | `jpeg` / `png`                                                                                            |
| `prompt_upsampling`                | boolean | 否  | `false` | 是否自動擴寫 prompt                                                                                             |
| `steps`                            | integer | 否  | `50`    | **僅 `flux-2-flex`**，最大 50                                                                                 |
| `guidance`                         | number  | 否  | `4.5`   | **僅 `flux-2-flex`**，1.5–10                                                                                |

## 多圖融合策略

<AccordionGroup>
  <Accordion icon="user" title="角色一致性（最多 8 張）">
    上傳同一角色的多張照片作參考，模型會自動維持身份特徵。適合廣告系列、漫畫分鏡、時尚編輯。

    ```
    Eight consistent characters from the reference images,
    in a fashion editorial set on a Tokyo rooftop at golden hour
    ```
  </Accordion>

  <Accordion icon="palette" title="風格遷移">
    一張內容圖 + 一張風格圖，prompt 顯式指代：

    ```
    Using the style of image 2, render the subject from image 1
    ```
  </Accordion>

  <Accordion icon="layers" title="物件組合">
    把多張圖裡的不同物體組合到一個新場景：

    ```
    The person from image 1 is petting the cat from image 2,
    the bird from image 3 is next to them
    ```
  </Accordion>

  <Accordion icon="shirt" title="服裝/產品換樣">
    把圖1人物的上衣換成圖2 的款式：

    ```
    Replace the top of the person in image 1 with the one from image 2,
    keep the pose and background unchanged
    ```
  </Accordion>
</AccordionGroup>

<Tip>
  **多輪迭代**：把上一次的 `data[0].url` 重新下載後作為下一次 `input_image` 輸入，配合新指令逐步精調畫面。每輪按張數計費。
</Tip>

## 響應格式

```json theme={null}
{
    "created": 1776832476,
    "data": [
        {
            "url": "https://delivery-eu.bfl.ai/results/xxx/sample.jpeg?signature=..."
        }
    ]
}
```

<Warning>
  **⚠️ `data[0].url` 僅 10 分鐘有效**

  * URL 託管在 `delivery-eu.bfl.ai` / `delivery-us.bfl.ai`，簽名 10 分鐘過期
  * **不開啟 CORS**，瀏覽器 `fetch` 會被攔
  * 生產服務**必須**服務端代下載到自有 OSS / CDN
  * FLUX 編輯端點**不返回** `b64_json`，僅返回 url
</Warning>

<Info>
  編輯請求與文生圖同價，按張數計費而非按 token。多圖融合不會因圖片數量加價（與 OpenAI gpt-image-2 編輯不同）。
</Info>

## 常見問題

<AccordionGroup>
  <Accordion title="報錯 image is required (shell_api_error) 是什麼原因？">
    請求到達了 `/v1/images/edits` 編輯端點（方式 B），但閘道在請求體裡找不到圖片。常見原因：

    1. multipart 表單裡沒有 `image` 檔案欄位，或欄位名寫錯（如 `image[]`、`file`）
    2. 手動設定了 `Content-Type: multipart/form-data` 但沒帶 boundary（用 SDK / fetch / curl 時不要手動設定該頭）
    3. 客戶端圖片轉換失敗後仍發出了請求（檢查 `image` 欄位的實際位元組數是否大於 0）
    4. 想用 JSON 方式傳圖卻發到了 `/edits` 端點——JSON + `input_image` 請發 `/v1/images/generations`（方式 A）
  </Accordion>
</AccordionGroup>


## OpenAPI

````yaml api-reference/flux-edit-openapi.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: FLUX 图片编辑 API
  description: >
    Black Forest Labs FLUX 模型族 — 图片编辑接口（apiyi 代理：`/v1/images/generations` 端点 +
    JSON body）。


    - **端点路径**：`POST /v1/images/generations`（FLUX 系列文生图与图片编辑共用同一端点；传入
    `input_image` 即触发编辑模式）

    - **Content-Type**：`application/json`（本 Playground 为 JSON 方式，推荐；另有 OpenAI
    兼容的 `/v1/images/edits` multipart 单图编辑端点，见文档页「方式 B」章节）

    - **参考图字段**：`input_image` / `input_image_2` … `input_image_8`，**值是公网 URL
    字符串**（也支持 `data:image/...;base64,xxx` 格式 base64 data URL，但 Playground 推荐填
    URL，base64 留给本地代码调试）

    - 多图融合：FLUX.2 [pro/max/flex] 最多 8 张，[klein] 最多 4 张，FLUX.1 Kontext 单图

    - 在 prompt 中用「image 1 / image 2 / image 3」对应 input_image / input_image_2 /
    input_image_3

    - 响应 `data[0].url` **仅 10 分钟有效**，需立即下载（CORS 关闭）


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
        - 图片编辑
      summary: 图片编辑：根据指令编辑或融合参考图
      description: >
        使用 FLUX 系列模型，根据文本指令对一张或多张参考图进行编辑、融合。


        - **接口路径与文生图共用 `/v1/images/generations`**（另有 OpenAI 兼容的
        `/v1/images/edits` multipart 单图编辑端点，见文档页「方式 B」章节）

        - 请求 Content-Type 为 `application/json`

        - **所有参考图字段是 URL 字符串**：`input_image`、`input_image_2` … `input_image_8`

        - 不传 `aspect_ratio` 时输出尺寸跟随首张输入图
      operationId: editFluxImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/EditImageRequest'
            example:
              model: flux-2-pro
              prompt: 自然融合这两个图片
              input_image: https://static.apiyi.com/apiyi-logo.png
              input_image_2: https://images.unsplash.com/photo-1762138012600-2ab523f8b35a
              seed: 42
              output_format: jpeg
      responses:
        '200':
          description: 成功生成图片
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ImageResponse'
        '400':
          description: 参数非法（input_image 缺失 / dimensions 非 16 倍数 / 超 4MP 等）
        '401':
          description: 未授权 - API Key 无效
        '403':
          description: 内容审核拦截
        '413':
          description: 上传图片过大
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
        - input_image
      properties:
        model:
          type: string
          description: >-
            FLUX 模型 ID。多图融合推荐 flux-2-pro / flux-2-max；单图改图也可用 flux-kontext-max /
            flux-kontext-pro
          enum:
            - flux-2-pro
            - flux-2-max
            - flux-2-flex
            - flux-2-klein-9b
            - flux-2-klein-4b
            - flux-kontext-max
            - flux-kontext-pro
          default: flux-2-pro
        prompt:
          type: string
          description: >-
            编辑/融合指令。多图场景用「image 1 / image 2 / image 3」指代 input_image /
            input_image_2 / input_image_3 顺序
          example: 自然融合这两个图片
        input_image:
          type: string
          description: >-
            参考图 1 的公网 URL（必填）。**Playground 直接填 URL**；本地代码调试也可传
            `data:image/png;base64,xxx` 形式的 base64 data URL
          example: https://static.apiyi.com/apiyi-logo.png
        input_image_2:
          type: string
          description: 参考图 2 的公网 URL（可选）
        input_image_3:
          type: string
          description: 参考图 3 的公网 URL（可选）
        input_image_4:
          type: string
          description: 参考图 4 的公网 URL（可选）
        input_image_5:
          type: string
          description: 参考图 5 的公网 URL（可选）
        input_image_6:
          type: string
          description: 参考图 6 的公网 URL（可选）
        input_image_7:
          type: string
          description: 参考图 7 的公网 URL（可选）
        input_image_8:
          type: string
          description: 参考图 8 的公网 URL（可选，仅 FLUX.2 [pro/max/flex] 支持到 8 张）
        aspect_ratio:
          type: string
          description: 宽高比，例如 1:1 / 16:9 / 9:16 / 4:3 / 3:4。不传则跟随首张输入图
        seed:
          type: integer
          description: 固定可复现
        safety_tolerance:
          type: integer
          description: 审核档位。0 最严格，6 最宽松，默认 2
          minimum: 0
          maximum: 6
        output_format:
          type: string
          description: 输出格式，默认 jpeg
          enum:
            - jpeg
            - png
        prompt_upsampling:
          type: boolean
          description: 是否自动扩写 prompt，默认 false
        steps:
          type: integer
          description: '**仅 flux-2-flex**。推理步数，默认 50'
          minimum: 1
          maximum: 50
        guidance:
          type: number
          description: '**仅 flux-2-flex**。引导强度，默认 4.5'
          minimum: 1.5
          maximum: 10
    ImageResponse:
      type: object
      properties:
        created:
          type: integer
          example: 1776832476
        data:
          type: array
          description: 生成结果数组（本接口单次返回 1 张）
          items:
            type: object
            properties:
              url:
                type: string
                description: >-
                  **签名 URL，仅 10 分钟有效**。托管在 delivery-eu.bfl.ai /
                  delivery-us.bfl.ai，CORS 关闭
                example: >-
                  https://delivery-eu.bfl.ai/results/xxx/sample.jpeg?signature=...
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 在 API易控制台获取的 API Key

````