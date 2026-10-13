> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 图像理解（识图）API

> 用 Gemini、GPT、Claude、Seed（豆包）、Qwen、Kimi 等模型识别图片：OCR 文字提取、计数、场景描述、多图对比。含 24 个模型的实测清单、每张图 tokens、四种调用写法（OpenAI 兼容 / Responses / Anthropic / Gemini 原生）各自支持哪些模型，以及大图、直链等常见报错。

API易 上绝大多数主流对话模型都能「看图」：OCR 提取文字、数物体、描述场景、对比多张图。本页给出 2026-10-11 (UTC+8) 的实测支持清单、一张图要花多少 tokens、四种调用写法各自能走哪些模型，以及最常见的报错。

<Note>
  **先看这三条**：

  1. **通用写法是 OpenAI 兼容的 `image_url`**：`{"type": "image_url", "image_url": {"url": "data:image/png;base64,..."}}`，实测 22 个视觉模型全部可用。Responses、Anthropic 两种写法**只有部分模型能走**，见「四种写法支持哪些模型」。
  2. **`deepseek-v4-pro`、`glm-5.3` 等纯文本模型不吃图**：请求照样返回 200，但图片被丢掉，模型只会回答「看不到」。判断图片有没有进模型，看响应里的 `usage.prompt_tokens`。
  3. **优先用 Base64**：公网直链要由上游去下载，图床慢、有防盗链、或响应头缺 `Content-Length`（Qwen 会直接 400）都会失败。
</Note>

<CardGroup cols={2}>
  <Card title="识别图片 · API易 在线工具" icon="scan-eye" href="https://imagen.apiyi.com/#understand">
    不想写代码？网页端直接上传图片（支持多图联合分析），内置万物识别、商品标题、五点描述、属性分析、OCR 提取等模板，可切换模型对比效果，填入 API易 令牌即可使用。
  </Card>

  <Card title="视频理解 API" icon="video" href="/api-capabilities/video-understanding">
    需要分析视频？看视频理解的支持清单与写法。
  </Card>
</CardGroup>

## 让 AI Agent 帮你接入

<Note>
  在用 Codex / Claude Code / Cursor 开发的话，把下面这段提示词复制给它。它会先抓本页的纯文本版（任意文档页地址后加 `.md`），再按你项目的技术栈写代码——通用 `image_url` 写法、**大图先缩放**、**用 `prompt_tokens` 确认图片真的进了模型**这几个高频问题已经写死在要求里。
</Note>

