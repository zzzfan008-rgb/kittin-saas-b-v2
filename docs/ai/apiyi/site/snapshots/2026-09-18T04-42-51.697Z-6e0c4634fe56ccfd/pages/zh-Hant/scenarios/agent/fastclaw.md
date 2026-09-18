> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# FastClaw

> Go 編寫的輕量級多 Agent 執行時，單二進位制 + Dashboard，可通過 API易 接入任意主流大模型

## 概述

FastClaw 是一款基於 Go 編寫的輕量級 AI Agent 執行時，定位為「Agent 工廠」——它負責建立、管理並執行多個 AI Agent，每個 Agent 擁有獨立的人格（SOUL.md）、記憶、技能與工具集。FastClaw 自動處理 LLM 通訊、工具執行、沙箱隔離和會話管理，開箱即用 Web Dashboard，單二進位制部署。

通過對接 API易，您可以獲得：

<CardGroup cols={2}>
  <Card title="🚀 單二進位制部署" icon="rocket">
    一條命令安裝，自帶 SQLite，本地或雲端均可
  </Card>

  <Card title="🤖 多 Agent 管理" icon="users">
    每個 Agent 獨立的人格、模型、技能與會話
  </Card>

  <Card title="📱 IM 多通道" icon="message-circle">
    內建 Telegram / Discord / Slack 渠道繫結
  </Card>

  <Card title="🛡️ 沙箱隔離" icon="shield">
    支援 Docker / E2B 沙箱，工具呼叫安全可控
  </Card>
</CardGroup>

<Info>
  **專案資訊**：FastClaw 採用 FastClaw Community License（基於 Apache 2.0 + 附加條款）的原始碼可見許可證，專案地址 `github.com/fastclaw-ai/fastclaw`。
</Info>

## 安裝與啟動

FastClaw 通過官方安裝指令碼一鍵安裝到 `~/.local/bin`：

```bash theme={null}
curl -fsSL https://raw.githubusercontent.com/fastclaw-ai/fastclaw/main/install.sh | bash
```

首次啟動會進入設定嚮導，配置完 LLM Provider 後自動建立預設 Agent：

```bash theme={null}
fastclaw                    # 前臺執行，Ctrl+C 停止
fastclaw daemon start       # 後臺執行（日誌 ~/.fastclaw/daemon.log）
fastclaw daemon install     # 註冊為 launchd / systemd 服務
```

啟動後訪問 Dashboard：`http://localhost:18953`（預設埠 `18953`）。

## 接入 API易（推薦配置）

API易相容 OpenAI 和 Anthropic 兩套 API 協議，FastClaw 可通過 **OpenAI 相容 Provider** 或 **Anthropic 相容 Provider** 接入，二者均可使用同一把 API易 金鑰訪問全模型矩陣。

### 方式一：通過 Dashboard 配置（推薦）

1. 開啟 `http://localhost:18953`，使用首次啟動時生成的 admin 賬號登入
2. 進入 **Models / Providers**，新增一條 Provider 配置：

| 欄位          | 推薦值                                                                             |
| ----------- | ------------------------------------------------------------------------------- |
| Provider 型別 | `OpenAI` 相容                                                                     |
| Base URL    | `https://api.apiyi.com/v1`                                                      |
| API Key     | 你的 API易 金鑰（`sk-...`）                                                            |
| 模型列表        | 按需新增，如 `gpt-5.4`、`claude-sonnet-4-6`、`deepseek-v3.2`、`gemini-3.1-pro-preview` 等 |

3. 進入對應 Agent 的 **Models** 面板，設為預設模型即可

### 方式二：通過 CLI 配置

```bash theme={null}
# 1. 建立一個新 Agent，初始繫結 API易（OpenAI 相容）
fastclaw agents init alpha \
  --provider openai \
  --model openai/gpt-5.4 \
  --api-key-env APIYI_API_KEY

# 2. 將 OpenAI provider 的 Base URL 指向 API易
fastclaw agents config alpha set provider.openai.apiBase https://api.apiyi.com/v1
fastclaw agents config alpha set provider.openai.apiKeyEnv APIYI_API_KEY

# 3. 新增你想用的模型（追加，冪等）
fastclaw agents config alpha set provider.openai.model gpt-5.4
fastclaw agents config alpha set provider.openai.model claude-sonnet-4-6
fastclaw agents config alpha set provider.openai.model deepseek-v3.2
```

環境變數 `APIYI_API_KEY` 需先在 Shell 中匯出（`export APIYI_API_KEY=sk-...`），FastClaw 不會把金鑰明文寫入資料庫。

<Tip>
  **為什麼選 API易？**

  * **一把金鑰多家模型**：OpenAI / Anthropic / Google / DeepSeek / 智譜等全模型矩陣，無需逐個 Provider 申請
  * **價格優勢**：相對官方價格通常有 5%-20% 優惠，部分模型支援充值加贈
  * **國內直連**：免代理直接訪問海外大模型
  * **OpenAI / Anthropic 雙協議相容**：FastClaw 的兩類 Provider 都能用
</Tip>

### 方式三：Anthropic 原生協議（適合主用 Claude）

如果你主用 Claude 系列模型，可將 Anthropic Provider 指向 API易：

