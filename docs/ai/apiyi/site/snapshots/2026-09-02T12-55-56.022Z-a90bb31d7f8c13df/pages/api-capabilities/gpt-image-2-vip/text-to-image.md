> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 文生图 API 参考

> gpt-image-2-vip 文生图 API 参考与在线调试 — 输入文本描述 + size 锁定输出尺寸生成图片，$0.03/张统一价

<Info>
  右侧的交互式 Playground 支持直接在线调试。请在 **Authorization** 中填入你的 API Key（格式：`Bearer sk-xxx`），输入 `prompt` 与 `size` 后一键发送即可。
</Info>

<Tip>
  **场景说明**：本页用于「文本生成图片」。只需输入提示词与 `size` 即可，无需上传任何图片。如需根据现有图片做编辑或融合，请使用 [图片编辑接口](/api-capabilities/gpt-image-2-vip/image-edit)。

  **与 `gpt-image-2-all` 的区别**：调用结构完全一致，只多一个 `size` 字段；不需要锁尺寸、追求出图速度时改用 [`gpt-image-2-all`](/api-capabilities/gpt-image-2-all/text-to-image) 即可。
</Tip>

<Warning>
  **🖥️ 浏览器 Playground 限制**

  本端点**默认返回 base64 字符串（`b64_json`）**，体积可达数 MB，浏览器 Playground **可能弹出** `请求时发生错误: unable to complete request` ——**实际请求已经成功**，只是浏览器无法显示这么长的 base64。

  **推荐做法**：**复制下方"代码示例"到本地运行**，代码会自动解码并把图片保存为本地文件。
</Warning>

<Info>
  图片 API 全部为**同步调用**：没有异步任务 ID，客户端断开连接结果即丢失、但请求仍会计费。请为本模型设置足够大的 timeout，详见 [图片 API 调用须知与最佳实践](/api-capabilities/image-api-best-practices)。
</Info>

