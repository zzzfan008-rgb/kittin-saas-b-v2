> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Interactions API против generateContent

> Подробное сравнение двух парадигм API Google Gemini — эндпоинты, структуры запросов/ответов, управление состоянием, рассуждение, поля использования — с результатами теста совместимости шлюза APIYI

С июня 2026 года Google сделал **Interactions API** общедоступным (Generally Available) и рекомендует его для всех новых проектов, тогда как классический **generateContent API** теперь считается устаревшим, но по-прежнему полностью поддерживается. Официальная документация (например, страница генерации изображений Nano Banana) теперь предлагает переключатель между двумя парадигмами, и у многих developers возникает вопрос: чем именно они отличаются и какой вариант следует использовать через APIYI? Эта страница содержит подробное сравнение и проверенные выводы.

<Info>
  **Статус шлюза APIYI (проверено 4 июля 2026 (UTC+8))**: Interactions API **пока не поддерживается** через шлюз — как `/v1beta2/interactions`, так и `/v1beta/interactions` возвращают 404. При вызове Gemini через APIYI продолжайте использовать [нативный формат generateContent](/ru/api-capabilities/gemini/native); вся документация Gemini на этом сайте основана именно на нем. Мы обновим эту страницу, как только шлюз добавит поддержку Interactions API.
</Info>

## Что собой представляют два подхода

**generateContent** — это классический интерфейс без сохранения состояния: один запрос передает весь контекст, один ответ возвращает полный результат, по адресу `POST /v1beta/models/{model}:generateContent`. Google отмечает, что «хотя сейчас он считается устаревшим, он по-прежнему полностью поддерживается».

**Interactions API** — это новый интерфейс Google, получивший статус GA с июня 2026 года, по адресу `POST /v1beta2/interactions`. Он построен вокруг базового ресурса `Interaction` (один полный ход диалога или задача), а ответ представляет собой хронологическую **временную шкалу шагов выполнения** — рассуждения модели, вызовы инструментов и результаты, а также итоговый вывод — все это явные шаги. Google прямо указывает, что **новые модели за пределами основной линейки и новые agentic-возможности будут запускаться в Interactions API в дальнейшем** (источник: `ai.google.dev/gemini-api/docs/interactions-overview`).

## Основные различия вкратце

| Параметр                           | generateContent (классический)                                                                                                      | Interactions API (новый)                                                                                                                                                                       |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Эндпоинт                           | `POST /v1beta/models/{model}:generateContent`                                                                                       | `POST /v1beta2/interactions`                                                                                                                                                                   |
| Структура входных данных           | `contents[].parts[]` (мультимодальные части на основе ролей)                                                                        | `input` (строка или content blocks; имя модели в теле запроса)                                                                                                                                 |
| Структура вывода                   | `candidates[0].content.parts[]`                                                                                                     | `steps[]` хронология: `user_input` / `thought` / `function_call` / `function_result` / `model_output`                                                                                          |
| Многоходовый диалог                | Клиент заново отправляет **всю историю** на каждом ходе                                                                             | `previous_interaction_id` продолжается на стороне сервера (также возможен stateless-режим)                                                                                                     |
| Рассуждение                        | `thoughtsTokenCount` счетчик; промежуточные черновики рассуждений моделей изображений возвращаются вперемешку с частями изображения | Возвращается явно как `steps` (`type: "thought"`), включая текст мыслей и промежуточные изображения                                                                                            |
| Потоковая передача                 | Выделенный эндпоинт `:streamGenerateContent`                                                                                        | Тот же эндпоинт с `"stream": true` в теле запроса                                                                                                                                              |
| Фоновое выполнение                 | Не поддерживается                                                                                                                   | `"background": true` для длительно выполняющихся задач                                                                                                                                         |
| Кэширование                        | Явное кэширование + неявное кэширование                                                                                             | Явное кэширование отсутствует; `previous_interaction_id` значительно улучшает показатели попадания в неявный кэш                                                                               |
| Хранение данных на стороне сервера | Запросы не сохраняются                                                                                                              | `store: true` по умолчанию: **55 дней** на платном тарифе, 1 день на бесплатном тарифе, можно удалить; `store: false` отключает это (но несовместимо с background и previous\_interaction\_id) |
| Поля usage                         | `promptTokenCount` / `candidatesTokenCount` / `thoughtsTokenCount` / `totalTokenCount`                                              | `total_thought_tokens` / `total_output_tokens` и т. д. (snake\_case)                                                                                                                           |
| Вызовы агентов                     | Не поддерживается                                                                                                                   | Тот же интерфейс вызывает официальных агентов, таких как Deep Research и Antigravity                                                                                                           |
| Пока недоступно                    | — (самый полный набор функций)                                                                                                      | Batch API, явное кэширование, `video_metadata`, автоматический вызов функций (Python), удаленный MCP на Gemini 3                                                                               |
| Точка входа SDK                    | `client.models.generate_content` (google-genai)                                                                                     | `client.interactions.create` (google-genai ≥ 2.3.0 / @google/genai ≥ 2.3.0)                                                                                                                    |

