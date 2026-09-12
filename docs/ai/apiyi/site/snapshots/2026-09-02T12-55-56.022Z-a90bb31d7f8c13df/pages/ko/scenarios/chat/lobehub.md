> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# LobeHub

> 사용자 지정 공급자와 로컬 지식 베이스를 지원하는 오픈소스 AI 채팅 클라이언트 통합 가이드

LobeHub는 여러 모델, 멀티모달 입력, 플러그인 마켓플레이스, 로컬 지식 기반을 지원하는 오픈소스 크로스플랫폼 AI 채팅 클라이언트(이전 명칭은 Lobe Chat)입니다. APIYI를 사용하면 LobeHub에서 단일 API 키로 400개 이상의 주류 AI 모델에 접근할 수 있으며, 각 제공자에 따로 가입하고 결제할 필요가 없습니다.

<CardGroup cols={3}>
  <Card title="오픈소스 및 자체 호스팅 가능" icon="github">
    데스크톱, 웹, Docker 또는 Vercel — 데이터는 당신의 것이고, 통제권은 당신에게 있습니다
  </Card>

  <Card title="플러그인 및 멀티모달" icon="plug">
    내장 웹 검색, 코드 인터프리터, 비전, 동영상 생성 플러그인
  </Card>

  <Card title="로컬 지식 기반" icon="database">
    PDF와 Markdown을 업로드하여 비공개 데이터를 바탕으로 RAG 파이프라인을 구축합니다
  </Card>
</CardGroup>

## 빠른 시작

### 1. APIYI API 키를 받으세요

API 키를 얻으려면 [API 키 관리 가이드](/ko/faq/token-management)를 참조하세요.

### 2. LobeHub 설치

LobeHub는 다음 세 가지 방식으로 사용할 수 있습니다.

* **데스크톱**: Windows, macOS, Linux용 공식 클라이언트 — `lobechat.com`에서 다운로드
* **웹(공식)**: `lobechat.com`에 방문해 가입한 뒤, 별도 자가 호스팅 없이 바로 사용
* **자가 호스팅**: Docker / Vercel / 로컬 소스 코드로 배포 — 엔터프라이즈 또는 개인정보 보호 요구에 적합

<Tip>
  개인 사용에는 공식 웹 또는 데스크톱 클라이언트를 권장합니다. 데이터 프라이버시나 컴플라이언스 요구사항이 있다면 Docker로 자가 호스팅하세요(환경 변수를 통해 APIYI만 설정하면 됩니다).
</Tip>

### 3. 사용자 지정 제공자 만들기

<img src="https://mintcdn.com/apiyillc/xf0Zzocq7Adycbe5/images/lobehub-create-provider.png?fit=max&auto=format&n=xf0Zzocq7Adycbe5&q=85&s=ddda3ebd3c4aa4e60aa6c9f87bd14ecb" alt="LobeHub — 사용자 지정 AI 서비스 제공자 만들기" width="763" height="916" data-path="images/lobehub-create-provider.png" />

`Settings → Model Providers`로 이동해 오른쪽 위의 `+` 아이콘을 클릭하여 사용자 지정 제공자를 추가한 뒤, 위에 표시된 대로 각 필드를 입력합니다.

| 필드          | 값                          | 비고                                |
| ----------- | -------------------------- | --------------------------------- |
| **제공자 ID**  | `apiyi`                    | 고유 식별자 — 한 번 생성하면 변경할 수 없습니다      |
| **제공자 이름**  | `apiyi`                    | 사용자 지정 표시 이름                      |
| **제공자 설명**  | `apiyi`                    | 사용자 지정 설명                         |
| **제공자 로고**  | (비워 두기)                    | 선택 사항 — 사용자 지정 로고 URL             |
| **요청 형식**   | `OpenAI`                   | APIYI는 OpenAI와 완전히 호환됩니다          |
| **프록시 URL** | `https://api.apiyi.com/v1` | Base URL — **반드시 `/v1`로 끝나야 합니다** |
| **API Key** | APIYI API 키                | APIYI 콘솔에서 받으세요                   |

오른쪽 아래의 **생성** 버튼을 클릭하여 저장합니다.

<Info>
  **설정 팁**

  * `Proxy URL`는 반드시 `/v1`로 끝나야 하며, 그렇지 않으면 요청 라우팅에 실패합니다
  * API 키를 붙여넣을 때 앞뒤 공백을 제거하세요
  * 모든 400+ APIYI 모델에 접근하려면 요청 형식으로 `OpenAI`를 선택하세요
  * 하나의 키로 활성화된 모든 모델에서 사용할 수 있으며, 사용한 만큼만 결제합니다
</Info>

### 4. 연결 상태 확인

