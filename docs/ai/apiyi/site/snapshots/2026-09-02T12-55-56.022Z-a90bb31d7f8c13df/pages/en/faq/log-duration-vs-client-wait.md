> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# The log says the call finished and was billed, but my client never received a response — how do I troubleshoot?

> The console log's duration only covers up to the moment the gateway finishes processing, while your client waits for the last byte and the connection's finish signal. This page shows how to measure where the gap falls, how to benchmark throughput between two servers, and which fields your instrumentation should record.

## Short answer

<Info>
  **The console log's duration and your client's timeout do not measure the same window.**

  * The log's duration runs up to the point where **the gateway finishes processing**;
  * Your client is not done until the **last byte of the response body has arrived and the connection signals that it is finished**.

  So "the log says it completed in 280 seconds, but my 600-second timeout still didn't get me any data" is entirely possible — **and that request really did succeed and really was billed**. The gap falls in the segments the log never covered.

  This page shows you how to **measure** that gap, pin it to a specific segment, and treat the right cause.
</Info>

This page is about **non-streaming calls with large responses**: image endpoints returning base64 are the classic case (response bodies run from several MB to tens of MB), and non-streaming long-text output behaves the same way. Streaming calls and small responses are generally unaffected.

## What the log's duration actually covers

A call's total latency breaks into five segments:

```
client total = connect + request upload + upstream generation + response download + waiting for finish signal
                                    └─ the console log's duration covers only this ─┘
```

| Segment                       | What is spending the time                                                              | Counted in the console log?        |
| ----------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------- |
| Connect (DNS / TCP / TLS)     | Your network reaching our entry point                                                  | ❌                                  |
| Request upload                | Your **upstream** bandwidth; with reference images the request body is also several MB | ❌                                  |
| Upstream generation           | The model actually generating                                                          | ✅ **this is the duration you see** |
| Response download             | Your **downstream** bandwidth, strongly tied to concurrency                            | ❌                                  |
| Waiting for the finish signal | The terminating chunk of HTTP chunked transfer                                         | ❌                                  |

<Warning>
  **The gap does not appear in any log field.**

  We ran a controlled raw-socket comparison internally: for the same batch of requests our backend recorded a 5-second duration with a success status, while the client actually waited 37–40 seconds for the complete response. Those 31–35 seconds happened **after** the gateway finished processing, and no duration field records them.

  Which means: **quoting the log duration to refute "it took forever on my side" proves nothing** — the two numbers were never in conflict. Locating the problem requires per-segment timing on the client.
</Warning>

Fields available in the console and in the [Log Query API](/en/api-capabilities/log-query): `duration_for_view` (call duration in seconds), `is_stream`, and `request_id` (quote this one when reporting an issue).

## Step 1: pin the gap to a segment with one curl

This is the entry point for everything below. Run it first, then decide which section applies.

```bash theme={null}
curl -sS -o /dev/null --max-time 900 \
  -w 'connect=%{time_connect} pretransfer=%{time_pretransfer} ttfb=%{time_starttransfer} total=%{time_total} bytes=%{size_download} speed=%{speed_download}\n' \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -X POST https://api.apiyi.com/v1/images/generations \
  -d '{"model":"gpt-image-2-vip","prompt":"a watercolor mountain village","size":"2048x2048"}'
```

Three derived metrics turn those raw numbers into meaningful segments:

| Metric                    | Formula                          | Meaning                                     |
| ------------------------- | -------------------------------- | ------------------------------------------- |
| Upload time               | `pretransfer − connect`          | How long sending the request body took      |
| Generation time           | `ttfb − pretransfer`             | **≈ the duration shown in the console log** |
| Download time             | `total − ttfb`                   | How long receiving the response body took   |
| Effective downstream rate | `size_download / (total − ttfb)` | Or just read `speed_download` (bytes/sec)   |

### Reading the result

Match your numbers against this table — it decides what you do next:

