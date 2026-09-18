> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Image Requests That Hang After the Data Has Arrived

> The image has already arrived in full, but the connection never ends, so the client waits until its own timeout fires. Causes, how to identify it, and client-side code that finishes the response yourself — a compatibility layer on top of your existing call, not a replacement for it.

<Info>
  **The one-line answer**: the image data **is complete** and decodes into a perfectly good image. What hangs is the very last step of the HTTP transfer — telling the client "that's all." So the right fix is not a longer timeout and not a retry, but **finishing the response yourself once the data has arrived, and using the image you already have**.
</Info>

<Warning>
  ### This is **compatibility**, not **replacement**

  The code below adds a protective layer **around your existing call logic**. It is not a different way to integrate:

  * You do **not** need to change the endpoint, switch models, swap SDKs, or adjust any request parameter;
  * Healthy requests still follow exactly the path they do today — **behavior is unchanged**. This compatibility logic never even triggers on a healthy request;
  * It only steps in when the data has fully arrived but the connection refuses to end, and hands you the image you already received.

  In short: **with it, the bad case is recoverable; without it, the bad case can only end in a timeout error.** Everything else stays as it is.
</Warning>

## Symptom

When calling the native image generation endpoint (`POST /v1beta/models/{model}:generateContent`), you may see this combination:

* The dashboard log shows the request **succeeded** and it **was billed**;
* The client hangs anyway, failing only when its own read timeout fires;
* Errors look like `Read timed out`, `ETIMEDOUT`, or `UND_ERR_BODY_TIMEOUT`.

It feels like "the dashboard says it finished in 30 seconds, but I still don't have the image 5 minutes later."

<Warning>
  **The same code used to work fine, and now it hangs at this final step.** This scenario is recent — it is not a long-standing flaw in how you integrated. So there is no need to second-guess your call pattern; you just need to add the compatibility layer described below.
</Warning>

### It arrives in windows

This matters, because it determines how you reproduce it and how you interpret what you see:

* **Inside a window**: consecutive calls hang, **all of them**, without exception;
* **Outside a window**: dozens of consecutive calls run perfectly, with **not a single occurrence**.

So it is neither "always reproducible" nor "a rare random glitch." If your test happens to miss the window, everything looks 100% healthy and it is easy to wrongly conclude "it's fixed." If you happen to land inside one, it looks like everything is broken. **Both impressions are real — just don't draw a long-term conclusion from either one alone.**

<Info>
  **Streaming** requests (`:streamGenerateContent`) and text-only models are generally unaffected. This page is about **non-streaming image generation**, where the response body is large — the JSON body for a 2K image is on the order of 13 MB.
</Info>

## Cause

Image responses are sent with `Transfer-Encoding: chunked`. Per the HTTP/1.1 spec, once the server has sent the last data chunk it must send a **terminating chunk** (a zero-length chunk) to tell the client "this is the end."

That is the step that fails: **every data chunk arrives, but the terminating chunk is never sent and the connection is never closed.**

The client is left holding a **complete, usable JSON document** (the image base64-decodes fine), with no way to know the body is finished. So it keeps waiting — until its own read timeout fires.

An analogy: **the parcel is already on your doorstep, but the courier forgot to tap "delivered."** You sit watching the tracking page for an update while the package is right outside.

<Warning>
  Within certain time windows the route is not performing this final step on the response. **We are continuing to push for a server-side fix**; what this page describes is the **client-side safety net** to use in the meantime.

  That safety net has independent value, and **you do not need to roll it back once the server side is fixed**: when the terminating signal is present it never triggers at all, so it goes silent by itself — zero overhead, zero maintenance burden.
</Warning>

Three conclusions that directly determine how to handle it:

<CardGroup cols={3}>
  <Card title="The data is complete" icon="circle-check">
    Not packet loss, not a network quality issue, and not a transfer cut off halfway. The bytes you have parse cleanly and the image is fully usable.
  </Card>

  <Card title="Waiting does not help" icon="timer-off">
    Once it hangs, the server sends **not one more byte**. Verified by waiting **330 seconds** with no change. Raising the timeout to several hundred seconds only delays detection.
  </Card>

  <Card title="Not tied to one machine" icon="server-off">
    Inside a window, multiple points of presence fail **at the same time** and recover **at the same time**. Switching domains or entry points does not route around it — it has to be handled client-side.
  </Card>
