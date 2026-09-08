> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Cursor

> AI 驅動的程式碼編輯器整合指南

# Cursor

Cursor 是一款 AI 驅動的程式碼編輯器，通過整合 API易，您可以在編寫程式碼時獲得強大的 AI 輔助功能。

## 快速配置

### 1. 開啟設定

點選右上角的齒輪圖示 ⚙️，選擇 **Models** 選項

### 2. 配置 API

* **OpenAI API Key**：輸入您的 API易 金鑰（直接用預設令牌即可）
* **Override OpenAI Base URL**：勾選並輸入 `https://api.apiyi.com/v1`
* 點選 **Verify** 驗證配置

<img src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/cursor-setting.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=47cf7afe1c00e511395e34cc033b877e" alt="Cursor 配置介面" width="2066" height="990" data-path="images/cursor-setting.png" />

### 3. 模型配置

<Warning>
  **重要說明**：Cursor 目前**不支援 Agent 模式**，只能使用 Chat 聊天對話模式。您可以在對話過程中讓 AI 生成程式碼，然後手動應用到實際程式碼中。

  如果您是新手並且非常依賴 Agent 模式進行 Vibe Coding，建議：

  * 購買 Cursor 官方會員使用其原生服務
  * 或使用替代方案：VS Code 的 **RooCode** 或 **Cline** 外掛（支援 Agent 模式）
</Warning>

#### 推薦模型配置

Cursor 通過 API易 支援 400+ 主流 AI 模型，包括 OpenAI、Google Gemini、Claude、DeepSeek 等。

<Card title="檢視程式設計開發模型推薦" icon="code" href="/zh-Hant/api-capabilities/model-info">
  檢視最新的程式設計模型推薦、效能對比和使用建議。包括頂級效能模型、高性價比模型、推理增強模型等詳細分類。
</Card>

<Info>
  **為什麼不在此列出具體模型？**

  AI 模型更新迭代速度非常快，為了確保您獲取最準確的模型推薦資訊，我們統一在 [模型推薦頁面](/zh-Hant/api-capabilities/model-info) 維護最新的模型列表、效能資料和使用建議。
</Info>

## 使用模式說明

### Chat 模式工作流程

由於 Cursor 不支援 Agent 模式，推薦以下工作流程：

1. **對話生成程式碼**
   * 使用 `Ctrl/Cmd + L` 開啟聊天
   * 描述您的需求，讓 AI 生成程式碼
   * 檢視生成的程式碼片段

2. **手動應用程式碼**
   * 從聊天視窗複製程式碼
   * 貼上到目標檔案
   * 或使用 "Apply" 按鈕（如果可用）

3. **迭代最佳化**
   * 繼續對話要求修改
   * 重複應用過程

### 替代方案對比

| 工具                     | Agent 模式 | 優勢                  | 劣勢         |
| ---------------------- | -------- | ------------------- | ---------- |
| **Cursor**             | ❌        | 介面優雅，補全體驗好          | 無 Agent 模式 |
| **Cline (VS Code)**    | ✅        | 完整 Agent 功能，可自動修改檔案 | 需要 VS Code |
| **RooCode (VS Code)**  | ✅        | Agent 模式，支援多檔案編輯    | 較新，功能還在完善  |
| **Continue (VS Code)** | ✅        | 開源，可定製性強            | 配置較複雜      |

## 核心功能

### 智慧程式碼補全

* **Tab 補全**：按 Tab 接受 AI 建議
* **多行補全**：支援函式級別的程式碼生成
* **上下文感知**：基於專案結構提供建議

### AI 對話

* **Ctrl/Cmd + K**：開啟命令面板
* **Ctrl/Cmd + L**：側邊欄對話
* **程式碼解釋**：選中程式碼後詢問 AI

### 程式碼編輯

* **生成程式碼**：描述需求，AI 自動生成
* **重構建議**：獲取最佳化建議
* **錯誤修復**：AI 協助定位和修復錯誤

## 快捷鍵

| 快捷鍵            | 功能      |
| -------------- | ------- |
| `Ctrl/Cmd + K` | AI 命令面板 |
| `Ctrl/Cmd + L` | AI 對話   |
| `Tab`          | 接受程式碼建議 |
| `Esc`          | 取消建議    |

## 使用技巧

### 1. 提供清晰的上下文

```javascript theme={null}
// @context: React元件，用於使用者認證
// @requirements: 需要支援OAuth2登入
// @constraints: 相容NextJS 13+

// AI會基於這些資訊生成更準確的程式碼
```

### 2. 最佳化提示詞

```
// 不好的提示
"修復這個函式"

// 好的提示
"修復calculateTotal函式中的浮點數精度問題，確保金額計算準確到小數點後兩位"
```

### 3. 充分利用 Chat 模式

雖然沒有 Agent 模式，但可以：

* 讓 AI 生成完整的檔案內容
* 要求 AI 提供詳細的修改說明
* 使用 AI 進行程式碼審查和重構建議

## 故障排除

### 連線超時

1. 檢查網路連線
2. 確認 API 地址：`https://api.apiyi.com/v1`
3. 驗證 API 金鑰有效性

### 模型不響應

1. 檢查賬戶餘額
2. 嘗試切換模型
3. 重啟 Cursor

### 程式碼建議品質差

1. 提供更多專案上下文
2. 使用更具體的提示詞
3. 嘗試不同模型

## 最佳實踐

### 專案級配置

在專案根目錄建立 `.cursor-settings.json`：

```json theme={null}
{
  "model": "gpt-4.1",
  "temperature": 0.7,
  "contextFiles": ["README.md", "package.json"],
  "rules": [
    "使用TypeScript嚴格模式",
    "遵循ESLint規範",
    "新增適當的註釋"
  ]
}
```

### 程式碼規範

在提示中明確程式碼規範：

* 使用 TypeScript
* 遵循 Airbnb 規範
* 新增 JSDoc 註釋
* 使用函式式風格

### 安全意識

* 不在程式碼中包含敏感資訊
* 審查 AI 生成的程式碼
* 驗證第三方依賴安全性

## 整合工作流

### Git 整合

```bash theme={null}
# AI 生成 commit message
git add .
# 使用 Cursor AI 生成描述性的提交資訊
```

### 測試驅動開發

1. 先寫測試用例
2. 讓 AI 生成實現程式碼
3. 執行測試驗證
4. 迭代最佳化

### 程式碼審查

使用 AI 進行程式碼審查：

```
請審查這段程式碼，關注：
1. 效能問題
2. 安全漏洞  
3. 程式碼規範
4. 最佳實踐
```

## 需要 Agent 模式？

如果您需要 AI 能夠自動修改多個檔案、執行復雜的重構任務，推薦檢視：

<CardGroup cols={2}>
  <Card title="Cline" icon="bot" href="/zh-Hant/scenarios/programming/cline">
    VS Code 中功能完整的 AI Agent，支援自動修改檔案
  </Card>

  <Card title="RooCode" icon="code" href="https://marketplace.visualstudio.com/items?itemName=roocode.roocode">
    新興的 VS Code AI Agent 外掛，支援多檔案編輯
  </Card>
</CardGroup>

<Info>
  **提示**：如果您是 Vibe Coding 愛好者，需要 AI 自主完成複雜程式設計任務，建議使用支援 Agent 模式的工具，或考慮購買 Cursor 官方會員以獲得完整體驗。
</Info>

需要更多幫助？請訪問 [API易官網](https://api.apiyi.com) 獲取支援。
