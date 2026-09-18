> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-1.5 图像生成 API

> OpenAI 最新图像生成旗舰模型，速度快 4 倍，文字渲染能力领先，LMArena 排行榜第一。

GPT-Image-1.5 是 OpenAI 于 2025 年 12 月发布的最新图像生成旗舰模型，在速度、文字渲染、编辑精度等方面全面超越前代。LMArena Text-to-Image 排行榜 1277 Elo 排名第一。

## 核心特性

<CardGroup cols={2}>
  <Card title="4 倍速度提升" icon="bolt">
    大多数图像在 10 秒内生成完成，比 GPT-Image-1 快 4 倍
  </Card>

  <Card title="极强文字渲染" icon="type">
    支持密集文字、Markdown 表格、小字排版，可直接生成信息图和海报
  </Card>

  <Card title="高精度编辑" icon="square-pen">
    编辑时精准保留原图构图、光影和品牌元素，支持 5 轮以上迭代编辑
  </Card>

  <Card title="排行榜第一" icon="trophy">
    LMArena Text-to-Image 1277 Elo、Design Arena 1344、AA Arena 1272
  </Card>
</CardGroup>

## 与 GPT-Image-1 对比

| 特性              | GPT-Image-1.5        | GPT-Image-1 |
| --------------- | -------------------- | ----------- |
| **生成速度**        | 少于 10 秒（4 倍提升）       | 标准          |
| **文字渲染**        | 极强（密集文字、表格、小字）       | 良好          |
| **编辑精度**        | 高精度保留原图元素            | 标准          |
| **指令遵循**        | 更精准一致                | 标准          |
| **成本**          | 比 GPT-Image-1 低约 20% | 标准价格        |
| **LMArena Elo** | 1277（第一）             | -           |

## 模型定价

### Token 计费

| Token 类型 | 价格                  |
| -------- | ------------------- |
| 输入 Token | \$5.00 / 百万 tokens  |
| 输出 Token | \$10.00 / 百万 tokens |

### 按图片计费

**Low Quality（低质量）**

| 尺寸        | 价格          |
| --------- | ----------- |
| 1024×1024 | \$0.009 / 张 |
| 1024×1536 | \$0.013 / 张 |
| 1536×1024 | \$0.013 / 张 |

**Medium Quality（中等质量）**

| 尺寸        | 价格          |
| --------- | ----------- |
| 1024×1024 | \$0.034 / 张 |
| 1024×1536 | \$0.051 / 张 |
| 1536×1024 | \$0.050 / 张 |

**High Quality（高质量）**

| 尺寸        | 价格          |
| --------- | ----------- |
| 1024×1024 | \$0.133 / 张 |
| 1024×1536 | \$0.200 / 张 |
| 1536×1024 | \$0.200 / 张 |

<Warning>
  系统会自动选择更优惠的计费方式，您无需手动选择。最终费用以实际消耗为准。
</Warning>

## API 调用方式

### 端点地址

```
https://api.apiyi.com/v1/images/generations
```

### 请求示例

<CodeGroup>
  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/images/generations \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{
      "model": "gpt-image-1.5",
      "prompt": "A professional infographic about AI trends in 2026, with charts, icons, and readable text labels",
      "size": "1024x1536",
      "quality": "high",
      "output_format": "png"
    }'
  ```

  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.images.generate(
      model="gpt-image-1.5",
      prompt="A professional infographic about AI trends in 2026, with charts, icons, and readable text labels",
      size="1024x1536",
      quality="high",
      output_format="png"
  )

  print(response.data[0].url)
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const response = await client.images.generate({
    model: 'gpt-image-1.5',
    prompt: 'A professional infographic about AI trends in 2026, with charts, icons, and readable text labels',
    size: '1024x1536',
    quality: 'high',
    output_format: 'png'
  });

  console.log(response.data[0].url);
  ```
</CodeGroup>

## 请求参数

