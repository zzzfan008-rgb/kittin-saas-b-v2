> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Troubleshooting Image API Connection Drops

> How to troubleshoot connection reset by peer, write_response_body_failed and SSL EOF. A 500 write_response_body_failed is never billed. Covers what to check on macOS versus Linux servers, undici's three Node.js timeouts, and a local-proxy diagnostic matrix.

<Warning>
  ### Billing first: a `write_response_body_failed` 500 is **not charged**

  When the gateway returns `500` with `write_response_body_failed` / `connection reset by peer`, the platform has **already retried internally 2-3 times** and only surfaces the error after all of them failed. **These requests incur no charge whatsoever.**

  So even if your logs fill up with these errors, **no matching charge appears on your bill** — you are not paying for failures. A different case *is* billed (your client walking away early); see the "Billing impact" section below.
</Warning>

<Info>
  **Short answer**: image API responses routinely run from ten to several dozen MB, and the break almost always happens while **downloading the response** (**not** because the request body is too large — plain text-to-image breaks too). Start by checking which category the console log falls into, then run the macOS / Linux / Node.js self-checks below.
</Info>

## What the error looks like

The same root cause shows up with two completely different faces, depending on which side you are reading.

### From the gateway

```json theme={null}
{
  "status_code": 500,
  "error": {
    "message": "write tcp 10.0.0.1:443->203.0.113.5:52310: write: connection reset by peer",
    "type": "shell_api_error",
    "code": "write_response_body_failed"
  }
}
```

### From the client

| Language / library                | Typical exception                                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Python `requests` / `urllib3`     | `SSLError(SSLEOFError(8, 'EOF occurred in violation of protocol'))`, `ChunkedEncodingError`, `ConnectionResetError` |
| Python `httpx`                    | `RemoteProtocolError`, `ReadError`                                                                                  |
| Node.js (undici / built-in fetch) | `UND_ERR_CONNECT_TIMEOUT`, `UND_ERR_HEADERS_TIMEOUT`, `UND_ERR_BODY_TIMEOUT`, `SocketError: other side closed`      |
| Node.js (other stacks)            | `read ECONNRESET`, `ERR_STREAM_PREMATURE_CLOSE`, `socket hang up`                                                   |
| Go                                | `unexpected EOF`, `http2: server sent GOAWAY`                                                                       |
| curl                              | `curl: (56) Recv failure`, `curl: (18) transfer closed with outstanding read data remaining`                        |

