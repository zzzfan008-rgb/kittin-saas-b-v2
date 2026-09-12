> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Chat Completions 互換モード

> /v1/chat/completions は業界標準のエンドポイントです。base_url を 1 行変更するだけで任意の OpenAI SDK を APIYI に切り替え、同じコードであらゆるプロバイダーのモデルを呼び出せます。

`/v1/chat/completions` は LLM 業界の事実上の標準インターフェースであり、ほぼすべてのフレームワーク、クライアント、SDK が標準でサポートしています。APIYI を通じて、この単一のエンドポイントから OpenAI、Claude、Gemini、DeepSeek を含む合計 400+ モデルに到達できます。モデルの切り替えは、文字列を差し替えるだけです。

<Info>
  **どのエンドポイントを選ぶか**: 既存のフレームワーク/クライアントを使う、または複数ベンダーで 1 つのコードベースを使いたい → 互換モード（このページ）；組み込みツール（Web 検索、コードインタープリタ）や Pro-series モデルが必要 → [Native Calls (/v1/responses)](/ja/api-capabilities/openai/native)。OpenAI の Chat Completions に関する公式見解: 長期的にサポートされますが、新規プロジェクトでは Responses が推奨されます。どちらのエンドポイントでも、会話履歴は自分で管理する必要があります — [Multi-Turn Conversation Guide](/ja/api-capabilities/multi-turn-conversation) を参照してください。
</Info>

## クイックスタート

<CodeGroup>
  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{
      "model": "gpt-5.4",
      "messages": [
        {"role": "user", "content": "Introduce yourself in one sentence"}
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
      messages=[{"role": "user", "content": "Introduce yourself in one sentence"}]
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
    messages: [{ role: 'user', content: 'Introduce yourself in one sentence' }]
  });

  console.log(response.choices[0].message.content);
  ```
</CodeGroup>

## 1つのインターフェース、すべてのプロバイダー

これが互換モードの最大の利点です: **モデルを切り替えるということは、コードを1行変えるのではなく、文字列を変えるだけです**。

```python theme={null}
def ask(message: str, model: str) -> str:
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": message}]
    )
    return response.choices[0].message.content

print(ask("Explain quantum entanglement", "gpt-5.4"))               # OpenAI
print(ask("Explain quantum entanglement", "claude-sonnet-4-6"))      # Anthropic
print(ask("Explain quantum entanglement", "gemini-3-pro-preview"))   # Google
print(ask("Explain quantum entanglement", "deepseek-chat"))          # DeepSeek
```

<Tip>
  モデル名と価格の一覧: [モデルと価格](/ja/api-capabilities/model-info)。注: 互換フォーマット経由で Claude を呼び出すと、Claude の Prompt Cache 割引は適用されません — Claude を多用する場合は、[Claude ネイティブ呼び出し](/ja/api-capabilities/claude)を使用してください。
</Tip>

## SDK の言語別セットアップ

すべての公式 SDK はカスタム base\_url をサポートしています。一度設定すれば、そのまま使えます。

### Python

```bash theme={null}
pip install openai
```

```python theme={null}
from openai import OpenAI, AsyncOpenAI

# Synchronous client
client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

# Async client
async_client = AsyncOpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)
```

コード内の設定をゼロにしたい場合は、環境変数を使うこともできます。

```bash theme={null}
export OPENAI_API_KEY="YOUR_API_KEY"
export OPENAI_BASE_URL="https://api.apiyi.com/v1"
```

```python theme={null}
from openai import OpenAI
client = OpenAI()  # reads the environment automatically
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

公式 OpenAI Go SDK（`github.com/openai/openai-go`）を使用してください。

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

公式 OpenAI Java SDK（`com.openai:openai-java`）を使用してください。

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
  サードパーティ製ライブラリを使っているレガシーなプロジェクト（Go の`sashabaranov/go-openai`、Java の`theokanning` パッケージ）は、base\_url を変更したあとも引き続き動作しますが、上記の公式 SDK への移行をおすすめします。サードパーティ製ライブラリは、`reasoning_effort` などの新しいパラメータへの対応が遅れがちです。
</Note>

## 共通機能

### ストリーミング

