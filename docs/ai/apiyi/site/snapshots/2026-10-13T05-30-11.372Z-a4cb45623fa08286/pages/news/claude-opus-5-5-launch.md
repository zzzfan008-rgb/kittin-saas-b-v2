> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Opus 5.5 上线：Fable 级表现，比 Opus 5 更便宜

> Anthropic 于 2026 年 9 月 22 日发布 Claude Opus 5.5，多项编程与知识工作基准超过 Fable 5.1，定价降至 $4/$20 每百万 tokens，缓存读取 $0.20。API易已上线 claude-opus-5-5，四项计费与官网一致。

## 核心要点

* **Fable 级表现，Opus 级价格**：Terminal-Bench 4.0 得分 **66.4%**，高于 Fable 5.1 的 55.8% 与 Opus 5 的 52.3%；多数编程、知识工作与电脑操作基准都超过 Fable 5.1
* **全线降价**：输入 \$4 / 输出 \$20 每百万 tokens（Opus 5 为 \$5 / \$25），缓存读取从 \$0.50 降到 **\$0.20**，官方称典型负载综合成本比 Opus 5 低约 40％
* **输出更快**：官方口径是生成速度比 Opus 5 快 30％ 以上
* **API易 已上线**：`claude-opus-5-5` 与 `claude-opus-5-5-thinking` 两个模型名，OpenAI 兼容与 Anthropic 原生双端点，四项计费与官网逐项一致
* **四项破坏性变更**：思考无法关闭、强制工具调用报 400、思考块与模型和会话绑定、电脑操作只认新工具集；effort 默认值从 `high` 降为 `medium`

## 背景介绍

2026 年 9 月 22 日，Anthropic 发布 Claude Opus 5.5，这是 Claude 5.5 系列的第一款模型，接替两个月前上线的 Opus 5。官方同时预告 Sonnet 5.5 与 Haiku 5.5 会陆续推出。

这次发布的定位很明确：**在大多数工作上达到 Fable 5.1 的水平，而价格还低于 Opus 5**。Fable 5.1 定价 \$10 / \$50，Opus 5.5 只有它的四成；和 Opus 5 相比，输入输出各降 20％，缓存读取降 60％。

对长周期 Agent 会话来说，缓存读取是反复发生的开销，这一项从 \$0.50 降到 \$0.20，是这次降价里对账单影响最直接的一项。

API易 已同步上线 `claude-opus-5-5`（同时提供 `claude-opus-5-5-thinking`），**输入、输出、缓存写入、缓存读取四项计费全部与官网一致**。

## 详细解析

### 核心特性

<CardGroup cols={2}>
  <Card title="超过 Fable 5.1 的编程能力" icon="trophy">
    Terminal-Bench 4.0、FrontierCode、CursorBench 三项 Agent 编程基准全部领先 Fable 5.1 与 Opus 5
  </Card>

  <Card title="更低的运行成本" icon="piggy-bank">
    输入输出降 20％，缓存读取降 60％；官方称典型负载比 Opus 5 省约 40％
  </Card>

  <Card title="1M 上下文" icon="scroll-text">
    与 Opus 5 相同：100 万 tokens 上下文（默认即最大），128K 最大输出，分词器不变
  </Card>

  <Card title="更安全的 Agent 行为" icon="shield-check">
    官方行为审计中表现最好的模型；尝试越过边界的频率比 Opus 5 低约 85％
  </Card>
</CardGroup>

### 性能亮点

| 评测项目 | Opus 5.5 | Fable 5.1 | Opus 5 | GPT-6 Astra |
| - | - | - | - | - |
| **Terminal-Bench 4.0**（Agent 编程） | **66.4%** | 55.8% | 52.3% | 57.9% |
| **FrontierCode v1.1** | **54.4%** | 50.3% | 48.0% | 53.3% |
| **CursorBench 4.0** | **57.8%** | 51.8% | 46.6% | — |
| **GDPval-AA v2.1**（知识工作，Elo） | **1846** | 1735 | 1708 | 1542 |
| **AutomationBench** | 40.0% | 31.4% | 26.9% | **41.4%** |
| **Humanity's Last Exam**（带工具） | **67.7%** | 65.6% | 63.6% | — |
| **OSWorld 2.0**（电脑操作） | **81.8%** | 80.7% | 74.0% | — |

