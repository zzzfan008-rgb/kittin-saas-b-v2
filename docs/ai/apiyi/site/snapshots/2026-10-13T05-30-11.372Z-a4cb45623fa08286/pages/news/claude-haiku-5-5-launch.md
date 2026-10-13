> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Haiku 5.5 上线：小模型 1M 上下文，价格降九成

> Anthropic 于 2026 年 10 月 7 日发布 Claude Haiku 5.5，1M 上下文、128K 输出、支持 effort 档位，10 万 tokens 以内输入 $0.10 / 输出 $0.50 每百万 tokens。API易 已上线 claude-haiku-5-5，计费与官网一致。

## 核心要点

* **价格降到原来的约一成**：10 万 tokens 以内的请求，输入 \$0.10 / 输出 \$0.50 每百万 tokens，缓存读取 \$0.01。官方测算，即便算上新分词器多出的 token，这类请求的成本也比 Haiku 4.5 低约 90％
* **能力跨代提升**：官方公布 GDPval-AA 知识工作 1620（Haiku 4.5 为 735）、OSWorld 2.1 电脑操作 72.4%（Haiku 4.5 为 15.7%）、Terminal-Bench 4.0 39.2%（Haiku 4.5 为 0%）
* **1M 上下文、128K 输出**：Haiku 4.5 只有 200K 上下文和 64K 输出；同时成为第一款支持 effort 档位（`low` 到 `max`）的 Haiku
* **超过 10 万 tokens 单价翻 5 倍**：输入 \$0.50 / 输出 \$2.50。长文档、长对话类负载要先算账
* **API易 已上线**：`claude-haiku-5-5` 与 `claude-haiku-5-5-thinking`，OpenAI 兼容与 Anthropic 原生双端点，两档分段计费与官网逐项一致

## 背景介绍

2026 年 10 月 7 日，Anthropic 发布 Claude Haiku 5.5，Claude 5.5 系列至此补齐：[Opus 5.5](/news/claude-opus-5-5-launch) 9 月下旬发布，[Sonnet 5.5](/news/claude-sonnet-5-5-launch) 9 月 28 日发布，Haiku 5.5 是最后一款，官方称它是 Anthropic「最便宜、最快、能力最强的小模型」。

Haiku 一直是 Claude 家族里跑量的那一档：分类、抽取、路由、摘要、给大模型当子代理。上一代 Haiku 4.5 发布于 2025 年 10 月，距今正好一年。这一代的变化不是小修小补：上下文从 200K 扩到 1M，思考模式改成与 Sonnet / Opus 相同的自适应思考 + effort 档位，而 10 万 tokens 以内的单价直接降到 Haiku 4.5 的十分之一。

官方也说得很清楚它**不擅长**什么：复杂的 Agent 编程仍然该交给 Sonnet 5.5 和 Opus 5.5，Haiku 5.5 适合范围明确的窄任务，以及在这两款大模型下面当子代理。

API易 已同步上线 `claude-haiku-5-5`（同时提供 `claude-haiku-5-5-thinking`），**两档分段计费的每一项都与官网一致**。

## 详细解析

### 核心特性

<CardGroup cols={2}>
  <Card title="价格降约 90％" icon="badge-dollar-sign">
    10 万 tokens 以内输入 \$0.10、输出 \$0.50 每百万 tokens，Haiku 4.5 为 \$1 / \$5；官方测算已计入新分词器多出的 token
  </Card>

  <Card title="1M 上下文" icon="scroll-text">
    100 万 tokens 上下文、128K 最大输出（批处理接口配合 beta 头最高 300K），Haiku 4.5 为 200K / 64K
  </Card>

  <Card title="effort 档位" icon="gauge">
    第一款支持 effort 的 Haiku：`low` / `medium` / `high` / `xhigh` / `max`，默认 `medium`，自适应思考默认开启
  </Card>

  <Card title="标准速度下最快" icon="zap">
    官方称是 Anthropic 标准速度下最快的模型；Artificial Analysis 实测输出速度约 244 tokens/秒
  </Card>
</CardGroup>

### 性能基准（厂商自报）

| 评测项目 | Haiku 5.5 | Haiku 4.5 | GPT-6 Luna | Sonnet 5.5 |
| - | - | - | - | - |
| **GDPval-AA v2.1**（知识工作，Elo） | 1620 | 735 | 1437 | **1840** |
| **AA-Briefcase v1.1** | 1578 | 614 | 1336 | **1824** |
| **OSWorld 2.1**（电脑操作，离线子集） | 72.4% | 15.7% | 48.9% | **83.9%** |
| **Humanity's Last Exam**（无工具） | 45.9% | 10.2% | — | **56.9%** |
| **Humanity's Last Exam**（带工具） | 57.4% | 18.7% | — | **64.5%** |
| **Terminal-Bench 4.0**（Agent 编程） | 39.2% | 0.0% | 16.4% | **70.6%** |
| **FrontierCode 1.1**（Main） | 46.4% | — | 42.4% | **52.1%**（xhigh） |
| **Chartography**（图表理解，无工具） | 46.4% | 6.4% | 29.1% | **61.6%** |

