> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# GPT-Image-2-All 이미지 생성/편집

> GPT 이미지 생성 리버스 엔지니어링 모델 gpt-image-2-all (ChatGPT 웹 라인). 호출당 $0.03/image의 고정 과금, 약 30–60초 생성. text-to-image, multi-image fusion editing, natural-language editing, 높은 text-rendering fidelity, 중국어 prompt 친화적입니다.

<Info>
  모든 이미지 API는 **동기식**입니다 — 폴링할 task ID가 없으며, 클라이언트가 연결을 끊으면 요청은 계속 과금되는 동안 결과는 사라집니다. 이 모델에는 넉넉한 timeout을 설정하십시오. [이미지 API 필수 사항 및 모범 사례](/ko/api-capabilities/image-api-best-practices)를 참고하십시오.
</Info>

## 개요

**gpt-image-2-all**은 APIYI 플랫폼에서 제공되는 **GPT 이미지 생성 역공학 모델**(ChatGPT 웹 계열)입니다. 호출당 **\$0.03/image**라는 매우 경쟁력 있는 가격으로, **약 30–60초** 만에 이미지를 생성하며 **텍스트-이미지 / 단일 이미지 편집 / 다중 이미지 융합 / 자연어 편집**을 지원합니다. 또한 텍스트 렌더링 정확도가 높고 중국어 prompt를 기본 지원합니다.

<Note>
  **🎨 주요 특징**: 안정적인 역공학 채널로, 고정 \$0.03/image 요율을 제공합니다. 크기/품질/n 파라미터를 신경 쓸 필요가 없으며, prompt에 크기와 스타일만 설명하면 됩니다. OpenAI Images API 표준 엔드포인트인 `/v1/images/generations`(텍스트-이미지)와 `/v1/images/edits`(이미지 편집)를 사용합니다.

  **출력 크기나 4K를 고정해야 합니까?** 자매 모델 [`gpt-image-2-vip`](/ko/api-capabilities/gpt-image-2-vip/overview)로 전환하십시오. 호출 형식은 동일하며, `size` 필드 하나만 추가하면 됩니다.
</Note>

<CardGroup cols={2}>
  <Card title="텍스트-이미지 API" icon="wand-sparkles" href="/ko/api-capabilities/gpt-image-2-all/text-to-image">
    `/v1/images/generations` — text prompt로 이미지를 생성합니다.
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
  | 요구사항                          | 방지하는 함정                                                                                                                                                                            |
  | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | timeout을 360초로 늘림             | 주류 HTTP 클라이언트는 기본적으로 30\~60초 timeout을 사용하며, 서버가 정상적으로 생성 중일 때 요청을 끊습니다 — 그리고 **연결이 끊긴 요청도 여전히 과금됩니다**. [Image API 필수 사항 및 모범 사례](/ko/api-capabilities/image-api-best-practices) 참조 |
  | `response_format`를 명시적으로 보내기  | 기본값은 과거에 바뀐 적이 있습니다. 이를 보내지 않으면 `url`와 `b64_json` 형태를 모두 처리해야 합니다                                                                                                                  |
  | `n`를 절대 보내지 않기                | 3으로 보내면 3장의 이미지에 대해 과금되지만 실제로는 1장만 반환됩니다                                                                                                                                           |
  | `size` / `quality`를 절대 보내지 않기 | 이 모델은 둘 다 거부합니다. 차원은 대신 프롬프트 접두사에서 가져옵니다                                                                                                                                           |
  | 업로드 전에 압축                     | 스마트폰 사진은 대개 4-5MB이며, base64 인코딩은 그 위에 약 33%를 더 부풀립니다. [이미지 압축 및 출력 해상도](/ko/api-capabilities/image-compression-resolution) 참조                                                      |
</Accordion>

## 핵심 기능

