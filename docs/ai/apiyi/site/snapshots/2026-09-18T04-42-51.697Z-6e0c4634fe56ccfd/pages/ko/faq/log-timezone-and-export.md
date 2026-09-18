> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 로그 시간대 설정과 데이터 내보내기에 대해 무엇을 알아야 하나요?

> 계정 시간대는 기본값인 UTC+0으로 유지하고 콘솔의 시간대 전환 제안을 무시하십시오. 모든 내보내기 파일(내보내기 및 Billing Summary)은 항상 UTC+0이며, 로그 상세 목록과 호출 데이터 차트는 계정 시간대를 따릅니다 — 두 항목의 불일치가 8시간 정산 차이를 발생시킵니다.

## 간단 답변

<CardGroup cols={3}>
  <Card title="계정 시간대를 UTC+0로 유지합니다" icon="globe">
    기본 `London (UTC+0/+1)` 설정이 올바른 설정입니다 — **변경하지 마십시오**. 로그는 UTC에 저장되므로 UTC+0이 데이터 소스와 일치합니다
  </Card>

  <Card title="제안 대화상자를 닫습니다" icon="bell-off">
    콘솔이 다른 기기 시간대를 감지하면 “로컬 설정 제안” 대화상자를 표시합니다 — 왼쪽의 무시 버튼을 선택하고 전환 버튼은 선택하지 마십시오
  </Card>

  <Card title="모든 내보내기 파일은 UTC+0입니다" icon="download">
    계정 시간대와 관계없이 내보내기와 과금 요약 버튼은 모두 UTC+0로 파일을 내보냅니다. *페이지에* 표시되는 시간은 대신 계정 시간대를 따릅니다
  </Card>
</CardGroup>

<Warning>
  **이미 변경했다면 `London (UTC+0/+1)`로 다시 설정하십시오.** 시간대는 데이터가 표시되는 방식에만 영향을 미칩니다 — **통화 데이터는 수정되거나 손실되지 않으며**, 내보내기 파일은 항상 UTC+0이므로 영향을 받지 않습니다. 다시 설정하면 페이지와 내보내기 파일이 다시 같은 기준이 됩니다.
</Warning>

<Info>
  **한 줄로 정리하면**: 사용자가 **내보내는** 모든 것 — 내보내기 파일, 과금 요약, 그리고 `created_at` [로그 조회 API](/ko/api-capabilities/log-query)에서 가져온 항목 — 은 **UTC+0**입니다. 페이지에서 **읽는** 모든 것 — 상세 목록과 차트 — 은 **계정 시간대**를 따릅니다.
</Info>

## 계정 시간대를 확인하는 위치

현재 계정 시간대는 콘솔의 사용자 정보 섹션에 표시됩니다. 이는 `London (UTC+0/+1)`로 표시되어야 하며, UTC+0입니다.

<Frame caption="The timezone setting in the console's User Info section — it should read London (UTC+0/+1)">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-user-info-timezone.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=94b725d2393ee1ff84eda7b4c1360743" alt="콘솔 사용자 정보 섹션에서 시간대가 런던(UTC+0/+1)으로 설정된 모습" width="892" height="332" data-path="images/console-user-info-timezone.png" />
</Frame>

## 제안 대화 상자가 표시될 때 "일시적으로 무시"(Dismiss)를 선택합니다

계정 시간대(UTC)가 현재 기기 시간대와 다를 때(예: `Asia/Shanghai`), 콘솔에서 전환을 제안하는 “로컬 설정 제안”(Local Settings Suggestion) 대화 상자가 열립니다.

<Frame caption="The Local Settings Suggestion dialog — choose 暂时忽略 (Dismiss) on the left">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-timezone-local-settings-dialog.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=974f0da20864d287c8e2cb82e75f45b6" alt="로컬 설정 제안 대화 상자, 계정 시간대 UTC 및 기기 시간대 Asia/Shanghai가 표시되고 무시 및 전환 버튼이 있는 상태" width="1054" height="546" data-path="images/console-timezone-local-settings-dialog.png" />
</Frame>

