> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# CC Switch

> Unified desktop app for managing Claude Code and 4 other AI CLI tools — one-click provider switching, model configuration, and more

## Overview

CC Switch is a desktop application built with Tauri 2 that unifies management of five AI CLI tools: Claude Code, Codex CLI, Gemini CLI, OpenCode, and OpenClaw. No more manual config file editing — switch API providers, models, and keys through a graphical interface.

By configuring APIYI as your provider, you get:

<CardGroup cols={2}>
  <Card title="🚀 One-Click Switching" icon="toggle-right">
    Manage all CLI tool configs through a GUI, no more manual editing
  </Card>

  <Card title="💰 88% Discount" icon="piggy-bank">
    Create tokens with the ClaudeCode group for 88% pricing
  </Card>

  <Card title="📊 Usage Tracking" icon="chart-line">
    Built-in Usage Dashboard for real-time spending, requests, and token tracking
  </Card>

  <Card title="🔄 Smart Failover" icon="shield">
    Local proxy with hot-switching, auto-failover, and circuit breaker
  </Card>
</CardGroup>

<Info>
  **Project Info**

  * 🔗 Repository: `github.com/farion1231/cc-switch`
  * 📜 License: MIT
  * 👤 Author: Jason Young (farion1231)
  * 🏷️ Latest Version: v3.12.0
</Info>

## Core Features

### Provider Management

* 50+ built-in presets including AWS Bedrock and NVIDIA NIM
* One-click switching, drag-and-drop sorting, import/export
* System tray quick access

### MCP Server Management

* Unified MCP server configuration across all CLI tools
* Bidirectional sync — changes propagate to all applications

### More Features

* **Prompts Management**: Markdown editor + cross-app synchronization
* **Skills Installation**: Install skills from GitHub repos or ZIP files
* **Session Browser**: View and restore conversation history
* **Cloud Sync**: Dropbox, OneDrive, iCloud, and WebDAV support
* **Deep Link**: `ccswitch://` protocol for one-click config imports

## Quick Start

### Step 1: Install CC Switch

<Tabs>
  <Tab title="macOS">
    Install via Homebrew:

    ```bash theme={null}
    brew install --cask cc-switch
    ```

    Or download the DMG installer from GitHub Releases.
  </Tab>

  <Tab title="Windows">
    Download the MSI installer or Portable ZIP from GitHub Releases.
  </Tab>

  <Tab title="Linux">
    Choose the installation method for your distribution:

    ```bash theme={null}
    # Debian/Ubuntu
    sudo dpkg -i cc-switch_*.deb

    # Fedora/RHEL
    sudo rpm -i cc-switch_*.rpm

    # Arch Linux
    paru -S cc-switch-bin
    ```

    AppImage and Flatpak are also available.
  </Tab>
</Tabs>

<Info>
  **System Requirements**: Windows 10+, macOS 10.15 (Catalina)+, Ubuntu 22.04+ / Debian 11+ / Fedora 34+
</Info>

### Step 2: Get Your APIYI API Key

