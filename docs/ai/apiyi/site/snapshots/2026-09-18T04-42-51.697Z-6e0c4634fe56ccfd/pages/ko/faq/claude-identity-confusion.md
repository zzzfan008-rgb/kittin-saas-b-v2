> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude가 Qwen이나 DeepSeek이라고 주장하는 이유

> Claude(특히 AWS를 통해 사용할 때)가 '당신은 어떤 모델입니까?'라는 질문에 무작위로 답하면서 때로는 Qwen이나 DeepSeek이라고 주장하는 이유: 모델의 진위와는 무관한 업계 전반의 LLM 특성

## 짧은 답변

<Info>
  **이는 완전히 정상입니다. 이것은 모델이 가짜라는 뜻이 아니며, 모델 성능에도 영향을 주지 않습니다.**

  LLM이 "어떤 모델입니까?"라는 질문에 답하는 내용은 **본질적으로 신뢰할 수 없습니다** — 27개의 주요 LLM을 대상으로 한 체계적인 학술 연구에서는 약 26%가 "정체성 혼란"을 보인 것으로 나타났으며, 근본 원인은 모델 교체나 재포장이 아니라 **환각**입니다. Claude를 API를 통해 직접 호출할 때는 정체성을 고정하는 시스템 프롬프트가 없으며, 중국어로 물으면 중국어 학습 데이터의 영향도 추가로 받아 자주 본 이름, 즉 Qwen이나 DeepSeek 같은 이름을 "추측"할 수 있습니다.
</Info>

## 증상

<Warning>
  **전형적인 상황**

  AWS 채널을 통해 Claude에 접속해 「당신은 어떤 모델입니까?」라고 물으면:

  * 어떤 때는 「저는 Claude 4.5입니다」라고 답합니다
  * 어떤 때는 「저는 Qwen입니다」라고 주장합니다
  * 어떤 때는 「저는 DeepSeek입니다」라고 말합니다
  * 특히 중국어로 질문할 때 이런 현상이 두드러지며, 실행할 때마다 답변이 바뀔 수 있습니다

  **핵심 관찰**: 같은 모델이 일반적인 사용, 코딩, 기타 복잡한 작업에서는 매우 잘 동작합니다. 오직 「자기 식별」 답변만 혼란스럽습니다. 이는 문제가 모델의 능력이 아니라 「정체성 인식」에 있음을 보여줍니다.
</Warning>

<Info>
  **공식 AWS 콘솔에서도 재현되며, 어떤 릴레이 채널과도 무관합니다**

  이 현상은 **AWS Bedrock 콘솔의 내장 추론 인터페이스(Playground / Chat)** 에서도 쉽게 재현할 수 있습니다. Amazon의 공식 콘솔에서 Claude에게 직접 「당신은 어떤 모델입니까?」라고 묻기만 하면 됩니다. APIYI나 다른 서드파티 릴레이는 전혀 개입되지 않으며, Qwen이나 DeepSeek이라고 주장하는 동일한 답변을 볼 수 있습니다.

  이는 혼란스러운 자기 식별이 채널 문제가 아니라 업스트림 모델의 고유한 동작임을 직접 증명합니다. Bedrock 콘솔에서 재현 영상을 녹화해 두었습니다:

  * 📹 **지원팀에 영상 파일을 요청하십시오**: 아래 WeCom 지원을 추가하면 전체 재현 영상을 받을 수 있습니다
  * 📺 **지원팀의 WeCom Channels 피드에서 시청하십시오**: 데모 영상이 그곳에 게시되어 있으니 자유롭게 시청하고 댓글을 남기시면 됩니다
</Info>

## 근본 원인 분석

