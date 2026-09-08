> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Chatbox AI

> 跨平臺 AI 客戶端應用整合指南

Chatbox AI 是一個功能強大的跨平臺 AI 客戶端應用，支援多種大語言模型和 API。通過 API易，您可以在 Chatbox 中訪問各種主流 AI 模型，享受本地儲存的隱私保護。

## 快速開始

### 下載安裝

Chatbox AI 支援多平臺安裝：

* **桌面版**：Windows、macOS、Linux
* **移動版**：iOS、Android
* **網頁版**：直接通過瀏覽器訪問

訪問 [Chatbox AI 官網](https://chatboxai.app/en) 下載適合您平臺的版本。

### 配置 API易

#### 步驟 1：開啟設定

1. 啟動 Chatbox AI 應用
2. 點選左下角的設定圖示（⚙️）
3. 進入"模型配置"介面

#### 步驟 2：新增自定義提供商

<img src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/chatbox-setting.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=dd787d3ef7889fbe04f9d2c3143b5cc5" alt="Chatbox AI 設定介面 - API易配置示例" width="2708" height="1536" data-path="images/chatbox-setting.png" />

按照上圖所示的配置介面，完成以下設定步驟：

1. 在"模型提供商"部分點選 **+ 新增** 按鈕

2. 填寫提供商資訊：
   * **名稱**：API易（可自定義名稱）
   * **API 模式**：選擇 **OpenAI API 相容**
   * **API 金鑰**：輸入您的 API易 金鑰
   * **API 主機**：`https://api.apiyi.com/v1`
   * **API 路徑**：`/chat/completions`（預設值）

3. **高階配置**（可選）：
   * 啟用"改善網路相容性"選項（如圖所示）
   * 可配置影像生成專用端點

<Info>
  **配置要點**

  * API 主機欄位對應 Base URL，必須包含 `/v1` 字尾
  * API 路徑欄位用於指定具體的端點路徑
  * API 金鑰可在 [API易控制台](https://api.apiyi.com) 獲取
  * 配置完成後點選右下角的 **+ 新建** 按鈕新增模型
</Info>

#### 步驟 3：選擇模型

配置完成後，在聊天介面可以選擇模型。

## 支援的模型

Chatbox AI 通過 API易 支援 400+ 主流 AI 模型，包括 OpenAI、Google Gemini、Claude、DeepSeek、國產模型等。

<Card title="檢視當下熱門模型推薦" icon="star" href="/zh-Hant/api-capabilities/model-info">
  檢視最新的模型推薦、效能對比和場景化使用建議。涵蓋文本創作、程式設計開發、快速響應、影像生成、影片生成等全場景。
</Card>

<Info>
  **為什麼不在此列出具體模型？**

  AI 模型更新迭代速度非常快，為了確保您獲取最準確的模型推薦資訊，我們統一在 [模型推薦頁面](/zh-Hant/api-capabilities/model-info) 維護最新的模型列表、效能資料和使用建議。
</Info>

## 核心功能

### 多平臺同步

Chatbox AI 的核心優勢：

* **本地儲存**：資料完全儲存在本地，保護隱私
* **跨平臺訪問**：在不同裝置間切換使用
* **離線功能**：部分功能支援離線使用

### 對話管理

**智慧對話功能**：

* 多輪對話上下文保持
* 對話歷史搜尋和管理
* 對話匯出（Markdown、PDF）
* 提示詞庫和訊息引用

### 文件處理

**文件理解能力**：

* PDF、TXT、DOCX 文件上傳
* 圖片理解和分析
* LaTeX 和 Markdown 渲染
* 程式碼高亮和預覽

### 影像生成

**AI 影像創作**：

* 支援 DALL-E 系列模型影像生成
* 可配置專用影像生成端點
* 支援多種影像尺寸和風格
* 批次影像生成功能

**配置影像生成**：

1. 在設定中新增影像生成專用提供商
2. 使用標準 `/images/generations` 端點
3. 在聊天中直接描述影像需求
4. 系統自動呼叫影像生成API

### 進階設定

**引數調節**：

```yaml theme={null}
對話引數設定:
  - Temperature: 0.7        # 創造性控制（推理模型 GPT-5 只能用 1）
  - Max Tokens: 4096       # 最大輸出長度
  - Top P: 0.9            # 取樣引數（推理模型 gpt-5 只能用 1）
  - Context Length: 8192   # 上下文長度
```

## 使用技巧

### 提示詞最佳化

Chatbox AI 內建提示詞庫，您也可以建立自定義提示詞：

```markdown theme={null}
# 程式設計助手
你是一位經驗豐富的軟體工程師，請幫我：
- 編寫高品質程式碼
- 解釋複雜概念
- 提供最佳實踐建議

# 輸出格式
請使用程式碼塊格式化程式碼，並提供詳細註釋。
```

### 隱私保護

Chatbox AI 採用"隱私設計"理念：

* 資料本地儲存，不上傳雲端
* 支援自建 API 端點
* 可完全離線使用（配合本地模型）

## 高階配置

### 自定義 API 端點

除了基本的聊天功能，您還可以配置專用的影像生成端點：

#### 聊天完成端點配置

```yaml theme={null}
基礎聊天配置:
  提供商名稱: API易
  API模式: OpenAI API Compatible
  API金鑰: sk-your-apiyi-key
  API主機: https://api.apiyi.com/v1
  API路徑: /chat/completions
```

#### 影像生成端點配置

**方式一：使用專屬 Image API**

```yaml theme={null}
影像生成配置:
  提供商名稱: API易-影像
  API模式: OpenAI API Compatible
  API金鑰: sk-your-apiyi-key
  API主機: https://api.apiyi.com/v1
  API路徑: /images/generations  # 標準影像生成端點
  模型適用：gpt-image-1、flux-kontext-pro
```

**方式二：使用 Responses 端點**

```yaml theme={null}
Responses配置:
  提供商名稱: API易-Responses
  API模式: OpenAI API Compatible
  API金鑰: sk-your-apiyi-key
  API主機: https://api.apiyi.com
  API路徑: /v1/responses  # 通用響應端點
```

<Tip>
  **端點選擇建議**

  * 常規對話：使用 `/chat/completions` 端點
  * 逆向生成圖片的模型，比如 sora\_image：使用 `/chat/completions` 端點
  * 影像生成：優先使用 `/images/generations` 標準端點
  * 特殊需求：可使用 `gpt-image-1` 或 `/v1/responses` 端點
  * 在 Chatbox 中，"API路徑"欄位對應具體的端點路徑
</Tip>

### 網路代理設定

如需使用代理訪問：

1. 進入設定 > 網路配置
2. 配置 HTTP/HTTPS 代理
3. 設定代理認證（如需要）

### 快捷鍵設定

常用快捷鍵：

* `Ctrl/Cmd + N`：新建對話
* `Ctrl/Cmd + T`：切換模型
* `Ctrl/Cmd + /`：顯示命令面板
* `Ctrl/Cmd + K`：快速搜尋

## 移動端配置

### iOS/Android 配置

移動端配置與桌面版相同：

1. 下載 Chatbox AI 移動應用
2. 進入設定 > 模型配置
3. 新增 API易 自定義提供商
4. 配置相同的 API Base URL 和金鑰

### 移動端特色功能

* **語音輸入**：支援語音轉文字
* **相機整合**：直接拍照進行影像分析
* **離線快取**：對話歷史離線可用
* **推送通知**：重要訊息提醒

## 故障排除

### 常見問題

**連線失敗**

* 檢查 API Base URL：`https://api.apiyi.com/v1`
* 驗證 API 金鑰有效性
* 確認網路連線正常

**模型不顯示**

* 等待模型列表自動重新整理
* 手動點選"重新整理模型"按鈕
* 檢查 API 金鑰權限

**響應速度慢**

* 嘗試切換到更快的模型
* 檢查網路延遲
* 減少上下文長度

### 日誌除錯

啟用除錯模式：

1. 設定 > 進階選項
2. 開啟"除錯模式"
3. 檢視詳細日誌資訊

### 資料備份

定期備份對話資料：

1. 設定 > 資料管理
2. 匯出對話歷史
3. 備份配置檔案

## 最佳實踐

### 效能最佳化

1. **合理選擇模型**
   * 根據任務複雜度選擇合適的模型
   * 檢視 [模型推薦頁面](/zh-Hant/api-capabilities/model-info) 獲取最新的模型選擇建議

2. **上下文管理**
   * 定期清理無用對話
   * 合理設定上下文長度
   * 使用對話分組功能

3. **資源管理**
   * 監控 API 使用量
   * 設定使用限額提醒
   * 定期更新應用版本

### 安全建議

* 不要分享 API 金鑰
* 定期更換金鑰
* 使用強密碼保護應用
* 謹慎處理敏感資訊

### 團隊協作

雖然 Chatbox AI 主要面向個人使用者，但可以通過以下方式支援團隊：

* 共享提示詞模板
* 匯出對話記錄分享
* 統一 API 配置標準

## 對比優勢

### vs 其他客戶端

| 特性          | Chatbox AI | ChatGPT Web | 其他客戶端 |
| ----------- | ---------- | ----------- | ----- |
| **本地儲存**    | ✅          | ❌           | 部分支援  |
| **多平臺**     | ✅          | ❌           | 部分支援  |
| **自定義 API** | ✅          | ❌           | ✅     |
| **離線功能**    | ✅          | ❌           | ❌     |
| **隱私保護**    | ✅          | ❌           | 不確定   |

### 選擇 Chatbox AI 的理由

1. **隱私優先**：資料完全本地儲存
2. **靈活配置**：支援多種 API 端點
3. **跨平臺**：統一的使用體驗
4. **功能豐富**：提示詞庫、文件處理等
5. **持續更新**：活躍的開發維護

需要更多幫助？請檢視 [Chatbox AI 幫助中心](https://chatboxai.app/en/help-center) 或訪問 [API易官網](https://api.apiyi.com)。
