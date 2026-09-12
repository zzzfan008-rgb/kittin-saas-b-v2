> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.5 Flash-Lite

> Gemini 3.5 Flash-Lite в APIYI: $0.3 input / $2.4999 output за 1M tokens, 1,048,576 контекст, 65,536 max output, доступна в 2 группах тарификации.

Легковесный тарифный уровень с высокой пропускной способностью: по умолчанию без рассуждения и с ответами примерно за две секунды, создан для параллельных запросов и пакетных задач.

## Технические характеристики

| Пункт                  | Значение                              |
| ---------------------- | ------------------------------------- |
| **ID модели**          | `gemini-3.5-flash-lite`               |
| **Поставщик**          | Google                                |
| **Доступно в APIYI**   | 2026-07-22                            |
| **Ограничение знаний** | Не раскрывается                       |
| **Модальности ввода**  | Текст, Изображение, Аудио, Видео, PDF |
| **Модальности вывода** | Текст                                 |
| **Контекстное окно**   | 1,048,576 tokens                      |
| **Макс. вывод**        | 65,536 tokens                         |
| **Тарификация**        | По объему использования               |

## Цены

Цены в USD за 1M token (\$/1M).

| Ввод  | Кэшированный ввод | Вывод    |
| ----- | ----------------- | -------- |
| \$0.3 | \$0.03            | \$2.4999 |

<Info>В таблице показаны **базовые цены**. Акции пополнения и скидки группы **суммируются**; консоль в реальном времени отображает фактическую сумму списания. См. [Цены](/ru/pricing) и [Акции пополнения](/ru/faq/recharge-promotions).</Info>

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

Некоторые группы предусматривают дополнительные скидки, которые суммируются с бонусами за пополнение. См. [Tokens and groups](/ru/faq/token-and-groups).

## Поддерживаемые возможности

| Возможность                       | Поддерживается |
| --------------------------------- | -------------- |
| Потоковая передача                | ✅              |
| Вызов tools                       | ✅              |
| Структурированные выходные данные | ✅              |
| Vision                            | ✅              |
| Кэширование промптов              | ✅              |
| Расширенное рассуждение           | По желанию     |

## Пример запроса

Пример ниже вызывает `gemini-3.5-flash-lite` через OpenAI Chat Completions (`/v1/chat/completions`). Укажите base\_url на `https://api.apiyi.com/v1` — все остальное соответствует официальному API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gemini-3.5-flash-lite",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Считывайте ключ из переменной окружения, никогда не жестко заданным в коде. В продакшене выдавайте отдельные tokens для каждого сценария использования, чтобы вы могли отзывать их и отдельно учитывать использование.</Tip>

## Связанные документы

<CardGroup cols={2}>
  <Card title="Анонс запуска" icon="megaphone" href="/en/news/gemini-3-6-flash-lite-launch">
    Общая информация, результаты сравнительного тестирования и примечания по миграции для Gemini 3.5 Flash-Lite
  </Card>

  <Card title="Обзор" icon="book-open" href="/ru/api-capabilities/gemini-3-5-flash-lite/overview">
    Параметры, использование и рекомендации
  </Card>

  <Card title="Нативные вызовы" icon="book-open" href="/ru/api-capabilities/gemini/native">
    Параметры, использование и рекомендации
  </Card>

  <Card title="Gemini 3.6 Flash" icon="git-compare" href="/ru/models/gemini-3-6-flash">
    Подробные сведения о модели из того же семейства
  </Card>

  <Card title="Gemini 3.5 Flash" icon="git-compare" href="/ru/models/gemini-3-5-flash">
    Подробные сведения о модели из того же семейства
  </Card>

  <Card title="Каталог цен на модели" icon="table" href="/en/models">
    Актуальные цены, эндпоинты и группы для всех 283 моделей
  </Card>
</CardGroup>

<Note>Спецификации на этой странице вручную поддерживаются в `models/data/model-details.json`; цены и эндпоинты поступают из API актуальных цен, обновлено 2026-08-31 11:46 (UTC+8), последняя проверка спецификаций — 2026-07-31.</Note>
