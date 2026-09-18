> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-5.6 系列上线：Sol / Terra / Luna 三档齐发

> OpenAI 新一代 GPT-5.6 三档模型已上架 API易：旗舰 Sol $5/$30、均衡 Terra $2.5/$15、轻量 Luna $1/$6，官方同价，默认官转分组充值最多赠 20%（约 83 折），CodexReverse 分组默认 0.7 折扣。

## 核心要点

* **三档齐发**：OpenAI 于 2026年7月9日 正式发布 GPT-5.6 系列——旗舰 `gpt-5.6-sol`、均衡 `gpt-5.6-terra`、轻量 `gpt-5.6-luna`，API易 已全部上架
* **新命名体系**：数字代表模型代际，Sol / Terra / Luna 代表可独立迭代的能力档位，取代过去 Pro / Mini / Nano 的后缀方式
* **全面超越 GPT-5.5**：Sol 在 Terminal-Bench 2.1 达 **88.8%**（GPT-5.5 为 85.6%）、BrowseComp **90.4%**、Agents' Last Exam **52.7%**；Terra 性能对标 GPT-5.5 但**价格便宜一半**
* **Programmatic Tool Calling**：Responses API 新增程序化工具调用，模型编写的 JavaScript 在隔离 V8 运行时执行，实测 token 消耗可降 38-63.5%
* **双通道供给**：默认官转分组与官网同价（充值最多赠 20%，约 **83 折**）；CodexReverse 分组默认 **0.7 折扣**，成本敏感场景更划算

## 背景介绍

2026年7月9日，OpenAI 结束限量预览，宣布 GPT-5.6 系列全面开放（GA），覆盖 ChatGPT、Codex 与 OpenAI API。这次发布最大的变化是命名体系：不再用 Pro / Mini / Nano 后缀，而是引入 Sol（旗舰）、Terra（均衡）、Luna（轻量）三个「太阳 / 大地 / 月亮」能力档位——数字标识代际，档位可以按各自节奏独立演进。

产品定位也更清晰：Sol 主打前沿智能与 Agent 任务上限，Terra 以 GPT-5.5 级别的性能砍掉一半价格，Luna 则把入门成本压到 \$1/\$6 每百万 tokens。API易 在发布次日即完成三模型上架，默认官转分组与 CodexReverse 分组同时开放。

## 详细解析

### 性能基准（数据获取于 2026/7/10）

| 基准测试                       | Sol       | Terra | Luna  | GPT-5.5 | Claude Fable 5 |
| -------------------------- | --------- | ----- | ----- | ------- | -------------- |
| AA Coding Agent Index v1.1 | **80**    | 77.4  | 74.6  | 76.4    | 77.2           |
| Terminal-Bench 2.1         | **88.8%** | 87.4% | 84.7% | 85.6%   | 83.1%          |
| DeepSWE v1.1               | **72.7%** | 69.6% | 67.2% | 67%     | 69.7%          |
| SWE-Bench Pro              | 64.6%     | 63.4% | 62.7% | 59.4%   | **80%**        |
| Agents' Last Exam          | **52.7%** | 50.4% | 50.3% | 46.9%   | 40.5%          |
| BrowseComp                 | **90.4%** | 87.5% | 83.3% | 84.4%   | —              |
| OSWorld 2.0                | **62.6%** | 50.2% | 45.6% | 47.5%   | —              |

<Info>
  数据来源：OpenAI 官方公告 `openai.com/index/gpt-5-6`、`marktechpost.com`（2026年7月9日）。多智能体配置 Sol Ultra（4 agent）在 Terminal-Bench 2.1 可达 91.9%。注意：SWE-Bench Pro 一项 Claude Fable 5（80%）仍大幅领先 Sol（64.6%）。
</Info>

### 核心特性

<CardGroup cols={2}>
  <Card title="三档能力体系" icon="layers">
    Sol 冲上限、Terra 主力走量、Luna 压成本，同代同源，按需选档；OpenAI 兼容格式互相切换只改 `model` 名
  </Card>

  <Card title="Programmatic Tool Calling" icon="code">
    Responses API 程序化工具调用：模型写 JavaScript 在无网络隔离 V8 运行时执行，官方客户实测 token 消耗降 38-63.5%
  </Card>

  <Card title="缓存计费升级" icon="database">
    缓存写入按未缓存输入的 1.25 倍计费，缓存读取维持 9 折优惠（90% discount），最短缓存生命周期 30 分钟
  </Card>

  <Card title="Agent 场景强势" icon="bot">
    BrowseComp、OSWorld 2.0、Agents' Last Exam 全面领先上代，浏览器与桌面自动化任务提升显著
  </Card>
</CardGroup>

<Warning>
  Luna 在 256K-1M 超长上下文评测中仅得 41.3%，超长文档场景建议选择 Terra / Sol 或分块处理。
</Warning>

## 实际应用

### 选型建议

* **`gpt-5.6-sol`**：Agent 上限型任务——复杂编码 Agent、桌面 / 浏览器自动化、深度研究
* **`gpt-5.6-terra`**：日常主力——对标 GPT-5.5 的性能、一半的价格，适合绝大多数生产负载迁移
* **`gpt-5.6-luna`**：高并发走量——分类、抽取、轻对话、工具调用胶水层

### 代码示例

```python theme={null}
import openai

client = openai.OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="gpt-5.6-terra",  # 或 gpt-5.6-sol / gpt-5.6-luna
    messages=[
        {"role": "user", "content": "总结一下 GPT-5.6 三个档位的区别"}
    ]
)
print(response.choices[0].message.content)
```

存量 GPT-5.5 代码只需替换 `model` 字段即可迁移。

## 价格与可用性

### 定价信息（每百万 tokens，与官网一致）

| 模型              | 输入     | 输出      | 定位 |
| --------------- | ------ | ------- | -- |
| `gpt-5.6-sol`   | \$5.00 | \$30.00 | 旗舰 |
| `gpt-5.6-terra` | \$2.50 | \$15.00 | 均衡 |
| `gpt-5.6-luna`  | \$1.00 | \$6.00  | 轻量 |

### 双分组供给

| 分组                     | 价格口径          | 说明                                        |
| ---------------------- | ------------- | ----------------------------------------- |
| 默认官转分组（default / svip） | 官网同价          | 官方 API 资源，充值活动最多赠 20%，实际约 **83 折**（1/1.2） |
| CodexReverse 分组        | 默认 **0.7 折扣** | Codex 逆向资源经济通道，可用性与官方 Codex 同步            |

两个分组按需自选：追求生产级稳定选默认官转分组，成本敏感的批量任务可用 CodexReverse 分组。充值加赠详见[充值优惠说明](/faq/recharge-promotions)。

## 总结与建议

GPT-5.6 的看点不在单点跑分，而在「档位化」的产品结构：Terra 用一半价格交付 GPT-5.5 级性能，是最值得优先迁移的一档；Sol 在 Agent 类基准全面登顶（SWE-Bench Pro 除外，该项 Claude Fable 5 仍领先约 15 分）；Luna 则给高并发场景一个 \$1 输入的新选择。建议先用 Terra 跑一遍现有负载对比效果，Agent 重度场景再上 Sol。

<Info>
  信息来源：OpenAI 官方公告 `openai.com/index/gpt-5-6`、OpenAI Help Center、MarkTechPost、VentureBeat；数据获取日期 2026年7月10日。三模型已在 API易 上架，获取密钥后即可调用。
</Info>
