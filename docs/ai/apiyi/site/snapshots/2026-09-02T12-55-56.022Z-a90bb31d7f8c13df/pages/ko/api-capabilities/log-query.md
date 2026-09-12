> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 로그 쿼리 API

> 프로그래밍 방식으로 호출 로그를 조회하여 각 요청의 모델, 실제 과금, 지연 시간, 오류 코드를 확인할 수 있으며, 이를 통해 자동 대사와 셀프서비스 문제 해결을 지원합니다

## API 개요

Log Query API는 계정 아래에서 수행된 **모든 API 호출**의 상세 기록을 반환합니다.
여기에는 사용된 모델, 실제 청구 금액, 지연 시간, 호출이 스트리밍되었는지 여부,
그리고 호출이 실패했을 때의 오류 코드가 포함됩니다.

이 API는 [잔액 조회 API](/ko/api-capabilities/balance-query)를 보완합니다. 잔액 조회는
남은 크레딧이 얼마인지 알려주고, 로그 조회는 그것이 어디로 갔는지 알려줍니다.

세 가지 대표적인 사용 사례는 다음과 같습니다:

<CardGroup cols={3}>
  <Card title="자동 대사" icon="calculator">
    시간 범위나 모델별로 실제 지출을 집계하고 자체 과금 내역과 대조합니다
  </Card>

  <Card title="셀프 서비스 문제 해결" icon="bug">
    실패한 요청의 오류 코드를 확인하여 매개변수 문제와 상위 시스템 문제를 구분합니다
  </Card>

  <Card title="지원 티켓" icon="life-buoy">
    정확한 호출을 특정할 수 있도록 지원팀에 `request_id`를 제공하십시오
  </Card>
</CardGroup>

<Info>
  로그는 콘솔의 Logs 페이지에서도 볼 수 있습니다. 이 API는 동일한 데이터에 대한 프로그래밍 방식의 진입점으로,
  자동 대사, 예약된 내보내기, 또는 자체 모니터링에 활용하는 용도입니다. 수동 확인은 콘솔을 사용하십시오 —
  [내 호출 기록을 보는 방법](/ko/faq/call-logs)을 참조하십시오.
</Info>

<Warning>
  **권장 사용법: 하루에 한 번 동기화하고 로그를 자체 데이터베이스에 저장하십시오.**

  이 API는 반복적인 실시간 조회가 아니라 예약된 증분 내보내기를 위해 설계되었습니다:

  * **하루에 한 번 실행**하여 마지막 동기화 이후 생성된 기록만 자체 데이터베이스나 CSV 파일로 가져오십시오
  * **요청당 더 많이 가져오십시오**: `pageSize`은 최대 5000까지 올라갑니다 — 기본값 10으로 두지 마십시오.
    여기서의 함정은 아래의 매개변수 참고사항을 참조하십시오
  * **대량 백필**(한 번에 3개월치를 가져오기) 용도로 사용하지 말고, UI에서 실시간 페이지네이션을 구동하는 데도 사용하지 마십시오
  * **동시에 호출하지 마십시오** — 페이지는 순차적으로 넘기며, 각 페이지 사이에 약 1초를 두십시오
  * 각 시간 범위는 **하루 이내**로 유지하십시오. 트래픽이 많은 계정은 시간 단위로 나누십시오

  왜 그런지에 대해서는 아래의 성능 노트 섹션을 참조하십시오. 윈도우가 오래될수록, 그리고 페이지네이션이 깊을수록
  각 요청 비용이 더 커집니다. 서버 측 한도를 넘으면 오류가 반환되며,
  **같은 매개변수로 다시 시도해도 더 빨라지지 않습니다**. 이 페이지의 Python 예제는 이미 이 패턴을 따르고 있으며
  하루 한 번 실행하는 cron 작업에 그대로 넣을 수 있습니다.
</Warning>

## 시스템 토큰을 얻는 방법

Log Query API는 **시스템 토큰**으로 인증하며, 이는 API 키와 동일한 것이 아닙니다(이 페이지 끝의 중요 참고 사항을 참조하십시오).

<Steps>
  <Step title="콘솔에 접속">
    프로필 페이지에 액세스하려면 `api.apiyi.com/account/profile`에 방문하십시오
  </Step>

  <Step title="시스템 토큰 찾기">
    페이지 하단에서 "계정 옵션 - 시스템 토큰" 섹션을 찾으십시오
  </Step>

  <Step title="액세스 토큰 생성">
    후속 API 쿼리에 사용할 수 있는 액세스 토큰을 받으려면 계정 비밀번호를 입력하십시오
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/PXVoab-l7wSQlQVE/images/apiyi-system-accesstoken.png?fit=max&auto=format&n=PXVoab-l7wSQlQVE&q=85&s=eb4f48476a795dfa5bfd7cb053081bdc" alt="시스템 토큰 받기" width="1020" height="460" data-path="images/apiyi-system-accesstoken.png" />

