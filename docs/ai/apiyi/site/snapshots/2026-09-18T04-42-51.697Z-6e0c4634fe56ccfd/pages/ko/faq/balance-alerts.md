> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 잔액 알림을 설정하는 방법은 무엇입니까?

> APIYI는 이메일, WeCom/DingTalk/Feishu 그룹 봇, 사용자 지정 잔액 알림 API를 포함한 여러 잔액 알림 방법을 지원합니다.

## Quick Answer

APIYI는 **세 가지 잔액 알림 방법**을 지원합니다: 기본적으로 활성화된 이메일 알림, WeCom / DingTalk / Feishu를 통한 그룹 봇 푸시, 그리고 맞춤 잔액 알림 API입니다. 알림 임계값과 채널을 구성하려면 대시보드의 **알림 설정** 페이지를 방문하십시오.

<Card title="알림 설정으로 이동" icon="settings" href="https://api.apiyi.com/account/notificationSettings">
  대시보드 경로: **계정 → 알림 설정**

  여기에서 알림 임계값을 구성하고 각 알림 채널을 사용하거나 사용 중지할 수 있습니다.
</Card>

## 알림 방법 설명

<CardGroup cols={3}>
  <Card title="이메일 알림" icon="mail">
    **기본값으로 활성화되어 있습니다**

    잔액이 기준선 아래로 떨어지면 경고 이메일이 등록된 계정 이메일로 자동 발송됩니다. 추가 설정은 필요하지 않습니다.
  </Card>

  <Card title="그룹 봇" icon="bot">
    WeCom / DingTalk / Feishu 웹훅 봇을 지원하여 알림을 팀 채팅으로 실시간으로 직접 전송합니다.
  </Card>

  <Card title="잔액 알림 API" icon="code">
    자체 모니터링 시스템이나 알림 플랫폼과 통합할 수 있도록 사용자 정의 잔액 알림 API를 지원합니다.
  </Card>
</CardGroup>

## 구성 단계

<Steps>
  <Step title="APIYI 대시보드에 로그인하기">
    [api.apiyi.com](https://api.apiyi.com)로 이동하여 계정에 로그인합니다.
  </Step>

  <Step title="알림 설정 열기">
    왼쪽 메뉴에서 **계정 → 알림 설정**으로 이동하거나, [알림 설정 페이지](https://api.apiyi.com/account/notificationSettings)를 직접 엽니다.
  </Step>

  <Step title="알림 임계값 설정하기">
    알림을 트리거하는 잔액 수준을 설정합니다(예: 잔액이 \$10 미만일 때 알림). 일반적인 사용량 기준 3\~7일을 커버하는 임계값으로 설정하는 것을 권장합니다.
  </Step>

  <Step title="알림 채널 활성화하기">
    필요에 따라 이메일, 그룹 봇 웹훅 또는 잔액 알림 API를 활성화하고, 해당 알림 주소 / 웹훅 URL을 입력합니다.
  </Step>

  <Step title="알림 테스트하기">
    설정이 완료되면 테스트 버튼을 사용하거나 임계값을 일시적으로 낮춰 알림이 정상 작동하는지 확인합니다.
  </Step>
</Steps>

## 채널 추천

<Tip>
  **팀에서는 여러 채널을 동시에 활성화하는 것이 좋습니다**

  * **개발자 개인**: 이메일이면 보통 충분합니다
  * **소규모 팀**: 이메일 + WeCom / DingTalk / Feishu 그룹 봇
  * **기업 사용자**: 이메일 + 그룹 봇 + 잔액 알림 API(내부 모니터링과 통합)
</Tip>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="알림 이메일을 받지 못한 이유는 무엇입니까?">
    다음을 확인하십시오:

    1. 등록한 이메일 주소가 올바르고 메일을 받을 수 있는지
    2. 알림 이메일이 스팸으로 분류되지 않았는지(스팸 폴더를 확인하십시오)
    3. Notification Settings에서 **이메일 알림**이 활성화되어 있는지
    4. 잔액이 실제로 설정한 임계값보다 낮은지
  </Accordion>

  <Accordion title="그룹 봇 웹훅 URL은 어떻게 받습니까?">
    * **WeCom**: 그룹 채팅 → 그룹 봇 → 봇 추가 → 웹훅 URL 복사
    * **DingTalk**: 그룹 설정 → 스마트 그룹 어시스턴트 → 봇 추가 → 커스텀 봇 → 웹훅 복사
    * **Feishu**: 그룹 설정 → 그룹 봇 → 봇 추가 → 커스텀 봇 → 웹훅 URL 복사

    웹훅 URL을 Notification Settings의 해당 필드에 붙여 넣으십시오.
  </Accordion>

  <Accordion title="잔액 알림 API는 어떻게 동작합니까?">
    잔액 알림 API를 사용하면 사용자 지정 HTTP 콜백 URL을 구성할 수 있습니다. 잔액이 임계값 아래로 떨어지면 시스템이 해당 URL로 POST 요청을 보내므로, Grafana, Prometheus, 내부 알림 시스템 등 자체 모니터링 플랫폼과 연동할 수 있습니다.

    연동 세부 정보는 문서 센터의 API 문서를 참고하시거나, 지원팀에 문의하여 안내를 받으십시오.
  </Accordion>

  <Accordion title="트리거된 뒤 알림은 얼마나 자주 재전송됩니까?">
    시스템에는 짧은 시간에 반복 알림이 발생하지 않도록 기본적인 스팸 방지 제한이 내장되어 있습니다. 알림을 받으면 서비스 중단을 방지하기 위해 즉시 충전하시는 것을 권장합니다.
  </Accordion>

  <Accordion title="여러 개의 알림 임계값을 설정할 수 있습니까?">
    현재 Notification Settings 페이지는 단일 임계값만 지원합니다. 다단계 알림 전략이 필요하다면 잔액 알림 API를 통해 자체 시스템에서 구현하는 것을 권장합니다.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="잔액은 충분해 보이지만 호출이 실패합니다" icon="credit-card" href="/ko/faq/balance-insufficient">
    사전 차감 메커니즘을 알아보십시오
  </Card>

  <Card title="결제 방법" icon="dollar-sign" href="/ko/faq/payment-methods">
    사용 가능한 충전 채널과 가이드를 확인하십시오
  </Card>

  <Card title="충전 프로모션" icon="gift" href="/ko/faq/recharge-promotions">
    비용을 절감할 수 있는 최신 충전 보너스 캠페인입니다
  </Card>

  <Card title="호출 로그" icon="file-text" href="/ko/faq/call-logs">
    소비 상세와 사용 추세를 검토하십시오
  </Card>
</CardGroup>

<Info>
  **친절한 안내**

  잔액 알림은 안전장치일 뿐입니다. 특히 트래픽이 많은 시간대나 새 모델을 도입할 때는 서비스 중단을 방지하기 위해 계정 잔액과 사용량을 주기적으로 확인하시기를 권장합니다.
</Info>
