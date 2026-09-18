> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.5 Flash

> Gemini 3.5 Flash на APIYI: $1.5 за входные данные / $9 за выходные данные на 1M tokens, контекст 1,000,000, максимальный вывод 64,000, доступен в 3 группах тарификации.

76.2% в Terminal-Bench 2.1, при этом зашифрованный контекст рассуждения сохраняется между вызовами; поддержка Computer Use не предусмотрена.

## Specifications

| Item                   | Value                     |
| ---------------------- | ------------------------- |
| **ID модели**          | `gemini-3.5-flash`        |
| **Поставщик**          | Google                    |
| **Доступно в APIYI**   | 2026-05-20                |
| **Ограничение знаний** | Не раскрывается           |
| **Модальности ввода**  | Text, Image, Audio, Video |
| **Модальности вывода** | Text                      |
| **Контекстное окно**   | 1,000,000 tokens          |
| **Макс. output**       | 64,000 tokens             |
| **Тарификация**        | По объему использования   |

## Тарификация

Цены в USD за 1M tokens (\$/1M).

| Вход  | Кэшированный ввод | Вывод |
| ----- | ----------------- | ----- |
| \$1.5 | \$0.15            | \$9   |

<Info>Таблица показывает **базовые цены**. Акции на пополнение и скидки группы **суммируются**; консоль в реальном времени показывает фактическое списание. См. [Тарификация](/ru/pricing) и [Акции на пополнение](/ru/faq/recharge-promotions).</Info>

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

| Группа           | Коэффициент тарифа | Примечания               |
| ---------------- | ------------------ | ------------------------ |
| `Gemini_Reverse` | 0.5×               | 50% цены по прейскуранту |
| `Default`        | 1×                 | Цена по прейскуранту     |
| `SVIP`           | 1×                 | Цена по прейскуранту     |

Некоторые группы предусматривают дополнительные скидки, которые суммируются с бонусами за пополнение. См. [Токены и группы](/ru/faq/token-and-groups).

## Поддерживаемые возможности

| Возможность                       | Поддерживается        |
| --------------------------------- | --------------------- |
| Потоковая передача                | ✅                     |
| Вызов инструментов                | ✅                     |
| Структурированные выходные данные | ✅                     |
| Работа с изображениями            | ✅                     |
| Кэширование промптов              | ✅                     |
| Расширенное рассуждение           | Включено по умолчанию |

## Пример запроса

Пример ниже вызывает `gemini-3.5-flash` через OpenAI Chat Completions (`/v1/chat/completions`). Укажите base\_url на `https://api.apiyi.com/v1` — все остальное соответствует официальному API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gemini-3.5-flash",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Считывайте ключ из переменной окружения, никогда не задавайте его жёстко в коде. В рабочей среде выдавайте отдельные tokens для каждого сценария использования, чтобы можно было отозвать их и отдельно учитывать использование.</Tip>

## Связанная документация

<CardGroup cols={2}>
  <Card title="Объявление о запуске" icon="megaphone" href="/en/news/gemini-3-5-flash-launch">
    Сведения о предыстории, результатах тестирования и миграции для Gemini 3.5 Flash
  </Card>

  <Card title="Нативные вызовы" icon="book-open" href="/ru/api-capabilities/gemini/native">
    Параметры, использование и рекомендации
  </Card>

  <Card title="Gemini 3.6 Flash" icon="git-compare" href="/ru/models/gemini-3-6-flash">
    Сведения о модели из того же семейства
  </Card>

  <Card title="Gemini 3.5 Flash-Lite" icon="git-compare" href="/ru/models/gemini-3-5-flash-lite">
    Сведения о модели из того же семейства
  </Card>

  <Card title="Каталог тарифов моделей" icon="table" href="/en/models">
    Актуальные тарифы, эндпоинты и группы для всех моделей
  </Card>
</CardGroup>

<Note>Характеристики на этой странице поддерживаются вручную в `models/data/model-details.json`; тарифы и эндпоинты поступают из API актуальных тарифов и обновляются при каждой пересборке.</Note>
