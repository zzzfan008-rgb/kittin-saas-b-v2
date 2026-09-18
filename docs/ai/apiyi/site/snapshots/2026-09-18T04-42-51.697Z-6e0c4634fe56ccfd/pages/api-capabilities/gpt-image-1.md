> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-1 图像生成 API - OpenAI 当下最新图片 API

> 使用OpenAI官方 Image API 格式调用 GPT-Image-1 模型进行高质量图像生成，API易 完全兼容 OpenAI 格式。

GPT-Image-1 是 OpenAI 的图像生成模型，提供高质量的图片生成能力。通过 API易 使用标准的 OpenAI Image API 格式即可调用。

## 概述

GPT-Image-1 支持通过文本提示词生成高质量图像，完全兼容 OpenAI 官方的 Image Generation API 格式。如需更快速度和更强文字渲染能力，请查看 [GPT-Image-1.5](/api-capabilities/gpt-image-1-5)。

### 主要特性

* 🎨 **高质量图像生成**：生成细节丰富、符合提示词的图像
* 🚀 **快速响应**：优化的生成速度，快速获得结果
* 💰 **灵活计费方式**：支持 Token 计费（输入 \$2.50/M，输出 \$8.00/M）或按图片计费（\$0.005-\$0.052/张）
* 🔧 **完全兼容**：100% 兼容 OpenAI Image API 格式
* 🆕 **多模型支持**：提供 gpt-image-1 和 gpt-image-1-mini 两个版本

## 快速开始

### 基础配置

```python theme={null}
import openai

# 配置 API易 的接入点和密钥
openai.api_base = "https://api.apiyi.com/v1"
openai.api_key = "your-api-key"
```

### 生成图像

使用标准的 OpenAI Image API 格式调用：

```python theme={null}
# 生成图像
response = openai.Image.create(
    model="gpt-image-1",
    prompt="A serene landscape with mountains and a lake at sunset",
    n=1,
    size="1024x1024"
)

# 获取生成的图像 URL
image_url = response['data'][0]['url']
print(f"Generated image URL: {image_url}")
```

## API 参数详解

### 请求参数

| 参数                   | 类型      | 必填 | 说明                                                     |
| -------------------- | ------- | -- | ------------------------------------------------------ |
| `model`              | string  | 是  | 模型名称，使用 `gpt-image-1`                                  |
| `prompt`             | string  | 是  | 图像生成的文本提示词，最长 1000 字符                                  |
| `n`                  | integer | 否  | 生成图像的数量，默认为 1，最大为 10                                   |
| `size`               | string  | 否  | 图像尺寸，支持 `1024x1024`、`1536x1024`、`1024x1536`、`auto`（默认） |
| `quality`            | string  | 否  | 渲染质量，支持 `low`、`medium`、`high`、`auto`（默认）               |
| `output_format`      | string  | 否  | 输出格式，支持 `png`（默认）、`jpeg`、`webp`                        |
| `output_compression` | integer | 否  | 压缩级别 (0-100%)，仅适用于 JPEG 和 WebP 格式                      |
| `background`         | string  | 否  | 背景设置，支持 `transparent`、`opaque`、`auto`（默认）              |
| `response_format`    | string  | 否  | 返回格式，`url`（默认）或 `b64_json`                             |
| `user`               | string  | 否  | 用户标识符，用于监控和检测滥用                                        |

### 参数详细说明

#### 尺寸选项 (size)

* `1024x1024` - 正方形（默认最快生成）
* `1536x1024` - 横向/风景模式
* `1024x1536` - 纵向/肖像模式
* `auto` - 模型根据提示词自动选择最佳尺寸（默认）

#### 质量选项 (quality)

* `low` - 低质量，生成速度最快
* `medium` - 中等质量
* `high` - 高质量，细节最丰富
* `auto` - 模型根据提示词自动选择（默认）

<Tip>
  **性能提示**：正方形图像 + 标准质量生成速度最快。如果对延迟敏感，建议使用 `jpeg` 格式而非 `png`。
</Tip>

#### 输出格式 (output\_format)

* `png` - 无损压缩，默认格式
* `jpeg` - 有损压缩，支持压缩级别，生成速度更快
* `webp` - 现代格式，文件更小，支持压缩级别

