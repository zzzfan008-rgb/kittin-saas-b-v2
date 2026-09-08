> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 2 上线：Pro画质 Flash价格

> 谷歌最新图像生成模型 Nano Banana 2（gemini-3.1-flash-image-preview）正式发布！Pro级画质+Flash级速度，支持4K输出、14种宽高比、图像搜索Grounding，API易按次 $0.055/次，按量低至 $0.025/张。

## 核心要点

* **Pro 级画质 + Flash 级速度**：画质媲美 Nano Banana Pro，生成速度快数倍
* **超低价格**：API易按次 \$0.055/次，按量低至 \$0.025/张，性价比极高
* **14 种宽高比**：新增 1:4、4:1、1:8、8:1，覆盖长图、信息图等特殊场景
* **图像搜索 Grounding**：独家功能，从 Google 图片搜索拉取视觉上下文
* **思维模式**：可配置推理级别，处理复杂提示词更精准

## 背景介绍

2026 年 2 月 26 日，谷歌正式发布了 **Nano Banana 2**（模型 ID：`gemini-3.1-flash-image-preview`），这是 Nano Banana 系列的最新旗舰。不同于基于 Gemini 3 Pro 的 Nano Banana Pro，Nano Banana 2 基于 **Gemini 3.1 Flash**，在保持接近 Pro 级画质的同时，大幅提升了生成速度并降低了成本。

这意味着用户不再需要在"画质"和"价格"之间艰难取舍——Nano Banana 2 同时做到了两者兼顾。

## 详细解析

### 新增模型

<Card title="gemini-3.1-flash-image-preview" icon="banana">
  **Nano Banana 2 图像生成**

  基于 Gemini 3.1 Flash 的图像生成模型，Pro 级画质、Flash 级速度。支持 4K 输出、14 种宽高比、图像搜索 Grounding、思维模式等特性。
</Card>

### 与前代版本对比

| 特性                 | **Nano Banana 2**                | Nano Banana Pro              | Nano Banana              |
| ------------------ | -------------------------------- | ---------------------------- | ------------------------ |
| **模型 ID**          | `gemini-3.1-flash-image-preview` | `gemini-3-pro-image-preview` | `gemini-2.5-flash-image` |
| **画质**             | ⭐⭐⭐⭐⭐ Pro 级                      | ⭐⭐⭐⭐⭐ 最高                     | ⭐⭐⭐⭐ 优秀                  |
| **速度**             | 🚀 最快                            | 🐢 较慢（约20秒）                  | ⚡ 快速（约10秒）               |
| **最高分辨率**          | 4K                               | 4K                           | 1K                       |
| **宽高比**            | 14 种                             | 10 种                         | 10 种                     |
| **图像搜索 Grounding** | ✅ 独家                             | ❌                            | ❌                        |
| **思维模式**           | ✅                                | ❌                            | ❌                        |
| **谷歌官方 4K 定价**     | \$0.151                          | \$0.151                      | \$0.039（仅1K）             |
| **API易定价**         | **\$0.055（按次）/ \~\$0.025起（按量）**  | \$0.09                       | \$0.02                   |

<Tip>
  **关键数据**：谷歌官方 4K 定价 \$0.151/次，API易 Nano Banana 2 按次仅需 **\$0.055/次**（约 3.6 折），按量计费低至 **\~\$0.025/张**（512px），性价比极高！
</Tip>

### 独家新特性

#### 🔍 图像搜索 Grounding

这是 Nano Banana 2 的独家功能。通过接入 Google 图片搜索，模型可以：

* 参考真实世界的视觉素材生成更准确的图像
* 生成真实地标、人物、产品等更贴合现实
* 结合实时数据生成天气图表、事件海报等

```python theme={null}
import requests

response = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent",
    headers={"Authorization": "Bearer sk-your-api-key", "Content-Type": "application/json"},
    json={
        "contents": [{"parts": [{"text": "今天上海外滩的实景插画风格图"}]}],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"],
            "imageConfig": {"aspectRatio": "16:9", "imageSize": "2K"}
        },
        "tools": [{"google_search": {}}]
    },
    timeout=300
).json()
```

