> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Hermes 에이전트

> Nous Research의 자체 개선 AI 에이전트로, 내장 학습 루프와 멀티플랫폼 게이트웨이를 갖추고 있으며, APIYI를 통해 어떤 LLM에도 연결할 수 있습니다

## 개요

Hermes Agent는 Nous Research가 만든 오픈소스 AI 에이전트로, “여러분과 함께 성장하는 에이전트”로 자리매김합니다. 이 에이전트는 내장된 **학습 루프**를 갖춘 몇 안 되는 에이전트 중 하나로, 경험에서 스킬을 자율적으로 만들고, 사용 중에 이를 개선하며, 스스로 지식을 유지하도록 유도하고, FTS5 전문 텍스트 인덱스를 통해 과거 대화를 자체 검색하며, 세션 전반에 걸쳐 점점 더 깊어지는 사용자 모델을 유지합니다. Hermes는 꼭 노트북에서만 실행할 필요가 없습니다. \$5 VPS, GPU 클러스터, 또는 유휴 상태일 때 거의 비용이 들지 않는 서버리스 인프라에서도 동일하게 잘 실행됩니다.

APIYI를 통합하면 다음을 얻을 수 있습니다:

<CardGroup cols={2}>
  <Card title="🧠 자기 개선 루프" icon="brain">
    자율적인 스킬 생성 + 개선, 세션 간 장기 메모리
  </Card>

  <Card title="📱 다중 플랫폼 게이트웨이" icon="message-circle">
    Telegram / Discord / Slack / WhatsApp / Signal / Email / CLI
  </Card>

  <Card title="⏰ Cron 스케줄링" icon="clock">
    내장 스케줄러가 어떤 플랫폼이든 통해 보고서/감사를 전달합니다
  </Card>

  <Card title="☁️ 어디서나 실행" icon="cloud">
    7개 터미널 백엔드 — 로컬 / Docker / SSH / Modal / Daytona / Vercel Sandbox
  </Card>
</CardGroup>

<Info>
  **프로젝트 정보**: Hermes Agent는 MIT 라이선스의 오픈소스입니다. 저장소: `github.com/NousResearch/hermes-agent`. 문서: `hermes-agent.nousresearch.com/docs/`.
</Info>

## 설치

### Linux / macOS / WSL2 / Termux

```bash theme={null}
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

### Windows (PowerShell, native용 초기 베타)

```powershell theme={null}
iex (irm https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.ps1)
```

설치 프로그램은 `uv`, Python 3.11, Node.js, `ripgrep`, `ffmpeg`, 그리고 휴대용 Git Bash를 자동으로 처리합니다.

설치가 완료되면 셸을 다시 불러온 다음 시작합니다:

```bash theme={null}
source ~/.bashrc    # or source ~/.zshrc
hermes              # Launches the TUI, ready to chat
```

## APIYI에 연결

Hermes에는 `hermes model` 명령이 포함되어 있으며, Nous Portal / OpenRouter / OpenAI / 사용자 지정 엔드포인트를 지원합니다. APIYI는 **OpenAI 호환 API**를 제공하므로, 이를 “사용자 지정 OpenAI 엔드포인트”로 연결하면 APIYI의 전체 모델 매트릭스를 한 번에 사용할 수 있습니다.

### 옵션 1: `hermes model`을 통해 설정 (권장)

```bash theme={null}
hermes model        # Enter the model selection wizard
```

설정 마법사는 다음 항목을 묻습니다:

| 단계         | 입력                                                                                      |
| ---------- | --------------------------------------------------------------------------------------- |
| 제공자        | `OpenAI`(또는 `Custom OpenAI endpoint`) 선택                                                |
| API 기본 URL | `https://api.apiyi.com/v1`                                                              |
| API Key    | APIYI key (`sk-...`)                                                                    |
| 모델         | 원하는 모델 ID, 예: `gpt-5.4`, `claude-sonnet-4-6`, `deepseek-v3.2`, `gemini-3.1-pro-preview` |

### 옵션 2: `hermes config set`을 통해 설정

```bash theme={null}
hermes config set llm.provider openai
hermes config set llm.base_url https://api.apiyi.com/v1
hermes config set llm.api_key sk-your-apiyi-key
hermes config set llm.model gpt-5.4
```

그다음 연결을 확인하려면 `hermes`를 한 번 실행하십시오.

### 옵션 3: 환경 변수 (Docker / 서버리스에 가장 적합)

```bash theme={null}
export OPENAI_API_BASE=https://api.apiyi.com/v1
export OPENAI_API_KEY=sk-your-apiyi-key
export HERMES_MODEL=gpt-5.4
hermes
```

