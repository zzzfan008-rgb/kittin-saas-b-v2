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

## 개인 액세스 Token 발급 방법

Token 관리 API는 **개인 액세스 token**(`nap_`로 시작)으로 인증하며, 이는 API 키와 동일하지 않습니다.

<Steps>
  <Step title="개인 액세스 Tokens 열기">
    `api.apiyi.com/account/profile`의 프로필 페이지로 이동합니다. **계정 옵션**에서 **개인 액세스 Tokens** → **Token 생성**을 클릭합니다.
  </Step>

  <Step title="필요한 Model keys 권한 선택">
    세 가지 권한은 독립적입니다. 사용하는 권한만 선택하십시오:

    | 수행하려는 작업 | 선택할 권한 |
    | - | - |
    | API 키 목록 조회 또는 가져오기 | Model keys · Read |
    | API 키 생성, 업데이트, 비활성화 또는 삭제 | Model keys · Write |
    | 새 API 키의 일반 텍스트 조회(외부 전달용) | Model keys · Reveal secret |

    대량 발급 스크립트에는 세 가지가 모두 필요합니다. 사용량 모니터링 스크립트에는 Read 권한만 필요합니다.
  </Step>

  <Step title="만료 기간 및 IP 허용 목록 설정">
    기본 만료 기간은 30일이므로 더 긴 기간으로 설정하는 것을 권장합니다. 발급 스크립트가 고정 IP를 사용하는 서버에서 실행되는 경우 IP 허용 목록을 설정하는 것을 강력히 권장합니다. 허용 목록은 생성 후 수정할 수 없으므로, 먼저 허용 목록 없이 스크립트가 정상 작동하는지 확인한 다음 허용 목록이 포함된 별도의 프로덕션 token을 생성하십시오.
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/xTqEgFERWX-o_x6Q/images/personal-access-token-create.png?fit=max&auto=format&n=xTqEgFERWX-o_x6Q&q=85&s=db4eacd9f8f57ee95018d609b062e78a" alt="개인 액세스 token 생성: 이름, 만료 기간, IP 허용 목록 및 권한" width="900" height="1244" data-path="images/personal-access-token-create.png" />

<Warning>
  **Write 및 Reveal secret 권한이 있는 token은 모델을 호출할 수 있는 API 키를 생성할 수 있습니다. 계정 비밀번호처럼 안전하게 관리하십시오.**

  개인 액세스 token 자체는 모델을 호출할 수 없지만, 모델을 호출할 수 있는 키를 발급할 수 있습니다. 이러한 token에는 **IP 허용 목록**을 지정하고, 코드 대신 시크릿 관리자에 저장하며, 저장소에 절대 커밋하지 말고 만료되기 전에 교체하십시오.
</Warning>

<Warning>
  **기존 시스템 tokens는 2026-11-11 (UTC+8)에 폐기될 예정입니다.** “계정 옵션 - 시스템 Token”에서 생성된 AccessTokens는 해당 시점까지 계속 작동합니다. 해당 날짜 이후에는 401 `ACCESS_TOKEN_LEGACY_RETIRED`를 반환합니다.
  사용량을 검토하여 일정을 연장할 수도 있지만, 지금 개인 액세스 token으로 전환하는 것을 권장합니다. 전환 시 스크립트도 확인하십시오. **생성 엔드포인트는 이제 마스킹된 `key`를 반환합니다**. 일반 텍스트를 가져오려면 아래 설명된 대로 `POST /api/token/{id}/key`를 호출하십시오.
  [개인 액세스 Token이란 무엇인가요?](/ko/faq/personal-access-token)를 참조하십시오.
</Warning>

## 엔드포인트

모든 엔드포인트는 동일한 방식으로 인증합니다: 개인 액세스 token을 `Authorization` 헤더에 입력합니다.
`Bearer ` 접두사는 선택 사항입니다.

| 메서드 | 경로 | 목적 | 권한 |
| - | - | - | - |
| `GET` | `/api/token/?p=0&page_size=100` | 계정의 모든 tokens 목록 조회(`key`는 마스킹 처리됨) | 읽기 |
| `GET` | `/api/token/{id}` | 단일 token 조회 | 읽기 |
| `POST` | `/api/token/` | **token 생성**(응답의 `key`는 마스킹 처리됨) | 쓰기 |
| `POST` | `/api/token/{id}/key` | **키의 평문 조회** | 시크릿 공개 |
| `PUT` | `/api/token/` | token 수정(전체 객체 필요) | 쓰기 |
| `PUT` | `/api/token/?status_only=true` | 활성화/비활성화 상태만 전환 | 쓰기 |
| `DELETE` | `/api/token/{id}` | token 삭제 | 쓰기 |

기본 URL은 `https://api.apiyi.com`입니다.

## token 생성

### 요청 예시

