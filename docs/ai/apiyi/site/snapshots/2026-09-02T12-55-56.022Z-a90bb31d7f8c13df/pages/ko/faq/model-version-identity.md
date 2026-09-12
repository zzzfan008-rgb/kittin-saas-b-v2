> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 왜 AI 모델은 자신의 버전을 알지 못합니까?

> AI 모델이 API를 통해 호출될 때 자신의 버전을 정확하게 식별할 수 없는 이유와 웹 앱과 API 호출의 차이를 설명합니다.

## 짧은 답변

<Info>
  **이는 완전히 정상이며 모델 기능에는 영향을 주지 않습니다.**

  모델의 이름은 학습이 끝난 뒤에 지정됩니다. 즉, 모델 자체는 자신의 정체성을 “학습”한 적이 없습니다. 공식 웹 앱(예: claude.ai 또는 chatgpt.com)은 모델에게 “자신이 누구인지” 알려 주는 내장 System Prompt를 포함하고 있으므로 올바르게 답변할 수 있습니다. 기본적으로 API 호출에는 이 정보가 포함되지 않으므로, 모델이 자신의 버전을 “잘못 추측”하게 됩니다.
</Info>

## 실제 사례

<Warning>
  **일반적인 상황**

  API를 통해 Claude Sonnet 4.5를 호출하고 "당신은 어떤 모델입니까?"라고 물으면, "저는 Claude 3.5 Sonnet입니다."라고 답할 수 있습니다. 이것은 **잘못된 모델을 호출했다는 뜻이 아닙니다** — 모델은 단지 자신의 이름을 알지 못할 뿐입니다.

  같은 일은 GPT-4o, Gemini, 그리고 다른 모든 모델에서도 발생합니다 — 이는 대규모 언어 모델의 보편적인 특성이지, APIYI에만 해당하는 문제가 아닙니다.
</Warning>

## 간단한 비유

<Card title="배우의 비유" icon="drama">
  매우 숙련된 배우를 떠올려 보십시오:

  * **기술**은 수년간의 훈련에서 비롯됩니다(모델의 학습 과정과 같습니다)
  * **배역 이름**은 촬영 전에 감독이 알려줍니다(System Prompt와 같습니다)
  * 아무도 그들이 어떤 역할을 맡았는지 알려주지 않으면, 여전히 재능은 있지만 **자신의 배역 이름을 모릅니다**

  AI 모델도 마찬가지입니다. 능력은 학습 데이터에서 나오지만, "나는 Claude Sonnet 4.5입니다"라는 정체성은 명시적으로 제공되어야 합니다.
</Card>

## 기술 설명

<AccordionGroup>
  <Accordion title="왜 모델은 자신의 이름을 모릅니까?">
    **모델 이름은 학습 후에 정해집니다**

    대규모 언어 모델의 개발 과정은 다음과 같습니다:

    1. **데이터 수집** → 학습 코퍼스 준비
    2. **모델 학습** → 언어 이해와 생성을 학습
    3. **평가 및 미세 조정** → 모델 성능 최적화
    4. **이름 지정 및 출시** → 이름을 부여함(예: “Claude Sonnet 4.5”)

    학습이 2단계에서 끝나면, 4단계의 이름은 아직 존재하지 않습니다. 학습 데이터에는 이전 모델 버전의 이름(예: Claude 3.5 Sonnet)이 포함되어 있을 수 있으므로, 질문을 받으면 모델은 이전에 본 이름을 “추측”합니다.

    **비유**: 사람이 태어나기 전에 자신의 이름을 알 수 없는 것과 같습니다 — 이름은 태어난 뒤에 주어집니다.
  </Accordion>

  <Accordion title="공식 웹 앱은 왜 정확하게 답할 수 있습니까?">
    **내장 시스템 프롬프트의 역할**

    claude.ai나 chatgpt.com에서 대화하면, 공식 웹 앱은 각 대화의 시작 부분에 숨겨진 시스템 프롬프트를 자동으로 삽입하는데, 대략 다음과 같습니다:

    ```
    You are Claude, developed by Anthropic. Your model version is Claude Sonnet 4.5...
    ```

    이 프롬프트는 사용자에게 보이지 않지만, 모델은 이를 “읽기” 때문에 자신이 누구인지 알게 됩니다.

    **따라서**: 모델은 본래 자신의 이름을 아는 것이 아니라 — 공식 웹 앱이 매번 “기억시켜” 주는 것입니다.
  </Accordion>

  <Accordion title="왜 API는 다릅니까?">
    **API 호출에는 기본적으로 식별 정보가 포함되지 않습니다**

    API로 모델을 호출할 때는 다음만 전송합니다:

    * `model` 매개변수(서버에 어떤 모델을 사용할지 알려줍니다)
    * `messages` 배열(대화 내용)
    * 선택적 `system` 매개변수(사용자 지정 시스템 프롬프트)

    `model` 매개변수는 **서버**를 위한 라우팅 정보입니다 — 모델 자체는 이 필드를 읽을 수 없습니다. `system` 프롬프트에 모델의 정체성을 지정하지 않으면, 모델은 훈련 데이터를 바탕으로 “추측”할 수밖에 없습니다.

    **이 내용은 모든 API 플랫폼에 적용됩니다** — 공식 API든, APIYI든, 그 밖의 어떤 제공자든 동작은 정확히 동일합니다.
  </Accordion>
