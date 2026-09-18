> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-5.6 Sol

> APIYI의 GPT-5.6 Sol: 토큰 1M개당 입력 $4 / 출력 $20, 컨텍스트 1,000,000, 4개 과금 그룹에서 이용 가능합니다.

GPT-5.6 패밀리의 플래그십 계층입니다: Terminal-Bench 2.1에서 88.8%, BrowseComp에서 90.4%입니다. `gpt-5.6` 별칭이 여기를 가리킵니다.

## 사양

| Item                   | Value            |
| ---------------------- | ---------------- |
| **Model ID**           | `gpt-5.6-sol`    |
| **Vendor**             | OpenAI           |
| **Available on APIYI** | 2026-07-10       |
| **Knowledge cutoff**   | 공개되지 않음          |
| **Input modalities**   | 텍스트, 이미지         |
| **Output modalities**  | 텍스트              |
| **Context window**     | 1,000,000 tokens |
| **Billing**            | 사용량 기반           |

## 가격

가격은 100만 token당 USD입니다(\$/1M).

| 입력  | 캐시된 입력 | 출력   |
| --- | ------ | ---- |
| \$4 | \$0.4  | \$20 |

<Info>표에는 **정가**가 표시됩니다. 충전 프로모션과 그룹 할인이 **중복 적용**되며, 콘솔에는 실제 과금액이 실시간으로 반영됩니다. [가격](/ko/pricing) 및 [충전 프로모션](/ko/faq/recharge-promotions)을 참조하십시오.</Info>

## 계층형 가격 책정

이 모델은 각 요청의 token 규모에 따라 계층별로 가격이 책정됩니다(출력 가격 = 계층 입력 가격 × 출력 요율 배수).

* 0 – 272,000 token: 입력 \$4/1M
* 272,000 token 초과: 입력 \$8/1M

## 엔드포인트

| 엔드포인트                     | 경로                                            | 지원 여부 |
| ------------------------- | --------------------------------------------- | ----- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅     |
| `OpenAI Responses`        | `POST /v1/responses`                          | ✅     |
| `Anthropic Messages`      | `POST /v1/messages`                           | —     |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | —     |
| `Image Generations`       | `POST /v1/images/generations`                 | —     |
| `Embeddings`              | `POST /v1/embeddings`                         | —     |

## 과금 그룹

| 그룹               | 요율 배수 | 비고      |
| ---------------- | ----- | ------- |
| `CodexResponses` | 1×    | 정가      |
| `Codex_Reverse`  | 0.5×  | 정가의 50% |
| `Default`        | 1×    | 정가      |
| `SVIP`           | 1×    | 정가      |

일부 그룹에는 충전 보너스와 중복 적용할 수 있는 추가 할인이 적용됩니다. [tokens 및 그룹](/ko/faq/token-and-groups)을 참조하십시오.

## 지원 기능

| 기능      | 지원 여부 |
| ------- | ----- |
| 스트리밍    | ✅     |
| 도구 호출   | ✅     |
| 구조화된 출력 | ✅     |
| 비전      | ✅     |
| 프롬프트 캐싱 | ✅     |
| 확장된 추론  | 선택 적용 |

## 예시 요청

아래 예시는 OpenAI Chat Completions(`/v1/chat/completions`)를 통해 `gpt-5.6-sol`를 호출합니다. base\_url을 `https://api.apiyi.com/v1`로 지정하면 됩니다. 나머지는 모두 공식 API와 같습니다.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gpt-5.6-sol",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>키는 환경 변수에서 읽어 오고, 절대 하드코딩하지 마십시오. 프로덕션에서는 사용 사례별로 별도의 token을 발급하여, 사용을 개별적으로 취소하고 추적할 수 있어야 합니다.</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="출시 공지" icon="megaphone" href="/en/news/gpt-5-6-launch">
    GPT-5.6 Sol의 배경, 벤치마크 및 마이그레이션 참고 사항
  </Card>

  <Card title="호환 모드" icon="book-open" href="/ko/api-capabilities/openai/compatible">
    매개변수, 사용법 및 모범 사례
  </Card>

  <Card title="GPT-5.6 Terra" icon="git-compare" href="/ko/models/gpt-5-6-terra">
    동일한 제품군에 속한 모델의 세부 정보
  </Card>

  <Card title="GPT-5.6 Luna" icon="git-compare" href="/ko/models/gpt-5-6-luna">
    동일한 제품군에 속한 모델의 세부 정보
  </Card>

  <Card title="모델 가격 디렉터리" icon="table" href="/en/models">
    모든 모델의 실시간 가격, 엔드포인트 및 그룹
  </Card>
</CardGroup>

<Note>이 페이지의 사양은 `models/data/model-details.json`에서 수동으로 관리되며, 가격과 엔드포인트는 실시간 가격 API에서 가져와 빌드할 때마다 새로 고쳐집니다.</Note>
