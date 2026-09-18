> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Token 관리 API

> API 키를 프로그래밍 방식으로 생성, 목록 조회, 비활성화, 삭제할 수 있으며, 일괄 발급과 각 키별 쿼터, 모델, 만료 제한을 지원합니다

## API 개요

토큰 관리 API를 사용하면 콘솔에서 키를 하나씩 클릭하며 처리하는 대신 코드에서 API 키의 전체 수명 주기를 관리할 수 있습니다.

가장 일반적인 사용 사례는 **배치 발급**입니다. 즉, 각 팀원, 하위 고객 또는 프로젝트에 자체 키를 부여하고, 각 키마다 **지출 가능한 총액**, **호출할 수 있는 모델**, **유효 기간**에 대한 고유한 제한을 두는 방식입니다.

<CardGroup cols={3}>
  <Card title="쿼터 제한" icon="wallet">
    `remain_quota` 이 키가 총 얼마까지 사용할 수 있는지 제한합니다
  </Card>

  <Card title="모델 제한" icon="list-checks">
    `models` 허용 목록을 설정하며, 그 외의 호출은 거부됩니다
  </Card>

  <Card title="만료 제한" icon="clock">
    `expired_time` 만료 타임스탬프를 설정하며, 이후에는 키가 작동을 멈춥니다
  </Card>
</CardGroup>

<Info>
  키가 한두 개만 필요하다면 콘솔이 더 빠릅니다 — [API 키를 만드는 방법](/ko/faq/token-management)을 참조하십시오. 이 API는 자동화된 발급, 예약된 순환, 또는 키 관리를 자체 시스템에 통합하는 용도에 적합합니다.
</Info>

## 시스템 Token을 얻는 방법

Token Management API는 **System Token**으로 인증하며, 이는 API key와는 다른 것입니다.

<Steps>
  <Step title="콘솔에 접속">
    프로필 페이지에 접속하려면 `api.apiyi.com/account/profile`을(를) 방문하십시오
  </Step>

  <Step title="System Token 찾기">
    페이지 하단의 “Account Options - System Token” 섹션을 찾으십시오
  </Step>

  <Step title="액세스 토큰 생성">
    이후 API 요청에 사용할 수 있는 액세스 토큰을 받으려면 계정 비밀번호를 입력하십시오
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/PXVoab-l7wSQlQVE/images/apiyi-system-accesstoken.png?fit=max&auto=format&n=PXVoab-l7wSQlQVE&q=85&s=eb4f48476a795dfa5bfd7cb053081bdc" alt="System Token 받기" width="1020" height="460" data-path="images/apiyi-system-accesstoken.png" />

<Warning>
  **시스템 token은 API 키를 생성하고 삭제할 수 있습니다. 계정 비밀번호처럼 취급하십시오.**

  시스템 token은 모델을 직접 호출할 수 없습니다. 이를 `/v1/chat/completions`에 사용하면 거부됩니다.
  그러나 이를 사용해 생성한 API 키는 모델을 호출할 수 있습니다. **따라서 시스템 token이 유출되는 것은
  단일 API 키가 유출되는 것보다 훨씬 더 심각합니다.** 코드에 넣지 말고 비밀 관리자에 저장하며, 저장소에는 절대 커밋하지 말고, 주기적으로 교체하십시오.
</Warning>

## 엔드포인트

모든 엔드포인트는 동일한 방식으로 인증합니다: `Authorization` 헤더에 원시 시스템 token을 넣으십시오.
**`Bearer` 접두사 없이**.

| 메서드      | 경로                              | 목적                                     |
| -------- | ------------------------------- | -------------------------------------- |
| `GET`    | `/api/token/?p=0&page_size=100` | 계정의 모든 token을 나열합니다                    |
| `GET`    | `/api/token/{id}`               | 단일 token을 가져옵니다                        |
| `POST`   | `/api/token/`                   | **token을 생성합니다**; 응답은 키를 일반 텍스트로 반환합니다 |
| `PUT`    | `/api/token/`                   | token을 업데이트합니다(전체 객체가 필요합니다)           |
| `PUT`    | `/api/token/?status_only=true`  | 활성화/비활성화 상태만 전환합니다                     |
| `DELETE` | `/api/token/{id}`               | token을 삭제합니다                           |

기본 URL은 `https://api.apiyi.com`입니다.

## 토큰 생성

### 요청 예시

