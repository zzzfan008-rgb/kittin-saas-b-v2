> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# How Can I Reduce Image API Latency?

> Network optimization guidance for high-volume image generation, including the HTTP endpoint, HTTP/1.1, connection reuse, and timeout settings.

## Short Answer

If you generate a very large volume of images each month and want API response latency below 360ms, switching to another route may offer limited improvement because most alternative nodes are hosted overseas and can introduce additional network latency.

First, test replacing the original root URL:

```text theme={null}
https://api.apiyi.com
```

with the following HTTP endpoint:

```text theme={null}
http://api.apiyi.com:16888
```

Keep the request path unchanged. For example, replace `https://api.apiyi.com/v1/images/generations` with `http://api.apiyi.com:16888/v1/images/generations`.

<Warning>
  HTTP does not provide TLS encryption. Your API key and request content are transmitted in plain text. Use this endpoint only on a trusted network or through a properly configured private line or tunnel. Do not call it directly over a public network.
</Warning>

## Client Optimization

Some API gateways have unstable HTTP/2 behavior during persistent or streaming connections, which can cause interrupted transfers or additional retries. Configure a custom HTTP client to:

* Force **HTTP/1.1** and disable HTTP/2
* Enable connection pooling and Keep-Alive to avoid creating a new connection for every request
* Increase the read timeout to cover normal image-generation time instead of using a 500ms total timeout
* Retry occasional network failures a limited number of times with backoff

<Info>
  **Treat 500ms as a target for network overhead or task submission, not as a guaranteed image-completion time.** Actual latency also depends on client location, ISP routing, concurrency, the selected image model, and upstream processing. Run tests at production-like concurrency and evaluate P95 and P99 latency before rollout.
</Info>

## Recommended Troubleshooting Order

<Steps>
  <Step title="Switch to the HTTP endpoint">
    Replace the root URL with `http://api.apiyi.com:16888` while keeping the existing API path and authentication method.
  </Step>

  <Step title="Disable HTTP/2">
    Force HTTP/1.1 in your client and enable connection reuse.
  </Step>

  <Step title="Adjust timeouts and retries">
    Configure connection and read timeouts separately. The read timeout must cover normal image-processing time.
  </Step>

  <Step title="Run a concurrency test">
    Test with production-like concurrency and monitor P50, P95, P99 latency and failure rate.
  </Step>
</Steps>

## Related Documentation

* [Do I Need a Proxy to Use the API?](/en/faq/network-proxy)
* [API Manual](/en/api-manual)
