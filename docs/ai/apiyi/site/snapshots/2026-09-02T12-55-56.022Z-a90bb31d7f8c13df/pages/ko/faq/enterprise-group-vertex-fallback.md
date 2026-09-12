> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 엔터프라이즈 그룹은 무엇입니까? 언제 사용해야 합니까?

> APIYI에서 엔터프라이즈 그룹은 **모델별**로 적용되며, 단일 범용 그룹이 아닙니다: gpt-image-2는 image2Enterprise (1.2x)를 사용하고, Nano Banana는 NanoBananaEnterprise (1.4x) 또는 NanoBananaReverse (0.8x)를 사용합니다. 이 글에서는 각 모델의 엔터프라이즈 그룹에 대한 차이점, 배수, 사용 사례를 요약합니다.

## 짧은 답변

**APIYI에서 "엔터프라이즈 그룹"은 하나의 단일한 범용 그룹이 아닙니다. 각 모델마다 전용 엔터프라이즈 폴백 채널이 따로 있습니다.** 일반적으로 기본 그룹보다 약간 더 비싸지만, 기본 그룹이 포화 상태일 때도 이미지를 계속 생성하므로 성공률이 중요한 워크로드를 위한 폴백 옵션이 됩니다.

<Info>
  이 글은 공식 문서나 실시간 상태 기록에서 검증할 수 있는 사실만 나열합니다. SLA, 동시 실행 수 제한 및 기타 공개되지 않은 데이터는 고객 지원을 통해 문의해야 합니다.
</Info>

## 엔터프라이즈 그룹은 모델별로 지정됩니다

범용 그룹 `ClaudeCode`, `Sora2Official` 등과 달리, 엔터프라이즈 그룹은 모델별로 이름이 지정됩니다:

| Model               | Enterprise group name  | Multiplier | Channel nature                                                                                         |
| ------------------- | ---------------------- | ---------- | ------------------------------------------------------------------------------------------------------ |
| gpt-image-2         | `image2Enterprise`     | 1.2x       | **OpenAI 업스트림** 엔터프라이즈 폴백 (참조 [실시간 업데이트 · 2026-05-13](/en/live/2026-05/gpt-image-2-default-saturated)) |
| Nano Banana Pro / 2 | `NanoBananaEnterprise` | 1.4x       | Google 고가용성 폴백 (참조 [이미지 및 동영상 모델](/ko/api-capabilities/image-video-models))                            |
| Nano Banana Pro / 2 | `NanoBananaReverse`    | 0.8x       | **리버스 엔지니어링된 버텍스** 채널 (참조 [실시간 업데이트 · 2026-06](/en/live/2026-06/nanobanana-reverse))                   |

<Tip>
  **중요한 설명**: 엔터프라이즈 그룹은 **버텍스 폴백과 동의어가 아닙니다**. `image2Enterprise`은 Google Vertex와 무관한 OpenAI 업스트림 폴백입니다. `NanoBananaReverse`은 실제로 Vertex를 거치는 채널(리버스 엔지니어링을 통해)이며, `NanoBananaEnterprise`은 채널 구성이 명시적으로 문서화되지 않은 고가용성 폴백입니다.
</Tip>

## 기본 그룹이 포화되어도 엔터프라이즈 그룹은 계속 작동했습니다

`gpt-image-2`의 실제 사례입니다:

* **2026-05-13 14:29–14:31** 호출 로그: 스트리밍이 아닌 호출 9건이 **모두 `image2Enterprise` 그룹으로 라우팅되었고**, 1.2x 요율 배수에서 첫 바이트 지연 시간이 35-293초였지만 여전히 이미지를 성공적으로 생성했습니다([라이브 업데이트 · 2026-05](/en/live/2026-05/gpt-image-2-default-saturated) 참조).
* `gpt-image-2` 기본 그룹이 포화되었을 때, "**일부 기본 그룹 요청이 폴백 경로를 통해 엔터프라이즈 그룹으로 라우팅되었습니다**" — 엔터프라이즈 그룹이 폴백으로 동작한다는 설계 의도를 확인해 줍니다(같은 라이브 업데이트).

