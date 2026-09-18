> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 제출 후 Seedance 동영상 작업을 취소할 수 있나요?

> Seedance 2.0 작업 취소, 중복 제출 및 과금 검토.

## 간단한 답변

현재 공개된 Seedance 2.0 API 문서에 따르면, API는 작업 생성 및 작업 상태 조회를 제공하지만 작업 취소 또는 삭제 엔드포인트는 제공하지 않습니다.

작업이 성공적으로 생성되면 API는 `task_id`을 반환합니다. 클라이언트 타임아웃, 네트워크 중단, 웹 페이지 닫기 또는 폴링 중지는 작업이 취소되었다는 증거로 간주해서는 안 됩니다. 재시도 여부를 결정하기 전에 원래 작업을 조회하여 중복 작업을 생성하지 않도록 하십시오.

## 공개 엔드포인트 및 작업 상태

Seedance 2.0은 현재 비동기 작업 엔드포인트를 사용합니다.

| 작업    | 엔드포인트                                                  | 설명                                 |
| ----- | ------------------------------------------------------ | ---------------------------------- |
| 작업 생성 | `POST /seedance/api/v3/contents/generations/tasks`     | 동영상 생성 작업을 제출하고 성공 시 작업 ID를 반환합니다  |
| 작업 조회 | `GET /seedance/api/v3/contents/generations/tasks/{id}` | 작업 상태를 조회하고 성공 후 동영상 URL을 반환합니다    |
| 작업 취소 | 현재 공개 문서에 제공되지 않음                                      | 현재 공개적으로 문서화된 취소 또는 삭제 엔드포인트가 없습니다 |

작업은 일반적으로 다음 수명 주기를 따릅니다.

```text theme={null}
queued → running → succeeded / failed / expired
```

* `queued`: 작업이 생성되었으며 대기열에서 대기 중입니다.
* `running`: 작업이 처리 중입니다.
* `succeeded`: 동영상 생성이 성공적으로 완료되었습니다.
* `failed`: 작업 처리에 실패했습니다.
* `expired`: 작업이 실행 시간 윈도우를 초과하여 만료되었습니다.

생성이 성공하면 동영상 URL이 다음 위치에 반환됩니다.

```text theme={null}
content.video_url
```

이는 임시 서명 URL입니다. 현재 문서에 따르면 약 24시간 동안 유효합니다. 작업이 성공한 후 즉시 동영상을 다운로드하여 저장해야 합니다.

<Warning>
  현재 공개 API 문서에는 작업 취소 엔드포인트가 제공되지 않습니다. 로컬 스크립트를 중지하거나 폴링을 중지하면 클라이언트가 조회하는 동작만 중지될 뿐이며, 서버 측 작업이 철회되었다는 의미는 아닙니다.
</Warning>

## What should I do after submitting a task?

### Step 1: Save the task ID and request details

Save the returned `task_id` immediately after the creation request succeeds.

You should also record:

* The model name;
* The prompt or a prompt summary;
* Important parameters such as duration, resolution, and aspect ratio;
* The submission time;
* The request ID;
* The business ID in your own system.

These details help you query the task, troubleshoot problems, and reconcile billing records later.

### Step 2: Query the original task

Seedance 2.0 tasks usually take minutes. The current API documentation recommends:

* Waiting about 20–30 seconds after submission before the first query;
* Querying every 10–20 seconds afterward;
* Not resubmitting immediately just because the video is not available yet.

Example task query:

