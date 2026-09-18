> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Trae

> ByteDance의 AI 네이티브 IDE로, Builder/Chat/Inline Chat 모드를 제공합니다. 사용자 지정 모델 항목으로 APIYI에 연결하여 OpenAI와 Anthropic 프로토콜을 모두 지원하는 400개 이상의 주요 모델을 사용할 수 있습니다.

## 개요

**Trae**는 ByteDance가 2025년 1월 출시한 **AI 네이티브 IDE**로, 전문 개발자를 위한 “Vibe Coding” 생산성 도구로 포지셔닝되어 있습니다. 원하는 것을 자연어로 설명하면 AI가 코드 완성, 버그 수정, 프로젝트 스캐폴딩, 원클릭 미리보기를 처리합니다. Trae는 두 가지 버전으로 제공됩니다: **TRAE CN** (`trae.cn`)과 **국제판 TRAE** (`trae.ai`)이며, **SOLO** 시리즈(Desktop / App / Web)는 에이전트가 전체 작업 수명 주기를 맡도록 합니다.

APIYI를 Trae의 “Custom Model” 기능에 연결하면 다음과 같은 이점을 얻습니다:

<CardGroup cols={2}>
  <Card title="🔌 이중 프로토콜 지원" icon="plug">
    OpenAI 및 Anthropic 공급자를 모두 구성할 수 있습니다 — token 하나로, 두 프로토콜
  </Card>

  <Card title="🤖 400+ 모델" icon="layers">
    GPT, Claude, Gemini, DeepSeek, Doubao, Qwen — 모두 하나의 게이트웨이 뒤에서 제공됩니다
  </Card>

  <Card title="💰 Claude 5% 할인" icon="piggy-bank">
    token을 생성할 때 ClaudeCode 그룹을 선택하면 Claude를 5% 할인받을 수 있으며, 충전 보너스와 중복 적용됩니다
  </Card>

  <Card title="🛡️ 안정적인 직접 연결" icon="shield">
    `api.apiyi.com`는 중국 본토에서 직접 접속 가능합니다 — 추가 프록시가 필요 없습니다
  </Card>
</CardGroup>

<Info>
  **제품 정보**

  * 🔗 국제판: `www.trae.ai`
  * 🔗 중국판: `www.trae.cn`
  * 👥 개발사: ByteDance
  * 📅 최초 출시: 2025년 1월
  * 🧩 모드: 빌더 (에이전트) / 채팅 (사이드바) / 인라인 채팅
  * 🌐 지원 프로토콜: OpenAI, Anthropic, 그 외 많은 서드파티 공급자
</Info>

## 핵심 기능

### 세 가지 상호작용 모드

* **Builder mode**: agent가 작업을 맡습니다 — 파일을 읽고/쓰고, 명령을 실행하고, 프로젝트를 스캐폴딩합니다
* **Chat mode**: 사이드바 대화로, Cursor Chat / Cline과 비슷하며 Q\&A와 스니펫에 매우 적합합니다
* **Inline Chat**: `Cmd/Ctrl + I`가 에디터 안에서 인라인 대화를 엽니다 — 완료와 리팩터링에 가장 빠른 경로입니다

### MCP 및 툴링 생태계

* 외부 툴과 API를 위한 내장 **MCP (Model Context Protocol)** 지원
* **Remote-SSH** 지원 — 원격 개발 경험이 로컬과 동일합니다
* 프로젝트 수준의 AI 동작을 위한 `.rules` 파일

### 사용자 지정 모델(이 가이드의 중심)

국제판 Trae에는 **Anthropic, OpenAI, Gemini, xAI, OpenRouter, Ollama, DeepSeek, Volcano Engine, Aliyun, Tencent Cloud, SiliconFlow, PPIO, Novita, BytePlus** 등의 사전 설정이 포함되어 있습니다. 모든 사전 설정에서는 **사용자 지정 model ID + API key + 사용자 지정 요청 URL**을 입력할 수 있으며 — 이것이 APIYI를 연결하는 데 사용할 진입점입니다.

