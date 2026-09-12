> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Sonnet 5 上线：性能逼近 Opus 4.8，价格与官网一致

> Anthropic 于 2026 年 6 月 30 日发布 Claude Sonnet 5，SWE-bench Verified 达 85.2%，性能逼近 Opus 4.8。API易已上线 claude-sonnet-5，价格与官网完全一致，走高缓存命中的 AWS Claude 纯官转资源。

## 核心要点

* **最强 Sonnet**：Anthropic 6 月 30 日发布 Claude Sonnet 5，官方称其为"迄今最具 Agentic 能力的 Sonnet 模型"，性能逼近旗舰 Opus 4.8
* **编程大跨步**：SWE-bench Verified 达 **85.2%**，较 Sonnet 4.6 的 79.6% 提升约 5.6pp；Terminal-Bench 2.1 达 80.4%
* **价格与官网一致**：API易已上线 `claude-sonnet-5`，定价与 Anthropic 官网完全一致（介绍期 \$2/\$10，8 月 31 日后 \$3/\$15 每百万 tokens）
* **纯官转 + 高缓存命中**：走 AWS Bedrock Claude 纯官方转发资源，缓存命中率高，长 Agent 链路成本更可控
* **主力 Agent 模型**：擅长规划、调用浏览器/终端等工具并长时间自主运行，是跑 Agent 的高性价比之选

## 背景介绍

2026 年 6 月 30 日，Anthropic 正式发布 Claude Sonnet 5。作为 Sonnet 4.6 的继任者，它被官方定位为"迄今最具 Agentic 能力的 Sonnet 模型"——能够制定计划、使用浏览器与终端等工具，并在无人干预下长时间自主运行，达到"几个月前还需要更大、更贵模型才能完成"的水平。

Sonnet 系列一贯的定位是"高性价比的日常主力"，而 Sonnet 5 这次把能力推到了逼近旗舰 Opus 4.8 的水平，却仍保持 Sonnet 档的价格。对于大量以 Agent、编程、知识工作为主的实际负载，这意味着可以用更低的成本拿到接近旗舰的效果。

API易已第一时间上线 `claude-sonnet-5`，价格与官网完全一致，并采用高缓存命中的 AWS Claude 纯官转资源，适合直接切换为日常与 Agent 工作流的主力模型。

## 详细解析

### 核心特性

<CardGroup cols={2}>
  <Card title="最具 Agentic 能力" icon="bot">
    能规划任务、调用浏览器/终端工具并长时间自主运行，把长链路任务真正跑到完成
  </Card>

  <Card title="逼近 Opus 4.8" icon="gauge">
    多项评测性能接近旗舰 Opus 4.8，但价格维持在 Sonnet 档
  </Card>

  <Card title="编程显著提升" icon="code">
    SWE-bench Verified 85.2%、Terminal-Bench 2.1 80.4%，较 Sonnet 4.6 大幅进步
  </Card>

  <Card title="纯官转高缓存" icon="server">
    API易走 AWS Bedrock Claude 纯官方转发，缓存命中率高，成本更可控
  </Card>
</CardGroup>

### 性能亮点

| 评测项目                   | Claude Sonnet 5 | Claude Sonnet 4.6 | 提升         |
| ---------------------- | --------------- | ----------------- | ---------- |
| **SWE-bench Verified** | **85.2%**       | 79.6%             | **+5.6pp** |
| **Terminal-Bench 2.1** | **80.4%**       | —                 | 新高         |
| **SWE-bench Pro**      | **63.2%**       | —                 | —          |

<Info>
  数据来源：Anthropic 官方公告（2026 年 6 月 30 日发布），基准数据转引自多家独立评测与报道。不同来源在个别基准上略有出入，选型时请结合自身场景实测。数据获取时间：2026 年 7 月 1 日。
</Info>

**编程与工具使用**：

* SWE-bench Verified 由 Sonnet 4.6 的 79.6% 提升至 85.2%，在真实仓库级修复任务上更可靠。
* Terminal-Bench 2.1 达 80.4%，在 CLI/终端类 Agent、仓库维护、迁移工具等场景表现突出。

**Agentic 与自主性**：

* 更擅长把长链路任务"跑到完成"，而不是中途停下反复请求确认。
* 早期用户反馈其"几乎和 Opus 4.8 一样好，但更快、更便宜"。

### 技术规格

