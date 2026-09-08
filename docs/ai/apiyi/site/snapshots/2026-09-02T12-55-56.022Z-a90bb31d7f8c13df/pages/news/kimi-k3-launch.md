> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Kimi K3 上线：2.8 万亿参数开源之最

> 月之暗面发布 Kimi K3：2.8 万亿参数 MoE、Kimi Delta Attention、1M 上下文，LMArena Frontend Code Arena 登顶第一。API易挂牌 $3/$15 每 1M tokens 与官网一致，叠加充值活动最多 83 折。

## 核心要点

* **史上最大开源模型**：2.8 万亿总参数 MoE 架构，首个进入 3 万亿参数级别的开源模型，官方承诺 2026 年 7 月 27 日 (UTC+8) 前放出全量权重
* **Kimi Delta Attention + 1M 上下文**：精确 1,048,576 tokens 上下文窗口，全区间统一计价，不按上下文长度阶梯涨价
* **Frontend Code Arena 全球第一**：LMArena 前端代码竞技场从 K2.6 的第 18 名跃升至第 1，7 个前端领域拿下 6 个单项第一
* **推理/Agent 硬指标亮眼**：GPQA Diamond 93.5%、Terminal-Bench 2.1 88.3%、BrowseComp 91.2%、HLE（带工具）56.0%
* **原生多模态 + 常开思考**：原生视觉输入（图片/视频），思考模式默认满档运行（`reasoning_effort="max"`）
* **API易同价直连**：挂牌 \$3.00/\$15.00 每 1M tokens（输入/输出），与月之暗面官网完全一致，缓存命中输入低至 \$0.30

## 背景介绍

2026 年 7 月 16 日 (UTC+8)，月之暗面（Moonshot AI）正式发布新一代旗舰大模型 **Kimi K3**。这是继 Kimi K2 系列在开源社区大获成功之后的重磅升级——2.8 万亿总参数的 MoE 架构使其成为**迄今为止最大的开源模型**，多家外媒评价其达到了与顶级闭源模型正面竞争的水准。

K3 引入了新的 **Kimi Delta Attention** 注意力机制，将上下文窗口做到精确的 1,048,576 tokens，并且全上下文区间**统一计价**——不像部分厂商在超过某个长度后按更高档位收费。API 已于发布当日开放，全量开源权重官方承诺在 7 月 27 日 (UTC+8) 前释出。

<Info>
  **数据来源**：月之暗面官方文档 `platform.kimi.ai/docs/guide/kimi-k3-quickstart`、官方定价页 `platform.kimi.ai/docs/pricing/chat-k3`、VentureBeat / Tom's Hardware / Axios / MarkTechPost 报道。数据获取日期：2026/7/18 (UTC+8)。
</Info>

## 详细解析

### 核心特性

<CardGroup cols={2}>
  <Card title="开源之最" icon="trophy">
    2.8 万亿总参数 MoE，史上最大开源模型；权重将于 2026/7/27 (UTC+8) 前全量释出，可自部署可微调。
  </Card>

  <Card title="1M 统一计价上下文" icon="brain">
    Kimi Delta Attention 支撑 1,048,576 tokens 上下文，全区间价格不分档，长文档任务成本可预期。
  </Card>

  <Card title="前端代码全球第一" icon="code">
    LMArena Frontend Code Arena 排名第 1（K2.6 为第 18），7 个前端领域中 6 个单项第一。
  </Card>

  <Card title="原生多模态 + 满档思考" icon="eye">
    原生图片/视频输入；思考模式常开且默认满档（reasoning\_effort=max），复杂推理开箱即用。
  </Card>
</CardGroup>

### 性能亮点

发布当日官方公布的关键基准（2026/7/16）：

| Benchmark                   | Kimi K3 成绩 | 说明                    |
| --------------------------- | ---------- | --------------------- |
| GPQA Diamond                | **93.5%**  | 研究生级科学推理              |
| Terminal-Bench 2.1          | **88.3%**  | 终端/工具实战能力             |
| BrowseComp                  | **91.2%**  | 自主网页浏览与信息检索           |
| Humanity's Last Exam（带工具）   | **56.0%**  | 跨学科前沿难题               |
| MCP Atlas                   | **84.2%**  | MCP 工具生态调用            |
| LMArena Frontend Code Arena | **第 1 名**  | 由 K2.6 的第 18 名跃升 17 位 |

长上下文管理同样是亮点：官方报告在 300K tokens 触发上下文压缩（context compaction）时长程任务得分 91.2%，即便完全不做上下文管理、直接跑满 1M 窗口也有 90.4%——意味着**长程 agent 任务对上下文工程的依赖显著降低**。

### 技术规格

