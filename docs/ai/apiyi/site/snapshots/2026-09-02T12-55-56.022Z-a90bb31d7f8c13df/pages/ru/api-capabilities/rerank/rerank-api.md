> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Справочник Rerank API

> справочник API rerank bge-reranker-v2-m3 и интерактивная песочница: параметры /v1/rerank, структура ответа, таблица кодов ошибок и заметки по отладке.

<Info>
  Используйте playground справа, чтобы напрямую вызвать endpoint: поместите `Bearer sk-your-api-key` в
  **Authorization**, затем нажмите кнопку отправки — тело примера уже заполнено.
</Info>

<Tip>
  Возможности модели, тарификация, измеренные данные и три подводных камня приведены в
  [overview](/ru/api-capabilities/rerank/overview). Сведения о размерности Recall, разбиении на чанки и пороговой стратегии
  приведены в [RAG tuning in practice](/ru/api-capabilities/rerank/rag-best-practices).
</Tip>

## Справочник параметров

| Параметр           | Тип       | Обязательный | Примечания                                                                                        |
| ------------------ | --------- | ------------ | ------------------------------------------------------------------------------------------------- |
| `model`            | string    | ✓            | Всегда `bge-reranker-v2-m3`, **чувствительно к регистру** (неверное имя возвращает 503, а не 404) |
| `query`            | string    | ✓            | Поисковый запрос. Пустая строка возвращает 400 `query is required`                                |
| `documents`        | string\[] | ✓            | Кандидаты. **Только обычный массив строк**; пустой массив возвращает 400                          |
| `top_n`            | int       |              | Возвращает top N. Если не указан / `0` / отрицательный, возвращается все; строка возвращает 400   |
| `return_documents` | bool      |              | ⚠️ **Не влияет на этот канал** — текст всегда возвращается как эхо                                |

Нераспознанные параметры (`max_chunks_per_doc`, `rank_fields`, `truncate`, …) молча игнорируются, а не отклоняются.

## Примечания к ответу

```json theme={null}
{
  "results": [
    { "document": { "text": "..." }, "index": 0, "relevance_score": 0.97265625 }
  ],
  "usage": { "prompt_tokens": 70, "total_tokens": 91,
             "input_tokens": 0, "output_tokens": 0 }
}
```

* `index` — **исходная позиция** документа в массиве `documents`, который вы отправили. Используйте её, чтобы
  найти объект своего документа; не сопоставляйте по возвращённому `text`.
* `relevance_score` — диапазон 0–1. **Сопоставимо только внутри одного запроса.** Не сопоставимо
  между запросами, а в кросс-языковых случаях систематически ниже. См.
  [обсуждение порога в обзоре](/ru/api-capabilities/rerank/overview).
* `results` всегда отсортирован по `relevance_score` по убыванию; значения `index` полные и уникальные.
* Считывайте usage из `prompt_tokens` (query учитывается один раз + все документы) и `total_tokens` (query
  учитывается для каждой пары); `input_tokens` / `output_tokens` на этом канале **всегда 0**.
  Этот раунд не смог подтвердить по тарификации, какое поле является платным — считайте счёт из консоли авторитетным.

## Коды ошибок

| HTTP | Сообщение                                               | Причина и решение                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 400  | `query is required`                                     | `query` отсутствует или это пустая строка                                                                                                                                                                                                                                                                                                                                                                                     |
| 400  | `documents is required`                                 | `documents` отсутствует или это пустой массив                                                                                                                                                                                                                                                                                                                                                                                 |
| 400  | `Input should be a valid string`                        | Вы передали объекты в `documents`; используйте обычные строки                                                                                                                                                                                                                                                                                                                                                                 |
| 400  | `cannot unmarshal string into ... top_n of type int`    | `top_n` была строкой; передайте integer                                                                                                                                                                                                                                                                                                                                                                                       |
| 400  | `This model's maximum context length is 8192 tokens`    | Одна пара query-document превышает 8192 token; разбейте на части и повторите                                                                                                                                                                                                                                                                                                                                                  |
| 401  | `Invalid token.`                                        | Неверный API key или отсутствует заголовок `Authorization`                                                                                                                                                                                                                                                                                                                                                                    |
| 429  | upstream load saturated                                 | Вы достигли upstream quota (**TPM 20,000 / RPM 120**). Оба варианта возвращают это же сообщение: ① более 4–5 одновременных выполняющихся запросов; ② более 20,000 накопленных token за минуту (один запрос на 1000 кандидатов уже превышает этот предел). Ограничьте параллельные запросы до 4, добавьте backoff и планируйте свои token. Эта quota расширяется — обратитесь в поддержку APIYI, если вам нужны большие объемы |
| 503  | `Current group ... has no available channels for model` | **Имя модели указано с ошибкой** (с учетом регистра) или у группы действительно нет канала. Сначала проверьте написание                                                                                                                                                                                                                                                                                                       |