## API 정보

| 항목          | 설명                                                   |
| ----------- | ---------------------------------------------------- |
| **API URL** | `https://api.apiyi.com/api/log/self`                 |
| **메서드**     | `GET`                                                |
| **인증**      | Authorization 헤더(raw token 문자열, **`Bearer` 접두사 없음**) |
| **응답 형식**   | JSON(gzip 압축)                                        |
| **데이터 범위**  | 사용자 본인 계정의 로그만                                       |

## 요청 세부 정보

### 요청 헤더

| 헤더 이름           | 필수  | 설명                               |
| --------------- | --- | -------------------------------- |
| `Authorization` | Yes | 시스템 token이며, 원시 token 문자열로 전달합니다 |
| `Accept`        | No  | 권장: `application/json`           |

### 쿼리 매개변수

| 매개변수              | 유형      | 필수 여부  | 설명                                                                 |
| ----------------- | ------- | ------ | ------------------------------------------------------------------ |
| `p`               | Integer | 아니오    | 페이지 번호, **0부터 시작하는** 형식입니다(1이 아님). 오프셋 = `p` × `pageSize`          |
| `pageSize`        | Integer | 아니오    | 페이지당 레코드 수, 기본값 10, **최대 5000**입니다. ⚠️ **camelCase** — 아래 경고를 보십시오 |
| `type`            | Integer | 아니오    | 로그 유형입니다. 대사 시 `2`를 전달하십시오. 아래 표를 보십시오                             |
| `model_name`      | String  | 아니오    | 모델로 정확 일치 필터링입니다. 예: `gpt-5.6`                                     |
| `token_name`      | String  | 아니오    | token 이름으로 필터링                                                     |
| `request_id`      | String  | 아니오    | request ID로 단일 호출을 조회합니다. 해당 레코드만 반환합니다                            |
| `start_timestamp` | Integer | **필수** | 시작 시간, Unix 초입니다. 아래 참고를 보십시오                                      |
| `end_timestamp`   | Integer | **필수** | 종료 시간, Unix 초입니다. `start_timestamp`부터 최대 하루 이내로 범위를 유지하십시오         |
| `group`           | String  | 아니오    | 그룹으로 필터링                                                           |

<Warning>
  **시간 범위는 필수로 간주하십시오.**

  이 엔드포인트는 실제로 이 두 매개변수를 강제하지 않습니다. 없어도 호출은 성공합니다. 하지만 이를 생략하면 서버는 계정의 최신 레코드부터 거꾸로 전체 기록을 검색하며, 호출 기록이 많은 계정은 서버 측 제한에 걸려 느린 응답 대신 오류를 받게 됩니다.

  이 페이지에서 가장 쉽게 저지르는 실수이자 가장 직접적인 결과를 낳는 실수입니다. 서버가 호출을 거부하기 때문이 아니라, **실패 양상이 알아차리기 어렵기 때문**에 Required로 표시합니다. 누락된 매개변수를 보고하지 않고 타임아웃을 보고합니다.
</Warning>

<Warning>
  **`pageSize`는 이 엔드포인트에서 유일한 camelCase 매개변수입니다. 이를 `page_size`로 잘못 적어도 조용히 무시됩니다.**

  나머지 모든 매개변수(`model_name`, `token_name`, `start_timestamp`, `request_id`, …)는 snake\_case를 사용합니다. 이 항목만은 그렇지 않습니다. 잘못 지정해도 오류가 발생하지 않습니다. 서버는 해당 매개변수를 없는 것으로 처리하고 **페이지당 레코드 수 기본값 10을 사용합니다**, 이로 인해 “상한이 10이다” 또는 “이 기간에 호출을 10번만 했다”로 오해하기 쉽습니다.

  ```
  ?pageSize=1000    ✅ returns 1000 records
  ?page_size=1000   ❌ silently returns 10
  ```

  5000을 초과하면 조용히 잘리는 대신 명확한 오류가 발생합니다.
</Warning>

<Info>
  **이 엔드포인트에서 가장 효과적인 최적화는 `pageSize`의 값을 키우는 것입니다.** 페이지당 레코드 10개일 때 하루 500,000건의 호출이 있는 계정은 50,000개의 요청이 필요하지만, 페이지당 5000개일 때는 **100개**면 됩니다. 요청 수가 두 자릿수 규모로 줄어들고, 그에 따라 페이지네이션 오프셋도 감소합니다 — 아래 성능 참고 사항을 보십시오.

  5000개 레코드 페이지는 gzip으로 압축하면 대략 700 KB이며 약 2.5초가 걸립니다. 대역폭이나 메모리가 빠듯하다면, `1000`가 무난한 중간 지점입니다.
</Info>

### 성능 참고 사항

단일 요청의 비용은 **고정되어 있지 않습니다**. 세 가지 요인에 따라 달라집니다. 이 규칙을 따르면
API는 빠르게 동작하지만, 무시하면 서버 측 60초 쿼리 제한에 걸려
오류가 반환됩니다.

