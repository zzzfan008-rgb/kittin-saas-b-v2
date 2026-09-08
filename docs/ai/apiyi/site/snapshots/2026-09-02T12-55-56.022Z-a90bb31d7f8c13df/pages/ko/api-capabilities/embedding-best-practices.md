> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 실전 임베딩 튜닝

> 임베딩에서 실제로 가치를 얻는 방법: bge-m3와 세 가지 OpenAI 모델의 측정 비교, 청크를 얼마나 크게 나눌지, 유사도 임계값을 어떻게 설정할지, 배칭과 동시 실행 수를 얼마나 사용할지, 비용이 실제로 어떻게 계산되는지, 그리고 조용히 재현율을 80%에서 15%로 떨어뜨리는 LangChain 기본값까지.

[텍스트 임베딩](/ko/api-capabilities/text-embedding)에서는 API를 호출하는 방법을 다룹니다. 이 페이지에서는 **올바르게 사용하는 방법**을 다룹니다.

임베딩 문제의 거의 대부분은 호출 실패로 나타나지 않습니다. 엔드포인트는 200을 반환하고, 차원도 맞지만,
검색 품질이 조용히 무너집니다. 아래의 모든 권장 사항은 2026-08-25 (UTC+8)에 APIYI 게이트웨이에서 측정한 값에 기반합니다. 일반적인 조언이 아닙니다.

<Note>
  **방법**: LLM 게이트웨이 통합에 관한 중국어 문서 20개와 일치하는 영어 문서 20개, 수작업으로 라벨링된 답변이 있는 중국어 쿼리 20개와 영어 쿼리 20개를 사용했으며, 세 모델을 모두 같은 시간 창에서 같은 코퍼스에 대해 실행했습니다. 코퍼스가 작으므로 **5퍼센트포인트 미만의 차이는 결론적이지 않습니다** — 어떤 내용을 최종적으로 받아들이기 전에 반드시 자신의 데이터에서 재현하십시오.
</Note>

## 1. 먼저 적절한 모델을 선택합니다

|                    | `bge-m3`             | `text-embedding-3-small` | `text-embedding-3-large` |
| ------------------ | -------------------- | ------------------------ | ------------------------ |
| 가격                 | **\$0.01/1M tokens** | \$0.02/1M tokens         | \$0.13/1M tokens         |
| 차원                 | **1024**             | 1536                     | 3072                     |
| 최대 길이              | 8192 tokens          | 8191 tokens              | 8191 tokens              |
| 사전 정규화 여부          | 예                    | 예                        | 예                        |
| `dimensions` 매개변수  | ❌ 명시적 400            | ✅                        | ✅                        |
| 중국어 재현율@1          | 80%                  | 80%                      | 85%                      |
| 영어 재현율@1           | 70%                  | 80%                      | 85%                      |
| 혼합 zh+en 말뭉치 재현율@1 | 65%                  | 80%                      | 85%                      |
| 중국어 토큰 밀도          | **2.1 문자/token**     | 0.9 문자/token             | 0.9 문자/token             |

<CardGroup cols={2}>
  <Card title="bge-m3를 선택하는 경우" icon="check">
    * 말뭉치가 **대부분 중국어**(또는 일본어 / 러시아어)인 경우: 검색 품질은 3-small과 같고, 목록
      가격은 절반이며, 같은 텍스트는 필요한 tokens가 42%에 불과합니다 — **실제 지출은 약 1/5 수준**입니다
    * 더 작은 저장 공간이 필요한 경우: 1024 차원은 1536보다 33% 작고 3072보다 66% 작습니다
    * 롱테일 언어(100개 이상 지원)에 대한 커버리지가 필요한 경우
    * 동일한 오픈소스 모델을 로컬에서 실행하여 오프라인과 온라인 벡터가 일치하길 원하는 경우
  </Card>

  <Card title="OpenAI를 선택하는 경우" icon="check">
    * 말뭉치가 **대부분 영어 또는 코드**인 경우: 품질이 한 단계 더 높습니다. bge-m3는 이러한 콘텐츠에서
      15%–50% 더 많은 tokens를 소모하지만, 단가가 절반이므로 전체적으로는 여전히 더 저렴합니다 — 따라서
      **여기서는 가격이 아니라 품질로 판단하세요**
    * 지식 베이스가 **여러 언어가 섞여 있으며** 답변을 하나만 받으면 되는 경우
    * 저장 공간을 줄이기 위해 `dimensions`가 필요한 경우
    * 이미 OpenAI 점수 범위에 맞춰 임계값을 보정해 두었고 다시 조정하고 싶지 않은 경우
  </Card>
