> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Fable 5.1 上线：同价升级，缓存读取降至四分之一

> Anthropic 于 2026 年 9 月 1 日发布 Claude Fable 5.1，输入输出维持 $10/$50 每百万 tokens，缓存读取从 $1.00 降至 $0.25。API易已上线 claude-fable-5-1 与 claude-fable-5-1-thinking，全部计费项与官网一致，支持 OpenAI 与 Anthropic 双端点。注意三项破坏性变更与 30 天数据保留合规要求。

## 核心要点

* **同价升级**：输入 \$10 / 输出 \$50 每百万 tokens，与 Fable 5 完全一致，能力却全面上台阶
* **缓存读取只要四分之一**：缓存读取从 \$1.00 降至 **\$0.25 / 百万 tokens**（0.025× 基础输入价，其余 Claude 模型是 0.1×），长会话 Agent 的重复读取成本大幅下降。**API易 已同步下调，与官网一致**
* **硬指标跨越式提升**：Terminal-Bench-Science 从 24.7% 提升到 **52.6%**，AutomationBench 从 17.1% 提升到 **31.4%**，均为翻倍级别
* **⚠️ 三项破坏性变更**：强制工具调用（`tool_choice` 为 `any` / `tool`）直接报 400、思考块与模型绑定、编辑历史消息会让思考块失效——从 Fable 5 迁移前必读
* **API易 已上线**：`claude-fable-5-1` 与 `claude-fable-5-1-thinking` 两个模型名均可用，OpenAI 兼容格式与 Anthropic 原生格式双端点，`default` / `svip` / `ClaudeCode` 分组均已开放

## 背景介绍

2026 年 9 月 1 日，Anthropic 发布 Claude Fable 5.1 与 Claude Mythos 5.1，这是 Mythos 级模型线自 6 月 9 日 Fable 5 上线以来的首次迭代。官方把这两款模型定位为「面向编程与知识工作的最先进模型」。

与常见的「换代涨价」不同，Fable 5.1 的输入输出价格与 Fable 5 **完全持平**，唯一的价格变化是缓存读取**下调 75%**。官方给出的口径是：在低 / 中 effort 档位下，Fable 5.1 能以**明显更低的成本**取得与 Fable 5 相当甚至更好的结果；典型负载综合成本约降 25%，Agent 类任务最高可降 45%。

Fable 5.1 与 Mythos 5.1 是**同一个模型的两种安全护栏配置**：Mythos 5.1 仅向 Project Glasswing 的少量审核客户开放，公开可用的是 Fable 5.1。

API易 已同步上线 `claude-fable-5-1` 与 `claude-fable-5-1-thinking`，**输入、输出、缓存读取、缓存创建四项计费全部与官网一致**，缓存读取也已同步下调到 \$0.25。

## 详细解析

### 核心能力提升

<CardGroup cols={2}>
  <Card title="长周期 Agent 编程" icon="code">
    多文件特性开发、大规模重构与迁移、跨会话代码审查，可持续运行数小时
  </Card>

  <Card title="文档 / 表格 / 幻灯片" icon="file-text">
    从一个问题直接产出成品文档、带活公式的电子表格、从空白页搭起的演示文稿
  </Card>

  <Card title="研究与搜索" icon="search">
    多步网页研究与深度研究任务准确率提升，会针对发现的线索继续追问
  </Card>

  <Card title="视觉理解" icon="image">
    读懂 PDF 里嵌套的密集图表、财报与表格，支持对图表做裁剪放大
  </Card>

  <Card title="长上下文" icon="scroll">
    在完整 100 万 token 上下文里做跨段落推理与信息串联
  </Card>

  <Card title="计算机操作" icon="monitor">
    操作浏览器与桌面应用更稳，失败步骤后的自我恢复能力更强
  </Card>
</CardGroup>

### 性能亮点

官方公布的对比数据（Fable 5.1 vs Fable 5 vs Opus 5）：

