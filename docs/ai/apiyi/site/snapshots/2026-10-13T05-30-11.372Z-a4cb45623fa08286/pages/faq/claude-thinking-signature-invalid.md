> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude 多轮对话报「思考签名无效」怎么办？

> Claude Code、Claude Agent 智能体报 Invalid signature in thinking block 且显示 429 时，不是限流，而是会话历史里的思考块签名失效。新开会话即可解决。

## 简短回答

报错长这样：

```text theme={null}
API Error: Request rejected (429) · messages.1.content.0: Invalid `signature` in `thinking` block
```

报错里虽然带着 429，但**这不是限流**，是**会话历史里某个思考块（thinking block）的签名没有通过原厂校验**。这个历史每次都会原样发出去，所以客户端自动重试多少次都会失败。

**解决办法：新开一个会话。** 智能体、模型、Key 的配置都不用改。

## 典型症状

用 Claude Code、Claude Agent SDK，或者 Cherry Studio 等客户端的「Claude Agent」智能体模式，同时开着思考时：

* 主对话一直出不来，界面显示「请求过于频繁」「9 秒后重试 5/10」之类的提示，重试 10 次后停止；
* 控制台日志里**能看到这个 Key 有正常计费的请求**，但都是 token 很少的小请求。那是客户端用 Small 模型发的辅助请求（生成标题、判断意图等），它们不带历史，所以能成功；
* 在这个会话里点「继续」、换个说法重发，都是同样的报错；新开会话后立刻恢复正常。

## 为什么会这样

开启思考后，Claude 每轮回复开头会有一个 `thinking` 块，块里带一个 `signature`（签名）。下一轮请求时，客户端要把上一轮的 `thinking` 块**连同签名一字不改**地放回历史，原厂会校验签名，确认思考内容没有被改动过。

下面几种情况都会让签名校验失败：

<CardGroup cols={2}>
  <Card title="签名丢失或为空" icon="file-x">
    客户端保存会话历史时没有存下签名，回传时 `signature` 为空字符串或整个字段缺失。社区里已有多个客户端出现过这类问题，常见于思考和文件读取等工具调用同时开启的场景。
  </Card>

  <Card title="思考内容被改动" icon="pencil">
    手动编辑过历史消息、客户端对历史做了压缩或裁剪，或者经过的代理对请求体重新排版，都会让思考内容与签名对不上。
  </Card>

  <Card title="中途切换模型" icon="shuffle">
    同一个会话里先用 A 模型生成了思考块，再切到 B 模型继续，B 模型可能不认 A 留下的签名。
  </Card>

  <Card title="中途切换 Key 或分组" icon="key">
    同一个会话中途换了 Key 或令牌分组，后续请求可能由不同的线路处理，前面留下的签名可能无法通过校验。
  </Card>
</CardGroup>

报错信息里的 `messages.1.content.0` 指的是历史里**第一条 assistant 回复的第一个内容块**，也就是会话开头那一轮的思考块。只要它坏了，这个会话后面的每一轮都会失败。

## 解决步骤

<Steps>
  <Step title="新开会话">
    在客户端里新建一个会话，重新上传文件、重新提问。智能体配置、模型、Key 都不用改。这是最快、最确定的办法。
  </Step>

  <Step title="一个会话只用一个模型、一个 Key">
    需要换模型或换 Key 时，新开会话再换，不要在已有思考历史的会话里切换。
  </Step>

  <Step title="不要手动改历史">
    不要编辑、删除历史中 assistant 消息的思考内容。需要精简上下文时，用客户端自带的压缩功能，或者直接新开会话。
  </Step>

  <Step title="升级客户端">
    如果新会话里没过几轮又复现，多半是客户端保存历史时丢了签名。升级到最新版本，并把复现步骤反馈给客户端的开发者。
  </Step>
</Steps>

<Tip>
  **自己写代码调用时**：回传历史时，`thinking` 块要么**原样保留**（包括 `signature` 字段），要么**整块去掉**，不要只保留思考文字、丢掉签名。用官方 SDK 时，直接把上一轮响应的 `content` 数组原样放回 `messages` 即可。
</Tip>

## 常见问题

<AccordionGroup>
  <Accordion title="报错里写着 429，需要降低请求频率吗？">
    不需要。这个报错的原因是请求内容无效，跟频率无关，退避重试、换时间段都不会好转。看到 `Invalid signature in thinking block` 就直接新开会话。
  </Accordion>

  <Accordion title="失败的请求会扣费吗？">
    不会。签名校验在模型生成之前就失败了，这些请求不产生费用，控制台日志里也不会有记录。日志里看到的计费都来自成功的请求（通常是客户端的辅助小请求）。
  </Accordion>

  <Accordion title="关掉思考能绕过吗？">
    在同一个会话里关掉思考不一定有用，历史里已经存在的思考块仍然会被发送。新开会话更可靠。如果任务确实不需要思考，也可以换用不带 `-thinking` 后缀的模型，从新会话开始用。
  </Accordion>

  <Accordion title="新开会话后还是反复出现怎么办？">
    请联系客服，提供出错的大致时间（注明时区，如 `17:00 (UTC+8)`）、使用的客户端及版本、模型名。我们可以按时间定位这个会话的请求，协助排查。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="Claude Effort 努力档位与思考指南" icon="brain" href="/api-capabilities/claude-effort-thinking">
    思考模式的开关、流式事件与签名回传
  </Card>

  <Card title="Claude 原生格式：流式与非流式响应" icon="sparkles" href="/api-capabilities/claude-response-handling">
    `thinking` 块与 `signature_delta` 的结构
  </Card>

  <Card title="Claude Code 接入" icon="terminal" href="/scenarios/programming/claude-code">
    在 Claude Code 中配置 API易
  </Card>

  <Card title="API 可以开多少并发？" icon="gauge" href="/faq/api-concurrency">
    并发与限流说明
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.