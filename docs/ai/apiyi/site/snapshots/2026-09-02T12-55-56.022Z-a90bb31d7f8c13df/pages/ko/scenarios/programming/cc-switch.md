> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# CC Switch

> Claude Code와 다른 4개의 AI CLI 도구를 관리하는 통합 데스크톱 앱입니다 — 원클릭 제공자 전환, 모델 설정 등

## 개요

CC Switch는 Tauri 2로 구축된 데스크톱 애플리케이션으로, Claude Code, Codex CLI, Gemini CLI, OpenCode, OpenClaw라는 다섯 가지 AI CLI 도구의 관리를 통합합니다. 더 이상 설정 파일을 수동으로 편집할 필요 없이, 그래픽 인터페이스에서 API 제공자, 모델, 키를 전환할 수 있습니다.

APIYI를 제공자로 설정하면 다음과 같은 이점을 얻을 수 있습니다:

<CardGroup cols={2}>
  <Card title="🚀 원클릭 전환" icon="toggle-right">
    모든 CLI 도구 설정을 GUI로 관리하여 더 이상 수동 편집이 필요하지 않습니다
  </Card>

  <Card title="💰 88% 할인" icon="piggy-bank">
    ClaudeCode 그룹으로 token을 생성하면 88% 요율이 적용됩니다
  </Card>

  <Card title="📊 사용량 추적" icon="chart-line">
    실시간 지출, 요청, token 추적을 위한 내장 사용량 대시보드
  </Card>

  <Card title="🔄 스마트 장애 조치" icon="shield">
    핫 전환, 자동 장애 조치, 서킷 브레이커가 있는 로컬 프록시
  </Card>
</CardGroup>

<Info>
  **프로젝트 정보**

  * 🔗 저장소: `github.com/farion1231/cc-switch`
  * 📜 라이선스: MIT
  * 👤 작성자: Jason Young (farion1231)
  * 🏷️ 최신 버전: v3.12.0
</Info>

## 핵심 기능

### 제공자 관리

* AWS Bedrock 및 NVIDIA NIM을 포함한 50개 이상의 내장 사전 설정
* 원클릭 전환, 드래그 앤 드롭 정렬, 가져오기/내보내기
* 시스템 트레이 빠른 접근

### MCP 서버 관리

* 모든 CLI 도구에서 통합된 MCP 서버 설정
* 양방향 동기화 — 변경 사항이 모든 애플리케이션에 전파됩니다

### 추가 기능

* **프롬프트 관리**: Markdown 편집기 + 앱 간 동기화
* **스킬 설치**: GitHub 저장소 또는 ZIP 파일에서 스킬 설치
* **세션 브라우저**: 대화 기록 보기 및 복원
* **클라우드 동기화**: Dropbox, OneDrive, iCloud, WebDAV 지원
* **딥 링크**: 원클릭 설정 가져오기를 위한 `ccswitch://` 프로토콜

## 빠른 시작

### 1단계: CC Switch 설치

<Tabs>
  <Tab title="macOS">
    Homebrew로 설치합니다:

    ```bash theme={null}
    brew install --cask cc-switch
    ```

    또는 GitHub Releases에서 DMG 설치 프로그램을 다운로드합니다.
  </Tab>

  <Tab title="Windows">
    GitHub Releases에서 MSI 설치 프로그램 또는 Portable ZIP를 다운로드합니다.
  </Tab>

  <Tab title="Linux">
    배포판에 맞는 설치 방법을 선택합니다:

    ```bash theme={null}
    # Debian/Ubuntu
    sudo dpkg -i cc-switch_*.deb

    # Fedora/RHEL
    sudo rpm -i cc-switch_*.rpm

    # Arch Linux
    paru -S cc-switch-bin
    ```

    AppImage와 Flatpak도 사용할 수 있습니다.
  </Tab>
</Tabs>

<Info>
  **시스템 요구 사항**: Windows 10+, macOS 10.15 (Catalina)+, Ubuntu 22.04+ / Debian 11+ / Fedora 34+
</Info>

### 2단계: APIYI API Key 받기