<img src="https://mintcdn.com/apiyillc/xf0Zzocq7Adycbe5/images/lobehub-configured.png?fit=max&auto=format&n=xf0Zzocq7Adycbe5&q=85&s=b230b3aac1cd11cb9bd186d020ce8b73" alt="LobeHub — 구성된 제공자 보기" width="1473" height="913" data-path="images/lobehub-configured.png" />

제공자를 만든 뒤에는 해당 상세 페이지로 이동합니다. 여기에서 다음 작업을 수행할 수 있습니다.

1. **API Key와 Proxy URL을 확인하거나 업데이트**
2. **고급 옵션 활성화**(선택 사항):
   * `Use Responses API spec` — OpenAI의 최신 요청 형식을 활성화합니다(OpenAI 모델에만 해당)
   * `Use client-side request mode` — 브라우저가 요청을 직접 보내며, 응답 속도를 높일 수 있습니다
3. **연결 확인** — 드롭다운에서 모델을 선택하고 **확인**을 클릭합니다
4. **모델 목록 가져오기** — **모델 목록 가져오기** 버튼을 클릭해 APIYI에서 제공하는 모든 사용 가능한 모델을 가져옵니다

가져오기가 성공하면 `Model list`에 APIYI가 현재 제공하는 모든 항목이 유형별로 표시됩니다: Chat, Image, Video, Embedding, ASR, TTS.

<Warning>
  연결 확인에 실패하면 다음 체크리스트를 따라 점검하세요.

  * 프록시 URL이 `/v1`로 끝납니까?
  * API 키가 아직 유효합니까? (APIYI 콘솔에서 확인)
  * 네트워크가 `api.apiyi.com`에 도달할 수 있습니까?
  * 방화벽이나 프록시가 HTTPS 트래픽을 차단하고 있습니까?
</Warning>

### 5. 모델을 선택하고 대화를 시작하세요

채팅 UI의 모델 드롭다운에서 `claude-opus-5`, `gpt-5-6-terra` 또는 `deepseek-v4-pro` 같은 모델을 선택하면 바로 사용할 수 있습니다.

<Card title="오늘의 주요 모델 추천 보기" icon="star" href="/ko/api-capabilities/model-info">
  최신 모델 추천, 성능 비교, 시나리오별 사용 팁을 둘러보세요. 글쓰기, 코딩, 빠른 응답, 이미지 생성, 동영상 생성 등을 포함합니다.
</Card>

<Info>
  **왜 여기에는 구체적인 모델 목록이 없습니까?**

  AI 모델은 매우 빠르게 반복됩니다. 추천을 정확하게 유지하기 위해 최신 모델 목록, 성능 데이터, 사용 팁을 [모델 추천 페이지](/ko/api-capabilities/model-info)에 유지합니다.
</Info>

## 하나의 공급자로 400개 이상의 모델에 모두 액세스

LobeHub에는 많은 주류 제공업체용 내장 채널이 포함되어 있으며, 각 채널마다 고유한 키가 필요합니다. APIYI를 사용하면 모든 모델을 지원하는 **하나의** 사용자 지정 제공업체를 만들 수 있습니다:

| 채널                            | 모델                                               | 핵심 장점                                 | API 엔드포인트                  |
| ----------------------------- | ------------------------------------------------ | ------------------------------------- | -------------------------- |
| **OpenAI-compatible (apiyi)** | 모든 400개 이상의 모델 (Claude, Gemini, GPT, DeepSeek 등) | 하나의 키로 모든 기능을 열 수 있습니다 — 가장 간단한 설정입니다 | `https://api.apiyi.com/v1` |

<Tip>
  **하나의 apiyi 채널로 Claude, Gemini, 그리고 그 밖의 모든 모델을 지원합니다**

  APIYI는 Claude, Gemini, GPT, DeepSeek 및 기타 최상위 모델을 OpenAI-compatible 프로토콜 아래로 통합합니다. 따라서 LobeHub에서 단 하나의 `apiyi` 사용자 지정 제공업체만 설정하면 드롭다운에 있는 400개 이상의 모든 모델에 액세스할 수 있으며, 공급업체별로 별도의 채널을 설정할 필요가 없습니다.
</Tip>

## LobeHub 기능 심층 분석

### 플러그인 마켓플레이스

LobeHub에는 풍부한 플러그인 마켓플레이스(`Settings → Plugins`)가 포함되어 있습니다. 추천 플러그인은 다음과 같습니다.

* **웹 검색** — 모델에 실시간 인터넷 접근을 제공합니다
* **코드 인터프리터** — 채팅 안에서 Python을 실행해 데이터 분석과 시각화를 수행합니다
* **차트 생성** — 플로차트와 마인드맵을 자동으로 생성합니다
* **이미지 생성** — `gpt-image-2`, `gemini-3-pro-image` 같은 모델을 통해 이미지를 생성합니다

