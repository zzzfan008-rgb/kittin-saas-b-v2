> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# RAG 튜닝 실전

> bge-reranker-v2-m3에서 실제로 가치를 얻는 방법: 2단계 검색 구조, 회수할 후보 수, 긴 문서를 청크로 나누는 방법, relevance_score 임계값 설정, 부정 표현 처리, 그리고 LangChain / LlamaIndex / Dify 통합 코드.

The [개요](/ko/api-capabilities/rerank/overview)는 이 모델이 무엇인지 설명합니다. 이 페이지는 **올바르게 사용하는 방법**을 다룹니다.

모든 권장은 2026-07-30 (UTC+8)에 측정된 APIYI 측정값에 기반합니다 — 이는 일반적인 조언이 아닙니다.

## 1. 아키텍처를 올바르게 잡기: 2단계 검색

Reranking은 독립적인 검색 방법이 아닙니다. 파이프라인의 두 번째 단계입니다.

<Steps>
  <Step title="Recall">
    전체 말뭉치에서 후보 집합을 가져오기 위해 **벡터 검색** 또는 **BM25**를 사용합니다. 이 단계는 반드시
    **빠라야** 하며, **넉넉히 가져와야 합니다**: 목표는 "답이 이 안 어딘가에 있습니다"이지
    "답이 맨 앞에 있습니다"가 아닙니다.
  </Step>

  <Step title="Rerank">
    후보 집합과 쿼리를 `bge-reranker-v2-m3`에 보내 점수를 매기고 다시 정렬합니다.
    이 단계는 반드시 **정확해야** 합니다: 목표는 올바른 답을 맨 위로 올리는 것입니다.
  </Step>

  <Step title="잘라서 LLM에 전달하기">
    다시 순위가 매겨진 상위 3\~5개를 프롬프트에 넣습니다. **이 과정이 더 정밀할수록 모델의
    환각은 줄고, 지불하는 컨텍스트 비용도 줄어듭니다.**
  </Step>
</Steps>

<Info>
  **Recall과 rerank를 모두 건너뛸 수 없는 이유**: 크로스 인코더는 계산을 시작하기 전에 쿼리가 필요하므로,
  오프라인에서 미리 계산할 수 있는 것이 없습니다. 수백만 개의 문서를 하나씩 점수화하는 것은 비용과 지연 시간
  모두에서 감당할 수 없습니다. Recall은 수백만 개를 수백 개로 줄여 주고, reranking은 그 수백 개를
  올바르게 정렬합니다.
</Info>

### 완전한 동작 예제

이것은 최소이지만 완전한 2단계 리트리버입니다 — Recall에는 `text-embedding-3-small`, reranking에는 `bge-reranker-v2-m3`를 사용하며, 둘 다 동일한 APIYI token을 통해 처리합니다:

```python theme={null}
import os
import numpy as np
import requests

BASE = "https://api.apiyi.com/v1"
HEADERS = {"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"}


def embed(texts):
    """Batch embed. In production, document vectors live in a vector DB."""
    r = requests.post(f"{BASE}/embeddings", headers=HEADERS, timeout=60,
                      json={"model": "text-embedding-3-small", "input": texts})
    r.raise_for_status()
    data = sorted(r.json()["data"], key=lambda x: x["index"])
    return np.array([d["embedding"] for d in data])


def rerank(query, documents, top_n=5):
    """Rerank. documents must be a plain string array."""
    r = requests.post(f"{BASE}/rerank", headers=HEADERS, timeout=120,
                      json={"model": "bge-reranker-v2-m3", "query": query,
                            "documents": documents, "top_n": top_n})
    r.raise_for_status()
    return r.json()["results"]


def search(query, corpus, recall_k=50, final_k=5):
    """corpus: [{'id':..., 'text':..., 'meta':...}, ...]"""
    # ---- Stage 1: vector recall ----
    doc_vecs = embed([c["text"] for c in corpus])          # from your vector DB in production
    q_vec = embed([query])[0]
    doc_vecs /= np.linalg.norm(doc_vecs, axis=1, keepdims=True)
    q_vec /= np.linalg.norm(q_vec)
    recalled_idx = np.argsort(-(doc_vecs @ q_vec))[:recall_k]
    candidates = [corpus[i] for i in recalled_idx]

    # ---- Stage 2: rerank ----
    results = rerank(query, [c["text"] for c in candidates], top_n=final_k)

    # Key step: map back by index so you keep ids and metadata
    return [{**candidates[r["index"]], "score": r["relevance_score"]}
            for r in results]


corpus = [
    {"id": "kb-001", "text": "A 429 means you hit a rate limit. Reduce concurrency, implement "
                             "exponential backoff on the client, or ask for a higher RPM quota."},
    {"id": "kb-002", "text": "HTTP 4xx status codes indicate client errors: 400 bad parameters, "
                             "401 unauthorized, 403 forbidden, 404 not found."},
    {"id": "kb-003", "text": "To check your balance, call /v1/dashboard/billing/subscription."},
]

for hit in search("My API requests keep returning 429 — how do I fix it?",
                  corpus, recall_k=3, final_k=2):
    print(f"{hit['score']:.4f}  [{hit['id']}]  {hit['text'][:40]}")
```

<Warning>
  **항상 `index` 기준으로 다시 매핑하고, 반환된 텍스트로 문서를 조회하지 마십시오.**
  문서 내용은 반복될 수 있습니다 — 동일한 두 문서는 완전히 동일한 점수를 받으며
  서로 구분되지 않습니다 — 따라서 텍스트 조회를 하면 잘못된 id와 메타데이터가 연결됩니다.
</Warning>

## 2. 몇 개의 후보를 회수해야 합니까?

측정된 지연 시간(짧은 문서, 각 단계당 5회 실행의 P50):

| 후보   | P50    | P95    |
| ---- | ------ | ------ |
| 1    | 2.00 s | 2.58 s |
| 10   | 2.35 s | 2.68 s |
| 25   | 2.52 s | 2.81 s |
| 50   | 2.92 s | 3.39 s |
| 100  | 3.80 s | 4.32 s |
| 500  | \~15 s | —      |
| 1000 | \~33 s | —      |
| 2000 | \~68 s | —      |

중요한 점은 **약 2초의 고정 오버헤드**입니다. 문서가 1개뿐이어도 2초가 듭니다. 후보를 1개에서 100개로 늘려도 1.8초만 추가되며, 검색 품질 향상은 그보다 훨씬 더 큰 가치가 있습니다.

**지연 시간을 실제로 좌우하는 것은 문서 수가 아니라 총 token입니다.** 동일한 50개 후보 기준으로 보면:

| 50개 후보         | 입력 token | P50 지연 시간 |
| -------------- | -------- | --------- |
| 짧은 문서(각 약 20자) | 673      | 2.48 s    |
| 긴 문서(각 약 480자) | 20,606   | 11.74 s   |

개수는 같지만 지연 시간은 4.7배입니다. 이것이 다음 섹션의 청킹이 검색 속도를 늦추지 않는 이유이기도 합니다 — 청킹은 총 token을 늘리지 않으면서 문서 수를 늘립니다.

<Tip>
  **권장 `recall_k`: 50–100.**

  * 20 미만: 이미 회수 목록이 짧아서 잘못된 순위를 바로잡을 여지가 거의 없습니다 — 아주 적은 이득을 위해 고정 오버헤드를 지불하게 됩니다
  * 200 초과: 지연 시간이 상호작용성을 해치기 시작하며, 회수 목록의 뒤쪽에 답이 있을 가능성은 드물기 때문에 한계 수익은 0에 가까워집니다
  * **1000 이상: 429가 확실합니다.** 후보 1000개는 26,867 token으로, 전체 TPM 20,000 분 예산의 134%에 해당하며 이를 초과합니다 — 재시도와 무관하게 이 요청은 실패가 예정되어 있습니다