使用 `jpeg` 或 `webp` 时，可通过 `output_compression` 参数控制压缩级别（0-100%）。例如，`output_compression=50` 将压缩图像 50%。

#### 背景选项 (background)

* `transparent` - 透明背景（适用于 PNG/WebP）
* `opaque` - 不透明背景
* `auto` - 模型自动选择（默认）

### 响应格式

```json theme={null}
{
  "created": 1702486395,
  "data": [
    {
      "url": "https://..."
    }
  ]
}
```

## 模型与定价

### 可用模型

API易 支持两个 GPT-Image 系列模型：

<CardGroup cols={2}>
  <Card title="gpt-image-1" icon="image">
    标准版本，提供完整的图像生成能力
  </Card>

  <Card title="gpt-image-1-mini" icon="sparkles">
    轻量版本，更快的生成速度和更低的成本
  </Card>
</CardGroup>

### 定价方式

GPT-Image-1 支持两种计费方式，根据实际使用自动选择最优价格：

#### 1. Token 计费（按量计费）

适合需要精确控制成本的场景：

| Token 类型 | 价格                 |
| -------- | ------------------ |
| 输入 Token | \$2.50 / 百万 tokens |
| 输出 Token | \$8.00 / 百万 tokens |

<Info>
  Token 计费方式根据提示词长度（输入）和生成的图像数据量（输出）计费，实际成本可控。
</Info>

#### 2. 按图片计费（按次计费）

适合批量生成或固定成本需求：

**Low Quality（低质量）**

| 尺寸        | 价格          |
| --------- | ----------- |
| 1024×1024 | \$0.005 / 张 |
| 1024×1536 | \$0.006 / 张 |
| 1536×1024 | \$0.006 / 张 |

**Medium Quality（中等质量）**

| 尺寸        | 价格          |
| --------- | ----------- |
| 1024×1024 | \$0.011 / 张 |
| 1024×1536 | \$0.015 / 张 |
| 1536×1024 | \$0.015 / 张 |

**High Quality（高质量）**

| 尺寸        | 价格          |
| --------- | ----------- |
| 1024×1024 | \$0.036 / 张 |
| 1024×1536 | \$0.052 / 张 |
| 1536×1024 | \$0.052 / 张 |

<Warning>
  系统会自动选择更优惠的计费方式，您无需手动选择。最终费用以实际消耗为准。
</Warning>

### 模型对比

| 特性   | gpt-image-1 | gpt-image-1-mini |
| ---- | ----------- | ---------------- |
| 图像质量 | 标准          | 较快速度             |
| 生成速度 | 标准          | 更快               |
| 价格   | 标准价格        | 更实惠              |
| 适用场景 | 高质量需求       | 快速原型、批量生成        |

<Tip>
  对于预算有限或需要快速迭代的场景，推荐使用 gpt-image-1-mini。对于需要最佳质量的生产环境，推荐使用 gpt-image-1。
</Tip>

## 使用示例

### Python 示例

```python theme={null}
import openai
import requests
from PIL import Image
from io import BytesIO

# 配置
openai.api_base = "https://api.apiyi.com/v1"
openai.api_key = "your-api-key"

# 生成图像（使用新参数）
def generate_image(prompt, size="auto", quality="auto", output_format="png", n=1):
    try:
        response = openai.Image.create(
            model="gpt-image-1",
            prompt=prompt,
            n=n,
            size=size,
            quality=quality,
            output_format=output_format
        )
        
        # 返回图像 URLs
        return [item['url'] for item in response['data']]
    
    except Exception as e:
        print(f"Error generating image: {e}")
        return None

# 高级示例：使用压缩和背景设置
def generate_advanced_image(prompt, compression=None):
    params = {
        "model": "gpt-image-1",
        "prompt": prompt,
        "size": "1536x1024",  # 横向图片
        "quality": "high",
        "output_format": "jpeg" if compression else "png",
        "background": "transparent"
    }
    
    # 如果需要压缩，添加压缩参数
    if compression:
        params["output_compression"] = compression
    
    try:
        response = openai.Image.create(**params)
        return response['data'][0]['url']
    except Exception as e:
        print(f"Error: {e}")
        return None

# 下载并保存图像
def save_image(url, filename):
    response = requests.get(url)
    img = Image.open(BytesIO(response.content))
    img.save(filename)
    print(f"Image saved as {filename}")

# 使用示例
prompts = [
    "A futuristic city with flying cars and neon lights",
    "A cozy coffee shop in autumn with warm lighting",
    "An abstract art piece with vibrant colors and geometric shapes"
]

for i, prompt in enumerate(prompts):
    print(f"Generating: {prompt}")
    urls = generate_image(prompt)
    if urls:
        save_image(urls[0], f"image_{i+1}.png")
```

