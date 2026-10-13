> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 4.7 上线：2.1T 新基座，同价更强

> SpaceXAI（xAI）于 2026 年 9 月 21 日发布 Grok 4.7：换用 2.1T 参数新基座，Terminal-Bench 4.0 从 18% 升至 33%，价格与 Grok 4.6 相同，$2/$6 每百万 tokens。API易已上线，四项计费与官网一致。

## 核心要点

* **新旗舰已上线**：Grok 4.7 于 2026 年 9 月 21 日发布，API易 已同步上线，模型名 `grok-4.7`，`default` / `svip` / `CodexResponses` 分组可用
* **换了更大的基座**：参数规模 2.1T，比 Grok 4.6 的 1.5T 大约 40%；强化学习跑得更久，训练更侧重耗时数小时的长任务
* **编码 Agent 进步最明显**：独立评测 Artificial Analysis 实测 Terminal-Bench 4.0 从 18% 升至 **33%**，DeepSWE v1.1 从 65% 升至 **73%**
* **价格与上一代相同**：\$2 / \$6 每百万 tokens（输入 / 输出），缓存读取 \$0.50，超过 200K 按第二档计费，与 xAI 官网一致
* **单价没涨，单任务 token 变多**：Artificial Analysis 测得完成同一批任务的输出 tokens 约为 Grok 4.6 的两倍，按任务算的实际花费会上升

## 背景介绍

Grok 4.6 在 8 月 7 日发布时，走的是「不换基座、只加后训练」的路线，沿用 Grok 4.5 的 1.5T 参数底座。一个半月后的 Grok 4.7 换了思路：**换用更大的新基座**，参数升到 2.1T，再配合更长的强化学习，并在训练中加大了多小时长任务的比重。

xAI 对这一代的官方定位是「同价同速，相比 Grok 4.6 有明显提升」。补充训练数据里还加入了 SpaceX 的工程资料，包括 Starlink 卫星遥测、制造记录和工程故障日志，这也是它在电气工程基准 EEBench 上成绩突出的原因之一。

发布当天，Grok 4.7 同步上线 Grok 应用、Cursor、Grok Build 和 xAI API，GitHub Copilot 也在同日接入。马斯克同时预告了后续路线：Grok 4.8 是「有意义的一步」，Grok 4.9 对标 Astra / Fable 级别，Grok 5 冲击前沿第一，均未给出日期。

## 详细解析

### 性能基准

**独立评测（Artificial Analysis，数据获取于 2026/9/24）**

| 指标 | Grok 4.7 | Grok 4.6 | 说明 |
| - | - | - | - |
| Intelligence Index | **46** | 44 | 同版本指数对比；GPT-5.6 Sol 为 47，Claude Fable 5 为 50 |
| Coding Agent Index（Grok Build + xhigh） | **56** | 47 | 原生编码工具中排第 4 |
| Terminal-Bench 4.0 | **33%** | 18% | 提升最大的一项 |
| DeepSWE v1.1 | **73%** | 65% | — |
| GDPval-AA（Elo） | **1695** | 1605 | 知识工作类任务，仅次于 Claude Fable 5.1 |
| AA-Briefcase（Elo） | **1657** | 1546 | 仅次于 Claude Fable 5.1 |
| 幻觉率（AA-Omniscience） | **29%** | 34% | 越低越好 |

**xAI 官方自报**

| 基准 | Grok 4.7 | Grok 4.6 |
| - | - | - |
| CursorBench 4.0 | 46.3%（xhigh） | 40.4%（high） |
| SWE-Marathon v1.1 | 46.0%（high） | 31.9%（high） |
| EEBench（电气工程） | 66.0%（xhigh） | 60.0%（xhigh） |
| HealthBench Professional | 56.7%（xhigh） | 48.5%（xhigh） |

<Info>
  Artificial Analysis 的 Intelligence Index 在 8 月之后更新过版本，本表的 46 与 44 是同一版本下的对比，与 Grok 4.6 上线时报道的 61 分不能直接比较。官方自报成绩与独立评测在同名基准上略有出入（如 Terminal-Bench 4.0 官方报 38%），以上两表分开列出，便于核对来源。
</Info>

### 核心特性

<CardGroup cols={2}>
  <Card title="2.1T 新基座" icon="layers">
    参数规模比 Grok 4.6 大约 40%，配合更长的强化学习，训练更侧重耗时数小时的长任务
  </Card>

  <Card title="长任务自检" icon="repeat">
    长链路任务中的自我验证进一步增强，SWE-Marathon 这类多小时编码任务提升 14 个百分点
  </Card>

  <Card title="四档推理强度" icon="gauge">
    官方支持 `low` / `medium` / `high` / `xhigh` 四档，默认 `high`；独立评测的最好成绩多来自 `xhigh`
  </Card>

  <Card title="500K 上下文" icon="scroll">
    支持文本与图像输入、文本输出，不设输出长度上限；超过 200K 的请求整单按第二档计费
  </Card>
