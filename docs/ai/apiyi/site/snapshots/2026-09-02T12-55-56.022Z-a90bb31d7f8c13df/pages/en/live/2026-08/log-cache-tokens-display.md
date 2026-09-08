> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Console Logs Now Break Out Cache Tokens — Reads and Writes Visible Per Call

> The prompt tokens column in the log list now splits into three numbers: uncached input, a green down arrow for cache hits (cache read), and an orange up arrow for cache writes, with exact values on hover. For OpenAI, Claude, and other models billed with cache tiers, every call's cache usage can now be checked row by row.

**2026/8/21 11:39 (UTC+8)** · Service Notice · OpenAI / Anthropic

📊 **Console logs now break out cache tokens — hits and writes are visible per call**

The log list used to show a single prompt-token total, and cache hits were only visible after opening the Cache Billing Details panel. That column now splits into three numbers: uncached input tokens on top, a green down arrow for **cache hits (cache read)**, and an orange up arrow for **cache writes**. Hovering any of them shows the exact value, for example "命中（读取缓存）：32,815 tokens" (Hit / cache read: 32,815 tokens).

<Frame caption="The new cache token breakdown in the log list — green ↓ is cache read, orange ↑ is cache write">
  <img src="https://mintcdn.com/apiyillc/ixpvMIHp9cVMdY-m/images/console-log-cache-tokens-column.png?fit=max&auto=format&n=ixpvMIHp9cVMdY-m&q=85&s=1c2a7ecfb9d884b7f63cc6969dd53144" alt="Console log list showing claude-sonnet-4-6 rows where the prompt token column displays uncached input, a green down arrow 33.4K, and an orange up arrow 542" width="1754" height="1160" data-path="images/console-log-cache-tokens-column.png" />
</Frame>

<Frame caption="Hover shows the exact value: Hit (cache read): 32,815 tokens">
  <img src="https://mintcdn.com/apiyillc/ixpvMIHp9cVMdY-m/images/console-log-cache-tokens-tooltip.png?fit=max&auto=format&n=ixpvMIHp9cVMdY-m&q=85&s=02a7c323427d0d381c6816e3a47be0db" alt="Log row tooltip reading 命中（读取缓存）：32,815 tokens" width="1218" height="358" data-path="images/console-log-cache-tokens-tooltip.png" />
</Frame>

For models billed with cache tiers such as OpenAI and Claude, this makes **billing verifiable row by row**: the cache-read portion is charged at the cache rate and the cache-write portion at the write rate, and both reconcile directly against the actual charge on the right. Previously, confirming a hit meant opening Cache Billing Details — the `usage` cache fields echoed back in the API response are not always accurate — and it can now be read straight off the list.

How caching is enabled and what makes a hit are unchanged; see [Does APIYI Support Cache Billing?](/en/faq/cache-billing).

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
