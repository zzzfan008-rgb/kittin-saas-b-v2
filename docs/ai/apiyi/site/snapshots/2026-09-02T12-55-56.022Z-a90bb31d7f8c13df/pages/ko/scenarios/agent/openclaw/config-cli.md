> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# CLI 대화형 설정

> OpenClaw를 빠르게 구성하려면 openclaw 온보드 마법사와 CLI 명령을 사용합니다

## 설정 마법사(새 사용자에게 권장)

최초 사용 시에는 설정 마법사를 실행하여 모든 구성을 완료하십시오:

```bash theme={null}
openclaw onboard
```

### 1단계: 모델 제공자 선택

**모델/인증 제공자** 목록에서 아래로 스크롤하여 다음을 선택하십시오:

```text theme={null}
Custom Provider (Any OpenAI or Anthropic compatible endpoint)
```

### 2단계: API 기본 URL 입력

**API 기본 URL** 필드에 APIYI 엔드포인트를 입력하십시오:

```text theme={null}
https://api.apiyi.com
```

### 3단계: API 키 입력 방법 선택

API 키를 제공하는 방법을 묻는다면 다음을 선택하십시오:

```text theme={null}
Paste API key now
```

### 4단계: API 키 붙여넣기

APIYI 토큰(API 키라고도 하며, `sk-`로 시작합니다)을 입력란에 붙여 넣으십시오.

토큰을 얻는 방법:

1. APIYI 토큰 관리 페이지를 여십시오: `https://api.apiyi.com/token`
2. 유형이 **사용량 기반 우선순위**인 기본 토큰을 찾으십시오
3. 해당 토큰 행의 맨 오른쪽, “작업” 열 아래에서 **첫 번째 복사 버튼**을 클릭하십시오
4. 그러면 `sk-` 접두사가 붙은 토큰(API 키)이 복사됩니다. 여기에 붙여 넣으십시오

<img src="https://mintcdn.com/apiyillc/VhX_X1CtsRG4uabo/images/openclaw-paste-api-key.png?fit=max&auto=format&n=VhX_X1CtsRG4uabo&q=85&s=e34c60488a8e4ed46fdcb1edccda8812" alt="API 키 붙여넣기" width="1338" height="800" data-path="images/openclaw-paste-api-key.png" />

<Tip>
  새 토큰을 만들 필요는 없습니다. 시스템이 생성한 기본 “사용량 기반 우선순위” 토큰을 사용하면 됩니다.
</Tip>

### 5단계: 엔드포인트 호환성 선택

**엔드포인트 호환성** 옵션에서 다음을 선택하십시오:

```text theme={null}
OpenAI-compatible (Uses /chat/completions)
```

<Info>
  주로 Claude 모델을 사용하며 프롬프트 캐싱 같은 기본 기능이 필요하다면, 대신 `Anthropic-compatible`을 선택할 수 있습니다. 자세한 내용은 [Anthropic 기본 구성](/ko/scenarios/agent/openclaw/config-anthropic)을 참고하십시오.
</Info>

### 6단계: 모델 ID 설정

**모델 ID** 필드에 사용하려는 모델 이름을 입력하십시오. 예를 들면 다음과 같습니다:

```text theme={null}
gpt-5.4
```

기타 옵션: `claude-sonnet-4-6`, `deepseek-v3.2`, `gemini-3.1-pro-preview` 등

### 7단계: 확인 및 완료

OpenClaw가 구성을 자동으로 검증합니다. 성공하면 시스템이 **엔드포인트 ID**(예: `custom-api-apiyi-com`)를 생성하여 설정이 완료되었음을 나타냅니다.

<Warning>
  검증 과정에서 가끔 오류가 발생할 수 있습니다. 다시 시도하면 대개 성공합니다. 계속 실패하면 API 키가 올바른지와 네트워크 연결이 안정적인지 확인하십시오.
</Warning>

### 구성 요약

| 매개변수       | 값                               |
| ---------- | ------------------------------- |
| 제공자        | 사용자 지정 제공자                      |
| API 기본 URL | `https://api.apiyi.com`         |
| 호환성        | OpenAI 호환                       |
| 엔드포인트 ID   | `custom-api-apiyi-com` (자동 생성됨) |

## 구성 수정

초기 설정 후에는 `configure` 명령을 사용하여 대화형 설정에 다시 진입합니다:

```bash theme={null}
openclaw configure
```

그러면 다음 항목에 대한 대화형 설정 메뉴가 열립니다:

* 모델 제공자 및 기본 모델
* 채팅 채널 설정
* 스킬 활성화/비활성화
* 게이트웨이 매개변수

## 단일 설정 명령

개별 설정 항목을 빠르게 확인하거나 수정합니다:

```bash theme={null}
{/* View current config value */}
openclaw config get agents.defaults.model.primary

{/* Set config value */}
openclaw config set agents.defaults.model.primary "apiyi/gpt-5.4"

{/* Set API key */}
openclaw config set models.providers.apiyi.apiKey "sk-your-key"
```

## Web UI 구성 패널

대시보드를 시작한 후에는 브라우저에서도 구성 관리를 할 수 있습니다:

```bash theme={null}
openclaw dashboard
```

`http://127.0.0.1:18789/`을(를) 열어 설정 페이지에 접근하면 다음 작업을 할 수 있습니다:

* 모델 구성을 시각적으로 편집
* 채팅 채널 연결 관리
* 구성된 스킬을 확인하고 전환
* 로그와 실행 상태를 실시간으로 모니터링

## 서비스를 시작합니다

설정 후 게이트웨이를 시작합니다:

```bash theme={null}
openclaw gateway start
```

<Tip>
  설정 변경 후 서비스를 다시 시작합니다:

  ```bash theme={null}
  openclaw gateway restart
  ```
</Tip>
