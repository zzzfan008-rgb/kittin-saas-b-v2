> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Chatbox AI

> 크로스 플랫폼 AI 클라이언트 애플리케이션 연동 가이드

Chatbox AI는 여러 대규모 언어 모델과 API를 지원하는 강력한 크로스플랫폼 AI 클라이언트 애플리케이션입니다. APIYI를 통해 로컬 저장의 프라이버시 보호를 누리면서 Chatbox에서 다양한 주류 AI 모델에 접근할 수 있습니다.

## 빠른 시작

### 다운로드 및 설치

Chatbox AI는 여러 플랫폼 설치를 지원합니다:

* **데스크톱**: Windows, macOS, Linux
* **모바일**: iOS, Android
* **웹**: 브라우저로 직접 접속

자신의 플랫폼에 맞는 버전을 다운로드하려면 [Chatbox AI 공식 웹사이트](https://chatboxai.app/en)를 방문하십시오.

### APIYI 구성

#### 1단계: 설정 열기

1. Chatbox AI 애플리케이션을 실행합니다
2. 왼쪽 아래 모서리의 설정 아이콘(⚙️)을 클릭합니다
3. “모델 구성” 인터페이스로 들어갑니다

#### 2단계: 사용자 지정 공급자 추가

<img src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/chatbox-setting.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=dd787d3ef7889fbe04f9d2c3143b5cc5" alt="Chatbox AI 설정 인터페이스 - APIYI 구성 예시" width="2708" height="1536" data-path="images/chatbox-setting.png" />

위에 표시된 구성 인터페이스에 따라 다음 설정 단계를 완료하십시오:

1. “모델 공급자” 섹션에서 **+ 추가** 버튼을 클릭합니다

2. 공급자 정보를 입력합니다:
   * **이름**: APIYI(사용자 지정 가능한 이름)
   * **API 모드**: **OpenAI API 호환**을 선택합니다
   * **API Key**: APIYI 키를 입력합니다
   * **API Host**: `https://api.apiyi.com/v1`
   * **API Path**: `/chat/completions`(기본값)

3. **고급 구성**(선택 사항):
   * 이미지의 표시처럼 “네트워크 호환성 향상” 옵션을 활성화합니다
   * 전용 이미지 생성 엔드포인트를 구성할 수 있습니다

<Info>
  **구성 핵심 사항**

  * API Host 필드는 Base URL에 해당하며 `/v1` 접미사를 포함해야 합니다
  * API Path 필드는 특정 엔드포인트 경로를 지정합니다
  * API Key는 [APIYI 콘솔](https://api.apiyi.com)에서 얻을 수 있습니다
  * 구성이 완료되면 오른쪽 아래 모서리의 **+ 새로 만들기** 버튼을 클릭하여 모델을 추가합니다
</Info>

#### 3단계: 모델 선택

구성이 완료되면 채팅 인터페이스에서 모델을 선택할 수 있습니다.

## 지원 모델

Chatbox AI는 APIYI를 통해 OpenAI, Google Gemini, Claude, DeepSeek 및 중국 내수 모델을 포함한 400개 이상의 주류 AI 모델을 지원합니다.

<Card title="지금 추천하는 모델 보기" icon="star" href="/ko/api-capabilities/model-info">
  최신 모델 추천, 성능 비교, 그리고 시나리오별 가이드를 제공합니다 — 글쓰기, 프로그래밍, 빠른 응답, 이미지 생성, 동영상 생성 등을 포함합니다.
</Card>

<Info>
  **여기에서 특정 모델을 나열하지 않는 이유는 무엇입니까?**

  AI 모델은 매우 빠른 속도로 업데이트됩니다. 항상 정확한 추천을 받을 수 있도록 모델 목록, 성능 데이터, 사용 가이드를 한곳에 모아 [모델 추천 페이지](/ko/api-capabilities/model-info)에서 관리합니다.
</Info>

## 핵심 기능

### 다중 플랫폼 동기화

Chatbox AI의 핵심 장점입니다:

* **로컬 저장소**: 데이터가 완전히 로컬에 저장되어 프라이버시를 보호합니다
* **크로스 플랫폼 접근**: 서로 다른 기기 간에 전환할 수 있습니다
* **오프라인 기능**: 일부 기능은 오프라인 사용을 지원합니다

### 대화 관리

**지능형 대화 기능**:

* 다중 턴 대화 컨텍스트 유지
* 대화 기록 검색 및 관리
* 대화 내보내기(Markdown, PDF)
* prompt 라이브러리와 메시지 참조

### 문서 처리

**문서 이해 기능**:

* PDF, TXT, DOCX 문서 업로드
* 이미지 이해 및 분석
* LaTeX 및 Markdown 렌더링
* 코드 하이라이팅 및 미리보기

### 이미지 생성

**AI 이미지 생성**:

* DALL-E 시리즈 모델 이미지 생성을 지원합니다
* 구성 가능한 전용 이미지 생성 엔드포인트
* 다양한 이미지 크기와 스타일을 지원합니다
* 배치 이미지 생성 기능

**이미지 생성 설정**:

1. 설정에서 전용 이미지 생성 공급자를 추가합니다
2. 표준 `/images/generations` 엔드포인트를 사용합니다
3. 채팅에서 이미지 요구사항을 직접 설명합니다
4. 시스템이 자동으로 이미지 생성 API를 호출합니다

### 고급 설정

**매개변수 조정**:

```yaml theme={null}
Conversation Parameter Settings:
  - Temperature: 0.7        # Creativity control (reasoning models GPT-5 only use 1)
  - Max Tokens: 4096       # Maximum output length
  - Top P: 0.9            # Sampling parameter (reasoning models gpt-5 only use 1)
  - Context Length: 8192   # Context length
```

## 사용 팁

### Prompt 최적화

Chatbox AI에는 내장 prompt 라이브러리가 있으며, 사용자 지정 prompt도 만들 수 있습니다:

```markdown theme={null}
# Programming Assistant
You are an experienced software engineer, please help me:
- Write high-quality code
- Explain complex concepts
- Provide best practice recommendations

# Output Format
Please format code using code blocks and provide detailed comments.
```

### 개인정보 보호

Chatbox AI는 “privacy by design” 철학을 채택합니다:

* 데이터는 로컬에 저장되며 클라우드로 업로드되지 않습니다
* 자체 호스팅 API 엔드포인트를 지원합니다
* 로컬 모델을 사용해 완전히 오프라인으로 사용할 수 있습니다

## 고급 구성

### 사용자 지정 API 엔드포인트

기본 채팅 기능 외에도 전용 이미지 생성 엔드포인트도 구성할 수 있습니다:

#### Chat Completion 엔드포인트 구성

```yaml theme={null}
Basic Chat Configuration:
  Provider Name: APIYI
  API Mode: OpenAI API Compatible
  API Key: sk-your-apiyi-key
  API Host: https://api.apiyi.com/v1
  API Path: /chat/completions
```

#### 이미지 생성 엔드포인트 구성

**방법 1: 전용 이미지 API 사용**

```yaml theme={null}
Image Generation Configuration:
  Provider Name: APIYI-Image
  API Mode: OpenAI API Compatible
  API Key: sk-your-apiyi-key
  API Host: https://api.apiyi.com/v1
  API Path: /images/generations  # Standard image generation endpoint
  Applicable Models: gpt-image-1, flux-kontext-pro
```

**방법 2: Responses 엔드포인트 사용**

```yaml theme={null}
Responses Configuration:
  Provider Name: APIYI-Responses
  API Mode: OpenAI API Compatible
  API Key: sk-your-apiyi-key
  API Host: https://api.apiyi.com
  API Path: /v1/responses  # General response endpoint
```

<Tip>
  **엔드포인트 선택 권장사항**

  * 일반 대화: `/chat/completions` 엔드포인트 사용
  * sora\_image와 같은 역공학 기반 이미지 생성 모델: `/chat/completions` 엔드포인트 사용
  * 이미지 생성: `/images/generations` 표준 엔드포인트를 우선 사용
  * 특수한 요구사항: `gpt-image-1` 또는 `/v1/responses` 엔드포인트를 사용할 수 있습니다
  * Chatbox에서는 “API Path” 필드가 특정 엔드포인트 경로에 해당합니다
</Tip>

### 네트워크 프록시 설정

액세스에 프록시를 사용해야 하는 경우:

1. 설정 > 네트워크 구성으로 이동합니다
2. HTTP/HTTPS 프록시를 구성합니다
3. 프록시 인증을 설정합니다(필요한 경우)

### 키보드 단축키 설정

일반적인 단축키:

* `Ctrl/Cmd + N`: 새 대화
* `Ctrl/Cmd + T`: 모델 전환
* `Ctrl/Cmd + /`: 명령 팔레트 표시
* `Ctrl/Cmd + K`: 빠른 검색

## 모바일 설정

### iOS/Android 설정

모바일 설정은 데스크톱과 동일합니다:

1. Chatbox AI 모바일 앱을 다운로드합니다
2. Settings > Model Configuration으로 이동합니다
3. APIYI 사용자 지정 프로바이더를 추가합니다
4. 동일한 API Base URL 및 키를 구성합니다

### 모바일 전용 기능

* **음성 입력**: 음성을 텍스트로 변환할 수 있습니다
* **카메라 통합**: 이미지 분석을 위해 직접 사진을 촬영할 수 있습니다
* **오프라인 캐시**: 대화 기록을 오프라인에서 확인할 수 있습니다
* **푸시 알림**: 중요한 메시지 알림입니다

## 문제 해결

### 일반적인 문제

**연결 실패**

* API 기본 URL 확인: `https://api.apiyi.com/v1`
* API key 유효성을 확인하십시오
* 네트워크 연결이 정상인지 확인하십시오

**모델이 표시되지 않음**

* 모델 목록이 자동으로 새로 고침될 때까지 기다리십시오
* 수동으로 "모델 새로 고침" 버튼을 클릭하십시오
* API key 권한을 확인하십시오

**응답 지연**

* 더 빠른 모델로 전환해 보십시오
* 네트워크 지연 시간을 확인하십시오
* 컨텍스트 길이를 줄이십시오

### 로그 디버깅

디버그 모드를 활성화하십시오:

1. 설정 > 고급 옵션
2. "디버그 모드"를 활성화하십시오
3. 상세 로그 정보를 확인하십시오

### 데이터 백업

대화 데이터를 정기적으로 백업하십시오:

1. 설정 > 데이터 관리
2. 대화 기록을 내보내십시오
3. 구성 파일을 백업하십시오

## 모범 사례

### 성능 최적화

1. **모델을 현명하게 선택하기**
   * 작업의 복잡도에 맞는 모델을 선택합니다
   * 모델 선택에 대한 최신 지침은 [모델 권장사항 페이지](/ko/api-capabilities/model-info)를 참고합니다

2. **컨텍스트 관리**
   * 사용하지 않는 대화를 정기적으로 정리합니다
   * 컨텍스트 길이를 적절하게 설정합니다
   * 대화 그룹화 기능을 사용합니다

3. **리소스 관리**
   * API 사용량을 모니터링합니다
   * 사용 쿼터 알림을 설정합니다
   * 앱 버전을 정기적으로 업데이트합니다

### 보안 권장사항

* API 키를 공유하지 마십시오
* 키를 정기적으로 변경합니다
* 강력한 비밀번호로 앱을 보호합니다
* 민감한 정보는 신중하게 처리합니다

### 팀 협업

Chatbox AI는 주로 개인 사용자를 대상으로 하지만, 다음을 통해 팀 지원이 가능합니다:

* prompt 템플릿을 공유합니다
* 대화 기록을 내보내고 공유합니다
* API 구성 표준을 통일합니다

## 비교 장점

### 다른 클라이언트 대비

| 기능             | Chatbox AI | ChatGPT Web | 다른 클라이언트 |
| -------------- | ---------- | ----------- | -------- |
| **로컬 저장**      | ✅          | ❌           | 부분 지원    |
| **멀티 플랫폼**     | ✅          | ❌           | 부분 지원    |
| **사용자 지정 API** | ✅          | ❌           | ✅        |
| **오프라인 기능**    | ✅          | ❌           | ❌        |
| **개인정보 보호**    | ✅          | ❌           | 불확실      |

### Chatbox AI를 선택하는 이유

1. **개인정보 우선**: 데이터가 완전히 로컬에 저장됩니다
2. **유연한 구성**: 다양한 API 엔드포인트를 지원합니다
3. **크로스 플랫폼**: 통합된 사용자 경험을 제공합니다
4. **풍부한 기능**: prompt 라이브러리, 문서 처리 등
5. **지속적인 업데이트**: 활발한 개발과 유지보수가 이루어집니다

더 도움이 필요하신가요? [Chatbox AI 도움말 센터](https://chatboxai.app/en/help-center)를 확인하시거나 [APIYI 공식 웹사이트](https://api.apiyi.com)를 방문해 보십시오.