| 요인                        | 저렴함          | 비쌈                   |
| ------------------------- | ------------ | -------------------- |
| **윈도우의 위치**               | 최근 며칠        | 몇 주 또는 몇 달 전         |
| **윈도우의 폭**                | 1시간에서 1일     | 한 달 전체 또는 윈도우가 전혀 없음 |
| **오프셋(`p` × `pageSize`)** | 처음 몇만 건의 레코드 | 수십만 건 이상             |

실용적인 규칙 네 가지입니다.

1. **항상 `start_timestamp`와 `end_timestamp`를 전달하십시오.** 윈도우를 생략하는 것은 이 API를 호출하는 가장
   비싼 방법입니다.
2. **`pageSize`를 늘리십시오.** 이건 쉽습니다. 페이지당 10건에서 1000–5000건으로 늘리면
   요청 횟수가 두 자릿수 규모로 줄어들고, 오프셋도 함께 줄어듭니다.
3. **오프셋을 깊게 하기보다 윈도우를 줄이십시오.** 비용이 드는 것은 “몇 번째 페이지인지”가 아니라
   “그 위치에 도달하기 위해 몇 개의 레코드를 건너뛰었는지”이며, 이는 초선형적으로 증가합니다.
   큰 윈도우 하나를 끝까지 페이지 처리하기보다 24개의 1시간 윈도우로 나누어
   각 윈도우가 다시 오프셋 0에서 시작하게 하십시오.
4. **히스토리를 한 번 백필하고 저장한 뒤, 이후에는 증가분만 동기화하십시오.** 오래된 데이터는
   최근 데이터보다 조회 비용이 훨씬 더 크므로, 같은 히스토리를 반복해서 다시 읽는 것은 순수한 낭비입니다.

<Info>
  윈도우가 `pageSize=1000`에서 여전히 수십 페이지를 차지한다면, 해당 기간의 호출량이
  높다는 뜻입니다. **윈도우를 반으로 나누고 각 절반을 별도로 가져오십시오.** 이렇게 하는 편이
  더 깊이 페이지 처리하는 것보다 훨씬 빠릅니다. 아래 Python 예제의 `MAX_PAGES` 상수가 바로
  이 작업을 수행합니다.
</Info>

#### 60초는 엄격한 제한이며, 초과하면 오류가 반환됩니다

서버는 단일 쿼리를 **60초**로 제한합니다. 그 시간을 넘으면 느린 응답을 받는 것이 아니라 —
**오류를 받게 되며**, 이미 소요한 시간으로는 데이터를 전혀 얻지 못합니다.

다음 세 가지 패턴이 이를 유발할 가능성이 높습니다. 재시도하며 운을 기대하기보다
아예 피하십시오.

| 패턴                          | 이유                                  |
| --------------------------- | ----------------------------------- |
| **시간 윈도우가 없음**              | 서버가 전체 히스토리를 검색해야 합니다               |
| **한 달 이상 전의 윈도우**, 대용량 계정에서 | 오래된 데이터는 가져오는 데 더 많은 비용이 듭니다        |
| **수십만 단위의 오프셋**             | 건너뛴 레코드가 많을수록 더 느려지며, 그 증가는 초선형적입니다 |

**같은 파라미터로 다시 시도해도 더 빨라지지 않습니다.** 그냥 60초가 한 번 더 들 뿐입니다.
올바른 대응은 **시간 윈도우를 좁히거나**, `pageSize`를 늘려 페이지 수를 줄이는 것입니다.
어느 쪽이든, 호출당 서버가 처리해야 하는 데이터를 더 적게 만들어야 합니다.

### 로그 유형

| 값   | 의미     | 비고                                        |
| --- | ------ | ----------------------------------------- |
| `1` | 충전     | 충전 전후 잔액을 기록합니다; `quota`는 0입니다            |
| `2` | **소비** | **정산에 필요한 유일한 유형입니다**; `quota`는 실제 과금액입니다 |
| `3` | 관리     | 계정 변경 및 유사한 작업; `quota`는 0입니다             |
| `4` | 시스템    | 시스템에서 부여된 크레딧 및 유사한 항목; `quota`는 0입니다     |

<Warning>
  **지출을 계산할 때는 항상 `type=2`를 전달하십시오.** 그렇지 않으면 충전 및 시스템 부여 기록도 함께 반환됩니다. 해당 기록의 `quota`는 0이지만, `model_name`와 `token_name`도 비어 있으므로, 단순히 합산하거나 모델별로 그룹화하면 잘못된 결과가 나옵니다.
</Warning>

## 응답 세부 정보

### 성공 응답 예시

