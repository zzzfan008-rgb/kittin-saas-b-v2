> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenCode

> 開源 AI 編碼代理，支援終端/IDE/桌面多平臺，通過 API易 配置獲得穩定高效的程式設計體驗

## 概述

OpenCode 是一款完全開源的 AI 編碼代理，基於 TypeScript 和 AI SDK 構建，提供終端 TUI、IDE 整合和桌面應用多種使用方式。專案在 GitHub 擁有 94.9k+ Star，社群活躍。

通過配置 API易 服務，您可以獲得：

<CardGroup cols={2}>
  <Card title="🖥️ 多平臺支援" icon="monitor">
    終端 TUI、VS Code 擴充套件、桌面應用一應俱全
  </Card>

  <Card title="🔌 75+ 模型支援" icon="plug">
    通過 Models.dev 支援 75+ LLM 提供商
  </Card>

  <Card title="🛠️ 內建 LSP" icon="code">
    語言伺服器協議支援，智慧程式碼理解
  </Card>

  <Card title="🔄 多會話並行" icon="layers">
    支援多會話並行處理和會話共享
  </Card>
</CardGroup>

<Info>
  **專案資訊**：OpenCode 是活躍維護的開源專案，官網 `opencode.ai`，專案地址 `github.com/anomalyco/opencode`。
</Info>

## 環境準備

### 安裝 OpenCode

<Tabs>
  <Tab title="快速安裝（推薦）">
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

  <Tab title="桌面應用">
    從官網 `opencode.ai` 下載對應系統的桌面應用：

    * macOS (Apple Silicon / Intel)
    * Windows
    * Linux (AppImage / deb)
  </Tab>
</Tabs>

驗證安裝：

```bash theme={null}
opencode --version
```

## 快速配置

OpenCode 使用 JSON 配置檔案，支援多種配置位置（按優先順序從低到高）：

1. 遠端配置（`.well-known/opencode`）
2. 全域性配置：`~/.config/opencode/opencode.json`
3. 自定義配置：`OPENCODE_CONFIG` 環境變數指定的路徑
4. 專案配置：專案根目錄 `opencode.json`
5. `.opencode` 目錄配置
6. 內聯配置：`OPENCODE_CONFIG_CONTENT` 環境變數

### 方法一：自定義 Provider（推薦）

建立或編輯配置檔案 `~/.config/opencode/opencode.json`：

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

然後設定環境變數：

<Tabs>
  <Tab title="macOS/Linux">
    ```bash theme={null}
    # zsh
    echo 'export APIYI_API_KEY="sk-你的API易金鑰"' >> ~/.zshrc
    source ~/.zshrc

    # bash
    echo 'export APIYI_API_KEY="sk-你的API易金鑰"' >> ~/.bashrc
    source ~/.bashrc
    ```
  </Tab>

  <Tab title="Windows">
    PowerShell：

    ```powershell theme={null}
    [System.Environment]::SetEnvironmentVariable('APIYI_API_KEY', 'sk-你的API易金鑰', 'User')
    ```

    或在系統環境變數中新增 `APIYI_API_KEY`。
  </Tab>
</Tabs>

### 方法二：/connect 命令認證

OpenCode 提供 `/connect` 命令快速連線新的 Provider：

1. 啟動 OpenCode 後輸入 `/connect`
2. 選擇 "Other"
3. 輸入 provider ID（如 `apiyi`）
4. 輸入 API 金鑰

然後在配置檔案中補充 provider 和 models 定義即可使用。

### 方法三：覆蓋現有 Provider

如果只想快速使用，可以覆蓋內建 OpenAI provider 的 baseURL：

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

### 方法四：專案級配置

在專案根目錄建立 `opencode.json` 檔案，配置僅對當前專案生效：

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

## Agent 系統

OpenCode 內建三種 Agent，各司其職：

| Agent       | 說明                       | 使用方式          |
| ----------- | ------------------------ | ------------- |
| **build**   | 預設代理，擁有完全訪問權限，負責程式碼生成和修改 | 直接對話          |
| **plan**    | 只讀代理，用於程式碼分析和規劃，不會修改檔案   | `/plan` 命令    |
| **general** | 複雜搜尋子代理，用於多步驟資訊檢索        | `@general` 呼叫 |

### Agent 模型配置

可以為不同 Agent 配置不同模型：

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

## 推薦模型

OpenCode 通過 API易 支援 400+ 主流 AI 模型，可根據不同任務選擇合適的模型。

<Card title="檢視程式設計開發模型推薦" icon="code" href="/zh-Hant/api-capabilities/model-info">
  檢視最新的程式設計模型推薦、效能對比和使用建議。包括頂級效能模型、高性價比模型、推理增強模型等詳細分類。
</Card>

### 場景化模型推薦

| Agent   | 用途       | 推薦模型                       |
| ------- | -------- | -------------------------- |
| build   | 程式碼生成和修改 | Claude Sonnet 4、GPT-4.1    |
| plan    | 任務規劃和分析  | DeepSeek V3、Gemini 2.5 Pro |
| general | 快速搜尋和問答  | GPT-4.1 Mini（低成本）          |

## 核心功能

### 終端互動介面

啟動 OpenCode 進入互動式 TUI 介面：

```bash theme={null}
# 在當前目錄啟動
opencode

# 指定專案目錄
opencode /path/to/project
```

### 檔案操作

OpenCode 可以讀取、搜尋和修改專案檔案：

```text theme={null}
> 檢視 src/index.ts 的內容

> 在專案中搜索所有包含 "TODO" 的檔案

> 將 utils.ts 中的 calculateSum 函式重構為更高效的實現
```

### 命令執行

支援在終端中執行命令並檢視結果：