<CardGroup cols={2}>
  <Card title="매우 경쟁력 있는 가격" icon="dollar-sign">
    호출당 고정 요금 \$0.03/image, 해상도 등급 없음, 예측 가능한 비용
  </Card>

  <Card title="뛰어난 텍스트 렌더링" icon="type">
    중국어/영어 텍스트, 간판, 포스터 문구를 안정적으로 렌더링합니다 — 인포그래픽과 마케팅 소재에 이상적입니다
  </Card>

  <Card title="중국어 prompt 친화적" icon="languages">
    번역 없이 중국어 설명을 자연스럽게 이해합니다
  </Card>

  <Card title="다중 이미지 융합" icon="layers">
    여러 참조 이미지를 지원하며, prompt에서는 "image1/image2/image3"로 참조할 수 있습니다
  </Card>
</CardGroup>

<CardGroup cols={2}>
  <Card title="더 빠른 출력" icon="bolt">
    약 30–60초의 생성 — `gpt-image-2-vip` 및 공식 릴레이 `gpt-image-2`보다 더 빠릅니다
  </Card>

  <Card title="R2 CDN 가속" icon="cloud">
    지연 시간이 짧은 글로벌 전송을 위한 R2 CDN 링크에는 `response_format: "url"`를 명시적으로 전달합니다
  </Card>

  <Card title="자연어 편집" icon="message-circle">
    대화형 설명으로 편집하며, 마스크가 필요 없고, 다중 턴 반복을 지원합니다
  </Card>

  <Card title="표준 엔드포인트 지원" icon="plug">
    OpenAI 이미지 API의 표준 엔드포인트 `/images/generations` 및 `/images/edits`와 호환됩니다
  </Card>
</CardGroup>

## Pricing

| Model             | 과금  | 가격                 | 출력         |
| ----------------- | --- | ------------------ | ---------- |
| `gpt-image-2-all` | 호출당 | **\$0.03 / image** | 호출당 이미지 1개 |

<Info>
  **과금 참고 사항**:

  * 정액 요금입니다. 해상도, 품질, prompt 길이에 따른 구간이 없습니다
  * 실패한 요청은 과금되지 않습니다(인증 실패, 파라미터 검증 오류)
  * N개의 이미지를 생성하려면 API를 N번 병렬로 호출하십시오
</Info>

<Tip>
  **동일 가격 자매 모델**: [`gpt-image-2-vip`](/ko/api-capabilities/gpt-image-2-vip/overview) (Codex 역방향 라인) — 동일하게 \$0.03/image이며, 30개의 명시적 크기(4K 포함)를 지원하고, 호출 형식도 같습니다. 출력 크기를 고정해야 할 때 전환하십시오.
</Tip>

## 그룹 설정

`gpt-image-2-all`는 `Default` 그룹에 있습니다 — **추가 그룹이 필요 없습니다**. 역방향 채널은 현재 안정적인 공급이 있어, 공식 릴레이 `gpt-image-2`처럼 엔터프라이즈 그룹 대체 이야기는 없습니다.

| 모델                | 그룹           | 비고                                                                       |
| ----------------- | ------------ | ------------------------------------------------------------------------ |
| `gpt-image-2-all` | `Default`    | ChatGPT-web 역방향, 고정 \$0.03/img, \~30–60초                                 |
| `gpt-image-2-all` | `image2_OSS` | **1x 요율 배수(추가 요금 없음)**, 결정적 URL 출력 — 기본 그룹이 과부하일 때도 base64로 절대 폴백하지 않습니다 |

### 결정적 URL 출력이 필요하시면 → `image2_OSS` 그룹으로 전환하십시오

기본 그룹에서 2026년 7월에 측정한 결과, `gpt-image-2-all`(및 `gpt-image-2-vip`)는 `response_format`를 생략하면 `b64_json`를 반환합니다; 이미지 URL을 얻으려면 `response_format: "url"`를 명시적으로 전달하십시오. 기본 그룹의 출력 형식은 **보장되지 않습니다** — 과거에는 `url`를 기본값으로 사용하고 부하가 높을 때 `b64_json`로 폴백했으며, 채널 버전마다 달라졌습니다.

