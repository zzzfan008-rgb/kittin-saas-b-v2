> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Is http the Same as HTTP/1.1?

> http/https controls encryption; HTTP/1.1 and HTTP/2 control how a connection carries requests. They are different things. Most users should just use https://api.apiyi.com.

## Short Answer

**No.** `http://` versus `https://` decides **whether traffic is encrypted**. HTTP/1.1 versus HTTP/2 is the **protocol version**, which decides how requests travel over a connection. Any combination of the two is possible.

Almost every user should simply use this address and change nothing:

```text theme={null}
https://api.apiyi.com
```

## Two Separate Dimensions

| Dimension | What it decides | Values |
| - | - | - |
| `http://` or `https://` | Whether traffic is encrypted (TLS or not) | Plain text / encrypted |
| HTTP/1.1 or HTTP/2 | How requests travel over one connection | HTTP/1.1: one request at a time per connection, so concurrency means more connections<br />HTTP/2: many requests share one connection (multiplexing) |

The protocol version is **negotiated between client and server when the connection is set up**. It is not determined by how the URL is written. APIYI's `https://` endpoint supports both HTTP/1.1 and HTTP/2 and uses whichever your client supports.

So the common belief that "http means HTTP/1.1 and https means HTTP/2" is a misunderstanding:

* For `http://` addresses, mainstream clients do almost always use HTTP/1.1, but that is a coincidence of outcome
* For `https://` addresses, some clients use HTTP/1.1 and others use HTTP/2, depending on the client itself

## Default Version of Common Clients (over https)

| Client | Default version |
| - | - |
| Python `requests`, `httpx`, OpenAI Python SDK | HTTP/1.1 |
| Node.js `axios` | HTTP/1.1 |
| Node.js built-in `fetch`, OpenAI Node SDK | Node 25 and earlier: HTTP/1.1; **Node 26 and later negotiate HTTP/2 by default** |
| Go standard library `net/http` (used by gateways such as new-api and one-api) | HTTP/2 |
| Java `HttpClient`, OkHttp | HTTP/2 |
| curl, browsers | HTTP/2 |

To check which version you actually use, run curl:

```bash theme={null}
curl -s -o /dev/null -w "%{http_version}\n" https://api.apiyi.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
# 2 means HTTP/2, 1.1 means HTTP/1.1
```

## Which Address Should I Use?

<Steps>
  <Step title="End users: use https and change nothing">
    Individuals and companies calling the API directly should use `https://api.apiyi.com`. Common SDKs for Python, Node, and other languages work well as they are, with no protocol tuning needed.
  </Step>

  <Step title="Go / Java clients with high-concurrency image uploads: keep https, disable HTTP/2 in the client">
    HTTP/2 puts many concurrent requests on a single connection. When you upload images of several MB, one hiccup on that connection slows every request on it. If your client defaults to HTTP/2 and you run high-concurrency image generation or editing, switch the client to HTTP/1.1. **Keep the https address; you do not need to switch to http.**
  </Step>

  <Step title="http://api.apiyi.com:16888: fallback only">
    This is an officially provided plain-text endpoint. Use it only as a temporary workaround when the HTTPS handshake itself fails (for example, [Python Raises SSLEOFError but curl Works?](/en/faq/openssl-pq-handshake-eof)), or inside a trusted internal network or private line.
  </Step>
</Steps>

<Warning>
  `http://` is not encrypted. Your API key, prompts, and images cross the public network in plain text, visible to any network device along the way. Do not rely on the plain-text endpoint as a long-term production setup.
</Warning>

### How to Switch a Go Client to HTTP/1.1

The no-code option is to set an environment variable for the process. This suits ready-made gateway programs such as new-api and one-api:

```bash theme={null}
GODEBUG=http2client=0
```

In your own code, set `Transport.TLSNextProto` to a non-nil empty map:

```go theme={null}
import (
    "crypto/tls"
    "net/http"
)

tr := &http.Transport{
    // A non-nil empty map disables HTTP/2, so https requests use HTTP/1.1
    TLSNextProto:        map[string]func(string, *tls.Conn) http.RoundTripper{},
    MaxIdleConnsPerHost: 100,
}
client := &http.Client{Transport: tr}
```

## Common Misconceptions

<AccordionGroup>
  <Accordion title="Is http:// faster?">
    For clients that already use HTTP/1.1, such as Python and Node, switching to http only saves one TLS handshake (a fraction of a second). That is negligible next to image generation times of tens of seconds, and it costs you encryption.
  </Accordion>

  <Accordion title="Do I have to switch to http:// to turn off HTTP/2?">
    No. HTTP/2 is turned off in the client; see the Go example above. Other languages have similar switches. After that, keep using `https://api.apiyi.com` and you get HTTP/1.1 with encryption.
  </Accordion>

  <Accordion title="Is HTTP/2 bad?">
    No. For browsers and ordinary text chat, where requests are small and numerous, HTTP/2 connection reuse saves resources. A single multiplexed connection only becomes a bottleneck when high concurrency combines with large request or response bodies.
  </Accordion>
</AccordionGroup>

## Related Documentation

* [How to Configure Base URL?](/en/faq/base-url-config)
* [How Can I Reduce Image API Latency?](/en/faq/image-api-network-latency-optimization)
* [Python Raises SSLEOFError but curl Works?](/en/faq/openssl-pq-handshake-eof)
* [Script Gets 502 but Nothing in the Call Logs?](/en/faq/proxy-empty-502)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.