| What you observe                                                                      | Where the gap falls                           | Next step                                                                            |
| ------------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------ |
| `ttfb` ≈ log duration, and `total` ≈ `ttfb`                                           | No gap — the model itself is simply slow      | Raise the timeout, see [How do I avoid API timeouts?](/en/faq/timeout-configuration) |
| `total − ttfb` is large, `speed_download` is low                                      | **Downstream bandwidth**                      | This page's throughput and payload-size sections                                     |
| `total − ttfb` is large, but the byte count arrived long ago and nothing new followed | **The finish signal never came**              | [Image request finish stall](/en/api-capabilities/image-tail-stall)                  |
| `pretransfer − connect` is large                                                      | **Upload is slow** — reference images too big | Compress each input image to under 1.5MB                                             |
| `ECONNRESET` / SSL EOF mid-transfer                                                   | **Downstream disconnect**                     | [Image API connection drops](/en/api-capabilities/image-connection-drops)            |
| curl behaves fine, only your application code times out                               | **Client side**                               | This page's "Three easily missed client-side causes"                                 |

<Tip>
  One run is not enough. This class of problem **arrives in time windows** — inside a window every call in a row is affected, outside it dozens of calls in a row are perfectly fine. Run it 10 times, look at the distribution, and note the time of day with its time zone.
</Tip>

## Step 2: measuring "the data arrived but the connection never finished"

If the table points at the third row, you need finer observation: read the response chunk by chunk, recording each chunk's arrival time and the gaps between them. The question to answer is — **once the last byte arrived, how long did the connection keep spinning?**

<Tabs>
  <Tab title="Python">
    ```python theme={null}
    import json, os, time, urllib.request

    body = json.dumps({
        "model": "gpt-image-2-vip",
        "prompt": "a watercolor mountain village",
        "size": "2048x2048",
    }).encode()

    req = urllib.request.Request(
        "https://api.apiyi.com/v1/images/generations",
        data=body,
        headers={
            "Authorization": "Bearer " + os.environ["APIYI_API_KEY"],
            "Content-Type": "application/json",
        },
    )

    t0 = time.monotonic()
    resp = urllib.request.urlopen(req, timeout=900)
    ttfb = time.monotonic() - t0            # headers arrived ≈ generation finished

    chunks, total, last = [], 0, time.monotonic()
    while True:
        buf = resp.read(65536)
        now = time.monotonic()
        if not buf:
            break
        total += len(buf)
        chunks.append((round(now - t0, 3), round(now - last, 3), total))
        last = now
    t_end = time.monotonic() - t0

    transfer = t_end - ttfb
    max_gap = max((gap for _, gap, _ in chunks), default=0)
    p99_at = next((t for t, _, cum in chunks if cum >= total * 0.99), ttfb)

    print(json.dumps({
        "ttfb_s": round(ttfb, 2),                 # ≈ the console log duration
        "transfer_s": round(transfer, 2),         # download
        "total_s": round(t_end, 2),               # what you actually experienced
        "body_bytes": total,
        "down_KBps": round(total / 1024 / transfer, 1) if transfer > 0.001 else None,
        "max_gap_s": max_gap,                     # largest silence between chunks
        "tail_99_s": round(t_end - p99_at, 2),    # how long the last 1% took
    }))
    ```
  </Tab>

  <Tab title="Node.js">
    ```javascript theme={null}
    const t0 = Date.now();
    const resp = await fetch("https://api.apiyi.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.APIYI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-2-vip",
        prompt: "a watercolor mountain village",
        size: "2048x2048",
      }),
    });
    const ttfb = (Date.now() - t0) / 1000;

    const reader = resp.body.getReader();
    const curve = [];
    let total = 0, maxGap = 0, last = Date.now();
    while (true) {
      const { done, value } = await reader.read();
      const now = Date.now();
      if (done) break;
      total += value.length;
      maxGap = Math.max(maxGap, (now - last) / 1000);
      curve.push([(now - t0) / 1000, total]);
      last = now;
    }
    const totalS = (Date.now() - t0) / 1000;
    const p99At = (curve.find(([, cum]) => cum >= total * 0.99) || [ttfb])[0];

    console.log({
      ttfb_s: ttfb,
      transfer_s: totalS - ttfb,
      total_s: totalS,
      body_bytes: total,
      down_KBps: total / 1024 / (totalS - ttfb),
      max_gap_s: maxGap,
      tail_99_s: totalS - p99At,
    });
    ```
  </Tab>
</Tabs>

