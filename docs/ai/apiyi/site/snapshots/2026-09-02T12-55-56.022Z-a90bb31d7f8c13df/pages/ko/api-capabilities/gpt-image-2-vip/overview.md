> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-2-VIP 이미지 생성/편집

> GPT image generation 역공학으로 구현한 모델 gpt-image-2-vip (Codex 라인)입니다. 이미지당 $0.03의 고정 요금입니다. 30개의 명시적 크기(10개 비율 × 3개 해상도 단계: 1K / 2K / 4K)를 지원합니다. gpt-image-2-all과 동일한 호출 형식을 사용합니다. 이미지당 약 90–150초가 걸리며, 고정된 출력 차원이 필요한 워크로드를 위한 용도입니다.

<Info>
  **`size` 매개변수를 다시 사용할 수 있습니다** (업데이트 2026-07-22): `size`를 명시적으로 전달하면 이제 예상대로 출력 크기가 잠기며, 이 페이지의 30개 크기 참조 표도 다시 적용됩니다. 참고: `size`는 `/v1/images/generations` 및 `/v1/images/edits` 엔드포인트에서만 동작합니다 — **`/v1/chat/completions` 채팅 엔드포인트는 `size` 매개변수를 지원하지 않으므로**, 채팅 기반 이미지 생성에서는 크기를 잠글 수 없습니다. 최신 상태는 [실시간 업데이트](/en/live) 섹션을 참조하십시오.
</Info>

<Info>
  모든 이미지 API는 **동기식**입니다 — 폴링할 작업 ID가 없으며, 클라이언트가 연결을 끊으면 요청은 계속 과금되지만 결과는 사라집니다. 이 모델에는 넉넉한 타임아웃을 설정하십시오. [Image API Essentials & Best Practices](/ko/api-capabilities/image-api-best-practices)를 참조하십시오.
</Info>

## 개요

**gpt-image-2-vip**은 Codex 라인의 **GPT 이미지 생성 역공학 모델**이며, APIYI 플랫폼에서 사용할 수 있습니다. [`gpt-image-2-all`](/ko/api-capabilities/gpt-image-2-all/overview)와 동일한 정액 **\$0.03/image**이며 **요청/응답 형식도 동일**합니다. 단 하나의 의미 있는 차이는 `vip`가 **`size` 필드**를 \*\*30개의 공통 크기(10개 가로세로 비율 × 3개 해상도 계층: 1K Fast / 2K Recommended / 4K Detail)\*\*와 함께 지원한다는 점이며, 여기에는 4K도 포함됩니다.

<Note>
  **🎨 포지셔닝**: 출력 크기를 **고정해야 할 때** `gpt-image-2-vip`를 사용합니다(이커머스 히어로 샷, 포스터 템플릿, 동영상 썸네일, 4K 월페이퍼 등). `model` 필드를 `gpt-image-2-vip`로 바꾸고 `size` 필드를 추가하기만 하면 되며, 나머지 코드 줄은 모두 `gpt-image-2-all`와 동일합니다.
</Note>

<CardGroup cols={2}>
  <Card title="Text-to-Image API" icon="wand-sparkles" href="/ko/api-capabilities/gpt-image-2-vip/text-to-image">
    `/v1/images/generations` — 명시적인 출력 차원을 위한 텍스트 prompt + `size`입니다.
  </Card>

  <Card title="Image Editing API" icon="image" href="/ko/api-capabilities/gpt-image-2-vip/image-edit">
    `/v1/images/edits` — 편집/융합 지침이 포함된 multipart 업로드입니다.
  </Card>
</CardGroup>

## AI 에이전트에게 통합을 맡기십시오

<Note>
  Codex / Claude Code / Cursor로 개발하신다면 아래 프롬프트를 복사해서 에이전트에게 전달하십시오. 에이전트는 먼저 이 페이지의 일반 텍스트 버전을 가져온 뒤(아무 docs URL 뒤에 `.md`를 덧붙이십시오), 이후 여러분 프로젝트의 자체 스택으로 코드를 작성합니다. timeout, base64 렌더링, 업로드 압축, 그리고 30개의 법적 `size` 값은 이미 요구사항에 반영되어 있습니다.
</Note>

