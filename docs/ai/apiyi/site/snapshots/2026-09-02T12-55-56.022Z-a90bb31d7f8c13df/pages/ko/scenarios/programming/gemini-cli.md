> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Gemini CLI

> APIYI를 통해 Gemini CLI를 사용하여 코드 생성, 코드 리뷰, 질의응답 등 AI 지원 프로그래밍을 수행합니다

## 개요

Gemini CLI는 터미널에서 Gemini AI 모델과 직접 상호작용할 수 있게 해주는 Google의 공식 명령줄 도구입니다. APIYI를 통해 다음과 같이 사용할 수 있습니다.

* 🚀 터미널에서 Gemini 모델을 빠르게 호출할 수 있습니다
* 💻 AI 지원 프로그래밍 및 코드 생성
* 🔍 코드 리뷰 및 최적화 제안
* 📝 기술 Q\&A 및 문서 생성
* 🌐 크로스 플랫폼 지원(Linux, macOS, Windows)

<Info>
  **왜 APIYI를 선택해야 합니까?**

  APIYI를 통해 Gemini CLI를 사용하면 더 안정적인 네트워크 연결, 더 나은 가격, 그리고 24/7 기술 지원을 이용할 수 있습니다.
</Info>

## 빠른 시작

### 사전 준비

* Node.js >= 18.0.0
* npm or yarn 패키지 관리자
* APIYI 계정 및 API Key

### 1단계: Gemini CLI 설치

<CodeGroup>
  ```bash npm theme={null}
  # Check Node.js version
  node --version  # Must be >= 18

  # Install Gemini CLI globally
  npm install -g @google/gemini-cli

  # Verify installation
  gemini --version
  ```

  ```bash yarn theme={null}
  # Check Node.js version
  node --version  # Must be >= 18

  # Install with yarn
  yarn global add @google/gemini-cli

  # Verify installation
  gemini --version
  ```
</CodeGroup>

### 2단계: APIYI API Key 가져오기

<Steps>
  <Step title="APIYI에 등록/로그인">
    등록 또는 로그인을 위해 `api.apiyi.com`에 접속합니다
  </Step>

  <Step title="API Key 생성">
    대시보드의 “토큰 관리” 페이지(`api.apiyi.com/token`)로 이동한 다음 “새 토큰 생성”을 클릭합니다
  </Step>

  <Step title="키 복사">
    생성된 API Key(형식: `sk-***`)를 복사하여 안전하게 보관합니다
  </Step>
</Steps>

### 3단계: 환경 변수 구성

<Warning>
  **중요 설정**: `GOOGLE_GEMINI_BASE_URL`은 추가 경로(예: `/v1` 또는 `/gemini`) 없이 `https://api.apiyi.com`로 설정해야 하며, 그렇지 않으면 연결에 실패합니다.
</Warning>

<Tabs>
  <Tab title="Zsh (macOS/Linux)">
    ```bash theme={null}
    # Edit .zshrc file
    nano ~/.zshrc

    # Add these environment variables
    export GOOGLE_GEMINI_BASE_URL="https://api.apiyi.com"
    export GEMINI_API_KEY="sk-your-api-key"  # Replace with your APIYI key

    # Reload configuration
    source ~/.zshrc
    ```
  </Tab>

  <Tab title="Bash (Linux)">
    ```bash theme={null}
    # Edit .bashrc file
    nano ~/.bashrc

    # Add these environment variables
    export GOOGLE_GEMINI_BASE_URL="https://api.apiyi.com"
    export GEMINI_API_KEY="sk-your-api-key"  # Replace with your APIYI key

    # Reload configuration
    source ~/.bashrc
    ```
  </Tab>

  <Tab title="PowerShell (Windows)">
    ```powershell theme={null}
    # Set environment variables
    $env:GOOGLE_GEMINI_BASE_URL="https://api.apiyi.com"
    $env:GEMINI_API_KEY="sk-your-api-key"

    # Save permanently (optional)
    [System.Environment]::SetEnvironmentVariable('GOOGLE_GEMINI_BASE_URL', 'https://api.apiyi.com', 'User')
    [System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'sk-your-key', 'User')
    ```
  </Tab>

  <Tab title="CMD (Windows)">
    ```cmd theme={null}
    # Temporary environment variables
    set GOOGLE_GEMINI_BASE_URL=https://api.apiyi.com
    set GEMINI_API_KEY=sk-your-api-key

    # Save permanently (requires admin)
    setx GOOGLE_GEMINI_BASE_URL "https://api.apiyi.com"
    setx GEMINI_API_KEY "sk-your-api-key"
    ```
  </Tab>
