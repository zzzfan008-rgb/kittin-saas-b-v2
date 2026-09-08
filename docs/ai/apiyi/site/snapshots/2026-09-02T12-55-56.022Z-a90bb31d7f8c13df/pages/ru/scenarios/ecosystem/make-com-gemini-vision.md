> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Make.com + Gemini Image Understanding

> Используйте узел HTTP request в Make.com для вызова APIYI Gemini image understanding API, что позволяет автоматизировать анализ изображений, OCR и multimodal workflows без кода.

## Обзор

Make.com (ранее Integromat) — мощная платформа автоматизации без кода. Используя встроенный **узел HTTP-запроса (Make a request)**, вы можете напрямую вызывать APIYI Gemini native format API для понимания изображений, анализа контента и других мультимодальных сценариев автоматизации — без необходимости писать код.

<Info>
  **Информация об интеграции**

  * 🔧 Инструмент: Make.com (`make.com`)
  * 🔌 Интеграция: узел HTTP-запроса (Make a request)
  * 🤖 Модель: серия Gemini (через APIYI Gemini native format)
  * 📡 Эндпоинт API: `https://api.apiyi.com/v1beta/models/{model}:generateContent`
</Info>

## Почему Make.com + APIYI

<CardGroup cols={2}>
  <Card title="Интеграция без кода" icon="wand-sparkles">
    Настраивайте узлы HTTP-запросов с помощью визуального drag-and-drop, без необходимости писать код для вызова моделей ИИ
  </Card>

  <Card title="Автоматизированные рабочие процессы" icon="refresh-cw">
    Комбинируйте триггеры Make.com и условную логику, чтобы построить полноценную автоматизацию обработки изображений
  </Card>

  <Card title="Поддержка нескольких моделей" icon="layers">
    APIYI поддерживает более 400 моделей — один API key, чтобы переключаться между разными возможностями ИИ в Make.com
  </Card>

  <Card title="Гибкое расширение" icon="puzzle">
    Без труда подключайтесь к более чем 1000 приложений, включая Google Sheets, Slack, Email и другие
  </Card>
</CardGroup>

## Поддерживаемые модели APIYI

| Название модели        | ID модели                | Сценарий использования                       | Документация API                                              |
| ---------------------- | ------------------------ | -------------------------------------------- | ------------------------------------------------------------- |
| Gemini 3.1 Pro Preview | `gemini-3.1-pro-preview` | Понимание изображений, генерация текста      | [Посмотреть документацию](/ru/api-capabilities/gemini/native) |
| Gemini 3 Pro Preview   | `gemini-3-pro-preview`   | Понимание изображений, генерация изображений | [Посмотреть документацию](/ru/api-capabilities/gemini/native) |
| Gemini 3 Flash Preview | `gemini-3-flash-preview` | Понимание изображений (быстро)               | [Посмотреть документацию](/ru/api-capabilities/gemini/native) |

<Tip>
  Рекомендуется: `gemini-3.1-pro-preview` для самых широких возможностей понимания изображений. Для более высокой скорости выберите серию Flash.
</Tip>

## Шаги настройки

