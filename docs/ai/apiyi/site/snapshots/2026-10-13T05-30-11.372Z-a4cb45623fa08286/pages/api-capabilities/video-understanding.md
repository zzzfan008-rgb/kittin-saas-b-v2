> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 视频理解 API

> 用 Gemini、Seed（豆包）、Qwen、Kimi 等模型进行视频分析：内容识别、场景描述、动作分析与时间戳定位。含 19 个模型的实测支持清单、通用 video_url 写法、各家输入限制与「不支持视频」的模型名单。

API易 上有多家模型能「看懂」视频：用一段提示词，让模型识别视频里的场景、动作、字幕，并按时间戳定位关键画面。除了 Gemini 系列，**Seed（豆包）全系、Qwen 视觉 / 全模态系列、Kimi K3** 也都实测可用。本页给出支持清单、通用写法，以及最容易踩坑的限制。

<Note>
  **先看这三条**：

  1. **通用写法是 `video_url`**：`{"type": "video_url", "video_url": {"url": "data:video/mp4;base64,..."}}`，Seed / Qwen / Kimi / MiniMax / Gemini 都认。本页旧版的 `image_url` + `data:video/mp4` 写法**只有 Gemini 认**，换成别的模型会直接 400。
  2. **GPT、Grok、Claude、GLM、DeepSeek 不支持视频输入**。其中 GPT 和 GLM 会**静默丢掉视频**、照样返回 200，GPT 还可能编出一段看似合理的答案——详见「不支持视频的模型」。
  3. **Gemini 不接收公开视频直链**：可能报 `Request contains an invalid argument`，也可能返回 200 但视频被静默丢弃（`prompt_tokens` 只有几十），模型回答「看不到」甚至说画面是「黑屏」；Seed / Qwen / Kimi 可以直接传公网 https 地址。
</Note>

<CardGroup cols={2}>
  <Card title="可视化接口测试" icon="flask-conical" href="https://icover.ai/zh/video-understanding">
    在 iCover 可视化测试工具里直接上传视频、调试理解接口。
  </Card>
</CardGroup>

## 让 AI Agent 帮你接入

<Note>
  在用 Codex / Claude Code / Cursor 开发的话，把下面这段提示词复制给它。它会先抓本页的纯文本版（任意文档页地址后加 `.md`），再按你项目的技术栈写代码——通用 `video_url` 写法、**Gemini 不收公网直链与 20MB 上限**、**用 `prompt_tokens` 确认视频真的进了模型**这几个高频问题已经写死在要求里。
</Note>