</Tabs>

### 4단계: 초기화 및 테스트

<Steps>
  <Step title="Gemini CLI 실행">
    ```bash theme={null}
    gemini
    ```
  </Step>

  <Step title="최초 인증">
    대화형 인터페이스에서 다음을 입력합니다:

    ```bash theme={null}
    /auth
    ```

    선택: **Gemini API Key (AI Studio)**
  </Step>

  <Step title="연결 테스트">
    ```bash theme={null}
    # Simple test
    gemini "Hello, test connection"

    # Programming-related test
    gemini "Explain how React Hooks work"
    gemini "Write a Python function to calculate Fibonacci sequence"
    ```
  </Step>
</Steps>

## 핵심 기능

### 코드 생성

<Tabs>
  <Tab title="함수 생성">
    ```bash theme={null}
    gemini "Write a quick sort algorithm in Python with detailed comments"
    ```

    **예시 출력**:

    ```python theme={null}
    def quick_sort(arr):
        """
        Quick sort algorithm
        Time complexity: Average O(n log n), Worst O(n²)
        Space complexity: O(log n)
        """
        if len(arr) <= 1:
            return arr

        pivot = arr[len(arr) // 2]
        left = [x for x in arr if x < pivot]
        middle = [x for x in arr if x == pivot]
        right = [x for x in arr if x > pivot]

        return quick_sort(left) + middle + quick_sort(right)
    ```
  </Tab>

  <Tab title="프로젝트 스캐폴딩">
    ```bash theme={null}
    gemini "Create an Express.js REST API project structure with user auth and database config"
    ```
  </Tab>

  <Tab title="단위 테스트">
    ```bash theme={null}
    gemini "Write Jest unit tests for this function:
    function fibonacci(n) {
      if (n <= 1) return n;
      return fibonacci(n - 1) + fibonacci(n - 2);
    }"
    ```
  </Tab>
</Tabs>

### 코드 리뷰

```bash theme={null}
# Review code quality
gemini "Review the following code for performance issues and potential bugs:
[paste your code]
"

# Security audit
gemini "Check this code for security vulnerabilities, especially SQL injection and XSS"

# Best practices
gemini "What can be improved in this React component? Does it follow best practices?"
```

### 기술 Q\&A

```bash theme={null}
# Concept explanation
gemini "Explain JavaScript closures with practical use cases"

# Error troubleshooting
gemini "Why isn't my Promise being resolved correctly?"

# Performance optimization
gemini "How to optimize React component rendering performance?"

# Architecture design
gemini "Compare microservices vs monolithic architecture"
```

### 문서 생성

```bash theme={null}
# Generate README
gemini "Generate a professional README.md for my Node.js library with installation, usage, and API docs"

# API documentation
gemini "Generate OpenAPI 3.0 spec documentation for this REST API endpoint"

# Code comments
gemini "Add detailed JSDoc comments to the following code"
```

## 대화형 명령

Gemini CLI 대화형 모드에서는 다음 명령을 사용할 수 있습니다:

| 명령       | 설명         | 예시                            |
| -------- | ---------- | ----------------------------- |
| `/auth`  | 다시 인증      | `/auth`                       |
| `/model` | 모델 전환      | `/model gemini-3-pro-preview` |
| `/clear` | 대화 기록 삭제   | `/clear`                      |
| `/help`  | 도움말 정보 표시  | `/help`                       |
| `/exit`  | CLI 종료     | `/exit` or `Ctrl+C`           |
| `/save`  | 대화를 파일에 저장 | `/save conversation.txt`      |

<Tip>
  **모델 전환**: `/model` 명령을 사용하여 `gemini-3-pro-preview`, `gemini-2.5-flash`, `gemini-2.5-pro` 등 다양한 Gemini 모델 간에 전환할 수 있습니다.
</Tip>

## 지원되는 모델

APIYI를 통해 최신 Gemini 모델을 사용할 수 있습니다:

### Gemini 3 시리즈 (추천)

| 모델                                | 사용 사례           | 기능                        |
| --------------------------------- | --------------- | ------------------------- |
| **gemini-3-pro-preview**          | 고품질 코드, 복잡한 추론  | 🏆 최고 성능, LMArena 리더보드 1위 |
| **gemini-3-pro-preview-thinking** | 초복잡 추론, 알고리즘 설계 | 🧠 사고 과정 출력, 심층 추론        |

### Gemini 2.5 시리즈

| 모델                        | 사용 사례        | 기능               |
| ------------------------- | ------------ | ---------------- |
| **gemini-2.5-pro**        | 전문적인 코드 생성   | ⚡ 높은 성능, 1M 컨텍스트 |
| **gemini-2.5-flash**      | 빠른 응답, 일상 개발 | 🚀 빠른 속도, 저렴한 비용 |
| **gemini-2.5-flash-lite** | 경량 작업, 배치 호출 | 💰 초저비용, 고빈도     |

<Info>
  **추천 구성**:

  * 복잡한 프로그래밍, 아키텍처 설계: `gemini-3-pro-preview`
  * 일상적인 코드 생성, Q\&A: `gemini-2.5-flash`
  * 배치 처리, 빠른 반복: `gemini-2.5-flash-lite`
</Info>

<Card title="전체 모델 목록 보기" icon="list" href="/ko/api-capabilities/model-info">
  APIYI에서 지원하는 모든 Gemini 모델, 상세한 가격 및 성능 비교 보기
</Card>

## 고급 사용

### VS Code 통합

VS Code에서 Gemini CLI 확장 프로그램을 사용합니다:

```json theme={null}
{
  "gemini.apiKey": "sk-your-api-key",
  "gemini.baseUrl": "https://api.apiyi.com",
  "gemini.model": "gemini-3-pro-preview",
  "gemini.temperature": 0.7,
  "gemini.maxTokens": 4000
}
```

### GitHub Actions 통합

자동 코드 리뷰:

```yaml theme={null}
name: Gemini Code Review
on:
  pull_request:
    branches: [ main ]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Gemini CLI
        run: npm install -g @google/gemini-cli

      - name: Run Code Review
        env:
          GEMINI_API_KEY: \${{ secrets.GEMINI_API_KEY }}
          GOOGLE_GEMINI_BASE_URL: https://api.apiyi.com
        run: |
          gemini "Review this Pull Request for code quality, security, and performance:
          $(git diff origin/main...HEAD)"
```

### 배치 스크립트

자동화 스크립트를 생성합니다:

```bash theme={null}
#!/bin/bash

# Batch code review
for file in src/**/*.js; do
  echo "Reviewing $file..."
  gemini "Review code quality of $file" < "$file"
done

# Generate project documentation
gemini "Generate technical documentation outline for the entire project" < README.md
```

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="연결 실패 또는 인증 오류가 발생합니까?">
    **체크리스트**:

    1. **환경 변수 확인**:

       ```bash theme={null}
       echo $GOOGLE_GEMINI_BASE_URL
       echo $GEMINI_API_KEY
       ```

       출력은 다음과 같아야 합니다:

       * `GOOGLE_GEMINI_BASE_URL`: `https://api.apiyi.com` (/v1 또는 다른 경로 없음)
       * `GEMINI_API_KEY`: `sk-`로 시작하는 전체 키

    2. **환경 변수 다시 불러오기**:
       ```bash theme={null}
       source ~/.zshrc  # or source ~/.bashrc
       ```

    3. **터미널 재시작**: 터미널을 완전히 닫았다가 다시 여십시오

    4. **API Key 확인**: APIYI 대시보드에 로그인하여 키가 유효하고 잔액이 충분한지 확인하십시오
  </Accordion>

  <Accordion title="Gemini 모델 간에는 어떻게 전환합니까?">
    대화형 모드에서 `/model` 명령을 사용하십시오:

    ```bash theme={null}
    /model gemini-3-pro-preview
    /model gemini-3-pro-preview-thinking
    /model gemini-2.5-flash
    ```

    또는 명령에서 직접 지정할 수 있습니다:

    ```bash theme={null}
    gemini --model gemini-3-pro-preview "your question"
    gemini --model gemini-2.5-flash "quick test"
    ```
  </Accordion>

  <Accordion title="대화 기록은 어떻게 저장합니까?">
    **방법 1**: `/save` 명령 사용

    ```bash theme={null}
    /save conversation-2025-01-01.txt
    ```

    **방법 2**: 출력을 리디렉션

    ```bash theme={null}
    gemini "your question" > output.txt
    gemini "your question" | tee output.txt  # Display and save
    ```

    **방법 3**: 세션 관리 사용

    ```bash theme={null}
    gemini --session my-project "continue previous discussion"
    ```
  </Accordion>

  <Accordion title="Node.js 버전이 요구 사항을 충족하지 않습니까?">
    **권장 사항: nvm으로 Node.js 버전을 관리하십시오**:

    ```bash theme={null}
    # Install nvm
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

    # Install Node.js 18+
    nvm install 18
    nvm use 18
    nvm alias default 18

    # Verify version
    node --version
    ```
  </Accordion>

  <Accordion title="응답이 느린 이유는 무엇입니까?">
    **가능한 원인과 해결 방법**:

    1. **네트워크 문제**: APIYI는 최적화된 국내 노드를 제공하므로 일반적으로 빠릅니다
    2. **모델 선택**: 가장 빠른 응답을 위해 `gemini-2.5-flash` 또는 `gemini-2.5-flash-lite`를 사용하십시오
    3. **token 제한**: 한 번의 요청 복잡도를 줄이십시오
    4. **동시 요청**: 너무 많은 요청을 동시에 보내지 마십시오

    **연결 속도 테스트**:

    ```bash theme={null}
    time gemini --model gemini-2.5-flash "Hello"
    ```
  </Accordion>

  <Accordion title="Windows에서는 어떻게 사용합니까?">
    **권장 사항: PowerShell을 사용하십시오**:

    1. Node.js를 설치하십시오(공식 웹사이트에서 설치 프로그램 다운로드)
    2. PowerShell을 관리자 권한으로 실행하십시오
    3. 환경 변수를 설정하십시오:
       ```powershell theme={null}
       [System.Environment]::SetEnvironmentVariable('GOOGLE_GEMINI_BASE_URL', 'https://api.apiyi.com', 'User')
       [System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'sk-your-key', 'User')
       ```
    4. PowerShell을 다시 시작하십시오
    5. Gemini CLI를 설치하고 사용하십시오

    **또는 WSL**(Windows Subsystem for Linux)을 사용하면 더 나은 경험을 얻을 수 있습니다.
  </Accordion>
</AccordionGroup>

## 모범 사례

### 프롬프트 최적화

