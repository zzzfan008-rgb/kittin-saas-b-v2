> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Trae

> 字節跳動推出的 AI 原生 IDE，內建 Builder/Chat/Inline Chat 多模式智慧體程式設計；通過自定義模型對接 API易，一鍵覆蓋 OpenAI 與 Anthropic 兩套協議、400+ 主流模型。

## 概述

**Trae** 是字節跳動於 2025 年 1 月推出的 **AI 原生 IDE**（AI-native IDE），定位為面向專業開發者的「Vibe Coding」生產力工具——用自然語言描述需求，AI 自動完成程式碼補全、缺陷修復、專案構建與一鍵預覽。Trae 同時提供 **國內版**（`trae.cn`）與 **國際版**（`trae.ai`），並衍生出 **SOLO** 系列（SOLO Desktop / SOLO App / SOLO Web）讓 AI 直接接管任務全流程。

通過 Trae 的「自定義模型」能力接入 API易後，你可以獲得：

<CardGroup cols={2}>
  <Card title="🔌 雙協議覆蓋" icon="plug">
    同時配置 OpenAI 與 Anthropic 協議，一把令牌驅動兩套服務商
  </Card>

  <Card title="🤖 400+ 主流模型" icon="layers">
    GPT、Claude、Gemini、DeepSeek、Doubao、Qwen 等一站打通
  </Card>

  <Card title="💰 ClaudeCode 95 折" icon="piggy-bank">
    建立令牌時選擇 ClaudeCode 分組，Claude 系列享 95 折，可疊加充值優惠
  </Card>

  <Card title="🛡️ 國內外穩定直連" icon="shield">
    免去自建翻牆/代理閘道，主域名 `api.apiyi.com` 國內可直連
  </Card>
</CardGroup>

<Info>
  **產品資訊**

  * 🔗 國內版官網：`www.trae.cn`
  * 🔗 國際版官網：`www.trae.ai`
  * 👥 開發方：字節跳動（ByteDance）
  * 📅 首次釋出：2025 年 1 月
  * 🧩 內建模式：Builder（智慧體）/ Chat（側邊欄對話）/ Inline Chat（行內對話）
  * 🌐 相容協議：OpenAI、Anthropic 等多種第三方接入
</Info>

## 核心功能

### 三種互動模式

* **Builder 模式**：AI 智慧體接管任務，自動讀寫多檔案、執行命令、構建專案
* **Chat 模式**：側邊欄對話，類似 Cursor Chat / Cline，適合查詢與程式碼片段生成
* **Inline Chat**：在編輯器內直接 `Cmd/Ctrl + I` 喚起，行內補全和重構最快路徑

### MCP 與工具生態

* 內建 **MCP（Model Context Protocol）** 支援，可接入外部工具與 API
* 支援 **Remote-SSH**：遠端開發場景與本地體驗一致
* `.rules` 專案級規則檔案，約束 AI 行為風格

### 自定義模型（本文重點）

Trae 國際版自帶 **Anthropic、OpenAI、Gemini、xAI、OpenRouter、Ollama、DeepSeek、火山引擎、阿里雲、騰訊雲、矽基流動、PPIO、Novita、BytePlus** 等服務商預設，每個預設都允許填寫**自定義模型 ID + API Key + 自定義請求地址**——這正是把 API易 接進 Trae 的關鍵入口。

<Tip>
  **為什麼要接 API易**：Trae 自帶模型受地區與版本限制，且沒法一鍵疊加上下游賬單。接 API易 後，**一個令牌同時覆蓋 OpenAI / Anthropic 兩套協議**，模型切換不再需要回到設定面板換 Provider，直接在 Trae 頂部模型下拉里選即可。
</Tip>

<Warning>
  **⚠️ 模型相容性必讀（接入前先看）**

  1. **Trae 不支援 Responses 協議**：自定義模型只有 `/v1/chat/completions`（OpenAI 協議）和 `/v1/messages`（Anthropic 協議）兩條通道。而 OpenAI 從 GPT-5.4 系列起把「推理 + 工具呼叫」限制在 `/v1/responses` 端點，所以 **`gpt-5.4` / `gpt-5.5` / `gpt-5.6` 全系在 Trae 的 Builder / Chat（帶工具）場景直接報 400，等於用不了**——哪怕 `gpt-5.4` 也不行（詳見下方常見問題）。
  2. **OpenAI 相容 chat 模式做 Agent 體驗差**：即便換不受限的 GPT 模型，chat 相容模式對 Agent 工作流和高階工具權限的支援也不完整，Builder 模式容易跑不通、體驗打折。
  3. **在 Trae 裡推薦用 Claude 系列**：走 Anthropic 原生協議 `/v1/messages`，Builder 工具呼叫完整、穩定，是我們的首選推薦。
  4. **在 Trae 裡用不了的模型（最新 GPT 系），請改用 [Codex APP](/zh-Hant/scenarios/programming/codex-cli)**：Codex 原生走 Responses 協議，`gpt-5.6-sol` / `gpt-5.5` 等都能完整發揮。
