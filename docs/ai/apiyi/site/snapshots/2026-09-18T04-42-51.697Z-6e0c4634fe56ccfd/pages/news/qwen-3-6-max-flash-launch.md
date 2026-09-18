> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.6 双模上线：Max-Preview + Flash

> 通义千问 Qwen3.6-Max-Preview 与 Qwen3.6-Flash 阿里云官转上线 API易，定价持平官网。Max 旗舰在 SWE-bench Pro 等 6 项编程基准登顶，Flash 支持 1M 多模态上下文。叠加充值活动约 85 折优惠。

## 核心要点

* **阿里云官转直发**：`qwen3.6-max-preview` 与 `qwen3.6-flash` 通过阿里云百炼官方通道接入 API易，稳定性与官方直连一致
* **Max 旗舰编程登顶**：Qwen3.6-Max-Preview 在 SWE-bench Pro、Terminal-Bench 2.0 等 6 项编程基准夺得第一，AIME 2025 93%、GPQA 86%、LiveCodeBench 79%
* **Flash 1M 多模态**：Qwen3.6-Flash 35B-A3B MoE，原生 256K（可扩 1M）上下文，支持文本 / 图像 / 视频输入
* **价格持平官网**：Max 挂牌 \$1.28 输入 / \$7.68 输出，Flash 挂牌 \$0.17 输入 / \$1.02 输出（每 1M tokens）
* **充值活动加赠约 85 折**：定价持平官网的同时，通过 API易 充值加赠活动可拉低实际单价至约 8.5 折
* **计费模式**：按量付费 - Chat，无需预订资源包

<Info>
  上架版本为**阿里云百炼官方通道**。模型基于阿里通义千问团队 2026 年 4 月发布的 Qwen3.6 系列。Max-Preview 为预览版，仍在持续迭代；Flash 为正式版。信息来源：阿里云百炼官方文档 `help.aliyun.com/zh/model-studio/models`、Qwen 团队博客 `qwen.ai/blog`，数据获取日期：2026-04-27。
</Info>

## 背景介绍

Qwen3.6 是通义千问团队在 2026 年第二季度发布的新一代大模型家族，整体路线分四档：**Max**（旗舰）、**Plus**（均衡）、**Flash**（极速）、**35B-A3B**（开源本地）。Max-Preview 于 2026-04-20 在 Qwen Studio 首发后即开启 API 上架准备，本次随 Flash 一同接入 API易 阿里云官转分组。

对中文场景的实际意义在于两点：一是 **Max-Preview 把编程与 Agent 评测推到国产模型新高**，在 SWE-bench Pro 上以 58.4 反超此前国产顶配 GLM-5.1（56.6）；二是 **Flash 用极低单价覆盖了"高频 + 多模态 + 长上下文"这一过去最贵的场景组合**，0.17 美金每百万输入 token 的价格，使图像 / 视频 + 长上下文工作流真正具备跑量条件。

## 详细解析

### 核心特性

<CardGroup cols={2}>
  <Card title="Max-Preview · 编程旗舰" icon="trophy">
    **国产模型 Coding 新天花板**

    SWE-bench Pro / Terminal-Bench 2.0 / SkillsBench / QwenClawBench / QwenWebBench / SciCode 6 项基准登顶，适合 Agent 与代码库级任务。
  </Card>

  <Card title="Flash · 极速多模态" icon="bolt">
    **35B-A3B MoE / 1M 上下文**

    原生支持文本 / 图像 / 视频输入，256K 基础上下文可扩展至 1M，单价仅 Max 的约 1/8。
  </Card>

  <Card title="阿里云官转直连" icon="cloud">
    **稳定性与官方一致**

    通过阿里云百炼官方通道接入，鉴权与限流策略与官网一致，国内访问延迟低。
  </Card>

  <Card title="按量计费 Chat" icon="credit-card">
    **无需预订资源包**

    Chat 接口直接按量计费，配合 API易 充值活动加赠，实际单价约 8.5 折。
  </Card>
</CardGroup>

### 性能亮点（Qwen3.6-Max-Preview）

以下数据来源于 Qwen 团队官方博客与第三方公开基准：

| 评测维度                | Qwen3.6-Max-Preview | GLM-5.1 | Qwen3.6-Plus |
| ------------------- | ------------------- | ------- | ------------ |
| SWE-bench Pro（真实软工） | **58.4**            | 56.6    | —            |
| LiveCodeBench       | **79%**             | —       | —            |
| AIME 2025（数学竞赛）     | **93%**             | —       | —            |
| GPQA（科学推理）          | **86%**             | —       | —            |
| Terminal-Bench 2.0  | **第 1**             | —       | —            |
| 编程基准登顶项数            | **6 项**             | —       | —            |

<Tip>
  Max-Preview 标记为 Preview，意味着官方仍在迭代权重；Qwen 团队明确表示后续版本会有进一步提升，建议关键链路上线前先做小流量灰度。
</Tip>

### 技术规格

