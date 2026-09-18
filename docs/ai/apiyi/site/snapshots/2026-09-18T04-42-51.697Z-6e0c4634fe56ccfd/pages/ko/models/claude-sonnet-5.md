> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Sonnet 5

> Claude Sonnet 5는 APIYI에서 $2 입력 / $10 출력으로 100만 token당 이용할 수 있으며, 4개의 과금 그룹에서 제공됩니다.

코딩 및 에이전트 개발에 적합한 선택: SWE-bench Verified에서 85.2%, 높은 캐시 적중률을 갖춘 순수 AWS 패스스루입니다.

## 사양

| 항목                | 값                                              |
| ----------------- | ---------------------------------------------- |
| **모델 ID**         | `claude-sonnet-5` · `claude-sonnet-5-thinking` |
| **벤더**            | Anthropic                                      |
| **APIYI에서 사용 가능** | 2026-07-01                                     |
| **지식 컷오프**        | 공개되지 않음                                        |
| **입력 모달리티**       | 텍스트, 이미지                                       |
| **출력 모달리티**       | 텍스트                                            |
| **과금**            | 사용량 기반                                         |

## 가격

USD 기준 token 100만 개당 가격(\$/1M)입니다.

| 입력  | 캐시된 입력 | 출력   |
| --- | ------ | ---- |
| \$2 | \$0.2  | \$10 |

<Info>이 표는 **정가**를 보여줍니다. 충전 프로모션과 그룹 할인은 **중복 적용됩니다**; 콘솔에는 실제 과금이 실시간으로 반영됩니다. [가격](/ko/pricing) 및 [충전 프로모션](/ko/faq/recharge-promotions)을 참조하십시오.</Info>

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

| 그룹               | 요율 배수 | 비고      |
| ---------------- | ----- | ------- |
| `ClaudeCode`     | 0.95× | 정가의 95% |
| `Claude_Reverse` | 0.5×  | 정가의 50% |
| `Default`        | 1×    | 정가      |
| `SVIP`           | 1×    | 정가      |

일부 그룹에는 충전 보너스와 중첩 가능한 추가 할인이 적용됩니다. [tokens 및 그룹](/ko/faq/token-and-groups)을 참조하십시오.

## 지원되는 기능

| 기능      | 지원 여부 |
| ------- | ----- |
| 스트리밍    | ✅     |
| 도구 호출   | ✅     |
| 구조화된 출력 | ✅     |
| Vision  | ✅     |
| 프롬프트 캐싱 | ✅     |
| 확장된 추론  | 옵트인   |

## 변형

| 모델 ID                      | 비고                                   |
| -------------------------- | ------------------------------------ |
| `claude-sonnet-5`          | 표준 호출입니다.                            |
| `claude-sonnet-5-thinking` | 강제 추론 변형이며, 과금과 엔드포인트는 표준 모델과 동일합니다. |

## 예제 요청

아래 예제는 `claude-sonnet-5`를 OpenAI Chat Completions(`/v1/chat/completions`)를 통해 호출합니다. base\_url을 `https://api.apiyi.com/v1`로 지정하면 나머지는 공식 API와 동일합니다.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "claude-sonnet-5",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>키는 환경 변수에서 읽어오고, 절대 하드코딩하지 마십시오. 운영 환경에서는 사용 사례별로 별도의 token을 발급하여 개별적으로 폐기하고 사용량을 개별적으로 귀속할 수 있어야 합니다.</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="출시 발표" icon="megaphone" href="/en/news/claude-sonnet-5-launch">
    Claude Sonnet 5의 배경, 벤치마크 및 마이그레이션 참고 사항
  </Card>

  <Card title="Claude API 기본" icon="book-open" href="/ko/api-capabilities/claude">
    매개변수, 사용법 및 모범 사례
  </Card>

  <Card title="프롬프트 캐싱" icon="book-open" href="/ko/api-capabilities/claude-prompt-caching">
    매개변수, 사용법 및 모범 사례
  </Card>

  <Card title="Claude Opus 5" icon="git-compare" href="/ko/models/claude-opus-5">
    같은 제품군에 속한 모델의 세부 정보
  </Card>

  <Card title="모델 과금 디렉터리" icon="table" href="/en/models">
    모든 모델의 실시간 과금, 엔드포인트 및 그룹
  </Card>
</CardGroup>

<Note>이 페이지의 사양은 `models/data/model-details.json`에서 수동으로 관리되며, 과금 및 엔드포인트는 실시간 과금 API에서 가져와 빌드할 때마다 새로 고칩니다.</Note>