```bash theme={null}
export APIYI_SYS_TOKEN='YOUR_SYSTEM_TOKEN'

curl --compressed -s -X POST 'https://api.apiyi.com/api/token/' \
  -H "Authorization: $APIYI_SYS_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "team-alice",
    "remain_quota": 500000,
    "unlimited_quota": false,
    "group": "default",
    "models": "gpt-5.6,deepseek-chat",
    "expired_time": -1
  }'
```

### 요청 필드

| Field             | Type | Description                              |
| ----------------- | ---- | ---------------------------------------- |
| `name`            | 문자열  | 토큰 이름, 식별용                               |
| `remain_quota`    | 정수   | 크레딧 기준 쿼터 상한; 500,000 = \$1.00           |
| `unlimited_quota` | 불리언  | 쿼터가 무제한인지 여부; **기본값은 `false`입니다**        |
| `group`           | 문자열  | 토큰이 바인딩되는 그룹 식별자, 예: `default`           |
| `models`          | 문자열  | **모델 허용 목록**, 쉼표로 구분합니다. 제한이 없으면 생략하십시오  |
| `expired_time`    | 정수   | Unix 초 단위 만료 타임스탬프; `-1`는 만료되지 않음을 의미합니다 |

<Warning>
  **`unlimited_quota`의 기본값은 `false`이고 `remain_quota`의 기본값은 0입니다** — 둘 다 생략하면
  사용할 수 없는 0 쿼터의 토큰이 생성됩니다. `remain_quota`를 명시적으로 설정하거나
  `unlimited_quota`를 `true`로 설정하십시오.
</Warning>

<Warning>
  **모델 허용 목록에는 `models` 필드를 사용하십시오.**

  응답 구조에는 `model_limits`, `model_limits_enabled`, 그리고 `allow_ips`도 포함됩니다.
  이를 전달해도 오류가 발생하지 않습니다 — 엔드포인트는 여전히 200을 반환합니다 — 하지만 이들은 **현재는
  아무 효과가 없으며**, 토큰을 다시 조회해 보면 설정되지 않은 것으로 표시됩니다. 사용 가능한
  모델을 제한하려면 `models`를 사용하십시오. 소스 IP 제한은 현재는 직접 구현해야 합니다.
</Warning>

### 응답 예시

```json theme={null}
{
  "success": true,
  "message": "",
  "data": {
    "id": 119431,
    "user_id": 80778,
    "key": "K1RPzapuXLfBU4kDC5D9C0E70b1841AeAa542186B2F54b75",
    "status": 1,
    "name": "team-alice",
    "group": "default",
    "models": "gpt-5.6,deepseek-chat",
    "remain_quota": 500000,
    "unlimited_quota": false,
    "used_quota": 0,
    "expired_time": -1,
    "created_time": 1785599000
  }
}
```

<Warning>
  **응답의 `key`은 일반 텍스트이며 `sk-` 접두사를 포함하지 않습니다.** 직접 앞에
  붙여야 합니다 — 위 예시에서 실제 API 키는 `sk-K1RPzapu…`입니다.

  생성 시 키를 저장하고 배포하며, `key`가 포함된 응답 본문을
  로그 파일에 그대로 남겨 두지 마십시오.
</Warning>

## 배치 생성

**서버 측 batch 엔드포인트는 없습니다** — 요청 본문에 `count` 같은 것을 전달해도
아무런 효과가 없으며 여전히 하나의 token만 생성됩니다. 배치 발급은 클라이언트에서 반복하여 처리합니다.

<Warning>
  **한 사용자가 보유할 수 있는 token은 최대 1,000개입니다.** 이것은 계정 전체에 적용되는 상한이며 비활성화되었지만 삭제되지 않은 token도 포함합니다. 이 한도에 도달하면 생성 엔드포인트가 실패합니다 — 더 이상 사용하지 않는 token을 삭제하여 슬롯을 확보하십시오.

  배치 실행 전에 `GET /api/token/?p=0&page_size=100`를 페이지 단위로 조회하여 이미
  보유한 수를 세십시오. 키를 순환할 때는 반드시 마지막 단계인 "새 key 생성 → 트래픽 전환 →
  이전 key 비활성화 → 호출이 더 이상 남지 않으면 삭제"까지 완료하십시오. 삭제하지 않고 비활성화만 하면 슬롯이 계속 점유되므로,
  몇 차례 순환만으로도 이 한도에 도달합니다.
</Warning>

