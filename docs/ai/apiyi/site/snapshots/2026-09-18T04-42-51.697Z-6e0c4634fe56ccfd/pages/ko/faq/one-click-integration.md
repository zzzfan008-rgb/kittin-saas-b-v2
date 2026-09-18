> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 원클릭 통합이 가능한가요?

> 예, 하지만 버튼 형태는 아닙니다. 문서를 AI 코딩 어시스턴트에 전달하면 AI 코딩 어시스턴트가 통합을 대신 수행합니다.

## 빠른 답변

**예, 하지만 버튼은 아닙니다.**

전통적인 의미에서 “한 번 클릭하면 구성되는” 통합 기능은 제공하지 않습니다. 모델마다 프로토콜, 매개변수 및 인증 방식이 다르므로 이러한 버튼은 기본적인 채팅만 지원할 수 있으며 실제 요구 사항을 해결하지 못합니다.

대신 저희가 제공하는 방식이 더 효과적입니다. **문서를 AI 코딩 어시스턴트에게 제공하고 통합을 맡기면 됩니다**. 계정을 등록하고 키를 복사하기만 하면 됩니다. 모델 선택, 기본 URL 입력, 코드 작성 및 디버깅은 모두 AI에 맡길 수 있습니다.

<CardGroup cols={2}>
  <Card title="AI에게 통합 맡기기" icon="bot" href="/ko/getting-started">
    시작하기 페이지에는 Codex, Claude Code 및 Cursor에서 사용할 수 있는 복사 가능한 prompt가 있습니다.
  </Card>

  <Card title="AI 개발 키트" icon="blocks" href="/ko/developer-kit">
    코딩 에이전트를 위한 스킬, CLI, 계약 및 모델 레지스트리를 제공하며, 각각 고유한 prompt가 있습니다.
  </Card>
</CardGroup>

## 네 가지 사용 방법

<Steps>
  <Step title="사이트 전체에 적용되는 skill(권장)">
    에이전트가 `npx skills add https://docs.apiyi.com`을 실행하여 APIYI skill을 설치하도록 하십시오. 실패하면 `https://docs.apiyi.com/skill.md`을 직접 읽도록 하십시오.

    이 파일은 머신을 위해 작성되었습니다. 엔드포인트, 인증, 모델 이름 지정 규칙, 알려진 문제와 검증 체크리스트가 포함되어 있습니다. 이를 읽으면 에이전트가 필요한 모든 배경 정보를 얻을 수 있습니다.
  </Step>

  <Step title="페이지 하나를 AI에 보내기">
    모든 문서 페이지의 오른쪽 상단에는 **페이지 복사** 버튼이 있습니다. 버튼 옆의 화살표를 누르면 “ChatGPT / Claude / Perplexity / Google AI Studio에서 열기”도 선택할 수 있습니다.

    특정 모델에서 문제가 발생하면 해당 페이지를 열고 페이지 복사를 클릭한 다음 오류 메시지와 함께 보내십시오. 이것이 가장 빠른 디버깅 방법입니다.
  </Step>

  <Step title="MCP 서버로 연결하기">
    `https://docs.apiyi.com/mcp`을 MCP 서버로 추가하면 에이전트가 필요할 때마다 이 사이트의 최신 콘텐츠를 검색할 수 있으므로, 페이지를 직접 제공하지 않아도 됩니다.
  </Step>

  <Step title="설치 없이 명령줄에서 사용하기">
    코드를 작성하고 싶지 않다면 터미널(Node 18 이상)에서 `npx apiyi@latest check`를 실행하십시오. 키를 확인하고 노드를 검사하며 모델을 나열한 다음, `npx apiyi@latest chat "Hello" -m gpt-5.4-mini`이 첫 번째 메시지를 보냅니다. 명령어 표는 [AI 개발자 키트](/ko/developer-kit#cli)에 있습니다.
  </Step>
</Steps>

<Info>
  **이 방법이 더 나은 이유**: 원클릭 버튼은 고정된 시나리오 집합만 처리할 수 있습니다. AI는 프로젝트의 실제 스택을 읽고 실행되는 코드를 작성하며, 버튼으로는 할 수 없는 타임아웃과 재시도 처리까지 수행합니다.
</Info>

## 왜 원클릭 버튼이 아닙니까?

모델 통합은 여러 측면에서 서로 다릅니다.

* **서로 다른 프로토콜**: OpenAI, Claude, Gemini 및 기타 서비스는 서로 다른 API 프로토콜을 사용합니다.
* **서로 다른 매개변수**: 요청 필드와 응답 형식이 모델마다 다릅니다.
* **서로 다른 인증 방식**: 인증 헤더와 해당 헤더의 위치가 표준화되어 있지 않습니다.
* **서로 다른 기능**: 함수 호출, 프롬프트 캐싱, 웹 검색은 모델마다 다르게 구현됩니다.

강제로 원클릭 흐름을 적용하면 일반적으로 기본 채팅만 지원하게 되며, 이는 실제 사용에 충분하지 않습니다.

<Note>
  **계정은 직접 등록해야 합니다.** 에이전트가 스스로 계정이나 키를 생성할 수 있는 API는 없습니다. 계정과 과금에는 신원 확인 및 위험 관리가 포함되므로 해당 단계는 사람이 수행해야 합니다. “키가 있습니다”부터 “코드가 작동합니다”까지의 모든 과정은 AI에 맡길 수 있습니다.
</Note>

## 관련 질문

<CardGroup cols={2}>
  <Card title="시작하기" icon="rocket" href="/ko/getting-started">
    두 가지 방법이 있습니다. AI가 통합하도록 하거나 직접 수행할 수 있습니다.
  </Card>

  <Card title="모델 선택 방법" icon="compass" href="/ko/faq/model-selection-guide">
    사용 사례에 가장 적합한 AI 모델을 선택합니다.
  </Card>

  <Card title="기본 URL 구성 방법" icon="link" href="/ko/faq/base-url-config">
    다양한 클라이언트에서 APIYI에 연결하는 방법을 알아봅니다.
  </Card>

  <Card title="호출 로그 확인 방법" icon="file-text" href="/ko/faq/call-logs">
    API 호출 기록과 잔액 사용량을 확인합니다.
  </Card>
</CardGroup>
