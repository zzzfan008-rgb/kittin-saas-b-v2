> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Fable 5.1

> Claude Fable 5.1 на APIYI: $10 за входные данные / $50 за выходные данные за 1 млн token, контекстное окно 1 000 000, максимальный объём вывода 128 000, доступна в 4 группах тарификации.

Первая итерация флагманской модели класса Mythos: цены на входные и выходные данные остаются прежними, а стоимость чтения из кэша снижается до четверти; входные и выходные данные хранятся в течение 30 дней для выявления злоупотреблений.

## Спецификации

| Позиция                   | Значение                                         |
| ------------------------- | ------------------------------------------------ |
| **Идентификатор модели**  | `claude-fable-5-1` · `claude-fable-5-1-thinking` |
| **Поставщик**             | Anthropic                                        |
| **Выпуск поставщика**     | 2026-09-01                                       |
| **Доступно на APIYI**     | 2026-09-02                                       |
| **Дата отсечения знаний** | Не раскрывается                                  |
| **Модальности ввода**     | Текст, изображение                               |
| **Модальности вывода**    | Текст                                            |
| **Контекстное окно**      | 1,000,000 tokens                                 |
| **Максимальный вывод**    | 128,000 tokens                                   |
| **Тарификация**           | На основе использования                          |

## Тарификация

Цены в USD за 1 млн tokens (\$/1M).

| Ввод | Кэшированный ввод | Вывод |
| ---- | ----------------- | ----- |
| \$10 | \$1               | \$50  |

<Info>В таблице указаны **публичные цены**. Акции на пополнение и скидки для групп **суммируются**; консоль в реальном времени отображает фактическое списание. См. разделы [Тарификация](/ru/pricing) и [Акции на пополнение](/ru/faq/recharge-promotions).</Info>

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

| Группа           | Коэффициент | Примечания                 |
| ---------------- | ----------- | -------------------------- |
| `ClaudeCode`     | 0.95×       | 95% от цены из прайс-листа |
| `Claude_Reverse` | 0.5×        | 50% от цены из прайс-листа |
| `Default`        | 1×          | Цена из прайс-листа        |
| `SVIP`           | 1×          | Цена из прайс-листа        |

Для некоторых групп предусмотрены дополнительные скидки, которые можно суммировать с бонусами за пополнение. См. раздел [Tokens и группы](/ru/faq/token-and-groups).

## Поддерживаемые функции

| Функция                           | Поддерживается       |
| --------------------------------- | -------------------- |
| Потоковая передача                | ✅                    |
| Вызов инструментов                | ✅                    |
| Структурированные выходные данные | ✅                    |
| Работа с изображениями            | ✅                    |
| Кэширование промптов              | ✅                    |
| Расширенное рассуждение           | Только при включении |

## Варианты

| Идентификатор модели        | Примечания                                                                                                     |
| --------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `claude-fable-5-1`          | Стандартный вызов.                                                                                             |
| `claude-fable-5-1-thinking` | Вариант с принудительным рассуждением; тарификация, эндпоинты и группы полностью идентичны стандартной модели. |

## Example request

The example below calls `claude-fable-5-1` through OpenAI Chat Completions (`/v1/chat/completions`). Point base\_url at `https://api.apiyi.com/v1` — everything else matches the official API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "claude-fable-5-1",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Read the key from an environment variable, never hard-coded. In production, issue separate tokens per use case so you can revoke and attribute usage individually.</Tip>

## Связанные документы

<CardGroup cols={2}>
  <Card title="Объявление о запуске" icon="megaphone" href="/en/news/claude-fable-5-1-launch">
    Сведения о контексте, результатах тестирования и заметки по миграции для Claude Fable 5.1
  </Card>

  <Card title="Основы Claude API" icon="book-open" href="/ru/api-capabilities/claude">
    Параметры, использование и рекомендации
  </Card>

  <Card title="Уровень усилий и рассуждение" icon="book-open" href="/ru/api-capabilities/claude-effort-thinking">
    Параметры, использование и рекомендации
  </Card>

  <Card title="Claude Fable 5" icon="git-compare" href="/ru/models/claude-fable-5">
    Сведения о модели из того же семейства
  </Card>

  <Card title="Claude Opus 5" icon="git-compare" href="/ru/models/claude-opus-5">
    Сведения о модели из того же семейства
  </Card>

  <Card title="Каталог цен на модели" icon="table" href="/en/models">
    Актуальные цены, эндпоинты и группы для всех моделей
  </Card>
</CardGroup>

<Note>Спецификации на этой странице поддерживаются вручную в `models/data/model-details.json`; цены и эндпоинты поступают из актуального API цен и обновляются при каждой пересборке.</Note>