<Warning>
  **일시적으로 무시(Dismiss)를 선택하고 — 전환하지 마십시오.** 전환한 후에는 Logs 페이지 상단의 **호출 데이터 개요(Call Data Overview)** 차트가 올바르게 렌더링되지 않습니다. 시간 버킷이 더 이상 차트 범위와 맞지 않아, 데이터가 전체적으로 누락되었거나 이동한 것처럼 보입니다.
</Warning>

영향을 받는 섹션은 다음과 같습니다:

<Frame caption="The Call Data Overview at the top of the Logs page — this chart misaligns once the account timezone is switched">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-log-call-data-overview.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=246553c9d4025e4bf5aaae4598f39866" alt="콘솔 Logs 페이지 상단의 빨간색 테두리로 표시된 호출 데이터 개요 항목" width="1002" height="374" data-path="images/console-log-call-data-overview.png" />
</Frame>

로그 상세 목록의 타임스탬프도 계정 시간대를 따릅니다. **내보내기 파일은 그렇지 않으며 — 항상 UTC+0입니다.** 계정을 UTC+0으로 유지하면 상세 목록, 차트, 내보내기 파일의 기준이 하나로 맞춰지므로, 하나의 고정 오프셋만 적용하면 됩니다.

## 어떤 내보내기를 사용해야 합니까?

로그 페이지 오른쪽 상단에는 두 개의 버튼, 내보내기와 과금 요약이 있습니다.

<Frame caption="The Export and Billing Summary buttons in the top-right corner of the Logs page">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-log-export-buttons.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=d8f2d7b0359ddcf6aebdd66399bfcffe" alt="로그 페이지 툴바에서 왼쪽에 내보내기 버튼, 오른쪽에 과금 요약 버튼이 있는 모습" width="650" height="212" data-path="images/console-log-export-buttons.png" />
</Frame>

|        | 내보내기                | 과금 요약               |
| ------ | ------------------- | ------------------- |
| 시간대 기준 | **항상 UTC+0**        | **항상 UTC+0**        |
| 세분화 수준 | 개별 호출 기록(선택 가능한 필드) | 날짜별로 집계된 과금         |
| 규모     | 대량 배치, 비동기적으로 실행 가능 | 소량, 바로 다운로드         |
| 적합한 용도 | 대사, 감사, 맞춤 분석       | 특정 기간의 총 과금을 빠르게 확인 |

두 버튼은 계정 시간대 설정과 무관하게 **같은 시간대 기준, UTC+0**을 사용하며, 차이는 세분화 수준과 규모뿐입니다. 필요한 내용이 개별 기록인지 일별 합계인지에 따라 맞는 버튼을 선택하십시오.

### 페이지와 내보내기 파일의 내용이 다르게 보이는 것은 예상된 동작입니다

대사를 할 때 가장 쉽게 틀리는 부분은 이것입니다. **페이지는 계정 시간대를 따르고, 내보내기 파일은 UTC+0입니다.**

계정 시간대가 UTC+8로 변경된 경우, **2026-08-14 00:30 (UTC+8)** 에 발생한 호출은 다음과 같이 표시됩니다.

* `2026-08-14 00:30` **페이지 상세 목록**에서는 8월 14일로 집계됩니다
* `2026-08-13 16:30` (UTC+0) **내보내기 파일**에서는 8월 13일로 집계됩니다

따라서 "00:00부터 08:00 (UTC+8) 사이의 호출이 오늘 합계에서 빠진다"는 말이 나오지만, 실제로는 아무것도 손실된 것이 아니며 두 화면이 단지 8시간 차이일 뿐입니다.

<Tip>
  **계정 시간대를 `London (UTC+0/+1)`로 되돌리면 두 기준이 같아지므로** 가장 간단한 해결책입니다.
  다른 이유로 로컬 시간대를 유지해야 한다면, 내보내기 파일을 기준으로 삼고 아래의 스프레드시트나 스크립트에서 일관되게 변환하십시오.
</Tip>

### 내보내기 → 백그라운드 비동기 내보내기(권장)

행 단위 과금 기록이 필요할 때는 내보내기 버튼을 사용하고, 대화상자에서 **백그라운드 비동기 내보내기**를 선택하십시오.

