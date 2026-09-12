> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# OpenAI Codex

> 하나의 설정, 세 가지 사용 경로: Codex 데스크톱 앱, IDE 확장(VSCode/Cursor), 그리고 CLI에서 APIYI를 통해 gpt-5.6-sol / gpt-5.5 / gpt-5.4를 사용합니다. 권장 경로는 config.toml + auth.json입니다 — env-var를 번거롭게 다룰 필요가 없습니다.

<Warning>
  **비용 면에서는 먼저 말씀드리면**: 긴 컨텍스트의 코딩 작업과 에이전트식 심층 탐색에서는 **종량제 API 사용이 크레딧을 빠르게 소진하며, 보통 공식 구독보다 가성비가 떨어집니다**.

  Codex는 프로젝트 컨텍스트를 다시 읽고, 도구 출력을 소화하며, 매 턴마다 반복 작업을 수행합니다. 단일한 진지한 작업도 쉽게 수십만 token에 달합니다. 실제로 이런 일이 있었습니다: **\$5의 크레딧이 한 번의 deep-research 실행이 끝나기도 전에 소진되었습니다**. 이것은 결함이 아니라, 이런 종류의 작업에서 정상적인 소모 속도입니다.

  * **사용량이 많고, 공식 서비스에 직접 도달할 수 있는 경우**: 공식 ChatGPT Plus / Pro 구독을 구매하십시오. 월 정액 요금이 그 정도 사용량에서는 더 가성비가 좋습니다.
  * **네트워크상 차단되어 있거나, 사용한 만큼만 지불하고 싶을 때**: API가 더 적합합니다. 프록시 없이 직접 접근할 수 있고, 고정 월 요금이 없으며, 유지해야 할 공식 계정도 없고, 400개 이상의 모델에 대해 하나의 키만 있으면 됩니다.

  어느 쪽이든 절대적으로 더 낫지는 않습니다. 실제 사용량과 네트워크 상황에 따라 선택하십시오. 이처럼 미리 알려드리는 이유는 청구서에 예상 밖의 일이 없도록 하기 위함입니다.
</Warning>

## 개요

<Info>
  **Codex와 ChatGPT 앱이 통합되었습니다**: 2026년 7월 초, OpenAI는 Codex 데스크톱 앱을 ChatGPT 앱에 통합하여 이제 둘은 하나의 제품이 되었습니다. 따라서 이 가이드는 **Codex 앱과 ChatGPT 앱 모두에 적용됩니다**: ChatGPT 앱 안에서 Codex를 사용하는 경우에도 설정은 완전히 동일합니다.
</Info>

**OpenAI Codex**는 OpenAI의 공식 AI 코딩 도우미로, **데스크톱 앱**, **IDE 확장 프로그램**(VSCode / Cursor 등), 그리고 **command-line CLI**의 세 가지 방식으로 사용할 수 있습니다. 세 방식 모두 `~/.codex/` 아래의 **동일한 설정**을 공유합니다(`config.toml` 및 `auth.json`).

APIYI와 연동하는 방법은 한 문장으로 끝납니다:

> **OpenAI의 엔드포인트를 APIYI로 바꾸십시오**

APIYI는 \*\*OpenAI 호환 인터페이스(투명 프록시)\*\*입니다. 한 번만 설정하면 데스크톱 앱, 확장 프로그램, 터미널이 모두 작동합니다.

<CardGroup cols={2}>
  <Card title="🔁 하나의 설정, 세 가지 환경" icon="layers">
    데스크톱 / 확장 프로그램 / CLI는 모두 `~/.codex/`를 공유합니다 — 한 번만 설정하면 됩니다
  </Card>

  <Card title="⚡ 최신 모델" icon="sparkles">
    `gpt-5.6-sol` / `gpt-5.5` / `grok-4.5` 및 기타 모델을 지원합니다
  </Card>

  <Card title="💰 사용한 만큼 결제" icon="calculator">
    OpenAI의 자체 API와 같은 과금 모델이며, 고정 월 요금이 없습니다
  </Card>

  <Card title="🪟 크로스 플랫폼" icon="globe">
    Windows / Mac / Linux — 모두 지원됩니다
  </Card>
</CardGroup>

