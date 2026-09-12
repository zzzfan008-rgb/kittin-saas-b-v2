> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# FastClaw

> 단일 바이너리와 대시보드를 갖춘 경량 Go 기반 멀티 에이전트 런타임으로, APIYI를 통해 주요 LLM을 플러그인처럼 연결할 수 있습니다

## 개요

FastClaw는 Go로 작성된 경량 AI Agent 런타임으로, “에이전트 팩토리”로 자리매김합니다. 즉, 각기 고유한 성격(SOUL.md), 메모리, 스킬, 도구를 가진 여러 AI agent를 생성, 관리, 실행합니다. FastClaw는 LLM 통신, 도구 실행, 샌드박스 격리, 세션 관리를 기본 제공하며, 단일 바이너리로 배포되고 내장 Web 대시보드를 갖추고 있습니다.

APIYI를 통합하면 다음과 같은 이점을 얻습니다:

<CardGroup cols={2}>
  <Card title="🚀 단일 바이너리 배포" icon="rocket">
    한 줄 설치, 번들된 SQLite, 로컬 또는 클라우드에서 실행
  </Card>

  <Card title="🤖 다중 Agent 관리" icon="users">
    각 agent는 고유한 성격, 모델, 스킬, 세션을 가집니다
  </Card>

  <Card title="📱 다중 채널 IM" icon="message-circle">
    내장된 Telegram / Discord / Slack 채널 바인딩
  </Card>

  <Card title="🛡️ 샌드박스 격리" icon="shield">
    안전한 도구 실행을 위한 Docker / E2B 샌드박스 지원
  </Card>
</CardGroup>

<Info>
  **프로젝트 정보**: FastClaw는 FastClaw Community License(Apache 2.0 + 추가 조항) 아래에서 소스 공개됩니다. 저장소: `github.com/fastclaw-ai/fastclaw`.
</Info>

## 설치 및 시작

공식 원라인으로 FastClaw를 설치합니다 — `~/.local/bin`에 단일 바이너리를 배치합니다:

```bash theme={null}
curl -fsSL https://raw.githubusercontent.com/fastclaw-ai/fastclaw/main/install.sh | bash
```

첫 실행 시 설정 마법사가 시작됩니다. LLM 제공자를 설정하면 기본 에이전트가 자동으로 생성됩니다:

```bash theme={null}
fastclaw                    # Foreground (Ctrl+C to stop)
fastclaw daemon start       # Background (logs at ~/.fastclaw/daemon.log)
fastclaw daemon install     # Register as a launchd / systemd service
```

그다음 `http://localhost:18953`에서 대시보드를 엽니다(기본 포트 `18953`).

## APIYI에 연결하기(권장)

APIYI는 OpenAI 및 Anthropic API 프로토콜과 모두 호환됩니다. FastClaw는 **OpenAI 호환 프로바이더** 또는 **Anthropic 호환 프로바이더** 중 어느 쪽이든 사용할 수 있으며 — 단일 APIYI 키로 동일한 전체 모델 매트릭스에 도달할 수 있습니다.

### 옵션 1: 대시보드로 설정하기(권장)

1. `http://localhost:18953`을 열고 첫 실행 시 생성된 관리자 계정으로 로그인합니다
2. **모델 / 프로바이더**로 이동하여 새 프로바이더 항목을 추가합니다:

| 항목       | 권장 값                                                                                       |
| -------- | ------------------------------------------------------------------------------------------ |
| 프로바이더 유형 | `OpenAI` 호환                                                                                |
| 기본 URL   | `https://api.apiyi.com/v1`                                                                 |
| API Key  | APIYI 키(`sk-...`)                                                                          |
| 모델       | 필요에 따라 추가합니다. 예: `gpt-5.4`, `claude-sonnet-4-6`, `deepseek-v3.2`, `gemini-3.1-pro-preview` |

3. 에이전트의 **모델** 패널로 이동하여 기본 모델로 설정합니다

### 옵션 2: CLI로 설정하기

