> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-6.1 Sol 上线：逼近 Astra，缓存读取再降一半

> OpenAI 于 2026 年 9 月 29 日 DevDay 发布 GPT-6.1 Sol，智能接近 GPT-6 Astra，输入 $2 / 输出 $10 与 GPT-6 Sol 持平，缓存读取从 $0.20 降到 $0.10。API易已上线，四项计费与官网一致。

## 核心要点

* **缓存读取降一半**：`gpt-6.1-sol` 输入 \$2 / 输出 \$10 与 `gpt-6-sol` 持平，**缓存读取从 \$0.20 降到 \$0.10**（每百万 tokens），只有标准输入价的 5％。多轮对话、Agent、编程助手这类缓存命中率高的负载，账单会明显下降
* **能力逼近 Astra**：Artificial Analysis 智能指数 max 档 52 分，比 GPT-6 Sol 高 4 分、只比 GPT-6 Astra 低 1 分；官方称 DeepSWE v1.1 与 Astra 持平，价格约为 Astra 的五分之一
* **事实错误更少**：官方在刻意设计的高难度事实类提示上测得，低推理力度下含事实错误的回答占比从 11.4％ 降到 7.7％
* **API易 已上线**：四项计费与官网逐项一致，不加价；折扣来自网站充值活动，详见 [充值优惠说明](/faq/recharge-promotions)
* **注意一处变化**：推理力度不再支持 `none`，最低为 `low`

## 背景介绍

9 月 22 日 OpenAI 发布了 GPT-6 Sol 与 Luna，把主力档价格降到上一代的一半。一周后的 9 月 29 日，OpenAI 在 DevDay 2026 上推出了 Sol 的升级版 **GPT-6.1 Sol**。

这次升级的重点是「用 Sol 的价格拿到接近 Astra 的能力」。按 OpenAI 的说法，GPT-6.1 Sol 在智能体编程、电脑操作和专业文档任务上接近 GPT-6 Astra，而标准输入输出价只有 Astra 的五分之一。另一个直接影响账单的变化是缓存读取价减半：从 \$0.20 降到 \$0.10 每百万 tokens。

API易 已同步上线 `gpt-6.1-sol`，**输入、输出、缓存读取、缓存写入四项计费全部与官网一致**。

## 详细解析

### 性能基准

**独立评测（Artificial Analysis 智能指数）**

| 推理力度 | GPT-6.1 Sol |
| - | - |
| `max` | **52** |
| `xhigh` | 51 |
| `high` | 50 |
| `medium` | 48 |
| `low` | 42 |

Artificial Analysis 给出的对比：GPT-6.1 Sol 比 GPT-6 Sol 高 4 分、比 GPT-5.6 Sol 高 5 分，比 GPT-6 Astra 低 1 分。

**厂商自报**

| 基准测试 | GPT-6.1 Sol | GPT-6 Sol | GPT-6 Astra |
| - | - | - | - |
| **DeepSWE v1.1** | **75.2％**（high） | 68.8％（max） | 74.8％（high） |
| **OSWorld 2.0** | **71.4％**（max） | 64.4％（max） | 73.5％（max） |
| **GDP.pdf** | **32.0％**（high） | 28.0％ | 32.2％ |
| **AutomationBench 1.0.6** | **36.0％**（high） | 31.2％（medium） | — |

官方同时给了成本口径的对比：OSWorld 2.0 上与 Astra 相差约 2.1 个百分点，单任务成本约为 Astra 的七分之一；AutomationBench 在 medium 档比 Claude Opus 5.5 高 2.2 个百分点，成本约为其三分之一。

<Info>
  独立评测来自 Artificial Analysis（`artificialanalysis.ai/models/releases/gpt-6-1-sol`）；厂商自报数据来自 OpenAI 发布材料及 Vellum、VentureBeat 的整理，括号为测试时的推理力度，尚无独立复现。数据获取时间：2026 年 9 月 30 日。
