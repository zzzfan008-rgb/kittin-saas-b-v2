> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Rejects a Thinking Signature and All 10 Retries Fail? New FAQ on the Cause and Fix

> New FAQ: when Claude Code or a Claude Agent client with thinking enabled reports 429 Invalid signature in thinking block, it is not rate limiting. A thinking block in the conversation history has an invalid signature, so retries never help. Start a new conversation, and use one model and one key per conversation.

**2026/9/29 22:38 (UTC+8)** · Docs Update · Anthropic

📚 **Claude returns 429 `Invalid signature in thinking block`? It is not rate limiting: a thinking signature in the history is invalid**

From a real support ticket: a customer ran a task with thinking enabled in Cherry Studio's Claude Agent mode. The main conversation never replied, the client showed "too many requests" and retried 10 times, yet the console logs showed normal billed requests. Those were the client's small auxiliary requests. The cause was an empty signature on the first-turn `thinking` block in the history, which failed the provider's check. The same history is sent on every retry, so retries always fail.

The new FAQ lists the four common causes (the client drops signatures, history is altered, switching models mid-conversation, switching keys or groups mid-conversation) and shows how to replay `thinking` blocks correctly in your own code. The fix is simple: **start a new conversation**, and use one model and one key per conversation. See [How Do I Fix Claude's Invalid Thinking Signature Error?](/en/faq/claude-thinking-signature-invalid).

***

← [Back to Live](/en/live) · 📚 [Monthly archive](/en/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.