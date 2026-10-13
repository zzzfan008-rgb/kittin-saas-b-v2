> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini 이미지가 IMAGE_OTHER를 반환하는 이유

> Gemini 이미지 모델이 finishReason: IMAGE_OTHER를 반환하는 경우, 이미지는 생성되었으나 전달되기 전에 제공자에 의해 필터링된 것입니다. NO_IMAGE 및 blockReason과의 차이점, 원인을 찾는 방법, 그리고 해결 방법을 설명합니다.

## 간단한 답변

Gemini 이미지 API가 `candidates[0].finishReason`이(가) `IMAGE_OTHER`(으)로 설정되어 있고 `finishMessage`에 `Unable to show the generated image`(이)라고 표시된 HTTP 200을 반환한다면, **모델이 이미지를 생성하기는 했으나 반환되기 전에 제공업체의 출력 검사에서 필터링된 것입니다**.

* 이는 **확률적**입니다: 동일한 요청이라도 때로는 성공하고 때로는 실패하며, 실패율이 높을 수 있습니다
* 이는 **네거티브 prompt, 파라미터 또는 게이트웨이와 무관합니다**; 문제는 최종 이미지에 생성되는 내용입니다
* 자체 측정을 통해 확인한 가장 대표적인 원인: **prompt에 실존 인물의 이름이 명시된 경우**입니다
* 제공업체는 `finishMessage`에서 이러한 요청에 대해 과금되지 않는다고 명시하고 있습니다

해결 방법: **prompt에서 이미지가 특정 실존 인물 또는 기타 제한된 콘텐츠처럼 보이게 만드는 부분을 찾아 묘사형 설명으로 대체하는 것입니다.**

## 확인 방법

전형적인 응답 예시입니다:

```json theme={null}
{
  "candidates": [
    {
      "finishReason": "IMAGE_OTHER",
      "finishMessage": "Unable to show the generated image. The model could not generate the image based on the prompt provided. You will not be charged for this request. Try rephrasing the prompt. ..."
    }
  ],
  "usageMetadata": {
    "promptTokenCount": 1430,
    "candidatesTokenCount": 274,
    "thoughtsTokenCount": 274
  },
  "modelVersion": "gemini-3-pro-image",
  "responseId": "..."
}
```

`candidatesTokenCount`이(가) 0이 아니며 `thoughtsTokenCount`와 같다는 점에 유의하십시오. 모델이 추론을 완료했지만 최종 이미지는 전달되지 않았습니다.

이미지가 누락될 수 있는 세 가지 경우:

| 특징 | IMAGE\_OTHER | NO\_IMAGE | blockReason: OTHER |
| - | - | - | - |
| 실패 정보를 담은 필드 | `candidates[0].finishReason` | `candidates[0].finishReason` | `promptFeedback.blockReason` |
| 발생 위치 | 이미지 생성됨, **출력 시 필터링됨** | 모델이 이미지를 아예 그리지 않음 | 생성 전, **입력 차단됨** |
| `finishMessage` | `Unable to show the generated image` | 보통 없음 | `candidates` 전혀 없음 |
| 출력 tokens | Thinking tokens만 있음 | 0 또는 텍스트만 | 0 |
| 매번 재현 가능 여부 | 확률적 | 확률적 | 대체로 가능 |
| 일반적인 원인 | 그림이 특정 실제 인물 또는 기타 제한된 콘텐츠와 유사함 | prompt가 텍스트 출력을 요청함 | 참조 이미지가 차단됨 |
| 대응 방법 | prompt에서 인물 또는 제한된 부분을 다시 작성 | [NO\_IMAGE 문제 해결](/ko/faq/gemini-no-image) 참고 | [blockReason: OTHER 문제 해결](/ko/faq/gemini-image-input-blocked) 참고 |

<Info>
  공식 API 레퍼런스에서 `IMAGE_OTHER`은(는) 모두 “이미지 생성이 중단됨”을 의미하는 `IMAGE_SAFETY`, `IMAGE_PROHIBITED_CONTENT`, `IMAGE_RECITATION`와 동일한 그룹에 속합니다. `IMAGE_OTHER`은(는) 다른 카테고리 이외의 원인을 포괄하며, 제공업체는 구체적인 기준을 공개하지 않습니다.
</Info>

## 테스트 사례

2026년 9월 (UTC+8), 한 고객이 gemini-3-pro-image에서 순수 text-to-image 선수 카드 요청 시 **약 63%의 확률로 이미지를 반환하지 못한다**고 보고했습니다. prompt는 약 5,500자였습니다:

* 실제 운동선수의 이름을 명시하며 얼굴 특징의 "1:1 replica"를 요청하는 시작 문장
* 자세, 구도, 유니폼 색상, 아트 스타일 및 흰색 배경에 대한 상세 지침
* 여러 브랜드명이 나열된 두 개의 긴 negative-prompt(NEGATIVE) 블록