<Prompt description="让编程 Agent 接入或排查图像理解（识图 / OCR）。复制后直接粘贴给 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  帮我在当前项目里接入 / 排查图像理解：把图片交给多模态模型，做 OCR 文字提取、计数、场景描述或多图对比。

  先读文档再动手：抓 [https://docs.apiyi.com/api-capabilities/vision-understanding.md](https://docs.apiyi.com/api-capabilities/vision-understanding.md) 拿到本页纯文本版。

  接入要求：

  1. 端点与写法：默认走 OpenAI 兼容的 `POST https://api.apiyi.com/v1/chat/completions`，图片用 `{"type": "image_url", "image_url": {"url": ...}}` 放进 `messages[].content`，和文本块并列；多张图就放多个 `image_url` 块，顺序就是图 1、图 2。这个写法所有视觉模型都认。只有项目本来就在用 Responses / Anthropic SDK 时才换写法，并且先对照本页「四种写法支持哪些模型」——**Responses 端点不能调 Gemini / Claude / Seed，Anthropic 端点不能调 Seed / DeepSeek，Grok 走 Anthropic 端点会静默丢图**。

  2. 选模型：默认用 `gemini-3.8-flash`（全项实测通过、价格低）；要求最稳的 OCR 与理解用 `claude-sonnet-5-5` 或 `gpt-6-sol`；大批量低成本用 `claude-haiku-5-5`、`qwen3.8-flash` 或 `gemini-3.5-flash-lite`。`deepseek-v4-pro`、`glm-5.3` 等纯文本模型不吃图，别选。`gpt-6-luna` OCR 会漏字、`gemini-3.1-flash-lite` 计数会数错，对准确率敏感时别用。把模型名做成可配置项。

  3. 图片怎么传：**优先 Base64 data URI**（`data:image/png;base64,...`），前缀里的格式要按文件真实内容（文件头）判断，不要信扩展名。公网直链也能用，但由上游去下载：图床要能公开访问、响应快，并且**响应头要带 `Content-Length`**（Qwen 系缺了会报 `Missing Content-Length of multimodal url`）。URL 和 Base64 是两种互斥写法，不要把链接拼进 `data:...;base64,` 后面。

  4. **大图先缩放再传**：把长边缩到 2048px 左右、转成 JPEG（质量 85\~90）。不缩的代价：GPT 按图块计费，一张 9000×6000 的图实测记了 63658 个输入 tokens；Claude 单图 base64 超 10MB 直接拒（状态码是 429，别当成限流去重试）；Seed 总像素上限 3600 万；Kimi 单图超 16384 tokens 报 400。

  5. **确认图片真的进了模型**：每次都读响应里的 `usage.prompt_tokens`。一张 1200×760 的图在各家约 900\~1300 tokens；**如果只有几十个 token，说明图被丢了**，这时要报错，不要把模型的回答当结果用——没收到图的模型偶尔会编出一段像样的内容。

  6. 参数：chat 端点上 `max_tokens`、`temperature` 在 GPT / Claude / Gemini 上都正常可用。`detail: "low"` 只有 `gpt-5.4-mini` 和 Seed 认（tokens 降到约一半以下，但小字识别会变差），其他模型忽略。要结构化结果就在提示词里要求输出 JSON，并在代码里做解析容错。

  7. 超时与成本：单张图实测 2 到 12 秒，大图更慢（10MB 图 30 到 70 秒），客户端超时给 120 秒以上。按 token 计费，一张图的输入成本从约 \$0.0001（Claude Haiku 5.5 / Qwen3.8 Flash）到约 \$0.005（Claude Opus 5.5）不等。

  8. Key 从环境变量 `APIYI_API_KEY` 读，不要硬编码进代码、也不要提交进 git。

  9. 改完真跑一次：用一张含文字的图片调一次，把模型回答、`usage.prompt_tokens` 和这次调用的花费贴给我。
</Prompt>

<Accordion title="这段提示词替你挡掉了什么">
  | 要求 | 挡掉的坑 |
  | - | - |
  | 默认 chat `image_url` | Responses / Anthropic 端点只有部分模型能走，换模型就 400 或静默丢图 |
  | 优先 Base64、按文件头判断格式 | 直链依赖上游下载，Qwen 还要求图床带 `Content-Length` |
  | 大图先缩放 | GPT 一张大图记 6 万多 tokens；Claude、Seed、Kimi 直接拒收 |
  | Claude 超限是 429 | 别当成限流反复重试，缩图才是解法 |
  | 读 `usage.prompt_tokens` | 纯文本模型静默丢图照样返回 200，token 数是唯一能程序化发现的信号 |
  | 不选纯文本模型 | `deepseek-v4-pro`、`glm-5.3` 收到图只会说「看不到」 |
</Accordion>

## 支持的模型

以下结论来自 2026-10-11 (UTC+8) 的实测：同一张 1200×760 的中英混排订单图（含表格）要求逐字 OCR，另测数图形个数、两图找不同、公网直链，并用一张空白图做对照，排除「没看也能答」。

| 厂商 | 模型 ID | 实测耗时 | 一张图输入 tokens | 实测表现 | 推荐场景 |
| - | - | :-: | :-: | - | - |
| Google | `gemini-3.8-flash` 🔥 | 5–8 秒 | 约 1090 | 全项通过，价格低；支持 Gemini 原生格式 | 默认首选、日常识图 |
| Google | `gemini-3.1-pro-preview` | 9–12 秒 | 约 1090 | 全项通过 | 复杂图表、需要推理的识图 |
| Google | `gemini-3.5-flash-lite` | 2–5 秒 | 约 1090 | 全项通过，最快之一 | 大批量、低延迟 |
| OpenAI | `gpt-6-sol` 🔥 | 5–6 秒 | 约 1100 | 全项通过 | 通用识图、Responses 项目 |
| OpenAI | `gpt-5.6-terra` | 5 秒 | 约 1100 | 全项通过 | 通用识图 |
| OpenAI | `gpt-6-luna` | 约 4 秒 | 约 1100 | ⚠️ 便宜但 OCR 会漏字（5 次都把编号、电话读错） | 粗略描述，不做 OCR |
| Anthropic | `claude-sonnet-5-5` 🔥 | 3–4 秒 | 约 1210 | 全项通过 | 高要求 OCR 与理解 |
| Anthropic | `claude-opus-5-5` | 5–9 秒 | 约 1210 | 全项通过 | 专业图文分析 |
| Anthropic | `claude-haiku-5-5` | 3–8 秒 | 约 1210 | 全项通过，单价极低 | 大批量识图、打标 |
| xAI | `grok-4.7` | 4–6 秒 | 约 950 | 全项通过 | 通用识图 |
| 字节跳动 | `seed-2-0-pro-260328` | 9–11 秒 | 约 1260 | 全项通过；认 `detail: low`（约 600 tokens） | 国产首选 |
| 字节跳动 | `seed-2-0-mini-260428` | 5–10 秒 | 约 1260 | 全项通过 | 低成本批量 |
| 字节跳动 | `dola-seed-2-1-turbo-260628` | 约 10 秒 | 约 1260 | 全项通过；默认开启思考 | 需要推理的识图 |
| 阿里 | `qwen3.8-max` | 7–9 秒 | 约 880 | 全项通过（直链需 `Content-Length`） | 复杂识图 |
| 阿里 | `qwen3.8-flash` | 4–11 秒 | 约 910 | 全项通过（同上），单价极低 | 大批量、成本敏感 |
| 阿里 | `qwen3-vl-plus` | 6–9 秒 | 约 910 | 全项通过（同上） | 视觉专用 |
| 月之暗面 | `kimi-k3` | 6–8 秒 | 约 1220 | 全项通过 | 深度分析 |
| MiniMax | `MiniMax-M3` | 4–7 秒 | 约 1200 | 全项通过；思考过程 `<think>` 混在正文里，需自行剥离 | 通用识图 |
| DeepSeek | `deepseek-v4-flash-vision-exp` | 3–5 秒 | 约 570 | 全项通过，图片 tokens 最省 | 低成本识图 |

`gemini-3.1-flash-lite` 与 `gpt-5.4-mini` 也能识图、OCR 全对，但**数图形个数会数错**（实测分别 0/3、1/3 次数对），计数类任务不建议用。`qwen-vl-ocr` 是 OCR 专用模型，**只输出表格、表格外的文字不输出**，多图也只认第一张，只适合纯表格 / 证件类场景。

<Note>模型价格与官网对齐，且可能随官网调整；上表仅供参考，具体以顶部导航「模型价格」栏目为准：[模型价格](/models/index)。</Note>

### 不支持图片的模型

| 模型 | 传入图片时的表现 |
| - | - |
| `deepseek-v4-pro` | 返回 200，但图片被丢掉（`prompt_tokens` 只多 5 个），模型回答「看不到」 |
| 智谱 `glm-5.3` | chat 端点返回 200 但丢图；Responses 端点明确报 `only supports text modality` |

判断其他模型吃不吃图，以模型详情页的「输入模态」为准，详见 [文本+出图能不能一个接口](/faq/text-and-image-in-one-api)。

## 四种写法支持哪些模型

| 写法 | 实测可用 | 不可用 |
| - | - | - |
| **OpenAI 兼容 chat**（`/v1/chat/completions` + `image_url`） | 上表全部模型 | — |
| **OpenAI Responses**（`/v1/responses` + `input_image`） | GPT、Grok、Qwen3.8、Kimi、MiniMax、DeepSeek Vision | Gemini、Claude、Seed、Qwen3-VL 报 400 |
| **Anthropic Messages**（`/v1/messages` + `image`，base64） | Claude、Gemini、GPT、Qwen、Kimi、MiniMax | Seed 报 401、DeepSeek 报 400；**Grok 静默丢图** |
| **Anthropic Messages**（`image`，url source） | 仅 Claude | **Gemini 静默丢图**；GPT、Qwen 报 400 |
| **Gemini 原生**（`generateContent` + `inline_data`） | Gemini（实测 3.8 Flash、3.1 Pro） | — |

<Tip>
  **新项目一律用 OpenAI 兼容 chat 写法**，换模型只改模型名。Responses 适合已经在用 OpenAI Responses SDK 的项目；Anthropic 写法适合 Claude 生态（如 Claude Code、Anthropic SDK）；Gemini 原生适合已经在用 `google-genai` SDK 的项目。
</Tip>

## 快速开始：通用写法（`image_url`）

### 本地图片（Base64，推荐）

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="YOUR_API_KEY",            # 替换为您的 API易 密钥
    base_url="https://api.apiyi.com/v1"
)