<Prompt description="코딩 에이전트가 gpt-image-2-vip 텍스트-투-이미지 및 이미지 편집을 통합하거나 문제를 해결하도록 하십시오. Codex, Claude Code, Cursor 및 유사한 도구에 복사해 붙여넣으십시오." icon="bot" actions={["copy"]}>
  이 프로젝트에서 gpt-image-2-vip 텍스트-투-이미지 및 이미지 편집을 통합하거나 문제를 해결하십시오.

  코드를 건드리기 전에 문서를 읽으십시오: 이 페이지의 일반 텍스트 버전은 [https://docs.apiyi.com/en/api-capabilities/gpt-image-2-vip/overview.md](https://docs.apiyi.com/en/api-capabilities/gpt-image-2-vip/overview.md) 를 가져오십시오. 더 세부적인 파라미터 정보는 텍스트-투-이미지 및 이미지 편집 페이지에도 같은 방식으로 `.md`를 덧붙이십시오.

  요구사항:

  1. Timeout: 클라이언트 timeout을 360초로 늘리십시오. 이미지 API는 동기식입니다. 즉, task ID가 없으므로 클라이언트가 끊기면 요청은 아직 과금된 상태인데 결과를 잃게 됩니다. 너무 일찍 timeout되기보다 기다리십시오. 리버스 프록시, 게이트웨이, 서버리스 실행 한도도 모두 늘려야 합니다. 생성 시간보다 짧은 어떤 계층이든 요청을 중간에 끊습니다.

  2. 응답 렌더링: 기본값은 base64입니다(`b64_json`, `data:` 접두사 없음). 또는 `response_format`를 url로 설정하여 대신 CDN 링크를 받을 수도 있습니다. **기본값에 의존하지 말고 `response_format`를 항상 명시적으로 보내십시오** — 과거에 그룹과 로드에 따라 기본 동작이 바뀐 적이 있습니다. base64를 받으면 이를 렌더링하고 디스크 저장 작업을 제공하십시오. URL을 받으면 약 24시간 후 만료되므로 즉시 서버 측에서 다운로드해 재호스팅하십시오. `data[]`의 각 항목은 두 필드 중 하나만 담고 있으므로, 두 경우를 모두 처리하도록 방어적으로 파싱하십시오.

  3. 업로드 전에 압축: `/v1/images/edits`(multipart)를 호출하기 전에 참조 이미지를 각각 압축하십시오. 1.5MB를 초과하는 파일만 처리하고, 긴 변을 2048px로 줄이되 가로세로 비율은 유지하십시오(작은 이미지는 절대 업스케일하지 마십시오). quality 0.9로 재인코딩하고 원본 형식은 유지하십시오. 다중 이미지 요청에서는 전체 크기를 6MB 미만으로 유지하고, 단일 이미지는 10MB를 넘기지 마십시오. 한 이미지의 압축에 실패하면 원본으로 되돌려 계속 진행하십시오. 압축 실패 때문에 전체 요청을 중단해서는 안 됩니다.

  4. Size 파라미터: `size`는 이 페이지에 나열된 **30개 값(1K / 2K / 4K 각각 10개)** 중 하나이거나 `auto`여야 하며, 소문자 ASCII x로 작성해야 합니다. 예: `1536x1024`. 전각 곱셈 기호나 대문자 X는 사용하지 마십시오. 표 범위를 벗어난 size는 모두 400을 반환합니다. 사용자가 직접 입력하지 못하게 UI에서 이 30개 값을 해상도 드롭다운으로 노출하십시오. 이 모델은 또한 `quality`, `n` 또는 `aspect_ratio`를 **허용하지 않습니다** — 세 가지 모두 보내지 마십시오(`n`를 3으로 보내면 이미지 3장으로 과금되지만 1장만 반환됩니다). `size`이 필요하면 `/v1/images/generations` 또는 `/v1/images/edits`를 호출해야 합니다. `/v1/chat/completions` 엔드포인트는 이를 무시합니다.

  5. 키는 `APIYI_API_KEY` 환경 변수에서 읽고 [https://api.apiyi.com/v1](https://api.apiyi.com/v1) 을 base URL로 사용하십시오. 절대 하드코딩하지 말고, git에 커밋하지 마십시오.

  6. 완료되면 실제로 텍스트-투-이미지 호출 1회와 이미지 편집 호출 1회를 실행한 뒤, 그 결과와 두 호출에 든 비용을 보여주십시오.
</Prompt>

<Accordion title="이 프롬프트가 막아 주는 문제">
  | 요구사항                        | 방지하는 함정                                                                                                                                                                                                 |
  | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | Timeout을 360초로 늘림           | 주류 HTTP 클라이언트는 기본적으로 30\~60초 timeout을 사용하며, 서버가 정상적으로 생성 중일 때 요청을 끊어버립니다 — 그리고 **연결이 끊긴 요청도 여전히 과금됩니다**. [Image API Essentials & Best Practices](/ko/api-capabilities/image-api-best-practices)를 참조하십시오 |
  | `response_format`를 명시적으로 전송 | 기본값은 이전에 바뀐 적이 있습니다. 이를 지정하지 않으면 `url`과 `b64_json` 두 가지 형태를 모두 처리해야 합니다                                                                                                                                 |
  | `size`를 30개 값으로 고정          | 표 밖의 값은 무엇이든 400을 반환하며, 전각 곱셈 기호나 대문자 X도 마찬가지입니다                                                                                                                                                        |
  | `quality` / `n`를 절대 보내지 않음  | 이 모델은 `quality`를 거부합니다. `n`를 3으로 보내면 이미지 3장으로 과금되지만 1장만 반환됩니다                                                                                                                                           |
  | 업로드 전에 압축                   | 휴대폰 사진은 흔히 4\~5MB이며, base64 인코딩은 그 위에 약 33%를 추가로 부풀립니다. [Image Compression & Output Resolution](/ko/api-capabilities/image-compression-resolution)를 참조하십시오                                              |
</Accordion>

## `gpt-image-2-all`과의 주요 차이점

`gpt-image-2-vip`과 [`gpt-image-2-all`](/ko/api-capabilities/gpt-image-2-all/overview)는 둘 다 역공학된 채널이며, 가격도 같고 호출 코드도 같습니다. **서로를 그대로 반영합니다** — 같은 요청에서 `model` 필드만 바꾸면 동작은 대체로 동일합니다. 차이점은 다음과 같습니다:

| 항목                      | `gpt-image-2-all`                                                 | `gpt-image-2-vip`                |
| ----------------------- | ----------------------------------------------------------------- | -------------------------------- |
| **채널**                  | 역공학된 ChatGPT 웹                                                    | 역공학된 Codex 라인                    |
| **가격**                  | \$0.03 / image                                                    | \$0.03 / image (모든 크기에서 동일)      |
| **`size` 매개변수**         | ❌ 허용되지 않음(prompt에 설명)                                             | ✅ 4K를 포함한 30개 크기                 |
| **4K (예: `3840x2160`)** | ❌                                                                 | ✅ 4K Detail 등급                   |
| **생성 시간**               | 약 30\~60초                                                         | 약 90\~150초(공식 `gpt-image-2`와 동급) |
| **`quality` 매개변수**      | ❌ 허용되지 않음                                                         | ❌ 허용되지 않음(전달하지 마십시오)             |
| **엔드포인트**               | `/images/generations` + `/images/edits`                           | 왼쪽과 동일(완전 동일)                    |
| **응답 형식**               | `b64_json`(기본값, 원시 base64, 접두사 없음) / `url`(명시적 `response_format`) | 왼쪽과 동일                           |
| **적합한 용도**              | 프롬프트 중심, 크기에 구애받지 않음                                              | 고정된 출력 크기 필요(4K 포함)              |

<Tip>
  **한 줄 판단**: **엄격한 크기 고정은 필요 없고 가장 빠른 출력을 원하면** → `gpt-image-2-all`; **고정 크기나 4K가 필요하면** → `gpt-image-2-vip`; **`quality` 조절 옵션이나 OpenAI API 필드와의 엄격한 일치가 필요하면** → 공식 [`gpt-image-2`](/ko/api-capabilities/gpt-image-2/overview)을 사용하십시오.
</Tip>

## 핵심 기능

<CardGroup cols={2}>
  <Card title="출력 크기 고정" icon="expand">
    `size` 필드는 30가지 일반 크기를 지원합니다 — 전자상거래 히어로 이미지, 포스터 템플릿, 4K 배경화면을 모두 정확한 픽셀로 출력합니다.
  </Card>

  <Card title="4K 고해상도" icon="image">
    4K Detail 등급은 2880×2880 / 3840×2160 / 3840×1632 등을 지원하며, 대형 납품물에 적합합니다.
  </Card>

  <Card title="모든 크기에 동일한 요금" icon="dollar-sign">
    1K / 2K / 4K 모두 \$0.03/이미지입니다 — 4K에 추가 요금이 없습니다.
  </Card>

  <Card title="-all과 동일한 호출 형식" icon="copy">
    요청 구조, 필드, 응답 형식은 `gpt-image-2-all`과 동일합니다 — `model` 문자열만으로 모델을 전환할 수 있습니다.
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="고품질 텍스트 렌더링" icon="type">
    중국어/영문 텍스트, 간판, 포스터 문구를 안정적으로 렌더링합니다 — 인포그래픽과 마케팅 소재에 이상적입니다
  </Card>

  <Card title="중국어 Prompt 친화적" icon="languages">
    번역 없이 중국어 설명을 네이티브하게 이해합니다
  </Card>

  <Card title="자연어 편집" icon="message-circle">
    대화형 설명을 통해 편집하며, 마스크가 필요 없고, 다중 턴 반복을 지원합니다
  </Card>

  <Card title="표준 엔드포인트 지원" icon="plug">
    OpenAI Images API 표준 엔드포인트 `/images/generations` 및 `/images/edits`와 호환됩니다
  </Card>
</CardGroup>

## 가격

| 모델                | 과금  | 가격               | 출력                                  |
| ----------------- | --- | ---------------- | ----------------------------------- |
| `gpt-image-2-vip` | 호출당 | **\$0.03 / 이미지** | 호출당 이미지 1개, `size` 필드가 출력 크기를 고정합니다 |

<Info>
  **과금 참고 사항**:

  * **모든 30개 크기에 대해 이미지당 \$0.03 정액** — 4K Detail에 추가 요금이 없습니다
  * 실패한 요청은 과금되지 않습니다(인증 실패, 매개변수 검증 오류)
  * N개의 이미지를 처리하려면 API를 N번 병렬로 호출하십시오
</Info>

## 그룹 설정

`gpt-image-2-vip`는 `Default` 그룹에 있습니다 — **추가 그룹이 필요하지 않습니다**. 역방향 채널은 현재 안정적인 공급을 유지하고 있으므로, 공식 릴레이 `gpt-image-2`처럼 엔터프라이즈 그룹 폴백 이야기가 없습니다.

| 모델                | 그룹           | 비고                                                                     |
| ----------------- | ------------ | ---------------------------------------------------------------------- |
| `gpt-image-2-vip` | `Default`    | Codex 역방향 라인, 고정 \$0.03/img, 약 90–150초                                 |
| `gpt-image-2-vip` | `image2_OSS` | **1배 요율 배수(추가 요금 없음)**, 결정적인 URL 출력 — 기본 그룹이 과부하일 때도 base64로 폴백하지 않습니다 |

### 결정적인 URL 출력을 원하면 → `image2_OSS` 그룹으로 전환하십시오

2026년 7월 기본 그룹에서 측정한 결과, `gpt-image-2-vip`(및 `gpt-image-2-all`)은 `response_format`이 생략되면 `b64_json`를 반환합니다. 이미지 URL을 얻으려면 `response_format: "url"`를 명시적으로 전달하십시오. 기본 그룹의 출력 형식은 **보장되지 않습니다** — 역사적으로는 `url`를 기본값으로 사용하고 과부하 시 `b64_json`로 폴백했으며, 채널 버전마다 변경되어 왔습니다.

귀사의 비즈니스가 **URL 출력에 의존하는 경우**(URL을 데이터베이스에 그대로 저장하거나, 프런트엔드에서 URL로 렌더링해야 하며, base64는 허용되지 않는 경우), token의 그룹을 \*\*`image2_OSS`\*\*로 변경하십시오 — **결정적인 URL 출력**을 위해 특별히 설계된, \*\*1배 요율 배수(추가 요금 없음)\*\*의 그룹이며, 역방향 모델 `gpt-image-2-vip` 및 `gpt-image-2-all` 모두에 적용됩니다. 응답에 항상 이미지 URL이 포함되며 base64로 폴백하지 않습니다.

<Frame caption="Token creation: set billing mode to &#x22;pay-as-you-go first&#x22; and pick the image2_OSS group (1x) — use it when you need deterministic URL output">
  <img src="https://mintcdn.com/apiyillc/eNGQJU-a_dFb12gU/images/image2-oss-token-setup-20260525.png?fit=max&auto=format&n=eNGQJU-a_dFb12gU&q=85&s=727f61464cc759006a59e8de6ceccd32" alt="Token 생성 화면: 과금 모드는 먼저 사용량 기반 과금, group image2_OSS (1배 요율 배수), 이미지 URL을 출력하는 그룹, gpt-image-2-all 및 gpt-image-2-vip에 적합" width="1278" height="846" data-path="images/image2-oss-token-setup-20260525.png" />
</Frame>

<Tip>
  **고급(`gpt-image-2-all`와 공식 릴레이 `gpt-image-2`도 함께 사용하는 경우)**: token이 세 모델을 모두 커버한다면, token의 group 우선순위를 다음과 같이 설정하십시오:

  * **첫 번째 우선순위**: `image2Enterprise` (1.2배 엔터프라이즈 그룹, 공식 릴레이 전용 안정적 전용 경로)
  * **기본 폴백**: `Default` (두 역방향 모델이 모두 여기에 있으며 모델별로 라우팅됨)

  결과: 공식 릴레이 `gpt-image-2`는 안정성을 위해 엔터프라이즈 경로를 이용하고, 두 역방향 모델은 기본 그룹에 유지되므로 — 하나의 token으로 세 모델을 모두 커버하고, 간섭이 없습니다.
</Tip>

📖 `image2Enterprise` 그룹 소개: [/en/live/2026-04/image2-enterprise-stable](/en/live/2026-04/image2-enterprise-stable)

## 기술 사양

| Attribute          | Value                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------- |
| **모델 이름**          | `gpt-image-2-vip`                                                                           |
| **채널 유형**          | 공식 역공학 기반(Codex 라인)                                                                         |
| **가격**             | \$0.03 / image, 호출당(모든 크기에서 동일)                                                             |
| **생성 시간**          | **\~90–150 seconds** (공식 `gpt-image-2`와 비슷하며, `gpt-image-2-all`의 30–60s보다 느립니다)             |
| **`size` 매개변수**    | ✅ 30가지 크기: 10개 비율 × 3개 해상도 티어(1K 빠름 / 2K 권장 / 4K 상세)                                        |
| **4K 지원**          | ✅ 4K 상세 티어(예: `3840x2160` / `2880x2880`)                                                    |
| **`quality` 매개변수** | ❌ 지원되지 않으므로 전달하지 마십시오                                                                       |
| **`n` 매개변수**       | ❌ 지원되지 않으며, 호출당 단일 이미지입니다                                                                   |
| **기본 응답 형식**       | `b64_json`(raw base64, **`data:` 접두사 없음**, 2026-07 검증됨; 항상 `response_format`를 명시적으로 전달해야 함) |
| **선택적 형식**         | `url`(R2 CDN 가속 링크, **약 1일 유효**, 명시적인 `response_format: "url"` 필요)                          |
| **중국어 prompt**     | ✅ 네이티브로 지원됩니다                                                                               |
| **기능**             | Text-to-image, 단일 이미지 편집, 다중 이미지 융합, 자연어 편집                                                 |

<Warning>
  **⏰ 이미지 URL 유효 기간: 약 1일(기본값)**

  `url` 필드는 `url` 모드 응답의 R2 CDN 링크이며, **약 24시간 후 만료됩니다** — 그 이후의 요청은 404를 반환합니다. 장기 보관이 필요한 이미지는 생성 직후 **가능한 한 빨리 다운로드하여 자체 스토리지에 보관**하거나, `b64_json` 응답 형식을 사용하십시오.
</Warning>

## 엔드포인트

`gpt-image-2-vip`는 `gpt-image-2-all`와 **완전히 동일한** 두 엔드포인트와 호환됩니다. 필요하면 `model` 필드만 바꾸고 `size`를 추가하면 됩니다:

| 엔드포인트                         | 용도            | Content-Type          | 가장 적합한 경우                                                      |
| ----------------------------- | ------------- | --------------------- | -------------------------------------------------------------- |
| `POST /v1/images/generations` | 텍스트-이미지       | `application/json`    | OpenAI Images API 표준 형식 — 동일한 코드로 공식 채널과 리버스 채널 모두를 호출할 수 있습니다 |
| `POST /v1/images/edits`       | 이미지 편집(단일/다중) | `multipart/form-data` | OpenAI Images API 표준 형식 — 동일한 코드로 공식 채널과 리버스 채널 모두를 호출할 수 있습니다 |

<Tip>
  **OpenAI Images API를 사용하십시오** (`/v1/images/generations` + `/v1/images/edits`), 이유는 두 가지입니다:

  1. **더 안정적입니다**: Images API 채널의 상위 리소스 공급이 더 풍부하므로 호출 성공률이 더 높습니다
  2. **공식 릴레이와 호환되어 전환이 쉽습니다**: 호출 방식과 `size` 같은 파라미터가 공식 릴레이 [`gpt-image-2`](/ko/api-capabilities/gpt-image-2/overview)와 완전히 호환됩니다 — 리버스 채널이 리스크 제어에 걸려 불안정해지면 **`model` 이름만 바꾸면** 코드 변경 없이 그대로 사용할 수 있습니다

  채팅 기반 엔드포인트(`/v1/chat/completions`, 더 이상 권장되지 않음)도 있습니다 — 아래 FAQ를 참고하십시오.
</Tip>

<Tip>
  **도메인 옵션**: `api.apiyi.com`이 메인 도메인입니다. `b.apiyi.com` / `vip.apiyi.com` 같은 대체 게이트웨이 도메인도 사용할 수 있습니다. 응답 동작은 동일합니다.
</Tip>

## 지원되는 크기(전체 30개 크기 표)

`gpt-image-2-vip`는 **10개 종횡비 × 3개 해상도 티어 = 30개 크기**를 지원합니다. `size: "WIDTHxHEIGHT"`(소문자 ASCII `x`)를 요청 본문에 직접 전달합니다.

### 1K Fast — 초안 및 저비용 반복 작업

| 비율   | 이름   | 픽셀          |
| ---- | ---- | ----------- |
| 1:1  | 정사각형 | `1280x1280` |
| 2:3  | 세로   | `848x1280`  |
| 3:2  | 사진   | `1280x848`  |
| 3:4  | 세로   | `960x1280`  |
| 4:3  | 표준   | `1280x960`  |
| 4:5  | 소셜   | `1024x1280` |
| 5:4  | 대형   | `1280x1024` |
| 9:16 | 스토리  | `720x1280`  |
| 16:9 | 와이드  | `1280x720`  |
| 21:9 | 시네마  | `1280x544`  |

### 2K Recommended — 기본 티어(대부분의 프로덕션 출력)

| 비율   | 이름   | 픽셀          |
| ---- | ---- | ----------- |
| 1:1  | 정사각형 | `2048x2048` |
| 2:3  | 세로   | `1360x2048` |
| 3:2  | 사진   | `2048x1360` |
| 3:4  | 세로   | `1536x2048` |
| 4:3  | 표준   | `2048x1536` |
| 4:5  | 소셜   | `1632x2048` |
| 5:4  | 대형   | `2048x1632` |
| 9:16 | 스토리  | `1152x2048` |
| 16:9 | 와이드  | `2048x1152` |
| 21:9 | 시네마  | `2048x864`  |

### 4K Detail — 대형 산출물

| 비율   | 이름   | 픽셀          |
| ---- | ---- | ----------- |
| 1:1  | 정사각형 | `2880x2880` |
| 2:3  | 세로   | `2336x3520` |
| 3:2  | 사진   | `3520x2336` |
| 3:4  | 세로   | `2480x3312` |
| 4:3  | 표준   | `3312x2480` |
| 4:5  | 소셜   | `2560x3216` |
| 5:4  | 대형   | `3216x2560` |
| 9:16 | 스토리  | `2160x3840` |
| 16:9 | 와이드  | `3840x2160` |
| 21:9 | 시네마  | `3840x1632` |

<Info>
  **30개 모든 크기에 대한 정액 과금**: \$0.03/이미지. 4K Detail에는 추가 요금이 없습니다.
</Info>

<Tip>
  **티어 선택**:

  * **1K Fast** — 초안, 썸네일, A/B 테스트에 적합합니다. 출력이 가장 빠릅니다(과금은 정액이지만 반복 주기가 더 짧습니다).
  * **2K Recommended** — **기본 티어**입니다. 대부분의 프로덕션 출력(이커머스 히어로 샷, 포스터, 인포그래픽)을 커버합니다.
  * **4K Detail** — 인쇄, 대형 디스플레이, 동영상 썸네일, 데스크톱 / 옥외 대형 포맷에 적합합니다.
</Tip>

**최소 호출 예시** (`size`만 전달하고, **`quality`은 전달하지 마세요**):

```bash theme={null}
curl "https://api.apiyi.com/v1/images/generations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $YI_API_KEY" \
  -d '{
    "model": "gpt-image-2-vip",
    "prompt": "Product shot of a white ceramic mug on a gray desk, soft natural light, clean background",
    "size": "2048x1360"
  }'
```

## 권장 사항

<Steps>
  <Step title="입력 이미지를 1.5MB 미만으로 압축합니다(이미지 편집 / 다중 이미지 융합)">
    업로드하는 각 이미지를 **1.5MB 미만**으로 압축하십시오(JPEG 품질 80-90 / 축소된 해상도). 다중 이미지 융합에서도 이미지당 동일한 상한을 적용하십시오. 간헐적인 `shell_api_error` / `Unknown error` 응답은 대부분 너무 큰 입력 때문에 발생하며, 압축하면 성공률과 지연 시간이 눈에 띄게 향상됩니다. **출력 해상도는 입력 크기가 아니라 `size` 필드에 의해 결정됩니다** — 입력을 줄여도 속도만 빨라질 뿐 품질은 저하되지 않습니다. 프롬프트에 `4K` / `8K`를 잔뜩 넣어도 4K 이미지는 생성되지 않습니다. 해상도는 프롬프트의 군더더기가 아니라 `size`에 의해 설정됩니다.
  </Step>

  <Step title="산출물에 맞춰 크기 등급을 선택합니다">
    1K Fast는 초안용입니다. 2K는 프로덕션용으로 권장됩니다. 4K는 인쇄/대형 디스플레이용 세부 모드입니다. 과금은 동일합니다 — 필요에 따라 선택하십시오.
  </Step>

  <Step title="크기에는 소문자 ASCII x를 사용합니다">
    `"size": "1536x1024"`를 보내십시오 — `1536×1024`가 아니며, 대문자 `X`도 아닙니다.
  </Step>

  <Step title="quality 또는 n을 전달하지 마십시오">
    `quality`는 거부됩니다. `n`는 호출당 1개 이미지만 반환하므로, 여러 이미지는 병렬로 호출하십시오.
  </Step>

  <Step title="300s 타임아웃을 사용합니다">
    일반적인 생성 시간은 90–150s이지만, 이미지 업로드 / 다운로드 시간과 피크-테일 지연이 이를 더 늘립니다. **보수적인 기준선으로 300s를 설정하십시오.**
  </Step>

  <Step title="필요에 따라 응답 형식을 선택합니다">
    직접 웹 렌더링에는 `b64_json`을 사용하고; 서버 측 저장/전달에는 `url`을 사용합니다.
  </Step>

  <Step title="-all로 코드를 공유합니다">
    동일한 코드는 두 경우 모두 작동합니다 — 필요에 따라 `model`를 `gpt-image-2-all`와 `gpt-image-2-vip` 사이에서 전환하십시오. 고정 크기가 필요할 때는 vip를 사용하고, 가장 빠른 반복을 위해 다시 -all로 전환하십시오.
  </Step>
</Steps>

## 오류 코드 및 재시도

| Status         | 의미                                           | 제안                                                                                                                                           |
| -------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `400`          | 30-size 세트에 없거나 형식이 잘못됨                      | 위 표의 정확한 문자열을 사용하십시오                                                                                                                         |
| `401`          | 잘못된 token                                    | Bearer Token을 확인하십시오                                                                                                                         |
| `429`          | 요청 제한 / 쿼터 소진                                | 지수 백오프 재시도                                                                                                                                   |
| `500` (4K 간헐적) | OpenAI 상위 계층의 연산 변동; 4K Detail 티어에서 더 자주 발생함 | **2K Recommended로 낮추고** 재시도하십시오; 4K가 필수라면 공식 프록시 [`gpt-image-2`](/ko/api-capabilities/gpt-image-2/overview) + `image2Enterprise` 그룹으로 전환하십시오 |
| `5xx` (기타)     | 일시적인 게이트웨이/백엔드 오류                            | 1–2회 재시도하십시오                                                                                                                                 |
| 타임아웃           | Codex 피크 + 4K 롱테일                            | 클라이언트 타임아웃을 **≥ 300s**로 설정하십시오 (보수적 기준)                                                                                                      |

<Info>
  **클라이언트 권장 사항**:

  * 요청 타임아웃은 **300초부터** 설정하십시오 (보수적 기준; 일반적으로는 90–150s이지만 4K Detail + 피크 꼬리 구간에서는 더 길어집니다)
  * 5xx 및 타임아웃에는 **지수 백오프**를 사용하십시오 (2–3회 재시도 권장)
  * 디버깅을 위해 `request-id` 응답 헤더를 기록하십시오
</Info>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="vip와 -all 사이에서 코드를 공유할 수 있습니까?">
    **예, 거의 동일합니다.** 두 엔드포인트(`/v1/images/generations`, `/v1/images/edits`)는 요청 필드, 응답 필드, 그리고 `b64_json` 접두사 동작을 공유합니다. 차이점은 두 가지뿐입니다.

    1. `model` 필드: `gpt-image-2-vip` ↔ `gpt-image-2-all`
    2. `size` 필드: vip는 30개 사이즈 세트를 허용하고, -all은 `size`를 거부합니다(사이즈는 대신 prompt에 들어갑니다)

    실무 패턴: `if model == 'vip': payload['size'] = ...` 스위치 하나로 단일 코드베이스를 유지하십시오.
  </Accordion>

  <Accordion title="왜 vip가 그렇게 더 느립니까?">
    `gpt-image-2-vip`는 Codex 역방향 채널을 사용합니다 — **일반적으로 90\~150초**이며, 공식 `gpt-image-2`(100~~120초)와 비슷하고 ChatGPT-web-line `gpt-image-2-all`(30~~60초)보다 느립니다. **지연 시간에 민감한** 워크로드에는 `gpt-image-2-all`를 선호하십시오. 고정 사이즈나 4K가 필요할 때만 vip로 전환하십시오.
  </Accordion>

  <Accordion title="사이즈는 반드시 표에 있는 값이어야 합니까? 1024x768을 보내면 어떻게 됩니까?">
    **예 — 30개 사이즈 세트를 그대로 사용하십시오.** 목록에 없는 사이즈는 상위 `invalid_request_error`를 유발할 수 있습니다. 결과물에 가장 가까운 등급을 선택하십시오.
  </Accordion>

  <Accordion title="왜 4K에서 500이 자주 반환됩니까? 안정적인 4K를 얻으려면 어떻게 해야 합니까?">
    **증상**: 4K Detail 등급(예: `3840x2160` / `2880x2880`)에서는 `status_code: 500` 오류가 더 쉽게 발생하며, 상위 시스템은 `invalid_request_error`를 반환합니다.

    ```json theme={null}
    {
      "status_code": 500,
      "error": {
        "message": "An error occurred while processing your request. ... Please include the request ID xxxxxxxx in your message.",
        "type": "invalid_request_error",
        "code": null
      }
    }
    ```

    **원인**: **OpenAI 연산 변동**입니다. 요청 파라미터 때문이 아닙니다. 같은 페이로드는 보통 2K에서는 통과합니다. Codex 역방향 채널은 특히 피크 시간대에 4K 같은 큰 출력에 더 민감합니다.

    **완화책**(비용 대비 효과 순):

    1. **2K Recommended를 우선 사용**(예: `2048x1360` / `2048x2048`) — 성공률이 크게 높고, 비용은 동일하게 **\$0.03/image**입니다
    2. img2img / 다중 이미지 융합에서는 **입력 이미지 수를 줄이십시오** — Codex 역방향 채널은 입력 부하가 크면 더 취약해져 4K 실패율이 더 올라가며, 각 입력 이미지를 **1.5MB 미만**으로 미리 압축하는 것도 도움이 됩니다
    3. **4K를 보장하려면** 공식 프록시 [`gpt-image-2`](/ko/api-capabilities/gpt-image-2/overview) + **`image2Enterprise` 그룹**으로 전환하십시오. 공식 프록시 4K는 더 비싸지만(**약 \$0.3+/image**), 훨씬 더 안정적입니다 — 4K 전달이 반드시 필요할 때 적합합니다.

    📖 필드 노트: [/en/live/2026-05/gpt-image-2-vip-4k-tips](/en/live/2026-05/gpt-image-2-vip-4k-tips)
  </Accordion>

  <Accordion title="입력 이미지를 압축해야 합니까? prompt에 4K / 8K를 적으면 도움이 됩니까?">
    **예, 강력히 권장합니다.** 각 입력 이미지를 **1.5MB 미만**으로 압축하십시오(JPEG 품질 80\~90 / 해상도 축소): 간헐적 `shell_api_error` / `Unknown error` 응답은 대부분 너무 큰 입력에서 발생하며, 압축하면 성공률과 지연 시간이 눈에 띄게 개선됩니다. 참고: 1.5MB는 신뢰성과 속도를 위한 **권장 상한**이며, 위 FAQ의 10MB 수치는 게이트웨이의 하드 한계입니다.

    **압축이 품질을 해친다고 걱정할 필요는 없습니다** — 출력 해상도는 `size` 파라미터로 결정되며, 입력 크기와는 무관합니다. 입력을 줄이면 속도만 빨라집니다.

    **`4K` / `8K`를 prompt에 넣는다고 실제로 4K 출력이 나오지는 않습니다.** prompt에 `8K ultra HD`라고 적어도 `size`를 `1024x1024`로 설정하면 여전히 1K 품질 이미지를 받습니다. **4K가 필요하면 `size` 필드에 설정하십시오** — 30개 사이즈 세트에서는 1K / 2K / 4K 모두 동일하게 고정 \$0.03/image입니다.

    📖 출처: [/en/live/2026-05/gpt-image-2-vip-unknown-error](/en/live/2026-05/gpt-image-2-vip-unknown-error)
  </Accordion>

  <Accordion title="4K에 정말 추가 과금이 없습니까?">
    **추가 과금이 없습니다.** 4K Detail 등급(`3840x2160` / `2880x2880` 등)은 1K 및 2K와 동일하게 \$0.03/image입니다.
  </Accordion>

  <Accordion title="n을 지원합니까? n=3을 전달하면 어떻게 됩니까?">
    **아닙니다.** 이 모델은 호출당 1장의 이미지만 반환합니다 — 여러 이미지가 필요하면 대신 **반복 / 동시 호출**을 사용하십시오.

    ⚠️ **중요**: 요청에 `n=3`를 전달하면 **과금은 0.03 × 3 = \$0.09**이지만, **실제로는 1장만 반환됩니다**. 낭비되는 과금을 피하려면 `n` 필드를 제거하십시오.
  </Accordion>

  <Accordion title="콘텐츠가 거부되거나 모델이 'I can't do that'라고 답하면 과금됩니까?">
    이 경로는 **동기식 채팅 스타일 응답**을 사용하는 역공학 채널입니다. 결과는 **서로 다른 과금 규칙**을 가진 두 가지 경우로 나뉩니다.

    **1) HTTP 5xx 반환 → 과금되지 않음**

    상위 콘텐츠 정책이 요청을 강하게 차단하면 다음과 비슷하게 표시됩니다.

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

    이러한 하드 오류는 **과금되지 않습니다**. 사용자가 prompt를 조정한 뒤 다시 시도하도록 하십시오.

    **2) HTTP 200과 텍스트 "soft refusal" → 과금됨**

    모델이 대화 중에 소프트 거부를 하면(예: "I can't do that", "Sorry, this request involves…") 프로토콜 수준에서는 일반적인 chat completion처럼 보이므로 **과금됩니다**. 역방향 채널은 프로토콜 계층에서 "거부 텍스트"와 "이미지 출력"을 안정적으로 구분할 수 없습니다.

    **왜 soft refusal을 그냥 면제할 수 없는가**

    모든 soft refusal을 자동 면제하면 플랫폼이 실패한 상위 호출 비용을 전부 떠안게 됩니다. 더 중요한 점은, **상위 콘텐츠 안전 정책을 자주 건드리면 공급업체 계정이 차단될 위험도 높아집니다** — 이는 실제 공급 측 비용이며 완전히 없앨 수는 없습니다.

    **연동자 권장사항**

    * ✅ **사용자 사전 필터링 및 경고**: 프론트엔드나 게이트웨이에 키워드/시나리오 필터(실존 인물 이름, 저작권 캐릭터, 민감 주제)를 추가하고, "Celebrity / IP 주제는 실패할 수 있으며 상위 정책에 따라 과금될 수도 있습니다." 같은 UI 힌트를 보여주십시오. 이렇게 하면 낭비되는 과금을 크게 줄일 수 있습니다.
    * ✅ **소비자용 제품의 월별 보전**: 소비자 대상 제품은 사용자 입력을 완전히 차단할 수 없다는 점을 이해합니다. 월 지출이 충분히 크다면(**\$1000+/month**), 로그를 월 단위로 묶어 제출할 수 있으며(짧은 지연 시간 호출은 보통 soft refusal입니다) 지원팀에 일회성 수동 크레딧을 요청할 수 있습니다 — 호출별 이의 제기를 할 필요는 없습니다.

    📖 관련: [500 오류는 보통 콘텐츠 정책 적중입니다(과금되지 않음)](/en/live/2026-04/gpt-image-2-all-500-content-policy)
  </Accordion>

  <Accordion title="b64_json에 data:image/png;base64, prefix를 추가해야 합니까?">
    **먼저 감지한 뒤 처리하십시오.** 2026년 7월 기준으로 확인된 바에 따르면, 반환된 `b64_json`는 `data:` prefix가 없는 **원시 base64**입니다. 파일로 쓰려면 디코딩하고, 렌더링 전에 직접 prefix를 붙이십시오. **이전 버전에는 prefix가 포함되어 있었습니다.** 코드에 `startsWith('data:')` 검사를 추가하십시오: prefix가 있으면 값을 그대로 `img src`로 사용하고, 없으면 먼저 디코딩하거나 prefix를 붙이십시오. 이렇게 하면 prefix를 두 번 붙이거나, prefix가 붙은 문자열을 디코딩해 깨진 이미지를 만드는 일을 피할 수 있습니다.
  </Accordion>

  <Accordion title="참조 이미지의 최대 크기와 지원 형식은 무엇입니까?">
    이미지당 권장 **≤ 10MB**이며, 형식은 `png` / `jpg` / `webp`입니다. 너무 큰 이미지는 게이트웨이 한도에 걸릴 수 있습니다. 다중 이미지 융합의 각 이미지는 이 제한을 충족해야 합니다.
  </Accordion>

  <Accordion title="반환된 이미지 URL은 얼마나 오래 유효합니까? 다운로드해야 합니까?">
    `url`-mode 응답의 `url` 필드는 **약 1일(24시간) 후 만료되는 R2 CDN 링크**입니다 — 그 이후의 요청은 404가 됩니다.

    **강력히 권장합니다**: 생성 직후 이미지를 **자신의 object storage(S3 / OSS / R2), CDN 또는 데이터베이스**에 다운로드하여 보관하십시오.
  </Accordion>

  <Accordion title="스트리밍을 지원합니까?">
    아닙니다. 이 모델은 이미지를 한 번에 반환하며, 스트리밍은 지원하지 않습니다. 지연 시간이 중요하면 클라이언트 측에 `"생성 중..."` 진행 표시를 보여 주고, **300초 타임아웃**을 설정하십시오(보수적 설정).
  </Accordion>

  <Accordion title="공식 OpenAI SDK를 사용할 수 있습니까?">
    예. `base_url`를 `https://api.apiyi.com/v1`로 지정하고, `api_key`를 APIYI token으로 설정하십시오. `client.images.generate(model="gpt-image-2-vip", size="2048x1360", prompt=...)`은 그대로 작동합니다.
  </Accordion>

  <Accordion title="/v1/chat/completions로 여전히 이미지를 생성할 수 있습니까?">
    예, 엔드포인트는 여전히 작동하지만 **더 이상 권장되지 않습니다** — 대신 `/v1/images/generations`와 `/v1/images/edits`를 사용하십시오(더 안정적이며, 공식 릴레이 `gpt-image-2`와도 같은 코드가 작동합니다).

    채팅 기반 스타일은 두 가지 경우에만 의미가 있습니다. 다회차 반복 편집 또는 온라인 이미지 URL 직접 전달입니다. 이미지 의도가 모호하면 모델이 이미지 대신 일반 텍스트를 반환할 수 있습니다(이를 강화하려면 prompt 앞에 "이미지를 생성하십시오:" 같은 고정 prefix를 붙이십시오).

    전체 파라미터는 [채팅 기반 API 참조](/en/api-capabilities/gpt-image-2-vip/chat-completions)를 보십시오.
  </Accordion>

  <Accordion title="언제 공식 gpt-image-2로 전환해야 합니까?">
    `quality` 조절값(low/medium/high), 마스크 기반 로컬 재페인팅, 또는 엄격한 OpenAI API 필드 일치성이 필요할 때는 [`gpt-image-2`](/ko/api-capabilities/gpt-image-2/overview)를 사용하십시오. [공식 vs 역방향 비교](/ko/api-capabilities/gpt-image-2/vs-gpt-image-2-all)도 보십시오.
  </Accordion>
