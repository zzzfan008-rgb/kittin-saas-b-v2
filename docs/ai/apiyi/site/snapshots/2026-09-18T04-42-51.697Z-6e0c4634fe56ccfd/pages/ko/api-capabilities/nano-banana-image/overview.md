> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Pro 이미지 생성

> Nano Banana Pro (Gemini 3 Pro) Image Generation API - 4K 지원, 고급 텍스트 렌더링. 사용자 지정 해상도, 10가지 화면 비율, 10초 빠른 생성, 공식 요금 대비 70-83% 할인.

<Note>
  **🔥 최신 출시**: Google은 2026년 2월 26일 **Nano Banana 2** (`gemini-3.1-flash-image-preview`)를 출시했습니다 — Pro급 품질에 Flash 수준 속도이며, 종량제는 이미지당 \$0.025까지 가능합니다! [Nano Banana 2 문서 보기](/ko/api-capabilities/nano-banana-2-image/overview)
</Note>

<Note>
  **🆕 2026년 5월 29일 업데이트 (`-preview` 제외)**: Google이 공식 문서를 업데이트하고 안정 버전 모델 이름 \*\*`gemini-3-pro-image`\*\*를 출시했습니다(`-preview` 없음). APIYI는 이미 이를 지원합니다.

  * **기존 이름도 계속 동작합니다**: `gemini-3-pro-image-preview`는 평소처럼 계속 동작하며, **과금은 변경되지 않았고**, 코드 변경은 필요 없습니다.
  * **두 이름 모두 사용할 수 있습니다**: 새 `gemini-3-pro-image` 이름이나 원래의 `-preview` 이름 중 어느 쪽이든 사용하실 수 있습니다.

  참고: Google은 안정 버전이 미리보기 버전과 출력 품질, 안전 필터링 또는 기타 동작에서 차이가 있는지 아직 명확히 밝히지 않았습니다. 테스트해 보시고 피드백을 공유해 주시기 바랍니다.
</Note>

<Info>
  모든 이미지 API는 **동기식**입니다 — 조회할 작업 ID가 없으며, 클라이언트가 연결을 끊으면 요청은 여전히 과금되지만 결과는 사라집니다. 이 모델에는 넉넉한 타임아웃을 설정하십시오. [이미지 API 필수 사항 및 모범 사례](/ko/api-capabilities/image-api-best-practices)를 참조하십시오.
</Info>

**Nano Banana Pro**(코드명)는 Google의 이미지 생성 모델 시리즈이며, 현재 다음과 같은 사용 가능한 버전이 있습니다:

### 최신 버전

* **Nano Banana 2**: `gemini-3.1-flash-image-preview` (🔥 2026년 2월 26일 출시) — [세부 정보 보기](/ko/api-capabilities/nano-banana-2-image/overview)
* **Nano Banana Pro**: `gemini-3-pro-image-preview` (2025년 11월 20일 출시)

### 이전 버전

* **공식 출시**: `gemini-2.5-flash-image` (안정 버전, 10개 가로세로 비율 지원)
* **미리보기 버전**: `gemini-2.5-flash-image-preview` (⚠️ 2025년 10월 30일 제공 중단)

<Card>
  **핵심 장점**

  * 🔥 **Nano Banana Pro의 새로운 기능**:
    * 🎯 **4K 고해상도 지원**: 1K, 2K, 4K 세 가지 해상도를 지원하며 최대 4096×4096입니다
    * 📝 **텍스트 렌더링 최강**: 이미지 안의 텍스트를 선명하고 읽기 쉽게 표현하여 포스터와 광고에 적합합니다
    * ✨ **로컬 편집**: 카메라 각도, 초점, 색보정, 장면 조명 조정을 지원합니다
    * 🧠 **스마트 추론**: Gemini 3 Pro를 기반으로 하며, 복잡한 prompt를 더 잘 이해합니다

  * 🚀 **범용 장점**:
    * ⚡ **생성 속도**: Nano Banana Pro는 약 20초, 이전 버전은 약 10초입니다
    * 💰 **합리적인 과금**: 충전 보너스와 결합하면 매우 높은 가성비를 제공합니다
    * 🔄 **완전한 호환성**: Google 공식 Gemini API 형식과 완전히 호환됩니다
    * 🎨 **Google 기술**: Google의 최신이자 가장 강력한 이미지 생성/편집 기술을 기반으로 합니다
