> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 图像理解（识图）API

> 使用 AI 模型进行智能图像分析和理解，支持对象识别、场景描述、文字提取等功能

API易 提供强大的图像理解能力，支持使用多种先进的 AI 模型对图像进行深度分析和理解。通过统一的 OpenAI API 格式，您可以轻松实现图像识别、场景描述、OCR 文字识别等功能。

<Note>
  **🔍 智能视觉分析**\
  支持对象识别、场景理解、文字提取、情感分析等多种视觉任务，让 AI 真正"看懂"图片。
</Note>

## 🌟 核心特性

* **🎯 多模型支持**：Gemini 3 系列、GPT-5 系列、Claude 4 系列等顶级多模态模型
* **📸 灵活输入**：支持 URL 链接和 Base64 编码图片
* **🌏 中文优化**：完美支持中文场景理解和文字识别
* **⚡ 快速响应**：高性能推理，秒级返回结果
* **💰 成本可控**：多种模型选择，满足不同预算需求

## 📋 支持的视觉模型

以下为当前主流的多模态模型推荐，模型 ID 可能随版本更新，请以控制台为准。

| 模型名称                         | 模型 ID                    | 特点             | 推荐场景      |
| ---------------------------- | ------------------------ | -------------- | --------- |
| **Gemini 3.1 Pro Preview** ⭐ | `gemini-3.1-pro-preview` | 最强多模态推理，细节丰富   | 复杂图像/场景分析 |
| **Gemini 3.5 Flash** 🔥      | `gemini-3.5-flash`       | 速度快、价格低，性价比之王  | 实时识图、批量处理 |
| **GPT-5.5** ⭐                | `gpt-5.5`                | 综合视觉理解强，稳定可靠   | 通用图像理解    |
| **Claude Opus 4.7**          | `claude-opus-4-7`        | 理解深入，描述精准      | 专业图文分析    |
| **Claude Sonnet 4.6**        | `claude-sonnet-4-6`      | 性能媲美 Opus，性价比高 | 高性价比识图    |
| **GPT-4o**                   | `gpt-4o`                 | 经典多模态，成熟稳定     | 通用场景      |
| **Gemini 2.5 Flash**         | `gemini-2.5-flash`       | 超快超便宜，正式版      | 大批量简单识图   |

<Info>
  **绝大多数对话模型现已支持多模态识图**：上表仅为常用推荐，并非全部。GPT-5 系列、Gemini 3 系列、Claude 4 系列、Grok 4、Kimi 等主流模型均已支持图像输入。

  * ⚠️ 但**同一厂商不同代际并不一致**——`deepseek-v4-pro`、`deepseek-v4-flash`、`glm-5.2` 等仍是纯文本模型，传图片会报 `Model do not support image input`。判断某个模型吃不吃图，以模型详情页的「输入模态」为准，详见 [文本+出图能不能一个接口](/faq/text-and-image-in-one-api)
  * 📚 完整模型清单与特点对比：[当下热门模型（保持更新）](/api-capabilities/model-info)
  * 🔗 实时模型列表与价格：[API易控制台定价页面](https://www.apiyi.com/account/pricing)（以控制台显示是否支持视觉为准）
</Info>

## 🚀 快速开始

### 1. 基础示例 - 图片 URL

```python theme={null}
import requests

url = "https://api.apiyi.com/v1/chat/completions"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

payload = {
    "model": "gpt-5.5",
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "请详细描述这张图片的内容"
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://example.com/image.jpg"
                    }
                }
            ]
        }
    ]
}

response = requests.post(url, headers=headers, json=payload)
result = response.json()
print(result['choices'][0]['message']['content'])
```

### 2. 本地图片示例 - Base64 编码

```python theme={null}
import base64
import requests

def image_to_base64(image_path):
    """将本地图片转换为 base64 编码"""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# 读取本地图片
base64_image = image_to_base64("path/to/your/image.jpg")

url = "https://api.apiyi.com/v1/chat/completions"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

payload = {
    "model": "gemini-3.1-pro-preview",
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "分析这张图片中的所有文字内容"
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                }
            ]
        }
    ]
}

response = requests.post(url, headers=headers, json=payload)
print(response.json()['choices'][0]['message']['content'])
```

### 3. 高级示例 - 多图对比分析

```python theme={null}
import requests

url = "https://api.apiyi.com/v1/chat/completions"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

payload = {
    "model": "gemini-3.1-pro-preview",
    "messages": [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "请对比这两张图片的差异："},
                {
                    "type": "image_url",
                    "image_url": {"url": "https://example.com/image1.jpg"}
                },
                {
                    "type": "image_url", 
                    "image_url": {"url": "https://example.com/image2.jpg"}
                }
            ]
        }
    ],
    "max_tokens": 1000
}

response = requests.post(url, headers=headers, json=payload)
print(response.json()['choices'][0]['message']['content'])
```

### 4. cURL 示例（命令行）

**图片 URL 方式**：

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-3.1-pro-preview",
    "messages": [
      {
        "role": "user",
        "content": [
          { "type": "text", "text": "请详细描述这张图片的内容" },
          { "type": "image_url", "image_url": { "url": "https://example.com/image.jpg" } }
        ]
      }
    ]
  }'
