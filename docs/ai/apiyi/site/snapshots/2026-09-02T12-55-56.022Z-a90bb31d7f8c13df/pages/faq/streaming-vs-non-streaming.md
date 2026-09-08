> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 流式和非流式调用有什么区别？

> 同一个 Key 为什么一会流式一会非流式、两者差在哪、各自适合什么场景、接入复杂度和计费口径，以及六个最常见的误区。

## 简短回答

<Info>
  **三句话讲完：**

  1. **流式还是非流式，完全由你的代码决定**——请求体里的 `stream` 参数。同一个 Key、同一个模型、同一个端点，一会流式一会非流式，一定是客户端代码（或你用的 SDK / 上层框架）在切换，**网关不会随机改**。
  2. **两者拿到的最终内容一致、计费口径也完全一致**。差别只在「什么时候拿到」和「怎么解析」。
  3. **怎么选**：有人盯着屏幕等输出 → 流式；程序自己吃结果（解析 JSON、批处理、工具调用）→ 非流式。
</Info>

## 一张表看清差别

| 维度          | 流式 `stream: true`                                             | 非流式（默认）                          |
| ----------- | ------------------------------------------------------------- | -------------------------------- |
| 请求参数        | `stream: true`                                                | 不传，或 `stream: false`             |
| 响应格式        | SSE 事件流（`text/event-stream`），多个 `data:` 块，以 `data: [DONE]` 收尾 | 一个完整的 JSON 对象                    |
| 取正文的方式      | 逐块累加 `choices[0].delta.content`                               | 直接读 `choices[0].message.content` |
| 首字节时间（TTFB） | 快，普通模型通常 1-3 秒                                                | ≈ 总生成时间                          |
| 总耗时         | 与非流式基本一致                                                      | 与流式基本一致                          |
| 用量 `usage`  | **默认不返回**，需加 `stream_options: {"include_usage": true}`        | 响应体里必有                           |
| 出错的形态       | 连接已建立后可能在流中途报错，要在读流的循环里处理                                     | 一个 HTTP 状态码 + 错误 JSON，最直白        |
| 中途长时间无数据    | 少见（持续有数据心跳）                                                   | 常见（整段生成期间连接是"静默"的）               |
| 接入复杂度       | 中：要处理增量拼接、SSE 解析、关缓冲                                          | 低：一次请求一次解析                       |
| 计费          | 按 token 计费                                                    | **完全相同**                         |
| 控制台日志       | `is_stream = true`                                            | `is_stream = false`              |

## 为什么我的请求一会流式一会非流式？

这是最常见的疑问，答案是：**在你自己这一侧被改掉了**。按下面几条从上到下排查，基本能命中：

<AccordionGroup>
  <Accordion title="① 代码里的 stream 是变量或配置项">
    最典型的情况：`stream=config.get("stream", False)`、`stream=is_web_request` 这类写法。不同入口走到同一个函数，传进去的值不一样，日志上看就是"一会流式一会非流式"。

    **排查**：把实际发出去的请求体打印出来，看 `stream` 字段到底是什么。
  </Accordion>

  <Accordion title="② 不同 SDK / 框架的默认值不一样">
    同一份业务代码，换个客户端就变了：

    * 直接用 OpenAI SDK 的 `chat.completions.create()`：默认 **非流式**
    * 用 `client.chat.completions.stream()` 或 `with_streaming_response`：**流式**
    * LangChain / LlamaIndex 之类的封装：是否流式取决于你调的是 `invoke` 还是 `stream`，以及构造模型对象时有没有传 `streaming=True`
    * 各类桌面客户端、Agent 工具、工作流平台：一般在设置里有「流式输出」开关，默认值各不相同

    **排查**：确认这次调用具体是哪个入口发出去的。
  </Accordion>

  <Accordion title="③ 同一个 Key 被多个应用共用">
    一个 Key 同时给「网页聊天界面」和「后台定时任务」用，前者流式、后者非流式，日志混在一起看就像是随机的。

    **排查**：给不同用途建不同的令牌，日志一眼就分得开。做法见 [令牌管理](/faq/token-management)。
  </Accordion>

  <Accordion title="④ 中间层代理把流式「压平」了">
    你确实发了 `stream: true`，但请求经过 Nginx、企业网关、某些代理软件时被**缓冲**了——服务端是一块块发的，代理攒够了才一次性给你，体感上就变成了非流式。

    **排查**：绕过代理直连测一次；Nginx 侧关掉缓冲（`proxy_buffering off;`）。注意这种情况下控制台日志的 `is_stream` **仍然是 true**，因为网关这边确实是流式发出去的。
  </Accordion>
