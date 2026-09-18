> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Roo Code (VS Code)

> VS Code에서 사용하는 AI 개발 팀 - 다중 모드 설정을 지원하는 스마트 프로그래밍 어시스턴트

## 개요

Roo Code는 완전한 AI 개발 팀을 제공하는 강력한 VS Code AI 프로그래밍 어시스턴트입니다. 가장 돋보이는 기능은 **멀티 모드 구성**으로, 개발 작업별로 서로 다른 AI 모델을 사용하여 최적의 개발 효율을 달성할 수 있습니다.

<Card>
  **핵심 장점**

  * 🎯 **멀티 모드 구성**: 아키텍처, 코딩, 디버깅 및 기타 작업에 특화된 모델을 할당합니다
  * 🤖 **에이전트 지능**: 복잡한 개발 작업을 자동으로 계획하고 실행합니다
  * 🔄 **다중 파일 작업**: 프로젝트 구조를 이해하고 여러 파일을 지능적으로 수정합니다
  * 💰 **완전 무료**: 오픈소스이며 무료이고, AI 모델 사용료만 지불하면 됩니다
  * 🌐 **폭넓은 호환성**: 400개 이상의 주류 AI 모델을 지원합니다
  * 🔌 **MCP 지원**: Model Context Protocol을 통해 외부 도구에 연결합니다
</Card>

<Info>
  **Roo Code vs Cline**

  Roo Code는 Cline의 포크로, Cline의 핵심 기능을 유지하면서 고유한 멀티 모드 구성 시스템을 추가했습니다. 개발 단계별로 서로 다른 모델을 사용해야 한다면 Roo Code가 더 나은 선택입니다.
</Info>

## 유지보수 상태 및 Responses 엔드포인트 지원

### 공식적으로 중단됨 (2026)

Roo Code 팀은 **최종 릴리스**를 배포하고 클라우드 에이전트 플랫폼인 Roomote로의 전환을 발표했습니다. 확장 프로그램은 무기한 계속 작동하지만 **더 이상 버그 수정, 새 기능, 모델 업데이트는 제공되지 않습니다**. 팀은 확장 프로그램 형태를 계속 사용하려는 경우 커뮤니티가 유지보수하는 포크 `ZooCode` 또는 [Cline](/ko/scenarios/programming/cline) — Roo Code가 원래 포크해 온 프로젝트 — 를 권장합니다.

<img src="https://mintcdn.com/apiyillc/4Btanb2HSbrGHo5H/images/roo-code-final-version-notice.png?fit=max&auto=format&n=4Btanb2HSbrGHo5H&q=85&s=79f576a16c788e343200e409e1cfecf2" alt="Roo Code 최종 릴리스 안내: 확장 프로그램은 무기한 계속 작동하지만 더 이상 버그 수정, 기능, 모델 업데이트를 받지 않으며; ZooCode와 Cline이 권장됩니다" style={{maxWidth: "560px"}} width="860" height="706" data-path="images/roo-code-final-version-notice.png" />

<Warning>
  이 동결의 실질적인 영향은 다음과 같습니다: "OpenAI" 제공자의 **사전 설정 모델 목록은 `gpt-5.4`에서 멈춥니다** — gpt-5.5 / gpt-5.6 및 이후 모델은 드롭다운에 나타나지 않습니다. 기존 기능에는 영향이 없습니다.
</Warning>

### /v1/responses를 지원하는 몇 안 되는 IDE 플러그인 중 하나입니다 (검증됨)

Roo Code의 "OpenAI" 제공자는 `/v1/responses` 엔드포인트를 사용하며("OpenAI 호환" 제공자가 사용하는 `/v1/chat/completions`와는 다름), 사용자 지정 Base URL을 허용합니다. 그 결과 이 플러그인은 IDE 안에서 \*\*GPT-5.4 "추론 + 도구 호출"\*\*을 실행할 수 있는 몇 안 되는 플러그인 중 하나가 됩니다. chat/completions에서는 OpenAI가 GPT-5.4 이상에서 도구와 추론을 함께 사용하는 것을 차단하지만([Responses API 네이티브 가이드](/ko/api-capabilities/openai/native) 참조), responses에는 그런 제한이 없습니다.

