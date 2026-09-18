> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 下载 CDN 图片/视频很慢怎么办？

> API易 的图片与视频资源由 Cloudflare R2 全球 CDN 托管，本文帮你排查海外 CDN 在特定服务器上下载慢的常见原因与解决方案。

## 简短回答

API易 生成的图片与视频（如 Veo 3.1、Sora、Nano Banana 等模型的产物）统一托管在 **Cloudflare R2 全球 CDN**，理论上全球访问速度都很快。如果你的服务器下载很慢，**绝大多数情况是你所在服务器到 Cloudflare 边缘节点的网络链路问题**，而不是 CDN 本身的问题 —— 尤其是中国大陆服务器访问海外 CDN 时，容易受到跨境带宽、运营商路由、本地 DNS 解析等因素影响。

<Info>
  **重点提示**

  Cloudflare R2 的资源 URL 通常形如 `*.r2.cloudflarestorage.com` 或通过 Cloudflare 代理的自定义域名。是否能快速下载，取决于你的服务器能否高效访问到最近的 Cloudflare 边缘节点。
</Info>

## 常见原因分析

<CardGroup cols={2}>
  <Card title="跨境网络拥塞" icon="network">
    中国大陆服务器访问海外 CDN 时，国际出口带宽在高峰期容易拥塞，导致下载缓慢甚至间歇性超时。
  </Card>

  <Card title="运营商路由绕行" icon="route">
    部分云厂商或机房的国际路由会绕行美西、欧洲，实际链路延迟远高于直连节点。
  </Card>

  <Card title="DNS 解析异常" icon="globe">
    本地 DNS 可能把 Cloudflare 域名解析到较远的边缘节点（如美西），而非就近的亚太节点。
  </Card>

  <Card title="防火墙/安全组限制" icon="shield">
    部分服务器对境外 IP 段、443 端口或特定 CDN 域名存在出站限制，会降低连接质量。
  </Card>

  <Card title="HTTP/2 与连接复用" icon="plug">
    下载端未启用 HTTP/2 或未复用 TCP 连接，每个文件单独建连会显著放大延迟。
  </Card>

  <Card title="单线程串行下载" icon="gauge">
    大文件或多文件使用单线程串行下载，无法利用 CDN 的多路复用优势。
  </Card>
</CardGroup>

## 排查步骤

<Steps>
  <Step title="确认是单机问题还是全局问题">
    在本地电脑 / 其他服务器上尝试下载同一个 CDN URL。

    * 如果本地电脑很快、服务器慢 → **服务器网络链路问题**
    * 如果所有环境都慢 → 请联系客服，提供具体 URL
  </Step>

  <Step title="测试到 CDN 的基础网络">
    使用 `ping`、`mtr`、`traceroute` 等工具测试到 CDN 域名的延迟与丢包：

    ```bash theme={null}
    # 测试延迟与路由
    ping <cdn-host>
    mtr -rwc 30 <cdn-host>
    traceroute <cdn-host>
    ```

    如果出现大量丢包、延迟超过 200ms 或路由绕行境外，说明底层链路存在问题。
  </Step>

  <Step title="测试实际下载速度">
    使用 `curl` 查看下载耗时与吞吐：

    ```bash theme={null}
    curl -o /dev/null -w "dns:%{time_namelookup} connect:%{time_connect} \
    ttfb:%{time_starttransfer} total:%{time_total} speed:%{speed_download}\n" \
    "<CDN URL>"
    ```

    重点关注：

    * `time_namelookup`：DNS 解析耗时
    * `time_connect`：TCP 建连耗时
    * `time_starttransfer`：首字节耗时（TTFB）
    * `speed_download`：平均下载速率（字节/秒）
  </Step>

  <Step title="检查 DNS 解析结果">
    ```bash theme={null}
    dig <cdn-host>
    nslookup <cdn-host>
    ```

    查看解析出的 IP 是否就近（亚太用户应解析到亚太节点）。若解析到远端，可尝试更换公共 DNS。
  </Step>

  <Step title="检查服务器出站限制">
    确认云厂商的安全组、防火墙规则是否放行了 443 端口和境外 IP 段，以及是否存在带宽限速。
  </Step>
</Steps>

## 解决方案

### 方案一：更换公共 DNS（最简单）

国内服务器默认 DNS 经常把 Cloudflare 解析到较远节点，建议改为以下公共 DNS：

```bash theme={null}
{/* /etc/resolv.conf */}
nameserver 1.1.1.1        # Cloudflare
nameserver 8.8.8.8        # Google
nameserver 223.5.5.5      # 阿里 DNS
nameserver 119.29.29.29   # 腾讯 DNS
```

<Tip>
  优先使用 `1.1.1.1` —— 它是 Cloudflare 自家的 DNS，能解析到最近的 Cloudflare 边缘节点，对 R2 / Cloudflare CDN 友好度最高。
</Tip>

### 方案二：优化下载方式

<CardGroup cols={2}>
  <Card title="并发下载" icon="layers">
    多文件场景使用并发下载（如 `aria2c -x 8`、Python `asyncio + httpx`），充分利用带宽。
  </Card>

  <Card title="断点续传" icon="refresh-cw">
    大视频文件启用 HTTP Range 分块下载 + 失败重试，避免单次失败重头下载。
  </Card>

  <Card title="连接复用" icon="plug">
    使用支持 HTTP/2 或 keep-alive 的客户端（如 `httpx`、`requests.Session()`），避免频繁建连。
  </Card>

  <Card title="流式落盘" icon="hard-drive">
    下载时流式写入磁盘，避免把整个视频读入内存导致 OOM 或卡顿。
  </Card>
