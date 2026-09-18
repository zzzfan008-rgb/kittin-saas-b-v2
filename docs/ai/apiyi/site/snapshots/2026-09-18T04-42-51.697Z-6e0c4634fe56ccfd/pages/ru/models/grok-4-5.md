> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 4.5

> Grok 4.5 на APIYI: $2 за входные данные / $6 за выходные данные за 1M tokens, контекст 500 000, доступен в 3 группах тарификации.

Совместно обученная с Cursor: превосходит агентные бенчмарки вызова инструментов примерно в 4,2 раза по эффективности выходных token по сравнению с Opus 4.8.

## Характеристики

| Item                     | Value                  |
| ------------------------ | ---------------------- |
| **Идентификатор модели** | `grok-4.5`             |
| **Vendor**               | xAI                    |
| **Доступно в APIYI**     | 2026-07-10             |
| **Ограничение знаний**   | Не раскрывается        |
| **Входные модальности**  | Text, Image            |
| **Выходные модальности** | Text                   |
| **Контекстное окно**     | 500,000 tokens         |
| **Тарификация**          | По факту использования |

## Цены

Цены в USD за 1M token (\$/1M).

| Вход | Кэшированный вход | Выход |
| ---- | ----------------- | ----- |
| \$2  | \$0.5             | \$6   |

<Info>Таблица показывает **списочные цены**. Промоакции на пополнение и групповые скидки **суммируются**; консоль в реальном времени отражает фактическое списание. См. [Цены](/ru/pricing) и [Промоакции на пополнение](/ru/faq/recharge-promotions).</Info>

## Многоуровневая тарификация

Для этой модели действует многоуровневая тарификация в зависимости от размера token каждого запроса (цена вывода = входная цена уровня × коэффициент для вывода):

* 0 – 204,800 tokens: \$2/1M input
* Свыше 204,800 tokens: \$4/1M input

## Эндпоинты

| Эндпоинт                  | Путь                                          | Поддерживается |
| ------------------------- | --------------------------------------------- | -------------- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅              |
| `OpenAI Responses`        | `POST /v1/responses`                          | ✅              |
| `Anthropic Messages`      | `POST /v1/messages`                           | —              |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —              |
| `Image Generations`       | `POST /v1/images/generations`                 | —              |
| `Embeddings`              | `POST /v1/embeddings`                         | —              |

## Группы тарификации

| Группа           | Коэффициент | Примечания     |
| ---------------- | ----------- | -------------- |
| `CodexResponses` | 1×          | Цена по прайсу |
| `Default`        | 1×          | Цена по прайсу |
| `SVIP`           | 1×          | Цена по прайсу |

Некоторые группы предоставляют дополнительные скидки, суммируемые с бонусами за пополнение. См. [tokens и группы](/ru/faq/token-and-groups).

## Поддерживаемые возможности

| Возможность              | Поддерживается        |
| ------------------------ | --------------------- |
| Потоковая передача       | ✅                     |
| Вызов tools              | ✅                     |
| Структурированные ответы | ✅                     |
| Vision                   | ✅                     |
| Кэширование промптов     | ✅                     |
| Расширенное рассуждение  | Включено по умолчанию |
| Поиск в Web              | ✅                     |
| Выполнение кода          | ✅                     |

## Пример запроса

Пример ниже вызывает `grok-4.5` через OpenAI Chat Completions (`/v1/chat/completions`). Укажите base\_url на `https://api.apiyi.com/v1` — все остальное соответствует официальному API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "grok-4.5",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Читайте ключ из переменной окружения, никогда не встраивайте его в код. В рабочей среде выдавайте отдельные token для каждого сценария использования, чтобы можно было отзывать их и учитывать использование по отдельности.</Tip>

## Связанные документы

<CardGroup cols={2}>
  <Card title="Объявление о запуске" icon="megaphone" href="/en/news/grok-4-5-launch">
    Контекст, результаты тестов и примечания по миграции для Grok 4.5
  </Card>

  <Card title="Обзор Grok" icon="book-open" href="/ru/api-capabilities/grok/overview">
    Параметры, использование и рекомендации
  </Card>

  <Card title="Чат и рассуждение" icon="book-open" href="/ru/api-capabilities/grok/chat">
    Параметры, использование и рекомендации
  </Card>

  <Card title="Grok 4.6" icon="git-compare" href="/ru/models/grok-4-6">
    Сведения о модели из того же семейства
  </Card>

  <Card title="Grok 4.3" icon="git-compare" href="/ru/models/grok-4-3">
    Сведения о модели из того же семейства
  </Card>

  <Card title="Каталог цен на модели" icon="table" href="/en/models">
    Актуальные цены, эндпоинты и группы для всех моделей
  </Card>
</CardGroup>

<Note>Спецификации на этой странице поддерживаются вручную в `models/data/model-details.json`; цены и эндпоинты поступают из API актуальных цен и обновляются при каждой пересборке.</Note>
