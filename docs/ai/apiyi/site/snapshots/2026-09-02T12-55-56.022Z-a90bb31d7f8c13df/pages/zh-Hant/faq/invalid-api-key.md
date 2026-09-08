> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 為什麼提示 API Key 無效？

> 解決 API Key 無效錯誤，瞭解 Base URL 和 API Key 的正確配置方法

## 常見錯誤現象

當您看到類似以下錯誤資訊時：

```json theme={null}
{
  "error": {
    "message": "Incorrect API key provided: sk-QqHvK***...",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```

這通常**不是**您的 API Key 本身有問題，而是**請求地址（Base URL）配置錯誤**導致的。

<Warning>
  **最常見的錯誤**：使用了 API易 的 Key，但請求地址仍然指向 OpenAI 官網 `https://api.openai.com`
</Warning>

## 什麼是 Base URL？

**Base URL**（基礎 URL / 請求地址）是 API 請求的目標伺服器地址。不同的 API 服務提供商使用不同的 Base URL。

### Base URL 和 API Key 必須一一對應

| 服務提供商         | Base URL                 | API Key 格式      | 是否匹配     |
| ------------- | ------------------------ | --------------- | -------- |
| **API易**      | `https://api.apiyi.com`  | `sk-xxxx......` | ✅ 正確     |
| **OpenAI 官方** | `https://api.openai.com` | `sk-xxxx......` | ✅ 正確     |
| ❌ API易 Key    | `https://api.openai.com` | `sk-xxxx......` | ❌ **錯誤** |
| ❌ OpenAI Key  | `https://api.apiyi.com`  | `sk-xxxx......` | ❌ **錯誤** |

<Info>
  **關鍵原則**：使用哪家的 API Key，就必須將請求傳送到對應服務商的 Base URL。
</Info>

## 正確的配置方法

### 方法一：修改 Base URL（推薦）

只需將請求地址從 OpenAI 官網替換為 API易，其他程式碼完全不變：

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="sk-your-apiyi-key",  # API易後臺獲取的Key
      base_url="https://api.apiyi.com/v1"  # 改為API易地址
  )

  response = client.chat.completions.create(
      model="gpt-4o",
      messages=[{"role": "user", "content": "你好"}]
  )
  ```

  ```javascript JavaScript/Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'sk-your-apiyi-key',  // API易後臺獲取的Key
    baseURL: 'https://api.apiyi.com/v1'  // 改為API易地址
  });

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: '你好' }]
  });
  ```

  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer sk-your-apiyi-key" \
    -d '{
      "model": "gpt-4o",
      "messages": [{"role": "user", "content": "你好"}]
    }'
  ```
</CodeGroup>

### 方法二：使用環境變數

設定環境變數後，程式碼中無需顯式指定 Base URL：

<CodeGroup>
  ```bash Linux/macOS theme={null}
  export OPENAI_API_KEY="sk-your-apiyi-key"
  export OPENAI_BASE_URL="https://api.apiyi.com/v1"
  ```

  ```powershell Windows PowerShell theme={null}
  $env:OPENAI_API_KEY="sk-your-apiyi-key"
  $env:OPENAI_BASE_URL="https://api.apiyi.com/v1"
  ```

  ```cmd Windows CMD theme={null}
  set OPENAI_API_KEY=sk-your-apiyi-key
  set OPENAI_BASE_URL=https://api.apiyi.com/v1
  ```
</CodeGroup>

## API易支援的請求地址格式

根據您的程式碼情況，API易支援以下三種 Base URL 格式：

<Tabs>
  <Tab title="格式 1：帶 /v1（推薦）">
    ```
    https://api.apiyi.com/v1
    ```

    **適用場景**：大多數程式碼庫預設會在 Base URL 後自動新增具體路徑

    **完整請求示例**：

    ```
    https://api.apiyi.com/v1/chat/completions
    https://api.apiyi.com/v1/api-capabilities/model-info
    ```
  </Tab>

  <Tab title="格式 2：帶 /v1/（末尾有斜槓）">
    ```
    https://api.apiyi.com/v1/
    ```

    **適用場景**：某些框架要求 Base URL 以斜槓結尾

    **完整請求示例**：

    ```
    https://api.apiyi.com/v1/chat/completions
    https://api.apiyi.com/v1/api-capabilities/model-info
    ```
  </Tab>

  <Tab title="格式 3：完整路徑">
    ```
    https://api.apiyi.com/v1/chat/completions
    ```

    **適用場景**：直接使用完整的 API 端點地址（如 cURL 請求）

    <Note>
      這種方式通常用於 cURL 或 HTTP 庫的原始請求，不需要設定 Base URL
    </Note>
  </Tab>
