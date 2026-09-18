> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seedance 2.0 mini / fast 限时降价 · 新增 SD2Mini、SD2Fast 两个专属分组

> 新增 SD2Mini（0.10x）与 SD2Fast（0.15x）两个单模型专属分组，相比原 SeeDance2 分组的 0.18x，mini 降价 44.4％、fast 降价 16.7％。模型能力与调用方式不变，换一把令牌即可，代码无需改动。限时至 2026 年 9 月 7 日 23:59 (UTC+8)，到期后分组不下线、倍率恢复 0.18x。

**2026/8/8 14:54 (UTC+8)** · 价格变动 · ByteDance

💰 **Seedance 2.0 mini / fast 限时降价 —— 新增 `SD2Mini`、`SD2Fast` 两个专属分组**

同步官方定价调整，我们对 Seedance 2.0 的两个轻量模型做了降价，新开两个**单模型专属分组**：

| 分组        | 倍率                 | 可用模型                                | 降幅         |
| --------- | ------------------ | ----------------------------------- | ---------- |
| `SD2Mini` | **0.10x**（原 0.18x） | 仅 `doubao-seedance-2-0-mini-260615` | **−44.4％** |
| `SD2Fast` | **0.15x**（原 0.18x） | 仅 `doubao-seedance-2-0-fast-260128` | **−16.7％** |

以 720p / 5 秒为例：mini 由 ¥3.16 降至 **¥1.75**，fast 由 ¥5.08 降至 **¥4.23**（名义扣费，1:7 固定汇率折算）。模型能力、参数、端点与调用方式**完全不变**，降的是分组倍率，与充值加赠互不冲突、可以叠加。标准版 `doubao-seedance-2-0-260128` 价格不变，仍走 `SeeDance2` 分组。

**怎么用**：新建一把令牌，主分组选 `SD2Mini`（或 `SD2Fast`），计费模式选「按量优先」或「按量计费」，把调用方的 Key 换过去即可，代码一行不用改。建议**单独开一把特价令牌**，原 `SeeDance2` 令牌保留跑标准版并作为兜底——这样账单按令牌分开，优惠期省了多少一目了然，9 月 7 日到期时也只需把 Key 换回去。注意两个特价分组是单模型通道，拿它们调别的模型会报「该模型无可用渠道」。

**优惠截止 2026 年 9 月 7 日 23:59 (UTC+8)**。到期后两个分组**不会下线**，只是倍率恢复 0.18x，令牌与代码都不需要改动。有批量出片计划的建议排在窗口期内。

**关于 Seedance 2.5**：字节已发布 Seedance 2.5，APIYI 正在接入对接中，尚未上线，上线后会另行公告。新版本上线前后，上游算力可能向 2.5 倾斜，`fast` 与 `mini` 的生成效果可能出现波动，建议批量投产前先用小样本验证画面质量，并持续关注线上表现；发现明显异常欢迎随时反馈。

分组、价格对照与令牌配置详见 [Seedance 2.0 概览](/api-capabilities/seedance2/overview)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