### Node.js 示例

```javascript theme={null}
const OpenAI = require('openai');
const fs = require('fs');
const https = require('https');

// 初始化客户端
const openai = new OpenAI({
  apiKey: 'your-api-key',
  baseURL: 'https://api.apiyi.com/v1'
});

// 生成图像（使用新参数）
async function generateImage(prompt, options = {}) {
  try {
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      n: options.n || 1,
      size: options.size || "auto",
      quality: options.quality || "auto",
      output_format: options.format || "png",
      background: options.background || "auto",
      ...options.compression && { output_compression: options.compression }
    });
    
    return response.data[0].url;
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
}

// 高级示例：生成高质量横向图片
async function generateLandscapeImage(prompt) {
  const options = {
    size: "1536x1024",
    quality: "high",
    format: "jpeg",
    compression: 85  // 85% 质量
  };
  
  return await generateImage(prompt, options);
}

// 下载图像
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Image saved to ${filepath}`);
        resolve();
      });
    }).on('error', reject);
  });
}

// 使用示例
async function main() {
  const prompt = "A beautiful Japanese garden with cherry blossoms";
  const imageUrl = await generateImage(prompt);
  
  if (imageUrl) {
    await downloadImage(imageUrl, 'japanese_garden.png');
  }
}

main();
```

### cURL 示例

```bash theme={null}
curl https://api.apiyi.com/v1/images/generations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "gpt-image-1",
    "prompt": "A white siamese cat sitting on a windowsill",
    "n": 1,
    "size": "1024x1024"
  }'
```

## 提示词优化建议

### 1. 详细描述

提供具体、详细的描述以获得更好的结果：

```python theme={null}
# 基础提示词
prompt_basic = "a cat"

# 优化后的提示词
prompt_detailed = "a fluffy white Persian cat sitting on a vintage velvet cushion, soft natural lighting, professional photography, shallow depth of field"
```

### 2. 风格指定

明确指定想要的艺术风格：

```python theme={null}
styles = [
    "in the style of Studio Ghibli anime",
    "photorealistic, professional photography",
    "digital art, concept art style",
    "oil painting, impressionist style",
    "minimalist, flat design illustration"
]
```

### 3. 构图和视角

指定构图和视角可以获得更精确的结果：

```python theme={null}
compositions = [
    "close-up portrait, centered composition",
    "wide angle landscape shot, rule of thirds",
    "aerial view, bird's eye perspective",
    "low angle shot, dramatic perspective"
]
```

## 批量生成

批量生成多张图像的示例：

```python theme={null}
import asyncio
import aiohttp
import openai

async def generate_batch_images(prompts, size="1024x1024"):
    """批量生成图像"""
    tasks = []
    
    async with aiohttp.ClientSession() as session:
        for prompt in prompts:
            task = generate_single_image(session, prompt, size)
            tasks.append(task)
        
        results = await asyncio.gather(*tasks)
    
    return results

async def generate_single_image(session, prompt, size):
    """异步生成单张图像"""
    headers = {
        "Authorization": f"Bearer {openai.api_key}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "gpt-image-1",
        "prompt": prompt,
        "n": 1,
        "size": size
    }
    
    async with session.post(
        f"{openai.api_base}/images/generations",
        headers=headers,
        json=data
    ) as response:
        result = await response.json()
        return {
            "prompt": prompt,
            "url": result['data'][0]['url']
        }

# 使用示例
prompts = [
    "A majestic eagle soaring over mountains",
    "A underwater coral reef teeming with colorful fish",
    "A cozy cabin in a snowy forest at night",
    "A bustling Tokyo street with neon signs"
]

