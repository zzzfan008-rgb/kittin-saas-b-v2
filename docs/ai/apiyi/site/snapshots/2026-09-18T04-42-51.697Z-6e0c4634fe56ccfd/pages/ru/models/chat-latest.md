> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# chat-latest

> chat-latest на APIYI: $5 за input / $30 за output на 1M tokens, 400,000 контекст, 128,000 max output, доступно в 2 группах тарификации.

Роллинг-алиас OpenAI, который всегда указывает на модель, которая в данный момент обеспечивает работу ChatGPT — сегодня GPT-5.5 Instant.

## Спецификации

| Параметр                  | Значение               |
| ------------------------- | ---------------------- |
| **Идентификатор модели**  | `chat-latest`          |
| **Поставщик**             | OpenAI                 |
| **Доступно в APIYI**      | 2026-05-21             |
| **Дата отсечения знаний** | 2025-08                |
| **Модальности ввода**     | Text, Image            |
| **Модальности вывода**    | Text                   |
| **Контекстное окно**      | 400,000 tokens         |
| **Макс. вывод**           | 128,000 tokens         |
| **Тарификация**           | По факту использования |

## Цены

Цены в USD за 1M tokens (\$/1M).

| Input | Cached input | Output |
| ----- | ------------ | ------ |
| \$5   | \$0.5        | \$30   |

<Info>В таблице указаны **прайс-листовые цены**. Акции на пополнение и групповые скидки **суммируются**; консоль отображает фактическую тарификацию в реальном времени. См. [Pricing](/ru/pricing) и [Акции на пополнение](/ru/faq/recharge-promotions).</Info>

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

| Группа    | Коэффициент | Примечания          |
| --------- | ----------- | ------------------- |
| `Default` | 1×          | Цена по прайс-листу |
| `SVIP`    | 1×          | Цена по прайс-листу |

Некоторые группы предусматривают дополнительные скидки, которые можно суммировать с бонусами за пополнение. См. [Tokens и группы](/ru/faq/token-and-groups).

## Поддерживаемые функции

| Функция                           | Поддерживается |
| --------------------------------- | -------------- |
| Потоковая передача                | ✅              |
| Вызов tools                       | ✅              |
| Структурированные выходные данные | ✅              |
| Vision                            | ✅              |
| Кэширование промптов              | ✅              |
| Веб-поиск                         | ✅              |
| Выполнение кода                   | ✅              |
| Fine-tuning                       | —              |

## Пример запроса

Пример ниже обращается к `chat-latest` через OpenAI Chat Completions (`/v1/chat/completions`). Укажите base\_url на `https://api.apiyi.com/v1` — все остальное соответствует официальному API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "chat-latest",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Считывайте ключ из переменной окружения, никогда не задавайте его жестко в коде. В рабочей среде выдавайте отдельные token для каждого сценария использования, чтобы можно было отзывать их и отдельно учитывать использование.</Tip>

## Связанные документы

<CardGroup cols={2}>
  <Card title="Объявление о запуске" icon="megaphone" href="/en/news/chat-latest-launch">
    Сведения о предыстории, результатах сравнительного тестирования и миграции для chat-latest
  </Card>

  <Card title="Совместимый режим" icon="book-open" href="/ru/api-capabilities/openai/compatible">
    Параметры, использование и рекомендации
  </Card>

  <Card title="Каталог цен на модели" icon="table" href="/en/models">
    Актуальные цены, эндпоинты и группы для всех моделей
  </Card>
</CardGroup>

<Note>Спецификации на этой странице поддерживаются вручную в `models/data/model-details.json`; цены и эндпоинты поступают из актуального API цен и обновляются при каждой пересборке.</Note>