<Info>
  数据来源：Anthropic 官方发布页 `anthropic.com/claude-haiku-5-5`（2026 年 10 月 7 日）。表中 Sonnet 5.5 的 FrontierCode 分数为 xhigh effort。数据获取时间：2026 年 10 月 8 日。
</Info>

几点解读：

* **和同价位对手比**：在官方列出的每一项上，Haiku 5.5 都高于 OpenAI 的小模型 GPT-6 Luna，Terminal-Bench 4.0 高出一倍多
* **和 Sonnet 5.5 比**：电脑操作（OSWorld 72.4% 对 83.9%）约为 Sonnet 5.5 的八成半，知识工作 Elo 落后约 220 分；但 Agent 编程（Terminal-Bench 39.2% 对 70.6%）差距明显，这和官方「复杂编程交给 Sonnet / Opus」的定位一致
* **客户反馈**：Box 称其得分比 Haiku 4.5 高 11 分、延迟约减半；Asana 称任务完成延迟降低 30％ 以上

### 独立评测（Artificial Analysis）

| 指标 | Haiku 5.5（max effort） | 说明 |
| - | - | - |
| **Intelligence Index**（v4.3.2） | 43 | 同价位推理模型中位数为 13 |
| **输出速度** | 约 244 tokens/秒 | 同类推理模型中位数约 111 tokens/秒 |
| **跑完整套评测的输出量** | 约 4.4 亿 tokens | 中位数约 1 亿 tokens |

<Warning>
  **单价低，但开高 effort 会很「啰嗦」**：Artificial Analysis 在 max effort 下测得 Haiku 5.5 跑完整套评测输出约 4.4 亿 tokens，是中位数的 4 倍多。再叠加新分词器（同一段文本比 Haiku 4.5 多约 30％ token），**单价降九成不等于账单降九成**。分类、抽取这类窄任务建议用默认的 `medium` 或 `low`，不要默认拉到 `max`。
</Warning>

### 开发者须知：从 Haiku 4.5 迁移的破坏性变更

Haiku 5.5 的请求结构和 Sonnet 5.5 / Opus 5.5 对齐，相比 Haiku 4.5 有不少会直接报 400 的变化：

| 变更 | Haiku 4.5 | Haiku 5.5 | 怎么改 |
| - | - | - | - |
| **手动思考预算** | 支持 `{"type": "enabled", "budget_tokens": N}` | 官方文档写明报 400（API易 实测未报错） | 改为 `{"type": "adaptive"}`，用 `effort` 控制思考深度 |
| **采样参数** | 支持 `temperature` / `top_p` / `top_k` | 非默认值报 400（API易 实测确认） | 三个都不要传（`temperature` 只能是 1，`top_p` 只能是 0.99，`top_k` 传了就报错） |
| **assistant 预填充** | 关闭思考时支持 | 报 400（关闭思考也一样，API易 实测确认） | `messages` 以 user 结尾；控制输出格式改用结构化输出 |
| **电脑操作** | `computer_20250124` | 只认 `computer_toolset_20260801` | 换成新工具集 |
| **思考块绑定** | 不校验 | 改动 `system` / `tools` / 更早消息后回传思考块报 400 | 会话只追加不改写 |

另有几处不会报错、但会改变结果的变化：

* **响应可能以 `thinking` 块开头**：自适应思考默认开启，即使请求里没提思考也可能返回思考块。按 `type` 取文本块，不要直接读第一个块
* **思考 token 计入 `max_tokens`**：沿用 Haiku 4.5 时设的小 `max_tokens`，可能刚思考完就被截断、一个字都没输出。适当调大或降低 effort
* **思考内容默认不返回**：需要摘要时设置 `thinking: {"type": "adaptive", "display": "summarized"}`
* **强制工具调用可用**：`tool_choice` 为 `any` 或指定工具时不报错（Sonnet 5.5 会报错），但这种情况下模型不思考、直接调工具
* **安全分类器**：拒答时返回 `stop_reason: "refusal"`，且官方**没有**自动回退到其他模型，客户端要自己处理

### 技术规格