<Tabs>
  <Tab title="Python">
    ```python theme={null}
    import json
    import os
    import time

    import requests

    BASE = "https://api.apiyi.com"
    HEADERS = {"Authorization": os.environ["APIYI_SYS_TOKEN"],
               "Content-Type": "application/json"}
    QUOTA_PER_USD = 500_000


    def create_token(name, quota_usd=None, group="default", models=None, days=0):
        """Create one token. quota_usd=None means unlimited; days=0 means never expires."""
        body = {
            "name": name,
            "group": group,
            "unlimited_quota": quota_usd is None,
            "remain_quota": 0 if quota_usd is None else int(quota_usd * QUOTA_PER_USD),
            "expired_time": -1 if not days else int(time.time()) + days * 86400,
        }
        if models:
            body["models"] = models

        resp = requests.post(f"{BASE}/api/token/", headers=HEADERS, json=body, timeout=30)
        resp.raise_for_status()
        data = resp.json()["data"]
        return {"id": data["id"], "name": data["name"], "key": "sk-" + data["key"]}


    if __name__ == "__main__":
        names = ["team-alice", "team-bob", "team-carol"]
        created = [
            create_token(n, quota_usd=1, group="default", models="gpt-5.6", days=30)
            for n in names
        ]
        for row in created:
            print(f"{row['name']:16s} id={row['id']} {row['key']}")

        # the plaintext key is only returned at creation time, so store it carefully
        with open("keys.json", "w") as f:
            json.dump(created, f, ensure_ascii=False, indent=1)
    ```
  </Tab>

  <Tab title="Node.js">
    ```javascript theme={null}
    const BASE = "https://api.apiyi.com";
    const HEADERS = {
      Authorization: process.env.APIYI_SYS_TOKEN,
      "Content-Type": "application/json",
    };
    const QUOTA_PER_USD = 500_000;

    async function createToken(name, { quotaUsd = null, group = "default",
                                       models = null, days = 0 } = {}) {
      const body = {
        name,
        group,
        unlimited_quota: quotaUsd === null,
        remain_quota: quotaUsd === null ? 0 : Math.round(quotaUsd * QUOTA_PER_USD),
        expired_time: days ? Math.floor(Date.now() / 1000) + days * 86400 : -1,
      };
      if (models) body.models = models;

      const resp = await fetch(`${BASE}/api/token/`, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify(body),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const { data } = await resp.json();
      return { id: data.id, name: data.name, key: `sk-${data.key}` };
    }

    const names = ["team-alice", "team-bob", "team-carol"];
    for (const name of names) {
      const row = await createToken(name, { quotaUsd: 1, models: "gpt-5.6", days: 30 });
      console.log(row.name, row.id, row.key);
    }
    ```
  </Tab>

  <Tab title="cURL">
    ```bash theme={null}
    export APIYI_SYS_TOKEN='YOUR_SYSTEM_TOKEN'

    for NAME in team-alice team-bob team-carol; do
      curl --compressed -s -X POST 'https://api.apiyi.com/api/token/' \
        -H "Authorization: $APIYI_SYS_TOKEN" \
        -H 'Content-Type: application/json' \
        -d "{\"name\":\"$NAME\",\"remain_quota\":500000,\"unlimited_quota\":false,\"group\":\"default\",\"expired_time\":-1}" \
        | jq -r '"\(.data.name)\tsk-\(.data.key)"'
    done
    ```
  </Tab>
</Tabs>

## 세 가지 제한 사용

### 쿼터 제한

`remain_quota`는 token이 사용할 수 있는 금액을 제한합니다. 환산은
[잔액 조회 API](/ko/api-capabilities/balance-query)와 일치합니다:

<Card title="환산 규칙" icon="calculator">
  500,000 quota = \$1.00 USD
</Card>

예를 들어, 하위 고객에게 상한이 \$10인 키를 발급하려면 `remain_quota`를
`5000000`로 설정하고 `unlimited_quota`를 `false`로 설정합니다. 현재까지의 사용량은 token의
`used_quota` 필드에서 확인할 수 있습니다.

### 모델 제한

`models`는 쉼표로 구분된 허용 목록입니다. 한 번 설정하면 목록 밖의 모델을 호출하면 거부됩니다:

```json theme={null}
{
  "error": {
    "message": "This token is not authorized to use model: deepseek-chat"
  }
}
```

응답은 HTTP 403이며 **과금되지 않습니다**. `models`를 생략하면 제한이 없습니다.

### 만료 제한

`expired_time`는 Unix 초 타임스탬프이며, `-1`는 만료되지 않음을 의미합니다. 예를 들어, 30일 후 만료되는 키는 다음과 같습니다:

```python theme={null}
import time
expired_time = int(time.time()) + 30 * 86400
```

