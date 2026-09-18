> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gpt-5.6-sol Price Cut Synced: Input Down 20%, Output Down 33%, Now Cheaper Than gpt-5.5

> OpenAI cut GPT-5.6 Sol pricing on 3 September to $4 input / $20 output per million tokens, with the promotional rate guaranteed at least through 21 November 2026. APIYI has synced: within 272K, $4 input / $20 output / $0.40 cached read / $5 cache write; above 272K, $8 input / $30 output. The flagship tier is now cheaper than the previous-generation gpt-5.5 ($5/$30).

**2026/9/3 16:06 (UTC+8)** · Price Update · OpenAI

💸 **`gpt-5.6-sol` price cut synced and live: input \$5 → \$4, output \$30 → \$20, so the flagship tier is now cheaper than `gpt-5.5`**

Background: OpenAI lowered GPT-5.6 Sol API pricing on 3 September to \$4 input / \$20 output per million tokens (20% off input, 33% off output), and states the promotional rate is available at least through 21 November 2026 (model page: `developers.openai.com/api/docs/models/gpt-5.6-sol`). APIYI has synced the new price; no code changes or model-name switches are needed.

Price comparison (per 1M tokens, within the 272K tier):

* `gpt-5.6-sol`: input \$5 → **\$4**, output \$30 → **\$20**, cached read \$0.50 → **\$0.40**, cache writes at 1.25× the input rate, **\$5**
* `gpt-5.5`: input \$5 / output \$30 / cached read \$0.50, **unchanged**
* Both are flagship tier, and Sol now costs 20% less on input and 33% less on output; existing `gpt-5.5` code migrates by changing only the `model` field

Long-context tier above 272K: when a single request exceeds 272K input tokens, the **whole request** is billed at 2× input and 1.5× output, i.e. \$8 input / \$30 output / \$0.80 cached read / \$10 cache write (previously \$10 / \$45), matching OpenAI's rule. The four groups `default` / `svip` / `CodexResponses` / `CodexReverse` and both endpoints, `/v1/chat/completions` and `/v1/responses`, are unchanged.

Full specs and pricing are on the [GPT-5.6 Sol](/en/models/gpt-5-6-sol) detail page. The cut matters most for high-volume, output-heavy workloads; real-world feedback is welcome.

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)