| 基准测试                           | Fable 5.1 | Fable 5 | Opus 5 | 说明          |
| ------------------------------ | --------- | ------- | ------ | ----------- |
| **Terminal-Bench-Science 0.1** | **52.6%** | 24.7%   | 29.0%  | Agent 式科研任务 |
| **Terminal-Bench 4.0**         | **55.8%** | 42.0%   | 52.3%  | Agent 式编程   |
| **AutomationBench**            | **31.4%** | 17.1%   | 26.9%  | 商业工作流自动化    |
| **GDPval-AA v2**               | **1853**  | 1723    | 1824   | 知识工作（分值）    |
| **OSWorld 2.0（宽松）**            | **77.9%** | 72.9%   | 75.4%  | 计算机操作       |
| **OSWorld 2.0（严格）**            | **41.7%** | 36.1%   | 39.6%  | 计算机操作       |
| **Humanity's Last Exam（无工具）**  | **60.9%** | 57.8%   | 56.6%  | 跨学科推理       |
| **Humanity's Last Exam（带工具）**  | **65.0%** | 63.8%   | 63.6%  | 跨学科推理       |
| **CursorBench 3.2.0**          | **73.4%** | 70.5%   | 70.0%  | Agent 式编程   |

其中 Terminal-Bench-Science 与 AutomationBench 是**翻倍级别**的提升，这两项恰好对应「长链路科研代理」和「业务流程自动化」两类落地场景。多语言表现与 Fable 5 持平。

### 技术规格

| 参数            | 规格                                                     |
| ------------- | ------------------------------------------------------ |
| **模型标识**      | `claude-fable-5-1` / `claude-fable-5-1-thinking`       |
| **上下文窗口**     | 1,000,000 tokens（默认即最大，全窗口统一单价）                        |
| **最大输出**      | 128,000 tokens                                         |
| **思考模式**      | 自适应思考恒开，通过 `effort` 参数控制深度                             |
| **effort 档位** | `low` / `medium` / `high` / `x-high` / `max`，默认 `high` |
| **分词器**       | 与 Fable 5 相同（Opus 4.7 起启用），比更早模型同文本多约 30% tokens       |
| **数据保留**      | 输入 / 输出保留 30 天（滥用检测用途）                                 |
| **API 格式**    | OpenAI 兼容 / Anthropic 原生                               |

## ⚠️ 三项破坏性变更（迁移必读）

<Warning>
  如果你已经在调用 `claude-fable-5`，下面三点会直接导致报错或行为变化，改模型名之前请先核对。
</Warning>

### 1. 不再支持强制工具调用

`tool_choice` 设为 `{"type": "any"}` 或 `{"type": "tool", "name": "..."}` 会返回 400 `invalid_request_error`：

```text theme={null}
tool_choice: type "tool" and "any" are not supported for this model.
```

`{"type": "auto"}`（默认）与 `{"type": "none"}` 不受影响。同样的校验也适用于 token 计数端点。

原因是这两款模型的思考恒开，强制工具调用会跳过思考过程，模型会把推理写进工具参数里，反而降低参数质量。

**替代方案**：保持 `tool_choice: {"type": "auto"}`，需要 schema 合法的 JSON 就配合严格工具调用（`strict: true`）或结构化输出；想让模型必定调用某个工具，在提示词里明确说明触发条件即可（例如「用 `get_weather` 工具来回答」），Fable 5.1 对显式工具指令的遵循度很高。

### 2. 思考块与产出它的模型绑定

每个思考块都记录了产出它的模型，且**只能单向继承**：Fable 5.1 能读更早模型的思考块，更早的模型读不了 Fable 5.1 的。

这意味着：会话从 Opus 5 / Fable 5 迁到 Fable 5.1，推理链保留；反过来从 Fable 5.1 切回这些模型，那些轮次的推理会丢失。当请求带了目标模型读不了的块时，API 会在模型看到之前静默丢弃，被丢弃的块不计入 `input_tokens`、不计费。

<Info>
  如果你的网关或客户端有「模型路由 / 失败回退」逻辑，会在会话中途切换模型，请特别留意这条。带上 `thinking-binding-controls-2026-08-01` beta 头可以在顶层 `input_transformations` 数组里看到被丢弃的块，否则整个过程是静默的。
