> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Codex Setup Method Upgraded

> The Codex integration guide now uses the experimental_bearer_token form: the key goes directly into the config.toml provider block, so one config works across the desktop app, IDE extension, and CLI — fixing the Missing environment variable error, with the fix documented in troubleshooting.

**2026/7/13 22:50 (UTC+8)** · Docs Update · OpenAI

📚 **Codex setup method upgraded: one `experimental_bearer_token` line, one config for all three surfaces**

The old form used `env_key = "OPENAI_API_KEY"` in the provider block — it only reads the launching process's environment variables and never falls back to `auth.json`, so the desktop app / IDE extension launched from the Dock can't see variables exported in a terminal and often fails with `Missing environment variable: OPENAI_API_KEY`. The guide now puts `experimental_bearer_token = "sk-..."` directly in the `config.toml` provider block, so one config works across the desktop app, IDE extension, and CLI; the error's cause and fix are now the first entry in troubleshooting — see the [Codex integration guide](/en/scenarios/programming/codex-cli).

If you configured Codex from the older guide, migrating to the new form takes one edit and works across all three surfaces for good.

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)
