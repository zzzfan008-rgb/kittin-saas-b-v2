> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.5 Flash 正式上线：Flash 击败 Pro

> 谷歌 Google I/O 2026 发布 Gemini 3.5 Flash 多项指标超越 Gemini 3.1 Pro：Terminal-Bench 2.1 76.2%、MCP Atlas 83.6%、GDPval-AA 1656 Elo，速度比前代前沿模型快约 4 倍，价格仅约一半。API易第一时间接入，叠加充值活动最高 8 折。

## 核心要点

* **Flash 反超 Pro**：Terminal-Bench 2.1 76.2%、MCP Atlas 83.6%、GDPval-AA 1656 Elo，全面超越 Gemini 3.1 Pro
* **4 倍速度**：约 289 tokens/秒，相对其他前沿模型快约 4 倍
* **大约一半成本**：价格约为 Gemini 3.1 Pro 的一半，性价比再上一个台阶
* **百万级上下文**：100 万 Token 输入、64K Token 输出，多模态原生支持
* **Agent 时代默认模型**：谷歌已将其设为 Gemini App 与 AI Mode 默认模型
* **即刻可用**：API易 2026 年 5 月 20 日同步上线，价格与谷歌官网一致，充值加赠最高可达 8 折

## 背景介绍

2026 年 5 月 19 日 (UTC+8)，谷歌在 Google I/O 2026 上正式发布 **Gemini 3.5** 家族，并率先上线 Flash 版本。这是继 Gemini 3.1 Pro（2026 年 2 月发布）之后又一次重大跨越——令人意外的是，谷歌选择从 Flash 起步，而不是按惯例从 Pro 切入。

谷歌官方公开数据显示，Gemini 3.5 Flash 在多个核心基准上**全面超越自家旗舰 Gemini 3.1 Pro**：Terminal-Bench 2.1（76.2% vs 70.3%）、MCP Atlas（83.6% vs 78.2%）、Finance Agent v2（57.9% vs 43.0%）、GDPval-AA（1656 vs 1314 Elo）。同时，速度比同级前沿模型快约 4 倍，价格约为 3.1 Pro 的一半。

谷歌已将 Gemini 3.5 Flash 设为 Gemini App、AI Mode 搜索、Google Antigravity 等多款产品的默认模型，并预告 Gemini 3.5 Pro 将于下月发布。**API易团队第一时间完成接入**，于 2026 年 5 月 20 日正式向所有用户开放调用服务。

## 详细解析

### 核心特性

<CardGroup cols={2}>
  <Card title="🏆 反超 Pro 的智能" icon="trophy">
    Terminal-Bench 2.1 76.2%、MCP Atlas 83.6%、GDPval-AA 1656 Elo，多项指标领先 Gemini 3.1 Pro，特别在工具调用与 Agent 任务中表现突出。
  </Card>

  <Card title="⚡ 4 倍速度" icon="bolt">
    输出速度约 289 tokens/秒，相比其他前沿模型快约 4 倍，是高并发与交互式应用的理想选择。
  </Card>

  <Card title="🧠 原生多模态" icon="brain">
    100 万 Token 输入上下文 + 64K Token 输出，支持文本、图像、音频、视频输入，CharXiv Reasoning 84.2% 业内领先。
  </Card>

  <Card title="💰 一半的价格" icon="dollar-sign">
    价格约为 Gemini 3.1 Pro 的一半，叠加 API易充值活动，长期使用成本进一步降低。
  </Card>
</CardGroup>

### 性能亮点

Gemini 3.5 Flash 在 Agent、编程与多模态推理三大方向同时刷新成绩：

| 评测项目                   | Gemini 3.5 Flash | Gemini 3.1 Pro | 说明                                      |
| ---------------------- | ---------------- | -------------- | --------------------------------------- |
| **Terminal-Bench 2.1** | **76.2%**        | 70.3%          | 终端 Agent 编程能力                           |
| **MCP Atlas**          | **83.6%**        | 78.2%          | 工具/MCP 调用能力（领先 Claude Opus 4.7、GPT-5.5） |
| **Finance Agent v2**   | **57.9%**        | 43.0%          | 金融 Agent 工作流                            |
| **GDPval-AA**          | **1656 Elo**     | 1314           | 通用任务综合 Elo                              |
| **CharXiv Reasoning**  | **84.2%**        | -              | 多模态图表理解领先                               |

<Info>
  数据来源：谷歌官方博客 `blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5/` 及 Google DeepMind 模型卡（2026 年 5 月 19 日发布）。
</Info>

### 技术规格

| 规格项     | Gemini 3.5 Flash                                |
| ------- | ----------------------------------------------- |
| API 模型名 | `gemini-3.5-flash`（无 preview 后缀）                |
| 上下文窗口   | 1,000,000 tokens                                |
| 最大输出    | 64,000 tokens                                   |
| 输入模态    | 文本、图像、音频、视频                                     |
| 输出模态    | 文本                                              |
| 推理能力    | 思维链 + 加密推理上下文（跨调用保留）                            |
| 工具能力    | 结构化输出、多模态函数响应、组合工具调用                            |
| 排除能力    | 不支持 Computer Use（其他 Gemini 3 系列能力均保留）           |
| 可用渠道    | Gemini API、AI Studio、Vertex AI、Antigravity、API易 |

## 实际应用

### 推荐场景

