> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Request ID 在哪裡檢視？

> 排查 API 呼叫問題時，按介面型別查詢響應頭或響應體中的 Request ID，並區分請求 ID 與任務 ID。

## 簡短回答

排查介面問題時，先記錄**模型名稱、介面端點和呼叫時間**，再檢視 HTTP 響應頭中的 `x-request-id` 或 `request-id`。如果介面返回錯誤響應，還要同時檢查 JSON 響應體中的 `request_id` 等標識，並以 API易 日誌中可以檢索到的欄位為準。

Wan 和 HappyHorse 影片介面還會在響應體中返回 `request_id`；響應體中的 `task_id` 用於查詢影片任務，不等同於 Request ID。Seedance、Veo 等非同步影片介面返回的 `id` 或 `task_id` 同樣是影片任務 ID。

<Info>
  API易後臺日誌中的「請求 ID / 上游請求 ID / Completion ID」篩選框可以搜尋使用者提供的標識。開啟控制台的「日誌」頁面後，可以按這個標識定位日誌詳情。
</Info>

## 排查前先做三個動作

<Steps>
  <Step title="第一步：確認模型和介面端點">
    記錄完整模型名稱和實際呼叫地址。例如，文本模型通常呼叫 `/v1/chat/completions`，向量模型呼叫 `/v1/embeddings`，圖片模型可能呼叫 `/v1/images/generations`，影片模型則可能使用 `/v1/videos` 或模型專用的非同步端點。
  </Step>

  <Step title="第二步：記錄呼叫時間">
    記錄請求發起時間，並註明時區，例如 `2026-08-25 14:32 (UTC+8)`。如果發生過重試，也請記錄每次重試的大致時間。
  </Step>

  <Step title="第三步：儲存響應和日誌資訊">
    儲存 HTTP 狀態碼、完整響應頭、完整響應體和客戶端異常。然後進入 API易控制台的「日誌」頁面，使用 Request ID、上游 Request ID 或 Completion ID 搜尋對應記錄。
  </Step>
</Steps>

## 不同模型的 Request ID 在哪裡

| 介面型別                | 優先檢視位置                                                  | 需要區分的欄位                                                                                  |
| ------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 文本 / 對話模型           | 通常檢視 HTTP 響應頭：`x-request-id` 或 `request-id`；錯誤響應還要檢查響應體 | 響應體中的 `id` 可能是 Completion ID，不一定是 API易 Request ID                                        |
| 圖片模型                | 通常檢視 HTTP 響應頭：`x-request-id` 或 `request-id`；錯誤響應還要檢查響應體 | 圖片響應體中的物件 ID 不要僅憑欄位名判斷為 API易 Request ID                                                  |
| 向量 / Embedding 模型   | 優先檢視實際響應頭；錯誤響應還要檢查響應體                                   | 當前向量響應示例主要展示 `data[].embedding`，文件沒有規定統一的 Request ID 欄位位置                                |
| Wan / HappyHorse 影片 | 響應體中的 `request_id`，同時檢查響應頭                              | `output.task_id` 是影片任務 ID，用於輪詢任務狀態                                                       |
| Seedance 影片         | HTTP 響應頭中的 **`X-Shellapi-Request-Id`**；響應體頂層 `id` 另行儲存  | 頂層 `id` 是影片任務 ID，不是 Request ID；響應頭裡的 `X-Request-Id` 是原廠的請求 ID，API易 日誌裡搜不到（2026-09-15 實測） |
| Veo 等非同步影片          | 如果該端點返回 Request ID，優先記錄響應頭中的值；同時儲存任務欄位                  | 響應體中的 `id` / `task_id` 是影片任務 ID                                                          |

<Warning>
  響應頭名稱不區分大小寫，但欄位名中的連字元不能省略：`x-request-id`、`request-id` 和 `request_id` 是不同寫法。請同時檢查響應頭和錯誤響應體，不要只搜尋其中一個名稱。
</Warning>

## 如何從程式碼中讀取

### Python

