> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-6 Sol 与 Luna 上线：价格减半，与 Claude 同日降价

> OpenAI 于 2026 年 9 月 22 日发布 GPT-6 Sol 与 GPT-6 Luna，价格约为上一代的一半且为长期价格：Sol 输入 $2 / 输出 $10，Luna 输入 $0.10 / 输出 $0.50 每百万 tokens。API易已上线，四项计费与官网一致，Chat 与 Responses 双端点实测可用。

## 核心要点

* **价格又降了**：`gpt-6-sol` 输入 \$2 / 输出 \$10，`gpt-6-luna` 输入 \$0.10 / 输出 \$0.50（每百万 tokens），约为上一代 `gpt-5.6-sol` / `gpt-5.6-luna` 的一半。OpenAI 明确这是**长期价格**，不是限时促销
* **两档分工清晰**：Sol 面向写功能、审代码、调试、数据分析这类日常复杂工作；Luna 面向摘要、抽取、简单问答等大批量任务
* **规格与旗舰同级**：两款都是 1.05M 上下文、128K 最大输出，推理力度六档（`none` 到 `max`），默认 `medium`
* **API易 已上线**：`default` / `svip` / `CodexResponses` 分组可用，四项计费与官网一致；`/v1/chat/completions` 与 `/v1/responses` 双端点、含函数调用**全部实测通过**
* **与 Claude 同日降价**：同一天 Anthropic 发布了降价的 Claude Opus 5.5。两家旗舰厂商同时让利，最直接的受益者是开发者和终端用户

## 背景介绍

9 月 3 日 OpenAI 发布了新旗舰 GPT-6 Astra，定价 \$10 / \$50，定位是电脑操作与长程 Agent。19 天后的 9 月 22 日，GPT-6 系列补齐了中档和轻量档：**Sol 和 Luna**。

这次发布的重点不在跑分，而在价格。Sol 的输入输出价比上一代 `gpt-5.6-sol` 各降一半，Luna 的输出价从 \$1.20 降到 \$0.50。官方特别说明这组价格是长期定价，不是上线期的促销价。

巧合的是，同一天 Anthropic 也发布了 Claude Opus 5.5，价格同样低于上一代。两家头部厂商在同一天降价，说明大模型价格竞争还在继续：同样的预算能做更多事，或者同样的任务花更少的钱。对在 API易 上同时使用两家模型的团队来说，这是一次可以直接体现在账单上的利好。

API易 已同步上线 `gpt-6-sol` 与 `gpt-6-luna`，**输入、输出、缓存读取、缓存写入四项计费全部与官网一致**。

## 详细解析

### 两个模型怎么选

<CardGroup cols={2}>
  <Card title="GPT-6 Sol：日常主力" icon="sun">
    写功能、审代码、调试、数据分析等复杂但重复发生的工作。DeepSWE v1.1 得分 68.8%，FrontierCode 在 xhigh 档与 Claude Fable 5.1 持平
  </Card>

  <Card title="GPT-6 Luna：大批量" icon="moon">
    摘要、信息抽取、简单问答、分类等边界清晰的任务。输出 \$0.50 每百万 tokens，DeepSWE v1.1 仍有 66.6%
  </Card>
</CardGroup>

和系列内另外一档的关系：需要电脑操作、最长程 Agent 任务时用 `gpt-6-astra`；其余大部分负载先用 Sol 评测；量大、任务简单的交给 Luna。

### 性能基准

| 基准测试 | GPT-6 Sol | GPT-6 Luna |
| - | - | - |
| **DeepSWE v1.1**（max） | **68.8%** | 66.6% |
| **AutomationBench 1.0.6** | **33.2%**（xhigh） | 30.3% |
| **OSWorld 2.0**（xhigh） | 60.5% | — |
| **Agents' Last Exam**（max） | 56.4% | — |

