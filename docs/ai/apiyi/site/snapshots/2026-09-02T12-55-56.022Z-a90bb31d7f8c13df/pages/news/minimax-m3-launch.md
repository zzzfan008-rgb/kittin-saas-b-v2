> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MiniMax-M3 上线：1M 上下文开源旗舰限时 5 折

> MiniMax-M3 上线 API易！MSA 稀疏注意力 + 100 万上下文 + 原生多模态，SWE-Bench Pro 59.0 反超 GPT-5.5 与 Gemini 3.1 Pro。对齐官网限时 5 折：$0.30 输入 / $1.20 输出每 1M tokens，叠加充值活动最低约 4.1 折，优惠截止 6 月 8 日零点 (UTC+8)。

## 核心要点

* **开源新旗舰**：`MiniMax-M3` 正式上线 API易（注意模型名大小写），首个把前沿 Agent 编程、**100 万 tokens 上下文**与原生多模态集于一身的开源权重模型
* **编程基准反超闭源旗舰**：SWE-Bench Pro **59.0**，领先 GPT-5.5 与 Gemini 3.1 Pro；Terminal-Bench 2.1 达 66.0、MCP Atlas 74.2
* **自主浏览检索登顶**：BrowseComp **83.5**，超过 Claude Opus 4.7（79.3）；Claw-Eval 端到端 Agent 基准居首
* **MSA 稀疏注意力**：MiniMax Sparse Attention 以 KV 块选择替代全量注意力，1M 长上下文推理成本约为前代的 **1/20**
* **限时 5 折**：API易 对齐官网限时优惠，0-512K 区间 **\$0.30 输入 / \$1.20 输出**（每 1M tokens），截止 **2026 年 6 月 8 日零点 (UTC+8)**
* **叠加充值活动更低**：配合 API易 充值加赠，实际成本最低可到约 **4.1 折**（5 折 ÷ 1.2）

<Info>
  MiniMax 官方于 2026 年 6 月 1 日发布 M3，并承诺 10 天内在 Hugging Face 与 GitHub 开放权重与技术报告。信息来源：`minimax.io/blog/minimax-m3`、`venturebeat.com`、`openrouter.ai/minimax/minimax-m3`，数据获取日期：2026-06-05。
</Info>

## 背景介绍

MiniMax 的 M 系列一直走"长上下文 + 高性价比"路线，M3 则把这条路线推向了新高度。2026 年 6 月 1 日，MiniMax 正式发布 M3，定位为**首个同时具备前沿编程 Agent 能力、100 万 tokens 上下文窗口与原生多模态（图像、视频输入与桌面计算机操作）的开源权重模型**。

M3 最大的技术亮点是 **MSA（MiniMax Sparse Attention）**：用 KV 块选择替代全量注意力，大幅削减长上下文下的逐 token 计算量——官方数据显示，1M tokens 场景下的推理成本约为前一代的 1/20，prefill 与 decode 速度也显著提升。这意味着"百万上下文"第一次在成本上变得真正可用。

对开发者而言更直接的信号是价格：官方为新模型推出**限时 5 折**优惠，API易 已同步对齐这一折扣，并支持叠加充值活动进一步拉低成本。

## 详细解析

### 核心特性

<CardGroup cols={2}>
  <Card title="100 万上下文" icon="book">
    **1M tokens 原生窗口**

    MSA 稀疏注意力支撑的真·百万上下文，整仓代码、长视频脚本、超长 Agent 轨迹一次吞下。
  </Card>

  <Card title="MSA 稀疏注意力" icon="microchip">
    **长上下文成本降至 1/20**

    KV 块选择替代全量注意力，长上下文 prefill / decode 速度官方称比开源同类快 4 倍以上。
  </Card>

  <Card title="前沿 Agent 编程" icon="code">
    **SWE-Bench Pro 59.0**

    反超 GPT-5.5 与 Gemini 3.1 Pro，Terminal-Bench 2.1 66.0，真实软工任务可当主力。
  </Card>

  <Card title="原生多模态" icon="image">
    **图像 / 视频 / 计算机操作**

    从预训练阶段即采用图文交错数据，支持图像视频输入与桌面计算机操作，OmniDocBench 超过 Gemini 3.1 Pro。
  </Card>
</CardGroup>

### 性能亮点

以下数据来源于 MiniMax 官方发布与第三方公开报道：

| 评测维度                         | MiniMax-M3 | 对比                        |
| ---------------------------- | ---------- | ------------------------- |
| SWE-Bench Pro（真实软工）          | **59.0**   | 超过 GPT-5.5、Gemini 3.1 Pro |
| Terminal-Bench 2.1（终端 Agent） | **66.0**   | 开源模型领先水平                  |
| MCP Atlas（工具调用）              | **74.2**   | —                         |
| BrowseComp（自主浏览检索）           | **83.5**   | 超过 Claude Opus 4.7（79.3）  |
| Claw-Eval（端到端 Agent）         | **第一名**    | 居所有参测模型之首                 |
| OmniDocBench（文档多模态）          | 领先         | 超过 Gemini 3.1 Pro         |

<Tip>
  M3 官方演示中已能**自主复现学术论文**并**优化 CUDA kernel**，长程推理与工程执行能力均达到第一梯队。配合开源权重（10 天内发布），自研 Agent 团队可以走"API 调用 + 离线评测"双轨。
</Tip>

### 技术规格

