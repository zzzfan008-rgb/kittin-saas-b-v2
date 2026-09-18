> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API 有类似 ChatGPT 的记忆能力吗？

> API 本身没有记忆。Agent 工具的「记忆」其实是存在你本地的文件，每次新对话都要重新读，也会按输入计费。本文讲清记忆的原理、换电脑怎么带走，以及费用怎么省。

## 简短回答

<Info>
  **没有。API 本身是无状态的，不会记住你上一次说过什么。**

  你在 ChatGPT 网页版、Claude Code、Codex 里感受到的「记忆」，是这些产品在 API 之外另做的功能：把记忆写进文件，下次对话时再读给模型。这些文件保存在你自己手里，API易 不保存你的对话内容。
</Info>

## 网页版的「记忆」是怎么回事

ChatGPT 网页版的记忆分两种：

* **已保存的记忆**：你让它记住的事实和偏好，比如职业、写作风格
* **参考聊天记录**：它从你过往的对话里提炼出的信息

这两种记忆都保存在 OpenAI 的账号体系里，是网页产品的功能，**不通过 API 开放**。用同一个模型调 API 时，模型不会知道你在网页版里聊过什么。

网页版和 API 的更多差异，见 [为什么官方网页版和 API 返回结果不同](/faq/webapp-vs-api-difference)。

## Agent 工具的「记忆」其实是文件

编程类 Agent 工具的记忆，都是**客户端读写本地文件**：

<CardGroup cols={3}>
  <Card title="Claude Code" icon="terminal">
    项目规则写在 `CLAUDE.md`，个人偏好和工作中积累的经验写进本地的记忆目录。每次启动会话时读取。
  </Card>

  <Card title="Codex" icon="code">
    项目规则写在 `AGENTS.md`。2026 年 4 月起还内置了记忆功能，自动从历史会话里提炼内容，存到本地的 `~/.codex/memories/`。
  </Card>

  <Card title="Claude API 的 memory tool" icon="folder-open">
    模型会发出「读 / 写记忆文件」的指令，由你的程序执行，文件放在哪里（本地磁盘、数据库、云存储）由你决定。
  </Card>
</CardGroup>

这些工具的共同点：

1. **记忆就是文件**：通常是 Markdown，可以直接打开查看和修改。
2. **模型不会一次读完所有文件**：客户端会按需检索，只读当前任务相关的部分。
3. **每次新对话都要重新读**：模型本身什么都不记得，读进来的内容和你的问题一起发给 API。

## 换电脑怎么带走记忆

<Steps>
  <Step title="项目级记忆：跟着代码仓库走">
    `CLAUDE.md`、`AGENTS.md` 这类放在项目目录里的文件，提交到 git 后，在另一台电脑上拉取代码就能用。团队成员也能共享同一份项目规则。
  </Step>

  <Step title="用户级记忆：手动复制或同步">
    放在用户目录下的记忆（比如 Codex 的 `~/.codex/memories/`、Claude Code 的本地记忆目录）不在仓库里，需要复制到新电脑的同一位置，或者用网盘、同步工具保持一致。
  </Step>

  <Step title="在新电脑上确认生效">
    打开同一个项目，问一个只有记忆里才有答案的问题，比如项目约定的测试命令。答对了，就说明记忆已经带过来了。
  </Step>
</Steps>

<Tip>
  记忆文件里别写 API Key、密码这类敏感信息。它会被发给模型，同步到网盘或提交到仓库时也可能泄露。
</Tip>

## 记忆和费用

记忆并不是免费的：

* **读进来的记忆按输入 token 计费。** 每开一个新对话，客户端读取的记忆文件都会算进这次请求的输入。
* **同一个对话越聊越贵。** API 无状态，所以每一轮都要把之前的全部对话再发一遍，输入 token 随轮数不断累加。
* **缓存计费能省下重复部分的费用。** 每次请求开头那段内容（系统提示词、记忆文件、之前的对话）如果保持不变，就能命中缓存，按远低于正常输入的价格计费。

API易 的 Claude、OpenAI、DeepSeek、Qwen、Grok 等主流通道缓存命中都比较稳定。**Gemini 的隐式缓存命中率一般**，做成本测算时建议按无缓存价格打底。各通道的规则见 [API易支持缓存计费吗](/faq/cache-billing)。

<Tip>
  想让缓存多命中：把不变的内容（系统提示词、记忆文件）放在请求最前面，变化的内容放在后面；不要在开头塞时间戳这类每次都会变的字段。
</Tip>

## 服务端会话状态不等于记忆

<Info>
  部分原厂 API 提供服务端会话状态，比如 OpenAI Responses API 的 `previous_response_id`：原厂替你保存对话，默认保留 30 天，下一轮只需要传上一次的 ID。

  它和「记忆」有两点不同：

  * **只能接续同一条对话链**，不会跨会话记住你的偏好。
  * **不省钱**：链上所有历史内容每一轮仍然按输入 token 计费。

  在 API易 上，我们推荐由客户端自己维护对话历史，行为最稳定，换模型也不用改代码。具体写法见 [多轮对话实现指南](/api-capabilities/multi-turn-conversation)。
</Info>

## 常见疑问

<AccordionGroup>
  <Accordion title="API易 会保存我的对话吗？">
    不会。API易 作为中转平台只负责转发请求，不保存请求和响应的内容，详见 [API易如何保障数据安全](/faq/data-security)。

    如果你用了原厂的服务端会话功能（比如上面的 `previous_response_id`），这部分对话由原厂按它自己的规则保存。
  </Accordion>

  <Accordion title="能不能让 API 记住我的偏好？">
    可以，但需要你自己实现。最简单的做法是把偏好写进系统提示词，每次请求都带上。偏好比较多时，可以存成文件或数据库，按需检索后再放进请求。Claude API 的 memory tool 就是这种做法的官方封装。
  </Accordion>

  <Accordion title="记忆越多越好吗？">
    不是。记忆越多，每次请求的输入越长，费用越高，模型也可能被不相关的内容干扰。建议定期整理记忆文件，删掉过时的内容，只保留真正常用的规则和事实。
  </Accordion>

  <Accordion title="除了复制文件夹，还有别的办法同步记忆吗？">
    有：

    * 项目级记忆提交到 git，跟着代码走。
    * 用户级记忆用网盘或同步工具保持一致。
    * 搭建自己的记忆服务：部分 Agent 工具支持通过 MCP 接入外部记忆服务，多台电脑连同一个服务即可。

    无论哪种方式，记忆都在你自己控制的地方，不在 API 那一侧。
  </Accordion>
</AccordionGroup>

## 相关文档

<CardGroup cols={2}>
  <Card title="为什么官方网页版和 API 返回结果不同？" icon="layers" href="/faq/webapp-vs-api-difference">
    网页版在 API 之外多做了哪些事
  </Card>

  <Card title="多轮对话实现指南" icon="messages-square" href="/api-capabilities/multi-turn-conversation">
    四种调用格式怎么维护对话历史
  </Card>

  <Card title="API易支持缓存计费吗？" icon="database" href="/faq/cache-billing">
    各通道缓存计费规则与命中技巧
  </Card>

  <Card title="API易如何保障数据安全？" icon="shield" href="/faq/data-security">
    传输加密与不存储请求内容
  </Card>
</CardGroup>
