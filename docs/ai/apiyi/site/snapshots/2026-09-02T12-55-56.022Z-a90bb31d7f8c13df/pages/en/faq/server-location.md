> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Where are APIYI's Servers? Which Server Should I Choose?

> Learn about APIYI's server locations, data center distribution, network latency testing methods, and server purchasing recommendations

## Server Location

APIYI's servers are located in **Los Angeles, USA (US West)**, using **BandwagonHost's China-optimized premium network**.

<Info>
  **Premium Network Optimization**: Our servers are equipped with China-optimized premium network, specially optimized for users in mainland China. Even large image transfers (Base64 encoding) maintain normal speeds.
</Info>

## Network Performance by Region

<CardGroup cols={2}>
  <Card title="Mainland China Users" icon="map-pin">
    **Network Performance**: Excellent ✅

    * Premium network optimization, low latency
    * Normal speed for large image transfers (Base64)
    * Suitable for high-frequency API calls
    * No additional proxy configuration needed
  </Card>

  <Card title="International Users" icon="globe">
    **Network Performance**: Depends on geographic location 🌍

    * Lowest latency in US West region
    * Slightly higher latency in Europe/Asia-Pacific
    * Recommend choosing US West servers
    * Can use CDN acceleration
  </Card>
</CardGroup>

## Server Purchasing Recommendations

### International Server Recommendations

If you're using international servers to call APIYI services, we recommend:

<Tip>
  **Recommended Choice**: US West (Los Angeles, San Jose, Seattle, etc.) data center servers

  * **Geographic proximity**: Same region as our servers, lowest latency
  * **Optimized network routing**: Best routing between same region
  * **Cost-effective**: US West data centers offer reasonable pricing
</Tip>

If you're looking for a reliable VPS provider, consider the same provider we use:

<Card title="BandwagonHost VPS" icon="server" href="https://bandwagonhost.com/aff.php?aff=80627">
  **BandwagonHost** - Reputable VPS Provider

  * ✅ China-optimized premium network (CN2 GIA, CN2, etc.)
  * ✅ Multiple US West data centers (Los Angeles, San Jose, etc.)
  * ✅ Stable, reliable, cost-effective
  * ✅ Suitable for both domestic and international users

  Click to view BandwagonHost VPS plans
</Card>

### Mainland China Servers

<Info>
  **Mainland China servers work great too!**

  Thanks to our China-optimized premium network, even if your server is located in mainland China, accessing APIYI has normal latency and speed with no network concerns.
</Info>

**Suitable scenarios**:

* Applications deployed on domestic cloud providers (Alibaba Cloud, Tencent Cloud, Huawei Cloud, etc.)
* Users primarily in mainland China
* Need to meet domestic compliance requirements

## How to Test Network Latency?

Before choosing a server, we recommend testing network latency from your server to APIYI.

### Method 1: Ping Test

```bash theme={null}
# Test latency (ICMP)
ping api.apiyi.com
```

**Reference latency**:

* **Mainland China**: Usually 50-150ms (premium network optimized)
* **US West region**: Usually 5-30ms (same region)
* **Europe/Asia-Pacific**: Usually 150-300ms (cross-region)

### Method 2: cURL Latency Test

```bash theme={null}
# Single HTTP latency test
curl -o /dev/null -s -w "Connect time: %{time_connect}s\nTotal time: %{time_total}s\n" https://api.apiyi.com

# Multiple tests for average (more accurate)
for i in {1..10}; do
  curl -o /dev/null -s -w "Test $i - Total time: %{time_total}s\n" https://api.apiyi.com
done
```

### Method 3: Actual API Call Test

```bash theme={null}
# Test actual API call latency
time curl -X POST https://api.apiyi.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
  }'
```

<Tip>
  **Optimization suggestion**: If latency is high (over 500ms), consider:

  * Switching to a US West data center server
  * Using CDN or proxy acceleration
  * Contacting customer service for network optimization solutions
</Tip>

## Network Optimization Recommendations

### For High Latency Scenarios

If your server has high latency, try these optimization solutions:

<Steps>
  <Step title="Use Connection Pooling">
    Reuse HTTP connections to avoid frequent new connection overhead
  </Step>

  <Step title="Enable HTTP/2 or HTTP/3">
    Leverage multiplexing features to improve concurrent request efficiency
  </Step>

  <Step title="Batch Requests">
    Combine multiple small requests into batch requests to reduce network round trips
  </Step>

  <Step title="Async Calls">
    Use asynchronous API calls to avoid blocking waits
  </Step>

  <Step title="Local Caching">
    Cache repeated request results to reduce API call frequency
  </Step>
