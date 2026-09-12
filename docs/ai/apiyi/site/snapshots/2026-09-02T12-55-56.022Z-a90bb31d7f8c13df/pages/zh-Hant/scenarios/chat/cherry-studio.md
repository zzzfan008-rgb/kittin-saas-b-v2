> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Cherry Studio

> 功能強大的 AI 對話客戶端整合指南，支援 OpenAI、Anthropic、Gemini 三種渠道型別

Cherry Studio 是一款功能強大的 AI 對話客戶端，支援多種大語言模型。通過 API易，您可以在 Cherry Studio 中使用各種主流 AI 模型，並根據需要選擇不同的渠道型別以獲得最佳體驗和成本最佳化。

## 快速整合（OpenAI 相容格式）

這是最通用的接入方式，支援 API易 全部 400+ 模型。

### 1. 獲取 API 金鑰

請參考 [API金鑰獲取與管理教程](/zh-Hant/faq/token-management) 獲取您的 API 金鑰。

### 2. 配置步驟

<img src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/cherry-studio-config.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=697ce7c87d0a7ddadbc2a4ae4eeca322" alt="Cherry Studio OpenAI相容配置介面" width="2400" height="1668" data-path="images/cherry-studio-config.png" />

按照上圖所示，完成以下配置步驟：

1. 開啟 Cherry Studio 應用
2. 點選左側的設定圖示進入設定頁面
3. 選擇"模型服務"選項
4. 在模型提供商列表中建立自定義渠道【API易】
5. 填寫配置資訊：
   * **API 地址**：`https://api.apiyi.com`
   * **API 金鑰**：輸入您的 API易 金鑰（[獲取方式](/zh-Hant/faq/token-management)）
6. 點選底部的"➕ 新增"按鈕儲存配置

<Info>
  **配置要點**

  * API 地址務必使用：`https://api.apiyi.com`
  * API 金鑰獲取方式請參考 [API金鑰獲取與管理教程](/zh-Hant/faq/token-management)
  * 建議先測試連線確保配置正確
</Info>

## 三種渠道型別對比

Cherry Studio 支援多種渠道型別，API易 均可接入。根據您的使用場景選擇最合適的方式：

| 特性         | OpenAI 相容格式                | Anthropic 格式      | Gemini 格式   |
| ---------- | -------------------------- | ----------------- | ----------- |
| **API 地址** | 均為 `https://api.apiyi.com` |                   |             |
| **支援模型**   | 全部 400+ 模型                 | 僅 Claude 模型       | 僅 Gemini 模型 |
| **核心優勢**   | 通用相容                       | 快取省錢              | 原生功能 + 文生圖  |
| **快取計費**   | 無                          | 快取 token 約 10% 價格 | 無           |
| **特色功能**   | 最廣模型支援                     | 連續對話成本最佳化         | 文生圖、程式碼執行   |
| **推薦場景**   | 通用、多模型切換                   | 高頻 Claude 使用      | Gemini 專屬功能 |

<Tip>
  **如何選擇？**

  * 如果您使用多種模型，選擇 **OpenAI 相容格式**（預設推薦）
  * 如果您主要用 Claude 且對話頻繁（5 分鐘內連續對話），選擇 **Anthropic 格式** 可省錢
  * 如果您需要 Gemini 文生圖等原生功能，選擇 **Gemini 格式**
</Tip>

## Anthropic 渠道型別

Anthropic 原生格式支援 **[Prompt Caching（提示快取）](/zh-Hant/api-capabilities/claude-prompt-caching)** 功能，在 5 分鐘內的連續對話中，快取命中的輸入 tokens 僅需正常價格的約 10%，大幅降低使用成本。

### 配置步驟

<img src="https://mintcdn.com/apiyillc/7TkKa5JmqO5PH0BI/images/cherry-studio-anthropic-provider.png?fit=max&auto=format&n=7TkKa5JmqO5PH0BI&q=85&s=2f3eeb3f3536cbe6cb0ec1f2bd2478f8" alt="Cherry Studio 新增 Anthropic 提供商配置介面" width="1570" height="1020" data-path="images/cherry-studio-anthropic-provider.png" />

1. 開啟 Cherry Studio 設定 → 模型服務
2. 點選底部的"➕ 新增"按鈕，在彈窗中填寫：
   * **提供商名稱**：自定義命名（如 `APIYI-CLAUDE`，便於識別）
   * **提供商型別**：選擇 **Anthropic**
3. 點選"確定"建立後，在新渠道中填寫配置資訊：
   * **API 地址**：`https://api.apiyi.com`
   * **API 金鑰**：輸入您的 API易 金鑰
