> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 圖片編輯 API 參考

> Seedream 圖片編輯 / 多圖融合 / 批次序列生成 API 參考與線上除錯 — 同 generations 端點，傳入 image 陣列與 sequential_image_generation 切換模式

<Info>
  **同端點，不同模式**：Seedream 沒有獨立的 `/v1/images/edits` 端點，編輯 / 多圖融合 / 批次序列都走 `POST /v1/images/generations`。本頁 Playground 與 [文生圖頁](/zh-Hant/api-capabilities/seedream-image/text-to-image) 調的是同一個端點，區別只在請求體的 `image` 與 `sequential_image_generation` 引數。
</Info>

<Tip>
  **場景說明**：

  * **單圖編輯** —— `image: ["url"]` + `sequential_image_generation: "disabled"`
  * **多圖融合** —— `image: ["url1", "url2", ...]` + `sequential_image_generation: "disabled"`
  * **批次序列生成** —— `sequential_image_generation: "auto"` + `sequential_image_generation_options.max_images: N`
  * **圖生序列** —— 上面兩個組合：傳 `image` 陣列 + `auto` + `max_images`
</Tip>

<Warning>
  **🖥️ 瀏覽器 Playground 限制（僅 b64\_json 模式）**

  預設 `response_format: "url"` 模式下 Playground 工作正常（響應只是一個 BytePlus TOS 臨時連結）。如果你切換成 `response_format: "b64_json"`，響應會包含數 MB 的 base64 字串，瀏覽器 Playground **可能彈出** `請求時發生錯誤: unable to complete request` ——**實際請求已經成功**，只是瀏覽器無法顯示這麼長的 base64。

  **推薦做法**：

  * 只想看圖：**保持預設 `url` 模式**，Playground 會直接返回連結（注意 24 小時內下載到自己的儲存）。
  * 真的需要 b64\_json：**複製下方"程式碼示例"到本地執行**，程式碼會自動解碼並把圖片儲存為本地檔案。
</Warning>

<Warning>
  **⚠️ 關鍵差異（與 OpenAI gpt-image-2 的圖編輯不同）**

  * **不接受 multipart/form-data 上傳檔案** —— 請把圖片傳到 OSS / 公網圖床拿到 URL，再放進 `image` 陣列
  * **`image` 是 URL 陣列**，**不是** `image[]` 欄位重複（與 OpenAI `gpt-image-2` 的 `multipart/form-data` 格式完全不同）
  * **沒有 `mask` 欄位** —— Seedream 不支援 alpha 通道掩碼局部重繪，整圖 prompt 改寫
  * **總張數硬約束**：輸入參考圖 + 輸出圖 **≤ 15 張**
</Warning>

<Warning>
  **📎 多圖融合順序有意義**

  `image` 陣列的順序會作為 prompt 中「圖1/圖2/圖3」的引用依據。建議在 prompt 中顯式指代：

  > Replace the clothing in image 1 with the outfit from image 2, keeping the lighting from image 3.

  推薦 prompt 用英文（官方訓練以英文為主），中文也可用但表達不要含糊。
</Warning>

## 程式碼示例

<Note>
  **關於 `extra_body`（重要，別被「套一層」誤導）**

  `image`、`sequential_image_generation`、`watermark` 不是 OpenAI SDK `images.generate()` 的標準引數，所以在 Python SDK 裡**必須**放進 `extra_body` 才能傳出去。

  但 `extra_body` 只是 SDK 的傳參容器——裡面的欄位會被**平鋪合併到請求體頂層**，和 `model`、`prompt` **同一層級**。最終發出去的 JSON 跟下方 cURL 示例完全一致（`image` 就在頂層），**並不會**真的多出一層 `"extra_body": {...}` 巢狀。

  如果你不用 OpenAI SDK、而是直接拼 JSON（requests / fetch 等），就**不要**寫 `extra_body`，直接把 `image` 等欄位放到與 `model` 同級即可。
</Note>

### Python（OpenAI SDK · 單圖編輯）

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="seedream-5-0-260128",
    prompt="Generate a close-up image of a dog lying on lush grass.",
    size="2K",
    response_format="url",
    # extra_body 裡的欄位會被 SDK 平鋪到請求體頂層（與 model 同級），不是真的多巢狀一層
    extra_body={
        "image": ["https://your-oss.example.com/source-photo.png"],
        "sequential_image_generation": "disabled",
        "watermark": False,
    }
)

