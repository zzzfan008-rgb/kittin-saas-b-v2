> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Cline (VS Code)

> VS Code 中的 AI 程式設計助手整合指南

# Cline (VS Code)

Cline（原 Claude Dev）是一款強大的 VS Code AI 程式設計助手外掛，支援多種 AI 模型。通過 API易，您可以靈活切換使用各種主流 AI 模型輔助程式設計。

## 快速安裝

### 1. 安裝外掛

在 VS Code 擴充套件商店搜尋 "Cline" 並安裝

### 2. 配置 API易

1. 點選左側的 Cline 圖示
2. 點選設定按鈕（齒輪圖示）
3. 選擇 **OpenAI Compatible**
4. 配置引數：
   * **Base URL**：`https://api.apiyi.com/v1`
   * **API Key**：您的 API易 金鑰
   * **Model Name**：輸入模型名稱

### 推薦模型

Cline 通過 API易 支援 400+ 主流 AI 模型，包括 OpenAI、Google Gemini、Claude、DeepSeek、國產模型等。

<Card title="檢視程式設計開發模型推薦" icon="code" href="/zh-Hant/api-capabilities/model-info">
  檢視最新的程式設計模型推薦、效能對比和使用建議。包括頂級效能模型、高性價比模型、推理增強模型等詳細分類。
</Card>

<Info>
  **為什麼不在此列出具體模型？**

  AI 模型更新迭代速度非常快，為了確保您獲取最準確的模型推薦資訊，我們統一在 [模型推薦頁面](/zh-Hant/api-capabilities/model-info) 維護最新的模型列表、效能資料和使用建議。
</Info>

## 核心功能

### 智慧程式碼補全

```python theme={null}
# 輸入註釋，AI 自動生成程式碼
# 計算斐波那契數列的第 n 項
def fibonacci(n):
    # Cline 會自動補全實現
```

### 程式碼解釋

選中程式碼片段，使用：

* `Cline: Explain Code`：解釋程式碼
* `Cline: Explain Error`：解釋錯誤

### 程式碼重構

* **最佳化效能**：提供效能最佳化建議
* **改進可讀性**：重構複雜程式碼
* **修復問題**：自動修復常見問題

### 生成測試

```javascript theme={null}
// 原始函式
function add(a, b) {
    return a + b;
}

// Cline 生成的測試
describe('add function', () => {
    test('should add two numbers correctly', () => {
        expect(add(2, 3)).toBe(5);
        expect(add(-1, 1)).toBe(0);
    });
});
```

## 常用命令

| 命令              | 快捷鍵            | 功能    |
| --------------- | -------------- | ----- |
| Cline: Ask      | `Ctrl+Shift+L` | 詢問 AI |
| Cline: Explain  | `Ctrl+Shift+E` | 解釋程式碼 |
| Cline: Refactor | `Ctrl+Shift+R` | 重構程式碼 |
| Cline: Generate | `Ctrl+Shift+G` | 生成程式碼 |

## 高階功能

### 多檔案操作

Cline 可以理解和操作多個相關檔案：

```bash theme={null}
"將 utils.js 中的函式移動到 helpers.js，並更新所有引用"
```

### 架構設計

生成專案架構：

```text theme={null}
請為電商後臺管理系統設計架構，包含：
- 使用者管理
- 商品管理
- 訂單處理
- 資料分析
使用 React + Node.js + PostgreSQL
```

### 程式碼審查

```text theme={null}
Review PR:
- 檢查程式碼規範
- 發現潛在 bug
- 效能最佳化建議
- 安全漏洞掃描
```

## 使用技巧

### 1. 上下文管理

提供更好的上下文：

```typescript theme={null}
// @context: React 元件用於使用者認證
// @requirements: 支援 OAuth2 登入流程
// @constraints: 相容 NextJS 13+

// AI 基於上下文生成更準確的程式碼
```

### 2. 自定義提示詞

在設定中配置：

