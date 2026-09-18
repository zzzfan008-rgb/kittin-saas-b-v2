> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenCode

> 开源 AI 编码代理，支持终端/IDE/桌面多平台，通过 API易 配置获得稳定高效的编程体验

## 概述

OpenCode 是一款完全开源的 AI 编码代理，基于 TypeScript 和 AI SDK 构建，提供终端 TUI、IDE 集成和桌面应用多种使用方式。项目在 GitHub 拥有 94.9k+ Star，社区活跃。

通过配置 API易 服务，您可以获得：

<CardGroup cols={2}>
  <Card title="🖥️ 多平台支持" icon="monitor">
    终端 TUI、VS Code 扩展、桌面应用一应俱全
  </Card>

  <Card title="🔌 75+ 模型支持" icon="plug">
    通过 Models.dev 支持 75+ LLM 提供商
  </Card>

  <Card title="🛠️ 内置 LSP" icon="code">
    语言服务器协议支持，智能代码理解
  </Card>

  <Card title="🔄 多会话并行" icon="layers">
    支持多会话并行处理和会话共享
  </Card>
</CardGroup>

<Info>
  **项目信息**：OpenCode 是活跃维护的开源项目，官网 `opencode.ai`，项目地址 `github.com/anomalyco/opencode`。
</Info>

## 环境准备

### 安装 OpenCode

<Tabs>
  <Tab title="快速安装（推荐）">
    ```bash theme={null}
    curl -fsSL https://opencode.ai/install | bash
    ```
  </Tab>

  <Tab title="npm">
    ```bash theme={null}
    npm i -g opencode-ai@latest
    ```
  </Tab>

  <Tab title="Homebrew (macOS/Linux)">
    ```bash theme={null}
    brew install anomalyco/tap/opencode
    ```
  </Tab>

  <Tab title="Windows">
    Scoop:

    ```bash theme={null}
    scoop install opencode
    ```

    Chocolatey:

    ```bash theme={null}
    choco install opencode
    ```
  </Tab>

  <Tab title="Arch Linux">
    ```bash theme={null}
    paru -S opencode-bin
    ```
  </Tab>

  <Tab title="桌面应用">
    从官网 `opencode.ai` 下载对应系统的桌面应用：

    * macOS (Apple Silicon / Intel)
    * Windows
    * Linux (AppImage / deb)
  </Tab>
</Tabs>

验证安装：

```bash theme={null}
opencode --version
```

## 快速配置

OpenCode 使用 JSON 配置文件，支持多种配置位置（按优先级从低到高）：

1. 远程配置（`.well-known/opencode`）
2. 全局配置：`~/.config/opencode/opencode.json`
3. 自定义配置：`OPENCODE_CONFIG` 环境变量指定的路径
4. 项目配置：项目根目录 `opencode.json`
5. `.opencode` 目录配置
6. 内联配置：`OPENCODE_CONFIG_CONTENT` 环境变量

### 方法一：自定义 Provider（推荐）

创建或编辑配置文件 `~/.config/opencode/opencode.json`：

```json theme={null}
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "apiyi": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "API易",
      "options": {
        "baseURL": "https://api.apiyi.com/v1",
        "apiKey": "{env:APIYI_API_KEY}"
      },
      "models": {
        "claude-sonnet-4-20250514": {
          "name": "Claude Sonnet 4",
          "limit": { "context": 200000, "output": 8192 }
        },
        "gpt-4.1": {
          "name": "GPT-4.1",
          "limit": { "context": 1047576, "output": 32768 }
        },
        "deepseek-chat": {
          "name": "DeepSeek V3",
          "limit": { "context": 65536, "output": 8192 }
        },
        "gemini-2.5-pro-preview-05-06": {
          "name": "Gemini 2.5 Pro",
          "limit": { "context": 1048576, "output": 65536 }
        }
      }
    }
  },
  "model": "apiyi/claude-sonnet-4-20250514"
}
```

然后设置环境变量：

<Tabs>
  <Tab title="macOS/Linux">
    ```bash theme={null}
    # zsh
    echo 'export APIYI_API_KEY="sk-你的API易密钥"' >> ~/.zshrc
    source ~/.zshrc

    # bash
    echo 'export APIYI_API_KEY="sk-你的API易密钥"' >> ~/.bashrc
    source ~/.bashrc
    ```
  </Tab>

  <Tab title="Windows">
    PowerShell：

    ```powershell theme={null}
    [System.Environment]::SetEnvironmentVariable('APIYI_API_KEY', 'sk-你的API易密钥', 'User')
    ```

    或在系统环境变量中添加 `APIYI_API_KEY`。
  </Tab>
</Tabs>

### 方法二：/connect 命令认证

