> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Website or API Returns 502 — What Should I Do?

> A 502 is a brief symptom of a service container auto-restarting, usually resolved within 1 minute — failed calls are never billed, and a 30-second client retry rides it out seamlessly

## Quick Answer

<Info>
  **A 502 is transient — no configuration changes are needed on your side:**

  1. **The root cause is an automatic service container restart** — during the restart window the web console is unreachable and the API returns 502; they are the same event.
  2. **Recovery is usually automatic within 1 minute** — wait 30-60 seconds and resend your request.
  3. **Failed calls are never billed** — during a 502 the request never actually reaches the service, so no billing record is created.
  4. **Add automatic retries on the client side** — a single retry after about 30 seconds rides out the entire restart window seamlessly.
</Info>

## What Is Happening

`502 Bad Gateway` means: **the gateway layer received your request but got no response when forwarding it to the backend service**.

On APIYI, the vast majority of transient 502s are caused by **an automatic restart of the backend service container**. While the backend process is briefly unavailable:

* **The web console** (dashboard, top-up pages, etc.) fails to load or shows errors
* **The API** (`api.apiyi.com` and all other endpoints) returns 502

Both are backed by the same service, so they **fail together and recover together**. Once an anomaly is detected, the system completes the restart automatically — the whole process **usually finishes within 1 minute** with no manual intervention.

<Note>
  **This kind of 502 has nothing to do with your code, Key, balance, or network configuration.** If this is your first time seeing it, there is nothing to debug on the client side — wait 30-60 seconds and retry; in the vast majority of cases the service has already recovered.
</Note>

## What You Should Do

<Steps>
  <Step title="Step 1: Wait 30-60 seconds, then resend the request">
    A container restart usually completes within 1 minute. Simply resend your API call — since failed calls are never billed, retrying will not cause duplicate charges.
  </Step>

  <Step title="Step 2: If the web console won't load, force-refresh the page">
    After recovery your browser may still show a cached error page. Use **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac) to force-refresh and see the normal interface.
  </Step>

  <Step title="Step 3: If the 502 persists for more than 5 minutes, contact support">
    A transient restart never lasts more than a few minutes. If the 502 **persists for more than 5 minutes**, it is not a routine auto-restart — please reach out via the contact options at the bottom of this page, including the approximate time it occurred (with timezone, e.g. `14:30 (UTC+8)`).
  </Step>
</Steps>

## Adding Automatic Retries to Programmatic Calls

If your workload is availability-sensitive, add automatic retries for transient errors like 502 on the client side — one retry after about 30 seconds covers the entire restart window.

<Tabs>
  <Tab title="Python">
    ```python theme={null}
    import time
    from openai import OpenAI, InternalServerError

    client = OpenAI(
        api_key="YOUR_API_KEY",
        base_url="https://api.apiyi.com/v1",
        max_retries=0,  # disable SDK default retries; the logic below takes over
    )

    def chat_with_retry(messages, retries=2, wait=30):
        for attempt in range(retries + 1):
            try:
                return client.chat.completions.create(
                    model="gpt-4o",
                    messages=messages,
                )
            except InternalServerError:
                # 502 / 503 and other 5xx: the request never reached the
                # service and is not billed, so retrying is always safe
                if attempt == retries:
                    raise
                time.sleep(wait)  # restarts finish within ~1 min; wait 30s

    resp = chat_with_retry([{"role": "user", "content": "Hello"}])
    print(resp.choices[0].message.content)
    ```
  </Tab>

  <Tab title="Node.js">
    ```javascript theme={null}
    import OpenAI from "openai";

    const client = new OpenAI({
      apiKey: process.env.APIYI_API_KEY,
      baseURL: "https://api.apiyi.com/v1",
      maxRetries: 0, // disable SDK default retries; the logic below takes over
    });

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    async function chatWithRetry(messages, retries = 2, waitMs = 30_000) {
      for (let attempt = 0; ; attempt++) {
        try {
          return await client.chat.completions.create({
            model: "gpt-4o",
            messages,
          });
        } catch (err) {
          // 502 / 503 and other 5xx: the request never reached the
          // service and is not billed, so retrying is always safe
          if (err.status < 500 || attempt >= retries) throw err;
          await sleep(waitMs); // restarts finish within ~1 min; wait 30s
        }
      }
    }

    const resp = await chatWithRetry([{ role: "user", content: "Hello" }]);
    console.log(resp.choices[0].message.content);
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={null}
    # curl's --retry automatically retries transient errors like 502/503/504
    curl https://api.apiyi.com/v1/chat/completions \
      --retry 2 --retry-delay 30 \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "gpt-4o",
        "messages": [{"role": "user", "content": "Hello"}]
      }'
    ```
  </Tab>
