> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Console timezone display fixed — switch to your local timezone

> The date misalignment in the Logs page Call Data Overview chart and the Billing Summary for non-UTC account timezones is fixed. The earlier advice to stay on UTC+0 and dismiss the dialog is withdrawn; pick your own timezone, and the detail list, chart, Export and Billing Summary all agree.

**2026/9/20 00:55 (UTC+8)** · Service Notice

✅ **Console timezone display fixed: please pick your own timezone, and it is safe to accept the switch in the suggestion dialog**

Previously, when the account timezone was not UTC, the 调用数据一览 (Call Data Overview) chart at the top of the Logs page put data on the wrong day (for example, a bar for the next day appearing in the afternoon, Beijing time), and the hourly / daily grouping in the 汇总账单 (Billing Summary) was shifted by 8 hours. The root cause was a server-side time conversion, fixed at 2026/9/20 00:55 (UTC+8).

The log detail list, the chart, Export and Billing Summary now all follow the account timezone and agree with each other; the [Log Query API](/en/api-capabilities/log-query) still returns Unix second timestamps. The 8/9 advice to dismiss the dialog and stay on UTC+0 is withdrawn.

Switching the timezone does not modify any call record or charge. Billing Summary files exported before the fix may have daily grouping shifted by 8 hours, while the totals are unaffected; export again if you need exact per-day reconciliation. See [What should I know about log timezone settings and data export?](/en/faq/log-timezone-and-export).

***

← [Back to Live](/en/live) · 📚 [Monthly archive](/en/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.