</AccordionGroup>

<Tip>
  **怎么确认某一次调用到底是不是流式**：去控制台日志看 `is_stream` 字段，或用[日志查询 API](/api-capabilities/log-query) 批量拉取。这是"事实来源"，比凭体感判断可靠。
</Tip>

## 怎么选：按场景对号入座

<CardGroup cols={2}>
  <Card title="用流式" icon="zap">
    * 聊天界面、客服机器人——用户需要立刻看到反应
    * IDE 插件 / 编程助手（Claude Code、Cursor 等）
    * 长文本生成（万字文章、长翻译、大段代码）
    * 推理型模型的长任务——至少能看到进度，不至于"完全没动静"
    * 需要中途打断（用户点「停止」）的场景
  </Card>

  <Card title="用非流式" icon="package">
    * 结构化输出：要拿完整 JSON 去 `json.loads()`
    * Function Calling / 工具调用的参数解析
    * 批处理、离线跑批、定时任务
    * 只要最终结果、没有人在等的后台流程
    * 快速验证、调试、写测试用例
  </Card>
</CardGroup>

几个特殊场景单独说：

| 场景                          | 建议               | 说明                                                                                         |
| --------------------------- | ---------------- | ------------------------------------------------------------------------------------------ |
| 图片生成 / 编辑                   | 非流式              | OpenAI 兼容的 `/v1/images/generations` 不接受 `stream`；Gemini 原生出图另有 `:streamGenerateContent` 端点 |
| 视频生成                        | 与流式无关            | 走异步任务 + 轮询，见 [图片/视频异步接口](/faq/image-async-api)                                             |
| Embedding / Rerank          | 非流式              | 这类端点没有流式概念                                                                                 |
| 推理型模型（thinking / reasoning） | 流式更友好，但**不解决超时** | 思考阶段可能长时间不吐 token，见下方误区①                                                                   |

## 接入复杂度对比：同一件事的两种写法

<Tabs>
  <Tab title="Python 非流式">
    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(
        api_key="sk-your-api-key",
        base_url="https://api.apiyi.com/v1",
    )

    resp = client.chat.completions.create(
        model="gpt-5.4",
        messages=[{"role": "user", "content": "介绍一下量子计算"}],
        timeout=120,
    )

    # 一行拿到全文
    print(resp.choices[0].message.content)
    # usage 直接就在响应体里
    print(resp.usage.total_tokens)
    ```
  </Tab>

  <Tab title="Python 流式">
    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(
        api_key="sk-your-api-key",
        base_url="https://api.apiyi.com/v1",
    )

    stream = client.chat.completions.create(
        model="gpt-5.4",
        messages=[{"role": "user", "content": "介绍一下量子计算"}],
        stream=True,
        stream_options={"include_usage": True},   # 不加这行拿不到 usage
        timeout=120,
    )

    chunks = []
    for chunk in stream:
        # 末尾的 usage chunk 里 choices 是空数组，必须先判空
        if chunk.choices and chunk.choices[0].delta.content:
            piece = chunk.choices[0].delta.content
            chunks.append(piece)
            print(piece, end="", flush=True)
        if chunk.usage:
            print(f"\n用量：{chunk.usage.total_tokens} tokens")

    full_text = "".join(chunks)   # 需要全文时自己拼
    ```
  </Tab>

  <Tab title="Node.js 流式">
    ```javascript theme={null}
    import OpenAI from "openai";

    const client = new OpenAI({
      apiKey: "sk-your-api-key",
      baseURL: "https://api.apiyi.com/v1",
    });

    const stream = await client.chat.completions.create({
      model: "gpt-5.4",
      messages: [{ role: "user", content: "介绍一下量子计算" }],
      stream: true,
      stream_options: { include_usage: true },
    });

    let full = "";
    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) {
        full += delta;
        process.stdout.write(delta);
      }
      if (chunk.usage) console.log("\n用量：", chunk.usage.total_tokens);
    }
    ```
  </Tab>

  <Tab title="cURL 对照">
    ```bash theme={null}
    # 非流式：一个完整 JSON
    curl https://api.apiyi.com/v1/chat/completions \
      -H "Authorization: Bearer $APIYI_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "gpt-5.4",
        "messages": [{"role": "user", "content": "你好"}]
      }'

    # 流式：一连串 data: 块，最后是 data: [DONE]
    # -N 关闭 curl 自己的缓冲，否则看起来还是"一次性出来的"
    curl -N https://api.apiyi.com/v1/chat/completions \
      -H "Authorization: Bearer $APIYI_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "gpt-5.4",
        "messages": [{"role": "user", "content": "你好"}],
        "stream": true,
        "stream_options": {"include_usage": true}
      }'
    ```
  </Tab>