```text theme={null}
> 執行 npm test 並分析失敗的測試

> 執行 npm install 並檢查是否有依賴衝突
```

### 會話管理

* **多會話並行**：可以同時執行多個會話
* **會話共享**：支援會話匯出和分享
* **自動儲存**：所有會話自動持久化
* **上下文保持**：會話期間保持完整的對話上下文

## 使用技巧

### 1. 快捷鍵操作

| 快捷鍵      | 功能          |
| -------- | ----------- |
| `Ctrl+C` | 中斷當前操作      |
| `Ctrl+D` | 退出 OpenCode |
| `Tab`    | 自動補全        |
| `↑/↓`    | 瀏覽歷史命令      |

### 2. 常用命令

| 命令         | 功能                 |
| ---------- | ------------------ |
| `/connect` | 連線新的 Provider      |
| `/model`   | 切換當前模型             |
| `/plan`    | 使用 plan agent 進行分析 |
| `/clear`   | 清除當前會話             |
| `/help`    | 檢視幫助資訊             |

### 3. 呼叫子代理

使用 `@general` 調用搜索子代理處理複雜查詢：

```text theme={null}
> @general 在程式碼庫中找到所有處理使用者認證的檔案，並總結它們的功能
```

### 4. 增量式開發

```text theme={null}
{/* 第一步：生成基礎框架 */}
> 建立一個 REST API 的基礎結構

{/* 第二步：新增具體功能 */}
> 新增使用者認證中介軟體

{/* 第三步：完善細節 */}
> 新增請求引數驗證和錯誤處理
```

## 故障排除

<AccordionGroup>
  <Accordion title="連線 API易 失敗">
    1. 檢查環境變數是否正確設定：

    ```bash theme={null}
    echo $APIYI_API_KEY  # macOS/Linux
    echo %APIYI_API_KEY%  # Windows
    ```

    2. 確認配置檔案中的 baseURL：

    ```json theme={null}
    "baseURL": "https://api.apiyi.com/v1"
    ```

    3. 測試 API 連通性：

    ```bash theme={null}
    curl -H "Authorization: Bearer $APIYI_API_KEY" \
         https://api.apiyi.com/v1/models
    ```
  </Accordion>

  <Accordion title="模型不存在錯誤">
    確認模型 ID 正確，可在 API易 控制台檢視支援的模型列表。

    常見模型 ID：

    * `claude-sonnet-4-20250514`
    * `gpt-4.1`
    * `deepseek-chat`
    * `gemini-2.5-pro-preview-05-06`
  </Accordion>

  <Accordion title="配置檔案不生效">
    配置檔案載入優先順序（從低到高）：

    1. 遠端配置（`.well-known/opencode`）
    2. 全域性配置：`~/.config/opencode/opencode.json`
    3. `OPENCODE_CONFIG` 環境變數
    4. 專案配置：`opencode.json`
    5. `.opencode` 目錄配置
    6. `OPENCODE_CONFIG_CONTENT` 環境變數

    確保配置檔案位於正確位置，且 JSON 格式正確。
  </Accordion>

  <Accordion title="響應速度慢">
    1. 嘗試使用更輕量的模型（如 GPT-4.1 Mini）
    2. 減少上下文長度，開啟新會話
    3. 檢查網路連線穩定性
  </Accordion>
</AccordionGroup>

## 最佳實踐

### 1. 模型選擇策略

| 任務型別    | 推薦模型            | 原因             |
| ------- | --------------- | -------------- |
| 複雜程式碼生成 | Claude Sonnet 4 | 程式設計能力強，上下文理解好 |
| 程式碼審查   | GPT-4.1         | 分析能力強，細節把控好    |
| 快速問答    | DeepSeek V3     | 響應快，價效比高       |
| 長文件分析   | Gemini 2.5 Pro  | 支援超長上下文        |

### 2. 高效提示詞

```text theme={null}
❌ 不好的提示：幫我寫程式碼

✅ 好的提示：使用 TypeScript 編寫一個 HTTP 中介軟體，
實現請求日誌記錄，包含請求方法、路徑、
響應時間和狀態碼，使用 pino 輸出
```

### 3. 安全注意事項

* 不要在程式碼中硬編碼 API 金鑰
* 使用環境變數管理敏感資訊
* 審查 AI 生成的程式碼，特別是涉及安全的部分
* 注意不要讓 AI 執行危險的系統命令

### 4. 成本控制

* 為不同 Agent 配置不同模型（build 用強模型，general 用輕量模型）
* 簡單任務使用輕量模型
* 定期檢視 API易 控制台監控用量

## 替代方案

如果 OpenCode 不能滿足需求，可以考慮以下工具：

<CardGroup cols={2}>
  <Card title="Claude Code" icon="bot" href="/zh-Hant/scenarios/programming/claude-code">
    Anthropic 官方終端程式設計助手
  </Card>

  <Card title="Codex CLI" icon="code" href="/zh-Hant/scenarios/programming/codex-cli">
    OpenAI 官方命令列工具
  </Card>

  <Card title="Gemini CLI" icon="terminal" href="/zh-Hant/scenarios/programming/gemini-cli">
    Google 官方終端程式設計助手
  </Card>

  <Card title="Roo Code" icon="wand-sparkles" href="/zh-Hant/scenarios/programming/roo-code">
    VS Code AI 程式設計外掛
  </Card>
</CardGroup>

## 相關資源

<CardGroup cols={2}>
  <Card title="API易控制台" icon="settings" href="https://api.apiyi.com">
    管理 API 金鑰和檢視使用量
  </Card>

  <Card title="模型推薦" icon="chart-bar" href="/zh-Hant/api-capabilities/model-info">
    檢視程式設計場景模型推薦
  </Card>
</CardGroup>