</Card>

## 인터랙티브 API 테스트

<CardGroup cols={2}>
  <Card title="텍스트-투-이미지 API" icon="wand-sparkles" href="/ko/api-capabilities/nano-banana-image/text-to-image">
    이미지를 생성하기 위한 텍스트 prompt를 입력합니다. 온라인 테스트를 위한 인터랙티브 Playground가 제공됩니다.
  </Card>

  <Card title="이미지 편집 API" icon="image" href="/ko/api-capabilities/nano-banana-image/image-edit">
    편집된 이미지를 생성하기 위해 이미지 + 편집 지침을 업로드합니다. 온라인 테스트를 위한 인터랙티브 Playground가 제공됩니다.
  </Card>
</CardGroup>

## AI 에이전트에게 통합을 맡기기

<Note>
  Codex / Claude Code / Cursor로 빌드한다면, 아래 프롬프트를 복사해 에이전트에게 전달하십시오. 그러면 먼저 이 페이지의 평문 버전을 가져오며(아무 docs URL에나 `.md`를 덧붙이십시오), 그다음 프로젝트의 자체 스택에 맞춰 코드를 작성합니다 — 타임아웃, 방어적 `parts` 파싱, 업로드 압축, 해상도 매개변수는 이미 요구사항에 포함되어 있습니다.
</Note>

