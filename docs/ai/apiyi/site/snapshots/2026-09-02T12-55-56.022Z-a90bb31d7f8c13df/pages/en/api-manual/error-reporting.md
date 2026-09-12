> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Capturing API Error Details

> APIYI returns error details in the API response body only — the backend log is a billing ledger and records billed calls only. This page covers why you must print the raw error yourself, correct capture patterns for Python / Node.js / cURL, how to get raw output from wrappers like ComfyUI, the 7 fields to keep, and a copy-paste support-ticket template.

<Warning>
  ### First things first: the raw error appears exactly once, in the response body

  APIYI returns error details **only through the API response body**. The backend log is a **billing ledger** — it records calls that produced a charge. Failed requests are neither billed nor listed there.

  So "I can't find it in the backend log" does not mean "it didn't happen." It means **the only record of that error lives in your client**. If you didn't print it and persist it, it is gone for good — and we can't recover it either.
</Warning>

<Info>
  **One-line takeaway**: print the **raw response body** exactly as returned; don't keep only the one-line string your program wrapped it into. A string like `400 Bad Request` contributes almost nothing to diagnosis — the real answer is in the JSON it discarded.
</Info>

## A real case: 400 Bad Request tells you nothing

A customer reported exactly one line:

```text theme={null}
apiyi GPT Image 2 2k: 400 Bad Request from POST https://api.apiyi.com/v1/images/edits
```

That string is **what the client framework produced after wrapping the error**. It preserved the model name, HTTP method, URL and status code — and threw away the one thing that mattered, the **response body**. The best answer support could give was:

> A 400 is usually either content safety or a parameter problem. Most likely content safety.

That is a **guess**, not a conclusion. Because for that very same call, the actual response body could have been any of the following three — and each calls for a completely different action:

| `error.message` in the response body             | Real cause                                                                                                        | What you should do                                                                                                                  |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `Your request was rejected by the safety system` | Upstream content-safety block                                                                                     | Change the prompt or the reference image. **Do not retry** — it will be blocked again. See [Content safety](/en/faq/content-safety) |
| `Invalid value for 'size': expected one of ...`  | Invalid enum value in a parameter                                                                                 | A code-level bug. Fix the parameter; retrying is pointless                                                                          |
| `invalid_image_file` / `Invalid input image`     | The reference image itself is invalid (e.g. a `.jpg` from some Android phones is actually a multi-frame MPO file) | Re-encode it with Pillow or similar, then resend. See [Image API essentials](/en/api-capabilities/image-api-best-practices)         |

<Warning>
  **Same 400, three completely different actions.** Discarding the response body turns a three-way decision into guesswork — and a wrong guess costs a round trip of support messages plus a retry you never needed.

  Worse: **two of those three cases should never be retried at all.** If you can't tell them apart, blind retrying is your only option, burning both time and quota.
</Warning>

## What the backend log does and doesn't have

The mental model to get right first: **the backend log is a billing ledger, not an error log.**

| What you're looking for                         | Backend [log page](https://api.apiyi.com/log)    | API response                         |
| ----------------------------------------------- | ------------------------------------------------ | ------------------------------------ |
| Amount billed for this call                     | Yes                                              | No (`usage` gives token counts only) |
| Token usage                                     | Yes                                              | Yes (`usage` field)                  |
| Model name, call time                           | Yes (successful calls only)                      | You must record it yourself          |
| `request_id`                                    | Yes (successful calls only)                      | `x-request-id` response header       |
| **Error code and raw error message**            | **No**                                           | **Only source**                      |
| **The upstream's specific reason for refusing** | **No**                                           | **Only source**                      |
| The failed call itself                          | **Not listed** (no charge means no ledger entry) | —                                    |

<Tip>
  **Read it in reverse and it becomes the strongest single test for connection problems**: if the log **does** contain a billing entry, the request reached the upstream and consumed resources; if it **doesn't**, the problem almost certainly occurred before reaching the upstream (network, authentication, parameter validation). Full details in [Reading billed amounts in the log](/en/faq/log-billing-explained).
</Tip>

## The 7 fields you must keep

This is everything needed to diagnose one failed call. Missing any of them degrades diagnosis back into guesswork:

