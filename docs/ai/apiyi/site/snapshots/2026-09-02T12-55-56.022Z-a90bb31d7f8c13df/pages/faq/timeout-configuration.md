> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 如何避免接口超时？

> 客户端 timeout 设置、推理型模型的耗时特点、Base URL 节点选择与 429 并发排查——一次讲清避免接口超时的四个关键点

## 简短回答

<Info>
  **三条黄金法则，覆盖 90% 的超时问题：**

  1. **图片类同步接口 timeout 设到 360 秒兜底**——图片生成没有异步任务 ID，客户端提前断开 = 照常计费但拿不到图。
  2. **推理型模型要留足时间**——`gemini-3.1-pro-preview`、`gpt-5.6-sol`、`gpt-5.5-pro` 等模型无论流式还是非流式，总耗时都可能达到几分钟。
  3. **别用 CDN 节点跑长请求**——`api-cf.apiyi.com` 走 Cloudflare，超过约 100 秒会返回 `524`，只适合快速文本调用。

  另外：若个别模型频繁出现 `429`（并发不足），可联系客服排查配额。
</Info>

## 一张表看懂该设多少 timeout

| 调用场景                        | 推荐 timeout    | 推荐节点                              | 备注           |
| --------------------------- | ------------- | --------------------------------- | ------------ |
| 普通文本对话（非推理）                 | 60-120 秒      | 任意节点                              | 通常几秒内返回      |
| 推理型模型（thinking / reasoning） | **300-600 秒** | `api.apiyi.com` / `vip.apiyi.com` | 流式与非流式都可能很慢  |
| 长文本输出（万字级）                  | **300 秒以上**   | `api.apiyi.com` / `vip.apiyi.com` | ❌ 不要用 CDN 节点 |
| 图片生成 / 编辑                   | **360 秒兜底**   | `api.apiyi.com` / `vip.apiyi.com` | ❌ 不要用 CDN 节点 |
| 4K 出图、多图参考                  | **600 秒**     | 同上                                | 详见图片最佳实践     |

<Warning>
  **超时断开仍然计费**

  客户端主动断开后，服务端与上游的生成任务**仍会跑完**，这次请求**照常计费**。

  也就是说：**timeout 设小了 = 花了钱却拿不到结果**。宁可一次性把 timeout 调到安全上限，也不要让请求"快成功了却被自己掐断"。
</Warning>

## 四个关键点详解

