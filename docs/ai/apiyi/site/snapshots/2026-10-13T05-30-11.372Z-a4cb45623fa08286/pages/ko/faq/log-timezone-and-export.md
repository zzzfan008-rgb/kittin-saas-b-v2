> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 로그 시간대 설정과 데이터 내보내기에 대해 알아두어야 할 점은 무엇인가요?

> 계정 시간대를 현재 위치한 지역(중국 사용자의 경우 Asia/Shanghai)으로 설정하고 콘솔의 시간대 전환 제안을 안심하고 수락하셔도 좋습니다. 로그 상세 목록, 호출 데이터 개요 차트, 내보내기 및 과금 요약은 모두 계정 시간대를 따르므로 서로 일치하며, 로그 조회 API만 Unix 타임스탬프를 반환합니다.

## 간단한 답변

<CardGroup cols={3}>
  <Card title="현지 시간대를 선택하십시오" icon="globe">
    중국 내 사용자는 `Asia/Shanghai` (UTC+8)을 선택하고, 그 외 사용자는 각자의 현지 시간대를 선택합니다. 한 번 설정하면 표시되는 모든 시간이 현지 시간으로 제공됩니다.
  </Card>

  <Card title="권장 설정 대화상자를 수락하십시오" icon="bell">
    콘솔에서 기기 시간대와의 차이를 감지하면 "本地设置建议"(로컬 설정 제안) 대화상자가 표시됩니다. 이때 **전환 버튼을 클릭하기만 하면 됩니다.**
  </Card>

  <Card title="모든 곳에서 일관된 기준 적용" icon="check">
    상세 목록, 차트, **내보내기**, **과금 요약** 모두 계정 시간대를 사용하므로, 상호 간에 시간대를 변환할 필요가 없습니다.
  </Card>
</CardGroup>

<Info>
  **차트 불일치 문제는 2026/9/20 00:55 (UTC+8)에 수정되었습니다.** 이전에는 계정 시간대가 UTC가 아닌 경우, 로그 페이지 상단의 调用数据一览(호출 데이터 개요) 차트에서 데이터가 잘못된 날짜에 표시되었습니다(예: 베이징 시간 기준 오후에 다음 날의 막대가 나타나는 현상). 그렇기 때문에 기존에는 UTC+0 설정을 유지하고 대화상자를 닫도록 권장해 드렸습니다. 현재 해당 문제가 해결되었으므로 **해당 권장 사항은 철회되었으며**, 사용자의 현지 시간대를 선택해 주시기 바랍니다.
</Info>

### 과거 데이터 오차

수정 이전에는 데이터베이스의 기본 시간대가 UTC+8이었습니다. 여기에 사용자가 선택한 상하이 시간대(UTC+8)가 함께 적용되면서 차트 데이터에 오프셋이 발생했습니다. 현재 데이터베이스 기본 시간대가 UTC+0으로 조정되어, 차트는 더 이상의 오차 없이 사용자가 선택한 시간대를 따릅니다.

영향을 받는 항목: **2026/9/20 00:55 (UTC+8) 이전**의 일별/시간별로 그룹화된 차트 및 과금 요약에서 8시간의 날짜 오차가 발생할 수 있습니다. 총금액에는 영향이 없으며, 호출별 상세 기록에도 영향이 없습니다. 일 단위 대사가 필요한 경우, 다시 한 번 내보내기를 진행해 주십시오.

과거 데이터를 대사해야 하는 경우, [Log Query API](/ko/api-capabilities/log-query)를 통해 호출별 기록을 조회하여 직접 집계할 수도 있습니다. 이는 수정 이전의 요약 파일에 의존하는 것보다 더 안정적입니다.

<Tip>
  **한 줄 요약 규칙**: **콘솔에서 확인하거나 내보내는** 모든 항목(상세 목록, 차트, 내보내기 파일, 과금 요약)은 **계정 시간대**를 따르며, **프로그래밍 방식으로 조회하는 데이터**(`created_at`, [Log Query API](/ko/api-capabilities/log-query)에서 반환)는 시간대와 무관한 **Unix 초 단위 타임스탬프**입니다.
</Tip>

## 계정 시간대 확인 및 변경 위치

계정 시간대는 콘솔의 用户信息(사용자 정보) 섹션에서 확인하고 수정할 수 있습니다. 신규 계정의 기본값은 `UTC`이며, 중국 사용자는 `Asia/Shanghai`(으)로 변경해야 합니다.