<Steps>
  <Step title="Шаг 1: Получите свой API-ключ APIYI">
    1. Перейдите в [консоль APIYI](https://api.apiyi.com), чтобы зарегистрироваться/войти
    2. Перейдите в раздел **Tokens** и сгенерируйте новый API-ключ
    3. Скопируйте ключ (начинается с `sk-`) — он понадобится вам для настройки
  </Step>

  <Step title="Шаг 2: Создайте сценарий в Make.com">
    1. Войдите в Make.com и нажмите **Создать новый сценарий**
    2. Нажмите **+**, чтобы добавить модуль
    3. Найдите и выберите модуль **HTTP**
    4. В разделе Actions выберите **Сделать запрос**
  </Step>

  <Step title="Шаг 3: Настройте узел HTTP-запроса">
    Заполните следующую конфигурацию в узле HTTP-запроса:

    **URL**:

    ```
    https://api.apiyi.com/v1beta/models/gemini-3.1-pro-preview:generateContent
    ```

    **Метод**: `POST`

    **Заголовки**:

    | Имя заголовка   | Значение                   |
    | --------------- | -------------------------- |
    | `Content-Type`  | `application/json`         |
    | `Authorization` | `Bearer sk-your-APIYI-key` |

    **Тип тела**: `Raw`

    **Тип содержимого**: `JSON (application/json)`

    **Содержимое запроса (Body)**:

    ```json theme={null}
    {
      "contents": [
        {
          "parts": [
            {
              "text": "What is in this image?"
            },
            {
              "fileData": {
                "mimeType": "image/png",
                "fileUri": "https://your-image-url-here"
              }
            }
          ]
        }
      ]
    }
    ```
  </Step>

  <Step title="Шаг 4: Тестовый запуск">
    Нажмите **Run once**, чтобы протестировать запрос и убедиться, что он возвращает корректные результаты анализа изображения.
  </Step>
</Steps>

## Полный пример запроса

Вот полный пример запроса на понимание изображения, который анализирует изображение выдры:

```json theme={null}
{
  "contents": [
    {
      "parts": [
        {
          "text": "What is in this image?"
        },
        {
          "fileData": {
            "mimeType": "image/png",
            "fileUri": "https://raw.githubusercontent.com/apiyi-api/ai-api-code-samples/refs/heads/main/Vision-API-OpenAI/otter.png"
          }
        }
      ]
    }
  ]
}
```

### Параметры запроса

| Поле                        | Тип    | Обязательно | Описание                                                            |
| --------------------------- | ------ | ----------- | ------------------------------------------------------------------- |
| `contents`                  | array  | Yes         | Массив содержимого беседы                                           |
| `contents[].parts`          | array  | Yes         | Части сообщения (текст + изображение)                               |
| `parts[].text`              | string | Yes         | Текстовый prompt пользователя                                       |
| `parts[].fileData.mimeType` | string | Yes         | Формат изображения: `image/png`, `image/jpeg`, `image/webp` и т. д. |
| `parts[].fileData.fileUri`  | string | Yes         | Публично доступный URL изображения                                  |

<Warning>
  `fileUri` должен быть **публично доступным** URL изображения. Если для изображения требуется аутентификация, сначала загрузите его в публичный сервис хранения.
</Warning>

## Практические сценарии

### Сценарий 1: Автоматический анализ изображений во вложениях писем

1. **Триггер**: Gmail - Watch emails (отслеживание новых писем)
2. **Процесс**: узел HTTP вызывает Gemini для анализа изображений
3. **Результат**: записывает результаты анализа в Google Sheets или отправляет в Slack

### Сценарий 2: Автоматическая разметка изображений товаров для электронной коммерции

1. **Триггер**: Google Drive - Watch files (отслеживание недавно загруженных изображений)
2. **Процесс**: узел HTTP анализирует содержимое изображения товара
3. **Результат**: автоматически добавляет теги категорий к изображениям товаров

### Сценарий 3: Модерация контента в социальных сетях

1. **Триггер**: периодически получает изображения, отправленные пользователями
2. **Процесс**: узел HTTP анализирует содержимое изображения на соответствие требованиям
3. **Результат**: автоматически помечает несоответствующий контент для проверки

## Продвинутые советы

### Динамическая замена URL изображений

В Make.com вы можете использовать выходные переменные из модулей предыдущих этапов, чтобы динамически заменять `fileUri` для пакетного анализа изображений:

```json theme={null}
{
  "contents": [
    {
      "parts": [
        {
          "text": "Please describe this image and extract any text in it"
        },
        {
          "fileData": {
            "mimeType": "image/png",
            "fileUri": "{{upstream module's image URL variable}}"
          }
        }
      ]
    }
  ]
}
```

### Переключение моделей

Чтобы переключить модель, просто измените имя модели в URL:

| Нужно                        | URL                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------- |
| Максимально точное понимание | `https://api.apiyi.com/v1beta/models/gemini-3.1-pro-preview:generateContent` |
| Быстрый анализ               | `https://api.apiyi.com/v1beta/models/gemini-3-flash-preview:generateContent` |

## Часто задаваемые вопросы

<AccordionGroup>
  <Accordion title="HTTP-запрос возвращает ошибку 401?">
    Проверьте:

    1. Формат заголовка Authorization: `Bearer sk-your-key` (обратите внимание на пробел после Bearer)
    2. API-ключ действителен (проверьте в консоли APIYI)
    3. Баланс аккаунта достаточен
  </Accordion>

  <Accordion title="Изображение не распознается или возвращает ошибку?">
    Проверьте:

    1. `fileUri` — это общедоступный URL (его можно открыть напрямую в браузере)
    2. `mimeType` соответствует фактическому формату изображения
    3. Размер изображения находится в пределах ограничений модели
  </Accordion>

  <Accordion title="Как обрабатывать ответ в Make.com?">
    Gemini API возвращает JSON-формат. Вы можете:

    1. Использовать модуль **JSON** в Make.com для разбора ответа
    2. Извлечь поле `candidates[0].content.parts[0].text` для результата анализа
    3. Передать результат последующим модулям (например, записать в базу данных, отправить уведомления)
  </Accordion>

  <Accordion title="Как получить APIYI API key?">
    Посетите [Консоль APIYI](https://api.apiyi.com/token), зарегистрируйте аккаунт и создайте новый ключ в разделе Tokens. Новые пользователи получают бесплатные тестовые кредиты.
  </Accordion>

  <Accordion title="Поддерживаются ли изображения в Base64?">
    Да. Замените `fileData` на `inlineData`:

    ```json theme={null}
    {
      "inlineData": {
        "mimeType": "image/png",
        "data": "Base64-encoded-image-data"
      }
    }
    ```
  </Accordion>
</AccordionGroup>

## Связанные ресурсы

<CardGroup cols={2}>
  <Card title="Документация по нативному формату Gemini" icon="book" href="/ru/api-capabilities/gemini/native">
    Просмотрите полную документацию по нативному формату API Gemini
  </Card>

  <Card title="APIYI API для понимания изображений" icon="eye" href="/ru/api-capabilities/vision-understanding">
    Просмотрите обзор возможностей APIYI для понимания изображений
  </Card>

  <Card title="Часто задаваемые вопросы" icon="circle-question-mark" href="/ru/faq/model-selection-guide">
    Получите дополнительную помощь в разделе часто задаваемых вопросов
  </Card>

  <Card title="Управление token в APIYI" icon="settings" href="https://api.apiyi.com/token">
    Управляйте API-ключами, просматривайте использование и баланс
  </Card>
</CardGroup>
