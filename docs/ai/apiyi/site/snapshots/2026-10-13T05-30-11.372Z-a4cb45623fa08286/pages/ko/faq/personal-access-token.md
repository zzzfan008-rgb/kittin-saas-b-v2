> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 개인 액세스 token이란 무엇이며 시스템 token은 어떻게 교체합니까?

> 개인 액세스 token은 잔액, 로그 및 token 관리와 같은 관리 API를 인증하며, 스코프별 권한, 만료 기간 및 IP 허용 목록을 지원합니다. 기존 시스템 token은 2026-11-11에 사용 중단될 예정입니다.

## 핵심 요약

**개인 액세스 token**은 APIYI의 관리 API를 위한 새로운 인증 수단입니다. 스크립트와 자동화 도구에서 잔액 조회, 로그 조회 및 token 관리 API를 호출할 수 있도록 지원합니다.
기존의 **시스템 token**을 대체하며, **필요한 권한만 부여**하고 **만료일을 설정**하며 **IP 허용 목록으로 제한**할 수 있습니다. 계정당 최대 20개의 token을 생성할 수 있으므로 용도별로 발급하여 사용할 수 있습니다.

<Warning>
  **기존 시스템 token은 2026-11-11 (UTC+8)에 지원이 종료될 예정입니다.** 해당 시점 이후 시스템 token으로 호출한 관리 API 요청은 401을 반환합니다.
  해당 일자 전에 실제 사용 현황을 검토하여 기간을 연장할 수도 있으나, 지금 개인 액세스 token으로 전환하시는 것을 권장합니다. `Authorization` 헤더의 값만 교체하면 되며 기존 코드는 그대로 유지됩니다.
</Warning>

<Info>
  개인 액세스 token으로는 **모델을 호출할 수 없습니다**. 모델을 호출하려면 기존처럼 콘솔에서 “모델 키”로 표시되는 API Key(`sk-`로 시작)를 계속 사용하십시오.
</Info>

## 시스템 token과의 차이점

| | 기존 시스템 token | 개인 액세스 token |
| - | - | - |
| 권한 | 전체 계정 권한 | 스코프별 선택 가능, 읽기, 쓰기 및 비밀값 확인(reveal-secret)이 독립적으로 분리됨 |
| 개수 | 계정당 1개 | 계정당 최대 20개, 용도별 1개 |
| 만료 기간 | 만료되지 않음 | 30 / 90 / 180 / 365일, 사용자 지정 또는 만료되지 않음 |
| IP 허용 목록 | 지원하지 않음 | IPv4, IPv6 및 CIDR |
| 접두사 | 고정 접두사 없음 | `nap_`(으)로 시작 |
| 상태 | 2026-11-11 (UTC+8) 지원 종료 예정 | 권장 |

## 생성 방법

<Steps>
  <Step title="개인 액세스 tokens 열기">
    콘솔에 로그인한 후 `api.apiyi.com/account/profile`의 프로필 페이지로 이동합니다. **계정 옵션**에서 **개인 액세스 tokens**를 클릭한 다음, 오른쪽 상단의 **token 생성**을 클릭합니다.
  </Step>

  <Step title="이름 지정 및 만료 기간 선택">
    "정산 스크립트" 또는 "잔액 모니터링"과 같이 용도를 알 수 있는 이름을 지정합니다. 기본 만료 기간은 30일이며, 만료 시 token 작동이 중단됩니다. 스크립트가 예기치 않게 중단되지 않도록 **더 긴 기간**(예: 365일)을 설정하는 것을 권장합니다.
  </Step>

  <Step title="IP 허용 목록 설정(선택 사항)">
    여러 항목은 쉼표로 구분합니다. IPv4, IPv6 및 CIDR을 지원합니다. 제한을 두지 않으려면 비워 둡니다. **허용 목록은 생성 후 편집할 수 없습니다.** 아래의 권장 워크플로를 참조하십시오.
  </Step>

  <Step title="권한 선택">
    스크립트에서 사용하는 권한만 선택합니다. 아래 표를 참조하십시오.
  </Step>

  <Step title="token 생성 및 저장">
    **token 생성**을 클릭한 다음, 즉시 token을 복사하여 안전하게 보관합니다.
  </Step>
</Steps>

<img src="https://mintcdn.com/apiyillc/xTqEgFERWX-o_x6Q/images/personal-access-token-entry.png?fit=max&auto=format&n=xTqEgFERWX-o_x6Q&q=85&s=74b07a2becc459ad9db610e57281d4b7" alt="프로필 페이지의 계정 옵션 아래에 있는 개인 액세스 tokens 항목" width="1400" height="598" data-path="images/personal-access-token-entry.png" />

<img src="https://mintcdn.com/apiyillc/xTqEgFERWX-o_x6Q/images/personal-access-token-create.png?fit=max&auto=format&n=xTqEgFERWX-o_x6Q&q=85&s=db4eacd9f8f57ee95018d609b062e78a" alt="개인 액세스 token 생성: 이름, 만료 기간, IP 허용 목록 및 권한" width="900" height="1244" data-path="images/personal-access-token-create.png" />

<img src="https://mintcdn.com/apiyillc/xTqEgFERWX-o_x6Q/images/personal-access-token-expiry.png?fit=max&auto=format&n=xTqEgFERWX-o_x6Q&q=85&s=79d7e78889391a1bdb1b31239f4a48f1" alt="만료 옵션: 30일, 90일, 180일 또는 365일, 사용자 지정 날짜, 만료되지 않음" width="900" height="361" data-path="images/personal-access-token-expiry.png" />