```json theme={null}
{
  "success": true,
  "message": "",
  "data": [
    {
      "request_id": "2026080114481936471351696e93ae3FTV8WKfk",
      "created_at": 1785595715,
      "type": 2,
      "content": "Fixed model price 0.015, group ratio 1",
      "username": "your-account",
      "token_name": "production-primary",
      "token_group": "default",
      "model_name": "gpt-5.6",
      "quota": 7500,
      "prompt_tokens": 1000,
      "completion_tokens": 0,
      "duration_for_view": 16,
      "is_stream": false,
      "error_code": "",
      "other": "{\"billing_type\":\"by_count\",\"request_path\":\"/v1/images/generations\",\"group_ratio\":1,\"model_ratio\":1,\"usage\":{}}"
    }
  ]
}
```

### 주요 응답 필드

| Field Name                            | Type    | Description                                      |
| ------------------------------------- | ------- | ------------------------------------------------ |
| `quota`                               | Integer | **이 호출에 대해 실제로 청구된 금액**, 크레딧 기준; ÷ 500,000 = USD |
| `content`                             | String  | 사람이 읽을 수 있는 가격 설명, 예: 고정 모델 가격 및 그룹 비율           |
| `model_name`                          | String  | 실제로 과금된 모델                                       |
| `token_name`                          | String  | 어떤 API 키가 호출했는지                                  |
| `token_group`                         | String  | token의 그룹 — 참고로 이는 그룹 식별자입니다. FAQ를 참조하십시오        |
| `prompt_tokens` / `completion_tokens` | Integer | 입력 / 출력 token 수                                  |
| `duration_for_view`                   | Integer | 호출 지속 시간(초)                                      |
| `is_stream`                           | Boolean | 호출이 스트리밍되었는지 여부                                  |
| `error_code`                          | String  | 실패 사유 코드; 성공 시 빈 문자열                             |
| `created_at`                          | Integer | 호출 시각, Unix 초                                    |
| `request_id`                          | String  | **요청 ID — 지원 티켓을 열 때 이것을 제공하십시오**                |
| `other`                               | String  | 추가 과금 및 요청 상세, **다시 파싱해야 하는 JSON 문자열**           |

<Info>
  `other` 필드에는 중첩 객체가 아니라 JSON **문자열**이 들어 있으므로 두 번째 파싱이 필요합니다
  (`json.loads()` in Python, `JSON.parse()` in JavaScript). 여기에는 `billing_type`,
  `request_path`(실제로 호출된 엔드포인트), `group_ratio`, `model_ratio`, 그리고 `usage`가 포함됩니다.
</Info>

### 쿼터 변환

<Card title="변환 규칙" icon="calculator">
  500,000 quota = \$1.00 USD
</Card>

**공식:** USD 금액 = `quota` ÷ 500,000

**예시:**

* `quota: 7500` → \$0.015 USD
* `quota: 22500` → \$0.045 USD
* `quota: 18` → \$0.000036 USD

이는 [잔액 조회 API](/ko/api-capabilities/balance-query)에서 사용하는 것과 동일한 변환이므로,
두 값이 정확히 일치합니다.

## 오류 응답

### HTTP 401 - 인증 실패

```json theme={null}
{
  "success": false,
  "message": "You are not authorized to perform this operation. The access token is invalid."
}
```

**원인:** 시스템 token이 유효하지 않거나 만료되었거나, `sk-`로 시작하는 API 키가
실수로 시스템 token으로 사용되었습니다.

**해결 방법:** 콘솔에서 시스템 token을 다시 생성하고, `Authorization`가
원시 값을 **`Bearer` 접두사 없이** 사용하도록 하십시오.

## 코드 예시

### cURL 예시 (단일 페이지, 빠른 확인)

```bash theme={null}
export APIYI_SYS_TOKEN='YOUR_SYSTEM_TOKEN'

# Last hour only. Always pass start/end — a query without a time window will likely time out
END=$(date +%s)
START=$((END - 3600))

curl --compressed -s "https://api.apiyi.com/api/log/self?p=0&pageSize=1000&type=2&start_timestamp=$START&end_timestamp=$END" \
  -H "Authorization: $APIYI_SYS_TOKEN" \
  -H 'Accept: application/json' | jq '.data[] | {created_at, model_name, quota, request_id}'
```

<Warning>
  **`--compressed` 옵션은 필수입니다**, API가 gzip 압축 콘텐츠를 반환하기 때문입니다.
  이 옵션이 없으면 출력이 깨집니다.
</Warning>

<Info>
  이것은 token이 제대로 작동하는지 확인하는 데 사용합니다. 실제 정산에는 아래의 일일 동기화 스크립트를 사용합니다.
</Info>

### Python 예제: 일일 증분 동기화(크론 작업으로 바로 사용할 수 있음)

이것은 **권장 표준 사용법**입니다: 하루에 한 번 실행하여 마지막 동기화 이후 새로 생긴 내용만 가져와 로컬 SQLite 데이터베이스에 기록합니다. 다시 실행해도 안전합니다(기록은 `request_id`에서 중복 제거됨). 실행이 중간에 중단되어도 중단된 지점에서 재개됩니다.

