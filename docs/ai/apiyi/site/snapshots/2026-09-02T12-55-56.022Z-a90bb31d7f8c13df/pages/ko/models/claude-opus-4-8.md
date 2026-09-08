> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Opus 4.8

> APIYI의 Claude Opus 4.8: 100만 token당 입력 $5 / 출력 $25, 컨텍스트 윈도우 200,000, 4개 과금 그룹에서 이용 가능합니다.

이전 Opus 플래그십: 에이전트형 코딩에서 69.2%를 기록하며, 다섯 가지 작업 강도 수준과 동적 워크플로를 제공합니다.

## 사양

| 항목                | 값                                              |
| ----------------- | ---------------------------------------------- |
| **모델 ID**         | `claude-opus-4-8` · `claude-opus-4-8-thinking` |
| **제공업체**          | Anthropic                                      |
| **APIYI에서 사용 가능** | 2026-05-28                                     |
| **지식 기준 시점**      | 공개되지 않음                                        |
| **입력 방식**         | 텍스트, 이미지                                       |
| **출력 방식**         | 텍스트                                            |
| **컨텍스트 윈도우**      | 200,000 tokens                                 |
| **과금**            | 사용량 기반                                         |

## 가격

USD 기준 1M tokens당 가격(\$/1M).

| 입력  | 캐시된 입력 | 출력   |
| --- | ------ | ---- |
| \$5 | \$0.5  | \$25 |

<Info>이 표는 **정가**를 보여줍니다. 충전 프로모션과 그룹 할인은 **중복 적용**됩니다. 콘솔에는 실제 청구 금액이 실시간으로 반영됩니다. [가격](/ko/pricing)과 [충전 프로모션](/ko/faq/recharge-promotions)을 확인하십시오.</Info>

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

| 그룹                  | 요율 배수 | 비고      |
| ------------------- | ----- | ------- |
| `ClaudeCode`        | 0.95× | 정가의 95% |
| `ClaudeCodeReverse` | 0.5×  | 정가의 50% |
| `Default`           | 1×    | 정가      |
| `SVIP`              | 1×    | 정가      |

일부 그룹에는 추가 할인이 적용되며, 충전 보너스와 중복 적용할 수 있습니다. [Tokens 및 그룹](/ko/faq/token-and-groups)을 참조하십시오.

## 지원 기능

| 기능      | 지원 여부 |
| ------- | ----- |
| 스트리밍    | ✅     |
| 도구 호출   | ✅     |
| 구조화된 출력 | ✅     |
| 비전      | ✅     |
| 프롬프트 캐싱 | ✅     |
| 확장된 추론  | 선택 사항 |

## 변형

| 모델 ID                      | 참고                                     |
| -------------------------- | -------------------------------------- |
| `claude-opus-4-8`          | 표준 호출입니다.                              |
| `claude-opus-4-8-thinking` | 강제 추론 변형입니다. 과금 및 엔드포인트는 표준 모델과 동일합니다. |

## 예제 요청

아래 예제는 OpenAI Chat Completions(`/v1/chat/completions`)을 통해 `claude-opus-4-8`를 호출합니다. base\_url을 `https://api.apiyi.com/v1`로 지정하십시오 — 나머지는 모두 공식 API와 동일합니다.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "claude-opus-4-8",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>키는 환경 변수에서 읽어오며, 절대 하드코딩하지 마십시오. 프로덕션에서는 사용 사례마다 별도의 token을 발급하여 개별적으로 폐기하고 사용 내역을 따로 귀속할 수 있어야 합니다.</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="출시 발표" icon="megaphone" href="/en/news/claude-opus-4-8-launch">
    Claude Opus 4.8의 배경, 벤치마크 및 마이그레이션 참고 사항
  </Card>

  <Card title="Claude API 기본" icon="book-open" href="/ko/api-capabilities/claude">
    매개변수, 사용법 및 모범 사례
  </Card>

  <Card title="추론 작업량 및 사고" icon="book-open" href="/ko/api-capabilities/claude-effort-thinking">
    매개변수, 사용법 및 모범 사례
  </Card>

  <Card title="Claude Opus 5" icon="git-compare" href="/ko/models/claude-opus-5">
    동일한 제품군에 속한 모델의 세부 정보
  </Card>

  <Card title="모델 가격 디렉터리" icon="table" href="/en/models">
    283개 모든 모델의 실시간 가격, 엔드포인트 및 그룹
  </Card>
</CardGroup>

<Note>이 페이지의 사양은 `models/data/model-details.json`에서 수동으로 관리되며, 가격 및 엔드포인트는 2026-08-31 11:46 (UTC+8)에 업데이트된 실시간 가격 API에서 가져옵니다. 사양은 2026-07-31에 마지막으로 확인되었습니다.</Note>
