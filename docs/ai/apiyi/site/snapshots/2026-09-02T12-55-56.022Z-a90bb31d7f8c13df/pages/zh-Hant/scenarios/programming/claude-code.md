> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Code

> Claude 官方命令列程式設計助手，使用 API易 配置實現穩定高效的 AI 程式設計體驗

<Warning>
  **先說成本**：寫程式碼這類長上下文任務、以及 Agent 需要深度探索的場景，**API 按量計費的消耗相當大，綜合性價比通常不如官網訂閱會員**。

  Coding Agent 每一輪都要反覆讀入專案上下文、翻工具結果、來回改，一次像樣的任務動輒幾十萬 token。真實發生過的情況是：**充 \$5 還沒跑完一次深度調研，額度就見底了**——這不是異常，是這類場景的正常消耗量級。

  * **用量大、且有條件直連官網**：建議直接買 Claude Pro / Max 官方訂閱，固定月費在高頻重度場景下更划算。
  * **受制於網路環境，或就是想用多少付多少**：那 API 更適合你——免代理直連、無固定月費、無需自行維護官方賬號，還能一把 Key 調 400+ 模型。

  兩種方式沒有絕對優劣，按自己的用量和網路條件選即可。這裡如實告知，避免充值後產生預期落差。
</Warning>

## 概述

Claude Code 是 Anthropic 官方推出的命令列程式設計助手，可以在終端中直接使用 Claude 的強大程式設計能力。通過配置 API易 服務，您可以獲得：

<CardGroup cols={2}>
  <Card title="🚀 穩定直連" icon="wifi">
    免代理直連，無封號風險，告別網路不穩定
  </Card>

  <Card title="💳 按量計費" icon="wallet">
    無固定訂閱，用多少付多少，靈活可控
  </Card>

  <Card title="⚡ 快取命中率高" icon="bolt">
    程式設計場景反覆讀取上下文，高快取命中顯著降本
  </Card>

  <Card title="🛡️ 品質可靠" icon="shield-half">
    純官轉 AWS Claude + 官方直連 KEY 雙通道
  </Card>
</CardGroup>

<Info>
  **按量計費 vs Claude Max 官方訂閱，怎麼選？**

  * **Claude Max（官方訂閱）**：固定月費封頂，**純寫程式碼且消耗量極大的重度使用者更划算**；前提是能滿足官方網路要求，並自行承擔賬號維護與封禁風險。
  * **API易 Claude 方案**：按量計費、無封號顧慮，純官轉 AWS Claude 與官方直連 KEY 雙通道保障品質，充值加贈可攤薄實付成本。用過的客戶口碑良好，持續復充。同時為企業客戶解決直連訪問與稅務合規（開票）問題。
  * **API 場景更靈活**：除 Coding 外還可呼叫 400+ 模型，選擇遠多於單一 coding plan。
</Info>

## 分組介紹

在 Claude Code 中使用 API易 時，**建立令牌請務必選擇 `ClaudeCode` 分組**（在控制台建立令牌時的"分組"選項中選擇）。該分組把所有相容 Anthropic 原生 `/v1/messages` 呼叫格式的模型聚合到一個通道，是 Claude Code 場景的專屬通道。

<Tip>
  **ClaudeCode 分組預設享 95 折（5% off）**，無需任何操作；且可疊加充值活動加贈 10%–20%，疊加後實際成本比官方直連便宜約兩成。
</Tip>

<Note>
  **這個分組用在哪裡？**

  * **Claude Code 環境內**：本分組更適配 Claude Code，**部分國產模型要在 Claude Code 裡呼叫，必須使用 ClaudeCode 分組的令牌**（用其它分組會失敗）。
  * **非 Claude Code 環境**：ClaudeCode 分組的令牌**同樣可以正常使用**，不限制只能在 Claude Code 裡呼叫。此時它純粹是一項優惠——預設 95 折（0.95x），並可疊加充值活動加贈 10%–20%。
</Note>

### 支援在 Claude Code 中使用的國產模型

除 Claude 全系列外，`ClaudeCode` 分組還包含一批已相容 Anthropic 原生 `/v1/messages` 格式的國產程式設計模型。在 Claude Code 裡把模型名換成下表中的模型 ID 即可直接使用——**同樣必須使用 ClaudeCode 分組的令牌**（建立令牌時選擇該分組），否則呼叫會失敗。

| 模型 ID                    | 廠商       | 提示 / 1M tokens | 補全 / 1M tokens |
| ------------------------ | -------- | -------------- | -------------- |
| `deepseek-v4-flash`      | DeepSeek | \$0.133        | \$0.266        |
| `deepseek-v4-pro`        | DeepSeek | \$0.408        | \$0.817        |
| `glm-4.7`                | 智譜       | \$0.570        | \$2.052        |
| `glm-5`                  | 智譜       | \$0.532        | \$2.394        |
| `glm-5.1`                | 智譜       | \$0.798        | \$3.192        |
| `kimi-k2.5`              | Moonshot | \$0.570        | \$2.992        |
| `kimi-k2.6`              | Moonshot | \$0.570        | \$2.280        |
| `MiniMax-M2.7`           | MiniMax  | \$0.285        | \$1.140        |
| `MiniMax-M2.7-highspeed` | MiniMax  | \$0.570        | \$2.280        |
| `MiniMax-M3`             | MiniMax  | \$0.285        | \$1.140        |
| `qwen3.6-plus`           | 阿里巴巴     | \$0.285        | \$1.710        |
| `qwen3.7-max`            | 阿里巴巴     | \$1.628        | \$4.885        |

