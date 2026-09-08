> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Lite 이미지 생성/편집

> Google의 가장 빠르고 가장 효율적인 이미지 모델 Nano Banana 2 Lite (gemini-3.1-flash-lite-image) - 이미지당 약 ~4초, Nano Banana 2보다 약 ~2.7배 빠르며, 1K 캔버스 + 14개 종횡비에 초점을 맞춥니다. APIYI token 기반 평균은 실제로 호출당 약 ~$0.018이며(Google 요금의 40%), 호출당 $0.025입니다.

## 개요

**Nano Banana 2 Lite** (이 섹션에서는 **Nano Banana Lite**로 줄여서 표기합니다)는 2026년 6월 30일에 출시된 Google 이미지 모델로, 모델 ID는 `gemini-3.1-flash-lite-image`입니다. 이는 Nano Banana 2(`gemini-3.1-flash-image`)의 **경량, 경제형 버전**으로, **속도와 비용**에 중점을 둡니다: 이미지당 약 4초, Nano Banana 2보다 약 **2.7배 빠르며**, Nano Banana 시리즈에서 **가장 빠르고 가장 저렴한** 등급입니다.

<Note>
  **🍌 2026년 6월 30일 출시**: Nano Banana 2 Lite가 서비스를 시작했습니다! 이미지당 약 4초, Nano Banana 2보다 약 2.7배 빠르며, 1K 캔버스 + 14개 화면 비율에 중점을 두고, SynthID 보이지 않는 워터마크가 내장되어 있습니다. APIYI는 이를 즉시 서비스에 올렸습니다 — 토큰 기반 **실사용 평균은 약 \$0.018/호출입니다**(Google 요율의 40%), 호출당 \$0.025 — 높은 동시 실행 수, 낮은 비용, 빠른 반복 작업을 위해 설계되었습니다.
</Note>

<Warning>
  **임시 가격**: 이 모델은 방금 출시되었으며 현재 가격은 임시입니다. 최종 가격은 나중에 조정될 수 있습니다. 변경 사항이 있으면 공지하겠습니다 — 플랫폼의 실시간 가격을 참고하십시오.
</Warning>

<Info>
  모든 image API는 **동기식**입니다 — 폴링할 task ID가 없으며, 클라이언트가 연결을 끊으면 요청은 여전히 과금되지만 결과는 유실됩니다. 이 모델에는 충분히 긴 타임아웃을 설정하십시오. [Image API Essentials & Best Practices](/ko/api-capabilities/image-api-best-practices)를 참조하십시오.
</Info>

<CardGroup cols={2}>
  <Card title="텍스트-투-이미지 API" icon="wand-sparkles" href="/ko/api-capabilities/nano-banana-lite-image/text-to-image">
    텍스트 prompt로 이미지를 생성합니다. 온라인 테스트를 위한 대화형 플레이그라운드가 포함되어 있습니다.
  </Card>

  <Card title="이미지 편집 API" icon="image" href="/ko/api-capabilities/nano-banana-lite-image/image-edit">
    이미지와 편집 지침을 업로드하여 새 이미지를 생성합니다. 대화형 플레이그라운드가 포함되어 있습니다.
  </Card>
</CardGroup>

## AI 에이전트에게 통합을 맡기십시오

<Note>
  Codex / Claude Code / Cursor로 개발한다면 아래 프롬프트를 복사해 에이전트에게 넘기십시오. 에이전트는 먼저 이 페이지의 일반 텍스트 버전을 가져오고(아무 docs URL 뒤에나 `.md`를 붙이십시오), 그다음 프로젝트 자체 스택으로 코드를 작성합니다 — 타임아웃, 방어적 `parts` 파싱, 업로드 압축, 그리고 Lite가 1K 전용이라는 사실은 이미 요구사항에 반영되어 있습니다.
</Note>

