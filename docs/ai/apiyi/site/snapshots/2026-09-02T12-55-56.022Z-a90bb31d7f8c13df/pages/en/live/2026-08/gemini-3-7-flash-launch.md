> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.7 Flash Is Live at Official Pricing — Half of 3.6 During the Limited-Time Promotion

> Google's next-gen Flash workhorse gemini-3.7-flash, shipped 13 August, is live. Coding and agents are the focus: DeepSWE v1.1 goes from 48.6% to 65.3%, AutomationBench from 17.0% to 30.4%. Priced at $0.75/$3.75 per 1M tokens, identical to Google — a limited-time promotional rate that reverts to $1.50/$7.50 after 31 December.

**2026/8/14 09:18 (UTC+8)** · New Model · Google

🚀 **`gemini-3.7-flash` is live at Google's official price — half of what the previous generation costs**

Google's next-gen Flash workhorse shipped 13 August, roughly three weeks after 3.6 Flash. Positioned as its "most intelligent workhorse model", the release puts its weight on **coding and agents**: DeepSWE v1.1 rises from 48.6% to **65.3%**, FrontierCode 1.1 from 34.4% to 43.6%, Terminal-bench 2.1 from 78.0% to 85.8%. On AutomationBench, a real business-workflow benchmark, it moves from 17.0% to **30.4%** — ahead of Claude Sonnet 5 (10.7%) and GPT-5.6 Terra (23.6%) in Google's own comparison. Long-context retrieval reaches 97.0% on GDM-MRCR v2, and PDF comprehension goes from 22.0% to 34.0%.

Specs and integration: 1M context / 64K output, multimodal input (text, image, audio, video), and three tunable thinking levels — `low` / `medium` (default) / `high`. Both the OpenAI-compatible and native Gemini endpoints work; migrating from 3.6 Flash is a `model` name change.

Pricing is identical to Google's official rates (per 1M tokens):

* Input (prompt): \$0.7500
* Output (completion, incl. thinking): \$3.7500
* Cache read: \$0.0750
* Cache write (5m): \$0.7500

Worth noting: \$0.75 / \$3.75 is **Google's own limited-time promotional rate**, officially valid through 31 December 2026 and reverting to \$1.50 / \$7.50 on 1 January 2027 (the same price as 3.6 Flash). So during the promotional period 3.7 costs half of what 3.6 costs while being stronger across the board, and [top-up bonuses](/en/faq/recharge-promotions) stack on top.

The one slight regression is CharXiv chart reasoning (84.5% vs 3.6's 85.2%), a gap within noise — run your own A/B if chart-heavy analysis is your primary workload. Flash is Google's mid-tier workhorse, improved steadily across three consecutive versions, and remains our default recommendation. Full benchmark table, specs and code samples in the [Gemini 3.7 Flash launch note](/en/news/gemini-3-7-flash-launch).

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