```bash theme={null}
export APIYI_SYS_TOKEN='nap_YOUR_PERSONAL_ACCESS_TOKEN'   # personal access token

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

| 필드 | 타입 | 설명 |
| - | - | - |
| `name` | String | 식별을 위한 token 이름 |
| `remain_quota` | Integer | 크레딧 단위의 쿼터 상한, 500,000 = \$1.00 |
| `unlimited_quota` | Boolean | 쿼터 무제한 여부, **기본값은 `false`** |
| `group` | String | token이 바인딩된 그룹 식별자(예: `default`) |
| `models` | String | **모델 허용 목록**, 쉼표로 구분. 제한이 없는 경우 생략 |
| `expired_time` | Integer | Unix 초 단위 만료 타임스탬프, `-1`은 만료되지 않음을 의미 |

<Warning>
  **`unlimited_quota`의 기본값은 `false`이고 `remain_quota`의 기본값은 0입니다.** 둘 다 생략하면 쿼터가 0인 token이 생성되어 사용할 수 없습니다. `remain_quota`을 명시적으로 설정하거나 `unlimited_quota`을(를) `true`(으)로 설정하십시오.
</Warning>

<Warning>
  **모델 허용 목록에는 `models` 필드를 사용하십시오.**

  응답 구조에는 `model_limits`, `model_limits_enabled` 및 `allow_ips`도 포함되어 있습니다.
  이 값들을 전달해도 오류가 발생하지 않으며 엔드포인트는 여전히 200을 반환하지만, **현재는 아무런 효과가 없으며** token을 다시 조회하면 설정되지 않은 것으로 나타납니다. 사용 가능한 모델을 제한하려면 `models`을(를) 사용하십시오. 소스 IP 제한은 현재 직접 구현해야 합니다.
</Warning>

### 응답 예시

```json theme={null}
{
  "success": true,
  "message": "",
  "data": {
    "id": 119431,
    "user_id": 80778,
    "key": "K1RP**********4b75",
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
  **응답의 `key`은 마스킹되어 있어 직접 사용할 수 없습니다.** 평문을 확인하려면 응답의 `id`을(를) 사용하여 평문 조회 엔드포인트를 호출하십시오.
</Warning>

## 키 일반 텍스트 조회

```bash theme={null}
curl --compressed -s -X POST 'https://api.apiyi.com/api/token/119431/key' \
  -H "Authorization: $APIYI_SYS_TOKEN"
```

```json theme={null}
{
  "success": true,
  "message": "",
  "data": {
    "key": "K1RPzapuXLfBU4kDC5D9C0E70b1841AeAa542186B2F54b75"
  }
}
```

* 개인 액세스 토큰에 **Model keys · Reveal secret** 권한이 필요하며, 그렇지 않으면 403 `ACCESS_TOKEN_SCOPE_DENIED`이 반환됩니다.
* 반환된 `key`에는 **`sk-` 접두사가 포함되지 않습니다**. 직접 앞에 추가해야 합니다. 위 예시에서 실제 API 키는 `sk-K1RPzapu…`입니다.
* 즉시 저장하고 안전한 채널을 통해 배포하십시오. 응답 본문을 로그 파일에 남겨두지 마십시오.

## 일괄 생성

**서버 측 일괄 생성 엔드포인트는 제공되지 않습니다** — 요청 본문에 `count`와 같은 값을 전달해도
적용되지 않으며 단일 token만 생성됩니다. 일괄 발급은 클라이언트에서 반복 실행하여 수행합니다.

<Warning>
  **단일 사용자는 최대 1,000개의 tokens를 보유할 수 있습니다.** 이는 계정 전체에 적용되는 상한선이며,
  삭제되지 않고 비활성화된 tokens도 포함됩니다. 상한선에 도달하면 생성 엔드포인트 호출이 실패하므로, 더 이상
  사용하지 않는 tokens를 삭제하여 슬롯을 확보하십시오.

  일괄 작업을 실행하기 전에 `GET /api/token/?p=0&page_size=100`을(를) 페이지별로 조회하여 이미 보유한 개수를 확인하십시오. 키를 교체할 때는
  "새 키 생성 → 트래픽 전환 → 이전 키 비활성화 → 남은 호출이 없을 때 삭제"의 마지막 단계까지 확실하게 완료하십시오.
  삭제하지 않고 비활성화만 해 두면 슬롯이 계속 점유되므로, 몇 번의 교체 주기만 거쳐도
  상한선에 도달하게 됩니다.
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
        data = resp.json()["data"]          # key here is masked

        # Retrieve the plaintext: needs "Model keys · Reveal secret"
        resp = requests.post(f"{BASE}/api/token/{data['id']}/key", headers=HEADERS, timeout=30)
        resp.raise_for_status()
        key = resp.json()["data"]["key"]
        return {"id": data["id"], "name": data["name"], "key": "sk-" + key}


    if __name__ == "__main__":
        names = ["team-alice", "team-bob", "team-carol"]
        created = [
            create_token(n, quota_usd=1, group="default", models="gpt-5.6", days=30)
            for n in names
        ]
        for row in created:
            print(f"{row['name']:16s} id={row['id']} {row['key']}")

        # keys.json holds plaintext keys: store and distribute carefully, delete when done
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
      const { data } = await resp.json();   // key here is masked

      // Retrieve the plaintext: needs "Model keys · Reveal secret"
      const r2 = await fetch(`${BASE}/api/token/${data.id}/key`, { method: "POST", headers: HEADERS });
      if (!r2.ok) throw new Error(`HTTP ${r2.status}`);
      const { data: secret } = await r2.json();
      return { id: data.id, name: data.name, key: `sk-${secret.key}` };
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
    export APIYI_SYS_TOKEN='nap_YOUR_PERSONAL_ACCESS_TOKEN'   # personal access token

    for NAME in team-alice team-bob team-carol; do
      ID=$(curl --compressed -s -X POST 'https://api.apiyi.com/api/token/' \
        -H "Authorization: $APIYI_SYS_TOKEN" \
        -H 'Content-Type: application/json' \
        -d "{\"name\":\"$NAME\",\"remain_quota\":500000,\"unlimited_quota\":false,\"group\":\"default\",\"expired_time\":-1}" \
        | jq -r '.data.id')
      KEY=$(curl --compressed -s -X POST "https://api.apiyi.com/api/token/$ID/key" \
        -H "Authorization: $APIYI_SYS_TOKEN" | jq -r '.data.key')
      printf '%s\tsk-%s\n' "$NAME" "$KEY"
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

## Token 목록 조회

```bash theme={null}
curl --compressed -s 'https://api.apiyi.com/api/token/?p=0&page_size=100' \
  -H "Authorization: $APIYI_SYS_TOKEN" | jq '.data[] | {id, name, status, remain_quota, used_quota, models}'
```

주요 필드:

| 필드 | 설명 |
| - | - |
| `id` | Token ID이며, 업데이트 및 삭제에 사용됩니다 |
| `key` | 마스킹된 키입니다. 평문은 “키 평문 조회”를 참조하십시오 |
| `status` | `1` = 활성화됨, `2` = 비활성화됨 |
| `remain_quota` / `used_quota` | 잔여 쿼터 / 사용된 쿼터 |
| `unlimited_quota` | 쿼터 무제한 여부입니다 |
| `models` | 모델 허용 목록이며, 비어 있으면 제한이 없음을 의미합니다 |
| `expired_time` | 만료 타임스탬프이며, `-1`은(는) 만료 없음을 의미합니다 |

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
  <Accordion title="생성 시 반환된 키가 작동하지 않는 이유는 무엇입니까?">
    생성 엔드포인트는 마스킹된 `key`(중간에 연속된 `*` 포함)를 반환하므로 직접 사용할 수 없습니다.
    반환된 `id`와 함께 `POST /api/token/{id}/key`을 호출하여 평문을 가져온 다음(Reveal secret 권한 필요),
    앞에 `sk-`을 붙이십시오. 기존 스크립트에서 생성 응답의 `key`을 직접 사용하고 있다면, 개인 액세스 token으로 전환할 때 이 단계를 추가하십시오.
  </Accordion>

  <Accordion title="새로 생성한 token에서 쿼터 부족 오류가 발생하는 이유는 무엇입니까?">
    생성 시 `remain_quota`도 설정되지 않고 `unlimited_quota`도 `true`(으)로 설정되지 않았을 가능성이 가장 높습니다.
    해당 기본값 조합은 쿼터가 0인 token을 생성합니다. 둘 중 하나를 명시적으로
    지정하여 다시 생성하십시오.
  </Accordion>

  <Accordion title="model_limits 또는 allow_ips가 적용되지 않는 이유는 무엇입니까?">
    해당 필드는 `model_limits_enabled`와 함께 현재 적용되지 않습니다. 이들을 전달해도
    오류는 발생하지 않지만 아무것도 저장되지 않습니다. 사용 가능한 모델을 제한하려면 `models`을 사용하십시오. 소스 IP
    제한은 현재 자체 환경에서 직접 처리해야 합니다.
  </Accordion>

  <Accordion title="단일 요청으로 여러 tokens를 생성할 수 있습니까?">
    서버 측 배치 엔드포인트는 제공되지 않으며, 본문에 `count`과 같은 값을 전달해도 아무런
    영향을 주지 않습니다. 대신 클라이언트에서 생성 호출을 반복하십시오. 자세한 내용은 위의 일괄 생성 섹션을 참조하십시오.
  </Accordion>

  <Accordion title="한 계정에 token을 몇 개까지 보유할 수 있습니까?">
    사용자당 최대 1,000개까지 가능하며, 비활성화되었지만 삭제되지 않은 tokens도 이 총계에 포함됩니다.
    한도에 도달하면 더 이상 필요하지 않은 tokens를 삭제할 때까지 생성이 실패합니다. 키를
    교체할 때는 마지막에 삭제 단계를 잊지 마십시오. 비활성화만으로는 슬롯을 계속 차지하게 됩니다.
  </Accordion>

  <Accordion title="업데이트 후 다른 필드가 지워졌습니다">
    업데이트 엔드포인트에는 완전한 객체가 필요합니다. 변경된 필드만 전송하지 말고 먼저 전체 객체를 `GET`한 뒤 수정한 다음,
    전체를 `PUT`로 다시 전송하십시오.
  </Accordion>

  <Accordion title="비활성화와 삭제의 차이점은 무엇입니까?">
    비활성화(`status: 2`)는 키의 작동을 즉시 중단하지만 기록 및 사용
    내역은 유지하며 언제든지 다시 `1`(으)로 설정할 수 있습니다. 삭제는 되돌릴 수 없으며
    기록을 완전히 제거합니다. 일시적인 사용 중단을 원하시면 비활성화를 권장합니다.
  </Accordion>

  <Accordion title="각 키에서 지출된 금액을 어떻게 확인합니까?">
    token의 `used_quota` 필드는 해당 키의 누적 지출 금액입니다(÷ 500,000 = USD). 기간별
    세부 내역이나 호출 단위의 상세 정보를 확인하려면 콘솔 로그 페이지에서 token 이름으로 필터링하십시오. 자세한 내용은
    [호출 기록 확인 방법](/ko/faq/call-logs)을 참조하십시오.
  </Accordion>
</AccordionGroup>

## 중요 참고 사항

<Warning>
  **개인 액세스 token은 API 키가 아니며, 두 항목은 서로 대체할 수 없습니다**

  * **API 키**(`sk-`(으)로 시작)는 `/v1/*` 추론 엔드포인트 전용입니다
  * **개인 액세스 token**(`nap_`(으)로 시작)은 `/api/*` 관리 엔드포인트 전용이며 모델을 호출할 수 없습니다

  오류 참조: 401 `ACCESS_TOKEN_LEGACY_RETIRED`은(는) 사용 중단된 레거시 시스템 token을 여전히 사용하고 있음을 의미합니다.
  401 `This access token may not be used from the current IP address.`은(는) 해당 token의 허용 목록 외의 IP에서 요청이 전송되었음을 의미합니다.
  403 `ACCESS_TOKEN_SCOPE_DENIED`은(는) 해당 token에 이 엔드포인트에 필요한 권한이 없음을 의미합니다(엔드포인트 표 참조).
</Warning>

<Warning>
  **일반 텍스트 키를 주의 깊게 다루십시오**

  일반 텍스트 조회 엔드포인트는 모델을 직접 호출할 수 있는 키를 반환합니다. 따라서 다음 사항을 준수하십시오:

  * `key`이(가) 포함된 응답 본문을 로그 파일에 기록하거나 저장소에 커밋하지 마십시오
  * 단체 채팅방이 아닌 안전한 채널을 통해 팀원에게 키를 배포하십시오
  * 이 일반 텍스트에는 `sk-` 접두사가 포함되어 있지 않으므로 **일반적인 시크릿 스캐너가 감지하지 못할 수 있습니다** —
    자동화된 검사에만 의존하지 마십시오
</Warning>

<Info>
  **운영 팁**

  * 대량 생성 시에는 순간적인 동시 실행 수가 급증하는 것을 방지하기 위해 호출 간에 적절한 지연 시간을 두십시오
  * 나중에 로그에서 `token_name`별 사용량을 추적할 수 있도록 각 키에 의미 있는 `name`(예: `team-alice` 또는 `prod-webhook`)을(를) 지정하십시오
  * 키 교체 시: 새 키를 생성하고, 트래픽을 전환한 후, 이전 키를 비활성화하고 잠시 모니터링한 다음,
    더 이상 호출이 발생하지 않는 것을 확인한 후에만 삭제하십시오
</Info>

<Card title="관련 문서" icon="link">
  * [호출 내역 확인 방법](/ko/faq/call-logs) — 콘솔 내 키별 호출 상세 내역 및 과금
  * [잔액 조회 API](/ko/api-capabilities/balance-query) — 계정 잔여 크레딧
  * [API 키 생성 방법](/ko/faq/token-management) — 콘솔에서 수동 생성
  * [tokens 및 그룹](/ko/faq/token-and-groups) — 그룹의 역할 및 선택 방법
</Card>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.