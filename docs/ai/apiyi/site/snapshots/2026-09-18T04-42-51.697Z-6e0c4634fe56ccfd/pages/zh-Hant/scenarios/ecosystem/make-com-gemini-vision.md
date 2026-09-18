> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Make.com 接入 Gemini 影像理解

> 在 Make.com 自動化工作流中通過 HTTP 請求節點呼叫 API易 的 Gemini 影像理解 API，實現圖片內容分析、OCR 識別等自動化任務。

## 概述

Make.com（原 Integromat）是一款強大的無程式碼自動化平臺。通過其內建的 **HTTP 請求節點（Make a request）**，你可以直接呼叫 API易 的 Gemini 原生格式 API，實現影像理解、圖片內容分析等多模態自動化工作流，無需編寫任何程式碼。

<Info>
  **整合資訊**

  * 🔧 工具：Make.com（`make.com`）
  * 🔌 接入方式：HTTP 請求節點（Make a request）
  * 🤖 模型：Gemini 系列（通過 API易 Gemini 原生格式呼叫）
  * 📡 API 端點：`https://api.apiyi.com/v1beta/models/{model}:generateContent`
</Info>

## 為什麼選擇 Make.com + API易

<CardGroup cols={2}>
  <Card title="零程式碼整合" icon="wand-sparkles">
    通過視覺化拖拽配置 HTTP 請求節點，無需編寫程式碼即可呼叫 AI 模型
  </Card>

  <Card title="自動化工作流" icon="refresh-cw">
    結合 Make.com 的觸發器和條件邏輯，構建完整的影像處理自動化流程
  </Card>

  <Card title="多模型支援" icon="layers">
    API易 支援 400+ 模型，一個金鑰即可在 Make.com 中切換不同的 AI 能力
  </Card>

  <Card title="靈活擴充套件" icon="puzzle">
    可與 Google Sheets、Slack、Email 等 1000+ 應用無縫銜接
  </Card>
</CardGroup>

## 支援的 API易 模型

| 模型名稱                   | 模型標識                     | 用途        | API文件                                           |
| ---------------------- | ------------------------ | --------- | ----------------------------------------------- |
| Gemini 3.1 Pro Preview | `gemini-3.1-pro-preview` | 影像理解、文本生成 | [檢視文件](/zh-Hant/api-capabilities/gemini/native) |
| Gemini 3 Pro Preview   | `gemini-3-pro-preview`   | 影像理解、影像生成 | [檢視文件](/zh-Hant/api-capabilities/gemini/native) |
| Gemini 3 Flash Preview | `gemini-3-flash-preview` | 影像理解（高速）  | [檢視文件](/zh-Hant/api-capabilities/gemini/native) |

<Tip>
  推薦使用 `gemini-3.1-pro-preview`，擁有最強的影像理解能力。如果對速度要求更高，可以選擇 Flash 系列。
</Tip>

## 配置步驟