<AccordionGroup>
  <Accordion title="이유 1: 모델은 처음부터 안정적인 내적 정체성을 가지지 않습니다">
    모델의 이름은 학습이 완료된 **후에** 부여됩니다. 가중치에는 "내가 누구인지"가 한 번도 들어 있지 않았습니다. API 요청의 `model` 매개변수는 서버를 위한 라우팅 정보이며, 모델 자체는 이를 전혀 보지 못합니다.

    공식 웹 앱(claude.ai)이 올바르게 답하는 이유는 모든 대화에 "당신은 Claude입니다"라고 알리는 숨겨진 system prompt가 주입되기 때문입니다. 직접 API 호출에는 기본적으로 그런 prompt가 없으므로, 모델은 학습 데이터에서만 "추측"할 수 있습니다.

    자세한 설명은 다음을 참조하십시오: [LLM은 왜 자기 버전 번호를 알지 못할까요?](/ko/faq/model-version-identity)
  </Accordion>

  <Accordion title="이유 2: 중국어 학습 데이터 오염이 중국 모델 쪽 추측을 편향시킵니다">
    Qwen과 DeepSeek는 중국 인터넷에서 가장 많이 논의되는 모델입니다. 이들의 자기소개, API 예제, 채팅 스크린샷은 중국어 말뭉치에 과도하게 축적되어 있으며, Claude의 학습 데이터에도 그 말뭉치가 포함됩니다.

    정체성 고정이 약할 때(시스템 prompt가 없을 때) 그리고 질문이 **중국어로** 제시되면, 중국어 문맥에서 가장 "자연스러운" 완성은 이런 고빈도 중국 모델 이름 중 하나일 가능성이 큽니다. 이것이 영어로 바꾸거나 질문을 다시 표현하면 답이 달라지는 이유도 설명합니다.
  </Accordion>

  <Accordion title="이유 3: 학술 연구가 이것이 업계 전반의 문제임을 확인합니다">
    2024년 체계적 연구 "I'm Spartacus, No, I'm Spartacus: Measuring and Understanding LLM Identity Confusion"은 주요 LLM 27개를 테스트해 약 \*\*26%\*\*가 정체성 혼동을 보인다고 밝혔으며, 근본 원인이 **환각이며 모델 복사나 대체가 아님**을 확인했습니다.

    반대 사례도 마찬가지로 흔합니다. 초기 DeepSeek 버전은 자신을 ChatGPT라고 주장했고, GLM은 자신을 Claude라고 주장했으며, Gemini는 특정 언어에서 다른 벤더의 모델이라고 주장한 적이 있습니다. 자기 식별은 결코 신뢰할 수 있는 정보가 아니었습니다.

    논문(방문하려면 복사): `arxiv.org/abs/2411.10683`
  </Accordion>

  <Accordion title="의도적인 것입니까? (안티 디스틸레이션 이론)">
    커뮤니티에서 널리 퍼진 이론은 다음과 같습니다. 벤더가 모델 가중치에 정체성을 굳이 넣지 않는 이유는 일부는 기술적으로 불필요하기 때문이고(웹 앱은 system prompt에 의존함), 일부는 느슨하게 정의된 자기 식별을 증류된 모델이 모방하기 더 어렵기 때문입니다.

    분명히 말씀드리면, 이는 커뮤니티의 추측이며 어떤 벤더도 정확한 자기 식별을 기능으로 약속한 적은 없습니다. 확실한 것은 **어떤 주요 벤더도 bare-API 모델이 자기 이름을 올바르게 답할 수 있다고 보장하지 않는다는 점**입니다.
  </Accordion>
</AccordionGroup>

## 왜 혼란스러운 답변이 실제 베어 모델 동작과도 맞아떨어지는가

<Card title="일관된 이야기가 필요한 것은 재포장된 모델뿐입니다" icon="shield-check">
  bare API를 통해 호출된 진짜 모델에는 정체성 prompt가 아예 없으므로, 그 답변은 자연스럽게 무작위적이며 언어 간에도 흔들립니다 — 오늘은 Claude 4.5이고 내일은 Qwen입니다.

  재포장되었거나 모델이 교체된 플랫폼은 정반대입니다. 노출을 피하기 위해, 이런 플랫폼은 종종 **모델이 일관되게 “I am Claude”라고 주장하도록 강제하는 prompt를 주입합니다**. 따라서 의심스러울 정도로 매끈하고 언제나 일관된 자기소개가 반드시 신뢰할 수 있는 것은 아닙니다 — 반면 혼란스러운 답변은 오히려 정체성 주입이 없는 베어 모델의 동작과 일치합니다.

  다만 혼란스러운 답변만으로 진위를 증명할 수는 없습니다 — 아래의 신뢰할 수 있는 검증 방법을 참고하십시오.