<Frame caption="The timezone setting in the console's User Info section — change it from the dropdown">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-user-info-timezone.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=94b725d2393ee1ff84eda7b4c1360743" alt="콘솔 用户信息(사용자 정보) 섹션의 시간대 설정" width="892" height="332" data-path="images/console-user-info-timezone.png" />
</Frame>

시간대를 변경하더라도 **시간 표시 및 그룹화 방식만 변경됩니다**. 호출 기록이나 요금은 수정되거나 유실되지 않으며, 언제든지 다시 변경할 수 있습니다.

## 제안 대화상자가 표시되면 전환을 수락하십시오

계정 시간대(예: `UTC`)가 현재 기기 시간대(예: `Asia/Shanghai`)와 다른 경우, 콘솔에 "本地设置建议"(로컬 설정 제안) 대화상자가 열립니다. **오른쪽의 전환 버튼을 클릭하기만 하면 됩니다.** 그러면 상세 목록과 차트에 베이징 시간이 표시됩니다.

<Frame caption="The Local Settings Suggestion dialog — you can click the switch button directly">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-timezone-local-settings-dialog.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=974f0da20864d287c8e2cb82e75f45b6" alt="계정 시간대 UTC 및 기기 시간대 Asia/Shanghai가 표시되어 있고 닫기 및 전환 버튼이 있는 로컬 설정 제안 대화상자" width="1054" height="546" data-path="images/console-timezone-local-settings-dialog.png" />
</Frame>

재무 팀에서 엄격하게 UTC 기준으로 대사를 진행하는 경우, 대화상자를 닫고 대신 UTC를 유지할 수 있습니다. 현재 두 가지 선택지 모두 올바르게 표시되므로 대사 절차에 부합하는 옵션을 선택하십시오.

로그 페이지 상단의 调用数据一览(호출 데이터 개요) 차트는 계정 시간대의 달력 일자별로 데이터를 집계합니다:

<Frame caption="The Call Data Overview at the top of the Logs page, bucketed by day in the account timezone">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-log-call-data-overview.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=246553c9d4025e4bf5aaae4598f39866" alt="콘솔 로그 페이지 상단에 빨간색 윤곽선으로 표시된 호출 데이터 개요 항목" width="1002" height="374" data-path="images/console-log-call-data-overview.png" />
</Frame>

## 어떤 내보내기 방식을 사용해야 합니까?

Logs 페이지의 우측 상단에는 导出 (Export)와 汇总账单 (Billing Summary)이라는 두 개의 버튼이 있습니다.

<Frame caption="The Export and Billing Summary buttons in the top-right corner of the Logs page">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-log-export-buttons.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=d8f2d7b0359ddcf6aebdd66399bfcffe" alt="왼쪽에는 Export 버튼이, 오른쪽에는 Billing Summary 버튼이 위치한 Logs 페이지 툴바" width="650" height="212" data-path="images/console-log-export-buttons.png" />
</Frame>

| | 导出 (Export) | 汇总账单 (Billing Summary) |
| - | - | - |
| 시간대 기준 | **계정 시간대** | **계정 시간대** |
| 세분성 | 개별 호출 기록 (선택 가능한 필드) | 시간, 일 또는 월별로 집계된 지출 |
| 데이터 양 | 대용량 배치, 비동기 실행 가능 | 소용량, 직접 다운로드 |
| 적합한 용도 | 정산 및 대사, 감사, 맞춤 분석 | 총지출 요약 확인, 세무 증빙 |

두 버튼 모두 동일한 시간대 기준을 사용하며, 세분성과 데이터 양에서만 차이가 있습니다. 개별 기록이 필요한지, 아니면 집계된 합계가 필요한지에 따라 상황에 맞는 방식을 선택하십시오.

예를 들어 계정이 `Asia/Shanghai`(으)로 설정되어 있는 경우, \*\*2026-09-20 01:08 (UTC+8)\*\*에 발생한 호출은 다음과 같이 처리됩니다.

* **페이지 상세 목록**에 `2026-09-20 01:08`(으)로 표시됩니다
* **내보내기 파일**에도 동일하게 `2026/9/20 1:08`(으)로 표시됩니다
* **Billing Summary**(일별) 및 차트의 9월 20일 항목에서 `2026-09-20`에 포함됩니다

