> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Returns 200 with Empty Content? New FAQ on What a Refusal Looks Like

> New FAQ: when Claude hits the provider's safety policy it does not error, but returns HTTP 200, empty content and stop_reason: refusal, with the refusal category in stop_details. The FAQ covers measured output for four API formats, billing under the provider's rules, and detection code.

**2026/9/29 13:10 (UTC+8)** · Docs Update · Anthropic

📚 **Claude returns 200 but `content` is empty and `content[0]` throws? That is a model refusal, not an API failure**

From a real support ticket: a batch job asked Claude whether code snippets contain vulnerabilities, and some samples came back within 1–2 seconds as HTTP 200 with an empty `content` array and `output_tokens` of 0, crashing the script on `message.content[0]`. The requests had triggered the provider's cyber safeguards: `stop_reason` is `refusal` and `stop_details.category` is `cyber`. In the OpenAI-compatible format you get an empty string with `finish_reason: "refusal"`.

The new FAQ shows measured output for native / OpenAI-compatible and streaming / non-streaming calls, the five refusal categories, billing under the provider's rules (pre-output refusals in `cyber` and `general_harms` are not billed), and detection code for both SDKs: [Why Does a Claude Refusal Return Empty Content?](/en/faq/claude-content-safety-refusal). A new "Claude FAQ" sub-section has been added under "Claude Official" in the sidebar.

***

← [Back to Live](/en/live) · 📚 [Monthly archive](/en/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.