```

**本地图片 Base64 方式**（先把图片编码成 Base64 再拼进请求体）：

```bash theme={null}
# 1. 将本地图片转为 base64（macOS / Linux）
BASE64_IMAGE=$(base64 -i path/to/your/image.jpg | tr -d '\n')

# 2. 通过 data URI 传入图片内容
curl https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.5",
    "messages": [
      {
        "role": "user",
        "content": [
          { "type": "text", "text": "分析这张图片中的所有文字内容" },
          { "type": "image_url", "image_url": { "url": "data:image/jpeg;base64,'"$BASE64_IMAGE"'" } }
        ]
      }
    ]
  }'
```

<Tip>
  **推荐优先使用 Base64 方式上传图片**：图片 URL 方式需要服务器先实时下载该图片，若图床响应慢或有访问限制，就会下载失败；Base64 把图片数据直接放进请求体，不依赖任何外部下载，稳定性更高。两种方式官方均支持，Base64 体积约为原图的 1.33 倍，大图建议先适度压缩再编码。
</Tip>

### 5. 常见错误：图片 URL 下载超时

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

这表示**服务器在拉取该图片 URL 时下载超时**，与模型、密钥、额度均无关。常见原因：

1. 图床 / 源站响应慢，或对部分地区网络访问不友好
2. 图片体积过大，下载耗时超出限制
3. URL 设有防盗链、需要登录或非公开直链

**解决方法**：

* ✅ **改用 Base64（data URI）方式上传**（推荐，见上方示例 2）——图片数据随请求体直接提交，彻底绕开下载环节，最稳定
* 更换为响应更快、可公开访问的图片直链
* 压缩图片后重试

### 6. 常见错误：invalid base64 data（URL 误放进 Base64 字段）

如果收到如下 400 错误（以 Claude 系模型为例，其它模型系列文案略有差异，关键特征是 `invalid base64 data`）：

```json theme={null}
{
  "type": "error",
  "error": {
    "type": "invalid_request_error",
    "message": "...source.base64: invalid base64 data"
  },
  "request_id": "req_011CczN..."
}
```

通常是**把图片 URL 拼进了 data URI 的 Base64 数据位**：

```json theme={null}
// ❌ 错误写法：base64, 后面跟的是图片链接，不是 Base64 编码
"image_url": {
  "url": "data:image/jpeg;base64,https://example.com/generations/temp-xxx.jpg"
}
```

`data:image/...;base64,` 前缀后面必须是**图片文件本身的 Base64 编码字符串**，而不是图片链接。URL 方式和 Base64 方式是两种互斥的传参形式，不能混拼。常见诱因：代码里统一走了 data URI 拼接逻辑，遇到 URL 图片也直接拼了进去。

**正确写法对照**：

```json theme={null}
// ✅ 图片是网络 URL → 直接传链接，不加任何前缀
"image_url": {
  "url": "https://example.com/generations/temp-xxx.jpg"
}

// ✅ 图片是本地文件/二进制 → 先 Base64 编码，再拼 data URI（见上方示例 2）
"image_url": {
  "url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
}
```

<Tip>
  **自检建议**：发送前判断一下图片来源——字符串以 `http` 开头就走 URL 方式，否则才做 Base64 编码并拼 data URI。另外，合法的 Base64 字符串不会包含 `://`、`?` 等字符，若在 `base64,` 之后看到这些字符，基本可以断定是把链接拼进去了。
