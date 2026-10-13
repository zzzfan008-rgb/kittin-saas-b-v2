> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Personal Access Tokens Are Live; System Tokens Retire on 2026-11-11

> The console now offers personal access tokens for management APIs such as balance, log and token management, with per-scope permissions, expiry and IP allowlists. Legacy system tokens are scheduled to retire on 2026-11-11 (UTC+8); we may extend based on usage, but recommend switching now.

**2026/10/12 20:20 (UTC+8)** · Service Notice

🚀 **Personal access tokens are live: a scoped credential for management APIs**

You'll find them on your profile page under **Account Options** → **Personal Access Tokens**. Scripts use them to call management APIs such as balance query, log query and token management. They are separate from the API Keys you use to call models.

* **Scoped access**: read, write and reveal secret are separate permissions. A reconciliation script, for example, only needs "Usage & personal records · Read".
* **Expiry**: 30 days by default. You can also pick 90, 180 or 365 days, a custom date, or never. We recommend a longer period.
* **IP allowlist**: IPv4, IPv6 and CIDR are supported, and the allowlist can't be changed after creation. Leave it empty while you test, then create a separate production token with an allowlist once everything works.
* **Count**: up to 20 per account. Use one per script, so a leak means deleting just that one.

⏸ **Legacy system tokens are scheduled to retire on 2026-11-11 (UTC+8).** After that, calls made with them return 401 `ACCESS_TOKEN_LEGACY_RETIRED`. We'll review usage and may extend the date, but we recommend switching to a personal access token now. You only need to replace the value in the `Authorization` header. Your code stays the same.

See [What Is a Personal Access Token and How Do I Replace the System Token?](/en/faq/personal-access-token) for setup steps, the permission table and common errors. The [Balance Query](/en/api-capabilities/balance-query), [Log Query](/en/api-capabilities/log-query) and [Token Management](/en/api-capabilities/token-management) API docs have been updated.

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.