</Warning>

## 快速開始

### 第一步：安裝 Trae

<Tabs>
  <Tab title="國內版（推薦中國大陸使用者）">
    訪問 `www.trae.cn` 下載，支援 macOS 與 Windows。國內版內建豆包、DeepSeek 等模型，賬號登入用手機號。
  </Tab>

  <Tab title="國際版">
    訪問 `www.trae.ai` 下載，支援 macOS、Windows、Linux。國際版預設提供 GPT/Claude/Gemini 等海外模型預設。
  </Tab>
</Tabs>

### 第二步：獲取 API易 令牌

1. 訪問 API易 控制台令牌頁面：`api.apiyi.com/token`
2. 點選「新建令牌」
3. **如果主要使用 Claude 系列**：選擇 **【ClaudeCode】分組**，可享 **95 折優惠**（可疊加充值贈送 10%-20%）
4. **如果混用 GPT/Gemini/DeepSeek 等**：選擇 **【Default】預設分組** 即可
5. 複製以 `sk-` 開頭的金鑰備用

### 第三步：在 Trae 中開啟「自定義模型」入口

* **IDE 模式下**：點選右上角 ⚙️ 設定圖示 → 左側導航 **模型** → 點選「新增模型」/「自定義模型」
* **SOLO 模式下**：點選對話面板右上角 ⚙️ → **模型** → 新增

### 第四步：新增 OpenAI 協議入口（GPT / Gemini / DeepSeek / Doubao 等）

按下圖填寫，**自定義請求地址末尾必須帶 `/v1/chat/completions` 完整路徑**，不是隻填域名：

<img src="https://mintcdn.com/apiyillc/vSACm1ThocKlKALW/images/trae-custom-model-openai.png?fit=max&auto=format&n=vSACm1ThocKlKALW&q=85&s=3b59889c3ae27a374a6da691beca2ffa" alt="Trae 自定義模型 - OpenAI 協議對接 API易，自定義請求地址 https://api.apiyi.com/v1/chat/completions" width="477" height="521" data-path="images/trae-custom-model-openai.png" />

| 欄位          | 填寫值                                                    | 說明                             |
| ----------- | ------------------------------------------------------ | ------------------------------ |
| **服務商**     | `OpenAI`                                               | 選擇 OpenAI 預設                   |
| **模型**      | `自定義模型`                                                | 下拉里選最末尾的「自定義模型」                |
| **模型 ID**   | 如 `gpt-5.1`、`deepseek-v4-flash`、`gemini-3-pro-preview` | 填寫要使用的模型完整 ID                  |
| **API 金鑰**  | `sk-...`                                               | 貼上上一步獲取的 API易 令牌               |
| **自定義請求地址** | `https://api.apiyi.com/v1/chat/completions`            | **必須含 `/v1/chat/completions`** |

<Warning>
  **Base URL 必須帶完整路徑**：Trae 從 v3.3.51 起的自定義模型 baseURL 欄位要求填**完整介面路徑**，只填 `https://api.apiyi.com` 或 `https://api.apiyi.com/v1` 都會報錯。
</Warning>

<Note>
  **此入口適用的模型**：`gpt-5.1` / `gpt-5.2`、Gemini、DeepSeek、Doubao、Qwen 等走 chat 協議不受限的模型。**`gpt-5.4` 及更新的 GPT（5.5 / 5.6 系）不適用**——原因見上方「模型相容性必讀」，這些模型請改用 [Codex APP](/zh-Hant/scenarios/programming/codex-cli)。
</Note>

### 第五步：新增 Anthropic 協議入口（Claude 系列）

如果你要用 Claude Opus 4.6 / Sonnet 4.6 / Haiku 4.5 等，再新增一個 Anthropic 服務商條目：

<img src="https://mintcdn.com/apiyillc/vSACm1ThocKlKALW/images/trae-custom-model-anthropic.png?fit=max&auto=format&n=vSACm1ThocKlKALW&q=85&s=18c4c41f103b88df7402ab92a99aa059" alt="Trae 自定義模型 - Anthropic 協議對接 API易，自定義請求地址 https://api.apiyi.com/v1/messages" width="476" height="440" data-path="images/trae-custom-model-anthropic.png" />