</Tip>

### 7. 常见错误：声明的图片格式与实际格式不符（media type mismatch）

如果收到如下 400 错误（关键特征是 `The image was specified using the image/png media type, but the image appears to be a image/jpeg image`）：

```json theme={null}
{
  "status_code": 400,
  "error": {
    "message": "InvokeModel: operation error Bedrock Runtime: InvokeModel, https response error StatusCode: 400, RequestID: e87a35ed-..., ValidationException: ...source.base64: The image was specified using the image/png media type, but the image appears to be a image/jpeg image"
  }
}
```

**报错解读**：这条错误来自上游模型服务的入参校验（示例中的 `Bedrock Runtime: InvokeModel, ValidationException` 表示请求已到达 Claude 系模型的上游通道，在参数校验阶段被拒绝）。它的意思非常直白：

* 你在 data URI 里**声明**图片是 PNG（`data:image/png;base64,...`）
* 但上游解码 Base64 后检查文件头（magic bytes），发现**实际内容是 JPEG**
* 声明与实际不一致 → 400 拒绝。Base64 编码本身没有问题，问题出在前缀里的 media type 写错了

**常见诱因**：

1. **按文件扩展名推断 MIME 类型，但扩展名是假的**——文件名叫 `xxx.png`，实际是别人改过后缀的 JPEG（下载工具、聊天软件、截图工具都可能干这事）
2. **代码里写死了 `image/png`**（或写死 `image/jpeg`），不管传什么图都用同一个前缀
3. 图片经过某些处理管道后格式变了，但文件名没变

**解决方法**：不要相信扩展名，按文件真实内容（文件头）判断 MIME 类型再拼 data URI：

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

也可以用 PIL 重新编码，一步到位地保证声明与内容一致（还能顺带压缩、剥离异常帧）：

```python theme={null}
import base64, io
from PIL import Image

def image_to_data_uri(image_path):
    img = Image.open(image_path)
    buf = io.BytesIO()
    img.convert("RGB").save(buf, format="JPEG", quality=90)
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{b64}"
```

<Tip>
  **自检建议**：`file xxx.png`（macOS / Linux 命令行）一秒看出文件真实格式；Python 里 `Image.open(path).format` 也能拿到。不同模型系列对 media type 的校验严格程度不同——有的宽松放行，Claude 系（尤其经 Bedrock 通道）校验最严。按"声明必须与内容一致"来写代码，在所有模型上都不会踩坑。
</Tip>

<Warning>
  **GPT-5 系列参数差异**：若把示例中的模型换成 `gpt-5.5` / `gpt-5.4` 等 GPT-5 系列，请注意：

  1. 用 `max_completion_tokens` 替代 `max_tokens`
  2. `temperature` 只支持 `1`（默认即可，不要传其它值）
  3. 不要传 `top_p` 参数

  Gemini、Claude 系列则无此限制，可正常使用 `max_tokens`、`temperature` 等参数。
</Warning>

## 🎯 常见应用场景

### 1. 商品识别与分析

```python theme={null}
prompt = """
请分析这张商品图片，包括：
1. 商品类型和品牌
2. 主要特征和卖点
3. 适合的目标用户
4. 建议的营销文案
"""
```

### 2. 文档 OCR 识别

```python theme={null}
prompt = """
请提取图片中的所有文字内容，并按照原始格式整理输出。
如果有表格，请用 Markdown 表格格式呈现。
"""
```

### 3. 医学影像辅助分析

```python theme={null}
prompt = """
这是一张医学影像图片，请：
1. 描述图像的基本信息（如成像类型、部位等）
2. 标注可见的解剖结构
3. 注意：仅供参考，不作为诊断依据
"""
```

### 4. 安全监控场景分析

```python theme={null}
prompt = """
分析监控画面，识别：
1. 场景中的人数和位置
2. 是否有异常行为
3. 环境安全隐患
4. 时间戳信息（如果可见）
"""
```

## 💡 最佳实践

### 图片预处理建议

1. **格式支持**：JPEG、PNG、GIF、WebP 等主流格式
2. **大小限制**：建议单张图片不超过 20MB
3. **分辨率**：高分辨率图片会获得更好的识别效果
4. **压缩优化**：适度压缩以提高传输速度

