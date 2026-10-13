> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-2.5-All 이미지 생성/편집

> GPT 이미지 생성 역공학 모델 gpt-image-2-all(ChatGPT 웹 라인)입니다. 호출당 이미지 1장당 $0.025의 단일 과금이며 약 30~60초 만에 생성됩니다. 텍스트 투 이미지, 다중 이미지 합성 편집, 자연어 편집, 높은 텍스트 렌더링 충실도를 지원하며 중국어 prompt에 친화적입니다.

<Info>
  모든 이미지 API는 **동기식**입니다 — 폴링할 task ID가 없으며, 클라이언트가 연결을 끊으면 요청은 계속 과금되는 동안 결과는 사라집니다. 이 모델에는 넉넉한 timeout을 설정하십시오. [이미지 API 필수 사항 및 모범 사례](/ko/api-capabilities/image-api-best-practices)를 참고하십시오.
</Info>

## 개요

**gpt-image-2.5-all** 및 **gpt-image-2-all**은 APIYI의 **GPT 이미지 생성 역공학 모델**(ChatGPT 웹 라인)입니다. ChatGPT 웹 앱이 전면적으로 Images 2.5로 전환되었으므로 `gpt-image-2-all`은(는) 이미 2.5 이미지를 생성합니다. 새로운 `gpt-image-2.5-all` 명칭은 해당 업그레이드를 명확히 나타낸 것뿐이며, **두 명칭은 동일한 가격과 동작을 공유하므로 상호 교환이 가능합니다**. 신규 프로젝트에는 `gpt-image-2.5-all`을(를) 사용하는 것이 좋습니다. 호출당 **\$0.025/이미지**라는 매우 경쟁력 있는 가격(2026-10-10에 \$0.03에서 인하됨)으로 **약 30\~60초** 만에 이미지를 생성하며, **텍스트-투-이미지 / 단일 이미지 편집 / 다중 이미지 융합 / 자연어 편집**을 지원합니다. 또한 텍스트 렌더링 충실도가 높고 중국어 prompt를 기본적으로 지원합니다.

<Note>
  **🎨 주요 특징**: \$0.025/이미지의 단일 요율을 제공하는 안정적인 역공학 채널입니다. size/quality/n 매개변수를 신경 쓸 필요 없이 prompt에 크기와 스타일을 설명하기만 하면 됩니다. OpenAI Images API 표준 엔드포인트인 `/v1/images/generations`(텍스트-투-이미지) 및 `/v1/images/edits`(이미지 편집)을(를) 사용합니다.

  **출력 크기를 고정하거나 4K가 필요하신가요?** 자매 모델인 [`gpt-image-2-vip`](/ko/api-capabilities/gpt-image-2-vip/overview)(으)로 전환해 보십시오. 호출 형식은 동일하며 `size` 필드 하나만 추가하면 됩니다.
</Note>

<CardGroup cols={2}>
  <Card title="텍스트-투-이미지 API" icon="wand-sparkles" href="/ko/api-capabilities/gpt-image-2-all/text-to-image">
    `/v1/images/generations` — 텍스트 prompt로부터 이미지를 생성합니다.
  </Card>

  <Card title="이미지 편집 API" icon="image" href="/ko/api-capabilities/gpt-image-2-all/image-edit">
    `/v1/images/edits` — 편집/융합 지침이 포함된 multipart 업로드입니다.
  </Card>
</CardGroup>

## AI 에이전트에게 통합을 맡기기

<Note>
  Codex / Claude Code / Cursor로 빌드하는 경우, 아래 프롬프트를 복사해 에이전트에게 전달하십시오. 먼저 이 페이지의 일반 텍스트 버전을 가져오고(모든 docs URL 뒤에 `.md`을 추가하십시오), 그런 다음 이 모델이 거부하는 timeout, base64 렌더링, upload 압축, 그리고 매개변수는 이미 요구사항에 반영된 상태로 프로젝트의 자체 스택에 맞는 코드를 작성합니다.
</Note>