<Info>
  数据来源：Anthropic 官方发布页 `anthropic.com/claude-opus-5-5`（2026 年 9 月 22 日），官方基准多在 max effort 下测得。数据获取时间：2026 年 9 月 23 日。
</Info>

官方还给了几个实际案例：一位测试者在一天之内完成了 68 万行代码的迁移；审计一个 20 万行代码库，Opus 5.5 用时不到 3 小时，Opus 5 需要 20 小时以上。

### 开发者须知：四项破坏性变更

Opus 5.5 沿用 Opus 5 的请求结构，但有四处会直接报错或改变行为，从 Opus 5 迁移前务必核对：

| 变更 | Opus 5 | Opus 5.5 | 怎么改 |
| - | - | - | - |
| **思考无法关闭** | `effort` 为 `high` 及以下时可传 `disabled` | `{"type": "disabled"}` 与 `budget_tokens` 一律 400 | 省略 `thinking`，用 `effort: "low"` 压低延迟与成本 |
| **强制工具调用** | 支持 `any` / `tool` | `tool_choice` 为 `any` / `tool` 报 400 | 改用 `auto` + 提示词点名工具 + `strict: true`，或改用结构化输出 |
| **思考块绑定** | 不绑定 | 思考块与模型、会话前缀绑定 | 历史只追加不改写，思考块原样回传 |
| **电脑操作** | 支持 `computer_20251124` | 只认 `computer_toolset_20260801` | 换成新工具集 |

<Warning>
  **effort 默认值变了**：Opus 5 默认 `high`，Opus 5.5 默认 `medium`。如果你原来依赖默认值跑编程或 Agent 任务，请在请求里显式写上 `effort`，否则效果可能不如预期。思考 token 同样计入 `max_tokens`，长 Agent 回合建议给到 64K。
</Warning>

另有两处不会导致报错的变化：

* 工具调用之间写给用户看的进度文字，现在以 `thinking` 块返回（默认为空，设 `thinking.display: "updates"` 可以看到）
* 安全分类器范围扩大：在网络安全之外，生物和「套取推理过程」两类请求也可能被拒答（`stop_reason: "refusal"`）；网络安全类高风险请求会被官方转给 Claude Opus 4.8 处理

### 技术规格

| 参数 | 规格 |
| - | - |
| **模型标识** | `claude-opus-5-5`（API易 另提供 `claude-opus-5-5-thinking`） |
| **上下文长度** | 1,000,000 tokens（默认即最大） |
| **最大输出** | 128,000 tokens |
| **知识截止** | 2026 年 6 月 |
| **思考模式** | 自适应思考恒开，通过 `effort` 控制深度 |
| **effort 档位** | `low` / `medium` / `high` / `xhigh` / `max`，**默认 `medium`** |
| **API 格式** | OpenAI 兼容 / Anthropic 原生 |

## 实际应用

### 推荐场景

1. **Agent 编程**：大规模代码迁移、仓库级重构、终端自动化任务，是这次提升最大的方向
2. **知识工作**：报告撰写、资料研究、表格与文档产出，GDPval-AA 分数领先明显
3. **电脑操作与自动化**：OSWorld 2.0 得分 81.8%，适合浏览器与桌面流程自动化
4. **替换 Fable 5.1 的大部分负载**：非极限推理场景下，用四成价格拿到相当甚至更好的结果

### 代码示例

#### Anthropic 原生格式

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com"
)

message = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=64000,
    output_config={"effort": "high"},  # 默认是 medium，编程任务建议显式调高
    messages=[
        {
            "role": "user",
            "content": "把这个模块从回调风格迁移到 async/await，补齐测试，并说明每一步的取舍。"
        }
    ]
)

