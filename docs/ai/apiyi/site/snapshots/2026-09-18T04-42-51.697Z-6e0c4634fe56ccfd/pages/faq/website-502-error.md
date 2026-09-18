> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 网站或接口返回 502 怎么办？

> 502 是服务容器自动重启期间的短暂现象，一般 1 分钟内自动恢复——失败调用不计费，客户端加 30 秒重试即可无感跨过

## 简短回答

<Info>
  **502 是短暂现象，不需要做任何配置改动：**

  1. **根因是服务容器自动重启**——重启窗口内网页版打不开、API 也会报 502，两者是同一件事。
  2. **一般 1 分钟内自动恢复**——等 30-60 秒重新发起调用即可。
  3. **失败调用不计费**——502 期间请求没有真正打进服务，不会产生任何计费记录。
  4. **客户端建议加自动重试**——间隔 30 秒左右重试一次，就能无感跨过整个重启窗口。
</Info>

## 发生了什么

`502 Bad Gateway` 的含义是：**网关层收到了你的请求，但转发到后端服务时没有得到响应**。

在 API易 这边，绝大多数瞬时 502 的原因是**后端服务容器发生了一次自动重启**。重启期间后端进程短暂不可用，于是：

* **网页版**（控制台、充值页等）打不开或报错
* **API 接口**（`api.apiyi.com` 等所有节点）返回 502

两者由同一个后端服务支撑，所以会**同时出现、同时恢复**。系统检测到异常后会自动完成重启，整个过程**一般在 1 分钟内结束**，无需人工干预。

<Note>
  **这类 502 与你的代码、Key、余额、网络配置都无关**。如果你是第一次遇到，不需要排查客户端——先等 30-60 秒重试，绝大多数情况下就已经恢复了。
</Note>

## 你需要做什么

<Steps>
  <Step title="第一步：等 30-60 秒，重新发起请求">
    容器重启一般在 1 分钟内完成。API 调用直接重发即可；由于失败调用不计费，重试不会产生重复扣费。
  </Step>

  <Step title="第二步：网页版打不开时，强制刷新页面">
    恢复后浏览器可能仍显示缓存的错误页，使用 **Ctrl+Shift+R**（Windows）或 **Cmd+Shift+R**（Mac）强制刷新即可看到正常界面。
  </Step>

  <Step title="第三步：持续 502 超过 5 分钟，联系客服">
    瞬时重启不会超过几分钟。如果 502 **持续 5 分钟以上**，说明不是常规的自动重启，请通过页面底部的联系方式反馈给我们，并附上大致的发生时间（注明时区，如 `14:30 (UTC+8)`）。
  </Step>
</Steps>

## 给程序化调用加自动重试

如果你的业务对可用性敏感，建议在客户端为 502 这类瞬时错误加上自动重试——间隔 30 秒左右重试一次，即可覆盖整个重启窗口。

<Tabs>
  <Tab title="Python">
    ```python theme={null}
    import time
    from openai import OpenAI, InternalServerError

    client = OpenAI(
        api_key="YOUR_API_KEY",
        base_url="https://api.apiyi.com/v1",
        max_retries=0,  # 关闭 SDK 默认重试，由下面的逻辑接管
    )

    def chat_with_retry(messages, retries=2, wait=30):
        for attempt in range(retries + 1):
            try:
                return client.chat.completions.create(
                    model="gpt-4o",
                    messages=messages,
                )
            except InternalServerError:
                # 502 / 503 等 5xx：请求没有打进服务，不计费，可放心重试
                if attempt == retries:
                    raise
                time.sleep(wait)  # 容器重启一般 1 分钟内完成，等 30 秒再试

    resp = chat_with_retry([{"role": "user", "content": "你好"}])
    print(resp.choices[0].message.content)
    ```
  </Tab>

  <Tab title="Node.js">
    ```javascript theme={null}
    import OpenAI from "openai";

    const client = new OpenAI({
      apiKey: process.env.APIYI_API_KEY,
      baseURL: "https://api.apiyi.com/v1",
      maxRetries: 0, // 关闭 SDK 默认重试，由下面的逻辑接管
    });

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    async function chatWithRetry(messages, retries = 2, waitMs = 30_000) {
      for (let attempt = 0; ; attempt++) {
        try {
          return await client.chat.completions.create({
            model: "gpt-4o",
            messages,
          });
        } catch (err) {
          // 502 / 503 等 5xx：请求没有打进服务，不计费，可放心重试
          if (err.status < 500 || attempt >= retries) throw err;
          await sleep(waitMs); // 容器重启一般 1 分钟内完成，等 30 秒再试
        }
      }
    }

    const resp = await chatWithRetry([{ role: "user", content: "你好" }]);
    console.log(resp.choices[0].message.content);
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={null}
    # curl 的 --retry 会自动对 502/503/504 等瞬时错误重试
    curl https://api.apiyi.com/v1/chat/completions \
      --retry 2 --retry-delay 30 \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "gpt-4o",
        "messages": [{"role": "user", "content": "你好"}]
      }'
    ```
  </Tab>