with open("demo.png", "rb") as f:
    image_b64 = base64.b64encode(f.read()).decode()

response = client.chat.completions.create(
    model="gemini-3.8-flash",          # 也可换成 claude-sonnet-5-5 / gpt-6-sol / qwen3.8-flash 等
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "请把图片里的所有文字逐字提取出来，表格用 Markdown 表格输出"},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_b64}"}},
        ],
    }],
)

print(response.choices[0].message.content)
print(response.usage.prompt_tokens)    # 一张 1200×760 的图约 900~1300；只有几十说明图没进模型
```

### 公网图片 URL

```python theme={null}
response = client.chat.completions.create(
    model="gemini-3.8-flash",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "请详细描述这张图片的内容"},
            {"type": "image_url", "image_url": {"url": "https://your-bucket.example.com/demo.png"}},
        ],
    }],
)
```

### 多图对比

多张图按顺序放多个 `image_url` 块，在提示词里用「图 1」「图 2」指代：

```python theme={null}
response = client.chat.completions.create(
    model="claude-sonnet-5-5",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "下面依次是图 1 和图 2，请说出两张图有什么不同"},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image1_b64}"}},
            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image2_b64}"}},
        ],
    }],
)
```

### curl

```bash theme={null}
# 1. 生成请求体：Base64 字符串很长，先写进文件，不要直接拼进命令行参数（macOS / Linux）
printf '{"model":"gemini-3.8-flash","messages":[{"role":"user","content":[{"type":"text","text":"请描述这张图片"},{"type":"image_url","image_url":{"url":"data:image/png;base64,%s"}}]}]}' \
  "$(base64 < demo.png | tr -d '\n')" > req.json

