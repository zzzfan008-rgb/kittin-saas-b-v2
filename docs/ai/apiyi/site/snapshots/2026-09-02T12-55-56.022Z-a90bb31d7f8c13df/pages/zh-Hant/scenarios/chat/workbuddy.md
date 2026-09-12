> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# WorkBuddy

> 騰訊出品的全場景 AI 辦公工作臺，說出要求、自動規劃執行、交付完整成果，可通過 API易 一把金鑰接入任意大模型

<Tip>
  騰訊出品的全場景 AI 辦公工作臺，說出要求、自動規劃執行、交付完整成果，可通過 API易 一把金鑰接入任意大模型。
</Tip>

## 概述

WorkBuddy 是騰訊出品的 AI Agent 辦公新範式產品，主打「**說出要求、開始執行任務、交付完整成果**」——區別於傳統對話式 AI 只給建議、只出文字回覆，WorkBuddy 能理解自然語言指令，自主拆解任務、規劃步驟並執行操作，支援文件、表格、PPT、資料分析等多模態任務處理，還能讀取授權的本地資料夾進行批次處理，直接交付可驗收的成果（週報、會議紀要、PPT、資料看板等）。

WorkBuddy 內建了混元、GLM、MiniMax、Kimi、DeepSeek 等主流模型（通過騰訊雲 Token Plan 提供），同時也支援在「模型配置」中自行接入任意第三方大模型作為呼叫底座。通過對接 API易，您可以獲得：

| 能力         | 說明                                                                             |
| ---------- | ------------------------------------------------------------------------------ |
| 🧩 一把金鑰全模型 | 無需分別註冊各家賬號，一個 API易 金鑰即可在 WorkBuddy 中呼叫 GPT / Claude / Gemini / DeepSeek 等全模型矩陣 |
| 🔐 金鑰本地儲存  | 配置（含 API Key）僅儲存在本機 `workbuddy/models.json`，不上傳雲端                              |
| ⚡ 圖形化一鍵接入  | 設定 → 模型 → 自定義，填入介面地址、金鑰、模型名即可儲存使用，無需改配置檔案                                      |
| 💰 按量自主付費  | 自定義模型產生的費用由您直接向 API易 結算，不佔用 WorkBuddy 自身積分/套餐額度                                |

> ℹ️ **產品資訊**：WorkBuddy 由騰訊出品，官網 `www.workbuddy.cn`，官方文件 `www.workbuddy.cn/docs/workbuddy/Overview`。

## 安裝

WorkBuddy 目前提供 **Windows / macOS** 桌面客戶端，從官網下載安裝包後雙擊安裝即可，無需命令列操作：

| 平臺      | 獲取方式                                                                                      |
| ------- | ----------------------------------------------------------------------------------------- |
| 官網首頁    | `www.workbuddy.cn`，點選下載按鈕獲取當前平臺的安裝包                                                       |
| Windows | 參考官方《Windows 安裝指南》：`/docs/workbuddy/From-Beginner-to-Expert-Guide/Installation-Win-Guide` |
| macOS   | 參考官方《Mac 安裝指南》：`/docs/workbuddy/From-Beginner-to-Expert-Guide/Installation-Mac-Guide`     |
| 歷史版本    | 官方文件《歷史版本下載》：`/docs/workbuddy/Download-History`                                           |

安裝完成後開啟 WorkBuddy，登入賬號即可在「新建工作列」直接用一句話下達任務，或按官方《快速開始》/《開啟你的第一個任務》引導熟悉基本操作。

## 接入 API易

WorkBuddy 的模型配置彈窗**僅支援 OpenAI 相容協議 API**（彈窗頂部會標註「僅支援 OpenAI 相容協議 API」）。API易 提供標準的 **OpenAI 相容 API**，選擇「自定義 / Custom」供應商即可接入，一次拿到全模型矩陣（GPT / Claude / Gemini / DeepSeek / 智譜 / Kimi 等）。

### 圖形介面配置（唯一方式，推薦）

在 WorkBuddy 中開啟 **設定 → 模型**，點選「新增模型」，按下表填寫：

