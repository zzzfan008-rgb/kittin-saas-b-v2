> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 下载 CDN 图片/视频很慢或超时怎么办？

> 出图接口已成功，下载图片/视频 URL 却很慢或 Read timed out？本文给出自助排查命令（含 Windows）、下载代码加固写法，以及提交给我们的信息清单。

## 简短回答

API易 生成的图片与视频（如 Veo 3.1、Sora、Nano Banana、gpt-image-2-vip 等模型的产物）多数以 URL 形式返回，托管在 Cloudflare 等全球 CDN 上。下载慢或超时，常见原因有两类：

* **你的服务器到 CDN 的网络链路**：中国大陆服务器访问海外 CDN 时，容易受跨境带宽、运营商路由、本地 DNS 解析影响
* **图片存储侧**：CDN 背后的存储节点偶发变慢时，所有线路都可能受影响

两类问题在你的程序里看到的报错几乎一样，单靠一台机器的测试很难区分。**请按下面的步骤自助测一遍，把结果发给我们**，我们对照存储侧状态一起判断，比来回沟通省时间得多。

<Info>
  **重点提示**

  Cloudflare R2 的资源 URL 通常形如 `*.r2.cloudflarestorage.com` 或通过 Cloudflare 代理的自定义域名。是否能快速下载，取决于你的服务器能否高效访问到最近的 Cloudflare 边缘节点。
</Info>

## 接口成功了，图片却下载不下来？

一次出图分两段：

1. 你的程序调用 API易 接口，生成图片，返回图片 URL
2. 你的程序再去这个 URL 下载图片

第 2 段由你的服务器**直接连接图片存储地址，不经过 API易 网关**。所以会出现：

* API易 日志里这条请求显示**成功并已计费** —— 图片确实已经生成好了
* 你的程序报 `Read timed out`、`Connection reset` 之类的错误，报错里的 host 是**图片域名**，而不是 `api.apiyi.com`
* `Read timed out` 表示连接已经建立，但之后长时间收不到数据。它不等于「连不上」，也不能单凭它判断问题出在哪一侧

<Tip>
  **URL 有效期内可以重复下载**（如 gpt-image-2-vip 为 48 小时），下载失败**不需要重新出图**，重试下载即可。代码写法见下文「方案二」。
</Tip>

<Warning>
  **检查你的告警文案**：接口调用失败时报 `api.apiyi.com`，下载图片失败时报图片域名，并注明「出图已成功」。两者混在一起，很容易把下载问题误判成接口故障。
