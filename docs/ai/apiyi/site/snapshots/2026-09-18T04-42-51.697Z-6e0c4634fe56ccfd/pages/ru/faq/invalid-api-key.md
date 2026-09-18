> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Почему мой API Key недействителен?

> Устраните ошибки с недействительным API Key и узнайте правильную настройку Base URL и API Key

## Распространенные симптомы ошибок

Когда вы видите сообщения об ошибке вроде этого:

```json theme={null}
{
  "error": {
    "message": "Incorrect API key provided: sk-QqHvK***...",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```

Это обычно означает **НЕ** то, что ваш API Key неверен, а то, что **Base URL** настроен неверно.

<Warning>
  **Самая распространенная ошибка**: использование Key от APIYI, но отправка запросов на официальный эндпоинт OpenAI `https://api.openai.com`
</Warning>

## Что такое Base URL?

**Base URL** (Base URL / адрес запроса) — это адрес целевого сервера для API-запросов. Разные поставщики API-сервисов используют разные Base URL.

### Base URL и API Key должны совпадать

| Провайдер услуг        | Base URL                 | Формат API Key  | Совпадает?    |
| ---------------------- | ------------------------ | --------------- | ------------- |
| **APIYI**              | `https://api.apiyi.com`  | `sk-xxxx......` | ✅ Верно       |
| **Официальный OpenAI** | `https://api.openai.com` | `sk-xxxx......` | ✅ Верно       |
| ❌ APIYI Key            | `https://api.openai.com` | `sk-xxxx......` | ❌ **Неверно** |
| ❌ OpenAI Key           | `https://api.apiyi.com`  | `sk-xxxx......` | ❌ **Неверно** |

<Info>
  **Ключевой принцип**: Используйте Base URL, который соответствует провайдеру вашего API Key.
</Info>

## Корректная конфигурация

### Способ 1: Измените Base URL (рекомендуется)

Просто замените endpoint OpenAI на APIYI, оставьте все остальное без изменений:

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="sk-your-apiyi-key",  # Get Key from APIYI dashboard
      base_url="https://api.apiyi.com/v1"  # Change to APIYI address
  )

  response = client.chat.completions.create(
      model="gpt-4o",
      messages=[{"role": "user", "content": "Hello"}]
  )
  ```

  ```javascript JavaScript/Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'sk-your-apiyi-key',  // Get Key from APIYI dashboard
    baseURL: 'https://api.apiyi.com/v1'  // Change to APIYI address
  });

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Hello' }]
  });
  ```

  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer sk-your-apiyi-key" \
    -d '{
      "model": "gpt-4o",
      "messages": [{"role": "user", "content": "Hello"}]
    }'
  ```
</CodeGroup>

### Способ 2: Используйте переменные среды

Установите переменные среды, чтобы вам не нужно было указывать Base URL в коде:

<CodeGroup>
  ```bash Linux/macOS theme={null}
  export OPENAI_API_KEY="sk-your-apiyi-key"
  export OPENAI_BASE_URL="https://api.apiyi.com/v1"
  ```

  ```powershell Windows PowerShell theme={null}
  $env:OPENAI_API_KEY="sk-your-apiyi-key"
  $env:OPENAI_BASE_URL="https://api.apiyi.com/v1"
  ```

  ```cmd Windows CMD theme={null}
  set OPENAI_API_KEY=sk-your-apiyi-key
  set OPENAI_BASE_URL=https://api.apiyi.com/v1
  ```
</CodeGroup>

## Поддерживаемые форматы Base URL

APIYI поддерживает три формата Base URL в зависимости от вашего кода:

<Tabs>
  <Tab title="Формат 1: С /v1 (рекомендуется)">
    ```
    https://api.apiyi.com/v1
    ```

    **Сценарий использования**: Большинство библиотек автоматически добавляют к Base URL определенные пути

    **Полные примеры запросов**:

    ```
    https://api.apiyi.com/v1/chat/completions
    https://api.apiyi.com/v1/models
    ```
  </Tab>

  <Tab title="Формат 2: С /v1/ (завершающий слэш)">
    ```
    https://api.apiyi.com/v1/
    ```

    **Сценарий использования**: Некоторые фреймворки требуют, чтобы Base URL заканчивался слэшем

    **Полные примеры запросов**:

    ```
    https://api.apiyi.com/v1/chat/completions
    https://api.apiyi.com/v1/models
    ```
  </Tab>

  <Tab title="Формат 3: Полный путь">
    ```
    https://api.apiyi.com/v1/chat/completions
    ```

    **Сценарий использования**: Прямое использование полного API эндпоинта (например, запросов cURL)

    <Note>
      Этот подход обычно используется для запросов cURL или сырых HTTP-запросов через библиотеку, Base URL задавать не нужно
    </Note>
  </Tab>
