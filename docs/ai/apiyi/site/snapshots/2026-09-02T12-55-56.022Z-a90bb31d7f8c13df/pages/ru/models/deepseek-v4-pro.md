> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Pro

> DeepSeek V4 Pro на APIYI: $1.32 за входящие / $3.96 за выходящие на 1M tokens, контекстное окно 1,048,576, доступно в 3 группах тарификации.

Флагманский MoE с 1.6T total / 49B active: SOTA с открытым исходным кодом для agentic coding, SWE-Verified 80.6, с настраиваемым thinking effort вплоть до max.

## Спецификации

| Пункт                     | Значение                |
| ------------------------- | ----------------------- |
| **ID модели**             | `deepseek-v4-pro`       |
| **Поставщик**             | DeepSeek                |
| **Доступно в APIYI**      | 2026-04-24              |
| **Дата отсечения знаний** | Не раскрывается         |
| **Входные модальности**   | Text                    |
| **Выходные модальности**  | Text                    |
| **Контекстное окно**      | 1,048,576 tokens        |
| **Тарификация**           | На основе использования |

## Цены

Цены в USD за 1M tokens (\$/1M).

| Вход   | Кэшированный вход | Выход  |
| ------ | ----------------- | ------ |
| \$1.32 | \$0.043996        | \$3.96 |

<Info>В таблице указаны **списочные цены**. Акции на пополнение и групповые скидки **суммируются**; консоль отображает фактическую стоимость в реальном времени. См. [Цены](/ru/pricing) и [Акции на пополнение](/ru/faq/recharge-promotions).</Info>

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

| Группа       | Коэффициент | Примечания                 |
| ------------ | ----------- | -------------------------- |
| `ClaudeCode` | 0.95×       | 95% от цены по прайс-листу |
| `Default`    | 1×          | Цена по прайс-листу        |
| `SVIP`       | 1×          | Цена по прайс-листу        |

Некоторые группы дают дополнительные скидки, которые суммируются с бонусами за пополнение. См. [Tokens и группы](/ru/faq/token-and-groups).

## Поддерживаемые функции

| Функция                 | Поддерживается |
| ----------------------- | -------------- |
| Streaming               | ✅              |
| Вызов инструментов      | ✅              |
| Кэширование промптов    | ✅              |
| Расширенное рассуждение | По желанию     |

## Пример запроса

В примере ниже вызывается `deepseek-v4-pro` через OpenAI Chat Completions (`/v1/chat/completions`). Укажите base\_url на `https://api.apiyi.com/v1` — всё остальное соответствует официальному API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "deepseek-v4-pro",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Считывайте ключ из переменной окружения, никогда не встраивайте его в код. В production выдавайте отдельные token для каждого сценария использования, чтобы вы могли отдельно отзывать их и учитывать использование по каждому случаю.</Tip>

## Связанные документы

<CardGroup cols={2}>
  <Card title="Анонс запуска" icon="megaphone" href="/en/news/deepseek-v4-launch">
    Сведения о предыстории, результатах сравнительного тестирования и миграции для DeepSeek V4 Pro
  </Card>

  <Card title="DeepSeek V4 Flash" icon="git-compare" href="/ru/models/deepseek-v4-flash">
    Подробности о модели из того же семейства
  </Card>

  <Card title="Каталог цен на модели" icon="table" href="/en/models">
    Актуальные цены, эндпоинты и группы для всех 283 моделей
  </Card>
</CardGroup>

<Note>Спецификации на этой странице поддерживаются вручную в `models/data/model-details.json`; цены и эндпоинты поступают из API актуальных цен, обновлённого 2026-08-31 11:46 (UTC+8), а спецификации в последний раз проверялись 2026-08-17.</Note>
