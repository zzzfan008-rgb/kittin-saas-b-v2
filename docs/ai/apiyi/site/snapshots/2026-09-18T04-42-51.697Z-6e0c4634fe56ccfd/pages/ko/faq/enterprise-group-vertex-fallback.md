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

## 엔터프라이즈 그룹은 모델별입니다

범용 그룹 `ClaudeCode`, `Sora2Official` 등과 달리 엔터프라이즈 그룹은 모델별로 명명됩니다.

| 모델                                                         | 엔터프라이즈 그룹 이름           | 배수   | 채널 특성                                                                                               |
| ---------------------------------------------------------- | ---------------------- | ---- | --------------------------------------------------------------------------------------------------- |
| gpt-image-2.5-flare / gpt-image-2.5-sunburst / gpt-image-2 | `image2Enterprise`     | 1.2x | **OpenAI 상위** 엔터프라이즈 폴백([실시간 업데이트 · 2026-05-13](/en/live/2026-05/gpt-image-2-default-saturated) 참조) |
| Nano Banana Pro / 2                                        | `NanoBananaEnterprise` | 1.4x | Google 고가용성 폴백([이미지 및 동영상 모델](/ko/api-capabilities/image-video-models) 참조)                          |
| Nano Banana Pro / 2                                        | `NanoBananaReverse`    | 0.8x | **역공학된 Vertex** 채널([실시간 업데이트 · 2026-06](/en/live/2026-06/nanobanana-reverse) 참조)                    |

<Tip>
  **중요한 설명**: 엔터프라이즈 그룹은 **Vertex 폴백과 동의어가 아닙니다**. `image2Enterprise`은 OpenAI 상위 폴백으로, Google Vertex와는 관련이 없습니다. `NanoBananaReverse`은 실제로 Vertex를 거치는 채널(역공학을 통해)이며, `NanoBananaEnterprise`은 채널 구성이 명시적으로 문서화되지 않은 고가용성 폴백입니다.
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

## FAQ

<AccordionGroup>
  <Accordion title="기업용 그룹은 Vertex와 동일합니까?">
    **반드시 그렇지는 않습니다** — 어떤 모델의 기업용 그룹인지에 따라 다릅니다.

    * `image2Enterprise` (gpt-image-2 전용) — **Vertex가 아니며**, OpenAI 업스트림 기업용 폴백입니다.
    * `NanoBananaEnterprise` (Nano Banana 전용) — Vertex를 사용하는지는 문서에 명시적으로 나와 있지 않습니다.
    * `NanoBananaReverse` (Nano Banana Pro / 2) — **리버스 엔지니어링된 Vertex를 확실히 사용합니다.**

    “기업용 그룹”을 “Vertex 폴백”과 동일시해서는 안 됩니다.
  </Accordion>

  <Accordion title="기업용 그룹이 있는 모델은 무엇입니까?">
    현재 확인 가능한 문서 및 실시간 업데이트에 따르면 다음과 같습니다.

    * gpt-image-2.5-flare / gpt-image-2.5-sunburst / gpt-image-2: `image2Enterprise` (1.2x)
    * Nano Banana Pro / 2: `NanoBananaEnterprise` (1.4x), `NanoBananaReverse` (0.8x)
    * Nano Banana OSS (URL 출력): `NB-OSS` (1x이지만 베타이므로 그룹 표시를 활성화하려면 고객 지원팀에 문의해야 합니다. [Nano Banana OSS 그룹](/ko/api-capabilities/nano-banana-oss-group) 참조)

    사용 가능한 정확한 그룹은 **대시보드에 표시되는 항목을 따릅니다** — 플랫폼에서 시간이 지나면서 그룹을 추가하거나 이름을 변경할 수 있습니다.
  </Accordion>

  <Accordion title="언제 기업용 그룹으로 전환해야 합니까?">
    기록된 장애 사례에서 확인된 일반적인 상황은 다음과 같습니다.

    * 기본 그룹이 지속적으로 포화되거나 대기 상태이거나 시간 초과가 발생하는 경우(예: 2026-05의 gpt-image-2)
    * 비즈니스에서 성공률이 중요하고 기본 그룹의 실패로 인해 성능이 저하되는 것을 원하지 않는 경우
    * Nano Banana Pro / 2의 사용 경험이 피크 시간대에 좋지 않은 경우 — `NanoBananaReverse`를 고려하십시오(호출당, 0.8x, 더 저렴함).

    반대로 **기본 그룹에 리소스가 충분하다면 기업용 그룹으로 전환할 필요가 없습니다**: gpt-image-2 기본 그룹이 보충된 2026-05-23에는 “**직접 호출하면 되며 image2Enterprise로 특별히 전환할 필요가 없습니다**”라고 안내되었습니다([실시간 업데이트 · 2026-05](/en/live/2026-05/gpt-image-2-default-restocked-0523-2142) 참조).
  </Accordion>

  <Accordion title="기업용 그룹은 항상 기본 그룹보다 더 비쌉니까?">
    반드시 그렇지는 않습니다. 기록된 데이터의 배수는 양방향으로 나타납니다.

    * `image2Enterprise`: 1.2x (기본 그룹보다 약 20% 더 높음)
    * `NanoBananaEnterprise`: 1.4x (기본 그룹보다 약 40% 더 높음)
    * `NanoBananaReverse`: **0.8x** (기본 그룹보다 **약 20% 더 낮음**)

    따라서 “기업용”이 “더 비쌈”을 의미하는 것은 아닙니다 — 요율 배수는 특정 모델과 그룹에 따라 달라집니다.
  </Accordion>

  <Accordion title="기본 그룹 + 기업용 그룹을 폴백으로 구성할 수 있습니까?">
    가능합니다. 하나의 token은 **기본 그룹 1개 + 폴백 그룹 최대 2개**를 지원합니다([token 및 그룹](/ko/faq/token-and-groups) 참조). 기본 그룹이 혼잡하면 호출이 자동으로 백업 채널로 전환됩니다. 이는 “높은 성공률”이 필요한 워크로드에 권장되는 패턴입니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="Tokens 및 그룹" icon="key" href="/ko/faq/token-and-groups">
    Token 역할, 생성/편집 및 기본 그룹과 폴백 그룹에 대한 규칙입니다.
  </Card>

  <Card title="Nano Banana 개발자 가이드" icon="book-open" href="/ko/api-capabilities/nano-banana-dev-guide">
    AIStudio + Vertex 이중 채널 이중화를 포함한 완전한 Nano Banana 문서입니다.
  </Card>

  <Card title="실시간 업데이트 아카이브" icon="radio" href="/en/live/archive">
    일일 플랫폼 상태, 채널 전환 및 장애 복구 타임라인입니다.
  </Card>

  <Card title="Nano Banana 가격 개요" icon="tag" href="/ko/api-capabilities/nano-banana-pricing">
    Nano Banana Pro / 2 / 2 Lite / 1세대의 가격 비교입니다.
  </Card>
</CardGroup>

<Tip>
  **더 필요하신가요?** 이 문서에서 다루지 않는 정보(엔터프라이즈 그룹 SLA, 동시 실행 수 제한, 신규 모델의 엔터프라이즈 그룹 출시 계획)는 WeCom 고객 서비스 또는 [hi@apiyi.com](mailto:hi@apiyi.com) 이메일을 통해 문의해 주십시오.
</Tip>