| 欄位      | 填寫內容                                                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 提供商     | 選擇 `自定義 / Custom`                                                                                                                     |
| 介面地址    | `https://api.apiyi.com/v1/chat/completions`（需**完整填寫**到 `/chat/completions`，不要只填 `https://api.apiyi.com` 或 `https://api.apiyi.com/v1`） |
| API Key | 你的 API易 金鑰（`sk-...`）                                                                                                                  |
| 模型名稱    | 填入想用的模型 ID，如 `claude-sonnet-5`、`gpt-5.4`、`deepseek-v3.2`、`kimi-k2.6`                                                                  |
| 高階配置    | 按所選模型的實際能力手動勾選，見下方說明                                                                                                                  |

<img src="https://mintcdn.com/apiyillc/hVgOxBLyKM6-uzFJ/images/workbuddy-model-config-zh.png?fit=max&auto=format&n=hVgOxBLyKM6-uzFJ&q=85&s=d52fe72d995e805cc4a587d6aada814b" alt="WorkBuddy 自定義模型配置彈窗示例（僅支援 OpenAI 相容協議 API）" width="660" height="639" data-path="images/workbuddy-model-config-zh.png" />

> ℹ️ **關於「高階配置」能力標記**：選擇騰訊雲 Token Plan 等**標準供應商**時，工具呼叫 / 圖片輸入等能力標記會自動寫入；但選擇**自定義 / Custom** 接入 API易 時不會自動識別，需要根據所選模型的實際能力**手動勾選**：
>
> * 請以你所填模型 ID 的**真實能力**為準逐項勾選，不確定時建議**寧可少勾、不要多勾**——如上方截圖 `claude-sonnet-5` 示例僅勾選了工具呼叫
> * 確認所用模型確實支援圖片輸入，或具備推理增強能力後，再補勾**圖片輸入** / **推理模式**
> * 勾選與模型實際能力不符（如給不支援工具呼叫的模型勾選工具呼叫）可能導致呼叫報錯，請按需勾選

「輸入」「輸出」兩個區域用於設定上下文長度與最大輸出 tokens，留空即為「使用提供商預設值」，也可手動點選 32K/64K/128K/256K（輸入）、8K/16K/32K/64K（輸出）等擋位。填寫完成後點選「儲存」，回到對話介面即可在模型選擇器的自定義分組中看到並使用該模型。

> ⚠️ **介面地址請完整填寫為 `https://api.apiyi.com/v1/chat/completions`**（即末尾帶 `/chat/completions` 的完整路徑，如截圖所示），不要只填 `https://api.apiyi.com` 或 `https://api.apiyi.com/v1` 這類不完整地址，否則會請求失敗。

**額外提示**：API易 控制台 `api.apiyi.com/token` 建立令牌時，**部分分組有折扣**（如 ClaudeCode 分組），且可與充值贈送疊加，具體以控制台顯示為準。

> 💡 **為什麼選 API易？**
>
> * **一把金鑰多家模型**：OpenAI / Anthropic / Google / DeepSeek / 智譜 / Kimi 等全模型矩陣，WorkBuddy 中只需配置一次
> * **價格優勢**：相對官方價格通常有 5%-20% 優惠，部分模型支援充值加贈
> * **國內直連**：免代理直接訪問海外大模型，配合 WorkBuddy 桌面客戶端無需額外網路配置
> * **標準 OpenAI 相容協議**：完全匹配 WorkBuddy「自定義 / Custom」供應商的接入要求，無需開啟自定義協議開關

> ℹ️ **費用與隱私說明**：自定義模型產生的全部費用（Token 消耗等）由您直接向 API易 結算，請留意 API易 賬戶餘額和用量；API Key 僅儲存在本機 `workbuddy/models.json`，WorkBuddy 不會上傳至雲端，請妥善保管，不再使用時建議在設定中刪除或清理該配置。

## 常用功能速查

