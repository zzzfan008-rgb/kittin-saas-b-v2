> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.8-Flash

> APIYI의 Qwen3.8-Flash: 100만 tokens당 입력 $0.114 / 출력 $0.3876, 1,000,000 컨텍스트, 최대 출력 131,072, 2개의 과금 그룹에서 사용할 수 있습니다.

제품군의 비용 효율성 주력 모델입니다. 1M 컨텍스트와 131K 최대 출력을 지원하는 멀티모달 추론으로, 대규모 시각적 코딩, 문서 작업 및 장시간 동영상 분석에 적합합니다.

## 사양

| 항목                | 값                |
| ----------------- | ---------------- |
| **모델 ID**         | `qwen3.8-flash`  |
| **공급업체**          | 알리바바             |
| **공급업체 출시일**      | 2026-08-26       |
| **APIYI에서 사용 가능** | 2026-09-03       |
| **지식 기준일**        | 공개되지 않음          |
| **입력 방식**         | 텍스트, 이미지, 동영상    |
| **출력 방식**         | 텍스트              |
| **컨텍스트 윈도우**      | 1,000,000 tokens |
| **최대 출력**         | 131,072 tokens   |
| **과금**            | 사용량 기반           |

## 가격

1M token당 USD 가격(\$/1M)입니다.

| 입력      | 캐시된 입력    | 출력       |
| ------- | --------- | -------- |
| \$0.114 | \$0.01425 | \$0.3876 |

<Info>표에는 **정가**가 표시됩니다. 충전 프로모션과 그룹 할인이 **중복 적용**되며, 콘솔에는 실제 청구 금액이 실시간으로 반영됩니다. [가격](/ko/pricing) 및 [충전 프로모션](/ko/faq/recharge-promotions)을 참조하십시오.</Info>

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

| 그룹        | 요율 배수 | 비고 |
| --------- | ----- | -- |
| `Default` | 1×    | 정가 |
| `SVIP`    | 1×    | 정가 |

일부 그룹에는 추가 할인이 적용되며, 충전 보너스와 중복 적용할 수 있습니다. [토큰 및 그룹](/ko/faq/token-and-groups)을 참조하십시오.

## 지원되는 기능

| 기능      | 지원 여부 |
| ------- | ----- |
| 스트리밍    | ✅     |
| 도구 호출   | ✅     |
| 구조화된 출력 | ✅     |
| 비전      | ✅     |
| 프롬프트 캐싱 | ✅     |
| 확장된 사고  | 옵트인   |

## 예시 요청

아래 예시에서는 OpenAI 채팅 완성(`/v1/chat/completions`)을 통해 `qwen3.8-flash`을 호출합니다. base\_url이 `https://api.apiyi.com/v1`을 가리키도록 설정하면 나머지는 공식 API와 동일합니다.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "qwen3.8-flash",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>키는 환경 변수에서 읽고 하드코딩하지 마십시오. 프로덕션 환경에서는 사용 사례별로 별도의 tokens를 발급하여 각각 취소하고 사용량을 개별적으로 귀속할 수 있도록 하십시오.</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="Qwen3.7-Flash" icon="git-compare" href="/ko/models/qwen3-7-flash">
    동일한 계열의 모델 세부 정보
  </Card>

  <Card title="Qwen3.8-27B" icon="git-compare" href="/ko/models/qwen3-8-27b">
    동일한 계열의 모델 세부 정보
  </Card>

  <Card title="모델 가격 디렉터리" icon="table" href="/en/models">
    모든 모델의 실시간 가격, 엔드포인트 및 그룹
  </Card>
</CardGroup>

<Note>이 페이지의 사양은 `models/data/model-details.json`에서 수동으로 관리되며, 가격 및 엔드포인트는 실시간 가격 API에서 가져오고 빌드할 때마다 갱신됩니다.</Note>
