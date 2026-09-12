> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 使用指南

> OpenClaw 使用方式、核心技能、常用命令與實際使用示例

## 使用方式

### 方式一：Web UI（推薦）

最簡單的使用方式，無需任何外部服務：

```bash theme={null}
openclaw dashboard
```

瀏覽器會開啟 `http://127.0.0.1:18789/`，直接在網頁聊天視窗發訊息即可。

<Tip>
  Web UI 是國內使用者的推薦方式，不需要代理，直接可用。
</Tip>

### 方式二：Telegram Bot

1. 在 Telegram 搜尋 `@BotFather`
2. 傳送 `/newbot` 建立機器人
3. 獲取 Bot Token
4. 在 `openclaw onboard` 時輸入 Token

<Warning>
  國內使用 Telegram 需要代理支援：

  ```bash theme={null}
  export https_proxy=http://127.0.0.1:代理埠
  export http_proxy=http://127.0.0.1:代理埠
  openclaw gateway restart
  ```
</Warning>

### 方式三：其他平臺

OpenClaw 還支援：

* WhatsApp（掃碼連線）
* Discord（需要建立 Bot）
* Slack、Signal、iMessage、微軟 Teams 等

## 核心技能

OpenClaw 內建豐富的技能，可以執行各種任務：

### 檔案操作

| 技能         | 功能          |
| ---------- | ----------- |
| `fs.read`  | 讀取檔案（文本/圖片） |
| `fs.write` | 寫入/建立檔案     |
| `fs.edit`  | 編輯檔案內容      |

### 系統操作

| 技能              | 功能                   |
| --------------- | -------------------- |
| `shell.exec`    | 執行終端命令               |
| `shell.process` | 管理執行中的命令             |
| `browser.*`     | 自動控制瀏覽器（開啟網頁、截圖、點選等） |

### 智慧功能

| 技能              | 功能            |
| --------------- | ------------- |
| `web_search`    | 網頁搜尋          |
| `web_fetch`     | 抓取網頁內容        |
| `memory_search` | 搜尋記憶          |
| `memory_get`    | 讀取記憶          |
| `cron.*`        | 定時任務（提醒、自動執行） |
| `tts`           | 文字轉語音         |

## 常用命令

### 終端命令

| 命令                         | 功能            |
| -------------------------- | ------------- |
| `openclaw onboard`         | 執行安裝嚮導        |
| `openclaw gateway start`   | 啟動 Gateway 服務 |
| `openclaw gateway restart` | 重啟 Gateway 服務 |
| `openclaw gateway stop`    | 停止 Gateway 服務 |
| `openclaw status`          | 檢視執行狀態        |
| `openclaw doctor`          | 診斷配置問題        |
| `openclaw doctor --fix`    | 自動修復配置問題      |
| `openclaw dashboard`       | 開啟 Web 控制面板   |
| `openclaw logs --follow`   | 檢視即時日誌        |
| `openclaw configure`       | 修改配置          |
| `openclaw update`          | 更新到最新版本       |

### 聊天命令

在聊天視窗中可以使用的命令：

| 命令                | 功能     |
| ----------------- | ------ |
| `/help`           | 顯示幫助   |
| `/new`            | 開始新對話  |
| `/reset`          | 重置對話   |
| `/stop`           | 停止當前任務 |
| `/think <level>`  | 設定思考深度 |
| `/model <id>`     | 切換模型   |
| `/verbose on/off` | 開關詳細模式 |
| `/status`         | 檢視狀態   |
| `/skills`         | 檢視可用技能 |

## 使用示例

直接用中文與 OpenClaw 對話，它會自動理解並執行任務：

### 檔案操作

```text theme={null}
> 幫我在桌面建立一個 test.txt 檔案，內容寫 hello world

> 讀取 ~/Documents/notes.txt 的內容

> 把桌面上所有 .png 檔案移動到 Pictures 資料夾
```

### 終端命令

```text theme={null}
> 列出我桌面上的所有檔案

> 檢視當前系統記憶體使用情況

> 幫我安裝 python 的 requests 庫
```

### 瀏覽器控制

```text theme={null}
> 開啟瀏覽器訪問 baidu.com

> 搜尋一下最新的 MacBook Pro 價格

> 截圖當前網頁
```

### 定時任務

```text theme={null}
> 每天早上 9 點提醒我喝水

> 每隔 1 小時提醒我休息一下

> 明天下午 3 點提醒我開會
```

### 程式設計輔助

```text theme={null}
> 幫我寫一個 Python 指令碼，批次重新命名檔案

> 這段程式碼有什麼問題：[貼上程式碼]

> 幫我寫一個簡單的 HTML 頁面
```

## 推薦模型

OpenClaw 通過 API易 支援 400+ 主流 AI 模型，可根據不同任務選擇合適的模型。

<Card title="檢視模型推薦" icon="star" href="/zh-Hant/api-capabilities/model-info">
  檢視最新的場景化模型推薦，包括文本創作、程式設計開發、快速響應、長文本處理等全場景的最佳模型選擇。
</Card>

### 場景化模型推薦

| 任務型別   | 推薦模型            | 原因           |
| ------ | --------------- | ------------ |
| 複雜任務執行 | Claude Sonnet 4 | 理解能力強，執行準確   |
| 日常對話   | GPT-5.4         | 響應自然，通用性好    |
| 程式碼編寫  | DeepSeek V3.2   | 程式設計能力強，價效比高 |
| 長文件處理  | Gemini 3.1 Pro  | 支援超長上下文      |