官方给了一组性价比对比：AutomationBench 上，Sol 在 xhigh 档得 33.2%，每个任务成本约 \$0.27；Claude Opus 5 在 max 档得 26.9%，成本约为 Sol 的 11 倍。

<Info>
  数据来源：OpenAI 官方发布材料，以及 VentureBeat、MarkTechPost 的转述（2026 年 9 月 22 日），尚无独立复现。表中括号为测试时的推理力度档位。数据获取时间：2026 年 9 月 23 日。
</Info>

### 技术规格

| 参数 | GPT-6 Sol | GPT-6 Luna |
| - | - | - |
| **模型标识** | `gpt-6-sol` | `gpt-6-luna` |
| **上下文长度** | 1,050,000 tokens | 1,050,000 tokens（单次最大输入 922K） |
| **最大输出** | 128,000 tokens | 128,000 tokens |
| **知识截止** | 2026 年 4 月 20 日 | 2026 年 5 月 18 日 |
| **推理力度** | `none` / `low` / `medium`（默认）/ `high` / `xhigh` / `max` | 同左 |
| **输入 / 输出模态** | 文本、图片 / 文本 | 文本、图片 / 文本 |
| **功能** | 流式输出、函数调用、结构化输出、提示缓存 | 同左 |

### API易 端点实测（2026 年 9 月 23 日）

上线当天我们对两个模型各做了 5 组最小请求，**10 组全部 HTTP 200**：

| 用例 | gpt-6-sol | gpt-6-luna |
| - | - | - |
| `/v1/chat/completions` 纯文本 | ✅ | ✅ |
| `/v1/chat/completions` + 函数工具 | ✅ 正常返回工具调用 | ✅ 正常返回工具调用 |
| `/v1/chat/completions` + 函数工具 + `reasoning_effort` | ✅ | ✅ |
| `/v1/responses` 纯文本 | ✅ | ✅ |
| `/v1/responses` + 函数工具 | ✅ | ✅ |

<Tip>
  和 GPT-6 Astra 不同，**Sol 和 Luna 在 Chat Completions 端点上可以带函数工具**，`tools` 与 `reasoning_effort` 也能同时传。存量的 Chat 代码只需改模型名。
</Tip>

<Warning>
  **输出上限要给推理留余量**：推理 token 计入输出上限。实测 Luna 在 `max_output_tokens` 设为 64 时，额度全部用在推理上，没有返回正文。日常调用不要把上限压得太紧。
</Warning>

## 实际应用

### 代码示例

