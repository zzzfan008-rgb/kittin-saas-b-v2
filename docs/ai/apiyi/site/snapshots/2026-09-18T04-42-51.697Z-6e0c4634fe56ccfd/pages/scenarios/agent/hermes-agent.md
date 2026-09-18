> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Hermes Agent

> Nous Research 出品的自学习 AI Agent，内置技能学习闭环 + 跨平台消息网关，可通过 API易 接入任意大模型

## 概述

Hermes Agent 是 Nous Research 出品的开源 AI Agent，主打「会成长的智能体」——它是目前少数内置**学习闭环**的 Agent：能从对话中自动生成技能、在使用中持续打磨技能、主动提醒自己沉淀知识，并通过 FTS5 全文索引检索过往会话，跨 session 维护对你的用户画像。Hermes 不依赖本地机器，从 5 美元的 VPS 到 GPU 集群、再到几乎零成本闲置的 Serverless 平台都能跑。

通过对接 API易，您可以获得：

<CardGroup cols={2}>
  <Card title="🧠 自学习闭环" icon="brain">
    Agent 自主创建/打磨技能，长期记忆 + 跨会话检索
  </Card>

  <Card title="📱 全平台网关" icon="message-circle">
    Telegram / Discord / Slack / WhatsApp / Signal / Email / CLI
  </Card>

  <Card title="⏰ 定时调度" icon="clock">
    内置 cron 调度器，可自动跨平台投递日报/巡检结果
  </Card>

  <Card title="☁️ 跑在任何地方" icon="cloud">
    本地 / Docker / SSH / Modal / Daytona / Vercel Sandbox 七种后端
  </Card>
</CardGroup>

<Info>
  **项目信息**：Hermes Agent 采用 MIT 许可证开源，项目地址 `github.com/NousResearch/hermes-agent`，官方文档 `hermes-agent.nousresearch.com/docs/`。
</Info>

## 安装

### Linux / macOS / WSL2 / Termux

```bash theme={null}
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

### Windows（PowerShell，原生支持仍在 Early Beta）

```powershell theme={null}
iex (irm https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.ps1)
```

安装器会自动处理 `uv`、Python 3.11、Node.js、`ripgrep`、`ffmpeg` 以及一份便携 Git Bash。

完成后重载 Shell 即可启动：

```bash theme={null}
source ~/.bashrc    # 或 source ~/.zshrc
hermes              # 进入终端 UI，开始对话
```

## 接入 API易

Hermes 自带 `hermes model` 命令，可选 Nous Portal / OpenRouter / OpenAI / 自建端点等。API易 提供 **OpenAI 兼容 API**，作为「OpenAI 自定义端点」接入即可一次拿到全模型矩阵。

### 方式一：通过 `hermes model` 交互式配置（推荐）

```bash theme={null}
hermes model        # 进入模型选择向导
```

向导会依次询问：

| 步骤           | 输入                                                                                  |
| ------------ | ----------------------------------------------------------------------------------- |
| Provider     | 选 `OpenAI`（或 `Custom OpenAI endpoint`）                                              |
| API Base URL | `https://api.apiyi.com/v1`                                                          |
| API Key      | 你的 API易 密钥（`sk-...`）                                                                |
| Model        | 填入想用的模型 ID，如 `gpt-5.4`、`claude-sonnet-4-6`、`deepseek-v3.2`、`gemini-3.1-pro-preview` |

### 方式二：通过 `hermes config set` 直接写入

```bash theme={null}
hermes config set llm.provider openai
hermes config set llm.base_url https://api.apiyi.com/v1
hermes config set llm.api_key sk-你的API易密钥
hermes config set llm.model gpt-5.4
```

写入后用 `hermes` 启动一次验证连接。

### 方式三：环境变量（适合 Docker / Serverless 部署）

```bash theme={null}
export OPENAI_API_BASE=https://api.apiyi.com/v1
export OPENAI_API_KEY=sk-你的API易密钥
export HERMES_MODEL=gpt-5.4
hermes
```

切换模型只需 `hermes model` 或修改 `HERMES_MODEL`，**无需改任何代码**。

### 方式四：Anthropic 原生协议（主用 Claude 强烈推荐）

Hermes 把 Anthropic 作为**一等公民 Provider**，内部 wire protocol 称为 `anthropic_messages`，相比走 OpenAI 兼容路径有独家加成：

<Info>
  **走 Anthropic 原生协议的额外收益**：Hermes 会自动给 native Anthropic、OpenRouter、Nous Portal 这三类 Provider 挂上 `cache_control` 1 小时缓存断点（系统提示 + 技能内容 + 长上下文前段），跨 session 和 subagent 复用，按低价的 cached-read 费率结算。**走 OpenAI 兼容路径时这个优化不会生效**。Claude 主力用户建议直接走这条路。
</Info>

CLI 配置：

```bash theme={null}
hermes config set llm.provider anthropic
hermes config set llm.base_url https://api.apiyi.com
hermes config set llm.api_key sk-你的API易密钥
hermes config set llm.model claude-sonnet-4-6
```

环境变量等价写法：

```bash theme={null}
export ANTHROPIC_BASE_URL=https://api.apiyi.com
export ANTHROPIC_API_KEY=sk-你的API易密钥
export HERMES_MODEL=claude-sonnet-4-6
hermes
```

<Warning>
  **`base_url` 不要带 `/v1`**：必须是 `https://api.apiyi.com`。Anthropic 协议会自动拼接 `/v1/messages`，写错会变成 `.../v1/v1/messages` 触发 404。
</Warning>

Hermes 会根据 URL 自动识别协议（路径含 `/anthropic` 直接走 `anthropic_messages`）。若使用 LiteLLM 代理等非标准端点，可手动指定：

