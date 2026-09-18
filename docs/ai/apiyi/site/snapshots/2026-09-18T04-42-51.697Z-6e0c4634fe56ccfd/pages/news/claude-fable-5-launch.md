> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Fable 5 上线：Mythos 级能力，30 天数据保留合规

> Anthropic 旗舰新模型 Claude Fable 5 正式发布，软件工程与视觉理解全面 SOTA。API易已上线 claude-fable-5，定价与官网一致（$10/$50 每百万 tokens）。重要：Fable 5 与 Mythos 5 遵循 30 天输入输出数据保留的合规要求。

## 核心要点

* **Mythos 级旗舰能力**：Claude Fable 5 在几乎所有测试基准上达到 SOTA，软件工程与视觉理解表现尤为突出
* **长任务 + 自我进化**：支持长时间异步执行，可基于学习自更新技能、自建工具链（harness），胜任持续复杂任务
* **强视觉理解**：可读懂文件与 PDF 中的图表、表格、示意图，适合研究与文档密集型工作
* **价格与官网一致**：API易已上线 `claude-fable-5`，输入 \$10 / 输出 \$50 每百万 tokens
* **⚠️ 30 天数据保留合规**：Fable 5 与 Mythos 5 因能力先进，输入与输出将被保留 30 天用于严重滥用检测，请务必阅读下方合规说明

## 背景介绍

2026 年 6 月，Anthropic 正式发布新一代旗舰 Claude Fable 5，并同步推出能力更强、面向少量经审核客户的 Mythos 5。官方将 Fable 5 定位为"知识工作与编程"的下一代智能模型，在几乎所有测试基准上取得 SOTA，软件工程与视觉能力尤为出色。

与以往机型不同，Fable 5 与 Mythos 5 属于 **Mythos 级（Mythos-class）模型**：由于其能力更强、潜在滥用风险更高，Bedrock 与 Anthropic 对这两款模型执行了**额外的高风险滥用检查**，并配套了 **30 天的数据保留合规要求**。这是使用 Fable 5 前必须了解的关键前提。

API易已第一时间上线 `claude-fable-5`，定价与官网完全一致，方便国内开发者直接接入旗舰能力。

## 数据保留与合规说明（重要）

<Warning>
  **Fable 5 与 Mythos 5 适用 30 天数据保留要求**

  随着 Anthropic 发布 Claude Fable 5 和 Mythos 5，由于这些先进模型的能力，Bedrock 和 Anthropic 正在对高风险滥用活动执行额外检查。对于 Fable 5 和 Mythos 5，**输入和输出将被保留 30 天**，以便检测严重滥用行为。

  * **默认访问范围**：保留的数据**仅由自动化安全系统访问**；Anthropic 人工审查**仅在这些系统标记潜在危害时**才会发生。
  * **人工审查范围**：Anthropic 审查人员可能会访问与相关账户关联的输入和输出，但**仅限于完成审查所需的范围**。
  * **跨账户合并审查**：如果来自多个账户的流量因**同一被禁止活动**而被标记，Anthropic 可能会在一次审查中一并审查这些被标记的流量。
</Warning>

<Info>
  **保留主体是 AWS / Anthropic，不是 API易**：上述 30 天数据保留发生在 **AWS Bedrock 与 Anthropic 官方侧**（透传给 Anthropic 用于滥用检测），**API易 自身不保留任何数据，是纯透明代理**，仅做请求转发。此外，**仅 Fable 5 与 Mythos 5 适用此保留要求，其他 Claude 模型（如 Opus 4.8 / Sonnet 4.6 等）均不保留数据。**
</Info>

<Info>
  延伸阅读（请复制到浏览器访问）：

  * Anthropic 关于人工审查与数据保留的说明：`support.claude.com/en/articles/15425996`
  * AWS 官方博客（Fable 5 on AWS）：`aws.amazon.com/blogs/aws/anthropic-claude-fable-5-on-aws-mythos-class-capabilities-with-built-in-safeguards-now-available/`
</Info>

## 详细解析

### 核心特性

<CardGroup cols={2}>
  <Card title="近乎全面 SOTA" icon="trophy">
    在几乎所有测试基准上达到业界领先，软件工程与视觉能力尤为突出
  </Card>

  <Card title="长任务异步执行" icon="clock">
    支持长时间、异步的复杂任务执行，胜任持续运行的 Agent 工作流
  </Card>

  <Card title="自更新技能" icon="wand-sparkles">
    可基于学习自更新技能、自建工具链（harness），减少人工搭建成本
  </Card>

  <Card title="强视觉理解" icon="image">
    读懂文件与 PDF 中的图表、表格、示意图，适合研究与文档密集型场景
  </Card>