<CodeGroup>
  ```python Chat Completions theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  response = client.chat.completions.create(
      model="gpt-6-sol",
      reasoning_effort="medium",   # none / low / medium / high / xhigh / max
      messages=[
          {"role": "user", "content": "审查这段代码，指出潜在 Bug 并给出修复建议"}
      ]
  )
  print(response.choices[0].message.content)
  ```

  ```python Responses API theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="YOUR_API_KEY", base_url="https://api.apiyi.com/v1")

  response = client.responses.create(
      model="gpt-6-luna",
      reasoning={"effort": "low"},
      input="把下面这段客服对话总结成三条要点：……",
  )
  print(response.output_text)
  ```

  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gpt-6-sol",
      "reasoning_effort": "medium",
      "messages": [{"role": "user", "content": "用一句话说明 GPT-6 Sol 与 Luna 的定位差异"}]
    }'
  ```
</CodeGroup>

### 最佳实践

* **从 5.6 迁移只改模型名**：`gpt-5.6-sol` → `gpt-6-sol`，`gpt-5.6-luna` → `gpt-6-luna`，两个端点的请求结构都不变
* **推理力度按任务选**：默认 `medium`。编程、Agent 任务可以提到 `high` 或 `xhigh`；Luna 跑批量摘要、抽取时用 `low` 或 `none`，速度更快、推理 token 更少
* **用好缓存**：缓存读取是标准输入价的十分之一。把系统提示、工具定义这些稳定内容放在消息开头，多轮对话每一轮都能命中
* **上下文尽量压在 272K 以内**：超过后整单进入更高一档计费（见下方阶梯表）

## 价格与可用性

### 定价信息

原厂公布价格（单位：美元 / 百万 tokens，输入 272K 以内）：

| 计费项 | GPT-6 Sol | GPT-5.6 Sol | GPT-6 Luna | GPT-5.6 Luna |
| - | - | - | - | - |
| **输入** | **\$2.00** | \$4.00 | **\$0.10** | \$0.20 |
| **输出** | **\$10.00** | \$20.00 | **\$0.50** | \$1.20 |
| **缓存读取** | **\$0.20** | \$0.40 | **\$0.01** | \$0.02 |
| **缓存写入（5 分钟）** | **\$2.50** | \$5.00 | **\$0.125** | \$0.25 |

上表同时就是 API易 的定价：**四项计费与官网逐项一致，没有加价**。

<Info>
  \*\*我们的定价与官网一致，不在模型价格上加价。\*\*在此之上，部分分组另有折扣，也可叠加充值加赠活动，这部分是我们的让利，与模型本身的定价无关。充值按固定汇率 1:7 结算。
</Info>

### 长上下文阶梯

与官网一致，单次请求输入超过 272K tokens 时，**整条请求**按第二档计费（输入与缓存 ×2，输出 ×1.5）：

| 输入 tokens | 模型 | 输入 | 输出 | 缓存读取 | 缓存写入 |
| - | - | - | - | - | - |
| 0 - 272K | `gpt-6-sol` | \$2.00 | \$10.00 | \$0.20 | \$2.50 |
| 272K 以上 | `gpt-6-sol` | \$4.00 | \$15.00 | \$0.40 | \$5.00 |
| 0 - 272K | `gpt-6-luna` | \$0.10 | \$0.50 | \$0.01 | \$0.125 |
| 272K 以上 | `gpt-6-luna` | \$0.20 | \$0.75 | \$0.02 | \$0.25 |

阶梯按单次请求判定，不按账户累计。具体数值以 [模型价格页](/models/index) 实时数据为准。

### 可用分组与端点

| 项目 | 说明 |
| - | - |
| **模型名** | `gpt-6-sol` / `gpt-6-luna` |
| **可用分组** | `default` / `svip` / `CodexResponses` |
| **支持端点** | `/v1/chat/completions`、`/v1/responses`（均支持函数调用） |
| **Base URL** | `https://api.apiyi.com/v1` |

分组差异见 [分组说明](/faq/codex-claudecode-default-groups)。

### 叠加网站充值活动

可结合 API易 充值加赠活动进一步降低实际成本，详见：[充值优惠说明](/faq/recharge-promotions)。

## 总结与建议

GPT-6 Sol 和 Luna 把 OpenAI 的主力档和轻量档价格都降到了上一代的一半左右，而且是长期价格。加上同一天发布的 Claude Opus 5.5 也在降价，两家头部厂商同时让利，开发者可以用更少的预算跑更多的任务。

**使用建议**：

1. **正在用 `gpt-5.6-sol` / `gpt-5.6-luna` 的用户**：直接换模型名，成本约减半，Chat 与 Responses 两个端点都不用改代码
2. **成本敏感的批量任务**：Luna 输出只要 \$0.50 每百万 tokens，配合 `low` 推理力度和缓存，适合大规模摘要、抽取
3. **不确定选哪家**：API易 上 GPT-6 与 Claude 两个系列都能用同一个 Key 调用，可以拿自己的任务分别跑一轮对比

<Info>
  信息来源：OpenAI 官方模型文档 `developers.openai.com/api/docs/models/gpt-6-sol`、`developers.openai.com/api/docs/models/gpt-6-luna`，以及 VentureBeat、MarkTechPost、TechCrunch 等媒体报道。端点实测由 API易 于 2026 年 9 月 23 日完成。API易定价以平台实时数据为准。
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.