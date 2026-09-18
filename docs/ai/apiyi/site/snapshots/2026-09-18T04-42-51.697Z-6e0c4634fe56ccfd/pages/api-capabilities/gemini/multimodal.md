> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 多模态输入与代码执行

> 图片、音频、视频内联传入 Gemini：20MB 限制、media_resolution 控费、code_execution 沙箱执行 Python。

Gemini 原生格式支持直接传入图片、音频、视频做理解分析，并内置 `code_execution` 工具在沙箱里跑 Python。本页示例默认使用 [原生调用](/api-capabilities/gemini/native) 的客户端配置。

<Warning>
  **API易 通道的两个硬限制**：

  1. **不支持 Files API**（`client.files.upload()` 仅 Google 官方端点可用），媒体一律**内联传入**
  2. 内联媒体**单文件不超过 20MB**，超过请先压缩或抽帧
</Warning>

## 图片理解

图片可以直接传 PIL Image 对象，SDK 自动处理编码：

```python theme={null}
from google import genai
from PIL import Image

client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options={"base_url": "https://api.apiyi.com"}
)

img = Image.open("photo.jpg")

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[
        "请详细描述这张图片的内容，包括主要元素、颜色、构图。",
        img
    ]
)
print(response.text)
```

也可以用 `types.Part.from_bytes` 显式传入：

```python theme={null}
from google.genai import types

with open("photo.jpg", "rb") as f:
    image_bytes = f.read()

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[
        types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
        "图里有什么？"
    ]
)
```

## 音频理解

```python theme={null}
from google.genai import types

with open("meeting.mp3", "rb") as f:
    audio_bytes = f.read()

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[
        types.Part.from_bytes(data=audio_bytes, mime_type="audio/mp3"),
        "请转录这段音频，并总结主要话题。"
    ]
)
print(response.text)
```

## 视频理解

```python theme={null}
from google.genai import types

with open("demo.mp4", "rb") as f:
    video_bytes = f.read()

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=[
        types.Part.from_bytes(data=video_bytes, mime_type="video/mp4"),
        "总结这个视频的主要内容和关键信息。"
    ]
)
print(response.text)
```

视频按帧 + 音轨计 tokens，较长视频费用可观 —— 更多视频场景实践见 [视频理解](/api-capabilities/video-understanding)。

## media\_resolution 控费

媒体输入的 token 消耗和分辨率挂钩。对"看个大概"的任务（分类、是否包含某元素），降分辨率能明显省钱：

```python theme={null}
from google.genai import types

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents=["这张图片的主题是什么？", img],
    config=types.GenerateContentConfig(
        media_resolution="MEDIA_RESOLUTION_LOW"  # LOW / MEDIUM / HIGH
    )
)
```

| 档位       | 适用              |
| -------- | --------------- |
| `LOW`    | 分类、粗粒度识别，最省     |
| `MEDIUM` | 一般描述与理解（默认均衡选择） |
| `HIGH`   | OCR、小字、细节密集型任务  |

## 支持的格式

| 类型 | 格式           | 传入方式                          |
| -- | ------------ | ----------------------------- |
| 图片 | JPG、PNG、WebP | PIL Image 或 `Part.from_bytes` |
| 音频 | MP3、WAV      | `Part.from_bytes`             |
| 视频 | MP4、MOV      | `Part.from_bytes`             |

均为内联传入，单文件不超过 20MB。

## 代码执行（code\_execution）

声明 `code_execution` 工具后，模型会自己写 Python、在沙箱里执行、再基于结果回答 —— 适合计算、数据分析类任务：

```python theme={null}
response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="""
有以下销售数据：产品A 100件×50元、产品B 200件×30元、产品C 150件×40元。
请计算总销售额和平均单价，并给出各产品销售额占比。
""",
    config={"tools": [{"code_execution": {}}]}
)

for part in response.candidates[0].content.parts:
    if getattr(part, "executable_code", None):
        print(f"[执行的代码]\n{part.executable_code.code}")
    if getattr(part, "code_execution_result", None):
        print(f"[执行结果]\n{part.code_execution_result.output}")
    if getattr(part, "text", None):
        print(f"[说明]\n{part.text}")
```

<Info>
  代码执行的限制：仅 Python；沙箱环境无法访问网络和你的文件系统；有执行时长上限。需要调用你自己的外部服务时，用 [FC函数调用](/api-capabilities/gemini/function-calling)。
</Info>

## 相关链接

* 同组页面：[原生调用](/api-capabilities/gemini/native) · [缓存计费](/api-capabilities/gemini/prompt-caching) · [FC函数调用](/api-capabilities/gemini/function-calling)
* 应用场景：[视频理解](/api-capabilities/video-understanding) · [视觉理解](/api-capabilities/vision-understanding)
* Google 官方文档：`ai.google.dev/gemini-api/docs/vision`
