> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 日志显示调用已完成并扣费，客户端却收不到响应，怎么排查？

> 控制台日志的「用时」只记到网关处理结束，客户端要等到最后一个字节和收尾信号——本文给出把差值定位到具体环节的测量方法、两台服务器之间的测速办法，以及打点日志该记哪些字段。

## 简短回答

<Info>
  **控制台日志的「用时」和你客户端的超时，量的不是同一段时间。**

  * 日志的用时记到**网关处理结束**为止；
  * 你的客户端要等到**响应体最后一个字节收完、且连接给出收尾信号**才算拿到结果。

  所以「日志显示 280 秒就完成了，我这边 600 秒超时都没拿到数据」是可能出现的，**并且这次请求确实成功了、确实计费了**——差值落在日志没有覆盖的那几段上。

  本文教你把这个差值**量出来**，定位到具体环节，再对症处理。
</Info>

本文针对**非流式的大响应**调用：出图接口返回 base64 是最典型的场景（响应体动辄几 MB 到几十 MB），非流式的长文本输出同理。流式调用和小响应一般不受影响。

## 日志的「用时」到底记了哪一段

一次调用的完整耗时可以拆成五段：

```
客户端总耗时 = 建立连接 + 上行写入 + 上游生成 + 下行回流 + 等收尾信号
                            └─ 控制台日志的「用时」只覆盖这一段 ─┘
```

| 环节                    | 谁在耗时                      | 计入控制台日志？         |
| --------------------- | ------------------------- | ---------------- |
| 建立连接（DNS / TCP / TLS） | 你的网络到我们入口                 | ❌                |
| 上行写入（把请求体发完）          | 你的**上行**带宽；带参考图时请求体也有数 MB | ❌                |
| 上游生成                  | 模型真正在出图 / 推理              | ✅ **这就是日志显示的用时** |
| 下行回流（把响应体收完）          | 你的**下行**带宽，与并发数强相关        | ❌                |
| 等收尾信号                 | HTTP 分块传输的终止块             | ❌                |

<Warning>
  **差值不会出现在任何一个日志字段里。**

  我们内部用裸 socket 做过对照实测：同一批请求，后台记录的用时是 5 秒、状态成功，而客户端实际等了 37~~40 秒才拿到完整响应。中间那 31~~35 秒发生在网关处理结束**之后**，任何一个 duration 字段都没有记录它。

  所以：**用日志的用时去反驳「我这边等了很久」是无效的**，两个数本来就不冲突。要判断问题在哪，必须在客户端做分段计时。
</Warning>

控制台日志与[日志查询 API](/api-capabilities/log-query) 里可用的字段：`duration_for_view`（本次调用耗时，单位秒）、`is_stream`（是否流式）、`request_id`（报障时提供这个）。

## 第一步：用一条 curl 把差值定位到具体环节

这是整个排查的入口，先跑这一条，再决定往下看哪一节。

```bash theme={null}
curl -sS -o /dev/null --max-time 900 \
  -w 'connect=%{time_connect} pretransfer=%{time_pretransfer} ttfb=%{time_starttransfer} total=%{time_total} bytes=%{size_download} speed=%{speed_download}\n' \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -H "Content-Type: application/json" \
  -X POST https://api.apiyi.com/v1/images/generations \
  -d '{"model":"gpt-image-2-vip","prompt":"a watercolor mountain village","size":"2048x2048"}'
```

三个派生指标，把上面的原始数字换算成有意义的分段：

| 指标     | 算法                               | 含义                            |
| ------ | -------------------------------- | ----------------------------- |
| 上行耗时   | `pretransfer − connect`          | 把请求体发完花了多久                    |
| 生成耗时   | `ttfb − pretransfer`             | **≈ 控制台日志的用时**                |
| 下行耗时   | `total − ttfb`                   | 收完响应体花了多久                     |
| 实际下行速率 | `size_download / (total − ttfb)` | 也可以直接读 `speed_download`（字节/秒） |

### 判读表

拿上面的数字对号入座，这张表决定你接下来该做什么：

