> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# CC Switch

> 統一管理 Claude Code 等 5 款 AI CLI 工具的桌面應用，一鍵切換 API 提供商、模型和配置

## 概述

CC Switch 是一款基於 Tauri 2 構建的桌面應用，可以統一管理 Claude Code、Codex CLI、Gemini CLI、OpenCode、OpenClaw 五款 AI CLI 工具。告別手動編輯配置檔案，通過圖形介面一鍵切換 API 提供商、模型和金鑰。

通過配置 API易 服務，您可以獲得：

<CardGroup cols={2}>
  <Card title="🚀 一鍵切換" icon="toggle-right">
    圖形介面管理所有 CLI 工具配置，告別手動編輯
  </Card>

  <Card title="💰 88 折優惠" icon="piggy-bank">
    選擇 ClaudeCode 分組建立令牌，享受 88% 折扣
  </Card>

  <Card title="📊 用量追蹤" icon="chart-line">
    內建 Usage Dashboard，即時檢視花費、請求數和 Token 用量
  </Card>

  <Card title="🔄 智慧容錯" icon="shield">
    本地代理支援熱切換、自動故障轉移和熔斷保護
  </Card>
</CardGroup>

<Info>
  **專案資訊**

  * 🔗 開源地址：`github.com/farion1231/cc-switch`
  * 📜 許可證：MIT
  * 👤 作者：Jason Young（farion1231）
  * 🏷️ 最新版本：v3.12.0
</Info>

## 核心功能

### Provider 管理

* 內建 50+ 預設提供商（含 AWS Bedrock、NVIDIA NIM 等）
* 一鍵切換、拖拽排序、匯入匯出配置
* 系統托盤快速訪問

### MCP 伺服器管理

* 統一管理所有 CLI 工具的 MCP 伺服器配置
* 雙向同步，修改一處自動同步到所有應用

### 更多特性

* **Prompts 管理**：Markdown 編輯器 + 跨應用同步
* **Skills 安裝**：從 GitHub 倉庫或 ZIP 檔案安裝技能
* **Session 瀏覽器**：檢視和恢復對話歷史
* **雲同步**：支援 Dropbox、OneDrive、iCloud、WebDAV
* **Deep Link**：`ccswitch://` 協議一鍵匯入配置

## 快速開始

### 第一步：安裝 CC Switch

<Tabs>
  <Tab title="macOS">
    使用 Homebrew 安裝：

    ```bash theme={null}
    brew install --cask cc-switch
    ```

    或從 GitHub Releases 下載 DMG 安裝包。
  </Tab>

  <Tab title="Windows">
    從 GitHub Releases 下載 MSI 安裝程式或 Portable ZIP 包。
  </Tab>

  <Tab title="Linux">
    根據發行版選擇安裝方式：

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
  **系統要求**：Windows 10+、macOS 10.15 (Catalina)+、Ubuntu 22.04+ / Debian 11+ / Fedora 34+
</Info>

### 第二步：獲取 API易 金鑰

