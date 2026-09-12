> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.1 Flash Lite Preview：谷歌最新轻量级模型，代理任务与低延迟场景首选

> 谷歌发布 Gemini 3.1 Flash Lite Preview，专为高吞吐量代理任务和低延迟场景优化。支持 100 万上下文、多模态输入，API易官方直连通道同步上线。

## 核心要点

* **全新轻量级模型**：Gemini 3.1 Flash Lite Preview 是谷歌 Gemini 3.1 系列中最轻量、最快速的模型变体
* **代理任务优化**：专为高吞吐量代理任务、简单数据提取、极低延迟应用场景设计
* **超大上下文**：支持 1,048,576 tokens（100 万+）上下文窗口，65,536 tokens 最大输出
* **全模态输入**：支持文本、图像、视频、音频、PDF 五种输入模态
* **官方直连**：API易通过官转通道接入，定价与官网一致，稳定可靠

## 背景介绍

随着 AI Agent（智能代理）应用的爆发式增长，开发者对轻量级、低延迟、高吞吐的模型需求日益增强。大量代理任务场景——如工具调用、数据提取、路由分发、简单分类——并不需要最强大的推理能力，而是需要快速响应和低成本。

谷歌推出的 **Gemini 3.1 Flash Lite Preview** 正是为此而生。作为 Gemini 3.1 系列的轻量级变体，它在保持强大多模态能力的同时，大幅降低了延迟和成本，成为代理任务流水线中的理想选择。

API易已通过官方直连（官转）通道同步接入该模型，定价与谷歌官网完全一致，为开发者提供稳定可靠的调用体验。

## 详细解析

### 核心特性

<CardGroup cols={2}>
  <Card title="代理任务优化" icon="bot">
    * 专为 Agent 工作流设计
    * 极低延迟响应
    * 高吞吐量并发支持
  </Card>

  <Card title="全模态输入" icon="layers">
    * 文本、图像、视频、音频、PDF
    * 100 万+ tokens 上下文窗口
    * 65K tokens 最大输出
  </Card>

  <Card title="丰富能力" icon="wand-sparkles">
    * 函数调用 (Function Calling)
    * 代码执行 (Code Execution)
    * 结构化输出 (Structured Output)
    * 搜索 Grounding
  </Card>

  <Card title="企业级特性" icon="building">
    * Batch API 批量处理
    * 上下文缓存 (Caching)
    * 思维链输出
    * 文件搜索 & URL 上下文
  </Card>
</CardGroup>

### 技术规格

| 规格项   | 参数                              |
| ----- | ------------------------------- |
| 模型名称  | `gemini-3.1-flash-lite-preview` |
| 上下文窗口 | 1,048,576 tokens (1M+)          |
| 最大输出  | 65,536 tokens (64K)             |
| 输入模态  | 文本、图像、视频、音频、PDF                 |
| 输出模态  | 文本                              |
| 接入渠道  | 官方直连（官转）                        |

### 与前代对比

| 特性           | 3.1 Flash Lite Preview | 2.5 Flash Lite |
| ------------ | ---------------------- | -------------- |
| 上下文窗口        | 1M+ tokens             | 1M tokens      |
| 最大输出         | 64K tokens             | 64K tokens     |
| 函数调用         | ✅                      | ✅              |
| 代码执行         | ✅                      | ✅              |
| 结构化输出        | ✅                      | ✅              |
| 思维链          | ✅                      | ✅              |
| 文件搜索         | ✅                      | ❌              |
| URL 上下文      | ✅                      | ❌              |
| 搜索 Grounding | ✅                      | ❌              |
| 代理任务优化       | ✅                      | ❌              |

Gemini 3.1 Flash Lite Preview 在前代基础上新增了文件搜索、URL 上下文、搜索 Grounding 等能力，更好地服务代理任务场景。

## 实际应用

### 推荐场景

<CardGroup cols={2}>
  <Card title="Agent 工作流" icon="bot">
    * 工具调用与路由分发
    * 多步骤代理编排
    * 轻量级决策节点
  </Card>

  <Card title="数据提取" icon="database">
    * 结构化信息提取
    * 表格/表单解析
    * 批量文档处理
  </Card>

  <Card title="实时分类" icon="tags">
    * 内容分类与标注
    * 意图识别
    * 情感分析
  </Card>

  <Card title="多模态处理" icon="images">
    * 图片/视频内容理解
    * 音频转文字
    * PDF 文档解析
  </Card>