<Tip>
  **왜 APIYI를 경유하는가**: Trae의 내장 모델은 지역과 버전이 제한되어 있고, 여러 업스트림 계정 간에 사용량을 공유할 방법이 없습니다. APIYI를 사용하면 **하나의 token으로 OpenAI와 Anthropic을 모두 커버**할 수 있습니다 — GPT와 Claude를 전환할 때 더 이상 설정으로 돌아갈 필요가 없으며, Trae 상단 바의 드롭다운에서 모델만 선택하면 됩니다.
</Tip>

<Warning>
  **⚠️ 모델 호환성 — 설정하기 전에 읽으십시오**

  1. **Trae는 Responses 프로토콜을 지원하지 않습니다**: 사용자 지정 모델은 두 채널만 제공합니다 — `/v1/chat/completions`(OpenAI 프로토콜)과 `/v1/messages`(Anthropic 프로토콜)입니다. GPT-5.4 시리즈부터 OpenAI는 "reasoning + tool calling"을 `/v1/responses` endpoint로만 제한하므로, **`gpt-5.4` / `gpt-5.5` / `gpt-5.6`는 Trae의 Builder / Chat(with tools) 시나리오에서 모두 400을 반환하며 — 사실상 사용할 수 없습니다**, 심지어 `gpt-5.4`도 마찬가지입니다(자세한 내용은 아래 FAQ를 참조하십시오).
  2. **OpenAI 호환 chat mode는 agent에 적합하지 않습니다**: 제한 없는 GPT 모델을 사용하더라도, chat mode는 agent 워크플로와 고급 툴 권한 지원이 불완전하여 Builder mode가 자주 멈추고 사용 경험이 저하됩니다.
  3. **Trae에서는 Claude 계열을 권장합니다**: Builder mode에서 완전하고 안정적인 tool calling을 제공하는 Anthropic의 기본 `/v1/messages` 프로토콜로 동작하므로, 가장 먼저 권장합니다.
  4. **Trae에서 실행할 수 없는 모델(최신 GPT 시리즈)은 [Codex app](/ko/scenarios/programming/codex-cli)으로 전환하십시오**: Codex는 Responses 프로토콜을 기본적으로 사용하므로 `gpt-5.6-sol` / `gpt-5.5`가 전체 기능으로 동작합니다.
</Warning>

## 빠른 시작

### 1단계: Trae 설치

<Tabs>
  <Tab title="국제판 (TRAE)">
    `www.trae.ai`에서 다운로드 — macOS, Windows, Linux를 지원합니다. 국제판 빌드에는 GPT / Claude / Gemini 프리셋이 기본으로 포함되어 있습니다.
  </Tab>

  <Tab title="중국판 (TRAE CN)">
    `www.trae.cn`에서 다운로드 — macOS 및 Windows를 지원합니다. Doubao와 DeepSeek 프리셋이 포함되어 있으며, 휴대전화로 계정 로그인합니다.
  </Tab>
</Tabs>

### 2단계: APIYI Token 받기

1. APIYI token 콘솔을 방문합니다: `api.apiyi.com/token`
2. “New Token”을 클릭합니다
3. **Claude 위주 사용 시**: **ClaudeCode 그룹**을 선택합니다 — Claude 호출은 **5% 할인**되며, 10%-20% 충전 보너스와 중복 적용됩니다
4. **GPT/Gemini/DeepSeek 혼합 사용 시**: **Default 그룹**이면 충분합니다
5. `sk-`로 시작하는 키를 복사합니다

### 3단계: Trae에서 사용자 지정 모델 패널 열기

* **IDE 모드**: 오른쪽 상단의 ⚙️ 아이콘을 클릭 → 왼쪽 내비게이션에서 **Models** → “Add model” / “Custom model”
* **SOLO 모드**: 채팅 패널 오른쪽 상단의 ⚙️를 클릭 → **Models** → Add

### 4단계: OpenAI 프로토콜 항목 추가(GPT / Gemini / DeepSeek / Doubao 등)

