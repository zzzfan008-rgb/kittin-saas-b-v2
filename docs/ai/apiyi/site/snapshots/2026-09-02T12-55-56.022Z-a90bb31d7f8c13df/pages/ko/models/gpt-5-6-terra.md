> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-5.6 Terra

> APIYI의 GPT-5.6 Terra: 1M token당 입력 $2 / 출력 $12, 컨텍스트 1,000,000, 4개 과금 그룹에서 이용 가능합니다.

GPT-5.6 패밀리의 주력 티어입니다: 절반 가격에 GPT-5.5급 성능을 제공하며, 마이그레이션 시 기본 선택입니다.

## 사양

| 항목                | 값                |
| ----------------- | ---------------- |
| **모델 ID**         | `gpt-5.6-terra`  |
| **벤더**            | OpenAI           |
| **APIYI에서 사용 가능** | 2026-07-10       |
| **지식 기준일**        | 공개되지 않음          |
| **입력 모달리티**       | 텍스트, 이미지         |
| **출력 모달리티**       | 텍스트              |
| **컨텍스트 윈도우**      | 1,000,000 tokens |
| **과금**            | 사용량 기반           |

## 가격

가격은 1M token당 USD 기준입니다(\$/1M).

| 입력  | 캐시된 입력 | 출력   |
| --- | ------ | ---- |
| \$2 | \$0.2  | \$12 |

<Info>이 표는 **정가**를 보여줍니다. 충전 프로모션과 그룹 할인은 **중복 적용**되며, 콘솔에는 실제 청구 금액이 실시간으로 반영됩니다. [가격](/ko/pricing) 및 [충전 프로모션](/ko/faq/recharge-promotions)을 참조하십시오.</Info>

## 계층형 가격

이 모델은 각 요청의 token 크기에 따라 계층별 요금이 적용됩니다(출력 가격 = 계층 입력 가격 × 출력 배수):

* 0 – 272,000 tokens: \$2/1M 입력
* 272,000 tokens 초과: \$4/1M 입력

## 엔드포인트

| 엔드포인트                     | 경로                                            | 지원 |
| ------------------------- | --------------------------------------------- | -- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅  |
| `OpenAI Responses`        | `POST /v1/responses`                          | ✅  |
| `Anthropic Messages`      | `POST /v1/messages`                           | —  |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —  |
| `Image Generations`       | `POST /v1/images/generations`                 | —  |
| `Embeddings`              | `POST /v1/embeddings`                         | —  |

## 과금 그룹

| 그룹               | 요율 배수 | 비고      |
| ---------------- | ----- | ------- |
| `CodexResponses` | 1×    | 정가      |
| `CodexReverse`   | 0.7×  | 정가의 70% |
| `Default`        | 1×    | 정가      |
| `SVIP`           | 1×    | 정가      |

일부 그룹에는 추가 할인이 적용되며, 충전 보너스와 중복 적용할 수 있습니다. [Tokens and groups](/ko/faq/token-and-groups)를 참조하십시오.

## 지원 기능

| 기능      | 지원 여부 |
| ------- | ----- |
| 스트리밍    | ✅     |
| 도구 호출   | ✅     |
| 구조화된 출력 | ✅     |
| 비전      | ✅     |
| 프롬프트 캐싱 | ✅     |
| 확장된 추론  | 선택 사항 |

## 예시 요청

아래 예시는 OpenAI Chat Completions(`/v1/chat/completions`)을 통해 `gpt-5.6-terra`을 호출합니다. base\_url을 `https://api.apiyi.com/v1`으로 지정하면 나머지는 공식 API와 동일합니다.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gpt-5.6-terra",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>환경 변수에서 키를 읽고, 하드코딩하지 마십시오. 운영 환경에서는 사용 사례마다 별도의 token을 발급하여 개별적으로 폐기하고 사용 내역을 추적할 수 있어야 합니다.</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="출시 발표" icon="megaphone" href="/en/news/gpt-5-6-launch">
    GPT-5.6 Terra의 배경, 벤치마크 및 마이그레이션 참고 사항
  </Card>

  <Card title="호환 모드" icon="book-open" href="/ko/api-capabilities/openai/compatible">
    매개변수, 사용법 및 권장 사례
  </Card>

  <Card title="GPT-5.6 Sol" icon="git-compare" href="/ko/models/gpt-5-6-sol">
    동일 제품군 모델의 세부 정보
  </Card>

  <Card title="GPT-5.6 Luna" icon="git-compare" href="/ko/models/gpt-5-6-luna">
    동일 제품군 모델의 세부 정보
  </Card>

  <Card title="모델 과금 디렉터리" icon="table" href="/en/models">
    전체 283개 모델의 실시간 과금, 엔드포인트 및 그룹
  </Card>
</CardGroup>

<Note>이 페이지의 사양은 `models/data/model-details.json`에서 수동으로 관리되며, 과금 및 엔드포인트는 2026-08-31 11:46 (UTC+8)에 업데이트된 실시간 과금 API에서 가져옵니다. 사양은 2026-07-31에 마지막으로 확인되었습니다.</Note>