</CardGroup>

## How to identify it

If all three of these hold, this is almost certainly what you are hitting:

<Steps>
  <Step title="The response carries Transfer-Encoding: chunked and no Content-Length">
    Meaning the body length was never declared up front, so the client can only rely on the terminating chunk to know it is done.
  </Step>

  <Step title="The bytes received so far already parse as complete JSON">
    Run `json.loads` over what you have — it succeeds, and the `inlineData.data` inside base64-decodes to a complete, usable image.
  </Step>

  <Step title="After that parse succeeds, no new bytes arrive for a long time">
    No terminating chunk, and the connection is not closed either. It simply stays open.
  </Step>
</Steps>

### How it differs from two similar cases

All three produce similar-looking errors, but the root causes and the fixes are completely different. **Do not apply one set of criteria to all of them:**

| Observation            | This page (hangs indefinitely)                                                | Cut off (`ECONNRESET`)                  | Terminator late, then disconnected           |
| ---------------------- | ----------------------------------------------------------------------------- | --------------------------------------- | -------------------------------------------- |
| Bytes received         | **Full body, JSON parses completely**                                         | Usually short of the full body          | Full body                                    |
| Final connection state | **No terminator, no FIN, stays open**                                         | TCP RST received                        | FIN (graceful close)                         |
| When it fails          | Never — until the client gives up (verified: still nothing after 330 seconds) | Varies                                  | **+300 seconds** after last byte             |
| What to do             | **Use the image you already have** (this page)                                | Investigate the network path and client | Same as this page — the data is complete too |

If your error is `ECONNRESET`, that is a different class of problem; see [Connection Drops](/en/api-capabilities/image-connection-drops).

## Compatibility layer: finish the response on the client side

The idea is simple: **do not wait for the connection to end — finish as soon as the bytes you already have parse as complete JSON.**

### Critical: keep a grace period

Do not finish the instant parsing succeeds. In the normal case the terminating chunk is usually in the very next TCP segment, only milliseconds away. Cutting off as soon as parsing succeeds would misclassify "the terminator was a few milliseconds late" as "the server never sent it."

The correct approach: once parsing succeeds, **wait a short while longer** (3–5 seconds is a good default). If any bytes arrive during that window, carry on normally. Only if nothing arrives do you declare it stalled and finish the response yourself.

<Warning>
  **This is not an optional refinement.** Skipping the grace period makes the detection completely useless — **every healthy request gets misreported as a failure**. Our first implementation hit exactly this: an entire batch of healthy requests was flagged as broken.
</Warning>

### The checks to clear before finishing a response

Ordered from cheapest to most expensive. **If any one of them fails, keep waiting — do not finish the response:**

| # | Check                                                        | Why                                                                                                                          |
| - | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| 1 | The connection is still receiving and has not ended normally | Anything that ended normally should just take your existing success path                                                     |
| 2 | The HTTP status is 2xx                                       | Anything else belongs to your existing error handling                                                                        |
| 3 | The response has no `Content-Length`                         | A declared length means this is not the scenario; let your HTTP client finish it                                             |
| 4 | The bytes received exceed a minimum size                     | Filters out small error responses                                                                                            |
| 5 | The byte count changed since the last attempt                | Avoids re-parsing a body of a dozen-plus MB over and over                                                                    |
| 6 | The last non-whitespace character is `}`                     | An extremely cheap pre-filter. Base64 image data contains no `}`, so a partial transfer is almost always rejected right here |
| 7 | The full JSON parses successfully                            | The final verdict                                                                                                            |

Checks 6 and 7 together drive the **false-positive rate to near zero**: the response is a single JSON object, so parsing necessarily fails while data is still missing. In other words, **you can only finish a response that genuinely arrived in full**.

### Python

Read the stream on a background thread and implement the grace period with a **queue timeout** on the main thread:

```python theme={null}
import json
import time
import base64
import queue
import threading
import requests

MIN_BYTES = 1024          # check 4: anything smaller cannot be an image


def _pump(raw, q):
    """Background thread: its only job is to push chunks onto the queue."""
    try:
        for chunk in raw.stream(65536, decode_content=True):
            q.put(chunk)
        q.put(None)                       # the server finished normally
    except Exception as exc:              # transport error, re-raised by main
        q.put(exc)


def _try_parse(buf):
    if len(buf) < MIN_BYTES:                    # check 4
        return None
    if not buf.rstrip().endswith(b"}"):         # check 6: cheap pre-filter
        return None
    try:
        return json.loads(buf.decode("utf-8"))  # check 7: the final verdict
    except ValueError:
        return None


def generate_image(url, headers, payload,
                   ttfb_timeout=180, term_grace=5, body_timeout=60):
    """Non-streaming image generation with client-side completion.

    ttfb_timeout: waiting for the first byte. The upstream is generating during
                  this phase — slow is not the same as broken, so leave room.
    term_grace:   how long to wait for the terminating signal once the body is
                  complete. If it never comes, finish the response ourselves.
    body_timeout: how long the whole body may take after the first byte.
    """
    resp = requests.post(url, headers=headers, json=payload,
                         stream=True, timeout=(10, ttfb_timeout))
    resp.raise_for_status()                     # check 2

    if resp.headers.get("Content-Length"):      # check 3
        return resp.json()                      # length declared: let the library finish

    q = queue.Queue()
    threading.Thread(target=_pump, args=(resp.raw, q), daemon=True).start()

    buf = bytearray()
    deadline = time.monotonic() + body_timeout

    while True:
        try:
            item = q.get(timeout=term_grace)
        except queue.Empty:                     # nothing new within the grace period
            obj = _try_parse(buf)
            if obj is not None:
                resp.close()                    # body is complete: finish it ourselves
                return obj
            if time.monotonic() > deadline:
                raise TimeoutError("incomplete body and no new data for a long time")
            continue                            # still incomplete, keep waiting

        if item is None:                        # healthy path: the server finished it
            break
        if isinstance(item, Exception):
            raise item
        buf += item

    obj = _try_parse(buf)
    if obj is None:
        raise ValueError("Incomplete response")
    return obj


def extract_image(obj):
    for cand in obj.get("candidates", []):
        for part in cand.get("content", {}).get("parts", []):
            if "inlineData" in part:
                return base64.b64decode(part["inlineData"]["data"])
    return None
```

<Warning>
  **Why the extra thread?** Because `requests` has **a single read timeout** governing both "waiting for the first byte" and "waiting between chunks." When the response stalls, the read loop blocks on the next read and the grace period never gets a chance to run — a straightforward `for chunk in ...` version with a timer **does not fire** in the very case it is meant to catch.

  Reading on a background thread and calling `q.get(timeout=term_grace)` on the main thread is what actually separates the two timeouts. We hit this ourselves: one timeout covering two different things merges "slow generation" and "never finished" into a single indistinguishable failure.
</Warning>

<Note>
  This version parses **once, when the grace period expires**, rather than after every chunk — which satisfies check 5 above for free. A body of a dozen-plus MB never gets parsed repeatedly.
</Note>

### Node.js

Node.js needs no extra thread — `reader.read()` is already a promise, so `Promise.race` can cap how long you wait for the next chunk:

```javascript theme={null}
const TERM_GRACE_MS = 5000;       // how long to wait for the terminating signal
const TOTAL_TIMEOUT_MS = 180000;  // total timeout: must cover upstream generation
const MIN_BYTES = 1024;

async function generateImage(url, headers, payload) {
  const resp = await fetch(url, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(TOTAL_TIMEOUT_MS),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);        // check 2
  if (resp.headers.get("content-length")) return resp.json();  // check 3

  const reader = resp.body.getReader();
  const chunks = [];
  let total = 0;

  while (true) {
    // Promise.race caps how long we wait for the next chunk
    const next = reader.read();
    const timer = new Promise((r) => setTimeout(() => r("GRACE"), TERM_GRACE_MS));
    const winner = await Promise.race([next, timer]);

    if (winner === "GRACE") {
      const parsed = tryParse(chunks, total);
      if (parsed) {                 // body is complete: server never finished
        reader.cancel().catch(() => {});
        return parsed;
      }
      continue;                     // body still incomplete, keep waiting
    }

    const { done, value } = winner;
    if (done) break;                // healthy path: the server finished it
    chunks.push(value);
    total += value.length;
  }

  const parsed = tryParse(chunks, total);
  if (!parsed) throw new Error("Incomplete response");
  return parsed;
}

function tryParse(chunks, total) {
  if (total < MIN_BYTES) return null;                 // check 4
  const buf = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { buf.set(c, off); off += c.length; }
  const text = new TextDecoder().decode(buf).trimEnd();
  if (!text.endsWith("}")) return null;               // check 6
  try { return JSON.parse(text); } catch { return null; }   // check 7
}
```