<AccordionGroup>
  <Accordion title="① 图片类同步接口：timeout 设到 360 秒">
    API易 的图片模型**全部是同步调用**——发出请求后保持连接等待，结果直接在响应体里返回。没有异步任务 ID，也没有轮询接口，断开就丢结果。

    **为什么默认值会误伤**：主流 HTTP 客户端默认超时普遍在 30-60 秒，而图片生成是真正的"长请求"：

    * GPT-Image-2 在 `high` 质量 + 2K/4K 下实测 3-5 分钟
    * Nano Banana 系列 4K 出图约 50 秒起步，高峰期更久
    * 多图参考类任务常常超过 5 分钟

    **实践建议**：不清楚具体模型耗时时，统一用 **360 秒**兜底；4K、多图参考等重任务给到 **600 秒**。按模型分档的精确推荐值见 [图片 API 调用须知与最佳实践](/api-capabilities/image-api-best-practices)。

    <Tip>
      出图偶尔"日志显示 30 秒完成，客户端却等了 5 分钟"——这是因为日志的用时只记到网关处理结束，而你要等到响应体收完并收到收尾信号。**调大 timeout 不一定管用**：下行慢的那一类有用，数据已到齐却等不到收尾信号的那一类没用。先按[日志显示已完成却收不到响应](/faq/log-duration-vs-client-wait)测一次，再决定怎么处理。
    </Tip>
  </Accordion>

  <Accordion title="② 推理型文本模型：流式和非流式都慢">
    普通文本模型通常几秒内就返回，容易让人误以为"文本调用不用管 timeout"。但**推理型（reasoning / thinking）模型是例外**：

    * `gemini-3.1-pro-preview`
    * `gpt-5.6-sol`
    * `gpt-5.5-pro`（更贵也更慢）
    * 其他开启了高思考预算（high reasoning effort）的模型

    这类模型会先进行长时间的内部推理再产出答案，**总耗时达到几分钟是常态**。

    **关键提醒：流式输出并不能解决超时问题**。很多人以为开了 `stream=True` 就会立刻有数据，但推理模型在思考阶段可能长时间不吐任何 token，客户端的 read timeout 一样会被触发；而且从首字到最后一个 token 的**总时长**依旧很长。

    **实践建议**：调用推理型模型时把 timeout 设到 **300-600 秒**，并把思考档位（`reasoning_effort` / `thinking`）与预期耗时对应起来——档位越高，需要留的时间越多。
  </Accordion>

  <Accordion title="③ Base URL 节点选择：CDN 节点不能跑长请求">
    API易 的 `api-cf.apiyi.com` 是套了 **Cloudflare 全球 CDN** 的接口地址。它的优势是全球加速、海外访问延迟低，但**存在约 100 秒的请求超时上限**，超过就会返回 `524` 错误。

    ⚠️ **注意：这不只影响图片接口**。任何可能超过 100 秒的调用都不适合走这个节点，包括：

    * ❌ 图片生成 / 编辑
    * ❌ 视频生成
    * ❌ 长文本输出（万字级文章、长篇翻译、大段代码生成）
    * ❌ 推理型模型的深度思考任务

    ✅ **适合**：普通文本对话、短文本生成等能在 100 秒内完成的快速调用。

    **实践建议**：长请求场景请改用 `api.apiyi.com`（中国大陆推荐）或 `vip.apiyi.com`（海外推荐）。完整节点对比见 [Base URL 配置指南](/faq/base-url-config)。
  </Accordion>

  <Accordion title="④ 遇到 429 并发不足：联系客服排查">
    如果超时的同时还伴随大量 `429 Too Many Requests`，那多半不是 timeout 的问题，而是**并发配额**问题。

    并发限制是**针对单一模型**的，不是整个账号共享。个别模型（尤其是刚上线或供给紧张的模型）可能配额偏低。

    **处理方式**：

    1. 先实现指数退避重试，避免瞬时打满
    2. 若长期、稳定地出现 429，**联系本站客服排查**——我们可以核查该模型的实际配额并协助调整

    并发规则详见 [API 可以开多少并发？](/faq/api-concurrency)
  </Accordion>
</AccordionGroup>

## 代码示例