### 提示词优化

```python theme={null}
# ❌ 不推荐：模糊的提示
prompt = "看看这是什么"

# ✅ 推荐：具体明确的提示
prompt = """
请从以下几个方面分析这张图片：
1. 主要对象：识别图片中的主要物体或人物
2. 场景环境：描述拍摄地点和环境特征
3. 色彩构图：分析配色方案和构图特点
4. 情感氛围：图片传达的情绪或氛围
5. 可能用途：这张图片适合用于什么场景
"""
```

### 错误处理

```python theme={null}
import requests
from requests.exceptions import RequestException

def analyze_image_with_retry(image_url, prompt, max_retries=3):
    """带重试机制的图像分析函数"""
    for attempt in range(max_retries):
        try:
            response = requests.post(
                "https://api.apiyi.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-5.5",
                    "messages": [{
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": {"url": image_url}}
                        ]
                    }]
                },
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 429:
                print(f"速率限制，等待后重试... (尝试 {attempt + 1}/{max_retries})")
                time.sleep(2 ** attempt)  # 指数退避
            else:
                print(f"错误: {response.status_code} - {response.text}")
                
        except RequestException as e:
            print(f"请求异常: {e}")
            
    return None
```

## 🔧 高级功能

### 1. 流式输出

对于长篇分析，可以使用流式输出获得更好的用户体验：

```python theme={null}
payload = {
    "model": "gpt-5.5",
    "messages": [...],
    "stream": True
}

response = requests.post(url, headers=headers, json=payload, stream=True)
for line in response.iter_lines():
    if line:
        print(line.decode('utf-8'))
```

### 2. 多轮对话

保持上下文进行深入分析：

```python theme={null}
messages = [
    {
        "role": "user",
        "content": [
            {"type": "text", "text": "这是什么动物？"},
            {"type": "image_url", "image_url": {"url": "animal.jpg"}}
        ]
    },
    {
        "role": "assistant",
        "content": "这是一只金毛寻回犬。"
    },
    {
        "role": "user",
        "content": [{"type": "text", "text": "它看起来多大了？健康状况如何？"}]
    }
]
```

### 3. 结合函数调用

```python theme={null}
tools = [
    {
        "type": "function",
        "function": {
            "name": "save_image_analysis",
            "description": "保存图像分析结果到数据库",
            "parameters": {
                "type": "object",
                "properties": {
                    "objects": {"type": "array", "items": {"type": "string"}},
                    "scene": {"type": "string"},
                    "text_content": {"type": "string"}
                }
            }
        }
    }
]

payload = {
    "model": "gpt-5.5",
    "messages": messages,
    "tools": tools,
    "tool_choice": "auto"
}
```

## 📊 性能对比

| 模型                     | 响应速度  | 识别准确度 | 中文支持  | 价格   |
| ---------------------- | ----- | ----- | ----- | ---- |
| Gemini 3.1 Pro Preview | ⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | \$\$ |
| Gemini 3.5 Flash       | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐  | \$   |
| GPT-5.5                | ⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | \$\$ |
| Claude Sonnet 4.6      | ⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐  | \$\$ |
| Gemini 2.5 Flash       | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐  | ⭐⭐⭐⭐  | \$   |

## 🚨 注意事项

1. **隐私保护**：不要上传包含敏感信息的图片
2. **合规使用**：遵守相关法律法规，不用于非法用途
3. **结果验证**：AI 分析结果仅供参考，重要决策需人工复核
4. **成本控制**：合理选择模型，避免不必要的开销

## 🔗 相关资源

* [完整代码示例](https://github.com/apiyi-api/ai-api-code-samples/tree/main/Vision-API-OpenAI)
* [API 定价说明](https://api.apiyi.com/account/pricing)

<Note>
  💡 **小贴士**：建议先使用 Gemini 3.5 Flash 或 Gemini 2.5 Flash 等高性价比模型进行测试，确认效果后再切换到 Gemini 3.1 Pro、GPT-5.5 等高级模型进行生产部署。更多可用模型请查看 [当下热门模型](/api-capabilities/model-info) 或 [控制台模型列表](https://www.apiyi.com/account/pricing)。
</Note>
