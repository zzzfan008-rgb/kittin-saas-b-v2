> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Sora Image 图片编辑 API

> 使用 Sora 官网逆向技术编辑和改造现有图片，按次计费仅需 $0.01/张

# Sora Image 图片编辑 API

Sora Image 编辑功能基于 sora.chatgpt.com 官网的图生图技术，通过对话补全接口实现对现有图片的智能编辑和改造。支持单张或多张图片的处理，价格极具竞争力。

<Note>
  **🎨 智能图片编辑**\
  上传图片 + 文字描述 = 全新创作！支持风格转换、元素修改、多图融合等高级功能。
</Note>

## 🌟 核心特性

* **🔄 灵活编辑**：支持风格转换、元素添加/删除、色彩调整等
* **🎭 多图处理**：可同时处理多张图片，实现融合、拼接等效果
* **💰 超值价格**：\$0.01/张，按次计费
* **🚀 即时生成**：基于对话接口，响应速度快
* **🌏 中文友好**：完美支持中文编辑指令

## 📋 功能对比

| 功能   | Sora Image 编辑 | 传统图片编辑 API    | DALL·E 2 编辑 |
| ---- | ------------- | ------------- | ----------- |
| 价格   | \$0.01/张      | \$0.02-0.09/张 | \$0.018/张   |
| 中文支持 | ✅ 原生支持        | ❌ 需翻译         | ❌ 需翻译       |
| 多图输入 | ✅ 支持          | ❌ 不支持         | ❌ 不支持       |
| 响应速度 | 快速            | 中等            | 较慢          |

## 🚀 快速开始

### 基础示例 - 单张图片编辑

```python theme={null}
import requests
import re

# API 配置
API_KEY = "YOUR_API_KEY"
API_URL = "https://api.apiyi.com/v1/chat/completions"

def edit_image(image_url, prompt, model="gpt-4o-image"):
    """
    编辑单张图片
    
    Args:
        image_url: 原图片 URL
        prompt: 编辑描述
        model: 使用的模型，可选 "gpt-4o-image" 或 "sora_image"
    """
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    # 构建包含图片的消息
    content = [
        {"type": "text", "text": prompt},
        {"type": "image_url", "image_url": {"url": image_url}}
    ]
    
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": content}]
    }
    
    response = requests.post(API_URL, headers=headers, json=payload)
    result = response.json()
    
    # 提取编辑后的图片 URL
    content = result['choices'][0]['message']['content']
    edited_urls = re.findall(r'!\[.*?\]\((https?://[^)]+)\)', content)
    
    return edited_urls[0] if edited_urls else None

# 使用示例
original_url = "https://example.com/cat.jpg"
edited_url = edit_image(original_url, "把猫咪的毛色改成彩虹色")
print(f"编辑后的图片: {edited_url}")
```

### 高级示例 - 多图融合

```python theme={null}
def merge_images(image_urls, prompt, model="gpt-4o-image"):
    """
    融合多张图片
    
    Args:
        image_urls: 图片 URL 列表
        prompt: 融合描述
    """
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    # 构建包含多张图片的消息
    content = [{"type": "text", "text": prompt}]
    for url in image_urls:
        content.append({
            "type": "image_url",
            "image_url": {"url": url}
        })
    
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": content}]
    }
    
    response = requests.post(API_URL, headers=headers, json=payload)
    result = response.json()
    
    # 提取结果
    content = result['choices'][0]['message']['content']
    merged_urls = re.findall(r'!\[.*?\]\((https?://[^)]+)\)', content)
    
    return merged_urls

# 融合示例
urls = [
    "https://example.com/landscape1.jpg",
    "https://example.com/landscape2.jpg"
]
merged = merge_images(urls, "将两张风景图融合成一张全景图")
```

## 🎯 编辑场景示例

### 1. 风格转换

```python theme={null}
# 风格转换模板
style_templates = {
    "卡通": "转换成迪士尼卡通风格，色彩鲜艳",
    "油画": "转换成古典油画风格，如梵高的画风",
    "水墨": "转换成中国水墨画风格，留白意境",
    "赛博朋克": "转换成赛博朋克风格，霓虹灯光效果",
    "素描": "转换成铅笔素描风格，黑白线条"
}

def apply_style(image_url, style_name):
    """应用预设风格"""
    if style_name in style_templates:
        prompt = style_templates[style_name]
        return edit_image(image_url, prompt)
    else:
        return None

# 批量风格转换
original = "https://example.com/portrait.jpg"
for style in ["卡通", "油画", "水墨"]:
    result = apply_style(original, style)
    print(f"{style}风格: {result}")
```