4. 新增所需的 Claude 模型（如 `claude-sonnet-4-5-20250929`、`claude-opus-4-5-20251101`）

<Warning>
  **注意**：Anthropic 渠道僅支援 Claude 系列模型。如需使用其他模型，請通過 OpenAI 相容格式渠道。
</Warning>

### 適用場景

* **連續對話**：5 分鐘內的高頻對話，快取命中率高，省錢效果明顯
* **長上下文對話**：上下文越長，快取節省的費用越多
* **偶爾聊天**：如果您只是時不時發一句，使用 OpenAI 相容格式即可，兩者差別不大

<CardGroup cols={2}>
  <Card title="Claude API 詳細文件" icon="book" href="/zh-Hant/api-capabilities/claude">
    檢視 Anthropic 原生格式的完整 API 文件，包括流式響應、擴充套件思考等高階功能。
  </Card>

  <Card title="快取計費深度指南" icon="database" href="/zh-Hant/api-capabilities/claude-prompt-caching">
    瞭解 Prompt Cache 如何讓賬單打 1 折，含觸發條件、最小示例與踩坑指南。
  </Card>
</CardGroup>

## Gemini 渠道型別

Gemini 原生格式支援所有 Gemini 專屬功能，包括使用 `gemini-3-pro-image-preview` 進行**文生圖（text-to-image）** 創作、程式碼執行、原生推理控制等。

### 配置步驟

1. 開啟 Cherry Studio 設定 → 模型服務
2. 建立新的渠道，**渠道型別選擇 Google Gemini**
3. 填寫配置資訊：
   * **API 地址**：`https://api.apiyi.com`
   * **API 金鑰**：輸入您的 API易 金鑰
4. 新增所需的 Gemini 模型（如 `gemini-2.5-flash`、`gemini-3-pro-preview`、`gemini-3-pro-image-preview`）

<Warning>
  **注意**：Gemini 渠道僅支援 Gemini 系列模型。如需使用其他模型，請通過 OpenAI 相容格式渠道。
</Warning>

### 特色功能

* **文生圖**：使用 `gemini-3-pro-image-preview` 模型，直接在對話中生成圖片
* **程式碼執行**：模型可自動執行 Python 程式碼進行資料分析
* **推理控制**：通過 `thinking_budget` 精細控制推理深度
* **多模態支援**：完整支援圖片、音訊、影片等多種媒體輸入

<Card title="Gemini 原生格式詳細文件" icon="sparkles" href="/zh-Hant/api-capabilities/gemini/native">
  檢視 Gemini 原生格式的完整 API 文件，包括多模態處理、推理控制、程式碼執行等功能。
</Card>

## 新增模型

完成渠道配置後，在對應渠道中新增所需模型：

1. 在模型搜尋框中查詢所需模型
2. 點選模型名稱旁的圖示來選擇或配置模型
3. 根據需要啟用或停用不同的模型變體

<Card title="當下熱門模型推薦" icon="star" href="/zh-Hant/api-capabilities/model-info">
  檢視最新的模型推薦、效能對比和使用建議。模型列表持續更新，確保您使用最新最強的 AI 模型。
</Card>

<Info>
  **為什麼不在此列出具體模型？**

  AI 模型更新迭代速度非常快，為了確保您獲取最準確的模型推薦資訊，我們統一在 [模型推薦頁面](/zh-Hant/api-capabilities/model-info) 維護最新的模型列表、效能資料和使用建議。
</Info>

## 高階功能

### 圖片支援

如果使用支援圖片的模型（如 GPT-4V）：

1. 在設定中開啟"圖片"選項
2. 選擇支援視覺的模型
3. 在對話中上傳圖片

### 流式輸出

Cherry Studio 預設支援流式輸出，提供更好的體驗。

## 故障排除

### 連線失敗

* 檢查 API 金鑰是否正確
* 確認 API 地址：`https://api.apiyi.com`
* 驗證網路連線狀態

### 模型不可用

* 確認賬戶餘額充足
* 檢查模型是否在對應的渠道型別中（例如 Claude 模型需在 OpenAI 或 Anthropic 渠道中）
* 嘗試其他模型

## 使用技巧

1. **合理選擇渠道**：根據主要使用的模型選擇對應渠道型別，可同時配置多個渠道
2. **合理選擇模型**：根據任務需求選擇合適的模型
3. **定期更新**：關注新模型的釋出
4. **監控使用**：通過 API易 檢視使用情況

需要更多幫助？請訪問 [API易官網](https://api.apiyi.com)。
