> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Opus 5

> APIYI의 Claude Opus 5: 1M tokens당 입력 $5 / 출력 $25, 컨텍스트 1,000,000, 최대 출력 128,000, 4개의 과금 그룹에서 이용 가능합니다.

Anthropic의 대표 모델: Fable-5에 근접한 지능을 Opus 4.8 과금으로 제공하며, 1M context window와 기본 활성화된 thinking을 지원합니다.

## 사양

| 항목                | 값                                          |
| ----------------- | ------------------------------------------ |
| **모델 ID**         | `claude-opus-5` · `claude-opus-5-thinking` |
| **벤더**            | Anthropic                                  |
| **벤더 출시일**        | 2026-07-24                                 |
| **APIYI에서 사용 가능** | 2026-07-25                                 |
| **지식 컷오프**        | 공개되지 않음                                    |
| **입력 모달리티**       | 텍스트, 이미지                                   |
| **출력 모달리티**       | 텍스트                                        |
| **컨텍스트 윈도우**      | 1,000,000 tokens                           |
| **최대 출력**         | 128,000 tokens                             |
| **과금**            | 사용량 기반                                     |

## 가격

가격은 USD 기준 1M token당입니다(\$/1M).

| 입력  | 캐시된 입력 | 출력   |
| --- | ------ | ---- |
| \$5 | \$0.5  | \$25 |

<Info>이 표는 **정가**를 보여 줍니다. 충전 프로모션과 그룹 할인은 **중복 적용**됩니다. 콘솔에는 실제 과금이 실시간으로 반영됩니다. [가격](/ko/pricing) 및 [충전 프로모션](/ko/faq/recharge-promotions)을 참조하십시오.</Info>

## 엔드포인트

| 엔드포인트                     | 경로                                            | 지원 여부 |
| ------------------------- | --------------------------------------------- | ----- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅     |
| `OpenAI Responses`        | `POST /v1/responses`                          | —     |
| `Anthropic Messages`      | `POST /v1/messages`                           | ✅     |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —     |
| `Image Generations`       | `POST /v1/images/generations`                 | —     |
| `Embeddings`              | `POST /v1/embeddings`                         | —     |

## 과금 그룹

| 그룹               | 배수    | 참고 사항   |
| ---------------- | ----- | ------- |
| `ClaudeCode`     | 0.95× | 정가의 95% |
| `Claude_Reverse` | 0.5×  | 정가의 50% |
| `Default`        | 1×    | 정가      |
| `SVIP`           | 1×    | 정가      |

일부 그룹에는 충전 보너스와 중복 적용할 수 있는 추가 할인이 제공됩니다. [tokens 및 그룹](/ko/faq/token-and-groups)을 참조하세요.

## 지원 기능

| Feature | Supported |
| ------- | --------- |
| 스트리밍    | ✅         |
| 도구 호출   | ✅         |
| 구조화된 출력 | ✅         |
| 비전      | ✅         |
| 프롬프트 캐싱 | ✅         |
| 확장 추론   | 기본적으로 켜짐  |
| 웹 검색    | ✅         |

## Variants

| Model ID                 | Notes                                        |
| ------------------------ | -------------------------------------------- |
| `claude-opus-5`          | 표준 호출입니다. thinking 매개변수를 생략하면 적응형 추론이 실행됩니다. |
| `claude-opus-5-thinking` | 강제 추론 변형입니다. 과금과 엔드포인트는 표준 모델과 동일합니다.        |

## 예제 요청

아래 예제는 OpenAI Chat Completions(`/v1/chat/completions`)를 통해 `claude-opus-5`를 호출합니다. base\_url을 `https://api.apiyi.com/v1`로 지정하면 됩니다 — 나머지는 모두 공식 API와 동일합니다.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "claude-opus-5",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>환경 변수에서 키를 읽고 하드코딩하지 마십시오. 운영 환경에서는 사용 사례별로 별도 token을 발급하여 개별적으로 철회하고 사용량을 개별적으로 추적할 수 있도록 하십시오.</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="출시 발표" icon="megaphone" href="/en/news/claude-opus-5-launch">
    Claude Opus 5의 배경, 벤치마크 및 마이그레이션 참고 사항
  </Card>

  <Card title="Claude API 기본" icon="book-open" href="/ko/api-capabilities/claude">
    매개변수, 사용법 및 모범 사례
  </Card>

  <Card title="추론 수준 및 사고" icon="book-open" href="/ko/api-capabilities/claude-effort-thinking">
    매개변수, 사용법 및 모범 사례
  </Card>

  <Card title="프롬프트 캐싱" icon="book-open" href="/ko/api-capabilities/claude-prompt-caching">
    매개변수, 사용법 및 모범 사례
  </Card>

  <Card title="Claude Sonnet 5" icon="git-compare" href="/ko/models/claude-sonnet-5">
    동일 제품군 모델의 세부 정보
  </Card>

  <Card title="Claude Fable 5" icon="git-compare" href="/ko/models/claude-fable-5">
    동일 제품군 모델의 세부 정보
  </Card>

  <Card title="Claude Opus 4.8" icon="git-compare" href="/ko/models/claude-opus-4-8">
    동일 제품군 모델의 세부 정보
  </Card>

  <Card title="모델 가격 디렉터리" icon="table" href="/en/models">
    모든 모델의 실시간 가격, 엔드포인트 및 그룹
  </Card>
</CardGroup>

<Note>이 페이지의 사양은 `models/data/model-details.json`에서 수동으로 관리되며, 가격 및 엔드포인트는 실시간 가격 API에서 가져와 빌드할 때마다 새로 고칩니다.</Note>