OpenCode 提供 `/connect` 命令快速连接新的 Provider：

1. 启动 OpenCode 后输入 `/connect`
2. 选择 "Other"
3. 输入 provider ID（如 `apiyi`）
4. 输入 API 密钥

然后在配置文件中补充 provider 和 models 定义即可使用。

### 方法三：覆盖现有 Provider

如果只想快速使用，可以覆盖内置 OpenAI provider 的 baseURL：

```json theme={null}
{
  "provider": {
    "openai": {
      "options": {
        "baseURL": "https://api.apiyi.com/v1",
        "apiKey": "{env:APIYI_API_KEY}"
      }
    }
  }
}
```

### 方法四：项目级配置

在项目根目录创建 `opencode.json` 文件，配置仅对当前项目生效：

```json theme={null}
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "apiyi": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "API易",
      "options": {
        "baseURL": "https://api.apiyi.com/v1",
        "apiKey": "{env:APIYI_API_KEY}"
      },
      "models": {
        "claude-sonnet-4-20250514": {
          "name": "Claude Sonnet 4",
          "limit": { "context": 200000, "output": 8192 }
        }
      }
    }
  },
  "model": "apiyi/claude-sonnet-4-20250514"
}
```

## Agent 系统

OpenCode 内置三种 Agent，各司其职：

| Agent       | 说明                      | 使用方式          |
| ----------- | ----------------------- | ------------- |
| **build**   | 默认代理，拥有完全访问权限，负责代码生成和修改 | 直接对话          |
| **plan**    | 只读代理，用于代码分析和规划，不会修改文件   | `/plan` 命令    |
| **general** | 复杂搜索子代理，用于多步骤信息检索       | `@general` 调用 |

### Agent 模型配置

可以为不同 Agent 配置不同模型：

```json theme={null}
{
  "provider": {
    "apiyi": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "API易",
      "options": {
        "baseURL": "https://api.apiyi.com/v1",
        "apiKey": "{env:APIYI_API_KEY}"
      },
      "models": {
        "claude-sonnet-4-20250514": {
          "name": "Claude Sonnet 4",
          "limit": { "context": 200000, "output": 8192 }
        },
        "deepseek-chat": {
          "name": "DeepSeek V3",
          "limit": { "context": 65536, "output": 8192 }
        },
        "gpt-4.1-mini": {
          "name": "GPT-4.1 Mini",
          "limit": { "context": 1047576, "output": 32768 }
        }
      }
    }
  },
  "agents": {
    "build": {
      "model": "apiyi/claude-sonnet-4-20250514"
    },
    "plan": {
      "model": "apiyi/deepseek-chat"
    },
    "general": {
      "model": "apiyi/gpt-4.1-mini"
    }
  }
}
```

## 推荐模型

OpenCode 通过 API易 支持 400+ 主流 AI 模型，可根据不同任务选择合适的模型。

<Card title="查看编程开发模型推荐" icon="code" href="/api-capabilities/model-info">
  查看最新的编程模型推荐、性能对比和使用建议。包括顶级性能模型、高性价比模型、推理增强模型等详细分类。
</Card>

### 场景化模型推荐

| Agent   | 用途      | 推荐模型                       |
| ------- | ------- | -------------------------- |
| build   | 代码生成和修改 | Claude Sonnet 4、GPT-4.1    |
| plan    | 任务规划和分析 | DeepSeek V3、Gemini 2.5 Pro |
| general | 快速搜索和问答 | GPT-4.1 Mini（低成本）          |

## 核心功能

### 终端交互界面

启动 OpenCode 进入交互式 TUI 界面：

```bash theme={null}
# 在当前目录启动
opencode

# 指定项目目录
opencode /path/to/project
```

### 文件操作

OpenCode 可以读取、搜索和修改项目文件：

```text theme={null}
> 查看 src/index.ts 的内容

> 在项目中搜索所有包含 "TODO" 的文件

> 将 utils.ts 中的 calculateSum 函数重构为更高效的实现
```

### 命令执行

支持在终端中执行命令并查看结果：

```text theme={null}
> 运行 npm test 并分析失败的测试

> 执行 npm install 并检查是否有依赖冲突
```

### 会话管理

* **多会话并行**：可以同时运行多个会话
* **会话共享**：支持会话导出和分享
* **自动保存**：所有会话自动持久化
* **上下文保持**：会话期间保持完整的对话上下文

## 使用技巧

### 1. 快捷键操作

| 快捷键      | 功能          |
| -------- | ----------- |
| `Ctrl+C` | 中断当前操作      |
| `Ctrl+D` | 退出 OpenCode |
| `Tab`    | 自动补全        |
| `↑/↓`    | 浏览历史命令      |

### 2. 常用命令