<Card title="模型参数对照" icon="sliders-horizontal">
  **Qwen3.6-Max-Preview**

  * 模型 ID：`qwen3.6-max-preview`
  * 架构：稠密大模型（具体参数未公开）
  * 上下文：262K tokens
  * 输入模态：文本
  * 计费模式：按量付费 - Chat
  * 通道：阿里云官转

  **Qwen3.6-Flash**

  * 模型 ID：`qwen3.6-flash`
  * 架构：MoE，35B 总参 / 3B 激活（35B-A3B）
  * 上下文：256K 基础，可扩展至 1M tokens
  * 输入模态：文本 / 图像 / 视频
  * 计费模式：按量付费 - Chat（高 token 段阶梯价）
  * 通道：阿里云官转
</Card>

<Warning>
  Qwen3.6-Flash 在阿里云官网采用阶梯价：单次请求总输入 token 数会决定整请求的单价档位。API易 上架的挂牌价对应基础档；超过 256K 的超长请求请关注实际计费回执。
</Warning>

## 实际应用

### 推荐场景

<CardGroup cols={2}>
  <Card title="Coding Agent 主力" icon="code">
    用 `qwen3.6-max-preview` 做主驱动模型，配合 Cursor / Claude Code 等 Agent 工作流，SWE-bench Pro 表现可媲美 GPT-5 / Claude Opus 旗舰。
  </Card>

  <Card title="高频多模态分发" icon="images">
    用 `qwen3.6-flash` 处理图像 / 视频理解、长文档总结、批量翻译这类高频任务，0.17/1.02 美金的单价让"跑量"真正成立。
  </Card>

  <Card title="长上下文检索" icon="search">
    Flash 256K → 1M 的扩展窗口适合 RAG 后检索 + 整篇综合归纳的链路，避免分块带来的语义断裂。
  </Card>

  <Card title="国产合规优先" icon="shield-check">
    阿里云官转通道，对国内合规与数据出境敏感场景友好，可作为对标 GPT/Claude 的国产替代选项。
  </Card>
</CardGroup>

### 代码示例

```python theme={null}
import openai

client = openai.OpenAI(
    api_key="your-api-key",
    base_url="https://api.apiyi.com/v1"
)

# 编程旗舰：用 Max-Preview 跑 Agent 任务
resp = client.chat.completions.create(
    model="qwen3.6-max-preview",
    messages=[
        {"role": "system", "content": "你是一个资深 Python 工程师，按规范返回 diff。"},
        {"role": "user", "content": "为下面这段代码补充类型注解并修复潜在 bug ..."}
    ]
)
print(resp.choices[0].message.content)

# 极速多模态：用 Flash 处理图像 + 文本输入
resp = client.chat.completions.create(
    model="qwen3.6-flash",
    messages=[
        {"role": "user", "content": [
            {"type": "text", "text": "请用中文描述这张图片的关键信息"},
            {"type": "image_url", "image_url": {"url": "https://your-image-url.png"}}
        ]}
    ]
)
print(resp.choices[0].message.content)
```

### 最佳实践

* **任务路由**：以 Flash 作为默认通道处理常规对话与分类，仅在编程 / 复杂推理 / Agent 调度时升级到 Max-Preview，可在不损失质量的前提下把成本压到最低。
* **Preview 灰度**：Max-Preview 仍在迭代，关键链路建议先小流量灰度 + AB 比对，待版本稳定后再切主流量。
* **多模态分批**：Flash 支持 1M 上下文，但单次过长仍会触发阶梯价。建议把超长视频先切片再喂入，按 256K 分批控制单次成本。

## 价格与可用性

### 定价信息

| 模型                    | 计费模式        | 输入价格               | 输出价格               |
| --------------------- | ----------- | ------------------ | ------------------ |
| `qwen3.6-max-preview` | 按量付费 - Chat | \$1.28 / 1M tokens | \$7.68 / 1M tokens |
| `qwen3.6-flash`       | 按量付费 - Chat | \$0.17 / 1M tokens | \$1.02 / 1M tokens |

<Info>
  挂牌价持平阿里云官网。叠加 API易 当期充值加赠后，实际单价约为 **8.5 折**。
</Info>

### 叠加网站充值活动

API易 充值加赠活动详情：[/faq/recharge-promotions](/faq/recharge-promotions)

充值后实际折算单价（参考 8.5 折）：

| 模型                    | 实际输入            | 实际输出           |
| --------------------- | --------------- | -------------- |
| `qwen3.6-max-preview` | ≈ \$1.088 / 1M  | ≈ \$6.528 / 1M |
| `qwen3.6-flash`       | ≈ \$0.1445 / 1M | ≈ \$0.867 / 1M |

## 总结与建议

Qwen3.6-Max-Preview 与 Qwen3.6-Flash 是 API易 阿里云官转分组的最新补强：**Max 在编程与推理上把国产模型推到新高，Flash 把多模态长上下文的单价压到极低**。两款模型搭配使用，可以覆盖从重型 Agent 到高频分发的完整需求曲线。

<Tip>
  推荐策略：**Flash 默认 + Max-Preview 升级**。常规对话 / 多模态批量交给 Flash，编程 / Agent / 复杂推理升级到 Max-Preview，再叠加充值加赠拿到约 85 折单价，是当前阿里云官转通道里性价比最优的组合。
</Tip>

<Info>
  数据来源：阿里云百炼官方文档（`help.aliyun.com/zh/model-studio/models`）、Qwen 团队官方博客（`qwen.ai/blog`）、Qwen3.6-Max-Preview 评测报告。Max-Preview 发布日期：2026-04-20。文章数据获取日期：2026-04-27 (UTC+8)。
</Info>
