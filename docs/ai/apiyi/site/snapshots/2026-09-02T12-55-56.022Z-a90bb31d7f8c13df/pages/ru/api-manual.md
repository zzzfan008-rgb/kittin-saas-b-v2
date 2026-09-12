> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Руководство по API

> Руководство по использованию APIYI. APIYI — шлюз ИИ, совместимый с OpenAI, — один набор кода подключает вас к более чем 400 основным крупным моделям. Эта страница поможет вам находить модели, тестировать онлайн и быстро интегрировать их.

APIYI — это **совместимый с OpenAI AI-шлюз**: один стандартный интерфейс и один API Key позволяют вам вызывать более 400 основных больших моделей. Эта страница — навигационный центр: она помогает вам быстро найти **какую модель использовать**, **проверить эндпоинты онлайн** и узнать, **как интегрировать**.

## Обзор платформы

### Режим совместимости с OpenAI

APIYI использует **формат, совместимый с OpenAI**. Когда всё заработает, при смене моделей нужно лишь изменить **поле `model`** — всё остальное остаётся тем же:

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

# Switching models = change only the `model` field, nothing else
response = client.chat.completions.create(
    model="gpt-5-chat-latest",   # swap in any supported model name
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)
```

<Note>
  Для точных названий моделей, цен и рекомендуемых сценариев использования см. две отдельные страницы ниже в разделе «Выберите модель». Мы не приводим их здесь, чтобы не публиковать устаревшую информацию.
</Note>

### Поддерживаемые возможности

<CardGroup cols={2}>
  <Card title="Поддерживается" icon="circle-check">
    * Chat Completions
    * Генерация изображений / видео
    * Транскрибация речи (Whisper)
    * Embeddings
    * Function Calling
    * Потоковая передача вывода (SSE)
    * Стандартные параметры OpenAI: `temperature`, `top_p`, `max_tokens`, и т. д.
    * эндпоинт Responses
  </Card>

  <Card title="Не поддерживается" icon="circle-x">
    * Fine-tuning
    * Управление файлами
    * Управление организацией
    * Управление тарификацией
  </Card>
</CardGroup>

## Выберите модель

Не уверены, какую модель использовать? Эти две страницы регулярно обновляются с учетом цен, сравнения возможностей и рекомендаций:

<CardGroup cols={2}>
  <Card title="Текстовые / мультимодальные модели" icon="sparkles" href="/ru/api-capabilities/model-info">
    Возможности, цены и рекомендации по выбору для GPT, Claude, Gemini, Grok, DeepSeek, Qwen, Kimi, GLM и других.
  </Card>

  <Card title="Модели для изображений / видео" icon="image" href="/ru/api-capabilities/image-video-models">
    Модели для изображений, такие как Nano Banana, GPT-image, Seedream и Flux, а также модели для видео, такие как VEO, Sora и Wan — цены и использование.
  </Card>
</CardGroup>

## Основная информация

### Эндпоинты API

* **Основной**: `https://api.apiyi.com/v1`
* **Резервный**: `https://vip.apiyi.com/v1`

### Аутентификация

Каждый запрос должен содержать ваш API Key в заголовке:

```http theme={null}
Authorization: Bearer YOUR_API_KEY
```

### Формат запроса

* **Content-Type**: `application/json`
* **Encoding**: UTF-8
* **Method**: `POST` для большинства эндпоинтов

## Быстрый старт

### Получите ключ API

