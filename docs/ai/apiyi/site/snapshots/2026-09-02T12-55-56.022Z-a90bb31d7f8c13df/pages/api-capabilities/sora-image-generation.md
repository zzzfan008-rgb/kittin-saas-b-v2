> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Sora Image 生图 API

> 使用 Sora 官网逆向模型快速生成高质量图片，按次计费仅需 $0.01/张

# Sora Image 生图 API

Sora Image 是基于 sora.chatgpt.com 官网逆向技术的图像生成 API，通过对话补全接口实现文生图功能。相比传统的 OpenAI Images API，价格更加优惠，仅需 \$0.01/张图片。

<Note>
  **💰 超值价格**\
  按次计费，每张图片仅需 \$0.01！相比 GPT-Image-1 的按 Token 计费（\$10输入/\$40输出 per M Tokens），价格更透明、可预测！
</Note>

## 🌟 核心特性

* **💸 极致性价比**：\$0.01/张，按次计费，无需担心 Token 消耗
* **🎨 高质量输出**：基于 Sora 官网技术，生成效果媲美 DALL·E 3
* **⚡ 快速响应**：优化的逆向技术，秒级生成
* **📐 多尺寸支持**：支持 2:3、3:2、1:1 三种比例
* **🔧 简单易用**：使用标准对话补全接口，无需学习新 API

## 📋 模型信息

| 模型               | 模型 ID          | 计费方式 | 价格       | 特点        |
| ---------------- | -------------- | ---- | -------- | --------- |
| **Sora Image**   | `sora_image`   | 按次计费 | \$0.01/张 | 文生图，高质量   |
| **GPT-4o Image** | `gpt-4o-image` | 按次计费 | \$0.01/张 | 同源技术，效果相似 |

<Tip>
  💡 **价格优势**

  * GPT-Image-1: 按 Token 计费（\$10输入/\$40输出 per M Tokens）
  * Sora Image: 固定 \$0.01/张（无论提示词长度）
  * Sora 价格更透明、可预测！
</Tip>

## 🚀 快速开始

### 基础示例

```python theme={null}
import requests
import re

# API 配置
API_KEY = "YOUR_API_KEY"
API_URL = "https://api.apiyi.com/v1/chat/completions"

def generate_image(prompt, ratio="2:3"):
    """
    使用 Sora Image 生成图片
    
    Args:
        prompt: 图片描述文本
        ratio: 图片比例，支持 "2:3", "3:2", "1:1"
    """
    # 在提示词末尾添加比例标记
    if ratio and ratio in ["2:3", "3:2", "1:1"]:
        prompt = f"{prompt}【{ratio}】"
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "sora_image",
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
    }
    
    response = requests.post(API_URL, headers=headers, json=payload)
    result = response.json()
    
    # 提取图片 URL
    content = result['choices'][0]['message']['content']
    image_urls = re.findall(r'!\[.*?\]\((https?://[^)]+)\)', content)
    
    return image_urls

# 使用示例
urls = generate_image("一只可爱的猫咪在花园里玩耍", "2:3")
print(f"生成的图片: {urls[0]}")
```

### 批量生成示例

```python theme={null}
def batch_generate_images(prompts, ratio="2:3"):
    """批量生成图片"""
    results = []
    
    for prompt in prompts:
        try:
            urls = generate_image(prompt, ratio)
            results.append({
                "prompt": prompt,
                "url": urls[0] if urls else None,
                "success": bool(urls)
            })
            print(f"✅ 成功生成: {prompt}")
        except Exception as e:
            results.append({
                "prompt": prompt,
                "url": None,
                "success": False,
                "error": str(e)
            })
            print(f"❌ 生成失败: {prompt} - {e}")
    
    return results

# 批量生成示例
prompts = [
    "夕阳下的海滩",
    "未来科技城市",
    "梦幻森林中的精灵"
]

results = batch_generate_images(prompts, "3:2")
```

## 📐 尺寸比例说明

Sora Image 支持三种预设比例，通过在提示词末尾添加比例标记来指定：

| 比例标记      | 尺寸比例 | 适用场景      | 示例           |
| --------- | ---- | --------- | ------------ |
| **【2:3】** | 竖版   | 人物肖像、手机壁纸 | `美丽的花朵【2:3】` |
| **【3:2】** | 横版   | 风景照片、横幅图片 | `壮观的山脉【3:2】` |
| **【1:1】** | 正方形  | 社交媒体头像、图标 | `可爱的小狗【1:1】` |

### 尺寸使用示例

```python theme={null}
# 竖版人像
portrait = generate_image("优雅的女士肖像，专业摄影风格【2:3】")

# 横版风景
landscape = generate_image("日出时分的山谷，光线柔和【3:2】")

# 正方形图标
icon = generate_image("简约现代的应用图标设计【1:1】")
```

## 🎯 最佳实践

### 1. 提示词优化

```python theme={null}
# ❌ 不推荐：过于简单
prompt = "猫"

# ✅ 推荐：详细描述
prompt = """
一只毛茸茸的橘色猫咪，
坐在阳光明媚的窗台上，
背景是模糊的城市景观，
摄影风格，高清细节
【2:3】
"""
```

### 2. 错误处理

```python theme={null}
import time

def generate_with_retry(prompt, max_retries=3):
    """带重试机制的图片生成"""
    for attempt in range(max_retries):
        try:
            urls = generate_image(prompt)
            if urls:
                return urls[0]
        except Exception as e:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt  # 指数退避
                print(f"重试 {attempt + 1}/{max_retries}，等待 {wait_time}s...")
                time.sleep(wait_time)
            else:
                raise e
    
    return None
```

### 3. 结果保存