</Tip>

정말로 많은 문서를 순위화해야 한다면(예: 오프라인 배치 작업), **동시 실행 수를 4로 제한한 상태에서 여러 개의 ≤100문서 요청으로 분할**하십시오. 분할한다고 총 token이 줄어드는 것은 아닙니다 — TPM 20,000이 여전히 전체 관문이므로, 배치 작업에는 분당 제한 속도가 필요합니다. 해당 쿼터는 확장 중이며, 대규모 배치 워크로드라면 먼저 APIYI 지원팀에 현재 사용할 수 있는 여유분을 확인하는 것이 좋습니다.

## 3. 긴 문서 청크로 나누기

이것은 가장 효과가 큰 전처리 단계입니다. 이유는 두 가지 측정값이 설명합니다.

**첫째, 관련 없는 내용은 관련성을 희석합니다.** 같은 일치 문장에 서로 다른 양의 군더더기를 덧붙이면:

| 총 길이    | 시작에 매치 | 끝에 매치 | 끝 / 시작 |
| ------- | ------ | ----- | ------ |
| 528 문자  | 0.933  | 0.720 | 0.77   |
| 1028 문자 | 0.931  | 0.500 | 0.54   |
| 2028 문자 | 0.925  | 0.793 | 0.86   |
| 4028 문자 | 0.907  | 0.351 | 0.39   |
| 8028 문자 | 0.828  | 0.181 | 0.22   |

**둘째, 길이는 잡음 점수를 부풀립니다.** 같은 관련 없는 문서는 짧을 때 0.029였고, 450문자의 군더더기를 더한 뒤에는 0.121이 되어 4배 높아졌습니다.

종합하면: **답이 끝에 있는 긴 문서는 완전히 주제에서 벗어난 긴 문서에 밀립니다.**

<Tip>
  **청크 나누기 전략**

  1. 정답이 경계에서 잘리지 않도록 10~~20% 중복을 두고 \*\*200~~500문자\*\* 단위로 청크를 나눕니다
  2. 각 청크를 `documents` 배열의 개별 요소로 전송합니다
  3. **가장 높은 청크 점수**를 문서의 점수로 사용한 뒤, 문서 기준으로 중복 제거합니다
  4. prompt를 구성할 때는 일치하는 청크만 보내거나 전체 문서를 보내되, 컨텍스트 예산이 허용하는 쪽을 선택합니다
</Tip>

```python theme={null}
def chunk(text, size=400, overlap=60):
    step = size - overlap
    return [text[i:i + size] for i in range(0, max(len(text) - overlap, 1), step)]


def rerank_long_docs(query, docs, top_n=5):
    """docs: [{'id':..., 'text':...}] — score by chunk, aggregate to best chunk per document."""
    flat, owner = [], []
    for d in docs:
        for c in chunk(d["text"]):
            flat.append(c)
            owner.append(d)

    best = {}
    for r in rerank(query, flat, top_n=len(flat)):
        d = owner[r["index"]]
        if r["relevance_score"] > best.get(d["id"], (0, None))[0]:
            best[d["id"]] = (r["relevance_score"], flat[r["index"]], d)

    ranked = sorted(best.values(), key=lambda x: -x[0])[:top_n]
    return [{**d, "score": s, "best_chunk": c} for s, c, d in ranked]
```

<Warning>
  **8192 tokens는 쿼리-문서 쌍당 적용되는 엄격한 한계입니다**, 이를 초과하면 400
  (`This model's maximum context length is 8192 tokens`)이 반환되며, **조용히 잘라내지 않습니다**.

  이 한계는 요청 전체에 대한 것이 아닙니다. 400개의 문서 × 1000문자
  (330K tokens)를 포함한 단일 요청도 정상적으로 반환됩니다. 따라서 청크 나누기는 품질을 보호할 뿐 아니라 이 400도 방지합니다.
</Warning>

