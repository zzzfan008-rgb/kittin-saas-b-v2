> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Opus 5.5 Is Live, Priced Below Opus 5

> Claude Opus 5.5, released by Anthropic on 22 September, is now live on APIYI as claude-opus-5-5 and claude-opus-5-5-thinking in the default, svip and ClaudeCode groups. Priced at 4 USD input, 20 USD output and 0.20 USD cache reads per 1M tokens, with all four items matching the provider. Before migrating from Opus 5, note that thinking can't be disabled, forced tool use returns 400, and the default effort is now medium.

**2026/9/23 13:27 (UTC+8)** · New Model · Anthropic

🚀 **`claude-opus-5-5` is live: Fable-class results, priced below Opus 5**

The first model in Anthropic's Claude 5.5 family, released 22 September, scores 66.4% on Terminal-Bench 4.0, ahead of Fable 5.1's 55.8%. APIYI offers both `claude-opus-5-5` and `claude-opus-5-5-thinking` in the `default` / `svip` / `ClaudeCode` groups, on both the OpenAI-compatible and native Anthropic endpoints. Priced at \$4 input / \$20 output / \$0.20 cache reads per 1M tokens, with all four items matching the provider.

Before migrating from Opus 5:

* Thinking can't be disabled; `thinking: {"type": "disabled"}` returns 400
* `tool_choice` of `any` / `tool` returns 400
* The default effort drops from `high` to `medium`; set it explicitly for coding work

📖 Full benchmarks, migration checklist and code samples: [Claude Opus 5.5 Is Live](/en/news/claude-opus-5-5-launch)

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.