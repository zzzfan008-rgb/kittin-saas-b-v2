> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Руководство по Grok Chat и рассуждению

> Проверенные возможности Chat Completions для серии Grok на APIYI: потоковая передача, chain-of-thought reasoning_content и его тарификация, структурированные ответы через json_schema, вызов функций, ввод изображений и автоматическое кэширование промптов.

На этой странице описывается все, что может делать серия Grok на эндпоинте `/v1/chat/completions`. Все выводы основаны на практическом тестировании шлюза APIYI 13 июля 2026 года (UTC+8).

## Базовый чат и потоковая передача

Все шесть моделей поддерживают стандартный формат OpenAI и потоковую передачу. `stream_options: {"include_usage": true}` проверен и работает (в финальном чанке передается полная информация об использовании):

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-api-key",
    base_url="https://api.apiyi.com/v1"
)

stream = client.chat.completions.create(
    model="grok-4.3",
    messages=[{"role": "user", "content": "Count from 1 to 5, one number per line"}],
    stream=True,
    stream_options={"include_usage": True},
)
for chunk in stream:
    if chunk.choices and chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
    if chunk.usage:
        print(f"\nUsage: {chunk.usage.total_tokens} tokens")
```

Измеренное время до первого token при потоковой передаче: 1.5–2.3 s для всех моделей; короткие вопросы и ответы без потоковой передачи завершаются в целом за 1.7–5.1 s.

## Цепочка рассуждений (рассуждение)

Это наиболее часто неправильно понимаемый аспект тарификации серии Grok — прочитайте этот раздел целиком.

### Какие модели выдают chain-of-thought

| Модель                                     | Поведение рассуждения                                                                  |
| ------------------------------------------ | -------------------------------------------------------------------------------------- |
| `grok-4.5` / `grok-4.3` / `grok-build-0.1` | **Включено по умолчанию**; ответы включают `reasoning_content`; отключить нельзя       |
| `grok-4.20-0309-reasoning`                 | Включено, включает `reasoning_content`                                                 |
| `grok-4.20-0309-non-reasoning`             | Выключено; `reasoning_tokens` = 0; отвечает напрямую                                   |
| `grok-4.20-multi-agent-beta-0309`          | Внутреннее рассуждение не раскрывается, но `reasoning_tokens` все равно тарифицируются |

<Warning>
  **tokens рассуждения учитываются в тарификации вывода.** В одном измеренном коротком Q\&A видимый ответ был всего 30 tokens, но было тарифицировано 586 output tokens (556 из них — reasoning). Для частых коротких Q\&A, `grok-4.20-0309-non-reasoning` значительно экономит.
</Warning>

### Просмотр chain-of-thought и использования рассуждения

```python theme={null}
resp = client.chat.completions.create(
    model="grok-4.20-0309-reasoning",
    messages=[{"role": "user", "content": "Pipe A fills a pool in 8h, pipe B in 12h. How long together?"}]
)
msg = resp.choices[0].message
print("Answer:", msg.content)
print("Chain-of-thought:", msg.reasoning_content)
print("Reasoning tokens:", resp.usage.completion_tokens_details.reasoning_tokens)
```

### Параметр reasoning\_effort

`reasoning_effort` (например, `"low"` / `"high"`) **поддерживается только `grok-4.5`**; `grok-4.20-0309-reasoning` явно отклоняет его с 400 `Model ... does not support parameter reasoningEffort`. Не жестко прописывайте этот параметр в коде для разных моделей.

## Структурированные выходные данные

Стандарт OpenAI `response_format: json_schema` (strict mode) поддерживается. Проверено: успешно проходит на `grok-4.5` / `grok-4.3` / `grok-build-0.1` / `grok-4.20-0309-reasoning` и multi-agent model — все возвращают JSON, строго соответствующий схеме:

```python theme={null}
resp = client.chat.completions.create(
    model="grok-4.5",
    messages=[{"role": "user", "content": "Zhang San is 25 and lives in Hangzhou. Extract the info."}],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "user_info",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "age": {"type": "integer"},
                    "city": {"type": "string"}
                },
                "required": ["name", "age", "city"],
                "additionalProperties": False
            }
        }
    }
)
print(resp.choices[0].message.content)   # {"name":"Zhang San","age":25,"city":"Hangzhou"}
```

## Вызов функций

Поддерживаются стандартные для OpenAI поля `tools` / `tool_choice` и полный двухраундовый поток вызова tools (подтверждено на `grok-4.5` / `grok-4.3` / `grok-build-0.1`):

```python theme={null}
tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get current weather for a city",
        "parameters": {
            "type": "object",
            "properties": {"city": {"type": "string", "description": "City name"}},
            "required": ["city"]
        }
    }
}]

messages = [{"role": "user", "content": "What's the weather in Shanghai right now?"}]

# Round 1: the model decides to call the tool
resp = client.chat.completions.create(model="grok-4.5", messages=messages, tools=tools)
msg = resp.choices[0].message
tool_call = msg.tool_calls[0]
print(tool_call.function.name, tool_call.function.arguments)  # get_weather {"city":"Shanghai"}