<Prompt description="让编程 Agent 接入或排查视频理解（Gemini / Seed / Qwen / Kimi）。复制后直接粘贴给 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  帮我在当前项目里接入 / 排查视频理解：把一段视频交给多模态模型，做内容摘要、场景描述、动作分析或按时间戳定位。

  先读文档再动手：抓 [https://docs.apiyi.com/api-capabilities/video-understanding.md](https://docs.apiyi.com/api-capabilities/video-understanding.md) 拿到本页纯文本版；需要 YouTube 链接时再看 gemini/native 页，同样加 `.md` 后缀。

  接入要求：

  1. 端点与写法：走 OpenAI 兼容的 `POST https://api.apiyi.com/v1/chat/completions`，视频统一用 `{"type": "video_url", "video_url": {"url": ...}}` 放进 `messages[].content`，和文本块并列。**不要用 `image_url` + `data:video/mp4` 的旧写法**（只有 Gemini 认，换成别家模型直接 400），**也不要用 Responses 端点的 `input_video`**。这是同步接口，不需要轮询。

  2. 选模型：默认用 `gemini-3.8-flash`（视频 token 最省、支持 YouTube 链接）；需要精确时间戳、或者视频已经在公网地址上，用 `seed-2-0-pro-260328`；大批量低成本可选 `qwen3.8-flash` 或 `seed-2-0-mini-260428`。**GPT、Grok、Claude、GLM、DeepSeek 都不支持视频**——其中 GPT 和 GLM 会静默丢掉视频照样返回 200，GPT 还会编答案，别选它们；一定要用的话改成本地抽帧当多张图片传。`MiniMax-M3` 时间点不准，需要时间戳时别用。把模型名做成可配置项。

  3. 视频怎么传：**Gemini 只收 Base64 data URI**（`data:video/mp4;base64,...`），**整个请求体必须在 20MB 以内**（Base64 会膨胀约 1/3，原始文件按 14MB 左右算），**不接收公网直链**（视频会被丢掉，模型可能回答「看不到」或「黑屏」），**也不支持 `files.upload`**；YouTube 链接只能走 Gemini 原生格式（`google-genai` SDK，base\_url `https://api.apiyi.com`）；项目里已经在用这个 SDK 的，Base64 视频也可以直接用原生格式的 `Part.from_bytes` 传，不必改成 OpenAI 兼容写法。Seed / Qwen / Kimi 可以直接传公网 https 地址，但地址必须对上游可达，拿不准就先用 Base64 跑通。超限的视频先用 ffmpeg 压缩或截取片段，统一转成 H.264 编码的 mp4。

  4. **确认视频真的进了模型**：每次都读响应里的 `usage.prompt_tokens`。10 秒 540p 视频在 Gemini 上约 700、Seed / Qwen 约 5000、Kimi 约 14000（分辨率不同会有 ±30% 左右的浮动，只看数量级）；**如果只有几十个 token，说明视频被丢了**，这时要报错，不要把模型的回答当结果用。

  5. **防止模型顺着问题编答案**：素材出了问题（传错文件、解码成黑屏 / 灰屏、联调时用占位图）而提示词又预设了内容时，Gemini 容易照着问题编出不存在的内容，`prompt_tokens` 却完全正常。素材来源不可控的批量流程，先用中性问题「描述一下你收到的画面」让模型确认素材，再问具体问题。

  6. 时间戳：在提示词里用 `MM:SS` 指定片段、要求按 `MM:SS` 输出。Seed 可以在 `video_url` 里加 `"fps": 2` 提高采样（token 会变多），其他模型忽略这个字段。

  7. 超时与成本：耗时随视频长度增长，10 秒视频实测 4 到 30 秒，客户端超时给 300 秒以上。按 token 计费，视频 token 大约是 Gemini 每秒 70、Seed / Qwen 每秒 500、Kimi 每秒 1400，按这个估成本，长视频先截出需要的片段再传。

  8. Key 从环境变量 `APIYI_API_KEY` 读，不要硬编码进代码、也不要提交进 git。

  9. 改完真跑一次：用一段 10 秒左右的短视频调一次，把模型回答、`usage.prompt_tokens` 和这次调用的花费贴给我。
</Prompt>

<Accordion title="这段提示词替你挡掉了什么">
  | 要求 | 挡掉的坑 |
  | - | - |
  | 统一用 `video_url` | 网上常见的 `image_url` + `data:video/mp4` 只有 Gemini 认，换模型就 400 |
  | 不选 GPT / Grok / Claude / GLM | GPT、GLM 静默丢掉视频照样返回 200，GPT 还会编出一段看似合理的答案 |
  | Gemini 只传 Base64、请求体 20MB 内 | 传公网直链会被静默丢弃（模型说「看不到」或「黑屏」）或报 `invalid argument`，`files.upload` 第三方不可用 |
  | 读 `usage.prompt_tokens` | 视频被丢弃时只有几十个 token，是唯一能程序化发现的信号 |
  | 先中性问画面再问具体问题 | 素材出错时 Gemini 会顺着提示词编答案，token 数正常、查不出来 |
  | 超时 300 秒以上 | 长视频、Kimi 或开思考的模型耗时成倍增长，默认超时容易在拿到结果前断开 |
</Accordion>

## 支持的模型

以下结论来自 2026-10-11 (UTC+8) 的实测：同一段 10 秒测试视频（每 2.5 秒换一个数字与形状），要求模型按顺序说出数字和出现时间，并用一张空白图做对照，排除「没看也能答」的情况。

| 厂商 | 模型 ID | 实测耗时 | 10 秒视频输入 tokens | 特点 | 推荐场景 |
| - | - | :-: | :-: | - | - |
| Google | `gemini-3.8-flash` 🔥 | 4–9 秒 | 约 700 | 视频 token 最省，单价是 3.5 Flash 的一半；支持 YouTube 链接 | 日常视频分析、YouTube 内容 |
| Google | `gemini-3.1-pro-preview` | — | — | 谷歌最强推理 + 多模态 | 复杂、长视频深度分析 |
| Google | `gemini-3.1-flash-lite` | — | — | 超低价、超低延迟 | 大批量、高并发 |
| 字节跳动 | `seed-2-0-pro-260328` 🔥 | 8–10 秒 | 约 5000 | 时间点最准、支持 `fps` 调采样 | 国产首选、需要精确时间戳 |
| 字节跳动 | `dola-seed-2-1-turbo-260628` | 16–28 秒 | 约 5000 | 默认开启思考，答案更细但更慢 | 需要推理的视频问答 |
| 字节跳动 | `seed-2-0-lite-260428` | 约 14 秒 | 约 5000 | 均衡 | 一般分析 |
| 字节跳动 | `seed-2-0-mini-260428` | 约 5 秒 | 约 5000 | 最便宜、最快的 Seed | 大批量打标、粗筛 |
| 字节跳动 | `seed-1-8-251228` | 约 6 秒 | 约 5000 | 上一代稳定版 | 存量业务 |
| 阿里 | `qwen3.8-flash` | 8–12 秒 | 约 5300 | 价格极低 | 大批量、成本敏感 |
| 阿里 | `qwen3.8-max` | 14–16 秒 | 约 5300 | 旗舰推理 | 复杂视频问答 |
| 阿里 | `qwen3-vl-plus` | 约 4 秒 | 约 5200 | 专职视觉模型，快 | 识别、OCR 类任务 |
| 阿里 | `qwen3.5-omni-plus` | 约 4 秒 | 约 5200 | 全模态 | 音视频综合理解 |
| 月之暗面 | `kimi-k3` | 14–30 秒 | 约 14000 | 准确，但视频 token 是其他家的约 3 倍 | 对成本不敏感的深度分析 |
| MiniMax | `MiniMax-M3` | 约 5 秒 | 约 3700 | ⚠️ 能认出内容顺序，但**时间点不准**（3/3 次被压缩到前 2 秒内） | 只要内容、不要时间戳的场景 |

上一代 `gemini-3.7-flash`、`gemini-3.5-flash` 与经典稳定版 `gemini-2.5-pro`（2M 上下文）、`gemini-2.5-flash` 仍可用；3.8 Flash 与 3.5 Flash 实测视频 tokens 相同（10 秒约 713），但输入单价只有一半。耗时与 tokens 只针对上述 10 秒、540p 的测试视频，视频越长、分辨率越高越多，可据此按比例估算；实际耗时还受端点和上游排队影响，同一段视频可能相差 2–3 倍。

<Note>模型价格与官网对齐，且可能随官网调整；上表仅供参考，具体以顶部导航「模型价格」栏目为准：[模型价格](/models/index)。</Note>

### 不支持视频的模型

| 模型 | 传入视频时的表现 |
| - | - |
| OpenAI `gpt-6-sol` / `gpt-6-luna` / `gpt-5.6-terra` 等 | chat 端点**返回 200 但视频被丢弃**（`prompt_tokens` 只有几十）；Responses 端点明确报不支持 `input_video` |
| xAI `grok-4.7` / `grok-4.5` 等 | 报错 `unsupported message content type` |
| Anthropic Claude 全系 | 不支持视频输入 |
| 智谱 `glm-5.3` | 返回 200 但视频被丢弃，模型回答「没有收到视频」 |
| `deepseek-v4-flash-vision-exp` | 报错 `unknown variant video_url`（只支持图片） |

<Warning>
  **GPT 在视频被丢弃后可能编造答案**：实测 `gpt-6-sol` 3 次中 3 次编出了视频里根本不存在的数字序列，还把一段伦敦街景描述成「泳池和充气浮具」。如果一定要用这些模型，请改用下方「抽帧当多图」的写法。
</Warning>

## 视频输入方式

| 输入方式 | Gemini | Seed / Qwen / Kimi / MiniMax |
| - | :-: | :-: |
| **`video_url` + Base64**（`data:video/mp4;base64,...`） | ✅ | ✅ |
| **`video_url` + 公网 https 直链** | ❌ 谷歌不接收直链 | ✅ 上游需能访问该地址 |
| **`image_url` + `data:video/mp4`**（旧写法） | ✅ | ❌ 报 400 |
| **YouTube 链接** | ✅ 仅 Gemini 原生格式 | ❌ |
| **Files API**（`files.upload`） | ❌ 仅谷歌官方支持 | ❌ |

<Warning>
  **Gemini 的 20MB 限制**：Base64 方式下，整个请求体（含编码后的视频）必须在 20MB 以内。超过 20MB 的视频只能：① 用 YouTube 链接；② 先本地压缩 / 截取片段到 20MB 内再 base64；③ 换用 Seed / Qwen，把视频放到公网地址后直接传链接。
</Warning>

<Tip>
  **公网直链要上游拉得到**：视频由模型服务方去下载，地址必须对它可达。实测火山引擎对象存储上的地址 Seed / Qwen / Kimi / MiniMax 都能拉取，而谷歌云存储上的地址 Seed 报 403。拿不准时先用 Base64 跑通，再换直链。
</Tip>

## 快速开始：通用写法（`video_url`）

适用于 Seed、Qwen、Kimi、MiniMax，以及 Gemini。

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="YOUR_API_KEY",            # 替换为您的 API易 密钥
    base_url="https://api.apiyi.com/v1"
)

