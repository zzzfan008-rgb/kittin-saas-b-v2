> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Image Calls Drop After About 90 Seconds Behind a Proxy?

> When you develop locally with a VPN or proxy on, image requests drop in batches after 90-180 seconds no matter how long your timeout is, and they are still billed. The proxy is closing connections that carry no data. Route api.apiyi.com directly to fix it.

## Symptoms

You are developing or debugging an image generation app on your own computer, with a VPN or proxy client running (many developers keep one on so their AI coding tools can reach the internet). You see the following:

* Image requests often fail with connection errors such as `socket hang up`, `ECONNRESET`, `RemoteDisconnected`, or `Connection aborted`
* Your client timeout is 600 or even 900 seconds, yet requests drop after about **90-180 seconds**
* Several requests often **fail at the same moment**, as if cut off together
* Slower models are hit more often (for example `gpt-image-2-vip`, which usually takes 60-120 seconds per image)
* In the [call logs](/en/faq/call-logs), **most of these requests show as successful and billed**

## Short Answer

<Info>
  **This is not a concurrency limit and not an APIYI timeout. The proxy on your computer is closing connections that have carried no data for a while.**

  While an image is being generated, no data flows on the connection at all. The longer the image takes, the more likely the proxy treats the connection as idle and closes it. Route `api.apiyi.com` directly (bypassing the proxy) and the problem goes away. APIYI is reachable directly from mainland China.
</Info>

## Why It Happens

A non-streaming image request has three phases:

1. **Upload**: the prompt and reference images are sent, taking a few seconds to a few tens of seconds
2. **Wait**: the server generates the image, usually 60-200 seconds. **No data flows on the connection during this time**
3. **Download**: the finished image is returned in one go

The problem is phase 2. To free up resources, proxy clients and proxy servers give every connection an idle timeout: if no data moves in either direction for that long, the connection is closed. In the widely used Xray / V2Ray core, the setting is `connIdle`, with a default of 300 seconds, but **the proxy server operator can set it much lower**, and you can neither see nor change that from your computer. In the case we investigated, the value was about 90 seconds.

As a result:

* **Your client timeout cannot help.** The timeout only says how long your program is willing to wait. The proxy in the middle closes first, and your program just sees a dropped connection
* **Why they fail in batches**: the proxy usually sweeps on a timer and closes every connection that has been idle too long at once, so several requests waiting on images fail in the same second
* **Why chat and coding tools are fine**: streaming chat keeps sending data, so the connection is never idle. Image generation sends nothing for minutes

<Warning>
  **Dropped requests are usually still billed.** The request has already reached APIYI and generation has started. Disconnecting does not stop it, so the image is generated and billed as usual, but the result never reaches your program. Check the [call logs](/en/faq/call-logs) for the actual charges instead of counting your program's errors.
</Warning>

## How to Confirm

<Steps>
  <Step title="Check the timing">
    Log how long each failed request ran before the error. If the durations cluster around a fixed value (such as 90 or 180 seconds), and several requests often fail in the **same second**, a proxy idle timeout is almost certainly the cause.
  </Step>

  <Step title="Compare with the call logs">
    Look up the same time window in the [call logs](/en/faq/call-logs). If your program reported a disconnect but the log shows a successful, billed request, APIYI finished the image and the connection back to you was cut.
  </Step>

  <Step title="Run a small batch with a direct route">
    Route `api.apiyi.com` directly as described below and run 10-20 images with the same parameters. If the drops disappear, the proxy was the cause.
  </Step>
</Steps>

## How to Fix It

