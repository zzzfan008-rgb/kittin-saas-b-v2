> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Hermes Agent

> Nous Research 出品的自學習 AI Agent，內建技能學習閉環 + 跨平臺訊息閘道，可通過 API易 接入任意大模型

## 概述

Hermes Agent 是 Nous Research 出品的開源 AI Agent，主打「會成長的智慧體」——它是目前少數內建**學習閉環**的 Agent：能從對話中自動生成技能、在使用中持續打磨技能、主動提醒自己沉澱知識，並通過 FTS5 全文索引檢索過往會話，跨 session 維護對你的使用者畫像。Hermes 不依賴本地機器，從 5 美元的 VPS 到 GPU 叢集、再到幾乎零成本閒置的 Serverless 平臺都能跑。

通過對接 API易，您可以獲得：

<CardGroup cols={2}>
  <Card title="🧠 自學習閉環" icon="brain">
    Agent 自主建立/打磨技能，長期記憶 + 跨會話檢索
  </Card>

  <Card title="📱 全平臺閘道" icon="message-circle">
    Telegram / Discord / Slack / WhatsApp / Signal / Email / CLI
  </Card>

  <Card title="⏰ 定時排程" icon="clock">
    內建 cron 排程器，可自動跨平臺投遞日報/巡檢結果
  </Card>

  <Card title="☁️ 跑在任何地方" icon="cloud">
    本地 / Docker / SSH / Modal / Daytona / Vercel Sandbox 七種後端
  </Card>
</CardGroup>

<Info>
  **專案資訊**：Hermes Agent 採用 MIT 許可證開源，專案地址 `github.com/NousResearch/hermes-agent`，官方文件 `hermes-agent.nousresearch.com/docs/`。
</Info>

## 安裝

### Linux / macOS / WSL2 / Termux

```bash theme={null}
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

### Windows（PowerShell，原生支援仍在 Early Beta）

```powershell theme={null}
iex (irm https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.ps1)
```

安裝器會自動處理 `uv`、Python 3.11、Node.js、`ripgrep`、`ffmpeg` 以及一份便攜 Git Bash。

完成後過載 Shell 即可啟動：

```bash theme={null}
source ~/.bashrc    # 或 source ~/.zshrc
hermes              # 進入終端 UI，開始對話
```

## 接入 API易

Hermes 自帶 `hermes model` 命令，可選 Nous Portal / OpenRouter / OpenAI / 自建端點等。API易 提供 **OpenAI 相容 API**，作為「OpenAI 自定義端點」接入即可一次拿到全模型矩陣。

### 方式一：通過 `hermes model` 互動式配置（推薦）

```bash theme={null}
hermes model        # 進入模型選擇嚮導
```

嚮導會依次詢問：

| 步驟           | 輸入                                                                                  |
| ------------ | ----------------------------------------------------------------------------------- |
| Provider     | 選 `OpenAI`（或 `Custom OpenAI endpoint`）                                              |
| API Base URL | `https://api.apiyi.com/v1`                                                          |
| API Key      | 你的 API易 金鑰（`sk-...`）                                                                |
| Model        | 填入想用的模型 ID，如 `gpt-5.4`、`claude-sonnet-4-6`、`deepseek-v3.2`、`gemini-3.1-pro-preview` |

### 方式二：通過 `hermes config set` 直接寫入

```bash theme={null}
hermes config set llm.provider openai
hermes config set llm.base_url https://api.apiyi.com/v1
hermes config set llm.api_key sk-你的API易金鑰
hermes config set llm.model gpt-5.4
```

寫入後用 `hermes` 啟動一次驗證連線。

### 方式三：環境變數（適合 Docker / Serverless 部署）

```bash theme={null}
export OPENAI_API_BASE=https://api.apiyi.com/v1
export OPENAI_API_KEY=sk-你的API易金鑰
export HERMES_MODEL=gpt-5.4
hermes
```

切換模型只需 `hermes model` 或修改 `HERMES_MODEL`，**無需改任何程式碼**。

### 方式四：Anthropic 原生協議（主用 Claude 強烈推薦）

Hermes 把 Anthropic 作為**一等公民 Provider**，內部 wire protocol 稱為 `anthropic_messages`，相比走 OpenAI 相容路徑有獨家加成：

<Info>
  **走 Anthropic 原生協議的額外收益**：Hermes 會自動給 native Anthropic、OpenRouter、Nous Portal 這三類 Provider 掛上 `cache_control` 1 小時快取斷點（系統提示 + 技能內容 + 長上下文前段），跨 session 和 subagent 複用，按低價的 cached-read 費率結算。**走 OpenAI 相容路徑時這個最佳化不會生效**。Claude 主力使用者建議直接走這條路。
</Info>

CLI 配置：

```bash theme={null}
hermes config set llm.provider anthropic
hermes config set llm.base_url https://api.apiyi.com
hermes config set llm.api_key sk-你的API易金鑰
hermes config set llm.model claude-sonnet-4-6
```

環境變數等價寫法：

```bash theme={null}
export ANTHROPIC_BASE_URL=https://api.apiyi.com
export ANTHROPIC_API_KEY=sk-你的API易金鑰
export HERMES_MODEL=claude-sonnet-4-6
hermes
```

<Warning>
  **`base_url` 不要帶 `/v1`**：必須是 `https://api.apiyi.com`。Anthropic 協議會自動拼接 `/v1/messages`，寫錯會變成 `.../v1/v1/messages` 觸發 404。
</Warning>

Hermes 會根據 URL 自動識別協議（路徑含 `/anthropic` 直接走 `anthropic_messages`）。若使用 LiteLLM 代理等非標準端點，可手動指定：

```bash theme={null}
hermes config set llm.api_mode anthropic_messages
```

