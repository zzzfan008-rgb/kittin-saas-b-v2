> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 재정렬 API 레퍼런스

> bge-reranker-v2-m3 재정렬 API 레퍼런스 및 실시간 플레이그라운드: /v1/rerank 매개변수, 응답 구조, 오류 코드 표 및 디버깅 노트.

<Info>
  오른쪽의 플레이그라운드를 사용하여 엔드포인트를 직접 호출합니다: `Bearer sk-your-api-key`를
  **Authorization**에 넣은 다음 전송을 누르십시오 — 예시 본문은 이미 채워져 있습니다.
</Info>

<Tip>
  모델 기능, 가격, 측정 데이터와 세 가지 주의 사항은
  [개요](/ko/api-capabilities/rerank/overview)에 있습니다. Recall 크기 조정, chunking 및 임계값 전략은
  [RAG 튜닝 실전](/ko/api-capabilities/rerank/rag-best-practices)에 있습니다.
</Tip>

## 매개변수 참조

| 매개변수               | Type      | 필수 | 비고                                                                            |
| ------------------ | --------- | -- | ----------------------------------------------------------------------------- |
| `model`            | string    | ✓  | 항상 `bge-reranker-v2-m3`입니다. **대소문자를 구분합니다**(잘못된 이름을 사용하면 404가 아니라 503을 반환합니다) |
| `query`            | string    | ✓  | 검색 쿼리입니다. 빈 문자열을 보내면 400 `query is required`를 반환합니다                           |
| `documents`        | string\[] | ✓  | 후보입니다. **평문 문자열 배열만 허용됩니다**. 빈 배열을 보내면 400을 반환합니다                             |
| `top_n`            | int       |    | 상위 N개를 반환합니다. 생략 / `0` / 음수는 모두 전체를 반환하며, 문자열을 보내면 400을 반환합니다                 |
| `return_documents` | bool      |    | ⚠️ **이 채널에서는 효과가 없습니다** — 텍스트는 항상 그대로 에코됩니다                                   |

인식되지 않는 매개변수(`max_chunks_per_doc`, `rank_fields`, `truncate`, …)는 거부되지 않고 조용히 무시됩니다.

## 응답 참고 사항

```json theme={null}
{
  "results": [
    { "document": { "text": "..." }, "index": 0, "relevance_score": 0.97265625 }
  ],
  "usage": { "prompt_tokens": 70, "total_tokens": 91,
             "input_tokens": 0, "output_tokens": 0 }
}
```

* `index` — 문서의 **원래 위치**입니다. 이는 사용자가 보낸 `documents` 배열에서의 위치입니다. 이를 사용해
  자신의 문서 객체를 조회하십시오; 반환된 `text`를 기준으로 일치시키지 마십시오.
* `relevance_score` — 범위 0–1. **단일 요청 내에서만 비교 가능합니다.** 쿼리 간에는 비교할 수 없으며, 다국어 경우에서는 체계적으로 더 낮습니다. [개요의 임계값 논의](/ko/api-capabilities/rerank/overview)를 참조하십시오.
* `results`은 항상 `relevance_score` 내림차순으로 정렬되며; `index` 값은 완전하고 고유합니다.
* 사용량은 `prompt_tokens`(query
  1회 집계 + 모든 문서)와 `total_tokens`(query
  쌍당 집계)에서 읽으십시오; `input_tokens` / `output_tokens`는 이 채널에서 **항상 0**입니다.
  이번 라운드에서는 과금에서 어떤 필드가 청구되는지 확인할 수 없었습니다 — 콘솔 청구서를 기준으로 삼으십시오.

## 오류 코드

