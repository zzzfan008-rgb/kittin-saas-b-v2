> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 공식 웹 앱과 API가 서로 다른 결과를 내는 이유

> 같은 모델인데도 왜 Claude.ai나 ChatGPT가 API보다 더 똑똑하게 느껴질까요? 웹 앱이 추가하는 엔지니어링 계층과 이를 API로 재현하는 방법을 설명합니다

## 짧은 답변

<Info>
  **동일한 모델입니다. 차이는 웹 앱에 둘러싸인 전체 엔지니어링 레이어에 있습니다.**

  비유하자면: **웹 앱은 가구가 완비된 아파트이고, API는 뼈대만 있는 빈 껍데기입니다.**

  * **가구 완비(claude.ai / chatgpt.com)**: system prompt, 웹 검색, 코드 실행, 파일 파싱, 대화 메모리, 컨텍스트 관리가 모두 미리 설치되어 있어 그대로 입주하면 됩니다.
  * **빈 껍데기(API)**: 핵심 모델 기능만 제공됩니다(내력벽, 배관, 배선). 검색, tools, 메모리, 컨텍스트는 사용자가 직접 설정해야 합니다.

  따라서 "API가 더 멍청하게 느껴진다"는 것은 보통 모델이 다운그레이드되거나 가짜로 교체되었다는 뜻이 아닙니다. **그냥 가구가 없는 버전을 받은 것뿐입니다.**
</Info>

## 웹 앱은 실제로 무엇을 더해 주는가?

공식 제품은 모델 위에 보이지 않는 엔지니어링을 대량으로 쌓아 올립니다. 이 중 어느 것도 모델 가중치 안에 들어 있지 않으며, API에는 기본으로 포함되어 있지 않습니다:

<CardGroup cols={2}>
  <Card title="시스템 prompt" icon="file-text">
    웹 앱은 매 턴마다 수천 token에 이르는 숨겨진 prompt를 주입합니다. 정체성, 어조, 답변 길이, 서식 선호, 거부 경계, Markdown 규칙 등이 여기에 포함됩니다.

    이것이 웹 앱이 “더 인간적으로 들리고, 서식이 더 좋으며, 자신이 누구인지 아는” 가장 큰 이유입니다.
  </Card>

  <Card title="내장 도구" icon="wrench">
    웹 검색, 페이지 가져오기, 계산기로 쓰이는 코드 샌드박스, 파일 및 이미지 파싱, 차트 렌더링, Artifacts / Canvas 등입니다.

    웹 앱은 오늘의 뉴스에 대해 묻거나 계산을 시키면 자동으로 도구를 호출합니다. 도구가 설정되어 있지 않으면 API는 추측만 할 수 있습니다.
  </Card>

  <Card title="메모리와 기록" icon="brain">
    웹 앱은 대화 기록, 세션 간 메모리, 프로젝트 지식 베이스를 저장합니다.

    API는 **완전히 무상태**입니다: 이전 턴을 `messages`에 넣지 않으면, 모델은 아무것도 기억하지 못합니다.
  </Card>

  <Card title="컨텍스트 관리" icon="scissors">
    긴 대화에서는 웹 앱이 자동으로 이전 조각을 요약하고, 잘라 내고, 검색하여 제한 안에 머뭅니다.

    API에서는 잘라 내기, 요약, RAG를 직접 구현해야 합니다.
  </Card>

  <Card title="기본 매개변수와 thinking budget" icon="settings">
    웹 앱은 temperature, max output length, reasoning effort를 대신 선택합니다. 일부 제품은 질문을 다른 model이나 thinking tier로 **자동 라우팅**하기도 합니다.

    API는 기본값을 사용하며, 이는 종종 웹 앱의 설정과 다릅니다.
  </Card>

  <Card title="후처리와 렌더링" icon="monitor">
    인용 배지, 구문 강조, 표 렌더링, 접기 가능한 reasoning은 모두 프런트엔드 작업입니다.

    API는 평문이나 JSON을 반환하므로, 자연스럽게 더 소박해 보입니다.
  </Card>
</CardGroup>

## 한눈에 보는 차이점

| 기능                          | 공식 웹 앱        | 직접 API 호출                                                   |
| --------------------------- | ------------- | ----------------------------------------------------------- |
| 모델 가중치                      | 동일            | 동일                                                          |
| 시스템 prompt                  | 제공업체가 삽입(비공개) | 없음 — 직접 작성                                                  |
| 웹 검색                        | 내장, 자동 실행     | tools를 활성화하거나 검색을 직접 연동                                     |
| 수학 / 코드 실행                  | 내장 샌드박스       | tool calling을 직접 구현                                         |
| 파일 및 이미지 파싱                 | 내장            | 직접 업로드하거나 Base64 인코딩                                        |
| 대화 메모리                      | 자동 저장         | 상태 비저장 — 기록을 직접 전달([API에 메모리가 있나요?](/ko/faq/api-memory) 참조) |
| 컨텍스트 오버플로                   | 자동으로 압축       | 직접 잘라내거나 요약                                                 |
| 파라미터(temperature, thinking) | 제공업체가 조정      | 기본값 — 직접 맞춤                                                 |
| 출력 형식                       | 프런트엔드에서 렌더링   | 일반 텍스트 / JSON                                               |

