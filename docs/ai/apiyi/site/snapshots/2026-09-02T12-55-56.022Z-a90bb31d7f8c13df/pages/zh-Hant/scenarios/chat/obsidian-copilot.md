> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Obsidian Copilot

> 在 Obsidian 筆記軟體中通過 Copilot 外掛接入 API易，與個人知識庫對話

Obsidian Copilot 是一款開源的 Obsidian AI 助手外掛，設計簡潔、注重隱私。它支援通過自定義 API 金鑰接入任何相容 OpenAI 格式的模型服務，可以自定義提示詞、快速與整個筆記庫對話，從個人知識庫中獲取答案和見解。

通過 API易，您可以在 Obsidian 中一站式使用 GPT、Claude、Gemini、DeepSeek 等 400+ 主流模型，無需分別註冊多個平臺賬號。

## 核心特性

<CardGroup cols={2}>
  <Card title="與筆記庫對話" icon="messages-square">
    Vault QA 模式基於向量索引檢索整個筆記庫，針對您的個人知識庫進行問答
  </Card>

  <Card title="自定義提示詞" icon="wand-sparkles">
    內建總結、翻譯、改寫等命令，支援建立自定義提示詞一鍵處理選中文本
  </Card>

  <Card title="隱私優先" icon="shield-check">
    外掛開源、資料本地儲存，API 金鑰僅儲存在本地配置中
  </Card>

  <Card title="靈活接入模型" icon="plug">
    支援任何 OpenAI 相容介面，通過 API易 可自由切換 400+ 模型
  </Card>
</CardGroup>

## 快速開始

### 第一步：獲取 API易 金鑰

