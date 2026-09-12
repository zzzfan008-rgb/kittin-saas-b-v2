> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# gemini-3.1-pro-preview intermittent timeouts: Google upstream capacity exhausted (429)

> gemini-3.1-pro-preview is hitting intermittent timeouts right now — root cause is Google upstream capacity pressure, returning status_code=429 Resource has been exhausted (e.g. check quota). Suggested mitigations: raise client timeout, add retries with backoff, optionally fall back to gemini-2.5-pro for downgradable tasks.

**2026/5/11 23:05 (UTC+8)** · Model Status · Google

⚠️ **gemini-3.1-pro-preview intermittent timeouts: Google upstream capacity exhausted (429)** — Heads-up: `gemini-3.1-pro-preview` is hitting intermittent timeouts right now. Root cause is Google upstream capacity pressure. **Even with ample account-side concurrency**, the upstream still returns `status_code=429, Resource has been exhausted (e.g. check quota).` — an upstream quota exhaustion at Google that cannot be absorbed on our relay side.

💡 **Suggested mitigations (use your own judgment per task)**:

* **Raise the client-side timeout** to match task complexity — give the upstream a generous window for long-running calls
* Add **client-side retries with exponential backoff** — most 429 hits recover on retry
* If your task tolerates a downgrade, you can optionally call `gemini-2.5-pro` instead — that model is currently stable

We'll update this entry as the upstream recovers.

***

← [Back to Live Updates](/en/live) · 📚 [Archive](/en/live/archive)
