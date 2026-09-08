> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# bge-reranker-v2-m3 텍스트 리랭킹

> bge-reranker-v2-m3는 검색된 후보를 쿼리와 비교해 점수를 매기고 다시 정렬하는 다국어 리랭킹 모델이며, RAG 검색 품질을 가장 저렴하게 실질적으로 향상시키는 방법입니다. APIYI에서 /v1/rerank로 사용할 수 있으며, 1M token당 $0.01입니다.

`bge-reranker-v2-m3`은 BAAI의 오픈소스 다국어 reranking 모델입니다. 검색 시스템에서 가장 흔하게 발생하는 단일 실패를 해결합니다. **vector search는 올바른 문서를 가져왔지만, 상단에 있는 문서가 실제로 질문에 답하는 문서는 아닙니다.**

APIYI는 표준 `/v1/rerank` 엔드포인트를 제공합니다. token 하나로, 다른 모든 모델과 동일한 키를 사용합니다.

<Info>
  **모델 이름**: `bge-reranker-v2-m3`(대소문자 구분). **엔드포인트**: `POST /v1/rerank`.
  `default` 및 `svip` 그룹에서 사용할 수 있습니다.
  이 페이지의 모든 수치는 APIYI의 2026-07-30 (UTC+8) 테스트, 60개 이상의 테스트 케이스에서 나온 결과입니다.
</Info>

## 그것이 무엇이며 언제 사용해야 하는지

재랭커는 **크로스 인코더**입니다. 질의와 각 후보 문서를 이어 붙인 뒤, 그 쌍을 모델에 통과시키고, 관련성 점수를 직접 출력합니다.

이는 임베딩 모델과 근본적으로 다릅니다:

|               | 임베딩(벡터 검색)                        | 재랭크                                         |
| ------------- | --------------------------------- | ------------------------------------------- |
| 계산 방식         | 질의와 문서를 **별도로** 인코딩한 뒤 거리로 비교합니다  | 질의와 문서를 모델에 **함께** 통과시킵니다                   |
| 사전 색인이 가능한가요? | ✅ 문서 벡터는 오프라인으로 계산하여 벡터 DB에 저장합니다 | ❌ 무엇이든 계산하려면 질의가 필요합니다. 미리 계산할 수 있는 것은 없습니다 |
| 속도            | 빠릅니다. 수백만 개의 문서도 밀리초 단위입니다        | 느립니다. 후보 수가 늘어날수록 더 느려집니다                   |
| 정확도           | 보통입니다                             | 높습니다                                        |
| 역할            | **재현율**: 수백만 개에서 수십 개의 문서를 끌어옵니다  | **정밀도**: 수십 개 중에서 가장 좋은 몇 개를 고릅니다           |

따라서 벡터 검색을 대체하지는 않습니다. 그 뒤에 놓이는 **두 번째 단계**입니다.

<Warning>
  재랭커는 **인덱스를 만들 수 없고 검색도 할 수 없습니다**. 벡터 출력을 제공하지 않으며, 질의 없이는
  문서를 처리할 수 없습니다. 원하는 것이 “문서를 벡터 데이터베이스에 넣는 것”이라면,
  이 모델이 아니라 [텍스트 임베딩](/ko/api-capabilities/text-embedding)이 필요합니다.
</Warning>

### 정량 비교

같은 10개 후보 문서, 같은 질의(“내 API 요청이 계속 429를 반환합니다 — 어떻게 해결합니까?”), 랭킹 방식만 바뀝니다:

| 랭킹 방식                                | nDCG\@3  | P\@3     | 상위 3개에 들어간 항목                               |
| ------------------------------------ | -------- | -------- | ------------------------------------------- |
| 벡터 유사도만 사용(`text-embedding-3-small`) | 0.53     | 0.33     | 직접 답변, **4xx 상태 코드 용어집**, **데이터센터 유지보수 공지** |
| `bge-reranker-v2-m3` 추가              | **1.00** | **1.00** | 직접 답변, 직접 답변, 지수 백오프 설명                     |

벡터 검색은 HTTP-4xx 용어집과 “4월 29일”을 언급하는 유지보수 공지를 상위 3개에 넣었습니다. 둘 다 주제적으로 가깝고 질의와 어휘도 공유하지만, 어느 것도 질문에 답하지는 않습니다. 재랭커가 둘 다 아래로 밀어냈습니다.