# 运行批量生成
results = asyncio.run(generate_batch_images(prompts))
for result in results:
    print(f"Prompt: {result['prompt']}")
    print(f"URL: {result['url']}\n")
```

## 错误处理

### 常见错误码

| 错误码 | 说明      | 解决方案          |
| --- | ------- | ------------- |
| 400 | 无效的请求参数 | 检查提示词长度和参数格式  |
| 401 | 认证失败    | 验证 API 密钥是否正确 |
| 429 | 请求过于频繁  | 降低请求频率或升级套餐   |
| 500 | 服务器错误   | 稍后重试或联系技术支持   |

### 错误处理示例

```python theme={null}
import time
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

def generate_with_retry(prompt, max_retries=3):
    """带重试机制的图像生成"""
    for attempt in range(max_retries):
        try:
            response = client.images.generate(
                model="gpt-image-1",
                prompt=prompt,
                n=1,
                size="1024x1024"
            )
            return response.data[0].url
        
        except Exception as e:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt  # 指数退避
                print(f"Error: {e}. Retrying in {wait_time} seconds...")
                time.sleep(wait_time)
            else:
                print(f"Failed after {max_retries} attempts: {e}")
                return None
```

## 最佳实践

### 1. 提示词长度控制

虽然支持最长 1000 字符，但通常 100-200 字符的详细描述就能获得很好的效果。

### 2. 图像尺寸和质量选择

**尺寸建议**：

* `1024x1024`：通用场景，生成速度最快
* `1536x1024`：横向构图，适合风景、横幅
* `1024x1536`：纵向构图，适合人像、海报
* `auto`：让模型根据内容自动选择

**质量建议**：

* `low`：快速预览、批量生成
* `medium`：日常使用
* `high`：专业用途、打印输出
* `auto`：模型自动优化

**格式选择**：

* `png`：需要透明背景或无损质量
* `jpeg`：追求速度和更小文件
* `webp`：现代 Web 应用，最佳压缩比

### 3. 内容审核

生成的图像会自动进行内容审核，确保符合使用政策。避免请求生成以下内容：

* 暴力或令人不安的图像
* 成人内容
* 仇恨或歧视性内容
* 误导性或虚假信息
* 侵犯版权的内容

### 4. 成本优化

* 使用较小的尺寸进行测试和预览
* 批量生成时合理设置并发数量
* 缓存生成的图像 URL，避免重复生成

## 与 Sora Image 的区别

| 特性     | GPT-Image-1                                          | Sora Image           |
| ------ | ---------------------------------------------------- | -------------------- |
| 价格     | Token 计费（\$2.50/\$8.00 per M）或按图片（\$0.005-\$0.052/张） | \$0.01/张             |
| 计费方式   | 灵活计费（Token 或按次）                                      | 固定按次计费               |
| API 类型 | Images API                                           | Chat Completions API |
| 尺寸支持   | 1024×1024, 1024×1536, 1536×1024                      | 2:3, 3:2, 1:1 比例     |
| 质量选项   | Low / Medium / High                                  | 标准质量                 |
| 响应格式   | URL 或 Base64                                         | Markdown 格式图片链接      |

## 常见问题

### Q: 生成的图像可以商用吗？

A: 是的，通过 API 生成的图像您拥有完整的使用权，可以用于商业用途。

### Q: 图像 URL 的有效期是多久？

A: 生成的图像 URL 通常有效期为 24 小时，建议及时下载保存。

### Q: 支持中文提示词吗？

A: 支持，但建议使用英文提示词以获得最佳效果。

### Q: 如何提高生成图像的质量？

A: 使用详细、具体的描述，包括风格、光线、构图等细节。

## 相关资源

* OpenAI 官方 API 文档：`platform.openai.com/docs/api-reference/images/create`
* OpenAI 官方图像生成指南：`platform.openai.com/docs/guides/images`
* [API易控制台](https://api.apiyi.com)
* 技术支持：`support@apiyi.com`

<Note>
  GPT-Image-1 支持灵活的计费方式：Token 计费（输入 \$2.50/M，输出 \$8.00/M）或按图片计费（\$0.005-\$0.052/张）。系统自动选择更优惠的方式。同时提供 gpt-image-1-mini 轻量版本，适合快速原型和批量生成场景。
</Note>
