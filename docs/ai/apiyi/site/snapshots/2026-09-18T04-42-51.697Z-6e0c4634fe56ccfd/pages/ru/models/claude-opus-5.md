> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Opus 5

> Claude Opus 5 в APIYI: $5 за входные tokens / $25 за выходные tokens за 1M tokens, контекстное окно 1,000,000, максимальный вывод 128,000, доступно в 4 группах тарификации.

Флагман Anthropic: интеллект почти уровня Fable-5 по цене Opus 4.8, с контекстным окном 1M и thinking включённым по умолчанию.

## Specifications

| Item                   | Value                                      |
| ---------------------- | ------------------------------------------ |
| **Model ID**           | `claude-opus-5` · `claude-opus-5-thinking` |
| **Vendor**             | Anthropic                                  |
| **Vendor release**     | 2026-07-24                                 |
| **Available on APIYI** | 2026-07-25                                 |
| **Knowledge cutoff**   | Не разглашается                            |
| **Input modalities**   | Текст, Изображение                         |
| **Output modalities**  | Текст                                      |
| **Context window**     | 1,000,000 tokens                           |
| **Max output**         | 128,000 tokens                             |
| **Billing**            | По использованию                           |

## Тарифы

Цены в USD за 1M tokens (\$/1M).

| Вход | Кэшированный вход | Выход |
| ---- | ----------------- | ----- |
| \$5  | \$0.5             | \$25  |

<Info>Таблица показывает **базовые цены**. Акции на пополнение и групповые скидки **суммируются**; консоль отображает фактическое списание в реальном времени. См. [Тарифы](/ru/pricing) и [Акции на пополнение](/ru/faq/recharge-promotions).</Info>

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

| Группа           | Коэффициент | Примечания         |
| ---------------- | ----------- | ------------------ |
| `ClaudeCode`     | 0.95×       | 95% от прайс-листа |
| `Claude_Reverse` | 0.5×        | 50% от прайс-листа |
| `Default`        | 1×          | Прайс-лист         |
| `SVIP`           | 1×          | Прайс-лист         |

Для некоторых групп действуют дополнительные скидки, которые суммируются с бонусами за пополнение. См. [Tokens и группы](/ru/faq/token-and-groups).

## Поддерживаемые возможности

| Возможность                       | Поддерживается        |
| --------------------------------- | --------------------- |
| Потоковая передача                | ✅                     |
| Вызов tools                       | ✅                     |
| Структурированные выходные данные | ✅                     |
| Vision                            | ✅                     |
| Кэширование промптов              | ✅                     |
| Расширенное рассуждение           | Включено по умолчанию |
| Веб-поиск                         | ✅                     |

## Варианты

| Идентификатор модели     | Примечания                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| `claude-opus-5`          | Обычный вызов. Если не указывать параметр thinking, запускается адаптивное рассуждение.      |
| `claude-opus-5-thinking` | Вариант с принудительным thinking; тарификация и эндпоинты совпадают со стандартной моделью. |

## Пример запроса

Пример ниже вызывает `claude-opus-5` через OpenAI Chat Completions (`/v1/chat/completions`). Укажите base\_url на `https://api.apiyi.com/v1` — все остальное совпадает с официальным API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "claude-opus-5",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Читайте ключ из переменной окружения, а не встраивайте его в код. В production выдавайте отдельные token для каждого сценария использования, чтобы вы могли отзывать их и атрибутировать использование по отдельности.</Tip>

## Связанные документы

<CardGroup cols={2}>
  <Card title="Объявление о запуске" icon="megaphone" href="/en/news/claude-opus-5-launch">
    Сведения о предыстории, результатах тестов и миграции для Claude Opus 5
  </Card>

  <Card title="Основы Claude API" icon="book-open" href="/ru/api-capabilities/claude">
    Параметры, использование и рекомендации
  </Card>

  <Card title="Уровень усилий и рассуждение" icon="book-open" href="/ru/api-capabilities/claude-effort-thinking">
    Параметры, использование и рекомендации
  </Card>

  <Card title="Кэширование промптов" icon="book-open" href="/ru/api-capabilities/claude-prompt-caching">
    Параметры, использование и рекомендации
  </Card>

  <Card title="Claude Sonnet 5" icon="git-compare" href="/ru/models/claude-sonnet-5">
    Сведения о модели из того же семейства
  </Card>

  <Card title="Claude Fable 5" icon="git-compare" href="/ru/models/claude-fable-5">
    Сведения о модели из того же семейства
  </Card>

  <Card title="Claude Opus 4.8" icon="git-compare" href="/ru/models/claude-opus-4-8">
    Сведения о модели из того же семейства
  </Card>

  <Card title="Каталог тарифов моделей" icon="table" href="/en/models">
    Актуальные тарифы, эндпоинты и группы для всех моделей
  </Card>
</CardGroup>

<Note>Спецификации на этой странице поддерживаются вручную в `models/data/model-details.json`; тарифы и эндпоинты поступают из актуального API тарификации и обновляются при каждой пересборке.</Note>
