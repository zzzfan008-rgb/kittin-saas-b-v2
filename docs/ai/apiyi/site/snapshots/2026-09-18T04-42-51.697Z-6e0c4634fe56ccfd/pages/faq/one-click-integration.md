> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 有没有一键对接功能？

> 有，但形态不是一个按钮，而是把文档喂给你的 AI 编程助手，让它替你完成对接。

## 简短回答

**有，但不是一个按钮。**

我们不提供传统意义上「点一下就配好」的一键对接——不同模型的协议、参数、鉴权方式各不相同，这种按钮只能覆盖最基础的对话能力，解决不了真实需求。

取而代之的是一条更好用的路：**把文档交给你的 AI 编程助手，让它替你完成对接**。你只需要注册账号、复制一个 Key，剩下的选模型、填 Base URL、写代码、排错，都可以让 AI 做。

<CardGroup cols={2}>
  <Card title="让 AI 帮你接入" icon="bot" href="/getting-started">
    快速开始页里有一段可直接复制的提示词，丢给 Codex、Claude Code、Cursor 即可。
  </Card>

  <Card title="AI 开发者套件" icon="blocks" href="/developer-kit">
    技能包、命令行、给编程 Agent 的契约与模型注册表，三条路各有一段提示词。
  </Card>
</CardGroup>

## 四种用法

<Steps>
  <Step title="整站技能包（最推荐）">
    让你的 Agent 运行 `npx skills add https://docs.apiyi.com` 安装 API易 技能包；跑不通就让它直接读 `https://docs.apiyi.com/skill.md`。

    这份文件专门写给 AI 看：端点、认证、模型命名规则、常见坑、排查清单一应俱全。读完它就具备了接入所需的全部背景知识。
  </Step>

  <Step title="单页发给 AI">
    每个文档页**右上角**都有「复制页面」按钮，点开旁边的箭头还能直接「在 ChatGPT / Claude / Perplexity / Google AI Studio 中打开」。

    遇到某个模型的具体问题时，打开那一页，点「复制页面」，连同你的报错一起发给 AI——这是最快的排错路径。
  </Step>

  <Step title="接成 MCP 服务">
    把 `https://docs.apiyi.com/mcp` 添加为 MCP 服务器，你的 Agent 就能随时检索本站最新内容，不必每次手动喂文档。
  </Step>

  <Step title="命令行零安装">
    不想写代码就在终端跑 `npx apiyi@latest check`（Node 18 以上）：它会检查 Key、测节点、列模型，再用 `npx apiyi@latest chat "你好" -m gpt-5.4-mini` 发第一条消息。命令表见 [AI 开发者套件](/developer-kit#cli-命令行)。
  </Step>
</Steps>

<Info>
  **为什么这样更好**：按钮式的一键对接只能覆盖固定几种场景，而 AI 能读懂你项目的实际技术栈，直接写出能跑的代码，还能顺手处理超时配置、错误重试这些按钮做不到的事。
</Info>

## 为什么不做按钮式的一键对接？

模型接入的差异主要体现在：

* **接口协议不同**：OpenAI、Claude、Gemini 等模型采用不同的 API 协议
* **参数结构不同**：每个模型的请求参数、返回字段命名都不一致
* **认证方式不同**：不同模型的鉴权字段和位置不同
* **特殊能力不同**：Function Calling、Prompt Caching、Web Search 等能力在不同模型上的实现方式也不同

因此，强行做「一键对接」往往只能覆盖最基础的对话能力，无法满足真实使用需求。

<Note>
  **账号仍需你本人注册**。我们没有提供让 Agent 自助申请账号和密钥的接口——账号与计费涉及实名与风控，这一步需要人来完成。但从「拿到 Key」到「代码跑通」的全部工作，都可以交给 AI。
</Note>

## 相关问题

<CardGroup cols={2}>
  <Card title="快速开始" icon="rocket" href="/getting-started">
    两条路：让 AI 接，或自己动手接。
  </Card>

  <Card title="如何选择合适的模型？" icon="compass" href="/faq/model-selection-guide">
    根据业务场景选择最合适的 AI 模型。
  </Card>

  <Card title="Base URL 怎么配置？" icon="link" href="/faq/base-url-config">
    在各客户端中接入 API易 的方法。
  </Card>

  <Card title="如何查看调用日志？" icon="file-text" href="/faq/call-logs">
    查询 API 调用记录和余额消耗明细。
  </Card>
</CardGroup>
