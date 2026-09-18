> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Cursor

> AI 기반 코드 편집기 통합 가이드

Cursor는 AI 기반 코드 편집기입니다. APIYI를 통합하면 코드를 작성하는 동안 강력한 AI 지원을 받을 수 있습니다.

## 빠른 설정

### 1. 설정 열기

오른쪽 상단의 톱니바퀴 아이콘 ⚙️을 클릭하고 **Models** 옵션을 선택합니다

### 2. API 설정

* **OpenAI API Key**: APIYI 키를 입력합니다(기본 token을 직접 사용할 수 있습니다)
* **Override OpenAI Base URL**: 체크한 뒤 `https://api.apiyi.com/v1`를 입력합니다
* **Verify**를 클릭하여 구성을 검증합니다

<img src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/cursor-setting.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=47cf7afe1c00e511395e34cc033b877e" alt="Cursor 설정 인터페이스" width="2066" height="990" data-path="images/cursor-setting.png" />

### 3. 모델 설정

<Warning>
  **중요 참고**: Cursor는 현재 **Agent mode**를 지원하지 않으며, **Chat** 대화 모드만 사용할 수 있습니다. 대화에서 AI가 코드를 생성하게 한 뒤 실제 코드에 수동으로 적용하면 됩니다.

  초보자이고 바이브 코딩에서 Agent mode에 크게 의존한다면 다음을 권장합니다:

  * Cursor 공식 멤버십을 구매하여 기본 서비스를 사용합니다
  * 또는 대안으로 VS Code의 **RooCode** 또는 **Cline** 플러그인(Agent mode 지원)을 사용합니다
</Warning>

#### 권장 모델 설정

현재 최신 모델의 성능과 비용 효율성을 기준으로 다음을 권장합니다:

**프로그래밍 우선 선택 모델**:

* `claude-sonnet-4-20250514` - Claude 4 Sonnet, 프로그래밍에 가장 강함
* `gpt-4.1` - 속도가 빠르고 전반적 성능이 뛰어남
* `deepseek-v3` - 중국어 프로그래밍에 뛰어나고 가성비가 높음

**비용 최적화 모델**:

* `gpt-4.1-mini` - 가볍지만 성능이 충분함
* `claude-3-haiku` - Claude 시리즈에서 가장 저렴함
* `gemini-2.5-flash` - Google의 빠른 응답 모델

**추론 강화 모델**:

* `o4-mini` - 프로그래밍 작업용 첫 번째 선택 추론 모델
* `o3` - 복잡한 추론과 알고리즘 문제

#### 사용자 지정 모델 추가

Cursor 설정에 다음 model ID를 추가합니다:

```
claude-sonnet-4-20250514
gpt-4.1
deepseek-v3
o4-mini
gemini-2.5-pro
```

## 사용 모드 설명

### 채팅 모드 워크플로

Cursor는 Agent 모드를 지원하지 않으므로 다음 워크플로를 권장합니다:

1. **대화로 코드 생성**
   * `Ctrl/Cmd + L`를 사용하여 채팅을 엽니다
   * 요구 사항을 설명하고 AI가 코드를 생성하도록 합니다
   * 생성된 코드 스니펫을 확인합니다

2. **코드를 수동으로 적용**
   * 채팅 창에서 코드를 복사합니다
   * 대상 파일에 붙여넣습니다
   * 또는 “Apply” 버튼을 사용합니다(사용 가능한 경우)

3. **반복 및 최적화**
   * 대화를 계속 이어가며 수정을 요청합니다
   * 적용 과정을 반복합니다

### 대안 비교

| 도구                     | Agent 모드 | 장점                           | 단점                   |
| ---------------------- | -------- | ---------------------------- | -------------------- |
| **Cursor**             | ❌        | 세련된 인터페이스, 우수한 자동완성 경험       | Agent 모드 없음          |
| **Cline (VS Code)**    | ✅        | 완전한 Agent 기능, 파일을 자동으로 수정 가능 | VS Code가 필요함         |
| **RooCode (VS Code)**  | ✅        | Agent 모드, 다중 파일 편집 지원        | 더 최신이며, 기능이 계속 개선 중임 |
| **Continue (VS Code)** | ✅        | 오픈 소스, 높은 사용자 정의 가능성         | 설정이 더 복잡함            |

## 핵심 기능

### 스마트 코드 완성

* **Tab Completion**: Tab을 눌러 AI 제안을 수락합니다
* **Multi-line Completion**: 함수 수준의 코드 생성을 지원합니다
* **Context Aware**: 프로젝트 구조를 기반으로 제안을 제공합니다

### AI 대화

* **Ctrl/Cmd + K**: 명령 팔레트를 엽니다
* **Ctrl/Cmd + L**: 사이드바 대화를 엽니다
* **Code Explanation**: 코드를 선택하고 AI에 질문합니다

