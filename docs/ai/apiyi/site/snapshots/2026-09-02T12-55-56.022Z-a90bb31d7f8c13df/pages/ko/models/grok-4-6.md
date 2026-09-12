> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Grok 4.6

> APIYI의 Grok 4.6: 입력은 1M tokens당 $2, 출력은 1M tokens당 $6, 컨텍스트 윈도우 500,000, 4개 과금 그룹에서 이용 가능합니다.

4.5의 1.5T-parameter foundation을 재사용하며, 사후 학습만으로 Artificial Analysis 지능 지수를 56에서 61로 끌어올립니다 — 4.5와 동일한 정가로.

## 사양

| 항목                | 값              |
| ----------------- | -------------- |
| **모델 ID**         | `grok-4.6`     |
| **벤더**            | xAI            |
| **벤더 출시일**        | 2026-08-07     |
| **APIYI에서 사용 가능** | 2026-08-13     |
| **지식 컷오프**        | 공개되지 않음        |
| **입력 모달리티**       | 텍스트, 이미지       |
| **출력 모달리티**       | 텍스트            |
| **컨텍스트 윈도우**      | 500,000 tokens |
| **과금**            | 사용량 기반         |

## 요금

가격은 1M tokens당 USD 기준입니다(\$/1M).

| 입력  | 캐시된 입력 | 출력  |
| --- | ------ | --- |
| \$2 | \$0.5  | \$6 |

<Info>이 표는 **정가**를 보여줍니다. 충전 프로모션과 그룹 할인은 **중첩됩니다**; 콘솔에는 실제 과금이 실시간으로 반영됩니다. [요금](/ko/pricing) 및 [충전 프로모션](/ko/faq/recharge-promotions)을 참조하십시오.</Info>

## 단계별 요금

이 모델은 각 요청의 token 크기에 따라 단계별로 요금이 책정됩니다(출력 가격 = 단계별 입력 가격 × 출력 배수):

* 0 – 204,800 tokens: \$2/1M 입력
* 204,801 – 512,000 tokens: \$4/1M 입력

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

| 그룹               | 요율 배수 | 비고      |
| ---------------- | ----- | ------- |
| `CodexResponses` | 1×    | 정가      |
| `GrokOfficial`   | 0.8×  | 정가의 80% |
| `Default`        | 1×    | 정가      |
| `SVIP`           | 1×    | 정가      |

일부 그룹에는 충전 보너스와 중복 적용되는 추가 할인이 있습니다. [토큰과 그룹](/ko/faq/token-and-groups)을 참조하십시오.

## 지원 기능

| 기능      | 지원 여부    |
| ------- | -------- |
| 스트리밍    | ✅        |
| 도구 호출   | ✅        |
| 구조화된 출력 | ✅        |
| 비전      | ✅        |
| 프롬프트 캐싱 | ✅        |
| 확장 추론   | 기본적으로 켜짐 |
| 웹 검색    | ✅        |
| 코드 실행   | ✅        |

## 예시 요청

아래 예시는 OpenAI Chat Completions(`/v1/chat/completions`)를 통해 `grok-4.6`를 호출합니다. base\_url을 `https://api.apiyi.com/v1`로 지정하십시오 — 그 외는 모두 공식 API와 동일합니다.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "grok-4.6",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>환경 변수에서 키를 읽어오고, 절대 하드코딩하지 마십시오. 프로덕션에서는 사용 사례별로 별도의 token을 발급하여 개별적으로 폐기하고 사용 내역을 귀속시킬 수 있도록 하십시오.</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="출시 발표" icon="megaphone" href="/en/news/grok-4-6-launch">
    Grok 4.6의 배경, 벤치마크 및 마이그레이션 참고 사항
  </Card>

  <Card title="Grok 개요" icon="book-open" href="/ko/api-capabilities/grok/overview">
    매개변수, 사용법 및 모범 사례
  </Card>

  <Card title="채팅 및 추론" icon="book-open" href="/ko/api-capabilities/grok/chat">
    매개변수, 사용법 및 모범 사례
  </Card>

  <Card title="Grok 4.5" icon="git-compare" href="/ko/models/grok-4-5">
    같은 제품군 모델의 세부 정보
  </Card>

  <Card title="Grok 4.3" icon="git-compare" href="/ko/models/grok-4-3">
    같은 제품군 모델의 세부 정보
  </Card>

  <Card title="모델 과금 디렉터리" icon="table" href="/en/models">
    283개 모든 모델의 실시간 과금, 엔드포인트 및 그룹
  </Card>
</CardGroup>

<Note>이 페이지의 사양은 `models/data/model-details.json`에서 수동으로 관리하며, 과금 및 엔드포인트는 2026-08-31 11:46 (UTC+8)에 업데이트된 실시간 과금 API에서 가져옵니다. 사양은 2026-08-13에 마지막으로 검증되었습니다.</Note>
