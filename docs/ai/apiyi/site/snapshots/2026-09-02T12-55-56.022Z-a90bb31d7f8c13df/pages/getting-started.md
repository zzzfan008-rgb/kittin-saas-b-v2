> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 快速开始

> 两条路接入 API易：把文档丢给你的 AI 编程助手让它代劳，或者按三步自己动手。

<Note>
  注册后账号自带 **\$0.05** 试用额度，不充值也能跑通下面的第一次调用。用 `gpt-5.4-mini` 这类轻量模型足够验证接入是否正常。
</Note>

## 两条路，任选一条

<CardGroup cols={2}>
  <Card title="让 AI 帮你接" icon="bot" href="#让-ai-帮你接">
    复制一段提示词丢给 Codex / Claude Code / Cursor，它自己读文档、写代码、跑通。适合已经在用编程 Agent 的人。
  </Card>

  <Card title="自己动手接" icon="wrench" href="#自己动手接">
    注册 → 建 Key → 发起第一次调用。三步，五分钟。适合想先搞清楚每一步在干嘛的人。
  </Card>
</CardGroup>

<Info>
  两条路的**第一步是一样的**：账号需要你本人注册、Key 需要你本人创建。AI 能替你做的是从「拿到 Key」到「代码跑通」这一段——选模型、填对 Base URL、写示例、排错。
</Info>

## 让 AI 帮你接

### 把这段话发给你的 Agent