</Info>

### 3. 编辑历史消息会让思考块失效

修改 Fable 5.1 思考块**之前**的任何内容（`system` 提示词、`tools` 数组、更早的消息），下一次请求就会报错，错误信息是 `The block is bound to a different conversation`。

会导致后续思考块全部失效的写法：

* 编辑、重排或删除更早的某一轮，却保留后面的轮次
* 往更早的轮次里注入每次请求都会变的文本（提醒行、状态行），下次请求又删掉
* 在同一会话的两次请求之间重建顶层 `system` 提示词或 `tools` 数组
* 图片 / 文档 URL 在后续请求里返回了不同的字节（校验的是字节不是 URL，所以同一文件的轮换签名 URL 没问题）

**不会**导致失效的操作：从最旧开始成段删除开头的思考块、服务端压缩或上下文编辑裁剪历史、移动 `cache_control` 标记、在请求之间改 `effort`。

<Info>
  这项校验对 **2026 年 8 月 31 日及之后创建的账号强制生效**；更早的账号只记录不阻断，除非请求里显式设置了 `thinking.block_binding.prefix_mismatch_behavior`。

  实践建议：**把会话当成只追加（append-only）来维护**。要加临时指令用「按轮生效的系统消息」（`clear_at: "next_user_message"`，beta），要改工具用「会话中途工具变更」，而不是去改 `system` 或 `tools`。这些写法同时还能让提示词缓存保持命中。
</Info>

## 新增能力（均为 beta）

<CardGroup cols={3}>
  <Card title="会话中途改 effort" icon="sliders-horizontal">
    难的步骤调高、常规步骤调低，且不会让提示词缓存失效。beta 头：`mid-conversation-output-config-2026-07-01`
  </Card>

  <Card title="按轮生效的系统消息" icon="message-square">
    `clear_at: "next_user_message"`，只对当轮生效，消息本身留在 `messages` 里原样回传，历史不变。beta 头：`mid-conversation-system-clear-at-2026-08-21`
  </Card>

  <Card title="工具调用间的进度播报" icon="activity">
    `thinking.display` 设为 `"updates"`，把进度更新以文本形式返回、推理仍隐藏。beta 头：`thinking-display-updates-2026-08-18`
  </Card>
</CardGroup>

另外，Fable 5.1 与 Mythos 5.1 生成的文本在所有平台上都带 Anthropic 的**统计式文本水印**；通过 Files API 取回的图片与视频带签名的 C2PA 内容凭证。官方说明水印不改变输出的含义、质量与可读性，不增加 token、不含隐藏字符、不携带用户或组织信息，也不需要改动请求与响应。

## 与 Fable 5 的行为差异（无需改代码就能感知）

这几点不会报错，但会直接影响使用体感，建议在提示词里对症下药：

| 差异                 | 表现                                             | 应对                                                   |
| ------------------ | ---------------------------------------------- | ---------------------------------------------------- |
| **并行工具调用变少**       | 原来一轮批量发几个调用，现在可能一轮只发一个。多花 token、多几个来回，但不降低答案质量 | 在提示词里加一句「把互相独立的工具调用批量放在同一轮」                          |
| **进度播报变少**         | 工具调用之间写给用户看的文字更少，effort 越高越明显                  | 开启 `thinking.display: "updates"`；删掉「把发现留到最终回复」这类旧提示词 |
| **低 effort 更依赖记忆** | 最低档位下调用搜索 / 检索工具的频率下降                          | 需要最新信息的轮次调高 effort，或加一句核实提醒                          |
| **行文更密**           | 句子更长、分段更少                                      | 提示词里明确要求分段与节奏                                        |
| **对话里格式更少**        | 加粗、标题、列表用得比更早的 Claude 少                        | 为旧模型写的「少用格式」规则要复查，可能压掉了本该有的结构                        |
| **引文不标注**          | 总结文档时更容易原样复现原文却不加引号                            | 明确要求标注引用来源与引号                                        |
| **小改动整文件重写**       | 编辑文本文件时更倾向整文件重写，结果通常一样但更费输出 token 和时间          | 提示词里要求做定点修改而非整文件重写                                   |