</CardGroup>

<Warning>
  **다국어 말뭉치는 bge-m3의 약점입니다**(Recall\@1 65%). 교차 언어 검색이
  나쁜 것이 아니라 그 반대입니다. 중국어와 영어 버전의 동일한 사실에 거의 동일한 점수를 부여합니다
  (측정값 0.75–0.87, OpenAI는 0.56–0.69), 그래서 중국어 쿼리는 종종 영어 사본을
  중국어 사본보다 더 위에 순위 매깁니다.

  **RAG가 단일 답변을 반환한다면**, 인덱스를 언어별로 분리하거나 쿼리 시점에 언어 필터를 추가하세요.
  **언어를 넘나들며 자료를 모아야 한다면**, 이는 버그가 아니라 기능입니다.
</Warning>

## 2. 긴 문서는 항상 청크로 나누십시오

`bge-m3`에는 8192-token 윈도우가 있으므로 긴 매뉴얼도 한 번의 호출에 들어갑니다. **하지만 그렇다고 해서 그 방법이 좋은 것은 아닙니다.**

측정 결과: 20개 섹션을 하나의 긴 매뉴얼로 이어 붙이고, 20개의 짧은 문서(각각 하나의 섹션에 해당)를 강한 방해 요소로 추가한 뒤 20개의 질문으로 조회했을 때 —

| 접근 방식             | 결과                                                                    |
| ----------------- | --------------------------------------------------------------------- |
| 전체 문서를 하나의 벡터로 사용 | 매뉴얼이 첫 번째로 랭크되는 비율은 \*\*10%\*\*입니다                                    |
| 섹션별로 청크 분할        | Top1이 매뉴얼 안에 들어가는 비율은 \*\*75%\*\*이며; *정확한* 섹션을 맞히는 비율은 \*\*65%\*\*입니다 |

같은 질문에 대해, 올바른 섹션은 전체 문서보다 평균적으로 **+0.10** 높게 점수화됩니다:

| 질문                     | 전체 문서 | 올바른 섹션 | 차이         |
| ---------------------- | ----- | ------ | ---------- |
| RMB를 USD로 어떻게 환전합니까    | 0.487 | 0.684  | **+0.198** |
| 유효한 JSON 출력을 어떻게 보장합니까 | 0.487 | 0.650  | **+0.163** |
| 401을 받았을 때 무엇을 해야 합니까  | 0.485 | 0.612  | +0.127     |

긴 문서의 단일 벡터는 그 안에 있는 모든 것의 **평균**이므로, 정확하게 표현된 짧은 문단이 언제나 그것을 이깁니다.

<Tip>
  **청크 분할 지침**

  * 의미 경계를 기준으로 **200–500 token** 단위로 나누고, 10%–15% 겹침을 두십시오
  * 중국어는 token당 약 2.1자 정도이므로, 200–500 token은 대략 **420–1050개의 중국어 문자**에 해당합니다
  * **아주 작은 청크로 잘게 쪼개지 마십시오**: 모든 입력에는 고정된 특수 token 2개가 포함되므로, 500-token 청크에서는 0.4%의 오버헤드지만 16-token 청크에서는 12.5%의 순수한 낭비입니다
  * 각 청크 앞에 섹션 제목을 붙이면 청크의 식별 가능성이 눈에 띄게 향상됩니다
</Tip>

## 3. 임계값은 모델별로 재보정해야 합니다

OpenAI에서 `bge-m3`로 마이그레이션할 때 가장 자주 잘못되는 부분이 바로 여기입니다. **두 점수 범위는 완전히 다릅니다.**

같은 수작업 라벨링 쌍을 세 모델이 점수화한 결과는 다음과 같습니다:

| 관계                                                    | `bge-m3`  | `3-small` | `3-large` |
| ----------------------------------------------------- | --------- | --------- | --------- |
| 관련 없음 ("스트리밍을 활성화하는 방법" ↔ "오늘 베이징의 날씨")               | **0.417** | 0.094     | 0.108     |
| 의역 ("429를 받았습니다" ↔ "API에서 요청 제한이라고 표시합니다")            | 0.552     | 0.420     | 0.360     |
| 교차 언어 의역                                              | 0.753     | 0.557     | 0.681     |
| 주어/목적어가 바뀜 ("사용자가 모델에 이미지를 보냄" ↔ "모델이 사용자에게 이미지를 보냄") | 0.975     | 0.908     | 0.895     |

<Warning>
  `bge-m3`의 **하한은 0.42**입니다; OpenAI의 하한은 0.09입니다.
  “0.3 미만은 모두 버린다” 같은 규칙을 그대로 복사하면 `bge-m3`에서는 사실상 필터링이 전혀 되지 않습니다.
  “0.8 이상만 관련 있음으로 친다”를 그대로 복사하면 거의 모든 올바른 결과를 버리게 됩니다.
</Warning>

`bge-m3`에 대해 측정된 최적의 단일 임계값:

| 시나리오             | 권장 시작 임계값 | 해당 임계값에서의 정확도 |
| ---------------- | --------- | ------------- |
| 중국어 말뭉치 / 중국어 쿼리 | **0.53**  | 75%           |
| 영어 말뭉치 / 영어 쿼리   | 0.51      | 80%           |
| 교차 언어 검색         | 0.53–0.55 | 75%–82%       |
| 혼합 언어 말뭉치        | 0.62      | 68%           |

비교를 위해, 중국어 시나리오에서의 최적 임계값은 `text-embedding-3-small`의 경우 **0.45**, `3-large`의 경우 **0.33**입니다.

<Tip>
  **실무에서는** **0.50**에서 시작하고, **0.45–0.60**을 확인이 필요한 회색 지대로 간주한 다음, 실제로 서비스를 시작하기 전에 자체 말뭉치에서 라벨링된 50–100개 샘플을 기준으로 재보정하십시오.
</Tip>

## 4. 유사도만으로는 어떤 것이 *정확한지* 알 수 없습니다

이것은 **모든** 임베딩 모델에 해당합니다 — 특정 모델 하나의 결함이 아니라, 미리 알고 계셔야 합니다:

| 쌍                                                                                | `bge-m3` | `3-small` | `3-large` |
| -------------------------------------------------------------------------------- | -------- | --------- | --------- |
| "function calling을 지원합니다" ↔ "function calling을 **지원하지 않습니다**"                    | 0.891    | 0.851     | 0.805     |
| "\$**2** per million tokens" ↔ "\$**20** per million tokens"                     | 0.965    | 0.954     | 0.902     |
| "base\_url을 api.**apiyi**.com으로 지정합니다" ↔ "base\_url을 api.**openai**.com으로 지정합니다" | 0.873    | 0.878     | 0.738     |
| "사용자가 모델에 이미지를 보냅니다" ↔ "모델이 사용자에게 이미지를 보냅니다"                                     | 0.975    | 0.908     | 0.895     |

세 경우 모두 실패합니다. **코사인 유사도는 두 텍스트가 같은 주제에 관한 것인지 측정할 뿐, 서로 동의하는지는 측정하지 않습니다.**

부정, 가격, 버전 번호 및 엔티티 이름은 검색 단계에서 분리할 수 없습니다. 올바른
대체 방안은 다음과 같습니다:

<Steps>
  <Step title="벡터 리콜, Top 50–100">
    `bge-m3`를 사용하여 후보 범위를 빠르게 좁히십시오. 임계값은 명백히 관련 없는 항목만 걸러냅니다.
  </Step>

  <Step title="Top 3–5로 재랭크">
    후보를 [`bge-reranker-v2-m3`](/ko/api-capabilities/rerank/overview)로 보내십시오. 이것은 쿼리와 문서를 모델에 함께 통과시키는 cross-encoder이며, **이런 미세한 구분에 정확히 맞는 도구입니다** — 그리고 `bge-m3`와 같은 모델 계열에서 나왔습니다.
  </Step>

  <Step title="생성 시점에 LLM이 판단하게 합니다">
    원래 질문과 함께 Top 3–5를 전달하고, 검색된 내용이 질문과 일치하지 않으면 아무것도 찾지 못했다고 말하도록 prompt에 명시적으로 적으십시오.
  </Step>
