> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Installation Guide

> Install OpenClaw local AI assistant on macOS, Linux, and Windows

## System Requirements

* Node.js 22 or higher
* macOS / Linux / Windows

## Install Node.js

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
    Download and install version 22.x or higher from the Node.js official website.

    Or use PowerShell to install fnm:

    ```powershell theme={null}
    winget install Schniz.fnm
    fnm install 22
    fnm use 22
    ```
  </Tab>
</Tabs>

## Install OpenClaw

<Tabs>
  <Tab title="npm (Recommended)">
    ```bash theme={null}
    npm install -g openclaw
    ```
  </Tab>

  <Tab title="Quick Install Script">
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

## Verify Installation

```bash theme={null}
openclaw --version
```

Run the diagnostic command to check if the environment is ready:

```bash theme={null}
openclaw doctor
```

Check current running status:

```bash theme={null}
openclaw status
```

<Info>
  If `openclaw doctor` reports issues, try auto-fixing:

  ```bash theme={null}
  openclaw doctor --fix
  ```
</Info>

## Next Steps

After installation, choose a configuration method:

<CardGroup cols={3}>
  <Card title="JSON Configuration" icon="file-code" href="/en/scenarios/agent/openclaw/config-json">
    Manually edit JSON config
  </Card>

  <Card title="CLI Interactive Setup" icon="terminal" href="/en/scenarios/agent/openclaw/config-cli">
    Wizard-guided setup
  </Card>

  <Card title="Anthropic Native Config" icon="bot" href="/en/scenarios/agent/openclaw/config-anthropic">
    Direct Claude connection
  </Card>
</CardGroup>