<Frame caption="The export dialog — select background async export for large volumes">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-log-async-export-dialog.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=09865097dc2f80581a82e2d7feb06f3c" alt="필드 선택, 현재 페이지 내보내기와 백그라운드 비동기 내보내기, Excel 및 CSV 형식, 최대 기록 수를 보여주는 내보내기 대화상자" width="974" height="1312" data-path="images/console-log-async-export-dialog.png" />
</Frame>

핵심 사항:

* **시간대는 항상 UTC+0입니다.** 계정 설정과 무관하며, 저장된 로그 자체를 내보내기 때문입니다. 로컬 시간으로 직접 변환하십시오(UTC+8 사용자는 8시간을 더하면 됩니다)
* **선택 가능한 필드**: 사용 시간, 요청 ID, token 이름, 모델 이름 등 — 대사에 필요한 항목을 선택하십시오
* **내보내기 모드**: 대량 데이터는 백그라운드 비동기 내보내기를 선택하십시오. 이 작업은 페이지를 막지 않고 백그라운드에서 실행되며, 10,000건을 넘는 경우 권장됩니다
* **형식**: Excel (`.xlsx`, 매우 큰 내보내기는 자동으로 분할되어 압축됩니다) 또는 CSV (`.csv`, 소규모용)
* **최대 기록 수**: `0`는 무제한을 의미합니다(서버가 여러 개의 Excel 파일로 분할한 뒤 압축합니다). 상한은 5천만 건입니다
* **진행 상황**: 작업이 생성되면 任务管理 (작업 관리) 페이지에서 진행 상황과 상태를 확인한 다음 파일을 다운로드하십시오

전체 내보내기 절차와 보관 방법은 [호출 로그는 얼마나 보관됩니까?](/ko/faq/log-retention-policy)를 참조하십시오.

## 실무에서의 조정

<Steps>
  <Step title="먼저 모든 것을 하나의 시간대로 변환하십시오">
    * **읽기 쉬운 타임스탬프**: 베이징 시간을 얻으려면 8시간을 더하십시오. `2026-08-14 00:30:00 UTC+0`은 `2026-08-14 08:30:00 (UTC+8)`가 됩니다
    * **Unix 초** (`created_at` from the [Log Query API](/ko/api-capabilities/log-query)): 값에 **28800**(8 × 3600)을 더하십시오
  </Step>

  <Step title="달력일 단위로 버킷하기 전에 변환하십시오">
    Excel이나 자체 스크립트에서 먼저 모든 타임스탬프를 이동한 다음, **그다음** `YYYY-MM-DD`로 버킷하십시오.
    내보내기의 날짜 열을 기준으로 바로 조정하지 마십시오 — 이것이 페이지와 파일의 내용이 달라지는 가장 흔한 원인입니다.
  </Step>

  <Step title="문제를 보고할 때 UTC+0와 UTC+8를 모두 명시하십시오">
    지원팀은 로그를 UTC+0 기준으로 검색합니다. 비즈니스 동료들은 베이징 시간을 알아볼 것입니다. 둘 다 제공하면 왕복 확인을 줄일 수 있습니다.
  </Step>
</Steps>

<Tip>
  *영업일*로 나누어야 하는 조정 또는 감사 작업의 경우, CSV 내보내기보다 [Log Query API](/ko/api-capabilities/log-query)와 자체 스크립트를 우선 사용하십시오 — 코드에서 28800초를 더하는 것이 Excel 수식을 유지하는 것보다 더 신뢰할 수 있습니다.