<Prompt description="让编程 Agent 自助完成 API易 接入。复制后直接粘贴给 Codex、Claude Code、Cursor 等。" icon="bot" actions={["copy"]}>
  帮我把 API易（APIYI）接入到当前项目。

  1. 先获取接入知识：运行 `npx skills add https://docs.apiyi.com` 安装 APIYI 技能包。
     如果这条命令跑不通，就直接抓取 [https://docs.apiyi.com/skill.md](https://docs.apiyi.com/skill.md) 全文阅读，效果一样。
  2. 需要更细的内容时，从 [https://docs.apiyi.com/llms.txt](https://docs.apiyi.com/llms.txt) 找到对应页面；
     任意文档页地址后面加 `.md` 就能拿到纯 Markdown 版，比抓 HTML 省 token。
  3. 向我索要 API Key（我在 [https://api.apiyi.com/token](https://api.apiyi.com/token) 复制），
     写进环境变量 `APIYI_API_KEY`，**不要硬编码进代码，也不要提交进 git**。
  4. 按本项目的技术栈写一段最小可运行示例，模型先用 `gpt-5.4-mini`。
     注意：Base URL 要按 SDK 选——OpenAI SDK 用 `https://api.apiyi.com/v1`，
     Anthropic SDK 用根域名 `https://api.apiyi.com`（不加 /v1），
     Google GenAI SDK 用根域名并把 api\_version 设为 v1beta。
  5. 真跑一次，把返回内容贴给我。跑通后告诉我这次调用花了多少钱，
     以及后续要换成哪个模型更合适。
</Prompt>

### 它会做什么

<Steps>
  <Step title="装技能包，或直接读 skill.md">
    `https://docs.apiyi.com/skill.md` 是一份专门写给 AI 读的接入说明：端点、认证、模型命名规则、常见坑、排查清单。Agent 读完就具备了接入 API易 所需的全部背景。
  </Step>

  <Step title="按需翻文档">
    `llms.txt` 是全站页面索引。Agent 从中挑出相关页面，加 `.md` 后缀拿纯文本版本读。
  </Step>

  <Step title="写代码并实跑">
    它会用你项目已有的语言和依赖写示例，而不是照搬文档里的 Python。跑通之前不算完。
  </Step>
</Steps>

### 可以直接喂给 AI 的四个入口

| 入口         | 地址                                | 什么时候用                        |
| ---------- | --------------------------------- | ---------------------------- |
| **技能包**    | `https://docs.apiyi.com/skill.md` | 一次性给 Agent 完整接入知识，首选         |
| **页面索引**   | `https://docs.apiyi.com/llms.txt` | 让 Agent 自己找该读哪一页             |
| **单页纯文本**  | 任意文档页地址后加 `.md`                   | 只关心某一页时，比抓 HTML 省 token      |
| **MCP 服务** | `https://docs.apiyi.com/mcp`      | 把本文档站接成 MCP，让 Agent 随时检索最新内容 |

<Tip>
  例如本页的纯文本版就是 `https://docs.apiyi.com/getting-started.md`。全站每一页都支持这个后缀。
</Tip>

### 在文档页右上角一键送进 AI

每个文档页的**右上角**都有一个「复制页面」按钮，点开右侧箭头还有更多选项：

<img src="https://mintcdn.com/apiyillc/pSJvB-WdRHZF62ww/images/contextual-menu-copy-page.png?fit=max&auto=format&n=pSJvB-WdRHZF62ww&q=85&s=34ae33d4f4555c0b9436364f12bab88b" alt="文档页右上角的复制页面菜单，包含复制页面、以 Markdown 格式查看、在 ChatGPT / Claude / Perplexity / Google AI Studio 中打开" width="648" height="694" data-path="images/contextual-menu-copy-page.png" />

| 选项                         | 作用                                |
| -------------------------- | --------------------------------- |
| **复制页面**                   | 把当前页以 Markdown 格式复制到剪贴板，直接粘给任意 AI |
| **以 Markdown 格式查看**        | 在浏览器里打开纯文本版，方便核对或分享链接             |
| **在 ChatGPT 中打开**          | 带着本页内容跳转到 ChatGPT 提问              |
| **在 Claude 中打开**           | 同上，跳转 Claude                      |
| **在 Perplexity 中打开**       | 同上，跳转 Perplexity                  |
| **在 Google AI Studio 中打开** | 同上，跳转 Google AI Studio            |

遇到具体模型的接入问题时，最快的做法是打开那个模型的文档页，点「复制页面」，连同你的报错一起发给 AI。

## 自己动手接

### 第一步：注册并拿到 Key

<Steps>
  <Step title="注册账号">
    访问 [API易官网](https://api.apiyi.com) 用邮箱注册并验证（推荐用高校、企业邮箱），然后登录控制台。
  </Step>

  <Step title="创建 API 密钥">
    进入[令牌页面](https://api.apiyi.com/token)：

    1. 可以直接复制**默认令牌**使用（右侧有复制图标）
    2. 也可以点右上角「新增」创建新令牌，起个名字（如 `test-key`）后确认

    Key 以 `sk-` 开头。详细说明见 [如何创建 KEY](/faq/token-management)。
  </Step>

  <Step title="需要更多额度时再充值">
    自带的 \$0.05 用完后，在控制台「充值」菜单充值即可，支持支付宝、微信。各通道的最低充值额与到账规则见[支付方式说明](/faq/payment-methods)，加赠政策见[充值活动](/faq/recharge-promotions)。
  </Step>
</Steps>

### 第二步：填对接入信息

**Base URL 按 SDK 选，不是按模型选**——这是最常见的接入错误：

| 你用的 SDK                     | Base URL                   | 说明                                                               |
| --------------------------- | -------------------------- | ---------------------------------------------------------------- |
| OpenAI SDK（及绝大多数客户端）        | `https://api.apiyi.com/v1` | SDK 会自己拼 `/chat/completions`，所以必须带 `/v1`                         |
| Anthropic SDK（Claude 原生）    | `https://api.apiyi.com`    | SDK 会自己拼 `/v1/messages`，**加了 `/v1` 会变成 `/v1/v1/messages` 报 404** |
| Google GenAI SDK（Gemini 原生） | `https://api.apiyi.com`    | 另需设置 `api_version: "v1beta"`                                     |

<Warning>
  `base_url` 末尾**不要留斜杠**，否则会拼出双斜杠导致 404。完整说明与节点选择见 [Base URL 怎么填](/faq/base-url-config)。
</Warning>

### 第三步：发起第一次调用

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gpt-5.4-mini",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

<Tabs>
  <Tab title="Python">
    ```python theme={null}
    import os
    from openai import OpenAI

    client = OpenAI(
        api_key=os.environ["APIYI_API_KEY"],
        base_url="https://api.apiyi.com/v1"
    )

    response = client.chat.completions.create(
        model="gpt-5.4-mini",
        messages=[
            {"role": "user", "content": "Hello!"}
        ]
    )

    print(response.choices[0].message.content)
    ```
  </Tab>

  <Tab title="Node.js">
    ```javascript theme={null}
    import OpenAI from 'openai';

    const openai = new OpenAI({
      apiKey: process.env.APIYI_API_KEY,
      baseURL: 'https://api.apiyi.com/v1'
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-5.4-mini',
      messages: [{ role: 'user', content: 'Hello!' }]
    });

    console.log(response.choices[0].message.content);
    ```
  </Tab>

  <Tab title="Java">
    ```java theme={null}
    // 使用官方 OpenAI Java 库
    OpenAiService service = new OpenAiService(
        System.getenv("APIYI_API_KEY"),
        Duration.ofSeconds(60),
        "https://api.apiyi.com/v1"
    );

    ChatCompletionRequest request = ChatCompletionRequest.builder()
        .model("gpt-5.4-mini")
        .messages(List.of(
            new ChatMessage(ChatMessageRole.USER, "Hello!")
        ))
        .build();

    ChatCompletionResult result = service.createChatCompletion(request);
    System.out.println(result.getChoices().get(0).getMessage().getContent());
    ```
  </Tab>
</Tabs>

<Warning>
  `gpt-5` 及以上系列有三条参数限制：`temperature` 只能是 1、用 `max_completion_tokens` 替代 `max_tokens`、不要传 `top_p`。
</Warning>

## 下一步

<CardGroup cols={2}>
  <Card title="接入 Claude Code" icon="terminal" href="/scenarios/programming/claude-code">
    配置 `ANTHROPIC_BASE_URL`，用 API易 驱动 Claude Code
  </Card>

  <Card title="接入 Codex" icon="square-terminal" href="/scenarios/programming/codex-cli">
    一份 `config.toml` 同时覆盖桌面端、IDE 插件和 CLI
  </Card>

  <Card title="探索模型列表" icon="bot" href="/api-capabilities/model-info">
    查看所有支持的 AI 模型与能力速查
  </Card>

  <Card title="查看 API 文档" icon="book" href="/api-manual">
    完整的接口说明、错误码与调试方法
  </Card>
</CardGroup>

## 常见问题

### 如何切换模型？

只需修改请求中的 `model` 参数：

```json theme={null}
{
  "model": "gpt-5.6-sol",         // 使用 GPT-5.6 Sol
  "model": "claude-opus-5",       // 使用 Claude Opus 5
  "model": "gemini-3.6-flash"     // 使用 Gemini 3.6 Flash
}
```

<Warning>
  **模型 ID 用点号，不是连字符**。文档页地址里的 `-` 是为了 URL 安全替换的，真实模型 ID 保留点号：页面 `/models/qwen3-7-max` 对应的模型 ID 是 `qwen3.7-max`。写成 `gpt-5-4-mini` 会报 404，正确写法是 `gpt-5.4-mini`。

  不确定时用接口列一遍：`GET https://api.apiyi.com/v1/models`。
</Warning>

### 支持哪些编程语言？

API易 兼容 OpenAI API 标准，支持所有 OpenAI SDK 支持的语言：

* Python
* JavaScript/TypeScript
* Java
* C#/.NET
* Go
* Ruby
* PHP
* 更多...

### 如何查看余额？

登录 [控制台](https://api.apiyi.com/account/profile) 即可查看：

* 账户余额
* 使用记录
* 消费统计

也可通过 API 程序化查询：

* [余额查询 API](/api-capabilities/balance-query)：通过接口获取账户余额、有效期等信息
* [余额告警设置方法](/faq/balance-alerts)：余额不足时自动通知，避免服务中断

### 遇到问题怎么办？

1. 打开出问题的那个文档页，点右上角「复制页面」，连同报错一起发给 AI
2. 查看 [API 文档](/api-manual)
3. 检查 [常见错误](/faq/invalid-api-key)
4. 联系客服：[support@apiyi.com](mailto:support@apiyi.com)

<Info>
  提示：保存好您的 API 密钥，并定期在控制台查看使用日志，每笔请求都有消息历史，合理优化成本。
  祝使用愉快\~
</Info>