<CardGroup cols={2}>
  <Card title="🤖 智能体与 MCP" icon="bot">
    * 工具调用 / MCP 集成
    * 多步骤自主任务
    * 浏览器/终端类 Agent
    * 函数编排与组合调用
  </Card>

  <Card title="💻 AI 编程助手" icon="code">
    * IDE / Cursor 等编程辅助
    * 终端 Agent 编程
    * 代码生成与修复
    * 大型代码库审查
  </Card>

  <Card title="📊 高并发交互应用" icon="bolt">
    * 实时对话与客服
    * 高 QPS 在线推理
    * 流式输出场景
    * 批量处理任务
  </Card>

  <Card title="🎨 多模态分析" icon="image">
    * 图表/PDF/截图理解
    * 视频内容分析
    * 音频转写与摘要
    * 跨模态内容生成
  </Card>
</CardGroup>

### 代码示例

#### OpenAI 兼容模式

```python theme={null}
import openai

client = openai.OpenAI(
    api_key="your-apiyi-api-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="gemini-3.5-flash",
    messages=[
        {"role": "user", "content": "帮我把以下需求拆解为可执行的 Agent 任务列表..."}
    ],
)
print(response.choices[0].message.content)
```

#### 多模态调用

```python theme={null}
response = client.chat.completions.create(
    model="gemini-3.5-flash",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "请分析这张图表中的核心趋势"},
                {
                    "type": "image_url",
                    "image_url": {"url": "https://example.com/chart.png"}
                }
            ]
        }
    ],
)
```

#### 工具/函数调用（适合 Agent 场景）

```python theme={null}
tools = [
    {
        "type": "function",
        "function": {
            "name": "search_kb",
            "description": "在内部知识库中检索",
            "parameters": {
                "type": "object",
                "properties": {"query": {"type": "string"}},
                "required": ["query"]
            }
        }
    }
]

response = client.chat.completions.create(
    model="gemini-3.5-flash",
    messages=[{"role": "user", "content": "请帮我查询近 30 天的销量分析"}],
    tools=tools,
)
```

### 最佳实践

<Info>
  **使用建议**：

  * Agent / 工具调用类任务优先使用 Gemini 3.5 Flash，性价比远超同类
  * 长上下文任务（>200K tokens）可充分利用 1M 输入窗口
  * 推理上下文会被加密保留，跨调用调用时无需重复传入
  * 不支持 Computer Use，需要桌面操作能力请使用其他 Gemini 3 系列模型
</Info>

<Warning>
  **注意**：

  * 非 global 区域定价略高（约 +10%）
  * 思维链消耗的 tokens 会计入输出，请合理控制
  * 速率限制依账户等级而定，生产环境建议使用 API易
</Warning>

## 价格与可用性

### 定价信息

| 计费项          | 价格                 | 说明           |
| ------------ | ------------------ | ------------ |
| **输入 Token** | \$1.50 / 百万 tokens | 标准 global 区域 |
| **输出 Token** | \$9.00 / 百万 tokens | 包含思维链 tokens |
| **缓存输入**     | \$0.15 / 百万 tokens | 提示缓存命中价      |
| 非 global 区域  | \$1.65 / \$9.90    | 输入 / 输出      |

<Info>
  **价格优势**：API易定价与谷歌官网一致，叠加 [充值加赠活动](/faq/recharge-promotions) 最高可达 **8 折优惠**——相当于输入低至约 \$1.20、输出低至约 \$7.20 / 百万 tokens。
</Info>

### 性价比对比

相比 Gemini 3.1 Pro（输入 \$2.00 / 输出 \$12.00）：

* **价格约为一半**：输入 -25%、输出 -25%（global 区域）
* **性能更强**：Terminal-Bench / MCP Atlas / GDPval-AA 全面反超
* **速度快 4 倍**：高并发场景成本-时延双重优化

### 叠加网站充值活动

详见：[充值加赠活动](/faq/recharge-promotions)

### 可用渠道

* ✅ **Gemini API / AI Studio**（官方）
* ✅ **Vertex AI**（企业版）
* ✅ **Google Antigravity / Gemini App / AI Mode 搜索**（默认模型）
* ✅ **API易**（稳定直连，充值享最高 8 折）⭐ 推荐

## 总结与建议

Gemini 3.5 Flash 的特殊之处，不只是"又一次升级"，而是 Flash 第一次**全方位反超同代 Pro**，并把价格压到约一半、速度提升约 4 倍。这意味着：在 Agent、工具调用、高并发交互场景中，3.5 Flash 是当前几乎没有悬念的最佳选择之一。

### 💡 谁应该立即换用？

* **Agent / MCP 应用开发者**：MCP Atlas 83.6% 业内领先，工具调用更稳更准
* **编程类产品**：Terminal-Bench 2.1 反超 3.1 Pro，且推理成本降一半
* **高并发线上业务**：4 倍速度对吞吐与延迟优化非常显著
* **长上下文场景**：保留 1M 输入窗口，处理整个代码库 / 长文档无压力

### 🎯 选型建议

* **大多数通用场景**：直接使用 `gemini-3.5-flash`
* **需要桌面 Computer Use**：暂时仍需 Gemini 3 Pro / 3.1 Pro
* **极致低成本对话**：可对比 Gemini 2.5 Flash-Lite，但建议在 Agent 任务中以 3.5 Flash 为主

## 立即开始

1. **注册 API易账号**：`api.apiyi.com`
2. **充值获取令牌**：享受充值加赠活动，最高 8 折
3. **查看 API 文档**：[Gemini API 使用指南](/api-capabilities/gemini/native)
4. **开始调用**：将 `model` 参数改为 `gemini-3.5-flash` 即可

***

<Info>
  **信息来源**：

  * 谷歌官方博客（Gemini 3.5 发布）：`blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5/`
  * Google DeepMind 模型卡：`deepmind.google/models/model-cards/gemini-3-5-flash/`
  * Gemini API 定价：`ai.google.dev/gemini-api/docs/pricing`
  * 数据获取日期：2026 年 5 月 20 日
</Info>