<Info>
  **먼저 이해하십시오**: Codex를 APIYI 같은 타사 API에 연결하는 핵심은 `~/.codex/config.toml`에서 “모델 공급자”를 APIYI로 설정하고 `~/.codex/auth.json`에 키를 넣는 것입니다. **데스크톱 앱과 IDE 확장 프로그램은 둘 다 이 파일들에 의존합니다** — 따라서 이 가이드는 환경 변수보다 구성 파일을 먼저 다룹니다.
</Info>

## 1. 준비 사항: APIYI 키 받기

<Steps>
  <Step title="APIYI에 회원가입 / 로그인하기">
    [api.apiyi.com](https://api.apiyi.com)으로 이동하여 등록하거나 로그인하십시오.
  </Step>

  <Step title="API 키 만들기">
    “토큰 관리” 페이지([api.apiyi.com/token](https://api.apiyi.com/token))를 열고 “새 토큰 생성”을 클릭하십시오.
  </Step>

  <Step title="키 복사하기">
    생성된 API 키(형식: `sk-***`)를 복사하고 안전하게 보관하십시오 — 설정 파일에 붙여넣게 됩니다.
  </Step>
</Steps>

### 사용할 인터페이스 선택

세 가지 인터페이스는 모두 **완전히 동일한 설정**을 사용합니다 — 작업 흐름에 맞는 것을 선택하십시오:

<CardGroup cols={3}>
  <Card title="🖥️ 데스크톱 앱" icon="monitor">
    독립형 앱으로, 바로 사용할 수 있으며, **초보자에게 가장 적합합니다**
  </Card>

  <Card title="🧩 IDE 확장" icon="puzzle">
    VSCode / Cursor 확장으로, 코드와 함께 사용할 수 있습니다
  </Card>

  <Card title="⌨️ CLI" icon="terminal">
    터미널 워크플로로, 스크립트와 자동화에 매우 적합합니다
  </Card>
</CardGroup>

## 2. 핵심 설정(권장: 설정 파일, 환경 변수 아님)

아래에 세 가지 방법이 있습니다. **하나만 선택하십시오**. 권장 순서: 설정 파일 직접 작성(가장 안정적) → 시각적 방식 → 환경 변수입니다.

### 옵션 1 · 직접 작성 `auth.json` + `config.toml` (권장, 가장 안정적)

Codex의 설정 디렉터리를 엽니다(없으면 생성합니다). 그리고 그 안에 두 파일을 추가/편집합니다:

<Tabs>
  <Tab title="🪟 Windows">
    설정 디렉터리: `%USERPROFILE%\.codex\`(즉, `C:\Users\YourName\.codex\`)입니다.

    파일 탐색기에서 엽니다.
  </Tab>

  <Tab title="Mac / Linux">
    설정 디렉터리: `~/.codex/`입니다.

    터미널에서 `mkdir -p ~/.codex`을 실행해 그 안으로 들어갑니다.
  </Tab>
</Tabs>

<Warning>
  **`config.toml`가 이미 존재하면 전체를 덮어쓰지 마십시오!** 이전 모델 기본 설정, 승인 정책, MCP 서버 등을 이미 포함하고 있을 수 있습니다. 올바른 방법은 **먼저 백업한 다음 병합하는 것**입니다(아래의 “기존 config.toml을 안전하게 편집하는 방법” 참조) — APIYI에 필요한 몇 줄만 추가하십시오. `auth.json`도 마찬가지입니다. 이미 있으면 `OPENAI_API_KEY` 값만 업데이트하십시오.
</Warning>

**1) `auth.json` — 키를 여기에 넣으십시오:**

```json theme={null}
{
  "OPENAI_API_KEY": "sk-your-APIYI-key"
}
```

**2) `config.toml` — 모델 제공자를 APIYI로 지정하십시오:**

새 파일인 경우 아래 내용을 붙여 넣으십시오. 기존 파일인 경우 “전역 키”를 **맨 위**에 추가하고, `[model_providers.apiyi]` 블록을 **맨 아래**에 덧붙이십시오(이유는 아래 팁 참조).

```toml theme={null}
# === Global (put at the very top of the file) ===
model = "gpt-5.4"                 # default model, change to gpt-5.5 etc. as needed
model_provider = "apiyi"          # use the apiyi provider defined below
preferred_auth_method = "apikey"  # authenticate with API Key (not chatgpt login)

# === APIYI provider definition (put at the very bottom) ===
[model_providers.apiyi]
name = "apiyi"
base_url = "https://api.apiyi.com/v1"
experimental_bearer_token = "sk-your-APIYI-key"
wire_api = "responses"
```

<Warning>
  저장하기 전에 `sk-your-APIYI-key`을 실제 키로 바꾸십시오(`api.apiyi.com/token`에서 복사한 `sk-` 문자열입니다). 키는 두 파일에서 일치해야 합니다.
</Warning>

<Accordion title="기존 config.toml을 안전하게 편집하는 방법(백업 + 병합 모범 사례)">
  **1단계: 먼저 백업하십시오.** 설정을 변경하기 전에 원본을 복사해 두면 언제든 복원할 수 있습니다:

  ```bash theme={null}
  # Mac / Linux
  cp ~/.codex/config.toml ~/.codex/config.toml.bak

  # Windows PowerShell
  Copy-Item $env:USERPROFILE\.codex\config.toml $env:USERPROFILE\.codex\config.toml.bak
  ```

  **2단계: 덮어쓰지 말고 병합하십시오.** APIYI에 필요한 내용만 기존 파일에 추가하십시오. `model` / `model_provider` / `preferred_auth_method` 줄은 **맨 위**에 두고, `[model_providers.apiyi]` 블록은 **맨 아래**에 덧붙이십시오. 나머지는 그대로 두십시오.

  <Warning>
    **TOML 순서 주의사항**: TOML에서는 모든 “bare key-value 쌍”(예: `model = "..."`)이 어떤 `[xxx]` 테이블 헤더보다 **앞에 와야 하며**, 그렇지 않으면 앞선 테이블에 흡수됩니다. 따라서 전역 키를 맨 위에, `[model_providers.apiyi]`를 맨 아래에 두는 구성이 가장 오류가 적습니다.
  </Warning>

  **3단계: 메인 설정을 건드리지 않고 테스트만 해보시겠습니까?** 프로필을 사용하십시오. 위 내용을 담은 `~/.codex/apiyi.config.toml`을 만들고 `codex --profile apiyi`를 실행하면 됩니다 — 완전히 분리됩니다([고급](#6-advanced-configuration) 참조).
</Accordion>

<Note>
  **필드 참고 사항**:

  * `base_url`: 항상 `https://api.apiyi.com/v1` — 반드시 `/v1`를 포함해야 하며, 그렇지 않으면 404가 발생합니다.
  * `experimental_bearer_token`: 키를 제공자 블록에 직접 넣고 Bearer token으로 전송합니다. **이 형식만 데스크톱 앱, IDE 확장, CLI 전반에서 안정적으로 동작합니다** — 환경 변수를 사용하지 않습니다.
  * 제공자의 인증 필드는 **상호 배타적입니다. 정확히 하나만 선택하십시오**: `experimental_bearer_token`(설정 파일에 키를 넣는 방식, 권장) / `env_key`(실행 프로세스의 환경 변수에서 키를 읽습니다. `auth.json`로는 대체되지 않으며, 데스크톱 앱은 터미널에서 내보낸 변수를 볼 수 없습니다) / `requires_openai_auth`(`auth.json`의 공식 로그인 상태를 재사용합니다). 이 가이드의 이전 버전에서 `env_key` + `requires_openai_auth`를 함께 사용했다면, 현재 형식으로 바꾸십시오.
  * `wire_api = "responses"`: Codex의 기본이자 권장 프로토콜이며, APIYI에서 지원합니다. 특정 모델이 404 / 알 수 없는 엔드포인트를 반환하면, 대체 수단으로 `"chat"`로 전환하십시오([고급](#6-advanced-configuration) 참조).
  * 이 파일에 `C:\Users\xxx\.codex\...` 같은 절대 경로를 하드코딩하지 마십시오. 여러 머신에서 작동하지 않습니다.
</Note>

### 옵션 2 · cc-switch 시각적 설정(GUI, 수동 편집 없음)

파일을 직접 편집하고 싶지 않다면 **CC Switch**를 사용하십시오. 몇 번의 클릭만으로 APIYI의 URL, 키, 모델을 Codex 설정에 써 넣는 GUI입니다. 또한 Claude Code, Codex, Gemini CLI 등을 한곳에서 관리하고, 원클릭 전환을 지원하며, 위의 백업/병합도 대신 처리해 줍니다. 초보자에게 좋은 첫 선택입니다.

[CC Switch 시각적 설정](/ko/scenarios/programming/cc-switch)을 참조하십시오. 설정하면 Codex의 데스크톱 앱 / 확장 / CLI가 모두 설정을 자동으로 적용합니다.

### 옵션 3 · 환경 변수(선택 사항, 번거로움, 권장하지 않음)

<Accordion title="터미널에서 빠르게 테스트해 보고 싶으십니까? 환경 변수 방식은 펼쳐서 확인하십시오(장기 사용용 아님)">
  Codex CLI는 `OPENAI_BASE_URL` / `OPENAI_API_KEY` 환경 변수도 읽을 수 있습니다:

  ```bash theme={null}
  export OPENAI_BASE_URL="https://api.apiyi.com/v1"
  export OPENAI_API_KEY="sk-your-APIYI-key"
  ```

  <Warning>
    **주된 방법으로는 권장하지 않습니다**: 환경 변수는 최근 Codex 빌드에서 적용되지 않는 경우가 많고, **데스크톱 앱 / IDE 확장은 이를 읽지 않습니다** — 오직 `config.toml` + `auth.json`만 인식합니다. 환경 변수는 빠른 CLI 테스트용으로만 괜찮으며, 장기 사용에는 옵션 1 또는 옵션 2를 권장합니다.
  </Warning>
</Accordion>

## 3. 각 인터페이스 사용 (데스크톱 우선)

`~/.codex/` 설정이 완료되면 아래의 아무 인터페이스나 선택합니다. **config를 변경한 뒤 프로그램을 다시 시작하십시오** (Codex는 시작할 때만 config를 읽습니다).

### 1. Codex 데스크톱 앱 (가장 권장됨)

1. Codex 데스크톱 앱을 설치하고 엽니다.
2. 첫 실행 시 인증 방식을 선택합니다: **apikey를 선택합니다** (chatgpt 로그인 아님).
3. 모델 / 제공자 선택기에서 `apiyi` 제공자와 대상 모델(예: `gpt-5.4`)을 선택합니다.
4. 적용하려면 **앱을 다시 시작합니다**.
5. 검증을 위해 최소 작업을 실행합니다([4절](#4-minimal-verification) 참조).

### 2. IDE 확장 (VSCode / Cursor)

1. 확장 마켓플레이스를 엽니다(VSCode에서는 `Ctrl+Shift+X` / `Cmd+Shift+X`를 누릅니다). `Codex — OpenAI's coding agent`를 검색한 다음 `Install`를 클릭합니다.
2. 설치 후 사이드바에 Codex 아이콘이 나타납니다 — 클릭하여 패널을 엽니다.
3. 처음 열 때 세 가지 프롬프트에 응답합니다: ① 인증 방식 — **apikey를 선택합니다**; ② 키 소스 — “설정 파일 / 환경 변수”를 선택합니다; ③ `AGENTS.md`를 활성화합니다(권장).
4. 적용하려면 **편집기를 다시 시작합니다**.
5. Codex 패널에서 최소 작업을 실행하여 검증합니다.

### 3. CLI

공식 CLI를 전역으로 설치합니다(Node.js 18+ 필요):

```bash theme={null}
npm install -g @openai/codex
codex --version
```

프로젝트로 이동해 실행하거나, 일회성 작업을 실행합니다:

```bash theme={null}
cd /your/project
codex                                  # interactive mode
codex "write a Python HTTP server"     # pass a task directly
codex -q "fix the build errors"        # non-interactive / silent mode
```

<Tip>
  전역 설치 권한 오류가 발생하는 Mac 사용자는 nvm / fnm을 사용해 Node를 관리하고 `sudo`를 피해야 합니다.
</Tip>

## 4. 최소 검증

설정 및 재시작 후, 아무 인터페이스에서나 최소 작업을 입력합니다:

```text theme={null}
Create a hello endpoint in this project and include a usage example.
```

CLI 사용자는 다음도 실행할 수 있습니다:

```bash theme={null}
codex -q "hello"
```

실행 가능한 코드를 반환하면 APIYI 연동이 정상 동작하는 것입니다.

## 5. 모델(APIYI 권장 사항)

`config.toml`의 `model` 필드에 설정하거나 런타임에 전환합니다:

| 모델                   | 특징                                   | 적합한 용도                                    |
| -------------------- | ------------------------------------ | ----------------------------------------- |
| **`gpt-5.6-sol`**    | 5.6 플래그십(2026년 7월 9일 출시)             | 가장 어려운 문제: 복잡한 코딩, 심층 엔지니어링 분석, 에이전트 워크플로 |
| **`gpt-5.6-terra`**  | 5.6 균형형 티어                           | 대량 비즈니스 작업, 성능과 비용의 균형                    |
| **`gpt-5.6-luna`**   | 5.6 빠르고 저비용인 티어                      | 요약, 초안 작성, 일상적인 자동화 — 빠르고 저렴함             |
| **`gpt-5.5`**        | 이전 세대 플래그십                           | 복잡한 코딩, 엔지니어링 분석, 에이전트 워크플로               |
| **`gpt-5.4`**        | 안정적인 주력 모델                           | 대부분의 코딩, 디버깅, 리팩터링(기본 선택)                 |
| **`gpt-5.4-mini`**   | 저렴한 5.4 변형                           | 중간 규모 작업, 배치 처리, 비용 절감                    |
| **`grok-4.5`**       | xAI 플래그십, **네이티브 responses 프로토콜 지원** | 코딩 에이전트, 복잡한 작업 — OpenAI 계열을 제외하면 최우선 선택  |
| **`grok-build-0.1`** | Grok의 코드 중심 모델, 시리즈에서 가장 저렴한 가격      | 고빈도 코드 완성, 가벼운 코딩 작업                      |

<Tip>
  **선택 방법**: 일상용 → `gpt-5.4` 또는 `gpt-5.6-terra`; 고부하 작업 / 에이전트 → `gpt-5.6-sol`(또는 `gpt-5.5`); 비용 절감 → `gpt-5.6-luna` / `gpt-5.4-mini`; OpenAI 외에서 색다른 선택 → `grok-4.5`.
</Tip>

<Note>
  **Grok이 특별히 언급되는 이유**: xAI의 공식 API는 OpenAI 호환 이중 엔드포인트 API(Chat Completions + Responses API) 자체이며, 이는 Grok를 **네이티브 `/v1/responses` 프로토콜 지원을 갖춘 드문 비OpenAI 모델**로 만듭니다 — Codex에서는 `wire_api = "responses"`를 그대로 유지하고 `model`만 `grok-4.5`로 전환하면 됩니다. Codex의 에이전트 기능(도구 호출, 추론 항목 등)은 모두 네이티브 프로토콜 위에서 동작합니다. responses 엔드포인트는 APIYI에서 `grok-4.5`로 검증되었으며, 다른 Grok 모델도 동일한 아키텍처를 공유하므로 동일하게 동작할 것으로 예상됩니다 — 하나가 404를 반환하면 [섹션 6](#6-advanced-configuration)의 대체 방법을 사용하십시오. [Grok API 가이드](/ko/api-capabilities/grok/overview)를 참조하십시오.

  **Claude / Gemini와 비교**: APIYI에서 이 둘은 **OpenAI 호환 채팅 모드에서만 실행되며 responses 엔드포인트는 없습니다** — 따라서 Codex에서는 `wire_api = "chat"`로 폴백해야 합니다. Codex의 에이전트 시나리오는 responses 프로토콜을 중심으로 설계되므로, 채팅 모드에서는 도구 호출에서 비호환성이 나타나고 경험이 저하될 수 있습니다. Claude / Gemini로 코딩할 때는 대신 해당 기본 도구를 사용하십시오([Claude Code](/ko/scenarios/programming/claude-code) / [Gemini CLI](/ko/scenarios/programming/gemini-cli)).
</Note>

<Note>
  **다른 OpenAI 호환 모델도 동작합니다**: APIYI는 많은 모델을 통합하며, OpenAI 호환 호출을 지원하는 모든 모델은 Codex에서 동작합니다 — 예를 들어 Zhipu의 `glm-5.2`가 그렇습니다. 대상 모델 ID에 맞게 `config.toml`의 `model` 필드(또는 런타임의 `-m`)만 변경하면 됩니다.
</Note>

### 모델을 전환하는 4가지 방법

**① 시작 시 지정** (CLI):

```bash theme={null}
codex -m gpt-5.5
codex --model gpt-5.4 "review this project's structure"
```

**② 비대화형 모드에서 지정** (CLI):

```bash theme={null}
codex -q -m gpt-5.4 "fix the build errors in this project"
```

**③ 세션 안에서 전환**: 대화형 패널에서 `/model`을 입력하고 안내를 따르십시오.

**④ 기본 모델 구성(영구)**: `~/.codex/config.toml`를 편집하고, `model`를 변경한 뒤 저장하고 다시 시작하십시오:

```toml theme={null}
model = "gpt-5.5"
```

## 6. 고급 설정

<AccordionGroup>
  <Accordion title="사용자 지정 시스템 프롬프트 (instructions.md)">
    코딩 스타일, 출력 언어, 프로젝트 규칙을 정의하려면 `~/.codex/instructions.md`를 편집합니다. 예:

    ```markdown theme={null}
    - Write code comments in English
    - Follow the project's ESLint config
    - Provide detailed explanations
    ```
  </Accordion>

  <Accordion title="프로젝트 수준 AGENTS.md">
    프로젝트에서 `codex /init`를 실행하여 구조와 규칙을 기록하는 `AGENTS.md`을 생성합니다. Codex가 기본적으로 특정 언어로 응답하도록 하려면 다음을 추가합니다:

    ```markdown theme={null}
    Always respond to the user in English for this project.
    ```
  </Accordion>

  <Accordion title="프로토콜 폴백: wire_api를 chat으로 전환">
    `wire_api = "responses"`은 Codex의 기본이자 선호 프로토콜이며, 대부분의 모델은 바로 동작합니다. 모델이 404 / 알 수 없는 엔드포인트를 반환하면 해당 제공업체의 `wire_api`을 `"chat"`로 변경한 뒤 다시 시도합니다(`/chat/completions` 사용).
  </Accordion>

  <Accordion title="여러 설정(프로필)">
    `~/.codex/` 아래에 `<name>.config.toml`를 생성합니다(예: 공식 설정의 경우 `openai.config.toml`). 그런 다음 런타임에서 `codex --profile <name>`으로 전환합니다. APIYI와 다른 제공업체 사이를 오갈 때 유용합니다.
  </Accordion>

  <Accordion title="공통 플래그">
    ```bash theme={null}
    codex -h          # full help
    codex -m <model>  # specify model
    codex -q          # non-interactive / silent mode
    codex --full-auto # auto-execute (use cautiously)
    ```
  </Accordion>
</AccordionGroup>

## 7. 문제 해결

<AccordionGroup>
  <Accordion title="1. 환경 변수 누락: OPENAI_API_KEY (데스크톱 앱 / 확장 프로그램에서 가장 흔함)">
    `auth.json` + `config.toml`를 올바르게 입력하고 앱을 다시 시작했는데도 여전히 `Missing environment variable: OPENAI_API_KEY`가 표시된다면, 원인은 provider 블록 안의 `env_key = "OPENAI_API_KEY"`입니다(이 가이드의 이전 버전에서 사용하던 형식입니다).

    `env_key`는 **Codex를 실행한 프로세스의 환경 변수에서 Key를 읽어온다**는 뜻이며, `auth.json`로는 **대체되지 않습니다**(`auth.json`는 OpenAI의 공식 로그인 상태만 제공합니다). 또한 데스크톱 앱 / IDE를 Dock 또는 런처에서 실행하면 터미널에서 내보낸 변수를 **상속하지 않습니다**(`export` in `.zshrc`는 GUI 앱에 영향이 없습니다). 따라서 아무리 재시작해도 변수가 나타나지 않습니다.

    **수정 방법(권장)**: `~/.codex/config.toml`을 편집하고 provider 블록에서 `env_key`를 제거한 뒤(있다면 `requires_openai_auth`도 제거), Key를 config에 직접 넣으십시오.

    ```toml theme={null}
    [model_providers.apiyi]
    name = "apiyi"
    base_url = "https://api.apiyi.com/v1"
    experimental_bearer_token = "sk-your-APIYI-key"
    wire_api = "responses"
    ```

    그런 다음 앱을 **재시작**하십시오.

    **대안**(`env_key`을 꼭 사용해야 한다면): 변수를 시스템 전체에 설정하십시오. macOS에서는 `launchctl setenv OPENAI_API_KEY "sk-your-key"`를 실행한 뒤 앱을 다시 시작하십시오(재부팅 후에는 다시 실행해야 합니다). Windows에서는 `setx OPENAI_API_KEY "sk-your-key"`를 실행한 뒤 앱을 다시 시작하십시오. CLI 전용 사용이라면 셸 프로필에 `export`를 넣는 것만으로 충분합니다.
  </Accordion>

  <Accordion title="2. auth.json / config.toml 경로와 내용을 확인하십시오">
    * `auth.json`는 유효한 JSON이어야 하며, `OPENAI_API_KEY`가 실제 `sk-` Key로 설정되어 있어야 합니다.
    * `config.toml`는 유효한 TOML로 파싱되어야 합니다(따옴표와 들여쓰기에 주의하십시오).
    * 경로: Windows `%USERPROFILE%\.codex\`, Mac/Linux `~/.codex/`.
  </Accordion>

  <Accordion title="3. Key가 유효하고 사용 가능한 크레딧이 있는지 확인하십시오">
    APIYI 콘솔에서 Key가 만료되지 않았고 계정에 잔액 / 쿼터가 있는지 확인하십시오.
  </Accordion>

  <Accordion title="4. base_url에 /v1이 포함되어 있는지 확인하십시오">
    가장 흔한 연결 오류 / 타임아웃 / 404는 `/v1`가 빠져 있어서 발생합니다. 올바른 예: `https://api.apiyi.com/v1`. 그런 다음 로컬 프록시와 DNS를 확인하십시오.
  </Accordion>

  <Accordion title="5. config를 변경할 때마다 다시 시작하십시오">
    Codex(CLI / 확장 프로그램 / 데스크톱 앱)는 시작할 때만 config를 읽습니다. **`auth.json` / `config.toml`를 편집한 후에는 항상 프로그램을 재시작하십시오.**
  </Accordion>

  <Accordion title="6. 여전히 불안정하면: wire_api를 chat으로 전환하십시오">
    특정 모델이 `responses` 프로토콜과 호환되지 않으면 해당 공급자의 `wire_api`를 `"chat"`로 변경한 뒤 다시 시도하십시오.
  </Accordion>
</AccordionGroup>

## 8. 자주 묻는 질문

<AccordionGroup>
  <Accordion title="Codex는 왜 APIYI와 작동합니까?">
    APIYI는 **OpenAI API 프로토콜과 완전히 호환**되기 때문입니다. `https://api.apiyi.com/v1`와 `https://api.openai.com/v1`는 요청/응답 형식에서 서로 호환됩니다. Base URL만 바꾸면 충분합니다.
  </Accordion>

  <Accordion title="간단한 hello가 왜 수만 개의 입력 token을 소모합니까?">
    이는 대개 **예상된 동작**입니다. 시작 시 Codex가 **현재 프로젝트의 일부 파일을 읽어 초기화**하며(디렉터리 구조, `AGENTS.md`, 관련 소스), 이를 prompt와 함께 컨텍스트로 전송합니다. 따라서 한 단어짜리 `hello`도 수천 개의 입력 token을 소모할 수 있습니다.

    **어떻게 줄입니까?**

    * 최소 작업은 **빈 디렉터리**나 **아주 작은 프로젝트**에서 테스트하여 컨텍스트가 작게 유지되도록 합니다.
    * 구체적인 작은 작업을 주고 **정확한 파일을 지정**합니다(예: "`app.py`만 보고 hello 엔드포인트를 추가해 주세요")하여 Codex가 스캔하는 범위를 제한합니다.
    * 이런 일회성 확인에는 더 저렴한 모델(예: `gpt-5.4-mini`)을 사용합니다.
  </Accordion>

  <Accordion title="`command not found: codex`">
    설치 확인:

    ```bash theme={null}
    npm install -g @openai/codex
    codex --version
    ```

    여전히 실패하면 `npm bin -g`이 `PATH`에 있는지 확인합니다.
  </Accordion>

  <Accordion title="잘못된 API Key (401 / 잘못된 Key)">
    1. OpenAI key가 아니라 **APIYI Key**(`sk-`로 시작)를 사용하고 있는지 확인합니다.
    2. `auth.json`의 Key가 공백 없이 올바른지 확인합니다.
    3. 설정을 변경한 후 **다시 시작**합니다.
  </Accordion>

  <Accordion title="연결 오류 / 시간 초과 / 404">
    가장 흔한 원인: **Base URL에 `/v1`이 없습니다**. 올바른 값: `https://api.apiyi.com/v1`입니다. 그런 다음 로컬 프록시와 DNS를 확인합니다.
  </Accordion>

  <Accordion title="어떤 모델이 지원됩니까?">
    * **OpenAI 시리즈**: ✅ 완전 지원(권장 `gpt-5.6-sol` / `gpt-5.6-terra` / `gpt-5.6-luna` / `gpt-5.5` / `gpt-5.4`).
    * **Grok 시리즈**: ✅ 네이티브 responses 프로토콜 지원 — `grok-4.5`는 `wire_api`를 건드리지 않고 작동합니다; [Grok API Guide](/ko/api-capabilities/grok/overview)를 참조하십시오.
    * **기타 OpenAI 호환 모델**: APIYI에서 지원합니다. 예: `glm-5.2` — `model` 필드만 바꾸면 됩니다.
    * 참고: **APIYI의 Claude / Gemini는 OpenAI 호환 채팅 모드만 제공하며 responses 엔드포인트는 없습니다** — 따라서 Codex에서는 `wire_api`를 `"chat"`로 전환해야 하며, tool calling 같은 에이전트 동작은 호환성 문제를 겪을 수 있습니다. Claude / Gemini 기반 코딩에는 각자의 네이티브 도구(예: Claude Code / Gemini CLI)를 사용하십시오.
  </Accordion>

  <Accordion title="데스크톱 앱 / 확장 프로그램이 작동하지 않습니까?">
    데스크톱 앱과 IDE 확장 프로그램은 **`~/.codex/config.toml` + `auth.json`만 읽고 환경 변수는 읽지 않습니다**. 이 두 파일이 올바른지, 인증 방식이 **apikey**로 설정되어 있는지 확인한 다음 **다시 시작**합니다.
  </Accordion>

  <Accordion title="프로덕션에 적합합니까?">
    * **CLI / 앱**: 개발 시 생산성 향상에 가장 적합합니다.
    * **프로덕션**: 직접 API 호출을 선호합니다(더 많은 제어, 모니터링, 점진적 롤아웃).
  </Accordion>

  <Accordion title="APIYI 설정을 어떻게 제거하거나 비활성화합니까?">
    **CLI를 제거합니다**:

    ```bash theme={null}
    npm uninstall -g @openai/codex
    ```

    **APIYI 설정 비활성화**: `~/.codex/config.toml`과 `auth.json`를 삭제하거나 복원합니다(데스크톱 앱 / extension은 각자 UI에서 관리합니다).
  </Accordion>
</AccordionGroup>

## 9. 요약

전체 통합은 한 문장입니다:

> **OpenAI의 엔드포인트를 APIYI로 바꾸십시오**

핵심은 `~/.codex/`을 한 번만 설정하는 것입니다: Key를 `auth.json`에 넣고, `config.toml`에서 `base_url`를 `https://api.apiyi.com/v1`로 지정합니다. 그러면 **데스크톱 앱, IDE 확장, CLI가 모두 작동합니다**. 그 밖의 모든 것 — 모델 선택, prompt, `instructions.md`, `AGENTS.md` — 은 단지 다듬기입니다.

## 관련 리소스

<CardGroup cols={2}>
  <Card title="APIYI 콘솔" icon="settings" href="https://api.apiyi.com">
    API 키를 관리하고 사용량을 확인합니다
  </Card>

  <Card title="CC 스위치 비주얼 구성" icon="toggle-left" href="/ko/scenarios/programming/cc-switch">
    Codex / Claude Code용 GUI 원클릭 설정
  </Card>

  <Card title="Claude Code 통합" icon="bot" href="/ko/scenarios/programming/claude-code">
    CLI 코딩에 Claude 모델을 사용합니다
  </Card>

  <Card title="모델 비교" icon="chart-bar" href="/ko/api-capabilities/model-info">
    사용 가능한 모든 모델과 가격
  </Card>
</CardGroup>
