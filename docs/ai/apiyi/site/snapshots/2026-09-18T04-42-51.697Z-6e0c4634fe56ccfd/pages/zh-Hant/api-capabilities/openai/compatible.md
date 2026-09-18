> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Chat Completions 相容模式呼叫

> /v1/chat/completions 業界標準端點：各語言 OpenAI SDK 一行 base_url 切換到 API易，同一套程式碼呼叫全平臺模型。

`/v1/chat/completions` 是大模型行業的事實標準介面 —— 幾乎所有框架、客戶端、SDK 預設支援它。通過 API易，這一個端點可以統一呼叫 OpenAI、Claude、Gemini、DeepSeek 等全部 400+ 模型，切換模型只需要換一個字串。

<Info>
  **怎麼選端點**：用現成框架/客戶端、或要用同一套程式碼調多家模型 → 用本頁的相容模式；要內建工具（聯網搜尋、程式碼直譯器）或調 Pro 系列模型 → 用 [原生呼叫（/v1/responses）](/zh-Hant/api-capabilities/openai/native)。OpenAI 官方對 Chat Completions 的定位是"長期支援，但新專案推薦 Responses"。多輪對話兩種端點都需自己維護歷史，見 [多輪對話實現指南](/zh-Hant/api-capabilities/multi-turn-conversation)。
</Info>

## 快速開始

<CodeGroup>
  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{
      "model": "gpt-5.4",
      "messages": [
        {"role": "user", "content": "用一句話介紹你自己"}
      ]
    }'
  ```

  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.chat.completions.create(
      model="gpt-5.4",
      messages=[{"role": "user", "content": "用一句話介紹你自己"}]
  )

  print(response.choices[0].message.content)
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const openai = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const response = await openai.chat.completions.create({
    model: 'gpt-5.4',
    messages: [{ role: 'user', content: '用一句話介紹你自己' }]
  });

  console.log(response.choices[0].message.content);
  ```
</CodeGroup>

## 一個介面呼叫全平臺模型

這是相容模式最大的價值：**換模型只換字串，程式碼一行不動**。

```python theme={null}
def ask(message: str, model: str) -> str:
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": message}]
    )
    return response.choices[0].message.content

print(ask("解釋量子糾纏", "gpt-5.4"))               # OpenAI
print(ask("解釋量子糾纏", "claude-sonnet-4-6"))      # Anthropic
print(ask("解釋量子糾纏", "gemini-3-pro-preview"))   # Google
print(ask("解釋量子糾纏", "deepseek-chat"))          # DeepSeek
```

<Tip>
  各家模型的完整名稱和價格見 [模型與價格總覽](/zh-Hant/api-capabilities/model-info)。注意：用相容格式調 Claude 時拿不到 Claude 的 Prompt Cache 優惠，深度使用 Claude 請走 [Claude 原生呼叫](/zh-Hant/api-capabilities/claude)。
</Tip>

## 各語言 SDK 配置

所有官方 SDK 都支援自定義 base\_url，配置一次即可。

### Python

```bash theme={null}
pip install openai
```

```python theme={null}
from openai import OpenAI, AsyncOpenAI

# 同步客戶端
client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

# 非同步客戶端
async_client = AsyncOpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)
```

也可以用環境變數，程式碼裡零配置：

```bash theme={null}
export OPENAI_API_KEY="YOUR_API_KEY"
export OPENAI_BASE_URL="https://api.apiyi.com/v1"
```

```python theme={null}
from openai import OpenAI
client = OpenAI()  # 自動讀取環境變數
```

### Node.js / TypeScript

```bash theme={null}
npm install openai
```

```typescript theme={null}
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.apiyi.com/v1'
});

const response = await openai.chat.completions.create({
  model: 'gpt-5.4-mini',
  messages: [{ role: 'user', content: 'Hello!' }],
  temperature: 0.7
});
```

### .NET

```bash theme={null}
dotnet add package OpenAI
```

