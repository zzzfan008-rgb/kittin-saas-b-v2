> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 3.8 Flash

> APIYI의 Gemini 3.8 Flash: 1M tokens당 입력 $0.75 / 출력 $3.75, 2개의 과금 그룹에서 이용할 수 있습니다.

3.7과 동일한 가격의 차세대 Flash로, 150개의 측정 사례에서 항목별로 일치합니다. 공식 사양은 아직 공개되지 않았습니다. 추론 단계는 낮음/중간/높음으로 축소되었으며, 최소 단계는 사라졌습니다.

## 사양

| 항목                | 값                  |
| ----------------- | ------------------ |
| **모델 ID**         | `gemini-3.8-flash` |
| **제공업체**          | Google             |
| **제공업체 출시일**      | 2026-09-02         |
| **APIYI에서 사용 가능** | 2026-09-02         |
| **지식 기준일**        | 공개되지 않음            |
| **입력 방식**         | 텍스트, 이미지, 동영상, 오디오 |
| **출력 방식**         | 텍스트                |
| **과금**            | 사용량 기반             |

## 가격

1M token당 미화 가격(\$/1M)입니다.

| 입력     | 캐시된 입력  | 출력     |
| ------ | ------- | ------ |
| \$0.75 | \$0.075 | \$3.75 |

<Info>표의 가격은 **정가**입니다. 충전 프로모션과 그룹 할인이 **중첩 적용**되며, 콘솔에는 실제 과금액이 실시간으로 반영됩니다. [가격](/ko/pricing) 및 [충전 프로모션](/ko/faq/recharge-promotions)을 참조하십시오.</Info>

## 엔드포인트

| 엔드포인트                     | 경로                                            | 지원 여부 |
| ------------------------- | --------------------------------------------- | ----- |
| `OpenAI Chat Completions` | `POST /v1/chat/completions`                   | ✅     |
| `OpenAI Responses`        | `POST /v1/responses`                          | —     |
| `Anthropic Messages`      | `POST /v1/messages`                           | —     |
| `Gemini Generate Content` | `POST /v1beta/models/{model}:generateContent` | ✅     |
| `Image Generations`       | `POST /v1/images/generations`                 | —     |
| `Embeddings`              | `POST /v1/embeddings`                         | —     |

## 과금 그룹

| 그룹        | 요율 배수 | 비고 |
| --------- | ----- | -- |
| `Default` | 1×    | 정가 |
| `SVIP`    | 1×    | 정가 |

일부 그룹에는 충전 보너스와 중복 적용 가능한 추가 할인이 제공됩니다. [Tokens 및 그룹](/ko/faq/token-and-groups)을 참조하십시오.

## 지원 기능

| 기능      | 지원 여부      |
| ------- | ---------- |
| 스트리밍    | ✅          |
| 도구 호출   | ✅          |
| 구조화된 출력 | ✅          |
| 비전      | ✅          |
| 프롬프트 캐싱 | ✅          |
| 확장 사고   | 기본적으로 활성화됨 |
| 코드 실행   | ✅          |

## 예시 요청

아래 예시는 OpenAI 채팅 완성(`/v1/chat/completions`)을 통해 `gemini-3.8-flash`을 호출합니다. base\_url을 `https://api.apiyi.com/v1`로 지정하면 나머지는 공식 API와 동일합니다.

```bash theme={null}
curl https://api.apiyi.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $APIYI_API_KEY" \
  -d '{
    "model": "gemini-3.8-flash",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

<Tip>키는 환경 변수에서 읽고 하드코딩하지 않습니다. 운영 환경에서는 사용 사례별로 별도의 tokens를 발급하여 개별적으로 폐기하고 사용량을 귀속할 수 있도록 합니다.</Tip>

## 관련 문서

<CardGroup cols={2}>
  <Card title="출시 공지" icon="megaphone" href="/en/news/gemini-3-8-flash-launch">
    Gemini 3.8 Flash의 배경, 벤치마크 및 마이그레이션 참고 사항
  </Card>

  <Card title="Gemini 3.8 Flash 개요" icon="book-open" href="/ko/api-capabilities/gemini-3-8-flash/overview">
    매개변수, 사용법 및 모범 사례
  </Card>

  <Card title="네이티브 호출" icon="book-open" href="/ko/api-capabilities/gemini/native">
    매개변수, 사용법 및 모범 사례
  </Card>

  <Card title="Gemini 3.7 Flash" icon="git-compare" href="/ko/models/gemini-3-7-flash">
    동일한 제품군에 속한 모델의 세부 정보
  </Card>

  <Card title="Gemini 3.6 Flash" icon="git-compare" href="/ko/models/gemini-3-6-flash">
    동일한 제품군에 속한 모델의 세부 정보
  </Card>

  <Card title="모델 과금 디렉터리" icon="table" href="/en/models">
    모든 모델의 실시간 과금, 엔드포인트 및 그룹
  </Card>
</CardGroup>

<Note>이 페이지의 사양은 `models/data/model-details.json`에서 수동으로 관리되며, 과금 및 엔드포인트는 실시간 과금 API에서 가져와 다시 빌드할 때마다 새로 고쳐집니다.</Note>
