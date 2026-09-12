> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.7 Flash 上线，官方同价，限时优惠期比 3.6 便宜一半

> 谷歌 8 月 13 日发布的新一代 Flash 主力 gemini-3.7-flash 已上架。编码与 Agent 是升级重点，DeepSWE v1.1 从 48.6% 提到 65.3%，AutomationBench 从 17.0% 提到 30.4%。定价 $0.75/$3.75 每 1M tokens 与官网一致，这是谷歌限时优惠价，12 月 31 日后恢复 $1.50/$7.50。

**2026/8/14 09:18 (UTC+8)** · 新模型 · Google

🚀 **`gemini-3.7-flash` 上线，定价与官网一致，限时优惠期比上一代还便宜一半**

谷歌 8 月 13 日发布的新一代 Flash 主力，距上一版 3.6 Flash 仅约三周。官方定位为"最聪明的 workhorse 模型"，升级重点压在**编码与 Agent**：DeepSWE v1.1 由 48.6% 提到 **65.3%**，FrontierCode 1.1 由 34.4% 提到 43.6%，Terminal-bench 2.1 由 78.0% 提到 85.8%；真实业务流程自动化基准 AutomationBench 由 17.0% 提到 **30.4%**，在谷歌自己的对比中高于 Claude Sonnet 5（10.7%）与 GPT-5.6 Terra（23.6%）。长上下文检索 GDM-MRCR v2 达 97.0%，PDF 文档理解由 22.0% 提到 34.0%。

规格与接入：1M 上下文 / 64K 输出，文本、图像、音频、视频多模态输入，思考档位 `low` / `medium`（默认）/ `high` 三档可调；OpenAI 兼容与 Gemini 原生双端点均可调用，从 3.6 Flash 迁移改个 `model` 名即可。

计价与谷歌官网完全一致（每 1M tokens）：

* 输入（提示）：\$0.7500
* 输出（补全，含思考）：\$3.7500
* 缓存读取：\$0.0750
* 缓存创建（5m）：\$0.7500

需要留意的是，\$0.75 / \$3.75 是**谷歌自己的限时优惠价**，官方注明有效期至 2026 年 12 月 31 日，2027 年 1 月 1 日起恢复 \$1.50 / \$7.50（即 3.6 Flash 同价）。也就是说限时优惠期内用 3.7 比用 3.6 还便宜一半，能力却全面更强；折扣继续走[充值加赠](/faq/recharge-promotions)叠加。

唯一小幅回退的是 CharXiv 图表推理（84.5% vs 3.6 的 85.2%），差距在误差量级内，以图表密集型分析为主力场景的建议自行 A/B 一次。Flash 是谷歌的中间档主力，连续三个版本稳步升级，仍是我们推荐的默认选择。完整基准表、规格与代码示例见 [Gemini 3.7 Flash 上线说明](/news/gemini-3-7-flash-launch)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