<Info>
  以上均為按量計費，表內為基礎價格；使用 ClaudeCode 分組令牌時在此基礎上自動再享 95 折。模型列表持續更新，最新價格以控制台模型廣場為準。
</Info>

<Card title="瞭解令牌分組機制" icon="layers" href="/zh-Hant/faq/groups-explained">
  為什麼會有 ClaudeCode 分組？分組與折扣如何工作？檢視分組機制完整說明。
</Card>

## 快速開始

<Note>
  **簡化配置提示**：如果您不想註冊 Claude 官網賬號，建議直接檢視下方的[高階配置](#高階配置)部分，使用 `~/.claude.json` 檔案配置，可以完全繞過官網驗證。
</Note>

### 1. 安裝 Claude Code

在終端執行以下命令全域性安裝：

```bash theme={null}
npm install -g @anthropic-ai/claude-code
```

<Info>
  需要 Node.js 18 或更高版本。如未安裝，請先訪問 [nodejs.org](https://nodejs.org) 下載安裝。
</Info>

### 2. 配置 API 金鑰

#### 獲取 API 金鑰

請參考 [API金鑰獲取與管理教程](/zh-Hant/faq/token-management) 獲取您的 API易 金鑰。

#### 設定環境變數

在系統環境變數中新增 API易 配置。

<Tabs>
  <Tab title="macOS/Linux">
    編輯 `~/.zshrc` 或 `~/.bashrc` 檔案：

    ```bash theme={null}
    # API易 配置
    export ANTHROPIC_AUTH_TOKEN="sk-***"
    export ANTHROPIC_BASE_URL="https://api.apiyi.com"
    ```

    <Tip>
      **Mac 使用者提示**：在使用者目錄按 `⌘ + ⇧ + .` 顯示隱藏檔案，使用文本編輯器開啟 `.zshrc` 檔案。
    </Tip>
  </Tab>

  <Tab title="Windows">
    使用 PowerShell 編輯配置：

    ```powershell theme={null}
    # 編輯配置檔案
    notepad $PROFILE

    # 新增以下內容
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
    重啟 PowerShell 或執行：

    ```powershell theme={null}
    . $PROFILE
    ```
  </Tab>
</Tabs>

### 4. 啟動 Claude Code

進入你的專案目錄並啟動：

```bash theme={null}
# 進入專案目錄
cd ~/Desktop/my-project

# 啟動 Claude Code
claude
```

## 高階配置

### 配置檔案（推薦）

需要配置兩個檔案，配合使用即可繞過 Claude 官網驗證：

**第一步**：在使用者主目錄建立 `~/.claude.json`，繞過官網驗證：

```json theme={null}
{
  "hasCompletedOnboarding": true
}
```

**第二步**：在 `~/.claude/settings.json` 中配置 API易 服務：

```json theme={null}
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-你的API易金鑰",
    "ANTHROPIC_BASE_URL": "https://api.apiyi.com"
  }
}
```

<Tip>
  **重要提示**：`hasCompletedOnboarding: true` 可以完全繞過 Claude 官網賬號驗證，直接使用 API易 服務。這樣您無需：

  * 註冊 Claude 官網賬號（註冊困難，需要海外手機號）
  * 擔心 Claude 官網賬號被封
  * 進行任何額外的授權步驟
</Tip>

<Warning>
  **安全提醒**：配置檔案包含 API 金鑰等敏感資訊，請勿分享給他人。
</Warning>

### 全域性授權（不推薦）

如果沒有配置 `hasCompletedOnboarding: true`，首次使用時會彈出授權頁面：

1. 需要跳轉到 Claude 官網進行確認
2. 需要有 Claude 官網賬號（註冊困難且容易被封）
3. 授權成功後返回終端繼續

<Info>
  **建議**：強烈推薦使用上述配置檔案方法，避免 Claude 官網賬號的各種限制。
</Info>

## 使用指南

### 基本命令

啟動後，Claude Code 會顯示當前配置資訊：

```bash theme={null}
claude
# 顯示 API Key 和 API Base URL
# 確認配置無誤後選擇 Yes 繼續
```

### 工作流程

1. **啟動助手**：在專案目錄執行 `claude`
2. **描述需求**：輸入你的程式設計需求或問題
3. **互動對話**：Claude 會理解上下文並提供程式碼建議
4. **應用更改**：確認後 Claude 可以直接修改檔案

### 支援的功能

* ✅ 程式碼生成和最佳化
* ✅ Bug 修復和除錯
* ✅ 程式碼重構建議
* ✅ 文件編寫
* ✅ 測試用例生成
* ✅ 技術問題解答

## 模型選擇

Claude Code 預設使用最新的 Claude 模型。通過 API易，推薦使用以下 4 個最新模型：

| 模型                    | 模型 ID                       | 特點              | 推薦場景               |
| --------------------- | --------------------------- | --------------- | ------------------ |
| **Claude Opus 4.8**   | `claude-opus-4-8`           | 當前最強旗艦，程式設計能力頂級 | 複雜專案、架構設計、疑難除錯     |
| **Claude Opus 4.7**   | `claude-opus-4-7`           | 上一代旗艦，效能穩定      | 高要求程式設計任務          |
| **Claude Sonnet 4.6** | `claude-sonnet-4-6`         | 效能與速度均衡，價效比高    | 日常程式設計、程式碼生成（推薦預設） |
| **Claude Haiku 4.5**  | `claude-haiku-4-5-20251001` | 輕量快速，響應迅速       | 簡單任務、快速補全、低成本場景    |

<Card title="檢視更多程式設計模型推薦" icon="star" href="/zh-Hant/api-capabilities/model-info">
  除了 Claude 系列，API易 還支援 400+ 主流 AI 模型。檢視完整的程式設計模型推薦、效能對比和場景化使用建議。
</Card>

## 故障排除

### 常見問題

<AccordionGroup>
  <Accordion title="Unable to Connect to Anthropic Services">
    這通常是網路配置問題。請檢查：

    1. 環境變數是否正確設定
    2. API 金鑰是否有效
    3. 網路連線是否正常

    執行以下命令驗證配置：

    ```bash theme={null}
    echo $ANTHROPIC_AUTH_TOKEN
    echo $ANTHROPIC_BASE_URL
    ```
  </Accordion>

  <Accordion title="提示需要 Claude 官網賬號授權">
    這是因為沒有配置 `hasCompletedOnboarding`。在 `~/.claude.json` 中新增 `{"hasCompletedOnboarding": true}`，並在 `~/.claude/settings.json` 中配置 API易 環境變數，即可繞過官網驗證。詳見上方[高階配置](#高階配置)。
  </Accordion>

  <Accordion title="API Key 無效">
    確保使用的是 API易 的金鑰，而不是 Claude 官網的金鑰。參考 [API金鑰獲取與管理教程](/zh-Hant/faq/token-management) 獲取金鑰。
  </Accordion>

  <Accordion title="如何更新 Claude Code">
    執行以下命令更新到最新版本：

    ```bash theme={null}
    npm update -g @anthropic-ai/claude-code
    ```
  </Accordion>

  <Accordion title="支援哪些程式語言">
    Claude Code 支援所有主流程式語言，包括但不限於：

    * Python, JavaScript/TypeScript, Java, C++, C#
    * Go, Rust, Swift, Kotlin
    * HTML/CSS, SQL, Shell Scripts
    * 以及更多...
  </Accordion>
</AccordionGroup>

## 最佳實踐

### 有效的提示詞

```markdown theme={null}
好的提示：
"幫我重構這個 Python 函式，使其更高效並新增型別註解"
"這段程式碼有記憶體洩漏，請幫我找出並修復"
"為這個 React 元件編寫單元測試"