| 你观测到                                  | 差值落在            | 下一步                                                       |
| ------------------------------------- | --------------- | --------------------------------------------------------- |
| `ttfb` ≈ 日志用时，且 `total` ≈ `ttfb`      | 没有差值，就是模型本身慢    | [如何避免接口超时](/faq/timeout-configuration) 调大 timeout         |
| `total − ttfb` 很大，`speed_download` 很低 | **下行带宽不足**      | 本页「两台服务器之间怎么测速」+「降低响应体体积」                                 |
| `total − ttfb` 很大，但字节数早就收齐、末尾长时间没有新数据 | **收尾信号没来**      | [出图请求收尾卡住](/api-capabilities/image-tail-stall)            |
| `pretransfer − connect` 很大            | **上行慢**，参考图体积过大 | 把单张输入图压到 1.5MB 以内再传                                       |
| 中途报 `ECONNRESET` / SSL EOF            | **下行断连**        | [图片 API 连接中断排查](/api-capabilities/image-connection-drops) |
| curl 跑起来正常，只有业务代码超时                   | **客户端侧**        | 本页「客户端侧最容易被忽略的三条」                                         |

<Tip>
  跑一次不够。这类问题**成时间窗发作**——窗内连续多次全中，窗外连续几十次全正常。建议连续跑 10 次取分布，并记下发生时间（UTC+8）。
</Tip>

## 第二步：怎么把「数据到齐但没收尾」量出来

如果判读表指向第三行，需要更细的观测：逐块读响应，记录每一块的到达时间和块间停顿。关键是要能回答一个问题——**最后一个字节到齐之后，连接还空转了多久**。

<Tabs>
  <Tab title="Python">
    ```python theme={null}
    import json, os, time, urllib.request

    body = json.dumps({
        "model": "gpt-image-2-vip",
        "prompt": "a watercolor mountain village",
        "size": "2048x2048",
    }).encode()

    req = urllib.request.Request(
        "https://api.apiyi.com/v1/images/generations",
        data=body,
        headers={
            "Authorization": "Bearer " + os.environ["APIYI_API_KEY"],
            "Content-Type": "application/json",
        },
    )

    t0 = time.monotonic()
    resp = urllib.request.urlopen(req, timeout=900)
    ttfb = time.monotonic() - t0            # 响应头到达 ≈ 上游生成结束

    chunks, total, last = [], 0, time.monotonic()
    while True:
        buf = resp.read(65536)
        now = time.monotonic()
        if not buf:
            break
        total += len(buf)
        chunks.append((round(now - t0, 3), round(now - last, 3), total))
        last = now
    t_end = time.monotonic() - t0

    transfer = t_end - ttfb
    max_gap = max((gap for _, gap, _ in chunks), default=0)
    p99_at = next((t for t, _, cum in chunks if cum >= total * 0.99), ttfb)

    print(json.dumps({
        "ttfb_s": round(ttfb, 2),                 # ≈ 控制台日志的用时
        "transfer_s": round(transfer, 2),         # 下行回流
        "total_s": round(t_end, 2),               # 你的体感耗时
        "body_bytes": total,
        "down_KBps": round(total / 1024 / transfer, 1) if transfer > 0.001 else None,
        "max_gap_s": max_gap,                     # 块间最大停顿
        "tail_99_s": round(t_end - p99_at, 2),    # 最后 1% 的字节花了多久
    }, ensure_ascii=False))
    ```
  </Tab>

  <Tab title="Node.js">
    ```javascript theme={null}
    const t0 = Date.now();
    const resp = await fetch("https://api.apiyi.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.APIYI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-2-vip",
        prompt: "a watercolor mountain village",
        size: "2048x2048",
      }),
    });
    const ttfb = (Date.now() - t0) / 1000;

    const reader = resp.body.getReader();
    const curve = [];
    let total = 0, maxGap = 0, last = Date.now();
    while (true) {
      const { done, value } = await reader.read();
      const now = Date.now();
      if (done) break;
      total += value.length;
      maxGap = Math.max(maxGap, (now - last) / 1000);
      curve.push([(now - t0) / 1000, total]);
      last = now;
    }
    const totalS = (Date.now() - t0) / 1000;
    const p99At = (curve.find(([, cum]) => cum >= total * 0.99) || [ttfb])[0];

    console.log({
      ttfb_s: ttfb,
      transfer_s: totalS - ttfb,
      total_s: totalS,
      body_bytes: total,
      down_KBps: total / 1024 / (totalS - ttfb),
      max_gap_s: maxGap,
      tail_99_s: totalS - p99At,
    });
    ```
  </Tab>
</Tabs>

**判定口径**：`tail_99` 超过 30 秒，或 `max_gap` 超过 30 秒，就记一次「尾部扣留」。典型形态是 `max_gap` 出现在字节数已达 100% 的位置——也就是数据一个不少地到齐了，之后才开始空等。