</AccordionGroup>

## 관련 문서

* [GPT-Image-2-All 개요](/ko/api-capabilities/gpt-image-2-all/overview) - 같은 가격에 더 빠른 출력을 제공하는 자매 모델로, 크기를 고정할 필요가 없을 때 적합합니다
* [⚖️ 공식 vs 리버스 비교](/ko/api-capabilities/gpt-image-2/vs-gpt-image-2-all) - 공식 `gpt-image-2` 대비 나란한 선택 가이드입니다(`-all` / `-vip`를 다룹니다)
* [텍스트-투-이미지 플레이그라운드](/ko/api-capabilities/gpt-image-2-vip/text-to-image) - `/v1/images/generations` 호환 엔드포인트로, `size`을 전달하여 크기를 고정합니다
* [이미지 편집 플레이그라운드](/ko/api-capabilities/gpt-image-2-vip/image-edit) - `/v1/images/edits` 다중 이미지 융합 및 편집
* [GPT-Image-2 공식](/ko/api-capabilities/gpt-image-2/overview) - `quality` 매개변수 / 마스크 기반 재도색 / 엄격한 OpenAI API 필드 일치를 위해 사용합니다
* [GPT-Image 시리즈 개요](/en/api-capabilities/gpt-image-series) - 공식 GPT-Image 비교
* [API 매뉴얼](/ko/api-manual) - 일반 호출 규칙

<Info>
  gpt-image-2-vip는 리버스 엔지니어링된 채널(Codex 라인)입니다. 동작은 일치하지만 가격/기능은 공식 버전과 완전히 일치하지 않을 수 있습니다. 완전한 공식 API 호환성을 원하시면 [`gpt-image-2`](/ko/api-capabilities/gpt-image-2/overview)를 사용하십시오.
</Info>
