> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 이미지 API가 NO_IMAGE를 반환하는 이유는 무엇입니까?

> Gemini가 NO_IMAGE를 반환하는 이유와 이미지 프롬프트를 개선하고 요청 문제를 해결하는 방법을 알아봅니다.

## 짧은 답변

API가 `finishReason: NO_IMAGE`을 반환하고 `parts`이 `null`인 경우, 모델은 일반적으로 요청을 처리했지만 이미지 콘텐츠를 반환하지 않은 것입니다.

이는 반드시 프롬프트가 콘텐츠 안전 차단을 유발했다는 의미는 아닙니다. “GEO란 무엇입니까?” 또는 “이 개념을 설명해 주세요”와 같은 프롬프트는 텍스트 질문에 더 가깝게 보입니다. 모델은 사용자가 명시적으로 이미지를 원한다는 것을 확인하지 못할 수 있으므로 `NO_IMAGE`을 반환합니다.

프롬프트의 시작 부분에서 이미지 생성 의도를 명확히 밝힌 다음, 주제, 레이아웃, 스타일 및 출력 요구 사항을 설명합니다.

## NO\_IMAGE이 발생하는 이유는 무엇입니까?

### 1. 프롬프트가 텍스트 질문처럼 보입니다

예를 들면 다음과 같습니다.

```text theme={null}
What is GEO?

GEO helps a company gain visibility in large-model AI systems...
```

개념을 설명하지만 다음 내용을 명확하게 지정하지 않습니다.

* 어떤 유형의 이미지를 생성해야 하는지
* 이미지에 어떤 요소가 표시되어야 하는지
* 정보를 어떻게 배치해야 하는지
* 응답에 이미지만 포함해야 하는지

요청에 “이미지를 생성해 주세요”라는 문구가 포함되어 있더라도 모델은 여전히 전체 요청을 텍스트 설명으로 해석할 수 있습니다.

### 2. 이미지 의도가 충분히 구체적이지 않습니다

일부 플랫폼 도구는 “이미지를 생성합니다:”와 같은 지침을 자동으로 앞에 추가합니다. 그러나 직접 API를 호출하는 경우에는 완전한 이미지 생성 지침이 자동으로 추가되지 않은 채 요청이 투명하게 전달될 수 있습니다.

다음과 같이 작성하는 대신:

```text theme={null}
Generate an image: What is GEO?
```

이미지 유형과 시각적 목표를 직접 지정합니다.

```text theme={null}
Generate a Chinese technology-style infographic poster about “What is GEO”.
```

### 3. 프롬프트에 시각적 설명이 없습니다

프롬프트가 개념만 설명하는 경우 모델은 이를 시각적 구성으로 변환하는 방법을 알 수 없습니다. 다음과 같은 내용을 지정하는 것이 좋습니다.

* 이미지 유형: 인포그래픽, 포스터, 순서도 또는 홍보용 그래픽
* 레이아웃: 3열, 타임라인 또는 방사형 구조
* 시각적 스타일: 기술, 비즈니스, 미니멀리즘 또는 브랜드 스타일
* 텍스트 계층 구조: 제목, 번호가 매겨진 섹션, 본문 및 레이아웃
* 출력 지침: 텍스트 설명 없이 이미지만 생성

## GEO 프롬프트 예시

다음과 같이 원래 프롬프트를 다시 작성할 수 있습니다.

```text theme={null}
Generate a Chinese technology-style infographic poster titled “What is GEO”.

The image must contain one main title and three numbered sections:

1. Help companies gain visibility in large-model AI search and recommendations;
2. Make a company the answer to a user's question;
3. Build AI trust in and recommendations for a company's information.

Design requirements:

- Use a blue and purple technology style;
- Use a clear three-column layout;
- Emphasize “visibility,” “answer,” and “trusted recommendation”;
- Use clean, readable Chinese typography;
- Make it suitable as a corporate promotional poster;
- Generate an image only, without a text explanation.
```

<Tip>
  “이미지 생성”은 작업 힌트일 뿐입니다. 시각적 결과에 대한 설명을 대신하지는 않습니다. 이미지 유형, 주제, 레이아웃, 스타일을 더 명확하게 설명할수록 모델이 요청을 이미지 생성으로 식별하기가 쉬워집니다.
</Tip>

## NO\_IMAGE 문제 해결 방법

<Steps>
  <Step title="1단계: 응답에 이미지 데이터가 포함되어 있는지 확인합니다">
    응답에서 `parts`, `inlineData`, `image` 또는 이에 해당하는 이미지 필드를 확인합니다. `parts`이(가) `null`이면 일반적으로 응답에 이미지 콘텐츠가 포함되지 않은 것입니다.
  </Step>

  <Step title="2단계: prompt에서 이미지를 명시적으로 요청했는지 확인합니다">
    prompt에 “이미지 생성”, “포스터 생성” 또는 “이미지를 생성”과 같은 명확한 지시가 포함되어 있는지 확인합니다. “무엇이...” 또는 “설명...”과 같은 텍스트 질문만 제출하지 마십시오.
  </Step>

  <Step title="3단계: 다음으로 콘텐츠 안전 요소를 확인합니다">
    prompt에서 이미지를 명확히 요청했는데도 `NO_IMAGE`가 반환되면 NSFW 콘텐츠, 미성년자, 잘 알려진 IP, 워터마크 제거, 실존 인물 초상 또는 기타 상위 시스템의 안전 정책을 확인합니다.
  </Step>

  <Step title="4단계: 호출 로그를 확인합니다">
    호출 로그에서 전체 응답, 모델 이름, 요청 ID 및 과금 기록을 검토합니다. `usageMetadata`은 모델이 요청을 처리했음을 보여주지만, 이미지가 생성되었거나 안전 차단이 발생했음을 입증하지는 않습니다.
  </Step>
