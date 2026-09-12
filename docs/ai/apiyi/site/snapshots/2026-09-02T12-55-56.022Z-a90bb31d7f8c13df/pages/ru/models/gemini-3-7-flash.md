> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.7 Flash

> Gemini 3.7 Flash на APIYI: $0.75 за вход / $3.75 за выход за 1M tokens, контекстное окно 1,000,000, максимальный выход 64,000, доступен в 2 группах тарификации.

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

| Группа    | Коэффициент тарифа | Примечания     |
| --------- | ------------------ | -------------- |
| `Default` | 1×                 | Прайсовая цена |
| `SVIP`    | 1×                 | Прайсовая цена |

Некоторые группы предусматривают дополнительные скидки, которые суммируются с бонусами за пополнение. См. [Токены и группы](/ru/faq/token-and-groups).

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
  <Card title="Объявление о запуске" icon="megaphone" href="/en/news/gemini-3-7-flash-launch">
    Справочная информация, результаты тестов и примечания по миграции для Gemini 3.7 Flash
  </Card>

  <Card title="Нативные вызовы" icon="book-open" href="/ru/api-capabilities/gemini/native">
    Параметры, использование и рекомендации
  </Card>

  <Card title="Gemini 3.6 Flash" icon="git-compare" href="/ru/models/gemini-3-6-flash">
    Сведения о модели из того же семейства
  </Card>

  <Card title="Gemini 3.5 Flash" icon="git-compare" href="/ru/models/gemini-3-5-flash">
    Сведения о модели из того же семейства
  </Card>

  <Card title="Каталог цен на модели" icon="table" href="/en/models">
    Актуальные цены, эндпоинты и группы для всех 283 моделей
  </Card>
</CardGroup>

<Note>Спецификации на этой странице вручную поддерживаются в `models/data/model-details.json`; цены и эндпоинты поступают из API актуальных цен, обновлено 2026-08-31 11:46 (UTC+8), спецификации в последний раз проверены 2026-08-17.</Note>
