> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 이미지 API가 NO_IMAGE를 반환하는 이유는 무엇입니까?

> Gemini가 NO_IMAGE를 반환하는 이유와 이미지 프롬프트를 개선하고 요청 문제를 해결하는 방법을 알아봅니다.

## 간단한 답변

API가 `finishReason: NO_IMAGE`를 반환하고 `parts`가 `null`인 경우, 일반적으로 모델이 요청을 처리했으나 이미지 콘텐츠를 반환하지 않은 것입니다.

이것이 반드시 prompt가 콘텐츠 안전 차단을 유발했음을 의미하는 것은 아닙니다. “What is GEO?”나 “Explain this concept”와 같은 prompt는 텍스트 질문에 더 가깝습니다. 모델이 사용자가 이미지를 명시적으로 원하는지 확인하지 못하여 `NO_IMAGE`를 반환할 수 있습니다.

prompt의 시작 부분에 이미지 생성 의도를 명시하고, 그 뒤에 주제, 레이아웃, 스타일 및 출력 요구 사항을 설명하십시오.

또 다른 빈번한 원인은 "produce a design proposal"이나 "make the analysis thorough"와 같이 **모델에 텍스트 작성을 요청하는 prompt**입니다. 호출에서 이미지 출력만 허용하는 경우 이러한 요청은 간혹 `NO_IMAGE`를 반환하므로 동일한 요청이 실패했다가 성공할 수도 있습니다. 아래의 "prompt에서 텍스트 출력을 요청하는 경우"를 참조하십시오.

<Note>
  응답에 `candidates`가 없지만 `promptFeedback.blockReason`가 포함되어 있는 경우(예: `OTHER`), 이는 다른 문제입니다. 생성이 시작되기 전에 제공자 측에서 입력을 차단한 것입니다. [Gemini 이미지가 blockReason: OTHER를 반환하는 이유는 무엇인가요?](/ko/faq/gemini-image-input-blocked)를 참조하십시오.
</Note>

## NO\_IMAGE가 발생하는 이유는 무엇인가요?

### 1. prompt가 텍스트 질문처럼 보이는 경우

예를 들면 다음과 같습니다.

```text theme={null}
What is GEO?

GEO helps a company gain visibility in large-model AI systems...
```

이는 개념을 설명하지만, 다음 사항을 명확히 밝히지 않습니다.

* 어떤 유형의 이미지를 생성해야 하는지
* 이미지에 어떤 요소가 나타나야 하는지
* 정보를 어떻게 배치해야 하는지
* 응답에 이미지만 포함되어야 하는지

요청에 “이미지 생성”이라는 단어가 포함되어 있더라도, 모델은 전체 요청을 여전히 텍스트 설명으로 해석할 수 있습니다.

### 2. 이미지 의도가 충분히 구체적이지 않은 경우

일부 플랫폼 도구는 “Generate an image:”와 같은 지침을 자동으로 앞에 추가합니다. 그러나 직접 API를 호출하는 경우, 완전한 이미지 생성 지침이 자동으로 추가되지 않고 요청이 그대로 전달될 수 있습니다.

다음과 같이만 작성하는 대신:

```text theme={null}
Generate an image: What is GEO?
```

이미지 유형과 시각적 목표를 직접 명시하십시오.

```text theme={null}
Generate a Chinese technology-style infographic poster about “What is GEO”.
```

### 3. prompt에 시각적 설명이 없는 경우

prompt가 개념만 설명하는 경우, 모델은 이를 시각적 구도로 전환하는 방법을 알지 못합니다. 다음 사항을 지정하는 것을 고려하십시오.

* 이미지 유형: 인포그래픽, 포스터, 플로우차트 또는 홍보용 그래픽
* 레이아웃: 3단 컬럼, 타임라인 또는 방사형 구조
* 시각적 스타일: 테크, 비즈니스, 미니멀리즘 또는 브랜드 스타일
* 텍스트 계층 구조: 제목, 번호가 매겨진 섹션, 본문 문구 및 레이아웃
* 출력 지침: 텍스트 설명 없이 이미지만 생성

### 4. prompt가 텍스트 출력을 요청하는 경우

Gemini 이미지 모델은 이미지를 읽고 텍스트를 작성할 수도 있습니다. prompt에 텍스트 출력을 요청하는 문장이 포함되어 있으면, 모델은 이미지를 생성하는 대신 때때로 "제안서를 먼저 작성"합니다.

```text theme={null}
...Based on the outsole in image 1, design a marathon running shoe...
Produce a professional, precise, and actionable design proposal for the shoe.
Make sure the analysis is thorough and accurate, and that the design and color scheme can be used directly in product development.
```

이러한 문장은 텍스트 모델에 적합합니다. 이미지만 출력하는 설정(`responseModalities: ["IMAGE"]`)으로 이미지 모델에 전송되는 경우, 모델이 작성하려는 제안서를 반환할 수 없으므로 응답은 `finishReason: NO_IMAGE`, `parts: null` 및 0개의 출력 tokens가 됩니다.