이것이 핵심 가치 제안입니다: **“같은 주제”와 “실제로 질문에 답하는 것”을 구분합니다.**

## 모델 정보

| Property          | Value                                                                  |
| ----------------- | ---------------------------------------------------------------------- |
| **Model name**    | `bge-reranker-v2-m3` (대소문자를 구분하며, 이름이 잘못되면 503을 반환합니다)                 |
| **Architecture**  | Cross-encoder, XLM-RoBERTa-large 백본, bge-m3에서 파인튜닝됨                    |
| **Parameters**    | 약 568M (0.6B)                                                          |
| **Context limit** | **8192 tokens, 쿼리-문서 쌍당** (측정 결과: 이를 초과하면 400을 반환하며, 조용한 절단은 없습니다)     |
| **Languages**     | 중국어, 영어, 일본어, 한국어, 러시아어, 프랑스어 및 아랍어에서 올바른 순서가 검증되었으며, 크로스링구얼 검색이 작동합니다 |
| **Endpoint**      | `POST /v1/rerank`                                                      |
| **Groups**        | `default`, `svip`                                                      |
| **Upstream**      | Huawei Cloud ModelArts (공식 릴레이)                                        |
| **License**       | Apache 2.0                                                             |

## 가격

| 항목 | 가격                            |
| -- | ----------------------------- |
| 입력 | \$0.01 / 1M tokens            |
| 출력 | 없음(이 모델은 출력 token을 내보내지 않습니다) |

<Info>
  **무시해도 될 만큼 저렴합니다.** 후보 100개를 재랭킹하는 데(\~2,700 tokens) 약 \$0.000027이 듭니다.
  이런 호출을 100만 번 하면 \$27입니다. RAG 시스템에서 재랭킹이 비용 병목이 되는 일은 거의 없습니다 —
  **제약은 돈이 아니라 지연 시간입니다**. 지출이 아니라 지연 시간을 기준으로 후보 집합 크기를 조정하십시오.
</Info>

**사용 의미**(측정됨):

* `prompt_tokens` = 쿼리(한 번만 계산됨)와 모든 후보 문서의 합입니다. 실제로는 엄격하게 선형입니다: `≈ 26.9 × doc count + 7`(적합 오차 \< 0.31%)이므로 클라이언트 측에서 예측할 수 있습니다
* `total_tokens`가 더 크며, 그 차이는 후보 수가 늘수록 커집니다 — 쿼리가 쿼리-문서 쌍마다 한 번씩 계산된다는 점과 일치합니다
* 이 채널에서는 `input_tokens` / `output_tokens`가 **항상 0**입니다 — 사용하지 마십시오
* `top_n`와 `return_documents`는 사용량을 **변경하지 않습니다** — 어느 쪽이든 모든 후보가 점수화됩니다

<Warning>
  이번에는 과금 기록만으로 청구가 `prompt_tokens`를 따르는지 아니면
  `total_tokens`를 따르는지 확인할 수 없었습니다(테스트 token은 계정 잔액 엔드포인트를 읽을 수 없습니다). 후보가 100개일 때
  둘의 차이는 약 45%입니다. 비용에 민감한 작업에서는 콘솔 인보이스를 기준으로 삼고
  `usage` 필드로 지출을 계산하지 마십시오.
</Warning>

## 최소 호출

