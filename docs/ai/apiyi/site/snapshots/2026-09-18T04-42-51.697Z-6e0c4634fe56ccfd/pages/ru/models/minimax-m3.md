> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MiniMax-M3

> MiniMax-M3 в APIYI: $0.3 на вход / $1.2 на выход за 1M tokens, контекстное окно 1,000,000, доступно в 3 группах тарификации.

The first open-weight model combining frontier agentic coding, a million-token context and native multimodality; MSA sparse attention cuts long-context inference cost to about 1/20 of the previous generation.

## Спецификации

| Параметр                   | Значение                  |
| -------------------------- | ------------------------- |
| **Идентификатор модели**   | `MiniMax-M3`              |
| **Поставщик**              | MiniMax                   |
| **Релиз поставщика**       | 2026-06-01                |
| **Доступно в APIYI**       | 2026-06-05                |
| **Ограничение по знаниям** | Не раскрывается           |
| **Модальности ввода**      | Текст, Изображение, Видео |
| **Модальности вывода**     | Текст                     |
| **Контекстное окно**       | 1,000,000 tokens          |
| **Тарификация**            | По объему использования   |

## Тарифы

Цены в USD за 1M token (\$/1M).

| Входные данные | Кэшированный вход | Выход |
| -------------- | ----------------- | ----- |
| \$0.3          | \$0.06            | \$1.2 |

<Info>В таблице указаны **базовые цены**. Акции на пополнение и скидки для группы **суммируются**; консоль отображает фактическое списание в реальном времени. См. [Тарифы](/ru/pricing) и [Акции на пополнение](/ru/faq/recharge-promotions).</Info>

## Многоуровневое ценообразование

Эта модель тарифицируется по многоуровневой шкале в зависимости от размера каждого запроса в tokens (цена вывода = входная цена уровня × множитель вывода):

* 0 – 524,288 tokens: \$0.3/1M input
* Свыше 524,288 tokens: \$0.6/1M input

(уже со скидкой до 50% от прайс-листовой цены поставщика)

## Эндпоинты

| Эндпоинт                  | Path                                          | Поддерживается |
| ------------------------- | --------------------------------------------- | -------------- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅              |
| `OpenAI Responses`        | `POST /v1/responses`                          | —              |
| `Anthropic Messages`      | `POST /v1/messages`                           | ✅              |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —              |
| `Image Generations`       | `POST /v1/images/generations`                 | —              |
| `Embeddings`              | `POST /v1/embeddings`                         | —              |

## Группы тарификации

| Группа       | Коэффициент тарифа | Примечания                 |
| ------------ | ------------------ | -------------------------- |
| `ClaudeCode` | 0.95×              | 95% от цены по прайс-листу |
| `Default`    | 1×                 | Цена по прайс-листу        |
| `SVIP`       | 1×                 | Цена по прайс-листу        |

Некоторые группы предусматривают дополнительные скидки, которые можно суммировать с бонусами за пополнение. См. [Токены и группы](/ru/faq/token-and-groups).

## Поддерживаемые возможности

| Возможность                       | Поддерживается |
| --------------------------------- | -------------- |
| Потоковая передача                | ✅              |
| Вызов инструментов                | ✅              |
| Структурированные выходные данные | ✅              |
| Vision                            | ✅              |
| Кэширование промптов              | ✅              |
| Расширенное рассуждение           | По желанию     |

## Пример запроса

Пример ниже вызывает `MiniMax-M3` через OpenAI Chat Completions (`/v1/chat/completions`). Укажите base\_url на `https://api.apiyi.com/v1` — все остальное совпадает с официальным API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "MiniMax-M3",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Считывайте ключ из переменной окружения, никогда не встраивайте его в код. В production выдавайте отдельные tokens для каждого сценария использования, чтобы вы могли отзывать их и учитывать использование по отдельности.</Tip>

## Связанные документы

<CardGroup cols={2}>
  <Card title="Объявление о запуске" icon="megaphone" href="/en/news/minimax-m3-launch">
    Справочная информация, результаты сравнительного тестирования и примечания по миграции для MiniMax-M3
  </Card>

  <Card title="Каталог цен на модели" icon="table" href="/en/models">
    Актуальные цены, эндпоинты и группы для всех моделей
  </Card>
</CardGroup>

<Note>Спецификации на этой странице поддерживаются вручную в `models/data/model-details.json`; цены и эндпоинты поступают из API актуальных цен и обновляются при каждой пересборке.</Note>
