> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 视频理解 API

> 使用 Gemini 3.5 Flash、Gemini 3.1 Pro Preview 等先进模型进行智能视频分析，支持内容识别、场景描述、动作分析与时间戳定位

API易 通过 Gemini 系列多模态模型提供视频理解能力：用一段提示词，让模型"看懂"视频里的场景、动作、字幕与音频，并按时间戳定位关键画面。本页说明支持的模型、可用的视频输入方式，以及最容易踩坑的限制。

<Note>
  **先看这一条**：视频只能通过 **Base64 内联（整个请求 ≤ 20MB）** 或 **YouTube 链接**（Gemini 原生格式）传入。直接传公开视频直链（如 `https://example.com/demo.mp4`）会报 `Request contains an invalid argument` —— 这是谷歌不接收直链，并非 API易 拦截。详见下方「视频输入方式」。
</Note>

<CardGroup cols={2}>
  <Card title="可视化接口测试" icon="flask-conical" href="https://icover.ai/zh/video-understanding">
    在 iCover 可视化测试工具里直接上传视频、调试理解接口。
  </Card>
</CardGroup>

## 支持的模型

| 模型                         | 模型 ID                    | 特点               | 推荐场景       |
| -------------------------- | ------------------------ | ---------------- | ---------- |
| **Gemini 3.5 Flash** 🔥    | `gemini-3.5-flash`       | 速度快、性价比之王，多模态能力强 | 日常视频分析首选   |
| **Gemini 3.1 Pro Preview** | `gemini-3.1-pro-preview` | 谷歌最强推理 + 多模态理解   | 复杂、长视频深度分析 |
| **Gemini 3.1 Flash Lite**  | `gemini-3.1-flash-lite`  | 超低价、超低延迟         | 大批量、高并发场景  |

经典稳定版 `gemini-2.5-pro`（2M 上下文）与 `gemini-2.5-flash` 仍可用。完整价格见 [模型列表与价格](/api-capabilities/model-info)。

## 视频输入方式

这是最容易踩坑的地方，请先对照下表确认你的输入方式是否被支持：

| 输入方式                          | 是否支持 | 说明                                                              |
| ----------------------------- | :--: | --------------------------------------------------------------- |
| **Base64 内联**                 |   ✅  | 本地视频读取后 base64 编码传入，**整个请求体需 ≤ 20MB**。OpenAI 兼容格式与原生格式都支持       |
| **YouTube 链接**                |   ✅  | 仅 **Gemini 原生格式**，通过 `file_uri` 传入 YouTube URL                  |
| **公开视频直链**（如 `.mp4` 网址）       |   ❌  | **谷歌不接收**，会返回 `Request contains an invalid argument`，并非 API易 拦截 |
| **Files API**（`files.upload`） |   ❌  | 第三方不支持，仅谷歌官方支持                                                  |

<Warning>
  **20MB 限制**：Base64 方式下，整个请求体（含编码后的视频）必须在 20MB 以内。**超过 20MB 的视频**目前只能：① 用 YouTube 链接；② 先本地压缩 / 截取片段到 20MB 内再 base64。
</Warning>

## 快速开始：Base64 内联（OpenAI 兼容格式）

最常用的方式：读取本地视频 → base64 编码 → 用 `image_url` 字段传入。

```python theme={null}
from openai import OpenAI
import base64

client = OpenAI(
    api_key="YOUR_API_KEY",            # 替换为您的 API易 密钥
    base_url="https://api.apiyi.com/v1"
)

{/* 读取本地视频并转 base64（整个请求 ≤ 20MB）*/}
with open("demo.mp4", "rb") as f:
    video_b64 = base64.b64encode(f.read()).decode()

response = client.chat.completions.create(
    model="gemini-3.5-flash",
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

print(response.choices[0].message.content)
```