<Card title="工程参数一览" icon="sliders-horizontal">
  * **模型 ID**：`MiniMax-M3`（注意大小写）
  * **注意力机制**：MSA（MiniMax Sparse Attention，KV 块选择）
  * **上下文长度**：1M tokens（原生）
  * **多模态**：✅ 图像 / 视频输入、桌面计算机操作
  * **计费方式**：按输入长度阶梯计费（0-512K / 512K 以上）
  * **接口兼容**：OpenAI ChatCompletions 兼容
  * **开源计划**：权重与技术报告 10 天内登陆 Hugging Face / GitHub
</Card>

<Warning>
  M3 采用**阶梯计费**：单次请求输入超过 512K tokens 后，超出部分按更高档单价计费（输入 \$0.60 / 输出 \$2.40 每 1M tokens，限时价）。做百万级长上下文任务时请预估好成本。
</Warning>

## 实际应用

### 推荐场景

<CardGroup cols={2}>
  <Card title="整仓代码 Agent" icon="code">
    1M 上下文 + SWE-Bench Pro 59.0，大型仓库重构、跨文件 PR 任务不再需要切片检索
  </Card>

  <Card title="自主浏览与研究" icon="globe">
    BrowseComp 83.5 登顶，适合做深度调研 Agent、自动化信息采集与汇总
  </Card>

  <Card title="长文档 / 视频理解" icon="file-text">
    原生多模态 + 百万上下文，超长合同、研究报告、视频内容一次性分析
  </Card>

  <Card title="计算机操作 Agent" icon="bot">
    原生桌面操作能力，适合构建 RPA、自动化测试、电脑使用类 Agent
  </Card>
</CardGroup>

### 快速开始（OpenAI 兼容接口）

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

# 注意模型名大小写：MiniMax-M3
resp = client.chat.completions.create(
    model="MiniMax-M3",
    messages=[
        {"role": "system", "content": "你是一名资深全栈工程师，擅长在大型代码库中完成 PR 级任务。"},
        {"role": "user", "content": "通读这个仓库的全部源码，找出限流中间件的性能瓶颈并给出修复方案"}
    ],
    temperature=0.3,
)
print(resp.choices[0].message.content)
```

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-your-apiyi-key" \
  -d '{
    "model": "MiniMax-M3",
    "messages": [{"role": "user", "content": "用一段话介绍 MSA 稀疏注意力"}]
  }'
```

### 最佳实践

* **模型名大小写**：模型 ID 为 `MiniMax-M3`，注意 `M` 大写，写错会导致 404 模型不存在
* **成本控制**：尽量把单次输入控制在 512K 以内即可享受最低档单价；超长任务建议先做摘要 / 裁剪
* **温度参数**：Agent / 代码场景建议 `temperature=0.2 ~ 0.4`
* **流式输出**：长上下文任务 prefill 时间较长，建议开启 stream 改善体感延迟
* **限时窗口**：5 折优惠截止 6 月 8 日零点 (UTC+8)，重度评测 / 跑批任务建议安排在窗口期内

## 价格与可用性

### 定价表（USD / 1M tokens，限时 5 折）

| 输入长度区间   | 提示价格（输入）     | 补全价格（输出）     |
| -------- | ------------ | ------------ |
| 0 - 512K | **\$0.3000** | **\$1.2000** |
| 512K 以上  | **\$0.6000** | **\$2.4000** |

<Info>
  API易 已**对齐 MiniMax 官网限时 5 折**优惠，上表即为当前实际挂牌价，按输入长度阶梯计费。优惠截止 **2026 年 6 月 8 日零点 (UTC+8)**，到期后折扣待定。
</Info>

### 叠加网站充值活动

5 折限时价还能叠加 API易 充值加赠，**实际成本最低约 4.1 折**（5 折 ÷ 1.2）：

<Card title="充值活动" icon="gift" href="/faq/recharge-promotions">
  查看最新充值加赠规则，越大额加赠比例越高
</Card>

## 总结与建议

MiniMax-M3 把"开源 + 百万上下文 + 多模态 Agent"三件事第一次装进了同一个模型：

* ✅ **基准反超**：SWE-Bench Pro 59.0 领先 GPT-5.5 / Gemini 3.1 Pro，BrowseComp 83.5 超过 Opus 4.7
* ✅ **百万上下文真可用**：MSA 稀疏注意力把 1M 上下文成本压到前代 1/20
* ✅ **价格窗口期**：限时 5 折 + 充值加赠，最低约 4.1 折，6 月 8 日零点 (UTC+8) 截止
* ✅ **开源在路上**：权重与技术报告 10 天内开放，API 先用起来、离线评测随后跟上

**推荐行动**：

1. 在 Claude Code / Cursor / 自研 Agent 里把 `MiniMax-M3` 加入 A/B 测试，重点跑整仓代码与长程任务
2. 长文档 / 视频理解类需求趁 5 折窗口期做一轮完整评测
3. 配合充值加赠把单价进一步压到约 4.1 折，跑批任务安排在 6 月 8 日零点 (UTC+8) 之前

<Info>
  **信息来源与日期**

  * MiniMax 官方发布：`minimax.io/blog/minimax-m3`
  * 第三方报道：`venturebeat.com`、`techtimes.com`、`officechai.com`
  * 价格页：`openrouter.ai/minimax/minimax-m3`
  * 数据获取日期：2026-06-05
</Info>
