> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-6-astra Is Live: OpenAI's New Flagship Open for Calls

> OpenAI's next-generation flagship GPT-6 Astra, released on 3 September, is now on APIYI in the default and svip groups. Priced at $10 in / $50 out per 1M tokens with $1 cached reads, all four billing items match OpenAI's list price; 1.05M context and five reasoning-effort levels including the new xhigh and max.

**2026/9/5 09:51 (UTC+8)** · New Model · OpenAI

🚀 **`gpt-6-astra` is live in both the `default` and `svip` groups**

OpenAI's next-generation flagship, released on 3 September and positioned for computer use, software engineering, and long-horizon agent work. Specs: 1,050,000-token context, 128,000-token max output, knowledge cutoff 30 April 2026; `reasoning_effort` gains `xhigh` / `max` for five levels in total.

Pricing matches OpenAI's standard tier item for item: \$10 in / \$50 out per 1M tokens, \$1 cached reads, \$12.50 cache writes. That is 2.5x the current promotional price of `gpt-5.6-sol` and identical to Claude Fable 5.1 on input and output. Both `/v1/responses` and `/v1/chat/completions` are open; this generation's new capabilities such as computer use, hosted shell, and async function calling run on Responses. Migrating from 5.6 Sol is a `model`-field change.

Two notes: OpenAI rates Astra's cyber capability at the Critical level, so **the standard public release refuses vulnerability-discovery and exploit-writing tasks**, while ordinary development is unaffected; billing is tiered by input tokens exactly as on OpenAI, and once a single request's input passes 272K the whole request bills at the second tier (\$20 input, \$2 cached read, \$25 cache write); treat the live model pricing page as authoritative.

📖 Benchmarks, model selection, and migration notes: [GPT-6 Astra Is Live: OpenAI's New Flagship Open for Calls](/en/news/gpt-6-astra-launch)

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)
