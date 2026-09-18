> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 4.6 上线：智能指数 61 追平 GPT-5.6

> SpaceXAI（xAI）新旗舰 Grok 4.6 已上架 API易：Artificial Analysis 智能指数 61 分，追平 GPT-5.6 Sol Max、较 Grok 4.5 提升 5 分。挂牌与官网同价 $2/$6 每百万 tokens，GrokOfficial 分组 8 折，叠加充值加赠后输入低至 $1.33。

## 核心要点

* **新旗舰上架**：Grok 4.6 于 2026年8月7日 发布，API易 已同步上架，模型名 `grok-4.6`
* **智能指数 61**：Artificial Analysis 智能指数（High 档）由 Grok 4.5 的 56 分升至 **61 分**，与 GPT-5.6 Sol Max 持平
* **靠后训练拿分**：沿用 Grok 4.5 的 1.5T 参数 V9 基座，提升全部来自更充分的监督微调（SFT）与强化学习（RL），而非堆参数
* **长任务自检更强**：官方口径称其在长周期任务中的自我测试与验证能力明显增强，交互式项目里搭出初版框架更快
* **挂牌官方同价，分组再打 8 折**：\$2.00 / \$6.00 每百万 tokens 与 xAI 官网一致；`GrokOfficial` 分组倍率 0.8x，叠加充值加赠 10%–20% 后**输入低至 \$1.33、输出低至 \$4.00**

## 背景介绍

2026 年 7 月 8 日 Grok 4.5 发布后，马斯克随即预告了「4.6 两周后、4.7 再过一个月」的密集节奏。8 月 7 日，SpaceXAI 正式发布 Grok 4.6——距上一代仅一个月。

这次发布的技术路线值得单独说一句：Grok 4.6 **没有换基座**。它复用 Grok 4.5 的 1.5T 参数 V9 基础模型，把全部增量投入到监督微调与强化学习中。换句话说，这是一次「后训练拿分」而非「参数拿分」的迭代，代价是训练成本与推理成本都没有随之上涨——这也是它能维持与 Grok 4.5 完全相同挂牌价的原因。

对使用方来说，最直接的含义是：**同样的价格、同样的速度与 token 效率，换来一个高 5 分的智能指数**。如果你已经在跑 `grok-4.5`，切换的边际成本接近于零。

## 详细解析

### 性能基准（数据获取于 2026/8/13）

| 基准 / 指标                        | Grok 4.6          | Grok 4.5 | 对照                   |
| ------------------------------ | ----------------- | -------- | -------------------- |
| Artificial Analysis 智能指数（High） | **61**            | 56       | 与 GPT-5.6 Sol Max 持平 |
| GDPval-AA v2（持续性知识工作）          | 榜首梯队              | Elo 1543 | —                    |
| AA-Briefcase                   | 榜首梯队              | —        | —                    |
| Harvey LAB（法律 Agent）           | 榜首梯队              | 第 1 名    | —                    |
| 参数规模                           | 1.5T（V9 基座，同 4.5） | 1.5T     | —                    |

<Info>
  基准数据来源：SpaceXAI 官方公告 `x.ai/news/grok-4-6`、`artificialanalysis.ai`，以及 TradingKey、kie.ai 等媒体报道；数据获取日期 2026年8月13日。xAI 未逐项公布 SWE-Bench Pro / Terminal Bench 分数，上表只列已公开的口径。
</Info>

### 核心特性

<CardGroup cols={2}>
  <Card title="长任务自检" icon="repeat">
    官方强调其在长周期 Agent 任务中的自我测试与验证能力增强，多步骤任务更少走偏，适合代码库协作、从想法到应用的完整链路
  </Card>

  <Card title="500K 上下文" icon="scroll">
    500K 上下文窗口，支持文本 + 图像输入；超过 200K 的请求按第二档高上下文费率计费
  </Card>

  <Card title="成本与速度不变" icon="gauge">
    基座未换，继承 Grok 4.5 的 token 效率与出字速度，挂牌价一分未涨
  </Card>

  <Card title="Codex 原生可用" icon="terminal">
    Grok 原生支持 `/v1/responses`，可在 OpenAI Codex 里以 responses 原生协议直接使用
  </Card>
