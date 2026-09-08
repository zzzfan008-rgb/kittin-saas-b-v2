> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API 手冊

> API易 介面使用手冊。API易 是 OpenAI 相容的 AI 閘道，一套程式碼即可接入 400+ 主流大模型，本頁幫你快速找到模型、線上除錯與整合方式。

API易 是一個 **OpenAI 相容的 AI 閘道**：用一套標準介面、一個 API Key，即可呼叫 400+ 主流大模型。本頁是導航入口——幫你快速找到**該用哪個模型**、**線上除錯介面**，以及**如何整合**。

## 平臺概覽

### OpenAI 相容模式

API易 採用 **OpenAI 相容格式**，跑通一次後，切換模型只需**更換 `model` 欄位**，其餘程式碼完全不變：

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

# 切換模型 = 只改 model 這一個欄位，其它程式碼不動
response = client.chat.completions.create(
    model="gpt-5-chat-latest",   # 換成任意支援的模型名即可
    messages=[{"role": "user", "content": "你好！"}]
)
print(response.choices[0].message.content)
```

<Note>
  具體可用的模型名稱、定價與推薦場景，請檢視下方「選擇模型」中的兩個專頁，不在本頁羅列（避免資訊過期）。
</Note>

### 功能支援範圍

<CardGroup cols={2}>
  <Card title="支援的功能" icon="circle-check">
    * 對話補全（Chat Completions）
    * 影像 / 影片生成
    * 語音轉錄（Whisper）
    * 嵌入向量（Embeddings）
    * 函式呼叫（Function Calling）
    * 流式輸出（SSE）
    * 標準 OpenAI 引數：`temperature`、`top_p`、`max_tokens` 等
    * Responses 端點
  </Card>

  <Card title="暫不支援的功能" icon="circle-x">
    * 微調介面（Fine-tuning）
    * Files 檔案管理介面
    * 組織管理介面
    * 計費管理介面
  </Card>
</CardGroup>

## 選擇模型

不確定用哪個模型？以下兩個專頁保持更新，含定價、能力對比與推薦場景：

<CardGroup cols={2}>
  <Card title="文本 / 多模態模型推薦" icon="sparkles" href="/zh-Hant/api-capabilities/model-info">
    GPT、Claude、Gemini、Grok、DeepSeek、通義、Kimi、GLM 等文本與多模態模型的能力、定價與選型建議。
  </Card>

  <Card title="圖片 / 影片生成模型" icon="image" href="/zh-Hant/api-capabilities/image-video-models">
    Nano Banana、GPT-image、Seedream、Flux 等影像模型，以及 VEO、Sora、Wan 等影片生成模型的定價與用法。
  </Card>
</CardGroup>

## 基礎資訊

### API 端點

* **主要端點**：`https://api.apiyi.com/v1`
* **備用端點**：`https://vip.apiyi.com/v1`

### 認證方式

所有請求需在 Header 中攜帶 API Key：

```http theme={null}
Authorization: Bearer YOUR_API_KEY
```

### 請求格式

* **Content-Type**：`application/json`
* **編碼**：UTF-8
* **方法**：大部分介面為 `POST`

## 快速開始

### 獲取 API Key

