> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 图片 API 延迟如何优化？

> 针对高频图片生成业务，介绍客户端协议版本、连接复用、超时设置等网络优化建议。

## 简短回答

如果每月生成图片量巨大，并希望接口响应延迟控制在 360ms 内，单纯更换其他线路通常帮助有限，因为其他可选节点大多是海外机器，网络距离可能带来更高延迟。

优化应从客户端入手，地址保持默认的：

```text theme={null}
https://api.apiyi.com
```

先确认客户端实际使用的协议版本，再按需调整连接复用、超时和重试。**不需要为了走 HTTP/1.1 而把地址换成 `http://`**：http/https 管的是加不加密，HTTP/1.1 和 HTTP/2 是另一回事，详见 [http 和 HTTP/1.1 是一回事吗？](/faq/http-vs-http11)

## 客户端优化建议

* **确认协议版本**：Python（requests、httpx、OpenAI SDK）默认就是 HTTP/1.1，无需调整。Go、Java、OkHttp 以及 Node 26 起的内置 fetch 默认会走 **HTTP/2**。高并发上传大图时，HTTP/2 会把所有请求挤在一条连接上，这类客户端建议在代码里强制 HTTP/1.1，地址仍用 https
* 启用连接池和 Keep-Alive，避免每次请求重新建立连接
* 根据图片生成耗时适当增加读取超时，不要只设置 500ms 总超时
* 对偶发网络错误设置有限次数重试，并采用退避策略

<Info>
  **500ms 应作为网络或任务提交阶段的优化目标，而不是图片生成完成时间的保证。** 实际延迟还会受到客户端所在地、运营商线路、并发量、图片模型和上游处理时间影响。建议先使用真实生产并发进行压测，再根据 P95 和 P99 延迟评估效果。
</Info>

## 推荐排查顺序

<Steps>
  <Step title="确认协议版本">
    用 `curl -s -o /dev/null -w "%{http_version}\n" https://api.apiyi.com/v1/models -H "Authorization: Bearer YOUR_API_KEY"` 或查看客户端文档，确认实际走的是 HTTP/1.1 还是 HTTP/2。
  </Step>

  <Step title="按需关闭 HTTP/2">
    只有默认走 HTTP/2 的客户端（Go、Java 等）需要这一步：在客户端中固定使用 HTTP/1.1，并开启连接复用。Go 程序可直接设置环境变量 `GODEBUG=http2client=0`。
  </Step>

  <Step title="调整超时与重试">
    分别配置连接超时和读取超时；读取超时应覆盖图片任务的正常处理时间。
  </Step>

  <Step title="进行并发压测">
    按接近生产环境的并发量测试，重点观察 P50、P95、P99 延迟和失败率。
  </Step>
</Steps>

## 关于明文接口 16888

`http://api.apiyi.com:16888` 是正式提供的明文接口，请求路径与 https 相同。它不会让出图变快：对已经走 HTTP/1.1 的客户端，只省掉一次 TLS 握手。只建议在 HTTPS 握手本身出问题时临时使用，或在可信内网、专线环境中使用。

<Warning>
  HTTP 不提供 TLS 加密，API Key 和请求内容会以明文方式传输。仅建议在可信网络或已配置专线、隧道的环境中使用，不要在公共网络中直接调用。
</Warning>

## 相关文档

* [http 和 HTTP/1.1 是一回事吗？](/faq/http-vs-http11)
* [使用 API 接口需要代理网络吗？](/faq/network-proxy)
* [API 使用手册](/api-manual)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.