```python theme={null}
"""Daily incremental sync of APIYI call logs. Run once a day, e.g. crontab: 30 2 * * *"""
import json
import os
import sqlite3
import time

import requests

BASE = "https://api.apiyi.com"
TOKEN = os.environ["APIYI_SYS_TOKEN"]
QUOTA_PER_USD = 500_000

DB_PATH = "apiyi_logs.db"
WINDOW = 3600       # width of one time window in seconds; 1 hour suits most accounts
PAGE_SIZE = 1000    # records per page, server max is 5000. NOTE: the param is camelCase
MAX_PAGES = 50      # max pages per window; beyond this the window is split in half
SLEEP = 1.0         # gap between pages — call serially, never concurrently
FIRST_RUN_DAYS = 7  # how far back to backfill on the very first run

HEADERS = {"Authorization": TOKEN, "Accept": "application/json"}


def open_db():
    con = sqlite3.connect(DB_PATH)
    con.execute("""
        CREATE TABLE IF NOT EXISTS logs (
            request_id  TEXT PRIMARY KEY,
            created_at  INTEGER,
            model_name  TEXT,
            token_name  TEXT,
            quota       INTEGER,
            error_code  TEXT,
            raw         TEXT
        )""")
    con.execute("CREATE INDEX IF NOT EXISTS idx_created ON logs(created_at)")
    con.commit()
    return con


def get_page(start, end, page):
    resp = requests.get(
        f"{BASE}/api/log/self",
        headers=HEADERS,
        params={
            "p": page,
            "pageSize": PAGE_SIZE,  # camelCase! page_size is ignored and you get 10 per page
            "type": 2,              # 2 = consumption, the only type used for reconciliation
            "start_timestamp": start,
            "end_timestamp": end,
        },
        timeout=60,                 # the server-side query limit is also 60 seconds
    )
    resp.raise_for_status()
    return resp.json().get("data") or []


def fetch_window(start, end):
    """Fetch [start, end]. Splits the window in half if pagination gets too deep."""
    rows, seen, page = [], set(), 0
    while page < MAX_PAGES:
        data = get_page(start, end, page)
        if not data:
            return rows                      # empty array means this window is done
        fresh = [r for r in data if r.get("request_id") not in seen]
        if not fresh:
            return rows                      # whole page was duplicates, defensive exit
        seen.update(r["request_id"] for r in fresh)
        rows.extend(fresh)
        page += 1
        time.sleep(SLEEP)

    if end - start <= 1:
        return rows
    mid = (start + end) // 2                 # too much volume here: fetch each half separately
    return fetch_window(start, mid) + fetch_window(mid + 1, end)


def sync():
    con = open_db()
    row = con.execute("SELECT MAX(created_at) FROM logs").fetchone()
    cursor = (row[0] + 1) if row and row[0] else int(time.time()) - FIRST_RUN_DAYS * 86400
    now = int(time.time())

    total = 0
    while cursor < now:
        end = min(cursor + WINDOW, now)
        rows = fetch_window(cursor, end)
        con.executemany(
            "INSERT OR IGNORE INTO logs VALUES (?,?,?,?,?,?,?)",
            [(r.get("request_id"), r.get("created_at"), r.get("model_name"),
              r.get("token_name"), r.get("quota"), r.get("error_code"),
              json.dumps(r, ensure_ascii=False)) for r in rows])
        con.commit()
        total += len(rows)
        cursor = end + 1
    print(f"Synced {total} records into {DB_PATH}")
    return con


def report(con, days=1):
    since = int(time.time()) - days * 86400
    print(f"{'MODEL':32s} {'CALLS':>6s} {'SPEND(USD)':>12s}")
    rows = con.execute(
        "SELECT model_name, COUNT(*), SUM(quota) FROM logs "
        "WHERE created_at >= ? GROUP BY model_name ORDER BY SUM(quota) DESC",
        (since,)).fetchall()
    for model, cnt, quota in rows:
        print(f"{model or '(none)':32s} {cnt:6d} {(quota or 0) / QUOTA_PER_USD:12.4f}")
    total = sum((q or 0) for _, _, q in rows)
    print(f"\nTotal ${total / QUOTA_PER_USD:.4f} USD")


if __name__ == "__main__":
    report(sync(), days=1)
```

**샘플 출력:**

```
Synced 570 records into apiyi_logs.db
MODEL                             CALLS   SPEND(USD)
gpt-5.6                             128       2.3850
gemini-3-pro-image                   30       1.3500
deepseek-chat                       412       0.0148

Total $3.7348 USD
```

<Info>
  데이터가 로컬에 있으면, 모델별, 일별, token별로 필요한 모든 분석은 자체 데이터베이스를 대상으로 실행되므로 **그것을 위해 다시는 API를 조회할 필요가 없습니다**. 이는 훨씬 더 빠르며, 이미 보존 기간을 벗어나 오래된 데이터를 원하게 되는 문제도 피할 수 있습니다.