```python theme={null}
stream = client.chat.completions.create(
    model="gpt-5.4",
    messages=[{"role": "user", "content": "Write a short poem about autumn"}],
    stream=True
)

for chunk in stream:
    if chunk.choices and chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

### 推論制御

チャット補完では、**トップレベルの** `reasoning_effort` パラメーターを使用します（Responses のネストされた形式とは異なります）:

```python theme={null}
response = client.chat.completions.create(
    model="gpt-5.4",
    messages=[{"role": "user", "content": "Prove that the square root of 2 is irrational"}],
    reasoning_effort="high"  # none / low / medium / high / xhigh
)
```

<Warning>
  **GPT-5.4 以降（gpt-5.6 シリーズを含む）では、このエンドポイント上で `tools` と明示的な `reasoning_effort` は相互排他的になる場合があります**: `tools` と併せて非 `none` の `reasoning_effort` を明示的に送信すると、400 エラー（`Function tools with reasoning_effort are not supported for ... in /v1/chat/completions`）になります。テストでは、`low`、`medium`、`high`、`xhigh` の4つすべてでこのエラーが発生しましたが、パラメーターを省略した場合は発生しませんでした。発生するかどうかは、リクエストがどの上流ルートに到達するかによって決まるため、同じモデルでも動作が一貫しない場合があります。これは OpenAI の公式制限です。推論とツール呼び出しを併用する場合は、[Responses エンドポイント](/ja/api-capabilities/openai/native)に切り替えるか、`reasoning_effort="none"` を明示的に設定してください。診断と移行の方法については、[エンドポイントと移行](/ja/api-capabilities/openai/responses-migration)を参照してください。
</Warning>

<Warning>
  gpt-5 シリーズの推論モデルは、このエンドポイントで `temperature` / `top_p` もサポートしていません。これらを渡すとエラーが発生します。
</Warning>

### 画像入力

```python theme={null}
response = client.chat.completions.create(
    model="gpt-5.4",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What's in this image?"},
                {"type": "image_url", "image_url": {"url": "https://example.com/image.jpg"}}
            ]
        }
    ]
)
```

### 埋め込み

```python theme={null}
response = client.embeddings.create(
    model="text-embedding-3-small",
    input="Text to embed"
)
embedding = response.data[0].embedding
```

## エラー処理と再試行

公式 SDK は自動で再試行します（既定で 2 回試行、429 / 5xx / 接続エラー時）— 手作りのループよりこちらを優先してください:

```python theme={null}
client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1",
    max_retries=3,   # built-in exponential backoff
    timeout=60.0
)
```

より細かく制御する場合は、例外の種類ごとにキャッチします:

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
    print("Rate limited — retry later")
except APIConnectionError:
    print("Connection error — check network/proxy")
except InternalServerError:
    print("Upstream error — worth retrying")
except APIError as e:
    print(f"API error: {e}")
```

## Compatibleモードの機能制限

| 機能                              | 互換モード | 注記                                                                                                                             |
| ------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------ |
| チャット / streaming / マルチモーダル入力    | ✅     | 完全対応                                                                                                                           |
| 関数呼び出し (FC)                     | ✅     | [Function Calling](/ja/api-capabilities/openai/function-calling)を参照してください                                                      |
| プロンプトキャッシュ割引                    | ✅     | OpenAIモデルでは自動適用です — [Cache Billing](/ja/api-capabilities/openai/prompt-caching)を参照してください                                       |
| 組み込み tools（ウェブ検索、コードインタープリター、…） | ❌     | [ネイティブ呼び出し](/ja/api-capabilities/openai/native)のみ                                                                              |
| マルチターン会話                        | ✅     | `messages`履歴を自分で保持してください（native Responses でも自己管理の履歴が必要です — [マルチターンガイド](/ja/api-capabilities/multi-turn-conversation)を参照してください） |
| `verbosity`出力制御                 | ❌     | ネイティブのみ                                                                                                                        |
| Proシリーズのモデル (gpt-5.4-pro, …)    | ❌     | 実際には、ネイティブ呼び出しのみです                                                                                                             |

## OpenAI Direct からの移行

OpenAI の公式サービスをご利用中ですか？ 移行は 2 ステップで、コード変更は不要です。

1. **base\_url と key を変更する**

```python theme={null}
# Before
client = OpenAI(api_key="sk-...")

# After
client = OpenAI(
    api_key="YOUR_APIYI_KEY",
    base_url="https://api.apiyi.com/v1"
)
```

2. **または環境変数のみを変更する**（コードはそのまま）

```bash theme={null}
export OPENAI_API_KEY="YOUR_APIYI_KEY"
export OPENAI_BASE_URL="https://api.apiyi.com/v1"
```

メソッド呼び出し、パラメータ形式、レスポンス構造はすべて同一のままです。

## 関連リンク

* このグループ: [ネイティブ呼び出し](/ja/api-capabilities/openai/native) · [エンドポイントと移行](/ja/api-capabilities/openai/responses-migration) · [キャッシュ課金](/ja/api-capabilities/openai/prompt-caching) · [関数呼び出し](/ja/api-capabilities/openai/function-calling)
* モデルと料金: [モデルと料金](/ja/api-capabilities/model-info)
* token の取得 / 管理: `https://api.apiyi.com/token`
* 公式 OpenAI SDK 一覧: `platform.openai.com/docs/libraries`
