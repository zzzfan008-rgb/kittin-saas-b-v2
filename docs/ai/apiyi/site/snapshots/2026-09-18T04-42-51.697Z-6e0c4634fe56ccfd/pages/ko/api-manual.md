> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# API 매뉴얼

> APIYI 인터페이스 사용 설명서. APIYI는 OpenAI 호환 AI 게이트웨이입니다 — 하나의 코드로 400개 이상의 주류 대형 모델에 연결됩니다. 이 페이지는 모델을 찾고, 온라인으로 테스트하고, 빠르게 통합하는 데 도움을 줍니다.

APIYI는 **OpenAI 호환 AI 게이트웨이**입니다. 하나의 표준 인터페이스와 하나의 API Key로 400개 이상의 주요 대형 모델을 호출할 수 있습니다. 이 페이지는 네비게이션 허브로서 **어떤 모델을 사용할지**, **온라인에서 엔드포인트를 테스트할지**, **어떻게 연동할지**를 빠르게 찾는 데 도움을 줍니다.

## 플랫폼 개요

### OpenAI 호환 모드

APIYI는 **OpenAI 호환 형식**을 사용합니다. 한 번 작동하면 모델을 전환할 때는 **`model` 필드**만 변경하면 되며 — 나머지는 모두 동일합니다:

```python theme={null}
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="https://api.apiyi.com/v1"
)

# Switching models = change only the `model` field, nothing else
response = client.chat.completions.create(
    model="gpt-5-chat-latest",   # swap in any supported model name
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)
```

<Note>
  정확한 모델 이름, 과금, 권장 사용 사례는 아래 “모델 선택”의 두 전용 페이지를 참조하십시오. 오래된 정보를 피하기 위해 여기에는 나열하지 않습니다.
</Note>

### 기능 지원 범위

<CardGroup cols={2}>
  <Card title="지원됨" icon="circle-check">
    * 채팅 Completions
    * 이미지 / 동영상 생성
    * 음성 전사 (Whisper)
    * 임베딩
    * 함수 호출
    * 스트리밍 출력 (SSE)
    * 표준 OpenAI 매개변수: `temperature`, `top_p`, `max_tokens`, 등
    * Responses 엔드포인트
  </Card>

  <Card title="지원 안 됨" icon="circle-x">
    * 파인튜닝
    * 파일 관리
    * 조직 관리
    * 과금 관리
  </Card>
</CardGroup>

## 모델 선택

어떤 모델을 사용해야 할지 잘 모르시겠습니까? 이 두 페이지는 가격, 기능 비교, 추천 사항을 최신 상태로 유지합니다:

<CardGroup cols={2}>
  <Card title="텍스트 / 멀티모달 모델" icon="sparkles" href="/ko/api-capabilities/model-info">
    GPT, Claude, Gemini, Grok, DeepSeek, Qwen, Kimi, GLM 등 다양한 모델의 기능, 가격, 선택 가이드를 제공합니다.
  </Card>

  <Card title="이미지 / 동영상 모델" icon="image" href="/ko/api-capabilities/image-video-models">
    Nano Banana, GPT-image, Seedream, Flux 같은 이미지 모델과 VEO, Sora, Wan 같은 동영상 모델의 가격 및 사용법을 제공합니다.
  </Card>
</CardGroup>

## 기본 정보

### API 엔드포인트

* **주요**: `https://api.apiyi.com/v1`
* **백업**: `https://vip.apiyi.com/v1`

### 인증

모든 요청에는 헤더에 API Key를 포함해야 합니다:

```http theme={null}
Authorization: Bearer YOUR_API_KEY
```

### 요청 형식

* **Content-Type**: `application/json`
* **인코딩**: UTF-8
* **메서드**: 대부분의 엔드포인트에서 `POST`

## 빠른 시작

### API 키 받기

