> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Token Management API Docs Are Live — Issue Keys in Bulk with Quota, Model, and Expiry Limits

> New Token Management API documentation: /api/token/ creates, lists, enables, disables, and deletes API keys, with per-key limits on quota, allowed models, and expiry. The page spells out that the key in the create response is plaintext without the sk- prefix, that there is no server-side bulk endpoint so batches loop client-side, and that model_limits and allow_ips are accepted but have no effect.

**2026/8/2 01:24 (UTC+8)** · Docs Update

🔑 **Token Management API docs are live — the full key lifecycle can now be scripted**

The base path is `https://api.apiyi.com/api/token/`: `POST` to create, `GET` to list or fetch one, `PUT` to update (add `?status_only=true` to just toggle enabled/disabled), `DELETE` to remove. The most common use is **bulk issuance** — one key per teammate, downstream customer, or project, each capped by `remain_quota`, restricted to a `models` allowlist, and expiring at `expired_time`.

Authentication again uses the raw **system token** with no `Bearer` prefix. Note that the system token cannot call models itself, but it **can create keys that do** — so leaking it is far more damaging than leaking a single API key. Store it at account-password level and rotate it periodically.

Three implementation details are documented: the `key` in the create response is **plaintext and does not include the `sk-` prefix**, so prepend it yourself; there is **no server-side bulk create** — passing something like `count` has no effect, batches are a client-side loop; and `model_limits`, `model_limits_enabled`, and `allow_ips` are accepted without error but **currently have no effect**, so use `models` to restrict which models a key can call. Also, `unlimited_quota` defaults to `false` while `remain_quota` defaults to 0 — omitting both creates a zero-quota key that cannot be used.

📖 Related: [Token Management API](/en/api-capabilities/token-management) · [How to create a KEY](/en/faq/token-management) · [Log Query API](/en/api-capabilities/log-query)

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
