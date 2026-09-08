> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# How do I avoid API timeouts?

> Client timeout settings, how slow reasoning models really are, picking the right Base URL node, and 429 concurrency checks — the four keys to avoiding timeouts

## Short Answer

<Info>
  **Three golden rules that cover 90% of timeout problems:**

  1. **Set a 360-second timeout for synchronous image endpoints.** Image generation has no async task ID — disconnecting early means you are still billed but get no image.
  2. **Give reasoning models enough time.** `gemini-3.1-pro-preview`, `gpt-5.6-sol`, and `gpt-5.5-pro` can take several minutes, whether you stream or not.
  3. **Never run long requests through the CDN node.** `api-cf.apiyi.com` sits behind Cloudflare and returns `524` past roughly 100 seconds; it only suits fast text calls.

  Separately: if a specific model keeps returning `429` (insufficient concurrency), contact support to review your quota.
</Info>

## Timeout cheat sheet

| Scenario                                | Recommended timeout | Recommended node                  | Notes                         |
| --------------------------------------- | ------------------- | --------------------------------- | ----------------------------- |
| Regular text chat (non-reasoning)       | 60-120s             | Any node                          | Usually returns in seconds    |
| Reasoning models (thinking / reasoning) | **300-600s**        | `api.apiyi.com` / `vip.apiyi.com` | Slow whether streaming or not |
| Long text output (10k+ words)           | **300s or more**    | `api.apiyi.com` / `vip.apiyi.com` | ❌ Not the CDN node            |
| Image generation / editing              | **360s baseline**   | `api.apiyi.com` / `vip.apiyi.com` | ❌ Not the CDN node            |
| 4K images, multi-image reference        | **600s**            | Same as above                     | See image best practices      |

<Warning>
  **A timed-out request is still billed**

  After your client disconnects, the server and upstream provider **still finish the job**, and the request **is billed as usual**.

  In other words: **a timeout set too low means you paid and got nothing**. Set it to a safe upper bound once rather than letting a nearly-successful request get cut off by your own client.
</Warning>

## The four keys in detail

<AccordionGroup>
  <Accordion title="① Synchronous image endpoints: set the timeout to 360 seconds">
    All APIYI image models are **synchronous**: you send the request, hold the connection, and the result comes back in the response body. There is no async task ID and no polling endpoint — disconnect and the result is gone.

    **Why defaults hurt you**: mainstream HTTP clients default to 30-60 seconds, while image generation is a genuinely long request:

    * GPT-Image-2 at `high` quality with 2K/4K takes 3-5 minutes in practice
    * Nano Banana 4K generation starts around 50 seconds and runs longer at peak
    * Multi-image reference tasks often exceed 5 minutes

    **Recommendation**: when unsure about a model's latency, use **360 seconds** as a baseline; give heavy tasks like 4K and multi-image reference **600 seconds**. Per-model values are in [Image API best practices](/en/api-capabilities/image-api-best-practices).

    <Tip>
      Occasionally a log shows the image finished in 30 seconds while the client waited 5 minutes — because the log's duration only runs to the point where the gateway finishes processing, while you wait for the body to finish arriving and for the connection's finish signal. **Raising the timeout does not always help**: it does for the slow-download class, but not when the data is already complete and only the finish signal is missing. Measure once following [The log says it finished but my client got nothing](/en/faq/log-duration-vs-client-wait), then decide.
    </Tip>
  </Accordion>

  <Accordion title="② Reasoning models: slow with and without streaming">
    Regular text models return in seconds, which makes it easy to assume text calls never need timeout tuning. **Reasoning models are the exception:**

    * `gemini-3.1-pro-preview`
    * `gpt-5.6-sol`
    * `gpt-5.5-pro` (pricier and slower)
    * Any model running at a high thinking budget (high reasoning effort)

    These models think internally for a long time before producing an answer, and **several minutes of total latency is normal**.

    **Key point: streaming does not solve this.** Many people assume `stream=True` means data arrives immediately, but a reasoning model can emit no tokens at all during the thinking phase, so your read timeout still fires — and the **total** time from first token to last is still long.

    **Recommendation**: set the timeout to **300-600 seconds** for reasoning models, and match your thinking tier (`reasoning_effort` / `thinking`) to the time you have allowed — a higher tier needs more headroom.
  </Accordion>

  <Accordion title="③ Base URL selection: the CDN node cannot carry long requests">
    APIYI's `api-cf.apiyi.com` is fronted by the **Cloudflare global CDN**. It offers worldwide acceleration and low latency from overseas, but it has a **request timeout of roughly 100 seconds**, past which you get a `524` error.

    ⚠️ **This affects more than image endpoints.** Any call that might exceed 100 seconds is a poor fit, including:

    * ❌ Image generation / editing
    * ❌ Video generation
    * ❌ Long text output (long articles, large translations, big code generations)
    * ❌ Deep-thinking tasks on reasoning models

    ✅ **Good fit**: regular chat and short generations that finish within 100 seconds.

    **Recommendation**: for long requests use `api.apiyi.com` (recommended in mainland China) or `vip.apiyi.com` (recommended overseas). Full node comparison in the [Base URL guide](/en/faq/base-url-config).
  </Accordion>

  <Accordion title="④ Hitting 429 concurrency limits: contact support">
    If timeouts come alongside frequent `429 Too Many Requests`, the problem is usually **concurrency quota**, not your timeout.

    Concurrency limits apply **per model**, not across your whole account. A specific model — especially a newly launched or supply-constrained one — may have a lower quota.

    **What to do:**

    1. Implement exponential backoff so you do not saturate the limit in bursts
    2. If 429s persist, **contact APIYI support** — we can check that model's actual quota and help adjust it

    See [How much concurrency can I use?](/en/faq/api-concurrency) for the rules.
  </Accordion>