| HTTP | 메시지                                                     | 원인 및 해결 방법                                                                                                                                                                                                                                                     |
| ---- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 400  | `query is required`                                     | `query`이(가) 없거나 빈 문자열입니다                                                                                                                                                                                                                                       |
| 400  | `documents is required`                                 | `documents`이(가) 없거나 빈 배열입니다                                                                                                                                                                                                                                    |
| 400  | `Input should be a valid string`                        | `documents`에 객체를 전달했습니다. 일반 문자열을 사용하십시오                                                                                                                                                                                                                        |
| 400  | `cannot unmarshal string into ... top_n of type int`    | `top_n`이 문자열이었습니다. 정수를 전달하십시오                                                                                                                                                                                                                                  |
| 400  | `This model's maximum context length is 8192 tokens`    | 쿼리-문서 쌍 하나가 8192 tokens를 초과했습니다. 청크로 나누어 다시 시도하십시오                                                                                                                                                                                                             |
| 401  | `Invalid token.`                                        | 잘못된 API 키이거나 `Authorization` 헤더가 없습니다                                                                                                                                                                                                                          |
| 429  | 업스트림 부하가 포화되었습니다                                        | 업스트림 쿼터(**TPM 20,000 / RPM 120**)에 도달했습니다. 두 원인 모두 같은 메시지를 반환합니다: ① 약 4\~5개를 초과하는 동시 인플라이트 요청; ② 1분 동안 누적 20,000 tokens 초과(단일 1000-candidate 요청만으로도 이미 초과합니다). 동시 실행 수는 4로 제한하고, 백오프를 추가하며, tokens 예산을 관리하십시오. 이 쿼터는 확대 중입니다 — 더 높은 용량이 필요하면 APIYI 지원팀에 문의하십시오 |
| 503  | `Current group ... has no available channels for model` | **모델 이름이 대소문자까지 포함해 잘못되었거나**, 해당 그룹에 실제로 채널이 없습니다. 먼저 철자를 확인하십시오                                                                                                                                                                                               |

<Warning>
  **503에서는 먼저 모델 이름을 의심하십시오.** 요청 본문을 파싱하지 못하면(예를 들어
  `Content-Type: text/plain`), 게이트웨이는 `model` 필드를 읽지 않고 빈 모델 이름으로 동일한 503을
  반환합니다. 이 경우 채널 장애처럼 보이지만 실제로는 그렇지 않습니다.
</Warning>

<Warning>
  **잘못된 경로는 404를 반환하지 않습니다.** `/rerank`와 `/v2/rerank`(Cohere v2 SDK의
  기본값) 모두 **HTTP 200과 웹사이트의 HTML 홈페이지**를 반환하며, 클라이언트 측에서는
  파싱할 수 없는 응답으로 나타납니다. `https://api.apiyi.com/v1/rerank`만 유효한 경로입니다.
</Warning>

## 디버깅 노트

<AccordionGroup>
  <Accordion title="후보 3개만으로 테스트하지 마십시오">
    후보 수가 매우 적으면 점수 차이가 극단적입니다(첫 번째는 0.97, 두 번째는 0.12) 그리고
    모델의 의사결정 경계가 어디에 있는지 아무것도 알려주지 않습니다. 10~~20개의 문서를 사용하고,
    2~~3개의 의도적인 방해 문서도 포함하십시오. 즉, 주제는 가깝지만 질문에는 답하지 않는 문서입니다.
    그래야 *귀하의* 코퍼스에서의 점수 범위를 볼 수 있고, 어떤 임계값도 그 범위를 기준으로 해야 합니다.
  </Accordion>

  <Accordion title="크로스링구얼 테스트에서 낮은 점수는 예상됩니다">
    영어 문서에 대한 중국어 질의는 정답에 0.003\~0.3 정도만 나와도 될 수 있지만,
    **순서는 맞습니다**. 이는 호출이 잘못된 것이 아니라 모델의 특성입니다. 절대값이 아니라 순서로 판단하십시오.
  </Accordion>

  <Accordion title="약 2초의 지연시간 하한이 있습니다">
    후보가 1개뿐이어도 P50에서 약 2초가 걸립니다. 이는 고정된 게이트웨이와 upstream 오버헤드입니다.
    후보를 1개에서 100개로 늘려도 P50은 2.0초에서 3.8초로만 증가합니다.
    따라서 **지연시간을 줄이려고 후보 집합을 줄이지 마십시오**. 예상보다 이득이 훨씬 작습니다.
  </Accordion>

  <Accordion title="디버깅 중에 쿼터를 소진할 수 있습니다">
    upstream TPM은 20,000에 불과합니다. 100개 후보로 반복하면 약 15번의 호출만에 1분 예산을 모두 소진하고
    429가 반환되기 시작합니다. 대신 10\~20개 후보로 디버깅하십시오. 점수 분포를 보기에는 충분하고,
    쿼터가 방해하지 않습니다. [RAG 튜닝의 쿼터 섹션](/ko/api-capabilities/rerank/rag-best-practices)을 보십시오.
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