1. [APIYI 콘솔 - 토큰 페이지](https://api.apiyi.com/token)를 방문합니다.
2. 클릭하여 새 token을 생성합니다.
3. **중요**: **【ClaudeCode】그룹**을 선택하여 **88% 할인**을 받습니다.
4. 생성된 키를 복사합니다(`sk-`로 시작합니다).

<Tip>
  **비용 절감**: token을 생성할 때【ClaudeCode】그룹을 선택하여 88% 할인된 가격을 적용받으십시오.
</Tip>

### 3단계: CC Switch에서 APIYI 구성하기

1. CC Switch를 엽니다.
2. **Provider** 관리 페이지로 이동하여 추가를 클릭하고 “사용자 지정 게이트웨이”를 선택합니다:

<img src="https://mintcdn.com/apiyillc/9frKyyBXrVY4n9Yi/images/cc-switch-provider-config.png?fit=max&auto=format&n=9frKyyBXrVY4n9Yi&q=85&s=bea7dc157f751d1a530f486664b15791" alt="CC Switch Provider 설정 - APIYI를 통합 공급자로 추가" width="1628" height="1522" data-path="images/cc-switch-provider-config.png" />

3. 위에 표시된 대로 다음 정보를 입력합니다:
   * **이름**: `APIYI`
   * **API 주소**: `https://api.apiyi.com`
   * **API Key**: 이전 단계에서 복사한 키를 붙여넣습니다.
   * **활성화된 앱**: Claude Code를 활성화합니다(필요에 따라 다른 앱도 활성화합니다).
4. “Add”를 클릭하여 구성을 저장합니다.

### 4단계: 모델 추가

Provider 구성에 다음 모델을 추가합니다:

**표준 모델**:

| 모델 이름             | 모델 ID                       | 설명                      |
| ----------------- | --------------------------- | ----------------------- |
| Claude Opus 4.6   | `claude-opus-4-6`           | 최상위 플래그십, 복잡한 작업에 가장 적합 |
| Claude Sonnet 4.6 | `claude-sonnet-4-6`         | 강력한 코딩 성능, 가성비 최고       |
| Claude Haiku 4.5  | `claude-haiku-4-5-20251001` | 가볍고 빠르며, 단순한 작업에 적합     |

**추론 모델**(강제 chain-of-thought):

| 모델 이름                      | 모델 ID                                | 설명               |
| -------------------------- | ------------------------------------ | ---------------- |
| Claude Opus 4.6 Thinking   | `claude-opus-4-6-thinking`           | 깊은 추론, 복잡한 논리 분석 |
| Claude Sonnet 4.6 Thinking | `claude-sonnet-4-6-thinking`         | 추론 강화 코딩, 균형 잡힘  |
| Claude Haiku 4.5 Thinking  | `claude-haiku-4-5-20251001-thinking` | 가벼운 추론, 빠른 판단    |

<Tip>
  **모델 선택 팁**: 일상적인 코딩에는 `claude-sonnet-4-6`를, 복잡한 아키텍처 설계에는 `claude-opus-4-6`를, 빠른 질의응답에는 `claude-haiku-4-5-20251001`를 사용합니다. 깊은 추론이 필요할 때는 thinking 변형을 사용합니다.
</Tip>

### 5단계: 원클릭 전환

구성이 끝나면 CC Switch에서 APIYI를 활성 Provider로 선택합니다. 연결된 모든 CLI 도구(Claude Code, Codex CLI 등)는 자동으로 APIYI 구성으로 전환됩니다.

## 사용 가이드

### 여러 CLI 도구 관리

CC Switch는 다음 5개의 AI CLI 도구를 동시에 관리할 수 있도록 지원합니다.

* **Claude Code** — Anthropic의 공식 CLI 프로그래밍 어시스턴트
* **Codex CLI** — OpenAI의 명령줄 프로그래밍 도구
* **Gemini CLI** — Google의 명령줄 AI 어시스턴트
* **OpenCode** — 오픈소스 CLI 프로그래밍 도구
* **OpenClaw** — 오픈소스 로컬 AI 에이전트

모든 도구는 Provider 설정을 공유하므로 한 번 전환하면 어디서나 적용됩니다.

### 로컬 프록시

CC Switch에는 다음 기능을 갖춘 내장 로컬 프록시 서버가 포함되어 있습니다.

* **Hot-switching**: 다시 시작하지 않고 Provider를 전환합니다
* **Auto-failover**: 현재 Provider가 중단되면 자동으로 백업으로 전환합니다
* **Circuit breaker**: 지속적인 실패 시 요청을 중단하여 리소스 낭비를 방지합니다

### 구성 백업

* 자동 백업 시스템은 가장 최근 10개 버전을 보관합니다
* 전체 구성을 가져오기/내보내기 할 수 있습니다
* Dropbox, OneDrive, iCloud, WebDAV를 통한 클라우드 동기화

## 모델 추천

<Card title="더 많은 프로그래밍 모델 추천 보기" icon="star" href="/ko/api-capabilities/model-info">
  Claude 시리즈 외에도 APIYI는 400개 이상의 주류 AI 모델을 지원합니다. 프로그래밍 모델에 대한 완전한 추천, 성능 비교, 그리고 사용 시나리오별 제안을 확인해 보시기 바랍니다.
</Card>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="CC Switch는 어떤 운영체제를 지원합니까?">
    Windows 10+, macOS 10.15 (Catalina)+, 그리고 주요 Linux 배포판(Ubuntu 22.04+, Debian 11+, Fedora 34+, Arch Linux)입니다.
  </Accordion>

  <Accordion title="그룹 할인 요금은 어떻게 받을 수 있습니까?">
    일부 그룹(예: ClaudeCode 그룹)은 [APIYI 콘솔](https://api.apiyi.com/token)에서 token을 생성할 때 할인 요금을 제공합니다. 현재 요율은 콘솔에서 확인하십시오. 여기에 충전 보너스를 더하면 실질 비용을 더 낮출 수 있습니다.
  </Accordion>

  <Accordion title="Claude Code가 설정 후 연결되지 않습니까?">
    다음을 확인하십시오:

    1. API Key가 올바른지 확인하십시오(`sk-`로 시작해야 합니다).
    2. Base URL이 `https://api.apiyi.com`로 설정되어 있는지 확인하십시오.
    3. APIYI 계정 잔액이 충분한지 확인하십시오.
    4. CC Switch가 설정을 Claude Code에 동기화했는지 확인하십시오.
  </Accordion>

  <Accordion title="표준 모델과 Thinking 모델의 차이점은 무엇입니까?">
    Thinking(reasoning) 모델은 체인 오브 쏘트 모드를 강제하여, 응답하기 전에 심층 추론 분석을 수행합니다. 복잡한 논리, 아키텍처 설계, 심층 사고 시나리오에 적합합니다. 표준 모델은 더 빠르게 응답하며 일상적인 코딩과 간단한 작업에 적합합니다.
  </Accordion>

  <Accordion title="다른 설정 방법에서 CC Switch로 어떻게 마이그레이션합니까?">
    CC Switch는 가져오기 기능을 지원하며 기존 환경 변수와 설정 파일을 자동으로 감지할 수 있습니다. 설치 후 앱을 열면 설치된 CLI 도구와 기존 설정을 자동으로 감지합니다.
  </Accordion>

  <Accordion title="CC Switch는 무료입니까?">
    CC Switch 자체는 완전히 무료이며 오픈소스(MIT License)입니다. 비용이 발생하는 것은 API 호출뿐입니다. APIYI의 ClaudeCode 그룹을 사용하면 88% 할인된 요금이 적용됩니다.
  </Accordion>
</AccordionGroup>

## 모범 사례

<Tip>
  **효율적인 사용을 위한 팁**:

  1. **올바른 그룹으로 token을 생성합니다**: 항상 88% 할인 혜택을 받는【ClaudeCode】그룹을 선택합니다
  2. **핫 스위칭을 활용합니다**: 작업 간에 provider와 모델을 빠르게 전환합니다
  3. **자동 페일오버를 활성화합니다**: 서비스 연속성을 위해 여러 provider를 백업으로 구성합니다
  4. **정기 백업**: cloud sync를 사용하여 구성 정보를 정기적으로 백업합니다
</Tip>

## 관련 리소스

<CardGroup cols={2}>
  <Card title="Claude Code 설정" icon="terminal" href="/ko/scenarios/programming/claude-code">
    자세한 Claude Code 설정 튜토리얼
  </Card>

  <Card title="모델 추천" icon="bot" href="/ko/api-capabilities/model-info">
    최신 AI 모델 추천
  </Card>

  <Card title="APIYI 콘솔" icon="settings" href="https://api.apiyi.com">
    API 키를 관리하고 사용량을 확인합니다
  </Card>

  <Card title="기타 프로그래밍 도구" icon="code" href="/ko/scenarios/programming/cursor">
    Cursor 같은 다른 도구를 살펴보세요
  </Card>
</CardGroup>