with open("demo.mp4", "rb") as f:
    video_b64 = base64.b64encode(f.read()).decode()

response = client.chat.completions.create(
    model="seed-2-0-pro-260328",       # 也可换成 qwen3.8-flash / kimi-k3 / gemini-3.8-flash 等
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "请详细描述这个视频的内容，并标出关键画面的时间点"},
            {
                "type": "video_url",
                "video_url": {"url": f"data:video/mp4;base64,{video_b64}"},
                # 也可以直接传公网地址（Gemini 除外）：{"url": "https://your-bucket.example.com/demo.mp4"}
            },
        ],
    }],
)

print(response.choices[0].message.content)
```

curl 等价写法（把 `<BASE64_VIDEO>` 替换为视频的 base64 字符串，或把整个 `url` 换成公网地址）：

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "seed-2-0-pro-260328",
    "messages": [{
      "role": "user",
      "content": [
        {"type": "text", "text": "请总结这个视频"},
        {"type": "video_url",
         "video_url": {"url": "data:video/mp4;base64,<BASE64_VIDEO>"}}
      ]
    }]
  }'
```

<Tip>
  **Seed 可以调采样帧率**：在 `video_url` 里加 `"fps": 2`，动作快的视频能看得更细（实测 10 秒视频输入从约 4900 增加到约 6200 tokens）。Qwen、Kimi 会忽略这个字段。
