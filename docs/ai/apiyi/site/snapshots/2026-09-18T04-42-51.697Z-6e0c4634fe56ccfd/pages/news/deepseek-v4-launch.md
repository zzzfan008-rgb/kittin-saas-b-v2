> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4-Pro / V4-Flash 上线：百万上下文 + 开源 SOTA

> DeepSeek V4 预览版双模型上线 API易！1M 超长上下文、Hybrid Attention 架构、Agentic Coding 达开源 SOTA、SWE-Verified 80.6 接近 Claude/Gemini。官方同价，叠加充值活动可做到约 85 折。

## 核心要点

* **双模型上线**：`deepseek-v4-pro`（1.6T 总参 / 49B 激活）与 `deepseek-v4-flash`（284B 总参 / 13B 激活），均为 MoE 架构
* **百万上下文**：全系支持 1M tokens 超长上下文，配合全新 Hybrid Attention 架构 + DSA 稀疏注意力
* **开源 SOTA**：V4-Pro 在 Agentic Coding 评测中达当前开源模型最佳，SWE-Verified 80.6，和 Claude（80.8）、Gemini（80.6）基本持平
* **思考模式可调**：支持 `reasoning_effort` 参数（high / max），复杂 Agent 场景官方推荐 max 强度
* **双接口兼容**：同时支持 OpenAI ChatCompletions 与 Anthropic 接口
* **价格亲民**：Flash 输入 \$0.14 / 输出 \$0.28（每 1M tokens），Pro 输入 \$1.74 / 输出 \$3.48，均与官方同价
* **充值加赠**：叠加 API易 充值活动可做到官方约 **85 折**

<Info>
  当前上架版本为**阿里云官转通道**，发布日期 2026-04-24（官方预览版），信息来源：DeepSeek 官方文档 `api-docs.deepseek.com/zh-cn/news/news260424`。
</Info>

## 背景介绍

距离 DeepSeek-R1 震撼业界已过去整整一年。2026 年 4 月 24 日，DeepSeek 正式发布 V4 预览版，一次性带来面向性能的 **V4-Pro** 和面向成本 / 速度的 **V4-Flash** 两款模型。

V4 最关键的技术进展是 **Hybrid Attention Architecture**（混合注意力架构）——在 token 维度对注意力进行压缩，并结合 DSA 稀疏注意力机制，使长上下文下的推理既高效又准确。配合 **1M 超长上下文**，这代模型在设计上就是为了 Agent 与长程推理而生。

在与闭源前沿模型的对比上，DeepSeek 坦率地给出了自我定位：V4-Pro 在世界知识上仅稍逊于 Gemini-Pro-3.1，整体与 GPT-5.4 / Gemini-Pro-3.1 的差距"约为 3 到 6 个月"——对开源阵营而言，这已是近期最亮眼的追赶。

## 详细解析

### 两款新模型

<CardGroup cols={2}>
  <Card title="deepseek-v4-pro" icon="rocket">
    **性能旗舰**

    1.6T 总参 / 49B 激活，MoE 架构，1M 上下文。面向复杂 Agent、Coding、数学、STEM 与竞赛级代码场景。Agentic Coding 为当前开源 SOTA。
  </Card>

  <Card title="deepseek-v4-flash" icon="bolt">
    **速度经济版**

    284B 总参 / 13B 激活，MoE 架构，1M 上下文。面向高并发、低延迟、成本敏感场景，适合日常对话、文本处理、批量任务。
  </Card>
</CardGroup>

### 性能亮点

基于官方及第三方评测报告的关键数据：

| 评测维度                            | DeepSeek-V4-Pro    | 对手参考                      |
| ------------------------------- | ------------------ | ------------------------- |
| SWE-Verified（真实软件工程）            | **80.6**           | Claude 80.8 / Gemini 80.6 |
| Agentic Coding                  | **开源 SOTA**        | 接近 Claude Opus 4.5        |
| 世界知识                            | 开源领先               | 仅次于 Gemini-Pro-3.1        |
| 数学 / STEM / 竞赛代码                | **超越所有已公开评测的开源模型** | —                         |
| 与 GPT-5.4 / Gemini-Pro-3.1 整体差距 | 约 **3-6 个月**       | —                         |

<Tip>
  官方内部评测中，**V4-Pro-Max（max 思考强度）** 在 Agent 任务上优于 Claude Sonnet 4.5，并逼近 Claude Opus 4.5。
</Tip>

### 架构与技术规格

<Card title="Hybrid Attention Architecture" icon="network">
  * **token 维度压缩**：全新注意力机制在 token 维度上做压缩，显著降低长上下文推理成本
  * **DSA 稀疏注意力**：与稀疏注意力结合，进一步优化长程依赖建模
  * **MoE 专家模型**：V4-Pro 激活率约 3%（49B/1.6T），V4-Flash 激活率约 4.6%（13B/284B）
  * **1M 上下文**：全系支持 1,000,000 tokens，天然适合 Agent、代码库级任务、长文档分析
</Card>

### 思考模式与 reasoning\_effort

