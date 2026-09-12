> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-5.5 Pro

> APIYI의 GPT-5.5 Pro: 입력 $30 / 출력 $180 per 1M tokens, 컨텍스트 윈도우 1,050,000, 최대 출력 128,000, 1개 과금 그룹에서 사용 가능합니다.

고강도 추론 티어: 비용이 높고 /v1/responses에서만 사용할 수 있습니다 — 전문 작업이 아니면 권장되지 않습니다.

## 사양

| 항목                | 값                |
| ----------------- | ---------------- |
| **모델 ID**         | `gpt-5.5-pro`    |
| **공급업체**          | OpenAI           |
| **APIYI에서 이용 가능** | 2026-05-03       |
| **지식 기준일**        | 2025-12          |
| **입력 모달리티**       | 텍스트, 이미지         |
| **출력 모달리티**       | 텍스트              |
| **컨텍스트 윈도우**      | 1,050,000 tokens |
| **최대 출력**         | 128,000 tokens   |
| **과금**            | 사용량 기반           |

## 가격

USD 기준 100만 token당 가격(\$/1M).

| 입력   | 캐시된 입력 | 출력    |
| ---- | ------ | ----- |
| \$30 | \$3    | \$180 |

<Info>표에는 **정가**가 표시됩니다. 충전 프로모션과 그룹 할인은 **중복 적용**되며, 콘솔에는 실제 과금이 실시간으로 반영됩니다. [가격](/ko/pricing)과 [충전 프로모션](/ko/faq/recharge-promotions)을 참조하십시오.</Info>

## 단계별 가격

이 모델은 각 요청의 token 크기에 따라 단계별 요금이 적용됩니다(출력 가격 = 단계 입력 가격 × 출력 배수):

* 0 – 278,528 tokens: \$30/1M input
* 278,528 tokens 초과: \$60/1M input

## 엔드포인트

| 엔드포인트                     | 경로                                            | 지원 여부 |
| ------------------------- | --------------------------------------------- | ----- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | —     |
| `OpenAI Responses`        | `POST /v1/responses`                          | ✅     |
| `Anthropic Messages`      | `POST /v1/messages`                           | —     |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —     |
| `Image Generations`       | `POST /v1/images/generations`                 | —     |
| `Embeddings`              | `POST /v1/embeddings`                         | —     |

## 과금 그룹

| 그룹     | 배수 | 비고 |
| ------ | -- | -- |
| `SVIP` | 1× | 정가 |

일부 그룹에는 추가 할인이 적용되며, 충전 보너스와 중복 적용할 수 있습니다. [Tokens 및 그룹](/ko/faq/token-and-groups)을 참조하십시오.

## 지원 기능

| 기능      | 지원 여부      |
| ------- | ---------- |
| 스트리밍    | ✅          |
| 도구 호출   | ✅          |
| 구조화된 출력 | ✅          |
| 비전      | ✅          |
| 프롬프트 캐싱 | ✅          |
| 확장 추론   | 기본값으로 활성화됨 |

## 예시 요청

아래 예시는 OpenAI Responses (`/v1/responses`)를 통해 `gpt-5.5-pro`을 호출합니다. base\_url을 `https://api.apiyi.com/v1`로 지정합니다 — 나머지는 모두 공식 API와 동일합니다.

```bash theme={null}
curl https://api.apiyi.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gpt-5.5-pro",
    "input": "Hello"
  }'
```

<Tip>환경 변수에서 키를 읽고, 하드코딩하지 마십시오. 운영 환경에서는 사용 사례별로 별도의 token을 발급하여 개별적으로 취소하고 사용 내역을 구분할 수 있어야 합니다.</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="출시 발표" icon="megaphone" href="/en/news/gpt-5-5-pro-launch">
    GPT-5.5 Pro의 배경, 벤치마크 및 마이그레이션 참고 사항
  </Card>

  <Card title="호환 모드" icon="book-open" href="/ko/api-capabilities/openai/compatible">
    매개변수, 사용법 및 모범 사례
  </Card>

  <Card title="모델 가격 디렉터리" icon="table" href="/en/models">
    전체 283개 모델의 실시간 가격, 엔드포인트 및 그룹
  </Card>
</CardGroup>

<Note>이 페이지의 사양은 `models/data/model-details.json`에서 수동으로 관리되며, 가격 및 엔드포인트는 2026-08-31 11:46 (UTC+8)에 업데이트된 실시간 가격 API에서 가져옵니다. 사양은 2026-07-31에 마지막으로 확인되었습니다.</Note>
