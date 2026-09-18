> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# FastClaw

> Go 编写的轻量级多 Agent 运行时，单二进制 + Dashboard，可通过 API易 接入任意主流大模型

## 概述

FastClaw 是一款基于 Go 编写的轻量级 AI Agent 运行时，定位为「Agent 工厂」——它负责创建、管理并运行多个 AI Agent，每个 Agent 拥有独立的人格（SOUL.md）、记忆、技能与工具集。FastClaw 自动处理 LLM 通信、工具执行、沙箱隔离和会话管理，开箱即用 Web Dashboard，单二进制部署。

通过对接 API易，您可以获得：

<CardGroup cols={2}>
  <Card title="🚀 单二进制部署" icon="rocket">
    一条命令安装，自带 SQLite，本地或云端均可
  </Card>

  <Card title="🤖 多 Agent 管理" icon="users">
    每个 Agent 独立的人格、模型、技能与会话
  </Card>

  <Card title="📱 IM 多通道" icon="message-circle">
    内置 Telegram / Discord / Slack 渠道绑定
  </Card>

  <Card title="🛡️ 沙箱隔离" icon="shield">
    支持 Docker / E2B 沙箱，工具调用安全可控
  </Card>
</CardGroup>

<Info>
  **项目信息**：FastClaw 采用 FastClaw Community License（基于 Apache 2.0 + 附加条款）的源代码可见许可证，项目地址 `github.com/fastclaw-ai/fastclaw`。
</Info>

## 安装与启动

FastClaw 通过官方安装脚本一键安装到 `~/.local/bin`：

```bash theme={null}
curl -fsSL https://raw.githubusercontent.com/fastclaw-ai/fastclaw/main/install.sh | bash
```

首次启动会进入设置向导，配置完 LLM Provider 后自动创建默认 Agent：

```bash theme={null}
fastclaw                    # 前台运行，Ctrl+C 停止
fastclaw daemon start       # 后台运行（日志 ~/.fastclaw/daemon.log）
fastclaw daemon install     # 注册为 launchd / systemd 服务
```

启动后访问 Dashboard：`http://localhost:18953`（默认端口 `18953`）。

## 接入 API易（推荐配置）

API易兼容 OpenAI 和 Anthropic 两套 API 协议，FastClaw 可通过 **OpenAI 兼容 Provider** 或 **Anthropic 兼容 Provider** 接入，二者均可使用同一把 API易 密钥访问全模型矩阵。

### 方式一：通过 Dashboard 配置（推荐）

1. 打开 `http://localhost:18953`，使用首次启动时生成的 admin 账号登录
2. 进入 **Models / Providers**，新增一条 Provider 配置：

| 字段          | 推荐值                                                                             |
| ----------- | ------------------------------------------------------------------------------- |
| Provider 类型 | `OpenAI` 兼容                                                                     |
| Base URL    | `https://api.apiyi.com/v1`                                                      |
| API Key     | 你的 API易 密钥（`sk-...`）                                                            |
| 模型列表        | 按需添加，如 `gpt-5.4`、`claude-sonnet-4-6`、`deepseek-v3.2`、`gemini-3.1-pro-preview` 等 |

3. 进入对应 Agent 的 **Models** 面板，设为默认模型即可

### 方式二：通过 CLI 配置

```bash theme={null}
# 1. 创建一个新 Agent，初始绑定 API易（OpenAI 兼容）
fastclaw agents init alpha \
  --provider openai \
  --model openai/gpt-5.4 \
  --api-key-env APIYI_API_KEY

# 2. 将 OpenAI provider 的 Base URL 指向 API易
fastclaw agents config alpha set provider.openai.apiBase https://api.apiyi.com/v1
fastclaw agents config alpha set provider.openai.apiKeyEnv APIYI_API_KEY

# 3. 添加你想用的模型（追加，幂等）
fastclaw agents config alpha set provider.openai.model gpt-5.4
fastclaw agents config alpha set provider.openai.model claude-sonnet-4-6
fastclaw agents config alpha set provider.openai.model deepseek-v3.2
```

环境变量 `APIYI_API_KEY` 需先在 Shell 中导出（`export APIYI_API_KEY=sk-...`），FastClaw 不会把密钥明文写入数据库。

<Tip>
  **为什么选 API易？**

  * **一把密钥多家模型**：OpenAI / Anthropic / Google / DeepSeek / 智谱等全模型矩阵，无需逐个 Provider 申请
  * **价格优势**：相对官方价格通常有 5%-20% 优惠，部分模型支持充值加赠
  * **国内直连**：免代理直接访问海外大模型
  * **OpenAI / Anthropic 双协议兼容**：FastClaw 的两类 Provider 都能用
</Tip>

### 方式三：Anthropic 原生协议（适合主用 Claude）

如果你主用 Claude 系列模型，可将 Anthropic Provider 指向 API易：

| 字段          | 推荐值                                     |
| ----------- | --------------------------------------- |
| Provider 类型 | `Anthropic`                             |
| Base URL    | `https://api.apiyi.com`                 |
| API Key     | 你的 API易 密钥                              |
| 模型列表        | `claude-sonnet-4-6`、`claude-opus-4-7` 等 |

