> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 4.5 正式上线：Opus 级性能一半价格

> xAI（SpaceXAI）最新旗舰 Grok 4.5 已上架 API易：与 Cursor 联合训练、主打编程与 Agent 任务，官方同价 $2/$6 每百万 tokens，输出 token 效率比 Opus 4.8 高约 4 倍。

## 核心要点

* **发布即上架**：Grok 4.5 于 2026年7月8日 发布，API易已同步上架，模型名 `grok-4.5`，default / svip 分组可用
* **Opus 级定位**：马斯克称其为「Opus 级模型，但更快、更省 token、更便宜」；Artificial Analysis 智能指数 54 分，位列第 4（仅次于 Claude Fable 5、Opus 4.8、GPT-5.5），**Agentic 工具调用单项登顶**
* **编程与 Agent 特长**：与 Cursor（已被 SpaceX 收购）联合训练，Terminal Bench 2.1 达 83.3%，逼近 Fable (max) 的 84.3%；Harvey 法律 Agent 评测排名第 1
* **token 效率突出**：SWE Bench Pro 上平均输出仅 15,954 tokens，约为 Opus 4.8 (max) 的 1/4.2，任务步数减半，实际成本进一步压低
* **价格锋利**：输入 \$2.00 / 百万 tokens、输出 \$6.00 / 百万 tokens，约为同级旗舰的一半

## 背景介绍

2026年7月8日，SpaceXAI（xAI 并入 SpaceX 后的新品牌）发布了 Grok 4.5，官方称其为「迄今最聪明的模型」，面向编程、Agent 任务与知识工作三大场景。

这次发布有两个值得关注的信号：一是训练方式——Grok 4.5 与 AI 编程工具 Cursor 联合训练，强化学习覆盖了数十万个真实任务，训练跑在数万张 NVIDIA GB300 GPU 上；二是定价策略——在基准测试略逊于 Claude Fable 5 的情况下，用一半左右的价格换取「性价比拉满」的市场位置，行业媒体普遍认为这会对 Anthropic 和 OpenAI 形成价格压力。

需要注意的是，Grok 4.5 目前尚未在欧盟开放（官方预计 7 月中旬），通过 API易 网关则不受此限制，全球可直接调用。

## 详细解析

### 性能基准（数据获取于 2026/7/10）

| 基准测试                     | Grok 4.5  | 对比（Fable max） |
| ------------------------ | --------- | ------------- |
| Artificial Analysis 智能指数 | 54（第 4 名） | —             |
| DeepSWE 1.0 (pass\@1)    | 62.0%     | 66.1%         |
| Terminal Bench 2.1       | 83.3%     | 84.3%         |
| SWE Bench Pro            | 64.7%     | 80.4%         |
| Harvey 法律 Agent          | 第 1 名     | —             |
| Agentic 工具调用             | 单项第 1     | —             |

<Info>
  基准数据来源：SpaceXAI 官方公告 `x.ai/news/grok-4-5`、`artificialanalysis.ai/models/grok-4-5`、`marktechpost.com`（2026年7月8日）。
</Info>

### 核心特性

<CardGroup cols={2}>
  <Card title="Agent 与编程特长" icon="terminal">
    与 Cursor 联合训练，Agentic 工具调用登顶，任务步数比同级模型少一半左右，适合编码 Agent、终端自动化
  </Card>

  <Card title="token 效率" icon="gauge">
    SWE Bench Pro 平均输出 15,954 tokens，约为 Opus 4.8 (max) 67,020 的 1/4.2，同任务实际花费更低
  </Card>

  <Card title="长上下文" icon="scroll">
    500K 上下文窗口（超过 200K 的部分按官方高上下文费率计费），支持文本 + 图像输入
  </Card>

  <Card title="速度" icon="zap">
    实测输出约 80-90 tokens/s，高于同级平均水平（约 76 tokens/s）
  </Card>
</CardGroup>

## 实际应用

### 推荐场景

* **编码 Agent / IDE 集成**：Cursor 同源训练，工具调用与终端任务表现突出
* **高频 Agent 流水线**：token 效率高、步数少，长链路任务成本优势会被放大
* **知识工作**：法律等专业 Agent 场景有实测第一的成绩

### 代码示例

```python theme={null}
import openai

client = openai.OpenAI(
    api_key="your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="grok-4.5",
    messages=[
        {"role": "user", "content": "用 Python 写一个二分查找，并解释边界条件"}
    ]
)
print(response.choices[0].message.content)
```

OpenAI 兼容格式，存量代码只需把 `model` 换成 `grok-4.5`。

## 价格与可用性

### 定价信息

| 计费项  | 官方 API             | API易                     |
| ---- | ------------------ | ------------------------ |
| 输入   | \$2.00 / 百万 tokens | \$2.00 / 百万 tokens（官方同价） |
| 输出   | \$6.00 / 百万 tokens | \$6.00 / 百万 tokens（官方同价） |
| 缓存输入 | \$0.50 / 百万 tokens | 按缓存命中自动折算                |

<Info>
  官方口径：超过 200K tokens 的高上下文请求按更高费率计费；欧盟区官方暂未开放（预计 7 月中旬），API易 通道不受区域限制。
</Info>

### 叠加网站充值活动

API易 充值加赠活动可叠加使用，实际到手价低于官方直充，详见[充值优惠说明](/faq/recharge-promotions)。

## 总结与建议

Grok 4.5 的定位非常清晰：不去死磕基准榜第一，而是用「Opus 级能力 + 一半价格 + 4 倍 token 效率」抢占 Agent 与编程的走量场景。如果你的主力工作负载是编码 Agent、工具调用密集的自动化任务，或对成本敏感的长链路流水线，Grok 4.5 值得纳入首选测试清单；追求极限推理与复杂研究能力的场景，Claude Fable 5、GPT-5.5 仍是上限更高的选择。

<Info>
  信息来源：SpaceXAI 官方公告 `x.ai/news/grok-4-5`、TechCrunch、Artificial Analysis、MarkTechPost；数据获取日期 2026年7月10日。模型已在 API易 上架，获取密钥后即可调用。
</Info>