| 欄位          | 推薦值                                     |
| ----------- | --------------------------------------- |
| Provider 型別 | `Anthropic`                             |
| Base URL    | `https://api.apiyi.com`                 |
| API Key     | 你的 API易 金鑰                              |
| 模型列表        | `claude-sonnet-4-6`、`claude-opus-4-7` 等 |

CLI 等價寫法：

```bash theme={null}
fastclaw agents config alpha set provider.anthropic.apiBase https://api.apiyi.com
fastclaw agents config alpha set provider.anthropic.apiKeyEnv APIYI_API_KEY
fastclaw agents config alpha set provider.anthropic.model claude-sonnet-4-6
fastclaw agents config alpha set model claude-sonnet-4-6
```

## 常用功能速查

<CardGroup cols={2}>
  <Card title="Agent 管理" icon="bot">
    Dashboard → Agents：建立/編輯 Agent，定義 SOUL.md（人格）、IDENTITY.md（身份）、MEMORY.md（長期記憶）
  </Card>

  <Card title="技能（Skills）" icon="puzzle">
    內建 code-runner、image-gen、data-analysis、web-search、skill-creator 等，可從 ClawHub / GitHub 安裝
  </Card>

  <Card title="IM 渠道繫結" icon="message-circle">
    Agent → Channels：填入 Telegram / Discord / Slack 的 Bot Token，儲存前會自動校驗
  </Card>

  <Card title="OpenAI 相容 API" icon="code">
    `/v1/chat/completions` 流式介面可被任意 OpenAI SDK 直接呼叫
  </Card>

  <Card title="沙箱執行" icon="shield">
    Settings → Runtime 切換 Docker / E2B 沙箱，工具呼叫後自動同步產物
  </Card>

  <Card title="定時任務" icon="clock">
    Agent → Scheduler：讓 Agent 通過 `create_cron_job` 建立定時提醒
  </Card>
</CardGroup>

## 部署模式

| 模式             | 適用場景  | 關鍵配置                                       |
| -------------- | ----- | ------------------------------------------ |
| **本地**         | 個人使用  | `fastclaw daemon start`，SQLite 預設儲存        |
| **Docker**     | 單機服務化 | `cd deploy/docker && ./start.sh`           |
| **Kubernetes** | 多副本生產 | `FASTCLAW_STORAGE_TYPE=postgres` + S3 物件儲存 |

多副本部署需要：

* `FASTCLAW_STORAGE_TYPE=postgres`、`FASTCLAW_STORAGE_DSN=postgres://...`
* `FASTCLAW_OBJECT_STORE_*` 一組 S3 相容物件儲存變數（用於跨 Pod 同步 Skills 和工作目錄）
* `FASTCLAW_BIND=all`（監聽 `0.0.0.0`）

完整 K8s 清單見倉庫 `deploy/k8s/` 目錄。

## 常見問題

<AccordionGroup>
  <Accordion title="FastClaw 和 OpenClaw 有什麼區別？">
    * **FastClaw**：Go 編寫、單二進位制、面向「Agent 工廠」場景，強調多 Agent 管理、IM 渠道接入、沙箱隔離，適合需要把 Agent 作為服務交付的團隊
    * **OpenClaw**：Node.js 實現、面向個人本地助手，強調本地隱私 + 多 IM 平臺聯動
    * 兩者都可以通過 API易 接入全模型矩陣，按部署形態選用即可
  </Accordion>

  <Accordion title="是否支援 API易 的全部模型？">
    支援。API易 提供 OpenAI 相容協議（`https://api.apiyi.com/v1`）和 Anthropic 相容協議（`https://api.apiyi.com`），FastClaw 的兩類 Provider 均可對接，模型 ID 直接填 API易 文件裡的模型名即可（如 `gpt-5.4`、`claude-sonnet-4-6`、`deepseek-v3.2`、`gemini-3.1-pro-preview` 等）。
  </Accordion>

  <Accordion title="如何讓 Agent 通過 Telegram / Discord 對外服務？">
    1. 在對應平臺建立 Bot 並拿到 Token
    2. Dashboard → 選中 Agent → Channels → 填入 Token 儲存（系統會自動校驗 `getMe` / `auth.test`）
    3. 在 IM 平臺搜尋你的 Bot 直接對話即可，每個 chatID 的會話相互隔離
  </Accordion>

  <Accordion title="許可證可以用於商業專案嗎？">
    可以。FastClaw 社群許可證允許：

    * ✅ 作為後端嵌入到你自己的產品中商用
    * ✅ 組織內部部署使用

    不允許（未購買商業許可證時）：

    * ❌ 作為多租戶 SaaS 直接對外託管 FastClaw 自身
    * ❌ 去除/修改 Dashboard 中的 FastClaw 品牌

    商業授權諮詢：`support@thinkany.ai`
  </Accordion>
</AccordionGroup>

## 相關資源

<CardGroup cols={2}>
  <Card title="專案倉庫" icon="github">
    `github.com/fastclaw-ai/fastclaw`
  </Card>

  <Card title="API易 API 文件" icon="book" href="/zh-Hant/getting-started">
    獲取金鑰與 Base URL 配置參考
  </Card>

  <Card title="OpenClaw 對比方案" icon="bot" href="/zh-Hant/scenarios/agent/openclaw/overview">
    個人本地助手場景的另一選擇
  </Card>

  <Card title="充值與定價" icon="coins" href="/zh-Hant/faq/recharge-promotions">
    瞭解 API易 定價與首充優惠
  </Card>
</CardGroup>
