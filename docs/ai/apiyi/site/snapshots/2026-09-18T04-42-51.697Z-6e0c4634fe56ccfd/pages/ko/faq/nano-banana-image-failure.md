> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Nano Banana 이미지 생성 실패의 일반적인 원인

> 콘텐츠 안전, 워터마크 제거, 유명 IP, 미성년자 및 Google의 안전 메커니즘을 작동시키는 기타 요인을 포함한 Nano Banana Pro/2 이미지 생성 실패의 일반적인 원인에 대한 분석

## 빠른 답변

Nano Banana 시리즈(Nano Banana Pro 및 Nano Banana 2 포함)는 내부적으로 Google Gemini 모델을 사용합니다. 이미지 생성 실패의 주된 원인은 **Google의 콘텐츠 안전 메커니즘이 작동하여**, 생성 단계에서 규정을 준수하지 않는 요청을 차단하기 때문입니다. APIYI는 투명한 프록시로서 Google의 피드백을 그대로 전달합니다.

## 공통 트리거

<CardGroup cols={2}>
  <Card title="NSFW 콘텐츠" icon="ban">
    포르노, 폭력, 유혈, 혐오 발언 콘텐츠를 포함한 prompt 또는 참고 이미지는 Google의 안전 장치에 의해 즉시 차단됩니다.
  </Card>

  <Card title="워터마크 제거" icon="droplet-off">
    이미지에서 워터마크 제거를 요청하는 것은 콘텐츠 정책을 위반하며 Google에 의해 거절됩니다.
  </Card>

  <Card title="유명 IP / 저작권이 있는 캐릭터" icon="copyright">
    Disney, Marvel, Nintendo 등에서 저작권이 있는 캐릭터가 포함된 생성 요청은 저작권 보호로 인해 거절됩니다.
  </Card>

  <Card title="미성년자 관련 콘텐츠" icon="baby">
    미성년자가 포함된 부적절한 콘텐츠 생성 요청은 Google의 무관용 정책에 따라 엄격하게 차단됩니다.
  </Card>
</CardGroup>

### Nano Banana 2의 새로운 제한

<Warning>
  Nano Banana 2가 2026년 2월 27일 출시된 이후 Google은 안전 장치를 더욱 강화했습니다. 다음 시나리오도 차단을 유발합니다:
</Warning>

<CardGroup cols={2}>
  <Card title="유명 인물" icon="user-x">
    공인(연예인, 정치인 등)이 포함된 이미지 생성 또는 편집 요청은 거절됩니다.
  </Card>

  <Card title="금융/주문 정보 수정" icon="credit-card">
    이미지의 금융 정보, 주문 스크린샷, 가격표 등을 수정하려는 시도는 차단됩니다.
  </Card>

  <Card title="의상/얼굴 교체" icon="shirt">
    사람의 복장을 바꾸거나 얼굴을 교체하는 작업은 사생활 및 윤리적 우려와 관련되어 거절됩니다.
  </Card>

  <Card title="암시적 NSFW 콘텐츠" icon="eye-off">
    명시적인 성적 묘사가 없어도 선정적이거나 경계선상의 부적절한 콘텐츠는 탐지되어 차단됩니다.
  </Card>
</CardGroup>

## 정책 업데이트 일정

| 날짜           | 이벤트                     | 영향                                                           |
| ------------ | ----------------------- | ------------------------------------------------------------ |
| 2026년 1월 23일 | Google이 위험 제어 정책을 조정합니다 | 전반적인 안전 검토가 더 엄격해지며, 이전에 허용되던 일부 prompt가 이제 차단됩니다            |
| 2026년 2월 27일 | Nano Banana 2가 출시됩니다    | 유명 인물, 금융 정보 수정, 의상/얼굴 교체, 암시적 NSFW 콘텐츠에 대한 새로운 차단 규칙이 적용됩니다 |

## 생성 실패의 일반적인 증상

이미지 생성이 실패하면 API는 여전히 HTTP 상태 코드 **200**을 반환하지만, 응답에는 이미지 데이터가 없고 대신 텍스트 설명이 반환됩니다.

<Info>
  **상태 코드가 200인 이유는 무엇입니까?** APIYI는 투명한 프록시로 동작하여 Google API의 원래 응답을 그대로 전달합니다. Google은 안전 차단이 발생할 때 HTTP 오류 코드 대신 텍스트 거부 설명과 함께 200 상태 코드를 반환합니다.
</Info>

### 일반적인 오류 메시지

Google API의 거부 텍스트에는 일반적으로 다음과 같은 메시지가 포함됩니다.

* `"I can't complete the modification of xxx"`
* `"I can't generate images that are sexually explicit."`
* `"I'm just a language model and can't help with that."`

<Warning>
  참고: Google의 안전 필터링에는 어느 정도 무작위성이 있습니다. **같은 prompt라도 어떤 때는 성공하고 다른 때는 실패할 수 있습니다**, 이는 참고 이미지의 내용, prompt 조합 및 기타 요인에 따라 달라집니다.
</Warning>

## 제품 개발자를 위한 권장 사항

Nano Banana API를 사용해 사용자 대상 제품을 구축하는 경우, 사용자에게 친절한 실패 메시지를 제공할 수 있도록 적절한 오류 처리 로직을 구현하는 것을 권장합니다.

<Tip>
  **확인할 주요 지표**:

  1. **candidatesTokenCount = 0**: 콘텐츠 검토 단계에서 Google이 거부했습니다
  2. **finishReason is not STOP**: 생성 중 안전 정책에 의해 차단되었습니다
  3. **텍스트는 있지만 이미지 없음**: API가 이미지 데이터 대신 거부 사유 설명을 반환했습니다
</Tip>

## 문의 지원

사용 사례가 정당하고 규정을 준수하지만 여전히 생성 실패가 발생한다면, 조사할 수 있도록 언제든지 문의해 주십시오:

<Card title="기술 지원" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  * [엔터프라이즈 위챗으로 문의하십시오](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)
  * Email: [hi@apiyi.com](mailto:hi@apiyi.com)
</Card>
