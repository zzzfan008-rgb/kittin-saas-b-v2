> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek Harness

> DeepSeek AI 開源的外掛化 AI Agent Harness，支援 Web UI、headless CLI 與 Python SDK，可通過 API易 接入相容模型

## 概述

DeepSeek Harness（`dsh`）是 DeepSeek AI 開源的 AI Agent Harness（智慧體執行框架）。它採用「一切皆外掛」的架構，將模型、工具、檔案系統、終端、會話和工作流組合成可擴充套件的智慧體執行環境。

通過 API易 接入後，您可以在本地執行 DeepSeek Harness，並使用 API易 的 OpenAI 相容介面配置模型、執行程式碼任務和維護持久化會話。

<CardGroup cols={2}>
  <Card title="🧩 外掛化架構" icon="puzzle">
    模型、工具、會話和工作流都可以通過外掛組合，便於按需擴充套件 Agent 能力。
  </Card>

  <Card title="🌐 Web UI" icon="globe">
    一條命令啟動本地 Web UI，在瀏覽器中配置模型、工作區和會話。
  </Card>

  <Card title="⌨️ Headless CLI" icon="terminal">
    通過命令列提交一次性任務，適合自動化指令碼、批處理和開發流程。
  </Card>

  <Card title="💾 會話持久化" icon="database">
    會話、工具呼叫和工作區狀態可以持久化，便於繼續任務和排查問題。
  </Card>
</CardGroup>

<Info>
  **專案資訊**：DeepSeek Harness 採用 MIT 許可證開源，專案地址 `github.com/deepseek-ai/deepseek-harness`。當前版本處於 Developer Preview 階段，未來可能出現破壞性相容變更。
</Info>

## 安裝與啟動

### 通過 npm 啟動 Web UI

安裝 Node.js 後，在終端執行：

```bash theme={null}
npx @deepseek-ai/dsh web
```

啟動完成後，訪問 `http://127.0.0.1:3080`。首次使用時，可以在 Web UI 的模型設定中配置 API易。

### 從原始碼執行

如果需要使用倉庫原始碼或參與開發，可以執行：

```bash theme={null}
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness
pnpm install
pnpm run build
pnpm dsh web
```

### 使用 headless CLI

從原始碼構建完成後，可以直接提交一次性任務：

```bash theme={null}
pnpm dsh --profile headless "Inspect the repository and explain the failing tests."
```

## 接入 API易

DeepSeek Harness 支援原生 DeepSeek 路由和基於 `llm-pi-ai` 的多提供方路由。當前配置使用 `apiyi` 提供方、`openai-responses` 協議和 `https://api.apiyi.com/v1` 端點，預設模型為 `deepseek-v4-pro-0813`。

你的配置檔案位於 `$DSH_HOME/settings.yaml`。在未設定 `DSH_HOME` 時，Windows 預設位置通常是 `C:\Users\Administrator\.dsh\settings.yaml`。

### 方式一：通過 Web UI 配置（推薦）

<Steps>
  <Step title="準備 API易 Token">
    在 API易 控制台建立 Token。請勿將真實 Token 寫入專案檔案、命令歷史或公開日誌。
  </Step>

  <Step title="開啟模型設定">
    啟動 Web UI 後，進入**設定 → 模型**，選擇**新增自定義提供方**。
  </Step>

  <Step title="填寫提供方資訊">
    使用下面的配置作為起點：

    | 欄位          | 推薦值                        |
    | ----------- | -------------------------- |
    | Provider ID | `apiyi`                    |
    | 顯示名稱        | `apiyi`                    |
    | 基礎 URL      | `https://api.apiyi.com/v1` |
    | API 協議      | `openai-responses`         |
    | 憑據引用        | `APIYI_API_KEY`            |
    | 模型          | `deepseek-v4-pro-0813`     |

    你的當前配置將 `deepseek-v4-pro-0813` 設為預設模型。配置檔案中還維護了其他 API易 模型，切換模型時請使用 API易 當前可用的模型 ID。
  </Step>

  <Step title="儲存並選擇模型">
    儲存提供方後，在模型選擇器中選擇剛剛新增的模型，並新建一個會話測試請求。
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/UCR13itF_84Ifj9v/images/deepseek-harness-model-config.png?fit=max&auto=format&n=UCR13itF_84Ifj9v&q=85&s=283844b8bb9f276b3236661422af5be3" alt="DeepSeek Harness API易自定義提供方配置頁面" width="655" height="526" data-path="images/deepseek-harness-model-config.png" />