### 2. 智能抠图换背景

```python theme={null}
def change_background(image_url, new_background):
    """更换图片背景"""
    prompts = {
        "海滩": "保留主体，背景更换为阳光海滩，椰子树和蓝天",
        "办公室": "保留人物，背景更换为现代化办公室",
        "太空": "保留主体，背景更换为浩瀚星空",
        "纯色": "去除背景，更换为纯白色背景"
    }
    
    prompt = prompts.get(new_background, f"更换背景为{new_background}")
    return edit_image(image_url, prompt)

# 使用示例
new_photo = change_background(
    "https://example.com/person.jpg",
    "海滩"
)
```

### 3. 物体编辑

```python theme={null}
def edit_objects(image_url, action, target, details=""):
    """编辑图片中的特定物体"""
    action_prompts = {
        "添加": f"在图片中添加{target}，{details}",
        "删除": f"删除图片中的{target}，自然填充背景",
        "替换": f"将图片中的{target}替换为{details}",
        "修改": f"修改图片中的{target}，{details}"
    }
    
    prompt = action_prompts.get(action, "")
    return edit_image(image_url, prompt)

# 编辑示例
# 添加物体
result1 = edit_objects(
    "https://example.com/room.jpg",
    "添加", "一只猫", "坐在沙发上"
)

# 删除物体
result2 = edit_objects(
    "https://example.com/street.jpg",
    "删除", "电线杆"
)

# 替换物体
result3 = edit_objects(
    "https://example.com/table.jpg",
    "替换", "苹果", "橙子"
)
```

### 4. 颜色和光线调整

```python theme={null}
def adjust_image(image_url, adjustments):
    """调整图片的颜色和光线"""
    prompt_parts = []
    
    if "brightness" in adjustments:
        prompt_parts.append(f"亮度调整为{adjustments['brightness']}")
    
    if "color_tone" in adjustments:
        prompt_parts.append(f"色调调整为{adjustments['color_tone']}")
    
    if "time" in adjustments:
        prompt_parts.append(f"光线调整为{adjustments['time']}的效果")
    
    if "season" in adjustments:
        prompt_parts.append(f"季节感调整为{adjustments['season']}")
    
    prompt = "，".join(prompt_parts)
    return edit_image(image_url, prompt)

# 调整示例
adjusted = adjust_image(
    "https://example.com/landscape.jpg",
    {
        "brightness": "明亮",
        "color_tone": "暖色调",
        "time": "黄金时刻",
        "season": "秋天"
    }
)
```

## 💡 高级技巧

### 1. 批量处理优化

```python theme={null}
import asyncio
import aiohttp

async def edit_image_async(session, image_url, prompt):
    """异步编辑图片"""
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    content = [
        {"type": "text", "text": prompt},
        {"type": "image_url", "image_url": {"url": image_url}}
    ]
    
    payload = {
        "model": "gpt-4o-image",
        "messages": [{"role": "user", "content": content}]
    }
    
    async with session.post(API_URL, headers=headers, json=payload) as response:
        result = await response.json()
        content = result['choices'][0]['message']['content']
        urls = re.findall(r'!\[.*?\]\((https?://[^)]+)\)', content)
        return urls[0] if urls else None

async def batch_edit(image_urls, prompts):
    """批量编辑多张图片"""
    async with aiohttp.ClientSession() as session:
        tasks = []
        for url, prompt in zip(image_urls, prompts):
            task = edit_image_async(session, url, prompt)
            tasks.append(task)
        
        results = await asyncio.gather(*tasks)
        return results

# 批量处理示例
image_urls = ["url1.jpg", "url2.jpg", "url3.jpg"]
prompts = ["转卡通风格", "添加彩虹", "改为夜景"]

results = asyncio.run(batch_edit(image_urls, prompts))
```

### 2. 编辑历史管理

