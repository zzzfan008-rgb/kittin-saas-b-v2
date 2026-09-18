> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Claude Code

> Claude의 공식 CLI 프로그래밍 어시스턴트로, APIYI로 구성되어 안정적이고 효율적인 AI 프로그래밍 경험을 제공합니다

<Warning>
  **비용 측면에서 먼저 말씀드리면**: 긴 컨텍스트 코딩 작업과 에이전트식 심층 탐색에서는 **사용량 기반 API 사용이 잔액을 매우 빠르게 소모하며, 보통 공식 구독보다 가치가 떨어집니다**.

  코딩 에이전트는 프로젝트 컨텍스트를 다시 읽고, 도구 출력을 소화하며, 매 턴마다 반복적으로 개선합니다. 진지한 작업 하나만으로도 쉽게 수십만 tokens가 소모됩니다. 이런 일은 실제로 있었습니다. **\$5의 잔액이 한 번의 심층 탐색 실행이 끝나기도 전에 소진되었습니다**. 이는 결함이 아니라, 이런 종류의 작업에서의 정상적인 소모 속도입니다.

  * **사용량이 많고, 공식 서비스를 직접 이용할 수 있는 경우**: 공식 Claude Pro / Max 구독을 구매하십시오 — 그 정도 사용량이라면 월정액이 더 좋은 가치입니다.
  * **네트워크가 차단되어 있거나, 사용한 만큼만 내고 싶은 경우**: API가 더 적합합니다 — 프록시 없이 직접 접근할 수 있고, 고정 월 사용료도 없으며, 유지해야 할 공식 계정도 없고, 400개+ 모델을 위한 하나의 키만 있으면 됩니다.

  어느 쪽이든 무조건 더 낫지는 않습니다. 실제 사용량과 네트워크 상황에 따라 선택하십시오. 청구서에 놀랄 일이 없도록 미리 말씀드립니다.
</Warning>

## 개요

Claude Code는 Anthropic의 공식 커맨드라인 프로그래밍 어시스턴트로, 터미널에서 Claude의 강력한 프로그래밍 기능을 직접 사용할 수 있게 해줍니다. APIYI 서비스를 구성하면 다음과 같은 이점을 얻을 수 있습니다:

<CardGroup cols={2}>
  <Card title="🚀 안정적인 연결" icon="wifi">
    프록시 없이 직접 연결하며, 네트워크 불안정이 없습니다
  </Card>

  <Card title="💳 사용한 만큼 지불" icon="wallet">
    고정 월 요금이 없으며 — 사용한 만큼만 지불합니다
  </Card>

  <Card title="⚡ 높은 동시 실행 수" icon="bolt">
    APIYI가 지원하는 무제한 접근
  </Card>

  <Card title="🔧 간단한 설정" icon="wrench">
    몇 분 만에 설정 완료
  </Card>
</CardGroup>

<Info>
  **사용한 만큼 지불하는 방식과 공식 Claude Max 플랜 — 무엇을 선택해야 합니까?**

  * **Claude Max(공식 구독)**: 지출을 상한으로 묶는 정액 월 요금입니다. **코드 작성만 하며 막대한 사용량을 소화하는 헤비 유저에게는 더 나은 선택**입니다 — 단, 공식 네트워크 요구사항을 충족할 수 있고 계정을 직접 관리할 의향이 있으며 차단 위험도 감수해야 합니다.
  * **APIYI의 Claude 설정**: 차단 위험이 없는 사용한 만큼 지불 방식입니다. 품질은 두 개의 채널로 뒷받침됩니다. AWS Bedrock의 공식 접근과 Anthropic의 공식 키 직접 연결입니다. 또한 충전 보너스로 실제 지불액을 낮출 수 있습니다. 사용해 본 고객들의 평이 좋고 계속 충전하고 있습니다. 기업에게는 직접 접속과 세무 준수(세금계산서 발행)도 해결해 줍니다.
  * **API가 더 유연합니다**: 코딩을 넘어 동일한 키로 400+개 모델에 접근할 수 있어, 단일 코딩 플랜보다 훨씬 더 많은 선택지를 제공합니다.
</Info>

## 토큰 그룹: ClaudeCode

APIYI를 Claude Code와 함께 사용할 때는, **토큰을 생성할 때 `ClaudeCode` 그룹을 선택해야 합니다**(콘솔의 토큰 생성 대화상자에 있는 `그룹` 옵션). 이 그룹은 Anthropic의 네이티브 `/v1/messages` 형식과 호환되는 모든 모델을 하나의 채널로 묶어, Claude Code 시나리오에 전용으로 제공합니다.