<Warning>
  **别用一个超时值兜住三个阶段。**

  这是最容易踩的坑：把「等首字节」和「等传输」用同一个 timeout 兜住，会把两件根因完全不同的事混成同一种失败。

  | 阶段         | 含义                | 建议值       |
  | ---------- | ----------------- | --------- |
  | 等首字节       | 上游正在生成，**慢不等于故障** | 120–180 秒 |
  | 块间停顿       | 已经在传输了，却突然不动      | 20–30 秒   |
  | 数据到齐后等收尾信号 | 宽限期，超过就主动收尾       | 3–5 秒     |

  分开设之后，日志里能直接看出是「生成慢」还是「传完了不收尾」，不用再猜。
</Warning>

## 第三步：两台服务器之间怎么测速

### 你自己的两台机器之间

用 `iperf3` 直接打真实吞吐，这是最准的：

```bash theme={null}
# 服务端（被测那台）
iperf3 -s

# 客户端（发起那台）：正向 30 秒、4 条并行流
iperf3 -c <服务端IP> -t 30 -P 4

# 加 -R 测反向，两个方向都要看——出图瓶颈在下行
iperf3 -c <服务端IP> -t 30 -P 4 -R
```

### 你的服务器到我们接口

**这一段没法用 iperf3**——我们不提供 iperf 服务端。改用真实调用测出来的有效速率：

```bash theme={null}
# 连续 10 次，取 speed_download 的中位数当作有效下行带宽（字节/秒）
for i in $(seq 1 10); do
  curl -sS -o /dev/null --max-time 900 \
    -w '%{time_starttransfer} %{time_total} %{size_download} %{speed_download}\n' \
    -H "Authorization: Bearer $APIYI_API_KEY" -H "Content-Type: application/json" \
    -X POST https://api.apiyi.com/v1/images/generations \
    -d '{"model":"gpt-image-2-vip","prompt":"test","size":"1024x1024"}'
done
```

配合链路质量一起看：

```bash theme={null}
mtr -rwzbc 100 api.apiyi.com        # 路由每一跳的丢包与延迟
ss -tin state established           # TCP 重传次数、RTT、拥塞窗口
```

<Warning>
  **如果判读表指向「收尾信号没来」，`mtr` / `ping` 这类工具完全无效。** 那种情况下数据一个字节都没丢，链路质量是好的，测不出任何异常——查错方向就跑偏了。先用上一节的脚本确认是不是这一类，再决定要不要查网络。
</Warning>

### 算一下你的带宽够不够

出图的响应体是一整块 base64，实测体积量级：

| 场景                   | 响应体大小    |
| -------------------- | -------- |
| `gpt-image-2` 系列默认尺寸 | 约 2.6 MB |
| Gemini 系列 2K         | 约 13 MB  |
| Gemini 系列 4K         | 约 35 MB  |

base64 编码本身还会让体积膨胀约 33%。独占带宽时的下行耗时：

| 出口带宽     | 2.6 MB | 13 MB  | 35 MB |
| -------- | ------ | ------ | ----- |
| 100 Mbps | 0.2 秒  | 1.0 秒  | 2.8 秒 |
| 10 Mbps  | 2.1 秒  | 10.4 秒 | 28 秒  |
| 2 Mbps   | 10.4 秒 | 52 秒   | 140 秒 |

**关键在于这张表是独占带宽的理想值。** 实际上：

```
单个请求可用带宽 = 出口带宽 ÷ 同时在飞的请求数
```

举个例子：出口 10 Mbps、并发 30 个出图请求、每个响应体 2.6 MB，则每个请求只分到约 0.04 MB/s，**光下行就要 62 秒**——而这 62 秒在控制台日志里一秒都看不到。并发再翻一倍，这个数字也跟着翻倍。

<Tip>
  这就是为什么「白天忙时超时、夜里同样的代码正常」。不是模型变慢了，是带宽被并发分摊了。
</Tip>

## 第四步：打点日志该记哪些字段

要把现象说清楚（无论是自己定位还是发给我们），每次调用至少记这些：