#### 🧠 思维模式

可配置 `minimal` 或 `high` 两种思维级别，让模型在生成前进行推理分析：

* **minimal**：快速生成，适合简单提示词
* **high**：深度推理，适合复杂构图、精确文字、多元素场景

```python theme={null}
response = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent",
    headers={"Authorization": "Bearer sk-your-api-key", "Content-Type": "application/json"},
    json={
        "contents": [{"parts": [{"text": "设计一张科技公司年度报告封面，包含文字'2026 Annual Report'，深蓝渐变背景，数据可视化元素"}]}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": "3:4", "imageSize": "4K"},
            "thinkingConfig": {"thinkingLevel": "high", "includeThoughts": True}
        }
    },
    timeout=300
).json()
```

#### 📐 14 种宽高比

新增 4 种超长/超宽比例：

| 新增比例  | 适用场景           |
| ----- | -------------- |
| `1:4` | 超长竖图、手机长图      |
| `4:1` | 超宽横幅、网站 Banner |
| `1:8` | 极长竖图、信息图       |
| `8:1` | 极宽横幅、全景图       |

完整支持的宽高比：`1:1`、`1:4`、`4:1`、`1:8`、`8:1`、`2:3`、`3:2`、`3:4`、`4:3`、`4:5`、`5:4`、`9:16`、`16:9`、`21:9`

### 其他亮点

<CardGroup cols={2}>
  <Card title="精准文字渲染" icon="type">
    继承 Nano Banana Pro 的文字渲染能力，支持多语言清晰文字。适合海报、广告、品牌素材等包含文字的场景。
  </Card>

  <Card title="多轮对话编辑" icon="message-circle">
    支持通过多轮对话逐步编辑图像。上传原图后，可以通过对话指令进行背景虚化、物体移除、风格转换等操作。
  </Card>

  <Card title="主体一致性" icon="users">
    最多保持 5 个角色的相貌一致性和 14 个参考物体的高保真度，适合系列素材和角色 IP 创作。
  </Card>

  <Card title="批量 API" icon="layers">
    支持 Batch API（24 小时内完成），享受更高的速率限制，适合大批量图像生成任务。
  </Card>
</CardGroup>

## 实际应用

### 快速开始

#### 谷歌原生格式（推荐）

```python theme={null}
import requests
import base64

API_KEY = "sk-your-api-key"

response = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "contents": [{"parts": [{"text": "一只可爱的柴犬坐在樱花树下，水彩画风格"}]}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": "16:9", "imageSize": "2K"}
        }
    },
    timeout=300
).json()

img_data = response["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
with open("output.png", 'wb') as f:
    f.write(base64.b64decode(img_data))
print("图片已保存")
```

#### OpenAI 兼容模式

```python theme={null}
from openai import OpenAI

client = OpenAI(api_key="sk-your-api-key", base_url="https://api.apiyi.com/v1")

response = client.chat.completions.create(
    model="gemini-3.1-flash-image-preview",
    stream=False,
    messages=[{"role": "user", "content": "一幅秋天的山水画，远处有红叶和飞鸟"}]
)

print(response.choices[0].message.content)
```

<Warning>
  OpenAI 兼容模式使用 `/v1/chat/completions` 端点，不是 `/v1/images/generations`。
</Warning>

### 从 Nano Banana Pro 迁移

只需更改模型名称即可：

```python theme={null}
# Nano Banana Pro（旧）
model = "gemini-3-pro-image-preview"

# Nano Banana 2（新）- 更便宜、更快
model = "gemini-3.1-flash-image-preview"

# 其他参数保持不变
```

## 价格与可用性

### 定价对比

