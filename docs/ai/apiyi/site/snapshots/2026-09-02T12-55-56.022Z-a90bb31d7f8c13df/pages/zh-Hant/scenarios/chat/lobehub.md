> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# LobeHub

> 開源 AI 對話客戶端整合指南，支援自定義服務商與本地知識庫

LobeHub 是一款開源、跨平臺的 AI 對話客戶端（原 Lobe Chat），支援多模型、多模態、外掛系統與本地知識庫。通過 API易，您可以在 LobeHub 中使用一個 API 金鑰訪問 400+ 主流 AI 模型，無需為每個廠商單獨註冊和付費。

<CardGroup cols={3}>
  <Card title="開源可自託管" icon="github">
    桌面端、網頁端、Docker、Vercel 均可部署，資料完全可控
  </Card>

  <Card title="外掛與多模態" icon="plug">
    內建聯網搜尋、程式碼直譯器、影像理解、影片生成等外掛
  </Card>

  <Card title="本地知識庫" icon="database">
    支援上傳 PDF / Markdown 建立 RAG，對話引用私有資料
  </Card>
</CardGroup>

## 快速開始

### 1. 獲取 API易 金鑰

請參考 [API金鑰獲取與管理教程](/zh-Hant/faq/token-management) 獲取您的 API 金鑰。

### 2. 安裝 LobeHub

LobeHub 提供三種使用方式：

* **桌面版**：Windows、macOS、Linux 官方客戶端，可在 `lobechat.com` 下載安裝包
* **網頁版（官方）**：直接訪問 `lobechat.com` 註冊登入即可使用，無需自部署
* **自託管**：通過 Docker / Vercel / 本地原始碼部署，適合企業或隱私場景

<Tip>
  個人使用者推薦直接使用官方網頁版或桌面版；如有資料隱私或合規需求，建議 Docker 自託管（環境變數中配置 API易 即可）。
</Tip>

### 3. 建立自定義服務商

<img src="https://mintcdn.com/apiyillc/xf0Zzocq7Adycbe5/images/lobehub-create-provider.png?fit=max&auto=format&n=xf0Zzocq7Adycbe5&q=85&s=ddda3ebd3c4aa4e60aa6c9f87bd14ecb" alt="LobeHub 建立自定義 AI 服務商配置介面" width="763" height="916" data-path="images/lobehub-create-provider.png" />

進入「設定 → 模型服務商」，點選右上角 `+` 新增自定義服務商，按上圖填寫以下資訊：

| 欄位           | 填寫內容                       | 說明                        |
| ------------ | -------------------------- | ------------------------- |
| **服務商 ID**   | `apiyi`                    | 作為服務商唯一標識，建立後不可修改         |
| **服務商名稱**    | `apiyi`                    | 自定義顯示名稱                   |
| **服務商簡介**    | `apiyi`                    | 自定義描述                     |
| **服務商 Logo** | （留空）                       | 可選，自定義 Logo 地址            |
| **請求格式**     | `OpenAI`                   | API易 完全相容 OpenAI 協議       |
| **代理地址**     | `https://api.apiyi.com/v1` | Base URL，**務必以 `/v1` 結尾** |
| **API Key**  | 您的 API易 金鑰                 | 在 API易 控制台獲取              |

填寫完成後點選右下角 **新建** 按鈕儲存。

<Info>
  **配置要點**

  * 「代理地址」必須以 `/v1` 結尾，否則請求會路由失敗
  * 「API Key」貼上時請刪除前後空格
  * 「請求格式」選擇 `OpenAI` 即可訪問 API易 全部 400+ 模型
  * 一個金鑰可同時啟用多種模型，按用量計費，無需為單模型單獨付費
</Info>

### 4. 驗證連通性

<img src="https://mintcdn.com/apiyillc/xf0Zzocq7Adycbe5/images/lobehub-configured.png?fit=max&auto=format&n=xf0Zzocq7Adycbe5&q=85&s=b230b3aac1cd11cb9bd186d020ce8b73" alt="LobeHub 配置完成後的介面" width="1473" height="913" data-path="images/lobehub-configured.png" />

新建成功後，會跳轉到服務商詳情頁。可以：

1. **填寫 API Key 與代理地址**：再次確認或修改
2. **開啟進階選項**（可選）：
   * 「使用 Responses API 規範」：開啟後可使用 OpenAI 新一代請求格式（僅 OpenAI 模型支援）
   * 「使用客戶端請求模式」：瀏覽器直接發起會話，可提升響應速度
3. **連通性檢查**：在下拉框中選擇一個模型，點選 **檢查** 按鈕測試連通性
4. **獲取模型列表**：點選 **獲取模型列表** 按鈕，自動拉取 API易 提供的全部模型

成功獲取後，「模型列表」會顯示 API易 當前在售的全部模型，按型別分組：對話、圖片、影片、向量化、ASR、TTS。

