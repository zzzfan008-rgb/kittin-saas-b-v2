> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 系列价格总览

> Nano Banana 系列图片模型（Pro / 2.1 / 2 / 2 Lite / 第一代）完整价格对比，包括按次计费、按量计费、充值优惠及令牌选择建议。最低可达官方 30.3% 的价格。

## 概述

Nano Banana 系列包含五款图片生成模型，均支持通过 API易 以远低于官方的价格调用。本页汇总所有 Nano Banana 模型的定价信息，帮助你快速选择最适合的计费方案。

<Info>
  在 API 调用时，所使用的\*\*「令牌类型」\*\*决定计费方式。Nano Banana Pro、2.1、2、Lite 都有两种计费方式：**按次计费**、**按量计费**。且仅有两个分组：默认稳定分组、企业高可用分组。
</Info>

## 五款模型速览

| 特性 | **Nano Banana Pro** | **Nano Banana 2.1** | **Nano Banana 2** | **Nano Banana 2 Lite** | **Nano Banana（第一代）** |
| - | - | - | - | - | - |
| 模型 ID | `gemini-3-pro-image-preview` | `gemini-nano-banana-2.1` | `gemini-3.1-flash-image-preview` | `gemini-3.1-flash-lite-image` | `gemini-2.5-flash-image` |
| 最高分辨率 | 4K | 4K | 4K | 1K | 1K |
| 按次计费 | \$0.09/次 | \$0.045/次 | \$0.055/次 | \$0.025/次 | \$0.02/次 |
| 按量计费 | 内测中 | ✅ 已开放 | ✅ 已开放 | ✅ 已开放 | ❌ 不支持 |
| 最低折扣 | 官方 31.25% | 官方 33.2% | 官方 30.3% | 官网 4 折 | 官方 50% |

## Nano Banana Pro 定价

模型名：`gemini-3-pro-image-preview`

### 按次计费

\$0.09 美金/次，1-4K 统一按次价格，计费简单、4K 图片更省。

| 计费项 | API易默认 | 充值加赠 +10% | 充值加赠 +20% | 谷歌官方 |
| - | - | - | - | - |
| 单张价格（\$） | \$0.09 | \$0.0818 | \$0.075 | \$0.24 |
| 单张价格（¥） | ¥0.63 | ¥0.573 | ¥0.525 | ¥1.68 |
| 相对官方 | 37.5% | 34.0% | **31.25%** | / |

<Tip>
  4K 图片最多省 **68.75%**！按次计费不区分分辨率，4K 和 1K 同价，分辨率越高越划算。
</Tip>

### 按量计费（未开放，可内测）

| 计费项 | API易 | 谷歌官方 |
| - | - | - |
| 输入价格 | \$0.88/M tokens | \$2/M tokens |
| 输出价格 | \$52.8/M tokens | \$120/M tokens |
| 相对官方 | **44%** | / |

按量计费预估单张价格：

| 分辨率 | API易预估 | 谷歌官方预估 |
| - | - | - |
| 1-2K | \~\$0.075 | \~\$0.134 |
| 4K | \~\$0.11 | \~\$0.24 |

<Info>
  Tokens 计费因输入和输出图片的 Tokens 会动态变化，以上为预估值。按量计费适合 1-2K 图片需求，价格更低；4K 场景建议使用按次计费更划算。
</Info>

## Nano Banana 2.1 定价

模型名：`gemini-nano-banana-2.1`（2026 年 10 月 6 日发布，Nano Banana 2 的升级版，详见 [Nano Banana 2.1 生图/编辑](/api-capabilities/gemini-nano-banana-2.1/overview)）

### 按次计费

\$0.045 美金/次（2026-10-13 起由 \$0.05 降价），1-4K 统一按次价格，4K 图片更省。

