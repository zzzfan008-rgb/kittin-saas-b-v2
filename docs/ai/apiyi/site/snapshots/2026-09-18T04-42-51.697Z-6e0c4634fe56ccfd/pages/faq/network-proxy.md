> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 使用 API 接口需要代理网络吗？

> 了解 API易 的网络访问方式，是否需要使用代理或 VPN

## 简短回答

**不需要代理，可以直连。**

API易 支持国内直接访问，无需任何代理或 VPN。

## 网络访问说明

### 国内用户

<Info>
  **免代理直连**

  * ✅ 无需配置代理或 VPN
  * ✅ 直接访问 `api.apiyi.com`
  * ✅ 采用企业专线回国线路，网络质量优良
  * ✅ 低延迟、高稳定性
</Info>

### 海外用户

如果您在海外使用 API易：

* 🚀 访问速度更快
* 🌐 直连国际线路
* ⚡ 无需额外配置

## 网络问题解决方案

极少数情况下，部分用户可能遇到以下问题：

<CardGroup cols={2}>
  <Card title="HTTPS 证书问题" icon="shield-alert">
    SSL/TLS 证书验证失败

    可能原因：本地时间不准确、证书链不完整
  </Card>

  <Card title="网络连接异常" icon="wifi-off">
    连接超时或无法建立连接

    可能原因：本地网络限制、DNS 解析问题
  </Card>
</CardGroup>

### 备选方案：HTTP 地址

如遇到上述问题无法解决，我们提供 HTTP 访问地址作为备选方案：

<Warning>
  **获取 HTTP 地址**

  HTTP 协议不加密传输，仅作为临时解决方案使用。如需获取 HTTP 访问地址，请联系技术客服：

  企业微信客服：[点击联系](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)
</Warning>

## 常见问题

### 为什么国内可以直连？

我们使用了合规的企业专线回国线路，确保国内用户可以稳定、快速地访问服务。

### HTTPS 和 HTTP 有什么区别？

* **HTTPS**（推荐）：加密传输，数据安全性高
* **HTTP**（备选）：明文传输，仅在遇到 HTTPS 问题时临时使用

### 如何判断网络连接是否正常？

可以使用以下命令测试：

```bash theme={null}
# 测试 API 连接
curl -I https://api.apiyi.com

# 测试 DNS 解析
ping api.apiyi.com
```

如果返回正常响应，说明网络连接无问题。

## 网络优化建议

<Tip>
  **提升访问速度的建议**

  * 🕐 确保本地系统时间准确（避免证书验证失败）
  * 🌐 使用稳定的 DNS 服务（如 114.114.114.114 或 8.8.8.8）
  * 📡 优先使用有线网络而非 Wi-Fi
  * 🔄 定期更新系统根证书
</Tip>

## 技术支持

如遇到网络访问问题，请联系技术客服：

<Card title="企业微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企业微信客服二维码" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

  扫码添加 或 [点击联系客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

  技术支持，快速响应
</Card>