<Note>
  Частая ошибка при работе с состоянием Interactions API на стороне сервера: `previous_interaction_id` **переносит только историю диалога**. `tools`, `system_instruction` и `generation_config` (включая `thinking_level`, `temperature` и т. д.) привязаны к конкретному взаимодействию — вам нужно отправлять их заново на каждом ходе, иначе они тихо перестают применяться.
</Note>

## Структуры запроса и ответа (один текстовый ход)

Пример generateContent работает напрямую через шлюз APIYI; пример Interactions API обращается напрямую к эндпоинту Google (пока не поддерживается APIYI):

<CodeGroup>
  ```bash generateContent (работает в APIYI) theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-2.5-flash:generateContent" \
    -H "Authorization: Bearer $APIYI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [{
        "parts": [{ "text": "Tell me a joke." }]
      }]
    }'
  ```

  ```bash Interactions API (напрямую к Google) theme={null}
  curl -X POST "https://generativelanguage.googleapis.com/v1beta2/interactions" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gemini-3.5-flash",
      "input": "Tell me a joke."
    }'
  ```
</CodeGroup>

Чем отличаются две формы ответа для одного и того же запроса:

<CodeGroup>
  ```json ответ generateContent theme={null}
  {
    "candidates": [
      {
        "content": {
          "parts": [{ "text": "Why did the chicken cross the road? ..." }],
          "role": "model"
        },
        "finishReason": "STOP",
        "index": 0
      }
    ],
    "usageMetadata": {
      "promptTokenCount": 4,
      "candidatesTokenCount": 12,
      "totalTokenCount": 16
    }
  }
  ```

  ```json ответ Interactions API theme={null}
  {
    "id": "int_123",
    "status": "completed",
    "steps": [
      {
        "type": "user_input",
        "status": "done",
        "content": [{ "type": "text", "text": "Tell me a joke." }]
      },
      {
        "type": "model_output",
        "status": "done",
        "content": [{ "type": "text", "text": "Why did the chicken cross the road?" }]
      }
    ]
  }
  ```
</CodeGroup>

## Сравнение многоходовых диалогов

Именно здесь два подхода ощущаются наиболее по-разному. generateContent требует заново отправлять **всю историю** на каждом ходе; Interactions API нужен только `id` предыдущего хода:

<CodeGroup>
  ```bash generateContent (повторная отправка всей истории) theme={null}
  curl -X POST "https://api.apiyi.com/v1beta/models/gemini-2.5-flash:generateContent" \
    -H "Authorization: Bearer $APIYI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "contents": [
        { "role": "user",  "parts": [{ "text": "Hi, my name is Phil." }] },
        { "role": "model", "parts": [{ "text": "Hello Phil! How can I help?" }] },
        { "role": "user",  "parts": [{ "text": "What is my name?" }] }
      ]
    }'
  ```

  ```bash Interactions API (продолжение на стороне сервера) theme={null}
  curl -X POST "https://generativelanguage.googleapis.com/v1beta2/interactions" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "gemini-3.5-flash",
      "previous_interaction_id": "int_123",
      "input": "What is my name?"
    }'
  ```
</CodeGroup>

Помимо того, что это избавляет от кода для управления историей, продолжение на стороне сервера значительно упрощает попадание неявного кэширования в префикс диалога — Google говорит, что это снижает затраты на token в многоходовых сценариях. Обратная сторона в том, что данные по умолчанию хранятся на стороне Google (55 дней на платном тарифе); организациям с требованиями к соблюдению правил обработки данных следует оценить семантику `store`.

## Различия для моделей изображений

