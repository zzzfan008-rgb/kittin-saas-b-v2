> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Code

> Claude 官方命令行编程助手，使用 API易 配置实现稳定高效的 AI 编程体验

<Warning>
  **先说成本**：写代码这类长上下文任务、以及 Agent 需要深度探索的场景，**API 按量计费的消耗相当大，综合性价比通常不如官网订阅会员**。

  Coding Agent 每一轮都要反复读入项目上下文、翻工具结果、来回改，一次像样的任务动辄几十万 token。真实发生过的情况是：**充 \$5 还没跑完一次深度调研，额度就见底了**——这不是异常，是这类场景的正常消耗量级。

  * **用量大、且有条件直连官网**：建议直接买 Claude Pro / Max 官方订阅，固定月费在高频重度场景下更划算。
  * **受制于网络环境，或就是想用多少付多少**：那 API 更适合你——免代理直连、无固定月费、无需自行维护官方账号，还能一把 Key 调 400+ 模型。

  两种方式没有绝对优劣，按自己的用量和网络条件选即可。这里如实告知，避免充值后产生预期落差。
</Warning>

## 概述

Claude Code 是 Anthropic 官方推出的命令行编程助手，可以在终端中直接使用 Claude 的强大编程能力。通过配置 API易 服务，您可以获得：

<CardGroup cols={2}>
  <Card title="🚀 稳定直连" icon="wifi">
    免代理直连，无封号风险，告别网络不稳定
  </Card>

  <Card title="💳 按量计费" icon="wallet">
    无固定订阅，用多少付多少，灵活可控
  </Card>

  <Card title="⚡ 缓存命中率高" icon="bolt">
    编程场景反复读取上下文，高缓存命中显著降本
  </Card>

  <Card title="🛡️ 质量可靠" icon="shield-half">
    纯官转 AWS Claude + 官方直连 KEY 双通道
  </Card>
</CardGroup>

<Info>
  **按量计费 vs Claude Max 官方订阅，怎么选？**

  * **Claude Max（官方订阅）**：固定月费封顶，**纯写代码且消耗量极大的重度用户更划算**；前提是能满足官方网络要求，并自行承担账号维护与封禁风险。
  * **API易 Claude 方案**：按量计费、无封号顾虑，纯官转 AWS Claude 与官方直连 KEY 双通道保障质量，充值加赠可摊薄实付成本。用过的客户口碑良好，持续复充。同时为企业客户解决直连访问与税务合规（开票）问题。
  * **API 场景更灵活**：除 Coding 外还可调用 400+ 模型，选择远多于单一 coding plan。
</Info>

## 分组介绍

在 Claude Code 中使用 API易 时，**创建令牌请务必选择 `ClaudeCode` 分组**（在控制台创建令牌时的"分组"选项中选择）。该分组把所有兼容 Anthropic 原生 `/v1/messages` 调用格式的模型聚合到一个通道，是 Claude Code 场景的专属通道。

<Tip>
  **ClaudeCode 分组默认享 95 折（5% off）**，无需任何操作；且可叠加充值活动加赠 10%–20%，叠加后实际成本比官方直连便宜约两成。
</Tip>

<Note>
  **这个分组用在哪里？**

  * **Claude Code 环境内**：本分组更适配 Claude Code，**部分国产模型要在 Claude Code 里调用，必须使用 ClaudeCode 分组的令牌**（用其它分组会失败）。
  * **非 Claude Code 环境**：ClaudeCode 分组的令牌**同样可以正常使用**，不限制只能在 Claude Code 里调用。此时它纯粹是一项优惠——默认 95 折（0.95x），并可叠加充值活动加赠 10%–20%。
</Note>

### 支持在 Claude Code 中使用的国产模型

除 Claude 全系列外，`ClaudeCode` 分组还包含一批已兼容 Anthropic 原生 `/v1/messages` 格式的国产编程模型。在 Claude Code 里把模型名换成下表中的模型 ID 即可直接使用——**同样必须使用 ClaudeCode 分组的令牌**（创建令牌时选择该分组），否则调用会失败。

| 模型 ID                    | 厂商       | 提示 / 1M tokens | 补全 / 1M tokens |
| ------------------------ | -------- | -------------- | -------------- |
| `deepseek-v4-flash`      | DeepSeek | \$0.133        | \$0.266        |
| `deepseek-v4-pro`        | DeepSeek | \$0.408        | \$0.817        |
| `glm-4.7`                | 智谱       | \$0.570        | \$2.052        |
| `glm-5`                  | 智谱       | \$0.532        | \$2.394        |
| `glm-5.1`                | 智谱       | \$0.798        | \$3.192        |
| `kimi-k2.5`              | Moonshot | \$0.570        | \$2.992        |
| `kimi-k2.6`              | Moonshot | \$0.570        | \$2.280        |
| `MiniMax-M2.7`           | MiniMax  | \$0.285        | \$1.140        |
| `MiniMax-M2.7-highspeed` | MiniMax  | \$0.570        | \$2.280        |
| `MiniMax-M3`             | MiniMax  | \$0.285        | \$1.140        |
| `qwen3.6-plus`           | 阿里巴巴     | \$0.285        | \$1.710        |
| `qwen3.7-max`            | 阿里巴巴     | \$1.628        | \$4.885        |

