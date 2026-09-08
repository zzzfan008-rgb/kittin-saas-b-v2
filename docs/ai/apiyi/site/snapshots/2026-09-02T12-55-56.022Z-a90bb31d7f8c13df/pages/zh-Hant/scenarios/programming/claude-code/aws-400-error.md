> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Code 報錯 400 解決指南

> 使用 API易 AWS Claude（Bedrock）官方通道時，Claude Code 出現 400 / ValidationException 報錯的原因與解決方法

## 📌 問題說明

部分使用者在使用 Claude Code 時，可能會遇到類似以下報錯：

* `400 ValidationException`
* `Extra inputs are not permitted`
* `cache_control.scope` 相關錯誤

該問題通常由 **Claude Code 的實驗性 Beta 功能引數** 引起，這些引數在 API易 所提供的官方亞馬遜 Claude API（即 AWS Claude / Bedrock）介面中**不被支援**。

<Info>
  本指南僅適用於通過 **AWS Claude（Bedrock）官方通道** 呼叫的場景。Anthropic 原生 API 通道支援這些 Beta 引數，無需做以下調整。
</Info>

## ✅ 解決方案（推薦）

通過關閉 Claude Code 的實驗性 Beta 功能即可解決。

### 方法一：修改 settings.json（推薦）

在 Claude Code 的 `settings.json` 中新增環境變數：

```json theme={null}
"env": {
  "CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS": "1"
}
```

### 方法二：臨時生效（當前終端會話）

在終端執行：

```bash theme={null}
export CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1
```

然後重新執行 Claude Code。

<Tip>
  方法二僅對當前終端視窗有效，關閉終端後失效。如需長期使用，請採用方法一或方法三。
</Tip>

### 方法三：永久生效（推薦）

根據你使用的終端環境，將變數寫入配置檔案。

#### Mac / Linux（bash）

```bash theme={null}
echo 'export CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1' >> ~/.bashrc
source ~/.bashrc
```

#### Mac（zsh，預設）

```bash theme={null}
echo 'export CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1' >> ~/.zshrc
source ~/.zshrc
```

#### Windows（PowerShell）

```powershell theme={null}
[System.Environment]::SetEnvironmentVariable("CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS", "1", "User")
```

然後重啟終端。

## 🔍 原理說明（給技術同學）

Claude Code 預設會啟用一些 Beta 特性，例如：

* `cache_control`
* `tool` 擴充套件欄位
* `scope` 等額外引數

這些引數：

* 👉 在 Anthropic 原生 API 支援
* 👉 但在 AWS Bedrock Claude 中會被判定為非法欄位 → 返回 400

關閉該開關後：

* ✔ 請求結構將變為標準格式
* ✔ 與 AWS Claude 完全相容

## 🚨 適用場景

如果你符合以下情況，**強烈建議開啟該變數**：

* 使用 Claude Code + AWS Bedrock Claude
* 使用第三方代理（如 API 閘道 / 轉發服務）
* 出現 400 / ValidationException 錯誤

參考資料：

* Claude 官方文件 - 環境變數：`code.claude.com/docs/zh-CN/env-vars`
* 相關 issue 說明：`github.com/anthropics/claude-code/issues/21676`

## 🔎 如何檢視模型支援的分組

不確定某個模型可以用在哪些分組？可以在模型定價頁面查詢：

開啟 [API易 模型定價頁面](https://api.apiyi.com/modelPricing)，輸入模型名稱，即可檢視該模型的可用分組。

例如：**ClaudeCode 分組** 支援最新的 Claude 模型系列，並單獨配置了 `glm-5.1` 和 `qwen3.7-max`。

## 💡 補充建議

如果設定後仍然報錯，請檢查：

* 環境變數是否真正生效（可在終端執行 `echo $CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS` 確認輸出為 `1`）
* 是否確實在使用 AWS Claude（Bedrock）通道
* 修改配置後是否已重啟終端或 IDE

## 📞 支援

如果問題仍未解決，請提供以下資訊以便進一步排查：

* 報錯截圖
* 請求日誌（Request ID）
* 使用的模型名稱

我們會協助你進一步排查。
