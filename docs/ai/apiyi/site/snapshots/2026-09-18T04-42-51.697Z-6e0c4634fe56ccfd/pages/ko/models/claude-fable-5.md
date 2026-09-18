> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Fable 5

> APIYI의 Claude Fable 5: 1M tokens당 입력 $10 / 출력 $50, 4개의 과금 그룹에서 이용 가능합니다.

Mythos 계열 플래그십으로, 소프트웨어 엔지니어링과 시각 이해 전반에서 SOTA에 근접합니다. 입력과 출력은 남용 탐지를 위해 30일 동안 보관됩니다.

## 사양

| 항목                | 값                                            |
| ----------------- | -------------------------------------------- |
| **모델 ID**         | `claude-fable-5` · `claude-fable-5-thinking` |
| **벤더**            | Anthropic                                    |
| **APIYI에서 사용 가능** | 2026-06-10                                   |
| **지식 컷오프**        | 공개되지 않음                                      |
| **입력 모달리티**       | 텍스트, 이미지                                     |
| **출력 모달리티**       | 텍스트                                          |
| **과금**            | 사용량 기반                                       |

## 가격

1M tokens당 USD 가격(\$/1M).

| 입력   | 캐시된 입력 | 출력   |
| ---- | ------ | ---- |
| \$10 | \$1    | \$50 |

<Info>표에는 **목록 가격**이 표시됩니다. 충전 프로모션과 그룹 할인은 **중복 적용**되며, 콘솔에는 실제 과금이 실시간으로 반영됩니다. 자세한 내용은 [가격](/ko/pricing) 및 [충전 프로모션](/ko/faq/recharge-promotions)을 참조하십시오.</Info>

## 엔드포인트

| 엔드포인트                     | 경로                                            | 지원됨 |
| ------------------------- | --------------------------------------------- | --- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅   |
| `OpenAI Responses`        | `POST /v1/responses`                          | —   |
| `Anthropic Messages`      | `POST /v1/messages`                           | ✅   |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —   |
| `Image Generations`       | `POST /v1/images/generations`                 | —   |
| `Embeddings`              | `POST /v1/embeddings`                         | —   |

## 과금 그룹

| 그룹               | 배수    | 비고      |
| ---------------- | ----- | ------- |
| `ClaudeCode`     | 0.95× | 정가의 95% |
| `Claude_Reverse` | 0.5×  | 정가의 50% |
| `Default`        | 1×    | 정가      |
| `SVIP`           | 1×    | 정가      |

일부 그룹에는 충전 보너스와 중복 적용 가능한 추가 할인이 제공됩니다. [tokens 및 그룹](/ko/faq/token-and-groups)을 참조하세요.

## 지원되는 기능

| 기능      | 지원 여부 |
| ------- | ----- |
| 스트리밍    | ✅     |
| 도구 호출   | ✅     |
| 구조화된 출력 | ✅     |
| 비전      | ✅     |
| 프롬프트 캐싱 | ✅     |
| 확장된 추론  | 선택 사항 |

## 변형

| 모델 ID                     | 비고                                                              |
| ------------------------- | --------------------------------------------------------------- |
| `claude-fable-5`          | 표준 호출입니다.                                                       |
| `claude-fable-5-thinking` | 강제 추론 변형이며, 과금과 엔드포인트는 표준 모델과 동일하고 ClaudeCodeReverse 그룹은 제외됩니다. |

## 예제 요청

아래 예제는 `claude-fable-5`를 OpenAI Chat Completions(`/v1/chat/completions`)을 통해 호출합니다. base\_url을 `https://api.apiyi.com/v1`로 지정하면 나머지는 공식 API와 같습니다.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "claude-fable-5",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>환경 변수에서 키를 읽고, 하드코딩하지 마십시오. 운영 환경에서는 사용 사례별로 별도의 token을 발급하여 사용을 개별적으로 취소하고 귀속할 수 있도록 하십시오.</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="출시 공지" icon="megaphone" href="/en/news/claude-fable-5-launch">
    Claude Fable 5의 배경, 벤치마크 및 마이그레이션 참고 사항
  </Card>

  <Card title="Claude API 기본" icon="book-open" href="/ko/api-capabilities/claude">
    매개변수, 사용법 및 모범 사례
  </Card>

  <Card title="작업량 및 사고" icon="book-open" href="/ko/api-capabilities/claude-effort-thinking">
    매개변수, 사용법 및 모범 사례
  </Card>

  <Card title="Claude Opus 5" icon="git-compare" href="/ko/models/claude-opus-5">
    동일한 제품군에 속한 모델의 세부 정보
  </Card>

  <Card title="모델 가격 디렉터리" icon="table" href="/en/models">
    모든 모델의 실시간 가격 정보, 엔드포인트 및 그룹
  </Card>
</CardGroup>

<Note>이 페이지의 사양은 `models/data/model-details.json`에서 수동으로 관리되며, 가격 정보와 엔드포인트는 실시간 가격 정보 API에서 가져와 모든 빌드마다 갱신됩니다.</Note>