### 沿用 Fable 5 的行为（未变）

* 自适应思考恒开：`thinking: {"type": "enabled"}` 带 `budget_tokens`、以及 `{"type": "disabled"}` 都会返回 400，省略 `thinking` 或传 `{"type": "adaptive"}`
* `thinking.display` 默认 `"omitted"`，可选 `"summarized"`，原始思维链永不返回
* 预填充 assistant 回复返回 400
* 非默认的 `temperature` / `top_p` / `top_k` 返回 400
* 最小可缓存提示词长度仍是 512 tokens
* 交错思考自动开启，不需要 beta 头

## 拒答、回退与计费

Fable 5.1 的安全分类器覆盖与 Fable 5 相同的 `stop_details` 类别：

* **拒答**：被拒的请求返回 HTTP 200 且 `stop_reason: "refusal"`，`stop_details` 里说明触发的策略领域
* **回退**：可以用服务端回退把被拒请求转到别的模型重试，Fable 5.1 允许的回退目标是 **Claude Opus 4.8 与 Claude Opus 5**
* **计费**：在产生任何输出之前就拒答的请求不计费；切换模型带来的提示词缓存成本由回退抵扣（fallback credit）退还

## 数据保留与合规（重要）

<Warning>
  **Fable 5.1 与 Mythos 5.1 仍适用 30 天数据保留要求**

  两者都属于「受涵盖模型（Covered Models）」，与 Fable 5 / Mythos 5 一致：**输入与输出保留 30 天**用于严重滥用检测，且**除非 Anthropic 明确授权，否则不适用零数据保留（ZDR）**。

  * **默认访问范围**：保留的数据**仅由自动化安全系统访问**；人工审查**仅在这些系统标记潜在危害时**才会发生
  * **人工审查范围**：仅限于完成审查所需的范围
  * **跨账户合并审查**：多个账户的流量因**同一被禁止活动**被标记时，可能在一次审查中一并审查
</Warning>

<Info>
  **保留主体是 Anthropic / 云厂商，不是 API易**：上述 30 天保留发生在**原厂侧**（透传给 Anthropic 用于滥用检测），**API易 自身不保留任何数据，是纯透明代理**，仅做请求转发。**仅 Mythos 级模型（Fable 5 / 5.1、Mythos 5 / 5.1）适用此要求，其他 Claude 模型（如 Opus 5 / Opus 4.8 / Sonnet 5 等）不受影响。**
</Info>

## 实际应用

### 推荐场景

1. **长周期 Agent 编程**：跨会话的大型重构、迁移、多文件特性开发
2. **多步研究与深度检索**：需要顺着中间发现继续追问的研究任务
3. **文档密集型知识工作**：财报、论文、含密集图表的 PDF 解析与成品产出
4. **超长上下文分析**：需要在 100 万 token 里做跨段落串联的任务

<Info>
  官方建议：**大多数负载先用 Claude Opus 5**；当任务属于高难度推理、长周期 Agent 工作，或 Opus 5 在更高 effort 下评测仍不达标时，再上 Fable 5.1。
</Info>

### 代码示例

#### Anthropic 原生格式

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com"
)

message = client.messages.create(
    model="claude-fable-5-1",
    max_tokens=8192,
    messages=[
        {
            "role": "user",
            "content": "审查这个仓库的架构，指出潜在风险与重构路径。把互相独立的工具调用批量放在同一轮。"
        }
    ]
)

print(message.content[0].text)
```

#### OpenAI 兼容格式

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="claude-fable-5-1",
    messages=[
        {"role": "user", "content": "一步步定位这个生产环境 Bug 的根因，并给出修复方案。"}
    ]
)

print(response.choices[0].message.content)
```

### 从 Fable 5 迁移的五步核对