</AccordionGroup>

## 실제로 호출 중인 모델을 확인하는 방법

<CardGroup cols={2}>
  <Card title="호출 로그 확인" icon="file-text" href="/ko/faq/call-logs">
    APIYI 콘솔의 **호출 로그**에서 각 요청에 사용된 실제 모델 이름을 확인할 수 있습니다. 이는 가장 정확한 확인 방법입니다.
  </Card>

  <Card title="API 응답 확인" icon="code">
    모든 API 응답 JSON에는 실제로 호출된 모델 버전을 명확하게 식별하는 `model` 필드가 포함되어 있습니다.

    ```json theme={null}
    {
      "model": "claude-sonnet-4-5-20250514",
      "choices": [...]
    }
    ```
  </Card>
</CardGroup>

## APIYI 서비스 보장

<Tip>
  **APIYI는 공식 릴레이를 통해 요청을 전달합니다 — 모델 품질은 원본과 동일합니다.**

  * APIYI는 OpenAI, Anthropic, Google 등의 공식 API로 요청을 직접 전달합니다.
  * 모델이 자신의 정체성을 알지 못하는 것은 모든 API 플랫폼에서 보편적인 현상입니다.
  * 호출 로그와 API 응답의 `model` 필드를 통해 실제로 호출된 모델을 확인할 수 있습니다.
  * 의문이 있으시면 언제든지 기술팀에 문의하여 확인하실 수 있습니다.
</Tip>

## 모델이 자신을 올바르게 식별하도록 하는 방법

API 호출에 `system` 매개변수를 추가하여 모델에 자신의 정체성을 알려 주기만 하면 됩니다:

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="your-api-key",
    base_url="https://vip.apiyi.com/v1"
)

response = client.chat.completions.create(
    model="claude-sonnet-4-5-20250514",
    messages=[
        {
            "role": "system",
            "content": "You are Claude Sonnet 4.5, an AI assistant developed by Anthropic."
        },
        {
            "role": "user",
            "content": "What model are you?"
        }
    ]
)

print(response.choices[0].message.content)
# Output: I am Claude Sonnet 4.5, developed by Anthropic.
```

<Info>
  **팁**: 이 방식은 공식 웹 앱과 정확히 동일하게 동작합니다. 즉, System Prompt를 통해 모델에 자신의 정체성을 알려 주는 것입니다. 추가하면 모델은 “내가 누구인가요”에 올바르게 답할 수 있습니다.
</Info>

## 관련 질문

<CardGroup cols={2}>
  <Card title="적합한 모델을 선택하는 방법은?" icon="compass" href="/ko/faq/model-selection-guide">
    다양한 모델의 기능과 사용 사례에 대해 알아보십시오
  </Card>

  <Card title="일부 모델을 사용할 수 없는 이유는 무엇입니까?" icon="lock" href="/ko/faq/model-availability">
    모델 권한과 사용자 등급에 대해 알아보십시오
  </Card>

  <Card title="호출 로그를 보는 방법은?" icon="file-text" href="/ko/faq/call-logs">
    실제로 호출된 모델 버전을 확인하십시오
  </Card>

  <Card title="API 호출 오류?" icon="triangle-alert" href="/ko/faq/invalid-api-key">
    일반적인 API 오류 문제 해결 가이드
  </Card>
</CardGroup>

## 문의하기

<CardGroup cols={2}>
  <Card title="기업 WeChat" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="기업 WeChat QR 코드" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    QR 코드를 스캔하거나 [클릭하여 지원팀에 문의](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    모델 검증, 기술 지원
  </Card>

  <Card title="이메일" icon="mail">
    **지원**: [support@apiyi.com](mailto:support@apiyi.com)

    **비즈니스**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