<Tip>
  **요청 ID의 앞 14자리는 UTC 시간입니다.** 예를 들어 `20260919170811…`는 UTC 기준 `2026-09-19 17:08:11`, 즉 `2026-09-20 01:08:11 (UTC+8)`을 의미합니다. 고객 지원팀에 특정 호출 내역을 문의할 때는 요청 ID를 전달하는 것이 가장 정확합니다.
</Tip>

### Export → 백그라운드 비동기 내보내기 (권장)

항목별 상세 지출 기록이 필요한 경우, 导出 (Export) 버튼을 클릭한 다음 대화상자에서 \*\*后台异步导出 (백그라운드 비동기 내보내기)\*\*를 선택하십시오.

<Frame caption="The export dialog — select background async export for large volumes">
  <img src="https://mintcdn.com/apiyillc/ixJpriVUjc22GEKJ/images/console-log-async-export-dialog.png?fit=max&auto=format&n=ixJpriVUjc22GEKJ&q=85&s=09865097dc2f80581a82e2d7feb06f3c" alt="선택 가능한 필드, 현재 페이지 내보내기 및 백그라운드 비동기 내보내기 옵션, Excel 및 CSV 형식, 최대 기록 수가 표시된 내보내기 대화상자" width="974" height="1312" data-path="images/console-log-async-export-dialog.png" />
</Frame>

주요 사항:

* **시간은 계정 시간대로 기록되며**, 페이지 상세 목록과 일치합니다
* **선택 가능한 필드**: 사용 시간, 요청 ID, token 이름, 모델 이름 등 — 대사 작업에 필요한 항목을 직접 선택할 수 있습니다
* **내보내기 모드**: 데이터 양이 많은 경우 백그라운드 비동기 내보내기를 선택하십시오. 작업이 페이지를 차단하지 않고 백그라운드에서 실행되며, 10,000건 이상의 기록에 권장됩니다
* **형식**: Excel(`.xlsx`, 대용량 내보내기 시 자동으로 분할 및 압축됨) 또는 CSV(`.csv`, 소용량용)
* **최대 기록 수**: `0`은(는) 무제한을 의미하며(서버에서 여러 Excel 파일로 분할한 뒤 압축), 최대 5,000만 건까지 지원합니다
* **진행 상황**: 작업이 생성되면 任务管理 (Task Management) 페이지에서 진행 상황과 상태를 확인한 후 파일을 다운로드하십시오

전체 내보내기 과정과 아카이빙 관련 권장사항은 [호출 로그는 얼마나 오래 보관되나요?](/ko/faq/log-retention-policy) 문서를 참조하십시오.

## 실무에서의 대사

<Steps>
  <Step title="양측이 동일한 시간대를 사용하는지 확인하십시오">
    내보내기 파일은 **내보내기를 수행한 계정의 시간대**를 기준으로 날짜를 그룹화합니다. 여러 사람이 대사 작업을 수행하거나 재무 시스템과 대조할 때는 먼저 모든 사람이 동일한 시간대(예: `Asia/Shanghai`)를 사용하는지 확인하십시오. 그렇지 않으면 자정 전후에 발생한 호출이 서로 다른 날짜로 분류됩니다.
  </Step>

  <Step title="API 타임스탬프를 직접 변환하십시오">
    `created_at`는 [로그 조회 API](/ko/api-capabilities/log-query)에서 제공하는 Unix 초 단위 타임스탬프이며, 필요한 시간대로 직접 변환하시면 됩니다. 베이징 시간의 경우 **28800**(8 × 3600)을 더한 후 UTC로 포맷팅하거나, 사용 중인 언어의 시간대 라이브러리를 활용하십시오.
  </Step>

  <Step title="문제 보고 시 요청 ID와 시간대를 포함하십시오">
    요청 ID에는 UTC 시간이 포함되어 있어 오류 가능성이 가장 적은 기준 정보입니다. 시간을 언급할 때는 `01:08 (UTC+8)`와 같이 항상 시간대를 명시하십시오.
  </Step>
</Steps>

<Tip>
  *영업일* 기준으로 나누어야 하는 대사나 감사 작업의 경우, 자체 스크립트로 [로그 조회 API](/ko/api-capabilities/log-query)를 활용할 수도 있으며, 이는 내보내기 파일보다 더 많은 제어 권한을 제공합니다.