</Steps>

### For Large Image Transfers

If you frequently transfer large images (e.g., image generation, image recognition), we recommend:

<CardGroup cols={2}>
  <Card title="Use URL Parameters" icon="link">
    Prefer image URLs over Base64 encoding

    Reduces request body size, improves transfer efficiency
  </Card>

  <Card title="Compress Images" icon="file-archive">
    Appropriately compress image quality before upload

    Reduce file size while maintaining quality
  </Card>
</CardGroup>

## Frequently Asked Questions

<AccordionGroup>
  <Accordion title="Why choose US West instead of other regions?">
    **Main reasons**:

    1. **Premium network optimization**: US West is the main exit point for China-bound premium networks, providing optimal routing for mainland China users
    2. **International hub**: Los Angeles is a major international network hub connecting Asia-Pacific, Europe, North America, etc.
    3. **Cost advantage**: US West data centers have relatively low bandwidth costs and high cost-effectiveness
    4. **Service stability**: Providers like BandwagonHost have extensive US West operation experience and good stability
  </Accordion>

  <Accordion title="Will accessing APIYI from mainland China be slow?">
    **No!**

    We use BandwagonHost's **China-optimized premium network** (CN2 GIA, etc.), specially optimized for mainland China users.

    **Actual performance**:

    * Mainland China user access latency usually 50-150ms
    * Even Base64 large image transfers maintain normal speeds
    * No proxy or VPN configuration needed

    You can test your actual network latency using the methods above.
  </Accordion>

  <Accordion title="How can I optimize my application's network latency?">
    **Optimization recommendations**:

    1. **Server selection**: Choose US West data center servers (same region as us)
    2. **Connection reuse**: Use HTTP connection pooling to avoid frequent new connections
    3. **Batch requests**: Combine multiple small requests into batches
    4. **Async calls**: Use asynchronous API calls, don't block main thread
    5. **Local caching**: Cache repeated request results
    6. **CDN acceleration**: Use CDN for static resources

    See "Network Optimization Recommendations" section above for details.
  </Accordion>

  <Accordion title="Does APIYI plan to deploy servers in other regions?">
    We currently focus on providing **high-quality, stable** US West server services, and use premium networks to provide good network experience for global users (especially mainland China users).

    In the future, we will evaluate the possibility of deploying servers in other regions (such as Europe, Asia-Pacific) based on user demand and business development.

    If you have special geographic location requirements, please contact our business team to discuss custom solutions.
  </Accordion>

  <Accordion title="My server isn't in US West and has high latency. What should I do?">
    If your server has high latency (over 500ms), consider:

    **Short-term solutions**:

    * Use proxy or CDN acceleration
    * Optimize application code (connection pooling, async calls, etc.)
    * Batch requests to reduce network round trips

    **Long-term solutions**:

    * Migrate server to US West data center
    * Use multi-region deployment, dedicated US West server for APIYI calls
    * Contact us to discuss customized network optimization solutions
  </Accordion>

  <Accordion title="Is BandwagonHost VPS suitable for individual developers?">
    **Absolutely!**

    BandwagonHost offers VPS plans at various price points:

    * **Entry-level**: Suitable for individual developers testing and low-traffic applications
    * **Mid-range**: Suitable for small to medium production environments
    * **High-end**: Suitable for high-traffic, high-concurrency scenarios

    Advantages:

    * Reasonably priced, cost-effective
    * China-optimized premium network (fast access from mainland China)
    * Supports flexible payment options (monthly, annual, etc.)
    * Provides snapshot backups, one-click reinstall, and other convenient features
  </Accordion>
</AccordionGroup>

## Related Documentation

<CardGroup cols={2}>
  <Card title="Network Connection Troubleshooting" icon="network" href="/faq/network-proxy">
    Learn how to troubleshoot network connection issues, configure proxies, etc.
  </Card>

  <Card title="API Concurrency Limits" icon="gauge" href="/faq/api-concurrency">
    Learn about API concurrency limits and performance optimization recommendations
  </Card>
</CardGroup>

## Contact Us

For server selection, network optimization, and other related questions, please contact us:

<CardGroup cols={2}>
  <Card title="Enterprise WeChat" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="Enterprise WeChat QR Code" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    Scan QR code or [Click to contact support](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    Network optimization, technical support
  </Card>

  <Card title="Email Inquiry" icon="mail">
    **Customer Service**: [support@apiyi.com](mailto:support@apiyi.com)

    **Business Cooperation**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