</Card>

## 진짜 Claude를 사용 중인지 확인하는 방법

<CardGroup cols={2}>
  <Card title="API 응답에서 model 필드를 확인하십시오" icon="code">
    모든 API 응답 JSON에는 실제로 사용된 모델을 식별하는 `model` 필드가 포함됩니다:

    ```json theme={null}
    {
      "model": "claude-sonnet-4-5-20250514",
      "choices": [...]
    }
    ```
  </Card>

  <Card title="호출 로그를 확인하십시오" icon="file-text" href="/ko/faq/call-logs">
    APIYI 콘솔의 **호출 로그**에는 각 요청에 실제로 사용된 모델이 표시됩니다.
  </Card>

  <Card title="복잡한 작업에서 비교해 보십시오" icon="flask-conical">
    자기 식별은 신뢰할 수 없지만, **성능은 거짓말하지 않습니다**. 동일한 코딩 문제나 긴 컨텍스트 작업을 여러 모델에서 실행해 보십시오 — Claude의 코드 스타일과 추론 체인은 Qwen/DeepSeek와 뚜렷하게 다릅니다.
  </Card>

  <Card title="기술팀에 문의하십시오" icon="message-circle">
    아직도 의문이 남는다면, APIYI 기술팀이 채널과 모델 출처를 확인하는 데 도움을 드릴 수 있습니다.
  </Card>
</CardGroup>

## 모델이 자신의 정체를 올바르게 답하게 하는 방법

공식 웹 앱이 하는 방식과 정확히 같습니다. 요청에 시스템 프롬프트를 추가하면 됩니다:

```python theme={null}
messages=[
    {
        "role": "system",
        "content": "You are Claude, an AI assistant developed by Anthropic."
    },
    {
        "role": "user",
        "content": "What model are you?"
    }
]
```

<Tip>
  **APIYI 서비스 보장**: APIYI의 Claude(AWS 채널 포함)는 공식 출처에서 전달되며, 요청은 그대로 전달되고 프롬프트는 주입되지 않습니다. 모델이 “자신이 누구인지 모르는 것”은 모든 bare-API 플랫폼에서 흔한 현상이며 채널의 진정성과는 무관합니다.
</Tip>

## 관련 질문

<CardGroup cols={2}>
  <Card title="LLM은 왜 자기 버전 번호를 알지 못합니까?" icon="circle-question-mark" href="/ko/faq/model-version-identity">
    정체성 문제의 근본 원리
  </Card>

  <Card title="호출 로그를 확인하는 방법은 무엇입니까?" icon="file-text" href="/ko/faq/call-logs">
    실제로 사용된 모델 버전을 확인합니다
  </Card>

  <Card title="올바른 모델을 선택하는 방법은 무엇입니까?" icon="compass" href="/ko/faq/model-selection-guide">
    각 모델의 강점과 활용 사례를 알아봅니다
  </Card>

  <Card title="모델 이름의 -c 접미사는 무엇을 의미합니까?" icon="tag" href="/ko/faq/model-name-suffix-c">
    모델 명명 접미사를 이해합니다
  </Card>
</CardGroup>

## 문의하기

<CardGroup cols={2}>
  <Card title="웨콤 지원" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="웨콤 지원 QR 코드" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    QR 코드를 스캔하거나 [클릭하여 지원팀에 문의](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)하십시오.

    모델 검증 및 기술 지원
  </Card>

  <Card title="이메일" icon="mail">
    **지원**: [support@apiyi.com](mailto:support@apiyi.com)

    **비즈니스**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
