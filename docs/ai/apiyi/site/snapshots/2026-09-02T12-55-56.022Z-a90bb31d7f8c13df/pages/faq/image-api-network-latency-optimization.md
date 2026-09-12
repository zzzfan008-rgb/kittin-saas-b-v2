> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 图片 API 延迟如何优化？

> 针对高频图片生成业务，介绍 HTTP 接口、HTTP/1.1、连接复用和超时设置等网络优化建议。

## 简短回答

如果每月生成图片量巨大，并希望接口响应延迟控制在 360ms 内，单纯更换其他线路通常帮助有限，因为其他可选节点大多是海外机器，网络距离可能带来更高延迟。

可以先将原来的根域名：

```text theme={null}
https://api.apiyi.com
```

替换为以下 HTTP 接口进行测试：

```text theme={null}
http://api.apiyi.com:16888
```

请求路径保持不变。例如原请求为 `https://api.apiyi.com/v1/images/generations`，替换后为 `http://api.apiyi.com:16888/v1/images/generations`。

<Warning>
  HTTP 不提供 TLS 加密，API Key 和请求内容会以明文方式传输。仅建议在可信网络或已配置专线、隧道的环境中使用，不要在公共网络中直接调用。
</Warning>

## 客户端优化建议

部分中转 API 在长连接或流式传输场景下对 HTTP/2 的兼容性不稳定，可能出现连接中断或额外重试。建议自定义 HTTP 客户端：

* 强制使用 **HTTP/1.1**，关闭 HTTP/2
* 启用连接池和 Keep-Alive，避免每次请求重新建立连接
* 根据图片生成耗时适当增加读取超时，不要只设置 500ms 总超时
* 对偶发网络错误设置有限次数重试，并采用退避策略

<Info>
  **500ms 应作为网络或任务提交阶段的优化目标，而不是图片生成完成时间的保证。** 实际延迟还会受到客户端所在地、运营商线路、并发量、图片模型和上游处理时间影响。建议先使用真实生产并发进行压测，再根据 P95 和 P99 延迟评估效果。
</Info>

## 推荐排查顺序

<Steps>
  <Step title="切换 HTTP 接口">
    将根域名替换为 `http://api.apiyi.com:16888`，保持原有 API 路径和鉴权方式不变。
  </Step>

  <Step title="关闭 HTTP/2">
    在客户端中固定使用 HTTP/1.1，并开启连接复用。
  </Step>

  <Step title="调整超时与重试">
    分别配置连接超时和读取超时；读取超时应覆盖图片任务的正常处理时间。
  </Step>

  <Step title="进行并发压测">
    按接近生产环境的并发量测试，重点观察 P50、P95、P99 延迟和失败率。
  </Step>
</Steps>

## 相关文档

* [使用 API 接口需要代理网络吗？](/faq/network-proxy)
* [API 使用手册](/api-manual)