<Prompt description="코딩 에이전트에게 Nano Banana Pro 텍스트-이미지 및 이미지 편집을 통합하거나 문제를 해결하게 하십시오. Codex, Claude Code, Cursor 및 유사한 도구에 복사하여 붙여넣으십시오." icon="bot" actions={["copy"]}>
  이 프로젝트에 Nano Banana Pro (`gemini-3-pro-image`) 텍스트-이미지 및 이미지 편집을 통합하거나 문제를 해결하십시오.

  코드를 건드리기 전에 문서를 읽으십시오: 이 페이지의 평문 버전을 가져오려면 [https://docs.apiyi.com/en/api-capabilities/nano-banana-image/overview.md](https://docs.apiyi.com/en/api-capabilities/nano-banana-image/overview.md) 를 가져오십시오. 더 세부적인 매개변수 정보는, 텍스트-이미지 및 이미지 편집 페이지에도 같은 방식으로 `.md`를 덧붙이십시오.

  요구사항:

  1. 타임아웃: `POST https://api.apiyi.com/v1beta/models/gemini-3-pro-image:generateContent`에서 Gemini 네이티브 형식을 호출하십시오. 해상도 단계별로 클라이언트 타임아웃을 설정하십시오: 1K와 2K는 300초, 4K는 **600초**입니다. 이미지 API는 동기식이므로 task ID가 없으며, 클라이언트가 연결을 끊으면 요청은 진행 중이어도 결과는 사라지고 과금은 계속됩니다. 리버스 프록시, 게이트웨이, 서버리스 실행 제한도 모두 늘려야 합니다. 생성 시간보다 짧은 어느 계층이든 요청을 끊어버립니다. Node에서는 undici에 SDK `timeout` 옵션이 커버하지 않는 서로 독립적인 타임아웃 설정이 세 가지 있다는 점에 유의하십시오.

  2. 응답 파싱(**가장 쉽게 잘못하는 단일 항목**): 이미지는 base64이며, `inlineData.data` 안의 `candidates[0].content.parts[]` 아래에 있습니다. 하지만 `parts`는 길이와 순서가 보장되지 않는 **이종 배열**입니다. 텍스트 파트가 먼저 올 수 있으며, 이 경우 이미지가 0이 아니라 1번 인덱스에 있게 됩니다. 따라서 **절대로 `parts[0]`이나 `parts[1]`를 하드코딩하지 마십시오**. 둘 사이를 바꿔도 해결되지 않습니다. 올바른 방법은 `parts`를 순회하면서 `inlineData`가 있는 모든 항목을 필터링하고, 그중 **마지막** 것을 취하는 것입니다(복잡한 작업은 여러 중간 초안을 반환하며, 마지막 것만 최종본입니다). `mimeType`도 `image/png`라고 가정하지 말고 응답에서 읽으십시오. 그런 다음 이미지를 렌더링하고 디스크에 저장하는 동작을 제공하십시오.

  3. 업로드 전에 압축하십시오: 편집의 경우 참조 이미지를 `inlineData` 안에 base64로 전달합니다. 먼저 압축하십시오 — 1.5MB를 넘는 파일만 처리하고, 종횡비를 유지한 채 긴 변을 2048px로 줄이십시오(작은 이미지는 절대 업스케일하지 마십시오), 품질 0.9로 다시 인코딩하고 원본 형식은 유지하십시오. 여러 이미지 요청의 경우 결합된 크기를 6MB 미만으로 유지하십시오. 하드 제한은 이미지당 7MB, 요청당 최대 14장, 업로드당 총 100MB 미만입니다. base64 인코딩은 이 모든 것을 대략 3분의 1 정도 부풀리므로, 여유를 위해 각 이미지를 5MB 미만으로 유지하는 것을 목표로 하십시오. 한 이미지의 압축이 실패하면 원본으로 되돌아가 계속 진행하십시오. 또한 다음을 유의하십시오: **단일 part에는 `text` 또는 `inlineData` 중 하나만 포함될 수 있으며, 둘 다는 아닙니다** — 올바른 구조는 텍스트 part 1개와 이미지 part N개입니다.

  4. 해상도 매개변수: 기본값에 의존하지 말고 `generationConfig.imageConfig.imageSize`(`1K` / `2K` / `4K`, 기본값 `1K`)와 `aspectRatio`(이 페이지에는 합법적인 비율 10개가 나와 있습니다)를 명시적으로 보내십시오. UI에서는 둘 다 드롭다운으로 노출하십시오. 사용자가 4K를 선택하면 타임아웃도 600초로 늘리십시오. 이 모델은 `thinkingConfig`를 지원하지 않으며, `tools`를 통한 Google Search grounding도 지원하지 않으므로 둘 다 보내지 마십시오.

  5. 오류 처리: 콘텐츠 모더레이션이 요청을 차단하더라도 HTTP 상태는 여전히 200이지만, `candidates[0].content.parts`는 비어 돌아옵니다. 먼저 `candidatesTokenCount`가 0인지 확인하고, 그다음 `finishReason`가 `STOP` 이외의 값인지 확인하십시오. `IMAGE_SAFETY`와 같은 차단은 **과금되지 않으며**, 동일한 입력을 한두 번 다시 시도하면 자주 성공합니다 — 그런 자동 재시도를 구현하십시오.

  6. 키는 `APIYI_API_KEY` 환경 변수에서 읽고, `Authorization` 헤더에 `Bearer` 접두사를 붙여 보내십시오. 절대 하드코딩하지 말고, git에 커밋하지 마십시오.

  7. 작업이 끝나면 실제로 텍스트-이미지 호출 한 번과 이미지 편집 호출 한 번을 실행한 다음, 결과와 그 두 호출에 든 비용을 보여주십시오.
</Prompt>

<Accordion title="이 prompt가 막아주는 문제">
  | 요구사항                      | 방지하는 함정                                                                                                                                                                      |
  | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `parts` 인덱스를 절대 하드코딩하지 않음 | 길이와 순서가 보장되지 않으므로 고정 인덱스는 간헐적으로 실패합니다 — 그리고 0과 1 사이를 바꿔도 해결되지 않습니다. [Nano Banana Developer Guide](/ko/api-capabilities/nano-banana-dev-guide)를 참조하십시오                        |
  | 마지막 이미지 part를 취함          | 복잡한 편집 작업은 여러 중간 초안을 반환하며, 마지막 것만 최종본입니다                                                                                                                                     |
  | 해상도별 타임아웃 적용              | 300초 타임아웃에서 4K는 오탐으로 타임아웃됩니다 — 그리고 **연결이 끊긴 요청도 여전히 과금됩니다**. [Image API Essentials & Best Practices](/ko/api-capabilities/image-api-best-practices)를 참조하십시오                  |
  | 업로드 전에 압축                 | 하드 상한은 이미지당 7MB이고 base64는 그것을 대략 3분의 1만큼 부풀리므로, 원본 휴대폰 사진은 쉽게 500을 유발합니다. [Image Compression & Output Resolution](/ko/api-capabilities/image-compression-resolution)를 참조하십시오 |
  | `IMAGE_SAFETY`에서 자동 재시도   | 모더레이션 차단은 이미지 없이 200을 반환하며 과금되지 않습니다. 동일한 재시도는 자주 통과합니다. [Gemini Image Error Handling](/ko/api-capabilities/gemini-image-error-handling)를 참조하십시오                             |
</Accordion>

## APIYI의 Nano Banana Pro를 선택해야 하는 이유는?

**Nano Banana Pro / 2는 APIYI에서 사용량 기준 1위 모델입니다** — 안정적이고, 신뢰할 수 있으며, 빠릅니다. 전문 팀과 함께 작업하고 싶다면 APIYI가 올바른 선택입니다.

엄격한 콘텐츠 안전 제어를 갖춘 Google의 플래그십 모델로서, APIYI가 **신뢰성**, **비용**, **통합** 전반에서 최적화했습니다:

<CardGroup cols={2}>
  <Card title="공식 채널 · Gemini와 동일" icon="shield-check">
    Google의 기본 Gemini API (`/v1beta/models/.../generateContent`)와 OpenAI SDK 패턴과 100% 호환됩니다 — 요청 본문, 응답 필드, 오류 코드가 동일합니다. 코드 수정 없이 마이그레이션할 수 있습니다.
  </Card>

  <Card title="동시 실행 수 제한 없음" icon="infinity">
    Google AI Studio의 RPM/RPD 상한에 묶이지 않습니다. 엔터프라이즈 규모의 배치 생성과 피크 트래픽도 쿼터 중단 없이 선형적으로 확장됩니다.
  </Card>

  <Card title="Google 정가의 31-38%" icon="percent">
    \$0.09/image per-call (vs Google 4K \$0.24). [충전 보너스](/ko/faq/recharge-promotions)와 함께 사용하면 정가의 31.25%까지 낮아집니다 — 4K 절감액은 최대 68.75%입니다.
  </Card>

  <Card title="글로벌 무장벽 액세스" icon="globe">
    **해외 서버나 프록시가 필요 없습니다** — 중국 본토 데이터 센터, 가정용 네트워크 또는 해외 노드에서 `api.apiyi.com`에 직접 연결할 수 있습니다. 안정적인 지연 시간, 국경 간 재구성 불필요.
  </Card>

  <Card title="전체 모델 라인업" icon="layers">
    같은 시리즈는 [Nano Banana 2](/ko/api-capabilities/nano-banana-2-image/overview) (가성비 + Flash 속도), Nano Banana Pro (최고 품질), 그리고 기존 Nano Banana를 모두 포함합니다 — 시나리오에 따라 자유롭게 조합하세요.
  </Card>

  <Card title="전문 엔터프라이즈 지원" icon="handshake">
    저희 팀은 프로덕션 이미지 생성 배포를 전문으로 하며, 모델 선택, 튜닝, 통합에 대한 깊은 경험을 갖추고 있습니다 — PoC부터 프로덕션까지 엔드투엔드 지원을 제공합니다.
  </Card>
</CardGroup>

## 호출 방법

Google의 기본 Gemini API 형식을 사용합니다:

```
POST /v1beta/models/gemini-3-pro-image-preview:generateContent
```

<Tip>
  * ✅ 4K 고해상도(1K / 2K / 4K)를 지원합니다
  * ✅ 선택 가능한 10가지 종횡비를 제공합니다
  * ✅ 업계 최고 수준의 텍스트 렌더링을 제공합니다
  * ✅ 고급 로컬 편집을 지원합니다
  * 📖 Google 공식 API 형식과 완전히 호환됩니다. `ai.google.dev/gemini-api/docs/image-generation`
</Tip>

### 지원되지 않는 기능

<Warning>
  다음 Google 공식 기능은 **지원되지 않으며** APIYI를 통해 사용할 수 없고 별도 과금이 필요합니다:

  * **Grounding with Google Search**: `tools: [{"google_search": {}}]`를 통한 실시간 검색 정보
  * **thinkingConfig** (Thinking 모드): Nano Banana 2에서만 지원되며, Nano Banana Pro에서는 지원되지 않습니다
  * **Image Search Grounding**: Nano Banana 2 전용 기능

  그 외의 모든 이미지 생성 및 편집 기능은 완전히 지원됩니다.
</Warning>

## 가격 비교

| 모델                          | 가격                                   | 장점                          |
| --------------------------- | ------------------------------------ | --------------------------- |
| **Nano Banana Pro** (4K)    | \$0.09/image (\~¥0.52 with bonuses)  | 🔥 4K 지원, 공식 가격의 \~38% 수준   |
| **Nano Banana Pro** (1K-2K) | \$0.09/image (\~¥0.52 with bonuses)  | 🔥 고해상도 출력, 공식 가격의 \~67% 수준 |
| **Nano Banana**             | \$0.025/image (\~¥0.15 with bonuses) | ⭐ 빠른 생성, 공식 가격의 52% 수준      |
| gpt-image-1                 | 더 높음                                 | -                           |
| flux-kontext-pro            | \$0.035/image                        | 동급                          |

<Tip>
  **비용 대비 효과 추천**:

  * **Nano Banana Pro**: 4K 지원, 가장 강한 텍스트 렌더링, 가격은 공식의 \~38-67% 수준입니다
  * **NanoBananaEnterprise**: 고가용성 요구사항을 위한 Enterprise HA 채널을 1.4배 요율(\$0.126/image)로 이용할 수 있습니다
  * **Nano Banana**: 빠른 생성(\~10초), 공식 가격의 52% 수준으로, 일반적인 고품질 이미지 생성에 적합합니다
</Tip>

## 그룹 설정

Nano Banana Pro는 APIYI에서 두 그룹으로 제공됩니다. 대시보드 → **토큰 설정**에서 전환하십시오:

| 그룹                     | 요율   | 사용 시기                                                            |
| ---------------------- | ---- | ---------------------------------------------------------------- |
| `Default`              | 1.0x | 기본 레인, 호출당 \$0.09/이미지; 권장 기본값                                    |
| `NanoBananaEnterprise` | 1.4x | 대체 레인, 호출당 \$0.126/이미지 — 기본 그룹이 빡빡하거나 타임아웃이 급증할 때 수동 전환, 용량 우선순위 |

**왜 1.4x입니까?** 1.4x에서도 가격은 Google 정가의 약 50% 수준으로, 공식 가격보다 훨씬 낮습니다. 이는 높은 동시 실행 수 워크로드와 예기치 않은 업스트림 리스크 제어 이벤트를 위한 대체 레인이며, 기업 고객에게 고가용성 보장을 제공합니다. 기본 그룹이 빡빡할 때는 token을 `NanoBananaEnterprise`로 전환하여 급증을 넘기십시오.

**권장 과금 모델**: `Pay-as-you-go Priority`를 선택하십시오 — Nano Banana Pro의 호출당 과금과 Nano Banana 2의 token 기반 과금을 모두 포함하며, **시리즈 전체에 대해 token 하나**입니다.

<Frame caption="Token settings: Billing model = Pay-as-you-go Priority, primary group = Default, fallback group = NanoBananaEnterprise (1.4x)">
  <img src="https://mintcdn.com/apiyillc/EyWjOyg5fLaMGReJ/images/nano-banana-enterprise-token-setup-20260506.png?fit=max&auto=format&n=EyWjOyg5fLaMGReJ&q=85&s=cf85cd8ddaaa541ebbd970a52a98c68f" alt="토큰 생성 UI: 과금 모델 '종량제 우선순위'는 NB Pro 호출당 과금 + NB2 token 기반 과금을 포함합니다; 기본 그룹 Default + 대체 그룹 NanoBananaEnterprise (1.4x 레인)" width="1270" height="1052" data-path="images/nano-banana-enterprise-token-setup-20260506.png" />
</Frame>

<Tip>
  **더 나아가**: 토큰이 다른 이미지 모델(예: GPT-image-2)도 포함한다면, 더 안정적인 `Default`를 기본 그룹으로 두고 `NanoBananaEnterprise`을 대체 슬롯에 넣으십시오 — 기본 그룹의 429는 token 교체 없이 자동으로 엔터프라이즈 그룹으로 페일오버됩니다.
</Tip>

## 호환성 참고 사항

이전에 다음 모델을 사용했다면, 모델 이름만 간단히 바꾸시면 됩니다.

### 최신 버전으로 업그레이드

* 모든 이전 버전 → `gemini-3-pro-image-preview` (🔥 추천, Nano Banana Pro)
  * 4K 고해상도 출력을 지원합니다
  * 가장 강력한 텍스트 렌더링 기능을 제공합니다
  * 로컬 편집 기능

### 안정 버전 사용

* `gpt-4o-image` → `gemini-2.5-flash-image`
* `sora_image` → `gemini-2.5-flash-image`
* Old Nano Banana → `gemini-2.5-flash-image`

원활한 전환을 위해 다른 파라미터는 그대로 유지하십시오.

## 지원되는 해상도 및 종횡비

### 출력 해상도

Nano Banana Pro는 3개의 해상도 티어인 1K, 2K, 4K를 지원합니다(512px 티어는 Nano Banana 2 전용입니다).

| 해상도 | 설명       | 권장 용도           |
| --- | -------- | --------------- |
| 1K  | 기본값      | 소셜 미디어, 웹 표시    |
| 2K  | HD       | HD 디스플레이, 인쇄물   |
| 4K  | Ultra HD | 전문 디자인, 상업용 포스터 |

### 종횡비별 출력 크기(픽셀)

아래 표는 Google 공식 문서를 기준으로 1K / 2K / 4K 해상도 티어 전반의 모든 10개 종횡비에 대한 Nano Banana Pro의 실제 출력 크기를 나열합니다. 요청에서는 비율에 `aspect_ratio`을, 티어에는 `image_size`(또는 `resolution`)을 설정합니다.

| 종횡비      | 1K        | 2K        | 4K        |
| -------- | --------- | --------- | --------- |
| **1:1**  | 1024×1024 | 2048×2048 | 4096×4096 |
| **2:3**  | 848×1264  | 1696×2528 | 3392×5056 |
| **3:2**  | 1264×848  | 2528×1696 | 5056×3392 |
| **3:4**  | 896×1200  | 1792×2400 | 3584×4800 |
| **4:3**  | 1200×896  | 2400×1792 | 4800×3584 |
| **4:5**  | 928×1152  | 1856×2304 | 3712×4608 |
| **5:4**  | 1152×928  | 2304×1856 | 4608×3712 |
| **9:16** | 768×1376  | 1536×2752 | 3072×5504 |
| **16:9** | 1376×768  | 2752×1536 | 5504×3072 |
| **21:9** | 1584×672  | 3168×1344 | 6336×2688 |

<Info>
  `1:4`, `4:1`, `1:8`, `8:1`의 초세로/초가로 비율 또는 512px 저해상도 티어가 필요하면 [Nano Banana 2](/ko/api-capabilities/nano-banana-2-image/overview)를 사용하십시오(14개 종횡비 + 512px).
</Info>

## FAQ

<AccordionGroup>
  <Accordion title="Nano Banana 2와 Pro 중 무엇을 선택해야 합니까?">
    **최고의 가성비를 원하시면** **Nano Banana 2**를 선택하십시오 (`gemini-3.1-flash-image-preview`):

    * Pro 수준의 품질 + Flash급 속도
    * 사용한 만큼 결제, 이미지당 \$0.025까지
    * 14개의 종횡비(Pro보다 4개 더 많음)
    * 전용 기능: 추론 모드, 이미지 검색 그라운딩

    **최고의 품질을 원하시면** **Nano Banana Pro**를 선택하십시오 (`gemini-3-pro-image-preview`):

    * 최고 수준의 충실도
    * \$0.09/request

    자세한 내용은 [Nano Banana 2 문서](/ko/api-capabilities/nano-banana-2-image/overview)를 참조하십시오.
  </Accordion>

  <Accordion title="Pro 버전과 레거시 버전 중 무엇을 선택해야 합니까?">
    **새 프로젝트에 권장: Nano Banana Pro** (`gemini-3-pro-image-preview`)

    ✅ **Pro 버전의 장점**:

    * 4K 초고해상도(1K, 2K, 4K) 지원
    * 업계 최고 수준의 텍스트 렌더링 품질
    * 고급 로컬 편집 기능
    * 공식 과금의 약 38\~67%만 부담

    ⚡ **레거시 버전** (`gemini-2.5-flash-image`)은 다음에 적합합니다:

    * 예산에 민감한 시나리오(\~\$0.025/image vs \$0.09/image)
    * 빠른 생성이 필요한 경우(10초 vs 20초)
    * 기존 프로젝트 마이그레이션
  </Accordion>

  <Accordion title="다른 이미지 모델에서 Nano Banana로 전환하려면 어떻게 해야 합니까?">
    모델 이름을 `gpt-4o-image` 또는 `sora_image`에서 `gemini-3-pro-image-preview`(권장 Pro) 또는 `gemini-2.5-flash-image`(레거시)로 간단히 변경하기만 하면 되며, 다른 매개변수는 그대로 유지합니다.
  </Accordion>

  <Accordion title="생성된 이미지는 어떤 형식입니까?">
    모델은 base64로 인코딩된 이미지 데이터를 반환하며, 일반적으로 PNG 또는 JPEG 형식입니다. 코드는 형식을 자동으로 감지해 해당 파일 형식으로 저장합니다.
  </Accordion>

  <Accordion title="이미지 편집 기능을 지원합니까?">
    예, Nano Banana Pro는 이미지 생성과 편집을 모두 지원합니다. [이미지 편집 API 레퍼런스](/ko/api-capabilities/nano-banana-image/image-edit)를 참조하십시오.
  </Accordion>

  <Accordion title="connection reset by peer / write_response_body_failed (500)가 왜 발생합니까?">
    전체 오류는 다음과 같습니다:

    ```text theme={null}
    [&{{write tcp ip:port->ip:port: write: connection reset by peer Unknown error shell_api_error  write_response_body_failed} 500 }]
    ```

    이는 **대개 너무 큰 이미지 업로드로 인해 발생합니다 — 요청 본문이 너무 커져 연결이 끊어집니다**. 다음 모범 사례를 따르십시오:

    * **이미지 수를 제한하십시오**: 공식 규칙(프롬프트당 최대 14개 이미지) 안에서 유지하십시오 — 참조 이미지를 너무 많이 넣지 마십시오.
    * **이미지별 크기를 제한하십시오**: 각 이미지를 5MB 이하로 유지하십시오 — 공식 이미지별 상한은 7MB이며, base64 인코딩은 크기를 대략 1/3 늘리므로 여유를 남겨 두십시오.
    * **업로드 전에 프런트엔드에서 압축하십시오**: 이미지를 API로 보내기 전에 프런트엔드(또는 서버 측 릴레이)에서 압축하십시오 — 일반적으로 가장 긴 변의 길이를 제한하고, JPEG/WebP로 변환하며, quality 파라미터를 조정합니다.
    * **URL 입력으로 전환하십시오**: Gemini 네이티브 형식은 `fileData.fileUri`를 통해 이미지 URL 전달을 지원하므로, 지나치게 큰 base64 요청 본문을 완전히 피할 수 있습니다 — [Nano Banana Dev Guide](/ko/api-capabilities/nano-banana-dev-guide)를 참조하십시오.
  </Accordion>
</AccordionGroup>

## 관련 문서

* [Nano Banana 2 이미지 생성](/ko/api-capabilities/nano-banana-2-image/overview)
* [Nano Banana 가격](/ko/api-capabilities/nano-banana-pricing)
* [기타 이미지 생성 모델](/en/api-capabilities/gpt-image-1)
* [API 사용 매뉴얼](/ko/api-manual)
