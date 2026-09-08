> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 내 계정을 어떻게 삭제합니까?

> Profile 페이지에서 APIYI 계정을 삭제할 수 있습니다. 모든 사용자 데이터, 사용 로그, 충전 기록은 영구적으로 사라지므로 주의해서 진행하십시오.

## 빠른 답변

APIYI 콘솔에 로그인한 다음 `api.apiyi.com/account/profile`의 **프로필** 페이지로 이동하고, 페이지 하단의 "계정 옵션" 아래에 있는 **계정 삭제** 버튼을 클릭합니다. 작업을 완료하려면 확인 프롬프트가 표시됩니다.

<Warning>
  **계정 삭제는 되돌릴 수 없습니다**: 삭제가 완료되면 모든 **사용자 데이터, 사용 기록, 충전 기록, 계정 잔액**이 영구적으로 삭제되며 복구할 수 없습니다. 실수로 삭제한 경우의 책임은 사용자에게 있으며, 플랫폼은 데이터 복구에 대해 책임지지 않습니다. 진행하기 전에 신중하게 확인하십시오.
</Warning>

## 찾을 수 있는 위치

삭제 버튼은 **프로필** 페이지 하단의 **계정 옵션** 섹션에 있으며, "비밀번호 변경", "시스템 token", "액세스 token" 옆에 있습니다:

<img src="https://mintcdn.com/apiyillc/Az0T-cmcmXqc4ycr/images/account-deletion-button.png?fit=max&auto=format&n=Az0T-cmcmXqc4ycr&q=85&s=36f570e399cf0f60267c39c9a70f3a25" alt="계정 삭제 버튼 위치" width="1140" height="258" data-path="images/account-deletion-button.png" />

## Steps

<Steps>
  <Step title="프로필로 이동">
    APIYI 콘솔에 로그인한 후 프로필 페이지를 방문합니다:

    ```
    https://api.apiyi.com/account/profile
    ```
  </Step>

  <Step title="'계정 옵션' 섹션 찾기">
    페이지 **맨 아래**로 스크롤하여 "계정 옵션" 섹션을 찾습니다.
  </Step>

  <Step title="'계정 삭제' 클릭">
    빨간색 **계정 삭제** 버튼(휴지통 아이콘 포함)을 클릭합니다.
  </Step>

  <Step title="대화상자에서 확인">
    확인 대화상자가 표시됩니다. 확인하기 전에 내용을 주의 깊게 읽으십시오. **한 번 확인하면 작업은 즉시 적용되며 되돌릴 수 없습니다.**
  </Step>
</Steps>

## 삭제 전에 확인하십시오

<CardGroup cols={2}>
  <Card title="계정 잔액" icon="wallet" color="#ef4444">
    남아 있는 잔액은 모두 소멸되며 삭제 후 **환불 불가**입니다. 먼저 사용하거나 환불을 요청하는 것을 고려하십시오.
  </Card>

  <Card title="사용 로그" icon="file-text" color="#ef4444">
    모든 과거 호출 기록은 삭제되며, 이후 정산이나 감사에 사용할 수 없습니다.
  </Card>

  <Card title="충전 기록" icon="receipt" color="#ef4444">
    청구서와 주문 내역은 계정과 함께 사라집니다. 미리 내보내거나 청구서를 요청하십시오.
  </Card>

  <Card title="API Keys" icon="key" color="#ef4444">
    모든 시스템 및 액세스 token은 즉시 무효화됩니다. 이를 사용하는 모든 실행 중인 워크로드는 즉시 실패합니다.
  </Card>
</CardGroup>

<Tip>
  **권장 사항**: 삭제하기 전에 아직 청구되지 않은 충전 주문, 내보내지 않은 사용 로그, 그리고 여전히 API를 호출하는 프로덕션 서비스가 있는지 확인하십시오.
</Tip>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="삭제 후 같은 이메일로 다시 등록할 수 있습니까?">
    대부분의 경우 해당 이메일은 해제되어 다시 등록에 사용할 수 있습니다. 다만 **새 계정은 이전 계정과 연결되지 않습니다**: 잔액, 로그, 충전 기록, 프로모션 자격은 모두 이전되지 않습니다. 예외적인 경우에는 WeChat 고객 서비스에 문의해 주십시오.
  </Accordion>

  <Accordion title="계정에 아직 잔액이 남아 있는데 — 삭제 후 환불받을 수 있습니까?">
    환불이 필요하시면 계정을 삭제하기 **전에** [환불 정책](/ko/faq/refund-policy)에 따라 환불을 신청해 주십시오. **삭제 후에는 잔액을 복구할 수 없으며 환불 요청도 더 이상 접수되지 않습니다.**
  </Accordion>

  <Accordion title="실수로 '계정 삭제'를 클릭했습니다. 취소할 수 있습니까?">
    확인 대화 상자가 있으므로, "Delete Account" 버튼을 클릭하는 것만으로는 **즉시 삭제되지 않습니다**. 그러나 대화 상자에서 확인하면 작업은 **즉시 적용되며 되돌릴 수 없습니다.** 확인하기 전에 대화 상자를 주의 깊게 읽어 주십시오.
  </Accordion>

  <Accordion title="지금은 그냥 사용하지 않으려는 것뿐입니다 — 삭제 대신 방법이 있습니까?">
    일시적으로 **사용을 중단**하려는 것이라면 삭제는 필요하지 않습니다:

    * 오작동을 방지하려면 "System Tokens" 섹션에서 **API Keys를 비활성화하거나 삭제**할 수 있습니다
    * 잔액은 계정에 그대로 남아 다음에 로그인할 때 사용할 수 있습니다
    * 이렇게 하면 기록과 이력을 보존할 수 있으며, 나중에 다시 등록할 필요가 없습니다
  </Accordion>

  <Accordion title="비밀번호를 잊어버려 로그인할 수 없습니다. 계정을 어떻게 삭제합니까?">
    먼저 [비밀번호를 잊으셨습니까?](/ko/faq/forgot-password)의 절차에 따라 계정을 복구한 다음 삭제를 진행해 주십시오. 접근 권한을 복구할 수 없다면 WeChat 고객 서비스에 문의해 도움을 받으십시오.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="환불 정책" icon="rotate-ccw" href="/ko/faq/refund-policy">
    삭제 전에 환불 규정을 검토하십시오
  </Card>

  <Card title="비밀번호를 잊으셨습니까?" icon="key" href="/ko/faq/forgot-password">
    비밀번호 복구 및 재설정
  </Card>

  <Card title="데이터 보안" icon="shield" href="/ko/faq/data-security">
    APIYI의 데이터 보안 및 개인정보 보호 정책에 대해 알아보십시오
  </Card>

  <Card title="호출 로그" icon="file-text" href="/ko/faq/call-logs">
    삭제 전에 사용 기록을 내보내십시오
  </Card>
</CardGroup>