```csharp theme={null}
using OpenAI;
using OpenAI.Chat;

var client = new OpenAIClient(
    new System.ClientModel.ApiKeyCredential("YOUR_API_KEY"),
    new OpenAIClientOptions { Endpoint = new Uri("https://api.apiyi.com/v1") }
);

var chatClient = client.GetChatClient("gpt-5.4");
var response = await chatClient.CompleteChatAsync("Hello!");
Console.WriteLine(response.Value.Content[0].Text);
```

### Go

使用 OpenAI 官方 Go SDK（`github.com/openai/openai-go`）：

```bash theme={null}
go get github.com/openai/openai-go
```

```go theme={null}
package main

import (
    "context"
    "fmt"

    "github.com/openai/openai-go"
    "github.com/openai/openai-go/option"
)

func main() {
    client := openai.NewClient(
        option.WithAPIKey("YOUR_API_KEY"),
        option.WithBaseURL("https://api.apiyi.com/v1"),
    )

    completion, err := client.Chat.Completions.New(context.TODO(), openai.ChatCompletionNewParams{
        Model: "gpt-5.4",
        Messages: []openai.ChatCompletionMessageParamUnion{
            openai.UserMessage("Hello!"),
        },
    })
    if err != nil {
        panic(err)
    }
    fmt.Println(completion.Choices[0].Message.Content)
}
```

### Java

使用 OpenAI 官方 Java SDK（`com.openai:openai-java`）：

```xml theme={null}
<dependency>
    <groupId>com.openai</groupId>
    <artifactId>openai-java</artifactId>
    <version>LATEST</version>
</dependency>
```

```java theme={null}
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.chat.completions.ChatCompletion;
import com.openai.models.chat.completions.ChatCompletionCreateParams;

OpenAIClient client = OpenAIOkHttpClient.builder()
    .apiKey("YOUR_API_KEY")
    .baseUrl("https://api.apiyi.com/v1")
    .build();

ChatCompletionCreateParams params = ChatCompletionCreateParams.builder()
    .model("gpt-5.4")
    .addUserMessage("Hello!")
    .build();

ChatCompletion completion = client.chat().completions().create(params);
System.out.println(completion.choices().get(0).message().content().orElse(""));
```

<Note>
  老專案如果還在用第三方庫（Go 的 `sashabaranov/go-openai`、Java 的 `theokanning` 系列），改 base\_url 同樣能跑通，但建議遷移到上面的官方 SDK —— 第三方庫對新模型引數（如 `reasoning_effort`）跟進較慢。
</Note>

## 常用功能

### 流式輸出

```python theme={null}
stream = client.chat.completions.create(
    model="gpt-5.4",
    messages=[{"role": "user", "content": "寫一首關於秋天的短詩"}],
    stream=True
)

for chunk in stream:
    if chunk.choices and chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

### 推理控制

Chat Completions 端點用**頂層** `reasoning_effort` 引數（注意與 Responses 端點的巢狀寫法不同）：

```python theme={null}
response = client.chat.completions.create(
    model="gpt-5.4",
    messages=[{"role": "user", "content": "證明根號2是無理數"}],
    reasoning_effort="high"  # none / low / medium / high / xhigh
)
```

<Warning>
  **GPT-5.4 及之後的模型（含 gpt-5.6 系列）在本端點上 `tools` 與顯式的 `reasoning_effort` 可能互斥**：顯式傳了非 `none` 的 `reasoning_effort` 又攜帶 `tools` 時會報 400 `Function tools with reasoning_effort are not supported for ... in /v1/chat/completions`（`low` / `medium` / `high` / `xhigh` 四檔實測都會觸發，不傳該引數則不觸發）。是否觸發取決於請求落到哪條上游鏈路，同一模型可能時靈時不靈。這是 OpenAI 官方限制——需要推理 + 工具呼叫請改用 [Responses 端點](/zh-Hant/api-capabilities/openai/native)，或顯式設定 `reasoning_effort="none"`；怎麼判斷、怎麼遷見 [端點選型與遷移](/zh-Hant/api-capabilities/openai/responses-migration)。
</Warning>

<Warning>
  gpt-5 系列推理模型在該端點同樣**不支援 `temperature` / `top_p`**，傳了會報錯。
</Warning>

### 影像輸入

```python theme={null}
response = client.chat.completions.create(
    model="gpt-5.4",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "這張圖片裡有什麼？"},
                {"type": "image_url", "image_url": {"url": "https://example.com/image.jpg"}}
            ]
        }
    ]
)
```

### Embeddings

```python theme={null}
response = client.embeddings.create(
    model="text-embedding-3-small",
    input="要嵌入的文本內容"
)
embedding = response.data[0].embedding
```

## 錯誤處理與重試

官方 SDK 內建自動重試（預設 2 次，針對 429 / 5xx / 連線錯誤），優先用它而不是自己寫迴圈：

```python theme={null}
client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1",
    max_retries=3,   # 內建指數退避重試
    timeout=60.0
)
```

需要精細處理時按異常型別捕獲：

```python theme={null}
from openai import (
    APIError,
    APIConnectionError,
    RateLimitError,
    InternalServerError,
)