<Tip>
  **On Node.js, distinguish "killed" from "closed"**: `ECONNRESET` means a TCP RST arrived — the connection was **killed** by something on the path, pointing at a network hop. `SocketError: other side closed` / `ERR_STREAM_PREMATURE_CLOSE` means the peer closed **gracefully** (FIN), pointing at a server-side finalization problem such as a missing chunked terminator. The two point in completely different directions; do not treat them as one symptom.

  Also, `UND_ERR_*` can only come from undici (the engine behind Node 18+'s built-in `fetch`), whereas `read ECONNRESET` is libuv's top-level wording, which `axios` / `node-fetch` / the `http` module all produce. **If both kinds appear together, first check whether your app has two different HTTP paths** — in that case they are not the same incident at all.
</Tip>

## First establish the direction: who hung up

The `write_response_body_failed` code is the key clue — it means **the gateway failed while writing the response body back to the caller**. That is the **downstream** direction, not an upstream model error. The result had already been generated; the connection died while it was being pushed to you.

<Info>
  **This is not caused by an oversized request body.** Image editing uploads reference images, which makes people suspect upload size — but **plain text-to-image, whose request body is a few hundred bytes, breaks just as often**. The break is in **downloading the response**: image payloads run from ten to several dozen MB and are the most fragile leg of the whole path.
</Info>

<CardGroup cols={2}>
  <Card title="Downstream drop" icon="arrow-down-from-line">
    `write_response_body_failed`, `connection reset by peer`, client-side SSL EOF.
    The connection vanished while the gateway was pushing the body. **When the platform returns a 500 for this, it is not billed** — see the billing section below.
  </Card>

  <Card title="Upstream failure (channel side)" icon="arrow-up-from-line">
    Upstream timeouts, `upstream_error`, 5xx carrying the upstream payload, or HTTP 200 with an abnormal `finishReason`.
    These are genuine channel issues — take the `x-request-id` to support.
  </Card>
</CardGroup>

### The strongest signal: what the console log says about this call

Check the call log in the console before touching anything else. It costs nothing and narrows the field faster than any client-side step:

| What the log shows                   | Meaning                                                                         | Billed?        | Next step                                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------ |
| **A normal call record**             | Request arrived, upstream finished, gateway considers it delivered              | Billed         | Work through the four steps below, focusing on application-layer misreads and early client disconnects |
| **500 `write_response_body_failed`** | The gateway failed writing the body back to you, after **2-3 internal retries** | **Not billed** | A downstream-path problem — send the request-id to support                                             |
| **No record at all**                 | The request **never left your machine**                                         | Not billed     | Connection stage — jump to the "Node.js timeouts" and "Local proxy / VPN" sections below               |

<Warning>
  This yields a conclusion people frequently get backwards: **connection-stage failures such as `UND_ERR_CONNECT_TIMEOUT` cannot produce a charge**, because the request never reached the gateway. So if you see "lots of connect timeouts" *and* "lots of charges", **those are definitely not the same requests** — investigate them separately rather than forcing one root cause to explain everything.
</Warning>

### Four steps to clear yourself

Work through them in order; most cases resolve in the first two:

<Steps>
  <Step title="Rule out an application-layer misread: you may have received it and failed to keep it">
    "No image received" is usually the conclusion after code threw and got caught as "request failed" — not evidence that no bytes arrived. The most common instance: `gpt-image-2-all` returns `b64_json` by default **with no `data:` prefix**, so code that reads `data[0].url` gets `undefined`, throws downstream, is judged a failure, and triggers a retry — **which bills again**.

    The symptoms are identical to a network fault, yet no network fault is required. Print one line to check:

    ```javascript theme={null}
    console.log(Object.keys(resp.data[0]), resp.data[0].b64_json?.length);
    ```

    Field and prefix differences per series are in [the base64 prefix reference](/en/api-capabilities/image-api-best-practices#prefix-differences).
  </Step>

  <Step title="Check whether every channel and model is failing at once">
    If two different channels running two different models are all throwing the same error inside the same time window, channel-specific causes are essentially ruled out — upstreams do not fail that neatly in unison.
  </Step>

  <Step title="Check your client runtime: TLS stack (Python) or undici timeouts (Node.js)">
    Python: check the TLS stack version. Node.js: check undici's three timeouts. Both are covered in the next two sections. This is the most frequent root cause in practice, it lives entirely on your machine, and one command confirms it.
  </Step>

  <Step title="Drop concurrency, go serial, and turn off the local proxy">
    Rerun the same requests at concurrency 1-2 with the VPN or proxy disabled. If it never reproduces that way, the problem is in your client's connection handling, local resources (connection pool, file descriptors, memory), or network path — not the channel.
  </Step>
</Steps>

## Prime suspect: the client TLS stack (especially on macOS)

**The Python that ships with macOS (`/usr/bin/python3`) links against LibreSSL 2.8.3**, not OpenSSL. Combined with urllib3 v2, that pairing reliably throws `SSLEOFError` during **concurrent downloads of large response bodies**. The client hangs up unilaterally, and the gateway duly logs a wall of `connection reset by peer`.

### One command to check

```bash theme={null}
python3 -c "import ssl; print(ssl.OPENSSL_VERSION)"
```

| Output                    | Verdict                                                                                |
| ------------------------- | -------------------------------------------------------------------------------------- |
| `LibreSSL 2.8.3`          | ⚠️ **High risk** — produces phantom connection errors under concurrent large responses |
| `OpenSSL 1.1.1x` or newer | ✅ Fine                                                                                 |

Seeing this warning when you import `requests` is the same signal:

```
NotOpenSSLWarning: urllib3 v2 only supports OpenSSL 1.1.1+,
currently the 'ssl' module is compiled with 'LibreSSL 2.8.3'
```

### Fix: switch interpreters

Do not downgrade urllib3 — just use a Python built against a proper OpenSSL:

```bash theme={null}
# macOS: build a virtualenv on Homebrew's Python
brew install python@3.13
python3.13 -m venv venv
venv/bin/pip install requests pillow
venv/bin/python -c "import ssl; print(ssl.OPENSSL_VERSION)"   # should print OpenSSL 3.x
```

### Measured comparison (2026-07-29, UTC+8)

Real numbers from a two-channel comparison test on the Nano Banana series (`gemini-3-pro-image` / `gemini-3.1-flash-image`):

| Interpreter                         | Scenario                                                                                              | Transport-level failure rate                                        |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| System python3.9 (LibreSSL 2.8.3)   | image calls at concurrency 12                                                                         | **Widespread failures, on both channels simultaneously**            |
| Homebrew python3.13 (OpenSSL 3.6.1) | the same 108 calls                                                                                    | 3 (2.8%), all on 4K large responses, **all succeeded on one retry** |
| Homebrew python3.13 (OpenSSL 3.6.1) | 80 dedicated reproduction calls (concurrency 24 small responses, concurrency 12 at 4K, and serial 4K) | **0**                                                               |

The conclusion is unambiguous: **an order-of-magnitude difference across the interpreter switch**, and the fact that both channels failed together beforehand already proved it was not channel-related.

## What to check on a Linux server (a completely different list)

<Info>
  The TLS-stack check above **passes on essentially every Linux box** — distro Python links against a normal OpenSSL, so the LibreSSL trap does not exist there. **Do not stop at that check.** Server-side problems live in the **egress path** and in **container limits**, which is a different world from local development.
</Info>

### 1. Idle timeouts on cloud NAT gateways and load balancers (the top server-side cause)

This is the number one source of `connection reset by peer` in production. Take **AWS NAT Gateway**: it enforces a **fixed, non-configurable 350-second idle timeout**, and when it fires it sends **an RST rather than a FIN** — so what your client sees is exactly `ECONNRESET`.

The nasty part is that it **cascades**: once pooled connections have been idle past 350 seconds they are all dead, so your request gets RST on the first one, the client transparently retries on the next pooled connection — **which was equally idle and also gets RST**. The signature is "quiet for a while, then several calls fail back-to-back, then everything is fine again".

<Tip>
  This is the same mechanism as the "keep-alive reusing a dead connection" case in the Node.js section — on a server the culprit is usually the **cloud provider's NAT gateway** rather than local proxy software.
</Tip>

Fixes (any of these; the first two are preferred):

* **Set TCP keepalive below 350 seconds** so traffic flows even during quiet periods;
* **Cap how long connections may sit idle in the pool** so possibly-dead ones get discarded (Node: `new Agent({ keepAliveTimeout: 60_000 })`; Python `requests`: configure the pool via `HTTPAdapter`);
* Route around the NAT gateway entirely, e.g. via VPC endpoints.

Other clouds and self-hosted load balancers use different idle values, but **the approach is identical: find the shortest idle timeout on the path and set keepalive below it**.

### 2. The TCP keepalive default is effectively "off"

Linux defaults `tcp_keepalive_time` to **7200 seconds (2 hours)**, far longer than any of the idle timeouts above, which makes it useless in practice:

```bash theme={null}
# Inspect current values
sysctl net.ipv4.tcp_keepalive_time net.ipv4.tcp_keepalive_intvl net.ipv4.tcp_keepalive_probes

# Adjust temporarily (inside containers this needs --sysctl or privileges;
# in production prefer sysctl.d or setting SO_KEEPALIVE in the app)
sudo sysctl -w net.ipv4.tcp_keepalive_time=60
sudo sysctl -w net.ipv4.tcp_keepalive_intvl=15
```

Enabling keepalive **on the HTTP client itself** is the more robust route, since containers often cannot change kernel parameters.

### 3. Container network MTU

Docker / Kubernetes overlay networks (flannel VXLAN and friends) commonly run an MTU of **1450** rather than 1500. Combine that with a PMTUD black hole on the path and you get the classic "small requests always fine, large responses always stuck":

```bash theme={null}
ip link show            # inspect the container interface MTU
# Probe the real usable MTU with do-not-fragment packets
ping -M do -s 1400 api.apiyi.com
```

### 4. Container memory limits → the process gets OOMKilled

A single 4K base64 payload can reach 20-30MB; loading it whole with `resp.json()` under concurrency easily exceeds the container memory limit and the kernel kills the process — **which again presents as "the connection just dropped"**:

```bash theme={null}
# Was the container OOM-killed?
dmesg -T | grep -i -E "oom|killed process"
kubectl describe pod <pod> | grep -A3 "Last State"   # look for OOMKilled
```

See "Stream the response instead of loading it whole" below for the fix.

### 5. Proxy environment variables (the sneakiest one on servers)

Servers frequently carry global `HTTP_PROXY` / `HTTPS_PROXY` / `NO_PROXY` values set in `/etc/environment`, a systemd unit, or a Dockerfile — long forgotten by whoever set them. **Worse, languages disagree about honouring them**:

| Client                                | Reads `HTTPS_PROXY` automatically?                                |
| ------------------------------------- | ----------------------------------------------------------------- |
| Python `requests` / `httpx`           | ✅ Yes, by default                                                 |
| curl                                  | ✅ Yes, by default                                                 |
| **Node.js built-in `fetch` (undici)** | ❌ **No**, requires an explicit `ProxyAgent` / `EnvHttpProxyAgent` |

That inconsistency produces genuinely confusing results: **on one machine curl and Python go through the proxy while Node connects directly** (or vice versa), so the two disagree and troubleshooting yields contradictory conclusions. Check first:

```bash theme={null}
env | grep -i -E "proxy|no_proxy"
```

APIYI is directly reachable, so on a server you generally want `api.apiyi.com` in `NO_PROXY` — or simply no proxy variables at all.

### Server-side one-shot self-check

```bash theme={null}
echo "--- proxy vars ---";  env | grep -i proxy || echo "none"
echo "--- keepalive ---";   sysctl net.ipv4.tcp_keepalive_time
echo "--- MTU ---";         ip link show | grep mtu
echo "--- fd limit ---";    ulimit -n
echo "--- DNS ---";         getent hosts api.apiyi.com
echo "--- reachability and timing ---"
curl -sS -o /dev/null -w 'connect=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer} ip=%{remote_ip}\n' \
  https://api.apiyi.com/v1/models -H "Authorization: Bearer $KEY"
```

## Node.js: three independent timeouts the SDK's `timeout` cannot reach

Node 18+'s built-in `fetch` runs on undici, which has **three independent timeouts** covering three stages of a request. "But I set my timeout to 5 minutes" usually means you changed a fourth value that is none of them:

| Error code                | Stage                                   | undici default | Controlled by     | Billed?                            |
| ------------------------- | --------------------------------------- | -------------- | ----------------- | ---------------------------------- |
| `UND_ERR_CONNECT_TIMEOUT` | Connection setup (TCP + TLS)            | **10 seconds** | `connect.timeout` | **No** (never reached the gateway) |
| `UND_ERR_HEADERS_TIMEOUT` | Waiting for the first response header   | 300 seconds    | `headersTimeout`  | Yes                                |
| `UND_ERR_BODY_TIMEOUT`    | Gap **between consecutive body chunks** | 300 seconds    | `bodyTimeout`     | Yes                                |

<Warning>
  **openai-node's `timeout` option is an AbortController-based total-request timeout and does not propagate to any of the three above.** Raising `timeout` from 60 to 300 seconds leaves `connectTimeout` at 10 seconds. The same is true of `AbortSignal.timeout()` on a bare `fetch()`.

  This is the most common reason for "my timeout is huge and it still times out" — the wrong layer was adjusted.
</Warning>

### The correct configuration

Widening undici's three timeouts requires an `Agent`, either globally or per request:

```javascript theme={null}
import { Agent, setGlobalDispatcher } from "undici";
import OpenAI from "openai";

// Image endpoints mean long silences plus MB-scale bodies — widen all three
setGlobalDispatcher(new Agent({
  connect: { timeout: 30_000 },   // connect in 30s; the default is only 10s
  headersTimeout: 300_000,        // first byte within 300s
  bodyTimeout: 300_000,           // inter-chunk gap up to 300s
}));

const client = new OpenAI({
  apiKey: process.env.APIYI_API_KEY,
  baseURL: "https://api.apiyi.com/v1",
  timeout: 300_000,   // total timeout — a different layer; set both
  maxRetries: 0,      // critical, see below
});
```

### `maxRetries` defaults to 2 and auto-retries connection errors

openai-node **defaults to `maxRetries: 2`, and both connection errors and timeouts are in scope for those automatic retries**. One logical call can therefore produce **three actual requests** even when your code contains no retry logic at all (whether each one is billed depends on which "Billing impact" category it falls into).

Image endpoints are expensive synchronous long requests, so **always set `maxRetries: 0` explicitly and own the retry logic yourself**, with your own backoff and attempt ceiling. Billing rules are in [Retry Strategy](/en/api-capabilities/image-api-best-practices#retry-strategy).

<Tip>
  Confirm which stack you are actually on first: `node -v`, `npm ls openai undici axios node-fetch`. A `UND_ERR_*` code only proves undici is underneath — it **does not prove you are using the OpenAI SDK**. A bare `fetch()` throws the same codes, and a bare `fetch()` has no `maxRetries` at all.
</Tip>

### keep-alive reusing an already-dead connection

undici enables connection pooling with keep-alive by default. When a VPN, NAT, or proxy silently reclaims an idle connection, the client never finds out and still pulls that connection from the pool for the next request — **the write immediately receives an RST, surfacing as `read ECONNRESET`**.

This is the most common source of `ECONNRESET` when calls are spaced apart, and it explains both "errors cluster inside one time window" and "even the first retry fails". Verify by disabling reuse:

```javascript theme={null}
const agent = new Agent({ pipelining: 0, keepAliveTimeout: 1_000 });
// errors disappear ⇒ it was dead-connection reuse
```

## Local proxy / VPN: the hop image endpoints expose first

<Info>
  **APIYI is directly reachable inside mainland China and needs no proxy or VPN** (see [Do I need a proxy to use the API?](/en/faq/network-proxy)). That makes **turning the proxy off and retesting the cheapest, highest-information single step** available to you.

  To be clear though: a proxy is only **the largest suspect variable**, not an established root cause. The matrix below is what actually localises the fault.
</Info>

Two properties make image endpoints far more sensitive than text ones: **30-60 seconds of zero bytes flowing during generation**, and **an MB-scale body delivered as one burst**. When chat endpoints work fine but image endpoints fail, it is usually one of these two.

<CardGroup cols={2}>
  <Card title="fake-ip / routing rule miss" icon="route-off">
    In a proxy's fake-ip mode, a rule miss routes you to an unroutable address like `198.18.x.x`, producing a **precisely 10-second** connect timeout. Note this is not "slow to connect" — there is **no route at all**, so raising `connect.timeout` will not save it. Always record the `remote_ip` actually reached.
  </Card>

  <Card title="Reclaimed as an idle connection during generation" icon="timer-off">
    Zero bytes flow for 30-60 seconds after the request goes out, and the proxy reclaims the connection under its idle policy. The signature is a **failure time landing on a round number** — 30 / 60 / 120 seconds — independent of image size.
  </Card>

  <Card title="MTU / PMTUD black hole" icon="package-x">
    The tunnel MTU is below the path MTU while ICMP "fragmentation needed" is dropped, breaking PMTUD. The classic signature is **small requests always fine, large responses always stuck**, with received bytes frozen at a few KB to a few dozen KB. Lowering the tunnel MTU to around 1400 usually fixes it.
  </Card>

  <Card title="MITM decryption plus full buffering" icon="shield-off">
    Proxies with HTTPS decryption enabled often buffer large bodies whole and may hit a size ceiling, or rewrite chunked into `Content-Length` and get the length wrong, producing an RST. Again this only hits MB-scale image responses, never text calls.
  </Card>
</CardGroup>

### The diagnostic matrix

This is the core of the section. There are only two axes: **did the failure happen before or after the first byte**, and **how many bytes arrived**.

| Observation                   | Connect timeout                    | Proxy idle reclaim             | MTU black hole       | Missing chunked terminator                                                                             |
| ----------------------------- | ---------------------------------- | ------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------ |
| TTFB (first byte)             | Never arrives                      | Never arrives                  | Arrives              | **Normal** (matches generation time)                                                                   |
| Bytes received                | 0                                  | 0                              | **0 \< N ≪ full**    | **= full, JSON parses cleanly**                                                                        |
| Time of failure               | **≈10.0s, very stable**            | Round number, size-independent | Varies               | **Disconnected +300s** after last byte; or **hangs indefinitely** (verified: still nothing after 330s) |
| Connection end state          | ConnectTimeout                     | RST                            | Hang or RST          | FIN (graceful close); or **no terminator, no FIN, connection stays open**                              |
| Billed?                       | **No** (never reached the gateway) | See "Billing impact"           | See "Billing impact" | See "Billing impact"                                                                                   |
| With `response_format: "url"` | Still fails                        | Still fails                    | **Works**            | **Works**                                                                                              |

That last row is the highest-value single test: it shrinks the body from several MB to about 1KB. **If URL mode succeeds consistently while base64 mode fails consistently, the problem scales with transfer volume**, which eliminates the first two columns outright.

<Info>
  The rightmost column (**missing chunked terminator**) has recently taken on a new form: **no terminator, no close, hanging indefinitely** — rather than the older "gracefully closed +300 seconds later." What both forms share is that **the data is already complete and the image is directly usable**, and the handling is the same: finish the response on the client side. See [Requests Hanging at the End](/en/api-capabilities/image-tail-stall).
</Info>

### One command for the full timing profile

```bash theme={null}
curl -sS -o /tmp/out.json --trace-time \
  -w '\nconnect=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer} total=%{time_total} bytes=%{size_download} code=%{http_code} ip=%{remote_ip}\n' \
  -H "Authorization: Bearer $KEY" -H 'Content-Type: application/json' \
  -d '{"model":"gpt-image-2-all","prompt":"a red cube on a white table"}' \
  https://api.apiyi.com/v1/images/generations
```

Read it against the matrix: no `connect` value → connection stage; no `ttfb` and a round `total` → idle reclaim; full `bytes` but `total ≈ ttfb + 300` plus `curl: (18)` → missing terminator; `bytes` frozen in the tens of KB → MTU.

<Warning>
  **When A/B testing proxy-on versus proxy-off, alternate the runs — never batch them.** Five proxied runs followed by five direct runs lets a **time-window fault** contaminate the result into a completely wrong conclusion; we have measured stretches where everything failed, then everything worked minutes later, then failed again. Run `proxy → direct → proxy → direct` instead, recording the `remote_ip` each time.
</Warning>

## Other common triggers

<CardGroup cols={2}>
  <Card title="Manual interruption mid-flight" icon="octagon-x">
    Ctrl+C while debugging, restarting a process, hot reload, killing a running script — every large response still in transit leaves a `write_response_body_failed` on the gateway. This is the false alarm most often misread as "the channel is unstable".
  </Card>

  <Card title="An outer timeout fires first" icon="timer-off">
    Task-queue worker timeouts, Serverless execution limits, gateway/CDN origin timeouts (commonly 60 seconds by default). Any layer shorter than the generation time cuts the connection first — see [Must-Read & Best Practices](/en/api-capabilities/image-api-best-practices#troubleshooting-timeouts-and-disconnects).
  </Card>

  <Card title="Connection pool and excessive concurrency" icon="waypoints">
    Connection pool ceilings, local file-descriptor limits, NAT/firewall silently reclaiming long-lived connections. Large responses stay open far longer, so they hit these limits much more often than text endpoints.
  </Card>

  <Card title="Response body exhausts memory" icon="memory-stick">
    A single 4K base64 payload can reach 20-30MB. Loading it all at once with `resp.json()` under concurrency can exhaust container memory and get the process OOM-killed — which again presents as "the connection dropped for no reason".
  </Card>
</CardGroup>

## Billing impact: which drops cost money and which do not

These two situations get conflated constantly, yet they bill in opposite ways:

<Info>
  ### Platform returns a 500 `write_response_body_failed` — **not billed**

  This error means the connection died while the gateway was writing image data back to you. **The platform automatically retries internally 2-3 times**, and only raises the 500 once all of them have failed.

  **No charge is produced in this case.** Even a long run of these errors on the same request leaves **no corresponding charge on your bill** — you are never paying for these failures.
</Info>

<Warning>
  ### Your client walked away early — **billed as normal**

  The other case is the gateway completing delivery while **your side** hung up first: a client timeout firing, Ctrl+C during debugging, a process restart, or an OOM kill.

  Generation on the server and upstream **has already completed**, so these are **billed as normal** — "I never got the image" does not mean "I was not charged". Hammering large image requests while troubleshooting runs up a very real bill.
</Warning>

Telling them apart is exactly the table above: **check whether the console logged a normal call or a 500 `write_response_body_failed`**.

Retry policy should stay disciplined accordingly: transport-level failures are worth retrying, but **each retry may be a separately billed call** (depending on which of the two categories it lands in). Never write an unbounded retry loop.

## How to retry correctly

The core rule: **retry only transport-level exceptions, never HTTP-level errors**. A 4xx resent ten thousand times is still a 4xx, and it wastes time.

```python theme={null}
import time
import requests

TRANSPORT_ERRORS = (
    requests.exceptions.SSLError,
    requests.exceptions.ConnectionError,
    requests.exceptions.ChunkedEncodingError,
    requests.exceptions.ReadTimeout,
)

def call_image_api(url, headers, body, timeout=360, retries=2):
    """Retry transport-level failures up to `retries` times; never retry HTTP
    4xx/5xx — hand those straight back to the caller.

    Note: each retry may be a newly billed request, so keep `retries` small.
    """
    attempts = []
    for i in range(retries + 1):
        try:
            resp = requests.post(url, headers=headers, json=body,
                                 stream=True, timeout=(10, timeout))
            raw = b"".join(resp.iter_content(chunk_size=8192))
            attempts.append({"attempt": i + 1, "status": resp.status_code})
            return resp.status_code, raw, attempts      # 4xx/5xx included
        except TRANSPORT_ERRORS as e:
            attempts.append({"attempt": i + 1, "error": repr(e)})
            if i == retries:
                raise
            time.sleep(2 + 3 * i)                       # back off 2s, then 5s
```

<Tip>
  **Record every attempt separately** (the `attempts` list above). Otherwise a successful client retry leaves nothing but a clean 200 in your logs, and you will never see how many times the transport actually broke. That data is essential when assessing channel quality, and it stops you from misreading your own retries as channel behaviour.
</Tip>

### Stream the response instead of loading it whole

For large bodies, read chunk by chunk with `stream=True`. It keeps peak memory down and shows you **exactly which stage of the transfer broke**:

```python theme={null}
resp = requests.post(url, headers=headers, json=body, stream=True, timeout=(10, 360))
chunks, total = [], 0
for chunk in resp.iter_content(chunk_size=8192):
    total += len(chunk)
    chunks.append(chunk)
raw = b"".join(chunks)
# total far below Content-Length  => the transfer broke midway
# total complete but connection stays open => upstream omitted the chunked
#   terminator, which is a channel-side problem
```

**Do not retry that second case**: the data is already complete and the image is usable as-is. For the full client-side completion code, see [Requests Hanging at the End](/en/api-capabilities/image-tail-stall).

## When it really is worth contacting support

Once you have cleared yourself, escalate if **any** of the following holds:

* It still reproduces reliably after switching to a proper OpenSSL interpreter and dropping to serial execution;
* Only **one specific channel or model** is failing while others are healthy in the same window;
* The response body **arrived complete** (byte count matches `Content-Length`) but the connection never closes until it times out — that is a missing chunked terminator upstream, a channel-side issue. **First add the client-side completion described in [Requests Hanging at the End](/en/api-capabilities/image-tail-stall) to recover the image**, then file a ticket if problems remain;
* The error is unambiguously upstream-facing (`upstream_error`, a raw upstream 5xx).

Include in your ticket: the `x-request-id`, the call time (**with timezone**, e.g. `2026-07-29 14:32 (UTC+8)`), the model name, key parameters such as `imageSize`, the raw client exception, and the self-check steps you already completed.

## Related documentation

<CardGroup cols={3}>
  <Card title="Requests Hanging at the End" icon="hourglass" href="/en/api-capabilities/image-tail-stall">
    Client-side completion for when the image has arrived but the connection never ends
  </Card>

  <Card title="Must-Read & Best Practices" icon="book-check" href="/en/api-capabilities/image-api-best-practices">
    Synchronous calls, per-model timeouts, base64 handling, disconnection billing
  </Card>

  <Card title="Build Your Own Async Queue" icon="list-checks" href="/en/api-capabilities/image-async-queue">
    Wrap synchronous calls in a task queue and absorb occasional drops with retries
  </Card>

  <Card title="Do I Need a Proxy?" icon="wifi" href="/en/faq/network-proxy">
    APIYI connects directly with no proxy; self-checks for certificate and DNS issues
  </Card>

  <Card title="Gemini Image Error Handling" icon="triangle-alert" href="/en/api-capabilities/gemini-image-error-handling">
    Error codes and finishReason handling for Gemini image generation
  </Card>

  <Card title="Error Capture" icon="clipboard-list" href="/en/api-manual/error-reporting">
    How to print these errors in full, and which fields to include in a support ticket
  </Card>
</CardGroup>
