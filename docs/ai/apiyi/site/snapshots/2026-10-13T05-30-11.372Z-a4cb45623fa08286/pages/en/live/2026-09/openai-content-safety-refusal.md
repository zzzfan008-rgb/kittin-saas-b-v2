> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Refusals Have No Error and No Category: New FAQ on What They Look Like and How to Detect Them

> New FAQ: when a GPT model declines a request that violates the provider's usage policy, it returns HTTP 200, finish_reason stop and a short refusal, with no error code or category, billed as normal. In translation and other structured-output tasks this shows up as a JSON parsing failure. Non-streaming requests now fail over to another official route automatically on content filtering.

**2026/9/18 14:41 (UTC+8)** · Docs Update · OpenAI

📚 **OpenAI models refuse with a 200, no error and no category, which shows up as a JSON parsing failure in translation tasks**

When a GPT model receives a request that violates the provider's usage policy, it returns HTTP 200, `finish_reason: "stop"` and a short refusal. There is no error code and no refusal category, and the call is billed as normal output. A task that expects JSON gets a plain sentence instead, so the client reports a parsing error such as `Unrecognized token`.

APIYI has enabled automatic content safety failover for **non-streaming requests**: when one official route triggers a content filter, the request is retried on another official route. Streaming requests cannot be switched once output has started. The new FAQ shows the refusal response body and how to detect it, and recommends archiving failed cases internally for analysis before retrying that content with another model. See [What Does an OpenAI Model Refusal Look Like?](/en/faq/openai-content-safety-refusal).

***

← [Back to Live](/en/live) · 📚 [Monthly archive](/en/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.