> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Reverse gpt-image-2-all 500 errors usually mean a content-policy hit (not billed)

> When gpt-image-2-all returns 500 Internal Server Error with message '未接收到上游响应内容' (no upstream response), the prompt or reference image typically tripped upstream content policy (named celebrities, copyrighted characters); retries don't help, the call isn't billed, and the user should revise the prompt.

**2026/4/27 15:28 (UTC+8)** · Model Status · OpenAI

⚠️ **Reverse `gpt-image-2-all` 500 errors usually mean a content-policy hit** — When you see `500 Internal Server Error` with message `未接收到上游响应内容` ("no upstream response received"), the prompt or reference image typically tripped upstream content policy (e.g., named celebrities, copyrighted characters — "LeBron James from the Lakers" will fail outright). The call isn't billed and retries won't help; guide the user to revise the prompt.

📖 Official relay vs. reverse: [/en/api-capabilities/gpt-image-2/vs-gpt-image-2-all](/en/api-capabilities/gpt-image-2/vs-gpt-image-2-all)

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)