<Prompt description="코딩 에이전트가 gpt-image-2-all 텍스트-이미지 및 이미지 편집을 통합하거나 문제를 해결하도록 하십시오. Codex, Claude Code, Cursor 및 유사한 도구에 복사해 붙여넣으십시오." icon="bot" actions={["copy"]}>
  이 프로젝트에서 gpt-image-2-all 텍스트-이미지 및 이미지 편집을 통합하거나 문제를 해결하십시오.

  코드를 손대기 전에 문서를 읽으십시오: 이 페이지의 일반 텍스트 버전을 가져오려면 [https://docs.apiyi.com/en/api-capabilities/gpt-image-2-all/overview.md를](https://docs.apiyi.com/en/api-capabilities/gpt-image-2-all/overview.md를) 불러오십시오. 더 세밀한 매개변수 정보는 텍스트-이미지 및 이미지 편집 페이지에 같은 방식으로 `.md`를 추가하십시오.

  요구사항:

  1. Timeout: 클라이언트 timeout을 360초로 늘리십시오. 이미지 API는 동기식이므로 task ID가 없습니다. 따라서 클라이언트가 연결을 끊으면 요청은 아직 과금되는 상태인데 결과를 잃게 됩니다. 너무 일찍 timeout되기보다 기다리십시오. reverse proxy, 게이트웨이, serverless 실행 제한도 모두 넉넉하게 늘려야 합니다. 생성 시간보다 짧은 계층이 하나라도 있으면 요청이 중간에 끊깁니다.

  2. 응답 렌더링: 기본값은 base64(`b64_json`, `data:` 접두사 없음)입니다. 대신 `response_format`를 url로 설정해 CDN 링크를 받을 수도 있습니다. **기본값에 의존하지 말고 항상 `response_format`를 명시적으로 보내십시오** — 예전에는 그룹과 부하에 따라 기본 동작이 바뀐 적이 있습니다. base64를 받으면 이를 렌더링하고 디스크에 저장하는 작업을 제공하십시오. URL을 받으면 약 24시간 후 만료되므로 즉시 서버 측에서 다운로드해 다시 호스팅하십시오. `data[]`의 각 항목에는 두 필드 중 하나만 들어 있으므로 두 경우를 모두 처리하도록 방어적으로 파싱하십시오.

  3. 업로드 전에 압축: `/v1/images/edits`(multipart)을 호출하기 전에 각 참조 이미지를 압축하십시오. 1.5MB를 넘는 파일만 처리하고, 긴 변을 종횡비를 유지한 채 2048px로 줄이되(작은 이미지는 절대 확대하지 마십시오), quality 0.9로 다시 인코딩하고 원본 형식을 유지하십시오. 다중 이미지 요청의 총 크기는 6MB 미만으로 유지하고, 단일 이미지는 10MB를 넘지 않게 하십시오. 한 이미지의 압축에 실패하면 원본으로 되돌려 계속 진행하십시오. 압축 실패 때문에 전체 요청을 중단해서는 안 됩니다.

  4. 매개변수 경고선: 이 모델은 **`size`, `quality`, `n` 또는 `aspect_ratio`를 지원하지 않습니다**. 이들 중 어떤 것도 보내지 마십시오. 특히 두 가지 함정이 있습니다. `n`를 3으로 설정해 보내면 3장의 이미지에 대해 과금되지만 실제로는 1장만 반환됩니다. 그리고 OpenAI SDK 메서드 `client.images.generate()`는 기본적으로 `size`와 `n`를 보내므로, **여기서는 원시 HTTP 요청을 보내는 편이 더 안전합니다**. 출력 크기는 대신 프롬프트 접두사로 조정합니다(예: 프롬프트를 가로형 16:9 지시로 시작하는 방식). 이 페이지에는 검증된 prompt-to-resolution 표가 있습니다. 이를 따르십시오.

  5. `APIYI_API_KEY` 환경 변수에서 키를 읽고 [https://api.apiyi.com/v1를](https://api.apiyi.com/v1를) base URL로 사용하십시오. 절대 하드코딩하지 말고, git에도 커밋하지 마십시오.

  6. 작업이 끝나면 실제로 text-to-image 호출 1번과 image-edit 호출 1번을 실행한 다음, 결과와 두 호출의 비용을 보여주십시오.
</Prompt>

<Accordion title="이 프롬프트가 막아주는 것">
  | 요구사항 | 방지하는 함정 |
  | - | - |
  | timeout을 360초로 늘림 | 주류 HTTP 클라이언트는 기본적으로 30\~60초 timeout을 사용하며, 서버가 정상적으로 생성 중일 때 요청을 끊습니다 — 그리고 **연결이 끊긴 요청도 여전히 과금됩니다**. [Image API 필수 사항 및 모범 사례](/ko/api-capabilities/image-api-best-practices) 참조 |
  | `response_format`를 명시적으로 보내기 | 기본값은 과거에 바뀐 적이 있습니다. 이를 보내지 않으면 `url`와 `b64_json` 형태를 모두 처리해야 합니다 |
  | `n`를 절대 보내지 않기 | 3으로 보내면 3장의 이미지에 대해 과금되지만 실제로는 1장만 반환됩니다 |
  | `size` / `quality`를 절대 보내지 않기 | 이 모델은 둘 다 거부합니다. 차원은 대신 프롬프트 접두사에서 가져옵니다 |
  | 업로드 전에 압축 | 스마트폰 사진은 대개 4-5MB이며, base64 인코딩은 그 위에 약 33%를 더 부풀립니다. [이미지 압축 및 출력 해상도](/ko/api-capabilities/image-compression-resolution) 참조 |
</Accordion>

## 핵심 기능

<CardGroup cols={2}>
  <Card title="높은 가격 경쟁력" icon="dollar-sign">
    해상도 구분 없이 이미지당 \$0.025의 단일 호출 요금으로 비용 예측이 가능합니다
  </Card>

  <Card title="고품질 텍스트 렌더링" icon="type">
    중국어/영어 텍스트, 표지판, 포스터 텍스트의 안정적인 렌더링 — 인포그래픽 및 마케팅 자산에 이상적입니다
  </Card>

  <Card title="중국어 prompt 친화적" icon="languages">
    번역 없이도 중국어 설명을 자연스럽게 이해합니다
  </Card>

  <Card title="다중 이미지 융합" icon="layers">
    여러 참조 이미지를 지원하며, prompt에서 이를 “image1/image2/image3”으로 참조할 수 있습니다
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="더 빠른 출력" icon="bolt">
    약 30\~60초 생성 — `gpt-image-2-vip` 및 공식 릴레이 `gpt-image-2`보다 더 빠릅니다
  </Card>

  <Card title="R2 CDN 가속" icon="cloud">
    낮은 지연 시간의 글로벌 전송을 제공하는 R2 CDN 링크를 사용하려면 `response_format: "url"`을(를) 명시적으로 전달합니다
  </Card>

  <Card title="자연어 편집" icon="message-circle">
    마스크 없이 대화형 설명으로 편집할 수 있으며, 다중 턴 반복을 지원합니다
  </Card>

  <Card title="표준 엔드포인트 지원" icon="plug">
    OpenAI Images API 표준 엔드포인트인 `/images/generations` 및 `/images/edits`와 호환됩니다
  </Card>
</CardGroup>

## 요금 안내

| 모델 | 과금 방식 | 가격 | 출력 |
| - | - | - | - |
| `gpt-image-2-all` | 호출당 | **\$0.025 / 이미지** | 호출당 이미지 1장 |
| `gpt-image-2.5-all` | 호출당 | **\$0.025 / 이미지** (-all과 동일) | 호출당 이미지 1장, GPT-Image 2.5 기반 |

<Info>
  **과금 안내**:

  * 단일 요금제 적용: 해상도, 화질, prompt 길이에 따른 차등 없음
  * 실패한 요청은 과금되지 않습니다 (인증 실패, 매개변수 유효성 검사 오류)
  * N장의 이미지가 필요한 경우, API를 N회 병렬로 호출하십시오
</Info>

<Note>모델 가격은 공식 가격에 맞춰 조정되며 제공업체가 변경할 경우 변동될 수 있습니다. 위 표는 참고용일 뿐이며, 상단 탐색 메뉴의 **모델 요금** 탭이 기준이 됩니다: [모델 요금](/en/models/index).</Note>

<Tip>
  **2026-10-10부터 가격 인하: 이미지당 \$0.03 → \$0.025**(`gpt-image-2-all` 및 `gpt-image-2.5-all` 모두 적용).

  * **인하 이유**: -all 시리즈는 자체적으로 높은 이미지 품질을 제공하며, 제공업체 측의 위험 제어에 더 많이 노출되는 -vip 시리즈보다 안정적입니다(지속적으로 유지 보수 및 용량 확장을 진행하고 있으므로 -vip 역시 계속 사용 가능합니다). 이번 가격 인하는 일상적인 이미지 생성 시 -all을 손쉬운 기본 선택지로 이용할 수 있도록 하기 위함입니다.
  * **유일한 제약 사항**: 출력 해상도가 1K\~1.5K이며, 2K / 4K는 지원되지 않습니다. 이는 일상적인 생성 작업을 충분히 충족하지만, 고정된 크기나 4K가 필요한 경우에는 -vip 또는 공식 릴레이를 선택하십시오.
  * **실제 체감 비용**: \$0.025는 할인 전 가격이며, 충전 보너스(10%\~20% 추가 크레딧)를 적용하면 실질 비용은 더욱 낮아집니다.
</Tip>

<Tip>
  **자매 모델**: [`gpt-image-2-vip`](/ko/api-capabilities/gpt-image-2-vip/overview) (Adobe 리버스 라인 (Firefly)) — 이미지당 \$0.03, 30가지 명시적 크기 지원(4K 포함), 동일한 호출 형식. 고정된 출력 규격이나 4K가 필요한 경우 전환하여 사용하십시오.
</Tip>

## 그룹 설정

`gpt-image-2-all`은(는) `Default` 그룹에 위치하며 — **추가 그룹이 필요하지 않습니다**. 역방향 채널은 현재 공급이 안정적이므로, 공식 릴레이 `gpt-image-2`과 같은 엔터프라이즈 그룹 폴백 시나리오가 없습니다.

| 모델 | 그룹 | 참고 사항 |
| - | - | - |
| `gpt-image-2-all` | `Default` | ChatGPT 웹 역방향, 이미지당 고정 \$0.025, 약 30–60초 |
| `gpt-image-2.5-all` | `Default` | 동일 라인의 GPT-Image 2.5 버전, 이미지당 고정 \$0.025, -all과 동일한 그룹 |
| `gpt-image-2-all` | `image2_OSS` | **1배 요율 배수(추가 요금 없음)**, 결정론적 URL 출력 — 기본 그룹에 부하가 걸려도 base64로 폴백되지 않음 |

### 결정론적 URL 출력이 필요한 경우 → `image2_OSS` 그룹으로 전환

기본 그룹에서 2026년 7월에 측정한 결과에 따르면, `gpt-image-2-all`(및 `gpt-image-2-vip`)은 `response_format`을(를) 생략했을 때 `b64_json`을(를) 반환합니다. 이미지 URL을 받으려면 `response_format: "url"`을(를) 명시적으로 전달하십시오. 기본 그룹의 출력 형식은 **보장되지 않습니다** — 과거에는 기본값이 `url`이었으며 부하 발생 시 `b64_json`(으)로 폴백되었고, 채널 버전에 따라 변경되어 왔습니다.

비즈니스가 **URL 출력에 의존**하는 경우(데이터베이스에 URL 직접 저장, URL을 통한 프론트엔드 렌더링, base64 사용 불가 등), token의 그룹을 **`image2_OSS`**(으)로 전환하십시오. 이는 **결정론적 URL 출력**을 위해 특수 제작된 그룹으로, \*\*1배 요율 배수(추가 요금 없음)\*\*가 적용되며 두 역방향 모델 `gpt-image-2-all` 및 `gpt-image-2-vip` 모두에 유효합니다. 응답에 항상 이미지 URL이 포함되도록 보장하며 base64로 절대 폴백되지 않습니다.

<Frame caption="Token creation: set billing mode to &#x22;pay-as-you-go first&#x22; and pick the image2_OSS group (1x) — use it when you need deterministic URL output">
  <img src="https://mintcdn.com/apiyillc/eNGQJU-a_dFb12gU/images/image2-oss-token-setup-20260525.png?fit=max&auto=format&n=eNGQJU-a_dFb12gU&q=85&s=727f61464cc759006a59e8de6ceccd32" alt="token 생성 화면: 과금 모드 종량제 우선, 그룹 image2_OSS(1배 요율 배수), 이미지 URL을 출력하는 그룹으로 gpt-image-2-all 및 gpt-image-2-vip에 적합" width="1278" height="846" data-path="images/image2-oss-token-setup-20260525.png" />
</Frame>

<Tip>
  **고급 (`gpt-image-2-vip` 및 공식 릴레이 `gpt-image-2`을(를) 함께 사용하는 경우)**: token이 세 가지 모델을 모두 지원하도록 설정하려면 token의 그룹 우선순위를 다음과 같이 구성하십시오.

  * **1순위**: `image2Enterprise` (1.2배 엔터프라이즈 그룹, 공식 릴레이 전용 안정 라인)
  * **기본 폴백**: `Default` (두 역방향 모델이 여기에 위치하며 모델별로 라우팅됨)

  결과: 공식 릴레이 `gpt-image-2`은 안정성을 위해 엔터프라이즈 라인을 이용하고, 두 역방향 모델은 기본 그룹에 유지됩니다 — 하나의 token으로 간섭 없이 세 모델을 모두 처리할 수 있습니다.
</Tip>

📖 `image2Enterprise` 그룹 관련 안내: [/en/live/2026-04/image2-enterprise-stable](/en/live/2026-04/image2-enterprise-stable)

## 기술 사양

| 속성 | 값 |
| - | - |
| **모델명** | `gpt-image-2-all` |
| **채널 유형** | 공식 리버스 엔지니어링(ChatGPT 웹) |
| **가격** | 이미지당 \$0.025, 호출 건당 과금 |
| **생성 시간** | 약 30\~60초 |
| **출력 해상도** | 명시적 크기 파라미터 없음, 가변적(prompt에 설명) |
| **기본 응답 형식** | `b64_json` (순수 base64, **`data:` 접두사 없음**, 2026-07 검증됨, 항상 `response_format`을(를) 명시적으로 전달하십시오) |
| **선택적 형식** | `url` (R2 CDN 가속 링크, **유효 기간 약 1일**, 명시적인 `response_format: "url"` 지정 필요) |
| **중국어 prompt** | ✅ 기본 지원 |
| **기능** | 텍스트-이미지 변환, 단일 이미지 편집, 다중 이미지 합성, 자연어 편집 |

<Warning>
  이 모델은 **가변적 출력 크기**를 지원하며 공식 `gpt-image-2` API와 완전히 동일하지는 않습니다. 엄격하게 고정된 출력 크기나 4K 해상도가 필요한 경우 [`gpt-image-2-vip`](/ko/api-capabilities/gpt-image-2-vip/overview)(Adobe 리버스 라인(Firefly), 4K를 포함한 30가지 명시적 크기 지원)을 사용하십시오. 공식 API와 완벽하게 일치하는 호환성이 필요한 경우 [`gpt-image-2`](/ko/api-capabilities/gpt-image-2/overview)을(를) 사용하십시오.
</Warning>

<Warning>
  **⏰ 이미지 URL 유효 기간: 약 1일(기본값)**

  `url` 모드 응답의 `url` 필드는 **약 24시간 후 만료되는** R2 CDN 링크입니다. 만료 후 요청 시 404 오류가 발생합니다. 장기 보관이 필요한 이미지(제품 사진, 사용자 작품, 히스토리 기록 등)의 경우, 생성 후 가능한 한 빨리 **자체 스토리지로 다운로드하여 영구 저장하십시오**.

  일반적인 두 가지 방법:

  * **서버 측 다운로드**: 응답을 받는 즉시 `requests` / `fetch`을(를) 사용하여 이미지를 가져온 후 S3 / OSS / R2 / 로컬 디스크에 저장합니다.
  * **`b64_json` 응답 형식 사용**: 이미지를 base64 데이터로 직접 수신하여 추가적인 크로스 오리진 다운로드를 건너뛸 수 있으며, 프론트엔드 렌더링이나 파일 직접 저장에 매우 적합합니다.
</Warning>

## 엔드포인트

| 엔드포인트 | 용도 | Content-Type | 추천 용도 |
| - | - | - | - |
| `POST /v1/images/generations` | 텍스트 투 이미지 | `application/json` | OpenAI Images API 표준 형식 — 동일한 코드로 공식 및 리버스 채널을 모두 호출할 수 있습니다 |
| `POST /v1/images/edits` | 이미지 편집 (단일/다중) | `multipart/form-data` | OpenAI Images API 표준 형식 — 동일한 코드로 공식 및 리버스 채널을 모두 호출할 수 있습니다 |

<Tip>
  **OpenAI Images API 사용을 권장합니다**(`/v1/images/generations` + `/v1/images/edits`). 이유는 두 가지입니다:

  1. **더 높은 안정성**: Images API 채널의 업스트림 리소스 공급이 더욱 풍부하여 호출 성공률이 더 높습니다.
  2. **간편한 전환을 위한 공식 릴레이 호환성**: 호출 방식 및 `size`와 같은 파라미터가 공식 릴레이 [`gpt-image-2`](/ko/api-capabilities/gpt-image-2/overview)와 완전히 호환되므로, 리버스 채널에 리스크 컨트롤 변동이 발생하더라도 코드 변경 없이 **`model` 이름만 교체**하면 됩니다.

  채팅 기반 엔드포인트(`/v1/chat/completions`, 더 이상 권장되지 않음)도 존재하므로 자세한 내용은 아래 FAQ를 참조하십시오.
</Tip>

<Tip>
  **도메인 옵션**: `api.apiyi.com`이 기본 도메인입니다. `b.apiyi.com`과 같은 대체 게이트웨이 도메인을 사용할 수도 있습니다. 응답 동작은 동일합니다.
</Tip>

<Info>
  **`size` 파라미터로 출력 크기를 고정하고 싶으신가요?** 자매 모델인 [`gpt-image-2-vip`](/ko/api-capabilities/gpt-image-2-vip/overview)를 사용하십시오. 엔드포인트는 동일하며, `size` 필드 하나만 추가됩니다(4K를 포함한 30가지 명시적 크기 제공).
</Info>

## 크기 및 종횡비 제어(프롬프트에서 설명)

`gpt-image-2-all`에는 `size` 파라미터가 없습니다. 즉, 크기는 프롬프트에 설명합니다. 출력 크기를 엄격하게 고정해야 하는 경우(이커머스 히어로 이미지, 포스터 템플릿, 4K 배경화면 등)에는 대신 [`gpt-image-2-vip`](/ko/api-capabilities/gpt-image-2-vip/overview)을 사용하십시오.

### 검증된 "프롬프트 표현 → 실제 해상도" 표

아래 8개의 표현은 실험적으로 안정적으로 재현됨이 검증되었습니다. 첫 번째 열의 표현을 프롬프트의 **앞부분**에 넣으면 두 번째 열에 표시된 해상도를 얻을 수 있습니다(모든 출력은 약 1.5K 픽셀 티어에 속합니다).

| 프롬프트 표현(그대로 입력) | 검증된 해상도 | 대략적인 크기 | 실제 종횡비 |
| - | - | - | - |
| `横版 16:9` (가로형 16:9) | 1672 × 941 | \~1.9 MB | 16:9 |
| `竖屏 9:16` (세로형 9:16) | 941 × 1672 | \~2.1 MB | 9:16 |
| `4:3` | 1448 × 1086 | \~2.3 MB | 4:3 |
| `3:4` | 1086 × 1448 | \~2.5 MB | 3:4 |
| `3:2 尺寸` (3:2 크기) | 1536 × 1024 | \~2.9 MB | 3:2 |
| `2:3 尺寸` (2:3 크기) | 1024 × 1536 | \~3.0 MB | 2:3 |
| `2:5 竖屏` (2:5 세로형) | 793 × 1983 | \~1.9 MB | 2:5 |
| `5:2 横屏` (5:2 가로형) | 1983 × 793 | \~1.9 MB | 5:2 |

<Info>
  **참고**:

  * 모든 출력은 **약 1.5K 픽셀 티어**(긴 변이 1500\~2000px)입니다. 이는 모델의 실효 상한이며, 진정한 의미의 “임의 해상도”는 아닙니다.
  * 프롬프트에 표의 표현만 **단독으로** 포함될 때 재현성이 가장 높습니다. 다른 구성 관련 단어를 섞으면 결과가 흔들릴 수 있습니다.
  * 중국어 문자열은 실제로 전송하는 값이므로, 번역하지 말고 그대로 유지하는 것을 권장합니다.
</Info>

### 스타일 표현(고정 해상도 없음)

아래 표현에는 검증된 해상도가 없습니다. 위 표와 함께 스타일 수정어로만 사용하십시오.

| 필요 | 표현(스타일 안내용 בלבד — 해상도 보장 없음) |
| - | - |
| 정사각형 | `1024×1024 square` / `1:1 square composition` |
| 초광각 배너 | `Banner 21:9 ultra-widescreen` |
| 스타일 수정어 | `cinematic` / `phone poster` / `square composition` |

<Tip>
  **팁**: 더 잘 따르게 하려면 크기/구성 관련 단어를 프롬프트의 **앞부분**에 배치하십시오.
</Tip>

### 이 표를 최종 사용자에게 노출하기

`gpt-image-2-all`에는 `size` 파라미터가 없지만, 사용자에게 여전히 “크기 / 종횡비” 드롭다운을 제공할 수 있으며, 이는 **마치 공식 `size` 필드처럼** 느껴지게 만들 수 있습니다.

* 위 표의 프롬프트 표현을 옵션 `value`로 사용하십시오(예: `横版 16:9`)
* 옵션 레이블에 **예상 해상도**를 표시하여(예: `Landscape 16:9 (1672×941)`) 사용자가 어떤 결과를 얻게 될지 알 수 있게 하십시오
* 백엔드에서는 선택한 표현을 사용자의 원래 프롬프트 앞에 붙인 뒤 API로 전송하십시오

```js theme={null}
const SIZE_OPTIONS = [
  { label: "Landscape 16:9 (1672×941)", prefix: "横版 16:9" },
  { label: "Portrait 9:16 (941×1672)",  prefix: "竖屏 9:16" },
  { label: "4:3 (1448×1086)",           prefix: "4:3" },
  { label: "3:4 (1086×1448)",           prefix: "3:4" },
  { label: "3:2 (1536×1024)",           prefix: "3:2 尺寸" },
  { label: "2:3 (1024×1536)",           prefix: "2:3 尺寸" },
  { label: "2:5 portrait (793×1983)",   prefix: "2:5 竖屏" },
  { label: "5:2 landscape (1983×793)",  prefix: "5:2 横屏" },
];

const finalPrompt = `${selected.prefix}, ${userPrompt}`;
```

<Warning>
  기본 모델은 여전히 **적응형**이므로, 픽셀 단위의 작은 차이는 정상입니다. 최종 사용자에게 픽셀 완벽 출력을 약속하지 마십시오. **출력 크기를 엄격하게 고정해야 하는 경우**(이커머스 히어로 이미지, 포스터 템플릿, 4K 배경화면 등)에는 자매 모델 [`gpt-image-2-vip`](/ko/api-capabilities/gpt-image-2-vip/overview)을 사용하십시오. 가격은 같고 호출 코드도 같으며, `size` 필드가 하나 추가될 뿐입니다.
</Warning>

## 모범 사례

<Steps>
  <Step title="입력 이미지를 1.5MB 미만으로 압축합니다(이미지 편집 / 다중 이미지 융합)">
    업로드하는 각 이미지를 **1.5MB 미만**으로 압축합니다(JPEG 품질 80-90 / 축소된 해상도). 다중 이미지 융합에서도 이미지당 동일한 상한을 적용합니다. 간헐적인 서버 측 오류는 대부분 지나치게 큰 입력으로 인해 발생하므로, 압축하면 성공률과 지연 시간이 눈에 띄게 개선됩니다. **출력 해상도는 입력 크기가 아니라 프롬프트 표현에 의해 결정됩니다** — 입력을 줄이는 것은 처리 속도만 높일 뿐 품질에는 영향을 주지 않습니다. `4K` / `8K`을 프롬프트에 넣어도 고해상도 이미지는 만들어지지 않습니다. 더 큰 출력을 안정적으로 얻으려면 위의 “검증된 프롬프트 표현 → 실제 해상도” 표에 있는 검증된 표현을 사용합니다.
  </Step>

  <Step title="크기를 프롬프트 앞에 배치합니다">
    비율, 해상도, 구도 관련 단어를 앞에 두면 더 잘 따릅니다.
  </Step>

  <Step title="텍스트 요소를 자신 있게 사용합니다">
    텍스트 렌더링 충실도는 핵심 장점입니다 — 중국어/영어 텍스트가 있는 표지판, 포스터, 인포그래픽이 모두 잘 작동합니다.
  </Step>

  <Step title="다중 이미지 순서를 표기합니다">
    `image` 필드를 반복하는 순서는 의미가 있습니다. 프롬프트에서 이를 “image1/image2/image3”로 명시적으로 참조합니다.
  </Step>

  <Step title="필요에 따라 응답 형식을 선택합니다">
    직접 웹 렌더링에는 `b64_json`을 사용하고; 서버 측 저장/전달에는 `url`를 사용합니다.
  </Step>

  <Step title="300초 타임아웃을 사용합니다">
    일반적인 생성 시간은 30–60초이지만, 이미지 업로드 / 다운로드 시간과 역방향 채널의 피크 꼬리 지연 때문에 실제 종단 간 시간은 크게 달라질 수 있습니다. **300초를 보수적 기준선으로 설정합니다** — 잦은 오탐성 타임아웃을 방지합니다.
  </Step>

  <Step title="거부되는 매개변수를 제거합니다">
    `gpt-image-2-all`는 `size`, `n`, `quality`, `aspect_ratio`를 거부합니다 — 이를 보내면 검증 오류가 발생할 수 있습니다. `size`를 통과하려면 [`gpt-image-2-vip`](/ko/api-capabilities/gpt-image-2-vip/overview)로 전환합니다.
  </Step>
</Steps>

## 오류 코드 및 재시도

| 상태 | 의미 | 제안 |
| - | - | - |
| `401` | 유효하지 않은 token | Bearer Token을 확인합니다 |
| `429` | 요청 제한 / 쿼터 소진 | 지수 백오프 재시도 |
| `5xx` | 일시적인 게이트웨이/백엔드 오류 | 1–2회 재시도 |
| Timeout | 리버스 채널 피크 + 이미지 업로드/다운로드 롱테일 | 클라이언트 타임아웃을 **≥ 300s**로 설정합니다(보수적입니다) |

<Info>
  **클라이언트 권장 사항**:

  * 요청 타임아웃은 **300초부터** 시작합니다(보수적 설정입니다. 일반적으로는 30–60초이지만, 이미지 업로드/다운로드와 리버스 채널 피크 꼬리 구간 때문에 편차가 큽니다 — 120초는 잘못된 타임아웃이 자주 발생합니다)
  * 5xx와 타임아웃에는 **지수 백오프**를 사용합니다(2–3회 재시도 권장)
  * 디버깅을 위해 `request-id` 응답 헤더를 기록합니다
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="gpt-image-2-all과 gpt-image-2-vip가 모두 보이는데, 어떤 것을 선택해야 합니까?">
    둘 다 **호출 형식이 동일한** 역공학 채널입니다. -all은 호출당 \$0.025, -vip는 호출당 \$0.03입니다. 차이점은 `size` 지원 여부, 생성 시간 및 안정성입니다:

    * **엄격한 크기 제어가 필요 없고 더 빠르고 안정적인 출력을 원하는 경우** → `gpt-image-2-all` (\~30–60초, prompt에 크기 서술, 1K–1.5K 출력).
    * **출력 크기 고정 또는 4K가 필요한 경우** → [`gpt-image-2-vip`](/ko/api-capabilities/gpt-image-2-vip/overview) (\~90–150초, 4K를 포함한 30가지 명시적 크기 제공).
    * **`quality` 조절 기능이나 완벽한 OpenAI API 필드 호환성이 필요한 경우** → 공식 [`gpt-image-2`](/ko/api-capabilities/gpt-image-2/overview)을 사용하십시오.
  </Accordion>

  <Accordion title="한 번에 여러 장의 이미지를 생성할 수 있습니까?">
    아니요. 이 모델은 호출당 1장의 이미지를 반환합니다. N장의 이미지가 필요한 경우 API를 N회 병렬로 호출하십시오. 각 호출은 \$0.025로 독립적으로 과금됩니다.
  </Accordion>

  <Accordion title="n 매개변수를 지원합니까? n=3을 전달하면 어떻게 됩니까?">
    **지원하지 않습니다.** 이 모델은 호출당 1장의 이미지를 반환합니다. 여러 장의 이미지를 생성하려면 대신 **반복 호출 또는 동시 호출**을 사용하십시오.

    ⚠️ **중요**: 요청에 `n=3`을 전달하면 **과금은 0.025 × 3 = \$0.075가 되지만**, **실제로는 1장의 이미지만 반환됩니다**. 불필요한 과금을 방지하기 위해 요청에서 `n` 필드를 반드시 제거하십시오.
  </Accordion>

  <Accordion title="콘텐츠가 거부되거나 모델이 '그렇게 할 수 없습니다'라고 응답하면 과금됩니까?">
    본 채널은 **동기식 대화형 응답**을 사용하는 역공학 채널입니다. 결과는 **과금 규칙이 서로 다른** 두 가지 경우로 나뉩니다:

    **1) HTTP 5xx 반환 → 과금되지 않음**

    업스트림 콘텐츠 정책이 요청을 완전히 차단(하드 블록)하면 다음과 유사한 내용이 표시됩니다:

    ```json theme={null}
    {
      "error": {
        "message": "Image was not generated as expected. Please adjust the prompt and retry (traceid: 0672821c6951af183dbf847130caaf16)",
        "localized_message": "Unknown error",
        "type": "invalid_request_error",
        "param": "",
        "code": null
      }
    }
    ```

    이러한 하드 오류는 **과금되지 않습니다**. 사용자에게 prompt를 조정한 후 다시 시도하도록 안내하십시오.

    **2) 텍스트 "소프트 거절"과 함께 HTTP 200 반환 → 과금됨**

    대화 내에서 모델이 소프트 거절을 수행하는 경우(예: "그렇게 할 수 없습니다", "죄송하지만 이 요청은 … 관련 항목이 포함되어…"), 프로토콜 수준에서는 정상적인 chat completion으로 처리되므로 **과금됩니다**. 역공학 채널은 프로토콜 레이어에서 "거절 텍스트"와 "이미지 출력"을 안정적으로 구분할 수 없습니다.

    **소프트 거절에 대해 과금을 일괄 면제할 수 없는 이유**

    모든 소프트 거절을 자동으로 면제하면 플랫폼이 실패한 업스트림 호출 비용을 전부 떠안게 됩니다. 더 중요한 점은, **업스트림 콘텐츠 안전 정책을 빈번하게 유발할 경우 공급업체 계정이 정지될 위험도 커진다는 것입니다**. 이는 완전히 배제할 수 없는 공급 측의 실질적인 비용입니다.

    **연동 개발자를 위한 권장 사항**

    * ✅ **사전 필터링 및 사용자 경고**: 프론트엔드 또는 게이트웨이에서 키워드/시나리오 필터(실존 인물 이름, 저작권 캐릭터, 민감한 주제)를 추가하고, "유명인/IP 주제는 실패할 수 있으며 업스트림 정책에 따라 과금될 수 있습니다."와 같은 UI 안내 문구를 표시하십시오. 이를 통해 불필요한 과금을 크게 줄일 수 있습니다.
    * ✅ **B2C 제품을 위한 월간 환급**: 일반 사용자 대상 제품의 경우 사용자 입력을 완전히 차단하기 어렵다는 점을 잘 이해하고 있습니다. 월 사용 금액이 충분히 큰 경우(**월 \$1000 이상**), **로그를 월 단위로 취합**하여(지연 시간이 짧은 호출은 대개 소프트 거절에 해당함) 고객 지원팀에 일괄 수동 크레딧을 요청하실 수 있습니다. 호출 건마다 개별 이의를 제기할 필요가 없습니다.

    📖 관련 안내: [500 오류는 일반적으로 콘텐츠 정책 위반입니다 (과금되지 않음)](/en/live/2026-04/gpt-image-2-all-500-content-policy)
  </Accordion>

  <Accordion title="b64_json에 data:image/png;base64, 접두사를 추가해야 합니까?">
    **먼저 감지한 후 처리하십시오.** 2026년 7월 확인 기준, 반환되는 `b64_json`은 **`data:` 접두사가 없는 순수 base64**입니다. 파일로 저장하려면 디코딩하고, 렌더링하려면 직접 접두사를 앞에 붙이십시오. **초기 버전에는 접두사가 포함되어 있었습니다.** 코드에 `startsWith('data:')` 검사를 추가하십시오. 접두사가 존재하면 해당 값을 `img src`로 직접 사용하고, 없으면 디코딩하거나 접두사를 먼저 추가하십시오. 이렇게 하면 접두사가 중복되거나 접두사가 포함된 문자열을 디코딩하여 이미지가 손상되는 문제를 방지할 수 있습니다.
  </Accordion>

  <Accordion title="prompt에 1024x1024라고 명시했는데 왜 다른 크기로 생성됩니까?">
    적응형 모델은 크기 서술을 "강제 사양"이 아닌 "가이드라인"으로 취급합니다. 반영도를 높이려면 크기/구도 관련 단어를 prompt의 맨 앞에 배치하고 스타일 설명어(예: `cinematic`, `phone poster`, `square composition`)와 조합하십시오.

    특정 해상도로 **안정적으로** 매핑되는 표현은 이 페이지 상단의 "검증된 prompt 문구 → 실제 해상도" 표("크기 및 종횡비 제어" 항목)를 참조하십시오.
  </Accordion>

  <Accordion title="입력 이미지를 압축해야 합니까? prompt에 4K / 8K를 작성하면 도움이 됩니까?">
    **네, 강력히 권장합니다.** 각 입력 이미지를 **1.5MB 미만**(JPEG 품질 80\~90 / 해상도 축소)으로 압축하십시오. 간헐적으로 발생하는 서버 측 오류는 대부분 과도한 크기의 입력으로 인해 유발되며, 압축하면 성공률과 대기 시간이 눈에 띄게 개선됩니다. 참고: 1.5MB는 안정성과 속도를 위한 **권장 상한선**이며, 위의 FAQ에 언급된 10MB는 게이트웨이의 하드 리밋(물리적 제한)입니다.

    **압축으로 인한 품질 저하는 걱정하지 마십시오.** 이 모델의 출력 해상도는 입력 크기가 아니라 prompt의 구도 문구에 의해 결정됩니다. 입력을 줄이면 처리 속도만 빨라집니다.

    **prompt에 `4K` / `8K`을 채워 넣는다고 해서 실제로 고해상도 이미지가 생성되는 것은 아닙니다.** 이러한 단어는 수식어일 뿐이며, 모델이 이를 이유로 해상도를 높이지 않습니다. 신뢰할 수 있는 대형 출력을 얻으려면 위의 "검증된 prompt 문구 → 실제 해상도" 표에 있는 검증된 표현(예: `cinematic`, `phone poster`, `square composition`)을 사용하십시오. 엄격한 크기 고정 또는 4K가 필요한 경우 [`gpt-image-2-vip`](/ko/api-capabilities/gpt-image-2-vip/overview)(4K 포함 30가지 명시적 크기, 이미지당 일괄 \$0.03)로 전환하십시오.
  </Accordion>

  <Accordion title="참조 이미지의 최대 크기와 지원 형식은 무엇입니까?">
    이미지당 **10MB 이하**를 권장하며, 지원 형식은 `png` / `jpg` / `webp`입니다. 너무 큰 이미지는 게이트웨이 제한에 걸릴 수 있습니다. 다중 이미지 결합 시 각 이미지도 이 제한을 충족해야 합니다.
  </Accordion>

  <Accordion title="반환된 이미지 URL의 유효 기간은 얼마나 됩니까? 이미지를 직접 다운로드해야 합니까?">
    `url` 모드 응답의 `url` 필드는 **약 1일(24시간) 후 만료되는 R2 CDN 링크**입니다. 그 이후의 요청은 404 오류를 반환합니다.

    **강력히 권장합니다**: 생성 직후 생성된 이미지를 **자체 오브젝트 스토리지(S3 / OSS / R2), CDN 또는 데이터베이스**로 다운로드하여 영구 저장하십시오. 반환된 URL을 장기간 직접 링크하지 마십시오.

    **두 가지 권장 접근 방식**:

    * **서버 측 프록시**: 응답 후 즉시 `requests.get(url)`하여 자체 스토리지에 저장하고, 프론트엔드에 자체 URL을 반환합니다.
    * **`b64_json` 사용**: 요청에 `"response_format": "b64_json"`을 추가하여 base64 이미지 데이터를 직접 수신합니다. 교차 출처 다운로드가 한 번 줄어들어 프론트엔드 렌더링이나 파일로 직접 저장하는 데 이상적입니다.

    단기 미리보기(단일 세션 표시)의 경우 별도 저장 없이 R2 URL을 그대로 사용해도 무방합니다.
  </Accordion>

  <Accordion title="스트리밍을 지원합니까?">
    아니요. 이 모델은 이미지를 한 번에 반환하며, 스트리밍은 지원되지 않습니다. 지연 시간이 중요한 경우 클라이언트 측에 "생성 중..." 진행률 표시기를 띄우고 **300초 타임아웃**(보수적 기준)을 설정하십시오.
  </Accordion>

  <Accordion title="공식 OpenAI SDK를 사용할 수 있습니까?">
    네, 가능합니다. `base_url`을 `https://api.apiyi.com/v1`로 지정하고 `api_key`를 본인의 APIYI token으로 설정하십시오. 단, `client.images.generate()`는 기본적으로 `size`/`n`을 전송하며, 본 모델은 두 매개변수를 모두 거부하므로 `/v1/images/generations` 및 `/v1/images/edits`에 대해 `requests` / `fetch`을 사용하여 직접 HTTP 호출을 수행하는 것을 권장합니다.
  </Accordion>

  <Accordion title="중국어 prompt와 영어 prompt 간에 유의미한 차이가 있습니까?">
    이 모델은 중국어를 기본적으로 지원하며, 결과물은 유사합니다. 중국어 고유 시나리오(서예, 전통 명절 요소 등)의 경우 중국어 표현이 더 자연스럽습니다.
  </Accordion>

  <Accordion title="/v1/chat/completions를 통해 여전히 이미지를 생성할 수 있습니까?">
    네, 해당 엔드포인트는 여전히 작동하지만 **더 이상 권장되지 않습니다**. 대신 `/v1/images/generations` 및 `/v1/images/edits`를 사용하십시오(더 안정적이며 동일한 코드로 공식 릴레이 `gpt-image-2`에서도 작동합니다).

    대화형 방식은 다중 턴 반복 편집이나 온라인 이미지 URL을 직접 전달하는 두 가지 시나리오에서만 유용합니다. 이미지 생성 의도가 모호한 경우 모델이 이미지 대신 일반 텍스트를 반환할 수 있습니다(이를 보강하려면 prompt 앞에 "Generate an image:"와 같은 고정 접두사를 붙이십시오).

    전체 매개변수는 [대화형 API 레퍼런스](/en/api-capabilities/gpt-image-2-all/chat-completions)를 참조하십시오.
  </Accordion>