### 로컬 지식 베이스(RAG)

LobeHub는 파일로부터 로컬 벡터 저장소를 구축할 수 있습니다.

1. `Knowledge Base` 페이지로 이동하여 새 지식 베이스를 만듭니다
2. PDF, Markdown, Word, Excel 또는 TXT 파일을 업로드합니다
3. 시스템이 이를 자동으로 청크 분할하고 임베딩합니다
4. 채팅에서 지식 베이스를 선택하면 모델이 파일을 근거로 답변합니다

<Warning>
  임베딩 단계에서는 임베딩 모델을 호출합니다(과금 대상입니다). APIYI의 `text-embedding-3-large` 또는 유사한 임베딩 모델을 사용하는 것을 권장합니다.
</Warning>

### 멀티모달 채팅

시각 이해, 인식, OCR을 위해 이미지를 업로드합니다.

* 추천 시각 모델: `gemini-3-6-flash`, `claude-opus-5`, `gpt-5-6-terra`
* 이미지를 채팅 입력창으로 끌어다 놓기만 하면 모델이 이를 인식합니다

### 에이전트 마켓플레이스

LobeHub에는 풍부한 프리셋 에이전트 집합(번역, 글쓰기, 코딩, 면접 준비 등)이 포함되어 있습니다. 또한 다음도 가능합니다.

* `Agent marketplace`에서 커뮤니티가 공유한 에이전트를 원클릭으로 활성화합니다
* 나만의 에이전트를 만듭니다 — 맞춤 페르소나, prompt, 시작 문구, 지식 베이스, 그리고 플러그인

### 대화 관리

* 대화를 분기하고, 메시지를 편집하고, 응답을 다시 생성합니다
* 대화를 Markdown, PNG 또는 JSON으로 내보냅니다
* 메시지 기록 전체에서 전역 검색을 수행합니다

## 고급 설정

### 사용자 지정 요청 매개변수

공급자 상세 페이지에서 공통 매개변수를 조정할 수 있습니다:

```yaml theme={null}
Default parameters:
  Temperature: 0.7        # Creativity (reasoning models such as the GPT-5.6 series must use 1)
  Top P: 0.9              # Sampling (reasoning models must use 1)
  Max Tokens: 4096        # Maximum output length
  Context Length: 8192    # Context window
```

<Warning>
  일부 추론 모델(예: GPT-5.6 시리즈)은 `Temperature = 1`과 `Top P = 1`만 지원합니다. 다른 값은 무시되거나 서버 측에서 오류를 발생시킬 수 있습니다.
</Warning>

### 네트워크 프록시 및 자체 호스팅

프록시 사용 또는 자체 호스팅된 LobeHub의 경우:

1. **데스크톱 클라이언트**: HTTP/HTTPS 프록시를 구성하려면 `Settings → Network`
2. **자체 호스팅(Docker)**: 환경 변수를 통해 APIYI 설정을 주입합니다:
   ```bash theme={null}
   OPENAI_API_KEY=sk-your-apiyi-key
   OPENAI_PROXY_URL=https://api.apiyi.com/v1
   CUSTOM_MODELS=gpt-5-6-terra,claude-opus-5,deepseek-v4-pro
   ```
3. **클라이언트 측 요청 모드**: 브라우저에서 APIYI로 직접 요청할 수 있도록 합니다(브라우저가 APIYI에 도달할 수 있는 경우에만).

### 키보드 단축키

| 단축키                    | 작업     |
| ---------------------- | ------ |
| `Ctrl/Cmd + N`         | 새 대화   |
| `Ctrl/Cmd + K`         | 빠른 검색  |
| `Ctrl/Cmd + /`         | 명령 팔레트 |
| `Ctrl/Cmd + Shift + M` | 모델 전환  |

## 모바일

LobeHub의 데스크톱 클라이언트는 Windows / macOS / Linux에서 실행됩니다. 모바일에서는 `lobechat.com`의 반응형 웹 앱을 사용하십시오. 별도 설치가 필요하지 않습니다.

## 문제 해결

### 연결 실패 / 연결 확인 실패

| 증상         | 확인할 사항                                            |
| ---------- | ------------------------------------------------- |
| 401 / 403  | API key가 유효하지 않거나 잔액이 소진되었습니다 — APIYI 콘솔에서 확인하십시오 |
| 404        | Proxy URL에 `/v1` 접미사가 없습니다                        |
| Timeout    | 네트워크 문제입니다 — 프록시 또는 방화벽을 확인하십시오                   |
| CORS error | `Client-side request mode`를 끄거나 서버 측 프록시를 거치십시오   |

### 모델 목록이 비어 있음

* **모델 목록 가져오기**를 클릭하여 다시 가져오십시오
* 1\~2초 기다린 다음 페이지를 새로 고치십시오
* APIYI 콘솔에서 API key가 활성 상태인지 확인하십시오

