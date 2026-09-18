> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Open WebUI

> 풍부한 기능을 갖춘 자체 호스팅 AI 인터페이스 연동 가이드

Open WebUI는 완전 오프라인 동작을 지원하는 기능이 풍부한 자체 호스팅 AI 플랫폼입니다. APIYI를 통해 Open WebUI에 다양한 주류 대규모 언어 모델을 통합할 수 있습니다.

## 빠른 배포

### Docker 빠른 시작

```bash theme={null}
docker run -d -p 3000:8080 \
  --add-host=host.docker.internal:host-gateway \
  -v open-webui:/app/backend/data \
  --name open-webui \
  --restart always \
  ghcr.io/open-webui/open-webui:main
```

### Docker Compose 배포

```yaml theme={null}
version: '3.6'

services:
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    ports:
      - "3000:8080"
    volumes:
      - open-webui:/app/backend/data
    environment:
      - OPENAI_API_BASE_URL=https://api.apiyi.com
      - OPENAI_API_KEY=Your APIYI key
    restart: unless-stopped

volumes:
  open-webui:
```

## APIYI 설정

### 방법 1: 환경 변수 설정

배포 중 환경 변수를 설정합니다:

```bash theme={null}
docker run -d -p 3000:8080 \
  -e OPENAI_API_BASE_URL=https://api.apiyi.com \
  -e OPENAI_API_KEY=Your APIYI key \
  -v open-webui:/app/backend/data \
  --name open-webui \
  ghcr.io/open-webui/open-webui:main
```

### 방법 2: 인터페이스 설정

1. Open WebUI 관리자 인터페이스에 접속합니다
2. **설정** > **연결**로 이동합니다
3. **OpenAI API** 섹션에서 설정합니다:
   * **API Base URL**: `https://api.apiyi.com/v1`
   * **API Key**: APIYI 키를 입력합니다
4. 설정을 저장합니다

