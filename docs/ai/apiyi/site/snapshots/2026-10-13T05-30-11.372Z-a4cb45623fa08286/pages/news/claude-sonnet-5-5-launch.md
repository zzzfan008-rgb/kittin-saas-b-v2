> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Sonnet 5.5 上线：编程追平 Opus 5.5，价格不变

> Anthropic 于 2026 年 9 月 28 日发布 Claude Sonnet 5.5，Terminal-Bench 4.0 达 70.6%、知识工作与 Opus 5.5 基本持平，定价维持 $2/$10 每百万 tokens。API易已上线 claude-sonnet-5-5，四项计费与官网一致。

## 核心要点

* **Sonnet 档价格，Opus 档能力**：官方公布 Terminal-Bench 4.0 得分 **70.6%**，高于 Opus 5.5 的 66.4%；GDPval-AA 知识工作 1844，与 Opus 5.5 的 1846 基本持平
* **价格不变**：输入 \$2 / 输出 \$10 每百万 tokens，缓存读取 \$0.20，与 Sonnet 5 完全相同，只有 Opus 5.5 的一半
* **更快、更省 token**：官方口径是生成速度比 Sonnet 5 快 30％ 以上，完成同样任务用的 token 更少，单任务成本最多低约 30％
* **API易 已上线**：`claude-sonnet-5-5` 与 `claude-sonnet-5-5-thinking`，OpenAI 兼容与 Anthropic 原生双端点，四项计费与官网逐项一致
* **五项破坏性变更**：`thinking: disabled` 报 400（改用 `between_tools`）、强制工具调用报 400、思考块与模型和会话绑定、电脑操作只认新工具集、advisor 搭配收紧；另外 `top_p` / `top_k` 不再支持，API易 实测传了会直接报错

## 背景介绍

2026 年 9 月 28 日，Anthropic 发布 Claude Sonnet 5.5，这是 Claude 5.5 系列的第二款模型，排在一周前上线的 [Opus 5.5](/news/claude-opus-5-5-launch) 之后。官方同时表示 Haiku 5.5 会在未来几周推出。

Sonnet 系列的定位一直是「日常主力」：速度快、价格适中。三个月前的 [Sonnet 5](/news/claude-sonnet-5-launch) 已经把能力推到接近 Opus 4.8，而这一次 Sonnet 5.5 与 Opus 5.5 同源训练，**在 Agent 编程上反超了自家旗舰**，知识工作基准也只差 2 分，价格却只有 Opus 5.5 的一半。

官方把它最擅长的方向概括为：范围明确的日常任务、修 Bug，以及产出成品质量的文档、幻灯片与表格。它也是第一款只看屏幕截图就通关《宝可梦 红》的 Sonnet 模型，官方以此说明其长周期任务与图像理解能力。

API易 已同步上线 `claude-sonnet-5-5`（同时提供 `claude-sonnet-5-5-thinking`），**输入、输出、缓存写入、缓存读取四项计费全部与官网一致**。

## 详细解析

### 核心特性

<CardGroup cols={2}>
  <Card title="Agent 编程超过 Opus 5.5" icon="trophy">
    Terminal-Bench 4.0 官方分 70.6%，高于 Opus 5.5 的 66.4%；CursorBench 4.0 从 Sonnet 5 的 34.1% 升到 55.5%
  </Card>

  <Card title="更快、更少 token" icon="gauge">
    生成速度比 Sonnet 5 快 30％ 以上；早期测试者反馈它会把工具调用合并成更少的步骤
  </Card>

  <Card title="1M 上下文" icon="scroll-text">
    100 万 tokens 上下文，128K 最大输出，分词器与 Sonnet 5 相同，同一段文本 token 数不变
  </Card>

  <Card title="知识工作追平旗舰" icon="briefcase">
    GDPval-AA 1844、AA-Briefcase 1811，与 Opus 5.5（1846 / 1822）几乎持平，比 Sonnet 5 高出约 400 分
  </Card>
</CardGroup>

### 性能基准（厂商自报）