2026년 9월 (UTC+8)에 gemini-3.1-flash-image 및 `responseModalities: ["IMAGE"]` 환경에서 실제 신발 디자인 요청(참조 이미지 3장과 위와 같은 prompt)을 다시 실행해 보았습니다.

| prompt 변형 | NO\_IMAGE를 반환한 요청 수 |
| - | - |
| 원본 prompt | 10/48 (약 21%, 실행 전반에 걸쳐 1/12에서 5/12 사이로 변동) |
| "design proposal" 및 "thorough analysis" 문장 제거 | 0/36 |
| 한 문장이 추가된 원본 prompt: "output the final image only" | 0/24 |
| prompt에서 브랜드 이름 제거 | 1/12 (브랜드 이름은 유발 원인이 아님) |

경로가 변경되지 않았음에도 동일한 요청이 여러 번 연속으로 실패했다가 성공할 수 있는 이유가 바로 이것입니다. 가장 간단한 해결책은 prompt 끝에 다음과 같은 문장을 추가하는 것입니다.

```text theme={null}
Important: output only one final image. Do not output any written proposal, analysis, or prompt.
```

<Tip>
  참조 이미지에 명확하게 읽을 수 있는 텍스트나 서드파티 마크(예: 신발 밑창의 브랜드 글자)가 포함되어 있으면 모델이 해당 자료를 분석하는 작업부터 시작할 가능성이 더 높습니다. 동일한 테스트에서 해당 글자를 흐리게 처리했을 때도 결과가 0/36으로 개선되었습니다.
</Tip>

## 서로 다른 responseModalities 설정, 서로 다른 증상

이미지 의도가 불분명한 동일한 요청이라도 `responseModalities`에 따라 실패하는 증상이 다릅니다:

| 설정 | 이미지가 반환되지 않을 때 표시되는 내용 |
| - | - |
| `["IMAGE"]` | `finishReason: NO_IMAGE`, `parts: null`, 출력 tokens 0개 |
| 생략됨 또는 `["TEXT", "IMAGE"]` | `finishReason: STOP`이지만 `parts`에 텍스트만 포함되고 이미지는 없음 |

**문제 해결 팁**: `responseModalities` 없이 실패한 요청을 몇 차례 다시 전송해 보고, 모델이 이미지를 반환하지 않을 때 작성하는 내용을 확인하십시오:

* 제안, 분석 또는 이미지 prompt → 이미지 의도가 불분명한 상태이므로, 이 페이지의 안내에 따라 prompt를 수정하십시오
* "이를 생성할 수 없습니다"와 같은 거부 응답 → 콘텐츠 안전 정책이 트리거된 상태입니다. [Nano Banana 이미지 생성 실패](/ko/faq/nano-banana-image-failure)를 참조하십시오

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
  <Step title="1단계: 오류가 발생한 필드 확인">
    `candidates[0].finishReason`이(가) `NO_IMAGE`인 경우 이 페이지의 내용이 적용됩니다. `candidates`이(가) 없고 `promptFeedback.blockReason`에 값이 있는 경우, 생성 전에 입력이 차단된 것입니다. [blockReason: OTHER 문제 해결](/ko/faq/gemini-image-input-blocked)을 참조하십시오.
  </Step>

  <Step title="2단계: 응답에 이미지 데이터가 포함되어 있는지 확인">
    응답에서 `parts`, `inlineData`, `image` 또는 이에 상응하는 이미지 필드를 확인하십시오. `parts`이(가) `null`인 경우, 일반적으로 응답에 이미지 콘텐츠가 포함되어 있지 않습니다.
  </Step>

  <Step title="3단계: prompt에 이미지가 명시적으로 요청되었는지 확인">
    prompt에 “이미지 생성”, “포스터 제작” 또는 “이미지 만들기”와 같은 명확한 지시가 포함되어 있는지 확인하십시오. “\~란 무엇인가요...” 또는 “\~에 대해 설명해 주세요...”와 같은 텍스트 질문만 제출하지 마십시오. 또한 “제안서 작성”, “심층 분석” 또는 “디자인 설명”과 같이 텍스트 결과물을 요구하는 문장이 있는지도 확인하십시오. 해당 문장을 제거하거나 prompt 끝에 “이미지만 출력”을 추가하십시오.
  </Step>

  <Step title="4단계: 다음으로 콘텐츠 안전 요소 확인">
    prompt에 이미지가 명확하게 요청되었음에도 `NO_IMAGE`이(가) 계속 반환된다면 NSFW 콘텐츠, 미성년자, 유명 IP, 워터마크 제거, 실제 인물 초상 또는 기타 업스트림 안전 정책 위반 여부를 확인하십시오.
  </Step>

  <Step title="5단계: 호출 로그 확인">
    호출 로그에서 전체 응답, 모델명, 요청 ID 및 과금 내역을 검토하십시오. `usageMetadata`은(는) 모델이 요청을 처리했음을 나타내지만, 이미지가 생성되었거나 안전 차단이 발생했음을 증명하지는 않습니다.
  </Step>
</Steps>

## NO\_IMAGE는 안전 차단과 어떻게 다릅니까?