<Warning>
  **⚠️ 关键参数说明**

  * **`size`**：可传 `auto` 让模型自动决定尺寸（vip 在同一提示词下尺寸相对**收敛/固定**），或从 30 档常见尺寸里选（10 比例 × 1K Fast / 2K Recommended / 4K Detail，详见 [概览页 size 完整表](/api-capabilities/gpt-image-2-vip/overview#支持的-size30-档完整对照表)）严格锁尺寸。**写法用半角小写 `x`**，例如 `2048x1360`、`3840x2160`，不要用 `×` 或大写 `X`。
  * **`quality`**：❌ 不接受，**不要传**。
  * **`n`**：❌ 不接受，单次仅返回 1 张图。**传 n=3 会按 0.09 \$ 扣费但只返回 1 张**，请把 `n` 字段从请求里去掉。
  * **`aspect_ratio`**：❌ 不接受。比例直接由 `size` 决定。
  * **`response_format`**：不传默认返回 base64（纯 base64 无前缀，2026-07 实测）；传 `"url"` 可返回图片 URL。**强依赖 URL 输出**的业务建议把令牌分组切到 `image2_OSS`，稳定输出 URL、不降级为 base64。
</Warning>

## 代码示例

### Python

```python theme={null}
import requests

API_KEY = "sk-your-api-key"

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "model": "gpt-image-2-vip",
        "prompt": "黄昏时的海边老灯塔，电影画幅，写实风格",
        "size": "2048x1152",         # 16:9 2K Recommended
        "response_format": "url"     # 默认返回 base64，读 url 字段需显式传
    },
    timeout=300  # 保守值，吸收长尾 + 图片下载耗时
).json()

image_url = response["data"][0]["url"]
print(image_url)
```

**4K Detail 档示例（壁纸 / 印刷）**：

```python theme={null}
import requests

response = requests.post(
    "https://api.apiyi.com/v1/images/generations",
    headers={"Authorization": "Bearer sk-your-api-key"},
    json={
        "model": "gpt-image-2-vip",
        "prompt": "桌面壁纸，赛博朋克城市夜景，霓虹招牌，雨后倒影",
        "size": "3840x2160"          # 16:9 4K Detail
    },
    timeout=300
).json()

# 实测（2026-07）b64_json 为纯 base64（无 data: 前缀）；历史版本曾含前缀，做个检测最稳
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
    "model": "gpt-image-2-vip",
    "prompt": "白色陶瓷马克杯放在灰色桌面上的产品图，柔和自然光",
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
      model: "gpt-image-2-vip",
      prompt: "1:1 方形 LOGO，极简猫咪线条",
      size: "2048x2048"        // 1:1 2K Recommended
    })
  }
);

const data = await response.json();
// 实测为纯 base64（无 data: 前缀），渲染前需拼接；历史版本曾自带前缀，做个检测最稳
let b64 = data.data[0].b64_json;
if (!b64.startsWith("data:")) b64 = `data:image/png;base64,${b64}`;
document.getElementById("result").src = b64;
```

### OpenAI SDK（Python，推荐）

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

resp = client.images.generate(
    model="gpt-image-2-vip",
    prompt="水墨山水，国画风格，纵向构图",
    size="1536x2048",        # 3:4 2K Portrait
)
print(resp.data[0].url)
```

## 参数说明速查

| 参数       | 类型     | 必填       | 说明                                                                                |
| -------- | ------ | -------- | --------------------------------------------------------------------------------- |
| `model`  | string | 是        | 固定填 `gpt-image-2-vip`                                                             |
| `prompt` | string | 是        | 提示词，描述画面内容、风格、光线等                                                                 |
| `size`   | string | **强烈建议** | 输出尺寸：`auto`（模型自动决定，**vip 在同一提示词下尺寸相对固定**）或 30 档之一；写法 `宽x高`（半角小写 `x`）；省略时等同 `auto` |

<Tip>
  **size 速查**：常用挑这几个就够：

  * 电商主图：`2048x1360` (3:2 2K) / `2048x2048` (1:1 2K)
  * 海报竖图：`1536x2048` (3:4 2K) / `2480x3312` (3:4 4K)
  * 视频封面：`2048x1152` (16:9 2K) / `3840x2160` (16:9 4K)
  * 故事/手机壁纸：`1152x2048` (9:16 2K) / `2160x3840` (9:16 4K)

  完整 30 档表见 [概览页](/api-capabilities/gpt-image-2-vip/overview#支持的-size30-档完整对照表)。
</Tip>

## 响应格式

**默认返回 base64**（`data[0].b64_json`，纯 base64 无前缀，2026-07 实测）。如需 **图片 URL**：显式传 `response_format: "url"` 即可；**强依赖 URL 输出**的业务建议把令牌分组切到 **`image2_OSS`**，稳定输出 URL、不降级为 base64。`data[0]` 中只会出现 `url` 或 `b64_json` 之一，不会两者都返回。

**`b64_json` 模式**（默认）：

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

**`url` 模式**（显式传 `response_format: "url"`；强依赖 URL 建议用 `image2_OSS` 分组，R2 CDN 全球加速）：

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
  **兼容性提示**：2026-07 实测 `b64_json` 字段为**纯 base64（不含 `data:` 前缀）**，需解码写文件或自行拼接前缀后渲染；**历史版本曾直接带前缀**。请在代码里做 `startsWith('data:')` 检测后再处理，兼容两种形态。
</Warning>

## 相关资源

<CardGroup cols={2}>
  <Card title="模型概览（含完整 size 表）" icon="sparkles" href="/api-capabilities/gpt-image-2-vip/overview">
    30 档 size 完整对照表、定价、技术规格
  </Card>

  <Card title="图片编辑 API" icon="image" href="/api-capabilities/gpt-image-2-vip/image-edit">
    `/v1/images/edits` 多图融合与改图
  </Card>

  <Card title="姐妹模型 gpt-image-2-all" icon="copy" href="/api-capabilities/gpt-image-2-all/text-to-image">
    不需要锁尺寸时调用方式一致，出图更快（约 30–60s）
  </Card>
</CardGroup>


## OpenAPI

````yaml api-reference/gpt-image-2-vip-generate-openapi.yaml POST /v1/images/generations
openapi: 3.1.0
info:
  title: gpt-image-2-vip 文生图 API
  description: >
    GPT 图像生成 Codex 官逆模型 `gpt-image-2-vip` — 文生图接口。


    - 按次计费，$0.03/张（所有 size 统一价，4K 不加价）

    - 支持 30 档常见 size（10 比例 × 1K Fast / 2K Recommended / 4K Detail）

    - 约 90–150 秒出图，支持中文提示词

    - 不支持 quality / n / aspect_ratio

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
        - 不要传 `quality` / `n`
        - 如需编辑或多图融合，请使用 [图片编辑接口](/api-capabilities/gpt-image-2-vip/image-edit)
      operationId: generateGptImage2VipTextToImage
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TextToImageRequest'
            example:
              model: gpt-image-2-vip
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
          description: 模型名称，固定为 gpt-image-2-vip
          enum:
            - gpt-image-2-vip
          default: gpt-image-2-vip
        prompt:
          type: string
          description: 提示词，描述画面内容、风格、光线等
          example: 黄昏时的海边老灯塔，电影画幅，写实风格
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