1. 開啟 [API易官網](https://api.apiyi.com) 並註冊賬號（已註冊直接登入即可）
2. 進入控制台的"令牌"頁面，建立新的 API Key
3. 點選複製金鑰（格式為 `sk-...`），以備後續使用

### 第二步：安裝 Obsidian Copilot 外掛

<Steps>
  <Step title="安裝 Obsidian 應用">
    從 Obsidian 官網下載並安裝：`obsidian.md`
  </Step>

  <Step title="開啟社群外掛市場">
    進入 Obsidian **設定 → 第三方外掛**，關閉"安全模式"，點選"瀏覽"社群外掛市場
  </Step>

  <Step title="安裝並啟用 Copilot">
    搜尋 **Copilot**（作者 Logan Yang），點選安裝並啟用
  </Step>
</Steps>

### 第三步：配置 API易 LLM 模型

<Steps>
  <Step title="開啟 Copilot 設定">
    進入 **設定 → Copilot**，切換到 **Model**（模型）標籤頁
  </Step>

  <Step title="新增自定義模型">
    在 Chat Models 部分點選 **Add Custom Model**，填寫以下資訊：

    | 配置項            | 填寫內容                                 |
    | -------------- | ------------------------------------ |
    | **Model Name** | 模型名稱，如 `gpt-5.2` 或 `claude-sonnet-5` |
    | **Provider**   | 選擇 **3rd party (openai-format)**     |
    | **Base URL**   | `https://api.apiyi.com/v1`           |
    | **API Key**    | 您的 API易 金鑰（`sk-...`）                 |
  </Step>

  <Step title="驗證並新增">
    點選 **Verify** 測試連通性，通過後點選 **Add Model** 完成新增
  </Step>
</Steps>

<Info>
  **配置要點**

  * Base URL 必須包含 `/v1` 字尾：`https://api.apiyi.com/v1`
  * 模型名稱需與 API易 支援的模型名完全一致，可在 [模型列表](https://api.apiyi.com/account/models) 查詢
  * 可重複新增多個模型，在聊天介面隨時切換
</Info>

### 第四步：配置 Embedding 模型（Vault QA 必需）

如需使用 Vault QA（筆記庫問答）模式，還需配置一個向量嵌入模型：

1. 在 Copilot 設定的 **Embedding Models** 部分點選 **Add Custom Model**
2. 填寫 Embedding 模型名稱：推薦 `text-embedding-3-small`（價效比高）或 `text-embedding-3-large`（精度更高）
3. Provider 同樣選擇 **3rd party (openai-format)**
4. Base URL 填寫 `https://api.apiyi.com/v1`，API Key 填寫 API易 金鑰
5. 點選 **Add Model** 完成

### 第五步：儲存並開始使用

選擇剛新增的模型作為預設模型，點選 **Save and Reload**（儲存並重新載入）。之後即可：

* 點選左側邊欄的 Copilot 圖示開啟聊天面板
* 在 **Chat** 模式下直接與模型對話
* 在 **Vault QA** 模式下基於整個筆記庫進行檢索問答（首次使用需等待索引構建完成）

## 支援的模型

Obsidian Copilot 通過 API易 支援 400+ 主流 AI 模型，包括 OpenAI、Claude、Gemini、DeepSeek、國產模型等。

<Card title="檢視最新模型推薦" icon="star" href="/zh-Hant/api-capabilities/model-info">
  檢視最新的模型推薦、效能對比和使用建議。模型列表持續更新，確保您使用最新最強的 AI 模型。
</Card>

<Info>
  **為什麼不在此列出具體模型？**

  AI 模型更新迭代速度非常快，為了確保您獲取最準確的模型推薦資訊，我們統一在 [模型推薦頁面](/zh-Hant/api-capabilities/model-info) 維護最新的模型列表、效能資料和使用建議。
</Info>

<Tip>
  **場景化選擇建議**

  * **日常筆記問答**：選擇響應快、價格低的輕量模型
  * **長文總結/深度寫作**：選擇長上下文的旗艦模型
  * **Vault QA 嵌入**：`text-embedding-3-small` 足夠覆蓋絕大多數知識庫場景
</Tip>

## 高階功能

### 自定義命令與提示詞

Copilot 支援將常用操作儲存為自定義命令：

1. 在 Copilot 設定中進入 **Commands** 部分
2. 建立自定義提示詞，例如"將選中內容改寫為週報格式"
3. 在編輯器中選中文本，通過命令面板（`Ctrl/Cmd + P`）呼叫

### 與選中文本互動

選中筆記中的任意段落後，可直接呼叫內建命令：

* **Summarize**：一鍵總結選中內容
* **Translate**：翻譯為指定語言
* **Simplify / Fix grammar**：簡化表達、修正語法
* **Generate table of contents**：生成目錄

### CORS 相容模式

如果配置後聊天請求失敗，可在新增模型時勾選 **CORS** 選項。

<Warning>
  開啟 CORS 模式後 Obsidian 暫不支援流式輸出，回覆會在生成完畢後一次性顯示。API易 的標準介面通常無需開啟此選項，建議僅在請求失敗時嘗試。
</Warning>

## 故障排除

<AccordionGroup>
  <Accordion title="點選 Verify 驗證失敗或聊天無響應">
    * 檢查 Base URL 是否為 `https://api.apiyi.com/v1`（注意包含 `/v1`）
    * 確認 API Key 已正確複製，無多餘空格
    * 確認賬戶餘額充足
    * 若仍失敗，嘗試在模型設定中勾選 CORS 選項
  </Accordion>

  <Accordion title="提示模型不存在（model not found）">
    * 模型名稱必須與 API易 支援的名稱完全一致（區分大小寫）
    * 前往 [模型列表](https://api.apiyi.com/account/models) 核對準確的模型名
  </Accordion>

  <Accordion title="Vault QA 模式無法使用或索引失敗">
    * 確認已單獨配置 Embedding 模型（LLM 模型不能兼作嵌入模型）
    * 首次索引大型筆記庫需要一定時間，請耐心等待
    * 修改 Embedding 模型後需要重建索引（Force Re-index）
  </Accordion>

  <Accordion title="回覆速度慢">
    * 換用響應更快的輕量模型
    * 減少對話上下文長度
    * Vault QA 模式下適當降低檢索返回的片段數量
  </Accordion>
</AccordionGroup>

## 使用技巧

1. **多模型分工**：新增多個模型，日常問答用輕量模型，深度寫作切換旗艦模型，節省成本
2. **控制索引範圍**：在 Copilot 設定中排除附件、模板等目錄，減少 Embedding 消耗並提升檢索品質
3. **善用自定義提示詞**：將高頻操作（如"整理會議記錄"）固化為命令，一次配置長期複用
4. **定期重建索引**：筆記庫大幅變動後執行 Force Re-index，保證 Vault QA 檢索準確性

## 相關資源

<CardGroup cols={2}>
  <Card title="模型推薦" icon="star" href="/zh-Hant/api-capabilities/model-info">
    檢視最新模型列表與場景化推薦
  </Card>

  <Card title="快速開始" icon="rocket" href="/zh-Hant/getting-started">
    3 分鐘完成 API易 賬號註冊與金鑰建立
  </Card>

  <Card title="Base URL 配置說明" icon="circle-question-mark" href="/zh-Hant/faq/base-url-config">
    瞭解不同工具中 API 地址的正確填寫方式
  </Card>

  <Card title="Cherry Studio" icon="cherry" href="/zh-Hant/scenarios/chat/cherry-studio">
    另一款功能強大的桌面 AI 對話客戶端
  </Card>
</CardGroup>

<Info>
  Obsidian Copilot 外掛開源地址：`github.com/logancyang/obsidian-copilot`
</Info>