`NanoBananaReverse`의 설계 의도(see [라이브 업데이트 · 2026-06](/en/live/2026-06/nanobanana-reverse)):

> 피크 시간대에 공식 직결 Nano Banana Pro / 2에 미치는 영향을 완화하기 위해, 기본 그룹 가격의 80%(0.8x 요율 배수)로 리버스 엔지니어링한 Vertex 그룹 `NanoBananaReverse`을 추가했으며, 해상도와 관계없이 호출당 과금합니다.

<Warning>
  **엔터프라이즈 그룹이 항상 안정적이라는 보장은 없습니다.** 공식 문서에는 명시적으로 다음과 같이 적혀 있습니다. `gpt-image-2` 엔터프라이즈 그룹(공식 OpenAI API)도 2026-05-07에 "The server had an error while processing your request." 오류를 겪었으며, 원인은 OpenAI 업스트림 장애로 확인되었습니다([라이브 업데이트 · 2026-05](/en/live/2026-05/gpt-image-2-upstream-error) 참조). 엔터프라이즈 그룹은 기본 그룹의 혼잡을 완화하지만, 업스트림 안정성을 영구적으로 보장하지는 않습니다.
</Warning>

## 엔터프라이즈 그룹으로 전환하는 방법은?

엔터프라이즈 그룹은 **token 수준**에서 구성됩니다:

1. [https://api.apiyi.com/token](https://api.apiyi.com/token)을 엽니다
2. 대상 token을 찾은 다음 → 작업 열의 “관리(렌치 아이콘)”를 클릭 → “token 편집”을 선택합니다
3. “그룹 선택” 아래에서 해당 엔터프라이즈 그룹(예: `image2Enterprise`, `NanoBananaEnterprise`, `NanoBananaReverse`)을 선택합니다
4. 저장

코드 변경은 필요하지 않습니다. 자세한 안내는 [실시간 업데이트 · 2026-04 · image2-enterprise](/en/live/2026-04/image2-enterprise-stable)에서 확인할 수 있습니다(gpt-image-2 예시이며, 다른 모델도 경로는 동일합니다).

<Tip>
  **NanoBananaReverse 범위**: `gemini-3-pro-image`(Nano Banana Pro)와 `gemini-3.1-flash-image`(Nano Banana 2)만 지원하며, **호출당 과금만** 지원합니다. Nano Banana Pro token이 사용량 기반 과금이라면 이 그룹은 적용되지 않습니다.
</Tip>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="Enterprise는 Vertex와 같은 것입니까?">
    **반드시 그런 것은 아닙니다** — 어떤 모델의 엔터프라이즈 그룹인지에 따라 다릅니다:

    * `image2Enterprise` (gpt-image-2 전용) — **Vertex가 아닙니다**, OpenAI 업스트림 엔터프라이즈 폴백입니다
    * `NanoBananaEnterprise` (Nano Banana 전용) — 문서에는 Vertex를 사용하는지 명시되어 있지 않습니다
    * `NanoBananaReverse` (Nano Banana Pro / 2) — **확실히 리버스 엔지니어링된 Vertex를 사용합니다**

    "엔터프라이즈 그룹"을 "Vertex 폴백"과 동일시하지 마십시오.
  </Accordion>

  <Accordion title="어떤 모델에 엔터프라이즈 그룹이 있습니까?">
    사용 가능한 문서 / 실시간 업데이트에 따르면:

    * gpt-image-2: `image2Enterprise` (1.2x)
    * Nano Banana Pro / 2: `NanoBananaEnterprise` (1.4x), `NanoBananaReverse` (0.8x)
    * Nano Banana OSS (URL 출력): `NB-OSS` (1x이지만 베타입니다 — 그룹 표시를 활성화하려면 고객 지원에 문의해야 합니다; [Nano Banana OSS 그룹](/ko/api-capabilities/nano-banana-oss-group)을 참조하십시오)

    사용 가능한 정확한 그룹은 **대시보드에 표시되는 내용**을 따릅니다 — 플랫폼은 시간이 지나면서 그룹을 추가하거나 이름을 바꿀 수 있습니다.
  </Accordion>

  <Accordion title="언제 엔터프라이즈 그룹으로 전환해야 합니까?">
    기록된 사례에서의 일반적인 상황은 다음과 같습니다:

    * 기본 그룹이 지속적으로 포화되거나 / 대기열에 쌓이거나 / 시간 초과가 발생함 (예: 2026-05 전후의 gpt-image-2)
    * 비즈니스가 성공률에 민감하고 기본 그룹 실패가 발목을 잡는 것을 원치 않음
    * 피크 시간대에 Nano Banana Pro / 2 사용 경험이 좋지 않음 — 호출당 0.8x로 더 저렴한 옵션은 `NanoBananaReverse`입니다

    반대로, **기본 그룹의 리소스가 충분하다면 엔터프라이즈 그룹으로 전환할 필요가 없습니다**: 2026-05-23에 gpt-image-2 기본 그룹이 보충된 후, "**직접 호출하십시오 — image2Enterprise로 굳이 전환할 필요가 없습니다**" (참조 [실시간 업데이트 · 2026-05](/en/live/2026-05/gpt-image-2-default-restocked-0523-2142)).
  </Accordion>

  <Accordion title="엔터프라이즈 그룹이 항상 기본 그룹보다 더 비쌉니까?">
    반드시 그렇지는 않습니다. 기록된 데이터의 배수는 양쪽 모두로 나타납니다:

    * `image2Enterprise`: 1.2x (≈ 기본값보다 20% 더 비쌈)
    * `NanoBananaEnterprise`: 1.4x (≈ 기본값보다 40% 더 비쌈)
    * `NanoBananaReverse`: **0.8x** (≈ **기본값보다 20% 더 저렴함**)

    따라서 "엔터프라이즈"가 "더 비싸다"는 뜻은 아닙니다 — 배수는 특정 모델과 그룹에 따라 달라집니다.
  </Accordion>

  <Accordion title="기본 + 엔터프라이즈를 폴백으로 구성할 수 있습니까?">
    그렇습니다. token은 **1개 기본 그룹 + 최대 2개 폴백 그룹**을 지원합니다 (참조 [token과 그룹](/ko/faq/token-and-groups)). 주 그룹이 혼잡하면 호출은 자동으로 백업 채널로 전환됩니다. 이것은 "높은 성공률" 워크로드에 권장되는 패턴입니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="토큰과 그룹" icon="key" href="/ko/faq/token-and-groups">
    토큰 역할, 생성/편집, 그리고 기본 그룹과 대체 그룹에 대한 규칙.
  </Card>

  <Card title="Nano Banana 개발자 가이드" icon="book-open" href="/ko/api-capabilities/nano-banana-dev-guide">
    AIStudio + Vertex 이중 채널 이중화를 포함한 Nano Banana 전체 문서.
  </Card>

  <Card title="라이브 업데이트 아카이브" icon="radio" href="/en/live/archive">
    일일 플랫폼 상태, 채널 전환 및 장애 복구 타임라인.
  </Card>

  <Card title="Nano Banana 요금 개요" icon="tag" href="/ko/api-capabilities/nano-banana-pricing">
    Nano Banana Pro / 2 / 2 Lite / 1세대의 요금 비교.
  </Card>
</CardGroup>

<Tip>
  **더 필요하신가요?** 이 문서에서 다루지 않은 정보 — 엔터프라이즈 그룹 SLA, 동시 실행 수 제한, 새 모델에 대한 엔터프라이즈 그룹 배포 계획 — 이 필요하시면 WeCom 고객 서비스 또는 [hi@apiyi.com](mailto:hi@apiyi.com)으로 문의해 주십시오.
</Tip>