# 2. 发送
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -d @req.json
```

<Tip>
  **为什么推荐 Base64**：图片 URL 方式需要上游实时下载该图片，图床响应慢、有防盗链或访问限制都会失败；Qwen 系还要求图床响应头带 `Content-Length`（部分 CDN 用分块传输不带这个头，实测会报 `Missing Content-Length of multimodal url`）。Base64 把图片直接放进请求体，不依赖任何外部下载。Base64 体积约为原图的 1.33 倍，大图先缩放再编码，见「大图先缩放」。
</Tip>

## 其他写法

### OpenAI Responses（`input_image`）

适合已经在用 OpenAI Responses SDK 的项目。**只能调 GPT、Grok、Qwen3.8、Kimi、MiniMax、DeepSeek Vision**，Gemini / Claude / Seed 会报 400。

```python theme={null}
response = client.responses.create(
    model="gpt-6-sol",
    input=[{
        "role": "user",
        "content": [
            {"type": "input_text", "text": "请把图片里的所有文字逐字提取出来"},
            {"type": "input_image", "image_url": f"data:image/png;base64,{image_b64}"},
        ],
    }],
)

print(response.output_text)
```

### Anthropic Messages（`image`）

适合 Claude 生态（Anthropic SDK、Claude Code 等），端点 `https://api.apiyi.com`。base64 方式可调 Claude、Gemini、GPT、Qwen、Kimi、MiniMax；**url source 只有 Claude 能用**（Gemini 会静默丢图）。

```python theme={null}
import anthropic, base64

client = anthropic.Anthropic(
    api_key="YOUR_API_KEY",            # 替换为您的 API易 密钥
    base_url="https://api.apiyi.com"
)

with open("demo.png", "rb") as f:
    image_b64 = base64.b64encode(f.read()).decode()

message = client.messages.create(
    model="claude-sonnet-5-5",
    max_tokens=1024,
    messages=[{
        "role": "user",
        "content": [
            {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": image_b64}},
            {"type": "text", "text": "请把图片里的所有文字逐字提取出来"},
        ],
    }],
)

print(message.content[0].text)
# Claude 也可以直接传公网地址：{"type": "image", "source": {"type": "url", "url": "https://..."}}
```

