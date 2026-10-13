> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# CDN Image/Video Downloads Slow or Timing Out — What to Do?

> The image API succeeded, but downloading the returned URL is slow or hits Read timed out? Self-check commands (including Windows), a hardened download pattern, and what to send us.

## Quick Answer

Most images and videos generated through APIYI (Veo 3.1, Sora, Nano Banana, gpt-image-2-vip, etc.) are returned as URLs hosted on global CDNs such as Cloudflare. Slow or timed-out downloads usually come from one of two places:

* **The network path from your server to the CDN**: servers in mainland China reaching overseas CDNs are affected by cross-border bandwidth, ISP routing, and local DNS
* **The storage side**: when the storage nodes behind the CDN slow down, every route can be affected

Both look almost identical in your program's error log, and a test from a single machine rarely tells them apart. **Run the self-check steps below and send us the results** — we'll correlate them with the storage side. It saves both of us a lot of back-and-forth.

<Info>
  **Key point**

  Cloudflare R2 resource URLs typically look like `*.r2.cloudflarestorage.com` or a custom domain proxied through Cloudflare. Download speed depends on how efficiently your server can reach the nearest Cloudflare edge node.
</Info>

## The API Succeeded, but the Image Won't Download?

Image generation happens in two stages:

1. Your program calls the APIYI API, the image is generated, and a URL is returned
2. Your program downloads the image from that URL

Stage 2 goes **directly from your server to the image storage host and does not pass through the APIYI gateway**. That is why:

* The APIYI log shows the request as **successful and billed** — the image really was generated
* Your program reports errors like `Read timed out` or `Connection reset`, and the host in the error is the **image domain**, not `api.apiyi.com`
* `Read timed out` means the connection was established but no data arrived for a long time. It is not the same as "cannot connect", and on its own it doesn't tell you which side is at fault

<Tip>
  **You can re-download the same URL while it's valid** (48 hours for gpt-image-2-vip, for example). A failed download **does not require regenerating the image** — just retry the download. See "Option 2" below for the code pattern.
</Tip>

<Warning>
  **Check your alert messages**: report `api.apiyi.com` when the API call fails, and report the image domain plus "generation succeeded" when the download fails. Mixing the two makes download problems look like API outages.
</Warning>

## Common Causes

<CardGroup cols={2}>
  <Card title="Cross-border congestion" icon="network">
    Servers in mainland China reaching overseas CDNs often hit congestion on international egress during peak hours, causing slowness or timeouts.
  </Card>

  <Card title="Suboptimal ISP routing" icon="route">
    Some cloud providers route international traffic through the US West or Europe, adding tens of milliseconds of unnecessary latency.
  </Card>

  <Card title="Poor DNS resolution" icon="globe">
    Local DNS may resolve Cloudflare hostnames to a distant edge (e.g., US West) instead of the nearest APAC node.
  </Card>

  <Card title="Firewall / security group limits" icon="shield">
    Some servers restrict outbound traffic to overseas IP ranges, port 443, or specific CDN domains, degrading connection quality.
  </Card>

  <Card title="HTTP/2 & connection reuse" icon="plug">
    Clients without HTTP/2 or connection reuse pay the TCP/TLS handshake cost for every file.
  </Card>

  <Card title="Single-threaded download" icon="gauge">
    Serial single-threaded downloads can't benefit from CDN multiplexing; throughput stays low.
  </Card>
</CardGroup>

## Troubleshooting Steps