```json theme={null}
{
    "cline.customPrompts": {
        "codeReview": "審查程式碼，關注效能、安全、規範",
        "optimize": "最佳化程式碼效能和可讀性",
        "document": "生成詳細的中文文件"
    }
}
```

### 3. 專案級配置

建立 `.cline/config.json`：

```json theme={null}
{
    "model": "claude-3-5-sonnet-20241022",
    "temperature": 0.7,
    "language": "zh-CN",
    "codeStyle": {
        "naming": "camelCase",
        "indent": 4,
        "quotes": "single"
    }
}
```

## 故障排除

### 連線失敗

檢查配置：

* Base URL：`https://api.apiyi.com/v1`
* API 金鑰是否有效
* 網路連線是否正常

### 響應超時

解決方案：

1. 使用更快的模型
2. 減少請求複雜度
3. 分解大任務

### 生成品質差

改進方法：

1. 提供更多上下文
2. 使用更強大的模型
3. 明確指定需求

### 呼叫 gpt-5.6 / gpt-5.5 / gpt-5.4 報 400

報錯 `Function tools with reasoning_effort are not supported for ... in /v1/chat/completions`（400）是 OpenAI 從 GPT-5.4 系列起的官方限制：`/v1/chat/completions` 上工具呼叫不能與非 `none` 的 `reasoning_effort` 同用。Cline 的 OpenAI Compatible 方式固定走 chat/completions 端點，暫不支援 `/v1/responses`，客戶端側無法繞過。這條限制的來龍去脈見 [端點選型與遷移](/zh-Hant/api-capabilities/openai/responses-migration)。

解決辦法：

1. 改用不受限模型：`gpt-5.1` / `gpt-5.2`、Claude、Gemini、DeepSeek 等
2. 換用支援 Responses 端點的客戶端，完整支援清單見 [OpenAI Responses API 原生呼叫指南](/zh-Hant/api-capabilities/openai/native)

## 最佳實踐

### 1. 模型選擇策略

根據不同的程式設計任務型別，選擇合適的模型可以提高效率並降低成本。

<Card title="檢視程式設計場景模型推薦" icon="lightbulb" href="/zh-Hant/api-capabilities/model-info">
  檢視針對不同程式設計場景的模型推薦，包括程式碼生成、複雜推理、程式碼審查、快速響應等場景的最佳模型選擇。
</Card>

### 2. 提示詞最佳化

```text theme={null}
❌ 不好的提示：修復這個函式

✅ 好的提示：修復 calculateTotal 函式中的浮點數精度問題，
確保金額計算準確到小數點後兩位
```

### 3. 漸進式開發

1. 先生成基礎框架
2. 逐步新增功能
3. 最後最佳化效能
4. 新增錯誤處理

### 4. 安全意識

* 不在程式碼中包含敏感資訊
* 審查 AI 生成的程式碼
* 驗證第三方依賴
* 注意安全漏洞

## 整合工作流

### Git 整合

```bash theme={null}
# 自動生成 commit message
git add .
# Cline: 根據改動生成 commit message
```

### 測試驅動開發

1. 先寫測試用例
2. Cline 生成實現程式碼
3. 執行測試驗證
4. 迭代最佳化

### CI/CD 整合

生成配置檔案：

```yaml theme={null}
# Cline 可以生成 GitHub Actions 配置
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: npm test
```

## Token 最佳化與成本控制

### 1. 監控 Token 使用

* **即時監控**：在 Cline 側邊欄檢視估算成本
* **會話限制**：保持會話簡短，避免上下文累積
* **定期重置**：長任務分多個會話完成

### 2. 智慧模型切換

```text theme={null}
規劃階段 → DeepSeek-R1 或 o3（推理能力強，成本低）
實現階段 → Claude-4-Sonnet 或 o4-mini（程式設計能力最強）
簡單任務 → GPT-3.5-Turbo 或 Gemini-2.5-Flash（速度快）
長文本 → Gemini-2.5-Pro（2M 上下文）
```