| 参数 | 规格 |
| - | - |
| **模型标识** | `claude-haiku-5-5`（API易 另提供 `claude-haiku-5-5-thinking`） |
| **上下文长度** | 1,000,000 tokens |
| **最大输出** | 128,000 tokens |
| **输入 / 输出模态** | 文本、图片 → 文本 |
| **知识截止** | 2026 年 6 月 |
| **思考模式** | 自适应思考，默认开启；`high` 及以下可传 `{"type": "disabled"}` 关闭 |
| **effort 档位** | `low` / `medium` / `high` / `xhigh` / `max`，**默认 `medium`** |
| **分词器** | 与 Claude 4.7 及之后的模型相同，同一段文本比 Haiku 4.5 多约 30％ token |
| **API 格式** | OpenAI 兼容 / Anthropic 原生 |

### API易 实测结果

2026 年 10 月 8 日（UTC+8）在 API易 上实调，结果如下：

| 测试项 | 结果 |
| - | - |
| Anthropic 原生 `/v1/messages` 与 OpenAI 兼容 `/v1/chat/completions` | ✅ 均正常返回，回显模型名 `claude-haiku-5-5`，短问答约 2 秒 |
| 长上下文（单次输入 163,714 tokens） | ✅ 正常返回 |
| 两档计费 | ✅ 输入 78,314 tokens 的请求扣 \$0.007832（低档）；输入 163,714 tokens 的请求扣 \$0.081866，整单按高档计，与官网单价逐项吻合 |
| `effort: "low"` 简单比较题 | ✅ 思考 token 为 0，约 2.4 秒 |
| `effort: "max"` 简短数学证明 | ✅ 输出 1,078 tokens，其中思考 796 tokens，约 6 秒 |
| `thinking: {"type": "disabled"}` | ✅ 正常（与 Sonnet 5.5 不同，Haiku 5.5 可以直接关闭思考） |
| `thinking` 传 `enabled` + `budget_tokens` | ⚠️ 未报错，正常返回；官方文档写明会报 400，建议仍按官方改为自适应思考 |
| `temperature: 0.3` / `top_k` / `top_p` | ❌ 400，报错信息为 `` `temperature` is deprecated for this model ``，两个端点一致 |
| assistant 预填充 | ❌ 400，提示对话必须以 user 消息结尾 |
| `tool_choice: {"type": "any"}` | ✅ 正常，直接返回工具调用，不产生思考块 |
| `claude-haiku-5-5-thinking` | 与基础模型同为自适应思考，简单问题同样不产生思考 token |

<Info>
  **关于参数兼容**：`temperature` / `top_p` / `top_k` 这类基础采样参数很容易被客户端或 SDK 默认带上，新模型一废弃，已有代码升级后就会整批报错。为此，API易 可能对这类已废弃的基础参数做兼容处理（忽略而不报错）。所以，**某个参数在 API易 上没有按官方文档返回 400，并不代表请求没有到达原厂模型**，兼容改变的只是参数的处理方式，模型本身不变。迁移时仍建议按官方要求去掉这三个参数；对输出有疑问，欢迎联系客服核对。
</Info>

## 实际应用

### 推荐场景

1. **分类、抽取、路由**：官方的首要定位。高频、短请求、10 万 tokens 以内，正好落在最便宜的那一档
2. **当大模型的子代理**：在 Opus 5.5 / Sonnet 5.5 主导的编程或研究流程里，负责检索、汇总、取数这类小任务
3. **对话压缩与摘要**：长对话压缩、会议纪要、工单摘要，速度快、单价低
4. **替换 Haiku 4.5**：大多数 Haiku 4.5 负载同价位下能力明显更强、成本更低，但要先按下文核对迁移项

### 代码示例

#### Anthropic 原生格式

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com"
)

message = client.messages.create(
    model="claude-haiku-5-5",
    max_tokens=4000,                   # 思考 token 也计入这里，别设太小
    output_config={"effort": "low"},   # 默认 medium；分类、抽取类任务用 low 就够
    messages=[
        {"role": "user", "content": "把这条工单归类为：账单 / 技术故障 / 账号 / 其他，只输出类别。\n\n工单：充值后余额没到账"}
    ]
)

for block in message.content:          # 按 type 取文本，不要直接读 content[0]
    if block.type == "text":
        print(block.text)
```

#### OpenAI 兼容格式

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="claude-haiku-5-5",
    # 不要传 temperature / top_p / top_k
    messages=[
        {"role": "user", "content": "从下面这段文字里抽取公司名、金额和日期，输出 JSON。"}
    ]
)

print(response.choices[0].message.content)
```

### 从 Haiku 4.5 迁移的六步核对

1. **改模型名**：`claude-haiku-4-5-20251001` → `claude-haiku-5-5`（没有日期后缀）
2. **重新计 token**：新分词器同一段文本多约 30％ token，`max_tokens` 和成本估算都要重算
3. **替换思考配置**：`budget_tokens` 改为自适应思考 + `effort`
4. **去掉采样参数与预填充**：`temperature` / `top_p` / `top_k` 不传，`messages` 以 user 结尾
5. **按 `type` 取内容块**：响应可能以思考块开头
6. **处理拒答**：识别 `stop_reason: "refusal"`，必要时自行回退到其他模型

