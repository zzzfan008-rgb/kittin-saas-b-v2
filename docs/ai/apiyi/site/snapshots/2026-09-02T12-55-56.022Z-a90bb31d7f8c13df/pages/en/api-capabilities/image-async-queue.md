> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Image API Integration Practice: Build Your Own Async Queue

> APIYI image APIs are synchronous. This guide shares how to build an async task queue on top: task-level management, retry decoupling, result persistence, and multi-provider integration.

<Info>
  This page is a **technical sharing / advisory piece** for development teams integrating image generation into their own products. We only share engineering practices — nothing here requires any change on the APIYI side. You can implement all of it on top of the existing synchronous APIs.
</Info>

## Synchronous or Async? Understand APIYI's API Model First

APIYI image generation APIs are **all synchronous**: endpoints like `/v1/images/generations` run a request "to completion once submitted." Even if the client disconnects midway, the server still finishes the generation — i.e. it is **not** an async task API where you "get a task\_id first, then poll for the result."

<Info>
  At the gateway layer APIYI already wraps upstream async polling (some providers natively use a `polling_url` loop) into a **synchronous OpenAI Images API**. For you it is always "submit once, get the result once" — **no need to write a polling loop yourself**.
</Info>

Many teams immediately ask: "Then how do I do async task management?" These are actually two different things:

* **Synchronous** — the shape of the APIYI API (HTTP-request level: one request, one result).
* **Async queue** — **an engineering practice on your side** (business-task level: return immediately, run in the background).

The two do not conflict. What follows is how to wrap an async queue around the synchronous API yourself.

## Why Dev Teams Still Need "Task-Level" Management

Calling the image API synchronously inside the user's request thread is fine for a demo. But once you build a real product for end users, you almost certainly need to decouple the "business task" from the "single HTTP call." Four reasons:

<CardGroup cols={2}>
  <Card title="Success ≠ One Call" icon="repeat">
    A "successful task" is often stitched together from **multiple synchronous calls**: an initial timeout or an occasional 429/503 needs a retry. Once task and call are decoupled, retries, backoff, and timeouts are all transparent to the end user — they only see "this image eventually succeeded."
  </Card>

  <Card title="Transparent Forwarding, No Storage" icon="database">
    APIYI only does **transparent forwarding and does not store user inputs or outputs** (prompts, reference images, and generated results are not retained). To give users history, status lookup, and result persistence you **must persist them yourself** — an unavoidable step on the product side.
  </Card>

  <Card title="Friendlier UX for End Users" icon="face-slightly-smiling">
    The user gets a `task_id` on submission and the frontend **polls task status** instead of holding a long connection. Refreshing the page or a brief network drop won't lose the task; batch generation can queue up and fill in one by one.
  </Card>

  <Card title="Multi-Provider Becomes Possible" icon="layers">
    Once you have your own task abstraction, the Worker layer can switch / fail over / price-compare across **multiple providers** on demand — at the very least, it makes "not putting all eggs in one basket" possible.
  </Card>
</CardGroup>

## Reference Architecture: Wrap the Synchronous Call in an Async Queue

The core idea is one sentence: **the API layer only "receives the task, enqueues it, and returns a task\_id"; the actual synchronous call goes to a background Worker.**

```text theme={null}
  Client/Frontend ──①submit──▶  API layer  ──②enqueue──▶  Queue (Redis / MQ / DB table)
        ▲                          │                                  │
        │ ⑤poll task status         │ return task_id now                │ ③pull task
        │                          ▼                                  ▼
        └────────────────────  Database  ◀──④persist(status/input/url)── Worker
                                                                        │ sync call APIYI
                                                                        │ (with retry/backoff)
                                                                        ▼
                                                            api.apiyi.com (sync image API)
```

