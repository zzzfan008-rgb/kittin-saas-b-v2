> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI retires the gpt-5.x-chat-latest family, calls return 404 model_not_found

> OpenAI has deprecated the versioned chat-latest models — gpt-5.1/5.2/5.3-chat-latest — and calls to the official API now return 404 model_not_found. This is an upstream retirement rather than a routing fault, so retries will not help; migrate by changing the model field. The GPT-5.6 family — terra, sol and luna — remains callable.

**2026/8/14 13:47 (UTC+8)** · Service Notice · OpenAI

🗂️ **OpenAI has retired the `gpt-5.x-chat-latest` family — calls return 404 `model_not_found`**

OpenAI has deprecated the versioned chat-latest models — `gpt-5.1-chat-latest`, `gpt-5.2-chat-latest`, `gpt-5.3-chat-latest` — and calling the official API returns HTTP 404 with `The model gpt-5.3-chat-latest has been deprecated`, `type` `invalid_request_error` and `code` `model_not_found`. This is an upstream retirement, not a fault on our routing, so neither retrying nor switching groups will bring it back — migration means changing the `model` field.

The GPT-5.6 family covers the same conversational workloads and stays callable, all three tiers at 1M context (pick whichever fits):

* `gpt-5.6-terra`: \$2 / \$12 per 1M tokens, GPT-5.5-level performance at half the price
* `gpt-5.6-sol`: \$5 / \$30 per 1M tokens, the flagship tier, and what the `gpt-5.6` alias points to
* `gpt-5.6-luna`: \$0.2 / \$1.2 per 1M tokens, the lightweight tier for high concurrency and cost-sensitive workloads

Migration is a `model` name swap with every other parameter unchanged; see the [model pricing](/en/models) page for live prices and available groups.

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)
