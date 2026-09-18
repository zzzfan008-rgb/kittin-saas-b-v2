> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok Multi-Agent 多智能体模型指南

> grok-4.20-multi-agent-beta-0309 多智能体协作模型在 API易 的实测：多 agent 并行解题、适合复杂研究任务，重点说明其内部 agent 流量全额计费的成本放大特性。

`grok-4.20-multi-agent-beta-0309` 是 xAI 的多智能体协作模型：一次请求内部会启动**多个 agent 并行工作**（模型自称 Oppie，「协作型 AI 团队领导者」），由领导 agent 汇总产出最终回答。适合复杂研究、多角度对比分析类任务。API易 已上架，OpenAI 兼容格式直接调用。

## 计费特性（务必先读）

<Warning>
  **内部 agent 的全部流量都计入你的账单**。这是该模型与普通模型最大的差异：

  * 实测一个约 40 tokens 的普通提问，实际计费 **39,263 prompt tokens + 9,997 completion tokens**（内部多 agent 的往返流量全部计入）
  * 即使最简单的一句话请求，也有约 **3,900 prompt tokens 起步**的固定开销
  * 单价虽与 grok-4.3 相同（\$1.25 / \$2.50 每 1M tokens），**单次请求实际成本可达普通模型的几十倍**

  简单任务请勿使用该模型——普通问答用 `grok-4.3` 或 `grok-4.20-0309-reasoning` 即可。
</Warning>

好消息是内部流量的缓存命中率很高（实测 39K prompt tokens 中 26.8K 命中缓存折扣价 —— 这是多次内部调用汇总后的口径，不是单次请求的命中量），实际成本低于名义 token 数的直接换算，但仍显著高于普通模型。缓存本身的规则见 [Grok 缓存计费指南](/api-capabilities/grok/prompt-caching)。

## 调用方式

与普通模型完全一致，仅 `model` 字段不同：

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
)

resp = client.chat.completions.create(
    model="grok-4.20-multi-agent-beta-0309",
    messages=[{
        "role": "user",
        "content": "比较 Rust 和 Go 在构建高并发网络服务时的优劣，各给3点，最后给一句结论"
    }],
)
print(resp.choices[0].message.content)
print("实际计费 tokens:", resp.usage.total_tokens)
```

多智能体协作是**服务端内部行为**，无需任何额外参数；流式输出、结构化输出（`json_schema`）实测同样支持。

## 实测特征（2026-07-13）

| 维度            | 实测值                             |
| ------------- | ------------------------------- |
| 中等复杂度任务延迟     | \~29 秒                          |
| 简单问答延迟        | \~5 秒                           |
| 简单问答固定开销      | \~3,900 prompt tokens           |
| 中等任务 token 消耗 | \~39K prompt + \~10K completion |
| 内部缓存命中        | 约 2/3 的 prompt tokens 命中缓存折扣    |
| 思维链外露         | 不外露（`reasoning_tokens` 照常计费）    |

## 选型建议

<CardGroup cols={2}>
  <Card title="适合的场景" icon="check">
    多角度深度对比分析、复杂研究类问题、需要多条思路交叉验证的开放性任务——多 agent 并行探索能明显提升答案的全面性。
  </Card>

  <Card title="不适合的场景" icon="ban">
    日常问答、翻译、摘要、代码补全等单线任务——效果与普通模型接近，成本却放大几十倍。这些场景用 grok-4.3 / grok-4.5 即可。
  </Card>
</CardGroup>

<Tip>
  上线前建议先用少量真实任务对比 `grok-4.20-0309-reasoning` 与 multi-agent 模型的输出质量差异，再决定是否为质量增量支付成本放大——多数场景下推理变体已经够用。
</Tip>

## 常见问题

<AccordionGroup>
  <Accordion title="为什么响应里模型自称 Oppie？">
    这是该模型的内置人设（多 agent 团队的领导者角色），属正常现象。验证模型身份以请求与响应的 `model` 字段为准。
  </Accordion>

  <Accordion title="能控制内部 agent 数量吗？">
    不能。多智能体编排是 xAI 服务端内部行为，对外不暴露任何控制参数。
  </Accordion>

  <Accordion title="max_tokens 需要特殊设置吗？">
    建议放宽（如 8192），该模型内部推理消耗大，配额过小容易截断最终回答。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="Grok 概览" icon="rocket" href="/api-capabilities/grok/overview">
    全系模型阵容与定价
  </Card>

  <Card title="对话与推理" icon="message-square" href="/api-capabilities/grok/chat">
    普通模型的思维链与计费说明
  </Card>
</CardGroup>