1. **改模型名**：`claude-fable-5` → `claude-fable-5-1`
2. **删掉强制工具调用**：移除 `any` / `tool` 类型的 `tool_choice`，把 schema 约束改到严格工具调用或结构化输出
3. **保证历史只追加**：思考块原样回传，别在请求之间改 `system` / `tools` / 更早的消息
4. **重新调 effort**：默认是 `high`，可以按步骤在会话中途上下调，而不是整场固定一档
5. **重跑评测**：拒答处理、回退、token 计数都不变，但缓存读取更便宜、默认行为有上面那几处差异

## 价格与可用性

### 定价信息

原厂公布价格（单位：美元 / 百万 tokens）：

| 计费项          | Fable 5.1  | Fable 5 | 变化        |
| ------------ | ---------- | ------- | --------- |
| **基础输入**     | \$10.00    | \$10.00 | 持平        |
| **输出**       | \$50.00    | \$50.00 | 持平        |
| **5 分钟缓存写入** | \$12.50    | \$12.50 | 持平        |
| **1 小时缓存写入** | \$20.00    | \$20.00 | 持平        |
| **缓存读取**     | **\$0.25** | \$1.00  | **↓ 75%** |

上表同时就是 API易 的定价——**四项计费与官网逐项一致，没有加价**。

缓存读取（命中与刷新）按 **0.025× 基础输入价**计算，而其余 Claude 模型是 0.1×。长周期 Agent 会话反复读取同一段缓存前缀，这一项的降幅最直接。批量处理为输入 \$5 / 输出 \$25 每百万 tokens。

<Info>
  \*\*我们的定价与官网一致，不在模型价格上加价。\*\*在此之上，部分分组另有折扣，也可叠加充值加赠活动——这部分是我们的让利，与模型本身的定价无关。

  查看实际扣费请以控制台「缓存计费详情」的实时数据为准，API 回显的 usage 缓存字段不能作为计费依据。
</Info>

### 可用分组与端点

| 项目                 | 说明                                                 |
| ------------------ | -------------------------------------------------- |
| **模型名**            | `claude-fable-5-1`                                 |
| **可用分组**           | `default` / `svip` / `ClaudeCode`                  |
| **模型名**            | `claude-fable-5-1`（另有 `claude-fable-5-1-thinking`） |
| **OpenAI 兼容格式**    | `https://api.apiyi.com/v1`                         |
| **Anthropic 原生格式** | `https://api.apiyi.com`                            |

<Info>
  `ClaudeCode` 分组用于 Claude Code 等 Anthropic 原生协议客户端。**协议与分组要配套选**：走 Anthropic 原生协议请使用 `ClaudeCode` 分组，走 OpenAI 兼容协议请使用 `default` / `svip` 分组。该分组另有折扣，可与充值加赠叠加。
</Info>

### 叠加网站充值活动

可结合 API易 充值加赠活动进一步降低实际成本，详见：`docs.apiyi.com/faq/recharge-promotions`。

## 总结与建议

Claude Fable 5.1 是一次少见的「同价升级」：输入输出价格纹丝不动，缓存读取直接砍到四分之一，而 Terminal-Bench-Science、AutomationBench 这类 Agent 基准是翻倍级提升。对已经在跑长周期 Agent 的团队，迁移的收益相当直接。API易 四项计费与官网逐项一致，缓存读取已同步下调到 \$0.25。

**迁移前请务必确认三件事**：

* 代码里有没有 `tool_choice: any` / `tool`——有就会直接 400
* 会话历史是不是只追加——注入又删除的临时提醒、每次重建的 `system` / `tools`，都会让思考块失效
* 团队是否知悉 **30 天数据保留**要求，敏感数据按内部合规策略处理

<Info>
  信息来源：Anthropic 官方发布公告与平台文档（`anthropic.com/claude-fable-and-mythos-5-1`、`platform.claude.com/docs/en/models/fable-5-1/whats-new-fable-5-1`），发布日期 2026 年 9 月 1 日。API易 可用性与定价取自平台定价接口，数据获取时间：2026 年 9 月 2 日 (UTC+8)。最终计费以平台实时数据为准。
</Info>
