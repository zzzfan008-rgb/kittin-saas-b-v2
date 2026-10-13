> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Use the CodexResponses Group for glm-5.3-flash and Seed 2.0 via Responses

> When calling glm-5.3-flash, dola-seed-2.1-turbo or the Seed 2.0 series through the Responses API from clients such as Codex, switching your token group to CodexResponses avoids an internal retry and responds faster. Chat Completions calls are unaffected and can stay on the default group.

**2026/9/30 18:13 (UTC+8)** · Service Notice · Zhipu / ByteDance

💡 **Calling `glm-5.3-flash` or the Seed 2.0 series through the Responses API? Set your token group to `CodexResponses` for faster responses**

The default group contains both Chat Completions and Responses channels. A `/v1/responses` request from a client such as Codex can occasionally land on a channel that only supports Chat Completions first; it is rejected there and the platform automatically retries it on a Responses channel. The result is correct, but each such request waits a few extra seconds to tens of seconds. `CodexResponses` is a Responses-only group, so requests go straight to a Responses channel with no internal retry.

Models covered (all enabled in the `CodexResponses` group):

* `glm-5.3-flash`
* `dola-seed-2-1-turbo-260628`
* Seed 2.0 series: `seed-2-0-pro-260328`, `seed-2-0-lite-260428`, `seed-2-0-mini-260428`, `seed-2-0-code-preview-260328`, and more

Change the group in your token settings in the console to `CodexResponses`; the key stays the same. Chat Completions (`/v1/chat/completions`) calls are unaffected and can stay on the default group. Model details: [glm-5.3-flash](/en/models/glm-5-3-flash), [dola-seed-2.1-turbo](/en/models/dola-seed-2-1-turbo).

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.