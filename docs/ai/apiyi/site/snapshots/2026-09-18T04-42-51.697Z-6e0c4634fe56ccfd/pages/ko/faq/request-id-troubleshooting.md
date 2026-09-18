> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 요청 ID는 어디에서 확인할 수 있나요?

> API 유형별 응답 헤더 또는 본문에서 요청 ID를 확인하고, 요청 ID와 비동기 작업 ID를 구분합니다.

## 간단한 답변

API 호출을 문제 해결할 때는 먼저 **모델 이름, 엔드포인트 및 호출 시간**을 기록합니다. 그런 다음 HTTP 응답 헤더에서 `x-request-id` 또는 `request-id`을 확인합니다. 엔드포인트에서 오류 응답을 반환하는 경우에는 JSON 본문에서 `request_id`와 같은 식별자도 확인하고, APIYI 로그에서 찾을 수 있는 필드를 사용합니다.

Wan 및 HappyHorse 동영상 엔드포인트는 응답 본문에 `request_id`도 반환합니다. 동일한 응답의 `task_id`은 동영상 작업을 조회하는 데 사용되며 Request ID와는 다릅니다. Seedance 및 Veo와 같은 비동기 엔드포인트에서 반환되는 `id` 또는 `task_id`도 동영상 작업 ID입니다.

<Info>
  APIYI 로그 페이지에서는 “요청 ID / 업스트림 요청 ID / 완료 ID” 필터에 표시되는 식별자를 검색할 수 있습니다. 콘솔에서 로그 세부 정보를 열고 사용자가 제공한 식별자로 검색합니다.
</Info>

## 다음 세 단계로 시작합니다

<Steps>
  <Step title="1단계: 모델과 엔드포인트를 확인합니다">
    전체 모델 이름과 실제 URL을 기록합니다. 텍스트 모델은 일반적으로 `/v1/chat/completions`을 사용하고, 임베딩 모델은 `/v1/embeddings`를 사용하며, 이미지 모델은 `/v1/images/generations`을 사용할 수 있고, 동영상 모델은 `/v1/videos` 또는 모델별 비동기 엔드포인트를 사용할 수 있습니다.
  </Step>

  <Step title="2단계: 호출 시간을 기록합니다">
    요청을 보낸 시간을 기록하고 시간대를 포함합니다. 예: 2026-08-25 14:32 (UTC+8). 요청을 재시도한 경우 각 재시도의 대략적인 시간을 기록합니다.
  </Step>

  <Step title="3단계: 응답과 로그 세부 정보를 저장합니다">
    HTTP 상태 코드, 전체 응답 헤더, 전체 응답 본문 및 클라이언트 예외를 저장합니다. 그런 다음 APIYI “로그” 페이지를 열고 요청 ID, 업스트림 요청 ID 또는 완료 ID로 검색합니다.
  </Step>
</Steps>

## API 유형별 Request ID 확인 위치

| API 유형               | 먼저 확인할 위치                                                            | 혼동하지 말아야 할 필드                                                                                               |
| -------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 텍스트 / 채팅 모델          | 일반적으로 HTTP 응답 헤더의 `x-request-id` 또는 `request-id`를 확인하고, 오류 본문도 검사합니다 | 본문의 `id`는 APIYI Request ID가 아니라 Completion ID일 수 있습니다                                                       |
| 이미지 모델               | 일반적으로 HTTP 응답 헤더의 `x-request-id` 또는 `request-id`를 확인하고, 오류 본문도 검사합니다 | 이름만으로 이미지 응답 객체 ID를 APIYI Request ID로 식별하지 마십시오                                                             |
| 임베딩 모델               | 실제 응답 헤더를 먼저 확인하고, 오류 본문도 검사합니다                                      | 현재 임베딩 예시는 주로 `data[].embedding`를 표시하며, 문서에서는 하나의 범용 Request ID 필드 위치를 정의하지 않습니다                            |
| Wan / HappyHorse 동영상 | 응답 본문의 `request_id` 및 응답 헤더                                          | `output.task_id`는 폴링에 사용되는 동영상 작업 ID입니다                                                                     |
| Seedance 동영상         | 응답 헤더의 **`X-Shellapi-Request-Id`**; 최상위 본문의 `id`도 별도로 저장합니다          | 최상위 `id`는 Request ID가 아닌 동영상 작업 ID이며, `X-Request-Id` 헤더는 제공업체 측 요청 ID로 APIYI 로그에서 찾을 수 없습니다(2026-09-15 검증됨) |
| Veo 및 기타 비동기 동영상 API | 엔드포인트가 Request ID를 반환하는 경우 응답 헤더 값을 먼저 기록하고, 작업 필드도 저장합니다            | 본문의 `id` / `task_id`는 동영상 작업 ID입니다                                                                          |

<Warning>
  HTTP 헤더 이름은 대소문자를 구분하지 않지만 필드 이름의 구분자는 중요합니다. `x-request-id`, `request-id`, `request_id`은 서로 다른 표기입니다. 하나의 필드 이름만 검색하지 말고 응답 헤더와 오류 본문을 모두 확인하십시오.