아래와 같이 입력합니다. **사용자 지정 요청 URL에는 전체 `/v1/chat/completions` 경로가 반드시 포함되어야 합니다** — 도메인만 있으면 안 됩니다:

<img src="https://mintcdn.com/apiyillc/vSACm1ThocKlKALW/images/trae-custom-model-openai.png?fit=max&auto=format&n=vSACm1ThocKlKALW&q=85&s=3b59889c3ae27a374a6da691beca2ffa" alt="Trae 사용자 지정 모델 — 요청 URL https://api.apiyi.com/v1/chat/completions로 APIYI에 연결하는 OpenAI 프로토콜" width="477" height="521" data-path="images/trae-custom-model-openai.png" />

| 항목                | 값                                                         | 설명                                       |
| ----------------- | --------------------------------------------------------- | ---------------------------------------- |
| **제공자**           | `OpenAI`                                                  | OpenAI 프리셋을 선택합니다                        |
| **모델**            | `Custom Model`                                            | 드롭다운의 마지막 항목입니다                          |
| **모델 ID**         | 예: `gpt-5.1`, `deepseek-v4-flash`, `gemini-3-pro-preview` | 원하는 모델의 전체 ID입니다                         |
| **API Key**       | `sk-...`                                                  | 2단계에서 받은 APIYI token을 붙여넣습니다             |
| **사용자 지정 요청 URL** | `https://api.apiyi.com/v1/chat/completions`               | **`/v1/chat/completions`를 반드시 포함해야 합니다** |

<Warning>
  **기본 URL에는 전체 경로가 필요합니다**: v3.3.51부터 Trae의 custom-model baseURL 필드는 **그대로** 사용됩니다 — 더 이상 `/chat/completions`를 자동으로 덧붙이지 않습니다. `https://api.apiyi.com`나 `https://api.apiyi.com/v1`만 입력하면 오류가 발생합니다.
</Warning>

<Note>
  **이 항목의 대상 모델**: `gpt-5.1` / `gpt-5.2`, Gemini, DeepSeek, Doubao, Qwen 및 채팅 프로토콜에서 제한이 없는 다른 모델입니다. **`gpt-5.4` 및 그보다 새로운 GPT 모델(5.5 / 5.6 시리즈)은 여기서 작동하지 않습니다** — 위의 "Model compatibility"를 참조하십시오. 해당 모델에는 [Codex 앱](/ko/scenarios/programming/codex-cli)을 사용하십시오.
</Note>

### 5단계: Anthropic 프로토콜 항목 추가(Claude 계열)

Claude Opus 4.6 / Sonnet 4.6 / Haiku 4.5도 사용하려면 두 번째 제공자 항목을 추가합니다:

<img src="https://mintcdn.com/apiyillc/vSACm1ThocKlKALW/images/trae-custom-model-anthropic.png?fit=max&auto=format&n=vSACm1ThocKlKALW&q=85&s=18c4c41f103b88df7402ab92a99aa059" alt="Trae 사용자 지정 모델 — 요청 URL https://api.apiyi.com/v1/messages로 APIYI에 연결하는 Anthropic 프로토콜" width="476" height="440" data-path="images/trae-custom-model-anthropic.png" />

| 항목                | 값                                           | 설명                                                                       |
| ----------------- | ------------------------------------------- | ------------------------------------------------------------------------ |
| **제공자**           | `Anthropic`                                 | Anthropic 프리셋을 선택합니다                                                     |
| **모델**            | `Claude-Sonnet-4.6` (또는 드롭다운의 다른 Claude 버전) | 공식 프리셋을 사용하십시오 — “Custom model”로 갈 필요가 없습니다                              |
| **API Key**       | `sk-...`                                    | APIYI token을 붙여넣습니다(가능하면 ClaudeCode 그룹에서 받은 token)                       |
| **사용자 지정 요청 URL** | `https://api.apiyi.com/v1/messages`         | **`/v1/messages`를 반드시 포함해야 합니다** — 이는 `/v1/chat/completions`가 아님에 유의하십시오 |

