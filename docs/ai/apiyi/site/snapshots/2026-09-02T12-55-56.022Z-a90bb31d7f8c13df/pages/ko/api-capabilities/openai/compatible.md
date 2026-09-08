> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Chat Completions 호환 모드

> /v1/chat/completions, 업계 표준 엔드포인트입니다: 한 줄의 base_url만으로 모든 OpenAI SDK를 APIYI로 전환하고, 동일한 코드로 모든 제공업체의 모델을 호출합니다.

`/v1/chat/completions`은 LLM 업계의 사실상 표준 인터페이스입니다. 사실상 모든 프레임워크, 클라이언트, SDK가 별도 설정 없이 이를 지원합니다. APIYI를 통해 이 단일 엔드포인트는 OpenAI, Claude, Gemini, DeepSeek를 비롯한 총 400개 이상의 모델에 도달하며, 모델 전환은 문자열만 바꾸면 됩니다.

<Info>
  **어떤 엔드포인트를 선택할지**: 기존 프레임워크/클라이언트를 사용하거나 여러 벤더에 걸쳐 하나의 코드베이스를 원한다면 → 호환 모드(이 페이지); 내장 도구(웹 검색, 코드 인터프리터)나 Pro 시리즈 모델이 필요하다면 → [네이티브 호출 (/v1/responses)](/ko/api-capabilities/openai/native). OpenAI의 Chat Completions에 대한 공식 입장: 장기적으로 지원되지만, 새 프로젝트에는 Responses가 권장됩니다. 두 엔드포인트 모두 대화 기록을 직접 유지해야 합니다 — [멀티 턴 대화 가이드](/ko/api-capabilities/multi-turn-conversation)를 참조하십시오.
</Info>

## 빠른 시작

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

## 하나의 인터페이스, 모든 공급자

호환 모드의 가장 큰 이점은 이것입니다: **모델을 바꾸는 것은 코드 한 줄이 아니라 문자열 하나를 바꾸는 것**입니다.

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
  전체 모델 이름과 가격: [모델 및 가격](/ko/api-capabilities/model-info). 참고: 호환 형식으로 Claude를 호출하면 Claude의 Prompt Cache 할인이 적용되지 않습니다 — Claude를 많이 사용하는 경우 [Claude 네이티브 호출](/ko/api-capabilities/claude)을 사용하십시오.
</Tip>

## 언어별 SDK 설정

모든 공식 SDK는 사용자 지정 `base_url`을 지원합니다 — 한 번 설정하면 바로 사용할 수 있습니다.

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

아니면 코드 내 설정 없이 사용하려면 환경 변수를 사용하십시오:

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

공식 OpenAI Go SDK(`github.com/openai/openai-go`)를 사용하십시오:

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

공식 OpenAI Java SDK(`com.openai:openai-java`)를 사용하십시오:

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
  서드파티 라이브러리 기반의 레거시 프로젝트(Go의 `sashabaranov/go-openai`, Java의 `theokanning` 패키지)는 `base_url`을 변경한 뒤에도 계속 동작하지만, 위의 공식 SDK로 마이그레이션하는 것을 권장합니다 — 서드파티 라이브러리는 `reasoning_effort`와 같은 새 매개변수에 뒤처지는 경우가 있습니다.
</Note>

## 공통 기능

### 스트리밍

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

### 추론 제어

채팅 완성에서는 **최상위** `reasoning_effort` 매개변수를 사용합니다(Responses의 중첩 형식과 다릅니다).

```python theme={null}
response = client.chat.completions.create(
    model="gpt-5.4",
    messages=[{"role": "user", "content": "Prove that the square root of 2 is irrational"}],
    reasoning_effort="high"  # none / low / medium / high / xhigh
)
```

