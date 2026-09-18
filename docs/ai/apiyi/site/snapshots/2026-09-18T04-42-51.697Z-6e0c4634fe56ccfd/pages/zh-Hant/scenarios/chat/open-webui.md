> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Open WebUI

> 功能豐富的自託管 AI 介面整合指南

Open WebUI 是一個功能豐富的自託管 AI 平臺，支援完全離線執行。通過 API易，您可以在 Open WebUI 中整合各種主流大語言模型。

## 快速部署

### Docker 快速啟動

```bash theme={null}
docker run -d -p 3000:8080 \
  --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data \
  --name open-webui \
  --restart always \
  ghcr.io/open-webui/open-webui:main
```

### Docker Compose 部署

```yaml theme={null}
version: '3.6'

services:
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    ports:
      - "3000:8080"
    volumes:
      - open-webui:/app/backend/data
    environment:
      - OPENAI_API_BASE_URL=https://api.apiyi.com
      - OPENAI_API_KEY=您的API易金鑰
    restart: unless-stopped

volumes:
  open-webui:
```

## 配置 API易

### 方法一：環境變數配置

在部署時設定環境變數：

```bash theme={null}
docker run -d -p 3000:8080 \
  -e OPENAI_API_BASE_URL=https://api.apiyi.com \
  -e OPENAI_API_KEY=您的API易金鑰 \
  -v open-webui:/app/backend/data \
  --name open-webui \
  ghcr.io/open-webui/open-webui:main
```

### 方法二：介面配置

1. 訪問 Open WebUI 管理介面
2. 進入 **Settings** > **Connections**
3. 在 **OpenAI API** 部分配置：
   * **API Base URL**: `https://api.apiyi.com/v1`
   * **API Key**: 輸入您的 API易 金鑰
4. 點選儲存配置

<Info>
  **配置要點**

  * API Base URL 需要包含 `/v1` 字尾
  * API Key 可在 [API易控制台](https://api.apiyi.com) 獲取
  * 建議使用環境變數方式，便於管理和更新
</Info>

## 支援的模型

Open WebUI 通過 API易 支援 400+ 主流 AI 模型。

<Card title="檢視當下熱門模型推薦" icon="star" href="/zh-Hant/api-capabilities/model-info">
  檢視最新的模型推薦、效能對比和場景化使用建議。涵蓋文本創作、程式設計開發、快速響應、影像生成、影片生成等全場景。
</Card>

<Info>
  **為什麼不在此列出具體模型？**

  AI 模型更新迭代速度非常快，為了確保您獲取最準確的模型推薦資訊，我們統一在 [模型推薦頁面](/zh-Hant/api-capabilities/model-info) 維護最新的模型列表、效能資料和使用建議。
</Info>

## 核心功能

### RAG (檢索增強生成)

Open WebUI 支援文件上傳和知識庫功能：

1. **文件上傳**
   * 支援 PDF、TXT、DOCX 等格式
   * 自動向量化儲存
   * 支援多語言文件

2. **知識庫管理**
   * 建立專項知識庫
   * 文件分類和標籤
   * 智慧檢索匹配

### OpenAI 相容 API

Open WebUI 提供完整的 OpenAI 相容 API：

```bash theme={null}
# 聊天完成
curl -X POST "http://localhost:3000/api/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 您的API易金鑰" \
  -d '{
    "model": "gpt-4-turbo",
    "messages": [
      {"role": "user", "content": "Hello, world!"}
    ]
  }'
```

### 工具整合

支援外部工具和外掛：

* 網路搜尋
* 程式碼執行
* 影像生成
* 文件處理

## 高階配置

### 多模型配置

在 `docker-compose.yml` 中配置多個模型源：

```yaml theme={null}
environment:
  - OPENAI_API_BASE_URL=https://api.apiyi.com
  - OPENAI_API_KEY=您的API易金鑰
  - ENABLE_OPENAI_API=true
  - ENABLE_OLLAMA_API=false
```

### 使用者權限管理

```yaml theme={null}
environment:
  - ENABLE_SIGNUP=false
  - DEFAULT_USER_ROLE=user
  - WEBHOOK_URL=您的webhook地址
```

### 資料持久化

```yaml theme={null}
volumes:
  - open-webui:/app/backend/data
  - ./uploads:/app/backend/data/uploads
  - ./vector_db:/app/backend/data/vector_db
```

## API 整合示例

### Python 整合

```python theme={null}
import requests

# Open WebUI API 端點
api_url = "http://localhost:3000/api/chat/completions"

# 請求配置
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer 您的API易金鑰"
}

data = {
    "model": "gpt-4-turbo",
    "messages": [
        {"role": "user", "content": "解釋量子計算的基本原理"}
    ],
    "stream": False
}

# 傳送請求
response = requests.post(api_url, headers=headers, json=data)
result = response.json()
print(result["choices"][0]["message"]["content"])
```

### JavaScript 整合

```javascript theme={null}
const apiUrl = 'http://localhost:3000/api/chat/completions';

const requestData = {
  model: 'gpt-4-turbo',
  messages: [
    { role: 'user', content: '寫一個簡單的 Python 函式' }
  ]
};

fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 您的API易金鑰'
  },
  body: JSON.stringify(requestData)
})
.then(response => response.json())
.then(data => {
  console.log(data.choices[0].message.content);
});
```

## 故障排除

### 常見問題

**連線失敗**

* 檢查 API Base URL 是否正確：`https://api.apiyi.com/v1`
* 驗證 API Key 有效性
* 確認防火牆設定

**模型不可用**

* 檢查賬戶餘額
* 確認模型在服務範圍內
* 檢視 API易 服務狀態

**上傳失敗**

* 檢查檔案格式支援
* 確認儲存空間充足
* 驗證檔案大小限制

### 日誌除錯

啟用除錯模式：

```bash theme={null}
docker logs -f open-webui
```

檢視詳細日誌：

```yaml theme={null}
environment:
  - LOG_LEVEL=DEBUG
  - WEBUI_DEBUG=true
```

## 最佳實踐

### 效能最佳化

1. **模型選擇**
   * 根據任務複雜度選擇合適的模型
   * 檢視 [模型推薦頁面](/zh-Hant/api-capabilities/model-info) 獲取最新的模型選擇建議

2. **快取策略**
   * 啟用對話快取
   * 設定合理的快取過期時間
   * 定期清理無用快取

3. **資源管理**
   * 監控記憶體使用
   * 設定合理的併發限制
   * 定期備份使用者資料

### 安全配置

```yaml theme={null}
environment:
  - ENABLE_ADMIN_EXPORT=false
  - ENABLE_ADMIN_CHAT_ACCESS=false
  - JWT_EXPIRES_IN=7d
```

### 監控告警

整合監控系統：

```yaml theme={null}
environment:
  - ENABLE_WEBHOOKS=true
  - WEBHOOK_URL=https://your-monitoring-url
```

需要更多幫助？請檢視 [Open WebUI 官方文件](https://docs.openwebui.com) 或訪問 [API易官網](https://api.apiyi.com)。