| 欄位          | 填寫值                                   | 說明                                                 |
| ----------- | ------------------------------------- | -------------------------------------------------- |
| **服務商**     | `Anthropic`                           | 選擇 Anthropic 預設                                    |
| **模型**      | `Claude-Sonnet-4.6`（或下拉里其他 Claude 版本） | 直接選官方預設，不必走「自定義模型」                                 |
| **API 金鑰**  | `sk-...`                              | 貼上 API易 令牌（建議用 ClaudeCode 分組的令牌）                   |
| **自定義請求地址** | `https://api.apiyi.com/v1/messages`   | **必須含 `/v1/messages`**，注意不是 `/v1/chat/completions` |

<Info>
  **兩套協議的差別**：OpenAI 協議走 `/v1/chat/completions`，Anthropic 協議走 `/v1/messages`。API易 同時託管兩套端點，所以同一把令牌可以在 Trae 裡同時綁兩個服務商條目，互不干擾。
</Info>

### 第六步：切換模型開幹

回到編輯器，點選頂部模型下拉框，剛才新增的兩個服務商和它們下面的模型都會出現在列表裡。選中即可開始對話或進入 Builder 模式。

## 推薦模型搭配

<CardGroup cols={2}>
  <Card title="日常程式設計（價效比）" icon="code">
    **Claude Sonnet 4.6**（Anthropic 協議）+ **GPT-5.1**（OpenAI 協議）

    Sonnet 4.6 程式設計能力極強、價效比高；GPT-5.1 在 Chat 模式回覆更快
  </Card>

  <Card title="複雜架構（旗艦）" icon="crown">
    **Claude Opus 4.6**（Anthropic 協議）

    複雜重構、跨檔案分析、架構決策首選；建議配合 Builder 模式
  </Card>

  <Card title="深度推理" icon="brain">
    **Claude Sonnet 4.6 Thinking** / **GPT-5.1 Thinking**

    強制啟用思維鏈，適合演算法題、邏輯推理、安全審計
  </Card>

  <Card title="國產高性價比" icon="banknote">
    **DeepSeek V4** / **Doubao 1.5 Pro** / **Qwen3 Coder**

    走 OpenAI 協議接入，單價低、中文輸出自然
  </Card>
</CardGroup>

<Info>
  **為什麼推薦清單裡沒有最新 GPT（5.4 及更新）**：Trae 不支援 Responses 協議，`gpt-5.4` / `gpt-5.5` / `gpt-5.6` 全系在 Builder / Chat 的工具呼叫場景會直接 400（見上方「模型相容性必讀」）。想用這批模型請轉 [Codex APP](/zh-Hant/scenarios/programming/codex-cli)；在 Trae 內做 Agent 任務，Claude 系列（Anthropic 原生協議）是最穩的選擇。
</Info>

<Card title="檢視完整模型列表與程式設計模型推薦" icon="star" href="/zh-Hant/api-capabilities/model-info">
  API易 通過統一介面提供 400+ 主流模型，模型推薦頁持續更新最新效能與價格對比。
</Card>

## 使用技巧

<Steps>
  <Step title="兩個服務商條目同時保留">
    OpenAI 與 Anthropic 兩個入口建議**都加上**，這樣切換 GPT/Gemini ↔ Claude 時不用回設定改 baseURL。
  </Step>

  <Step title="模型 ID 找不到？">
    Trae 預設列出的官方模型號往往跟不上 API易 最新模型節奏。**選「自定義模型」手動填模型 ID** 是最穩妥的做法——以 API易 控制台 / 模型推薦頁公佈的 ID 為準。
  </Step>

  <Step title="Builder 模式優先選 Claude">
    Builder 智慧體會自動多輪工具呼叫，Claude 系列（尤其是 Sonnet 4.6 / Opus 4.6）在指令跟隨和工具呼叫穩定性上明顯優於其他家。
  </Step>

  <Step title="複雜任務掛 Thinking 模型">
    模型 ID 後面加 `-thinking` 字尾（如 `claude-sonnet-4-6-thinking`），可強制啟用思維鏈。在 Builder 模式做架構決策、安全審計時顯著降低翻車率。
  </Step>

  <Step title="令牌按分組拆開管理">
    Claude 系列單獨建一把 **ClaudeCode 分組令牌**（95 折）；GPT/Gemini/DeepSeek 用 **Default 分組令牌**。兩把令牌分別貼到兩個服務商條目，賬單與配額一目瞭然。
  </Step>