**Detection threshold**: a `tail_99` above 30 seconds, or a `max_gap` above 30 seconds, counts as one "tail stall". The signature is a `max_gap` occurring at the point where the byte count already reached 100% — every byte arrived, and only then did the waiting begin.

<Warning>
  **Do not cover three phases with one timeout value.**

  This is the easiest trap: using a single timeout for "waiting for the first byte" and "waiting for transfer" collapses two problems with completely different root causes into one indistinguishable failure.

  | Phase                                                | Meaning                                                | Suggested value |
  | ---------------------------------------------------- | ------------------------------------------------------ | --------------- |
  | Waiting for the first byte                           | Upstream is generating — **slow does not mean broken** | 120–180 s       |
  | Silence between chunks                               | Transfer started, then stopped moving                  | 20–30 s         |
  | Waiting for the finish signal after data is complete | A grace period; finish proactively past it             | 3–5 s           |

  Split them and your logs will tell you directly whether it was "slow generation" or "delivered but never finished" — no guessing.
</Warning>

## Step 3: benchmarking throughput between two servers

### Between two machines you own

Use `iperf3` to measure real throughput — this is the most accurate option:

```bash theme={null}
# Server side (the machine being measured)
iperf3 -s

# Client side: forward direction, 30 seconds, 4 parallel streams
iperf3 -c <server-ip> -t 30 -P 4

# Add -R for the reverse direction — check both; image bottlenecks are downstream
iperf3 -c <server-ip> -t 30 -P 4 -R
```

### From your server to our API

**`iperf3` cannot be used for this leg** — we do not run an iperf server. Measure the effective rate from real calls instead:

```bash theme={null}
# 10 runs; take the median speed_download as your effective downstream bandwidth (bytes/sec)
for i in $(seq 1 10); do
  curl -sS -o /dev/null --max-time 900 \
    -w '%{time_starttransfer} %{time_total} %{size_download} %{speed_download}\n' \
    -H "Authorization: Bearer $APIYI_API_KEY" -H "Content-Type: application/json" \
    -X POST https://api.apiyi.com/v1/images/generations \
    -d '{"model":"gpt-image-2-vip","prompt":"test","size":"1024x1024"}'
done
```

Pair it with link-quality checks:

```bash theme={null}
mtr -rwzbc 100 api.apiyi.com        # per-hop packet loss and latency
ss -tin state established           # TCP retransmits, RTT, congestion window
```

<Warning>
  **If the reading table points at "the finish signal never came", `mtr` and `ping` are useless here.** In that case not a single byte was lost and link quality is fine, so these tools will show nothing wrong — and you will have chased the wrong lead. Confirm which class you are in with the script above before investigating the network.
</Warning>

### Check whether your bandwidth is enough

An image response body is one solid block of base64. Measured magnitudes:

| Case                               | Response body |
| ---------------------------------- | ------------- |
| `gpt-image-2` family, default size | about 2.6 MB  |
| Gemini family, 2K                  | about 13 MB   |
| Gemini family, 4K                  | about 35 MB   |

Base64 encoding itself inflates the payload by roughly 33%. Download time with the link to yourself:

| Egress bandwidth | 2.6 MB | 13 MB  | 35 MB |
| ---------------- | ------ | ------ | ----- |
| 100 Mbps         | 0.2 s  | 1.0 s  | 2.8 s |
| 10 Mbps          | 2.1 s  | 10.4 s | 28 s  |
| 2 Mbps           | 10.4 s | 52 s   | 140 s |

**The catch is that this table assumes you have the link to yourself.** In practice:

```
bandwidth per request = egress bandwidth ÷ requests in flight
```

For example: a 10 Mbps egress, 30 concurrent image requests, 2.6 MB per response — each request gets roughly 0.04 MB/s, so **the download alone takes 62 seconds**, and not one of those seconds appears in the console log. Double the concurrency and that number doubles too.

<Tip>
  This is why "it times out during the busy daytime but the same code is fine at night". The model did not get slower; your bandwidth is being divided among more requests.
</Tip>

## Step 4: which fields your instrumentation should record

To describe the symptom precisely — whether for your own analysis or to send to us — record at least these per call:

| Field                                 | How to get it                                                                         | Why it matters                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Request ID                            | Response header; the name varies by model (`request-id` or `x-request-id`), read both | This is what we look up in the backend log                                                |
| Start time                            | Client local time, **with the time zone**                                             | To align with backend logs and incident windows                                           |
| Time to first byte                    | `ttfb`                                                                                | To compare against the backend duration                                                   |
| Last-byte time                        | When the final chunk arrived                                                          | Its distance from the total is the idle wait for the finish signal                        |
| Total time                            | Until you held the complete response                                                  | What you actually experienced                                                             |
| Response body bytes                   | Sum of what you read                                                                  | To compute the rate and confirm completeness                                              |
| Downstream rate                       | Bytes ÷ download time                                                                 | A low rate means bandwidth                                                                |
| **Requests in flight at that moment** | Your own concurrency counter                                                          | **The most important column** — without it you cannot correlate slowness with concurrency |

That last column is the one people skip, yet it is often the conclusion itself: plot rate against concurrency, and if the rate falls proportionally as concurrency rises, bandwidth is your bottleneck and there is nothing else to look for.

**How to use the table**: put it side by side with `duration_for_view` from the console log —

* Close to each other → the problem is downstream transfer; look at bandwidth and concurrency;
* Far apart → the problem is the finish signal or the client side.

## Four things that reduce the risk immediately

<Steps>
  <Step title="Switch to URL output — the highest-leverage change">
    `gpt-image-2-vip` and `gpt-image-2-all` accept `response_format: "url"`, returning an image link instead of base64. **The response body drops from about 2.6 MB to about 0.3 KB** — which removes the download and finish-signal problems at the same time, because a small response carries `Content-Length` and the client knows on its own when it is done.

    If your business depends on URL output, switch the token's group to `image2_OSS`: deterministic URL output that will not degrade to base64 under resource pressure, at a **1x multiplier with no markup**.

    <Warning>
      The official-relay `gpt-image-2` does **not** support this parameter and returns 400 `unknown_parameter` if you send it. Base64 is currently its only output path.
    </Warning>
  </Step>

  <Step title="Shrink the response body">
    When you must stay on base64: `output_format=jpeg` with `output_compression` cuts the size by more than half versus PNG; lower `size` and `quality` to what you actually need instead of defaulting to 4K. Compressing input reference images to under 1.5MB helps the upload leg too.
  </Step>

  <Step title="Cap concurrency at what your bandwidth supports">
    Invert the formula above: acceptable download time × egress bandwidth ÷ per-image size is your concurrency ceiling. Past it, more concurrency only makes every request slower without raising total throughput. Per-model limits are in [How much concurrency can I use?](/en/faq/api-concurrency).
  </Step>

  <Step title="Split the timeout into three, and finish proactively once data is complete">
    Set the first-byte, inter-chunk, and finish-grace timeouts separately as described above. When the data is complete but the finish signal never arrives, hand the response you already hold to your application — full compatibility code is in [Image request finish stall](/en/api-capabilities/image-tail-stall).
  </Step>
</Steps>

## Common questions