| 参数                   | 类型      | 必填 | 说明                                             |
| -------------------- | ------- | -- | ---------------------------------------------- |
| `model`              | string  | 是  | 模型名称，使用 `gpt-image-1.5`                        |
| `prompt`             | string  | 是  | 图像描述（最长 1000 字符）                               |
| `n`                  | integer | 否  | 生成数量，默认 1，最大 10                                |
| `size`               | string  | 否  | `1024x1024`、`1536x1024`、`1024x1536`、`auto`（默认） |
| `quality`            | string  | 否  | `low`、`medium`、`high`、`auto`（默认）               |
| `output_format`      | string  | 否  | `png`（默认）、`jpeg`、`webp`                        |
| `output_compression` | integer | 否  | 压缩级别（0-100%），仅 JPEG/WebP                       |
| `background`         | string  | 否  | `transparent`、`opaque`、`auto`（默认）              |
| `input_fidelity`     | string  | 否  | 设为 `high` 可在编辑时高保真保留前 5 张输入图像                  |
| `response_format`    | string  | 否  | `url`（默认）或 `b64_json`                          |

## 响应格式

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

## 最佳应用场景

### 信息图和文字排版

GPT-Image-1.5 的文字渲染能力是目前 AI 图像生成模型中最强的，适合：

* 信息图（Infographic）生成
* 产品海报和宣传物料
* 社交媒体图文内容
* 带有数据表格的可视化图表
* 品牌素材（能精准保留 Logo 和品牌元素）

```python theme={null}
{/* 信息图示例 */}
response = client.images.generate(
    model="gpt-image-1.5",
    prompt="Create a clean infographic comparing 3 AI models: GPT-5, Claude 4, Gemini 3. Include performance bars, pricing info, and feature comparison table. Modern flat design, blue and white color scheme.",
    size="1024x1536",
    quality="high"
)
```

### 产品展示和电商素材

```python theme={null}
{/* 产品展示示例 */}
response = client.images.generate(
    model="gpt-image-1.5",
    prompt="Professional product photography of a modern wireless earbuds case on a white marble surface, soft studio lighting, 45-degree angle, clean background",
    size="1024x1024",
    quality="high"
)
```

### 迭代编辑

GPT-Image-1.5 支持多轮精准编辑，能在 5 轮以上迭代中保持构图、光影和品牌元素的一致性。

## 常见问题

<AccordionGroup>
  <Accordion title="GPT-Image-1.5 比 GPT-Image-1 贵吗？">
    按图片计费方式下 GPT-Image-1.5 每张图价格稍高（因 token 单价更高），但速度快 4 倍且质量更好。Token 计费方式下输入 \$5.00/M、输出 \$10.00/M。根据实际生成的 token 量，单张图总成本可能因提示词复杂度而异。
  </Accordion>

  <Accordion title="可以直接从 GPT-Image-1 切换吗？">
    是的，只需将 `model` 参数从 `gpt-image-1` 改为 `gpt-image-1.5`，API 格式和参数完全兼容。
  </Accordion>

  <Accordion title="文字渲染能力有多强？">
    GPT-Image-1.5 可以准确生成密集文字、Markdown 表格、小字排版，适合信息图、海报、品牌素材等需要精准文字的场景。在 LMArena Text-to-Image 和 Design Arena 排行榜均排名第一。
  </Accordion>

  <Accordion title="支持透明背景吗？">
    支持。设置 `background: "transparent"` 并使用 `png` 或 `webp` 格式即可获得透明背景图像。
  </Accordion>

  <Accordion title="图像 URL 有效期多久？">
    生成的图像 URL 通常有效期为 24 小时，建议及时下载保存。
  </Accordion>
</AccordionGroup>

## 相关资源

<CardGroup cols={2}>
  <Card title="GPT-Image 系列总览" icon="palette" href="/api-capabilities/gpt-image-series">
    查看 GPT-Image 系列完整对比和选型指南
  </Card>

  <Card title="GPT-Image-1" icon="image" href="/api-capabilities/gpt-image-1">
    经典图像生成模型，通用场景首选
  </Card>
</CardGroup>

<Info>
  OpenAI 官方文档：`platform.openai.com/docs/models/gpt-image-1.5`
</Info>
