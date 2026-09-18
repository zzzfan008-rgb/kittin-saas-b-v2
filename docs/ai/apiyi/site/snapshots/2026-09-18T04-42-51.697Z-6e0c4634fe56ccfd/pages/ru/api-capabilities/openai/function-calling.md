> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Руководство по Function Calling OpenAI

> Определения инструментов, строгий режим, параллельные вызовы, сборка потоковой передачи — и различия в формате между эндпоинтами responses и chat/completions.

Function Calling (FC) — основа построения агентов: **модель никогда не выполняет функции — она только выводит «какую функцию вызвать и с какими аргументами»**. Выполнение происходит в вашем коде; вы отправляете результат обратно, и модель формирует финальный ответ.

Эта страница основана на официальной документации OpenAI (`developers.openai.com/api/docs/guides/function-calling`, по состоянию на июнь 2026 года). Примеры для обоих эндпоинтов готовы к копированию и вставке.

## Полный цикл вызова

<Steps>
  <Step title="Определите инструменты">
    Отправьте с запросом имена функций, описания и JSON Schema параметров
  </Step>

  <Step title="Модель возвращает вызов">
    Когда модель решает выполнить вызов, она возвращает имя функции и JSON-аргументы
  </Step>

  <Step title="Выполните локально">
    Ваш код разбирает аргументы и фактически запускает функцию (выполняет запрос к БД, обращается к внешнему API…)
  </Step>

  <Step title="Отправьте результат обратно">
    Отправьте результат вместе с диалогом во втором запросе; модель отвечает на его основе
  </Step>
</Steps>

## Ключевые различия форматов между двумя эндпоинтами

Одна и та же функция, разные форматы полей в `/v1/chat/completions` и `/v1/responses` — наиболее распространённая ошибка интеграции:

|                         | Chat Completions                                                       | Responses                                                                                   |
| ----------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Определение инструмента | Вложенное: `{"type": "function", "function": {name, parameters, ...}}` | Плоское: `{"type": "function", "name": ..., "parameters": ...}`                             |
| Результат вызова        | `message.tool_calls[]` (с `id`)                                        | Элемент вывода верхнего уровня: `{"type": "function_call", "call_id", "name", "arguments"}` |
| Возврат результата      | `{"role": "tool", "tool_call_id": ..., "content": ...}`                | `{"type": "function_call_output", "call_id": ..., "output": ...}`                           |
| Режим strict            | Явно задайте `"strict": true`                                          | Сервер приводит схемы к strict, где это возможно                                            |

<Warning>
  Эти два формата **нельзя смешивать**. Отправка вложенного определения `function: {...}` из Chat Completions в `/v1/responses` (или наоборот) — наиболее распространённая причина ошибок SDK «недопустимый параметр».
</Warning>

Перенос существующего процесса вызова инструментов с Chat Completions на Responses — например, если вы столкнулись с ограничением GPT-5.4+ на `tools` и `reasoning_effort` — подробно рассматривается в полном сравнении кода до и после в разделе [Эндпоинт и миграция](/ru/api-capabilities/openai/responses-migration).

## Полный пример: Chat Completions

Поиск погоды через полный цикл define → call → execute → return:

<CodeGroup>
  ```python Python theme={null}
  import json
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  tools = [{
      "type": "function",
      "function": {
          "name": "get_weather",
          "description": "Get current weather for a city",
          "parameters": {
              "type": "object",
              "properties": {
                  "city": {"type": "string", "description": "City name, e.g. Beijing"}
              },
              "required": ["city"],
              "additionalProperties": False
          },
          "strict": True
      }
  }]

  messages = [{"role": "user", "content": "What's the weather in Beijing?"}]

  # 1st request: the model decides to call the function
  r1 = client.chat.completions.create(
      model="gpt-5.4", messages=messages, tools=tools
  )
  tool_call = r1.choices[0].message.tool_calls[0]
  args = json.loads(tool_call.function.arguments)

  # Execute locally (fake data standing in for a real lookup)
  weather = {"city": args["city"], "temp": "26°C", "condition": "sunny"}

  # 2nd request: return the result; the model writes the final answer
  messages.append(r1.choices[0].message)
  messages.append({
      "role": "tool",
      "tool_call_id": tool_call.id,
      "content": json.dumps(weather)
  })

  r2 = client.chat.completions.create(
      model="gpt-5.4", messages=messages, tools=tools
  )
  print(r2.choices[0].message.content)
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const openai = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const tools = [{
    type: 'function',
    function: {
      name: 'get_weather',
      description: 'Get current weather for a city',
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string', description: 'City name, e.g. Beijing' }
        },
        required: ['city'],
        additionalProperties: false
      },
      strict: true
    }
  }];

  const messages = [{ role: 'user', content: "What's the weather in Beijing?" }];

  const r1 = await openai.chat.completions.create({
    model: 'gpt-5.4', messages, tools
  });
  const toolCall = r1.choices[0].message.tool_calls[0];
  const args = JSON.parse(toolCall.function.arguments);

  const weather = { city: args.city, temp: '26°C', condition: 'sunny' };

  messages.push(r1.choices[0].message);
  messages.push({
    role: 'tool',
    tool_call_id: toolCall.id,
    content: JSON.stringify(weather)
  });

  const r2 = await openai.chat.completions.create({
    model: 'gpt-5.4', messages, tools
  });
  console.log(r2.choices[0].message.content);
  ```

  ```bash cURL (1st request) theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{
      "model": "gpt-5.4",
      "messages": [{"role": "user", "content": "What is the weather in Beijing?"}],
      "tools": [{
        "type": "function",
        "function": {
          "name": "get_weather",
          "description": "Get current weather for a city",
          "parameters": {
            "type": "object",
            "properties": {"city": {"type": "string"}},
            "required": ["city"],
            "additionalProperties": false
          },
          "strict": true
        }
      }]
    }'
  ```