1. [APIYI 콘솔](https://api.apiyi.com/token)에 방문하여 로그인합니다
2. token 관리 페이지에서 "추가"를 클릭하여 API Key를 생성합니다
3. 생성된 키를 복사하여 요청에 사용합니다

### 다국어 코드 예시 받기

콘솔에는 최신 API 버전과 동기화되어 갱신되는, 여러 언어용의 바로 실행 가능한 코드 예시가 내장되어 있습니다. **먼저 이 예시를 사용하십시오**:

1. [token 관리 페이지](https://api.apiyi.com/token)로 이동합니다
2. 대상 API Key 행의 "작업" 열에서 🔧 렌치 아이콘을 클릭합니다
3. "요청 예시"를 선택하여 cURL, Python, Node.js, Java, C#, Go, PHP, Ruby 등으로 된 전체 예시를 확인합니다

<img src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/apiyi-token-simple-code.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=067d8d551cd1d8aaebb833932e6632a5" alt="APIYI token 관리 - 요청 예시" width="1496" height="902" data-path="images/apiyi-token-simple-code.png" />

## 온라인 테스트 (Playground)

“API 참조” 섹션에는 **온라인 플레이그라운드**가 제공됩니다: API Key를 입력하면 요청을 보내고 실시간 응답을 바로 볼 수 있습니다 — 코드가 필요하지 않습니다.

<CardGroup cols={3}>
  <Card title="Chat Completions" icon="messages-square" href="/en/api-reference/chat/chat-completions">
    `POST /v1/chat/completions` — 주요 채팅 및 멀티모달 엔드포인트입니다.
  </Card>

  <Card title="모델 목록" icon="list" href="/en/api-reference/models/list-models">
    `GET /v1/models` — 현재 사용 가능한 모델을 조회합니다.
  </Card>

  <Card title="임베딩" icon="braces" href="/en/api-reference/embeddings/create-embeddings">
    `POST /v1/embeddings` — 텍스트 벡터화입니다.
  </Card>
</CardGroup>

<Note>
  이미지 및 동영상 생성 엔드포인트용 플레이그라운드는 각각의 모델 페이지에 있습니다(위의 “Choose a Model” 아래에서 이미지 / 동영상 모델 페이지를 참조하십시오).
</Note>

## 최소 예제

가장 많이 사용하는 엔드포인트인 Chat Completions를 복사하여 실행합니다. 더 많은 매개변수와 언어를 보려면 위의 Playground 또는 콘솔의 “요청 예시”를 사용합니다:

<Tabs>
  <Tab title="Python (SDK)">
    ```python theme={null}
    from openai import OpenAI

    client = OpenAI(
        api_key="YOUR_API_KEY",
        base_url="https://api.apiyi.com/v1"
    )

    response = client.chat.completions.create(
        model="gpt-5-chat-latest",
        messages=[
            {"role": "system", "content": "You are a helpful AI assistant."},
            {"role": "user", "content": "Hello! Please introduce yourself."}
        ],
        temperature=0.7,
        max_tokens=1000
    )

    print(response.choices[0].message.content)
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={null}
    curl -X POST "https://api.apiyi.com/v1/chat/completions" \
      -H "Authorization: Bearer YOUR_API_KEY" \
      -H "Content-Type: application/json" \
      -d '{
        "model": "gpt-5-chat-latest",
        "messages": [
          {"role": "system", "content": "You are a helpful AI assistant."},
          {"role": "user", "content": "Hello! Please introduce yourself."}
        ],
        "temperature": 0.7,
        "max_tokens": 1000
      }'
    ```
  </Tab>
</Tabs>

## 스트리밍 응답

요청에 `stream: true`을 설정하면, 응답이 Server-Sent Events (SSE)로 조각 단위로 반환됩니다. 타자기 스타일 출력에 적합합니다:

```python theme={null}
stream = client.chat.completions.create(
    model="gpt-5-chat-latest",
    messages=[{"role": "user", "content": "Tell a short joke"}],
    stream=True
)

for chunk in stream:
    content = chunk.choices[0].delta.content or ""
    print(content, end="", flush=True)
```

각 SSE 줄은 `data: `로 시작하며, 마지막 줄 `data: [DONE]`가 종료를 알립니다.

## 오류 처리

엔드포인트는 OpenAI 오류 형식을 따릅니다:

```json theme={null}
{
  "error": {
    "message": "Invalid API key provided",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```

일반적인 오류 코드는 다음과 같습니다:

| 오류 코드                   | HTTP 상태 | 설명            |
| ----------------------- | ------- | ------------- |
| invalid\_api\_key       | 401     | 잘못된 API Key   |
| insufficient\_quota     | 429     | 잔액 부족         |
| model\_not\_found       | 404     | 모델이 존재하지 않습니다 |
| invalid\_request\_error | 400     | 잘못된 요청 매개변수   |
| rate\_limit\_exceeded   | 429     | 요청 빈도가 너무 높음  |
| server\_error           | 500     | 서버 내부 오류      |

<Tip>
  지수 백오프를 구현하십시오: 429 / 500에서는 간격을 두 배로 늘리며 재시도하여 안정성을 크게 높이십시오. API Key는 환경 변수에 저장하고, 절대로 하드코딩하지 마십시오.
</Tip>

위 표는 각 코드의 의미만 제공합니다. **구체적인 원인은 응답 본문의 `error.message`에 있습니다** — 그리고 그 텍스트는 API 응답에서 정확히 한 번만 반환되며, 백엔드 로그에는 보관되지 않습니다. 항상 전체를 출력하고 클라이언트 측에 저장하십시오:

<Card title="API 오류 세부 정보 캡처" icon="clipboard-list" href="/ko/api-manual/error-reporting">
  원시 오류를 직접 출력해야 하는 이유, 언어별 올바른 캡처 패턴, 보존해야 할 7개 필드, 그리고 복사-붙여넣기용 지원 티켓 템플릿
</Card>

## 요청 제한

| 제한 유형               | 기본값     | 설명                |
| ------------------- | ------- | ----------------- |
| RPM (분당 requests 수) | 3000    | API key당          |
| TPM (분당 tokens 수)   | 1000000 | API key당          |
| 동시 요청               | 100     | 동시에 처리되는 requests |

제한을 초과하면 `429`이 반환됩니다. 요청 속도를 이에 맞게 제어해 주시기 바랍니다.

## 도움이 필요하신가요?

<CardGroup cols={2}>
  <Card title="모델 선택" icon="sparkles" href="/ko/api-capabilities/model-info">
    텍스트 / 멀티모달 모델 추천 및 과금.
  </Card>

  <Card title="온라인 테스트" icon="play" href="/en/api-reference/chat/chat-completions">
    API Reference Playground을 열고 요청을 직접 전송합니다.
  </Card>
</CardGroup>

* 웹사이트 방문: [api.apiyi.com](https://api.apiyi.com)
* 기술 지원 이메일: `support@apiyi.com`