## 4. 임계값 설정(0.5만 고르지 마십시오)

`relevance_score`는 sigmoid로 0–1 범위에 매핑되므로 신뢰도 값처럼 보입니다. **그렇지 않습니다.**

전체 품질 테스트 사례에서 측정한 분포는 다음과 같습니다.

| 그룹                          | 실제로 관련 있는 문서의 점수 범위 | 중앙값   |
| --------------------------- | ------------------- | ----- |
| 중국어 쿼리 × 중국어 문서             | 0.289 – 1.000       | 0.948 |
| 동일 언어, 비중국어(JA/KO/RU/FR/AR) | 0.005 – 0.998       | 0.241 |
| **교차 언어(ZH ↔ EN)**          | **0.0038 – 0.205**  | 0.008 |
| 무관한 방해 문서(중국어)              | 최고값 **0.945**       | 0.029 |

고정된 0.5 임계값은 **모든 올바른 교차 언어 결과를 제외**하고, 비중국어 언어에서 두 번째로 높은 적중 대부분도 제외하는 반면, "Apple Inc. FY2024 revenue"의 경우 사과 재배 가격에 대한 문서가 0.945점을 받아 3위에 올랐습니다.

마지막 행에 주목하십시오. 가장 높은 점수의 *무관한* 문서(0.945)가 가장 낮은 점수의 *관련 있는* 문서(0.289)보다 높습니다. 두 분포는 겹칩니다. 바로 그 때문에 **안전한 절대 임계값은 존재하지 않습니다.**

<Tip>
  **권장 순서대로 사용할 수 있는 필터링 전략 3가지:**

  1. **필터링하지 말고 상위 N개를 사용하십시오**(N = 3–5). 가장 단순하고 실수하기 가장 어렵습니다. 대규모 언어 모델은 약간의 노이즈를 견딥니다
  2. **상대 임계값**: `score >= top1_score × α`인 결과만 유지하십시오. α는 0.2–0.3 정도입니다. 이렇게 하면 낮은 교차 언어 기준선에 맞춰 자동으로 조정되면서도 긴 꼬리는 여전히 줄일 수 있습니다
  3. **절대 임계값**: 먼저 **자체 샘플에 라벨을 붙이고 자체 코퍼스에서 분포를 측정한 뒤에만** 사용하십시오. 그리고 언어별, 쿼리 유형별로 따로 설정하십시오. 다른 사람의 임계값을 재사용하지 마십시오
</Tip>

```python theme={null}
def filter_by_relative_threshold(results, alpha=0.25, max_n=5):
    if not results:
        return []
    top = results[0]["relevance_score"]
    return [r for r in results if r["relevance_score"] >= top * alpha][:max_n]
```

## 5. 부정에는 안전장치가 필요합니다

이것은 이 모델의 분명한 약점입니다. “겨울에 가기 좋은 관광지는 어디입니까?”라는 질문에서, 두 문서는 자신들이 **아니라고 명시적으로 말했는데도** 2위와 3위에 랭크되어, 정말 관련 있는 결과가 4위와 5위로 밀려났습니다. nDCG\@3는 0.47이었습니다.

모델은 “겨울 + 관광지 + 여행”이라는 주제에만 맞췄고, **부정을 전혀 처리하지 못했습니다**.

<Warning>
  부정, 제외 또는 조건문이 포함된 모든 쿼리 — “gluten-free recipes”, “offices
  outside Beijing”, “clauses not applicable to minors”, “which regions do **not** support delivery” —
  에서는 reranked Top-N을 **그대로 사용자에게 전달해서는 안 됩니다**.
</Warning>

**해결책**: reranking 뒤에 가벼운 LLM 검증 단계를 추가하십시오. 저렴한 소형 모델이면 충분합니다:

```python theme={null}
from openai import OpenAI

client = OpenAI(api_key=os.environ["APIYI_API_KEY"],
                base_url="https://api.apiyi.com/v1")

NEG_HINT = ("not ", "n't", "without", "except", "exclude", "free of", "non-")


def verify_if_negated(query, hits):
    """When the query carries negation, confirm each hit actually satisfies it."""
    q = query.lower()
    if not any(k in q for k in NEG_HINT):
        return hits
    kept = []
    for h in hits:
        resp = client.chat.completions.create(
            model="gemini-3.5-flash-lite",
            messages=[{"role": "user", "content":
                       f"Question: {query}\nDocument: {h['text']}\n"
                       f"Does this document positively satisfy the question's condition? "
                       f"Answer only YES or NO."}],
            max_tokens=4,
        )
        if "YES" in resp.choices[0].message.content.upper():
            kept.append(h)
    return kept
```

## 6. 다국어 및 교차 언어 사용

중국어, 영어, 일본어, 한국어, 러시아어, 프랑스어, 아랍어 — 그리고 ZH↔EN 교차 언어 검색까지 — 모두 테스트에서 **정확한 순서로** 정렬됩니다. 하나의 모델로 다국어 지식 베이스를 커버하므로, 언어별 배포가 필요하지 않습니다.

하지만 **점수 크기**에는 주의해야 합니다:

| 사례                 | 측정된 top-1 점수 |
| ------------------ | ------------ |
| 중국어 쿼리 × 중국어 문서    | 0.97         |
| 한국어 쿼리 × 한국어 문서    | 0.87         |
| 아랍어 쿼리 × 아랍어 문서    | 1.00         |
| **중국어 쿼리 × 영어 문서** | **0.20**     |
| **영어 쿼리 × 중국어 문서** | **0.011**    |

교차 언어의 정답은 1\~2자릿수 정도 더 낮은 점수를 받지만 — **순서는 여전히 유지됩니다**.

<Tip>
  다국어 말뭉치를 위한 두 가지 규칙입니다:

  * **점수보다 순서를 우선하십시오.** 상대 임계값(전략 2)이 여기서는 절대 임계값보다 훨씬 더 안전합니다
  * 절대 임계값을 반드시 사용해야 한다면, **전역적으로가 아니라 쿼리 언어 × 문서 언어 쌍별로** 조정하십시오
</Tip>

## 7. 동시 실행 수, 캐싱 및 멱등성

### 먼저 쿼터를 예산으로 잡고, 그다음 동시 실행 수를 논의합니다

상위(Huawei Cloud MaaS)는 이 모델에 대해 **TPM 20,000 / RPM 120**을 허용합니다. 이것은 사람들이 가장 자주 과소평가하는 제약입니다. 같은 플랫폼의 BGE-M3 embedding model은 TPM 1,200,000을 제공하므로 **60배 더 많습니다**.

테스트는(각 케이스마다 쿼터 윈도우가 초기화되도록 70초간 무응답을 둠) 두 개의 **독립적인** 메커니즘을 분리해 보여줍니다:

| 케이스 | 시나리오                            | 성공        | TPM 대비 token 비율 | 비고                              |
| --- | ------------------------------- | --------- | --------------- | ------------------------------- |
| R1  | 동시 10개 x 요청 10개(아주 작음)          | 4/10      | 4%              | token이 거의 없는데도 실패함              |
| R2  | 동시 20개 x 요청 20개(아주 작음)          | 5/20      | 3%              | 동시 실행 수를 두 배로 늘려도 여전히 4\~5개에 머묾 |
| R4  | **완전 직렬** 요청 20개(각각 1.3K token) | 11/20     | 97%             | 동시 실행 수가 0이어도 **429가 발생함**      |
| R5  | **완전 직렬** 아주 작은 요청 20개          | **20/20** | 0%              | 직렬 요청은 영향을 받지 않음                |

**발견 1: 대략 4\~5개의 동시 진행 슬롯입니다.** R1/R2는 TPM의 3~~4%만 사용하지만 넓게 실패하며, 동시 실행 수를 10에서 20으로 올려도 성공 수는 여전히 4~~5개로 제한됩니다. 반면 R5의 직렬 요청 20개는 모두 통과합니다. 슬롯 한도를 넘는 요청은 **큐에 쌓이지 않고 즉시 거절됩니다**.

