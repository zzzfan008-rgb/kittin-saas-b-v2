> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Руководство по нативному OpenAI Responses API

> Вызывайте /v1/responses через APIYI: управление состоянием, управление рассуждением, встроенные tools и семантические события потоковой передачи. Рекомендуемый OpenAI эндпоинт для новых проектов.

`/v1/responses` — текущий флагманский нативный endpoint OpenAI. По словам самих OpenAI: «Хотя Chat Completions по-прежнему поддерживается, **Responses рекомендуется для всех новых проектов**». APIYI полностью поддерживает этот endpoint — просто укажите `base_url` на `https://api.apiyi.com/v1`.

Эта страница основана на официальной документации OpenAI (`developers.openai.com/api/docs`, по состоянию на июнь 2026 года). Все примеры готовы к копированию и вставке.

## Почему Responses

По сравнению с Chat Completions OpenAI приводит три конкретных показателя:

* **Лучшее рассуждение**: та же reasoning-модель показывает примерно на 3% более высокий результат на SWE-bench через Responses (состояние рассуждения сохраняется между ходами)
* **Дешевле входящие данные**: использование кэша на 40%–80% выше, чем в Chat Completions (по внутренним тестам OpenAI), что напрямую снижает ваш счет за входные данные
* **Больше инструментов**: встроенные инструменты, такие как `web_search` и `code_interpreter`, доступны только в Responses

Когда Chat Completions по-прежнему остается правильным выбором: вы опираетесь на существующие фреймворки (LangChain и большинство клиентов по умолчанию используют `/v1/chat/completions`), или вам нужна одна кодовая база, которая также вызывает Claude, Gemini и другие не-OpenAI-модели — см. [Совместимый режим](/ru/api-capabilities/openai/compatible).

<Note>
  Устаревшим считается **Assistants API** (планируется отключение 26 августа 2026 года (UTC)), а не Chat Completions. Оба эндпоинта останутся поддерживаемыми в долгосрочной перспективе; просто новые функции сначала появляются в Responses.
</Note>

## Быстрый старт

<CodeGroup>
  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/responses \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{
      "model": "gpt-5.4",
      "input": "Introduce yourself in one sentence",
      "instructions": "You are a concise assistant"
    }'
  ```

  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="YOUR_API_KEY",
      base_url="https://api.apiyi.com/v1"
  )

  response = client.responses.create(
      model="gpt-5.4",
      input="Introduce yourself in one sentence",
      instructions="You are a concise assistant"
  )

  print(response.output_text)  # SDK helper that concatenates all text output
  ```

  ```javascript Node.js theme={null}
  import OpenAI from 'openai';

  const openai = new OpenAI({
    apiKey: 'YOUR_API_KEY',
    baseURL: 'https://api.apiyi.com/v1'
  });

  const response = await openai.responses.create({
    model: 'gpt-5.4',
    input: 'Introduce yourself in one sentence',
    instructions: 'You are a concise assistant'
  });

  console.log(response.output_text);
  ```
</CodeGroup>

<Tip>
  Предпочитайте `response.output_text` вместо написанного вручную `output[0].content[0].text` — для моделей с рассуждением первый элемент в `output` часто оказывается элементом `reasoning`, а не `message`, поэтому жестко заданная индексация ломается.
</Tip>

## Параметры запроса

| Параметр               | Тип            | Значение по умолчанию | Описание                                                                                              |
| ---------------------- | -------------- | --------------------- | ----------------------------------------------------------------------------------------------------- |
| `model`                | string         | required              | например `gpt-5.4`, `gpt-5.5`                                                                         |
| `input`                | string / array | required              | Ввод пользователя; поддерживает массивы мультимодального содержимого                                  |
| `instructions`         | string         | null                  | Системные инструкции (аналог system prompt)                                                           |
| `max_output_tokens`    | int            | null                  | Ограничение вывода (включает reasoning tokens)                                                        |
| `reasoning`            | object         | medium                | `{"effort": "none/low/medium/high/xhigh"}`                                                            |
| `text`                 | object         | —                     | `format` (формат вывода), `verbosity` (low/medium/high)                                               |
| `tools`                | array          | \[]                   | Функции + встроенные инструменты                                                                      |
| `tool_choice`          | string         | "auto"                | `auto` / `required` / `none` / конкретный инструмент                                                  |
| `parallel_tool_calls`  | boolean        | true                  | Разрешить параллельные вызовы инструментов                                                            |
| `store`                | boolean        | true                  | Сохранять ответ на стороне сервера — ⚠️ **недоступно на APIYI**, см. раздел «Многоходовый режим» ниже |
| `previous_response_id` | string         | null                  | Связать с предыдущим ответом — ⚠️ **не действует на APIYI**; передавайте историю в массиве `input`    |
| `conversation`         | string         | null                  | Постоянный объект разговора — ⚠️ **не поддерживается на APIYI** (`/v1/conversations` возвращает 404)  |
| `background`           | boolean        | false                 | Асинхронное выполнение в фоновом режиме (долгие задачи / модели Pro)                                  |
| `stream`               | boolean        | false                 | Потоковая передача (семантические события)                                                            |
| `prompt_cache_key`     | string         | null                  | Ключ маршрутизации кэша — см. [Тарификация кэша](/ru/api-capabilities/openai/prompt-caching)          |
| `metadata`             | object         | {}                    | Пользовательские метаданные                                                                           |