1. Перейдите в [консоль APIYI](https://api.apiyi.com/token) и войдите в систему
2. На странице управления token нажмите «Добавить», чтобы создать ключ API
3. Скопируйте сгенерированный ключ для использования в ваших запросах

### Получите примеры кода на нескольких языках

В консоли есть встроенные, готовые к запуску примеры кода для многих языков, которые обновляются синхронно с последней версией API — **используйте их в первую очередь**:

1. Перейдите на [страницу управления token](https://api.apiyi.com/token)
2. В строке нужного ключа API нажмите значок гаечного ключа 🔧 в столбце «Действия»
3. Выберите «Пример запроса», чтобы посмотреть полные примеры на cURL, Python, Node.js, Java, C#, Go, PHP, Ruby и других языках

<img src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/apiyi-token-simple-code.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=067d8d551cd1d8aaebb833932e6632a5" alt="APIYI управление token - примеры запросов" width="1496" height="902" data-path="images/apiyi-token-simple-code.png" />

## Онлайн-тестирование (Playground)

Раздел «Справочник API» предоставляет **онлайн Playground**: введите ваш ключ API, чтобы отправлять запросы и просматривать ответы в реальном времени напрямую — код не требуется.

<CardGroup cols={3}>
  <Card title="Завершения чата" icon="messages-square" href="/en/api-reference/chat/chat-completions">
    `POST /v1/chat/completions` — основной чатовый и мультимодальный эндпоинт.
  </Card>

  <Card title="Список моделей" icon="list" href="/en/api-reference/models/list-models">
    `GET /v1/models` — запросить доступные в настоящее время модели.
  </Card>

  <Card title="Эмбеддинги" icon="braces" href="/en/api-reference/embeddings/create-embeddings">
    `POST /v1/embeddings` — векторизация текста.
  </Card>
</CardGroup>

<Note>
  Playground для эндпоинтов генерации изображений и видео доступны на соответствующих страницах моделей (см. страницу модели image / video в разделе «Выберите модель» выше).
</Note>

## Минимальный пример

Самый распространенный эндпоинт — Chat Completions — скопируйте и запустите. Для дополнительных параметров и языков используйте Playground выше или «Request Example» в консоли:

<Tabs>
  <Tab title="Python (SDK)">
    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(
        api_key="YOUR_API_KEY",
        base_url="https://api.apiyi.com/v1"
    )

    response = client.chat.completions.create(
        model="gpt-5-chat-latest",
        messages=[
            {"role": "system", "content": "You are a helpful AI assistant."},
            {"role": "user", "content": "Hello! Please introduce yourself."}
        ],
        temperature=0.7,
        max_tokens=1000
    )

    print(response.choices[0].message.content)
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={null}
    curl -X POST "https://api.apiyi.com/v1/chat/completions" \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "gpt-5-chat-latest",
        "messages": [
          {"role": "system", "content": "You are a helpful AI assistant."},
          {"role": "user", "content": "Hello! Please introduce yourself."}
        ],
        "temperature": 0.7,
        "max_tokens": 1000
      }'
    ```
  </Tab>
</Tabs>

## Потоковый ответ

Установите `stream: true` в запросе, и ответ будет возвращаться по частям в виде Server-Sent Events (SSE) — идеально для вывода в стиле печатной машинки:

```python theme={null}
stream = client.chat.completions.create(
    model="gpt-5-chat-latest",
    messages=[{"role": "user", "content": "Tell a short joke"}],
    stream=True
)

for chunk in stream:
    content = chunk.choices[0].delta.content or ""
    print(content, end="", flush=True)
```

Каждая строка SSE начинается с `data: `, а финальная строка `data: [DONE]` сигнализирует об окончании.

## Обработка ошибок

Эндпоинты используют формат ошибок OpenAI:

```json theme={null}
{
  "error": {
    "message": "Invalid API key provided",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```

Распространенные коды ошибок:

| Код ошибки              | HTTP статус | Описание                           |
| ----------------------- | ----------- | ---------------------------------- |
| invalid\_api\_key       | 401         | Недействительный API key           |
| insufficient\_quota     | 429         | Недостаточный баланс               |
| model\_not\_found       | 404         | Модель не существует               |
| invalid\_request\_error | 400         | Недействительные параметры запроса |
| rate\_limit\_exceeded   | 429         | Слишком высокая частота запросов   |
| server\_error           | 500         | Внутренняя ошибка сервера          |

<Tip>
  Реализуйте экспоненциальную задержку повторных попыток: при 429 / 500 повторяйте запрос с удвоением интервалов, чтобы значительно повысить стабильность. Храните ваш API Key в переменных окружения — никогда не встраивайте его в код жестко.
</Tip>

Приведенная выше таблица лишь показывает, что означает каждый код. **Конкретная причина указана в `error.message` в теле ответа** — и этот текст возвращается ровно один раз, в API-ответе; бэкенд-лог его не сохраняет. Всегда выводите его полностью и сохраняйте на стороне клиента:

<Card title="Сбор подробностей об ошибке API" icon="clipboard-list" href="/ru/api-manual/error-reporting">
  Почему вам нужно самостоятельно выводить необработанную ошибку, корректные шаблоны захвата для каждого языка, 7 полей, которые нужно сохранить, и шаблон обращения в службу поддержки, который можно вставить и использовать сразу
</Card>

## Лимиты запросов

| Тип лимита                | По умолчанию | Описание                             |
| ------------------------- | ------------ | ------------------------------------ |
| RPM (requests per minute) | 3000         | Для каждого API key                  |
| TPM (tokens per minute)   | 1000000      | Для каждого API key                  |
| Параллельные запросы      | 100          | Запросы, обрабатываемые одновременно |

При превышении лимитов возвращается `429`. Пожалуйста, соблюдайте соответствующую частоту запросов.

## Нужна помощь?

<CardGroup cols={2}>
  <Card title="Выберите модель" icon="sparkles" href="/ru/api-capabilities/model-info">
    Рекомендации по моделям для текста / мультимодальности и цены.
  </Card>

  <Card title="Проверьте онлайн" icon="play" href="/en/api-reference/chat/chat-completions">
    Откройте песочницу API Reference и отправляйте запросы напрямую.
  </Card>
</CardGroup>

* Посетите сайт: [api.apiyi.com](https://api.apiyi.com)
* Электронная почта технической поддержки: `support@apiyi.com`
