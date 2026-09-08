> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Flash

> APIYI의 DeepSeek V4 Flash: 1M token당 입력 $0.44 / 출력 $1.32, 컨텍스트 1,048,576, 최대 출력 393,216, 4개 과금 그룹에서 이용 가능합니다.

높은 동시 실행 수와 낮은 지연 시간을 위해 설계된 총 284B / 활성 13B MoE이며, 컨텍스트 윈도우는 1M입니다. 암시적 캐싱은 별도 설정이 필요 없고, 두 번째 턴부터 거의 완전한 캐시 적중을 보입니다.

## 사양

| 항목                     | 값                   |
| ---------------------- | ------------------- |
| **Model ID**           | `deepseek-v4-flash` |
| **Vendor**             | DeepSeek            |
| **Available on APIYI** | 2026-04-24          |
| **Knowledge cutoff**   | 공개되지 않음             |
| **Input modalities**   | 텍스트                 |
| **Output modalities**  | 텍스트                 |
| **Context window**     | 1,048,576 tokens    |
| **Max output**         | 393,216 tokens      |
| **Billing**            | 사용량 기반              |

## 가격

가격은 1M tokens당 USD입니다(\$/1M).

| 입력     | 캐시된 입력    | 출력     |
| ------ | --------- | ------ |
| \$0.44 | \$0.01408 | \$1.32 |

<Info>이 표는 **정가**를 보여줍니다. 충전 프로모션과 그룹 할인은 **중복 적용**되며, 콘솔에는 실제 과금이 실시간으로 반영됩니다. [가격](/ko/pricing) 및 [충전 프로모션](/ko/faq/recharge-promotions)을 참조하십시오.</Info>

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
| `CodexResponses` | 1×    | 정가      |
| `Default`        | 1×    | 정가      |
| `SVIP`           | 1×    | 정가      |

일부 그룹에는 추가 할인이 적용되며, 충전 보너스와 중복 적용됩니다. [Tokens 및 그룹](/ko/faq/token-and-groups)을 참조하십시오.

## 지원 기능

| 기능      | 지원 여부 |
| ------- | ----- |
| 스트리밍    | ✅     |
| 도구 호출   | ✅     |
| 구조화된 출력 | —     |
| 프롬프트 캐싱 | ✅     |
| 확장 추론   | 선택 사항 |
| 웹 검색    | —     |

## 예제 요청

아래 예제는 OpenAI Chat Completions(`/v1/chat/completions`)을 통해 `deepseek-v4-flash`를 호출합니다. base\_url을 `https://api.apiyi.com/v1`로 지정합니다 — 나머지는 모두 공식 API와 같습니다.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "deepseek-v4-flash",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>환경 변수에서 키를 읽어오며, 절대로 하드코딩하지 않습니다. 프로덕션에서는 사용 사례별로 별도의 token을 발급하여 사용을 개별적으로 폐기하고 추적할 수 있어야 합니다.</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="출시 공지" icon="megaphone" href="/en/news/deepseek-v4-flash-ga-launch">
    DeepSeek V4 Flash의 배경, 벤치마크 및 마이그레이션 참고 사항
  </Card>

  <Card title="개요" icon="book-open" href="/ko/api-capabilities/deepseek-v4-flash/overview">
    매개변수, 사용법 및 모범 사례
  </Card>

  <Card title="DeepSeek V4 Pro" icon="git-compare" href="/ko/models/deepseek-v4-pro">
    동일한 제품군에 속한 모델에 대한 세부 정보
  </Card>

  <Card title="모델 가격 디렉터리" icon="table" href="/en/models">
    전체 283개 모델의 실시간 가격, 엔드포인트 및 그룹
  </Card>
</CardGroup>

<Note>이 페이지의 사양은 `models/data/model-details.json`에서 수동으로 관리되며, 가격 및 엔드포인트는 2026-08-31 11:46 (UTC+8)에 업데이트된 실시간 가격 API에서 가져옵니다. 사양은 2026-08-17에 마지막으로 확인되었습니다.</Note>
