> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# CC Switch

> 统一管理 Claude Code 等 5 款 AI CLI 工具的桌面应用，一键切换 API 提供商、模型和配置

## 概述

CC Switch 是一款基于 Tauri 2 构建的桌面应用，可以统一管理 Claude Code、Codex CLI、Gemini CLI、OpenCode、OpenClaw 五款 AI CLI 工具。告别手动编辑配置文件，通过图形界面一键切换 API 提供商、模型和密钥。

通过配置 API易 服务，您可以获得：

<CardGroup cols={2}>
  <Card title="🚀 一键切换" icon="toggle-right">
    图形界面管理所有 CLI 工具配置，告别手动编辑
  </Card>

  <Card title="💰 88 折优惠" icon="piggy-bank">
    选择 ClaudeCode 分组创建令牌，享受 88% 折扣
  </Card>

  <Card title="📊 用量追踪" icon="chart-line">
    内置 Usage Dashboard，实时查看花费、请求数和 Token 用量
  </Card>

  <Card title="🔄 智能容错" icon="shield">
    本地代理支持热切换、自动故障转移和熔断保护
  </Card>
</CardGroup>

<Info>
  **项目信息**

  * 🔗 开源地址：`github.com/farion1231/cc-switch`
  * 📜 许可证：MIT
  * 👤 作者：Jason Young（farion1231）
  * 🏷️ 最新版本：v3.12.0
</Info>

## 核心功能

### Provider 管理

* 内置 50+ 预设提供商（含 AWS Bedrock、NVIDIA NIM 等）
* 一键切换、拖拽排序、导入导出配置
* 系统托盘快速访问

### MCP 服务器管理

* 统一管理所有 CLI 工具的 MCP 服务器配置
* 双向同步，修改一处自动同步到所有应用

### 更多特性

* **Prompts 管理**：Markdown 编辑器 + 跨应用同步
* **Skills 安装**：从 GitHub 仓库或 ZIP 文件安装技能
* **Session 浏览器**：查看和恢复对话历史
* **云同步**：支持 Dropbox、OneDrive、iCloud、WebDAV
* **Deep Link**：`ccswitch://` 协议一键导入配置

## 快速开始

### 第一步：安装 CC Switch

<Tabs>
  <Tab title="macOS">
    使用 Homebrew 安装：

    ```bash theme={null}
    brew install --cask cc-switch
    ```

    或从 GitHub Releases 下载 DMG 安装包。
  </Tab>

  <Tab title="Windows">
    从 GitHub Releases 下载 MSI 安装程序或 Portable ZIP 包。
  </Tab>

  <Tab title="Linux">
    根据发行版选择安装方式：

    ```bash theme={null}
    # Debian/Ubuntu
    sudo dpkg -i cc-switch_*.deb

    # Fedora/RHEL
    sudo rpm -i cc-switch_*.rpm

    # Arch Linux
    paru -S cc-switch-bin
    ```

    也可使用 AppImage 或 Flatpak。
  </Tab>
</Tabs>

<Info>
  **系统要求**：Windows 10+、macOS 10.15 (Catalina)+、Ubuntu 22.04+ / Debian 11+ / Fedora 34+
</Info>

### 第二步：获取 API易 密钥

