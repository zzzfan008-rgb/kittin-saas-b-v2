> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3 Pro Preview 正式发布：LMArena 全球第一

> 谷歌最新多模态智能模型 Gemini 3 Pro Preview 震撼上线！LMArena 排行榜 1501 Elo 全球第一，SWE-bench Verified 76.2%，支持 100 万上下文和思维链输出。API易第一时间接入，充值加赠可达 8 折优惠。

## 核心要点

* **全球最强**：LMArena 排行榜 1501 Elo 位居全球第一，超越所有竞品
* **代码能力顶尖**：SWE-bench Verified 76.2%，代码生成与修复能力业界领先
* **超大上下文**：100 万 Token 上下文窗口，支持处理超大型代码库和文档
* **思维链输出**：支持显示完整推理过程，提升复杂任务的推理能力
* **价格优势**：与谷歌官网价格一致，充值加赠活动可达 8 折优惠

## 背景介绍

2025年11月18日，谷歌正式发布了 Gemini 3 Pro Preview 多模态智能模型，这是继 Gemini 2.5 系列之后的又一次重大升级。新模型在 LMArena 排行榜上以 1501 Elo 分数位居全球第一，超越了 GPT-5、Claude Opus 4.1 等所有竞品，标志着谷歌在大模型领域重回巅峰。

Gemini 3 Pro Preview 不仅在性能上实现了突破，还引入了多项创新特性，包括可配置的思维层级、更强大的 Agentic 能力，以及业界领先的多模态理解能力。API易第一时间完成接入，为开发者提供稳定、高性价比的 API 服务。

## 详细解析

### 新增模型

API易上线了 Gemini 3 Pro Preview 的两个版本：

<CardGroup cols={2}>
  <Card title="gemini-3-pro-preview" icon="sparkles">
    **自动推理模型**

    根据任务复杂度自动调整推理力度，无需手动配置。适合大多数场景，提供最佳的性能与成本平衡。
  </Card>

  <Card title="gemini-3-pro-preview-thinking" icon="brain">
    **强制思考输出模型**

    显示完整的推理过程，特别适合需要透明推理的场景，如高级编程、数学、科学计算等。
  </Card>
</CardGroup>

### 性能亮点

Gemini 3 Pro Preview 在多项权威评测中取得了业界领先的成绩：

| 评测项目                   | 分数       | 排名      |
| ---------------------- | -------- | ------- |
| **LMArena**            | 1501 Elo | 🏆 全球第一 |
| **SWE-bench Verified** | 76.2%    | 🥇 顶尖水平 |
| **Terminal-Bench 2.0** | 54.2%    | 🥇 业界领先 |
| **多模态理解**              | -        | 🏆 全球最强 |

<Info>
  数据来源：LMArena 官方排行榜（2025年11月18日）、OpenAI SWE-bench 评测（2025年11月）。Gemini 3 Pro Preview 是目前唯一在 LMArena 上突破 1500 Elo 的模型。
</Info>

### 核心特性

#### 🧠 超大上下文窗口

* **100 万 Token 输入**：支持处理超大型代码库、长篇文档、多轮对话历史
* **64K Token 输出**：生成长篇代码、详细文档、深度分析报告无压力
* **应用场景**：企业级文档分析、大型项目代码审查、知识库问答系统

#### 🌟 思维链推理

`gemini-3-pro-preview-thinking` 模型支持显示完整的推理过程：

* **透明推理**：清晰展示模型的思考步骤
* **可控性提升**：通过 `thinking_level` 参数控制推理深度
* **适用场景**：数学证明、逻辑推理、复杂编程任务、科学计算

#### 🎯 多模态理解

* **文本**：长文本理解、多语言翻译、内容创作
* **图像**：图像识别、场景理解、OCR 文字提取
* **视频**：视频内容分析、关键帧提取、动作识别
* **音频**：语音转文字、音频分类、情感分析

#### 🛠️ 工具增强

Gemini 3 Pro Preview 内置多种工具能力：

<CardGroup cols={2}>
  <Card title="Google Search" icon="search">
    内置网络搜索能力，实时获取最新信息
  </Card>

  <Card title="File Search" icon="file-search">
    文件搜索和分析，支持多种文档格式
  </Card>

  <Card title="Code Execution" icon="code">
    代码执行能力，支持 Python、JavaScript 等语言
  </Card>

  <Card title="Function Calling" icon="square-function">
    标准函数调用，轻松集成外部工具和 API
  </Card>
</CardGroup>

## 实际应用

### 推荐场景

<CardGroup cols={2}>
  <Card title="AI 编程助手" icon="code">
    * IDE 集成（Cursor、VS Code）
    * 代码审查和优化建议
    * 自主开发和问题修复
    * 技术文档生成
  </Card>

  <Card title="复杂推理任务" icon="brain">
    * 数学证明和科学计算
    * 逻辑推理和决策分析
    * 策略规划和优化
    * 数据分析和洞察
  </Card>

  <Card title="多模态应用" icon="images">
    * 图像内容理解和描述
    * 视频分析和摘要
    * OCR 和文档解析
    * 跨模态内容生成
  </Card>

  <Card title="智能体开发" icon="bot">
    * Agentic Workflows
    * 自主任务执行
    * 工具调用和集成
    * 长期记忆和上下文管理
  </Card>
</CardGroup>

### 代码示例

#### OpenAI 兼容模式调用