비즈니스가 **URL 출력에 의존한다면**(URL을 데이터베이스에 바로 쓰거나, 프런트엔드에서 URL로 렌더링해야 하거나, base64는 허용되지 않는 경우), 토큰의 그룹을 \*\*`image2_OSS`\*\*로 전환하십시오. 이는 **결정적 URL 출력**을 위해 설계된 그룹으로, \*\*1x 요율 배수(추가 요금 없음)\*\*가 적용되며, 역방향 모델 `gpt-image-2-all`와 `gpt-image-2-vip` 모두에 유효합니다. 응답에는 항상 이미지 URL이 포함되며 base64로 폴백하지 않습니다.

<Frame caption="Token creation: set billing mode to &#x22;pay-as-you-go first&#x22; and pick the image2_OSS group (1x) — use it when you need deterministic URL output">
  <img src="https://mintcdn.com/apiyillc/eNGQJU-a_dFb12gU/images/image2-oss-token-setup-20260525.png?fit=max&auto=format&n=eNGQJU-a_dFb12gU&q=85&s=727f61464cc759006a59e8de6ceccd32" alt="토큰 생성 화면: 과금 모드는 먼저 종량제, 그룹 image2_OSS (1x 요율 배수), 이미지 URL을 출력하는 그룹, gpt-image-2-all 및 gpt-image-2-vip에 적합합니다" width="1278" height="846" data-path="images/image2-oss-token-setup-20260525.png" />
</Frame>

<Tip>
  **고급(`gpt-image-2-vip`와 공식 릴레이 `gpt-image-2`도 함께 사용하는 경우)**: 토큰이 세 모델을 모두 포함한다면, 토큰의 그룹 우선순위를 다음과 같이 설정하십시오:

  * **첫 번째 우선순위**: `image2Enterprise` (1.2x 엔터프라이즈 그룹, 공식 릴레이 전용 안정 차선)
  * **기본 폴백**: `Default` (두 역방향 모델이 모두 여기에서 동작하며 모델별로 라우팅됨)

  결과: 공식 릴레이 `gpt-image-2`는 안정성을 위해 엔터프라이즈 차선을 타고, 두 역방향 모델은 기본 그룹에 그대로 유지됩니다 — 하나의 토큰으로 세 모델을 모두 커버하며, 간섭이 없습니다.
</Tip>

📖 `image2Enterprise` 그룹에 대하여: [/en/live/2026-04/image2-enterprise-stable](/en/live/2026-04/image2-enterprise-stable)

## 기술 사양

| Attribute      | Value                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------- |
| **모델 이름**      | `gpt-image-2-all`                                                                              |
| **채널 유형**      | 공식 리버스 엔지니어링(챗GPT 웹)                                                                           |
| **과금**         | \$0.03 / 이미지, 호출당                                                                              |
| **생성 시간**      | 약 30–60초                                                                                       |
| **출력 해상도**     | 명시적인 크기 매개변수 없음; 적응형(프롬프트에 설명)                                                                 |
| **기본 응답 형식**   | `b64_json` (원시 base64, **no `data:` 접두사**, 2026-07에 확인됨; 항상 `response_format`를 명시적으로 전달해야 합니다) |
| **선택 형식**      | `url` (R2 CDN 가속 링크, **약 1일 유효**, 명시적인 `response_format: "url"` 필요)                            |
| **중국어 prompt** | ✅ 기본 지원                                                                                        |
| **기능**         | 텍스트-이미지, 단일 이미지 편집, 다중 이미지 융합, 자연어 편집                                                          |