</Tip>

## Gemini 专用写法

### Base64 内联（`image_url` 旧写法）

Gemini 同时兼容上面的 `video_url` 写法和下面这种 `image_url` 写法，存量代码不用改；**新代码建议统一用 `video_url`，方便切换模型**。

```python theme={null}
response = client.chat.completions.create(
    model="gemini-3.8-flash",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "请详细描述这个视频的内容"},
            {
                "type": "image_url",
                "image_url": {"url": f"data:video/mp4;base64,{video_b64}"},
                "mime_type": "video/mp4",
            },
        ],
    }],
)
```

### Base64 内联（Gemini 原生格式）

已经在用谷歌官方 `google-genai` SDK 的项目，不必改成 OpenAI 兼容写法：把 `base_url` 换成 `https://api.apiyi.com`，视频用 `Part.from_bytes` 内联即可。与上面一样，整个请求体须在 20MB 以内。

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_API_KEY",            # 替换为您的 API易 密钥
    http_options={"base_url": "https://api.apiyi.com"}
)

with open("demo.mp4", "rb") as f:
    video_bytes = f.read()

response = client.models.generate_content(
    model="gemini-3.8-flash",
    contents=types.Content(parts=[
        types.Part.from_bytes(data=video_bytes, mime_type="video/mp4"),
        types.Part(text="请详细描述这个视频的内容，并标出关键画面的时间点"),
    ]),
)

print(response.text)
print(response.usage_metadata.prompt_tokens_details)  # 含 VIDEO 一项，说明视频确实进了模型
```

REST 等价写法：Base64 字符串很长，不要直接拼进命令行参数，先写进 JSON 文件再用 `-d @req.json` 发送。

```bash theme={null}
# 生成请求体（macOS / Linux）
printf '{"contents":[{"parts":[{"inline_data":{"mime_type":"video/mp4","data":"%s"}},{"text":"请总结这个视频"}]}]}' \
  "$(base64 < demo.mp4 | tr -d '\n')" > req.json

curl "https://api.apiyi.com/v1beta/models/gemini-3.8-flash:generateContent" \
  -H "x-goog-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d @req.json
```

<Tip>
  **原生格式更容易确认视频有没有进模型**：响应的 `usageMetadata.promptTokensDetails` 会把输入按模态拆开，实测 10 秒测试视频是 `VIDEO` 660 + `TEXT` 若干，与 OpenAI 兼容写法的总量一致。没有 `VIDEO` 这一项，就说明视频没被收到。
</Tip>

### YouTube 链接（Gemini 原生格式）

YouTube 链接无需下载、不受 20MB 限制，但**只能通过 Gemini 原生格式**传入（`google-genai` SDK，端点 `https://api.apiyi.com`）。

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options={"base_url": "https://api.apiyi.com"}
)

