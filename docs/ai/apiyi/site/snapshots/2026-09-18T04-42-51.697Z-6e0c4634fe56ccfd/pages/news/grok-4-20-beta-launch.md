> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 4.20 Beta 系列上线：四智能体协作架构，200 万上下文

> xAI 发布 Grok 4.20 Beta 系列 4 款模型，采用四智能体协作架构，200 万 token 上下文，统一定价输入 $2 / 输出 $6 每百万 tokens。API易已全面上架。

## 核心要点

* **四智能体架构**：Grok 4.20 的核心创新——4 个专业智能体并行思考、相互辩论后输出最终答案，幻觉率降低约 65%
* **200 万上下文**：相比 Grok 4 的 256K，上下文窗口提升 8 倍至 200 万 tokens
* **4 款模型覆盖全场景**：推理版、多智能体版、基础版、非推理版，满足从极速响应到深度研究的各类需求
* **统一低价**：输入 \$2 / 输出 \$6 每百万 tokens，比 Grok 4（\$3/\$15）大幅降价
* **多模态输入**：支持文本 + 图片（JPG、PNG）输入

## 背景介绍

2026 年 2 月 17 日，xAI 在 `grok.com` 上首次发布 Grok 4.20 Beta 消费端产品，3 月 9-10 日正式开放 API 访问，包含 3 个独立模型变体。Grok 4.20 是 Grok 系列的重大升级，从单一模型架构演进为多智能体协作系统。

Grok 4.20 的核心创新在于四智能体协作架构：Grok（队长/协调者）、Harper（研究与事实核查）、Benjamin（逻辑/数学/编程专家）、Lucas（创意综合与"唱反调"角色）。四个智能体并行运作、相互辩论，最终输出更准确、更全面的答案。

API易已在第一时间上架全部 4 款模型，统一定价与 xAI 官网一致。

## 详细解析

### 4 款模型对比

| 模型                                  | 定位     | 适用场景              |
| ----------------------------------- | ------ | ----------------- |
| `grok-4.20-beta`                    | 基础通用版  | 日常对话、内容生成、通用任务    |
| `grok-4.20-beta-0309-reasoning`     | 推理增强版  | 复杂逻辑、多步数学、科学推理、编程 |
| `grok-4.20-beta-0309-non-reasoning` | 极速非推理版 | 低延迟场景、简单问答、分类任务   |
| `grok-4.20-multi-agent-beta-0309`   | 多智能体版  | 深度研究、复杂多步工作流、协作任务 |

### 核心特性

<CardGroup cols={2}>
  <Card title="四智能体协作" icon="users">
    Grok（协调者）、Harper（研究）、Benjamin（逻辑）、Lucas（创意），并行思考相互辩论
  </Card>

  <Card title="200 万上下文" icon="scroll-text">
    上下文窗口 200 万 tokens，是 Grok 4（256K）的 8 倍
  </Card>

  <Card title="幻觉大幅降低" icon="shield-check">
    多智能体协作使幻觉率从约 12% 降至约 4.2%，降幅约 65%
  </Card>

  <Card title="统一低价" icon="coins">
    输入 \$2 / 输出 \$6 每百万 tokens，比 Grok 4 降价约 60%
  </Card>
</CardGroup>

### 性能数据

<Info>
  以下数据来源于 Artificial Analysis 等第三方评测平台，xAI 官方尚未发布完整 benchmark 数据。
</Info>

| 指标          | 推理版       | 非推理版        | Grok 4（参考） |
| ----------- | --------- | ----------- | ---------- |
| **AA 智能指数** | 48        | 30          | 42         |
| **输出速度**    | \~231 t/s | \~232.5 t/s | —          |
| **上下文窗口**   | 200 万     | 200 万       | 25.6 万     |
| **输入价格**    | \$2/百万    | \$2/百万      | \$3/百万     |
| **输出价格**    | \$6/百万    | \$6/百万      | \$15/百万    |

### 多智能体版特别说明

`grok-4.20-multi-agent-beta-0309` 内置了多种工具能力：

* **web\_search**：网页搜索
* **x\_search**：X（Twitter）实时数据搜索
* **code\_execution**：代码执行
* **collections\_search**：知识库搜索

API 调用时只返回主智能体的最终响应，子智能体的中间推理过程默认不暴露。

## 实际应用

### 代码示例

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# 推理版 - 适合复杂逻辑任务
response = client.chat.completions.create(
    model="grok-4.20-beta-0309-reasoning",
    messages=[
        {"role": "user", "content": "分析以下代码的时间复杂度并给出优化方案..."}
    ]
)
print(response.choices[0].message.content)
```

```python theme={null}
# 非推理版 - 适合低延迟场景
response = client.chat.completions.create(
    model="grok-4.20-beta-0309-non-reasoning",
    messages=[
        {"role": "user", "content": "将以下文本翻译为英文：..."}
    ]
)
print(response.choices[0].message.content)
```

### 推荐使用场景

<CardGroup cols={2}>
  <Card title="推理版" icon="brain">
    数学竞赛题、科研分析、复杂编程、多步逻辑推理
  </Card>

  <Card title="非推理版" icon="bolt">
    快速问答、文本分类、翻译、数据提取
  </Card>

  <Card title="基础版" icon="messages-square">
    日常对话、内容创作、通用助手
  </Card>

  <Card title="多智能体版" icon="users">
    深度研究报告、复杂调研、需要多角度分析的任务
  </Card>
</CardGroup>

## 价格与可用性

### 定价信息

| 模型                                  | 输入价格            | 输出价格            | 计费方式 |
| ----------------------------------- | --------------- | --------------- | ---- |
| `grok-4.20-beta`                    | \$2 / 百万 tokens | \$6 / 百万 tokens | 按量付费 |
| `grok-4.20-beta-0309-reasoning`     | \$2 / 百万 tokens | \$6 / 百万 tokens | 按量付费 |
| `grok-4.20-beta-0309-non-reasoning` | \$2 / 百万 tokens | \$6 / 百万 tokens | 按量付费 |
| `grok-4.20-multi-agent-beta-0309`   | \$2 / 百万 tokens | \$6 / 百万 tokens | 按量付费 |

### 叠加网站充值活动

充值加赠活动同样适用，详见 [充值优惠说明](/faq/recharge-promotions)。

## 总结与建议

Grok 4.20 Beta 系列的核心亮点在于四智能体协作架构和 200 万超长上下文。虽然在 AA 智能指数上（48）尚不及 Gemini 3.1 Pro（57）和 GPT-5.4（57），但其独特的多智能体协作机制在降低幻觉、提升复杂任务准确性方面表现突出。统一 \$2/\$6 的定价也非常有竞争力。

<Warning>
  Grok 4.20 目前仍处于 Beta 阶段，xAI 表示每天都在修复 bug 和改进。建议在生产环境中做好容错处理。
</Warning>

<Info>
  信息来源：xAI 官方文档 `docs.x.ai`、Artificial Analysis 评测数据、xAI 发布公告。数据获取时间：2026 年 3 月。
</Info>