## 토큰 나열

```bash theme={null}
curl --compressed -s 'https://api.apiyi.com/api/token/?p=0&page_size=100' \
  -H "Authorization: $APIYI_SYS_TOKEN" | jq '.data[] | {id, name, status, remain_quota, used_quota, models}'
```

주요 필드:

| 필드                            | 설명                             |
| ----------------------------- | ------------------------------ |
| `id`                          | 업데이트 및 삭제에 사용되는 Token ID       |
| `key`                         | `sk-` 접두사 없이 평문으로 된 키          |
| `status`                      | `1` = 활성화됨, `2` = 비활성화됨        |
| `remain_quota` / `used_quota` | 남은 / 사용한 쿼터                    |
| `unlimited_quota`             | 쿼터가 무제한인지 여부                   |
| `models`                      | 모델 허용 목록; 비어 있으면 제한 없음         |
| `expired_time`                | 만료 타임스탬프; `-1`은 만료되지 않음을 의미합니다 |

## Token 업데이트하기

<Warning>
  **업데이트 엔드포인트는 전체 객체를 필요로 합니다 — 패치가 아닙니다.**

  올바른 흐름은 다음과 같습니다: `GET` 전체 token 객체를 가져와서, 변경하려는 필드를 수정한 뒤
  `PUT` **전체 객체**를 다시 보냅니다. 변경된 필드만 보내면 나머지 값이 지워집니다.
</Warning>

```python theme={null}
import os
import requests

BASE = "https://api.apiyi.com"
HEADERS = {"Authorization": os.environ["APIYI_SYS_TOKEN"],
           "Content-Type": "application/json"}

# 1. fetch the complete object
token = requests.get(f"{BASE}/api/token/119431", headers=HEADERS, timeout=30).json()["data"]

# 2. change only what you need, leaving everything else as-is
token["remain_quota"] = 2_500_000     # raise the cap to $5
token["models"] = "gpt-5.6,gemini-3-pro"

# 3. PUT the whole object back
resp = requests.put(f"{BASE}/api/token/", headers=HEADERS, json=token, timeout=30)
print(resp.json()["success"])
```

## 비활성화 및 삭제

### 비활성화(기록은 유지됨)

비활성화되면 키는 즉시 작동을 멈춥니다 — 이를 사용한 호출은 401을 반환합니다 — 그러나 token
기록과 사용 내역은 유지됩니다.

```python theme={null}
token = requests.get(f"{BASE}/api/token/119431", headers=HEADERS, timeout=30).json()["data"]
token["status"] = 2      # 1 = enabled, 2 = disabled

requests.put(f"{BASE}/api/token/", headers=HEADERS,
             params={"status_only": "true"}, json=token, timeout=30)
```

### 삭제(되돌릴 수 없음)

```bash theme={null}
curl --compressed -s -X DELETE 'https://api.apiyi.com/api/token/119431' \
  -H "Authorization: $APIYI_SYS_TOKEN"
```

일괄 삭제도 마찬가지로 클라이언트 측 루프입니다:

```python theme={null}
for token_id in [119431, 119432, 119433]:
    requests.delete(f"{BASE}/api/token/{token_id}", headers=HEADERS, timeout=30)
```

<Info>
  삭제는 되돌릴 수 없습니다. 키를 일시적으로 중단하려는 경우에는 대신 비활성화하십시오 —
  사용 기록은 대조를 위해 계속 확인할 수 있습니다.