### Gemini 原生格式（`inline_data`）

已经在用谷歌官方 `google-genai` SDK 的项目，把 `base_url` 换成 `https://api.apiyi.com` 即可：

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_API_KEY",            # 替换为您的 API易 密钥
    http_options={"base_url": "https://api.apiyi.com"}
)

with open("demo.png", "rb") as f:
    image_bytes = f.read()

response = client.models.generate_content(
    model="gemini-3.8-flash",
    contents=types.Content(parts=[
        types.Part.from_bytes(data=image_bytes, mime_type="image/png"),
        types.Part(text="请把图片里的所有文字逐字提取出来"),
    ]),
)

print(response.text)
print(response.usage_metadata.prompt_tokens_details)  # 含 IMAGE 一项，说明图片确实进了模型
```

REST 写法：`POST https://api.apiyi.com/v1beta/models/gemini-3.8-flash:generateContent`，请求头 `x-goog-api-key: YOUR_API_KEY`，图片放在 `contents[].parts[]` 的 `{"inline_data": {"mime_type": "image/png", "data": "<BASE64>"}}` 里。更多原生用法见 [Gemini 原生格式调用](/api-capabilities/gemini/native)。

## 大图先缩放

各家对大图的处理差别很大。实测一张 9000×6000、约 10MB 的 JPEG：

| 模型 | 结果 |
| - | - |
| `gemini-3.8-flash` | 正常识别，自动缩小，约 1100 tokens |
| `grok-4.7` / `qwen3.8-flash` / `MiniMax-M3` | 正常识别，约 2600~~3700 tokens，耗时 24~~67 秒 |
| `gpt-6-sol` | 正常识别，但**一张图记了 63658 个输入 tokens**（约 \$0.13） |
| `claude-sonnet-5-5` | 拒绝：`image exceeds 10 MB maximum`（**状态码 429**，不是限流） |
| `kimi-k3` | 拒绝：单张图超过 16384 tokens |
| `seed-2-0-pro-260328` | 拒绝：总像素超过 3600 万 |

<Warning>
  **上传前把长边缩到 2048px 左右**：实测把上面那张图缩到 2048×1365 后，表中 8 个模型全部通过、OCR 全对，一张图约 700\~3700 tokens，`gpt-6-sol` 从 63658 降到 3320。Claude 返回 429 时先看报错正文，如果是 `image exceeds` 就是图太大，重试不会成功。
</Warning>

```python theme={null}
import base64, io
from PIL import Image

def image_to_data_uri(path, max_side=2048):
    """缩放到长边 max_side，并统一转成 JPEG，声明与内容一定一致"""
    img = Image.open(path)
    img.thumbnail((max_side, max_side))
    buf = io.BytesIO()
    img.convert("RGB").save(buf, format="JPEG", quality=90)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()
```

## 常见错误

### 图片 URL 下载超时

使用图片 URL 方式时，如果收到如下错误：

```json theme={null}
{
  "error": {
    "message": "Timeout while downloading ip:port",
    "type": "invalid_request_error",
    "code": "invalid_image_url"
  }
}
```

这表示**上游在拉取该图片 URL 时下载超时**，与模型、密钥、额度均无关。常见原因：图床响应慢或对部分地区不友好、图片过大、URL 设有防盗链或需要登录。

**解决方法**：改用 Base64（推荐，彻底绕开下载环节）；或更换为响应更快、可公开访问的直链；或压缩图片后重试。

### Missing Content-Length of multimodal url（Qwen）

Qwen 系模型要求图床的响应头带 `Content-Length`。部分 CDN（如 Cloudflare）以分块方式返回图片、不带这个头，就会报这个错；同一张图换成对象存储直链或 Base64 即可。

### invalid base64 data（URL 误放进 Base64 字段）

如果收到如下 400 错误（关键特征是 `invalid base64 data`，不同模型文案略有差异）：