## 선택해야 할 권한

권한에는 읽기, 쓰기, 시크릿 표시의 세 가지 종류가 있습니다. 각 권한은 개별적으로 부여됩니다. 쓰기 권한에는 읽기 권한이 포함되지 않으며, 읽기 권한으로는 키의 평문을 확인할 수 없습니다.

| 호출하려는 API | 선택할 권한 |
| - | - |
| [잔액 조회](/ko/api-capabilities/balance-query) (`GET /api/user/self`) | 프로필 · 읽기 |
| [로그 조회](/ko/api-capabilities/log-query) (`GET /api/log/self`) | 사용량 및 개인 기록 · 읽기 |
| [Token 관리](/ko/api-capabilities/token-management): API 키 목록 조회 또는 가져오기 | 모델 키 · 읽기 |
| [Token 관리](/ko/api-capabilities/token-management): API 키 생성, 수정 또는 삭제 | 모델 키 · 쓰기 |
| [Token 관리](/ko/api-capabilities/token-management): API 키의 평문 조회 | 모델 키 · 시크릿 표시 |

예를 들어, 일일 대사 작업에는 “사용량 및 개인 기록 · 읽기”만 필요하며, 잔액 모니터링에는 “프로필 · 읽기”만 필요합니다.
**비밀번호 변경이나 2단계 인증 설정과 같이 보안 인증이 필요한 작업은 웹사이트에 로그인한 후 직접 수행해야 합니다.** 개인 액세스 token은 쓰기 권한이 있더라도 이러한 작업을 수행할 수 없습니다.

<Tip>
  스크립트마다 하나의 token을 사용하고, 해당 스크립트에서 사용하는 권한만 부여하십시오. 스크립트를 더 이상 사용하지 않거나 token이 유출된 경우 해당 token 하나만 삭제하십시오. 다른 스크립트는 영향을 받지 않습니다.
</Tip>

## IP 허용 목록 안전하게 설정하기

허용 목록은 생성한 후에는 수정할 수 없습니다. 변경하려면 새 token을 생성해야 합니다. 다음 순서로 진행하는 것을 권장합니다:

1. **허용 목록 없이 token을 생성**하여 스크립트가 정상 작동하는지 확인합니다.
2. 정상 작동이 확인되면 **허용 목록을 포함한 프로덕션 token을 생성합니다**. 프로덕션 서버, 대기 서버, 문제 해결에 필요할 수 있는 사무실 네트워크 등 사용할 가능성이 있는 모든 egress IP를 포함하십시오.
3. 프로덕션 token으로 전환하고 **허용 목록이 없는 테스트 token을 삭제합니다**.

사설 네트워크 주소가 아닌 **공인 egress IP**를 입력하십시오. 가정용 초고속 인터넷이나 사무실 네트워크처럼 egress IP가 자주 변경되는 경우에는 허용 목록을 사용하지 마십시오. 대신 읽기 전용 권한을 부여하고 유효 기간을 더 짧게 설정하십시오.

## 사용 방법

사용 방법은 시스템 token과 동일합니다. token 자체를 `Authorization` 헤더에 입력합니다. `Bearer ` 접두사는 선택 사항입니다.

```bash theme={null}
curl --compressed -s 'https://api.apiyi.com/api/user/self' \
  -H "Authorization: $APIYI_TOKEN"
```

현재 스크립트에서 시스템 token을 사용 중이라면, 환경 변수 또는 설정 파일의 값을 새 token으로 교체하십시오.

## 자주 발생하는 오류

| HTTP 상태 | 응답 | 원인 및 해결 방법 |
| - | - | - |
| 401 | `ACCESS_TOKEN_LEGACY_RETIRED`, `Legacy management tokens have been retired...` | 지원 종료일 이후에도 레거시 시스템 token을 계속 사용하고 있습니다. 위에 설명된 대로 개인 액세스 token을 생성하십시오. |
| 401 | `This access token may not be used from the current IP address.` | 요청이 token의 허용 목록 외의 IP에서 전송되었습니다. 서버의 공인 송신 IP를 확인하십시오. 허용 목록은 수정할 수 없으므로 새 token을 생성하십시오. |
| 403 | `ACCESS_TOKEN_SCOPE_DENIED`, `This endpoint is outside this access token's granted permissions.` | token에 이 API가 필요로 하는 권한이 없습니다. 위 표에 안내된 권한을 가진 새 token을 생성하십시오. |
| 401 | 유효하지 않은 token | token이 만료되었거나 삭제되었습니다. 또는 계정의 비밀번호, 2단계 인증 또는 패스키가 변경되었습니다. **이 세 가지 변경 사항 중 하나라도 발생하면 계정의 모든 개인 액세스 token이 무효화됩니다.** 새 token을 생성하십시오. |

## 관련 문서

<CardGroup cols={2}>
  <Card title="잔액 조회 API" icon="wallet" href="/ko/api-capabilities/balance-query">
    개인 액세스 token으로 계정 잔액을 확인합니다
  </Card>

  <Card title="로그 조회 API" icon="file-text" href="/ko/api-capabilities/log-query">
    정산을 위해 시간 범위별 호출 기록을 조회합니다
  </Card>

  <Card title="Token 관리 API" icon="key" href="/ko/api-capabilities/token-management">
    프로그래밍 방식으로 API 키를 생성, 교체 및 삭제합니다
  </Card>

  <Card title="API 키를 안전하게 관리하는 방법은 무엇입니까?" icon="shield-check" href="/ko/faq/key-security-management">
    API 키 권한 범위 및 유출 방지
  </Card>
</CardGroup>


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.