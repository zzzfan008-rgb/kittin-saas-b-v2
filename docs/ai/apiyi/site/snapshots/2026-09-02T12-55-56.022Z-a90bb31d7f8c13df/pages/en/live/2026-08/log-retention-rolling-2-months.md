> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Log cleanup moves to three runs a month, keeping a rolling two months

> From 15 August 2026, call logs are cleared on the 5th, 15th and 25th of each month, each run deleting data older than two months, leaving a rolling window of roughly the last two months. The 15 August run clears everything before 15 June. Individual runs will no longer be announced — the Log Retention and Cleanup Policy page is the reference.

**2026/8/9 14:35 (UTC+8)** · Service Notice

🗂️ **Log cleanup moves to three runs a month, keeping a rolling window of about two months**

From **15 August 2026**, call-log cleanup changes from "one whole calendar month removed on the 5th" to **a run on the 5th, 15th and 25th of each month**, each deleting data **older than two months**. The first run under the new rule is **15 August, which clears everything before 15 June**; 25 August then clears everything before 25 June, 5 September clears everything before 5 July, and so on.

The move to a run every ten days is driven by table size: deleting a whole month at once is a large enough operation to slow the database down and affect live traffic. Smaller, more frequent batches keep both the operational load and the impact on live calls low. As a result the queryable window drifts between **two months and two months plus ten days** — shortest right after a run, longest just before the next one.

If you need records kept longer, filter by time range in the **Logs** section and use **async export**, then archive the file yourself for reconciliation, expense claims and audits. **Cleanup is a physical delete and cannot be undone.** Exporting the previous month at the start of each month — or simply before the 5th — removes any need to track cleanup dates.

**Individual cleanup runs will no longer be announced.** The rules and schedule are published on the [Log Retention and Cleanup Policy](/en/faq/log-retention-policy) page.

📖 Related: [How to view my call records](/en/faq/call-logs) · [How do I read the billing amounts in the logs](/en/faq/log-billing-explained)

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)