</Tabs>

<Note>
  **Claude 原生格式（`/v1/messages`）的流式协议不一样**：它用的是 Anthropic 的**具名事件 SSE**（`message_start` / `content_block_delta` / `message_delta` 等），不是 OpenAI 那种统一的 `data:` chunk，`usage` 也分散在 `message_start` 和 `message_delta` 两个事件里。完整解析方法见 [Claude 原生格式：流式与非流式响应](/api-capabilities/claude-response-handling)。
</Note>

## 计费与用量：两者完全一样

<Warning>
  **流式不会更便宜，也不会更贵。** 计费按 token 走，与传输方式无关。

  **中途断开也照常计费**——你按 `Ctrl+C` 或客户端超时断开后，上游的生成任务仍会跑完，这次请求正常扣费。所以"流式看到一半不想要了就断开能省钱"是不成立的。
</Warning>

关于 `usage` 的两个坑：

1. **流式默认不返回 usage**。OpenAI 兼容端点要显式传 `stream_options: {"include_usage": true}`，用量会出现在最后一个 chunk 里（那个 chunk 的 `choices` 是空数组，解析时要先判空）。本站多个模型已实测可用。
2. **不要用 API 回显的 usage 去核对账单**，尤其是缓存相关字段。回显值和实际计费不总是一致，缓存是否命中以**控制台日志的「缓存计费详情」为准**。详见 [缓存计费说明](/faq/cache-billing)。

无论流式与否，控制台日志都会完整记录本次调用的 token 数、耗时和计费，不受传输方式影响。日志字段含义见 [日志计费明细怎么看](/faq/log-billing-explained)。

## 六个常见误区