</Info>

### Node.js 예제(단일 시간 창)

같은 아이디어입니다: 시간을 기준으로 분할하고, 순차적으로 페이지를 가져오며, 페이지네이션이 너무 깊어지면 창을 줄입니다.

```javascript theme={null}
const BASE = "https://api.apiyi.com";
const TOKEN = process.env.APIYI_SYS_TOKEN;
const QUOTA_PER_USD = 500_000;
const PAGE_SIZE = 1000;      // server max is 5000
const MAX_PAGES = 50;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getPage(start, end, page) {
  const qs = new URLSearchParams({
    p: String(page),
    pageSize: String(PAGE_SIZE), // camelCase! page_size is ignored and you get 10 per page
    type: "2",                  // 2 = consumption
    start_timestamp: String(start),
    end_timestamp: String(end),
  });
  const resp = await fetch(`${BASE}/api/log/self?${qs}`, {
    headers: { Authorization: TOKEN, Accept: "application/json" },
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const { data } = await resp.json();
  return data || [];
}

// Fetch [start, end]; split the window in half if pagination gets too deep
async function fetchWindow(start, end) {
  const rows = [];
  const seen = new Set();
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const data = await getPage(start, end, page);
    if (data.length === 0) return rows;
    const fresh = data.filter((r) => !seen.has(r.request_id));
    if (fresh.length === 0) return rows;
    fresh.forEach((r) => seen.add(r.request_id));
    rows.push(...fresh);
    await sleep(1000);          // serial, never concurrent
  }
  if (end - start <= 1) return rows;
  const mid = Math.floor((start + end) / 2);
  return [...(await fetchWindow(start, mid)), ...(await fetchWindow(mid + 1, end))];
}

const end = Math.floor(Date.now() / 1000);
const logs = await fetchWindow(end - 3600, end);   // last hour
const total = logs.reduce((sum, r) => sum + (r.quota || 0), 0);
console.log(`${logs.length} calls, $${(total / QUOTA_PER_USD).toFixed(4)} USD`);
```

<Info>
  Python requests 라이브러리와 Node.js fetch API는 모두 gzip을 자동으로 압축 해제하므로,
  별도의 구성이 필요하지 않습니다. curl만 명시적인 `--compressed` 플래그가 필요합니다.
</Info>

## 일반적인 시나리오

### 일일 정산(권장 방식)

위의 Python 스크립트를 하루에 한 번 실행하도록 예약하고 로그를 로컬 데이터베이스에 적재하십시오. 필요한 모든 세부 분석—총 지출, 모델별, token별—은 결국 **자체** 데이터베이스를 대상으로 하는 SQL 쿼리입니다.

이 방식이 적절한 이유는 세 가지입니다. 로컬 쿼리는 빠르고, 로그 보존 기간의 영향을 받지 않으며, 오래된 기록을 반복해서 다시 읽느라 API가 느려지는 일도 피할 수 있습니다.

한 모델의 기록만 동기화하려면 요청에 `model_name` 매개변수를 추가하십시오.

### 실패한 호출 찾기

데이터가 로컬에 있으면 자체 테이블을 직접 조회하십시오:

```sql theme={null}
SELECT created_at, model_name, error_code, request_id
FROM logs
WHERE error_code != '' AND created_at >= strftime('%s', 'now', '-1 day')
ORDER BY created_at DESC;
```

<Info>
  게이트웨이에서 거부된 요청(잘못된 매개변수 등)은 `quota`가 0이며
  **과금되지 않습니다**. 로그의 `error_code`은 “호출이 실패했습니다”와
  “호출은 성공했지만 결과가 마음에 들지 않았습니다”를 구분하는 데 도움이 됩니다.
</Info>

### 지원용 요청 ID 제공

