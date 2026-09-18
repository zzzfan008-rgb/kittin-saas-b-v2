> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini CLI

> 通過 API易 使用 Gemini CLI 進行 AI 輔助程式設計，支援程式碼生成、程式碼審查、智慧問答等功能

## 概述

Gemini CLI 是 Google 官方推出的命令列工具，允許您在終端中直接與 Gemini AI 模型互動。通過 API易 中轉，您可以：

* 🚀 在終端中快速呼叫 Gemini 模型
* 💻 進行 AI 輔助程式設計和程式碼生成
* 🔍 程式碼審查和最佳化建議
* 📝 技術問答和文件生成
* 🌐 跨平臺使用（Linux、macOS、Windows）

<Info>
  **為什麼選擇 API易？**

  通過 API易 使用 Gemini CLI，您可以享受更穩定的網路連線、更優惠的價格，以及 7×24 小時技術支援。
</Info>

## 快速開始

### 前置要求

* Node.js >= 18.0.0
* npm 或 yarn 包管理器
* API易 賬號和 API Key

### 第一步：安裝 Gemini CLI

<CodeGroup>
  ```bash npm theme={null}
  # 檢查 Node.js 版本
  node --version  # 需要 >= 18

  # 全域性安裝 Gemini CLI
  npm install -g @google/gemini-cli

  # 驗證安裝
  gemini --version
  ```

  ```bash yarn theme={null}
  # 檢查 Node.js 版本
  node --version  # 需要 >= 18

  # 使用 yarn 安裝
  yarn global add @google/gemini-cli

  # 驗證安裝
  gemini --version
  ```
</CodeGroup>

### 第二步：獲取 API易 金鑰

<Steps>
  <Step title="註冊/登入 API易">
    訪問 `api.apiyi.com` 註冊或登入您的賬號
  </Step>

  <Step title="建立 API Key">
    進入後臺「令牌管理」頁面（`api.apiyi.com/token`），點選「建立新令牌」
  </Step>

  <Step title="複製金鑰">
    複製生成的 API Key（格式：`sk-***`），妥善儲存
  </Step>
</Steps>

### 第三步：配置環境變數

<Warning>
  **重要配置**：`GOOGLE_GEMINI_BASE_URL` 必須設定為 `https://api.apiyi.com`，不能有多餘的路徑（如 `/v1` 或 `/gemini`），否則會導致連線失敗。
</Warning>

<Tabs>
  <Tab title="Zsh (macOS/Linux)">
    ```bash theme={null}
    # 編輯 .zshrc 檔案
    nano ~/.zshrc

    # 新增以下環境變數
    export GOOGLE_GEMINI_BASE_URL="https://api.apiyi.com"
    export GEMINI_API_KEY="sk-your-api-key"  # 替換為你的 API易 金鑰

    # 儲存後重新載入配置
    source ~/.zshrc
    ```
  </Tab>

  <Tab title="Bash (Linux)">
    ```bash theme={null}
    # 編輯 .bashrc 檔案
    nano ~/.bashrc

    # 新增以下環境變數
    export GOOGLE_GEMINI_BASE_URL="https://api.apiyi.com"
    export GEMINI_API_KEY="sk-your-api-key"  # 替換為你的 API易 金鑰

    # 儲存後重新載入配置
    source ~/.bashrc
    ```
  </Tab>

  <Tab title="PowerShell (Windows)">
    ```powershell theme={null}
    # 設定環境變數
    $env:GOOGLE_GEMINI_BASE_URL="https://api.apiyi.com"
    $env:GEMINI_API_KEY="sk-your-api-key"

    # 永久儲存（可選）
    [System.Environment]::SetEnvironmentVariable('GOOGLE_GEMINI_BASE_URL', 'https://api.apiyi.com', 'User')
    [System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'sk-your-api-key', 'User')
    ```
  </Tab>

  <Tab title="CMD (Windows)">
    ```cmd theme={null}
    # 臨時設定環境變數
    set GOOGLE_GEMINI_BASE_URL=https://api.apiyi.com
    set GEMINI_API_KEY=sk-your-api-key

    # 永久儲存（需要管理員權限）
    setx GOOGLE_GEMINI_BASE_URL "https://api.apiyi.com"
    setx GEMINI_API_KEY "sk-your-api-key"
    ```
  </Tab>
</Tabs>

### 第四步：初始化和測試