`hermes model`를 통해 언제든 모델을 전환하거나 `HERMES_MODEL`를 업데이트하면 됩니다. — **코드 변경은 필요 없습니다**.

### 옵션 4: Anthropic 네이티브 프로토콜 (Claude 중심 워크로드에 가장 적합)

Hermes는 Anthropic을 **최상위 공급자**로 취급합니다. 내부적으로 이 와이어 프로토콜은 `anthropic_messages`라고 불리며, OpenAI 호환 경로에서는 제공되지 않는 혜택이 포함됩니다:

<Info>
  **Claude에 대해 네이티브 Anthropic 경로가 더 나은 이유**: 네이티브 Anthropic, OpenRouter, 그리고 Nous Portal 제공자에 대해 Hermes는 system prompt, skill blocks, 그리고 긴 context의 초반 부분에 1시간 TTL이 적용된 `cache_control` 중단점을 자동으로 추가합니다. 이후 세션 간 전송과 분기된 서브에이전트는 할인된 cached-read 요율로 cache를 재사용합니다. **이 최적화는 OpenAI 호환 경로에서는 적용되지 않습니다.**
</Info>

CLI 설정:

```bash theme={null}
hermes config set llm.provider anthropic
hermes config set llm.base_url https://api.apiyi.com
hermes config set llm.api_key sk-your-apiyi-key
hermes config set llm.model claude-sonnet-4-6
```

동등한 환경 변수 설정:

```bash theme={null}
export ANTHROPIC_BASE_URL=https://api.apiyi.com
export ANTHROPIC_API_KEY=sk-your-apiyi-key
export HERMES_MODEL=claude-sonnet-4-6
hermes
```

<Warning>
  **`/v1`를 `base_url`에 포함하지 마십시오** — 반드시 `https://api.apiyi.com`여야 합니다. Anthropic 프로토콜은 `/v1/messages`을 자동으로 덧붙입니다. `/v1`을 직접 포함하면 `.../v1/v1/messages`이 발생하고 404가 반환됩니다.
</Warning>

Hermes는 URL에서 와이어 프로토콜을 자동 감지합니다(`/anthropic`로 끝나는 경로는 `anthropic_messages`로 라우팅됩니다). LiteLLM 프록시 같은 비표준 엔드포인트의 경우 모드를 명시적으로 설정하십시오:

```bash theme={null}
hermes config set llm.api_mode anthropic_messages
```

**보너스**: `api.apiyi.com/token`에서 token을 생성할 때 **`ClaudeCode` 그룹**을 선택하면 자동으로 5% 할인을 받을 수 있으며, 10%-20% 충전 보너스와 중복 적용됩니다.

<Tip>
  **왜 APIYI인가요?**

  * **하나의 키, 여러 모델**: OpenAI / Anthropic / Google / DeepSeek / Zhipu / Kimi 등
  * **가격 우위**: 보통 공식 가격 대비 5%-20% 할인, 일부 모델에는 충전 보너스 제공
  * **중국에서 직접 접속**: VPN 없이 해외 LLM에 접근 가능
  * **이중 프로토콜 호환성**: OpenAI-wire와 Anthropic-wire 엔드포인트를 모두 지원합니다. Claude를 많이 사용하는 사용자는 네이티브 Anthropic 경로를 사용할 때 1시간 세션 간 cache 할인 혜택을 받습니다.
</Tip>

## 기능 요약표

<CardGroup cols={2}>
  <Card title="터미널 UI" icon="terminal">
    전체 TUI: 다중 줄 편집, 슬래시 명령 자동 완성, 대화 기록, 도구 출력 스트리밍
  </Card>

  <Card title="메시징 게이트웨이" icon="bot">
    `hermes gateway setup`을 실행하여 봇 token을 바인딩하고 어떤 IM 플랫폼에서든 채팅합니다
  </Card>

  <Card title="스킬 시스템" icon="puzzle">
    절차적 메모리 + 스킬 허브 (`agentskills.io`) — 사용할수록 더 똑똑해집니다
  </Card>

  <Card title="MCP 통합" icon="plug">
    커뮤니티 리눅스 데스크톱 제어 MCP를 포함한 모든 MCP 서버를 연결합니다
  </Card>

  <Card title="예약 작업" icon="clock">
    내장 cron — “매일 오전 9시에 일일 보고서를 보내줘” 같은 자연어를 지원합니다
  </Card>

  <Card title="서브에이전트" icon="users">
    병렬 작업을 위해 격리된 서브에이전트를 생성합니다. Python 스크립트에서 RPC를 통해 tools를 호출합니다
  </Card>
</CardGroup>

## OpenClaw에서 마이그레이션

