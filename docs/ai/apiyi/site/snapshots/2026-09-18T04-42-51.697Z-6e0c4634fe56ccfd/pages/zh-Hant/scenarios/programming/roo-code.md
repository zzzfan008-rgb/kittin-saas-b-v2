> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Roo Code (VS Code)

> VS Code 中的 AI 開發團隊 - 支援多模式配置的智慧程式設計助手

## 概述

Roo Code 是一款強大的 VS Code AI 程式設計助手外掛，為您提供一個完整的 AI 開發團隊。它最大的特色是**多模式配置**，允許針對不同的開發任務使用不同的 AI 模型，實現最佳的開發效率。

<Card>
  **核心優勢**

  * 🎯 **多模式配置**：為架構、編碼、除錯等不同任務分配專門的模型
  * 🤖 **Agent 智慧體**：自動規劃和執行復雜的開發任務
  * 🔄 **多檔案操作**：理解專案結構，智慧修改多個檔案
  * 💰 **完全免費**：開源免費，只需支付 AI 模型使用費用
  * 🌐 **廣泛相容**：支援 400+ 主流 AI 模型
  * 🔌 **MCP 支援**：通過 Model Context Protocol 連線外部工具
</Card>

<Info>
  **Roo Code vs Cline**

  Roo Code 是 Cline 的一個分支專案，保留了 Cline 的核心功能，同時添加了獨特的多模式配置系統。如果您需要為不同開發階段使用不同模型，Roo Code 是更好的選擇。
</Info>

## 維護狀態與 Responses 端點支援

### 官方已停止更新（2026 年）

Roo Code 團隊已釋出**最後一個版本**，宣佈重心轉向 Roomote（其雲端智慧體平臺）：擴充套件會繼續無限期工作，但**不再有錯誤修復、新功能和模型更新**。官方建議想繼續使用擴充套件形態的使用者關注社群維護的 fork `ZooCode`，或回到其起源專案 [Cline](/zh-Hant/scenarios/programming/cline)。

<img src="https://mintcdn.com/apiyillc/4Btanb2HSbrGHo5H/images/roo-code-final-version-notice.png?fit=max&auto=format&n=4Btanb2HSbrGHo5H&q=85&s=79f576a16c788e343200e409e1cfecf2" alt="Roo Code 最後一個版本公告：擴充套件繼續無限期工作但不再有錯誤修復、新功能或模型更新，官方推薦 ZooCode 與 Cline" style={{maxWidth: "560px"}} width="860" height="706" data-path="images/roo-code-final-version-notice.png" />

<Warning>
  停更的直接影響：「OpenAI」provider 的**預置模型列表止步 `gpt-5.4`**，gpt-5.5 / gpt-5.6 系列等後續新模型無法在下拉中選到。存量功能不受影響。
</Warning>

### 為數不多支援 /v1/responses 的 IDE 外掛（實測可用）

Roo Code 的「OpenAI」provider 走 `/v1/responses` 端點（注意與「OpenAI Compatible」provider 區分，後者走 `/v1/chat/completions`），並支援自定義 Base URL。這讓它成為目前少數能在 IDE 裡跑通 **GPT-5.4「推理 + 工具呼叫」** 的外掛——GPT-5.4 及之後的模型在 chat/completions 上已被 OpenAI 禁止工具與推理同用（詳見 [Responses 原生呼叫指南](/zh-Hant/api-capabilities/openai/native)），而走 responses 不受此限。

配置方式：API Provider 選 **OpenAI**（不是 OpenAI Compatible），Base URL 填 `https://api.apiyi.com/v1`，模型選 `gpt-5.4`。

### 在 Trae 等 VS Code 系 IDE 中安裝使用

Trae 等基於 VS Code 的 IDE 同樣可以安裝 Roo Code 外掛。實測在 Trae 內安裝 Roo Code、按上述方式配置 OpenAI provider 後，Responses 端點的工具呼叫與任務執行均正常——相當於給自定義模型只支援 chat/completions 的 [Trae](/zh-Hant/scenarios/programming/trae) 補上了一條 Responses 通道（模型上限同樣是 `gpt-5.4`）。