<Warning>
  이 모델은 **적응형 출력 크기**를 가지며 공식 `gpt-image-2` API와 동일하지 않습니다. 출력 크기가 엄격하게 고정되어야 하거나 4K가 필요하다면 [`gpt-image-2-vip`](/ko/api-capabilities/gpt-image-2-vip/overview)를 사용하십시오(Codex 리버스 라인, 4K를 포함한 30개의 명시적 크기). 공식 API와의 완전한 동등성이 필요하다면 [`gpt-image-2`](/ko/api-capabilities/gpt-image-2/overview)를 사용하십시오.
</Warning>

<Warning>
  **⏰ 이미지 URL 유효 기간: 약 1일(기본)**

  `url` 필드는 `url` 모드 응답의 R2 CDN 링크이며 **약 24시간 후 만료됩니다** — 그 이후의 요청은 404를 반환합니다. 장기 보관이 필요한 이미지(제품 이미지, 사용자 작품, 기록 등)는 생성 후 **가능한 한 빨리 다운로드하여 자체 저장소에 보관하십시오**.

  일반적인 두 가지 방법은 다음과 같습니다:

  * **서버 측 다운로드**: 응답을 받는 즉시 `requests` / `fetch`를 사용하여 이미지를 가져와 S3 / OSS / R2 / 로컬 디스크에 저장합니다
  * **`b64_json` 응답 형식 사용**: 이미지를 base64 데이터로 바로 받아 추가적인 교차 출처 다운로드를 건너뛰며, 프런트엔드 렌더링이나 파일에 바로 쓰기에 적합합니다
</Warning>

## 엔드포인트

| Endpoint                      | Purpose       | Content-Type          | Best for                                                      |
| ----------------------------- | ------------- | --------------------- | ------------------------------------------------------------- |
| `POST /v1/images/generations` | 텍스트-투-이미지     | `application/json`    | OpenAI Images API 표준 형식 — 같은 코드로 공식 채널과 리버스 채널 모두에 요청할 수 있습니다 |
| `POST /v1/images/edits`       | 이미지 편집(단일/다중) | `multipart/form-data` | OpenAI Images API 표준 형식 — 같은 코드로 공식 채널과 리버스 채널 모두에 요청할 수 있습니다 |

<Tip>
  **OpenAI Images API를 사용하십시오** (`/v1/images/generations` + `/v1/images/edits`), 이유는 두 가지입니다:

  1. **더 안정적입니다**: Images API 채널의 상류 자원 공급이 더 풍부하므로 호출 성공률이 더 높습니다
  2. **손쉬운 전환을 위해 공식 릴레이와 호환됩니다**: `size` 같은 호출 방식과 파라미터는 공식 릴레이 [`gpt-image-2`](/ko/api-capabilities/gpt-image-2/overview)와 완전히 호환됩니다 — 리버스 채널이 리스크 제어 문제에 걸리면, **`model` 이름만 바꾸면** 코드 변경 없이 바로 전환할 수 있습니다

  또한 채팅 기반 엔드포인트(`/v1/chat/completions`, 더 이상 권장되지 않음)도 있습니다 — 아래 FAQ를 참조하십시오.
</Tip>

<Tip>
  **도메인 옵션**: `api.apiyi.com`가 주 도메인입니다. `b.apiyi.com` / `vip.apiyi.com` 같은 대체 게이트웨이 도메인도 사용할 수 있습니다. 응답 동작은 동일합니다.
</Tip>

<Info>
  **`size` 파라미터로 출력 크기를 고정하고 싶으신가요?** 자매 모델 [`gpt-image-2-vip`](/ko/api-capabilities/gpt-image-2-vip/overview)을 사용하십시오 — 엔드포인트는 동일하고, `size` 필드 하나만 추가하면 됩니다(4K를 포함한 30개의 명시적 크기).
</Info>

## 크기 및 종횡비 제어(프롬프트에서 설명)

`gpt-image-2-all`에는 `size` 파라미터가 없습니다. 즉, 크기는 프롬프트에 설명합니다. 출력 크기를 엄격하게 고정해야 하는 경우(이커머스 히어로 이미지, 포스터 템플릿, 4K 배경화면 등)에는 대신 [`gpt-image-2-vip`](/ko/api-capabilities/gpt-image-2-vip/overview)을 사용하십시오.