</Steps>

## 5. 배치 크기와 동시 실행 수

### 배치 처리: 변곡점은 64–128입니다

| 배치      | 총 소요 시간 | 항목당      |
| ------- | ------- | -------- |
| 16      | 1.67s   | 105ms    |
| 64      | 5.04s   | 79ms     |
| **128** | 7.45s   | **58ms** |
| 256     | 14.6s   | 57ms     |
| 1024    | 54.4s   | 53ms     |

128을 넘으면 항목당 비용은 거의 개선되지 않으며(58ms → 53ms), 단일 요청은 7배로 커집니다.
요청 지속 시간은 클라이언트 타임아웃 위험과 한 번의 실패가 얼마나 많은 작업을 날리는지를 직접 좌우합니다.

### 동시 실행 수: 온라인용 8, 대량 인덱싱용 32–48

| 동시 실행 수          | 성공률       | 총 처리량           | 가장 느린 요청 |
| ---------------- | --------- | --------------- | -------- |
| 8 (200 requests) | **100%**  | 55 items/s      | 5.6s     |
| 48               | 99.3%     | **133 items/s** | 10.2s    |
| 96               | **88.2%** | 65 items/s      | 59.8s    |

* **실시간 검색에는 동시 실행 수 8을 사용하십시오**: 실패 없이 200 requests를 처리합니다
* **대량 인덱싱은 32–48까지 가능합니다**: 처리량이 가장 높지만 429s가 나타나기 시작하므로 지수 백오프가 필요합니다
* **64를 초과하지 마십시오**: 96에서는 실패율이 11.8%이며 요청이 약 60초 동안 멈추기 시작합니다

<Warning>
  **클라이언트는 재시도해야 합니다.** 동시 실행 수가 낮아도 요청의 약 0.8%는 끊긴 연결
  (`Connection aborted / Remote end closed connection`)에 걸립니다. 한 번 재시도하면 해결되며, 재시도하지 않으면 인덱스에 공백이 생깁니다.

  대량 인덱싱에서는 클라이언트 타임아웃을 수백 초가 아니라 **60–90초**로 설정하십시오 — 멈춘 요청은
  실패한 요청보다 처리하기 어렵습니다.
</Warning>

```python theme={null}
import time
from openai import OpenAI

client = OpenAI(api_key="sk-your-apiyi-key", base_url="https://api.apiyi.com/v1", timeout=90.0)

def embed_batch(texts, model="bge-m3", retries=3):
    """Batch embedding with backoff. Keep batches between 64 and 128."""
    for attempt in range(retries):
        try:
            resp = client.embeddings.create(model=model, input=texts)
            return [d.embedding for d in sorted(resp.data, key=lambda x: x.index)]
        except Exception:
            if attempt == retries - 1:
                raise
            time.sleep(2 ** attempt)          # 1s, 2s, 4s
```

## 6. 비용이 실제로 계산되는 방식

비용은 두 가지의 곱입니다. **단가**와 **주어진 텍스트 조각이 몇 개의 tokens가 되는지**입니다.
여기서는 둘 다 다릅니다.

`bge-m3`는 **\$0.01 / 1M tokens**이고, `text-embedding-3-small`는 **\$0.02**입니다. 먼저 단가만 해도 절반입니다.
여기에 더해 토크나이저 효율도 있습니다. `bge-m3`는 XLM-R SentencePiece를 사용하며 토큰당 약 2.1개의 중국어 문자를 처리하고,
반면 OpenAI의 cl100k는 약 0.9입니다.

