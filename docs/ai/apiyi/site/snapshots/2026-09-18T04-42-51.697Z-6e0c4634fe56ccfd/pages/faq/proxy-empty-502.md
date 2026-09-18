> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 脚本报 502 但调用日志里查不到？

> 响应里只有 Connection: close 和 Content-Length: 0、正文为空的 502，是你电脑上的代理软件自己生成的，不是 API易 返回的。让脚本绕开系统代理即可解决。

## 症状

批量调用的脚本（常见于 Windows + Python `requests`）间歇性收到 502，打印出来的响应大致是这样：

```text theme={null}
HTTP 502: {'_non_json_response': '', '_status_code': 502,
           '_headers': {'Connection': 'close', 'Content-Length': '0'}}
```

同时有这几个特征：

* 响应**正文为空**，响应头**只有** `Connection` 和 `Content-Length` 两个字段
* 网页版控制台一直正常，没有跟着打不开
* 到 [调用日志](/faq/call-logs) 里查，这些失败请求**一条记录都没有**
* 脚本按 502 重试，往往要连续失败好几次才成功，退避时间越拉越长

## 简短回答

<Info>
  **这种 502 不是 API易 返回的，而是你电脑上的代理软件（Clash、v2rayN 等）自己生成的。**

  让脚本绕开系统代理就能解决：`requests` 里设置 `session.trust_env = False`，其他语言的做法见下文。
</Info>

## 怎么判断是不是这种情况

API易 各层返回的响应都有固定特征，和上面的空 502 对不上：

| 来源               | 响应特征                                                   |
| ---------------- | ------------------------------------------------------ |
| API易 接入节点（nginx） | 一定带 `Server` 和 `Date` 响应头；节点自己生成的 5xx 还带一段 HTML 正文     |
| API易 网关          | 错误正文是 JSON，带 `error.message`                           |
| 代理软件转发失败         | 正文为空，响应头通常只有 `Connection: close` 和 `Content-Length: 0` |

所以只要看到**没有 `Server`、没有 `Date`、正文为空**的 502，基本就能断定它来自代理软件，而不是 API易。

<Note>
  平台侧确实也会出现 502，那种是服务容器短暂重启，网页版会同时打不开，约 1 分钟内恢复，而且响应带完整的响应头和正文。处理方法见 [网站或接口返回 502 怎么办](/faq/website-502-error)。
</Note>

## 为什么会被代理接管

1. **Python `requests` 会自动读取系统代理。** 在 Windows 上，它会读取注册表里的系统代理设置。Clash、v2rayN 这类软件一旦开启「系统代理」，你的脚本就会悄悄走代理，代码里完全看不出来。
2. **明文 HTTP 请求由代理代发。** 用 `http://api.apiyi.com:16888` 这类明文地址时，代理不是只做透明隧道，而是替你把请求重新发出去。代理节点抖动、切换或超时后，它会直接给你的脚本回一个空的 502。
3. **大请求体和高并发会放大问题。** 图片编辑一次要上传几 MB 的图片，单次生成要 45 到 70 秒。几十个并发都挤在一个代理节点上，任何一次抖动都会让一批请求同时失败。

<Tip>
  走 `https://` 时，代理只负责搭一条加密隧道，出问题时通常表现为连接异常（比如 `ProxyError`），而不是伪造的 502。不过 HTTPS 请求照样会经过代理，最终的解决办法仍然是让脚本不走代理。
</Tip>

## 解决方法

