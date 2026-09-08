> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 图像编辑 API

> 使用 OpenAI 官方 Image Edit API 格式进行图像编辑和修改

# 图像编辑 API

通过 API易 使用 OpenAI 标准的图像编辑 API，可以对现有图像进行局部编辑和修改。本文档详细介绍如何使用 Image Edit API 进行图像编辑。

## 概述

图像编辑 API 允许您通过提供原始图像、遮罩（mask）和文本提示词来编辑图像的特定部分。这个功能特别适用于：

* 🎨 **局部修改**：只修改图像的特定区域
* 🔄 **内容替换**：替换图像中的某些元素
* ✨ **创意编辑**：在保持整体风格的同时添加新元素
* 🖼️ **图像修复**：修复或改进图像的特定部分

## API 工作原理

图像编辑需要三个关键要素：

1. **原始图像**：要编辑的基础图像
2. **遮罩图像**：指定要编辑的区域（透明部分将被编辑）
3. **提示词**：描述您想要在编辑区域生成的内容

<Note>
  遮罩图像中的透明区域（alpha 通道为 0）将被识别为需要编辑的部分。完全不透明的区域将保持不变。
</Note>

## 快速开始

### 基础配置

```python theme={null}
import openai
from PIL import Image
import requests
from io import BytesIO

# 配置 API易
openai.api_base = "https://api.apiyi.com/v1"
openai.api_key = "your-api-key"
```

### 基本编辑示例

```python theme={null}
# 编辑图像
response = openai.Image.create_edit(
    image=open("original.png", "rb"),
    mask=open("mask.png", "rb"),
    prompt="A modern glass skyscraper with reflective windows",
    n=1,
    size="1024x1024"
)

# 获取编辑后的图像 URL
edited_image_url = response['data'][0]['url']
print(f"Edited image URL: {edited_image_url}")
```

## API 参数详解

### 请求参数

| 参数                | 类型           | 必填 | 说明                                                            |
| ----------------- | ------------ | -- | ------------------------------------------------------------- |
| `image`           | string/array | 是  | 要编辑的图像，支持 PNG、WebP、JPG 格式，每张图片小于 50MB。gpt-image-1 最多支持 16 张图片 |
| `mask`            | file         | 是  | 遮罩图像，指定要编辑的区域，格式要求同 image                                     |
| `prompt`          | string       | 是  | 描述要在遮罩区域生成的内容，最长 1000 字符                                      |
| `n`               | integer      | 否  | 生成的图像数量，默认为 1，最大为 10                                          |
| `size`            | string       | 否  | 输出图像尺寸，支持 `256x256`、`512x512`、`1024x1024`（默认）                 |
| `response_format` | string       | 否  | 返回格式，`url`（默认）或 `b64_json`                                    |
| `user`            | string       | 否  | 用户标识符                                                         |

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

## 创建遮罩图像

### 使用 Python PIL 创建遮罩

```python theme={null}
from PIL import Image, ImageDraw

def create_mask(image_path, mask_areas):
    """
    创建遮罩图像
    mask_areas: 列表，包含要编辑的区域坐标 [(x1, y1, x2, y2), ...]
    """
    # 打开原始图像获取尺寸
    original = Image.open(image_path)
    width, height = original.size
    
    # 创建全黑遮罩（完全不透明）
    mask = Image.new('RGBA', (width, height), (0, 0, 0, 255))
    draw = ImageDraw.Draw(mask)
    
    # 在指定区域绘制透明（要编辑的部分）
    for area in mask_areas:
        draw.rectangle(area, fill=(0, 0, 0, 0))
    
    # 保存遮罩
    mask.save('mask.png')
    return mask

# 示例：创建中心区域的遮罩
image_path = 'original.png'
img = Image.open(image_path)
width, height = img.size

# 编辑图像中心 50% 的区域
center_area = [
    (width * 0.25, height * 0.25, 
     width * 0.75, height * 0.75)
]

mask = create_mask(image_path, center_area)
```

### 使用圆形遮罩