**額外提示**：API易 控制台 `api.apiyi.com/token` 建立令牌時，**分組選 ClaudeCode** 可自動享受 95 折，可疊加充值贈送 10%-20%。

<Tip>
  **為什麼選 API易？**

  * **一把金鑰多家模型**：OpenAI / Anthropic / Google / DeepSeek / 智譜 / Kimi 等全模型矩陣
  * **價格優勢**：相對官方價格通常有 5%-20% 優惠，部分模型支援充值加贈
  * **國內直連**：免代理直接訪問海外大模型
  * **雙協議相容**：OpenAI 和 Anthropic 兩套 Wire Protocol 都能接，主用 Claude 走 Anthropic 原生還能吃到 1 小時緩存摺扣
</Tip>

## 常用功能速查

<CardGroup cols={2}>
  <Card title="終端 UI" icon="terminal">
    完整 TUI：多行編輯、斜槓命令補全、會話歷史、流式工具輸出
  </Card>

  <Card title="訊息閘道" icon="bot">
    `hermes gateway setup` 後繫結 Bot Token，即可在 IM 平臺直接對話
  </Card>

  <Card title="技能系統" icon="puzzle">
    程式化記憶 + Skills Hub（`agentskills.io`），Agent 用得越多越聰明
  </Card>

  <Card title="MCP 整合" icon="plug">
    接入任意 MCP Server 擴充套件能力，含社群 Linux 桌面控制 MCP
  </Card>

  <Card title="定時任務" icon="clock">
    內建 cron 排程，自然語言指令即可建立"每天 9 點發我日報"
  </Card>

  <Card title="子 Agent" icon="users">
    可生成隔離的 subagent 並行處理任務，寫 Python 指令碼通過 RPC 呼叫
  </Card>
</CardGroup>

## 從 OpenClaw 遷移

如果你之前使用 OpenClaw，Hermes 內建了一鍵遷移工具：

```bash theme={null}
hermes claw migrate              # 互動式完整遷移
hermes claw migrate --dry-run    # 預覽將遷移哪些內容
hermes claw migrate --preset user-data   # 僅遷移使用者資料，不含金鑰
hermes claw migrate --overwrite  # 覆蓋衝突
```

將自動匯入 `SOUL.md`、記憶 (`MEMORY.md` / `USER.md`)、使用者技能、命令白名單、訊息平臺配置、API 金鑰（Telegram / OpenRouter / OpenAI / Anthropic / ElevenLabs）、TTS 資源、工作目錄指令等。

## 常見問題

<AccordionGroup>
  <Accordion title="Hermes Agent 和 OpenClaw、FastClaw 有什麼區別？">
    * **Hermes Agent**：Python 實現、Nous Research 出品，主打**自學習閉環**——技能自我演化、跨會話記憶，研究友好（支援 trajectory 生成）
    * **OpenClaw**：Node.js 實現、面向本地隱私 + 多 IM 平臺聯動
    * **FastClaw**：Go 編寫的單二進位制執行時，主打多 Agent 管理 + Dashboard 形態

    三者均可通過 API易 接入全模型矩陣，按場景選用即可。
  </Accordion>

  <Accordion title="是否支援 API易 的全部模型？">
    支援。Hermes 同時支援 **OpenAI 相容**和 **Anthropic 原生**兩套協議：

    * OpenAI 協議端點：`https://api.apiyi.com/v1`，覆蓋全模型矩陣
    * Anthropic 協議端點：`https://api.apiyi.com`（不帶 `/v1`），覆蓋 Claude 系列

    模型 ID 直接填 API易 文件裡的模型名（如 `gpt-5.4`、`claude-sonnet-4-6`、`deepseek-v3.2`、`gemini-3.1-pro-preview` 等）。Claude 主力使用者建議走 Anthropic 原生，可額外吃到 Hermes 的 1 小時跨會話快取。
  </Accordion>

  <Accordion title="跨平臺訊息是怎麼工作的？">
    Hermes 提供一個**單一 Gateway 程序**，統一管理 Telegram / Discord / Slack / WhatsApp / Signal 等平臺的 Bot 連線。`hermes gateway setup` 引導你填入各平臺 Token，`hermes gateway start` 啟動後，所有平臺的訊息會被路由到同一個 Agent 例項，**跨平臺會話連續**——你在 Telegram 上問的問題可以在 Discord 接著聊。

    支援語音留言轉寫，所有平臺的 cron 投遞也走同一通道。
  </Accordion>

  <Accordion title="可以跑在雲端嗎？">
    可以，而且 Hermes 強烈推薦雲端部署。它提供 7 種終端後端：

    * **本地 / Docker / SSH / Singularity**：傳統部署
    * **Modal / Daytona**：Serverless 持久化，空閒時休眠幾乎不計費，按需喚醒
    * **Vercel Sandbox**：邊緣執行時

    一個 5 美元 VPS 就能掛著 24/7 待命，從手機 Telegram 給雲端 VM 派活完全可行。
  </Accordion>
</AccordionGroup>

## 相關資源

<CardGroup cols={2}>
  <Card title="專案倉庫" icon="github">
    `github.com/NousResearch/hermes-agent`
  </Card>

  <Card title="官方文件" icon="book">
    `hermes-agent.nousresearch.com/docs/`
  </Card>

  <Card title="OpenClaw 對比方案" icon="bot" href="/zh-Hant/scenarios/agent/openclaw/overview">
    本地隱私 + IM 聯動場景的另一選擇
  </Card>

  <Card title="FastClaw 對比方案" icon="bolt" href="/zh-Hant/scenarios/agent/fastclaw">
    多 Agent 工廠 + Dashboard 形態的另一選擇
  </Card>
</CardGroup>