| 증상 | 가능한 원인 | 권장 조치 |
| - | - | - |
| `NO_IMAGE`(`parts: null` 및 추상적인 prompt 포함) | 이미지 생성 의도가 불분명함 | 이미지 유형, 시각적 피사체 및 레이아웃 요구사항을 추가하십시오. |
| 안전 정책 오류가 반환됨 | 업스트림 콘텐츠 안전 정책이 트리거됨 | 정책을 트리거할 수 있는 콘텐츠를 변경하거나 제거하십시오. |
| `NO_IMAGE` 현상이 간헐적으로 발생하며 동일한 요청 재시도 시 성공함 | prompt에서 텍스트 출력을 요청하여 모델이 때때로 제안을 먼저 작성함 | 제안이나 분석 문장을 제거하거나 “최종 이미지만 출력”을 추가하십시오. |
| `candidates`이(가) 없으며 `promptFeedback.blockReason`이(가) `OTHER`임 | 생성 전에 제공업체에서 입력을 차단함 | [blockReason: OTHER 문제 해결](/ko/faq/gemini-image-input-blocked)을 참조하십시오. |
| 이미지 생성 의도가 명확함에도 이미지가 반환되지 않음 | 모델, 그룹, token 또는 업스트림 경로를 사용할 수 없을 수 있음 | 전체 오류, 모델 이름, 요청 ID 및 시간을 기재하여 고객 지원팀에 문의하십시오. |

<Info>
  `finishReason: NO_IMAGE`은(는) 이미지가 반환되지 않았다는 것만을 의미합니다. 이 자체만으로 prompt가 정책을 위반했음을 증명하지는 않습니다. 전체 오류 내용, prompt 및 호출 로그를 함께 확인하십시오.
</Info>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="“이미지 생성”을 추가하면 항상 문제가 해결됩니까?">
    아닙니다. 이는 기본적인 의도를 더 명확하게 해 줄 뿐입니다. 이미지 유형, 주제, 구도, 스타일 및 출력 요구 사항도 함께 설명하십시오. 추상적인 개념의 경우 인포그래픽, 포스터 또는 순서도를 명시적으로 요청하십시오.
  </Accordion>

  <Accordion title="GEO 주제가 콘텐츠 안전 정책에 의해 차단되었습니까?">
    GEO 개념 자체에는 명백한 안전 위험이 포함되어 있지 않은 것으로 보입니다. 그러나 `NO_IMAGE`만으로는 업스트림 정책에 따른 결정을 완전히 배제할 수 없습니다. 이 경우 prompt는 지식 설명에 더 가깝게 읽히므로, 불명확한 이미지 생성 의도를 먼저 확인하는 것이 더 적절합니다.
  </Accordion>

  <Accordion title="동일한 요청이 어떨 때는 성공하고 어떨 때는 실패하는 이유는 무엇입니까? 라우트가 변경되었습니까?">
    대부분의 경우 라우트는 변경되지 않았습니다. 불명확한 의도로 인해 발생하는 `NO_IMAGE`은 확률적입니다. 즉, 모델은 각 요청마다 이미지를 생성할지 텍스트를 먼저 작성할지를 선택합니다. 테스트 결과 동일한 요청이 약 21%의 확률로 실패했으며, 종종 여러 번 연속으로 실패하기도 했습니다. 클라이언트에서 `NO_IMAGE` 응답을 1\~2회 자동으로 재시도하고, prompt를 수정하여 근본적인 원인을 제거하십시오.
  </Accordion>

  <Accordion title="이미지가 반환되지 않았는데 usageMetadata에 tokens가 있는 이유는 무엇입니까?">
    `usageMetadata`은 모델이 입력을 처리하고 추론 또는 텍스트 tokens를 생성했음만을 보여줍니다. 응답에 이미지가 포함되어 있음을 의미하지는 않습니다. 응답 내 이미지 데이터 필드를 확인하십시오.
  </Accordion>

  <Accordion title="NO_IMAGE도 과금됩니까?">
    `NO_IMAGE`만으로 과금 여부를 판단하지 마십시오. APIYI 호출 로그를 확인하여 해당 요청에 과금 기록이 생성되었는지 확인하십시오.
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
  <Card title="Gemini 이미지에서 blockReason: OTHER가 반환되는 이유는 무엇입니까?" icon="shield-alert" href="/ko/faq/gemini-image-input-blocked">
    차단된 입력 이미지를 찾고 참조 이미지를 전처리하는 방법
  </Card>

  <Card title="Nano Banana 이미지 생성 실패" icon="image-off" href="/ko/faq/nano-banana-image-failure">
    안전성, 워터마크 제거, 유명 IP, 미성년자 등을 포함한 일반적인 원인
  </Card>

  <Card title="모델 API 오류는 어떻게 해결합니까?" icon="alert-triangle" href="/ko/faq/model-error-troubleshooting">
    401, 429, 503, 504, 타임아웃 및 그룹 문제에 대한 일반 안내
  </Card>

  <Card title="로그에서 과금 금액은 어떻게 확인합니까?" icon="file-text" href="/ko/faq/log-billing-explained">
    호출 로그를 사용하여 요청의 성공 및 과금 여부를 확인합니다
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.