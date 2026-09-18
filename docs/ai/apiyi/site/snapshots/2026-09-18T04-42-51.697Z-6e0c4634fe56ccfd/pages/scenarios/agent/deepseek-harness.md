> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek Harness

> DeepSeek AI 开源的插件化 AI Agent Harness，支持 Web UI、headless CLI 与 Python SDK，可通过 API易 接入兼容模型

## 概述

DeepSeek Harness（`dsh`）是 DeepSeek AI 开源的 AI Agent Harness（智能体运行框架）。它采用「一切皆插件」的架构，将模型、工具、文件系统、终端、会话和工作流组合成可扩展的智能体运行环境。

通过 API易 接入后，您可以在本地运行 DeepSeek Harness，并使用 API易 的 OpenAI 兼容接口配置模型、执行代码任务和维护持久化会话。

<CardGroup cols={2}>
  <Card title="🧩 插件化架构" icon="puzzle">
    模型、工具、会话和工作流都可以通过插件组合，便于按需扩展 Agent 能力。
  </Card>

  <Card title="🌐 Web UI" icon="globe">
    一条命令启动本地 Web UI，在浏览器中配置模型、工作区和会话。
  </Card>

  <Card title="⌨️ Headless CLI" icon="terminal">
    通过命令行提交一次性任务，适合自动化脚本、批处理和开发流程。
  </Card>

  <Card title="💾 会话持久化" icon="database">
    会话、工具调用和工作区状态可以持久化，便于继续任务和排查问题。
  </Card>
</CardGroup>

<Info>
  **项目信息**：DeepSeek Harness 采用 MIT 许可证开源，项目地址 `github.com/deepseek-ai/deepseek-harness`。当前版本处于 Developer Preview 阶段，未来可能出现破坏性兼容变更。
</Info>

## 安装与启动

### 通过 npm 启动 Web UI

安装 Node.js 后，在终端运行：

```bash theme={null}
npx @deepseek-ai/dsh web
```

启动完成后，访问 `http://127.0.0.1:3080`。首次使用时，可以在 Web UI 的模型设置中配置 API易。

### 从源码运行

如果需要使用仓库源码或参与开发，可以执行：

```bash theme={null}
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
pnpm install
pnpm run build
pnpm dsh web
```

### 使用 headless CLI

从源码构建完成后，可以直接提交一次性任务：

```bash theme={null}
pnpm dsh --profile headless "Inspect the repository and explain the failing tests."
```

## 接入 API易

DeepSeek Harness 支持原生 DeepSeek 路由和基于 `llm-pi-ai` 的多提供方路由。当前配置使用 `apiyi` 提供方、`openai-responses` 协议和 `https://api.apiyi.com/v1` 端点，默认模型为 `deepseek-v4-pro-0813`。

你的配置文件位于 `$DSH_HOME/settings.yaml`。在未设置 `DSH_HOME` 时，Windows 默认位置通常是 `C:\Users\Administrator\.dsh\settings.yaml`。

### 方式一：通过 Web UI 配置（推荐）

<Steps>
  <Step title="准备 API易 Token">
    在 API易 控制台创建 Token。请勿将真实 Token 写入项目文件、命令历史或公开日志。
  </Step>

  <Step title="打开模型设置">
    启动 Web UI 后，进入**设置 → 模型**，选择**添加自定义提供方**。
  </Step>

  <Step title="填写提供方信息">
    使用下面的配置作为起点：

    | 字段          | 推荐值                        |
    | ----------- | -------------------------- |
    | Provider ID | `apiyi`                    |
    | 显示名称        | `apiyi`                    |
    | 基础 URL      | `https://api.apiyi.com/v1` |
    | API 协议      | `openai-responses`         |
    | 凭据引用        | `APIYI_API_KEY`            |
    | 模型          | `deepseek-v4-pro-0813`     |

    你的当前配置将 `deepseek-v4-pro-0813` 设为默认模型。配置文件中还维护了其他 API易 模型，切换模型时请使用 API易 当前可用的模型 ID。
  </Step>

  <Step title="保存并选择模型">
    保存提供方后，在模型选择器中选择刚刚添加的模型，并新建一个会话测试请求。
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/UCR13itF_84Ifj9v/images/deepseek-harness-model-config.png?fit=max&auto=format&n=UCR13itF_84Ifj9v&q=85&s=283844b8bb9f276b3236661422af5be3" alt="DeepSeek Harness API易自定义提供方配置页面" width="655" height="526" data-path="images/deepseek-harness-model-config.png" />

