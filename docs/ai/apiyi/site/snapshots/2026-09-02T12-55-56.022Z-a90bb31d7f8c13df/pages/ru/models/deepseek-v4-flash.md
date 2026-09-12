> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash

> DeepSeek V4 Flash на APIYI: $0.44 за 1M tokens вход / $1.32 за 1M tokens выход, контекст 1,048,576, максимальный output 393,216, доступен в 4 группах тарификации.

Модель MoE с общим объёмом 284B / 13B активных, созданная для высокой параллельности и низкой задержки; неявное кэширование не требует настройки и обеспечивает почти полные попадания начиная со второго сообщения.

## Характеристики

| Параметр               | Значение               |
| ---------------------- | ---------------------- |
| **Model ID**           | `deepseek-v4-flash`    |
| **Vendor**             | DeepSeek               |
| **Доступно на APIYI**  | 2026-04-24             |
| **Ограничение знаний** | Не раскрывается        |
| **Модальности ввода**  | Текст                  |
| **Модальности вывода** | Текст                  |
| **Контекстное окно**   | 1,048,576 tokens       |
| **Макс. вывод**        | 393,216 tokens         |
| **Тарификация**        | По факту использования |

## Цены

Цены в USD за 1M tokens (\$/1M).

| Вход   | Кэшированный вход | Выход  |
| ------ | ----------------- | ------ |
| \$0.44 | \$0.01408         | \$1.32 |

<Info>Таблица показывает **базовые цены**. Акции на пополнение и групповые скидки **суммируются**; консоль в реальном времени отражает фактическое списание. См. [Цены](/ru/pricing) и [Акции на пополнение](/ru/faq/recharge-promotions).</Info>

## Эндпоинты

| Эндпоинт                  | Путь                                          | Поддерживается |
| ------------------------- | --------------------------------------------- | -------------- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅              |
| `OpenAI Responses`        | `POST /v1/responses`                          | —              |
| `Anthropic Messages`      | `POST /v1/messages`                           | ✅              |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —              |
| `Image Generations`       | `POST /v1/images/generations`                 | —              |
| `Embeddings`              | `POST /v1/embeddings`                         | —              |

## Группы тарификации

| Группа           | Коэффициент тарифа | Примечания            |
| ---------------- | ------------------ | --------------------- |
| `ClaudeCode`     | 0.95×              | 95% от цены по списку |
| `CodexResponses` | 1×                 | Цена по списку        |
| `Default`        | 1×                 | Цена по списку        |
| `SVIP`           | 1×                 | Цена по списку        |

Некоторые группы предусматривают дополнительные скидки, которые суммируются с бонусами за пополнение. См. [Токены и группы](/ru/faq/token-and-groups).

## Поддерживаемые возможности

| Возможность                       | Поддерживается |
| --------------------------------- | -------------- |
| Потоковая передача                | ✅              |
| Вызов tools                       | ✅              |
| Структурированные выходные данные | —              |
| Кэширование промптов              | ✅              |
| Расширенное рассуждение           | По желанию     |
| Веб-поиск                         | —              |

## Пример запроса

Пример ниже вызывает `deepseek-v4-flash` через OpenAI Chat Completions (`/v1/chat/completions`). Укажите base\_url на `https://api.apiyi.com/v1` — всё остальное соответствует официальному API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "deepseek-v4-flash",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Читайте ключ из переменной окружения, никогда не встраивайте его в код. В production выпускайте отдельные token для каждого сценария использования, чтобы вы могли отзывать их и учитывать использование по отдельности.</Tip>

## Связанные документы

<CardGroup cols={2}>
  <Card title="Анонс запуска" icon="megaphone" href="/en/news/deepseek-v4-flash-ga-launch">
    Сведения о предыстории, результатах тестов и заметки по миграции для DeepSeek V4 Flash
  </Card>

  <Card title="Обзор" icon="book-open" href="/ru/api-capabilities/deepseek-v4-flash/overview">
    Параметры, использование и рекомендации
  </Card>

  <Card title="DeepSeek V4 Pro" icon="git-compare" href="/ru/models/deepseek-v4-pro">
    Сведения о модели из того же семейства
  </Card>

  <Card title="Каталог цен на модели" icon="table" href="/en/models">
    Актуальные цены, эндпоинты и группы для всех 283 моделей
  </Card>
</CardGroup>

<Note>Характеристики на этой странице поддерживаются вручную в `models/data/model-details.json`; цены и эндпоинты поступают из API актуальных цен, обновлено 2026-08-31 11:46 (UTC+8), характеристики в последний раз проверены 2026-08-17.</Note>