</Tabs>

<Warning>
  **Only apply this retry strategy to 502/503-style errors where the request never reached the service.** Requests that were cut off by a client timeout (or a `524`) may still be running on the server side and are billed normally — blindly retrying those causes duplicate charges. For that class of problem, see [How to Avoid API Timeouts](/en/faq/timeout-configuration).
</Warning>

<Tip>
  For high-frequency workloads you can also probe quickly with **exponential backoff** (1 second, then 2, then 4) — network-blip 502s usually clear within seconds. If those attempts still fail, fall back to the 30-second interval to cover the container-restart case.
</Tip>

## Frequently Asked Questions

<AccordionGroup>
  <Accordion title="Are requests made during a 502 billed?">
    **No.** A 502 means the request never actually reached the backend service — no model usage occurred, so **nothing appears in your billing records**.

    This is also a handy diagnostic: if a failed request has no billing entry in your [call logs](/en/faq/call-logs), it was never processed server-side, and you can safely resend it.
  </Accordion>

  <Accordion title="How is a 502 different from a timeout, 429, or 524?">
    * **`502`**: The backend service is briefly unavailable (container restarting). Wait 30-60 seconds and retry; not billed.
    * **Timeout / dropped connection**: Your client timeout is too short — the server may still be running the request and billing it normally. See [How to Avoid API Timeouts](/en/faq/timeout-configuration).
    * **`429`**: Concurrency or rate limit reached; unrelated to service availability. See [API Concurrency Limits](/en/faq/api-concurrency).
    * **`524`**: You are on the CDN endpoint (`api-cf.apiyi.com`) with a request exceeding roughly 100 seconds — switch endpoints.

    These call for completely different responses: **only 502/503 should be retried directly**.
  </Accordion>

  <Accordion title="Why do the web console and the API fail at the same time?">
    The web console and the API are backed by the same service. During a container restart both become **unavailable together and recover together** — so "the website is down too" is exactly what confirms this is a transient platform-side event, not a problem with your client configuration.
  </Accordion>

  <Accordion title="Will this happen often?">
    No — it is not a regular occurrence. Transient 502s are typically tied to sudden traffic spikes and are sporadic.

    **As of August 2026 we are upgrading and scaling up the backend servers**, which will significantly reduce the frequency of these transient 502s. Whenever there is a platform-side incident, we publish status updates and recovery progress on the [live status feed](/en/live) right away.
  </Accordion>

  <Accordion title="How do I tell whether it's a platform issue or my own network?">
    Two quick checks:

    1. **Open the web console**: if `api.apiyi.com` returns 502 and the console also fails to load, it is almost certainly a transient platform-side restart — wait a minute.
    2. **Switch networks**: try mobile data (a different carrier) to load the console, or run the command below. If it works there, the problem is your local network or proxy.

    ```bash theme={null}
    curl -I https://api.apiyi.com/v1/models \
      -H "Authorization: Bearer YOUR_API_KEY"
    ```

    If everything still returns 502 on a different network for more than 5 minutes, contact support.

    Also, if the web console works fine but your script gets intermittent 502s with an empty body, and those requests are missing from your call logs, the 502 most likely comes from local proxy software. See [Script Gets 502 but Nothing in the Call Logs?](/en/faq/proxy-empty-502)
  </Accordion>
</AccordionGroup>

## Related Documentation

<CardGroup cols={2}>
  <Card title="How to Avoid API Timeouts" icon="timer" href="/en/faq/timeout-configuration">
    Timeout settings, reasoning-model latency, and 524 diagnosis
  </Card>

  <Card title="Do I Need a Proxy to Use the API?" icon="wifi" href="/en/faq/network-proxy">
    Direct-connection notes and network requirements
  </Card>

  <Card title="Where Are APIYI's Servers?" icon="server" href="/en/faq/server-location">
    Node locations, latency testing, and purchase advice
  </Card>

  <Card title="Service Availability and SLA" icon="shield-check" href="/en/faq/sla-guarantee">
    Availability commitments and incident response
  </Card>
</CardGroup>

## Contact Us

<CardGroup cols={2}>
  <Card title="WeCom Support" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeCom support QR code" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    Scan the QR code, or click this card to reach support directly

    Persistent 502 reports and incident triage
  </Card>

  <Card title="Email" icon="mail">
    **Support**: [support@apiyi.com](mailto:support@apiyi.com)

    **Business**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
