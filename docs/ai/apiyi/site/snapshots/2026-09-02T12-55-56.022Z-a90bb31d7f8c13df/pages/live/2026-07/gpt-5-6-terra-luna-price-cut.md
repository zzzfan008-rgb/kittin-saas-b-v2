> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-5.6-terra 与 gpt-5.6-luna 同步官网降价：Luna 降 80%、Terra 降 20%

> OpenAI 于 7/30 下调 GPT-5.6 系列两款模型价格，APIYI 已同步新价：gpt-5.6-luna 输入 $1 降至 $0.20、输出 $6 降至 $1.20（降幅 80%），gpt-5.6-terra 输入 $2.50 降至 $2、输出 $15 降至 $12（降幅 20%），gpt-5.6-sol 价格不变。

**2026/7/31 16:10 (UTC+8)** · 价格变动 · OpenAI

💸 **`gpt-5.6-terra` 与 `gpt-5.6-luna` 同步官网降价：Luna 直降 80%、Terra 降 20%，新价已生效**

背景说明：OpenAI 于 7 月 30 日宣布下调 GPT-5.6 系列两款模型的 API 价格，距两款模型发布约三周。官方将降价归因于 GPT-5.6 研发过程中的效率提升（模型参与重写与优化生产代码、改进 token 生成效率）。API易已同步新价，调用方无需改动代码或切换模型名。

价格对比（每 1M tokens，272K 以内档）：

* `gpt-5.6-luna`：输入 \$1 → **\$0.20**，输出 \$6 → **\$1.20**，缓存读 \$0.10 → **\$0.02** —— 降幅 **80%**
* `gpt-5.6-terra`：输入 \$2.50 → **\$2.00**，输出 \$15 → **\$12.00**，缓存读 \$0.25 → **\$0.20** —— 降幅 **20%**
* `gpt-5.6-sol`：输入 \$5 / 输出 \$30 / 缓存读 \$0.50，**保持不变**

超过 272K 的长上下文档同幅下调：`gpt-5.6-luna` 由 \$2 / \$9 降至 \$0.40 / \$1.80，`gpt-5.6-terra` 由 \$5 / \$22.50 降至 \$4 / \$18。三款模型仍在 `default` / `svip` / `CodexReverse` 分组可用，`/v1/chat/completions` 与 `/v1/responses` 双端点不变。

规格与完整计价见 [GPT-5.6 Terra](/models/gpt-5-6-terra) 与 [GPT-5.6 Luna](/models/gpt-5-6-luna) 详情页。降价对高频、长上下文场景的成本影响最直接，欢迎实测反馈。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