</AccordionGroup>

## Code examples

<Tabs>
  <Tab title="Python">
    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(
        api_key="YOUR_API_KEY",
        base_url="https://api.apiyi.com/v1",  # not the api-cf node for long requests
    )

    # Tier your timeouts by scenario (seconds) instead of one global value
    TIMEOUTS = {
        "text":      120,   # regular text
        "reasoning": 600,   # reasoning models
        "image":     360,   # image generation baseline
        "image_4k":  600,   # 4K / multi-image reference
    }

    resp = client.chat.completions.create(
        model="gpt-5.6-sol",
        messages=[{"role": "user", "content": "Analyze the complexity of this code"}],
        timeout=TIMEOUTS["reasoning"],   # 600s for reasoning models
    )
    print(resp.choices[0].message.content)
    ```
  </Tab>

  <Tab title="Node.js">
    ```javascript theme={null}
    import OpenAI from "openai";

    const client = new OpenAI({
      apiKey: process.env.APIYI_API_KEY,
      baseURL: "https://api.apiyi.com/v1",
      timeout: 600 * 1000,   // milliseconds — 600s for reasoning models
      maxRetries: 0,         // avoid auto-retry on long requests: it double-bills
    });

    const resp = await client.chat.completions.create({
      model: "gemini-3.1-pro-preview",
      messages: [{ role: "user", content: "Write an 8000-word technical analysis" }],
    });
    console.log(resp.choices[0].message.content);
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={null}
    # --max-time caps the total request duration in seconds
    curl https://api.apiyi.com/v1/images/generations \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      --max-time 360 \
      -d '{
        "model": "gpt-image-2",
        "prompt": "a serene mountain lake at sunrise",
        "size": "2048x2048"
      }'
    ```
  </Tab>
</Tabs>

<Warning>
  **Be careful with auto-retry on long requests**: many SDKs retry twice by default. If an image or reasoning task times out and retries, you can end up billed three times with nothing to show. Set `max_retries` to 0 and control retries in your own application logic.
</Warning>

## Still timing out after raising the timeout? Check every hop

<Steps>
  <Step title="Step 1: Confirm the SDK timeout actually applies">
    Some frameworks wrap another timeout around the HTTP client. Print the effective configuration and confirm the parameter you changed is the one being used.
  </Step>

  <Step title="Step 2: Check every hop in the path">
    Any layer with a timeout shorter than the generation time will disconnect before your client does:

    * Self-hosted reverse proxy: Nginx `proxy_read_timeout` (60s by default)
    * Cloud load balancer: idle connection timeout
    * API gateway / CDN: origin timeout
    * Serverless functions: execution limit (often 30-60s by default)
    * Task queue workers: per-task timeout

    **Every hop must be widened** — changing only the client does nothing.
  </Step>

  <Step title="Step 3: Confirm you are not on the CDN node">
    Check whether your Base URL is `api-cf.apiyi.com`. For long requests, switch to `api.apiyi.com` or `vip.apiyi.com`.

    Rule of thumb: a **`524`** almost always means a Cloudflare-layer timeout, not a slow model.
  </Step>

  <Step title="Step 4: Distinguish timeouts from concurrency limits">
    Read the status code: `524` and dropped connections are timeout problems; `429` is a quota problem. The fixes are entirely different.
  </Step>

  <Step title="Step 5: Check call logs for actual latency">
    Look up the request's real duration and billing in the console [call logs](/en/faq/call-logs), then derive a sensible timeout from it.
  </Step>
</Steps>

## Common questions

<AccordionGroup>
  <Accordion title="Can I get a refund for a request that timed out?">
    No. Once your client disconnects, the server and upstream still complete the job, so the cost is genuinely incurred.

    The right approach is to **set the timeout to a safe upper bound in one go**, rather than using a small value and relying on retries — retries only multiply the bill.
  </Accordion>

  <Accordion title="Can you offer an async endpoint so I can fetch results by ID after a disconnect?">
    Image endpoints currently run in **synchronous pass-through mode**, and we do not store customer business data, so "retrieve by ID after disconnect" is not available.

    Recommended pattern: synchronous call + generous timeout + your own task-state table. That is effectively a lightweight async queue. See [Are image endpoints synchronous or asynchronous?](/en/faq/image-async-api)

    Video models are natively async and are not affected by this.
  </Accordion>

  <Accordion title="Does streaming prevent timeouts?">
    **Partly — but do not rely on it.**

    Streaming does deliver the first token sooner, which reduces the risk of a total no-response. But a reasoning model may emit nothing during the thinking phase, so the read timeout still fires, and the full output takes just as long overall.

    The correct approach is streaming **plus** a generous timeout.
  </Accordion>

  <Accordion title="Is there a downside to setting a very large timeout?">
    No billing impact — **you are charged for tokens and calls consumed, not for how long you waited**.

    The only concern is resource usage on your side: a long connection holds a worker or connection-pool slot. Under high concurrency, run image and reasoning requests through async IO or a dedicated long-task queue.
  </Accordion>

  <Accordion title="What is the difference between 524 and 429?">
    * **`524`**: a Cloudflare-layer timeout, meaning you used `api-cf.apiyi.com` and the request exceeded roughly 100 seconds. Switch nodes.
    * **`429`**: a concurrency or rate limit, unrelated to duration. Add exponential backoff, and contact support if it persists.
  </Accordion>
</AccordionGroup>

## Related Documentation

<CardGroup cols={2}>
  <Card title="Image API best practices" icon="image" href="/en/api-capabilities/image-api-best-practices">
    Per-model timeout table and output format reference
  </Card>

  <Card title="How do I set the Base URL?" icon="link" href="/en/faq/base-url-config">
    Differences between the four nodes and how to choose
  </Card>

  <Card title="Are image endpoints sync or async?" icon="refresh-cw" href="/en/faq/image-async-api">
    Synchronous mode and client-side task management
  </Card>

  <Card title="How much concurrency can I use?" icon="gauge" href="/en/faq/api-concurrency">
    Concurrency limits by model type and quota requests
  </Card>
</CardGroup>

## Contact Us

<CardGroup cols={2}>
  <Card title="WeCom Support" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeCom support QR code" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    Scan the QR code or [click to contact support](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    Timeout troubleshooting and concurrency quota requests
  </Card>

  <Card title="Email" icon="mail">
    **Support**: [support@apiyi.com](mailto:support@apiyi.com)

    **Business**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
