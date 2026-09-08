> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seed 2.1 Turbo 上线：字节高频生产型模型

> 字节 Seed 2.1 Turbo 文本模型上线 API易：输入 $0.50、输出 $2.50 每 1M tokens，Chat Completions 与 Responses 双端点 15/15 用例实测通过，深度思考可控、双层缓存降本。

## 核心要点

* **正式上线**：字节 Seed 2.1 Turbo（`dola-seed-2-1-turbo-260628`）已在 API易开放调用，`default` / `svip` 分组可用
* **双端点实测通过**：Chat Completions 与 Responses 两个端点 15/15 用例全部验证通过，非"挂名可用"而是逐项实测
* **生产级性价比**：输入 \$0.50、输出 \$2.50 每 1M tokens，官方定位为同代 Seed 2.1 Pro 的一半价格
* **深度思考可控**：默认开启思考，支持一键关闭与 low/high 分档，实测两档思考量相差约 4 倍
* **双层缓存降本**：隐式缓存第 2 次请求自动命中；Responses 端显式缓存链式调用整轮命中、延迟约减半

## 背景介绍

Seed 2.1 Turbo 是字节跳动 Seed 团队于 2026 年 6 月 23 日发布的高频生产型文本模型（BytePlus 海外产品名 Dola-Seed-2.1-turbo），与旗舰 Seed 2.1 Pro 同代，主打低成本、低延迟的企业级高并发场景，家族标称 256K 上下文。

与很多"上了但没验证"的接入不同，API易在上线前对该模型完成了**双端点全量实测**：基础对话、流式、结构化输出、Function Call 两轮闭环、思考开关与分档、隐式/显式缓存、原生多轮，共 15 个用例全部通过。本文的所有数据均来自 2026 年 7 月 21 日的实测记录。

<Info>
  截至发稿（2026 年 7 月 21 日），Turbo 版暂无独立第三方基准测试数据公布，厂商关于性能对标的说法请以后续权威评测为准。本文只陈述我们实测验证过的行为。
</Info>

## 详细解析

### 实测能力矩阵

| 能力                          | Chat Completions | Responses                     |
| --------------------------- | ---------------- | ----------------------------- |
| 基础对话（非流式/流式）                | ✅ / ✅            | ✅ / ✅（事件流完整）                  |
| 结构化输出（json\_schema, strict） | ✅                | ✅（`text.format`）              |
| 思考开关 / 分档                   | ✅                | ✅                             |
| Function Call（两轮闭环）         | ✅                | ✅                             |
| 隐式缓存                        | ✅ 第 2 次命中        | ✅ 第 2 次命中                     |
| 显式缓存                        | —                | ✅ 需 `previous_response_id` 链式 |
| 原生多轮 `previous_response_id` | —                | ✅                             |

### 最重要的一个特性：默认开启深度思考

这是使用该模型必须知道的一点——**不传任何参数时深度思考默认开启**，一句话的简单问题也会先输出数百 tokens 的思考内容。实测一句话自我介绍消耗 444 输出 tokens（其中思考 409），非流式总耗时 7–19 秒。

三种控制方式实测：

| 配置                               | reasoning tokens（实测）      | 适用场景       |
| -------------------------------- | ------------------------- | ---------- |
| `thinking: {"type": "disabled"}` | 0                         | 高频短问答、成本敏感 |
| `reasoning_effort: "low"`        | Chat 226 / Responses 371  | 常规推理       |
| `reasoning_effort: "high"`       | Chat 960 / Responses 1317 | 复杂规划、数学、代码 |

<Warning>
  思考内容按输出 tokens 正常计费。高频短问答场景请把 `thinking: {"type": "disabled"}` 作为基线配置，实测关闭后思考 tokens 归零、响应显著加快。
</Warning>

### 双层缓存：机制不同，别用错

* **隐式缓存**（两端点均有）：零配置，相同长前缀第 2 次请求自动命中。实测约 2,600 tokens 的 system prompt，第 2 次请求 `cached_tokens` 达 2,360。
* **显式缓存**（仅 Responses）：`caching: {"type": "enabled"}` 必须**配合 `previous_response_id` 链式调用**——第 2 轮携带上一轮 id 时整轮上下文命中（实测 7,873 tokens 全量命中，耗时 8 秒降到 4 秒）。只开 enabled 不链式则两头落空：既不命中显式缓存，隐式前缀命中也会失效。

## 实际应用

### 推荐场景

<CardGroup cols={2}>
  <Card title="高频短问答 / 客服" icon="zap">
    关闭思考后低延迟低成本，\$0.50 输入价适合大流量调用。
  </Card>

  <Card title="Agent / 工具调用" icon="wrench">
    Function Call 两轮闭环实测稳定，Responses 端还支持原生多轮免重发历史。
  </Card>

  <Card title="长文档多轮问答" icon="file-text">
    256K 家族上下文 + 链式显式缓存，长背景多轮追问的成本与延迟都显著下降。
  </Card>

  <Card title="结构化数据提取" icon="braces">
    json\_schema strict 模式实测输出合法且字段齐全，适合批量抽取管道。
  </Card>
</CardGroup>

### 代码示例

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# 高频场景基线配置：关闭思考
response = client.chat.completions.create(
    model="dola-seed-2-1-turbo-260628",
    messages=[{"role": "user", "content": "用一句话介绍你自己"}],
    max_tokens=500,
    extra_body={"thinking": {"type": "disabled"}},
)
print(response.choices[0].message.content)
```

更多示例（流式、分档思考、Responses 链式缓存）见 [Seed 2.1 Turbo 概览](/api-capabilities/dola-seed-2-1-turbo/overview)，也可以在 [Chat 在线调试](/api-capabilities/dola-seed-2-1-turbo/chat-completions) 和 [Responses 在线调试](/api-capabilities/dola-seed-2-1-turbo/responses) 中直接发请求体验。

### 最佳实践

1. 把 `thinking disabled` 作为基线，只在复杂任务上开 `reasoning_effort` 分档
2. 开思考时 `max_tokens` / `max_output_tokens` 给足（3000+），防止正文被思考挤掉——Responses 端配额太小会返回 `incomplete` 且正文为空
3. 固定 system prompt 放最前面，隐式缓存自动省钱
4. 错误处理注意：模型名拼写错误返回 **503**（无可用渠道）而非 OpenAI 惯例的 404

## 价格与可用性

### 定价信息

| 项目 | API易价格             |
| -- | ------------------ |
| 输入 | \$0.50 / 1M tokens |
| 输出 | \$2.50 / 1M tokens |

模型对 `default` 与 `svip` 分组开放，现有令牌无需任何配置改动，直接把模型名换成 `dola-seed-2-1-turbo-260628` 即可调用。

### 叠加网站充值活动

叠加充值加赠后实际成本更低，详见 [充值优惠](/faq/recharge-promotions)。

## 总结与建议

Seed 2.1 Turbo 是一款"便宜、快、能力齐全"的生产型模型：结构化输出、Function Call、双层缓存都经过实测验证，适合作为高频调用场景的主力或降级备选。上手唯一要注意的就是**默认开启的深度思考**——按任务显式控制思考深度，才能把它的性价比真正吃到手。

<Info>
  数据来源：API易 2026 年 7 月 21 日双端点实测记录；模型发布信息来自字节 Seed 团队 2026 年 6 月 23 日公开发布资料。文中价格为发稿时挂牌价，以控制台实时价格为准。
</Info>