<Steps>
  <Step title="确认脚本有没有走代理">
    在运行脚本的同一个环境里执行：

    ```python theme={null}
    import urllib.request
    print(urllib.request.getproxies())
    ```

    输出里有 `http` 或 `https` 项（比如 `127.0.0.1:7890`），就说明 `requests` 默认会走这个代理。
  </Step>

  <Step title="让脚本绕开代理（任选一种）">
    <Tabs>
      <Tab title="requests">
        ```python theme={null}
        import requests

        session = requests.Session()
        session.trust_env = False   # 不读取系统代理和环境变量里的代理

        resp = session.post(
            "https://api.apiyi.com/v1/images/edits",
            headers={"Authorization": "Bearer YOUR_API_KEY"},
            data={"model": "gpt-image-2-vip", "prompt": "...", "size": "1024x1536"},
            files=[("image[]", open("a.jpg", "rb"))],
            timeout=(10, 600),
        )
        ```

        只改单次请求也可以：`requests.post(..., proxies={"http": None, "https": None})`。
      </Tab>

      <Tab title="OpenAI SDK">
        ```python theme={null}
        import httpx
        from openai import OpenAI

        client = OpenAI(
            api_key="YOUR_API_KEY",
            base_url="https://api.apiyi.com/v1",
            http_client=httpx.Client(trust_env=False, timeout=600),
        )
        ```
      </Tab>

      <Tab title="环境变量">
        不想改代码时，在运行脚本前设置 `NO_PROXY`，让 API易 的域名不走代理：

        ```bash theme={null}
        # Windows PowerShell
        $env:NO_PROXY="api.apiyi.com,.apiyi.com"

        # macOS / Linux
        export NO_PROXY="api.apiyi.com,.apiyi.com"
        ```
      </Tab>

      <Tab title="代理软件">
        在 Clash、v2rayN 等软件里给 `apiyi.com` 加一条直连（DIRECT）规则，或者跑批量任务时关掉「系统代理」。
      </Tab>
    </Tabs>
  </Step>

  <Step title="重新跑一小批验证">
    先用 5 到 10 个并发跑几十次。空 502 消失，就说明是代理的问题。API易 国内可以直连，不需要代理，详见 [使用 API 接口需要代理网络吗](/faq/network-proxy)。
  </Step>
</Steps>

<Note>
  `http://api.apiyi.com:16888` 是正式提供的明文接口，图片场景用它可以降低延迟（见 [图片 API 延迟如何优化](/faq/image-api-network-latency-optimization)），**可以继续使用**，前提是按上面的方法绕开代理。
</Note>

## 常见疑问

<AccordionGroup>
  <Accordion title="这些失败的请求会扣费吗？">
    分两种情况：

    * 代理在**请求发到 API易 之前**就失败了：API易 没收到请求，不会扣费，调用日志里也没有记录。
    * 代理在**请求已经发出、正在等待结果时**断开：API易 可能已经在处理这张图，并照常计费，但结果没能回到你的脚本。

    所以不要只看脚本的报错。请以 [调用日志](/faq/call-logs) 里的记录为准，核对实际扣费次数。
  </Accordion>

  <Accordion title="为什么重试几次之后又成功了？">
    代理节点的抖动通常是间歇性的，重试时刚好赶上节点恢复，请求就过去了。但每次重试都要重新上传整张图，退避时间也越来越长，批量任务的总耗时会明显变长。绕开代理才能根治。
  </Accordion>

  <Accordion title="API易 能在服务端帮我修吗？">
    修不了。这类失败发生在你本机和 API易 之间的代理上，请求往往根本没有到达 API易，或者是代理主动断开了连接，服务端没有办法干预。
  </Accordion>

  <Accordion title="绕开代理之后还是有 502，怎么办？">
    先看响应头：如果带 `Server`、`Date`，正文是 HTML 或 JSON，那就是平台侧的 502，按 [网站或接口返回 502 怎么办](/faq/website-502-error) 处理。如果持续出现，请把出错时间（注明时区，如 `14:30 (UTC+8)`）和完整响应发给客服。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="网站或接口返回 502 怎么办？" icon="refresh-cw" href="/faq/website-502-error">
    平台侧 502：容器短暂重启，约 1 分钟恢复
  </Card>

  <Card title="使用 API 接口需要代理网络吗？" icon="wifi" href="/faq/network-proxy">
    国内可直连，不需要代理或 VPN
  </Card>

  <Card title="图片 API 延迟如何优化？" icon="gauge" href="/faq/image-api-network-latency-optimization">
    HTTP 接口、连接复用与超时设置
  </Card>

  <Card title="如何避免接口超时？" icon="timer" href="/faq/timeout-configuration">
    timeout 设置与逐层排查
  </Card>
</CardGroup>
