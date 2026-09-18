> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# AI 开发者套件

> 把 API易 交给 AI 接入：聊天 Agent 装技能包、终端用命令行、编程 Agent 先读契约与模型注册表再写代码。三条路各有一段可复制的提示词。

<Note>
  账号和 Key 仍需你本人在 [控制台](https://api.apiyi.com/token) 创建。从「拿到 Key」到「代码跑通」这一段，下面三条路都可以交给 AI。
</Note>

## 先选路

<CardGroup cols={3}>
  <Card title="Skills · 聊天 Agent" icon="sparkles" href="#skills-技能包">
    OpenClaw、Claude Code 这类带技能系统的 Agent。装一次技能包，之后用自然语言调用 API易。
  </Card>

  <Card title="CLI · 终端" icon="terminal" href="#cli-命令行">
    不写代码，在终端里验证 Key、列模型、发消息、出图。`npx apiyi@latest check` 零安装。
  </Card>

  <Card title="开发者套件 · 编程 Agent" icon="code" href="#给编程-agent-的规则">
    Cursor、Claude Code、Codex 写接入代码前，先读契约和模型注册表，不编造端点。
  </Card>
</CardGroup>

## 套件里有什么

全部是公开地址，不需要登录，任何 Agent 都能直接抓取：

| 文件         | 地址                                           | 角色                                                       |
| ---------- | -------------------------------------------- | -------------------------------------------------------- |
| **接入契约**   | `https://docs.apiyi.com/skill.md`            | 端点表、认证、模型命名规则、常见坑、自检状态、检查单。既是编程 Agent 的规则书，也是 Skills 的正文 |
| **模型注册表**  | `https://docs.apiyi.com/model-registry.json` | 模型 ID、可用端点、分组、计费方式与标价的机器可读事实来源，随价格总表自动更新                 |
| **页面索引**   | `https://docs.apiyi.com/llms.txt`            | 全站目录，让 Agent 自己决定该读哪一页                                   |
| **全文合集**   | `https://docs.apiyi.com/llms-full.txt`       | 所有页面正文拼接，体积大，按需取用                                        |
| **单页纯文本**  | 任意页面地址后加 `.md`                               | 只关心某一页时，比抓 HTML 省 token                                  |
| **MCP 服务** | `https://docs.apiyi.com/mcp`                 | 把本站接成 MCP server，Agent 可随时检索最新内容                         |

<Tip>
  本页的纯文本版就是 `https://docs.apiyi.com/developer-kit.md`。
</Tip>

## 给编程 Agent 的规则

编程 Agent 最常犯的错不是写不出代码，而是**凭记忆编**：编一个不存在的端点、把 `gpt-5.4-mini` 写成 `gpt-5-4-mini`、给 Anthropic SDK 的 base\_url 多加一个 `/v1`。这五条规则把这些坑挡在前面：

1. **不要编造端点、参数名、枚举值或响应结构**。只用 `skill.md` 端点表里列出的路径；参数以对应协议（OpenAI / Anthropic / Gemini）的官方定义为准。
2. **模型 ID 以 `model-registry.json` 为唯一事实来源**。ID 带点号且区分大小写，文档页地址里的连字符是 URL 安全替换，不是模型 ID。
3. **Base URL 按 SDK 选，不按模型选**。OpenAI SDK 用 `https://api.apiyi.com/v1`；Anthropic SDK 用根域名 `https://api.apiyi.com`；Google GenAI SDK 用根域名并把 `api_version` 设为 `v1beta`。
4. **Key 只从环境变量 `APIYI_API_KEY` 读**。不硬编码、不提交进 git、不贴进对话。
5. **读完先解释，再动手**。让 Agent 先说清楚打哪个端点、用哪个模型、超时设多少，你确认后它再改代码。

<Prompt description="给 Cursor、Claude Code、Codex 等编程 Agent 的完整版提示词。复制后直接粘贴。" icon="code" actions={["copy"]}>
  请先完整阅读 [https://docs.apiyi.com/skill.md](https://docs.apiyi.com/skill.md) 和 [https://docs.apiyi.com/llms.txt。](https://docs.apiyi.com/llms.txt。)
  在写任何代码之前，你必须遵守以下规则：

  * 不要编造 endpoint、参数名、枚举值或响应结构。只使用 skill.md 端点表里列出的路径。
  * 模型 ID 以 [https://docs.apiyi.com/model-registry.json](https://docs.apiyi.com/model-registry.json) 为唯一事实来源。
    ID 带点号且区分大小写（gpt-5.4-mini，不是 gpt-5-4-mini），不要凭记忆写。
  * Base URL 按 SDK 选：OpenAI SDK 用 [https://api.apiyi.com/v1；](https://api.apiyi.com/v1；)
    Anthropic SDK 用 [https://api.apiyi.com（不加](https://api.apiyi.com（不加) /v1）；
    Google GenAI SDK 用 [https://api.apiyi.com](https://api.apiyi.com) 并把 api\_version 设为 v1beta。
  * Key 只从环境变量 APIYI\_API\_KEY 读取，不要硬编码、不要提交进 git。
  * 需要某一页的细节时，从 llms.txt 找到页面地址，在末尾加 .md 读纯文本版。

  读完后，先用你自己的话解释你理解的接入流程（打哪个端点、用哪个模型、超时设多少），
  不要立即编辑代码。等我确认后再动手。
</Prompt>

<Accordion title="这段提示词替你挡掉了什么">
  | 要求               | 挡掉的坑                                                                    |
  | ---------------- | ----------------------------------------------------------------------- |
  | 不编造端点            | Agent 从训练记忆里拼出 `/v1/complete`、`/v1/generate` 这类不存在的路径，然后在 404 里打转       |
  | 模型 ID 查注册表       | `gpt-5-4-mini`、`minimax-m3` 这种连字符或大小写错误会直接 404，且报错信息不会告诉你差在哪            |
  | Base URL 按 SDK 选 | Anthropic SDK 多加 `/v1` 会拼成 `/v1/v1/messages`；OpenAI SDK 少了 `/v1` 同样 404 |
  | Key 只读环境变量       | 写死在代码里的 Key 会随仓库泄漏；本站 pre-commit 钩子也会拦                                  |
  | 先解释再动手           | 避免 Agent 一上来改十个文件，最后发现选错了协议                                             |
</Accordion>

## Skills 技能包

技能包就是 `skill.md` 本身：一份专门写给 AI 读的接入说明，装进 Agent 之后，它在需要调用 API易 时会自动想起这些规则。三种安装方式：

<Tabs>
  <Tab title="npx skills（通用）" icon="package">
    适用于 Claude Code、Cursor、Codex 等支持 Agent Skills 规范的工具：

    ```bash theme={null}
    npx skills add https://docs.apiyi.com
    ```

    通过本站的 `/.well-known/agent-skills/index.json` 自动发现，装的是 `skill.md` 本体，不带脚本。自检用 `npx apiyi@latest check`。
  </Tab>

  <Tab title="OpenClaw" icon="bot">
    OpenClaw 的技能安装器认 git 源，仓库根目录必须有 `SKILL.md`。本技能的仓库 `github.com/apiyi-com/skills` 就是这样布局的，还附带自检脚本：

    ```bash theme={null}
    openclaw skills install git:apiyi-com/skills
    ```

    或者手动克隆到工作区：

    ```bash theme={null}
    git clone https://github.com/apiyi-com/skills ~/.openclaw/workspace/skills/apiyi
    ```

    装好后 Agent 会跑 `scripts/apiyi.py --check`，按结果引导你配置 Key。
  </Tab>

  <Tab title="手动复制" icon="clipboard">
    任何能读文件的 Agent 都行。把 `https://docs.apiyi.com/skill.md` 的内容放进它的技能目录：

    | Agent       | 放到                              |
    | ----------- | ------------------------------- |
    | Claude Code | `.claude/skills/apiyi/SKILL.md` |
    | Codex CLI   | `.agents/skills/apiyi/SKILL.md` |
    | Cursor      | 项目规则文件，或直接作为上下文粘贴               |
    | 其它          | 直接把全文作为系统提示词的一部分                |
  </Tab>
</Tabs>

<Prompt description="给 OpenClaw、Claude Code、Cursor 等支持 Skills 的 Agent。复制后直接粘贴。" icon="bot" actions={["copy"]}>
  请先把 API易（APIYI）技能装到你自己身上，再用它帮我接入 API易。

  1. 优先运行 `npx skills add https://docs.apiyi.com`（技能名 apiyi）。
     如果你是 OpenClaw，用技能安装器装 `git:apiyi-com/skills`，
     或把仓库克隆到 \~/.openclaw/workspace/skills/apiyi/。
     都跑不通就直接抓取 [https://docs.apiyi.com/skill.md](https://docs.apiyi.com/skill.md) 全文阅读，效果一样。
  2. 装好先自检：运行技能里的 `scripts/apiyi.py --check`（没有脚本就用 `npx apiyi@latest check`）。
     结果是 no\_key 就向我要 Key（我在 [https://api.apiyi.com/token](https://api.apiyi.com/token) 复制），
     存到环境变量 APIYI\_API\_KEY；不要硬编码、不要提交进 git。
  3. 自检返回 ready 后，用 gpt-5.4-mini 发一句「你好」，把返回贴给我，
     再告诉我接下来你能用这个技能帮我做什么。
</Prompt>

### Key 怎么给它

* **首选环境变量** `APIYI_API_KEY`。技能、CLI、所有文档示例都从这里读。
* **OpenClaw** 会把 Key 存在 `~/.openclaw/openclaw.json` 的 `skills.entries.apiyi.apiKey`，运行时自动注入为 `APIYI_API_KEY`（技能 frontmatter 里的 `primaryEnv` 声明的就是这个）。配置文件的写法见 [OpenClaw 配置文件详解](/scenarios/agent/openclaw/config-json)。
* **CLI** 用 `npx apiyi@latest auth set-key` 存到 `~/.config/apiyi/config.json`，文件权限 0600。

### 自检状态

技能脚本、CLI、手工 curl 三种自检方式返回同一套状态：

| 状态              | 含义                  | Agent 会怎么做                                    |
| --------------- | ------------------- | --------------------------------------------- |
| `ready`         | `/v1/models` 返回 200 | 告诉你能看到多少个模型，问你要做什么                            |
| `no_key`        | 哪里都没找到 Key          | 引导你去控制台复制 Key，存进环境变量后再检                       |
| `invalid_key`   | 401 或 403           | Key 错了、被禁用或已耗尽，让你重新复制                         |
| `network_error` | 超时、DNS 失败或 5xx      | 重试一次；仍失败则换 `vip.apiyi.com`（海外）或 `b.apiyi.com` |

<Warning>
  普通 `sk-` Key **读不到余额**，所以没有 `no_balance` 这个状态。余额和日志用的是另一套系统令牌，见 [如何查看调用日志](/faq/call-logs)。遇到 429 可能是限流也可能是余额用完，Agent 不应猜，应引导你去 [控制台](https://api.apiyi.com/account/profile) 看。
</Warning>

## CLI 命令行

不写代码也能在终端里跑通第一次调用。Node 18 以上，零安装：

```bash theme={null}
npx apiyi@latest check
```

<Prompt description="给任何能执行终端命令的 Agent，或自己逐行执行。" icon="terminal" actions={["copy"]}>
  请帮我安装并跑通 API易 命令行工具：[https://github.com/apiyi-com/cli](https://github.com/apiyi-com/cli)
  要求：Node 18 以上；直接 `npx apiyi@latest check` 零安装；
  引导我配置 API Key（`npx apiyi@latest auth set-key` 或环境变量 APIYI\_API\_KEY，从 [https://api.apiyi.com/token](https://api.apiyi.com/token) 复制）；
  最后跑 `npx apiyi@latest models --grep gpt-5` 和 `npx apiyi@latest chat "你好" -m gpt-5.4-mini`，把输出贴给我。
</Prompt>

### 命令一览

| 命令                                            | 需要     | 做什么                                                     |
| --------------------------------------------- | ------ | ------------------------------------------------------- |
| `apiyi check`                                 | Key 可选 | 检查 Key 来源、节点连通、`/v1/models` 是否 200，打印延迟与状态；有系统令牌时顺带显示余额 |
| `apiyi models [--grep 关键词]`                   | Key 可选 | 有 Key 走 `/v1/models` 列你能用的模型；无 Key 读公开注册表               |
| `apiyi chat "提示词" [-m 模型] [--stream]`         | Key    | 发一条 Chat Completions，打印回复与 token 用量。默认模型 `gpt-5.4-mini` |
| `apiyi responses "输入" [-m 模型] [--effort low]` | Key    | 走 Responses 端点，打印 `output_text`                         |
| `apiyi image "提示词" -m gpt-image-2 [-o 文件名]`   | Key    | 出图并写到本地文件，超时 360 秒                                      |
| `apiyi balance`                               | 系统令牌   | 查余额（按 500000 配额 = 1 美元换算）                               |
| `apiyi auth set-key` / `show` / `clear`       | 无      | 隐藏输入保存 Key；`show` 打码显示；`clear` 清除                       |

全局参数：`--api-key`、`--node api|vip|b|cf`（选节点）、`--base-url`、`--timeout`、`--json`（机器可读输出）。

### Key 的查找顺序

`--api-key` 参数 → 环境变量 `APIYI_API_KEY` → `~/.config/apiyi/config.json` → OpenClaw 的 `~/.openclaw/openclaw.json`。装过 OpenClaw 技能的用户不用再配一次。

### 退出码

脚本和 Agent 靠退出码分支，不用解析文字：

| 码 | 含义                               |
| - | -------------------------------- |
| 0 | 成功                               |
| 2 | `no_key`                         |
| 3 | `invalid_key`（401 / 403）         |
| 4 | `network_error`（DNS、超时、重试后仍 5xx） |
| 5 | 模型不存在（404，通常是 ID 写错）             |
| 6 | 限流或余额不足（429）                     |
| 7 | 请求参数错误（400，原样打印 `error.message`） |
| 8 | 命令行参数错误                          |

源码在 `github.com/apiyi-com/cli`，npm 包名 `apiyi`。文档一律写 `npx apiyi@latest`，因为 `npx` 会缓存旧版本。

## model-registry.json 字段说明

每次刷新价格总表时自动重新生成，与 [模型价格](/models) 页同源。顶层字段：

| 字段               | 含义                                                                                                        |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| `schema_version` | 结构版本，当前为 1。同一版本内只增字段不改名                                                                                   |
| `generated_at`   | 生成时间（UTC）                                                                                                 |
| `base_urls`      | 三种 SDK 各自该填的 base\_url，以及 Gemini 的 `api_version`                                                          |
| `nodes`          | 可用节点域名                                                                                                    |
| `endpoints`      | 端点名到路径与方法的映射：`chat` / `responses` / `messages` / `gemini` / `images` / `embeddings` / `rerank` / `models` |
| `groups`         | 分组名到显示名与倍率                                                                                                |
| `models[]`       | 见下表                                                                                                       |

每个模型条目：

| 字段                                                                      | 含义                                             |
| ----------------------------------------------------------------------- | ---------------------------------------------- |
| `id`                                                                    | 模型 ID，调用时原样使用，区分大小写                            |
| `vendor_en`                                                             | 厂商英文名                                          |
| `category`                                                              | `text` / `image` / `video` / `embedding` 等能力类型 |
| `endpoints`                                                             | 这个模型能走的端点名，对应顶层 `endpoints` 的键                 |
| `groups`                                                                | 哪些令牌分组能调用它                                     |
| `billing.type`                                                          | `per_token`（按百万 token）或 `per_call`（按次）         |
| `billing.input_usd_per_m` / `output_usd_per_m` / `cache_read_usd_per_m` | 按量模型的美元标价                                      |
| `billing.per_call_usd`                                                  | 按次模型的单次美元标价                                    |
| `billing.tiered`                                                        | 是否有阶梯价（为 true 时详情看模型页）                         |
| `docs_url`                                                              | 有详情页时给出地址                                      |

<Info>
  注册表里的价格是**标价**，不含充值加赠和分组折扣，实际扣费以控制台为准。分组含义见 [分组说明](/faq/groups-explained)。
</Info>

## 相关页面

<CardGroup cols={2}>
  <Card title="快速开始" icon="rocket" href="/getting-started">
    两条路：让 AI 接，或自己动手接。
  </Card>

  <Card title="有没有一键对接功能？" icon="plug" href="/faq/one-click-integration">
    有，但形态是把文档交给 AI，而不是一个按钮。
  </Card>

  <Card title="OpenClaw 接入" icon="bot" href="/scenarios/agent/openclaw/overview">
    开源本地 AI 助手，装上技能包后用自然语言调用 API易。
  </Card>

  <Card title="模型价格总表" icon="circle-dollar-sign" href="/models">
    注册表的人类可读版本，含厂商分组与阶梯价。
  </Card>
</CardGroup>