<Tip>
  **ClaudeCode 그룹은 기본적으로 5% 할인이 적용됩니다** — 별도 조치가 필요하지 않습니다. 이 할인은 충전 보너스 프로모션(10%\~20%)과 중복 적용되며, 유효 비용은 공식 직접 가격보다 대략 20% 낮아집니다.
</Tip>

<Note>
  **이 그룹은 어디에서 사용할 수 있습니까?**

  * **Claude Code 내부**: 이 그룹은 Claude Code에 가장 적합합니다. **일부 중국 내수 모델은 Claude Code 내부에서만 ClaudeCode 그룹 토큰으로 호출할 수 있습니다** — 다른 그룹의 토큰은 실패합니다.
  * **Claude Code 외부**: ClaudeCode 그룹 토큰도 **문제없이 작동합니다** — Claude Code에만 제한되지 않습니다. 이 경우 순수한 할인으로 적용되며, 기본 5% 할인(0.95배)에 충전 보너스 프로모션(10%\~20%)이 중복 적용됩니다.
</Note>

### Claude Code에서 사용할 수 있는 중국 내수 모델

전체 Claude 라인업 외에도, `ClaudeCode` 그룹에는 Anthropic의 네이티브 `/v1/messages` 형식과 호환되는 중국 내수 코딩 모델 집합도 포함되어 있습니다. Claude Code에서 모델 이름을 아래 모델 ID 중 하나로 바꾸기만 하면 됩니다 — **ClaudeCode 그룹에서 생성한 token도 필요합니다**; 다른 그룹의 토큰으로는 호출이 실패합니다.

| 모델 ID                    | 공급사      | 입력 / 1M token | 출력 / 1M token |
| ------------------------ | -------- | ------------- | ------------- |
| `deepseek-v4-flash`      | DeepSeek | \$0.133       | \$0.266       |
| `deepseek-v4-pro`        | DeepSeek | \$0.408       | \$0.817       |
| `glm-4.7`                | Zhipu    | \$0.570       | \$2.052       |
| `glm-5`                  | Zhipu    | \$0.532       | \$2.394       |
| `glm-5.1`                | Zhipu    | \$0.798       | \$3.192       |
| `kimi-k2.5`              | Moonshot | \$0.570       | \$2.992       |
| `kimi-k2.6`              | Moonshot | \$0.570       | \$2.280       |
| `MiniMax-M2.7`           | MiniMax  | \$0.285       | \$1.140       |
| `MiniMax-M2.7-highspeed` | MiniMax  | \$0.570       | \$2.280       |
| `MiniMax-M3`             | MiniMax  | \$0.285       | \$1.140       |
| `qwen3.6-plus`           | Alibaba  | \$0.285       | \$1.710       |
| `qwen3.7-max`            | Alibaba  | \$1.628       | \$4.885       |

<Info>
  위의 모든 모델은 사용량 기반 과금이며, 표에는 기본 가격이 표시되어 있습니다. ClaudeCode 그룹의 token은 자동으로 추가 5% 할인을 받습니다. 모델 목록은 지속적으로 업데이트되므로, 최신 가격은 콘솔의 모델 마켓플레이스를 확인하십시오.
</Info>

<Card title="토큰 그룹 알아보기" icon="layers" href="/ko/faq/groups-explained">
  ClaudeCode 그룹은 왜 존재합니까? 그룹과 할인은 어떻게 작동합니까? 그룹 메커니즘에 대한 전체 설명을 보십시오.
</Card>

## 빠른 시작

