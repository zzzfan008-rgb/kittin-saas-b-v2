> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# ChatHub

> 一款瀏覽器擴充套件 AI 客戶端，支援同屏對比多家模型回答，通過 API易 統一接入 400+ 模型

ChatHub 是一款 Chrome / Edge 瀏覽器擴充套件，能在同一個對話裡同時向多個 AI 模型提問，並把各家回答並排展示，幫你快速判斷哪個模型最適合當前問題。通過 API易，你可以在 ChatHub 中統一接入 OpenAI、Claude、Gemini、DeepSeek、Qwen 等 400+ 主流模型。

## 核心能力：同屏對比模型

ChatHub 與其他客戶端最大的區別是**多模型並行問答**：

* 在同一個標籤頁裡向 2\~6 個模型同時傳送問題
* 把各家的回答以**並排 / 表格**兩種檢視對比
* 支援任意組合：GPT-5.5 + Claude Opus 4.7 + Gemini 3 Pro + DeepSeek V4 一起跑
* 對比檢視支援 Markdown 渲染、程式碼高亮、圖片預覽

<Tip>
  **適用場景**

  * 寫程式碼 / 改 Bug 時同時看 GPT-5.5 和 Claude Opus 4.7 的修復方案
  * 長文寫作時對比 Claude Sonnet 與 Qwen3.7 的中文表達
  * 翻譯 / 摘要時把同一段話丟給 GPT-5.5、Gemini 3 Flash 和 DeepSeek V4
  * 選型階段：拿同一道題測試多個模型，決定後續主力用誰
</Tip>

## 安裝

訪問 `https://chathub.gg/zh-CN/download` 下載安裝 ChatHub。

## 快速接入（OpenAI 相容格式）

這是最通用的接入方式，支援 API易 全部 400+ 模型。

### 第 1 步：獲取 API 金鑰

請參考 [API 金鑰獲取與管理流程](/zh-Hant/faq/token-management) 獲取你的 API易 金鑰。

### 第 2 步：開啟 ChatHub 設定

1. 點選瀏覽器右上角的 ChatHub 圖示
2. 在彈出視窗中點選右上角的 **Settings**（齒輪圖示）
3. 進入 **Custom Providers** 選項卡

### 第 3 步：新增 API易 提供商

<img src="https://mintcdn.com/apiyillc/1n99GeVSDKf0eLgj/images/chathub-add-apiyi-provider-zh.png?fit=max&auto=format&n=1n99GeVSDKf0eLgj&q=85&s=ac7db1a0937fc11a8012b39741f15b91" alt="ChatHub 新增 API易 提供商配置示例" width="688" height="691" data-path="images/chathub-add-apiyi-provider-zh.png" />

參考上圖，在彈出的新增提供商視窗中填寫：

* **名稱**：`apiyi`（自定義，便於在多個提供商中識別）
* **API Host**：下拉框選擇 `OpenAI`，下方位址列填 `https://api.apiyi.com/v1`
* **API Key**：貼上你的 API易 金鑰
* **模型**：填一個常用模型，例如 `deepseek-v4-pro`

可選進階選項：

* **支援圖片輸入**：當模型支援視覺理解時勾選（例如 `gpt-5-chat-latest`、`gemini-3-pro-preview`、`claude-sonnet-4-5`）
* **支援 function calling**：當模型支援工具呼叫時勾選
* **進階設定**：預設摺疊，按需展開

填寫完成後點選右下角「確認」儲存。

<Info>
  **配置要點**

  * API Host 位址列必須包含 `/v1` 字尾
  * 「模型」欄位是預設模型，可以隨時在對話中切換其他模型
  * 配置完成後無需重啟瀏覽器，立即生效
  * 如需新增多個提供商，重複本步驟即可
</Info>

### 第 4 步：選擇模型

設定完成後，回到 ChatHub 主介面，從下拉選單中即可看到你新增的模型列表，任意切換使用。

## 三種使用模式

| 模式        | 觸發方式                    | 適用場景                |
| --------- | ----------------------- | ------------------- |
| **單模型對話** | 像普通 ChatGPT 一樣與一個模型對話   | 日常問答、單模型擅長的任務       |
| **多模型對比** | 在輸入框右側勾選 2\~6 個模型一起傳送   | 選型測試、尋找最佳答案         |
| **網頁助手**  | 選中任意網頁文字，彈出 ChatHub 工具欄 | 閱讀論文時翻譯 / 總結、寫郵件時潤色 |

<Tip>
  **對比模式小技巧**

  * 對比模式下，每個模型的回覆都是**獨立**的，左側主對話欄顯示預設模型
  * 想要匯出所有模型的回答？點選對話右上角的 **Export** 按鈕，支援 Markdown / JSON / PNG
  * 對比時建議選 **風格差異大**的模型組合，例如「GPT-5.5 + Claude Opus 4.7 + DeepSeek V4」，更容易看出區別
</Tip>

## 進階配置：多家對比的最強玩法

ChatHub 的殺手鐧是「同時跑多家廠商」。通過 API易 一次接入就能在對比中混搭任意廠商的模型。

### 對比組合推薦

| 任務型別               | 推薦模型組合                                           | 理由               |
| ------------------ | ------------------------------------------------ | ---------------- |
| **程式碼生成 / Bug 修復** | GPT-5.5 + Claude Opus 4.7 + DeepSeek V4          | 主流程式設計能力 + 國產價效比 |
| **長文寫作 / 創意**      | Claude Sonnet 4.5 + Qwen3.7-Max + GPT-5.5        | 中文表達 + 西式敘事      |
| **翻譯 / 多語言**       | GPT-5.5 + Gemini 3 Flash + DeepSeek V4           | 三家互為校驗           |
| **推理 / 數學**        | GPT-5.5 (xhigh) + Claude Opus 4.7 + Gemini 3 Pro | 三大推理頂配           |

