> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image 系列图像生成

> OpenAI GPT-Image 系列图像生成模型总览，包括 GPT-Image-1.5 和 GPT-Image-1，通过 API易 一键调用。

OpenAI GPT-Image 系列是目前最先进的 AI 图像生成模型之一，支持文本生成图像、图像编辑等功能。API易 已全面接入 GPT-Image 系列，完全兼容 OpenAI 官方 Image API 格式。

## 模型对比

| 特性       | GPT-Image-1.5       | GPT-Image-1        | GPT-Image-1-Mini |
| -------- | ------------------- | ------------------ | ---------------- |
| **发布时间** | 2025年12月            | 2025年4月            | 2025年4月          |
| **生成速度** | 极快（少于10秒）           | 标准                 | 更快               |
| **文字渲染** | 极强（支持密集文字、表格）       | 良好                 | 良好               |
| **编辑能力** | 高精度保留原图元素           | 标准                 | 标准               |
| **指令遵循** | 更精准                 | 标准                 | 标准               |
| **输入价格** | \$5.00 / 百万 tokens  | \$2.50 / 百万 tokens | 更低               |
| **输出价格** | \$10.00 / 百万 tokens | \$8.00 / 百万 tokens | 更低               |
| **适用场景** | 专业设计、品牌素材、信息图       | 通用图像生成             | 快速原型、批量生成        |

<Tip>
  **如何选择？**

  * 需要精准文字渲染、品牌素材、信息图 → **GPT-Image-1.5**
  * 通用图像生成、预算敏感 → **GPT-Image-1**
  * 快速迭代、批量生产 → **GPT-Image-1-Mini**
</Tip>

## 快速开始

所有 GPT-Image 模型共享相同的 API 格式，只需更换 `model` 参数即可切换：

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

{/* 使用 GPT-Image-1.5 */}
response = client.images.generate(
    model="gpt-image-1.5",
    prompt="一张专业的产品展示图，白色背景，柔和光影",
    size="1024x1024",
    quality="high"
)

print(response.data[0].url)
```

## 通用参数

所有 GPT-Image 模型支持以下参数：

| 参数              | 类型      | 说明                                                 |
| --------------- | ------- | -------------------------------------------------- |
| `model`         | string  | `gpt-image-1.5`、`gpt-image-1` 或 `gpt-image-1-mini` |
| `prompt`        | string  | 图像描述（最长 1000 字符）                                   |
| `size`          | string  | `1024x1024`、`1536x1024`、`1024x1536`、`auto`         |
| `quality`       | string  | `low`、`medium`、`high`、`auto`                       |
| `output_format` | string  | `png`、`jpeg`、`webp`                                |
| `background`    | string  | `transparent`、`opaque`、`auto`                      |
| `n`             | integer | 生成数量（1-10）                                         |

## 详细文档

<CardGroup cols={2}>
  <Card title="GPT-Image-1.5" icon="bolt" href="/api-capabilities/gpt-image-1-5">
    最新旗舰模型，4 倍速度提升，极强文字渲染，LMArena 排行榜第一
  </Card>

  <Card title="GPT-Image-1" icon="image" href="/api-capabilities/gpt-image-1">
    经典图像生成模型，通用场景首选，性价比高
  </Card>
</CardGroup>

## 常见问题

<AccordionGroup>
  <Accordion title="GPT-Image-1.5 和 GPT-Image-1 有什么区别？">
    GPT-Image-1.5 速度快 4 倍、成本低 20%，文字渲染能力大幅提升（支持密集文字和表格），编辑时对原图元素的保留更精准。适合需要专业品质的场景。GPT-Image-1 适合通用图像生成，价格更低。
  </Accordion>

  <Accordion title="生成的图像可以商用吗？">
    是的，通过 API 生成的图像您拥有完整的使用权，可以用于商业用途。
  </Accordion>

  <Accordion title="支持中文提示词吗？">
    支持，但建议使用英文提示词以获得最佳效果。对于需要生成中文文字的场景，GPT-Image-1.5 的文字渲染能力更强。
  </Accordion>

  <Accordion title="如何从 GPT-Image-1 迁移到 1.5？">
    只需将 `model` 参数从 `gpt-image-1` 改为 `gpt-image-1.5`，其他参数完全兼容，无需修改代码。
  </Accordion>
</AccordionGroup>

## 相关资源

<CardGroup cols={2}>
  <Card title="Sora Image 生图" icon="wand-sparkles" href="/api-capabilities/sora-image-generation">
    逆向技术生图，\$0.01/张超低价
  </Card>

  <Card title="Nano Banana Pro" icon="banana" href="/api-capabilities/nano-banana-image">
    4K 高清，业界最佳文本渲染，\$0.09/张
  </Card>
</CardGroup>
