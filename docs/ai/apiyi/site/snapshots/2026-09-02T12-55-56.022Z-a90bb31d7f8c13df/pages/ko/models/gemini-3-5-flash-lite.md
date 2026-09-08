> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.5 Flash-Lite

> Gemini 3.5 Flash-Lite는 APIYI에서 입력 $0.3 / 출력 $2.4999를 1M tokens당 제공하며, 컨텍스트 1,048,576, 최대 출력 65,536, 과금 그룹 2개에서 사용할 수 있습니다.

고처리량 경량 티어: 기본적으로 추론 없이 동작하며 대략 2초 응답을 제공하고, 동시 실행 수와 배치 작업에 맞게 설계되었습니다.

## 사양

| 항목                | 값                       |
| ----------------- | ----------------------- |
| **모델 ID**         | `gemini-3.5-flash-lite` |
| **벤더**            | Google                  |
| **APIYI에서 사용 가능** | 2026-07-22              |
| **지식 컷오프**        | 공개되지 않음                 |
| **입력 모달리티**       | 텍스트, 이미지, 오디오, 비디오, PDF |
| **출력 모달리티**       | 텍스트                     |
| **컨텍스트 윈도우**      | 1,048,576 tokens        |
| **최대 출력**         | 65,536 tokens           |
| **과금**            | 사용량 기반                  |

## 가격

1M tokens당 USD 가격(\$/1M).

| 입력    | 캐시된 입력 | 출력       |
| ----- | ------ | -------- |
| \$0.3 | \$0.03 | \$2.4999 |

<Info>표는 **정가**를 보여줍니다. 충전 프로모션과 그룹 할인은 **중복 적용됩니다**; 콘솔에는 실제 과금이 실시간으로 반영됩니다. [가격](/ko/pricing)과 [충전 프로모션](/ko/faq/recharge-promotions)을 참조하십시오.</Info>

## 엔드포인트

| 엔드포인트                     | 경로                                            | 지원 여부 |
| ------------------------- | --------------------------------------------- | ----- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅     |
| `OpenAI Responses`        | `POST /v1/responses`                          | —     |
| `Anthropic Messages`      | `POST /v1/messages`                           | —     |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | ✅     |
| `Image Generations`       | `POST /v1/images/generations`                 | —     |
| `Embeddings`              | `POST /v1/embeddings`                         | —     |

## 과금 그룹

| 그룹        | 배수 | 비고 |
| --------- | -- | -- |
| `Default` | 1× | 정가 |
| `SVIP`    | 1× | 정가 |

일부 그룹에는 추가 할인 혜택이 적용되며, 충전 보너스와 중복 적용됩니다. [Tokens와 그룹](/ko/faq/token-and-groups)을 참조하십시오.

## 지원 기능

| 기능      | 지원 여부 |
| ------- | ----- |
| 스트리밍    | ✅     |
| 도구 호출   | ✅     |
| 구조화된 출력 | ✅     |
| 비전      | ✅     |
| 프롬프트 캐싱 | ✅     |
| 확장된 추론  | 선택 사항 |

## 예제 요청

아래 예제는 OpenAI Chat Completions(`/v1/chat/completions`)을 통해 `gemini-3.5-flash-lite`를 호출합니다. base\_url을 `https://api.apiyi.com/v1`로 지정합니다 — 나머지는 모두 공식 API와 일치합니다.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gemini-3.5-flash-lite",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>환경 변수에서 키를 읽어오며, 절대로 하드코딩하지 마십시오. 운영 환경에서는 사용 사례별로 별도의 token을 발급하여, 사용을 개별적으로 취소하고 추적할 수 있어야 합니다.</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="출시 발표" icon="megaphone" href="/en/news/gemini-3-6-flash-lite-launch">
    Gemini 3.5 Flash-Lite의 배경, 벤치마크 및 마이그레이션 참고 사항
  </Card>

  <Card title="개요" icon="book-open" href="/ko/api-capabilities/gemini-3-5-flash-lite/overview">
    매개변수, 사용법 및 모범 사례
  </Card>

  <Card title="네이티브 호출" icon="book-open" href="/ko/api-capabilities/gemini/native">
    매개변수, 사용법 및 모범 사례
  </Card>

  <Card title="Gemini 3.6 Flash" icon="git-compare" href="/ko/models/gemini-3-6-flash">
    동일 제품군 모델의 세부 정보
  </Card>

  <Card title="Gemini 3.5 Flash" icon="git-compare" href="/ko/models/gemini-3-5-flash">
    동일 제품군 모델의 세부 정보
  </Card>

  <Card title="모델 가격 디렉터리" icon="table" href="/en/models">
    283개 모든 모델의 실시간 가격, 엔드포인트 및 그룹
  </Card>
</CardGroup>

<Note>이 페이지의 사양은 `models/data/model-details.json`에서 수동으로 관리되며, 가격 및 엔드포인트는 2026-08-31 11:46 (UTC+8)에 업데이트된 실시간 가격 API에서 가져옵니다. 사양은 2026-07-31에 마지막으로 확인되었습니다.</Note>
