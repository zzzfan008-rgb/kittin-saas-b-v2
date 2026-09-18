> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MiniMax-M2.7 上线：10B 参数的自进化智能体模型，性价比惊人

> MiniMax 发布 M2.7 和 M2.7-highspeed，仅 10B 活跃参数即达到 Tier-1 级别性能，SWE-bench Pro 56.22%，价格低至竞品的 1/50。API易已全面上架。

## 核心要点

* **最小 Tier-1 模型**：仅 10B 活跃参数，SWE-bench Pro 56.22%、SWE-bench Verified 78%，媲美 Opus 级别性能
* **自进化能力**：业界首个深度参与自身训练进化的模型，自主完成 30-50% 的强化学习开发流程
* **原生多智能体**：内建 Agent Teams 协作能力，支持 40+ 复杂技能，技能遵循率达 97%
* **极致性价比**：输入 \$0.30 / 输出 \$1.20 每百万 tokens，约为同级竞品的 1/50
* **双版本可选**：标准版和 highspeed 版输出质量完全一致，highspeed 速度约 100 TPS

## 背景介绍

2026 年 3 月 18 日，MiniMax 正式发布 M2.7 系列模型。M2.7 被称为「最小的 Tier-1 模型」，仅用 10B 活跃参数就在多项权威评测中达到了与 Claude Opus 4.6、GPT-5.3 Codex 等顶级模型相当的水平。

M2.7 最大的亮点是其「自进化」能力——它能自主触发日志分析、调试和指标评估，独立完成 30-50% 的自身强化学习开发流程，包括分析自身失败案例、重写部分代码、执行评估并决定保留或丢弃结果。

API易已上架 M2.7 和 M2.7-highspeed 两个版本，按量付费 Chat 类型。

## 详细解析

### 核心特性

<CardGroup cols={2}>
  <Card title="自进化模型" icon="dna">
    业界首个深度参与自身训练的模型，自主处理 30-50% 的 RL 开发流程
  </Card>

  <Card title="原生多智能体" icon="users">
    内建 Agent Teams 协作，角色边界、对抗推理、协议遵循均为内化能力
  </Card>

  <Card title="极小参数量" icon="minimize">
    仅 10B 活跃参数达到 Tier-1 水准，效率极高
  </Card>

  <Card title="超强工具交互" icon="wrench">
    管理 40+ 复杂技能（每个超 2000 tokens），遵循率 97%
  </Card>
</CardGroup>

### 性能评测

| 评测基准               | M2.7 得分 | 说明         |
| ------------------ | ------- | ---------- |
| SWE-bench Pro      | 56.22%  | 接近 Opus 级别 |
| SWE-bench Verified | 78%     | 软件工程能力强劲   |
| VIBE-Pro           | 55.6%   | 端到端项目交付    |
| Terminal Bench 2   | 57.0%   | 复杂工程系统     |
| MM Claw            | 62.7%   | 智能体任务      |
| MLE Bench Lite     | 66.6%   | ML 竞赛获奖率   |
| 技能遵循率              | 97%     | 40+ 复杂技能   |

在 Artificial Analysis 智能指数中得分 **50**，与 GLM-5 并列，领先 MiMo-V2-Pro（49）和 Kimi K2.5（47），而输出 token 用量少 20%，成本仅为同级竞品的三分之一以下。

### M2.7 vs M2.7-highspeed

两个版本**输出质量完全相同**，区别仅在速度和价格：

| 对比项   | M2.7 标准版       | M2.7-highspeed |
| ----- | -------------- | -------------- |
| 输出质量  | 完全一致           | 完全一致           |
| 速度    | \~60 TPS       | \~100 TPS      |
| 上下文窗口 | 204,800 tokens | 204,800 tokens |
| 适用场景  | 预算优先           | 延迟敏感的生产环境      |

### 技术规格

* **上下文窗口**：204,800 tokens（约 205K）
* **最大输出**：131,072 tokens
* **推理能力**：支持 `<think>` 标签强制推理
* **架构**：MoE 混合专家架构

## 价格与可用性

| 模型                     | 提示价格               | 补全价格               | 计费类型        |
| ---------------------- | ------------------ | ------------------ | ----------- |
| MiniMax-M2.7           | \$0.30 / 1M tokens | \$1.20 / 1M tokens | 按量付费 - Chat |
| MiniMax-M2.7-highspeed | \$0.60 / 1M tokens | \$2.40 / 1M tokens | 按量付费 - Chat |

<Info>
  M2.7-highspeed 速度约为标准版的 1.7 倍，适合对延迟敏感的生产场景。两个版本智能水平完全一致，可根据实际需求选择。
</Info>

## 总结与建议

MiniMax-M2.7 以仅 10B 活跃参数实现了 Tier-1 级别的性能表现，堪称「以小博大」的典范。其自进化能力和原生多智能体协作是独特亮点，在软件工程、工具调用和复杂工作流编排方面表现出色。

**推荐场景**：

* 需要高智能但预算有限的开发者
* 智能体 / Agent 工作流和多步任务
* 软件工程辅助和代码生成
* 需要强工具调用能力的生产环境