</Tip>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="왜 기본값이 제 로컬 시간대가 아니라 UTC+0입니까?">
    백엔드 호출 로그는 UTC로 기록된 데이터베이스 로그이기 때문입니다. 계정을 UTC+0으로 유지하면 페이지 표시, 차트, 내보내기 파일이 모두 같은 기준을 사용하므로 어디에서나 하나의 고정 오프셋을 적용하게 됩니다. 로컬 시간대로 설정하면 지역마다 변환 규칙이 달라져 오독 가능성이 더 커지며, 줄어들지 않습니다.
  </Accordion>

  <Accordion title="이미 시간대를 변경했습니다 — 데이터를 잃게 됩니까?">
    아닙니다. 시간대는 페이지 표시에만 영향을 미치며, 호출 기록이나 과금은 수정되지 않고 내보내기 파일에도 영향이 없습니다. 계정 시간대를 다시 `London (UTC+0/+1)`로 설정하면 페이지와 내보내기 파일이 다시 같은 기준이 됩니다.
  </Accordion>

  <Accordion title="UTC+8 사용자는 내보내기 파일의 시간을 어떻게 변환합니까?">
    내보내기 파일의 시간에 **8시간을 더하십시오**. 예를 들어 파일의 `2026-08-09 08:00`은 \*\*2026/8/9 16:00 (UTC+8)\*\*에 해당합니다. 날짜 경계를 가로질러 대사할 때 이 8시간 차이를 주의하십시오.
  </Accordion>

  <Accordion title="왜 페이지 상세 목록과 내보내기 파일에 표시되는 시간이 다릅니까?">
    기준이 다르기 때문입니다. 상세 목록은 **계정 시간대**를 따르지만, 내보내기 파일은 항상 **UTC+0**입니다. 계정을 UTC+8로 설정하면 자정부터 08:00 사이의 호출은 페이지에서는 "오늘"에 속하지만 파일에서는 "어제"로 기록됩니다. 이는 예상된 동작이며 데이터 오류가 아닙니다 — 계정을 다시 UTC+0으로 설정하면 차이가 사라집니다.
  </Accordion>

  <Accordion title="내보내기를 UTC+8로 직접 생성할 수 있습니까?">
    아닙니다. 내보내기는 저장된 데이터베이스 로그를 그대로 내보내므로 항상 UTC+0입니다. 업무 시간대가 UTC+8이 아니면 역시 변환해야 합니다.
  </Accordion>

  <Accordion title="Log Query API가 시간대 파라미터를 받을 수 있습니까?">
    아닙니다. 이 API는 Unix 초 타임스탬프만 수락하고 반환하며, 이는 정의상 UTC입니다. 필요에 따라 클라이언트 측에서 변환하십시오.
  </Accordion>

  <Accordion title="내보낸 파일에 내 입력과 출력이 포함됩니까?">
    아닙니다. 내보낸 필드는 콘솔에 표시되는 내용과 같으며 — 시간, 요청 ID, token 이름, 모델, token 수, 금액, 상태 — prompt나 모델 출력은 포함되지 않습니다. [호출 로그는 얼마나 오래 보관됩니까?](/ko/faq/log-retention-policy)를 참조하십시오.
  </Accordion>

  <Accordion title="페이지에서 내보내는 대신 로그를 프로그램적으로 가져올 수 있습니까?">
    네, [Log Query API](/ko/api-capabilities/log-query)를 참조하십시오. 이 API의 `start_timestamp`, `end_timestamp` 및 `created_at`는 모두 **Unix 초 타임스탬프**이며 콘솔 시간대 설정과 무관하므로, 코드에서 필요에 따라 변환하시면 됩니다 — 자동 대사에 적합합니다.
  </Accordion>

  <Accordion title="내 내보내기 작업이 끝나지 않습니다 — 어떻게 해야 합니까?">
    먼저 작업 관리 페이지에서 작업 상태를 확인하십시오. 매우 큰 규모(수백만 건의 레코드)의 경우 서버가 파일을 분할하고 패키징하는 데 시간이 필요합니다. 시간 범위를 좁히거나 적절한 최대 레코드 수를 설정한 뒤 배치로 내보내십시오.
  </Accordion>
</AccordionGroup>

## 관련 문서

* [내 호출 기록은 어떻게 조회하나요?](/ko/faq/call-logs)
* [로그에서 과금 금액은 어떻게 읽나요?](/ko/faq/log-billing-explained)
* [호출 로그는 얼마나 보관되나요?](/ko/faq/log-retention-policy)
* [로그 조회 API](/ko/api-capabilities/log-query)
* [실시간 업데이트: 콘솔의 시간대 전환 제안을 닫기](/en/live/2026-08/timezone-switch-prompt-ignore)
