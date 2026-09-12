> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 4.3

> APIYI의 Grok 4.3: 1M tokens당 입력 $1.25 / 출력 $2.5, 1,000,000 컨텍스트 윈도우, 4개의 과금 그룹에서 이용 가능합니다.

비활성화할 수 없는 항상 켜져 있는 추론, 1M 컨텍스트 윈도우, 그리고 대략 159 token/s 출력입니다.

## 사양

| 항목                | 값                |
| ----------------- | ---------------- |
| **모델 ID**         | `grok-4.3`       |
| **공급사**           | xAI              |
| **APIYI에서 제공 여부** | 2026-05-03       |
| **지식 기준 시점**      | 미공개              |
| **입력 모달리티**       | 텍스트, 이미지         |
| **출력 모달리티**       | 텍스트              |
| **컨텍스트 윈도우**      | 1,000,000 tokens |
| **과금**            | 사용량 기반           |

## 가격

1M token당 USD 가격(\$/1M).

| 입력     | 캐시된 입력 | 출력    |
| ------ | ------ | ----- |
| \$1.25 | \$0.2  | \$2.5 |

<Info>표는 **정가**를 보여줍니다. 충전 프로모션과 그룹 할인은 **중복 적용됩니다**; 콘솔은 실제 과금을 실시간으로 반영합니다. [가격](/ko/pricing) 및 [충전 프로모션](/ko/faq/recharge-promotions)을 참조하십시오.</Info>

## 계층형 가격

이 모델은 각 요청의 token 크기에 따라 계층형 요금이 적용됩니다(출력 가격 = 계층 입력 가격 × 출력 배수):

* 0 – 204,800 tokens: \$1.25/1M input
* 204,800 tokens 초과: \$2.5/1M input

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

| 그룹               | 요율 배수 | 비고      |
| ---------------- | ----- | ------- |
| `CodexResponses` | 1×    | 정가      |
| `GrokOfficial`   | 0.8×  | 정가의 80% |
| `Default`        | 1×    | 정가      |
| `SVIP`           | 1×    | 정가      |

일부 그룹에는 추가 할인이 적용되며, 충전 보너스와 중복 적용됩니다. [토큰과 그룹](/ko/faq/token-and-groups)을 참조하십시오.

## 지원 기능

| 기능      | 지원 여부    |
| ------- | -------- |
| 스트리밍    | ✅        |
| 도구 호출   | ✅        |
| 구조화된 출력 | ✅        |
| 비전      | ✅        |
| 프롬프트 캐싱 | ✅        |
| 확장된 추론  | 기본적으로 켜짐 |
| 웹 검색    | ✅        |
| 코드 실행   | ✅        |

## 예제 요청

아래 예제는 OpenAI Chat Completions(`/v1/chat/completions`)을 통해 `grok-4.3`을 호출합니다. base\_url을 `https://api.apiyi.com/v1`로 지정하십시오. 그 밖의 모든 항목은 공식 API와 일치합니다.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "grok-4.3",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>키는 환경 변수에서 읽어오고, 하드코딩하지 마십시오. 운영 환경에서는 사용 사례별로 별도의 tokens를 발급하여 필요 시 개별적으로 폐기하고 사용 내역을 추적할 수 있어야 합니다.</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="출시 발표" icon="megaphone" href="/en/news/grok-4-3-launch">
    Grok 4.3의 배경, 벤치마크 및 마이그레이션 참고 사항
  </Card>

  <Card title="Grok 개요" icon="book-open" href="/ko/api-capabilities/grok/overview">
    매개변수, 사용법 및 모범 사례
  </Card>

  <Card title="Grok 4.6" icon="git-compare" href="/ko/models/grok-4-6">
    동일한 제품군에 속한 모델의 세부 정보
  </Card>

  <Card title="Grok 4.5" icon="git-compare" href="/ko/models/grok-4-5">
    동일한 제품군에 속한 모델의 세부 정보
  </Card>

  <Card title="모델 과금 디렉터리" icon="table" href="/en/models">
    전체 283개 모델의 실시간 과금, 엔드포인트 및 그룹
  </Card>
</CardGroup>

<Note>이 페이지의 사양은 `models/data/model-details.json`에서 수동으로 관리되며, 과금 및 엔드포인트는 2026-08-31 11:46 (UTC+8)에 업데이트된 실시간 과금 API에서 가져옵니다. 사양은 2026-07-31에 마지막으로 확인되었습니다.</Note>