</Tip>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="이전 문서에서는 UTC+0을 유지하고 대화상자를 닫으라고 안내했는데, 아직도 그렇게 해야 합니까?">
    아닙니다. 해당 권장 사항은 계정 시간대가 UTC가 아닐 때 차트에서 데이터가 잘못된 날짜에 표시되는 문제로 인해 제공되었습니다. 이 문제는 2026/9/20 00:55 (UTC+8)에 해결되었습니다. 이제 원하시는 시간대를 선택해 주십시오.
  </Accordion>

  <Accordion title="안내대로 UTC를 유지하고 있었는데, 베이징 시간으로 변경해야 합니까?">
    콘솔의 모든 시간이 베이징 시간으로 표시되어 직접 8시간을 더할 필요가 없도록 `Asia/Shanghai`(으)로 전환하는 것을 권장합니다. 정산 절차가 UTC 기준으로 고정되어 있다면 UTC를 유지하셔도 무방합니다. 현재는 두 방식 모두 올바르게 표시됩니다.
  </Accordion>

  <Accordion title="시간대를 변경하면 데이터가 유실됩니까?">
    아닙니다. 시간대는 시간이 표시되는 방식과 날짜별 그룹화에만 영향을 줍니다. 호출 기록이나 과금 내역은 전혀 수정되지 않으며, 언제든지 다시 되돌릴 수 있습니다.
  </Accordion>

  <Accordion title="수정 이전에 내보낸 파일은 여전히 정확합니까?">
    행 단위 내보내기(내보내기 버튼)의 모든 기록과 금액은 정확하며, 시간은 내보내던 당시 계정의 시간대로 표시됩니다. **2026/9/20 00:55 (UTC+8) 이전**의 과금 요약 파일 및 차트 데이터의 경우, **일별 또는 시간별 그룹화**가 8시간 밀려 표시될 수 있으나 총액에는 영향이 없습니다. 정확한 일별 정산이 필요하시다면 다시 내보내기를 진행해 주십시오.
  </Accordion>

  <Accordion title="제 화면의 시간과 동료가 내보낸 파일의 시간이 왜 일치하지 않습니까?">
    계정 시간대가 서로 다를 가능성이 가장 높습니다. 내보내기 파일은 내보낸 계정의 시간대를 사용하므로, 사용자 정보에서 두 계정이 동일한 시간대를 사용하고 있는지 확인해 주십시오.
  </Accordion>

  <Accordion title="Log Query API에 시간대 파라미터를 지정할 수 있습니까?">
    아닙니다. 해당 API는 정의상 UTC인 Unix 초 단위 타임스탬프만 수신하고 반환합니다. 필요한 경우 클라이언트 측에서 변환해 주십시오.
  </Accordion>

  <Accordion title="내보낸 파일에 저의 입력과 출력이 포함되어 있습니까?">
    아닙니다. 내보낸 필드는 콘솔에 표시되는 항목(시간, 요청 ID, token 이름, 모델, token 수, 금액, 상태)과 동일하며, prompt나 모델 출력은 포함되지 않습니다. [호출 로그는 얼마나 오래 보관됩니까?](/ko/faq/log-retention-policy)를 참조해 주십시오.
  </Accordion>

  <Accordion title="페이지에서 내보내는 대신 프로그래밍 방식으로 로그를 가져올 수 있습니까?">
    예, [Log Query API](/ko/api-capabilities/log-query)를 참조해 주십시오. 해당 API의 `start_timestamp`, `end_timestamp` 및 `created_at`은(는) 모두 콘솔 시간대 설정과 무관한 **Unix 초 단위 타임스탬프**이므로 자동화된 정산에 적합합니다.
  </Accordion>

  <Accordion title="내보내기 작업이 완료되지 않습니다. 어떻게 해야 합니까?">
    먼저 任务管理(작업 관리) 페이지에서 작업 상태를 확인해 주십시오. 데이터 양이 매우 많은 경우(수백만 건의 기록) 서버에서 파일을 분할하고 패키징하는 데 시간이 소요되므로, 시간 범위를 좁히거나 합리적인 최대 기록 수를 설정하여 나누어 내보내시기 바랍니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

* [호출 기록은 어떻게 확인합니까?](/ko/faq/call-logs)
* [로그의 과금 금액은 어떻게 확인합니까?](/ko/faq/log-billing-explained)
* [호출 로그는 얼마 동안 보관됩니까?](/ko/faq/log-retention-policy)
* [로그 조회 API](/ko/api-capabilities/log-query)
* [실시간 업데이트: 콘솔 시간대 표시 수정 — 로컬 시간대로 전환하십시오](/en/live/2026-09/console-timezone-fixed)


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.