<Prompt description="코딩 에이전트가 Nano Banana Lite 텍스트-투-이미지 및 이미지 편집을 통합하거나 문제를 해결하도록 하십시오. Codex, Claude Code, Cursor 및 유사한 도구에 복사해 붙여넣으십시오." icon="bot" actions={["copy"]}>
  이 프로젝트에서 Nano Banana Lite (`gemini-3.1-flash-lite-image`) 텍스트-투-이미지 및 이미지 편집을 통합하거나 문제를 해결하십시오.

  코드를 건드리기 전에 문서를 읽으십시오: 이 페이지의 일반 텍스트 버전을 가져오려면 [https://docs.apiyi.com/en/api-capabilities/nano-banana-lite-image/overview.md](https://docs.apiyi.com/en/api-capabilities/nano-banana-lite-image/overview.md) 를 가져오십시오. 더 세밀한 파라미터 세부 정보는 텍스트-투-이미지 및 이미지 편집 페이지에도 같은 방식으로 `.md`를 붙이십시오.

  요구사항:

  1. 타임아웃: `POST https://api.apiyi.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent`에서 Gemini 네이티브 형식을 호출하고 클라이언트 타임아웃을 300초로 설정하십시오. 이 모델은 보통 약 4초 안에 이미지를 반환합니다. 300초는 피크 혼잡을 위한 여유분이므로, **빠르다는 이유만으로 타임아웃을 몇십 초 수준으로 줄이지 마십시오**. 이미지 API는 동기식입니다 — 작업 ID가 없으므로, 클라이언트가 끊기면 요청은 아직 과금되는 동안 결과를 잃게 됩니다. 리버스 프록시, 게이트웨이, 서버리스 실행 제한도 모두 넉넉하게 늘려야 합니다.

  2. 응답 파싱(**가장 쉽게 틀리는 부분입니다**): 이미지는 base64이며, `inlineData.data` 아래의 `candidates[0].content.parts[]` 안에 있습니다. 하지만 `parts`는 길이와 순서가 보장되지 않는 **이질적 배열**입니다 — 텍스트 부분이 먼저 올 수 있어서 이미지가 0번이 아니라 1번 인덱스에 있을 수 있습니다. 따라서 **`parts[0]`나 `parts[1]`를 하드코딩하지 마십시오**; 둘 사이를 바꿔 쓰는 것으로는 해결되지 않습니다. 올바른 접근은 다음과 같습니다: `parts`를 순회하면서 `inlineData`를 가진 모든 항목을 필터링하고, 그중 **마지막** 항목을 사용하십시오. 응답에서 `mimeType`도 `image/png`라고 가정하지 말고 읽어 오십시오. 그런 다음 이미지를 렌더링하고 디스크 저장 액션을 제공하십시오.

  3. 업로드 전에 압축하십시오: 편집의 경우 참조 이미지를 `inlineData` 안의 base64로 전달합니다(`image/png`와 `image/jpeg`가 지원됩니다). 먼저 압축하십시오 — 1.5MB를 초과하는 파일만 처리하고, 종횡비를 유지한 채 긴 변을 2048px로 줄이며(작은 이미지는 절대 확대하지 마십시오), 품질 0.9로 다시 인코딩하고 원본 형식을 유지하십시오. 다중 이미지 요청에서는 합산 크기를 6MB 미만으로 유지하십시오. base64 인코딩은 이 모든 것을 대략 3분의 1 정도 부풀리므로, 원본 휴대폰 사진을 그대로 보내지 마십시오. 이미지 하나의 압축에 실패하면 원본으로 되돌려 계속 진행하십시오. 또한 다음을 유의하십시오: **하나의 part에는 `text` 또는 `inlineData` 중 하나만 들어갈 수 있으며, 둘 다는 불가합니다** — 올바른 구조는 텍스트 part 하나와 N개의 이미지 part입니다.

  4. 해상도 파라미터: Lite에서는 `generationConfig.imageConfig.imageSize`가 **`1K`만** 허용합니다 — `2K`나 `4K`를 보내면 오류가 발생합니다. Nano Banana 2에서 코드를 이식하는 경우, 해당 값들을 반드시 제거하십시오. `aspectRatio`는 이 페이지에 나열된 14개 비율을 지원합니다. 기본값에 의존하지 말고 명시적으로 보내십시오. UI에는 해상도 드롭다운이 아니라 종횡비 드롭다운만 있으면 됩니다.

  5. 오류 처리: 콘텐츠 모더레이션이 요청을 차단하면 HTTP 상태는 여전히 200이지만, `candidates[0].content.parts`는 비어 있습니다. 먼저 `candidatesTokenCount`가 0인지 확인한 다음, `finishReason`가 `STOP`와 다른지 확인하십시오. `IMAGE_SAFETY` 같은 차단은 **과금되지 않으며**, 동일한 입력을 한두 번 다시 시도하면 종종 성공합니다 — 이 자동 재시도를 구현하십시오.

  6. `APIYI_API_KEY` 환경 변수에서 키를 읽고 `Bearer` 접두사가 붙은 `Authorization` 헤더로 보내십시오. 절대 하드코딩하지 말고, 절대 git에 커밋하지 마십시오.

  7. 모두 끝나면 실제로 텍스트-투-이미지 호출 하나와 이미지 편집 호출 하나를 실행한 뒤, 결과와 두 호출의 비용을 저에게 보여주십시오.
</Prompt>

<Accordion title="이 프롬프트가 막아 주는 문제들">
  | 요구사항                      | 방지하는 함정                                                                                                                                                                                       |
  | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `imageSize`를 `1K`로만 설정    | Lite는 단일 티어이므로 Nano Banana 2에서 이식하면서 `2K` / `4K`를 그대로 두면 오류가 발생합니다                                                                                                                            |
  | `parts` 인덱스를 절대 하드코딩하지 않기 | 길이와 순서가 보장되지 않으므로 고정 인덱스는 간헐적으로 실패합니다. [Nano Banana 개발 가이드](/ko/api-capabilities/nano-banana-dev-guide)를 참고하십시오                                                                               |
  | 타임아웃을 여전히 300초로 유지        | 보통 4초라는 지연 시간 때문에 타임아웃을 지나치게 작게 잡기 쉬운데, 그러면 피크 혼잡 시 오탐으로 발동합니다 — 그리고 **연결이 끊긴 요청도 여전히 과금됩니다**. [Image API Essentials & Best Practices](/ko/api-capabilities/image-api-best-practices)를 참고하십시오 |
  | 업로드 전에 압축하기               | base64 인코딩은 페이로드를 대략 3분의 1 정도 부풀리므로, 원본 휴대폰 사진은 모든 요청을 느리게 만듭니다. [Image Compression & Output Resolution](/ko/api-capabilities/image-compression-resolution)을 참고하십시오                           |
  | `IMAGE_SAFETY`에 대한 자동 재시도 | 모더레이션 차단은 이미지 없이 200을 반환하며 과금되지 않습니다. 동일한 재시도는 종종 통과합니다. [Gemini Image Error Handling](/ko/api-capabilities/gemini-image-error-handling)을 참고하십시오                                              |
</Accordion>

## APIYI의 Nano Banana Lite를 사용하는 이유는 무엇입니까?

**APIYI에서 사용량 기준 1위 모델은 Nano Banana Pro / 2입니다** — 안정적이고 신뢰할 수 있으며 빠릅니다. Lite 티어는 “빠름”과 “저렴함”을 새로운 수준으로 끌어올려 고처리량 시나리오에 이상적입니다. APIYI는 **신뢰성**, **비용**, **통합** 전반에서 경험을 깊게 최적화합니다:

<CardGroup cols={2}>
  <Card title="공식 채널 · Gemini와 동일" icon="shield-check">
    Google의 기본 Gemini API (`/v1beta/models/.../generateContent`) 및 OpenAI SDK 패턴과 100% 호환됩니다 — 요청 본문, 응답 필드, 오류 코드가 동일합니다. 코드 변경 없는 마이그레이션입니다.
  </Card>

  <Card title="동시 실행 수 제한 없음" icon="infinity">
    Google AI Studio의 RPM/RPD 상한에 구애받지 않습니다. 엔터프라이즈 규모의 배치 생성과 피크 트래픽도 쿼터 중단 없이 선형적으로 확장됩니다.
  </Card>

  <Card title="token 기반 ~\$0.018/호출" icon="percent">
    **실제로 token 기반 평균은 \~\$0.018/호출입니다** (Google 요금의 40%: 입력 \$0.10 / 출력 100만 tokens당 \$12), 호출당 \$0.025/이미지보다 저렴합니다(Google은 약 \$0.034). [충전 보너스](/ko/faq/recharge-promotions)와 함께 사용하면 비용을 더 낮출 수 있습니다.
  </Card>

  <Card title="전 세계 장벽 없는 접근" icon="globe">
    **해외 서버나 프록시가 필요 없습니다** — 본토 데이터 센터, 가정용 네트워크 또는 해외 노드에서 `api.apiyi.com`에 직접 연결할 수 있습니다. 안정적인 지연 시간, 국경 간 아키텍처 재설계 불필요.
  </Card>

  <Card title="전체 모델 라인업" icon="layers">
    같은 시리즈는 [Nano Banana Pro](/ko/api-capabilities/nano-banana-image/overview) (궁극의 품질), [Nano Banana 2](/ko/api-capabilities/nano-banana-2-image/overview) (품질 + 속도), 그리고 Nano Banana 2 Lite (가장 빠르고 가장 저렴함)까지 포함합니다 — 시나리오에 따라 조합해 사용하십시오.
  </Card>

  <Card title="전문 엔터프라이즈 지원" icon="handshake">
    저희 팀은 프로덕션 이미지 생성 배포를 전문으로 하며, 모델 선택, 튜닝, 통합에 대한 깊은 경험을 보유하고 있습니다 — PoC부터 프로덕션까지 엔드투엔드 지원을 제공합니다.
  </Card>
</CardGroup>

## 핵심 기능

<CardGroup cols={2}>
  <Card title="~4s per 이미지" icon="gauge">
    이미지당 \~4초로, Nano Banana 2보다 약 2.7배 빠르며 높은 동시 실행 수와 빠른 반복 작업에 맞게 설계되었습니다
  </Card>

  <Card title="저비용" icon="hand-coins">
    token 기반 평균은 실제로 \~\$0.018/call이며(google 요율의 40%), 호출당 \$0.025보다 저렴합니다 — 비용에 민감한 이미지별 워크로드에 이상적입니다
  </Card>

  <Card title="14개 종횡비" icon="maximize">
    `1:1`, `4:1`, `1:4`, `16:9`, `9:16`을 포함한 14개의 비율을 지원합니다 — 다양한 레이아웃에 적합합니다
  </Card>

  <Card title="SynthID 워터마크" icon="shield-check">
    출력에는 보이지 않는 SynthID 디지털 워터마크가 포함되어 있으며 — 육안으로 보이지 않고 사용에 영향을 주지 않습니다
  </Card>
</CardGroup>

## 버전 비교

| 기능       | **Nano Banana 2 Lite**        | Nano Banana 2            | Nano Banana Pro      |
| -------- | ----------------------------- | ------------------------ | -------------------- |
| 모델 ID    | `gemini-3.1-flash-lite-image` | `gemini-3.1-flash-image` | `gemini-3-pro-image` |
| 포지셔닝     | 가장 빠름 / 가장 저렴함                | 품질 + 속도                  | 궁극의 품질               |
| 품질       | ⭐⭐⭐⭐ 우수                       | ⭐⭐⭐⭐⭐ Pro급               | ⭐⭐⭐⭐⭐ 최고             |
| 속도       | 🚀 \~4초                       | ⚡ 빠름                     | 🐢 더 느림              |
| 최대 해상도   | 1K                            | 4K                       | 4K                   |
| 가로세로 비율  | 14                            | 14                       | 10                   |
| APIYI 가격 | **\$0.025/image**             | \$0.055/image            | \$0.09/image         |

<Tip>
  **선택 가이드**:

  * ⚡ **가성비 최고 / 빠른 배치 생성** → Nano Banana 2 Lite (이미지당 \~4초, 호출당 \$0.025)
  * 🔥 **2K/4K HD 또는 더 강한 품질이 필요함** → Nano Banana 2 (Pro급 품질 + Flash급 속도)
  * 🎨 **궁극의 품질** → Nano Banana Pro (최고 수준의 충실도)
</Tip>

## 과금

<Info>
  **과금 모드 선택**: Nano Banana 2 Lite는 API token을 생성할 때 “과금 모델” 설정에서 선택하는 두 가지 과금 모드를 지원합니다:

  * **Pay-as-you-go** 또는 **Pay-as-you-go Priority** 선택 → token 기반 과금
  * **Pay-per-request** 또는 **Pay-per-request Priority** 선택 → 호출당 과금
  * ⚠️ **Hybrid 과금은 선택하지 마십시오**
</Info>

### Token 기반 과금(권장 · Google 공식 요율의 40％)

| 과금 항목 | Google 공식        | APIYI                | 할인      |
| ----- | ---------------- | -------------------- | ------- |
| 입력    | \$0.25/M tokens  | **\$0.10/M tokens**  | **40%** |
| 출력    | \$30.00/M tokens | **\$12.00/M tokens** | **40%** |

<Info>
  **예측 가능한 실제 단가**: token 기반(토큰당) 과금에서는 1K 이미지의 **실제 평균 비용이 호출당 약 \$0.018**입니다(일반적인 범위는 출력 token에 따라 \$0.016–\$0.019 정도입니다). 이는 정액 호출당 \$0.025/image보다 저렴하며, 단가가 안정적이고 예측 가능합니다.
</Info>

### 호출당 과금

| 모델                                                   | APIYI 과금          | Google 공식       | 비고                                     |
| ---------------------------------------------------- | ----------------- | --------------- | -------------------------------------- |
| **Nano Banana 2 Lite** `gemini-3.1-flash-lite-image` | **\$0.025/image** | \~\$0.034/image | 정액 요금입니다. 나중에 인하될 수 있지만 현재는 변경되지 않았습니다 |

<Tip>
  **💰 어떤 과금 모드가 좋습니까? `Pay-as-you-go Priority`를 우선하십시오.** token 기반(토큰당) 과금은 실제로 호출당 약 \$0.018 수준으로 동작하여, 예측 가능한 단가를 제공하면서 호출당 \$0.025보다 저렴합니다. 그리고 token의 과금 모델을 `Pay-as-you-go Priority`로 설정하면, **하나의 token으로 Nano Banana Pro / 2의 호출당 과금도 처리됩니다** — 하나의 token으로 전체 시리즈를 운영할 수 있습니다. 호출당 \$0.025/image는 **나중에 인하될 수 있지만 현재는 변경되지 않는** 정액 요금입니다 — 플랫폼의 실시간 가격을 참고하십시오. 충전 보너스까지 더하면 실제 비용은 더 낮아집니다.
</Tip>

<Warning>
  이 모델은 막 출시되었으며 현재 가격은 잠정적입니다. 최종 가격은 나중에 조정될 수 있습니다(호출당 \$0.025/image는 나중에 인하될 수 있습니다). 변경 사항이 있으면 공지하겠습니다 — 플랫폼의 실시간 가격을 참고하십시오.
</Warning>

## 그룹 설정

Nano Banana 2 Lite는 APIYI의 기본 채널에서 동작합니다. 별도의 그룹은 필요하지 않습니다:

| 그룹        | 요율 배수 | 사용 시점                   |
| --------- | ----- | ----------------------- |
| `Default` | 1.0x  | 기본 레인, 가격표와 일치함; 권장 기본값 |

**권장 과금 모델: 기본값으로 `Pay-as-you-go Priority`을 선택하십시오.** 이유는 세 가지입니다. ① token 기반(토큰당) 과금은 실제로 호출당 약 \$0.018로, 호출당 \$0.025보다 저렴합니다. ② 단가가 안정적이고 예측 가능합니다. ③ 한 token으로 **Lite / Nano Banana 2 token 기반 과금과 Nano Banana Pro 호출당 과금을 모두 커버합니다** — 하나의 token으로 전체 시리즈를 운영할 수 있습니다.

## 지원되는 해상도 및 종횡비

### 출력 해상도

| 해상도 | 설명               | 권장 용도                      |
| --- | ---------------- | -------------------------- |
| 1K  | 유일한 등급(2K/4K 없음) | 소셜 이미지, 썸네일, 초안 미리보기, 웹 표시 |

<Info>
  Nano Banana 2 Lite는 **1K 캔버스**에 초점을 맞추며 2K/4K를 지원하지 않습니다. 더 높은 해상도나 더 나은 품질이 필요하면 [Nano Banana 2](/ko/api-capabilities/nano-banana-2-image/overview)(최대 4K) 또는 [Nano Banana Pro](/ko/api-capabilities/nano-banana-image/overview)로 전환하십시오.
</Info>

### 지원되는 종횡비(총 14개)

`1:1`, `1:4`, `4:1`, `1:8`, `8:1`, `2:3`, `3:2`, `3:4`, `4:3`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9`

### 종횡비별 출력 크기(1K, 픽셀)

요청에서 `aspectRatio`을 비율로 설정하고 `imageSize`은 `1K`으로 유지하십시오:

| 종횡비      | 1K 출력     |
| -------- | --------- |
| **1:1**  | 1024×1024 |
| **1:4**  | 512×2048  |
| **1:8**  | 384×3072  |
| **2:3**  | 848×1264  |
| **3:2**  | 1264×848  |
| **3:4**  | 896×1200  |
| **4:1**  | 2048×512  |
| **4:3**  | 1200×896  |
| **4:5**  | 928×1152  |
| **5:4**  | 1152×928  |
| **8:1**  | 3072×384  |
| **9:16** | 768×1376  |
| **16:9** | 1376×768  |
| **21:9** | 1584×672  |

## FAQ

<AccordionGroup>
  <Accordion title="Nano Banana 2 Lite와 Nano Banana 2의 차이점은 무엇입니까?">
    둘 다 Google의 Gemini 3.1 Flash series를 기반으로 하며; **Lite**는 **경량의 경제적인 버전**입니다:

    * ✅ **속도**: Lite는 약 4초에 생성되며, Nano Banana 2보다 약 2.7배 빠릅니다
    * ✅ **가격**: Lite의 token 기반 평균은 실제로 약 \$0.018/호출이며(Google 요율의 40%), 호출당 \$0.025입니다 — 대량 처리에 더 적합합니다
    * ⚠️ **해상도**: Lite는 1K만 지원하며, Nano Banana 2는 최대 4K까지 지원합니다
    * ⚠️ **품질 상한**: 최고 품질이 필요하다면 Nano Banana 2 / Pro가 더 좋습니다

    Nano Banana 2에서 마이그레이션하려면 모델 이름만 변경하면 됩니다(Lite는 1K만 지원한다는 점에 유의하십시오): `gemini-3.1-flash-image`을 `gemini-3.1-flash-lite-image`로 바꾸십시오.
  </Accordion>

  <Accordion title="Lite와 Nano Banana 2 중 무엇을 선택해야 합니까?">
    * **최고의 가성비 / 빠른 배치 생성 / 1K로 충분함** → **Lite** 선택(\~4초, 호출당 \$0.025)
    * **2K/4K HD가 필요하거나 더 높은 품질이 필요함** → **Nano Banana 2** 선택(최대 4K, Pro 수준의 품질)

    두 모델의 코드는 동일하며 모델 이름만 다르므로, 언제든지 전환하여 테스트할 수 있습니다.
  </Accordion>

  <Accordion title="이미지 생성에는 얼마나 걸립니까?">
    Nano Banana 2 Lite는 속도를 위해 설계되었습니다 — **1K 해상도에서 약 4초**입니다. 다만, 간헐적인 지연과 피크 혼잡을 처리할 수 있도록 클라이언트 timeout은 더 길게 설정하십시오(예: 300초).
  </Accordion>

  <Accordion title="동시 실행 수 제한이 있습니까?">
    **API에는 동시 실행 수 제한이 없으며 순차적으로 처리하지도 않습니다.** 사용자가 직접 동시 요청을 안전하게 보낼 수 있으며, 요청이 대기열에 쌓이거나 서로를 차단하지 않습니다. Google AI Studio와 달리 APIYI 채널에는 하드 RPM/RPD 제한이 없으므로, 엔터프라이즈 배치 생성과 피크 트래픽이 선형적으로 확장됩니다.

    실제로 중요한 것은 `timeout`입니다. Lite는 빠르지만, 단일 요청도 피크 혼잡 시 느려질 수 있으므로 클라이언트 timeout을 300초로 설정하십시오.
  </Accordion>

  <Accordion title="어떤 입력 이미지 형식이 지원됩니까?">
    이미지 편집의 경우, `image/png` 및 `image/jpeg`가 base64 인코딩을 통해 지원됩니다. [이미지 편집 API 레퍼런스](/ko/api-capabilities/nano-banana-lite-image/image-edit)를 참조하십시오.
  </Accordion>

  <Accordion title="출력 이미지에 워터마크가 있습니까?">
    모든 출력 이미지에는 SynthID 보이지 않는 디지털 워터마크(Google의 AI 생성 콘텐츠 식별 기술)가 포함되며, 육안으로는 보이지 않고 사용에도 영향을 주지 않습니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

* [Nano Banana 2 이미지 생성](/ko/api-capabilities/nano-banana-2-image/overview) - 품질 + 속도 등급, 최대 4K
* [Nano Banana Pro 이미지 생성](/ko/api-capabilities/nano-banana-image/overview) - 최고 품질의 플래그십
* [이미지 생성 비교 테스트](https://imagen.apiyi.com/)
* [API 사용 설명서](/ko/api-manual)

<Info>
  Nano Banana 2 Lite가 막 출시되었습니다. 기능과 가격은 조정될 수 있습니다. 최신 정보는 문서 업데이트를 따라주시기 바랍니다.
</Info>