```json theme={null}
{
  "type": "error",
  "error": {
    "type": "invalid_request_error",
    "message": "...source.base64: invalid base64 data"
  }
}
```

通常是**把图片 URL 拼进了 data URI 的 Base64 数据位**：

```json theme={null}
// ❌ 错误写法：base64, 后面跟的是图片链接，不是 Base64 编码
"image_url": {
  "url": "data:image/jpeg;base64,https://example.com/generations/temp-xxx.jpg"
}
```

`data:image/...;base64,` 前缀后面必须是**图片文件本身的 Base64 编码字符串**。URL 方式和 Base64 方式是两种互斥的传参形式，不能混拼：

```json theme={null}
// ✅ 图片是网络 URL → 直接传链接，不加任何前缀
"image_url": {
  "url": "https://example.com/generations/temp-xxx.jpg"
}

// ✅ 图片是本地文件/二进制 → 先 Base64 编码，再拼 data URI
"image_url": {
  "url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
}
```

<Tip>
  **自检建议**：发送前判断图片来源——字符串以 `http` 开头就走 URL 方式，否则才做 Base64 编码并拼 data URI。合法的 Base64 字符串不会包含 `://`、`?` 等字符，若在 `base64,` 之后看到这些字符，基本可以断定是把链接拼进去了。
</Tip>

### 声明的图片格式与实际格式不符（media type mismatch）

如果收到如下 400 错误（关键特征是 `The image was specified using the image/png media type, but the image appears to be a image/jpeg image`）：

```json theme={null}
{
  "status_code": 400,
  "error": {
    "message": "InvokeModel: operation error Bedrock Runtime: InvokeModel, https response error StatusCode: 400, ... ValidationException: ...source.base64: The image was specified using the image/png media type, but the image appears to be a image/jpeg image"
  }
}
```

意思是：data URI 里**声明**图片是 PNG（`data:image/png;base64,...`），上游解码后检查文件头，发现**实际内容是 JPEG**，于是拒绝。常见诱因是按扩展名推断格式（文件被改过后缀）、或代码里写死了 `image/png`。

<Info>
  是否校验取决于模型走的上游通道：2026-10-11 (UTC+8) 实测把 JPEG 声明成 PNG，22 个视觉模型全部正常识别；但 Claude 系经 Bedrock 通道时会报上面这个错。按「声明必须与内容一致」来写代码，在任何通道上都不会踩坑。
</Info>

**解决方法**：按文件头判断真实格式再拼 data URI，或者像「大图先缩放」里的函数那样统一用 PIL 转成 JPEG：

```python theme={null}
import base64

def image_to_data_uri(image_path):
    """按文件头识别真实格式，杜绝 media type 与内容不一致"""
    with open(image_path, "rb") as f:
        data = f.read()

    if data[:8] == b"\x89PNG\r\n\x1a\n":
        mime = "image/png"
    elif data[:3] == b"\xff\xd8\xff":
        mime = "image/jpeg"
    elif data[:6] in (b"GIF87a", b"GIF89a"):
        mime = "image/gif"
    elif data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        mime = "image/webp"
    else:
        raise ValueError(f"无法识别的图片格式: {image_path}")

    return f"data:{mime};base64,{base64.b64encode(data).decode('utf-8')}"
```

<Tip>
  `file xxx.png`（macOS / Linux 命令行）一秒看出文件真实格式；Python 里 `Image.open(path).format` 也能拿到。
</Tip>

## 进阶技巧

### 确认图片真的进了模型

看响应里的 `usage.prompt_tokens`：一张 1200×760 的图在各家约 900\~1300 tokens（DeepSeek Vision 约 570）；**如果只比纯文本多几个甚至没变，说明图片被丢掉了**。这种情况出现在纯文本模型（`deepseek-v4-pro`、`glm-5.3`），以及 Grok 走 Anthropic 端点、Gemini 走 Anthropic url source 时。

<Warning>
  **没收到图的模型可能编答案**。实测在不带图的情况下要求「逐字提取图片文字」，`gemini-3.8-flash` 6 次中有 1 次编出了一整张并不存在的表格，其余模型都如实说看不到。所以批量流程里不要只看回答，先用 `prompt_tokens` 确认图片已送达。