**발견 2: TPM 20,000은 동시 실행 수와 무관하게 적용됩니다.** R4는 완전 직렬이며, 8번째 요청은 누적 16,093 token에서 429를 반환하고, 윈도우가 넘어가기 전까지 9번 연속 실패합니다:

```
#1–#7   [200]  cumulative tokens climbing to 16,093
#8      [429]  ← first rejection (quota 20,000)
#9–#16  [429]  nine consecutive failures
#17–#20 [200]  ← window slides, recovers
```

<Warning>
  두 실패 모드는 **동일한** 메시지(`upstream load saturated`)를 반환하므로, 응답만으로는
  어느 제한에 걸렸는지 알 수 없습니다. 따라서 설계 단계에서 이 둘을 모두 예산에
  반영해야 하며, 아래 표가 바로 그 용도입니다.
</Warning>

### 분당 검색 수

측정된 `≈26.9 tokens/document`를 사용하면:

| 쿼리당 후보 수 | 호출당 token 수 | TPM 20,000에서의 이론적 상한 |
| -------- | ----------- | -------------------- |
| 50       | 673         | \~29 / 분             |
| 100      | 1,325       | **\~15 / 분**         |
| 200      | 2,629       | \~7 / 분              |

**후보 수는 품질 결정이기도 하지만 용량 결정이기도 합니다**: 후보를 두 배로 늘리면 품질 이득은 제한적인 반면 처리량은 절반으로 줄어듭니다.

또한 단일 요청에 후보를 너무 많이 담을 수 없는 이유도 설명합니다. 후보 1000개는 26,867 token으로, \*\*한 번의 호출에 해당 분 전체 예산의 134%\*\*이므로 429가 확정입니다. 2000개면 269%입니다.

<Tip>
  **통합 체크리스트**: 동시 실행 수를 4로 제한합니다. 지수 백오프를 구현합니다. 피크 QPS가
  위 표와 맞는지 확인합니다. 자주 반복되는 쿼리(다음 섹션)를 캐시하여 쿼터를 아예
  소모하지 않도록 합니다.
</Tip>

<Info>
  **쿼터 확대가 진행 중입니다.** 위의 TPM 20,000은 상위의 초기 할당량이며,
  APIYI는 이미 상향 조정을 신청했습니다. 워크로드가 표에서 허용하는 범위를 초과한다면,
  현재 수치에 맞추어 설계를 축소하기보다는 **APIYI 지원팀에 문의해 상위 쿼터 재검토를 요청하십시오**
  .
</Info>

### 캐싱

**동일한 요청을 10번 반복하면 비트 단위로 동일합니다**(드리프트 0). 드리프트 \~3.7e-4는 후보 **순서**를 섞을 때만 나타나며(bf16 배칭 지터), 순서는 영향을 받지 않습니다.

따라서 결과는 **캐시해도 안전합니다**:

* `normalised query + ordered hash of document contents`를 키로 사용합니다
* **`relevance_score` 자체를 멱등성 또는 중복 제거 키로 사용하지 마십시오** — 후보 순서를 바꾸면 마지막 자릿수가 변합니다
* 반복 쿼리(FAQ, 인기 검색)는 보통 잘 캐시되어 지연 시간과 상위 부하를 모두 줄입니다

## 8. 기존 프레임워크와의 통합

파라미터 이름은 Cohere Rerank v1(`query` / `documents` / `top_n` / `return_documents`)와 일치하지만, **`documents`는 문자열 배열만 허용합니다** — `[{"text": "..."}]`는 400을 반환합니다 — 그리고 응답에는 `id` / `meta` 필드가 없습니다.