```bash theme={null}
# 1. Create a new agent, initially bound to APIYI (OpenAI-compatible)
fastclaw agents init alpha \
  --provider openai \
  --model openai/gpt-5.4 \
  --api-key-env APIYI_API_KEY

# 2. Point the OpenAI provider's Base URL at APIYI
fastclaw agents config alpha set provider.openai.apiBase https://api.apiyi.com/v1
fastclaw agents config alpha set provider.openai.apiKeyEnv APIYI_API_KEY

# 3. Add the models you want (append, idempotent)
fastclaw agents config alpha set provider.openai.model gpt-5.4
fastclaw agents config alpha set provider.openai.model claude-sonnet-4-6
fastclaw agents config alpha set provider.openai.model deepseek-v3.2
```

`APIYI_API_KEY` 환경 변수는 먼저 셸에 내보내야 합니다(`export APIYI_API_KEY=sk-...`) — FastClaw는 데이터베이스에 키를 평문으로 저장하지 않습니다.

<Tip>
  **왜 APIYI인가?**

  * **하나의 키, 많은 모델**: OpenAI / Anthropic / Google / DeepSeek / Zhipu 등 — 각 프로바이더를 따로 신청할 필요가 없습니다
  * **가격 우위**: 보통 공식 과금보다 5%-20% 저렴하며, 일부 모델에는 충전 보너스가 있습니다
  * **중국 내 직접 접속**: VPN 없이 해외 LLM에 접근할 수 있습니다
  * **이중 프로토콜 호환성**: FastClaw의 두 프로바이더 유형을 모두 지원합니다
</Tip>

### 옵션 3: Anthropic 네이티브 프로토콜(Claude 중심 워크로드에 가장 적합)

주로 Claude 모델을 사용한다면 Anthropic 프로바이더를 APIYI로 직접 지정합니다:

| 항목       | 권장 값                                     |
| -------- | ---------------------------------------- |
| 프로바이더 유형 | `Anthropic`                              |
| 기본 URL   | `https://api.apiyi.com`                  |
| API Key  | APIYI 키                                  |
| 모델       | `claude-sonnet-4-6`, `claude-opus-4-7` 등 |

동등한 CLI:

```bash theme={null}
fastclaw agents config alpha set provider.anthropic.apiBase https://api.apiyi.com
fastclaw agents config alpha set provider.anthropic.apiKeyEnv APIYI_API_KEY
fastclaw agents config alpha set provider.anthropic.model claude-sonnet-4-6
fastclaw agents config alpha set model claude-sonnet-4-6
```

## 기능 요약표

<CardGroup cols={2}>
  <Card title="에이전트 관리" icon="bot">
    대시보드 → 에이전트: 에이전트를 생성 / 편집하고, SOUL.md(성격), IDENTITY.md, MEMORY.md(장기 메모리)를 정의합니다.
  </Card>

  <Card title="스킬" icon="puzzle">
    기본 제공: code-runner, image-gen, data-analysis, web-search, skill-creator. ClawHub / GitHub에서 더 설치할 수 있습니다.
  </Card>

  <Card title="IM 채널 바인딩" icon="message-circle">
    에이전트 → 채널: Telegram / Discord / Slack 봇 token을 붙여 넣으면 저장 시 자동으로 검증됩니다.
  </Card>

  <Card title="OpenAI 호환 API" icon="code">
    `/v1/chat/completions` streaming 엔드포인트는 별도 설정 없이 모든 OpenAI SDK와 함께 작동합니다.
  </Card>

  <Card title="샌드박스 실행" icon="shield">
    Docker / E2B 샌드박스를 전환하려면 설정 → 런타임을 사용하며, tools 호출 후 아티팩트가 자동으로 동기화됩니다.
  </Card>

  <Card title="스케줄러" icon="clock">
    에이전트 → 스케줄러: 에이전트가 `create_cron_job`을 통해 cron 기반 리마인더를 만들 수 있게 합니다.
  </Card>
</CardGroup>

## 배포 모드

| 모드             | 사용 사례        | 주요 설정                                          |
| -------------- | ------------ | ---------------------------------------------- |
| **Local**      | 개인용          | `fastclaw daemon start`, 기본 SQLite 저장소         |
| **Docker**     | 단일 호스트 서비스   | `cd deploy/docker && ./start.sh`               |
| **Kubernetes** | 다중 복제본 운영 환경 | `FASTCLAW_STORAGE_TYPE=postgres` + S3 오브젝트 스토어 |