1. 訪問 [API易控制台 - 令牌頁面](https://api.apiyi.com/token)
2. 點選建立新令牌
3. **重要**：選擇 **【ClaudeCode】分組**，享受 **88% 折扣**
4. 複製生成的金鑰（以 `sk-` 開頭）

<Tip>
  **省錢提示**：建立令牌時務必選擇【ClaudeCode】分組，可享受 88 折優惠價格，大幅降低使用成本。
</Tip>

### 第三步：在 CC Switch 中配置 API易

1. 開啟 CC Switch 應用
2. 進入 **Provider** 管理頁面，點選新增，選擇「自定義閘道」：

<img src="https://mintcdn.com/apiyillc/9frKyyBXrVY4n9Yi/images/cc-switch-provider-config.png?fit=max&auto=format&n=9frKyyBXrVY4n9Yi&q=85&s=bea7dc157f751d1a530f486664b15791" alt="CC Switch Provider 配置介面 - 新增 API易 統一供應商" width="1628" height="1522" data-path="images/cc-switch-provider-config.png" />

3. 按照上圖填寫以下資訊：
   * **名稱**：`APIYI`
   * **API 地址**：`https://api.apiyi.com`
   * **API Key**：貼上上一步獲取的金鑰
   * **啟用的應用**：開啟 Claude Code（按需開啟其他工具）
4. 點選「新增」儲存配置

### 第四步：新增模型

在 Provider 配置中新增以下模型：

**標準模型**：

| 模型名稱              | 模型標識                        | 說明            |
| ----------------- | --------------------------- | ------------- |
| Claude Opus 4.6   | `claude-opus-4-6`           | 最強旗艦，複雜任務首選   |
| Claude Sonnet 4.6 | `claude-sonnet-4-6`         | 程式設計能力強，價效比之選 |
| Claude Haiku 4.5  | `claude-haiku-4-5-20251001` | 輕量快速，簡單任務適用   |

**推理模型**（強制啟用思維鏈）：

| 模型名稱                       | 模型標識                                 | 說明            |
| -------------------------- | ------------------------------------ | ------------- |
| Claude Opus 4.6 Thinking   | `claude-opus-4-6-thinking`           | 深度推理，複雜邏輯分析   |
| Claude Sonnet 4.6 Thinking | `claude-sonnet-4-6-thinking`         | 推理增強程式設計，平衡效率 |
| Claude Haiku 4.5 Thinking  | `claude-haiku-4-5-20251001-thinking` | 輕量推理，快速思考     |

<Tip>
  **模型選擇建議**：日常程式設計推薦 `claude-sonnet-4-6`，複雜架構設計用 `claude-opus-4-6`，快速問答用 `claude-haiku-4-5-20251001`。需要深度推理時使用對應的 thinking 版本。
</Tip>

### 第五步：一鍵切換

配置完成後，在 CC Switch 中選擇 API易 作為當前 Provider，所有關聯的 CLI 工具（Claude Code、Codex CLI 等）會自動切換到 API易 配置。

## 使用指南

### 管理多個 CLI 工具

CC Switch 支援同時管理以下 5 款 AI CLI 工具：

* **Claude Code** — Anthropic 官方命令列程式設計助手
* **Codex CLI** — OpenAI 的命令列程式設計工具
* **Gemini CLI** — Google 的命令列 AI 助手
* **OpenCode** — 開源命令列程式設計工具
* **OpenClaw** — 開源本地 AI Agent

所有工具共享 Provider 配置，切換一次即可全部生效。

### 本地代理功能

CC Switch 內建本地代理伺服器，提供：

* **熱切換**：無需重啟即可切換 Provider
* **自動故障轉移**：當前 Provider 不可用時自動切換備選
* **熔斷保護**：檢測到持續故障時自動停止請求，防止資源浪費

### 配置備份

* 自動備份系統保留最近 10 個版本
* 支援匯入/匯出完整配置
* 雲同步支援 Dropbox、OneDrive、iCloud、WebDAV

## 模型推薦

<Card title="檢視更多程式設計模型推薦" icon="star" href="/zh-Hant/api-capabilities/model-info">
  除了 Claude 系列，API易 還支援 400+ 主流 AI 模型。檢視完整的程式設計模型推薦、效能對比和場景化使用建議。
</Card>

## 常見問題

<AccordionGroup>
  <Accordion title="CC Switch 支援哪些作業系統？">
    支援 Windows 10+、macOS 10.15 (Catalina)+、以及主流 Linux 發行版（Ubuntu 22.04+、Debian 11+、Fedora 34+、Arch Linux）。
  </Accordion>

  <Accordion title="如何享受分組折扣優惠？">
    在 [API易控制台](https://api.apiyi.com/token) 建立令牌時，部分分組（如 ClaudeCode 分組）享有折扣，具體折扣以控制台實際顯示為準；疊加充值活動贈送後，實際成本更低。
  </Accordion>

  <Accordion title="配置後 Claude Code 無法連線？">
    請檢查：

    1. API Key 是否正確（以 `sk-` 開頭）
    2. Base URL 是否設定為 `https://api.apiyi.com`
    3. API易 賬戶餘額是否充足
    4. CC Switch 是否已將配置同步到 Claude Code
  </Accordion>

  <Accordion title="標準模型和 Thinking 模型有什麼區別？">
    Thinking（推理）模型會強制啟用思維鏈模式，在回答前進行深度推理分析。適合複雜邏輯推理、架構設計等需要深度思考的場景。標準模型響應更快，適合日常程式設計和簡單任務。
  </Accordion>

  <Accordion title="如何從其他配置方式遷移到 CC Switch？">
    CC Switch 支援匯入功能，可以自動讀取已有的環境變數和配置檔案。安裝後開啟應用，它會自動檢測已安裝的 CLI 工具及其現有配置。
  </Accordion>

  <Accordion title="CC Switch 是否收費？">
    CC Switch 本身完全免費開源（MIT 許可證）。只有 API 呼叫會產生費用，通過 API易 使用 ClaudeCode 分組可享受 88 折優惠。
  </Accordion>
</AccordionGroup>

## 最佳實踐

<Tip>
  **高效使用建議**：

  1. **分組建立令牌**：務必選擇【ClaudeCode】分組，享受 88 折
  2. **善用熱切換**：在不同任務間快速切換 Provider 和模型
  3. **啟用自動故障轉移**：配置多個 Provider 作為備選，確保服務連續性
  4. **定期備份**：利用雲同步功能定期備份配置
</Tip>

## 相關資源

<CardGroup cols={2}>
  <Card title="Claude Code 配置" icon="terminal" href="/zh-Hant/scenarios/programming/claude-code">
    檢視 Claude Code 的詳細配置教程
  </Card>

  <Card title="模型推薦" icon="bot" href="/zh-Hant/api-capabilities/model-info">
    瞭解最新的 AI 模型推薦
  </Card>

  <Card title="API易控制台" icon="settings" href="https://api.apiyi.com">
    管理 API 金鑰和檢視用量
  </Card>

  <Card title="其他程式設計工具" icon="code" href="/zh-Hant/scenarios/programming/cursor">
    探索 Cursor 等其他程式設計工具
  </Card>
</CardGroup>