| Field                                  | How to get it                                                         | What breaks without it                                                                                                            |
| -------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **HTTP status code**                   | `resp.status_code` / `err.status`                                     | You can't tell a rejected request (4xx) from a server fault (5xx) from a connection that was never established (no status at all) |
| **Full response body**                 | `resp.text` / `await resp.text()`                                     | **The critical one** — the actual cause lives here. Lose it and all you can do is guess                                           |
| **`x-request-id` response header**     | `resp.headers.get("x-request-id")`                                    | Support can't pin down that exact call and has to search a fuzzy time window instead                                              |
| **Call time, with timezone**           | Record it client-side, e.g. `2026-08-03 15:44 (UTC+8)`                | Our customers are worldwide; a timestamp without a timezone can't be aligned against logs                                         |
| **Model name + endpoint path**         | From your own request                                                 | The same model behaves differently across endpoints (`/v1/images/edits` vs `/v1/chat/completions`)                                |
| **Key request parameters**             | `size`, `quality`, reference-image count and size, `max_tokens`, etc. | Parameter issues can't be reproduced; for image issues you can't tell whether the asset itself is at fault                        |
| **Raw client exception + retry count** | `repr(e)`, and one log line per attempt                               | After a retry succeeds, your log shows a single clean 200 and you never see how many times the transport actually failed          |

<Note>
  **Don't truncate the response body.** Truncating to 200 characters is reasonable for routine business logs, but for diagnosis the useful detail is often at the end. Keep at least the first 2000 characters. If you're worried about base64 flooding your logs on image endpoints, print the full body only when `status_code >= 400` — error bodies are short anyway.
</Note>

## Correct error-capture patterns

There is really only one principle: **catch at two layers, and discard nothing at either layer.**

* **Transport-layer failures**: connection reset, TLS handshake failure, timeout, DNS failure. There is **no HTTP response at all** — the exception text is all you get.
* **HTTP-layer errors**: the server returned 4xx / 5xx. There **is** a response body, and you must read it.

### Python / requests

```python theme={null}
import time
import requests

BASE_URL = "https://api.apiyi.com/v1"
API_KEY = "sk-your-api-key"          # read from an environment variable in production


def call_and_log(path, payload, timeout=300):
    started = time.strftime("%Y-%m-%d %H:%M:%S %z")      # includes timezone
    try:
        resp = requests.post(
            f"{BASE_URL}{path}",
            headers={"Authorization": f"Bearer {API_KEY}"},
            json=payload,
            timeout=timeout,
        )
    except requests.exceptions.Timeout as exc:
        # Transport layer: timed out, no HTTP response to read
        raise RuntimeError(f"[{started}] timed out after {timeout}s: {exc!r}") from exc
    except requests.exceptions.RequestException as exc:
        # Transport layer: connection reset, SSL error, DNS failure — still no body
        raise RuntimeError(f"[{started}] transport failure: {exc!r}") from exc

    if resp.status_code >= 400:
        # The point: pass the body through verbatim, don't reword it here
        raise RuntimeError(
            f"[{started}] HTTP {resp.status_code} {path} "
            f"model={payload.get('model')}\n"
            f"x-request-id: {resp.headers.get('x-request-id')}\n"
            f"{resp.text}"
        )
    return resp.json()
```

<Warning>
  **Don't call `raise_for_status()` before reading the body.** The `HTTPError` it raises carries only `400 Client Error: Bad Request for url: ...`, while the real message sits untouched in `resp.text` with nobody reading it — which is one of the ways the case at the top of this page happens. If you do use it, pull `resp.text` out first.
</Warning>

### Python / OpenAI SDK

The official SDK already attaches all three pieces to the exception object. Most people just `print` their own one-line message instead:

```python theme={null}
from openai import OpenAI, APIStatusError, APIConnectionError

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1",
    max_retries=3,      # built-in exponential backoff for 429 / 5xx / connection errors
    timeout=60.0,
)

try:
    resp = client.chat.completions.create(
        model="gpt-5.4",
        messages=[{"role": "user", "content": "Hello"}],
    )
except APIStatusError as e:
    # Server returned 4xx/5xx: status, request-id and body are all right here
    print("status code :", e.status_code)
    print("request-id  :", e.request_id)
    print("raw body    :", e.response.text)
    raise
except APIConnectionError as e:
    # No HTTP response: connection reset, timeout, local proxy failure
    print("transport   :", repr(e), "|", repr(e.__cause__))
    raise
```

<Tip>
  Even a one-liner should be `print(f"API error: {e}")` rather than `print("request failed")` — the SDK exception's `str(e)` **already contains the server's message**. What actually destroys information is throwing the exception object away entirely.
</Tip>

