> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Руководство по нативному формату Gemini

> Вызов официального формата Gemini generateContent через APIYI: настройка google-genai SDK, потоковая передача, элементы управления thinking_level и подписи мыслей.

APIYI полностью поддерживает **официальный нативный формат Gemini** (эндпоинт `/v1beta` generateContent): укажите `base_url` на `https://api.apiyi.com`, и ваш существующий код Gemini и официальные SDKs мигрируют без проблем — преобразование формата не требуется.

Эта страница основана на официальной документации Google (`ai.google.dev/gemini-api/docs`, по состоянию на июнь 2026 года). Все примеры готовы к копированию и вставке.

## Почему нативный формат

Формат, совместимый с OpenAI, тоже может вызывать Gemini, но следующие возможности доступны **только в нативном формате**:

* **Полные элементы управления thinking**: `thinking_level` (серия Gemini 3) / `thinking_budget` (серия 2.5), сводки мыслей, сигнатуры мыслей
* **Нативные мультимодальные Parts**: встроенные изображения / аудио / видео, с управлением затратами `media_resolution` — см. [Мультимодальность и выполнение кода](/ru/api-capabilities/gemini/multimodal)
* **Инструмент выполнения кода**: `code_execution` запускает Python в песочнице
* **Поля использования с детальной гранулярностью**: `thoughts_token_count`, `cached_content_token_count` и другие

Для обычного текстового чата или для одной codebase для нескольких вендоров вместо этого используйте [Режим, совместимый с OpenAI](/ru/api-capabilities/openai/compatible).

## Быстрый старт

Используйте официальный унифицированный SDK Google `google-genai` (устаревший `google-generative-ai` был снят с поддержки 30 ноября 2025 (UTC)):

```bash theme={null}
pip install google-genai
```

<CodeGroup>
  ```python Python theme={null}
  from google import genai

  client = genai.Client(
      api_key="YOUR_API_KEY",  # your APIYI key
      http_options={"base_url": "https://api.apiyi.com"}
  )

  response = client.models.generate_content(
      model="gemini-3.5-flash",
      contents="Introduce yourself in one sentence"
  )
  print(response.text)
  ```

  ```javascript Node.js theme={null}
  import { GoogleGenAI } from '@google/genai';

  const ai = new GoogleGenAI({
    apiKey: 'YOUR_API_KEY',
    httpOptions: { baseUrl: 'https://api.apiyi.com' }
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: 'Introduce yourself in one sentence'
  });
  console.log(response.text);
  ```

  ```bash cURL theme={null}
  curl "https://api.apiyi.com/v1beta/models/gemini-3.5-flash:generateContent" \
    -H "Content-Type: application/json" \
    -H "x-goog-api-key: YOUR_API_KEY" \
    -d '{
      "contents": [{
        "parts": [{"text": "Introduce yourself in one sentence"}]
      }]
    }'
  ```
</CodeGroup>

<Warning>
  base\_url — это `https://api.apiyi.com` (**без** `/v1`) — отличается от `https://api.apiyi.com/v1` формата, совместимого с OpenAI. Используйте ваш **ключ APIYI**, а не ключ Google AI Studio.
</Warning>

## Потоковая передача

```python theme={null}
stream = client.models.generate_content_stream(
    model="gemini-3.5-flash",
    contents="Write a short essay on quantum computing"
)

for chunk in stream:
    print(chunk.text, end="", flush=True)
```

## Контролы рассуждения

Модели Gemini по умолчанию используют рассуждение, и **для двух поколений используются разные параметры — их смешивание вызывает ошибку**:

| Серия модели         | Параметр          | Значения                                                                       |
| -------------------- | ----------------- | ------------------------------------------------------------------------------ |
| Gemini 3 / 3.1 / 3.5 | `thinking_level`  | `minimal` (только семейство Flash) / `low` / `high` (по умолчанию)             |
| Gemini 2.5           | `thinking_budget` | лимит token (например, 0–8192); если не задано, модель управляет автоматически |

<Warning>
  Передача одновременно `thinking_level` и `thinking_budget` в модель серии Gemini 3 **возвращает ошибку** — выберите один вариант (для серии 3 используйте `thinking_level`).
</Warning>

```python theme={null}
from google.genai import types

# Gemini 3 series: level-based control
response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="Prove that the square root of 2 is irrational",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_level="high")
    )
)

# Gemini 2.5 series: token-budget control
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Simple question, be quick",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_budget=0)  # thinking off
    )
)
```

Выбор уровня: `minimal` для простых задач с низкой задержкой (классификация, извлечение); `low` для обычного чата; `high` для сложного рассуждения и кода. Токены рассуждения тарифицируются по **ставке output** — более высокие уровни стоят дороже.

### Сводки мыслей и сигнатуры мыслей

* **Сводки мыслей**: `include_thoughts=True` возвращает сводку рассуждения (части, где `part.thought` имеет значение `True`)
* **Сигнатуры мыслей**: зашифрованное состояние рассуждения, представленное в Gemini 3. В многоходовых беседах (особенно при function calling) передавайте `thought_signature` из ответа обратно без изменений, чтобы модель могла продолжить цепочку рассуждения. **Официальные SDK делают это автоматически**; не удаляйте это поле в ручных REST-вызовах — см. [Function Calling](/ru/api-capabilities/gemini/function-calling)