</Tabs>

## Устранение неполадок

<AccordionGroup>
  <Accordion title="Я подтвердил, что Base URL указан верно, но ошибки все равно возникают">
    **Возможные причины**:

    1. **Несколько точек настройки**: проверьте, не задан ли Base URL в конфигурационных файлах, переменных среды, инициализации кода и т. д.
    2. **Прокси или middleware**: некоторые инструменты прокси могут перенаправлять запросы
    3. **Проблемы с кэшем**: перезапустите программу или очистите кэш и повторите попытку
    4. **Опечатка**: убедитесь, что `apiyi` написано правильно (не `apiyii` и не `apiyl`)
  </Accordion>

  <Accordion title="Как проверить, что мой Key действителен?">
    Проверьте в панели APIYI:

    1. Войдите в панель APIYI `console.apiyi.com`
    2. Откройте страницу "Tokens"
    3. Проверьте, что статус Key — "Enabled"
    4. Убедитесь, что на аккаунте достаточно баланса
  </Accordion>

  <Accordion title="Как настроить сторонние инструменты (например, ChatBox, OpenCat)?">
    В большинстве сторонних инструментов есть параметры "Custom API" или "Self-hosted Server":

    * **Адрес API / Base URL**: `https://api.apiyi.com/v1`
    * **API Key**: скопируйте свой ключ из панели APIYI
    * **Model Name**: сверяйтесь со списком моделей в документации APIYI

    <Tip>
      Параметры настройки обычно находятся в разделах "Settings" → "API" или "Server"
    </Tip>
  </Accordion>

  <Accordion title="Где найти примеры кода?">
    APIYI предоставляет полные примеры кода на нескольких языках:

    1. **Документация Quick Start**: Главная страница → Примеры кода
    2. **Онлайн-инструмент для тестирования**: Панель → ApiFox Online Testing
    3. **Репозиторий GitHub**: `github.com/apiyi/docs` → каталог knowledge-base
  </Accordion>
</AccordionGroup>

## Неверные и правильные примеры

<CardGroup cols={2}>
  <Card title="❌ Неверная конфигурация" icon="x" color="#ef4444">
    ```python theme={null}
    client = OpenAI(
        api_key="sk-apiyi-key",
        base_url="https://api.openai.com/v1"
        # ❌ Using OpenAI official endpoint
    )
    ```

    **Результат**: Сервер OpenAI отклонит ключ APIYI
  </Card>

  <Card title="✅ Правильная конфигурация" icon="check" color="#10b981">
    ```python theme={null}
    client = OpenAI(
        api_key="sk-apiyi-key",
        base_url="https://api.apiyi.com/v1"
        # ✅ Using APIYI endpoint
    )
    ```

    **Результат**: Запрос успешно отправлен на сервер APIYI
  </Card>
</CardGroup>

## Метод быстрой проверки

Используйте команду cURL, чтобы быстро проверить вашу конфигурацию:

```bash theme={null}
curl https://api.apiyi.com/v1/models \
  -H "Authorization: Bearer sk-your-apiyi-key"
```

**Ожидаемый результат**: Возвращает список доступных моделей

```json theme={null}
{
  "data": [
    {
      "id": "gpt-4o",
      "object": "model",
      ...
    }
  ]
}
```

Если вы получаете ошибку, проверьте:

1. API Key скопирован правильно (обратите внимание на пробелы в начале/конце)
2. Сетевое подключение работает
3. На аккаунте достаточно баланса

## Сопутствующая документация

* [Руководство по быстрому старту](/ru/getting-started)
* [Руководство по API](/ru/api-manual)
* [Почему я не могу использовать API при оставшемся балансе?](/ru/faq/balance-insufficient)
* [Список поддерживаемых моделей](/ru/api-capabilities/model-info)

<Tip>
  **Помните основной принцип**: Сопоставьте URL с провайдером ключа. Ключ APIYI использует `https://api.apiyi.com/v1`
</Tip>
