> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# chat-latest

> APIYI의 chat-latest: 1M token당 입력 $5 / 출력 $30, 컨텍스트 윈도우 400,000, 최대 출력 128,000, 2개의 과금 그룹에서 사용 가능합니다.

OpenAI의 순환 별칭으로, 항상 현재 ChatGPT를 구동하는 모델을 가리킵니다 — 현재는 GPT-5.5 Instant입니다.

## 사양

| 항목                   | 값              |
| -------------------- | -------------- |
| **모델 ID**            | `chat-latest`  |
| **Vendor**           | OpenAI         |
| **APIYI에서 사용 가능**    | 2026-05-21     |
| **Knowledge cutoff** | 2025-08        |
| **입력 모달리티**          | 텍스트, 이미지       |
| **출력 모달리티**          | 텍스트            |
| **컨텍스트 윈도우**         | 400,000 tokens |
| **최대 출력**            | 128,000 tokens |
| **과금**               | 사용량 기반         |

## Pricing

가격은 1M tokens당 USD(\$/1M)입니다.

| 입력  | 캐시된 입력 | 출력   |
| --- | ------ | ---- |
| \$5 | \$0.5  | \$30 |

<Info>표에는 **정가**가 표시됩니다. 충전 프로모션과 그룹 할인은 **중복 적용**됩니다. 콘솔에는 실제 과금이 실시간으로 반영됩니다. [Pricing](/ko/pricing) 및 [충전 프로모션](/ko/faq/recharge-promotions)을 참조하십시오.</Info>

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

| 그룹        | 요율 배수 | 비고 |
| --------- | ----- | -- |
| `Default` | 1×    | 정가 |
| `SVIP`    | 1×    | 정가 |

일부 그룹에는 추가 할인이 적용되며, 충전 보너스와 함께 중복 적용됩니다. [토큰과 그룹](/ko/faq/token-and-groups)을 참조하십시오.

## 지원 기능

| 기능      | 지원 여부 |
| ------- | ----- |
| 스트리밍    | ✅     |
| 도구 호출   | ✅     |
| 구조화된 출력 | ✅     |
| 비전      | ✅     |
| 프롬프트 캐싱 | ✅     |
| 웹 검색    | ✅     |
| 코드 실행   | ✅     |
| 미세 조정   | —     |

## 요청 예시

아래 예시는 OpenAI Chat Completions(`/v1/chat/completions`)를 통해 `chat-latest`를 호출합니다. base\_url을 `https://api.apiyi.com/v1`로 지정하세요 — 나머지는 공식 API와 동일합니다.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "chat-latest",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>키는 환경 변수에서 읽어오고, 하드코딩하지 마십시오. 운영 환경에서는 사용 사례별로 별도의 token을 발급하여 개별적으로 폐기하고 사용량을 추적할 수 있어야 합니다.</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="출시 공지" icon="megaphone" href="/en/news/chat-latest-launch">
    chat-latest의 배경, 벤치마크 및 마이그레이션 참고 사항
  </Card>

  <Card title="호환 모드" icon="book-open" href="/ko/api-capabilities/openai/compatible">
    매개변수, 사용법 및 모범 사례
  </Card>

  <Card title="모델 과금 디렉터리" icon="table" href="/en/models">
    모든 모델의 실시간 과금, 엔드포인트 및 그룹
  </Card>
</CardGroup>

<Note>이 페이지의 사양은 `models/data/model-details.json`에서 수동으로 관리되며, 과금 및 엔드포인트는 실시간 과금 API에서 가져오고 모든 빌드마다 새로 고쳐집니다.</Note>