<Steps>
  <Step title="Get your egress IP and CDN node">
    When the image domain is served through Cloudflare, its `/cdn-cgi/trace` path shows your egress IP and assigned node in one command. Works on Linux, macOS, and Windows cmd:

    ```bash theme={null}
    curl -s -m 30 https://<image-domain>/cdn-cgi/trace
    ```

    Look at three lines: `ip=` (egress IP), `colo=` (node code such as HKG, SIN, LAX, FRA), and `loc=` (region).

    * **No output within 30 seconds**: your server can't reach the domain at all — focus on steps 4 and 5
    * **Instant output**: the connection is fine and the problem is in the transfer — continue to step 3 for phase timing
  </Step>

  <Step title="Compare your laptop and your server">
    Download **the same image URL** from your laptop and from the server (commands in step 3).

    * **Laptop fast, server slow**: most likely the server's network path, but the storage side may also be degraded for some routes only — send us both results
    * **Slow everywhere**: most likely the storage side — contact us with the URL
  </Step>

  <Step title="Test basic network to the CDN">
    Use `ping`, `mtr`, `traceroute` to inspect latency and packet loss:

    ```bash theme={null}
    # Linux / macOS
    ping <cdn-host>
    mtr -rwc 30 <cdn-host>
    traceroute <cdn-host>
    ```

    ```bash theme={null}
    # Windows cmd
    tracert -d -w 1000 <cdn-host>
    ```

    To check your server's overall throughput to Cloudflare, download 5 MB of test data:
    `curl -o /dev/null -m 60 -w "total=%{time_total} speed=%{speed_download}\n" "https://speed.cloudflare.com/__down?bytes=5000000"`
    (on Windows, replace `/dev/null` with `NUL`). If this is slow too, your server's egress is the problem; if it's fast and only the image URL is slow, send us the results.

    Packet loss, latency above 200ms, or routes bouncing overseas all indicate link-level problems.
  </Step>

  <Step title="Measure real download speed">
    Use `curl` to inspect timing and throughput:

    <Tabs>
      <Tab title="Linux / macOS">
        ```bash theme={null}
        curl -4 -o /dev/null -m 60 -w "dns:%{time_namelookup} connect:%{time_connect} \
        tls:%{time_appconnect} ttfb:%{time_starttransfer} total:%{time_total} \
        size:%{size_download} speed:%{speed_download} ip:%{remote_ip}\n" \
        "<CDN URL>"
        ```
      </Tab>

      <Tab title="Windows cmd">
        ```bash theme={null}
        curl -4 -o NUL -m 60 -w "dns=%{time_namelookup} connect=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer} total=%{time_total} size=%{size_download} speed=%{speed_download} ip=%{remote_ip}\n" "<CDN URL>"
        ```

        Paste it directly into a cmd window. Inside a .bat file, change `%` to `%%`. Windows 10 and later ship with curl; older systems such as Windows Server 2012 R2 need it installed separately.
      </Tab>
    </Tabs>

    `-m 60` makes curl give up after 60 seconds and still print the timings, so it never hangs. Run it again with `-6` instead of `-4`: if only one protocol stalls, you can pin your program to the one that works.

    Focus on:

    * `time_namelookup`: DNS resolution time
    * `time_connect`: TCP connect time
    * `time_appconnect`: TLS handshake complete; 0 means the handshake failed
    * `time_starttransfer`: Time to first byte (TTFB)
    * `size_download`: Bytes actually received; 0 or very small means connected but the transfer stalled
    * `speed_download`: Average throughput (bytes/sec)
  </Step>

  <Step title="Inspect DNS resolution">
    ```bash theme={null}
    dig <cdn-host>
    nslookup <cdn-host>
    ```

    Check whether the resolved IP is geographically near you. APAC users should get APAC edges; if not, switch to a public DNS.
  </Step>

  <Step title="Check the server itself">
    "Worked yesterday, broken today" usually means something changed on the server. Check each item:

    * Cloud console: is the traffic quota used up, is bandwidth throttled, is the account in arrears
    * Is bandwidth saturated by another process (Windows: Task Manager → Performance → Ethernet; Linux: `iftop`, `nload`)
    * Do security groups and firewalls allow port 443 and overseas IP ranges; were outbound rules changed recently
    * Is the program going through a dead proxy: check `HTTP_PROXY` / `HTTPS_PROXY`, and on Windows also `netsh winhttp show proxy`
  </Step>