| 말뭉치              | `bge-m3` tokens | OpenAI tokens | 토큰 비율 | **실제 지출** |
| ---------------- | --------------- | ------------- | ----- | --------- |
| 중국어 기술 문서 (492자) | **231**         | 552           | 0.42× | **0.21×** |
| 일본어 (456자)       | **231**         | 480           | 0.48× | **0.24×** |
| 러시아어 (810자)      | **213**         | 411           | 0.52× | **0.26×** |
| 혼합 zh+en (760자)  | 413             | 360           | 1.15× | 0.57×     |
| 영어 기술 문서 (1053자) | 210             | 182           | 1.15× | 0.58×     |
| 코드 스니펫 (1200자)   | 453             | 300           | 1.51× | 0.76×     |

**중국어 말뭉치의 비용은 대략 `text-embedding-3-small`의 5분의 1입니다.**
영어와 코드는 `bge-m3`에서 더 많은 tokens를 소모하지만, 단가가 절반이기 때문에 총 지출에서는 여전히 OpenAI보다 낮습니다. 따라서 이 두 말뭉치에서는 선택 기준이 **검색 품질(English Recall\@1 70% vs 80%)이지, 가격이 아닙니다**.

저장 방식도 다릅니다. 벡터는 이미 L2 정규화되어 있고 반환되는 값은 fp16 정밀도이므로,
**`bge-m3` 벡터를 float16으로 저장해도 정확도 손실은 전혀 없습니다**.

| 구성                                      | 벡터당      | 100만 벡터  |
| --------------------------------------- | -------- | -------- |
| `bge-m3` 1024-d float16                 | **2 KB** | **2 GB** |
| `bge-m3` 1024-d float32                 | 4 KB     | 4 GB     |
| `text-embedding-3-small` 1536-d float32 | 6 KB     | 6 GB     |
| `text-embedding-3-large` 3072-d float32 | 12 KB    | 12 GB    |

<Tip>
  벡터는 정규화된 상태로 반환되며(측정된 L2 노름 0.99992–1.00029), 따라서 **내적이 곧 코사인 유사도입니다**. `IP`와 `COSINE` 인덱스 유형은 벡터 데이터베이스에서 동일한 결과를 제공하며, `IP`는 정규화 단계를 한 번 절약합니다.
</Tip>

## 7. 조용히 드러나지 않는 실패 모드

### 7.1 LangChain의 기본값은 재현율을 80％에서 15％로 떨어뜨립니다

<Warning>
  `langchain_openai.OpenAIEmbeddings`의 기본값은 `check_embedding_ctx_length=True`이며, 이는 **텍스트를 먼저 tiktoken token ids로 인코딩한 뒤** 정수 배열을 `/v1/embeddings`에 보냅니다.

  이 방식은 토크나이저가 곧 tiktoken인 OpenAI 모델에서는 문제가 없습니다. `bge-m3`는 XLM-R 토크나이저를 사용하며, 두 id 공간은 서로 공통점이 전혀 없습니다.

  **호출은 여전히 200을 반환하고, 벡터도 여전히 1024차원이며, `usage`도 정상처럼 보입니다 — 오직 검색 품질만 조용히 무너집니다.**
</Warning>

측정 결과:

| 검사                                                | 결과            |
| ------------------------------------------------- | ------------- |
| 같은 문장을 텍스트로 보냈을 때와 tiktoken token ids로 보냈을 때의 유사도 | **0.282**     |
| 중국어 코퍼스 Recall\@1                                 | **80% → 15%** |

해결 방법:

```python theme={null}
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(
    model="bge-m3",
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1",
    check_embedding_ctx_length=False,   # required, otherwise tiktoken ids go out instead of text
    chunk_size=64,
)
```

같은 위험은 **전송 전에 클라이언트 측에서 토큰화하는 모든 래퍼**에 적용됩니다. 서드파티 임베딩 모델을 연결할 때, SDK가 원시 텍스트를 보내는지 token ids를 보내는지 확인하십시오.

### 7.2 빈 문자열도 유효한 입력으로 받아들여집니다

`input: ""`는 `bge-m3`에서 **200**을 반환합니다(OpenAI는 여기서 400을 반환합니다). 그 결과 1024차원 벡터가 생성되고 2 tokens가 과금됩니다.

빈 청크를 필터링하지 않는 청킹 스크립트는 검색 중 무작위로 나타나는 무의미한 벡터로 인덱스를 채우게 됩니다. **인덱싱하기 전에 빈 텍스트를 필터링하십시오.**