print(resp.data[0].url)
```

### Python（OpenAI SDK · 多圖融合）

```python theme={null}
resp = client.images.generate(
    model="seedream-4-5-251128",
    prompt="Replace the clothing in image 1 with the outfit from image 2, keeping the lighting style of image 3.",
    size="4K",
    response_format="url",
    extra_body={
        "image": [
            "https://your-oss.example.com/person.png",
            "https://your-oss.example.com/outfit.png",
            "https://your-oss.example.com/lighting-ref.png",
        ],
        "sequential_image_generation": "disabled",
        "watermark": False,
    }
)

print(resp.data[0].url)
```

### Python（OpenAI SDK · 批次序列生成）

```python theme={null}
resp = client.images.generate(
    model="seedream-5-0-260128",
    prompt=(
        "Generate four cinematic sci-fi storyboard scenes:"
        "Scene 1 — astronaut repairing a spacecraft;"
        "Scene 2 — meteor strike in deep space;"
        "Scene 3 — emergency dodge in zero gravity;"
        "Scene 4 — astronaut returning to ship."
    ),
    size="2K",
    response_format="url",
    extra_body={
        "sequential_image_generation": "auto",
        "sequential_image_generation_options": {"max_images": 4},
        "watermark": False,
    }
)

for item in resp.data:
    print(item.url)
```

### cURL（多圖融合）

```bash theme={null}
curl -X POST "https://api.apiyi.com/v1/images/generations" \
  -H "Authorization: Bearer sk-your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "seedream-5-0-260128",
    "prompt": "Replace the clothing in image 1 with the outfit from image 2.",
    "image": [
      "https://your-oss.example.com/person.png",
      "https://your-oss.example.com/outfit.png"
    ],
    "sequential_image_generation": "disabled",
    "size": "2K",
    "response_format": "url",
    "watermark": false
  }'