로그에서 문제가 되는 호출을 찾아 지원팀에 `request_id`를 제공하십시오. 그러면 처음부터 끝까지 정확한 요청을 식별할 수 있으므로, “어떤 모델에 대한 호출이 특정 시점쯤 실패했습니다”라고 설명하는 것보다 훨씬 효율적입니다.

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="내 요청이 느리거나 아예 시간 초과됩니다 — 어떻게 해야 합니까?">
    먼저 다음 세 가지를 확인하십시오. 느린 쿼리의 거의 모든 원인은 이 중 하나입니다.

    1. **`start_timestamp`과 `end_timestamp`을 전달하고 있습니까?** 시간 창을 생략하면 이 API를 호출하는 가장 비싼 방법이 됩니다 — 서버가 전체 기록을 검색합니다.
    2. **창이 너무 오래되었거나 너무 넓습니까?** 한 달 전 데이터를 조회하는 비용은 어제 데이터를 조회하는 것보다 훨씬 더 큽니다. 범위는 하루 이내로 유지하고, 트래픽이 많으면 시간 단위로 나누십시오.
    3. **`p`이 몇 천에 도달했습니까?** 페이지네이션 비용은 초선형으로 증가합니다. 해결책은 더 깊게 페이지를 넘기는 것이 아니라, **시간 창을 줄여 각 창에서 몇십 페이지면 충분하도록** 만드는 것입니다.

    **같은 매개변수로 다시 시도해도 더 빨라지지 않습니다.** 시간 초과가 발생하면 동일한 요청을 반복하지 말고 위와 같이 매개변수를 조정하십시오. 단순 재시도는 기다림만 한 번 더 하게 만들 뿐입니다.
  </Accordion>

  <Accordion title="왜 레코드가 10개만 조회됩니까?">
    **열에 아홉은 해당 매개변수가 snake\_case로 `page_size` 표기되어 있기 때문입니다.**

    올바른 표기는 camelCase `pageSize`입니다. 이 엔드포인트에서 camelCase 파라미터는 이것뿐입니다 — 나머지 모든 것(`model_name`, `token_name`, `start_timestamp`, …)은 snake\_case이므로 여기서 실수하기 쉽습니다. 오류를 발생시키지 않으며, 서버는 해당 파라미터가 없는 것으로 처리하고 페이지당 10개 레코드로 되돌아갑니다.

    ```
    ?pageSize=1000    ✅ 1000 records
    ?page_size=1000   ❌ 10 records
    ```

    최대값은 5000이며, 이를 넘기면 명확한 오류가 반환됩니다. 대량의 경우 응답이 빈 배열을 반환할 때까지 여전히 페이지네이션(`p=0`, `p=1`, …)을 해야 합니다 — 위의 Python 및 Node.js 예제에는 이미 이 로직이 포함되어 있습니다.
  </Accordion>

  <Accordion title="request ID로 특정 호출 하나를 조회할 수 있습니까?">
    예 — `request_id`를 전달하면 해당 레코드만 반환됩니다:

    ```bash theme={null}
    curl --compressed -s "https://api.apiyi.com/api/log/self?request_id=YOUR_REQUEST_ID" \
      -H "Authorization: $APIYI_SYS_TOKEN"
    ```

    특정 호출 하나를 조사할 때는 시간 범위를 가져와 직접 필터링하는 것보다 훨씬 빠릅니다.
  </Accordion>

  <Accordion title="응답의 일부 필드가 비어 있습니다 — 문제가 있습니까?">
    아닙니다. 일부 필드는 플랫폼 내부 정보를 담고 있으며, 일반 계정의 관점에서는 비어 있거나 0입니다. 이는 예상된 동작이며 대사나 문제 해결에 필요한 필드에는 영향을 주지 않습니다 — `quota`, `model_name`, `error_code`, `request_id`는 모두 완전히 채워집니다.
  </Accordion>

  <Accordion title="token_group이 콘솔에 표시되는 그룹 이름과 다른 이유는 무엇입니까?">
    API는 그룹 **식별자**를 반환하는 반면, 콘솔은 그룹의 **레이블**을 표시합니다.
    이 둘은 다를 수 있습니다 — 예를 들어 API는 `default`을 반환하는 반면 콘솔에는 Default가 표시됩니다.

    전체 매핑은 공개 엔드포인트 `https://api.apiyi.com/api/pricing`에서
    `usable_group` 필드 아래에서 확인할 수 있으며, 식별자를 레이블에 매핑합니다. 보고서를 콘솔과
    일치시키고 싶다면 해당 매핑을 직접 적용하십시오.
  </Accordion>

  <Accordion title="token 수와 쿼터가 일치하지 않는 것 같습니다 — 어느 쪽이 기준입니까?">
    `quota`를 사용하십시오. 이는 호출에 대해 **실제로 차감된** 금액이며 대사에 적합한 유일한 필드입니다. 이미지 생성 및 동영상 생성과 같은 호출당 과금 모델의 경우 응답의 token 수는 가격 산정에 참여하지 않는 자리표시자 값일 수 있습니다 —
    이러한 모델은 `by_count`을 `other.billing_type`에 보고합니다.
  </Accordion>

  <Accordion title="얼마나 과거까지 조회할 수 있습니까?">
    **동기화 로직은 최근 30일만 조회 가능하다고 가정하고 설계하십시오.**

    실제로는 조회 가능한 범위가 보통 더 길지만, **보관 기간에 대해서는 어떤 약속도 하지 않습니다**
    — 로그 정리 정책에 따라 달라지며, 변경 사항은 별도로 공지되지 않습니다. 30일을 계획상의 최소 기준으로 삼으면 해당 정책이 바뀌어도 대사가 깨지지 않습니다.

    별도로, **창이 오래될수록 조회 비용이 더 많이 듭니다**: 데이터가 아직 남아 있어도
    접근하는 속도가 훨씬 느립니다.

    따라서 올바른 패턴은 **하루에 한 번씩 자체 데이터베이스로 동기화**하고, 과거 분석은 로컬에서 수행하는 것입니다. 장기 보관이 필요한 것은 직접 아카이브하고, 이 API가 다시 가져다주기를 기대하지 마십시오.
  </Accordion>

  <Accordion title="curl이 깨진 텍스트를 반환하거나 jq가 오류를 발생시킵니다">
    **원인:** API가 gzip으로 압축된 콘텐츠(`Content-Encoding: gzip`)를 반환하는데 curl이
    이를 압축 해제하지 않고 있기 때문입니다.

    **해결 방법:** `--compressed` 플래그를 추가하십시오:

    ```bash theme={null}
    curl --compressed 'https://api.apiyi.com/api/log/self?p=0' \
      -H "Authorization: $APIYI_SYS_TOKEN" | jq
    ```

    Python requests 라이브러리와 Node.js fetch API는 자동으로 압축을 해제합니다.
  </Accordion>

  <Accordion title="로그 조회가 쿼터를 소모합니까?">
    아닙니다. 로그 조회 엔드포인트는 어떤 쿼터도 소모하지 않습니다.
  </Accordion>
