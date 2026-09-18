> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# task_id로 Seedance 동영상의 실제 비용을 조회하려면 어떻게 해야 하나요?

> 하나의 동영상에 로그에는 두 개의 청구 항목이 표시되고 작업 상세에는 단일 쿼터가 표시됩니다. 세 숫자의 관계와 task_id를 통해 프로그래밍 방식으로 동영상의 최종 비용을 가져오는 방법은 다음과 같습니다.

## 짧은 답변

**`task_id`으로 작업 API를 조회하십시오. 반환된 `quota`이 동영상의 총 비용입니다.** 두 로그 항목(사전 과금 + 정산)의 합계가 이 값과 일치하며, “비동기 작업” 상세 보기의 `quota`도 동일한 값입니다.

```bash theme={null}
curl --compressed -s "https://api.apiyi.com/api/task/self?p=1&page_size=1&task_id=<your task_id>" \
  -H "Authorization: $APIYI_SYS_TOKEN" | jq '.data.items[0] | {task_id, status, quota, submit_time, finish_time}'
```

`quota ÷ 500,000 = USD`. **시스템 token**으로 인증하십시오(`sk-` API 키가 아님). 발급 방법은 [로그 쿼리 API](/ko/api-capabilities/log-query)를 참조하십시오.

로그 쿼리 API를 통해 로그 항목을 하나씩 연결하려고 하지 마십시오. 두 항목 모두 `task_id`을 포함하지 않으며, 정산 항목의 `request_id`은 비어 있습니다.

## 세 숫자의 관계

Seedance 동영상은 "제출 시 선청구, 완료 시 차액 정산" 방식으로 과금되므로, 동영상 하나에 두 개의 로그 항목이 남는 반면 작업 API와 작업 상세 보기에는 단일 `quota`가 표시됩니다:

| 위치                     | 값          | 의미                                                                                                                         |
| ---------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| 로그 항목 1 (선청구)          | 예: 224,999 | 요청 파라미터를 기준으로 추정되어 제출 시 차감됩니다. `completion_tokens`은 0이고, `request_id`가 존재합니다                                               |
| 로그 항목 2 (정산)           | 예: 702,613 | 완료 시 실제 tokens를 기준으로 총액이 다시 계산되며 **차액만 기록됩니다** (양수 = 추가 청구, 음수 = 환불). `completion_tokens`은 실제 사용량이고, `request_id`는 비어 있습니다 |
| 작업 API / 작업 상세 `quota` | 예: 927,612 | **두 항목의 합계 = 최종 총비용** = 실제 tokens × 모델 비율 × 그룹 비율                                                                          |

정산은 환불일 수도 있습니다. 빠른 480p 4초 텍스트-투-비디오 작업은 144,000이 선청구되었고, 40,594 tokens × 18.5 × 0.18 = 135,179를 사용했으므로 정산 항목에는 −8,821(\$0.02 환불)이 기록되며 작업 API `quota`는 135,179입니다.

첫 번째 숫자 세트는 참조 동영상이 있는 실제 2.0 이미지-투-비디오 작업에서 가져온 것입니다: 368,100 tokens × 14(동영상 입력 가격 책정 티어) × 0.18(그룹 비율) = 927,612, 즉 \$1.86입니다. 정산 항목의 `other` 필드에는 `final_quota` = 927,612, `original_quota` = 224,999 및 `adjustment_quota` = 702,613이 포함되어 있으므로, 세 값 모두 하나의 레코드에서 확인할 수 있습니다.

## 상태별 실제 비용 확인

| `status`                    | `quota`의 의미                           | 동영상의 실제 비용                                                                   |
| --------------------------- | ------------------------------------- | ---------------------------------------------------------------------------- |
| `completed`                 | 최종 정산 총액                              | = `quota`                                                                    |
| `submitted` / `in_progress` | 제출 시 부과된 사전 청구 금액만 표시                 | 완료될 때까지 기다리십시오                                                               |
| `failed`                    | **여전히 사전 청구 금액이 표시되며, 0으로 처리되지 않습니다** | **0**. 사전 청구 금액은 전액 환불되며, `content`에 task\_id가 포함된 음수 `type=11` 로그 항목이 생성됩니다 |

두 용어 체계는 서로 다릅니다. 동영상 조회 엔드포인트 `/seedance/api/v3/.../tasks/{id}`은 성공을 `succeeded`로 보고하는 반면, 작업 API `/api/task/self`은 이를 `completed`로 보고합니다. 폴링 코드의 조건을 그대로 복사하지 마십시오.

<Warning>
  실패한 작업의 `quota`을 합산하면 사전 청구 금액이 지출로 계산됩니다. 프로그래밍 방식으로 정산을 대조할 때는 `status`으로 필터링하십시오. 대신 로그 조회 API를 통해 정산을 대조하는 경우 **`type=2`과 `type=11`을 모두 조회**해야 하며, 후자는 음수 `quota`이 포함된 환불 항목입니다.
</Warning>

## 매개변수 표기(로그 쿼리 API와 반대)

작업 API의 페이지 매김 매개변수는 \*\*스네이크 케이스 `page_size`\*\*이며 페이지 번호 **`p`은 1부터 시작합니다**. 로그 쿼리 API는 `pageSize` 카멜 케이스를 사용하며 `p`은 0부터 시작합니다. 잘못 사용해도 오류가 발생하지 않으며, 기본 페이지가 반환됩니다.

확인된 필터:

| 매개변수                                | 설명                                               |
| ----------------------------------- | ------------------------------------------------ |
| `task_id`                           | 작업 하나만 가져옵니다                                     |
| `model_name`                        | 모델로 필터링합니다(예: `doubao-seedance-2-0-fast-260128`) |
| `start_timestamp` / `end_timestamp` | Unix 초 단위이며 제출 시간으로 필터링합니다                       |
| `p` / `page_size`                   | 페이지 매김이며 `p`은 1부터 시작합니다                          |

배치 대조를 수행하려면 시간 범위로 조회합니다. 각 항목에는 `task_id`, `status`, `quota`, `submit_time`, `finish_time` 및 `model_name`이 포함됩니다.

```python theme={null}
import os, time, requests

BASE = "https://api.apiyi.com"
HEADERS = {"Authorization": os.environ["APIYI_SYS_TOKEN"], "Accept": "application/json"}

def video_cost(task_id: str):
    """Return (status, cost in USD). Failed tasks cost 0; in-progress tasks return None."""
    r = requests.get(f"{BASE}/api/task/self", headers=HEADERS, timeout=60,
                     params={"p": 1, "page_size": 1, "task_id": task_id})
    r.raise_for_status()
    items = r.json()["data"]["items"]
    if not items:
        return None, None
    task = items[0]
    status = task["status"]
    if status == "completed":
        return status, task["quota"] / 500_000
    if status == "failed":
        return status, 0.0
    return status, None          # submitted / in_progress: quota is only the pre-charge, do not book it yet

def list_tasks(start: int, end: int, page_size: int = 100):
    """Page through a submission-time window; p starts at 1, stop on an empty page."""
    p = 1
    while True:
        r = requests.get(f"{BASE}/api/task/self", headers=HEADERS, timeout=60,
                         params={"p": p, "page_size": page_size,
                                 "start_timestamp": start, "end_timestamp": end})
        r.raise_for_status()
        items = r.json()["data"]["items"]
        if not items:
            return
        yield from items
        p += 1
        time.sleep(1)
```

## 수동으로 로그에서 교차 확인해야 하는 경우

정산 항목 행의 세 필드는 작업 API와 일치합니다.

* 해당 항목의 타임스탬프(`created_at`)는 1초 이내 오차 범위에서 작업의 `finish_time`과 같습니다.
* 해당 항목의 `completion_tokens`는 작업의 `usage.completion_tokens`과 같습니다.
* 해당 항목의 `other.final_quota`는 작업의 `quota`과 같습니다.

선청구 항목의 `request_id`는 제출 응답의 **`X-Shellapi-Request-Id`** 헤더와 같으므로 `/api/log/self?request_id=…`을 사용하여 조회할 수 있습니다. 응답에는 `X-Request-Id` 헤더도 포함되어 있습니다. 이는 제공업체 측 요청 ID이므로 APIYI 로그에서는 찾을 수 없습니다. 그러나 **같은 초에 여러 작업이 제출되면 선청구 항목이 충돌하며**, 정산 항목에는 `request_id`이 없으므로 로그는 개별 작업을 표본 확인하는 용도로만 적합합니다. 프로그래밍 방식의 대사에는 작업 API를 사용하십시오.

## FAQ

<AccordionGroup>
  <Accordion title="작업 세부 정보의 쿼터가 두 로그 항목의 합계와 다른 이유는 무엇입니까?">
    먼저 작업 상태를 확인하십시오. `submitted` / `in_progress` 중에는 `quota`가 사전 청구 항목일 뿐이며 두 번째 로그 항목은 아직 존재하지 않습니다. `failed`일 때는 `quota`에 여전히 사전 청구가 표시되지만 로그에는 음수 환불 항목이 추가되므로 두 항목의 합계는 0입니다. `completed` 작업에서는 두 항목이 일치해야 합니다. 일치하지 않으면 `task_id`를 지원팀에 보내십시오.
  </Accordion>

  <Accordion title="정산 항목에 token과 request_id가 없는 이유는 무엇입니까?">
    정산은 작업이 완료될 때 시스템에서 게이트웨이 요청 경로 외부에서 기록하므로 token, 그룹 또는 `request_id`가 포함되지 않으며, 콘솔에는 “streaming”으로 표시됩니다. 정상적인 동작입니다.
  </Accordion>

  <Accordion title="일반 동영상 엔드포인트를 통해 제출한 작업도 로그에 task_id가 포함됩니까?">
    `/v1/videos` 및 기타 일반 엔드포인트에서는 사전 청구 항목의 `content`에 `task ID: cgt-…`가 포함되지만, 정산 항목에는 여전히 포함되지 않습니다. 또한 현재 해당 엔드포인트에서는 Seedance의 해상도 매개변수가 불완전하게 전달되므로 항상 문서화된 경로 `/seedance/api/v3/contents/generations/tasks`를 사용하십시오. [동영상 생성 API](/ko/api-capabilities/seedance2/video-generation)를 참조하십시오.
  </Accordion>

  <Accordion title="시스템 token으로 다른 계정의 작업을 볼 수 있습니까?">
    `/api/task/self`는 token을 소유한 계정의 작업만 반환합니다. 시스템 token은 계정 자격 증명과 동일하므로 비밀번호처럼 보호하고 코드 저장소에 포함하지 마십시오.
  </Accordion>
</AccordionGroup>

## 관련 문서

* [Seedance 2.0 / 2.5: 로그에서 비용 확인하기](/ko/api-capabilities/seedance2/overview)
* [로그 조회 API](/ko/api-capabilities/log-query)
* [Seedance 동영상 작업은 제출 후 취소할 수 있나요?](/ko/faq/seedance-video-task-cancel)
* [API 호출의 사전 차감 메커니즘이란 무엇인가요?](/ko/faq/pre-deduction-quota)