저희가 재현한 모든 실패 사례는 `IMAGE_OTHER`였으며, 약 20초 만에 반환되었습니다. 그 후 요소를 한 번에 하나씩 제거하며 그룹당 6회씩 호출을 진행했습니다:

| 변경 사항 | 이미지 미생성 |
| - | - |
| 원본 prompt | **5/6** |
| **실제 인물 이름을 명시한 문장만 제거**, 나머지는 그대로 유지 | **0/6** |
| 이름은 유지하고 "1:1 replica" 문구만 제거 | 4/6 |
| 두 negative-prompt 블록 모두 제거 | 3/6 |

결론은 명확합니다. **실제 인물의 이름 자체가 트리거였습니다**. 모델이 이름을 인식하고 해당 인물의 외모와 유사하게 생성하려 하며, 닮을수록 출력이 필터링될 가능성이 높아집니다. 덜 유사하게 생성된 시도들은 통과되었기 때문에 무작위로 발생하는 것처럼 보였던 것입니다. "1:1 replica"라는 문구나 긴 negative prompt 모두 원인이 아니었습니다.

이름을 제거하자, prompt에 이미 포함되어 있던 머리 모양, 얼굴형, 눈에 대한 설명만으로도 동일한 스타일의 선수 카드를 생성하기에 충분했습니다.

<Tip>
  그룹당 6회의 호출은 이러한 이분 검증에 충분합니다. 원본이 5/6으로 실패하는 상황에서 올바른 수정안이 운에 의해 6회 연속 통과할 확률은 약 10만 분의 2에 불과합니다. 전체 조사에는 총 24회의 호출이 소요되었습니다.
</Tip>

## 트리거를 찾는 방법

<Steps>
  <Step title="1단계: 실패 유형 확인">
    동일한 요청을 5\~6회 재전송하여 실패 시 `finishReason: IMAGE_OTHER`이 포함되어 있는지 확인하고 실패율을 기록합니다. 대신 `NO_IMAGE` 또는 `blockReason`이 표시되면 해당하는 문제 해결 페이지를 참조하십시오.
  </Step>

  <Step title="2단계: 이름 및 특정 대상 먼저 확인">
    prompt에서 **실제 인물의 이름**(유명인, 운동선수, 인플루언서, 정치인 등)이나 누군가와 “완전히 똑같이” 보이도록 하는 지시문이 있는지 확인합니다. 해당 내용을 제거하고 다른 그룹을 실행합니다.
  </Step>

  <Step title="3단계: 섹션을 절반씩 제거">
    이름 문제가 아니라면 한 번에 prompt의 절반을 제거하고 그룹당 6회씩 호출하며, 실패율이 뚜렷하게 감소하는 절반을 기준으로 계속 범위를 좁혀 나갑니다.
  </Step>

  <Step title="4단계: 단순 삭제 대신 다시 작성">
    트리거를 찾았다면 특정 이름을 지칭하는 대신 외모, 복장, 스타일에 대한 **설명**으로 대체하여 실제로 필요한 시각적 요구사항을 유지합니다.
  </Step>
</Steps>

## 권장 사항

1. **prompt에 실제 인물의 이름을 넣지 마십시오**: 대신 외모를 묘사하십시오. 예를 들어 "한쪽으로 치우친 가르마의 곧은 금발 머리, 아몬드형 눈, 계란형 얼굴"과 같이 표현할 수 있습니다. 저희의 경우에는 이것만이 유일하게 효과적인 해결책이었습니다.
2. **네거티브 prompt를 정리하는 것은 괜찮지만, 근본적인 원인은 아닙니다**: Gemini 이미지 모델에는 별도의 네거티브 prompt 매개변수가 없으므로 긴 NEGATIVE 목록은 일반 텍스트로 인식됩니다. 이를 정리하면 prompt가 더 명확해지지만 `IMAGE_OTHER` 비율이 낮아지지는 않습니다.
3. **재시도에 의존하지 마십시오**: 실패율이 60%를 초과하는 상황에서 재시도는 도박이며 지연 시간만 늘어납니다. 대체 수단으로 클라이언트가 `IMAGE_OTHER` 발생 시 한 번 재시도할 수는 있지만, 진정한 해결책은 prompt입니다.
4. **배치 생성 전에 템플릿을 수정하십시오**: 명단(예: 선수당 카드 한 장)을 기반으로 생성하는 경우 prompt에 이름을 넣지 마십시오. 파일 이름이나 추후 레이아웃용으로만 이름을 사용하십시오.
5. **일관된 유사성이 필요한 경우 참조 이미지를 사용하십시오**: 특정 인물을 반드시 묘사해야 하는 경우 해당 인물의 승인을 받은 참조 이미지를 제공하고, [Nano Banana 이미지 생성 실패](/ko/faq/nano-banana-image-failure)에 명시된 실존 인물 및 미성년자 관련 제한 사항을 유념하십시오.

코드에서 세 가지 형태 구분:

```python theme={null}
def classify_no_image(resp: dict) -> str:
    if resp.get("promptFeedback", {}).get("blockReason"):
        return "input_blocked"        # see blockReason: OTHER troubleshooting
    cand = (resp.get("candidates") or [{}])[0]
    reason = cand.get("finishReason")
    if reason == "IMAGE_OTHER":
        return "output_filtered"      # rewrite names / restricted descriptions
    if reason == "NO_IMAGE":
        return "no_image_intent"      # see NO_IMAGE troubleshooting
    if reason in ("IMAGE_SAFETY", "IMAGE_PROHIBITED_CONTENT"):
        return "safety"               # explicit safety block, do not retry
    return "ok" if any("inlineData" in p for p in (cand.get("content") or {}).get("parts") or []) else "unknown"
```

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="닮게 해달라고 요청하지 않고 prompt에 이름만 언급해도 발동합니까?">
    그렇습니다. 자체 테스트 결과, “1:1 replica” 문구를 제거하고 이름만 유지했음에도 실패율은 여전히 4/6이었습니다. 모델이 이름을 인식하고 해당 인물을 닮게 그리기 때문입니다.
  </Accordion>

  <Accordion title="동일한 요청이 어떨 때는 성공하고 어떨 때는 실패하는 이유는 무엇입니까?">
    필터는 이미지가 생성된 후에 실행되므로, 결과는 해당 시점에 생성된 내용에 따라 달라집니다. 매 생성마다 결과가 다르므로 동일한 요청이라도 통과하거나 필터링될 수 있습니다.
  </Accordion>

  <Accordion title="그룹이나 채널을 변경한 후에 정상 작동한 이유는 무엇입니까?">
    출력 검사의 엄격도는 그룹마다 다를 수 있으므로 동일한 prompt라도 실패율이 다를 수 있습니다. 다만 그룹 라우팅은 시간이 지남에 따라 변동되므로 이러한 차이가 항상 지속되지는 않습니다. 따라서 prompt를 수정하는 것이 가장 안정적인 접근법입니다.
  </Accordion>

  <Accordion title="네거티브 prompt(NEGATIVE)가 도움이 됩니까?">
    Gemini 이미지 모델에는 별도의 네거티브 prompt(negative-prompt) 파라미터가 없으며, prompt에 포함된 NEGATIVE 목록은 일반 텍스트로 인식됩니다. 이는 `IMAGE_OTHER`에 아무런 영향을 미치지 않으며, 목록이 지나치게 길면 주요 묘사가 희석될 수 있습니다. 중요한 소수의 항목만 남기고 긍정문 형태로 표현하십시오(예: “no stadium, no grass...”와 같은 긴 목록 대신 “단색 흰색 배경”).
  </Accordion>

  <Accordion title="IMAGE_OTHER에 대해서도 과금됩니까?">
    제공업체는 `finishMessage`에서 해당 요청에 대해 과금되지 않는다고 명시하고 있습니다. 요청이 과금되었는지 확인하려면 APIYI 콘솔의 호출 로그를 확인하십시오.
  </Accordion>
</AccordionGroup>

## 여전히 문제가 해결되지 않으십니까? 지원팀에 문의하십시오

원활한 지원을 위해 다음 내용을 포함해 주십시오:

* 모델명 및 token 그룹;
* 전체 응답(최소 `finishReason`, `finishMessage` 및 `responseId`)과 `request ID`;
* 발생 시각(시간대 포함);
* 마스킹 처리된 prompt 및 확인하신 실패율.

<Warning>
  전체 API 키는 절대로 보내지 마십시오. 스크린샷이나 로그를 공유하기 전에 키를 마스킹 처리하십시오.
</Warning>

<CardGroup cols={2}>
  <Card title="WeCom 고객지원" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeCom 고객지원 QR 코드" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    QR 코드를 스캔하거나 이 카드를 클릭하여 지원팀에 직접 문의하십시오.
  </Card>

  <Card title="이메일 고객지원" icon="mail">
    **고객지원**: [support@apiyi.com](mailto:support@apiyi.com)

    제목에 “IMAGE\_OTHER” 및 모델명을 포함해 주시기를 권장합니다.
  </Card>
</CardGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="Gemini Image API에서 NO_IMAGE가 반환되는 이유" icon="image-off" href="/ko/faq/gemini-no-image">
    불명확한 prompt 의도로 인한 이미지 누락 및 해결 방법
  </Card>

  <Card title="Gemini Image에서 blockReason: OTHER가 반환되는 이유" icon="shield-alert" href="/ko/faq/gemini-image-input-blocked">
    생성 전 차단된 참조 이미지 확인 및 전처리 권장 사항
  </Card>

  <Card title="Nano Banana 이미지 생성 실패" icon="image-off" href="/ko/faq/nano-banana-image-failure">
    안전성, 워터마크 제거, 유명 IP, 미성년자 등을 포함한 일반적인 원인
  </Card>

  <Card title="Gemini Image API 오류 처리" icon="triangle-alert" href="/ko/api-capabilities/gemini-image-error-handling">
    전체 응답 확인 순서 및 사용자 친화적인 오류 메시지
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.