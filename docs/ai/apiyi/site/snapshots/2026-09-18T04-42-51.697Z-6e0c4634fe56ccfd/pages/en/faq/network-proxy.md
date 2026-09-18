> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Do I Need a Proxy to Use the API?

> Learn about APIYI's network access methods and whether proxy or VPN is required

## Short Answer

**No proxy needed. Direct connection available.**

APIYI supports direct access from mainland China without requiring any proxy or VPN.

## Network Access Instructions

### Mainland China Users

<Info>
  **Direct Connection Without Proxy**

  * ✅ No proxy or VPN configuration needed
  * ✅ Direct access to `api.apiyi.com`
  * ✅ Enterprise-grade dedicated line for China connectivity
  * ✅ Low latency, high stability
</Info>

### International Users

If you're using APIYI from outside China:

* 🚀 Even faster access speeds
* 🌐 Direct international routing
* ⚡ No additional configuration required

## Network Issue Solutions

In rare cases, some users may encounter the following issues:

<CardGroup cols={2}>
  <Card title="HTTPS Certificate Issues" icon="shield-alert">
    SSL/TLS certificate validation failures

    Possible causes: Incorrect local time, incomplete certificate chain
  </Card>

  <Card title="Connection Errors" icon="wifi-off">
    Connection timeout or unable to establish connection

    Possible causes: Local network restrictions, DNS resolution issues
  </Card>
</CardGroup>

### Alternative Solution: HTTP Address

If the above issues cannot be resolved, we provide HTTP access as an alternative:

<Warning>
  **Obtaining HTTP Address**

  HTTP protocol transmits data without encryption and should only be used as a temporary solution. To obtain HTTP access address, please contact technical support:

  [Contact us on Enterprise WeChat](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)
</Warning>

## FAQ

### Why can I connect directly from China?

We use compliant enterprise-grade dedicated lines for China connectivity, ensuring stable and fast access for users in mainland China.

### What's the difference between HTTPS and HTTP?

* **HTTPS** (Recommended): Encrypted transmission, high data security
* **HTTP** (Alternative): Plain text transmission, use only temporarily when HTTPS issues occur

### How to check if network connection is normal?

You can test using the following commands:

```bash theme={null}
# Test API connection
curl -I https://api.apiyi.com

# Test DNS resolution
ping api.apiyi.com
```

If you receive normal responses, the network connection is fine.

## Network Optimization Tips

<Tip>
  **Tips to Improve Access Speed**

  * 🕐 Ensure local system time is accurate (prevents certificate validation failures)
  * 🌐 Use stable DNS services (e.g., 114.114.114.114 or 8.8.8.8)
  * 📡 Prefer wired network over Wi-Fi
  * 🔄 Regularly update system root certificates
</Tip>

## Technical Support

If you encounter network access issues, please contact technical support:

<Card title="Enterprise WeChat" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="Enterprise WeChat QR Code" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

  Scan QR code or [Click to contact support](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

  Technical support, quick response
</Card>