### 3. 使用 .clinerules 配置

建立專案根目錄下的 `.clinerules` 檔案：

```text theme={null}
# 限制 Cline 操作範圍
- 不允許修改 node_modules
- 不允許刪除重要檔案
- 限制單次修改檔案數量
- 要求確認破壞性操作
```

### 4. 替代方案降低成本

#### GitHub Copilot Pro 整合

* 月費僅 \$10，無限使用
* 通過 VSCode LM API 使用
* 適合高頻使用場景

#### 本地模型 (Ollama)

```bash theme={null}
# 安裝 Ollama 並執行本地模型
ollama run deepseek-coder:6.7b
ollama run qwen2.5-coder:7b
ollama run codellama:13b
```

#### 使用國產模型降低成本

* `qwen-turbo`（阿里通義千問）
* `glm-4`（智譜清華系）
* `ernie-4.0`（百度文心一言）

### 5. 快取最佳化

* 使用 Requesty Router 等服務
* 可節省超過 50% 的 API 成本
* 自動快取重複請求

## 最佳實踐進階

### 1. Plan/Act 模式使用

* **Plan 模式**：用於設計和審查，只讀不改
* **Act 模式**：直接實現，適合簡單任務
* **模型記憶**：Cline 會記住每種模式的模型偏好

### 2. 上下文管理技巧

```typescript theme={null}
// 明確的上下文註釋
// @context: React 18 + TypeScript 5
// @requirements: 支援 SSR，相容 Next.js 14
// @constraints: 不使用外部狀態管理庫
// @performance: 首屏載入 < 3s
```

### 3. 任務管理系統

* **收藏重要對話**：使用星標功能
* **匯出有價值內容**：儲存為 Markdown
* **任務排序**：按成本、Token 使用量排序
* **批次清理**：定期清理低價值會話

### 4. 避免 Token 爆炸

```text theme={null}
❌ 錯誤做法：
- 在同一會話中處理多個無關任務
- 讓 Cline 讀取整個大型程式碼庫
- 不斷修改需求導致上下文混亂

✅ 正確做法：
- 每個功能開新會話
- 只包含相關檔案
- 明確需求後再開始
- 完成後立即提交程式碼
```

### 5. 成本效益分析

| 場景      | 傳統開發時間 | Cline 成本 | 時間節省   | ROI |
| ------- | ------ | -------- | ------ | --- |
| CRUD 模組 | 4 小時   | \$5-10   | 3.5 小時 | 極高  |
| 複雜重構    | 2 天    | \$20-50  | 1.5 天  | 高   |
| 架構設計    | 1 周    | \$50-100 | 5 天    | 高   |

### 6. 工作流最佳化

```bash theme={null}
# 1. 規劃階段（使用推理模型）
"使用 o3 或 DeepSeek-R1 分析需求並制定架構方案"

# 2. 實現階段（使用程式設計專精模型）
"切換到 Claude-4-Sonnet 或 o4-mini 實現核心功能"

# 3. 測試最佳化（使用快速模型）
"使用 Gemini-2.5-Flash 或 GPT-3.5-Turbo 進行單元測試和最佳化"

# 4. 文件階段（使用綜合模型）
"使用 GPT-4.1 或 Qwen-Max 生成專案文件"

# 5. 程式碼審查（使用長上下文模型）
"使用 Gemini-2.5-Pro 進行全面的程式碼審查"
```

## 效能最佳化

### 1. 模型切換

根據任務選擇模型：

* 開發階段：輕量模型
* 複雜任務：高階模型
* 生產環境：平衡效能和成本

### 2. 快取策略

* 啟用響應快取
* 快取常用程式碼片段
* 定期清理快取

### 3. 請求最佳化

* 批次處理相關請求
* 使用流式響應
* 設定合理超時

需要更多幫助？請檢視 [詳細整合文件](/zh-Hant/scenarios/programming/cline)。
