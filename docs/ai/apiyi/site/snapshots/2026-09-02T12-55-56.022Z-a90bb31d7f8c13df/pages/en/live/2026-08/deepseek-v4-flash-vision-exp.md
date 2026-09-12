> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek's first vision model is live, at no vision premium

> deepseek-v4-flash-vision-exp is now available, adding image input on top of the V4 Flash base at exactly the text-only price. Images convert to input tokens by size, capped at 384 per image. Both OpenAI and Anthropic formats work, each through its own group.

**2026/8/21 23:41 (UTC+8)** · New Model · DeepSeek

🚀 **DeepSeek's first vision model `deepseek-v4-flash-vision-exp` is live, at no vision premium**

Built on the V4 Flash base with image input added, it keeps the 1M context, thinking mode,
function calling and context caching, and is priced exactly like the text-only version:
\$0.44 input, \$1.32 output per 1M tokens. Images convert to input tokens by size,
**capped at 384 per image**, with large images rescaled to roughly an 800×800 equivalent ——
2000² and 4000² cost exactly the same, so pre-compressing saves bandwidth but not money.
Images can be sent inline as base64 or by public URL (32 MiB per image).

Both protocols work, and **the group must match the protocol**:

* OpenAI format (`/v1/chat/completions`, `/v1/responses`): use a `default` group token
* Anthropic format (`/v1/messages`, incl. Claude Code and similar clients): use a `ClaudeCode` group token

Both groups are priced identically —— the group affects capability only, never billing.
We ran 124 test cases across roughly 1,100 calls; the three image channels, four formats and
the `detail` token savings are all written up in the docs.

📖 [DeepSeek V4 Flash Vision overview](/en/api-capabilities/deepseek-v4-flash-vision/overview)

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)