<Tip>
  API Key 通過 Web UI 儲存後會寫入 DeepSeek Harness 的本地憑據儲存，頁面只顯示脫敏描述，不會回顯完整 Token。配置變化會在下一次請求時生效，通常不需要重啟 Web UI。
</Tip>

### 方式二：使用 settings.yaml 配置

如果需要通過檔案管理配置，可以在 `$DSH_HOME/settings.yaml` 中宣告一個 API易 提供方，並通過環境變數引用 Token：

```yaml theme={null}
llm-pi-ai:
  providers:
    apiyi:
      displayName: apiyi
      apiKeyEnv: APIYI_API_KEY
      api: openai-responses
      baseURL: https://api.apiyi.com/v1
      models:
        - id: deepseek-v4-pro-0813
```

macOS 或 Linux：

```bash theme={null}
export APIYI_API_KEY=YOUR_API_KEY
```

Windows PowerShell：

```powershell theme={null}
$env:APIYI_API_KEY = "YOUR_API_KEY"
```

`apiKeyEnv` 只是憑據引用名稱，真實 Token 不應直接寫入 `settings.yaml`。如果新增模型，直接把模型 ID 新增到 `models` 列表即可。

## 常見使用方式

### 本地 Web Agent

適合在瀏覽器中逐步完成程式碼分析、檔案整理、測試排查和專案維護任務。啟動 Web UI 後，為會話選擇工作區，再用自然語言描述目標和約束。

<img src="https://mintcdn.com/apiyillc/UCR13itF_84Ifj9v/images/deepseek-harness-model-chat.png?fit=max&auto=format&n=UCR13itF_84Ifj9v&q=85&s=8e9ed8c8428b7a3fd8618db5c6ec5bbb" alt="DeepSeek Harness 本地 Web Agent 對話介面" width="934" height="758" data-path="images/deepseek-harness-model-chat.png" />

### 自動化任務

headless profile 會執行一個獨立任務並輸出最終回覆，適合接入指令碼或本地自動化流程：

```bash theme={null}
pnpm dsh --profile headless "Review the changed files and summarize possible regressions."
```

### Python SDK

DeepSeek Harness 提供 `deepseek-harness-sdk`，可在 Python 程式中啟動執行時並呼叫 Agent。需要注意：Python SDK 的內建執行時預設使用 `deepseek-official`，不會自動繼承當前 Web/headless 配置中的 `apiyi` 路由。

```bash theme={null}
python -m pip install deepseek-harness-sdk
```

```python theme={null}
from deepseek_harness import DeepSeekHarness

with DeepSeekHarness(
    provider="apiyi",
    model="deepseek-v4-pro-0813",
    cwd="/absolute/path/to/workspace",
    session_root="/absolute/path/to/sessions",
    cordis="/absolute/path/to/apiyi.cordis.yml",
) as harness:
    result = harness.run(
        "Inspect the repository and summarize the failing tests.",
        session_id="example-001",
    )

print(result.final_response)
```

要使用上面的 `apiyi` 配置，自定義的 Cordis 組合需要掛載 `@deepseek-ai/dsh-llm-pi-ai`，並通過 `settings.yaml` 或組合配置提供 `apiKeyEnv: APIYI_API_KEY`、`api: openai-responses` 和 API易模型列表。

Python SDK 文件列出的內建持久終端組合面向 Linux x64、Linux arm64 和 macOS 14 或更高版本的 arm64；該組合不支援 Windows Agent。Windows 使用者建議優先使用 Web UI 或 CLI。

## 模型選擇

API易 模型會持續更新，建議在使用前檢視最新模型列表、能力說明和使用建議：

<Card title="檢視最新模型推薦" icon="star" href="/zh-Hant/api-capabilities/model-info">
  檢視最新的模型推薦、能力對比和使用建議。模型 ID 以該頁面及 API易 控制台當前可用值為準。