| 命令         | 功能                 |
| ---------- | ------------------ |
| `/connect` | 连接新的 Provider      |
| `/model`   | 切换当前模型             |
| `/plan`    | 使用 plan agent 进行分析 |
| `/clear`   | 清除当前会话             |
| `/help`    | 查看帮助信息             |

### 3. 调用子代理

使用 `@general` 调用搜索子代理处理复杂查询：

```text theme={null}
> @general 在代码库中找到所有处理用户认证的文件，并总结它们的功能
```

### 4. 增量式开发

```text theme={null}
{/* 第一步：生成基础框架 */}
> 创建一个 REST API 的基础结构

{/* 第二步：添加具体功能 */}
> 添加用户认证中间件

{/* 第三步：完善细节 */}
> 添加请求参数验证和错误处理
```

## 故障排除

<AccordionGroup>
  <Accordion title="连接 API易 失败">
    1. 检查环境变量是否正确设置：

    ```bash theme={null}
    echo $APIYI_API_KEY  # macOS/Linux
    echo %APIYI_API_KEY%  # Windows
    ```

    2. 确认配置文件中的 baseURL：

    ```json theme={null}
    "baseURL": "https://api.apiyi.com/v1"
    ```

    3. 测试 API 连通性：

    ```bash theme={null}
    curl -H "Authorization: Bearer $APIYI_API_KEY" \
         https://api.apiyi.com/v1/models
    ```
  </Accordion>

  <Accordion title="模型不存在错误">
    确认模型 ID 正确，可在 API易 控制台查看支持的模型列表。

    常见模型 ID：

    * `claude-sonnet-4-20250514`
    * `gpt-4.1`
    * `deepseek-chat`
    * `gemini-2.5-pro-preview-05-06`
  </Accordion>

  <Accordion title="配置文件不生效">
    配置文件加载优先级（从低到高）：

    1. 远程配置（`.well-known/opencode`）
    2. 全局配置：`~/.config/opencode/opencode.json`
    3. `OPENCODE_CONFIG` 环境变量
    4. 项目配置：`opencode.json`
    5. `.opencode` 目录配置
    6. `OPENCODE_CONFIG_CONTENT` 环境变量

    确保配置文件位于正确位置，且 JSON 格式正确。
  </Accordion>

  <Accordion title="响应速度慢">
    1. 尝试使用更轻量的模型（如 GPT-4.1 Mini）
    2. 减少上下文长度，开启新会话
    3. 检查网络连接稳定性
  </Accordion>
</AccordionGroup>

## 最佳实践

### 1. 模型选择策略

| 任务类型   | 推荐模型            | 原因           |
| ------ | --------------- | ------------ |
| 复杂代码生成 | Claude Sonnet 4 | 编程能力强，上下文理解好 |
| 代码审查   | GPT-4.1         | 分析能力强，细节把控好  |
| 快速问答   | DeepSeek V3     | 响应快，性价比高     |
| 长文档分析  | Gemini 2.5 Pro  | 支持超长上下文      |

### 2. 高效提示词

```text theme={null}
❌ 不好的提示：帮我写代码

✅ 好的提示：使用 TypeScript 编写一个 HTTP 中间件，
实现请求日志记录，包含请求方法、路径、
响应时间和状态码，使用 pino 输出
```

### 3. 安全注意事项

* 不要在代码中硬编码 API 密钥
* 使用环境变量管理敏感信息
* 审查 AI 生成的代码，特别是涉及安全的部分
* 注意不要让 AI 执行危险的系统命令

### 4. 成本控制

* 为不同 Agent 配置不同模型（build 用强模型，general 用轻量模型）
* 简单任务使用轻量模型
* 定期查看 API易 控制台监控用量

## 替代方案

如果 OpenCode 不能满足需求，可以考虑以下工具：

<CardGroup cols={2}>
  <Card title="Claude Code" icon="bot" href="/scenarios/programming/claude-code">
    Anthropic 官方终端编程助手
  </Card>

  <Card title="Codex CLI" icon="code" href="/scenarios/programming/codex-cli">
    OpenAI 官方命令行工具
  </Card>

  <Card title="Gemini CLI" icon="terminal" href="/scenarios/programming/gemini-cli">
    Google 官方终端编程助手
  </Card>

  <Card title="Roo Code" icon="wand-sparkles" href="/scenarios/programming/roo-code">
    VS Code AI 编程插件
  </Card>
</CardGroup>

## 相关资源

<CardGroup cols={2}>
  <Card title="API易控制台" icon="settings" href="https://api.apiyi.com">
    管理 API 密钥和查看使用量
  </Card>

  <Card title="模型推荐" icon="chart-bar" href="/api-capabilities/model-info">
    查看编程场景模型推荐
  </Card>
</CardGroup>