V4 同时支持**非思考模式**与**思考模式**。思考模式下提供 `reasoning_effort` 参数：

* `high`：标准深度思考，适合一般复杂问题
* `max`：最大思考强度，**官方推荐用于复杂 Agent 场景**

<Warning>
  对于复杂的 Agent 任务（长程工具调用、代码库级重构等），官方明确建议使用**思考模式 + `reasoning_effort=max`**，可显著提升任务完成率，但会增加输出 token 与耗时。
</Warning>

## 实际应用

### 推荐场景

<CardGroup cols={2}>
  <Card title="Agent 与工具调用" icon="bot">
    V4-Pro-Max 在开源阵营中 Agent 能力最强，适合 Claude Code / Cline / 自研 Agent 流水线
  </Card>

  <Card title="代码库级编程" icon="code">
    SWE-Verified 80.6 + 1M 上下文，可一次性装入中大型仓库上下文
  </Card>

  <Card title="长文档分析" icon="file-text">
    研报、法律合同、论文批量处理，1M 上下文 + 压缩注意力成本友好
  </Card>

  <Card title="高并发经济型" icon="bolt">
    V4-Flash 输入仅 \$0.14 / 1M tokens，适合客服、分类、翻译等高频任务
  </Card>
</CardGroup>

### 快速开始（OpenAI 兼容接口）

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

# 性能旗舰：V4-Pro + 最大思考强度，适合复杂 Agent
resp = client.chat.completions.create(
    model="deepseek-v4-pro",
    messages=[
        {"role": "system", "content": "你是一名资深全栈工程师"},
        {"role": "user", "content": "请基于现有仓库实现一个登录重试的熔断策略"}
    ],
    extra_body={"reasoning_effort": "max"}
)
print(resp.choices[0].message.content)
```

### 经济型调用（Flash）

```python theme={null}
# 高并发经济型：V4-Flash，默认非思考模式，延迟更低
resp = client.chat.completions.create(
    model="deepseek-v4-flash",
    messages=[{"role": "user", "content": "把下面这段英文翻译成中文：..."}]
)
```

### Anthropic 接口调用

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com"
)

msg = client.messages.create(
    model="deepseek-v4-pro",
    max_tokens=4096,
    messages=[{"role": "user", "content": "帮我设计一个分布式队列的限流方案"}]
)
print(msg.content[0].text)
```

### 最佳实践

* **选型建议**：默认用 Flash，遇到 Agent / 复杂代码 / 推理密集任务再切 Pro
* **思考强度**：简单任务关闭思考模式；复杂 Agent 场景用 `reasoning_effort=max`
* **长上下文**：1M 上下文虽香，但输入 token 越多计费越高，建议做一轮预筛选再投喂
* **流式输出**：思考模式可能产出较多中间 token，建议客户端开启 stream 改善体验

## 价格与可用性

### 定价表（USD / 1M tokens）

| 模型                  | 计费类型        | 提示价格（输入）     | 补全价格（输出）     | 提示倍率 | 补全倍率   |
| ------------------- | ----------- | ------------ | ------------ | ---- | ------ |
| `deepseek-v4-flash` | 按量付费 - Chat | **\$0.1400** | **\$0.2800** | 0.07 | 2.0000 |
| `deepseek-v4-pro`   | 按量付费 - Chat | **\$1.7400** | **\$3.4800** | 0.87 | 2.0000 |

<Info>
  API易 挂牌价格与 DeepSeek 官方完全一致，无加价。当前为**阿里云官转**通道，稳定性与官方直连一致。
</Info>

### 叠加网站充值活动

充值活动可把实际成本做到**官方约 85 折**，详见：

<Card title="充值活动" icon="gift" href="/faq/recharge-promotions">
  查看最新充值加赠规则，越大额加赠比例越高
</Card>

## 总结与建议

DeepSeek V4 预览版给出了开源阵营近一年最有分量的一份答卷：

* ✅ **Agent / Coding 首选开源**：V4-Pro 是目前开源世界最能打的 Agent 基座，Claude Sonnet 级性能，价格只是一个零头
* ✅ **成本敏感首选 Flash**：\$0.14 / 1M tokens 的输入成本，配合 1M 上下文，几乎是长文档处理的性价比天花板
* ✅ **平滑迁移**：OpenAI + Anthropic 双接口兼容，现有代码改一行 `base_url` 和 `model` 即可切换

**推荐迁移路径**：

1. 把现有 DeepSeek-V3 / R1 调用逐步切到 V4-Flash 做 A/B
2. Agent / 代码类任务升级到 V4-Pro + `reasoning_effort=max`
3. 搭配 API易 充值加赠，把成本再拉低 \~15%

<Info>
  **信息来源与日期**

  * DeepSeek 官方发布公告：`api-docs.deepseek.com/zh-cn/news/news260424`
  * 第三方报道与评测：`simonwillison.net/2026/Apr/24/deepseek-v4/`、`thenextweb.com`、`felloai.com/deepseek-v4/`、`techxplore.com`、`digitalapplied.com`
  * 数据获取日期：2026-04-24
</Info>
