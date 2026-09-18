> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Qwen3.8-2.4T-A95B

> APIYI의 Qwen3.8-2.4T-A95B: 1M token당 입력 $1.72 / 출력 $5.16, 컨텍스트 262,144, 2개 과금 그룹에서 이용 가능합니다.

오픈 가중치로 출시된 최초의 Max급 Qwen입니다. 활성화되는 95B를 포함한 2.4T 매개변수의 희소 MoE이며, Qwen3.8-Max의 기반 모델입니다. 오픈 릴리스는 텍스트 전용이며 Max 버전의 비전 기능은 제외되었습니다.

## 사양

| 항목                | 값                   |
| ----------------- | ------------------- |
| **모델 ID**         | `qwen3.8-2.4t-a95b` |
| **공급업체**          | 알리바바                |
| **공급업체 출시일**      | 2026-08-12          |
| **APIYI에서 사용 가능** | 2026-09-03          |
| **지식 기준일**        | 공개되지 않음             |
| **입력 모달리티**       | 텍스트                 |
| **출력 모달리티**       | 텍스트                 |
| **컨텍스트 윈도우**      | 262,144 tokens      |
| **과금**            | 사용량 기반              |

## 가격

가격은 1M token당 USD 기준입니다(\$/1M).

| 입력     | 캐시된 입력  | 출력     |
| ------ | ------- | ------ |
| \$1.72 | \$0.215 | \$5.16 |

<Info>표의 가격은 **목록 가격**입니다. 충전 프로모션과 그룹 할인은 **누적 적용**되며, 콘솔에는 실제 과금액이 실시간으로 반영됩니다. [가격](/ko/pricing) 및 [충전 프로모션](/ko/faq/recharge-promotions)을 참조하십시오.</Info>

## 엔드포인트

| 엔드포인트                     | 경로                                            | 지원 여부 |
| ------------------------- | --------------------------------------------- | ----- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅     |
| `OpenAI Responses`        | `POST /v1/responses`                          | —     |
| `Anthropic Messages`      | `POST /v1/messages`                           | —     |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —     |
| `Image Generations`       | `POST /v1/images/generations`                 | —     |
| `Embeddings`              | `POST /v1/embeddings`                         | —     |

## 과금 그룹

| 그룹        | 배수 | 참고 |
| --------- | -- | -- |
| `Default` | 1× | 정가 |
| `SVIP`    | 1× | 정가 |

일부 그룹에는 추가 할인이 적용되며, 충전 보너스와 중복으로 적용할 수 있습니다. [토큰 및 그룹](/ko/faq/token-and-groups)을 참조하십시오.

## 지원 기능

| 기능      | 지원 여부 |
| ------- | ----- |
| 스트리밍    | ✅     |
| 도구 호출   | ✅     |
| 구조화된 출력 | ✅     |
| 프롬프트 캐싱 | ✅     |

## 예시 요청

아래 예시는 OpenAI Chat Completions(`/v1/chat/completions`)를 통해 `qwen3.8-2.4t-a95b`을 호출합니다. base\_url을 `https://api.apiyi.com/v1`로 지정하면 나머지는 모두 공식 API와 동일합니다.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "qwen3.8-2.4t-a95b",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>환경 변수에서 키를 읽고, 하드코딩하지 마십시오. 프로덕션에서는 사용 사례별로 별도의 토큰을 발급하여 개별적으로 폐기하고 사용량을 추적할 수 있도록 하십시오.</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="Qwen3.7-Max" icon="git-compare" href="/ko/models/qwen3-7-max">
    동일한 제품군의 모델 세부 정보
  </Card>

  <Card title="모델 가격 디렉터리" icon="table" href="/en/models">
    모든 모델의 실시간 가격, 엔드포인트 및 그룹
  </Card>
</CardGroup>

<Note>이 페이지의 사양은 `models/data/model-details.json`에서 수동으로 관리되며, 가격 및 엔드포인트는 실시간 가격 API에서 가져와 다시 빌드할 때마다 새로 고쳐집니다.</Note>