</Info>

### 核心特性

<CardGroup cols={2}>
  <Card title="缓存读取减半" icon="database">
    比 GPT-6 Sol 便宜一半，只有标准输入价的 5％。系统提示、工具定义、长文档反复命中的场景最受益
  </Card>

  <Card title="接近 Astra 的能力" icon="trophy">
    智能体编程、电脑操作、专业文档三类任务接近旗舰，价格按 Sol 档计
  </Card>

  <Card title="事实性更好" icon="circle-check">
    低推理力度下含事实错误的回答占比 11.4％ → 7.7％，官方称全档位与 Astra 的差距在 1.9 个百分点以内
  </Card>

  <Card title="Ultrafast 选项" icon="gauge">
    官方称后续推出 Ultrafast 加速档，API 最高约 6 倍生成速度、价格为标准价 6 倍。API易 上线后另行通知
  </Card>
</CardGroup>

### 技术规格

| 参数 | GPT-6.1 Sol |
| - | - |
| **模型标识** | `gpt-6.1-sol` |
| **上下文长度** | 1,050,000 tokens（单次最大输入 922K） |
| **最大输出** | 128,000 tokens |
| **知识截止** | 2026 年 4 月 30 日 |
| **推理力度** | `low` / `medium`（默认）/ `high` / `xhigh` / `max`，**不支持 `none` / `minimal`** |
| **输入 / 输出模态** | 文本、图片 / 文本 |
| **功能** | 流式输出、函数调用、结构化输出、提示缓存 |

## 实际应用

### 推荐场景

* **编程助手与 Agent**：多轮对话里系统提示和代码上下文反复命中缓存，缓存读取减半直接体现在账单上
* **长文档分析**：同一份合同、财报、代码库反复提问，缓存命中部分只按 \$0.10 计费
* **原本用 Astra 的中等难度任务**：可以先拿 GPT-6.1 Sol 跑一轮对比，能力接近而价格约为五分之一

### 代码示例

