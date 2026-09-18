> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 安装指南

> 安装 OpenClaw 本地 AI 助手，支持 macOS、Linux、Windows 多种安装方式

## 系统要求

* Node.js 22 或更高版本
* macOS / Linux / Windows

## 安装 Node.js

<Tabs>
  <Tab title="macOS (Homebrew)">
    ```bash theme={null}
    brew install node@22
    ```
  </Tab>

  <Tab title="Linux (nvm)">
    ```bash theme={null}
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    nvm install 22
    nvm use 22
    ```
  </Tab>

  <Tab title="Windows">
    从 Node.js 官网下载安装 22.x 或更高版本。

    或使用 PowerShell 安装 fnm：

    ```powershell theme={null}
    winget install Schniz.fnm
    fnm install 22
    fnm use 22
    ```
  </Tab>
</Tabs>

## 安装 OpenClaw

<Tabs>
  <Tab title="npm（推荐）">
    ```bash theme={null}
    npm install -g openclaw
    ```
  </Tab>

  <Tab title="一键安装脚本">
    ```bash theme={null}
    curl -fsSL https://openclaw.ai/install.sh | bash
    ```
  </Tab>

  <Tab title="Windows PowerShell">
    ```powershell theme={null}
    irm https://openclaw.ai/install.ps1 | iex
    ```
  </Tab>
</Tabs>

## 验证安装

```bash theme={null}
openclaw --version
```

运行诊断命令，检查环境是否就绪：

```bash theme={null}
openclaw doctor
```

查看当前运行状态：

```bash theme={null}
openclaw status
```

<Info>
  如果 `openclaw doctor` 报告问题，可以尝试自动修复：

  ```bash theme={null}
  openclaw doctor --fix
  ```
</Info>

## 下一步

安装完成后，选择一种方式配置 API易：

<CardGroup cols={3}>
  <Card title="配置文件方式" icon="file-code" href="/scenarios/agent/openclaw/config-json">
    手动编辑 JSON 配置
  </Card>

  <Card title="CLI 交互式配置" icon="terminal" href="/scenarios/agent/openclaw/config-cli">
    向导引导完成配置
  </Card>

  <Card title="Anthropic 原生配置" icon="bot" href="/scenarios/agent/openclaw/config-anthropic">
    直连 Claude 模型
  </Card>
</CardGroup>