避免過於寬泛：
"改進我的程式碼"  # 太模糊
```

### 專案結構建議

* 保持程式碼庫整潔有序
* 使用清晰的檔案命名
* 新增適當的註釋
* 提供專案 README

## 效能最佳化

### 提升響應速度

1. **使用 `~/.claude.json` 配置**：配置後可避免每次驗證，特別是設定 `hasCompletedOnboarding: true` 後啟動更快
2. **保持對話連貫**：在同一會話中處理相關任務
3. **明確需求**：清晰描述可減少往返互動

### 成本控制

* Claude Code 按 Token 使用量計費
* 通過 API易 可享受優惠價格
* 檢視 [定價頁面](/zh-Hant/pricing) 瞭解詳情

## 相關資源

<CardGroup cols={2}>
  <Card title="官方文件" icon="book" href="https://docs.apiyi.com/faq/token-management">
    API金鑰獲取與管理
  </Card>

  <Card title="Claude Code 官方文件" icon="terminal">
    官方文件地址：`code.claude.com/docs`
  </Card>

  <Card title="模型介紹" icon="bot" href="/zh-Hant/api-capabilities/model-info">
    瞭解 Claude 系列模型
  </Card>

  <Card title="其他程式設計工具" icon="code" href="/zh-Hant/scenarios/programming/cursor">
    探索 Cursor 等工具
  </Card>
</CardGroup>

## 總結

Claude Code 結合 API易 服務，為開發者提供了一個穩定、靈活的 AI 程式設計助手方案：免代理直連、按量計費、無固定月費，在網路受限或用量不穩定時尤其合適。**如果你是重度高頻使用者且有條件直連官網，請結合本頁開頭的成本提示再做選擇。**

<Info>
  **提示**：如需瞭解更多程式設計場景的 AI 工具，可以檢視 [OpenAI Codex CLI](/zh-Hant/scenarios/programming/codex-cli) 等其他選項。
</Info>