for block in message.content:
    if block.type == "text":
        print(block.text)
```

#### OpenAI 兼容格式

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="claude-opus-5-5",
    messages=[
        {"role": "user", "content": "一步步定位这个生产环境 Bug 的根因，并给出修复方案。"}
    ]
)

print(response.choices[0].message.content)
```

### 从 Opus 5 迁移的五步核对

1. **改模型名**：`claude-opus-5` → `claude-opus-5-5`
2. **删掉关闭思考的配置**：移除 `thinking: {"type": "disabled"}`，需要低延迟就把 `effort` 设为 `low`
3. **删掉强制工具调用**：`tool_choice` 改为 `auto`，并检查回复里确实有工具调用，没有就重试
4. **显式设置 effort**：默认值降到了 `medium`，编程与 Agent 任务建议从 `high` 或 `xhigh` 起步
5. **保证历史只追加**：思考块原样回传，别在请求之间改 `system` / `tools` / 更早的消息

## 价格与可用性

### 定价信息

原厂公布价格（单位：美元 / 百万 tokens）：

| 计费项 | Opus 5.5 | Opus 5 | 变化 |
| - | - | - | - |
| **输入** | **\$4.00** | \$5.00 | ↓ 20％ |
| **输出** | **\$20.00** | \$25.00 | ↓ 20％ |
| **缓存写入（5 分钟）** | **\$5.00** | \$6.25 | ↓ 20％ |
| **缓存读取** | **\$0.20** | \$0.50 | ↓ 60％ |

上表同时就是 API易 的定价：**四项计费与官网逐项一致，没有加价**。

<Info>
  \*\*我们的定价与官网一致，不在模型价格上加价。\*\*在此之上，部分分组另有折扣，也可叠加充值加赠活动，这部分是我们的让利，与模型本身的定价无关。

  查看实际扣费请以控制台「缓存计费详情」的实时数据为准，API 回显的 usage 缓存字段不能作为计费依据。
</Info>

### 可用分组与端点

| 项目 | 说明 |
| - | - |
| **模型名** | `claude-opus-5-5`（另有 `claude-opus-5-5-thinking`） |
| **可用分组** | `default` / `svip` / `ClaudeCode` |
| **OpenAI 兼容格式** | `https://api.apiyi.com/v1` |
| **Anthropic 原生格式** | `https://api.apiyi.com` |

<Info>
  `ClaudeCode` 分组用于 Claude Code 等 Anthropic 原生协议客户端。**协议与分组要配套选**：走 Anthropic 原生协议请使用 `ClaudeCode` 分组，走 OpenAI 兼容协议请使用 `default` / `svip` 分组。该分组另有折扣，可与充值加赠叠加。
</Info>

Opus 5.5 支持零数据保留，**不受** Fable 系列 30 天数据保留要求的限制。

### 叠加网站充值活动

可结合 API易 充值加赠活动进一步降低实际成本，详见：[充值优惠说明](/faq/recharge-promotions)。

## 总结与建议

Claude Opus 5.5 是一次「降价换代」：价格比 Opus 5 更低，能力却在多数编程与知识工作基准上超过了定价高一倍多的 Fable 5.1，缓存读取降 60％ 对长会话尤其友好。

**使用建议**：

1. **正在用 Opus 5 的用户**：换模型名即可升级，但先按上面五步核对，尤其是关闭思考、强制工具调用和 effort 默认值这三处
2. **正在用 Fable 5.1 的用户**：大多数负载可以先切到 Opus 5.5 做一轮评测，成本约为原来的四成
3. **编程 / Agent 工作流**：effort 显式设为 `high` 或 `xhigh`，`max_tokens` 给足思考空间

<Info>
  信息来源：Anthropic 官方发布页 `anthropic.com/claude-opus-5-5`、Anthropic API 迁移文档，以及 TechCrunch、MacRumors 等媒体报道。API易定价以平台实时数据为准。数据获取时间：2026 年 9 月 23 日。
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.