<Warning>
  модели рассуждения серии gpt-5 **не поддерживают `temperature` / `top_p`** — при передаче возникает ошибка. Вместо этого используйте `reasoning.effort` и `text.verbosity`.
</Warning>

## Структура ответа

`output` — это массив элементов. Три распространенных типа: `reasoning` (сводка рассуждения), `message` (текстовый ответ) и `function_call` (запрос на вызов функции). Укороченный пример:

```json theme={null}
{
  "id": "resp_abc123",
  "object": "response",
  "status": "completed",
  "model": "gpt-5.4-2026-03-05",
  "output": [
    { "type": "reasoning", "summary": [] },
    {
      "type": "message",
      "role": "assistant",
      "content": [{ "type": "output_text", "text": "Hi! I'm an AI assistant." }]
    }
  ],
  "usage": {
    "input_tokens": 24,
    "input_tokens_details": { "cached_tokens": 0 },
    "output_tokens": 58,
    "output_tokens_details": { "reasoning_tokens": 40 },
    "total_tokens": 82
  }
}
```

Два поля `usage`, на которые стоит обратить внимание:

* `input_tokens_details.cached_tokens`: ввод, который попал в кэш (тарифицируется по 0.1×)
* `output_tokens_details.reasoning_tokens`: расход на рассуждение (тарифицируется по ставке вывода; настраивается с помощью `reasoning.effort`)

## Многоходовой режим: ведите историю самостоятельно

При вызове Responses API через APIYI, **передавайте всю историю в массиве `input`** (каждая запись с `role` / `content`), так же как в Chat Completions:

```python theme={null}
resp = client.responses.create(
    model="gpt-5.4",
    input=[
        {"role": "user", "content": "My name is Alice. Please remember it."},
        {"role": "assistant", "content": "Got it, your name is Alice."},
        {"role": "user", "content": "What's my name?"},
    ],
)
print(resp.output_text)  # Answers "Alice"
```

<Warning>
  **Состояние на стороне сервера в APIYI недоступно — не полагайтесь на него.** Проверено через шлюз (несколько моделей, с задержками между повторными попытками):

  * `previous_response_id`: принято без ошибок (возвращает 200), но следующий ход **не помнит** предыдущий (`input_tokens` отражает только текущий ход, история не загружена);
  * `GET /v1/responses/{id}`: возвращает 400 — сохраненные responses **нельзя получить**;
  * `conversation` объекты (`/v1/conversations`): возвращают 404 — **не поддерживается**.

  Поэтому `store` / `previous_response_id` / `conversation` **не следует использовать** в APIYI; всегда используйте подход с «массивом `input` с самостоятельно управляемой историей» выше. Полное руководство по кросс-форматам: [Руководство по многоходовому диалогу](/ru/api-capabilities/multi-turn-conversation).
</Warning>

<Warning>
  **Многоходовой режим не снижает тарификацию входных данных**: каждый ход заново отправляет всю историю, и все это тарифицируется как input tokens. Длительные разговоры экономят за счет скидок кэша (исторический префикс автоматически попадает в кэш по ставке 0.1×) — см. [Тарификация кэша](/ru/api-capabilities/openai/prompt-caching).
</Warning>

## Управление рассуждением и выводом

### Выбор reasoning.effort

| Уровень                 | Когда использовать                                                  |
| ----------------------- | ------------------------------------------------------------------- |
| `none`                  | Простые вопросы и ответы и преобразование формата — быстро и дешево |
| `low`                   | Обычный чат, краткие сводки                                         |
| `medium` (по умолчанию) | Сбалансированный выбор для повседневной разработки                  |
| `high`                  | Сложный код, многошаговое рассуждение                               |
| `xhigh`                 | Самые сложные задачи, с `gpt-5.5` / `gpt-5.4`                       |

