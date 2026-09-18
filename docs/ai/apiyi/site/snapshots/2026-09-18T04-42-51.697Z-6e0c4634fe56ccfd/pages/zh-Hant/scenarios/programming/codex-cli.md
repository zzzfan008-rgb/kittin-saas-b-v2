> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Codex

> 一份配置，三處通用：在 Codex 桌面客戶端、IDE 外掛（VSCode/Cursor）和命令列 CLI 中，通過 API易 接入 gpt-5.6-sol / gpt-5.5 / gpt-5.4 等模型。推薦寫 config.toml + auth.json，不折騰環境變數。

<Warning>
  **先說成本**：寫程式碼這類長上下文任務、以及 Agent 需要深度探索的場景，**API 按量計費的消耗相當大，綜合性價比通常不如官網訂閱會員**。

  Codex 每一輪都要反覆讀入專案上下文、翻工具結果、來回改，一次像樣的任務動輒幾十萬 token。真實發生過的情況是：**充 \$5 還沒跑完一次深度調研，額度就見底了**——這不是異常，是這類場景的正常消耗量級。

  * **用量大、且有條件直連官網**：建議直接買 ChatGPT Plus / Pro 官方訂閱，固定月費在高頻重度場景下更划算。
  * **受制於網路環境，或就是想用多少付多少**：那 API 更適合你——免代理直連、無固定月費、無需自行維護官方賬號，還能一把 Key 調 400+ 模型。

  兩種方式沒有絕對優劣，按自己的用量和網路條件選即可。這裡如實告知，避免充值後產生預期落差。
</Warning>

## 概述

<Info>
  **Codex 與 ChatGPT 客戶端已合併**：2026 年 7 月初，OpenAI 將 Codex 桌面客戶端併入 ChatGPT 客戶端，兩者現在是同一個產品。因此本教程**同時適用於 Codex APP 和 ChatGPT 客戶端**——如果你用的是 ChatGPT 客戶端裡的 Codex，配置方法完全一樣。
</Info>

**OpenAI Codex** 是 OpenAI 官方的 AI 程式設計助手，有三種用法：**桌面客戶端**、**IDE 外掛**（VSCode / Cursor 等）、以及**命令列 CLI**。三者在底層**共用同一份配置**（`~/.codex/` 目錄下的 `config.toml` 與 `auth.json`）。

通過 API易接入，本質只有一句話：

> **把 OpenAI 的入口換成 API易**

API易是 **OpenAI 相容介面（透明代理）**——配好一次，桌面客戶端、外掛、終端三處都能用。

<CardGroup cols={2}>
  <Card title="🔁 一份配置三處用" icon="layers">
    桌面 / 外掛 / CLI 共用 `~/.codex/`，配一次全通
  </Card>

  <Card title="⚡ 最新模型" icon="sparkles">
    支援 `gpt-5.6-sol` / `gpt-5.5` / `grok-4.5`，還可用國產模型
  </Card>

  <Card title="💰 按量計費" icon="calculator">
    與 OpenAI 官方 API 計費方式一致，無固定月費
  </Card>

  <Card title="🪟 全平臺" icon="globe">
    Windows / Mac / Linux 通用
  </Card>
</CardGroup>

<Info>
  **先理解再上手**：Codex 接第三方 API（如 API易）的關鍵，是在 `~/.codex/config.toml` 裡把"模型供應商"指向 API易，並在 `~/.codex/auth.json` 裡放你的 Key。**桌面客戶端和 IDE 外掛都靠這份檔案生效**——所以本文以"寫配置檔案"為主，不推薦折騰環境變數。
</Info>

## 一、準備工作：拿到 API易 Key

