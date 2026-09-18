> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Opus 4.8

> Claude Opus 4.8 в APIYI: $5 за входные данные / $25 за выходные данные за 1M tokens, контекстное окно 200,000, доступно в 4 группах тарификации.

Предыдущий флагман Opus: 69.2% в агентном кодировании, с пятью уровнями effort и динамическими рабочими процессами.

## Спецификации

| Пункт                     | Значение                                       |
| ------------------------- | ---------------------------------------------- |
| **ID модели**             | `claude-opus-4-8` · `claude-opus-4-8-thinking` |
| **Поставщик**             | Anthropic                                      |
| **Доступно в APIYI**      | 2026-05-28                                     |
| **Дата отсечения знаний** | Не раскрывается                                |
| **Модальности ввода**     | Text, Image                                    |
| **Модальности вывода**    | Text                                           |
| **Контекстное окно**      | 200,000 tokens                                 |
| **Тарификация**           | По факту использования                         |

## Тарифы

Цены в USD за 1M tokens (\$/1M).

| Вход | Кэшированный вход | Выход |
| ---- | ----------------- | ----- |
| \$5  | \$0.5             | \$25  |

<Info>Таблица показывает **базовые цены**. Акции пополнения и скидки группы **суммируются**; консоль отражает фактическое списание в реальном времени. См. [Pricing](/ru/pricing) и [Акции пополнения](/ru/faq/recharge-promotions).</Info>

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

| Группа           | Коэффициент тарифа | Примечания                 |
| ---------------- | ------------------ | -------------------------- |
| `ClaudeCode`     | 0.95×              | 95% от цены по прайс-листу |
| `Claude_Reverse` | 0.5×               | 50% от цены по прайс-листу |
| `Default`        | 1×                 | Цена по прайс-листу        |
| `SVIP`           | 1×                 | Цена по прайс-листу        |

Некоторые группы предоставляют дополнительные скидки, которые суммируются с бонусами за пополнение. См. [Tokens и группы](/ru/faq/token-and-groups).

## Поддерживаемые возможности

| Возможность              | Поддерживается |
| ------------------------ | -------------- |
| Потоковая передача       | ✅              |
| Вызов tools              | ✅              |
| Структурированные ответы | ✅              |
| Работа с изображениями   | ✅              |
| Кэширование промптов     | ✅              |
| Расширенное рассуждение  | По желанию     |

## Варианты

| ID модели                  | Примечания                                                                                |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| `claude-opus-4-8`          | Стандартный вызов.                                                                        |
| `claude-opus-4-8-thinking` | Вариант с принудительным reasoning; тарификация и эндпоинты идентичны стандартной модели. |

## Пример запроса

Пример ниже вызывает `claude-opus-4-8` через OpenAI Chat Completions (`/v1/chat/completions`). Укажите base\_url на `https://api.apiyi.com/v1` — все остальное соответствует официальному API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "claude-opus-4-8",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Считывайте ключ из переменной окружения, никогда не встраивайте его в код. В production выдавайте отдельные tokens для каждого сценария использования, чтобы вы могли отозвать их и учитывать использование по отдельности.</Tip>

## Связанные документы

<CardGroup cols={2}>
  <Card title="Объявление о запуске" icon="megaphone" href="/en/news/claude-opus-4-8-launch">
    Справочная информация, результаты тестов и заметки по миграции для Claude Opus 4.8
  </Card>

  <Card title="Основы Claude API" icon="book-open" href="/ru/api-capabilities/claude">
    Параметры, использование и рекомендации
  </Card>

  <Card title="Усилия и рассуждение" icon="book-open" href="/ru/api-capabilities/claude-effort-thinking">
    Параметры, использование и рекомендации
  </Card>

  <Card title="Claude Opus 5" icon="git-compare" href="/ru/models/claude-opus-5">
    Подробная информация о модели из того же семейства
  </Card>

  <Card title="Каталог тарифов моделей" icon="table" href="/en/models">
    Актуальные цены, эндпоинты и группы для всех моделей
  </Card>
</CardGroup>

<Note>Спецификации на этой странице поддерживаются вручную в `models/data/model-details.json`; цены и эндпоинты поступают из API актуальных цен и обновляются при каждой пересборке.</Note>
