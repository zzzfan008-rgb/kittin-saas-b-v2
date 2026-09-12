> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 2 Lite 上线：4 秒出图，按量约官网 4 折

> 谷歌 Nano Banana 2 Lite（gemini-3.1-flash-lite-image）上线，约 4 秒出图、比 Nano Banana 2 快约 2.7 倍，1K 画布 + 14 种宽高比。API易已接入，按量计费约官网 4 折（提示 $0.10 / 输出 $12 每 1M tokens），按次 $0.025 / 次。

## 核心要点

* **香蕉 2 的 Lite 版**：谷歌 6 月 30 日发布 Nano Banana 2 Lite（`gemini-3.1-flash-lite-image`），是 Nano Banana 2（`gemini-3.1-flash-image`）的轻量经济版
* **更快出图**：约 **4 秒**生成一张，较 Nano Banana 2 快约 **2.7 倍**，主打高并发、低成本、快速迭代
* **按量约官网 4 折**：API易按量计费提示 \$0.10 / 输出 \$12 每 1M tokens，约为谷歌官网的 **4 折**（6 折 off）
* **按次 \$0.025 / 次**：折扣前按次计费 \$0.025 / 次，对比官网约 \$0.034 / 张
* **1K 画布 + 14 种宽高比**：专注 1K 分辨率（不支持 2K/4K），覆盖 14 种宽高比，自带 SynthID 隐形水印

<Warning>
  **价格暂定**：模型刚上线，当前售价为暂定价，后续可能调整最终售价。如有变动我们会另行公告，请以平台实时价格为准。
</Warning>

## 背景介绍

2026 年 6 月 30 日，谷歌在更新 Gemini 图像与视频产品线时，推出了 **Nano Banana 2 Lite**（模型 ID：`gemini-3.1-flash-lite-image`）。它是 Nano Banana 2（`gemini-3.1-flash-image`）的轻量版本，定位为谷歌创意模型家族里**最快、最具成本效益**的一档。

与追求画质上限的 Nano Banana Pro、兼顾画质与速度的 Nano Banana 2 不同，Nano Banana 2 Lite 把重心放在**速度与成本**上：约 4 秒即可出图，适合快速创意验证、高吞吐的开发流水线、以及对单张成本敏感的大批量场景。

API易已第一时间接入 `gemini-3.1-flash-lite-image`，支持按量与按次两种计费方式，按量计费约为官网 4 折，欢迎在成本敏感的图像生成场景中使用。

## 详细解析

### 新增模型

<Card title="gemini-3.1-flash-lite-image" icon="banana">
  **Nano Banana 2 Lite 图像生成**

  Nano Banana 2 的轻量经济版，约 4 秒出图、比 Nano Banana 2 快约 2.7 倍。专注 1K 画布，支持 14 种宽高比，自带 SynthID 隐形水印，主打高并发、低成本、快速迭代。
</Card>

### 与同系列对比

| 特性         | **Nano Banana 2 Lite**        | Nano Banana 2            | Nano Banana Pro      |
| ---------- | ----------------------------- | ------------------------ | -------------------- |
| **模型 ID**  | `gemini-3.1-flash-lite-image` | `gemini-3.1-flash-image` | `gemini-3-pro-image` |
| **定位**     | 最快 / 最省                       | 画质速度兼顾                   | 画质上限                 |
| **最高分辨率**  | 1K                            | 4K                       | 4K                   |
| **出图速度**   | 🚀 约 4 秒                      | ⚡ 较快                     | 🐢 较慢                |
| **宽高比**    | 14 种                          | 14 种                     | 10 种                 |
| **API易按量** | **约官网 4 折**                   | 约官网 28%                  | —                    |

<Tip>
  **选型速记**：追求**极致性价比 / 快速批量出图**选 Lite；需要 **2K/4K 高清**或更强画质，选 Nano Banana 2 或 Pro。
</Tip>

### 技术规格

| 参数         | 规格                                             |
| ---------- | ---------------------------------------------- |
| **模型 ID**  | `gemini-3.1-flash-lite-image`                  |
| **分辨率**    | 1K（不支持 2K/4K）                                  |
| **宽高比**    | 14 种（`1:1`、`4:1`、`1:4`、`16:9`、`9:16` 等）        |
| **出图速度**   | 约 4 秒 / 张                                      |
| **水印**     | SynthID 隐形水印                                   |
| **API 格式** | 谷歌原生 / OpenAI 兼容                               |
| **可用渠道**   | Google AI Studio、Gemini API、Vertex / GEAP、API易 |