curl 等价写法（把 `<BASE64_VIDEO>` 替换为视频的 base64 字符串；体积较大时建议直接用 SDK 自动编码）：

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-3.5-flash",
    "messages": [{
      "role": "user",
      "content": [
        {"type": "text", "text": "请总结这个视频"},
        {"type": "image_url",
         "image_url": {"url": "data:video/mp4;base64,<BASE64_VIDEO>"},
         "mime_type": "video/mp4"}
      ]
    }]
  }'
```

## YouTube 链接（Gemini 原生格式）

YouTube 链接无需下载、不受 20MB 限制，但**只能通过 Gemini 原生格式**传入（`google-genai` SDK，端点 `https://api.apiyi.com`）。

```python theme={null}
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options={"base_url": "https://api.apiyi.com"}
)

response = client.models.generate_content(
    model="gemini-3.5-flash",
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

## 进阶技巧

### 时间戳定位

模型默认按 1 帧/秒采样并理解音频，你可以在提示词里用 `MM:SS` 直接定位片段——这是纯提示词技巧，任意输入方式都可用：

```text theme={null}
请描述 00:30 到 01:15 之间发生了什么，并指出 02:40 出现的文字内容。
```

### 常见任务的提问思路

同一段视频，换提示词就能完成不同分析，无需改代码：

* **内容摘要**：用 3-5 句话概括视频主题、关键画面与结论
* **教学分析**：提取知识点、章节划分与重点时间戳
* **监控分析**：识别异常行为、出现的人/物及发生时间
* **营销评估**：分析产品卖点呈现、节奏与目标受众契合度
* **动作分析**：拆解动作步骤、姿态要点与可改进之处

## 技术说明

* **采样帧率**：默认按 **1 帧/秒（FPS）** 采样，同时理解音频轨。
* **Token 消耗**：默认分辨率约 **300 tokens/秒**，低分辨率约 **100 tokens/秒**——视频越长，token 越多，请据此估算成本。
* **支持格式**：mp4、mpeg、mov（quicktime）、avi、webm、wmv、3gpp 等常见格式。

## 常见问题

<AccordionGroup>
  <Accordion title="传公开视频链接报错 Request contains an invalid argument / 拉取失败">
    谷歌的视频理解**不接收任意公开直链**（如 `https://example.com/video.mp4`），会返回 `Request contains an invalid argument`。这不是 API易 或 Nginx 拦截。请改用：① Base64 内联（≤20MB）；② YouTube 链接（原生格式）。
  </Accordion>

  <Accordion title="为什么限制 20MB？之前明明能用">
    Base64 内联方式下，整个请求体一直限制在 20MB 以内（与谷歌官方一致）。如果你"之前能用"的是公开直链，那其实从来不是受支持的方式，只是恰好某些情况下没报错；现在按规范会明确拒绝。
  </Accordion>

  <Accordion title="能用 files.upload 上传大视频吗？">
    不能。Gemini 官方的 Files API（`client.files.upload()`）**第三方不支持**，仅谷歌官方端点可用。大视频请走 YouTube 链接，或压缩到 20MB 内用 Base64。
  </Accordion>

  <Accordion title="超过 20MB 的视频怎么办？">
    两条路：① 上传到 YouTube 后用链接传入（原生格式，不受 20MB 限制）；② 用 ffmpeg 等工具本地压缩或截取关键片段到 20MB 内再 base64。
  </Accordion>
</AccordionGroup>

## 相关资源

<CardGroup cols={2}>
  <Card title="模型列表与价格" icon="list" href="/api-capabilities/model-info">
    查看全部 Gemini 模型与最新定价
  </Card>

  <Card title="Gemini 原生格式" icon="sparkles" href="/api-capabilities/gemini/native">
    YouTube 链接、流式、推理预算等原生用法
  </Card>

  <Card title="图像理解 API" icon="image" href="/api-capabilities/vision-understanding">
    图片内容识别与多模态分析
  </Card>

  <Card title="API 文档" icon="book" href="/api-manual">
    完整 API 规范与端点说明
  </Card>
</CardGroup>
