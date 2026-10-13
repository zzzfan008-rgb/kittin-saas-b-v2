> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 开着代理调用出图，总在 90 秒左右断开？

> 本地开发时电脑开着 VPN/代理，出图请求在 90~180 秒成批断开、超时设得再长也没用，而且照样扣费。原因是代理会掐断长时间没有数据的连接，把 api.apiyi.com 设为直连即可解决。

## 症状

在自己电脑上开发、调试出图程序时，电脑开着 VPN 或代理软件（很多开发者是为了让 AI 编程工具正常联网），出现这些情况：

* 出图请求经常报连接中断，例如 `socket hang up`、`ECONNRESET`、`RemoteDisconnected`、`Connection aborted`
* 程序里的超时已经设到 600 秒甚至 900 秒，请求却在 **90\~180 秒**左右就断了
* 经常**好几张一起失败**，像是被一刀切掉
* 出图越慢的模型越容易中（如 `gpt-image-2-vip`，单张通常要 60\~120 秒）
* 到 [调用日志](/faq/call-logs) 里看，这些请求**大多有成功扣费的记录**

## 简短回答

<Info>
  **这不是并发限制，也不是 API易 的超时，而是你电脑上的代理把「一段时间没有数据」的连接掐断了。**

  出图期间，连接上本来就没有任何数据在传，图越慢出来，越容易被代理当成空闲连接回收。把 `api.apiyi.com` 设为直连（不走代理）就能解决，API易 在国内可以直接访问。
</Info>

## 为什么会这样

一次非流式的出图请求分三段：

1. **上传**：把提示词和参考图发出去，几秒到几十秒
2. **等待**：服务端出图，通常 60\~200 秒。**这期间连接上没有任何数据**
3. **下载**：图出好后一次性返回

问题出在第 2 段。代理软件和代理节点为了回收资源，会给每条连接设一个「空闲超时」：上传、下载两个方向都没有数据，超过这个时长就把连接断掉。以常见的 Xray / V2Ray 内核为例，对应配置叫 `connIdle`，默认 300 秒，但**节点服务端可以改得更短**，你在本机看不到、也改不了。我们处理过的案例里，这个值约为 90 秒。

所以：

* **程序里的 timeout 管不到它**。timeout 是你的程序愿意等多久，代理在中间先断了，程序只能收到「连接中断」
* **为什么一批一起断**：代理通常是定时巡检，每次把所有超过空闲时长的连接一起断开。同时在等图的几个请求会在同一秒失败
* **为什么聊天、写代码不受影响**：流式对话一直有数据在传，连接从来不会空闲；出图是几分钟里一个字节都没有

<Warning>
  **断开以后通常照样扣费。** 请求已经到达 API易 并开始出图，你这边断开不会让出图停下来，图照常生成、照常计费，只是结果回不到你的程序。请以 [调用日志](/faq/call-logs) 里的记录为准核对实际扣费，不要只看程序的报错数。
</Warning>

## 怎么确认是这个问题

<Steps>
  <Step title="看断开的时长和节奏">
    把失败请求从发出到报错的耗时打出来。如果集中在某个固定值附近（比如 90 秒、180 秒），且常有几个请求在**同一秒**一起失败，基本就是代理空闲超时。
  </Step>

  <Step title="对照调用日志">
    在 [调用日志](/faq/call-logs) 里找对应时间段：程序报了断开，日志里却有成功扣费的记录，说明 API易 这边已经出图完成，是回程的连接被断了。
  </Step>

  <Step title="设直连跑一小批对比">
    按下文把 `api.apiyi.com` 设为直连，同样的参数跑 10\~20 张。断开消失，就可以确认是代理的问题。
  </Step>
</Steps>

## 解决方法