Модели изображений Gemini 3 (например, `gemini-3-pro-image`) по умолчанию выполняют рассуждение, и два парадигмы полностью по-разному представляют «промежуточные черновики рассуждения»:

* **generateContent (текущий формат шлюза APIYI)**: промежуточные черновики рассуждения возвращаются как **обычные image parts** внутри `candidates[0].content.parts` (с `thoughtSignature`, без флага `thought`). В тестах один ответ может содержать 2–10 изображений, каждое тарифицируется по 1120/2000 tokens в выходных данных — всегда проходите по всем parts и **берете последнее как финальную версию**. Полные измерения и правила сверки: [Usage Fields & Output Explained](/ru/api-capabilities/nano-banana-usage-metadata).
* **Interactions API**: рассуждение явно представлено как шаги `type: "thought"` (текст мысли и промежуточные изображения), а финальное изображение находится в шаге `model_output`; SDK также предоставляют удобные свойства `.output_image` / `.output_text`. Для чередующегося текстово-изображенческого вывода (например, иллюстрированных историй) по-прежнему требуется вручную проходить по шагам.

## Тест совместимости шлюза APIYI

Проверено на `api.apiyi.com` с тестовым ключом 4 июля 2026 года (UTC+8):

| Тест                                                           | Запрос                                | Результат                                                          |
| -------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------ |
| `POST /v1beta2/interactions` + аутентификация Bearer           | минимальный запрос `gemini-2.5-flash` | ❌ 404 (Неверный URL)                                               |
| `POST /v1beta/interactions` + аутентификация Bearer            | то же самое                           | ❌ 404 (Неверный URL)                                               |
| `POST /v1beta2/interactions` + аутентификация `x-goog-api-key` | то же самое                           | ❌ 404 (Неверный URL)                                               |
| `POST /v1beta/models/{model}:generateContent`                  | модели для текста/изображений         | ✅ Работает (вся документация Gemini на этом сайте основана на нем) |

**Вывод: шлюз APIYI пока не передает Interactions API**, поэтому возможности, доступные только через Interactions, — продолжение на стороне сервера, вызовы агентов, фоновое выполнение — сейчас недоступны через шлюз.

## Рекомендации

1. **Через APIYI: продолжайте использовать generateContent.** Он обладает самым полным набором функций (Batch, явное кэширование и video\_metadata доступны только в generateContent), и Google взял на себя обязательство полностью поддерживать его — в ближайшей перспективе риска вывода из эксплуатации нет.
2. **Многоходовые диалоги с generateContent**: собирайте историю на стороне клиента; см. [Нативный формат Gemini](/ru/api-capabilities/gemini/native) и [Многоходовые диалоги](/ru/api-capabilities/multi-turn-conversation).
3. **Если вы вызываете Google напрямую и рассматриваете миграцию на Interactions API**, обратите внимание на четыре вещи: `tools` / `system_instruction` / `generation_config` нужно пересылать на каждом ходе; `store` по умолчанию включён и хранится 55 дней на платном тарифе; Batch API и явное кэширование пока недоступны; обновите google-genai / @google/genai до версии 2.3.0+.
4. **Когда Interactions API стоит начинать отслеживать**: когда вам нужны официальные агенты (Deep Research, Antigravity), `background: true` длительно выполняющиеся задачи или серверное состояние, чтобы снизить расходы на token в многоходовых диалогах. Мы обновим эту страницу, как только APIYI добавит поддержку.

## Связанные документы

<CardGroup cols={2}>
  <Card title="Нативный формат Gemini" icon="sparkles" href="/ru/api-capabilities/gemini/native">
    Полное руководство по нативному формату generateContent через APIYI
  </Card>

  <Card title="Обработка ответов Gemini" icon="braces" href="/ru/api-capabilities/gemini/response-handling">
    Корректный разбор candidates, parts и finishReason
  </Card>

  <Card title="Пояснение полей использования и вывода" icon="receipt-text" href="/ru/api-capabilities/nano-banana-usage-metadata">
    Семантика usageMetadata для image-model и измеренное поведение thinking-draft
  </Card>

  <Card title="Многоходовые беседы" icon="messages-square" href="/ru/api-capabilities/multi-turn-conversation">
    Реализация многоходового чата в интерфейсе без сохранения состояния
  </Card>
</CardGroup>