</CardGroup>

**Python 示例（推荐）**：

```python theme={null}
import httpx
import asyncio

async def download(url: str, path: str):
    async with httpx.AsyncClient(http2=True, timeout=120) as client:
        async with client.stream("GET", url) as resp:
            resp.raise_for_status()
            with open(path, "wb") as f:
                async for chunk in resp.aiter_bytes(chunk_size=1024 * 256):
                    f.write(chunk)

asyncio.run(download("<CDN URL>", "output.mp4"))
```

**aria2c 示例（命令行）**：

```bash theme={null}
aria2c -x 8 -s 8 -k 1M --file-allocation=none "<CDN URL>"
```

### 方案三：更换服务器所在区域

如果你的应用场景允许，优先选择**网络质量更好的机房**来访问海外 CDN：

<CardGroup cols={2}>
  <Card title="海外服务器（推荐）" icon="globe">
    AWS / GCP / Azure / Cloudflare Workers 等海外机房访问 Cloudflare R2 延迟极低，通常仅 10-50ms。
  </Card>

  <Card title="中国大陆：三网优化机房" icon="server">
    如果必须在中国大陆部署，选择带三网 BGP + 国际优化链路（CN2 GIA、CMI、AS9929 等）的机房，延迟与稳定性更好。
  </Card>

  <Card title="中国香港/新加坡" icon="network">
    作为折中方案，港新机房对大陆延迟低（30-80ms），对 Cloudflare 亚太节点也很友好。
  </Card>

  <Card title="避免低价 VPS" icon="triangle-alert">
    部分低价机房国际出口拥塞严重，高峰期下载速度可能降到几十 KB/s，不建议用于对 CDN 下载有要求的业务。
  </Card>
</CardGroup>

### 方案四：中转落盘（终极方案）

如果你的服务器访问 Cloudflare CDN 确实非常慢，且无法更换机房，可以考虑：

1. **使用海外服务器做中转**：在海外机房先把 CDN 资源下载到本地，再通过内部专线/国际优化链路回传到你的服务器
2. **对象存储中转**：把资源先同步到你自己的 OSS / COS / S3（如阿里云 OSS 境内 Bucket），后续业务从境内对象存储读取
3. **CDN 预热回源**：在业务侧先下载一次并缓存，后续请求走本地缓存

<Warning>
  **及时性提醒**

  API易 的图片/视频 CDN URL 通常有一定的有效期（具体以返回的 URL 为准）。建议业务收到回调后**尽快下载并持久化**到自己的存储，避免过期后资源失效。
</Warning>

## 常见问题

<AccordionGroup>
  <Accordion title="为什么本地电脑下载很快，服务器却很慢？">
    本地电脑走的是家庭宽带（通常有运营商国际加速），而云服务器走的是机房国际出口，两者的国际链路质量差异很大。请优先检查服务器所在机房的国际带宽质量，并参考上面的排查步骤。
  </Accordion>

  <Accordion title="更换 DNS 后为什么还是慢？">
    DNS 只影响解析到哪个 CDN 节点，如果底层国际带宽本身就拥塞，换 DNS 也无法根本解决问题。此时建议考虑换机房、走中转方案，或使用海外服务器做下载代理。
  </Accordion>

  <Accordion title="Cloudflare R2 在中国大陆是不是被限制了？">
    Cloudflare 的服务在中国大陆没有被封锁，但国际出口带宽在高峰期容易拥塞，且部分运营商路由不理想，导致访问速度不稳定。这是跨境网络的普遍情况，并非 R2 本身的问题。
  </Accordion>

  <Accordion title="视频文件很大，下载老是中断怎么办？">
    建议使用支持**断点续传**的下载工具（如 `aria2c`、`wget -c`），并设置合理的超时和重试次数。示例：

    ```bash theme={null}
    aria2c -x 8 -s 8 -c --max-tries=10 --retry-wait=3 "<CDN URL>"
    ```
  </Accordion>

  <Accordion title="可以让 API易 直接返回 Base64 而不是 CDN 链接吗？">
    视频文件体积大（几十 MB 到几百 MB），Base64 会额外膨胀约 33%，并且无法断点续传，反而更慢、更占带宽。**不建议** 将大文件转 Base64。对于图片等小文件，部分接口支持返回 Base64，具体请查看对应 API 文档。
  </Accordion>

  <Accordion title="如何验证瓶颈确实在网络链路而非 CDN？">
    在海外服务器（如 AWS 东京、新加坡）上测试同一个 CDN URL 的下载速度。如果海外很快、你的服务器很慢，基本可以确定是你所在服务器到 Cloudflare 的链路问题，而非 CDN 本身。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="网络代理配置" icon="network" href="/faq/network-proxy">
    如果国际网络不稳定，参考代理配置方案
  </Card>

  <Card title="API易服务器在哪里？" icon="server" href="/faq/server-location">
    了解 API易 API 服务器位置与网络延迟情况
  </Card>

  <Card title="Veo 视频生成 API" icon="video" href="/api-capabilities/veo/overview">
    查看视频生成接口的输出格式与有效期说明
  </Card>

  <Card title="联系客服" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    如果以上方案都无效，欢迎联系客服协助排查
  </Card>
</CardGroup>

<Info>
  **提交诊断信息**

  联系客服时，请附上以下信息以便快速定位问题：

  * 具体的 CDN URL（可脱敏关键参数）
  * 服务器所在地区与机房/云厂商
  * `mtr` 或 `traceroute` 的完整输出
  * `curl` 测速命令的时间统计输出
  * 出现问题的时间段（方便核对跨境链路监控）
</Info>