| 字段              | 怎么取                                                | 为什么要它                       |
| --------------- | -------------------------------------------------- | --------------------------- |
| 请求 ID           | 响应头，不同模型头名不同（`request-id` 或 `x-request-id`），两个都读一下 | 我们按这个查后台日志                  |
| 发起时间            | 客户端本地时间，**标注时区**                                   | 用来和后台日志、故障时间窗对齐             |
| 首字节耗时           | `ttfb`                                             | 与后台「用时」对照                   |
| 末字节时间           | 最后一块数据到达的时刻                                        | 和总耗时的差 = 空等收尾的时间            |
| 总耗时             | 到拿到完整响应为止                                          | 你的真实体感                      |
| 响应体字节数          | 累加读到的长度                                            | 用来算速率、判断是否收齐                |
| 下行速率            | 字节数 ÷ 下行耗时                                         | 低速率 = 带宽问题                  |
| **该时刻同时在飞的请求数** | 自己的并发计数器                                           | **最关键的一列**，没有它无法把「慢」和「并发」对上 |

最后一列经常被漏掉，但它往往是结论本身：把速率和并发数画在一起，如果速率随并发上升而成比例下降，带宽就是瓶颈，不用再往别处找。

**怎么用这张表**：把它和控制台日志的 `duration_for_view` 并排比——

* 两者接近 → 问题在下行传输，看带宽和并发；
* 差得很远 → 问题在收尾信号或客户端侧。

## 能立刻降低风险的四件事

<Steps>
  <Step title="改用 URL 输出，这是收益最大的一招">
    `gpt-image-2-vip` 和 `gpt-image-2-all` 支持 `response_format: "url"`，返回图片链接而不是 base64。**响应体从约 2.6 MB 降到约 0.3 KB**——下行传输和收尾信号两类问题会同时消失（小响应带 `Content-Length`，客户端自己就知道读完了）。

    强依赖 URL 输出的业务，把令牌分组切到 `image2_OSS`：确定性输出 URL、不会在资源紧张时降级为 base64，而且是 **1x 倍率不加价**。

    <Warning>
      官转 `gpt-image-2` **不支持**这个参数，传了会直接返回 400 `unknown_parameter`。它目前只有 base64 一条输出路径。
    </Warning>
  </Step>

  <Step title="把响应体压小">
    仍需 base64 时：用 `output_format=jpeg` 配合 `output_compression`，比 PNG 体积小一半以上；按实际用途降低 `size` 与 `quality`，不要默认拉满 4K。输入参考图也压到 1.5MB 以内，上行同样受益。
  </Step>

  <Step title="把并发控制在带宽能承受的范围">
    用上一节的公式反推：`可接受的下行耗时 × 出口带宽 ÷ 单张体积` 就是并发上限。超过这个数，加并发只会让每个请求都变慢，总吞吐不涨。各模型的并发限制见 [API 可以开多少并发](/faq/api-concurrency)。
  </Step>

  <Step title="超时分三段设，并在数据到齐时主动收尾">
    按前面的表分别设置等首字节、块间停顿、收尾宽限三个超时。数据已经到齐却等不到收尾信号时，主动把手里的响应交给业务——完整的兼容代码见[出图请求收尾卡住](/api-capabilities/image-tail-stall)。
  </Step>
</Steps>

## 常见疑问

