> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Can I Cancel a Seedance Video Task After Submission?

> Seedance 2.0 task cancellation, duplicate submissions, and billing review.

## Short answer

According to the current public Seedance 2.0 API documentation, the API provides task creation and task-status queries, but does not provide a task cancellation or deletion endpoint.

After a task is created successfully, the API returns a `task_id`. A client timeout, network interruption, closed web page, or stopped polling should not be treated as proof that the task was canceled. Query the original task before deciding whether to retry, so that you do not create duplicate tasks.

## Public endpoints and task statuses

Seedance 2.0 currently uses asynchronous task endpoints:

| Operation     | Endpoint                                               | Description                                                         |
| ------------- | ------------------------------------------------------ | ------------------------------------------------------------------- |
| Create a task | `POST /seedance/api/v3/contents/generations/tasks`     | Submits a video-generation task and returns a task ID on success    |
| Query a task  | `GET /seedance/api/v3/contents/generations/tasks/{id}` | Queries the task status and returns the video URL after success     |
| Cancel a task | Not provided in the current public documentation       | No public cancellation or deletion endpoint is currently documented |

The task normally follows this lifecycle:

```text theme={null}
queued → running → succeeded / failed / expired
```

* `queued`: The task was created and is waiting in the queue.
* `running`: The task is being processed.
* `succeeded`: Video generation completed successfully.
* `failed`: Task processing failed.
* `expired`: The task exceeded its execution window and expired.

After a successful generation, the video URL is returned in:

```text theme={null}
content.video_url
```

This is a temporary signed URL. The current documentation states that it is valid for about 24 hours. Download and store the video promptly after the task succeeds.

<Warning>
  The current public API documentation does not provide a task-cancellation endpoint. Stopping a local script or stopping polling only stops the client from querying; it does not prove that the server-side task was withdrawn.
</Warning>

## What should I do after submitting a task?

### Step 1: Save the task ID and request details

Save the returned `task_id` immediately after the creation request succeeds.

You should also record:

* The model name;
* The prompt or a prompt summary;
* Important parameters such as duration, resolution, and aspect ratio;
* The submission time;
* The request ID;
* The business ID in your own system.

These details help you query the task, troubleshoot problems, and reconcile billing records later.

### Step 2: Query the original task

Seedance 2.0 tasks usually take minutes. The current API documentation recommends:

* Waiting about 20–30 seconds after submission before the first query;
* Querying every 10–20 seconds afterward;
* Not resubmitting immediately just because the video is not available yet.

Example task query:

```bash theme={null}
curl "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks/YOUR_TASK_ID" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Replace the placeholders with real values:

* `YOUR_TASK_ID`: The task ID returned by the task-creation endpoint;
* `YOUR_API_KEY`: An API key created in the APIYI console.

### Step 3: Handle each task status

Handle the returned status as follows:

* `queued`: The task is still waiting; continue waiting and querying.
* `running`: The task is still generating; continue waiting and querying.
* `succeeded`: Download the video from `content.video_url` immediately.
* `failed`: Inspect the `error` information in the response.
* `expired`: Review the task details and call logs to determine why it expired.

Do not treat `queued` or `running` as failures, and do not create another task just because the current task has not finished.

### Step 4: Confirm the task status after a client timeout

Do not retry immediately if the client did not receive a complete response.

Check the following in order:

1. Check whether the client response already contains a `task_id`.
2. Check whether the console call logs contain a task record.
3. If a `task_id` exists, query the original task first.
4. If no `task_id` is visible yet, do not conclude from the network error alone that no task was created.
5. If you cannot confirm whether the task was created, ask support to verify it before retrying.

A client timeout only means that the client did not receive a response within the expected time. It does not, by itself, prove that the server did not create a task.

## How can I prevent duplicate submissions?

The following are integration-side engineering practices, not mandatory platform rules:

* Generate a unique business ID for each request.
* Store the mapping between the business ID and the Seedance `task_id`.
* Temporarily disable the submit button after the user submits a request.
* After a client timeout or process exit, resume by querying the original task.
* Store the prompt, model, duration, aspect ratio, and reference-material details.
* Consider a new submission only after confirming that the original task does not exist or has clearly failed.
* Distinguish in-progress statuses from terminal statuses. Do not treat `queued` or `running` as failures.

For agents, scripts, and background services, keep task creation and task querying as separate operations:

```text theme={null}
Create task: execute once
Save task_id: write it to a database or task record
Query task: poll by task_id
Recover process: read the saved task_id and continue querying
```

This allows a process to resume querying the original task after a local restart instead of creating another task.

## How should I reconcile billing after duplicate submissions?

The current Seedance 2.0 documentation describes the billing flow as:

```text theme={null}
Pre-charge when the task is submitted → refund the difference or settle the final amount after completion
```

Balance changes and log entries may therefore not appear as a single operation. The overview documentation also states that one video task may correspond to multiple log entries for the pre-charge and later settlement. Use the call logs as the final reference.

The current documentation also states that a request rejected because of invalid parameters, without successfully creating a task—for example, an `InvalidParameter` HTTP 400 request—is not charged.

However, the following cannot be used alone to determine whether a charge was made:

* A client timeout;
* A network disconnection;
* `failed`;
* `expired`;
* The client not receiving a complete response;
* The client showing a request failure even though the server may have created a task.

If multiple tasks have already been created, stop submitting new tasks and collect:

* All related Seedance `task_id` values;
* The corresponding request IDs;
* Submission times;
* Model names;
* Important request parameters;
* Console call logs;
* Screenshots of billing or charge records.

Then contact support for a manual review. Whether a task was charged, whether duplicate charges occurred, and whether any billing action is available must be determined from the task records, call logs, billing records, and the platform's review result.

<Note>
  Do not conclude that a task was definitely charged or definitely not charged based only on `failed`, `expired`, or a client timeout.
</Note>

## Frequently asked questions

### Does stopping polling automatically stop the Seedance task?

That cannot be assumed.

Stopping polling only means that the client no longer queries the task status. The current public API documentation does not provide a cancellation endpoint, so stopping polling does not mean that the server-side task was canceled.

Save the original `task_id` and query it again later.

### Can I retry immediately after a request timeout?

We do not recommend an immediate retry.

First check:

* Whether the response contains a `task_id`;
* Whether the console call logs contain a task record;
* The current status of the original task;
* Whether a corresponding billing record already exists.

If the original task was created, query it before creating another task for the same business request.

### Does failed or expired always mean that no charge was made?

You cannot determine the billing result from the task status alone.

Seedance 2.0 uses pre-charging at submission followed by settlement after completion. Check both the call logs and billing records. If the records look incorrect, provide the task ID and request ID to support for review.

### Is an HTTP 400 caused by invalid parameters charged?

The current documentation states that a request rejected because of invalid parameters, without creating a task, is not charged.

Examples include:

* Invalid parameter formats;
* An unsupported resolution;
* An invalid aspect ratio;
* An unsupported video duration;
* An incompatible model and parameter combination.

Do not classify every HTTP 400 response as the same case. Use the specific error message, task record, and call logs as the final reference.

### How long can I keep the generated video URL?

The current documentation states that the successful response's `content.video_url` is a temporary signed URL valid for about 24 hours.

Download and store the video as soon as the task reaches `succeeded`. Do not treat the URL as permanent.

The current documentation also states that the task ID itself is retained for 7 days. You should still store your own task record for business tracking.

## Related documentation

* [Seedance 2.0 Video Generation API](/en/api-capabilities/seedance2/video-generation)
* [Seedance 2.0 Video Generation Overview](/en/api-capabilities/seedance2/overview)
* [How should I troubleshoot model errors?](/en/faq/model-error-troubleshooting)
* [How to look up a Seedance video's real cost by task\_id](/en/faq/seedance-task-cost-lookup)

## Contact support

Contact support for help if:

* A task remains in `queued` or `running` for an unusually long time;
* You cannot confirm whether a task was created after a client timeout;
* Multiple tasks were created after a duplicate submission;
* The task status and billing record do not match;
* A successful task does not return or allow the video to be downloaded.

When contacting support, provide as much of the following as possible:

* The Seedance `task_id`;
* The request ID;
* The submission time;
* The model name;
* Important request parameters;
* Console call logs;
* Related billing records.

Support entry point: [APIYI support on WeCom](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)
