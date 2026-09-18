> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Seed 2.1 Turbo

> APIYI의 Seed 2.1 Turbo: 1M tokens당 입력 $0.5 / 출력 $2.5, 256,000 컨텍스트, 3개 과금 그룹에서 이용 가능합니다.

고빈도 워크로드를 위한 프로덕션 텍스트 모델입니다: 두 엔드포인트 모두에서 15/15 검증되었으며, 추론 토글과 두 단계의 캐싱을 제공합니다.

## 사양

| 항목                | 값                            |
| ----------------- | ---------------------------- |
| **모델 ID**         | `dola-seed-2-1-turbo-260628` |
| **공급사**           | ByteDance                    |
| **공급사 출시일**       | 2026-06-23                   |
| **APIYI에서 사용 가능** | 2026-07-21                   |
| **지식 기준일**        | 공개되지 않음                      |
| **입력 양식**         | Text                         |
| **출력 양식**         | Text                         |
| **컨텍스트 윈도우**      | 256,000 tokens               |
| **과금**            | 사용량 기반                       |

## 가격

가격은 1M token당 USD로 표시됩니다 (\$/1M).

| 입력    | 캐시된 입력 | 출력    |
| ----- | ------ | ----- |
| \$0.5 | \$0.1  | \$2.5 |

<Info>이 표는 **정가**를 보여줍니다. 충전 프로모션과 그룹 할인은 **중복 적용**되며, 콘솔에는 실제 과금이 실시간으로 반영됩니다. [가격](/ko/pricing) 및 [충전 프로모션](/ko/faq/recharge-promotions)을 참조하십시오.</Info>

## 엔드포인트

| 엔드포인트                     | 경로                                            | 지원 여부 |
| ------------------------- | --------------------------------------------- | ----- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅     |
| `OpenAI Responses`        | `POST /v1/responses`                          | ✅     |
| `Anthropic Messages`      | `POST /v1/messages`                           | —     |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —     |
| `Image Generations`       | `POST /v1/images/generations`                 | —     |
| `Embeddings`              | `POST /v1/embeddings`                         | —     |

## Billing groups

| 그룹               | 요율 배수 | 비고 |
| ---------------- | ----- | -- |
| `CodexResponses` | 1×    | 정가 |
| `Default`        | 1×    | 정가 |
| `SVIP`           | 1×    | 정가 |

일부 그룹에는 추가 할인이 적용되며, 충전 보너스와 중복 적용할 수 있습니다. [Tokens 및 그룹](/ko/faq/token-and-groups)를 참조하십시오.

## 지원되는 기능

| 기능      | 지원 여부         |
| ------- | ------------- |
| 스트리밍    | ✅             |
| 도구 호출   | ✅             |
| 구조화된 출력 | ✅             |
| 프롬프트 캐싱 | ✅             |
| 확장된 추론  | 기본적으로 켜져 있습니다 |

## 예시 요청

아래 예시는 OpenAI Chat Completions(`/v1/chat/completions`)을 통해 `dola-seed-2-1-turbo-260628`를 호출합니다. base\_url을 `https://api.apiyi.com/v1`로 지정합니다. 그 외에는 모두 공식 API와 동일합니다.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "dola-seed-2-1-turbo-260628",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>환경 변수에서 키를 읽어오고, 절대 하드코딩하지 마십시오. 운영 환경에서는 사용 사례별로 별도의 token을 발급하여 나중에 개별적으로 취소하고 사용 내역을 구분할 수 있어야 합니다.</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="출시 공지" icon="megaphone" href="/en/news/dola-seed-2-1-turbo-launch">
    Seed 2.1 Turbo의 배경, 벤치마크 및 마이그레이션 참고 사항
  </Card>

  <Card title="개요" icon="book-open" href="/ko/api-capabilities/dola-seed-2-1-turbo/overview">
    매개변수, 사용법 및 모범 사례
  </Card>

  <Card title="모델 과금 디렉터리" icon="table" href="/en/models">
    모든 모델의 실시간 과금, 엔드포인트 및 그룹
  </Card>
</CardGroup>

<Note>이 페이지의 사양은 수동으로 `models/data/model-details.json`에서 관리하며, 과금 및 엔드포인트는 실시간 과금 API에서 가져와 다시 빌드할 때마다 새로 고칩니다.</Note>