<Tip>
  API Key 通过 Web UI 保存后会写入 DeepSeek Harness 的本地凭据存储，页面只显示脱敏描述，不会回显完整 Token。配置变化会在下一次请求时生效，通常不需要重启 Web UI。
</Tip>

### 方式二：使用 settings.yaml 配置

如果需要通过文件管理配置，可以在 `$DSH_HOME/settings.yaml` 中声明一个 API易 提供方，并通过环境变量引用 Token：

```yaml theme={null}
llm-pi-ai:
  providers:
    apiyi:
      displayName: apiyi
      apiKeyEnv: APIYI_API_KEY
      api: openai-responses
      baseURL: https://api.apiyi.com/v1
      models:
        - id: deepseek-v4-pro-0813
```

macOS 或 Linux：

```bash theme={null}
export APIYI_API_KEY=YOUR_API_KEY
```

Windows PowerShell：

```powershell theme={null}
$env:APIYI_API_KEY = "YOUR_API_KEY"
```

`apiKeyEnv` 只是凭据引用名称，真实 Token 不应直接写入 `settings.yaml`。如果新增模型，直接把模型 ID 添加到 `models` 列表即可。

## 常见使用方式

### 本地 Web Agent

适合在浏览器中逐步完成代码分析、文件整理、测试排查和项目维护任务。启动 Web UI 后，为会话选择工作区，再用自然语言描述目标和约束。

<img src="https://mintcdn.com/apiyillc/UCR13itF_84Ifj9v/images/deepseek-harness-model-chat.png?fit=max&auto=format&n=UCR13itF_84Ifj9v&q=85&s=8e9ed8c8428b7a3fd8618db5c6ec5bbb" alt="DeepSeek Harness 本地 Web Agent 对话界面" width="934" height="758" data-path="images/deepseek-harness-model-chat.png" />

### 自动化任务

headless profile 会运行一个独立任务并输出最终回复，适合接入脚本或本地自动化流程：

```bash theme={null}
pnpm dsh --profile headless "Review the changed files and summarize possible regressions."
```

### Python SDK

DeepSeek Harness 提供 `deepseek-harness-sdk`，可在 Python 程序中启动运行时并调用 Agent。需要注意：Python SDK 的内置运行时默认使用 `deepseek-official`，不会自动继承当前 Web/headless 配置中的 `apiyi` 路由。

```bash theme={null}
python -m pip install deepseek-harness-sdk
```

```python theme={null}
from deepseek_harness import DeepSeekHarness

with DeepSeekHarness(
    provider="apiyi",
    model="deepseek-v4-pro-0813",
    cwd="/absolute/path/to/workspace",
    session_root="/absolute/path/to/sessions",
    cordis="/absolute/path/to/apiyi.cordis.yml",
) as harness:
    result = harness.run(
        "Inspect the repository and summarize the failing tests.",
        session_id="example-001",
    )

print(result.final_response)
```

要使用上面的 `apiyi` 配置，自定义的 Cordis 组合需要挂载 `@deepseek-ai/dsh-llm-pi-ai`，并通过 `settings.yaml` 或组合配置提供 `apiKeyEnv: APIYI_API_KEY`、`api: openai-responses` 和 API易模型列表。

Python SDK 文档列出的内置持久终端组合面向 Linux x64、Linux arm64 和 macOS 14 或更高版本的 arm64；该组合不支持 Windows Agent。Windows 用户建议优先使用 Web UI 或 CLI。

## 模型选择

API易 模型会持续更新，建议在使用前查看最新模型列表、能力说明和使用建议：

<Card title="查看最新模型推荐" icon="star" href="/api-capabilities/model-info">
  查看最新的模型推荐、能力对比和使用建议。模型 ID 以该页面及 API易 控制台当前可用值为准。