</CodeGroup>

## Полный пример: Ответы

Обратите внимание на три различия: определения tools имеют **плоскую** структуру, вызовы возвращаются как элементы верхнего уровня `function_call`, а результаты возвращаются как `function_call_output`. С `previous_response_id` второй запрос не требует повторной отправки всей истории:

```python theme={null}
import json
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

tools = [{
    "type": "function",          # flat definition — no nested "function" field
    "name": "get_weather",
    "description": "Get current weather for a city",
    "parameters": {
        "type": "object",
        "properties": {
            "city": {"type": "string", "description": "City name, e.g. Beijing"}
        },
        "required": ["city"],
        "additionalProperties": False
    }
}]

# 1st request
r1 = client.responses.create(
    model="gpt-5.4",
    input="What's the weather in Beijing?",
    tools=tools
)

# Find the function_call item in the output array
call = next(item for item in r1.output if item.type == "function_call")
args = json.loads(call.arguments)

weather = {"city": args["city"], "temp": "26°C", "condition": "sunny"}

# 2nd request: chain with previous_response_id, return only the function result
r2 = client.responses.create(
    model="gpt-5.4",
    previous_response_id=r1.id,
    input=[{
        "type": "function_call_output",
        "call_id": call.call_id,
        "output": json.dumps(weather)
    }],
    tools=tools
)
print(r2.output_text)
```

## Строгий режим (структурированные выводы)

`strict: true` гарантирует, что аргументы модели **точно соответствуют вашей JSON Schema** — без выдуманных или пропущенных полей. Есть три требования:

1. Схема должна включать `"additionalProperties": false`
2. Каждое поле должно присутствовать в `required` (необязательность выражайте с помощью `"type": ["string", "null"]`)
3. Только поддерживаемое подмножество JSON Schema (примитивные типы, enum, массивы, вложенные объекты, …)

```json theme={null}
// ✅ Valid strict schema
{
  "type": "object",
  "properties": {
    "city": {"type": "string"},
    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
    "date": {"type": ["string", "null"], "description": "Optional, defaults to today"}
  },
  "required": ["city", "unit", "date"],
  "additionalProperties": false
}
```

```json theme={null}
// ❌ Invalid: missing additionalProperties, date not in required
{
  "type": "object",
  "properties": {
    "city": {"type": "string"},
    "date": {"type": "string"}
  },
  "required": ["city"]
}
```

<Warning>
  **строгий режим несовместим с параллельными вызовами функций**: когда вам нужны строгие гарантии схемы, также задайте `parallel_tool_calls: false`.
</Warning>

## parallel\_tool\_calls и tool\_choice

### Параллельные вызовы

`parallel_tool_calls` по умолчанию включен: модель может запросить несколько функций за один ход (например, погоду для Пекина и Шанхая одновременно). Выполните каждую, затем **верните все результаты** перед следующим запросом — каждый результат должен соответствовать своему `call_id` (responses) или `tool_call_id` (chat).

### Стратегии tool\_choice