</Steps>

## NO\_IMAGE는 안전 차단과 어떻게 다릅니까?

| 증상                                      | 가능한 원인                                  | 권장 조치                                     |
| --------------------------------------- | --------------------------------------- | ----------------------------------------- |
| `NO_IMAGE` 및 `parts: null`과 추상적인 prompt | 이미지 의도가 명확하지 않음                         | 이미지 유형, 시각적 주제 및 레이아웃 요구 사항을 추가합니다        |
| 안전 정책 오류가 반환됨                           | 업스트림 콘텐츠 안전 정책이 트리거됨                    | 정책을 트리거할 수 있는 콘텐츠를 변경하거나 제거합니다            |
| 이미지 의도는 명확하지만 이미지가 반환되지 않음              | 모델, 그룹, token 또는 업스트림 라우트를 사용하지 못할 수 있음 | 전체 오류, 모델 이름, 요청 ID 및 시간을 포함하여 지원팀에 문의합니다 |

<Info>
  `finishReason: NO_IMAGE`는 이미지가 반환되지 않았다는 의미일 뿐입니다. 이것만으로는 prompt가 정책을 위반했다는 사실을 입증할 수 없습니다. 전체 오류, prompt 및 호출 로그를 함께 사용합니다.
</Info>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="“이미지 생성”을 추가하면 항상 문제가 해결됩니까?">
    아닙니다. 기본 의도만 더 명확해질 뿐입니다. 이미지 유형, 주제, 구성, 스타일 및 출력 요구 사항도 설명해야 합니다. 추상적인 개념의 경우 인포그래픽, 포스터 또는 순서도를 요청한다고 명시하십시오.
  </Accordion>

  <Accordion title="GEO 주제가 콘텐츠 안전 정책에 의해 차단되었습니까?">
    GEO 개념 자체에는 명백한 안전 위험이 포함되어 있지 않은 것으로 보입니다. 그러나 `NO_IMAGE`만으로는 상위 수준의 정책 결정을 완전히 배제할 수 없습니다. 이 경우 prompt는 지식 설명에 더 가까우므로, 불분명한 이미지 의도를 먼저 확인하는 것이 적절합니다.
  </Accordion>

  <Accordion title="이미지가 반환되지 않았는데 usageMetadata에 token이 있는 이유는 무엇입니까?">
    `usageMetadata`는 모델이 입력을 처리하고 추론 또는 텍스트 token을 생성했다는 사실만 보여 줍니다. 응답에 이미지가 포함되어 있다는 의미는 아닙니다. 응답의 이미지 데이터 필드를 확인하십시오.
  </Accordion>

  <Accordion title="NO_IMAGE에도 과금됩니까?">
    `NO_IMAGE`만으로 과금을 판단하지 마십시오. APIYI 호출 로그를 확인하여 요청으로 과금 기록이 생성되었는지 확인하십시오.
  </Accordion>
</AccordionGroup>

## 계속 문제가 해결되지 않나요? 지원팀에 문의하세요

이미지 의도를 명확히 했는데도 요청이 계속 `NO_IMAGE`을(를) 반환하면 APIYI 지원팀에 문의하고 다음 정보를 포함하세요.

* 모델 이름 및 token 그룹
* 전체 오류 메시지 및 `request ID`
* 마스킹된 prompt
* 발생 시간
* 호출 로그의 과금 기록

<Warning>
  전체 API 키를 절대 보내지 마세요. 스크린샷이나 로그를 공유하기 전에 키를 마스킹하세요.
</Warning>

<CardGroup cols={2}>
  <Card title="WeCom 지원" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeCom 지원 QR 코드" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    QR 코드를 스캔하거나 이 카드를 클릭하여 지원팀에 직접 문의하세요.
  </Card>

  <Card title="이메일 지원" icon="mail">
    **지원팀**: [support@apiyi.com](mailto:support@apiyi.com)

    제목에 “NO\_IMAGE” 및 모델 이름을 포함하는 것을 권장합니다.
  </Card>
</CardGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="Nano Banana 이미지 생성 실패" icon="image-off" href="/ko/faq/nano-banana-image-failure">
    안전성, 워터마크 제거, 유명 IP 및 미성년자와 관련된 일반적인 원인
  </Card>

  <Card title="모델 API 오류를 어떻게 해결합니까?" icon="alert-triangle" href="/ko/faq/model-error-troubleshooting">
    401, 429, 503, 504, 시간 초과 및 그룹 문제에 대한 일반적인 안내
  </Card>

  <Card title="로그에서 과금 금액을 어떻게 확인합니까?" icon="file-text" href="/ko/faq/log-billing-explained">
    호출 로그를 사용하여 요청이 성공했으며 과금되었는지 확인
  </Card>
</CardGroup>