<Info>
  **설정 핵심 포인트**

  * API Base URL에는 `/v1` 접미사가 포함되어야 합니다
  * API Key는 [APIYI 콘솔](https://api.apiyi.com)에서 확인할 수 있습니다
  * 더 쉽게 관리하고 업데이트하려면 환경 변수 방식을 사용하는 것이 권장됩니다
</Info>

## 지원 모델

Open WebUI는 APIYI를 통해 400개 이상의 주류 AI 모델을 지원합니다.

<Card title="지금 추천하는 모델 보기" icon="star" href="/ko/api-capabilities/model-info">
  최신 모델 추천, 성능 비교, 시나리오별 가이드 — 글쓰기, 프로그래밍, 빠른 응답, 이미지 생성, 동영상 생성 등을 포함합니다.
</Card>

<Info>
  **여기에 구체적인 모델을 나열하지 않는 이유는 무엇입니까?**

  AI 모델은 매우 빠르게 업데이트됩니다. 항상 정확한 추천을 받으실 수 있도록 모델 목록, 성능 데이터, 사용 가이드를 한곳에서 관리합니다: [모델 추천 페이지](/ko/api-capabilities/model-info).
</Info>

## 핵심 기능

### RAG (검색 증강 생성)

Open WebUI는 문서 업로드 및 지식 베이스 기능을 지원합니다.

1. **문서 업로드**
   * PDF, TXT, DOCX 및 기타 형식을 지원합니다
   * 자동 벡터화 저장
   * 다국어 문서를 지원합니다

2. **지식 베이스 관리**
   * 전문 지식 베이스를 생성합니다
   * 문서 분류 및 태깅
   * 지능형 검색 매칭

### OpenAI 호환 API

Open WebUI는 완전한 OpenAI 호환 API를 제공합니다:

```bash theme={null}
# Chat completion
curl -X POST "http://localhost:3000/api/chat/completions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer Your APIYI key" \
  -d '{
    "model": "gpt-4-turbo",
    "messages": [
      {"role": "user", "content": "Hello, world!"}
    ]
  }'
```

### 도구 통합

외부 도구 및 플러그인을 지원합니다:

* 웹 검색
* 코드 실행
* 이미지 생성
* 문서 처리

## 고급 설정

### 다중 모델 구성

`docker-compose.yml`에서 여러 모델 소스를 구성합니다:

```yaml theme={null}
environment:
  - OPENAI_API_BASE_URL=https://api.apiyi.com
  - OPENAI_API_KEY=Your APIYI key
  - ENABLE_OPENAI_API=true
  - ENABLE_OLLAMA_API=false
```

### 사용자 권한 관리

```yaml theme={null}
environment:
  - ENABLE_SIGNUP=false
  - DEFAULT_USER_ROLE=user
  - WEBHOOK_URL=Your webhook address
```

### 데이터 지속성

```yaml theme={null}
volumes:
  - open-webui:/app/backend/data
  - ./uploads:/app/backend/data/uploads
  - ./vector_db:/app/backend/data/vector_db
```

## API 통합 예시

### Python 통합

```python theme={null}
import requests

# Open WebUI API endpoint
api_url = "http://localhost:3000/api/chat/completions"

# Request configuration
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer Your APIYI key"
}

data = {
    "model": "gpt-4-turbo",
    "messages": [
        {"role": "user", "content": "Explain the basic principles of quantum computing"}
    ],
    "stream": False
}

# Send request
response = requests.post(api_url, headers=headers, json=data)
result = response.json()
print(result["choices"][0]["message"]["content"])
```

### JavaScript 통합

```javascript theme={null}
const apiUrl = 'http://localhost:3000/api/chat/completions';

const requestData = {
  model: 'gpt-4-turbo',
  messages: [
    { role: 'user', content: 'Write a simple Python function' }
  ]
};

fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer Your APIYI key'
  },
  body: JSON.stringify(requestData)
})
.then(response => response.json())
.then(data => {
  console.log(data.choices[0].message.content);
});
```

## 문제 해결

### 일반적인 문제

**연결 실패**

* API Base URL이 올바른지 확인하십시오: `https://api.apiyi.com/v1`
* API Key 유효성을 확인하십시오
* 방화벽 설정을 확인하십시오

**모델을 사용할 수 없음**

* 잔액을 확인하십시오
* 모델이 서비스 범위 내에 있는지 확인하십시오
* APIYI 서비스 상태를 확인하십시오

**업로드 실패**

* 파일 형식 지원 여부를 확인하십시오
* 충분한 저장 공간이 있는지 확인하십시오
* 파일 크기 제한을 확인하십시오

### 로그 디버깅

디버그 모드를 활성화하십시오:

```bash theme={null}
docker logs -f open-webui
```

상세 로그를 확인하십시오:

```yaml theme={null}
environment:
  - LOG_LEVEL=DEBUG
  - WEBUI_DEBUG=true
```

## 모범 사례

### 성능 최적화

1. **모델 선택**
   * 작업의 복잡도에 맞는 모델을 선택합니다
   * 모델 선택에 대한 최신 안내는 [모델 추천 페이지](/ko/api-capabilities/model-info)를 참조합니다

2. **캐싱 전략**
   * 대화 캐싱을 활성화합니다
   * 적절한 캐시 만료 시간을 설정합니다
   * 사용하지 않는 캐시는 정기적으로 정리합니다

3. **리소스 관리**
   * 메모리 사용량을 모니터링합니다
   * 적절한 동시 실행 수 제한을 설정합니다
   * 사용자 데이터를 정기적으로 백업합니다

### 보안 설정

```yaml theme={null}
environment:
  - ENABLE_ADMIN_EXPORT=false
  - ENABLE_ADMIN_CHAT_ACCESS=false
  - JWT_EXPIRES_IN=7d
```

### 모니터링 알림

모니터링 시스템을 연동합니다:

```yaml theme={null}
environment:
  - ENABLE_WEBHOOKS=true
  - WEBHOOK_URL=https://your-monitoring-url
```

더 도움이 필요하신가요? [Open WebUI 공식 문서](https://docs.openwebui.com)를 확인하거나 [APIYI 공식 웹사이트](https://api.apiyi.com)를 방문해 주십시오.