## 각각의 차이는 무엇 때문에 발생합니까?

<AccordionGroup>
  <Accordion title="API는 최근 뉴스나 사건을 알지 못합니다">
    모델의 지식은 학습 종료 시점에서 멈춥니다. 웹 앱은 **내장 웹 검색**으로 그 공백을 메웁니다.

    API는 기본적으로 검색하지 않습니다. 해결책: 지원되는 검색 도구(`web_search`, `google_search`)를 호출하거나, 자체 검색 API를 연결해 결과를 컨텍스트에 넣으십시오.

    <Warning>
      검색 도구는 **호출당 유료 기능**이며, 모델 token과는 별도로 과금됩니다. 요금은 [모델 요율 배수](/ko/faq/model-multiplier)를 참조하십시오.
    </Warning>
  </Accordion>

  <Accordion title="API가 산술이나 단어 수를 잘못 셉니다">
    웹 앱은 계산을 위해 샌드박스에서 코드를 조용히 작성하고 실행합니다. 순수한 모델은 암산을 하므로 오류는 예상할 수 있습니다.

    해결책: 계산기나 코드 실행 도구를 연결하거나, prompt에서 단계별 과정을 보여 달라고 요청하십시오.
  </Accordion>

  <Accordion title="API 응답은 훨씬 짧고 덜 다듬어져 있습니다">
    웹 앱의 system prompt에는 구조, 길이, Markdown 서식에 대한 광범위한 규칙이 들어 있습니다.

    해결책: 원하는 스타일을 직접 system prompt에 넣으십시오 — "섹션 제목을 사용하십시오", "결론을 먼저 쓰고 그다음 세부 사항을 설명하십시오", "코드에는 항상 주석을 추가하십시오".
  </Accordion>

  <Accordion title="API에서는 모델이 자신이 누구인지 알지 못하거나 잘못된 버전을 말합니다">
    "나는 누구인가"는 모델 가중치에 저장된 적이 없습니다. 웹 앱은 system prompt를 통해 정체성을 고정합니다.

    참조: [LLM은 왜 자신의 버전 번호를 알지 못합니까?](/ko/faq/model-version-identity) 및 [Claude는 왜 스스로를 Qwen이나 DeepSeek이라고 부릅니까?](/ko/faq/claude-identity-confusion)
  </Accordion>

  <Accordion title="API가 앞서 한 말을 잊어버립니다">
    API는 상태 비저장입니다 — 모든 요청은 완전히 새로운 대화입니다. 웹 앱이 대화 기록을 대신 붙여줍니다.

    해결책: 이전 대화 전부를 `messages` 배열에 포함시키십시오. 이렇게 하면 입력 token이 늘어나므로, 비용을 낮추려면 [프롬프트 캐싱](/ko/faq/cache-billing)과 함께 사용하십시오.
  </Accordion>

  <Accordion title="같은 질문을 하면 매번 다른 답이 나옵니다">
    그것은 오류가 아니라 샘플링 무작위성입니다. 웹 앱도 같은 방식으로 동작하지만, 같은 질문을 두 번 하는 경우가 드뭅니다.

    해결책: `temperature`을 낮추거나(예: 0.2), prompt에서 출력 형식을 명시적으로 제한하십시오.
  </Accordion>

  <Accordion title="API 추론이 더 얕게 느껴집니다">
    많은 웹 앱은 기본적으로 높은 추론 예산으로 실행되지만, API의 기본값은 보통 더 낮거나 꺼져 있습니다.

    해결책: `reasoning_effort` / `thinking`를 명시적으로 높게 설정하고 최대 출력 길이를 늘리십시오. [max\_tokens](/ko/faq/max-tokens)를 참조하십시오.
  </Accordion>
</AccordionGroup>

## API로 웹앱 경험을 재현하는 방법

