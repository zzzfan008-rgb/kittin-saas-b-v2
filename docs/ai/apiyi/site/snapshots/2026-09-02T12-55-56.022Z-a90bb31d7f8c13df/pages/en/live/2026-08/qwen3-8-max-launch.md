> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.8-Max Is Live, Listed 17.5％ Below Official

> Alibaba Qwen's flagship Qwen3.8-Max went live the day it shipped: 2.4T-parameter sparse MoE, 1M context, 131K max output, with native image and video input. Listed at $1.65/$4.95 per 1M tokens against Alibaba's $2/$6. We ran 586 live calls before launch; endpoint support and integration caveats are summarized here.

**2026/8/3 22:44 (UTC+8)** · New Model · Alibaba

🚀 **Qwen3.8-Max is live at \$1.65/\$4.95 per 1M tokens — 17.5％ below official**

Alibaba Qwen's new flagship, released August 3 and listed the same day. A 2.4T-parameter sparse MoE with **1M context** + 131K max output + 262K max thinking budget, with native image and video input. Official benchmarks: GPQA Diamond **92.6**, PaperBench **93.0**, Terminal-Bench 2.1 86.6, SWE-bench Pro 67.7, and FrontierSWE rising from the previous generation's 40.7 to **73.5** — this generation's gains are in agentic and multimodal work rather than raw reasoning scores.

On pricing: \$1.65 input, \$4.95 output, \$0.20625 cache read, \$2.0625 cache write (per 1M tokens). Alibaba Cloud lists \$2/\$6, so this is **17.5％ lower**, and [top-up promotions](/en/faq/recharge-promotions) stack on top.

We ran **586 live calls** before launch. Current endpoint status:

* `/v1/chat/completions`: fully working — tool calling, structured output, multimodal, and streaming all verified
* `/v1/messages`: usable for code integration, provided you strip `thinking` blocks before replaying history; off-the-shelf clients such as Claude Code cannot have their replay behavior changed and are not usable yet
* `/v1/responses`: not supported yet, reported upstream

Three integration caveats. First, **thinking is on by default** (at the `xhigh` tier) — for everyday chat, set `reasoning_effort="none"` explicitly; in testing this took output from roughly 158 tokens down to 5. Second, **`max_tokens` does not bound thinking tokens** — we set `max_tokens=1` and were still billed 1,054 output tokens, so use `reasoning_effort` to control cost. Third, forcing a call via `tool_choice` or requesting `n > 1` requires `reasoning_effort="none"` alongside it, otherwise you get a 400 or the parameter is silently ignored.

Full capability matrix, benchmark data, and code samples: [Qwen3.8-Max launch notes](/en/news/qwen-3-8-max-launch).

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)