### 7.3 `dimensions` 파라미터는 거부됩니다

```json theme={null}
{ "model": "bge-m3", "input": "...", "dimensions": 512 }
```

400을 반환합니다: `Model "bge-m3" does not support matryoshka representation, changing output dimensions will lead to poor results.`

`bge-m3`는 Matryoshka 표현으로 학습되지 않았으므로, **벡터를 잘라내면 품질이 눈에 띄게 저하됩니다**. 차원을 직접 줄이기보다 float16을 사용해 저장 공간을 줄이십시오.

### 7.4 모델 이름은 대소문자를 구분하며 별칭이 없습니다

오직 `bge-m3`만 작동합니다. `BAAI/bge-m3`과 `BGE-M3`는 모두 503 “사용 가능한 채널이 없습니다”를 반환합니다.

### 7.5 8192는 입력별 제한입니다

8192 tokens를 넘는 단일 입력은 400을 반환하며 **절대 조용히 잘리지 않습니다** — 이것이 더 안전한 동작입니다. 텍스트의 후반부를 조용히 잃어버린 듯한 정상적인 벡터를 받지 않게 되기 때문입니다.

이 제한은 요청 단위가 아니라 **항목당** 적용됩니다. 테스트에서는 **1024 항목 / 102560 tokens**를 실은 단일 호출이 정상적으로 반환되었습니다. 어떤 한 항목이라도 제한을 초과하면 전체 요청이 실패하며, 오류의 token 수는 전체가 아니라 **해당 항목**을 가리킵니다.

## 8. 복사해서 사용할 수 있는 최소 구현

```python theme={null}
"""Minimal working bge-m3 indexing + retrieval."""
import time
import numpy as np
from openai import OpenAI

client = OpenAI(
    api_key="sk-your-apiyi-key",
    base_url="https://api.apiyi.com/v1",
    timeout=90.0,
)

MODEL = "bge-m3"
BATCH = 96          # keep between 64 and 128
THRESHOLD = 0.50    # starting point; recalibrate on your own samples before launch


def embed(texts, retries=3):
    """Batch embedding with backoff. Returns float16 vectors."""
    texts = [t.strip() for t in texts if t and t.strip()]   # drop blanks, see 7.2
    out = []
    for i in range(0, len(texts), BATCH):
        chunk = texts[i:i + BATCH]
        for attempt in range(retries):
            try:
                resp = client.embeddings.create(model=MODEL, input=chunk)
                out += [d.embedding for d in sorted(resp.data, key=lambda x: x.index)]
                break
            except Exception:
                if attempt == retries - 1:
                    raise
                time.sleep(2 ** attempt)
    # already normalized, so float16 storage is lossless here, see section 6
    return np.array(out, dtype=np.float16)


def search(query, doc_vectors, docs, top_k=50):
    """Vectors are normalized, so the dot product is cosine similarity."""
    qv = embed([query])[0].astype(np.float32)
    scores = doc_vectors.astype(np.float32) @ qv
    order = np.argsort(-scores)[:top_k]
    return [(docs[i], float(scores[i])) for i in order if scores[i] >= THRESHOLD]


if __name__ == "__main__":
    docs = ["...your chunks, 200-500 tokens each..."]
    dv = embed(docs)
    for text, score in search("your question", dv, docs):
        print(f"{score:.4f}  {text[:60]}")
    # In production, hand this Top 50 to bge-reranker-v2-m3, see section 4
```

## 관련 문서

<CardGroup cols={2}>
  <Card title="텍스트 임베딩 API" icon="vector-square" href="/ko/api-capabilities/text-embedding">
    매개변수, 응답 형식, 빠른 시작
  </Card>

  <Card title="재정렬" icon="list-ordered" href="/ko/api-capabilities/rerank/overview">
    `bge-reranker-v2-m3`, 정밀 단계에 적합한 도구
  </Card>

  <Card title="RAG 튜닝" icon="sliders-horizontal" href="/ko/api-capabilities/rerank/rag-best-practices">
    2단계 검색, 얼마나 많은 후보를 재현할지
  </Card>

  <Card title="모델 요금" icon="tags" href="/en/models">
    모든 임베딩 모델의 실시간 요금
  </Card>
</CardGroup>
