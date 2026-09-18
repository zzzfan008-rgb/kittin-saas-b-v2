> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# CLI 互動式配置

> 使用 openclaw onboard 嚮導和 CLI 命令快速配置 OpenClaw

## 安裝嚮導（推薦新使用者）

首次使用 OpenClaw，執行安裝嚮導完成所有配置：

```bash theme={null}
openclaw onboard
```

### 步驟一：選擇模型提供商

在 **Model/auth provider** 列表中，滾動到底部，選擇：

```text theme={null}
Custom Provider (Any OpenAI or Anthropic compatible endpoint)
```

### 步驟二：填寫 API 地址

在 **API Base URL** 欄位中輸入 API易 的介面地址：

```text theme={null}
https://api.apiyi.com
```

### 步驟三：選擇金鑰輸入方式

系統會詢問 API 金鑰的提供方式，選擇：

```text theme={null}
Paste API key now
```

### 步驟四：貼上 API 金鑰

在金鑰輸入框中，貼上你的 API易 令牌（即金鑰，`sk-` 開頭）。

獲取方式：

1. 開啟 API易 令牌管理頁面：`https://api.apiyi.com/token`
2. 找到型別為**按量優先**的預設令牌
3. 在該令牌所在行最右側的「操作」欄，點選**第一個複製按鈕**
4. 即可複製出 `sk-` 開頭的令牌（金鑰），貼上到此處即可

<img src="https://mintcdn.com/apiyillc/VhX_X1CtsRG4uabo/images/openclaw-paste-api-key.png?fit=max&auto=format&n=VhX_X1CtsRG4uabo&q=85&s=e34c60488a8e4ed46fdcb1edccda8812" alt="貼上 API 金鑰" width="1338" height="800" data-path="images/openclaw-paste-api-key.png" />

<Tip>
  無需新建令牌，直接使用系統預設生成的「按量優先」令牌即可。
</Tip>

### 步驟五：選擇端點相容模式

在 **Endpoint compatibility** 選項中，選擇：

```text theme={null}
OpenAI-compatible (Uses /chat/completions)
```

<Info>
  如果你主要使用 Claude 模型並需要 Prompt Caching 等原生特性，可以選擇 `Anthropic-compatible`。詳見 [Anthropic 原生配置](/zh-Hant/scenarios/agent/openclaw/config-anthropic)。
</Info>

### 步驟六：設定模型 ID

在 **Model ID** 欄位中輸入你要使用的模型名稱，例如：

```text theme={null}
gpt-4o
```

<Info>
  建議初始配置時先使用 `gpt-4o` 等常見模型完成驗證，跑通後再在 OpenClaw 中切換為你實際需要的模型（如 `gpt-5.4`）。部分老版本 OpenClaw 在初始化階段可能無法識別較新的模型名稱，導致 503 錯誤。每次修改完模型配置後，記得重啟 OpenClaw 使配置生效，也可以在對話中讓 OpenClaw 自行重啟。
</Info>

其他可選模型：`claude-sonnet-4-6`、`deepseek-v3.2`、`gemini-3.1-pro-preview` 等。

### 步驟七：驗證並完成

OpenClaw 會自動驗證配置。驗證成功後，系統會生成一個 **Endpoint ID**（如 `custom-api-apiyi-com`），表示配置完成。

<Warning>
  驗證過程偶爾可能返回錯誤，重試通常即可成功。如果持續失敗，請檢查 API 金鑰是否正確、網路是否通暢。
</Warning>

### 配置完成後的引數

| 引數            | 值                            |
| ------------- | ---------------------------- |
| Provider      | Custom Provider              |
| API Base URL  | `https://api.apiyi.com`      |
| Compatibility | OpenAI-compatible            |
| Endpoint ID   | `custom-api-apiyi-com`（自動生成） |

## 修改配置

已完成初始配置後，使用 `configure` 命令重新進入互動式配置：

```bash theme={null}
openclaw configure
```

這會開啟互動式配置選單，可以修改：

* 模型提供商和預設模型
* 聊天渠道設定
* 技能啟用/停用
* Gateway 引數

## 單項配置命令

快速檢視或修改單個配置項：

```bash theme={null}
{/* 檢視當前配置值 */}
openclaw config get agents.defaults.model.primary

{/* 設定配置值 */}
openclaw config set agents.defaults.model.primary "apiyi/gpt-5.4"

{/* 設定 API 金鑰 */}
openclaw config set models.providers.apiyi.apiKey "sk-你的金鑰"
```

## Web UI 配置面板

啟動 Dashboard 後，也可以在瀏覽器中管理配置：

```bash theme={null}
openclaw dashboard
```

開啟 `http://127.0.0.1:18789/`，在設定頁面可以：

* 視覺化編輯模型配置
* 管理聊天渠道連線
* 檢視和切換已配置的技能
* 即時檢視日誌和執行狀態

## 啟動服務

配置完成後啟動 Gateway：

```bash theme={null}
openclaw gateway start
```

<Tip>
  配置更改後需要重啟服務：

  ```bash theme={null}
  openclaw gateway restart
  ```
</Tip>