| 计费项 | API易默认 | 充值加赠 +10% | 充值加赠 +20% | 谷歌官方（4K） |
| - | - | - | - | - |
| 单张价格（\$） | \$0.045 | \$0.0409 | \$0.0375 | \$0.113 |
| 单张价格（¥） | ¥0.315 | ¥0.286 | ¥0.263 | ¥0.791 |
| 相对官方 | **39.8%** | **36.2%** | **33.2%** | / |

### 按量计费

| 计费项 | API易 | 谷歌官方 |
| - | - | - |
| 输入价格 | \$0.66/M tokens | \$1.5/M tokens |
| 输出价格（图片、文本、思考统一） | \$13.2/M tokens | 图片 \$30/M，文本与思考 \$7.5/M |
| 相对官方 | **44%**（图片部分） | / |

按量计费实测单张价格（2026-10-07，含默认思考 tokens）：

| 分辨率 | API易实测 | 谷歌官方 |
| - | - | - |
| 1K | \~\$0.026 | \~\$0.040 |
| 2K | \~\$0.035 | \~\$0.058 |
| 4K | \~\$0.062 | \~\$0.120 |

<Info>
  Nano Banana 2.1 默认就会思考，每张图另有约 400–1300 个思考 tokens 与图片一起按输出价计费，按量单张有高有低；1K / 2K 选按量更低，4K 选按次（\$0.045）更省。不支持 512px。
</Info>

<Note>模型价格与官网对齐，且可能随官网调整；上表仅供参考，具体以顶部导航「模型价格」栏目为准：[模型价格](/models/index)。</Note>

## Nano Banana 2 定价

模型名：`gemini-3.1-flash-image-preview`

### 按次计费

\$0.055 美金/次，1-4K 统一按次价格，计费简单、4K 图片更省。

| 计费项 | API易默认 | 充值加赠 +10% | 充值加赠 +20% | 谷歌官方 |
| - | - | - | - | - |
| 单张价格（\$） | \$0.055 | \$0.05 | \$0.0458 | \$0.151 |
| 单张价格（¥） | ¥0.385 | ¥0.35 | ¥0.32 | ¥1.68 |
| 相对官方 | **36.4%** | **33.1%** | **30.3%** | / |

### 按量计费

| 计费项 | API易 | 谷歌官方 |
| - | - | - |
| 输入价格 | \$0.18/M tokens | \$0.5/M tokens |
| 输出价格 | \$21.6/M tokens | \$60/M tokens |
| 相对官方 | **36%** | / |

按量计费预估单张价格：

| 分辨率 | API易预估 | 谷歌官方 |
| - | - | - |
| 512px | \~\$0.024 | \$0.045 |
| 1K | \~\$0.03 | \$0.067 |
| 2K | \~\$0.036 | \$0.101 |
| 4K | \~\$0.06 | \$0.151 |

<Info>
  以上为预估值，实际按输入和输出的 tokens 计算。可叠加充值活动最多送 20% 额度，进一步降低成本。
</Info>

## Nano Banana 2 Lite 定价

模型名：`gemini-3.1-flash-lite-image`

最快最省的一档，专注 1K 画布、约 4 秒出图。**推荐按量优先**：实测单价更低且可预期。

### 按量计费（推荐）

| 计费项 | API易 | 谷歌官方 | 相对官方 |
| - | - | - | - |
| 输入价格 | \$0.10/M tokens | \$0.25/M tokens | **官网 4 折** |
| 输出价格 | \$12/M tokens | \$30/M tokens | **官网 4 折** |

按量计费预估单张价格：

| 分辨率 | API易预估 | 谷歌官方 |
| - | - | - |
| 1K | **\~\$0.018** | \~\$0.034 |

<Info>
  **实测可预期**：1K 出图按量（按 tokens）**实测平均约 \$0.018/次**（常见区间约 \$0.016–\$0.019，输出 token 决定单价），比按次固定价 \$0.025/次更省。可叠加充值活动进一步降本。
</Info>

### 按次计费

| 计费项 | API易 | 谷歌官方 | 说明 |
| - | - | - | - |
| 单张价格 | \$0.025/次 | 约 \$0.034/张 | 固定单价，后续可能下调、暂时不动 |

