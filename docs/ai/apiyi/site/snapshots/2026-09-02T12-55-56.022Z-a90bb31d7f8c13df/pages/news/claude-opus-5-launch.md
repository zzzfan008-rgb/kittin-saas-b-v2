> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Opus 5 震撼上线：智能逼近 Fable 5，价格减半

> Anthropic 于 2026 年 7 月 24 日发布 Claude Opus 5，智能逼近 Fable 5 而价格仅一半（$5/$25 每百万 tokens），1M 上下文、思考默认开启。API易已同步上线 claude-opus-5，与 Opus 4.8 价格完全持平。

## 核心要点

* **旗舰级智能，一半价格**：多项内部基准逼近甚至超越 Fable 5（Frontier Bench v0.1 得分 **43.3%**，Fable 5 为 33.7%），而价格仅为其一半
* **价格持平不加价**：API易已上线 `claude-opus-5`，提示 \$5 / 补全 \$25 每百万 tokens，与 Opus 4.8 完全一致，属于"无痛升级"
* **1M 超长上下文**：上下文窗口默认即 100 万 tokens，单次输出最高 128K tokens
* **思考默认开启**：不传 `thinking` 参数即自动进入自适应思考；effort 支持 low / medium / high / xhigh / max 五档
* **Agentic 编程强项**：多文件功能开发、大型重构、代码审查（高精确率 + 高召回率）、多代理协同均为强项

## 背景介绍

2026 年 7 月 24 日，Anthropic 正式发布 Claude Opus 5，作为 Opus 4.8 的继任者接棒 Opus 产品线。官方定位非常直接：**用 Opus 4.8 的价格，买到逼近 Fable 5 的智能**。

Fable 5 作为 Anthropic 最强模型定价 \$10/\$50 每百万 tokens，而 Claude Opus 5 维持 \$5/\$25，却在部分编程与知识工作基准上反超——内部 Frontier Bench v0.1 测试中 Opus 5 得分 43.3%，高于 Fable 5 的 33.7%。同时，Opus 5 的内容安全策略比 Fable 5 更宽松，也**不受 Fable 5 的 30 天数据保留要求限制**，对合规敏感的团队更友好。

API易已第一时间同步上线 `claude-opus-5`（同时提供 `claude-opus-5-thinking` 变体），OpenAI 兼容与 Anthropic 原生双端点均可调用。

## 详细解析

### 核心特性

<CardGroup cols={2}>
  <Card title="逼近 Fable 5 的智能" icon="trophy">
    Frontier Bench v0.1 得分 43.3%，超过 Fable 5 的 33.7%；CursorBench、ARC-AGI 3 等多项基准业界领先
  </Card>

  <Card title="1M 上下文窗口" icon="scroll-text">
    默认即 100 万 tokens 上下文，128K 最大输出，长文档、仓库级任务一次装下
  </Card>

  <Card title="思考默认开启" icon="brain">
    无需配置即自适应思考；effort 五档（low 至 max）灵活权衡深度与成本
  </Card>

  <Card title="多代理协同" icon="network">
    子代理团队调度可靠，写作者-校验者模式表现出色，适合大规模并行任务
  </Card>
</CardGroup>

### 性能亮点

| 评测项目                    | Claude Opus 5        | 对比                       |
| ----------------------- | -------------------- | ------------------------ |
| **Frontier Bench v0.1** | **43.3%**            | Fable 5 为 33.7%          |
| **定价（输入/输出）**           | **\$5 / \$25**       | Fable 5 为 \$10/\$50，仅其一半 |
| **上下文窗口**               | **1,000,000 tokens** | 默认即最大，无长上下文加价            |
| **最大输出**                | **128K tokens**      | 与 Opus 4.8 持平            |

<Info>
  数据来源：Anthropic 官方公告（2026 年 7 月 24 日发布），独立报道见 TechCrunch：`techcrunch.com/2026/07/24/anthropic-launches-opus-5/`。数据获取时间：2026 年 7 月 25 日。
</Info>

**编程与 Agentic 能力**：

* 强项集中在"更难"的任务：多文件功能开发、大型重构、端到端功能实现，完成度高、不留占位符。
* 代码审查同时具备高精确率与高召回率——单轮找出更多真实 Bug，且误报少；低 effort 档位依然保持准确，可用作廉价快速审查。

**API 行为变化（开发者须知）**：

* **思考默认开启**：省略 `thinking` 参数即运行自适应思考（与 Opus 4.8 相反）；`max_tokens` 同时封顶思考与正文，紧凑的 `max_tokens` 需要调大。
* **关闭思考受限**：`thinking: {"type": "disabled"}` 仅在 effort 为 `high` 及以下时接受，与 `xhigh` / `max` 组合会返回 400。
* **提示缓存门槛降低**：最小可缓存前缀从 1024 tokens 降至 **512 tokens**，此前太短无法缓存的提示现在可以命中。
* **独立限流**：Opus 5 使用独立的速率限制池，不与 Opus 4.x 系列共享额度。

### 技术规格