<Info>
  **두 프로토콜, 두 경로입니다**: OpenAI 프로토콜은 `/v1/chat/completions`를 거치고, Anthropic 프로토콜은 `/v1/messages`를 거칩니다. APIYI는 두 엔드포인트를 모두 호스팅하므로 같은 token을 두 Trae 제공자 항목에 동시에 연결해도 충돌이 없습니다.
</Info>

### 6단계: 모델을 전환하고 코딩을 시작합니다

편집기로 돌아가서 상단의 모델 드롭다운을 클릭하면 두 제공자와 그 모든 모델이 나타납니다. 하나를 선택해 대화를 시작하거나 Builder 모드로 들어가십시오.

## 추천 모델 라인업

<CardGroup cols={2}>
  <Card title="일상 코딩(최고 가성비)" icon="code">
    **Claude Sonnet 4.6** (Anthropic) + **GPT-5.1** (OpenAI)

    Sonnet 4.6은 뛰어난 코딩 능력을 매우 좋은 가격에 제공합니다. GPT-5.1은 일반적인 채팅에 더 빠릅니다
  </Card>

  <Card title="복잡한 아키텍처(플래그십)" icon="crown">
    **Claude Opus 4.6** (Anthropic)

    대규모 리팩터링, 여러 파일 분석, 아키텍처 결정에 가장 적합합니다 — Builder 모드와 함께 사용하십시오
  </Card>

  <Card title="심층 추론" icon="brain">
    **Claude Sonnet 4.6 Thinking** / **GPT-5.1 Thinking**

    사고 과정을 강제합니다 — 알고리즘, 논리 퍼즐, 보안 검토에 매우 적합합니다
  </Card>

  <Card title="비용 최적화(CN 모델)" icon="banknote">
    **DeepSeek V4** / **Doubao 1.5 Pro** / **Qwen3 Coder**

    OpenAI 프로토콜을 통해 라우팅됩니다 — 토큰당 비용이 낮고 자연스러운 중국어 출력을 제공합니다
  </Card>
</CardGroup>

<Info>
  **이 목록에 최신 GPT 모델(5.4 이상)이 없는 이유**: Trae는 Responses 프로토콜을 지원하지 않으므로 `gpt-5.4` / `gpt-5.5` / `gpt-5.6` 모두 Builder / Chat 도구 호출 시나리오에서 400 오류로 실패합니다(위의 “모델 호환성” 참조). 그런 경우에는 [Codex 앱](/ko/scenarios/programming/codex-cli)을 사용하십시오. Trae 내부의 에이전트 작업에는 기본 Anthropic 프로토콜을 사용하는 Claude 제품군이 가장 안정적인 선택입니다.
</Info>

<Card title="전체 모델 목록과 코딩 권장 사항 보기" icon="star" href="/ko/api-capabilities/model-info">
  APIYI는 통합 게이트웨이를 통해 400개 이상의 모델을 제공합니다. 모델 추천 페이지는 최신 성능 및 요금 비교를 반영해 최신 상태로 유지됩니다.
</Card>

## 전문 팁

<Steps>
  <Step title="제공자 항목을 둘 다 유지하세요">
    OpenAI와 Anthropic 항목을 둘 다 추가하세요 — GPT/Gemini ↔ Claude로 전환해도 더 이상 baseURL을 수정할 필요가 없습니다.
  </Step>

  <Step title="드롭다운에서 최신 모델을 찾을 수 없으신가요?">
    Trae의 내장 모델 프리셋은 APIYI의 실제 공급보다 뒤처집니다. **“커스텀 모델”을 선택하고 ID를 직접 입력하세요** — 공식 ID는 APIYI 콘솔 또는 모델 추천 페이지를 참고하세요.
  </Step>

  <Step title="Builder 모드에서는 Claude를 우선 사용하세요">
    Claude는 특히 Sonnet 4.6 / Opus 4.6에서 지시 준수와 다중 턴 도구 호출 측면에서 에이전트 워크플로에 훨씬 더 안정적입니다.
  </Step>

  <Step title="어려운 작업에는 -thinking 접미사를 추가하세요">
    모델 ID에 `-thinking`를 덧붙이세요(예: `claude-sonnet-4-6-thinking`). 그러면 추론이 강제됩니다. Builder 모드에서 아키텍처 결정과 보안 감사의 환각을 크게 줄입니다.
  </Step>

  <Step title="그룹별로 token을 분리하세요">
    Anthropic 항목 전용으로는 **ClaudeCode-group token**(95% 요율)을 하나 만들고, GPT/Gemini/DeepSeek용으로는 **Default-group token**을 사용하세요. 과금과 쿼터 가시성이 더 깔끔해집니다.
  </Step>