</AccordionGroup>

## 중요 사항

<Warning>
  **시스템 token은 API key가 아니며, 둘은 서로 호환되지 않습니다**

  * **API key**(`sk-`로 시작)는 `/v1/*` inference 엔드포인트용입니다. 이를
    `/api/log/self`에 사용하면 401이 반환됩니다.
  * **시스템 token**(접두사가 없는 평문 문자열)은 `/api/*` 관리 엔드포인트용입니다.
    이를 `/v1/chat/completions`에 사용하면 잘못된 token 오류가 반환됩니다.

  system token의 범위는 계정 전체에 적용되므로, **계정 비밀번호처럼 취급하십시오**:
  코드가 아니라 시크릿 매니저에 저장하고, 저장소에 절대 커밋하지 말며, 주기적으로 교체하십시오.
</Warning>

<Warning>
  **로그 응답에는 자신의 API key가 일반 텍스트로 포함됩니다**

  각 로그 레코드에는 호출을 만든 token에 대한 정보가 들어 있습니다. **원시 로그 응답을 공개된 곳에 붙여넣거나, 스크린샷을 공유하거나, 제3자에게 넘기지 마십시오** —
  내보내기 전에 민감한 필드를 제거하십시오.

  특히 이 평문에는 `sk-` 접두사가 없으므로, **일반적인 비밀 스캐너가 이를 감지하지 못할 수 있습니다**. 자동 검사에만 의존하여 이를 잡아내려고 하지 마십시오.
</Warning>

<Info>
  **권장 호출 패턴**

  * **하루에 한 번 동기화하십시오** — 더 자주 할 필요가 없습니다. 각 실행은 새로 추가된 것만 가져옵니다
  * **10의 기본값이 아니라 `pageSize`을 1000–5000으로 사용하십시오** — 이 항목이 나머지를 모두 합친 것보다 더 중요합니다
  * **순차적으로 호출하십시오**, 페이지 사이에 대략 1초 간격을 두고, **절대 동시에 실행하지 마십시오**
  * 클라이언트 타임아웃을 60초로 설정하십시오(서버 측 쿼리 제한도 60초입니다)
  * 각 시간 창은 하루 이하로 유지하십시오. 대량 계정은 시간 단위로 분할하십시오
  * 타임아웃이 발생하면 **재시도하기 전에 창을 줄이십시오** — 동일한 재시도는 더 빨라지지 않습니다

  이것들은 엄격한 쿼터가 아니라, 자신의 데이터를 꺼내는 가장 빠른 방법일 뿐입니다. 이 패턴을 따르면 일반적인 계정은 하루치 로그를 1분 이내에 동기화할 수 있으며, 하루에 수십만 건의 호출을 하는 대규모 계정도 약 100개의 요청만 있으면 됩니다.

  <Warning>
    **향후 이 엔드포인트에 요청 제한을 도입할 권리를 보유합니다.**

    현재는 요청 제한이 없지만, 작업을 “무제한”에 맞춰 설계하지 마십시오. 위의 패턴 — 하루에 한 번, 순차적으로, 큰 `pageSize` — 을 따르면 향후 요청 제한의 영향을 받지 않습니다.
  </Warning>
</Info>

<Card title="관련 문서" icon="link">
  * [Balance Query API](/ko/api-capabilities/balance-query) — 남은 계정 크레딧 확인
  * [Token Management API](/ko/api-capabilities/token-management) — API key를 프로그래밍 방식으로 생성 및 관리
  * [내 호출 기록을 보는 방법](/ko/faq/call-logs) — 콘솔에서 수동으로 확인
  * [로그와 과금을 이해하기](/ko/faq/log-billing-explained) — 과금 필드를 읽는 방법
</Card>