</CardGroup>

### 技术规格

| 项目    | 参数                                     |
| ----- | -------------------------------------- |
| 模型名   | `grok-4.6`                             |
| 上下文窗口 | 500K tokens                            |
| 输入模态  | 文本、图像                                  |
| 端点    | `/v1/chat/completions`、`/v1/responses` |
| 计费方式  | 阶梯计费，200K tokens 为分档点                  |

## 实际应用

### 推荐场景

* **长周期编码 Agent**：自检与验证能力是这一代的主升级方向，长链路任务的返工率更低
* **知识工作与专业 Agent**：GDPval-AA v2、AA-Briefcase、Harvey LAB 三项均在榜首梯队
* **已在用 grok-4.5 的存量业务**：同价同速，直接改模型名即可获得指数提升
* **Codex / IDE 集成**：走原生 responses 协议，工具调用与推理条目完整

### 代码示例

```python theme={null}
import openai

client = openai.OpenAI(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="grok-4.6",
    messages=[
        {"role": "user", "content": "重构这段代码并解释你改了什么"}
    ]
)
print(response.choices[0].message.content)
```

OpenAI 兼容格式，存量代码只需把 `model` 换成 `grok-4.6`。接入细节、四大 server-side 工具与参数注意事项，与 Grok 4.x 系列一致，见 [Grok 模型概览](/api-capabilities/grok/overview)。

<Warning>
  Grok 4.x 对话模型**默认带内部推理**，推理 tokens 计入输出计费。对成本敏感的短问答场景，请参考 [对话与推理](/api-capabilities/grok/chat) 中的模型选型建议。
</Warning>

## 价格与可用性

### 定价信息

挂牌价与 xAI 官网完全一致，采用阶梯计费：

| 上下文档位              | 输入          | 输出           | 缓存读取        |
| ------------------ | ----------- | ------------ | ----------- |
| 0 – 200K tokens    | \$2.00 / 1M | \$6.00 / 1M  | \$0.50 / 1M |
| 200K – 512K tokens | \$4.00 / 1M | \$12.00 / 1M | \$1.00 / 1M |

### 分组折扣与叠加

`GrokOfficial` 官转分组倍率 **0.8x**，即默认分组售价的 **8 折**，模型能力与调用方式和默认分组完全一致，创建令牌时选择该分组即可，代码无需改动。

折扣可与充值加赠叠加。以第一档为例：

| 口径                 | 输入 / 1M tokens | 输出 / 1M tokens |
| ------------------ | -------------- | -------------- |
| xAI 官网             | \$2.00         | \$6.00         |
| API易 挂牌            | \$2.00（官方同价）   | \$6.00（官方同价）   |
| `GrokOfficial` 8 折 | \$1.60         | \$4.80         |
| 8 折 + 充值加赠 10%     | \$1.45         | \$4.36         |
| 8 折 + 充值加赠 20%     | **\$1.33**     | **\$4.00**     |

### 叠加网站充值活动

充值阶梯加赠比例为 10%–20%（按单次充值金额计），与分组折扣叠加后到手价进一步下探，详见[充值优惠说明](/faq/recharge-promotions)。

## 总结与建议

Grok 4.6 是一次「不涨价的能力升级」：基座没动，价格没动，速度与 token 效率没动，换来的是智能指数从 56 到 61、追平 GPT-5.6 Sol Max。这种迭代对存量用户最友好——把 `grok-4.5` 改成 `grok-4.6` 就是净收益，不需要重新做成本测算。

如果你的负载是长周期编码 Agent、工具调用密集的自动化流水线，或法律 / 咨询类专业 Agent，建议直接把 `grok-4.6` 设为默认；对成本极度敏感、且任务足够简单的场景，`grok-4.3`（1M 上下文、\$1.25/\$2.50）仍是更便宜的选择。想把成本压到最低，记得走 `GrokOfficial` 分组并叠加充值加赠。

<Info>
  信息来源：SpaceXAI 官方公告 `x.ai/news/grok-4-6`、xAI 开发者文档 `docs.x.ai/docs/models`、Artificial Analysis、TradingKey；数据获取日期 2026年8月13日。模型已在 API易 上架，获取密钥后即可调用。
</Info>