### Node.js

With the SDK:

```javascript theme={null}
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: 'sk-your-api-key',
  baseURL: 'https://api.apiyi.com/v1',
});

try {
  const resp = await client.images.edit({ /* ... */ });
} catch (err) {
  if (err instanceof OpenAI.APIError) {
    // Server returned 4xx/5xx
    console.error('status code :', err.status);
    console.error('request-id  :', err.requestID);
    console.error('raw body    :', JSON.stringify(err.error));
  } else {
    // Transport layer: ECONNRESET, UND_ERR_*, etc. — no HTTP response
    console.error('transport   :', err.code, err.message, err.cause);
  }
  throw err;
}
```

With plain `fetch`, **this is where it most often goes wrong**:

```javascript theme={null}
const resp = await fetch('https://api.apiyi.com/v1/images/edits', {
  method: 'POST',
  headers: { Authorization: 'Bearer sk-your-api-key' },
  body: form,
});

if (!resp.ok) {
  const raw = await resp.text();        // read the body first, then throw
  throw new Error(
    `HTTP ${resp.status} ${resp.url}\n` +
    `x-request-id: ${resp.headers.get('x-request-id')}\n${raw}`
  );
}
```

<Warning>
  That `400 Bad Request from POST https://api.apiyi.com/v1/images/edits` at the top of this page is literally `${resp.status} ${resp.statusText} from ${resp.method} ${resp.url}` — **the body was never read at all**.

  `fetch` does **not** reject on HTTP-level errors; it just sets `resp.ok` to `false`. Throwing `resp.statusText` at that moment discards the body along with the response object. **Always `await resp.text()` before you throw** — that single line is the difference between a diagnosable report and an unanswerable one.
</Warning>

### Reproducing with cURL

When you ask someone to reproduce an issue, this command is the least effort — it surfaces status code, headers, body and timing in one shot:

```bash theme={null}
curl -i -sS -X POST https://api.apiyi.com/v1/images/edits \
  -H "Authorization: Bearer sk-your-api-key" \
  -F "model=gpt-image-2" \
  -F "image=@input.png" \
  -F "prompt=replace the background with plain white" \
  -w '\n---\nHTTP %{http_code}  total %{time_total}s\n'
```

* `-i` prints response headers, which is where `x-request-id` lives;
* `-sS` hides the progress bar but keeps error output;
* `-w` appends the status code and total time, handy for comparing against your timeout settings.

## Wrappers and in-house gateways

### A good example

This error came from a customer's ComfyUI node:

```text theme={null}
Upstream HTTP 0: OpenSSL SSL_read: Connection was reset, errno 10054
```

It is far uglier than `400 Bad Request` — and yet it is **complete**, so the direction is settled in seconds:

| Fragment                         | Meaning                                                                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HTTP 0`                         | No HTTP response was received at all. `0` is a pseudo status code meaning not even the status line arrived — this is not a 400/500-style business error |
| `SSL_read: Connection was reset` | The connection was cut by the peer or a middlebox during the TLS read phase                                                                             |
| `errno 10054`                    | Windows `WSAECONNRESET`, equivalent to `ECONNRESET` on Linux — a TCP RST was received                                                                   |

The conclusion follows immediately: this is a **transport-layer** problem, unrelated to content safety or parameters, and it produces no charge (the request never completed). Troubleshooting path: [Image API connection drops](/en/api-capabilities/image-connection-drops).

<Info>
  **Compare the two**: one is neatly packaged and explains nothing (`400 Bad Request`); the other is long and ugly and points straight at the root cause (`errno 10054`). **For diagnosis, a raw, ugly, complete error beats a friendly, tidy, rewritten one every time.**
</Info>

### Where to find the raw output in common tools

| Tool                   | Where the raw error is                                                                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ComfyUI                | The red text on the node is usually truncated; the full stack trace is in **the terminal window you launched ComfyUI from**, or in `comfyui.log` in the install directory |
| Dify / Coze / n8n      | Open the run record, expand that node's execution detail, and read the raw HTTP response rather than the node's error summary                                             |
| LangChain / LlamaIndex | Catch `openai.APIStatusError` instead of a bare `Exception` — see the SDK pattern above                                                                                   |
| Desktop clients        | Enable the debug / developer log in settings, or reproduce once with `curl`                                                                                               |

### Three rules for an in-house gateway

<Steps>
  <Step title="Pass through, never rewrite">
    A middle layer may **append** context (which service, which tenant, which retry attempt), but it must not **replace** the upstream `error.message`. Once rewritten, there is no second place to recover the original from.
  </Step>

  <Step title="Store the user-facing message separately from the raw one">
    Follow the three-part structure used in [Gemini image error handling](/en/api-capabilities/gemini-image-error-handling): `userMessage` (friendly copy for end users), `devMessage` (your classification for developers), and `rawResponse` (the response body, unmodified). Polish the first two freely; store the third verbatim.
  </Step>

  <Step title="Never emit an unknown error">
    In your fallback branch, record `status`, `x-request-id` and the first 2000 characters of the body. An "unclassified error" that carries the original text is diagnosable; a clean "unknown error" is not.
  </Step>
</Steps>

## Anti-patterns that make diagnosis impossible

* `except Exception as e: print("request failed")` — the exception object is gone, and you don't even know which layer failed;
* Recording the status code but not the body — exactly the case at the top of this page;
* Calling `raise_for_status()` without reading `resp.text` first — the message is still in memory, just never retrieved;
* `if (!resp.ok) throw new Error(resp.statusText)` in `fetch` — the body is discarded with the response object;
* Leaving only a clean 200 after a successful retry — **log every attempt separately**, otherwise you never see how many times the transport failed, and you may mistake your own retries for gateway behavior;
* Logging to stdout only, or rotating daily with overwrite — by the time a customer reports the problem, the original record has usually scrolled away;
* Reporting an issue with a phone photo of the screen — paste the **text** instead; screenshots regularly cut off half a line of the error.

## When to contact support

Work through the capture and interpretation steps above first. If **any** of the following holds, bring your material to support:

* You have the full response body and `error.message` points upstream (`upstream_error`, a raw upstream 5xx, or an explicit channel error);
* The same request parameters **work on a different model or at a different time**, and only one specific model fails consistently;
* The error is `500` + `write_response_body_failed` or a similar downstream-delivery failure, and it **reproduces consistently** (these are not billed; see [Connection drops](/en/api-capabilities/image-connection-drops));
* You suspect billing doesn't match your actual calls — `request_id` is the only anchor that reconciles precisely.

### Support ticket template (copy-paste)

```text theme={null}
[Summary]      gpt-image-2 image edit endpoint consistently returns 400
[Endpoint]     POST https://api.apiyi.com/v1/images/edits
[Model]        gpt-image-2
[Call time]    2026-08-03 15:44 (UTC+8)
[request-id]   copy from the x-request-id response header
[HTTP status]  400
[Raw body]
{"error":{"message":"...","type":"...","code":"..."}}
[Key params]   size=2048x2048, quality=high, 1 reference image / 3.2 MB / PNG
[Reproduction] 5 consecutive calls, 5 failures; works again with a different reference image
[Already checked] key valid, balance sufficient, same key works on text models
```

<Card title="WeCom Support" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeCom support QR code" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

  Scan the code, or click this card to reach WeCom support.

  You can also reach us on Telegram at `@apiyi001` or by email at `hi@apiyi.com`.
</Card>

<Tip>
  Send the template above **as text** — it is far more efficient than any description. With a `request_id` we can go straight to the full trace of that single call, instead of asking "roughly what time, and which model?" See [How to view my call records](/en/faq/call-logs) for how to look up `request_id`.
</Tip>

## Related documentation

<CardGroup cols={3}>
  <Card title="API Manual" icon="book" href="/en/api-manual">
    Common error codes, authentication and rate limits
  </Card>

  <Card title="Connection drops" icon="unplug" href="/en/api-capabilities/image-connection-drops">
    Full troubleshooting path for `ECONNRESET`, `errno 10054` and SSL EOF
  </Card>

  <Card title="View call records" icon="file-text" href="/en/faq/call-logs">
    Check each call in the console log page — how to find `request_id` and reconcile billing
  </Card>

  <Card title="Reading billed amounts" icon="receipt" href="/en/faq/log-billing-explained">
    Why failed calls never reach the log, and how to use that as a diagnostic test
  </Card>

  <Card title="Timeout configuration" icon="hourglass" href="/en/faq/timeout-configuration">
    Timeout tiers per model type, and what to check when raising it doesn't help
  </Card>

  <Card title="Image API essentials" icon="book-check" href="/en/api-capabilities/image-api-best-practices">
    Synchronous calls, base64 prefix differences, `400 invalid_image_file` preprocessing
  </Card>
</CardGroup>