<Tip>
  Note the **healthy path** comment in both snippets: when the server finishes the response properly, the loop exits naturally via `done` or the end of iteration, and the grace-period branch is never entered. That is what "compatibility rather than replacement" means in practice — your existing success path is byte-for-byte unchanged.
</Tip>

## Choosing timeouts

The easiest mistake here is **using one timeout value for two different things**: "waiting for the upstream to generate the image" and "the silence between two chunks after the first byte." Their normal durations differ by an order of magnitude. Merge them into one value and you either kill slow generation as if it were a failure, or leave genuinely stalled requests waiting for minutes.

| Phase                                                | Normal duration              | Recommended                 | Why                                                                 |
| ---------------------------------------------------- | ---------------------------- | --------------------------- | ------------------------------------------------------------------- |
| **Waiting for the first byte** (upstream generating) | \~20–30s at 2K, longer at 4K | **120–180s**                | Slow here is not a failure; cutting it short kills healthy requests |
| **Silence between chunks** after the first byte      | Milliseconds                 | **3–5s** (the grace period) | Once nothing moves on that scale, it is time to decide and finish   |

<CardGroup cols={2}>
  <Card title="✅ Recommended" icon="check">
    Set the two separately: leave room for generation before the first byte,
    then keep inter-chunk silence down to seconds and let the client-side
    completion above catch the rest. Failures surface in seconds and no healthy
    request is harmed.
  </Card>

  <Card title="❌ Avoid" icon="ban">
    One 300-second timeout covering everything "just in case."
    When the response hangs, the server sends nothing further, so a longer wait
    changes nothing and only delays detection.
  </Card>
</CardGroup>

<Note>
  If your product includes slower tiers such as 4K: the **total timeout can be longer** (the model really does need that time), but the **inter-chunk silence threshold should not grow with it** — they are two different things, so do not scale them together.
</Note>

<Note>
  Node.js users: undici (the engine behind the built-in `fetch` in Node 18+) has **three independent timeouts**, and an SDK's `timeout` option does not reach any of them. See the "Node.js: three independent timeouts" section of [Connection Drops](/en/api-capabilities/image-connection-drops) for the correct configuration.
</Note>

## Retries and billing

Once you have determined the server never finished the response, work through this order:

<Steps>
  <Step title="Use the image you already have — this ends it in almost every case">
    The data is complete and the image is fully usable, so **no retry is needed**. This is both the cheapest path and the one that avoids being billed twice.
  </Step>

  <Step title="Retry only if parsing genuinely failed">
    If the bytes you have really cannot be parsed into complete JSON, then retry. Use a fresh connection and leave 2–3 seconds between attempts.
  </Step>

  <Step title="Back off after repeated failures instead of retrying tightly">
    Because the problem arrives in windows, retrying immediately is likely to land in the same window. If three attempts in a row hang, back off for 30 seconds before trying again.
  </Step>
</Steps>

<Warning>
  **Billing**: for these requests the upstream already generated the image and started sending it back, so delivery counts as complete and the request **is billed normally**. "My client timed out" does not mean "I wasn't charged" — which is exactly why step one matters most: you already paid for that image, so throwing it away is the real waste.

  For the full breakdown of which connection drops are billed and which are not, see the "Billing impact" section of [Connection Drops](/en/api-capabilities/image-connection-drops).
</Warning>

## Rollout notes

These are language- and framework-agnostic, drawn from our own rollout:

* **Put it at a single network-layer entry point, not scattered across call sites.** Make it part of the "send a request" action itself. That covers every image path at once, leaves business code untouched, and means there is only one place to change once the server side is fixed.

* **What you actually need is incremental read access.** The prerequisite is being able to see what has arrived before the response ends. Nearly every HTTP client offers this (streaming reads, chunk callbacks, progress events), but **it is usually not the default** — the default "just give me the whole body" is precisely the path that hangs. **This is where most of the work is.**