</Warning>

## 코드에서 확인하기

### Python

```python theme={null}
import requests

response = requests.post(
    "https://api.apiyi.com/v1/chat/completions",
    headers={
        "Authorization": "Bearer YOUR_API_KEY",
        "Content-Type": "application/json",
    },
    json={
        "model": "YOUR_MODEL",
        "messages": [{"role": "user", "content": "Test request"}],
    },
    timeout=60,
)

header_request_id = (
    response.headers.get("x-request-id")
    or response.headers.get("request-id")
)

try:
    body = response.json()
except ValueError:
    body = {}

# Use body.request_id only as a candidate; do not treat body.id as the APIYI Request ID automatically.
request_id = header_request_id or body.get("request_id")

print("status:", response.status_code)
print("request_id:", request_id)
print("body:", response.text)
```

### cURL

`-i`을 사용하여 응답 헤더와 응답 본문을 모두 출력합니다. 헤더에서 `x-request-id` 또는 `request-id`를 확인합니다.

```bash theme={null}
curl -i "https://api.apiyi.com/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "YOUR_MODEL",
    "messages": [{"role": "user", "content": "Test request"}]
  }'
```

Wan 또는 HappyHorse 동영상 호출의 경우 본문 필드 두 개도 저장합니다.

```python theme={null}
body = response.json()
request_id = body.get("request_id")
task_id = body.get("output", {}).get("task_id")
```

## 콘솔 로그 검색

<Steps>
  <Step title="호출 로그 열기">
    APIYI 콘솔에 로그인하고 “로그”를 연 다음, 조사하려는 호출의 세부 정보를 엽니다.
  </Step>

  <Step title="사용 가능한 식별자 입력">
    식별자를 “Request ID / Upstream Request ID / Completion ID” 필터에 붙여 넣습니다. APIYI 응답 헤더의 Request ID를 우선 사용하고, 사용할 수 없는 경우 Upstream Request ID 또는 Completion ID를 시도합니다.
  </Step>

  <Step title="세부 정보 비교">
    모델, 호출 시간, 엔드포인트, 채널, HTTP 상태, 오류 코드 및 과금 기록을 비교하여 요청이 APIYI에 도달했는지, 업스트림 제공업체에 도달했는지, 요청을 변경한 후 재시도해야 하는지를 판단합니다.
  </Step>
</Steps>

<Tip>
  사용자가 대략적인 실패 시간만 알고 있더라도 모델, 엔드포인트 및 시간으로 검색 범위를 좁힐 수 있습니다. Request ID를 사용하면 일반적으로 단일 호출을 훨씬 빠르게 식별할 수 있습니다.
</Tip>

## Request ID가 없을 수 있는 이유는 무엇인가요?

HTTP 응답을 받기 전에 요청이 실패하는 경우(예: DNS 확인, TCP/TLS 연결 설정, 로컬 프록시 거부 또는 클라이언트 측 연결 시간 초과) APIYI는 응답 헤더를 반환할 기회가 없습니다. 이 경우 클라이언트에서 사용할 수 있는 Request ID가 없습니다.

대신 다음 정보를 제공해 주세요:

* 원본 클라이언트 예외와 전체 스택 트레이스;
* 요청 시간과 시간대;
* 모델과 엔드포인트;
* HTTP 클라이언트, 프록시 또는 네트워크 환경;
* 가능한 경우 성공했거나 재시도한 호출의 Request ID.

<Warning>
  문제 해결 자료에 전체 API 키를 전송하지 마세요. 키 중간 부분을 마스킹하고, 전체 비즈니스 콘텐츠나 이미지가 포함된 비공개 데이터 또는 요청 본문을 노출하지 마세요.
</Warning>

## 고객 지원팀에 제공할 정보

* 요청 ID
* 로그에 표시되는 경우 업스트림 요청 ID 또는 완료 ID
* 모델 이름 및 엔드포인트
* 시간대를 포함한 호출 시간
* HTTP 상태, 전체 응답 본문 및 클라이언트 예외
* 마스킹한 요청과 콘솔 로그에 표시된 오류 코드 및 과금 상태

## 관련 문서

<CardGroup cols={2}>
  <Card title="모델 오류를 어떻게 해결합니까?" icon="alert-triangle" href="/ko/faq/model-error-troubleshooting">
    매개변수, 그룹, 시간 초과 및 모델 오류 해결
  </Card>

  <Card title="호출 로그를 어떻게 확인합니까?" icon="file-text" href="/ko/faq/call-logs">
    콘솔에서 API 호출, 오류 및 과금 세부 정보 확인
  </Card>

  <Card title="로그 쿼리 API" icon="search" href="/ko/api-capabilities/log-query">
    시간, 모델 또는 request\_id로 호출 로그 쿼리
  </Card>

  <Card title="이미지 API 모범 사례" icon="image" href="/ko/api-capabilities/image-api-best-practices">
    이미지 시간 초과, 연결 끊김, 과금 및 요청 ID 문제 해결
  </Card>
</CardGroup>