</Warning>

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
  <Step title="拿到出口 IP 和 CDN 节点">
    图片域名走 Cloudflare 时，访问它的 `/cdn-cgi/trace` 路径，一条命令就能看到你的出口 IP 和被分配的节点。Linux / macOS / Windows cmd 通用：

    ```bash theme={null}
    curl -s -m 30 https://<图片域名>/cdn-cgi/trace
    ```

    重点看 `ip=`（出口 IP）、`colo=`（节点代码，如 HKG、SIN、LAX、FRA）、`loc=`（所在地区）三行。

    * **30 秒没有任何输出**：你的服务器连这个域名本身就不通，重点看第 4、5 步
    * **秒出结果**：连接正常，问题在传输阶段，继续第 3 步分段计时
  </Step>

  <Step title="对照：本机与服务器各测一次">
    在本地电脑和服务器上分别下载**同一个图片 URL**（命令见第 3 步）。

    * **本机快、服务器慢**：多半是服务器链路问题，但也可能是存储侧只对部分线路异常，两边结果都发给我们
    * **所有环境都慢**：大概率是存储侧问题，直接联系我们并附上 URL
  </Step>

  <Step title="测试到 CDN 的基础网络">
    使用 `ping`、`mtr`、`traceroute` 等工具测试到 CDN 域名的延迟与丢包：

    ```bash theme={null}
    # Linux / macOS：测试延迟与路由
    ping <cdn-host>
    mtr -rwc 30 <cdn-host>
    traceroute <cdn-host>
    ```

    ```bash theme={null}
    # Windows cmd
    tracert -d -w 1000 <cdn-host>
    ```

    想确认服务器到 Cloudflare 网络的整体吞吐，可以下载一份 5MB 的测试数据：
    `curl -o /dev/null -m 60 -w "total=%{time_total} speed=%{speed_download}\n" "https://speed.cloudflare.com/__down?bytes=5000000"`
    （Windows 把 `/dev/null` 换成 `NUL`）。它也慢，说明是服务器整体出网问题；它快、只有图片 URL 慢，就把结果发给我们。

    如果出现大量丢包、延迟超过 200ms 或路由绕行境外，说明底层链路存在问题。
  </Step>

  <Step title="测试实际下载速度">
    使用 `curl` 查看下载耗时与吞吐：

    <Tabs>
      <Tab title="Linux / macOS">
        ```bash theme={null}
        curl -4 -o /dev/null -m 60 -w "dns:%{time_namelookup} connect:%{time_connect} \
        tls:%{time_appconnect} ttfb:%{time_starttransfer} total:%{time_total} \
        size:%{size_download} speed:%{speed_download} ip:%{remote_ip}\n" \
        "<CDN URL>"
        ```
      </Tab>

      <Tab title="Windows cmd">
        ```bash theme={null}
        curl -4 -o NUL -m 60 -w "dns=%{time_namelookup} connect=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer} total=%{time_total} size=%{size_download} speed=%{speed_download} ip=%{remote_ip}\n" "<CDN URL>"
        ```

        直接粘贴到 cmd 窗口执行即可；写进 .bat 文件时要把 `%` 改成 `%%`。Windows 10 及以上自带 curl，Windows Server 2012 R2 等老系统需要自行安装。
      </Tab>
    </Tabs>

    `-m 60` 表示最多等 60 秒就退出并打印计时，不会一直卡住。把 `-4` 换成 `-6` 再测一次：如果只有其中一种协议卡住，可以让程序固定走正常的那一种。

    重点关注：

    * `time_namelookup`：DNS 解析耗时
    * `time_connect`：TCP 建连耗时
    * `time_appconnect`：TLS 握手完成时间，为 0 说明握手没成功
    * `time_starttransfer`：首字节耗时（TTFB）
    * `size_download`：实际收到的字节数，为 0 或很小说明连上了但传输卡住
    * `speed_download`：平均下载速率（字节/秒）
  </Step>

  <Step title="检查 DNS 解析结果">
    ```bash theme={null}
    dig <cdn-host>
    nslookup <cdn-host>
    ```

    查看解析出的 IP 是否就近（亚太用户应解析到亚太节点）。若解析到远端，可尝试更换公共 DNS。
  </Step>

  <Step title="检查服务器自身">
    「之前正常、今天突然不行」通常是服务器侧有变化，逐项确认：

    * 云厂商控制台：流量包是否用完、是否被限速、账户是否欠费
    * 带宽是否被其它进程占满（Windows：任务管理器 → 性能 → 以太网；Linux：`iftop`、`nload`）
    * 安全组、防火墙是否放行 443 端口和境外 IP 段，最近是否改过出站规则
    * 程序是否走了失效的代理：检查 `HTTP_PROXY` / `HTTPS_PROXY` 环境变量，Windows 另查 `netsh winhttp show proxy`
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

  <Card title="短超时 + 重试" icon="refresh-cw">
    连接超时和读取超时分开设，读取超时 30 秒左右，失败后重试 3\~4 次。卡住的连接换一条往往就通了，比干等 120 秒有效。
  </Card>

  <Card title="连接复用" icon="plug">
    使用支持 HTTP/2 或 keep-alive 的客户端（如 `httpx`、`requests.Session()`），避免频繁建连。
  </Card>

  <Card title="流式落盘" icon="hard-drive">
    下载时流式写入磁盘，避免把整个视频读入内存导致 OOM 或卡顿。
  </Card>
</CardGroup>

**Python 示例（推荐）**：

不要写成 `timeout=120` 单次下载。那样一旦连接卡住，要白等 120 秒，而且下载失败后整个出图任务都判失败，已生成、已计费的图片就浪费了。

```python theme={null}
import time
import httpx

# 连接 10 秒；读取 30 秒 = 多久没收到数据就放弃（不是总时长）
TIMEOUT = httpx.Timeout(connect=10, read=30, write=30, pool=10)

def download(url: str, path: str, attempts: int = 4) -> str:
    for i in range(attempts):
        try:
            with httpx.stream("GET", url, timeout=TIMEOUT, follow_redirects=True) as resp:
                resp.raise_for_status()
                with open(path, "wb") as f:
                    for chunk in resp.iter_bytes(chunk_size=256 * 1024):
                        f.write(chunk)
            return path
        except httpx.HTTPError as e:
            print(f"下载失败（第 {i + 1} 次）：{e!r}")
            time.sleep(2 * (i + 1))
    raise RuntimeError(f"图片已生成，但下载多次失败：{url}")

download("<CDN URL>", "output.png")
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
    本地电脑走家庭宽带，云服务器走机房国际出口，两者的链路质量可能差异很大，这是最常见的原因。

    但它**不是唯一原因**：图片存储侧的节点偶发异常时，也可能只影响部分线路，表现同样是「本机快、服务器慢」。所以请不要只凭这一点下结论，按排查步骤测完后把结果发给我们，我们对照存储侧状态一起判断。
  </Accordion>

  <Accordion title="报错写着「无法连接 api.apiyi.com」，详情里的 host 却是图片域名？">
    这通常是程序自己拼接的提示文案，真正失败的是**下载图片**这一步，出图接口已经成功。以详情里的 host 为准，并建议把两类错误的文案分开。
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

  自助排查后仍无法解决，请把以下信息发给我们，一次发全能省掉来回沟通：

  * 失败的图片 URL，以及对应的出图时间（或请求 ID）
  * `/cdn-cgi/trace` 的完整输出（本机和服务器各一份）
  * `curl` 分段计时的输出（`-4` 和 `-6` 各一次）
  * `tracert` / `mtr` 的输出，以及 5MB 测试数据的下载结果
  * 服务器所在的云厂商与地域
  * 开始异常的大致时间，请注明时区，如 `21:23 (UTC+8)`

  发截图前请先遮住屏幕上的 API Key。
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.