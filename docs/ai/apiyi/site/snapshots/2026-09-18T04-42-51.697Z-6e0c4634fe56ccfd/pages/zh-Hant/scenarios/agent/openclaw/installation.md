> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 安裝指南

> 安裝 OpenClaw 本地 AI 助手，支援 macOS、Linux、Windows 多種安裝方式

## 系統要求

* Node.js 22 或更高版本
* macOS / Linux / Windows

## 安裝 Node.js

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
    從 Node.js 官網下載安裝 22.x 或更高版本。

    或使用 PowerShell 安裝 fnm：

    ```powershell theme={null}
    winget install Schniz.fnm
    fnm install 22
    fnm use 22
    ```
  </Tab>
</Tabs>

## 安裝 OpenClaw

<Tabs>
  <Tab title="npm（推薦）">
    ```bash theme={null}
    npm install -g openclaw
    ```
  </Tab>

  <Tab title="一鍵安裝指令碼">
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

## 驗證安裝

```bash theme={null}
openclaw --version
```

執行診斷命令，檢查環境是否就緒：

```bash theme={null}
openclaw doctor
```

檢視當前執行狀態：

```bash theme={null}
openclaw status
```

<Info>
  如果 `openclaw doctor` 報告問題，可以嘗試自動修復：

  ```bash theme={null}
  openclaw doctor --fix
  ```
</Info>

## 下一步

安裝完成後，選擇一種方式配置 API易：

<CardGroup cols={3}>
  <Card title="配置檔案方式" icon="file-code" href="/zh-Hant/scenarios/agent/openclaw/config-json">
    手動編輯 JSON 配置
  </Card>

  <Card title="CLI 互動式配置" icon="terminal" href="/zh-Hant/scenarios/agent/openclaw/config-cli">
    嚮導引導完成配置
  </Card>

  <Card title="Anthropic 原生配置" icon="bot" href="/zh-Hant/scenarios/agent/openclaw/config-anthropic">
    直連 Claude 模型
  </Card>
</CardGroup>