<Steps>
  <Step title="啟動 Gemini CLI">
    ```bash theme={null}
    gemini
    ```
  </Step>

  <Step title="首次認證">
    在互動介面中輸入：

    ```bash theme={null}
    /auth
    ```

    選擇：**Gemini API Key (AI Studio)**
  </Step>

  <Step title="測試連線">
    ```bash theme={null}
    # 簡單測試
    gemini "Hello, 測試連線是否正常"

    # 程式設計相關測試
    gemini "解釋一下 React Hooks 的使用方法"
    gemini "編寫一個 Python 函式來計算斐波那契數列"
    ```
  </Step>
</Steps>

## 核心功能

### 程式碼生成

<Tabs>
  <Tab title="函式生成">
    ```bash theme={null}
    gemini "用 Python 寫一個快速排序演算法，包含詳細註釋"
    ```

    **輸出示例**：

    ```python theme={null}
    def quick_sort(arr):
        """
        快速排序演算法
        時間複雜度：平均 O(n log n)，最壞 O(n²)
        空間複雜度：O(log n)
        """
        if len(arr) <= 1:
            return arr

        pivot = arr[len(arr) // 2]
        left = [x for x in arr if x < pivot]
        middle = [x for x in arr if x == pivot]
        right = [x for x in arr if x > pivot]

        return quick_sort(left) + middle + quick_sort(right)
    ```
  </Tab>

  <Tab title="完整專案腳手架">
    ```bash theme={null}
    gemini "建立一個 Express.js REST API 專案結構，包含使用者認證和資料庫配置"
    ```
  </Tab>

  <Tab title="單元測試">
    ```bash theme={null}
    gemini "為這個函式編寫 Jest 單元測試：
    function fibonacci(n) {
      if (n <= 1) return n;
      return fibonacci(n - 1) + fibonacci(n - 2);
    }"
    ```
  </Tab>
</Tabs>

### 程式碼審查

```bash theme={null}
# 審查程式碼品質
gemini "審查以下程式碼的效能問題和潛在 bug：
[貼上你的程式碼]
"

# 安全審計
gemini "檢查這段程式碼的安全漏洞，特別關注 SQL 注入和 XSS 攻擊"

# 最佳實踐建議
gemini "這段 React 元件有什麼可以最佳化的地方？遵循最佳實踐嗎？"
```

### 技術問答

```bash theme={null}
# 概念解釋
gemini "解釋一下 JavaScript 的閉包概念，並給出實際應用場景"

# 錯誤排查
gemini "為什麼我的 Promise 沒有被正確 resolve？"

# 效能最佳化
gemini "如何最佳化 React 元件的渲染效能？"

# 架構設計
gemini "微服務架構和單體架構的優缺點對比"
```

### 文件生成

```bash theme={null}
# 生成 README
gemini "為我的 Node.js 庫生成一個專業的 README.md，包括安裝、使用示例、API 文件"

# API 文件
gemini "為這個 REST API 端點生成 OpenAPI 3.0 規範文件"

# 程式碼註釋
gemini "為以下程式碼新增詳細的 JSDoc 註釋"
```

## 互動式命令

在 Gemini CLI 互動模式下，可以使用以下命令：

| 命令       | 說明      | 示例                       |
| -------- | ------- | ------------------------ |
| `/auth`  | 重新認證    | `/auth`                  |
| `/model` | 切換模型    | `/model gemini-pro`      |
| `/clear` | 清除對話歷史  | `/clear`                 |
| `/help`  | 顯示幫助資訊  | `/help`                  |
| `/exit`  | 退出 CLI  | `/exit` 或 `Ctrl+C`       |
| `/save`  | 儲存對話到檔案 | `/save conversation.txt` |

<Tip>
  **模型切換**：使用 `/model` 命令可以在不同的 Gemini 模型之間切換，如 `gemini-3-pro-preview`、`gemini-2.5-flash`、`gemini-2.5-pro` 等。
</Tip>

## 支援的模型

通過 API易，您可以使用以下最新 Gemini 模型：

### Gemini 3 系列（推薦）

| 模型                                | 適用場景          | 特點                      |
| --------------------------------- | ------------- | ----------------------- |
| **gemini-3-pro-preview**          | 高品質程式碼生成、複雜推理 | 🏆 效能最強，LMArena 排行榜全球第一 |
| **gemini-3-pro-preview-thinking** | 超複雜推理、演算法設計   | 🧠 思維鏈輸出，深度推理能力         |