OpenClaw에서 오시는 경우 Hermes에는 내장 마이그레이션 도구가 있습니다:

```bash theme={null}
hermes claw migrate              # Interactive full migration
hermes claw migrate --dry-run    # Preview what would be migrated
hermes claw migrate --preset user-data   # User data only, no secrets
hermes claw migrate --overwrite  # Overwrite conflicts
```

`SOUL.md`, 메모리(`MEMORY.md` / `USER.md`), 사용자가 생성한 스킬, 명령 허용 목록, 메시징 플랫폼 구성, API 키(Telegram / OpenRouter / OpenAI / Anthropic / ElevenLabs), TTS 자산, 그리고 워크스페이스 지침을 가져옵니다.

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="Hermes 에이전트는 OpenClaw 및 FastClaw와 어떻게 다릅니까?">
    * **Hermes Agent**: Nous Research의 Python 구현입니다 — **자기 개선 루프**와 스킬 진화, 세션 간 메모리에 중점을 두며, 연구에 적합합니다(궤적 생성 지원)
    * **OpenClaw**: Node.js 구현입니다 — 로컬 프라이버시 + 여러 IM 플랫폼 간 상호작용에 중점을 둡니다
    * **FastClaw**: Go 단일 바이너리입니다 — 대시보드 형태의 멀티 에이전트 관리에 중점을 둡니다

    세 가지 모두 APIYI의 전체 모델 매트릭스에 접근할 수 있습니다. 사용 사례에 맞는 것을 선택하시면 됩니다.
  </Accordion>

  <Accordion title="APIYI의 전체 모델 라인업을 지원합니까?">
    예. Hermes는 **OpenAI 호환** 및 **Anthropic 네이티브** 프로토콜을 모두 지원합니다:

    * OpenAI 엔드포인트: `https://api.apiyi.com/v1` — 전체 모델 매트릭스
    * Anthropic 엔드포인트: `https://api.apiyi.com` (`/v1` 없음) — Claude 계열

    APIYI의 문서에서 모델 ID를 그대로 사용하십시오(예: `gpt-5.4`, `claude-sonnet-4-6`, `deepseek-v3.2`, `gemini-3.1-pro-preview`). Claude 중심 사용자라면 Hermes의 1시간 세션 간 프롬프트 캐시를 활용하기 위해 Anthropic 네이티브 경로를 사용하셔야 합니다.
  </Accordion>

  <Accordion title="크로스 플랫폼 메시징은 어떻게 동작합니까?">
    Hermes는 Telegram / Discord / Slack / WhatsApp / Signal 전반의 봇 연결을 관리하는 **단일 게이트웨이 프로세스**를 실행합니다. `hermes gateway setup`은 token을 붙여넣는 방법을 안내하고, `hermes gateway start`는 모든 플랫폼의 메시지를 동일한 에이전트 인스턴스로 라우팅합니다 — **대화는 플랫폼 간에 계속 이어지므로**, Discord에서 Telegram 스레드를 이어서 진행할 수 있습니다.

    음성 메모 전사를 포함하며, cron 전달도 같은 게이트웨이를 통해 흐릅니다.
  </Accordion>

  <Accordion title="클라우드에서 실행할 수 있습니까?">
    예 — Hermes는 이를 위해 설계되었습니다. 7가지 터미널 백엔드를 제공합니다:

    * **Local / Docker / SSH / Singularity**: 기존 배포 방식
    * **Modal / Daytona**: 서버리스 지속성 — 유휴 상태에서는 최대 절전하고, 요청 시 깨어나며, 세션 사이 비용이 거의 없습니다
    * **Vercel Sandbox**: 엣지 런타임

    \$5 VPS만으로도 24시간 365일 가동할 수 있습니다. Telegram으로 휴대폰에서 클라우드 VM으로 작업을 보내는 기능은 별도 설정 없이 바로 동작합니다.
  </Accordion>
</AccordionGroup>

## 관련 자료

<CardGroup cols={2}>
  <Card title="프로젝트 저장소" icon="github">
    `github.com/NousResearch/hermes-agent`
  </Card>

  <Card title="공식 문서" icon="book">
    `hermes-agent.nousresearch.com/docs/`
  </Card>

  <Card title="OpenClaw 대안" icon="bot" href="/ko/scenarios/agent/openclaw/overview">
    로컬 프라이버시 + IM 상호작용 사용 사례용입니다
  </Card>

  <Card title="FastClaw 대안" icon="bolt" href="/ko/scenarios/agent/fastclaw">
    멀티 에이전트 팩토리 + 대시보드 사용 사례용입니다
  </Card>
</CardGroup>
