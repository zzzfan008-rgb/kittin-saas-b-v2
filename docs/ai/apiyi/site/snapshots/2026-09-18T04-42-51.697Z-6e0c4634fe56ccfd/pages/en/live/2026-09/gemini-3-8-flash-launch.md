> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gemini-3.8-flash Is Live, Same Price as 3.7

> Google's newest Flash, out September 2, is now callable on APIYI — its own model docs and launch blog have not listed it yet. Priced line-for-line with gemini-3.7-flash, with 150 paired pre-launch test cases confirming capability parity.

**2026/9/2 22:43 (UTC+8)** · New Model · Google

🚀 **`gemini-3.8-flash` is live, and APIYI has it open for calls first**

Google's newest Flash, out September 2, roughly three weeks after 3.7 Flash. **Neither Google's model docs nor its launch blog lists this version yet**, so there is no authoritative source for official benchmarks or context specs — we neither relay nor guess at them.

Pricing matches `gemini-3.7-flash` line for line: \$0.75 in / \$3.75 out per 1M tokens, \$0.0750 cached reads. **Migrating from 3.7 means changing the model name and nothing else** — request shape, parameters and response fields are unchanged, at no change in cost.

Precisely because the official specs are missing, we made the pre-launch check a thorough one: a paired comparison against 3.7 Flash with both models fired simultaneously on every case — **150 case logs and 198 calls** across the Gemini native and OpenAI-compatible protocols. Core capability, reasoning, parallel tool calling, and image and video understanding all line up; response field sets differ in one group with zero type changes, and **no regression unique to 3.8 turned up**.

Both the `default` and `svip` groups are open, as are the OpenAI-compatible and Gemini native endpoints. If you lean heavily on long context, running a slice of traffic first and waiting for the official specs before a full cutover is the safer call.

📖 Full test data and migration notes: [Gemini 3.8 Flash Is Live: API Access Ahead of the Docs](/en/news/gemini-3-8-flash-launch)

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)
