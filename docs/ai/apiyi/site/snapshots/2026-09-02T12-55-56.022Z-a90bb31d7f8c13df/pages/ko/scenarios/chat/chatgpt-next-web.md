> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# ChatGPT Next Web

> 원클릭 배포 웹 기반 ChatGPT 통합 가이드

ChatGPT Next Web은 원클릭 배포와 여러 AI 모델을 지원하는, 세심하게 설계된 ChatGPT 웹 클라이언트입니다.

## 빠른 배포

### Vercel 원클릭 배포

1. [원클릭 배포](https://vercel.com/new/clone?repository-url=https://github.com/Yidadaa/ChatGPT-Next-Web)를 클릭합니다
2. 환경 변수를 설정합니다:
   * `OPENAI_API_KEY`: APIYI 키
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

## 구성 안내

### 기본 구성

설정 페이지에서 구성합니다:

* **API Key**: APIYI 키를 입력합니다
* **API Address**: `https://api.apiyi.com`

### Non-OpenAI 모델

Claude, Gemini와 같은 모델의 경우:

1. “Custom Models”에 추가합니다
2. 형식: `+model-name@OpenAI`
3. 예시: `+claude-3-opus-20240229@OpenAI`

## 핵심 기능

### 프리셋 프롬프트

내장된 다양한 프롬프트 템플릿입니다

### 마스크 기능

미리 설정된 AI 역할을 생성합니다

### 대화 내보내기

Markdown, 이미지, PDF 형식을 지원합니다

### 접근 제어

애플리케이션에 비밀번호 보호를 설정합니다

## 환경 변수

```bash theme={null}
# API Configuration
OPENAI_API_KEY=Your APIYI key
BASE_URL=https://api.apiyi.com

# Access Control
CODE=Your access password

# Model Configuration
DEFAULT_MODEL=gpt-3.5-turbo
CUSTOM_MODELS=+claude-3-opus-20240229@OpenAI
```

## 사용 팁

### 모델 선택 전략

| 작업 유형    | 권장 모델         | 이유           |
| -------- | ------------- | ------------ |
| 일상 대화    | GPT-3.5-Turbo | 빠르고 경제적입니다   |
| 복잡한 추론   | GPT-4         | 정확도가 높습니다    |
| 창의적 글쓰기  | Claude 3      | 창의성이 뛰어납니다   |
| 코드 프로그래밍 | GPT-4         | 논리 능력이 뛰어납니다 |

### 프롬프트 최적화

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