### 응답이 느리거나 스트리밍이 중단됨

* 더 빠른 모델로 전환하십시오(예: `gemini-3-5-flash-lite`, `claude-haiku-4-5`, `deepseek-v4-flash`)
* 불필요한 플러그인을 비활성화하십시오
* 네트워크 지연 시간을 확인하십시오
* 긴 컨텍스트를 줄이십시오(오래된 대화는 닫으십시오)

### 지식 베이스 검색이 부정확함

* 더 세분화된 검색을 위해 chunk 크기를 줄이십시오
* APIYI에서 더 강력한 embedding 모델로 전환하십시오
* 재현율을 높이기 위해 더 관련성 높은 문서를 추가하십시오

## 모범 사례

### 모델 선택 전략

복잡도에 맞는 올바른 작업에 올바른 모델을 사용하십시오:

* **일상 대화 / 간단한 Q\&A**: `gemini-3-5-flash-lite`, `claude-haiku-4-5`, `deepseek-v4-flash`
* **복잡한 추론 / 긴 문서 분석**: `claude-opus-5`, `gpt-5-6-sol`, `deepseek-v4-pro`
* **코딩**: `claude-opus-5`, `gpt-5-6-sol`, `claude-sonnet-5`
* **이미지 이해**: `gemini-3-6-flash`, `claude-opus-5`, `gpt-5-6-terra`
* **이미지 생성**: `gpt-image-2`, `gemini-3-pro-image`

전체 모델 목록과 성능 비교는 [모델 추천 페이지](/ko/api-capabilities/model-info)를 참조하십시오.

### 컨텍스트 관리

* 오래된 대화는 주기적으로 정리하십시오
* 복잡한 작업은 더 짧은 대화로 나누십시오
* 대안 응답을 탐색할 때 `branch conversation` 기능을 사용하십시오

### 보안 및 개인정보

* API 키를 공개적으로 공유하지 마십시오
* 키는 주기적으로 순환하십시오(APIYI 콘솔에서 원클릭 초기화 가능)
* 민감한 대화의 경우 LobeHub를 자체 호스팅하십시오. 데이터는 로컬에 유지됩니다

### 자체 호스팅 팁

* 운영 환경에서는 내장 DB 대신 Docker + PostgreSQL을 사용하십시오
* Cloudflare를 리버스 프록시로 앞단에 두십시오
* 여러 인스턴스를 쉽게 배포할 수 있도록 환경 변수를 통해 비밀 정보를 관리하십시오

## 다른 클라이언트와의 비교

세 클라이언트 모두 APIYI에 같은 방식으로 연결됩니다(OpenAI 호환 프로토콜). 주로 배포 모델과 기능 초점에서 차이가 있습니다:

| 기능                  | LobeHub                           | [Chatbox AI](/ko/scenarios/chat/chatbox) | [Cherry Studio](/ko/scenarios/chat/cherry-studio) |
| ------------------- | --------------------------------- | ---------------------------------------- | ------------------------------------------------- |
| **배포**              | 데스크톱 + 웹 + Docker / Vercel 자가 호스팅 | 데스크톱 + 모바일 + 웹                           | 데스크톱 + 모바일                                        |
| **로컬 지식 베이스 (RAG)** | 내장 벡터 저장소                         | 대화별 문서 이해                                | 내장 지식 베이스                                         |
| **플러그인 / 확장**       | 플러그인 마켓플레이스, 풍부한 생태계              | 일반 기능 내장                                 | 대부분 내장 기능                                         |
| **채널 프로토콜**         | OpenAI 호환                         | OpenAI 호환                                | OpenAI / Anthropic / Gemini                       |
| **모바일**             | 반응형 웹                             | 네이티브 앱                                   | 네이티브 앱                                            |

<Tip>
  **언제 LobeHub를 선택해야 합니까?**

  * **지속적인 로컬 지식 베이스** 또는 **플러그인 생태계**(웹 검색, 코드 인터프리터, 차트 등)가 필요합니다.
  * 데이터에 대한 완전한 제어가 가능한 **비공개 배포**(Docker / Vercel)가 필요합니다.
  * 데스크톱 + 웹 전반에서 하나의 **통합 인터페이스**를 원합니다.

  세 클라이언트 모두 훌륭한 선택입니다. 네이티브 모바일 앱과 로컬 저장소를 중시한다면 Chatbox AI를 선택하십시오. Claude / Gemini 네이티브 프로토콜(프롬프트 캐시 포함)이 필요하다면 Cherry Studio를 선택하십시오.
</Tip>

더 도움이 필요하시면 `lobechat.com` 문서를 확인하거나 [APIYI 웹사이트](https://api.apiyi.com)를 방문하십시오.