<Steps>
  <Step title="Return Immediately">
    The frontend sends the generation request to your own API layer; the API layer creates a task record (status `pending`), pushes it to the queue, and **returns the `task_id` to the frontend right away**. The user is never blocked — it returns in milliseconds.
  </Step>

  <Step title="Enqueue">
    The queue can be lightweight: a Redis List / Stream, RabbitMQ / Kafka, or even a database table with a `status` column scanned on a schedule. The choice depends on your scale — no need to reach for heavy middleware on day one.
  </Step>

  <Step title="Worker: Sync Call + Retry">
    A background Worker pulls the task, sets status to `running`, and **synchronously calls** the APIYI image API. On retryable errors it retries with exponential backoff (see "Retry & Billing" below), all transparent to the user.
  </Step>

  <Step title="Persist">
    Whether it succeeds or fails, write the result back to the database: on success store the output image URL, latency, and billing metadata, set status to `succeeded`; on failure store the error and set status to `failed`. **This is exactly the part APIYI does not do for you and you must do yourself.**
  </Step>

  <Step title="Frontend Polling">
    The frontend periodically checks task status with the `task_id` (or you push via WebSocket / SSE). When the task completes, show the result; on failure, show a friendly message. The user's browser never has to hold a long connection.
  </Step>
</Steps>

## Task State Machine & Data Model

Use a clear state machine to describe each task's lifecycle:

| State       | Meaning                                   | Typical transition                    |
| ----------- | ----------------------------------------- | ------------------------------------- |
| `pending`   | Enqueued, awaiting a Worker               | → `running`                           |
| `running`   | Worker is synchronously calling APIYI     | → `succeeded` / `retrying` / `failed` |
| `retrying`  | Hit a retryable error, waiting on backoff | → `running`                           |
| `succeeded` | Generated successfully, result persisted  | terminal                              |
| `failed`    | Retries exhausted or non-retryable error  | terminal                              |

The task table should record at least the following fields (types depend on your stack):

| Field                       | Description                                                      |
| --------------------------- | ---------------------------------------------------------------- |
| `task_id`                   | Unique task identifier, returned to the frontend on submit       |
| `status`                    | The status enum above                                            |
| `provider` / `model`        | Provider and model used (reserved for multi-provider)            |
| `input`                     | User input (prompt, reference-image refs, size and other params) |
| `output_url`                | Result URL (preferably after re-hosting to your own storage)     |
| `retry_count`               | Number of retries so far, for rate-limiting and debugging        |
| `error`                     | Failure reason (error code + friendly message)                   |
| `created_at` / `updated_at` | Creation and last-update time (include a timezone, e.g. UTC+8)   |
| `latency` / `cost`          | Latency and billing metadata, for cost accounting and monitoring |

<Tip>
  Re-host the generated result to **your own object storage** (OSS / S3, etc.) and persist that URL — do not depend long-term on a third-party temporary link. Temporary links may expire; keeping your own copy is more stable for end users.
</Tip>

## Retry & Billing: What to Retry and What Not To

The biggest value of "task-level management" is getting retries right. Billing and retry strategy differ by error type:

| Scenario                                          | Billed?          | Retry?                                                                   |
| ------------------------------------------------- | ---------------- | ------------------------------------------------------------------------ |
| `429` / `503` (rate limit / upstream busy)        | Not billed       | ✅ Retry, exponential backoff, \~2 times                                  |
| Client timeout / proactive disconnect             | **Still billed** | ⚠️ Retryable, but first set a sensible timeout by resolution (\~60–600s) |
| Content-safety refusal (status 200, still billed) | **Still billed** | ❌ Do not retry; return a friendly message to the user                    |

<Warning>
  Account for "**business-task retry count**" and "**whether it was billed**" separately. `429/503` retries are not billed, so back off freely; but timeout disconnects and content-safety refusals are billed even when they "fail" — blindly retrying **amplifies cost**. Check the error type before deciding whether to spend again.
</Warning>

For the full criteria on error judgment and friendly messaging, see:

<CardGroup cols={2}>
  <Card title="Gemini Image Error Handling" icon="triangle-alert" href="/en/api-capabilities/gemini-image-error-handling">
    Failure-detection signals, content-moderation policy, and friendly-message strategy.
  </Card>

  <Card title="Generation Failure Guarantee" icon="shield-check" href="/en/api-capabilities/nano-banana-pro-guarantee">
    For failures not caused by you, credits are reimbursed by count.
  </Card>
</CardGroup>

## Advanced: One Queue, Multiple Providers

With a task abstraction, the Worker call can move from "hard-coded to one endpoint" to "routed by `provider`." Unify a single `submit(provider, payload)` entry, and let the Worker decide the actual upstream based on the task's `provider` field:

* **Failover**: when provider A keeps failing, switch to B automatically, invisibly to the user.
* **Price comparison / routing**: dispatch different tasks to different providers or models by cost or scenario.
* **Canary**: send a small slice of traffic to a new model to validate, then ramp up gradually.

<Info>
  In most cases you actually **don't** need a self-built multi-provider layer: APIYI itself aggregates gpt-image-2, Nano Banana, FLUX, Seedream and more, so a single APIYI key covers most needs under one API style. A self-built provider abstraction is the "just in case" option — add it only when you genuinely need cross-provider failover or price comparison.
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="Why not just give me an async task API instead of a synchronous one?">
    Image generation is inherently "submit once, get one image" — a strong synchronous semantic, and wrapping it as a synchronous API is simplest for the vast majority of callers (no polling to maintain, no task expiry to handle). Whether you need an async queue, a state machine, and persistence depends on your **product shape** (whether it's end-user-facing, whether you need history), so that part is left for you to build as needed for maximum flexibility.
  </Accordion>

  <Accordion title="If the client times out and disconnects, is the task still running? Is it billed?">
    It keeps running. Once a synchronous endpoint receives a request it runs to completion; a client disconnect does **not** abort the server-side generation, and that generation is **billed normally**. So set a sufficient timeout by resolution (\~60–600s) — don't set it too short and end up "paying without getting the image."
  </Accordion>

  <Accordion title="Does APIYI store my image generation history?">
    No. APIYI only does **transparent forwarding and does not store user inputs or outputs**. To provide users with history, status lookup, and result persistence, you need to persist on your side — which is exactly why this guide recommends "task-level management."
  </Accordion>

  <Accordion title="I already use a single APIYI key — do I still need a multi-provider layer?">
    Usually not. APIYI already aggregates multiple model families under one API style, and a single key is typically enough. Only when you have clear needs for cross-provider failover, price comparison, or compliance routing should you consider adding a provider abstraction in the Worker layer — it's optional, not required.
  </Accordion>
</AccordionGroup>

## Related Docs

<CardGroup cols={2}>
  <Card title="Image API Essentials & Best Practices" icon="book-check" href="/en/api-capabilities/image-api-best-practices">
    Per-model timeout table, base64 handling, and URL output reference.
  </Card>

  <Card title="Why There Is No Async API" icon="circle-question-mark" href="/en/faq/image-async-api">
    FAQ: Is there an async image API? Can I query results by task ID?
  </Card>

  <Card title="FLUX Overview" icon="sparkles" href="/en/api-capabilities/flux/overview">
    An example of upstream async polling wrapped into a synchronous OpenAI Images API.
  </Card>

  <Card title="Nano Banana Dev Guide" icon="compass" href="/en/api-capabilities/nano-banana-dev-guide">
    Synchronous multi-threaded calls, timeout settings, and billing basics in one place.
  </Card>

  <Card title="Gemini Image Error Handling" icon="triangle-alert" href="/en/api-capabilities/gemini-image-error-handling">
    Failure-detection signals and friendly-message strategy.
  </Card>

  <Card title="Generation Failure Guarantee" icon="shield-check" href="/en/api-capabilities/nano-banana-pro-guarantee">
    Credit-reimbursement rules for failures not caused by you.
  </Card>
</CardGroup>
