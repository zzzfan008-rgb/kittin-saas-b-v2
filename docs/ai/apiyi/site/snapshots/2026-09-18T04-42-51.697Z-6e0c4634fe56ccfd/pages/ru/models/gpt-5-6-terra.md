> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-5.6 Terra

> GPT-5.6 Terra на APIYI: $2 за ввод / $12 за вывод на 1M tokens, контекст 1,000,000, доступен в 4 группах тарификации.

Рабочий уровень семейства GPT-5.6: производительность уровня GPT-5.5 за половину цены — выбор по умолчанию при миграции.

## Характеристики

| Параметр               | Значение               |
| ---------------------- | ---------------------- |
| **ID модели**          | `gpt-5.6-terra`        |
| **Поставщик**          | OpenAI                 |
| **Доступно на APIYI**  | 2026-07-10             |
| **Порог знаний**       | Не раскрывается        |
| **Модальности ввода**  | Текст, изображение     |
| **Модальности вывода** | Текст                  |
| **Контекстное окно**   | 1,000,000 tokens       |
| **Тарификация**        | По факту использования |

## Pricing

Цены в USD за 1M tokens (\$/1M).

| Вход | Кэшированный вход | Выход |
| ---- | ----------------- | ----- |
| \$2  | \$0.2             | \$12  |

<Info>В таблице показаны **базовые цены**. Акции на пополнение и групповые скидки **суммируются**; консоль отображает фактическую сумму списания в реальном времени. См. [Pricing](/ru/pricing) и [Акции на пополнение](/ru/faq/recharge-promotions).</Info>

## Многоуровневая тарификация

Эта модель тарифицируется по уровням в зависимости от размера каждого запроса в token (цена вывода = цена входа уровня × коэффициент вывода):

* 0 – 272,000 tokens: \$2/1M input
* Свыше 272,000 tokens: \$4/1M input

## Эндпоинты

| Эндпоинт                  | Path                                          | Поддерживается |
| ------------------------- | --------------------------------------------- | -------------- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅              |
| `OpenAI Responses`        | `POST /v1/responses`                          | ✅              |
| `Anthropic Messages`      | `POST /v1/messages`                           | —              |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —              |
| `Image Generations`       | `POST /v1/images/generations`                 | —              |
| `Embeddings`              | `POST /v1/embeddings`                         | —              |

## Группы тарификации

| Группа           | Коэффициент | Примечания                 |
| ---------------- | ----------- | -------------------------- |
| `CodexResponses` | 1×          | Цена по прайс-листу        |
| `Codex_Reverse`  | 0.5×        | 50% от цены по прайс-листу |
| `Default`        | 1×          | Цена по прайс-листу        |
| `SVIP`           | 1×          | Цена по прайс-листу        |

Некоторые группы предоставляют дополнительные скидки, которые суммируются с бонусами за пополнение. См. [Tokens и группы](/ru/faq/token-and-groups).

## Поддерживаемые функции

| Функция                  | Поддерживается |
| ------------------------ | -------------- |
| Потоковая передача       | ✅              |
| Вызов tools              | ✅              |
| Структурированные ответы | ✅              |
| Работа с изображениями   | ✅              |
| Кэширование prompt       | ✅              |
| Расширенное reasoning    | По желанию     |

## Пример запроса

В примере ниже вызывается `gpt-5.6-terra` через OpenAI Chat Completions (`/v1/chat/completions`). Укажите base\_url на `https://api.apiyi.com/v1` — все остальное совпадает с официальным API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gpt-5.6-terra",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Считывайте ключ из переменной окружения, никогда не задавайте его жестко в коде. В production используйте отдельные token для каждого варианта использования, чтобы можно было отзывать их и учитывать использование по отдельности.</Tip>

## Связанные документы

<CardGroup cols={2}>
  <Card title="Объявление о запуске" icon="megaphone" href="/en/news/gpt-5-6-launch">
    Справочная информация, результаты тестов и заметки по миграции для GPT-5.6 Terra
  </Card>

  <Card title="Совместимый режим" icon="book-open" href="/ru/api-capabilities/openai/compatible">
    Параметры, использование и рекомендации
  </Card>

  <Card title="GPT-5.6 Sol" icon="git-compare" href="/ru/models/gpt-5-6-sol">
    Подробная информация о модели из того же семейства
  </Card>

  <Card title="GPT-5.6 Luna" icon="git-compare" href="/ru/models/gpt-5-6-luna">
    Подробная информация о модели из того же семейства
  </Card>

  <Card title="Каталог цен на модели" icon="table" href="/en/models">
    Актуальные цены, эндпоинты и группы для всех моделей
  </Card>
</CardGroup>

<Note>Спецификации на этой странице обновляются вручную в `models/data/model-details.json`; цены и эндпоинты поступают из API актуальных цен и обновляются при каждой пересборке.</Note>
