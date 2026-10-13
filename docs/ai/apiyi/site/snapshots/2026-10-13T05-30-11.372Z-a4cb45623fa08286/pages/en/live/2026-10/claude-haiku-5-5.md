> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Haiku 5.5 Is Live: 1M Context, About 90% Cheaper Under 100K Tokens

> Claude Haiku 5.5, released by Anthropic on October 7, is now live on APIYI as claude-haiku-5-5. 1M context, 128K output, and the first Haiku with effort levels; priced at $0.10 input / $0.50 output per million tokens up to 100K, 5× above that, matching the official list.

**2026/10/8 15:51 (UTC+8)** · New Model · Anthropic

🚀 **Claude Haiku 5.5 (`claude-haiku-5-5`) is live, priced at \$0.10 input / \$0.50 output per million tokens up to 100K**

Released by Anthropic on October 7, it completes the Claude 5.5 family. It brings 1M context, 128K output, and the first effort levels on a Haiku; requests above 100K tokens bill at 5× the unit price, matching the official list. `claude-haiku-5-5-thinking` is also available, on both the native Anthropic and OpenAI-compatible endpoints.

Available groups:

* `default` / `svip`: OpenAI-compatible protocol
* `ClaudeCode`: native Anthropic protocol (Claude Code and similar clients)
* `Claude_Enterprise`: enterprise group, Anthropic first-party channel only

When migrating from Haiku 4.5, drop `temperature` / `top_p` / `top_k` and any assistant prefill, or requests return 400. See the [AI Radar article](/en/news/claude-haiku-5-5-launch) for specs, benchmarks, and the migration checklist.

***

← [Back to Live Updates](/en/live) · 📚 [Archive by Month](/en/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.