### 검증된 "프롬프트 표현 → 실제 해상도" 표

아래 8개의 표현은 실험적으로 안정적으로 재현됨이 검증되었습니다. 첫 번째 열의 표현을 프롬프트의 **앞부분**에 넣으면 두 번째 열에 표시된 해상도를 얻을 수 있습니다(모든 출력은 약 1.5K 픽셀 티어에 속합니다).

| 프롬프트 표현(그대로 입력)      | 검증된 해상도     | 대략적인 크기  | 실제 종횡비 |
| -------------------- | ----------- | -------- | ------ |
| `横版 16:9` (가로형 16:9) | 1672 × 941  | \~1.9 MB | 16:9   |
| `竖屏 9:16` (세로형 9:16) | 941 × 1672  | \~2.1 MB | 9:16   |
| `4:3`                | 1448 × 1086 | \~2.3 MB | 4:3    |
| `3:4`                | 1086 × 1448 | \~2.5 MB | 3:4    |
| `3:2 尺寸` (3:2 크기)    | 1536 × 1024 | \~2.9 MB | 3:2    |
| `2:3 尺寸` (2:3 크기)    | 1024 × 1536 | \~3.0 MB | 2:3    |
| `2:5 竖屏` (2:5 세로형)   | 793 × 1983  | \~1.9 MB | 2:5    |
| `5:2 横屏` (5:2 가로형)   | 1983 × 793  | \~1.9 MB | 5:2    |

<Info>
  **참고**:

  * 모든 출력은 **약 1.5K 픽셀 티어**(긴 변이 1500\~2000px)입니다. 이는 모델의 실효 상한이며, 진정한 의미의 “임의 해상도”는 아닙니다.
  * 프롬프트에 표의 표현만 **단독으로** 포함될 때 재현성이 가장 높습니다. 다른 구성 관련 단어를 섞으면 결과가 흔들릴 수 있습니다.
  * 중국어 문자열은 실제로 전송하는 값이므로, 번역하지 말고 그대로 유지하는 것을 권장합니다.
</Info>

### 스타일 표현(고정 해상도 없음)

아래 표현에는 검증된 해상도가 없습니다. 위 표와 함께 스타일 수정어로만 사용하십시오.

| 필요      | 표현(스타일 안내용 בלבד — 해상도 보장 없음)                        |
| ------- | --------------------------------------------------- |
| 정사각형    | `1024×1024 square` / `1:1 square composition`       |
| 초광각 배너  | `Banner 21:9 ultra-widescreen`                      |
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

| 상태      | 의미                           | 제안                                    |
| ------- | ---------------------------- | ------------------------------------- |
| `401`   | 유효하지 않은 token                | Bearer Token을 확인합니다                   |
| `429`   | 요청 제한 / 쿼터 소진                | 지수 백오프 재시도                            |
| `5xx`   | 일시적인 게이트웨이/백엔드 오류            | 1–2회 재시도                              |
| Timeout | 리버스 채널 피크 + 이미지 업로드/다운로드 롱테일 | 클라이언트 타임아웃을 **≥ 300s**로 설정합니다(보수적입니다) |

<Info>
  **클라이언트 권장 사항**:

  * 요청 타임아웃은 **300초부터** 시작합니다(보수적 설정입니다. 일반적으로는 30–60초이지만, 이미지 업로드/다운로드와 리버스 채널 피크 꼬리 구간 때문에 편차가 큽니다 — 120초는 잘못된 타임아웃이 자주 발생합니다)
  * 5xx와 타임아웃에는 **지수 백오프**를 사용합니다(2–3회 재시도 권장)
  * 디버깅을 위해 `request-id` 응답 헤더를 기록합니다
