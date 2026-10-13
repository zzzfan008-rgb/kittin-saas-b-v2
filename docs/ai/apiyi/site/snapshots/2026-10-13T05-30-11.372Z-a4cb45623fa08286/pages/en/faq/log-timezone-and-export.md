> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# What should I know about log timezone settings and data export?

> Set your account timezone to where you are (Asia/Shanghai for users in China) and feel free to accept the console's timezone switch suggestion. The log detail list, the Call Data Overview chart, Export and Billing Summary all follow the account timezone, so they agree with each other; only the Log Query API returns Unix timestamps.

## Short answer

<CardGroup cols={3}>
  <Card title="Pick your local timezone" icon="globe">
    Users in China pick `Asia/Shanghai` (UTC+8); everyone else picks their local timezone. Once set, every time you see is your local time
  </Card>

  <Card title="Accept the suggestion dialog" icon="bell">
    When the console detects a different device timezone it shows a "本地设置建议" (Local Settings Suggestion) dialog — **just click the switch button**
  </Card>

  <Card title="One basis everywhere" icon="check">
    The detail list, the chart, **Export** and **Billing Summary** all use the account timezone, so no conversion is needed between them
  </Card>
</CardGroup>

<Info>
  **The chart misalignment was fixed at 2026/9/20 00:55 (UTC+8).** Previously, when the account timezone was not UTC, the 调用数据一览 (Call Data Overview) chart at the top of the Logs page put data on the wrong day (for example, a bar for the next day appearing in the afternoon, Beijing time). That is why we used to recommend staying on UTC+0 and dismissing the dialog. The issue is fixed and **that advice is withdrawn** — please pick your own timezone.
</Info>

### Historical data offset

Before this fix, the database default timezone was UTC+8. Combined with the user-selected Shanghai timezone (UTC+8), this produced an offset in the chart data. The database default timezone has now been adjusted to UTC+0, so the chart follows the user-selected timezone with no further offset.

What is affected: charts and Billing Summary grouped by day / hour **before 2026/9/20 00:55 (UTC+8)** may have an 8-hour date offset. The total amount is not affected, and per-call detail records are not affected. For day-level reconciliation, re-export once.

If you need to reconcile historical data, you can also pull per-call records through the [Log Query API](/en/api-capabilities/log-query) and aggregate them yourself; this is more reliable than relying on pre-fix summary files.

<Tip>
  **The rule in one line**: everything you **see or export in the console** (detail list, chart, export files, Billing Summary) follows your **account timezone**; what you **pull programmatically** (`created_at` from the [Log Query API](/en/api-capabilities/log-query)) is a **Unix second timestamp**, independent of any timezone.
</Tip>

## Where to check and change your account timezone

The account timezone is shown and edited in the 用户信息 (User Info) section of the console. New accounts default to `UTC`; users in China should switch to `Asia/Shanghai`.

<Frame caption="The timezone setting in the console's User Info section — change it from the dropdown">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-user-info-timezone.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=94b725d2393ee1ff84eda7b4c1360743" alt="The timezone setting in the console User Info section" width="892" height="332" data-path="images/console-user-info-timezone.png" />
</Frame>

Switching the timezone **only changes how times are displayed and grouped**. No call record or charge is modified or lost, and you can change it back at any time.

## Accept the switch when the suggestion dialog appears

When your account timezone (for example `UTC`) differs from your current device timezone (for example `Asia/Shanghai`), the console opens a "本地设置建议" (Local Settings Suggestion) dialog. **Just click the switch button on the right.** The detail list and the chart then show Beijing time.

<Frame caption="The Local Settings Suggestion dialog — you can click the switch button directly">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-timezone-local-settings-dialog.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=974f0da20864d287c8e2cb82e75f45b6" alt="Local Settings Suggestion dialog showing account timezone UTC and device timezone Asia/Shanghai, with Dismiss and Switch buttons" width="1054" height="546" data-path="images/console-timezone-local-settings-dialog.png" />
</Frame>

If your finance team reconciles strictly in UTC, you can dismiss the dialog and stay on UTC instead. Both choices display correctly now, so pick whichever matches your reconciliation process.

The 调用数据一览 (Call Data Overview) chart at the top of the Logs page buckets data by calendar day in the account timezone:

<Frame caption="The Call Data Overview at the top of the Logs page, bucketed by day in the account timezone">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-log-call-data-overview.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=246553c9d4025e4bf5aaae4598f39866" alt="The Call Data Overview entry at the top of the console Logs page, outlined in red" width="1002" height="374" data-path="images/console-log-call-data-overview.png" />
</Frame>

## Which export should you use?

The Logs page has two buttons in the top-right corner, 导出 (Export) and 汇总账单 (Billing Summary).

<Frame caption="The Export and Billing Summary buttons in the top-right corner of the Logs page">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-log-export-buttons.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=d8f2d7b0359ddcf6aebdd66399bfcffe" alt="Logs page toolbar with the Export button on the left and the Billing Summary button on the right" width="650" height="212" data-path="images/console-log-export-buttons.png" />
</Frame>

| | 导出 (Export) | 汇总账单 (Billing Summary) |
| - | - | - |
| Timezone basis | **Account timezone** | **Account timezone** |
| Granularity | Individual call records (selectable fields) | Spend aggregated by hour, day or month |
| Volume | Large batches, can run asynchronously | Small, downloads directly |
| Best for | Reconciliation, audit, custom analysis | A quick look at total spend, tax records |

Both buttons use the same timezone basis and differ only in granularity and volume. Pick whichever matches what you need — individual records or aggregated totals.

For example, with the account set to `Asia/Shanghai`, a call made at **2026-09-20 01:08 (UTC+8)**:

* shows as `2026-09-20 01:08` in the **page detail list**
* shows as `2026/9/20 1:08` in the **export file** as well
* falls under `2026-09-20` in the **Billing Summary** (daily) and on September 20 in the chart

<Tip>
  **The first 14 digits of a request ID are UTC time.** For example `20260919170811…` means `2026-09-19 17:08:11` UTC, i.e. `2026-09-20 01:08:11 (UTC+8)`. When checking a specific call with support, the request ID is the most precise reference.
</Tip>

### Export → background async export (recommended)

When you need line-by-line spend records, use the 导出 (Export) button and pick **后台异步导出 (background async export)** in the dialog.

<Frame caption="The export dialog — select background async export for large volumes">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-log-async-export-dialog.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=09865097dc2f80581a82e2d7feb06f3c" alt="Export dialog showing selectable fields, current-page versus background async export, Excel and CSV formats, and a maximum record count" width="974" height="1312" data-path="images/console-log-async-export-dialog.png" />
</Frame>

Key points:

* **Times are written in the account timezone**, matching the page detail list
* **Selectable fields**: usage time, request ID, token name, model name and more — pick what your reconciliation needs
* **Export mode**: for large volumes choose background async export; the job runs in the background without blocking the page, and it is recommended above 10,000 records
* **Format**: Excel (`.xlsx`, very large exports are split and zipped automatically) or CSV (`.csv`, for small volumes)
* **Maximum record count**: `0` means unlimited (the server splits into multiple Excel files and zips them), with a ceiling of 50 million records
* **Progress**: once the job is created, track its progress and status on the 任务管理 (Task Management) page, then download the file

For the full export walkthrough and archiving advice, see [How long are call logs kept?](/en/faq/log-retention-policy).

## Reconciliation in practice

<Steps>
  <Step title="Make sure both sides use the same timezone">
    Export files group dates by **the exporting account's timezone**. When several people reconcile, or when you match against a finance system, first confirm everyone uses the same timezone (for example `Asia/Shanghai`); otherwise calls made around midnight land on different dates.
  </Step>

  <Step title="Convert API timestamps yourself">
    `created_at` from the [Log Query API](/en/api-capabilities/log-query) is a Unix second timestamp; convert it to whatever timezone you need. For Beijing time, add **28800** (8 × 3600) and format as UTC, or use your language's timezone library.
  </Step>

  <Step title="Include the request ID and timezone when reporting an issue">
    The request ID carries UTC time and is the least error-prone reference; when quoting a time, always state the timezone, such as `01:08 (UTC+8)`.
  </Step>
</Steps>

<Tip>
  For reconciliation or audit work that has to be split by *business day*, you can also use the [Log Query API](/en/api-capabilities/log-query) with your own script, which gives you more control than export files.
</Tip>

## Common questions

<AccordionGroup>
  <Accordion title="The docs used to say stay on UTC+0 and dismiss the dialog — is that still needed?">
    No. That advice existed because the chart put data on the wrong day when the account timezone was not UTC. The issue was fixed at 2026/9/20 00:55 (UTC+8). Please pick your own timezone now.
  </Accordion>

  <Accordion title="I kept UTC as advised — should I switch to Beijing time?">
    We recommend switching to `Asia/Shanghai` so that every time in the console is Beijing time and you no longer add 8 hours by hand. If your reconciliation process is fixed on UTC, staying on UTC is fine too — both display correctly now.
  </Accordion>

  <Accordion title="Will switching the timezone lose any data?">
    No. The timezone only affects how times are displayed and grouped by date. No call record or charge is modified, and you can switch back at any time.
  </Accordion>

  <Accordion title="Are files exported before the fix still accurate?">
    Every record and amount in a line-by-line export (the Export button) is accurate, with times shown in the account timezone at that moment. For Billing Summary files and chart data **before 2026/9/20 00:55 (UTC+8)**, the **daily or hourly grouping** may be shifted by 8 hours, while the totals are unaffected. If you need an exact per-day reconciliation, export again.
  </Accordion>

  <Accordion title="Why don't the times on my page match a colleague's export?">
    Most likely your account timezones differ. Export files use the exporting account's timezone — confirm both accounts use the same one under User Info.
  </Accordion>

  <Accordion title="Can the Log Query API take a timezone parameter?">
    No. The API only accepts and returns Unix second timestamps, which are UTC by definition. Convert client-side as needed.
  </Accordion>

  <Accordion title="Do the exported files contain my inputs and outputs?">
    No. The exported fields match what the console shows — time, request ID, token name, model, token counts, amount, status — with no prompts or model output. See [How long are call logs kept?](/en/faq/log-retention-policy).
  </Accordion>

  <Accordion title="Can I pull logs programmatically instead of exporting from the page?">
    Yes, see the [Log Query API](/en/api-capabilities/log-query). Its `start_timestamp`, `end_timestamp` and `created_at` are all **Unix second timestamps**, independent of the console timezone setting — a good fit for automated reconciliation.
  </Accordion>

  <Accordion title="My export job never finishes — what should I do?">
    First check the job status on the 任务管理 (Task Management) page. For very large volumes (millions of records) the server needs time to split and package the files; narrow the time range or set a sensible maximum record count and export in batches.
  </Accordion>
</AccordionGroup>

## Related documents

* [How do I view my call records?](/en/faq/call-logs)
* [How do I read the billing amounts in the logs?](/en/faq/log-billing-explained)
* [How long are call logs kept?](/en/faq/log-retention-policy)
* [Log Query API](/en/api-capabilities/log-query)
* [Live update: console timezone display fixed — switch to your local timezone](/en/live/2026-09/console-timezone-fixed)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.