<AccordionGroup>
  <Accordion title="没拿到结果，为什么还照常扣费？">
    因为计费发生在**网关处理结束时**，而这时上游确实已经把结果生成并返回了。客户端后续能不能收到，不改变这次调用已经产生的成本。实测对照：客户端在 5 秒时主动断开，与完整跑完的扣费**完全相同**。

    反过来用，这条是最强的判据：**有计费记录，说明请求确实跑到了上游并成功了**，问题一定在「网关处理结束之后」或「请求真正发出之前」，不用再怀疑上游。

    图片接口没有异步任务 ID，断开就拿不回结果，这一点见[图片生成有异步接口吗](/faq/image-async-api)。
  </Accordion>

  <Accordion title="把 timeout 从 600 秒再调大到 1200 秒，有用吗？">
    分情况，这也是为什么必须先测一次再动手：

    * **下行慢**（速率低、字节还在持续增长）：有用，调大就能拿到结果。
    * **收尾信号没来**（字节早已收齐、末尾长时间零新增）：**没用**。实测这种状态下持续等待 330 秒，一个新字节都不会再来，调大超时只是把故障暴露得更晚。这种情况要在客户端主动收尾。
  </Accordion>

  <Accordion title="这到底是我这边的问题，还是你们网关的问题？">
    两边都可能，所以才要先测。我们把两边的判据都摆出来：

    * **偏你这边**：`speed_download` 明显偏低、速率随并发上升而下降、`mtr` 看到丢包、或 curl 正常而只有业务代码超时。
    * **偏我们这边**：字节早已收齐、末尾长时间零新增数据。网关侧确实存在过「收尾信号推迟」的问题（根因是出图路径的记账阻塞了请求处理），已随上游版本于 **2026 年 8 月 13 日**修复并验证。即便在完全健康的时段，仍有约 4% 的请求要多等 10\~79 秒才收到收尾信号——这些请求的数据其实早就传完了。

    测完把分段数据发我们，比描述「很慢」有效得多。要带哪些字段见下一节。
  </Accordion>

  <Accordion title="有异步接口吗？不想一直挂着连接">
    目前图片生成均为同步调用，没有任务 ID 查询接口。异步方式在规划中，上线后会另行公告。

    在此之前，推荐在自己这一侧包一层异步外壳（提交即返回本地任务 ID，后台 worker 跑同步调用），做法见[自建异步队列](/api-capabilities/image-async-queue)。
  </Accordion>

  <Accordion title="换个接入地址或者换台机器能绕开吗？">
    看是哪一类。带宽不足是你的出口决定的，换我们的入口地址没用，要么扩带宽、要么降体积、要么降并发。收尾信号那一类在故障窗内是多个落点同时出现、又同时恢复的，换域名同样绕不开。

    唯一要避开的是 CDN 节点：`api-cf.apiyi.com` 走 Cloudflare，约 100 秒会返回 `524`，不适合跑出图这类长请求。
  </Accordion>
</AccordionGroup>

## 客户端侧最容易被忽略的三条

如果 curl 测下来一切正常，只有业务代码超时，往这三个方向查：

1. **超时语义不是你以为的那个**。600 秒到底是总超时，还是只是读超时？Node 的 `undici` 有 `headersTimeout` / `bodyTimeout` / `connect.timeout` 三个独立超时，默认值远小于你在外层设的那个数，只改外层不生效。
2. **连接池排队**。连接池被占满时，请求还没真正发出去就已经开始计时了。这段等待在我们这边完全看不见——后台日志里根本没有这条请求，直到它真正发出。判断方法：日志里查不到对应记录，基本就是这一类。
3. **中间还有一层**。自建 nginx 的 `proxy_read_timeout` 默认 60 秒，负载均衡、API 网关、Serverless 平台各自都有超时上限。把链路上每一跳的超时都列出来，取最小值才是你的真实超时。

## 上报时请提供

自查之后仍需要我们协助，请把这些一起发过来，可以少来回好几轮：

* **请求 ID**（几条即可，不用全量）
* **分段计时**：首字节耗时 / 末字节时间 / 总耗时 / 响应体字节数
* **发生时间**，标注时区（如 `2026-08-13 15:57 (UTC+8)`）
* **当时的并发数**和出口带宽
* 用的是哪个**模型**和**令牌分组**

## 相关文档

<CardGroup cols={2}>
  <Card title="如何避免接口超时？" icon="timer" href="/faq/timeout-configuration">
    各场景该设多少 timeout，以及节点选择
  </Card>

  <Card title="出图请求收尾卡住" icon="hourglass" href="/api-capabilities/image-tail-stall">
    数据已到齐但连接不结束时的客户端兼容代码
  </Card>

  <Card title="图片 API 连接中断排查" icon="unplug" href="/api-capabilities/image-connection-drops">
    ECONNRESET、SSL EOF 一类下行断连的定位
  </Card>

  <Card title="API 可以开多少并发？" icon="gauge" href="/faq/api-concurrency">
    各类模型的并发限制与配额申请
  </Card>

  <Card title="图片 API 调用须知与最佳实践" icon="image" href="/api-capabilities/image-api-best-practices">
    各图片模型的 timeout 速查表与输出格式对照
  </Card>

  <Card title="怎么看懂日志里的计费金额？" icon="receipt" href="/faq/log-billing-explained">
    后台日志各列的含义与计费口径
  </Card>
</CardGroup>

## 联系我们

<CardGroup cols={2}>
  <Card title="企业微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企业微信客服二维码" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    扫码添加 或 [点击联系客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    出图超时、下行慢排查
  </Card>

  <Card title="邮件咨询" icon="mail">
    **客服邮箱**：[support@apiyi.com](mailto:support@apiyi.com)

    **商务合作**：[business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
