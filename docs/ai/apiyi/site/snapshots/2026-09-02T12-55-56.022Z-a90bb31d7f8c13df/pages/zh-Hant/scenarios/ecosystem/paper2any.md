> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Paper2Any 論文多模態工作流

> 社群開源的論文轉換工具，支援將學術論文一鍵轉換為模型架構圖、技術路線圖、PPT簡報、Rebuttal等多種格式，通過 API易 呼叫 GPT、Claude 等大模型。

## 概述

Paper2Any 是一個開源的論文多模態工作流平臺，專注於學術論文的格式轉換與視覺化。支援從論文 PDF/截圖/文本出發，一鍵生成模型架構圖、技術路線圖、實驗圖表、PPT 簡報等多種輸出格式。

<Info>
  **專案資訊**

  * 🔗 開源地址：`github.com/OpenDCAI/Paper2Any`
  * 📜 許可證：開源
  * 👤 組織：OpenDCAI
  * ⭐ 該專案由社群貢獻，支援通過 API易 呼叫多種大模型
</Info>

## 為什麼選擇 Paper2Any

<CardGroup cols={2}>
  <Card title="多種輸出格式" icon="layers">
    支援論文轉架構圖、路線圖、PPT、Rebuttal 等，一個工具覆蓋科研全流程
  </Card>

  <Card title="靈活模型選擇" icon="sliders-horizontal">
    支援動態切換 GPT-4o、Claude Sonnet、Qwen-VL 等模型，無需硬編碼，通過 API 引數即可指定
  </Card>

  <Card title="CLI + Web 雙模式" icon="terminal">
    提供命令列指令碼和 Web 介面兩種使用方式，適合不同場景需求
  </Card>

  <Card title="OpenAI 相容介面" icon="plug">
    原生支援 OpenAI 相容 API 格式，只需配置 API易 的 Base URL 即可接入 400+ 模型
  </Card>
</CardGroup>

## 核心功能模組

| 功能模組               | 說明                         | 輸出格式                         |
| ------------------ | -------------------------- | ---------------------------- |
| **Paper2Figure**   | 論文生成科研視覺化圖                 | 模型架構圖、技術路線圖（PPTX + SVG）、實驗圖表 |
| **Paper2Diagram**  | 論文/文本/圖片生成流程圖              | draw\.io / PNG / SVG         |
| **Paper2PPT**      | 論文轉 PPT 簡報                 | PPTX（支援 40+ 頁長文件）            |
| **Paper2Rebuttal** | 生成結構化審稿回覆                  | 帶證據引用的 Rebuttal 文件           |
| **PDF2PPT**        | PDF 保留排版轉可編輯 PPT           | PPTX                         |
| **Image2PPT**      | 圖片/截圖轉結構化幻燈片               | PPTX                         |
| **PPTPolish**      | AI 驅動的 PPT 排版最佳化           | PPTX                         |
| **知識庫**            | 檔案匯入、語義搜尋，驅動 PPT/播客/思維導圖生成 | 多種格式                         |

## 通過 API易 接入大模型

Paper2Any 支援 OpenAI 相容 API 格式，配置 API易 作為 LLM 服務端點後，即可使用 GPT、Claude、Gemini、DeepSeek 等 400+ 模型。

### Docker 部署配置