### Gemini 2.5 系列

| 模型                        | 適用場景       | 特點             |
| ------------------------- | ---------- | -------------- |
| **gemini-2.5-pro**        | 專業級程式碼生成   | ⚡ 高效能，100 萬上下文 |
| **gemini-2.5-flash**      | 快速響應、日常開發  | 🚀 速度快，成本低     |
| **gemini-2.5-flash-lite** | 輕量級任務、批次呼叫 | 💰 超低成本，高頻呼叫   |

<Info>
  **推薦配置**：

  * 複雜程式設計任務、架構設計：`gemini-3-pro-preview`
  * 日常程式碼生成、問答：`gemini-2.5-flash`
  * 批次處理、快速迭代：`gemini-2.5-flash-lite`
</Info>

<Card title="檢視完整模型列表" icon="list" href="/zh-Hant/api-capabilities/model-info">
  檢視 API易 支援的所有 Gemini 模型、詳細價格和效能對比
</Card>

## 高階用法

### VS Code 整合

在 VS Code 中使用 Gemini CLI 擴充套件：

```json theme={null}
{
  "gemini.apiKey": "sk-your-api-key",
  "gemini.baseUrl": "https://api.apiyi.com",
  "gemini.model": "gemini-3-pro-preview",
  "gemini.temperature": 0.7,
  "gemini.maxTokens": 4000
}
```

### GitHub Actions 整合

自動化程式碼審查：

```yaml theme={null}
name: Gemini Code Review
on:
  pull_request:
    branches: [ main ]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Gemini CLI
        run: npm install -g @google/gemini-cli

      - name: Run Code Review
        env:
          GEMINI_API_KEY: \${{ secrets.GEMINI_API_KEY }}
          GOOGLE_GEMINI_BASE_URL: https://api.apiyi.com
        run: |
          gemini "審查這個 Pull Request 的程式碼品質、安全性和效能：
          $(git diff origin/main...HEAD)"
```

### 批處理指令碼

建立自動化指令碼：

```bash theme={null}
#!/bin/bash

# 批次程式碼審查
for file in src/**/*.js; do
  echo "Reviewing $file..."
  gemini "審查檔案 $file 的程式碼品質" < "$file"
done

# 生成專案文件
gemini "為整個專案生成技術文件大綱" < README.md
```

## 常見問題

<AccordionGroup>
  <Accordion title="連線失敗或認證錯誤？">
    **檢查清單**：

    1. **環境變數是否正確**：

       ```bash theme={null}
       echo $GOOGLE_GEMINI_BASE_URL
       echo $GEMINI_API_KEY
       ```

       確保輸出為：

       * `GOOGLE_GEMINI_BASE_URL`: `https://api.apiyi.com`（不要有 /v1 或其他路徑）
       * `GEMINI_API_KEY`: `sk-` 開頭的完整金鑰

    2. **重新載入環境變數**：
       ```bash theme={null}
       source ~/.zshrc  # 或 source ~/.bashrc
       ```

    3. **重啟終端**：完全關閉並重新開啟終端視窗

    4. **驗證 API Key**：登入 API易 後臺確認 Key 是否有效且餘額充足
  </Accordion>

  <Accordion title="如何切換不同的 Gemini 模型？">
    在互動模式下使用 `/model` 命令：

    ```bash theme={null}
    /model gemini-3-pro-preview
    /model gemini-3-pro-preview-thinking
    /model gemini-2.5-flash
    ```

    或在命令列直接指定：

    ```bash theme={null}
    gemini --model gemini-3-pro-preview "你的問題"
    gemini --model gemini-2.5-flash "快速測試"
    ```
  </Accordion>

  <Accordion title="如何儲存對話歷史？">
    **方法一**：使用 `/save` 命令

    ```bash theme={null}
    /save conversation-2025-01-01.txt
    ```

    **方法二**：重定向輸出

    ```bash theme={null}
    gemini "你的問題" > output.txt
    gemini "你的問題" | tee output.txt  # 同時顯示和儲存
    ```

    **方法三**：使用會話管理

    ```bash theme={null}
    gemini --session my-project "繼續之前的討論"
    ```
  </Accordion>

  <Accordion title="Node.js 版本不滿足要求怎麼辦？">
    **推薦使用 nvm 管理 Node.js 版本**：

    ```bash theme={null}
    # 安裝 nvm
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

    # 安裝 Node.js 18+
    nvm install 18
    nvm use 18
    nvm alias default 18

    # 驗證版本
    node --version
    ```
  </Accordion>

  <Accordion title="為什麼響應速度慢？">
    **可能原因和解決方案**：

    1. **網路問題**：API易 提供國內最佳化節點，通常響應很快
    2. **模型選擇**：使用 `gemini-2.5-flash` 或 `gemini-2.5-flash-lite` 獲得最快響應
    3. **Token 限制**：減少單次請求的複雜度
    4. **併發請求**：避免同時傳送大量請求

    **測試連線速度**：

    ```bash theme={null}
    time gemini --model gemini-2.5-flash "Hello"
    ```
  </Accordion>

  <Accordion title="如何在 Windows 上使用？">
    **推薦使用 PowerShell**：

    1. 安裝 Node.js（從官網下載安裝包）
    2. 以管理員身份執行 PowerShell
    3. 設定環境變數：
       ```powershell theme={null}
       [System.Environment]::SetEnvironmentVariable('GOOGLE_GEMINI_BASE_URL', 'https://api.apiyi.com', 'User')
       [System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'sk-your-key', 'User')
       ```
    4. 重啟 PowerShell
    5. 安裝和使用 Gemini CLI

    **或使用 WSL**（Windows Subsystem for Linux）獲得更好的體驗。
  </Accordion>