<CardGroup cols={2}>
  <Card title="구체적으로 작성합니다" icon="target">
    ❌ "이 코드를 최적화해 주세요"

    ✅ "이 코드를 성능 위주로 최적화해 주세요. 반복문 효율과 메모리 사용에 중점을 두십시오"
  </Card>

  <Card title="맥락을 제공합니다" icon="book">
    ❌ "이 함수의 무엇이 잘못되었습니까?"

    ✅ "이 함수는 비동기 오류가 발생하는 사용자 로그인 함수입니다. 문제를 찾아 주세요"
  </Card>

  <Card title="단계별로 진행합니다" icon="list-ordered">
    ❌ "전체 프로젝트를 완성하는 데 도움을 주세요"

    ✅ "1단계: 데이터베이스 모델을 설계합니다. 2단계: API 경로를 생성합니다. 3단계: ..."
  </Card>

  <Card title="예시를 요청합니다" icon="code">
    ❌ "클로저를 설명해 주세요"

    ✅ "JavaScript 클로저를 3가지 실용적인 사용 사례와 코드 예시와 함께 설명해 주세요"
  </Card>
</CardGroup>

### 워크플로 권장 사항

<Steps>
  <Step title="문제를 정의합니다">
    해결할 문제나 구현할 기능을 명확하게 설명합니다
  </Step>

  <Step title="해결책을 얻습니다">
    Gemini CLI를 사용하여 초기 해결책이나 코드를 생성합니다
  </Step>

  <Step title="검토 및 최적화">
    AI에게 자신의 코드를 검토하고 잠재적인 문제를 찾아 달라고 요청합니다
  </Step>

  <Step title="반복합니다">
    요구 사항을 충족할 때까지 피드백을 바탕으로 점진적으로 최적화합니다
  </Step>

  <Step title="문서를 추가합니다">
    필요한 주석과 문서를 생성합니다
  </Step>
</Steps>

## 과금

APIYI를 통해 Gemini 모델을 사용하는 비용은 선택한 모델과 사용량에 따라 달라집니다.

<Card title="자세한 과금 보기" icon="dollar-sign" href="/ko/api-capabilities/model-info">
  모든 Gemini 모델의 상세 과금 및 비용 효율 비교를 확인합니다
</Card>

<Info>
  APIYI는 충전 보너스를 제공합니다: 충전할수록 보너스가 더 높아집니다(10%-20%). 첫 충전 시 추가 보너스를 받습니다. [충전 프로모션 상세](/ko/faq/recharge-promotions)를 확인하십시오.
</Info>

## 관련 자료

* [Gemini CLI 공식 문서](https://ai.google.dev/gemini-api/docs/cli)
* [APIYI 빠른 시작 가이드](/ko/getting-started)
* [모델 추천 및 가격](/ko/api-capabilities/model-info)
* [충전 프로모션](/ko/faq/recharge-promotions)
* [API 매뉴얼](/ko/api-manual)

## 도움 받기

<CardGroup cols={2}>
  <Card title="기업용 WeChat" icon="message-circle" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
    <img src="https://mintcdn.com/apiyillc/fpi567ydpk7adDt0/images/wecom-qrcode.png?fit=max&auto=format&n=fpi567ydpk7adDt0&q=85&s=7286b96e94110e3a48798b649df1b45b" alt="기업용 WeChat QR 코드" style={{maxWidth: "180px"}} width="400" height="400" data-path="images/wecom-qrcode.png" />

    QR 코드를 스캔하거나 [지원팀에 문의하려면 클릭](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)

    기술 상담, 사용 안내
  </Card>

  <Card title="이메일 문의" icon="mail">
    **고객 서비스**: [support@apiyi.com](mailto:support@apiyi.com)

    **비즈니스**: [business@apiyi.com](mailto:business@apiyi.com)
  </Card>
</CardGroup>

<Tip>
  **빠른 시작**: 위의 “빠른 시작” 섹션을 따라 설정을 완료하고 5분 안에 Gemini CLI 사용을 시작하십시오!
</Tip>
