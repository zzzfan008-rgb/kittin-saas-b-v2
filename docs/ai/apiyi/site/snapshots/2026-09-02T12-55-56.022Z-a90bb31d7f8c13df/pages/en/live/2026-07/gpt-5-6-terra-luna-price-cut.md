> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-5.6-terra and gpt-5.6-luna Match OpenAI's Price Cut: Luna Down 80%, Terra Down 20%

> OpenAI cut prices for two GPT-5.6 models on 7/30, and APIYI has matched them: gpt-5.6-luna drops from $1 to $0.20 input and $6 to $1.20 output (down 80%), gpt-5.6-terra from $2.50 to $2 input and $15 to $12 output (down 20%). gpt-5.6-sol is unchanged.

**2026/7/31 16:10 (UTC+8)** · Price Update · OpenAI

💸 **`gpt-5.6-terra` and `gpt-5.6-luna` match OpenAI's price cut — Luna down 80%, Terra down 20%, effective now**

Background: on July 30, OpenAI cut API prices for two models in the GPT-5.6 family, roughly three weeks after their launch. OpenAI attributes the reduction to efficiency gains made during GPT-5.6's own development — the model rewriting and optimizing production code, plus improved token generation. APIYI has matched the new pricing; no code changes or model-name switches are needed on your side.

Price comparison (per 1M tokens, the up-to-272K tier):

* `gpt-5.6-luna`: input \$1 → **\$0.20**, output \$6 → **\$1.20**, cached read \$0.10 → **\$0.02** — down **80%**
* `gpt-5.6-terra`: input \$2.50 → **\$2.00**, output \$15 → **\$12.00**, cached read \$0.25 → **\$0.20** — down **20%**
* `gpt-5.6-sol`: input \$5 / output \$30 / cached read \$0.50, **unchanged**

The long-context tier above 272K drops by the same margin: `gpt-5.6-luna` goes from \$2 / \$9 to \$0.40 / \$1.80, and `gpt-5.6-terra` from \$5 / \$22.50 to \$4 / \$18. All three models remain available on the `default` / `svip` / `CodexReverse` groups, with both `/v1/chat/completions` and `/v1/responses` unchanged.

Full specs and tiered pricing: [GPT-5.6 Terra](/en/models/gpt-5-6-terra) and [GPT-5.6 Luna](/en/models/gpt-5-6-luna). The cut lands hardest on high-frequency and long-context workloads — we welcome your benchmarks and feedback.

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
