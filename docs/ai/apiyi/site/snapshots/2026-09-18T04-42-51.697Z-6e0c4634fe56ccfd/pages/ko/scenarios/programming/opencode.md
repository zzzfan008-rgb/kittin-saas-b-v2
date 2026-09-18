> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenCode

> 터미널/IDE/데스크톱 플랫폼을 지원하는 오픈소스 AI 코딩 에이전트이며, 안정적이고 효율적인 코딩 경험을 위해 APIYI로 설정할 수 있습니다

## 개요

OpenCode는 TypeScript와 AI SDK로 구축된 완전한 오픈소스 AI 코딩 에이전트로, 터미널 TUI, IDE 통합, 데스크톱 앱을 제공합니다. 이 프로젝트는 활발한 커뮤니티와 함께 GitHub에서 94.9k+개의 별점을 보유하고 있습니다.

APIYI 서비스를 구성하면 다음을 사용할 수 있습니다:

<CardGroup cols={2}>
  <Card title="🖥️ 멀티플랫폼 지원" icon="monitor">
    터미널 TUI, VS Code 확장, 및 데스크톱 앱
  </Card>

  <Card title="🔌 75개 이상의 모델 지원" icon="plug">
    Models.dev를 통해 75개 이상의 LLM 제공자를 지원합니다.
  </Card>

  <Card title="🛠️ 내장 LSP" icon="code">
    지능적인 코드 이해를 위한 Language Server Protocol 지원
  </Card>

  <Card title="🔄 다중 세션 병렬 처리" icon="layers">
    병렬 세션 처리 및 세션 공유
  </Card>
</CardGroup>

<Info>
  **프로젝트 정보**: OpenCode는 적극적으로 유지보수되는 오픈소스 프로젝트입니다. 웹사이트: `opencode.ai`, 저장소: `github.com/anomalyco/opencode`.
</Info>

## 사전 요구 사항

### OpenCode 설치

<Tabs>
  <Tab title="빠른 설치(권장)">
    ```bash theme={null}
    curl -fsSL https://opencode.ai/install | bash
    ```
  </Tab>

  <Tab title="npm">
    ```bash theme={null}
    npm i -g opencode-ai@latest
    ```
  </Tab>

  <Tab title="Homebrew (macOS/Linux)">
    ```bash theme={null}
    brew install anomalyco/tap/opencode
    ```
  </Tab>

  <Tab title="Windows">
    Scoop:

    ```bash theme={null}
    scoop install opencode
    ```

    Chocolatey:

    ```bash theme={null}
    choco install opencode
    ```
  </Tab>

  <Tab title="Arch Linux">
    ```bash theme={null}
    paru -S opencode-bin
    ```
  </Tab>

  <Tab title="데스크톱 앱">
    `opencode.ai`에서 시스템에 맞는 데스크톱 앱을 다운로드합니다:

    * macOS (Apple Silicon / Intel)
    * Windows
    * Linux (AppImage / deb)
  </Tab>
</Tabs>

설치 확인:

```bash theme={null}
opencode --version
```

## 빠른 설정

OpenCode는 여러 구성 위치를 사용하는 JSON 구성 파일을 사용합니다(우선순위: 낮음에서 높음):

1. 원격 구성 (`.well-known/opencode`)
2. 전역 구성: `~/.config/opencode/opencode.json`
3. 사용자 지정 구성: `OPENCODE_CONFIG` 환경 변수로 지정한 경로
4. 프로젝트 구성: 프로젝트 루트의 `opencode.json`
5. `.opencode` 디렉터리 구성
6. 인라인 구성: `OPENCODE_CONFIG_CONTENT` 환경 변수

### 방법 1: 사용자 지정 제공자(권장)

구성 파일 `~/.config/opencode/opencode.json`을 생성하거나 편집합니다:

```json theme={null}
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "apiyi": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "APIYI",
      "options": {
        "baseURL": "https://api.apiyi.com/v1",
        "apiKey": "{env:APIYI_API_KEY}"
      },
      "models": {
        "claude-sonnet-4-20250514": {
          "name": "Claude Sonnet 4",
          "limit": { "context": 200000, "output": 8192 }
        },
        "gpt-4.1": {
          "name": "GPT-4.1",
          "limit": { "context": 1047576, "output": 32768 }
        },
        "deepseek-chat": {
          "name": "DeepSeek V3",
          "limit": { "context": 65536, "output": 8192 }
        },
        "gemini-2.5-pro-preview-05-06": {
          "name": "Gemini 2.5 Pro",
          "limit": { "context": 1048576, "output": 65536 }
        }
      }
    }
  },
  "model": "apiyi/claude-sonnet-4-20250514"
}
```

그다음 환경 변수를 설정합니다:

<Tabs>
  <Tab title="macOS/Linux">
    ```bash theme={null}
    # zsh
    echo 'export APIYI_API_KEY="sk-your-apiyi-key"' >> ~/.zshrc
    source ~/.zshrc

    # bash
    echo 'export APIYI_API_KEY="sk-your-apiyi-key"' >> ~/.bashrc
    source ~/.bashrc
    ```
  </Tab>

  <Tab title="Windows">
    PowerShell:

    ```powershell theme={null}
    [System.Environment]::SetEnvironmentVariable('APIYI_API_KEY', 'sk-your-apiyi-key', 'User')
    ```

    또는 시스템 환경 변수에 `APIYI_API_KEY`을 추가합니다.
  </Tab>
</Tabs>

### 방법 2: /connect 명령 인증

OpenCode는 새 제공자를 빠르게 연결할 수 있는 `/connect` 명령을 제공합니다:

1. OpenCode를 시작한 후 `/connect`를 입력합니다.
2. “기타”를 선택합니다.
3. 제공자 ID를 입력합니다(예: `apiyi`)
4. API 키를 입력합니다

그다음 구성 파일에 제공자와 모델 정의를 추가하여 사용합니다.

### 방법 3: 기존 제공자 재정의

빠른 설정을 위해 내장 OpenAI 제공자의 baseURL을 재정의합니다:

```json theme={null}
{
  "provider": {
    "openai": {
      "options": {
        "baseURL": "https://api.apiyi.com/v1",
        "apiKey": "{env:APIYI_API_KEY}"
      }
    }
  }
}
```

### 방법 4: 프로젝트 수준 구성

프로젝트별 설정을 위해 프로젝트 루트에 `opencode.json`을 생성합니다:

```json theme={null}
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "apiyi": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "APIYI",
      "options": {
        "baseURL": "https://api.apiyi.com/v1",
        "apiKey": "{env:APIYI_API_KEY}"
      },
      "models": {
        "claude-sonnet-4-20250514": {
          "name": "Claude Sonnet 4",
          "limit": { "context": 200000, "output": 8192 }
        }
      }
    }
  },
  "model": "apiyi/claude-sonnet-4-20250514"
}
```

## 에이전트 시스템

OpenCode에는 각각 특정 목적을 가진 세 가지 내장 에이전트가 있습니다:

| 에이전트        | 설명                                        | 사용            |
| ----------- | ----------------------------------------- | ------------- |
| **build**   | 전체 액세스 권한을 가진 기본 에이전트이며, 코드 생성과 수정을 처리합니다 | 직접 대화         |
| **plan**    | 코드 분석과 계획을 위한 읽기 전용 에이전트이며, 파일을 수정하지 않습니다 | `/plan` 명령    |
| **general** | 다단계 정보 검색을 위한 복합 검색 서브 에이전트입니다            | `@general` 호출 |

### 에이전트 모델 설정

에이전트마다 다른 모델을 설정합니다:

```json theme={null}
{
  "provider": {
    "apiyi": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "APIYI",
      "options": {
        "baseURL": "https://api.apiyi.com/v1",
        "apiKey": "{env:APIYI_API_KEY}"
      },
      "models": {
        "claude-sonnet-4-20250514": {
          "name": "Claude Sonnet 4",
          "limit": { "context": 200000, "output": 8192 }
        },
        "deepseek-chat": {
          "name": "DeepSeek V3",
          "limit": { "context": 65536, "output": 8192 }
        },
        "gpt-4.1-mini": {
          "name": "GPT-4.1 Mini",
          "limit": { "context": 1047576, "output": 32768 }
        }
      }
    }
  },
  "agents": {
    "build": {
      "model": "apiyi/claude-sonnet-4-20250514"
    },
    "plan": {
      "model": "apiyi/deepseek-chat"
    },
    "general": {
      "model": "apiyi/gpt-4.1-mini"
    }
  }
}
```