```python theme={null}
response = client.responses.create(
    model="gpt-5.5",
    input="Prove that the square root of 2 is irrational",
    reasoning={"effort": "xhigh"}
)
```

### text.verbosity

`low` / `medium` (по умолчанию) / `high` управляет длиной ответа. Только ответы:

```python theme={null}
response = client.responses.create(
    model="gpt-5.4",
    input="Explain closures",
    text={"verbosity": "low"}  # short version
)
```

## Потоковая передача

Responses передает поток **semantic events**, а не обычные `choices[0].delta` chunks из Chat Completions. Основные события:

| Событие                                  | Значение                                            |
| ---------------------------------------- | --------------------------------------------------- |
| `response.created`                       | Ответ начат                                         |
| `response.output_item.added`             | Новый элемент вывода (message / function\_call / …) |
| `response.output_text.delta`             | Фрагмент текста                                     |
| `response.function_call_arguments.delta` | Фрагмент аргумента функции                          |
| `response.completed`                     | Готово (включает итоговое usage)                    |
| `error`                                  | Сбой                                                |

```python theme={null}
stream = client.responses.create(
    model="gpt-5.4",
    input="Write a short poem about autumn",
    stream=True
)

for event in stream:
    if event.type == "response.output_text.delta":
        print(event.delta, end="", flush=True)
    elif event.type == "response.completed":
        print("\n\nUsage:", event.response.usage)
```

## Встроенные инструменты

Встроенные инструменты доступны только в Responses — объявите их в `tools`, и OpenAI выполнит их на стороне сервера:

| Инструмент             | type               | Описание                                                                                                                                                                                                                                                                      |
| ---------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Веб-поиск              | `web_search`       | Модель автономно выполняет поиск в интернете                                                                                                                                                                                                                                  |
| Поиск по файлам        | `file_search`      | Выполнение запросов к загруженным векторным хранилищам                                                                                                                                                                                                                        |
| Интерпретатор кода     | `code_interpreter` | Запуск Python в изолированной среде                                                                                                                                                                                                                                           |
| Управление компьютером | `computer_use`     | Управление виртуальным рабочим столом                                                                                                                                                                                                                                         |
| Удалённый MCP          | `mcp`              | Подключение к удалённым MCP-серверам                                                                                                                                                                                                                                          |
| Генерация изображений  | `image_generation` | Встроенная генерация изображений. **Не рекомендуется в APIYI** (фиксированная плата за каждый вызов, стабильность не гарантируется) — вместо этого используйте [API изображений](/ru/api-capabilities/gpt-image-2/text-to-image) с тарификацией по фактическому использованию |
| Поиск инструментов     | `tool_search`      | Динамический поиск среди больших наборов инструментов (gpt-5.4 и более поздние версии)                                                                                                                                                                                        |

Минимальный пример `web_search`:

```python theme={null}
response = client.responses.create(
    model="gpt-5.4",
    input="What are today's major AI news stories?",
    tools=[{"type": "web_search"}]
)
print(response.output_text)
```

<Info>
  Встроенные инструменты выполняются на стороне OpenAI; поддержку каждого инструмента в режиме сквозной передачи через канал APIYI следует подтвердить тестированием. Вызов пользовательских функций полностью поддерживается — см. раздел [Вызов функций](/ru/api-capabilities/openai/function-calling).
</Info>

## Pro-модели и фоновый режим

`gpt-5.4-pro` и `gpt-5.5-pro` — модели с глубоким рассуждением для профессиональных нагрузок (\$30 / \$180 за миллион token, **только для svip group**) и, на практике, **доступны только через `/v1/responses`**. Один запрос может занимать минуты — используйте их вместе с `background: true`:

```python theme={null}
# Submit a background task
response = client.responses.create(
    model="gpt-5.4-pro",
    input="Do a deep review of this architecture proposal: ...",
    background=True
)

# Poll for the result
import time
while response.status in ("queued", "in_progress"):
    time.sleep(10)
    response = client.responses.retrieve(response.id)

print(response.output_text)
```

<Warning>
  Pro-модели дорогие и медленные — компромисс здесь в том, чтобы подождать несколько минут ради более надежного ответа. Для повседневной разработки используйте `gpt-5.4` / `gpt-5.5`; не обращайтесь к Pro без явной необходимости в глубоком рассуждении.
</Warning>

## Поддерживаемые модели и цены

