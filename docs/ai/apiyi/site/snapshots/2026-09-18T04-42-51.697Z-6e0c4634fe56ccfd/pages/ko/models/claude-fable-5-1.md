> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Fable 5.1

> APIYI의 Claude Fable 5.1: token 100만 개당 입력 $10 / 출력 $50, 컨텍스트 윈도우 1,000,000, 최대 출력 128,000, 4개 과금 그룹에서 사용 가능합니다.

Mythos급 플래그십의 첫 번째 버전입니다. 입력 및 출력 가격은 유지되는 반면 캐시 읽기 가격은 4분의 1로 인하됩니다. 악용 감지를 위해 입력 및 출력은 30일 동안 보관됩니다.

## 사양

| 항목                | 값                                                |
| ----------------- | ------------------------------------------------ |
| **모델 ID**         | `claude-fable-5-1` · `claude-fable-5-1-thinking` |
| **제공업체**          | Anthropic                                        |
| **제공업체 출시일**      | 2026-09-01                                       |
| **APIYI에서 사용 가능** | 2026-09-02                                       |
| **지식 기준일**        | 공개되지 않음                                          |
| **입력 모달리티**       | 텍스트, 이미지                                         |
| **출력 모달리티**       | 텍스트                                              |
| **컨텍스트 윈도우**      | 1,000,000 tokens                                 |
| **최대 출력**         | 128,000 tokens                                   |
| **과금**            | 사용량 기반                                           |

## 가격

1M token당 USD 가격(\$/1M)입니다.

| 입력   | 캐시된 입력 | 출력   |
| ---- | ------ | ---- |
| \$10 | \$1    | \$50 |

<Info>표에는 **정가**가 표시됩니다. 충전 프로모션과 그룹 할인은 **중복 적용**되며, 콘솔에는 실제 과금액이 실시간으로 반영됩니다. [가격](/ko/pricing) 및 [충전 프로모션](/ko/faq/recharge-promotions)을 참조하십시오.</Info>

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

| 그룹               | 배수    | 참고      |
| ---------------- | ----- | ------- |
| `ClaudeCode`     | 0.95× | 정가의 95% |
| `Claude_Reverse` | 0.5×  | 정가의 50% |
| `Default`        | 1×    | 정가      |
| `SVIP`           | 1×    | 정가      |

일부 그룹에는 충전 보너스와 중복 적용할 수 있는 추가 할인이 제공됩니다. [tokens 및 그룹](/ko/faq/token-and-groups)을 참고하십시오.

## 지원 기능

| 기능      | 지원 여부  |
| ------- | ------ |
| 스트리밍    | ✅      |
| 도구 호출   | ✅      |
| 구조화된 출력 | ✅      |
| 비전      | ✅      |
| 프롬프트 캐싱 | ✅      |
| 확장된 사고  | 선택적 사용 |

## 변형

| 모델 ID                       | 비고                                           |
| --------------------------- | -------------------------------------------- |
| `claude-fable-5-1`          | 표준 호출입니다.                                    |
| `claude-fable-5-1-thinking` | 강제 추론 변형이며, 가격, 엔드포인트 및 그룹은 모두 표준 모델과 동일합니다. |

## Example request

The example below calls `claude-fable-5-1` through OpenAI Chat Completions (`/v1/chat/completions`). Point base\_url at `https://api.apiyi.com/v1` — everything else matches the official API.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "claude-fable-5-1",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>Read the key from an environment variable, never hard-coded. In production, issue separate tokens per use case so you can revoke and attribute usage individually.</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="출시 발표" icon="megaphone" href="/en/news/claude-fable-5-1-launch">
    Claude Fable 5.1의 배경, 벤치마크 및 마이그레이션 참고 사항
  </Card>

  <Card title="Claude API 기본" icon="book-open" href="/ko/api-capabilities/claude">
    매개변수, 사용법 및 모범 사례
  </Card>

  <Card title="추론 및 사고" icon="book-open" href="/ko/api-capabilities/claude-effort-thinking">
    매개변수, 사용법 및 모범 사례
  </Card>

  <Card title="Claude Fable 5" icon="git-compare" href="/ko/models/claude-fable-5">
    동일한 제품군에 속한 모델의 세부 정보
  </Card>

  <Card title="Claude Opus 5" icon="git-compare" href="/ko/models/claude-opus-5">
    동일한 제품군에 속한 모델의 세부 정보
  </Card>

  <Card title="모델 가격 디렉터리" icon="table" href="/en/models">
    모든 모델의 실시간 가격, 엔드포인트 및 그룹
  </Card>
</CardGroup>

<Note>이 페이지의 사양은 수동으로 `models/data/model-details.json`에서 관리되며, 가격 및 엔드포인트는 실시간 가격 API에서 가져와 재빌드할 때마다 새로 고쳐집니다.</Note>
