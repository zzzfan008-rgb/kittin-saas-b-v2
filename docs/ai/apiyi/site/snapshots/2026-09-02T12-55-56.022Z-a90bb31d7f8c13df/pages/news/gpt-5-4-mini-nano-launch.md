> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-5.4 Mini & Nano 上线：轻量高性价比，为规模化场景而生

> OpenAI 于 2026 年 3 月 17 日发布 GPT-5.4 Mini 和 Nano，Mini 速度比 GPT-5 Mini 快 2 倍以上，Nano 仅需 $0.20/百万输入 tokens。API易已全面上架，定价与官网一致，官转 API 充值约 9 折起。

## 核心要点

* **最强小模型**：GPT-5.4 Mini 在编码、推理、多模态理解和工具调用全面超越 GPT-5 Mini，速度快 2 倍以上
* **极致性价比**：GPT-5.4 Nano 输入仅 \$0.20/百万 tokens，输出 \$1.25/百万 tokens，OpenAI 最便宜的 5.4 系列模型
* **接近旗舰水准**：Mini 在 SWE-Bench Pro（54.4%）和 OSWorld-Verified（72.1%）上接近 GPT-5.4 全尺寸版本
* **40 万上下文**：与 GPT-5 家族一致的 400K context window
* **全能力支持**：文本、图像输入、工具调用、网页搜索、计算机使用能力一应俱全

## 背景介绍

2026 年 3 月 17 日，OpenAI 正式发布 GPT-5.4 Mini 和 GPT-5.4 Nano，官方称其为「迄今最强大的小模型」。这是继 3 月初 GPT-5.4 旗舰系列发布后，OpenAI 将 5.4 系列能力下沉到轻量级模型的重要举措。

GPT-5.4 Mini 面向需要高性能但预算有限的开发者，在保持接近旗舰水准的同时大幅降低成本；GPT-5.4 Nano 则专为高吞吐量、低成本场景设计，适合分类、数据提取、排序和编码子代理等任务。

API易已在第一时间上架两款模型，定价与 OpenAI 官网完全一致，官转 API 通道稳定可靠，充值加赠约 9 折起。

## 详细解析

### 核心特性

<CardGroup cols={2}>
  <Card title="速度翻倍" icon="bolt">
    GPT-5.4 Mini 比 GPT-5 Mini 快 2 倍以上，延迟大幅降低
  </Card>

  <Card title="极致低价" icon="coins">
    Nano 输入仅 \$0.20/百万 tokens，76000 张图片描述仅需约 \$52
  </Card>

  <Card title="接近旗舰" icon="chart-line">
    Mini SWE-Bench Pro 54.4%（GPT-5.4 为 57.7%），差距极小
  </Card>

  <Card title="全能力覆盖" icon="layers">
    图像理解、工具调用、网页搜索、计算机使用全部支持
  </Card>
</CardGroup>

### GPT-5.4 Mini 性能亮点

GPT-5.4 Mini 在多个权威评测中全面碾压前代 GPT-5 Mini：

| 评测项目                   | GPT-5.4 Mini | GPT-5.4（旗舰） | GPT-5 Mini | 说明       |
| ---------------------- | ------------ | ----------- | ---------- | -------- |
| **SWE-Bench Pro**      | **54.4%**    | 57.7%       | 45.7%      | 真实软件工程任务 |
| **OSWorld-Verified**   | **72.1%**    | 75.0%       | 42.0%      | 计算机使用基准  |
| **Toolathlon**         | **42.9%**    | —           | 26.9%      | 工具调用评测   |
| **GPQA Diamond**       | **88.0%**    | —           | 81.6%      | 研究级科学推理  |
| **Tau2-Bench**         | **93.4%**    | —           | 74.1%      | 工具调用基准   |
| **MCP Atlas**          | **57.7%**    | —           | 47.6%      | MCP 协议评测 |
| **Terminal-Bench 2.0** | **60.0%**    | —           | —          | 终端操作评测   |

<Info>
  GPT-5.4 Mini 在 OSWorld-Verified 上达到 72.1%，相比 GPT-5 Mini 的 42.0% 提升了 71.7%，接近旗舰 GPT-5.4 的 75.0%。
</Info>

### GPT-5.4 Nano 性能定位

Nano 是 GPT-5.4 系列中最小、最便宜的版本，专为速度和成本优先的场景设计：

| 评测项目                   | GPT-5.4 Nano | GPT-5.4 Mini |
| ---------------------- | ------------ | ------------ |
| **Terminal-Bench 2.0** | 46.3%        | 60.0%        |
| **OSWorld-Verified**   | 39.0%        | 72.1%        |

<Tip>
  OpenAI 官方推荐 Nano 用于分类、数据提取、排序以及编码子代理中处理简单辅助任务的场景。
</Tip>

### 推理能力可调

两款模型均支持可变推理力度设置，开发者可根据任务复杂度灵活调整：

* `none`：无推理，最快响应
* `low` / `medium` / `high`：递增推理深度
* `xhigh`：最大推理力度

<Info>
  值得关注的是，GPT-5.4 Nano 在最大推理力度下的表现已超过前代 GPT-5 Mini，以极低成本实现了上一代中端模型的能力。
</Info>

## 实际应用

### 推荐场景