response = client.models.generate_content(
    model="gemini-3.8-flash",
    contents=types.Content(parts=[
        types.Part(file_data=types.FileData(
            file_uri="https://www.youtube.com/watch?v=VIDEO_ID"
        )),
        types.Part(text="请总结这个视频的主要内容和关键信息"),
    ]),
)

print(response.text)
```

<Info>
  原生格式的更多用法（流式、推理预算、Function Calling 等）见 [Gemini 原生格式调用](/api-capabilities/gemini/native)。
</Info>

## 不支持视频的模型：抽帧当多图

GPT、Grok 这类只收图片的模型，可以先在本地按固定间隔抽帧，再把帧当多张图片传入。实测 `gpt-6-sol`、`gpt-6-luna`、`gpt-5.6-terra`、`grok-4.7`、`grok-4.5` 用 4 帧都能正确说出内容和顺序。代价是**丢失音频和帧之间的动作**，时间点要靠你在提示词里说明。

```python theme={null}
import base64, subprocess, glob

# 每 2 秒抽 1 帧（需要本机安装 ffmpeg）
subprocess.run(["ffmpeg", "-i", "demo.mp4", "-vf", "fps=0.5", "frame-%02d.jpg"], check=True)

frames = []
for path in sorted(glob.glob("frame-*.jpg")):
    b64 = base64.b64encode(open(path, "rb").read()).decode()
    frames.append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}})