<Tabs>
  <Tab title="Direct rule in the proxy client (recommended)">
    Add a direct rule for APIYI in your proxy client. Everything else still goes through the proxy, so your AI coding tools are unaffected.

    For Clash / Clash Verge / mihomo, add this at the top of `rules` in the config file:

    ```yaml theme={null}
    rules:
      - DOMAIN-SUFFIX,apiyi.com,DIRECT
      # ... your existing rules
    ```

    For v2rayN and similar clients, add `apiyi.com` to the direct list under routing settings.

    <Note>
      In **TUN mode or global mode**, the proxy captures traffic from every program on the computer, and nothing in your code can bypass it. A direct rule like this is the only fix.
    </Note>
  </Tab>

  <Tab title="Bypass the proxy in your program">
    If the proxy is only a system proxy or an environment variable proxy (TUN mode is off), your program can skip it:

    ```bash theme={null}
    # Set before running your program so APIYI domains bypass the proxy
    # macOS / Linux
    export NO_PROXY="api.apiyi.com,.apiyi.com"
    # Windows PowerShell
    $env:NO_PROXY="api.apiyi.com,.apiyi.com"
    ```

    * **Python `requests` / `httpx`**: these read the system proxy automatically. Set `trust_env=False` to turn that off; see [Script Gets 502 but Nothing in the Call Logs?](/en/faq/proxy-empty-502) for code
    * **Node.js**: the built-in `fetch` does not read the system proxy by default. If you use `HTTPS_PROXY` with `ProxyAgent`, `global-agent`, or similar libraries, exclude `api.apiyi.com`. With `axios`, pass `proxy: false` on the request
  </Tab>

  <Tab title="If you must use the proxy">
    Only a self-hosted proxy server lets you change its settings. Raise its idle timeout above 600 seconds (in Xray / V2Ray this is `policy.levels.<level>.connIdle`). If someone else runs the server, you cannot change it, so a direct route is still the better option.
  </Tab>
</Tabs>

## Will This Happen After Deploying to a Server?

**Usually not.** Servers normally run without a proxy and connect to APIYI directly, so there is no proxy closing idle connections. This is also the recommended production setup: a cloud server in mainland China can reach `api.apiyi.com` directly.

If there are other layers between your server and APIYI, they have idle timeouts too. Check them when you deploy:

| Layer | Common default | Notes |
| - | - | - |
| Cloud NAT gateway / load balancer | Azure: 4 minutes; AWS NAT gateway: 350 seconds | Only applies when the server has no public IP and goes out through NAT; most can be raised in the console |
| Your own Nginx reverse proxy | `proxy_read_timeout` defaults to 60 seconds | If you put Nginx between your service and APIYI, you must raise it; see [How do I avoid API timeouts?](/en/faq/timeout-configuration) |
| A proxy installed on the server | Depends on its config | Same problem as local development; route APIYI directly |

A single image usually finishes within 60-200 seconds, below the cloud NAT defaults. You only need extra work if you added your own reverse proxy or the server also goes through a proxy.

## FAQ

<AccordionGroup>
  <Accordion title="Does enabling TCP keepalive help?">
    It helps with cloud NAT gateways, because keepalive probes tell the NAT the connection is still alive. It does almost nothing against proxy clients, which judge idleness by actual data, and keepalive probes do not count as data. For the local development case, a direct route is still the fix.
  </Accordion>

  <Accordion title="Why do the web console and my AI coding tools work fine?">
    Their requests either return quickly or stream output continuously, so the connection is never idle for 90 seconds or more. Only requests like image generation, which send nothing for minutes and then return everything at once, run into this.
  </Accordion>

  <Accordion title="Is this the same as the empty 502 issue?">
    Both are caused by a local proxy, but the symptoms differ. In the [empty 502 case](/en/faq/proxy-empty-502), the proxy makes up a 502 with no body. Here, the connection is cut while waiting for the image, and your program sees a dropped connection. The fix is the same for both: keep APIYI requests off the proxy.
  </Accordion>

  <Accordion title="Can charges for dropped requests be refunded?">
    These drops happen on the proxy between you and APIYI, after APIYI has already generated and billed the image. If the amount is significant, send the time window (with time zone, such as 16:30-17:00 (UTC+8)) and your username to support, and we will check the call logs with you.
  </Accordion>

  <Accordion title="Is there a way to call without waiting this long?">
    Image endpoints currently return synchronously, with no task ID polling; see [Is There an Async Image API? Can I Query Results by Task ID?](/en/faq/image-async-api). Once APIYI is routed directly, the long wait itself is not a problem.
  </Accordion>
</AccordionGroup>

## Related Docs

<CardGroup cols={2}>
  <Card title="Script Gets 502 but Nothing in the Call Logs?" icon="unplug" href="/en/faq/proxy-empty-502">
    An empty 502 made up by your local proxy; bypass the system proxy to fix it
  </Card>

  <Card title="Do I Need a Proxy to Use the API?" icon="wifi" href="/en/faq/network-proxy">
    Direct access from mainland China, no proxy or VPN needed
  </Card>

  <Card title="How do I avoid API timeouts?" icon="timer" href="/en/faq/timeout-configuration">
    Timeout settings and layer-by-layer troubleshooting
  </Card>

  <Card title="Is There an Async Image API?" icon="clock" href="/en/faq/image-async-api">
    Why responses are synchronous, and how to wrap them asynchronously
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.