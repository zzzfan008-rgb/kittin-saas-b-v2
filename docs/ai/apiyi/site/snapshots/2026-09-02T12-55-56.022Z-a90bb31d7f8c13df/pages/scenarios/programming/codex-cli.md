> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Codex

> 一份配置，三处通用：在 Codex 桌面客户端、IDE 插件（VSCode/Cursor）和命令行 CLI 中，通过 API易 接入 gpt-5.6-sol / gpt-5.5 / gpt-5.4 等模型。推荐写 config.toml + auth.json，不折腾环境变量。

<Warning>
  **先说成本**：写代码这类长上下文任务、以及 Agent 需要深度探索的场景，**API 按量计费的消耗相当大，综合性价比通常不如官网订阅会员**。

  Codex 每一轮都要反复读入项目上下文、翻工具结果、来回改，一次像样的任务动辄几十万 token。真实发生过的情况是：**充 \$5 还没跑完一次深度调研，额度就见底了**——这不是异常，是这类场景的正常消耗量级。

  * **用量大、且有条件直连官网**：建议直接买 ChatGPT Plus / Pro 官方订阅，固定月费在高频重度场景下更划算。
  * **受制于网络环境，或就是想用多少付多少**：那 API 更适合你——免代理直连、无固定月费、无需自行维护官方账号，还能一把 Key 调 400+ 模型。

  两种方式没有绝对优劣，按自己的用量和网络条件选即可。这里如实告知，避免充值后产生预期落差。
</Warning>

## 概述

<Info>
  **Codex 与 ChatGPT 客户端已合并**：2026 年 7 月初，OpenAI 将 Codex 桌面客户端并入 ChatGPT 客户端，两者现在是同一个产品。因此本教程**同时适用于 Codex APP 和 ChatGPT 客户端**——如果你用的是 ChatGPT 客户端里的 Codex，配置方法完全一样。
</Info>

**OpenAI Codex** 是 OpenAI 官方的 AI 编程助手，有三种用法：**桌面客户端**、**IDE 插件**（VSCode / Cursor 等）、以及**命令行 CLI**。三者在底层**共用同一份配置**（`~/.codex/` 目录下的 `config.toml` 与 `auth.json`）。

通过 API易接入，本质只有一句话：

> **把 OpenAI 的入口换成 API易**

API易是 **OpenAI 兼容接口（透明代理）**——配好一次，桌面客户端、插件、终端三处都能用。

<CardGroup cols={2}>
  <Card title="🔁 一份配置三处用" icon="layers">
    桌面 / 插件 / CLI 共用 `~/.codex/`，配一次全通
  </Card>

  <Card title="⚡ 最新模型" icon="sparkles">
    支持 `gpt-5.6-sol` / `gpt-5.5` / `grok-4.5`，还可用国产模型
  </Card>

  <Card title="💰 按量计费" icon="calculator">
    与 OpenAI 官方 API 计费方式一致，无固定月费
  </Card>

  <Card title="🪟 全平台" icon="globe">
    Windows / Mac / Linux 通用
  </Card>
</CardGroup>

<Info>
  **先理解再上手**：Codex 接第三方 API（如 API易）的关键，是在 `~/.codex/config.toml` 里把"模型供应商"指向 API易，并在 `~/.codex/auth.json` 里放你的 Key。**桌面客户端和 IDE 插件都靠这份文件生效**——所以本文以"写配置文件"为主，不推荐折腾环境变量。
</Info>

## 一、准备工作：拿到 API易 Key

