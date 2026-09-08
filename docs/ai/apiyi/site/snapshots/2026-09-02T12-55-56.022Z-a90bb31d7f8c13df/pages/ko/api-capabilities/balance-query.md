> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 잔액 조회 API

> 계정 잔액, 사용 쿼터, 요청 횟수를 조회하여 사전적인 잔액 모니터링과 알림을 가능하게 합니다

## API 개요

Balance Query API는 총 쿼터, 사용한 쿼터, 남은 잔액, 요청 수를 포함하여 계정의 현재 쿼터 사용 현황을 가져옵니다.

이 API를 사용하면 계정 잔액을 쉽게 모니터링할 수 있어, 선제적이고 유연한 잔액 알림 관리가 가능합니다.

## 인증 토큰을 받는 방법

<Steps>
  <Step title="콘솔 액세스">
    `api.apiyi.com/account/profile`를 방문하여 프로필 페이지에 액세스합니다
  </Step>

  <Step title="시스템 토큰 찾기">
    페이지 하단의 “Account Options - System Token” 섹션을 찾습니다
  </Step>

  <Step title="액세스 토큰 생성">
    계정 비밀번호를 입력하면 이후 API 쿼리에 사용할 수 있는 액세스 토큰을 받을 수 있습니다
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/PXVoab-l7wSQlQVE/images/apiyi-system-accesstoken.png?fit=max&auto=format&n=PXVoab-l7wSQlQVE&q=85&s=eb4f48476a795dfa5bfd7cb053081bdc" alt="시스템 토큰 가져오기" width="1020" height="460" data-path="images/apiyi-system-accesstoken.png" />

## API 정보

| 항목                  | 설명                                    |
| ------------------- | ------------------------------------- |
| **API URL**         | `https://api.apiyi.com/api/user/self` |
| **Method**          | `GET`                                 |
| **Authentication**  | Authorization 헤더                      |
| **Response Format** | JSON                                  |

## 요청 세부 정보

### 요청 헤더

| 헤더 이름           | 필수  | 설명                        |
| --------------- | --- | ------------------------- |
| `Authorization` | 예   | API 액세스 토큰, 형식: 직접 토큰 문자열 |
| `Accept`        | 아니요 | 권장: `application/json`    |
| `Content-Type`  | 아니요 | 권장: `application/json`    |

### 요청 매개변수

<Info>
  이것은 GET 요청이며 **요청 본문 매개변수는** 필요하지 않습니다.
</Info>

## 응답 세부정보

### 성공 응답 예시

```json theme={null}
{
  "success": true,
  "message": null,
  "data": {
    "id": 19489,
    "username": "testnano",
    "display_name": "testnano",
    "role": 1,
    "status": 1,
    "email": "",
    "quota": 24997909,
    "used_quota": 10027091,
    "request_count": 339,
    "group": "ceshi",
    "aff_code": "ZM0H",
    "inviter_id": 0,
    "access_token": "...",
    "ModelFixedPrice": [...]
  }
}
```

### 주요 응답 필드

| Field Name             | Type | Description                     |
| ---------------------- | ---- | ------------------------------- |
| `success`              | 불리언  | 요청이 성공했는지 여부                    |
| `message`              | 문자열  | 오류 메시지 (성공 시 null)              |
| `data.username`        | 문자열  | 사용자 이름                          |
| `data.display_name`    | 문자열  | 표시 이름                           |
| `data.quota`           | 정수   | **남은 쿼터** (현재 사용 가능한 잔액, 쿼터 단위) |
| `data.used_quota`      | 정수   | **사용한 쿼터** (쿼터 단위)              |
| `data.request_count`   | 정수   | **총 요청 수**                      |
| `data.group`           | 문자열  | 사용자 그룹                          |
| `data.ModelFixedPrice` | 배열   | 모델 요금 목록 (무시해도 됨)               |

### 쿼터 변환

<Card title="변환 규칙" icon="calculator">
  500,000 quota = \$1.00 USD
</Card>

**계산 공식:**

* USD 금액 = quota ÷ 500,000
* 남은 쿼터 = quota (quota는 현재 남은 잔액을 나타냄)
* 남은 USD = quota ÷ 500,000

**예시:**

* `quota: 24997909` → \$49.99 USD (현재 남은 잔액)
* `used_quota: 10027091` → \$20.05 USD (사용한 금액)

## 오류 응답

### HTTP 401 - 인증 실패

```json theme={null}
{
  "success": false,
  "message": "Unauthorized"
}
```

**Reason:** Authorization token이 유효하지 않거나 만료되었습니다