<Steps>
  <Step title="第一步：獲取 API易 金鑰">
    1. 訪問 [API易控制台](https://api.apiyi.com) 註冊/登入
    2. 進入【令牌】欄目，生成新的 API 金鑰
    3. 複製金鑰（以 `sk-` 開頭），後續配置需要用到
  </Step>

  <Step title="第二步：建立 Make.com 場景">
    1. 登入 Make.com，點選 **Create a new scenario**
    2. 點選 **+** 新增模組
    3. 搜尋並選擇 **HTTP** 模組
    4. 在 Actions 中選擇 **Make a request**
  </Step>

  <Step title="第三步：配置 HTTP 請求節點">
    在 HTTP 請求節點中填寫以下配置：

    **URL**：

    ```
    https://api.apiyi.com/v1beta/models/gemini-3.1-pro-preview:generateContent
    ```

    **Method**：`POST`

    **Headers**：

    | Header 名稱       | 值                    |
    | --------------- | -------------------- |
    | `Content-Type`  | `application/json`   |
    | `Authorization` | `Bearer sk-你的API易金鑰` |

    **Body type**：`Raw`

    **Content type**：`JSON (application/json)`

    **Request content（Body）**：

    ```json theme={null}
    {
      "contents": [
        {
          "parts": [
            {
              "text": "這張圖片裡有什麼？"
            },
            {
              "fileData": {
                "mimeType": "image/png",
                "fileUri": "https://你的圖片URL地址"
              }
            }
          ]
        }
      ]
    }
    ```
  </Step>

  <Step title="第四步：測試執行">
    點選 **Run once** 測試請求，確認返回正確的影像理解結果。
  </Step>
</Steps>

## 完整請求示例

以下是一個完整的影像理解請求示例，分析一張水獺圖片的內容：

```json theme={null}
{
  "contents": [
    {
      "parts": [
        {
          "text": "這張圖片裡有什麼？"
        },
        {
          "fileData": {
            "mimeType": "image/png",
            "fileUri": "https://raw.githubusercontent.com/apiyi-api/ai-api-code-samples/refs/heads/main/Vision-API-OpenAI/otter.png"
          }
        }
      ]
    }
  ]
}
```

### 請求引數說明

| 欄位                          | 型別     | 必填 | 說明                                           |
| --------------------------- | ------ | -- | -------------------------------------------- |
| `contents`                  | array  | 是  | 對話內容陣列                                       |
| `contents[].parts`          | array  | 是  | 訊息組成部分（文本 + 圖片）                              |
| `parts[].text`              | string | 是  | 使用者的文字提示                                     |
| `parts[].fileData.mimeType` | string | 是  | 圖片格式：`image/png`、`image/jpeg`、`image/webp` 等 |
| `parts[].fileData.fileUri`  | string | 是  | 圖片的公開訪問 URL                                  |

<Warning>
  `fileUri` 必須是**公開可訪問**的圖片 URL。如果圖片需要登入才能訪問，請先將圖片上傳到公開的儲存服務（如物件儲存）。
</Warning>

## 實用場景

### 場景一：自動分析郵件附件中的圖片

1. **觸發器**：Gmail - Watch emails（監聽新郵件）
2. **處理**：HTTP 節點呼叫 Gemini 影像理解
3. **輸出**：將分析結果寫入 Google Sheets 或傳送到 Slack

### 場景二：電商產品圖自動標籤

1. **觸發器**：Google Drive - Watch files（監聽新上傳的圖片）
2. **處理**：HTTP 節點分析產品圖片內容
3. **輸出**：自動為產品圖新增分類標籤

### 場景三：社交媒體內容稽核

1. **觸發器**：定時獲取使用者提交的圖片
2. **處理**：HTTP 節點分析圖片內容是否合規
3. **輸出**：不合規內容自動標記告警

## 進階技巧

### 動態替換圖片 URL

在 Make.com 中，你可以使用上游模組的輸出變數動態替換 `fileUri`，實現批次圖片分析：

```json theme={null}
{
  "contents": [
    {
      "parts": [
        {
          "text": "請描述這張圖片的內容，並提取其中的文字"
        },
        {
          "fileData": {
            "mimeType": "image/png",
            "fileUri": "{{上游模組的圖片URL變數}}"
          }
        }
      ]
    }
  ]
}
```

### 切換不同模型

只需修改 URL 中的模型名稱即可切換模型：

| 需求     | URL                                                                          |
| ------ | ---------------------------------------------------------------------------- |
| 最強理解能力 | `https://api.apiyi.com/v1beta/models/gemini-3.1-pro-preview:generateContent` |
| 高速分析   | `https://api.apiyi.com/v1beta/models/gemini-3-flash-preview:generateContent` |

## 常見問題

<AccordionGroup>
  <Accordion title="HTTP 請求返回 401 錯誤？">
    請檢查：

    1. Authorization Header 格式是否正確：`Bearer sk-你的金鑰`（注意 Bearer 後有空格）
    2. API 金鑰是否有效（在 API易控制台確認）
    3. 賬戶餘額是否充足
  </Accordion>

  <Accordion title="圖片無法識別或返回錯誤？">
    請確認：

    1. `fileUri` 是公開可訪問的 URL（在瀏覽器中可以直接開啟）
    2. `mimeType` 與實際圖片格式一致
    3. 圖片大小不超過模型限制
  </Accordion>

  <Accordion title="如何在 Make.com 中處理返回結果？">
    Gemini API 返回 JSON 格式的響應，你可以：

    1. 使用 Make.com 的 **JSON** 模組解析返回資料
    2. 提取 `candidates[0].content.parts[0].text` 欄位獲取分析結果
    3. 將結果傳遞給下游模組（如寫入資料庫、傳送通知等）
  </Accordion>

  <Accordion title="如何獲取 API易 金鑰？">
    訪問 [API易控制台](https://api.apiyi.com/token)，註冊賬號後在【令牌】欄目生成新的金鑰。新使用者有免費測試額度。
  </Accordion>

  <Accordion title="支援 Base64 編碼的圖片嗎？">
    支援。將 `fileData` 替換為 `inlineData`：

    ```json theme={null}
    {
      "inlineData": {
        "mimeType": "image/png",
        "data": "Base64編碼的圖片資料"
      }
    }
    ```
  </Accordion>
</AccordionGroup>

## 相關資源

<CardGroup cols={2}>
  <Card title="Gemini 原生格式文件" icon="book" href="/zh-Hant/api-capabilities/gemini/native">
    檢視 Gemini 原生 API 格式的完整說明
  </Card>

  <Card title="影像理解 API" icon="eye" href="/zh-Hant/api-capabilities/vision-understanding">
    檢視 API易 影像理解能力總覽
  </Card>

  <Card title="常見問題" icon="circle-question-mark" href="/zh-Hant/faq/model-selection-guide">
    檢視 FAQ 獲取更多幫助
  </Card>

  <Card title="API易-令牌管理" icon="settings" href="https://api.apiyi.com/token">
    管理 API 金鑰、檢視用量和餘額
  </Card>
</CardGroup>