## 实际应用

### 推荐场景

1. **快速创意验证**：4 秒出图，适合反复试提示词、快速筛选方向
2. **高并发批量生成**：单张成本低，适合规模化素材生产
3. **成本敏感的产品内嵌**：把图像生成嵌入自家应用，控制单张成本
4. **1K 场景够用**：社交配图、缩略图、草稿预览等无需 4K 的用途

### 快速开始

#### 谷歌原生格式（推荐）

```python theme={null}
import requests
import base64

API_KEY = "sk-your-apiyi-key"

response = requests.post(
    "https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent",
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={
        "contents": [{"parts": [{"text": "一只柴犬坐在樱花树下，水彩画风格"}]}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": "16:9", "imageSize": "1K"}
        }
    },
    timeout=300
).json()

img_data = response["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
with open("output.png", "wb") as f:
    f.write(base64.b64decode(img_data))
print("图片已保存")
```

#### OpenAI 兼容模式

```python theme={null}
from openai import OpenAI

client = OpenAI(api_key="sk-your-apiyi-key", base_url="https://api.apiyi.com/v1")

response = client.chat.completions.create(
    model="gemini-3.1-flash-lite-image",
    stream=False,
    messages=[{"role": "user", "content": "一幅秋天的山水画，远处有红叶和飞鸟"}]
)

print(response.choices[0].message.content)
```

### 从 Nano Banana 2 迁移

只需更改模型名称即可，其它参数保持不变（注意 Lite 仅支持 1K）：

```python theme={null}
# Nano Banana 2（4K 可选）
model = "gemini-3.1-flash-image"

# Nano Banana 2 Lite（更快更省，仅 1K）
model = "gemini-3.1-flash-lite-image"
```

## 价格与可用性

### 定价信息

**按量计费（token-based，约官网 4 折）**：

| 计费项        | API易                | 谷歌官方                | 折扣        |
| ---------- | ------------------- | ------------------- | --------- |
| **提示（输入）** | \$0.10 / 1M tokens  | \$0.25 / 1M tokens  | **约 4 折** |
| **补全（输出）** | \$12.00 / 1M tokens | \$30.00 / 1M tokens | **约 4 折** |

**按次计费（per-call）**：

| 计费项        | API易（折扣前）       | 谷歌官方          |
| ---------- | --------------- | ------------- |
| **每张（1K）** | **\$0.025 / 次** | 约 \$0.034 / 张 |

<Info>
  **计费模式选择**：创建令牌时通过「Billing model」设置：

  * **Pay-as-you-go / Pay-as-you-go Priority** → 按量计费
  * **Pay-per-request / Pay-per-request Priority** → 按次计费
  * ⚠️ 请勿选择 Hybrid billing（混合计费）
</Info>

<Warning>
  模型刚上线，当前价格为暂定价，后续可能调整最终售价。如有变动我们会另行公告，请以平台实时价格为准。
</Warning>

### 叠加网站充值活动

可结合 API易 充值加赠活动进一步降低实际成本，详见：`docs.apiyi.com/faq/recharge-promotions`。

### 购买渠道

**API易平台**：

* 官网：`apiyi.com`
* 谷歌原生格式：`https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent`
* OpenAI 兼容格式：`https://api.apiyi.com/v1`
* 模型名：`gemini-3.1-flash-lite-image`

## 总结与建议

Nano Banana 2 Lite 把"快"和"省"做到了新高度：约 4 秒出图、按量计费约官网 4 折，专注 1K 画布，是高并发、低成本、快速迭代场景的理想选择。追求 2K/4K 高清或更强画质时，再切换到 Nano Banana 2 或 Nano Banana Pro。

**核心优势**：

* **更快**：约 4 秒 / 张，较 Nano Banana 2 快约 2.7 倍
* **更省**：按量约官网 4 折，按次 \$0.025 / 次（折扣前）
* **够用**：1K + 14 种宽高比，覆盖多数日常出图需求

<Info>
  **信息来源**：

  * 谷歌官方博客：Nano Banana 2 Lite 发布公告 `blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-omni-flash-nano-banana-2-lite/`
  * 谷歌 API 定价：`ai.google.dev/gemini-api/docs/pricing`
  * Google DeepMind 模型页：`deepmind.google/models/gemini-image/flash-lite/`
  * 数据获取日期：2026 年 7 月 1 日
</Info>
