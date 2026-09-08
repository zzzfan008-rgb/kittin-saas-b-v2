> ## Documentation Index
> Fetch the complete documentation index at: https://docs.apiyi.com/llms.txt
> Use this file to discover all available pages before exploring further.

# 예상치 못한 API Key 사용을 어떻게 조사합니까?

> API Key에 설명할 수 없는 사용이 보일 때의 명확한 대응 절차입니다. 해당 키가 어디에서 사용되었는지 추적하고, 신속히 비활성화한 뒤, 계정을 강화하며, 로그의 실제 IP로 진짜 호출자를 특정합니다.

## 간단 답변

token(API Key)에 설명되지 않는 사용이 보이면, 가장 안전한 방법은 다음 3단계입니다:

1. **먼저 추적하십시오**: KEY를 복사해서 채팅 기록, 코드 저장소, 설정 파일 전체에서 검색해 누가 받았고 어디에서 사용되는지 확인하십시오.
2. **추적할 수 없으면 비활성화하십시오**: 정말로 사용자를 찾을 수 없다면 해당 token을 그냥 **비활성화**하십시오. 영향은 보통 크지 않습니다.
3. **계정을 강화하십시오**: 계정 비밀번호를 변경하고 콘솔 권한을 더 엄격하게 제한하십시오. 꼭 필요하지 않은 사람은 콘솔에 로그인해서는 안 됩니다.

아래에는 자세한 대응 절차와, 로그의 **실제 요청 IP**를 사용해 실제 호출자를 특정하는 방법을 설명합니다.

## 조사 단계

<Steps>
  <Step title="Step 1: KEY의 행방을 추적합니다">
    토큰의 KEY를 복사하여 다음 항목 전체에서 전역 검색을 실행하고, 누구에게 전달되었는지와 어디에 설정되었는지 확인합니다:

    * **동료 / 계약자 / 고객과의 대화 기록** (WeChat, Lark, 이메일 등)
    * **코드 저장소** 및 커밋 기록 (삭제된 브랜치, `.env`, 설정 파일 포함)
    * 배포 플랫폼, CI/CD, 서드파티 도구에 저장된 **환경 변수 / 비밀값**

    대부분의 출처 불명 사용은 어딘가에 남아 있는 오래된 설정 때문입니다 — KEY를 한 번 검색하면 보통 원인을 찾을 수 있습니다.
  </Step>

  <Step title="Step 2: 추적이 불가능하면 해당 token을 비활성화합니다">
    Step 1을 마친 뒤에도 누가 사용 중인지 알 수 없다면, **해당 token을 비활성화하는 것**이 유출을 멈추는 가장 빠른 방법입니다.

    token은 서로 독립적입니다 — 하나를 비활성화해도 계정 아래의 다른 token에는 **영향을 주지 않으므로**, 보통 영향은 최소입니다. 합법적으로 사용 중인 사람이 없음을 확인한 뒤에는 이를 비활성화하고, 필요하다면 대체 token을 만드십시오.
  </Step>

  <Step title="Step 3: 계정과 권한을 강화합니다">
    손실을 멈추는 동안 계정 보안을 강화합니다:

    * **계정 비밀번호를 강력한 비밀번호로 변경합니다**
    * **콘솔 권한을 강화합니다** — 꼭 필요하지 않은 사람은 콘솔에 로그인하면 안 됩니다
    * 직원은 콘솔에 들어갈 필요 없이 **조회 섹션**에서만 KEY 사용량을 확인하도록 합니다
  </Step>
</Steps>

## 로그를 통해 실제 호출자를 식별하는 방법

콘솔의 **로그** 섹션에서 각 호출의 **token, model, IP**를 확인할 수 있습니다. 로그 항목의 IP에 마우스를 올리면 해당 호출의 IP 세부 정보를 표시합니다:

```text theme={null}
📍 Main IP:
   IP: 104.194.93.159          ← APIYI's traffic-distribution IP (not the caller)

🔁 Proxy IP:
   X-Forwarded-For: 18.163.84.xx
   X-Real-IP:       18.163.84.xx   ← your true request IP (the actual user)
```

