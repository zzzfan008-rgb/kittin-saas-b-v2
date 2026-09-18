> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-5.6 Sol

> GPT-5.6 Sol на APIYI: $4 за ввод / $20 за вывод на 1 млн token, контекстное окно 1 000 000, доступно в 4 группах тарификации.

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

## Цены

Цены в долларах США за 1 млн tokens (\$/1M).

| Входные данные | Кэшированные входные данные | Выходные данные |
| -------------- | --------------------------- | --------------- |
| \$4            | \$0.4                       | \$20            |

<Info>В таблице указаны **базовые цены**. Акции на пополнение и скидки для групп **суммируются**; консоль в реальном времени отображает фактическую сумму списания. См. разделы [Цены](/ru/pricing) и [Акции на пополнение](/ru/faq/recharge-promotions).</Info>

## Тарификация по уровням

Для этой модели применяется тарификация по уровням в зависимости от размера каждого запроса в token (цена вывода = цена входных данных для уровня × коэффициент тарифа для вывода):

* 0–272,000 token: \$4/1M входных данных
* Более 272,000 token: \$8/1M входных данных

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

| Группа           | Коэффициент | Примечания               |
| ---------------- | ----------- | ------------------------ |
| `CodexResponses` | 1×          | Цена по прейскуранту     |
| `Codex_Reverse`  | 0.5×        | 50% цены по прейскуранту |
| `Default`        | 1×          | Цена по прейскуранту     |
| `SVIP`           | 1×          | Цена по прейскуранту     |

Для некоторых групп предусмотрены дополнительные скидки, которые суммируются с бонусами за пополнение. См. [Токены и группы](/ru/faq/token-and-groups).

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
    Сведения о предыстории, результатах тестирования и заметки по миграции для GPT-5.6 Sol
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
    Актуальные тарифы, эндпоинты и группы для всех моделей
  </Card>
</CardGroup>

<Note>Спецификации на этой странице вручную поддерживаются в `models/data/model-details.json`; тарифы и эндпоинты поступают из API актуальных тарифов и обновляются при каждой пересборке.</Note>