</AccordionGroup>

## 最佳實踐

### 提示詞最佳化

<CardGroup cols={2}>
  <Card title="明確具體" icon="target">
    ❌ "最佳化這段程式碼"

    ✅ "最佳化這段程式碼的效能，重點關注迴圈效率和記憶體使用"
  </Card>

  <Card title="提供上下文" icon="book">
    ❌ "這個函式有什麼問題？"

    ✅ "這是一個用於處理使用者登入的函式，目前遇到非同步錯誤，幫我找出問題"
  </Card>

  <Card title="分步驟請求" icon="list-ordered">
    ❌ "幫我完成整個專案"

    ✅ "第一步：設計資料庫模型；第二步：建立 API 路由；第三步：..."
  </Card>

  <Card title="要求示例" icon="code">
    ❌ "解釋閉包"

    ✅ "解釋 JavaScript 閉包，並給出 3 個實際應用場景和程式碼示例"
  </Card>
</CardGroup>

### 工作流建議

<Steps>
  <Step title="問題定義">
    清晰描述要解決的問題或實現的功能
  </Step>

  <Step title="獲取方案">
    使用 Gemini CLI 生成初步解決方案或程式碼
  </Step>

  <Step title="審查最佳化">
    要求 AI 審查自己生成的程式碼，找出潛在問題
  </Step>

  <Step title="迭代改進">
    根據反饋逐步最佳化，直到滿足需求
  </Step>

  <Step title="文件補充">
    生成必要的註釋和文件
  </Step>
</Steps>

## 價格說明

使用 API易 呼叫 Gemini 模型的費用取決於您選擇的模型和使用量。

<Card title="檢視詳細價格" icon="dollar-sign" href="/zh-Hant/api-capabilities/model-info">
  檢視所有 Gemini 模型的詳細定價和價效比對比
</Card>

<Info>
  API易 提供充值優惠：充值越多，加贈比例越高（10%-20%）。首次充值還可獲得額外加贈。檢視 [充值活動詳情](/zh-Hant/faq/recharge-promotions)。
</Info>

## 相關資源

* [Gemini CLI 官方文件](https://ai.google.dev/gemini-api/docs/cli)
* [API易 快速開始指南](/zh-Hant/getting-started)
* [模型推薦和價格對比](/zh-Hant/api-capabilities/model-info)
* [充值優惠活動](/zh-Hant/faq/recharge-promotions)
* [API 使用手冊](/zh-Hant/api-manual)

## 獲取幫助

<CardGroup cols={2}>
  <Card title="企業微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企業微信客服二維碼" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    掃碼新增 或 [點選聯絡客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    技術諮詢、使用指導
  </Card>

  <Card title="郵件諮詢" icon="mail">
    **客服郵箱**：[support@apiyi.com](mailto:support@apiyi.com)

    **商務合作**：[business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>

<Tip>
  **快速上手**：按照本文的「快速開始」章節，5 分鐘即可完成配置並開始使用 Gemini CLI！
</Tip>
