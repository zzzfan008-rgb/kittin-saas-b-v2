> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Kimi K3

> APIYI의 Kimi K3: 1M tokens당 입력 $3 / 출력 $15, 컨텍스트 윈도우 1,048,576, 최대 출력 131,072이며, 2개 과금 그룹에서 이용 가능합니다.

LMArena 프론트엔드 코드 보드에서 1위를 차지하는, 전체 컨텍스트 범위에 걸쳐 동일한 요금을 적용하는 2.8조 파라미터 오픈 웨이트 플래그십입니다.

## 사양

| 항목                | 값                |
| ----------------- | ---------------- |
| **모델 ID**         | `kimi-k3`        |
| **제공업체**          | Moonshot         |
| **APIYI에서 이용 가능** | 2026-07-18       |
| **지식 기준일**        | 공개되지 않음          |
| **입력 모달리티**       | 텍스트, 이미지, 비디오    |
| **출력 모달리티**       | 텍스트              |
| **컨텍스트 윈도우**      | 1,048,576 tokens |
| **최대 출력**         | 131,072 tokens   |
| **과금**            | 사용량 기반           |

## 가격

1M tokens당 USD 가격(\$/1M).

| 입력  | 캐시된 입력 | 출력   |
| --- | ------ | ---- |
| \$3 | \$0.3  | \$15 |

<Info>이 표는 **정가**를 보여줍니다. 충전 프로모션과 그룹 할인은 **중복 적용**됩니다. 콘솔에는 실제 청구 금액이 실시간으로 반영됩니다. [가격](/ko/pricing) 및 [충전 프로모션](/ko/faq/recharge-promotions)을 참조하십시오.</Info>

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

| 그룹        | 배수 | 비고 |
| --------- | -- | -- |
| `Default` | 1× | 정가 |
| `SVIP`    | 1× | 정가 |

일부 그룹에는 추가 할인이 적용되며, 충전 보너스와 중복 적용됩니다. [tokens와 그룹](/ko/faq/token-and-groups)을 참고하십시오.

## 지원 기능

| 기능      | 지원 여부 |
| ------- | ----- |
| 스트리밍    | ✅     |
| 도구 호출   | ✅     |
| 구조화된 출력 | ✅     |
| 비전      | ✅     |
| 프롬프트 캐싱 | ✅     |
| 확장 추론   | 선택 사항 |

## 예시 요청

아래 예시는 `kimi-k3`를 OpenAI Chat Completions(`/v1/chat/completions`)를 통해 호출합니다. base\_url을 `https://api.apiyi.com/v1`로 지정하면 됩니다 — 나머지는 공식 API와 동일합니다.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "kimi-k3",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>환경 변수에서 키를 읽고, 절대 하드코딩하지 마십시오. 운영 환경에서는 사용 사례별로 별도 token을 발급하여 개별적으로 폐기하고 사용량을 각각 귀속할 수 있도록 하십시오.</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="출시 공지" icon="megaphone" href="/en/news/kimi-k3-launch">
    Kimi K3의 배경, 벤치마크 및 마이그레이션 참고 사항
  </Card>

  <Card title="Kimi K2.5" icon="book-open" href="/ko/api-capabilities/kimi-k2-5">
    매개변수, 사용법 및 모범 사례
  </Card>

  <Card title="모델 가격 디렉터리" icon="table" href="/en/models">
    모든 모델의 실시간 가격, 엔드포인트 및 그룹
  </Card>
</CardGroup>

<Note>이 페이지의 사양은 `models/data/model-details.json`에서 수동으로 관리되며, 가격과 엔드포인트는 실시간 가격 API에서 가져와 모든 재빌드마다 새로 고쳐집니다.</Note>
