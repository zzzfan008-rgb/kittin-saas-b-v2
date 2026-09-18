> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GLM-5.3

> APIYI의 GLM-5.3: 1M tokens당 입력 $1.4 / 출력 $4.396, 1,000,000 컨텍스트, 최대 출력 128,000, 2개의 과금 그룹에서 이용 가능.

5.2와 동일한 753B MoE 기반 모델에 더 확대된 사후 학습을 적용했습니다. Z.ai Code Bench에서 +50%, 사이버 방어 점수는 두 배 향상되었으며, 추론은 항상 활성화되어 코딩 에이전트와 보안 감사에 맞춰 설계되었습니다.

## 사양

| 항목               | 값                |
| ---------------- | ---------------- |
| **모델 ID**        | `glm-5.3`        |
| **제공업체**         | Zhipu            |
| **제공업체 출시일**     | 2026-08-14       |
| **APIYI 제공 시작일** | 2026-09-08       |
| **지식 컷오프**       | 공개되지 않음          |
| **입력 모달리티**      | 텍스트              |
| **출력 모달리티**      | 텍스트              |
| **컨텍스트 윈도우**     | 1,000,000 tokens |
| **최대 출력**        | 128,000 tokens   |
| **과금**           | 사용량 기반           |

## 요금

1M tokens당 USD 기준 가격(\$/1M)입니다.

| 입력    | 캐시된 입력  | 출력      |
| ----- | ------- | ------- |
| \$1.4 | \$0.259 | \$4.396 |

<Info>표에는 **정가**가 표시됩니다. 충전 프로모션과 그룹 할인은 **중복 적용**되며, 콘솔에는 실제 청구 금액이 실시간으로 반영됩니다. [요금](/ko/pricing) 및 [충전 프로모션](/ko/faq/recharge-promotions)을 참조하세요.</Info>

## 엔드포인트

| 엔드포인트                     | 경로                                            | 지원 여부 |
| ------------------------- | --------------------------------------------- | ----- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅     |
| `OpenAI Responses`        | `POST /v1/responses`                          | —     |
| `Anthropic Messages`      | `POST /v1/messages`                           | —     |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —     |
| `Image Generations`       | `POST /v1/images/generations`                 | —     |
| `Embeddings`              | `POST /v1/embeddings`                         | —     |

## 과금 그룹

| 그룹        | 배수 | 비고 |
| --------- | -- | -- |
| `Default` | 1× | 정가 |
| `SVIP`    | 1× | 정가 |

일부 그룹에는 충전 보너스와 중복 적용 가능한 추가 할인이 제공됩니다. [tokens 및 그룹](/ko/faq/token-and-groups)을 참조하십시오.

## 지원 기능

| 기능      | 지원 여부     |
| ------- | --------- |
| 스트리밍    | ✅         |
| 도구 호출   | ✅         |
| 구조화된 출력 | ✅         |
| 프롬프트 캐싱 | ✅         |
| 확장 사고   | 기본적으로 활성화 |

## 요청 예시

아래 예시는 OpenAI Chat Completions(`/v1/chat/completions`)를 통해 `glm-5.3`를 호출합니다. base\_url을 `https://api.apiyi.com/v1`로 지정하면 나머지는 모두 공식 API와 동일합니다.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "glm-5.3",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>키는 절대 하드코딩하지 말고 환경 변수에서 읽으십시오. 프로덕션에서는 사용 사례별로 별도의 tokens을 발급하여 개별적으로 사용을 취소하고 추적할 수 있도록 하십시오.</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="출시 공지" icon="megaphone" href="/en/news/glm-5-3-launch">
    GLM-5.3의 배경, 벤치마크 및 마이그레이션 참고 사항
  </Card>

  <Card title="GLM-5.3-Flash" icon="git-compare" href="/ko/models/glm-5-3-flash">
    동일한 제품군에 속한 모델의 세부 정보
  </Card>

  <Card title="GLM-5.2" icon="git-compare" href="/ko/models/glm-5-2">
    동일한 제품군에 속한 모델의 세부 정보
  </Card>

  <Card title="모델 가격 디렉터리" icon="table" href="/en/models">
    모든 모델의 실시간 가격, 엔드포인트 및 그룹
  </Card>
</CardGroup>

<Note>이 페이지의 사양은 `models/data/model-details.json`에서 수동으로 관리되며, 가격과 엔드포인트는 실시간 가격 API에서 제공되고 모든 재빌드마다 새로 고쳐집니다.</Note>