<Tip>
  **计费模式怎么选**：Lite **首选「按量优先」**（Pay-as-you-go Priority）——实测约 \$0.018/次、比按次 \$0.025 更省且可预期，同一把令牌还兼容 Nano Banana Pro / 2 的按次计费，一把跑全系列。按次 \$0.025/次为固定单价，后续可能下调、暂时不动。
</Tip>

## Nano Banana 第一代定价

模型名：`gemini-2.5-flash-image`

仅支持 1K 图片，固定按次计费。

| 计费项 | API易 | 谷歌官方 | 折扣 |
| - | - | - | - |
| 单张价格 | \$0.02/次 | \$0.039/次 | **约 5 折** |

同样参与充值活动可进一步降低成本。

## 充值活动：更能降本

通过参与充值加赠活动，可在已有优惠基础上进一步降低成本。

<CardGroup cols={2}>
  <Card title="充值加赠比例表" icon="gift" href="/faq/recharge-promotions">
    查看当前充值加赠活动详情和各档位加赠比例。
  </Card>

  <Card title="令牌创建与管理" icon="key" href="https://api.apiyi.com/token">
    前往管理后台创建和管理 API 令牌。
  </Card>
</CardGroup>

## 令牌类型选择建议

<Info>
  选择令牌类型时，令牌的「Billing model」设置决定了计费方式。请根据你的主要使用场景选择：
</Info>

| 模型 | 使用场景 | 推荐令牌类型 |
| - | - | - |
| Nano Banana Pro | 1-4K 混合使用 | 按量优先 |
| Nano Banana Pro | 只跑 4K | 按次计费 |
| Nano Banana 2 | 0.5K-4K 混合使用 | 按量优先 |
| Nano Banana 2 | 只用 4K | 按次计费 |
| Nano Banana 2 Lite | 1K 走量出图 | 按量优先 |

<Tip>
  **简单原则**：如果你主要生成 4K 图片，选**按次计费**更划算（不区分分辨率统一价格）；如果分辨率混合使用，选**按量计费**可以在低分辨率时节省更多。
</Tip>

## 账单波动不等于调价

同一款模型两笔账单差很多，先别归因于调价：**按量计费**下单次扣费本身就随参数浮动。实测影响最大的两项：

| 参数 | 对单次账单的影响 | 适用范围 |
| - | - | - |
| 输出分辨率 | 1K 到 4K 约 **+90%**（\$0.033 → \$0.064，Nano Banana 2 按量实测；Pro 按量 1-2K 到 4K 约 +47%） | 仅按量计费；2 Lite 与第一代只出 1K，不受影响 |
| `thinkingLevel`（思考等级） | 默认档到 `high` 约 **+54%** | 仅 Nano Banana 2 / 2 Lite；Pro 思考恒开、不可调 |

同一个模型昨天约 \$0.033、今天约 \$0.052，通常是参数不同造成的，不是价格调整。

<Info>
  两个参数的逐档实测（tokens、扣费、耗时）见 [Nano Banana 2 生图/编辑](/api-capabilities/nano-banana-2-image/overview) 与 [usage 字段与输出解读](/api-capabilities/nano-banana-usage-metadata)。
</Info>

**要成本可预期就选按次计费**：1-4K 统一单价（Pro \$0.09/次、Nano Banana 2 \$0.055/次），不随分辨率和 tokens 波动。

## 相关文档

* [Nano Banana 2 生图/编辑](/api-capabilities/nano-banana-2-image/overview) - Nano Banana 2 完整使用指南
* [Nano Banana Pro 图片生成](/api-capabilities/nano-banana-image) - Nano Banana Pro 使用指南
* [Nano Banana Pro 图片编辑](/api-capabilities/nano-banana-image-edit) - 图片编辑功能
* [充值加赠活动](/faq/recharge-promotions) - 充值优惠详情


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.