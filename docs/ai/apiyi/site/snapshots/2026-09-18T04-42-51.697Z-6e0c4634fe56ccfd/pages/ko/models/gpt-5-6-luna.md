> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-5.6 Luna

> APIYI의 GPT-5.6 Luna: 1M token당 입력 $0.2 / 출력 $1.2, 컨텍스트 1,000,000, 4개 과금 그룹에서 사용 가능합니다.

높은 동시 실행 수와 비용 민감 작업 부하를 위해 설계된 GPT-5.6 계열의 경량 티어입니다. 256K 컨텍스트를 넘으면 성능이 더 약해지므로, 긴 문서는 청크로 나누십시오.

## 사양

| 항목                | 값                |
| ----------------- | ---------------- |
| **모델 ID**         | `gpt-5.6-luna`   |
| **공급업체**          | OpenAI           |
| **APIYI에서 사용 가능** | 2026-07-10       |
| **지식 기준 시점**      | 공개되지 않음          |
| **입력 양식**         | 텍스트, 이미지         |
| **출력 양식**         | 텍스트              |
| **컨텍스트 윈도우**      | 1,000,000 tokens |
| **과금**            | 사용량 기반           |

## 가격

USD 기준 100만 token당 가격(\$/1M).

| 입력    | 캐시된 입력 | 출력    |
| ----- | ------ | ----- |
| \$0.2 | \$0.02 | \$1.2 |

<Info>이 표는 **정가**를 보여줍니다. 충전 프로모션과 그룹 할인은 **중복 적용됩니다**; 콘솔에는 실제 과금이 실시간으로 반영됩니다. [가격](/ko/pricing) 및 [충전 프로모션](/ko/faq/recharge-promotions)을 참조하십시오.</Info>

## 계층형 가격

이 모델은 각 요청의 token 크기에 따라 계층별로 요금이 부과됩니다(출력 가격 = 계층 입력 가격 × 출력 배수):

* 0 – 272,000 tokens: \$0.2/1M input
* 272,000 tokens 초과: \$0.4/1M input

## 엔드포인트

| 엔드포인트                     | 경로                                            | 지원 여부 |
| ------------------------- | --------------------------------------------- | ----- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅     |
| `OpenAI Responses`        | `POST /v1/responses`                          | ✅     |
| `Anthropic Messages`      | `POST /v1/messages`                           | —     |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —     |
| `Image Generations`       | `POST /v1/images/generations`                 | —     |
| `Embeddings`              | `POST /v1/embeddings`                         | —     |

## 과금 그룹

| 그룹               | 배수   | 비고      |
| ---------------- | ---- | ------- |
| `CodexResponses` | 1×   | 정가      |
| `Codex_Reverse`  | 0.5× | 정가의 50% |
| `Default`        | 1×   | 정가      |
| `SVIP`           | 1×   | 정가      |

일부 그룹에는 충전 보너스와 중복 적용 가능한 추가 할인이 제공됩니다. [tokens 및 그룹](/ko/faq/token-and-groups)을 참조하세요.

## 지원 기능

| 기능      | 지원 여부 |
| ------- | ----- |
| 스트리밍    | ✅     |
| 도구 호출   | ✅     |
| 구조화된 출력 | ✅     |
| 비전      | ✅     |
| 프롬프트 캐싱 | ✅     |
| 확장 추론   | 선택 사항 |

## 예시 요청

아래 예시는 OpenAI Chat Completions(`/v1/chat/completions`)을 통해 `gpt-5.6-luna`를 호출합니다. base\_url을 `https://api.apiyi.com/v1`로 지정하면 되며, 그 외의 모든 항목은 공식 API와 동일합니다.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gpt-5.6-luna",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>환경 변수에서 key를 읽어 사용하며, 코드에 하드코딩하면 안 됩니다. 운영 환경에서는 사용 사례별로 별도의 token을 발급해 개별적으로 폐기하고 사용 내역을 추적할 수 있어야 합니다.</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="출시 발표" icon="megaphone" href="/en/news/gpt-5-6-launch">
    GPT-5.6 Luna의 배경, 벤치마크 및 마이그레이션 참고 사항
  </Card>

  <Card title="호환 모드" icon="book-open" href="/ko/api-capabilities/openai/compatible">
    파라미터, 사용법 및 모범 사례
  </Card>

  <Card title="GPT-5.6 Sol" icon="git-compare" href="/ko/models/gpt-5-6-sol">
    동일 제품군 모델의 세부 정보
  </Card>

  <Card title="GPT-5.6 Terra" icon="git-compare" href="/ko/models/gpt-5-6-terra">
    동일 제품군 모델의 세부 정보
  </Card>

  <Card title="모델 가격 디렉터리" icon="table" href="/en/models">
    모든 모델의 실시간 가격, 엔드포인트 및 그룹
  </Card>
</CardGroup>

<Note>이 페이지의 사양은 `models/data/model-details.json`에서 수동으로 관리되며, 가격 및 엔드포인트는 실시간 가격 API에서 가져오고 빌드할 때마다 갱신됩니다.</Note>