<Tabs>
  <Tab title="代理软件设直连（推荐）">
    在代理软件里给 API易 加一条直连规则，其他流量照常走代理，AI 编程工具不受影响。

    Clash / Clash Verge / mihomo 的配置文件里，在 `rules` 最前面加：

    ```yaml theme={null}
    rules:
      - DOMAIN-SUFFIX,apiyi.com,DIRECT
      # ……原有规则
    ```

    v2rayN 等客户端：在「路由设置」里把 `apiyi.com` 加进直连（direct）列表。

    <Note>
      开着 **TUN 模式 / 全局模式**时，代理会接管电脑上所有程序的流量，代码里怎么设置都绕不开，只能用这种规则直连。
    </Note>
  </Tab>

  <Tab title="程序绕开代理">
    如果代理只是「系统代理」或环境变量代理（没开 TUN），也可以让程序自己不走代理：

    ```bash theme={null}
    # 运行程序前设置，API易 的域名不走代理
    # macOS / Linux
    export NO_PROXY="api.apiyi.com,.apiyi.com"
    # Windows PowerShell
    $env:NO_PROXY="api.apiyi.com,.apiyi.com"
    ```

    * **Python `requests` / `httpx`**：会自动读取系统代理，设 `trust_env=False` 即可关闭，写法见 [脚本报 502 但调用日志里查不到？](/faq/proxy-empty-502)
    * **Node.js**：原生 `fetch` 默认不读系统代理；如果你用了 `HTTPS_PROXY` 配合 `ProxyAgent`、`global-agent` 之类的库，请把 `api.apiyi.com` 排除在外；`axios` 可以在请求里传 `proxy: false`
  </Tab>

  <Tab title="一定要走代理">
    只有自建节点才能改服务端配置。把节点的空闲超时调到 600 秒以上（Xray / V2Ray 是 `policy.levels.<等级>.connIdle`）。用的是别人的节点就改不了，还是建议设直连。
  </Tab>
</Tabs>

## 部署到服务器后还会遇到吗？

**一般不会。** 服务器上通常不装代理，直连 API易，就不存在「代理掐断空闲连接」这一层。这也是生产环境推荐的部署方式：国内云服务器直接访问 `api.apiyi.com` 即可。

不过，服务器和 API易 之间如果还有别的中间层，它们同样有空闲超时，部署时顺手检查一下：

| 中间层 | 常见默认值 | 说明 |
| - | - | - |
| 云厂商 NAT 网关 / 负载均衡 | Azure 默认 4 分钟；AWS NAT 网关 350 秒 | 服务器没有公网 IP、经 NAT 出网时才涉及，多数可在控制台调大 |
| 自建 Nginx 反向代理 | `proxy_read_timeout` 默认 60 秒 | 在你的服务和 API易 之间加了一层 Nginx 时，必须调大，见 [如何避免接口超时？](/faq/timeout-configuration) |
| 服务器上也装了代理 | 取决于代理配置 | 与本地开发是同一个问题，同样设直连 |

单张出图通常在 60\~200 秒内完成，低于云厂商 NAT 的默认值。只有在你自己加了反向代理，或者服务器也走代理时，才需要特别处理。

## 常见疑问

<AccordionGroup>
  <Accordion title="开启 TCP keepalive 能解决吗？">
    对云厂商的 NAT 网关有用：keepalive 探测包能让 NAT 认为连接还活着。对代理软件基本无效：代理按「有没有实际数据」判断空闲，keepalive 探测包不算数据。本地开发遇到的这种断开，还是要靠直连解决。
  </Accordion>

  <Accordion title="为什么网页版控制台和 AI 编程工具都正常？">
    它们的请求要么很快就返回，要么是流式输出、一直有数据在传，连接从来不会空闲 90 秒以上。只有出图这种「几分钟没有数据、最后一次性返回」的请求才会撞上。
  </Accordion>

  <Accordion title="和「脚本报空 502」是同一个问题吗？">
    都是本机代理造成的，但现象不同。[空 502 那篇](/faq/proxy-empty-502) 是代理自己生成了一个没有正文的 502；本篇是连接在等图期间被直接掐断，程序收到的是连接中断。两种情况的解决方法相同：让 API易 的请求不走代理。
  </Accordion>

  <Accordion title="被断开的请求扣的费能退吗？">
    这类断开发生在你和 API易 之间的代理上，API易 侧出图已经完成并计费。如果金额较大，请把时间段（注明时区，如 16:30\~17:00 (UTC+8)）和用户名发给客服，我们会帮你核对调用日志。
  </Accordion>

  <Accordion title="有没有不需要长时间等待的调用方式？">
    目前出图接口是同步返回的，没有任务 ID 查询，详见 [图片生成有异步接口吗？](/faq/image-async-api)。设直连后，长时间等待本身不是问题。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="脚本报 502 但调用日志里查不到？" icon="unplug" href="/faq/proxy-empty-502">
    本机代理自造的空 502，脚本绕开系统代理即可
  </Card>

  <Card title="使用 API 接口需要代理网络吗？" icon="wifi" href="/faq/network-proxy">
    国内可直连，不需要代理或 VPN
  </Card>

  <Card title="如何避免接口超时？" icon="timer" href="/faq/timeout-configuration">
    timeout 设置与逐层排查
  </Card>

  <Card title="图片生成有异步接口吗？" icon="clock" href="/faq/image-async-api">
    同步返回的原因与客户侧异步包装
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.