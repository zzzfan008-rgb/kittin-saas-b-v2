> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.6 Flash

> Gemini 3.6 Flash в APIYI: $1.5 за input / $7.5 за output на 1M tokens, контекстное окно 1,048,576, максимальный output 65,536, доступно в 2 группах тарификации.

Мультимодальный флагман Flash: рассуждение включено по умолчанию на всех четырех уровнях, при этом включены search grounding, выполнение кода и контекст URL.

## Спецификации

| Item                     | Value                                 |
| ------------------------ | ------------------------------------- |
| **Model ID**             | `gemini-3.6-flash`                    |
| **Вендор**               | Google                                |
| **Доступно в APIYI**     | 2026-07-22                            |
| **Ограничение знаний**   | Не раскрывается                       |
| **Входные модальности**  | Текст, Изображение, Аудио, Видео, PDF |
| **Выходные модальности** | Текст                                 |
| **Контекстное окно**     | 1,048,576 tokens                      |
| **Макс. output**         | 65,536 tokens                         |
| **Тарификация**          | По использованию                      |

## Pricing

Цены в USD за 1M token (\$/1M).

| Input | Cached input | Output |
| ----- | ------------ | ------ |
| \$1.5 | \$0.15       | \$7.5  |

<Info>В таблице указаны **базовые цены**. Акции на пополнение и скидки для группы **суммируются**; консоль отображает фактическое списание в реальном времени. См. [Pricing](/ru/pricing) и [акции на пополнение](/ru/faq/recharge-promotions).</Info>

## Эндпоинты

| Эндпоинт                  | Путь                                          | Поддерживается |
| ------------------------- | --------------------------------------------- | -------------- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅              |
| `OpenAI Responses`        | `POST /v1/responses`                          | —              |
| `Anthropic Messages`      | `POST /v1/messages`                           | —              |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | ✅              |
| `Image Generations`       | `POST /v1/images/generations`                 | —              |
| `Embeddings`              | `POST /v1/embeddings`                         | —              |

## Группы тарификации

| Группа    | Коэффициент тарифа | Примечания   |
| --------- | ------------------ | ------------ |
| `Default` | 1×                 | Базовая цена |
| `SVIP`    | 1×                 | Базовая цена |

Для некоторых групп предусмотрены дополнительные скидки, которые суммируются с бонусами за пополнение. См. [Tokens и группы](/ru/faq/token-and-groups).

## Поддерживаемые функции

| Функция                  | Поддерживается        |
| ------------------------ | --------------------- |
| Потоковая передача       | ✅                     |
| Вызов инструментов       | ✅                     |
| Структурированные ответы | ✅                     |
| Vision                   | ✅                     |
| Кэширование промптов     | ✅                     |
| Расширенное рассуждение  | Включено по умолчанию |
| Веб-поиск                | ✅                     |
| Выполнение кода          | ✅                     |

## Пример запроса

Пример ниже обращается к `gemini-3.6-flash` через OpenAI Chat Completions (`/v1/chat/completions`). Укажите base\_url на `https://api.apiyi.com/v1` — все остальное совпадает с официальным API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gemini-3.6-flash",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Читайте ключ из переменной окружения, не задавайте его жестко. В production выдавайте отдельные token для каждого сценария использования, чтобы можно было отзывать их и учитывать использование по отдельности.</Tip>

## Связанные документы

<CardGroup cols={2}>
  <Card title="Анонс запуска" icon="megaphone" href="/en/news/gemini-3-6-flash-lite-launch">
    Справочная информация, результаты сравнительного тестирования и примечания по миграции для Gemini 3.6 Flash
  </Card>

  <Card title="Обзор" icon="book-open" href="/ru/api-capabilities/gemini-3-6-flash/overview">
    Параметры, использование и рекомендации
  </Card>

  <Card title="Нативные вызовы" icon="book-open" href="/ru/api-capabilities/gemini/native">
    Параметры, использование и рекомендации
  </Card>

  <Card title="Gemini 3.5 Flash-Lite" icon="git-compare" href="/ru/models/gemini-3-5-flash-lite">
    Сведения о модели из того же семейства
  </Card>

  <Card title="Gemini 3.5 Flash" icon="git-compare" href="/ru/models/gemini-3-5-flash">
    Сведения о модели из того же семейства
  </Card>

  <Card title="Каталог тарификации моделей" icon="table" href="/en/models">
    Актуальные цены, эндпоинты и группы для всех 283 моделей
  </Card>
</CardGroup>

<Note>Спецификации на этой странице вручную поддерживаются в `models/data/model-details.json`; цены и эндпоинты поступают из API актуальных цен, обновлено 2026-08-31 11:46 (UTC+8), спецификации в последний раз проверены 2026-07-31.</Note>