```python theme={null}
import requests

response = requests.post(
    "https://api.apiyi.com/v1/chat/completions",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json",
    },
    json={
        "model": "YOUR_MODEL",
        "messages": [{"role": "user", "content": "測試請求"}],
    },
    timeout=60,
)

header_request_id = (
    response.headers.get("x-request-id")
    or response.headers.get("request-id")
)

try:
    body = response.json()
except ValueError:
    body = {}

# 只把響應體中的 request_id 作為候選，不要把 body.id 自動當作 API易 Request ID。
request_id = header_request_id or body.get("request_id")

print("status:", response.status_code)
print("request_id:", request_id)
print("body:", response.text)
```

### cURL

使用 `-i` 同時輸出響應頭和響應體，再從響應頭中查詢 `x-request-id` 或 `request-id`：

```bash theme={null}
curl -i "https://api.apiyi.com/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "YOUR_MODEL",
    "messages": [{"role": "user", "content": "測試請求"}]
  }'
```

對於 Wan 或 HappyHorse 影片，還要儲存響應體中的兩個欄位：

```python theme={null}
body = response.json()
request_id = body.get("request_id")
task_id = body.get("output", {}).get("task_id")
```

## 在控制台日誌中搜索

<Steps>
  <Step title="開啟呼叫日誌">
    登入 API易控制台，進入「日誌」頁面，開啟需要排查的日誌詳情。
  </Step>

  <Step title="填寫可用的標識">
    在篩選框「請求 ID / 上游請求 ID / Completion ID」中貼上使用者提供的標識。優先貼上 API易響應頭中的 Request ID；如果沒有，再嘗試上游 Request ID 或 Completion ID。
  </Step>

  <Step title="核對詳情">
    對照日誌中的模型、呼叫時間、介面路徑、渠道、HTTP 狀態碼、錯誤碼和計費記錄，判斷請求是否到達 API易、是否進入上游，以及是否需要修改請求後重試。
  </Step>
</Steps>

<Tip>
  使用者只提供「大概幾點呼叫失敗」時，仍然可以先按模型名稱、呼叫時間和介面端點縮小範圍；但如果使用者能提供 Request ID，通常可以更快定位到單次呼叫。
</Tip>

## 為什麼有時找不到 Request ID

如果請求在收到 HTTP 響應之前就失敗，例如 DNS 解析失敗、無法建立 TCP/TLS 連線、本地代理拒絕連線或客戶端連線超時，API易還沒有機會返回響應頭，因此不會產生可供客戶端讀取的 Request ID。

這類情況請提供：

* 客戶端原始異常和完整堆疊；
* 請求發起時間和時區；
* 使用的模型和介面端點；
* HTTP 客戶端、代理或網路環境；
* 如果同一請求曾成功或重試成功，也請提供對應的 Request ID。

<Warning>
  提交排查材料時不要傳送完整 API Key。請遮蓋令牌中間部分，也不要直接公開包含隱私、業務資料或完整圖片內容的請求體。
</Warning>

## 聯絡客服時請提供什麼

* Request ID；
* 上游 Request ID 或 Completion ID（如果日誌中有）；
* 模型名稱和介面端點；
* 呼叫時間（註明時區）；
* HTTP 狀態碼、完整響應體和客戶端異常；
* 脫敏後的請求引數，以及控制台日誌中的錯誤碼和計費狀態。

## 相關文件

<CardGroup cols={2}>
  <Card title="模型呼叫報錯怎麼排查？" icon="alert-triangle" href="/zh-Hant/faq/model-error-troubleshooting">
    按錯誤型別、引數、分組、超時和日誌記錄排查介面問題
  </Card>

  <Card title="如何檢視我的呼叫記錄？" icon="file-text" href="/zh-Hant/faq/call-logs">
    在控制台檢視呼叫記錄、錯誤資訊和計費詳情
  </Card>

  <Card title="日誌查詢 API" icon="search" href="/zh-Hant/api-capabilities/log-query">
    按時間、模型或 request\_id 程式化查詢呼叫日誌
  </Card>

  <Card title="圖片介面呼叫須知" icon="image" href="/zh-Hant/api-capabilities/image-api-best-practices">
    瞭解圖片請求超時、斷連、計費和請求 ID 的排查方法
  </Card>
</CardGroup>