```python theme={null}
import json
from datetime import datetime

class EditHistory:
    """图片编辑历史管理"""
    
    def __init__(self, filename="edit_history.json"):
        self.filename = filename
        self.history = self.load_history()
    
    def load_history(self):
        try:
            with open(self.filename, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return []
    
    def save_edit(self, original_url, edited_url, prompt):
        """保存编辑记录"""
        record = {
            "timestamp": datetime.now().isoformat(),
            "original": original_url,
            "edited": edited_url,
            "prompt": prompt,
            "cost": 0.01
        }
        
        self.history.append(record)
        
        with open(self.filename, 'w') as f:
            json.dump(self.history, f, indent=2)
    
    def get_total_cost(self):
        """计算总成本"""
        return sum(record['cost'] for record in self.history)

# 使用历史管理
history = EditHistory()

# 编辑并记录
original = "https://example.com/photo.jpg"
edited = edit_image(original, "美化照片")
history.save_edit(original, edited, "美化照片")

print(f"总共编辑了 {len(history.history)} 张图片")
print(f"总成本: ${history.get_total_cost():.2f}")
```

### 3. 智能编辑建议

```python theme={null}
def suggest_edits(image_description):
    """根据图片描述生成编辑建议"""
    suggestions = []
    
    # 基于内容的建议
    if "人物" in image_description:
        suggestions.extend([
            "美颜磨皮，自然效果",
            "更换专业摄影棚背景",
            "调整为专业人像光线"
        ])
    
    if "风景" in image_description:
        suggestions.extend([
            "增强色彩饱和度，让风景更生动",
            "调整为黄金时刻光线",
            "添加梦幻光效"
        ])
    
    if "产品" in image_description:
        suggestions.extend([
            "更换为纯白背景",
            "增加产品光泽感",
            "添加倒影效果"
        ])
    
    # 通用建议
    suggestions.extend([
        "转换为油画艺术风格",
        "应用复古滤镜效果",
        "优化整体色彩平衡"
    ])
    
    return suggestions

# 获取编辑建议
suggestions = suggest_edits("人物肖像照片")
print("推荐的编辑操作:")
for i, suggestion in enumerate(suggestions[:5], 1):
    print(f"{i}. {suggestion}")
```

## 📊 效果对比

| 编辑类型 | 原图描述 | 编辑指令    | 效果描述      |
| ---- | ---- | ------- | --------- |
| 风格转换 | 真实照片 | 转换为动漫风格 | 保留构图，日漫画风 |
| 背景替换 | 室内人像 | 更换为海滩背景 | 自然融合，光线匹配 |
| 物体编辑 | 桌面场景 | 添加一杯咖啡  | 透视准确，阴影真实 |
| 多图融合 | 两张风景 | 创建全景图   | 无缝拼接，色调统一 |

## ⚠️ 使用建议

1. **图片质量**：输入图片分辨率越高，编辑效果越好
2. **描述清晰**：编辑指令要具体明确，避免歧义
3. **分步编辑**：复杂编辑建议分步进行，效果更佳
4. **保存原图**：始终保留原始图片备份

## 🔍 常见问题

### Q: 支持哪些图片格式？

A: 支持 JPG、PNG、WebP 等常见格式，通过 URL 方式输入。

### Q: 可以处理多大的图片？

A: 建议图片大小在 20MB 以内，过大可能影响处理速度。

### Q: 编辑后的图片分辨率？

A: 通常保持与原图相近的分辨率，具体取决于编辑内容。

### Q: 如何处理批量图片？

A: 使用异步请求或循环调用，建议控制并发数量。

## 🎨 创意应用

* **电商图片处理**：批量更换产品背景
* **社交媒体内容**：快速生成多种风格变体
* **创意设计**：探索不同的视觉效果
* **照片修复**：改善老照片质量
* **内容创作**：为故事配图生成变体

## 🔗 相关资源

* [完整示例代码](https://github.com/apiyi-api/ai-api-code-samples/tree/main/sora_image-API)
* [Sora Image 生图 API](/api-capabilities/sora-image-generation) - 文生图功能
* [图像理解 API](/api-capabilities/vision-understanding) - 图片分析功能
* [在线体验工具](https://imagen.apiyi.com) - 测试各种效果

<Note>
  💡 **专业提示**：结合图像理解 API 先分析图片内容，再进行针对性编辑，效果更佳！
</Note>