<Warning>
  **Сначала подозревайте имя модели при 503.** Если тело запроса не удается разобрать (например
  `Content-Type: text/plain`), шлюз вообще не читает поле `model` и возвращает тот же 503
  с пустым именем модели — это выглядит как недоступность канала, но ею не является.
</Warning>

<Warning>
  **Неверный path не приводит к 404.** И `/rerank`, и `/v2/rerank` (значение по умолчанию в Cohere v2 SDK)
  возвращают **HTTP 200 с HTML домашней страницы сайта**, что на стороне клиента выглядит как
  ответ, который невозможно разобрать. `https://api.apiyi.com/v1/rerank` — это единственный допустимый path.
</Warning>

## Заметки по отладке

<AccordionGroup>
  <Accordion title="Не тестируйте только на 3 кандидатах">
    При очень малом числе кандидатов разница в оценках экстремальна (0.97 для первого, 0.12 для второго) и
    ничего не говорит о том, где проходит граница решения модели. Используйте 10–20 документов, включая 2–3
    намеренных отвлекающих варианта — тематически близких, но не отвечающих на вопрос. Это показывает
    диапазон оценок на *вашем* корпусе, а именно на него должен опираться любой порог.
  </Accordion>

  <Accordion title="Низкие оценки в межъязыковых тестах — это ожидаемо">
    Китайский запрос к английским документам может оценивать правильные ответы всего в 0.003–0.3, но
    **порядок верный**. Это свойственно модели, а не сломанному вызову. Оценивайте по порядку,
    а не по абсолютному значению.
  </Accordion>

  <Accordion title="Есть минимальный порог задержки около 2 секунд">
    Даже один кандидат дает около 2 с на P50 — это фиксированные накладные расходы шлюза и upstream.
    Переход от 1 к 100 кандидатам увеличивает P50 лишь с 2.0 с до 3.8 с.
    Поэтому **не сокращайте набор кандидатов ради снижения задержки**; выигрыш намного меньше, чем ожидается.
  </Accordion>

  <Accordion title="Во время отладки можно исчерпать квоту">
    Upstream TPM составляет всего 20,000. Итерации с 100 кандидатами сжигают весь минутный бюджет
    примерно за 15 вызовов и начинают возвращать 429. Вместо этого отлаживайте с 10–20 кандидатами —
    этого достаточно, чтобы увидеть распределение оценок, не прерываясь из-за квоты. См.
    [раздел о квоте в настройке RAG](/ru/api-capabilities/rerank/rag-best-practices).
  </Accordion>
</AccordionGroup>


## OpenAPI