<Steps>
  <Step title="1단계: 자체 system prompt 작성">
    노력 대비 효과가 가장 큽니다. 정체성, 어조, 출력 형식, 답변 길이, 경계를 정의합니다.

    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(
        api_key="YOUR_API_KEY",
        base_url="https://api.apiyi.com/v1"
    )

    SYSTEM_PROMPT = """You are a professional technical assistant.
    - Lead with the conclusion, then the reasoning
    - Use Markdown headings to structure the answer
    - Code must be runnable and include key comments
    - Flag anything uncertain; never fabricate"""
    ```
  </Step>

  <Step title="2단계: 대화 기록을 직접 유지합니다">
    웹앱의 메모리를 모방하기 위해 모든 사용자 메시지와 모델 답변을 `messages`에 추가합니다.

    ```python theme={null}
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    def chat(user_input):
        messages.append({"role": "user", "content": user_input})
        resp = client.chat.completions.create(
            model="claude-opus-5",
            messages=messages,
        )
        reply = resp.choices[0].message.content
        messages.append({"role": "assistant", "content": reply})
        return reply
    ```
  </Step>

  <Step title="3단계: 필요한 도구를 연결합니다">
    최신 정보를 위한 검색, 정확한 계산을 위한 코드 실행, 내부 문서를 위한 RAG를 연결합니다. [Function calling](/ko/api-capabilities/openai/function-calling) 및 [Web search](/ko/api-capabilities/openai/web-search)를 참조하십시오.
  </Step>

  <Step title="4단계: 매개변수를 맞춥니다">
    `temperature`, `max_tokens`, 그리고 사고 단계를 기본값에 의존하지 않고 명시적으로 설정합니다. 웹앱의 깊이에 맞추려면 보통 reasoning effort를 높여야 합니다.
  </Step>

  <Step title="5단계: 긴 컨텍스트를 처리합니다">
    대화가 길어질수록 이를 요약하거나 마지막 N턴과 핵심 사실만 유지하여 컨텍스트 윈도우 안에 머무르십시오. 캐싱을 사용하면 반복되는 접두사의 비용을 크게 줄일 수 있습니다.
  </Step>
</Steps>

<Tip>
  **처음부터 직접 구축하고 싶지 않으신가요?** 대신 성숙한 클라이언트를 사용하십시오 — Cherry Studio, ChatWise, LobeChat, Cursor, Claude Code 등은 이미 system prompts, 기록 관리, 도구 호출을 묶어 제공합니다. APIYI base URL과 키를 입력하면 웹앱에 가까운 경험을 얻을 수 있습니다. [Base URL configuration](/ko/faq/base-url-config)를 참조하십시오.
</Tip>

## 알아두면 좋은 경계

<Warning>
  **API는 웹 앱을 100% 그대로 재현할 수 없습니다. 이러한 한계는 실제입니다:**

  1. **벤더는 시스템 프롬프트를 공개하지 않습니다.** 커뮤니티 버전은 리버스 엔지니어링한 추정치이며 릴리스마다 달라집니다.
  2. **일부 웹 기능에는 API가 없습니다.** 특정 메모리 시스템과 전체 Artifacts / Canvas 상호작용은 노출되지 않습니다.
  3. **웹 앱은 끊임없이 A/B 실험을 실행합니다.** 같은 날이라도 두 사용자가 서로 다른 프롬프트와 라우팅 정책을 받을 수 있습니다.
  4. **웹 앱은 모델을 자동으로 전환할 수 있습니다.** 일부 제품은 쉬운 질문을 더 작고 빠른 모델로 라우팅하지만, API는 사용자가 지정한 모델을 정확히 사용합니다. 이것도 결과가 달라지는 원인입니다.

  반대로 API는 **제어권**을 제공합니다: prompt, parameters, tools, and context는 모두 사용자에게 있으므로, 결과를 재현 가능하고 버전 관리 가능하게 만들 수 있습니다. 이는 제품을 출시하는 데 필요한 조건입니다.
</Warning>

<Info>
  **APIYI에서의 위치**: APIYI는 순수한 API 게이트웨이입니다. 요청은 **그대로 전달되며, prompt 주입도 재작성도 없습니다.** APIYI를 통한 동작은 공식 API에 직접 호출하는 것과 같습니다. 빈 껍데기는 빈 껍데기일 뿐입니다. 우리는 그 안을 꾸며 넣지도, 뒤에서 몰래 벽을 허물지도 않습니다.
</Info>

## 관련 질문

<CardGroup cols={2}>
  <Card title="LLM은 왜 자신의 버전 번호를 알지 못합니까?" icon="circle-question-mark" href="/ko/faq/model-version-identity">
    모델 정체성의 근본 원리
  </Card>

  <Card title="Claude는 왜 자신을 Qwen 또는 DeepSeek이라고 부릅니까?" icon="venetian-mask" href="/ko/faq/claude-identity-confusion">
    정체성 혼란에 대한 자세한 설명
  </Card>

  <Card title="올바른 모델은 어떻게 선택합니까?" icon="compass" href="/ko/faq/model-selection-guide">
    각 모델의 강점과 활용 사례
  </Card>

  <Card title="Base URL를 어떻게 구성합니까?" icon="link" href="/ko/faq/base-url-config">
    여러 클라이언트에서 APIYI를 연결합니다
  </Card>
</CardGroup>

## 문의하기

<CardGroup cols={2}>
  <Card title="WeCom 지원" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="WeCom 지원 QR 코드" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    QR 코드를 스캔하거나 [클릭하여 지원에 문의](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    통합 관련 문의 및 기술 지원
  </Card>

  <Card title="이메일" icon="mail">
    **지원**: [support@apiyi.com](mailto:support@apiyi.com)

    **비즈니스**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>