</Tabs>

## 常見問題排查

<AccordionGroup>
  <Accordion title="我確認修改了 Base URL，但仍然報錯">
    **可能原因**：

    1. **程式碼中有多處配置**：檢查是否在配置檔案、環境變數、程式碼初始化等多處都設定了 Base URL
    2. **使用了代理或中介軟體**：某些代理工具可能會重定向請求
    3. **快取問題**：重啟程式或清除快取後重試
    4. **拼寫錯誤**：確認 `apiyi` 拼寫正確（不是 `apiyii` 或 `apiyl`）
  </Accordion>

  <Accordion title="如何確認 Key 是否有效？">
    在 API易 後臺檢視：

    1. 登入 API易 後臺 `console.apiyi.com`
    2. 進入「令牌」頁面
    3. 檢查 Key 狀態是否為「啟用」
    4. 確認賬戶餘額充足
  </Accordion>

  <Accordion title="使用第三方工具（如 ChatBox、OpenCat）如何配置？">
    大多數第三方工具都有「自定義 API」或「自建伺服器」選項：

    * **API 地址 / Base URL**：`https://api.apiyi.com/v1`
    * **API Key**：從 API易 後臺複製您的 Key
    * **模型名稱**：參考 API易 文件中的模型列表

    <Tip>
      具體配置位置可能在「設定」→「API」或「伺服器」等選項中
    </Tip>
  </Accordion>

  <Accordion title="程式碼示例在哪裡可以找到？">
    API易 提供了多種語言的完整程式碼示例：

    1. **快速開始文件**：文件首頁 → 程式碼示例
    2. **線上測試工具**：後臺 → ApiFox 線上測試
    3. **GitHub 倉庫**：`github.com/apiyi/docs` → knowledge-base 目錄
  </Accordion>
</AccordionGroup>

## 錯誤示例 vs 正確示例

<CardGroup cols={2}>
  <Card title="❌ 錯誤配置" icon="x" color="#ef4444">
    ```python theme={null}
    client = OpenAI(
        api_key="sk-apiyi-key",
        base_url="https://api.openai.com/v1"
        # ❌ 使用了OpenAI官網地址
    )
    ```

    **結果**：OpenAI 伺服器會拒絕 API易 的 Key
  </Card>

  <Card title="✅ 正確配置" icon="check" color="#10b981">
    ```python theme={null}
    client = OpenAI(
        api_key="sk-apiyi-key",
        base_url="https://api.apiyi.com/v1"
        # ✅ 使用API易地址
    )
    ```

    **結果**：請求成功傳送到 API易 伺服器
  </Card>
</CardGroup>

## 快速測試方法

使用 cURL 命令快速驗證配置是否正確：

```bash theme={null}
curl https://api.apiyi.com/v1/api-capabilities/model-info \
  -H "Authorization: Bearer sk-your-apiyi-key"
```

**預期結果**：返回可用模型列表

```json theme={null}
{
  "data": [
    {
      "id": "gpt-4o",
      "object": "model",
      ...
    }
  ]
}
```

如果返回錯誤，請檢查：

1. API Key 是否正確複製（注意首尾空格）
2. 網路連線是否正常
3. 賬戶餘額是否充足

## 相關文件

* [快速開始指南](/zh-Hant/getting-started)
* [API 使用手冊](/zh-Hant/api-manual)
* [為什麼還有餘額跑不通？](/zh-Hant/faq/balance-insufficient)
* [支援的模型列表](/zh-Hant/api-capabilities/model-info)

<Tip>
  **記住核心原則**：哪家的 Key 配哪家的 URL，API易 的 Key 就用 `https://api.apiyi.com/v1`
</Tip>