response = client.chat.completions.create(
    model="gpt-6-sol",
    messages=[{
        "role": "user",
        "content": [{"type": "text", "text": "下面是同一段视频每 2 秒抽出的一帧，按时间顺序排列。请描述视频内容。"}] + frames,
    }],
)
```

## 进阶技巧

### 时间戳定位

在提示词里用 `MM:SS` 直接定位片段——这是纯提示词技巧，任意支持视频的模型都可用：

```text theme={null}
请描述 00:30 到 01:15 之间发生了什么，并指出 02:40 出现的文字内容。
```

需要精确时间点时优先选 Seed 或 Qwen；MiniMax-M3 实测时间点不可靠。

### 两种「答案不可信」的情况

**① 视频根本没进模型**：看响应里的 `usage.prompt_tokens`。10 秒视频在 Seed / Qwen 上约 5000、Gemini 约 700；**如果只有几十个 token，说明视频被丢掉了**（GPT、GLM，以及 Gemini 收到公网直链时都是这种情况），此时的答案不可信。注意模型不一定会说「看不到」：Gemini 收到直链时会把丢失的视频描述成「完全纯黑的黑屏」，GPT 则会编出一段不存在的内容。

**② 素材不对，而提示词又预设了内容**：比如传错了文件、视频解码成黑屏 / 灰屏，或者联调时随手用了占位图。这种情况下 `prompt_tokens` 完全正常，靠 token 数查不出来。

<Warning>
  **Gemini 系列在情况 ② 下容易顺着问题编答案**。实测把视频换成一张空白图：

  * 用中性问法「描述一下你收到的画面」，Gemini 3.8 Flash / 3.5 Flash / 3.1 Pro / 3.1 Flash Lite 12 次全部如实说是空白图——**看图能力本身没问题**；
  * 但问题一旦预设了内容（「视频里依次出现了哪些数字」，甚至「有没有出现数字？没有就说没有」），3.5 Flash / 3.1 Pro / 3.1 Flash Lite 合计 18 次中有 12 次编出了并不存在的数字；
  * 新一代 `gemini-3.8-flash` 明显改善但没有根治：同样的预设问题 7 次中仍有 2 次编造；
  * 同样的问题，Seed、Qwen、Kimi 都如实回答「看不到 / 没有」。

  正常视频的识别不受影响。素材来源不可控的批量场景，建议**先用中性问题让模型描述画面，确认素材无误后再问具体问题**，或选用 Seed / Qwen。
</Warning>

### 常见任务的提问思路

同一段视频，换提示词就能完成不同分析，无需改代码：

* **内容摘要**：用 3-5 句话概括视频主题、关键画面与结论
* **教学分析**：提取知识点、章节划分与重点时间戳
* **监控分析**：识别异常行为、出现的人/物及发生时间
* **营销评估**：分析产品卖点呈现、节奏与目标受众契合度
* **动作分析**：拆解动作步骤、姿态要点与可改进之处

## 技术说明

* **Gemini**：默认按 **1 帧/秒** 采样并理解音频轨；Gemini 3.x 默认按低分辨率计帧，实测约 **70 tokens/秒**。
* **Seed / Qwen**：实测约 **500 tokens/秒**（540p 视频）；Seed 可用 `fps` 调整采样。
* **Kimi K3**：实测约 **1400 tokens/秒**，长视频成本明显更高。
* **支持格式**：mp4、mov、webm 等常见格式；建议统一转成 H.264 编码的 mp4，兼容性最好。

## 常见问题

<AccordionGroup>
  <Accordion title="GPT / Grok / Claude 能看视频吗？">
    不能。Claude 和 Grok 会直接报错；GPT 的 chat 端点会**静默丢掉视频**、照样返回 200，模型可能编出答案。需要用这些模型时，请先抽帧再当多张图片传入，见「不支持视频的模型：抽帧当多图」。
  </Accordion>

  <Accordion title="国产模型里哪些能做视频理解？">
    实测可用：Seed 全系（`seed-2-0-pro-260328`、`dola-seed-2-1-turbo-260628`、`seed-2-0-lite-260428`、`seed-2-0-mini-260428`、`seed-1-8-251228`）、Qwen 的 `qwen3.8-max`、`qwen3.8-flash`、`qwen3-vl-plus`、`qwen3.5-omni-plus`，以及 `kimi-k3`。`MiniMax-M3` 能认出内容但时间点不准。`glm-5.3` 与 `deepseek-v4-flash-vision-exp` 不支持视频。
  </Accordion>

  <Accordion title="同一段代码，换个模型就报 400？">
    多半是用了 `image_url` + `data:video/mp4` 的旧写法——它只有 Gemini 认。改成 `{"type": "video_url", "video_url": {"url": ...}}` 即可在各家通用。
  </Accordion>

  <Accordion title="Gemini 回答了视频里根本没有的内容？">
    先确认素材本身没问题（不是黑屏、空白或传错文件）。实测 Gemini 在素材有问题、而提问又预设了内容时，容易顺着问题编出答案。排查时先换成中性问法「描述一下你收到的画面」，看它描述的是不是你的视频；详见「两种「答案不可信」的情况」。
  </Accordion>

  <Accordion title="传公开视频链接报错 Request contains an invalid argument / 拉取失败">
    Gemini **不接收任意公开直链**（如 `https://example.com/video.mp4`），这不是 API易 拦截。Gemini 请改用 Base64 内联（20MB 以内）或 YouTube 链接；也可以换用 Seed / Qwen，它们可以直接拉取公网地址。走 `/v1/chat/completions` 时不一定报错：可能返回 200、模型自称看到「黑屏」，此时 `prompt_tokens` 只有几十，结果不可用。
  </Accordion>

  <Accordion title="为什么 Gemini 限制 20MB？之前明明能用">
    Base64 内联方式下，Gemini 的整个请求体一直限制在 20MB 以内（与谷歌官方一致）。如果你「之前能用」的是公开直链，那其实从来不是受支持的方式，只是恰好某些情况下没报错；现在按规范会明确拒绝。
  </Accordion>

  <Accordion title="能用 files.upload 上传大视频吗？">
    不能。Gemini 官方的 Files API（`client.files.upload()`）**第三方不支持**，仅谷歌官方端点可用。大视频请走 YouTube 链接、压缩到 20MB 内用 Base64，或换用 Seed / Qwen 传公网地址。
  </Accordion>

  <Accordion title="超过 20MB 的视频怎么办？">
    三条路：① 上传到 YouTube 后用链接传入（Gemini 原生格式）；② 用 ffmpeg 等工具本地压缩或截取关键片段到 20MB 内再 base64；③ 把视频放到公网可访问的对象存储，用 Seed / Qwen 直接传链接。
  </Accordion>
</AccordionGroup>

## 相关资源

<CardGroup cols={2}>
  <Card title="模型价格" icon="list" href="/models/index">
    查看全部模型与最新定价
  </Card>

  <Card title="Gemini 原生格式" icon="sparkles" href="/api-capabilities/gemini/native">
    YouTube 链接、流式、推理预算等原生用法
  </Card>

  <Card title="图像理解 API" icon="image" href="/api-capabilities/vision-understanding">
    图片内容识别与多模态分析
  </Card>

  <Card title="Qwen3.8-Max" icon="brain" href="/api-capabilities/qwen-3-8/overview">
    通义千问旗舰，原生图片与视频输入
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.