> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 4.3

> Grok 4.3 на APIYI: $1.25 за 1 млн входных token / $2.5 за 1 млн выходных token, контекстное окно 1 000 000, доступен в 3 группах тарификации.

Постоянно активное рассуждение, которое нельзя отключить, контекстное окно 1M и вывод примерно 159 tokens/s.

## Спецификации

| Параметр               | Значение               |
| ---------------------- | ---------------------- |
| **ID модели**          | `grok-4.3`             |
| **Поставщик**          | xAI                    |
| **Доступно в APIYI**   | 2026-05-03             |
| **Ограничение знаний** | Не раскрывается        |
| **Режимы ввода**       | Текст, Изображение     |
| **Режимы вывода**      | Текст                  |
| **Контекстное окно**   | 1,000,000 tokens       |
| **Тарификация**        | По факту использования |

## Цены

Цены в USD за 1M tokens (\$/1M).

| Input  | Cached input | Output |
| ------ | ------------ | ------ |
| \$1.25 | \$0.2        | \$2.5  |

<Info>Таблица показывает **розничные цены**. Акции на пополнение и групповые скидки **суммируются**; консоль отражает фактическое списание в реальном времени. См. [Цены](/ru/pricing) и [Акции на пополнение](/ru/faq/recharge-promotions).</Info>

## Ступенчатая тарификация

Эта модель тарифицируется по уровням в зависимости от размера token каждого запроса (выходная цена = входная цена уровня × множитель выхода):

* 0 – 204,800 tokens: \$1.25/1M входных
* Свыше 204,800 tokens: \$2.5/1M входных

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

Некоторые группы предоставляют дополнительные скидки, которые суммируются с бонусами за пополнение. См. [Tokens и группы](/ru/faq/token-and-groups).

## Поддерживаемые функции

| Функция                  | Поддерживается        |
| ------------------------ | --------------------- |
| Потоковая передача       | ✅                     |
| Вызов инструментов       | ✅                     |
| Структурированные выводы | ✅                     |
| Vision                   | ✅                     |
| Кэширование промптов     | ✅                     |
| Расширенное рассуждение  | Включено по умолчанию |
| Веб-поиск                | ✅                     |
| Выполнение кода          | ✅                     |

## Пример запроса

Пример ниже вызывает `grok-4.3` через OpenAI Chat Completions (`/v1/chat/completions`). Укажите base\_url на `https://api.apiyi.com/v1` — все остальное совпадает с официальным API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "grok-4.3",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Читайте ключ из переменной окружения, никогда не встраивайте его жестко. В production выдавайте отдельные tokens для каждого сценария использования, чтобы вы могли отзывать их и отдельно учитывать использование.</Tip>

## Связанная документация

<CardGroup cols={2}>
  <Card title="Объявление о запуске" icon="megaphone" href="/en/news/grok-4-3-launch">
    Общая информация, бенчмарки и примечания по миграции для Grok 4.3
  </Card>

  <Card title="Обзор Grok" icon="book-open" href="/ru/api-capabilities/grok/overview">
    Параметры, использование и рекомендации
  </Card>

  <Card title="Grok 4.6" icon="git-compare" href="/ru/models/grok-4-6">
    Сведения о модели из того же семейства
  </Card>

  <Card title="Grok 4.5" icon="git-compare" href="/ru/models/grok-4-5">
    Сведения о модели из того же семейства
  </Card>

  <Card title="Каталог цен моделей" icon="table" href="/en/models">
    Актуальные цены, эндпоинты и группы для всех моделей
  </Card>
</CardGroup>

<Note>Характеристики на этой странице поддерживаются вручную в `models/data/model-details.json`; цены и эндпоинты поступают из актуального API цен и обновляются при каждой сборке.</Note>
