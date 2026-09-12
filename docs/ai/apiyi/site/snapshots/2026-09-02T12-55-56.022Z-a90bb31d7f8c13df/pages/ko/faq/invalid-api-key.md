> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 내 API Key가 유효하지 않은 이유는?

> API Key 유효하지 않음 오류를 해결하고 Base URL과 API Key의 올바른 설정 방법을 알아보십시오

## 일반적인 오류 증상

다음과 같은 오류 메시지를 보면:

```json theme={null}
{
  "error": {
    "message": "Incorrect API key provided: sk-QqHvK***...",
    "type": "invalid_request_error",
    "code": "invalid_api_key"
  }
}
```

이는 일반적으로 API 키가 잘못되었다는 뜻이 **아니라**, **기본 URL이 잘못 구성되었다는 뜻**입니다.

<Warning>
  **가장 흔한 실수**: APIYI의 키를 사용하면서 요청을 OpenAI의 공식 엔드포인트 `https://api.openai.com`로 보내는 것
</Warning>

## 기본 URL이란?

**기본 URL** (Base URL / 요청 주소)은 API 요청의 대상 서버 주소입니다. 서로 다른 API 서비스 제공자는 서로 다른 기본 URL을 사용합니다.

### 기본 URL과 API Key는 일치해야 합니다

| 서비스 제공자             | Base URL                 | API Key 형식      | 일치 여부     |
| ------------------- | ------------------------ | --------------- | --------- |
| **APIYI**           | `https://api.apiyi.com`  | `sk-xxxx......` | ✅ 올바름     |
| **OpenAI Official** | `https://api.openai.com` | `sk-xxxx......` | ✅ 올바름     |
| ❌ APIYI Key         | `https://api.openai.com` | `sk-xxxx......` | ❌ **잘못됨** |
| ❌ OpenAI Key        | `https://api.apiyi.com`  | `sk-xxxx......` | ❌ **잘못됨** |

<Info>
  **핵심 원칙**: API Key 제공자와 일치하는 Base URL을 사용해야 합니다.
</Info>

## 올바른 설정

### 방법 1: Base URL 수정(권장)

OpenAI 엔드포인트를 APIYI의 것으로 바꾸고, 나머지는 그대로 두면 됩니다:

<CodeGroup>
  ```python Python theme={null}
  from openai import OpenAI

  client = OpenAI(
      api_key="sk-your-apiyi-key",  # Get Key from APIYI dashboard
      base_url="https://api.apiyi.com/v1"  # Change to APIYI address
  )

  response = client.chat.completions.create(
      model="gpt-4o",
      messages=[{"role": "user", "content": "Hello"}]
  )
  ```

  ```javascript JavaScript/Node.js theme={null}
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: 'sk-your-apiyi-key',  // Get Key from APIYI dashboard
    baseURL: 'https://api.apiyi.com/v1'  // Change to APIYI address
  });

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Hello' }]
  });
  ```

  ```bash cURL theme={null}
  curl https://api.apiyi.com/v1/chat/completions \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer sk-your-apiyi-key" \
    -d '{
      "model": "gpt-4o",
      "messages": [{"role": "user", "content": "Hello"}]
    }'
  ```
</CodeGroup>

### 방법 2: 환경 변수 사용

코드에서 Base URL을 지정하지 않아도 되도록 환경 변수를 설정합니다:

<CodeGroup>
  ```bash Linux/macOS theme={null}
  export OPENAI_API_KEY="sk-your-apiyi-key"
  export OPENAI_BASE_URL="https://api.apiyi.com/v1"
  ```

  ```powershell Windows PowerShell theme={null}
  $env:OPENAI_API_KEY="sk-your-apiyi-key"
  $env:OPENAI_BASE_URL="https://api.apiyi.com/v1"
  ```

  ```cmd Windows CMD theme={null}
  set OPENAI_API_KEY=sk-your-apiyi-key
  set OPENAI_BASE_URL=https://api.apiyi.com/v1
  ```
</CodeGroup>

## 지원되는 Base URL 형식

APIYI는 코드에 따라 세 가지 Base URL 형식을 지원합니다:

<Tabs>
  <Tab title="형식 1: /v1 포함 (권장)">
    ```
    https://api.apiyi.com/v1
    ```

    **사용 사례**: 대부분의 라이브러리는 Base URL에 특정 경로를 자동으로 추가합니다

    **전체 요청 예시**:

    ```
    https://api.apiyi.com/v1/chat/completions
    https://api.apiyi.com/v1/models
    ```
  </Tab>

  <Tab title="형식 2: /v1/ 포함 (후행 슬래시)">
    ```
    https://api.apiyi.com/v1/
    ```

    **사용 사례**: 일부 프레임워크는 Base URL이 슬래시로 끝나야 합니다

    **전체 요청 예시**:

    ```
    https://api.apiyi.com/v1/chat/completions
    https://api.apiyi.com/v1/models
    ```
  </Tab>

  <Tab title="형식 3: 전체 경로">
    ```
    https://api.apiyi.com/v1/chat/completions
    ```

    **사용 사례**: 완전한 API 엔드포인트를 직접 사용하는 방식입니다(예: cURL 요청)

    <Note>
      이 방식은 일반적으로 cURL 또는 원시 HTTP 라이브러리 요청에 사용되며, Base URL을 설정할 필요가 없습니다
    </Note>
  </Tab>
