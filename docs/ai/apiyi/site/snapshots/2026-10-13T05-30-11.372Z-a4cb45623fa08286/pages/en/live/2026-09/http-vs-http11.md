> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Is http the Same as HTTP/1.1? New FAQ on Choosing the Endpoint

> New FAQ: http/https controls encryption, while HTTP/1.1 and HTTP/2 control how a connection carries requests. They are different things. Most users should just use https://api.apiyi.com; clients that default to HTTP/2, such as Go and Java, can disable HTTP/2 in the client and keep https.

**2026/9/28 12:43 (UTC+8)** · Docs Update

📚 **"http means HTTP/1.1" is a misconception: new FAQ on choosing the endpoint**

`http://` versus `https://` decides whether traffic is encrypted. HTTP/1.1 versus HTTP/2 is the protocol version, which decides how requests travel over one connection, and it is negotiated between client and server. Python and Node (25 and earlier) default to HTTP/1.1; Go, Java, OkHttp, and fetch in Node 26 and later default to HTTP/2.

Bottom line: most users should keep `https://api.apiyi.com` and change nothing. If you upload large images at high concurrency with a client that defaults to HTTP/2, just disable HTTP/2 in the client (Go: `GODEBUG=http2client=0`) and keep https. `http://api.apiyi.com:16888` is only a fallback for HTTPS handshake failures. The "How Can I Reduce Image API Latency?" FAQ has been updated to match.

See [Is http the Same as HTTP/1.1?](/en/faq/http-vs-http11)

***

← [Back to Live Updates](/en/live) · 📚 [Monthly archive](/en/live/archive)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.