| 模型                | API易定价（按次）    | 谷歌官方 4K 定价   | 节省幅度           |
| ----------------- | ------------- | ------------ | -------------- |
| **Nano Banana 2** | **\$0.055/次** | \$0.151      | **🔥 约 3.6 折** |
| Nano Banana Pro   | \$0.09/次      | \$0.151      | 约 6 折          |
| Nano Banana       | \$0.02/次      | \$0.039（仅1K） | 约 6.4 折        |

<Note>
  Nano Banana（`gemini-2.5-flash-image`）最高仅支持 2K，无 4K 选项，表中为其 1K 官方定价。
</Note>

### 按量计费（Nano Banana 2 专属）

| 计费项目        | Google 官方             | API易            | 官网折扣    |
| ----------- | --------------------- | --------------- | ------- |
| Input       | \$0.50/M tokens       | \$0.14/M tokens | **28%** |
| Output（统一价） | 图片 \$60/M, 文本 \$1.5/M | \$16.8/M tokens | **28%** |

#### 按量计费价格预估

| 分辨率   | Google 官方 | API易          |
| ----- | --------- | ------------- |
| 512px | \$0.045   | **\~\$0.025** |
| 1K    | \$0.067   | **\~\$0.035** |
| 2K    | \$0.101   | **\~\$0.045** |
| 4K    | \$0.151   | **\~\$0.07**  |

<Info>
  **计费模式选择**：通过创建令牌时的「Billing model」设置选择：

  * **Pay-as-you-go / Pay-as-you-go Priority** → 按量计费
  * **Pay-per-request / Pay-per-request Priority** → 按次计费
  * ⚠️ 请勿选择 Hybrid billing（混合计费）
</Info>

<Info>
  **💰 4K 高清超值！** 谷歌官方 4K 定价高达 \$0.151/次，API易按次仅需 \$0.055/次（约 3.6 折），按量计费低至 \~\$0.07/张（4K）。结合充值加赠活动，实际成本更低。
</Info>

### 谷歌官方分辨率定价参考

| 分辨率    | 谷歌官方价格  |
| ------ | ------- |
| 512px  | \$0.045 |
| 1K（默认） | \$0.067 |
| 2K     | \$0.101 |
| 4K     | \$0.151 |

### 可用渠道

* ✅ **API易**（稳定直连，第一时间上线）⭐ 推荐
* ✅ **Gemini 应用**（网页端和移动端，已设为默认图像模型）
* ✅ **Google AI Studio**（标记为"New"）
* ✅ **Vertex AI**（Preview 访问）

## 总结与建议

Nano Banana 2 重新定义了图像生成的性价比——**Pro 级画质、Flash 级速度、超低价格**。对于绝大多数用户来说，它是取代 Nano Banana Pro 的最佳选择。

### 💡 谁应该使用？

* **所有图像生成用户**：画质接近 Pro，按量计费低至 \$0.025/张，性价比极高
* **需要特殊宽高比**：14 种宽高比覆盖更多场景
* **需要实时数据**：图像搜索 Grounding 可结合搜索结果生成图像
* **复杂提示词用户**：思维模式让复杂场景生成更精准

### 🎯 版本选择建议

* 🔥 **首选 Nano Banana 2**：性价比之王，按量低至 \$0.025/张，适合 90% 的场景
* 🎨 **极致画质选 Nano Banana Pro**：对保真度有极致要求的专业场景
* ⚡ **最低成本选 Nano Banana**：\$0.025/次，适合大批量低成本需求

***

<Info>
  **信息来源**：

  * 谷歌官方博客：Nano Banana 2 发布公告 `blog.google/innovation-and-ai/technology/ai/nano-banana-2/`
  * 谷歌开发者博客：`blog.google/innovation-and-ai/technology/developers-tools/build-with-nano-banana-2/`
  * 谷歌 AI 开发者文档：`ai.google.dev/gemini-api/docs/image-generation`
  * 谷歌 API 定价：`ai.google.dev/gemini-api/docs/pricing`
  * 数据获取日期：2026年2月27日
</Info>
