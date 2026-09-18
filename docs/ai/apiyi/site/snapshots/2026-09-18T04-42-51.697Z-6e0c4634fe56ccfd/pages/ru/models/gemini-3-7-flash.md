> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.7 Flash

> Gemini 3.7 Flash на APIYI: $0.75 за входные данные / $3.75 за выходные данные за 1M tokens, контекст 1,000,000, максимум 64,000 выходных данных, доступно в 3 группах тарификации.

Следующая рабочая лошадка Flash, с большим скачком в coding и agents: DeepSWE v1.1 на 65.3%, три уровня рассуждения, контекст 1M.

## Характеристики

| Параметр               | Значение                       |
| ---------------------- | ------------------------------ |
| **ID модели**          | `gemini-3.7-flash`             |
| **Поставщик**          | Google                         |
| **Релиз поставщика**   | 2026-08-13                     |
| **Доступно на APIYI**  | 2026-08-14                     |
| **Ограничение знаний** | 2026-03                        |
| **Модальности ввода**  | Text, Image, Audio, Video, PDF |
| **Модальности вывода** | Text                           |
| **Контекстное окно**   | 1,000,000 tokens               |
| **Макс. output**       | 64,000 tokens                  |
| **Тарификация**        | По фактическому использованию  |

## Тарифы

Цены в USD за 1M tokens (\$/1M).

| Вход   | Входные данные из кэша | Вывод  |
| ------ | ---------------------- | ------ |
| \$0.75 | \$0.075                | \$3.75 |

<Info>В таблице показаны **базовые цены**. Акции на пополнение и групповые скидки **суммируются**; консоль отображает фактическое списание в реальном времени. См. [Тарифы](/ru/pricing) и [Акции на пополнение](/ru/faq/recharge-promotions).</Info>

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

| Группа           | Коэффициент тарифа | Примечания                 |
| ---------------- | ------------------ | -------------------------- |
| `Gemini_Reverse` | 0.5×               | 50% от цены по прайс-листу |
| `Default`        | 1×                 | Цена по прайс-листу        |
| `SVIP`           | 1×                 | Цена по прайс-листу        |

Некоторые группы предусматривают дополнительные скидки, которые суммируются с бонусами за пополнение. См. [Tokens и группы](/ru/faq/token-and-groups).

## Поддерживаемые возможности

| Возможность                       | Поддерживается        |
| --------------------------------- | --------------------- |
| Потоковая передача                | ✅                     |
| Вызов tools                       | ✅                     |
| Структурированные выходные данные | ✅                     |
| Vision                            | ✅                     |
| Кэширование промптов              | ✅                     |
| Расширенное рассуждение           | Включено по умолчанию |
| Веб-поиск                         | ✅                     |
| Выполнение кода                   | ✅                     |

## Пример запроса

Пример ниже вызывает `gemini-3.7-flash` через OpenAI Chat Completions (`/v1/chat/completions`). Укажите base\_url на `https://api.apiyi.com/v1` — всё остальное соответствует официальному API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gemini-3.7-flash",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Получайте ключ из переменной окружения, никогда не задавайте его жёстко в коде. В production выпускайте отдельные token для каждого сценария использования, чтобы вы могли по отдельности отзывать их и учитывать использование.</Tip>

## Связанная документация

<CardGroup cols={2}>
  <Card title="Анонс запуска" icon="megaphone" href="/en/news/gemini-3-7-flash-launch">
    Справочная информация, результаты тестирования и примечания по миграции для Gemini 3.7 Flash
  </Card>

  <Card title="Нативные вызовы" icon="book-open" href="/ru/api-capabilities/gemini/native">
    Параметры, использование и рекомендации
  </Card>

  <Card title="Gemini 3.6 Flash" icon="git-compare" href="/ru/models/gemini-3-6-flash">
    Подробности о модели из того же семейства
  </Card>

  <Card title="Gemini 3.5 Flash" icon="git-compare" href="/ru/models/gemini-3-5-flash">
    Подробности о модели из того же семейства
  </Card>

  <Card title="Каталог тарифов моделей" icon="table" href="/en/models">
    Актуальные тарифы, эндпоинты и группы для всех моделей
  </Card>
</CardGroup>

<Note>Характеристики на этой странице поддерживаются вручную в `models/data/model-details.json`; тарифы и эндпоинты поступают из API актуальных тарифов и обновляются при каждой пересборке.</Note>