1. 訪問 [API易控制台](https://api.apiyi.com/token) 並登入
2. 在令牌管理頁面點選「新增」建立 API Key
3. 複製生成的 Key 用於介面呼叫

### 獲取多語言程式碼示例

控制台已內建各語言的可執行程式碼示例，會隨最新 API 版本即時更新，**建議優先使用**：

1. 進入 [令牌管理頁面](https://api.apiyi.com/token)
2. 在目標 API Key 所在行，點選「操作」列的 🔧 小扳手圖示
3. 選擇「請求示例」，即可檢視 cURL、Python、Node.js、Java、C#、Go、PHP、Ruby 等語言的完整示例

<img src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/apiyi-token-simple-code.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=067d8d551cd1d8aaebb833932e6632a5" alt="API易令牌管理介面 - 請求示例" width="1496" height="902" data-path="images/apiyi-token-simple-code.png" />

## 線上除錯（Playground）

「API 參考」欄目提供**線上 Playground**：填入 API Key 即可直接傳送請求、即時檢視響應，無需寫程式碼。

<CardGroup cols={3}>
  <Card title="對話補全 Chat" icon="messages-square" href="/api-reference/chat/chat-completions">
    `POST /v1/chat/completions`，對話與多模態主力介面。
  </Card>

  <Card title="模型列表 Models" icon="list" href="/api-reference/models/list-models">
    `GET /v1/models`，查詢當前可用模型。
  </Card>

  <Card title="向量嵌入 Embeddings" icon="braces" href="/api-reference/embeddings/create-embeddings">
    `POST /v1/embeddings`，文本向量化。
  </Card>
</CardGroup>

<Note>
  影像、影片生成介面的 Playground 位於各自模型頁（見上方「選擇模型」中的圖片 / 影片模型專頁）。
</Note>

## 最小呼叫示例

最常用的對話補全介面，複製即可執行；更多引數與語言請用上方 Playground 或控制台「請求示例」：

<Tabs>
  <Tab title="Python (SDK)">
    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(
        api_key="YOUR_API_KEY",
        base_url="https://api.apiyi.com/v1"
    )

    response = client.chat.completions.create(
        model="gpt-5-chat-latest",
        messages=[
            {"role": "system", "content": "你是一個有用的AI助手。"},
            {"role": "user", "content": "你好！請介紹一下自己。"}
        ],
        temperature=0.7,
        max_tokens=1000
    )

    print(response.choices[0].message.content)
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={null}
    curl -X POST "https://api.apiyi.com/v1/chat/completions" \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "gpt-5-chat-latest",
        "messages": [
          {"role": "system", "content": "你是一個有用的AI助手。"},
          {"role": "user", "content": "你好！請介紹一下自己。"}
        ],
        "temperature": 0.7,
        "max_tokens": 1000
      }'
    ```
  </Tab>
</Tabs>

## 流式響應

在請求中設定 `stream: true`，響應將以 Server-Sent Events（SSE）逐塊返回，適合打字機式輸出：

```python theme={null}
stream = client.chat.completions.create(
    model="gpt-5-chat-latest",
    messages=[{"role": "user", "content": "講個短笑話"}],
    stream=True
)

for chunk in stream:
    content = chunk.choices[0].delta.content or ""
    print(content, end="", flush=True)
```

SSE 資料以 `data: ` 開頭，最後一行為 `data: [DONE]` 表示結束。

## 錯誤處理

介面遵循 OpenAI 錯誤格式：

```json theme={null}
{
  "error": {
    "message": "Invalid API key provided",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```

常見錯誤碼：

| 錯誤碼                     | HTTP 狀態碼 | 說明       |
| ----------------------- | -------- | -------- |
| invalid\_api\_key       | 401      | API 金鑰無效 |
| insufficient\_quota     | 429      | 額度不足     |
| model\_not\_found       | 404      | 模型不存在    |
| invalid\_request\_error | 400      | 請求引數錯誤   |
| rate\_limit\_exceeded   | 429      | 請求頻率過高   |
| server\_error           | 500      | 伺服器內部錯誤  |

<Tip>
  建議實現指數退避重試：遇到 429 / 500 時間隔翻倍重試，可顯著提升穩定性。API Key 請用環境變數儲存，不要硬編碼進程式碼。
</Tip>

上表只給出錯誤碼的含義，**具體原因寫在響應體的 `error.message` 裡**——而這段原文只在介面響應中返回一次，後臺日誌不會保留。請務必在客戶端把它完整列印並落盤：

<Card title="介面錯誤資訊留存指南" icon="clipboard-list" href="/zh-Hant/api-manual/error-reporting">
  為什麼必須自己列印原始錯誤、各語言的正確捕獲寫法、必須留存的 7 個欄位，以及可直接複製的報障模板
</Card>

## 速率限制

| 限制類型        | 預設值     | 說明        |
| ----------- | ------- | --------- |
| RPM（每分鐘請求數） | 3000    | 每個 API 金鑰 |
| TPM（每分鐘令牌數） | 1000000 | 每個 API 金鑰 |
| 併發請求數       | 100     | 同時處理的請求   |

超出限制會返回 `429`，請合理控制請求頻率。

## 需要幫助？

<CardGroup cols={2}>
  <Card title="選擇模型" icon="sparkles" href="/zh-Hant/api-capabilities/model-info">
    文本 / 多模態模型推薦與定價。
  </Card>

  <Card title="線上除錯" icon="play" href="/api-reference/chat/chat-completions">
    開啟 API 參考 Playground 直接發請求。
  </Card>
</CardGroup>

* 訪問官網：[api.apiyi.com](https://api.apiyi.com)
* 技術支援郵箱：`support@apiyi.com`