# Round 2: feed the tool result back
messages += [
    msg,
    {"role": "tool", "tool_call_id": tool_call.id,
     "content": '{"city": "Shanghai", "temp_c": 31, "condition": "sunny"}'}
]
resp2 = client.chat.completions.create(model="grok-4.5", messages=messages, tools=tools)
print(resp2.choices[0].message.content)  # It's sunny in Shanghai, 31°C.
```

Принудительные вызовы tools через `tool_choice` (`{"type": "function", "function": {"name": "get_weather"}}`) также подтверждены как работающие.

<Tip>
  Этот раздел посвящен **client-side function calling** (ваш код выполняет tool). Если вы хотите, чтобы серверы xAI искали, запускали код или подключались к MCP за вас, используйте Responses API — см. [Web & X Search](/ru/api-capabilities/grok/web-search) и [Code Execution & MCP](/ru/api-capabilities/grok/code-execution-mcp).
</Tip>

## Вход Vision (понимание изображений)

Чат-модели Grok 4.x принимают входные изображения (jpg / png, до 20MiB на изображение) в формате OpenAI Vision. Проверено на `grok-4.5` / `grok-4.3` / `grok-4.20-0309-non-reasoning` — все корректно определили формы и цвета:

```python theme={null}
import base64

with open("image.jpg", "rb") as f:
    b64 = base64.b64encode(f.read()).decode()

resp = client.chat.completions.create(
    model="grok-4.5",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "What's in this image?"},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}}
        ]
    }]
)
print(resp.choices[0].message.content)
```

<Warning>
  **Предпочитайте base64 data URLs.** При использовании внешних URL изображение извлекается напрямую вышестоящими серверами xAI — в ходе тестирования некоторые хосты изображений (например, Wikimedia) отклоняют серверные запросы на получение, и запрос завершается с `image_download_error`. Если вам необходимо использовать внешние URL, убедитесь, что хост разрешает серверный доступ и URL указывает непосредственно на файл изображения.
</Warning>

## Кэширование prompt (автоматическое)

Префиксное кэширование Grok — **автоматическое, без настройки**, а кэшированная часть тарифицируется по сниженной ставке (0.25× на `grok-4.6`, экономия 75%):

```python theme={null}
resp = client.chat.completions.create(model="grok-4.6", messages=messages)
print("Cache hits:", resp.usage.prompt_tokens_details.cached_tokens)
```

Оптимизация: размещайте стабильный контент (system prompt, few-shot examples) в начале ваших сообщений, а переменный контент — в конце, чтобы максимизировать попадания по префиксу. xAI отмечает, что записи кэша могут быть вытеснены и попадания не гарантируются, поэтому **закладывайте в бюджет цену для некэшированного текста**.

О том, как интерпретировать попадания, о зернистости блоков по 128 token и о том, какой endpoint подходит для длинных разговоров, см. [Руководство по тарификации кэша Grok](/ru/api-capabilities/grok/prompt-caching).

## Часто задаваемые вопросы

<AccordionGroup>
  <Accordion title="Как отключить chain-of-thought у grok-4.5?">
    Вы не можете. Внутреннее рассуждение присуще `grok-4.5` / `grok-4.3` / `grok-build-0.1`. Если вам не нужен chain-of-thought и вы хотите быстрые, недорогие ответы, используйте вместо этого `grok-4.20-0309-non-reasoning`.
  </Accordion>

  <Accordion title="Должен ли reasoning_content возвращаться в контекст следующего хода?">
    Нет. При повторном воспроизведении истории в многоходовых беседах отправляйте обратно только `content` (плюс поля вызова tools). `reasoning_content` — это не стандартное поле: передача его обратно лишь увеличивает input tokens.
  </Accordion>

  <Accordion title="Как следует задавать max_tokens?">
    Цепочка рассуждений тоже расходует бюджет вывода. Если `max_tokens` слишком мал, рассуждение может съесть весь бюджет и обрезать видимый ответ. Для моделей с рассуждением начните с 2048 или выше.
  </Accordion>

  <Accordion title="Работают ли temperature / top_p?">
    Да, они принимаются обычным образом. Имейте в виду, что модели с рассуждением менее чувствительны к параметрам сэмплирования, чем традиционные модели, поэтому эффект от настройки ограничен.
  </Accordion>
</AccordionGroup>

## Связанные документы

<CardGroup cols={2}>
  <Card title="Обзор Grok" icon="rocket" href="/ru/api-capabilities/grok/overview">
    Линейка моделей, цены и матрица возможностей
  </Card>

  <Card title="Тарификация кэша" icon="database" href="/ru/api-capabilities/grok/prompt-caching">
    Скидка 75% на попадания в кэш, как их читать и как выстраивать длинные разговоры
  </Card>

  <Card title="Поиск в Web и X" icon="globe" href="/ru/api-capabilities/grok/web-search">
    Практическая работа с инструментами живого поиска на стороне сервера
  </Card>
</CardGroup>