| Модель              | Входные данные (за 1 млн token) | Выходные данные (за 1 млн token) | Примечания                                                                                                                                                            |
| ------------------- | ------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gpt-5.6-sol`       | \$4.00                          | \$20.00                          | Последняя флагманская модель, контекстное окно 1 млн, псевдоним `gpt-5.6` указывает на неё; снижение цены 3 сентября, промо-тариф действует как минимум до 21.11.2026 |
| `gpt-5.6-terra`     | \$2.50                          | \$15.00                          | Универсальная рабочая модель серии 5.6                                                                                                                                |
| `gpt-5.6-luna`      | \$1.00                          | \$6.00                           | Облегчённый вариант 5.6                                                                                                                                               |
| `gpt-5.4`           | \$2.50                          | \$15.00                          | Предыдущая универсальная рабочая модель, контекстное окно 1 млн                                                                                                       |
| `gpt-5.4-mini`      | \$0.75                          | \$4.50                           | Облегчённая модель с отличным соотношением цены и качества                                                                                                            |
| `gpt-5.5`           | \$5.00                          | \$30.00                          | Предыдущая флагманская модель, сложное рассуждение                                                                                                                    |
| `gpt-5.2`           | \$1.75                          | \$14.00                          | Предыдущая универсальная рабочая модель                                                                                                                               |
| `gpt-5.1` / `gpt-5` | \$1.25                          | \$10.00                          | Доступный вариант                                                                                                                                                     |
| `gpt-5.4-pro`       | \$30.00                         | \$180.00                         | Только для svip, только responses, для профессионального использования                                                                                                |
| `gpt-5.5-pro`       | \$30.00                         | \$180.00                         | Только для svip, только responses, для профессионального использования                                                                                                |

Также доступны версии с закреплённой датой (например, `gpt-5.4-2026-03-05`) по той же цене. Полный список: [Модели и цены](/ru/api-capabilities/model-info).

## Сопоставление с Chat Completions

<Warning>
  **Начиная с GPT-5.4 (включая `gpt-5.6-sol` / `gpt-5.6-terra` / `gpt-5.6-luna`), вызов инструментов в сочетании с явно заданным уровнем рассуждения может быть отклонён на `/v1/chat/completions`**: запрос, содержащий `tools` и **явно** передающий отличное от `none` значение `reasoning_effort`, завершается ошибкой 400 — `Function tools with reasoning_effort are not supported for ... in /v1/chat/completions`. Это официальное ограничение OpenAI; эндпоинт `/v1/responses`, рассматриваемый на этой странице, такого ограничения не имеет — используйте Responses для вызова инструментов с этими моделями.

  Срабатывание **зависит от того, по какому вышестоящему маршруту будет направлен запрос**, поэтому одна и та же модель сейчас может вернуть 200, а позже — 400. Никогда не считайте, что «в прошлый раз всё сработало», доказательством безопасности. Измерения, компромисс между двумя способами устранения проблемы и полные инструкции по миграции: [Эндпоинт и миграция](/ru/api-capabilities/openai/responses-migration).
</Warning>

Сопоставление полей при миграции с `/v1/chat/completions`:

| Chat Completions                         | Responses                                                                                | Примечания                                  |
| ---------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------- |
| `messages` array                         | `input`                                                                                  | Для простых случаев подходит обычная строка |
| системное сообщение                      | `instructions`                                                                           | Отдельный параметр                          |
| `max_tokens` / `max_completion_tokens`   | `max_output_tokens`                                                                      | —                                           |
| `response_format`                        | `text.format`                                                                            | —                                           |
| `reasoning_effort` верхнего уровня       | `reasoning.effort`                                                                       | В Responses — вложенный объект              |
| `choices[0].message.content`             | `output_text`                                                                            | Чтение результата                           |
| Без сохранения состояния, ручная история | Также ручная история (массив `input`) ⚠️ состояние на стороне сервера недоступно в APIYI | —                                           |
| `usage.prompt_tokens`                    | `usage.input_tokens`                                                                     | Другие имена полей                          |

<CodeGroup>
  ```python Chat Completions (старый) theme={null}
  response = client.chat.completions.create(
      model="gpt-5.4",
      messages=[
          {"role": "system", "content": "You are a concise assistant"},
          {"role": "user", "content": "Hello"}
      ]
  )
  content = response.choices[0].message.content
  ```

  ```python Responses (новый) theme={null}
  response = client.responses.create(
      model="gpt-5.4",
      input="Hello",
      instructions="You are a concise assistant"
  )
  content = response.output_text
  ```
</CodeGroup>

## Статус поддержки клиентов

Почему большинство IDE и плагинов семейства VS Code (Cline, Trae и т. д.) поддерживают только `/v1/chat/completions`, а не эндпоинт Responses, рассматриваемый на этой странице?

* **chat/completions — де-факто отраслевой стандарт**: сторонние шлюзы, локальные среды инференса (Ollama / vLLM / LM Studio) и вендоры, не относящиеся к OpenAI, все реализуют его, поэтому один обработчик покрывает сотни провайдеров — тогда как `/v1/responses` по-прежнему по сути является диалектом, почти исключительно OpenAI
* **Responses — это не просто замена URL**: семантическая потоковая передача событий (а не конкатенация delta), вывод на основе items и передача состояния reasoning принципиально отличаются от chat/completions — клиентам приходится переписывать весь цикл агента
* **Проблема курицы и яйца**: клиенты не реализуют это, потому что большинство кастомных эндпоинтов (шлюзов) не обслуживают responses, а шлюзы не спешат по той же причине. APIYI уже предоставляет `/v1/responses` (эта страница), так что на стороне шлюза нет блокирующего фактора

Поддержка в основных клиентах по состоянию на июль 2026 года:

| Клиент                                           | Поддержка Responses | Примечания                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Codex CLI](/ru/scenarios/programming/codex-cli) | ✅ Нативно           | Разработан OpenAI, весь цикл агента работает на Responses; поддержка chat/completions была убрана в начале 2026 года                                                                                                                                                                            |
| [opencode](/ru/scenarios/programming/opencode)   | ✅                   | Провайдер OpenAI по умолчанию использует Responses                                                                                                                                                                                                                                              |
| [Roo Code](/ru/scenarios/programming/roo-code)   | ✅ (до gpt-5.4)      | Провайдер «OpenAI» использует Responses и принимает пользовательский Base URL (провайдер «OpenAI Compatible» по-прежнему использует chat/completions); проект прекращен, предустановленные модели заканчиваются на `gpt-5.4`; можно установить как плагин в Trae и других IDE семейства VS Code |
| Continue                                         | ✅                   | По умолчанию использует Responses для gpt-5 / o-series; приобретен Cursor, автономный продукт постепенно сворачивается                                                                                                                                                                          |
| [Cline](/ru/scenarios/programming/cline)         | ❌                   | Путь OpenAI Compatible жестко привязан к chat/completions; запрос на функцию от сообщества пока не реализован                                                                                                                                                                                   |
| [Trae](/ru/scenarios/programming/trae)           | ❌                   | Для пользовательских моделей доступны только эндпоинты chat/completions и messages                                                                                                                                                                                                              |

Для нагрузок GPT-5.4+ с «reasoning plus tool calling» первым выбором будут Codex CLI / opencode — укажите Base URL на `https://api.apiyi.com/v1`. Если вам достаточно `gpt-5.4` и вы хотите остаться в IDE семейства VS Code (включая Trae), установите плагин Roo Code и выберите его провайдера OpenAI.

