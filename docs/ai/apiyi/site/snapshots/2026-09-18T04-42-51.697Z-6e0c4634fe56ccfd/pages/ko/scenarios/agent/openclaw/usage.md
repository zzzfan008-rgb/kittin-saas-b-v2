> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 사용 가이드

> OpenClaw 사용 방법, 핵심 기능, 자주 쓰는 명령어, 실용 예제

## 사용 방법

### 방법 1: 웹 UI (권장)

가장 간단한 방법이며, 외부 서비스가 필요하지 않습니다:

```bash theme={null}
openclaw dashboard
```

브라우저가 `http://127.0.0.1:18789/`를 열며, 웹 인터페이스에서 직접 채팅할 수 있습니다.

<Tip>
  웹 UI는 프록시 요구 사항 없이 직접 작동하므로 권장되는 방법입니다.
</Tip>

### 방법 2: Telegram 봇

1. Telegram에서 `@BotFather`를 검색합니다
2. 봇을 생성하려면 `/newbot`를 전송합니다
3. Bot Token을 받습니다
4. `openclaw onboard` 중에 Token을 입력합니다

<Warning>
  Telegram에서 프록시가 필요한 지역에 있다면:

  ```bash theme={null}
  export https_proxy=http://127.0.0.1:proxy-port
  export http_proxy=http://127.0.0.1:proxy-port
  openclaw gateway restart
  ```
</Warning>

### 방법 3: 기타 플랫폼

OpenClaw는 또한 다음을 지원합니다:

* WhatsApp(연결하려면 QR을 스캔)
* Discord(Bot을 생성해야 함)
* Slack, Signal, iMessage, Microsoft Teams 등

## 핵심 기능

OpenClaw에는 다양한 작업을 위한 풍부한 내장 기능이 포함되어 있습니다.

### 파일 작업

| 기능         | 설명            |
| ---------- | ------------- |
| `fs.read`  | 텍스트/이미지 파일 읽기 |
| `fs.write` | 파일 쓰기/생성      |
| `fs.edit`  | 파일 내용 편집      |

### 시스템 작업

| 기능              | 설명                           |
| --------------- | ---------------------------- |
| `shell.exec`    | 터미널 명령 실행                    |
| `shell.process` | 실행 중인 명령 관리                  |
| `browser.*`     | 브라우저 자동화(페이지 열기, 스크린샷, 클릭 등) |

### 스마트 기능

| 기능              | 설명             |
| --------------- | -------------- |
| `web_search`    | 웹 검색           |
| `web_fetch`     | 웹 콘텐츠 가져오기     |
| `memory_search` | 메모리 검색         |
| `memory_get`    | 메모리 조회         |
| `cron.*`        | 예약 작업(알림, 자동화) |
| `tts`           | 텍스트 음성 변환      |

## 일반 명령

### 터미널 명령

| Command                    | Function      |
| -------------------------- | ------------- |
| `openclaw onboard`         | 설정 마법사 실행     |
| `openclaw gateway start`   | 게이트웨이 서비스 시작  |
| `openclaw gateway restart` | 게이트웨이 서비스 재시작 |
| `openclaw gateway stop`    | 게이트웨이 서비스 중지  |
| `openclaw status`          | 실행 중 상태 확인    |
| `openclaw doctor`          | 설정 문제 진단      |
| `openclaw doctor --fix`    | 설정 문제 자동 수정   |
| `openclaw dashboard`       | 웹 제어판 열기      |
| `openclaw logs --follow`   | 실시간 로그 보기     |
| `openclaw configure`       | 설정 수정         |
| `openclaw update`          | 최신 버전으로 업데이트  |

### 채팅 명령

채팅 창에서 사용할 수 있는 명령입니다:

| Command           | Function     |
| ----------------- | ------------ |
| `/help`           | 도움말 표시       |
| `/new`            | 새 대화 시작      |
| `/reset`          | 대화 초기화       |
| `/stop`           | 현재 작업 중지     |
| `/think <level>`  | 추론 깊이 설정     |
| `/model <id>`     | 모델 전환        |
| `/verbose on/off` | 상세 모드 전환     |
| `/status`         | 상태 확인        |
| `/skills`         | 사용 가능한 스킬 보기 |

## 사용 예시

OpenClaw와 자연스럽게 대화하면 작업을 이해하고 실행합니다:

### 파일 작업

```text theme={null}
> Create a test.txt file on my desktop with content "hello world"

> Read the content of ~/Documents/notes.txt

> Move all .png files from desktop to Pictures folder
```

### 터미널 명령

```text theme={null}
> List all files on my desktop

> Check current system memory usage

> Install the Python requests library
```

### 브라우저 제어

```text theme={null}
> Open browser and visit google.com

> Search for the latest MacBook Pro prices

> Take a screenshot of the current webpage
```

### 예약된 작업

```text theme={null}
> Remind me to drink water every day at 9am

> Remind me to take a break every hour

> Remind me about the meeting tomorrow at 3pm
```

### 프로그래밍 지원

```text theme={null}
> Write a Python script to batch rename files

> What's wrong with this code: [paste code]

> Create a simple HTML page for me
```

## 추천 모델

OpenClaw는 APIYI를 통해 400개 이상의 주류 AI 모델을 지원합니다. 다양한 작업에 맞는 적절한 모델을 선택하십시오.

<Card title="모델 추천 보기" icon="star" href="/ko/api-capabilities/model-info">
  최신 시나리오 기반 모델 추천을 확인하십시오. 여기에는 텍스트 작성, 프로그래밍, 빠른 응답, 긴 문서 처리 등이 포함됩니다.
</Card>

### 시나리오별 추천

| 작업 유형     | 추천 모델           | 이유                |
| --------- | --------------- | ----------------- |
| 복잡한 작업 수행 | Claude Sonnet 4 | 뛰어난 이해력, 정확한 실행   |
| 일상 대화     | GPT-5.4         | 자연스러운 응답, 높은 범용성  |
| 코드 작성     | DeepSeek V3.2   | 뛰어난 코딩 능력, 비용 효율적 |
| 긴 문서 처리   | Gemini 3.1 Pro  | 초장문 컨텍스트 지원       |