</Warning>

### `detail` 参数

`image_url` 里的 `detail: "low"` 只有部分模型认：`gpt-5.4-mini`（1147 → 233 tokens，但小字开始读错）、Seed（1340 → 602 tokens，OCR 仍全对）；GPT-6 / 5.6、Gemini、Claude、Qwen 会忽略。想省 tokens，更通用的办法是自己先缩小图片。

### 参数说明

chat 端点上，`max_tokens`、`temperature` 在 GPT（含 GPT-6）、Claude、Gemini 上都能正常使用（实测 `temperature=0.3` 全部通过）。MiniMax-M3 会把思考过程 `<think>...</think>` 放在正文里，需要自行剥离。

### 常见任务的提问思路

同一张图，换提示词就能完成不同任务，无需改代码：

* **OCR**：「逐字提取图片里的所有文字，表格用 Markdown 表格输出」
* **计数 / 结构化**：「数一数每种物体各有几个，只输出 JSON：`{"物体": 数量}`」
* **商品分析**：「识别商品类型和品牌，列出主要卖点与适合人群」
* **多图对比**：「下面依次是图 1 和图 2，逐项说出不同之处」
* **图表解读**：「读出图表的坐标轴、数据趋势和最大最小值」

<Warning>
  医疗影像、证件、人身安全相关的识别结果仅供参考，重要决策需人工复核；不要上传含敏感个人信息的图片。
</Warning>

## 常见问题

<AccordionGroup>
  <Accordion title="哪些模型能看图？">
    本页实测的 22 个视觉模型都能用：Gemini、GPT、Claude、Grok、Seed、Qwen、Kimi、MiniMax、DeepSeek Vision。`deepseek-v4-pro`、`glm-5.3` 等纯文本模型不能。其他模型以模型详情页的「输入模态」为准。
  </Accordion>

  <Accordion title="传了图片，模型却说「看不到」？">
    先看响应里的 `usage.prompt_tokens`：只有几十说明图片没进模型。常见原因：① 选了纯文本模型；② 用 Anthropic 端点调 Grok，或用 Anthropic url source 调 Gemini（都会静默丢图）；③ 公网直链上游拉不到。换成 chat `image_url` + Base64 基本都能解决。
  </Accordion>

  <Accordion title="同一段代码，换个模型就报 400？">
    多半是用了 Responses 或 Anthropic 写法——它们只支持部分模型（见「四种写法支持哪些模型」）。改成 OpenAI 兼容 chat 的 `image_url` 写法即可在各家通用。
  </Accordion>

  <Accordion title="Claude 返回 429，是被限流了吗？">
    先看报错正文。如果是 `image exceeds 10 MB maximum`，是图片太大（按 Base64 后的体积算），重试不会成功，缩放到长边 2048px 左右再传即可。
  </Accordion>

  <Accordion title="为什么一张图花了几万 tokens？">
    GPT 系按图块计费，原图越大 tokens 越多：实测一张 9000×6000 的图在 `gpt-6-sol` 上记了 63658 个输入 tokens。上传前缩放到长边 2048px 左右，实测同一张图在 `gpt-6-sol` 上降到 3320 tokens，各家约 700\~3700 tokens。
  </Accordion>

  <Accordion title="支持哪些图片格式？">
    JPEG、PNG、GIF、WebP 等主流格式都可以；手机相机拍出的 MPO（扩展名仍是 .jpg）实测也能识别。最稳的做法是统一用 PIL 转成 JPEG 再传。
  </Accordion>
</AccordionGroup>

## 相关资源

<CardGroup cols={2}>
  <Card title="模型价格" icon="list" href="/models/index">
    查看全部模型与最新定价
  </Card>

  <Card title="视频理解 API" icon="video" href="/api-capabilities/video-understanding">
    视频内容识别、场景描述与时间戳定位
  </Card>

  <Card title="Gemini 原生格式" icon="sparkles" href="/api-capabilities/gemini/native">
    原生格式的流式、推理预算等用法
  </Card>

  <Card title="文本+出图能不能一个接口" icon="circle-help" href="/faq/text-and-image-in-one-api">
    如何判断模型支持哪些输入模态
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.