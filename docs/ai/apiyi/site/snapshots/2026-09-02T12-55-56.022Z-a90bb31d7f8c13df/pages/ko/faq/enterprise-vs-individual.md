> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 기업 사용자와 개인 사용자의 차이점은 무엇입니까?

> APIYI에서는 기업 사용자와 개인 사용자의 계정 속성에 차이가 없습니다. 이 문서에서는 다중 token 관리, 서비스 그룹, 내부 공유 및 과금 정책을 설명합니다.

## 빠른 답변

**계정 속성 측면에서는 기업 사용자와 개인 사용자 사이에 차이가 없습니다. 등록이 완료되면 누구나 동일한 콘솔과 API를 사용하는 사용자입니다.**

차이는 오직 사용 방식에 있습니다. 기업은 보통 여러 token을 활용해 부서를 분리하고, 기업 위챗 서비스 그룹을 통해 연결하며, 더 나은 협업을 위해 계정을 내부적으로 공유합니다. 가격은 모든 사용자에게 공개적이고 투명하며, 별도의 협상은 없습니다.

## 계정 속성: 완전히 동일

APIYI는 “기업판”과 “개인판”을 구분하지 않습니다. 개인 개발자든 기업 팀이든, 등록 후에는 동일한 유형의 계정을 받으며 다음 항목도 모두 같습니다.

* 400개 이상의 모델에 대한 액세스
* 동일한 `https://api.apiyi.com` 엔드포인트
* 동일한 콘솔, token 관리 및 로그 기능
* 동일한 공개 가격

<Info>
  기업은 별도의 기업용 계정을 활성화할 필요가 없습니다. 그냥 직접 등록하면 됩니다. 아래의 관행은 기업이 실제 사용에서 흔히 하는 일을 설명합니다.
</Info>

## APIYI를 기업에서 사용하는 일반적인 방식

<CardGroup cols={2}>
  <Card title="부서 / 직원별 다중 Tokens" icon="key">
    부서 또는 직원별로 사용량을 분리하기 위해 여러 개의 tokens(KEYs)를 생성하면, 소비량 추적, 쿼터 관리, 권한 관리를 각각 쉽게 할 수 있습니다.
  </Card>

  <Card title="기업용 WeChat 서비스 그룹" icon="message-circle">
    API 통합 지원과 일상적인 질의응답을 위해 전용 기업용 WeChat 서비스 그룹을 만들 수 있도록 APIYI 애프터서비스 및 운영팀에 문의하십시오.
  </Card>

  <Card title="내부 계정 공유" icon="users">
    사용자, 환급자, 지급자가 서로 다를 경우 계정 자격 증명을 내부적으로 공유하고 하나의 중앙 계정에서 충전과 사용량 관리를 할 수 있습니다.
  </Card>

  <Card title="사용 로그 조회" icon="file-text">
    콘솔에 로그인하지 않고도 KEY의 소비 로그를 조회할 수 있어, 재무 또는 비기술 동료가 사용량을 확인하기에 편리합니다.
  </Card>
</CardGroup>

### 1. 여러 tokens로 부서나 직원을 분리합니다

기업은 콘솔에서 여러 개의 tokens(KEYs)를 만들고 이를 서로 다른 부서나 직원에게 할당할 수 있습니다. 장점은 다음과 같습니다.

* **사용량 분리**: 각 token의 소비량이 독립적으로 추적되어 내부 회계가 단순해집니다
* **쿼터 제어**: token별로 잔액 상한과 만료일을 설정합니다
* **권한 관리**: token이 유출되거나 직원이 퇴사하면 해당 것만 비활성화하면 되며 다른 업무에는 영향이 없습니다

자세한 token 생성 단계는 [KEY를 생성하는 방법?](/ko/faq/token-management)을 참고하십시오.

### 2. 기업용 WeChat 서비스 그룹을 통해 연결합니다

기업 고객은 APIYI 애프터서비스 및 운영팀에 문의하여 API 통합과 일상적인 문제를 지원하는 전용 **기업용 WeChat 서비스 그룹**을 만들 수 있습니다.

<Tip>
  기본적인 질문(token 생성, 과금 규칙, 모델 선택, 일반적인 오류)은 **이 문서를 먼저 확인하시는 것**을 권장합니다. 더 빨리 답을 얻을 수 있습니다. 여기에서 다루지 않은 주제나 기업 수준의 통합 질문은 서비스 그룹을 이용하십시오. 더 효율적입니다.
</Tip>

### 3. 내부 계정 공유 및 사용량 조회

기업은 흔히 “사용자, 환급자, 지급자가 동일인이 아닌 경우”를 겪습니다. APIYI의 방식은 간단합니다.

* **계정 자격 증명 공유**: 하나의 계정을 내부적으로 공유하고, 중앙 계정 하나로 충전과 token 관리를 처리합니다
* **로그인 없는 사용량 조회**: 콘솔에 로그인하는 것이 번거롭다면 조회 페이지를 통해 KEY의 소비 로그를 확인할 수 있습니다

<Card title="token 사용량 조회 페이지" icon="search" href="https://api.apiyi.com/query">
  로그인 없이 조회: [https://api.apiyi.com/query](https://api.apiyi.com/query)

  token(KEY)을 입력하면 소비 로그를 확인할 수 있어, 재무 또는 비기술 동료가 사용량을 확인하기에 편리합니다.
</Card>

## 엔터프라이즈 고객은 별도 가격을 적용받습니까?

**아닙니다. 저희 가격은 공개적이고 투명하며, 모든 사용자에게 동일하게 적용됩니다.**

APIYI의 유일한 할인 형태는 **충전 보너스 캠페인**이며, 엔터프라이즈 고객께 참여를 권장드립니다. 장기적으로 사용하기에 더 비용 효율적입니다.

<Info>
  **회사 소개**: APIYI는 2년 동안 안정적으로 운영되어 온 사이트이며, 전문 팀이 제공하는 장기적이고 신뢰할 수 있는 서비스입니다. 통일된 공개 가격은 협상의 오가기를 없애 주며, 그 자체로 엔터프라이즈 고객께 제공하는 확실성의 한 형태입니다.
</Info>

충전 보너스 자세한 내용은 [충전 프로모션](/ko/faq/recharge-promotions)을 참고하십시오.

## 관련 문서

<CardGroup cols={2}>
  <Card title="키를 어떻게 생성합니까?" icon="key" href="/ko/faq/token-management">
    멀티-token 관리 완전 가이드
  </Card>

  <Card title="호출 로그를 어떻게 확인합니까?" icon="file-text" href="/ko/faq/call-logs">
    사용량 및 소비 내역 조회 방법
  </Card>

  <Card title="충전 프로모션" icon="gift" href="/ko/faq/recharge-promotions">
    충전 보너스 캠페인 상세
  </Card>

  <Card title="어떤 결제 수단이 지원됩니까?" icon="credit-card" href="/ko/faq/payment-methods">
    계좌 이체 및 기타 결제 수단
  </Card>
</CardGroup>

## 문의하기

<Card title="엔터프라이즈 WeChat 지원" icon="headphones" href="https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec">
  엔터프라이즈 연동, 서비스 그룹 요청 등은 다음으로 문의해 주십시오:

  * [엔터프라이즈 WeChat 지원 문의](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)
  * 이메일: [hi@apiyi.com](mailto:hi@apiyi.com)
</Card>
