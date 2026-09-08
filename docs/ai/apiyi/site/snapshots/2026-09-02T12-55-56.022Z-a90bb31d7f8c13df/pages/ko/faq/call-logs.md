> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 내 호출 기록을 어떻게 확인하나요?

> APIYI 호출 로그 확인 가이드, API 호출 기록과 과금 세부 정보를 확인하는 방법을 알아봅니다

## 호출 로그 확인

상단 탐색에서 “Logs” 페이지로 이동합니다: [https://api.apiyi.com/log](https://api.apiyi.com/log)

로그 섹션에서 다음을 볼 수 있습니다:

* **각 호출의 성공 기록**
* **API 호출의 오류 로그**
* **자세한 과금 설명**

<img className="block dark:hidden" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/log-manage.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=ce6f1444d3f138ff5cd6927843595a61" alt="호출 로그 관리" width="1242" height="1128" data-path="images/log-manage.png" />

<img className="hidden dark:block" src="https://mintcdn.com/apiyillc/OMY6ItCc2mC1yzgA/images/log-manage.png?fit=max&auto=format&n=OMY6ItCc2mC1yzgA&q=85&s=ce6f1444d3f138ff5cd6927843595a61" alt="호출 로그 관리" width="1242" height="1128" data-path="images/log-manage.png" />

## 로그 기록 내용

### 성공 호출 기록

각 성공적인 API 요청은 다음 정보를 기록합니다:

* **요청 시간**: 초 단위까지 정확한 호출 타임스탬프
* **사용된 Model**: 이 호출에 사용된 AI model
* **Token 수**: 입력 및 출력 Token 수량 통계
* **과금 금액**: 이 호출의 구체적인 비용
* **호출 상태**: 요청 실행 상태

### 오류 로그

실패한 API 호출은 다음을 기록합니다:

* **오류 유형**: 구체적인 오류 분류
* **오류 메시지**: 상세한 오류 설명
* **발생 시간**: 오류 발생 타임스탬프
* **관련 매개변수**: 오류를 일으킨 요청 매개변수 정보

## 개인정보 및 데이터 정책

<Info>
  **데이터 개인정보 보호**

  개인정보 보호와 데이터 저장 비용을 고려하여, 저희 로깅 시스템은 다음과 같습니다.

  * **세부적인 입력 및 출력 내용을 기록하지 않습니다**
  * **기본 token 개수 정보만 보관합니다**
  * **과금에 필요한 필수 로그 데이터만 저장합니다**
  * **사용자 데이터 개인정보 보안을 보장합니다**
</Info>

## 로그 조회 팁

### 필터링 기능

* **시간 범위로 필터링**: 특정 기간의 호출 기록을 조회합니다
* **모델로 필터링**: 특정 AI 모델의 사용량을 조회합니다
* **상태로 필터링**: 성공 및 실패한 호출 기록을 구분합니다

### 과금 분석

* **단일 호출 비용**: 각 API 호출의 구체적인 비용입니다
* **token 사용 효율성**: 입력-출력 token 비율을 분석합니다
* **모델 비용 비교**: 서로 다른 모델의 사용 비용 통계를 확인합니다

## 자주 묻는 질문

### 왜 특정 대화 내용을 볼 수 없습니까?

사용자 개인정보를 보호하고 저장 비용을 줄이기 위해, 특정 입력-출력 내용은 기록하지 않고 과금과 관련된 기본 정보만 기록합니다.

### 로그는 얼마나 보관됩니까?

**현재 월과 그 앞의 두 개 달력 월**까지 보관되며, 더 오래된 전체 월은 매월 5일에 삭제됩니다. 전체 규칙과 내보내기 안내는: [로그 보관 및 정리 정책](/ko/faq/log-retention-policy).

### 호출 기록은 어떻게 내보냅니까?

로그 페이지에서 필요에 따라 필터링한 다음 **비동기 내보내기**를 사용하십시오. 작업은 백그라운드에서 실행되며 완료되면 파일을 다운로드할 수 있습니다. 정산 및 감사 보관용으로 적합합니다.

내보내기 및 과금 요약 버튼은 서로 다른 시간대 기준을 사용하며, 계정 시간대는 기본 UTC+0으로 유지해야 합니다 — [로그 시간대 설정과 데이터 내보내기에 대해 무엇을 알아야 합니까?](/ko/faq/log-timezone-and-export)를 참고하십시오.