```

### Node.js（原生 fetch · 批次序列）

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/generations', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-your-api-key'
    },
    body: JSON.stringify({
        model: 'seedream-5-0-260128',
        prompt: 'A four-panel comic about a cat astronaut: launch, space walk, alien encounter, return home.',
        size: '2K',
        sequential_image_generation: 'auto',
        sequential_image_generation_options: { max_images: 4 },
        response_format: 'url',
        watermark: false
    })
});

const { data } = await resp.json();
data.forEach((item, i) => console.log(`#${i + 1}:`, item.url));
```

<Warning>
  **參考圖請傳公網 URL，不要傳 base64（2026-09-11 起重點提醒）**

  `image` 陣列的元素是 URL 時，請求體只有幾 KB，BytePlus 會**直接從新加坡機房去下載你的圖片**（實測下載方 IP 屬於 BytePlus，不經過 API易 閘道）。
  元素是 `data:image/...;base64,...` 時，幾張高畫質參考圖的請求體動輒 20 到 30 MB，要先整體上傳到 API易 閘道再轉發到新加坡，跨境上傳慢的時候會超過原廠入口 600 秒的請求體超時，返回 `400 Error when parsing request`，
  此時整條請求失敗且不會自動切換成 URL 方式，因為閘道不會替你把 base64 轉成可下載的連結。

  * ✅ 把圖片放到自己的 OSS / 圖床，傳公網可直接 GET、無鑑權的 URL，單張建議不超過 10 MB
  * ⚠️ 確實只能傳 base64 時，先壓縮：長邊縮到 2048px 以內、品質 0.9 重編碼，多張合計控制在 6 MB 以內
  * ❌ 不要傳 20 MB 以上的 base64 請求體，也不要傳內網地址或需要登入的連結（BytePlus 下載失敗會返回 `InvalidParameter: Error while downloading`）
</Warning>

## 引數說明速查

| 欄位                                               | 型別              | 必填        | 預設         | 說明                                                                                                              |
| ------------------------------------------------ | --------------- | --------- | ---------- | --------------------------------------------------------------------------------------------------------------- |
| `model`                                          | string          | 是         | —          | `seedream-5-0-260128` / `seedream-4-5-251128` / `seedream-4-0-250828` / `seedream-5-0-pro-260628`（專業版，\$0.12/次） |
| `prompt`                                         | string          | 是         | —          | 編輯 / 融合 / 序列指令                                                                                                  |
| `image`                                          | array of string | 否（編輯場景必填） | —          | 參考圖陣列，元素為 URL 或 base64 data URI（`data:image/jpeg;base64,...`，已實測），**最多 10 張**（4.5 / 5.0-pro 官方明確）               |
| `sequential_image_generation`                    | string          | 否         | `disabled` | `disabled` 單圖輸出；`auto` 批次序列輸出。**5.0-pro 不支援：傳任何值（含 `disabled`）都返回 400，用 pro 時請勿傳此引數**                           |
| `sequential_image_generation_options.max_images` | integer         | 否         | —          | 僅 `auto` 模式生效，輸出張數（受 **輸入+輸出 ≤ 15** 總約束）。5.0-pro 同樣不可傳                                                          |
| `size`                                           | string          | 否         | `2K`       | 預設檔位或精確畫素，**各版本支援檔位見 overview**                                                                                 |
| `response_format`                                | string          | 否         | `url`      | `url` / `b64_json`                                                                                              |
| `output_format`                                  | string          | 否         | `jpeg`     | 5.0 / 5.0-pro 支援 `png` / `jpeg`；4.5 / 4.0 僅 `jpeg`                                                              |
| `watermark`                                      | boolean         | 否         | 見版本預設      | 商用建議 `false`                                                                                                    |
| `stream`                                         | boolean         | 否         | `false`    | 流式輸出，長 prompt 時建議開。**5.0-pro 不支援，傳入即 400**                                                                      |

## 多圖與批次場景的張數約束

| 場景        | 輸入 `image` 張數 | `max_images` | 實際輸出 | 總和約束         |
| --------- | ------------- | ------------ | ---- | ------------ |
| 單圖編輯      | 1             | —            | 1    | 2 ≤ 15 ✅     |
| 多圖融合      | 3             | —            | 1    | 4 ≤ 15 ✅     |
| 多圖融合 + 序列 | 3             | 4            | 4    | 7 ≤ 15 ✅     |
| 多圖融合 + 序列 | 10            | 6            | 6    | 16 > 15 ❌ 報錯 |

<Tip>
  **多輪迭代**：把上一次的輸出 URL 作為下一次的 `image` 輸入，配合新的編輯指令逐步精調。每一輪都按張計費，預算時留意累計成本。
</Tip>

## 響應格式

```json theme={null}
{
  "model": "seedream-5-0-260128",
  "created": 1768518000,
  "data": [
    {
      "url": "https://ark-content-generation-v2-ap-southeast-1.tos-ap-southeast-1.bytepluses.com/seedream-5-0/.../scene-1.png",
      "size": "2048x2048"
    },
    {
      "url": "https://...scene-2.png",
      "size": "2048x2048"
    }
  ],
  "usage": {
    "generated_images": 2,
    "output_tokens": 12480,
    "total_tokens": 12480
  }
}
```

<Warning>
  **⚠️ `data` 陣列長度反映實際輸出張數**

  * `sequential_image_generation: "disabled"` → `data` 單元素
  * `sequential_image_generation: "auto"` + `max_images: N` → `data` 通常 N 個元素（個別 prompt 模型可能輸出少於 N）
  * 計費按 `usage.generated_images` 實際張數算，**不是按 `max_images`**
</Warning>

<Info>
  編輯請求和文生圖請求**計費完全一致**——按出圖張數算。多圖輸入（參考圖）不額外計費。
</Info>


## OpenAPI

````yaml api-reference/seedream-image-edit-openapi.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: Seedream 图片编辑 / 多图融合 / 批量序列 API
  description: >
    BytePlus 火山方舟 Seedream 系列图像生成模型 — 编辑 / 多图融合 / 批量序列接口。


    **重要**：Seedream 没有独立的 `/v1/images/edits` 端点，编辑 / 多图 / 序列都走 `POST
    /v1/images/generations`，区别只在请求体的 `image` 与 `sequential_image_generation` 参数。


    - 单图编辑：`image: ["url"]` + `sequential_image_generation: "disabled"`

    - 多图融合：`image: ["url1", "url2", ...]` + `disabled`（最多 10 张参考图）

    - 批量序列：`sequential_image_generation: "auto"` + `max_images`

    - 总约束：**输入参考图 + 输出图 ≤ 15 张**


    与 OpenAI gpt-image-2 不同：本接口**不接受 multipart/form-data**，请把图片传到 OSS / 公网图床后用
    URL 数组传入。


    **认证方式**：在请求头中添加 `Authorization: Bearer YOUR_API_KEY`
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
      summary: 图片编辑 / 多图融合 / 批量序列
      description: |
        基于参考图（`image` URL 数组）+ 编辑指令生成新图，或开启批量序列模式输出多张连贯图像。

        - 单图编辑场景：传 1 张 image + disabled
        - 多图融合场景：传多张 image + disabled，prompt 中用「图1/图2」指代
        - 批量序列场景：传或不传 image + auto + max_images
      operationId: editSeedreamImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SeedreamEditRequest'
            example:
              model: seedream-5-0-260128
              prompt: Replace the clothing in image 1 with the outfit from image 2.
              image:
                - https://your-oss.example.com/person.png
                - https://your-oss.example.com/outfit.png
              sequential_image_generation: disabled
              size: 2K
              response_format: url
              watermark: false
      responses:
        '200':
          description: 成功生成编辑后图片
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SeedreamImageResponse'
        '400':
          description: 参数非法（image 数组超 10、输入+输出超 15、size 不支持等）
        '401':
          description: 未授权 - API Key 无效
        '403':
          description: 内容审核拦截
        '404':
          description: image 数组中的 URL 无法访问
        '429':
          description: 触发 500 RPM 限流或余额不足
        '500':
          description: 服务器内部错误
      security:
        - bearerAuth: []
components:
  schemas:
    SeedreamEditRequest:
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
          description: 编辑 / 融合 / 序列指令。多图场景建议用「图1/图2」明确指代顺序
          example: Replace the clothing in image 1 with the outfit from image 2.
        image:
          type: array
          items:
            type: string
            format: uri
          description: 参考图 URL 数组。**最多 10 张**（4.5 官方明确）。注意输入 + 输出张数总和 ≤ 15
          maxItems: 10
          example:
            - https://your-oss.example.com/person.png
            - https://your-oss.example.com/outfit.png
        sequential_image_generation:
          type: string
          description: 图像生成模式开关。disabled = 单图输出（默认）；auto = 批量序列输出，配合 max_images 指定张数
          enum:
            - disabled
            - auto
          default: disabled
        sequential_image_generation_options:
          type: object
          description: 批量序列生成选项，仅 sequential_image_generation=auto 时生效
          properties:
            max_images:
              type: integer
              description: 最大输出张数。受 输入参考图 + 输出图 ≤ 15 总约束
              minimum: 1
              maximum: 15
              example: 4
        size:
          type: string
          description: |
            输出尺寸。预设档位（各版本支持不同）：
            - `1K`（仅 4.0）/ `2K`（全版本）/ `3K`（仅 5.0）/ `4K`（4.5、4.0）

            或精确像素 `WxH`，总像素 ∈ \[1280×720, 4096×4096\]，宽高比 ∈ \[1/16, 16\]
          example: 2K
          default: 2K
        response_format:
          type: string
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
        watermark:
          type: boolean
          default: false
        stream:
          type: boolean
          description: 流式输出。长 prompt 或多图序列场景建议开启
          default: false
    SeedreamImageResponse:
      type: object
      properties:
        model:
          type: string
          example: seedream-5-0-260128
        created:
          type: integer
          example: 1768518000
        data:
          type: array
          description: 生成结果数组。disabled 模式 1 个元素，auto 模式通常 max_images 个元素（实际可能少于）
          items:
            type: object
            properties:
              url:
                type: string
                example: >-
                  https://ark-content-generation-v2-ap-southeast-1.tos-ap-southeast-1.bytepluses.com/.../image.png
              b64_json:
                type: string
                description: '纯 base64 字符串，不含 data: 前缀'
              size:
                type: string
                example: 2048x2048
        usage:
          type: object
          description: 按 generated_images 实际张数计费，不是按 max_images
          properties:
            generated_images:
              type: integer
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