<AccordionGroup>
  <Accordion title="I never got the result — why was I still billed?">
    Because billing happens **when the gateway finishes processing**, and by then upstream really had generated and returned the result. Whether your client goes on to receive it does not change the cost already incurred. Measured comparison: a client that disconnects at 5 seconds is billed **exactly the same** as one that runs to completion.

    Turn it around and this is the strongest diagnostic you have: **a billing record means the request genuinely reached upstream and succeeded**, so the problem must lie after the gateway finished processing, or before the request was truly sent — no need to suspect upstream.

    Image endpoints have no async task ID, so disconnecting loses the result; see [Is there an async image API?](/en/faq/image-async-api).
  </Accordion>

  <Accordion title="Would raising the timeout from 600 to 1200 seconds help?">
    It depends — which is exactly why you measure before changing anything:

    * **Slow download** (low rate, byte count still climbing): yes, raising it gets you the result.
    * **Finish signal never came** (bytes complete long ago, nothing new at the end): **no**. We measured 330 seconds of continued waiting in this state without a single new byte; a longer timeout only delays the moment you notice. Here you need to finish proactively on the client.
  </Accordion>

  <Accordion title="Is this my problem or your gateway's?">
    It can be either, which is why you measure first. Here are the criteria for both sides:

    * **Points at you**: a clearly low `speed_download`, a rate that falls as concurrency rises, packet loss in `mtr`, or curl behaving fine while only your application code times out.
    * **Points at us**: bytes complete long ago with a long stretch of zero new data at the end. The gateway did have a "delayed finish signal" problem — its root cause was billing accounting on the image path blocking request handling — fixed and verified with an upstream release on **13 August 2026**. Even in completely healthy periods, roughly 4% of requests still wait 10–79 extra seconds for the finish signal, with their data already fully delivered.

    Send us the per-segment measurements once you have them; it is far more actionable than "it's slow". The fields to include are in the next section.
  </Accordion>

  <Accordion title="Is there an async API? I would rather not hold a connection open">
    Image generation is currently synchronous across the board, with no task-ID lookup endpoint. An asynchronous option is on the roadmap and will be announced separately when it ships.

    Until then we recommend wrapping an async shell on your own side (return a local task ID on submission, let background workers make the synchronous call); see [Building your own async queue](/en/api-capabilities/image-async-queue).
  </Accordion>

  <Accordion title="Can I work around it by changing endpoint or machine?">
    Depends which class you are in. Insufficient bandwidth is a property of your egress, so changing our entry address does nothing — you need more bandwidth, smaller payloads, or lower concurrency. The finish-signal class appeared at multiple entry points simultaneously inside a window and recovered simultaneously, so changing domains does not route around it either.

    The one address to avoid is the CDN node: `api-cf.apiyi.com` runs through Cloudflare and returns `524` at roughly 100 seconds, which is unsuitable for long image requests.
  </Accordion>
</AccordionGroup>

## Three easily missed client-side causes

If curl measures clean and only your application code times out, look here:

1. **The timeout does not mean what you think.** Is your 600 seconds a total timeout or only a read timeout? Node's `undici` has three independent timeouts — `headersTimeout`, `bodyTimeout`, and `connect.timeout` — whose defaults are far below whatever you set on the outer layer, and changing only the outer one has no effect.
2. **Connection-pool queueing.** When the pool is saturated, the clock starts before the request is actually sent. That wait is completely invisible to us — there is no record of the request in the backend log until it truly goes out. Diagnostic: no matching log record generally means this class.
3. **There is another layer in between.** A self-hosted nginx defaults `proxy_read_timeout` to 60 seconds, and load balancers, API gateways, and serverless platforms each impose their own ceilings. List the timeout at every hop; the smallest one is your real timeout.

## What to include when reporting

If you still need our help after the self-check, send these together to save several rounds:

* **Request IDs** (a handful is enough, not the full set)
* **Per-segment timings**: time to first byte / last-byte time / total time / response body bytes
* **When it happened**, with the time zone (e.g. `2026-08-13 15:57 (UTC+8)`)
* **Concurrency at the time** and your egress bandwidth
* Which **model** and **token group** you were using

## Related docs

<CardGroup cols={2}>
  <Card title="How do I avoid API timeouts?" icon="timer" href="/en/faq/timeout-configuration">
    Recommended timeouts per scenario, and endpoint selection
  </Card>

  <Card title="Image request finish stall" icon="hourglass" href="/en/api-capabilities/image-tail-stall">
    Client-side handling when data is complete but the connection will not end
  </Card>

  <Card title="Image API connection drops" icon="unplug" href="/en/api-capabilities/image-connection-drops">
    Diagnosing ECONNRESET and SSL EOF style downstream disconnects
  </Card>

  <Card title="How much concurrency can I use?" icon="gauge" href="/en/faq/api-concurrency">
    Per-model concurrency limits and quota requests
  </Card>

  <Card title="Image API best practices" icon="image" href="/en/api-capabilities/image-api-best-practices">
    Per-model timeout cheat sheet and output format comparison
  </Card>

  <Card title="Reading the billing amount in your logs" icon="receipt" href="/en/faq/log-billing-explained">
    What each console log column means and how billing is recorded
  </Card>
</CardGroup>

## Contact us

<CardGroup cols={2}>
  <Card title="WeCom Support" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeCom support QR code" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    Scan the QR code or [contact support](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    Image timeouts and slow-download diagnosis
  </Card>

  <Card title="Email" icon="mail">
    **Support**: [support@apiyi.com](mailto:support@apiyi.com)

    **Business**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
