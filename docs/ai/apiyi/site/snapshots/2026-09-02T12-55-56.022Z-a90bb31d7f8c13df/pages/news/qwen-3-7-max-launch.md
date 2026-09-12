> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.7-Max 上线：登顶国产、Intelligence Index 全球第五

> 阿里通义千问发布旗舰新一代 Qwen3.7-Max：Artificial Analysis Intelligence Index 56.6 排名全球第五、国产第一，Terminal-Bench 2.0 达 69.7，1M 上下文。API易官转挂牌 $1.7140/$5.1420 每 1M tokens，与官网持平。

## 核心要点

* **全球前五 · 国产第一**：Artificial Analysis Intelligence Index 56.6，超越 Gemini 3.5 Flash（55.3），位列国产模型第一
* **Agent 长程能力突破**：自主执行 35 小时连续任务、1,158 次工具调用、432 轮内核评估，无需人工干预
* **Terminal-Bench 2.0 达 69.7**：编程/工具调用类基准持续登顶，Terminal-Bench Hard 50.8%（+6.9）
* **1M 超长上下文**：上下文窗口由 256K 翻倍至 1M tokens，长程任务原生承载
* **token 效率提升 31%**：解同一道题的输出 tokens 增长，意味着推理更稠密、单题成本不显著上升
* **API易官转直连**：挂牌 \$1.7140/\$5.1420 每 1M tokens（输入/输出），与阿里云官网完全一致

## 背景介绍

2026 年 5 月 20 日 (UTC+8)，阿里通义千问发布旗舰大模型 **Qwen3.7-Max**，定位为"面向 Agent 时代的下一代旗舰模型"。这是 Qwen 3.x 系列继 Qwen3.6 Max Preview 之后的关键升级 —— Artificial Analysis Intelligence Index 从 51.8 跃升至 **56.6**（+4.8），首次将国产模型推到该综合榜单的**全球前五**位置，并超越同期 Google Gemini 3.5 Flash（55.3）。

更引人关注的是其 **agent 长程能力**：在阿里官方公布的内部测试中，Qwen3.7-Max 在平头哥 Zhenwu M890 PPU 上为 Extend Attention kernel 做自动优化，**连续运行 35 小时**，执行 1,158 次工具调用、432 轮内核评估，迭代出 5 种不同架构方案，最终相对 Triton 参考实现取得 **10× 的几何平均加速**。整个过程**没有人工介入**——这种"放手让它自己干一天半"的长程稳定性，是 Qwen 3.x 系列以往未达到的高度。

<Info>
  **数据来源**：阿里通义千问官方博客 `qwen.ai/blog`、Artificial Analysis Intelligence Index 2026/5 数据、TechNode 报道（2026/5/21）、Digg 综合报道。数据获取日期：2026/5/21 (UTC+8)。
</Info>

## 详细解析

### 核心特性

<CardGroup cols={2}>
  <Card title="国产综合智能第一" icon="trophy">
    Artificial Analysis Intelligence Index 56.6，超越 Gemini 3.5 Flash，是该榜首个进入全球前五的中国模型。
  </Card>

  <Card title="Agent 长程稳定" icon="infinity">
    单任务连续运行 35 小时、1,158 次工具调用、432 轮迭代评估，无人工干预，长程任务可放手。
  </Card>

  <Card title="百万级上下文" icon="brain">
    上下文窗口由上一代 256K 翻倍至 1M tokens，长文档分析、超长代码库阅读、长程对话原生支持。
  </Card>

  <Card title="编程/工具能力领先" icon="terminal">
    Terminal-Bench 2.0 69.7，Terminal-Bench Hard 50.8%（+6.9 vs Qwen3.6 Max Preview），实战工具调用领先。
  </Card>
</CardGroup>

### 性能亮点

相比上一代 Qwen3.6 Max Preview，Qwen3.7-Max 在科学推理、agent 能力、编程能力三大维度集中提升：

| Benchmark                              | Qwen3.6 Max Preview | Qwen3.7-Max | 提升      |
| -------------------------------------- | ------------------- | ----------- | ------- |
| Artificial Analysis Intelligence Index | 51.8                | **56.6**    | +4.8    |
| Terminal-Bench 2.0                     | —                   | **69.7**    | —       |
| Terminal-Bench Hard                    | 43.9%               | **50.8%**   | +6.9 pp |
| Humanity's Last Exam                   | 28.9%               | **38.1%**   | +9.2 pp |
| CritPt                                 | 3.7%                | **13.4%**   | +9.7 pp |
| GDPval-AA (Elo)                        | 1504                | **1546**    | +42     |

幻觉与可信度方面，Qwen3.7-Max 在 **AA-Omniscience** 上表现出"更高的弃答率"——attempt rate 降到 48.0%，是同档前沿模型中最低的。换言之，**它更愿意说"我不确定"**，而不是硬答错。这种"自知之明"的取舍对生产 agent 场景很重要：错误答案比沉默更危险。

### 35 小时连续任务案例

阿里在官方博客详细披露了一个**全自动内核优化案例**：

* **任务**：在 T-Head Zhenwu M890 PPU 上优化 Extend Attention kernel
* **时长**：约 35 小时连续自主执行
* **过程**：1,158 次工具调用、432 轮 kernel 评估、5 种架构方案迭代
* **结果**：相对 Triton 参考实现，多负载下几何平均加速 **10.0×**

这种规模的 agent 任务在以往的模型上很难持续——上下文会爆、目标会漂移、错误会累积。Qwen3.7-Max 能跑完，靠的是 1M 上下文、抗漂移的指令遵循能力，以及对"工具失败-重试-调整策略"循环的稳定执行。

### 技术规格