1. 访问 [API易控制台 - 令牌页面](https://api.apiyi.com/token)
2. 点击创建新令牌
3. **重要**：选择 **【ClaudeCode】分组**，享受 **88% 折扣**
4. 复制生成的密钥（以 `sk-` 开头）

<Tip>
  **省钱提示**：创建令牌时务必选择【ClaudeCode】分组，可享受 88 折优惠价格，大幅降低使用成本。
</Tip>

### 第三步：在 CC Switch 中配置 API易

1. 打开 CC Switch 应用
2. 进入 **Provider** 管理页面，点击添加，选择「自定义网关」：

<img src="https://mintcdn.com/apiyillc/9frKyyBXrVY4n9Yi/images/cc-switch-provider-config.png?fit=max&auto=format&n=9frKyyBXrVY4n9Yi&q=85&s=bea7dc157f751d1a530f486664b15791" alt="CC Switch Provider 配置界面 - 添加 API易 统一供应商" width="1628" height="1522" data-path="images/cc-switch-provider-config.png" />

3. 按照上图填写以下信息：
   * **名称**：`APIYI`
   * **API 地址**：`https://api.apiyi.com`
   * **API Key**：粘贴上一步获取的密钥
   * **启用的应用**：开启 Claude Code（按需开启其他工具）
4. 点击「添加」保存配置

### 第四步：添加模型

在 Provider 配置中添加以下模型：

**标准模型**：

| 模型名称              | 模型标识                        | 说明          |
| ----------------- | --------------------------- | ----------- |
| Claude Opus 4.6   | `claude-opus-4-6`           | 最强旗舰，复杂任务首选 |
| Claude Sonnet 4.6 | `claude-sonnet-4-6`         | 编程能力强，性价比之选 |
| Claude Haiku 4.5  | `claude-haiku-4-5-20251001` | 轻量快速，简单任务适用 |

**推理模型**（强制启用思维链）：

| 模型名称                       | 模型标识                                 | 说明          |
| -------------------------- | ------------------------------------ | ----------- |
| Claude Opus 4.6 Thinking   | `claude-opus-4-6-thinking`           | 深度推理，复杂逻辑分析 |
| Claude Sonnet 4.6 Thinking | `claude-sonnet-4-6-thinking`         | 推理增强编程，平衡效率 |
| Claude Haiku 4.5 Thinking  | `claude-haiku-4-5-20251001-thinking` | 轻量推理，快速思考   |

<Tip>
  **模型选择建议**：日常编程推荐 `claude-sonnet-4-6`，复杂架构设计用 `claude-opus-4-6`，快速问答用 `claude-haiku-4-5-20251001`。需要深度推理时使用对应的 thinking 版本。
</Tip>

### 第五步：一键切换

配置完成后，在 CC Switch 中选择 API易 作为当前 Provider，所有关联的 CLI 工具（Claude Code、Codex CLI 等）会自动切换到 API易 配置。

## 使用指南

### 管理多个 CLI 工具

CC Switch 支持同时管理以下 5 款 AI CLI 工具：

* **Claude Code** — Anthropic 官方命令行编程助手
* **Codex CLI** — OpenAI 的命令行编程工具
* **Gemini CLI** — Google 的命令行 AI 助手
* **OpenCode** — 开源命令行编程工具
* **OpenClaw** — 开源本地 AI Agent

所有工具共享 Provider 配置，切换一次即可全部生效。

### 本地代理功能

CC Switch 内置本地代理服务器，提供：

* **热切换**：无需重启即可切换 Provider
* **自动故障转移**：当前 Provider 不可用时自动切换备选
* **熔断保护**：检测到持续故障时自动停止请求，防止资源浪费

### 配置备份

* 自动备份系统保留最近 10 个版本
* 支持导入/导出完整配置
* 云同步支持 Dropbox、OneDrive、iCloud、WebDAV

## 模型推荐

<Card title="查看更多编程模型推荐" icon="star" href="/api-capabilities/model-info">
  除了 Claude 系列，API易 还支持 400+ 主流 AI 模型。查看完整的编程模型推荐、性能对比和场景化使用建议。
</Card>

## 常见问题

<AccordionGroup>
  <Accordion title="CC Switch 支持哪些操作系统？">
    支持 Windows 10+、macOS 10.15 (Catalina)+、以及主流 Linux 发行版（Ubuntu 22.04+、Debian 11+、Fedora 34+、Arch Linux）。
  </Accordion>

  <Accordion title="如何享受分组折扣优惠？">
    在 [API易控制台](https://api.apiyi.com/token) 创建令牌时，部分分组（如 ClaudeCode 分组）享有折扣，具体折扣以控制台实际显示为准；叠加充值活动赠送后，实际成本更低。
  </Accordion>

  <Accordion title="配置后 Claude Code 无法连接？">
    请检查：

    1. API Key 是否正确（以 `sk-` 开头）
    2. Base URL 是否设置为 `https://api.apiyi.com`
    3. API易 账户余额是否充足
    4. CC Switch 是否已将配置同步到 Claude Code
  </Accordion>

  <Accordion title="标准模型和 Thinking 模型有什么区别？">
    Thinking（推理）模型会强制启用思维链模式，在回答前进行深度推理分析。适合复杂逻辑推理、架构设计等需要深度思考的场景。标准模型响应更快，适合日常编程和简单任务。
  </Accordion>

  <Accordion title="如何从其他配置方式迁移到 CC Switch？">
    CC Switch 支持导入功能，可以自动读取已有的环境变量和配置文件。安装后打开应用，它会自动检测已安装的 CLI 工具及其现有配置。
  </Accordion>

  <Accordion title="CC Switch 是否收费？">
    CC Switch 本身完全免费开源（MIT 许可证）。只有 API 调用会产生费用，通过 API易 使用 ClaudeCode 分组可享受 88 折优惠。
  </Accordion>
</AccordionGroup>

## 最佳实践

<Tip>
  **高效使用建议**：

  1. **分组创建令牌**：务必选择【ClaudeCode】分组，享受 88 折
  2. **善用热切换**：在不同任务间快速切换 Provider 和模型
  3. **启用自动故障转移**：配置多个 Provider 作为备选，确保服务连续性
  4. **定期备份**：利用云同步功能定期备份配置
</Tip>

## 相关资源

<CardGroup cols={2}>
  <Card title="Claude Code 配置" icon="terminal" href="/scenarios/programming/claude-code">
    查看 Claude Code 的详细配置教程
  </Card>

  <Card title="模型推荐" icon="bot" href="/api-capabilities/model-info">
    了解最新的 AI 模型推荐
  </Card>

  <Card title="API易控制台" icon="settings" href="https://api.apiyi.com">
    管理 API 密钥和查看用量
  </Card>

  <Card title="其他编程工具" icon="code" href="/scenarios/programming/cursor">
    探索 Cursor 等其他编程工具
  </Card>
</CardGroup>