</Tabs>

<Warning>
  **重试策略只用于 502/503 这类"没打进服务"的错误**。超时断开（客户端 timeout、`524`）的请求在服务端可能仍在执行并照常计费，盲目重试会造成重复扣费——这类问题请看 [如何避免接口超时](/faq/timeout-configuration)。
</Warning>

<Tip>
  如果你的调用频率很高，也可以用**指数退避**（首次 1 秒、2 秒、4 秒）先快速试探——网络抖动类的瞬时 502 通常几秒内就恢复；仍失败再回落到 30 秒间隔，覆盖容器重启的场景。
</Tip>

## 常见疑问

<AccordionGroup>
  <Accordion title="502 期间的请求会计费吗？">
    **不会**。502 意味着请求根本没有打进后端服务，没有产生任何模型消耗，因此**不会出现在计费记录里**。

    这也是一个实用的判断依据：如果某次报错的请求在 [调用日志](/faq/call-logs) 里查不到计费记录，说明它没有被服务端处理过，放心重发即可。
  </Accordion>

  <Accordion title="502 和超时、429、524 有什么区别？">
    * **`502`**：后端服务短暂不可用（容器重启中）。等 30-60 秒重试，不计费。
    * **超时 / 连接中断**：客户端 timeout 设置太短，服务端可能仍在执行且照常计费。见 [如何避免接口超时](/faq/timeout-configuration)。
    * **`429`**：并发或速率超限，与服务可用性无关。见 [API 可以开多少并发](/faq/api-concurrency)。
    * **`524`**：走了 CDN 节点（`api-cf.apiyi.com`）且请求超过约 100 秒，换节点即可。

    处理方向完全不同：**只有 502/503 适合直接重试**。
  </Accordion>

  <Accordion title="为什么网页版和 API 同时报错？">
    网页版控制台和 API 接口由同一个后端服务支撑。容器重启时两者会**同时不可用、同时恢复**——所以「网页也打不开」恰恰说明这是平台侧的瞬时问题，而不是你的客户端配置出了错。
  </Accordion>

  <Accordion title="这种情况会经常发生吗？">
    不会常态化。瞬时 502 通常与突发流量高峰有关，属于偶发现象。

    **2026 年 8 月我们已在进行后端服务器扩容升级**，此类瞬时 502 的发生频率会显著下降。如遇平台侧异常，我们会第一时间在 [实时动态](/live) 发布通报和恢复进展。
  </Accordion>

  <Accordion title="如何确认是平台问题还是我自己的网络问题？">
    两个快速判断方法：

    1. **打开网页版**：如果 `api.apiyi.com` 报 502 的同时网页版也打不开，基本可以确定是平台侧瞬时重启，等 1 分钟即可。
    2. **换网络测试**：用手机流量（不同运营商）访问网页版或执行下面的命令，能通则说明是你本地网络或代理的问题。

    ```bash theme={null}
    curl -I https://api.apiyi.com/v1/models \
      -H "Authorization: Bearer YOUR_API_KEY"
    ```

    如果换网络后依然全部 502 且持续超过 5 分钟，请联系客服。

    另外，如果网页版一直正常、只有脚本间歇报 502，而且响应正文为空、调用日志里也查不到这些请求，多半是本机代理软件自己生成的 502，见 [脚本报 502 但调用日志里查不到？](/faq/proxy-empty-502)。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="如何避免接口超时？" icon="timer" href="/faq/timeout-configuration">
    timeout 设置、推理模型耗时与 524 排查
  </Card>

  <Card title="使用 API 需要代理网络吗？" icon="wifi" href="/faq/network-proxy">
    国内直连说明与网络环境要求
  </Card>

  <Card title="API易的服务器在哪里？" icon="server" href="/faq/server-location">
    节点分布、延迟测试与选购建议
  </Card>

  <Card title="服务可用性与 SLA 保障" icon="shield-check" href="/faq/sla-guarantee">
    可用性承诺与故障响应机制
  </Card>
</CardGroup>

## 联系我们

<CardGroup cols={2}>
  <Card title="企业微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企业微信客服二维码" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    扫码添加，或点击本卡片直接联系客服

    持续 502 反馈、故障排查
  </Card>

  <Card title="邮件咨询" icon="mail">
    **客服邮箱**：[support@apiyi.com](mailto:support@apiyi.com)

    **商务合作**：[business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