설정: API 제공자로 **OpenAI**를 선택하고(OpenAI 호환이 아님), Base URL을 `https://api.apiyi.com/v1`으로 설정한 다음, 모델로 `gpt-5.4`을 선택합니다.

### Trae 및 다른 VS Code 계열 IDE에 설치하기

Trae 같은 VS Code 기반 IDE에서도 Roo Code 플러그인을 설치할 수 있습니다. 위와 같이 OpenAI 제공자로 구성한 뒤 Trae 안에 설치된 Roo Code가 Responses 엔드포인트를 통해 도구 호출과 작업을 정상적으로 실행하는 것을 확인했습니다. 이는 자체 사용자 지정 모델이 chat/completions만 지원하는 [Trae](/ko/scenarios/programming/trae)에 사실상 Responses 채널을 추가하는 셈이며, 그 모델 상한도 `gpt-5.4`로 동일합니다.

<img src="https://mintcdn.com/apiyillc/4Btanb2HSbrGHo5H/images/roo-code-in-trae-responses-test.png?fit=max&auto=format&n=4Btanb2HSbrGHo5H&q=85&s=19bcff9afd8acdb6f3e30b631b2da7a1" alt="Trae IDE 안에서 플러그인으로 실행되는 Roo Code가 Responses 엔드포인트를 통해 작업을 수행하는 검증된 스크린샷" style={{maxWidth: "480px"}} width="800" height="1548" data-path="images/roo-code-in-trae-responses-test.png" />

## 빠른 설치

### 방법 1: VS Code 마켓플레이스(권장)

<Steps>
  <Step title="확장 마켓플레이스 열기">
    VS Code에서 `Ctrl+Shift+X`(Windows/Linux) 또는 `Cmd+Shift+X`(macOS)를 누릅니다
  </Step>

  <Step title="검색 및 설치">
    “Roo Code”를 검색하고 설치를 클릭합니다

    **확장 ID**: `RooVeterinaryInc.roo-cline`
  </Step>

  <Step title="플러그인 열기">
    설치 후 왼쪽 활동 표시줄에서 Roo Code 아이콘을 클릭합니다
  </Step>
</Steps>

### 방법 2: Open VSX 레지스트리

