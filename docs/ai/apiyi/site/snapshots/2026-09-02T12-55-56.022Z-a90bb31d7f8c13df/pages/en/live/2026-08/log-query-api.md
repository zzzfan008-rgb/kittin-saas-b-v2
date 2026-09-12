> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Log Query API Docs Are Live — Pull Model, Charge, and Latency for Every Call

> New Log Query API documentation: GET /api/log/self returns the model, actual charge, latency, and error code for every call on your account, for automated reconciliation, self-service troubleshooting, and support tickets. The page spells out three easy-to-miss rules: page_size caps at 10 so you must paginate, reconciliation needs type=2, and quota ÷ 500,000 = USD.

**2026/8/2 01:23 (UTC+8)** · Docs Update

📊 **Log Query API docs are live — call records can now be pulled programmatically**

The endpoint is `GET https://api.apiyi.com/api/log/self`, returning the model, actual charge, latency, streaming flag, and error code for **every API call** on your account. It complements the [Balance Query API](/en/api-capabilities/balance-query): balance answers "how much is left", logs answer "where it went". Useful for automated reconciliation, self-service troubleshooting, and handing support a `request_id` that pinpoints one exact call.

Authentication uses a **system token** (generated at the bottom of your Profile page), not an `sk-` API Key, and `Authorization` takes the raw value with **no `Bearer` prefix**.

Three easy-to-miss rules are documented: `page_size` actually caps at **10** — passing 100 still returns 10 with no error, so any meaningful time range requires pagination; always pass `type=2` when totalling spend, or top-up and system-grant records get mixed in and break per-model sums; and `quota ÷ 500,000 = USD`, the same conversion used by balance query.

📖 Related: [Log Query API](/en/api-capabilities/log-query) · [Balance Query API](/en/api-capabilities/balance-query) · [How to view my call records](/en/faq/call-logs)

***

← [Back to Live Updates](/en/live) · 📚 [Monthly Archive](/en/live/archive)