| 参数         | 规格                                              |
| ---------- | ----------------------------------------------- |
| **模型标识**   | `claude-sonnet-5`                               |
| **上游资源**   | AWS Bedrock Claude 纯官方转发                        |
| **缓存**     | 支持高缓存命中，降低重复上下文成本                               |
| **API 格式** | OpenAI 兼容 / Anthropic 原生                        |
| **可用渠道**   | Anthropic API、AWS Bedrock、Google Vertex AI、API易 |

## 实际应用

### 推荐场景

1. **日常主力编程**：仓库级修复、重构、Bug 定位，用 Sonnet 档价格拿到接近旗舰的效果
2. **长链路 Agent 任务**：浏览器/终端工具调用、自主运行的研究与代码代理
3. **CLI / 仓库维护自动化**：Terminal-Bench 表现突出，适合迁移工具、批量维护脚本
4. **成本敏感的高并发调用**：高缓存命中 + Sonnet 价格，适合规模化部署
5. **知识工作**：推理、工具使用与写作综合能力全面提升

### 代码示例

#### OpenAI 格式调用

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="claude-sonnet-5",
    messages=[
        {"role": "user", "content": "审查这段代码并指出潜在 Bug 与改进点。"}
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
    model="claude-sonnet-5",
    max_tokens=8192,
    messages=[
        {"role": "user", "content": "请一步步定位这个生产环境 Bug 的根因并给出修复方案。"}
    ]
)

print(message.content[0].text)
```

#### 在 Claude Code 中使用

```json theme={null}
{
  "model": "claude-sonnet-5",
  "apiKey": "your-apiyi-key",
  "baseURL": "https://api.apiyi.com"
}
```

### 最佳实践

1. **主力日常任务**：直接用 `claude-sonnet-5` 替代原 Sonnet 4.6，效果更好、价格不变。
2. **善用缓存**：把稳定的系统提示、代码上下文放在前缀，充分利用高缓存命中降低成本。
3. **长任务放手跑**：Agent 场景可让其自主运行更长时间，减少人工介入。
4. **按需上探旗舰**：极复杂的架构级决策再切 `claude-opus-4-8`。

## 价格与可用性

### 定价信息

| 计费项    | 介绍期（至 8 月 31 日）  | 8 月 31 日后        |
| ------ | ---------------- | ---------------- |
| **输入** | \$2 / 百万 tokens  | \$3 / 百万 tokens  |
| **输出** | \$10 / 百万 tokens | \$15 / 百万 tokens |

<Info>
  API易 `claude-sonnet-5` 价格与 Anthropic 官网完全一致，不加价；上游为 AWS Bedrock Claude 纯官方转发资源，支持高缓存命中。介绍期价格由官方设定，8 月 31 日后自动切换为标准价。
</Info>

**与同系列价格对比**（仅供参考）：

| 模型                  | 输入价格        | 输出价格          | 定位                |
| ------------------- | ----------- | ------------- | ----------------- |
| **Claude Sonnet 5** | **\$2→\$3** | **\$10→\$15** | 高性价比 Agent / 编程主力 |
| Claude Opus 4.8     | \$5         | \$25          | 最强编程 / 旗舰         |
| Claude Sonnet 4.6   | \$3         | \$15          | 上一代日常主力           |

### 叠加网站充值活动

可结合 API易 充值加赠活动进一步降低实际成本，详见：`docs.apiyi.com/faq/recharge-promotions`。

### 购买渠道

**API易平台**：

* 官网：`apiyi.com`
* OpenAI 格式：`https://api.apiyi.com/v1`
* Anthropic 原生格式：`https://api.apiyi.com`
* 模型名：`claude-sonnet-5`

## 总结与建议

Claude Sonnet 5 把 Sonnet 系列推到了逼近旗舰 Opus 4.8 的水平：SWE-bench Verified 85.2%、最具 Agentic 能力、长链路任务更能"跑到完成"，而价格仍维持在 Sonnet 档。API易已上线 `claude-sonnet-5`，价格与官网一致、走高缓存命中的 AWS Claude 纯官转资源，是替换日常与 Agent 主力模型的理想选择。

**核心优势**：

* **更强**：SWE-bench Verified 85.2%，性能逼近 Opus 4.8
* **更省**：Sonnet 档价格 + 高缓存命中
* **更稳**：AWS Bedrock 纯官方转发资源
* **不加价**：与 Anthropic 官网定价完全一致

<Info>
  信息来源：Anthropic 官方公告（2026 年 6 月 30 日）及多家独立评测/报道。API易定价以平台实时数据为准。数据获取时间：2026 年 7 月 1 日。
</Info>
