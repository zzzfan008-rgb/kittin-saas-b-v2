> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana Pro 실패 생성 크레딧 환불 계획

> 요청당 Nano Banana Pro의 경우, APIYI는 실패 생성 환불 계획을 제공합니다. Google 콘텐츠 모더레이션으로 인해 발생한 비주관적 사유로 생성이 실패하면 실패한 요청 수를 기준으로 크레딧을 환불합니다.

## 플랜 개요

고객님을 더 잘 지원하기 위해 APIYI는 **Nano Banana Pro 실패 생성 크레딧 환급 플랜**을 출시합니다.

<Info>
  이 플랜의 적용 대상 모델은 **요청당 Nano Banana Pro**뿐입니다. Nano Banana 2의 경우 **token 기반** token을 선택할 수 있으며, 실패한 호출은 극히 적은 금액으로 과금되므로 무시해도 됩니다.
</Info>

요청이 **status code 200**을 반환했지만 이미지 생성이 실패한 경우, 이는 Google 측에서 발생한 피드백입니다. APIYI는 결과를 단순히 전달하는 투명한 프록시이며, 저희도 고객님만큼 이미지가 성공하기를 바랍니다. 이 플랜은 이러한 **주관적이지 않은 사유**로 발생한 실패에 대해 크레딧을 환급합니다.

## Nano Banana Pro가 생성에 실패하는 경우는?

Google의 콘텐츠 모더레이션 정책은 계속 강화되고 있습니다. 거부를 유발하는 일반적인 상황은 다음과 같습니다.

* **콘텐츠 안전성**: NSFW 또는 미성년자 관련 콘텐츠
* **워터마크 제거**: 특히 예외적인 범주입니다
* **잘 알려진 IP** (2026년 1월 23일 추가): Disney 등 — Google이 새로운 모더레이션 정책을 도입한 것으로 보입니다
* **더 엄격한 안전 메커니즘** (2026년 2월 27일, Nano Banana 2 출시 후): 잘 알려진 공인, 금융/주문 정보 수정, 인물 의상 교체/얼굴 교체, 암시적 성적 콘텐츠 등은 모두 “xxx에 대한 요청한 편집을 완료할 수 없습니다”와 유사한 텍스트 오류 메시지를 반환합니다

## 생성 실패의 증상

<CardGroup cols={2}>
  <Card title="로그 출력 Tokens가 1000 미만입니다" icon="triangle-alert">
    Google은 예를 들어: "I'm unable to help with this task"와 같은 텍스트 한 줄을 반환합니다 / `I'm just a language model and can't help with that.`
  </Card>

  <Card title="로그 출력 Tokens가 비어 있습니다" icon="ban">
    이미지 생성이 아예 거부되고 오류는 비어 있습니다. API 응답 데이터의 핵심 지표는 `"candidatesTokenCount": 0`
  </Card>
</CardGroup>

<Frame caption="Log list: when the 'Completion' (output Tokens) column shows tiny values like 100-200, that call is a failed generation">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-pro-guarantee-failure-example.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=6cf66f9f67eeca2b89255d9287c4ae7c" alt="gemini-3-pro-image-preview 모델의 completion Tokens 열에 173 및 176과 같은 아주 작은 값이 표시되고, 실패한 생성으로 표시된 로그 목록" width="938" height="860" data-path="images/nano-banana-pro-guarantee-failure-example.png" />
</Frame>

## 실패했는데도 왜 과금되나요?

* Google이 쿼터를 차감합니다: prompt를 수정하지 않고 같은 요청을 반복해서 보내면 Google의 RPD 쿼터를 낭비합니다
* 시스템은 아직 "출력이 비어 있을 때 과금하지 않기"를 지원하지 못합니다
* 금지된 콘텐츠를 요청하면 공식 KEY가 차단될 가능성이 높아지며, 이는 되돌릴 수 없는 손실입니다

## 참여하려면?

대상 고객은 다음과 같습니다:

1. 월 지출이 **USD 1000**부터 시작하는 경우(온사이트 모델에 한함) — 기준은 의도적으로 낮게 설정되어 있습니다. 소액 크레딧 테스트와 개인 사용에서는 어차피 실패 가능성이 낮기 때문입니다
2. **도구 서비스 제공자**를 대상으로 합니다: 고객 측에서 최종 사용자의 입력 내용을 통제하기 어렵기 때문입니다
3. **비주관적 사유만 해당**합니다: 악의적으로 동일하거나 유사한 금지 콘텐츠를 요청하는 경우에는 보상되지 않습니다
4. 기간: **5월 1일(UTC+8)부터**
5. 내부 목록에 등록하기 위해 순차적으로 연락드리겠습니다

## 환급은 어떻게 진행됩니까?

**로그** 섹션으로 이동한 다음, 오른쪽 상단 모서리에서 **내보내기**를 클릭하고 기간(예: 지난달)을 선택한 후 **비동기 내보내기**를 선택합니다. 제출한 뒤에는 상단 탐색 메뉴의 **비동기 작업**에서 진행 상황을 확인하고 최종 Excel 데이터 결과를 다운로드합니다.

<Frame caption="The Export button in the top-right corner of the Logs section">
  <img src="https://mintcdn.com/apiyillc/gZdh_-LS6bvRJGUL/images/nano-banana-pro-guarantee-export-logs.png?fit=max&auto=format&n=gZdh_-LS6bvRJGUL&q=85&s=233889ab4fdb3740a726f77ff2fc84bd" alt="로그 섹션 도구 모음에서 오른쪽 상단의 내보내기 버튼이 강조 표시된 화면" width="1284" height="296" data-path="images/nano-banana-pro-guarantee-export-logs.png" />
</Frame>

**환급된 크레딧**: 실패한 요청의 정확한 수를 집계한 다음 `failed count × model price / discount factor`을 기준으로 환급합니다(예: 15% 충전 보너스가 있는 경우 1.15로 나눕니다).

**환급 시점**: 매월 말에 전월 데이터를 집계하며, 환급은 일반적으로 다음 달 첫 5영업일 이내에 지급됩니다.