</Steps>

## FAQ

<AccordionGroup>
  <Accordion title="TRAE CN과 국제판 TRAE — APIYI 통합에 차이가 있습니까?">
    **차이가 없습니다** — 두 버전 모두 Custom Model을 지원하며 OpenAI 및 Anthropic provider 항목을 동시에 추가할 수 있습니다. 실제 차이는 기본 제공 프리셋 모델입니다(CN은 Doubao/DeepSeek 중심이고, 국제판은 GPT/Claude/Gemini 중심입니다).

    권장 사항: 중국 본토에 계신 경우 TRAE CN(`trae.cn`)을 선택하고, 글로벌 팀이거나 해외 프리셋 모델이 필요한 경우 국제판 TRAE(`trae.ai`)를 선택하십시오.
  </Accordion>

  <Accordion title="baseURL을 /v1/chat/completions까지 지정해야 하는 이유는 무엇입니까?">
    **v3.3.51**부터 Trae는 사용자 지정 모델의 baseURL을 파싱하는 방식을 변경했습니다. 이제 요청에 자동으로 `/chat/completions`를 추가하지 않고 입력된 값을 그대로 사용합니다.

    올바른 예:

    * OpenAI 프로토콜: `https://api.apiyi.com/v1/chat/completions`
    * Anthropic 프로토콜: `https://api.apiyi.com/v1/messages`

    잘못된 예(404 또는 라우팅 오류 발생):

    * ❌ `https://api.apiyi.com`
    * ❌ `https://api.apiyi.com/v1`
  </Accordion>

  <Accordion title="Anthropic provider에서 'Custom Model'을 사용하여 임의의 모델 ID를 입력할 수 있습니까?">
    가능합니다. Anthropic provider 항목에도 "Custom Model" 옵션이 제공되므로 `claude-opus-4-6` / `claude-sonnet-4-6-thinking` / `claude-haiku-4-5-20251001`과 같은 ID를 직접 입력하십시오. APIYI의 `/v1/messages` 엔드포인트는 공식 모델 ID와 완전히 호환됩니다.
  </Accordion>

  <Accordion title="Claude 할인 5%는 어떻게 받을 수 있습니까?">
    `api.apiyi.com/token`에서 token을 생성할 때 **ClaudeCode 그룹을 선택하십시오** — Claude 호출에는 자동으로 **5% 할인이 적용**되며, 10%-20% 충전 보너스와 중복 적용할 수 있습니다.

    이 ClaudeCode 그룹 token을 Trae의 Anthropic provider 항목에 붙여 넣으면 할인이 자동으로 적용됩니다.
  </Accordion>

  <Accordion title="Trae에서 GPT-5.1 / Claude 4.6 / 최신 모델이 표시되지 않는 이유는 무엇입니까?">
    Trae의 프리셋 목록은 실제 업스트림 제공 현황보다 업데이트가 늦습니다. **권장 방법은 "Custom model"을 선택하고 ID를 직접 입력하는 것입니다** — APIYI 백엔드에서 지원하는 모델이라면 무엇이든 작동하므로 Trae 클라이언트가 프리셋을 업데이트할 때까지 기다릴 필요가 없습니다.
  </Accordion>

  <Accordion title="Builder 모드가 계속 멈추거나 도구 호출이 실패합니다">
    1. **Claude Sonnet 4.6 또는 Opus 4.6을 우선 사용하십시오**: 도구 호출 워크플로에서 안정성이 특히 높습니다.
    2. **소형 비추론 모델은 피하십시오**: DeepSeek-Chat / 더 작은 Qwen 변형은 Builder 모드에서 반복 루프에 빠질 수 있으므로 `thinking` 변형으로 전환하십시오.
    3. **컨텍스트 길이를 확인하십시오**: 대규모 다중 파일 변경 작업에는 Opus 4.6(200K 컨텍스트)으로 전환하십시오.
    4. **APIYI 실시간 상태를 확인하십시오**: 간헐적인 업스트림 불안정은 모든 클라이언트에 영향을 미치므로 채널 문제가 아닌지 확인하십시오.
  </Accordion>

  <Accordion title="gpt-5.6 / gpt-5.5 / gpt-5.4에서 400 오류와 함께 Function tools with reasoning_effort are not supported가 발생합니다">
    전체 오류는 일반적으로 다음과 같습니다: `Function tools with reasoning_effort are not supported for gpt-5.6-sol in /v1/chat/completions. To use function tools, use /v1/responses or set reasoning_effort to 'none'.` (400, `invalid_request_error`).

    이는 **GPT-5.4 시리즈부터 도입된 OpenAI의 공식 제한**이며, APIYI 채널 문제가 아닙니다. `/v1/chat/completions` 엔드포인트에서는 function tools를 `none` 이외의 `reasoning_effort`와 함께 사용할 수 없습니다. OpenAI가 제시하는 해결 방법은 두 가지입니다. `/v1/responses` 엔드포인트로 전환하거나, `reasoning_effort`을 `none`로 명시적으로 설정하는 것입니다(추론을 포기하게 됨). 전체 진단 및 마이그레이션 단계는 [엔드포인트 및 마이그레이션](/ko/api-capabilities/openai/responses-migration)을 참조하십시오.

    Trae에서는 두 방법 모두 사용할 수 없습니다. 사용자 지정 모델은 `/v1/chat/completions`(OpenAI 프로토콜)과 `/v1/messages`(Anthropic 프로토콜)만 지원하며 Responses API는 지원하지 않고, `reasoning_effort` 설정도 없습니다. Builder / Chat 모드는 항상 도구 정의를 전송하므로 **클라이언트 측 해결 방법은 없습니다**. JetBrains AI Assistant, opencode 및 기타 클라이언트에서도 GPT-5.4+에서 동일한 문제가 발생합니다.

    해결 방법:

    1. **Trae에서 영향을 받지 않는 모델로 전환하십시오**: `gpt-5.1` / `gpt-5.2`(OpenAI 프로토콜) 또는 Claude 제품군(`/v1/messages`을 통한 Anthropic 프로토콜), Gemini / DeepSeek 등을 사용하십시오.
    2. **Trae 내부에서 계속 사용하십시오**: Trae에 [Roo Code](/ko/scenarios/programming/roo-code) 플러그인을 설치하십시오. 이 플러그인의 "OpenAI" provider는 `/v1/responses`를 사용하며, Trae 내부에서 도구 호출이 작동하는 것을 확인했습니다. 결과적으로 Responses 채널을 추가할 수 있습니다. Roo Code는 중단된 프로젝트이며 프리셋 모델 목록은 `gpt-5.4`에서 끝난다는 점에 유의하십시오.
    3. **도구 호출과 함께 gpt-5.5 / 5.6 추론이 필요한 경우**: Responses API를 지원하는 클라이언트를 사용하십시오 — [Codex 앱 / CLI](/ko/scenarios/programming/codex-cli) 또는 [opencode](/ko/scenarios/programming/opencode)를 사용하고, 전체 클라이언트 지원 표는 [OpenAI Responses API 네이티브 가이드](/ko/api-capabilities/openai/native)를 참조하십시오.
  </Accordion>

  <Accordion title="Trae의 텔레메트리 / 데이터 업로드는 어떻습니까?">
    Trae는 ByteDance 클라이언트이며 공식 개인정보 보호정책에 따라 텔레메트리와 대화 데이터를 업로드합니다. 클라이언트 측 텔레메트리가 민감한 경우 다음 방법을 고려하십시오.

    * 기업 외부 통신 경로에서 허용 목록을 설정하십시오.
    * Builder 모드에 입력하기 전에 민감한 내용을 삭제하거나 비식별화하십시오.
    * 대안으로 [Claude Code](/ko/scenarios/programming/claude-code) 또는 [Cline](/ko/scenarios/programming/cline)과 같은 오픈 소스 / 감사 가능한 클라이언트를 선택하십시오.
  </Accordion>

  <Accordion title="Trae와 Cursor / Cline / Claude Code 중 어떻게 선택해야 합니까?">
    | 도구              | 유형           | 에이전트 모드      | APIYI 통합             | 적합한 용도                       |
    | --------------- | ------------ | ------------ | -------------------- | ---------------------------- |
    | **Trae**        | 독립형 IDE      | ✅ Builder    | 보통(이중 프로토콜에 두 항목 필요) | 강력한 중국어 지원과 Cursor 스타일 UX    |
    | **Cursor**      | 독립형 IDE      | ❌ (Chat만 지원) | 간편(OpenAI 프로토콜만 지원)  | 업계 최고 수준의 자동 완성 및 diff 미리 보기 |
    | **Cline**       | VS Code 플러그인 | ✅            | 간편                   | 이미 VS Code를 많이 사용하는 경우       |
    | **Claude Code** | CLI          | ✅            | 간편                   | 터미널 워크플로, CI, 원격 개발          |

    각 통합 가이드를 참조하십시오: [Cursor](/ko/scenarios/programming/cursor) · [Cline](/ko/scenarios/programming/cline) · [Claude Code](/ko/scenarios/programming/claude-code) · [Codex CLI](/ko/scenarios/programming/codex-cli)
  </Accordion>

  <Accordion title="401 / 403 오류는 어떻게 디버깅합니까?">
    1. API 키가 `sk-`로 시작하고 불필요한 공백이 없는지 확인하십시오.
    2. baseURL이 올바른지 확인하십시오. 특히 후행 경로를 확인해야 합니다(`/v1/chat/completions`와 `/v1/messages` 비교).
    3. APIYI 콘솔에서 token이 활성화되어 있고 대상 모델이 해당 token의 그룹에 연결되어 있는지 확인하십시오.
    4. 잔액 부족도 401 오류로 나타날 수 있으므로 계정 잔액을 다시 확인하십시오.
  </Accordion>
</AccordionGroup>

## 관련 리소스

<CardGroup cols={2}>
  <Card title="모델 추천" icon="star" href="/ko/api-capabilities/model-info">
    400개 이상의 모델에 대한 성능 비교 및 코딩 시나리오별 추천
  </Card>

  <Card title="APIYI 콘솔" icon="settings" href="https://api.apiyi.com">
    token 생성, 사용량 확인, 그룹 관리
  </Card>

  <Card title="Cursor 통합" icon="mouse-pointer-click" href="/ko/scenarios/programming/cursor">
    또 다른 주류 AI IDE를 위한 설정 가이드
  </Card>

  <Card title="Cline 플러그인" icon="puzzle" href="/ko/scenarios/programming/cline">
    VS Code 내부의 다기능 에이전트
  </Card>

  <Card title="Codex 앱 통합" icon="code" href="/ko/scenarios/programming/codex-cli">
    네이티브 Responses 프로토콜 — 최신 GPT 시리즈(5.4+)를 위한 적합한 자리
  </Card>
</CardGroup>

<Info>
  **더 도움이 필요하신가요?** `api.apiyi.com`을 방문하시거나 기술 지원을 위해 공식 커뮤니티에 참여하십시오.
</Info>