<Warning>
  **GPT-5.4 이상(예: gpt-5.6 시리즈)에서는 이 엔드포인트에서 `tools`와 명시적인 `reasoning_effort`을 함께 사용할 수 없습니다**: `tools`과 함께 `none`이 아닌 `reasoning_effort`을 명시적으로 전송하면 400 오류가 발생합니다 — `Function tools with reasoning_effort are not supported for ... in /v1/chat/completions`. 테스트에서는 `low`, `medium`, `high`, `xhigh` 네 가지 모두 이 오류를 발생시켰으며, 매개변수를 생략하면 발생하지 않았습니다. 오류 발생 여부는 요청이 도달하는 업스트림 경로에 따라 달라지므로 동일한 모델이 일관되지 않게 동작할 수 있습니다. 이는 공식 OpenAI 제한 사항입니다. 추론과 도구 호출을 함께 사용하려면 [Responses 엔드포인트](/ko/api-capabilities/openai/native)로 전환하거나 `reasoning_effort="none"`을 명시적으로 설정하십시오. 진단 및 마이그레이션 방법은 [엔드포인트 및 마이그레이션](/ko/api-capabilities/openai/responses-migration)을 참조하십시오.
</Warning>

<Warning>
  gpt-5 시리즈 추론 모델은 이 엔드포인트에서 **`temperature` / `top_p`도 지원하지 않습니다** — 이를 전달하면 오류가 발생합니다.
</Warning>

### 이미지 입력

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

### 임베딩

```python theme={null}
response = client.embeddings.create(
    model="text-embedding-3-small",
    input="Text to embed"
)
embedding = response.data[0].embedding
```

## 오류 처리 및 재시도

공식 SDK는 자동으로 재시도합니다(기본값으로 2회 시도, 429 / 5xx / 연결 오류 시) — 직접 작성한 루프보다 이를 사용하는 것이 좋습니다:

```python theme={null}
client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1",
    max_retries=3,   # built-in exponential backoff
    timeout=60.0
)
```

더 세밀하게 제어하려면 예외 유형별로 catch하십시오:

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

## 호환 모드의 기능 경계

| 기능                                     | 호환 모드 | 비고                                                                                                                                  |
| -------------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 채팅 / 스트리밍 / 다중 모달 입력                   | ✅     | 완전히 지원됩니다                                                                                                                           |
| Function calling (FC)                  | ✅     | [Function Calling](/ko/api-capabilities/openai/function-calling) 참조                                                                 |
| Prompt cache 할인                        | ✅     | OpenAI 모델에는 자동 적용됩니다 — [Cache Billing](/ko/api-capabilities/openai/prompt-caching) 참조                                               |
| 내장 도구(web search, code interpreter, …) | ❌     | [Native Calls](/ko/api-capabilities/openai/native)만 해당됩니다                                                                           |
| 멀티턴 대화                                 | ✅     | `messages` 기록을 직접 유지해야 합니다(네이티브 Responses도 직접 관리하는 기록이 필요합니다 — [Multi-Turn Guide](/ko/api-capabilities/multi-turn-conversation) 참조) |
| `verbosity` 출력 제어                      | ❌     | 네이티브 전용                                                                                                                             |
| Pro 시리즈 모델 (gpt-5.4-pro, …)            | ❌     | 실제로는 네이티브 호출만 가능합니다                                                                                                                 |

## OpenAI Direct에서 마이그레이션

OpenAI의 공식 서비스를 이미 사용 중이신가요? 마이그레이션은 코드 변경 없이 두 단계로 완료됩니다.

1. **base\_url과 키를 변경합니다**

```python theme={null}
# Before
client = OpenAI(api_key="sk-...")

# After
client = OpenAI(
    api_key="YOUR_APIYI_KEY",
    base_url="https://api.apiyi.com/v1"
)
```

2. **환경 변수만 변경합니다** (코드는 그대로 유지)

```bash theme={null}
export OPENAI_API_KEY="YOUR_APIYI_KEY"
export OPENAI_BASE_URL="https://api.apiyi.com/v1"
```

메서드 호출, 매개변수 형식, 응답 구조는 모두 동일하게 유지됩니다.

## 관련 링크

* 이 그룹: [네이티브 호출](/ko/api-capabilities/openai/native) · [엔드포인트 및 마이그레이션](/ko/api-capabilities/openai/responses-migration) · [캐시 과금](/ko/api-capabilities/openai/prompt-caching) · [함수 호출](/ko/api-capabilities/openai/function-calling)
* 모델 및 가격 책정: [모델 및 가격 책정](/ko/api-capabilities/model-info)
* token 가져오기 / 관리: `https://api.apiyi.com/token`
* 공식 OpenAI SDK 목록: `platform.openai.com/docs/libraries`