````yaml api-reference/bge-reranker-v2-m3-rerank-openapi-en.yaml POST /v1/rerank
openapi: 3.1.0
info:
  title: bge-reranker-v2-m3 Rerank API
  description: >
    `bge-reranker-v2-m3` — a multilingual reranking model. Give it one query
    plus a list of candidate documents; it scores each one for relevance and
    returns them sorted descending.


    - Cross-encoder: outputs a relevance score directly. It produces **no
    embeddings and cannot be indexed** — use it only to re-sort an
    already-retrieved candidate set.

    - Multilingual: verified correct ordering in Chinese, English, Japanese,
    Korean, Russian, French and Arabic.

    - Billed on **input tokens** only; there are no output tokens.

    - Upstream quota is TPM 20,000 / RPM 120 with ~4–5 concurrent slots: about
    15 searches/minute at 100 candidates.

    - Keep candidate sets to 100 or fewer per request (1000 docs = 26,867
    tokens, over the whole minute's TPM budget, so it always 429s).


    **Authentication**: `Authorization: Bearer YOUR_API_KEY` request header


    **Get an API key**: create a token in the APIYI console at
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
  /v1/rerank:
    post:
      tags:
        - Rerank
      summary: 'Rerank documents: bge-reranker-v2-m3'
      description: >
        Pass a `query` and a list of `documents`; get them back sorted by
        relevance, descending.


        The `index` in each result is the document's **original position in the
        request's `documents` array**.

        Use it to look up your own document object (ID, metadata, source text) —
        do not rely on the returned text.
      operationId: rerankBgeRerankerV2M3En
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RerankRequest'
            example:
              model: bge-reranker-v2-m3
              query: What are the must-see attractions in Hangzhou?
              documents:
                - >-
                  West Lake is Hangzhou's most famous attraction, known for
                  Broken Bridge, Su Causeway and Leifeng Pagoda.
                - >-
                  The Bund in Shanghai sits along the Huangpu River and is the
                  city's signature landmark.
                - >-
                  Lingyin Temple, in Hangzhou's West Lake district, is one of
                  China's best-known Buddhist temples.
              top_n: 2
              return_documents: true
      responses:
        '200':
          description: Rerank succeeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RerankResponse'
              example:
                results:
                  - document:
                      text: >-
                        West Lake is Hangzhou's most famous attraction, known
                        for Broken Bridge, Su Causeway and Leifeng Pagoda.
                    index: 0
                    relevance_score: 0.97265625
                  - document:
                      text: >-
                        Lingyin Temple, in Hangzhou's West Lake district, is one
                        of China's best-known Buddhist temples.
                    index: 2
                    relevance_score: 0.1181640625
                usage:
                  prompt_tokens: 70
                  total_tokens: 91
        '400':
          description: 'Bad request: missing query/documents, or a field has the wrong type'
        '401':
          description: Invalid API key
        '429':
          description: >-
            You hit an upstream quota (TPM 20,000 / RPM 120): either more than
            ~4–5 concurrent in-flight requests, or over 20,000 cumulative tokens
            in a minute. A single 1000-candidate request already exceeds the
            latter
        '503':
          description: Model name misspelled, or no available channel in this group
      security:
        - bearerAuth: []
components:
  schemas:
    RerankRequest:
      type: object
      required:
        - model
        - query
        - documents
      properties:
        model:
          type: string
          description: Always bge-reranker-v2-m3 (case-sensitive; a wrong name returns 503)
          example: bge-reranker-v2-m3
        query:
          type: string
          description: The search query. An empty string returns 400
        documents:
          type: array
          description: >
            Candidate documents. **Plain string array only** — passing
            Cohere-style

            `[{"text": "..."}]` objects returns 400. Cannot be empty. Keep to
            100 or fewer.
          items:
            type: string
        top_n:
          type: integer
          description: >
            Return the top N results. Omitting it, or passing 0 or a negative
            number, returns all.

            Must be an integer — a string returns 400.

            **Does not affect usage**: every candidate is scored regardless.
          example: 2
        return_documents:
          type: boolean
          description: >
            Whether to echo the document text in results.

            **Note: this parameter currently has no effect on this channel** —
            `document.text`

            is always echoed. If response size matters, map results back by
            `index` yourself

            rather than relying on this flag to trim the payload.
          example: true
    RerankResponse:
      type: object
      properties:
        results:
          type: array
          description: Sorted by relevance_score, descending
          items:
            type: object
            properties:
              index:
                type: integer
                description: >-
                  The document's original position in the request's documents
                  array
              relevance_score:
                type: number
                description: >
                  Relevance score in the 0–1 range (post-sigmoid).

                  **It ranks documents within a single query — it is not a
                  confidence value

                  comparable across queries.** Do not apply one fixed threshold
                  everywhere.
              document:
                type: object
                properties:
                  text:
                    type: string
        usage:
          type: object
          description: Token usage. This model consumes input tokens only
          properties:
            prompt_tokens:
              type: integer
              description: >-
                Total input tokens: the query counted once plus every candidate.
                Measured ≈ 26.9 × doc count + 7
            total_tokens:
              type: integer
            input_tokens:
              type: integer
              description: Always 0 on this channel — use prompt_tokens instead
            output_tokens:
              type: integer
              description: Always 0 on this channel
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      description: 'Add the Authorization: Bearer YOUR_API_KEY request header'

````