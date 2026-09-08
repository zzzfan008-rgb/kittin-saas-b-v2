> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GLM-5.2

> APIYI의 GLM-5.2: 입력 $1.142 / 출력 $3.997 per 1M tokens, 컨텍스트 윈도우 1,000,000, 3개 과금 그룹에서 사용 가능.

40B 활성 가중치를 가진 약 744B 파라미터 MoE로, AA 지능 지수에서 오픈 모델 중 1위를 차지하며 프로젝트 규모 코딩과 장기 실행 에이전트에 적합합니다.

## 사양

| 항목                | 값                |
| ----------------- | ---------------- |
| **모델 ID**         | `glm-5.2`        |
| **벤더**            | Zhipu            |
| **APIYI에서 사용 가능** | 2026-06-18       |
| **지식 기준 시점**      | 2025-11          |
| **입력 모달리티**       | 텍스트              |
| **출력 모달리티**       | 텍스트              |
| **컨텍스트 윈도우**      | 1,000,000 tokens |
| **과금**            | 사용량 기반           |

## 가격

가격은 1M token당 USD 기준입니다 (\$/1M).

| 입력      | 캐시된 입력   | 출력      |
| ------- | -------- | ------- |
| \$1.142 | \$0.2284 | \$3.997 |

<Info>표는 **정가**를 보여줍니다. 충전 프로모션과 그룹 할인은 **중복 적용됩니다**; 콘솔은 실제 과금을 실시간으로 반영합니다. [가격](/ko/pricing) 및 [충전 프로모션](/ko/faq/recharge-promotions)을 참조하십시오.</Info>

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

| 그룹           | 요율 배수 | 비고      |
| ------------ | ----- | ------- |
| `ClaudeCode` | 0.95× | 정가의 95% |
| `Default`    | 1×    | 정가      |
| `SVIP`       | 1×    | 정가      |

일부 그룹에는 추가 할인이 적용되며, 충전 보너스와 중복 적용할 수 있습니다. [token과 그룹](/ko/faq/token-and-groups)을 참조하십시오.

## 지원 기능

| 기능      | 지원 여부 |
| ------- | ----- |
| 스트리밍    | ✅     |
| 도구 호출   | ✅     |
| 구조화된 출력 | ✅     |
| 프롬프트 캐싱 | ✅     |
| 확장 추론   | 옵트인   |

## 예시 요청

아래 예시는 OpenAI Chat Completions(`/v1/chat/completions`)를 통해 `glm-5.2`를 호출합니다. base\_url을 `https://api.apiyi.com/v1`로 지정하면 나머지는 공식 API와 일치합니다.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "glm-5.2",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>키는 환경 변수에서 읽어야 하며, 하드코딩하면 안 됩니다. 프로덕션에서는 사용 사례별로 별도의 token을 발급하여 사용을 개별적으로 취소하고 귀속할 수 있어야 합니다.</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="출시 발표" icon="megaphone" href="/en/news/glm-5-2-launch">
    GLM-5.2의 배경, 벤치마크 및 마이그레이션 참고 사항
  </Card>

  <Card title="모델 과금 디렉터리" icon="table" href="/en/models">
    전체 283개 모델의 실시간 과금, 엔드포인트 및 그룹
  </Card>
</CardGroup>

<Note>이 페이지의 사양은 `models/data/model-details.json`에서 수동으로 관리됩니다. 과금 및 엔드포인트는 2026-08-31 11:46 (UTC+8)에 업데이트된 실시간 과금 API에서 가져오며, 사양은 2026-07-31에 마지막으로 확인되었습니다.</Note>