</Info>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="gpt-image-2-all과 gpt-image-2-vip를 모두 보이는데, 무엇을 선택해야 합니까?">
    둘 다 같은 가격(\$0.03/call)의 리버스 엔지니어링 채널이며, **호출 형식도 완전히 동일합니다**. 차이는 `size` 지원과 생성 시간입니다:

    * **엄격한 크기 제어는 필요 없고 더 빠른 출력을 원함** → `gpt-image-2-all` (\~30–60초, prompt에 크기를 설명하면 됩니다).
    * **고정된 출력 크기 또는 4K가 필요함** → [`gpt-image-2-vip`](/ko/api-capabilities/gpt-image-2-vip/overview) (\~90–150초, 4K를 포함한 30가지 명시적 크기 지원).
    * **`quality` 조절 노브나 완전한 OpenAI API 필드 호환성이 필요함** → 공식 [`gpt-image-2`](/ko/api-capabilities/gpt-image-2/overview)를 사용하십시오.
  </Accordion>

  <Accordion title="한 번에 여러 이미지를 생성할 수 있습니까?">
    아닙니다. 이 모델은 호출당 이미지 1장을 반환합니다. N장의 이미지가 필요하면 API를 병렬로 N번 호출하십시오. 각 호출은 \$0.03으로 별도 과금됩니다.
  </Accordion>

  <Accordion title="n 파라미터를 지원합니까? n=3을 보내면 어떻게 됩니까?">
    **아닙니다.** 이 모델은 호출당 이미지 1장을 반환합니다. 여러 이미지가 필요하면 대신 **반복 / 동시 호출**을 사용하십시오.

    ⚠️ **중요**: 요청에 `n=3`를 보내면 **과금은 0.03 × 3 = \$0.09**가 되지만, **실제로는 이미지 1장만 반환됩니다**. 낭비되는 과금을 막으려면 요청에서 `n` 필드를 제거하십시오.
  </Accordion>

  <Accordion title="콘텐츠가 거부되거나 모델이 '그건 할 수 없습니다'라고 답하면 과금됩니까?">
    이 채널은 **동기식 chat 스타일 응답**을 사용하는 리버스 엔지니어링 채널입니다. 결과는 **서로 다른 과금 규칙**을 가진 두 가지 경우로 나뉩니다:

    **1) HTTP 5xx 반환 → 과금되지 않음**

    업스트림 콘텐츠 정책이 요청을 강하게 차단하면 다음과 같은 응답이 보입니다:

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

    이러한 강제 오류는 **과금되지 않습니다**. 사용자가 prompt를 조정해 다시 시도하도록 안내하십시오.

    **2) HTTP 200과 텍스트 "부드러운 거부" → 과금됨**

    모델이 대화 안에서 부드럽게 거부하면(예: "그건 할 수 없습니다", "죄송하지만, 이 요청에는…") 프로토콜 수준에서는 일반 chat completion처럼 보이므로 **과금됩니다**. 리버스 채널은 프로토콜 계층에서 "거부 텍스트"와 "이미지 출력"을 안정적으로 구분할 수 없습니다.

    **soft refusal를 그냥 면제할 수 없는 이유**

    모든 soft refusal를 자동 면제하면 플랫폼이 실패한 업스트림 호출을 전부 떠안게 됩니다. 더 중요한 점은, **업스트림 콘텐츠 안전을 자주 유발하면 공급업체 계정이 차단될 위험도 높아집니다** — 이는 실제 공급 측 비용이며 완전히 제거할 수 없습니다.

    **통합자에게 권장 사항**

    * ✅ **사전 필터링 및 사용자 경고**: 프런트엔드나 게이트웨이에 키워드/시나리오 필터(실명, 저작권 캐릭터, 민감한 주제)를 추가하고 "유명인 / IP 주제는 업스트림 정책으로 실패할 수 있으며 과금될 수 있습니다." 같은 UI 안내를 표시하십시오. 이렇게 하면 낭비되는 과금을 크게 줄일 수 있습니다.
    * ✅ **소비자 제품은 월별 보전**: 소비자 대상 제품은 사용자 입력을 완전히 차단하기 어렵다는 점을 이해합니다. 월 지출이 충분히 크다면(**\$1000+/month**), **로그를 월 단위로 일괄 처리**(짧은 지연의 호출은 보통 soft refusal입니다)한 뒤 지원팀에 연락하여 1회성 수동 크레딧을 요청할 수 있습니다. 호출별 이의 제기는 필요하지 않습니다.

    📖 관련: [500 오류는 보통 콘텐츠 정책 적중입니다(과금되지 않음)](/en/live/2026-04/gpt-image-2-all-500-content-policy)
  </Accordion>

  <Accordion title="b64_json에 data:image/png;base64, 접두사를 추가해야 합니까?">
    **먼저 감지하고, 그다음 처리하십시오.** 2026년 7월 기준으로 확인된 바에 따르면, 반환된 `b64_json`는 **`data:` 접두사가 없는 순수 base64**입니다. 파일로 쓰려면 디코드하거나, 렌더링하기 전에 직접 접두사를 붙이십시오. **이전 버전에는 접두사가 포함되어 있었습니다**. 코드에 `startsWith('data:')` 검사를 추가하십시오: 접두사가 있으면 값을 그대로 `img src`로 사용하고, 없으면 먼저 디코드하거나 접두사를 붙이십시오. 이렇게 하면 중복 접두사 문제나 접두사가 붙은 문자열을 디코드해 깨진 이미지를 만드는 일을 피할 수 있습니다.
  </Accordion>

  <Accordion title="prompt에 1024x1024라고 적었는데 왜 다른 크기가 나오나요?">
    적응형 모델은 크기 설명을 "강제"가 아니라 "가이드"로 처리합니다. 준수율을 높이려면 크기/구도 관련 단어를 prompt 맨 앞에 두고, 스타일 설명자(예: `cinematic`, `phone poster`, `square composition`)와 함께 사용하십시오.

    특정 해상도에 **안정적으로** 대응하는 문구는 이 페이지 앞부분의 "검증된 prompt 문구 → 실제 해상도" 표를 참고하십시오("Size and Aspect Ratio Control" 아래).
  </Accordion>

  <Accordion title="입력 이미지를 압축해야 합니까? prompt에 4K / 8K를 적으면 도움이 됩니까?">
    **네, 강력히 권장합니다.** 각 입력 이미지를 **1.5MB 미만**으로 압축하십시오(JPEG 품질 80-90 / 해상도 축소): 간헐적인 서버 측 오류는 대부분 너무 큰 입력에서 발생하며, 압축은 성공률과 지연 시간 모두를 눈에 띄게 개선합니다. 참고: 1.5MB는 안정성과 속도를 위한 **권장 상한선**이며, 위 FAQ의 10MB 수치는 게이트웨이의 하드 한도입니다.

    **압축이 품질을 해친다고 걱정할 필요는 없습니다** — 이 모델의 출력 해상도는 입력 크기가 아니라 prompt의 구도 표현에 의해 결정됩니다. 입력을 줄여도 속도만 빨라집니다.

    **`4K` / `8K`를 prompt에 넣는다고 해서 실제로 고해상도 이미지가 생성되지는 않습니다** — 그런 단어들은 장식일 뿐이며, 모델은 그것들 때문에 해상도를 올리지 않습니다. 더 큰 출력을 안정적으로 얻으려면 위의 "검증된 prompt 문구 → 실제 해상도" 표에 있는 검증된 문구를 사용하십시오(예: `cinematic`, `phone poster`, `square composition`). 크기를 엄격히 고정하거나 4K가 필요하면 [`gpt-image-2-vip`](/ko/api-capabilities/gpt-image-2-vip/overview)로 전환하십시오(4K 포함 30가지 명시적 크기, 이미지당 고정 \$0.03).
  </Accordion>

  <Accordion title="참조 이미지의 최대 크기와 지원 형식은 무엇입니까?">
    권장값은 **이미지당 10MB 이하**이며, 형식은 `png` / `jpg` / `webp`입니다. 지나치게 큰 이미지는 게이트웨이 제한에 걸릴 수 있습니다. 다중 이미지 융합의 각 이미지는 이 제한을 충족해야 합니다.
  </Accordion>

  <Accordion title="반환된 이미지 URL은 얼마나 오래 유효합니까? 다운로드해야 합니까?">
    `url` 필드는 `url` 모드 응답의 **약 1일(24시간) 후 만료되는 R2 CDN 링크**입니다. 그 이후의 요청은 404를 반환합니다.

    **강력히 권장합니다**: 생성 직후 생성된 이미지를 **자체 오브젝트 스토리지(S3 / OSS / R2), CDN 또는 데이터베이스**에 다운로드해 보관하십시오. 반환된 URL을 장기적으로 핫링크하지 마십시오.

    **권장하는 두 가지 방법**:

    * **서버 측 프록시**: 응답 직후 곧바로 `requests.get(url)`하여 자체 스토리지에 저장하고, 프런트엔드에는 자체 URL을 반환합니다;
    * **`b64_json` 사용**: 요청에 `"response_format": "b64_json"`를 추가해 base64 이미지 데이터를 직접 받습니다 — 교차 출처 다운로드가 하나 줄어들어 프런트엔드 렌더링이나 파일로 바로 쓰기에 적합합니다.

    짧게 보여주는 미리보기(단일 세션 표시)에는 R2 URL을 그대로 사용해도 되며, 별도 보관은 필요하지 않습니다.
  </Accordion>

  <Accordion title="스트리밍을 지원합니까?">
    아닙니다. 이 모델은 이미지를 한 번에 반환하며 스트리밍은 지원하지 않습니다. 지연 시간이 중요하다면 클라이언트 측에 "생성 중..." 진행 표시를 보여주고 **300초 타임아웃**을 보수적으로 설정하십시오.
  </Accordion>

  <Accordion title="공식 OpenAI SDK를 사용할 수 있습니까?">
    예. `base_url`를 `https://api.apiyi.com/v1`로 지정하고 `api_key`를 APIYI 토큰으로 설정하십시오. 다만 `client.images.generate()`는 기본적으로 `size`/`n`를 전송합니다. 이 모델은 두 파라미터를 모두 거부하므로, `requests` / `fetch`를 사용해 `/v1/images/generations`와 `/v1/images/edits`에 대해 raw HTTP 호출을 하는 것을 권장합니다.
  </Accordion>

  <Accordion title="중국어와 영어 prompt는 의미 있는 차이가 있습니까?">
    이 모델은 중국어를 기본적으로 지원하며 결과도 비슷합니다. 서예나 전통 명절 요소처럼 중국어 특화 시나리오에서는 중국어 표현이 더 자연스럽게 느껴집니다.
  </Accordion>

  <Accordion title="여전히 /v1/chat/completions로 이미지를 생성할 수 있습니까?">
    예, 해당 엔드포인트는 여전히 작동하지만 **더 이상 권장되지 않습니다** — 대신 `/v1/images/generations`와 `/v1/images/edits`를 사용하십시오(더 안정적이며, 공식 릴레이 `gpt-image-2`에서도 같은 코드가 작동합니다).

    chat 기반 스타일은 두 가지 경우에만 의미가 있습니다. 다중 턴 반복 편집이 필요할 때, 또는 온라인 이미지 URL을 직접 전달할 때입니다. 이미지 의도가 모호하면 모델이 이미지 대신 일반 텍스트를 반환할 수 있습니다(이를 강화하려면 prompt 앞에 "Generate an image:" 같은 고정 접두사를 붙이십시오).

    전체 파라미터는 [chat 기반 API 참고 문서](/en/api-capabilities/gpt-image-2-all/chat-completions)를 참조하십시오.
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