**GPT-5.4 Mini 适合：**

1. **编程助手**：SWE-Bench Pro 54.4%，适合代码生成、审查和调试
2. **自主代理**：OSWorld 72.1%，支持计算机使用和多步骤工作流
3. **日常对话**：ChatGPT 免费版和 Go 版用户的默认思考模型
4. **OpenClaw 等场景**：高性能低成本，适合批量智能任务处理

**GPT-5.4 Nano 适合：**

1. **数据处理流水线**：分类、提取、排序等高吞吐量任务
2. **编码子代理**：处理简单辅助任务，作为代理架构中的执行层
3. **批量图像理解**：76000 张图片描述仅需约 \$52
4. **实时分类系统**：极低延迟，极低成本

### 代码示例

#### 使用 GPT-5.4 Mini

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

# GPT-5.4 Mini - 高性价比编程助手
response = client.chat.completions.create(
    model="gpt-5.4-mini",
    messages=[
        {
            "role": "user",
            "content": "帮我重构这段代码，提取公共逻辑并添加错误处理..."
        }
    ],
    max_tokens=4096
)

print(response.choices[0].message.content)
```

#### 使用 GPT-5.4 Nano 批量处理

```python theme={null}
# GPT-5.4 Nano - 极致性价比批量任务
response = client.chat.completions.create(
    model="gpt-5.4-nano",
    messages=[
        {
            "role": "system",
            "content": "你是一个文本分类器，将用户输入分类为：正面、负面、中性。只输出分类结果。"
        },
        {
            "role": "user",
            "content": "这个产品质量非常好，下次还会购买！"
        }
    ],
    max_tokens=10
)

print(response.choices[0].message.content)
```

## 价格与可用性

### 定价信息

| 计费项      | GPT-5.4 Nano       | GPT-5.4 Mini        | GPT-5.4（旗舰）         |
| -------- | ------------------ | ------------------- | ------------------- |
| **输入**   | \$0.20 / 百万 tokens | \$0.75 / 百万 tokens  | \$2.50 / 百万 tokens  |
| **缓存输入** | \$0.02 / 百万 tokens | \$0.075 / 百万 tokens | —                   |
| **输出**   | \$1.25 / 百万 tokens | \$4.50 / 百万 tokens  | \$15.00 / 百万 tokens |

<Info>
  GPT-5.4 Mini 成本仅为旗舰 GPT-5.4 的 30%，而性能接近旗舰水准。Nano 更是仅为旗舰的 8%，极致性价比。
</Info>

**与同级别竞品对比**：

| 模型                    | 输入价格       | 输出价格       | 定位    |
| --------------------- | ---------- | ---------- | ----- |
| **GPT-5.4 Nano**      | **\$0.20** | **\$1.25** | 极致轻量  |
| **GPT-5.4 Mini**      | **\$0.75** | **\$4.50** | 高性价比  |
| Gemini 3.1 Flash Lite | \$0.25     | \$0.50     | 轻量快速  |
| Claude Haiku 4.5      | \$0.80     | \$4.00     | 快速响应  |
| GPT-5.2 mini          | \$0.30     | \$1.80     | 前代小模型 |

### 优惠活动

<Card title="查看最新充值优惠政策" icon="gift" href="/faq/recharge-promotions">
  API易 提供充值加赠优惠，官转 API 充值约 9 折起。定价与官网一致，通过充值优惠实现折扣，实际使用成本更低。
</Card>

### 可用模型

| 模型名称           | 版本   | 上下文  | 说明           |
| -------------- | ---- | ---- | ------------ |
| `gpt-5.4-mini` | Mini | 400K | 高性价比，接近旗舰水准  |
| `gpt-5.4-nano` | Nano | 400K | 极致低成本，高吞吐量场景 |

### 购买渠道

**API易平台**：

* 官网：`apiyi.com`
* API 端点：`https://api.apiyi.com/v1`
* 支持 OpenAI 原生格式，兼容所有 OpenAI SDK
* 官转 API 通道，稳定可靠

## 总结与建议

GPT-5.4 Mini 和 Nano 的发布，让 GPT-5.4 系列的强大能力以极低成本触达更多开发者和应用场景。

**核心优势**：

* **Mini**：旗舰级能力，30% 的价格，2 倍速度
* **Nano**：极致低价，8% 的旗舰成本，适合规模化部署

**选型建议**：

1. **需要接近旗舰性能**：选 GPT-5.4 Mini，SWE-Bench Pro 54.4%，OSWorld 72.1%
2. **高吞吐量批处理**：选 GPT-5.4 Nano，\$0.20/百万输入 tokens
3. **代理架构子任务**：Nano 作为执行层，Mini 作为决策层
4. **OpenClaw 等场景**：Mini 和 Nano 均适用，按需选择性价比最优方案
5. **成本不敏感的专业任务**：仍推荐 GPT-5.4 旗舰或 Pro

API易已全面上架 GPT-5.4 Mini 和 Nano，定价与官网一致，官转 API 充值约 9 折起，立即体验 OpenAI 最强轻量级模型！

<Info>
  信息来源：OpenAI 官方博客（2026 年 3 月 17 日）、9to5Mac、The New Stack、Simon Willison's Weblog 等权威媒体报道。数据获取时间：2026 年 3 月 18 日。
</Info>