<Warning>
  **`cohere` SDK v2는 그대로는 작동하지 않습니다**: `/v2/rerank`를 대상으로 하며, 그 경로는 HTTP 200으로 웹사이트의 HTML 홈페이지를 반환하므로 SDK에서 파싱 오류가 발생합니다. HTTP 호출을 직접 감싸는 것이 가장 간단합니다.
</Warning>

<CodeGroup>
  ```python LangChain theme={null}
  from typing import Sequence
  import os, requests
  from langchain_core.documents import Document
  from langchain_core.callbacks import Callbacks
  from langchain.retrievers.document_compressors.base import BaseDocumentCompressor


  class ApiyiRerank(BaseDocumentCompressor):
      model: str = "bge-reranker-v2-m3"
      top_n: int = 5
      base_url: str = "https://api.apiyi.com/v1"

      def compress_documents(self, documents: Sequence[Document], query: str,
                             callbacks: Callbacks = None) -> Sequence[Document]:
          docs = list(documents)
          if not docs:
              return []
          r = requests.post(
              f"{self.base_url}/rerank", timeout=120,
              headers={"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"},
              json={"model": self.model, "query": query,
                    "documents": [d.page_content for d in docs], "top_n": self.top_n},
          )
          r.raise_for_status()
          out = []
          for item in r.json()["results"]:
              d = docs[item["index"]]                    # map back by index, keeping metadata
              d.metadata["relevance_score"] = item["relevance_score"]
              out.append(d)
          return out
  ```

  ```python LlamaIndex theme={null}
  from typing import List, Optional
  import os, requests
  from llama_index.core.postprocessor.types import BaseNodePostprocessor
  from llama_index.core.schema import NodeWithScore, QueryBundle


  class ApiyiRerank(BaseNodePostprocessor):
      model: str = "bge-reranker-v2-m3"
      top_n: int = 5
      base_url: str = "https://api.apiyi.com/v1"

      def _postprocess_nodes(self, nodes: List[NodeWithScore],
                             query_bundle: Optional[QueryBundle] = None
                             ) -> List[NodeWithScore]:
          if not nodes or query_bundle is None:
              return nodes
          r = requests.post(
              f"{self.base_url}/rerank", timeout=120,
              headers={"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"},
              json={"model": self.model, "query": query_bundle.query_str,
                    "documents": [n.node.get_content() for n in nodes],
                    "top_n": self.top_n},
          )
          r.raise_for_status()
          out = []
          for item in r.json()["results"]:
              n = nodes[item["index"]]
              n.score = item["relevance_score"]
              out.append(n)
          return out
  ```

  ```python 일반 래퍼(재시도 포함) theme={null}
  import os, time, requests

  BASE = "https://api.apiyi.com/v1"


  def rerank(query, documents, top_n=5, tries=4):
      """Rerank with backoff. A 429 means upstream congestion and usually clears on retry."""
      delay = 5
      for attempt in range(tries):
          r = requests.post(
              f"{BASE}/rerank", timeout=120,
              headers={"Authorization": f"Bearer {os.environ['APIYI_API_KEY']}"},
              json={"model": "bge-reranker-v2-m3", "query": query,
                    "documents": documents, "top_n": top_n},
          )
          if r.status_code == 429 and attempt < tries - 1:
              time.sleep(delay)
              delay *= 2
              continue
          r.raise_for_status()
          return r.json()["results"]
  ```
</CodeGroup>

**Dify / RAGFlow / FastGPT의 경우**: Model Provider → Rerank Model에서 Cohere/Jina 인터페이스와 호환되는 사용자 지정 제공자를 선택하고 다음을 입력합니다:

| 설정         | 값                          |
| ---------- | -------------------------- |
| API 기본 URL | `https://api.apiyi.com/v1` |
| API Key    | APIYI token(`sk-`로 시작)     |
| 모델 이름      | `bge-reranker-v2-m3`       |