<Warning>
  如果「連通性檢查」失敗，請按以下順序排查：

  * 代理地址末尾是否包含 `/v1`
  * API Key 是否有效（可在 API易 控制台驗證）
  * 網路環境是否能訪問 `api.apiyi.com`
  * 防火牆 / 代理設定是否攔截 HTTPS
</Warning>

### 5. 選擇模型開始對話

在對話介面的模型下拉框中，選擇您想使用的模型（如 `claude-opus-5`、`gpt-5-6-terra`、`deepseek-v4-pro`），即可開始對話。

<Card title="檢視當下熱門模型推薦" icon="star" href="/zh-Hant/api-capabilities/model-info">
  檢視最新的模型推薦、效能對比和場景化使用建議，涵蓋文本創作、程式設計開發、快速響應、影像生成、影片生成等全場景。
</Card>

<Info>
  **為什麼不在此列出具體模型？**

  AI 模型更新迭代速度非常快，為了確保您獲取最準確的模型推薦資訊，我們統一在 [模型推薦頁面](/zh-Hant/api-capabilities/model-info) 維護最新的模型列表、效能資料和使用建議。
</Info>

## 一站式接入 400+ 模型

LobeHub 內建了多家服務商的官方渠道，需要逐個填金鑰；接 API易 則只需建**一個**自定義服務商，即可覆蓋全部模型：

| 渠道                   | 適用模型                                       | 核心優勢             | API 地址                     |
| -------------------- | ------------------------------------------ | ---------------- | -------------------------- |
| **OpenAI 相容（apiyi）** | 全部 400+ 模型（含 Claude、Gemini、GPT、DeepSeek 等） | 一個金鑰通吃全部模型，配置最簡單 | `https://api.apiyi.com/v1` |

<Tip>
  **一個 apiyi 渠道就能訪問 Claude / Gemini 等所有模型**

  API易 把 Claude、Gemini、GPT、DeepSeek 等主流模型統一封裝為 OpenAI 相容協議，所以你只要在 LobeHub 裡建一個 `apiyi` 自定義服務商，就能在模型下拉框裡選到全部 400+ 模型，無需為不同廠商分別配置渠道。
</Tip>

## LobeHub 特色玩法

### 外掛系統

LobeHub 提供豐富的外掛市場（設定 → 外掛），推薦開啟：

* **Web 搜尋**：讓模型即時聯網獲取最新資訊
* **程式碼直譯器**：對話中執行 Python 程式碼、做資料視覺化
* **圖表生成**：自動生成流程圖、思維導圖
* **影像生成**：通過 `gpt-image-2`、`gemini-3-pro-image` 等模型生成圖片

### 本地知識庫（RAG）

LobeHub 支援上傳檔案建立本地向量庫：

1. 進入「知識庫」頁面，新建知識庫
2. 上傳 PDF、Markdown、Word、Excel、TXT 等檔案
3. 系統自動切片、向量化
4. 對話時勾選知識庫，模型將基於您的私有資料回答

<Warning>
  知識庫的「向量化」步驟會呼叫 Embedding 模型（計費）。建議使用 API易 提供的 `text-embedding-3-large` 等向量化模型。
</Warning>

### 多模態對話

支援上傳圖片進行視覺理解、識圖、OCR：

* 視覺模型推薦：`gemini-3-6-flash`、`claude-opus-5`、`gpt-5-6-terra`
* 直接在對話方塊拖入圖片，模型會自動識別

### 助手市場（Agent Market）

LobeHub 內建豐富的預設助手（翻譯、寫作、程式設計、面試等），您也可以：

* 在「助手市場」一鍵啟用社群分享的助手
* 自建助手：自定義人設、Prompt、開場白、知識庫、外掛

### 對話管理與匯出

* 多分支對話、訊息編輯與重新生成
* 對話匯出：Markdown、PNG、JSON
* 全域性搜尋歷史訊息

## 高階配置

### 自定義請求引數

進入服務商詳情頁可調節通用引數：

```yaml theme={null}
預設引數:
  Temperature: 0.7        # 創造性控制（推理模型如 GPT-5.6 系列只能用 1）
  Top P: 0.9              # 取樣引數（推理模型只能用 1）
  Max Tokens: 4096        # 最大輸出長度
  Context Length: 8192    # 上下文長度
```

<Warning>
  部分推理模型（如 GPT-5.6 系列）只支援 `Temperature = 1` 和 `Top P = 1`，其他取值會被服務端忽略或報錯。
</Warning>

### 網路代理與自託管

如需使用代理或自託管 LobeHub：

1. **桌面版**：設定 → 網路 → 配置 HTTP/HTTPS 代理
2. **自託管（Docker）**：通過環境變數注入 API易 配置：
   ```bash theme={null}
   OPENAI_API_KEY=sk-your-apiyi-key
   OPENAI_PROXY_URL=https://api.apiyi.com/v1
   CUSTOM_MODELS=gpt-5-6-terra,claude-opus-5,deepseek-v4-pro
   ```
3. **客戶端請求模式**：開啟後瀏覽器直連 API（需保證瀏覽器能訪問 API易）