</Card>

## 使用建議

* 為不同任務使用獨立的 session ID；只有需要延續同一段會話和持久 Shell 狀態時，才複用原有 ID。
* Python SDK 示例使用可修改工作區和 `danger-full-access` 組合，建議在可丟棄的 checkout 或容器中執行。
* 不要把 API Key 寫入 `cordis.yml`、`settings.yaml`、原始碼或提交日誌，優先使用 Web UI 憑據儲存或環境變數引用。
* DeepSeek Harness 處於 Developer Preview 階段，升級前請確認外掛配置和模型路由是否仍相容。

## 常見問題

<AccordionGroup>
  <Accordion title="當前配置使用哪個 Provider 和模型？">
    當前配置使用 `apiyi` Provider，協議為 `openai-responses`，Base URL 為 `https://api.apiyi.com/v1`，預設模型為 `deepseek-v4-pro-0813`。
  </Accordion>

  <Accordion title="API易 的 Base URL 和協議應該怎麼填寫？">
    按當前配置填寫 Base URL `https://api.apiyi.com/v1`，協議填寫 `openai-responses`。不要在未確認相容性的情況下把協議改成其他型別。
  </Accordion>

  <Accordion title="為什麼模型選擇器中看不到剛新增的模型？">
    檢查 Provider ID 是否為小寫非空值、模型 ID 是否正確，並確認儲存的是 `llm-pi-ai` 提供方配置。當前預設模型是 `deepseek-v4-pro-0813`；未加入 `models` 列表的自定義模型不會被選擇器使用。
  </Accordion>

  <Accordion title="出現 MISSING_CREDENTIAL 怎麼處理？">
    如果使用 Web UI，請回到**設定 → 模型**為該提供方儲存憑據。如果使用 `settings.yaml`，請確認 `APIYI_API_KEY` 已設定，並確認 `apiKeyEnv` 指向該環境變數。
  </Accordion>

  <Accordion title="模型發現介面返回 401 怎麼辦？">
    先檢查 API易 Token 和 Base URL。DeepSeek Harness 對 OpenAI 相容自定義提供方的模型發現會請求 `GET /models`；如果端點不提供該介面，可以手動填寫模型 ID。
  </Accordion>

  <Accordion title="Python SDK 可以在 Windows 上執行嗎？">
    Python SDK 的內建持久終端組合不支援 Windows Agent。Windows 使用者可以使用 Web UI 或 CLI；如果要使用 Python SDK，請按照專案文件確認執行環境和平臺要求。
  </Accordion>

  <Accordion title="升級後配置失效怎麼辦？">
    專案目前處於 Developer Preview 階段，升級可能包含破壞性變更。請檢查提供方配置、模型 ID 和外掛組合，並參考專案倉庫中的最新文件。
  </Accordion>
</AccordionGroup>

## 相關資源

<CardGroup cols={2}>
  <Card title="API易 快速開始" icon="book" href="/zh-Hant/getting-started">
    獲取 API Key、瞭解 Base URL 和基本呼叫方式。
  </Card>

  <Card title="API易 模型推薦" icon="star" href="/zh-Hant/api-capabilities/model-info">
    檢視最新模型、能力說明和使用建議。
  </Card>

  <Card title="DeepSeek Harness 專案倉庫" icon="github">
    `github.com/deepseek-ai/deepseek-harness`
  </Card>

  <Card title="DeepSeek Harness Web 配置" icon="settings">
    在專案文件中檢視 Provider、憑據和模型配置說明。
  </Card>
</CardGroup>

## 獲取幫助

<CardGroup cols={2}>
  <Card title="企業微信客服" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="企業微信客服二維碼" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    掃碼新增 或 [點選聯絡客服](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    API易 配置、DeepSeek Harness 接入和使用指導
  </Card>

  <Card title="郵件諮詢" icon="mail">
    **客服郵箱**：[support@apiyi.com](mailto:support@apiyi.com)

    **商務合作**：[business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>

<Tip>
  聯絡客服時，請儘量提供 Provider、模型 ID、Base URL、API 協議、錯誤資訊、Node.js 版本、使用方式和相關截圖，以便快速定位問題。
</Tip>