</CardGroup>

### 技术规格

| 项目 | 参数 |
| - | - |
| 模型名 | `grok-4.7` |
| 参数规模 | 2.1T |
| 上下文窗口 | 500K tokens |
| 输入 / 输出模态 | 文本、图像 / 文本 |
| 知识截止 | 预训练 2026 年 6 月，补充训练至 2026 年 8 月 |
| 推理强度 | `low` / `medium` / `high`（默认）/ `xhigh` |
| 计费方式 | 阶梯计费，200K tokens 为分档点 |

## 实际应用

### 推荐场景

* **长周期编码 Agent**：Terminal-Bench、SWE-Marathon 这类长任务基准提升最大，适合在代码库里连续工作数小时的自动化流程
* **知识工作类 Agent**：GDPval-AA、AA-Briefcase 均仅次于 Claude Fable 5.1，适合报告撰写、资料整理、分析类任务
* **工程与硬件领域问答**：训练中加入了 SpaceX 工程资料，电气工程基准 EEBench 表现突出
* **Codex 等 Responses 客户端**：`CodexResponses` 分组可用，可在 Codex 中直接调用

### 代码示例

```python theme={null}
import openai

client = openai.OpenAI(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="grok-4.7",
    messages=[
        {"role": "user", "content": "阅读这个模块，找出潜在的并发问题并给出修改方案"}
    ]
)
print(response.choices[0].message.content)
```

OpenAI 兼容格式，已在用 `grok-4.6` 的代码只需把 `model` 换成 `grok-4.7`。联网搜索、X 搜索、代码执行、MCP 等工具的用法与 Grok 4.x 系列一致，见 [Grok 模型概览](/api-capabilities/grok/overview)。

### 最佳实践

<Warning>
  **按任务估算成本，不要只看单价。** Grok 4.7 的单价与 Grok 4.6 相同，但 Artificial Analysis 测得它完成同一批任务的输出 tokens 约为上一代的两倍（xhigh 档每题约 81K，Grok 4.6 约 38K）。推理 tokens 计入输出计费，切换前建议用自己的真实任务对比一次账单。
</Warning>

* **推理强度按任务选**：简单问答用 `low` 或 `medium` 能明显省 tokens；`xhigh` 留给长链路编码与复杂分析
* **跨模型代码别写死推理参数**：Grok 4.x 各型号对推理强度参数的支持不一致，统一封装的代码建议按模型判断后再传，详见 [对话与推理](/api-capabilities/grok/chat)
* **长 Prompt 留意 200K 分档**：超过 200K 的请求整单按第二档计费，能拆分的长文档尽量拆分，重复的系统提示词可借助前缀缓存降低成本

## 价格与可用性

### 定价信息

四项计费与 xAI 官网一致，采用阶梯计费：

| 上下文档位 | 输入 | 输出 | 缓存读取 |
| - | - | - | - |
| 0 – 200K tokens | \$2.00 / 1M | \$6.00 / 1M | \$0.50 / 1M |
| 200K – 500K tokens | \$4.00 / 1M | \$12.00 / 1M | \$1.00 / 1M |

可用分组：`default`、`svip`、`CodexResponses`，创建令牌时选择对应分组即可。

### 叠加网站充值活动

充值可叠加阶梯加赠，按单次充值金额分档，实际到手价进一步降低，详见[充值优惠说明](/faq/recharge-promotions)。

## 总结与建议

Grok 4.7 相比 Grok 4.6 换了更大的基座：参数从 1.5T 升到 2.1T，价格不变，编码 Agent 类基准提升最明显，Terminal-Bench 4.0 几乎翻倍。综合指数上它仍比 GPT-5.6 Sol 和 Claude Fable 5 低 1 到 4 分，但知识工作类任务已仅次于 Claude Fable 5.1。

如果你的负载是长周期编码 Agent 或知识工作类自动化，建议直接试用 `grok-4.7`；如果任务简单、对成本敏感，先用真实任务对比一下 token 消耗，因为这一代「单价没变、用量变多」。追求更低单价的场景，`grok-4.3`（1M 上下文、\$1.25 / \$2.50）仍然可选。

<Info>
  信息来源：SpaceXAI 发布说明 `docs.x.ai/developers/release-notes`、Artificial Analysis 评测 `artificialanalysis.ai/articles/benchmarking-grok-4-7`、Decrypt、llm-stats、GitHub Changelog；数据获取日期 2026 年 9 月 24 日。模型已在 API易 上线，获取密钥后即可调用。
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.