<Warning>
  **경로에는 반드시 `/v1`가 포함되어야 합니다.** `/rerank`와 `/v2/rerank` 모두 JSON 404가 아니라 HTTP 200으로 웹사이트의 HTML 홈페이지를 반환합니다. 이는 플랫폼에서 "unparseable response" 또는 "model unavailable"로 표시되며 원인 파악이 어렵습니다. 다른 원인을 의심하기 전에 최종 요청 URL이 `https://api.apiyi.com/v1/rerank`인지 확인하십시오.

  플랫폼이 `/v1`를 자체적으로 덧붙여 `{base}/v1/rerank`를 만들 경우, API Base를 `https://api.apiyi.com`로 설정하여 중복된 `/v1`가 생기지 않게 하십시오. 단일 `curl`로 경로를 가장 빠르게 확인할 수 있습니다.
</Warning>

## 9. 출시 전 체크리스트

<AccordionGroup>
  <Accordion title="정확성">
    * [ ] `results[].index`를 통해 역매핑하며, 텍스트를 일치시켜서 하지 않음
    * [ ] 긴 문서는 200–500자 단위로 분할하고 최적 청크 점수 기준으로 집계함
    * [ ] 단일 쿼리-문서 쌍이 8192 tokens를 초과하지 않음
    * [ ] 부정 또는 제외가 포함된 쿼리는 LLM 검증 단계를 거침
  </Accordion>

  <Accordion title="신뢰성">
    * [ ] 후보 집합은 100개로 상한을 둠
    * [ ] **동시 실행 수는 4로 상한을 둠** (측정 결과: 상위 시스템은 약 4–5개의 in-flight 요청까지 허용하며, 초과분은 대기열에 쌓이지 않고 즉시 거부됨)
    * [ ] **피크 처리량이 TPM 20,000 기준으로 점검됨** (\~100개 후보에서 분당 약 15회 검색) 그리고 충분함이 확인됨
    * [ ] 429에 대한 백오프 재시도 구현됨 (상위 시스템의 혼잡은 일시적임)
    * [ ] 타임아웃이 60초 이상으로 설정됨 (짧은 문서 100개는 P95에서 약 4.3초이지만, 긴 문서나 큰 집합은 수십 초에 도달함)
    * [ ] 요청 경로가 `/v1/rerank`로 확인됨 — 잘못된 경로는 404가 아니라 200 + HTML을 반환함
    * [ ] 모델 이름이 정확하고 소문자로 표기됨 — 오타는 503을 반환하며, 쉽게 장애로 오인될 수 있음
  </Accordion>

  <Accordion title="품질">
    * [ ] 필터링은 추정된 고정값이 아니라 Top-N 또는 상대 임계값을 사용함
    * [ ] 다국어 및 교차 언어 점수 크기를 검증하여 낮은 점수가 필터링되지 않도록 함
    * [ ] 소규모 라벨링된 쿼리 세트로 A/B 테스트를 수행하여 (rerank 켬 대 끔) 지표가 실제로 움직였는지 확인함
  </Accordion>

  <Accordion title="비용 및 캐싱">
    * [ ] `usage.input_tokens` / `output_tokens`는 항상 0임을 인지함 — `prompt_tokens` / `total_tokens`를 읽어야 함
    * [ ] `top_n`도 `return_documents`도 사용량을 줄이지 않음을 인지함 — 모든 후보가 점수화됨
    * [ ] 콘솔 청구서를 기준으로 비용을 집계함 (100개 후보에서 `prompt_tokens`와 `total_tokens`는 약 45% 차이가 나며, 이번 라운드에서는 어느 쪽이 과금되는지 확인할 수 없었음)
    * [ ] 자주 사용하는 쿼리에 대한 결과 캐싱이 적용됨
  </Accordion>
</AccordionGroup>

## 관련 문서

* [bge-reranker-v2-m3 개요](/ko/api-capabilities/rerank/overview)
* [Rerank API 플레이그라운드](/ko/api-capabilities/rerank/rerank-api)
* [텍스트 임베딩](/ko/api-capabilities/text-embedding)