1. Visit [APIYI Console - Token Page](https://api.apiyi.com/token)
2. Click to create a new token
3. **Important**: Select the **【ClaudeCode】group** for **88% discount**
4. Copy the generated key (starts with `sk-`)

<Tip>
  **Save Money**: Make sure to select the【ClaudeCode】group when creating tokens to enjoy 88% discounted pricing.
</Tip>

### Step 3: Configure APIYI in CC Switch

1. Open CC Switch
2. Go to the **Provider** management page, click add, and select "Custom Gateway":

<img src="https://mintcdn.com/apiyillc/9frKyyBXrVY4n9Yi/images/cc-switch-provider-config.png?fit=max&auto=format&n=9frKyyBXrVY4n9Yi&q=85&s=bea7dc157f751d1a530f486664b15791" alt="CC Switch Provider Configuration - Add APIYI as Unified Provider" width="1628" height="1522" data-path="images/cc-switch-provider-config.png" />

3. Fill in the following information as shown above:
   * **Name**: `APIYI`
   * **API Address**: `https://api.apiyi.com`
   * **API Key**: Paste the key from the previous step
   * **Enabled Apps**: Enable Claude Code (enable others as needed)
4. Click "Add" to save the configuration

### Step 4: Add Models

Add the following models in your Provider configuration:

**Standard Models**:

| Model Name        | Model ID                    | Description                            |
| ----------------- | --------------------------- | -------------------------------------- |
| Claude Opus 4.6   | `claude-opus-4-6`           | Top flagship, best for complex tasks   |
| Claude Sonnet 4.6 | `claude-sonnet-4-6`         | Strong coding, best value              |
| Claude Haiku 4.5  | `claude-haiku-4-5-20251001` | Lightweight and fast, for simple tasks |

**Reasoning Models** (forced chain-of-thought):

| Model Name                 | Model ID                             | Description                            |
| -------------------------- | ------------------------------------ | -------------------------------------- |
| Claude Opus 4.6 Thinking   | `claude-opus-4-6-thinking`           | Deep reasoning, complex logic analysis |
| Claude Sonnet 4.6 Thinking | `claude-sonnet-4-6-thinking`         | Reasoning-enhanced coding, balanced    |
| Claude Haiku 4.5 Thinking  | `claude-haiku-4-5-20251001-thinking` | Lightweight reasoning, quick thinking  |

<Tip>
  **Model Selection Tips**: Use `claude-sonnet-4-6` for daily coding, `claude-opus-4-6` for complex architecture design, and `claude-haiku-4-5-20251001` for quick Q\&A. Use the thinking variants when deep reasoning is needed.
</Tip>

### Step 5: One-Click Switch

Once configured, select APIYI as the active Provider in CC Switch. All linked CLI tools (Claude Code, Codex CLI, etc.) will automatically switch to the APIYI configuration.

## Usage Guide

### Managing Multiple CLI Tools

CC Switch supports managing these 5 AI CLI tools simultaneously:

* **Claude Code** — Anthropic's official CLI programming assistant
* **Codex CLI** — OpenAI's command-line programming tool
* **Gemini CLI** — Google's command-line AI assistant
* **OpenCode** — Open-source CLI programming tool
* **OpenClaw** — Open-source local AI Agent

All tools share Provider configuration — switch once, apply everywhere.

### Local Proxy

CC Switch includes a built-in local proxy server with:

* **Hot-switching**: Switch providers without restarting
* **Auto-failover**: Automatically switch to backup when current provider is down
* **Circuit breaker**: Stops requests on persistent failures to prevent resource waste

### Configuration Backup

* Auto-backup system retains the 10 most recent versions
* Import/export complete configurations
* Cloud sync via Dropbox, OneDrive, iCloud, WebDAV

## Model Recommendations

<Card title="View More Programming Model Recommendations" icon="star" href="/api-capabilities/model-info">
  Besides the Claude series, APIYI supports 400+ mainstream AI models. Check out the complete programming model recommendations, performance comparisons, and scenario-based suggestions.
</Card>

## FAQ

<AccordionGroup>
  <Accordion title="Which operating systems does CC Switch support?">
    Windows 10+, macOS 10.15 (Catalina)+, and major Linux distributions (Ubuntu 22.04+, Debian 11+, Fedora 34+, Arch Linux).
  </Accordion>

  <Accordion title="How do I get group discount pricing?">
    Some groups (e.g. the ClaudeCode group) offer discounted pricing when creating a token at [APIYI Console](https://api.apiyi.com/token) — check the console for the current rate. Stack it with a recharge bonus for an even lower effective cost.
  </Accordion>

  <Accordion title="Claude Code can't connect after configuration?">
    Please check:

    1. API Key is correct (starts with `sk-`)
    2. Base URL is set to `https://api.apiyi.com`
    3. APIYI account balance is sufficient
    4. CC Switch has synced the configuration to Claude Code
  </Accordion>

  <Accordion title="What's the difference between standard and Thinking models?">
    Thinking (reasoning) models force chain-of-thought mode, performing deep reasoning analysis before responding. They're ideal for complex logic, architecture design, and deep thinking scenarios. Standard models respond faster and are suitable for daily coding and simple tasks.
  </Accordion>

  <Accordion title="How to migrate from other configuration methods to CC Switch?">
    CC Switch supports import functionality and can automatically detect existing environment variables and config files. After installation, open the app and it will auto-detect installed CLI tools and their existing configurations.
  </Accordion>

  <Accordion title="Is CC Switch free?">
    CC Switch itself is completely free and open source (MIT License). Only API calls incur costs — using the ClaudeCode group through APIYI gives you 88% discounted pricing.
  </Accordion>
</AccordionGroup>

## Best Practices

<Tip>
  **Tips for Efficient Use**:

  1. **Create tokens with the right group**: Always select【ClaudeCode】group for 88% discount
  2. **Leverage hot-switching**: Quickly switch providers and models between tasks
  3. **Enable auto-failover**: Configure multiple providers as backups for service continuity
  4. **Regular backups**: Use cloud sync to regularly back up your configuration
</Tip>

## Related Resources

<CardGroup cols={2}>
  <Card title="Claude Code Setup" icon="terminal" href="/en/scenarios/programming/claude-code">
    Detailed Claude Code configuration tutorial
  </Card>

  <Card title="Model Recommendations" icon="bot" href="/api-capabilities/model-info">
    Latest AI model recommendations
  </Card>

  <Card title="APIYI Console" icon="settings" href="https://api.apiyi.com">
    Manage API keys and view usage
  </Card>

  <Card title="Other Programming Tools" icon="code" href="/en/scenarios/programming/cursor">
    Explore other tools like Cursor
  </Card>
</CardGroup>