try:
    response = client.chat.completions.create(
        model="gpt-5.4",
        messages=[{"role": "user", "content": "Hello"}]
    )
except RateLimitError:
    print("請求頻率超限，稍後重試")
except APIConnectionError:
    print("網路連線錯誤，檢查網路或代理")
except InternalServerError:
    print("上游服務錯誤，建議重試")
except APIError as e:
    print(f"API 錯誤：{e}")
```

## 相容模式的能力邊界

| 能力                      | 相容模式 | 說明                                                                                                    |
| ----------------------- | ---- | ----------------------------------------------------------------------------------------------------- |
| 基礎對話 / 流式 / 多模態輸入       | ✅    | 完整支援                                                                                                  |
| 函式呼叫（FC）                | ✅    | 見 [FC函式呼叫](/zh-Hant/api-capabilities/openai/function-calling)                                         |
| Prompt 緩存摺扣             | ✅    | OpenAI 模型自動生效，見 [快取計費](/zh-Hant/api-capabilities/openai/prompt-caching)                               |
| 內建工具（聯網搜尋、程式碼直譯器等）      | ❌    | 僅 [原生呼叫](/zh-Hant/api-capabilities/openai/native)                                                     |
| 多輪對話                    | ✅    | 自己維護 `messages` 歷史（原生 Responses 同樣需自管理，見 [多輪對話指南](/zh-Hant/api-capabilities/multi-turn-conversation)） |
| `verbosity` 輸出控制        | ❌    | 僅原生呼叫                                                                                                 |
| Pro 系列模型（gpt-5.4-pro 等） | ❌    | 實務上僅原生呼叫可用                                                                                            |

## 從 OpenAI 官方遷移

已經在用 OpenAI 官方服務的專案，遷移只需兩步、程式碼零改動：

1. **換 base\_url 和 key**

```python theme={null}
# 原來
client = OpenAI(api_key="sk-...")

# 改為
client = OpenAI(
    api_key="YOUR_APIYI_KEY",
    base_url="https://api.apiyi.com/v1"
)
```

2. **或者只改環境變數**（程式碼完全不動）

```bash theme={null}
export OPENAI_API_KEY="YOUR_APIYI_KEY"
export OPENAI_BASE_URL="https://api.apiyi.com/v1"
```

方法呼叫、引數格式、響應結構全部保持一致。

## 相關連結

* 同組頁面：[原生呼叫](/zh-Hant/api-capabilities/openai/native) · [端點選型與遷移](/zh-Hant/api-capabilities/openai/responses-migration) · [快取計費](/zh-Hant/api-capabilities/openai/prompt-caching) · [FC函式呼叫](/zh-Hant/api-capabilities/openai/function-calling)
* 模型與價格：[模型與價格總覽](/zh-Hant/api-capabilities/model-info)
* 獲取 / 管理令牌：`https://api.apiyi.com/token`
* OpenAI 官方 SDK 列表：`platform.openai.com/docs/libraries`