<Tabs>
  <Tab title="Python">
    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(
        api_key="YOUR_API_KEY",
        base_url="https://api.apiyi.com/v1",  # 长请求不要用 api-cf 节点
    )

    # 按场景分档设置超时（秒），不要全局用一个值
    TIMEOUTS = {
        "text":      120,   # 普通文本
        "reasoning": 600,   # 推理型模型
        "image":     360,   # 图片生成兜底
        "image_4k":  600,   # 4K / 多图参考
    }

    resp = client.chat.completions.create(
        model="gpt-5.6-sol",
        messages=[{"role": "user", "content": "帮我分析这段代码的复杂度"}],
        timeout=TIMEOUTS["reasoning"],   # 推理模型留足 600 秒
    )
    print(resp.choices[0].message.content)
    ```
  </Tab>

  <Tab title="Node.js">
    ```javascript theme={null}
    import OpenAI from "openai";

    const client = new OpenAI({
      apiKey: process.env.APIYI_API_KEY,
      baseURL: "https://api.apiyi.com/v1",
      timeout: 600 * 1000,   // 毫秒，推理型模型留 600 秒
      maxRetries: 0,         // 长请求慎用自动重试，避免重复计费
    });

    const resp = await client.chat.completions.create({
      model: "gemini-3.1-pro-preview",
      messages: [{ role: "user", content: "写一篇 8000 字的技术分析" }],
    });
    console.log(resp.choices[0].message.content);
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={null}
    # --max-time 控制整个请求的最长时间（秒）
    curl https://api.apiyi.com/v1/images/generations \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      --max-time 360 \
      -d '{
        "model": "gpt-image-2",
        "prompt": "a serene mountain lake at sunrise",
        "size": "2048x2048"
      }'
    ```
  </Tab>
</Tabs>

<Warning>
  **长请求慎开自动重试**：很多 SDK 默认带 2 次重试。图片和推理任务一旦超时重试，可能变成"扣了三次费、一张图都没拿到"。建议把 `max_retries` 设为 0，由业务层自己控制重试逻辑。
</Warning>

## 已经调大 timeout 还是超时？逐层排查

<Steps>
  <Step title="第一步：确认 SDK 的真实 timeout 生效">
    有些框架会在 HTTP 客户端外再包一层超时。打印实际生效的配置，确认你改的那个参数真的被用上了。
  </Step>

  <Step title="第二步：检查链路上的每一跳">
    请求链路上任何一层超时小于生成耗时，都会先于你的客户端断开：

    * 自建反向代理：Nginx 的 `proxy_read_timeout`（默认 60 秒）
    * 云负载均衡：空闲连接超时
    * API 网关 / CDN：回源超时
    * Serverless 函数：执行时长上限（很多平台默认 30-60 秒）
    * 任务队列 worker：单任务超时

    **每一跳都要放宽**，只改客户端是没用的。
  </Step>

  <Step title="第三步：确认没有走 CDN 节点">
    检查 Base URL 是不是 `api-cf.apiyi.com`。如果是长请求场景，换成 `api.apiyi.com` 或 `vip.apiyi.com`。

    判断依据：报 **`524`** 基本可以确定是 Cloudflare 层超时，而不是模型太慢。
  </Step>

  <Step title="第四步：区分超时与并发不足">
    看错误码：`524` / 连接中断 是超时问题；`429` 是并发配额问题。两者的解决方向完全不同。
  </Step>

  <Step title="第五步：查调用日志确认实际耗时">
    在控制台的[调用日志](/faq/call-logs)里查看该请求的实际耗时和计费情况，据此反推合理的 timeout 值。
  </Step>
</Steps>

## 常见疑问

<AccordionGroup>
  <Accordion title="超时断开的请求，能退费吗？">
    不能。客户端断开后，服务端与上游的生成任务仍然完成了，成本已经真实产生。

    所以正确做法是**一次性把 timeout 调到安全上限**，而不是设一个小值再靠重试——重试只会让计费翻倍。
  </Accordion>

  <Accordion title="能不能提供异步接口，断线后凭 ID 取回结果？">
    图片接口目前是**原厂透传的同步模式**，且我们不记录用户业务数据，因此无法提供"断线后凭 ID 取回"的能力。

    推荐做法：同步调用 + 合理 timeout + 在自己后台记录任务状态，等价于一个轻量异步队列。详见 [图片接口是同步还是异步？](/faq/image-async-api)

    视频类模型本身是异步任务制，不受此限制。
  </Accordion>

  <Accordion title="开启流式输出能避免超时吗？">
    **部分能，但不要依赖它。**

    流式确实能让首字更早到达，降低"整体无响应"的风险。但推理型模型在思考阶段可能长时间不吐 token，read timeout 一样会触发；而且完整输出的总时长并不会变短。

    正确做法是：流式 + 足够大的 timeout，两者一起用。
  </Accordion>

  <Accordion title="timeout 设得特别大会有副作用吗？">
    对计费没有影响——**计费只看实际消耗的 token 和调用，与你等了多久无关**。

    唯一要注意的是业务层的资源占用：长连接会占住一个 worker / 连接池槽位，高并发场景建议用异步 IO 或独立的长任务队列来跑图片和推理请求。
  </Accordion>

  <Accordion title="524 和 429 有什么区别？">
    * **`524`**：Cloudflare 层的超时，说明你走了 `api-cf.apiyi.com` 且请求超过约 100 秒。换节点即可。
    * **`429`**：并发或速率超限，与耗时无关。先做指数退避，长期出现请联系客服排查配额。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="图片 API 调用须知与最佳实践" icon="image" href="/api-capabilities/image-api-best-practices">
    各图片模型的 timeout 速查表与输出格式对照
  </Card>

  <Card title="Base URL 怎么填？" icon="link" href="/faq/base-url-config">
    四个节点的区别与选择建议
  </Card>

  <Card title="图片接口是同步还是异步？" icon="refresh-cw" href="/faq/image-async-api">
    同步调用模式与客户端任务管理方案
  </Card>

  <Card title="API 可以开多少并发？" icon="gauge" href="/faq/api-concurrency">
    各类模型的并发限制与配额申请
  </Card>
</CardGroup>

## 联系我们

<CardGroup cols={2}>
  <Card title="企业微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企业微信客服二维码" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    扫码添加 或 [点击联系客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    超时排查、并发配额申请
  </Card>

  <Card title="邮件咨询" icon="mail">
    **客服邮箱**：[support@apiyi.com](mailto:support@apiyi.com)

    **商务合作**：[business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