<AccordionGroup>
  <Accordion title="误区①：开了流式就不会超时了">
    **不成立。** 流式只是让"第一个 token"来得早，它不缩短总生成时间，也不保证中途一直有数据。

    推理型模型（`gemini-3.1-pro-preview`、`gpt-5.6-sol`、`gpt-5.5-pro` 等）在**思考阶段可能长时间不吐任何 token**，客户端的 read timeout 一样会被触发。

    正确做法是按场景分档设置 timeout，见 [如何避免接口超时](/faq/timeout-configuration)。
  </Accordion>

  <Accordion title="误区②：流式比非流式快">
    **快的是首字节，不是总耗时。** 同一个模型、同一段提示词，流式和非流式跑完的总时间基本一致。

    流式的价值是**体感**：用户 1 秒就看到有东西在动，而不是盯着转圈等 30 秒。如果没人在看屏幕，这份价值等于零。
  </Accordion>

  <Accordion title="误区③：流式更省钱 / 只按实际收到的部分计费">
    **不是。** 见上方「计费与用量」一节：计费口径完全相同，中途断开也照常扣费。
  </Accordion>

  <Accordion title="误区④：所有模型和端点都支持流式">
    **不是。** 文本对话类模型基本都支持；图片生成、Embedding、Rerank 这类端点没有流式概念，传 `stream` 要么被忽略要么直接报错。

    个别模型对流式下的某些参数组合有额外限制，不确定时先用非流式跑通，再加 `stream: true`。
  </Accordion>

  <Accordion title="误区⑤：非流式一定更稳">
    **各有各的坑。**

    * 非流式的风险：整段生成期间连接是"静默"的，中间的代理、CDN、企业网关容易按空闲超时把连接掐掉。另外响应体很大时（出图返回 base64 动辄十几 MB）还可能遇到收尾卡住，见 [请求收尾卡住](/api-capabilities/image-tail-stall) 和 [日志显示已完成却收不到响应](/faq/log-duration-vs-client-wait)。
    * 流式的风险：对不支持 SSE 或强制缓冲的中间层不友好；客户端解析逻辑更复杂，容易漏掉边界情况。

    另外注意：`api-cf.apiyi.com`（CDN 节点）有约 100 秒的请求上限，**流式和非流式都受影响**，长请求请改用 `api.apiyi.com` 或 `vip.apiyi.com`，见 [Base URL 配置指南](/faq/base-url-config)。
  </Accordion>

  <Accordion title="误区⑥：流式响应里拿不到完整答案">
    **能拿到，只是要自己拼。** 把每个 chunk 的 `delta.content` 按顺序累加起来，就是非流式那个 `message.content`。

    如果你发现拼出来的内容不完整，先查这三点：是否漏处理了 `finish_reason`、是否在收到 `data: [DONE]` 前就退出了循环、是否被中间层截断。
  </Accordion>
</AccordionGroup>

## 流式接不通？按这四步查

<Steps>
  <Step title="确认请求体真的带了 stream: true">
    打印实际发出的 JSON。用了封装库时，"你以为传了"和"真的传了"经常不是一回事。
  </Step>

  <Step title="用 curl -N 直连测一次">
    绕开你自己的代码和代理，直接用上面「cURL 对照」里的命令跑。如果 curl 能看到一块块吐出来，说明服务端侧没问题，问题在客户端或中间层。
  </Step>

  <Step title="检查中间层缓冲">
    Nginx 加 `proxy_buffering off;`；企业网关 / 安全设备可能对 `text/event-stream` 做整包扫描，需要联系网络管理员放行。
  </Step>

  <Step title="核对解析逻辑">
    按行读 SSE，跳过空行和 `:` 开头的注释行，遇到 `data: [DONE]` 结束；最后一个带 `usage` 的 chunk 里 `choices` 是空数组，别在这里下标越界。
  </Step>
</Steps>

<Tip>
  排查到这一步还没结论时，**带上 `request_id` 联系客服**——控制台日志里能直接看到这次调用是不是按流式处理的、耗时和首字节时间各是多少。
</Tip>

## 相关文档

<CardGroup cols={2}>
  <Card title="如何避免接口超时" icon="timer" href="/faq/timeout-configuration">
    分场景的 timeout 推荐值，以及流式为什么救不了超时
  </Card>

  <Card title="Base URL 配置指南" icon="link" href="/faq/base-url-config">
    各接口地址的差异，CDN 节点的 100 秒限制
  </Card>

  <Card title="日志显示已完成却收不到响应" icon="stethoscope" href="/faq/log-duration-vs-client-wait">
    非流式大响应的经典问题，含分段计时方法
  </Card>

  <Card title="Claude 流式与非流式响应" icon="braces" href="/api-capabilities/claude-response-handling">
    Anthropic 原生格式的具名事件 SSE 协议解析
  </Card>

  <Card title="文本生成接口说明" icon="message-square" href="/api-capabilities/text-generation">
    完整参数列表与调用示例
  </Card>

  <Card title="日志计费明细怎么看" icon="file-text" href="/faq/log-billing-explained">
    控制台日志各字段含义，含 is\_stream
  </Card>
</CardGroup>