```python theme={null}
def create_circular_mask(image_path, center, radius):
    """创建圆形遮罩"""
    original = Image.open(image_path)
    width, height = original.size
    
    # 创建遮罩
    mask = Image.new('RGBA', (width, height), (0, 0, 0, 255))
    draw = ImageDraw.Draw(mask)
    
    # 绘制圆形透明区域
    x, y = center
    draw.ellipse(
        [(x - radius, y - radius), 
         (x + radius, y + radius)], 
        fill=(0, 0, 0, 0)
    )
    
    mask.save('circular_mask.png')
    return mask
```

## 完整使用示例

### Python 完整示例

```python theme={null}
import openai
from PIL import Image, ImageDraw
import requests
from io import BytesIO
import os

# 配置
openai.api_base = "https://api.apiyi.com/v1"
openai.api_key = "your-api-key"

class ImageEditor:
    def __init__(self):
        self.api_key = openai.api_key
        
    def create_mask_for_object_removal(self, image_path, bbox):
        """为对象移除创建遮罩"""
        img = Image.open(image_path)
        mask = Image.new('RGBA', img.size, (0, 0, 0, 255))
        draw = ImageDraw.Draw(mask)
        draw.rectangle(bbox, fill=(0, 0, 0, 0))
        return mask
    
    def edit_image(self, image_path, mask, prompt):
        """执行图像编辑"""
        try:
            # 准备文件
            with open(image_path, 'rb') as img_file:
                # 保存遮罩到临时文件
                mask_path = 'temp_mask.png'
                mask.save(mask_path)
                
                with open(mask_path, 'rb') as mask_file:
                    # 调用 API
                    response = openai.Image.create_edit(
                        image=img_file,
                        mask=mask_file,
                        prompt=prompt,
                        n=1,
                        size="1024x1024"
                    )
                
                # 清理临时文件
                os.remove(mask_path)
                
                return response['data'][0]['url']
                
        except Exception as e:
            print(f"编辑失败: {e}")
            return None
    
    def download_result(self, url, output_path):
        """下载编辑后的图像"""
        response = requests.get(url)
        img = Image.open(BytesIO(response.content))
        img.save(output_path)
        print(f"已保存到: {output_path}")

# 使用示例
editor = ImageEditor()

# 1. 移除对象示例
image_path = "street_photo.png"
# 假设要移除的对象在 (300, 200) 到 (500, 400) 的位置
bbox = (300, 200, 500, 400)
mask = editor.create_mask_for_object_removal(image_path, bbox)

# 编辑图像，用背景填充移除的区域
result_url = editor.edit_image(
    image_path,
    mask,
    "empty street background, seamlessly blended"
)

if result_url:
    editor.download_result(result_url, "edited_street.png")
```

### Node.js 示例

```javascript theme={null}
const OpenAI = require('openai');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

// 初始化客户端
const openai = new OpenAI({
  apiKey: 'your-api-key',
  baseURL: 'https://api.apiyi.com/v1'
});

// 创建遮罩
async function createMask(imagePath, editArea) {
  const image = await loadImage(imagePath);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  
  // 填充黑色背景（不编辑的部分）
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, image.width, image.height);
  
  // 设置透明区域（要编辑的部分）
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillRect(editArea.x, editArea.y, editArea.width, editArea.height);
  
  // 保存遮罩
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('mask.png', buffer);
  return 'mask.png';
}

// 编辑图像
async function editImage(imagePath, maskPath, prompt) {
  try {
    const response = await openai.images.edit({
      image: fs.createReadStream(imagePath),
      mask: fs.createReadStream(maskPath),
      prompt: prompt,
      n: 1,
      size: "1024x1024"
    });
    
    return response.data[0].url;
  } catch (error) {
    console.error('编辑失败:', error);
    return null;
  }
}

// 使用示例
async function main() {
  const imagePath = 'original.png';
  
  // 创建遮罩 - 编辑右下角区域
  const editArea = {
    x: 512,
    y: 512,
    width: 512,
    height: 512
  };
  
  const maskPath = await createMask(imagePath, editArea);
  
  // 执行编辑
  const editedUrl = await editImage(
    imagePath,
    maskPath,
    "A beautiful garden with colorful flowers"
  );
  
  if (editedUrl) {
    console.log('编辑成功:', editedUrl);
  }
  
  // 清理临时文件
  fs.unlinkSync(maskPath);
}

main();
```