<Note>
  **간소화된 구성 팁**: Claude 공식 계정을 등록하고 싶지 않으시다면, 아래의 [고급 구성](#advanced-configuration) 섹션을 확인하여 `~/.claude.json` 파일 구성을 사용하시기 바랍니다. 이렇게 하면 공식 인증을 완전히 우회할 수 있습니다.
</Note>

### 1. Claude Code 설치

터미널에서 다음 명령을 실행하여 전역으로 설치하십시오:

```bash theme={null}
npm install -g @anthropic-ai/claude-code
```

<Info>
  Node.js 18 이상이 필요합니다. 설치되어 있지 않다면 [nodejs.org](https://nodejs.org)를 방문하여 다운로드하고 설치하십시오.
</Info>

### 2. API Key 구성

#### API Key 받기

APIYI 키를 받으려면 [API Key 관리 튜토리얼](/ko/faq/token-management)을 참고하십시오.

#### 환경 변수 설정

시스템 환경 변수에 APIYI 구성을 추가하십시오.

<Tabs>
  <Tab title="macOS/Linux">
    `~/.zshrc` 또는 `~/.bashrc` 파일을 편집하십시오:

    ```bash theme={null}
    # APIYI Configuration
    export ANTHROPIC_AUTH_TOKEN="sk-***"
    export ANTHROPIC_BASE_URL="https://api.apiyi.com"
    ```

    <Tip>
      **Mac 사용자 팁**: 사용자 디렉터리에서 `⌘ + ⇧ + .`을 눌러 숨김 파일을 표시한 다음, 텍스트 편집기로 `.zshrc` 파일을 여십시오.
    </Tip>
  </Tab>

  <Tab title="Windows">
    PowerShell을 사용하여 구성을 편집하십시오:

    ```powershell theme={null}
    # Edit configuration file
    notepad $PROFILE

    # Add the following content
    $env:ANTHROPIC_AUTH_TOKEN = "sk-***"
    $env:ANTHROPIC_BASE_URL = "https://api.apiyi.com"
    ```
  </Tab>
</Tabs>

### 3. 구성 적용

<Tabs>
  <Tab title="macOS/Linux">
    ```bash theme={null}
    source ~/.zshrc
    # or
    source ~/.bashrc
    ```
  </Tab>

  <Tab title="Windows">
    PowerShell을 다시 시작하거나 다음을 실행하십시오:

    ```powershell theme={null}
    . $PROFILE
    ```
  </Tab>
</Tabs>

### 4. Claude Code 실행

프로젝트 디렉터리로 이동한 다음 실행하십시오:

```bash theme={null}
# Enter project directory
cd ~/Desktop/my-project

# Launch Claude Code
claude
```

## 고급 설정

### 구성 파일(권장)

Claude 공식 검증을 우회하려면 두 파일을 함께 구성해야 합니다:

**1단계**: 공식 검증을 우회하려면 홈 디렉터리에 `~/.claude.json`을 생성합니다:

```json theme={null}
{
  "hasCompletedOnboarding": true
}
```

**2단계**: `~/.claude/settings.json`에서 APIYI 서비스를 구성합니다:

```json theme={null}
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "sk-your-APIYI-key",
    "ANTHROPIC_BASE_URL": "https://api.apiyi.com"
  }
}
```

<Tip>
  **중요 참고**: `hasCompletedOnboarding: true`는 Claude 공식 계정 검증을 완전히 우회하여 APIYI 서비스를 직접 사용할 수 있게 합니다. 즉, 다음이 필요하지 않습니다:

  * Claude 공식 계정 등록(등록이 어렵고, 해외 전화번호가 필요합니다)
  * Claude 공식 계정이 차단될까 걱정하기
  * 추가 인증 단계 수행하기
</Tip>

<Warning>
  **보안 알림**: 구성 파일에는 API 키와 같은 민감한 정보가 포함되어 있으므로, 다른 사람과 공유하지 마십시오.
</Warning>

### 전역 인증(권장하지 않음)

`hasCompletedOnboarding: true`을 구성하지 않으면 첫 사용 시 인증 페이지가 나타납니다:

1. 확인을 위해 Claude 공식 웹사이트로 리디렉션해야 합니다
2. Claude 공식 계정이 필요합니다(등록이 어렵고 쉽게 차단될 수 있습니다)
3. 인증이 성공하면 터미널로 돌아갑니다

<Info>
  **권장 사항**: Claude 공식 계정의 여러 제한을 피하려면 위의 구성 파일 방식을 강력히 권장합니다.
</Info>

## 사용자 가이드

### 기본 명령

실행 후 Claude Code는 현재 설정 정보를 표시합니다:

```bash theme={null}
claude
# Displays API Key and API Base URL
# Confirm configuration is correct and select Yes to continue
```

### 작업 흐름

1. **어시스턴트 실행**: 프로젝트 디렉터리에서 `claude`를 실행합니다
2. **요구 사항 설명**: 프로그래밍 필요 사항이나 질문을 입력합니다
3. **대화형 상호작용**: Claude는 문맥을 이해하고 코드 제안을 제공합니다
4. **변경 사항 적용**: 확인 후 Claude가 파일을 직접 수정할 수 있습니다

### 지원 기능

* ✅ 코드 생성 및 최적화
* ✅ 버그 수정 및 디버깅
* ✅ 코드 리팩터링 제안
* ✅ 문서 작성
* ✅ 테스트 케이스 생성
* ✅ 기술 Q\&A

## 모델 선택

Claude Code는 기본적으로 최신 Claude 모델을 사용합니다. APIYI를 통해 다음에 접근할 수 있습니다.

| 모델                           | 기능              | 권장 시나리오   |
| ---------------------------- | --------------- | --------- |
| **Claude 4 Sonnet**          | 가장 강력한 프로그래밍 성능 | 복잡한 코드 작업 |
| **Claude Opus 4.1**          | 성능 업그레이드        | 고부하 프로그래밍 |
| **Claude 4 Sonnet Thinking** | 사고 연쇄 모드        | 복잡한 추론    |

## 문제 해결

### 일반적인 문제

<AccordionGroup>
  <Accordion title="Anthropic 서비스에 연결할 수 없음">
    이는 일반적으로 네트워크 구성 문제입니다. 다음을 확인하십시오:

    1. 환경 변수가 올바르게 설정되어 있는지
    2. API 키가 유효한지
    3. 네트워크 연결이 정상인지

    다음 명령을 실행하여 구성을 확인하십시오:

    ```bash theme={null}
    echo $ANTHROPIC_AUTH_TOKEN
    echo $ANTHROPIC_BASE_URL
    ```
  </Accordion>

  <Accordion title="Claude 공식 계정 인증을 요청받음">
    이는 `hasCompletedOnboarding`이 구성되지 않았기 때문입니다. `{"hasCompletedOnboarding": true}`를 `~/.claude.json`에 추가하고, `~/.claude/settings.json`에서 APIYI 환경 변수를 구성하십시오. 자세한 내용은 위의 [고급 구성](#advanced-configuration)을 참조하십시오.
  </Accordion>

  <Accordion title="잘못된 API 키">
    Claude 공식 웹사이트의 키가 아니라 APIYI의 키를 사용하고 있는지 확인하십시오. 키를 얻으려면 [API Key 관리 튜토리얼](/ko/faq/token-management)을 참조하십시오.
  </Accordion>

  <Accordion title="Claude Code를 업데이트하는 방법">
    최신 버전으로 업데이트하려면 다음 명령을 실행하십시오:

    ```bash theme={null}
    npm update -g @anthropic-ai/claude-code
    ```
  </Accordion>

  <Accordion title="지원되는 프로그래밍 언어">
    Claude Code는 다음을 포함하되 이에 국한되지 않는 모든 주요 프로그래밍 언어를 지원합니다:

    * Python, JavaScript/TypeScript, Java, C++, C#
    * Go, Rust, Swift, Kotlin
    * HTML/CSS, SQL, Shell Scripts
    * 그 외에도 더 많습니다...
  </Accordion>
</AccordionGroup>

## 모범 사례

### 효과적인 프롬프트

```markdown theme={null}
Good prompts:
"Help me refactor this Python function to make it more efficient and add type annotations"
"This code has a memory leak, please help me find and fix it"
"Write unit tests for this React component"

Avoid being too broad:
"Improve my code"  # Too vague
```

### 프로젝트 구조 권장 사항

* 코드베이스를 깔끔하고 체계적으로 유지합니다
* 파일 이름을 명확하게 지정합니다
* 적절한 주석을 추가합니다
* 프로젝트 README를 제공합니다

## 성능 최적화

### 응답 속도 향상

1. **`~/.claude.json` 설정 사용**: 이렇게 하면 매번 검증을 피할 수 있으며, 특히 `hasCompletedOnboarding: true` 설정 후 시작 속도가 더 빨라집니다
2. **대화 일관성 유지**: 관련 작업은 같은 세션에서 처리합니다
3. **명확한 요구사항**: 설명이 명확할수록 왕복 상호작용이 줄어듭니다

### 비용 제어

* Claude Code는 token 사용량에 따라 과금됩니다
* APIYI를 통해 우대 가격을 이용할 수 있습니다
* 자세한 내용은 [가격 페이지](/ko/pricing)를 확인하십시오

## 관련 자료

<CardGroup cols={2}>
  <Card title="API 키 관리" icon="book" href="https://docs.apiyi.com/faq/token-management">
    API 키 설정 튜토리얼
  </Card>

  <Card title="Claude Code 공식 문서" icon="terminal">
    공식 문서: `code.claude.com/docs`
  </Card>

  <Card title="모델 소개" icon="bot" href="/ko/api-capabilities/model-info">
    Claude 시리즈 모델에 대해 알아보세요
  </Card>

  <Card title="기타 프로그래밍 도구" icon="code" href="/ko/scenarios/programming/cursor">
    Cursor 같은 도구를 살펴보세요
  </Card>
</CardGroup>

## 요약

Claude Code와 APIYI를 결합하면 개발자에게 안정적이고 유연한 AI 코딩 환경을 제공합니다: 프록시 없이 직접 접속할 수 있고, 사용량 기반 과금이며, 고정 월 요금이 없습니다. 네트워크가 제한되어 있거나 사용량이 들쭉날쭉한 경우 특히 잘 맞습니다. **공식 서비스를 직접 이용할 수 있는 고빈도 사용자라면, 이 페이지 상단의 비용 안내와 비교해 보시기 바랍니다.**

<Info>
  **팁**: 프로그래밍 시나리오에서 더 많은 AI 도구를 보려면 [OpenAI Codex CLI](/ko/scenarios/programming/codex-cli) 및 다른 विकल्प들을 확인해 보십시오.
</Info>
