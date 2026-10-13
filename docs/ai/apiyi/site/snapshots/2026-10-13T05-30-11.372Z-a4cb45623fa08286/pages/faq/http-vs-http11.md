> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# http 和 HTTP/1.1 是一回事吗？

> http/https 管加不加密，HTTP/1.1 和 HTTP/2 管连接怎么收发请求，两者不是一回事。终端用户默认用 https://api.apiyi.com 即可。

## 简短回答

**不是一回事。** `http://` 和 `https://` 决定的是**传输加不加密**；HTTP/1.1 和 HTTP/2 是**协议版本**，决定一条连接上怎么收发请求。两者可以任意组合。

绝大多数用户直接使用下面这个地址即可，什么都不用改：

```text theme={null}
https://api.apiyi.com
```

## 两个维度，别混在一起

| 维度 | 决定什么 | 取值 |
| - | - | - |
| `http://` 还是 `https://` | 传输是否加密（有没有 TLS） | 明文 / 加密 |
| HTTP/1.1 还是 HTTP/2 | 一条连接上怎么收发请求 | HTTP/1.1：一条连接同一时间只跑一个请求，并发多少就开多少条连接<br />HTTP/2：一条连接同时跑很多个请求（多路复用） |

实际用哪个协议版本，是**客户端和服务端在建立连接时协商出来的**，不由网址的写法决定。API易 的 `https://` 入口同时支持 HTTP/1.1 和 HTTP/2，客户端支持哪个就用哪个。

所以常听到的「http 就是 HTTP/1.1，https 就是 HTTP/2」是一种误解：

* 访问 `http://` 地址时，主流客户端确实基本都走 HTTP/1.1，但这只是结果上碰巧成立
* 访问 `https://` 地址时，有的客户端走 HTTP/1.1，有的走 HTTP/2，取决于客户端本身

## 常见客户端默认走哪个版本（https 下）

| 客户端 | 默认版本 |
| - | - |
| Python `requests`、`httpx`、OpenAI Python SDK | HTTP/1.1 |
| Node.js `axios` | HTTP/1.1 |
| Node.js 内置 `fetch`、OpenAI Node SDK | Node 25 及更早：HTTP/1.1；**Node 26 起默认会协商 HTTP/2** |
| Go 标准库 `net/http`（new-api、one-api 等网关多用 Go 编写） | HTTP/2 |
| Java `HttpClient`、OkHttp | HTTP/2 |
| curl、浏览器 | HTTP/2 |

想确认自己实际走的是哪个版本，可以用 curl 看一眼：

```bash theme={null}
curl -s -o /dev/null -w "%{http_version}\n" https://api.apiyi.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
# 输出 2 表示 HTTP/2，1.1 表示 HTTP/1.1
```

## 我该用哪个地址

<Steps>
  <Step title="终端用户：用 https，不用改">
    直接调用 API 的个人和企业用户，默认使用 `https://api.apiyi.com`。Python、Node 等常用 SDK 本来就适配良好，不需要调整协议。
  </Step>

  <Step title="Go / Java 客户端 + 高并发大图上传：保持 https，只在客户端关 HTTP/2">
    HTTP/2 会把大量并发请求放在同一条连接上。上传几 MB 的图片时，这条连接一旦抖动，所有请求会一起变慢。如果你用的是默认走 HTTP/2 的客户端、同时有高并发的出图或图片编辑业务，可以让客户端改走 HTTP/1.1。**地址仍然用 https，不需要换成 http。**
  </Step>

  <Step title="http://api.apiyi.com:16888：只作为备用">
    这是正式提供的明文接口，只建议在 HTTPS 握手本身出问题时临时使用（例如 [Python 报 SSLEOFError、curl 却正常](/faq/openssl-pq-handshake-eof)），或者在可信内网、专线环境中使用。
  </Step>
</Steps>

<Warning>
  `http://` 不加密，API Key、提示词和图片都会以明文走完公网链路，途经的任何网络设备都能看到。不要把明文接口作为生产环境的长期方案。
</Warning>

### Go 客户端如何改走 HTTP/1.1

不改代码的办法：给进程加一个环境变量，适合 new-api、one-api 这类现成的网关程序：

```bash theme={null}
GODEBUG=http2client=0
```

自己写代码时，把 `Transport.TLSNextProto` 设成一个非 nil 的空 map：

```go theme={null}
import (
    "crypto/tls"
    "net/http"
)

tr := &http.Transport{
    // 非 nil 的空 map 表示不启用 HTTP/2，https 请求改走 HTTP/1.1
    TLSNextProto:        map[string]func(string, *tls.Conn) http.RoundTripper{},
    MaxIdleConnsPerHost: 100,
}
client := &http.Client{Transport: tr}
```

## 常见误解

<AccordionGroup>
  <Accordion title="换成 http:// 会更快吗？">
    对 Python、Node 这类本来就走 HTTP/1.1 的客户端来说，换成 http 只省掉一次 TLS 握手（零点几秒）。相比图片生成动辄几十秒的耗时，这点差距可以忽略，却要付出明文传输的代价。
  </Accordion>

  <Accordion title="想关掉 HTTP/2，必须换成 http:// 吗？">
    不需要。HTTP/2 是在客户端里关的，见上面的 Go 示例；其他语言也都有类似的开关。关掉之后继续用 `https://api.apiyi.com`，既走 HTTP/1.1，又保持加密。
  </Accordion>

  <Accordion title="HTTP/2 是不是就不好？">
    不是。对于浏览器、普通文本对话这类请求小、数量多的场景，HTTP/2 复用连接反而更省资源。只有「高并发 + 大请求体或大响应体」叠加时，多路复用的单条连接才可能成为瓶颈。
  </Accordion>
</AccordionGroup>

## 相关文档

* [Base URL 怎么填？](/faq/base-url-config)
* [图片 API 延迟如何优化？](/faq/image-api-network-latency-optimization)
* [Python 报 SSLEOFError、curl 却正常？](/faq/openssl-pq-handshake-eof)
* [脚本报 502 但调用日志里查不到？](/faq/proxy-empty-502)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.