</Card>

## 使用建议

* 为不同任务使用独立的 session ID；只有需要延续同一段会话和持久 Shell 状态时，才复用原有 ID。
* Python SDK 示例使用可修改工作区和 `danger-full-access` 组合，建议在可丢弃的 checkout 或容器中运行。
* 不要把 API Key 写入 `cordis.yml`、`settings.yaml`、源代码或提交日志，优先使用 Web UI 凭据存储或环境变量引用。
* DeepSeek Harness 处于 Developer Preview 阶段，升级前请确认插件配置和模型路由是否仍兼容。

## 常见问题

<AccordionGroup>
  <Accordion title="当前配置使用哪个 Provider 和模型？">
    当前配置使用 `apiyi` Provider，协议为 `openai-responses`，Base URL 为 `https://api.apiyi.com/v1`，默认模型为 `deepseek-v4-pro-0813`。
  </Accordion>

  <Accordion title="API易 的 Base URL 和协议应该怎么填写？">
    按当前配置填写 Base URL `https://api.apiyi.com/v1`，协议填写 `openai-responses`。不要在未确认兼容性的情况下把协议改成其他类型。
  </Accordion>

  <Accordion title="为什么模型选择器中看不到刚添加的模型？">
    检查 Provider ID 是否为小写非空值、模型 ID 是否正确，并确认保存的是 `llm-pi-ai` 提供方配置。当前默认模型是 `deepseek-v4-pro-0813`；未加入 `models` 列表的自定义模型不会被选择器使用。
  </Accordion>

  <Accordion title="出现 MISSING_CREDENTIAL 怎么处理？">
    如果使用 Web UI，请回到**设置 → 模型**为该提供方保存凭据。如果使用 `settings.yaml`，请确认 `APIYI_API_KEY` 已设置，并确认 `apiKeyEnv` 指向该环境变量。
  </Accordion>

  <Accordion title="模型发现接口返回 401 怎么办？">
    先检查 API易 Token 和 Base URL。DeepSeek Harness 对 OpenAI 兼容自定义提供方的模型发现会请求 `GET /models`；如果端点不提供该接口，可以手动填写模型 ID。
  </Accordion>

  <Accordion title="Python SDK 可以在 Windows 上运行吗？">
    Python SDK 的内置持久终端组合不支持 Windows Agent。Windows 用户可以使用 Web UI 或 CLI；如果要使用 Python SDK，请按照项目文档确认运行环境和平台要求。
  </Accordion>

  <Accordion title="升级后配置失效怎么办？">
    项目目前处于 Developer Preview 阶段，升级可能包含破坏性变更。请检查提供方配置、模型 ID 和插件组合，并参考项目仓库中的最新文档。
  </Accordion>
</AccordionGroup>

## 相关资源

<CardGroup cols={2}>
  <Card title="API易 快速开始" icon="book" href="/getting-started">
    获取 API Key、了解 Base URL 和基本调用方式。
  </Card>

  <Card title="API易 模型推荐" icon="star" href="/api-capabilities/model-info">
    查看最新模型、能力说明和使用建议。
  </Card>

  <Card title="DeepSeek Harness 项目仓库" icon="github">
    `github.com/deepseek-ai/deepseek-harness`
  </Card>

  <Card title="DeepSeek Harness Web 配置" icon="settings">
    在项目文档中查看 Provider、凭据和模型配置说明。
  </Card>
</CardGroup>

## 获取帮助

<CardGroup cols={2}>
  <Card title="企业微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企业微信客服二维码" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    扫码添加 或 [点击联系客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    API易 配置、DeepSeek Harness 接入和使用指导
  </Card>

  <Card title="邮件咨询" icon="mail">
    **客服邮箱**：[support@apiyi.com](mailto:support@apiyi.com)

    **商务合作**：[business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>

<Tip>
  联系客服时，请尽量提供 Provider、模型 ID、Base URL、API 协议、错误信息、Node.js 版本、使用方式和相关截图，以便快速定位问题。
</Tip>
