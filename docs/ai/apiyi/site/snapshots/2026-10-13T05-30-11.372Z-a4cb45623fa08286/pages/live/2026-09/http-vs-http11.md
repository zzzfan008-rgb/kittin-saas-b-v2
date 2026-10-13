> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# http 和 HTTP/1.1 不是一回事？新增 FAQ 讲清接入地址怎么选

> 新增 FAQ：http/https 决定是否加密，HTTP/1.1 与 HTTP/2 决定一条连接怎么收发请求，两者不是一回事。终端用户默认用 https://api.apiyi.com 即可；Go、Java 等默认走 HTTP/2 的客户端可在客户端关 HTTP/2，地址仍用 https。

**2026/9/28 12:43 (UTC+8)** · 文档更新

📚 **「http 就是 HTTP/1.1」是误解，新增 FAQ 讲清接入地址怎么选**

`http://` 和 `https://` 决定传输加不加密；HTTP/1.1 和 HTTP/2 是协议版本，决定一条连接上怎么收发请求，由客户端和服务端协商。Python、Node（25 及更早）默认就走 HTTP/1.1；Go、Java、OkHttp、Node 26 起的 fetch 默认会走 HTTP/2。

结论：终端用户默认用 `https://api.apiyi.com`，不用改。高并发上传大图、且客户端默认走 HTTP/2 的，只需在客户端关掉 HTTP/2（Go 可设 `GODEBUG=http2client=0`），地址仍用 https；`http://api.apiyi.com:16888` 只作 HTTPS 握手异常时的备用。《图片 API 延迟如何优化？》已同步修正口径。

详见 [http 和 HTTP/1.1 是一回事吗？](/faq/http-vs-http11)

***

← [返回实时动态](/live) · 📚 [按月归档](/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.