| 功能          | 說明                                                    |
| ----------- | ----------------------------------------------------- |
| ✨ 自然語言下任務   | 新建工作列一句話下達需求，無需拆分複雜步驟                                 |
| 📋 自主規劃執行   | 自動拆解任務、規劃步驟並執行操作，交付可驗收成果                              |
| 🗂️ 多模態任務處理 | 文件 / 表格 / PPT / 資料分析等多種任務型別                           |
| 📁 本地檔案操作   | 讀取授權的本地資料夾，批次整理、重新命名、格式轉換                             |
| 📨 助理多平臺接入  | 支援微信、企微、飛書、釘釘、QQ、元寶機器人等 7 種接入方式                       |
| 🧩 技能市場與聯結器 | 零成本 Skill 精選（Agent Browser、Web Search 等）+ 騰訊文件/知識庫聯結器 |

## 常見問題

### 接入 API易 後，我的 API Key 會不會被上傳到 WorkBuddy 雲端？

不會。官方文件明確說明模型配置引數（含 API Key）僅儲存在本地 `workbuddy/models.json` 中，不上傳雲端。使用時 WorkBuddy 僅作為通訊鏈路，將輸入轉發至你配置的 API易 介面，輸出由該模型直接返回；除必要傳輸、安全審計、故障排查、依法留存所必需外，WorkBuddy 不讀取、不儲存對話內容。

### 通過 API易 呼叫模型產生的費用怎麼計算？是否會消耗 WorkBuddy 的積分/套餐？

不會消耗 WorkBuddy 自身的積分或套餐額度。自定義模型產生的全部費用（Token 消耗、訂閱費用等）由您直接向 API易 支付和結算，請自行關注 API易 賬戶中的餘額與用量，避免產生超出預期的支出。

### 是否支援 Anthropic 原生協議（anthropic\_messages）接入？

目前 WorkBuddy 的自定義模型配置彈窗僅支援 **OpenAI 相容協議 API**（彈窗頂部有明確標註）。因此接入 API易 時請使用其 OpenAI 相容端點 `https://api.apiyi.com/v1/chat/completions`，暫不支援 Anthropic 原生協議端點。

### 「自定義協議」開關什麼時候需要開啟？介面地址要填到什麼程度？

「自定義協議」僅當你對接的模型服務經過閘道或代理層封裝、使用了非標準 URL 路徑時才需要開啟——開啟後 WorkBuddy 會跳過路徑校驗，直接按你填寫的地址發起請求。API易 提供的是標準 `/chat/completions` 路徑，保持該開關**預設關閉**即可。無論開關是否開啟，介面地址都建議**完整填寫**為 `https://api.apiyi.com/v1/chat/completions`（末尾帶 `/chat/completions`），不要只填 base 地址（如 `https://api.apiyi.com` 或 `https://api.apiyi.com/v1`），也不要重複拼接 `/v1` 導致變成 `.../v1/v1/chat/completions` 觸發 404。

### 工具呼叫 / 圖片輸入 / 推理模式這幾個能力標記該怎麼勾選？

選擇騰訊雲 Token Plan 等標準供應商時這些標記會自動寫入；但選擇「自定義 / Custom」接入 API易 時不會自動識別，需要根據你填寫的模型 ID 的實際能力手動勾選，不確定時建議**寧可少勾、不要多勾**。例如上方截圖中的 `claude-sonnet-5` 只勾選了工具呼叫；如果你確認所用模型也支援圖片輸入或具備推理增強能力，再補勾對應選項。勾選與模型實際能力不符可能導致呼叫報錯。

### 模型名稱一欄應該填什麼？

填入 API易 文件中對應的模型 ID 即可，例如 `claude-sonnet-5`、`gpt-5.4`、`deepseek-v3.2`、`gemini-3.1-pro-preview`、`kimi-k2.6` 等。切換模型只需回到設定中修改該欄位並儲存，無需重新配置介面地址和 API Key。

## 相關資源

| 資源                    | 連結                                                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 🌐 WorkBuddy 官網       | `www.workbuddy.cn`                                                                                                           |
| 📖 官方文件首頁             | `www.workbuddy.cn/docs/workbuddy/Overview`                                                                                   |
| ⚙️ 模型配置官方文件           | `www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Model`                                   |
| ⬇️ Windows / Mac 安裝指南 | `www.workbuddy.cn/docs/workbuddy/From-Beginner-to-Expert-Guide/Installation-Win-Guide`（Mac 版路徑同目錄下 `Installation-Mac-Guide`） |