<img src="https://mintcdn.com/apiyillc/4Btanb2HSbrGHo5H/images/roo-code-in-trae-responses-test.png?fit=max&auto=format&n=4Btanb2HSbrGHo5H&q=85&s=19bcff9afd8acdb6f3e30b631b2da7a1" alt="在 Trae IDE 中通過 Roo Code 外掛走 Responses 端點執行任務的實測截圖" style={{maxWidth: "480px"}} width="800" height="1548" data-path="images/roo-code-in-trae-responses-test.png" />

## 快速安裝

### 方式一：VS Code 擴充套件商店（推薦）

<Steps>
  <Step title="開啟擴充套件商店">
    在 VS Code 中按 `Ctrl+Shift+X` (Windows/Linux) 或 `Cmd+Shift+X` (macOS)
  </Step>

  <Step title="搜尋安裝">
    搜尋 "Roo Code" 並點選安裝

    **擴充套件 ID**：`RooVeterinaryInc.roo-cline`
  </Step>

  <Step title="開啟外掛">
    安裝完成後，點選左側活動欄的 Roo Code 圖示
  </Step>
</Steps>

### 方式二：Open VSX Registry

訪問 [Open VSX Registry](https://open-vsx.org/) 搜尋 Roo Code 進行安裝。

## 配置 API易

### 基礎配置

<Steps>
  <Step title="開啟設定">
    點選 Roo Code 側邊欄的**齒輪圖示**（設定按鈕）
  </Step>

  <Step title="選擇 API 提供商">
    在 API Provider 下拉選單中選擇 **OpenAI Compatible**
  </Step>

  <Step title="配置連線引數">
    **Base URL**: `https://api.apiyi.com/v1`

    **API Key**: 您的 API易 金鑰（格式：`sk-***`）

    **Model Name**: 輸入您要使用的模型名稱
  </Step>

  <Step title="儲存配置">
    點選儲存，Roo Code 會自動驗證連線
  </Step>
</Steps>

<Warning>
  **Base URL 配置要求**：

  * 必須使用 `https://api.apiyi.com/v1`（包含 `/v1` 路徑）
  * 不要使用 `https://api.apiyi.com`（缺少 `/v1` 會導致連線失敗）
</Warning>

### 獲取 API易 金鑰

<Steps>
  <Step title="訪問 API易 後臺">
    登入 `api.apiyi.com`
  </Step>

  <Step title="建立 API Key">
    進入「令牌管理」頁面（`api.apiyi.com/token`），點選「建立新令牌」
  </Step>

  <Step title="複製金鑰">
    複製生成的 API Key（格式：`sk-***`），並貼上到 Roo Code 配置中
  </Step>
</Steps>

## 多模式配置（核心特性）

Roo Code 的獨特之處在於可以為不同的開發模式分配不同的 AI 模型，實現專業化分工。

### 五大開發模式

<Tabs>
  <Tab title="Architect Mode">
    **架構模式** - 用於系統設計和架構規劃

    **適合模型**：

    * Claude Sonnet（推理能力強，擅長架構設計）
    * GPT-4o（全面的技術知識）
    * DeepSeek V3（深度思考，價效比高）

    **典型任務**：

    ```text theme={null}
    設計一個微服務架構的電商系統：
    - 使用者服務
    - 商品服務
    - 訂單服務
    - 支付服務
    使用 Docker + Kubernetes 部署
    ```
  </Tab>

  <Tab title="Code Mode">
    **編碼模式** - 用於實際程式碼生成和編寫

    **適合模型**：

    * Claude Sonnet（程式碼品質高）
    * DeepSeek Coder（專業程式設計模型）
    * Qwen Coder（中文註釋友好）

    **典型任務**：

    ```text theme={null}
    實現使用者認證模組：
    - JWT token 生成和驗證
    - 密碼加密（bcrypt）
    - 登入/註冊介面
    - 權限中介軟體
    ```
  </Tab>

  <Tab title="Ask Mode">
    **問答模式** - 用於技術諮詢和實現規劃

    **適合模型**：

    * GPT-4o-mini（快速響應，成本低）
    * Gemini Flash（速度快）
    * DeepSeek Chat（價效比高）

    **典型任務**：

    ```text theme={null}
    問：如何最佳化 React 元件的渲染效能？
    問：Redux 和 Zustand 的區別是什麼？
    問：如何處理 Node.js 中的記憶體洩漏？
    ```
  </Tab>

  <Tab title="Debug Mode">
    **除錯模式** - 用於錯誤排查和問題修復

    **適合模型**：

    * GPT-4o（理解複雜錯誤）
    * Claude Sonnet（程式碼分析能力強）
    * DeepSeek V3（深度分析）

    **典型任務**：

    ```text theme={null}
    除錯這個錯誤：
    TypeError: Cannot read property 'map' of undefined

    幫我找出以下程式碼中的記憶體洩漏問題
    分析為什麼這個非同步函式沒有正確執行
    ```
  </Tab>

  <Tab title="Orchestrator Mode">
    **編排模式** - 用於複雜任務的分解和協調

    **適合模型**：

    * Claude Opus（處理複雜任務）
    * GPT-4o（全域性規劃能力強）
    * DeepSeek V3（邏輯推理）

    **典型任務**：

    ```text theme={null}
    將整個專案從 JavaScript 遷移到 TypeScript：
    1. 分析現有程式碼結構
    2. 建立型別定義檔案
    3. 逐步轉換各模組
    4. 更新配置檔案
    5. 執行測試驗證
    ```
  </Tab>
</Tabs>

### 配置多模式

<Steps>
  <Step title="開啟模式設定">
    在 Roo Code 設定中找到 **Mode Configuration** 區域
  </Step>

  <Step title="為每個模式選擇模型">
    可以為每個模式單獨配置：

    * API Provider
    * Model Name
    * Temperature（創造性引數）
    * Max Tokens
  </Step>

  <Step title="切換使用模式">
    在 Roo Code 介面中，通過模式選擇器切換當前使用的模式
  </Step>
</Steps>

<Tip>
  **推薦配置策略**：

  * **Architect/Orchestrator** → 使用高品質模型（Claude Sonnet, GPT-4o）
  * **Code** → 使用專業程式設計模型（DeepSeek Coder, Claude Sonnet）
  * **Ask** → 使用快速經濟模型（GPT-4o-mini, Gemini Flash）
  * **Debug** → 使用分析能力強的模型（Claude Sonnet, GPT-4o）
</Tip>

## 推薦模型

Roo Code 通過 API易 支援 400+ 主流 AI 模型，包括 OpenAI、Google Gemini、Claude、DeepSeek、國產模型等。

<Card title="檢視程式設計開發模型推薦" icon="code" href="/zh-Hant/api-capabilities/model-info">
  檢視最新的程式設計模型推薦、效能對比和使用建議。包括頂級效能模型、高性價比模型、推理增強模型等詳細分類。
</Card>

<Info>
  **為什麼不在此列出具體模型？**

  AI 模型更新迭代速度非常快，為了確保您獲取最準確的模型推薦資訊，我們統一在 [模型推薦頁面](/zh-Hant/api-capabilities/model-info) 維護最新的模型列表、效能資料和使用建議。
</Info>

## 核心功能

### Agent 智慧體模式

Roo Code 最強大的功能是 **Agent 模式**，AI 可以自主規劃和執行復雜任務：

```text theme={null}
任務：建立一個完整的使用者認證系統

Roo Code 會自動：
1. 分析需求，制定實現計劃
2. 建立必要的檔案和目錄結構
3. 編寫後端 API 程式碼
4. 建立前端登入/註冊頁面
5. 新增錯誤處理和驗證
6. 生成單元測試
7. 更新相關文件
```

### 多檔案智慧編輯

理解專案結構，自動修改多個相關檔案：

```text theme={null}
"將所有 API 呼叫從 axios 改為 fetch，並更新錯誤處理邏輯"

Roo Code 會：
- 找到所有使用 axios 的檔案
- 轉換為 fetch API
- 統一錯誤處理模式
- 更新型別定義（如果使用 TypeScript）
```

### 程式碼生成

<CodeGroup>
  ```python Python theme={null}
  # 輸入描述
  """
  建立一個 FastAPI 端點，實現使用者註冊功能：
  - 接收 email 和 password
  - 驗證郵箱格式
  - 密碼加密儲存
  - 返回 JWT token
  """

  # Roo Code 自動生成完整實現
  from fastapi import APIRouter, HTTPException
  from passlib.hash import bcrypt
  import jwt
  # ... 完整的程式碼實現
  ```

  ```javascript JavaScript theme={null}
  // 輸入需求
  // 建立一個 React Hook 用於管理表單狀態
  // 支援驗證、錯誤提示、提交處理

  // Roo Code 生成
  import { useState, useCallback } from 'react';

  export function useForm(initialValues, validationRules) {
    // ... 完整的 Hook 實現
  }
  ```

  ```go Go theme={null}
  // 需求：實現一個併發安全的快取
  // 支援 Set、Get、Delete、清理過期資料

  // Roo Code 生成完整的 Go 程式碼
  package cache

  import (
      "sync"
      "time"
  )

  type Cache struct {
      // ... 完整實現
  }
  ```
</CodeGroup>

### 程式碼審查和最佳化

```text theme={null}
審查這個 PR，關注：
- 程式碼規範
- 效能問題
- 安全漏洞
- 潛在 bug
- 可讀性改進
```

Roo Code 會提供詳細的審查報告和改進建議。

### 智慧重構

```text theme={null}
重構這個函式，要求：
- 提高可讀性
- 最佳化效能
- 新增錯誤處理
- 改進型別安全
```

### 測試生成

```text theme={null}
為 UserService 類生成完整的單元測試，包括：
- 正常流程測試
- 邊界條件測試
- 錯誤處理測試
- Mock 外部依賴
```

## 常用命令

Roo Code 提供了豐富的命令面板命令：

| 命令                      | 快捷鍵              | 功能        |
| ----------------------- | ---------------- | --------- |
| Roo Code: New Task      | `Ctrl+Shift+L`   | 開始新任務     |
| Roo Code: Continue      | `Enter`          | 繼續當前任務    |
| Roo Code: Approve       | `Ctrl+Enter`     | 批准 AI 的更改 |
| Roo Code: Reject        | `Ctrl+Backspace` | 拒絕更改      |
| Roo Code: Clear History | -                | 清除對話歷史    |
| Roo Code: Switch Mode   | -                | 切換開發模式    |

<Tip>
  **快捷鍵提示**：可以在 VS Code 的鍵盤快捷方式設定中自定義 Roo Code 的快捷鍵。
</Tip>

## 高階功能

### API Configuration Profiles

為不同專案或團隊建立不同的 API 配置檔案：

```json theme={null}
{
  "roocode.apiProfiles": {
    "production": {
      "provider": "OpenAI Compatible",
      "baseUrl": "https://api.apiyi.com/v1",
      "apiKey": "sk-prod-key",
      "defaultModel": "claude-sonnet-4"
    },
    "development": {
      "provider": "OpenAI Compatible",
      "baseUrl": "https://api.apiyi.com/v1",
      "apiKey": "sk-dev-key",
      "defaultModel": "deepseek-chat"
    }
  }
}
```

### Codebase Indexing

Roo Code 會自動索引您的程式碼庫，理解專案結構：

* 自動發現檔案關係
* 理解程式碼依賴
* 智慧上下文感知
* 跨檔案引用追蹤

### MCP 整合

通過 Model Context Protocol 連線外部工具：

* 資料庫查詢
* API 呼叫
* 檔案系統操作
* Git 操作
* 自定義工具整合

### 自定義提示詞模板

在設定中配置常用的提示詞模板：

```json theme={null}
{
  "roocode.customTemplates": {
    "codeReview": "詳細審查程式碼，關注效能、安全、可維護性",
    "optimize": "最佳化程式碼效能和可讀性，新增必要的註釋",
    "test": "生成全面的單元測試，覆蓋邊界情況",
    "refactor": "重構程式碼，遵循 SOLID 原則和設計模式"
  }
}
```

## 使用技巧

### 1. 提供清晰的上下文

<CardGroup cols={2}>
  <Card title="❌ 模糊描述" icon="x">
    "最佳化這個函式"
  </Card>

  <Card title="✅ 清晰描述" icon="check">
    "最佳化這個函式的效能，重點關注迴圈效率和記憶體使用，新增適當的註釋說明最佳化思路"
  </Card>
</CardGroup>

### 2. 分步驟執行復雜任務

對於複雜任務，建議分解為多個步驟：

<Steps>
  <Step title="第一步：架構設計">
    使用 **Architect Mode** 設計整體架構
  </Step>

  <Step title="第二步：模組實現">
    切換到 **Code Mode** 實現各個模組
  </Step>

  <Step title="第三步：除錯最佳化">
    使用 **Debug Mode** 排查問題
  </Step>

  <Step title="第四步：整合測試">
    使用 **Orchestrator Mode** 協調整合
  </Step>
</Steps>

### 3. 利用模式切換

針對不同任務型別切換最合適的模式：

* 需要設計架構？→ Architect Mode
* 寫程式碼實現？→ Code Mode
* 快速諮詢？→ Ask Mode
* 遇到 Bug？→ Debug Mode
* 複雜重構？→ Orchestrator Mode

### 4. 審查和批准更改

<Warning>
  **重要習慣**：

  * 始終審查 AI 生成的程式碼再批准
  * 理解每個更改的目的
  * 測試修改後的功能
  * 保持程式碼庫的一致性
</Warning>

## 常見問題

<AccordionGroup>
  <Accordion title="Roo Code 和 Cline 有什麼區別？">
    **主要區別**：

    1. **多模式配置**：Roo Code 的核心特性，Cline 不支援
    2. **程式碼庫**：Roo Code 是 Cline 的 Fork，但在獨立開發
    3. **更新頻率**：Roo Code 更新更頻繁，功能迭代快
    4. **社群**：兩者都有活躍的社群，但側重點不同

    **如何選擇**：

    * 需要多模式？→ Roo Code
    * 需要穩定性？→ Cline
    * 都可以免費試用，選擇最適合自己的
  </Accordion>

  <Accordion title="為什麼連線失敗或無法使用模型？">
    **常見原因和解決方案**：

    1. **Base URL 錯誤**：
       * ✅ 正確：`https://api.apiyi.com/v1`
       * ❌ 錯誤：`https://api.apiyi.com`

    2. **API Key 無效**：
       * 檢查 Key 是否正確複製（注意首尾空格）
       * 確認賬戶餘額充足
       * 驗證 Key 狀態為「啟用」

    3. **模型名稱錯誤**：
       * 確保使用正確的模型名稱
       * 參考[模型列表](/zh-Hant/api-capabilities/model-info)

    4. **網路問題**：
       * 檢查網路連線
       * 嘗試重啟 VS Code
  </Accordion>

  <Accordion title="如何為不同模式配置不同的模型？">
    **配置步驟**：

    1. 開啟 Roo Code 設定（齒輪圖示）
    2. 找到 **Mode Configuration** 區域
    3. 為每個模式單獨設定：
       * Architect Mode → `claude-sonnet-4`
       * Code Mode → `deepseek-coder`
       * Ask Mode → `gpt-4o-mini`
       * Debug Mode → `claude-sonnet-4`
       * Orchestrator Mode → `gpt-4o`
    4. 儲存配置

    在使用時，通過模式選擇器切換即可。
  </Accordion>

  <Accordion title="Roo Code 會自動修改我的程式碼嗎？">
    **不會自動修改**，需要您的批准：

    1. Roo Code 會先展示建議的更改
    2. 您可以：
       * 檢視 Diff（差異對比）
       * 批准（Apply）更改
       * 拒絕（Reject）更改
       * 修改後再批准
    3. 所有更改都在您的控制之下

    <Tip>
      建議啟用版本控制（Git），這樣可以隨時回退不滿意的更改。
    </Tip>
  </Accordion>

  <Accordion title="如何節省 API 使用成本？">
    **省錢策略**：

    1. **智慧選擇模型**：
       * 簡單任務用便宜的模型（GPT-4o-mini, DeepSeek）
       * 複雜任務才用高階模型（Claude Opus, GPT-4o）

    2. **利用多模式配置**：
       * Ask Mode → 用最便宜的模型
       * Code/Debug Mode → 用中等價位的專業模型
       * Architect Mode → 僅在需要時用高階模型

    3. **充值優惠**：
       * API易 提供充值加贈（10%-20%）
       * 檢視[充值活動](/zh-Hant/faq/recharge-promotions)

    4. **控制上下文長度**：
       * 清除不必要的對話歷史
       * 專注當前任務，減少無關上下文
  </Accordion>

  <Accordion title="Roo Code 支援哪些程式語言？">
    **幾乎所有主流程式語言**，包括但不限於：

    * **Web**: JavaScript, TypeScript, HTML, CSS, React, Vue, Angular
    * **後端**: Python, Java, Go, Rust, C++, C#, PHP, Ruby
    * **移動**: Swift, Kotlin, Dart (Flutter), React Native
    * **資料**: SQL, R, Julia
    * **其他**: Shell, YAML, JSON, Markdown

    效果取決於：

    * 選擇的 AI 模型
    * 模型的訓練資料
    * 語言的流行程度
  </Accordion>
</AccordionGroup>

## 對比其他工具

| 特性           | Roo Code | Cline | Cursor | GitHub Copilot |
| ------------ | -------- | ----- | ------ | -------------- |
| **多模式配置**    | ✅        | ❌     | ❌      | ❌              |
| **Agent 模式** | ✅        | ✅     | ❌      | ❌              |
| **多檔案編輯**    | ✅        | ✅     | 部分     | ❌              |
| **自定義 API**  | ✅        | ✅     | ✅      | ❌              |
| **免費開源**     | ✅        | ✅     | ❌      | ❌              |
| **模型選擇**     | 400+     | 400+  | 有限     | GitHub 獨家      |
| **學習曲線**     | 中等       | 中等    | 低      | 低              |

<Tip>
  **選擇建議**：

  * **需要多模式配置** → Roo Code
  * **需要穩定成熟** → Cline
  * **需要簡單易用** → Cursor
  * **GitHub 深度整合** → GitHub Copilot
</Tip>

## 價格說明

Roo Code 外掛本身**完全免費**，您只需支付 AI 模型的使用費用。

通過 API易 使用 AI 模型的費用取決於您選擇的模型和使用量。

<Card title="檢視詳細價格" icon="dollar-sign" href="/zh-Hant/api-capabilities/model-info">
  檢視所有模型的詳細定價和價效比對比
</Card>

<Info>
  API易 提供充值優惠：充值越多，加贈比例越高（10%-20%）。首次充值還可獲得額外加贈。檢視 [充值活動詳情](/zh-Hant/faq/recharge-promotions)。
</Info>

## 相關資源

* [Roo Code 官方網站](https://roo-code.net/)
* [Roo Code 官方文件](https://docs.roocode.com/)
* [GitHub 倉庫](https://github.com/RooCodeInc/Roo-Code)
* [VS Code 擴充套件商店](https://marketplace.visualstudio.com/items?itemName=RooVeterinaryInc.roo-cline)
* [API易 快速開始](/zh-Hant/getting-started)
* [模型推薦和價格](/zh-Hant/api-capabilities/model-info)

## 獲取幫助

<CardGroup cols={2}>
  <Card title="企業微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企業微信客服二維碼" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    掃碼新增 或 [點選聯絡客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    配置問題、使用指導
  </Card>

  <Card title="郵件諮詢" icon="mail">
    **客服郵箱**：[support@apiyi.com](mailto:support@apiyi.com)

    **商務合作**：[business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>

<Tip>
  **快速上手**：按照本文的「快速安裝」和「配置 API易」章節，5 分鐘即可開始使用 Roo Code 進行 AI 輔助程式設計！
</Tip>