</AccordionGroup>

## 관련 문서

* [⚖️ 공식 vs 리버스 비교](/ko/api-capabilities/gpt-image-2/vs-gpt-image-2-all) - 공식 `gpt-image-2`와 나란히 비교하는 선택 가이드
* [텍스트-이미지 플레이그라운드](/ko/api-capabilities/gpt-image-2-all/text-to-image) - `/v1/images/generations` 호환 엔드포인트
* [이미지 편집 플레이그라운드](/ko/api-capabilities/gpt-image-2-all/image-edit) - `/v1/images/edits` 다중 이미지 융합 및 편집
* [GPT-Image-2-VIP (동일 가격, `size` 및 4K 지원)](/ko/api-capabilities/gpt-image-2-vip/overview) - 30개의 명시적 크기(4K 포함)를 지원하는 동일 가격의 자매 모델; 호출 형식은 동일합니다
* [GPT-Image-2 공식(token 과금)](/ko/api-capabilities/gpt-image-2/overview) - `quality` 파라미터 / 마스크 기반 재페인팅 / 엄격한 OpenAI-API 필드 일치를 위한 용도
* [GPT-Image 시리즈 개요](/en/api-capabilities/gpt-image-series) - 공식 GPT-Image 비교
* [커뮤니티: Luck GPT-Image 2 ComfyUI 노드](/ko/scenarios/ecosystem/luckgpt2-comfyui) - ComfyUI에서 `gpt-image-2-all`를 직접 호출합니다(이중 엔드포인트: chat\_completions / images\_api)
* [커뮤니티: APIYI GPT-Image 2 스킬](/ko/scenarios/ecosystem/apiyi-gpt-image-skills) - 한 문장으로 Codex CLI / Cursor / Gemini CLI 및 기타 AI 코딩 도구에서 호출합니다
* [API 매뉴얼](/ko/api-manual) - 일반 호출 규약

<Info>
  gpt-image-2-all은 리버스 엔지니어링 채널입니다. 동작은 일치하지만 과금/기능이 공식 버전과 완전히 같지 않을 수 있습니다. 공식 직접 버전은 [GPT-Image-1.5](/en/api-capabilities/gpt-image-1-5)를 참조하십시오.
</Info>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.