> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Kimi K3

> Kimi K3 на APIYI: $3 на входящие / $15 на исходящие за 1M token, контекст 1,048,576, максимальный output 131,072, доступно в 2 billing группах.

Флагманская open-weight модель с 2,8 трлн параметров, которая возглавляет таблицу LMArena frontend-code, с фиксированной тарификацией во всём диапазоне контекста.

## Спецификации

| Параметр               | Значение                  |
| ---------------------- | ------------------------- |
| **ID модели**          | `kimi-k3`                 |
| **Поставщик**          | Moonshot                  |
| **Доступно в APIYI**   | 2026-07-18                |
| **Ограничение знаний** | Не раскрывается           |
| **Модальности ввода**  | Текст, Изображение, Видео |
| **Модальности вывода** | Текст                     |
| **Контекстное окно**   | 1,048,576 token           |
| **Макс. вывод**        | 131,072 token             |
| **Тарификация**        | По факту использования    |

## Цены

Цены в USD за 1M token (\$/1M).

| Ввод | Кэшированный ввод | Вывод |
| ---- | ----------------- | ----- |
| \$3  | \$0.3             | \$15  |

<Info>В таблице показаны **базовые цены**. Акции на пополнение и скидки для группы **суммируются**; консоль отображает фактическое списание в реальном времени. См. [Цены](/ru/pricing) и [Акции на пополнение](/ru/faq/recharge-promotions).</Info>

## Эндпоинты

| Эндпоинт                  | Путь                                          | Поддерживается |
| ------------------------- | --------------------------------------------- | -------------- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅              |
| `OpenAI Responses`        | `POST /v1/responses`                          | —              |
| `Anthropic Messages`      | `POST /v1/messages`                           | —              |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —              |
| `Image Generations`       | `POST /v1/images/generations`                 | —              |
| `Embeddings`              | `POST /v1/embeddings`                         | —              |

## Группы тарификации

| Группа    | Коэффициент | Примечания   |
| --------- | ----------- | ------------ |
| `Default` | 1×          | Базовая цена |
| `SVIP`    | 1×          | Базовая цена |

Для некоторых групп действуют дополнительные скидки, которые суммируются с бонусами за пополнение. См. [Tokens и группы](/ru/faq/token-and-groups).

## Поддерживаемые функции

| Функция                  | Поддерживается |
| ------------------------ | -------------- |
| Потоковая передача       | ✅              |
| Вызов tools              | ✅              |
| Структурированные выводы | ✅              |
| Работа с изображениями   | ✅              |
| Кэширование промптов     | ✅              |
| Расширенное рассуждение  | По желанию     |

## Пример запроса

Приведенный ниже пример вызывает `kimi-k3` через OpenAI Chat Completions (`/v1/chat/completions`). Укажите base\_url на `https://api.apiyi.com/v1` — все остальное соответствует официальному API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "kimi-k3",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Считывайте ключ из переменной окружения, никогда не встраивайте его в код. В production выдавайте отдельные tokens для каждого сценария использования, чтобы вы могли по отдельности отзывать их и учитывать использование.</Tip>

## Связанные документы

<CardGroup cols={2}>
  <Card title="Объявление о запуске" icon="megaphone" href="/en/news/kimi-k3-launch">
    Справочная информация, результаты тестов и заметки по миграции для Kimi K3
  </Card>

  <Card title="Kimi K2.5" icon="book-open" href="/ru/api-capabilities/kimi-k2-5">
    Параметры, использование и рекомендации
  </Card>

  <Card title="Каталог тарифов моделей" icon="table" href="/en/models">
    Актуальные тарифы, эндпоинты и группы для всех моделей
  </Card>
</CardGroup>

<Note>Спецификации на этой странице поддерживаются вручную в `models/data/model-details.json`; тарифы и эндпоинты поступают из API актуальных тарифов и обновляются при каждой пересборке.</Note>