<Steps>
  <Step title="第一步：獲取 API易 金鑰">
    1. 訪問 [API易控制台](https://api.apiyi.com) 註冊/登入
    2. 進入【令牌】欄目
    3. 點選生成新的 API 金鑰
    4. 複製金鑰（以 `sk-` 開頭）備用
  </Step>

  <Step title="第二步：克隆專案並配置後端環境變數">
    克隆倉庫後，編輯 `fastapi_app/.env` 檔案，配置 API易 作為 LLM 端點：

    ```bash theme={null}
    # fastapi_app/.env
    DEFAULT_LLM_API_URL=https://api.apiyi.com/v1
    BACKEND_API_KEY=sk-你的API易金鑰
    ```

    可選：為不同工作流指定預設模型：

    ```bash theme={null}
    PAPER2PPT_DEFAULT_MODEL=gpt-4o
    PDF2PPT_DEFAULT_MODEL=gpt-4o
    ```
  </Step>

  <Step title="第三步：配置前端環境變數">
    編輯 `frontend-workflow/.env` 檔案，讓 Web 介面預設使用 API易：

    ```bash theme={null}
    # frontend-workflow/.env
    VITE_DEFAULT_LLM_API_URL=https://api.apiyi.com/v1
    VITE_LLM_API_URLS=https://api.apiyi.com/v1
    ```
  </Step>

  <Step title="第四步：啟動服務">
    使用 Docker Compose 一鍵啟動：

    ```bash theme={null}
    docker compose up -d --build
    ```

    啟動完成後，訪問前端頁面即可開始使用。
  </Step>
</Steps>

### CLI 命令列使用

Paper2Any 提供獨立的命令列指令碼，支援通過 `--api-url` 和 `--api-key` 引數直接指定 API易：

```bash theme={null}
# 論文轉 PPT
python script/run_paper2ppt_cli.py \
  --input paper.pdf \
  --api-url https://api.apiyi.com/v1 \
  --api-key sk-你的API易金鑰 \
  --model gpt-4o

# 論文轉科研圖
python script/run_paper2figure_cli.py \
  --input paper.pdf \
  --api-url https://api.apiyi.com/v1 \
  --api-key sk-你的API易金鑰 \
  --graph-type model_arch
```

<Tip>
  **模型推薦**：論文轉 PPT 推薦使用 GPT-4o 或 Claude Sonnet 4.5，它們在長文件理解和結構化輸出方面表現出色。圖表生成任務也可嘗試 Qwen-VL 等視覺模型。
</Tip>

## 部署方式

| 部署方式           | 說明                                        | 適合場景      |
| -------------- | ----------------------------------------- | --------- |
| **Docker（推薦）** | 一鍵啟動前後端服務                                 | 快速體驗、生產部署 |
| **Linux 原生**   | 需 Python 3.11+、LaTeX、Inkscape、LibreOffice | 開發除錯、定製需求 |
| **Windows**    | 需 Python 3.12、Inkscape                    | 本地使用      |

<Warning>
  PDF2PPT 和 Image2PPT 等功能依賴 GPU，需要額外部署 SAM3 模型伺服器。詳見專案 README 的 GPU 部署說明。
</Warning>

## 常見問題

<AccordionGroup>
  <Accordion title="如何讓 Paper2Any 使用 API易 的模型？">
    在環境變數中將 `DEFAULT_LLM_API_URL` 設定為 `https://api.apiyi.com/v1`，並將 `BACKEND_API_KEY` 設定為你的 API易 金鑰即可。CLI 模式下使用 `--api-url` 和 `--api-key` 引數。
  </Accordion>

  <Accordion title="支援哪些大模型？">
    通過 API易 接入後，支援 400+ 模型，包括 GPT-4o、Claude Sonnet 4.5、Gemini、DeepSeek、Qwen 等。可在 Web 介面動態切換模型，無需修改程式碼。
  </Accordion>

  <Accordion title="Docker 啟動失敗怎麼辦？">
    請檢查：

    1. Docker 和 Docker Compose 是否已正確安裝
    2. `.env` 檔案是否已正確配置
    3. 埠是否被佔用
    4. 檢視 `docker compose logs` 獲取詳細錯誤資訊
  </Accordion>

  <Accordion title="生成 PPT 時報錯或內容不完整？">
    * 確保 API易 賬戶餘額充足
    * 長論文建議使用上下文視窗更大的模型（如 GPT-4o 128K）
    * 檢查論文 PDF 是否為可搜尋文本格式（掃描版 PDF 效果可能較差）
  </Accordion>

  <Accordion title="如何獲取 API易 金鑰？">
    訪問 [API易控制台](https://api.apiyi.com/token)，註冊賬號後在【令牌】欄目生成新的金鑰。新使用者有免費測試額度。
  </Accordion>
</AccordionGroup>

## 相關資源

<CardGroup cols={2}>
  <Card title="API易 模型列表" icon="list" href="/zh-Hant/api-capabilities/model-info">
    檢視 API易 支援的 400+ 模型完整列表
  </Card>

  <Card title="Base URL 配置指南" icon="settings" href="/zh-Hant/faq/base-url-config">
    瞭解如何在各類工具中配置 API易 Base URL
  </Card>

  <Card title="API易-令牌管理" icon="key" href="https://api.apiyi.com/token">
    管理 API 金鑰、檢視用量和餘額
  </Card>

  <Card title="API易 價格頁面" icon="banknote" href="https://api.apiyi.com/account/pricing">
    檢視各模型定價和充值優惠
  </Card>
</CardGroup>