```python theme={null}
import requests
from datetime import datetime

def save_generated_image(url, prompt):
    """保存生成的图片到本地"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"sora_{timestamp}.png"
    
    response = requests.get(url)
    with open(filename, 'wb') as f:
        f.write(response.content)
    
    # 保存提示词信息
    with open(f"sora_{timestamp}_prompt.txt", 'w', encoding='utf-8') as f:
        f.write(f"Prompt: {prompt}\n")
        f.write(f"URL: {url}\n")
        f.write(f"Time: {datetime.now()}\n")
    
    return filename
```

## 💡 高级技巧

### 1. 风格化生成

```python theme={null}
# 艺术风格模板
art_styles = {
    "油画": "油画风格，厚重的笔触，丰富的色彩层次",
    "水彩": "水彩画风格，透明感，色彩流动",
    "素描": "铅笔素描风格，黑白，细腻的线条",
    "动漫": "日本动漫风格，大眼睛，鲜艳的色彩",
    "写实": "超写实摄影，高清细节，专业摄影"
}

def generate_with_style(subject, style_name):
    """使用预设风格生成图片"""
    style = art_styles.get(style_name, "")
    prompt = f"{subject}，{style}【2:3】"
    return generate_image(prompt)

# 使用示例
url = generate_with_style("美丽的玫瑰花", "水彩")
```

### 2. 场景模板

```python theme={null}
# 场景生成模板
def generate_scene(subject, time="日落", weather="晴朗", mood="宁静"):
    """根据参数生成场景图片"""
    prompt = f"""
    {subject}
    时间：{time}
    天气：{weather}
    氛围：{mood}
    摄影风格，专业构图
    【3:2】
    """
    return generate_image(prompt.strip())

# 生成不同场景
sunset_beach = generate_scene("海滩", "日落", "微风", "浪漫")
morning_forest = generate_scene("森林小径", "清晨", "薄雾", "神秘")
```

### 3. 批量主题变体

```python theme={null}
def generate_variations(base_prompt, variations, ratio="2:3"):
    """生成同一主题的多个变体"""
    results = []
    
    for variation in variations:
        full_prompt = f"{base_prompt}，{variation}【{ratio}】"
        try:
            url = generate_image(full_prompt)[0]
            results.append({
                "variation": variation,
                "url": url,
                "prompt": full_prompt
            })
        except Exception as e:
            print(f"变体生成失败: {variation}")
    
    return results

# 生成猫咪的不同变体
base = "一只可爱的猫咪"
variations = [
    "橘色虎斑",
    "黑白奶牛色",
    "纯白色长毛",
    "灰色短毛"
]

cat_variations = generate_variations(base, variations)
```

## 📊 成本计算器

```python theme={null}
def calculate_cost(num_images):
    """计算生成图片的成本"""
    cost_per_image = 0.01  # $0.01 per image
    total_cost = num_images * cost_per_image
    
    # 与 GPT-Image-1 对比
    # GPT-Image-1 按 Token 计费，假设平均每张图约 1000 tokens
    avg_tokens_per_image = 1000
    gpt_image_1_cost = num_images * (avg_tokens_per_image / 1_000_000) * 40  # 输出 token费用
    
    print(f"Sora Image 成本计算:")
    print(f"- 图片数量: {num_images}")
    print(f"- 单价: ${cost_per_image} (固定价格)")
    print(f"- 总成本: ${total_cost:.2f}")
    print(f"\n对比 GPT-Image-1:")
    print(f"- GPT-Image-1 计费: 按Token ($10输入/$40输出 per M)")
    print(f"- 预估成本: ${gpt_image_1_cost:.2f} (假设每张~1000 tokens)")
    print(f"- Sora 优势: 固定价格，成本可控")

# 计算示例
calculate_cost(100)  # 生成 100 张图片
```

## ⚠️ 使用限制

1. **请求频率**：建议控制在 10 请求/分钟以内
2. **提示词长度**：建议不超过 500 字符
3. **比例限制**：仅支持 2:3、3:2、1:1 三种比例
4. **内容审核**：自动过滤不当内容请求

## 🔍 常见问题

### Q: 为什么价格这么便宜？

A: Sora Image 采用逆向技术优化，降低了中间成本，让利给用户。

### Q: 图片质量如何？

A: 基于 Sora 官网同源技术，质量优秀，适合大部分商用场景。相比 GPT-Image-1 的按 Token 计费，Sora Image 的固定价格更易于预算控制。

### Q: 支持哪些语言？

A: 完美支持中文和英文提示词，中文效果已经过优化。

### Q: 图片版权问题？

A: 生成的图片可用于商业用途，但建议避免生成涉及版权的内容。

## 🎨 效果展示

以下是一些使用 Sora Image 生成的示例效果：

| 提示词      | 比例  | 效果描述       |
| -------- | --- | ---------- |
| 赛博朋克城市夜景 | 3:2 | 霓虹灯光、未来感建筑 |
| 梦幻独角兽    | 2:3 | 粉色系、童话风格   |
| 日式禅意庭院   | 1:1 | 极简、宁静氛围    |

## 🔗 相关资源

* [完整示例代码](https://github.com/apiyi-api/ai-api-code-samples/tree/main/sora_image-API)
* [图像编辑 API](/api-capabilities/sora-image-edit) - 使用 Sora 编辑现有图片
* [GPT-Image-1 API](/api-capabilities/gpt-image-2/overview) - 官方接口的图像生成
* [在线测试工具](https://imagen.apiyi.com) - 比较不同模型效果

<Note>
  🚀 **快速开始**：注册 API易 账号即可获得测试额度，立即体验 Sora Image 的强大功能！
</Note>
