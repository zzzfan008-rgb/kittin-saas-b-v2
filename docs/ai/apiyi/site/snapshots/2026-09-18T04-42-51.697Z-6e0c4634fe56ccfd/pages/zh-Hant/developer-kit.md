> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# AI 開發者套件

> 把 API易 交給 AI 接入：聊天 Agent 裝技能包、終端用命令列、程式設計 Agent 先讀契約與模型登錄檔再寫程式碼。三條路各有一段可複製的提示詞。

<Note>
  賬號和 Key 仍需你本人在 [控制台](https://api.apiyi.com/token) 建立。從「拿到 Key」到「程式碼跑通」這一段，下面三條路都可以交給 AI。
</Note>

## 先選路

<CardGroup cols={3}>
  <Card title="Skills · 聊天 Agent" icon="sparkles" href="#skills-技能包">
    OpenClaw、Claude Code 這類帶技能系統的 Agent。裝一次技能包，之後用自然語言呼叫 API易。
  </Card>

  <Card title="CLI · 終端" icon="terminal" href="#cli-命令列">
    不寫程式碼，在終端裡驗證 Key、列模型、發訊息、出圖。`npx apiyi@latest check` 零安裝。
  </Card>

  <Card title="開發者套件 · 程式設計 Agent" icon="code" href="#給程式設計-agent-的規則">
    Cursor、Claude Code、Codex 寫接入程式碼前，先讀契約和模型登錄檔，不編造端點。
  </Card>
</CardGroup>

## 套件裡有什麼

全部是公開地址，不需要登入，任何 Agent 都能直接抓取：

| 檔案         | 地址                                           | 角色                                                         |
| ---------- | -------------------------------------------- | ---------------------------------------------------------- |
| **接入契約**   | `https://docs.apiyi.com/skill.md`            | 端點表、認證、模型命名規則、常見坑、自檢狀態、檢查單。既是程式設計 Agent 的規則書，也是 Skills 的正文 |
| **模型登錄檔**  | `https://docs.apiyi.com/model-registry.json` | 模型 ID、可用端點、分組、計費方式與標價的機器可讀事實來源，隨價格總表自動更新                   |
| **頁面索引**   | `https://docs.apiyi.com/llms.txt`            | 全站目錄，讓 Agent 自己決定該讀哪一頁                                     |
| **全文合集**   | `https://docs.apiyi.com/llms-full.txt`       | 所有頁面正文拼接，體積大，按需取用                                          |
| **單頁純文本**  | 任意頁面地址後加 `.md`                               | 只關心某一頁時，比抓 HTML 省 token                                    |
| **MCP 服務** | `https://docs.apiyi.com/mcp`                 | 把本站接成 MCP server，Agent 可隨時檢索最新內容                           |

<Tip>
  本頁的純文本版就是 `https://docs.apiyi.com/developer-kit.md`。
</Tip>

## 給程式設計 Agent 的規則

程式設計 Agent 最常犯的錯不是寫不出程式碼，而是**憑記憶編**：編一個不存在的端點、把 `gpt-5.4-mini` 寫成 `gpt-5-4-mini`、給 Anthropic SDK 的 base\_url 多加一個 `/v1`。這五條規則把這些坑擋在前面：

1. **不要編造端點、引數名、列舉值或響應結構**。只用 `skill.md` 端點表裡列出的路徑；引數以對應協議（OpenAI / Anthropic / Gemini）的官方定義為準。
2. **模型 ID 以 `model-registry.json` 為唯一事實來源**。ID 帶點號且區分大小寫，文件頁地址裡的連字元是 URL 安全替換，不是模型 ID。
3. **Base URL 按 SDK 選，不按模型選**。OpenAI SDK 用 `https://api.apiyi.com/v1`；Anthropic SDK 用根域名 `https://api.apiyi.com`；Google GenAI SDK 用根域名並把 `api_version` 設為 `v1beta`。
4. **Key 只從環境變數 `APIYI_API_KEY` 讀**。不硬編碼、不提交進 git、不貼進對話。
5. **讀完先解釋，再動手**。讓 Agent 先說清楚打哪個端點、用哪個模型、超時設多少，你確認後它再改程式碼。

<Prompt description="給 Cursor、Claude Code、Codex 等程式設計 Agent 的完整版提示詞。複製後直接貼上。" icon="code" actions={["copy"]}>
  請先完整閱讀 [https://docs.apiyi.com/skill.md](https://docs.apiyi.com/skill.md) 和 [https://docs.apiyi.com/llms.txt。](https://docs.apiyi.com/llms.txt。)
  在寫任何程式碼之前，你必須遵守以下規則：

  * 不要編造 endpoint、引數名、列舉值或響應結構。只使用 skill.md 端點表裡列出的路徑。
  * 模型 ID 以 [https://docs.apiyi.com/model-registry.json](https://docs.apiyi.com/model-registry.json) 為唯一事實來源。
    ID 帶點號且區分大小寫（gpt-5.4-mini，不是 gpt-5-4-mini），不要憑記憶寫。
  * Base URL 按 SDK 選：OpenAI SDK 用 [https://api.apiyi.com/v1；](https://api.apiyi.com/v1；)
    Anthropic SDK 用 [https://api.apiyi.com（不加](https://api.apiyi.com（不加) /v1）；
    Google GenAI SDK 用 [https://api.apiyi.com](https://api.apiyi.com) 並把 api\_version 設為 v1beta。
  * Key 只從環境變數 APIYI\_API\_KEY 讀取，不要硬編碼、不要提交進 git。
  * 需要某一頁的細節時，從 llms.txt 找到頁面地址，在末尾加 .md 讀純文本版。

  讀完後，先用你自己的話解釋你理解的接入流程（打哪個端點、用哪個模型、超時設多少），
  不要立即編輯程式碼。等我確認後再動手。
</Prompt>

<Accordion title="這段提示詞替你擋掉了什麼">
  | 要求               | 擋掉的坑                                                                    |
  | ---------------- | ----------------------------------------------------------------------- |
  | 不編造端點            | Agent 從訓練記憶裡拼出 `/v1/complete`、`/v1/generate` 這類不存在的路徑，然後在 404 裡打轉       |
  | 模型 ID 查登錄檔       | `gpt-5-4-mini`、`minimax-m3` 這種連字元或大小寫錯誤會直接 404，且報錯資訊不會告訴你差在哪            |
  | Base URL 按 SDK 選 | Anthropic SDK 多加 `/v1` 會拼成 `/v1/v1/messages`；OpenAI SDK 少了 `/v1` 同樣 404 |
  | Key 只讀環境變數       | 寫死在程式碼裡的 Key 會隨倉庫洩漏；本站 pre-commit 鉤子也會攔                                 |
  | 先解釋再動手           | 避免 Agent 一上來改十個檔案，最後發現選錯了協議                                             |
</Accordion>

## Skills 技能包

技能包就是 `skill.md` 本身：一份專門寫給 AI 讀的接入說明，裝進 Agent 之後，它在需要呼叫 API易 時會自動想起這些規則。三種安裝方式：

<Tabs>
  <Tab title="npx skills（通用）" icon="package">
    適用於 Claude Code、Cursor、Codex 等支援 Agent Skills 規範的工具：

    ```bash theme={null}
    npx skills add https://docs.apiyi.com
    ```

    通過本站的 `/.well-known/agent-skills/index.json` 自動發現，裝的是 `skill.md` 本體，不帶指令碼。自檢用 `npx apiyi@latest check`。
  </Tab>

  <Tab title="OpenClaw" icon="bot">
    OpenClaw 的技能安裝器認 git 源，倉庫根目錄必須有 `SKILL.md`。本技能的倉庫 `github.com/apiyi-com/skills` 就是這樣佈局的，還附帶自檢指令碼：

    ```bash theme={null}
    openclaw skills install git:apiyi-com/skills
    ```

    或者手動克隆到工作區：

    ```bash theme={null}
    git clone https://github.com/apiyi-com/skills ~/.openclaw/workspace/skills/apiyi
    ```

    裝好後 Agent 會跑 `scripts/apiyi.py --check`，按結果引導你配置 Key。
  </Tab>

  <Tab title="手動複製" icon="clipboard">
    任何能讀檔案的 Agent 都行。把 `https://docs.apiyi.com/skill.md` 的內容放進它的技能目錄：

    | Agent       | 放到                              |
    | ----------- | ------------------------------- |
    | Claude Code | `.claude/skills/apiyi/SKILL.md` |
    | Codex CLI   | `.agents/skills/apiyi/SKILL.md` |
    | Cursor      | 專案規則檔案，或直接作為上下文貼上               |
    | 其它          | 直接把全文作為系統提示詞的一部分                |
  </Tab>
</Tabs>

<Prompt description="給 OpenClaw、Claude Code、Cursor 等支援 Skills 的 Agent。複製後直接貼上。" icon="bot" actions={["copy"]}>
  請先把 API易（APIYI）技能裝到你自己身上，再用它幫我接入 API易。

  1. 優先執行 `npx skills add https://docs.apiyi.com`（技能名 apiyi）。
     如果你是 OpenClaw，用技能安裝器裝 `git:apiyi-com/skills`，
     或把倉庫克隆到 \~/.openclaw/workspace/skills/apiyi/。
     都跑不通就直接抓取 [https://docs.apiyi.com/skill.md](https://docs.apiyi.com/skill.md) 全文閱讀，效果一樣。
  2. 裝好先自檢：執行技能裡的 `scripts/apiyi.py --check`（沒有指令碼就用 `npx apiyi@latest check`）。
     結果是 no\_key 就向我要 Key（我在 [https://api.apiyi.com/token](https://api.apiyi.com/token) 複製），
     存到環境變數 APIYI\_API\_KEY；不要硬編碼、不要提交進 git。
  3. 自檢返回 ready 後，用 gpt-5.4-mini 發一句「你好」，把返回貼給我，
     再告訴我接下來你能用這個技能幫我做什麼。
</Prompt>

### Key 怎麼給它

* **首選環境變數** `APIYI_API_KEY`。技能、CLI、所有文件示例都從這裡讀。
* **OpenClaw** 會把 Key 存在 `~/.openclaw/openclaw.json` 的 `skills.entries.apiyi.apiKey`，執行時自動注入為 `APIYI_API_KEY`（技能 frontmatter 裡的 `primaryEnv` 宣告的就是這個）。配置檔案的寫法見 [OpenClaw 配置檔案詳解](/zh-Hant/scenarios/agent/openclaw/config-json)。
* **CLI** 用 `npx apiyi@latest auth set-key` 存到 `~/.config/apiyi/config.json`，檔案權限 0600。

### 自檢狀態

技能指令碼、CLI、手工 curl 三種自檢方式返回同一套狀態：

| 狀態              | 含義                  | Agent 會怎麼做                                    |
| --------------- | ------------------- | --------------------------------------------- |
| `ready`         | `/v1/models` 返回 200 | 告訴你能看到多少個模型，問你要做什麼                            |
| `no_key`        | 哪裡都沒找到 Key          | 引導你去控制台複製 Key，存進環境變數後再檢                       |
| `invalid_key`   | 401 或 403           | Key 錯了、被停用或已耗盡，讓你重新複製                         |
| `network_error` | 超時、DNS 失敗或 5xx      | 重試一次；仍失敗則換 `vip.apiyi.com`（海外）或 `b.apiyi.com` |

<Warning>
  普通 `sk-` Key **讀不到餘額**，所以沒有 `no_balance` 這個狀態。餘額和日誌用的是另一套系統令牌，見 [如何檢視呼叫日誌](/zh-Hant/faq/call-logs)。遇到 429 可能是限流也可能是餘額用完，Agent 不應猜，應引導你去 [控制台](https://api.apiyi.com/account/profile) 看。
</Warning>

## CLI 命令列

不寫程式碼也能在終端裡跑通第一次呼叫。Node 18 以上，零安裝：

```bash theme={null}
npx apiyi@latest check
```

<Prompt description="給任何能執行終端命令的 Agent，或自己逐行執行。" icon="terminal" actions={["copy"]}>
  請幫我安裝並跑通 API易 命令列工具：[https://github.com/apiyi-com/cli](https://github.com/apiyi-com/cli)
  要求：Node 18 以上；直接 `npx apiyi@latest check` 零安裝；
  引導我配置 API Key（`npx apiyi@latest auth set-key` 或環境變數 APIYI\_API\_KEY，從 [https://api.apiyi.com/token](https://api.apiyi.com/token) 複製）；
  最後跑 `npx apiyi@latest models --grep gpt-5` 和 `npx apiyi@latest chat "你好" -m gpt-5.4-mini`，把輸出貼給我。
</Prompt>

### 命令一覽

| 命令                                            | 需要     | 做什麼                                                     |
| --------------------------------------------- | ------ | ------------------------------------------------------- |
| `apiyi check`                                 | Key 可選 | 檢查 Key 來源、節點連通、`/v1/models` 是否 200，列印延遲與狀態；有系統令牌時順帶顯示餘額 |
| `apiyi models [--grep 關鍵詞]`                   | Key 可選 | 有 Key 走 `/v1/models` 列你能用的模型；無 Key 讀公開登錄檔               |
| `apiyi chat "提示詞" [-m 模型] [--stream]`         | Key    | 發一條 Chat Completions，列印回覆與 token 用量。預設模型 `gpt-5.4-mini` |
| `apiyi responses "輸入" [-m 模型] [--effort low]` | Key    | 走 Responses 端點，列印 `output_text`                         |
| `apiyi image "提示詞" -m gpt-image-2 [-o 檔名]`    | Key    | 出圖並寫到本地檔案，超時 360 秒                                      |
| `apiyi balance`                               | 系統令牌   | 查餘額（按 500000 配額 = 1 美元換算）                               |
| `apiyi auth set-key` / `show` / `clear`       | 無      | 隱藏輸入儲存 Key；`show` 打碼顯示；`clear` 清除                       |

全域性引數：`--api-key`、`--node api|vip|b|cf`（選節點）、`--base-url`、`--timeout`、`--json`（機器可讀輸出）。

### Key 的查詢順序

`--api-key` 引數 → 環境變數 `APIYI_API_KEY` → `~/.config/apiyi/config.json` → OpenClaw 的 `~/.openclaw/openclaw.json`。裝過 OpenClaw 技能的使用者不用再配一次。

### 退出碼

指令碼和 Agent 靠退出碼分支，不用解析文字：

| 碼 | 含義                               |
| - | -------------------------------- |
| 0 | 成功                               |
| 2 | `no_key`                         |
| 3 | `invalid_key`（401 / 403）         |
| 4 | `network_error`（DNS、超時、重試後仍 5xx） |
| 5 | 模型不存在（404，通常是 ID 寫錯）             |
| 6 | 限流或餘額不足（429）                     |
| 7 | 請求引數錯誤（400，原樣列印 `error.message`） |
| 8 | 命令列引數錯誤                          |

原始碼在 `github.com/apiyi-com/cli`，npm 包名 `apiyi`。文件一律寫 `npx apiyi@latest`，因為 `npx` 會快取舊版本。

## model-registry.json 欄位說明

每次重新整理價格總表時自動重新生成，與 [模型價格](/models) 頁同源。頂層欄位：

| 欄位               | 含義                                                                                                        |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| `schema_version` | 結構版本，當前為 1。同一版本內只增欄位不改名                                                                                   |
| `generated_at`   | 生成時間（UTC）                                                                                                 |
| `base_urls`      | 三種 SDK 各自該填的 base\_url，以及 Gemini 的 `api_version`                                                          |
| `nodes`          | 可用節點域名                                                                                                    |
| `endpoints`      | 端點名到路徑與方法的對映：`chat` / `responses` / `messages` / `gemini` / `images` / `embeddings` / `rerank` / `models` |
| `groups`         | 分組名到顯示名與倍率                                                                                                |
| `models[]`       | 見下表                                                                                                       |

每個模型條目：

| 欄位                                                                      | 含義                                             |
| ----------------------------------------------------------------------- | ---------------------------------------------- |
| `id`                                                                    | 模型 ID，呼叫時原樣使用，區分大小寫                            |
| `vendor_en`                                                             | 廠商英文名                                          |
| `category`                                                              | `text` / `image` / `video` / `embedding` 等能力型別 |
| `endpoints`                                                             | 這個模型能走的端點名，對應頂層 `endpoints` 的鍵                 |
| `groups`                                                                | 哪些令牌分組能呼叫它                                     |
| `billing.type`                                                          | `per_token`（按百萬 token）或 `per_call`（按次）         |
| `billing.input_usd_per_m` / `output_usd_per_m` / `cache_read_usd_per_m` | 按量模型的美元標價                                      |
| `billing.per_call_usd`                                                  | 按次模型的單次美元標價                                    |
| `billing.tiered`                                                        | 是否有階梯價（為 true 時詳情看模型頁）                         |
| `docs_url`                                                              | 有詳情頁時給出地址                                      |

<Info>
  登錄檔裡的價格是**標價**，不含充值加贈和分組折扣，實際扣費以控制台為準。分組含義見 [分組說明](/zh-Hant/faq/groups-explained)。
</Info>

## 相關頁面

<CardGroup cols={2}>
  <Card title="快速開始" icon="rocket" href="/zh-Hant/getting-started">
    兩條路：讓 AI 接，或自己動手接。
  </Card>

  <Card title="有沒有一鍵對接功能？" icon="plug" href="/zh-Hant/faq/one-click-integration">
    有，但形態是把文件交給 AI，而不是一個按鈕。
  </Card>

  <Card title="OpenClaw 接入" icon="bot" href="/zh-Hant/scenarios/agent/openclaw/overview">
    開源本地 AI 助手，裝上技能包後用自然語言呼叫 API易。
  </Card>

  <Card title="模型價格總表" icon="circle-dollar-sign" href="/models">
    登錄檔的人類可讀版本，含廠商分組與階梯價。
  </Card>
</CardGroup>