```bash theme={null}
curl "https://api.apiyi.com/seedance/api/v3/contents/generations/tasks/YOUR_TASK_ID" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Replace the placeholders with real values:

* `YOUR_TASK_ID`: The task ID returned by the task-creation endpoint;
* `YOUR_API_KEY`: An API key created in the APIYI console.

### Step 3: Handle each task status

Handle the returned status as follows:

* `queued`: The task is still waiting; continue waiting and querying.
* `running`: The task is still generating; continue waiting and querying.
* `succeeded`: Download the video from `content.video_url` immediately.
* `failed`: Inspect the `error` information in the response.
* `expired`: Review the task details and call logs to determine why it expired.

Do not treat `queued` or `running` as failures, and do not create another task just because the current task has not finished.

### Step 4: Confirm the task status after a client timeout

Do not retry immediately if the client did not receive a complete response.

Check the following in order:

1. Check whether the client response already contains a `task_id`.
2. Check whether the console call logs contain a task record.
3. If a `task_id` exists, query the original task first.
4. If no `task_id` is visible yet, do not conclude from the network error alone that no task was created.
5. If you cannot confirm whether the task was created, ask support to verify it before retrying.

A client timeout only means that the client did not receive a response within the expected time. It does not, by itself, prove that the server did not create a task.

## 중복 제출을 방지하려면 어떻게 해야 하나요?

다음은 필수 플랫폼 규칙이 아닌, 통합 측 엔지니어링 권장 사항입니다:

* 각 요청에 고유한 비즈니스 ID를 생성합니다.
* 비즈니스 ID와 Seedance `task_id` 간의 매핑을 저장합니다.
* 사용자가 요청을 제출한 후 제출 버튼을 일시적으로 비활성화합니다.
* 클라이언트 타임아웃 또는 프로세스 종료 후에는 원래 작업을 조회하여 재개합니다.
* prompt, 모델, 기간, 종횡비 및 참조 자료 세부 정보를 저장합니다.
* 원래 작업이 존재하지 않거나 명확하게 실패했음을 확인한 후에만 새로 제출합니다.
* 진행 중 상태와 종료 상태를 구분합니다. `queued` 또는 `running`를 실패로 간주하지 마십시오.

에이전트, 스크립트 및 백그라운드 서비스에서는 작업 생성과 작업 조회를 별도의 작업으로 유지하십시오:

```text theme={null}
Create task: execute once
Save task_id: write it to a database or task record
Query task: poll by task_id
Recover process: read the saved task_id and continue querying
```

이렇게 하면 로컬 재시작 후 다른 작업을 생성하는 대신 원래 작업의 조회를 재개할 수 있습니다.

## 중복 제출 후 과금을 어떻게 조정해야 합니까?

현재 Seedance 2.0 문서에서는 과금 흐름을 다음과 같이 설명합니다.

```text theme={null}
Pre-charge when the task is submitted → refund the difference or settle the final amount after completion
```

따라서 잔액 변경 및 로그 항목이 단일 작업으로 표시되지 않을 수 있습니다. 개요 문서에서도 하나의 동영상 작업이 선차감 및 이후 정산에 대한 여러 로그 항목에 해당할 수 있다고 설명합니다. 최종 기준으로 호출 로그를 사용하시기 바랍니다.

현재 문서에서는 작업이 성공적으로 생성되지 않은 상태에서 잘못된 매개변수로 인해 거부된 요청(예: `InvalidParameter` HTTP 400 요청)에는 과금되지 않는다고도 설명합니다.

그러나 다음 항목만으로는 과금이 이루어졌는지 판단할 수 없습니다.

* 클라이언트의 타임아웃
* 네트워크 연결 끊김
* `failed`
* `expired`
* 클라이언트가 완전한 응답을 수신하지 못한 경우
* 서버에서 작업을 생성했을 수 있음에도 클라이언트에 요청 실패가 표시되는 경우

여러 작업이 이미 생성된 경우 새 작업 제출을 중지하고 다음 정보를 수집하시기 바랍니다.

* 관련된 모든 Seedance `task_id` 값
* 해당 요청 ID
* 제출 시간
* 모델 이름
* 중요한 요청 매개변수
* 콘솔 호출 로그
* 과금 또는 청구 기록의 스크린샷

그런 다음 수동 검토를 위해 지원팀에 문의하시기 바랍니다. 작업에 과금되었는지, 중복 과금이 발생했는지, 과금 관련 조치가 가능한지는 작업 기록, 호출 로그, 과금 기록 및 플랫폼의 검토 결과를 바탕으로 판단해야 합니다.

<Note>
  `failed`, `expired` 또는 클라이언트의 타임아웃만을 근거로 작업에 과금되었거나 과금되지 않았다고 단정하지 마시기 바랍니다.
</Note>

## 자주 묻는 질문

### 폴링을 중지하면 Seedance 작업도 자동으로 중지됩니까?

그렇게 단정할 수 없습니다.

폴링을 중지한다는 것은 클라이언트가 더 이상 작업 상태를 조회하지 않는다는 의미일 뿐입니다. 현재 공개 API 문서에는 취소 엔드포인트가 제공되지 않으므로, 폴링을 중지한다고 해서 서버 측 작업이 취소되었다는 의미는 아닙니다.

원본 `task_id`을 저장하고 나중에 다시 조회하십시오.

### 요청 시간 초과 후 즉시 재시도해도 됩니까?

즉시 재시도하는 것은 권장하지 않습니다.

먼저 다음을 확인하십시오.

* 응답에 `task_id`이 포함되어 있는지 여부
* 콘솔 호출 로그에 작업 레코드가 있는지 여부
* 원본 작업의 현재 상태
* 해당 과금 레코드가 이미 존재하는지 여부

원본 작업이 생성되었다면 동일한 비즈니스 요청에 대해 다른 작업을 생성하기 전에 해당 작업을 조회하십시오.

### 실패 또는 만료 상태라고 해서 항상 과금되지 않았다는 의미입니까?

작업 상태만으로는 과금 결과를 판단할 수 없습니다.

Seedance 2.0은 제출 시 선과금한 후 완료 시 정산하는 방식을 사용합니다. 호출 로그와 과금 레코드를 모두 확인하십시오. 레코드가 올바르지 않은 것으로 보이면 검토를 위해 작업 ID와 요청 ID를 고객지원팀에 제공하십시오.

### 유효하지 않은 매개변수로 인해 발생한 HTTP 400에는 과금됩니까?

현재 문서에 따르면, 작업을 생성하지 않고 유효하지 않은 매개변수로 인해 거부된 요청에는 과금되지 않습니다.

예시는 다음과 같습니다.

* 유효하지 않은 매개변수 형식
* 지원되지 않는 해상도
* 유효하지 않은 화면 비율
* 지원되지 않는 동영상 길이
* 호환되지 않는 모델 및 매개변수 조합

모든 HTTP 400 응답을 동일한 사례로 분류하지 마십시오. 구체적인 오류 메시지, 작업 레코드 및 호출 로그를 최종 참조로 사용하십시오.

### 생성된 동영상 URL을 얼마나 오래 보관할 수 있습니까?

현재 문서에 따르면 성공 응답의 `content.video_url`은 약 24시간 동안 유효한 임시 서명 URL입니다.

작업이 `succeeded`에 도달하는 즉시 동영상을 다운로드하여 저장하십시오. 해당 URL을 영구적인 URL로 취급하지 마십시오.

현재 문서에는 작업 ID 자체가 7일 동안 보관된다고도 명시되어 있습니다. 비즈니스 추적을 위해 자체 작업 레코드도 저장해야 합니다.

## 관련 문서

* [Seedance 2.0 동영상 생성 API](/ko/api-capabilities/seedance2/video-generation)
* [Seedance 2.0 동영상 생성 개요](/ko/api-capabilities/seedance2/overview)
* [모델 오류는 어떻게 해결하나요?](/ko/faq/model-error-troubleshooting)
* [task\_id로 Seedance 동영상의 실제 비용을 조회하는 방법](/ko/faq/seedance-task-cost-lookup)

## 지원팀 문의

다음과 같은 경우 지원팀에 문의하여 도움을 받으십시오.

* `queued` 또는 `running` 상태가 비정상적으로 오래 지속되는 경우
* 클라이언트 타임아웃 후 작업이 생성되었는지 확인할 수 없는 경우
* 중복 제출 후 여러 작업이 생성된 경우
* 작업 상태와 과금 기록이 일치하지 않는 경우
* 작업은 성공했지만 동영상을 반환하지 않거나 다운로드할 수 없는 경우

지원팀에 문의할 때는 다음 정보를 가능한 한 많이 제공하십시오.

* Seedance `task_id`
* 요청 ID
* 제출 시간
* 모델 이름
* 주요 요청 매개변수
* 콘솔 호출 로그
* 관련 과금 기록

지원 문의 경로: [WeCom의 APIYI 지원팀](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)
