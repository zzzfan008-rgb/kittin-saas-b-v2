> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Base URL 怎麼填？/v1、根域名、/v1beta 有什麼區別？

> 配置 API易 Base URL 的完整指南：OpenAI 用 /v1，Claude 用根域名，Gemini 用 /v1beta

## 快速答案

<Info>
  **一句話記住**：OpenAI 系列加 `/v1`，Claude 只填根域名，Gemini 加 `/v1beta`。填錯 Base URL 是最常見的接入問題。
</Info>

| 模型系列                            | Base URL                   | 適用 SDK                                        |
| ------------------------------- | -------------------------- | --------------------------------------------- |
| GPT / DeepSeek / Llama / Qwen 等 | `https://api.apiyi.com/v1` | OpenAI SDK                                    |
| Claude 系列                       | `https://api.apiyi.com`    | Anthropic SDK                                 |
| Gemini 系列                       | `https://api.apiyi.com`    | Google GenAI SDK（需設定 `api_version: "v1beta"`） |

## 為什麼不同模型的 Base URL 不一樣？

這是由各廠商 SDK 的內部實現決定的：

* **OpenAI SDK**：在 `base_url` 後拼接資源路徑，所以需要包含 `/v1`
* **Anthropic SDK**：內部自動拼接 `/v1/messages`，如果你填了 `/v1` 會變成 `/v1/v1/messages`，導致 404 錯誤
* **Google GenAI SDK**：使用 `/v1beta` 路徑，SDK 自動處理路徑拼接

## 程式碼示例

### OpenAI 相容模型（GPT / DeepSeek / Llama 等）

```python theme={null}
import openai

client = openai.OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"  # 域名 + /v1
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "你好！"}]
)
print(response.choices[0].message.content)
```

### Claude 模型（Anthropic SDK）

```python theme={null}
import anthropic

client = anthropic.Anthropic(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com"  # 只填根域名，不要加 /v1
)

message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    messages=[{"role": "user", "content": "你好！"}]
)
print(message.content[0].text)
```

### Gemini 模型（Google GenAI SDK）

```python theme={null}
from google import genai

client = genai.Client(
    api_key="YOUR_API_KEY",
    http_options={"api_version": "v1beta", "base_url": "https://api.apiyi.com"}
)

response = client.models.generate_content(
    model="gemini-2.5-pro",
    contents="你好！"
)
print(response.text)
```

<Warning>
  **Claude 使用者常見錯誤**：如果你用 Anthropic 官方 SDK 呼叫 Claude，Base URL 只填 `https://api.apiyi.com`，千萬不要加 `/v1`。但如果你用 OpenAI SDK 的相容模式呼叫 Claude，則需要加 `/v1`。
</Warning>

## 域名節點選擇

API易 提供 4 個域名節點，功能完全一致，區別在於網路線路和部署架構：

<CardGroup cols={2}>
  <Card title="🌏 全球直連（推薦海外客戶）" icon="globe">
    **`vip.apiyi.com`**

    直連大後端，延遲最低。**全球客戶（非中國大陸）首選推薦**。
  </Card>

  <Card title="🇨🇳 國內預設（推薦大陸客戶）" icon="server">
    **`api.apiyi.com`**

    國內最佳化線路，**中國大陸客戶預設推薦**。
  </Card>

  <Card title="🏢 國內備用 / 企業專用" icon="building">
    **`b.apiyi.com`**

    Backup 備用節點，同時也是 Business 企業專用線路。主力節點異常時可切換。
  </Card>

  <Card title="⚡ Cloudflare CDN 全球加速" icon="bolt">
    **`api-cf.apiyi.com`**

    Cloudflare 全球 CDN 加速，適合**純文本類呼叫**。有 100 秒超時限制。
  </Card>
</CardGroup>

| 節點             | 域名                 | 推薦客戶      | 說明                |
| -------------- | ------------------ | --------- | ----------------- |
| 全球直連           | `vip.apiyi.com`    | 非中國大陸客戶   | 直連後端，延遲最低         |
| 國內預設           | `api.apiyi.com`    | 中國大陸客戶    | 國內最佳化線路（預設）       |
| 國內備用/企業        | `b.apiyi.com`      | 企業客戶 / 備用 | Backup + Business |
| Cloudflare CDN | `api-cf.apiyi.com` | 僅文本類呼叫    | 全球加速，100 秒超時限制    |

<Warning>
  **Cloudflare CDN 節點限制**：`api-cf.apiyi.com` 基於 Cloudflare Workers 部署，最大請求超時為 **100 秒**。因此：

  * ✅ **適合**：普通文本對話、短文本生成等快速響應的呼叫
  * ❌ **不適合**：超過 100 秒的複雜長文本任務
  * ❌ **不適合**：Nano Banana Pro 等圖片生成任務
  * ❌ **不適合**：影片生成 API 呼叫

  如果你的任務可能超過 100 秒，請使用 `vip.apiyi.com`（海外）或 `api.apiyi.com`（國內）。
</Warning>

<Tip>
  建議在程式碼中配置備用節點，實現自動切換，提高服務可用性。
</Tip>

## 常見報錯排查

| 報錯                  | 可能原因                                          | 解決方法                                                         |
| ------------------- | --------------------------------------------- | ------------------------------------------------------------ |
| **404 Not Found**   | OpenAI SDK 漏加 `/v1`，或 Anthropic SDK 多加了 `/v1` | 檢查路徑是否匹配 SDK 規範                                              |
| **400 Bad Request** | Gemini SDK 路徑版本不匹配                            | 確認使用 `/v1beta`                                               |
| **連線超時**            | 域名節點選擇不當                                      | 國內用 `api.apiyi.com`，海外用 `vip.apiyi.com`；CF-CDN 節點有 100 秒超時限制 |
| **SSL 錯誤**          | 缺少 `https://` 字首                              | 所有節點必須使用 HTTPS                                               |
| **雙斜槓錯誤**           | base\_url 末尾多了 `/`                            | 去掉末尾斜槓                                                       |

## 完整配置速查

### OpenAI 相容模型

| 節點                  | Base URL                      |
| ------------------- | ----------------------------- |
| 全球直連（海外推薦）          | `https://vip.apiyi.com/v1`    |
| 國內預設（大陸推薦）          | `https://api.apiyi.com/v1`    |
| 國內備用/企業             | `https://b.apiyi.com/v1`      |
| Cloudflare CDN（僅文本） | `https://api-cf.apiyi.com/v1` |

### Claude 模型（Anthropic SDK）

| 節點                  | Base URL                   |
| ------------------- | -------------------------- |
| 全球直連（海外推薦）          | `https://vip.apiyi.com`    |
| 國內預設（大陸推薦）          | `https://api.apiyi.com`    |
| 國內備用/企業             | `https://b.apiyi.com`      |
| Cloudflare CDN（僅文本） | `https://api-cf.apiyi.com` |

### Gemini 模型

| 節點                  | Base URL                   |
| ------------------- | -------------------------- |
| 全球直連（海外推薦）          | `https://vip.apiyi.com`    |
| 國內預設（大陸推薦）          | `https://api.apiyi.com`    |
| 國內備用/企業             | `https://b.apiyi.com`      |
| Cloudflare CDN（僅文本） | `https://api-cf.apiyi.com` |

<Info>
  Gemini 使用 Google GenAI SDK 時，`base_url` 填根域名，同時設定 `api_version: "v1beta"`，SDK 會自動拼接完整路徑。
</Info>
