> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# How Can I Reduce Image API Latency?

> Network optimization guidance for high-volume image generation, including client protocol version, connection reuse, and timeout settings.

## Short Answer

If you generate a very large volume of images each month and want API response latency below 360ms, switching to another route may offer limited improvement because most alternative nodes are hosted overseas and can introduce additional network latency.

Optimize on the client side and keep the default address:

```text theme={null}
https://api.apiyi.com
```

First confirm which protocol version your client actually uses, then tune connection reuse, timeouts, and retries as needed. **You do not need to switch to `http://` to get HTTP/1.1**: http/https controls encryption, while HTTP/1.1 and HTTP/2 are a separate matter. See [Is http the Same as HTTP/1.1?](/en/faq/http-vs-http11)

## Client Optimization

* **Check the protocol version**: Python (requests, httpx, OpenAI SDK) uses HTTP/1.1 by default, so no change is needed. Go, Java, OkHttp, and the built-in fetch in Node 26 and later default to **HTTP/2**. With high-concurrency image uploads, HTTP/2 packs every request onto one connection, so force HTTP/1.1 in code for these clients while keeping the https address
* Enable connection pooling and Keep-Alive to avoid creating a new connection for every request
* Increase the read timeout to cover normal image-generation time instead of using a 500ms total timeout
* Retry occasional network failures a limited number of times with backoff

<Info>
  **Treat 500ms as a target for network overhead or task submission, not as a guaranteed image-completion time.** Actual latency also depends on client location, ISP routing, concurrency, the selected image model, and upstream processing. Run tests at production-like concurrency and evaluate P95 and P99 latency before rollout.
</Info>

## Recommended Troubleshooting Order

<Steps>
  <Step title="Check the protocol version">
    Run `curl -s -o /dev/null -w "%{http_version}\n" https://api.apiyi.com/v1/models -H "Authorization: Bearer YOUR_API_KEY"` or check your client documentation to confirm whether you use HTTP/1.1 or HTTP/2.
  </Step>

  <Step title="Disable HTTP/2 if needed">
    Only clients that default to HTTP/2 (Go, Java, and so on) need this step: force HTTP/1.1 in the client and enable connection reuse. Go programs can simply set the environment variable `GODEBUG=http2client=0`.
  </Step>

  <Step title="Adjust timeouts and retries">
    Configure connection and read timeouts separately. The read timeout must cover normal image-processing time.
  </Step>

  <Step title="Run a concurrency test">
    Test with production-like concurrency and monitor P50, P95, P99 latency and failure rate.
  </Step>
</Steps>

## About the Plain-Text Endpoint on Port 16888

`http://api.apiyi.com:16888` is an officially provided plain-text endpoint with the same request paths as https. It does not make image generation faster: for clients already on HTTP/1.1 it only saves one TLS handshake. Use it only as a temporary workaround when the HTTPS handshake itself fails, or inside a trusted internal network or private line.

<Warning>
  HTTP does not provide TLS encryption. Your API key and request content are transmitted in plain text. Use this endpoint only on a trusted network or through a properly configured private line or tunnel. Do not call it directly over a public network.
</Warning>

## Related Documentation

* [Is http the Same as HTTP/1.1?](/en/faq/http-vs-http11)
* [Do I Need a Proxy to Use the API?](/en/faq/network-proxy)
* [API Manual](/en/api-manual)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.