</Info>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="생성 시 받은 key가 작동하지 않습니다. 왜 그렇습니까?">
    응답의 `key`에는 `sk-` 접두사가 포함되어 있지 않습니다. 직접 앞에 붙여야 합니다:
    사용할 수 있는 API 키는 `sk-` 뒤에 반환된 값을 붙인 것입니다.
  </Accordion>

  <Accordion title="새로 생성한 token에 쿼터 부족이 표시됩니다. 왜 그렇습니까?">
    생성 시 `remain_quota`가 설정되지 않았고 `unlimited_quota`도 `true`로 설정되지 않았기 때문일 가능성이 큽니다.
    그 기본 조합은 쿼터가 0인 token을 만듭니다. 두 값 중 하나를 명시적으로 지정하여 다시 생성하십시오.
  </Accordion>

  <Accordion title="model_limits 또는 allow_ips가 왜 적용되지 않습니까?">
    이 필드들은 `model_limits_enabled`와 함께 현재는 적용되지 않습니다. 전달해도
    오류는 발생하지 않지만 아무것도 저장되지 않습니다. 사용 가능한 모델을 제한하려면 `models`를 사용하십시오. source-IP
    제한은 현재는 직접 처리해야 합니다.
  </Accordion>

  <Accordion title="한 번의 요청으로 여러 token을 만들 수 있습니까?">
    서버 측 배치 엔드포인트는 없으며, 본문에 `count` 같은 값을 넣어도
    효과가 없습니다. 대신 클라이언트에서 create 호출을 반복하십시오. 위의 일괄 생성 섹션을 참고하십시오.
  </Accordion>

  <Accordion title="한 계정이 보유할 수 있는 token은 몇 개입니까?">
    사용자당 최대 1,000개이며, 비활성화되었지만 삭제되지 않은 token도 그 총합에 포함됩니다.
    상한에 도달하면 더 이상 token을 삭제하기 전까지 생성이 실패합니다. key를
    교체할 때는 삭제 단계까지 마쳐야 한다는 점을 기억하십시오. 비활성화만으로는 슬롯이 계속 점유됩니다.
  </Accordion>

  <Accordion title="업데이트 후 다른 필드가 지워졌습니다">
    update 엔드포인트는 전체 객체를 요구합니다. 먼저 전체 객체를 `GET`한 뒤 수정하고, 변경된 필드만 보내지 말고
    전체를 `PUT` 보내십시오.
  </Accordion>

  <Accordion title="비활성화와 삭제의 차이는 무엇입니까?">
    비활성화(`status: 2`)는 key의 작동을 즉시 중지하지만 기록과 사용 이력은 유지되며,
    언제든지 `1`로 되돌릴 수 있습니다. 삭제는 되돌릴 수 없으며 기록을 제거합니다. 일시 중단에는
    비활성화를 권장합니다.
  </Accordion>

  <Accordion title="각 key가 얼마나 사용했는지 어떻게 확인합니까?">
    token의 `used_quota` 필드는 해당 key의 누적 과금액입니다(÷ 500,000 = USD). 기간별 내역이나 호출 수준의 세부 정보를 보려면
    콘솔 로그 페이지에서 token 이름으로 필터링하십시오 — [내 호출 기록을 보는 방법](/ko/faq/call-logs)을 참조하십시오.
  </Accordion>
</AccordionGroup>

## 중요 안내

<Warning>
  **시스템 token은 API key가 아니며, 둘은 서로 대체할 수 없습니다**

  * **API key**(접두사 `sk-`로 시작)는 `/v1/*` 추론 엔드포인트용입니다
  * **system token**(접두사가 없는 일반 문자열)은 `/api/*` 관리 엔드포인트용입니다

  서로 혼동하면 각각 401 및 잘못된 token 오류가 반환됩니다.
</Warning>

<Warning>
  **평문 키는 신중하게 처리하십시오**

  생성 응답과 token 목록 모두 키를 평문으로 반환합니다. 따라서:

  * `key`가 포함된 응답 본문을 로그 파일에 기록하거나 저장소에 커밋하지 마십시오
  * 키는 그룹 채팅이 아니라 안전한 채널을 통해 팀원에게 배포하십시오
  * 이 평문에는 `sk-` 접두사가 없으므로 **일반적인 비밀 스캐너는 이를 감지하지 못할 수 있습니다** —
    자동 검사에 잡히기를 기대하지 마십시오
</Warning>

<Info>
  **운영 팁**

  * 대량으로 생성할 때는 호출 사이에 적당한 지연을 넣어 순간 동시 실행 수가 높아지는 것을 피하십시오
  * 각 키에 의미 있는 `name`(예: `team-alice` 또는 `prod-webhook`)를 부여하여 나중에 로그에서 `token_name`별 사용량을 식별할 수 있게 하십시오
  * 순환 교체를 할 때는 새 키를 만들고, 트래픽을 옮기고, 기존 키를 비활성화한 다음, 잠시 관찰한 뒤
    호출이 더 이상 남아 있지 않음을 확인한 후에만 삭제하십시오
</Info>

<Card title="관련 문서" icon="link">
  * [내 호출 기록을 보는 방법](/ko/faq/call-logs) — 콘솔에서 키별 호출 세부 정보와 과금
  * [잔액 조회 API](/ko/api-capabilities/balance-query) — 남은 계정 잔액
  * [API key를 만드는 방법](/ko/faq/token-management) — 콘솔에서 수동 생성
  * [token과 그룹](/ko/faq/token-and-groups) — 그룹의 역할과 선택 방법
</Card>