<Info>
  以上均为按量计费，表内为基础价格；使用 ClaudeCode 分组令牌时在此基础上自动再享 95 折。模型列表持续更新，最新价格以控制台模型广场为准。
</Info>

<Card title="了解令牌分组机制" icon="layers" href="/faq/groups-explained">
  为什么会有 ClaudeCode 分组？分组与折扣如何工作？查看分组机制完整说明。
</Card>

## 快速开始

<Note>
  **简化配置提示**：如果您不想注册 Claude 官网账号，建议直接查看下方的[高级配置](#高级配置)部分，使用 `~/.claude.json` 文件配置，可以完全绕过官网验证。
</Note>

### 1. 安装 Claude Code

在终端运行以下命令全局安装：

```bash theme={null}
npm install -g @anthropic-ai/claude-code
```

<Info>
  需要 Node.js 18 或更高版本。如未安装，请先访问 [nodejs.org](https://nodejs.org) 下载安装。
</Info>

### 2. 配置 API 密钥

#### 获取 API 密钥

请参考 [API密钥获取与管理教程](/faq/token-management) 获取您的 API易 密钥。

#### 设置环境变量

在系统环境变量中添加 API易 配置。

<Tabs>
  <Tab title="macOS/Linux">
    编辑 `~/.zshrc` 或 `~/.bashrc` 文件：

    ```bash theme={null}
    # API易 配置
    export ANTHROPIC_AUTH_TOKEN="sk-***"
    export ANTHROPIC_BASE_URL="https://api.apiyi.com"
    ```

    <Tip>
      **Mac 用户提示**：在用户目录按 `⌘ + ⇧ + .` 显示隐藏文件，使用文本编辑器打开 `.zshrc` 文件。
    </Tip>
  </Tab>

  <Tab title="Windows">
    使用 PowerShell 编辑配置：

    ```powershell theme={null}
    # 编辑配置文件
    notepad $PROFILE

    # 添加以下内容
    $env:ANTHROPIC_AUTH_TOKEN = "sk-***"
    $env:ANTHROPIC_BASE_URL = "https://api.apiyi.com"
    ```
  </Tab>
</Tabs>

### 3. 使配置生效

<Tabs>
  <Tab title="macOS/Linux">
    ```bash theme={null}
    source ~/.zshrc
    # 或
    source ~/.bashrc
    ```
  </Tab>

  <Tab title="Windows">
    重启 PowerShell 或运行：

    ```powershell theme={null}
    . $PROFILE
    ```
  </Tab>
</Tabs>

### 4. 启动 Claude Code

进入你的项目目录并启动：

```bash theme={null}
# 进入项目目录
cd ~/Desktop/my-project

# 启动 Claude Code
claude
```

## 高级配置

### 配置文件（推荐）

需要配置两个文件，配合使用即可绕过 Claude 官网验证：

**第一步**：在用户主目录创建 `~/.claude.json`，绕过官网验证：

```json theme={null}
{
  "hasCompletedOnboarding": true
}
```

**第二步**：在 `~/.claude/settings.json` 中配置 API易 服务：

```json theme={null}
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-你的API易密钥",
    "ANTHROPIC_BASE_URL": "https://api.apiyi.com"
  }
}
```

<Tip>
  **重要提示**：`hasCompletedOnboarding: true` 可以完全绕过 Claude 官网账号验证，直接使用 API易 服务。这样您无需：

  * 注册 Claude 官网账号（注册困难，需要海外手机号）
  * 担心 Claude 官网账号被封
  * 进行任何额外的授权步骤
</Tip>

<Warning>
  **安全提醒**：配置文件包含 API 密钥等敏感信息，请勿分享给他人。
</Warning>

### 全局授权（不推荐）

如果没有配置 `hasCompletedOnboarding: true`，首次使用时会弹出授权页面：

1. 需要跳转到 Claude 官网进行确认
2. 需要有 Claude 官网账号（注册困难且容易被封）
3. 授权成功后返回终端继续

<Info>
  **建议**：强烈推荐使用上述配置文件方法，避免 Claude 官网账号的各种限制。
</Info>

## 使用指南

### 基本命令

启动后，Claude Code 会显示当前配置信息：

```bash theme={null}
claude
# 显示 API Key 和 API Base URL
# 确认配置无误后选择 Yes 继续
```

### 工作流程

1. **启动助手**：在项目目录运行 `claude`
2. **描述需求**：输入你的编程需求或问题
3. **交互对话**：Claude 会理解上下文并提供代码建议
4. **应用更改**：确认后 Claude 可以直接修改文件

### 支持的功能

* ✅ 代码生成和优化
* ✅ Bug 修复和调试
* ✅ 代码重构建议
* ✅ 文档编写
* ✅ 测试用例生成
* ✅ 技术问题解答

## 模型选择

Claude Code 默认使用最新的 Claude 模型。通过 API易，推荐使用以下 4 个最新模型：

| 模型                    | 模型 ID                       | 特点            | 推荐场景            |
| --------------------- | --------------------------- | ------------- | --------------- |
| **Claude Opus 4.8**   | `claude-opus-4-8`           | 当前最强旗舰，编程能力顶级 | 复杂项目、架构设计、疑难调试  |
| **Claude Opus 4.7**   | `claude-opus-4-7`           | 上一代旗舰，性能稳定    | 高要求编程任务         |
| **Claude Sonnet 4.6** | `claude-sonnet-4-6`         | 性能与速度均衡，性价比高  | 日常编程、代码生成（推荐默认） |
| **Claude Haiku 4.5**  | `claude-haiku-4-5-20251001` | 轻量快速，响应迅速     | 简单任务、快速补全、低成本场景 |

<Card title="查看更多编程模型推荐" icon="star" href="/api-capabilities/model-info">
  除了 Claude 系列，API易 还支持 400+ 主流 AI 模型。查看完整的编程模型推荐、性能对比和场景化使用建议。
</Card>

## 故障排除

### 常见问题

<AccordionGroup>
  <Accordion title="Unable to Connect to Anthropic Services">
    这通常是网络配置问题。请检查：

    1. 环境变量是否正确设置
    2. API 密钥是否有效
    3. 网络连接是否正常

    运行以下命令验证配置：

    ```bash theme={null}
    echo $ANTHROPIC_AUTH_TOKEN
    echo $ANTHROPIC_BASE_URL
    ```
  </Accordion>

  <Accordion title="提示需要 Claude 官网账号授权">
    这是因为没有配置 `hasCompletedOnboarding`。在 `~/.claude.json` 中添加 `{"hasCompletedOnboarding": true}`，并在 `~/.claude/settings.json` 中配置 API易 环境变量，即可绕过官网验证。详见上方[高级配置](#高级配置)。
  </Accordion>

  <Accordion title="API Key 无效">
    确保使用的是 API易 的密钥，而不是 Claude 官网的密钥。参考 [API密钥获取与管理教程](/faq/token-management) 获取密钥。
  </Accordion>

  <Accordion title="如何更新 Claude Code">
    运行以下命令更新到最新版本：

    ```bash theme={null}
    npm update -g @anthropic-ai/claude-code
    ```
  </Accordion>

  <Accordion title="支持哪些编程语言">
    Claude Code 支持所有主流编程语言，包括但不限于：

    * Python, JavaScript/TypeScript, Java, C++, C#
    * Go, Rust, Swift, Kotlin
    * HTML/CSS, SQL, Shell Scripts
    * 以及更多...
  </Accordion>
</AccordionGroup>

## 最佳实践

### 有效的提示词

```markdown theme={null}
好的提示：
"帮我重构这个 Python 函数，使其更高效并添加类型注解"
"这段代码有内存泄漏，请帮我找出并修复"
"为这个 React 组件编写单元测试"

避免过于宽泛：
"改进我的代码"  # 太模糊
```

### 项目结构建议

* 保持代码库整洁有序
* 使用清晰的文件命名
* 添加适当的注释
* 提供项目 README

## 性能优化

### 提升响应速度

1. **使用 `~/.claude.json` 配置**：配置后可避免每次验证，特别是设置 `hasCompletedOnboarding: true` 后启动更快
2. **保持对话连贯**：在同一会话中处理相关任务
3. **明确需求**：清晰描述可减少往返交互

### 成本控制

* Claude Code 按 Token 使用量计费
* 通过 API易 可享受优惠价格
* 查看 [定价页面](/pricing) 了解详情

## 相关资源

<CardGroup cols={2}>
  <Card title="官方文档" icon="book" href="https://docs.apiyi.com/faq/token-management">
    API密钥获取与管理
  </Card>

  <Card title="Claude Code 官方文档" icon="terminal">
    官方文档地址：`code.claude.com/docs`
  </Card>

  <Card title="模型介绍" icon="bot" href="/api-capabilities/model-info">
    了解 Claude 系列模型
  </Card>

  <Card title="其他编程工具" icon="code" href="/scenarios/programming/cursor">
    探索 Cursor 等工具
  </Card>
</CardGroup>

## 总结

Claude Code 结合 API易 服务，为开发者提供了一个稳定、灵活的 AI 编程助手方案：免代理直连、按量计费、无固定月费，在网络受限或用量不稳定时尤其合适。**如果你是重度高频用户且有条件直连官网，请结合本页开头的成本提示再做选择。**

<Info>
  **提示**：如需了解更多编程场景的 AI 工具，可以查看 [OpenAI Codex CLI](/scenarios/programming/codex-cli) 等其他选项。
</Info>
