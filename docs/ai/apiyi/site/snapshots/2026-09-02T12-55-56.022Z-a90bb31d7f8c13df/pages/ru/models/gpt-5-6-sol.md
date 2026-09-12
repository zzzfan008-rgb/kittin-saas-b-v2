> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-5.6 Sol

> GPT-5.6 Sol на APIYI: $5 input / $30 output за 1M tokens, контекст 1,000,000, доступен в 4 группах тарификации.

Флагманский уровень семейства GPT-5.6: 88.8% на Terminal-Bench 2.1 и 90.4% на BrowseComp; псевдоним `gpt-5.6` указывает сюда.

## Характеристики

| Позиция                | Значение                |
| ---------------------- | ----------------------- |
| **Model ID**           | `gpt-5.6-sol`           |
| **Vendor**             | OpenAI                  |
| **Available on APIYI** | 2026-07-10              |
| **Knowledge cutoff**   | Не раскрывается         |
| **Input modalities**   | Текст, Изображение      |
| **Output modalities**  | Текст                   |
| **Context window**     | 1,000,000 tokens        |
| **Billing**            | По объему использования |

## Тарифы

Цены в USD за 1M tokens (\$/1M).

| Вход | Кэшированный вход | Выход |
| ---- | ----------------- | ----- |
| \$5  | \$0.5             | \$30  |

<Info>Таблица показывает **базовые цены**. Акции на пополнение и групповые скидки **суммируются**; консоль отражает фактическую тарификацию в реальном времени. См. [Тарифы](/ru/pricing) и [Акции на пополнение](/ru/faq/recharge-promotions).</Info>

## Многоуровневое ценообразование

Для этой модели применяется многоуровневое ценообразование в зависимости от размера token каждого запроса (цена output = цена input на уровне × множитель output):

* 0 – 272,000 tokens: \$5/1M input
* Свыше 272,000 tokens: \$10/1M input

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

| Группа           | Коэффициент | Примечания          |
| ---------------- | ----------- | ------------------- |
| `CodexResponses` | 1×          | Базовая цена        |
| `CodexReverse`   | 0.7×        | 70% от базовой цены |
| `Default`        | 1×          | Базовая цена        |
| `SVIP`           | 1×          | Базовая цена        |

Для некоторых групп предусмотрены дополнительные скидки, которые можно суммировать с бонусами за пополнение. См. [Tokens and groups](/ru/faq/token-and-groups).

## Поддерживаемые функции

| Функция                  | Поддерживается |
| ------------------------ | -------------- |
| Потоковая передача       | ✅              |
| Вызов tools              | ✅              |
| Структурированные ответы | ✅              |
| Vision                   | ✅              |
| Кэширование промптов     | ✅              |
| Расширенное рассуждение  | По желанию     |

## Пример запроса

Пример ниже вызывает `gpt-5.6-sol` через OpenAI Chat Completions (`/v1/chat/completions`). Укажите base\_url на `https://api.apiyi.com/v1` — все остальное соответствует официальному API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gpt-5.6-sol",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Считывайте ключ из переменной окружения, никогда не задавайте его жестко. В production выдавайте отдельные token для каждого сценария использования, чтобы вы могли отзывать их и отдельно учитывать использование.</Tip>

## Связанные документы

<CardGroup cols={2}>
  <Card title="Объявление о запуске" icon="megaphone" href="/en/news/gpt-5-6-launch">
    Общие сведения, результаты тестов и примечания по миграции для GPT-5.6 Sol
  </Card>

  <Card title="Совместимый режим" icon="book-open" href="/ru/api-capabilities/openai/compatible">
    Параметры, использование и рекомендации
  </Card>

  <Card title="GPT-5.6 Terra" icon="git-compare" href="/ru/models/gpt-5-6-terra">
    Сведения о модели из того же семейства
  </Card>

  <Card title="GPT-5.6 Luna" icon="git-compare" href="/ru/models/gpt-5-6-luna">
    Сведения о модели из того же семейства
  </Card>

  <Card title="Каталог тарифов моделей" icon="table" href="/en/models">
    Актуальные тарифы, эндпоинты и группы для всех 283 моделей
  </Card>
</CardGroup>

<Note>Спецификации на этой странице поддерживаются вручную в `models/data/model-details.json`; тарифы и эндпоинты поступают из актуального API тарификации, обновлено 2026-08-31 11:46 (UTC+8), последняя проверка спецификаций выполнена 2026-07-31.</Note>