```bash theme={null}
hermes config set llm.api_mode anthropic_messages
```

**额外提示**：API易 控制台 `api.apiyi.com/token` 创建令牌时，**分组选 ClaudeCode** 可自动享受 95 折，可叠加充值赠送 10%-20%。

<Tip>
  **为什么选 API易？**

  * **一把密钥多家模型**：OpenAI / Anthropic / Google / DeepSeek / 智谱 / Kimi 等全模型矩阵
  * **价格优势**：相对官方价格通常有 5%-20% 优惠，部分模型支持充值加赠
  * **国内直连**：免代理直接访问海外大模型
  * **双协议兼容**：OpenAI 和 Anthropic 两套 Wire Protocol 都能接，主用 Claude 走 Anthropic 原生还能吃到 1 小时缓存折扣
</Tip>

## 常用功能速查

<CardGroup cols={2}>
  <Card title="终端 UI" icon="terminal">
    完整 TUI：多行编辑、斜杠命令补全、会话历史、流式工具输出
  </Card>

  <Card title="消息网关" icon="bot">
    `hermes gateway setup` 后绑定 Bot Token，即可在 IM 平台直接对话
  </Card>

  <Card title="技能系统" icon="puzzle">
    程序化记忆 + Skills Hub（`agentskills.io`），Agent 用得越多越聪明
  </Card>

  <Card title="MCP 集成" icon="plug">
    接入任意 MCP Server 扩展能力，含社区 Linux 桌面控制 MCP
  </Card>

  <Card title="定时任务" icon="clock">
    内置 cron 调度，自然语言指令即可创建"每天 9 点发我日报"
  </Card>

  <Card title="子 Agent" icon="users">
    可生成隔离的 subagent 并行处理任务，写 Python 脚本通过 RPC 调用
  </Card>
</CardGroup>

## 从 OpenClaw 迁移

如果你之前使用 OpenClaw，Hermes 内置了一键迁移工具：

```bash theme={null}
hermes claw migrate              # 交互式完整迁移
hermes claw migrate --dry-run    # 预览将迁移哪些内容
hermes claw migrate --preset user-data   # 仅迁移用户数据，不含密钥
hermes claw migrate --overwrite  # 覆盖冲突
```

将自动导入 `SOUL.md`、记忆 (`MEMORY.md` / `USER.md`)、用户技能、命令白名单、消息平台配置、API 密钥（Telegram / OpenRouter / OpenAI / Anthropic / ElevenLabs）、TTS 资源、工作目录指令等。

## 常见问题

<AccordionGroup>
  <Accordion title="Hermes Agent 和 OpenClaw、FastClaw 有什么区别？">
    * **Hermes Agent**：Python 实现、Nous Research 出品，主打**自学习闭环**——技能自我演化、跨会话记忆，研究友好（支持 trajectory 生成）
    * **OpenClaw**：Node.js 实现、面向本地隐私 + 多 IM 平台联动
    * **FastClaw**：Go 编写的单二进制运行时，主打多 Agent 管理 + Dashboard 形态

    三者均可通过 API易 接入全模型矩阵，按场景选用即可。
  </Accordion>

  <Accordion title="是否支持 API易 的全部模型？">
    支持。Hermes 同时支持 **OpenAI 兼容**和 **Anthropic 原生**两套协议：

    * OpenAI 协议端点：`https://api.apiyi.com/v1`，覆盖全模型矩阵
    * Anthropic 协议端点：`https://api.apiyi.com`（不带 `/v1`），覆盖 Claude 系列

    模型 ID 直接填 API易 文档里的模型名（如 `gpt-5.4`、`claude-sonnet-4-6`、`deepseek-v3.2`、`gemini-3.1-pro-preview` 等）。Claude 主力用户建议走 Anthropic 原生，可额外吃到 Hermes 的 1 小时跨会话缓存。
  </Accordion>

  <Accordion title="跨平台消息是怎么工作的？">
    Hermes 提供一个**单一 Gateway 进程**，统一管理 Telegram / Discord / Slack / WhatsApp / Signal 等平台的 Bot 连接。`hermes gateway setup` 引导你填入各平台 Token，`hermes gateway start` 启动后，所有平台的消息会被路由到同一个 Agent 实例，**跨平台会话连续**——你在 Telegram 上问的问题可以在 Discord 接着聊。

    支持语音留言转写，所有平台的 cron 投递也走同一通道。
  </Accordion>

  <Accordion title="可以跑在云端吗？">
    可以，而且 Hermes 强烈推荐云端部署。它提供 7 种终端后端：

    * **本地 / Docker / SSH / Singularity**：传统部署
    * **Modal / Daytona**：Serverless 持久化，空闲时休眠几乎不计费，按需唤醒
    * **Vercel Sandbox**：边缘运行时

    一个 5 美元 VPS 就能挂着 24/7 待命，从手机 Telegram 给云端 VM 派活完全可行。
  </Accordion>
</AccordionGroup>

## 相关资源

<CardGroup cols={2}>
  <Card title="项目仓库" icon="github">
    `github.com/NousResearch/hermes-agent`
  </Card>

  <Card title="官方文档" icon="book">
    `hermes-agent.nousresearch.com/docs/`
  </Card>

  <Card title="OpenClaw 对比方案" icon="bot" href="/scenarios/agent/openclaw/overview">
    本地隐私 + IM 联动场景的另一选择
  </Card>

  <Card title="FastClaw 对比方案" icon="bolt" href="/scenarios/agent/fastclaw">
    多 Agent 工厂 + Dashboard 形态的另一选择
  </Card>
</CardGroup>