## 支援的模型

通過 API易，ChatHub 支援 400+ 主流 AI 模型，包括 OpenAI、Google Gemini、Claude、DeepSeek、國產模型等。

<Card title="檢視當下熱門模型推薦" icon="star" href="/zh-Hant/api-capabilities/model-info">
  檢視最新的模型推薦、效能對比和場景化使用建議。覆蓋文本創作、程式設計開發、快速響應、影像生成、影片生成等全場景。
</Card>

<Info>
  **為什麼不在此列出具體模型？**

  AI 模型更新迭代速度非常快，為了確保你獲取最準確的模型推薦資訊，我們統一在 [模型推薦頁面](/zh-Hant/api-capabilities/model-info) 維護最新的模型列表、效能資料和使用建議。
</Info>

## 核心功能

### 快捷鍵操作

| 快捷鍵                        | 功能                  |
| -------------------------- | ------------------- |
| `Ctrl/Cmd + Shift + Y`     | 在任意網頁開啟 ChatHub 側邊欄 |
| `Ctrl/Cmd + B`             | 切換側邊欄顯示             |
| `Ctrl/Cmd + Enter`         | 傳送訊息（單模型模式）         |
| `Ctrl/Cmd + Shift + Enter` | 傳送訊息到所有選中模型（對比模式）   |

### 網頁助手

在任意網頁選中文字，ChatHub 會自動彈出工具欄，可以：

* 翻譯選中文本
* 總結選中段落
* 改寫 / 潤色
* 解釋程式碼

### 對話管理

* 多組對話獨立上下文保持
* 對話歷史本地儲存（不依賴雲端）
* 支援 Markdown 渲染與程式碼高亮
* 一鍵匯出為 Markdown / PDF

### 提示詞庫

內建提示詞模板市場，也可以儲存自己的常用 prompt，支援變數。

## 進階設定

### 引數調節

```yaml theme={null}
對話引數設定:
  - Temperature: 0.7        # 創造性控制（推理模型 GPT-5 只能用 1）
  - Max Tokens: 4096        # 最大輸出長度
  - Top P: 0.9              # 核取樣閾值
  - Frequency Penalty: 0    # 重複懲罰
  - Presence Penalty: 0     # 新話題傾向
```

### 流式輸出

ChatHub 預設開啟流式輸出，體驗更順滑。

### 網路代理設定

如需使用代理訪問：

1. 進入 Settings > Advanced
2. 配置 HTTP/HTTPS 代理
3. 設定代理認證（如需要）

## 故障排除

### 連線失敗

* 檢查 API Base URL：`https://api.apiyi.com/v1`
* 驗證 API 金鑰有效性
* 確認網路連線狀態

### 模型不顯示

* 等待模型列表自動重新整理
* 手動點選「重新整理模型」按鈕
* 檢查 API 金鑰權限

### 對比模式只顯示一家

* 檢查是否在輸入框右側勾選了多個模型
* 確認所有模型都來自同一個 provider（或不同 provider 但都已配置）

### 響應速度慢

* 嘗試切換到更快的模型
* 檢查網路延遲
* 減少上下文長度

## 最佳實踐

### 效能最佳化

1. **合理選擇模型**
   * 根據任務複雜度選擇合適的模型
   * 檢視 [模型推薦頁面](/zh-Hant/api-capabilities/model-info) 獲取最新的模型選擇建議

2. **對比策略**
   * 同質模型（如兩個 GPT）對比意義不大
   * 選擇**能力側重不同**的模型：程式設計、寫作、推理、翻譯各選一家
   * 不要一次性對比超過 4 個模型，token 消耗會成倍增長

3. **資源管理**
   * 監控 API 使用量
   * 設定使用限額提醒
   * 定期更新擴充套件版本

### 安全建議

* 不要分享 API 金鑰
* 定期更換金鑰
* 使用強密碼保護瀏覽器
* 謹慎處理敏感資訊

### 團隊協作

雖然 ChatHub 主要面向個人使用者，但可以通過以下方式支援團隊：

* 共享提示詞模板
* 匯出對話記錄分享
* 統一 API 配置標準

## 對比優勢

### vs 其他客戶端

| 特性          | ChatHub  | 單模型客戶端 | 其他擴充套件 |
| ----------- | -------- | ------ | ------ |
| **同屏對比多模型** | ✅ 核心能力   | ❌      | 少數支援   |
| **瀏覽器側邊欄**  | ✅        | ❌      | 部分     |
| **網頁助手**    | ✅        | ❌      | 部分     |
| **自定義 API** | ✅        | ✅      | ✅      |
| **跨平臺同步**   | ✅（瀏覽器同步） | ❌      | 視實現    |
| **對話歷史本地**  | ✅        | 視實現    | 視實現    |

### 選擇 ChatHub 的理由

1. **選型利器**：同時跑多家模型是它無法替代的價值
2. **多模型混合呼叫**：OpenAI / Claude / Gemini / 國產模型任意組合
3. **網頁沉浸**：作為瀏覽器擴充套件，任何網頁都能呼叫
4. **隱私優先**：對話本地儲存，擴充套件不收集你的資料
5. **持續更新**：活躍的開發維護

***

需要更多幫助？請訪問 ChatHub GitHub 倉庫：`github.com/chathub-dev/chathub` 或訪問 API易 官網：`api.apiyi.com`。
