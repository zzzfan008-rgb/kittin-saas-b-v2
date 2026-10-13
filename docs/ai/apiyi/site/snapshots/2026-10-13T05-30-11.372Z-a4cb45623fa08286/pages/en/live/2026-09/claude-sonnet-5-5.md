> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Sonnet 5.5 Is Live at Sonnet 5 Pricing

> Claude Sonnet 5.5, released by Anthropic on September 28, is now on APIYI. It scores 70.6% on Terminal-Bench 4.0 (Anthropic), above Opus 5.5, and is priced at $2/$10 per million tokens, matching the official price. Migrating from Sonnet 5 requires replacing thinking disabled with between_tools.

**2026/9/30 00:51 (UTC+8)** · New Model · Anthropic

🚀 **`claude-sonnet-5-5` is live, priced at \$2 / \$10 per million tokens, with all four billing items matching the official price**

The second Claude 5.5 model, released by Anthropic on September 28, brings 1M context and output about 30% faster than Sonnet 5. It scores 70.6% on Terminal-Bench 4.0 (Anthropic), above Opus 5.5's 66.4%. `claude-sonnet-5-5-thinking` is also available, in the `default` / `svip` / `ClaudeCode` groups.

Migrating from Sonnet 5: replace `thinking: {"type": "disabled"}` with `between_tools`; `tool_choice` of `any` / `tool` returns 400, and `top_p` / `top_k` also return an error (shown as 429, not rate limiting). See the [Claude Sonnet 5.5 launch article](/en/news/claude-sonnet-5-5-launch) for details.

***

← [Back to Live](/en/live) · 📚 [Monthly archive](/en/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.