| 评测项目 | Sonnet 5.5 | Opus 5.5 | Sonnet 5 | GPT-6 Sol |
| - | - | - | - | - |
| **Terminal-Bench 4.0**（Agent 编程） | **70.6%** | 66.4% | 10.3% | — |
| **FrontierCode 1.1**（Main） | 46.2% | **54.4%** | 42.4% | 49.3% |
| **CursorBench 4.0** | 55.5% | **57.8%** | 34.1% | — |
| **GDPval-AA v2.1**（知识工作，Elo） | 1844 | **1846** | 1449 | 1487 |
| **AA-Briefcase v1.1** | 1811 | **1822** | 1359 | 1483 |
| **Humanity's Last Exam**（带工具） | 64.5% | **67.7%** | 54.9% | — |
| **OSWorld 2.1**（电脑操作） | 80.1% | **81.8%** | 57.0% | — |
| **Chartography**（图表理解，无工具） | 61.6% | **64.4%** | 15.6% | 53.6% |

<Info>
  数据来源：Anthropic 官方发布页 `anthropic.com/claude-sonnet-5-5`（2026 年 9 月 28 日）。官方脚注：Opus 5.5 的 Terminal-Bench 分数为 xhigh effort，FrontierCode 为 max effort；GPT-6 Sol 的部分分数因对方近期修复 bug 已过时。数据获取时间：2026 年 9 月 30 日。
</Info>

### 独立评测（Artificial Analysis）

同一项基准，独立评测给出的分数比厂商自报低，但**相对排序一致**：

| 评测项目 | Sonnet 5.5 | Opus 5.5 | 来源 |
| - | - | - | - |
| **Terminal-Bench 4.0** | 63.6% | 59.6% | Artificial Analysis |
| **Terminal-Bench 4.0** | 70.6% | 66.4% | Anthropic 官方 |

<Warning>
  **单价低不等于单任务便宜**：Artificial Analysis 测得 Sonnet 5.5 在 max effort 下平均每个测试任务消耗约 **19.3 万 tokens**，是其测过的模型里最高的。Sonnet 5.5 的默认 effort 是 `high`，如果你一路开到 `xhigh` / `max`，token 用量上涨会抵消单价优势。日常任务建议从 `medium` 或 `high` 起步，不要默认拉满。
</Warning>

### 开发者须知：破坏性变更

Sonnet 5.5 沿用 Sonnet 5 的请求结构，但下面几处会直接报错或改变响应形状，迁移前务必核对：

| 变更 | Sonnet 5 | Sonnet 5.5 | 怎么改 |
| - | - | - | - |
| **关闭思考** | 可传 `{"type": "disabled"}` | `disabled` 报 400（API易 实测确认） | 改传 `{"type": "between_tools"}`，只能配 `low` / `medium` / `high` effort |
| **强制工具调用** | 支持 `any` / `tool` | `tool_choice` 为 `any` / `tool` 报 400 | 改用 `auto` + `strict: true`，或改用结构化输出，并在提示词里写明何时调用工具 |
| **思考块绑定** | 不绑定会话前缀 | 思考块与模型、会话前缀、账号绑定 | 历史只追加不改写，思考块原样回传 |
| **电脑操作** | 支持 `computer_20251124` | 只认 `computer_toolset_20260801` | 换成新工具集 |
| **advisor 工具** | 可用 Opus 4.8 / 4.7 / Sonnet 5 做 advisor | 上述三款做 advisor 报 400 | 换成 Opus 5 / 5.5、Fable 系列或 Sonnet 5.5 本身 |

<Warning>
  **`top_p` / `top_k` 会报错**：官方文档写明 Sonnet 5.5 不接受非默认的 `temperature` / `top_p` / `top_k`。API易 实测（2026-09-30）：`top_p`、`top_k` 在 Anthropic 原生与 OpenAI 兼容两个端点都会被拒，报错信息为 `` `top_p` is deprecated for this model ``，**状态码显示为 429 但不是限流**，重试无效，去掉参数即可；`temperature` 传任意值都正常返回 200，但不会生效。建议切换前在客户端里把这三个参数一并去掉。
</Warning>

另有两处不会导致报错的变化：

* **工具调用之间的进度文字改走 `thinking` 块**：默认 `display: "omitted"` 时内容为空，如果你的界面会把这段文字流式展示给用户，切换后会在工具调用之间「沉默」；改用 `between_tools` 或设置 `thinking.display` 即可恢复
* **安全分类器**：拒答时返回 HTTP 200 + `stop_reason: "refusal"`，`stop_details` 分五类（`cyber` / `bio` / `frontier_llm` / `reasoning_extraction` / `general_harms`）。这是第一款带网络安全与防蒸馏分类器的 Sonnet，网络安全类高风险请求会由官方回退到 Sonnet 5 处理