* **Time from the last chunk received, not from the start of the request.** Reset the grace-period timer on every chunk. That way you neither punish slow networks nor miss the "nothing is moving at all" state.

* **Put it behind a switch.** Keep the behavior behind a flag you can turn off at any time. If anything unexpected shows up right after release, flip it off to restore the old behavior — no emergency deploy needed.

* **Add telemetry.** Log every time the completion path fires (timestamp, byte count, wait duration). It serves three purposes: quantifying how often this actually happens, confirming the layer is doing its job, and confirming the counter drops to zero after the server-side fix — which is the only objective basis for deciding the layer can be retired.

* **A bonus improvement while you are in there.** Once you have incremental reads, you can surface real progress to users ("receiving data, X.X MB"). That long download was previously a complete black box on their side.

## How we deployed it ourselves

We have already completed and verified this work on our own AI image studio (`imagen.apiyi.com`). Using a mock service that reproduces the fault (sends the full body, then neither signals the end nor closes the connection), we ran this comparison:

| Scenario                                      | Result                                                                           |
| --------------------------------------------- | -------------------------------------------------------------------------------- |
| Healthy response (terminating signal present) | Returns via the existing path, **completion never fires** — no false positives   |
| Body complete, no terminating signal          | Finished after the grace period, data complete and usable                        |
| Same, with the switch turned off              | Old behavior preserved (keeps waiting) — the switch works, rollback is available |
| Hangs with only half the body received        | **Does not** falsely finish; keeps waiting                                       |
| Complete body but `Content-Length` present    | Blocked by the guardrail, does not finish                                        |

Conclusion: **zero impact on healthy requests, while failing requests go from "wait for the timeout, then fail" to "get the image within seconds."**

## Common questions

<AccordionGroup>
  <Accordion title="Could this cut off a request that was actually healthy?">
    No. Finishing requires that the bytes received parse as a **complete JSON document** — parsing necessarily fails while data is still missing. Add the 3–5 second grace period on top and healthy requests are not misclassified. The first two rows of the comparison table above are exactly these two cases side by side.
  </Accordion>

  <Accordion title="Could I end up with half an image?">
    No. What is checked is the integrity of the **whole response body**, not the image itself. If the JSON parses, the image data is complete — half an image corresponds to a parse failure, and that never triggers completion.
  </Accordion>

  <Accordion title="Isn't this just papering over a server-side problem?">
    No. It does not replace the server-side fix. It delivers a result that has **already been produced and already been billed** into the user's hands, while avoiding the double billing that blind retries cause. The telemetry it produces also helps characterize when the fault occurs.
  </Accordion>

  <Accordion title="Should we remove it once the server side is fixed?">
    There is no rush. When the terminating signal is present this logic never fires, so it costs nothing. Wait until the telemetry has been at zero for a sustained period, then consider cleaning it up.
  </Accordion>
</AccordionGroup>

## When to contact support

If, after adding the compatibility layer above, any of the following still holds, gather your materials and contact support:

* The bytes you have **never parse into complete JSON** (this is not the scenario on this page — the transfer really was cut short);
* Even with client-side completion, you **receive no response headers at all** for a long time (that means the upstream has not started sending yet — slow generation or an upstream fault, not a completion problem);
* The stall rate stays **consistently high** rather than clustering in time windows, reproducing steadily over a long period.

When filing a ticket, include: `x-request-id`, the call time (**with timezone**, e.g. `2026-08-03 13:15 (UTC+8)`), the model name and key parameters such as `imageSize`, the raw client-side exception, and how many bytes you had received when it hung.

## Related documentation

<CardGroup cols={3}>
  <Card title="Connection Drops" icon="unplug" href="/en/api-capabilities/image-connection-drops">
    `ECONNRESET`, SSL EOF, undici's three timeouts, and the local-proxy diagnostic matrix
  </Card>

  <Card title="Must-Read & Best Practices" icon="book-check" href="/en/api-capabilities/image-api-best-practices">
    Synchronous calls, timeout tiers, base64 handling, and billing on dropped connections
  </Card>

  <Card title="Build Your Own Async Queue" icon="list-checks" href="/en/api-capabilities/image-async-queue">
    Wrap synchronous calls in a task queue, absorbing occasional failures with retries and persistence
  </Card>
</CardGroup>