### 코드 편집

* **Generate Code**: 요구 사항을 설명하면 AI가 자동으로 생성합니다
* **Refactoring Suggestions**: 최적화 권장 사항을 받습니다
* **Error Fixing**: AI가 오류를 찾고 수정하는 데 도움을 줍니다

## 키보드 단축키

| Shortcut       | 기능        |
| -------------- | --------- |
| `Ctrl/Cmd + K` | AI 명령 팔레트 |
| `Ctrl/Cmd + L` | AI 대화     |
| `Tab`          | 코드 제안 수락  |
| `Esc`          | 제안 취소     |

## 사용 팁

### 1. 명확한 컨텍스트 제공

```javascript theme={null}
// @context: React component for user authentication
// @requirements: Need to support OAuth2 login
// @constraints: Compatible with NextJS 13+

// AI will generate more accurate code based on this information
```

### 2. 프롬프트 최적화

```
// Bad prompt
"Fix this function"

// Good prompt
"Fix floating point precision issue in calculateTotal function, ensure amount calculation accurate to 2 decimal places"
```

### 3. Chat 모드 최대 활용

Agent 모드는 없지만, 다음을 할 수 있습니다:

* AI가 전체 파일 내용을 생성하도록 할 수 있습니다
* AI에 상세한 수정 지침을 제공해 달라고 요청할 수 있습니다
* 코드 리뷰와 리팩터링 제안을 위해 AI를 사용할 수 있습니다

## 문제 해결

### 연결 시간 초과

1. 네트워크 연결을 확인합니다
2. API 주소를 확인합니다: `https://api.apiyi.com/v1`
3. API 키 유효성을 확인합니다

### 모델이 응답하지 않음

1. 계정 잔액을 확인합니다
2. 다른 모델로 전환해 봅니다
3. Cursor를 다시 시작합니다

### 코드 제안 품질이 낮음

1. 더 많은 프로젝트 컨텍스트를 제공합니다
2. 더 구체적인 prompt를 사용합니다
3. 다른 모델을 시도해 봅니다

## 모범 사례

### 프로젝트 수준 설정

프로젝트 루트에 `.cursor-settings.json`를 생성합니다:

```json theme={null}
{
  "model": "gpt-4.1",
  "temperature": 0.7,
  "contextFiles": ["README.md", "package.json"],
  "rules": [
    "Use TypeScript strict mode",
    "Follow ESLint standards",
    "Add appropriate comments"
  ]
}
```

### 코드 표준

프롬프트에서 코드 표준을 명확히 지정합니다:

* TypeScript를 사용합니다
* Airbnb 표준을 따릅니다
* JSDoc 주석을 추가합니다
* 함수형 스타일을 사용합니다

### 보안 인식

* 코드에 민감한 정보를 포함하지 않습니다
* AI가 생성한 코드를 검토합니다
* 서드파티 종속성의 보안을 확인합니다

## 통합 워크플로

### Git 통합

```bash theme={null}
# AI generates commit message
git add .
# Use Cursor AI to generate descriptive commit message
```

### 테스트 주도 개발

1. 테스트 케이스를 먼저 작성합니다
2. AI가 구현 코드를 생성하도록 합니다
3. 테스트를 실행하여 검증합니다
4. 반복하면서 최적화합니다

### 코드 리뷰

AI를 코드 리뷰에 사용합니다:

```
Please review this code, focusing on:
1. Performance issues
2. Security vulnerabilities
3. Code standards
4. Best practices
```

## Agent 모드가 필요하신가요?

AI가 여러 파일을 자동으로 수정하고 복잡한 리팩터링 작업을 수행해야 한다면, 다음을 확인해 보시기를 권장합니다:

<CardGroup cols={2}>
  <Card title="Cline" icon="bot" href="/ko/scenarios/programming/cline">
    VS Code용 기능이 풍부한 AI Agent로, 파일 자동 수정을 지원합니다
  </Card>

  <Card title="RooCode" icon="code" href="https://marketplace.visualstudio.com/items?itemName=roocode.roocode">
    새롭게 떠오르는 VS Code AI Agent 플러그인으로, 다중 파일 편집을 지원합니다
  </Card>
</CardGroup>

<Info>
  **팁**: Vibe Coding 애호가이시고 AI가 복잡한 프로그래밍 작업을 자율적으로 완료해 주길 원하신다면, Agent 모드를 지원하는 도구를 사용하시거나 Cursor 공식 멤버십을 구매하여 완전한 경험을 누리시는 것을 권장합니다.
</Info>

더 도움이 필요하신가요? 지원이 필요하시면 [APIYI 공식 웹사이트](https://api.apiyi.com)를 방문해 주십시오.