## Устранение неполадок

| Симптом                                                            | Причина и исправление                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ошибка `model_not_supported`                                       | Модель не поддерживает эндпоинт responses — используйте серию gpt-5                                                                                                                                                                                                                                                          |
| В многошаговом диалоге забывается контекст                         | Самый безопасный подход — передавать всю историю в массиве `input`; связывание с помощью `previous_response_id` работало при проверке 2026-09-02, но `GET /v1/responses/{id}` по-прежнему недоступен — проверьте в своей группе, прежде чем полагаться на него                                                               |
| `output_text` пуст                                                 | Вывод состоит только из элементов `function_call` (модель хочет выполнить tools) — перебирайте `output`                                                                                                                                                                                                                      |
| Ошибка при передаче `temperature`                                  | Не поддерживается моделями рассуждения gpt-5 — удалите его и используйте `reasoning.effort`                                                                                                                                                                                                                                  |
| `Function tools with reasoning_effort are not supported ...` (400) | Официальное ограничение GPT-5.4+ на `/v1/chat/completions` (tools и явно заданный reasoning\_effort, отличный от `none`, взаимоисключающие параметры) — переключитесь на эндпоинт `/v1/responses` на этой странице; шаги миграции приведены в разделе [Эндпоинт и миграция](/ru/api-capabilities/openai/responses-migration) |

## Связанные ссылки

* Эта группа: [Совместимый режим](/ru/api-capabilities/openai/compatible) · [Эндпоинт и миграция](/ru/api-capabilities/openai/responses-migration) · [Тарификация кэша](/ru/api-capabilities/openai/prompt-caching) · [Вызов функций](/ru/api-capabilities/openai/function-calling)
* Получение и управление tokens: `https://api.apiyi.com/token`
* Руководство по миграции OpenAI: `developers.openai.com/api/docs/guides/migrate-to-responses`