## 권장 모델

OpenCode는 APIYI를 통해 400개 이상의 AI 모델을 지원합니다. 다양한 작업에 맞는 적절한 모델을 선택하십시오.

<Card title="프로그래밍 모델 권장 사항 보기" icon="code" href="/ko/api-capabilities/model-info">
  최신 프로그래밍 모델 권장 사항, 성능 비교, 사용 제안을 확인하십시오. 최상위 모델, 비용 효율적인 옵션, 추론이 강화된 모델이 포함됩니다.
</Card>

### 시나리오별 모델 권장 사항

| 에이전트    | 용도           | 권장 모델                       |
| ------- | ------------ | --------------------------- |
| build   | 코드 생성 및 수정   | Claude Sonnet 4, GPT-4.1    |
| plan    | 작업 계획 및 분석   | DeepSeek V3, Gemini 2.5 Pro |
| general | 빠른 검색 및 Q\&A | GPT-4.1 Mini(저비용)           |

## 핵심 기능

### 터미널 대화형 인터페이스

대화형 TUI로 들어가려면 OpenCode를 시작합니다:

```bash theme={null}
# Start in current directory
opencode

# Specify project directory
opencode /path/to/project
```

### 파일 작업

OpenCode는 프로젝트 파일을 읽고, 검색하고, 수정할 수 있습니다:

```text theme={null}
> View the contents of src/index.ts

> Search for all files containing "TODO" in the project

> Refactor the calculateSum function in utils.ts to a more efficient implementation
```

### 명령 실행

터미널에서 명령을 실행하고 결과를 확인합니다:

```text theme={null}
> Run npm test and analyze the failed tests

> Execute npm install and check for dependency conflicts
```

### 세션 관리

* **다중 세션 병렬 실행**: 여러 세션을 동시에 실행합니다
* **세션 공유**: 세션을 내보내고 공유합니다
* **자동 저장**: 모든 세션이 자동으로 저장됩니다
* **컨텍스트 유지**: 세션 중 전체 대화 컨텍스트를 유지합니다

## 사용 팁

### 1. 키보드 단축키

| 단축키      | 기능          |
| -------- | ----------- |
| `Ctrl+C` | 현재 작업 중단    |
| `Ctrl+D` | OpenCode 종료 |
| `Tab`    | 자동 완성       |
| `↑/↓`    | 명령어 기록 탐색   |

### 2. 일반 명령

| 명령         | 기능                |
| ---------- | ----------------- |
| `/connect` | 새 Provider 연결     |
| `/model`   | 현재 모델 전환          |
| `/plan`    | 분석에 plan agent 사용 |
| `/clear`   | 현재 세션 지우기         |
| `/help`    | 도움말 정보 보기         |

### 3. 서브 에이전트 호출

복잡한 쿼리에 대해서는 검색 서브 에이전트를 호출하려면 `@general`을 사용합니다:

```text theme={null}
> @general Find all files handling user authentication in the codebase and summarize their functions
```

### 4. 점진적 개발

```text theme={null}
{/* Step 1: Generate basic framework */}
> Create a basic REST API structure

{/* Step 2: Add specific features */}
> Add user authentication middleware

{/* Step 3: Refine details */}
> Add request parameter validation and error handling
```

## 문제 해결

