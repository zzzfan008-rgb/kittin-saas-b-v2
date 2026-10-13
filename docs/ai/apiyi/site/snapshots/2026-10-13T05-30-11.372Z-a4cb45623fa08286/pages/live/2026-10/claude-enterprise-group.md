> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 新增 Claude_Enterprise 企业分组（1.2x 倍率）

> 新增 Claude_Enterprise 企业分组，分组标识 ClaudeOfficial，倍率 1.2x。仅走 Anthropic 官方通道、不含 AWS，缓存命中率高，支持 12 个 Claude 模型；定价口径与 image2Enterprise 一致。

**2026/10/7 15:51 (UTC+8)** · 新模型 · Anthropic

🚀 **新增 `Claude_Enterprise` 企业分组（分组标识 `ClaudeOfficial`），倍率 1.2x**

面向企业客户上线，**仅走 Anthropic 官方通道，不含 AWS Claude**，缓存命中率高，优先保障稳定体验。倍率计算：转换倍率 1.2 × 分组倍率 1 × 充值倍率 1 = **1.2x**。

定价口径与 [`image2Enterprise` 企业分组](/live/2026-04/image2-enterprise) 一致：1.2x 按「单次充值 3000 美金的大客户加赠 20% 后约等于官网原价」设定，平台不计税务成本，不赚钱也优先保障供给。

支持 12 个模型：

* Fable：`claude-fable-5`、`claude-fable-5-1`
* Opus：`claude-opus-5-5`、`claude-opus-5`、`claude-opus-4-8`、`claude-opus-4-7`、`claude-opus-4-6`、`claude-opus-4-5-20251101`
* Sonnet：`claude-sonnet-5-5`、`claude-sonnet-5`、`claude-sonnet-4-6`
* Haiku：`claude-haiku-4-5-20251001`

每个模型另有 `-thinking` 别名（如 `claude-opus-5-5-thinking`），适合 OpenAI 兼容模式下的推理对话；一般直接用不带 `-thinking` 的模型名即可，推理通过请求参数控制。

在令牌设置中把分组选为 `Claude_Enterprise` 即可使用；可用分组与模型可在 [用户中心](https://api.apiyi.com/account/profile) 查看。

Fable 5 / Fable 5.1 属 Mythos 级模型，输入输出会在 Anthropic 官方侧保留 30 天用于滥用检测，API易 自身不保留任何数据。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.