<CodeGroup>
  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/rerank \
    -H "Authorization: Bearer $APIYI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "model": "bge-reranker-v2-m3",
      "query": "What are the must-see attractions in Hangzhou?",
      "documents": [
        "West Lake is Hangzhou'\''s most famous attraction, known for Broken Bridge and Leifeng Pagoda.",
        "The Bund in Shanghai sits along the Huangpu River and is the city'\''s signature landmark.",
        "Lingyin Temple, in Hangzhou'\''s West Lake district, is a well-known Buddhist temple."
      ],
      "top_n": 2
    }'
  ```

  ```python Python theme={null}
  import os, requests

  resp = requests.post(
      "https://api.apiyi.com/v1/rerank",
      headers={"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"},
      json={
          "model": "bge-reranker-v2-m3",
          "query": "What are the must-see attractions in Hangzhou?",
          "documents": [
              "West Lake is Hangzhou's most famous attraction, known for Broken Bridge and Leifeng Pagoda.",
              "The Bund in Shanghai sits along the Huangpu River and is the city's signature landmark.",
              "Lingyin Temple, in Hangzhou's West Lake district, is a well-known Buddhist temple.",
          ],
          "top_n": 2,
      },
      timeout=60,
  ).json()

  for r in resp["results"]:
      print(f"{r['relevance_score']:.4f}  {r['document']['text']}")
  ```

  ```javascript Node.js theme={null}
  const resp = await fetch('https://api.apiyi.com/v1/rerank', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.APIYI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'bge-reranker-v2-m3',
      query: 'What are the must-see attractions in Hangzhou?',
      documents: [
        "West Lake is Hangzhou's most famous attraction, known for Broken Bridge and Leifeng Pagoda.",
        "The Bund in Shanghai sits along the Huangpu River and is the city's signature landmark.",
        "Lingyin Temple, in Hangzhou's West Lake district, is a well-known Buddhist temple.",
      ],
      top_n: 2,
    }),
  });

  const data = await resp.json();
  data.results.forEach((r) => console.log(r.relevance_score, r.document.text));
  ```
</CodeGroup>

응답:

```json theme={null}
{
  "results": [
    { "document": { "text": "West Lake is Hangzhou's most famous attraction..." }, "index": 0, "relevance_score": 0.97265625 },
    { "document": { "text": "Lingyin Temple, in Hangzhou's West Lake district..." }, "index": 2, "relevance_score": 0.1181640625 }
  ],
  "usage": { "prompt_tokens": 70, "total_tokens": 91 }
}
```

<Tip>
  **`index`가 핵심 필드입니다.** 이는 사용자가 보낸
  `documents` 배열에서 해당 문서의 **원래 위치**입니다. 이를 사용하여 자신이 보낸 문서 객체(ID, URL, 메타데이터)를 조회하십시오 —
  반환된 `text`를 기준으로 일치시키려 하지 마십시오.
</Tip>

## 요청 매개변수

| 매개변수               | 유형        | 필수 | 참고                                                            |
| ------------------ | --------- | -- | ------------------------------------------------------------- |
| `model`            | string    | ✓  | 항상 `bge-reranker-v2-m3`이며, **대소문자를 구분합니다**                    |
| `query`            | string    | ✓  | 검색 쿼리입니다. 빈 문자열이면 400을 반환합니다                                  |
| `documents`        | string\[] | ✓  | 후보입니다. **일반 문자열 배열만 가능합니다.** 빈 배열이면 400을 반환합니다                |
| `top_n`            | int       |    | 상위 N개를 반환합니다. 생략 / `0` / 음수이면 모두 전체를 반환합니다. 사용량에는 영향을 주지 않습니다 |
| `return_documents` | bool      |    | ⚠️ **이 채널에서는 영향을 주지 않습니다** — 아래의 알려진 문제를 참조하십시오               |

## 측정된 성능 매트릭스

| 기능                          | 결과                                                                       |
| --------------------------- | ------------------------------------------------------------------------ |
| 중국어 의미 기반 순위                | ✅ nDCG\@3 = 1.00                                                         |
| 키워드 함정 저항성                  | ✅ 상위 2개는 정확하지만, 방해 항목도 여전히 매우 높은 점수를 받을 수 있습니다(아래 참조)                    |
| 교차 언어(ZH ↔ EN)              | ✅ 순서는 정확하지만, 절대 점수는 1\~2자릿수 정도 낮아집니다                                     |
| 다국어(JA / KO / RU / FR / AR) | ✅ 다섯 개 모두 올바르게 정렬됩니다                                                     |
| **부정 이해**                   | ❌ **명확한 약점**이며, nDCG\@3 = 0.47입니다(아래 참조)                                 |
| 결정성                         | ✅ 요청을 10회 반복해도 바이트 단위로 동일합니다. 후보를 섞으면 3.7e-4만큼만 변동합니다                    |
| 중복 문서 일관성                   | ✅ 동일한 문서는 바이트 단위로 동일한 점수를 받습니다                                           |
| 요청당 최대 후보 수                 | ✅ 실제로 2000개까지 작동합니다. **100개 이하로 유지하십시오**                                 |
| 최대 문서 길이                    | 쌍당 8192 tokens이며, 그 이상이면 400이 반환됩니다(조용한 절단은 없습니다)                        |
| **상위 쿼터**                   | ⚠️ TPM 20,000 / RPM 120, 동시 슬롯 약 4\~5개, 후보 100개 기준 분당 검색 약 15회입니다(아래 참조) |
| `return_documents: false`   | ❌ 매개변수가 무시됩니다                                                            |

## 반드시 알아야 할 세 가지

<AccordionGroup>
  <Accordion title="1. relevance_score는 쿼리 간에 비교 가능한 신뢰도 값이 아닙니다" icon="triangle-alert">
    직관적으로는 “그냥 0.5에서 필터링하면 됩니다”라고 생각하기 쉽습니다. **하지만 측정된 데이터는 그렇게 하면 문제가 생긴다고 보여줍니다:**

    | 경우                                | 실제로 관련 있는 문서의 점수 범위           |
    | --------------------------------- | ----------------------------- |
    | 중국어 쿼리 × 중국어 문서                   | 0.289 – 1.000 (중앙값 0.948)     |
    | 동일 언어, 중국어가 아닌 경우(JA/KO/RU/FR/AR) | **0.005 – 0.998** (중앙값 0.241) |
    | **교차 언어(ZH ↔ EN)**                | **0.0038 – 0.205**            |
    | 키워드 중복이 많은 관련 없는 방해 문서            | **0.945**에서 최고치               |

    0.5 임계값은 **모든 올바른 교차 언어 결과를 버리고**, 중국어가 아닌 언어의 대부분의 2위 결과도 버리는 반면,\
    쿼리 “Apple Inc. FY2024 revenue”에 대해 사과 재배 가격에 관한 문문서를 **허용**합니다.

    **대신 이렇게 하십시오**: 이를 신뢰도가 아니라 정렬 키로 취급하십시오. 반드시 필터링해야 한다면 상대 임계값(`score >= top1_score × 0.3`)을 사용하거나, 그냥 Top-N을 취하고 자체 레이블 데이터로 보정하십시오.
  </Accordion>

  <Accordion title="2. 부정은 이 모델의 뚜렷한 약점입니다" icon="circle-x">
    쿼리: “겨울에 방문하기 좋은 관광지는 어디입니까?” 두 후보는 명시적으로 그 반대를 말합니다:

    | 순위 | 점수    | 문서                        | 실제로 관련 있습니까? |
    | -- | ----- | ------------------------- | ------------ |
    | #1 | 0.811 | 하얼빈 빙설대세계… 최고의 겨울 여행지     | ✅            |
    | #2 | 0.769 | 베이다이허… **겨울 관광에 적합하지 않음** | ❌            |
    | #3 | 0.531 | 칭하이호… **겨울에는 추천하지 않음**    | ❌            |
    | #4 | 0.375 | 우송섬… 겨울에 꼭 봐야 할 곳         | ✅            |
    | #5 | 0.289 | 싼야… 인기 있는 겨울 휴양지          | ✅            |

    모델은 “겨울 + 관광지 + 여행”이라는 주제에 맞추었지만 **부정을 처리하지 못했습니다**.\
    nDCG\@3는 겨우 0.47이었습니다.

    **완화 방법**: 부정, 제외, 조건문이 포함된 쿼리(“글루텐 프리”, “베이징을 제외한 어디든”, “미성년자에게는 적용되지 않음”)의 경우, 재정렬 후 LLM 검증 단계를 추가하십시오. Top-N을 그대로 사용자에게 넘기지 마십시오.
  </Accordion>

  <Accordion title="3. 긴 문서는 관련성을 희석시키고 노이즈도 키웁니다" icon="scissors">
    같은 일치 문장에 관련 없는 채우기 문구를 서로 다른 분량으로 덧붙였습니다:

    | 전체 길이 | 점수, 일치 문장이 **처음**에 있을 때 | 점수, 일치 문장이 **끝**에 있을 때 |
    | ----- | ----------------------- | ---------------------- |
    | 528자  | 0.933                   | 0.720                  |
    | 1028자 | 0.931                   | 0.500                  |
    | 4028자 | 0.907                   | 0.351                  |
    | 8028자 | 0.828                   | 0.181                  |

    그리고 **길이는 관련 없는 문서의 점수도 부풀립니다**: 같은 비일치 문서가 짧을 때는 0.029, 채웠을 때는 0.121로 나와 4배 높았습니다.

    **완화 방법**: 재정렬 전에 긴 문서를 200–500자로 청크로 나누고, 가장 높은 점수를 받은 청크를 문서의 점수로 사용하십시오. 청크 분할은 이 모델에서 가장 영향력이 큰 전처리 단계입니다.
  </Accordion>
</AccordionGroup>

전체 튜닝 방법 — 청크 분할, 임계값, 리콜 규모 산정 — 은 [실무에서의 RAG 튜닝](/ko/api-capabilities/rerank/rag-best-practices)에 있습니다.

## 알려진 문제

<Warning>
  **`return_documents`는 효과가 없습니다** (2026-07-30 측정). `true`, `false`를 전달하든,
  아예 생략하든, `document.text`가 그대로 되돌아옵니다. 대역폭에 민감한 작업(긴
  문서를 가진 큰 후보 집합)에서는 응답이 예상보다 훨씬 큽니다. 이 플래그에
  의존하지 말고 `index`로 직접 결과를 매핑하십시오.
</Warning>

<Warning>
  **잘못된 모델 이름을 반환하면 503이고 404가 아닙니다.** 메시지는
  `Current group default has no available channels for model xxx`라고 표시됩니다. 이름은 **대소문자를 구분합니다** —
  `BGE-Reranker-v2-M3`는 존재하지 않는 모델로 처리됩니다. 통합 중 503이 발생하면
  채널 장애라고 단정하기 전에 철자부터 확인하십시오.
</Warning>

<Warning>
  **업스트림 쿼터가 이 모델의 가장 큰 제약입니다. 통합하기 전에 token 예산을 먼저 잡으십시오.**

  업스트림(Huawei Cloud MaaS)은 이 모델에 대해 **TPM 20,000 / RPM 120**을 허용합니다. 같은 플랫폼의 BGE-M3
  임베딩 모델은 1,200,000 TPM을 받습니다. — **60배 더 많습니다**.

  테스트에서는 두 개의 **독립적인** 메커니즘이 분리되어 확인되었습니다.

  | 메커니즘                        | 측정된 동작                                                                                                             |
  | --------------------------- | ------------------------------------------------------------------------------------------------------------------ |
  | **약 4–5개의 동시 in-flight 슬롯** | 동시 10개 → 4개 성공, 동시 20개 → 5개 성공(token은 TPM의 3–4%에 불과); **직렬 요청 20개 → 20/20 성공**                                     |
  | **TPM 20,000 슬라이딩 윈도우**     | **동시 실행 수가 0이어도** 걸립니다: 1.3K-token 요청을 직렬로 보내면 8번째에서 누적 token 16,093 시점에 429가 반환되고, 9개가 연속으로 실패한 뒤 윈도우가 이동하면 복구됩니다 |

  슬롯 한도를 넘는 요청은 **대기열에 들어가지 않고 즉시 거부**되며, 두 실패 모두 동일한 메시지 `upstream load saturated`을 반환합니다. 응답만으로는 구분할 수 없으므로 이를 고려해 여유를 잡아야 합니다.

  **권장 사항**: 동시 실행 수를 4로 제한하고, 지수 백오프를 추가하며, 아래 표를 기준으로 처리량을 산정하십시오.
</Warning>

### 분당 검색 수

측정한 `≈26.9 tokens/document`를 TPM 20,000에 대입하면:

| 쿼리당 후보 수 | 호출당 token 수 | 이론적 상한       |
| -------- | ----------- | ------------ |
| 50       | 673         | 약 29 / 분     |
| 100      | 1,325       | **약 15 / 분** |
| 200      | 2,629       | 약 7 / 분      |

이 내용은 단일 요청이 너무 많은 후보를 담을 수 없는 이유도 설명합니다. 후보 1000개는
26,867 token입니다. — **1개의 요청이 분당 전체 예산의 134%를 소비하는 것**이므로, 반드시
429가 발생합니다. 후보 2000개에서는 269%입니다.

<Info>
  **쿼터 확장은 진행 중입니다.** 위의 TPM 20,000은 업스트림의 초기 할당이며,
  APIYI는 이미 상향 요청을 제출했습니다. 워크로드가 표의 허용 범위를 초과한다면
  현재 수치에 맞추어 설계를 축소하기보다 APIYI 지원팀에 연락해 업스트림 쿼터를 검토받으십시오.
</Info>

<Warning>
  **`/v1/rerank`만 유효한 경로입니다.** `/rerank` 또는 `/v2/rerank`(Cohere v2 SDK의
  기본값)을 요청하면 JSON 404가 아니라 웹사이트의 HTML 홈페이지가 반환됩니다. 클라이언트는 그저
  혼란스러운 파싱 오류만 보게 됩니다. 통합에서 "파싱할 수 없는 응답"이 보고되면 먼저 `/v1`를 확인하십시오.
</Warning>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="벡터 검색이나 재랭킹 중 하나만 사용해도 됩니까?">
    벡터 검색만 사용: 작동은 하지만 Top-N 정밀도가 눈에 띄게 더 나쁩니다(측정된 nDCG\@3가 1.00에서 0.53으로 떨어집니다).

    재랭킹만 사용: **안 됩니다.** 벡터 출력이 없어서 후보 집합이 필요합니다. 수백만 개의 문서를 하나씩 점수화하는 것은 실용적이지도 않고 비용도 감당하기 어렵습니다.

    표준 형태는 2단계입니다. 벡터/BM25로 50~~100개를 재현한 다음 → rerank로 3~~5개로 줄인 뒤 → LLM에 전달합니다.
  </Accordion>

  <Accordion title="후보는 몇 개를 재현해야 합니까?">
    측정된 지연 시간은 후보 수에 거의 선형적으로 비례합니다(짧은 문서 기준): 10개 ≈ 2초,
    100개 ≈ 4초, 500개 ≈ 15초, 1000개 ≈ 33초.

    **50\~100개가 가장 적절합니다.** 20개 미만이면 재랭커가 바로잡을 잘못된 순위가 많이 남아 있지 않습니다. 200개를 넘으면 지연 시간이 상호작용성을 해치기 시작하는 반면, 재현 목록의 꼬리 부분에는 대개 답이 없습니다.

    예산도 중요합니다. 후보 100개는 약 1,325 tokens이므로 TPM 20,000이면 분당 약 15회 검색만 가능합니다. 후보 수를 두 배로 늘리면 처리량은 절반으로 줄어듭니다. **후보 수는 품질 결정인 동시에 용량 결정입니다**.
  </Accordion>

  <Accordion title="Cohere 또는 Jina SDK를 여기에 연결할 수 있습니까?">
    **`cohere` SDK v2는 그대로는 작동하지 않습니다**: `/v2/rerank`을 대상으로 하는데, JSON 대신 HTML 홈페이지를 반환하므로 SDK가 파싱 오류를 일으킵니다.

    매개변수 이름(`query` / `documents` / `top_n` / `return_documents`)은 Cohere Rerank
    v1과 일치하지만, `documents` **문자열 배열만 허용합니다**(`[{"text": "..."}]`는 400을 반환합니다) 그리고
    응답에는 `id` / `meta` 필드가 없습니다. **HTTP 호출을 직접 감싸는 것이 가장 간단합니다** —
    [실무에서의 RAG 튜닝](/ko/api-capabilities/rerank/rag-best-practices)에는 바로 사용할 수 있는
    LangChain 및 LlamaIndex 어댑터가 있습니다.

    확인된 작동 클라이언트: 일반 `requests` POST ✅, 그리고 `openai` SDK 우회
    `client.post("/rerank", ...)` ✅.
  </Accordion>

  <Accordion title="결과를 캐시할 수 있습니까?">
    예, 매우 안정적입니다. **동일한 요청을 10번 반복하면 비트 단위로 동일합니다**(드리프트 0).
    약 3.7e-4의 드리프트는 **후보 순서를 섞을 때만** 나타나며(bf16 배치 지터), 순서에는 영향이 없습니다.

    캐시 키는 `normalised query + ordered hash of document contents`로 지정하십시오. 순서가
    그 작은 드리프트를 유발하므로 **`relevance_score` 자체를 멱등성 키로 취급하지 마십시오.**
  </Accordion>

  <Accordion title="8192 tokens를 넘으면 어떻게 됩니까?">
    `This model's maximum context length is 8192 tokens`가 포함된 400 오류를 받습니다. **조용히 잘려나가지는 않습니다.**
    이 제한은 요청 전체가 아니라 쿼리-문서 쌍마다 적용됩니다. 따라서 문서 400개 × 1000자(총 330K tokens)의 단일 요청도 정상적으로 반환됩니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

* [Rerank API 플레이그라운드](/ko/api-capabilities/rerank/rerank-api)
* [실전 RAG 튜닝](/ko/api-capabilities/rerank/rag-best-practices)
* [텍스트 임베딩](/ko/api-capabilities/text-embedding)
* [모델 가격](/en/models)