## 实际应用场景

### 1. 背景替换

```python theme={null}
def replace_background(image_path, prompt_background):
    """替换图像背景"""
    # 假设已有分割出前景的遮罩
    mask = Image.open("foreground_mask.png")
    
    response = openai.Image.create_edit(
        image=open(image_path, "rb"),
        mask=mask,
        prompt=f"Professional studio background, {prompt_background}",
        size="1024x1024"
    )
    
    return response['data'][0]['url']

# 使用示例
new_url = replace_background(
    "portrait.png",
    "gradient blue background with soft lighting"
)
```

### 2. 对象移除

```python theme={null}
def remove_object(image_path, object_bbox):
    """移除图像中的特定对象"""
    # 创建对象区域的遮罩
    img = Image.open(image_path)
    mask = Image.new('RGBA', img.size, (0, 0, 0, 255))
    draw = ImageDraw.Draw(mask)
    draw.rectangle(object_bbox, fill=(0, 0, 0, 0))
    
    # 保存遮罩
    mask_path = "object_mask.png"
    mask.save(mask_path)
    
    # 编辑图像
    response = openai.Image.create_edit(
        image=open(image_path, "rb"),
        mask=open(mask_path, "rb"),
        prompt="seamlessly blend with surrounding environment, natural continuation of background",
        size="1024x1024"
    )
    
    return response['data'][0]['url']
```

### 3. 服装更换

```python theme={null}
def change_clothing(portrait_path, clothing_mask_path, new_clothing_desc):
    """更换人物服装"""
    response = openai.Image.create_edit(
        image=open(portrait_path, "rb"),
        mask=open(clothing_mask_path, "rb"),
        prompt=f"person wearing {new_clothing_desc}, natural fit and lighting",
        size="1024x1024"
    )
    
    return response['data'][0]['url']

# 示例
new_url = change_clothing(
    "person.png",
    "clothing_mask.png", 
    "elegant black business suit with white shirt"
)
```

### 4. 图像修复

```python theme={null}
def repair_damaged_area(image_path, damage_mask_path):
    """修复图像损坏区域"""
    response = openai.Image.create_edit(
        image=open(image_path, "rb"),
        mask=open(damage_mask_path, "rb"),
        prompt="restore and repair the damaged area, maintain original style and details",
        size="1024x1024"
    )
    
    return response['data'][0]['url']
```

## 高级技巧

### 1. 渐进式遮罩

创建具有羽化边缘的遮罩，使编辑更加自然：

```python theme={null}
from PIL import ImageFilter

def create_feathered_mask(image_path, edit_area, feather_radius=20):
    """创建羽化遮罩"""
    img = Image.open(image_path)
    mask = Image.new('L', img.size, 0)
    draw = ImageDraw.Draw(mask)
    
    # 绘制编辑区域
    draw.rectangle(edit_area, fill=255)
    
    # 应用高斯模糊实现羽化
    mask = mask.filter(ImageFilter.GaussianBlur(feather_radius))
    
    # 转换为 RGBA
    rgba_mask = Image.new('RGBA', img.size, (0, 0, 0, 255))
    rgba_mask.putalpha(255 - mask)
    
    return rgba_mask
```

### 2. 多区域编辑

同时编辑多个区域：

```python theme={null}
def create_multi_region_mask(image_path, regions):
    """创建多区域遮罩"""
    img = Image.open(image_path)
    mask = Image.new('RGBA', img.size, (0, 0, 0, 255))
    draw = ImageDraw.Draw(mask)
    
    for region in regions:
        if region['type'] == 'rectangle':
            draw.rectangle(region['coords'], fill=(0, 0, 0, 0))
        elif region['type'] == 'ellipse':
            draw.ellipse(region['coords'], fill=(0, 0, 0, 0))
    
    return mask

# 使用示例
regions = [
    {'type': 'rectangle', 'coords': (100, 100, 300, 300)},
    {'type': 'ellipse', 'coords': (400, 400, 600, 600)}
]

mask = create_multi_region_mask('image.png', regions)
```

