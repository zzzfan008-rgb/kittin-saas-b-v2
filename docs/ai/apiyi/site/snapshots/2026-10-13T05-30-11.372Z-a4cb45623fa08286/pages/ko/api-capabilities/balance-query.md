> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 잔액 조회 API

> 계정 잔액, 사용 쿼터, 요청 횟수를 조회하여 사전적인 잔액 모니터링과 알림을 가능하게 합니다

## API 개요

Balance Query API는 총 쿼터, 사용한 쿼터, 남은 잔액, 요청 수를 포함하여 계정의 현재 쿼터 사용 현황을 가져옵니다.

이 API를 사용하면 계정 잔액을 쉽게 모니터링할 수 있어, 선제적이고 유연한 잔액 알림 관리가 가능합니다.

## Authorization Token 발급 방법

이 API는 **개인 액세스 token**(`nap_`로 시작)으로 인증합니다. 모델 호출에 사용하는 API Key와는 다릅니다.

<Steps>
  <Step title="개인 액세스 Tokens 열기">
    `api.apiyi.com/account/profile`의 프로필 페이지로 이동합니다. **계정 옵션**에서 **개인 액세스 Tokens** → **Token 생성**을 클릭합니다.
  </Step>

  <Step title="권한 선택">
    이 API에는 **Profile · Read** 권한만 필요합니다. 기본 유효 기간은 30일이므로 더 긴 기간을 선택하는 것을 권장합니다.
  </Step>

  <Step title="token 저장">
    token이 생성된 직후 복사하여 `Authorization` 헤더에 설정합니다.
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/xTqEgFERWX-o_x6Q/images/personal-access-token-create.png?fit=max&auto=format&n=xTqEgFERWX-o_x6Q&q=85&s=db4eacd9f8f57ee95018d609b062e78a" alt="개인 액세스 token 생성: 이름, 유효 기간, IP 허용 목록 및 권한" width="900" height="1244" data-path="images/personal-access-token-create.png" />

<Warning>
  **기존 시스템 tokens는 2026-11-11 (UTC+8)에 폐기될 예정입니다.** “계정 옵션 - 시스템 Token”에서 생성된 AccessTokens는 그때까지 계속 작동합니다. 해당 날짜 이후에는 401 `ACCESS_TOKEN_LEGACY_RETIRED`을 반환합니다.
  사용량을 검토하여 일정을 연장할 수도 있지만, 지금 개인 액세스 token으로 전환하는 것을 권장합니다. 헤더 값만 교체하면 되며, 기존 코드는 그대로 유지됩니다.
  유효 기간, IP 허용 목록 및 권한에 대한 자세한 내용은 [개인 액세스 token이란 무엇인가요?](/ko/faq/personal-access-token)를 참고하시기 바랍니다.
</Warning>

## API 정보

| 항목 | 설명 |
| - | - |
| **API URL** | `https://api.apiyi.com/api/user/self` |
| **메서드** | `GET` |
| **인증** | Authorization 헤더 (개인 액세스 token, `Bearer ` 접두사는 선택 사항입니다) |
| **응답 형식** | JSON |

## 요청 상세 정보

### 요청 헤더

| 헤더 이름 | 필수 여부 | 설명 |
| - | - | - |
| `Authorization` | 예 | 일반 문자열 형태의 개인 액세스 token |
| `Accept` | 아니요 | 권장: `application/json` |
| `Content-Type` | 아니요 | 권장: `application/json` |

### 요청 파라미터

<Info>
  이 요청은 GET 요청이며 요청 본문 파라미터가 **필요하지 않습니다**.
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

| Field Name | Type | Description |
| - | - | - |
| `success` | 불리언 | 요청이 성공했는지 여부 |
| `message` | 문자열 | 오류 메시지 (성공 시 null) |
| `data.username` | 문자열 | 사용자 이름 |
| `data.display_name` | 문자열 | 표시 이름 |
| `data.quota` | 정수 | **남은 쿼터** (현재 사용 가능한 잔액, 쿼터 단위) |
| `data.used_quota` | 정수 | **사용한 쿼터** (쿼터 단위) |
| `data.request_count` | 정수 | **총 요청 수** |
| `data.group` | 문자열 | 사용자 그룹 |
| `data.ModelFixedPrice` | 배열 | 모델 요금 목록 (무시해도 됨) |

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

**원인:** token이 유효하지 않거나 만료되었거나 삭제되었습니다. 계정 비밀번호, 2단계 인증 또는 패스키를 변경하면 모든 개인 액세스 token이 무효화됩니다.

**해결 방법:** 콘솔에서 새 개인 액세스 token을 생성하십시오.

다른 두 가지 401 응답에는 명시적인 메시지가 포함됩니다:

| 메시지 | 원인 |
| - | - |
| `ACCESS_TOKEN_LEGACY_RETIRED` | 지원 종료된 레거시 시스템 token을 계속 사용하고 있습니다. 개인 액세스 token으로 전환하십시오. |
| `This access token may not be used from the current IP address.` | token의 허용 목록에 포함되지 않은 IP에서 요청이 발생했습니다. 허용 목록은 수정할 수 없으므로 새 token을 생성하십시오. |

### HTTP 403 - 권한 거부

```json theme={null}
{
  "code": "ACCESS_TOKEN_SCOPE_DENIED",
  "message": "This endpoint is outside this access token’s granted permissions.",
  "success": false
}
```

**원인:** 개인 액세스 token에 **Profile · Read** 권한이 없습니다.

**해결 방법:** 해당 권한을 가진 새 token을 생성하십시오. 권한은 생성 후 변경할 수 없습니다.

## 코드 예제

### cURL 예제

```bash theme={null}
curl --compressed 'https://api.apiyi.com/api/user/self' \
  -H 'Accept: application/json' \
  -H 'Authorization: YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json'
```

<Warning>
  **중요:** API가 gzip으로 압축된 콘텐츠를 반환하므로 `--compressed` 옵션이 필수적이며, 그렇지 않으면 출력이 깨져서 표시됩니다.
</Warning>

**빠른 테스트 (YOUR\_TOKEN\_HERE를 교체하십시오):**

```bash theme={null}
export APIYI_TOKEN='YOUR_TOKEN_HERE'

curl --compressed -s 'https://api.apiyi.com/api/user/self' \
  -H 'Accept: application/json' \
  -H "Authorization: $APIYI_TOKEN" \
  -H 'Content-Type: application/json' | \
  jq '.data | {quota, used_quota, request_count}'
```

<Info>
  참고: `-s` 옵션은 진행률 표시줄을 숨기며, `--compressed` 옵션은 gzip 응답의 압축을 자동으로 해제합니다.
</Info>

### Python 예제 (기본)

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

### Python 예제 (최적화)

기본 예제에 다음 사항이 추가되었습니다:

<CardGroup cols={2}>
  <Card title="오류 처리" icon="shield-check">
    완전한 예외 처리 및 오류 포착
  </Card>

  <Card title="환경 변수" icon="lock">
    안전한 토큰 관리 및 하드코딩 방지
  </Card>

  <Card title="서식화된 출력" icon="table">
    깔끔한 표 표시 및 숫자 서식 지정
  </Card>

  <Card title="자동 변환" icon="calculator">
    USD 금액 자동 계산
  </Card>
</CardGroup>

아래 코드를 `quota.py` 파일로 저장하면 바로 실행할 수 있습니다:

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
        sys.exit("Authentication failed: token invalid, expired or IP not allowlisted; create a new personal access token in the console")
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

**사용 방법:**

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
    상단의 "Authorization token 발급 방법" 단계를 따르십시오. 프로필 페이지에서 개인 액세스 token을 생성하고 "Profile · Read"를 선택하십시오. 기존 레거시 시스템 token은 2026-11-11 (UTC+8)에 폐기될 예정입니다. [개인 액세스 token이란 무엇입니까?](/ko/faq/personal-access-token)를 참조하십시오.
  </Accordion>

  <Accordion title="잔액을 조회하면 쿼터가 소모됩니까?">
    아니요, 잔액 조회 API는 쿼터를 소모하지 않습니다.
  </Accordion>

  <Accordion title="잔액은 얼마나 자주 조회할 수 있습니까?">
    요청 제한이 발생하지 않도록 최소 1초 이상의 조회 간격을 유지하는 것을 권장합니다.
  </Accordion>

  <Accordion title="ModelFixedPrice 필드는 어떤 용도입니까?">
    이 필드는 다양한 AI 모델의 가격 정보를 반환합니다. 잔액 정보만 필요한 경우에는 무시하셔도 됩니다.
  </Accordion>

  <Accordion title="quota 필드는 무엇을 나타냅니까?">
    `quota` 필드는 현재 남은 잔액을 나타냅니다. `quota`이 0이거나 0에 가까우면 계정 잔액이 부족한 상태이므로 충전이 필요합니다.
  </Accordion>

  <Accordion title="curl에서 문자가 깨져 나오거나 jq에서 오류가 발생하는 이유는 무엇입니까?">
    **문제:** curl 실행 시 문자가 깨져 출력되거나 jq에서 "Invalid numeric literal" 오류가 발생합니다.

    **원인:** API가 gzip으로 압축된 콘텐츠(`Content-Encoding: gzip`)를 반환하지만 curl이 이를 자동으로 압축 해제하지 않기 때문입니다.

    **해결 방법:** curl이 자동으로 압축을 해제하도록 `--compressed` 옵션을 추가하십시오:

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


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.