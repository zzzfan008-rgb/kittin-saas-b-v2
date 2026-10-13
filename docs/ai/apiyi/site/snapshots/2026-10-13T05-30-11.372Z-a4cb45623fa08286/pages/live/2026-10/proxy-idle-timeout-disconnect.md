> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 开着代理出图总在 90 秒左右断开？新增 FAQ 讲清原因与解决方法

> 新增 FAQ：本地开发时电脑开着 VPN 或代理，代理会掐断长时间没有数据的连接，出图请求在 90~180 秒成批断开，程序超时设得再长也没用，而且照样扣费。把 api.apiyi.com 设为直连即可解决，服务器直连部署一般不会遇到。

**2026/10/3 21:17 (UTC+8)** · 文档更新

📚 **开着 VPN 调用出图，请求在 90\~180 秒成批断开？问题在本机代理，不在并发或接口超时**

真实工单：客户本地开发出图程序时电脑开着代理，程序超时设了 900 秒，`gpt-image-2-vip` 请求却约四成在 90\~180 秒断开，常常好几张同一秒一起失败。出图期间连接上没有数据，代理把它当空闲连接掐断了；API易 这边照常出图并计费，结果回不到程序。

新 FAQ 说明代理空闲超时的原理、如何确认、Clash / v2rayN 设直连与程序绕开代理的写法，并回答部署到服务器后会不会遇到，见 [开着代理调用出图，总在 90 秒左右断开？](/faq/proxy-idle-timeout-disconnect)。

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.