</CardGroup>

### 内建安全护栏

Fable 5 内建了安全护栏：当请求涉及**网络安全、生物、化学、健康**等高风险领域的有害提示时，会自动**回退（fallback）至 Claude Opus 4.8** 处理。完全不受限制的 Mythos 5 仅向**少量经过审核的客户**开放。

<Info>
  关于计费：当有害提示触发回退至 Opus 4.8 时，按 **Opus 费率**计费；对于混合 token 的请求，先按 Fable 费率计费，触发回退后的后续 token 按 Opus 费率计费。最终计费以平台实时数据为准。
</Info>

### 技术规格

| 参数         | 规格                             |
| ---------- | ------------------------------ |
| **模型标识**   | `claude-fable-5`               |
| **模型等级**   | Mythos 级（Mythos-class）         |
| **数据保留**   | 输入/输出保留 30 天（滥用检测用途）           |
| **安全回退**   | 高风险领域有害提示回退至 `claude-opus-4-8` |
| **API 格式** | OpenAI 兼容 / Anthropic 原生       |
| **可用渠道**   | Anthropic API、AWS Bedrock、API易 |

## 实际应用

### 推荐场景

1. **复杂软件工程**：仓库级编程、跨文件重构、架构级决策
2. **长链路 Agent 任务**：长时间异步执行、自更新技能的研究/代码代理
3. **文档与视觉密集型工作**：读懂 PDF 图表、表格、示意图的研究分析
4. **高难度推理任务**：充分发挥 Mythos 级旗舰的判断力

### 代码示例

#### OpenAI 格式调用

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="claude-fable-5",
    messages=[
        {
            "role": "user",
            "content": "审查这个代码库的架构，指出潜在风险与重构建议。"
        }
    ]
)

print(response.choices[0].message.content)
```

#### Anthropic 原生格式调用

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com"
)

message = client.messages.create(
    model="claude-fable-5",
    max_tokens=8192,
    messages=[
        {
            "role": "user",
            "content": "请一步步定位这个生产环境 Bug 的根因，并给出修复方案。"
        }
    ]
)

print(message.content[0].text)
```

### 最佳实践

1. **合规先行**：接入前务必告知团队 30 天数据保留要求，敏感数据按内部合规策略处理。
2. **按任务选型**：高难度编程与 Agent 任务用 `claude-fable-5`；成本敏感的常规任务可选 `claude-opus-4-8` 或 Sonnet 系列。
3. **善用视觉能力**：研究、文档解析场景可直接传入含图表的 PDF，发挥 Fable 5 的强视觉理解。

## 价格与可用性

### 定价信息

| 计费项    | Claude Fable 5   | 说明    |
| ------ | ---------------- | ----- |
| **输入** | \$10 / 百万 tokens | 与官网一致 |
| **输出** | \$50 / 百万 tokens | 与官网一致 |

<Info>
  API易 `claude-fable-5` 定价与 Anthropic 官网完全一致（\$10 / \$50 每百万 tokens）。最终计费以平台实时数据为准。
</Info>

### 叠加网站充值活动

可结合 API易 充值加赠活动进一步降低实际成本，详见：`docs.apiyi.com/faq/recharge-promotions`。

### 购买渠道

**API易平台**：

* 官网：`apiyi.com`
* OpenAI 格式：`https://api.apiyi.com/v1`
* Anthropic 原生格式：`https://api.apiyi.com`
* 模型名：`claude-fable-5`

## 总结与建议

Claude Fable 5 是 Anthropic 的 Mythos 级新旗舰，软件工程与视觉理解全面 SOTA，支持长任务异步执行与自更新技能。API易已上线 `claude-fable-5`，定价与官网一致（\$10/\$50）。

**使用前请重点关注**：

* **30 天数据保留**：Fable 5 与 Mythos 5 的输入输出将保留 30 天用于滥用检测，默认仅自动化安全系统访问，人工审查仅在标记潜在危害时发生。**保留发生在 AWS / Anthropic 侧，API易 纯透明代理、自身不保留数据；其他 Claude 模型不受影响。**
* **安全回退**：高风险领域有害提示会回退至 Opus 4.8 并按 Opus 费率计费。

<Info>
  信息来源：Anthropic 官方说明（`support.claude.com/en/articles/15425996`）、AWS 官方博客（2026 年 6 月发布）。API易定价以平台实时数据为准。数据获取时间：2026 年 6 月 10 日。
</Info>
