> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# MiniMax-M3

> APIYI의 MiniMax-M3: 1M tokens당 입력 $0.3 / 출력 $1.2, 컨텍스트 1,000,000개, 3개 과금 그룹에서 사용 가능합니다.

첫 번째 오픈웨이트 모델로, 최첨단 에이전트 코딩, 백만 token 컨텍스트, 네이티브 멀티모달리티를 결합합니다. MSA 희소 attention은 긴 컨텍스트 추론 비용을 이전 세대의 약 1/20로 줄입니다.

## 사양

| 항목                | 값                |
| ----------------- | ---------------- |
| **Model ID**      | `MiniMax-M3`     |
| **벤더**            | MiniMax          |
| **벤더 출시일**        | 2026-06-01       |
| **APIYI에서 제공 시작** | 2026-06-05       |
| **지식 기준 시점**      | 공개되지 않음          |
| **입력 모달리티**       | 텍스트, 이미지, 비디오    |
| **출력 모달리티**       | 텍스트              |
| **컨텍스트 윈도우**      | 1,000,000 tokens |
| **과금**            | 사용량 기반           |

## 요금

1M tokens당 USD 가격(\$/1M).

| 입력    | 캐시된 입력 | 출력    |
| ----- | ------ | ----- |
| \$0.3 | \$0.06 | \$1.2 |

<Info>표에는 **정가**가 표시됩니다. 충전 프로모션과 그룹 할인은 **중복 적용**됩니다; 콘솔은 실제 과금을 실시간으로 반영합니다. [요금](/ko/pricing)과 [충전 프로모션](/ko/faq/recharge-promotions)을 확인하십시오.</Info>

## 단계별 가격

이 모델은 각 요청의 token 크기에 따라 단계별 가격이 적용됩니다(출력 가격 = 단계 입력 가격 × 출력 배수):

* 0 – 524,288 tokens: \$0.3/1M input
* 524,288 tokens 초과: \$0.6/1M input

(이미 공급업체 정가의 50%로 할인됨)

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

| 그룹           | 요율 배수 | 비고         |
| ------------ | ----- | ---------- |
| `ClaudeCode` | 0.95× | 목록 가격의 95% |
| `Default`    | 1×    | 목록 가격      |
| `SVIP`       | 1×    | 목록 가격      |

일부 그룹에는 추가 할인이 적용되며, 충전 보너스와 중복 적용할 수 있습니다. 자세한 내용은 [token과 그룹](/ko/faq/token-and-groups)을 참조하세요.

## 지원 기능

| 기능        | 지원 여부 |
| --------- | ----- |
| 스트리밍      | ✅     |
| 도구 호출     | ✅     |
| 구조화된 출력   | ✅     |
| 비전        | ✅     |
| prompt 캐싱 | ✅     |
| 확장된 추론    | 선택 사항 |

## 예시 요청

아래 예시는 `MiniMax-M3`를 OpenAI 채팅 완성(`/v1/chat/completions`)을 통해 호출합니다. base\_url을 `https://api.apiyi.com/v1`로 설정하십시오 — 나머지는 모두 공식 API와 일치합니다.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "MiniMax-M3",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>키는 환경 변수에서 읽어 사용하고, 절대 하드코딩하지 마십시오. 운영 환경에서는 사용 사례별로 별도의 token을 발급하여 사용을 개별적으로 취소하고 귀속시킬 수 있게 하십시오.</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="출시 공지" icon="megaphone" href="/en/news/minimax-m3-launch">
    MiniMax-M3의 배경, 벤치마크 및 마이그레이션 참고 사항
  </Card>

  <Card title="모델 가격 디렉터리" icon="table" href="/en/models">
    모든 모델의 최신 가격, 엔드포인트 및 그룹
  </Card>
</CardGroup>

<Note>이 페이지의 사양은 `models/data/model-details.json`에서 수동으로 관리되며, 가격 및 엔드포인트는 실시간 가격 API에서 가져와 빌드할 때마다 갱신됩니다.</Note>