**Solution:** API token을 확인하고 업데이트하십시오

### HTTP 403 - 권한 거부

```json theme={null}
{
  "success": false,
  "message": "Forbidden"
}
```

**Reason:** 현재 token에는 이 API에 접근할 권한이 없습니다

**Solution:** 관리자에게 문의하여 권한 설정을 확인하십시오

## 코드 예제

### cURL 예제

```bash theme={null}
curl --compressed 'https://api.apiyi.com/api/user/self' \
  -H 'Accept: application/json' \
  -H 'Authorization: YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json'
```

<Warning>
  **중요:** `--compressed` 옵션은 API가 gzip 압축된 콘텐츠를 반환하므로 필요합니다. 그렇지 않으면 깨진 출력이 표시됩니다.
</Warning>

**빠른 테스트(YOUR\_TOKEN\_HERE로 바꾸세요):**

```bash theme={null}
export APIYI_TOKEN='YOUR_TOKEN_HERE'

curl --compressed -s 'https://api.apiyi.com/api/user/self' \
  -H 'Accept: application/json' \
  -H "Authorization: $APIYI_TOKEN" \
  -H 'Content-Type: application/json' | \
  jq '.data | {quota, used_quota, request_count}'
```

<Info>
  참고: `-s` 옵션은 진행 표시줄을 숨기고, `--compressed`은 gzip 응답을 자동으로 압축 해제합니다
</Info>

### Python 예제(기본)

```python theme={null}
import requests

# Configuration
url = "https://api.apiyi.com/api/user/self"
authorization = "YOUR_TOKEN_HERE"  # Replace with your token

# Request headers
headers = {
    'Accept': 'application/json',
    'Authorization': authorization,
    'Content-Type': 'application/json'
}

# Send request
response = requests.get(url, headers=headers, timeout=10)

# Check response
if response.status_code == 200:
    data = response.json()
    user_data = data['data']

    # Extract key information
    quota = user_data['quota']
    used_quota = user_data['used_quota']
    request_count = user_data['request_count']

    # Calculate USD amounts (note: quota represents current remaining balance)
    remaining_usd = quota / 500000
    used_usd = used_quota / 500000

    # Print results
    print(f"Remaining quota: ${remaining_usd:.2f} USD ({quota:,} quota)")
    print(f"Used: ${used_usd:.2f} USD ({used_quota:,} quota)")
    print(f"Request count: {request_count:,} times")
else:
    print(f"Request failed: HTTP {response.status_code}")
    print(response.text)
```

### Python 예제(최적화)

이 예제는 기본 예제에 다음 내용을 추가합니다:

<CardGroup cols={2}>
  <Card title="오류 처리" icon="shield-check">
    완전한 예외 처리와 오류 캡처
  </Card>

  <Card title="환경 변수" icon="lock">
    안전한 token 관리, 하드코딩 방지
  </Card>

  <Card title="서식 있는 출력" icon="table">
    보기 좋은 표 표시와 숫자 서식 지정
  </Card>

  <Card title="자동 변환" icon="calculator">
    자동 USD 금액 계산
  </Card>
</CardGroup>

아래 코드를 `quota.py`로 저장하면 바로 실행할 수 있습니다:

```python theme={null}
import os
import sys

import requests

URL = "https://api.apiyi.com/api/user/self"
QUOTA_PER_USD = 500_000


def fetch_quota(token):
    """Query the account balance and return the data field."""
    headers = {
        "Accept": "application/json",
        "Authorization": token,
        "Content-Type": "application/json",
    }
    try:
        resp = requests.get(URL, headers=headers, timeout=10)
    except requests.exceptions.Timeout:
        sys.exit("Request timed out, please check your network and retry")
    except requests.exceptions.RequestException as exc:
        sys.exit(f"Request failed: {exc}")

    if resp.status_code == 401:
        sys.exit("Authentication failed: token invalid or expired, regenerate it in the console")
    if resp.status_code != 200:
        sys.exit(f"Request failed: HTTP {resp.status_code}\n{resp.text[:200]}")

    body = resp.json()
    if not body.get("success"):
        sys.exit(f"API error: {body.get('message')}")
    return body["data"]


def report(data):
    quota = data.get("quota", 0)
    used = data.get("used_quota", 0)
    count = data.get("request_count", 0)

    print("=" * 60)
    print("📊 APIYI Account Balance")
    print("=" * 60)
    print(f"Username: {data.get('username')} ({data.get('display_name')})")
    print("-" * 60)
    print(f"Remaining: {quota:,} quota (${quota / QUOTA_PER_USD:.2f} USD)")
    print(f"Used:      {used:,} quota (${used / QUOTA_PER_USD:.2f} USD)")
    print(f"Requests:  {count:,}")
    print("=" * 60)
    print(f"💡 Conversion: {QUOTA_PER_USD:,} quota = $1.00 USD")
    print("=" * 60)


if __name__ == "__main__":
    # Prefer the command-line argument, fall back to the environment variable,
    # so the token never has to be hardcoded
    token = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("APIYI_TOKEN")
    if not token:
        sys.exit("Provide a token: set APIYI_TOKEN, or pass it as the first argument")
    report(fetch_quota(token))
```