### 快捷鍵

| 快捷鍵                    | 功能   |
| ---------------------- | ---- |
| `Ctrl/Cmd + N`         | 新建對話 |
| `Ctrl/Cmd + K`         | 快速搜尋 |
| `Ctrl/Cmd + /`         | 命令面板 |
| `Ctrl/Cmd + Shift + M` | 切換模型 |

## 移動端

LobeHub 桌面端支援 Windows / macOS / Linux，移動端可通過瀏覽器訪問 `lobechat.com` 網頁版（響應式適配），無需單獨安裝 App。

## 故障排除

### 連線失敗 / 連通性檢查不通過

| 現象           | 排查方向                          |
| ------------ | ----------------------------- |
| 提示 401 / 403 | API Key 無效或餘額不足，前往 API易 控制台核對 |
| 提示 404       | 代理地址未以 `/v1` 結尾，缺少 `/v1` 字尾   |
| 提示超時         | 網路環境問題，檢查代理或防火牆設定             |
| 提示 CORS 錯誤   | 關閉「使用客戶端請求模式」，或通過服務端中轉        |

### 模型列表為空

* 點選 **獲取模型列表** 按鈕手動拉取
* 等待 1-2 秒後重新整理頁面
* 確認 API Key 在 API易 控制台狀態正常

### 響應慢或流式斷流

* 切換到更快模型（如 `gemini-3-5-flash-lite`、`claude-haiku-4-5`、`deepseek-v4-flash`）
* 關閉不必要的外掛
* 檢查網路延遲
* 減少上下文長度（關閉過長的舊對話）

### 知識庫檢索不準確

* 調小切片大小，讓檢索粒度更細
* 在 API易 中切換更優的 Embedding 模型
* 增加相關文件數量，提高召回率

## 最佳實踐

### 模型選擇策略

不同任務用不同模型，按複雜度梯度選擇：

* **日常聊天 / 簡單問答**：`gemini-3-5-flash-lite`、`claude-haiku-4-5`、`deepseek-v4-flash`
* **複雜推理 / 長文件分析**：`claude-opus-5`、`gpt-5-6-sol`、`deepseek-v4-pro`
* **程式碼開發**：`claude-opus-5`、`gpt-5-6-sol`、`claude-sonnet-5`
* **影像理解**：`gemini-3-6-flash`、`claude-opus-5`、`gpt-5-6-terra`
* **影像生成**：`gpt-image-2`、`gemini-3-pro-image`

完整模型列表與效能對比請參考 [模型推薦頁面](/zh-Hant/api-capabilities/model-info)。

### 上下文管理

* 定期清理無用的舊對話
* 複雜任務拆分成多個短對話
* 善用「分叉對話」功能探索不同回答

### 安全與隱私

* 不要在公共場合分享 API Key
* 定期更換金鑰（API易 控制台可一鍵重置）
* 敏感對話建議自託管 LobeHub，資料完全本地儲存

### 自託管建議

* 生產環境使用 Docker + PostgreSQL，不要用內建資料庫
* 反向代理建議套 Cloudflare
* 通過環境變數集中管理金鑰，便於多例項部署

## 與其他客戶端的對比

三款客戶端接入 API易 的方式一致（都走 OpenAI 相容協議），差別主要在部署形態和功能側重：

| 特性             | LobeHub                       | [Chatbox AI](/zh-Hant/scenarios/chat/chatbox) | [Cherry Studio](/zh-Hant/scenarios/chat/cherry-studio) |
| -------------- | ----------------------------- | --------------------------------------------- | ------------------------------------------------------ |
| **部署形態**       | 桌面 + 網頁 + Docker / Vercel 自託管 | 桌面 + 移動 + 網頁                                  | 桌面 + 移動                                                |
| **本地知識庫（RAG）** | 內建向量庫                         | 單次對話內的文件理解                                    | 內建知識庫                                                  |
| **外掛 / 擴充套件**  | 外掛市場，生態豐富                     | 內建常用能力                                        | 內建能力為主                                                 |
| **渠道協議**       | OpenAI 相容                     | OpenAI 相容                                     | OpenAI / Anthropic / Gemini 三種                         |
| **移動端**        | 網頁響應式                         | 原生 App                                        | 原生 App                                                 |

<Tip>
  **什麼時候選 LobeHub？**

  * 需要 **持久化的本地知識庫** 或 **外掛生態**（聯網搜尋、程式碼直譯器、圖表等）
  * 希望 **私有化部署**（Docker / Vercel），資料完全自控
  * 想要一個 **跨桌面 + 網頁** 統一體驗的介面

  三款都是成熟選擇：更看重 **移動端原生 App 與本地儲存** 可以選 Chatbox AI；需要 **Claude / Gemini 原生協議**（含 Prompt Cache）可以選 Cherry Studio。
</Tip>

需要更多幫助？請訪問 `lobechat.com` 官方文件或 [API易官網](https://api.apiyi.com) 獲取更多支援。
