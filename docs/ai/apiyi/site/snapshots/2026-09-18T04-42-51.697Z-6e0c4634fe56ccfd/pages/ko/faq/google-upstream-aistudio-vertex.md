> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Google 모델은 AI Studio에서 실행됩니까, 아니면 Vertex에서 실행됩니까?

> APIYI의 Nano Banana 및 기타 Google 이미지 모델은 기본적으로 공식 AI Studio에서 실행되며, Vertex는 AI Studio 장애 시 대신 동작하는 별도의 컴퓨트 풀입니다. 두 시스템은 중복 채널로 작동합니다. 이 문서에서는 검증 가능한 사실과 전환 경로를 정리합니다.

## 간단한 답변

**Nano Banana와 다른 Google 모델은 기본적으로 “공식 AI Studio”에서 실행됩니다. Vertex는 AIStudio에 문제가 생길 때 이를 대신하는 별도의 컴퓨트 풀입니다. 두 채널은 서로 대체 관계가 아니라 중복 구성입니다.**

<Info>
  이 문서는 공식 문서나 실시간 상태 기록으로 검증할 수 있는 사실만 나열합니다. 스케줄링 로직, 상위 컴퓨트 풀 용량, 또는 당사 문서에서 다루지 않는 내용의 세부사항이 필요하시면 지원팀에 문의해 주십시오.
</Info>

## 기본 그룹 = 공식 AI Studio

Nano Banana가 2025년 11월에 출시된 이후, APIYI는 `gemini-3-pro-image` (Nano Banana Pro), `gemini-3.1-flash-image` (Nano Banana 2), 그리고 lite 시리즈를 **오직 공식 AI Studio를 통해서만** 라우팅해 왔습니다 — 리버스 엔지니어링 경로는 절대 사용하지 않습니다([실시간 업데이트 · 2026-07](/en/live/2026-07/nano-banana-pro-2-official-aistudio) 참조).

<Tip>
  **"공식 AI Studio"를 강조하는 이유**: Nano Banana의 가격이 Google의 공식 요율보다 훨씬 낮다고 해서 리버스 엔지니어링을 의미하는 것은 아닙니다 — 가격 우위는 Google 인증을 우회해서가 아니라, 통합 스케줄링과 FX 환율에서 나옵니다.
</Tip>

기본 그룹에서는 대부분의 경우 별도 설정 없이 **직접 호출**할 수 있습니다.

## Vertex는 어디에 있습니까? 어떻게 활성화합니까?

Vertex(Google Cloud의 엔터프라이즈급 채널)는 **별도의 컴퓨트 풀**로 동작하며 APIYI에서는 독립적인 그룹으로 제공됩니다 — 토큰을 생성하거나 편집할 때 이를 선택하십시오. 대시보드에 표시되는 정확한 그룹 이름이 기준입니다.

<Note>
  **출력 파일 크기 정보**: Vertex의 4K 출력은 AI Studio의 출력보다 큽니다 — **Vertex ≈ 이미지당 20 MB, AI Studio ≈ 10 MB**. 다운로드, 저장소 및 CDN 대역폭 용량은 20 MB를 상한선으로 하여 계획하십시오(참조: [실시간 업데이트 · 2026-05-28](/en/live/2026-05/gemini-image-vertex-supply)).
</Note>

## AIStudio와 Vertex는 이중화 채널입니다

문서에는 다음과 같이 명시되어 있습니다: **APIYI는 Nano Banana 시리즈에 AIStudio + Vertex 이중 채널 이중화를 제공합니다** — 하나의 공식 채널이 실패하면 다른 채널이 이를 대신해 서비스 가용성을 유지합니다([Nano Banana 개발자 가이드](/ko/api-capabilities/nano-banana-dev-guide)).

실제로 전환이 발생한 사례는 다음과 같습니다:

* **2026-06-19 사고**: Google의 `AIStudio` 컴퓨트 문제로 공식 2K/4K 출력이 흐려졌고 1K는 정상적으로 작동했습니다. 2K/4K를 복구하기 위해 **일시적으로 Vertex 채널로 전환했습니다**(참조: [실시간 업데이트 · 2026-06](/en/live/2026-06/nano-banana-2k-4k-via-vertex)).
* **2026-05-28 사고**: 두 Gemini 이미지 프리뷰 모델은 공급을 확보하기 위해 **Vertex 고가 채널**로 전환되었고, 안정적으로 제공되는 상태로 돌아갔습니다(참조: [실시간 업데이트 · 2026-05](/en/live/2026-05/gemini-image-vertex-supply)).

<Warning>
  **“Vertex는 영향을 받지 않는다”라고 단정하지 마십시오.** AIStudio가 실패할 때 Vertex가 대신한다고 해서 Vertex 자체가 절대 실패하지 않는다는 뜻은 아닙니다. APIYI는 “SLA 100% — Vertex는 영향을 받지 않는다”는 약속을 공개한 적이 없습니다. 문제가 발생하면 항상 `aistudio.google.com/status`과 [실시간 업데이트](/en/live)를 참고하십시오.
</Warning>

## 업스트림이 다운되었는지 확인하는 방법은?