### 3. 智能提示词构建

```python theme={null}
def build_context_aware_prompt(original_desc, edit_type, new_element):
    """构建上下文感知的提示词"""
    prompts = {
        'replace': f"Replace with {new_element}, matching the {original_desc} style and lighting",
        'remove': f"Natural {original_desc} background, seamlessly filled",
        'add': f"Add {new_element} that fits naturally with {original_desc}",
        'repair': f"Restore and fix, maintaining {original_desc} characteristics"
    }
    
    return prompts.get(edit_type, f"{new_element} in {original_desc}")
```

## 最佳实践

### 1. 图像准备

* **格式要求**：支持 PNG、WebP、JPG 格式
* **文件大小**：每张图片小于 50MB
* **批量处理**：gpt-image-1 最多支持 16 张图片
* **分辨率建议**：使用 1024x1024 获得最佳效果

### 2. 遮罩设计

* **精确遮罩**：遮罩越精确，编辑效果越好
* **边缘处理**：考虑使用羽化边缘使编辑更自然
* **区域大小**：避免编辑区域过大，可能影响效果

### 3. 提示词优化

```python theme={null}
# 好的提示词示例
good_prompts = [
    "Empty wooden table surface, matching the existing wood grain and lighting",
    "Clear blue sky with soft clouds, natural continuation of the horizon",
    "Modern glass building facade, reflecting the surrounding environment"
]

# 避免的提示词
bad_prompts = [
    "Something different",  # 太模糊
    "Red",  # 缺少上下文
    "Change it"  # 没有具体说明
]
```

### 4. 错误处理

```python theme={null}
def safe_edit_image(image_path, mask_path, prompt, max_retries=3):
    """带错误处理和重试的图像编辑"""
    for attempt in range(max_retries):
        try:
            # 验证文件
            if not os.path.exists(image_path):
                raise FileNotFoundError(f"图像文件不存在: {image_path}")
            
            if not os.path.exists(mask_path):
                raise FileNotFoundError(f"遮罩文件不存在: {mask_path}")
            
            # 检查文件大小
            if os.path.getsize(image_path) > 50 * 1024 * 1024:
                raise ValueError("图像文件大于 50MB")
            
            # 执行编辑
            response = openai.Image.create_edit(
                image=open(image_path, "rb"),
                mask=open(mask_path, "rb"),
                prompt=prompt,
                size="1024x1024"
            )
            
            return response['data'][0]['url']
            
        except Exception as e:
            print(f"尝试 {attempt + 1} 失败: {e}")
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)  # 指数退避
```

## 常见问题

### Q: 为什么编辑结果与预期不符？

A: 检查遮罩是否正确，确保透明区域准确覆盖要编辑的部分。同时优化提示词，提供更具体的描述。

### Q: 支持哪些图像格式？

A: 支持 PNG、WebP、JPG 格式，每张图片小于 50MB。gpt-image-1 最多支持 16 张图片。

### Q: 如何获得更自然的编辑效果？

A: 使用羽化遮罩，在提示词中强调"自然融合"、"匹配周围环境"等。

### Q: 可以同时编辑多个区域吗？

A: 可以，只需在遮罩中标记多个透明区域即可。

### Q: 编辑大型图像时有什么限制？

A: 每张图片文件必须小于 50MB，gpt-image-1 支持最多 16 张图片批量处理。

## 相关资源

* OpenAI 官方 API 文档：`platform.openai.com/docs/api-reference/images/createEdit`
* OpenAI 图像编辑指南：`platform.openai.com/docs/guides/images/edits`
* PIL/Pillow 文档：`pillow.readthedocs.io`
* [API易控制台](https://api.apiyi.com)

<Note>
  图像编辑 API 特别适合需要精确控制编辑区域的场景。通过合理设计遮罩和优化提示词，可以实现专业级的图像编辑效果。
</Note>
