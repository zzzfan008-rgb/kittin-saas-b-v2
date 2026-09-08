> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Fable 5.1 Is Live: Same Price, Cache Reads Cut to a Quarter

> Anthropic's new Mythos-class flagship claude-fable-5-1, shipped 1 September 2026, is live on APIYI alongside claude-fable-5-1-thinking, across the default / svip / ClaudeCode groups on both endpoints. The headline change is cache reads falling from $1.00 to $0.25, which APIYI has matched — every line item is priced in line with the provider. Three breaking changes to check before migrating.

**2026/9/2 11:16 (UTC+8)** · New Model · Anthropic

🚀 **`claude-fable-5-1` is live — cache reads fall from \$1.00 to \$0.25, and APIYI has matched the cut**

Anthropic's new Mythos-class flagship, shipped 1 September, alongside `claude-fable-5-1-thinking`. The headline change this generation is the **cache read price**: down from \$1.00 to **\$0.25 / 1M tokens** (0.025x base input, versus 0.1x on other Claude models), which lands hardest on long agentic sessions that re-read the same cached prefix. Input at \$10 and output at \$50 per 1M tokens are unchanged. **Our pricing matches the provider line for line — input, output, cache reads and cache writes alike, with cache reads already updated to \$0.25.** Specs: a 1M token context window, 128k max output, and adaptive thinking always on with depth steered by the `effort` parameter (default `high`).

Where it's available (pick what suits your setup):

* `default` / `svip` groups: OpenAI-compatible format, `https://api.apiyi.com/v1`
* `ClaudeCode` group: native Anthropic format, `https://api.apiyi.com` (this group also carries a discount and stacks with recharge bonuses — our own margin given back, separate from the model pricing)

⚠️ Three breaking changes to check before migrating from `claude-fable-5`: forced tool use with `tool_choice` of `any` or `tool` returns 400; thinking blocks are bound to the model that produced them, so switching back to an earlier model mid-conversation loses that turn's reasoning; and editing earlier turns — rebuilding `system` or `tools`, or injecting reminders you later delete — invalidates every later thinking block, which treating the conversation as append-only avoids. On data retention, Fable 5.1 and Mythos 5.1 are Covered Models: inputs and outputs are retained provider-side for 30 days for abuse detection, and APIYI retains no data of its own.

Full specs, benchmark comparisons, and the migration checklist: [Claude Fable 5.1 launch deep dive](/en/news/claude-fable-5-1-launch).

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
