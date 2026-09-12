> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Fable 5

> Claude Fable 5 на APIYI: $10 за input / $50 за output за 1M tokens, доступно в 4 группах тарификации.

Флагман класса Mythos, почти SOTA в разработке ПО и визуальном понимании; входные и выходные данные сохраняются на 30 дней для обнаружения злоупотреблений.

## Спецификации

| Item                   | Value                                        |
| ---------------------- | -------------------------------------------- |
| **Model ID**           | `claude-fable-5` · `claude-fable-5-thinking` |
| **Vendor**             | Anthropic                                    |
| **Available on APIYI** | 2026-06-10                                   |
| **Knowledge cutoff**   | Не раскрыто                                  |
| **Input modalities**   | Текст, изображение                           |
| **Output modalities**  | Текст                                        |
| **Billing**            | По факту использования                       |

## Цены

Цены в USD за 1M tokens (\$/1M).

| Вход | Вход из кэша | Вывод |
| ---- | ------------ | ----- |
| \$10 | \$1          | \$50  |

<Info>В таблице показаны **цены из прайс-листа**. Акции на пополнение и скидки для группы **суммируются**; консоль в реальном времени отображает фактическую сумму списания. См. [Pricing](/ru/pricing) и [Акции на пополнение](/ru/faq/recharge-promotions).</Info>

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

| Группа              | Коэффициент | Примечания              |
| ------------------- | ----------- | ----------------------- |
| `ClaudeCode`        | 0.95×       | 95% цены по прайс-листу |
| `ClaudeCodeReverse` | 0.5×        | 50% цены по прайс-листу |
| `Default`           | 1×          | Цена по прайс-листу     |
| `SVIP`              | 1×          | Цена по прайс-листу     |

Некоторые группы предусматривают дополнительные скидки, которые суммируются с бонусами за пополнение. См. [Tokens и группы](/ru/faq/token-and-groups).

## Поддерживаемые возможности

| Возможность                       | Поддерживается |
| --------------------------------- | -------------- |
| Потоковая передача                | ✅              |
| Вызов tools                       | ✅              |
| Структурированные выходные данные | ✅              |
| Vision                            | ✅              |
| Кэширование промптов              | ✅              |
| Расширенное рассуждение           | По желанию     |

## Варианты

| ID модели                 | Примечания                                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `claude-fable-5`          | Стандартный вызов.                                                                                                                    |
| `claude-fable-5-thinking` | Вариант с принудительным рассуждением; тарификация и эндпоинты идентичны стандартной модели, за исключением группы ClaudeCodeReverse. |

## Пример запроса

Приведённый ниже пример вызывает `claude-fable-5` через OpenAI Chat Completions (`/v1/chat/completions`). Укажите base\_url на `https://api.apiyi.com/v1` — все остальное соответствует официальному API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "claude-fable-5",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Считывайте ключ из переменной окружения, никогда не встраивайте его в код. В рабочей среде выпускайте отдельные tokens для каждого варианта использования, чтобы вы могли отзывать их и по отдельности учитывать использование.</Tip>

## Связанные документы

<CardGroup cols={2}>
  <Card title="Анонс запуска" icon="megaphone" href="/en/news/claude-fable-5-launch">
    Сведения о предыстории, результатах тестов и заметки по миграции для Claude Fable 5
  </Card>

  <Card title="Основы Claude API" icon="book-open" href="/ru/api-capabilities/claude">
    Параметры, использование и рекомендации
  </Card>

  <Card title="Уровень усилий и рассуждение" icon="book-open" href="/ru/api-capabilities/claude-effort-thinking">
    Параметры, использование и рекомендации
  </Card>

  <Card title="Claude Opus 5" icon="git-compare" href="/ru/models/claude-opus-5">
    Сведения о модели из того же семейства
  </Card>

  <Card title="Каталог цен на модели" icon="table" href="/en/models">
    Актуальные цены, эндпоинты и группы для всех 283 моделей
  </Card>
</CardGroup>

<Note>Спецификации на этой странице обновляются вручную в `models/data/model-details.json`; цены и эндпоинты поступают из актуального API тарификации, обновлённого 2026-08-31 11:46 (UTC+8), спецификации в последний раз проверены 2026-07-31.</Note>