가장 신뢰할 수 있는 출처는 Google의 공식 AI Studio 상태 페이지입니다:

> **`aistudio.google.com/status`**

상태 페이지는 Gemini 모델군에 대한 공식 장애 공지를 게시합니다. 예를 들면 다음과 같습니다:

* **2026-06-19 15:54**: 감지됨으로 표시되었습니다. 원문: "Nano Banana 2 및 Nano Banana Pro 모델에서 Gemini API 및 AI Studio를 2k 또는 4k 해상도로 사용할 때 문제가 발생하고 있습니다. 조사 중입니다." (참조 [실시간 업데이트 · 2026-06-19](/en/live/2026-06/aistudio-status-nano-banana))

<Tip>
  **실무 활용**: 고객이 "Banana가 느리다 / 이미지에 문제가 있다"라고 보고하면, 먼저 `aistudio.google.com/status`를 확인하십시오. 감지됨으로 표시된 공지가 있다면, 대개 1분 이내에 업스트림 문제인지 여부를 파악할 수 있습니다.
</Tip>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="기본 풀은 AI Studio만 사용합니까? 아니면 Vertex와 AI Studio를 모두 포함합니까?">
    기본 그룹(Default)은 **공식 AI Studio 채널에서 실행됩니다** — 이는 Nano Banana 및 기타 Google 이미지 모델의 기본 경로입니다. Vertex는 독립적인 선택 그룹이며, **기본 그룹에 포함되지 않습니다** — Vertex를 사용하려면 Vertex 관련 그룹으로 전환해야 합니다.
  </Accordion>

  <Accordion title="Vertex는 어느 그룹에 있습니까? Vertex는 어떻게 사용합니까?">
    Vertex는 APIYI 대시보드에서 **독립적인 선택 그룹**으로 제공됩니다(정확한 이름은 대시보드를 기준으로 합니다). token을 생성하거나 편집할 때 “그룹 선택”에서 Vertex 관련 그룹을 선택하십시오 — 호출 시그니처는 동일하게 유지되며, **코드 변경은 필요하지 않습니다**.
  </Accordion>

  <Accordion title="Nano Banana가 느릴 때 Vertex는 덜 영향을 받습니까? AI Studio가 가장 큰 영향을 받습니까?">
    **기록된 이벤트를 기준으로 보면, AI Studio는 2026-06-19에 2K/4K 연산 문제를 겪었습니다** — Vertex가 이를 대신 처리했고 복구되었습니다. 그러나 “Vertex가 덜 영향을 받는다”는 점은 현재 **이러한 기록된 AI Studio 연산 사고에 대해서만 입증된 상태**입니다 — APIYI는 Vertex에 대한 SLA 데이터를 공개하지 않았고, “Vertex는 절대 영향을 받지 않는다”는 약속도 한 적이 없습니다.

    업무가 성공률에 민감하다면, **Nano Banana token에 대해 대체 그룹을 구성하는 것**을 권장합니다([토큰 및 그룹](/ko/faq/token-and-groups) 참조). 그러면 기본 그룹이 혼잡할 때 자동으로 백업 채널로 전환됩니다.
  </Accordion>

  <Accordion title="내 호출이 실제로 어떤 채널을 사용했는지 어떻게 알 수 있습니까?">
    특정 채널은 **응답에 직접 표시되지 않습니다**. 대신 간접적으로 추정할 수 있습니다:

    1. token이 설정된 그룹의 호출은 해당 그룹의 기본 채널을 사용합니다
    2. 반환된 이미지 크기를 확인하십시오 — **AI Studio 4K ≈ 10 MB, Vertex 4K ≈ 20 MB**로 차이가 뚜렷합니다
    3. 상위 업스트림 장애가 발생하면 [실시간 업데이트](/en/live)를 확인하여 플랫폼이 어떤 채널로 전환했는지 보십시오
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="Nano Banana 개발자 가이드" icon="book-open" href="/ko/api-capabilities/nano-banana-dev-guide">
    AIStudio와 Vertex의 이중 채널 이중화 메커니즘을 포함한 Nano Banana 전체 사용 가이드입니다.
  </Card>

  <Card title="Nano Banana 과금 개요" icon="tag" href="/ko/api-capabilities/nano-banana-pricing">
    Nano Banana Pro / 2 / 2 Lite / 1세대의 전체 과금 비교입니다.
  </Card>

  <Card title="실시간 업데이트 아카이브" icon="radio" href="/en/live/archive">
    일일 플랫폼 상태, 채널 전환 및 장애 복구 타임라인입니다.
  </Card>

  <Card title="tokens 및 그룹" icon="key" href="/ko/faq/token-and-groups">
    기본 그룹과 대체 그룹의 tokens 그룹 및 규칙입니다.
  </Card>
</CardGroup>

<Tip>
  **더 필요한 내용이 있습니까?** 이 문서에서 다루지 않은 정보 — Vertex / AIStudio 예약 세부 정보, 업스트림 컴퓨팅 풀 용량, SLA — 는 WeCom 고객 서비스 또는 [hi@apiyi.com](mailto:hi@apiyi.com) 이메일로 문의해 주시기 바랍니다.
</Tip>
