> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-5.6 Luna

> GPT-5.6 Luna в APIYI: $0.2 за входные данные / $1.2 за выходные данные за 1M tokens, контекст 1,000,000, доступна в 3 группах тарификации.

Облегченный уровень семейства GPT-5.6, созданный для высокой параллельности и рабочих нагрузок с чувствительностью к стоимости; при объеме свыше 256K контекста работает слабее, поэтому разбивайте длинные документы на части.

## Спецификации

| Item                      | Value                   |
| ------------------------- | ----------------------- |
| **ID модели**             | `gpt-5.6-luna`          |
| **Поставщик**             | OpenAI                  |
| **Доступно в APIYI**      | 2026-07-10              |
| **Дата отсечения знаний** | Не раскрыто             |
| **Модальности ввода**     | Text, Image             |
| **Модальности вывода**    | Text                    |
| **Контекстное окно**      | 1,000,000 tokens        |
| **Тарификация**           | По объему использования |

## Тарификация

Цены в USD за 1M tokens (\$/1M).

| Вход  | Кэшированный вход | Выход |
| ----- | ----------------- | ----- |
| \$0.2 | \$0.02            | \$1.2 |

<Info>Таблица показывает **базовые цены**. Акции на пополнение и групповые скидки **суммируются**; консоль отображает фактическое списание в реальном времени. См. [Pricing](/ru/pricing) и [Акции на пополнение](/ru/faq/recharge-promotions).</Info>

## Многоуровневое ценообразование

У этой модели цена зависит от размера token в каждом запросе (цена output = цена input уровня × множитель output):

* 0 – 272,000 tokens: \$0.2/1M input
* Свыше 272,000 tokens: \$0.4/1M input

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

| Группа           | Коэффициент | Примечания   |
| ---------------- | ----------- | ------------ |
| `CodexResponses` | 1×          | Базовая цена |
| `Default`        | 1×          | Базовая цена |
| `SVIP`           | 1×          | Базовая цена |

Для некоторых групп предусмотрены дополнительные скидки, которые суммируются с бонусами за пополнение. См. [Tokens и группы](/ru/faq/token-and-groups).

## Поддерживаемые функции

| Функция                   | Поддерживается |
| ------------------------- | -------------- |
| Потоковая передача        | ✅              |
| Вызов tools               | ✅              |
| Структурированные outputs | ✅              |
| Зрение                    | ✅              |
| Кэширование промптов      | ✅              |
| Расширенное рассуждение   | По желанию     |

## Пример запроса

Приведенный ниже пример вызывает `gpt-5.6-luna` через OpenAI Chat Completions (`/v1/chat/completions`). Укажите base\_url на `https://api.apiyi.com/v1` — все остальное соответствует официальному API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gpt-5.6-luna",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Читайте ключ из переменной окружения, никогда не задавайте его жестко. В рабочей среде выпускайте отдельные token для каждого сценария использования, чтобы можно было отдельно отзывать их и учитывать использование индивидуально.</Tip>

## Связанные документы

<CardGroup cols={2}>
  <Card title="Объявление о запуске" icon="megaphone" href="/en/news/gpt-5-6-launch">
    Сведения о предыстории, результатах тестов и миграции для GPT-5.6 Luna
  </Card>

  <Card title="Совместимый режим" icon="book-open" href="/ru/api-capabilities/openai/compatible">
    Параметры, использование и рекомендации
  </Card>

  <Card title="GPT-5.6 Sol" icon="git-compare" href="/ru/models/gpt-5-6-sol">
    Сведения о модели из того же семейства
  </Card>

  <Card title="GPT-5.6 Terra" icon="git-compare" href="/ru/models/gpt-5-6-terra">
    Сведения о модели из того же семейства
  </Card>

  <Card title="Каталог тарифов моделей" icon="table" href="/en/models">
    Актуальные тарифы, эндпоинты и группы для всех 283 моделей
  </Card>
</CardGroup>

<Note>Спецификации на этой странице поддерживаются вручную в `models/data/model-details.json`; тарифы и эндпоинты поступают из API актуальных тарифов, обновлено 2026-08-31 11:46 (UTC+8), последняя проверка спецификаций — 2026-07-31.</Note>
