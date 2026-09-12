> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash Responses — справочник API

> DeepSeek V4 Flash GA (deepseek-v4-flash-ga-260731) — справочник Responses API и песочница: цепочечное явное кэширование с попаданием в кэш всего предыдущего контекста на каждом раунде.

<Info>
  Используйте playground справа, чтобы протестировать напрямую: вставьте `Bearer sk-your-api-key` в
  **Authorization**. В примере по умолчанию уже указаны `caching: {"type": "enabled"}` и
  `store: true` — схема записи первого вызова для цепочечного явного кэширования.
</Info>

<Tip>
  Responses добавляет слой **явного кэша** поверх Chat Completions. Сведения о возможностях, тарификации
  и управлении рассуждением см. в
  [обзоре DeepSeek V4 Flash](/ru/api-capabilities/deepseek-v4-flash/overview).
</Tip>

<Warning>
  * **`text.format` json\_schema не действует**: возвращает 200, игнорируя схему; 3/3 ответа были заключены в блоки кода и не поддались парсингу
  * **`web_search` backend непригоден к использованию**: инструмент подключён (элементы `web_search_call` отображаются с `status: completed`), но 6/6 поисков завершились ошибкой и не вернули ни одного `results`
  * **`mcp` возвращает `AccessDenied`**: право на встроенный инструмент на уровне аккаунта/канала — корректный URL сервера даёт тот же результат
  * Только текстовая модель — при передаче изображений возвращает `Model do not support image input`
</Warning>

## Краткая справка по параметрам

| Параметр               | Тип            | Обязателен | По умолчанию | Примечания                                                            |
| ---------------------- | -------------- | ---------- | ------------ | --------------------------------------------------------------------- |
| `model`                | string         | ✓          | —            | Жёстко задано как `deepseek-v4-flash-ga-260731`                       |
| `input`                | string / array | ✓          | —            | Строка или стандартный массив сообщений Responses, только текст       |
| `max_output_tokens`    | int            |            | —            | Жёсткий предел 393,216; рассуждение засчитывается в него              |
| `store`                | bool           |            | `true`       | Должно быть true, чтобы можно было сцеплять                           |
| `previous_response_id` | string         |            | —            | Предыдущий ответ `id`; вместе с `caching` он попадает в явный кэш     |
| `caching.type`         | string         |            | —            | `enabled` записывает явный кэш; ответ возвращает это поле             |
| `reasoning.effort`     | string         |            | —            | `minimal` дает 0 токенов рассуждения; другие уровни не монотонны      |
| `stream`               | bool           |            | `false`      | Потоковая передача SSE, измеренный TTFB около 2.31s                   |
| `tools`                | array          |            | —            | `function` работает; см. предупреждение выше для `web_search` / `mcp` |

## Явный кэш: требуется цепочка

<Warning>
  **Распространённая ошибка**: повторная отправка одного и того же длинного префикса дважды с установленным `caching` приводит к
  тому, что `cached_tokens` остаётся на 0. Явный кэш **не** сопоставляется по префиксу — вам нужно связать
  сессию с `previous_response_id`.
</Warning>

Правильная схема: сначала отправьте весь документ в первом вызове, чтобы записать кэш, затем отправляйте
только новый вопрос, при этом связывая предыдущий `id`.

| Round     | Call shape                         | input\_tokens | cached\_tokens | Задержка |
| --------- | ---------------------------------- | ------------- | -------------- | -------- |
| 1 (write) | `caching: enabled` + `store: true` | 15,629        | 0              | 4.10s    |
| 2         | + `previous_response_id`           | 15,664        | **15,629**     | 5.18s    |
| 3         | + `previous_response_id`           | 15,701        | **15,664**     | 4.57s    |
| 4         | + `previous_response_id`           | 15,738        | **15,701**     | 4.54s    |

Каждый раунд задействует весь предыдущий контекст. Для последующих вопросов по длинному документу это
гораздо дешевле, чем отправлять полный текст заново на каждом шаге.

### Пример цепочки вызовов

```python theme={null}
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["APIYI_API_KEY"],
    base_url="https://api.apiyi.com/v1",
)

long_doc = open("report.md").read()

# Round 1: write the cache
first = client.responses.create(
    model="deepseek-v4-flash-ga-260731",
    input=long_doc + "\n\nSummarize the core conclusions of this report.",
    max_output_tokens=800,
    store=True,
    extra_body={"caching": {"type": "enabled"}},
)
print(first.output_text)

# Round 2 onward: send only the new question, chaining the prior id
second = client.responses.create(
    model="deepseek-v4-flash-ga-260731",
    input="What risks are mentioned in section three?",
    previous_response_id=first.id,
    max_output_tokens=800,
    store=True,
    extra_body={"caching": {"type": "enabled"}},
)
print(second.output_text)
print("Cache hit:", second.usage.input_tokens_details.cached_tokens)
```

## Неявный кэш

Без `caching` неявный кэш по-прежнему применяется: повторение идентичного длинного префикса дало
99,9% попадания в кэш (15,633 → 15,616). Выбирайте в зависимости от сценария — **один префикс, повторно используемый во многих независимых запросах** лучше подходит для неявного кэша, тогда как **одна сессия с последовательными уточнениями** лучше подходит для цепочечного явного кэширования.

## Типы элементов вывода

Ответ `output` — это массив, который может содержать следующие элементы:

| type              | Примечания                                                                       |
| ----------------- | -------------------------------------------------------------------------------- |
| `reasoning`       | Содержимое рассуждения (появляется, когда `reasoning.effort` не равно `minimal`) |
| `message`         | Итоговый ответ; текст находится в `content[].text`                               |
| `function_call`   | Вызов инструмента с `call_id` и `arguments`                                      |
| `web_search_call` | Запись вызова поиска — **в настоящее время не содержит поля `results`**          |


## OpenAPI

````yaml api-reference/deepseek-v4-flash-responses-openapi-en.yaml POST /v1/responses
openapi: 3.1.0
info:
  title: DeepSeek V4 Flash Responses API
  description: >
    DeepSeek V4 Flash GA (`deepseek-v4-flash-ga-260731`) — OpenAI-compatible
    Responses endpoint.


    Compared with Chat Completions, Responses adds a second caching layer —
    **explicit cache**:


    - Write the cache on the first call with `caching: {"type": "enabled"}`

    - Chain subsequent calls via `previous_response_id`; each round hits the
    entire prior context

    - Note: resending the same long prefix twice will **not** hit the explicit
    cache — you must chain


    Known unavailable: `text.format` json_schema is accepted but does not
    constrain the schema;

    the `web_search` tool is wired but its backend keeps erroring; the `mcp`
    tool returns `AccessDenied`.


    **Authentication**: add `Authorization: Bearer YOUR_API_KEY` to the request
    headers


    **Get an API Key**: create a token in the APIYI console at
    `api.apiyi.com/token`
  version: 1.0.0
servers:
  - url: https://api.apiyi.com
    description: Primary endpoint
  - url: https://vip.apiyi.com
    description: Backup endpoint
security:
  - bearerAuth: []
paths:
  /v1/responses:
    post:
      tags:
        - Text Generation
      summary: >-
        Responses: DeepSeek V4 Flash text generation (with chained explicit
        cache)
      description: >
        Call the Responses endpoint with `deepseek-v4-flash-ga-260731`.


        Typical multi-turn long-context pattern:


        1. First call: send the full long document plus `caching: {"type":
        "enabled"}` and `store: true`

        2. Record the `id` from the response

        3. Later calls: send only the new question plus `previous_response_id` —
        the prior context hits the cache in full
      operationId: createDeepSeekV4FlashResponse
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/DeepSeekV4FlashResponsesRequest'
            example:
              model: deepseek-v4-flash-ga-260731
              input: Explain the MoE architecture in one sentence.
              max_output_tokens: 500
              store: true
              caching:
                type: enabled
      responses:
        '200':
          description: Generation succeeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/DeepSeekV4FlashResponsesResponse'
        '400':
          description: >-
            Invalid parameters. Common causes: input above 1,048,570 tokens, or
            image content (returns Model do not support image input)
        '401':
          description: Unauthorized - invalid API Key
        '403':
          description: >-
            No built-in tool entitlement (returns AccessDenied when using mcp
            and similar built-in tools)
        '429':
          description: Rate limit exceeded or insufficient balance
      security:
        - bearerAuth: []
components:
  schemas:
    DeepSeekV4FlashResponsesRequest:
      type: object
      required:
        - model
        - input
      properties:
        model:
          type: string
          description: Model ID, fixed to deepseek-v4-flash-ga-260731
          enum:
            - deepseek-v4-flash-ga-260731
          default: deepseek-v4-flash-ga-260731
        input:
          description: >-
            Input content. Either a string or a standard OpenAI Responses
            message array. Text only — no images
          oneOf:
            - type: string
            - type: array
              items:
                type: object
        max_output_tokens:
          type: integer
          description: >-
            Max output tokens, hard ceiling 393,216. Reasoning counts toward
            this
          default: 500
          maximum: 393216
        store:
          type: boolean
          description: >-
            Whether to store this response. Must be true to chain with
            previous_response_id
          default: true
        previous_response_id:
          type: string
          description: >-
            The id of the previous response. Combined with caching, this hits
            the explicit cache in full
        caching:
          type: object
          description: >-
            Explicit cache switch. Pass {"type": "enabled"} on the first call to
            write, then chain with previous_response_id to hit
          properties:
            type:
              type: string
              enum:
                - enabled
                - disabled
              default: enabled
        reasoning:
          type: object
          description: >-
            Reasoning control. Measured: effort=minimal always yields 0
            reasoning tokens; the other tiers do not form a monotonic ladder
          properties:
            effort:
              type: string
              enum:
                - minimal
                - low
                - medium
                - high
                - max
        stream:
          type: boolean
          description: Stream the response over SSE. Measured TTFB around 2.3 seconds
          default: false
        tools:
          type: array
          description: >-
            Tool list. The function type works; web_search is wired but its
            backend errors, and mcp returns AccessDenied
          items:
            type: object
    DeepSeekV4FlashResponsesResponse:
      type: object
      properties:
        id:
          type: string
          description: Response ID, used as the next call's previous_response_id
        model:
          type: string
        output:
          type: array
          description: >-
            Output item array. May contain reasoning / message / function_call /
            web_search_call items
          items:
            type: object
        caching:
          type: object
          description: Explicit cache status echo
        usage:
          type: object
          description: >-
            Usage. input_tokens_details.cached_tokens is the cache hit;
            output_tokens_details.reasoning_tokens is reasoning spend
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: API Key obtained from the APIYI console

````