### 技术规格

| 参数 | 规格 |
| - | - |
| **模型标识** | `claude-sonnet-5-5`（API易 另提供 `claude-sonnet-5-5-thinking`） |
| **上下文长度** | 1,000,000 tokens |
| **最大输出** | 128,000 tokens |
| **输入 / 输出模态** | 文本、图片 → 文本 |
| **知识截止** | 2026 年 6 月 |
| **思考模式** | 自适应思考默认开启，最低档为 `between_tools` |
| **effort 档位** | `low` / `medium` / `high` / `xhigh` / `max`，**默认 `high`** |
| **最小可缓存长度** | 512 tokens（Sonnet 5 为 1,024） |
| **API 格式** | OpenAI 兼容 / Anthropic 原生 |

### API易 实测结果

2026 年 9 月 30 日（UTC+8）在 API易 上实调，结果如下：

| 测试项 | 结果 |
| - | - |
| Anthropic 原生 `/v1/messages` 与 OpenAI 兼容 `/v1/chat/completions` | ✅ 均正常返回，回显模型名 `claude-sonnet-5-5` |
| `thinking: {"type": "disabled"}` | ❌ 400，报错信息提示改用 `between_tools` |
| `between_tools` + `effort: "low"` | ✅ 正常 |
| `between_tools` + `effort: "max"` | ❌ 400，提示 effort 需为 `high` 及以下 |
| `tool_choice: {"type": "any"}` | ❌ 400，`tool_choice: type "tool" and "any" are not supported` |
| `top_p` / `top_k` | ❌ 报错（显示为 429，实为参数不支持，非限流），两个端点一致 |
| `temperature` | ⚠️ 任意值均返回 200，但不生效 |
| 简单问答（默认 `high` effort） | 自适应思考判断无需思考，`thinking_tokens` 为 0，约 3 秒返回 |
| 数学证明题（`effort: "max"`） | 思考 8,724 tokens，总输出 9,980 tokens，耗时约 60 秒 |
| `claude-sonnet-5-5-thinking` | 与基础模型同为自适应思考；思考内容默认不返回（`display` 为 omitted），思考 token 照常计费 |

最后两行说明了成本差异：同一个模型，简单问题几乎不产生思考 token，难题在 `max` 档下一次就能思考近万 tokens。effort 档位对账单的影响远大于单价。

## 实际应用

### 推荐场景

1. **日常主力编程**：修 Bug、仓库级小改动、终端类 Agent 任务，Terminal-Bench 4.0 是这次提升最大的方向
2. **文档、幻灯片与表格产出**：官方重点强调的方向，AA-Briefcase 与 GDPval-AA 都接近 Opus 5.5
3. **高频 Agent 与客服流程**：速度更快、工具调用步骤更少，适合对延迟敏感的多轮工具调用
4. **替换 Sonnet 5 与部分 Opus 5.5 负载**：同价升级 Sonnet 5；Opus 5.5 上范围明确的任务可以先切过来评测，成本约为一半

### 代码示例

#### Anthropic 原生格式

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com"
)

message = client.messages.create(
    model="claude-sonnet-5-5",
    max_tokens=32000,
    output_config={"effort": "medium"},  # 默认 high；明确的 Agent 编程任务官方建议从 medium 起步
    messages=[
        {"role": "user", "content": "定位这个测试失败的根因，给出最小修复补丁。"}
    ]
)

for block in message.content:
    if block.type == "text":
        print(block.text)
```

#### 关闭前置思考（替代原来的 disabled）

```python theme={null}
message = client.messages.create(
    model="claude-sonnet-5-5",
    max_tokens=8000,
    thinking={"type": "between_tools"},  # 传 disabled 会报 400
    output_config={"effort": "low"},      # between_tools 只能配 low / medium / high
    messages=[{"role": "user", "content": "把这段话改写得更简洁。"}]
)
```

#### OpenAI 兼容格式

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="claude-sonnet-5-5",
    # 不要传 top_p / top_k（会报错）；temperature 传了也不生效
    messages=[
        {"role": "user", "content": "审查这段代码，指出潜在 Bug 与改进点。"}
    ]
)

print(response.choices[0].message.content)
```

### 从 Sonnet 5 迁移的六步核对