</Tabs>

## 문제 해결

<AccordionGroup>
  <Accordion title="Base URL이 올바른 것은 확인했지만 여전히 오류가 발생합니다">
    **가능한 원인**:

    1. **여러 설정 위치**: 설정 파일, 환경 변수, 코드 초기화 등에서 Base URL이 설정되어 있는지 확인하십시오.
    2. **프록시 또는 미들웨어**: 일부 프록시 도구는 요청을 리디렉션할 수 있습니다.
    3. **캐시 문제**: 프로그램을 다시 시작하거나 캐시를 지운 뒤 다시 시도하십시오.
    4. **오타**: `apiyi`의 철자가 올바른지 확인하십시오(`apiyii` 또는 `apiyl`가 아님).
  </Accordion>

  <Accordion title="Key가 유효한지 어떻게 확인합니까?">
    APIYI 대시보드에서 확인하십시오:

    1. APIYI 대시보드에 로그인하십시오 `console.apiyi.com`
    2. "Tokens" 페이지로 이동하십시오
    3. Key 상태가 "Enabled"인지 확인하십시오
    4. 계정에 충분한 잔액이 있는지 확인하십시오
  </Accordion>

  <Accordion title="서드파티 도구(예: ChatBox, OpenCat)는 어떻게 구성합니까?">
    대부분의 서드파티 도구에는 "Custom API" 또는 "Self-hosted Server" 옵션이 있습니다:

    * **API Address / Base URL**: `https://api.apiyi.com/v1`
    * **API Key**: APIYI 대시보드에서 Key를 복사하십시오
    * **Model Name**: APIYI 문서의 모델 목록을 참조하십시오

    <Tip>
      구성 옵션은 보통 "Settings" → "API" 또는 "Server" 섹션에서 찾을 수 있습니다
    </Tip>
  </Accordion>

  <Accordion title="코드 예제는 어디에서 찾을 수 있습니까?">
    APIYI는 여러 언어로 된 완전한 코드 예제를 제공합니다:

    1. **빠른 시작 문서**: 홈페이지 → 코드 예제
    2. **온라인 테스트 도구**: 대시보드 → ApiFox 온라인 테스트
    3. **GitHub 저장소**: `github.com/apiyi/docs` → 지식 베이스 디렉터리
  </Accordion>
</AccordionGroup>

## 잘못된 예시 vs 올바른 예시

<CardGroup cols={2}>
  <Card title="❌ 잘못된 설정" icon="x" color="#ef4444">
    ```python theme={null}
    client = OpenAI(
        api_key="sk-apiyi-key",
        base_url="https://api.openai.com/v1"
        # ❌ Using OpenAI official endpoint
    )
    ```

    **결과**: OpenAI 서버는 APIYI의 키를 거부합니다
  </Card>

  <Card title="✅ 올바른 설정" icon="check" color="#10b981">
    ```python theme={null}
    client = OpenAI(
        api_key="sk-apiyi-key",
        base_url="https://api.apiyi.com/v1"
        # ✅ Using APIYI endpoint
    )
    ```

    **결과**: 요청이 APIYI 서버로 성공적으로 전송됩니다
  </Card>
</CardGroup>

## 빠른 테스트 방법

cURL 명령을 사용하여 구성을 빠르게 확인합니다:

```bash theme={null}
curl https://api.apiyi.com/v1/models \
  -H "Authorization: Bearer sk-your-apiyi-key"
```

**예상 결과**: 사용 가능한 모델 목록을 반환합니다

```json theme={null}
{
  "data": [
    {
      "id": "gpt-4o",
      "object": "model",
      ...
    }
  ]
}
```

오류가 발생하면 다음을 확인합니다:

1. API Key가 올바르게 복사되었는지 확인합니다(앞뒤 공백에 주의합니다)
2. 네트워크 연결이 작동하는지 확인합니다
3. 계정 잔액이 충분한지 확인합니다

## 관련 문서

* [빠른 시작 가이드](/ko/getting-started)
* [API 매뉴얼](/ko/api-manual)
* [잔액이 남아 있는데도 API를 사용할 수 없는 이유는 무엇입니까?](/ko/faq/balance-insufficient)
* [지원 모델 목록](/ko/api-capabilities/model-info)

<Tip>
  **핵심 원칙을 기억하십시오**: URL을 Key 공급자에 맞추십시오. APIYI의 Key는 `https://api.apiyi.com/v1`
</Tip>