| Значение                                      | Поведение                                           |
| --------------------------------------------- | --------------------------------------------------- |
| `"auto"` (по умолчанию)                       | Модель сама решает, вызывать ли что-то и что именно |
| `"required"`                                  | Должна вызвать как минимум одну функцию             |
| `{"type": "function", "name": "get_weather"}` | Принудительно вызвать конкретную функцию            |
| `"none"`                                      | Без вызовов — только текст                          |

### Подмножества allowed\_tools

Когда у вас много tools, но вы хотите раскрыть только некоторые из них в этом ходе, используйте форму `allowed_tools` для `tool_choice`, чтобы ограничить доступное для вызова подмножество — это **не изменяет сам список tools**, поэтому не нарушает стабильный префикс для [кэширования](/ru/api-capabilities/openai/prompt-caching):

```python theme={null}
tool_choice={
    "type": "allowed_tools",
    "mode": "auto",
    "tools": [{"type": "function", "name": "get_weather"}]
}
```

## Вызовы функций в потоковой передаче

### Chat Completions: соберите по индексу

Аргументы функции передаются фрагментами. Накапливайте строку `arguments` для каждого `index`, затем `json.loads` после завершения потока:

```python theme={null}
stream = client.chat.completions.create(
    model="gpt-5.4", messages=messages, tools=tools, stream=True
)

calls = {}  # index -> {name, arguments}
for chunk in stream:
    delta = chunk.choices[0].delta if chunk.choices else None
    if delta and delta.tool_calls:
        for tc in delta.tool_calls:
            entry = calls.setdefault(tc.index, {"name": "", "arguments": ""})
            if tc.function.name:
                entry["name"] = tc.function.name
            if tc.function.arguments:
                entry["arguments"] += tc.function.arguments

print(calls)  # arguments are complete JSON only after the stream ends
```

### Responses: отслеживайте семантические события

События `response.function_call_arguments.delta` содержат приращения аргументов, а `response.function_call_arguments.done` доставляет полные аргументы — без ручной сборки по индексу.

## Лучшие практики и подводные камни

Как писать хорошие определения инструментов:

* **Имена и описания пишутся для модели**: явно укажите «когда вызывать меня», например `"Get real-time weather; call only when the user explicitly asks about weather"`
* **Сужайте параметры с помощью enum**: если значения перечислимы, не используйте свободные строки — это устраняет большинство выдуманных аргументов
* **Держите определения инструментов в начале prompt и не меняйте их**: tools участвуют в префиксе кэша; стабильные определения означают 90%-ную скидку на входные данные (см. [Тарификация кэша](/ru/api-capabilities/openai/prompt-caching))
* **Ограничьте цикл агента**: задайте максимальное число раундов, чтобы модель не могла бесконечно сжигать деньги, переходя по циклу call → return → call

Распространенные ошибки:

| Симптом                                             | Исправление                                                                                                                                                      |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `arguments` не является корректным JSON             | Включите `strict: true` — это решает проблему в корне                                                                                                            |
| Модель вызывает несуществующую функцию              | Ужесточите с помощью `tool_choice`; проверьте, не вводят ли описания в заблуждение                                                                               |
| Несоответствие `call_id` после параллельных вызовов | Каждый результат должен соответствовать один к одному своему `call_id` / `tool_call_id` — одной отсутствующей пары достаточно, чтобы запрос завершился с ошибкой |
| Ошибки параметров из-за смешанных форматов          | Проверьте таблицу различий выше; сопоставьте форму определения (вложенная/плоская) с эндпоинтом                                                                  |

## Поддержка моделей и выбор

Вся серия gpt-5 поддерживает вызов функций. По сценариям:

| Сценарий                                   | Рекомендуемая модель                   | Почему                                               |
| ------------------------------------------ | -------------------------------------- | ---------------------------------------------------- |
| Повседневные агенты / использование tools  | `gpt-5.4` (\$2.50 / \$15.00 за 1M)     | Лучший баланс между возможностями и стоимостью       |
| Высокочастотная легковесная маршрутизация  | `gpt-5.4-mini` (\$0.75 / \$4.50 за 1M) | Дешево; вполне достаточно для простого распределения |
| Сложные агенты для многошагового reasoning | `gpt-5.5` (\$5.00 / \$30.00 за 1M)     | Стабильнее на длинных цепочках планирования          |

## Связанные ссылки

* Эта группа: [Native Calls](/ru/api-capabilities/openai/native) · [Compatible Mode](/ru/api-capabilities/openai/compatible) · [Cache Billing](/ru/api-capabilities/openai/prompt-caching)
* Получение / управление tokens: `https://api.apiyi.com/token`
* Официальная документация OpenAI: `developers.openai.com/api/docs/guides/function-calling`
