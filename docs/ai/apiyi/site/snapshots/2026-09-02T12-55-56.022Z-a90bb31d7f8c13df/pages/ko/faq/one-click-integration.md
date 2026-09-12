> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 원클릭 통합이 있습니까?

> 있습니다 — 하지만 버튼은 아닙니다. 문서를 AI 코딩 에이전트에 넘기면, 에이전트가 대신 통합 작업을 수행합니다.

## 간단한 답변

**네, 하지만 버튼은 아닙니다.**

저희는 전통적인 원클릭 설정형 통합은 제공하지 않습니다. 모델마다 서로 다른 프로토콜, 파라미터, 인증 방식을 사용하므로, 그런 버튼으로는 기본적인 채팅만 처리할 수 있을 뿐, 실제 환경의 요구를 충족할 수는 없습니다.

대신 더 나은 방법이 있습니다: **문서를 AI 코딩 에이전트에게 넘기고 통합 작업을 맡기는 것**입니다. 계정을 등록하고 키를 복사하기만 하면 됩니다. 모델을 선택하고, 기본 URL을 올바르게 맞추고, 코드를 작성하고, 디버깅하는 일은 모두 AI에 맡길 수 있습니다.

<Card title="AI가 대신 통합하도록 하십시오" icon="bot" href="/ko/getting-started">
  Quick Start 페이지에는 Codex, Claude Code, Cursor 및 유사한 도구를 위한 바로 복사할 수 있는 prompt가 준비되어 있습니다.
</Card>

## 세 가지 방법

<Steps>
  <Step title="사이트 전체 스킬 설치하기(권장)">
    에이전트가 `npx skills add https://docs.apiyi.com`을 실행해 APIYI 스킬을 설치하도록 하십시오. 해당 명령이 작동하지 않으면 `https://docs.apiyi.com/skill.md`을 가리키고 파일을 직접 읽게 하십시오.

    그 파일은 엔드포인트, 인증, 모델 명명 규칙, 알려진 함정, 검증 체크리스트 등 기계용으로 특별히 작성되었습니다. 이를 읽으면 에이전트가 필요한 모든 정보를 얻습니다.
  </Step>

  <Step title="단일 페이지를 AI에 보내기">
    모든 문서 페이지의 **오른쪽 상단**에는 **페이지 복사** 버튼이 있습니다. 그 옆의 화살표에는 **ChatGPT / Claude / Perplexity / Google AI Studio에서 열기**도 있습니다.

    특정 모델에서 문제가 발생하면 해당 페이지를 열고 **페이지 복사**를 눌러 오류와 함께 AI에 보내십시오. 이것이 이용 가능한 가장 빠른 디버깅 경로입니다.
  </Step>

  <Step title="MCP 서버로 연결하기">
    `https://docs.apiyi.com/mcp`을 MCP 서버로 추가하면 에이전트가 문서를 매번 붙여 넣지 않아도 이 사이트의 현재 내용을 필요할 때 검색할 수 있습니다.
  </Step>
</Steps>

<Info>
  **버튼보다 나은 이유**: 원클릭 버튼은 정해진 시나리오 집합만 처리할 수 있습니다. AI는 프로젝트의 실제 스택을 읽고, 그 환경에서 실행되는 코드를 작성하며, 버튼으로는 절대 할 수 없는 일들 — 타임아웃 설정, 재시도 로직, 오류 처리 — 을 처리할 수 있습니다.
</Info>

## 왜 원클릭 버튼이 없습니까?

모델 통합은 여러 면에서 다릅니다:

* **서로 다른 프로토콜**: OpenAI, Claude, Gemini 등은 서로 다른 API 프로토콜을 사용합니다
* **서로 다른 매개변수**: 요청 필드와 응답 형태는 모델마다 다릅니다
* **서로 다른 인증**: 인증 헤더와 위치가 표준화되어 있지 않습니다
* **서로 다른 기능**: Function Calling, Prompt Caching, Web Search 같은 기능은 모델마다 다르게 구현됩니다

원클릭 흐름을 강제로 적용하면 보통 기본 채팅만 지원하게 되며, 이는 실제 사용에는 충분하지 않습니다.

<Note>
  **여전히 계정은 직접 등록하셔야 합니다.** 에이전트가 스스로 계정을 생성하거나 키를 발급하게 해주는 API는 없습니다 — 계정과 billing에는 사람이 확인해야 하는 신원 및 위험 통제가 포함됩니다. 하지만 “키가 있음”에서 “코드가 실행됨”까지의 모든 과정은 AI에 맡길 수 있습니다.
</Note>

## 관련 질문

<CardGroup cols={2}>
  <Card title="빠른 시작" icon="rocket" href="/ko/getting-started">
    두 가지 경로가 있습니다. AI에게 맡기거나 직접 연결하면 됩니다.
  </Card>

  <Card title="모델을 선택하는 방법" icon="compass" href="/ko/faq/model-selection-guide">
    사용 사례에 가장 적합한 AI 모델을 선택합니다.
  </Card>

  <Card title="기본 URL을 설정하는 방법" icon="link" href="/ko/faq/base-url-config">
    다양한 클라이언트 도구에서 APIYI를 연결합니다.
  </Card>

  <Card title="호출 로그를 보는 방법" icon="file-text" href="/ko/faq/call-logs">
    API 호출 기록과 잔액 사용량을 확인합니다.
  </Card>
</CardGroup>
