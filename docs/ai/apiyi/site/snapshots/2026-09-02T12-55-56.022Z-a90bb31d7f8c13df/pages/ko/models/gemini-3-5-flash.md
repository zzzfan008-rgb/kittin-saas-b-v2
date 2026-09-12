> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.5 Flash

> APIYI의 Gemini 3.5 Flash: 1M token당 입력 $1.5 / 출력 $9, 컨텍스트 1,000,000, 최대 출력 64,000, 2개 과금 그룹에서 제공됩니다.

Terminal-Bench 2.1에서 76.2%를 기록하며, 암호화된 추론 컨텍스트가 호출 간에 유지됩니다. Computer Use는 지원되지 않습니다.

## 사양

| 항목                | 값                         |
| ----------------- | ------------------------- |
| **모델 ID**         | `gemini-3.5-flash`        |
| **공급업체**          | Google                    |
| **APIYI에서 이용 가능** | 2026-05-20                |
| **지식 컷오프**        | 공개되지 않음                   |
| **입력 방식**         | Text, Image, Audio, Video |
| **출력 방식**         | Text                      |
| **컨텍스트 윈도우**      | 1,000,000 tokens          |
| **최대 출력**         | 64,000 tokens             |
| **과금**            | 사용량 기반                    |

## 가격

가격은 1M token당 USD 기준입니다(\$/1M).

| 입력    | 캐시된 입력 | 출력  |
| ----- | ------ | --- |
| \$1.5 | \$0.15 | \$9 |

<Info>표에는 **정가**가 표시됩니다. 충전 프로모션과 그룹 할인은 **중복 적용됩니다**; 콘솔에는 실제 청구 금액이 실시간으로 반영됩니다. [가격](/ko/pricing) 및 [충전 프로모션](/ko/faq/recharge-promotions)을 확인하십시오.</Info>

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

| 그룹        | 요율 배수 | 비고 |
| --------- | ----- | -- |
| `Default` | 1×    | 정가 |
| `SVIP`    | 1×    | 정가 |

일부 그룹에는 추가 할인이 적용되며, 충전 보너스와 중복 적용될 수 있습니다. [tokens 및 그룹](/ko/faq/token-and-groups)을 참조하세요.

## 지원 기능

| 기능      | 지원 여부    |
| ------- | -------- |
| 스트리밍    | ✅        |
| 도구 호출   | ✅        |
| 구조화된 출력 | ✅        |
| 비전      | ✅        |
| 프롬프트 캐싱 | ✅        |
| 확장된 추론  | 기본적으로 켜짐 |

## 예제 요청

아래 예제는 OpenAI Chat Completions(`/v1/chat/completions`)를 통해 `gemini-3.5-flash`를 호출합니다. base\_url을 `https://api.apiyi.com/v1`로 지정하십시오. 그 외의 모든 항목은 공식 API와 동일합니다.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gemini-3.5-flash",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>환경 변수에서 키를 읽으십시오. 절대로 하드코딩하지 마십시오. 프로덕션에서는 사용 사례별로 별도의 token을 발급하여 개별적으로 철회하고 사용 내역을 개별적으로 추적할 수 있도록 하십시오.</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="출시 공지" icon="megaphone" href="/en/news/gemini-3-5-flash-launch">
    Gemini 3.5 Flash의 배경, 벤치마크 및 마이그레이션 참고 사항
  </Card>

  <Card title="네이티브 호출" icon="book-open" href="/ko/api-capabilities/gemini/native">
    매개변수, 사용법 및 모범 사례
  </Card>

  <Card title="Gemini 3.6 Flash" icon="git-compare" href="/ko/models/gemini-3-6-flash">
    동일한 제품군에 속한 모델의 세부 정보
  </Card>

  <Card title="Gemini 3.5 Flash-Lite" icon="git-compare" href="/ko/models/gemini-3-5-flash-lite">
    동일한 제품군에 속한 모델의 세부 정보
  </Card>

  <Card title="모델 과금 디렉터리" icon="table" href="/en/models">
    전체 283개 모델의 실시간 과금, 엔드포인트 및 그룹
  </Card>
</CardGroup>

<Note>이 페이지의 사양은 `models/data/model-details.json`에서 수동으로 관리되며, 과금 및 엔드포인트는 2026-08-31 11:46 (UTC+8)에 업데이트된 실시간 과금 API에서 가져옵니다. 사양은 2026-07-31에 최종 확인되었습니다.</Note>