<CodeGroup>
  ```python Responses API theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="sk-your-apiyi-key", base_url="https://api.apiyi.com/v1")

  response = client.responses.create(
      model="gpt-6.1-sol",
      reasoning={"effort": "medium"},   # low / medium / high / xhigh / max
      input="审查这段代码，指出潜在 Bug 并给出修复建议：……",
  )
  print(response.output_text)
  ```

  ```python Chat Completions theme={null}
  from openai import OpenAI

  client = OpenAI(api_key="sk-your-apiyi-key", base_url="https://api.apiyi.com/v1")

  response = client.chat.completions.create(
      model="gpt-6.1-sol",
      reasoning_effort="medium",
      messages=[
          {"role": "user", "content": "用三句话总结这份需求文档的核心目标：……"}
      ]
  )
  print(response.choices[0].message.content)
  ```

  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/responses \
    -H "Authorization: Bearer sk-your-apiyi-key" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gpt-6.1-sol",
      "reasoning": {"effort": "medium"},
      "input": "用一句话说明 GPT-6.1 Sol 相比 GPT-6 Sol 的变化"
    }'
  ```
</CodeGroup>

### 最佳实践

* **从 GPT-6 Sol 迁移基本只改模型名**：`gpt-6-sol` → `gpt-6.1-sol`。唯一要检查的是推理力度——**原来传 `none` 的代码要改成 `low`**
* **带工具调用优先走 Responses**：OpenAI 模型文档把工具调用列在 Responses API 下，函数调用、多步 Agent 建议用 `/v1/responses`
* **把稳定内容放在最前面**：系统提示、工具定义、长文档放在消息开头，后续轮次才能命中缓存，享受 \$0.10 的缓存读取价
* **上下文尽量压在 272K 以内**：超过后整条请求进入更高一档计费（见下方阶梯表）
* **给推理留输出余量**：推理 token 计入输出上限，`max_output_tokens` 不要压得太紧

## 价格与可用性

### 定价信息

原厂公布价格（单位：美元 / 百万 tokens，输入 272K 以内）：

| 计费项 | GPT-6.1 Sol | GPT-6 Sol | GPT-6 Astra |
| - | - | - | - |
| **输入** | \$2.00 | \$2.00 | \$10.00 |
| **输出** | \$10.00 | \$10.00 | \$50.00 |
| **缓存读取** | **\$0.10** | \$0.20 | \$1.00 |
| **缓存写入（5 分钟）** | \$2.50 | \$2.50 | \$12.50 |

GPT-6.1 Sol 这一列同时就是 API易 的定价：**四项计费与官网逐项一致，没有加价**。

<Note>模型价格与官网对齐，且可能随官网调整；上表仅供参考，具体以顶部导航「模型价格」栏目为准：[模型价格](/models/index)。</Note>

### 长上下文阶梯

与官网一致，单次请求输入超过 272K tokens 时，**整条请求**按第二档计费：

| 输入 tokens | 输入 | 输出 | 缓存读取 | 缓存写入 |
| - | - | - | - | - |
| 0 - 272K | \$2.00 | \$10.00 | \$0.10 | \$2.50 |
| 272K 以上 | \$4.00 | \$15.00 | \$0.20 | \$5.00 |

阶梯按单次请求判定，不按账户累计。

### 缓存减半能省多少

以一个典型编程助手会话为例：每轮输入 100K tokens，其中 90K 命中缓存、10K 为新内容，输出 2K tokens。

| 单轮费用 | GPT-6 Sol | GPT-6.1 Sol |
| - | - | - |
| 缓存读取 90K | \$0.018 | \$0.009 |
| 新输入 10K | \$0.020 | \$0.020 |
| 输出 2K | \$0.020 | \$0.020 |
| **合计** | **\$0.058** | **\$0.049** |

单价不变的输入输出之外，仅缓存一项就让这类会话每轮便宜约 16％；缓存占比越高、输出越短，省得越多。

### 可用分组与端点

| 项目 | 说明 |
| - | - |
| **模型名** | `gpt-6.1-sol` |
| **可用分组** | `default` / `svip` / `CodexResponses` / `CodexReverse` |
| **端点** | `/v1/responses`（推荐）、`/v1/chat/completions` |
| **Base URL** | `https://api.apiyi.com/v1` |

分组差异见 [分组说明](/faq/codex-claudecode-default-groups)。

### 叠加网站充值活动

模型价格与官网一致，折扣体现在充值活动里：充值加赠可以进一步降低实际成本，充值按固定汇率 1:7 结算，详见 [充值优惠说明](/faq/recharge-promotions)。

## 总结与建议

GPT-6.1 Sol 是一次「价格不动、能力和缓存双升级」的迭代：输入输出价与 GPT-6 Sol 持平，能力接近 GPT-6 Astra，缓存读取价减半。对缓存命中率高的编程与 Agent 负载，这是一次直接体现在账单上的降本。

**使用建议**：

1. **正在用 `gpt-6-sol` 的用户**：换成 `gpt-6.1-sol`，检查一下有没有传 `reasoning_effort: none`，其余不用改
2. **正在用 `gpt-6-astra` 做中等难度任务的用户**：拿自己的任务对比一轮，能力接近的话成本约降到五分之一
3. **重度缓存场景**：把稳定前缀放在消息最前面，让缓存减半的红利最大化

<Info>
  信息来源：OpenAI 官方模型文档 `developers.openai.com/api/docs/models/gpt-6.1-sol`；Artificial Analysis `artificialanalysis.ai/models/releases/gpt-6-1-sol`；TechCrunch、VentureBeat、Vellum 等报道（2026 年 9 月 29 日）。数据获取时间：2026 年 9 月 30 日。API易 定价以平台实时数据为准。
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.