**사용법:**

```bash theme={null}
# Method 1: Using environment variable (recommended)
export APIYI_TOKEN='YOUR_TOKEN_HERE'
python quota.py

# Method 2: Command line argument
python quota.py 'YOUR_TOKEN_HERE'
```

**출력 예시:**

```
============================================================
📊 APIYI Account Balance Information
============================================================
Username: testnano (testnano)
------------------------------------------------------------
Remaining quota: 24,997,909 quota ($49.99 USD)
Used:           10,027,091 quota ($20.05 USD)
Request count: 339 times
============================================================
💡 Conversion: 500,000 quota = $1.00 USD
============================================================
```

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="Authorization token은 어떻게 발급받습니까?">
    위의 「Authorization token을 얻는 방법」 섹션을 참고하시거나, 콘솔의 프로필 페이지에서 시스템 token을 얻으시기 바랍니다.
  </Accordion>

  <Accordion title="잔액 조회는 쿼터를 소모합니까?">
    아니요, 잔액 조회 API는 쿼터를 소모하지 않습니다.
  </Accordion>

  <Accordion title="잔액은 얼마나 자주 조회할 수 있습니까?">
    요청 제한을 피하려면 조회 간격은 최소 1초로 권장합니다.
  </Accordion>

  <Accordion title="ModelFixedPrice 필드는 무엇을 위한 것입니까?">
    이 필드는 다양한 AI 모델의 요금 정보를 반환합니다. 잔액 정보만 필요하다면 무시하셔도 됩니다.
  </Accordion>

  <Accordion title="quota 필드는 무엇을 의미합니까?">
    `quota` 필드는 현재 남은 잔액을 나타냅니다. `quota`가 0이거나 0에 가까우면 계정 잔액이 부족하여 충전이 필요합니다.
  </Accordion>

  <Accordion title="curl이 깨진 텍스트를 반환하거나 jq가 오류를 보고하는 이유는 무엇입니까?">
    **문제:** curl을 실행하면 깨진 텍스트가 반환되거나 jq가 "Invalid numeric literal"을 보고합니다

    **원인:** API가 gzip 압축 콘텐츠(`Content-Encoding: gzip`)를 반환하며, curl은 이를 자동으로 압축 해제하지 않습니다.

    **해결:** curl이 자동으로 압축 해제하도록 `--compressed` 옵션을 추가합니다:

    ```bash theme={null}
    # ✅ Correct (with --compressed)
    curl --compressed 'https://api.apiyi.com/api/user/self' \
      -H 'Authorization: YOUR_TOKEN' | jq

    # ❌ Wrong (missing --compressed)
    curl 'https://api.apiyi.com/api/user/self' \
      -H 'Authorization: YOUR_TOKEN' | jq
    ```
  </Accordion>
</AccordionGroup>

## 중요 참고 사항

<Warning>
  **보안 유의 사항**

  * 코드에 Authorization token을 하드코딩하지 마십시오
  * 민감한 정보를 관리할 때는 환경 변수 또는 설정 파일을 사용하십시오
  * token이 포함된 코드를 공개 저장소에 커밋하지 마십시오
</Warning>

<Info>
  **요청 제한**

  * 적절한 요청 timeout을 설정하십시오(권장: 10초)
  * 지나치게 빈번한 쿼리 요청을 피하십시오
</Info>

<Card title="예외 처리 권장 사항" icon="bug">
  * 네트워크 예외, timeout, 인증 실패를 항상 처리하십시오
  * 문제 해결을 쉽게 하기 위해 오류를 로그에 남기십시오
</Card>

<Card title="응답 형식 참고 사항" icon="file-code">
  * API는 gzip으로 압축된 콘텐츠를 반환합니다. curl은 `--compressed` 옵션이 필요합니다
  * Python의 requests 라이브러리는 추가 설정 없이 gzip 압축 해제를 자동으로 처리합니다
</Card>
