> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Режим совместимости OpenAI Chat Completions

> /v1/chat/completions, стандартный для отрасли эндпоинт: переключите любой OpenAI SDK на APIYI с одной строкой base_url и вызывайте модели от любого провайдера тем же кодом.

`/v1/chat/completions` — это де-факто стандартный интерфейс индустрии LLM: практически каждый framework, client и SDK поддерживает его из коробки. Через APIYI этот единый эндпоинт обеспечивает доступ к OpenAI, Claude, Gemini, DeepSeek и в общей сложности к 400+ моделям; смена модели — это просто замена строки.

<Info>
  **Какой эндпоинт выбрать**: если вы используете существующие framework/client или хотите одну кодовую базу для нескольких поставщиков → совместимый режим (эта страница); если нужны встроенные инструменты (веб-поиск, интерпретатор кода) или модели серии Pro → [Нативные вызовы (/v1/responses)](/ru/api-capabilities/openai/native). Официальная позиция OpenAI по Chat Completions: поддержка сохранится в долгосрочной перспективе, но для новых проектов рекомендуется Responses. Оба эндпоинта требуют, чтобы вы самостоятельно вели историю диалога — см. [Руководство по многоходовому диалогу](/ru/api-capabilities/multi-turn-conversation).
</Info>

## Быстрый старт

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

## Один интерфейс, все поставщики

Это главное преимущество совместимого режима: **переключение моделей сводится к изменению одной строки — а не строки кода**.

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
  Полные названия моделей и цены: [Модели и цены](/ru/api-capabilities/model-info). Примечание: при вызове Claude через совместимый формат вы теряете скидку Prompt Cache — при интенсивном использовании Claude используйте [Нативные вызовы Claude](/ru/api-capabilities/claude).
</Tip>

## Настройка SDK по языкам

Каждый официальный SDK поддерживает пользовательский base\_url — настройте один раз и используйте дальше.

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

Или используйте переменные среды, чтобы вообще не настраивать это в коде:

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

Используйте официальный OpenAI Go SDK (`github.com/openai/openai-go`):

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

Используйте официальный OpenAI Java SDK (`com.openai:openai-java`):

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
  Устаревшие проекты на сторонних библиотеках (пакеты Go's `sashabaranov/go-openai`, Java's `theokanning`) по-прежнему работают после изменения base\_url, но мы рекомендуем переходить на официальные SDK выше — сторонние библиотеки отстают по новым параметрам, таким как `reasoning_effort`.
</Note>

## Общие функции

### Потоковая передача

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

### Управление рассуждением

В Chat Completions используйте **верхнеуровневый** параметр `reasoning_effort` (в отличие от вложенной формы в Responses):

```python theme={null}
response = client.chat.completions.create(
    model="gpt-5.4",
    messages=[{"role": "user", "content": "Prove that the square root of 2 is irrational"}],
    reasoning_effort="high"  # none / low / medium / high / xhigh
)
```

<Warning>
  **В GPT-5.4 и более поздних версиях (включая серию gpt-5.6) `tools` и явно заданный `reasoning_effort` могут быть взаимоисключающими на этом эндпоинте**: явная передача значения `none`, отличного от `reasoning_effort`, вместе с `tools` приводит к ошибке 400 — `Function tools with reasoning_effort are not supported for ... in /v1/chat/completions`. В наших тестах это срабатывает для всех четырёх значений: `low`, `medium`, `high` и `xhigh`; если не передавать параметр, ошибка не возникает. Её появление зависит от того, на какой вышестоящий маршрут попадает запрос, поэтому одна и та же модель может вести себя непоследовательно. Это официальное ограничение OpenAI — для рассуждений вместе с вызовом инструментов переключитесь на [эндпоинт Responses](/ru/api-capabilities/openai/native) или явно задайте `reasoning_effort="none"`. Инструкции по диагностике и миграции: [Эндпоинт и миграция](/ru/api-capabilities/openai/responses-migration).
</Warning>

<Warning>
  Модели рассуждения серии gpt-5 также **не поддерживают `temperature` / `top_p`** на этом эндпоинте — их передача вызывает ошибку.
</Warning>

### Ввод изображений

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

### Эмбеддинги

```python theme={null}
response = client.embeddings.create(
    model="text-embedding-3-small",
    input="Text to embed"
)
embedding = response.data[0].embedding
```

## Обработка ошибок и повторные попытки

Официальные SDK автоматически повторяют попытки (по умолчанию 2 попытки при 429 / 5xx / ошибках соединения) — предпочитайте это вместо самописных циклов:

```python theme={null}
client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1",
    max_retries=3,   # built-in exponential backoff
    timeout=60.0
)
```

Для более точного контроля обрабатывайте по типу исключения:

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

## Ограничения совместимого режима

| Возможность                                              | Совместимый режим | Примечания                                                                                                                                                                                              |
| -------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Чат / streaming / multimodal input                       | ✅                 | Полностью поддерживается                                                                                                                                                                                |
| Function Calling (FC)                                    | ✅                 | См. [Вызов функций](/ru/api-capabilities/openai/function-calling)                                                                                                                                       |
| Скидка за кэширование prompt                             | ✅                 | Автоматически для моделей OpenAI — см. [Тарификация кэша](/ru/api-capabilities/openai/prompt-caching)                                                                                                   |
| Встроенные инструменты (web search, code interpreter, …) | ❌                 | Только [Нативные вызовы](/ru/api-capabilities/openai/native)                                                                                                                                            |
| Многоходовой диалог                                      | ✅                 | Ведите историю `messages` самостоятельно (нативный Responses также требует самостоятельного ведения истории — см. [Руководство по многоходовому диалогу](/ru/api-capabilities/multi-turn-conversation)) |
| `verbosity` управление выводом                           | ❌                 | Только в нативном режиме                                                                                                                                                                                |
| Модели серии Pro (gpt-5.4-pro, …)                        | ❌                 | На практике — только нативные вызовы                                                                                                                                                                    |

## Миграция с OpenAI Direct

Уже используете официальный сервис OpenAI? Миграция выполняется в два шага без изменений кода:

1. **Измените base\_url и ключ**

```python theme={null}
# Before
client = OpenAI(api_key="sk-...")

# After
client = OpenAI(
    api_key="YOUR_APIYI_KEY",
    base_url="https://api.apiyi.com/v1"
)
```

2. **Или измените только переменные среды** (код остается без изменений)

```bash theme={null}
export OPENAI_API_KEY="YOUR_APIYI_KEY"
export OPENAI_BASE_URL="https://api.apiyi.com/v1"
```

Вызовы методов, форматы параметров и структуры ответов остаются полностью идентичными.

## Связанные ссылки

* Эта группа: [Нативные вызовы](/ru/api-capabilities/openai/native) · [Эндпоинт и миграция](/ru/api-capabilities/openai/responses-migration) · [Тарификация кэша](/ru/api-capabilities/openai/prompt-caching) · [Вызов функций](/ru/api-capabilities/openai/function-calling)
* Модели и цены: [Модели и цены](/ru/api-capabilities/model-info)
* Получение / управление tokens: `https://api.apiyi.com/token`
* Список официальных SDK OpenAI: `platform.openai.com/docs/libraries`
