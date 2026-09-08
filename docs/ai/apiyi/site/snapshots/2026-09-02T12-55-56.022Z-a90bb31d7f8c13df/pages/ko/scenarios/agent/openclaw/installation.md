> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 설치 가이드

> OpenClaw 로컬 AI 비서를 macOS, Linux, 및 Windows에 설치합니다

## 시스템 요구 사항

* Node.js 22 이상
* macOS / Linux / Windows

## Node.js 설치

<Tabs>
  <Tab title="macOS (Homebrew)">
    ```bash theme={null}
    brew install node@22
    ```
  </Tab>

  <Tab title="Linux (nvm)">
    ```bash theme={null}
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    nvm install 22
    nvm use 22
    ```
  </Tab>

  <Tab title="Windows">
    Node.js 공식 웹사이트에서 22.x 버전 이상을 다운로드하여 설치합니다.

    또는 PowerShell을 사용하여 fnm을 설치합니다:

    ```powershell theme={null}
    winget install Schniz.fnm
    fnm install 22
    fnm use 22
    ```
  </Tab>
</Tabs>

## OpenClaw 설치

<Tabs>
  <Tab title="npm (권장)">
    ```bash theme={null}
    npm install -g openclaw
    ```
  </Tab>

  <Tab title="빠른 설치 스크립트">
    ```bash theme={null}
    curl -fsSL https://openclaw.ai/install.sh | bash
    ```
  </Tab>

  <Tab title="Windows PowerShell">
    ```powershell theme={null}
    irm https://openclaw.ai/install.ps1 | iex
    ```
  </Tab>
</Tabs>

## 설치 확인

```bash theme={null}
openclaw --version
```

진단 명령을 실행하여 환경이 준비되었는지 확인합니다:

```bash theme={null}
openclaw doctor
```

현재 실행 상태를 확인합니다:

```bash theme={null}
openclaw status
```

<Info>
  `openclaw doctor`에 문제가 보고되면 자동 수정해 보십시오:

  ```bash theme={null}
  openclaw doctor --fix
  ```
</Info>

## 다음 단계

설치 후 구성 방법을 선택합니다:

<CardGroup cols={3}>
  <Card title="JSON 구성" icon="file-code" href="/ko/scenarios/agent/openclaw/config-json">
    JSON 구성 파일을 수동으로 편집합니다
  </Card>

  <Card title="CLI 대화형 설정" icon="terminal" href="/ko/scenarios/agent/openclaw/config-cli">
    마법사 안내 설정
  </Card>

  <Card title="Anthropic 기본 구성" icon="bot" href="/ko/scenarios/agent/openclaw/config-anthropic">
    Claude에 직접 연결
  </Card>
</CardGroup>