[Open VSX 레지스트리](https://open-vsx.org/)를 방문하여 Roo Code를 검색해 설치합니다.

## APIYI 구성

### 기본 구성

<Steps>
  <Step title="설정 열기">
    Roo Code 사이드바에서 **톱니바퀴 아이콘**(설정 버튼)을 클릭합니다
  </Step>

  <Step title="API 제공자 선택">
    API Provider 드롭다운에서 **OpenAI 호환**을 선택합니다
  </Step>

  <Step title="연결 매개변수 구성">
    **기본 URL**: `https://api.apiyi.com/v1`

    **API Key**: APIYI 키(형식: `sk-***`)

    **모델 이름**: 사용하려는 모델 이름을 입력합니다
  </Step>

  <Step title="구성 저장">
    저장을 클릭하면 Roo Code가 연결을 자동으로 확인합니다
  </Step>
</Steps>

<Warning>
  **기본 URL 구성 요구사항**:

  * `https://api.apiyi.com/v1`을 사용해야 합니다(`/v1` 경로 포함)
  * `https://api.apiyi.com`을 사용하지 마십시오(`/v1`이 없으면 연결에 실패합니다)
</Warning>

### APIYI 키 받기

<Steps>
  <Step title="APIYI 대시보드 방문">
    `api.apiyi.com`에 로그인합니다
  </Step>

  <Step title="API 키 생성">
    "Token 관리" 페이지(`api.apiyi.com/token`)로 이동한 다음 "새 Token 생성"을 클릭합니다
  </Step>

  <Step title="키 복사">
    생성된 API Key(형식: `sk-***`)를 복사하여 Roo Code 구성에 붙여넣습니다
  </Step>
</Steps>

## Multi-Mode 구성 (핵심 기능)

Roo Code의 고유한 기능은 서로 다른 개발 모드에 서로 다른 AI 모델을 할당하여 전문화된 역할 분담을 수행할 수 있다는 점입니다.

### 다섯 가지 개발 모드

<Tabs>
  <Tab title="아키텍트 모드">
    **아키텍처 모드** - 시스템 설계 및 아키텍처 계획용

    **권장 모델**:

    * Claude Sonnet (강력한 추론, 아키텍처 설계에 탁월함)
    * GPT-4o (포괄적인 기술 지식)
    * DeepSeek V3 (깊이 있는 사고, 비용 효율적)

    **일반적인 작업**:

    ```text theme={null}
    Design a microservices architecture for an e-commerce system:
    - User service
    - Product service
    - Order service
    - Payment service
    Deploy using Docker + Kubernetes
    ```
  </Tab>

  <Tab title="코드 모드">
    **코딩 모드** - 실제 코드 생성 및 작성용

    **권장 모델**:

    * Claude Sonnet (높은 코드 품질)
    * DeepSeek Coder (전문 프로그래밍 모델)
    * Qwen Coder (중국어 친화적 주석)

    **일반적인 작업**:

    ```text theme={null}
    Implement user authentication module:
    - JWT token generation and validation
    - Password encryption (bcrypt)
    - Login/registration endpoints
    - Permission middleware
    ```
  </Tab>

  <Tab title="질의 모드">
    **질의응답 모드** - 기술 상담 및 구현 계획용

    **권장 모델**:

    * GPT-4o-mini (빠른 응답, 낮은 비용)
    * Gemini Flash (고속)
    * DeepSeek Chat (비용 효율적)

    **일반적인 작업**:

    ```text theme={null}
    Q: How to optimize React component rendering performance?
    Q: What's the difference between Redux and Zustand?
    Q: How to handle memory leaks in Node.js?
    ```
  </Tab>

  <Tab title="디버그 모드">
    **디버깅 모드** - 오류 문제 해결 및 버그 수정용

    **권장 모델**:

    * GPT-4o (복잡한 오류를 이해함)
    * Claude Sonnet (강력한 코드 분석)
    * DeepSeek V3 (심층 분석)

    **일반적인 작업**:

    ```text theme={null}
    Debug this error:
    TypeError: Cannot read property 'map' of undefined

    Help me find the memory leak in this code
    Analyze why this async function isn't executing correctly
    ```
  </Tab>

  <Tab title="오케스트레이터 모드">
    **오케스트레이션 모드** - 복잡한 작업의 분해 및 조정용

    **권장 모델**:

    * Claude Opus (복잡한 작업 처리)
    * GPT-4o (강력한 전체 계획 수립)
    * DeepSeek V3 (논리적 추론)

    **일반적인 작업**:

    ```text theme={null}
    Migrate entire project from JavaScript to TypeScript:
    1. Analyze existing code structure
    2. Create type definition files
    3. Gradually convert modules
    4. Update configuration files
    5. Run tests for validation
    ```
  </Tab>
</Tabs>

### 다중 모드 구성

<Steps>
  <Step title="모드 설정 열기">
    Roo Code 설정에서 **모드 구성** 섹션을 찾습니다
  </Step>

  <Step title="각 모드에 대한 모델 선택">
    각 모드별로 별도로 구성합니다:

    * API 제공자
    * 모델 이름
    * Temperature (창의성 매개변수)
    * Max Tokens
  </Step>

  <Step title="모드 전환">
    Roo Code 인터페이스에서 모드 선택기를 사용하여 현재 모드를 전환합니다
  </Step>
</Steps>

<Tip>
  **권장 구성 전략**:

  * **아키텍트/오케스트레이터** → 고품질 모델을 사용합니다(Claude Sonnet, GPT-4o)
  * **코드** → 전문 프로그래밍 모델을 사용합니다(DeepSeek Coder, Claude Sonnet)
  * **질의** → 빠르고 경제적인 모델을 사용합니다(GPT-4o-mini, Gemini Flash)
  * **디버그** → 분석 능력이 뛰어난 모델을 사용합니다(Claude Sonnet, GPT-4o)
</Tip>

## 추천 모델

Roo Code는 APIYI를 통해 OpenAI, Google Gemini, Claude, DeepSeek 및 국내 모델을 포함한 400개 이상의 주류 AI 모델을 지원합니다.

<Card title="프로그래밍 모델 추천 보기" icon="code" href="/ko/api-capabilities/model-info">
  최신 프로그래밍 모델 추천, 성능 비교, 사용 제안을 확인할 수 있습니다. 최고 성능 모델, 비용 효율이 높은 모델, 추론 강화 모델 등 세부 분류를 포함합니다.
</Card>

<Info>
  **여기에 특정 모델을 나열하지 않는 이유는 무엇입니까?**

  AI 모델은 매우 빠르게 업데이트되고 반복됩니다. 가장 정확한 모델 추천을 제공하기 위해, [모델 추천 페이지](/ko/api-capabilities/model-info)에서 최신 모델 목록, 성능 데이터, 사용 제안을 유지합니다.
</Info>

## 핵심 기능

### 에이전트 지능 모드

Roo Code의 가장 강력한 기능은 **에이전트 모드**이며, AI가 복잡한 작업을 자율적으로 계획하고 실행할 수 있습니다:

```text theme={null}
Task: Create a complete user authentication system

Roo Code will automatically:
1. Analyze requirements and create implementation plan
2. Create necessary file and directory structure
3. Write backend API code
4. Create frontend login/registration pages
5. Add error handling and validation
6. Generate unit tests
7. Update relevant documentation
```

### 스마트 다중 파일 편집

프로젝트 구조를 이해하고 관련된 여러 파일을 자동으로 수정합니다:

```text theme={null}
"Convert all API calls from axios to fetch and update error handling logic"

Roo Code will:
- Find all files using axios
- Convert to fetch API
- Unify error handling patterns
- Update type definitions (if using TypeScript)
```

### 코드 생성

<CodeGroup>
  ```python Python theme={null}
  # Input description
  """
  Create a FastAPI endpoint for user registration:
  - Accept email and password
  - Validate email format
  - Encrypt and store password
  - Return JWT token
  """

  # Roo Code auto-generates complete implementation
  from fastapi import APIRouter, HTTPException
  from passlib.hash import bcrypt
  import jwt
  # ... complete code implementation
  ```

  ```javascript JavaScript theme={null}
  // Input requirement
  // Create a React Hook for form state management
  // Support validation, error messages, submit handling

  // Roo Code generates
  import { useState, useCallback } from 'react';

  export function useForm(initialValues, validationRules) {
    // ... complete Hook implementation
  }
  ```

  ```go Go theme={null}
  // Requirement: Implement a concurrent-safe cache
  // Support Set, Get, Delete, clear expired data

  // Roo Code generates complete Go code
  package cache

  import (
      "sync"
      "time"
  )

  type Cache struct {
      // ... complete implementation
  }
  ```
</CodeGroup>

### 코드 리뷰 및 최적화

```text theme={null}
Review this PR, focusing on:
- Code standards
- Performance issues
- Security vulnerabilities
- Potential bugs
- Readability improvements
```

Roo Code은 개선 제안이 포함된 상세한 리뷰 보고서를 제공합니다.

### 스마트 리팩터링

```text theme={null}
Refactor this function, requirements:
- Improve readability
- Optimize performance
- Add error handling
- Improve type safety
```

### 테스트 생성

```text theme={null}
Generate comprehensive unit tests for UserService class, including:
- Normal flow tests
- Boundary condition tests
- Error handling tests
- Mock external dependencies
```

## 일반 명령

Roo Code는 다양한 명령 팔레트 명령을 제공합니다:

| 명령                      | 단축키              | 기능          |
| ----------------------- | ---------------- | ----------- |
| Roo Code: New Task      | `Ctrl+Shift+L`   | 새 작업 시작     |
| Roo Code: Continue      | `Enter`          | 현재 작업 계속    |
| Roo Code: Approve       | `Ctrl+Enter`     | AI 변경 사항 승인 |
| Roo Code: Reject        | `Ctrl+Backspace` | 변경 사항 거부    |
| Roo Code: Clear History | -                | 대화 기록 지우기   |
| Roo Code: Switch Mode   | -                | 개발 모드 전환    |

<Tip>
  **단축키 팁**: VS Code의 키보드 단축키 설정에서 Roo Code 단축키를 사용자 지정할 수 있습니다.
</Tip>

## 고급 기능

### API 설정 프로필

프로젝트나 팀별로 서로 다른 API 설정 프로필을 생성합니다:

```json theme={null}
{
  "roocode.apiProfiles": {
    "production": {
      "provider": "OpenAI Compatible",
      "baseUrl": "https://api.apiyi.com/v1",
      "apiKey": "sk-prod-key",
      "defaultModel": "claude-sonnet-4"
    },
    "development": {
      "provider": "OpenAI Compatible",
      "baseUrl": "https://api.apiyi.com/v1",
      "apiKey": "sk-dev-key",
      "defaultModel": "deepseek-chat"
    }
  }
}
```

### 코드베이스 인덱싱

Roo Code는 프로젝트 구조를 이해하기 위해 코드베이스를 자동으로 인덱싱합니다:

* 파일 간 관계 자동 감지
* 코드 의존성 이해
* 지능적인 컨텍스트 인식
* 파일 간 참조 추적

### MCP 통합

Model Context Protocol을 통해 외부 도구에 연결합니다:

* 데이터베이스 쿼리
* API 호출
* 파일 시스템 작업
* Git 작업
* 사용자 지정 도구 통합

### 사용자 지정 prompt 템플릿

설정에서 일반적인 prompt 템플릿을 구성합니다:

```json theme={null}
{
  "roocode.customTemplates": {
    "codeReview": "Detailed code review, focus on performance, security, maintainability",
    "optimize": "Optimize code performance and readability, add necessary comments",
    "test": "Generate comprehensive unit tests, cover edge cases",
    "refactor": "Refactor code following SOLID principles and design patterns"
  }
}
```

## 사용 팁

### 1. 명확한 맥락 제공

<CardGroup cols={2}>
  <Card title="❌ 모호한 설명" icon="x">
    "이 함수를 최적화하십시오"
  </Card>

  <Card title="✅ 명확한 설명" icon="check">
    "이 함수의 성능을 최적화하고, 루프 효율과 메모리 사용량에 집중하며, 최적화 접근 방식을 설명하는 적절한 주석을 추가하십시오"
  </Card>
</CardGroup>

### 2. 복잡한 작업은 단계별로 실행하기

복잡한 작업의 경우 여러 단계로 나누는 것을 권장합니다:

<Steps>
  <Step title="1단계: 아키텍처 설계">
    전체 아키텍처를 설계하려면 **Architect Mode**를 사용하십시오
  </Step>

  <Step title="2단계: 모듈 구현">
    모듈을 구현하려면 **Code Mode**로 전환하십시오
  </Step>

  <Step title="3단계: 디버깅 및 최적화">
    문제를 해결하려면 **Debug Mode**를 사용하십시오
  </Step>

  <Step title="4단계: 통합 테스트">
    통합을 조율하려면 **Orchestrator Mode**를 사용하십시오
  </Step>
</Steps>

### 3. 모드 전환 활용하기

다양한 작업 유형에 가장 적합한 모드로 전환하십시오:

* 아키텍처 설계가 필요합니까? → Architect Mode
* 코드 구현을 작성하십니까? → Code Mode
* 빠른 상담이 필요합니까? → Ask Mode
* 버그가 발생했습니까? → Debug Mode
* 복잡한 리팩터링이 필요합니까? → Orchestrator Mode

### 4. 변경 사항 검토 및 승인

<Warning>
  **중요한 습관**:

  * AI가 생성한 코드는 승인하기 전에 항상 검토하십시오
  * 각 변경의 목적을 이해하십시오
  * 수정된 기능을 테스트하십시오
  * 코드베이스의 일관성을 유지하십시오
</Warning>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="Roo Code와 Cline의 차이점은 무엇입니까?">
    **주요 차이점**:

    1. **멀티 모드 구성**: Roo Code의 핵심 기능이며, Cline은 지원하지 않습니다
    2. **코드베이스**: Roo Code는 Cline에서 분기된 포크이지만, 독립적으로 개발되었습니다
    3. **업데이트 빈도**: Roo Code는 더 자주 업데이트되며 기능 반복도 더 빠릅니다
    4. **커뮤니티**: 두 프로젝트 모두 활발한 커뮤니티를 보유하지만, 중점이 다릅니다

    **선택 방법**:

    * 멀티 모드가 필요합니까? → Roo Code
    * 안정성이 필요합니까? → Cline
    * 둘 다 무료로 사용해 볼 수 있으니, 자신에게 가장 잘 맞는 것을 선택하십시오
  </Accordion>

  <Accordion title="연결이 실패하거나 모델이 작동하지 않는 이유는 무엇입니까?">
    **일반적인 원인과 해결책**:

    1. **Base URL 오류**:
       * ✅ 올바름: `https://api.apiyi.com/v1`
       * ❌ 잘못됨: `https://api.apiyi.com`

    2. **유효하지 않은 API Key**:
       * Key가 올바르게 복사되었는지 확인하십시오(앞뒤 공백에 주의하십시오)
       * 계정 잔액이 충분한지 확인하십시오
       * Key 상태가 “활성화됨”인지 확인하십시오

    3. **잘못된 모델 이름**:
       * 올바른 모델 이름을 사용하고 있는지 확인하십시오
       * [모델 목록](/ko/api-capabilities/model-info)을 참조하십시오

    4. **네트워크 문제**:
       * 네트워크 연결을 확인하십시오
       * VS Code를 다시 시작해 보십시오
  </Accordion>

  <Accordion title="서로 다른 모드에 서로 다른 모델을 구성하는 방법은 무엇입니까?">
    **구성 단계**:

    1. Roo Code 설정(톱니바퀴 아이콘)을 엽니다
    2. **모드 구성** 섹션을 찾습니다
    3. 각 모드별로 별도로 구성합니다:
       * Architect Mode → `claude-sonnet-4`
       * Code Mode → `deepseek-coder`
       * Ask Mode → `gpt-4o-mini`
       * Debug Mode → `claude-sonnet-4`
       * Orchestrator Mode → `gpt-4o`
    4. 구성을 저장합니다

    사용할 때는 모드 선택기를 통해 전환합니다.
  </Accordion>

  <Accordion title="Roo Code가 제 코드를 자동으로 수정합니까?">
    **자동 수정은 없으며**, 사용자의 승인이 필요합니다:

    1. Roo Code는 먼저 제안된 변경 사항을 표시합니다
    2. 사용자는 다음을 할 수 있습니다:
       * Diff 보기(비교)
       * 변경 사항 승인(적용)
       * 변경 사항 거부
       * 수정한 후 승인
    3. 모든 변경 사항은 사용자의 통제하에 있습니다

    <Tip>
      원하지 않는 변경 사항을 언제든 되돌릴 수 있도록 버전 관리(Git)를 활성화하는 것을 권장합니다.
    </Tip>
  </Accordion>

  <Accordion title="API 사용 비용을 절감하는 방법은 무엇입니까?">
    **비용 절감 전략**:

    1. **현명한 모델 선택**:
       * 간단한 작업에는 더 저렴한 모델(GPT-4o-mini, DeepSeek)을 사용합니다
       * 복잡한 작업에만 프리미엄 모델(Claude Opus, GPT-4o)을 사용합니다

    2. **다중 모드 구성 활용**:
       * Ask Mode → 가장 저렴한 모델 사용
       * Code/Debug Mode → 중간급 전문 모델 사용
       * Architect Mode → 필요할 때만 프리미엄 모델 사용

    3. **충전 보너스**:
       * APIYI는 충전 보너스(10%-20%)를 제공합니다
       * [충전 프로모션](/ko/faq/recharge-promotions)을 확인하십시오

    4. **컨텍스트 길이 제어**:
       * 불필요한 채팅 기록을 지웁니다
       * 현재 작업에 집중하고 관련 없는 컨텍스트를 줄입니다
  </Accordion>

  <Accordion title="Roo Code는 어떤 프로그래밍 언어를 지원합니까?">
    **거의 모든 주요 프로그래밍 언어**를 지원하며, 다음을 포함하되 이에 국한되지 않습니다:

    * **웹**: JavaScript, TypeScript, HTML, CSS, React, Vue, Angular
    * **백엔드**: Python, Java, Go, Rust, C++, C#, PHP, Ruby
    * **모바일**: Swift, Kotlin, Dart (Flutter), React Native
    * **데이터**: SQL, R, Julia
    * **기타**: Shell, YAML, JSON, Markdown

    효과는 다음에 따라 달라집니다:

    * 선택한 AI model
    * 모델의 학습 데이터
    * 언어의 인기
  </Accordion>
</AccordionGroup>

## 다른 도구와 비교

| 기능             | Roo Code | Cline | Cursor | GitHub Copilot |
| -------------- | -------- | ----- | ------ | -------------- |
| **다중 모드 구성**   | ✅        | ❌     | ❌      | ❌              |
| **에이전트 모드**    | ✅        | ✅     | ❌      | ❌              |
| **다중 파일 편집**   | ✅        | ✅     | 부분 지원  | ❌              |
| **사용자 지정 API** | ✅        | ✅     | ✅      | ❌              |
| **무료 및 오픈 소스** | ✅        | ✅     | ❌      | ❌              |
| **모델 선택**      | 400+     | 400+  | 제한적    | GitHub 전용      |
| **학습 곡선**      | 보통       | 보통    | 낮음     | 낮음             |

<Tip>
  **선택 가이드**:

  * **다중 모드 구성이 필요함** → Roo Code
  * **안정성과 성숙도가 필요함** → Cline
  * **단순성이 필요함** → Cursor
  * **GitHub와의 깊은 통합** → GitHub Copilot
</Tip>

## 과금

Roo Code 플러그인은 **완전히 무료입니다**. AI 모델 사용 요금만 지불하시면 됩니다.

APIYI를 통해 AI 모델을 사용하는 비용은 선택한 모델과 사용량에 따라 달라집니다.

<Card title="상세 과금 보기" icon="dollar-sign" href="/ko/api-capabilities/model-info">
  모든 모델의 상세 과금 및 비용 대비 효율 비교를 확인합니다
</Card>

<Info>
  APIYI는 충전 보너스를 제공합니다. 충전할수록 보너스가 더 높아집니다(10%-20%). 첫 충전에는 추가 보너스가 제공됩니다. [충전 프로모션 상세](/ko/faq/recharge-promotions)를 확인합니다.
</Info>

## 관련 자료

* [Roo Code 공식 웹사이트](https://roo-code.net/)
* [Roo Code 공식 문서](https://docs.roocode.com/)
* [GitHub 저장소](https://github.com/RooCodeInc/Roo-Code)
* [VS Code 마켓플레이스](https://marketplace.visualstudio.com/items?itemName=RooVeterinaryInc.roo-cline)
* [APIYI 빠른 시작](/ko/getting-started)
* [모델 추천 및 요금](/ko/api-capabilities/model-info)

## 도움 받기

<CardGroup cols={2}>
  <Card title="기업용 WeChat" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="기업용 WeChat QR 코드" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    QR 코드를 스캔하거나 [지원팀에 문의하려면 클릭](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    설정 문제, 사용 안내
  </Card>

  <Card title="이메일 문의" icon="mail">
    **고객 서비스**: [support@apiyi.com](mailto:support@apiyi.com)

    **비즈니스**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>

<Tip>
  **빠른 시작**: 위의 “빠른 설치” 및 “APIYI 설정” 섹션을 따라 5분 만에 Roo Code를 AI 지원 프로그래밍에 사용하기 시작하세요!
</Tip>