<Steps>
  <Step title="註冊 / 登入 API易">
    訪問 [api.apiyi.com](https://api.apiyi.com) 註冊或登入你的賬號。
  </Step>

  <Step title="建立 API Key">
    進入「令牌管理」頁面（[api.apiyi.com/token](https://api.apiyi.com/token)），點選「建立新令牌」。
  </Step>

  <Step title="複製金鑰">
    複製生成的 API Key（格式：`sk-***`），妥善儲存，後面要填進配置檔案。
  </Step>
</Steps>

### 選擇你的入口

三種入口都可以，**配置完全一樣**，按習慣挑一個即可：

<CardGroup cols={3}>
  <Card title="🖥️ 桌面客戶端" icon="monitor">
    獨立 App，開箱即用，**最推薦新手**
  </Card>

  <Card title="🧩 IDE 外掛" icon="puzzle">
    VSCode / Cursor 擴充套件，邊寫程式碼邊用
  </Card>

  <Card title="⌨️ 命令列 CLI" icon="terminal">
    終端工作流，適合指令碼與自動化
  </Card>
</CardGroup>

## 二、核心配置（推薦：寫配置檔案，不折騰環境變數）

下面三種配置方式，**任選其一**。推薦順序：手動寫檔案（最穩）→ 視覺化 → 環境變數。

### 方式一 · 手動寫 `auth.json` + `config.toml`（推薦、最穩）

進入 Codex 的配置目錄（沒有就新建），在裡面放/改兩個檔案：

<Tabs>
  <Tab title="🪟 Windows">
    配置目錄：`%USERPROFILE%\.codex\`（即 `C:\Users\你的使用者名稱\.codex\`）。

    用檔案資源管理器進入該目錄。
  </Tab>

  <Tab title="Mac / Linux">
    配置目錄：`~/.codex/`。

    可在終端執行 `mkdir -p ~/.codex` 進入。
  </Tab>
</Tabs>

<Warning>
  **如果 `config.toml` 已經存在，不要整體覆蓋！** 它裡面可能已有你之前設定的模型偏好、審批策略、MCP 伺服器等。正確做法是**先備份、再合併**（見下方「如何安全地改已有 config.toml」），只把 API易 需要的幾行加進去。`auth.json` 同理，已有就改 `OPENAI_API_KEY` 的值即可。
</Warning>

**1）`auth.json`——把 Key 放進去：**

```json theme={null}
{
  "OPENAI_API_KEY": "sk-你的APIYI金鑰"
}
```

**2）`config.toml`——把模型供應商指向 API易：**

如果是**全新檔案**，直接寫入下面內容；如果**已有檔案**，把"全域性鍵"加到檔案**最頂部**、把 `[model_providers.apiyi]` 整段加到檔案**最末尾**（原因見下方提示）。

```toml theme={null}
# === 全域性（放在檔案最頂部）===
model = "gpt-5.4"                 # 預設模型，可按需改成 gpt-5.5 等
model_provider = "apiyi"          # 使用下面定義的 apiyi 供應商
preferred_auth_method = "apikey"  # 用 API Key 認證（不要用 chatgpt 登入）

# === API易 供應商定義（放在檔案最末尾）===
[model_providers.apiyi]
name = "apiyi"
base_url = "https://api.apiyi.com/v1"
experimental_bearer_token = "sk-你的APIYI金鑰"
wire_api = "responses"
```

<Warning>
  **先把 `sk-你的APIYI金鑰` 換成你的真實 Key** 再儲存（就是上一步在 `api.apiyi.com/token` 複製的那串 `sk-` 開頭的字元）。兩個檔案裡的 Key 要一致。
</Warning>

<Accordion title="如何安全地改已有 config.toml（備份 + 合併的最佳實踐）">
  **第 1 步：先備份。** 改任何配置前，把原檔案複製一份，出問題隨時能還原：

  ```bash theme={null}
  # Mac / Linux
  cp ~/.codex/config.toml ~/.codex/config.toml.bak

  # Windows PowerShell
  Copy-Item $env:USERPROFILE\.codex\config.toml $env:USERPROFILE\.codex\config.toml.bak
  ```

  **第 2 步：合併，而不是覆蓋。** 只往已有檔案里加 API易 需要的內容：把 `model` / `model_provider` / `preferred_auth_method` 三行放到檔案**最頂部**，把 `[model_providers.apiyi]` 整段追加到檔案**最末尾**。原有的其它配置原樣保留。

  <Warning>
    **TOML 順序陷阱**：在 TOML 裡，所有"裸鍵值對"（如 `model = "..."`）**必須出現在任何 `[xxx]` 表頭之前**，否則它會被算進上一個表裡。所以全域性鍵放最上面、`[model_providers.apiyi]` 放最下面，是最不容易出錯的寫法。
  </Warning>

  **第 3 步：如果只是想臨時試一下、又不想動主配置**，可以用 profile：新建 `~/.codex/apiyi.config.toml` 放上面這套內容，執行時 `codex --profile apiyi` 即可，互不影響（詳見[進階配置](#六進階配置)）。
</Accordion>

<Note>
  **欄位說明**：

  * `base_url`：固定寫 `https://api.apiyi.com/v1`，**必須帶 `/v1`**，否則 404。
  * `experimental_bearer_token`：把 Key 直接寫在供應商塊裡，請求時作為 Bearer 傳送。**這是桌面客戶端 / IDE 外掛 / CLI 三處都確定生效的寫法**，不依賴環境變數。
  * 供應商的認證欄位**三選一、不能混寫**：`experimental_bearer_token`（Key 寫在配置裡，推薦）/ `env_key`（從**啟動程序的環境變數**讀 Key——注意它**不會**去讀 `auth.json`，且桌面客戶端讀不到終端裡 export 的變數）/ `requires_openai_auth`（複用 `auth.json` 的官方登入態）。按舊版本文件同時寫了 `env_key` + `requires_openai_auth` 的，請改成本文當前寫法。
  * `wire_api = "responses"`：Codex 預設且首選的協議，API易 已支援。個別模型若報 404 / unknown endpoint，改成 `"chat"` 兜底（見[進階配置](#六進階配置)）。
  * 不要在本檔案裡寫形如 `C:\Users\xxx\.codex\...` 的絕對路徑，換臺機器會斷。
</Note>

### 方式二 · cc-switch 視覺化配置（圖形介面，免手動編輯）

不想手動編輯檔案，可以用 **CC Switch**——一個圖形介面工具，點幾下就能把 API易 的地址、Key、模型寫進 Codex 配置，還能統一管理 Claude Code、Codex、Gemini CLI 等多款工具，一鍵切換。它也會自動處理上面的備份/合併，新手可優先考慮。

詳見 [CC Switch 視覺化配置](/zh-Hant/scenarios/programming/cc-switch)。配好後，Codex 的桌面客戶端 / 外掛 / CLI 都會自動讀到這份配置。

### 方式三 · 環境變數（可選，較複雜，不推薦為主路徑）

<Accordion title="只想臨時在終端測試？展開看環境變數方式（不推薦長期用）">
  Codex CLI 也能讀 `OPENAI_BASE_URL` / `OPENAI_API_KEY` 兩個環境變數：

  ```bash theme={null}
  export OPENAI_BASE_URL="https://api.apiyi.com/v1"
  export OPENAI_API_KEY="sk-你的APIYI金鑰"
  ```

  <Warning>
    **不推薦作為主路徑**：環境變數方式在新版 Codex 上經常不生效，且**桌面客戶端 / IDE 外掛不讀這兩個變數**——它們只認 `config.toml` + `auth.json`。環境變數僅適合 CLI 臨時測試，長期使用請用方式一或方式二。
  </Warning>
</Accordion>

## 三、三處怎麼用（優先桌面客戶端）

配好上面的 `~/.codex/` 後，下面三種入口任選。**改完配置都要重啟對應程式**（Codex 只在啟動時讀一次配置）。

### 1. Codex 桌面客戶端（最推薦）

1. 安裝並開啟 Codex 桌面客戶端。
2. 首次開啟時選擇認證方式：**選 apikey**（不要選 chatgpt 登入）。
3. 在模型 / 供應商選擇處，選中配置裡的 `apiyi` 供應商與目標模型（如 `gpt-5.4`）。
4. **重啟客戶端**生效。
5. 跑一個最小任務驗證（見[第四節](#四最小驗證)）。

### 2. IDE 外掛（VSCode / Cursor）

1. 開啟擴充套件市場（VSCode 按 `Ctrl+Shift+X` / `Cmd+Shift+X`），搜尋 `Codex — OpenAI's coding agent`，點 `Install`。
2. 安裝後左側邊欄出現 Codex 圖示，點選打開面板。
3. 首次開啟按提示三連：①認證方式**選 apikey**；②Key 來源選「配置檔案 / 環境變數」；③是否啟用 `AGENTS.md`（推薦開啟）。
4. **重啟編輯器**生效。
5. 在 Codex 面板跑最小任務驗證。

### 3. 命令列 CLI

先全域性安裝官方 CLI（需要 Node.js 18+）：

```bash theme={null}
npm install -g @openai/codex
codex --version
```

進入專案直接啟動，或一句話執行任務：

```bash theme={null}
cd /your/project
codex                                  # 互動模式
codex "幫我寫一個 Python HTTP Server"   # 直接帶任務
codex -q "修復當前專案的構建錯誤"        # 非互動/靜默模式
```

<Tip>
  Mac 使用者若遇到全域性安裝權限問題，推薦用 nvm / fnm 管理 Node 版本，避免 `sudo`。
</Tip>

## 四、最小驗證

配好並重啟後，在任一入口裡輸入一個最小任務：

```text theme={null}
請用中文在當前專案中建立一個 hello 介面，並附上呼叫示例。
```

CLI 使用者也可以直接：

```bash theme={null}
codex -q "hello"
```

能正常返回並給出可執行程式碼，就說明 API易 鏈路已經打通。

## 五、模型說明（API易 推薦）

在 `config.toml` 的 `model` 欄位、或執行時切換即可選用以下模型：

| 模型                   | 特點                           | 適用場景                         |
| -------------------- | ---------------------------- | ---------------------------- |
| **`gpt-5.6-sol`**    | 5.6 旗艦（2026年7月9日 釋出）         | 最難的問題：複雜編碼、深度工程分析、Agent 工作流  |
| **`gpt-5.6-terra`**  | 5.6 均衡檔                      | 大批次業務任務，效能與成本均衡              |
| **`gpt-5.6-luna`**   | 5.6 快速低價檔                    | 摘要、草稿、日常自動化，快且省              |
| **`gpt-5.5`**        | 上代主力模型                       | 複雜程式碼任務、工程分析、Agent 工作流       |
| **`gpt-5.4`**        | 穩定常用                         | 大多數程式碼開發、除錯、重構（預設推薦）         |
| **`gpt-5.4-mini`**   | 便宜的 5.4 變體                   | 中小規模任務、批次處理、省錢               |
| **`grok-4.5`**       | xAI 旗艦，**原生支援 responses 協議** | 程式碼 Agent、複雜任務，OpenAI 系之外的首選 |
| **`grok-build-0.1`** | Grok 程式碼專用，全系最低價             | 高頻程式碼補全、輕量程式設計任務             |

<Tip>
  **怎麼選**：日常 → `gpt-5.4` 或 `gpt-5.6-terra`；重活 / Agent → `gpt-5.6-sol`（或 `gpt-5.5`）；省錢 → `gpt-5.6-luna` / `gpt-5.4-mini`；OpenAI 之外想換口味 → `grok-4.5`。
</Tip>

<Note>
  **為什麼特別推薦 Grok**：xAI 官方 API 本身就是 OpenAI 相容雙端點（Chat Completions + Responses API），所以 Grok 是**難得原生支援 `/v1/responses` 協議的非 OpenAI 模型**——在 Codex 裡保持 `wire_api = "responses"` 不用改，把 `model` 換成 `grok-4.5` 即可，Codex 的 Agent 能力（工具呼叫、推理條目等）都按原生協議走。responses 端點在 API易 上以 `grok-4.5` 實測通過，其餘 Grok 型號同架構預期一致，個別遇 404 可按[第六節](#六進階配置)兜底。詳見 [Grok API 呼叫指南](/zh-Hant/api-capabilities/grok/overview)。

  **對比 Claude / Gemini**：這兩家在 API易 上走的是 **OpenAI 相容 chat 模式，不支援 responses 端點**——在 Codex 裡必須把 `wire_api` 改成 `"chat"` 兜底，而 Codex 的 Agent 場景按 responses 協議設計，chat 模式下工具呼叫等行為可能有不相容、體驗打折。想用 Claude / Gemini 做程式設計，建議用各自原生工具（[Claude Code](/zh-Hant/scenarios/programming/claude-code) / [Gemini CLI](/zh-Hant/scenarios/programming/gemini-cli)）。
</Note>

<Note>
  **也支援國產 / 任意 OpenAI 相容模型**：API易 聚合了大量模型，凡是支援 OpenAI 相容呼叫方式的都能在 Codex 裡用——例如智譜 `glm-5.2`。只需把 `config.toml` 的 `model` 欄位（或執行時 `-m`）換成對應模型 ID 即可。
</Note>

### 切換模型的 4 種方式

**① 啟動時臨時指定**（CLI）：

```bash theme={null}
codex -m gpt-5.5
codex --model gpt-5.4 "幫我檢查這個專案的程式碼結構"
```

**② 非互動模式指定**（CLI）：

```bash theme={null}
codex -q -m gpt-5.4 "修復當前專案裡的構建錯誤"
```

**③ 會話內切換**：在互動面板裡輸入 `/model`，按提示選擇。

**④ 配置預設模型（永久生效）**：編輯 `~/.codex/config.toml`，把 `model` 改成想要的，儲存後重啟：

```toml theme={null}
model = "gpt-5.5"
```

## 六、進階配置

<AccordionGroup>
  <Accordion title="自定義系統提示詞（instructions.md）">
    編輯 `~/.codex/instructions.md`，定義編碼風格、輸出語言、專案規範，例如：

    ```markdown theme={null}
    - 程式碼註釋使用中文
    - 遵循專案的 ESLint 配置
    - 提供詳細的解釋說明
    ```
  </Accordion>

  <Accordion title="專案級 AGENTS.md">
    在專案裡執行 `codex /init` 會生成 `AGENTS.md`，記錄專案結構與規範。如需 Codex 預設用中文交流，加一行：

    ```markdown theme={null}
    本專案請始終用中文跟使用者交流。
    ```
  </Accordion>

  <Accordion title="協議兜底：wire_api 改 chat">
    `wire_api = "responses"` 是 Codex 預設且首選的協議，多數模型直接可用。若某個模型返回 404 / unknown endpoint，把 `config.toml` 裡對應供應商的 `wire_api` 改成 `"chat"`（走 `/chat/completions`）再試。
  </Accordion>

  <Accordion title="多套配置切換（profiles）">
    在 `~/.codex/` 下新建 `<名字>.config.toml`（例如 `openai.config.toml` 放官方配置），執行時用 `codex --profile <名字>` 切換。便於在 API易 與其它供應商之間快速切換。
  </Accordion>

  <Accordion title="常用引數">
    ```bash theme={null}
    codex -h          # 檢視完整幫助
    codex -m <模型>   # 指定模型
    codex -q          # 非互動/靜默模式
    codex --full-auto # 自動執行（謹慎使用）
    ```
  </Accordion>
</AccordionGroup>

## 七、排障

<AccordionGroup>
  <Accordion title="1. 報 Missing environment variable: OPENAI_API_KEY（桌面客戶端 / 外掛最常見）">
    明明寫好了 `auth.json` + `config.toml`、也重啟了應用，還是彈 `Missing environment variable: OPENAI_API_KEY`——原因是供應商塊裡寫了 `env_key = "OPENAI_API_KEY"`（舊版本文件的寫法）。

    `env_key` 的語義是**從啟動 Codex 的程序環境變數裡取 Key**，它**不會**去讀 `auth.json`（`auth.json` 只服務於 OpenAI 官方登入態）。而桌面客戶端 / IDE 從 Dock / 啟動器開啟時，**不繼承你在終端裡 export 的變數**（`.zshrc` 裡的 export 對 GUI 應用無效），所以無論重啟多少次都找不到這個變數。

    **修法（推薦）**：編輯 `~/.codex/config.toml`，刪掉供應商塊裡的 `env_key`（如有 `requires_openai_auth` 也一併刪掉），換成把 Key 直接寫進去：

    ```toml theme={null}
    [model_providers.apiyi]
    name = "apiyi"
    base_url = "https://api.apiyi.com/v1"
    experimental_bearer_token = "sk-你的APIYI金鑰"
    wire_api = "responses"
    ```

    改完**重啟**應用即可。

    **備選**（堅持用 `env_key` 時）：把變數設為系統級——macOS 執行 `launchctl setenv OPENAI_API_KEY "sk-你的Key"` 後重啟應用（開機後需重設）；Windows 執行 `setx OPENAI_API_KEY "sk-你的Key"` 後重啟應用。僅用 CLI 的話，在 shell 配置裡 `export` 即可。
  </Accordion>

  <Accordion title="2. 確認 auth.json / config.toml 的路徑和內容無誤">
    * `auth.json` 必須是合法 JSON，且 `OPENAI_API_KEY` 是你真實的 `sk-` 開頭 Key。
    * `config.toml` 必須能被 TOML 正確解析（注意引號、縮排）。
    * 路徑在 Windows `%USERPROFILE%\.codex\`、Mac/Linux `~/.codex/`。
  </Accordion>

  <Accordion title="3. 確認 Key 有效、有可用額度">
    去 API易 控制台確認 Key 沒過期、賬戶有餘額 / 額度。
  </Accordion>

  <Accordion title="4. 確認 base_url 帶 /v1">
    最常見的連線錯誤 / 超時 / 404 都是因為漏了 `/v1`。正確：`https://api.apiyi.com/v1`。其次排查本地代理與 DNS。
  </Accordion>

  <Accordion title="5. 改完配置必須重啟">
    Codex（CLI / 外掛 / 桌面客戶端）都只在啟動時讀一次配置。**改完 `auth.json` / `config.toml` 一定要重啟對應程式**。
  </Accordion>

  <Accordion title="6. 仍不穩定：把 wire_api 改成 chat">
    個別模型在 `responses` 協議下不相容時，把對應供應商的 `wire_api` 改成 `"chat"` 再試。
  </Accordion>
</AccordionGroup>

## 八、常見問題

<AccordionGroup>
  <Accordion title="為什麼能用 API易 接入 Codex？">
    因為 API易**完全相容 OpenAI API 協議**——Codex 看到的 `https://api.apiyi.com/v1` 和 `https://api.openai.com/v1` 在請求/響應格式上一致，僅替換 Base URL 即可。
  </Accordion>

  <Accordion title="為什麼發一個 hello，輸入的 tokens 卻上萬？">
    這通常是**正常現象**：Codex 啟動時會**讀取你當前專案的部分檔案做初始化**（目錄結構、`AGENTS.md`、相關原始碼等），把它們作為上下文一起發給模型。所以即使你只說一句 `hello`，輸入 tokens 也可能上萬。

    **怎麼減少？**

    * 在**空目錄**或一個**很小的專案**裡測試最小任務，上下文自然就小。
    * 給明確的小任務並**指定具體檔案**（如「只看 `app.py`，加一個 hello 介面」），縮小 Codex 主動掃描的範圍。
    * 驗證性的小任務用更便宜的模型（如 `gpt-5.4-mini`）來跑。
  </Accordion>

  <Accordion title="提示 command not found: codex">
    確認已正確安裝：

    ```bash theme={null}
    npm install -g @openai/codex
    codex --version
    ```

    若仍報錯，檢查 `npm bin -g` 路徑是否在 `PATH` 中。
  </Accordion>

  <Accordion title="API Key 無效（401 / Invalid Key）">
    1. 確認用的是 **API易 Key**（以 `sk-` 開頭），不是 OpenAI 官方 Key。
    2. 確認 `auth.json` 裡的 Key 沒填錯、沒多空格。
    3. 改完配置**重啟**對應程式。
  </Accordion>

  <Accordion title="連線錯誤 / 超時 / 404">
    最常見原因：**Base URL 沒帶 `/v1`**。正確寫法：`https://api.apiyi.com/v1`。其次排查本地代理與 DNS。
  </Accordion>

  <Accordion title="能用哪些模型？">
    * **OpenAI 系列**：✅ 完整支援（推薦 `gpt-5.6-sol` / `gpt-5.6-terra` / `gpt-5.6-luna` / `gpt-5.5` / `gpt-5.4`）。
    * **Grok 系列**：✅ 原生支援 responses 協議，`grok-4.5` 無需改 `wire_api` 直接可用，詳見 [Grok API 呼叫指南](/zh-Hant/api-capabilities/grok/overview)。
    * **國產 / 其它 OpenAI 相容模型**：API易 支援，如 `glm-5.2`，改 `model` 欄位即可。
    * 注意：**Claude / Gemini 在 API易 上只有 OpenAI 相容 chat 模式、不支援 responses 端點**，在 Codex 裡須把 `wire_api` 改成 `"chat"`，工具呼叫等 Agent 行為可能有不相容。想用 Claude / Gemini 做程式設計，建議用對應原生工具（如 Claude Code / Gemini CLI）。
  </Accordion>

  <Accordion title="桌面客戶端 / 外掛沒生效，怎麼辦？">
    桌面客戶端和 IDE 外掛**只讀 `~/.codex/config.toml` + `auth.json`，不讀環境變數**。請確認這兩個檔案配置正確，認證方式選了 **apikey**，並**重啟**程式。
  </Accordion>

  <Accordion title="適合生產嗎？">
    * **CLI / 客戶端**：適合開發期效率工具。
    * **生產**：建議直接呼叫 API（更可控、可監控、可灰度）。
  </Accordion>

  <Accordion title="如何解除安裝或停用 API易 配置？">
    **解除安裝 CLI**：

    ```bash theme={null}
    npm uninstall -g @openai/codex
    ```

    **停用 API易 配置**：刪除或還原 `~/.codex/config.toml` 與 `auth.json` 即可（解除安裝桌面客戶端 / 外掛則在各自介面操作）。
  </Accordion>
</AccordionGroup>

## 九、總結

這類接入本質就一句話：

> **把 OpenAI 的入口換成 API易**

核心就是在 `~/.codex/` 配好一次：`auth.json` 放 Key，`config.toml` 把 `base_url` 指向 `https://api.apiyi.com/v1`。配好後，**桌面客戶端、IDE 外掛、命令列三處都能用**。剩下都是錦上添花——選模型、寫提示詞、自定義 `instructions.md` / `AGENTS.md`。

## 相關資源

<CardGroup cols={2}>
  <Card title="API易控制台" icon="settings" href="https://api.apiyi.com">
    管理 API 金鑰與檢視用量
  </Card>

  <Card title="CC Switch 視覺化配置" icon="toggle-left" href="/zh-Hant/scenarios/programming/cc-switch">
    圖形介面一鍵配置 Codex / Claude Code
  </Card>

  <Card title="Claude Code 整合" icon="bot" href="/zh-Hant/scenarios/programming/claude-code">
    用 Claude 系列做命令列程式設計
  </Card>

  <Card title="模型對比" icon="chart-bar" href="/zh-Hant/api-capabilities/model-info">
    所有可用模型與定價
  </Card>
</CardGroup>
