> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# How do I look up a Seedance video's real cost by task_id?

> One video shows two charge entries in the logs and a single quota in the task detail. Here is how the three numbers relate and how to fetch a video's final cost by task_id programmatically.

## Short answer

**Query the task API by `task_id`; the returned `quota` is the video's total cost.** The two log entries (pre-charge + settlement) add up to it, and the `quota` in the "Async tasks" detail view is the same number.

```bash theme={null}
curl --compressed -s "https://api.apiyi.com/api/task/self?p=1&page_size=1&task_id=<your task_id>" \
  -H "Authorization: $APIYI_SYS_TOKEN" | jq '.data.items[0] | {task_id, status, quota, submit_time, finish_time}'
```

`quota ÷ 500,000 = USD`. Authenticate with a **system token** (not an `sk-` API key); see the [Log Query API](/en/api-capabilities/log-query) for how to get one.

Do not try to pair log entries one by one through the Log Query API: neither entry carries the `task_id`, and the settlement entry has an empty `request_id`.

## How the three numbers relate

Seedance videos are billed as "pre-charge at submission, settle the difference on completion", so one video leaves two log entries while the task API and the task detail view show a single `quota`:

| Where                          | Value        | Meaning                                                                                                                                                                                                       |
| ------------------------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Log entry 1 (pre-charge)       | e.g. 224,999 | Estimated from the request parameters and deducted at submission. `completion_tokens` is 0, `request_id` is present                                                                                           |
| Log entry 2 (settlement)       | e.g. 702,613 | The total is recomputed from actual tokens on completion and **only the difference is recorded** (positive = extra charge, negative = refund). `completion_tokens` is the actual usage, `request_id` is empty |
| Task API / task detail `quota` | e.g. 927,612 | **Sum of the two = final total cost** = actual tokens × model ratio × group ratio                                                                                                                             |

Settlement can also be a refund: a fast 480p 4-second text-to-video task was pre-charged 144,000, used 40,594 tokens × 18.5 × 0.18 = 135,179, so the settlement entry records −8,821 (a \$0.02 refund) and the task API `quota` is 135,179.

The first set of numbers comes from a real 2.0 image-to-video task with a reference video: 368,100 tokens × 14 (the video-input pricing tier) × 0.18 (group ratio) = 927,612, i.e. \$1.86. The settlement entry's `other` field carries `final_quota` = 927,612, `original_quota` = 224,999 and `adjustment_quota` = 702,613, so all three are visible in one record.

## Read the real cost by status

| `status`                    | What `quota` means                               | The video's real cost                                                                                               |
| --------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `completed`                 | Final settled total                              | = `quota`                                                                                                           |
| `submitted` / `in_progress` | Only the pre-charge taken at submission          | Wait for completion                                                                                                 |
| `failed`                    | **Still shows the pre-charge; it is not zeroed** | **0**. The pre-charge is refunded in full, with a negative `type=11` log entry whose `content` carries the task\_id |

Note the two vocabularies differ: the video query endpoint `/seedance/api/v3/.../tasks/{id}` reports success as `succeeded`, while the task API `/api/task/self` reports it as `completed`; do not copy the condition from your polling code.

<Warning>
  Summing `quota` over failed tasks counts their pre-charge as spend. Filter by `status` when reconciling programmatically; if you reconcile through the Log Query API instead, **pull both `type=2` and `type=11`**, the latter being refund entries with a negative `quota`.
</Warning>

## Parameter spelling (opposite of the Log Query API)

The task API's paging parameters are **snake\_case `page_size`** and the page number **`p` starts at 1**; the Log Query API uses camelCase `pageSize` with `p` starting at 0. Getting it wrong does not raise an error, you just get the default page.

Verified filters:

| Parameter                           | Description                                             |
| ----------------------------------- | ------------------------------------------------------- |
| `task_id`                           | Fetch exactly one task                                  |
| `model_name`                        | Filter by model, e.g. `doubao-seedance-2-0-fast-260128` |
| `start_timestamp` / `end_timestamp` | Unix seconds, filtered by submission time               |
| `p` / `page_size`                   | Paging, `p` starts at 1                                 |

