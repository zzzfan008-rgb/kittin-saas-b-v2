> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.7-Max

> APIYI의 Qwen3.7-Max: 1M token당 입력 $1.714 / 출력 $5.142, 컨텍스트 1,000,000, 3개 과금 그룹에서 이용 가능합니다.

AA 인텔리전스 지수(56.6)에서 전 세계 상위 5위이자 중국 모델 중 1위이며, 자율 에이전트 실행 시간이 약 35시간에 이릅니다.

## 사양

| 항목                | 값                |
| ----------------- | ---------------- |
| **Model ID**      | `qwen3.7-max`    |
| **제공사**           | Alibaba          |
| **APIYI에서 사용 가능** | 2026-05-21       |
| **지식 기준일**        | 공개되지 않음          |
| **입력 모달리티**       | Text             |
| **출력 모달리티**       | Text             |
| **컨텍스트 윈도우**      | 1,000,000 tokens |
| **과금**            | 사용량 기반           |

## 가격

USD 기준 100만 token당 가격(\$/1M).

| 입력      | 캐시된 입력 | 출력      |
| ------- | ------ | ------- |
| \$1.714 | —      | \$5.142 |

<Info>표는 **정가**를 보여줍니다. 충전 프로모션과 그룹 할인은 **중복 적용됩니다**. 콘솔에는 실제 청구 금액이 실시간으로 반영됩니다. [가격](/ko/pricing) 및 [충전 프로모션](/ko/faq/recharge-promotions)을 참조하십시오.</Info>

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

| 그룹           | 요율 배수 | 비고      |
| ------------ | ----- | ------- |
| `ClaudeCode` | 0.95× | 정가의 95% |
| `Default`    | 1×    | 정가      |
| `SVIP`       | 1×    | 정가      |

일부 그룹에는 추가 할인이 적용되며, 충전 보너스와 중복 적용됩니다. [tokens 및 그룹](/ko/faq/token-and-groups)을 참조하세요.

## 지원 기능

| 기능      | 지원 여부 |
| ------- | ----- |
| 스트리밍    | ✅     |
| 툴 호출    | ✅     |
| 구조화된 출력 | ✅     |
| 프롬프트 캐싱 | —     |

## 예제 요청

아래 예제는 `qwen3.7-max`를 OpenAI Chat Completions(`/v1/chat/completions`) 통해 호출합니다. base\_url을 `https://api.apiyi.com/v1`로 지정하세요 — 나머지는 모두 공식 API와 일치합니다.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "qwen3.7-max",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>환경 변수에서 키를 읽고, 절대 하드코딩하지 마십시오. 운영 환경에서는 사용 사례별로 별도의 token을 발급하여 각 token의 사용을 개별적으로 철회하고 추적할 수 있어야 합니다.</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="출시 공지" icon="megaphone" href="/en/news/qwen-3-7-max-launch">
    Qwen3.7-Max의 배경, 벤치마크 및 마이그레이션 참고 사항
  </Card>

  <Card title="모델 과금 디렉터리" icon="table" href="/en/models">
    283개 모델 전체의 실시간 과금, 엔드포인트 및 그룹
  </Card>
</CardGroup>

<Note>이 페이지의 사양은 `models/data/model-details.json`에서 수동으로 관리합니다. 과금 및 엔드포인트는 실시간 과금 API에서 가져오며, 2026-08-31 11:46 (UTC+8)에 업데이트되었습니다. 사양은 2026-07-31에 마지막으로 확인되었습니다.</Note>
