> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Sonnet 5

> Claude Sonnet 5 на APIYI: $2 за входящие token / $10 за исходящие token за 1M tokens, доступен в 4 группах тарификации.

Выбор для кодинга и разработки агентов: 85.2% на SWE-bench Verified, чистый AWS passthrough с высокими показателями попадания в кэш.

## Спецификации

| Item                     | Value                                          |
| ------------------------ | ---------------------------------------------- |
| **Идентификатор модели** | `claude-sonnet-5` · `claude-sonnet-5-thinking` |
| **Vendor**               | Anthropic                                      |
| **Доступно в APIYI**     | 2026-07-01                                     |
| **Срез знаний**          | Не раскрывается                                |
| **Модальности ввода**    | Text, Image                                    |
| **Модальности вывода**   | Text                                           |
| **Тарификация**          | По объему использования                        |

## Цены

Цены в USD за 1M tokens (\$/1M).

| Вход | Кэшированный вход | Выход |
| ---- | ----------------- | ----- |
| \$2  | \$0.2             | \$10  |

<Info>Таблица показывает **базовые цены**. Промоакции на пополнение и скидки для групп **суммируются**; консоль отображает фактическую тарификацию в реальном времени. См. [Цены](/ru/pricing) и [Промоакции на пополнение](/ru/faq/recharge-promotions).</Info>

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

| Группа           | Коэффициент | Примечания              |
| ---------------- | ----------- | ----------------------- |
| `ClaudeCode`     | 0.95×       | 95% цены по прайс-листу |
| `Claude_Reverse` | 0.5×        | 50% цены по прайс-листу |
| `Default`        | 1×          | Цена по прайс-листу     |
| `SVIP`           | 1×          | Цена по прайс-листу     |

Для некоторых групп предусмотрены дополнительные скидки, которые суммируются с бонусами за пополнение. См. раздел [Токены и группы](/ru/faq/token-and-groups).

## Поддерживаемые функции

| Функция                  | Поддерживается |
| ------------------------ | -------------- |
| Потоковая передача       | ✅              |
| Вызов инструментов       | ✅              |
| Структурированные ответы | ✅              |
| Vision                   | ✅              |
| Кэширование промптов     | ✅              |
| Расширенное рассуждение  | По желанию     |

## Варианты

| ID модели                  | Примечания                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| `claude-sonnet-5`          | Обычный вызов.                                                                               |
| `claude-sonnet-5-thinking` | Вариант с принудительным рассуждением; тарификация и эндпоинты идентичны стандартной модели. |

## Пример запроса

Приведенный ниже пример вызывает `claude-sonnet-5` через OpenAI Chat Completions (`/v1/chat/completions`). Укажите base\_url на `https://api.apiyi.com/v1` — все остальное совпадает с официальным API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "claude-sonnet-5",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Считывайте ключ из переменной окружения, никогда не задавайте его жестко. В production выпускайте отдельные token для каждого сценария использования, чтобы можно было по отдельности отзывать их и учитывать использование.</Tip>

## Связанная документация

<CardGroup cols={2}>
  <Card title="Объявление о запуске" icon="megaphone" href="/en/news/claude-sonnet-5-launch">
    Предыстория, результаты тестирования и примечания по миграции для Claude Sonnet 5
  </Card>

  <Card title="Основы Claude API" icon="book-open" href="/ru/api-capabilities/claude">
    Параметры, использование и рекомендации
  </Card>

  <Card title="Кэширование промптов" icon="book-open" href="/ru/api-capabilities/claude-prompt-caching">
    Параметры, использование и рекомендации
  </Card>

  <Card title="Claude Opus 5" icon="git-compare" href="/ru/models/claude-opus-5">
    Сведения о модели из того же семейства
  </Card>

  <Card title="Каталог тарифов моделей" icon="table" href="/en/models">
    Актуальные тарифы, эндпоинты и группы для всех моделей
  </Card>
</CardGroup>

<Note>Спецификации на этой странице вручную поддерживаются в `models/data/model-details.json`; тарифы и эндпоинты поступают из актуального API тарификации и обновляются при каждой пересборке.</Note>