For batch reconciliation, pull by time window; every item carries `task_id`, `status`, `quota`, `submit_time`, `finish_time` and `model_name`:

```python theme={null}
import os, time, requests

BASE = "https://api.apiyi.com"
HEADERS = {"Authorization": os.environ["APIYI_SYS_TOKEN"], "Accept": "application/json"}

def video_cost(task_id: str):
    """Return (status, cost in USD). Failed tasks cost 0; in-progress tasks return None."""
    r = requests.get(f"{BASE}/api/task/self", headers=HEADERS, timeout=60,
                     params={"p": 1, "page_size": 1, "task_id": task_id})
    r.raise_for_status()
    items = r.json()["data"]["items"]
    if not items:
        return None, None
    task = items[0]
    status = task["status"]
    if status == "completed":
        return status, task["quota"] / 500_000
    if status == "failed":
        return status, 0.0
    return status, None          # submitted / in_progress: quota is only the pre-charge, do not book it yet

def list_tasks(start: int, end: int, page_size: int = 100):
    """Page through a submission-time window; p starts at 1, stop on an empty page."""
    p = 1
    while True:
        r = requests.get(f"{BASE}/api/task/self", headers=HEADERS, timeout=60,
                         params={"p": p, "page_size": page_size,
                                 "start_timestamp": start, "end_timestamp": end})
        r.raise_for_status()
        items = r.json()["data"]["items"]
        if not items:
            return
        yield from items
        p += 1
        time.sleep(1)
```

## If you must cross-check in the logs manually

Three fields on the settlement entry line up with the task API:

* Its timestamp (`created_at`) equals the task's `finish_time`, within 1 second
* Its `completion_tokens` equals the task's `usage.completion_tokens`
* Its `other.final_quota` equals the task's `quota`

The pre-charge entry's `request_id` equals the **`X-Shellapi-Request-Id`** header of the submission response, so it can be looked up with `/api/log/self?request_id=…`. Note the response also carries an `X-Request-Id` header; that is the provider-side request ID and cannot be found in APIYI logs. But **pre-charge entries collide when several tasks are submitted in the same second**, and the settlement entry has no `request_id`, so the logs are only suitable for spot-checking individual tasks. Use the task API for programmatic reconciliation.

## FAQ

<AccordionGroup>
  <Accordion title="The quota in the task detail differs from the sum of the two log entries?">
    Check the task status first. While `submitted` / `in_progress`, `quota` is only the pre-charge and the second log entry does not exist yet; when `failed`, `quota` still shows the pre-charge while the logs gained a negative refund entry, so the two entries sum to 0. For `completed` tasks the two must match; if they do not, send the `task_id` to support.
  </Accordion>

  <Accordion title="Why does the settlement entry have no token and no request_id?">
    The settlement is booked by the system when the task completes, outside the gateway request path, so it carries no token, group or `request_id`, and the console labels it "streaming". This is normal.
  </Accordion>

  <Accordion title="Do tasks submitted through the generic video endpoints carry a task_id in the logs?">
    On `/v1/videos` and the other generic endpoints the pre-charge entry's `content` does include `task ID: cgt-…`, but the settlement entry still does not. Those endpoints also pass Seedance's resolution parameter through incompletely at the moment, so always use the documented path `/seedance/api/v3/contents/generations/tasks`; see the [Video Generation API](/en/api-capabilities/seedance2/video-generation).
  </Accordion>

  <Accordion title="Can a system token see other accounts' tasks?">
    `/api/task/self` returns only the tasks of the account that owns the token. A system token is equivalent to account credentials, so guard it like a password and keep it out of code repositories.
  </Accordion>
</AccordionGroup>

## Related docs

* [Seedance 2.0 / 2.5: reading charges in the logs](/en/api-capabilities/seedance2/overview)
* [Log Query API](/en/api-capabilities/log-query)
* [Can a Seedance video task be cancelled after submission?](/en/faq/seedance-video-task-cancel)
* [What is the pre-deduction mechanism for API calls?](/en/faq/pre-deduction-quota)
