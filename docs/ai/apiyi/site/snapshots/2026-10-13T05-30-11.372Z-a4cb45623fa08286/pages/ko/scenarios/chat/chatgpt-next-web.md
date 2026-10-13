> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# ChatGPT Next Web

> 원클릭 배포 웹 기반 ChatGPT 통합 가이드

ChatGPT Next Web은 원클릭 배포와 여러 AI 모델을 지원하는, 세심하게 설계된 ChatGPT 웹 클라이언트입니다.

## 빠른 배포

### Vercel 원클릭 배포

1. 원클릭 배포 페이지를 엽니다: `vercel.com/new/clone?repository-url=https://github.com/Yidadaa/ChatGPT-Next-Web`
2. 환경 변수를 설정합니다:
   * `OPENAI_API_KEY`: 사용자의 APIYI 키
   * `BASE_URL`: `https://api.apiyi.com`
3. 배포를 완료합니다

### Docker 배포

```bash theme={null}
docker run -d \
  --name chatgpt-next-web \
  -p 3000:3000 \
  -e OPENAI_API_KEY="Your APIYI key" \
  -e BASE_URL="https://api.apiyi.com" \
  yidadaa/chatgpt-next-web
```

## 설정 안내

### 기본 설정

설정 페이지에서 다음과 같이 설정합니다:

* **API 키**: APIYI 키를 입력합니다
* **API 주소**: `https://api.apiyi.com`

### 비 OpenAI 모델

Claude, Gemini와 같은 모델의 경우:

1. "사용자 지정 모델"에 추가합니다
2. 형식: `+model-name@OpenAI`
3. 예시: `+claude-opus-5@OpenAI`

## 핵심 기능

### 프리셋 프롬프트

내장된 다양한 프롬프트 템플릿입니다

### 마스크 기능

미리 설정된 AI 역할을 생성합니다

### 대화 내보내기

Markdown, 이미지, PDF 형식을 지원합니다

### 접근 제어

애플리케이션에 비밀번호 보호를 설정합니다

## Environment Variables

```bash theme={null}
# API Configuration
OPENAI_API_KEY=Your APIYI key
BASE_URL=https://api.apiyi.com

# Access Control
CODE=Your access password

# Model Configuration
DEFAULT_MODEL=gpt-5.4-mini
CUSTOM_MODELS=+claude-opus-5@OpenAI
```

## 사용 팁

### 모델 선택 전략

<Card title="현재 사람들이 많이 사용하는 모델 확인하기" icon="star" href="/ko/api-capabilities/model-info">
  글쓰기, 코딩, 이미지 생성 및 동영상 생성을 아우르는 최신 모델 추천, 성능 비교 및 시나리오별 가이드를 제공합니다.
</Card>

### Prompt 최적화

```markdown theme={null}
# Role Setting
You are an experienced [specific role]

# Task Description
Please help me [specific task]

# Output Requirements
- Requirement 1
- Requirement 2
```

## 일반적인 문제

### 모델이 표시되지 않음

v2.13.0+ 버전을 사용 중인지 확인하십시오.

### 연결 실패

API 주소를 확인하십시오: `https://api.apiyi.com`

### 응답이 중단됨

계정 잔액과 네트워크 연결을 확인하십시오.

## 업데이트 유지보수

### Vercel 업데이트

GitHub에서 포크를 동기화하면 Vercel이 자동으로 다시 배포합니다

### Docker 업데이트

```bash theme={null}
docker pull yidadaa/chatgpt-next-web
docker stop chatgpt-next-web
docker rm chatgpt-next-web
# Re-run container
```


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.