CLI 等价写法：

```bash theme={null}
fastclaw agents config alpha set provider.anthropic.apiBase https://api.apiyi.com
fastclaw agents config alpha set provider.anthropic.apiKeyEnv APIYI_API_KEY
fastclaw agents config alpha set provider.anthropic.model claude-sonnet-4-6
fastclaw agents config alpha set model claude-sonnet-4-6
```

## 常用功能速查

<CardGroup cols={2}>
  <Card title="Agent 管理" icon="bot">
    Dashboard → Agents：创建/编辑 Agent，定义 SOUL.md（人格）、IDENTITY.md（身份）、MEMORY.md（长期记忆）
  </Card>

  <Card title="技能（Skills）" icon="puzzle">
    内置 code-runner、image-gen、data-analysis、web-search、skill-creator 等，可从 ClawHub / GitHub 安装
  </Card>

  <Card title="IM 渠道绑定" icon="message-circle">
    Agent → Channels：填入 Telegram / Discord / Slack 的 Bot Token，保存前会自动校验
  </Card>

  <Card title="OpenAI 兼容 API" icon="code">
    `/v1/chat/completions` 流式接口可被任意 OpenAI SDK 直接调用
  </Card>

  <Card title="沙箱执行" icon="shield">
    Settings → Runtime 切换 Docker / E2B 沙箱，工具调用后自动同步产物
  </Card>

  <Card title="定时任务" icon="clock">
    Agent → Scheduler：让 Agent 通过 `create_cron_job` 创建定时提醒
  </Card>
</CardGroup>

## 部署模式

| 模式             | 适用场景  | 关键配置                                       |
| -------------- | ----- | ------------------------------------------ |
| **本地**         | 个人使用  | `fastclaw daemon start`，SQLite 默认存储        |
| **Docker**     | 单机服务化 | `cd deploy/docker && ./start.sh`           |
| **Kubernetes** | 多副本生产 | `FASTCLAW_STORAGE_TYPE=postgres` + S3 对象存储 |

多副本部署需要：

* `FASTCLAW_STORAGE_TYPE=postgres`、`FASTCLAW_STORAGE_DSN=postgres://...`
* `FASTCLAW_OBJECT_STORE_*` 一组 S3 兼容对象存储变量（用于跨 Pod 同步 Skills 和工作目录）
* `FASTCLAW_BIND=all`（监听 `0.0.0.0`）

完整 K8s 清单见仓库 `deploy/k8s/` 目录。

## 常见问题

<AccordionGroup>
  <Accordion title="FastClaw 和 OpenClaw 有什么区别？">
    * **FastClaw**：Go 编写、单二进制、面向「Agent 工厂」场景，强调多 Agent 管理、IM 渠道接入、沙箱隔离，适合需要把 Agent 作为服务交付的团队
    * **OpenClaw**：Node.js 实现、面向个人本地助手，强调本地隐私 + 多 IM 平台联动
    * 两者都可以通过 API易 接入全模型矩阵，按部署形态选用即可
  </Accordion>

  <Accordion title="是否支持 API易 的全部模型？">
    支持。API易 提供 OpenAI 兼容协议（`https://api.apiyi.com/v1`）和 Anthropic 兼容协议（`https://api.apiyi.com`），FastClaw 的两类 Provider 均可对接，模型 ID 直接填 API易 文档里的模型名即可（如 `gpt-5.4`、`claude-sonnet-4-6`、`deepseek-v3.2`、`gemini-3.1-pro-preview` 等）。
  </Accordion>

  <Accordion title="如何让 Agent 通过 Telegram / Discord 对外服务？">
    1. 在对应平台创建 Bot 并拿到 Token
    2. Dashboard → 选中 Agent → Channels → 填入 Token 保存（系统会自动校验 `getMe` / `auth.test`）
    3. 在 IM 平台搜索你的 Bot 直接对话即可，每个 chatID 的会话相互隔离
  </Accordion>

  <Accordion title="许可证可以用于商业项目吗？">
    可以。FastClaw 社区许可证允许：

    * ✅ 作为后端嵌入到你自己的产品中商用
    * ✅ 组织内部部署使用

    不允许（未购买商业许可证时）：

    * ❌ 作为多租户 SaaS 直接对外托管 FastClaw 自身
    * ❌ 去除/修改 Dashboard 中的 FastClaw 品牌

    商业授权咨询：`support@thinkany.ai`
  </Accordion>
</AccordionGroup>

## 相关资源

<CardGroup cols={2}>
  <Card title="项目仓库" icon="github">
    `github.com/fastclaw-ai/fastclaw`
  </Card>

  <Card title="API易 API 文档" icon="book" href="/getting-started">
    获取密钥与 Base URL 配置参考
  </Card>

  <Card title="OpenClaw 对比方案" icon="bot" href="/scenarios/agent/openclaw/overview">
    个人本地助手场景的另一选择
  </Card>

  <Card title="充值与定价" icon="coins" href="/faq/recharge-promotions">
    了解 API易 定价与首充优惠
  </Card>
</CardGroup>
