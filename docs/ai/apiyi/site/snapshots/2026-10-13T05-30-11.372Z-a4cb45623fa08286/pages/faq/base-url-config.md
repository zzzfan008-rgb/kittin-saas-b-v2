> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Base URL 怎么填？/v1、根域名、/v1beta 有什么区别？

> 配置 API易 Base URL 的完整指南：OpenAI 用 /v1，Claude 用根域名，Gemini 用 /v1beta

## 快速答案

<Info>
  **一句话记住**：OpenAI 系列加 `/v1`，Claude 只填根域名，Gemini 加 `/v1beta`。填错 Base URL 是最常见的接入问题。
</Info>

| 模型系列 | Base URL | 适用 SDK |
| - | - | - |
| GPT / DeepSeek / Llama / Qwen 等 | `https://api.apiyi.com/v1` | OpenAI SDK |
| Claude 系列 | `https://api.apiyi.com` | Anthropic SDK |
| Gemini 系列 | `https://api.apiyi.com` | Google GenAI SDK（需设置 `api_version: "v1beta"`） |

## 为什么不同模型的 Base URL 不一样？

这是由各厂商 SDK 的内部实现决定的：

* **OpenAI SDK**：在 `base_url` 后拼接资源路径，所以需要包含 `/v1`
* **Anthropic SDK**：内部自动拼接 `/v1/messages`，如果你填了 `/v1` 会变成 `/v1/v1/messages`，导致 404 错误
* **Google GenAI SDK**：使用 `/v1beta` 路径，SDK 自动处理路径拼接

## 代码示例

### OpenAI 兼容模型（GPT / DeepSeek / Llama 等）

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
  **Claude 用户常见错误**：如果你用 Anthropic 官方 SDK 调用 Claude，Base URL 只填 `https://api.apiyi.com`，千万不要加 `/v1`。但如果你用 OpenAI SDK 的兼容模式调用 Claude，则需要加 `/v1`。
</Warning>

## 域名节点选择

API易 提供 3 个域名节点，功能完全一致，区别在于网络线路和部署架构：

<CardGroup cols={3}>
  <Card title="🌏 默认节点（推荐）" icon="server">
    **`api.apiyi.com`**

    默认主力线路，**国内外客户均推荐使用**。
  </Card>

  <Card title="🏢 国内备用 / 企业专用" icon="building">
    **`b.apiyi.com`**

    Backup 备用节点，同时也是 Business 企业专用线路。主力节点异常时可切换。
  </Card>

  <Card title="⚡ Cloudflare CDN 全球加速" icon="bolt">
    **`api-cf.apiyi.com`**

    Cloudflare 全球 CDN 加速，适合**纯文本类调用**。有 100 秒超时限制。
  </Card>
</CardGroup>

| 节点 | 域名 | 推荐客户 | 说明 |
| - | - | - | - |
| 默认节点 | `api.apiyi.com` | 所有客户（推荐） | 默认主力线路 |
| 国内备用/企业 | `b.apiyi.com` | 企业客户 / 备用 | Backup + Business |
| Cloudflare CDN | `api-cf.apiyi.com` | 仅文本类调用 | 全球加速，100 秒超时限制 |

<Warning>
  **Cloudflare CDN 节点限制**：`api-cf.apiyi.com` 基于 Cloudflare Workers 部署，最大请求超时为 **100 秒**。因此：

  * ✅ **适合**：普通文本对话、短文本生成等快速响应的调用
  * ❌ **不适合**：超过 100 秒的复杂长文本任务
  * ❌ **不适合**：Nano Banana Pro 等图片生成任务
  * ❌ **不适合**：视频生成 API 调用

  如果你的任务可能超过 100 秒，请使用 `api.apiyi.com`（或备用节点 `b.apiyi.com`）。
</Warning>

<Tip>
  建议在代码中配置备用节点，实现自动切换，提高服务可用性。
</Tip>

## 常见报错排查

| 报错 | 可能原因 | 解决方法 |
| - | - | - |
| **404 Not Found** | OpenAI SDK 漏加 `/v1`，或 Anthropic SDK 多加了 `/v1` | 检查路径是否匹配 SDK 规范 |
| **400 Bad Request** | Gemini SDK 路径版本不匹配 | 确认使用 `/v1beta` |
| **连接超时** | 域名节点选择不当 | 长请求用 `api.apiyi.com` 或 `b.apiyi.com`；CF-CDN 节点有 100 秒超时限制 |
| **SSL 错误** | 缺少 `https://` 前缀 | 所有节点必须使用 HTTPS |
| **双斜杠错误** | base\_url 末尾多了 `/` | 去掉末尾斜杠 |

## 完整配置速查

### OpenAI 兼容模型

| 节点 | Base URL |
| - | - |
| 默认（推荐） | `https://api.apiyi.com/v1` |
| 国内备用/企业 | `https://b.apiyi.com/v1` |
| Cloudflare CDN（仅文本） | `https://api-cf.apiyi.com/v1` |

### Claude 模型（Anthropic SDK）

| 节点 | Base URL |
| - | - |
| 默认（推荐） | `https://api.apiyi.com` |
| 国内备用/企业 | `https://b.apiyi.com` |
| Cloudflare CDN（仅文本） | `https://api-cf.apiyi.com` |

### Gemini 模型

| 节点 | Base URL |
| - | - |
| 默认（推荐） | `https://api.apiyi.com` |
| 国内备用/企业 | `https://b.apiyi.com` |
| Cloudflare CDN（仅文本） | `https://api-cf.apiyi.com` |

<Info>
  Gemini 使用 Google GenAI SDK 时，`base_url` 填根域名，同时设置 `api_version: "v1beta"`，SDK 会自动拼接完整路径。
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.