```python theme={null}
import openai

client = openai.OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# 基础对话
response = client.chat.completions.create(
    model="gemini-3-pro-preview",
    messages=[
        {"role": "user", "content": "解释一下量子纠缠的原理"}
    ]
)
print(response.choices[0].message.content)

# 思维链模式
response = client.chat.completions.create(
    model="gemini-3-pro-preview-thinking",
    messages=[
        {"role": "user", "content": "证明：对于任意正整数 n，1+2+3+...+n = n(n+1)/2"}
    ]
)
print(response.choices[0].message.content)
```

#### 多模态理解

```python theme={null}
# 图像理解
response = client.chat.completions.create(
    model="gemini-3-pro-preview",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "这张图片中有什么？"},
                {
                    "type": "image_url",
                    "image_url": {"url": "https://example.com/image.jpg"}
                }
            ]
        }
    ]
)
```

#### 函数调用

```python theme={null}
# 函数调用示例
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "获取指定城市的天气信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "城市名称"}
                },
                "required": ["city"]
            }
        }
    }
]

response = client.chat.completions.create(
    model="gemini-3-pro-preview",
    messages=[{"role": "user", "content": "北京今天天气怎么样？"}],
    tools=tools
)
```

### 最佳实践

#### 1. 上下文管理

* **长对话优化**：利用 100 万 Token 上下文，保留完整对话历史
* **文档分析**：一次性输入整个代码库或文档集合，无需分段处理
* **结构化输入**：使用 XML 标签或 Markdown 结构化长文本

#### 2. 思维链使用

* **复杂任务**：使用 `gemini-3-pro-preview-thinking` 获取推理过程
* **调试优化**：通过思维链输出理解模型决策逻辑
* **教学场景**：展示解题步骤，帮助用户理解推理过程

#### 3. 多模态集成

* **图文结合**：在 prompt 中混合文本和图像，实现更丰富的交互
* **视频分析**：将视频拆分为关键帧，逐帧分析内容
* **文档解析**：结合 OCR 和语义理解，提取结构化信息

## 价格与可用性

### 定价信息

Gemini 3 Pro Preview 的定价与谷歌官网保持一致：

| 计费项          | 价格                  | 说明               |
| ------------ | ------------------- | ---------------- |
| **输入 Token** | \$2.00 / 百万 tokens  | 200K tokens 以内提示 |
| **输出 Token** | \$12.00 / 百万 tokens | 所有输出 tokens      |
| **缓存输入**     | \$0.20 / 百万 tokens  | 提示缓存（如支持）        |

<Info>
  **价格优势**：API易充值加赠活动进行中，实际可达 **8 折优惠**！相比官网价格，输入成本低至 \$1.6/百万 tokens，输出成本低至 \$9.6/百万 tokens。
</Info>

### 调用方式

Gemini 3 Pro Preview 支持两种调用方式：

<CardGroup cols={2}>
  <Card title="OpenAI 兼容模式" icon="code">
    **推荐方式**

    使用 OpenAI SDK，只需更改 `base_url` 和 `model` 参数，无需修改其他代码。
  </Card>

  <Card title="谷歌原生格式" icon="google">
    **完整功能**

    支持 Vertex AI API 格式，使用谷歌官方 SDK 调用，获取完整特性支持。
  </Card>
</CardGroup>

### 可用渠道

* ✅ **Google AI Studio**（免费交互使用，有速率限制）
* ✅ **Vertex AI**（企业版）
* ✅ **GitHub Copilot**（Pro/Business/Enterprise）
* ✅ **Gemini CLI**（命令行工具）
* ✅ **API易**（稳定直连，充值享 8 折优惠）⭐ 推荐

## 总结与建议

Gemini 3 Pro Preview 是谷歌迄今为止最强大的多模态智能模型，在性能、能力和灵活性上都实现了显著提升。以下是我们的使用建议：

### 💡 谁应该使用？

* **开发者**：需要强大代码生成和调试能力的编程场景
* **研究人员**：需要复杂推理和科学计算的研究任务
* **企业用户**：需要处理大量文档和数据的业务场景
* **产品团队**：需要构建智能助手和 Agentic 应用的产品开发

### 🎯 选择建议

* **通用场景**：使用 `gemini-3-pro-preview`，自动推理更高效
* **需要透明推理**：使用 `gemini-3-pro-preview-thinking`，了解决策过程
* **长上下文任务**：充分利用 100 万 Token 上下文窗口
* **多模态应用**：结合文本、图像、视频实现丰富交互

### 📊 性价比分析

相比竞品：

* **vs GPT-5**：性能更强（1501 vs 1485 Elo），价格相当
* **vs Claude Opus 4.1**：推理能力更强，价格更低
* **vs DeepSeek V3**：性能显著领先，价格略高但物有所值

<Warning>
  **速率限制**：免费渠道（Google AI Studio）有速率限制，生产环境建议使用 API易 等付费服务，确保稳定性和可用性。
</Warning>

## 立即开始

准备好体验 Gemini 3 Pro Preview 了吗？

1. **注册 API易账号**：[https://api.apiyi.com](https://api.apiyi.com)
2. **充值获取令牌**：享受充值加赠活动，实际可达 8 折优惠
3. **查看 API 文档**：[Gemini API 使用指南](/api-capabilities/gemini/native)
4. **开始调用**：将 `model` 参数改为 `gemini-3-pro-preview` 即可

有任何问题？欢迎加入我们的技术社区交流，或查看 [常见问题](/faq/model-availability) 获取帮助。

***

<Info>
  **信息来源**：

  * 谷歌官方博客：Gemini 3 Pro Preview 发布公告 `blog.google/technology/ai/google-gemini-3-pro-preview/`
  * LMArena 排行榜：`lmarena.ai/leaderboard`
  * SWE-bench 评测：`swebench.com`
  * 数据获取日期：2025年11月20日
</Info>
