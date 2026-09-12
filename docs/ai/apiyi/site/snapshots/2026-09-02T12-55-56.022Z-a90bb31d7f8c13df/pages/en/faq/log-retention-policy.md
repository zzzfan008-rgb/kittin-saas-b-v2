> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# How long are call logs kept, and when are they cleared?

> APIYI stores only what billing requires — never your inputs or outputs. Logs are kept on a rolling window of roughly the last two months, with cleanup running on the 5th, 15th and 25th of each month and deleting anything older than two months; export them yourself for long-term records.

## Short answer

<CardGroup cols={3}>
  <Card title="Billing data only" icon="receipt">
    Logs contain timestamps, model, token counts and amounts — the fields billing needs. **Your inputs and outputs are never stored.**
  </Card>

  <Card title="Rolling last two months" icon="calendar">
    Cleanup runs on the **5th, 15th and 25th** of each month, each removing data **older than two months**. Example: **15 August clears everything before 15 June**.
  </Card>

  <Card title="Export for long-term records" icon="download">
    Use **async export** in the **Logs** section of the console and archive the file yourself for reconciliation and audits.
  </Card>
</CardGroup>

<Warning>
  **Cleanup is irreversible.** Cleared logs cannot be recovered. If you need them for reconciliation, audits or expense claims, export before the cleanup date.
</Warning>

## What the logs contain

| Recorded                            | Not recorded                        |
| ----------------------------------- | ----------------------------------- |
| Call timestamp                      | Prompt text / conversation content  |
| Model name and group                | The model's output text             |
| Input / output token counts         | Generated image and video files     |
| Amount charged for the call         | Uploaded files and image content    |
| Status, latency, and similar fields | Personally identifiable information |

We keep only what billing and troubleshooting require. That is both a privacy-minimization principle and a direct reduction of the surface area for any data leak. For what each column means, see [how to read the billing amounts in the logs](/en/faq/log-billing-explained).

## Can I see generated images and videos in the console?

This is the most common follow-up question, and the answer depends on how the call was made:

<CardGroup cols={2}>
  <Card title="Synchronous calls: no" icon="eye-off">
    Results from synchronous text and image endpoints are **returned straight to your program and never stored**. The console sees neither the prompt nor the generated image.
  </Card>

  <Card title="Async tasks: yes, but links expire quickly" icon="clock-alert">
    Video and other **async tasks** work on a submit-then-poll model, so the result must be held temporarily to be queryable — which means the artifact is visible.
  </Card>
</CardGroup>

<Warning>
  **OSS links for async task artifacts last about one day.** Video and image download URLs expire after roughly 24 hours and cannot be retrieved afterwards. **Transfer results to your own storage as soon as you receive them** — do not use these temporary links in production or hand them to end users.
</Warning>

## The cleanup schedule

Logs are kept on a **rolling window**, on a simple rule: **cleanup runs on the 5th, 15th and 25th of each month, and each run deletes data older than two months** — three runs a month, leaving roughly **the last two months** queryable at any given moment.

| Cleanup date | Data removed              | Queryable afterwards |
| ------------ | ------------------------- | -------------------- |
| 15 August    | Everything before 15 June | 15 June — 15 August  |
| 25 August    | Everything before 25 June | 25 June — 25 August  |
| 5 September  | Everything before 5 July  | 5 July — 5 September |

<Note>
  Because a run happens every ten days and cuts by date rather than by whole month, the usable window drifts between **two months** and **two months plus ten days** — shortest right after a run, longest just before the next one.
</Note>

<Info>
  **This page is the notice; individual runs are not announced.** Cleanup happens automatically on the fixed schedule above, with no separate announcement before each run — treat the rules and table on this page as the reference.
</Info>

<Accordion title="Why three cleanups a month?">
  Log tables grow fast, and **deleting a whole month in one pass is large enough to slow the database down and affect live calls**. Running a smaller batch every ten days keeps both the operational load and the impact on live traffic low. That is why the schedule changed from one whole-month cleanup per month to three rolling cleanups per month, effective 15 August 2026.
</Accordion>

<Info>
  **Cleanup only removes call-log detail; your account balance is unaffected.** If you also need long-term records of top-ups and reconciliation, export and archive those as well.
</Info>

## Keeping logs longer

<Steps>
  <Step title="Open the Logs page">
    Go to `https://api.apiyi.com/log`, or click **Logs** in the top navigation.
  </Step>

  <Step title="Filter first">
    Narrow by time range, model or status so you export only the records you actually want to archive.
  </Step>

  <Step title="Use async export">
    Click **async export** to start the job. It runs in the background, so large exports do not require you to sit on the page.
  </Step>

  <Step title="Download and archive">
    Download the file once the job finishes and store it in your own system or finance workflow.
  </Step>
</Steps>

<Tip>
  **Make monthly exports a habit**: archive the previous month at the start of each month and the cleanup date stops mattering. This is especially worth doing for teams with reconciliation, expense-claim or audit requirements.
</Tip>

## Common questions

<AccordionGroup>
  <Accordion title="Why not keep logs indefinitely?">
    Two reasons: **privacy minimization** — the less retained, the smaller the exposure; and **storage cost** — log volume grows fast on a high-traffic platform, and keeping everything forever eventually shows up in pricing. We keep a window sufficient for reconciliation and give you the export tools to retain more yourself.
  </Accordion>

  <Accordion title="Can cleared logs be restored?">
    No. Cleanup is a physical delete with no recovery path, and support cannot restore it either. Export before the cleanup date.
  </Accordion>

  <Accordion title="Does cleanup affect my balance or top-up records?">
    No. Cleanup targets call-log detail; your account balance is unaffected. If you need long-term proof of top-ups and spending for expense claims or audits, export and keep those too.
  </Accordion>

  <Accordion title="What if the logs are not detailed enough for troubleshooting?">
    Within the retention window, the **timestamp and model name from the log** are enough to locate the vast majority of issues. If you genuinely need more detail, contact support and an administrator can **temporarily enable** detailed logging — see [can I view detailed logs in the backend](/en/faq/user-logs-control).
  </Accordion>

  <Accordion title="Does the exported file contain my inputs and outputs?">
    No. The export contains the log itself, with the same fields shown in the console — time, model, token counts, amount, status — and no prompt or model output whatsoever.
  </Accordion>

  <Accordion title="Can enterprise customers extend the retention period?">
    Enterprise customers with specific retention or compliance requirements can discuss it with our sales team. The standard recommendation is still regular exports — see [enterprise vs individual users](/en/faq/enterprise-vs-individual).
  </Accordion>
</AccordionGroup>

## Related documents

* [How to view my call records?](/en/faq/call-logs)
* [How do I read the billing amounts in the logs?](/en/faq/log-billing-explained)
* [Can I view detailed logs in the backend for troubleshooting?](/en/faq/user-logs-control)
* [How does APIYI ensure data security?](/en/faq/data-security)
* [Is there an async image API?](/en/faq/image-async-api)