| 参数         | 规格                                                                |
| ---------- | ----------------------------------------------------------------- |
| **模型标识**   | `claude-opus-5`（API易同时提供 `claude-opus-5-thinking`）                |
| **上下文长度**  | 1,000,000 tokens（默认即最大）                                           |
| **最大输出**   | 128,000 tokens                                                    |
| **思考模式**   | 默认自适应思考；effort 五档（low / medium / high / xhigh / max）              |
| **API 格式** | OpenAI 兼容 / Anthropic 原生                                          |
| **可用渠道**   | Anthropic API、AWS Bedrock、Google Vertex AI、Microsoft Foundry、API易 |

## 实际应用

### 推荐场景

1. **复杂 Agentic 编程**：多文件功能开发、大型重构、端到端实现——给足完整任务描述后放手让它跑
2. **关键代码审查**：高精确率 + 高召回率，低档位可做快速初审、高档位做上线前把关
3. **仓库级 / 长文档任务**：1M 上下文一次装下完整项目源码与文档
4. **多代理编排**：调度子代理团队、写作者-校验者模式，适合大规模并行工作流
5. **Office 文档生成**：复杂多表 Excel 公式、遵循版式规范的 PPT 制作

### 代码示例

#### OpenAI 格式调用

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="claude-opus-5",
    messages=[
        {
            "role": "user",
            "content": "重构这个模块：拆分职责、补齐测试，并说明每一步的取舍。"
        }
    ],
    extra_body={
        "anthropic_effort": "xhigh"  # low / medium / high / xhigh / max
    }
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
    model="claude-opus-5",
    max_tokens=16000,  # 注意：思考默认开启，max_tokens 同时封顶思考与正文
    messages=[
        {
            "role": "user",
            "content": "请一步步定位这个生产环境 Bug 的根因，并给出修复方案。"
        }
    ]
)

for block in message.content:
    if block.type == "text":
        print(block.text)
```

#### 在 Claude Code 中使用

```json theme={null}
{
  "model": "claude-opus-5",
  "apiKey": "your-apiyi-key",
  "baseURL": "https://api.apiyi.com/v1"
}
```

### 最佳实践

1. **effort 按任务选档**：
   * **编程 / Agentic 任务**：从 `xhigh` 起步
   * **常规智能敏感任务**：`high`（默认档）
   * **成本敏感批量调用**：Opus 5 的 `low` / `medium` 表现远超同档预期，值得做一轮降档评测

2. **给足上下文再放手**：一次性给出完整任务说明，比多轮交互式补充更省 token、效果更好。

3. **留意 max\_tokens**：思考默认开启后，原来按正文长度紧凑设置的 `max_tokens` 可能截断输出，建议调大留出思考空间。

4. **删掉旧的"自检"指令**：Opus 5 会自发校验自己的工作，提示词里沿用的"double-check / 再验证一遍"类指令反而导致过度验证，可直接删除。

## 价格与可用性

### 定价信息

| 计费项    | Claude Opus 5        | Claude Opus 4.8  | Fable 5          |
| ------ | -------------------- | ---------------- | ---------------- |
| **输入** | **\$5 / 百万 tokens**  | \$5 / 百万 tokens  | \$10 / 百万 tokens |
| **输出** | **\$25 / 百万 tokens** | \$25 / 百万 tokens | \$50 / 百万 tokens |

<Info>
  Opus 5 与 Opus 4.8 价格完全持平，等于"不加价"换代；相对 Fable 5 则是**半价拿到逼近甚至反超的智能**。API易平台价格与官方计费口径一致，充值按固定汇率 1:7 结算。
</Info>

### API易平台接入

* 官网：`apiyi.com`
* OpenAI 格式：`https://api.apiyi.com/v1`
* Anthropic 原生格式：`https://api.apiyi.com`
* 模型名：`claude-opus-5` / `claude-opus-5-thinking`
* 可用分组：default、ClaudeCode、SVIP（部分分组享有折扣，可与充值加赠叠加）

### 叠加网站充值活动

可结合 API易 充值加赠活动进一步降低实际成本，详见：[充值优惠说明](/faq/recharge-promotions)。

## 总结与建议

Claude Opus 5 是一次"半价旗舰"式的发布：价格锚定 Opus 4.8（\$5/\$25），智能却逼近甚至部分反超定价翻倍的 Fable 5，还带来 1M 上下文、默认思考、512 tokens 缓存门槛等实用升级。

**核心优势**：

* **性价比**：Fable 5 级智能，一半价格
* **长上下文**：1M tokens 默认即最大，无加价
* **编程强项**：复杂多文件任务、代码审查、多代理协同
* **合规友好**：不受 Fable 5 的 30 天数据保留要求限制

**使用建议**：

1. **正在用 Opus 4.8 的用户**：直接换模型名即可升级，注意思考默认开启对 `max_tokens` 的影响
2. **正在用 Fable 5 的用户**：非极限推理场景可切换 Opus 5，成本立省一半
3. **编程 / Agent 工作流**：搭配 `xhigh` 档位，给足任务描述后放手执行

API易已全面上线 `claude-opus-5`，兼容 OpenAI 与 Anthropic 原生双格式，欢迎立即体验这次"半价旗舰"升级。

<Info>
  信息来源：Anthropic 官方公告（2026 年 7 月 24 日）、TechCrunch 等媒体报道。API易定价以平台实时数据为准。数据获取时间：2026 年 7 月 25 日。
</Info>