<AccordionGroup>
  <Accordion title="APIYI에 연결하지 못했습니다">
    1. 환경 변수가 올바르게 설정되었는지 확인합니다:

    ```bash theme={null}
    echo $APIYI_API_KEY  # macOS/Linux
    echo %APIYI_API_KEY%  # Windows
    ```

    2. 구성 파일의 baseURL을 확인합니다:

    ```json theme={null}
    "baseURL": "https://api.apiyi.com/v1"
    ```

    3. API 연결을 테스트합니다:

    ```bash theme={null}
    curl -H "Authorization: Bearer $APIYI_API_KEY" \
         https://api.apiyi.com/v1/models
    ```
  </Accordion>

  <Accordion title="모델을 찾을 수 없음 오류">
    모델 ID가 올바른지 확인합니다. 지원되는 모델은 APIYI 콘솔에서 확인합니다.

    일반적인 모델 ID:

    * `claude-sonnet-4-20250514`
    * `gpt-4.1`
    * `deepseek-chat`
    * `gemini-2.5-pro-preview-05-06`
  </Accordion>

  <Accordion title="구성 파일이 적용되지 않음">
    구성 파일 로드 우선순위(낮음에서 높음 순):

    1. 원격 구성 (`.well-known/opencode`)
    2. 전역 구성: `~/.config/opencode/opencode.json`
    3. `OPENCODE_CONFIG` 환경 변수
    4. 프로젝트 구성: `opencode.json`
    5. `.opencode` 디렉터리 구성
    6. `OPENCODE_CONFIG_CONTENT` 환경 변수

    구성 파일이 올바른 위치에 있고 유효한 JSON 형식인지 확인합니다.
  </Accordion>

  <Accordion title="응답 속도가 느림">
    1. 더 가벼운 모델을 사용해 봅니다(예: GPT-4.1 Mini)
    2. 컨텍스트 길이를 줄이고 새 세션을 시작합니다
    3. 네트워크 연결 안정성을 확인합니다
  </Accordion>
</AccordionGroup>

## 모범 사례

### 1. 모델 선택 전략

| 작업 유형     | 권장 모델           | 이유                          |
| --------- | --------------- | --------------------------- |
| 복잡한 코드 생성 | Claude Sonnet 4 | 강력한 코딩 능력, 우수한 컨텍스트 이해      |
| 코드 리뷰     | GPT-4.1         | 강력한 분석 능력, 세부 사항에 대한 높은 주의력 |
| 빠른 Q\&A   | DeepSeek V3     | 빠른 응답, 비용 효율적               |
| 긴 문서 분석   | Gemini 2.5 Pro  | 초장문 컨텍스트 지원                 |

### 2. 효과적인 프롬프트

```text theme={null}
❌ Poor prompt: Help me write code

✅ Good prompt: Write an HTTP middleware in TypeScript that
logs requests, including request method, path,
response time, and status code, using pino for output
```

### 3. 보안 고려 사항

* 코드에 API 키를 하드코딩하지 마십시오
* 민감한 정보는 환경 변수를 사용하여 관리하십시오
* AI가 생성한 코드를 검토하십시오. 특히 보안 관련 부분을 주의하십시오
* AI가 위험한 시스템 명령을 실행하지 않도록 주의하십시오

### 4. 비용 관리

* 서로 다른 에이전트에 서로 다른 모델을 구성하십시오(빌드에는 강력한 모델, 일반 작업에는 경량 모델)
* 단순 작업에는 경량 모델을 사용하십시오
* 사용량을 모니터링하기 위해 정기적으로 APIYI 콘솔을 확인하십시오

## 대안

OpenCode가 필요를 충족하지 못한다면 다음 도구를 고려하십시오:

<CardGroup cols={2}>
  <Card title="Claude Code" icon="bot" href="/ko/scenarios/programming/claude-code">
    Anthropic의 공식 터미널 프로그래밍 어시스턴트
  </Card>

  <Card title="Codex CLI" icon="code" href="/ko/scenarios/programming/codex-cli">
    OpenAI의 공식 명령줄 도구
  </Card>

  <Card title="Gemini CLI" icon="terminal" href="/ko/scenarios/programming/gemini-cli">
    Google의 공식 터미널 프로그래밍 어시스턴트
  </Card>

  <Card title="Roo Code" icon="wand-sparkles" href="/ko/scenarios/programming/roo-code">
    VS Code AI 프로그래밍 확장 기능
  </Card>
</CardGroup>

## 관련 리소스

<CardGroup cols={2}>
  <Card title="APIYI 콘솔" icon="settings" href="https://api.apiyi.com">
    API 키를 관리하고 사용량을 확인합니다
  </Card>

  <Card title="모델 추천" icon="chart-bar" href="/ko/api-capabilities/model-info">
    프로그래밍 시나리오에 대한 모델 추천을 확인합니다
  </Card>
</CardGroup>