<Steps>
  <Step title="注册 / 登录 API易">
    访问 [api.apiyi.com](https://api.apiyi.com) 注册或登录你的账号。
  </Step>

  <Step title="创建 API Key">
    进入「令牌管理」页面（[api.apiyi.com/token](https://api.apiyi.com/token)），点击「创建新令牌」。
  </Step>

  <Step title="复制密钥">
    复制生成的 API Key（格式：`sk-***`），妥善保存，后面要填进配置文件。
  </Step>
</Steps>

### 选择你的入口

三种入口都可以，**配置完全一样**，按习惯挑一个即可：

<CardGroup cols={3}>
  <Card title="🖥️ 桌面客户端" icon="monitor">
    独立 App，开箱即用，**最推荐新手**
  </Card>

  <Card title="🧩 IDE 插件" icon="puzzle">
    VSCode / Cursor 扩展，边写代码边用
  </Card>

  <Card title="⌨️ 命令行 CLI" icon="terminal">
    终端工作流，适合脚本与自动化
  </Card>
</CardGroup>

## 二、核心配置（推荐：写配置文件，不折腾环境变量）

下面三种配置方式，**任选其一**。推荐顺序：手动写文件（最稳）→ 可视化 → 环境变量。

### 方式一 · 手动写 `auth.json` + `config.toml`（推荐、最稳）

进入 Codex 的配置目录（没有就新建），在里面放/改两个文件：

<Tabs>
  <Tab title="🪟 Windows">
    配置目录：`%USERPROFILE%\.codex\`（即 `C:\Users\你的用户名\.codex\`）。

    用文件资源管理器进入该目录。
  </Tab>

  <Tab title="Mac / Linux">
    配置目录：`~/.codex/`。

    可在终端执行 `mkdir -p ~/.codex` 进入。
  </Tab>
</Tabs>

<Warning>
  **如果 `config.toml` 已经存在，不要整体覆盖！** 它里面可能已有你之前设置的模型偏好、审批策略、MCP 服务器等。正确做法是**先备份、再合并**（见下方「如何安全地改已有 config.toml」），只把 API易 需要的几行加进去。`auth.json` 同理，已有就改 `OPENAI_API_KEY` 的值即可。
</Warning>

**1）`auth.json`——把 Key 放进去：**

```json theme={null}
{
  "OPENAI_API_KEY": "sk-你的APIYI密钥"
}
```

**2）`config.toml`——把模型供应商指向 API易：**

如果是**全新文件**，直接写入下面内容；如果**已有文件**，把"全局键"加到文件**最顶部**、把 `[model_providers.apiyi]` 整段加到文件**最末尾**（原因见下方提示）。

```toml theme={null}
# === 全局（放在文件最顶部）===
model = "gpt-5.4"                 # 默认模型，可按需改成 gpt-5.5 等
model_provider = "apiyi"          # 使用下面定义的 apiyi 供应商
preferred_auth_method = "apikey"  # 用 API Key 认证（不要用 chatgpt 登录）

# === API易 供应商定义（放在文件最末尾）===
[model_providers.apiyi]
name = "apiyi"
base_url = "https://api.apiyi.com/v1"
experimental_bearer_token = "sk-你的APIYI密钥"
wire_api = "responses"
```

<Warning>
  **先把 `sk-你的APIYI密钥` 换成你的真实 Key** 再保存（就是上一步在 `api.apiyi.com/token` 复制的那串 `sk-` 开头的字符）。两个文件里的 Key 要一致。
</Warning>

<Accordion title="如何安全地改已有 config.toml（备份 + 合并的最佳实践）">
  **第 1 步：先备份。** 改任何配置前，把原文件复制一份，出问题随时能还原：

  ```bash theme={null}
  # Mac / Linux
  cp ~/.codex/config.toml ~/.codex/config.toml.bak

  # Windows PowerShell
  Copy-Item $env:USERPROFILE\.codex\config.toml $env:USERPROFILE\.codex\config.toml.bak
  ```

  **第 2 步：合并，而不是覆盖。** 只往已有文件里加 API易 需要的内容：把 `model` / `model_provider` / `preferred_auth_method` 三行放到文件**最顶部**，把 `[model_providers.apiyi]` 整段追加到文件**最末尾**。原有的其它配置原样保留。

  <Warning>
    **TOML 顺序陷阱**：在 TOML 里，所有"裸键值对"（如 `model = "..."`）**必须出现在任何 `[xxx]` 表头之前**，否则它会被算进上一个表里。所以全局键放最上面、`[model_providers.apiyi]` 放最下面，是最不容易出错的写法。
  </Warning>

  **第 3 步：如果只是想临时试一下、又不想动主配置**，可以用 profile：新建 `~/.codex/apiyi.config.toml` 放上面这套内容，运行时 `codex --profile apiyi` 即可，互不影响（详见[进阶配置](#六进阶配置)）。
</Accordion>

<Note>
  **字段说明**：

  * `base_url`：固定写 `https://api.apiyi.com/v1`，**必须带 `/v1`**，否则 404。
  * `experimental_bearer_token`：把 Key 直接写在供应商块里，请求时作为 Bearer 发送。**这是桌面客户端 / IDE 插件 / CLI 三处都确定生效的写法**，不依赖环境变量。
  * 供应商的认证字段**三选一、不能混写**：`experimental_bearer_token`（Key 写在配置里，推荐）/ `env_key`（从**启动进程的环境变量**读 Key——注意它**不会**去读 `auth.json`，且桌面客户端读不到终端里 export 的变量）/ `requires_openai_auth`（复用 `auth.json` 的官方登录态）。按旧版本文档同时写了 `env_key` + `requires_openai_auth` 的，请改成本文当前写法。
  * `wire_api = "responses"`：Codex 默认且首选的协议，API易 已支持。个别模型若报 404 / unknown endpoint，改成 `"chat"` 兜底（见[进阶配置](#六进阶配置)）。
  * 不要在本文件里写形如 `C:\Users\xxx\.codex\...` 的绝对路径，换台机器会断。
</Note>

### 方式二 · cc-switch 可视化配置（图形界面，免手动编辑）

不想手动编辑文件，可以用 **CC Switch**——一个图形界面工具，点几下就能把 API易 的地址、Key、模型写进 Codex 配置，还能统一管理 Claude Code、Codex、Gemini CLI 等多款工具，一键切换。它也会自动处理上面的备份/合并，新手可优先考虑。

详见 [CC Switch 可视化配置](/scenarios/programming/cc-switch)。配好后，Codex 的桌面客户端 / 插件 / CLI 都会自动读到这份配置。

### 方式三 · 环境变量（可选，较复杂，不推荐为主路径）

<Accordion title="只想临时在终端测试？展开看环境变量方式（不推荐长期用）">
  Codex CLI 也能读 `OPENAI_BASE_URL` / `OPENAI_API_KEY` 两个环境变量：

  ```bash theme={null}
  export OPENAI_BASE_URL="https://api.apiyi.com/v1"
  export OPENAI_API_KEY="sk-你的APIYI密钥"
  ```

  <Warning>
    **不推荐作为主路径**：环境变量方式在新版 Codex 上经常不生效，且**桌面客户端 / IDE 插件不读这两个变量**——它们只认 `config.toml` + `auth.json`。环境变量仅适合 CLI 临时测试，长期使用请用方式一或方式二。
  </Warning>
</Accordion>

## 三、三处怎么用（优先桌面客户端）

配好上面的 `~/.codex/` 后，下面三种入口任选。**改完配置都要重启对应程序**（Codex 只在启动时读一次配置）。

### 1. Codex 桌面客户端（最推荐）

1. 安装并打开 Codex 桌面客户端。
2. 首次打开时选择认证方式：**选 apikey**（不要选 chatgpt 登录）。
3. 在模型 / 供应商选择处，选中配置里的 `apiyi` 供应商与目标模型（如 `gpt-5.4`）。
4. **重启客户端**生效。
5. 跑一个最小任务验证（见[第四节](#四最小验证)）。

### 2. IDE 插件（VSCode / Cursor）

1. 打开扩展市场（VSCode 按 `Ctrl+Shift+X` / `Cmd+Shift+X`），搜索 `Codex — OpenAI's coding agent`，点 `Install`。
2. 安装后左侧边栏出现 Codex 图标，点击打开面板。
3. 首次打开按提示三连：①认证方式**选 apikey**；②Key 来源选「配置文件 / 环境变量」；③是否启用 `AGENTS.md`（推荐开启）。
4. **重启编辑器**生效。
5. 在 Codex 面板跑最小任务验证。

### 3. 命令行 CLI

先全局安装官方 CLI（需要 Node.js 18+）：

```bash theme={null}
npm install -g @openai/codex
codex --version
```

进入项目直接启动，或一句话执行任务：

```bash theme={null}
cd /your/project
codex                                  # 交互模式
codex "帮我写一个 Python HTTP Server"   # 直接带任务
codex -q "修复当前项目的构建错误"        # 非交互/静默模式
```

<Tip>
  Mac 用户若遇到全局安装权限问题，推荐用 nvm / fnm 管理 Node 版本，避免 `sudo`。
</Tip>

## 四、最小验证

配好并重启后，在任一入口里输入一个最小任务：

```text theme={null}
请用中文在当前项目中创建一个 hello 接口，并附上调用示例。
```

CLI 用户也可以直接：

```bash theme={null}
codex -q "hello"
```

能正常返回并给出可执行代码，就说明 API易 链路已经打通。

## 五、模型说明（API易 推荐）

在 `config.toml` 的 `model` 字段、或运行时切换即可选用以下模型：

| 模型                   | 特点                           | 适用场景                        |
| -------------------- | ---------------------------- | --------------------------- |
| **`gpt-5.6-sol`**    | 5.6 旗舰（2026年7月9日 发布）         | 最难的问题：复杂编码、深度工程分析、Agent 工作流 |
| **`gpt-5.6-terra`**  | 5.6 均衡档                      | 大批量业务任务，性能与成本均衡             |
| **`gpt-5.6-luna`**   | 5.6 快速低价档                    | 摘要、草稿、日常自动化，快且省             |
| **`gpt-5.5`**        | 上代主力模型                       | 复杂代码任务、工程分析、Agent 工作流       |
| **`gpt-5.4`**        | 稳定常用                         | 大多数代码开发、调试、重构（默认推荐）         |
| **`gpt-5.4-mini`**   | 便宜的 5.4 变体                   | 中小规模任务、批量处理、省钱              |
| **`grok-4.5`**       | xAI 旗舰，**原生支持 responses 协议** | 代码 Agent、复杂任务，OpenAI 系之外的首选 |
| **`grok-build-0.1`** | Grok 代码专用，全系最低价              | 高频代码补全、轻量编程任务               |

<Tip>
  **怎么选**：日常 → `gpt-5.4` 或 `gpt-5.6-terra`；重活 / Agent → `gpt-5.6-sol`（或 `gpt-5.5`）；省钱 → `gpt-5.6-luna` / `gpt-5.4-mini`；OpenAI 之外想换口味 → `grok-4.5`。
</Tip>

<Note>
  **为什么特别推荐 Grok**：xAI 官方 API 本身就是 OpenAI 兼容双端点（Chat Completions + Responses API），所以 Grok 是**难得原生支持 `/v1/responses` 协议的非 OpenAI 模型**——在 Codex 里保持 `wire_api = "responses"` 不用改，把 `model` 换成 `grok-4.5` 即可，Codex 的 Agent 能力（工具调用、推理条目等）都按原生协议走。responses 端点在 API易 上以 `grok-4.5` 实测通过，其余 Grok 型号同架构预期一致，个别遇 404 可按[第六节](#六进阶配置)兜底。详见 [Grok API 调用指南](/api-capabilities/grok/overview)。

  **对比 Claude / Gemini**：这两家在 API易 上走的是 **OpenAI 兼容 chat 模式，不支持 responses 端点**——在 Codex 里必须把 `wire_api` 改成 `"chat"` 兜底，而 Codex 的 Agent 场景按 responses 协议设计，chat 模式下工具调用等行为可能有不兼容、体验打折。想用 Claude / Gemini 做编程，建议用各自原生工具（[Claude Code](/scenarios/programming/claude-code) / [Gemini CLI](/scenarios/programming/gemini-cli)）。
</Note>

<Note>
  **也支持国产 / 任意 OpenAI 兼容模型**：API易 聚合了大量模型，凡是支持 OpenAI 兼容调用方式的都能在 Codex 里用——例如智谱 `glm-5.2`。只需把 `config.toml` 的 `model` 字段（或运行时 `-m`）换成对应模型 ID 即可。
</Note>

### 切换模型的 4 种方式

**① 启动时临时指定**（CLI）：

```bash theme={null}
codex -m gpt-5.5
codex --model gpt-5.4 "帮我检查这个项目的代码结构"
```

**② 非交互模式指定**（CLI）：

```bash theme={null}
codex -q -m gpt-5.4 "修复当前项目里的构建错误"
```

**③ 会话内切换**：在交互面板里输入 `/model`，按提示选择。

**④ 配置默认模型（永久生效）**：编辑 `~/.codex/config.toml`，把 `model` 改成想要的，保存后重启：

```toml theme={null}
model = "gpt-5.5"
```

## 六、进阶配置

<AccordionGroup>
  <Accordion title="自定义系统提示词（instructions.md）">
    编辑 `~/.codex/instructions.md`，定义编码风格、输出语言、项目规范，例如：

    ```markdown theme={null}
    - 代码注释使用中文
    - 遵循项目的 ESLint 配置
    - 提供详细的解释说明
    ```
  </Accordion>

  <Accordion title="项目级 AGENTS.md">
    在项目里运行 `codex /init` 会生成 `AGENTS.md`，记录项目结构与规范。如需 Codex 默认用中文交流，加一行：

    ```markdown theme={null}
    本项目请始终用中文跟用户交流。
    ```
  </Accordion>

  <Accordion title="协议兜底：wire_api 改 chat">
    `wire_api = "responses"` 是 Codex 默认且首选的协议，多数模型直接可用。若某个模型返回 404 / unknown endpoint，把 `config.toml` 里对应供应商的 `wire_api` 改成 `"chat"`（走 `/chat/completions`）再试。
  </Accordion>

  <Accordion title="多套配置切换（profiles）">
    在 `~/.codex/` 下新建 `<名字>.config.toml`（例如 `openai.config.toml` 放官方配置），运行时用 `codex --profile <名字>` 切换。便于在 API易 与其它供应商之间快速切换。
  </Accordion>

  <Accordion title="常用参数">
    ```bash theme={null}
    codex -h          # 查看完整帮助
    codex -m <模型>   # 指定模型
    codex -q          # 非交互/静默模式
    codex --full-auto # 自动执行（谨慎使用）
    ```
  </Accordion>
</AccordionGroup>

## 七、排障

<AccordionGroup>
  <Accordion title="1. 报 Missing environment variable: OPENAI_API_KEY（桌面客户端 / 插件最常见）">
    明明写好了 `auth.json` + `config.toml`、也重启了应用，还是弹 `Missing environment variable: OPENAI_API_KEY`——原因是供应商块里写了 `env_key = "OPENAI_API_KEY"`（旧版本文档的写法）。

    `env_key` 的语义是**从启动 Codex 的进程环境变量里取 Key**，它**不会**去读 `auth.json`（`auth.json` 只服务于 OpenAI 官方登录态）。而桌面客户端 / IDE 从 Dock / 启动器打开时，**不继承你在终端里 export 的变量**（`.zshrc` 里的 export 对 GUI 应用无效），所以无论重启多少次都找不到这个变量。

    **修法（推荐）**：编辑 `~/.codex/config.toml`，删掉供应商块里的 `env_key`（如有 `requires_openai_auth` 也一并删掉），换成把 Key 直接写进去：

    ```toml theme={null}
    [model_providers.apiyi]
    name = "apiyi"
    base_url = "https://api.apiyi.com/v1"
    experimental_bearer_token = "sk-你的APIYI密钥"
    wire_api = "responses"
    ```

    改完**重启**应用即可。

    **备选**（坚持用 `env_key` 时）：把变量设为系统级——macOS 执行 `launchctl setenv OPENAI_API_KEY "sk-你的Key"` 后重启应用（开机后需重设）；Windows 执行 `setx OPENAI_API_KEY "sk-你的Key"` 后重启应用。仅用 CLI 的话，在 shell 配置里 `export` 即可。
  </Accordion>

  <Accordion title="2. 确认 auth.json / config.toml 的路径和内容无误">
    * `auth.json` 必须是合法 JSON，且 `OPENAI_API_KEY` 是你真实的 `sk-` 开头 Key。
    * `config.toml` 必须能被 TOML 正确解析（注意引号、缩进）。
    * 路径在 Windows `%USERPROFILE%\.codex\`、Mac/Linux `~/.codex/`。
  </Accordion>

  <Accordion title="3. 确认 Key 有效、有可用额度">
    去 API易 控制台确认 Key 没过期、账户有余额 / 额度。
  </Accordion>

  <Accordion title="4. 确认 base_url 带 /v1">
    最常见的连接错误 / 超时 / 404 都是因为漏了 `/v1`。正确：`https://api.apiyi.com/v1`。其次排查本地代理与 DNS。
  </Accordion>

  <Accordion title="5. 改完配置必须重启">
    Codex（CLI / 插件 / 桌面客户端）都只在启动时读一次配置。**改完 `auth.json` / `config.toml` 一定要重启对应程序**。
  </Accordion>

  <Accordion title="6. 仍不稳定：把 wire_api 改成 chat">
    个别模型在 `responses` 协议下不兼容时，把对应供应商的 `wire_api` 改成 `"chat"` 再试。
  </Accordion>
</AccordionGroup>

## 八、常见问题

<AccordionGroup>
  <Accordion title="为什么能用 API易 接入 Codex？">
    因为 API易**完全兼容 OpenAI API 协议**——Codex 看到的 `https://api.apiyi.com/v1` 和 `https://api.openai.com/v1` 在请求/响应格式上一致，仅替换 Base URL 即可。
  </Accordion>

  <Accordion title="为什么发一个 hello，输入的 tokens 却上万？">
    这通常是**正常现象**：Codex 启动时会**读取你当前项目的部分文件做初始化**（目录结构、`AGENTS.md`、相关源码等），把它们作为上下文一起发给模型。所以即使你只说一句 `hello`，输入 tokens 也可能上万。

    **怎么减少？**

    * 在**空目录**或一个**很小的项目**里测试最小任务，上下文自然就小。
    * 给明确的小任务并**指定具体文件**（如「只看 `app.py`，加一个 hello 接口」），缩小 Codex 主动扫描的范围。
    * 验证性的小任务用更便宜的模型（如 `gpt-5.4-mini`）来跑。
  </Accordion>

  <Accordion title="提示 command not found: codex">
    确认已正确安装：

    ```bash theme={null}
    npm install -g @openai/codex
    codex --version
    ```

    若仍报错，检查 `npm bin -g` 路径是否在 `PATH` 中。
  </Accordion>

  <Accordion title="API Key 无效（401 / Invalid Key）">
    1. 确认用的是 **API易 Key**（以 `sk-` 开头），不是 OpenAI 官方 Key。
    2. 确认 `auth.json` 里的 Key 没填错、没多空格。
    3. 改完配置**重启**对应程序。
  </Accordion>

  <Accordion title="连接错误 / 超时 / 404">
    最常见原因：**Base URL 没带 `/v1`**。正确写法：`https://api.apiyi.com/v1`。其次排查本地代理与 DNS。
  </Accordion>

  <Accordion title="能用哪些模型？">
    * **OpenAI 系列**：✅ 完整支持（推荐 `gpt-5.6-sol` / `gpt-5.6-terra` / `gpt-5.6-luna` / `gpt-5.5` / `gpt-5.4`）。
    * **Grok 系列**：✅ 原生支持 responses 协议，`grok-4.5` 无需改 `wire_api` 直接可用，详见 [Grok API 调用指南](/api-capabilities/grok/overview)。
    * **国产 / 其它 OpenAI 兼容模型**：API易 支持，如 `glm-5.2`，改 `model` 字段即可。
    * 注意：**Claude / Gemini 在 API易 上只有 OpenAI 兼容 chat 模式、不支持 responses 端点**，在 Codex 里须把 `wire_api` 改成 `"chat"`，工具调用等 Agent 行为可能有不兼容。想用 Claude / Gemini 做编程，建议用对应原生工具（如 Claude Code / Gemini CLI）。
  </Accordion>

  <Accordion title="桌面客户端 / 插件没生效，怎么办？">
    桌面客户端和 IDE 插件**只读 `~/.codex/config.toml` + `auth.json`，不读环境变量**。请确认这两个文件配置正确，认证方式选了 **apikey**，并**重启**程序。
  </Accordion>

  <Accordion title="适合生产吗？">
    * **CLI / 客户端**：适合开发期效率工具。
    * **生产**：建议直接调用 API（更可控、可监控、可灰度）。
  </Accordion>

  <Accordion title="如何卸载或停用 API易 配置？">
    **卸载 CLI**：

    ```bash theme={null}
    npm uninstall -g @openai/codex
    ```

    **停用 API易 配置**：删除或还原 `~/.codex/config.toml` 与 `auth.json` 即可（卸载桌面客户端 / 插件则在各自界面操作）。
  </Accordion>
</AccordionGroup>

## 九、总结

这类接入本质就一句话：

> **把 OpenAI 的入口换成 API易**

核心就是在 `~/.codex/` 配好一次：`auth.json` 放 Key，`config.toml` 把 `base_url` 指向 `https://api.apiyi.com/v1`。配好后，**桌面客户端、IDE 插件、命令行三处都能用**。剩下都是锦上添花——选模型、写提示词、自定义 `instructions.md` / `AGENTS.md`。

## 相关资源

<CardGroup cols={2}>
  <Card title="API易控制台" icon="settings" href="https://api.apiyi.com">
    管理 API 密钥与查看用量
  </Card>

  <Card title="CC Switch 可视化配置" icon="toggle-left" href="/scenarios/programming/cc-switch">
    图形界面一键配置 Codex / Claude Code
  </Card>

  <Card title="Claude Code 集成" icon="bot" href="/scenarios/programming/claude-code">
    用 Claude 系列做命令行编程
  </Card>

  <Card title="模型对比" icon="chart-bar" href="/api-capabilities/model-info">
    所有可用模型与定价
  </Card>
</CardGroup>