```python theme={null}
response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="Analyze the time complexity of: def fib(n): return n if n <= 1 else fib(n-1) + fib(n-2)",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_level="high", include_thoughts=True)
    )
)

for part in response.candidates[0].content.parts:
    if getattr(part, "thought", False):
        print(f"[Thought summary] {part.text}")
    else:
        print(f"[Final answer] {part.text}")
```

## Общие параметры конфигурации

Передаются через `config` (`GenerateContentConfig`):

| Параметр             | Описание                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `system_instruction` | System prompt                                                                                                                   |
| `temperature`        | 0–2. **Google рекомендует оставлять значение по умолчанию 1.0 для серии Gemini 3** — снижение может ухудшить качество reasoning |
| `max_output_tokens`  | Лимит вывода (включает thinking tokens)                                                                                         |
| `thinking_config`    | Управление thinking, см. выше                                                                                                   |
| `response_mime_type` | Установите `application/json`, чтобы принудительно вывести JSON                                                                 |
| `response_schema`    | Ограничение схемы для структурированного вывода JSON                                                                            |
| `tools`              | Объявления функций / `code_execution` и другие инструменты                                                                      |
| `media_resolution`   | Управление стоимостью мультимодального ввода, см. [страницу Multimodal](/ru/api-capabilities/gemini/multimodal)                 |

## Поля использования (usage\_metadata)

```python theme={null}
usage = response.usage_metadata
print(f"Input: {usage.prompt_token_count}")
print(f"Output: {usage.candidates_token_count}")
print(f"Thinking: {usage.thoughts_token_count}")
print(f"Cache hits: {usage.cached_content_token_count}")
```

| Поле                         | Описание               | Тарификация                                                                            |
| ---------------------------- | ---------------------- | -------------------------------------------------------------------------------------- |
| `prompt_token_count`         | Входные tokens         | Тариф на вход                                                                          |
| `candidates_token_count`     | Выходные tokens        | Тариф на выход                                                                         |
| `thoughts_token_count`       | tokens для рассуждения | **Тариф на выход** — настройте уровень, чтобы экономить                                |
| `cached_content_token_count` | Кэшированные tokens    | Официальная скидка, см. [Тарификация кэша](/ru/api-capabilities/gemini/prompt-caching) |
| `total_token_count`          | Итого                  | —                                                                                      |

## Поддерживаемые модели и тарификация

| Модель                   | Ввод (за 1M tokens) | Вывод (за 1M tokens) | Примечания                                                                          |
| ------------------------ | ------------------- | -------------------- | ----------------------------------------------------------------------------------- |
| `gemini-3.5-flash`       | \$1.50              | \$9.00               | Текущая рабочая лошадка — превосходит 3.1 Pro по нескольким бенчмаркам, контекст 1M |
| `gemini-3.1-pro-preview` | \$1.80              | \$10.80              | Флагман Pro                                                                         |
| `gemini-3-pro-preview`   | \$1.80              | \$10.80              | Предыдущий Pro                                                                      |
| `gemini-3-flash-preview` | \$0.44              | \$2.64               | Легкая и быстрая                                                                    |
| `gemini-3.1-flash-lite`  | \$0.25              | \$1.50               | Сверхбюджетная                                                                      |
| `gemini-2.5-pro`         | \$1.25              | \$10.00              | Pro серии 2.5                                                                       |
| `gemini-2.5-flash`       | \$0.30              | \$2.40               | Рабочая лошадка серии 2.5                                                           |
| `gemini-2.5-flash-lite`  | \$0.10              | \$0.40               | Самая дешевая                                                                       |

<Tip>
  Некоторые модели имеют варианты alias `-thinking` / `-nothinking` (например, `gemini-3-flash-preview-nothinking`), которые фиксируют thinking включенным/выключенным — удобно для клиентов, где вы не можете менять параметры запроса. Полный список: [Модели и тарификация](/ru/api-capabilities/model-info).
</Tip>

## Нативный vs OpenAI-compatible

| Функция                    | Gemini нативный                         | Совместимый с OpenAI       |
| -------------------------- | --------------------------------------- | -------------------------- |
| base\_url                  | `https://api.apiyi.com`                 | `https://api.apiyi.com/v1` |
| SDK                        | `google-genai`                          | `openai`                   |
| Управление рассуждением    | `thinking_level` / `thinking_budget`    | `reasoning_effort`         |
| Сводки / сигнатуры мыслей  | ✅                                       | ❌                          |
| Инструмент выполнения кода | ✅                                       | ❌                          |
| Входные медиа              | Нативные встроенные Parts (PIL / bytes) | Base64 image\_url          |
| Поле попадания в кэш       | `cached_content_token_count`            | `cached_tokens`            |

## Примечания

* **Files API не поддерживается** (`client.files.upload()`); медиа необходимо передавать inline, и **каждый файл должен быть меньше 20MB** — см. [Мультимодальность и выполнение кода](/ru/api-capabilities/gemini/multimodal)
* Скидки за кэширование и ожидаемый уровень попаданий: [Тарификация кэша](/ru/api-capabilities/gemini/prompt-caching)

## Связанные ссылки

* Эта группа: [Multimodal & Code Execution](/ru/api-capabilities/gemini/multimodal) · [Billing кэширования](/ru/api-capabilities/gemini/prompt-caching) · [Function Calling](/ru/api-capabilities/gemini/function-calling)
* Получение / управление tokens: `https://api.apiyi.com/token`
* Официальная документация Google: `ai.google.dev/gemini-api/docs`