| 规格项   | 数值                             |
| ----- | ------------------------------ |
| 模型 ID | `kimi-k3`                      |
| 架构    | MoE，2.8 万亿总参数                  |
| 上下文窗口 | 1,048,576 tokens（全区间统一计价）      |
| 最大输出  | 默认 131,072，最高 1,048,576 tokens |
| 模态    | 文本 + 图片 + 视频输入 / 文本输出          |
| 思考模式  | 常开，默认 `reasoning_effort="max"` |
| 开源计划  | 2026/7/27 (UTC+8) 前释出全量权重      |

<Warning>
  **固定采样参数**：官方将 `temperature=1.0`、`top_p=0.95`、`presence_penalty=0`、`frequency_penalty=0` 设为固定值，请求中**不要**再传这些参数，传入自定义值可能报错或被忽略。
</Warning>

## 实际应用

### 推荐场景

<CardGroup cols={2}>
  <Card title="前端/全栈开发" icon="code">
    Frontend Code Arena 登顶第一，UI 生成、组件重构、前端 debug 是当前最强梯队。
  </Card>

  <Card title="长程 Agent 工作流" icon="bot">
    Terminal-Bench 2.1 88.3% + MCP Atlas 84.2%，多工具、多步骤任务稳定性强，1M 上下文免切片。
  </Card>

  <Card title="深度研究/检索" icon="search">
    BrowseComp 91.2%，自主浏览、交叉验证、写研究报告类任务表现突出。
  </Card>

  <Card title="多模态理解" icon="image">
    原生图片与视频输入，截图转代码、视频内容分析可直接调用。
  </Card>
</CardGroup>

### 代码示例

Kimi K3 完全兼容 OpenAI 接口格式，通过 API易 直接调用：

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="kimi-k3",
    messages=[
        {"role": "system", "content": "你是一个严谨的高级前端工程师。"},
        {"role": "user", "content": "用 React + Tailwind 实现一个带拖拽排序的看板组件"}
    ]
)
print(response.choices[0].message.content)
```

图片输入（原生视觉）：

```python theme={null}
response = client.chat.completions.create(
    model="kimi-k3",
    messages=[{
        "role": "user",
        "content": [
            {"type": "image_url", "image_url": {"url": "data:image/png;base64,<base64>"}},
            {"type": "text", "text": "把这张设计稿还原成 HTML + CSS"}
        ]
    }]
)
```

### 最佳实践

* **不要传采样参数**：`temperature` 等为官方固定值，请求里省略即可
* **长任务预留输出预算**：思考模式常开满档，输出 tokens 消耗高于常规模型，`max_completion_tokens` 默认 131,072、可按需调高
* **善用缓存**：Kimi K3 自动上下文缓存，命中部分输入按 \$0.30/1M 计费（是未命中价的 1/10），多轮对话和重复前缀场景收益显著
* **1M 上下文直塞长材料**：全区间统一计价，长代码库/长文档可整体放入，无需担心跨档位涨价

## 价格与可用性

### 定价信息

API易挂牌价与月之暗面官网**完全一致**：

| 项目        | 官网价格                | API易价格              |
| --------- | ------------------- | ------------------- |
| 输入（缓存未命中） | \$3.00 / 1M tokens  | \$3.00 / 1M tokens  |
| 输入（缓存命中）  | \$0.30 / 1M tokens  | \$0.30 / 1M tokens  |
| 输出        | \$15.00 / 1M tokens | \$15.00 / 1M tokens |

全上下文区间（直至 1M tokens）统一按上表计价，不分档加价。

### 叠加充值活动

API易常驻 [充值加赠活动](/faq/recharge-promotions)，赠送额度直接进入余额：

* **充 \$100 送 10% → 轻松 91 折**
* **大额档位最多可达 83 折**（视档位，详见充值优惠 FAQ）

折扣体现在赠送额度上，与挂牌价分开计算。企业大额采购可联系客服微信。

## 总结与建议

Kimi K3 把开源模型的天花板抬到了新高度：

1. **开源阵营的旗舰答案**：2.8 万亿参数 + 一周后放权重，"开源追平闭源"这件事第一次有了如此有分量的注脚
2. **前端/Agent 是最强卖点**：Frontend Code Arena 第一、Terminal-Bench 2.1 88.3%，写前端和跑长程 agent 任务可优先选它
3. **价格结构友好**：\$3/\$15 对 1M 上下文模型属实惠档位，缓存命中 1/10 价 + 全区间统一计价，长上下文成本可控

<Warning>
  **选型建议**：前端开发、agent 工作流、深度研究场景推荐直接上 Kimi K3；纯轻量对话场景其输出价（\$15/1M）偏高，可搭配更便宜的轻量模型分流。
</Warning>

<Info>
  **信息来源**：月之暗面官方文档与定价页（`platform.kimi.ai`）、VentureBeat、Tom's Hardware、Axios、MarkTechPost、人民网英文版报道。数据获取日期：2026/7/18 (UTC+8)。
</Info>