</Steps>

## 常見問題

<AccordionGroup>
  <Accordion title="Trae 國內版 vs 國際版，對接 API易 有差別嗎？">
    **沒差別**——兩個版本都支援自定義模型，且都允許同時新增 OpenAI 與 Anthropic 兩類服務商條目。區別主要在內建預設模型不同（國內版主推豆包/DeepSeek，國際版主推 GPT/Claude/Gemini）。

    選擇建議：中國大陸網路環境優先國內版（`trae.cn`），全球團隊協作或需要海外模型預設走國際版（`trae.ai`）。
  </Accordion>

  <Accordion title="為什麼 baseURL 必須填到 /v1/chat/completions 這一級？">
    Trae 從 **v3.3.51** 起調整了自定義模型的 baseURL 解析規則：直接把這個欄位拼到請求裡，不再做「自動補 `/chat/completions`」的相容處理。

    所以正確寫法：

    * OpenAI 協議：`https://api.apiyi.com/v1/chat/completions`
    * Anthropic 協議：`https://api.apiyi.com/v1/messages`

    錯誤寫法（會觸發 404 或路由錯誤）：

    * ❌ `https://api.apiyi.com`
    * ❌ `https://api.apiyi.com/v1`
  </Accordion>

  <Accordion title="Anthropic 服務商下能用「自定義模型」填任意模型 ID 嗎？">
    可以。Trae 的 Anthropic 服務商條目同樣支援「自定義模型」選項，填入 `claude-opus-4-6` / `claude-sonnet-4-6-thinking` / `claude-haiku-4-5-20251001` 等具體模型 ID 即可。API易 的 `/v1/messages` 端點對官方模型 ID 完全相容。
  </Accordion>

  <Accordion title="如何享受 Claude 系列 95 折？">
    在 API易 控制台 `api.apiyi.com/token` 建立令牌時，**分組選 ClaudeCode** 即可自動享受 95 折優惠（5% off），可疊加充值贈送 10%-20%。

    把這把 ClaudeCode 分組令牌粘到 Trae 的 Anthropic 服務商條目裡，Claude 呼叫就自動走折扣。
  </Accordion>

  <Accordion title="為什麼我在 Trae 裡看不到 GPT-5.1 / Claude 4.6 等新模型？">
    Trae 內建預設的模型號更新會滯後於實際供給方。**最佳實踐是直接選「自定義模型」手動填 ID**——只要 API易 後端支援的模型，你就能在 Trae 裡跑起來，不必等 Trae 客戶端更新預設。
  </Accordion>

  <Accordion title="Builder 模式經常卡住 / 工具呼叫失敗怎麼辦？">
    1. **優先用 Claude Sonnet 4.6 或 Opus 4.6**：這兩款在工具呼叫穩定性上明顯領先
    2. **避開非推理版本的小模型**：DeepSeek-Chat / Qwen 系列做 Builder 容易死迴圈，建議切到帶 `thinking` 字尾的推理版本
    3. **檢查上下文長度**：單檔案超長或多檔案大改時切到 Opus 4.6（200K 上下文）
    4. **觀察 API易 即時動態**：偶發的上游波動會影響所有客戶端，確認是否為通道問題
  </Accordion>

  <Accordion title="呼叫 gpt-5.6 / gpt-5.5 / gpt-5.4 報 400：Function tools with reasoning_effort are not supported？">
    完整報錯通常長這樣：`Function tools with reasoning_effort are not supported for gpt-5.6-sol in /v1/chat/completions. To use function tools, use /v1/responses or set reasoning_effort to 'none'.`（400，`invalid_request_error`）。

    這是 **OpenAI 從 GPT-5.4 系列起的官方限制**，不是 API易 通道問題：在 `/v1/chat/completions` 端點上，function tools（工具/函式呼叫）不能與非 `none` 的 `reasoning_effort` 同時使用。OpenAI 給的兩條出路：改用 `/v1/responses` 端點，或顯式把 `reasoning_effort` 設為 `none`（放棄推理）。這條限制的完整判斷方法與遷移步驟見 [端點選型與遷移](/zh-Hant/api-capabilities/openai/responses-migration)。

    問題在於 Trae 這兩條都做不到：自定義模型只支援 `/v1/chat/completions`（OpenAI 協議）和 `/v1/messages`（Anthropic 協議），不支援 Responses API，也沒有 `reasoning_effort` 設定項；而 Builder / Chat 模式必然攜帶工具定義——**客戶端側無法繞過**。JetBrains AI Assistant、opencode 等同類客戶端也在 GPT-5.4+ 上踩過同一個坑。

    解決辦法：

    1. **在 Trae 中改用不受限模型**：`gpt-5.1` / `gpt-5.2`（OpenAI 協議），或 Claude 系列（Anthropic 協議走 `/v1/messages`）、Gemini / DeepSeek 等
    2. **不離開 Trae**：在 Trae 中安裝 [Roo Code](/zh-Hant/scenarios/programming/roo-code) 外掛，其「OpenAI」provider 走 `/v1/responses`，實測在 Trae 內工具呼叫正常——相當於補上 Responses 通道。注意 Roo Code 已停更，預置模型止步 `gpt-5.4`
    3. **必須用 gpt-5.5 / 5.6 的推理 + 工具呼叫**：改用支援 Responses API 的客戶端——[Codex APP / CLI](/zh-Hant/scenarios/programming/codex-cli)、[opencode](/zh-Hant/scenarios/programming/opencode) 均可，完整支援清單與呼叫方式見 [OpenAI Responses API 原生呼叫指南](/zh-Hant/api-capabilities/openai/native)
  </Accordion>

  <Accordion title="Trae 的隱私 / 資料上傳如何處理？">
    Trae 是字節跳動開發的客戶端，會按其官方隱私政策上傳必要的遙測與對話資料。如果你對客戶端遙測敏感，建議：

    * 在企業網路出口做白名單控制
    * 關鍵程式碼片段開 Builder 模式前做脫敏
    * 選擇 [`Claude Code`](/zh-Hant/scenarios/programming/claude-code) / [`Cline`](/zh-Hant/scenarios/programming/cline) 等開源/可審計客戶端作為備選
  </Accordion>

  <Accordion title="Trae 與 Cursor / Cline / Claude Code 怎麼選？">
    | 工具              | 型別         | Agent 模式  | 接 API易 難度      | 適合場景                         |
    | --------------- | ---------- | --------- | -------------- | ---------------------------- |
    | **Trae**        | 獨立 IDE     | ✅ Builder | 中（雙協議兩條目）      | 想要 Cursor 體驗但首選國產 IDE / 中文場景 |
    | **Cursor**      | 獨立 IDE     | ❌（僅 Chat） | 易（僅 OpenAI 協議） | 注重補全和程式碼差異預覽                 |
    | **Cline**       | VS Code 外掛 | ✅         | 易              | 已是 VS Code 重度使用者             |
    | **Claude Code** | CLI        | ✅         | 易              | 終端流派、CI / 遠端開發               |

    詳見各頁面：[Cursor](/zh-Hant/scenarios/programming/cursor) · [Cline](/zh-Hant/scenarios/programming/cline) · [Claude Code](/zh-Hant/scenarios/programming/claude-code) · [Codex CLI](/zh-Hant/scenarios/programming/codex-cli)
  </Accordion>

  <Accordion title="請求報 401 / 403 怎麼排查？">
    1. 確認 API 金鑰以 `sk-` 開頭且沒有粘多餘空格
    2. 確認 baseURL 拼寫正確，特別是末尾路徑（`/v1/chat/completions` vs `/v1/messages`）
    3. 在 API易 控制台檢查令牌狀態是否啟用、是否在分組裡綁定了對應模型
    4. 餘額不足也會返回 401，確認賬戶餘額
  </Accordion>
</AccordionGroup>

## 相關資源

<CardGroup cols={2}>
  <Card title="模型推薦" icon="star" href="/zh-Hant/api-capabilities/model-info">
    400+ 模型的效能對比與程式設計場景推薦
  </Card>

  <Card title="API易 控制台" icon="settings" href="https://api.apiyi.com">
    建立令牌、檢視用量、管理分組
  </Card>

  <Card title="Cursor 接入" icon="mouse-pointer-click" href="/zh-Hant/scenarios/programming/cursor">
    另一款主流 AI IDE 的對接教程
  </Card>

  <Card title="Cline 外掛接入" icon="puzzle" href="/zh-Hant/scenarios/programming/cline">
    VS Code 內功能完整的 Agent 模式外掛
  </Card>

  <Card title="Codex APP 接入" icon="code" href="/zh-Hant/scenarios/programming/codex-cli">
    原生 Responses 協議，最新 GPT 系（5.4+）的正確開啟方式
  </Card>
</CardGroup>

<Info>
  **更多幫助**：訪問 API易 官網 `api.apiyi.com` 或加入官方社群獲取技術支援。
</Info>