</CardGroup>

### 代码示例

以下是使用 API易 调用 Gemini 3.1 Flash Lite Preview 的 Python 示例：

```python theme={null}
import openai

# 配置 API易 客户端
client = openai.OpenAI(
    api_key="your-apiyi-api-key",  # 替换为您的 API易 密钥
    base_url="https://api.apiyi.com/v1"
)

# 调用 Gemini 3.1 Flash Lite Preview
response = client.chat.completions.create(
    model="gemini-3.1-flash-lite-preview",
    messages=[
        {
            "role": "system",
            "content": "你是一个高效的数据提取助手，从用户提供的文本中提取结构化信息。"
        },
        {
            "role": "user",
            "content": "请从以下文本中提取公司名称、成立时间和主营业务：API易成立于2024年，是一家专注于AI大模型API中转服务的科技公司，支持400+热门AI模型。"
        }
    ],
    max_tokens=1024,
    temperature=0.3,
    response_format={"type": "json_object"}
)

print(response.choices[0].message.content)
```

**函数调用示例**

```python theme={null}
import openai
import json

client = openai.OpenAI(
    api_key="your-apiyi-api-key",
    base_url="https://api.apiyi.com/v1"
)

# 定义工具
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
    model="gemini-3.1-flash-lite-preview",
    messages=[{"role": "user", "content": "北京今天天气怎么样？"}],
    tools=tools,
    tool_choice="auto"
)

print(response.choices[0].message.tool_calls)
```

### 最佳实践

<Info>
  **代理任务优化建议**

  1. **精简提示词**：Flash Lite 对简洁指令响应更好，避免冗长的系统提示
  2. **结构化输出**：使用 `response_format` 获取 JSON 格式输出，便于下游处理
  3. **批量处理**：高吞吐场景使用 Batch API，进一步降低成本
  4. **缓存利用**：对重复上下文启用缓存，减少输入 token 消耗
  5. **温度控制**：数据提取类任务建议 temperature 设置为 0-0.3
</Info>

## 价格与可用性

### API易定价

<Card title="官方直连定价" icon="tag">
  **现已在 API易 上线**

  | 类型   | 价格                 |
  | ---- | ------------------ |
  | 文本输入 | \$0.25 / 百万 tokens |
  | 图片输入 | \$0.25 / 百万 tokens |
  | 视频输入 | \$0.25 / 百万 tokens |
  | 输出   | \$1.50 / 百万 tokens |

  * 官方直连（官转）通道
  * 定价与谷歌官网一致
  * 支持充值加赠优惠
</Card>

<Warning>
  **重要提醒**

  * 当前为 Preview 预览版，API 接口可能会有调整
  * 建议在非关键业务中先行测试
  * 关注 API易 公告获取后续更新信息
</Warning>

### 购买渠道

1. 访问 API易 官网：`apiyi.com`
2. 注册并充值（支持多种支付方式）
3. 在控制台获取 API Key
4. 使用 OpenAI SDK 格式调用（base\_url 设置为 `https://api.apiyi.com/v1`）

## 总结与建议

Gemini 3.1 Flash Lite Preview 是谷歌为代理任务和低延迟场景量身打造的轻量级模型：**超低成本**（输入 \$0.25/M）、**极速响应**、**全模态输入**（文本/图像/视频/音频/PDF）、**丰富能力**（函数调用/结构化输出/搜索 Grounding），是构建 AI Agent 工作流的理想基础组件。

**我们的建议**

* **Agent 开发者**：优先用于工具调用、路由分发、简单分类等轻量级节点
* **数据处理团队**：适合批量文档解析、信息提取、内容分类
* **成本敏感场景**：以极低成本获得 Gemini 3.1 系列的多模态能力

<Info>
  **信息来源与更新日期**

  * 来源：Google AI 官方文档
  * 模型标识符：`gemini-3.1-flash-lite-preview`
  * 数据获取时间：2026年3月5日
</Info>

**立即开始使用**

访问 API易 官网，获取 API Key，开始您的 Gemini 3.1 Flash Lite Preview 之旅！
