> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-5.6-sol 同步官网降价：输入降 20%、输出降 33%，比 gpt-5.5 更便宜

> OpenAI 于 9/3 下调 GPT-5.6 Sol 价格，官网新价输入 $4 / 输出 $20 每百万 tokens，优惠期至少持续到 2026 年 11 月 21 日。API易 已同步：272K 以内输入 $4 / 输出 $20 / 缓存读 $0.40 / 缓存写 $5，超过 272K 输入 $8 / 输出 $30。旗舰档现在比上代 gpt-5.5（$5/$30）更便宜。

**2026/9/3 16:06 (UTC+8)** · 价格变动 · OpenAI

💸 **`gpt-5.6-sol` 同步官网降价，新价已生效：输入 \$5 → \$4、输出 \$30 → \$20，旗舰档现在比 `gpt-5.5` 还便宜**

背景说明：OpenAI 于 9 月 3 日下调 GPT-5.6 Sol 的 API 价格，官网新价为输入 \$4 / 输出 \$20 每百万 tokens（输入降 20%、输出降 33%），官方说明该优惠价至少持续到 2026 年 11 月 21 日（模型页 `developers.openai.com/api/docs/models/gpt-5.6-sol`）。API易 已同步新价，调用方无需改代码或切换模型名。

价格对比（每 1M tokens，272K 以内档）：

* `gpt-5.6-sol`：输入 \$5 → **\$4**，输出 \$30 → **\$20**，缓存读 \$0.50 → **\$0.40**，缓存写按 1.25× 输入价计 **\$5**
* `gpt-5.5`：输入 \$5 / 输出 \$30 / 缓存读 \$0.50，**不变**
* 同为旗舰档，Sol 比上代输入便宜 20%、输出便宜 33%，存量 `gpt-5.5` 代码只改 `model` 字段即可迁移

超过 272K 的长上下文档：单次请求输入超过 272K tokens 时，**整条请求**按 2× 输入、1.5× 输出计费，即输入 \$8 / 输出 \$30 / 缓存读 \$0.80 / 缓存写 \$10（此前为 \$10 / \$45），规则与官网一致。`default` / `svip` / `CodexResponses` / `CodexReverse` 四个分组、`/v1/chat/completions` 与 `/v1/responses` 双端点不变。

规格与完整计价见 [GPT-5.6 Sol](/models/gpt-5-6-sol) 详情页。降价对高频、长输出场景的成本影响最直接，欢迎实测反馈。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)