| 规格项   | 数值                          |
| ----- | --------------------------- |
| 模型 ID | `qwen3.7-max`               |
| 上下文窗口 | 1,000,000 tokens            |
| 模态    | 文本输入 / 文本输出                 |
| 发布形态  | Preview，API 接入              |
| 接入通道  | API易 官转直连（阿里云 Model Studio） |

<Warning>
  **Preview 阶段**：Qwen3.7-Max 目前为 Preview 版本，开源权重暂未释出。生产使用前请按 Preview 模型的常规做法做版本锁定与回归测试。
</Warning>

## 实际应用

### 推荐场景

<CardGroup cols={2}>
  <Card title="长程 Agent 工作流" icon="bot">
    多步骤、跨工具、需要长时间稳定执行的任务（代码重构、研究调研、数据流水线维护）。
  </Card>

  <Card title="复杂编程任务" icon="code">
    Terminal-Bench 2.0 69.7 + Hard 50.8%，适合代码生成、debug、工具调用密集型工作流。
  </Card>

  <Card title="长文档分析" icon="file-text">
    1M 上下文容纳大型代码库、长报告、长合同；与 RAG 配合时减少切片成本。
  </Card>

  <Card title="科研/推理任务" icon="flask-conical">
    Humanity's Last Exam +9.2、CritPt +9.7，对科学推理与开放问题的处理能力显著提升。
  </Card>
</CardGroup>

### 代码示例

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

# 基础对话
response = client.chat.completions.create(
    model="qwen3.7-max",
    messages=[
        {"role": "system", "content": "你是一个严谨的高级工程师，回答要给出具体证据和数字。"},
        {"role": "user", "content": "讲讲 Triton 与 PPU 自定义 kernel 在 attention 计算上的差异"}
    ]
)
print(response.choices[0].message.content)
```

Agent 工作流（Function Calling）示例：

```python theme={null}
tools = [{
    "type": "function",
    "function": {
        "name": "run_shell",
        "description": "Execute a shell command and return stdout/stderr",
        "parameters": {
            "type": "object",
            "properties": {"cmd": {"type": "string"}},
            "required": ["cmd"]
        }
    }
}]

response = client.chat.completions.create(
    model="qwen3.7-max",
    messages=[
        {"role": "user", "content": "用 ripgrep 找出仓库里所有 TODO，按文件分组列出。"}
    ],
    tools=tools,
    tool_choice="auto"
)
```

### 最佳实践

* **长程任务先做 checkpoint**：35 小时级任务建议在业务层加阶段性 checkpoint（保存中间产物、可断点续跑），避免单点失败抹掉前面的工作。
* **善用 1M 上下文**：长代码库审阅、长合同对比可一次性塞入，比 RAG 切片 + 重排更稳定，但 token 成本要核算。
* **吃 token 效率红利**：Qwen3.7-Max 的输出 token 比上一代多 31% —— 思考更稠密，意味着同样难题的最终答案更靠谱，但单次调用要预算更多输出预算。
* **生产前 pin 版本**：Preview 模型可能有快照升级，生产用 model snapshot 而不是别名，便于回归。

## 价格与可用性

### 定价对照

| 项目 | 阿里云官网（RMB）       | API易挂牌（USD）          |
| -- | ---------------- | -------------------- |
| 输入 | 12 元 / 1M tokens | \$1.7140 / 1M tokens |
| 输出 | 36 元 / 1M tokens | \$5.1420 / 1M tokens |

<Info>
  **汇率说明**：API易采用 **1:7 固定汇率** 将阿里云人民币定价换算为 USD 挂牌价（12 ÷ 7 ≈ 1.7143、36 ÷ 7 ≈ 5.1428）。这是固定换算，不是优惠汇率，目的是让 USD 计价的客户和 RMB 官网账单一一对应。
</Info>

### 叠加充值活动

API易常驻 [充值加赠活动](/faq/recharge-promotions)，单次充值越多、赠送比例越高，赠送额度直接进入余额：

* **充 \$100 → 实付价约 86 折**
* **充 \$300+ → 实付价可达 79 折**（视档位，详见充值优惠 FAQ）

折扣体现在赠送额度上，与挂牌价分开计算。如有企业大额采购需求，可联系客服微信。

### 可用分组

| 分组        | 是否开放 | 说明         |
| --------- | ---- | ---------- |
| `Default` | ✅    | 默认分组直接调用   |
| `SVIP`    | ✅    | 高优先级，无额外倍率 |

## 总结与建议

Qwen3.7-Max 不只是数据上的提升 —— 它把**国产模型在"agent 长程能力"上的天花板顶到了一个新位置**：

1. **综合智能登顶国产**：56.6 的 Intelligence Index 让"国产能不能用"这个问题在大多数场景下变成"用哪个国产"
2. **Agent 长程稳定**：35 小时无干预自主跑完一个真实优化任务，意味着 dev agent / research agent 等长程产品形态在国产模型上变得可行
3. **价格透明**：API易挂牌完全对齐阿里云官网，汇率固定 1:7，叠加充值活动还能进一步下降

<Warning>
  **选型建议**：如果你的工作流涉及**长上下文 + 多工具调用 + 多步骤推理**，Qwen3.7-Max 现在是国产模型里的首选。对于纯对话或单步任务，更轻量的 Qwen3.6-Flash 或 Qwen3.6-Plus 性价比更高。
</Warning>

<Info>
  **信息来源**：阿里通义千问官方博客 `qwen.ai/blog`、Artificial Analysis Intelligence Index 2026/5 数据、TechNode 报道（2026/5/21）、Digg / Pandaily / SCMP 综合报道。数据获取日期：2026/5/21 (UTC+8)。
</Info>