</Steps>

## Solutions

### Option 1: Switch to a public DNS (easiest)

Default DNS on many servers resolves Cloudflare to distant nodes. Try these public DNS servers:

```bash theme={null}
{/* /etc/resolv.conf */}
nameserver 1.1.1.1        # Cloudflare
nameserver 8.8.8.8        # Google
nameserver 223.5.5.5      # AliDNS
nameserver 119.29.29.29   # DNSPod
```

<Tip>
  Prefer `1.1.1.1` — it's Cloudflare's own DNS and reliably resolves to the nearest Cloudflare edge, which is ideal for R2 / Cloudflare CDN traffic.
</Tip>

### Option 2: Optimize how you download

<CardGroup cols={2}>
  <Card title="Parallel downloads" icon="layers">
    For batches of files use a parallel downloader (`aria2c -x 8`, Python `asyncio + httpx`) to saturate bandwidth.
  </Card>

  <Card title="Short timeouts + retries" icon="refresh-cw">
    Set connect and read timeouts separately, keep the read timeout around 30 seconds, and retry 3-4 times. A stalled connection often works on a fresh one — far better than waiting 120 seconds.
  </Card>

  <Card title="Connection reuse" icon="plug">
    Use clients with HTTP/2 or keep-alive (`httpx`, `requests.Session()`) to avoid repeated handshakes.
  </Card>

  <Card title="Stream to disk" icon="hard-drive">
    Stream the response directly to disk instead of loading the whole file into memory.
  </Card>
</CardGroup>

**Python example (recommended)**:

Avoid a single download with `timeout=120`. When the connection stalls you wait 120 seconds for nothing, and the whole generation task is marked failed — wasting an image that was already generated and billed.

```python theme={null}
import time
import httpx

# connect 10s; read 30s = give up after 30s with no data (not total duration)
TIMEOUT = httpx.Timeout(connect=10, read=30, write=30, pool=10)

def download(url: str, path: str, attempts: int = 4) -> str:
    for i in range(attempts):
        try:
            with httpx.stream("GET", url, timeout=TIMEOUT, follow_redirects=True) as resp:
                resp.raise_for_status()
                with open(path, "wb") as f:
                    for chunk in resp.iter_bytes(chunk_size=256 * 1024):
                        f.write(chunk)
            return path
        except httpx.HTTPError as e:
            print(f"Download failed (attempt {i + 1}): {e!r}")
            time.sleep(2 * (i + 1))
    raise RuntimeError(f"Image generated, but download failed repeatedly: {url}")

download("<CDN URL>", "output.png")
```

**aria2c example (CLI)**:

```bash theme={null}
aria2c -x 8 -s 8 -k 1M --file-allocation=none "<CDN URL>"
```

### Option 3: Move to a better-connected region

If your use case allows it, prefer regions with good connectivity to Cloudflare:

<CardGroup cols={2}>
  <Card title="Overseas (recommended)" icon="globe">
    AWS / GCP / Azure / Cloudflare Workers all reach Cloudflare R2 with very low latency (typically 10-50ms).
  </Card>

  <Card title="China: premium DCs" icon="server">
    If you must deploy in mainland China, pick DCs with triple-network BGP + premium international links (CN2 GIA, CMI, AS9929).
  </Card>

  <Card title="Hong Kong / Singapore" icon="network">
    A good compromise: low latency to mainland China (30-80ms) and excellent APAC Cloudflare connectivity.
  </Card>

  <Card title="Avoid cheap VPS" icon="triangle-alert">
    Budget hosts often have severely congested international egress and can drop to a few dozen KB/s at peak hours. Not recommended for CDN-heavy workloads.
  </Card>
</CardGroup>

### Option 4: Relay through another host (last resort)

If your server really can't reach Cloudflare quickly and you can't change regions:

1. **Use an overseas server as a relay**: download to an overseas box first, then transfer back via a private/premium link
2. **Relay via your own object storage**: mirror the asset into your own OSS / COS / S3 (e.g., a China-region bucket), and serve from there
3. **Pre-warm and cache**: download once from your backend and serve subsequent requests from a local cache

<Warning>
  **Mind the expiration**

  CDN URLs returned by APIYI for images/videos typically have a limited validity period (see the returned URL). Download and persist assets to your own storage **as soon as** the callback arrives, to avoid broken links later.
</Warning>

## Common Questions

<AccordionGroup>
  <Accordion title="Why is my laptop fast but my server slow?">
    Home broadband and a datacenter's international egress can differ dramatically in quality — this is the most common reason.

    It is **not the only one**, though: when a storage-side node degrades, it may affect only some routes, which also looks like "laptop fast, server slow". Don't conclude from this alone — run the steps above and send us the results so we can check against the storage side.
  </Accordion>

  <Accordion title="The error says it can't connect to api.apiyi.com, but the host in the details is the image domain?">
    That text is usually assembled by your own program. What actually failed is **the image download**; the generation API call succeeded. Trust the host in the details, and consider separating the two kinds of error messages.
  </Accordion>

  <Accordion title="I changed DNS but it's still slow — why?">
    DNS only affects which CDN edge you resolve to. If the underlying international bandwidth is already congested, DNS changes alone won't help. Consider changing regions or relaying through an overseas host.
  </Accordion>

  <Accordion title="Is Cloudflare R2 blocked in mainland China?">
    Cloudflare is not blocked in mainland China, but international egress can get congested at peak hours and some ISPs take suboptimal routes, so access quality is inconsistent. This is a general cross-border networking issue, not an R2-specific problem.
  </Accordion>

  <Accordion title="Video downloads keep failing — what can I do?">
    Use a downloader that supports **resume**, like `aria2c` or `wget -c`, with reasonable timeouts and retries:

    ```bash theme={null}
    aria2c -x 8 -s 8 -c --max-tries=10 --retry-wait=3 "<CDN URL>"
    ```
  </Accordion>

  <Accordion title="Can APIYI return Base64 instead of a CDN URL?">
    Videos are large (tens to hundreds of MB), and Base64 adds about 33% overhead with no resume support — it's actually slower and wastes bandwidth. We **do not recommend** Base64 for large files. Some image endpoints support Base64 responses; see the relevant API docs.
  </Accordion>

  <Accordion title="How do I confirm the bottleneck is my network, not the CDN?">
    Run the same `curl` test from an overseas host (AWS Tokyo, Singapore, etc.). If it's fast there but slow on your server, the bottleneck is between your server and Cloudflare — not the CDN itself.
  </Accordion>
</AccordionGroup>

## Related Docs

<CardGroup cols={2}>
  <Card title="Network Proxy Configuration" icon="network" href="/en/faq/network-proxy">
    Proxy options when international connectivity is unstable
  </Card>

  <Card title="Where are APIYI Servers?" icon="server" href="/en/faq/server-location">
    Learn about APIYI server locations and latency
  </Card>

  <Card title="Veo Video Generation API" icon="video" href="/en/api-capabilities/veo/overview">
    Output format and URL validity for the video API
  </Card>

  <Card title="Contact Support" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    If nothing helps, our team will assist you
  </Card>
</CardGroup>

<Info>
  **Info to share with support**

  If the self-check doesn't solve it, send us everything below in one go to skip the back-and-forth:

  * The failing image URL and when it was generated (or the request ID)
  * Full `/cdn-cgi/trace` output (one from your laptop, one from the server)
  * `curl` phase-timing output (one run with `-4`, one with `-6`)
  * `tracert` / `mtr` output and the 5 MB test download result
  * Your server's cloud provider and region
  * Roughly when the problem started, with time zone, e.g. `21:23 (UTC+8)`

  Please mask any API Key visible in screenshots before sending.
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.