## 价格与可用性

### 定价信息

原厂公布价格（单位：美元 / 百万 tokens），按单次请求的输入长度分两档：

| 计费项 | Haiku 5.5（≤ 10 万 tokens） | Haiku 5.5（> 10 万 tokens） | Haiku 4.5 |
| - | - | - | - |
| **输入** | **\$0.10** | \$0.50 | \$1.00 |
| **输出** | **\$0.50** | \$2.50 | \$5.00 |
| **缓存写入（5 分钟）** | **\$0.125** | \$0.625 | \$1.25 |
| **缓存写入（1 小时）** | **\$0.20** | \$1.00 | \$2.00 |
| **缓存读取** | **\$0.01** | \$0.05 | \$0.10 |

Haiku 5.5 两列同时就是 API易 的定价：**两档分段、五项计费与官网逐项一致，没有加价**。

<Note>模型价格与官网对齐，且可能随官网调整；上表仅供参考，具体以顶部导航「模型价格」栏目为准：[模型价格](/models/index)。</Note>

<Warning>
  **超过 10 万 tokens 整单按高档计费**：输入超过 10 万 tokens 的请求，所有计费项都按右侧一列算，单价是低档的 5 倍。官方统计约 90％ 的 Haiku 4.5 请求落在 10 万以内；但如果你的负载是整本文档、长会话或大段代码库，高档价格是 Haiku 4.5 的一半，不再是「一成价」。能拆分的长输入建议拆成多次 10 万以内的请求。
</Warning>

<Info>
  \*\*我们的定价与官网一致，不在模型价格上加价。\*\*在此之上，部分分组另有折扣，也可叠加充值加赠活动，这部分是我们的让利，与模型本身的定价无关。

  查看实际扣费请以控制台「缓存计费详情」的实时数据为准，API 回显的 usage 缓存字段不能作为计费依据。
</Info>

### 可用分组与端点

| 项目 | 说明 |
| - | - |
| **模型名** | `claude-haiku-5-5`（另有 `claude-haiku-5-5-thinking`） |
| **可用分组** | `default` / `svip` / `ClaudeCode` / `Claude_Enterprise` |
| **OpenAI 兼容格式** | `https://api.apiyi.com/v1` |
| **Anthropic 原生格式** | `https://api.apiyi.com` |

<Info>
  `ClaudeCode` 分组用于 Claude Code 等 Anthropic 原生协议客户端，另有折扣，可与充值加赠叠加。`Claude_Enterprise` 是 10 月 7 日新增的企业分组（倍率 1.2x，仅走 Anthropic 官方通道），详见 [实时动态](/live/2026-10/claude-enterprise-group)。**协议与分组要配套选**：走 Anthropic 原生协议请使用 `ClaudeCode` 分组，走 OpenAI 兼容协议请使用 `default` / `svip` 分组。
</Info>

### 叠加网站充值活动

可结合 API易 充值加赠活动进一步降低实际成本，详见：[充值优惠说明](/faq/recharge-promotions)。

## 总结与建议

Claude Haiku 5.5 把小模型的价格又往下压了一个数量级，能力却比 Haiku 4.5 跨了一代：电脑操作接近 Sonnet 5.5，官方列出的各项评测都领先同价位的 GPT-6 Luna。对分类、抽取、摘要、子代理这类跑量负载，它是目前 Claude 家族里最划算的选择。

**使用建议**：

1. **正在用 Haiku 4.5 的用户**：建议升级，但先按六步核对，尤其是采样参数、预填充和 `budget_tokens` 这三处会直接报 400
2. **用 Sonnet / Opus 跑窄任务的用户**：把检索、汇总、分类这类子任务拆给 Haiku 5.5，主模型只负责决策，整体成本能降不少
3. **控制成本**：effort 从 `low` / `medium` 起步；单次输入尽量控制在 10 万 tokens 以内，避开 5 倍单价的高档

<Info>
  信息来源：Anthropic 官方发布页 `anthropic.com/claude-haiku-5-5`；Anthropic 开发者文档 `platform.claude.com/docs/en/models/haiku-5-5/overview`、`whats-new-haiku-5-5` 与 `migration-guide`；Artificial Analysis 模型页 `artificialanalysis.ai/models/claude-haiku-5-5`；MarkTechPost 等媒体报道；「API易 实测结果」一节为 2026 年 10 月 8 日本站实调所得。API易定价以平台实时数据为准。数据获取时间：2026 年 10 月 8 日。
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.