<Info>
  **두 IP를 어떻게 읽습니까?**

  * **메인 IP**: APIYI의 **트래픽 분산 IP**입니다. 모든 고객에게 동일하며, 호출의 출처를 나타내지 않습니다.
  * **프록시 IP 아래의 `X-Real-IP`(및 `X-Forwarded-For`)**: 이는 실제로 호출을 수행한 **IP**이며, 즉 실제 사용자의 IP입니다.

  조사할 때는 `X-Real-IP`를 기준으로 하십시오: 장비 / 네트워크와 대조하여 누가 호출하는지 식별하십시오.
</Info>

<Tip>
  **빠르게 확인하려면 token을 교차 확인하십시오**: 로그에는 사용된 **token**과 **model**도 표시됩니다. 먼저 의심스러운 token으로 로그를 필터링한 다음, 그 token의 `X-Real-IP`가 어느 주소들에 몰려 있는지 확인하십시오. 그러면 보통 특정 인물이나 서비스로 바로 이어집니다.
</Tip>

## 자주 묻는 질문

<AccordionGroup>
  <Accordion title="토큰을 비활성화하면 다른 워크로드에 영향을 줍니까?">
    아닙니다. 각 token은 독립적이므로, 하나를 비활성화해도 계정 아래의 다른 token이나 일반 워크로드에는 영향을 주지 않습니다. 해당 token에 정당한 용도가 없는 한, 안전하게 비활성화하고 필요하면 대체 token을 생성할 수 있습니다.
  </Accordion>

  <Accordion title="로그의 메인 IP가 고정되어 있습니다 — 공격받고 있는 것입니까?">
    아닙니다. **Main IP**(예: `104.194.93.159`)는 APIYI의 트래픽 분산 IP로, 모든 호출에서 동일합니다 — 이는 정상입니다. 호출의 출처를 판단하려면 Proxy IP 아래의 `X-Real-IP`를 확인하십시오.
  </Accordion>

  <Accordion title="직원이 KEY 사용량을 확인하려면 콘솔에 로그인해야 합니까?">
    아닙니다. 직원에게는 자가 사용량 확인용으로 **조회 섹션**만 제공하고, 콘솔 관리자 접근 권한은 꼭 필요한 사람에게만 부여하는 것을 권장합니다 — 이렇게 하면 계정과 key 남용의 위험을 근원에서 줄일 수 있습니다.
  </Accordion>

  <Accordion title="처음부터 KEY 남용을 어떻게 막을 수 있습니까?">
    몇 가지 습관이 중요합니다. 코드에 KEY를 하드코딩하지 말고 환경 변수를 사용하십시오. token은 용도별로 분리해 개별적으로 비활성화할 수 있게 하십시오. KEY는 주기적으로 교체하십시오. 그리고 누군가 퇴사하거나 프로젝트가 종료되면 관련 token을 회수하십시오.
  </Accordion>
</AccordionGroup>

## 관련 문서

<CardGroup cols={2}>
  <Card title="Token Management" icon="key" href="/ko/faq/token-management">
    token을 생성, 비활성화, 할당하는 전체 가이드
  </Card>

  <Card title="Call Logs" icon="file-text" href="/ko/faq/call-logs">
    각 호출의 token, 모델 및 IP를 확인하는 방법
  </Card>

  <Card title="Logs & Privacy Control" icon="eye-off" href="/ko/faq/user-logs-control">
    로깅 범위 및 개인정보 보호 설정
  </Card>

  <Card title="Data Security" icon="shield" href="/ko/faq/data-security">
    APIYI의 데이터 보안 및 접근 제어 메커니즘
  </Card>
</CardGroup>

## 문의하기

조사한 후에도 여전히 궁금한 점이 있으면 기술 지원팀에 문의하십시오:

<Card title="기술 지원" icon="headphones">
  * [WeChat Work 지원에 문의](https://work.weixin.qq.com/kfid/kfc9adfd5810ece25ec)
  * 이메일: [hi@apiyi.com](mailto:hi@apiyi.com)
</Card>
