> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# DeepSeek V4 Pro

> APIYI의 DeepSeek V4 Pro: 입력 100만 tokens당 $1.32 / 출력 $3.96, 컨텍스트 윈도우 1,048,576, 3개 과금 그룹에서 이용 가능합니다.

총 1.6T / 활성 49B MoE 플래그십: 에이전트 코딩에서 오픈소스 SOTA, SWE-Verified 80.6, 추론 노력은 최대까지 조절 가능합니다.

## 사양

| 항목                | 값                 |
| ----------------- | ----------------- |
| **모델 ID**         | `deepseek-v4-pro` |
| **공급업체**          | DeepSeek          |
| **APIYI에서 사용 가능** | 2026-04-24        |
| **지식 기준 시점**      | 공개되지 않음           |
| **입력 모달리티**       | 텍스트               |
| **출력 모달리티**       | 텍스트               |
| **컨텍스트 윈도우**      | 1,048,576 tokens  |
| **과금**            | 사용량 기반            |

## 가격

가격은 1M token당 USD(\$/1M)입니다.

| 입력     | 캐시된 입력     | 출력     |
| ------ | ---------- | ------ |
| \$1.32 | \$0.043996 | \$3.96 |

<Info>이 표는 **정가**를 보여줍니다. 충전 프로모션과 그룹 할인은 **중복 적용**됩니다. 콘솔에는 실제 청구 금액이 실시간으로 반영됩니다. [가격](/ko/pricing) 및 [충전 프로모션](/ko/faq/recharge-promotions)을 참고하십시오.</Info>

## 엔드포인트

| 엔드포인트                     | 경로                                            | 지원됨 |
| ------------------------- | --------------------------------------------- | --- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅   |
| `OpenAI Responses`        | `POST /v1/responses`                          | —   |
| `Anthropic Messages`      | `POST /v1/messages`                           | ✅   |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —   |
| `Image Generations`       | `POST /v1/images/generations`                 | —   |
| `Embeddings`              | `POST /v1/embeddings`                         | —   |

## Billing 그룹

| Group        | 요율 배수 | Notes      |
| ------------ | ----- | ---------- |
| `ClaudeCode` | 0.95× | 목록 가격의 95% |
| `Default`    | 1×    | 목록 가격      |
| `SVIP`       | 1×    | 목록 가격      |

일부 그룹에는 추가 할인이 적용되며 충전 보너스와 중복 적용됩니다. 자세한 내용은 [Token과 그룹](/ko/faq/token-and-groups)을 참조하십시오.

## 지원되는 기능

| 기능      | 지원 여부 |
| ------- | ----- |
| 스트리밍    | ✅     |
| 도구 호출   | ✅     |
| 프롬프트 캐싱 | ✅     |
| 확장 추론   | 옵트인   |

## 예제 요청

아래 예제는 `deepseek-v4-pro`를 OpenAI Chat Completions(`/v1/chat/completions`)를 통해 호출합니다. base\_url을 `https://api.apiyi.com/v1`로 지정합니다 — 나머지는 공식 API와 동일합니다.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "deepseek-v4-pro",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>환경 변수에서 키를 읽고, 절대로 하드코딩하지 마십시오. 프로덕션에서는 사용 사례별로 별도의 token을 발급하여 개별적으로 폐기하고 사용량을 용도별로 귀속할 수 있어야 합니다.</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="출시 공지" icon="megaphone" href="/en/news/deepseek-v4-launch">
    DeepSeek V4 Pro의 배경, 벤치마크 및 마이그레이션 참고 사항
  </Card>

  <Card title="DeepSeek V4 Flash" icon="git-compare" href="/ko/models/deepseek-v4-flash">
    동일한 제품군에 속한 모델의 세부 정보
  </Card>

  <Card title="모델 가격 디렉터리" icon="table" href="/en/models">
    전체 283개 모델의 실시간 가격, 엔드포인트 및 그룹
  </Card>
</CardGroup>

<Note>이 페이지의 사양은 `models/data/model-details.json`에서 수동으로 관리되며, 가격 및 엔드포인트는 2026-08-31 11:46 (UTC+8)에 업데이트된 실시간 가격 API에서 가져옵니다. 사양은 2026-08-17에 마지막으로 확인되었습니다.</Note>