1. **改模型名**：`claude-sonnet-5` → `claude-sonnet-5-5`
2. **替换关闭思考的配置**：`thinking: {"type": "disabled"}` 改为 `between_tools`，且 effort 不能超过 `high`
3. **删掉强制工具调用**：`tool_choice` 改为 `auto`，配合 `strict: true` 保证入参合法
4. **去掉采样参数**：`top_p` / `top_k` 会直接报错，`temperature` 不生效，三个都不要传；手动思考预算 `budget_tokens` 也不再使用，改用 `effort` 控制思考深度
5. **重新校准 effort**：同一档位的思考量和 Sonnet 5 不同，建议重新跑一遍评测，不要沿用旧设置
6. **保证历史只追加**：思考块原样回传，别在请求之间改 `system` / `tools` / 更早的消息

## 价格与可用性

### 定价信息

原厂公布价格（单位：美元 / 百万 tokens）：

| 计费项 | Sonnet 5.5 | Sonnet 5 | Opus 5.5 |
| - | - | - | - |
| **输入** | **\$2.00** | \$2.00 | \$4.00 |
| **输出** | **\$10.00** | \$10.00 | \$20.00 |
| **缓存写入（5 分钟）** | **\$2.50** | \$2.50 | \$5.00 |
| **缓存读取** | **\$0.20** | \$0.20 | \$0.20 |

Sonnet 5.5 一列同时就是 API易 的定价：**四项计费与官网逐项一致，没有加价**。

<Note>模型价格与官网对齐，且可能随官网调整；上表仅供参考，具体以顶部导航「模型价格」栏目为准：[模型价格](/models/index)。</Note>

<Info>
  \*\*我们的定价与官网一致，不在模型价格上加价。\*\*在此之上，部分分组另有折扣，也可叠加充值加赠活动，这部分是我们的让利，与模型本身的定价无关。

  查看实际扣费请以控制台「缓存计费详情」的实时数据为准，API 回显的 usage 缓存字段不能作为计费依据。
</Info>

### 可用分组与端点

| 项目 | 说明 |
| - | - |
| **模型名** | `claude-sonnet-5-5`（另有 `claude-sonnet-5-5-thinking`） |
| **可用分组** | `default` / `svip` / `ClaudeCode` |
| **OpenAI 兼容格式** | `https://api.apiyi.com/v1` |
| **Anthropic 原生格式** | `https://api.apiyi.com` |

<Info>
  `ClaudeCode` 分组用于 Claude Code 等 Anthropic 原生协议客户端。**协议与分组要配套选**：走 Anthropic 原生协议请使用 `ClaudeCode` 分组，走 OpenAI 兼容协议请使用 `default` / `svip` 分组。该分组另有折扣，可与充值加赠叠加。
</Info>

Sonnet 5.5 支持零数据保留，**不受** Fable 系列 30 天数据保留要求的限制。

### 叠加网站充值活动

可结合 API易 充值加赠活动进一步降低实际成本，详见：[充值优惠说明](/faq/recharge-promotions)。

## 总结与建议

Claude Sonnet 5.5 是一次「同价升级」：价格与 Sonnet 5 完全一样，Agent 编程反超 Opus 5.5，知识工作与旗舰只差 2 分，速度还快了三成。对大多数日常编程与文档类负载，它是目前 Claude 家族里性价比最高的选择。

**使用建议**：

1. **正在用 Sonnet 5 的用户**：直接升级，但先按上面六步核对，尤其是 `disabled` → `between_tools`、强制工具调用和采样参数这三处
2. **正在用 Opus 5.5 的用户**：范围明确的编程与文档任务可以先切到 Sonnet 5.5 评测，成本约为一半；复杂架构决策与长链路研究仍建议留在 Opus 5.5
3. **控制成本**：effort 不要默认拉到 `max`，从 `medium` / `high` 起步，看效果再上调

<Info>
  信息来源：Anthropic 官方发布页 `anthropic.com/claude-sonnet-5-5`；Anthropic 开发者文档 `platform.claude.com/docs/en/models/sonnet-5-5/overview` 与 `whats-new-sonnet-5-5`；Artificial Analysis 独立评测（转引自 Decrypt）；SiliconANGLE、Unite.AI、Help Net Security 等媒体报道；「API易 实测结果」一节为 2026 年 9 月 30 日本站实调所得。API易定价以平台实时数据为准。数据获取时间：2026 年 9 月 30 日。
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.