다중 복제본 배포에는 다음이 필요합니다:

* `FASTCLAW_STORAGE_TYPE=postgres`, `FASTCLAW_STORAGE_DSN=postgres://...`
* S3 호환 스토리지를 가리키는 `FASTCLAW_OBJECT_STORE_*` 변수 세트(포드 간에 skills와 workspaces를 동기화하는 데 사용됨)
* `FASTCLAW_BIND=all`(`0.0.0.0`에서 수신)

전체 K8s 매니페스트는 저장소의 `deploy/k8s/` 폴더에 있습니다.

## FAQ

<AccordionGroup>
  <Accordion title="FastClaw와 OpenClaw의 차이점은 무엇입니까?">
    * **FastClaw**: Go 기반의 단일 바이너리로, “Agent Factory” 사용 사례를 겨냥합니다. 멀티 에이전트 관리, IM 채널 전달, 샌드박스 격리를 지원합니다. 에이전트를 서비스로 배포하고 싶을 때 가장 적합합니다.
    * **OpenClaw**: Node.js 기반으로, 개인 로컬 어시스턴트 사용 사례에 초점을 맞춥니다. 로컬 프라이버시 + 멀티 IM 플랫폼 간 연동을 지원합니다.
    * 둘 다 APIYI의 전체 모델 매트릭스에 접근할 수 있습니다. 배포 형태에 맞는 것을 선택하시면 됩니다.
  </Accordion>

  <Accordion title="APIYI의 전체 모델 라인업을 지원합니까?">
    예. APIYI는 OpenAI 호환 엔드포인트(`https://api.apiyi.com/v1`)와 Anthropic 호환 엔드포인트(`https://api.apiyi.com`)를 모두 제공합니다. FastClaw의 어느 provider 타입이든 사용할 수 있으며, APIYI 문서에 있는 model ID를 그대로 사용하시면 됩니다(예: `gpt-5.4`, `claude-sonnet-4-6`, `deepseek-v3.2`, `gemini-3.1-pro-preview`).
  </Accordion>

  <Accordion title="Telegram / Discord를 통해 에이전트를 노출하려면 어떻게 해야 합니까?">
    1. 대상 플랫폼에서 bot을 만들고 token을 얻습니다
    2. 대시보드 → 에이전트를 선택 → Channels → token을 붙여넣고 저장합니다(`getMe` / `auth.test`를 통해 자동 검증됩니다)
    3. IM 플랫폼에서 bot을 검색해 대화를 시작합니다. 세션은 chatID별로 분리됩니다
  </Accordion>

  <Accordion title="상용 프로젝트에서 사용할 수 있습니까?">
    예. FastClaw 커뮤니티 라이선스는 다음을 허용합니다:

    * ✅ 자체 제품의 백엔드로 임베딩하는 것(상업적 사용)
    * ✅ 조직 내부 배포

    허용되지 않는 사항(상용 라이선스 없이는):

    * ❌ FastClaw 자체를 관련 없는 조직들을 대상으로 하는 멀티테넌트 SaaS로 호스팅하는 것
    * ❌ 대시보드에서 FastClaw 브랜딩을 제거하거나 수정하는 것

    상용 라이선스: `support@thinkany.ai`
  </Accordion>
</AccordionGroup>

## 관련 리소스

<CardGroup cols={2}>
  <Card title="프로젝트 저장소" icon="github">
    `github.com/fastclaw-ai/fastclaw`
  </Card>

  <Card title="APIYI API 문서" icon="book" href="/ko/getting-started">
    키와 Base URL 참조를 확인합니다
  </Card>

  <Card title="OpenClaw 대안" icon="bot" href="/ko/scenarios/agent/openclaw/overview">
    개인용 로컬 어시스턴트 사용 사례를 위한 다른 선택지입니다
  </Card>

  <Card title="요금 및 충전" icon="coins" href="/ko/faq/recharge-promotions">
    APIYI 요금 및 첫 충전 보너스를 확인합니다
  </Card>
</CardGroup>
